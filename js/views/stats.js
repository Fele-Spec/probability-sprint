/* 数据：进度、正确率、弱点、成就 */
(function (root) {
  const App = root.App;
  const Store = App.Store;

  App.views.stats = function (view) {
    const s = App.state;
    const stats = App.computeStats();
    const lvl = Store.levelInfo();
    const due = App.dueItems().length;

    const chapterRows = stats.chapterStats.map(function (c) {
      const acc = c.accuracy == null ? '—' : App.fmtPct(c.accuracy, 0);
      return '<div class="card card-pad" style="margin-top:12px">' +
        '<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap">' +
          '<div class="card-title">' + c.emoji + ' 第' + ['一', '二', '三'][c.id - 1] + '章 · ' + c.title + '</div>' +
          '<div class="small muted">正确率 <b style="color:var(--ink)">' + acc + '</b> · 已学 ' + c.learned + '/' + c.totalSections + ' 节 · 看过 ' + c.cardsSeen + '/' + c.cardsTotal + ' 张卡</div>' +
        '</div>' +
        '<div class="progress" style="margin-top:10px"><span style="width:' + Math.round((c.learned / c.totalSections) * 100) + '%"></span></div>' +
        '<div class="progress coral" style="margin-top:6px;height:5px"><span style="width:' + Math.round((c.accuracy || 0) * 100) + '%"></span></div>' +
        '<div class="tiny faint" style="margin-top:5px">上：小节完成度 · 下：答题正确率（' + c.correct + '/' + c.answered + '）</div>' +
      '</div>';
    }).join('');

    const maxWeek = Math.max(1, Math.max.apply(null, stats.week.map(function (d) { return d.count; })));
    const weekBars = stats.week.map(function (d) {
      const h = Math.round((d.count / maxWeek) * 64) + 4;
      return '<div class="week-bar" title="' + d.key + '：' + d.count + ' 次练习">' +
        '<div class="bar' + (d.count ? ' has' : '') + '" style="height:' + h + 'px"></div>' +
        '<span class="d">' + d.label + '</span></div>';
    }).join('');

    const weak = stats.tagStats.filter(function (t) { return t.attempts >= 2; }).slice(0, 6);
    const weakRows = weak.length
      ? weak.map(function (t) {
          return '<div class="weak-row"><span>' + t.tag + '<span class="tiny faint"> · ' + t.attempts + ' 次</span></span>' +
            '<span class="small ' + (t.accuracy < 0.6 ? 'muted' : 'faint') + '" style="font-family:var(--mono)">' + App.fmtPct(t.accuracy, 0) + '</span></div>';
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

      '<div class="grid-4">' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">等级</span><span class="stat-icon">🎖️</span></div>' +
          '<div class="stat-num">Lv.' + lvl.level + '</div><div class="stat-sub">' + lvl.title + ' · ' + lvl.progress + '/' + lvl.need + ' 到下一级</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">连续学习</span><span class="stat-icon">🔥</span></div>' +
          '<div class="stat-num">' + s.streak.current + ' 天</div><div class="stat-sub">最长 ' + Math.max(s.streak.best, s.streak.current) + ' 天</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">已学小节</span><span class="stat-icon">📖</span></div>' +
          '<div class="stat-num">' + stats.learnedSections + '/' + stats.totalSections + '</div><div class="stat-sub">累计看过 ' + stats.seenCards + '/' + stats.totalCards + ' 张卡</div></div>' +
        '<div class="stat-card"><div class="stat-top"><span class="stat-label">正确率</span><span class="stat-icon">🎯</span></div>' +
          '<div class="stat-num">' + (stats.accuracy == null ? '—' : App.fmtPct(stats.accuracy, 0)) + '</div><div class="stat-sub">' + stats.correct + '/' + stats.answered + ' 题 · 到期 ' + due + '</div></div>' +
      '</div>' +

      '<div class="grid-2" style="margin-top:16px;align-items:start">' +
        '<div class="card card-pad">' +
          '<div class="card-head"><div class="card-title">📚 章节进度</div><span class="card-sub">完成度 / 正确率</span></div>' +
          chapterRows +
        '</div>' +
        '<div>' +
          '<div class="card card-pad">' +
            '<div class="card-head"><div class="card-title">🗓️ 最近 7 天</div><span class="card-sub">练习次数</span></div>' +
            '<div class="week-bars">' + weekBars + '</div>' +
          '</div>' +
          '<div class="card card-pad" style="margin-top:16px">' +
            '<div class="card-head"><div class="card-title">🧭 薄弱标签</div><span class="card-sub">正确率最低</span></div>' +
            weakRows +
            '<div class="tiny faint" style="margin-top:8px">标签正确率基于该题所有作答次数。</div>' +
          '</div>' +
          '<div class="card card-pad" style="margin-top:16px">' +
            '<div class="card-head"><div class="card-title">💡 下一步建议</div></div>' +
            '<p class="small muted" style="line-height:1.8">' +
              (stats.due ? '有 ' + stats.due + ' 项到期，先清复习。' : '复习已清空，可以推进新小节。') +
              (stats.wrongCount ? ' 错题本还有 ' + stats.wrongCount + ' 道，建议今天清掉一半。' : ' 错题本很干净，保持。') +
              (stats.learnedSections < 8 ? ' 目前进度偏慢，优先保证每天 2 个小节。' : ' 进度不错，接下来多做题、多混合。') +
            '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-head"><div class="card-title">🏅 成就</div><span class="card-sub">' + Object.keys(s.achievements).length + ' / ' + App.data.achievements.length + '</span></div>' +
        '<div class="achievements">' + ach + '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-head"><div class="card-title">⚙️ 数据管理</div></div>' +
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
