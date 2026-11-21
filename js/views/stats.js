/* 数据：玩家卡、章节圆环、弱点、成就贴纸墙 */
(function (root) {
  const App = root.App;
  const Store = App.Store;

  App.views.stats = function (view) {
    const s = App.state;
    const stats = App.computeStats();
    const lvl = Store.levelInfo();
    const due = App.dueItems().length;
    const examLeft = Store.examDaysLeft();

    const chapterCards = stats.chapterStats.map(function (c, i) {
      const pct = Math.round((c.learned / c.totalSections) * 100);
      const acc = c.accuracy == null ? '—' : App.fmtPct(c.accuracy, 0);
      return '<div class="card card-pad chapter-card">' +
        '<div class="chapter-row">' +
          '<div class="chapter-ring" style="--p:' + pct + '"><span>' + c.learned + '/' + c.totalSections + '</span></div>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="card-title" style="font-size:14px">' + c.emoji + ' 第' + ['一', '二', '三'][c.id - 1] + '章</div>' +
            '<div class="small muted" style="margin-top:2px">正确率 ' + acc + ' · 看过 ' + c.cardsSeen + '/' + c.cardsTotal + ' 张卡</div>' +
          '</div>' +
        '</div>' +
        '<div class="progress" style="margin-top:12px"><span style="width:' + pct + '%"></span></div>' +
        '<div class="tiny faint" style="margin-top:5px">小节完成度 ' + pct + '%</div>' +
      '</div>';
    }).join('');

    const maxWeek = Math.max(1, Math.max.apply(null, stats.week.map(function (d) { return d.count; })));
    const weekBars = stats.week.map(function (d) {
      const h = Math.round((d.count / maxWeek) * 70) + 5;
      return '<div class="week-bar" title="' + d.key + '：' + d.count + ' 次练习">' +
        '<div class="bar' + (d.count ? ' has' : '') + '" style="height:' + h + 'px"></div>' +
        '<span class="d">' + d.label + '</span></div>';
    }).join('');

    const weak = stats.tagStats.filter(function (t) { return t.attempts >= 2; }).slice(0, 6);
    const weakRows = weak.length
      ? weak.map(function (t) {
          return '<div class="weak-row"><span>' + t.tag + '<span class="tiny faint"> · ' + t.attempts + ' 次</span></span>' +
            '<span class="small" style="font-family:var(--mono);color:' + (t.accuracy < 0.6 ? 'var(--coral)' : 'var(--muted)') + '">' + App.fmtPct(t.accuracy, 0) + '</span></div>';
        }).join('')
      : '<div class="small muted" style="padding:6px 0">做题满 2 次后，这里会显示你的薄弱知识点。</div>';

    const ach = App.data.achievements.map(function (a) {
      const ts = s.achievements[a.id];
      return '<div class="achievement ' + (ts ? 'unlocked' : 'locked') + '" title="' + (ts ? new Date(ts).toLocaleDateString('zh-CN') : '未解锁') + '">' +
        '<div class="ic">' + a.icon + '</div>' +
        '<div><div class="name">' + a.name + '</div><div class="desc">' + a.desc + '</div></div>' +
      '</div>';
    }).join('');

    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">YOUR DATA · LOCAL ONLY</div><h1>数据</h1>' +
      '<div class="sub">所有记录只存在你的浏览器本地（localStorage），不会上传。换设备时可在设置里导出/导入存档。</div></div>' +

      '<section class="player-card">' +
        '<div class="player-mascot">' + App.mascotSVG(98) + '</div>' +
        '<div class="player-info">' +
          '<div class="eyebrow light">PLAYER CARD</div>' +
          '<h2>Lv.' + lvl.level + ' · ' + lvl.title + '</h2>' +
          '<div class="p-sub">距离下一级还差 ' + Math.max(0, lvl.need - lvl.progress) + ' XP · 今日 +' + s.daily.xp + ' XP</div>' +
          '<div class="player-xp"><span>' + lvl.progress + ' / ' + lvl.need + ' XP</span><span>' + s.xp + ' total</span>' +
            '<div class="progress"><span style="width:' + Math.round(lvl.pct * 100) + '%"></span></div>' +
          '</div>' +
          '<div class="player-meta">' +
            '<span>🔥 <b>' + s.streak.current + '</b> 天</span>' +
            '<span>📖 <b>' + stats.learnedSections + '</b> 节</span>' +
            '<span>🎯 <b>' + (stats.accuracy == null ? '—' : App.fmtPct(stats.accuracy, 0)) + '</b></span>' +
            '<span>🗓️ 还剩 <b>' + examLeft + '</b> 天</span>' +
          '</div>' +
        '</div>' +
        '<div class="player-ring" style="--p:' + Math.round(lvl.pct * 100) + '">' +
          '<div class="pr-inner"><b>' + lvl.progress + '</b><span>TO NEXT</span></div>' +
        '</div>' +
      '</section>' +

      '<div class="grid-4" style="margin-bottom:18px">' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">已学小节</span><span class="stat-icon">📖</span></div>' +
          '<div class="stat-num">' + stats.learnedSections + '<span style="font-size:15px;color:var(--muted)"> / ' + stats.totalSections + '</span></div><div class="stat-sub">看过 ' + stats.seenCards + ' / ' + stats.totalCards + ' 张卡</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">累计答题</span><span class="stat-icon">✏️</span></div>' +
          '<div class="stat-num">' + stats.answered + '</div><div class="stat-sub">答对 ' + stats.correct + ' 题</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">正确率</span><span class="stat-icon">🎯</span></div>' +
          '<div class="stat-num">' + (stats.accuracy == null ? '—' : App.fmtPct(stats.accuracy, 0)) + '</div><div class="stat-sub">已掌握 ' + stats.mastered + ' 题</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">待清理</span><span class="stat-icon">🧹</span></div>' +
          '<div class="stat-num">' + (due + stats.wrongCount) + '</div><div class="stat-sub">到期 ' + due + ' · 错题 ' + stats.wrongCount + '</div></div>' +
      '</div>' +

      '<div class="grid-3" style="margin-bottom:18px">' + chapterCards + '</div>' +

      '<div class="grid-2" style="align-items:start">' +
        '<div class="card card-pad">' +
          '<div class="card-head"><div class="card-title">🗓️ 最近 7 天</div><span class="card-sub">练习次数</span></div>' +
          '<div class="week-bars">' + weekBars + '</div>' +
          '<div class="tiny faint" style="margin-top:8px">真正算数的是今天有没有动手，不是连续天数本身。</div>' +
        '</div>' +
        '<div class="card card-pad">' +
          '<div class="card-head"><div class="card-title">🧭 薄弱标签</div><span class="card-sub">正确率最低</span></div>' +
          weakRows +
          '<div class="tiny faint" style="margin-top:8px">标签正确率基于该题所有作答次数。</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:18px">' +
        '<div class="card-head"><div class="card-title">🏅 成就贴纸墙</div><span class="card-sub">' + Object.keys(s.achievements).length + ' / ' + App.data.achievements.length + '</span></div>' +
        '<div class="achievements">' + ach + '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:18px">' +
        '<div class="card-head"><div class="card-title">💡 下一步</div></div>' +
        '<p class="small muted" style="line-height:1.8">' +
          (stats.due ? '有 ' + stats.due + ' 项到期，先清复习。' : '复习已清空，可以推进新小节。') +
          (stats.wrongCount ? ' 错题本还有 ' + stats.wrongCount + ' 道，建议今天清掉一半。' : ' 错题本很干净，保持。') +
          (stats.learnedSections < 8 ? ' 目前进度偏慢，优先保证每天 2 个小节。' : ' 进度不错，接下来多做题、多混合。') +
        '</p>' +
        '<div class="quick-strip" style="margin-top:12px">' +
          '<a class="quick-link2" href="#/learn">📖 去学习</a>' +
          '<a class="quick-link2" href="#/practice">✏️ 去练题</a>' +
          '<a class="quick-link2" href="#/cheatsheet">📋 公式速查</a>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:18px">' +
        '<div class="card-head"><div class="card-title">⚙️ 数据管理</div><span class="card-sub">每周导出一次更安心</span></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn btn-sm btn-primary" data-action="stats-export">导出存档</button>' +
          '<button class="btn btn-sm btn-ghost" data-action="stats-import">导入存档</button>' +
          '<a class="btn btn-sm btn-ghost" href="#/settings">更多设置</a>' +
        '</div>' +
      '</div>';
  };

  App.actions['stats-export'] = function () { App.exportData(); };
  App.actions['stats-import'] = function () { App.go('#/settings'); };
})(typeof window !== 'undefined' ? window : globalThis);
