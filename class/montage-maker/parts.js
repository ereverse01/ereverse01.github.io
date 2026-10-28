// 몽타주 — 카테고리(문장 틀 + 표현)와 캐릭터 그리기
// frame: [빈칸 앞, 빈칸 뒤]  {S} = He/She, {P} = His/Her
// color: true → "a red hoodie" 처럼 색깔 말을 넣을 수 있음 (noun: 표현, plural: a/an 없이 씀)
// multi: true → 여러 문장을 추가할 수 있음

const CLOTH_COLORS = {
  red: "#E0453A", orange: "#F08A24", yellow: "#F5C629", green: "#3FA34D", blue: "#3B73D1",
  navy: "#2B3A67", purple: "#8A4FC7", pink: "#F27FB2", brown: "#8B5A2B", gray: "#9097A0",
  black: "#2E2E33", white: "#FAFAFA",
};

const HAIR_COLORS = {
  black: "#2A2422", brown: "#6B4226", blond: "#E8C468", red: "#B8452A",
  gray: "#A7A7A7", white: "#EFEFEF", pink: "#F48FB1", blue: "#5C8DE0",
};

const SKINS = { fair: "#FCE5D4", light: "#F3CDA9", tan: "#DDA57E", brown: "#A96E48", dark: "#6F4631" };

const GROUPS = [
  { id: "face", ko: "얼굴", icon: "🙂", cats: ["skin", "face", "eyes", "brows", "nose", "mouth", "features"] },
  { id: "hair", ko: "머리", icon: "💇", cats: ["hair", "hairColor"] },
  { id: "body", ko: "키·몸무게", icon: "📏", cats: ["height", "build"] },
  { id: "clothes", ko: "옷차림", icon: "👕", cats: ["top", "bottom", "shoes"] },
  { id: "acc", ko: "장신구", icon: "🕶️", cats: ["acc"] },
];

const CATS = {
  skin: { ko: "피부색", frame: ["{S} has", "skin."], view: "head",
    opts: [["fair", "아주 밝은"], ["light", "밝은"], ["tan", "그을린"], ["brown", "갈색"], ["dark", "어두운"]] },
  face: { ko: "얼굴형", frame: ["{S} has", "face."], view: "head",
    opts: [["a round", "동그란"], ["an oval", "달걀형"], ["a square", "각진"], ["a heart-shaped", "하트형(턱이 뾰족한)"]] },
  eyes: { ko: "눈", frame: ["{S} has", "eyes."], view: "eyes",
    opts: [["big round", "크고 동그란"], ["small", "작은"], ["narrow", "가늘고 긴"], ["sleepy", "졸린 듯한"], ["sparkling", "반짝이는"]] },
  brows: { ko: "눈썹", frame: ["{S} has", "eyebrows."], view: "eyes",
    opts: [["thick", "두꺼운"], ["thin", "얇은"], ["straight", "일자"], ["arched", "아치형"]] },
  nose: { ko: "코", frame: ["{S} has a", "nose."], view: "face",
    opts: [["small", "작은"], ["big", "큰"], ["pointed", "뾰족한"], ["flat", "납작한"], ["round", "둥근"]] },
  mouth: { ko: "입", frame: ["{S} has", "."], view: "face",
    opts: [["a small mouth", "작은 입"], ["a wide mouth", "큰(넓은) 입"], ["a big smile", "활짝 웃는 입"], ["thin lips", "얇은 입술"], ["full lips", "도톰한 입술"]] },
  features: { ko: "얼굴 특징", frame: ["{S} has", "."], view: "head", multi: true,
    opts: [["freckles", "주근깨"], ["rosy cheeks", "발그레한 볼"], ["dimples", "보조개"], ["a mole", "점"], ["a mustache", "콧수염"], ["a beard", "턱수염"]] },
  hair: { ko: "머리 모양", frame: ["{S} has", "hair."], view: "hair",
    opts: [["short", "짧은"], ["spiky", "삐죽삐죽한"], ["short curly", "짧은 곱슬"], ["shoulder-length", "어깨까지 오는"], ["long straight", "긴 생"], ["long wavy", "긴 웨이브"], ["no", "머리카락 없는(대머리)"]] },
  hairColor: { ko: "머리 색깔", frame: ["{P} hair is", "."], view: "hair",
    opts: [["black", "검은색"], ["brown", "갈색"], ["blond", "금발"], ["red", "빨간색"], ["gray", "회색"], ["white", "흰색"], ["pink", "분홍색"], ["blue", "파란색"]] },
  height: { ko: "키", frame: ["{S} is", "."], view: "full",
    opts: [["very short", "아주 작은"], ["short", "작은"], ["of medium height", "보통 키"], ["tall", "큰"], ["very tall", "아주 큰"]] },
  build: { ko: "몸무게·체격", frame: ["{S} is", "."], view: "body",
    opts: [["thin", "마른"], ["slim", "날씬한"], ["of average build", "보통 체격"], ["chubby", "통통한"], ["muscular", "근육질"]] },
  top: { ko: "윗옷", frame: ["{S} is wearing", "."], view: "top", color: true,
    opts: [["T-shirt", "티셔츠"], ["shirt", "셔츠"], ["hoodie", "후드티"], ["sweater", "스웨터"], ["jacket", "재킷"], ["dress", "원피스"]] },
  bottom: { ko: "아래옷", frame: ["{S} is wearing", "."], view: "bottom", color: true,
    opts: [["jeans", "청바지", 1], ["pants", "바지", 1], ["shorts", "반바지", 1], ["skirt", "치마"], ["long skirt", "긴 치마"]] },
  shoes: { ko: "신발", frame: ["{S} is wearing", "."], view: "shoes", color: true,
    opts: [["sneakers", "운동화", 1], ["boots", "부츠", 1], ["sandals", "샌들", 1], ["slippers", "슬리퍼", 1]] },
  acc: { ko: "장신구", frame: ["{S} is wearing", "."], view: "acc", color: true, multi: true,
    opts: [["glasses", "안경", 1], ["sunglasses", "선글라스", 1], ["cap", "야구 모자"], ["hat", "챙 넓은 모자"], ["beanie", "털모자"],
      ["earrings", "귀걸이", 1], ["necklace", "목걸이"], ["scarf", "목도리"], ["tie", "넥타이"], ["bow tie", "나비넥타이"], ["watch", "손목시계"], ["backpack", "배낭"]] },
};
// 장신구 샘플 그림에서 크게 보여 줄 부분
const ACC_VIEW = {
  glasses: "head", sunglasses: "head", earrings: "head", cap: "hair", hat: "hair", beanie: "hair",
  necklace: "neck", scarf: "neck", tie: "neck", "bow tie": "neck", watch: "wrist", backpack: "top",
};
// 같이 쓸 수 없는 장신구 (새로 쓰면 바뀜)
const ACC_SLOT = { glasses: "eye", sunglasses: "eye", cap: "head", hat: "head", beanie: "head", tie: "neck", "bow tie": "neck" };

for (const id in CATS) {
  const c = CATS[id];
  c.id = id;
  c.opts = c.opts.map(([en, ko, plural]) => ({ en, ko, plural: !!plural }));
}

// 카드 아래에 보여 줄 표현 (색깔 옷은 a/an 붙여서)
function optLabel(cat, o) {
  if (!cat.color || o.plural) return o.en;
  return (/^[aeiou]/i.test(o.en) ? "an " : "a ") + o.en;
}

// 선택값 → 빈칸에 들어갈 표현
function valueText(cat, v) {
  if (!cat.color) return v;
  const words = (v.color ? v.color + " " : "") + v.item;
  const o = cat.opts.find(o => o.en === v.item);
  if (o && o.plural) return words;
  return (/^[aeiou]/i.test(words) ? "an " : "a ") + words;
}

function sentenceOf(cat, v, pron) {
  const S = pron === "she" ? "She" : "He", P = pron === "she" ? "Her" : "His";
  const [a, b] = cat.frame.map(t => t.replace("{S}", S).replace("{P}", P));
  return `${a} ${valueText(cat, v)}${b === "." ? "." : " " + b}`;
}

// ---------- 입력 검사 ----------
const normText = s => String(s || "").toLowerCase().replace(/[‘’]/g, "'").replace(/[.!?]+\s*$/, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// 결과: { ok:true, value } 또는 { ok:false, msg }
function parseBlank(cat, raw, pron) {
  let t = normText(raw);
  if (!t) return { ok: false, msg: "빈칸에 영어 표현을 써 주세요." };
  // 문장 전체를 써도 빈칸 부분만 꺼내기
  const S = pron === "she" ? "she" : "he", P = pron === "she" ? "her" : "his";
  const [pre, post] = cat.frame.map(f => normText(f.replace("{S}", S).replace("{P}", P)));
  if (pre && (t + " ").startsWith(pre + " ")) t = t.slice(pre.length).trim();
  if (post && (" " + t).endsWith(" " + post)) t = t.slice(0, t.length - post.length).trim();
  if (!t) return { ok: false, msg: "빈칸에 들어갈 말을 써 주세요." };

  if (!cat.color) {
    const o = cat.opts.find(o => normText(o.en) === t);
    if (o) return { ok: true, value: o.en };
    return { ok: false, msg: missMsg(cat, t, cat.opts.map(o => o.en)) };
  }

  let art = null;
  const m = t.match(/^(a|an) (.+)$/);
  if (m) { art = m[1]; t = m[2]; }
  let color = null;
  for (const c of Object.keys(CLOTH_COLORS)) {
    if (t.startsWith(c + " ")) { color = c; t = t.slice(c.length + 1); break; }
  }
  const o = cat.opts.find(o => normText(o.en) === t);
  if (!o) {
    if (!color && CLOTH_COLORS[t]) return { ok: false, msg: `색깔 말 뒤에 무엇인지도 써 주세요. (예: a ${t} ${cat.opts.find(o => !o.plural)?.en || cat.opts[0].en})` };
    return { ok: false, msg: missMsg(cat, t, cat.opts.map(o => o.en)) };
  }
  if (o.plural && art) return { ok: false, msg: `‘${o.en}’는 늘 복수형(-s)으로 쓰는 말이라 앞에 a/an을 쓰지 않아요.` };
  if (!o.plural && !art) return { ok: false, msg: `‘${o.en}’는 하나니까 앞에 a 또는 an을 붙여야 해요.` };
  if (art) {
    const next = color || o.en;
    const want = /^[aeiou]/.test(next) ? "an" : "a";
    if (art !== want) return { ok: false, msg: want === "an" ? `‘${next}’처럼 모음 소리로 시작하는 말 앞에는 an을 써요.` : `‘${next}’ 앞에는 an이 아니라 a를 써요.` };
  }
  return { ok: true, value: { item: o.en, color } };
}

// 퀴즈 채점: 학생이 쓴 표현이 몽타주 값과 맞는지 (색깔은 쓴 경우에만 비교, 몽타주에 색이 없으면 아무 색이나 인정)
function judge(cat, text, v, pron) {
  const r = parseBlank(cat, text, pron);
  if (!r.ok) return false;
  const vals = cat.multi ? (v || []) : (v ? [v] : []);
  return vals.some(x => cat.color
    ? x.item === r.value.item && (!r.value.color || !x.color || x.color === r.value.color)
    : x === r.value);
}

// 퀴즈 보기: 정답 1개 + 오답 2~3개 (섞어서). 오답은 judge 로 틀린 것만 남김
function makeChoices(cat, v, pron) {
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const vals = cat.multi ? (v || []) : v ? [v] : [];
  if (!vals.length) return [];
  const pick = vals[Math.floor(Math.random() * vals.length)];
  const right = cat.color ? valueText(cat, pick) : pick;
  let pool;
  if (cat.color) {
    const colors = Object.keys(CLOTH_COLORS).filter(c => c !== pick.color);
    pool = cat.opts.filter(o => o.en !== pick.item).map(o => valueText(cat, { item: o.en, color: pick.color }));
    // 같은 옷인데 색깔만 다른 보기도 섞기 (몽타주에 색깔이 있을 때만 오답이 됨)
    if (pick.color) pool = pool.concat(shuffle(colors).slice(0, 2).map(c => valueText(cat, { item: pick.item, color: c })));
  } else {
    pool = cat.opts.map(o => o.en).filter(e => e !== right);
  }
  const wrong = shuffle(pool).filter(t => !judge(cat, t, v, pron)).slice(0, cat.opts.length > 4 ? 3 : 2);
  return shuffle([right, ...wrong]);
}

function missMsg(cat, t, list) {
  let best = null, bd = 99;
  for (const e of list) {
    const d = lev(t, normText(e));
    if (d < bd) { bd = d; best = e; }
  }
  if (best && bd <= Math.max(2, Math.floor(best.length / 4))) return `철자를 확인해 보세요. 혹시 ‘${best}’ 인가요?`;
  return "카드 아래에 있는 영어 표현 중에서 골라 정확히 써 보세요.";
}

// ---------- 그리기 ----------
const OL = "#2E2A28";
const ln = (pts, w, color, extra = "") => `<path d="M${pts.map(p => p.join(",")).join(" L")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
// 테두리 있는 굵은 선 (팔·다리·소매)
const limb = (pts, w, color) => ln(pts, w + 4.4, OL) + ln(pts, w, color);
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c * k)));
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, "0")).join("");
};

const LEG = { "very short": 100, short: 128, "of medium height": 155, tall: 182, "very tall": 205 };
const BUILD = {
  thin: { sw: 38, ww: 27, hw: 30, arm: 15, leg: 21, neck: 9 },
  slim: { sw: 43, ww: 31, hw: 35, arm: 17, leg: 25, neck: 10 },
  "of average build": { sw: 48, ww: 37, hw: 40, arm: 20, leg: 29, neck: 11 },
  chubby: { sw: 55, ww: 58, hw: 54, arm: 27, leg: 37, neck: 14, belly: 16 },
  muscular: { sw: 64, ww: 38, hw: 42, arm: 28, leg: 33, neck: 15 },
};
const FACE = {
  "a round": { w: 54, r: 54 }, "an oval": { w: 46, r: 60 }, "a square": { w: 51, r: 56 },
  "a heart-shaped": { w: 52, r: 58 }, "": { w: 50, r: 57 },
};

function geom(st) {
  const cx = 150, feetY = 506;
  const legLen = LEG[st.height] || LEG["of medium height"];
  const b = BUILD[st.build] || BUILD["of average build"];
  const hipY = feetY - 12 - legLen;
  const shY = hipY - 118;
  const f = FACE[st.face || ""];
  const hc = shY - 64;
  return { cx, feetY, legLen, hipY, shY, hc, b, fw: f.w, fr: f.r };
}

// 보기(view)별 잘라 보여 줄 영역
function viewBox(st, view) {
  const g = geom(st);
  switch (view) {
    case "head": return [g.cx - 78, g.hc - 86, 156, 166];
    case "eyes": return [g.cx - 50, g.hc - 36, 100, 56];
    case "face": return [g.cx - 50, g.hc - 10, 100, 75];
    case "hair": return [g.cx - 95, g.hc - 92, 190, 210];
    case "top": return [g.cx - 120, g.shY - 50, 240, g.hipY - g.shY + 120];
    case "bottom": return [g.cx - 100, g.hipY - 30, 200, g.feetY - g.hipY + 36];
    case "shoes": return [g.cx - 80, g.feetY - 62, 160, 76];
    case "body": return [g.cx - 120, g.hc - 92, 240, g.feetY - g.hc + 104];
    case "acc": return [g.cx - 120, g.hc - 100, 240, g.hipY - g.hc + 140];
    case "neck": return [g.cx - 60, g.shY - 40, 120, 120];
    case "wrist": return [g.cx - g.b.sw - 60, g.hipY - 50, 100, 80];
    case "fig": { const top = g.hc - 100; return [g.cx - 120, top, 240, 520 - top]; }
    default: return [0, 0, 300, 520];
  }
}

function svgOf(st, view, cls = "") {
  const vb = viewBox(st, view);
  return `<svg class="${cls}" viewBox="${vb.join(" ")}" xmlns="http://www.w3.org/2000/svg">${drawFigure(st, view === "full")}</svg>`;
}

function drawFigure(st, ruler) {
  const g = geom(st);
  const { cx, hc, fw, fr, shY, hipY, feetY, b } = g;
  const skin = SKINS[st.skin] || SKINS.light;
  const skinD = shade(skin, 0.86);
  const hairC = HAIR_COLORS[st.hairColor] || HAIR_COLORS.black;
  const acc = {};
  (st.acc || []).forEach(a => { acc[a.item] = a; });
  const feats = new Set(st.features || []);
  const top = st.top || null, bottom = st.bottom || null, shoes = st.shoes || null;
  const col = (v, def) => (v && v.color ? CLOTH_COLORS[v.color] : def);
  let s = "";

  // 키 재는 줄 (경찰서 몽타주 배경)
  if (ruler) {
    s += `<rect x="0" y="0" width="300" height="520" fill="#EEF1F6"/>`;
    for (let cm = 100; cm <= 190; cm += 10) {
      const y = feetY - cm * 2.48;
      s += `<line x1="0" x2="300" y1="${y}" y2="${y}" stroke="#C9D0DC" stroke-width="${cm % 50 ? 1 : 2}"/>`;
      s += `<text x="6" y="${y - 3}" font-size="10" fill="#8A93A3" font-family="sans-serif">${cm}</text>`;
    }
    s += `<line x1="0" x2="300" y1="${feetY}" y2="${feetY}" stroke="#AEB6C4" stroke-width="3"/>`;
  }

  // 배낭 (몸 뒤)
  if (acc.backpack) {
    const c = col(acc.backpack, CLOTH_COLORS.orange);
    s += `<rect x="${cx - b.sw - 6}" y="${shY + 10}" width="${(b.sw + 6) * 2}" height="${hipY - shY - 4}" rx="22" fill="${shade(c, 0.85)}" stroke="${OL}" stroke-width="2.2"/>`;
  }

  // 뒷머리
  s += hairBack(st.hair, cx, hc, fw, fr, hairC);

  // 후드 (머리 뒤)
  if (top && top.item === "hoodie") {
    const c = col(top, CLOTH_COLORS.gray);
    s += `<path d="M${cx - 44},${shY + 6} Q${cx - 50},${hc + 20} ${cx},${hc + 30} Q${cx + 50},${hc + 20} ${cx + 44},${shY + 6} Z" fill="${shade(c, 0.85)}" stroke="${OL}" stroke-width="2.2"/>`;
  }

  // 다리
  const lx = cx - b.hw * 0.48, rx = cx + b.hw * 0.48;
  const ankle = feetY - 12;
  const legL = [[lx, hipY - 6], [lx - 3, ankle]], legR = [[rx, hipY - 6], [rx + 3, ankle]];
  s += limb(legL, b.leg, skin) + limb(legR, b.leg, skin);

  // 아래옷
  s += drawBottom(bottom, g, lx, rx, ankle, col);

  // 신발
  s += drawShoes(shoes, lx - 3, rx + 3, feetY, skin, col);

  // 목
  const nk = b.neck;
  s += `<rect x="${cx - nk}" y="${hc + fr - 14}" width="${nk * 2}" height="${shY - hc - fr + 24}" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  s += `<path d="M${cx - nk},${hc + fr - 2} Q${cx},${hc + fr + 8} ${cx + nk},${hc + fr - 2}" fill="none" stroke="${skinD}" stroke-width="3"/>`;

  // 몸통 + 팔 (윗옷)
  s += drawTop(top, g, skin, col);

  // 장신구 (몸)
  if (acc.watch) {
    const c = col(acc.watch, "#2E2E33");
    const wx = cx - b.sw - 10, wy = hipY - 8;
    s += `<rect x="${wx - b.arm / 2 - 2}" y="${wy - 5}" width="${b.arm + 4}" height="10" rx="3" fill="${c}" stroke="${OL}" stroke-width="1.8"/>`;
    s += `<circle cx="${wx}" cy="${wy}" r="6.5" fill="#fff" stroke="${OL}" stroke-width="2"/><path d="M${wx},${wy} l0,-4 M${wx},${wy} l3,1" stroke="${OL}" stroke-width="1.4"/>`;
  }
  if (acc.necklace) {
    const c = col(acc.necklace, "#E2B33C");
    s += `<path d="M${cx - nk - 6},${shY + 2} Q${cx},${shY + 40} ${cx + nk + 6},${shY + 2}" fill="none" stroke="${c}" stroke-width="3"/>`;
    s += `<circle cx="${cx}" cy="${shY + 24}" r="5.5" fill="${c}" stroke="${OL}" stroke-width="1.5"/>`;
  }
  if (acc.tie) {
    const c = col(acc.tie, CLOTH_COLORS.red);
    s += `<path d="M${cx - 6},${shY + 2} L${cx + 6},${shY + 2} L${cx + 4},${shY + 12} L${cx + 9},${shY + 62} L${cx},${shY + 74} L${cx - 9},${shY + 62} L${cx - 4},${shY + 12} Z" fill="${c}" stroke="${OL}" stroke-width="2"/>`;
  }
  if (acc["bow tie"]) {
    const c = col(acc["bow tie"], CLOTH_COLORS.red);
    s += `<path d="M${cx},${shY + 6} L${cx - 17},${shY - 3} L${cx - 17},${shY + 15} Z M${cx},${shY + 6} L${cx + 17},${shY - 3} L${cx + 17},${shY + 15} Z" fill="${c}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/><circle cx="${cx}" cy="${shY + 6}" r="4.5" fill="${shade(c, 0.8)}" stroke="${OL}" stroke-width="1.6"/>`;
  }
  if (acc.scarf) {
    const c = col(acc.scarf, CLOTH_COLORS.red);
    s += `<path d="M${cx - nk - 10},${shY - 8} Q${cx},${shY + 8} ${cx + nk + 10},${shY - 8} L${cx + nk + 12},${shY + 8} Q${cx},${shY + 24} ${cx - nk - 12},${shY + 8} Z" fill="${c}" stroke="${OL}" stroke-width="2.2"/>`;
    s += `<path d="M${cx + 6},${shY + 12} L${cx + 22},${shY + 12} L${cx + 26},${shY + 70} L${cx + 10},${shY + 70} Z" fill="${c}" stroke="${OL}" stroke-width="2.2"/>`;
    s += `<path d="M${cx + 12},${shY + 50} L${cx + 26},${shY + 50} M${cx + 11},${shY + 40} L${cx + 25},${shY + 40}" stroke="${shade(c, 0.7)}" stroke-width="3"/>`;
  }
  if (acc.backpack) {
    const c = col(acc.backpack, CLOTH_COLORS.orange);
    const sx = b.sw * 0.55;
    s += ln([[cx - sx, shY + 1], [cx - sx - 4, shY + 70]], 8, OL) + ln([[cx - sx, shY + 1], [cx - sx - 4, shY + 70]], 5, c);
    s += ln([[cx + sx, shY + 1], [cx + sx + 4, shY + 70]], 8, OL) + ln([[cx + sx, shY + 1], [cx + sx + 4, shY + 70]], 5, c);
  }

  // 귀 + 얼굴
  s += `<ellipse cx="${cx - fw + 1}" cy="${hc + 4}" rx="9" ry="13" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  s += `<ellipse cx="${cx + fw - 1}" cy="${hc + 4}" rx="9" ry="13" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  s += `<path d="${facePath(st.face, cx, hc, fw, fr)}" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>`;

  // 얼굴 특징
  if (feats.has("rosy cheeks")) s += `<ellipse cx="${cx - 28}" cy="${hc + 22}" rx="10" ry="6" fill="#F28B8B" opacity=".5"/><ellipse cx="${cx + 28}" cy="${hc + 22}" rx="10" ry="6" fill="#F28B8B" opacity=".5"/>`;
  if (feats.has("freckles")) {
    for (const sx of [-1, 1]) for (const [dx, dy] of [[24, 16], [31, 19], [27, 23], [35, 14], [20, 21]])
      s += `<circle cx="${cx + sx * dx}" cy="${hc + dy}" r="1.6" fill="#A0603A"/>`;
  }
  s += drawEyes(st.eyes, cx, hc);
  s += drawBrows(st.brows, cx, hc, st.hairColor ? hairC : "#3A2C24");
  s += drawNose(st.nose, cx, hc, skinD);
  s += drawMouth(st.mouth, cx, hc);
  if (feats.has("dimples")) s += `<path d="M${cx - 27},${hc + 34} q2,4 0,7 M${cx + 27},${hc + 34} q-2,4 0,7" stroke="${skinD}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (feats.has("a mole")) s += `<circle cx="${cx + 20}" cy="${hc + 42}" r="2.6" fill="#3A2A22"/>`;
  if (feats.has("a beard")) {
    s += `<path d="M${cx - fw + 4},${hc + 6} Q${cx - fw + 6},${hc + fr + 2} ${cx},${hc + fr + 12} Q${cx + fw - 6},${hc + fr + 2} ${cx + fw - 4},${hc + 6} Q${cx + fw - 14},${hc + 34} ${cx + 18},${hc + 48} Q${cx},${hc + 40} ${cx - 18},${hc + 48} Q${cx - fw + 14},${hc + 34} ${cx - fw + 4},${hc + 6} Z" fill="${hairC}" stroke="${OL}" stroke-width="2"/>`;
    s += drawMouth(st.mouth, cx, hc, true);
  }
  if (feats.has("a mustache")) s += `<path d="M${cx},${hc + 30} Q${cx - 12},${hc + 24} ${cx - 22},${hc + 33} Q${cx - 10},${hc + 31} ${cx},${hc + 35} Q${cx + 10},${hc + 31} ${cx + 22},${hc + 33} Q${cx + 12},${hc + 24} ${cx},${hc + 30} Z" fill="${hairC}" stroke="${OL}" stroke-width="1.8"/>`;

  // 앞머리
  s += hairFront(st.hair, cx, hc, fw, fr, hairC);

  // 안경 · 귀걸이
  if (acc.glasses) {
    const c = col(acc.glasses, "#2E2E33");
    s += `<circle cx="${cx - 20}" cy="${hc + 1}" r="13" fill="#fff" fill-opacity=".25" stroke="${c}" stroke-width="3.2"/><circle cx="${cx + 20}" cy="${hc + 1}" r="13" fill="#fff" fill-opacity=".25" stroke="${c}" stroke-width="3.2"/>`;
    s += `<path d="M${cx - 7},${hc} Q${cx},${hc - 5} ${cx + 7},${hc} M${cx - 33},${hc - 1} L${cx - fw + 2},${hc - 3} M${cx + 33},${hc - 1} L${cx + fw - 2},${hc - 3}" stroke="${c}" stroke-width="3" fill="none"/>`;
  }
  if (acc.sunglasses) {
    const c = col(acc.sunglasses, "#2E2E33");
    s += `<path d="M${cx - 36},${hc - 8} L${cx - 6},${hc - 8} L${cx - 8},${hc + 8} Q${cx - 20},${hc + 16} ${cx - 33},${hc + 8} Z M${cx + 36},${hc - 8} L${cx + 6},${hc - 8} L${cx + 8},${hc + 8} Q${cx + 20},${hc + 16} ${cx + 33},${hc + 8} Z" fill="#26262C" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M${cx - 6},${hc - 6} L${cx + 6},${hc - 6} M${cx - 36},${hc - 7} L${cx - fw + 1},${hc - 4} M${cx + 36},${hc - 7} L${cx + fw - 1},${hc - 4}" stroke="${c}" stroke-width="3"/>`;
    s += `<path d="M${cx - 30},${hc - 4} l8,0 M${cx + 12},${hc - 4} l8,0" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  }
  if (acc.earrings) {
    const c = col(acc.earrings, "#E2B33C");
    s += `<circle cx="${cx - fw}" cy="${hc + 22}" r="4.5" fill="${c}" stroke="${OL}" stroke-width="1.5"/><circle cx="${cx + fw}" cy="${hc + 22}" r="4.5" fill="${c}" stroke="${OL}" stroke-width="1.5"/>`;
  }

  // 모자
  const ht = hc - fr;
  if (acc.cap) {
    const c = col(acc.cap, CLOTH_COLORS.red);
    s += `<path d="M${cx - fw - 6},${hc - 16} Q${cx - fw - 4},${ht - 18} ${cx},${ht - 18} Q${cx + fw + 4},${ht - 18} ${cx + fw + 6},${hc - 16} Z" fill="${c}" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<path d="M${cx - fw - 8},${hc - 16} Q${cx},${hc - 6} ${cx + fw + 40},${hc - 12} Q${cx + fw + 36},${hc - 24} ${cx + fw + 4},${hc - 22} Q${cx},${hc - 26} ${cx - fw - 8},${hc - 16} Z" fill="${shade(c, 0.82)}" stroke="${OL}" stroke-width="2.2"/>`;
    s += `<circle cx="${cx}" cy="${ht - 17}" r="4" fill="${shade(c, 0.8)}" stroke="${OL}" stroke-width="1.6"/>`;
  }
  if (acc.hat) {
    const c = col(acc.hat, "#C9A46A");
    s += `<path d="M${cx - fw + 2},${hc - 22} L${cx - fw + 8},${ht - 22} Q${cx},${ht - 30} ${cx + fw - 8},${ht - 22} L${cx + fw - 2},${hc - 22} Z" fill="${c}" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<rect x="${cx - fw + 2}" y="${hc - 36}" width="${(fw - 2) * 2}" height="12" fill="${shade(c, 0.6)}"/>`;
    s += `<ellipse cx="${cx}" cy="${hc - 22}" rx="${fw + 34}" ry="12" fill="${c}" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<path d="M${cx - fw + 2},${hc - 24} Q${cx},${hc - 18} ${cx + fw - 2},${hc - 24}" fill="none" stroke="${OL}" stroke-width="1.6" opacity=".5"/>`;
  }
  if (acc.beanie) {
    const c = col(acc.beanie, CLOTH_COLORS.blue);
    s += `<path d="M${cx - fw - 3},${hc - 18} Q${cx - fw - 2},${ht - 22} ${cx},${ht - 22} Q${cx + fw + 2},${ht - 22} ${cx + fw + 3},${hc - 18} Z" fill="${c}" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<rect x="${cx - fw - 5}" y="${hc - 30}" width="${(fw + 5) * 2}" height="16" rx="7" fill="${shade(c, 0.8)}" stroke="${OL}" stroke-width="2.2"/>`;
    s += `<circle cx="${cx}" cy="${ht - 24}" r="10" fill="${shade(c, 1.15)}" stroke="${OL}" stroke-width="2"/>`;
  }
  return s;
}

function facePath(shape, cx, hc, w, r) {
  if (shape === "a square") {
    return `M${cx - w},${hc - r + 22} Q${cx - w},${hc - r} ${cx - w + 22},${hc - r} L${cx + w - 22},${hc - r} Q${cx + w},${hc - r} ${cx + w},${hc - r + 22} L${cx + w},${hc + r - 26} Q${cx + w - 2},${hc + r - 4} ${cx + w - 26},${hc + r} L${cx - w + 26},${hc + r} Q${cx - w + 2},${hc + r - 4} ${cx - w},${hc + r - 26} Z`;
  }
  if (shape === "a heart-shaped") {
    return `M${cx},${hc + r + 2} C${cx - 20},${hc + r} ${cx - w + 2},${hc + 26} ${cx - w},${hc - 4} C${cx - w - 1},${hc - r + 6} ${cx - 26},${hc - r} ${cx},${hc - r} C${cx + 26},${hc - r} ${cx + w + 1},${hc - r + 6} ${cx + w},${hc - 4} C${cx + w - 2},${hc + 26} ${cx + 20},${hc + r} ${cx},${hc + r + 2} Z`;
  }
  // 동그란·달걀형·기본: 아래가 조금 더 좁은 타원
  const k = shape === "a round" ? 0.55 : 0.5;
  return `M${cx},${hc - r} C${cx + w * k * 1.1},${hc - r} ${cx + w},${hc - r * 0.55} ${cx + w},${hc} C${cx + w},${hc + r * 0.6} ${cx + w * k},${hc + r} ${cx},${hc + r} C${cx - w * k},${hc + r} ${cx - w},${hc + r * 0.6} ${cx - w},${hc} C${cx - w},${hc - r * 0.55} ${cx - w * k * 1.1},${hc - r} ${cx},${hc - r} Z`;
}

function drawEyes(t, cx, hc) {
  if (!t) return "";
  let s = "";
  const ink = "#2B1E18";
  for (const sx of [-1, 1]) {
    const x = cx + sx * 20, y = hc + 2;
    if (t === "big round") s += `<circle cx="${x}" cy="${y}" r="10.5" fill="#fff" stroke="${OL}" stroke-width="2"/><circle cx="${x}" cy="${y + 1}" r="6.5" fill="${ink}"/><circle cx="${x + 2.5}" cy="${y - 2}" r="2.2" fill="#fff"/>`;
    if (t === "small") s += `<circle cx="${x}" cy="${y}" r="3.4" fill="${ink}"/>`;
    if (t === "narrow") s += `<path d="M${x - 10},${y + 1} Q${x},${y - 5} ${x + 10},${y + 1} Q${x},${y + 3} ${x - 10},${y + 1} Z" fill="${ink}" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if (t === "sleepy") s += `<path d="M${x - 10},${y} A10,10 0 0 0 ${x + 10},${y} Z" fill="#fff" stroke="${OL}" stroke-width="2"/><path d="M${x - 5},${y} A5,5 0 0 0 ${x + 5},${y} Z" fill="${ink}"/><path d="M${x - 11},${y} L${x + 11},${y}" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>`;
    if (t === "sparkling") {
      s += `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="10" fill="${ink}"/><circle cx="${x + 2.6}" cy="${y - 3.5}" r="3.2" fill="#fff"/><circle cx="${x - 3}" cy="${y + 4}" r="1.6" fill="#fff"/>`;
      s += `<path d="M${x + sx * 6},${y - 8} l${sx * 5},-4 M${x + sx * 8},${y - 4} l${sx * 6},-2" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>`;
    }
  }
  return s;
}

function drawBrows(t, cx, hc, c) {
  if (!t) return "";
  const w = { thick: 6.5, thin: 2.2, straight: 4, arched: 4 }[t];
  let s = "";
  for (const sx of [-1, 1]) {
    const x0 = cx + sx * 10, x1 = cx + sx * 32, y = hc - 17;
    let d;
    if (t === "straight") d = `M${x0},${y} L${x1},${y}`;
    else if (t === "arched") d = `M${x0},${y + 2} Q${cx + sx * 20},${y - 11} ${x1},${y + 3}`;
    else d = `M${x0},${y + 1} Q${cx + sx * 21},${y - 5} ${x1},${y + 1}`;
    s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}

function drawNose(t, cx, hc, c) {
  if (!t) return "";
  const y = hc + 18;
  const st = `fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  if (t === "small") return `<path d="M${cx - 3},${y} Q${cx},${y + 3} ${cx + 3},${y}" ${st}/>`;
  if (t === "big") return `<path d="M${cx - 2},${y - 18} L${cx - 6},${y + 2} Q${cx - 14},${y + 6} ${cx - 9},${y + 10} Q${cx},${y + 14} ${cx + 9},${y + 10} Q${cx + 14},${y + 6} ${cx + 6},${y + 2}" ${st}/><circle cx="${cx - 5}" cy="${y + 9}" r="1.8" fill="${c}"/><circle cx="${cx + 5}" cy="${y + 9}" r="1.8" fill="${c}"/>`;
  if (t === "pointed") return `<path d="M${cx},${y - 16} L${cx + 9},${y + 6} L${cx - 1},${y + 7}" ${st}/>`;
  if (t === "flat") return `<path d="M${cx - 11},${y + 4} Q${cx - 13},${y - 2} ${cx - 7},${y - 1} M${cx + 11},${y + 4} Q${cx + 13},${y - 2} ${cx + 7},${y - 1} M${cx - 8},${y + 6} Q${cx},${y + 9} ${cx + 8},${y + 6}" ${st}/>`;
  if (t === "round") return `<circle cx="${cx}" cy="${y + 2}" r="7" fill="${c}" opacity=".45"/><path d="M${cx - 7},${y + 4} Q${cx},${y + 10} ${cx + 7},${y + 4}" ${st}/>`;
  return "";
}

function drawMouth(t, cx, hc, again) {
  if (!t) return "";
  const y = hc + 38;
  const lip = "#D9666F";
  if (t === "a small mouth") return `<path d="M${cx - 6},${y} Q${cx},${y + 4} ${cx + 6},${y}" fill="none" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/>`;
  if (t === "a wide mouth") return `<path d="M${cx - 22},${y - 3} Q${cx},${y + 8} ${cx + 22},${y - 3}" fill="none" stroke="${OL}" stroke-width="2.8" stroke-linecap="round"/>`;
  if (t === "a big smile") return `<path d="M${cx - 18},${y - 5} Q${cx},${y - 2} ${cx + 18},${y - 5} Q${cx + 14},${y + 14} ${cx},${y + 14} Q${cx - 14},${y + 14} ${cx - 18},${y - 5} Z" fill="#8A2E36" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${cx - 15},${y - 3} Q${cx},${y} ${cx + 15},${y - 3} L${cx + 13},${y + 2} Q${cx},${y + 4} ${cx - 13},${y + 2} Z" fill="#fff"/>`;
  if (t === "thin lips") return `<path d="M${cx - 13},${y} Q${cx},${y - 3} ${cx + 13},${y} Q${cx},${y + 3} ${cx - 13},${y} Z" fill="${lip}" stroke="${OL}" stroke-width="1.6"/>`;
  if (t === "full lips") return `<path d="M${cx - 15},${y} Q${cx - 8},${y - 8} ${cx},${y - 4} Q${cx + 8},${y - 8} ${cx + 15},${y} Q${cx},${y + 12} ${cx - 15},${y} Z" fill="${lip}" stroke="${OL}" stroke-width="2"/><path d="M${cx - 14},${y} Q${cx},${y + 2} ${cx + 14},${y}" stroke="${OL}" stroke-width="1.6" fill="none"/>`;
  return "";
}

function hairBack(t, cx, hc, w, r, c) {
  const st = `fill="${c}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"`;
  if (t === "shoulder-length") return `<path d="M${cx - w - 10},${hc - 20} L${cx - w - 16},${hc + 64} Q${cx},${hc + 78} ${cx + w + 16},${hc + 64} L${cx + w + 10},${hc - 20} Z" ${st}/>`;
  if (t === "long straight") return `<path d="M${cx - w - 10},${hc - 20} L${cx - w - 18},${hc + 150} Q${cx},${hc + 162} ${cx + w + 18},${hc + 150} L${cx + w + 10},${hc - 20} Z" ${st}/>`;
  if (t === "long wavy") {
    let d = `M${cx - w - 8},${hc - 20}`;
    for (let i = 0; i < 5; i++) d += ` q${i % 2 ? 10 : -10},16 ${i % 2 ? 0 : -4},32`;
    d += ` Q${cx},${hc + 172} ${cx + w + 26},${hc + 140}`;
    for (let i = 0; i < 5; i++) d += ` q${i % 2 ? -10 : 10},-16 ${i % 2 ? 0 : -4},-32`;
    return `<path d="${d} Z" ${st}/>`;
  }
  return "";
}

function hairFront(t, cx, hc, w, r, c) {
  if (!t || t === "no") return "";
  const st = `fill="${c}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"`;
  const top = hc - r;
  // 정수리를 덮는 기본 모양 (옆머리는 귀 위까지, 앞머리 선은 이마)
  // 곡선 꼭대기가 정수리(top)보다 lift 만큼 위에 오도록 조절점 높이 계산
  const cap = (side, fringe, lift = 8) => {
    const yc = ((top - lift) - 0.25 * (hc + side)) / 0.75;
    return `M${cx - w - 3},${hc + side} C${cx - w - 4},${yc} ${cx + w + 4},${yc} ${cx + w + 3},${hc + side} ` +
    `L${cx + w - 6},${hc + side} C${cx + w - 8},${hc - fringe - 6} ${cx + 20},${hc - fringe} ${cx + 4},${hc - fringe + 2} ` +
    `C${cx - 14},${hc - fringe + 4} ${cx - w + 6},${hc - fringe - 2} ${cx - w + 6},${hc + side} Z`;
  };
  if (t === "short") return `<path d="${cap(-8, 30)}" ${st}/>`;
  if (t === "spiky") {
    let d = `M${cx - w - 3},${hc - 4}`;
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (Math.PI * i) / n;
      const px = cx + Math.cos(a) * (w + 4), py = hc - 12 + Math.sin(a) * (r - 4);
      const qa = Math.PI + (Math.PI * (i + 0.5)) / n;
      d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
      if (i < n) d += ` L${(cx + Math.cos(qa) * (w + 22)).toFixed(1)},${(hc - 12 + Math.sin(qa) * (r + 16)).toFixed(1)}`;
    }
    d += ` L${cx + w + 3},${hc - 4} L${cx + w - 6},${hc - 4} C${cx + w - 10},${hc - 36} ${cx + 10},${hc - 30} ${cx},${hc - 28} C${cx - 10},${hc - 30} ${cx - w + 10},${hc - 36} ${cx - w + 6},${hc - 4} Z`;
    return `<path d="${d}" ${st}/>`;
  }
  if (t === "short curly") {
    let s = `<path d="${cap(-6, 28, 4)}" ${st}/>`;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * 1.03 + (Math.PI * 0.94 * i) / 10;
      s += `<circle cx="${(cx + Math.cos(a) * (w + 2)).toFixed(1)}" cy="${(hc - 6 + Math.sin(a) * (r - 2)).toFixed(1)}" r="13" ${st}/>`;
    }
    for (let i = 0; i < 4; i++) s += `<circle cx="${cx - 24 + i * 16}" cy="${hc - 30 + (i % 2) * 4}" r="11" ${st}/>`;
    return s;
  }
  // 긴 머리: 가르마 + 얼굴 옆을 덮는 옆머리
  const len = t === "shoulder-length" ? 60 : 110;
  let s = `<path d="${cap(10, 26, 10)}" ${st}/>`;
  s += `<path d="M${cx - w - 3},${hc} L${cx - w - 8},${hc + len} L${cx - w + 6},${hc + len - 6} L${cx - w + 8},${hc - 10} Z" ${st}/>`;
  s += `<path d="M${cx + w + 3},${hc} L${cx + w + 8},${hc + len} L${cx + w - 6},${hc + len - 6} L${cx + w - 8},${hc - 10} Z" ${st}/>`;
  s += `<path d="M${cx + 6},${hc - 26} Q${cx + 2},${top + 8} ${cx - 2},${top - 2}" fill="none" stroke="${OL}" stroke-width="1.8" opacity=".55"/>`;
  return s;
}

function drawTop(top, g, skin, col) {
  const { cx, shY, hipY, b } = g;
  const sw = b.sw, ww = b.ww, hw = b.hw, belly = b.belly || 0;
  const torso = (bottomY = hipY, bulge = belly) => `M${cx - sw + 12},${shY - 2} Q${cx - sw},${shY} ${cx - sw},${shY + 16} C${cx - sw},${shY + 50} ${cx - ww - bulge},${shY + 72} ${cx - hw},${bottomY} L${cx + hw},${bottomY} C${cx + ww + bulge},${shY + 72} ${cx + sw},${shY + 50} ${cx + sw},${shY + 16} Q${cx + sw},${shY} ${cx + sw - 12},${shY - 2} Z`;
  const armPts = sx => {
    const sh = [cx + sx * (sw - b.arm * 0.45), shY + 12];
    const el = [cx + sx * (sw + 6), shY + (hipY - shY) * 0.55];
    const wr = [cx + sx * (sw + 10), hipY + 4];
    return [sh, el, wr];
  };
  const item = top ? top.item : null;
  const c = col(top, { "T-shirt": "#FFFFFF", shirt: "#EAF2FF", hoodie: CLOTH_COLORS.gray, sweater: "#C7563F", jacket: "#3B4A6B", dress: "#E76F8A" }[item] || "#D5D9DF");
  const long = ["shirt", "hoodie", "sweater", "jacket"].includes(item);
  const short = item === "T-shirt" || item === "dress";
  let s = "";

  // 원피스 치마 (몸통 아래)
  if (item === "dress") {
    const knee = hipY + g.legLen * 0.48;
    s += `<path d="M${cx - ww - 4},${shY + 66} L${cx + ww + 4},${shY + 66} L${cx + hw + 30},${knee - 6} Q${cx},${knee + 12} ${cx - hw - 30},${knee - 6} Z" fill="${c}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
  s += `<path d="${torso(item === "dress" ? shY + 74 : hipY)}" fill="${c}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>`;

  // 팔
  for (const sx of [-1, 1]) {
    const [sh, el, wr] = armPts(sx);
    s += limb([sh, el, wr], b.arm, skin);
    if (long) s += limb([sh, el, [wr[0], wr[1] - 10]], b.arm + 6, c);
    else if (short) s += limb([sh, [sh[0] + (el[0] - sh[0]) * 0.55, sh[1] + (el[1] - sh[1]) * 0.55]], b.arm + 8, c);
    if (long) s += `<path d="M${wr[0] - b.arm / 2 - 4},${wr[1] - 14} L${wr[0] + b.arm / 2 + 4},${wr[1] - 14}" stroke="${shade(c, 0.75)}" stroke-width="2.5"/>`;
    s += `<circle cx="${wr[0]}" cy="${wr[1] + 6}" r="${b.arm * 0.48 + 3}" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  }
  // 팔 위에 다시 몸통 어깨선 (소매 이음매 깔끔하게)
  if (item === "dress") s += `<path d="M${cx - ww - 4},${shY + 70} Q${cx},${shY + 76} ${cx + ww + 4},${shY + 70}" stroke="${shade(c, 0.7)}" stroke-width="3" fill="none"/>`;

  const nk = b.neck;
  if (!item) {
    s += `<path d="M${cx - nk - 8},${shY - 2} Q${cx},${shY + 22} ${cx + nk + 8},${shY - 2}" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  }
  if (item === "T-shirt" || item === "dress") {
    s += `<path d="M${cx - nk - 6},${shY - 2} Q${cx},${shY + 16} ${cx + nk + 6},${shY - 2}" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
  }
  if (item === "sweater") {
    s += `<path d="M${cx - nk - 6},${shY - 2} Q${cx},${shY + 14} ${cx + nk + 6},${shY - 2}" fill="${skin}" stroke="${shade(c, 0.7)}" stroke-width="5"/>`;
    s += `<path d="M${cx - hw + 2},${hipY - 8} L${cx + hw - 2},${hipY - 8}" stroke="${shade(c, 0.7)}" stroke-width="4"/>`;
    for (let i = -2; i <= 2; i++) s += `<path d="M${cx + i * 14 - 6},${shY + 50} l6,8 l6,-8" stroke="${shade(c, 1.2)}" stroke-width="3" fill="none"/>`;
  }
  if (item === "shirt") {
    s += `<path d="M${cx - nk - 4},${shY - 4} L${cx},${shY + 16} L${cx + nk + 4},${shY - 4}" fill="${skin}" stroke="${OL}" stroke-width="2"/>`;
    s += `<path d="M${cx - nk - 6},${shY - 6} L${cx - 2},${shY + 16} L${cx - 18},${shY + 14} Z M${cx + nk + 6},${shY - 6} L${cx + 2},${shY + 16} L${cx + 18},${shY + 14} Z" fill="${shade(c, 1.05)}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`;
    for (let y = shY + 30; y < hipY - 8; y += 18) s += `<circle cx="${cx}" cy="${y}" r="2.3" fill="${shade(c, 0.6)}"/>`;
    s += `<rect x="${cx + 12}" y="${shY + 26}" width="18" height="16" rx="2" fill="none" stroke="${shade(c, 0.7)}" stroke-width="2"/>`;
  }
  if (item === "hoodie") {
    s += `<path d="M${cx - nk - 6},${shY - 2} Q${cx},${shY + 16} ${cx + nk + 6},${shY - 2}" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
    s += ln([[cx - 7, shY + 10], [cx - 8, shY + 40]], 2.4, "#fff") + ln([[cx + 7, shY + 10], [cx + 8, shY + 40]], 2.4, "#fff");
    s += `<path d="M${cx - 28},${hipY - 10} L${cx - 20},${hipY - 44} L${cx + 20},${hipY - 44} L${cx + 28},${hipY - 10} Z" fill="${shade(c, 0.9)}" stroke="${OL}" stroke-width="2"/>`;
  }
  if (item === "jacket") {
    s += `<path d="M${cx - 18},${shY - 1} L${cx},${shY + 70} L${cx + 18},${shY - 1} Z" fill="#F4F4F4" stroke="${OL}" stroke-width="2"/>`;
    s += `<path d="M${cx - nk - 6},${shY - 2} Q${cx},${shY + 12} ${cx + nk + 6},${shY - 2}" fill="${skin}" stroke="${OL}" stroke-width="2"/>`;
    s += `<path d="M${cx - 20},${shY - 2} L${cx - 26},${shY + 24} L${cx - 14},${shY + 30} L${cx},${shY + 72} M${cx + 20},${shY - 2} L${cx + 26},${shY + 24} L${cx + 14},${shY + 30} L${cx},${shY + 72}" fill="none" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<path d="M${cx},${shY + 72} L${cx},${hipY}" stroke="${OL}" stroke-width="2"/><circle cx="${cx - 7}" cy="${shY + 88}" r="3" fill="${shade(c, 0.6)}"/><circle cx="${cx - 7}" cy="${shY + 106}" r="3" fill="${shade(c, 0.6)}"/>`;
  }
  return s;
}

function drawBottom(v, g, lx, rx, ankle, col) {
  const { cx, hipY, legLen, b } = g;
  const item = v ? v.item : null;
  const st = `stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"`;
  if (item === "skirt" || item === "long skirt") {
    const c = col(v, item === "skirt" ? CLOTH_COLORS.navy : "#7A5C9E");
    const end = item === "skirt" ? hipY + legLen * 0.42 : ankle - 18;
    const flare = item === "skirt" ? 22 : 30;
    let s = `<path d="M${cx - b.hw - 2},${hipY - 16} L${cx + b.hw + 2},${hipY - 16} L${cx + b.hw + flare},${end} Q${cx},${end + 10} ${cx - b.hw - flare},${end} Z" fill="${c}" ${st}/>`;
    for (const k of [-0.5, 0, 0.5]) s += `<path d="M${cx + k * b.hw * 0.8},${hipY} L${cx + k * (b.hw + flare) * 0.8},${end + 2}" stroke="${shade(c, 0.75)}" stroke-width="2"/>`;
    return s;
  }
  const defC = { jeans: "#3E64A8", pants: "#4A4A55", shorts: "#6E8B5A" }[item] || "#A3A9B2";
  const c = col(v, defC);
  const end = item === "jeans" || item === "pants" ? ankle - 6 : item === "shorts" ? hipY + legLen * 0.36 : hipY + 26;
  const w = b.leg + 7;
  const legL = [[lx, hipY - 6], [lx - 3 * (end - hipY) / (ankle - hipY), end]];
  const legR = [[rx, hipY - 6], [rx + 3 * (end - hipY) / (ankle - hipY), end]];
  let s = ln(legL, w + 4.4, OL, `stroke-linecap="butt"`) + ln(legR, w + 4.4, OL, `stroke-linecap="butt"`);
  s += ln(legL, w, c, `stroke-linecap="butt"`) + ln(legR, w, c, `stroke-linecap="butt"`);
  s += `<path d="M${cx - b.hw - 1},${hipY - 18} L${cx + b.hw + 1},${hipY - 18} L${rx + w / 2},${hipY + 18} L${cx + 3},${hipY + 22} L${cx},${hipY + 8} L${cx - 3},${hipY + 22} L${lx - w / 2},${hipY + 18} Z" fill="${c}" ${st}/>`;
  s += `<path d="M${lx - w / 2 + 1.2},${hipY + 16} L${lx - w / 2 + 1.2},${hipY + 24} M${rx + w / 2 - 1.2},${hipY + 16} L${rx + w / 2 - 1.2},${hipY + 24}" stroke="${c}" stroke-width="3"/>`;
  if (item === "jeans") s += `<path d="M${lx + 2},${hipY + 20} L${lx},${end - 4} M${rx - 2},${hipY + 20} L${rx},${end - 4}" stroke="#E2B33C" stroke-width="1.4" stroke-dasharray="4 3"/>`;
  return s;
}

function drawShoes(v, lx, rx, feetY, skin, col) {
  const item = v ? v.item : null;
  let s = "";
  for (const sx of [-1, 1]) {
    const x = sx < 0 ? lx : rx, y = feetY - 6;
    const tx = x + sx * 10;
    if (!item) {
      s += `<ellipse cx="${tx}" cy="${y}" rx="15" ry="7" fill="${skin}" stroke="${OL}" stroke-width="2.2"/>`;
      continue;
    }
    if (item === "sneakers") {
      const c = col(v, "#F2F2F2");
      s += `<path d="M${x - sx * 12},${y + 6} L${x - sx * 12},${y - 10} Q${x},${y - 14} ${x + sx * 6},${y - 6} Q${x + sx * 24},${y - 4} ${x + sx * 26},${y + 6} Z" fill="${c}" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>`;
      s += `<path d="M${x - sx * 12},${y + 3} L${x + sx * 26},${y + 3}" stroke="${shade(c === "#F2F2F2" ? "#E0453A" : c, 0.7)}" stroke-width="3"/>`;
      s += `<path d="M${x},${y - 8} l${sx * 6},4 M${x + sx * 4},${y - 10} l${sx * 6},4" stroke="${OL}" stroke-width="1.6"/>`;
    }
    if (item === "boots") {
      const c = col(v, "#6B4423");
      s += `<path d="M${x - sx * 13},${y + 6} L${x - sx * 13},${y - 40} L${x + sx * 11},${y - 40} L${x + sx * 11},${y - 8} Q${x + sx * 26},${y - 6} ${x + sx * 27},${y + 6} Z" fill="${c}" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>`;
      s += `<path d="M${x - sx * 13},${y - 34} L${x + sx * 11},${y - 34}" stroke="${shade(c, 0.7)}" stroke-width="3"/>`;
    }
    if (item === "sandals") {
      const c = col(v, "#8B5A2B");
      s += `<ellipse cx="${tx}" cy="${y + 2}" rx="17" ry="6" fill="${shade(c, 0.85)}" stroke="${OL}" stroke-width="2"/>`;
      s += `<ellipse cx="${tx}" cy="${y - 1}" rx="14" ry="6" fill="${skin}" stroke="${OL}" stroke-width="2"/>`;
      s += `<path d="M${tx - 9},${y - 4} L${tx - 4},${y + 2} M${tx + 2},${y - 6} L${tx + 7},${y + 1}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (item === "slippers") {
      const c = col(v, "#8DB3DA");
      s += `<ellipse cx="${tx}" cy="${y}" rx="18" ry="9" fill="${c}" stroke="${OL}" stroke-width="2.2"/>`;
      s += `<path d="M${tx + sx * 2},${y - 8} Q${tx + sx * 16},${y - 6} ${tx + sx * 16},${y + 2}" fill="none" stroke="${shade(c, 0.7)}" stroke-width="2.5"/>`;
    }
  }
  return s;
}
