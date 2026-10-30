import * as THREE from 'three';
import { blobGeometry, mulberry32 } from './core.js';
import { HALF } from './layout.js';

// ──────────────────────────────────────────────────────────────
//  平面反射：湿润路面 / 积水
// ──────────────────────────────────────────────────────────────
export class PlanarReflection {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.planeY = 0.02;

    this.rt = new THREE.WebGLRenderTarget(640, 640, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
    });
    this.rt.texture.colorSpace = THREE.NoColorSpace;

    this.textureMatrix = new THREE.Matrix4();
    this.virtualCamera = new THREE.PerspectiveCamera();
    this.hidden = [];

    this._normal = new THREE.Vector3(0, 1, 0);
    this._plane = new THREE.Vector3(0, this.planeY, 0);
    this._view = new THREE.Vector3();
    this._target = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
    this._rot = new THREE.Matrix4();
    this._camPos = new THREE.Vector3();
    this._oldColor = new THREE.Color();
    this._oldAlpha = 1;
  }

  hide(obj) {
    if (obj) this.hidden.push(obj);
    return obj;
  }

  update() {
    const camera = this.camera;
    const vcam = this.virtualCamera;

    this._camPos.setFromMatrixPosition(camera.matrixWorld);
    this._view.copy(this._plane).sub(this._camPos);
    if (this._view.dot(this._normal) > 0) return;

    this._view.reflect(this._normal).negate().add(this._plane);

    this._rot.extractRotation(camera.matrixWorld);
    this._lookAt.set(0, 0, -1).applyMatrix4(this._rot).add(this._camPos);
    this._target.copy(this._plane).sub(this._lookAt);
    this._target.reflect(this._normal).negate().add(this._plane);

    vcam.position.copy(this._view);
    vcam.up.set(0, 1, 0).applyMatrix4(this._rot);
    vcam.up.reflect(this._normal);
    vcam.lookAt(this._target);
    vcam.near = camera.near;
    vcam.far = camera.far;
    vcam.updateMatrixWorld();
    vcam.projectionMatrix.copy(camera.projectionMatrix);

    this.textureMatrix.set(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0.0, 0.0, 0.0, 1.0
    );
    this.textureMatrix.multiply(vcam.projectionMatrix);
    this.textureMatrix.multiply(vcam.matrixWorldInverse);

    const r = this.renderer;
    const prevRT = r.getRenderTarget();
    r.getClearColor(this._oldColor);
    this._oldAlpha = r.getClearAlpha();

    const vis = this.hidden.map((o) => o.visible);
    this.hidden.forEach((o) => { o.visible = false; });
    r.setClearColor(0x070b12, 1);
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(this.scene, vcam);
    r.setRenderTarget(prevRT);
    r.setClearColor(this._oldColor, this._oldAlpha);
    this.hidden.forEach((o, i) => { o.visible = vis[i]; });
  }
}

// ──────────────────────────────────────────────────────────────
//  着色器片段
// ──────────────────────────────────────────────────────────────
const NOISE_GLSL = /* glsl */`
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm2(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      s += a * vnoise(p);
      p = p * 2.03 + 1.7;
      a *= 0.5;
    }
    return s;
  }
  float rippleHeight(vec2 p, float t, float scale) {
    float h = 0.0;
    for (int layer = 0; layer < 2; layer++) {
      float sc = scale * (layer == 0 ? 1.0 : 1.93);
      vec2 gp = p * sc + float(layer) * 17.0;
      vec2 id = floor(gp);
      vec2 f = fract(gp);
      float rnd = hash21(id + float(layer) * 13.7);
      float tt = fract(t * (0.52 + rnd * 0.15) + rnd * 9.0);
      vec2 c = vec2(hash21(id + 3.1), hash21(id + 7.7)) * 0.55 + 0.22;
      float d = length(f - c);
      float rad = tt * 0.52;
      float ring = smoothstep(0.055, 0.0, abs(d - rad)) * (1.0 - tt);
      h += ring * (layer == 0 ? 0.012 : 0.006);
    }
    return h;
  }
`;

const WET_VERT = /* glsl */`
  uniform mat4 uTextureMatrix;
  varying vec3 vWorld;
  varying vec2 vUv;
  varying vec4 vRefl;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vUv = uv;
    vRefl = uTextureMatrix * world;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

function makeWetUniforms(reflection) {
  return {
    uTime: { value: 0 },
    uReflect: { value: reflection.rt.texture },
    uTextureMatrix: { value: reflection.textureMatrix },
    uCamPos: { value: new THREE.Vector3() },
  };
}

export function createGroundMaterial(reflection) {
  const uniforms = makeWetUniforms(reflection);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: WET_VERT,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime;
      uniform sampler2D uReflect;
      uniform vec3 uCamPos;
      varying vec3 vWorld;
      varying vec2 vUv;
      varying vec4 vRefl;
      ${NOISE_GLSL}

      void main() {
        vec2 p = vWorld.xz;
        float grain = fbm2(p * 2.6 + 7.0);
        float broad = fbm2(p * 0.55);
        vec3 asphalt = mix(vec3(0.020, 0.024, 0.034), vec3(0.062, 0.069, 0.086), grain * 0.85);
        asphalt = mix(asphalt, vec3(0.030, 0.033, 0.041), broad * 0.6);
        // 细碎的石子反光
        float grit = smoothstep(0.72, 0.98, vnoise(p * 55.0));
        asphalt += vec3(0.025, 0.028, 0.03) * grit;

        float puddle = smoothstep(0.44, 0.55, broad + fbm2(p * 0.85 + 21.0) * 0.22);
        puddle *= 1.0 - smoothstep(9.0, 12.0, max(abs(p.x), abs(p.y)));
        float wet = 0.35 + puddle * 0.65;

        // 涟漪法线扰动
        float e = 0.025;
        float h0 = rippleHeight(p, uTime, 1.15);
        float hx = rippleHeight(p + vec2(e, 0.0), uTime, 1.15);
        float hz = rippleHeight(p + vec2(0.0, e), uTime, 1.15);
        vec2 grad = vec2(hx - h0, hz - h0) / e;
        float wind = fbm2(p * 2.2 + vec2(uTime * 0.08, -uTime * 0.05));
        vec2 duv = grad * 0.016 + (vec2(wind, fbm2(p * 2.2 + 9.0)) - 0.5) * 0.0035;

        vec2 ruv = vRefl.xy / vRefl.w;
        duv *= 0.7 + puddle * 0.6;
        vec3 refl = texture2D(uReflect, ruv + duv).rgb * 0.5
                  + texture2D(uReflect, ruv + duv + vec2(0.0016, 0.0004)).rgb * 0.28
                  + texture2D(uReflect, ruv + duv + vec2(-0.0012, 0.0018)).rgb * 0.22;

        vec3 V = normalize(uCamPos - vWorld);
        float fres = 0.38 + 0.62 * pow(1.0 - clamp(V.y, 0.0, 1.0), 2.2);
        vec3 col = asphalt;
        col *= mix(1.0, 0.62, puddle);
        col += refl * (0.26 + puddle * 0.66) * fres * vec3(0.82, 0.9, 1.0);
        col += vec3(0.09, 0.11, 0.13) * pow(1.0 - V.y, 4.0) * (0.3 + puddle * 0.7);
        // 涟漪高光
        float glint = smoothstep(0.004, 0.018, h0) * (0.6 + puddle);
        col += vec3(0.20, 0.24, 0.27) * glint * 0.8;
        // 店铺暖光洒在地上
        float warm = smoothstep(7.2, 3.4, abs(p.y - 4.8)) * smoothstep(8.2, 2.0, abs(p.x - 0.2));
        col += vec3(0.075, 0.042, 0.012) * warm * (0.28 + grain * 0.5) * (0.4 + puddle * 0.6);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  return { material: mat, uniforms };
}

export function createPuddleMaterial(reflection) {
  const uniforms = makeWetUniforms(reflection);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    vertexShader: WET_VERT,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime;
      uniform sampler2D uReflect;
      uniform vec3 uCamPos;
      varying vec3 vWorld;
      varying vec2 vUv;
      varying vec4 vRefl;
      ${NOISE_GLSL}

      void main() {
        vec2 p = vWorld.xz;
        float e = 0.02;
        float h0 = rippleHeight(p, uTime, 1.6);
        float hx = rippleHeight(p + vec2(e, 0.0), uTime, 1.6);
        float hz = rippleHeight(p + vec2(0.0, e), uTime, 1.6);
        vec2 grad = vec2(hx - h0, hz - h0) / e;
        vec2 duv = grad * 0.012 + (vec2(fbm2(p * 3.0 + uTime * 0.1), fbm2(p * 3.0 + 4.0)) - 0.5) * 0.002;
        vec2 ruv = vRefl.xy / vRefl.w;
        vec3 refl = texture2D(uReflect, ruv + duv).rgb * 0.55
                  + texture2D(uReflect, ruv + duv + vec2(0.002, 0.0)).rgb * 0.25
                  + texture2D(uReflect, ruv + duv + vec2(0.0, 0.002)).rgb * 0.20;
        vec3 V = normalize(uCamPos - vWorld);
        float fres = 0.45 + 0.55 * pow(1.0 - clamp(V.y, 0.0, 1.0), 2.0);
        vec3 col = vec3(0.012, 0.020, 0.028) + refl * 0.62 * fres;
        col += vec3(0.14, 0.17, 0.19) * smoothstep(0.006, 0.02, h0) * 0.55;
        float d = length(vUv - 0.5) * 2.0;
        float alpha = smoothstep(0.98, 0.58, d) * 0.82;
        float wetEdge = smoothstep(0.5, 0.95, fbm2(p * 3.7));
        alpha *= 0.75 + wetEdge * 0.25;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  return { material: mat, uniforms };
}

// ──────────────────────────────────────────────────────────────
//  地面与积水组
// ──────────────────────────────────────────────────────────────
export function buildWetGround(reflection) {
  const group = new THREE.Group();
  group.name = 'wetGround';

  const gm = createGroundMaterial(reflection);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 - 0.7, HALF * 2 - 0.7), gm.material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.006;
  ground.receiveShadow = true;
  group.add(ground);

  const pm = createPuddleMaterial(reflection);
  const puddles = [];
  const defs = [
    // [x, z, radius, y, seed]
    [-3.4, 4.9, 1.25, 0.126, 2],
    [3.65, 4.25, 0.95, 0.126, 5],
    [1.42, 4.98, 1.02, 0.126, 36],
    [5.08, 5.55, 0.6, 0.126, 38],
    [5.45, 2.3, 0.85, 0.126, 8],
    [5.6, -0.9, 0.8, 0.126, 11],
    [-7.2, 1.6, 1.0, 0.126, 15],
    [-7.1, -1.4, 0.8, 0.126, 18],
    [-4.5, -5.3, 1.5, 0.02, 22],
    [2.2, -5.5, 1.1, 0.02, 26],
    [8.9, 8.4, 1.8, 0.012, 29],
    [2.4, 7.6, 1.2, 0.012, 33],
  ];
  for (const [x, z, r, y, seed] of defs) {
    const geo = blobGeometry(r, seed, 0.3);
    const mesh = new THREE.Mesh(geo, pm.material);
    mesh.rotation.y = (seed * 1.7) % (Math.PI * 2);
    mesh.position.set(x, y, z);
    mesh.renderOrder = 2;
    group.add(mesh);
    puddles.push(mesh);
  }

  const update = (t, camera) => {
    gm.uniforms.uTime.value = t;
    pm.uniforms.uTime.value = t;
    gm.uniforms.uCamPos.value.copy(camera.position);
    pm.uniforms.uCamPos.value.copy(camera.position);
  };

  return { group, ground, puddles, update };
}
