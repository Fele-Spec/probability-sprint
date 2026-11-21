/* 通过 CDP 驱动无头 Edge：截图 + 交互冒烟测试 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const target = list.find((t) => t.type === 'page');
  if (!target) throw new Error('没有可用的 page target');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = (e) => rej(new Error('WebSocket 连接失败'));
  });

  let id = 0;
  const pending = new Map();
  const errors = [];
  const consoleErrors = [];

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message));
      else res(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push((d.exception && d.exception.description) || d.text || 'unknown exception');
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value || a.description || '').join(' '));
    }
  };

  function send(method, params) {
    return new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, { res, rej });
      ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
    });
  }

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || ''));
    return r.result ? r.result.value : undefined;
  }

  async function click(selector) {
    const res = await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}); if(!el) return 'missing'; el.click(); return 'ok';})()`);
    if (res !== 'ok') throw new Error('找不到可点击元素：' + selector);
    return res;
  }

  async function shot(name, full = true) {
    await sleep(260);
    let clip;
    if (full) {
      const m = await send('Page.getLayoutMetrics');
      const cs = m.cssContentSize || m.contentSize;
      clip = { x: 0, y: 0, width: Math.ceil(Math.min(cs.width, 1600)), height: Math.ceil(Math.min(cs.height, 9000)), scale: 1 };
    }
    const r = await send('Page.captureScreenshot', Object.assign({ format: 'png', captureBeyondViewport: true }, clip ? { clip } : {}));
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
    console.log('  📸 ' + name + '.png');
  }

  async function go(hash, wait = 500) {
    await evaluate(`location.hash=${JSON.stringify(hash)}`);
    await sleep(wait);
  }

  async function check(expr, label) {
    const v = await evaluate(expr);
    if (!v) throw new Error('断言失败：' + label);
    console.log('  ✔ ' + label);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:8765/' });
  await sleep(1200);
  await evaluate(`try{App.Store.reset(); App.state = App.Store.state;}catch(e){}`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(4600);
  errors.length = 0;
  consoleErrors.length = 0;

  console.log('\n[桌面截图]');
  await shot('01-today');
  await go('#/learn');
  await shot('02-learn');
  await go('#/learn/1-4');
  await shot('03-section');
  await click('[data-action="learn-reveal"]');
  await shot('04-section-revealed', false);
  await click('[data-action="learn-tab"][data-tab="key"]');
  await shot('05-section-key', false);
  await click('[data-action="learn-tab"][data-tab="example"]');
  await shot('06-section-example', false);
  await click('[data-action="learn-tab"][data-tab="note"]');
  await shot('07-section-note', false);

  await go('#/practice');
  await shot('08-practice');
  await click('[data-action="practice-tab"][data-tab="drill"]');
  await shot('09-drill', false);
  await click('[data-action="practice-tab"][data-tab="wrong"]');
  await shot('10-wrong', false);
  await click('[data-action="practice-tab"][data-tab="exam"]');
  await shot('11-exam', false);

  await go('#/lab');
  await shot('12-lab-lln');
  await click('[data-action="lab-tab"][data-tab="galton"]');
  await sleep(300);
  await shot('13-lab-galton');
  await click('[data-action="lab-tab"][data-tab="dist"]');
  await shot('14-lab-dist');
  await click('[data-action="lab-tab"][data-tab="bayes"]');
  await shot('15-lab-bayes');

  await go('#/stats');
  await shot('16-stats');
  await go('#/method');
  await shot('17-method');
  await go('#/cheatsheet');
  await shot('18-cheatsheet');
  await go('#/settings');
  await shot('19-settings');

  console.log('\n[交互冒烟]');
  await go('#/practice');
  await click('[data-action="practice-tab"][data-tab="drill"]');
  await evaluate(`App.startQuiz({items:[{kind:'q', id:'q1-01'}], mode:'practice', title:'选择题演示'})`);
  await sleep(500);
  await shot('20-quiz-choice', false);
  await click('.option[data-i="1"]');
  await shot('21-quiz-selected', false);
  await click('[data-action="quiz-submit"]');
  await sleep(300);
  await shot('21-quiz-feedback', false);
  await check(`!!App.session.feedback && App.session.feedback.correct === true`, '选择题产生正确反馈');
  await check(`App.session.graded===1`, '选择题计入成绩');
  await click('[data-action="quiz-next"]');
  await sleep(400);
  await shot('23-quiz-summary', false);

  // 计算题流程
  await evaluate(`App.startQuiz({items:[{kind:'q', id:'q2-27'}], mode:'practice', title:'计算题测试'})`);
  await sleep(500);
  await click('[data-action="quiz-calc-reveal"]');
  await shot('22-quiz-calc', false);
  await check(`!!App.session.feedback && App.session.feedback.correct===null`, '计算题显示解答与自评');
  await click('[data-action="quiz-rate"][data-g="good"]');
  await sleep(400);
  await check(`App.session.finished===true`, '计算题自评后结束并生成成绩单');
  await shot('23b-calc-summary', false);

  // 卡片复习流程
  await evaluate(`App.startQuiz({items:[{kind:'card', id:'k1-4-1'}], mode:'review', title:'卡片测试'})`);
  await sleep(400);
  await shot('24-card-front', false);
  await click('[data-action="quiz-card-reveal"]');
  await shot('25-card-back', false);
  const before = await evaluate(`App.state.xp`);
  await click('[data-action="quiz-card-rate"][data-g="good"]');
  await sleep(400);
  const after = await evaluate(`App.state.xp`);
  await check(`App.session.finished===true && ${after} > ${before}`, '卡片评分后进入结算且 XP 增加');

  // 今日任务 / 首页刷新
  await go('#/today');
  await shot('26-today-after');
  await check(`App.state.xp > 0`, 'XP 已持久化');
  await check(`Object.keys(App.state.questions).length > 0`, '题目状态已记录');

  // 移动端
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await go('#/today', 700);
  await shot('27-mobile-today');
  await go('#/learn/1-4', 600);
  await shot('28-mobile-section');

  console.log('\n[错误检查]');
  if (errors.length) {
    console.log('  异常：');
    errors.forEach((e) => console.log('   ❌ ' + e));
  } else {
    console.log('  ✅ 无运行时异常');
  }
  if (consoleErrors.length) {
    console.log('  console.error：');
    consoleErrors.forEach((e) => console.log('   ❌ ' + e));
  } else {
    console.log('  ✅ 无 console.error');
  }

  ws.close();
  if (errors.length || consoleErrors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error('脚本失败：', err);
  process.exit(1);
});
