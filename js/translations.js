const translations = {
  uk: {
    app_title: "ПДР Бельгії",
    tagline: "Belgian Driving Theory",
    progress_label: "Вивчено тем",
    review_count: "Помилок",
    modes: {
      home: "Головна",
      topics: "Теми",
      practice: "Практика",
      exam: "Іспит",
      mistakes: "Помилки"
    },
    home_title: "Готуйся до іспиту",
    home_desc: "Теоретичний іспит категорії B у Бельгії",
    road_signs: "Дорожні знаки",
    study_meanings: "Вивчай значення",
    situations: "Ситуації",
    look_analyze: "Дивись і аналізуй",
    testing: "Тестування",
    check_knowledge: "Перевіряй знання",
    my_mistakes: "Мої помилки",
    repeat_hard: "Повторюй складне",
    topics_title: "Теми навчання",
    questions: "питань",
    coming_soon: "Незабаром",
    coming_soon_desc: "Цей розділ буде доступний у наступних оновленнях. Зараз готуємо перевірені питання та схеми.",
    start: "Почати",
    exam_title: "Режим іспиту",
    exam_desc: "50 питань · 45 хвилин · поріг 41/50",
    practice_title: "Практика",
    practice_desc: "Тренуйся без обмежень часу",
    no_mistakes: "Помилок поки немає",
    no_mistakes_desc: "Пройди тести, щоб побачити питання, які потребують повторення",
    foot: "Підготовка до теоретичного іспиту (кат. B)",
    select_topic: "Обери тему",
    all_topics: "Усі теми"
  },
  nl: {
    app_title: "Belgische Verkeersregels",
    tagline: "Belgian Driving Theory",
    progress_label: "Onderwerpen geleerd",
    review_count: "Fouten",
    modes: {
      home: "Home",
      topics: "Onderwerpen",
      practice: "Oefenen",
      exam: "Examen",
      mistakes: "Fouten"
    },
    home_title: "Bereid je voor op het examen",
    home_desc: "Theoretisch examen categorie B in België",
    road_signs: "Verkeersborden",
    study_meanings: "Leer de betekenissen",
    situations: "Situaties",
    look_analyze: "Bekijk en analyseer",
    testing: "Toetsen",
    check_knowledge: "Test je kennis",
    my_mistakes: "Mijn fouten",
    repeat_hard: "Herhaal moeilijke",
    topics_title: "Leeronderwerpen",
    questions: "vragen",
    coming_soon: "Binnenkort",
    coming_soon_desc: "Dit gedeelte komt beschikbaar in toekomstige updates. We bereiden geverifieerde vragen en schema's voor.",
    start: "Start",
    exam_title: "Examenmodus",
    exam_desc: "50 vragen · 45 minuten · drempel 41/50",
    practice_title: "Oefenmodus",
    practice_desc: "Oefen zonder tijdslimiet",
    no_mistakes: "Nog geen fouten",
    no_mistakes_desc: "Maak toetsen om vragen te zien die herhaling nodig hebben",
    foot: "Voorbereiding op het theoretisch examen (cat. B)",
    select_topic: "Kies een onderwerp",
    all_topics: "Alle onderwerpen"
  },
  fr: {
    app_title: "Code de la route Belgique",
    tagline: "Belgian Driving Theory",
    progress_label: "Thèmes étudiés",
    review_count: "Erreurs",
    modes: {
      home: "Accueil",
      topics: "Thèmes",
      practice: "Pratique",
      exam: "Examen",
      mistakes: "Erreurs"
    },
    home_title: "Préparez-vous à l'examen",
    home_desc: "Examen théorique catégorie B en Belgique",
    road_signs: "Panneaux de signalisation",
    study_meanings: "Apprenez les significations",
    situations: "Situations",
    look_analyze: "Regardez et analysez",
    testing: "Tests",
    check_knowledge: "Vérifiez vos connaissances",
    my_mistakes: "Mes erreurs",
    repeat_hard: "Répétez les difficiles",
    topics_title: "Thèmes d'apprentissage",
    questions: "questions",
    coming_soon: "Bientôt disponible",
    coming_soon_desc: "Cette section sera disponible dans les prochaines mises à jour. Nous préparons des questions et schémas vérifiés.",
    start: "Commencer",
    exam_title: "Mode examen",
    exam_desc: "50 questions · 45 minutes · seuil 41/50",
    practice_title: "Mode pratique",
    practice_desc: "Entraînez-vous sans limite de temps",
    no_mistakes: "Pas encore d'erreurs",
    no_mistakes_desc: "Passez des tests pour voir les questions à revoir",
    foot: "Préparation à l'examen théorique (cat. B)",
    select_topic: "Choisissez un thème",
    all_topics: "Tous les thèmes"
  },
  en: {
    app_title: "Belgian Traffic Rules",
    tagline: "Belgian Driving Theory",
    progress_label: "Topics studied",
    review_count: "Mistakes",
    modes: {
      home: "Home",
      topics: "Topics",
      practice: "Practice",
      exam: "Exam",
      mistakes: "Mistakes"
    },
    home_title: "Prepare for the exam",
    home_desc: "Category B theory exam in Belgium",
    road_signs: "Road signs",
    study_meanings: "Study the meanings",
    situations: "Situations",
    look_analyze: "Look and analyze",
    testing: "Testing",
    check_knowledge: "Check your knowledge",
    my_mistakes: "My mistakes",
    repeat_hard: "Repeat the hard ones",
    topics_title: "Learning topics",
    questions: "questions",
    coming_soon: "Coming soon",
    coming_soon_desc: "This section will be available in future updates. We are preparing verified questions and diagrams.",
    start: "Start",
    exam_title: "Exam mode",
    exam_desc: "50 questions · 45 minutes · pass mark 41/50",
    practice_title: "Practice mode",
    practice_desc: "Practice without time limit",
    no_mistakes: "No mistakes yet",
    no_mistakes_desc: "Take tests to see questions that need review",
    foot: "Preparation for the theory exam (cat. B)",
    select_topic: "Select a topic",
    all_topics: "All topics"
  }
};

const topicsData = [
  { id: "signs", number: 1, questionsTarget: 100, name: { uk: "Дорожні знаки та сигнали", nl: "Verkeersborden en signalen", fr: "Panneaux et signaux", en: "Road signs and signals" } },
  { id: "priority", number: 2, questionsTarget: 80, name: { uk: "Пріоритет і перехрестя", nl: "Voorrang en kruispunten", fr: "Priorité et carrefours", en: "Priority and intersections" } },
  { id: "roundabout", number: 3, questionsTarget: 40, name: { uk: "Круговий рух", nl: "Rotondes", fr: "Ronds-points", en: "Roundabouts" } },
  { id: "speed", number: 4, questionsTarget: 50, name: { uk: "Швидкість і дистанція", nl: "Snelheid en afstand", fr: "Vitesse et distance", en: "Speed and distance" } },
  { id: "parking", number: 5, questionsTarget: 60, name: { uk: "Зупинка та паркування", nl: "Stoppen en parkeren", fr: "Arrêt et stationnement", en: "Stopping and parking" } },
  { id: "lanes", number: 6, questionsTarget: 50, name: { uk: "Смуги, повороти, перестроювання", nl: "Rijstroken en afslaan", fr: "Voies et virages", en: "Lanes, turns and changing" } },
  { id: "overtaking", number: 7, questionsTarget: 35, name: { uk: "Обгін і зустрічний роз'їзд", nl: "Inhalen en tegenliggers", fr: "Dépassement", en: "Overtaking and oncoming" } },
  { id: "vulnerable", number: 8, questionsTarget: 60, name: { uk: "Велосипедисти та пішоходи", nl: "Fietsers en voetgangers", fr: "Cyclistes et piétons", en: "Cyclists and pedestrians" } },
  { id: "motorways", number: 9, questionsTarget: 45, name: { uk: "Автомагістралі та тунелі", nl: "Autosnelwegen en tunnels", fr: "Autoroutes et tunnels", en: "Motorways and tunnels" } },
  { id: "weather", number: 10, questionsTarget: 50, name: { uk: "Погода та небезпеки", nl: "Weer en gevaren", fr: "Météo et dangers", en: "Weather and hazards" } },
  { id: "safety", number: 11, questionsTarget: 70, name: { uk: "Безпека, алкоголь, документи", nl: "Veiligheid en documenten", fr: "Sécurité et documents", en: "Safety and documents" } },
  { id: "mixed", number: 12, questionsTarget: 100, name: { uk: "Змішані екзаменаційні ситуації", nl: "Gemengde examensituaties", fr: "Situations d'examen mixtes", en: "Mixed exam situations" } }
];

function t(key) {
  const lang = window.currentLang || "uk";
  const parts = key.split(".");
  let val = translations[lang];
  for (const p of parts) {
    val = val?.[p];
  }
  if (val === undefined) {
    val = translations.uk;
    for (const p of parts) val = val?.[p];
  }
  return val ?? key;
}

function getTopicName(topic) {
  const lang = window.currentLang || "uk";
  return topic.name[lang] || topic.name.uk;
}
