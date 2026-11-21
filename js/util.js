/* 通用工具：DOM、日期、答案归一化、随机、格式化 */
(function (root) {
  const App = (root.App = root.App || {});
  const DAY = 86400000;

  // 视图/动作命名空间必须最先初始化：views 文件在 app.js 之前加载
  App.views = App.views || {};
  App.actions = App.actions || {};
  App.ui = App.ui || {};

  App.DAY = DAY;

  App.$ = function (sel, scope) { return (scope || document).querySelector(sel); };
  App.$$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  App.esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  App.clamp = function (n, lo, hi) { return Math.min(hi, Math.max(lo, n)); };

  App.pad2 = function (n) { return String(n).padStart(2, '0'); };

  /* 本地日期键 YYYY-MM-DD，避免 toISOString 的 UTC 偏移问题 */
  App.dateKey = function (date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + App.pad2(d.getMonth() + 1) + '-' + App.pad2(d.getDate());
  };

  App.todayKey = function () { return App.dateKey(new Date()); };

  App.keyToDate = function (key) {
    const parts = String(key || '').split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  };

  App.addDaysKey = function (key, delta) {
    const d = App.keyToDate(key);
    d.setDate(d.getDate() + delta);
    return App.dateKey(d);
  };

  App.diffDays = function (fromKey, toKey) {
    const a = App.keyToDate(fromKey).getTime();
    const b = App.keyToDate(toKey).getTime();
    return Math.round((b - a) / DAY);
  };

  App.fmtClock = function (seconds) {
    const s = Math.max(0, Math.round(seconds));
    const m = Math.floor(s / 60);
    return App.pad2(m) + ':' + App.pad2(s % 60);
  };

  App.fmtPct = function (value, digits) {
    if (!isFinite(value)) return '—';
    return (value * 100).toFixed(digits == null ? 0 : digits) + '%';
  };

  App.fmtNum = function (value, digits) {
    if (!isFinite(value)) return '—';
    const v = Number(value);
    if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString('zh-CN');
    return parseFloat(v.toFixed(digits == null ? 3 : digits)).toString();
  };

  App.shuffle = function (arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  };

  App.sample = function (arr, n) {
    return App.shuffle(arr).slice(0, Math.max(0, n));
  };

  App.uniq = function (arr) { return Array.from(new Set(arr)); };

  App.debounce = function (fn, wait) {
    let t = null;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  };

  /* ---------- 答案匹配 ---------- */

  // 全角转半角、符号归一、去空白
  App.normAnswer = function (input) {
    return String(input == null ? '' : input)
      .replace(/[\uFF01-\uFF5E]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
      })
      .replace(/\u3000/g, ' ')
      .replace(/[−–—]/g, '-')
      .replace(/[×·]/g, '*')
      .replace(/[，,]/g, ',')
      .replace(/[％]/g, '%')
      .replace(/\s+/g, '')
      .replace(/[{}]/g, '')
      .toLowerCase();
  };

  App.parseNumeric = function (text) {
    let s = App.normAnswer(text);
    if (!s) return null;
    if (s.endsWith('%')) {
      const p = parseFloat(s.slice(0, -1));
      return isFinite(p) ? p / 100 : null;
    }
    if (/^[-+]?\d+(\.\d+)?\/[-+]?\d+(\.\d+)?$/.test(s)) {
      const parts = s.split('/');
      const a = parseFloat(parts[0]), b = parseFloat(parts[1]);
      return b !== 0 ? a / b : null;
    }
    if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/.test(s)) {
      const n = Number(s);
      return isFinite(n) ? n : null;
    }
    return null;
  };

  App.answersMatch = function (accepts, input) {
    if (!Array.isArray(accepts) || !accepts.length) return false;
    const got = App.normAnswer(input);
    if (!got) return false;
    for (let i = 0; i < accepts.length; i++) {
      const want = App.normAnswer(accepts[i]);
      if (!want) continue;
      if (got === want) return true;
      const g = App.parseNumeric(got);
      const w = App.parseNumeric(want);
      if (g != null && w != null) {
        if (Math.abs(g - w) <= Math.max(1e-4, Math.abs(w) * 0.002)) return true;
      }
    }
    return false;
  };

  App.truncate = function (text, n) {
    const clean = String(text == null ? '' : text).replace(/<[^>]+>/g, '');
    return clean.length > n ? clean.slice(0, n) + '…' : clean;
  };

  App.uid = function (prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  /* 简易并发：数字缩写 */
  App.shortNum = function (n) {
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    return String(n);
  };
})(typeof window !== 'undefined' ? window : globalThis);
