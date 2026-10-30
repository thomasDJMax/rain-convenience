import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createTextures } from './textures.js';
import { buildWorld } from './world.js';
import { buildStore } from './store.js';
import { buildProps } from './props.js';
import { buildRain } from './rain.js';
import { PlanarReflection, buildWetGround } from './water.js';

// ══════════════════════════════════════════════════════════════
//  星マート ─ 雨夜の街角 / 微缩模型
// ══════════════════════════════════════════════════════════════

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.85));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a111b, 52, 118);

// ── 背景：固定的深蓝夜色渐变（屏幕空间） ─────────────────────
function backdropTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, '#04060b');
  g.addColorStop(0.28, '#080d17');
  g.addColorStop(0.52, '#101a2b');
  g.addColorStop(0.68, '#172235');
  g.addColorStop(0.84, '#101724');
  g.addColorStop(1, '#06090f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);

  const warm = ctx.createRadialGradient(500, 690, 20, 500, 690, 520);
  warm.addColorStop(0, 'rgba(255,190,130,0.10)');
  warm.addColorStop(0.45, 'rgba(230,160,105,0.045)');
  warm.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, 1024, 1024);

  const cool = ctx.createRadialGradient(790, 240, 10, 790, 240, 480);
  cool.addColorStop(0, 'rgba(92,142,190,0.09)');
  cool.addColorStop(0.5, 'rgba(60,100,145,0.035)');
  cool.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, 1024, 1024);

  const vig = ctx.createRadialGradient(512, 520, 250, 512, 520, 760);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.7, 'rgba(0,0,0,0.22)');
  vig.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 2600; i++) {
    const a = Math.random() * 0.035;
    ctx.fillStyle = `rgba(200,215,235,${a})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1.2, 1.2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
scene.background = backdropTexture();

// ── 底座下方的柔和落影 ───────────────────────────────────────
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.34)');
  g.addColorStop(0.76, 'rgba(0,0,0,0.1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(42, 42),
  new THREE.MeshBasicMaterial({
    map: shadowTexture(), transparent: true, depthWrite: false, color: 0x000000,
  })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.set(0, -1.05, 0);
shadowPlane.renderOrder = -1;
scene.add(shadowPlane);

// ── 相机与控制 ───────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  window.innerWidth / window.innerHeight < 1.05 ? 46 : 34,
  window.innerWidth / window.innerHeight,
  0.1,
  160
);
camera.position.set(22.5, 13.8, 30.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.0, 0.2);
controls.enableDamping = true;
controls.dampingFactor = 0.068;
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.82;
controls.enablePan = false;
controls.minDistance = 13;
controls.maxDistance = 150;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = Math.PI * 0.487;
controls.update();

// ── 灯光 ─────────────────────────────────────────────────────
const hemi = new THREE.HemisphereLight(0x35506d, 0x0a0d12, 0.72);
scene.add(hemi);

const moon = new THREE.DirectionalLight(0xa6c9ec, 1.75);
moon.position.set(-18, 26, 14);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -17;
moon.shadow.camera.right = 17;
moon.shadow.camera.top = 17;
moon.shadow.camera.bottom = -17;
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 70;
moon.shadow.bias = -0.00035;
moon.shadow.normalBias = 0.024;
scene.add(moon);
scene.add(moon.target);

const rim = new THREE.DirectionalLight(0x6f93bd, 0.62);
rim.position.set(16, 10, -18);
scene.add(rim);

const coolFill = new THREE.DirectionalLight(0x5a7fa6, 0.34);
coolFill.position.set(-10, 7, 22);
scene.add(coolFill);

const streetWarm = new THREE.PointLight(0xffc98f, 7.5, 17, 2);
streetWarm.position.set(0.6, 2.9, 7.4);
scene.add(streetWarm);

// ── 场景搭建 ─────────────────────────────────────────────────
const tex = createTextures();

const world = buildWorld(tex);
scene.add(world.group);

const store = buildStore(tex);
scene.add(store.group);

// 仅作用于室内的暖色环境补光：把室内网格放到 layer 1，避免照亮室外
const INSIDE_LAYER = 1;
store.inside.traverse((o) => o.layers.enable(INSIDE_LAYER));
const insideFill = new THREE.AmbientLight(0xffb877, 0.75);
insideFill.layers.set(INSIDE_LAYER);
scene.add(insideFill);

const props = buildProps(tex);
scene.add(props.group);

const rain = buildRain(tex);
scene.add(rain.group);

// ── 湿润地面与平面反射 ───────────────────────────────────────
const reflection = new PlanarReflection(renderer, scene, camera);
const wet = buildWetGround(reflection);
scene.add(wet.group);

reflection.hide(world.hide[0]);
reflection.hide(world.hide[1]);
reflection.hide(wet.group);
reflection.hide(rain.group);
reflection.hide(shadowPlane);
for (const g of store.inside.children) {
  // 室内陈列仍参与反射（透过玻璃），这里不做处理
  void g;
}

// ── 后期 ─────────────────────────────────────────────────────
const composerTarget = new THREE.WebGLRenderTarget(
  Math.max(2, window.innerWidth), Math.max(2, window.innerHeight),
  { type: THREE.HalfFloatType, samples: 4 }
);
const composer = new EffectComposer(renderer, composerTarget);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.85));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3, 0.55, 0.86
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ── 视点预设（仅供调试/截图，不显示 UI） ─────────────────────
const VIEWS = {
  hero: { pos: [-13.0, 11.8, 31.2], target: [-0.8, 0.72, 0.5] },
  front: { pos: [1.5, 9.0, 33.0], target: [0, 1.6, 1.0] },
  corner: { pos: [27.0, 10.5, 18.0], target: [1.0, 1.4, 1.0] },
  entrance: { pos: [2.4, 3.2, 12.2], target: [1.8, 1.5, 3.8] },
  top: { pos: [0.5, 40, 0.5], target: [0, 0, 0] },
  alley: { pos: [-13.5, 7.5, 8.5], target: [-4.0, 2.0, -2.0] },
};
function setView(name) {
  const v = VIEWS[name] || VIEWS.hero;
  // 窄屏时把机位向后拉，保证完整正方形底座入画
  const aspect = camera.aspect || window.innerWidth / window.innerHeight;
  const k = 1 + Math.max(0, 1.35 - aspect) * 0.8;
  const tx = v.target[0], ty = v.target[1], tz = v.target[2];
  camera.position.set(
    tx + (v.pos[0] - tx) * k,
    ty + (v.pos[1] - ty) * k,
    tz + (v.pos[2] - tz) * k
  );
  controls.target.set(tx, ty, tz);
  controls.update();
}
window.__RAIN__ = {
  renderer, scene, camera, controls, composer, setView, views: VIEWS,
  ready: false, t: 0,
};

// ── 尺寸 ─────────────────────────────────────────────────────
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  camera.aspect = aspect;
  camera.fov = aspect < 1.05 ? 46 : 34;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.85));
  renderer.setSize(w, h);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.85));
  composer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// ── 主循环 ───────────────────────────────────────────────────
const clock = new THREE.Clock();
let elapsed = 0;
let frames = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  window.__RAIN__.t = elapsed;

  controls.update();
  world.update(elapsed, dt);
  store.update(elapsed, dt);
  props.update(elapsed, dt);
  rain.update(elapsed, dt);
  wet.update(elapsed, camera);
  reflection.update();

  composer.render();

  frames++;
  if (frames === 2) {
    canvas.classList.add('ready');
    window.__RAIN__.ready = true;
  }
}
onResize();
setView('hero');
animate();
