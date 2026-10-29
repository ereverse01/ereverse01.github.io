/**
 * 낱말 조각 공방 — 문제 저장 + 학생 명단 (Google Apps Script)
 *
 * 새 구글 시트 → [확장 프로그램 → Apps Script]에 이 코드를 붙여 넣는다.
 * 시트에 '문제' 탭과 '결과' 탭이 자동으로 만들어진다.
 *
 * - GET  ?action=list          : 저장한 문제 목록 (누구나)
 * - GET  ?action=set&id=...    : 문제 하나 (학생 게임이 읽어 감)
 * - GET  ?action=village       : 반별 마을 (반마다 기관 목록, 누구나)
 * - POST {action:'result'}     : 학생이 다 끝내면 이름·점수 한 줄 추가 + 반 마을에 기관 하나 (비밀번호 없음)
 *                                문제 data에 world가 있으면 그 섬의 생물 하나 (dino 공룡 · sea 해양생물 · mon 몬스터 · room 가구 · car 탈것)
 *                                world가 tower면 반 협동 빌딩에 'tower:층수' (실수 적고 빠를수록 많이)
 * - POST {action:'save'}       : 문제 저장 (교사 비밀번호)
 * - POST {action:'delete'}     : 문제 삭제 (교사 비밀번호)
 * - POST {action:'resetVillage'}: 마을 초기화 (교사 비밀번호, cls 비우면 전체 반)
 * - POST {action:'results'}    : 문제별 명단 보기 (교사 비밀번호)
 *
 * 교사 비밀번호는 코드에 적지 않는다.
 * [프로젝트 설정 → 스크립트 속성]에 TEACHER_PASSWORD 로 넣는다.
 *
 * 배포: [배포 → 새 배포 → 웹 앱]
 *   - 다음 사용자 인증 정보로 실행: 나
 *   - 액세스 권한이 있는 사용자: 모든 사용자
 */

const SETS = '문제';
const SETS_HEADER = ['id', 'title', 'data', 'updated'];
const RESULTS = '결과';
const RESULTS_HEADER = ['time', 'setId', 'setTitle', 'name', 'miss', 'stars', 'seconds', 'words', 'class', 'sid', 'building', 'archived'];

// 기관: 키 → 뽑힐 가중치 (보통 10 · 희귀 4 · 전설 1). app.js의 BUILDINGS와 키를 맞춘다.
const BUILDINGS = {
  hospital: 10, school: 10, fire: 10, police: 10, library: 10, post: 10, bank: 10, cafe: 10, bakery: 10, market: 10,
  park: 10, station: 10, cityhall: 10, museum: 10, theater: 10, stadium: 10, pool: 10, flowershop: 10, windmill: 10,
  pcroom: 10, convenience: 10, pharmacy: 10, bookstore: 10, cinema: 10, karaoke: 10, gym: 10, bunsik: 10,
  chicken: 10, icecream: 10, laundry: 10, hairshop: 10, apartment: 10, hotel: 10, gas: 10, bus: 10,
  playground: 10, farm: 10, arcade: 10, toystore: 10, vet: 10, camp: 10, court: 10,
  dentist: 10, academy: 10, kindergarten: 10, burger: 10, pizza: 10, ramen: 10, donut: 10, bubbletea: 10,
  fruit: 10, fishmarket: 10, bowling: 10, tennis: 10, soccer: 10, skate: 10, baseball: 10, photo: 10,
  clothes: 10, shoes: 10, glasses: 10, music: 10, artshop: 10, parking: 10, carwash: 10, subway: 10,
  bike: 10, recycling: 10, solar: 10, windpower: 10, greenhouse: 10, orchard: 10, beehive: 10, broadcast: 10,
  hanok: 4, tower: 4, ferris: 4, lighthouse: 4, observatory: 4,
  cheomseongdae: 4, zoo: 4, aquarium: 4, coaster: 4, pyramid: 4, balloon: 4,
  airport: 4, port: 4, waterpark: 4, circus: 4, skyscraper: 4, igloo: 4, treehouse: 4, dino: 4, cablecar: 4,
  castle: 1, bulguksa: 1, rocket: 1, geobukseon: 1, liberty: 1, ufo: 1
};
// 섬마다 나오는 생물 (교사가 문제마다 '다 끝내면 생기는 것'을 고른다). app.js의 CREATURES와 키를 맞춘다.
const DINOS = {
  d_trex: 1, d_spino: 1, d_brachio: 4, d_diplo: 10, d_apato: 10, d_bugyeong: 4, d_trice: 10, d_styraco: 10, d_proto: 10, d_korea: 4,
  d_stego: 10, d_kentro: 10, d_ankylo: 10, d_parasaur: 10, d_corytho: 10, d_lambeo: 10, d_maia: 10, d_iguano: 10, d_pachy: 10, d_raptor: 10,
  d_dilo: 10, d_carno: 10, d_allo: 10, d_giga: 4, d_therizino: 4, d_galli: 10, d_compy: 10, d_ovi: 10, d_archae: 4, d_ptera: 4,
  d_quetzal: 4, d_mosa: 4, d_plesio: 10
};
const SEAS = {
  s_turtle: 10, s_dolphin: 10, s_orca: 4, s_humpback: 4, s_bluewhale: 1, s_beluga: 10, s_narwhal: 4, s_whaleshark: 1, s_shark: 10, s_hammer: 4,
  s_manta: 10, s_octopus: 10, s_squid: 4, s_jelly: 10, s_seahorse: 10, s_starfish: 10, s_crab: 10, s_lobster: 10, s_hermit: 10, s_urchin: 10,
  s_clown: 10, s_bluetang: 10, s_marlin: 4, s_puffer: 10, s_angler: 4, s_sunfish: 4, s_moray: 10, s_nautilus: 4, s_seal: 10, s_otter: 10,
  s_penguin: 10
};
const MONS = {
  m_flamefox: 10, m_lavamole: 10, m_emberchick: 10, m_droplet: 10, m_snail: 10, m_otterpup: 10, m_sproutbun: 10, m_mossturtle: 10, m_petalfly: 10, m_zaphog: 10,
  m_boltsheep: 10, m_glowbug: 10, m_snowpeng: 10, m_frostfox: 4, m_icedeer: 4, m_pebble: 10, m_crystal: 4, m_cloudbird: 10, m_starbun: 4, m_dreamy: 10,
  m_fairy: 4, m_ghost: 10, m_shadowcat: 10, m_gearbot: 10, m_mushroom: 10, m_cactus: 10, m_bubblefish: 10, m_thundertiger: 4, m_rainbowdragon: 1, m_sunlion: 1,
  m_moonwhale: 1
};
const ROOMS = {
  f_bed: 10, f_bunk: 10, f_canopy: 1, f_desk: 10, f_computer: 10, f_chair: 10, f_rocking: 10, f_gaming: 4, f_massage: 4, f_throne: 1,
  f_sofa: 10, f_beanbag: 10, f_shelf: 10, f_wardrobe: 10, f_lamp: 10, f_tv: 10, f_console: 10, f_piano: 4, f_guitar: 10, f_drums: 4,
  f_plant: 10, f_clock: 10, f_mirror: 10, f_bear: 10, f_tank: 10, f_fridge: 10, f_fan: 10, f_globe: 10, f_telescope: 4, f_arcade: 4,
  f_chest: 1
};
const CARS = {
  v_sedan: 10, v_taxi: 10, v_police: 10, v_suv: 10, v_sport: 4, v_super: 1, v_monster: 1, v_ambulance: 10, v_camper: 10, v_bus: 10,
  v_schoolbus: 10, v_double: 4, v_truck: 10, v_fire: 10, v_dump: 10, v_mixer: 10, v_crane: 4, v_excavator: 10, v_dozer: 10, v_forklift: 10,
  v_tractor: 10, v_moto: 10, v_scooter: 10, v_bike: 10, v_train: 10, v_bullet: 4, v_plane: 4, v_heli: 4, v_boat: 10, v_sub: 4,
  v_shuttle: 1
};
const POOLS = { main: BUILDINGS, dino: DINOS, sea: SEAS, mon: MONS, room: ROOMS, car: CARS };
// 협동 빌딩(tower): 참여 1층 + 정확 0~4층 + 속도 0~3층. app.js의 towerFloors와 같은 계산
function floors_(miss, seconds, words) {
  const n = Math.max(1, Number(words) || 1), r = (Number(miss) || 0) / n, per = (Number(seconds) || 0) / n;
  const acc = r === 0 ? 4 : r <= 0.15 ? 3 : r <= 0.3 ? 2 : r <= 0.5 ? 1 : 0;
  const speed = per <= 20 ? 3 : per <= 30 ? 2 : per <= 45 ? 1 : 0;
  return 1 + acc + speed;
}
function worldOfSet_(s) {
  try { const w = JSON.parse(s.data).world; return POOLS[w] || w === 'tower' ? w : 'main'; } catch (err) { return 'main'; }
}

function tab_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < header.length) {
    sh.getRange(1, 1, 1, header.length).setValues([header]); // 예전 시트에 새 열 이름 추가
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 시트가 글을 수식·숫자·날짜로 바꾸지 않도록 앞에 보이지 않는 문자(ZWSP)를 붙여 저장하고, 읽을 때 뗀다.
const ZW = '​';
function safe_(s) { return ZW + String(s == null ? '' : s); }
function plain_(v) { return String(v).replace(/^​/, ''); }
function clean_(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }

function sets_() {
  return tab_(SETS, SETS_HEADER).getDataRange().getValues().slice(1)
    .filter(function (r) { return r[0]; })
    .map(function (r) { return { id: String(r[0]), title: plain_(r[1]), data: plain_(r[2]), updated: String(r[3]) }; });
}

function results_() {
  return tab_(RESULTS, RESULTS_HEADER).getDataRange().getValues().slice(1)
    .filter(function (r) { return r[1]; })
    .map(function (r) {
      return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), setId: String(r[1]), name: plain_(r[3]),
        miss: Number(r[4]) || 0, stars: Number(r[5]) || 0, seconds: Number(r[6]) || 0,
        cls: cls_(r[8]), sid: plain_(r[9] || ''), building: String(r[10] || '') };
    });
}

// "20315 김민지" → { sid: "20315", cls: "2-3" }
function parseSid_(name) {
  const m = String(name).match(/^\s*(\d)(\d{2})(\d{2})\s*(.+)$/);
  if (!m || Number(m[2]) < 1) return null;
  return { sid: m[1] + m[2] + m[3], cls: Number(m[1]) + '-' + Number(m[2]) };
}
// 시트가 "2-3"을 날짜(2월 3일)로 바꿔 저장한 옛 기록도 "2-3"으로 되돌린다.
function cls_(v) {
  if (v instanceof Date) return (v.getMonth() + 1) + '-' + v.getDate();
  return String(v || '');
}
function shortName_(name) { return String(name).replace(/^\s*\d{5}\s*/, '') || String(name); }

// 이 반에서 가장 적게 나온 기관(처음엔 아직 없는 기관) 중에서 가중치대로 하나 뽑는다 — 반 친구끼리 겹치지 않게.
// pool: 본섬 기관(BUILDINGS) 또는 섬 생물(DINOS·SEAS·MONS)
function pickBuilding_(have, pool) {
  pool = pool || BUILDINGS;
  const count = {};
  Object.keys(pool).forEach(function (k) { count[k] = 0; });
  have.forEach(function (k) { if (k in count) count[k]++; });
  const min = Math.min.apply(null, Object.keys(count).map(function (k) { return count[k]; }));
  const keys = Object.keys(pool).filter(function (k) { return count[k] === min; });
  const total = keys.reduce(function (a, k) { return a + pool[k]; }, 0);
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i++) { r -= pool[keys[i]]; if (r < 0) return keys[i]; }
  return keys[0];
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'set') {
      const s = sets_().filter(function (x) { return x.id === String(p.id); })[0];
      if (!s) return json_({ ok: false, error: '문제를 찾지 못했어요. 선생님께 링크를 다시 받아 주세요.' });
      return json_({ ok: true, set: s });
    }
    if (p.action === 'village') {
      const classes = {};
      results_().forEach(function (r) {
        if (!r.cls || !r.building) return;
        (classes[r.cls] = classes[r.cls] || []).push({ name: shortName_(r.name), building: r.building, setId: r.setId, time: r.time });
      });
      return json_({ ok: true, classes: classes });
    }
    // 목록: 단어 수와 제출 인원만 (명단 자체는 비밀번호 필요)
    const counts = {};
    results_().forEach(function (r) { counts[r.setId] = (counts[r.setId] || 0) + 1; });
    const list = sets_().map(function (s) {
      let words = 0;
      try { words = JSON.parse(s.data).items.length; } catch (err) {}
      return { id: s.id, title: s.title, updated: s.updated, words: words, done: counts[s.id] || 0 };
    }).reverse();
    return json_({ ok: true, sets: list });
  } catch (err) {
    return json_({ ok: false, error: '오류: ' + err.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const req = JSON.parse(e.postData.contents);

    // 학생 결과: 비밀번호 없이 한 줄 추가
    if (req.action === 'result') {
      const s = sets_().filter(function (x) { return x.id === String(req.id); })[0];
      if (!s) return json_({ ok: false, error: '문제를 찾지 못했어요.' });
      const name = clean_(req.name, 30);
      if (!name) return json_({ ok: false, error: '이름이 없어요.' });
      // 학번 5자리(학년 1 + 반 2 + 번호 2)에서 반을 알아낸다. 같은 학생·같은 문제는 기관 하나만.
      const id = parseSid_(name);
      const all = results_();
      const key = id ? id.sid : name;
      const prev = all.filter(function (r) { return r.setId === s.id && r.building && (r.sid || r.name) === key; })[0];
      let building = '';
      const world = worldOfSet_(s);
      if (id && !prev && world === 'tower') building = 'tower:' + floors_(req.miss, req.seconds, req.words);
      else if (id && !prev) building = pickBuilding_(all.filter(function (r) { return r.cls === id.cls && r.building; }).map(function (r) { return r.building; }), POOLS[world]);
      tab_(RESULTS, RESULTS_HEADER).appendRow([new Date(), s.id, safe_(s.title), safe_(name),
        Math.max(0, Math.min(999, Number(req.miss) || 0)), Math.max(0, Math.min(3, Number(req.stars) || 0)),
        Math.max(0, Math.min(86400, Number(req.seconds) || 0)), Math.max(0, Math.min(50, Number(req.words) || 0)),
        id ? "'" + id.cls : '', id ? safe_(id.sid) : '', building]);
      return json_({ ok: true, building: prev ? prev.building : building, dup: !!prev, cls: id ? id.cls : '' });
    }

    const pw = PropertiesService.getScriptProperties().getProperty('TEACHER_PASSWORD');
    if (!pw) return json_({ ok: false, error: '스크립트 속성에 TEACHER_PASSWORD가 없어요.' });
    if (req.password !== pw) return json_({ ok: false, error: '교사 비밀번호가 틀렸어요.' });

    const sh = tab_(SETS, SETS_HEADER);
    const ids = sh.getDataRange().getValues().map(function (r) { return String(r[0]); });
    const rowOf = function (id) { const i = ids.indexOf(String(id)); return i > 0 ? i + 1 : -1; };

    if (req.action === 'save') {
      JSON.parse(req.data); // 형식 확인
      const id = req.id && rowOf(req.id) > 0 ? String(req.id) : 'w' + Utilities.getUuid().slice(0, 8);
      const row = [id, safe_(clean_(req.title, 200)), safe_(req.data), new Date().toISOString()];
      const r = rowOf(id);
      if (r > 0) sh.getRange(r, 1, 1, row.length).setValues([row]);
      else sh.appendRow(row);
      return json_({ ok: true, id: id });
    }

    if (req.action === 'delete') {
      const r = rowOf(req.id);
      if (r > 0) sh.deleteRow(r);
      return json_({ ok: true });
    }

    // 마을 초기화: building 칸을 archived 칸으로 옮긴다 (기록은 남고 마을에서만 빠짐)
    if (req.action === 'resetVillage') {
      const rs = tab_(RESULTS, RESULTS_HEADER);
      const vals = rs.getDataRange().getValues();
      const cls = String(req.cls || '');
      let n = 0;
      for (let i = 1; i < vals.length; i++) {
        if (!vals[i][10] || (cls && cls_(vals[i][8]) !== cls)) continue;
        const old = vals[i][11] ? String(vals[i][11]) + ',' : '';
        rs.getRange(i + 1, 11, 1, 2).setValues([['', old + vals[i][10]]]);
        n++;
      }
      return json_({ ok: true, cleared: n });
    }

    if (req.action === 'results') {
      const list = results_().filter(function (r) { return r.setId === String(req.id); });
      return json_({ ok: true, results: list });
    }

    return json_({ ok: false, error: '알 수 없는 요청이에요.' });
  } catch (err) {
    return json_({ ok: false, error: '오류: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}
