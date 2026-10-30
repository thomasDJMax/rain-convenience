import fs from 'fs';

const PORT = process.env.CDP_PORT || 9333;
const BASE = `http://127.0.0.1:${PORT}`;
const URL_TO_LOAD = process.env.TARGET || 'http://127.0.0.1:8137/';
const OUT = process.env.OUT || '/tmp/rain_shot.png';
const VIEW = process.env.VIEW || 'hero';
const W = +(process.env.W || 1600);
const H = +(process.env.H || 1000);

const target = await (await fetch(`${BASE}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const logs = [];

await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.consoleAPICalled') {
    const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ');
    logs.push(`[console.${msg.params.type}] ${text}`);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    logs.push(`[exception] ${d.text} ${d.exception?.description || ''}`);
  } else if (msg.method === 'Log.entryAdded') {
    logs.push(`[log.${msg.params.entry.level}] ${msg.params.entry.text}`);
  }
};
function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function evaluate(expression, returnByValue = true) {
  const r = await send('Runtime.evaluate', { expression, returnByValue, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Runtime.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: URL_TO_LOAD });
await sleep(2500);

let ready = false;
for (let i = 0; i < 60; i++) {
  ready = await evaluate('!!(window.__RAIN__ && window.__RAIN__.ready)');
  if (ready) break;
  await sleep(500);
}
if (!ready) {
  const st = await evaluate('({has:!!window.__RAIN__, body:document.body.innerText.slice(0,200)})');
  console.log('NOT READY', JSON.stringify(st));
  console.log(logs.join('\n'));
  await send('Page.captureScreenshot', { format: 'png' }).then((r) => fs.writeFileSync(OUT, Buffer.from(r.data, 'base64')));
  console.log('saved', OUT);
  process.exit(1);
}
if (process.env.CAM) {
  const cam = process.env.CAM.split(',').map(Number);
  const tgt = (process.env.TGT || '0,1.2,0').split(',').map(Number);
  await evaluate(`(() => { const R = window.__RAIN__; R.camera.position.set(${cam[0]},${cam[1]},${cam[2]}); R.controls.target.set(${tgt[0]},${tgt[1]},${tgt[2]}); R.controls.update(); return true; })()`);
} else {
  await evaluate(`window.__RAIN__.setView(${JSON.stringify(VIEW)}); true`);
}
await sleep(+(process.env.WAIT || 1800));
const info = await evaluate(`(() => {
  const R = window.__RAIN__;
  const gl = R.renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    t: +R.t.toFixed(2),
    calls: R.renderer.info.render.calls,
    tris: R.renderer.info.render.triangles,
    programs: R.renderer.info.programs?.length,
    size: [R.renderer.domElement.width, R.renderer.domElement.height],
    gpu: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a',
    camera: R.camera.position.toArray().map((v) => +v.toFixed(2)),
  };
})()`);
console.log(JSON.stringify(info));
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
console.log('saved', OUT, 'logs:', logs.length);
if (logs.length) console.log(logs.slice(0, 40).join('\n'));
await send('Target.closeTarget', { targetId: target.id });
ws.close();
