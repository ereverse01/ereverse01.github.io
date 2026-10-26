// 강화 카드 10장 — 문제 상황 + 그림(SVG, 320×200)
const CATS = {
  A: { name: "학교생활", color: "#3b6fd8", bg: "#e6eefc" },
  B: { name: "가정·개인", color: "#d9822b", bg: "#fdf0e1" },
  C: { name: "사회·공동체", color: "#2e7d5b", bg: "#e3f5ea" },
};

// 공용 조각
const face = (x, y, r, skin, mouth) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin || "#f6c9a0"}"/>` +
  `<circle cx="${x - r * 0.35}" cy="${y - r * 0.1}" r="${r * 0.11}" fill="#3a2e28"/>` +
  `<circle cx="${x + r * 0.35}" cy="${y - r * 0.1}" r="${r * 0.11}" fill="#3a2e28"/>` +
  (mouth === "flat" ? `<line x1="${x - r * 0.3}" y1="${y + r * 0.4}" x2="${x + r * 0.3}" y2="${y + r * 0.4}" stroke="#3a2e28" stroke-width="2" stroke-linecap="round"/>`
   : mouth === "sad" ? `<path d="M${x - r * 0.3} ${y + r * 0.5} q${r * 0.3} -${r * 0.3} ${r * 0.6} 0" fill="none" stroke="#3a2e28" stroke-width="2" stroke-linecap="round"/>`
   : `<path d="M${x - r * 0.3} ${y + r * 0.3} q${r * 0.3} ${r * 0.35} ${r * 0.6} 0" fill="none" stroke="#3a2e28" stroke-width="2" stroke-linecap="round"/>`);
const hair = (x, y, r, c) => `<path d="M${x - r} ${y} a${r} ${r} 0 0 1 ${r * 2} 0 q-${r} -${r * 0.45} -${r * 2} 0z" fill="${c}"/>`;
const person = (x, y, shirt, mouth, hc) =>
  `<rect x="${x - 15}" y="${y + 14}" width="30" height="34" rx="12" fill="${shirt}"/>` + face(x, y, 15, null, mouth) + hair(x, y - 3, 15, hc || "#3a2e28");

const SVG = {
  1: `
    <rect width="320" height="200" fill="#eef2f7"/>
    <rect x="70" y="16" width="180" height="62" rx="4" fill="#2f5d4a" stroke="#8a6a44" stroke-width="5"/>
    <text x="160" y="58" text-anchor="middle" font-size="30" font-weight="700" fill="#fff" font-family="sans-serif">What is…?</text>
    ${person(36, 70, "#7c5cbf", "", "#5a3d2b")}
    <path d="M52 92 l14 -18" stroke="#f6c9a0" stroke-width="6" stroke-linecap="round"/>
    <rect x="48" y="40" width="32" height="20" rx="8" fill="#fff" stroke="#aab"/><text x="64" y="55" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#556">?</text>
    ${[70, 130, 190, 250].map((x, i) => person(x, 132, ["#e57373", "#4fa3d8", "#f2b134", "#6cbf84"][i], "flat"))}
    <rect x="40" y="168" width="250" height="14" rx="3" fill="#b98a5a"/>
    ${[70, 130, 190, 250].map(x => `<text x="${x + 18}" y="114" font-size="16" fill="#8890a0" font-family="sans-serif">…</text>`).join("")}
    <text x="290" y="128" font-size="22">😰</text>`,

  2: `
    <rect width="320" height="200" fill="#fbf3e6"/>
    <rect x="0" y="150" width="320" height="50" fill="#d8c3a5"/>
    <rect x="30" y="98" width="260" height="16" rx="4" fill="#c58b52"/>
    <rect x="50" y="114" width="10" height="50" fill="#9c6a3b"/><rect x="260" y="114" width="10" height="50" fill="#9c6a3b"/>
    <rect x="48" y="84" width="70" height="14" rx="3" fill="#9fb4c7"/>
    <rect x="150" y="84" width="70" height="14" rx="3" fill="#9fb4c7"/>
    <path d="M128 92 q8 -14 18 -4 q6 -10 12 2 l-4 6z" fill="#ddd" stroke="#999"/>
    <rect x="234" y="70" width="14" height="28" rx="3" fill="#e05252"/><rect x="234" y="76" width="14" height="6" fill="#fff"/>
    <path d="M72 80 q10 -20 22 -2" fill="#f4d03f" stroke="#c9a400" stroke-width="2"/>
    <circle cx="190" cy="172" r="9" fill="#eee" stroke="#aaa"/><circle cx="215" cy="180" r="6" fill="#f0e0c0" stroke="#bba"/>
    <path d="M90 168 l16 6 l-4 10 l-16 -4z" fill="#f7f7f7" stroke="#aaa"/>
    <text x="20" y="40" font-size="22">🍌</text><text x="268" y="44" font-size="24">🪰</text>
    <text x="160" y="40" text-anchor="middle" font-size="18" font-weight="700" fill="#b05a2a" font-family="sans-serif">After lunch…</text>`,

  3: `
    <rect width="320" height="200" fill="#f3eefb"/>
    <circle cx="80" cy="90" r="52" fill="#fff" stroke="#5b4a8a" stroke-width="6"/>
    <line x1="80" y1="90" x2="80" y2="54" stroke="#333" stroke-width="5" stroke-linecap="round"/>
    <line x1="80" y1="90" x2="108" y2="100" stroke="#e05252" stroke-width="4" stroke-linecap="round"/>
    <circle cx="80" cy="90" r="4" fill="#333"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${170 + i * 6}" y="${118 - i * 14}" width="100" height="62" rx="3" fill="#fff" stroke="#aaa" transform="rotate(${i * 3 - 4} ${220} ${150})"/>`).join("")}
    <text x="222" y="110" font-size="14" fill="#777" font-family="sans-serif" text-anchor="middle">HOMEWORK</text>
    <g transform="rotate(-14 230 140)"><rect x="186" y="122" width="96" height="34" rx="5" fill="none" stroke="#e05252" stroke-width="4"/>
    <text x="234" y="148" text-anchor="middle" font-size="24" font-weight="800" fill="#e05252" font-family="sans-serif">LATE</text></g>
    <text x="80" y="178" text-anchor="middle" font-size="16" font-weight="700" fill="#5b4a8a" font-family="sans-serif">every week</text>`,

  4: `
    <rect width="320" height="200" fill="#f4efe6"/>
    ${[0, 1].map(s => `<rect x="${14 + s * 236}" y="20" width="70" height="140" fill="#8a5a36"/>` +
      [0, 1, 2, 3].map(r => `<rect x="${18 + s * 236}" y="${26 + r * 34}" width="62" height="4" fill="#6b4226"/>` +
        [0, 1, 2, 3, 4, 5].map(b => `<rect x="${20 + s * 236 + b * 10}" y="${30 + r * 34}" width="8" height="26" fill="${["#e57373", "#4fa3d8", "#f2b134", "#6cbf84", "#9b7ed1", "#f08a5d"][(b + r + s) % 6]}"/>`).join("")).join("")).join("")}
    <rect x="104" y="120" width="112" height="12" rx="3" fill="#c58b52"/>
    <rect x="112" y="132" width="8" height="34" fill="#9c6a3b"/><rect x="200" y="132" width="8" height="34" fill="#9c6a3b"/>
    ${[110, 146, 182].map(x => `<rect x="${x}" y="146" width="26" height="8" rx="2" fill="#7a9cc6"/><rect x="${x + 2}" y="154" width="4" height="16" fill="#5a7ca6"/><rect x="${x + 20}" y="154" width="4" height="16" fill="#5a7ca6"/><rect x="${x}" y="118" width="4" height="30" fill="#7a9cc6" opacity=".0"/>`).join("")}
    <circle cx="160" cy="56" r="26" fill="#fff" stroke="#555" stroke-width="4"/>
    <line x1="160" y1="56" x2="160" y2="36" stroke="#333" stroke-width="3"/><line x1="160" y1="56" x2="160" y2="76" stroke="#333" stroke-width="3" transform="rotate(15 160 56)"/>
    <text x="160" y="104" text-anchor="middle" font-size="14" font-weight="700" fill="#8a6a44" font-family="sans-serif">Lunch break</text>
    <text x="226" y="112" font-size="18">🕸️</text>`,

  5: `
    <rect width="320" height="200" fill="#1f2547"/>
    <circle cx="270" cy="38" r="18" fill="#f6e7a1"/><circle cx="279" cy="32" r="16" fill="#1f2547"/>
    ${[[40, 30], [90, 18], [200, 26], [150, 44], [240, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join("")}
    <rect x="30" y="122" width="230" height="44" rx="6" fill="#5d6aa8"/>
    <rect x="30" y="104" width="44" height="28" rx="8" fill="#e8e8f5"/>
    <rect x="66" y="112" width="190" height="30" rx="10" fill="#8f9ad6"/>
    <path d="M44 110 q30 -70 70 -10" fill="#7fc8f8" opacity=".25"/>
    ${face(56, 100, 16, null, "flat")}${hair(56, 97, 16, "#2a1d16")}
    <circle cx="50" cy="98" r="6" fill="none" stroke="#c0392b" stroke-width="1.5" opacity=".7"/><circle cx="62" cy="98" r="6" fill="none" stroke="#c0392b" stroke-width="1.5" opacity=".7"/>
    <rect x="80" y="74" width="20" height="34" rx="4" fill="#222" stroke="#7fc8f8" stroke-width="2"/><rect x="83" y="78" width="14" height="24" fill="#7fc8f8"/>
    <rect x="200" y="62" width="70" height="30" rx="5" fill="#111"/><text x="235" y="84" text-anchor="middle" font-size="20" font-weight="700" fill="#ff5a5a" font-family="monospace">2:00</text>
    <text x="150" y="190" text-anchor="middle" font-size="13" fill="#c8cdf0" font-family="sans-serif">Jiwoo</text>`,

  6: `
    <rect width="320" height="200" fill="#fff5e6"/>
    <rect x="0" y="140" width="320" height="60" fill="#e8c99b"/>
    <rect x="210" y="70" width="96" height="70" rx="6" fill="#7fb3e0"/><rect x="214" y="60" width="30" height="18" rx="5" fill="#fff"/>
    ${person(150, 96, "#f2b134", "", "#3a2e28")}
    <text x="176" y="84" font-size="16">😜</text>
    <rect x="20" y="150" width="22" height="22" fill="#e57373"/><rect x="44" y="160" width="22" height="22" fill="#4fa3d8"/><rect x="32" y="138" width="22" height="22" fill="#6cbf84"/>
    <path d="M90 172 l26 -10 l10 14 l-26 8z" fill="#9b7ed1"/>
    <circle cx="250" cy="170" r="12" fill="#f08a5d"/><path d="M238 170 h24 M250 158 v24" stroke="#fff" stroke-width="2"/>
    <path d="M150 168 q20 -14 40 0 l-6 10 h-28z" fill="#5d9cec"/>
    <path d="M60 110 l20 -6 l4 12 l-20 6z" fill="#ffd166"/>
    <text x="20" y="40" font-size="24">🧸</text><text x="270" y="190" font-size="20">🧦</text><text x="110" y="148" font-size="18">🚗</text>
    <text x="96" y="36" font-size="15" font-weight="700" fill="#b05a2a" font-family="sans-serif">8-year-old brother</text>`,

  7: `
    <rect width="320" height="200" fill="#eef6f1"/>
    <rect x="200" y="40" width="100" height="66" rx="4" fill="#222"/><rect x="206" y="46" width="88" height="54" fill="#5ac8fa"/>
    <text x="250" y="80" text-anchor="middle" font-size="22">👾</text><rect x="244" y="106" width="12" height="14" fill="#333"/>
    <rect x="30" y="110" width="150" height="50" rx="12" fill="#c0504d"/><rect x="30" y="84" width="150" height="34" rx="12" fill="#d9665f"/>
    ${person(104, 90, "#4fa3d8", "", "#2a1d16")}
    <rect x="94" y="124" width="26" height="12" rx="5" fill="#333"/><circle cx="100" cy="130" r="2" fill="#e05252"/><circle cx="114" cy="130" r="2" fill="#5ac8fa"/>
    <g opacity=".75"><rect x="200" y="160" width="46" height="8" rx="3" fill="#777"/><rect x="194" y="152" width="10" height="24" rx="3" fill="#555"/><rect x="242" y="152" width="10" height="24" rx="3" fill="#555"/></g>
    <text x="262" y="180" font-size="22">👟</text>
    <path d="M200 148 q6 -6 12 0 M222 146 q6 -6 12 0" stroke="#aaa" stroke-width="2" fill="none"/>
    <text x="40" y="190" font-size="13" fill="#2e7d5b" font-family="sans-serif">Hyunwoo: "I'll exercise… tomorrow."</text>`,

  8: `
    <rect width="320" height="200" fill="#eaf4ec"/>
    <rect x="20" y="10" width="70" height="120" fill="#c9d3dd"/><rect x="230" y="20" width="76" height="110" fill="#c9d3dd"/>
    ${[0, 1, 2, 3, 4].map(r => [0, 1].map(c => `<rect x="${30 + c * 30}" y="${20 + r * 22}" width="18" height="12" fill="#f7f1c9"/><rect x="${240 + c * 32}" y="${30 + r * 20}" width="18" height="12" fill="#f7f1c9"/>`).join("")).join("")}
    ${[["#3b6fd8", "PLASTIC"], ["#6cbf84", "PAPER"], ["#f2b134", "CAN"]].map(([c, t], i) =>
      `<rect x="${92 + i * 48}" y="110" width="42" height="56" rx="4" fill="${c}"/><rect x="${88 + i * 48}" y="102" width="50" height="10" rx="3" fill="${c}" opacity=".8"/><text x="${113 + i * 48}" y="142" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="sans-serif">${t}</text>`).join("")}
    <rect x="96" y="88" width="10" height="20" rx="2" fill="#e05252" transform="rotate(-20 100 98)"/>
    <rect x="112" y="84" width="20" height="16" fill="#d9b98a"/>
    <path d="M150 86 q8 -12 16 0 v14 h-16z" fill="#bfe3f5" stroke="#7aa"/>
    <path d="M60 176 q30 -24 70 -4 q40 -16 70 4 q40 -20 70 6 l-4 18 h-200z" fill="#9c8b74"/>
    <rect x="80" y="166" width="12" height="18" fill="#e05252"/><rect x="146" y="164" width="22" height="14" fill="#d9b98a"/><path d="M210 170 q6 -10 12 0 v12 h-12z" fill="#bfe3f5"/>
    <text x="250" y="160" font-size="22">❓</text>`,

  9: `
    <rect width="320" height="200" fill="#e9f1fa"/>
    <rect x="0" y="168" width="320" height="32" fill="#7d8590"/><rect x="20" y="182" width="40" height="4" fill="#fff"/><rect x="140" y="182" width="40" height="4" fill="#fff"/><rect x="260" y="182" width="40" height="4" fill="#fff"/>
    <path d="M30 140 q0 -30 40 -34 l40 -38 h110 l40 38 q30 4 30 34 v14 h-260z" fill="#e05252"/>
    <path d="M118 74 h46 v34 h-80z" fill="#cfe8fb"/><path d="M172 74 h44 l34 34 h-78z" fill="#cfe8fb"/>
    ${face(140, 92, 11, null, "")}${hair(140, 90, 11, "#3a2e28")}
    ${face(206, 92, 11, null, "")}${hair(206, 90, 11, "#7a4b2a")}
    <line x1="132" y1="84" x2="150" y2="108" stroke="#444" stroke-width="3"/>
    <circle cx="90" cy="154" r="18" fill="#333"/><circle cx="90" cy="154" r="8" fill="#bbb"/><circle cx="240" cy="154" r="18" fill="#333"/><circle cx="240" cy="154" r="8" fill="#bbb"/>
    <circle cx="276" cy="40" r="22" fill="#fff" stroke="#e05252" stroke-width="4"/>
    <text x="276" y="48" text-anchor="middle" font-size="22">💺</text>
    <line x1="260" y1="24" x2="292" y2="56" stroke="#e05252" stroke-width="4"/>
    <text x="40" y="40" font-size="13" fill="#3b4a5a" font-family="sans-serif">back seat</text>
    <path d="M100 44 q60 0 96 32" stroke="#3b4a5a" stroke-width="2" fill="none" marker-end="url(#ah)"/>
    <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#3b4a5a"/></marker></defs>`,

  10: `
    <rect width="320" height="200" fill="#f6efe7"/>
    <rect x="0" y="120" width="320" height="80" fill="#7a5134"/><rect x="0" y="114" width="320" height="10" fill="#9c6a45"/>
    <rect x="16" y="14" width="120" height="60" rx="6" fill="#3e2c22"/><text x="76" y="38" text-anchor="middle" font-size="13" fill="#f6e7c1" font-family="sans-serif">CAFÉ MENU</text>
    <text x="76" y="58" text-anchor="middle" font-size="11" fill="#d9c7a0" font-family="sans-serif">Iced Latte · 4.5</text>
    ${[0, 1, 2, 3, 4, 5].map(i => `<g transform="translate(${150 + (i % 3) * 36} ${i < 3 ? 70 : 30})"><path d="M0 0 h28 l-4 44 h-20z" fill="#dff2fb" stroke="#9ccbe0" stroke-width="2"/><rect x="-2" y="-6" width="32" height="7" rx="2" fill="#fff" stroke="#9ccbe0"/><line x1="18" y1="-6" x2="24" y2="-22" stroke="#4fa3d8" stroke-width="3"/><rect x="2" y="16" width="24" height="24" fill="#c8a27a" opacity=".7"/></g>`).join("")}
    <g transform="translate(40 80)"><rect width="28" height="40" rx="6" fill="#6cbf84"/><rect x="2" y="-8" width="24" height="10" rx="3" fill="#2e7d5b"/></g>
    <text x="76" y="110" font-size="18">😢</text>
    <text x="54" y="150" text-anchor="middle" font-size="12" fill="#f6e7c1" font-family="sans-serif">tumbler</text>
    <text x="204" y="150" text-anchor="middle" font-size="12" fill="#f6e7c1" font-family="sans-serif">plastic cups</text>`,
};

const CARDS = [
  { id: 1, cat: "A", title: "Silent Classroom", text: "Students rarely answer questions in English class. They are afraid of making mistakes.", goal: "Students answer questions in English class." },
  { id: 2, cat: "A", title: "Messy Lunchroom", text: "Many students leave trash on the tables after lunch.", goal: "Students clean their tables after lunch." },
  { id: 3, cat: "A", title: "Late Homework", text: "Half of the class submits homework late every week.", goal: "Students submit homework on time." },
  { id: 4, cat: "A", title: "Empty Library", text: "The school library is almost empty during lunch break.", goal: "Students visit the library during lunch break." },
  { id: 5, cat: "B", title: "Late-Night Phone", text: "Jiwoo uses her phone until 2 a.m. and is always tired in the morning.", goal: "Jiwoo puts her phone away and goes to bed early." },
  { id: 6, cat: "B", title: "Little Brother’s Room", text: "Your 8-year-old brother never cleans his room.", goal: "Your brother cleans his room." },
  { id: 7, cat: "B", title: "No Exercise", text: "Hyunwoo wants to exercise, but he always stays home and plays games.", goal: "Hyunwoo exercises regularly." },
  { id: 8, cat: "C", title: "Recycling Problem", text: "People in an apartment complex don’t separate their recycling.", goal: "Residents separate their recycling." },
  { id: 9, cat: "C", title: "Seatbelts in the Back", text: "Many passengers don’t wear seatbelts in the back seat of cars.", goal: "Back-seat passengers wear seatbelts." },
  { id: 10, cat: "C", title: "Plastic Cups", text: "Customers at a café rarely bring their own tumblers.", goal: "Customers bring their own tumblers." },
];
CARDS.forEach(c => c.svg = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.title}">${SVG[c.id]}</svg>`);
