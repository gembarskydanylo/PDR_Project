"use strict";

// ===== State =====
window.currentLang = "uk";
let mode = "home";
let currentTopicId = null;
let topics = [];      // з data/topics.json
let questions = [];   // з data/questions.json (лише status: published)
let quiz = null;      // активна сесія: { ids, i, correct, answered, label, restart }

const EXAM_SIZE = 50;
const PRACTICE_SIZE = 20;
const THEMES = ["glass", "oranje", "dark"];
const THEME_ICONS = { glass: "🌌", oranje: "🧡", dark: "🌙" };

const $ = (id) => document.getElementById(id);

// ===== Helpers =====
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function button(cls, text, onClick) {
  const b = el("button", cls, text);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

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

function questionsOfTopic(topicId) {
  return visibleQuestions().filter((q) => q.topic_id === topicId);
}

const byId = (id) => questions.find((q) => q.id === id);

function go(newMode, topicId = null) {
  mode = newMode;
  currentTopicId = topicId;
  quiz = null;
  refresh();
}

// ===== Init =====
async function init() {
  const progress = Progress.load();
  window.currentLang = progress.language || "uk";
  $("uiLangPicker").value = window.currentLang;
  applyTheme(readTheme());
  setupListeners();

  try {
    const [tRes, qRes] = await Promise.all([fetch("data/topics.json"), fetch("data/questions.json")]);
    topics = await tRes.json();
    questions = (await qRes.json()).filter((q) => (q.status || "published") === "published");
  } catch (e) {
    console.error("Failed to load data", e);
  }

  buildRegionPicker();
  refresh();
}

function refresh() {
  updateHeader();
  buildTopicNav();
  updateModeButtons();
  updateStats();
  render();
}

// ===== Theme =====
function readTheme() {
  try {
    const saved = localStorage.getItem("pdr_theme");
    return THEMES.includes(saved) ? saved : "glass";
  } catch (e) {
    return "glass";
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $("themeToggle");
  btn.textContent = THEME_ICONS[theme];
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  document.querySelector('meta[name="theme-color"]').content = bg || "#1a0b3a";
}

// ===== Header & Language =====
function updateHeader() {
  $("appTitle").textContent = t("app_title");
  $("tagline").textContent = t("tagline");
  $("progressLabel").textContent = t("progress_label");
  $("footText").textContent = t("foot");
  $("footLocal").textContent = t("foot_local");
  $("regionPicker").setAttribute("aria-label", t("region_label"));
  document.documentElement.lang = window.currentLang;
  document.title = t("app_title");
  buildRegionPicker();
}

function buildRegionPicker() {
  const sel = $("regionPicker");
  const current = Progress.get().region;
  sel.replaceChildren();
  ["all", "flanders", "brussels", "wallonia"].forEach((r) => {
    const o = el("option", "", t("regions." + r));
    o.value = r;
    sel.appendChild(o);
  });
  sel.value = current;
}

function setLanguage(lang) {
  window.currentLang = lang;
  Progress.setLanguage(lang);
  refresh();
}

// ===== Stats =====
function learnedTopicsCount() {
  return topics.filter((tp) => {
    const ids = questionsOfTopic(tp.id).map((q) => q.id);
    return ids.length > 0 && Progress.topicPercent(ids) === 100;
  }).length;
}

function updateStats() {
  $("learnedCount").textContent = learnedTopicsCount();
  $("topicsTotal").textContent = topics.length || 12;
  $("reviewCount").textContent = t("review_count") + ": " + Progress.getMistakes().length;
  $("score").textContent = "⭐ " + (Progress.get().totalCorrect || 0);
}

// ===== Topic navigation (top horizontal) =====
function buildTopicNav() {
  const nav = $("catNav");
  nav.replaceChildren();

  const allBtn = button("", t("all_topics"), () => go("topics"));
  allBtn.setAttribute("aria-pressed", String(mode === "topics" && !currentTopicId));
  nav.appendChild(allBtn);

  topics.forEach((topic) => {
    const btn = button("", tr(topic.name), () => startTopic(topic.id));
    btn.setAttribute("aria-pressed", String(currentTopicId === topic.id));
    nav.appendChild(btn);
  });
}

// ===== Mode buttons (bottom) =====
function updateModeButtons() {
  const wrap = $("modeButtons");
  wrap.replaceChildren();
  ["home", "topics", "practice", "exam", "mistakes"].forEach((m) => {
    const b = button(m === mode ? "primary" : "", t("modes." + m), () => go(m));
    if (m === mode) b.setAttribute("aria-current", "page");
    wrap.appendChild(b);
  });
}

// ===== Render =====
function render() {
  setBar(0);
  $("prog").textContent = "";
  $("rnd").textContent = "";
  if (quiz) return renderQuestion();

  switch (mode) {
    case "topics": return renderTopics();
    case "practice": return renderPractice();
    case "exam": return renderExam();
    case "mistakes": return renderMistakes();
    default: return renderHome();
  }
}

function setBar(percent) {
  $("barfill").style.width = percent + "%";
  document.querySelector(".bar").setAttribute("aria-valuenow", String(Math.round(percent)));
}

function card() {
  const c = $("card");
  c.replaceChildren();
  return c;
}

function renderHome() {
  const c = card();
  const hero = el("div", "home-hero");
  hero.appendChild(el("div", "icon-big", "🚗"));
  hero.appendChild(el("h2", "", t("home_title")));
  hero.appendChild(el("p", "", t("home_desc")));
  c.appendChild(hero);

  const grid = el("div", "actions-grid");
  [
    { icon: "🚦", title: t("road_signs"), desc: t("study_meanings"), run: () => startTopic("road_signs") },
    { icon: "🎯", title: t("situations"), desc: t("look_analyze"), run: () => go("practice") },
    { icon: "📝", title: t("testing"), desc: t("check_knowledge"), run: () => go("exam") },
    { icon: "⚠️", title: t("my_mistakes"), desc: t("repeat_hard"), run: () => go("mistakes") }
  ].forEach((a) => {
    const btn = button("action-card", undefined, a.run);
    btn.appendChild(el("div", "action-icon", a.icon));
    btn.appendChild(el("div", "action-title", a.title));
    btn.appendChild(el("div", "action-desc", a.desc));
    grid.appendChild(btn);
  });
  c.appendChild(grid);
}

function renderTopics() {
  const c = card();
  c.appendChild(el("h2", "", t("topics_title")));
  const list = el("div", "topic-list");

  topics.forEach((topic, idx) => {
    const ids = questionsOfTopic(topic.id).map((q) => q.id);
    const btn = button("topic-item", undefined, () => startTopic(topic.id));
    btn.appendChild(el("div", "topic-num", String(idx + 1)));
    const info = el("div", "topic-info");
    info.appendChild(el("div", "topic-name", tr(topic.name)));
    info.appendChild(el("div", "topic-meta",
      `${ids.length} / ${topic.target_questions} ${t("questions")} · ${Progress.topicPercent(ids)}%`));
    btn.appendChild(info);
    list.appendChild(btn);
  });
  c.appendChild(list);
}

function renderPractice() {
  const c = card();
  c.appendChild(el("h2", "", t("practice_title")));
  c.appendChild(el("p", "muted", t("practice_desc")));
  const pool = visibleQuestions();
  c.appendChild(el("p", "muted", `${pool.length} ${t("questions")}`));
  c.appendChild(button("btn primary", t("start"), startPractice));
}

function renderExam() {
  const c = card();
  c.appendChild(el("h2", "", t("exam_title")));
  c.appendChild(el("p", "muted", t("exam_desc")));
  const n = visibleQuestions().length;
  if (n < EXAM_SIZE) {
    c.appendChild(el("p", "notice", t("exam_not_ready", { n })));
    c.appendChild(button("btn", t("practice_title"), () => go("practice")));
  }
}

function renderMistakes() {
  const c = card();
  const ids = Progress.getMistakes().filter((id) => byId(id));
  if (!ids.length) {
    const empty = el("div", "empty-state");
    empty.appendChild(el("div", "icon-big", "✅"));
    empty.appendChild(el("h3", "", t("no_mistakes")));
    empty.appendChild(el("p", "", t("no_mistakes_desc")));
    c.appendChild(empty);
    return;
  }
  c.appendChild(el("h2", "", `${t("my_mistakes")} (${ids.length})`));
  c.appendChild(button("btn primary", t("review_mistakes"), () => startQuiz(shuffle(ids), t("my_mistakes"))));
}

function renderComingSoon() {
  const c = card();
  const empty = el("div", "empty-state");
  empty.appendChild(el("div", "icon-big", "⏳"));
  empty.appendChild(el("h3", "", t("coming_soon")));
  empty.appendChild(el("p", "", t("coming_soon_desc")));
  const back = button("btn primary narrow", t("modes.topics"), () => go("topics"));
  empty.appendChild(back);
  c.appendChild(empty);
}

// ===== Quiz =====
function startTopic(topicId) {
  mode = "topics";
  currentTopicId = topicId;
  const ids = questionsOfTopic(topicId).map((q) => q.id);
  const topic = topics.find((tp) => tp.id === topicId);
  if (!ids.length) {
    quiz = null;
    refresh();
    return renderComingSoon();
  }
  startQuiz(shuffle(ids), tr(topic?.name), () => startTopic(topicId));
}

function startPractice() {
  const ids = shuffle(visibleQuestions().map((q) => q.id)).slice(0, PRACTICE_SIZE);
  startQuiz(ids, t("practice_title"), startPractice);
}

function startQuiz(ids, label, restart) {
  if (!ids.length) {
    card().appendChild(el("p", "notice", t("no_questions")));
    return;
  }
  quiz = { ids, i: 0, correct: 0, answered: false, label, restart: restart || (() => startQuiz(shuffle(ids), label)) };
  buildTopicNav();
  updateModeButtons();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  const q = byId(quiz.ids[quiz.i]);
  const n = quiz.ids.length;
  $("prog").textContent = t("question_of", { i: quiz.i + 1, n });
  $("rnd").textContent = quiz.label || "";
  setBar((quiz.i / n) * 100);

  const c = card();
  const head = el("div", "q");
  const badges = el("div", "badges");
  q.region.filter((r) => r !== "federal").forEach((r) => badges.appendChild(el("span", "badge", t("regions." + r))));
  if (badges.childElementCount) head.appendChild(badges);
  if (q.image) {
    const img = el("img", "q-img");
    img.src = q.image;
    img.alt = "";
    head.appendChild(img);
  }
  head.appendChild(el("h2", "", tr(q.question)));
  c.appendChild(head);

  const opts = el("div", "opts");
  q.options.forEach((o) => {
    const b = button("opt", tr(o.text), () => answer(q, o.id));
    b.dataset.id = o.id;
    opts.appendChild(b);
  });
  c.appendChild(opts);
  c.appendChild(el("div", "feedback"));
}

function answer(q, optionId) {
  if (quiz.answered) return;
  quiz.answered = true;
  const ok = optionId === q.correct_option_id;
  if (ok) quiz.correct += 1;
  Progress.recordAnswer(q.id, ok);
  updateStats();

  document.querySelectorAll(".opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.id === q.correct_option_id) b.classList.add("correct");
    else if (b.dataset.id === optionId) b.classList.add("incorrect");
  });

  const fb = document.querySelector(".feedback");
  fb.classList.add(ok ? "ok" : "bad");
  fb.appendChild(el("strong", "", ok ? "✅ " + t("correct") : "❌ " + t("wrong")));
  fb.appendChild(el("p", "", tr(q.explanation)));
  if (q.source?.title) {
    const src = el("p", "source");
    src.appendChild(document.createTextNode(t("source") + ": "));
    if (q.source.url) {
      const a = el("a", "", q.source.title);
      a.href = q.source.url;
      a.target = "_blank";
      a.rel = "noopener";
      src.appendChild(a);
    } else {
      src.appendChild(document.createTextNode(q.source.title));
    }
    fb.appendChild(src);
  }

  const last = quiz.i === quiz.ids.length - 1;
  const next = button("btn primary", last ? t("finish") : t("next"), () => {
    if (last) return renderResult();
    quiz.i += 1;
    quiz.answered = false;
    render();
  });
  $("card").appendChild(next);
  next.focus({ preventScroll: true });
  next.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderResult() {
  const { correct, ids, label, restart } = quiz;
  const n = ids.length;
  setBar(100);
  $("prog").textContent = label || "";
  $("rnd").textContent = "";

  const c = card();
  const box = el("div", "empty-state result");
  box.appendChild(el("div", "icon-big", correct === n ? "🏆" : correct / n >= 0.82 ? "👍" : "📚"));
  box.appendChild(el("h3", "", t("result_title")));
  box.appendChild(el("p", "result-score", t("result_score", { c: correct, n })));
  const row = el("div", "row");
  row.appendChild(button("btn primary", t("retry"), restart));
  row.appendChild(button("btn", t("modes.home"), () => go("home")));
  box.appendChild(row);
  c.appendChild(box);
  quiz = null;
  buildTopicNav();
}

// ===== Listeners =====
function setupListeners() {
  $("uiLangPicker").addEventListener("change", (e) => setLanguage(e.target.value));
  $("regionPicker").addEventListener("change", (e) => {
    Progress.setRegion(e.target.value);
    quiz = null;
    refresh();
  });
  $("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme;
    const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
    applyTheme(next);
    try { localStorage.setItem("pdr_theme", next); } catch (e) {}
  });
}

// ===== Start =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
