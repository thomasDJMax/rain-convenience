import fs from 'fs';
const PORT = process.env.CDP_PORT || 9333;
const BASE = `http://127.0.0.1:${PORT}`;
const target = await (await fetch(`${BASE}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 1; const pending = new Map(); const logs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); return; }
  if (m.method === 'Runtime.exceptionThrown') logs.push('[exception] ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled') logs.push('[console] ' + m.params.args.map(a => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => { const i = id++; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((res, rej) => pending.set(i, { resolve: res, reject: rej })); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8137/' });
for (let i = 0; i < 50; i++) {
  await sleep(300);
  if (await ev('!!(window.__RAIN__ && window.__RAIN__.ready)')) break;
}
const before = await ev(`(() => { const R=window.__RAIN__; return {cam:R.camera.position.toArray(), tgt:R.controls.target.toArray(), fov:R.camera.fov, w:innerWidth, h:innerHeight}; })()`);
// drag
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 800, y: 500, button: 'left', clickCount: 1 });
for (let i = 1; i <= 12; i++) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 800 + i * 18, y: 500 - i * 5, button: 'left' });
  await sleep(16);
}
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1016, y: 440, button: 'left', clickCount: 1 });
await sleep(700);
const afterDrag = await ev(`(() => { const R=window.__RAIN__; return {cam:R.camera.position.toArray().map(v=>+v.toFixed(2)), tgt:R.controls.target.toArray().map(v=>+v.toFixed(2))}; })()`);
// wheel zoom
await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 800, y: 500, deltaX: 0, deltaY: -320 });
await sleep(600);
const afterZoom = await ev(`(() => { const R=window.__RAIN__; return {dist:+R.camera.position.distanceTo(R.controls.target).toFixed(2), cam:R.camera.position.toArray().map(v=>+v.toFixed(2))}; })()`);
// resize
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 1100, deviceScaleFactor: 1, mobile: false });
await sleep(500);
const afterResize = await ev(`(() => { const R=window.__RAIN__; return {fov:R.camera.fov, size:[R.renderer.domElement.width,R.renderer.domElement.height], aspect:+R.camera.aspect.toFixed(2)}; })()`);
// fps
const fps = await ev(`new Promise(res => { let n=0; const t0=performance.now(); const tick=()=>{ n++; if(performance.now()-t0<1500) requestAnimationFrame(tick); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(tick); })`);
await send('Page.captureScreenshot', { format: 'png' }).then(r => fs.writeFileSync('/tmp/interact.png', Buffer.from(r.data, 'base64')));
console.log(JSON.stringify({ before, afterDrag, afterZoom, afterResize, fps, logs }, null, 1));
await send('Target.closeTarget', { targetId: target.id }); ws.close();
