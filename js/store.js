/* 本地存档层：localStorage 持久化 + 状态规范化 */
(function (root) {
  const App = root.App || (root.App = {});
  const KEY = 'probsprint.state.v1';

  const TITLES = [
    '概率萌新', '骰子学徒', '样本空间旅人', '古典概型猎手', '条件概率侦探',
    '分布驯兽师', '正态之星', '二维漫游者', '卷积炼金师', '概率大师'
  ];

  function freshDaily(date) {
    return { date: date, reviews: 0, questions: 0, correct: 0, xp: 0, notes: 0, sims: 0, quizzes: 0 };
  }

  function defaults() {
    const today = App.todayKey();
    return {
      v: 1,
      createdAt: today,
      startDate: today,
      examDate: App.addDaysKey(today, 6),
      xp: 0,
      streak: { current: 0, best: 0, last: null },
      daily: freshDaily(today),
      learnedSections: {},
      cards: {},
      questions: {},
      notes: {},
      achievements: {},
      flags: {},
      history: [],
      settings: { dailyQuestions: 8, name: '', showHints: true },
      lastRoute: '#/today'
    };
  }

  function isDateKey(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')); }

  function normalize(raw) {
    const d = defaults();
    const s = Object.assign({}, d);
    raw = raw && typeof raw === 'object' ? raw : {};

    ['createdAt', 'startDate', 'examDate'].forEach(function (k) {
      if (isDateKey(raw[k])) s[k] = raw[k];
    });
    if (!isDateKey(s.createdAt)) s.createdAt = d.createdAt;
    if (!isDateKey(s.startDate)) s.startDate = d.createdAt;
    if (!isDateKey(s.examDate)) s.examDate = App.addDaysKey(s.startDate, 6);

    s.xp = Number.isFinite(Number(raw.xp)) ? Math.max(0, Number(raw.xp)) : 0;
    if (raw.streak && typeof raw.streak === 'object') {
      s.streak.current = Math.max(0, Number(raw.streak.current) || 0);
      s.streak.best = Math.max(s.streak.current, Number(raw.streak.best) || 0);
      s.streak.last = isDateKey(raw.streak.last) ? raw.streak.last : null;
    }
    if (raw.daily && typeof raw.daily === 'object') {
      s.daily = Object.assign(freshDaily(isDateKey(raw.daily.date) ? raw.daily.date : d.daily.date), raw.daily);
      if (!isDateKey(s.daily.date)) s.daily.date = d.daily.date;
    }
    if (raw.settings && typeof raw.settings === 'object') {
      s.settings = Object.assign(d.settings, raw.settings);
      s.settings.dailyQuestions = App.clamp(Number(s.settings.dailyQuestions) || 8, 1, 50);
    }

    ['learnedSections', 'cards', 'questions', 'notes', 'achievements', 'flags'].forEach(function (k) {
      if (raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])) s[k] = raw[k];
    });

    s.history = Array.isArray(raw.history) ? raw.history.filter(function (h) {
      return h && typeof h.ts === 'number';
    }).slice(-1000) : [];

    if (typeof raw.lastRoute === 'string' && raw.lastRoute.startsWith('#/')) s.lastRoute = raw.lastRoute;
    s.v = 1;
    return s;
  }

  const Store = {
    state: null,

    load: function () {
      let raw = null;
      try {
        const text = localStorage.getItem(KEY);
        if (text) raw = JSON.parse(text);
      } catch (err) {
        console.warn('[概率冲刺] 读取存档失败，使用新存档', err);
      }
      Store.state = normalize(raw);
      Store.ensureToday();
      return Store.state;
    },

    save: function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(Store.state));
        return true;
      } catch (err) {
        console.warn('[概率冲刺] 保存失败', err);
        if (App.toast) App.toast('⚠️ 存档写入失败，请检查浏览器存储空间');
        return false;
      }
    },

    ensureToday: function () {
      const today = App.todayKey();
      if (Store.state.daily.date !== today) {
        Store.state.daily = freshDaily(today);
      }
      return today;
    },

    markActive: function () {
      const s = Store.state;
      const today = App.todayKey();
      Store.ensureToday();
      if (s.streak.last === today) return s.streak.current;
      s.streak.current = s.streak.last === App.addDaysKey(today, -1)
        ? Math.max(1, s.streak.current + 1)
        : 1;
      s.streak.best = Math.max(s.streak.best, s.streak.current);
      s.streak.last = today;
      return s.streak.current;
    },

    addXp: function (n) {
      const s = Store.state;
      const amount = Math.max(0, Math.round(n || 0));
      s.xp += amount;
      Store.ensureToday();
      s.daily.xp += amount;
      return amount;
    },

    levelInfo: function () {
      const xp = Store.state ? Store.state.xp : 0;
      const level = 1 + Math.floor(xp / 120);
      const progress = xp % 120;
      const title = TITLES[Math.min(TITLES.length - 1, level - 1)] || '概率传说';
      return {
        level: level,
        title: title,
        xp: xp,
        progress: progress,
        need: 120,
        pct: progress / 120,
        nextTitle: TITLES[Math.min(TITLES.length - 1, level)] || '概率传说'
      };
    },

    examDaysLeft: function () {
      if (!Store.state) return 6;
      return Math.max(0, App.diffDays(App.todayKey(), Store.state.examDate));
    },

    planDay: function () {
      // 7 天计划从“首次使用日”开始推进；考试日只影响倒计时与复习间隔封顶
      const since = App.diffDays(Store.state.startDate, App.todayKey());
      return App.clamp(since + 1, 1, 7);
    },

    record: function (entry) {
      const s = Store.state;
      s.history.push(entry);
      if (s.history.length > 1000) s.history = s.history.slice(-800);
    },

    learnedSectionCount: function () {
      return Object.keys(Store.state.learnedSections || {}).filter(function (k) {
        return Store.state.learnedSections[k];
      }).length;
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      Store.state = defaults();
      Store.save();
      return Store.state;
    },

    exportJSON: function () {
      return JSON.stringify({
        app: 'prob-sprint',
        exportedAt: new Date().toISOString(),
        state: Store.state
      }, null, 2);
    },

    importJSON: function (text) {
      let obj;
      try { obj = JSON.parse(text); } catch (err) { return { ok: false, msg: '不是合法的 JSON' }; }
      const raw = obj && obj.state ? obj.state : obj;
      if (!raw || typeof raw !== 'object' || !raw.questions || !raw.learnedSections) {
        return { ok: false, msg: '存档结构不匹配' };
      }
      Store.state = normalize(raw);
      Store.ensureToday();
      Store.save();
      return { ok: true, msg: '已导入存档' };
    }
  };

  App.Store = Store;
  if (typeof window !== 'undefined') window.App = App;
  if (typeof module !== 'undefined' && module.exports) module.exports = Store;
})(typeof window !== 'undefined' ? window : globalThis);
