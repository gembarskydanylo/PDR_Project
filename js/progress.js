const Progress = {
  STORAGE_KEY: "belgium_pdr_progress",

  getDefault() {
    return {
      language: "uk",
      region: "all",
      answers: {},        // { [questionId]: { ok: boolean, everOk: boolean, n: number } }
      mistakes: [],       // id питань, на які востаннє відповіли неправильно
      examHistory: [],
      totalCorrect: 0,
      totalAnswered: 0
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefault();
      const data = { ...this.getDefault(), ...JSON.parse(raw) };
      delete data.topicsCompleted; // старе поле версії Gemini — тепер рахується з answers
      return data;
    } catch (e) {
      console.warn("Failed to load progress", e);
      return this.getDefault();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save progress", e);
    }
  },

  get() {
    return this.load();
  },

  update(partial) {
    const updated = { ...this.load(), ...partial };
    this.save(updated);
    return updated;
  },

  recordAnswer(questionId, ok) {
    const data = this.load();
    const prev = data.answers[questionId] || { ok: false, everOk: false, n: 0 };
    data.answers[questionId] = { ok, everOk: prev.everOk || ok, n: prev.n + 1 };
    data.totalAnswered += 1;
    if (ok) {
      data.totalCorrect += 1;
      data.mistakes = data.mistakes.filter((id) => id !== questionId);
    } else if (!data.mistakes.includes(questionId)) {
      data.mistakes.push(questionId);
    }
    this.save(data);
  },

  // Частка питань теми, на які хоч раз відповіли правильно (0–100).
  topicPercent(questionIds) {
    if (!questionIds.length) return 0;
    const answers = this.load().answers;
    const done = questionIds.filter((id) => answers[id]?.everOk).length;
    return Math.round((done / questionIds.length) * 100);
  },

  getMistakes() {
    return this.load().mistakes;
  },

  setLanguage(lang) {
    return this.update({ language: lang });
  },

  setRegion(region) {
    return this.update({ region });
  }
};
