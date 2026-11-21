/* 端到端流程测试：直接驱动页面里的 App */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const target = list.find((t) => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws fail')); });

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.rej(new Error(msg.error.message));
      else p.res(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push((d.exception && d.exception.description) || d.text);
    }
  };
  function send(method, params) {
    return new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, { res, rej });
      ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
    });
  }
  async function ev(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || ''));
    return r.result && r.result.value;
  }
  async function click(sel) {
    const res = await ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'missing'; el.click(); return 'ok';})()`);
    if (res !== 'ok') throw new Error('元素不存在：' + sel);
  }
  async function assert(cond, label) {
    if (!cond) throw new Error('断言失败：' + label);
    console.log('  ✔ ' + label);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await ev('App.Store.reset(); App.state = App.Store.state; App.session = null;');
  await send('Page.navigate', { url: 'http://127.0.0.1:8765/#/today' });
  await sleep(300);
  await send('Page.reload', { ignoreCache: true });
  await sleep(1200);

  // 选择题：正确路径
  console.log('\n[选择题]');
  await ev(`App.startQuiz({items:[{kind:'q', id:'q1-01'}], mode:'practice', title:'flow-choice'})`);
  await sleep(400);
  await click('.option[data-i="1"]');
  await click('[data-action="quiz-submit"]');
  await sleep(300);
  await assert(await ev(`App.session.feedback && App.session.feedback.correct === true`), '选中正确答案后 feedback.correct=true');
  await assert(await ev(`App.state.daily.questions === 1`), '每日答题计数 +1');
  await assert(await ev(`App.state.questions['q1-01'].srs && App.state.questions['q1-01'].srs.due > Date.now()`), '题目已排入未来复习');
  await click('[data-action="quiz-next"]');
  await sleep(300);
  await assert(await ev(`App.session.finished === true`), '最后一题后生成成绩单');
  await assert(await ev(`document.body.innerText.includes('全部答对')`), '成绩单显示全对提示');

  // 填空题：分数等价匹配
  console.log('\n[填空题]');
  await ev(`App.startQuiz({items:[{kind:'q', id:'q1-13'}], mode:'practice', title:'flow-fill'})`);
  await sleep(400);
  await ev(`(()=>{const i=document.getElementById('quiz-input'); i.value='0.1667'; i.dispatchEvent(new Event('input',{bubbles:true})); return true;})()`);
  await click('[data-action="quiz-submit"]');
  await sleep(300);
  await assert(await ev(`App.session.feedback && App.session.feedback.correct === true`), '0.1667 被 1/6 的答案接受');
  await click('[data-action="quiz-next"]');
  await sleep(200);

  // 计算题：自评流程
  console.log('\n[计算题]');
  await ev(`App.startQuiz({items:[{kind:'q', id:'q2-27'}], mode:'practice', title:'flow-calc'})`);
  await sleep(300);
  await click('[data-action="quiz-calc-reveal"]');
  await sleep(200);
  await assert(await ev(`App.session.feedback && App.session.feedback.correct === null`), '计算题先展示详解、不自动判分');
  await click('[data-action="quiz-rate"][data-g="good"]');
  await sleep(300);
  await assert(await ev(`App.session.finished === true && App.session.correct === 1`), '自评“做出来了”计为正确并结束');

  // 测验模式：延迟批改
  console.log('\n[测试模式]');
  await ev(`App.startQuiz({items:[{kind:'q', id:'q1-01'}, {kind:'q', id:'q2-02'}], mode:'test', title:'flow-test'})`);
  await sleep(300);
  await click('.option[data-i="0"]');
  await click('[data-action="quiz-submit"]');
  await sleep(250);
  await assert(await ev(`App.session.idx === 1 && App.session.feedback === null`), '测试模式答题后直接进入下一题、不展示对错');
  await click('.option[data-i="1"]');
  await click('[data-action="quiz-submit"]');
  await sleep(300);
  await assert(await ev(`App.session.finished === true`), '测试模式完成后生成成绩单');
  await assert(await ev(`App.state.flags.examDone === true`), '标记已完成模拟');
  await assert(await ev(`App.state.flags.examBest && App.state.flags.examBest.score === 1`), '记录模拟最好成绩');

  // 卡片复习与调度
  console.log('\n[卡片复习]');
  const beforeXp = await ev(`App.state.xp`);
  await ev(`App.startQuiz({items:[{kind:'card', id:'k1-4-1'}], mode:'review', title:'flow-card'})`);
  await sleep(300);
  await click('[data-action="quiz-card-reveal"]');
  await click('[data-action="quiz-card-rate"][data-g="good"]');
  await sleep(300);
  await assert(await ev(`App.state.cards['k1-4-1'].srs.interval >= 1`), '卡片评分后间隔 ≥1 天');
  await assert(await ev(`App.state.xp > ${beforeXp}`), '卡片评分增加 XP');

  // 到期队列
  console.log('\n[复习队列]');
  await ev(`(()=>{const st=App.state.questions['q1-01']; st.srs.due = Date.now()-1000; return App.dueItems().some(i=>i.kind==='q'&&i.id==='q1-01');})()`);
  const due = await ev(`App.dueItems().map(i=>i.id)`);
  await assert(due.includes('q1-01'), '把 due 改到过去后进入今日复习队列');

  // 成就 & 持久化
  console.log('\n[成就 / 存档]');
  const ach = await ev(`Object.keys(App.state.achievements)`);
  await assert(ach.includes('first-q'), '解锁“第一道题”成就');
  await assert(ach.includes('exam'), '解锁“全真模拟”成就');
  const persisted = await ev(`(()=>{try{const raw=JSON.parse(localStorage.getItem('probsprint.state.v1')); return !!(raw && raw.questions && raw.questions['q1-01']);}catch(e){return false;}})()`);
  await assert(persisted, 'localStorage 中已持久化答题状态');

  console.log('\n[运行时异常]');
  if (errors.length) {
    errors.forEach((e) => console.log('  ❌ ' + e));
    process.exitCode = 1;
  } else {
    console.log('  ✅ 无异常');
  }
  ws.close();
}

main().catch((err) => {
  console.error('\n测试失败：', err.message);
  process.exit(1);
});
