/**
 * Infographic Presentation — 학생 기록 자동 수집용 Google Apps Script
 *
 * 학생이 입력한 글 기록(학번, 이름, Title, Main Message, Key Information, Organizer, Design Prompt)을
 * 학생이 파일을 내지 않아도 이 스프레드시트의 "Records" 시트에 자동으로 모읍니다. (무료, 학생 로그인 불필요)
 * 학생이 STEP 4에서 올린 그래픽 이미지는 내 Google Drive의 "Infographic 그래픽" 폴더에 저장되고,
 * "Graphics" 시트에 목록이 남습니다. 교사 화면의 [반별 그래픽 열람]에서 반별로 볼 수 있습니다.
 * 교사 화면 [발표 평가 · 생기부]에서 불러온 명렬은 "Roster" 시트에, 상/중/하·서술 평가·생기부 문구는
 * "Evaluations" 시트에 저장됩니다. (시트에서 직접 고쳐도 됩니다)
 * 생기부 문구 자동 작성은 Claude API 를 씁니다(유료, 학생 1명당 몇십 원 수준). 쓰려면 아래 [생기부 AI 설정]을 하세요.
 * 설정하지 않아도 [요청문 복사]로 ChatGPT·Claude 등에 직접 붙여넣어 쓸 수 있습니다.
 * 녹음·영상 파일은 여기로 오지 않습니다. 그것들은 학생이 내는 제출 ZIP으로 받습니다.
 *
 * [설치 방법 — 교사가 한 번만]
 * 1. Google 스프레드시트를 새로 만든다.
 * 2. 메뉴 [확장 프로그램] → [Apps Script]를 연다.
 * 3. 편집기에 있던 내용을 지우고 이 파일 전체를 붙여넣는다.
 * 4. 아래 TEACHER_KEY 를 나만 아는 문자열로 바꾼다. (교사 화면에서 기록을 불러올 때 입력)
 * 5. 위쪽 함수 목록에서 setup 을 고르고 [실행] → 권한 승인. (Drive에 그래픽 폴더를 만든다)
 * 6. [배포] → [새 배포] → 유형 "웹 앱" → 실행: "나" / 액세스 권한: "모든 사용자" → [배포].
 * 7. 표시된 "웹 앱 URL"(https://script.google.com/macros/s/…/exec)을 복사해
 *    index.html 의 SHEET_URL = '' 따옴표 안에 붙여넣는다.
 *
 * [생기부 AI 설정 — 선택]
 * 1. https://console.anthropic.com 에서 API 키를 만든다.
 * 2. Apps Script 왼쪽 톱니바퀴 [프로젝트 설정] → 맨 아래 [스크립트 속성] → [스크립트 속성 추가]
 *    속성: ANTHROPIC_API_KEY / 값: 발급받은 키  → [스크립트 속성 저장]
 *    (키는 코드에 적지 마세요. 학생 이름은 AI 로 보내지 않습니다.)
 *
 * 이 코드를 고친 뒤에는 [배포] → [배포 관리] → 수정(연필) → 버전 "새 버전" → [배포]를 해야 반영됩니다.
 */

const TEACHER_KEY = '여기에_교사용_키를_정하세요';

const HEAD = ['학번', '이름', 'Title', 'Main Message', 'Key Information', 'Graphic Organizer', 'Graphic Design Prompt',
  'Presentation Script', '그래픽 업로드', '발표 녹음', '제출 여부', '제출 시간', '마지막 저장 시간', 'data'];
const SCRIPT_COL = 8;   // 'Presentation Script' 열 (예전 시트에는 없어서 자동으로 끼워 넣는다)
const HEAD_G = ['학번', '이름', '파일 ID', '업로드 시간', '파일 링크'];
const HEAD_E = ['학번', '이름', '상중하', '서술 평가', '생기부 문구', '프롬프트·이미지 분석', '평가 시간'];
const HEAD_R = ['학번', '학년', '반', '번호', '성명'];
const AI_MODEL = 'claude-opus-5-5';
const FOLDER_NAME = 'Infographic 그래픽';

// 처음 한 번 편집기에서 실행: Drive 권한 승인 + 그래픽 폴더 만들기
function setup() {
  Logger.log('그래픽 폴더: ' + folder_().getUrl());
  gSheet_();
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const teacher = TEACHER_KEY.indexOf('여기에') !== 0 && req.key === TEACHER_KEY;

    if (req.action === 'list') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const sh = sheet_();
      const rows = sh.getLastRow() > 1 ? sh.getRange(2, HEAD.length, sh.getLastRow() - 1, 1).getValues() : [];
      const records = [];
      rows.forEach(function (r) { try { records.push(JSON.parse(r[0])); } catch (err) {} });
      return out_({ ok: true, records: records });
    }

    if (req.action === 'save') {
      const d = req.data || {};
      const id = String(d.studentId || '').trim(), name = String(d.name || '').trim();
      const json = JSON.stringify(d);
      if (!id || !name || json.length > 40000) return out_({ ok: false, error: 'data' });
      const row = [id, name, d.title || '', d.mainMessage || '',
        (d.keyInformation || []).map(function (k, i) { return (i + 1) + '. ' + k; }).join('\n'),
        d.organizer || '', d.designPrompt || '', d.presentationScript || '', d.hasGraphic ? 'O' : '', d.hasAudio ? 'O' : '',
        d.submittedAt ? '제출' : '미제출', time_(d.submittedAt), time_(d.savedAt), json];
      return locked_(function () {
        const sh = sheet_();
        const at = findRow_(sh, id) || sh.getLastRow() + 1;   // 같은 학번이 있으면 그 줄을 고친다
        sh.getRange(at, 1, 1, HEAD.length).setNumberFormat('@').setValues([row]);
        return out_({ ok: true });
      });
    }

    // 학생 그래픽 업로드: 파일은 잠금 밖에서 만들고, 목록 시트만 잠금 안에서 고친다
    if (req.action === 'image') {
      const id = String(req.studentId || '').trim(), name = String(req.name || '').trim();
      const b64 = String(req.data || '');
      if (!id || !name || !b64 || b64.length > 20000000) return out_({ ok: false, error: 'data' });
      const png = req.mime === 'image/png';
      const folder = locked_(folder_);
      const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(b64), png ? 'image/png' : 'image/jpeg',
        id + '_' + name + (png ? '.png' : '.jpg')));
      return locked_(function () {
        const sh = gSheet_();
        let at = findRow_(sh, id);
        if (at) {
          const old = String(sh.getRange(at, 3).getValue());   // 예전 그래픽은 휴지통으로
          if (old) try { DriveApp.getFileById(old).setTrashed(true); } catch (err) {}
        } else at = sh.getLastRow() + 1;
        sh.getRange(at, 1, 1, HEAD_G.length).setNumberFormat('@')
          .setValues([[id, name, file.getId(), time_(new Date().toISOString()), file.getUrl()]]);
        return out_({ ok: true });
      });
    }

    // 교사: 그래픽 목록
    if (req.action === 'images') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const sh = gSheet_();
      const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
      return out_({ ok: true, images: rows.filter(function (r) { return r[2]; }).map(function (r) {
        return { studentId: String(r[0]), name: String(r[1]), fileId: String(r[2]), at: String(r[3]) };
      }) });
    }

    // 교사: 그래픽 한 장 (목록에 있는 파일만)
    if (req.action === 'img') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const sh = gSheet_();
      const ids = sh.getLastRow() > 1 ? sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues() : [];
      if (!ids.some(function (r) { return String(r[0]) === req.fileId; })) return out_({ ok: false, error: 'file' });
      const blob = DriveApp.getFileById(req.fileId).getBlob();
      return out_({ ok: true, mime: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) });
    }

    // 교사: 발표 평가 목록
    if (req.action === 'evals') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const sh = eSheet_();
      const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_E.length).getDisplayValues() : [];
      return out_({ ok: true, evals: rows.filter(function (r) { return String(r[0]).trim(); }).map(function (r) {
        return { studentId: String(r[0]).trim(), name: r[1], level: r[2], note: r[3], seteuk: r[4], analysis: r[5], at: r[6] };
      }) });
    }

    // 교사: 발표 평가 저장 (같은 학번이 있으면 그 줄을 고친다)
    if (req.action === 'evalSave') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const ev = req.eval || {};
      const id = String(ev.studentId || '').trim();
      const cut = function (v, n) { return String(v || '').slice(0, n); };
      if (!id) return out_({ ok: false, error: 'data' });
      return locked_(function () {
        const sh = eSheet_();
        const at = findRow_(sh, id) || sh.getLastRow() + 1;
        const at_ = time_(new Date().toISOString());
        sh.getRange(at, 1, 1, HEAD_E.length).setNumberFormat('@')
          .setValues([[id, String(ev.name || '').trim(), cut(ev.level, 10), cut(ev.note, 20000), cut(ev.seteuk, 20000), cut(ev.analysis, 20000), at_]]);
        return out_({ ok: true, at: at_ });
      });
    }

    // 교사: 명렬
    if (req.action === 'roster') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const sh = rSheet_();
      const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_R.length).getDisplayValues() : [];
      return out_({ ok: true, roster: rows.filter(function (r) { return String(r[0]).trim(); }).map(function (r) {
        return { studentId: String(r[0]).trim(), grade: r[1], cls: r[2], num: r[3], name: r[4] };
      }) });
    }

    // 교사: 명렬 저장 (통째로 바꾼다)
    if (req.action === 'rosterSave') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const list = (req.students || []).slice(0, 3000).map(function (s) {
        return [String(s.studentId || '').trim(), String(s.grade || ''), String(s.cls || ''), String(s.num || ''), String(s.name || '').trim()];
      }).filter(function (r) { return r[0] && r[4]; });
      return locked_(function () {
        const sh = rSheet_();
        if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HEAD_R.length).clearContent();
        if (list.length) sh.getRange(2, 1, list.length, HEAD_R.length).setNumberFormat('@').setValues(list);
        return out_({ ok: true, count: list.length });
      });
    }

    // 교사: 생기부 문구 만들기 (dry 이면 AI 에 보낼 요청문만 돌려준다)
    if (req.action === 'seteuk') {
      if (!teacher) return out_({ ok: false, error: 'key' });
      const id = String(req.studentId || '').trim();
      const d = record_(id);
      if (!d) return out_({ ok: false, error: 'norecord' });
      const img = req.dry ? null : image_(id);
      const prompt = seteukPrompt_(d, req, req.dry || !!img);
      if (req.dry) return out_({ ok: true, prompt: prompt });
      const r = claude_(prompt, img);
      return out_({ ok: true, seteuk: String(r.seteuk || '').trim(), analysis: String(r.analysis || '').trim(), withImage: !!img });
    }

    return out_({ ok: false, error: 'action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

function locked_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function findRow_(sh, id) {
  if (sh.getLastRow() < 2) return 0;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]).trim() === id) return i + 2;
  return 0;
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Records');
  if (!sh) sh = ss.insertSheet('Records');
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.hideColumns(HEAD.length);   // 마지막 'data' 열은 교사 화면이 읽는 원본이라 숨겨 둔다
  } else if (sh.getRange(1, SCRIPT_COL).getValue() !== HEAD[SCRIPT_COL - 1]) {
    sh.insertColumnBefore(SCRIPT_COL);   // 예전 시트: 대본 열을 끼워 넣으면 'data' 열은 맨 끝으로 밀린다
    sh.getRange(1, SCRIPT_COL).setValue(HEAD[SCRIPT_COL - 1]).setFontWeight('bold');
  }
  return sh;
}

function gSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Graphics');
  if (!sh) sh = ss.insertSheet('Graphics');
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEAD_G.length).setValues([HEAD_G]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function eSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Evaluations');
  if (!sh) sh = ss.insertSheet('Evaluations');
  if (sh.getRange(1, 1, 1, HEAD_E.length).getValues()[0].join('|') !== HEAD_E.join('|')) {
    sh.getRange(1, 1, 1, HEAD_E.length).setValues([HEAD_E]).setFontWeight('bold');   // 새 시트 또는 예전 머리글
    sh.setFrozenRows(1);
  }
  return sh;
}

function rSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Roster');
  if (!sh) sh = ss.insertSheet('Roster');
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEAD_R.length).setValues([HEAD_R]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// 학생 글 기록 (Records 시트의 숨긴 'data' 열)
function record_(id) {
  const sh = sheet_(), at = findRow_(sh, id);
  if (!at) return null;
  try { return JSON.parse(sh.getRange(at, HEAD.length).getValue()); } catch (err) { return null; }
}

// 학생 최종 그래픽 (없거나 너무 크면 null)
function image_(id) {
  const sh = gSheet_(), at = findRow_(sh, id);
  if (!at) return null;
  try {
    const blob = DriveApp.getFileById(String(sh.getRange(at, 3).getValue())).getBlob();
    const bytes = blob.getBytes();
    if (bytes.length > 4500000) return null;
    const mime = blob.getContentType() === 'image/png' ? 'image/png' : 'image/jpeg';
    return { mime: mime, data: Utilities.base64Encode(bytes) };
  } catch (err) { return null; }
}

// AI 에게 보내는 요청문 (학생 이름은 넣지 않는다)
function seteukPrompt_(d, req, withImage) {
  const level = ['상', '중', '하'].indexOf(req.level) >= 0 ? req.level : '';
  const len = Math.min(Math.max(Number(req.length) || 300, 100), 1000);
  const topic = String(d.title || d.mainMessage || '').trim();
  const keys = (d.keyInformation || []).map(function (k, i) { return '  ' + (i + 1) + '. ' + k; }).join('\n');
  return [
    '당신은 한국 고등학교 영어 교사가 학교생활기록부 「과목별 세부능력 및 특기사항」을 쓰도록 돕습니다.',
    '아래는 한 학생의 영어 인포그래픽 발표 수행평가 기록입니다.' +
      (withImage ? ' 함께 첨부한 이미지는 학생이 아래 Graphic Design Prompt 로 AI 이미지 도구를 써서 만든 최종 인포그래픽입니다.'
                 : ' (최종 인포그래픽 이미지는 없습니다. 프롬프트와 기록만으로 판단하세요.)'),
    '',
    '[학생 기록]',
    '- 주제(Title): ' + (topic || '(없음)'),
    '- Main Message: ' + (d.mainMessage || '(없음)'),
    '- Key Information:\n' + (keys || '  (없음)'),
    '- 선택한 Graphic Organizer(정보 조직 방식): ' + (d.organizer || '(없음)'),
    '- Graphic Design Prompt(이미지를 만들려고 학생이 쓴 프롬프트):\n' + (d.designPrompt || '(없음)'),
    '- 영어 발표 대본:\n' + (d.presentationScript || '(없음)'),
    '',
    '[교사의 발표 평가]',
    '- 수준: ' + (level || '(입력 안 함)'),
    '- 서술 평가: ' + (String(req.note || '').trim() || '(입력 안 함)'),
    '',
    '[할 일]',
    '1. analysis (교사 참고용, 한국어 4~6문장):',
    '   프롬프트가 레이아웃·색·글자·도형·정보 배치 등을 얼마나 구체적이고 정교하게 지시했는지,',
    '   ' + (withImage ? '최종 이미지가 그 지시와 주제·핵심 정보를 얼마나 정확히 구현했는지(일치하는 점과 어긋난 점),' : '그 프롬프트로 의도한 그래픽을 얻기에 충분했을지,'),
    '   선택한 Graphic Organizer 가 정보의 성격에 맞고 실제로 잘 드러나는지 분석하세요.',
    '   마지막 문장은 "프롬프트 정교성: 상/중/하 중 하나" 형식으로 끝내세요.',
    '2. seteuk (생기부 문구):',
    '   - 반드시 \'' + (topic || '주제') + '\'을(를) 주제로 인포그래픽을 제작하고 발표함. 으로 시작하세요. 을/를은 앞말에 맞게 하나만 고르세요.',
    '   - 그 뒤는 이 학생에게만 해당하는 내용으로: 정보를 조직한 방식(Graphic Organizer 선택과 구성), 프롬프트를 구체화해 의도한 이미지를 이끌어 낸 과정과 정교성, 핵심 정보 전달, 영어 발표 모습을 위 분석과 교사 평가에 근거해 쓰세요.',
    '   - 교사의 서술 평가 내용은 반드시 반영하세요. 수준에 맞게 강도를 조절하세요(상: 구체적 강점과 역량을 분명히 / 중: 잘한 점 중심에 성장 가능성 / 하: 참여와 노력, 나아진 점 중심). 어느 경우든 부정적 표현은 쓰지 마세요.',
    '   - 문체는 \'~함\', \'~임\', \'~보임\', \'~돋보임\' 같은 명사형 종결. 학생 이름이나 \'학생은\' 같은 주어는 쓰지 마세요.',
    '   - 기록에 없는 사실(점수, 수상, 다른 활동)을 지어내거나 과장하지 마세요.',
    '   - 한 문단, 공백 포함 약 ' + len + '자(±10%). 영어는 주제 외에는 꼭 필요할 때만 쓰세요.',
    '',
    '다른 말 없이 JSON 으로만 답하세요: {"analysis": "...", "seteuk": "..."}'
  ].join('\n');
}

// Claude API 호출 (키는 스크립트 속성 ANTHROPIC_API_KEY)
function claude_(prompt, img) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('nokey');
  const content = [];
  if (img) content.push({ type: 'image', source: { type: 'base64', media_type: img.mime, data: img.data } });
  content.push({ type: 'text', text: prompt });
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01' },
    payload: JSON.stringify({
      model: AI_MODEL, max_tokens: 16000,
      fallbacks: 'default',   // 안전 필터에 걸리면 다른 모델로 다시 시도
      output_config: { effort: 'low', format: { type: 'json_schema', schema: {
        type: 'object', additionalProperties: false, required: ['analysis', 'seteuk'],
        properties: { analysis: { type: 'string' }, seteuk: { type: 'string' } } } } },
      messages: [{ role: 'user', content: content }]
    })
  });
  const j = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error('AI 오류 ' + res.getResponseCode() + ': ' + (j.error && j.error.message || ''));
  if (j.stop_reason === 'refusal') throw new Error('AI 가 이 요청을 처리하지 않았습니다');
  const text = (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
  return JSON.parse(text);
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const fid = props.getProperty('FOLDER_ID');
  if (fid) try { const f = DriveApp.getFolderById(fid); if (!f.isTrashed()) return f; } catch (err) {}
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function time_(iso) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
