import * as THREE from 'three';

// ──────────────────────────────────────────────────────────────
//  调色板：深夜蓝 + 暖色便利店
// ──────────────────────────────────────────────────────────────
export const M = {
  night: 0x0a0e17,
  line: 0x080b12,
  asphalt: 0x1b2230,
  sidewalk: 0x5d5f66,
  sidewalkDark: 0x45474e,
  curb: 0x77787c,
  wallCream: 0xd8cfb8,
  wallWhite: 0xe7dfcc,
  wallShadow: 0xa69f8e,
  green: 0x14574f,
  greenDeep: 0x0d3b37,
  greenLight: 0x2c7a6c,
  cream: 0xf4e8cd,
  warm: 0xffd9a0,
  warmDeep: 0xffb45e,
  red: 0xc14b3f,
  redDeep: 0x7d2c30,
  rust: 0x7a4a3b,
  brick: 0x5b3f39,
  brown: 0x4a3730,
  wood: 0x64483a,
  metal: 0x4c5663,
  metalLight: 0x8a949e,
  steel: 0xb8c1c9,
  glass: 0x9fd3da,
  interior: 0xfff2d4,
  interiorWall: 0xf1e5c9,
  shelf: 0xe8dfcb,
  productA: 0xff6b6b,
  productB: 0xffc857,
  productC: 0x5ec8d8,
  productD: 0x9b8cff,
  productE: 0x7bd389,
  neonPink: 0xff7fa3,
  neonCyan: 0x8ef5e6,
  leaf: 0x2f5142,
  leafDark: 0x21382f,
  pole: 0x6e6b66,
  poleDark: 0x474542,
  white: 0xf5f1e4,
};

// ──────────────────────────────────────────────────────────────
//  三渲二：阶梯渐变贴图
// ──────────────────────────────────────────────────────────────
const gradientData = new Uint8Array([32, 105, 182, 236, 255]);
export const gradientMap = new THREE.DataTexture(
  gradientData, gradientData.length, 1, THREE.RedFormat
);
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.generateMipmaps = false;
gradientMap.needsUpdate = true;

const _materials = new Map();

function matKey(color, opts) {
  return color + '|' + JSON.stringify(opts);
}

/** 卡通材质（默认保留共享缓存） */
export function toon(color, opts = {}) {
  const key = matKey(color, opts);
  if (!opts.noCache && _materials.has(key)) return _materials.get(key);
  const m = new THREE.MeshToonMaterial({
    color,
    gradientMap,
    ...opts,
  });
  if (!opts.noCache) _materials.set(key, m);
  return m;
}

/** 纯色不受光材质 */
export function flat(color, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, ...opts });
}

// ──────────────────────────────────────────────────────────────
//  轮廓线：反向外壳，沿法线外扩
// ──────────────────────────────────────────────────────────────
const outlineVert = /* glsl */`
  uniform float uThick;
  void main() {
    vec3 p = position + normal * uThick;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const outlineFrag = /* glsl */`
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;
const _outlineMats = new Map();

function outlineMaterial(thickness, color) {
  const key = thickness.toFixed(4) + ':' + color;
  if (_outlineMats.has(key)) return _outlineMats.get(key);
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uThick: { value: thickness * 3.0 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: outlineVert,
    fragmentShader: outlineFrag,
    side: THREE.BackSide,
    fog: false,
  });
  _outlineMats.set(key, m);
  return m;
}

/** 给网格添加手绘感轮廓（作为子对象） */
export function addOutline(mesh, thickness = 0.018, color = M.line) {
  if (!mesh || mesh.userData.noOutline) return mesh;
  const hull = new THREE.Mesh(mesh.geometry, outlineMaterial(thickness, color));
  hull.name = 'outline';
  hull.castShadow = false;
  hull.receiveShadow = false;
  hull.userData.isOutline = true;
  mesh.add(hull);
  return mesh;
}

// ──────────────────────────────────────────────────────────────
//  几何 / 摆放小工具
// ──────────────────────────────────────────────────────────────
export function box(w, h, d, material, outline = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  if (outline) addOutline(m, outline);
  return m;
}

export function cyl(rTop, rBottom, h, material, seg = 12, outline = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), material);
  if (outline) addOutline(m, outline);
  return m;
}

export function place(parent, obj, x = 0, y = 0, z = 0, ry = 0) {
  obj.position.set(x, y, z);
  obj.rotation.y = ry;
  parent.add(obj);
  return obj;
}

export function shadow(root, cast = true, receive = true) {
  root.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
  return root;
}

export function plane(w, h, material) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
}

/** 两点之间的圆柱（管、车架、线缆） */
export function tube(a, b, radius, material, radialSeg = 6, outline = 0) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, radialSeg), material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  if (outline) addOutline(mesh, outline);
  return mesh;
}

/** 下垂电线 */
export function sagWire(a, b, sag, radius, material, seg = 22) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y -= sag * 4 * t * (1 - t);
    pts.push(p);
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, seg * 2, radius, 4, false), material);
}

/** 不规则的积水形状（XZ 平面） */
export function blobGeometry(radius = 1, seed = 1, irregular = 0.28, segments = 40) {
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const n = 1
      + Math.sin(a * 3 + seed * 2.1) * irregular * 0.6
      + Math.sin(a * 5 - seed * 1.7) * irregular * 0.35
      + Math.sin(a * 9 + seed) * irregular * 0.15;
    const x = Math.cos(a) * radius * n;
    const z = Math.sin(a) * radius * n;
    pos.push(x, 0, z);
    uv.push(x * 0.5 / radius + 0.5, z * 0.5 / radius + 0.5);
    if (i < segments) {
      idx.push(0, i + 1, i);
    }
  }
  pos.unshift(0, 0, 0);
  uv.unshift(0.5, 0.5);
  // 上面构建索引时中心点为 0，环从 1 开始，需要修正
  idx.length = 0;
  for (let i = 1; i <= segments; i++) {
    idx.push(0, i + 1, i);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ──────────────────────────────────────────────────────────────
//  可复现随机
// ──────────────────────────────────────────────────────────────
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rng = mulberry32(20261018);
export const rand = (a, b) => a + (b - a) * rng();
export const pick = (arr) => arr[Math.floor(rng() * arr.length)];
export const chance = (p) => rng() < p;

// ──────────────────────────────────────────────────────────────
//  Canvas 贴图
// ──────────────────────────────────────────────────────────────
export const JP = '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP","Helvetica Neue",sans-serif';
export const EN = '"Avenir Next","Futura","Helvetica Neue",Arial,sans-serif';

export function canvasTexture(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.wrapS = opts.wrapS ?? THREE.ClampToEdgeWrapping;
  tex.wrapT = opts.wrapT ?? THREE.ClampToEdgeWrapping;
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function starPath(ctx, cx, cy, outer, inner, points = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i / (points * 2)) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function setFont(ctx, size, weight = 'bold', family = JP) {
  ctx.font = `${weight} ${size}px ${family}`;
}

export function fitText(ctx, text, maxWidth, size, family = JP, weight = 'bold') {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    s -= 2;
  } while (s > 8);
  return s;
}
