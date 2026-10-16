# ПДР Бельгії — підготовка до теорії категорії B

Мобільний PWA-застосунок для українців у Бельгії, які готуються до теоретичного іспиту на категорію B.
Інтерфейс і питання: 🇺🇦 українська · 🇳🇱 Nederlands · 🇫🇷 Français · 🇬🇧 English.

Чистий HTML + CSS + JavaScript (ES6+), без фреймворків і залежностей. Прогрес зберігається в `localStorage`, працює офлайн.

## Що вже працює

- **Теорія:** 45 коротких уроків по 12 темах з номерами статей Wegcode, позначкою «−5 на іспиті» і термінами NL/FR; після теми — тест
- **Каталог знаків:** 40 справжніх бельгійських знаків за серіями A–F зі значеннями (+ варіанти C43 30/70/90/120)
- **305 питань** з поясненнями й джерелами (94 з них — «серйозні», −5 на іспиті), 18 схем ситуацій згори, питання з вибором знака-картинки; у кожного є ступінь порушення (`degree`) і ознака швидкості (`is_speed`)
- **Пробний іспит:** 50 випадкових питань, 15 с на кожне, −1 / −5 балів як на справжньому, прохідний 41/50, розбір помилок, історія спроб
- **Друга мова:** питання, варіанти й уроки дублюються нідерландською / французькою / англійською, бо українською іспиту немає
- Практика (20 випадкових питань), повторення помилок, прогрес по темах
- Фільтр за регіоном (Фландрія / Брюссель / Валлонія), схеми ситуацій згори, світла й темна тема, офлайн, встановлення як застосунок

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
styles/main.css         стилі (світла / темна тема, токени кольорів на :root)
js/translations.js      рядки інтерфейсу uk/nl/fr/en, t() і tr()
js/progress.js          прогрес і помилки в localStorage
js/app.js               екрани, квіз, завантаження даних
data/topics.json        12 тем (id, name ×4, target_questions)
data/questions.json     питання (схема нижче)
data/lessons.json       уроки теорії: topic_id → cards (title, body, article, serious, terms, sign/image)
data/signs.json         каталог знаків (code, category A–F, name, meaning)
assets/icons/           іконки PWA
assets/signs/           знаки (генеруються scripts/build-signs.py)
assets/scenes/          схеми ситуацій (генеруються scripts/build-scenes.py)
sw.js                   офлайн-кеш (при зміні JS/CSS підняти VERSION)
scripts/validate-questions.mjs  перевірка questions.json, lessons.json, signs.json і файлів картинок
scripts/content/        скрипти наповнення бази (qlib.py — помічники, batch*.py — партії питань)
docs/brand-guidelines.md  бренд-гайд: голос, кольори, логотип, правила знаків і схем
assets/banners/launch/  банери для соцмереж (генеруються scripts/build-banners.cjs)
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
  "degree": 1,
  "is_speed": true,
  "valid_until": "2027-05-31",
  "status": "published"
}
```

- `topic_id`: один з 12 id у `data/topics.json`
- `type`: `text` | `sign` | `image_scenario` (для двох останніх обов'язкове поле `image`, напр. `assets/signs/B1.svg` або `assets/scenes/priority-right.svg`)
- `difficulty`: 1–3
- `region`: `federal` (уся Бельгія) | `flanders` | `brussels` | `wallonia`
- `status`: `draft` | `review` | `published` (у застосунку показуються лише `published`)
- `degree`: ступінь порушення за KB 30.09.2005 (1–4). На іспиті −5, якщо `degree ≥ 3` або `is_speed: true`, інакше −1
- `valid_until` (необовʼязково): після цієї дати питання ховається; для правил, що змінюються з 1.06.2027

Додати знак або схему: дописати функцію в `scripts/build-signs.py` / `scripts/build-scenes.py`, запустити `python3 scripts/build-signs.py` (або scenes) і додати файл у список `SHELL` у `sw.js`.

Знаки Бельгії є частиною законодавства, тому вони у суспільному надбанні.

Перед кожним комітом із питаннями:

```bash
node scripts/validate-questions.mjs
```

## Банери

```bash
PW=/шлях/до/playwright node scripts/build-banners.cjs
```

Два напрями (`minimal` — світлий зі знаками, `asphalt` — темний зі схемою), формати:
`og` 1200×630 (превʼю посилання), `github-social` 1280×640, `instagram-post` 1080×1080, `instagram-story` 1080×1920, `facebook-cover` 820×312.
Превʼю посилання підключене в `index.html` (`og:image`). Для GitHub: Settings → General → Social preview → завантажити `minimal-github-social-1280x640.png`.
