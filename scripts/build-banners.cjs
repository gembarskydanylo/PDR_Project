// Банери для поширення застосунку (соцмережі, превʼю посилання, GitHub).
// Запуск: node scripts/build-banners.cjs
// Потрібен Playwright з Chromium: PW=/шлях/до/playwright node scripts/build-banners.cjs
// Результат: assets/banners/launch/{напрям}-{ширина}x{висота}.png
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets/banners/launch");
const svg = (rel) => "data:image/svg+xml;base64," + fs.readFileSync(path.join(ROOT, rel)).toString("base64");

const SIZES = [
  { name: "og", w: 1200, h: 630 },              // превʼю посилання (Facebook, Telegram, WhatsApp)
  { name: "github-social", w: 1280, h: 640 },   // GitHub → Settings → Social preview
  { name: "instagram-post", w: 1080, h: 1080 },
  { name: "instagram-story", w: 1080, h: 1920 },
  { name: "facebook-cover", w: 820, h: 312 }
];

const COPY = {
  brand: "ПДР Бельгії",
  title: "Готуйся до теорії українською",
  sub: "Іспит категорії B за правилами Бельгії, з поясненнями й посиланнями на Wegcode",
  facts: [["50", "питань на іспиті"], ["15 с", "на відповідь"], ["41/50", "щоб скласти"]],
  langs: "UK · NL · FR · EN",
  cta: "Почни безкоштовно",
  url: "gembarskydanylo.github.io/PDR_Project"
};

const THEMES = {
  minimal: {
    bg: "#F1F2F0", surface: "#FFFFFF", text: "#1E2227", mut: "#5E646B", line: "#DADBD6",
    accent: "#0B4F9C", accentInk: "#FFFFFF"
  },
  asphalt: {
    bg: "#1E2227", surface: "#2A2F35", text: "#F1F2F0", mut: "#B4BAC0", line: "#3A4047",
    accent: "#78AEEF", accentInk: "#0E1520"
  }
};

function visual(direction) {
  if (direction === "asphalt") {
    return `<div class="scene"><img src="${svg("assets/scenes/roundabout-yield.svg")}" alt=""></div>`;
  }
  return `<div class="signs">
    <img class="s-main" src="${svg("assets/signs/B9.svg")}" alt="">
    <img class="s-a" src="${svg("assets/signs/B1.svg")}" alt="">
    <img class="s-b" src="${svg("assets/signs/B5.svg")}" alt="">
    <img class="s-c" src="${svg("assets/signs/C43.svg")}" alt="">
    <img class="s-d" src="${svg("assets/signs/D5.svg")}" alt="">
  </div>`;
}

function page(direction, { w, h, name }) {
  const c = THEMES[direction];
  const layout = name === "facebook-cover" ? "cover" : w / h > 1.4 ? "wide" : w / h > 0.8 ? "square" : "tall";
  const u = layout === "wide" ? h / 70 : layout === "cover" ? h / 52 : w / 100; // базова одиниця
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
  body{background:${c.bg};color:${c.text};font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{position:relative;width:100%;height:100%;display:grid;gap:${4 * u}px;padding:${7 * u}px}
  .wrap.wide{grid-template-columns:1.2fr .8fr;align-items:center;padding:${6 * u}px ${7 * u}px}
  .wrap.cover{grid-template-columns:1.25fr .75fr;align-items:center;padding:${4 * u}px ${6 * u}px ${4 * u}px ${12 * u}px}
  .wrap.square{grid-template-rows:auto auto auto minmax(0,1fr) auto;row-gap:${2.6 * u}px;padding:${7 * u}px ${8 * u}px ${10 * u}px}
  .square .text{display:contents}
  .square .brand{order:1}.square h1{order:2;margin-top:0}.square .foot{order:3;margin-top:0}.square .signs,.square .scene{order:4}.square .facts{order:5;margin-top:0;justify-content:center}.square .url{order:6}
  .wrap.tall{grid-template-rows:auto minmax(0,1fr);padding:${12 * u}px ${8 * u}px ${14 * u}px}
  .brand{display:flex;align-items:center;gap:${1.6 * u}px;font-weight:700;font-size:${2.6 * u}px;letter-spacing:-.01em}
  .brand img{width:${4.6 * u}px;height:${4.6 * u}px}
  h1{font-size:${6 * u}px;line-height:1.05;letter-spacing:-.03em;font-weight:800;margin-top:${3 * u}px;max-width:15ch}
  .sub{font-size:${2.3 * u}px;line-height:1.35;color:${c.mut};margin-top:${2 * u}px;max-width:38ch}
  .facts{display:flex;gap:${1.4 * u}px;margin-top:${3.4 * u}px}
  .fact{background:${c.surface};border:1px solid ${c.line};border-radius:${1.4 * u}px;padding:${1.4 * u}px ${1.8 * u}px;min-width:${13 * u}px}
  .fact b{display:block;font-size:${3.6 * u}px;letter-spacing:-.02em;line-height:1.1}
  .fact span{font-size:${1.6 * u}px;color:${c.mut}}
  .foot{display:flex;align-items:center;gap:${2.4 * u}px;margin-top:${3.6 * u}px;flex-wrap:wrap}
  .cta{background:${c.accent};color:${c.accentInk};font-weight:700;font-size:${2.4 * u}px;border-radius:${1.2 * u}px;padding:${1.5 * u}px ${2.8 * u}px}
  .langs{font-weight:700;font-size:${2 * u}px;color:${c.mut};letter-spacing:.06em}
  .url{font-size:${1.7 * u}px;color:${c.mut};margin-top:${2 * u}px}
  .signs{position:relative;width:100%;aspect-ratio:1/1;max-height:100%;justify-self:center;align-self:center}
  .signs img{position:absolute;filter:drop-shadow(0 ${0.4 * u}px ${0.8 * u}px rgba(0,0,0,.14))}
  .s-main{width:54%;left:23%;top:20%}
  .s-a{width:24%;left:2%;top:4%}
  .s-b{width:22%;right:4%;top:2%}
  .s-c{width:24%;left:4%;bottom:6%}
  .s-d{width:22%;right:2%;bottom:10%}
  .scene{align-self:center;justify-self:stretch;border-radius:${2 * u}px;overflow:hidden;border:1px solid ${c.line};box-shadow:0 ${1 * u}px ${3 * u}px rgba(0,0,0,.35)}
  .scene img{display:block;width:100%;height:auto}
  /* компактні макети */
  .cover h1{font-size:${4.4 * u}px;margin-top:${1.6 * u}px}
  .cover .sub,.cover .facts{display:none}
  .cover .foot{margin-top:${2.4 * u}px}
  .cover .signs{width:86%}
  .square h1,.tall h1{font-size:${8.4 * u}px}
  .square .sub,.tall .sub{font-size:${3 * u}px}
  .square .fact b,.tall .fact b{font-size:${4.6 * u}px}
  .square .fact span,.tall .fact span{font-size:${2.1 * u}px}
  .square .cta,.tall .cta{font-size:${3.2 * u}px}
  .square .langs,.tall .langs{font-size:${2.6 * u}px}
  .square .brand,.tall .brand{font-size:${3.6 * u}px}
  .square .brand img,.tall .brand img{width:${6 * u}px;height:${6 * u}px}
  .square .scene{margin-top:${1 * u}px}
  .tall h1{margin-top:${6 * u}px}
  .tall .facts{flex-direction:column;margin-top:${5 * u}px}
  .tall .foot{margin-top:${6 * u}px}
  .square .url,.tall .url{position:absolute;font-size:${2.2 * u}px;left:0;right:0;text-align:center;bottom:${3.4 * u}px;margin:0}
  .wide h1{font-size:${6.6 * u}px;max-width:17ch}
  .cover .url{display:none}
  .square .sub{display:none}
  .square .signs,.tall .signs{width:auto;height:100%;max-width:100%}
  .square .scene,.tall .scene{justify-self:center;width:auto;height:auto;max-height:100%;max-width:100%;aspect-ratio:400/260}
  .square .scene img,.tall .scene img{width:100%;height:100%}
  </style></head><body>
  <div class="wrap ${layout}">
    <div class="text">
      <div class="brand"><img src="${svg("assets/signs/B9.svg")}" alt="">${COPY.brand}</div>
      <h1>${COPY.title}</h1>
      <p class="sub">${COPY.sub}</p>
      <div class="facts">${COPY.facts.map(([b, s]) => `<div class="fact"><b>${b}</b><span>${s}</span></div>`).join("")}</div>
      <div class="foot"><span class="cta">${COPY.cta}</span><span class="langs">${COPY.langs}</span></div>
      <div class="url">${COPY.url}</div>
    </div>
    ${visual(direction)}
  </div></body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  for (const direction of Object.keys(THEMES)) {
    for (const size of SIZES) {
      const p = await browser.newPage({ viewport: { width: size.w, height: size.h } });
      await p.setContent(page(direction, size), { waitUntil: "load" });
      await p.evaluate(() => document.fonts.ready);
      // Перевірка: жоден текст не виходить за межі полотна
      const overflow = await p.evaluate(() => [...document.querySelectorAll(".text *, .url")].some((e) => {
        const r = e.getBoundingClientRect();
        return r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5 || r.left < -0.5;
      }));
      const file = path.join(OUT, `${direction}-${size.name}-${size.w}x${size.h}.png`);
      await p.screenshot({ path: file });
      console.log(`${overflow ? "⚠ ПЕРЕПОВНЕННЯ" : "✓"} ${path.relative(ROOT, file)} ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
      await p.close();
    }
  }
  await browser.close();
})();
