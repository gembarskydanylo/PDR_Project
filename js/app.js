"use strict";

// ===== State =====
window.currentLang = "uk";
let mode = "home";
let currentTopicId = null;

const $ = id => document.getElementById(id);

// ===== Helpers =====
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// ===== Init =====
function init() {
  const progress = Progress.load();
  window.currentLang = progress.language || "uk";
  $("uiLangPicker").value = window.currentLang;

  // Theme
  try {
    const savedTheme = localStorage.getItem("pdr_theme");
    if (savedTheme === "glass" || savedTheme === "oranje" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    } else {
      document.documentElement.dataset.theme = "glass";
    }
  } catch (e) {
    document.documentElement.dataset.theme = "glass";
  }

  updateHeader();
  buildTopicNav();
  updateModeButtons();
  updateStats();
  render();
  setupListeners();
}

// ===== Header & Language =====
function updateHeader() {
  $("appTitle").textContent = t("app_title");
  $("tagline").textContent = t("tagline");
  $("progressLabel").textContent = t("progress_label");
  $("footText").textContent = t("foot");
  document.documentElement.lang = window.currentLang;
}

function setLanguage(lang) {
  window.currentLang = lang;
  Progress.setLanguage(lang);
  updateHeader();
  buildTopicNav();
  updateModeButtons();
  updateStats();
  render();
}

// ===== Stats =====
function updateStats() {
  const completed = Progress.getTopicsCompletedCount();
  $("learnedCount").textContent = completed;
  const mistakes = Progress.getMistakes().length;
  $("reviewCount").textContent = t("review_count") + ": " + mistakes;
  $("score").textContent = "⭐ " + (Progress.get().totalCorrect || 0);
}

// ===== Topic navigation (top horizontal) =====
function buildTopicNav() {
  const nav = $("catNav");
  nav.replaceChildren();

  // "All / Home" button
  const allBtn = el("button", "", t("all_topics"));
  allBtn.type = "button";
  allBtn.setAttribute("aria-selected", mode === "home" || !currentTopicId ? "true" : "false");
  allBtn.onclick = () => {
    currentTopicId = null;
    mode = "home";
    updateModeButtons();
    buildTopicNav();
    render();
  };
  nav.appendChild(allBtn);

  topicsData.forEach(topic => {
    const btn = el("button", "", getTopicName(topic));
    btn.type = "button";
    btn.dataset.topic = topic.id;
    btn.setAttribute("aria-selected", currentTopicId === topic.id ? "true" : "false");
    btn.onclick = () => {
      currentTopicId = topic.id;
      mode = "topics";
      updateModeButtons();
      buildTopicNav();
      render();
    };
    nav.appendChild(btn);
  });
}

// ===== Mode buttons (bottom) =====
function updateModeButtons() {
  const wrap = $("modeButtons");
  wrap.replaceChildren();

  const modes = [
    ["home", t("modes.home")],
    ["topics", t("modes.topics")],
    ["practice", t("modes.practice")],
    ["exam", t("modes.exam")],
    ["mistakes", t("modes.mistakes")]
  ];

  modes.forEach(([m, label]) => {
    const b = el("button", m === mode ? "primary" : "", label);
    b.type = "button";
    b.onclick = () => {
      mode = m;
      if (m === "home") currentTopicId = null;
      updateModeButtons();
      buildTopicNav();
      render();
    };
    wrap.appendChild(b);
  });
}

// ===== Render =====
function render() {
  $("prog").textContent = "";
  $("rnd").textContent = "";
  $("barfill").style.width = "0%";

  switch (mode) {
    case "home":
      renderHome();
      break;
    case "topics":
      renderTopics();
      break;
    case "practice":
      renderComingSoon("practice");
      break;
    case "exam":
      renderExam();
      break;
    case "mistakes":
      renderMistakes();
      break;
    default:
      renderHome();
  }
}

function renderHome() {
  const card = $("card");
  card.replaceChildren();

  const hero = el("div", "home-hero");
  hero.appendChild(el("div", "icon-big", "🚗"));
  hero.appendChild(el("h2", "", t("home_title")));
  hero.appendChild(el("p", "", t("home_desc")));
  card.appendChild(hero);

  const grid = el("div", "actions-grid");

  const actions = [
    { icon: "🚦", title: t("road_signs"), desc: t("study_meanings"), mode: "topics" },
    { icon: "🖼️", title: t("situations"), desc: t("look_analyze"), mode: "practice" },
    { icon: "📝", title: t("testing"), desc: t("check_knowledge"), mode: "exam" },
    { icon: "⚠️", title: t("my_mistakes"), desc: t("repeat_hard"), mode: "mistakes" }
  ];

  actions.forEach(a => {
    const btn = el("button", "action-card");
    btn.type = "button";
    const icon = el("div", "action-icon", a.icon);
    btn.appendChild(icon);
    btn.appendChild(el("div", "action-title", a.title));
    btn.appendChild(el("div", "action-desc", a.desc));
    btn.onclick = () => {
      mode = a.mode;
      if (a.mode === "topics") currentTopicId = null;
      updateModeButtons();
      buildTopicNav();
      render();
    };
    grid.appendChild(btn);
  });

  card.appendChild(grid);
}

function renderTopics() {
  const card = $("card");
  card.replaceChildren();

  card.appendChild(el("h2", "", t("topics_title")));

  const list = el("div", "topic-list");

  topicsData.forEach(topic => {
    const progress = Progress.get().topicsCompleted[topic.id] || 0;
    const btn = el("button", "topic-item");
    btn.type = "button";

    const num = el("div", "topic-num", String(topic.number));
    btn.appendChild(num);

    const info = el("div", "topic-info");
    info.appendChild(el("div", "topic-name", getTopicName(topic)));
    info.appendChild(el("div", "topic-meta", `${topic.questionsTarget} ${t("questions")} · ${progress}%`));
    btn.appendChild(info);

    btn.onclick = () => {
      currentTopicId = topic.id;
      renderComingSoon("topic");
    };

    list.appendChild(btn);
  });

  card.appendChild(list);
}

function renderExam() {
  const card = $("card");
  card.replaceChildren();

  const block1 = el("div");
  block1.appendChild(el("h2", "", t("exam_title")));
  const desc1 = el("p", "", t("exam_desc"));
  desc1.style.color = "var(--mut)";
  desc1.style.margin = "4px 0 12px";
  block1.appendChild(desc1);
  card.appendChild(block1);

  const startBtn = el("button", "btn primary", t("start"));
  startBtn.type = "button";
  startBtn.onclick = () => renderComingSoon("exam");
  card.appendChild(startBtn);

  const block2 = el("div");
  block2.style.marginTop = "20px";
  block2.appendChild(el("h2", "", t("practice_title")));
  const desc2 = el("p", "", t("practice_desc"));
  desc2.style.color = "var(--mut)";
  desc2.style.margin = "4px 0 12px";
  block2.appendChild(desc2);
  card.appendChild(block2);

  const pracBtn = el("button", "btn", t("start"));
  pracBtn.type = "button";
  pracBtn.onclick = () => {
    mode = "practice";
    updateModeButtons();
    render();
  };
  card.appendChild(pracBtn);
}

function renderMistakes() {
  const card = $("card");
  card.replaceChildren();

  const mistakes = Progress.getMistakes();

  if (mistakes.length === 0) {
    const empty = el("div", "empty-state");
    empty.appendChild(el("div", "icon-big", "✅"));
    empty.appendChild(el("h3", "", t("no_mistakes")));
    empty.appendChild(el("p", "", t("no_mistakes_desc")));
    card.appendChild(empty);
  } else {
    card.appendChild(el("h2", "", t("my_mistakes") + ` (${mistakes.length})`));
    const empty = el("div", "empty-state");
    empty.appendChild(el("p", "", t("coming_soon_desc")));
    card.appendChild(empty);
  }
}

function renderComingSoon(type) {
  const card = $("card");
  card.replaceChildren();

  const empty = el("div", "empty-state");
  empty.appendChild(el("div", "icon-big", "⏳"));
  empty.appendChild(el("h3", "", t("coming_soon")));
  empty.appendChild(el("p", "", t("coming_soon_desc")));

  const back = el("button", "btn primary", t("modes.home"));
  back.type = "button";
  back.style.marginTop = "16px";
  back.style.maxWidth = "200px";
  back.style.marginLeft = "auto";
  back.style.marginRight = "auto";
  back.style.display = "block";
  back.onclick = () => {
    mode = "home";
    currentTopicId = null;
    updateModeButtons();
    buildTopicNav();
    render();
  };
  empty.appendChild(back);
  card.appendChild(empty);
}

// ===== Listeners =====
function setupListeners() {
  $("uiLangPicker").addEventListener("change", e => setLanguage(e.target.value));

  $("themeToggle").addEventListener("click", () => {
    const order = ["glass", "oranje", "dark"];
    const cur = document.documentElement.dataset.theme || "glass";
    const i = order.indexOf(cur);
    const next = order[(i < 0 ? 0 : i + 1) % order.length];
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("pdr_theme", next); } catch (e) {}
  });
}

// ===== Start =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
