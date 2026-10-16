"use strict";

// ===== State =====
window.currentLang = "uk";
let view = "home";    // home | topics | exam | mistakes | settings
let topics = [];      // з data/topics.json
let questions = [];   // з data/questions.json (лише status: published)
let quiz = null;      // { ids, i, correct, answered, label, restart, done }

const EXAM_SIZE = 50;
const PRACTICE_SIZE = 20;
const THEMES = ["auto", "light", "dark"];
const KEYS = "ABCDEFG";

const $ = (id) => document.getElementById(id);

// Лінійні іконки (stroke = currentColor).
const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  topics: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
  exam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  mistakes: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  shuffle: '<path d="M16 4h4v4M4 19 20 4M20 16v4h-4M14.5 14.5 20 20M4 5l5 5"/>'
};

function icon(name) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("fill", "none");
  s.setAttribute("stroke", "currentColor");
  s.setAttribute("stroke-width", "1.8");
  s.setAttribute("stroke-linecap", "round");
  s.setAttribute("stroke-linejoin", "round");
  s.setAttribute("aria-hidden", "true");
  s.innerHTML = ICON_PATHS[name];
  return s;
}

// ===== Helpers =====
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function button(cls, content, onClick) {
  const b = el("button", cls);
  b.type = "button";
  if (typeof content === "string") b.textContent = content;
  else if (content) b.append(...[].concat(content));
  b.addEventListener("click", onClick);
  return b;
}

function img(src, cls) {
  const i = el("img", cls);
  i.src = src;
  i.alt = "";
  i.decoding = "async";
  return i;
}

const signSrc = (code) => `assets/signs/${code}.svg`;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Питання, що стосуються обраного регіону (федеральні діють скрізь).
function visibleQuestions() {
  const region = Progress.get().region;
  if (region === "all") return questions;
  return questions.filter((q) => q.region.includes("federal") || q.region.includes(region));
}

const questionsOfTopic = (topicId) => visibleQuestions().filter((q) => q.topic_id === topicId);
const idsOfTopic = (topicId) => questionsOfTopic(topicId).map((q) => q.id);
const byId = (id) => questions.find((q) => q.id === id);

function go(newView) {
  view = newView;
  quiz = null;
  render();
  window.scrollTo(0, 0);
}

// ===== Init =====
async function init() {
  window.currentLang = Progress.load().language || "uk";
  $("uiLangPicker").value = window.currentLang;
  applyTheme(readTheme());
  $("settingsBtn").append(icon("settings"));
  $("backBtn").append(icon("close"));
  setupListeners();

  try {
    const [tRes, qRes] = await Promise.all([fetch("data/topics.json"), fetch("data/questions.json")]);
    topics = await tRes.json();
    questions = (await qRes.json()).filter((q) => (q.status || "published") === "published");
  } catch (e) {
    console.error("Failed to load data", e);
  }
  render();
}

// ===== Theme =====
function readTheme() {
  try {
    const saved = localStorage.getItem("pdr_theme");
    return THEMES.includes(saved) ? saved : "auto";
  } catch (e) {
    return "auto";
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("pdr_theme", theme); } catch (e) {}
  requestAnimationFrame(() => {
    const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
    document.querySelector('meta[name="theme-color"]').content = surface || "#FFFFFF";
  });
}

// ===== Chrome (top bar + tab bar) =====
function renderChrome() {
  const inQuiz = Boolean(quiz);
  document.body.classList.toggle("in-quiz", inQuiz);
  $("brand").hidden = inQuiz;
  $("settingsBtn").hidden = inQuiz;
  $("quizProgress").hidden = !inQuiz || quiz.done;
  $("backBtn").hidden = !inQuiz;
  $("backBtn").setAttribute("aria-label", t("close"));
  $("settingsBtn").setAttribute("aria-label", t("modes.settings"));
  $("appTitle").textContent = t("app_title");
  document.documentElement.lang = window.currentLang;
  document.title = t("app_title");

  const bar = $("tabbar");
  bar.replaceChildren();
  ["home", "topics", "exam", "mistakes"].forEach((m) => {
    const b = button("", [icon(m), el("span", "", t("modes." + m))], () => go(m));
    if (m === view) b.setAttribute("aria-current", "page");
    if (m === "mistakes") {
      const n = Progress.getMistakes().filter(byId).length;
      if (n) b.appendChild(el("span", "count", String(n)));
    }
    bar.appendChild(b);
  });
}

function setBar(percent) {
  $("barfill").style.width = percent + "%";
  document.querySelector(".bar").setAttribute("aria-valuenow", String(Math.round(percent)));
}

function render() {
  renderChrome();
  if (quiz) return quiz.done ? renderResult() : renderQuestion();
  switch (view) {
    case "topics": return renderTopics();
    case "exam": return renderExam();
    case "mistakes": return renderMistakes();
    case "settings": return renderSettings();
    default: return renderHome();
  }
}

function screen() {
  const v = $("view");
  v.replaceChildren();
  return v;
}

// ===== Screens =====
function topicRow(topic) {
  const ids = idsOfTopic(topic.id);
  const pct = Progress.topicPercent(ids);
  const row = button("row-link", null, () => startTopic(topic.id));
  row.appendChild(img(signSrc(topic.icon), "sign"));
  const mid = el("div");
  mid.appendChild(el("div", "row-title", tr(topic.name)));
  mid.appendChild(el("div", "row-sub", plural("questions", ids.length)));
  if (ids.length) {
    const m = el("div", "meter");
    const fill = el("i");
    fill.style.width = pct + "%";
    m.appendChild(fill);
    mid.appendChild(m);
  } else {
    row.setAttribute("aria-disabled", "true");
  }
  row.appendChild(mid);
  row.appendChild(el("span", "row-end", ids.length ? pct + "%" : ""));
  return row;
}

function actionRow(glyph, title, sub, end, onClick) {
  const row = button("row-link", null, onClick);
  const g = el("span", "glyph");
  g.appendChild(icon(glyph));
  row.appendChild(g);
  const mid = el("div");
  mid.appendChild(el("div", "row-title", title));
  mid.appendChild(el("div", "row-sub", sub));
  row.appendChild(mid);
  const e = el("span", "row-end");
  if (end) e.textContent = end;
  else e.appendChild(icon("chevron"));
  row.appendChild(e);
  return row;
}

function nextTopic() {
  const withQ = topics.filter((tp) => idsOfTopic(tp.id).length);
  return withQ.find((tp) => Progress.topicPercent(idsOfTopic(tp.id)) < 100) || withQ[0];
}

function renderHome() {
  const v = screen();
  v.appendChild(el("h1", "", t("home_title")));

  const tp = nextTopic();
  if (tp) {
    const ids = idsOfTopic(tp.id);
    const pct = Progress.topicPercent(ids);
    const box = el("section", "panel continue");
    box.appendChild(img(signSrc(tp.icon), "sign"));
    const info = el("div");
    info.appendChild(el("div", "muted small", t("continue_label")));
    info.appendChild(el("h2", "", tr(tp.name)));
    const m = el("div", "meter");
    const fill = el("i");
    fill.style.width = pct + "%";
    m.appendChild(fill);
    info.appendChild(m);
    box.appendChild(info);
    box.appendChild(button("btn primary", pct ? t("continue_btn") : t("start_btn"), () => startTopic(tp.id)));
    v.appendChild(box);
  }

  const p = Progress.get();
  const stats = el("section", "stats");
  [
    [p.totalCorrect, t("stat_correct")],
    [p.totalAnswered, t("stat_answered")],
    [`${learnedTopicsCount()}/${topics.length}`, t("stat_topics")]
  ].forEach(([n, label]) => {
    const d = el("div");
    d.appendChild(el("b", "", String(n)));
    d.appendChild(el("span", "", label));
    stats.appendChild(d);
  });
  v.appendChild(stats);

  const list = el("section", "list");
  list.appendChild(actionRow("shuffle", t("practice_title"), t("practice_desc"), null, startPractice));
  const mistakes = Progress.getMistakes().filter(byId).length;
  list.appendChild(actionRow("mistakes", t("modes.mistakes"), t("mistakes_desc"), mistakes ? String(mistakes) : null, () => go("mistakes")));
  list.appendChild(actionRow("exam", t("exam_title"), t("exam_desc_short"), null, () => go("exam")));
  v.appendChild(list);
}

function learnedTopicsCount() {
  return topics.filter((tp) => {
    const ids = idsOfTopic(tp.id);
    return ids.length > 0 && Progress.topicPercent(ids) === 100;
  }).length;
}

function renderTopics() {
  const v = screen();
  v.appendChild(el("h1", "", t("topics_title")));
  const list = el("section", "list");
  topics.forEach((tp) => list.appendChild(topicRow(tp)));
  v.appendChild(list);
}

function renderExam() {
  const v = screen();
  v.appendChild(el("h1", "", t("exam_title")));
  const rules = el("section", "rules");
  [["50", t("exam_rules.q")], ["15", t("exam_rules.t")], ["41/50", t("exam_rules.pass")], ["−5", t("exam_rules.serious")]]
    .forEach(([n, label]) => {
      const d = el("div");
      d.appendChild(el("b", "", n));
      d.appendChild(el("span", "", label));
      rules.appendChild(d);
    });
  v.appendChild(rules);
  v.appendChild(el("p", "muted", t("exam_note")));
  const n = visibleQuestions().length;
  if (n < EXAM_SIZE) {
    v.appendChild(el("p", "notice", t("exam_not_ready", { n })));
    v.appendChild(button("btn primary", t("practice_title"), startPractice));
  }
}

function renderMistakes() {
  const v = screen();
  v.appendChild(el("h1", "", t("modes.mistakes")));
  const ids = Progress.getMistakes().filter(byId);
  if (!ids.length) {
    const empty = el("section", "panel empty");
    empty.appendChild(img(signSrc("B9"), ""));
    empty.appendChild(el("h2", "", t("no_mistakes")));
    empty.appendChild(el("p", "muted", t("no_mistakes_desc")));
    v.appendChild(empty);
    return;
  }
  v.appendChild(button("btn primary", `${t("review_mistakes")} (${ids.length})`,
    () => startQuiz(shuffle(ids), t("modes.mistakes"), () => go("mistakes"))));
  const list = el("section", "list");
  ids.forEach((id) => {
    const q = byId(id);
    const row = button("row-link", null, () => startQuiz([id], t("modes.mistakes"), () => go("mistakes")));
    if (q.image?.includes("/signs/")) row.appendChild(img(q.image, "sign"));
    else {
      const g = el("span", "glyph");
      g.appendChild(icon("mistakes"));
      row.appendChild(g);
    }
    const mid = el("div");
    mid.appendChild(el("div", "row-title", tr(q.question)));
    const topic = topics.find((tp) => tp.id === q.topic_id);
    mid.appendChild(el("div", "row-sub", tr(topic?.name)));
    row.appendChild(mid);
    const end = el("span", "row-end");
    end.appendChild(icon("chevron"));
    row.appendChild(end);
    list.appendChild(row);
  });
  v.appendChild(list);
}

function segmented(options, current, onPick, cls = "") {
  const wrap = el("div", ("segmented " + cls).trim());
  options.forEach(([value, label]) => {
    const b = button("", label, () => onPick(value));
    b.setAttribute("aria-pressed", String(value === current));
    wrap.appendChild(b);
  });
  return wrap;
}

function renderSettings() {
  const v = screen();
  v.appendChild(el("h1", "", t("modes.settings")));
  const panel = el("section", "panel section");

  const lang = el("div", "field");
  lang.appendChild(el("label", "", t("language_label")));
  lang.appendChild(segmented([["uk", "Українська"], ["nl", "Nederlands"], ["fr", "Français"], ["en", "English"]], window.currentLang, setLanguage, "two-rows"));
  panel.appendChild(lang);

  const region = el("div", "field");
  region.appendChild(el("label", "", t("region_label")));
  region.appendChild(segmented(["all", "flanders", "brussels", "wallonia"].map((r) => [r, t("regions." + r)]),
    Progress.get().region, (r) => { Progress.setRegion(r); render(); }, "two-rows"));
  region.appendChild(el("p", "muted small", t("region_hint")));
  panel.appendChild(region);

  const theme = el("div", "field");
  theme.appendChild(el("label", "", t("theme_label")));
  theme.appendChild(segmented(THEMES.map((x) => [x, t("themes." + x)]), readTheme(), (x) => { applyTheme(x); render(); }));
  panel.appendChild(theme);
  v.appendChild(panel);

  v.appendChild(el("p", "muted small", t("local_note")));
  v.appendChild(button("btn danger", t("reset"), () => {
    if (confirm(t("reset_confirm"))) { Progress.reset(); render(); }
  }));
}

// ===== Quiz =====
function startTopic(topicId) {
  const ids = idsOfTopic(topicId);
  const topic = topics.find((tp) => tp.id === topicId);
  if (!ids.length) {
    view = "topics";
    quiz = null;
    renderChrome();
    const v = screen();
    v.appendChild(el("h1", "", tr(topic?.name)));
    const empty = el("section", "panel empty");
    empty.appendChild(img(signSrc(topic.icon), ""));
    empty.appendChild(el("p", "muted", t("topic_empty")));
    empty.appendChild(button("btn", t("back"), () => go("topics")));
    v.appendChild(empty);
    return;
  }
  startQuiz(shuffle(ids), tr(topic.name), () => startTopic(topicId));
}

function startPractice() {
  const ids = shuffle(visibleQuestions().map((q) => q.id)).slice(0, PRACTICE_SIZE);
  startQuiz(ids, t("practice_title"), startPractice);
}

function startQuiz(ids, label, restart) {
  if (!ids.length) return;
  quiz = { ids, i: 0, correct: 0, answered: false, label, restart, done: false };
  render();
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const q = byId(quiz.ids[quiz.i]);
  const n = quiz.ids.length;
  $("prog").textContent = `${quiz.label} — ${t("question_of", { i: quiz.i + 1, n })}`;
  setBar((quiz.i / n) * 100);

  const v = screen();
  if (q.image) {
    const fig = el("figure", "figure " + (q.image.includes("/signs/") ? "sign" : "scene"));
    fig.appendChild(img(q.image));
    v.appendChild(fig);
  }

  const regional = q.region.filter((r) => r !== "federal");
  if (regional.length) {
    const tags = el("div", "tags");
    regional.forEach((r) => tags.appendChild(el("span", "tag", t("regions." + r))));
    v.appendChild(tags);
  }

  v.appendChild(el("h1", "question", tr(q.question)));

  const opts = el("div", "opts");
  shuffle(q.options).forEach((o, idx) => {
    const b = button("opt", [el("span", "key", KEYS[idx]), el("span", "", tr(o.text))], () => answer(q, o.id));
    b.dataset.id = o.id;
    opts.appendChild(b);
  });
  v.appendChild(opts);
}

function answer(q, optionId) {
  if (quiz.answered) return;
  quiz.answered = true;
  const ok = optionId === q.correct_option_id;
  if (ok) quiz.correct += 1;
  Progress.recordAnswer(q.id, ok);

  document.querySelectorAll(".opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.id === q.correct_option_id) b.classList.add("correct");
    else if (b.dataset.id === optionId) b.classList.add("incorrect");
  });

  const box = el("section", "panel explain" + (ok ? " ok" : ""));
  box.appendChild(el("h2", "", ok ? t("correct") : t("wrong")));
  box.appendChild(el("p", "", tr(q.explanation)));
  if (q.source?.title) {
    const src = el("p", "source");
    src.appendChild(document.createTextNode(t("source") + ": "));
    const a = el("a", "", q.source.title);
    a.href = q.source.url || "#";
    a.target = "_blank";
    a.rel = "noopener";
    src.appendChild(a);
    box.appendChild(src);
  }
  const v = $("view");
  v.appendChild(box);

  const last = quiz.i === quiz.ids.length - 1;
  const next = button("btn primary next-btn", last ? t("finish") : t("next"), () => {
    if (last) quiz.done = true;
    else { quiz.i += 1; quiz.answered = false; }
    render();
    window.scrollTo(0, 0);
  });
  v.appendChild(next);
  next.focus({ preventScroll: true });
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderResult() {
  const { correct, ids, restart } = quiz;
  const n = ids.length;
  const good = correct / n >= 41 / 50;
  const v = screen();
  const box = el("section", "panel result");
  box.appendChild(el("h2", "muted", t("result_title")));
  box.appendChild(el("div", "score", `${correct}/${n}`));
  box.appendChild(el("p", "verdict " + (good ? "ok" : "bad"), good ? t("result_good") : t("result_more")));
  const actions = el("div", "actions");
  actions.appendChild(button("btn primary", t("retry"), restart));
  actions.appendChild(button("btn", t("to_home"), () => go("home")));
  box.appendChild(actions);
  v.appendChild(box);
}

// ===== Listeners =====
function setLanguage(lang) {
  window.currentLang = lang;
  $("uiLangPicker").value = lang;
  Progress.setLanguage(lang);
  render();
}

function setupListeners() {
  $("uiLangPicker").addEventListener("change", (e) => setLanguage(e.target.value));
  $("settingsBtn").addEventListener("click", () => go("settings"));
  $("backBtn").addEventListener("click", () => go(view === "settings" ? "home" : view));
}

// ===== Start =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
