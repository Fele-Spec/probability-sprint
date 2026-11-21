/* ============================================================
   应用外壳：路由、导航、间隔复习队列、XP/连击/成就、全局状态
   ============================================================ */
(function (root) {
  const App = root.App;
  const Store = App.Store;
  const SRS = root.SRS;

  App.data = {
    knowledge: root.KNOWLEDGE,
    questions: root.QUESTIONS,
    plan: root.PLAN,
    tips: root.TIPS,
    achievements: root.ACHIEVEMENTS
  };

  App.state = null;
  App.session = null;
  App.ui = {};
  App.actions = App.actions || {};
  App.views = App.views || {};
  App.labCleanup = null;
  App.quizKeyHandler = null;

  /* ---------------- 吉祥物与氛围 ---------------- */
  const MASCOT_LINES = {
    today: '先清复习，再学新的。',
    learn: '先猜后学，答错也算练。',
    section: '翻面前，先在心里回答一遍。',
    practice: '错题比新题值钱。',
    quiz: '别急，先看清题目在问什么。',
    lab: '拖一拖参数，看看曲线怎么变。',
    stats: '连续天数只是记录，不是债务。',
    method: '别只收藏方法，去用一次。',
    cheatsheet: '遮住右边，默写一遍。',
    settings: '考试日只影响倒计时，不跳章节。'
  };

  App.mascotSVG = function (size) {
    const s = size || 40;
    return '<svg class="mascot-svg" viewBox="0 0 120 120" width="' + s + '" height="' + s + '" aria-hidden="true">' +
      '<ellipse cx="60" cy="110" rx="28" ry="5" fill="rgba(28,42,37,.14)"/>' +
      '<rect x="20" y="12" width="80" height="80" rx="24" fill="#FFF6DE" stroke="#1C2A25" stroke-width="4"/>' +
      '<circle cx="35" cy="30" r="4.6" fill="#1C2A25"/>' +
      '<circle cx="85" cy="30" r="4.6" fill="#1C2A25"/>' +
      '<circle cx="85" cy="78" r="4.6" fill="#1C2A25"/>' +
      '<ellipse class="mascot-eye" cx="45" cy="53" rx="5.2" ry="6.8" fill="#1C2A25"/>' +
      '<ellipse class="mascot-eye" cx="75" cy="53" rx="5.2" ry="6.8" fill="#1C2A25"/>' +
      '<circle cx="33" cy="66" r="4.6" fill="#F4A28C" opacity=".55"/>' +
      '<circle cx="87" cy="66" r="4.6" fill="#F4A28C" opacity=".55"/>' +
      '<path d="M50 68 Q60 77 70 68" fill="none" stroke="#1C2A25" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M99 47 l2.5 6.3 6.3 2.5 -6.3 2.5 -2.5 6.3 -2.5 -6.3 -6.3 -2.5 6.3 -2.5z" fill="#F4B63F"/>' +
    '</svg>';
  };

  App.confetti = function (count) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rootEl = document.getElementById('confetti-root');
    if (!rootEl) return;
    const colors = ['#F4B63F', '#F26A4B', '#0E6B57', '#7B74D9', '#F2C9D8', '#BFE3F7', '#FFE8A9'];
    const amount = count || 28;
    for (let i = 0; i < amount; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = (8 + Math.random() * 84) + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
      piece.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      piece.style.animationDelay = (Math.random() * 0.16) + 's';
      piece.style.width = (6 + Math.random() * 7) + 'px';
      piece.style.height = (8 + Math.random() * 10) + 'px';
      if (Math.random() < 0.35) piece.style.borderRadius = '50%';
      rootEl.appendChild(piece);
      setTimeout(function () { piece.remove(); }, 1750);
    }
  };

  App.updateMascot = function () {
    const dock = document.getElementById('mascot-dock');
    if (!dock) return;
    const bubble = dock.querySelector('.mascot-bubble');
    if (bubble) bubble.textContent = MASCOT_LINES[App.route ? App.route.name : 'today'] || '先做一题，状态就来了。';
    dock.classList.toggle('hidden', !!App.ui.mascotHidden);
  };

  App.setupMascot = function () {
    const dock = document.getElementById('mascot-dock');
    if (!dock) return;
    try { App.ui.mascotHidden = sessionStorage.getItem('prob-mascot-hidden') === '1'; } catch (err) { /* ignore */ }
    dock.hidden = false;
    dock.innerHTML = '<div class="mascot-bubble">先做一题，状态就来了。</div>' +
      '<button class="mascot-btn" data-action="mascot-tip" aria-label="骰仔助手，点一下换一条提示">' + App.mascotSVG(60) + '</button>' +
      '<button class="mascot-close" data-action="mascot-close" aria-label="收起骰仔">×</button>';
    App.updateMascot();
  };

  App.actions['mascot-tip'] = function (el) {
    const tips = App.data.tips || [];
    if (tips.length) App.toast('🎲 ' + tips[Math.floor(Math.random() * tips.length)], 4200);
    const btn = document.querySelector('.mascot-btn');
    if (btn) {
      btn.classList.remove('celebrate-badge');
      void btn.offsetWidth;
      btn.classList.add('celebrate-badge');
    }
  };

  App.actions['mascot-close'] = function () {
    App.ui.mascotHidden = true;
    try { sessionStorage.setItem('prob-mascot-hidden', '1'); } catch (err) { /* ignore */ }
    App.updateMascot();
    App.toast('骰仔先躲一会儿，刷新页面会回来');
  };

  App.setupJuice = function () {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 点击涟漪：给按钮/卡片一个即时的按压反馈
    document.addEventListener('pointerdown', function (e) {
      if (reduce) return;
      const el = e.target.closest ? e.target.closest('.btn, .chip, .option, .nav-item, .lab-tab, .learn-tab, .quest-card, .chapter-tab, .achievement, .quick-link2, .tabbar a') : null;
      if (!el || el.disabled) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const size = Math.min(360, Math.max(rect.width, rect.height) * 0.9);
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = (e.clientX - rect.left) + 'px';
      dot.style.top = (e.clientY - rect.top) + 'px';
      el.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 620);
    }, { passive: true });

    // 星图悬停：显示知识点名称，让星星“可读”
    document.addEventListener('pointermove', function (e) {
      const tip = document.getElementById('map-tip');
      if (!tip) return;
      const node = e.target.closest ? e.target.closest('.map-node') : null;
      if (!node) { tip.classList.remove('show'); return; }
      const card = node.closest('.starmap-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      tip.textContent = node.getAttribute('data-name') || '';
      const x = e.clientX - r.left + 14;
      const y = e.clientY - r.top - 40;
      tip.style.left = Math.max(12, Math.min(r.width - 220, x)) + 'px';
      tip.style.top = Math.max(10, y) + 'px';
      tip.classList.add('show');
    }, { passive: true });
    window.addEventListener('scroll', function () {
      const tip = document.getElementById('map-tip');
      if (tip) tip.classList.remove('show');
    }, { passive: true });
  };

  const NAV = [
    { id: 'today', href: '#/today', icon: '☀️', label: '今日' },
    { id: 'learn', href: '#/learn', icon: '📖', label: '学习' },
    { id: 'practice', href: '#/practice', icon: '✏️', label: '练题' },
    { id: 'lab', href: '#/lab', icon: '🧪', label: '实验室' },
    { id: 'cheatsheet', href: '#/cheatsheet', icon: '📋', label: '公式速查' },
    { id: 'stats', href: '#/stats', icon: '📊', label: '数据' },
    { id: 'method', href: '#/method', icon: '🔬', label: '方法' }
  ];

  const TABBAR = [
    { id: 'today', href: '#/today', icon: '☀️', label: '今日' },
    { id: 'learn', href: '#/learn', icon: '📖', label: '学习' },
    { id: 'practice', href: '#/practice', icon: '✏️', label: '练题' },
    { id: 'lab', href: '#/lab', icon: '🧪', label: '实验室' },
    { id: 'stats', href: '#/stats', icon: '📊', label: '数据' }
  ];

  /* ---------------- 索引 ---------------- */
  function buildIndexes() {
    App.cardById = {};
    App.sectionById = {};
    App.chapterById = {};
    App.data.knowledge.chapters.forEach(function (ch) {
      App.chapterById[ch.id] = ch;
      ch.sections.forEach(function (sec) {
        sec.ch = ch.id;
        sec.chapterTitle = ch.title;
        sec.cards = (sec.cards || []).map(function (card, i) {
          const copy = Object.assign({}, card);
          copy.id = 'k' + sec.id + '-' + (i + 1);
          copy.sec = sec.id;
          copy.ch = ch.id;
          return copy;
        });
        App.sectionById[sec.id] = sec;
        sec.cards.forEach(function (card) { App.cardById[card.id] = card; });
      });
    });
    App.questionById = {};
    App.data.questions.forEach(function (q) { App.questionById[q.id] = q; });
    App.totalSections = Object.keys(App.sectionById).length;
    App.totalCards = Object.keys(App.cardById).length;
  }

  App.cardState = function (id) { return App.state.cards[id] || null; };
  App.questionState = function (id) { return App.state.questions[id] || null; };

  App.capDays = function () {
    const left = Store.examDaysLeft();
    return App.clamp(left, 0.5, 7);
  };

  App.sectionLearned = function (secId) { return !!App.state.learnedSections[secId]; };

  App.sectionCardSeen = function (sec) {
    let seen = 0;
    sec.cards.forEach(function (c) {
      const e = App.state.cards[c.id];
      if (e && e.seen > 0) seen++;
    });
    return seen;
  };

  App.sectionProgress = function (sec) {
    const total = sec.cards.length;
    const seen = App.sectionCardSeen(sec);
    if (!total) return App.sectionLearned(sec.id) ? 1 : 0;
    return Math.min(1, seen / total);
  };

  App.chapterProgress = function (ch) {
    const total = ch.sections.length;
    let done = 0;
    ch.sections.forEach(function (sec) { if (App.sectionLearned(sec.id)) done++; });
    return { done: done, total: total, pct: total ? done / total : 0 };
  };

  /* ---------------- 到期队列 ---------------- */
  App.dueItems = function (now) {
    const t = now || Date.now();
    const out = [];
    Object.keys(App.state.cards).forEach(function (id) {
      const e = App.state.cards[id];
      if (e && e.srs && App.cardById[id] && SRS.isDue(e.srs, t)) out.push({ kind: 'card', id: id, due: e.srs.due });
    });
    Object.keys(App.state.questions).forEach(function (id) {
      const e = App.state.questions[id];
      if (e && e.srs && App.questionById[id] && SRS.isDue(e.srs, t)) out.push({ kind: 'q', id: id, due: e.srs.due });
    });
    out.sort(function (a, b) { return (a.due || 0) - (b.due || 0); });
    return out;
  };

  App.nextDueText = function () {
    const t = Date.now();
    let min = null;
    Object.keys(App.state.cards).forEach(function (id) {
      const e = App.state.cards[id];
      if (e && e.srs && (!min || e.srs.due < min)) min = e.srs.due;
    });
    Object.keys(App.state.questions).forEach(function (id) {
      const e = App.state.questions[id];
      if (e && e.srs && (!min || e.srs.due < min)) min = e.srs.due;
    });
    if (min == null) return '还没有安排复习';
    if (min <= t) return '现在有到期内容';
    return SRS.nextDueText({ due: min }, t);
  };

  /* ---------------- XP / 连击 ---------------- */
  App.awardXp = function (n) {
    const before = Store.levelInfo();
    const amount = Store.addXp(n);
    const after = Store.levelInfo();
    if (after.level > before.level) {
      App.toast('🎉 升级！Lv.' + after.level + ' · ' + after.title, 3200);
      App.confetti(56);
    }
    return amount;
  };

  App.touchStreak = function () {
    const before = App.state.streak.current;
    const current = Store.markActive();
    if (current > before && current > 1) {
      App.toast('🔥 连续学习 ' + current + ' 天，保持住！');
    }
    return current;
  };

  /* ---------------- 卡片评分 ---------------- */
  App.rateCard = function (cardId, grade, meta) {
    const s = App.state;
    const now = Date.now();
    meta = meta || {};
    let entry = s.cards[cardId];
    if (!entry) {
      entry = { seen: 0, lastTs: 0, srs: null };
      s.cards[cardId] = entry;
    }
    entry.seen = (entry.seen || 0) + 1;
    entry.lastTs = now;
    entry.srs = SRS.review(entry.srs, grade, now, App.capDays());

    const xpMap = { again: 2, hard: 3, good: 4, easy: 5 };
    const xp = xpMap[grade] || 3;
    Store.ensureToday();
    s.daily.reviews += 1;
    App.touchStreak();
    App.awardXp(xp);
    Store.record({ ts: now, id: cardId, kind: 'card', correct: grade !== 'again', mode: meta.mode || 'learn' });
    Store.save();
    App.checkAchievements();
    return { entry: entry, xp: xp };
  };

  /* ---------------- 题目作答 ---------------- */
  App.answerQuestion = function (q, opts) {
    const s = App.state;
    const now = Date.now();
    opts = opts || {};
    const correct = !!opts.correct;
    let entry = s.questions[q.id];
    if (!entry) {
      entry = { attempts: 0, correct: 0, wrong: 0, streak: 0, lastTs: 0, srs: null };
      s.questions[q.id] = entry;
    }
    entry.attempts += 1;
    entry.lastTs = now;
    if (correct) {
      entry.correct += 1;
      entry.streak += 1;
    } else {
      entry.wrong += 1;
      entry.streak = 0;
    }
    const grade = correct ? (opts.hintUsed ? 'hard' : 'good') : 'again';
    entry.srs = SRS.review(entry.srs, grade, now, App.capDays());

    Store.ensureToday();
    s.daily.questions += 1;
    if (correct) s.daily.correct += 1;

    const xp = correct ? (opts.hintUsed ? 6 : 10) : 3;
    App.touchStreak();
    App.awardXp(xp);
    Store.record({ ts: now, id: q.id, kind: 'q', correct: correct, mode: opts.mode || 'practice' });
    Store.save();
    App.checkAchievements();
    return { entry: entry, xp: xp, grade: grade };
  };

  /* ---------------- 学完小节 ---------------- */
  App.markSectionLearned = function (secId, opts) {
    const s = App.state;
    const sec = App.sectionById[secId];
    if (!sec) return false;
    const was = !!s.learnedSections[secId];
    s.learnedSections[secId] = true;

    // 未接触过的卡片先安排到明天，保证间隔复习队列不会漏
    sec.cards.forEach(function (card) {
      if (!s.cards[card.id]) {
        s.cards[card.id] = { seen: 0, lastTs: 0, srs: SRS.review(null, 'good', Date.now(), App.capDays()) };
      }
    });

    Store.save();
    if (!was) {
      App.awardXp(6);
      Store.save();
      App.checkAchievements();
      App.toast('✅ 已标记「' + sec.title + '」为已学 +6 能量');
    }
    return true;
  };

  /* ---------------- 抽题 ---------------- */
  App.pickQuestions = function (opts) {
    opts = opts || {};
    const chapters = opts.chapters && opts.chapters.length ? opts.chapters : null;
    const diff = opts.diff;
    const sections = opts.sections || null;
    const includeCalc = opts.includeCalc !== false;
    const pool = App.data.questions.filter(function (q) {
      if (chapters && chapters.indexOf(q.ch) === -1) return false;
      if (diff && diff !== 'all' && q.diff !== diff) return false;
      if (sections && sections.indexOf(q.sec) === -1) return false;
      if (!includeCalc && q.type === 'calc') return false;
      return true;
    });
    const unseen = [], seen = [];
    pool.forEach(function (q) {
      const e = App.state.questions[q.id];
      (e && e.attempts > 0 ? seen : unseen).push(q.id);
    });
    const picked = App.shuffle(unseen).concat(App.shuffle(seen));
    const count = App.clamp(opts.count || 10, 1, 50);
    return picked.slice(0, count);
  };

  App.startQuiz = function (opts) {
    opts = opts || {};
    let items = opts.items;
    if (!items || !items.length) {
      const ids = App.pickQuestions(opts);
      items = ids.map(function (id) { return { kind: 'q', id: id }; });
    }
    if (!items.length) {
      App.toast('😅 这一组没有可用题目，换个筛选条件吧');
      return;
    }
    App.session = {
      items: items,
      idx: 0,
      mode: opts.mode || 'practice',
      title: opts.title || '练习',
      startTs: Date.now(),
      finished: false,
      correct: 0,
      graded: 0,
      answers: [],
      sel: null,
      revealed: false,
      hintUsed: false,
      feedback: null,
      calcRating: null,
      combo: 0,
      maxCombo: 0,
      celebrated: false
    };
    App.go('#/quiz');
  };

  /* ---------------- 成就 ---------------- */
  function countCorrect() {
    return Object.keys(App.state.questions).reduce(function (sum, id) {
      return sum + (App.state.questions[id].correct || 0);
    }, 0);
  }

  App.totalAnswered = function () {
    return Object.keys(App.state.questions).reduce(function (sum, id) {
      return sum + (App.state.questions[id].attempts || 0);
    }, 0);
  };

  function chapterLearned(chId) {
    const ch = App.chapterById[chId];
    if (!ch) return false;
    return ch.sections.every(function (sec) { return App.sectionLearned(sec.id); });
  }

  function wrongBookIds() {
    return Object.keys(App.state.questions).filter(function (id) {
      const e = App.state.questions[id];
      return e && e.wrong > 0 && e.streak < 2;
    });
  }
  App.wrongBookIds = wrongBookIds;

  const CHECKERS = {
    'first-step': function () { return true; },
    'first-card': function () {
      return Object.keys(App.state.cards).some(function (id) { return App.state.cards[id].seen > 0; });
    },
    'first-q': function () {
      return Object.keys(App.state.questions).some(function (id) { return App.state.questions[id].attempts > 0; });
    },
    'correct10': function () { return countCorrect() >= 10; },
    'correct50': function () { return countCorrect() >= 50; },
    'streak3': function () { return App.state.streak.current >= 3; },
    'streak7': function () { return App.state.streak.current >= 7; },
    'ch1': function () { return chapterLearned(1); },
    'ch2': function () { return chapterLearned(2); },
    'ch3': function () { return chapterLearned(3); },
    'exam': function () { return !!App.state.flags.examDone; },
    'perfect': function () { return !!App.state.flags.perfect; },
    'error-clear': function () {
      return App.totalAnswered() >= 10 && wrongBookIds().length === 0;
    }
  };

  App.checkAchievements = function (silent) {
    const s = App.state;
    const unlocked = [];
    App.data.achievements.forEach(function (a) {
      if (s.achievements[a.id]) return;
      const check = CHECKERS[a.id];
      if (check && check()) {
        s.achievements[a.id] = Date.now();
        unlocked.push(a);
      }
    });
    if (unlocked.length) {
      Store.save();
      if (!silent) {
        unlocked.forEach(function (a) {
          App.toast(a.icon + ' 解锁成就「' + a.name + '」', 3200);
        });
        App.confetti(26);
      }
    }
    return unlocked;
  };

  /* ---------------- 统计 ---------------- */
  App.computeStats = function () {
    const s = App.state;
    let answered = 0, correct = 0, wrongEntries = 0;
    Object.keys(s.questions).forEach(function (id) {
      const e = s.questions[id];
      answered += e.attempts || 0;
      correct += e.correct || 0;
      if (e.wrong > 0 && e.streak < 2) wrongEntries += 1;
    });

    const chapterStats = App.data.knowledge.chapters.map(function (ch) {
      const learn = App.chapterProgress(ch);
      let att = 0, cor = 0, cards = 0;
      ch.sections.forEach(function (sec) {
        cards += App.sectionCardSeen(sec);
      });
      App.data.questions.forEach(function (q) {
        if (q.ch !== ch.id) return;
        const e = s.questions[q.id];
        if (e) { att += e.attempts || 0; cor += e.correct || 0; }
      });
      return {
        id: ch.id, title: ch.title, emoji: ch.emoji,
        answered: att, correct: cor,
        accuracy: att ? cor / att : null,
        learned: learn.done, totalSections: learn.total,
        cardsSeen: cards, cardsTotal: ch.sections.reduce(function (n, sec) { return n + sec.cards.length; }, 0)
      };
    });

    const tagMap = {};
    App.data.questions.forEach(function (q) {
      const e = s.questions[q.id];
      if (!e || !e.attempts) return;
      (q.tags || []).forEach(function (tag) {
        if (!tagMap[tag]) tagMap[tag] = { tag: tag, attempts: 0, correct: 0 };
        tagMap[tag].attempts += e.attempts;
        tagMap[tag].correct += e.correct;
      });
    });
    const tagStats = Object.keys(tagMap).map(function (k) {
      const t = tagMap[k];
      return { tag: t.tag, attempts: t.attempts, correct: t.correct, accuracy: t.correct / t.attempts };
    }).sort(function (a, b) { return a.accuracy - b.accuracy; });

    const today = App.todayKey();
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const key = App.addDaysKey(today, -i);
      const count = s.history.filter(function (h) { return App.dateKey(new Date(h.ts)) === key; }).length;
      week.push({ key: key, count: count, label: key.slice(5).replace('-', '/') });
    }

    return {
      answered: answered,
      correct: correct,
      accuracy: answered ? correct / answered : null,
      wrongCount: wrongEntries,
      mastered: Object.keys(s.questions).filter(function (id) {
        const e = s.questions[id];
        return e && e.streak >= 2;
      }).length,
      learnedSections: Store.learnedSectionCount(),
      totalSections: App.totalSections,
      seenCards: Object.keys(s.cards).filter(function (id) { return s.cards[id].seen > 0; }).length,
      totalCards: App.totalCards,
      due: App.dueItems().length,
      chapterStats: chapterStats,
      tagStats: tagStats,
      week: week,
      streak: s.streak.current,
      xp: s.xp,
      level: Store.levelInfo(),
      wrongIds: wrongBookIds()
    };
  };

  /* ---------------- 弹窗 / 提示 ---------------- */
  App.toast = function (message, ms) {
    const rootEl = document.getElementById('toast-root');
    if (!rootEl) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    rootEl.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity .2s ease';
      setTimeout(function () { el.remove(); }, 220);
    }, ms || 2600);
  };

  App.modal = function (opts) {
    const rootEl = document.getElementById('modal-root');
    const foot = opts.foot || '<button class="btn btn-ghost" data-modal-close="1">关闭</button>';
    rootEl.innerHTML = '<div class="modal-overlay" data-modal-overlay="1">' +
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<h2>' + (opts.title || '') + '</h2>' +
      (opts.sub ? '<div class="modal-sub">' + opts.sub + '</div>' : '') +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      '<div class="modal-foot">' + foot + '</div>' +
      '</div></div>';
    const overlay = rootEl.querySelector('.modal-overlay');
    const modalEl = rootEl.querySelector('.modal');
    function close() { rootEl.innerHTML = ''; }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
      if (e.target.closest('[data-modal-close]')) close();
    });
    modalEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-modal-close]');
      if (btn) close();
    });
    if (opts.onMount) opts.onMount(modalEl, close);
    return { close: close, el: modalEl };
  };

  /* ---------------- 导出 / 导入 ---------------- */
  App.exportData = function () {
    try {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '概率冲刺存档-' + App.todayKey() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      App.toast('📦 存档已导出');
    } catch (err) {
      console.warn(err);
      App.toast('导出失败，请用桌面浏览器打开');
    }
  };

  App.importData = function (text) {
    const res = Store.importJSON(text);
    if (res.ok) {
      App.state = Store.state;
      App.toast('✅ 存档已导入');
      App.render();
    } else {
      App.toast('❌ 导入失败：' + res.msg);
    }
  };

  /* ---------------- 路由 ---------------- */
  function parseRoute() {
    const raw = (location.hash || '#/today').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length) return { name: 'today', params: {} };
    if (parts[0] === 'learn' && parts[1]) return { name: 'section', params: { secId: parts[1] } };
    const known = ['today', 'learn', 'practice', 'quiz', 'lab', 'stats', 'method', 'cheatsheet', 'settings'];
    if (known.indexOf(parts[0]) !== -1) return { name: parts[0], params: {} };
    return { name: 'today', params: {} };
  }

  const TITLES = {
    today: '今日', learn: '学习', section: '学习', practice: '练题', quiz: '做题',
    lab: '实验室', stats: '数据', method: '方法', cheatsheet: '公式速查', settings: '设置'
  };

  function navItem(item, active) {
    const badge = item.id === 'practice' && App.dueItems().length
      ? '<span class="nav-badge">' + App.dueItems().length + '</span>' : '';
    return '<a class="nav-item' + (active ? ' active' : '') + '" href="' + item.href + '">' +
      '<span class="nav-icon">' + item.icon + '</span><span class="nav-label">' + item.label + '</span>' + badge + '</a>';
  }

  function shellHTML(route) {
    const s = App.state;
    const lvl = Store.levelInfo();
    const streak = s.streak.current;
    const active = route.name === 'section' ? 'learn' : route.name;
    const nav = NAV.map(function (item) { return navItem(item, item.id === active); }).join('');
    const tabs = TABBAR.map(function (item) {
      return '<a class="' + (item.id === active ? 'active' : '') + '" href="' + item.href + '">' +
        '<span class="i">' + item.icon + '</span><span>' + item.label + '</span></a>';
    }).join('');
    const daysLeft = Store.examDaysLeft();
    const examText = daysLeft === 0 ? '今天考试' : '🗓️ 还剩 ' + daysLeft + ' 天';
    const due = App.dueItems().length;

    return '<aside class="sidebar">' +
      '<a class="brand" href="#/today"><span class="brand-mark">' + App.mascotSVG(40) + '</span>' +
      '<span><span class="brand-name">概率冲刺</span><span class="brand-sub">PROB SPRINT · 7 DAYS</span></span></a>' +
      '<div class="nav-caption">PLAYGROUND</div>' +
      '<nav class="nav">' + nav + '</nav>' +
      '<div class="nav-note">浙大版第五版 · 前三章<br>16 小节 · 94 道题 · 4 个实验室</div>' +
      '<div class="side-foot">' +
        '<div class="passport">' +
          '<div class="passport-head"><span class="passport-lv">Lv.' + lvl.level + '</span><span class="passport-title">' + lvl.title + '</span></div>' +
          '<div class="passport-xp"><span>' + lvl.progress + ' / ' + lvl.need + ' XP</span><span>' + s.xp + ' total</span></div>' +
          '<div class="progress"><span style="width:' + Math.round(lvl.pct * 100) + '%"></span></div>' +
          '<div class="passport-meta"><span>🔥 <b>' + streak + '</b> 天</span><span>' + examText + ' · 到期 ' + due + '</span></div>' +
        '</div>' +
        '<a class="nav-item" href="#/settings"><span class="nav-icon">⚙️</span><span>设置与数据</span></a>' +
      '</div>' +
    '</aside>' +
    '<div class="mobile-top"><span class="brand-mark">' + App.mascotSVG(30) + '</span><span class="brand-name">概率冲刺</span><span class="spacer"></span>' +
      '<span class="m-streak">🔥 ' + streak + ' 天 · Lv.' + lvl.level + '</span></div>' +
    '<main class="main" id="view"></main>' +
    '<nav class="tabbar">' + tabs + '</nav>';
  }

  App.render = function (opts) {
    opts = opts || {};
    Store.ensureToday();
    if (App.labCleanup) {
      try { App.labCleanup(); } catch (err) { /* ignore */ }
      App.labCleanup = null;
    }
    App.quizKeyHandler = null;
    if (App.quizTimer) { clearInterval(App.quizTimer); App.quizTimer = null; }
    const route = parseRoute();
    if (route.name === 'quiz' && !App.session) {
      location.hash = '#/practice';
      return;
    }
    const routeKey = route.name + ':' + (route.params.secId || '');
    const changed = routeKey !== App._routeKey;
    App._routeKey = routeKey;
    App.route = route;
    document.body.dataset.route = route.name;
    document.title = '概率冲刺 · ' + (TITLES[route.name] || '今日');

    const app = document.getElementById('app');
    app.innerHTML = shellHTML(route);
    const view = document.getElementById('view');
    if (changed) view.classList.add('route-enter');
    const fn = App.views[route.name] || App.views.today;
    try {
      fn(view, route.params);
    } catch (err) {
      console.error(err);
      view.innerHTML = '<div class="card card-pad"><h2>这一页出了点问题</h2>' +
        '<p class="muted" style="margin-top:8px">' + App.esc(err.message) + '</p>' +
        '<button class="btn btn-primary" style="margin-top:14px" onclick="location.reload()">刷新页面</button></div>';
    }
    App.updateMascot();
    if (!opts.keepScroll) window.scrollTo(0, 0);
  };

  App.go = function (hash) {
    if (location.hash === hash) App.render();
    else location.hash = hash;
  };

  App.save = function () { return Store.save(); };

  /* ---------------- 启动 ---------------- */
  function init() {
    App.state = Store.load();
    buildIndexes();
    App.checkAchievements(true);
    App.setupMascot();
    App.setupJuice();
    if (!App.state.achievements['first-step']) {
      App.state.achievements['first-step'] = Date.now();
      Store.save();
      setTimeout(function () { App.toast('🎲 欢迎来到概率冲刺，先看今日任务吧', 3600); }, 400);
    }
    window.addEventListener('hashchange', function () { App.render(); });
    document.addEventListener('click', function (e) {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const fn = App.actions[el.getAttribute('data-action')];
      if (fn) { e.preventDefault(); fn(el, e); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const rootEl = document.getElementById('modal-root');
        if (rootEl && rootEl.innerHTML) rootEl.innerHTML = '';
      }
      if (App.quizKeyHandler) App.quizKeyHandler(e);
    });
    document.addEventListener('input', function (e) {
      const el = e.target.closest('[data-quiz-input]');
      if (el && App.session) App.session.input = el.value;
    });
    window.addEventListener('beforeunload', function () { Store.save(); });
    App.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);

