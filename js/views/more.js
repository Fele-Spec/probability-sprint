/* 方法 / 公式速查 / 设置 */
(function (root) {
  const App = root.App;
  const Store = App.Store;

  /* ================= 方法说明 ================= */
  App.views.method = function (view) {
    const plan = App.data.plan;

    const planRows = plan.days.map(function (d) {
      const secs = d.sections.length
        ? d.sections.map(function (id) { return App.sectionById[id].num + ' ' + App.sectionById[id].title; }).join('；')
        : '复习日：模拟 + 错题 + 公式';
      return '<tr><td><b>Day ' + d.day + '</b><br><span class="tiny faint">' + d.title + '</span></td>' +
        '<td>' + secs + '</td><td class="tiny">' + d.practice.count + ' 题</td></tr>';
    }).join('');

    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">EVIDENCE-BASED · 学习科学</div><h1>方法</h1>' +
      '<div class="sub">这不是“感觉有效”的学习法。下面是设计这个平台时参考的证据，以及每条证据最后变成了什么功能。</div></div>' +

      '<div class="prose">' +
        '<div class="callout">一句话版本：<b>间隔复习 + 主动提取 + 工作样例 + 交错练习 + 轻度游戏化</b>。' +
        '七天足够把前三章从“见过”推到“能做题”，但不是靠熬夜刷题堆出来的。</div>' +

        '<h2>① 间隔练习：数学领域最稳的收益</h2>' +
        '<p>2025 年一项针对数学学习的元分析汇总了 27 项研究、53 个效应量，发现<b>分散练习相对集中练习的合并效应量 g≈0.28</b>（小到中等），' +
        '且“孤立材料”上的效果（g≈0.43）比“课程内嵌”更大（g≈0.24）。<span class="cite">Murray, Horner &amp; Göbel (2025), Educational Psychology Review.</span></p>' +
        '<p>所以平台把“到期复习”放在每天第一项，并用 SM-2 风格的调度器按考试日封顶间隔：宁可少排一点，也不让间隔长到考试之后。</p>' +

        '<h2>② 提取练习：有效，但数学题上别神化</h2>' +
        '<p>“测试效应”在记忆类材料上非常稳。同一项数学元分析里，测试 vs 重读的加权效应只有 <b>g≈0.18</b>，而且 95% 置信区间跨过 0——作者明确说数学领域的提取练习证据还不稳健。' +
        '这提醒我们：<b>只刷题不等于高效学习</b>，概念和公式需要用卡片主动回忆，而解题需要工作样例与自我解释。</p>' +
        '<p>平台的对应做法：知识卡“先猜后学”，题后看分步详解，计算题强制“先做后看”，再做费曼自述。</p>' +

        '<h2>③ 预测试：猜错也有价值</h2>' +
        '<p>先尝试回答、再学习，比直接阅读记得更牢。2025 年一项关于预测试效应稳健性的研究再次验证：在学习前进行提取尝试（即使失败）能促进后续学习。' +
        '<span class="cite">Testing before learning, Memory &amp; Cognition (2025).</span>平台的卡片流就是“先自己想，再翻面”。</p>' +

        '<h2>④ 交错练习：练“选方法”，不是练“套公式”</h2>' +
        '<p>把不同题型混着练，学生必须自己判断“这题该用什么”，效果往往优于按题型分块刷。Rohrer 等人的课堂实验发现，交错练习在延迟测试上的优势可以非常大（有研究报道 72% vs 38% 量级）。' +
        '<span class="cite">Rohrer, Dedrick &amp; Burgess (2014), Psychonomic Bulletin &amp; Review.</span></p>' +
        '<p>平台在后期（Day 6~7）安排混合专项与全真模拟，就是为了制造这种“先判断、再动手”的难度。</p>' +

        '<h2>⑤ 工作样例 + 自我解释：新手学解题的正确姿势</h2>' +
        '<p>认知负荷研究表明，新手在元素交互性高的材料上，<b>先研究完整的工作样例</b>再独立解题，比一上来硬做更高效（worked example effect）。' +
        '所以每节都有“典型例题”：先给题目，自己写两分钟，再看分步过程；费曼自述则强迫你把方法讲出来。</p>' +

        '<h2>⑥ 游戏化：有用，但要克制</h2>' +
        '<p>元分析显示游戏化对学习动机有小到中等的作用（多项研究 g≈0.26 左右），但 2026 年一项针对 Duolingo 的质性研究警告：<b>连续打卡可能变成“为了不断签而学”</b>，出现目标漂移。' +
        '所以这里的 XP、连击、成就是“顺便发生”的，没有排行榜、没有惩罚、没有内购，也不会用红点催你。</p>' +

        '<h2>这些结论最后变成了什么？</h2>' +
        '<div class="card card-pad" style="margin:14px 0">' +
          '<table class="dist-table"><thead><tr><th>学习机制</th><th>平台做法</th><th>依据</th></tr></thead><tbody>' +
            '<tr><td>间隔</td><td>SM-2 复习队列、每日到期、按考试日封顶</td><td>g≈0.28</td></tr>' +
            '<tr><td>提取</td><td>先猜后学卡片、随堂测、错题重练</td><td>测试效应</td></tr>' +
            '<tr><td>预测试</td><td>卡片先回答再翻面</td><td>pretesting</td></tr>' +
            '<tr><td>工作样例</td><td>每节典型例题 + 分步详解</td><td>worked example</td></tr>' +
            '<tr><td>自我解释</td><td>费曼自述输入框</td><td>self-explanation</td></tr>' +
            '<tr><td>交错</td><td>混合专项、全真模拟</td><td>interleaving</td></tr>' +
            '<tr><td>动机</td><td>轻量 XP / 连击 / 成就</td><td>gamification</td></tr>' +
          '</tbody></table>' +
        '</div>' +

        '<h2>7 天冲刺表</h2>' +
        '<p class="small muted">按“首次使用日 + 7 天”推进；考试日只影响倒计时与复习间隔，不会跳章节。' +
        'Day 1 从今天算起，Day 7 做模拟与错题清零。每天 60~90 分钟，分两段完成也可以。</p>' +
        '<div class="card card-pad" style="margin:14px 0">' +
          '<table class="dist-table"><thead><tr><th>日期</th><th>新内容</th><th>练题</th></tr></thead><tbody>' + planRows + '</tbody></table>' +
        '</div>' +

        '<h2>每天怎么用（90 分钟版）</h2>' +
        '<ol>' +
          '<li><b>0~15 分钟：</b>清掉到期复习。先回忆，再看答案；错的标记“没记住”。</li>' +
          '<li><b>15~50 分钟：</b>学当天的新小节。卡片逐张过，公式先遮住复述，例题先自己做。</li>' +
          '<li><b>50~80 分钟：</b>做专项练习。卡住先看提示，做完必须对照详解。</li>' +
          '<li><b>80~90 分钟：</b>用一句话写下今天的费曼自述，然后收工。</li>' +
        '</ol>' +

        '<div class="callout warn" style="margin-top:18px"><b>我们刻意没做的事：</b>排行榜、连续打卡惩罚、无限题海、“看视频就算学”、' +
        '把公式抄一遍当复习。它们要么制造焦虑，要么制造“熟悉的错觉”。</div>' +

        '<h2>参考与延伸</h2>' +
        '<div class="source-list">' +
          '<div class="src"><b>Murray, E., Horner, A. J., &amp; Göbel, S. M. (2025).</b> A Meta-analytic Review of the Effectiveness of Spacing and Retrieval Practice for Mathematics Learning. <i>Educational Psychology Review</i>. <a href="https://doi.org/10.1007/s10648-025-10035-1" target="_blank" rel="noopener">doi:10.1007/s10648-025-10035-1</a></div>' +
          '<div class="src"><b>Retrieval practice / distributed / interleaved（课堂情境元分析，2026）.</b> <a href="https://link.springer.com/article/10.1007/s10648-026-10225-5" target="_blank" rel="noopener">Springer</a></div>' +
          '<div class="src"><b>Rohrer, D., Dedrick, R. F., &amp; Burgess, K. (2014).</b> The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems. <a href="https://link.springer.com/article/10.3758/s13423-014-0588-3" target="_blank" rel="noopener">Psychonomic Bulletin &amp; Review</a></div>' +
          '<div class="src"><b>Testing before learning (2025).</b> Exploring the robustness of the pretesting effect. <a href="https://link.springer.com/article/10.3758/s13421-025-01813-x" target="_blank" rel="noopener">Memory &amp; Cognition</a></div>' +
          '<div class="src"><b>FSRS（开源间隔重复调度器）.</b> 本平台参考其“按记忆稳定性调度”的思路，简化实现为 SM-2 变体。 <a href="https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler" target="_blank" rel="noopener">GitHub</a></div>' +
          '<div class="src"><b>Seeing Theory（Brown University）.</b> 交互式概率可视化，本平台实验室的灵感来源之一。 <a href="https://seeingtheory.brown.edu/" target="_blank" rel="noopener">seeingtheory.brown.edu</a></div>' +
          '<div class="src"><b>Khan Academy Mastery Learning.</b> “掌握后再前进”的节奏设计。 <a href="https://support.khanacademy.org/hc/en-us/articles/360030753412" target="_blank" rel="noopener">说明页</a></div>' +
          '<div class="src"><b>教材目录核对.</b> 《概率论与数理统计》第五版（浙江大学 盛骤、谢式千、潘承毅），高等教育出版社。 <a href="https://xuanshu.hep.com.cn/front/book/findBookDetails?bookId=6266d3d2938b7cc2960ee9f3" target="_blank" rel="noopener">产品页</a></div>' +
        '</div>' +
        '<p class="tiny faint" style="margin-top:16px">注：这里的“效应量”来自各研究自己的报告，具体边界条件请读原文；本页用于设计取舍，不是系统综述。</p>' +
      '</div>';
  };

  /* ================= 公式速查 ================= */
  App.views.cheatsheet = function (view) {
    const blocks = App.data.knowledge.chapters.map(function (ch) {
      const secs = ch.sections.map(function (sec) {
        const formulas = sec.formulas.map(function (f) {
          return '<div class="formula-row"><div class="formula-label">' + f.label + '</div><div class="formula-html">' + f.html + '</div></div>';
        }).join('');
        return '<div class="cheat-block" style="margin-bottom:14px">' +
          '<h3>' + sec.num + ' ' + sec.title + '</h3>' +
          '<div class="formula-box">' + formulas + '</div></div>';
      }).join('');
      return '<div class="card card-pad" style="margin-bottom:16px">' +
        '<div class="card-head"><div class="card-title">' + ch.emoji + ' 第' + ['一', '二', '三'][ch.id - 1] + '章 · ' + ch.title + '</div>' +
        '<span class="card-sub">' + ch.sections.length + ' 节</span></div>' +
        '<div class="cheat-grid">' + secs + '</div></div>';
    }).join('');

    const tips = [
      '样本空间要“不重不漏、等可能”，否则古典概率直接错。',
      '“至少一个”优先用对立事件：1 − P(一个都没有)。',
      '独立是 P(AB)=P(A)P(B)；互斥是 P(AB)=0，两件事完全不同。',
      '全概率 = 按原因分类加权；贝叶斯 = 已知结果反推原因。',
      '分布函数 F(x)=P(X≤x)，离散看跳跃，连续看积分。',
      '密度 f(x) 不是概率，可以大于 1；面积才是概率。',
      '正态第一步永远是标准化 Z=(X−μ)/σ。',
      '连续型单点概率为 0，但事件依然可能发生。',
      '边缘分布不能反推联合分布，除非已知独立。',
      '卷积积分先写“两个密度都非零”的条件，再求区间交集。'
    ];
    const tipRows = tips.map(function (t, i) {
      return '<div class="weak-row"><span><b style="font-family:var(--mono);font-size:11px;color:var(--faint)">' + String(i + 1).padStart(2, '0') + '</b> &nbsp;' + t + '</span></div>';
    }).join('');

    view.innerHTML =
      '<div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">' +
        '<div><div class="eyebrow">ONE-PAGE FORMULA SHEET</div><h1>公式速查</h1>' +
        '<div class="sub">考前最后一晚看这一页。建议先遮住右边，自己默写，再对照。</div></div>' +
        '<button class="btn btn-sm btn-ghost" onclick="window.print()">🖨️ 打印 / 存 PDF</button>' +
      '</div>' +

      blocks +

      '<div class="card card-pad" style="margin-top:6px">' +
        '<div class="card-head"><div class="card-title">📋 常见分布对照</div></div>' +
        '<table class="dist-table"><thead><tr><th>分布</th><th>参数</th><th>分布律 / 密度</th><th>典型场景</th></tr></thead><tbody>' +
          '<tr><td>0-1</td><td>p</td><td><span class="m">P(X=1)=p</span></td><td>一次伯努利试验</td></tr>' +
          '<tr><td>二项 B(n,p)</td><td>n, p</td><td><span class="m">C(n,k)pᵏ(1−p)ⁿ⁻ᵏ</span></td><td>n 次独立重复的成功次数</td></tr>' +
          '<tr><td>泊松 P(λ)</td><td>λ</td><td><span class="m">λᵏe^(−λ)/k!</span></td><td>稀有事件计数、单位时间呼叫数</td></tr>' +
          '<tr><td>几何 G(p)</td><td>p</td><td><span class="m">(1−p)ᵏ⁻¹p</span></td><td>首次成功所需次数</td></tr>' +
          '<tr><td>超几何</td><td>N, M, n</td><td><span class="m">C(M,k)C(N−M,n−k)/C(N,n)</span></td><td>不放回抽样的次品数</td></tr>' +
          '<tr><td>均匀 U(a,b)</td><td>a, b</td><td><span class="m">1/(b−a)</span></td><td>等可能落在区间</td></tr>' +
          '<tr><td>指数 E(λ)</td><td>λ</td><td><span class="m">λe^(−λx)</span></td><td>寿命、等待时间（无记忆）</td></tr>' +
          '<tr><td>正态 N(μ,σ²)</td><td>μ, σ²</td><td><span class="m">标准正态后查 Φ</span></td><td>误差、测量值、大量独立因素叠加</td></tr>' +
        '</tbody></table>' +
        '<p class="tiny faint" style="margin-top:8px">数字特征（期望、方差）在第四章，本平台暂不展开。</p>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-head"><div class="card-title">🔟 考前十条</div></div>' +
        tipRows +
      '</div>';
  };

  /* ================= 设置 ================= */
  App.views.settings = function (view) {
    const s = App.state;
    const planDay = Store.planDay();
    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">SETTINGS · LOCAL DATA</div><h1>设置</h1>' +
      '<div class="sub">调整考试日与每日目标。所有数据都存在本地浏览器里。</div></div>' +

      '<div class="grid-2" style="align-items:start">' +
        '<div class="card card-pad">' +
          '<div class="card-head"><div class="card-title">🗓️ 考试日</div><span class="card-sub">计划按考试日倒推</span></div>' +
          '<div class="form-field"><label>考试日期</label><input type="date" id="set-exam" value="' + s.examDate + '">' +
            '<div class="form-hint">当前是第 ' + planDay + ' / 7 天（从首次使用日起算），距考试 ' + Store.examDaysLeft() + ' 天。考试日只影响倒计时与复习间隔。</div></div>' +
          '<div class="form-field"><label>每日目标题量</label><input type="number" id="set-daily" min="1" max="50" value="' + s.settings.dailyQuestions + '">' +
            '<div class="form-hint">今日任务里的建议题量。少一点也行，关键是每天都来。</div></div>' +
          '<button class="btn btn-primary" data-action="settings-save">保存设置</button>' +
        '</div>' +

        '<div class="card card-pad">' +
          '<div class="card-head"><div class="card-title">💾 存档</div><span class="card-sub">导出 / 导入 / 重置</span></div>' +
          '<p class="small muted" style="line-height:1.8">进度存在浏览器 localStorage 里。清理浏览器数据、换浏览器都会丢，建议每周导出一次。</p>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
            '<button class="btn btn-sm btn-primary" data-action="settings-export">导出 JSON</button>' +
            '<button class="btn btn-sm btn-ghost" data-action="settings-import">导入 JSON</button>' +
            '<input type="file" id="import-file" accept=".json,application/json" style="display:none">' +
          '</div>' +
          '<hr class="rule">' +
          '<div class="small muted" style="line-height:1.8">当前存档：Lv.' + Store.levelInfo().level + ' · ' +
            s.xp + ' 能量 · 连续 ' + s.streak.current + ' 天 · 已学 ' + Store.learnedSectionCount() + '/16 节</div>' +
          '<button class="btn btn-sm btn-ghost" style="margin-top:14px;color:var(--bad);border-color:#eccabe" data-action="settings-reset">清空全部数据</button>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-head"><div class="card-title">📦 关于这个平台</div></div>' +
        '<div class="small muted" style="line-height:1.9">' +
          '<b style="color:var(--ink)">概率冲刺 v1.1 · 交互增强版</b> · 为浙大《概率论与数理统计》第五版前三章设计的一周冲刺工具。<br>' +
          '内容覆盖 16 个小节、94 道原创题、13 个成就、4 个交互实验室。纯静态前端，无账号、无网络请求、无依赖。<br>' +
          '设计说明与参考文献见 <a href="#/method">方法页</a>；教材目录按高等教育出版社第五版核对。' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
          '<a class="btn btn-sm btn-ghost" href="#/method">看设计依据</a>' +
          '<a class="btn btn-sm btn-ghost" href="#/cheatsheet">公式速查</a>' +
          '<a class="btn btn-sm btn-ghost" href="#/today">回到今日</a>' +
          '<a class="btn btn-sm btn-ghost" href="https://fele-spec.github.io/probability-sprint/" target="_blank" rel="noopener">🌐 在线版</a>' +
        '</div>' +
      '</div>' +

      '<div class="card card-pad" style="margin-top:16px">' +
        '<div class="card-head"><div class="card-title">⌨️ 快捷键</div></div>' +
        '<div class="small muted" style="line-height:2">' +
          '选择题：按 <span class="kbd">1</span>~<span class="kbd">4</span> 选项，<span class="kbd">Enter</span> 提交 / 下一题。<br>' +
          '卡片：<span class="kbd">空格</span> 翻面，<span class="kbd">1</span>/<span class="kbd">2</span>/<span class="kbd">3</span> 对应“没记住 / 有点模糊 / 记住了”。<br>' +
          '<span class="kbd">Esc</span> 关闭弹窗。' +
        '</div>' +
      '</div>';
  };

  App.actions['settings-save'] = function () {
    const exam = document.getElementById('set-exam');
    const daily = document.getElementById('set-daily');
    const dateVal = exam ? exam.value : '';
    const dailyVal = daily ? Number(daily.value) : 8;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) { App.toast('请选择一个有效的考试日期'); return; }
    App.state.examDate = dateVal;
    App.state.settings.dailyQuestions = App.clamp(dailyVal || 8, 1, 50);
    Store.save();
    App.toast('✅ 设置已保存，今天是第 ' + Store.planDay() + ' / 7 天');
    App.render();
  };

  App.actions['settings-export'] = function () { App.exportData(); };

  App.actions['settings-import'] = function () {
    const input = document.getElementById('import-file');
    if (input) input.click();
  };

  App.actions['settings-reset'] = function () {
    App.modal({
      title: '清空全部学习数据？',
      sub: '包括进度、错题、笔记、成就与 XP。此操作不可撤销。',
      body: '<p class="small muted">如果只是想重新开始计划，其实没必要清空数据——改考试日期就可以。建议先导出存档。</p>',
      foot: '<button class="btn btn-ghost" data-modal-close="1">取消</button>' +
        '<button class="btn btn-ghost" id="reset-export">先导出</button>' +
        '<button class="btn btn-coral" id="reset-yes">确认清空</button>',
      onMount: function (modalEl, close) {
        modalEl.querySelector('#reset-export').addEventListener('click', function () { App.exportData(); });
        modalEl.querySelector('#reset-yes').addEventListener('click', function () {
          Store.reset();
          App.state = Store.state;
          App.session = null;
          close();
          App.toast('🧹 已清空，重新开始');
          App.go('#/today');
        });
      }
    });
  };

  // 导入文件监听（视图渲染后绑定）
  const originalSettings = App.views.settings;
  App.views.settings = function (view) {
    originalSettings(view);
    const input = document.getElementById('import-file');
    if (input) {
      input.addEventListener('change', function () {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          App.importData(String(reader.result || ''));
        };
        reader.readAsText(file);
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);

