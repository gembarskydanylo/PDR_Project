"use strict";

// ===== State =====
window.currentLang = "uk";
let view = "home";    // home | theory | lesson | signs | exam | mistakes | settings
let topics = [];      // з data/topics.json
let questions = [];   // з data/questions.json (лише status: published і не прострочені)
let lessons = [];     // з data/lessons.json
let signs = [];       // з data/signs.json
let lessonTopic = null;
let quiz = null;      // { ids, i, correct, answered, label, restart, done, exam?, score?, wrong? }
let examTimer = null;

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
  shuffle: '<path d="M16 4h4v4M4 19 20 4M20 16v4h-4M14.5 14.5 20 20M4 5l5 5"/>',
  theory: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  signs: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>'
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
  clearInterval(examTimer);
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
    const [tp, qs, ls, sg] = await Promise.all(
      ["topics", "questions", "lessons", "signs"].map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
    const today = new Date().toISOString().slice(0, 10);
    topics = tp;
    questions = qs.filter((q) => (q.status || "published") === "published" && !(q.valid_until && q.valid_until < today));
    lessons = ls;
    signs = sg;
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
  ["home", "theory", "signs", "exam", "mistakes"].forEach((m) => {
    const b = button("", [icon(m), el("span", "", t("modes." + m))], () => go(m));
    if (m === view || (m === "theory" && view === "lesson")) b.setAttribute("aria-current", "page");
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
    case "topics":
    case "theory": return renderTheory();
    case "lesson": return renderLesson();
    case "signs": return renderSigns();
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
  const row = button("row-link", null, () => openLesson(topic.id));
  row.appendChild(img(signSrc(topic.icon), "sign"));
  const mid = el("div");
  mid.appendChild(el("div", "row-title", tr(topic.name)));
  const nCards = lessonOf(topic.id)?.cards.length || 0;
  mid.appendChild(el("div", "row-sub", [nCards && plural("lesson_cards", nCards), plural("questions", ids.length)].filter(Boolean).join(" · ")));
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
    box.appendChild(button("btn primary", pct ? t("continue_btn") : t("start_btn"), () => openLesson(tp.id)));
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
  list.appendChild(actionRow("theory", t("theory_title"), t("theory_sub"), null, () => go("theory")));
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
  v.appendChild(el("p", "muted", t("exam_fail_rule")));
  const n = visibleQuestions().length;
  if (n < EXAM_SIZE) {
    v.appendChild(el("p", "notice", t("exam_not_ready", { n })));
    v.appendChild(button("btn primary", t("practice_title"), startPractice));
  } else {
    v.appendChild(button("btn primary", t("exam_start"), startExam));
  }
  const hist = Progress.get().examHistory || [];
  if (hist.length) {
    v.appendChild(el("h2", "section-title", t("exam_history")));
    const list = el("section", "list");
    hist.forEach((h) => {
      const row = el("div", "row-static");
      const d = new Date(h.date);
      row.appendChild(el("span", "", d.toLocaleDateString(window.currentLang, { day: "numeric", month: "short" }) + " " +
        d.toLocaleTimeString(window.currentLang, { hour: "2-digit", minute: "2-digit" })));
      row.appendChild(el("b", h.passed ? "ok" : "bad", `${h.score}/50 · ${h.passed ? t("exam_passed") : t("exam_failed")}`));
      list.appendChild(row);
    });
    v.appendChild(list);
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

  const second = el("div", "field");
  second.appendChild(el("label", "", t("second_lang_label")));
  second.appendChild(segmented([["", t("second_none")], ["nl", "Nederlands"], ["fr", "Français"], ["en", "English"]]
    .filter(([c]) => c !== window.currentLang), Progress.get().secondLang || "", (c) => { Progress.setSecondLang(c); render(); }, "two-rows"));
  second.appendChild(el("p", "muted small", t("second_lang_hint")));
  panel.appendChild(second);

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
    view = "lesson";
    lessonTopic = topicId;
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
  if (quiz.exam) {
    const row = el("div", "timer-row");
    const bar = el("div", "timer");
    const fill = el("i");
    fill.id = "timerFill";
    bar.appendChild(fill);
    row.appendChild(bar);
    const lab = el("span", "timer-label");
    lab.id = "timerLabel";
    lab.setAttribute("aria-live", "off");
    row.appendChild(lab);
    v.appendChild(row);
  }
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

  const h = el("h1", "question", tr(q.question));
  v.appendChild(h);
  const q2 = second(q.question, "second question-second");
  if (q2) v.appendChild(q2);

  const opts = el("div", "opts");
  shuffle(q.options).forEach((o, idx) => {
    const label = el("span", "opt-text", tr(o.text));
    const o2 = second(o.text, "second");
    if (o2) label.appendChild(o2);
    const b = button("opt", [el("span", "key", KEYS[idx]), label], () => (quiz.exam ? examAnswer(q, o.id) : answer(q, o.id)));
    b.dataset.id = o.id;
    opts.appendChild(b);
  });
  v.appendChild(opts);
  if (quiz.exam) startTimer(q);
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
  const e2 = second(q.explanation, "second");
  if (e2) box.appendChild(e2);
  if (isSerious(q)) box.appendChild(el("p", "serious-note", t("serious_note")));
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
  if (quiz.exam) return renderExamResult();
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

// ===== Helpers: друга мова, бали =====
function secondLang() {
  const s2 = Progress.get().secondLang;
  return s2 && s2 !== window.currentLang ? s2 : "";
}

// Той самий текст другою мовою (або null, якщо друга мова вимкнена).
function second(obj, cls) {
  const l2 = secondLang();
  if (!l2 || !obj?.[l2]) return null;
  const e = el("span", cls, obj[l2]);
  e.lang = l2;
  return e;
}

const isSerious = (q) => q.degree >= 3 || q.is_speed;
const penaltyOf = (q) => (isSerious(q) ? 5 : 1);
const lessonOf = (topicId) => lessons.find((l) => l.topic_id === topicId);

// ===== Теорія =====
function renderTheory() {
  const v = screen();
  v.appendChild(el("h1", "", t("theory_title")));
  v.appendChild(el("p", "muted", t("theory_sub")));
  const list = el("section", "list");
  topics.forEach((tp) => list.appendChild(topicRow(tp)));
  v.appendChild(list);
}

function openLesson(topicId) {
  lessonTopic = topicId;
  go("lesson");
}

function renderLesson() {
  const topic = topics.find((tp) => tp.id === lessonTopic);
  if (!topic) return go("theory");
  const v = screen();
  const head = el("div", "lesson-head");
  head.appendChild(img(signSrc(topic.icon), "sign"));
  const hh = el("div");
  hh.appendChild(el("h1", "", tr(topic.name)));
  const n2 = second(topic.name, "second");
  if (n2) hh.appendChild(n2);
  head.appendChild(hh);
  v.appendChild(head);

  (lessonOf(topic.id)?.cards || []).forEach((c) => {
    const card = el("article", "panel lesson-card");
    if (c.image) {
      const fig = el("figure", "figure scene");
      fig.appendChild(img(c.image));
      card.appendChild(fig);
    }
    const top = el("div", "lesson-title");
    if (c.sign) top.appendChild(img(signSrc(c.sign), "sign"));
    const tt = el("div");
    tt.appendChild(el("h2", "", tr(c.title)));
    const t2 = second(c.title, "second");
    if (t2) tt.appendChild(t2);
    top.appendChild(tt);
    card.appendChild(top);
    card.appendChild(el("p", "", tr(c.body)));
    const b2 = second(c.body, "second block");
    if (b2) card.appendChild(b2);
    if (c.terms?.length) {
      const terms = el("div", "terms");
      terms.appendChild(el("span", "terms-label", t("terms_label")));
      c.terms.forEach((tm) => {
        const chip = el("span", "term");
        const nl = el("span", "", tm.nl);
        nl.lang = "nl";
        const fr = el("span", "", tm.fr);
        fr.lang = "fr";
        chip.append("NL ", nl, " · FR ", fr);
        terms.appendChild(chip);
      });
      card.appendChild(terms);
    }
    const foot = el("div", "lesson-foot");
    foot.appendChild(el("span", "", /^\d/.test(c.article) ? `${t("article")} ${c.article}` : c.article));
    if (c.serious) foot.appendChild(el("span", "badge-serious", t("serious_badge")));
    card.appendChild(foot);
    v.appendChild(card);
  });

  const n = idsOfTopic(topic.id).length;
  if (n) v.appendChild(button("btn primary", `${t("lesson_test")} · ${plural("questions", n)}`, () => startTopic(topic.id)));
  else v.appendChild(el("p", "notice", t("topic_empty")));
}

// ===== Каталог знаків =====
function renderSigns() {
  const v = screen();
  v.appendChild(el("h1", "", t("signs_title")));
  v.appendChild(el("p", "muted", t("signs_sub")));
  "ABCDEF".split("").forEach((cat) => {
    const group = signs.filter((sg) => sg.category === cat);
    if (!group.length) return;
    v.appendChild(el("h2", "section-title", t("sign_cats." + cat)));
    const grid = el("section", "sign-grid");
    group.forEach((sg) => {
      const d = el("details", "sign-tile");
      const sum = el("summary");
      sum.appendChild(img(signSrc(sg.code), "sign"));
      const name = el("span", "sign-name");
      name.appendChild(el("b", "", sg.code));
      name.appendChild(el("span", "", tr(sg.name)));
      const s2 = second(sg.name, "second");
      if (s2) name.appendChild(s2);
      sum.appendChild(name);
      d.appendChild(sum);
      d.appendChild(el("p", "", tr(sg.meaning)));
      const m2 = second(sg.meaning, "second block");
      if (m2) d.appendChild(m2);
      grid.appendChild(d);
    });
    v.appendChild(grid);
  });
}

// ===== Пробний іспит =====
function startExam() {
  const ids = shuffle(visibleQuestions().map((q) => q.id)).slice(0, EXAM_SIZE);
  if (ids.length < EXAM_SIZE) return;
  quiz = { ids, i: 0, correct: 0, answered: false, label: t("exam_title"), restart: startExam, done: false,
    exam: true, score: 50, wrong: [] };
  render();
  window.scrollTo(0, 0);
}

function startTimer(q) {
  clearInterval(examTimer);
  const deadline = performance.now() + 15000;
  const tick = () => {
    const left = Math.max(0, deadline - performance.now());
    const fill = $("timerFill");
    const lab = $("timerLabel");
    if (!fill || !quiz?.exam) return clearInterval(examTimer);
    fill.style.width = (left / 150) + "%";
    fill.classList.toggle("low", left < 5000);
    lab.textContent = `${Math.ceil(left / 1000)} ${t("exam_seconds")}`;
    if (left <= 0) {
      clearInterval(examTimer);
      examAnswer(q, null);
    }
  };
  tick();
  examTimer = setInterval(tick, 100);
}

function examAnswer(q, optionId) {
  if (quiz.answered) return;
  quiz.answered = true;
  clearInterval(examTimer);
  const ok = optionId === q.correct_option_id;
  if (ok) quiz.correct += 1;
  else {
    quiz.score -= penaltyOf(q);
    quiz.wrong.push({ id: q.id, chosen: optionId, penalty: penaltyOf(q) });
  }
  Progress.recordAnswer(q.id, ok);
  document.querySelectorAll(".opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.id === optionId) b.classList.add("chosen");
  });
  setTimeout(() => {
    if (!quiz?.exam) return;
    if (quiz.i === quiz.ids.length - 1) {
      quiz.done = true;
      const serious = quiz.wrong.filter((w) => w.penalty === 5).length;
      quiz.passed = quiz.score >= 41;
      Progress.addExam({ date: new Date().toISOString(), score: Math.max(0, quiz.score), passed: quiz.passed,
        serious, light: quiz.wrong.length - serious });
    } else {
      quiz.i += 1;
      quiz.answered = false;
    }
    render();
    window.scrollTo(0, 0);
  }, 350);
}

function renderExamResult() {
  const { wrong, passed } = quiz;
  const score = Math.max(0, quiz.score);
  const serious = wrong.filter((w) => w.penalty === 5).length;
  const v = screen();
  const box = el("section", "panel result");
  box.appendChild(el("h2", "muted", t("result_title")));
  box.appendChild(el("div", "score", `${score}/50`));
  box.appendChild(el("p", "verdict " + (passed ? "ok" : "bad"), passed ? t("exam_passed") : t("exam_failed")));
  const counts = el("div", "exam-counts");
  [[wrong.length - serious, t("exam_light")], [serious, t("exam_serious")]].forEach(([n, label]) => {
    const d = el("div");
    d.appendChild(el("b", "", String(n)));
    d.appendChild(el("span", "", label));
    counts.appendChild(d);
  });
  box.appendChild(counts);
  const actions = el("div", "actions");
  actions.appendChild(button("btn primary", t("retry"), startExam));
  actions.appendChild(button("btn", t("to_home"), () => go("home")));
  box.appendChild(actions);
  v.appendChild(box);

  if (!wrong.length) return;
  v.appendChild(el("h2", "section-title", t("exam_review")));
  wrong.forEach((w) => {
    const q = byId(w.id);
    const card = el("article", "panel review-card");
    const head = el("div", "review-head");
    if (q.image?.includes("/signs/")) head.appendChild(img(q.image, "sign"));
    head.appendChild(el("h3", "", tr(q.question)));
    head.appendChild(el("span", w.penalty === 5 ? "badge-serious" : "badge-light", `−${w.penalty}`));
    card.appendChild(head);
    const chosen = q.options.find((o) => o.id === w.chosen);
    card.appendChild(el("p", "review-bad", `${t("your_answer")}: ${chosen ? tr(chosen.text) : t("no_answer")}`));
    const right = q.options.find((o) => o.id === q.correct_option_id);
    card.appendChild(el("p", "review-ok", `${t("correct_answer")}: ${tr(right.text)}`));
    card.appendChild(el("p", "muted", tr(q.explanation)));
    v.appendChild(card);
  });
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
  $("backBtn").addEventListener("click", () => {
    if (quiz?.exam && !quiz.done) {
      if (!confirm(t("exam_abort_confirm"))) return;
      clearInterval(examTimer);
    }
    go(view === "settings" ? "home" : view);
  });
}

// ===== Start =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
