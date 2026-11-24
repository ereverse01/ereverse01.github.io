// 롤링페이퍼 — Apps Script (구글 시트 > 확장 프로그램 > Apps Script 에 붙여넣기)
//
// 1) 새 구글 시트를 만들고 확장 프로그램 > Apps Script 에 이 파일 내용을 그대로 붙여넣고 저장
// 2) 배포 > 새 배포 > 유형: 웹 앱, 실행: 나, 액세스: 모든 사용자 > 배포 (권한 허용)
// 3) 나온 웹 앱 URL(…/exec)을 index.html 의 SHEET_URL 에 넣기
// 4) 코드를 고치면: 배포 > 배포 관리 > 연필(수정) > 버전: 새 버전 > 배포 (URL 은 그대로)
//
// 시트 두 개가 자동으로 생겨요.
// - "판"  : 롤링페이퍼 판 하나 = 한 줄 (판 코드 | 제목 | 배경 | 관리 코드 | 만든 시각)
// - "메모": 메모 하나 = 한 줄 (판 코드 | 메모 id | 이름 | 내용 | 꾸미기(JSON) | 삭제 코드 | 쓴 시각)
// 관리 코드를 아는 사람(판을 만든 사람)은 그 판의 메모를 모두 지울 수 있고,
// 메모를 쓴 사람은 같은 기기에서 자기 메모를 지울 수 있어요.

const BOARD_SHEET = "판";
const NOTE_SHEET = "메모";
const MAX_TEXT = 500;
const MAX_NOTES = 300;

function doGet(e) {
  const p = e.parameter || {};
  if (p.action === "load") return out(load(p.board, p.key));
  return out({ ok: true, app: "rolling-paper" });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: "bad" }); }

  if (b.action === "load") return out(load(b.board, b.key));

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.action === "create") return out(createBoard(b));
    if (b.action === "add") return out(addNote(b));
    if (b.action === "delete") return out(deleteNote(b));
    if (b.action === "editBoard") return out(editBoard(b));
  } finally {
    lock.releaseLock();
  }
  return out({ ok: false, error: "action" });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}
const boards = () => sheet(BOARD_SHEET, ["판 코드", "제목", "배경", "관리 코드", "만든 시각"]);
const notes = () => sheet(NOTE_SHEET, ["판 코드", "메모 id", "이름", "내용", "꾸미기", "삭제 코드", "쓴 시각"]);

function rows(sh) {
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, sh.getLastColumn()).getValues() : [];
}

function code(len) {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

function findBoard(id) {
  id = String(id || "");
  const r = rows(boards());
  const i = r.findIndex(x => String(x[0]) === id);
  return i < 0 ? null : { row: i + 2, id, title: r[i][1], theme: r[i][2], key: String(r[i][3]) };
}

function load(boardId, key) {
  const bd = findBoard(boardId);
  if (!bd) return { ok: false, error: "noboard" };
  const list = rows(notes())
    .filter(r => String(r[0]) === bd.id)
    .map(r => {
      let style = {};
      try { style = JSON.parse(r[4] || "{}"); } catch (e) {}
      return { id: String(r[1]), name: r[2], text: r[3], style, at: r[6] instanceof Date ? r[6].getTime() : r[6] };
    });
  return {
    ok: true,
    board: { id: bd.id, title: bd.title, theme: bd.theme },
    admin: !!key && key === bd.key,
    notes: list,
  };
}

function createBoard(b) {
  const sh = boards();
  let id;
  do { id = code(6); } while (findBoard(id));
  const key = code(10);
  sh.appendRow([id, clip(b.title, 60) || "롤링페이퍼", clip(b.theme, 20), key, new Date()]);
  return { ok: true, board: id, key };
}

function editBoard(b) {
  const bd = findBoard(b.board);
  if (!bd) return { ok: false, error: "noboard" };
  if (!b.key || b.key !== bd.key) return { ok: false, error: "forbidden" };
  const sh = boards();
  if (b.title != null) sh.getRange(bd.row, 2).setValue(clip(b.title, 60) || "롤링페이퍼");
  if (b.theme != null) sh.getRange(bd.row, 3).setValue(clip(b.theme, 20));
  return { ok: true };
}

function addNote(b) {
  const bd = findBoard(b.board);
  if (!bd) return { ok: false, error: "noboard" };
  const text = clip(b.text, MAX_TEXT).trim();
  if (!text) return { ok: false, error: "empty" };
  const sh = notes();
  const count = rows(sh).filter(r => String(r[0]) === bd.id).length;
  if (count >= MAX_NOTES) return { ok: false, error: "full" };
  const id = code(8);
  const del = code(10);
  const style = clip(JSON.stringify(b.style || {}), 400);
  const now = new Date();
  sh.appendRow([bd.id, id, clip(b.name, 20).trim() || "익명", text, style, del, now]);
  return { ok: true, id, del, at: now.getTime() };
}

function deleteNote(b) {
  const bd = findBoard(b.board);
  if (!bd) return { ok: false, error: "noboard" };
  const sh = notes();
  const r = rows(sh);
  const i = r.findIndex(x => String(x[0]) === bd.id && String(x[1]) === String(b.id));
  if (i < 0) return { ok: true };
  const isAdmin = b.key && b.key === bd.key;
  const isOwner = b.del && b.del === String(r[i][5]);
  if (!isAdmin && !isOwner) return { ok: false, error: "forbidden" };
  sh.deleteRow(i + 2);
  return { ok: true };
}
