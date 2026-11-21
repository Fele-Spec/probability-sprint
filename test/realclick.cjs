/* 真实鼠标坐标点击：验证没有透明层挡住交互 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const page = list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws fail')); });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push((d.exception && d.exception.description) || d.text);
    }
  };
  const send = (method, params) => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
  });
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result && r.result.value;
  };
  const rect = async (selector) => ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};})()`);
  const scrollTo = async (selector) => {
    await ev(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    await sleep(180);
    return rect(selector);
  };
  const move = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
  const press = (x, y) => send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  const release = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  const assert = (v, label) => { if (!v) throw new Error('断言失败：' + label); console.log('  ✔ ' + label); };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:8765/#/today' });
  await sleep(1200);
  await ev(`try{App.Store.reset(); App.state = App.Store.state;}catch(e){}`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(1200);

  console.log('\n[真实鼠标：Hero 主按钮]');
  const startBtn = await rect('.hero2 [data-action="today-start"]');
  assert(startBtn && startBtn.w > 0, '拿到按钮坐标');
  await move(startBtn.x, startBtn.y);
  await press(startBtn.x, startBtn.y);
  await sleep(60);
  assert(await ev(`!!document.querySelector('.hero2 [data-action="today-start"] .ripple')`), '按下时出现涟漪');
  await release(startBtn.x, startBtn.y);
  await sleep(500);
  assert(await ev(`location.hash.startsWith('#/learn/') || location.hash === '#/quiz'`), '真实点击触发开始逻辑');

  console.log('\n[真实鼠标：星图悬停]');
  await ev(`location.hash = '#/today'`);
  await sleep(500);
  const node = await scrollTo('.map-node[data-sec="1-1"]');
  assert(node && node.w > 0, '拿到星星坐标');
  await move(node.x, node.y);
  await sleep(160);
  assert(await ev(`document.querySelector('#map-tip').classList.contains('show')`), '悬停显示知识卡');
  const tip = await ev(`document.querySelector('#map-tip').textContent`);
  assert(/随机试验/.test(tip), '提示文字正确：' + tip);

  console.log('\n[真实鼠标：整卡点击]');
  const card = await scrollTo('.quest-card.learn');
  await move(card.x, card.y);
  await press(card.x, card.y);
  await release(card.x, card.y);
  await sleep(500);
  assert(await ev(`location.hash.startsWith('#/learn/')`), '点击任务卡进入小节');

  console.log('\n[真实鼠标：选择题]');
  await ev(`location.hash = '#/practice'`);
  await sleep(350);
  await ev(`App.startQuiz({items:[{kind:'q', id:'q1-01'}], mode:'practice', title:'真实点击测试'})`);
  await sleep(450);
  const opt = await scrollTo('.option[data-i="1"]');
  await move(opt.x, opt.y);
  await press(opt.x, opt.y);
  await release(opt.x, opt.y);
  await sleep(250);
  assert(await ev(`App.session && App.session.sel === 1`), '真实点击选中选项 B');
  const submit = await scrollTo('[data-action="quiz-submit"]');
  await move(submit.x, submit.y);
  await press(submit.x, submit.y);
  await release(submit.x, submit.y);
  await sleep(300);
  assert(await ev(`App.session && App.session.feedback && App.session.feedback.correct === true`), '真实点击提交并判对');

  console.log('\n[运行时异常]');
  if (errors.length) {
    errors.forEach((e) => console.log('  ❌ ' + e));
    process.exitCode = 1;
  } else console.log('  ✅ 无异常');
  ws.close();
}

main().catch((e) => { console.error('\n失败：' + e.message); process.exit(1); });
