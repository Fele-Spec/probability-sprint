/* 做题：卡片复习 + 选择/填空/计算 + 练习/测试两种模式 */
(function (root) {
  const App = root.App;

  const DIFF_LABEL = { 1: '基础', 2: '进阶', 3: '挑战' };

  function currentItem() {
    const s = App.session;
    return s && s.items[s.idx];
  }

  function qOf(item) {
    return item && item.kind === 'q' ? App.questionById[item.id] : null;
  }

  function cardOf(item) {
    return item && item.kind === 'card' ? App.cardById[item.id] : null;
  }

  App.views.quiz = function (view) {
    const s = App.session;
    if (!s) { App.go('#/practice'); return; }
    if (s.finished) { renderSummary(view); return; }

    const item = currentItem();
    if (!item) { finish(s); App.render(); return; }
    const total = s.items.length;
    const pct = Math.round((s.idx / total) * 100);
    const elapsed = Math.floor((Date.now() - s.startTs) / 1000);

    view.innerHTML =
      '<div class="quiz-wrap">' +
        '<div class="quiz-top">' +
          '<span class="label">' + (s.idx + 1) + ' / ' + total + '</span>' +
          '<div class="quiz-bar"><span style="width:' + pct + '%"></span></div>' +
          '<span class="quiz-timer" id="quiz-timer">⏱ ' + App.fmtClock(elapsed) + '</span>' +
          '<button class="btn btn-sm btn-ghost" data-action="quiz-quit">退出</button>' +
        '</div>' +
        '<div class="quiz-meta" id="quiz-meta"></div>' +
        '<div id="quiz-body"></div>' +
      '</div>';

    const body = view.querySelector('#quiz-body');
    if (item.kind === 'card') renderCard(body, s, item);
    else renderQuestion(body, s, item);

    // 计时器
    const timerEl = view.querySelector('#quiz-timer');
    const start = s.startTs;
    if (App.quizTimer) clearInterval(App.quizTimer);
    App.quizTimer = setInterval(function () {
      if (!timerEl || !document.body.contains(timerEl)) return;
      timerEl.textContent = '⏱ ' + App.fmtClock((Date.now() - start) / 1000);
    }, 1000);

    App.quizKeyHandler = function (e) {
      if (!App.session || App.session.finished) return;
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (e.key === 'Enter' && App.session.feedback == null) {
          e.preventDefault();
          App.actions['quiz-submit']();
        }
        return;
      }
      if (App.session.feedback && e.key === 'Enter') {
        e.preventDefault();
        App.actions['quiz-next']();
        return;
      }
      if (App.session.feedback) return;
      if (item.kind === 'card') {
        if (!App.session.revealed) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            App.actions['quiz-card-reveal']();
          }
          return;
        }
        if (/^[123]$/.test(e.key)) {
          App.actions['quiz-card-rate']({ getAttribute: function () { return ['again', 'hard', 'good'][Number(e.key) - 1]; } });
        }
        return;
      }
      if (/^[1-4]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const q = qOf(currentItem());
        if (q && q.type === 'choice' && q.options[idx] != null) {
          App.session.sel = idx;
          App.render({ keepScroll: true });
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        App.actions['quiz-submit']();
      }
      if (e.key === ' ' && item.kind === 'card' && !App.session.revealed) {
        e.preventDefault();
        App.actions['quiz-card-reveal']();
      }
    };
  };

  /* ---------------- 卡片复习 ---------------- */
  function renderCard(body, s, item) {
    const card = cardOf(item);
    const sec = App.sectionById[card.sec];
    const meta = body.parentElement.querySelector('#quiz-meta');
    if (meta) {
      meta.innerHTML = '<span class="qbadge ch' + card.ch + '">第' + ['一', '二', '三'][card.ch - 1] + '章</span>' +
        '<span class="chip chip-soft" style="cursor:default">知识卡</span>' +
        '<span class="small muted">' + sec.num + ' ' + sec.title + '</span>' +
        '<span class="small faint" style="margin-left:auto">已复习 ' + ((App.cardState(card.id) || {}).seen || 0) + ' 次</span>';
    }
    body.innerHTML = '<div class="flashcard" style="min-height:260px">' +
      '<div class="flash-kicker">知识卡 · 先自己回答</div>' +
      '<div class="flash-q">' + card.q + '</div>' +
      (s.revealed
        ? '<div class="flash-a">' + card.a + '</div>' + (card.tip ? '<div class="flash-tip">💡 ' + card.tip + '</div>' : '') +
          '<div class="flash-foot"><div class="flash-actions">' +
            '<button class="btn btn-sm btn-ghost" data-action="quiz-card-rate" data-g="again">没记住</button>' +
            '<button class="btn btn-sm btn-ghost" data-action="quiz-card-rate" data-g="hard">有点模糊</button>' +
            '<button class="btn btn-sm btn-primary" data-action="quiz-card-rate" data-g="good">记住了</button>' +
          '</div><span class="flash-hint">按 1 / 2 / 3 也可以</span></div>'
        : '<div class="flash-foot"><button class="btn btn-primary" data-action="quiz-card-reveal">翻面看答案</button><span class="flash-hint">空格键翻面</span></div>') +
    '</div>';
  }

  /* ---------------- 题目 ---------------- */
  function renderQuestion(body, s, item) {
    const q = qOf(item);
    const sec = App.sectionById[q.sec];
    const meta = body.parentElement.querySelector('#quiz-meta');
    if (meta) {
      meta.innerHTML = '<span class="qbadge ch' + q.ch + '">第' + ['一', '二', '三'][q.ch - 1] + '章</span>' +
        '<span class="chip chip-soft" style="cursor:default">' + ({ choice: '选择题', fill: '填空题', calc: '计算题' })[q.type] + '</span>' +
        '<span class="chip chip-amber" style="cursor:default">' + DIFF_LABEL[q.diff] + '</span>' +
        '<span class="small muted">' + sec.num + ' ' + sec.title + '</span>' +
        (s.mode === 'test' ? '<span class="small faint" style="margin-left:auto">考试模式 · 统一批改</span>' : '') +
        (s.combo >= 2 ? '<span class="combo-pill">🔥 连对 ' + s.combo + '</span>' : '');
    }

    const fb = s.feedback;
    const optionsHTML = q.type === 'choice'
      ? '<div class="options">' + q.options.map(function (opt, i) {
          let cls = 'option';
          if (fb) {
            if (i === q.answer) cls += ' correct';
            if (i === s.sel && i !== q.answer) cls += ' wrong';
          } else if (s.sel === i) {
            cls += ' selected';
          }
          const letter = String.fromCharCode(65 + i);
          let action = '';
          if (!fb) action = ' data-action="quiz-select" data-i="' + i + '"';
          return '<button class="' + cls + '"' + action + '><span class="option-letter">' + letter + '</span><span class="option-text">' + opt + '</span></button>';
        }).join('') + '</div>'
      : '';
    const choiceActions = q.type === 'choice' && !fb
      ? '<div class="quiz-actions"><button class="btn btn-primary" data-action="quiz-submit">提交答案</button><span class="small faint">先选一个选项，按 Enter 也可以提交</span></div>'
      : '';

    let answerArea = '';
    if (q.type === 'fill') {
      if (fb) {
        answerArea = '<div class="fill-row"><div class="answer-input ' + (fb.correct ? 'correct' : 'wrong') + '">' + App.esc(fb.given || '（空）') + '</div></div>';
      } else {
        answerArea = '<div class="fill-row">' +
          '<input class="answer-input" id="quiz-input" data-quiz-input="1" autocomplete="off" placeholder="输入答案，分数或小数均可，例如 1/6、0.167" value="' + App.esc(s.input || '') + '">' +
          '<button class="btn btn-primary" data-action="quiz-submit">提交</button></div>';
      }
    }

    if (q.type === 'calc') {
      if (!fb) {
        answerArea = '<div class="fill-row" style="flex-direction:column;align-items:stretch">' +
          '<p class="small muted">这是一道计算题。请先在纸上完成，再点开解答对照。</p>' +
          '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:6px">' +
            '<button class="btn btn-primary" data-action="quiz-calc-reveal">看解答并自评</button>' +
            '<button class="btn btn-ghost" data-action="quiz-skip">先跳过</button>' +
          '</div></div>';
      } else {
        answerArea = '<div class="feedback ' + (fb.correct == null ? '' : fb.correct ? 'ok' : 'no') + '">' +
          '<div class="feedback-head">' + (fb.correct == null ? '📝 对照一下你的步骤' : fb.correct ? '✓ 自评：做出来了' : '✗ 自评：还没做对') + '</div>' +
          '<div class="solution"><div class="solution-title">分步详解</div><ol>' + q.solution.map(function (step) { return '<li>' + step + '</li>'; }).join('') + '</ol>' +
          '<div class="final">最终答案：' + q.ans + '</div></div>' +
          '<div class="rate-row">' +
            '<button class="rate-btn" data-action="quiz-rate" data-g="again"><span>没思路</span><span class="sub">看懂了但自己想不到</span></button>' +
            '<button class="rate-btn" data-action="quiz-rate" data-g="hard"><span>有思路但卡住</span><span class="sub">下次再练一次</span></button>' +
            '<button class="rate-btn" data-action="quiz-rate" data-g="good"><span>独立做出来了</span><span class="sub">进入下一个间隔</span></button>' +
          '</div></div>';
      }
    }

    body.innerHTML = '<div class="q-card">' +
      '<div class="q-stem">' + q.stem + '</div>' +
      (q.type === 'fill' ? '<div class="q-note">提示：分数、小数、百分数都可以，判分有 0.2% 容差。</div>' : '') +
      optionsHTML + choiceActions + answerArea +
      (!fb && q.hint ? '<div style="margin-top:14px"><button class="btn btn-sm btn-ghost" data-action="quiz-hint">💡 给点提示</button></div>' : '') +
      (s.hintUsed && q.hint ? '<div class="hint-box">💡 ' + q.hint + '</div>' : '') +
      '<div id="quiz-feedback"></div>' +
    '</div>';

    if (fb) {
      const box = body.querySelector('#quiz-feedback');
      if (q.type === 'choice' || q.type === 'fill') {
        box.innerHTML = '<div class="feedback ' + (fb.correct ? 'ok' : 'no') + '">' +
          '<div class="feedback-head">' + (fb.correct ? '✓ 答对了' : '✗ 还差一点') + '</div>' +
          '<div class="answer-line">正确答案：<b>' + q.ans + '</b>' +
          (q.type === 'fill' && !fb.correct && fb.given ? ' · 你的答案：<b>' + App.esc(fb.given) + '</b>' : '') + '</div>' +
          '<div class="solution"><div class="solution-title">分步详解</div><ol>' + q.solution.map(function (step) { return '<li>' + step + '</li>'; }).join('') + '</ol></div>' +
          '<div class="quiz-actions"><button class="btn btn-primary" data-action="quiz-next">下一题 →</button>' +
          '<span class="small faint">回车继续</span></div>' +
          '</div>';
      }
    }
  }

  /* ---------------- 判分 ---------------- */
  function gradeChoice(q, sel) { return sel === q.answer; }

  function gradeFill(q, value) { return App.answersMatch(q.accepts, value); }

  function recordAnswer(q, correct, given) {
    const s = App.session;
    const res = App.answerQuestion(q, {
      correct: correct,
      hintUsed: s.hintUsed,
      mode: s.mode
    });
    s.combo = correct ? (s.combo || 0) + 1 : 0;
    s.maxCombo = Math.max(s.maxCombo || 0, s.combo);
    s.graded += 1;
    if (correct) s.correct += 1;
    s.xp = (s.xp || 0) + res.xp;
    s.answers.push({ id: q.id, kind: 'q', correct: correct, given: given });
    return res;
  }

  function advance() {
    const s = App.session;
    s.idx += 1;
    s.sel = null;
    s.input = '';
    s.revealed = false;
    s.hintUsed = false;
    s.feedback = null;
    if (s.idx >= s.items.length) finish(s);
    App.render({ keepScroll: true });
  }

  function finish(s) {
    if (s.finished) return;
    s.finished = true;
    s.endTs = Date.now();
    const graded = s.graded || 0;
    const correct = s.correct || 0;
    if (s.mode === 'test') {
      App.state.flags.examDone = true;
      const best = App.state.flags.examBest;
      if (!best || correct > best.score || (correct === best.score && graded > best.total)) {
        App.state.flags.examBest = { score: correct, total: graded, ts: Date.now() };
      }
    }
    if (graded >= 6 && correct === graded) App.state.flags.perfect = true;
    if (!s.celebrated && s.graded > 0) {
      s.celebrated = true;
      const acc = s.correct / s.graded;
      if (s.mode === 'test' || acc >= 0.8) App.confetti(s.mode === 'test' ? 44 : 34);
    }
    App.save();
    App.checkAchievements();
  }

  /* ---------------- 成绩单 ---------------- */
  function renderSummary(view) {
    const s = App.session;
    const total = s.graded || 0;
    const correct = s.correct || 0;
    const acc = total ? correct / total : 0;
    const duration = App.fmtClock(((s.endTs || Date.now()) - s.startTs) / 1000);
    const cards = s.answers.filter(function (a) { return a.kind !== 'q'; }).length;
    const wrong = s.answers.filter(function (a) { return a.kind === 'q' && !a.correct; });
    const isTest = s.mode === 'test';
    let scoreText;
    if (isTest) scoreText = correct + ' / ' + total;
    else if (total) scoreText = App.fmtPct(acc, 0);
    else scoreText = cards + ' 张';
    const subText = isTest
      ? '模拟结束 · 错题已加入复习队列'
      : total
        ? (acc === 1 ? '全部答对，漂亮' : acc >= 0.7 ? '状态不错，继续保持' : '错题已记录，回头清掉')
        : '卡片复习完成，明天见';

    const wrongRows = wrong.map(function (a) {
      const q = App.questionById[a.id];
      if (!q) return '';
      return '<div class="review-row"><span class="mark no">✗</span><span class="txt">' + App.truncate(q.stem, 80) +
        '<br><span class="faint">正确答案：' + q.ans + '</span></span></div>';
    }).join('');

    view.innerHTML = '<div class="quiz-wrap"><div class="card card-pad">' +
      '<div class="summary">' +
        '<div class="summary-medal">' + (total ? (acc >= 0.9 ? '🏆' : acc >= 0.6 ? '💪' : '🌱') : '🃏') + '</div>' +
        '<div class="eyebrow" style="justify-content:center">' + (isTest ? 'MOCK EXAM' : s.mode === 'review' ? 'REVIEW' : 'PRACTICE') + '</div>' +
        '<div class="big-num">' + scoreText + '</div>' +
        '<div class="big-sub">' + subText + '</div>' +
        ((s.maxCombo || 0) >= 2 ? '<div class="chip chip-amber" style="font-size:11px">🔥 最高连对 ' + s.maxCombo + ' 题</div>' : '') +
        '<div class="summary-stats">' +
          '<div class="item"><span class="v">' + total + '</span><span class="l">作答题目</span></div>' +
          '<div class="item"><span class="v">' + correct + '</span><span class="l">答对</span></div>' +
          '<div class="item"><span class="v">' + duration + '</span><span class="l">用时</span></div>' +
          '<div class="item"><span class="v">+' + (s.xp || 0) + '</span><span class="l">能量</span></div>' +
        '</div>' +
        (total >= 6 && correct === total
          ? '<div class="chip chip-soft" style="font-size:12px">💯 全对！这组题可以毕业了</div>'
          : '<div class="small muted">' + (isTest ? '低于预期也没关系，错题已加入复习队列。' : '错题会自动进入错题本，连续答对两次才移出。') + '</div>') +
      '</div>' +
      (wrong.length ? '<div class="review-list"><div class="card-title" style="font-size:13px;margin-bottom:4px">本次错题（' + wrong.length + '）</div>' + wrongRows + '</div>' : '') +
      '<div class="quiz-actions" style="justify-content:center;margin-top:20px">' +
        '<button class="btn btn-primary" data-action="quiz-home">回到今日</button>' +
        (wrong.length ? '<button class="btn btn-ghost" data-action="quiz-review-wrong">重练错题</button>' : '') +
        '<button class="btn btn-ghost" data-action="quiz-again">再来一组</button>' +
      '</div>' +
    '</div></div>';
  }

  /* ---------------- 动作 ---------------- */
  App.actions['quiz-select'] = function (el) {
    App.session.sel = Number(el.getAttribute('data-i'));
    App.render({ keepScroll: true });
  };

  App.actions['quiz-hint'] = function () {
    App.session.hintUsed = true;
    App.render({ keepScroll: true });
  };

  App.actions['quiz-submit'] = function () {
    const s = App.session;
    if (!s || s.finished || s.feedback) return;
    const item = currentItem();
    if (!item || item.kind !== 'q') return;
    const q = qOf(item);

    if (q.type === 'choice') {
      if (s.sel == null) { App.toast('先选一个选项'); return; }
      const ok = gradeChoice(q, s.sel);
      if (s.mode === 'test') {
        recordAnswer(q, ok, s.sel);
        advance();
      } else {
        recordAnswer(q, ok, s.sel);
        s.feedback = { correct: ok, given: s.sel };
        App.render({ keepScroll: true });
      }
    } else if (q.type === 'fill') {
      const input = document.getElementById('quiz-input');
      const value = input ? input.value.trim() : (s.input || '').trim();
      if (!value) { App.toast('先写一个答案，或者点“跳过”'); return; }
      const ok = gradeFill(q, value);
      if (s.mode === 'test') {
        recordAnswer(q, ok, value);
        advance();
      } else {
        recordAnswer(q, ok, value);
        s.feedback = { correct: ok, given: value };
        App.render({ keepScroll: true });
      }
    }
  };

  App.actions['quiz-calc-reveal'] = function () {
    const s = App.session;
    s.feedback = { correct: null };
    App.render({ keepScroll: true });
  };

  App.actions['quiz-rate'] = function (el) {
    const s = App.session;
    const q = qOf(currentItem());
    const g = el.getAttribute('data-g');
    const correct = g === 'good';
    recordAnswer(q, correct, g === 'good' ? '独立完成' : g === 'hard' ? '有思路但卡住' : '没思路');
    advance();
  };

  App.actions['quiz-card-reveal'] = function () {
    App.session.revealed = true;
    App.render({ keepScroll: true });
  };

  App.actions['quiz-card-rate'] = function (el) {
    const s = App.session;
    const card = cardOf(currentItem());
    const g = el.getAttribute('data-g');
    const res = App.rateCard(card.id, g, { mode: s.mode });
    s.xp = (s.xp || 0) + (res && res.xp || 0);
    s.answers.push({ kind: 'card', id: card.id });
    advance();
  };

  App.actions['quiz-next'] = function () { advance(); };

  App.actions['quiz-skip'] = function () {
    const s = App.session;
    if (s.mode === 'test') { App.toast('考试模式不能跳过，先选一个答案吧'); return; }
    advance();
  };

  App.actions['quiz-quit'] = function () {
    App.modal({
      title: '要退出这组练习吗？',
      sub: '已作答的题目会保留进度，但这组的成绩单不会生成。',
      body: '<p class="small muted">建议至少做完这一题再走。</p>',
      foot: '<button class="btn btn-ghost" data-modal-close="1">继续做题</button><button class="btn btn-coral" id="quiz-quit-yes">退出</button>',
      onMount: function (modalEl, close) {
        modalEl.querySelector('#quiz-quit-yes').addEventListener('click', function () {
          App.session = null;
          close();
          App.go('#/practice');
        });
      }
    });
  };

  App.actions['quiz-home'] = function () { App.go('#/today'); };

  App.actions['quiz-again'] = function () {
    App.session = null;
    App.startQuiz({ chapters: null, count: 10, mode: 'practice', title: '随机练习' });
  };

  App.actions['quiz-review-wrong'] = function () {
    const ids = (App.session.answers || []).filter(function (a) { return a.kind === 'q' && !a.correct; }).map(function (a) { return a.id; });
    App.session = null;
    if (!ids.length) { App.go('#/practice'); return; }
    App.startQuiz({ items: App.shuffle(ids).map(function (id) { return { kind: 'q', id: id }; }), mode: 'wrong', title: '错题重练' });
  };

  App.actions['quiz-wrongbook'] = function () {
    App.ui.practiceTab = 'wrong';
    App.session = null;
    App.go('#/practice');
  };
})(typeof window !== 'undefined' ? window : globalThis);
