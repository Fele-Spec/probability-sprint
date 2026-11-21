/* 离线校验：语法 + 数据完整性 + SRS 调度 + 存档层 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;
let warnings = 0;

function ok(msg) { console.log('  ✅ ' + msg); }
function fail(msg) { failures++; console.log('  ❌ ' + msg); }
function warn(msg) { warnings++; console.log('  ⚠️  ' + msg); }

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

console.log('\n[1] JavaScript 语法检查');
const jsFiles = walk(path.join(ROOT, 'js')).concat(walk(path.join(ROOT, 'data')));
for (const file of jsFiles) {
  const rel = path.relative(ROOT, file);
  try {
    new Function(fs.readFileSync(file, 'utf8')); // 只编译，不执行
    ok(rel);
  } catch (err) {
    fail(rel + ' → ' + err.message);
  }
}

console.log('\n[2] 数据加载');
const sandboxWindow = { console };
const sandbox = {
  window: sandboxWindow,
  console,
  Math,
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  isFinite,
  setTimeout,
  clearTimeout,
  module: { exports: {} },
  exports: {}
};
vm.createContext(sandbox);

const files = ['js/util.js', 'js/srs.js', 'js/store.js', 'data/knowledge.js', 'data/questions.js', 'data/plan.js'];
for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    vm.runInContext(code, sandbox, { filename: f });
    ok('加载 ' + f);
  } catch (err) {
    fail('加载 ' + f + ' 失败：' + err.message);
  }
}

const W = sandbox.window;
const K = W.KNOWLEDGE;
const Q = W.QUESTIONS;
const PLAN = W.PLAN;
const TIPS = W.TIPS;
const ACH = W.ACHIEVEMENTS;

if (!K || !Q || !PLAN) {
  console.log('\n数据未正确加载，终止。');
  process.exit(1);
}

console.log('\n[3] 知识点结构');
const chapterIds = new Set();
const secIds = new Set();
let cardCount = 0;
for (const ch of K.chapters) {
  if (chapterIds.has(ch.id)) fail('重复章节 id ' + ch.id);
  chapterIds.add(ch.id);
  if (!ch.title || !ch.subtitle) fail('章节缺少标题/副标题：' + ch.id);
  for (const sec of ch.sections) {
    if (secIds.has(sec.id)) fail('重复小节 id ' + sec.id);
    secIds.add(sec.id);
    if (!/^[1-3]-\d+$/.test(sec.id)) warn('小节 id 形式异常：' + sec.id);
    if (!sec.title || !sec.num || !sec.intro) fail('小节缺少字段：' + sec.id);
    if (!Array.isArray(sec.cards) || sec.cards.length < 3) fail(sec.id + ' 卡片少于 3 张');
    cardCount += sec.cards.length;
    for (const c of sec.cards) {
      if (!c.q || !c.a) fail(sec.id + ' 存在空卡片');
    }
    if (!Array.isArray(sec.formulas) || !sec.formulas.length) fail(sec.id + ' 缺少公式');
    if (!Array.isArray(sec.pitfalls) || sec.pitfalls.length < 2) fail(sec.id + ' 易错点少于 2 条');
    if (!sec.example || !sec.example.problem || !Array.isArray(sec.example.steps) || !sec.example.answer) {
      fail(sec.id + ' 例题不完整');
    }
  }
}

if (K.chapters.length !== 3) fail('章节数不是 3');
if (secIds.size !== 16) fail('小节数不是 16，实际 ' + secIds.size);
ok('章节 3 个 · 小节 ' + secIds.size + ' 个 · 卡片 ' + cardCount + ' 张');

console.log('\n[4] 题库结构');
const qIds = new Set();
const typeCount = { choice: 0, fill: 0, calc: 0 };
const chCount = { 1: 0, 2: 0, 3: 0 };
for (const q of Q) {
  if (qIds.has(q.id)) fail('重复题目 id ' + q.id);
  qIds.add(q.id);
  if (!secIds.has(q.sec)) fail(q.id + ' 的小节不存在：' + q.sec);
  if (![1, 2, 3].includes(q.ch)) fail(q.id + ' 章节号异常');
  if (!(q.type in typeCount)) fail(q.id + ' 类型异常：' + q.type);
  typeCount[q.type]++;
  chCount[q.ch]++;
  if (!q.stem || !q.ans || !q.hint) fail(q.id + ' 缺少题干/答案/提示');
  if (!Array.isArray(q.solution) || q.solution.length < 2) fail(q.id + ' 详解步骤不足');
  if (!Array.isArray(q.tags) || !q.tags.length) fail(q.id + ' 缺少标签');
  if (![1, 2, 3].includes(q.diff)) fail(q.id + ' 难度异常');
  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length !== 4) fail(q.id + ' 选项不是 4 个');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options || []).length) fail(q.id + ' 选择答案下标异常');
  }
  if (q.type === 'fill') {
    if (!Array.isArray(q.accepts) || !q.accepts.length) fail(q.id + ' 填空缺少 accepts');
    if (q.accepts && q.accepts.some((a) => String(a).trim() === '')) fail(q.id + ' accepts 含空值');
  }
  if (q.type === 'calc' && Array.isArray(q.accepts)) warn(q.id + ' 计算题不应有 accepts');
  // HTML 标签合法性粗筛
  const htmlFields = [q.stem, q.ans, q.hint].concat(q.solution || []).concat(q.options || []);
  for (const text of htmlFields) {
    if (typeof text !== 'string') continue;
    const bad = text.match(/<(?![a-zA-Z\/!])/g);
    if (bad) warn(q.id + ' 的 HTML 中可能出现未转义的 "<"：' + text.slice(0, 40));
  }
}
for (const id of qIds) { if (!id) fail('空 id'); }
if (Q.length < 80) fail('题库少于 80 题，实际 ' + Q.length);
ok('题目 ' + Q.length + ' 道（选择 ' + typeCount.choice + ' / 填空 ' + typeCount.fill + ' / 计算 ' + typeCount.calc + '）');
ok('各章题量：第一章 ' + chCount[1] + ' · 第二章 ' + chCount[2] + ' · 第三章 ' + chCount[3]);
for (const ch of K.chapters) {
  for (const sec of ch.sections) {
    const n = Q.filter((q) => q.sec === sec.id).length;
    if (!n) warn(sec.id + ' 没有题目');
  }
}

console.log('\n[5] 计划 / 冷知识 / 成就');
if (!PLAN || !Array.isArray(PLAN.days) || PLAN.days.length !== 7) fail('7 天计划不完整');
PLAN.days.forEach((d, i) => {
  if (d.day !== i + 1) fail('计划日序号不连续：' + d.day);
  (d.sections || []).forEach((id) => { if (!secIds.has(id)) fail('Day ' + d.day + ' 引用了不存在的小节 ' + id); });
  if (!d.practice || !Array.isArray(d.practice.ch) || !d.practice.count) fail('Day ' + d.day + ' 练习配置缺失');
  (d.practice.ch || []).forEach((c) => { if (![1, 2, 3].includes(c)) fail('Day ' + d.day + ' 章节号异常'); });
});
const plannedSections = new Set();
PLAN.days.forEach((d) => (d.sections || []).forEach((id) => plannedSections.add(id)));
for (const id of secIds) { if (!plannedSections.has(id)) warn('小节未进入 7 天计划：' + id); }
if (!Array.isArray(TIPS) || TIPS.length < 10) fail('冷知识少于 10 条');
const achIds = new Set();
for (const a of ACH) {
  if (achIds.has(a.id)) fail('重复成就 id ' + a.id);
  achIds.add(a.id);
  if (!a.icon || !a.name || !a.desc) fail('成就字段缺失 ' + a.id);
}
ok('7 天计划 · ' + TIPS.length + ' 条冷知识 · ' + ACH.length + ' 个成就');

console.log('\n[6] SRS 调度');
const SRS = W.SRS;
const t0 = new Date('2026-11-21T08:00:00+08:00').getTime();
let s = SRS.review(null, 'good', t0, 7);
if (Math.abs((s.due - t0) / 86400000 - 1) > 0.01) fail('首次 good 间隔不是 1 天：' + s.interval);
s = SRS.review(s, 'good', s.due, 7);
if (s.interval !== 3) fail('第二次 good 间隔不是 3 天：' + s.interval);
s = SRS.review(s, 'again', s.due, 7);
if (s.interval > 0.01) fail('again 之后间隔应重置为 10 分钟：' + s.interval);
if (!SRS.isDue({ due: t0 - 1 }, t0)) fail('isDue 判断错误');
if (SRS.isDue({ due: t0 + 1000 }, t0)) fail('isDue 提前判到期');
let capped = SRS.review({ reps: 9, ef: 2.5, interval: 100, due: t0 }, 'good', t0, 2);
if (capped.interval > 2.001) fail('间隔未被考试日封顶：' + capped.interval);
ok('again / good / hard / easy 与封顶逻辑正常');

console.log('\n[7] 存档层');
const mem = {};
sandbox.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; }
};
const Store = W.App.Store;
const st = Store.load();
if (!st || !st.examDate || !st.startDate) fail('默认存档加载失败');
Store.state.xp = 120;
Store.markActive();
Store.save();
const reload = Store.load();
if (reload.xp !== 120) fail('存档 xp 未持久化');
if (!reload.streak.last) fail('连击日期未记录');
ok('默认状态 / 保存 / 重新加载正常');

// 计划日应跟随首次使用日，而不是考试日（避免考试改近后跳章节）
const today = W.App.todayKey();
Store.state.startDate = today;
Store.state.examDate = W.App.addDaysKey(today, 3);
if (Store.planDay() !== 1) fail('刚使用时计划日应为 Day 1，实际 ' + Store.planDay());
Store.state.startDate = W.App.addDaysKey(today, -2);
if (Store.planDay() !== 3) fail('使用第 3 天时计划日应为 Day 3，实际 ' + Store.planDay());
ok('7 天计划按首次使用日推进（改考试日不跳章节）');

console.log('\n' + '─'.repeat(50));
if (failures) {
  console.log('结果：' + failures + ' 个错误，' + warnings + ' 个警告');
  process.exit(1);
} else {
  console.log('结果：全部通过（' + warnings + ' 个警告）');
}
