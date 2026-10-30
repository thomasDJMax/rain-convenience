import * as THREE from 'three';
import {
  M, gradientMap, box, cyl, plane, place, toon, flat, shadow, tube, sagWire, addOutline,
  canvasTexture, rr, setFont, starPath, JP, EN, rand, pick, chance,
} from './core.js';
import {
  HALF, SIDEWALK_Y, ROAD, STORE, NEIGHBOR, ALLEY, BACK_ROW, WALK,
} from './layout.js';

// ──────────────────────────────────────────────────────────────
//  本地贴图
// ──────────────────────────────────────────────────────────────
function tactileTex() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b39235'; ctx.fillRect(0, 0, w, h);
    for (let y = 16; y < h; y += 32) {
      for (let x = 16; x < w; x += 32) {
        ctx.fillStyle = '#c9a744';
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8f7429';
        ctx.beginPath(); ctx.arc(x + 2, y + 2, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d3b253';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      }
    }
  }, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
}

function grateTex() {
  return canvasTexture(160, 80, (ctx, w, h) => {
    ctx.fillStyle = '#20252a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#555d60'; ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#0a0c0e';
    for (let x = 12; x < w - 8; x += 12) ctx.fillRect(x, 12, 6, h - 24);
    ctx.fillStyle = '#3f4649';
    for (let x = 8; x < w - 6; x += 12) ctx.fillRect(x, 8, 2, h - 16);
  });
}

function shutterTex() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#585b60'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 12) {
      ctx.fillStyle = '#65686d'; ctx.fillRect(0, y, w, 5);
      ctx.fillStyle = '#3c3f43'; ctx.fillRect(0, y + 5, w, 4);
      ctx.fillStyle = '#777a7f'; ctx.fillRect(0, y + 2, w, 1);
    }
    ctx.fillStyle = 'rgba(30,33,36,.35)';
    for (let i = 0; i < 9; i++) ctx.fillRect(0, Math.random() * h, w, 1);
  });
}

function windowTex(warm = true, variant = 0) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (warm) {
      g.addColorStop(0, variant ? '#6e4b2c' : '#8a5c31');
      g.addColorStop(0.45, '#ffd39a');
      g.addColorStop(1, '#f2b46f');
    } else {
      g.addColorStop(0, '#1a2838');
      g.addColorStop(0.6, '#3e5b75');
      g.addColorStop(1, '#16222e');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 窗框
    ctx.strokeStyle = '#211d19'; ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.strokeStyle = '#3c342c'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    if (warm) {
      // 窗帘
      ctx.fillStyle = 'rgba(150,96,56,.55)';
      ctx.fillRect(18, 20, 44, h - 40);
      ctx.fillRect(w - 62, 20, 44, h - 40);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = 'rgba(90,52,30,.25)';
        ctx.fillRect(22 + i * 7, 20, 2, h - 40);
        ctx.fillRect(w - 58 + i * 7, 20, 2, h - 40);
      }
      // 窗边植物剪影
      ctx.fillStyle = 'rgba(52,52,35,.6)';
      ctx.beginPath();
      ctx.ellipse(200, 186, 20, 32, 0.5, 0, Math.PI * 2);
      ctx.ellipse(220, 200, 15, 24, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(64,48,34,.7)';
      ctx.fillRect(196, 208, 30, 26);
    } else {
      ctx.fillStyle = 'rgba(12,20,28,.55)';
      for (let i = 0; i < 4; i++) ctx.fillRect(24, 30 + i * 52, w - 48, 10);
    }
    // 玻璃反光
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.moveTo(20, h - 20); ctx.lineTo(95, 20); ctx.lineTo(130, 20); ctx.lineTo(55, h - 20); ctx.fill();
  });
}

function cafeSignTex() {
  return canvasTexture(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#10312e'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c9b077'; ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = 'rgba(201,176,119,.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(220,200,160,${0.04 + Math.random() * 0.05})`;
      ctx.fillRect(14, i * 36, w - 28, 1);
    }
    ctx.fillStyle = '#e8cf98';
    starPath(ctx, w / 2, 105, 34, 14, 5);
    ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    setFont(ctx, 122, 'bold', JP);
    ctx.fillStyle = '#f4dfb0';
    ctx.shadowColor = 'rgba(255,196,110,.9)'; ctx.shadowBlur = 18;
    const chars = ['喫', '茶', '星', '屑'];
    chars.forEach((c, i) => ctx.fillText(c, w / 2, 225 + i * 165));
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(230,207,157,.65)';
    setFont(ctx, 24, 'normal', EN);
    ctx.fillText('CAFE HOSHIKUZU', w / 2, 930);
  });
}

function signalManTex(kind) {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#07090b'; ctx.fillRect(0, 0, w, h);
    const on = kind === 'walk' ? '#7effc0' : '#ff5a4e';
    ctx.strokeStyle = on; ctx.fillStyle = on;
    ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(64, 32, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (kind === 'walk') {
      ctx.moveTo(60, 48); ctx.lineTo(54, 78); ctx.lineTo(40, 108);
      ctx.moveTo(54, 78); ctx.lineTo(76, 100); ctx.lineTo(78, 116);
      ctx.moveTo(56, 60); ctx.lineTo(36, 76);
      ctx.moveTo(58, 58); ctx.lineTo(82, 70);
      ctx.stroke();
    } else {
      ctx.moveTo(64, 48); ctx.lineTo(64, 86);
      ctx.lineTo(50, 116);
      ctx.moveTo(64, 86); ctx.lineTo(78, 116);
      ctx.moveTo(64, 62); ctx.lineTo(46, 84);
      ctx.moveTo(64, 62); ctx.lineTo(82, 84);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);
  });
}

// ──────────────────────────────────────────────────────────────
//  小工具
// ──────────────────────────────────────────────────────────────
function paintPlane(w, d, x, z, y = 0.03, color = 0x9ea6a2, opacity = 0.72) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData.noShadow = true;
  return mesh;
}

function mapPlane(w, h, map, x, y, z, ry = 0, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({
    map,
    color: opts.color ?? 0xffffff,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
    polygonOffset: opts.polygonOffset ?? false,
    polygonOffsetFactor: opts.polygonOffset ? -3 : 0,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  mesh.userData.noShadow = true;
  if (opts.tiltX) mesh.rotation.x = opts.tiltX;
  return mesh;
}

function signPost(height, x, z, r = 0.035, color = M.metal) {
  const g = new THREE.Group();
  const pole = cyl(r, r * 1.2, height, toon(color), 8);
  pole.position.y = height / 2;
  g.add(pole);
  g.position.set(x, 0, z);
  return g;
}

function paintBar(w, d, x, z, y = 0.035) {
  return paintPlane(w, d, x, z, y, 0xa9b0ac, 0.8);
}

// ──────────────────────────────────────────────────────────────
//  主入口
// ──────────────────────────────────────────────────────────────
export function buildWorld(tex) {
  const group = new THREE.Group();
  group.name = 'world';

  const baseGroup = new THREE.Group();
  const groundLayers = new THREE.Group();
  const structures = new THREE.Group();
  const details = new THREE.Group();
  group.add(baseGroup, groundLayers, structures, details);

  const lights = [];
  const hide = [baseGroup, groundLayers];

  // ── 底座 ──────────────────────────────────────────────
  {
    const felt = box(24.86, 0.09, 24.86, toon(0x0d0f12));
    felt.position.y = -1.27;
    baseGroup.add(felt);

    const b0 = box(24.62, 0.42, 24.62, toon(0x14171c));
    b0.position.y = -1.02;
    addOutline(b0, 0.02, 0x05070a);
    baseGroup.add(b0);

    const b1 = box(24.32, 0.5, 24.32, toon(0x1d2027));
    b1.position.y = -0.57;
    baseGroup.add(b1);

    const b2 = box(24.1, 0.34, 24.1, toon(0x272b33));
    b2.position.y = -0.16;
    baseGroup.add(b2);

    // 黄铜装饰条
    const brass = toon(0x8a7448);
    for (const [w, d, x, z] of [
      [24.16, 0.07, 0, 12.05], [24.16, 0.07, 0, -12.05],
      [0.07, 24.16, 12.05, 0], [0.07, 24.16, -12.05, 0],
    ]) {
      const strip = box(w, 0.045, d, brass);
      strip.position.set(x, -0.045, z);
      baseGroup.add(strip);
    }

    // 铭牌
    const plateBack = box(3.9, 0.98, 0.05, toon(0x171511));
    plateBack.position.set(0, -0.5, 12.12);
    baseGroup.add(plateBack);
    baseGroup.add(mapPlane(3.72, 0.93, tex.plaque, 0, -0.5, 12.15));

    // 四角小铜块
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const cap = box(0.24, 0.06, 0.24, brass);
      cap.position.set(sx * 11.99, -0.028, sz * 11.99);
      baseGroup.add(cap);
    }
  }

  // ── 人行道 ────────────────────────────────────────────
  const tactile = tactileTex();
  const walkTop = (w, d, x, z, dark = 0) => {
    const body = box(w, 0.12, d, toon(M.sidewalkDark));
    body.position.set(x, 0.06, z);
    body.receiveShadow = true;
    body.castShadow = false;
    groundLayers.add(body);

    const map = tex.sidewalk.clone();
    map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(w / 2.0, d / 2.0);
    const mat = new THREE.MeshToonMaterial({
      map, gradientMap, color: dark ? 0x8d9098 : 0xffffff,
    });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, d - 0.01), mat);
    top.rotation.x = -Math.PI / 2;
    top.position.set(x, 0.121, z);
    top.receiveShadow = true;
    top.userData.noShadow = true;
    groundLayers.add(top);
  };

  walkTop(17.8, 3.0, -2.7, 4.9);                    // 店前
  walkTop(2.0, 7.6, 5.2, -0.4);                     // 右侧
  walkTop(23.9, 1.15, 0, 11.375);                   // 主路对面
  walkTop(1.15, 22.75, 11.375, -0.575);             // 侧路对面

  // 小巷地面
  {
    const body = box(2.2, 0.12, 11.0, toon(0x44474b));
    body.position.set(-7.3, 0.06, -2.1);
    body.receiveShadow = true;
    groundLayers.add(body);
    const map = tex.sidewalk.clone();
    map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1.1, 5.5);
    const top = new THREE.Mesh(
      new THREE.PlaneGeometry(2.19, 10.99),
      new THREE.MeshToonMaterial({ map, gradientMap, color: 0x8f9298 })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.set(-7.3, 0.121, -2.1);
    top.receiveShadow = true;
    top.userData.noShadow = true;
    groundLayers.add(top);
    // 排水槽
    const drain = box(0.18, 0.02, 10.7, toon(0x23272b));
    drain.position.set(-7.3, 0.124, -2.1);
    groundLayers.add(drain);
    for (let i = 0; i < 4; i++) {
      groundLayers.add(mapPlane(0.18, 0.5, grateTex(), -7.3, 0.136, 2.2 - i * 3.1));
    }
  }

  // 路缘石
  const curbMat = toon(0xa5a49c);
  const curbTop = (w, d, x, z, h = 0.24, y = 0.04) => {
    const c = box(w, h, d, curbMat);
    c.position.set(x, y, z);
    c.castShadow = false;
    c.receiveShadow = true;
    groundLayers.add(c);
    return c;
  };
  // 店前（斑马线处留口）
  curbTop(12.15, 0.22, -5.93, 6.31);
  curbTop(2.4, 0.22, 5.22, 6.31);
  // 右侧（横道处留口）
  curbTop(0.22, 7.9, 6.31, -0.25);
  curbTop(0.22, 0.4, 6.31, 6.2);
  // 对面主路
  curbTop(12.15, 0.22, -5.93, 10.69);
  curbTop(7.9, 0.22, 8.0, 10.69);
  // 对面侧路
  curbTop(0.22, 15.3, 10.69, -4.25);
  curbTop(0.22, 4.4, 10.69, 8.45);

  // 缘石坡道 & 黄色盲道
  const ramp = (w, d, x, z) => {
    const c = box(w, 0.1, d, toon(0x9a9a94));
    c.position.set(x, 0.02, z);
    groundLayers.add(c);
  };
  ramp(3.6, 0.34, 2.1, 6.28);
  ramp(0.34, 2.1, 6.28, 4.85);
  ramp(3.6, 0.34, 2.1, 10.72);
  ramp(0.34, 2.1, 10.72, 4.85);

  const tactileStrip = (w, d, x, z, rot = 0) => {
    const map = tactile.clone();
    map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(w / 0.6, d / 0.6);
    if (rot) map.rotation = Math.PI / 2;
    const mat = new THREE.MeshToonMaterial({ map, gradientMap, color: 0xffffff });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.127, z);
    m.receiveShadow = true;
    m.userData.noShadow = true;
    groundLayers.add(m);
  };
  tactileStrip(3.5, 0.42, 2.1, 6.13);
  tactileStrip(3.5, 0.42, 2.1, 10.9);
  tactileStrip(0.42, 2.0, 6.12, 4.85);
  tactileStrip(0.42, 2.0, 10.9, 4.85);

  // 排水沟
  {
    const gutterMat = toon(0x252a2f);
    const gutters = [
      [17.5, 0.3, -2.65, 6.55], [0.3, 10.2, 6.47, 1.0],
      [17.5, 0.3, -2.65, 10.53], [0.3, 5.0, 10.53, 1.0],
    ];
    for (const [w, d, x, z] of gutters) {
      const g = box(w, 0.028, d, gutterMat);
      g.position.set(x, 0.022, z);
      g.userData.noShadow = true;
      g.receiveShadow = true;
      groundLayers.add(g);
    }
    const grate = grateTex();
    for (const [x, z, rot] of [
      [-9.6, 6.55, 0], [-5.2, 6.55, 0], [-0.6, 6.55, 0], [3.3, 10.53, 0],
      [6.47, -2.4, 1], [6.47, 2.0, 1], [10.53, 7.4, 1],
    ]) {
      const p = mapPlane(0.62, 0.3, grate, x, 0.043, z, rot ? Math.PI / 2 : 0);
      groundLayers.add(p);
    }
  }

  // 井盖
  for (const [x, z] of [[2.35, 8.55], [-1.45, 7.6], [8.5, -2.1], [7.2, 9.4]]) {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(0.44, 28),
      new THREE.MeshToonMaterial({ map: tex.manhole, gradientMap, color: 0xd8d8d0 })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    m.receiveShadow = true;
    groundLayers.add(m);
  }

  // ── 道路标线 ──────────────────────────────────────────
  const marks = new THREE.Group();
  groundLayers.add(marks);
  // 主路中心虚线
  for (let i = 0; i < 9; i++) {
    marks.add(paintBar(1.15, 0.13, -11.0 + i * 2.1, 8.57));
  }
  // 侧路中心虚线
  for (let i = 0; i < 5; i++) {
    marks.add(paintBar(0.13, 1.15, 8.52, -11.0 + i * 2.4));
  }
  // 主路人行横道
  for (let i = 0; i < 5; i++) {
    marks.add(paintPlane(3.55, 0.5, 2.12, 6.77 + i * 0.9, 0.034, 0xadb4af, 0.82));
  }
  // 侧路人行横道
  for (let i = 0; i < 5; i++) {
    marks.add(paintPlane(0.5, 2.05, 6.67 + i * 0.9, 4.85, 0.034, 0xadb4af, 0.82));
  }
  // 侧路停止线 & 止まれ
  marks.add(paintPlane(2.0, 0.24, 9.55, 3.55, 0.036, 0xb0b7b2, 0.8));
  {
    const m = mapPlane(1.18, 1.18, tex.roadStop, 9.55, 0.04, 2.6, 0, { transparent: true });
    m.rotation.x = Math.PI / 2;
    marks.add(m);
  }
  // 停车位（两个平行泊位）
  {
    const bay = (x0, x1, z0, z1) => {
      marks.add(paintBar(x1 - x0, 0.08, (x0 + x1) / 2, z0));
      marks.add(paintBar(x1 - x0, 0.08, (x0 + x1) / 2, z1));
      marks.add(paintBar(0.08, z1 - z0, x0, (z0 + z1) / 2));
      marks.add(paintBar(0.08, z1 - z0, x1, (z0 + z1) / 2));
    };
    bay(6.5, 8.32, -4.05, -0.85);
    bay(6.5, 8.32, -0.65, 2.55);
  }

  // 主路对面边线
  marks.add(paintPlane(23.4, 0.09, 0, 10.47, 0.032, 0x9ba3a0, 0.45));
  // 侧路对面边线
  marks.add(paintPlane(0.09, 22.3, 10.47, -0.5, 0.032, 0x9ba3a0, 0.45));

  // ── 护栏 ──────────────────────────────────────────────
  const makeGuardrail = (len) => {
    const g = new THREE.Group();
    const railMat = toon(0xd6d6c8);
    const postCount = Math.max(2, Math.round(len / 1.5) + 1);
    for (let i = 0; i < postCount; i++) {
      const p = cyl(0.045, 0.05, 0.82, railMat, 8);
      p.position.set(-len / 2 + (len / (postCount - 1)) * i, 0.41, 0);
      g.add(p);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), railMat);
      cap.position.set(p.position.x, 0.84, 0);
      g.add(cap);
    }
    for (const y of [0.47, 0.76]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, len, 8), railMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = y;
      g.add(bar);
    }
    return g;
  };
  {
    const gr1 = makeGuardrail(1.9);
    gr1.position.set(5.2, SIDEWALK_Y, 6.19);
    structures.add(gr1);
    const gr2 = makeGuardrail(1.7);
    gr2.position.set(6.15, SIDEWALK_Y, 5.1);
    gr2.rotation.y = Math.PI / 2;
    structures.add(gr2);
    const gr3 = makeGuardrail(2.2);
    gr3.position.set(7.6, SIDEWALK_Y, 10.74);
    structures.add(gr3);
    const gr4 = makeGuardrail(1.8);
    gr4.position.set(10.74, SIDEWALK_Y, 7.0);
    gr4.rotation.y = Math.PI / 2;
    structures.add(gr4);
  }

  // ── 电线杆 / 电线 ────────────────────────────────────
  const wireMat = flat(0x0b0d12);
  const insulMat = toon(0xd8d4c4);
  const poleTops = [];
  function utilityPole(x, z, h, opts = {}) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const poleMat = toon(0x6d6a63);
    const p = cyl(0.11, 0.16, h, poleMat, 10, 0.012);
    p.position.y = h / 2;
    g.add(p);
    // 横担
    for (const [yy, len] of [[h - 0.55, 1.9], [h - 1.15, 1.55], [h - 2.0, 1.25]]) {
      const arm = box(len, 0.075, 0.11, toon(0x4d4a44));
      arm.position.y = yy;
      g.add(arm);
      for (const sx of [-0.42, 0, 0.42]) {
        const ins = cyl(0.035, 0.05, 0.13, insulMat, 6);
        ins.position.set(sx * len, yy + 0.1, 0);
        g.add(ins);
      }
    }
    // 变压器
    if (opts.transformer !== false) {
      const tr = cyl(0.26, 0.26, 0.72, toon(0x5b5e5c), 10);
      tr.position.set(-0.3, h - 2.75, 0.1);
      g.add(tr);
      const cap = cyl(0.28, 0.28, 0.08, toon(0x444745), 10);
      cap.position.set(-0.3, h - 2.35, 0.1);
      g.add(cap);
    }
    // 电缆卷
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.032, 5, 12), wireMat);
    coil.position.set(0.18, h - 2.25, 0);
    coil.rotation.y = Math.PI / 2;
    g.add(coil);
    // 爬梯钉
    for (let i = 0; i < 10; i++) {
      const rung = box(0.26, 0.025, 0.025, toon(0x3e3c38));
      rung.position.set(0, 1.1 + i * 0.34, 0.13);
      g.add(rung);
    }
    // 警示条
    const band = box(0.35, 0.55, 0.06, toon(0xc9b13e));
    band.position.set(0.0, 1.0, 0.14);
    g.add(band);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    structures.add(g);
    poleTops.push(new THREE.Vector3(x, h, z));
    return g;
  }

  utilityPole(5.86, -0.95, 9.4);
  utilityPole(11.42, 11.2, 8.6, { transformer: false });
  utilityPole(-11.3, 11.2, 8.2, { transformer: false });

  // 电线
  const wire = (ax, ay, az, bx, by, bz, sag, r = 0.018) => {
    const w = sagWire(
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
      sag, r, wireMat, 26
    );
    w.castShadow = false;
    details.add(w);
  };
  for (let i = 0; i < 3; i++) {
    wire(5.86 - 0.4 + i * 0.4, 8.55 - i * 0.28, -0.95,
      11.42 - 0.3 + i * 0.3, 8.0 - i * 0.24, 11.2, 1.25 - i * 0.15);
    wire(5.86 - 0.4 + i * 0.4, 8.9 - i * 0.2, -0.95,
      -11.3 + 0.35 - i * 0.35, 7.65 - i * 0.2, 11.2, 1.55 + i * 0.15);
  }
  wire(5.6, 8.2, -0.95, -8.6, 6.85, 2.5, 1.0, 0.016);
  wire(5.9, 7.9, -0.95, -5.4, 6.2, -8.8, 1.2, 0.016);
  wire(5.4, 7.2, -0.95, 4.9, 4.5, 3.2, 0.5, 0.014);
  wire(11.42, 7.6, 11.2, -11.3, 7.25, 11.2, 1.9, 0.015);
  wire(5.86, 6.9, -0.95, 4.85, 4.2, 3.2, 0.45, 0.012);

  // ── 路灯 ──────────────────────────────────────────────
  {
    const g = new THREE.Group();
    g.position.set(5.5, SIDEWALK_Y, 5.95);
    const lampPole = cyl(0.07, 0.1, 5.0, toon(0x3f464b), 10, 0.012);
    lampPole.position.y = 2.5;
    g.add(lampPole);
    const base = cyl(0.16, 0.2, 0.3, toon(0x33393e), 10);
    base.position.y = 0.15;
    g.add(base);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5.0, 0),
      new THREE.Vector3(0.1, 5.35, 0.05),
      new THREE.Vector3(0.55, 5.55, 0.25),
      new THREE.Vector3(1.05, 5.52, 0.45),
    ]);
    const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.055, 6), toon(0x3f464b));
    g.add(arm);
    const head = box(0.62, 0.13, 0.3, toon(0x30373b));
    head.position.set(1.1, 5.5, 0.46);
    g.add(head);
    const lens = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x9fc6e2 })
    );
    lens.rotation.x = -Math.PI / 2;
    lens.position.set(1.1, 5.43, 0.46);
    g.add(lens);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color: 0xa8cce8, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3,
    }));
    glow.scale.set(1.15, 1.15, 1);
    glow.position.set(1.1, 5.44, 0.46);
    g.add(glow);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    structures.add(g);

    const spot = new THREE.SpotLight(0xa9d4ff, 44, 20, 0.82, 0.65, 1.5);
    spot.position.set(6.6, 5.55, 6.4);
    spot.target.position.set(7.4, 0, 7.6);
    spot.castShadow = false;
    group.add(spot, spot.target);
    lights.push(spot);

    // 雨中的微弱光柱
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x9fc9ff, transparent: true, opacity: 0.022,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 5.2, 20, 1, true), coneMat);
    cone.position.set(1.1, 2.9, 0.46);
    g.add(cone);
  }

  // ── 路牌 / 告示牌 ─────────────────────────────────────
  {
    // 星町一丁目（挂在电线杆上）
    const sign = mapPlane(1.45, 0.36, tex.streetSign, 5.86, 4.6, -0.78);
    sign.material.side = THREE.DoubleSide;
    details.add(sign);
    const bracket = box(0.04, 0.04, 0.16, toon(0x353a3e));
    bracket.position.set(5.86, 4.6, -0.86);
    details.add(bracket);

    // 止まれ
    const sp = signPost(2.5, 5.95, 6.05, 0.04);
    details.add(sp);
    const stop = mapPlane(0.6, 0.6, tex.stopSign, 5.95, 2.15, 6.02, 0.18, { transparent: true });
    details.add(stop);

    // 停车场 P
    const pp = signPost(2.4, 6.0, -3.15, 0.035);
    details.add(pp);
    const psign = mapPlane(0.5, 0.66, tex.parkingSign, 6.04, 2.05, -3.15, Math.PI / 2);
    details.add(psign);
    const pback = box(0.04, 0.72, 0.55, toon(0x2a3a40));
    pback.position.set(6.01, 2.05, -3.15);
    details.add(pback);
  }

  // ── 公告栏（巷口） ────────────────────────────────────
  {
    const board = new THREE.Group();
    board.position.set(-9.05, 1.58, 4.55);
    board.rotation.y = 0.16;
    const back = box(2.05, 1.12, 0.07, toon(0x3d3630));
    board.add(back);
    const cork = box(1.88, 0.95, 0.02, toon(0x8a6c4d));
    cork.position.z = 0.045;
    board.add(cork);
    const roof = box(2.2, 0.07, 0.32, toon(0x2c2a26));
    roof.position.set(0, 0.6, 0.1);
    board.add(roof);
    const noticeMats = tex.notices.map((t) => new THREE.MeshBasicMaterial({ map: t, color: 0xcfc7b6 }));
    const layout = [
      [-0.55, 0.08, 0.5, 0.68, 0.05, noticeMats[0]],
      [0.02, 0.04, 0.48, 0.65, -0.03, noticeMats[1]],
      [0.59, 0.09, 0.5, 0.68, 0.04, noticeMats[2]],
    ];
    for (const [x, y, w, h, rot, mat] of layout) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      p.position.set(x, y, 0.06);
      p.rotation.z = rot;
      board.add(p);
    }
    for (const sx of [-0.82, 0.82]) {
      const leg = box(0.075, 1.15, 0.075, toon(0x36322c));
      leg.position.set(sx, -0.92, -0.02);
      board.add(leg);
    }
    board.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    structures.add(board);
  }

  // ── 邻家：喫茶 星屑 ──────────────────────────────────
  buildNeighbor({

    structures, details, hide, lights, wire, tex, windowTex, cafeSignTex, shutterTex,
  });

  // ── 后排民居 ──────────────────────────────────────────
  buildBackRow({ structures, details, windowTex, tex });

  // ── 行道树 & 绿化 ─────────────────────────────────────
  buildGreenery({ structures, details, hide });

  // ── 红绿灯 ────────────────────────────────────────────
  const signals = buildSignals({ structures, details, tex, signalManTex });
  details.add(signals.group);

  // ── 小巷杂物 / 后巷灯 ─────────────────────────────────
  {
    // 后巷壁灯
    const lampBack = new THREE.Group();
    lampBack.position.set(-4.0, 3.1, -8.33);
    lampBack.rotation.y = -Math.PI / 2;
    const arm = box(0.5, 0.05, 0.05, toon(0x33383c));
    lampBack.add(arm);
    const shade = cyl(0.16, 0.2, 0.12, toon(0x2d3438), 8);
    shade.position.set(0.25, -0.08, 0);
    lampBack.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffd7a0 }));
    bulb.position.set(0.25, -0.15, 0);
    lampBack.add(bulb);
    const bg = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color: 0xffc37a, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6,
    }));
    bg.scale.set(1.4, 1.4, 1);
    bg.position.set(0.25, -0.13, 0);
    lampBack.add(bg);
    structures.add(lampBack);

    const alleyLight = new THREE.PointLight(0xffb26a, 9, 8, 2);
    alleyLight.position.set(-7.0, 2.5, 0.9);
    group.add(alleyLight);
    lights.push(alleyLight);

    const backLight = new THREE.PointLight(0x86b4d8, 7, 9, 2);
    backLight.position.set(-1.0, 3.0, -8.1);
    group.add(backLight);
    lights.push(backLight);

    // 后巷垃圾堆放点
    const binGroup = new THREE.Group();
    binGroup.position.set(-5.5, 0, -7.4);
    for (let i = 0; i < 3; i++) {
      const bag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), toon(0x3a4046));
      bag.position.set(i * 0.44 - 0.4, 0.26, (i % 2) * 0.2);
      bag.scale.set(1, 0.85, 1.1);
      binGroup.add(bag);
      bag.castShadow = true;
    }
    const crate = box(0.9, 0.45, 0.6, toon(0x6b5537));
    crate.position.set(1.1, 0.22, 0.1);
    binGroup.add(crate);
    structures.add(binGroup);

    // 后巷水管
    const pipeMat = toon(0x5d6266);
    for (let i = 0; i < 2; i++) {
      const p = cyl(0.045, 0.045, 3.6, pipeMat, 6);
      p.position.set(-6.28, 1.8, -5.4 + i * 0.35);
      details.add(p);
    }
  }

  // ── 门牌小灯 / 零碎细节 ──────────────────────────────
  {
    // 巷口小灯箱
    const sb = new THREE.Group();
    sb.position.set(-6.32, 2.3, 2.9);
    const boxSign = box(0.08, 0.62, 0.36, toon(0x5d3b2f));
    sb.add(boxSign);
    const face = mapPlane(0.32, 0.48, tex.bikeSign, 0.045, 0, 0, Math.PI / 2, { transparent: true });
    sb.add(face);
    structures.add(sb);
  }

  // 阴影设置
  structures.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline && !o.userData.noShadow) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  details.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline && !o.userData.noShadow) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  groundLayers.traverse((o) => {
    if (o.isMesh) o.receiveShadow = true;
  });

  // ── 动画 ──────────────────────────────────────────────
  const update = (t, dt) => {
    signals.update(t, dt);
  };

  return { group, groundLayers, structures, details, lights, hide, update, signals };
}

// ──────────────────────────────────────────────────────────────
//  邻家建筑
// ──────────────────────────────────────────────────────────────
function buildNeighbor({ structures, details, hide, lights, wire, tex, windowTex, cafeSignTex, shutterTex }) {
  const g = new THREE.Group();
  g.name = 'neighbor';
  const w = NEIGHBOR.x1 - NEIGHBOR.x0;
  const d = NEIGHBOR.z1 - NEIGHBOR.z0;
  const cx = (NEIGHBOR.x0 + NEIGHBOR.x1) / 2;
  const cz = (NEIGHBOR.z0 + NEIGHBOR.z1) / 2;
  const h = NEIGHBOR.h;

  // 主体
  const body = box(w, h, d, toon(0x8e8574), 0.026);
  body.position.set(cx, h / 2, cz);
  g.add(body);

  // 1F 石材基座
  const base = box(w + 0.06, 0.9, d + 0.06, toon(0x4c4a44));
  base.position.set(cx, 0.45, cz);
  g.add(base);

  // 1F 卷帘门
  const shutter = new THREE.Mesh(
    new THREE.PlaneGeometry(2.15, 2.05),
    new THREE.MeshToonMaterial({ map: shutterTex(), gradientMap, color: 0xbfc2c5 })
  );
  shutter.position.set(cx - 0.35, 1.35, NEIGHBOR.z1 + 0.035);
  g.add(shutter);
  const shutterFrame = box(2.35, 2.25, 0.08, toon(0x3d3a34));
  shutterFrame.position.set(cx - 0.35, 1.3, NEIGHBOR.z1 + 0.01);
  g.add(shutterFrame);

  // 入口门
  const door = box(0.82, 2.05, 0.07, toon(0x3f3128));
  door.position.set(cx + 1.05, 1.12, NEIGHBOR.z1 + 0.04);
  g.add(door);
  const doorGlass = mapPlane(0.56, 0.8, windowTex(true, 2), cx + 1.05, 1.68, NEIGHBOR.z1 + 0.085, 0, { color: 0xc9a671 });
  g.add(doorGlass);
  const awning = box(2.5, 0.09, 0.8, toon(0x31473e));
  awning.position.set(cx - 0.1, 2.62, NEIGHBOR.z1 + 0.4);
  g.add(awning);
  // 雨棚支架
  for (const sx of [-1, 1]) {
    const rod = box(0.04, 0.04, 0.8, toon(0x2a2f33));
    rod.position.set(cx - 0.1 + sx * 1.15, 2.5, NEIGHBOR.z1 + 0.4);
    g.add(rod);
  }

  // 门头小灯
  const doorLamp = new THREE.Group();
  doorLamp.position.set(cx + 1.05, 2.35, NEIGHBOR.z1 + 0.1);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 8, 1, true), toon(0x2a2e31));
  lampShade.rotation.x = Math.PI;
  doorLamp.add(lampShade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffd39c }));
  bulb.position.y = -0.06;
  doorLamp.add(bulb);
  g.add(doorLamp);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex.glow, color: 0xffc37a, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75,
  }));
  glow.scale.set(0.9, 0.9, 1);
  glow.position.copy(doorLamp.position).add(new THREE.Vector3(0, -0.08, 0.05));
  g.add(glow);

  // 2F 窗户（暖）
  for (const [ox, variant, color] of [[-1.15, 0, 0xffd7a0], [0.55, 1, 0xe8b878]]) {
    const frame = box(1.18, 1.22, 0.08, toon(0x40392f));
    frame.position.set(cx + ox, 4.72, NEIGHBOR.z1 + 0.02);
    g.add(frame);
    const win = mapPlane(1.0, 1.04, windowTex(true, variant), cx + ox, 4.72, NEIGHBOR.z1 + 0.075, 0, { color });
    g.add(win);
  }

  // 3F 冷色小窗
  {
    const frame = box(0.96, 0.82, 0.08, toon(0x3a3d3a));
    frame.position.set(cx + 0.2, 6.2, NEIGHBOR.z1 + 0.02);
    g.add(frame);
    const win = mapPlane(0.82, 0.68, windowTex(false), cx + 0.2, 6.2, NEIGHBOR.z1 + 0.07, 0, { color: 0x9fb7c9 });
    g.add(win);
  }

  // 2F 阳台
  {
    const slab = box(2.9, 0.12, 0.62, toon(0x5b5347));
    slab.position.set(cx - 0.2, 3.98, NEIGHBOR.z1 + 0.31);
    g.add(slab);
    const railMat = toon(0x6f6557);
    for (let i = 0; i < 13; i++) {
      const bar = cyl(0.022, 0.022, 0.72, railMat, 5);
      bar.position.set(cx - 1.6 + i * 0.24, 4.4, NEIGHBOR.z1 + 0.58);
      g.add(bar);
    }
    const topRail = box(3.0, 0.05, 0.05, railMat);
    topRail.position.set(cx - 0.2, 4.76, NEIGHBOR.z1 + 0.58);
    g.add(topRail);
    // 阳台盆栽
    const pot = cyl(0.12, 0.16, 0.24, toon(0x6b5340), 8);
    pot.position.set(cx + 1.05, 4.15, NEIGHBOR.z1 + 0.36);
    g.add(pot);
    for (let i = 0; i < 4; i++) {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), toon(0x36513c));
      leaf.position.set(cx + 1.02 + Math.cos(i * 2.1) * 0.12, 4.38 + (i % 2) * 0.1, NEIGHBOR.z1 + 0.34 + Math.sin(i * 2.1) * 0.1);
      g.add(leaf);
    }
  }

  // 竖向霓虹招牌「喫茶 星屑」
  const signTex = cafeSignTex();
  const signGroup = new THREE.Group();
  signGroup.position.set(NEIGHBOR.x1 - 0.34, 3.6, NEIGHBOR.z1 + 0.16);
  const signCase = box(0.62, 2.5, 0.16, toon(0x1d2a26));
  signGroup.add(signCase);
  const signFace = mapPlane(0.56, 2.42, signTex, 0, 0, 0.085, 0);
  signGroup.add(signFace);
  // 侧边也发光
  const sideFace = mapPlane(0.56, 2.42, signTex, 0.31, 0, 0, Math.PI / 2, { color: 0xb9a273 });
  signGroup.add(sideFace);
  const signGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex.glow, color: 0xffc87d, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.32,
  }));
  signGlow.scale.set(2.4, 2.8, 1);
  signGlow.position.set(0, 0, 0.2);
  signGroup.add(signGlow);
  g.add(signGroup);

  // 屋顶设备
  {
    const parapet = box(w + 0.1, 0.32, 0.16, toon(0x6f6858));
    parapet.position.set(cx, h - 0.12, NEIGHBOR.z1 + 0.02);
    g.add(parapet);
    const tank = cyl(0.42, 0.42, 0.85, toon(0x5b6164), 12);
    tank.position.set(cx - 0.7, h + 0.55, cz - 1.2);
    g.add(tank);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = box(0.07, 0.3, 0.07, toon(0x3b3e3f));
      leg.position.set(cx - 0.7 + sx * 0.25, h + 0.15, cz - 1.2 + sz * 0.25);
      g.add(leg);
    }
    // 天线
    const mast = cyl(0.025, 0.03, 2.3, toon(0x4d4f50), 6);
    mast.position.set(cx + 0.9, h + 1.15, cz - 0.8);
    g.add(mast);
    for (let i = 0; i < 4; i++) {
      const rung = box(0.7 - i * 0.1, 0.02, 0.02, toon(0x4d4f50));
      rung.position.set(cx + 0.9, h + 0.55 + i * 0.42, cz - 0.8);
      g.add(rung);
    }
    const dish = cyl(0.3, 0.3, 0.05, toon(0xb9b9ad), 14);
    dish.rotation.x = 1.2;
    dish.position.set(cx + 1.25, h + 0.5, cz - 1.9);
    g.add(dish);
  }

  // 侧面（小巷）细节：管道、电表、空调、后门
  {
    const sideX = NEIGHBOR.x1 + 0.02;
    // 竖管
    for (const z of [-6.5, -3.0, 0.3, 2.2]) {
      const p = cyl(0.045, 0.045, 6.7, toon(0x555b5b), 6);
      p.position.set(sideX, 3.35, z);
      g.add(p);
      const joint = cyl(0.06, 0.06, 0.12, toon(0x444a4a), 6);
      joint.position.set(sideX, 1.2, z);
      g.add(joint);
    }
    // 横管
    for (const y of [1.5, 2.3, 4.6]) {
      const p = cyl(0.035, 0.035, 5.5, toon(0x505656), 6);
      p.rotation.x = Math.PI / 2;
      p.position.set(sideX + 0.03, y, -1.0);
      g.add(p);
    }
    // 电表箱
    const meter = box(0.14, 0.4, 0.5, toon(0x777f7c));
    meter.position.set(sideX + 0.1, 1.5, 0.9);
    g.add(meter);
    const meterFace = mapPlane(0.3, 0.24, tex.notices[2], sideX + 0.18, 1.55, 0.9, Math.PI / 2, { color: 0x93a09a });
    g.add(meterFace);

    // 空调外机（落地）
    const ac = new THREE.Group();
    ac.position.set(-8.25, 0.12, -2.2);
    const acBody = box(0.34, 0.7, 0.95, toon(0xb0b2a8));
    acBody.position.set(0, 0.35, 0);
    ac.add(acBody);
    const grill = cyl(0.3, 0.3, 0.035, toon(0x4e555a), 16);
    grill.rotation.z = Math.PI / 2;
    grill.position.set(-0.18, 0.36, 0);
    ac.add(grill);
    for (let i = 0; i < 5; i++) {
      const line = box(0.02, 0.6, 0.03, toon(0xc8c8bd));
      line.position.set(-0.2, 0.36, -0.35 + i * 0.17);
      ac.add(line);
    }
    const acFeet = box(0.4, 0.08, 1.0, toon(0x3a3d3d));
    acFeet.position.y = 0.04;
    ac.add(acFeet);
    g.add(ac);
    // 空调管线
    const pipe = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 5, 10, Math.PI), toon(0x4c5254));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-8.12, 0.85, -2.2);
    g.add(pipe);

    // 后门
    const backDoor = box(0.06, 2.0, 0.9, toon(0x3e3630));
    backDoor.position.set(NEIGHBOR.x1 + 0.02, 1.1, -5.2);
    g.add(backDoor);
    const backLamp = new THREE.PointLight(0xffb46a, 3.5, 4.5, 2);
    backLamp.position.set(NEIGHBOR.x1 + 0.6, 2.2, -5.2);
    g.add(backLamp);
    lights.push(backLamp);
    const bglow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color: 0xffb46a, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.45,
    }));
    bglow.scale.set(0.8, 0.8, 1);
    bglow.position.set(NEIGHBOR.x1 + 0.1, 2.2, -5.2);
    g.add(bglow);

    // 啤酒箱
    for (let i = 0; i < 3; i++) {
      const crate = box(0.55, 0.3, 0.38, toon(i === 1 ? 0x8c3b31 : 0x7a5b35));
      crate.position.set(NEIGHBOR.x1 + 0.25, 0.15 + i * 0.31, -6.5);
      g.add(crate);
    }
  }

  // 前墙空调 / 排水管
  {
    const ac2 = box(0.9, 0.6, 0.32, toon(0x9a9d96));
    ac2.position.set(cx - 1.25, 3.95, NEIGHBOR.z1 + 0.17);
    g.add(ac2);
    const grille = cyl(0.22, 0.22, 0.03, toon(0x4c5356), 14);
    grille.rotation.x = Math.PI / 2;
    grille.position.set(cx - 1.25, 3.95, NEIGHBOR.z1 + 0.34);
    g.add(grille);
    const down = cyl(0.045, 0.045, 6.8, toon(0x4e5353), 6);
    down.position.set(NEIGHBOR.x0 + 0.1, 3.4, NEIGHBOR.z1 + 0.05);
    g.add(down);

    // 外墙小海报
    const poster = mapPlane(0.44, 0.62, tex.posters[3], cx - 1.55, 1.5, NEIGHBOR.z1 + 0.08, 0, { color: 0xcfc7b6 });
    g.add(poster);
  }

  // 楼体阴影
  g.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  structures.add(g);
}

// ──────────────────────────────────────────────────────────────
//  后排民居
// ──────────────────────────────────────────────────────────────
function buildBackRow({ structures, details, windowTex, tex }) {
  const row = new THREE.Group();
  row.name = 'backRow';
  const frontZ = BACK_ROW.z1;

  function gableRoof(w, d, y, color = 0x2b3038) {
    const g = new THREE.Group();
    const ridgeH = 1.1;
    const slope = Math.sqrt((d / 2) ** 2 + ridgeH ** 2);
    const angle = Math.atan2(ridgeH, d / 2);
    for (const s of [-1, 1]) {
      const panel = box(w + 0.7, 0.12, slope + 0.4, toon(color), 0.018);
      panel.position.set(0, y + ridgeH / 2, s * (d / 4));
      panel.rotation.x = s * angle;
      g.add(panel);
    }
    const ridge = box(w + 0.75, 0.1, 0.16, toon(0x1e2228));
    ridge.position.set(0, y + ridgeH, 0);
    g.add(ridge);
    return g;
  }

  function house(x0, x1, h, opts = {}) {
    const w = x1 - x0;
    const d = 2.8;
    const cz = frontZ - d / 2;
    const cx = (x0 + x1) / 2;
    const g = new THREE.Group();
    const wallCol = opts.wall ?? 0x9a917f;
    const body = box(w, h, d, toon(wallCol), 0.022);
    body.position.set(cx, h / 2, cz);
    g.add(body);
    // 1F 淡色墙裙
    const skirt = box(w + 0.04, 1.0, d + 0.04, toon(opts.skirt ?? 0x565a57));
    skirt.position.set(cx, 0.5, cz);
    g.add(skirt);
    // 屋顶
    const roof = gableRoof(w, d, h, opts.roof ?? 0x2b3038);
    roof.position.z = cz;
    g.add(roof);
    // 窗
    if (opts.lit !== false) {
      const wx = cx + (opts.winOff ?? 0);
      const frame = box(1.25, 1.05, 0.08, toon(0x3b352d));
      frame.position.set(wx, h * 0.66, frontZ + 0.02);
      g.add(frame);
      const win = mapPlane(1.05, 0.85, windowTex(true, opts.variant ?? 1), wx, h * 0.66, frontZ + 0.075, 0, { color: opts.winColor ?? 0xe8bb82 });
      g.add(win);
    }
    // 1F 小窗 / 门
    if (opts.door !== false) {
      const door = box(0.8, 1.95, 0.06, toon(0x3d342b));
      door.position.set(cx - w * 0.22, 1.0, frontZ + 0.03);
      g.add(door);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5),
        new THREE.MeshBasicMaterial({ color: 0xffcc8c }));
      lamp.position.set(cx - w * 0.22, 2.15, frontZ + 0.12);
      g.add(lamp);
    }
    // 阳台
    if (opts.balcony) {
      const slab = box(w * 0.62, 0.1, 0.55, toon(0x5d574b));
      slab.position.set(cx, h * 0.5, frontZ + 0.28);
      g.add(slab);
      for (let i = 0; i < 9; i++) {
        const bar = cyl(0.018, 0.018, 0.6, toon(0x6b6558), 5);
        bar.position.set(cx - w * 0.29 + i * (w * 0.58 / 8), h * 0.5 + 0.35, frontZ + 0.52);
        g.add(bar);
      }
      const rail = box(w * 0.62, 0.04, 0.04, toon(0x6b6558));
      rail.position.set(cx, h * 0.5 + 0.66, frontZ + 0.52);
      g.add(rail);
      // 晾衣杆
      const pole = cyl(0.02, 0.02, w * 0.5, toon(0x7a7d78), 5);
      pole.rotation.z = Math.PI / 2;
      pole.position.set(cx, h * 0.5 + 1.05, frontZ + 0.42);
      g.add(pole);
    }
    // 门前矮墙
    if (opts.fence !== false) {
      const wall = box(w * 0.9, 0.65, 0.12, toon(0x6c675c));
      wall.position.set(cx, 0.32, frontZ + 0.9);
      g.add(wall);
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 0.5, 0.35), toon(0x2e4634));
      hedge.position.set(cx, 0.75, frontZ + 0.9);
      g.add(hedge);
    }
    // 外机
    if (opts.ac) {
      const ac = box(0.7, 0.5, 0.3, toon(0xa7aaa2));
      ac.position.set(x1 - 0.5, 2.4, frontZ + 0.18);
      g.add(ac);
      const fan = cyl(0.18, 0.18, 0.03, toon(0x565c5e), 12);
      fan.rotation.x = Math.PI / 2;
      fan.position.set(x1 - 0.5, 2.4, frontZ + 0.34);
      g.add(fan);
    }
    // 雨水管
    const drain = cyl(0.035, 0.035, h - 0.2, toon(0x5a5b56), 5);
    drain.position.set(x1 - 0.08, (h - 0.2) / 2, frontZ + 0.04);
    g.add(drain);
    row.add(g);
    return g;
  }

  house(-11.7, -7.7, 6.4, { wall: 0x908678, balcony: true, ac: true, variant: 0, winColor: 0xdcb27c });
  house(-7.3, -3.3, 5.7, { wall: 0x8b8a80, roof: 0x353a40, winColor: 0xd7aa76, variant: 1, fence: false });
  house(-2.9, 1.3, 6.9, { wall: 0x9b8c76, balcony: true, ac: true, winColor: 0xe6bd86, variant: 2 });
  house(1.7, 5.5, 5.3, { wall: 0x807e74, roof: 0x2e333a, winColor: 0xcfa673, variant: 0, door: false });
  // 后排空调 / 天线 / 树
  {
    const mast = cyl(0.025, 0.03, 2.2, toon(0x464a4a), 5);
    mast.position.set(-4.9, 7.4, -9.7);
    row.add(mast);
    for (let i = 0; i < 4; i++) {
      const bar = box(0.8, 0.02, 0.02, toon(0x464a4a));
      bar.position.set(-4.9, 6.7 + i * 0.38, -9.7);
      row.add(bar);
    }
  }

  row.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  structures.add(row);
}

// ──────────────────────────────────────────────────────────────
//  绿化
// ──────────────────────────────────────────────────────────────
function buildGreenery({ structures, details, hide }) {
  function tree(x, z, s = 1, y = SIDEWALK_Y) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    const trunk = cyl(0.12, 0.18, 2.8, toon(0x4b3f33), 8, 0.012);
    trunk.position.y = 1.4;
    g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const branch = cyl(0.04, 0.07, 1.1, toon(0x4b3f33), 5);
      branch.position.set(Math.cos(i * 2.2) * 0.3, 2.3 + i * 0.22, Math.sin(i * 2.2) * 0.3);
      branch.rotation.z = Math.cos(i * 2.2) * 0.6;
      branch.rotation.x = Math.sin(i * 2.2) * 0.5;
      g.add(branch);
    }
    const leafCols = [0x2d4b39, 0x355740, 0x26412f];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = 0.5 + (i % 3) * 0.32;
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62 + (i % 2) * 0.18, 0),
        toon(leafCols[i % 3])
      );
      leaf.position.set(Math.cos(a) * r, 2.9 + (i % 4) * 0.26, Math.sin(a) * r * 0.8);
      leaf.scale.set(1, 0.8, 1);
      leaf.castShadow = true;
      g.add(leaf);
    }
    // 树池
    const pit = box(1.05, 0.08, 1.05, toon(0x34383a));
    pit.position.y = 0.02;
    g.add(pit);
    structures.add(g);
    return g;
  }

  tree(11.3, 8.3, 0.9);

  // 后巷杂草 / 灌木
  function bush(x, z, r, y = 0.12, color = 0x2c4433) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (0.55 + (i % 2) * 0.2), 0), toon(color));
      b.position.set(Math.cos(i * 1.7) * r * 0.5, r * 0.5, Math.sin(i * 1.7) * r * 0.5);
      b.scale.y = 0.75;
      b.castShadow = true;
      g.add(b);
    }
    details.add(g);
    return g;
  }
  bush(-8.05, 3.0, 0.42);
  bush(-6.45, 2.55, 0.3, 0.12, 0x314b39);
  bush(-6.35, -6.9, 0.4, 0.006, 0x2a4232);
  bush(9.9, 11.25, 0.5, 0.12, 0x2f4636);
  bush(-11.2, 11.25, 0.45, 0.12, 0x334b38);

  // 杂草丛（细小锥体）
  const grassMat = toon(0x3b5238);
  for (let i = 0; i < 26; i++) {
    const x = rand(-11.5, 11.5);
    const z = chance(0.5) ? rand(6.1, 6.5) : rand(10.4, 10.8);
    if (x > -0.2 && x < 4.2) continue;
    const clump = new THREE.Group();
    for (let j = 0; j < 3; j++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, rand(0.16, 0.3), 3), grassMat);
      blade.position.set(rand(-0.1, 0.1), 0.1, rand(-0.1, 0.1));
      blade.rotation.z = rand(-0.4, 0.4);
      clump.add(blade);
    }
    clump.position.set(x, 0.01, z);
    details.add(clump);
  }
}

// ──────────────────────────────────────────────────────────────
//  信号灯
// ──────────────────────────────────────────────────────────────
function buildSignals({ structures, details, tex, signalManTex }) {
  const group = new THREE.Group();
  group.name = 'signals';

  const walkTex = signalManTex('walk');
  const standTex = signalManTex('stand');

  // 行人信号（主路对面，面向 -z）
  const pedPole = signPost(3.5, 4.55, 11.05, 0.055, 0x5c6266);
  group.add(pedPole);
  const pedBox = box(0.42, 0.78, 0.24, toon(0x30363a));
  pedBox.position.set(4.55, 3.0, 11.05);
  group.add(pedBox);
  const pedFace = box(0.34, 0.7, 0.02, toon(0x101417));
  pedFace.position.set(4.55, 3.0, 10.92);
  group.add(pedFace);
  // 背面检修盖，避免近景看到一块纯黑板
  const pedBack = box(0.36, 0.68, 0.012, toon(0x4a5357));
  pedBack.position.set(4.55, 3.0, 11.178);
  group.add(pedBack);
  const pedSeam = box(0.3, 0.012, 0.008, toon(0x2c3336));
  pedSeam.position.set(4.55, 3.27, 11.186);
  group.add(pedSeam);
  for (const [bx, by] of [[-0.13, 0.27], [0.13, 0.27], [-0.13, -0.27], [0.13, -0.27]]) {
    const bolt = cyl(0.012, 0.012, 0.012, toon(0x909a9c), 8);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(4.55 + bx, 3.0 + by, 11.188);
    group.add(bolt);
  }
  const pedVent = box(0.2, 0.055, 0.006, toon(0x242b2e));
  pedVent.position.set(4.55, 2.78, 11.186);
  group.add(pedVent);
  const pedLabel = plane(0.13, 0.06, new THREE.MeshBasicMaterial({ map: tex.notices[2] }));
  pedLabel.position.set(4.55, 3.02, 11.187);
  group.add(pedLabel);
  const walkIcon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.27, 0.27),
    new THREE.MeshBasicMaterial({ map: walkTex, color: 0xffffff })
  );
  walkIcon.position.set(4.55, 2.83, 10.905);
  walkIcon.rotation.y = Math.PI;
  group.add(walkIcon);
  const standIcon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.27, 0.27),
    new THREE.MeshBasicMaterial({ map: standTex, color: 0xffffff })
  );
  standIcon.position.set(4.55, 3.17, 10.905);
  standIcon.rotation.y = Math.PI;
  group.add(standIcon);

  const pedGlowRed = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex.glow, color: 0xff5040, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0,
  }));
  pedGlowRed.scale.set(0.9, 0.9, 1);
  pedGlowRed.position.set(4.55, 3.17, 10.8);
  group.add(pedGlowRed);
  const pedGlowGreen = pedGlowRed.clone();
  pedGlowGreen.material = pedGlowRed.material.clone();
  pedGlowGreen.material.color.setHex(0x55ffb0);
  pedGlowGreen.position.y = 2.83;
  group.add(pedGlowGreen);

  // 远处车辆信号（路口远端，面向路口）
  const carPole = signPost(5.6, 11.35, 11.28, 0.065, 0x5c6266);
  group.add(carPole);
  const arm = box(1.4, 0.08, 0.08, toon(0x555b5e));
  arm.position.set(10.4, 5.3, 10.8);
  group.add(arm);
  const head = new THREE.Group();
  head.position.set(9.55, 5.18, 10.72);
  head.rotation.y = -Math.PI / 4;
  const headBox = box(1.18, 0.42, 0.24, toon(0x2b3033));
  head.add(headBox);
  const lampDefs = [
    [0xff4a3c, -0.4], [0xffc23c, 0], [0x5effa8, 0.4],
  ];
  const carLamps = [];
  const carGlows = [];
  for (const [color, ox] of lampDefs) {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.13, 16),
      new THREE.MeshBasicMaterial({ color })
    );
    lamp.position.set(ox, 0, 0.13);
    head.add(lamp);
    carLamps.push(lamp);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0,
    }));
    gl.scale.set(0.7, 0.7, 1);
    gl.position.set(ox, 0, 0.25);
    head.add(gl);
    carGlows.push(gl);
  }
  group.add(head);

  const baseColors = [0xff4a3c, 0xffc23c, 0x5effa8];
  const dimColors = [0x3a1210, 0x3a2c0c, 0x0e3524];
  const update = (t) => {
    const phase = (t + 4) % 24;
    // 车辆：绿 0-9，黄 9-11.5，红 11.5-24
    let carIdx = 2;
    if (phase < 9) carIdx = 2;
    else if (phase < 11.5) carIdx = 1;
    else carIdx = 0;
    for (let i = 0; i < 3; i++) {
      const on = i === carIdx;
      carLamps[i].material.color.setHex(on ? baseColors[i] : dimColors[i]);
      carGlows[i].material.opacity = on ? (0.5 + Math.sin(t * 3) * 0.04) : 0;
    }
    // 行人：车辆红灯时绿灯，绿灯闪烁收尾
    const walkPhase = phase > 12 && phase < 22;
    const flash = phase > 19;
    const walkOn = walkPhase && (!flash || Math.floor(t * 4) % 2 === 0);
    walkIcon.visible = walkOn;
    standIcon.visible = !walkOn;
    pedGlowGreen.material.opacity = walkOn ? 0.45 : 0;
    pedGlowRed.material.opacity = walkOn ? 0 : 0.35;
  };
  update(0);

  group.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  details.add(group);
  return { group, update, carLamps, walkIcon, standIcon };
}
