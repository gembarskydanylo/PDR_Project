# ПДР Бельгії — підготовка до теорії категорії B

Мобільний PWA-застосунок для українців у Бельгії, які готуються до теоретичного іспиту на категорію B.
Інтерфейс і питання: 🇺🇦 українська · 🇳🇱 Nederlands · 🇫🇷 Français · 🇬🇧 English.

Чистий HTML + CSS + JavaScript (ES6+), без фреймворків і залежностей. Прогрес зберігається в `localStorage`, працює офлайн.

## Що вже працює

- Головна, 12 тем, практика (20 випадкових питань), повторення помилок
- Пояснення після кожної відповіді з посиланням на джерело
- Фільтр за регіоном (Фландрія / Брюссель / Валлонія): регіональні правила, наприклад ліміт 30 км/год у Брюсселі
- 4 мови, 3 теми оформлення, встановлення як застосунок, офлайн-режим
- Режим іспиту — опис формату; сам іспит вмикається, коли в базі буде ≥ 50 питань

## Формат офіційного іспиту

50 питань · 15 секунд на відповідь · прохідний бал **41/50**.
Звичайна помилка: −1 бал. Помилка в питанні про серйозне порушення (3-й/4-й ступінь) або перевищення швидкості: −5 балів.
Джерела: [vlaanderen.be](https://www.vlaanderen.be/rijbewijs-b-voor-auto/theorie-examen-voor-rijbewijs-b), [be.brussels](https://be.brussels/fr/transport-mobilite/permis-de-conduire-et-immatriculation/obtenir-son-permis/formation-la-conduite-et-examens-pour-le-permis-de-conduire-b).

⚠️ Новий «Code van de openbare weg / Code de la rue» набуває чинності **1 червня 2027** (перенесено з 1 вересня 2026). До того діє чинний Wegcode. Питання, які зміняться, треба буде оновити.

## Запуск локально

```bash
python3 -m http.server 8080
# відкрити http://localhost:8080
```

Service worker працює лише на `localhost` або через HTTPS (наприклад, GitHub Pages).

## Структура

```
index.html              оболонка застосунку
styles/main.css         стилі (теми glass / oranje / dark)
js/translations.js      рядки інтерфейсу uk/nl/fr/en, t() і tr()
js/progress.js          прогрес і помилки в localStorage
js/app.js               екрани, квіз, завантаження даних
data/topics.json        12 тем (id, name ×4, target_questions)
data/questions.json     питання (схема нижче)
assets/icons/           іконки PWA
sw.js                   офлайн-кеш (при зміні JS/CSS підняти VERSION)
scripts/validate-questions.mjs  перевірка questions.json
docs/gemini-legacy/     ранні чернетки з Gemini (для історії)
```

## Схема питання (`data/questions.json`)

```json
{
  "id": "speed_002",
  "topic_id": "speed_distance",
  "type": "text",
  "difficulty": 1,
  "region": ["brussels"],
  "question":    { "uk": "…", "nl": "…", "fr": "…", "en": "…" },
  "options": [
    { "id": "a", "text": { "uk": "…", "nl": "…", "fr": "…", "en": "…" } }
  ],
  "correct_option_id": "a",
  "explanation": { "uk": "…", "nl": "…", "fr": "…", "en": "…" },
  "source": { "title": "Wegcode art. 11", "url": "https://wegcode.be", "checked_at": "2026-10-15", "review_status": "verified" },
  "tags": ["speed"],
  "status": "published"
}
```

- `topic_id`: один з 12 id у `data/topics.json`
- `type`: `text` | `sign` | `image_scenario` (для двох останніх обов'язкове поле `image`)
- `difficulty`: 1–3
- `region`: `federal` (уся Бельгія) | `flanders` | `brussels` | `wallonia`
- `status`: `draft` | `review` | `published` (у застосунку показуються лише `published`)

Перед кожним комітом із питаннями:

```bash
node scripts/validate-questions.mjs
```
