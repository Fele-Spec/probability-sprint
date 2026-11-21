/* 今日：游乐园版首页 */
(function (root) {
  const App = root.App;
  const Store = App.Store;

  const DAY_EMOJI = { 1: '🧭', 2: '🎲', 3: '🎯', 4: '📈', 5: '🧊', 6: '🌀', 7: '🏁' };

  const STAR_POS = {
    '1-1': [78, 238], '1-2': [132, 154], '1-3': [204, 198], '1-4': [250, 106], '1-5': [316, 166], '1-6': [284, 258],
    '2-1': [398, 220], '2-2': [448, 134], '2-3': [510, 190], '2-4': [556, 98], '2-5': [592, 238],
    '3-1': [668, 224], '3-2': [718, 140], '3-3': [774, 196], '3-4': [824, 108], '3-5': [866, 240]
  };

  const STAR_LINES = [
    ['1-1', '1-2'], ['1-2', '1-3'], ['1-3', '1-5'], ['1-5', '1-4'], ['1-3', '1-6'],
    ['2-1', '2-2'], ['2-2', '2-3'], ['2-3', '2-4'], ['2-4', '2-5'], ['2-3', '2-5'],
    ['3-1', '3-2'], ['3-2', '3-3'], ['3-3', '3-4'], ['3-4', '3-5'], ['3-3', '3-5']
  ];

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function currentPlanSections(planDay) {
    const day = App.data.plan.days[planDay - 1];
    return day && day.sections ? day.sections : [];
  }

  function fortune() {
    const today = App.todayKey();
    if (!App.ui.fortune || App.ui.fortune.day !== today) {
      App.ui.fortune = { day: today, idx: Math.floor(Math.random() * App.data.tips.length), pulls: 1 };
    }
    return App.ui.fortune;
  }

  function starMapSVG(planDay) {
    const chapters = App.data.knowledge.chapters;
    const current = new Set(currentPlanSections(planDay));
    const lines = STAR_LINES.map(function (pair) {
      const a = STAR_POS[pair[0]], b = STAR_POS[pair[1]];
      if (!a || !b) return '';
      return '<line class="map-line" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"></line>';
    }).join('');

    const labelX = { 1: 76, 2: 392, 3: 662 };
    const chapterLabels = chapters.map(function (ch) {
      const learned = ch.sections.filter(function (sec) { return App.sectionLearned(sec.id); }).length;
      return '<text class="map-chapter" x="' + labelX[ch.id] + '" y="52">第' + ['一', '二', '三'][ch.id - 1] + '章 · ' + ch.title + '</text>' +
        '<text class="map-chapter-count" x="' + labelX[ch.id] + '" y="68">' + learned + ' / ' + ch.sections.length + ' 颗星</text>';
    }).join('');

    const nodes = chapters.map(function (ch) {
      return ch.sections.map(function (sec) {
        const pos = STAR_POS[sec.id];
        if (!pos) return '';
        const learned = App.sectionLearned(sec.id);
        const isCurrent = current.has(sec.id) && !learned;
        const cls = ['map-node'];
        if (learned) cls.push('learned');
        if (isCurrent) cls.push('current');
        return '<g class="' + cls.join(' ') + '" data-action="map-sec" data-sec="' + sec.id + '" tabindex="0" role="link" aria-label="' + App.esc(sec.title) + '">' +
          '<title>' + App.esc(sec.num + ' ' + sec.title + (learned ? ' · 已学' : ' · 未学')) + '</title>' +
          '<circle class="node-halo" cx="' + pos[0] + '" cy="' + pos[1] + '" r="19"></circle>' +
          '<circle class="node-core" cx="' + pos[0] + '" cy="' + pos[1] + '" r="' + (isCurrent ? 10.5 : 9) + '"></circle>' +
          '<text class="node-label" x="' + pos[0] + '" y="' + (pos[1] + 21) + '">' + sec.num + '</text>' +
        '</g>';
      }).join('');
    }).join('');

    return '<svg class="starmap-svg" viewBox="0 0 920 330" role="img" aria-label="概率星图：三章共 16 个知识小节">' +
      '<circle class="map-orbit" cx="205" cy="180" r="132"></circle>' +
      '<circle class="map-orbit" cx="500" cy="175" r="122"></circle>' +
      '<circle class="map-orbit" cx="765" cy="178" r="120"></circle>' +
      '<g class="map-dust">' +
        '<circle cx="44" cy="96" r="1.4" fill="rgba(255,249,236,.35)"></circle>' +
        '<circle cx="350" cy="78" r="1.2" fill="rgba(255,249,236,.3)"></circle>' +
        '<circle cx="616" cy="86" r="1.3" fill="rgba(255,249,236,.32)"></circle>' +
        '<circle cx="892" cy="132" r="1.4" fill="rgba(255,249,236,.3)"></circle>' +
        '<circle cx="90" cy="300" r="1.2" fill="rgba(255,249,236,.25)"></circle>' +
        '<circle cx="470" cy="300" r="1.3" fill="rgba(255,249,236,.25)"></circle>' +
      '</g>' +
      lines + chapterLabels + nodes +
    '</svg>';
  }

  function starMapMobile(planDay) {
    const current = new Set(currentPlanSections(planDay));
    const chapters = App.data.knowledge.chapters;
    let html = '<div class="map-grid">';
    chapters.forEach(function (ch) {
      const learned = ch.sections.filter(function (sec) { return App.sectionLearned(sec.id); }).length;
      html += '<div class="map-grid-ch"><span>第' + ['一', '二', '三'][ch.id - 1] + '章 · ' + ch.title + '</span><span>' + learned + '/' + ch.sections.length + '</span></div>';
      ch.sections.forEach(function (sec) {
        const isLearned = App.sectionLearned(sec.id);
        const isCurrent = current.has(sec.id) && !isLearned;
        const cls = ['map-grid-node'];
        if (isLearned) cls.push('learned');
        if (isCurrent) cls.push('current');
        html += '<button class="' + cls.join(' ') + '" data-action="map-sec" data-sec="' + sec.id + '" title="' + App.esc(sec.title) + '">' +
          '<span>' + sec.num + '</span><span class="gdot"></span></button>';
      });
    });
    html += '</div>';
    return html;
  }

  function trailHTML(planDay) {
    const s = App.state;
    return App.data.plan.days.map(function (d) {
      const sections = (d.sections || []).map(function (id) { return App.sectionById[id]; });
      const done = d.day < planDay && (sections.length
        ? sections.every(function (sec) { return App.sectionLearned(sec.id); })
        : !!s.flags.examDone);
      const cls = ['trail-stop'];
      if (done) cls.push('done');
      if (d.day === planDay) cls.push('current');
      return '<div class="' + cls.join(' ') + '">' +
        '<div class="trail-dot">' + (done ? '✓' : DAY_EMOJI[d.day]) + '</div>' +
        '<div class="trail-label">DAY ' + d.day + '</div>' +
        '<div class="trail-title">' + d.title + '</div>' +
      '</div>';
    }).join('');
  }

  App.views.today = function (view) {
    const s = App.state;
    const planDay = Store.planDay();
    const dayInfo = App.data.plan.days[planDay - 1];
    const examLeft = Store.examDaysLeft();
    const examRawLeft = App.diffDays(App.todayKey(), s.examDate);
    const planRemaining = Math.max(0, 7 - planDay);
    const compressed = examRawLeft >= 0 && examRawLeft < planRemaining;

    const due = App.dueItems();
    const dueCards = due.filter(function (i) { return i.kind === 'card'; }).length;
    const dueQs = due.length - dueCards;
    const reviewDone = due.length === 0;

    const todaySections = currentPlanSections(planDay).map(function (id) { return App.sectionById[id]; }).filter(Boolean);
    const learnedCount = todaySections.filter(function (sec) { return App.sectionLearned(sec.id); }).length;
    const learnDone = todaySections.length === 0 || learnedCount === todaySections.length;

    const target = Math.max(6, dayInfo.practice.count || 8);
    const practiceDone = s.daily.questions >= target;
    const tasksDone = [reviewDone, learnDone, practiceDone].filter(Boolean).length;
    const ringPct = Math.round((tasksDone / 3) * 100);

    const stats = App.computeStats();
    const lvl = Store.levelInfo();
    const dateText = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
    const f = fortune();
    const tip = App.data.tips[f.idx] || App.data.tips[0];

    let examHeadline;
    if (examRawLeft < 0) examHeadline = '考试日已过，<span class="hl">去调日期</span>。';
    else if (examRawLeft === 0) examHeadline = '今天就是考试日，<span class="hl">稳住</span>。';
    else examHeadline = '还差 ' + examLeft + ' 天，<span class="hl">够用</span>。';

    const firstUnlearned = todaySections.find(function (sec) { return !App.sectionLearned(sec.id); }) || todaySections[0];
    const learnCta = todaySections.length === 0
      ? '<button class="btn btn-sm btn-ghost" data-action="today-practice">去做模拟</button>'
      : (firstUnlearned
        ? '<button class="btn btn-sm qbtn-dark" data-action="today-open-sec" data-sec="' + firstUnlearned.id + '">' + (learnDone ? '再看一遍' : '开始 §' + firstUnlearned.num.replace('§', '') ) + ' →</button>'
        : '<button class="btn btn-sm btn-ghost" data-action="today-open-sec" data-sec="' + todaySections[0].id + '">复习一下</button>');

    const sectionRows = todaySections.length
      ? todaySections.map(function (sec) {
          const done = App.sectionLearned(sec.id);
          return '<div class="quest-sec">' +
            '<span class="qdot' + (done ? ' ok' : '') + '">' + (done ? '✓' : '') + '</span>' +
            '<span class="qname">' + sec.num + ' ' + sec.title + '</span>' +
            '<button class="qgo" data-action="today-open-sec" data-sec="' + sec.id + '">' + (done ? '再看' : '去') + '</button>' +
          '</div>';
        }).join('')
      : '<div class="quest-note">今天是复习日，没有新小节；把时间留给模拟与错题。</div>';

    const reviewMeta = due.length
      ? '卡片 ' + dueCards + ' · 题目 ' + dueQs
      : (s.daily.reviews ? '今天已复习 ' + s.daily.reviews + ' 项' : '下次复习：' + App.nextDueText());

    const questsHeading = '<div class="section-heading"><h3>今日三件事</h3><span class="section-note">' + tasksDone + ' / 3 完成</span></div>';

    const quests =
      '<section class="quest-grid">' +
        '<article class="quest-card review' + (reviewDone ? ' done' : '') + '">' +
          (reviewDone ? '<span class="done-stamp">CLEAR</span>' : '') +
          '<div class="quest-top"><span class="quest-icon">🔁</span><span class="quest-tag">QUEST 01</span></div>' +
          '<h4>清掉到期复习</h4>' +
          '<p>' + (due.length ? '先复习再学新的，记忆会更牢。' : (s.daily.reviews ? '今天的复习已经清空。' : '今天还没有到期内容。')) + '</p>' +
          '<div class="quest-note">' + reviewMeta + '</div>' +
          '<div class="quest-bar"><span style="width:' + (reviewDone ? 100 : 0) + '%"></span></div>' +
          '<div class="quest-foot"><span class="quest-meta">' + (due.length ? due.length + ' 项待清' : '清空') + '</span>' +
            '<button class="btn btn-sm ' + (due.length ? 'qbtn-dark' : 'btn-ghost') + '" data-action="today-review" ' + (due.length ? '' : 'disabled') + '>' +
            (due.length ? '开始复习' : '已清空') + '</button></div>' +
        '</article>' +
        '<article class="quest-card learn' + (learnDone ? ' done' : '') + '">' +
          (learnDone ? '<span class="done-stamp">CLEAR</span>' : '') +
          '<div class="quest-top"><span class="quest-icon">📖</span><span class="quest-tag">QUEST 02</span></div>' +
          '<h4>' + (todaySections.length ? '学 ' + todaySections.length + ' 个新小节' : '复习日：模拟 + 错题') + '</h4>' +
          '<p>先猜后学：卡片先自己回答，再翻面。</p>' +
          '<div class="quest-secs">' + sectionRows + '</div>' +
          '<div class="quest-foot"><span class="quest-meta">' + learnedCount + ' / ' + todaySections.length + ' 已学</span>' + learnCta + '</div>' +
        '</article>' +
        '<article class="quest-card drill' + (practiceDone ? ' done' : '') + '">' +
          (practiceDone ? '<span class="done-stamp">CLEAR</span>' : '') +
          '<div class="quest-top"><span class="quest-icon">✏️</span><span class="quest-tag">QUEST 03</span></div>' +
          '<h4>专项练 ' + target + ' 题</h4>' +
          '<p>基础热身、进阶暴露问题，错题会自动进本子。</p>' +
          '<div class="quest-bar"><span style="width:' + Math.min(100, Math.round(s.daily.questions / target * 100)) + '%"></span></div>' +
          '<div class="quest-note">今日已答 ' + s.daily.questions + ' 题 · 错题本 ' + stats.wrongCount + ' 道</div>' +
          '<div class="quest-foot"><span class="quest-meta">' + Math.min(100, Math.round(s.daily.questions / target * 100)) + '%</span>' +
            '<button class="btn btn-sm ' + (practiceDone ? 'btn-ghost' : 'qbtn-dark') + '" data-action="today-practice">' + (practiceDone ? '再做一组' : '开始练题') + '</button></div>' +
        '</article>' +
      '</section>';

    view.innerHTML =
      '<div class="page-head today-head">' +
        '<div>' +
          '<div class="eyebrow">' + dateText + ' · 第 ' + planDay + ' / 7 天</div>' +
          '<h1>' + greeting() + '，<span class="headline-mark">今天也来盘概率。</span></h1>' +
          '<p class="sub">' + App.esc(dayInfo.focus) + '。完成下面三件事，今天就算打卡成功。</p>' +
        '</div>' +
        '<div class="head-badges">' +
          '<span class="streak-pill"><span class="flame">🔥</span> ' + s.streak.current + ' 天</span>' +
          '<a class="level-pill" href="#/stats">Lv.' + lvl.level + ' · ' + lvl.title + '</a>' +
        '</div>' +
      '</div>' +

      '<section class="hero2">' +
        '<div class="hero2-copy">' +
          '<div class="hero2-tag"><span>DAY ' + planDay + '</span>' + App.esc(dayInfo.title) + '</div>' +
          '<h2>' + examHeadline + '</h2>' +
          '<p class="hero2-sub">' + App.esc(dayInfo.tip) + '</p>' +
          '<div class="hero2-stats">' +
            '<div class="hstat"><b>' + stats.learnedSections + '<i>/' + stats.totalSections + '</i></b><span>已学小节</span></div>' +
            '<div class="hstat"><b>' + stats.answered + '</b><span>累计答题</span></div>' +
            '<div class="hstat"><b>' + (stats.accuracy == null ? '—' : App.fmtPct(stats.accuracy, 0)) + '</b><span>正确率</span></div>' +
            '<div class="hstat"><b>' + App.shortNum(s.xp) + '</b><span>能量 XP</span></div>' +
          '</div>' +
          '<div class="hero2-actions">' +
            '<button class="btn btn-sun" data-action="today-start">开始今天 →</button>' +
            '<a class="btn btn-glass" href="#/learn">看知识地图</a>' +
          '</div>' +
          (compressed ? '<div class="warning-chip">⏳ 考试比 7 天计划早 ' + (planRemaining - examRawLeft) + ' 天：每天多学一节，优先错题与高频公式。</div>' : '') +
        '</div>' +
        '<div class="hero2-art">' +
          '<div class="hero2-ring" style="--p:' + ringPct + '"><div class="hero2-ring-inner"><b>' + tasksDone + '/3</b><span>今日任务</span></div></div>' +
          '<div class="hero2-mascot">' + App.mascotSVG(170) + '</div>' +
          '<span class="float-chip chip-a">🎲 先猜后学</span>' +
          '<span class="float-chip chip-b">+' + s.daily.xp + ' XP</span>' +
          '<span class="float-chip chip-c">🔥 ' + s.streak.current + ' DAYS</span>' +
        '</div>' +
      '</section>' +

      questsHeading +
      quests +

      '<section class="starmap-card">' +
        '<div class="starmap-head">' +
          '<div><div class="eyebrow light">KNOWLEDGE CONSTELLATION</div><h3>概率星图</h3></div>' +
          '<div class="starmap-legend">' +
            '<span><i class="lg-learned"></i>已点亮</span>' +
            '<span><i class="lg-current"></i>今天</span>' +
            '<span><i class="lg-todo"></i>未学</span>' +
          '</div>' +
        '</div>' +
        '<div class="starmap-svg-wrap">' + starMapSVG(planDay) + '</div>' +
        '<div class="starmap-mobile">' + starMapMobile(planDay) + '</div>' +
        '<div class="starmap-foot"><span>点亮一颗星 = 学完一个小节 · 点击星星直接跳转</span>' +
          '<span><b>' + stats.learnedSections + '</b> / ' + stats.totalSections + ' 颗已点亮</span></div>' +
      '</section>' +

      '<div class="today-bottom">' +
        '<section class="card card-pad trail-card">' +
          '<div class="section-heading"><h3>7 天冲刺路线</h3><span class="section-note">DAY ' + planDay + ' / 7</span></div>' +
          '<div class="trail">' + trailHTML(planDay) + '</div>' +
          '<div class="trail-note">' + App.esc(dayInfo.tip) + '</div>' +
        '</section>' +
        '<section class="fortune-card">' +
          '<div class="fortune-seal">签</div>' +
          '<div class="fortune-kicker">DAILY FORTUNE · 第 ' + (f.idx + 1) + ' 签</div>' +
          '<div class="fortune-text">' + tip + '</div>' +
          '<button class="fortune-btn" data-action="today-fortune">再抽一签 ↻</button>' +
          '<div class="fortune-stamp">概率会奖励坚持的人</div>' +
        '</section>' +
      '</div>' +

      '<div class="quick-strip">' +
        '<a class="quick-link2" href="#/lab">🧪 实验室</a>' +
        '<a class="quick-link2" href="#/cheatsheet">📋 公式速查</a>' +
        '<a class="quick-link2" href="#/practice">🧹 错题本 · ' + stats.wrongCount + '</a>' +
        '<a class="quick-link2" href="#/method">🔬 学习方法</a>' +
        '<a class="quick-link2" href="#/settings">⚙️ 设置</a>' +
      '</div>';
  };

  App.actions['today-review'] = function () {
    const due = App.dueItems();
    if (!due.length) return;
    App.startQuiz({ items: due, mode: 'review', title: '今日复习' });
  };

  App.actions['today-practice'] = function () {
    const planDay = Store.planDay();
    const dayInfo = App.data.plan.days[planDay - 1];
    App.startQuiz({
      chapters: dayInfo.practice.ch,
      count: dayInfo.practice.count,
      diff: dayInfo.practice.diff,
      mode: 'practice',
      title: 'Day ' + planDay + ' · 专项练习'
    });
  };

  App.actions['today-open-sec'] = function (el) {
    App.go('#/learn/' + el.getAttribute('data-sec'));
  };

  App.actions['today-start'] = function () {
    const due = App.dueItems();
    if (due.length) { App.startQuiz({ items: due, mode: 'review', title: '今日复习' }); return; }
    const planDay = Store.planDay();
    const todaySections = currentPlanSections(planDay).map(function (id) { return App.sectionById[id]; }).filter(Boolean);
    const next = todaySections.find(function (sec) { return !App.sectionLearned(sec.id); });
    if (next) { App.go('#/learn/' + next.id); return; }
    App.actions['today-practice']();
  };

  App.actions['today-fortune'] = function () {
    const f = fortune();
    let idx = Math.floor(Math.random() * App.data.tips.length);
    if (App.data.tips.length > 1 && idx === f.idx) idx = (idx + 1) % App.data.tips.length;
    f.idx = idx;
    f.pulls = (f.pulls || 0) + 1;
    App.render({ keepScroll: true });
    App.toast('🎋 换了一签，看看这条对不对味');
  };

  App.actions['map-sec'] = function (el) {
    App.go('#/learn/' + el.getAttribute('data-sec'));
  };
})(typeof window !== 'undefined' ? window : globalThis);
