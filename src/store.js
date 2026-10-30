import * as THREE from 'three';
import {
  M, gradientMap, toon, flat, box, cyl, place, shadow, plane, tube,
  canvasTexture, rr, setFont, starPath, JP, EN, rand, pick,
} from './core.js';
import { STORE } from './layout.js';

// ──────────────────────────────────────────────────────────────
//  便利店局部贴图
// ──────────────────────────────────────────────────────────────
function floorTexture() {
  return canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#e7ddc7'; ctx.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = ((x * 5 + y * 11) % 4) * 3;
        ctx.fillStyle = `rgb(${232 + v},${223 + v},${203 + v})`;
        ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
        // 细碎的磨损与反光点
        for (let i = 0; i < 14; i++) {
          const px = x * s + 8 + Math.random() * (s - 16);
          const py = y * s + 8 + Math.random() * (s - 16);
          ctx.fillStyle = `rgba(255,252,242,${0.05 + Math.random() * 0.09})`;
          ctx.fillRect(px, py, 2 + Math.random() * 6, 1.5);
        }
        ctx.strokeStyle = 'rgba(176,164,138,.55)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x * s, y * s, s, s);
      }
    }
    const g = ctx.createLinearGradient(0, h, w, 0);
    g.addColorStop(0, 'rgba(255,240,208,.10)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [2.6, 2.0] });
}

function drinkHeaderTexture() {
  return canvasTexture(1536, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0d4a45'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#083a36'; ctx.fillRect(0, 0, w, 26);
    ctx.fillStyle = '#0d4a45'; ctx.fillRect(0, h - 18, w, 18);
    ctx.strokeStyle = '#c8a25e'; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
    starPath(ctx, 120, 126, 58, 24, 5); ctx.fillStyle = '#f3d79b'; ctx.fill();
    setFont(ctx, 96, 'bold', JP);
    ctx.fillStyle = '#fff6df';
    ctx.fillText('つめた〜い', 215, 120);
    setFont(ctx, 58, 'bold', EN);
    ctx.fillStyle = '#c9e8df';
    ctx.fillText('COLD DRINKS  ·  ICE CREAM', 218, 190);
    // 右侧瓶子剪影
    const cols = ['#f3d79b', '#e16a58', '#8fd6c4', '#f2efe2'];
    for (let i = 0; i < 6; i++) {
      const x = 1130 + i * 62;
      ctx.fillStyle = cols[i % cols.length];
      rr(ctx, x, 62 + (i % 3) * 8, 34, 132 - (i % 3) * 8, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.72)';
      ctx.fillRect(x + 6, 84 + (i % 3) * 8, 22, 26);
      ctx.fillStyle = '#d8c08a';
      ctx.fillRect(x + 10, 54 + (i % 3) * 8, 14, 12);
    }
    ctx.fillStyle = '#f3d79b';
    ctx.fillRect(40, h - 52, 220, 5);
  });
}

function foodHeaderTexture() {
  return canvasTexture(1536, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f7e7c4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e6d2a8'; ctx.fillRect(0, h - 22, w, 22);
    ctx.strokeStyle = '#b98a45'; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#c14b3f';
    rr(ctx, 36, 34, 280, 150, 16); ctx.fill();
    setFont(ctx, 88, 'bold', JP);
    ctx.fillStyle = '#fff6e2';
    ctx.fillText('あったか〜い', 62, 132);
    setFont(ctx, 34, 'bold', EN);
    ctx.fillText('FRESH & HOT', 66, 172);
    setFont(ctx, 90, 'bold', JP);
    ctx.fillStyle = '#4a3325';
    ctx.fillText('おにぎり・お弁当', 352, 122);
    setFont(ctx, 44, 'bold', JP);
    ctx.fillStyle = '#96704a';
    ctx.fillText('毎朝できたて  ·  お米は国産', 356, 190);
    // 饭团图形
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath(); ctx.moveTo(1390, 44); ctx.lineTo(1482, 196); ctx.lineTo(1298, 196); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1f3b32';
    ctx.fillRect(1348, 140, 84, 58);
    ctx.fillStyle = '#e9d7b6'; ctx.fillRect(1210, 72, 5, 120);
  });
}

function tobaccoTexture() {
  return canvasTexture(1024, 640, (ctx, w, h) => {
    ctx.fillStyle = '#241b16'; ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,220,160,.24)');
    g.addColorStop(1, 'rgba(255,220,160,.02)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cols = ['#d9483f', '#e8b64c', '#4f8fb8', '#3f8f7a', '#9b5ea8', '#d97b3f', '#e6e1cf', '#6a7078'];
    for (let r = 0; r < 6; r++) {
      const y = 34 + r * 98;
      ctx.fillStyle = 'rgba(255,236,200,.12)'; ctx.fillRect(16, y + 72, w - 32, 4);
      for (let c = 0; c < 12; c++) {
        const x = 26 + c * 82;
        ctx.fillStyle = cols[(r * 3 + c) % cols.length];
        rr(ctx, x, y, 66, 70, 5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.fillRect(x + 8, y + 8, 50, 20);
        ctx.fillStyle = 'rgba(20,20,20,.35)';
        ctx.fillRect(x + 8, y + 46, 50, 12);
      }
    }
    ctx.fillStyle = '#f0d9a4';
    setFont(ctx, 46, 'bold', JP);
    ctx.fillText('たばこ  ·  TOBACCO', 26, h - 16);
    ctx.strokeStyle = '#7d6547'; ctx.lineWidth = 6; ctx.strokeRect(8, 8, w - 16, h - 16);
  });
}

function labelTexture(text, sub, bg = '#14574f', fg = '#fff4da') {
  return canvasTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(227,196,133,.8)'; ctx.lineWidth = 4;
    ctx.strokeRect(9, 9, w - 18, h - 18);
    starPath(ctx, 58, 80, 22, 9, 5); ctx.fillStyle = fg; ctx.fill();
    setFont(ctx, 64, 'bold', JP);
    ctx.fillStyle = fg;
    const tw = ctx.measureText(text).width;
    ctx.fillText(text, 96, sub ? 78 : 100);
    if (sub) {
      setFont(ctx, 26, '600', EN);
      ctx.fillStyle = fg; ctx.globalAlpha = 0.72;
      ctx.fillText(sub, 98, 116);
      ctx.globalAlpha = 1;
    }
    if (tw > 380) { /* 保持左对齐即可 */ }
  });
}

function sideSignTexture() {
  return canvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0e423d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c8a25e'; ctx.lineWidth = 6; ctx.strokeRect(9, 9, w - 18, h - 18);
    starPath(ctx, 96, 120, 36, 15, 5); ctx.fillStyle = '#f3d79b'; ctx.fill();
    setFont(ctx, 84, 'bold', EN);
    ctx.fillStyle = '#fff6df';
    ctx.fillText('HOSHI MART', 160, 118);
    setFont(ctx, 34, 'bold', EN);
    ctx.fillStyle = '#c9e8df';
    ctx.fillText('OPEN 24 HOURS', 164, 170);
    ctx.fillStyle = '#c14b3f';
    rr(ctx, 800, 52, 168, 140, 16); ctx.fill();
    setFont(ctx, 58, 'bold', EN);
    ctx.fillStyle = '#fff4da';
    ctx.fillText('24H', 820, 145);
  });
}

function hoursTexture() {
  return canvasTexture(1024, 192, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,250,235,.9)'; ctx.lineWidth = 5;
    rr(ctx, 8, 8, w - 16, h - 16, 24); ctx.stroke();
    starPath(ctx, 86, 96, 34, 14, 5); ctx.fillStyle = 'rgba(255,246,225,.95)'; ctx.fill();
    setFont(ctx, 74, 'bold', JP);
    ctx.fillStyle = 'rgba(255,250,238,.96)';
    ctx.fillText('24時間営業', 150, 120);
    setFont(ctx, 26, 'bold', EN);
    ctx.fillStyle = 'rgba(255,246,225,.7)';
    ctx.fillText('OPEN 24 HOURS  ·  HOSHI MART', 156, 158);
  });
}

function saleTagTexture() {
  return canvasTexture(512, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f6d24d';
    rr(ctx, 6, 6, w - 12, h - 12, 18); ctx.fill();
    ctx.strokeStyle = '#c14b3f'; ctx.lineWidth = 10;
    rr(ctx, 24, 24, w - 48, h - 48, 12); ctx.stroke();
    ctx.fillStyle = '#c14b3f';
    ctx.beginPath(); ctx.arc(w / 2, 168, 116, 0, Math.PI * 2); ctx.fill();
    setFont(ctx, 48, 'bold', JP);
    ctx.fillStyle = '#fff6e2'; ctx.textAlign = 'center';
    ctx.fillText('おにぎり', w / 2, 160);
    setFont(ctx, 74, 'bold', EN);
    ctx.fillText('100', w / 2, 236);
    ctx.textAlign = 'left';
    setFont(ctx, 58, 'bold', JP);
    ctx.fillStyle = '#4a3325'; ctx.textAlign = 'center';
    ctx.fillText('円', w / 2, 474);
    setFont(ctx, 30, 'bold', EN);
    ctx.fillStyle = '#8a5a36';
    ctx.fillText('SALE  ·  FRESH DAILY', w / 2, 544);
    ctx.textAlign = 'left';
  });
}

function matTexture() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2b2f31'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#4f7a68'; ctx.lineWidth = 8; ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let i = 0; i < 30; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    starPath(ctx, 80, 128, 30, 13, 5); ctx.fillStyle = '#d9c07d'; ctx.fill();
    setFont(ctx, 46, 'bold', EN);
    ctx.fillStyle = '#e9e2cf';
    ctx.fillText('WELCOME', 130, 142);
    setFont(ctx, 20, 'bold', EN);
    ctx.fillStyle = '#93a99a';
    ctx.fillText('HOSHI MART  ·  24H', 132, 178);
  });
}

function roofTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#585d5e'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = 'rgba(30,34,35,.35)';
      ctx.fillRect(0, i * 64, w, 5);
    }
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(230,235,220,${0.02 + Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 2);
    }
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = `rgba(22,26,26,${0.05 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 12 + Math.random() * 46, 6 + Math.random() * 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [3, 2] });
}

function sheenTexture() {
  return canvasTexture(1024, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w * 0.2, -h * 0.2); ctx.rotate(0.3);
    const g1 = ctx.createLinearGradient(0, 0, 150, 0);
    g1.addColorStop(0, 'rgba(230,246,255,0)');
    g1.addColorStop(0.5, 'rgba(230,246,255,.42)');
    g1.addColorStop(1, 'rgba(230,246,255,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, 150, h * 1.9);
    ctx.translate(330, 0);
    const g2 = ctx.createLinearGradient(0, 0, 46, 0);
    g2.addColorStop(0, 'rgba(255,240,210,0)');
    g2.addColorStop(0.5, 'rgba(255,240,210,.22)');
    g2.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, 46, h * 1.9);
    ctx.restore();
  });
}

function freezerSignTexture() {
  return canvasTexture(512, 224, (ctx, w, h) => {
    ctx.fillStyle = '#dceff5'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#3f7f9c'; ctx.lineWidth = 6; ctx.strokeRect(8, 8, w - 16, h - 16);
    setFont(ctx, 86, 'bold', JP);
    ctx.fillStyle = '#255a70';
    ctx.fillText('アイス・氷', 40, 118);
    setFont(ctx, 30, 'bold', EN);
    ctx.fillStyle = '#4e8aa2';
    ctx.fillText('ICE CREAM  ·  ICE', 44, 168);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = 'rgba(80,150,180,.6)'; ctx.lineWidth = 3;
      const cx = 420 + i * 30, cy = 60 + i * 12;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + i;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
        ctx.stroke();
      }
    }
  });
}

// ──────────────────────────────────────────────────────────────
//  便利店
// ──────────────────────────────────────────────────────────────
export function buildStore(tex) {
  const S = STORE;
  const X0 = S.x0, X1 = S.x1, Z0 = S.z0, Z1 = S.z1;
  const FLOOR = S.floor, CEIL = S.ceil, H = S.h;
  const IX0 = X0 + 0.22, IX1 = X1 - 0.22;
  const IZ0 = Z0 + 0.22, IZ1 = Z1;
  const CX = (X0 + X1) / 2;
  const IW = IX1 - IX0, ID = IZ1 - IZ0;
  const ICX = (IX0 + IX1) / 2;

  const group = new THREE.Group();
  group.name = 'store';
  const shell = new THREE.Group();
  const inside = new THREE.Group();
  const outside = new THREE.Group();
  group.add(shell, inside, outside);

  const lights = [];
  const steamSources = [];
  const roofFans = [];
  const signMats = [];
  const pylonGlows = [];
  let doorL = null, doorR = null, sensorLed = null, doorSpill = null;

  // ── 贴图 & 材质 ─────────────────────────────────────────────
  const floorTex = floorTexture();
  const roofTex = roofTexture();
  const sheenTex = sheenTexture();
  const drinkHead = drinkHeaderTexture();
  const foodHead = foodHeaderTexture();
  const tobaccoTex = tobaccoTexture();
  const sideSign = sideSignTexture();
  const hoursTex = hoursTexture();
  const saleTex = saleTagTexture();
  const matTex = matTexture();
  const freezerSign = freezerSignTexture();
  const regSign = labelTexture('レジ', 'CASHIER', '#14574f');
  const magSign = labelTexture('雑誌', 'MAGAZINES', '#3b4b61');
  const recoSign = labelTexture('おすすめ', 'NEW ARRIVAL', '#b2543f');

  const wallMat = toon(M.wallCream);
  const wallWhite = toon(M.wallWhite);
  const wallGreen = toon(M.green);
  const greenDeep = toon(M.greenDeep);
  const frameMat = toon(0x183d37);
  const frameDark = toon(0x1d2a28);
  const whiteMat = toon(0xf1e3c9);
  const creamMat = toon(0xe9d9ba);
  const ceilingMat = toon(0xefdbb9);
  const metalMat = toon(M.metal);
  const steelMat = toon(M.steel);
  const darkMat = toon(0x2b3238);
  const redMat = toon(M.red);
  const floorMat = new THREE.MeshToonMaterial({
    map: floorTex, color: 0xc9a878, gradientMap,
  });
  const floorDecalMat = new THREE.MeshBasicMaterial({
    map: tex.floorDecal, transparent: true, depthWrite: false, opacity: 0.9,
  });
  const glassMat = new THREE.MeshBasicMaterial({
    color: 0xcfeef4, transparent: true, opacity: 0.1, depthWrite: false,
    side: THREE.DoubleSide,
  });
  const kickTileMat = new THREE.MeshBasicMaterial({
    map: tex.wallTile, color: 0x9fb6a4,
  });
  const basicMap = (map, opts = {}) => new THREE.MeshBasicMaterial({ map, ...opts });
  const toonTex = (map, color = 0xffffff) => new THREE.MeshToonMaterial({
    map, color, gradientMap,
  });

  // ── 建筑外壳 ───────────────────────────────────────────────
  const wallY = FLOOR - 0.08 + (H - FLOOR + 0.08) / 2; // 0.12..4.3
  const wallH = H - FLOOR + 0.08;
  const addWall = (w, d, x, z) => {
    const m = box(w, wallH, d, wallMat, 0.012);
    m.position.set(x, wallY, z);
    shell.add(m);
    return m;
  };
  addWall(0.22, Z1 - Z0, X0 + 0.11, (Z0 + Z1) / 2); // 左墙
  addWall(0.22, Z1 - Z0, X1 - 0.11, (Z0 + Z1) / 2); // 右墙
  addWall(10.4, 0.22, CX, Z0 + 0.11);              // 后墙
  // 前立面：玻璃上方的楣墙
  const headerH = H - S.glassTop - 0.22;
  const header = box(10.4, headerH + 0.22, 0.22, wallMat, 0.012);
  header.position.set(CX, S.glassTop + (headerH + 0.22) / 2, Z1 - 0.11);
  shell.add(header);
  // 窗下墙裙
  const kick = box(6.8, S.glassBottom - 0.12, 0.22, frameMat);
  kick.position.set(-2.5, 0.12 + (S.glassBottom - 0.12) / 2, Z1 - 0.11);
  shell.add(kick);
  const kickRight = box(1.2, S.glassBottom - 0.12, 0.22, frameMat);
  kickRight.position.set(3.58, 0.12 + (S.glassBottom - 0.12) / 2, Z1 - 0.11);
  shell.add(kickRight);
  // 窗与门之间的墙垛
  const pier = box(0.5, S.glassTop - 0.12, 0.22, wallMat, 0.012);
  pier.position.set(1.15, 0.12 + (S.glassTop - 0.12) / 2, Z1 - 0.11);
  shell.add(pier);
  // 门上方横梁
  const doorHead = box(1.6, 0.14, 0.22, wallMat, 0.01);
  doorHead.position.set(2.2, 2.79, Z1 - 0.11);
  shell.add(doorHead);
  // 左端墙垛
  const pierL = box(0.3, S.glassTop - 0.12, 0.22, wallMat, 0.01);
  pierL.position.set(-6.05, 0.12 + (S.glassTop - 0.12) / 2, Z1 - 0.11);
  shell.add(pierL);

  // 绿色瓷砖墙裙（外立面）
  const addTileBand = (w, x, z, ry = 0, y = 0.42) => {
    const p = plane(w, 0.5, kickTileMat);
    p.position.set(x, y, z); p.rotation.y = ry;
    shell.add(p);
    return p;
  };
  addTileBand(6.78, -2.5, Z1 + 0.001);
  addTileBand(1.18, 3.58, Z1 + 0.001);
  addTileBand(0.48, 1.15, Z1 + 0.001);
  addTileBand(7.56, X0 - 0.001, (Z0 + Z1) / 2, -Math.PI / 2);
  addTileBand(7.56, X1 + 0.001, (Z0 + Z1) / 2, Math.PI / 2);
  addTileBand(10.38, CX, Z0 - 0.001, Math.PI);

  // 室内地面 / 天花 / 背板
  const floor = plane(IW, ID, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(ICX, FLOOR + 0.002, (IZ0 + IZ1) / 2);
  floor.receiveShadow = false;
  inside.add(floor);
  const floorBase = box(IW, FLOOR, ID, toon(0x8f8674));
  floorBase.position.set(ICX, FLOOR / 2, (IZ0 + IZ1) / 2);
  shell.add(floorBase);

  const ceiling = plane(IW, ID, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(ICX, CEIL, (IZ0 + IZ1) / 2);
  inside.add(ceiling);

  // 天花缝与检修口
  for (let i = 0; i < 3; i++) {
    const seam = box(IW, 0.01, 0.02, toon(0xd9cfba));
    seam.position.set(ICX, CEIL - 0.006, -2.2 + i * 2.1);
    inside.add(seam);
  }
  const hatch = box(0.6, 0.02, 0.6, toon(0xe2d7c0));
  hatch.position.set(-4.6, CEIL - 0.01, -2.6);
  inside.add(hatch);

  // ── 顶灯（六组灯槽 + 暖色光池） ─────────────────────────────
  const lightStripMat = flat(0xfff8e6);
  const stripFrameMat = toon(0xd6cdb8);
  const glowMat = new THREE.MeshBasicMaterial({
    map: tex.glow, color: 0xffdca8, transparent: true, opacity: 0.13,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const stripX = [-3.8, -1.0, 1.8];
  const stripZ = [-2.0, 0.6];
  for (const zx of stripZ) {
    for (const x of stripX) {
      const frame = box(1.95, 0.05, 0.3, stripFrameMat);
      frame.position.set(x, CEIL - 0.03, zx);
      inside.add(frame);
      const panel = box(1.82, 0.035, 0.22, lightStripMat);
      panel.position.set(x, CEIL - 0.055, zx);
      inside.add(panel);
      const pool = plane(2.4, 1.35, glowMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x, FLOOR + 0.006, zx + 0.15);
      pool.renderOrder = 1;
      inside.add(pool);
    }
  }

  // ── 后墙：饮料冷柜 ─────────────────────────────────────────
  const cooler = new THREE.Group();
  cooler.position.set(2.2, 0, -3.72);
  inside.add(cooler);
  const cw = 3.4, cd = 0.56, ch = 2.3;
  const cTop = box(cw, 0.14, cd, whiteMat);
  cTop.position.set(0, 2.43, 0);
  cooler.add(cTop);
  const cBot = box(cw, 0.22, cd, whiteMat);
  cBot.position.set(0, 0.31, 0);
  cooler.add(cBot);
  for (const sx of [-cw / 2 + 0.06, cw / 2 - 0.06]) {
    const side = box(0.12, ch, cd, whiteMat);
    side.position.set(sx, 1.35, 0);
    cooler.add(side);
  }
  // 内部发光背板
  const cBack = plane(cw - 0.2, ch - 0.18, flat(0xfffdf2));
  cBack.position.set(0, 1.38, -cd / 2 + 0.03);
  cooler.add(cBack);
  // 侧壁暖白光
  for (let i = 0; i < 3; i++) {
    const l = plane(0.06, ch - 0.4, flat(0xe8fbff));
    l.position.set(-cw / 2 + 0.16 + i * 1.5, 1.35, cd / 2 - 0.02);
    l.rotation.y = 0;
    cooler.add(l);
  }
  const shelfYs = [0.66, 1.07, 1.48, 1.89];
  for (const yy of shelfYs) {
    const sh = box(cw - 0.22, 0.045, 0.4, toon(0xf4efdf));
    sh.position.set(0, yy, 0.01);
    cooler.add(sh);
    const rail = plane(cw - 0.24, 0.06, basicMap(tex.priceStrip, { color: 0xc9c4b4 }));
    rail.position.set(0, yy + 0.03, cd / 2 - 0.14);
    cooler.add(rail);
  }
  // 瓶装饮料（实例化）
  const bottleGeo = new THREE.CylinderGeometry(0.047, 0.043, 1, 8);
  const capGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.026, 8);
  const bottleItems = [];
  const capItems = [];
  const bottleCols = [0xf3d79b, 0xe16a58, 0x8fd6c4, 0xf2efe2, 0x7fb2e0, 0xe5a94f, 0xd85a7a, 0x6fbf9a, 0xffe6a8, 0xc8e4f5];
  for (const yy of shelfYs) {
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 18; i++) {
        if (Math.random() < 0.07) continue;
        const x = -cw / 2 + 0.28 + i * 0.162 + (row ? 0.03 : 0);
        const z = 0.1 - row * 0.15;
        const bh = 0.17 + Math.random() * 0.06;
        bottleItems.push({ x, y: yy + 0.026 + bh / 2, z, h: bh, c: pick(bottleCols) });
        capItems.push({ x, y: yy + 0.026 + bh + 0.012, z, c: 0xfdfdf6 });
      }
    }
  }
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const bottles = new THREE.InstancedMesh(bottleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), bottleItems.length);
  bottleItems.forEach((it, i) => {
    dummy.position.set(it.x, it.y, it.z);
    dummy.scale.set(1, it.h, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    bottles.setMatrixAt(i, dummy.matrix);
    bottles.setColorAt(i, color.setHex(it.c));
  });
  bottles.instanceMatrix.needsUpdate = true;
  if (bottles.instanceColor) bottles.instanceColor.needsUpdate = true;
  bottles.receiveShadow = false;
  cooler.add(bottles);
  const caps = new THREE.InstancedMesh(capGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), capItems.length);
  capItems.forEach((it, i) => {
    dummy.position.set(it.x, it.y, it.z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    caps.setMatrixAt(i, dummy.matrix);
    caps.setColorAt(i, color.setHex(it.c));
  });
  caps.instanceMatrix.needsUpdate = true;
  if (caps.instanceColor) caps.instanceColor.needsUpdate = true;
  cooler.add(caps);

  // 冷柜玻璃门
  const doorXs = [-cw / 2, -cw / 6, cw / 6, cw / 2];
  for (let i = 0; i < 3; i++) {
    const gx = (doorXs[i] + doorXs[i + 1]) / 2;
    const gw = doorXs[i + 1] - doorXs[i] - 0.06;
    const pane = plane(gw, 2.08, new THREE.MeshBasicMaterial({
      color: 0xd6f2f7, transparent: true, opacity: 0.1, depthWrite: false,
    }));
    pane.position.set(gx, 1.33, cd / 2 - 0.005);
    cooler.add(pane);
    for (const bx of [-gw / 2, gw / 2]) {
      const bar = box(0.045, 2.16, 0.04, steelMat);
      bar.position.set(gx + bx, 1.33, cd / 2 + 0.005);
      cooler.add(bar);
    }
    const topBar = box(gw + 0.04, 0.04, 0.04, steelMat);
    topBar.position.set(gx, 2.4, cd / 2 + 0.005);
    cooler.add(topBar);
    const handle = box(0.03, 0.62, 0.05, darkMat);
    handle.position.set(gx + gw / 2 - 0.09, 1.25, cd / 2 + 0.05);
    cooler.add(handle);
  }
  // 冷柜上方灯箱
  const drinkLight = plane(3.15, 0.4, basicMap(drinkHead));
  drinkLight.position.set(0, 2.66, cd / 2 - 0.02);
  cooler.add(drinkLight);
  const drinkBox = box(3.26, 0.5, 0.08, greenDeep);
  drinkBox.position.set(0, 2.66, cd / 2 - 0.08);
  cooler.add(drinkBox);

  // ── 后墙：便当 / 饭团岛 ─────────────────────────────────────
  const food = new THREE.Group();
  food.position.set(-2.8, 0, -3.74);
  inside.add(food);
  const fw = 6.1, fd = 0.5;
  const fBack = plane(fw, 2.32, flat(0xffeecb));
  fBack.position.set(0, 1.42, -fd / 2 + 0.02);
  food.add(fBack);
  const fSideL = box(0.1, 2.4, fd, whiteMat);
  fSideL.position.set(-fw / 2, 1.4, 0);
  food.add(fSideL);
  const fSideR = box(0.1, 2.4, fd, whiteMat);
  fSideR.position.set(fw / 2, 1.4, 0);
  food.add(fSideR);
  const fBase = box(fw, 0.3, fd, whiteMat);
  fBase.position.set(0, 0.35, 0);
  food.add(fBase);
  const fShelves = [0.9, 1.42, 1.93];
  for (const yy of fShelves) {
    const sh = box(fw - 0.16, 0.045, fd - 0.06, toon(0xf6f0df));
    sh.position.set(0, yy, 0);
    food.add(sh);
    const strip = plane(fw - 0.18, 0.07, basicMap(tex.priceStrip, { color: 0xcfc9b8 }));
    strip.position.set(0, yy + 0.04, fd / 2 - 0.02);
    food.add(strip);
  }
  const fHead = plane(fw - 0.1, 0.38, basicMap(foodHead));
  fHead.position.set(0, 2.54, fd / 2 - 0.06);
  food.add(fHead);
  const fHeadBox = box(fw, 0.46, 0.08, creamMat);
  fHeadBox.position.set(0, 2.54, fd / 2 - 0.11);
  food.add(fHeadBox);

  // 便当盒（实例化）
  const bentoItems = [];
  const lidCols = [0x2f4a44, 0xc14b3f, 0x2f5f7a, 0xb8893f, 0x3d3a52, 0x6f8b4a, 0xe0d8c4];
  for (const yy of [0.9, 1.42]) {
    for (let zr = 0; zr < 2; zr++) {
      for (let i = 0; i < 15; i++) {
        if (Math.random() < 0.12) continue;
        bentoItems.push({
          x: -fw / 2 + 0.28 + i * 0.375 + rand(-0.02, 0.02),
          y: yy + 0.055,
          z: 0.12 - zr * 0.22,
          w: 0.27, h: 0.09, d: 0.2,
          ry: rand(-0.35, 0.35),
          c: pick(lidCols),
        });
      }
    }
  }
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  const bento = new THREE.InstancedMesh(bGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), bentoItems.length);
  bentoItems.forEach((it, i) => {
    dummy.position.set(it.x, it.y, it.z);
    dummy.rotation.set(0, it.ry, 0);
    dummy.scale.set(it.w, it.h, it.d);
    dummy.updateMatrix();
    bento.setMatrixAt(i, dummy.matrix);
    bento.setColorAt(i, color.setHex(it.c));
  });
  bento.instanceMatrix.needsUpdate = true;
  if (bento.instanceColor) bento.instanceColor.needsUpdate = true;
  food.add(bento);
  // 便当白标签
  const labelGeo = new THREE.BoxGeometry(1, 1, 1);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0xfffdf2 });
  const labels = new THREE.InstancedMesh(labelGeo, labelMat, bentoItems.length);
  bentoItems.forEach((it, i) => {
    dummy.position.set(it.x, it.y + 0.048, it.z);
    dummy.rotation.set(0, it.ry, 0);
    dummy.scale.set(0.11, 0.004, 0.05);
    dummy.updateMatrix();
    labels.setMatrixAt(i, dummy.matrix);
  });
  labels.instanceMatrix.needsUpdate = true;
  food.add(labels);

  // 饭团（三角形棱柱）
  const onigiriGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.075, 3);
  const noriMat = toon(0x1f3b32);
  const riceMat = toon(0xfffdf4);
  for (let i = 0; i < 13; i++) {
    const ox = -fw / 2 + 0.35 + i * 0.44;
    const g = new THREE.Group();
    g.position.set(ox, 2.06, 0.1);
    const rice = new THREE.Mesh(onigiriGeo, riceMat);
    rice.rotation.x = Math.PI / 2;
    rice.rotation.z = Math.PI;
    g.add(rice);
    const nori = box(0.13, 0.09, 0.078, noriMat);
    nori.position.set(0, -0.035, 0.012);
    g.add(nori);
    const tag = box(0.045, 0.014, 0.002, i % 3 === 0 ? redMat : toon(0x2e7a64));
    tag.position.set(0, 0.05, 0.06);
    g.add(tag);
    g.rotation.y = rand(-0.25, 0.25);
    food.add(g);
  }
  // 饭团托架
  const onigiriTray = box(fw - 0.2, 0.04, 0.34, toon(0xd8cfba));
  onigiriTray.position.set(0, 1.955, 0.08);
  food.add(onigiriTray);

  // 假接触阴影：给货架/冷柜/柜台一点落地感
  const contactMat = new THREE.MeshBasicMaterial({
    map: tex.glow, color: 0x000000, transparent: true, opacity: 0.27,
    depthWrite: false,
  });
  function contactShadow(w, d, x, z, op = 0.27) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), contactMat.clone());
    m.material.opacity = op;
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, FLOOR + 0.005, z);
    m.renderOrder = 1;
    inside.add(m);
  }

  // ── 中央双列货架 ───────────────────────────────────────────
  const productPalette = [
    0xff7a6b, 0xffc857, 0x63c7d6, 0x9b8cff, 0x8bd58a, 0xf2efe0,
    0xe26f9a, 0x6fb4e8, 0xf0a35e, 0xd9483f, 0x3f8f7a, 0xffe08a,
  ];
  function buildGondola(x, labelTex) {
    const g = new THREE.Group();
    g.position.set(x, FLOOR, -0.9);
    inside.add(g);
    const gw = 0.96, gl = 3.4, gh = 1.42;
    const base = box(gw + 0.06, 0.16, gl, greenDeep, 0.01);
    base.position.set(0, 0.08, 0);
    g.add(base);
    const spine = box(0.07, gh - 0.16, gl, toon(0xcbb694));
    spine.position.set(0, gh / 2, 0);
    g.add(spine);
    const top = box(gw, 0.06, gl + 0.04, toon(0xdcc6a2), 0.006);
    top.position.set(0, gh, 0);
    g.add(top);
    const shelfYs = [0.42, 0.78, 1.14];
    for (const yy of shelfYs) {
      for (const side of [-1, 1]) {
        const sh = box(0.46, 0.04, gl - 0.05, toon(0xe6d3ae));
        sh.position.set(side * 0.235, yy, 0);
        g.add(sh);
        const rail = plane(gl - 0.12, 0.055, basicMap(tex.priceStrip, { color: 0xbdb7a6 }));
        rail.rotation.y = side * Math.PI / 2;
        rail.position.set(side * 0.468, yy - 0.006, 0);
        g.add(rail);
      }
    }
    // 货品
    const items = [];
    for (const yy of shelfYs) {
      for (const side of [-1, 1]) {
        for (let row = 0; row < 2; row++) {
          for (let i = 0; i < 15; i++) {
            if (Math.random() < 0.1) continue;
            const w = 0.09 + Math.random() * 0.08;
            const hh = 0.1 + Math.random() * 0.14;
            const dd = 0.06 + Math.random() * 0.08;
            items.push({
              x: side * (0.14 + row * 0.19),
              y: yy + 0.022 + hh / 2,
              z: -1.55 + i * 0.212 + rand(-0.02, 0.02),
              w, h: hh, d: dd,
              ry: rand(-0.12, 0.12),
              c: pick(productPalette),
            });
          }
        }
      }
    }
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), items.length);
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z);
      dummy.rotation.set(0, it.ry, 0);
      dummy.scale.set(it.w, it.h, it.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setHex(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    g.add(mesh);
    // 端头展示架
    const end = new THREE.Group();
    end.position.set(0, 0, gl / 2 + 0.18);
    g.add(end);
    const eBody = box(gw, 1.18, 0.34, creamMat, 0.008);
    eBody.position.set(0, 0.59, 0);
    end.add(eBody);
    for (const yy of [0.48, 0.84]) {
      const sh = box(gw - 0.08, 0.035, 0.3, toon(0xf7f1e2));
      sh.position.set(0, yy, 0.03);
      end.add(sh);
      for (let i = 0; i < 6; i++) {
        const it = box(0.11, 0.17, 0.1, new THREE.MeshBasicMaterial({ color: pick(productPalette) }));
        it.position.set(-0.32 + i * 0.13, yy + 0.1, 0.06);
        end.add(it);
      }
    }
    const sign = plane(0.72, 0.22, basicMap(labelTex));
    sign.position.set(0, 1.36, 0.18);
    end.add(sign);
    const signBack = box(0.76, 0.26, 0.04, greenDeep);
    signBack.position.set(0, 1.36, 0.15);
    end.add(signBack);
    return g;
  }
  buildGondola(-4.55, recoSign);
  buildGondola(-2.3, recoSign);

  // ── 前窗：杂志架 ───────────────────────────────────────────
  const mags = new THREE.Group();
  mags.position.set(-4.35, FLOOR, 2.88);
  inside.add(mags);
  const mBase = box(2.55, 0.12, 0.7, greenDeep, 0.008);
  mBase.position.set(0, 0.06, 0);
  mags.add(mBase);
  for (const sx of [-1.24, 1.24]) {
    const side = box(0.06, 1.05, 0.7, greenDeep);
    side.position.set(sx, 0.56, 0);
    mags.add(side);
  }
  const mTop = box(2.55, 0.05, 0.74, toon(0x1b3a34));
  mTop.position.set(0, 1.08, 0);
  mags.add(mTop);
  const mSign = plane(0.95, 0.28, basicMap(magSign));
  mSign.position.set(0, 1.3, 0.34);
  mags.add(mSign);
  const mSignBack = box(1.0, 0.32, 0.04, frameMat);
  mSignBack.position.set(0, 1.3, 0.31);
  mags.add(mSignBack);
  const magazineGeo = new THREE.PlaneGeometry(0.25, 0.32);
  const tiers = [
    { y: 0.55, z: 0.18 },
    { y: 0.83, z: 0.02 },
  ];
  for (const tier of tiers) {
    const board = box(2.4, 0.035, 0.28, toon(0xe2d8c2));
    board.position.set(0, tier.y - 0.19, tier.z + 0.02);
    board.rotation.x = -0.18;
    mags.add(board);
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: tex.magazines[(i + (tier.y > 0.7 ? 3 : 0)) % tex.magazines.length] });
      const m = new THREE.Mesh(magazineGeo, mat);
      m.position.set(-1.06 + i * 0.305, tier.y, tier.z);
      m.rotation.x = -0.18;
      mags.add(m);
      const lip = box(0.25, 0.012, 0.03, steelMat);
      lip.position.set(m.position.x, tier.y - 0.17, tier.z + 0.09);
      mags.add(lip);
    }
  }

  // ── 前窗：立式冰淇淋冷柜 ─────────────────────────────────────
  const freezer = new THREE.Group();
  freezer.position.set(0.12, FLOOR, 2.84);
  inside.add(freezer);
  const fzW = 1.5, fzD = 0.62, fzH = 1.7;
  const fzBack = box(fzW, fzH, 0.07, whiteMat, 0.008);
  fzBack.position.set(0, fzH / 2, -fzD / 2 + 0.035);
  freezer.add(fzBack);
  for (const sx of [-1, 1]) {
    const side = box(0.07, fzH, fzD, whiteMat, 0.008);
    side.position.set(sx * (fzW / 2 - 0.035), fzH / 2, 0);
    freezer.add(side);
  }
  const fzTop = box(fzW, 0.09, fzD, whiteMat, 0.008);
  fzTop.position.set(0, fzH - 0.045, 0);
  freezer.add(fzTop);
  const fzPlinth = box(fzW + 0.02, 0.14, fzD + 0.02, toon(0x5c6e6a), 0.006);
  fzPlinth.position.set(0, 0.07, 0);
  freezer.add(fzPlinth);
  // 深色冷光背板：让彩色包装跳出来
  const fzGlow = plane(fzW - 0.18, fzH - 0.26, new THREE.MeshBasicMaterial({
    color: 0x2a5d68,
  }));
  fzGlow.position.set(0, fzH / 2 + 0.02, -fzD / 2 + 0.075);
  freezer.add(fzGlow);
  const fzShelfYs = [0.46, 0.88, 1.3];
  for (const sy of fzShelfYs) {
    const sh = box(fzW - 0.18, 0.03, fzD - 0.18, toon(0xbfd2ce), 0.004);
    sh.position.set(0, sy, 0.02);
    freezer.add(sh);
    const rail = plane(fzW - 0.22, 0.055, basicMap(tex.priceStrip, { color: 0xd7e2de }));
    rail.position.set(0, sy + 0.02, fzD / 2 - 0.1);
    freezer.add(rail);
  }
  // 彩色冰淇淋盒：不受光材质，颜色更实
  const iceCols = [0xffcf6e, 0xff8fa8, 0x6fd6ea, 0xfff0c8, 0x7fd6a4, 0xc9a6ff, 0xffb35c, 0xff6b5e];
  const iceItems = [];
  for (const sy of fzShelfYs) {
    for (let i = 0; i < 8; i++) {
      const w = 0.12 + Math.random() * 0.04;
      iceItems.push({
        x: -0.55 + i * 0.157 + rand(-0.012, 0.012),
        y: sy + 0.075,
        z: 0.13 + rand(-0.02, 0.02),
        w, h: 0.1, d: 0.16,
        ry: rand(-0.08, 0.08), c: pick(iceCols),
      });
    }
  }
  const iceMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), iceItems.length);
  iceItems.forEach((it, i) => {
    dummy.position.set(it.x, it.y, it.z);
    dummy.rotation.set(0, it.ry, 0);
    dummy.scale.set(it.w, it.h, it.d);
    dummy.updateMatrix();
    iceMesh.setMatrixAt(i, dummy.matrix);
    iceMesh.setColorAt(i, color.setHex(it.c));
  });
  iceMesh.instanceMatrix.needsUpdate = true;
  if (iceMesh.instanceColor) iceMesh.instanceColor.needsUpdate = true;
  freezer.add(iceMesh);
  // 玻璃门与门框
  const fzGlass = plane(fzW - 0.1, fzH - 0.2, new THREE.MeshBasicMaterial({
    color: 0xd8f2ff, transparent: true, opacity: 0.08, depthWrite: false,
  }));
  fzGlass.position.set(0, fzH / 2, fzD / 2 + 0.006);
  freezer.add(fzGlass);
  for (const [bx, by, bw, bh] of [
    [0, fzH - 0.06, fzW, 0.06], [0, 0.11, fzW, 0.05],
    [-fzW / 2 + 0.035, fzH / 2, 0.05, fzH], [fzW / 2 - 0.035, fzH / 2, 0.05, fzH],
    [0, fzH / 2, 0.042, fzH],
  ]) {
    const fr = box(bw, bh, 0.05, steelMat);
    fr.position.set(bx, by, fzD / 2 + 0.02);
    freezer.add(fr);
  }
  for (const hx of [-0.16, 0.16]) {
    const handle = box(0.024, 0.6, 0.035, darkMat);
    handle.position.set(hx, 1.02, fzD / 2 + 0.06);
    freezer.add(handle);
  }
  const fzSign = plane(0.9, 0.3, basicMap(freezerSign));
  fzSign.position.set(0, fzH - 0.22, fzD / 2 + 0.032);
  freezer.add(fzSign);
  const fzPrice = plane(0.7, 0.06, basicMap(tex.priceStrip, { color: 0xd8d2c2 }));
  fzPrice.position.set(0, 0.16, fzD / 2 + 0.032);
  freezer.add(fzPrice);
  const fzLamp = new THREE.PointLight(0xcfefff, 1.5, 1.5, 2);
  fzLamp.position.set(0, 1.25, 0.12);
  fzLamp.layers.set(1);
  freezer.add(fzLamp);
  lights.push(fzLamp);

  // ── 收银台 / 后柜 ──────────────────────────────────────────
  const counter = new THREE.Group();
  counter.position.set(0, FLOOR, 0);
  inside.add(counter);
  const cx0 = 2.92, cx1 = 3.94, cz0 = -1.46, cz1 = 1.86;
  const cWidth = cx1 - cx0, cLen = cz1 - cz0;
  const cBody = box(cWidth, 0.9, cLen, creamMat, 0.012);
  cBody.position.set((cx0 + cx1) / 2, 0.45, (cz0 + cz1) / 2);
  counter.add(cBody);
  const counterTop = box(cWidth + 0.08, 0.07, cLen + 0.08, toon(0xf9f4e8));
  counterTop.position.set((cx0 + cx1) / 2, 0.935, (cz0 + cz1) / 2);
  counter.add(counterTop);
  const cBand = box(0.02, 0.16, cLen, greenDeep);
  cBand.position.set(cx0 - 0.005, 0.62, (cz0 + cz1) / 2);
  counter.add(cBand);
  // 柜台正面海报
  const cPoster = plane(0.55, 0.78, basicMap(tex.posters[1]));
  cPoster.rotation.y = -Math.PI / 2;
  cPoster.position.set(cx0 - 0.012, 0.58, 0.55);
  counter.add(cPoster);
  const cPosterFrame = box(0.02, 0.83, 0.6, darkMat);
  cPosterFrame.position.set(cx0 - 0.025, 0.58, 0.55);
  counter.add(cPosterFrame);
  // 柜台上的收银机
  const reg = new THREE.Group();
  reg.position.set(3.5, 0.97, 0.28);
  counter.add(reg);
  const regBase = box(0.36, 0.08, 0.32, darkMat);
  regBase.position.y = 0.04;
  reg.add(regBase);
  const regStand = box(0.08, 0.26, 0.09, darkMat);
  regStand.position.set(0, 0.2, -0.05);
  reg.add(regStand);
  const regScreen = box(0.4, 0.27, 0.035, darkMat);
  regScreen.position.set(0, 0.38, -0.01);
  regScreen.rotation.x = -0.12;
  reg.add(regScreen);
  const regFace = plane(0.33, 0.2, flat(0x9fe8dd));
  regFace.position.set(0, 0.38, 0.01);
  regFace.rotation.x = -0.12;
  reg.add(regFace);
  for (let i = 0; i < 3; i++) {
    const btn = box(0.035, 0.02, 0.035, i === 0 ? toon(0xd94f45) : toon(0xd8d2c2));
    btn.position.set(-0.08 + i * 0.08, 0.09, 0.14);
    reg.add(btn);
  }
  const card = box(0.2, 0.05, 0.15, darkMat);
  card.position.set(3.15, 1.0, 0.62);
  counter.add(card);
  const cardFace = plane(0.14, 0.09, flat(0x86d7c9));
  cardFace.rotation.x = -Math.PI / 2;
  cardFace.position.set(3.15, 1.026, 0.62);
  counter.add(cardFace);
  // 柜台外的「レジ」小牌
  const regBoard = plane(0.34, 0.11, basicMap(regSign));
  regBoard.rotation.y = -Math.PI / 2;
  regBoard.position.set(cx0 - 0.01, 1.2, 0.05);
  counter.add(regBoard);
  const regBoardBack = box(0.02, 0.15, 0.38, frameMat);
  regBoardBack.position.set(cx0 - 0.02, 1.2, 0.05);
  counter.add(regBoardBack);

  // 咖啡机
  const coffee = new THREE.Group();
  coffee.position.set(3.56, 1.0, 1.46);
  counter.add(coffee);
  const coBody = box(0.42, 0.62, 0.4, toon(0x333a3c), 0.008);
  coBody.position.y = 0.31;
  coffee.add(coBody);
  const coFace = plane(0.26, 0.16, flat(0x8fd6d2));
  coFace.position.set(0, 0.44, -0.203);
  coFace.rotation.y = Math.PI;
  coffee.add(coFace);
  const coSpout = box(0.1, 0.06, 0.08, steelMat);
  coSpout.position.set(0, 0.13, -0.23);
  coffee.add(coSpout);
  const cup = cyl(0.055, 0.045, 0.11, whiteMat, 10);
  cup.position.set(0, 0.06, -0.3);
  coffee.add(cup);
  const cupSleeve = cyl(0.057, 0.05, 0.04, toon(0xc9a05e), 10);
  cupSleeve.position.set(0, 0.06, -0.3);
  coffee.add(cupSleeve);
  for (let i = 0; i < 3; i++) {
    const stack = cyl(0.05, 0.05, 0.13, whiteMat, 10);
    stack.position.set(0.16, 0.36 + i * 0.07, 0.16);
    coffee.add(stack);
  }
  const coffeeSign = plane(0.55, 0.78, basicMap(tex.posters[2]));
  coffeeSign.rotation.y = -Math.PI / 2;
  coffeeSign.position.set(3.966, 2.0, 1.46);
  inside.add(coffeeSign);
  const coffeeSignFrame = box(0.02, 0.84, 0.6, darkMat);
  coffeeSignFrame.position.set(3.982, 2.0, 1.46);
  inside.add(coffeeSignFrame);

  // 关东煮锅
  const oden = new THREE.Group();
  oden.position.set(3.45, 1.0, -1.02);
  counter.add(oden);
  const odenBody = cyl(0.32, 0.3, 0.18, steelMat, 18);
  odenBody.position.y = 0.09;
  oden.add(odenBody);
  const odenSoup = cyl(0.29, 0.29, 0.03, toon(0x9a6334), 18);
  odenSoup.position.y = 0.185;
  oden.add(odenSoup);
  for (let i = 0; i < 3; i++) {
    const div = box(0.56, 0.13, 0.012, steelMat);
    div.position.set(0, 0.17, -0.16 + i * 0.16);
    div.rotation.y = i * 0.6;
    oden.add(div);
  }
  for (let i = 0; i < 6; i++) {
    const skewer = cyl(0.006, 0.006, 0.3, toon(0xd8c39a), 4);
    skewer.position.set(-0.2 + (i % 3) * 0.18, 0.3, -0.1 + Math.floor(i / 3) * 0.18);
    skewer.rotation.z = rand(-0.18, 0.18);
    oden.add(skewer);
    const foodBit = box(0.055, 0.05, 0.055, toon(pick([0xe2c07b, 0xb88150, 0xf0e2bd, 0x87a46a])));
    foodBit.position.set(skewer.position.x, 0.24, skewer.position.z);
    oden.add(foodBit);
  }
  const odenLight = plane(0.95, 0.6, basicMap(tex.lightboxes[0]));
  odenLight.rotation.y = -Math.PI / 2;
  odenLight.position.set(3.964, 2.05, -1.0);
  inside.add(odenLight);
  const odenLightBox = box(0.02, 0.68, 1.03, greenDeep);
  odenLightBox.position.set(3.982, 2.05, -1.0);
  inside.add(odenLightBox);
  const odenLabel = plane(0.5, 0.15, basicMap(labelTexture('おでん', 'ODEN', '#8a4327')));
  odenLabel.rotation.y = -Math.PI / 2;
  odenLabel.position.set(3.966, 1.6, -0.8);
  inside.add(odenLabel);

  // 香烟柜
  const cig = new THREE.Group();
  cig.position.set(3.96, 2.06, 0.3);
  inside.add(cig);
  const cigBack = box(0.08, 1.0, 1.5, greenDeep);
  cigBack.position.x = 0.02;
  cig.add(cigBack);
  const cigFace = plane(1.35, 0.82, basicMap(tobaccoTex));
  cigFace.rotation.y = -Math.PI / 2;
  cigFace.position.set(-0.03, 0, 0);
  cig.add(cigFace);
  const cigGlass = plane(1.32, 0.8, new THREE.MeshBasicMaterial({
    color: 0xd6f0f5, transparent: true, opacity: 0.08, depthWrite: false,
  }));
  cigGlass.rotation.y = -Math.PI / 2;
  cigGlass.position.set(-0.075, 0, 0);
  cig.add(cigGlass);
  const cigLabel = plane(0.9, 0.22, basicMap(labelTexture('たばこ', 'TOBACCO', '#5a3a2c')));
  cigLabel.rotation.y = -Math.PI / 2;
  cigLabel.position.set(-0.045, 0.62, 0);
  cig.add(cigLabel);

  // 后柜台架 / 杯子 / 小物
  const backShelf = box(0.34, 0.05, 2.0, toon(0xefe6d2));
  backShelf.position.set(3.86, 2.62, -0.2);
  inside.add(backShelf);
  for (let i = 0; i < 5; i++) {
    const boxy = box(0.12, 0.16, 0.14, toon(pick([0xf2e6cf, 0xd6c6a8, 0x9fb6a4])));
    boxy.position.set(3.86, 2.73, -1.0 + i * 0.38);
    inside.add(boxy);
  }

  // ATM
  const atm = new THREE.Group();
  atm.position.set(3.76, FLOOR, 2.42);
  inside.add(atm);
  const atmBody = box(0.46, 1.52, 0.62, toon(0xd9dde0), 0.01);
  atmBody.position.y = 0.76;
  atm.add(atmBody);
  const atmFace = box(0.03, 1.34, 0.52, toon(0x244a6b));
  atmFace.position.set(-0.24, 0.78, 0);
  atm.add(atmFace);
  const atmScreen = plane(0.3, 0.26, flat(0xa8e4e0));
  atmScreen.rotation.y = -Math.PI / 2;
  atmScreen.position.set(-0.256, 1.1, 0);
  atm.add(atmScreen);
  const atmKey = plane(0.26, 0.12, flat(0xcfd8d6));
  atmKey.rotation.y = -Math.PI / 2;
  atmKey.position.set(-0.256, 0.84, 0);
  atm.add(atmKey);
  const atmSign = plane(0.62, 0.24, basicMap(labelTexture('ATM', 'CASH MACHINE', '#244a6b')));
  atmSign.rotation.y = -Math.PI / 2;
  atmSign.position.set(-0.26, 1.72, 0);
  atm.add(atmSign);
  const atmSignBack = box(0.02, 0.28, 0.66, greenDeep);
  atmSignBack.position.set(-0.25, 1.72, 0);
  atm.add(atmSignBack);

  // 员工门（右侧墙内）
  const staffDoor = plane(0.86, 1.95, basicMap(tex.staffDoor));
  staffDoor.rotation.y = -Math.PI / 2;
  staffDoor.position.set(3.972, 1.18, -2.75);
  inside.add(staffDoor);
  const staffFrame = box(0.02, 2.06, 0.98, steelMat);
  staffFrame.position.set(3.991, 1.18, -2.75);
  inside.add(staffFrame);
  const staffLamp = box(0.1, 0.07, 0.3, flat(0xffdca8));
  staffLamp.position.set(3.965, 2.4, -2.75);
  inside.add(staffLamp);
  const keypad = box(0.05, 0.18, 0.12, darkMat);
  keypad.position.set(3.965, 1.36, -2.2);
  inside.add(keypad);

  // 左墙：储物柜、拖把、海报
  for (let i = 0; i < 3; i++) {
    const lock = box(0.4, 1.72, 0.55, toon(0x6b7b7f), 0.008);
    lock.position.set(-5.77, 1.06, -1.95 + i * 0.58);
    inside.add(lock);
    const handle = box(0.03, 0.14, 0.05, steelMat);
    handle.position.set(-5.56, 1.15, -1.95 + i * 0.58 + 0.18);
    inside.add(handle);
    const vents = box(0.01, 0.3, 0.4, darkMat);
    vents.position.set(-5.565, 1.55, -1.95 + i * 0.58);
    inside.add(vents);
  }
  const posterLeft1 = plane(0.5, 0.75, basicMap(tex.posters[0]));
  posterLeft1.rotation.y = Math.PI / 2;
  posterLeft1.position.set(-5.97, 1.75, 0.3);
  inside.add(posterLeft1);
  const posterLeft2 = plane(0.5, 0.75, basicMap(tex.posters[3]));
  posterLeft2.rotation.y = Math.PI / 2;
  posterLeft2.position.set(-5.97, 1.75, 1.35);
  inside.add(posterLeft2);
  for (const zz of [0.3, 1.35]) {
    const fr = box(0.02, 0.8, 0.55, whiteMat);
    fr.position.set(-5.985, 1.75, zz);
    inside.add(fr);
  }
  const mop = cyl(0.025, 0.025, 1.25, toon(0x8b6b4b), 6);
  mop.position.set(-5.72, 0.82, 1.62);
  mop.rotation.z = 0.15;
  inside.add(mop);
  const bucket = cyl(0.2, 0.16, 0.32, toon(0x9fb6c4), 12);
  bucket.position.set(-5.6, 0.36, 1.36);
  inside.add(bucket);

  // 入口内侧：地垫、购物篮、消毒液
  const inMat = plane(1.5, 0.75, basicMap(matTex));
  inMat.rotation.x = -Math.PI / 2;
  inMat.position.set(2.2, FLOOR + 0.004, 2.82);
  inside.add(inMat);
  for (let i = 0; i < 4; i++) {
    const basket = box(0.46, 0.11, 0.32, toon(i % 2 ? 0xc8564a : 0x3f7f9c), 0.006);
    basket.position.set(1.05, FLOOR + 0.08 + i * 0.115, 2.9);
    basket.rotation.y = 0.12;
    inside.add(basket);
    const handle = box(0.34, 0.02, 0.02, darkMat);
    handle.position.set(1.05, FLOOR + 0.145 + i * 0.115, 2.74);
    inside.add(handle);
  }
  const sanitizer = cyl(0.05, 0.05, 0.2, flat(0xd8eef0), 8);
  sanitizer.position.set(0.88, FLOOR + 0.6, 2.95);
  inside.add(sanitizer);
  const sanitizerStand = cyl(0.015, 0.015, 0.55, steelMat, 6);
  sanitizerStand.position.set(0.88, FLOOR + 0.28, 2.95);
  inside.add(sanitizerStand);

  // 地面导视 & 橱窗贴纸
  const decal = plane(1.15, 1.15, floorDecalMat);
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(2.2, FLOOR + 0.008, 1.95);
  decal.renderOrder = 2;
  inside.add(decal);
  const decal2 = plane(0.8, 0.8, floorDecalMat);
  decal2.rotation.x = -Math.PI / 2;
  decal2.rotation.z = Math.PI / 2;
  decal2.position.set(-1.4, FLOOR + 0.008, 0.2);
  decal2.renderOrder = 2;
  inside.add(decal2);

  // 窗贴
  const hours = plane(1.35, 0.25, new THREE.MeshBasicMaterial({
    map: hoursTex, transparent: true, opacity: 0.9, depthWrite: false,
  }));
  hours.position.set(-3.2, 2.62, Z1 + 0.02);
  outside.add(hours);
  const sale = plane(0.52, 0.65, new THREE.MeshBasicMaterial({
    map: saleTex, transparent: true, depthWrite: false,
  }));
  sale.position.set(0.44, 1.92, Z1 + 0.025);
  sale.rotation.z = 0.04;
  outside.add(sale);

  // ── 吊挂分类牌 ─────────────────────────────────────────────
  const catDefs = [
    { x: -4.55, t: tex.categories.food },
    { x: -2.3, t: tex.categories.snack },
    { x: -0.1, t: tex.categories.daily },
    { x: 2.1, t: tex.categories.drink },
  ];
  for (const def of catDefs) {
    const y = 2.55;
    const w = 1.22, h = 0.355;
    const back = box(w + 0.04, h + 0.04, 0.03, frameMat);
    back.position.set(def.x, y, 0.72);
    inside.add(back);
    for (const s of [-1, 1]) {
      const p = plane(w, h, basicMap(def.t));
      p.position.set(def.x, y, 0.72 + s * 0.02);
      if (s < 0) p.rotation.y = Math.PI;
      inside.add(p);
    }
    for (const dx of [-0.5, 0.5]) {
      const wire = cyl(0.005, 0.005, 0.44, metalMat, 4);
      wire.position.set(def.x + dx, y + h / 2 + 0.22, 0.72);
      inside.add(wire);
    }
  }

  contactShadow(1.4, 3.7, -4.55, -0.9, 0.3);
  contactShadow(1.4, 3.7, -2.3, -0.9, 0.3);
  contactShadow(1.8, 0.95, 0.12, 2.84, 0.26);
  contactShadow(1.3, 3.5, 3.43, 0.2, 0.24);
  contactShadow(2.7, 0.95, -4.35, 2.88, 0.2);

  // ── 室内道具灯 ─────────────────────────────────────────────
  const p1 = new THREE.PointLight(0xffb877, 6.6, 6.4, 2);
  p1.position.set(-3.1, 2.72, 1.15);
  const p2 = new THREE.PointLight(0xffb26e, 6.0, 6.0, 2);
  p2.position.set(0.35, 2.74, 0.15);
  const p3 = new THREE.PointLight(0xffab63, 4.9, 5.2, 2);
  p3.position.set(3.35, 2.6, 1.2);
  const p4 = new THREE.PointLight(0xcdeeff, 2.5, 3.4, 2);
  p4.position.set(2.2, 1.7, -3.4);
  const p5 = new THREE.PointLight(0xffc486, 3.3, 4.4, 2);
  p5.position.set(-4.7, 2.5, 2.5);
  for (const l of [p1, p2, p3, p4, p5]) { l.layers.set(1); lights.push(l); group.add(l); }

  // 关东煮 / 咖啡蒸汽
  function addSteam(x, y, z, count = 3, spread = 0.22, scale = 1) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex.steam, color: 0xfff4e4, transparent: true, opacity: 0,
        depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(x + rand(-spread, spread), y, z + rand(-spread, spread));
      sp.scale.setScalar(0.3 * scale);
      sp.renderOrder = 6;
      inside.add(sp);
      steamSources.push({
        sp, x: sp.position.x, y, z: sp.position.z,
        phase: i / count + rand(0, 0.12), speed: 0.2 + Math.random() * 0.09,
        scale: scale * (0.8 + Math.random() * 0.5),
      });
    }
  }
  addSteam(3.45, 1.42, -1.02, 5, 0.18, 1.0);
  addSteam(3.26, 1.4, 1.32, 3, 0.06, 0.65);

  // 室内灯光柔光板（面向玻璃的暖色补光贴片，避免室内死黑）
  const heal = new THREE.MeshBasicMaterial({
    map: tex.glow, color: 0xffdca8, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const healPlane = plane(3.4, 2.4, heal);
  healPlane.position.set(-2.4, 1.8, -2.4);
  inside.add(healPlane);

  // ════════════════════════════════════════════════════════════
  //  外部：玻璃幕墙、自动门、雨棚、招牌、屋顶、设备
  // ════════════════════════════════════════════════════════════
  const rainLayers = [];
  const sensorLeds = [];
  const glassFrame = (w, h, x, y, z, ry = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.y = ry;
    const t = 0.075;
    const top = box(w + t, t, 0.16, frameMat);
    top.position.set(0, h / 2, 0); g.add(top);
    const bot = box(w + t, t, 0.16, frameMat);
    bot.position.set(0, -h / 2, 0); g.add(bot);
    for (const sx of [-w / 2, w / 2]) {
      const v = box(t, h, 0.16, frameMat);
      v.position.set(sx, 0, 0); g.add(v);
    }
    outside.add(g);
    return g;
  };

  const GLASS_Z = Z1 + 0.012;
  const winY = (S.glassBottom + S.glassTop) / 2;
  const winH = S.glassTop - S.glassBottom;
  glassFrame(6.8, winH, -2.5, winY, GLASS_Z + 0.015);
  for (const mx of [-3.63, -1.37]) {
    const mull = box(0.07, winH, 0.15, frameMat);
    mull.position.set(mx, winY, GLASS_Z + 0.015);
    outside.add(mull);
  }
  glassFrame(1.15, winH, 3.575, winY, GLASS_Z + 0.015);
  const rightMull = box(0.07, winH, 0.15, frameMat);
  rightMull.position.set(3.58, winY, GLASS_Z + 0.015);
  outside.add(rightMull);
  const winGlass = plane(6.8, winH, glassMat);
  winGlass.position.set(-2.5, winY, GLASS_Z);
  winGlass.renderOrder = 4;
  outside.add(winGlass);
  const winGlassR = plane(1.15, winH, glassMat);
  winGlassR.position.set(3.575, winY, GLASS_Z);
  winGlassR.renderOrder = 4;
  outside.add(winGlassR);

  function addRainLayer(w, h, x, y, z, opacity, repeatX, speed, additive, offsetX = 0) {
    const map = tex.glassRain.clone();
    map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeatX, 1);
    map.offset.x = offsetX;
    const mat = new THREE.MeshBasicMaterial({
      map, color: 0xd8eef5, transparent: true, opacity, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const p = plane(w, h, mat);
    p.position.set(x, y, z);
    p.renderOrder = 5;
    outside.add(p);
    rainLayers.push({ map, speed });
    return p;
  }
  addRainLayer(6.72, winH - 0.04, -2.5, winY, GLASS_Z + 0.02, 0.34, 1, 0.035, false);
  addRainLayer(6.7, winH - 0.1, -2.5, winY, GLASS_Z + 0.032, 0.13, 2.1, 0.062, true, 0.37);
  addRainLayer(1.1, winH - 0.04, 3.575, winY, GLASS_Z + 0.02, 0.3, 0.5, 0.03, false);

  const sheenMat = new THREE.MeshBasicMaterial({
    map: sheenTex, color: 0xdfeef4, transparent: true, opacity: 0.05,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const sheen = plane(6.72, winH, sheenMat);
  sheen.position.set(-2.5, winY, GLASS_Z + 0.045);
  sheen.renderOrder = 6;
  outside.add(sheen);
  const sheenR = plane(1.1, winH, sheenMat);
  sheenR.position.set(3.575, winY, GLASS_Z + 0.045);
  sheenR.renderOrder = 6;
  outside.add(sheenR);
  const sill = box(6.9, 0.06, 0.2, whiteMat);
  sill.position.set(-2.5, S.glassBottom - 0.01, GLASS_Z + 0.04);
  outside.add(sill);
  const sillR = box(1.2, 0.06, 0.2, whiteMat);
  sillR.position.set(3.575, S.glassBottom - 0.01, GLASS_Z + 0.04);
  outside.add(sillR);

  // ── 自动门 ─────────────────────────────────────────────────
  const doorH = 2.52;
  function addRainLayerLocal(parent, w, h, x, y, z, opacity, speed) {
    const map = tex.glassRain.clone();
    map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(0.12, 1);
    const mat = new THREE.MeshBasicMaterial({
      map, color: 0xd8eef5, transparent: true, opacity, depthWrite: false,
      side: THREE.DoubleSide,
    });
    const p = plane(w, h, mat);
    p.position.set(x, y, z);
    p.renderOrder = 5;
    parent.add(p);
    rainLayers.push({ map, speed });
  }
  function makeDoorPanel(cx) {
    const g = new THREE.Group();
    g.position.set(cx, FLOOR, Z1 + 0.05);
    const pw = 0.8;
    const t = 0.055;
    for (const sx of [-pw / 2 + t / 2, pw / 2 - t / 2]) {
      const bar = box(t, doorH, 0.06, frameMat);
      bar.position.set(sx, doorH / 2, 0);
      g.add(bar);
    }
    for (const sy of [t / 2, doorH - t / 2]) {
      const bar = box(pw - t, t, 0.06, frameMat);
      bar.position.set(0, sy, 0);
      g.add(bar);
    }
    const glass = plane(pw - t * 2, doorH - t * 2, glassMat);
    glass.position.set(0, doorH / 2, 0.002);
    glass.renderOrder = 4;
    g.add(glass);
    addRainLayerLocal(g, pw - 0.12, doorH - 0.12, 0, doorH / 2, 0.02, 0.16, 0.025);
    const sticker = plane(0.52, 0.13, new THREE.MeshBasicMaterial({
      map: tex.autoDoor, transparent: true, depthWrite: false, opacity: 0.9,
    }));
    sticker.position.set(0, 1.72, 0.035);
    g.add(sticker);
    const edge = box(pw, 0.03, 0.07, toon(0x24292b));
    edge.position.set(0, 0.01, 0);
    g.add(edge);
    outside.add(g);
    return g;
  }
  doorL = makeDoorPanel(1.8);
  doorR = makeDoorPanel(2.6);
  for (const fx of [1.4, 3.0]) {
    const post = box(0.08, 2.58, 0.2, frameMat);
    post.position.set(fx, FLOOR + 1.29, Z1 + 0.02);
    outside.add(post);
  }
  const doorTop = box(1.68, 0.08, 0.2, frameMat);
  doorTop.position.set(2.2, 2.7, Z1 + 0.02);
  outside.add(doorTop);
  const threshold = box(1.68, 0.045, 0.16, steelMat);
  threshold.position.set(2.2, FLOOR - 0.01, Z1 + 0.05);
  outside.add(threshold);
  const step = box(1.7, 0.075, 0.2, toon(0x6b6f70));
  step.position.set(2.2, 0.155, Z1 + 0.36);
  step.rotation.x = 0.16;
  outside.add(step);
  const sensorBox = box(0.52, 0.075, 0.12, frameMat);
  sensorBox.position.set(2.2, 2.76, Z1 + 0.12);
  outside.add(sensorBox);
  for (let i = 0; i < 2; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: i ? 0xd83a2f : 0x69ffb0 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), mat);
    led.position.set(2.08 + i * 0.24, 2.75, Z1 + 0.185);
    outside.add(led);
    sensorLeds.push(led);
  }
  const autoLabel = plane(0.3, 0.06, new THREE.MeshBasicMaterial({
    map: tex.autoDoor, transparent: true, depthWrite: false, opacity: 0.7,
  }));
  autoLabel.position.set(2.2, 2.83, Z1 + 0.19);
  outside.add(autoLabel);
  const outMat = plane(1.95, 0.98, basicMap(matTex));
  outMat.rotation.x = -Math.PI / 2;
  outMat.position.set(2.2, 0.126, 3.95);
  outside.add(outMat);
  const outMatEdge = box(2.02, 0.012, 1.04, toon(0x1c2424));
  outMatEdge.position.set(2.2, 0.121, 3.95);
  outside.add(outMatEdge);
  const spill = plane(5.6, 2.2, new THREE.MeshBasicMaterial({
    map: tex.spill, color: 0xffd6a2, transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  spill.rotation.x = -Math.PI / 2;
  spill.position.set(1.4, 0.129, 5.18);
  spill.renderOrder = 3;
  outside.add(spill);
  // 橱窗灯光洒在湿人行道上
  const winSpill = plane(5.4, 1.9, new THREE.MeshBasicMaterial({
    map: tex.spill, color: 0xffc98a, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  winSpill.rotation.x = -Math.PI / 2;
  winSpill.position.set(-2.4, 0.128, 4.95);
  winSpill.renderOrder = 3;
  outside.add(winSpill);

  // ── 雨棚 ───────────────────────────────────────────────────
  const canopy = new THREE.Group();
  canopy.position.set(1.5, 0, 0);
  outside.add(canopy);
  const canW = 5.35, canD = 1.24, canZ = Z1 + 0.62;
  const canTop = box(canW, 0.075, canD, greenDeep, 0.012);
  canTop.position.set(0, 3.05, canZ);
  canopy.add(canTop);
  const canUnder = box(canW - 0.04, 0.035, canD - 0.03, toon(0xe9ddc2));
  canUnder.position.set(0, 3.008, canZ);
  canopy.add(canUnder);
  const canLip = box(canW, 0.13, 0.055, toon(0x103b35));
  canLip.position.set(0, 3.0, canZ + canD / 2 + 0.02);
  canopy.add(canLip);
  for (const sx of [-canW / 2 + 0.06, canW / 2 - 0.06]) {
    const cap = box(0.055, 0.1, canD, toon(0x103b35));
    cap.position.set(sx, 3.03, canZ);
    canopy.add(cap);
  }
  for (const sx of [-2.2, 1.08]) {
    const a = new THREE.Vector3(1.5 + sx, 2.99, Z1 + 1.12);
    const b = new THREE.Vector3(1.5 + sx, 3.42, Z1 + 0.04);
    const rod = tube(a, b, 0.022, metalMat, 6, 0.006);
    outside.add(rod);
  }
  for (const lx of [-1.5, 0.1, 1.7]) {
    const strip = box(1.45, 0.035, 0.07, flat(0xffe9c4));
    strip.position.set(lx, 2.984, canZ - 0.18);
    canopy.add(strip);
  }
  const underGlow = plane(5.1, 1.1, new THREE.MeshBasicMaterial({
    map: tex.glow, color: 0xffd9a4, transparent: true, opacity: 0.085,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  underGlow.rotation.x = Math.PI / 2;
  underGlow.position.set(1.5, 2.985, canZ);
  outside.add(underGlow);

  // ── 主招牌 ─────────────────────────────────────────────────
  const fasciaBack = box(10.4, 1.06, 0.16, frameMat, 0.012);
  fasciaBack.position.set(CX, 3.6, Z1 + 0.06);
  outside.add(fasciaBack);
  const fasciaMat = new THREE.MeshBasicMaterial({ map: tex.fascia });
  const fascia = plane(10.14, 0.9, fasciaMat);
  fascia.position.set(CX, 3.6, Z1 + 0.145);
  outside.add(fascia);
  signMats.push(fasciaMat);
  const trimTop = box(10.46, 0.07, 0.2, toon(0x0f3f39));
  trimTop.position.set(CX, 4.15, Z1 + 0.07);
  outside.add(trimTop);
  const trimBot = box(10.46, 0.07, 0.2, toon(0xc9a25c));
  trimBot.position.set(CX, 3.09, Z1 + 0.07);
  outside.add(trimBot);
  const signGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex.glow, color: 0xffd9a4, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  signGlow.position.set(CX, 3.6, Z1 + 0.5);
  signGlow.scale.set(11, 2.2, 1);
  signGlow.userData.baseOpacity = 0.12;
  outside.add(signGlow);
  pylonGlows.push(signGlow);

  // ── 转角立柱灯箱 ───────────────────────────────────────────
  const pylon = new THREE.Group();
  pylon.position.set(4.1, 2.12, 3.72);
  outside.add(pylon);
  const pyBody = box(0.46, 1.64, 0.34, greenDeep, 0.01);
  pylon.add(pyBody);
  const pyFrontMat = new THREE.MeshBasicMaterial({ map: tex.pylon });
  const pyFront = plane(0.4, 1.54, pyFrontMat);
  pyFront.position.set(0, 0, 0.172);
  pylon.add(pyFront);
  signMats.push(pyFrontMat);
  const pySide = plane(0.3, 1.54, pyFrontMat);
  pySide.rotation.y = Math.PI / 2;
  pySide.position.set(0.232, 0, 0);
  pylon.add(pySide);
  const pyTop = box(0.5, 0.06, 0.38, toon(0xc9a25c));
  pyTop.position.y = 0.85;
  pylon.add(pyTop);
  const pyBottom = box(0.5, 0.06, 0.38, toon(0xc9a25c));
  pyBottom.position.y = -0.85;
  pylon.add(pyBottom);
  const bracket = tube(new THREE.Vector3(4.0, 2.9, 3.55), new THREE.Vector3(4.0, 2.9, 3.36), 0.03, metalMat, 6);
  outside.add(bracket);
  for (const [px, pz, rot] of [[4.1, 3.92, 0], [4.34, 3.72, Math.PI / 2]]) {
    const g = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color: 0xffdca8, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    g.position.set(px, 2.12, pz);
    g.scale.set(rot ? 1.3 : 1.7, 2.5, 1);
    g.userData.baseOpacity = 0.18;
    outside.add(g);
    pylonGlows.push(g);
  }

  // ── 侧墙招牌与外立面设备 ───────────────────────────────────
  const sideSignMat = new THREE.MeshBasicMaterial({ map: sideSign });
  const sideSignMesh = plane(1.45, 0.36, sideSignMat);
  sideSignMesh.rotation.y = Math.PI / 2;
  sideSignMesh.position.set(X1 + 0.06, 2.82, 1.25);
  outside.add(sideSignMesh);
  const sideSignBack = box(0.08, 0.44, 1.52, greenDeep);
  sideSignBack.position.set(X1 + 0.02, 2.82, 1.25);
  outside.add(sideSignBack);
  signMats.push(sideSignMat);
  const sideGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex.glow, color: 0xffe0b0, transparent: true, opacity: 0.085,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sideGlow.position.set(X1 + 0.4, 2.82, 1.25);
  sideGlow.scale.set(1.35, 0.72, 1);
  sideGlow.userData.baseOpacity = 0.085;
  outside.add(sideGlow);
  pylonGlows.push(sideGlow);

  function wallAC(x, y, z, dir) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    outside.add(g);
    const body = box(0.78, 0.56, 0.4, toon(0xb9bcb6), 0.01);
    body.position.z = 0.22;
    g.add(body);
    const grille = box(0.56, 0.4, 0.02, toon(0x7d8482));
    grille.position.set(0, 0, 0.425);
    g.add(grille);
    for (let i = 0; i < 5; i++) {
      const slat = box(0.56, 0.012, 0.012, toon(0x4d5454));
      slat.position.set(0, -0.14 + i * 0.07, 0.438);
      g.add(slat);
    }
    for (const bx of [-0.3, 0.3]) {
      const br = box(0.04, 0.04, 0.42, darkMat);
      br.position.set(bx, -0.3, -0.02);
      g.add(br);
    }
    return g;
  }
  wallAC(X1 + 0.04, 2.7, -2.35, 1);
  wallAC(X0 - 0.04, 2.55, 0.7, -1);
  for (const zz of [3.34, -4.06]) {
    const pipe = cyl(0.06, 0.06, 4.16, toon(0x6f7570), 8);
    pipe.position.set(X1 + 0.07, 2.2, zz);
    outside.add(pipe);
    const elbow = tube(
      new THREE.Vector3(X1 + 0.07, 0.14, zz),
      new THREE.Vector3(X1 + 0.07, 0.14, zz > 0 ? zz - 0.22 : zz + 0.22),
      0.06, toon(0x6f7570), 8
    );
    outside.add(elbow);
  }
  const sidePipe = tube(
    new THREE.Vector3(X1 + 0.09, 4.02, -4.0),
    new THREE.Vector3(X1 + 0.09, 4.02, 3.3),
    0.04, toon(0x6f7570), 6
  );
  outside.add(sidePipe);
  const sideVent = box(0.06, 0.4, 0.56, darkMat);
  sideVent.position.set(X1 + 0.035, 2.0, -0.65);
  outside.add(sideVent);
  for (let i = 0; i < 4; i++) {
    const s = box(0.07, 0.025, 0.5, toon(0x6c7370));
    s.position.set(X1 + 0.05, 1.86 + i * 0.09, -0.65);
    outside.add(s);
  }
  const sidePoster = plane(0.5, 0.68, basicMap(tex.notices[0]));
  sidePoster.rotation.y = Math.PI / 2;
  sidePoster.position.set(X1 + 0.03, 1.55, -3.3);
  outside.add(sidePoster);

  // ── 巷子一侧的服务门与设备 ─────────────────────────────────
  const alleyDoor = plane(0.9, 2.0, basicMap(tex.staffDoor));
  alleyDoor.rotation.y = -Math.PI / 2;
  alleyDoor.position.set(X0 - 0.015, 1.15, -2.5);
  outside.add(alleyDoor);
  const alleyFrame = box(0.02, 2.1, 1.02, steelMat);
  alleyFrame.position.set(X0 - 0.025, 1.15, -2.5);
  outside.add(alleyFrame);
  const alleyLampArm = tube(
    new THREE.Vector3(X0 - 0.02, 2.55, -2.5),
    new THREE.Vector3(X0 - 0.34, 2.55, -2.5),
    0.022, darkMat, 6
  );
  outside.add(alleyLampArm);
  const alleyLamp = box(0.18, 0.1, 0.18, flat(0xffd7a0));
  alleyLamp.position.set(X0 - 0.42, 2.5, -2.5);
  outside.add(alleyLamp);
  const alleyLampShade = box(0.26, 0.05, 0.26, darkMat);
  alleyLampShade.position.set(X0 - 0.42, 2.56, -2.5);
  outside.add(alleyLampShade);
  const alleyPipe = cyl(0.055, 0.055, 4.1, toon(0x6b716d), 8);
  alleyPipe.position.set(X0 - 0.08, 2.17, 3.12);
  outside.add(alleyPipe);
  for (let i = 0; i < 3; i++) {
    const crate = box(0.46, 0.3, 0.34, toon(0x3f6f8c), 0.008);
    crate.position.set(X0 - 0.4, 0.28 + i * 0.31, -1.2 + (i % 2) * 0.06);
    crate.rotation.y = 0.05 * i;
    outside.add(crate);
    const lip = box(0.46, 0.035, 0.34, toon(0x2f5d78));
    lip.position.set(crate.position.x, crate.position.y + 0.15, crate.position.z);
    outside.add(lip);
  }
  const alleyVent = box(0.05, 0.5, 0.62, darkMat);
  alleyVent.position.set(X0 - 0.025, 2.1, 1.9);
  outside.add(alleyVent);

  // ── 后墙服务门 ─────────────────────────────────────────────
  const backDoor = plane(0.92, 2.0, basicMap(tex.staffDoor));
  backDoor.rotation.y = Math.PI;
  backDoor.position.set(-1.7, 1.15, Z0 - 0.015);
  outside.add(backDoor);
  const backFrame = box(1.04, 2.1, 0.02, steelMat);
  backFrame.position.set(-1.7, 1.15, Z0 - 0.025);
  outside.add(backFrame);
  const backLamp = box(0.22, 0.08, 0.12, flat(0xffd7a0));
  backLamp.position.set(-1.7, 2.5, Z0 - 0.08);
  outside.add(backLamp);
  const backStep = box(1.1, 0.1, 0.3, toon(0x6f7370));
  backStep.position.set(-1.7, 0.2, Z0 - 0.2);
  outside.add(backStep);
  for (const bx of [0.8, 2.4]) {
    const vent = box(0.6, 0.45, 0.06, darkMat);
    vent.position.set(bx, 2.4, Z0 - 0.04);
    outside.add(vent);
    for (let i = 0; i < 4; i++) {
      const s = box(0.5, 0.03, 0.07, toon(0x6c7370));
      s.position.set(bx, 2.25 + i * 0.1, Z0 - 0.05);
      outside.add(s);
    }
  }
  for (let i = 0; i < 2; i++) {
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), toon(0x232a2a));
    bag.scale.set(1, 0.9, 1);
    bag.position.set(2.7 + i * 0.5, 0.34, Z0 - 0.45);
    outside.add(bag);
  }
  const boxStack = box(0.55, 0.42, 0.42, toon(0x9a7b53), 0.008);
  boxStack.position.set(0.35, 0.33, Z0 - 0.5);
  outside.add(boxStack);

  // ── 屋顶 ───────────────────────────────────────────────────
  const roofSlab = box(10.4, 0.2, 7.6, toon(0x7d7a70));
  roofSlab.position.set(CX, 4.2, (Z0 + Z1) / 2);
  shell.add(roofSlab);
  const roofTopMat = toonTex(roofTex, 0xc6c4b6);
  const roofTop = plane(10.2, 7.4, roofTopMat);
  roofTop.rotation.x = -Math.PI / 2;
  roofTop.position.set(CX, 4.302, (Z0 + Z1) / 2);
  outside.add(roofTop);
  const paraMat = toon(0xcfc7b4);
  const paraTop = toon(0x9e9a8d);
  for (const [w, d, x, z] of [
    [10.4, 0.18, CX, Z1 - 0.09],
    [10.4, 0.18, CX, Z0 + 0.09],
    [0.18, 7.6, X0 + 0.09, (Z0 + Z1) / 2],
    [0.18, 7.6, X1 - 0.09, (Z0 + Z1) / 2],
  ]) {
    const p = box(w, 0.32, d, paraMat, 0.01);
    p.position.set(x, 4.45, z);
    outside.add(p);
    const cap = box(w + 0.02, 0.04, d + 0.02, paraTop);
    cap.position.set(x, 4.62, z);
    outside.add(cap);
  }

  function roofAC(x, z, s = 1) {
    const g = new THREE.Group();
    g.position.set(x, 4.31, z);
    outside.add(g);
    const body = box(1.16 * s, 0.7 * s, 0.74 * s, toon(0xb7b9b1), 0.012);
    body.position.y = 0.35 * s;
    g.add(body);
    const base = box(1.2 * s, 0.08, 0.8 * s, darkMat);
    base.position.y = 0.04;
    g.add(base);
    const fanRing = cyl(0.28 * s, 0.28 * s, 0.06, darkMat, 16);
    fanRing.position.y = 0.71 * s;
    g.add(fanRing);
    const fan = new THREE.Group();
    fan.position.set(0, 0.735 * s, 0);
    for (let i = 0; i < 4; i++) {
      const blade = box(0.5 * s, 0.012, 0.1 * s, toon(0x5f6664));
      blade.position.set(Math.cos(i * Math.PI / 2) * 0.12 * s, 0, Math.sin(i * Math.PI / 2) * 0.12 * s);
      blade.rotation.y = i * Math.PI / 2;
      fan.add(blade);
    }
    g.add(fan);
    roofFans.push(fan);
    for (let i = 0; i < 4; i++) {
      const slat = box(0.92 * s, 0.025, 0.012, toon(0x7d8482));
      slat.position.set(0, 0.16 + i * 0.12 * s, 0.376 * s);
      g.add(slat);
    }
    const pipe = tube(
      new THREE.Vector3(0.55 * s, 0.3, 0),
      new THREE.Vector3(0.55 * s, 0.08, 0.6),
      0.035, toon(0x6d736f), 6
    );
    g.add(pipe);
    return g;
  }
  roofAC(-3.7, -1.4, 1.05);
  roofAC(1.5, -2.35, 0.9);
  const stack = cyl(0.15, 0.15, 1.15, toon(0x9aa09a), 12);
  stack.position.set(-1.4, 4.88, 1.05);
  outside.add(stack);
  const stackCap = cyl(0.3, 0.2, 0.12, toon(0x7b827c), 12);
  stackCap.position.set(-1.4, 5.5, 1.05);
  outside.add(stackCap);
  const stackBase = box(0.5, 0.12, 0.5, toon(0x6f7570));
  stackBase.position.set(-1.4, 4.36, 1.05);
  outside.add(stackBase);
  const hatch2 = box(0.95, 0.2, 0.78, toon(0xb9bcb2), 0.01);
  hatch2.position.set(2.7, 4.42, 1.5);
  outside.add(hatch2);
  const hatchLid = box(0.86, 0.06, 0.7, toon(0x7e857f));
  hatchLid.position.set(2.7, 4.54, 1.5);
  outside.add(hatchLid);
  const hatchHandle = box(0.18, 0.03, 0.04, steelMat);
  hatchHandle.position.set(2.7, 4.58, 1.82);
  outside.add(hatchHandle);
  const mast = cyl(0.025, 0.03, 1.9, toon(0x6c7370), 6);
  mast.position.set(3.4, 5.25, -1.1);
  outside.add(mast);
  for (let i = 0; i < 3; i++) {
    const bar = box(0.7 - i * 0.14, 0.025, 0.025, toon(0x7b827c));
    bar.position.set(3.4, 5.6 + i * 0.26, -1.1);
    outside.add(bar);
  }
  const mastBase = cyl(0.13, 0.18, 0.1, darkMat, 8);
  mastBase.position.set(3.4, 4.36, -1.1);
  outside.add(mastBase);
  const tray = box(0.12, 0.06, 3.6, toon(0x6a716d));
  tray.position.set(-5.4, 4.36, -1.6);
  outside.add(tray);
  const drain = cyl(0.1, 0.1, 0.06, darkMat, 8);
  drain.position.set(3.6, 4.33, 2.9);
  outside.add(drain);

  // ── 外墙细节：转角、贴纸、踢脚线 ───────────────────────────
  const pierPoster = plane(0.42, 0.63, basicMap(tex.posters[0]));
  pierPoster.position.set(1.15, 1.62, Z1 + 0.024);
  outside.add(pierPoster);
  const pierPosterFrame = box(0.48, 0.7, 0.03, whiteMat);
  pierPosterFrame.position.set(1.15, 1.62, Z1 + 0.004);
  outside.add(pierPosterFrame);
  const atmSticker = plane(0.78, 0.24, new THREE.MeshBasicMaterial({
    map: labelTexture('ATM', 'CASH MACHINE', '#244a6b'), transparent: true, opacity: 0.95, depthWrite: false,
  }));
  atmSticker.position.set(3.56, 2.55, Z1 + 0.025);
  outside.add(atmSticker);
  for (let i = 0; i < 4; i++) {
    const seam = box(0.02, 1.2, 0.015, toon(0xb9af9a));
    seam.position.set(-5.2 + i * 2.6, 3.7, Z1 + 0.005);
    outside.add(seam);
  }

  // ── 外部灯光 ───────────────────────────────────────────────
  const doorSpill2 = new THREE.SpotLight(0xffd9a4, 26, 10, 0.95, 0.8, 2);
  doorSpill2.position.set(2.2, 2.72, 3.1);
  const spillTarget = new THREE.Object3D();
  spillTarget.position.set(2.2, 0.12, 6.4);
  group.add(spillTarget);
  doorSpill2.target = spillTarget;
  doorSpill2.castShadow = false;
  group.add(doorSpill2);
  doorSpill = doorSpill2;
  lights.push(doorSpill2);
  const awningLight = new THREE.PointLight(0xffd9a6, 5.5, 5.2, 2);
  awningLight.position.set(2.2, 2.9, 4.05);
  group.add(awningLight); lights.push(awningLight);
  const fasciaWash = new THREE.PointLight(0xffdcb0, 9, 9, 2);
  fasciaWash.position.set(-1.0, 3.35, 5.4);
  group.add(fasciaWash); lights.push(fasciaWash);
  const alleyLight = new THREE.PointLight(0xffb872, 5, 5, 2);
  alleyLight.position.set(X0 - 0.75, 2.4, -2.5);
  group.add(alleyLight); lights.push(alleyLight);

  // ==== LIGHTS / UPDATE ====
  function update(t, dt) {
    const smooth = (x) => x * x * (3 - 2 * x);
    const cyc = t % 19;
    let open = 0;
    if (cyc > 11.5) {
      if (cyc < 12.6) open = smooth(Math.min(1, (cyc - 11.5) / 1.1));
      else if (cyc < 15.4) open = 1;
      else if (cyc < 16.5) open = 1 - smooth(Math.min(1, (cyc - 15.4) / 1.1));
    }
    if (doorL) doorL.position.x = 1.8 - 0.8 * open;
    if (doorR) doorR.position.x = 2.6 + 0.8 * open;
    if (doorSpill) doorSpill.intensity = 18 + open * 16;

    const blink = Math.sin(t * 7.5) > 0.2;
    if (sensorLeds.length === 2) {
      sensorLeds[0].material.color.setHex(open > 0.5 ? 0x69ffb0 : 0x1e5a3a);
      sensorLeds[1].material.color.setHex(open > 0.5 ? 0xff6a4a : (blink ? 0xd83a2f : 0x3a1210));
    }

    const flick = 0.965 + Math.sin(t * 2.1) * 0.018 + Math.sin(t * 13.7) * 0.01;
    const stutter = ((t % 12.6) < 0.055 || (t % 27.9) < 0.04) ? 0.66 : 1;
    const k = flick * stutter;
    for (const m of signMats) m.color.setScalar(k);
    for (const g of pylonGlows) g.material.opacity = (g.userData.baseOpacity ?? 0.16) * k;

    for (const r of rainLayers) {
      r.map.offset.y = (r.map.offset.y + dt * r.speed) % 1;
    }
    for (const s of steamSources) {
      const p = (t * s.speed + s.phase) % 1;
      s.sp.position.y = s.y + p * 0.62 * s.scale;
      s.sp.position.x = s.x + Math.sin(p * 5.5 + s.phase * 9) * 0.035;
      s.sp.material.opacity = Math.sin(p * Math.PI) * 0.3;
      s.sp.scale.setScalar((0.16 + p * 0.46) * s.scale);
    }
    for (const f of roofFans) f.rotation.y += dt * 3.2;
  }

  // 阴影：外壳与室外道具投射；室内不参与，保证干净的光感
  shell.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = !o.material.transparent;
      o.receiveShadow = !o.material.transparent;
    }
  });
  outside.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = !o.material.transparent;
      o.receiveShadow = !o.material.transparent;
    }
  });
  inside.traverse((o) => {
    if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; }
  });

  return { group, update, lights, inside, outside, shell };
}
