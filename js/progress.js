const Progress = {
  STORAGE_KEY: 'belgium_pdr_progress',

  getDefault() {
    return {
      language: 'uk',
      topicsCompleted: {},
      questionsAnswered: {},
      mistakes: [],
      examHistory: [],
      lastScreen: 'home',
      totalCorrect: 0,
      totalAnswered: 0
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefault();
      return { ...this.getDefault(), ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load progress', e);
      return this.getDefault();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save progress', e);
    }
  },

  get() {
    return this.load();
  },

  update(partial) {
    const current = this.load();
    const updated = { ...current, ...partial };
    this.save(updated);
    return updated;
  },

  getTopicsCompletedCount() {
    const data = this.load();
    return Object.values(data.topicsCompleted).filter(Boolean).length;
  },

  markTopicProgress(topicId, percent) {
    const data = this.load();
    data.topicsCompleted[topicId] = percent;
    this.save(data);
  },

  addMistake(questionId) {
    const data = this.load();
    if (!data.mistakes.includes(questionId)) {
      data.mistakes.push(questionId);
      this.save(data);
    }
  },

  removeMistake(questionId) {
    const data = this.load();
    data.mistakes = data.mistakes.filter(id => id !== questionId);
    this.save(data);
  },

  getMistakes() {
    return this.load().mistakes;
  },

  setLanguage(lang) {
    return this.update({ language: lang });
  }
};
