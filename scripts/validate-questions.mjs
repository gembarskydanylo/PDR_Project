// Перевірка data/questions.json на відповідність схемі.
// Запуск: node scripts/validate-questions.mjs
import { readFileSync } from "node:fs";

const LANGS = ["uk", "nl", "fr", "en"];
const TYPES = ["text", "sign", "image_scenario"];
const REGIONS = ["federal", "flanders", "brussels", "wallonia"];
const STATUSES = ["draft", "review", "published"];

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const topics = read("data/topics.json");
const questions = read("data/questions.json");
const topicIds = new Set(topics.map((t) => t.id));

const errors = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const checkI18n = (id, field, obj) => {
  if (!obj || typeof obj !== "object") return err(id, `${field} відсутнє`);
  for (const l of LANGS) {
    if (typeof obj[l] !== "string" || !obj[l].trim()) err(id, `${field}.${l} порожнє`);
  }
};

if (topics.length !== 12) errors.push(`topics.json: очікується 12 тем, є ${topics.length}`);
topics.forEach((t) => checkI18n(`topic ${t.id}`, "name", t.name));

const seen = new Set();
for (const q of questions) {
  const id = q.id || "(без id)";
  if (seen.has(id)) err(id, "дубльований id");
  seen.add(id);
  if (!topicIds.has(q.topic_id)) err(id, `невідомий topic_id "${q.topic_id}"`);
  if (!TYPES.includes(q.type)) err(id, `невідомий type "${q.type}"`);
  if (q.type !== "text" && !q.image) err(id, `type "${q.type}" потребує поля image`);
  if (![1, 2, 3].includes(q.difficulty)) err(id, "difficulty має бути 1, 2 або 3");
  if (!Array.isArray(q.region) || !q.region.length || q.region.some((r) => !REGIONS.includes(r)))
    err(id, `region має бути непорожнім масивом із ${REGIONS.join("/")}`);
  checkI18n(id, "question", q.question);
  checkI18n(id, "explanation", q.explanation);
  if (!Array.isArray(q.options) || q.options.length < 2) err(id, "потрібно щонайменше 2 варіанти");
  else {
    const optIds = q.options.map((o) => o.id);
    if (new Set(optIds).size !== optIds.length) err(id, "дубльовані id варіантів");
    q.options.forEach((o) => checkI18n(id, `options[${o.id}].text`, o.text));
    if (!optIds.includes(q.correct_option_id)) err(id, `correct_option_id "${q.correct_option_id}" не серед варіантів`);
  }
  if (q.status && !STATUSES.includes(q.status)) err(id, `невідомий status "${q.status}"`);
  if (q.status === "published" && !q.source?.title) err(id, "опубліковане питання без source.title");
}

if (errors.length) {
  console.error(`✗ ${errors.length} помилок:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
const perTopic = topics.map((t) => `${t.id}: ${questions.filter((q) => q.topic_id === t.id).length}/${t.target_questions}`);
console.log(`✓ ${questions.length} питань валідні\n  ` + perTopic.join("\n  "));
