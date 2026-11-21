/* 今日：一天只做三件事 */
(function (root) {
  const App = root.App;
  const Store = App.Store;

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  App.views.today = function (view) {
    const s = App.state;
    const planDay = Store.planDay();
    const plan = App.data.plan;
    const dayInfo = plan.days[planDay - 1];
    const examLeft = Store.examDaysLeft();
    const examRawLeft = App.diffDays(App.todayKey(), s.examDate);
    const planRemaining = Math.max(0, 7 - planDay);
    const compressed = examRawLeft >= 0 && examRawLeft < planRemaining;
    const examHeadline = examRawLeft < 0
      ? '考试日已过，去设置里调一下日期。'
      : examRawLeft === 0
        ? '今天就是考试日，稳住。'
        : '还差 ' + examLeft + ' 天，够用。';

    const due = App.dueItems();
    const dueCards = due.filter(function (i) { return i.kind === 'card'; }).length;
    const dueQs = due.length - dueCards;
    const reviewDone = due.length === 0;

    const todaySections = (dayInfo.sections || []).map(function (id) { return App.sectionById[id]; }).filter(Boolean);
    const learnedCount = todaySections.filter(function (sec) { return App.sectionLearned(sec.id); }).length;
    const learnDone = todaySections.length === 0 || learnedCount === todaySections.length;

    const target = Math.max(6, dayInfo.practice.count || 8);
    const practiceDone = s.daily.questions >= target;
    const tasksDone = [reviewDone, learnDone, practiceDone].filter(Boolean).length;
    const ringPct = Math.round((tasksDone / 3) * 100);

    const stats = App.computeStats();
    const tip = App.data.tips[(planDay * 3 + 1) % App.data.tips.length];
    const lvl = Store.levelInfo();
    const dateText = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

    const planStrip = plan.days.map(function (d) {
      const daySections = (d.sections || []).map(function (id) { return App.sectionById[id]; });
      const done = d.day < planDay && (daySections.length === 0
        ? !!s.flags.examDone
        : daySections.every(function (sec) { return App.sectionLearned(sec.id); }));
      const cls = ['day-cell'];
      if (d.day === planDay) cls.push('current');
      if (d.day < planDay) cls.push('past');
      const tick = done ? '<span class="tick">✓</span>' : '';
      return '<div class="' + cls.join(' ') + '">' + tick +
        '<div class="d">DAY ' + d.day + '</div><div class="t">' + d.title + '</div></div>';
    }).join('');

    const sectionRows = todaySections.length === 0
      ? '<div class="muted small" style="padding:6px 0">今天是复习日：没有新小节，专注模拟与错题。</div>'
      : todaySections.map(function (sec) {
          const done = App.sectionLearned(sec.id);
          return '<div class="task-sec">' +
            '<span class="dot' + (done ? ' ok' : '') + '">' + (done ? '✓' : '') + '</span>' +
            '<span class="sec-name">' + sec.num + ' ' + sec.title + '</span>' +
            '<button class="btn btn-sm ' + (done ? 'btn-ghost' : 'btn-soft') + '" data-action="today-open-sec" data-sec="' + sec.id + '">' +
            (done ? '再看一遍' : '学习') + '</button>' +
            '</div>';
        }).join('');

    view.innerHTML =
      '<div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">' +
        '<div><div class="eyebrow">' + dateText + ' · 第 ' + planDay + ' / 7 天</div>' +
        '<h1>' + greeting() + '，今天也来盘概率。</h1>' +
        '<div class="sub">' + App.esc(dayInfo.focus) + '。完成下面三件事，今天就算打卡成功。</div></div>' +
        '<div class="streak-badge">🔥 ' + s.streak.current + ' 天 <span class="faint small">· Lv.' + lvl.level + '</span></div>' +
      '</div>' +

      '<section class="hero">' +
        '<div class="hero-main">' +
          '<div class="eyebrow">DAY ' + planDay + ' · ' + App.esc(dayInfo.title) + '</div>' +
          '<h1>' + examHeadline + '</h1>' +
          '<p class="hero-sub">' + App.esc(dayInfo.tip) + '</p>' +
          (compressed ? '<div class="chip chip-amber" style="margin-top:10px;font-size:11.5px">⏳ 考试比 7 天计划早 ' + (planRemaining - examRawLeft) + ' 天：建议每天多学一节，优先错题与高频公式</div>' : '') +
          '<div class="hero-meta">' +
            '<div class="item"><span class="v">' + stats.learnedSections + '/' + stats.totalSections + '</span><span class="l">已学小节</span></div>' +
            '<div class="item"><span class="v">' + stats.answered + '</span><span class="l">累计答题</span></div>' +
            '<div class="item"><span class="v">' + (stats.accuracy == null ? '—' : App.fmtPct(stats.accuracy, 0)) + '</span><span class="l">正确率</span></div>' +
            '<div class="item"><span class="v">' + App.shortNum(s.xp) + '</span><span class="l">能量 XP</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-side"><div class="ring" style="--p:' + ringPct + '">' +
          '<div class="ring-inner"><div class="ring-num">' + tasksDone + '/3</div><div class="ring-label">今日任务</div></div>' +
        '</div></div>' +
      '</section>' +

      '<div class="today-grid">' +
        '<div>' +
          '<section class="card card-pad">' +
            '<div class="card-head"><div class="card-title">☑️ 今日三件事</div><span class="card-sub">' + tasksDone + ' / 3 完成</span></div>' +
            '<div class="task-list">' +
              '<div class="task' + (reviewDone ? ' done' : '') + '">' +
                '<div class="task-icon">' + (reviewDone ? '✓' : '🔁') + '</div>' +
                '<div class="task-body"><div class="task-title">清掉到期复习</div>' +
                '<div class="task-desc">' + (due.length
                  ? '卡片 ' + dueCards + ' 张 · 题目 ' + dueQs + ' 道。先复习再学新的，记忆更牢。'
                  : '已清空。下次复习：' + App.nextDueText()) + '</div></div>' +
                '<div class="task-right"><button class="btn btn-sm ' + (due.length ? 'btn-primary' : 'btn-ghost') + '" data-action="today-review" ' + (due.length ? '' : 'disabled') + '>' +
                (due.length ? '开始复习' : '已清空') + '</button></div>' +
              '</div>' +
              '<div class="task' + (learnDone ? ' done' : '') + '">' +
                '<div class="task-icon">' + (learnDone ? '✓' : '📖') + '</div>' +
                '<div class="task-body"><div class="task-title">学 ' + (todaySections.length || 0) + ' 个新小节</div>' +
                '<div class="task-desc">' + (learnDone && todaySections.length
                  ? '今天的新内容已经过完，可以再翻翻卡片巩固。'
                  : todaySections.length ? '先猜后学：卡片先自己回答，再翻面。' : '复习日，无新小节。') + '</div>' +
                '<div class="task-secs">' + sectionRows + '</div></div>' +
              '</div>' +
              '<div class="task' + (practiceDone ? ' done' : '') + '">' +
                '<div class="task-icon">' + (practiceDone ? '✓' : '✏️') + '</div>' +
                '<div class="task-body"><div class="task-title">专项练 ' + target + ' 题</div>' +
                '<div class="task-desc">今日已答 ' + s.daily.questions + ' 题 · 目标 ' + target + ' 题 · 错题本 ' + stats.wrongCount + ' 道</div>' +
                '<div class="progress" style="max-width:300px;margin-top:8px"><span style="width:' + Math.min(100, Math.round(s.daily.questions / target * 100)) + '%"></span></div></div>' +
                '<div class="task-right"><button class="btn btn-sm ' + (practiceDone ? 'btn-ghost' : 'btn-coral') + '" data-action="today-practice">' +
                (practiceDone ? '再做一组' : '开始练题') + '</button></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section class="card card-pad">' +
            '<div class="card-head"><div class="card-title">🗓️ 7 天冲刺表</div>' +
            '<span class="card-sub">第 ' + planDay + ' 天 · 从首次使用日起算</span></div>' +
            '<div class="plan-strip">' + planStrip + '</div>' +
            '<div class="small muted" style="margin-top:10px">' + App.esc(dayInfo.tip) + '</div>' +
          '</section>' +
        '</div>' +

        '<div>' +
          '<section class="card card-pad tip-card">' +
            '<div class="card-title">💡 今日冷知识</div>' +
            '<div class="tip-text" style="margin-top:8px">' + tip + '</div>' +
          '</section>' +

          '<section class="card card-pad" style="margin-top:16px">' +
            '<div class="card-head"><div class="card-title">⚡ 快速入口</div></div>' +
            '<div class="quick-links">' +
              '<a href="#/learn" class="quick-link"><span>📖</span><b>知识地图</b><small>16 个小节</small></a>' +
              '<a href="#/lab" class="quick-link"><span>🧪</span><b>实验室</b><small>玩着理解</small></a>' +
              '<a href="#/cheatsheet" class="quick-link"><span>📋</span><b>公式速查</b><small>考前扫一眼</small></a>' +
              '<a href="#/practice" class="quick-link"><span>🧹</span><b>错题本</b><small>' + stats.wrongCount + ' 道待清</small></a>' +
            '</div>' +
          '</section>' +

          '<section class="card card-pad" style="margin-top:16px">' +
            '<div class="card-head"><div class="card-title">🫡 状态不好？</div></div>' +
            '<p class="small muted" style="line-height:1.8">只做 5 分钟也算数：打开一张卡片、答一道题，连续天数就能保住。' +
            '间隔复习最怕的不是学得少，而是断掉。</p>' +
            '<a class="btn btn-ghost btn-sm" style="margin-top:10px" href="#/method">看看为什么这样设计 →</a>' +
          '</section>' +
        '</div>' +
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
})(typeof window !== 'undefined' ? window : globalThis);
