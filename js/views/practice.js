/* 练题：今日复习 / 专项练习 / 错题本 / 全真模拟 */
(function (root) {
  const App = root.App;

  const TABS = [
    { id: 'review', label: '🔁 今日复习' },
    { id: 'drill', label: '🎯 专项练习' },
    { id: 'wrong', label: '🧹 错题本' },
    { id: 'exam', label: '🧪 全真模拟' }
  ];

  App.views.practice = function (view) {
    const tab = App.ui.practiceTab || 'review';
    const stats = App.computeStats();
    const seg = TABS.map(function (t) {
      return '<button class="' + (t.id === tab ? 'active' : '') + '" data-action="practice-tab" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join('');

    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">PRACTICE · 94 QUESTIONS</div>' +
      '<h1>练题</h1>' +
      '<div class="sub">先复习到期内容，再做专项。每道题都带提示与分步详解；做错的题会自动进入错题本，连续答对两次才移出。</div></div>' +
      '<div class="seg">' + seg + '</div>' +
      '<div id="practice-panel"></div>';

    const panel = view.querySelector('#practice-panel');
    if (tab === 'drill') renderDrill(panel);
    else if (tab === 'wrong') renderWrong(panel, stats);
    else if (tab === 'exam') renderExam(panel, stats);
    else renderReview(panel, stats);
  };

  /* ---------------- 今日复习 ---------------- */
  function renderReview(panel, stats) {
    const due = App.dueItems();
    const cards = due.filter(function (i) { return i.kind === 'card'; });
    const qs = due.filter(function (i) { return i.kind === 'q'; });
    const dueQsCalc = qs.filter(function (i) {
      const q = App.questionById[i.id];
      return q && q.type === 'calc';
    }).length;

    panel.innerHTML = '<div class="card card-pad">' +
      '<div class="card-head"><div class="card-title">🔁 间隔复习队列</div><span class="card-sub">' + App.nextDueText() + '</span></div>' +
      (due.length
        ? '<div class="review-hero">' +
            '<div class="review-nums">' +
              '<div><span class="rv">' + cards.length + '</span><span class="rl">张卡片</span></div>' +
              '<div><span class="rv">' + qs.length + '</span><span class="rl">道题目</span></div>' +
              '<div><span class="rv">' + (qs.length - dueQsCalc) + '</span><span class="rl">可自动判分</span></div>' +
            '</div>' +
            '<p class="small muted" style="margin-top:10px">复习时先自己回忆，再翻面 / 看解答。' +
            (dueQsCalc ? '其中 ' + dueQsCalc + ' 道计算题需要你动手演算后自评。' : '') +
            '</p>' +
            '<button class="btn btn-primary btn-lg" style="margin-top:14px" data-action="start-review">开始复习（' + due.length + ' 项）</button>' +
          '</div>'
        : '<div class="empty"><span class="big">🍵</span>今天的到期复习已经清空。<br>' +
          '<span class="small">下次复习：' + App.nextDueText() + '。现在可以做一组新题。</span><br>' +
          '<button class="btn btn-ghost" style="margin-top:14px" data-action="practice-tab" data-tab="drill">去专项练习 →</button></div>') +
      '</div>' +

      '<div class="grid-3" style="margin-top:16px">' +
        '<div class="card card-pad"><div class="stat-label">已掌握题目</div><div class="stat-num">' + stats.mastered + '</div><div class="stat-sub">连续答对 ≥2 次</div></div>' +
        '<div class="card card-pad"><div class="stat-label">错题待清</div><div class="stat-num">' + stats.wrongCount + '</div><div class="stat-sub">连续答对 2 次自动移出</div></div>' +
        '<div class="card card-pad"><div class="stat-label">复习机制</div><div class="stat-num">SM-2</div><div class="stat-sub">按考试日封顶间隔</div></div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-title">为什么先复习？</div>' +
        '<p class="small muted" style="margin-top:6px;line-height:1.8">间隔练习的收益来自“快忘记时再提取”。新内容当然重要，但先把到期内容清掉，能显著减少“学了后面忘了前面”。' +
        '这也是本平台把复习放在每天第一项的原因。</p>' +
      '</div>';
  }

  /* ---------------- 专项练习 ---------------- */
  function renderDrill(panel) {
    const ui = App.ui.drill || (App.ui.drill = { ch: 'all', diff: 'all', count: 10 });
    const chapters = [{ id: 'all', label: '全部章节' }, { id: 1, label: '第一章' }, { id: 2, label: '第二章' }, { id: 3, label: '第三章' }];
    const diffs = [{ id: 'all', label: '全部难度' }, { id: 1, label: '基础' }, { id: 2, label: '进阶' }, { id: 3, label: '挑战' }];
    const counts = [6, 10, 15];

    const chChips = chapters.map(function (c) {
      return '<button class="chip' + (String(c.id) === String(ui.ch) ? ' active' : '') + '" data-action="drill-ch" data-ch="' + c.id + '">' + c.label + '</button>';
    }).join('');
    const diffChips = diffs.map(function (d) {
      return '<button class="chip' + (String(d.id) === String(ui.diff) ? ' active' : '') + '" data-action="drill-diff" data-diff="' + d.id + '">' + d.label + '</button>';
    }).join('');
    const countChips = counts.map(function (n) {
      return '<button class="chip' + (n === ui.count ? ' active' : '') + '" data-action="drill-count" data-count="' + n + '">' + n + ' 题</button>';
    }).join('');

    const opts = {
      chapters: ui.ch === 'all' ? null : [Number(ui.ch)],
      diff: ui.diff === 'all' ? 'all' : Number(ui.diff)
    };
    const pool = App.data.questions.filter(function (q) {
      if (opts.chapters && opts.chapters.indexOf(q.ch) === -1) return false;
      if (opts.diff !== 'all' && q.diff !== opts.diff) return false;
      return true;
    }).map(function (q) { return q.id; });
    const fresh = pool.filter(function (id) {
      const e = App.state.questions[id];
      return !e || !e.attempts;
    }).length;

    panel.innerHTML = '<div class="card card-pad">' +
      '<div class="card-head"><div class="card-title">🎯 自选专项</div><span class="card-sub">优先抽没做过的题</span></div>' +
      '<div class="drill-row">' +
        '<div class="drill-field"><label>章节</label><div class="chip-row">' + chChips + '</div></div>' +
        '<div class="drill-field"><label>难度</label><div class="chip-row">' + diffChips + '</div></div>' +
        '<div class="drill-field"><label>题量</label><div class="chip-row">' + countChips + '</div></div>' +
      '</div>' +
      '<div class="drill-summary">可用题目 ' + pool.length + ' 道，其中 ' + fresh + ' 道还没做过。' +
      '本次将抽取 ' + Math.min(ui.count, pool.length) + ' 道。' +
      '<br>建议：基础题用来热身，进阶题用来暴露问题，挑战题放在最后。</div>' +
      '<div style="margin-top:16px;display:flex;gap:9px;flex-wrap:wrap">' +
        '<button class="btn btn-primary" data-action="start-drill" ' + (pool.length ? '' : 'disabled') + '>开始练习 →</button>' +
        '<button class="btn btn-ghost" data-action="practice-tab" data-tab="exam">直接模拟测验</button>' +
      '</div>' +
    '</div>' +

    '<div class="grid-2" style="margin-top:16px">' +
      '<div class="card card-pad"><div class="card-title">🧠 做题流程</div>' +
        '<ol class="small muted" style="margin-top:8px;padding-left:20px;line-height:1.9">' +
          '<li>先自己算，实在没思路再点“提示”。</li><li>提交后立刻看分步详解，对照自己卡在哪一步。</li>' +
          '<li>计算题动手写完再点“看解答”，按真实情况自评。</li><li>做错的题自动进错题本，之后间隔复习。</li>' +
        '</ol></div>' +
      '<div class="card card-pad"><div class="card-title">📌 小技巧</div>' +
        '<p class="small muted" style="margin-top:8px;line-height:1.8">交错练习比“一个题型刷到底”更有效：让题目混着出现，迫使你先判断“这题该用什么方法”。章节混合练习在后期尤其值得做。</p>' +
        '</div>' +
    '</div>';
  }

  /* ---------------- 错题本 ---------------- */
  function renderWrong(panel, stats) {
    const ids = stats.wrongIds;
    const rows = ids.map(function (id) {
      const q = App.questionById[id];
      const e = App.state.questions[id];
      if (!q) return '';
      return '<div class="wrong-item">' +
        '<span class="qbadge ch' + q.ch + '">第' + ['一', '二', '三'][q.ch - 1] + '章</span>' +
        '<div class="stem">' + App.truncate(q.stem, 90) +
          '<div class="meta">错 ' + e.wrong + ' 次 · 已连续答对 ' + e.streak + ' 次 · ' + q.sec + '</div></div>' +
      '</div>';
    }).join('');

    panel.innerHTML = '<div class="card card-pad">' +
      '<div class="card-head"><div class="card-title">🧹 错题本</div><span class="card-sub">' + ids.length + ' 道待清</span></div>' +
      (ids.length
        ? '<p class="small muted" style="margin-bottom:6px">规则：做错的题进来，之后<strong>连续答对 2 次</strong>才自动移出。重练时仍按间隔复习调度。</p>' +
          '<div class="wrong-list">' + rows + '</div>' +
          '<button class="btn btn-coral" style="margin-top:16px" data-action="start-wrong">重练这 ' + ids.length + ' 道 →</button>'
        : '<div class="empty"><span class="big">✨</span>错题本是空的。<br><span class="small">这要么说明你很强，要么说明还没开始做题。</span><br>' +
          '<button class="btn btn-ghost" style="margin-top:14px" data-action="practice-tab" data-tab="drill">去做一组题 →</button></div>') +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-title">📖 错题怎么用才有效？</div>' +
        '<p class="small muted" style="margin-top:6px;line-height:1.8">不要只把正确答案抄一遍。遮住答案，从“题目在问什么 → 用哪个公式 → 第一步写什么”重新走一遍。' +
        '如果同一道题错了两次，回到对应小节的卡片，八成是概念层出了问题。</p>' +
      '</div>';
  }

  /* ---------------- 全真模拟 ---------------- */
  function renderExam(panel, stats) {
    const best = App.state.flags.examBest;
    panel.innerHTML = '<div class="card card-pad">' +
      '<div class="card-head"><div class="card-title">🧪 全真模拟</div><span class="card-sub">只含选择 + 填空</span></div>' +
      '<p class="small muted" style="line-height:1.8">从三章中随机抽 20 道客观题。' +
      '<strong>答题过程中不给反馈</strong>，全部做完后统一批改，模拟真实考试的感觉。用时会计时。</p>' +
      '<div class="grid-3" style="margin:16px 0">' +
        '<div class="stat-card"><div class="stat-label">题量</div><div class="stat-num">20</div><div class="stat-sub">选择 / 填空</div></div>' +
        '<div class="stat-card"><div class="stat-label">范围</div><div class="stat-num">3</div><div class="stat-sub">章全覆盖</div></div>' +
        '<div class="stat-card"><div class="stat-label">历史最好</div><div class="stat-num">' + (best ? best.score + '/' + best.total : '—') + '</div><div class="stat-sub">' + (best ? new Date(best.ts).toLocaleDateString('zh-CN') : '还没考过') + '</div></div>' +
      '</div>' +
      '<div class="callout amber" style="font-size:13px">考试模式下不会即时显示对错。做完后统一批改，并自动把错题加入复习队列。</div>' +
      '<button class="btn btn-primary btn-lg" style="margin-top:16px" data-action="start-exam">开始模拟（20 题）→</button>' +
    '</div>' +

    '<div class="grid-2" style="margin-top:16px">' +
      '<div class="card card-pad"><div class="card-title">🎯 目标</div>' +
        '<p class="small muted" style="margin-top:8px;line-height:1.8">基础题全对 + 进阶题 70% + 挑战题 50%，前三章期末就相当稳了。' +
        '模拟分数低不丢人，它只是提前暴露问题。</p></div>' +
      '<div class="card card-pad"><div class="card-title">⏱️ 时间管理</div>' +
        '<p class="small muted" style="margin-top:8px;line-height:1.8">20 道客观题建议 25~30 分钟。遇到卡壳的，先选一个最有把握的答案，别在一道题上耗光时间。' +
        '这个平台上没有硬性倒计时，压力小一点。</p></div>' +
    '</div>';
  }

  /* ---------------- 动作 ---------------- */
  App.actions['practice-tab'] = function (el) {
    App.ui.practiceTab = el.getAttribute('data-tab');
    App.render({ keepScroll: true });
  };

  App.actions['drill-ch'] = function (el) {
    App.ui.drill.ch = el.getAttribute('data-ch');
    App.render({ keepScroll: true });
  };
  App.actions['drill-diff'] = function (el) {
    App.ui.drill.diff = el.getAttribute('data-diff');
    App.render({ keepScroll: true });
  };
  App.actions['drill-count'] = function (el) {
    App.ui.drill.count = Number(el.getAttribute('data-count'));
    App.render({ keepScroll: true });
  };

  App.actions['start-review'] = function () {
    const due = App.dueItems();
    if (!due.length) { App.toast('今天没有到期内容'); return; }
    App.startQuiz({ items: due, mode: 'review', title: '今日复习' });
  };

  App.actions['start-drill'] = function () {
    const ui = App.ui.drill || { ch: 'all', diff: 'all', count: 10 };
    App.startQuiz({
      chapters: ui.ch === 'all' ? null : [Number(ui.ch)],
      diff: ui.diff === 'all' ? 'all' : Number(ui.diff),
      count: ui.count,
      mode: 'practice',
      title: '专项练习'
    });
  };

  App.actions['start-wrong'] = function () {
    const ids = App.wrongBookIds();
    if (!ids.length) { App.toast('错题本是空的'); return; }
    App.startQuiz({
      items: App.shuffle(ids).map(function (id) { return { kind: 'q', id: id }; }),
      mode: 'wrong',
      title: '错题重练'
    });
  };

  App.actions['start-exam'] = function () {
    const ids = App.pickQuestions({ chapters: null, count: 20, includeCalc: false });
    if (ids.length < 5) { App.toast('题库不足，无法开始模拟'); return; }
    App.startQuiz({
      items: ids.map(function (id) { return { kind: 'q', id: id }; }),
      mode: 'test',
      title: '全真模拟'
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);

