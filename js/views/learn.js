/* 学习：章节地图 + 小节精学（卡片 / 公式 / 例题 / 自述） */
(function (root) {
  const App = root.App;
  const CH_COLOR = { 1: '#0E6B57', 2: '#5E6FD0', 3: '#F26A4B' };

  function qCountOf(secId) {
    return App.data.questions.filter(function (q) { return q.sec === secId; }).length;
  }

  App.views.learn = function (view) {
    const chapters = App.data.knowledge.chapters;
    const current = App.chapterById[App.ui.learnCh] || chapters[0];
    App.ui.learnCh = current.id;
    const prog = App.chapterProgress(current);

    const tabs = chapters.map(function (ch) {
      const p = App.chapterProgress(ch);
      return '<button class="chapter-tab' + (ch.id === current.id ? ' active' : '') + '" data-action="learn-chapter" data-ch="' + ch.id + '">' +
        '<span class="ch-emoji">' + ch.emoji + '</span>' +
        '<span><span class="ch-name">第' + ['一', '二', '三'][ch.id - 1] + '章</span>' +
        '<span class="ch-sub">' + ch.title + '</span></span>' +
        '<span class="ch-ring" style="--p:' + Math.round(p.pct * 100) + '"><span>' + p.done + '/' + p.total + '</span></span>' +
        '</button>';
    }).join('');

    const rows = current.sections.map(function (sec) {
      const done = App.sectionLearned(sec.id);
      const pct = Math.round(App.sectionProgress(sec) * 100);
      return '<a class="section-item' + (done ? ' done' : '') + '" href="#/learn/' + sec.id + '" style="--ch:' + CH_COLOR[current.id] + '">' +
        '<span class="section-num">' + (done ? '✓' : sec.num) + '</span>' +
        '<span class="section-main">' +
          '<span class="section-title">' + sec.title + '</span>' +
          '<span class="section-meta"><span>' + sec.cards.length + ' 张卡</span><span>约 ' + sec.minutes + ' 分钟</span><span>' + qCountOf(sec.id) + ' 道题</span></span>' +
          '<span class="progress"><span style="width:' + pct + '%"></span></span>' +
        '</span>' +
        '<span class="section-pct">' + pct + '%</span>' +
        '<span class="faint">›</span>' +
      '</a>';
    }).join('');

    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">KNOWLEDGE MAP · 16 SECTIONS</div>' +
      '<h1>知识地图</h1>' +
      '<div class="sub">按小节推进。每节先过 3~5 张“先猜后学”卡片，再看公式与易错，最后做一道典型例题。已学的小节会自动进入间隔复习。</div></div>' +

      '<div class="chapter-tabs">' + tabs + '</div>' +

      '<div class="chapter-banner" style="--ch:' + CH_COLOR[current.id] + '">' +
        '<div class="n">0' + current.id + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<h2>' + current.emoji + ' ' + current.title + '</h2>' +
          '<p>' + current.subtitle + '</p>' +
          '<div class="progress" style="max-width:330px;margin-top:9px"><span style="width:' + Math.round(prog.pct * 100) + '%"></span></div>' +
        '</div>' +
        '<div class="small muted">' + prog.done + ' / ' + prog.total + ' 小节</div>' +
      '</div>' +

      '<div class="section-list">' + rows + '</div>' +

      '<div class="small faint" style="margin-top:16px">小提示：卡片答不出来没关系，先猜再看答案，记忆反而更深。这就是“预测试效应”。</div>';
  };

  App.actions['learn-chapter'] = function (el) {
    App.ui.learnCh = Number(el.getAttribute('data-ch'));
    App.ui.secTab = null;
    App.render();
  };

  /* ---------------- 小节详情 ---------------- */
  App.views.section = function (view, params) {
    const sec = App.sectionById[params.secId];
    if (!sec) {
      view.innerHTML = '<div class="card card-pad"><h2>没有找到这个小节</h2><p class="muted" style="margin-top:8px">它可能不在前三章里。</p><p style="margin-top:14px"><a class="btn btn-primary" href="#/learn">返回知识地图</a></p></div>';
      return;
    }
    if (App.ui.secId !== sec.id) {
      App.ui.secId = sec.id;
      App.ui.secTab = 'cards';
      App.ui.cardIndex = 0;
      App.ui.revealed = false;
      App.ui.cardDone = false;
      App.ui.exampleOpen = false;
    }
    const tab = App.ui.secTab || 'cards';
    const ch = App.chapterById[sec.ch];
    const idx = App.sectionIndex(sec);
    const qCount = qCountOf(sec.id);
    const quizCount = Math.min(6, qCount);
    const done = App.sectionLearned(sec.id);
    const pct = Math.round(App.sectionProgress(sec) * 100);

    const tabBar =
      '<div class="learn-tabs">' +
        '<button class="learn-tab' + (tab === 'cards' ? ' active' : '') + '" data-action="learn-tab" data-tab="cards">🃏 卡片学习</button>' +
        '<button class="learn-tab' + (tab === 'key' ? ' active' : '') + '" data-action="learn-tab" data-tab="key">📌 公式与易错</button>' +
        '<button class="learn-tab' + (tab === 'example' ? ' active' : '') + '" data-action="learn-tab" data-tab="example">✏️ 典型例题</button>' +
        '<button class="learn-tab' + (tab === 'note' ? ' active' : '') + '" data-action="learn-tab" data-tab="note">🗣️ 费曼自述</button>' +
      '</div>';

    view.innerHTML =
      '<a class="sec-back" href="#/learn">← 第' + ['一', '二', '三'][ch.id - 1] + '章 · ' + ch.title + '</a>' +
      '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">' +
        '<div><div class="eyebrow">' + sec.num + ' · ' + qCount + ' 道题 · 约 ' + sec.minutes + ' 分钟</div>' +
        '<h1 class="sec-title">' + sec.title + (done ? ' <span class="chip chip-soft" style="vertical-align:middle">已学</span>' : '') + '</h1>' +
        '<p class="sec-intro">' + sec.intro + '</p></div>' +
      '</div>' +
      '<div class="sec-toolbar">' +
        '<button class="btn btn-sm btn-primary" data-action="learn-mark" data-sec="' + sec.id + '">' + (done ? '✓ 已标记完成' : '标记本节已学') + '</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="learn-test" data-sec="' + sec.id + '">随堂自测' + (quizCount ? '（抽 ' + quizCount + ' 题）' : '') + '</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="learn-prev" data-sec="' + sec.id + '">← 上一节</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="learn-next" data-sec="' + sec.id + '">下一节 →</button>' +
        '<span class="spacer"></span>' +
        '<span class="small muted">卡片已看 ' + pct + '%</span>' +
      '</div>' +
      (tab === 'cards' ? '<div class="coach-note">' + App.mascotSVG(38) + '<span><b>骰仔：</b>先猜后学。翻面之前先在心里回答一遍，答错也算练。</span></div>' : '') +
      tabBar +
      '<div id="learn-panel"></div>';

    const panel = view.querySelector('#learn-panel');

    if (tab === 'cards') renderCards(panel, sec, idx);
    else if (tab === 'key') renderKey(panel, sec);
    else if (tab === 'example') renderExample(panel, sec);
    else renderNote(panel, sec);
  };

  function renderCards(panel, sec) {
    const total = sec.cards.length;
    const i = App.ui.cardIndex || 0;
    const done = App.ui.cardDone || i >= total;
    const dots = sec.cards.map(function (c, n) {
      let cls = 'flash-dot';
      const e = App.cardState(c.id);
      if (e && e.seen > 0) cls += ' on';
      if (n === i && !done) cls += ' now';
      return '<span class="' + cls + '"></span>';
    }).join('');

    if (done) {
      panel.innerHTML = '<div class="flash-wrap"><div class="flashcard" style="align-items:center;text-align:center;justify-content:center">' +
        '<div style="margin-bottom:-8px">' + App.mascotSVG(92) + '</div>' +
        '<div style="font-size:22px;font-weight:850;margin-top:8px">本节卡片过完了 🎉</div>' +
        '<p class="muted" style="margin-top:8px;max-width:44ch">' + (App.sectionLearned(sec.id) ? '已自动标记为“已学”，明天会进入复习队列。' : '把它们标记为已学，明天就会进入复习队列。') + '</p>' +
        '<div class="flash-actions" style="justify-content:center;margin-top:18px">' +
          '<button class="btn btn-primary" data-action="learn-test" data-sec="' + sec.id + '">做随堂自测</button>' +
          '<button class="btn btn-ghost" data-action="learn-restart" data-sec="' + sec.id + '">再刷一轮卡片</button>' +
        '</div></div></div>';
      return;
    }

    const card = sec.cards[i];
    const revealed = App.ui.revealed;
    const entry = App.cardState(card.id);
    const seenMeta = entry && entry.seen ? '已复习 ' + entry.seen + ' 次 · 下次 ' + root.SRS.nextDueText(entry.srs) : '第一次见';

    panel.innerHTML = '<div class="flash-wrap">' +
      '<div class="flash-progress"><span class="small muted">' + (i + 1) + ' / ' + total + '</span>' +
      '<div class="flash-dots">' + dots + '</div><span class="small faint">' + seenMeta + '</span></div>' +
      '<div class="flashcard">' +
        '<div class="flash-kicker">先自己想 · 再翻面</div>' +
        '<div class="flash-q">' + card.q + '</div>' +
        (revealed
          ? '<div class="flash-a">' + card.a + '</div>' + (card.tip ? '<div class="flash-tip">💡 ' + card.tip + '</div>' : '') +
            '<div class="flash-foot"><div class="flash-actions">' +
              '<button class="btn btn-sm btn-ghost" data-action="learn-rate" data-grade="again" data-sec="' + sec.id + '">😵 没记住</button>' +
              '<button class="btn btn-sm btn-ghost" data-action="learn-rate" data-grade="hard" data-sec="' + sec.id + '">🤔 有点模糊</button>' +
              '<button class="btn btn-sm btn-primary" data-action="learn-rate" data-grade="good" data-sec="' + sec.id + '">😎 记住了</button>' +
            '</div></div>'
          : '<div class="flash-foot"><button class="btn btn-primary" data-action="learn-reveal">想好了，翻面</button><span class="flash-hint">先在心里回答，再翻面核对</span></div>') +
      '</div>' +
    '</div>';
  }

  function renderKey(panel, sec) {
    const formulas = sec.formulas.map(function (f) {
      return '<div class="formula-row"><div class="formula-label">' + f.label + '</div><div class="formula-html">' + f.html + '</div></div>';
    }).join('');
    const pitfalls = sec.pitfalls.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    panel.innerHTML = '<div class="grid-2" style="align-items:start">' +
      '<div class="card card-pad"><div class="card-head"><div class="card-title">📌 公式与结论</div></div>' +
      '<div class="formula-box">' + formulas + '</div></div>' +
      '<div class="card card-pad"><div class="card-head"><div class="card-title">⚠️ 易错清单</div></div>' +
      '<ul class="pitfall-list">' + pitfalls + '</ul>' +
      '<div class="callout" style="margin-top:16px;font-size:12.5px">看完别急着走：回到卡片，试着不看答案复述一遍公式。</div></div>' +
    '</div>';
  }

  function renderExample(panel, sec) {
    const ex = sec.example;
    const open = App.ui.exampleOpen;
    panel.innerHTML = '<div class="flash-wrap"><div class="example">' +
      '<div class="example-head">✏️ ' + ex.title + '</div>' +
      '<div class="example-body">' +
        '<div class="example-problem">' + ex.problem + '</div>' +
        (open
          ? '<ol class="example-steps">' + ex.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
            '<div class="example-answer">答案：' + ex.answer + '</div>'
          : '<div class="reveal-hint">先拿草稿纸自己做一遍，再看步骤。直接看答案会产生“我懂了”的错觉。</div>' +
            '<button class="btn btn-sm btn-primary" style="margin-top:12px" data-action="learn-example-reveal">看步骤与答案</button>') +
      '</div></div></div>';
  }

  function renderNote(panel, sec) {
    const note = App.state.notes[sec.id] || { text: '', ts: 0 };
    const when = note.ts ? new Date(note.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    panel.innerHTML = '<div class="flash-wrap"><div class="card card-pad note-box">' +
      '<div class="card-head"><div class="card-title">🗣️ 讲给骰仔听</div><span class="card-sub">用自己的话，别抄公式</span></div>' +
      '<p class="small muted" style="margin-bottom:10px">假设骰仔没学过概率。用 2~3 句话讲清「' + sec.title + '」的核心。卡住的地方，就是你还没懂的地方。</p>' +
      '<textarea id="feynman-note" placeholder="例如：这一节其实是在说……关键是……容易错在……">' + App.esc(note.text) + '</textarea>' +
      '<div class="note-foot"><span class="small faint">' + (when ? '上次保存：' + when : '还没有保存过') + '</span>' +
      '<button class="btn btn-sm btn-primary" data-action="learn-save-note" data-sec="' + sec.id + '">保存自述 +3 能量</button></div>' +
      '</div></div>';
  }

  /* ---------------- 工具与动作 ---------------- */
  App.sectionIndex = function (sec) {
    const ch = App.chapterById[sec.ch];
    return ch.sections.findIndex(function (s) { return s.id === sec.id; });
  };

  App.actions['learn-tab'] = function (el) {
    App.ui.secTab = el.getAttribute('data-tab');
    App.render({ keepScroll: true });
  };

  App.actions['learn-reveal'] = function () {
    App.ui.revealed = true;
    App.render({ keepScroll: true });
  };

  App.actions['learn-rate'] = function (el) {
    const sec = App.sectionById[el.getAttribute('data-sec')];
    const grade = el.getAttribute('data-grade');
    if (!sec) return;
    const card = sec.cards[App.ui.cardIndex];
    if (!card) return;
    App.rateCard(card.id, grade, { mode: 'learn' });
    App.ui.revealed = false;
    if (App.ui.cardIndex < sec.cards.length - 1) {
      App.ui.cardIndex += 1;
    } else {
      App.ui.cardDone = true;
      App.markSectionLearned(sec.id);
      App.confetti(46);
    }
    App.render({ keepScroll: true });
  };

  App.actions['learn-restart'] = function (el) {
    App.ui.cardIndex = 0;
    App.ui.revealed = false;
    App.ui.cardDone = false;
    App.render({ keepScroll: true });
  };

  App.actions['learn-mark'] = function (el) {
    const secId = el.getAttribute('data-sec');
    const was = App.sectionLearned(secId);
    App.markSectionLearned(secId);
    if (!was) App.confetti(22);
    App.render({ keepScroll: true });
  };

  App.actions['learn-test'] = function (el) {
    const sec = App.sectionById[el.getAttribute('data-sec')];
    if (!sec) return;
    App.startQuiz({
      sections: [sec.id],
      count: Math.min(6, qCountOf(sec.id) || 6),
      mode: 'practice',
      title: sec.title + ' · 随堂自测'
    });
  };

  App.actions['learn-prev'] = function (el) {
    const sec = App.sectionById[el.getAttribute('data-sec')];
    const ch = App.chapterById[sec.ch];
    const i = App.sectionIndex(sec);
    if (i > 0) App.go('#/learn/' + ch.sections[i - 1].id);
    else App.go('#/learn');
  };

  App.actions['learn-next'] = function (el) {
    const sec = App.sectionById[el.getAttribute('data-sec')];
    const ch = App.chapterById[sec.ch];
    const i = App.sectionIndex(sec);
    if (i < ch.sections.length - 1) App.go('#/learn/' + ch.sections[i + 1].id);
    else App.go('#/learn');
  };

  App.actions['learn-example-reveal'] = function () {
    App.ui.exampleOpen = true;
    App.render({ keepScroll: true });
  };

  App.actions['learn-save-note'] = function (el) {
    const secId = el.getAttribute('data-sec');
    const ta = document.getElementById('feynman-note');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) { App.toast('先写一句话再保存吧'); return; }
    const prev = App.state.notes[secId] || { text: '', ts: 0 };
    const today = App.todayKey();
    const alreadyToday = prev.ts && App.dateKey(new Date(prev.ts)) === today;
    App.state.notes[secId] = { text: text, ts: Date.now() };
    App.state.daily.notes += 1;
    if (!alreadyToday) App.awardXp(3);
    App.save();
    App.checkAchievements();
    App.toast(alreadyToday ? '💾 自述已更新' : '💾 自述已保存 +3 能量');
    App.render({ keepScroll: true });
  };
})(typeof window !== 'undefined' ? window : globalThis);
