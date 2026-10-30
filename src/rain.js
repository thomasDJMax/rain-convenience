import * as THREE from 'three';
import { rand } from './core.js';

// ══════════════════════════════════════════════════════════════
//  雨：分层雨丝、近景雨柱、地面溅水、檐口滴水、低空水雾
// ══════════════════════════════════════════════════════════════

const WALK_RECTS = [
  [-11.6, 6.2, 3.4, 6.4],     // 店前
  [4.2, 6.2, -4.2, 3.4],      // 右侧
  [-11.9, 11.9, 10.8, 11.95], // 主路对面
  [10.8, 11.95, -11.6, 10.8], // 侧路对面
  [-8.4, -6.2, -7.6, 3.4],    // 小巷
];
const ROAD_RECTS = [
  [-11.99, 11.99, 6.4, 10.8],
  [6.2, 10.8, -11.99, 11.99],
];

function pickStreetPoint() {
  const r = Math.random();
  if (r < 0.62) {
    const q = ROAD_RECTS[Math.random() < 0.72 ? 0 : 1];
    return [rand(q[0], q[1]), rand(q[2], q[3]), 0.005 + rand(0, 0.012)];
  }
  if (r < 0.86) {
    const q = WALK_RECTS[Math.floor(Math.random() * 3)];
    return [rand(q[0], q[1]), rand(q[2], q[3]), 0.128 + rand(0, 0.006)];
  }
  const q = WALK_RECTS[Math.random() < 0.7 ? 2 : 3];
  return [rand(q[0], q[1]), rand(q[2], q[3]), 0.128 + rand(0, 0.006)];
}

function pickRainPoint() {
  // 只在街道/人行道/小巷上方落雨，避免雨丝穿过店内
  const r = Math.random();
  if (r < 0.66) {
    const q = ROAD_RECTS[Math.random() < 0.7 ? 0 : 1];
    return [rand(q[0], q[1]), rand(q[2], q[3])];
  }
  if (r < 0.9) {
    const q = WALK_RECTS[Math.floor(Math.random() * 3)];
    return [rand(q[0], q[1]), rand(q[2], q[3])];
  }
  const q = WALK_RECTS[Math.random() < 0.6 ? 2 : 3];
  return [rand(q[0], q[1]), rand(q[2], q[3])];
}

function groundAt(x, z) {
  for (const q of WALK_RECTS) {
    if (x > q[0] && x < q[1] && z > q[2] && z < q[3]) return 0.13;
  }
  return 0.008;
}

export function buildRain(tex) {
  const group = new THREE.Group();
  group.name = 'rain';

  // ── 雨丝（着色器驱动的 LineSegments） ─────────────────────
  const pickSkyPoint = () => [rand(-18, 18), rand(-18, 18)];
  function rainLayer(count, color, opacity, minLen, maxLen, speedMin, speedMax, opts = {}) {
    const { baseY = 0.03, span = 14, pick = pickRainPoint } = opts;
    const pos = new Float32Array(count * 2 * 3);
    const seed = new Float32Array(count * 2 * 2);
    const phase = new Float32Array(count * 2);
    const speed = new Float32Array(count * 2);
    const len = new Float32Array(count * 2);
    const tip = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const [x, z] = pick();
      const s = rand(speedMin, speedMax);
      const l = rand(minLen, maxLen);
      const ph = rand(0, span);
      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k;
        seed[j * 2] = x;
        seed[j * 2 + 1] = z;
        phase[j] = ph;
        speed[j] = s;
        len[j] = l;
        tip[j] = k;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 2));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aLen', new THREE.BufferAttribute(len, 1));
    geo.setAttribute('aTip', new THREE.BufferAttribute(tip, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseY: { value: baseY },
        uSpan: { value: span },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform float uBaseY;
        uniform float uSpan;
        attribute vec2 aSeed;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aLen;
        attribute float aTip;
        varying float vY;
        void main() {
          float y = mod(aPhase - uTime * aSpeed, uSpan);
          vec3 p;
          p.x = aSeed.x + aTip * 0.16;
          p.z = aSeed.y + aTip * 0.055;
          p.y = uBaseY + y - aTip * aLen;
          vY = p.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vY;
        void main() {
          float edge = smoothstep(0.0, 0.8, vY);
          gl_FragColor = vec4(uColor, uOpacity * edge);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const lines = new THREE.LineSegments(geo, mat);
    lines.frustumCulled = false;
    lines.renderOrder = 7;
    group.add(lines);
    return mat;
  }
  const farRain = rainLayer(1150, 0x9fb9c9, 0.13, 0.22, 0.5, 10, 14);
  const nearRain = rainLayer(480, 0xd3eaf3, 0.24, 0.32, 0.7, 11.5, 15.5);
  // 高层天空雨：只落在 7.55m 以上，填满窄屏的黑色天空，也不会穿进店内
  const skyRain = rainLayer(1800, 0x9db6c6, 0.13, 0.26, 0.58, 9, 13, {
    baseY: 7.55, span: 8.2, pick: pickSkyPoint,
  });

  // ── 近景雨柱（有体积的细圆柱） ─────────────────────────────
  const NEAR = 150;
  const cylGeo = new THREE.CylinderGeometry(0.0045, 0.006, 0.4, 4, 1, true);
  const cylMat = new THREE.MeshBasicMaterial({
    color: 0xcfe8f2, transparent: true, opacity: 0.12, depthWrite: false,
  });
  const drops = new THREE.InstancedMesh(cylGeo, cylMat, NEAR);
  drops.frustumCulled = false;
  drops.renderOrder = 7;
  group.add(drops);
  const dropState = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < NEAR; i++) {
    const [x, z] = pickRainPoint();
    dropState.push({
      x, z, y: rand(0.3, 11.5),
      v: rand(10, 15), s: rand(0.7, 1.8),
    });
  }
  function setDrops() {
    for (let i = 0; i < NEAR; i++) {
      const d = dropState[i];
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, d.s, 1);
      dummy.rotation.set(0, 0, 0.06);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
  }
  setDrops();

  // ── 溅水环 ─────────────────────────────────────────────────
  const SPLASH = 38;
  const ringGeo = new THREE.RingGeometry(0.045, 0.07, 14, 1);
  const splashes = [];
  for (let i = 0; i < SPLASH; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xcfe7ec, transparent: true, opacity: 0,
      depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 3;
    group.add(mesh);
    const [x, z, y] = pickStreetPoint();
    mesh.position.set(x, y, z);
    splashes.push({
      mesh, mat, life: rand(0, 1), dur: rand(0.55, 1.05), delay: rand(0, 0.6),
      x, z, y,
    });
  }
  function respawnSplash(s) {
    const [x, z, y] = pickStreetPoint();
    s.x = x; s.z = z; s.y = y;
    s.life = 0;
    s.dur = rand(0.5, 1.0);
    s.delay = rand(0, 0.45);
    s.mesh.position.set(x, y, z);
    s.mesh.visible = false;
  }
  function burst(x, z, y = 0) {
    const s = splashes[Math.floor(Math.random() * splashes.length)];
    s.x = x; s.z = z; s.y = y; s.life = 0; s.dur = rand(0.45, 0.7); s.delay = 0;
    s.mesh.position.set(x, y, z);
  }

  // ── 檐口滴水 ───────────────────────────────────────────────
  const DRIPS = [
    { x: -1.15, z: 4.66, top: 3.0 },
    { x: 0.15, z: 4.66, top: 3.0 },
    { x: 1.45, z: 4.66, top: 3.0 },
    { x: 2.75, z: 4.66, top: 3.0 },
    { x: 4.0, z: 4.66, top: 3.0 },
    { x: 4.34, z: 0.55, top: 4.32 },
    { x: 4.34, z: -2.2, top: 4.32 },
    { x: -6.28, z: -4.25, top: 4.32 },
    { x: -8.9, z: 3.42, top: 3.15 },
  ];
  const dripMat = new THREE.MeshBasicMaterial({
    color: 0xe4f4f8, transparent: true, opacity: 0.55, depthWrite: false,
  });
  const dripGeo = new THREE.CylinderGeometry(0.008, 0.004, 1, 4);
  const drips = [];
  for (const d of DRIPS) {
    const mesh = new THREE.Mesh(dripGeo, dripMat);
    mesh.renderOrder = 7;
    group.add(mesh);
    drips.push({
      ...d, mesh, ground: groundAt(d.x, d.z),
      phase: rand(0, 1), cycle: rand(0.55, 0.95), prev: 0,
    });
  }

  // ── 低空水雾 ───────────────────────────────────────────────
  const mists = [];
  for (let i = 0; i < 7; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex.steam, color: 0x9fb7c4, transparent: true, opacity: 0,
      depthWrite: false,
    });
    const sp = new THREE.Sprite(mat);
    const [x, z] = pickRainPoint();
    sp.position.set(x, rand(0.5, 1.8), z);
    sp.scale.set(rand(2.4, 4.6), rand(1.1, 2.2), 1);
    sp.renderOrder = 8;
    group.add(sp);
    mists.push({
      sp, mat, x: sp.position.x, z: sp.position.z,
      baseY: sp.position.y, y: sp.position.y,
      phase: rand(0, 10), amp: rand(0.05, 0.14), op: rand(0.04, 0.1),
      speed: rand(0.15, 0.4),
    });
  }

  function update(t, dt) {
    farRain.uniforms.uTime.value = t;
    nearRain.uniforms.uTime.value = t;
    skyRain.uniforms.uTime.value = t;

    for (let i = 0; i < NEAR; i++) {
      const d = dropState[i];
      d.y -= d.v * dt;
      d.x -= dt * 0.5;
      if (d.y < 0.05) {
        d.y = rand(9, 12);
        const [x, z] = pickStreetPoint();
        d.x = x; d.z = z;
      }
    }
    setDrops();

    for (const s of splashes) {
      s.life += dt;
      if (s.life > s.dur + s.delay) {
        respawnSplash(s);
        continue;
      }
      if (s.life < s.delay) {
        s.mesh.visible = false;
        continue;
      }
      const p = (s.life - s.delay) / s.dur;
      s.mesh.visible = true;
      const sc = 0.38 + p * 1.0;
      s.mesh.scale.set(sc, sc, sc);
      s.mat.opacity = Math.sin(Math.min(1, p) * Math.PI) * 0.26;
    }

    for (const d of drips) {
      const local = ((t / d.cycle + d.phase) % 1);
      const falling = local < 0.72;
      if (d.prev < 0.72 && local >= 0.72) burst(d.x, d.z, d.ground);
      d.prev = local;
      if (!falling) {
        d.mesh.visible = false;
        continue;
      }
      const p = local / 0.72;
      const y = d.top - p * p * (d.top - d.ground);
      d.mesh.visible = true;
      d.mesh.position.set(d.x, y, d.z);
      const st = 0.06 + p * 0.16;
      d.mesh.scale.set(1, st, 1);
    }

    for (const m of mists) {
      m.phase += dt * m.speed;
      m.y += Math.sin(m.phase * 1.3) * dt * 0.06;
      m.sp.position.set(
        m.x + Math.sin(m.phase * 0.7) * 0.5,
        m.y + Math.sin(m.phase * 1.1) * 0.06,
        m.z + Math.cos(m.phase * 0.5) * 0.4
      );
      m.mat.opacity = m.op * (0.7 + Math.sin(m.phase * 1.7) * 0.3);
    }
  }

  return { group, update };
}
