/* 今日页新交互冒烟：星图、抽签、开始按钮、吉祥物 */
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
  const click = async (expr) => {
    const ok = await ev(`(()=>{const el=${expr}; if(!el) return 'missing'; el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); return 'ok';})()`);
    if (ok !== 'ok') throw new Error('找不到元素：' + expr);
  };
  const assert = (v, label) => {
    if (!v) throw new Error('断言失败：' + label);
    console.log('  ✔ ' + label);
  };

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

  console.log('\n[今日页结构]');
  assert(await ev(`document.body.innerText.includes('今日三件事')`), '出现“今日三件事”标题');
  assert(await ev(`!!document.querySelector('.hero2') && !!document.querySelector('.starmap-card')`), 'Hero 与星图存在');
  assert(await ev(`!!document.querySelector('.mascot-dock .mascot-btn')`), '骰仔助手存在');
  assert(await ev(`document.querySelectorAll('.map-node').length === 16`), '星图 16 个节点');
  assert(await ev(`getComputedStyle(document.querySelector('.quest-card')).cursor === 'pointer'`), '任务卡显示可点击光标');

  console.log('\n[点击反馈]');
  await ev(`(()=>{const btn=document.querySelector('.hero2 .btn-sun'); const r=btn.getBoundingClientRect(); btn.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,cancelable:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2})); return true;})()`);
  await sleep(80);
  assert(await ev(`!!document.querySelector('.hero2 .btn-sun .ripple')`), '按钮点击产生涟漪');
  await ev(`(()=>{const n=document.querySelector('.map-node[data-sec="1-2"]'); const r=n.getBoundingClientRect(); n.dispatchEvent(new MouseEvent('pointermove',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2})); return true;})()`);
  await sleep(120);
  assert(await ev(`document.querySelector('#map-tip') && document.querySelector('#map-tip').classList.contains('show')`), '星图悬停出现提示');
  assert(await ev(`document.querySelector('#map-tip').textContent.includes('样本空间')`), '悬停提示显示知识点名称');

  console.log('\n[整卡点击]');
  await ev(`document.querySelector('.quest-card.learn').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))`);
  await sleep(500);
  assert(await ev(`location.hash.startsWith('#/learn/')`), '点击学习任务卡进入小节');
  await ev(`location.hash = '#/today'`);
  await sleep(400);

  console.log('\n[星图跳转]');
  await click(`document.querySelector('.map-node[data-sec="1-1"]')`);
  await sleep(500);
  assert(await ev(`location.hash === '#/learn/1-1'`), '点击星图节点进入 1-1');
  assert(await ev(`App.views && document.body.innerText.includes('随机试验与样本空间')`), '小节页渲染正常');

  await ev(`location.hash = '#/today'`);
  await sleep(500);

  console.log('\n[每日一签]');
  const first = await ev(`document.querySelector('.fortune-text').textContent`);
  await click(`document.querySelector('[data-action="today-fortune"]')`);
  await sleep(400);
  const second = await ev(`document.querySelector('.fortune-text').textContent`);
  assert(first !== second, '换签后文字变化');

  console.log('\n[Hero 开始]');
  await ev(`location.hash = '#/today'`);
  await sleep(400);
  await click(`document.querySelector('[data-action="today-start"]')`);
  await sleep(500);
  assert(await ev(`location.hash.startsWith('#/learn/')`), '开始今天进入某个小节');

  console.log('\n[移动端 Tab]');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:8765/#/learn/1-4' });
  await sleep(900);
  const tabInfo = await ev(`(()=>{const tabs=[...document.querySelectorAll('.learn-tab')]; return {count:tabs.length, rows:new Set(tabs.map(t=>Math.round(t.getBoundingClientRect().top))).size, visible:tabs.every(t=>t.getBoundingClientRect().right <= innerWidth+1)};})()`);
  console.log('  tab info:', JSON.stringify(tabInfo));
  assert(tabInfo.count === 4 && tabInfo.rows === 2 && tabInfo.visible, '4 个学习 Tab 在移动端排成 2 行且不截断');

  console.log('\n[运行时异常]');
  if (errors.length) {
    errors.forEach((e) => console.log('  ❌ ' + e));
    process.exitCode = 1;
  } else {
    console.log('  ✅ 无异常');
  }
  ws.close();
}

main().catch((e) => { console.error('\n失败：' + e.message); process.exit(1); });
