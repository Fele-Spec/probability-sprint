/* 实验室：4 个可交互的概率演示 */
(function (root) {
  const App = root.App;

  const C = {
    ink: '#1c2a25', muted: '#64736b', faint: '#93a099', line: '#e7dac4',
    accent: '#0e6b57', accentSoft: '#ddf3ea', coral: '#f26a4b', amber: '#e9a72c',
    blue: '#5e6fd0', surface: '#fffcf4', soft: '#f8f3e8'
  };

  const TABS = [
    { id: 'lln', label: '🪙 大数定律' },
    { id: 'galton', label: '🎯 高尔顿板' },
    { id: 'dist', label: '📈 分布探索' },
    { id: 'bayes', label: '🩺 贝叶斯更新' }
  ];

  function fit(canvas, aspect) {
    const parent = canvas.parentElement;
    const w = Math.max(260, parent.clientWidth - 24);
    const h = Math.round(w * (aspect || 0.52));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = '100%';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h, ctx: ctx };
  }

  function clearCanvas(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.surface;
    ctx.fillRect(0, 0, w, h);
  }

  function gridAxes(ctx, w, h, pad) {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
  }

  App.views.lab = function (view) {
    const tab = App.ui.lab || 'lln';
    const tabs = TABS.map(function (t) {
      return '<button class="lab-tab' + (t.id === tab ? ' active' : '') + '" data-action="lab-tab" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join('');

    view.innerHTML =
      '<div class="page-head"><div class="eyebrow">PLAYGROUND · 4 EXPERIMENTS</div><h1>实验室</h1>' +
      '<div class="sub">概率不是一堆公式。这里可以动手“抛”、看分布收敛、调节参数，把抽象概念变成直觉。</div></div>' +
      '<div class="lab-tabs">' + tabs + '</div>' +
      '<div id="lab-panel"></div>';

    const panel = view.querySelector('#lab-panel');
    if (tab === 'galton') renderGalton(panel);
    else if (tab === 'dist') renderDist(panel);
    else if (tab === 'bayes') renderBayes(panel);
    else renderLLN(panel);
  };

  App.actions['lab-tab'] = function (el) {
    App.ui.lab = el.getAttribute('data-tab');
    App.render();
  };

  /* ============ 1. 大数定律 ============ */
  function renderLLN(panel) {
    panel.innerHTML =
      '<div class="sim-shell">' +
        '<div class="sim-canvas-wrap"><canvas id="lln-canvas"></canvas></div>' +
        '<div class="sim-side">' +
          '<div class="card card-pad">' +
            '<div class="card-head"><div class="card-title">🪙 抛硬币</div><span class="card-sub">频率 → 概率</span></div>' +
            '<div class="coin-wrap"><div class="coin" id="lln-face">?</div>' +
              '<div class="small muted">理论正面概率 p = <b id="lln-p">0.50</b></div></div>' +
            '<div class="slider-row" style="margin-top:14px"><div class="sl"><span>调节 p</span><b id="lln-pv">0.50</b></div>' +
              '<input type="range" id="lln-slider" min="0.1" max="0.9" step="0.05" value="0.5"></div>' +
            '<div class="sim-readout" style="margin-top:14px">' +
              '<div class="box"><div class="v" id="lln-n">0</div><div class="l">抛掷次数</div></div>' +
              '<div class="box"><div class="v" id="lln-heads">0</div><div class="l">正面次数</div></div>' +
              '<div class="box"><div class="v" id="lln-freq">—</div><div class="l">正面频率</div></div>' +
              '<div class="box"><div class="v" id="lln-gap">—</div><div class="l">与 p 的偏差</div></div>' +
            '</div>' +
            '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px">' +
              '<button class="btn btn-sm btn-primary" id="lln-1">抛 1 次</button>' +
              '<button class="btn btn-sm btn-soft" id="lln-100">抛 100 次</button>' +
              '<button class="btn btn-sm btn-ghost" id="lln-auto">自动播放</button>' +
              '<button class="btn btn-sm btn-ghost" id="lln-reset">重置</button>' +
            '</div>' +
          '</div>' +
          '<div class="card card-pad sim-note">' +
            '<div class="card-title" style="font-size:13px">🔍 观察什么</div>' +
            '<p style="margin-top:6px">次数少时，频率可能离 p 很远；随着次数增加，曲线会越来越贴着 p 线。这就是频率的稳定性，也是大数定律的直观版本。</p>' +
            '<p style="margin-top:6px">把 p 调到 0.9 再试试：波动会变小还是变大？</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    const canvas = panel.querySelector('#lln-canvas');
    const faceEl = panel.querySelector('#lln-face');
    const state = {
      p: 0.5, n: 0, heads: 0, samples: [], timer: null, auto: false,
      lastFace: null
    };
    let dims = fit(canvas, 0.52);

    function updateReadout() {
      const freq = state.n ? state.heads / state.n : null;
      panel.querySelector('#lln-n').textContent = state.n;
      panel.querySelector('#lln-heads').textContent = state.heads;
      panel.querySelector('#lln-freq').textContent = freq == null ? '—' : freq.toFixed(3);
      panel.querySelector('#lln-gap').textContent = freq == null ? '—' : Math.abs(freq - state.p).toFixed(3);
      panel.querySelector('#lln-p').textContent = state.p.toFixed(2);
      panel.querySelector('#lln-pv').textContent = state.p.toFixed(2);
      if (state.lastFace != null) {
        faceEl.textContent = state.lastFace ? '正' : '反';
        faceEl.className = 'coin ' + (state.lastFace ? 'heads' : 'tails');
      }
    }

    function draw() {
      const { w, h, ctx } = dims;
      clearCanvas(ctx, w, h);
      const pad = { l: 44, r: 18, t: 22, b: 46 };
      const plotW = w - pad.l - pad.r;
      const plotH = h - pad.t - pad.b;
      const maxN = 2000;
      const xOf = function (n) { return pad.l + (n / maxN) * plotW; };
      const yOf = function (v) { return pad.t + (1 - v) * plotH; };

      // 网格
      ctx.strokeStyle = 'rgba(33,31,27,.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = yOf(i / 4);
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      }
      gridAxes(ctx, w, h, pad);

      // p 线
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = C.coral;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, yOf(state.p));
      ctx.lineTo(w - pad.r, yOf(state.p));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.coral;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText('p = ' + state.p.toFixed(2), w - pad.r - 62, yOf(state.p) - 6);

      // 频率曲线
      if (state.samples.length > 1) {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        state.samples.forEach(function (pt, i) {
          const x = xOf(pt.n), y = yOf(pt.f);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        const last = state.samples[state.samples.length - 1];
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.arc(xOf(last.n), yOf(last.f), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 轴标签
      ctx.fillStyle = C.muted;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      [0, 500, 1000, 1500, 2000].forEach(function (n) {
        ctx.fillText(n, xOf(n), h - 26);
      });
      ctx.textAlign = 'right';
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
        ctx.fillText(v.toFixed(2), pad.l - 8, yOf(v) + 4);
      });
      ctx.textAlign = 'left';
      ctx.fillStyle = C.faint;
      ctx.fillText('正面频率', pad.l + 6, pad.t + 12);
      ctx.textAlign = 'center';
      ctx.fillText('抛掷次数 n', pad.l + plotW / 2, h - 6);
      ctx.textAlign = 'left';
    }

    function flip(k) {
      for (let i = 0; i < k; i++) {
        if (state.n >= 2000) break;
        state.n += 1;
        const head = Math.random() < state.p;
        if (head) state.heads += 1;
        state.lastFace = head;
        if (state.n % 10 === 0 || state.n === 1) {
          state.samples.push({ n: state.n, f: state.heads / state.n });
        }
      }
      if (state.samples.length > 400) state.samples = state.samples.slice(-400);
      updateReadout();
      draw();
      if (state.n >= 2000) stopAuto();
    }

    function stopAuto() {
      state.auto = false;
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
      const btn = panel.querySelector('#lln-auto');
      if (btn) { btn.textContent = '自动播放'; btn.classList.remove('btn-coral'); }
    }

    panel.querySelector('#lln-1').addEventListener('click', function () { flip(1); });
    panel.querySelector('#lln-100').addEventListener('click', function () { flip(100); });
    panel.querySelector('#lln-auto').addEventListener('click', function () {
      if (state.auto) { stopAuto(); return; }
      state.auto = true;
      this.textContent = '暂停';
      this.classList.add('btn-coral');
      state.timer = setInterval(function () {
        if (state.n >= 2000) { stopAuto(); return; }
        flip(50);
      }, 160);
    });
    panel.querySelector('#lln-reset').addEventListener('click', function () {
      stopAuto();
      state.n = 0; state.heads = 0; state.samples = []; state.lastFace = null;
      faceEl.textContent = '?'; faceEl.className = 'coin';
      updateReadout(); draw();
    });
    panel.querySelector('#lln-slider').addEventListener('input', function () {
      state.p = Number(this.value);
      stopAuto();
      state.n = 0; state.heads = 0; state.samples = []; state.lastFace = null;
      faceEl.textContent = '?'; faceEl.className = 'coin';
      updateReadout(); draw();
    });

    const onResize = function () { dims = fit(canvas, 0.52); draw(); };
    window.addEventListener('resize', onResize);
    updateReadout();
    draw();

    App.labCleanup = function () {
      stopAuto();
      window.removeEventListener('resize', onResize);
    };
  }

  /* ============ 2. 高尔顿板 ============ */
  function renderGalton(panel) {
    panel.innerHTML =
      '<div class="sim-shell">' +
        '<div class="sim-canvas-wrap"><canvas id="galton-canvas"></canvas></div>' +
        '<div class="sim-side">' +
          '<div class="card card-pad">' +
            '<div class="card-head"><div class="card-title">🎯 高尔顿板</div><span class="card-sub">二项分布 → 正态</span></div>' +
            '<p class="small muted">小球每碰到一颗钉子，就等概率向左或向右。10 层之后，落入每个格子的次数服从 B(10, 0.5)。</p>' +
            '<div class="sim-readout" style="margin-top:12px">' +
              '<div class="box"><div class="v" id="g-total">0</div><div class="l">已投小球</div></div>' +
              '<div class="box"><div class="v" id="g-mode">—</div><div class="l">当前最多格子</div></div>' +
            '</div>' +
            '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px">' +
              '<button class="btn btn-sm btn-primary" id="g-1">投 1 个</button>' +
              '<button class="btn btn-sm btn-soft" id="g-100">投 100 个</button>' +
              '<button class="btn btn-sm btn-ghost" id="g-500">投 500 个</button>' +
              '<button class="btn btn-sm btn-ghost" id="g-reset">重置</button>' +
            '</div>' +
          '</div>' +
          '<div class="card card-pad sim-note">' +
            '<div class="card-title" style="font-size:13px">🔍 观察什么</div>' +
            '<p style="margin-top:6px">中间高、两边低。层数越多，轮廓越接近正态分布的钟形曲线——这就是“二项分布的正态近似”。</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    const canvas = panel.querySelector('#galton-canvas');
    const rows = 10;
    const counts = new Array(rows + 1).fill(0);
    const balls = [];
    let queue = 0, total = 0, raf = null, lastTs = 0;
    let dims = fit(canvas, 0.62);

    const binomial = [];
    let binomTotal = 0;
    for (let k = 0; k <= rows; k++) {
      let c = 1;
      for (let i = 0; i < k; i++) c = c * (rows - i) / (i + 1);
      binomial.push(c);
      binomTotal += c;
    }

    function layout() {
      const { w, h } = dims;
      const pad = { l: 16, r: 16, t: 26, b: 16 };
      const histH = Math.max(86, h * 0.27);
      const top = pad.t;
      const bottom = h - pad.b - histH;
      const spacing = (w - pad.l - pad.r) / (rows + 1);
      return { w, h, pad, histH, top, bottom, spacing, rowGap: (bottom - top) / rows, cx: w / 2 };
    }

    function makeBall() {
      const decisions = [];
      for (let i = 0; i < rows; i++) decisions.push(Math.random() < 0.5 ? 0 : 1);
      return { decisions: decisions, t: 0 };
    }

    function posAt(ball, step) {
      const L = layout();
      let rights = 0;
      for (let i = 0; i < step; i++) rights += ball.decisions[i];
      return {
        x: L.cx + (2 * rights - step) * L.spacing / 2,
        y: L.top + step * L.rowGap
      };
    }

    function draw() {
      const L = layout();
      const { w, h, ctx } = dims;
      clearCanvas(ctx, w, h);

      // 钉子
      ctx.fillStyle = '#c9c0b0';
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k <= r; k++) {
          const x = L.cx + (k - r / 2) * L.spacing;
          const y = L.top + r * L.rowGap;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 小球
      balls.forEach(function (ball) {
        const s = Math.min(rows, Math.floor(ball.t));
        const frac = Math.min(1, ball.t - s);
        const a = posAt(ball, s);
        const b = posAt(ball, Math.min(rows, s + 1));
        const x = a.x + (b.x - a.x) * frac;
        const y = a.y + (b.y - a.y) * frac;
        ctx.fillStyle = 'rgba(228,87,46,.85)';
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 直方图
      const histTop = h - L.histH - 4;
      const maxCount = Math.max(1, Math.max.apply(null, counts));
      const maxTheo = total * Math.max.apply(null, binomial) / binomTotal;
      const scale = Math.min(1, L.histH / Math.max(maxCount, maxTheo, 1)) * 0.9;
      const barW = L.spacing * 0.62;

      for (let k = 0; k <= rows; k++) {
        const x = L.cx + (k - rows / 2) * L.spacing;
        const bh = counts[k] * scale;
        if (bh > 0) {
          ctx.fillStyle = 'rgba(14,124,102,.75)';
          ctx.fillRect(x - barW / 2, h - 4 - bh, barW, bh);
        }
        // 理论值（空心点）
        const theo = total * binomial[k] / binomTotal;
        const ty = h - 4 - theo * scale;
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, ty, 2.4, 0, Math.PI * 2);
        ctx.stroke();
        // 刻度
        ctx.fillStyle = C.faint;
        ctx.font = '9.5px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        if (k % 2 === 0) ctx.fillText(String(k), x, h - 8);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = C.faint;
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText('每格小球数 · 黑点 = 理论值', L.pad.l, h - L.histH + 4);

      if (total === 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = C.faint;
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillText('点右侧「投 100 个」开始', L.cx, h - L.histH / 2 - 6);
        ctx.textAlign = 'left';
      }

      // 顶部说明
      ctx.fillStyle = C.muted;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText('10 层钉子，每层等概率左右：X ~ B(10, 0.5)', L.pad.l, 16);
    }

    function step(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(48, ts - lastTs);
      lastTs = ts;
      let spawned = 0;
      while (queue > 0 && spawned < 4 && balls.length < 140) {
        balls.push(makeBall());
        queue -= 1;
        spawned += 1;
      }
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        ball.t += dt * 0.011;
        if (ball.t >= rows) {
          let rights = 0;
          ball.decisions.forEach(function (d) { rights += d; });
          counts[rights] += 1;
          total += 1;
          balls.splice(i, 1);
        }
      }
      updateReadout();
      draw();
      if (balls.length || queue) {
        raf = requestAnimationFrame(step);
      } else {
        raf = null;
        lastTs = 0;
        updateReadout();
        draw();
      }
    }

    function kick() {
      if (raf == null) {
        lastTs = 0;
        raf = requestAnimationFrame(step);
      }
    }

    function updateReadout() {
      const t = panel.querySelector('#g-total');
      if (t) t.textContent = total;
      const m = panel.querySelector('#g-mode');
      if (m) {
        let best = 0;
        counts.forEach(function (c, i) { if (c > counts[best]) best = i; });
        m.textContent = total ? best + ' (' + counts[best] + ')' : '—';
      }
    }

    panel.querySelector('#g-1').addEventListener('click', function () { queue += 1; kick(); });
    panel.querySelector('#g-100').addEventListener('click', function () { queue += 100; kick(); });
    panel.querySelector('#g-500').addEventListener('click', function () { queue += 500; kick(); });
    panel.querySelector('#g-reset').addEventListener('click', function () {
      counts.fill(0); balls.length = 0; queue = 0; total = 0;
      updateReadout(); draw();
    });

    const onResize = function () { dims = fit(canvas, 0.62); draw(); };
    window.addEventListener('resize', onResize);
    updateReadout();
    draw();

    App.labCleanup = function () {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      window.removeEventListener('resize', onResize);
    };
  }

  /* ============ 3. 分布探索器 ============ */
  function renderDist(panel) {
    panel.innerHTML =
      '<div class="sim-shell">' +
        '<div class="sim-canvas-wrap"><canvas id="dist-canvas"></canvas></div>' +
        '<div class="sim-side">' +
          '<div class="card card-pad">' +
            '<div class="card-head"><div class="card-title">📈 分布探索器</div><span class="card-sub">拖一拖参数</span></div>' +
            '<select id="dist-select" style="width:100%;padding:8px 10px;border:1px solid var(--line-strong);border-radius:10px;background:var(--surface-2);margin-top:2px">' +
              '<option value="binom">二项分布 B(n, p)</option>' +
              '<option value="poisson">泊松分布 P(λ)</option>' +
              '<option value="uniform">均匀分布 U(0, b)</option>' +
              '<option value="expon">指数分布 E(λ)</option>' +
              '<option value="normal">正态分布 N(μ, σ²)</option>' +
            '</select>' +
            '<div id="dist-params" style="margin-top:14px;display:flex;flex-direction:column;gap:12px"></div>' +
            '<div class="slider-row" style="margin-top:14px"><div class="sl"><span>观察点 x₀</span><b id="dist-x0v">—</b></div>' +
              '<input type="range" id="dist-x0" min="0" max="1" step="0.01" value="0"></div>' +
            '<div class="sim-readout" style="margin-top:12px">' +
              '<div class="box"><div class="v" id="dist-p">—</div><div class="l">P(X ≤ x₀)</div></div>' +
              '<div class="box"><div class="v" id="dist-mean">—</div><div class="l">均值</div></div>' +
              '<div class="box"><div class="v" id="dist-var">—</div><div class="l">方差</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card card-pad sim-note">' +
            '<div class="card-title" style="font-size:13px">🔍 观察什么</div>' +
            '<p style="margin-top:6px" id="dist-note">切换分布，拖参数：曲线怎么变高、变矮、变胖、变瘦？阴影面积就是 P(X ≤ x₀)。</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    const canvas = panel.querySelector('#dist-canvas');
    const state = {
      dist: 'binom',
      params: { n: 10, p: 0.5, lambda: 3, b: 3, mu: 0, sigma: 1 },
      x0: 5
    };
    let dims = fit(canvas, 0.56);

    const SELECT = panel.querySelector('#dist-select');
    const X0 = panel.querySelector('#dist-x0');
    const X0V = panel.querySelector('#dist-x0v');
    const PARAMS = panel.querySelector('#dist-params');

    function sliderRow(id, label, min, max, step, value, suffix) {
      return '<div class="slider-row"><div class="sl"><span>' + label + '</span><b id="' + id + 'v">' + value + (suffix || '') + '</b></div>' +
        '<input type="range" id="' + id + '" data-param="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
    }

    function buildParams() {
      if (state.dist === 'binom') {
        PARAMS.innerHTML = sliderRow('n', '试验次数 n', 5, 30, 1, state.params.n) + sliderRow('p', '成功概率 p', 0.05, 0.95, 0.01, state.params.p);
      } else if (state.dist === 'poisson') {
        PARAMS.innerHTML = sliderRow('lambda', '参数 λ', 0.5, 12, 0.1, state.params.lambda);
      } else if (state.dist === 'uniform') {
        PARAMS.innerHTML = sliderRow('b', '右端点 b', 0.5, 6, 0.1, state.params.b);
      } else if (state.dist === 'expon') {
        PARAMS.innerHTML = sliderRow('lambda', '参数 λ', 0.2, 3, 0.05, state.params.lambda);
      } else {
        PARAMS.innerHTML = sliderRow('mu', '均值 μ', -3, 3, 0.1, state.params.mu) + sliderRow('sigma', '标准差 σ', 0.3, 3, 0.05, state.params.sigma);
      }
      PARAMS.querySelectorAll('[data-param]').forEach(function (input) {
        input.addEventListener('input', function () {
          const key = input.getAttribute('data-param');
          state.params[key] = Number(input.value);
          const v = PARAMS.querySelector('#' + key + 'v');
          if (v) v.textContent = input.value;
          syncX0(true);
          draw();
        });
      });
    }

    function xRange() {
      if (state.dist === 'binom') return { min: 0, max: state.params.n, discrete: true };
      if (state.dist === 'poisson') return { min: 0, max: Math.max(15, Math.ceil(state.params.lambda * 3)), discrete: true };
      if (state.dist === 'uniform') return { min: 0, max: state.params.b, discrete: false };
      if (state.dist === 'expon') return { min: 0, max: Math.max(3, 6 / state.params.lambda), discrete: false };
      return { min: state.params.mu - 3.4 * state.params.sigma, max: state.params.mu + 3.4 * state.params.sigma, discrete: false };
    }

    function syncX0(keep) {
      const r = xRange();
      X0.min = r.min; X0.max = r.max; X0.step = r.discrete ? 1 : (r.max - r.min) / 100;
      if (!keep || state.x0 < r.min || state.x0 > r.max) {
        state.x0 = r.discrete ? Math.round(r.max / 2) : (r.min + r.max) / 2;
      }
      X0.value = state.x0;
      X0V.textContent = Number(state.x0).toFixed(r.discrete ? 0 : 2);
    }

    function pmfData() {
      const P = state.params;
      if (state.dist === 'binom') {
        const n = Math.round(P.n), p = P.p;
        const out = [];
        for (let k = 0; k <= n; k++) {
          let c = 1;
          for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
          out.push({ x: k, y: c * Math.pow(p, k) * Math.pow(1 - p, n - k) });
        }
        return { type: 'discrete', points: out, mean: n * p, variance: n * p * (1 - p), label: 'B(' + n + ', ' + p.toFixed(2) + ')' };
      }
      if (state.dist === 'poisson') {
        const lam = P.lambda;
        const out = [];
        let fact = 1;
        for (let k = 0; k <= 40; k++) {
          if (k > 0) fact *= k;
          out.push({ x: k, y: Math.exp(-lam) * Math.pow(lam, k) / fact });
        }
        return { type: 'discrete', points: out, mean: lam, variance: lam, label: 'P(' + lam.toFixed(2) + ')' };
      }
      if (state.dist === 'uniform') {
        const b = Math.max(0.5, P.b);
        return {
          type: 'continuous', min: 0, max: b,
          pdf: function (x) { return x >= 0 && x <= b ? 1 / b : 0; },
          mean: b / 2, variance: b * b / 12, label: 'U(0, ' + b.toFixed(2) + ')'
        };
      }
      if (state.dist === 'expon') {
        const lam = P.lambda;
        return {
          type: 'continuous', min: 0, max: Math.max(3, 6 / lam),
          pdf: function (x) { return x >= 0 ? lam * Math.exp(-lam * x) : 0; },
          mean: 1 / lam, variance: 1 / (lam * lam), label: 'E(' + lam.toFixed(2) + ')'
        };
      }
      const mu = P.mu, sg = Math.max(0.3, P.sigma);
      return {
        type: 'continuous', min: mu - 3.4 * sg, max: mu + 3.4 * sg,
        pdf: function (x) { return Math.exp(-Math.pow(x - mu, 2) / (2 * sg * sg)) / (Math.sqrt(2 * Math.PI) * sg); },
        mean: mu, variance: sg * sg, label: 'N(' + mu.toFixed(2) + ', ' + (sg * sg).toFixed(2) + ')'
      };
    }

    function shadedProb(data) {
      if (data.type === 'discrete') {
        return data.points.reduce(function (sum, p) { return sum + (p.x <= state.x0 + 1e-9 ? p.y : 0); }, 0);
      }
      const a = data.min, b = Math.min(state.x0, data.max);
      if (b <= a) return 0;
      const steps = 240;
      let s = 0;
      const dx = (b - a) / steps;
      for (let i = 0; i < steps; i++) {
        s += (data.pdf(a + i * dx) + data.pdf(a + (i + 1) * dx)) / 2 * dx;
      }
      return s;
    }

    function draw() {
      const { w, h, ctx } = dims;
      clearCanvas(ctx, w, h);
      const data = pmfData();
      const pad = { l: 46, r: 18, t: 26, b: 36 };
      const plotW = w - pad.l - pad.r;
      const plotH = h - pad.t - pad.b;

      if (data.type === 'discrete') {
        const r = xRange();
        const points = data.points.filter(function (p) { return p.x <= r.max + 1e-9; });
        const maxY = Math.max.apply(null, points.map(function (p) { return p.y; })) || 1;
        const yMax = maxY * 1.18;
        const n = points.length;
        const slot = plotW / n;
        const xOf = function (k) { return pad.l + (k + 0.5) * slot; };
        const yOf = function (y) { return pad.t + plotH - (y / yMax) * plotH; };

        for (let i = 0; i <= 3; i++) {
          const y = pad.t + plotH * i / 3;
          ctx.strokeStyle = 'rgba(33,31,27,.06)';
          ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        }
        points.forEach(function (p) {
          const x = xOf(p.x), bh = (p.y / yMax) * plotH;
          ctx.fillStyle = p.x <= state.x0 + 1e-9 ? 'rgba(14,124,102,.82)' : 'rgba(14,124,102,.22)';
          const bw = Math.max(3, slot * 0.62);
          ctx.fillRect(x - bw / 2, pad.t + plotH - bh, bw, bh);
          if (n <= 16) {
            ctx.fillStyle = C.faint;
            ctx.font = '10px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(p.x), x, h - 14);
          }
        });
        ctx.strokeStyle = C.coral;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const xLine = xOf(state.x0) + slot / 2;
        ctx.moveTo(xLine, pad.t);
        ctx.lineTo(xLine, pad.t + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const a = data.min, b = data.max;
        const steps = 220;
        const yMax = (function () {
          let m = 0;
          for (let i = 0; i <= steps; i++) m = Math.max(m, data.pdf(a + (b - a) * i / steps));
          return m * 1.18 || 1;
        })();
        const xOf = function (x) { return pad.l + (x - a) / (b - a) * plotW; };
        const yOf = function (y) { return pad.t + plotH - (y / yMax) * plotH; };

        // 阴影
        ctx.beginPath();
        ctx.moveTo(xOf(a), pad.t + plotH);
        const xs = Math.min(b, Math.max(a, state.x0));
        const N = 160;
        for (let i = 0; i <= N; i++) {
          const x = a + (xs - a) * i / N;
          ctx.lineTo(xOf(x), yOf(data.pdf(x)));
        }
        ctx.lineTo(xOf(xs), pad.t + plotH);
        ctx.closePath();
        ctx.fillStyle = 'rgba(14,124,102,.16)';
        ctx.fill();

        // 曲线
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const x = a + (b - a) * i / steps;
          const px = xOf(x), py = yOf(data.pdf(x));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // x0 线
        ctx.strokeStyle = C.coral;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xOf(xs), pad.t);
        ctx.lineTo(xOf(xs), pad.t + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = C.faint;
        ctx.font = '10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        [a, (a + b) / 2, b].forEach(function (v) {
          ctx.fillText(v.toFixed(1), xOf(v), h - 14);
        });
      }

      gridAxes(ctx, w, h, pad);
      ctx.fillStyle = C.muted;
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(data.label, pad.l, 16);
      ctx.textAlign = 'right';
      ctx.fillText('P(X ≤ x₀) = ' + (shadedProb(data) * 100).toFixed(1) + '%', w - pad.r, 16);
      ctx.textAlign = 'left';

      panel.querySelector('#dist-p').textContent = (shadedProb(data) * 100).toFixed(1) + '%';
      panel.querySelector('#dist-mean').textContent = data.mean.toFixed(2);
      panel.querySelector('#dist-var').textContent = data.variance.toFixed(2);
      panel.querySelector('#dist-x0v').textContent = Number(state.x0).toFixed(data.type === 'discrete' ? 0 : 2);
    }

    function rebuild() {
      buildParams();
      syncX0(false);
      draw();
    }

    SELECT.addEventListener('change', function () {
      state.dist = SELECT.value;
      rebuild();
    });
    X0.addEventListener('input', function () {
      state.x0 = Number(X0.value);
      draw();
    });

    const onResize = function () { dims = fit(canvas, 0.56); draw(); };
    window.addEventListener('resize', onResize);
    rebuild();

    App.labCleanup = function () { window.removeEventListener('resize', onResize); };
  }

  /* ============ 4. 贝叶斯更新 ============ */
  function renderBayes(panel) {
    panel.innerHTML =
      '<div class="sim-shell">' +
        '<div class="sim-canvas-wrap" style="padding:20px">' +
          '<div id="bayes-visual"></div>' +
        '</div>' +
        '<div class="sim-side">' +
          '<div class="card card-pad">' +
            '<div class="card-head"><div class="card-title">🩺 检测阳性，真的病了吗？</div></div>' +
            '<p class="small muted">拖动参数，观察后验概率怎么被基础率“拽”回去。</p>' +
            '<div class="slider-row" style="margin-top:14px"><div class="sl"><span>患病率（基础率）</span><b id="b-prior-v">1.0%</b></div>' +
              '<input type="range" id="b-prior" min="0.1" max="20" step="0.1" value="1"></div>' +
            '<div class="slider-row"><div class="sl"><span>灵敏度 P(+|病)</span><b id="b-sens-v">99%</b></div>' +
              '<input type="range" id="b-sens" min="50" max="100" step="0.5" value="99"></div>' +
            '<div class="slider-row"><div class="sl"><span>特异度 P(−|无病)</span><b id="b-spec-v">95%</b></div>' +
              '<input type="range" id="b-spec" min="50" max="100" step="0.5" value="95"></div>' +
            '<div class="chip-row" style="margin-top:10px">' +
              '<button class="chip" data-preset="1">罕见病 1%</button>' +
              '<button class="chip" data-preset="5">常见病 5%</button>' +
              '<button class="chip" data-preset="10">高发 10%</button>' +
            '</div>' +
            '<div class="sim-readout" style="margin-top:14px">' +
              '<div class="box"><div class="v" id="b-post">—</div><div class="l">P(病 | 阳性)</div></div>' +
              '<div class="box"><div class="v" id="b-ratio">—</div><div class="l">真阳性 / 假阳性</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card card-pad sim-note">' +
            '<div class="card-title" style="font-size:13px">🔍 反直觉点</div>' +
            '<p style="margin-top:6px">检测很准，但病太罕见时，健康人数量巨大，假阳性会淹没真阳性。所以阳性预测值 = 真阳性 / 全部阳性。</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    const prior = panel.querySelector('#b-prior');
    const sens = panel.querySelector('#b-sens');
    const spec = panel.querySelector('#b-spec');
    const visual = panel.querySelector('#bayes-visual');

    function calc() {
      const prev = Number(prior.value) / 100;
      const se = Number(sens.value) / 100;
      const sp = Number(spec.value) / 100;
      const tp = prev * se;
      const fp = (1 - prev) * (1 - sp);
      const fn = prev * (1 - se);
      const tn = (1 - prev) * sp;
      const post = tp / (tp + fp);
      return { prev: prev, se: se, sp: sp, tp: tp, fp: fp, fn: fn, tn: tn, post: post };
    }

    function draw() {
      const r = calc();
      panel.querySelector('#b-prior-v').textContent = (r.prev * 100).toFixed(1) + '%';
      panel.querySelector('#b-sens-v').textContent = (r.se * 100).toFixed(0) + '%';
      panel.querySelector('#b-spec-v').textContent = (r.sp * 100).toFixed(0) + '%';
      panel.querySelector('#b-post').textContent = (r.post * 100).toFixed(1) + '%';
      panel.querySelector('#b-ratio').textContent = (r.tp / Math.max(1e-9, r.fp)).toFixed(1) + ' : 1';

      const N = 10000;
      const tp = r.tp * N, fp = r.fp * N, fn = r.fn * N, tn = r.tn * N;
      const positive = tp + fp;

      visual.innerHTML =
        '<div class="bayes-block">' +
          '<div class="card-title" style="font-size:14px;margin-bottom:6px">10,000 人检测结果</div>' +
          '<div class="bayes-bar" style="height:34px;display:flex">' +
            '<div class="tp" style="width:' + (tp / N * 100) + '%"></div>' +
            '<div class="fn" style="width:' + (fn / N * 100) + '%"></div>' +
            '<div class="fp" style="width:' + (fp / N * 100) + '%"></div>' +
            '<div class="tn" style="width:' + (tn / N * 100) + '%"></div>' +
          '</div>' +
          '<div class="legend" style="margin-top:6px">' +
            '<span><i style="background:var(--accent)"></i>真阳性 ' + Math.round(tp) + '</span>' +
            '<span><i style="background:#b9892f"></i>假阴性 ' + Math.round(fn) + '</span>' +
            '<span><i style="background:var(--coral)"></i>假阳性 ' + Math.round(fp) + '</span>' +
            '<span><i style="background:#cfc6b4"></i>真阴性 ' + Math.round(tn) + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="bayes-block" style="margin-top:22px">' +
          '<div class="bayes-bar-label"><span>阳性人群构成（共 ' + Math.round(positive) + ' 人）</span><span></span></div>' +
          '<div class="bayes-bar" style="height:26px">' +
            '<div class="tp" style="width:' + (tp / Math.max(1, positive) * 100) + '%"></div>' +
            '<div class="fp" style="width:' + (fp / Math.max(1, positive) * 100) + '%"></div>' +
          '</div>' +
          '<div class="legend" style="margin-top:6px"><span><i style="background:var(--accent)"></i>真阳性</span><span><i style="background:var(--coral)"></i>假阳性</span></div>' +
        '</div>' +

        '<div class="bayes-block" style="margin-top:22px">' +
          '<div class="bayes-bar-label"><span>先验概率 P(病)</span><span>' + (r.prev * 100).toFixed(1) + '%</span></div>' +
          '<div class="bayes-bar" style="height:20px"><div class="tp" style="width:' + (r.prev * 100) + '%"></div></div>' +
          '<div class="bayes-bar-label" style="margin-top:8px"><span>后验概率 P(病 | 阳性)</span><span>' + (r.post * 100).toFixed(1) + '%</span></div>' +
          '<div class="bayes-bar" style="height:20px"><div class="tp" style="width:' + (r.post * 100) + '%"></div><div class="fp" style="width:' + ((1 - r.post) * 100) + '%"></div></div>' +
          '<div class="tiny faint" style="margin-top:8px">阳性里真患病比例 = 真阳性 / (真阳性 + 假阳性)。</div>' +
        '</div>';
    }

    prior.addEventListener('input', draw);
    sens.addEventListener('input', draw);
    spec.addEventListener('input', draw);
    panel.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const val = Number(btn.getAttribute('data-preset'));
        prior.value = val;
        sens.value = 99;
        spec.value = 95;
        draw();
      });
    });

    draw();
    App.labCleanup = null;
  }
})(typeof window !== 'undefined' ? window : globalThis);
