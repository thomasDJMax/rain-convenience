import fs from 'fs';
const PORT = process.env.CDP_PORT || 9333;
const BASE = `http://127.0.0.1:${PORT}`;
const TARGET = process.env.TARGET || 'http://127.0.0.1:8137/';
const FILE = process.argv[2];
const EXPR = fs.readFileSync(FILE, 'utf8');
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
await send('Runtime.enable'); await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: TARGET });
for (let i = 0; i < 40; i++) { await sleep(400); const r = await send('Runtime.evaluate', { expression: '!!(window.__RAIN__ && window.__RAIN__.ready)', returnByValue: true }); if (r.result.value) break; }
const r = await send('Runtime.evaluate', { expression: `(async () => { ${EXPR} })()`, returnByValue: true, awaitPromise: true });
if (r.exceptionDetails) console.log('ERR', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
else console.log(JSON.stringify(r.result.value, null, 1));
if (logs.length) console.log(logs.join('\n'));
await send('Target.closeTarget', { targetId: target.id }); ws.close();
