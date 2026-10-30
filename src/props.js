import * as THREE from 'three';
import {
  toon, flat, box, cyl, plane, tube, addOutline,
  canvasTexture, rr, setFont, JP, EN, rand, M,
} from './core.js';
import { STORE, WALK, ROAD } from './layout.js';

// ══════════════════════════════════════════════════════════════
//  街道道具：自动贩卖机、自行车、伞架、垃圾桶、邮筒、配电箱、
//            路锥、A 字菜单牌、盆栽、驻轮牌
// ══════════════════════════════════════════════════════════════

export function buildProps(tex) {
  const group = new THREE.Group();
  group.name = 'props';
  const lights = [];
  const vending = [];
  const glowPlanes = [];
  const WALK_Y = 0.12;

  const metal = toon(0x8b9391);
  const chrome = toon(0xc3c8c4);
  const darkMetal = toon(0x353d3c);
  const black = toon(0x171b1b);
  const cream = toon(0xe4dac7);
  const rubber = toon(0x141818);
  const wood = toon(0x6e5137);
  const whitePaint = toon(0xd7dad2);
  const red = toon(0xb5382f);
  const orange = toon(0xd76a2c);

  // ── 局部贴图 ──────────────────────────────────────────────
  const binLabel = (title, sub) => canvasTexture(256, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f1eadb'; rr(ctx, 3, 3, w - 6, h - 6, 8); ctx.fill();
    ctx.strokeStyle = '#58625e'; ctx.lineWidth = 3;
    rr(ctx, 3, 3, w - 6, h - 6, 8); ctx.stroke();
    setFont(ctx, 30, 'bold', JP);
    ctx.fillStyle = '#33403c'; ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 48);
    setFont(ctx, 17, 'bold', JP);
    ctx.fillStyle = '#6d7772';
    ctx.fillText(sub, w / 2, 76);
    ctx.strokeStyle = '#7d8a84'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(36, 92); ctx.lineTo(w - 36, 92); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, 106, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 6, 106); ctx.lineTo(w / 2 + 6, 106); ctx.stroke();
  });

  const chalkMenu = () => canvasTexture(256, 352, (ctx, w, h) => {
    ctx.fillStyle = '#22302c'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b9a77f'; ctx.lineWidth = 4;
    rr(ctx, 8, 8, w - 16, h - 16, 4); ctx.stroke();
    setFont(ctx, 26, 'bold', JP);
    ctx.fillStyle = '#f2e6c8'; ctx.textAlign = 'center';
    ctx.fillText('本日のおすすめ', w / 2, 48);
    ctx.strokeStyle = 'rgba(242,230,200,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(30, 62); ctx.lineTo(w - 30, 62); ctx.stroke();
    const rows = [
      ['おにぎり', '100', '円'],
      ['からあげ', '180', '円'],
      ['コーヒー', '120', '円'],
      ['アイス', '150', '円'],
    ];
    ctx.textAlign = 'left';
    rows.forEach((r, i) => {
      const y = 104 + i * 52;
      setFont(ctx, 19, 'bold', JP);
      ctx.fillStyle = '#e9ddc2';
      ctx.fillText(r[0], 26, y);
      setFont(ctx, 24, 'bold', EN);
      ctx.fillStyle = '#f0c96f';
      ctx.fillText(r[1], 168, y);
      setFont(ctx, 15, 'normal', JP);
      ctx.fillStyle = '#d9ccae';
      ctx.fillText(r[2], 220, y);
      ctx.strokeStyle = 'rgba(220,206,178,.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(24, y + 14); ctx.lineTo(w - 24, y + 14); ctx.stroke();
    });
    ctx.textAlign = 'center';
    setFont(ctx, 13, 'normal', EN);
    ctx.fillStyle = 'rgba(226,213,184,.6)';
    ctx.fillText('HOSHIKUZU MART', w / 2, 324);
    ctx.strokeStyle = 'rgba(240,201,111,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w - 34, 318, 8, 0, Math.PI * 2); ctx.stroke();
  });

  const postPlate = () => canvasTexture(128, 160, (ctx, w, h) => {
    ctx.fillStyle = '#f4efe2'; rr(ctx, 2, 2, w - 4, h - 4, 6); ctx.fill();
    ctx.strokeStyle = '#8b8574'; ctx.lineWidth = 2; rr(ctx, 2, 2, w - 4, h - 4, 6); ctx.stroke();
    ctx.textAlign = 'center';
    setFont(ctx, 54, 'bold', JP);
    ctx.fillStyle = '#a32c25';
    ctx.fillText('〒', w / 2, 62);
    setFont(ctx, 26, 'bold', JP);
    ctx.fillStyle = '#3d4744';
    ctx.fillText('郵便', w / 2, 102);
    setFont(ctx, 11, 'bold', EN);
    ctx.fillStyle = '#7e867e';
    ctx.fillText('JAPAN POST', w / 2, 126);
    ctx.fillStyle = '#a32c25'; ctx.fillRect(24, 138, w - 48, 3);
  });

  const parkingPlate = () => canvasTexture(256, 192, (ctx, w, h) => {
    ctx.fillStyle = '#e9e8dd'; rr(ctx, 2, 2, w - 4, h - 4, 6); ctx.fill();
    ctx.strokeStyle = '#36576b'; ctx.lineWidth = 5; rr(ctx, 6, 6, w - 12, h - 12, 4); ctx.stroke();
    ctx.textAlign = 'center';
    setFont(ctx, 40, 'bold', JP);
    ctx.fillStyle = '#2f5368';
    ctx.fillText('駐輪場', w / 2, 66);
    setFont(ctx, 14, 'bold', EN);
    ctx.fillStyle = '#5e7481';
    ctx.fillText('BICYCLE PARKING', w / 2, 92);
    // 自行车图标
    ctx.strokeStyle = '#2f5368'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(84, 140, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(172, 140, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(84, 140); ctx.lineTo(110, 112); ctx.lineTo(146, 112);
    ctx.lineTo(172, 140); ctx.moveTo(110, 112); ctx.lineTo(128, 140); ctx.lineTo(146, 112);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(128, 140); ctx.lineTo(128, 92); ctx.lineTo(146, 92); ctx.stroke();
  });

  const warningLabel = () => canvasTexture(192, 128, (ctx, w, h) => {
    ctx.fillStyle = '#d8b23c'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2a2a24';
    for (let i = -h; i < w; i += 26) {
      ctx.save(); ctx.translate(i, 0); ctx.rotate(-0.42);
      ctx.fillRect(0, -20, 10, h + 60); ctx.restore();
    }
    ctx.fillStyle = '#d8b23c'; ctx.fillRect(12, 30, w - 24, h - 56);
    ctx.textAlign = 'center';
    setFont(ctx, 22, 'bold', JP); ctx.fillStyle = '#2a2a24';
    ctx.fillText('高圧危険', w / 2, 68);
    setFont(ctx, 11, 'bold', EN);
    ctx.fillText('HIGH VOLTAGE', w / 2, 90);
  });

  // ═══════════════════════════════════════════════════════════
  //  自动贩卖机
  // ═══════════════════════════════════════════════════════════
  function buildVending(x, z, variant, ry = 0) {
    const g = new THREE.Group();
    g.position.set(x, WALK_Y, z);
    g.rotation.y = ry;
    group.add(g);
    const cool = variant === 0;
    const bodyColor = cool ? 0x154f4b : 0x8f3b36;
    const lightColor = cool ? 0xd9f3ee : 0xffe3c4;
    const body = box(0.9, 1.86, 0.66, toon(bodyColor), 0.012);
    body.position.y = 0.96;
    g.add(body);
    const plinth = box(0.94, 0.075, 0.7, darkMetal);
    plinth.position.y = 0.038;
    g.add(plinth);
    const topCap = box(0.94, 0.05, 0.7, toon(0x141b1a));
    topCap.position.y = 1.905;
    g.add(topCap);
    const frontMat = new THREE.MeshBasicMaterial({ map: tex.vending[variant], color: 0xd3dbd7 });
    const front = plane(0.858, 1.8, frontMat);
    front.position.set(0, 0.97, 0.334);
    front.castShadow = false;
    g.add(front);
    // 侧板上的小贴纸与雨水痕
    const sideSticker = plane(0.22, 0.3, new THREE.MeshBasicMaterial({
      map: tex.notices[2], transparent: true, opacity: 0.9,
    }));
    sideSticker.rotation.y = Math.PI / 2;
    sideSticker.position.set(0.453, 1.32, 0.02);
    g.add(sideSticker);
    // 投币面板（立体）
    const coinPanel = box(0.2, 0.34, 0.035, cream);
    coinPanel.position.set(0.29, 0.59, 0.352);
    g.add(coinPanel);
    const coinSlot = box(0.018, 0.085, 0.01, black);
    coinSlot.position.set(0.315, 0.65, 0.373);
    g.add(coinSlot);
    const btn = cyl(0.018, 0.018, 0.012, flat(0xb23a2e), 8);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.255, 0.68, 0.375);
    g.add(btn);
    const change = box(0.12, 0.1, 0.02, darkMetal);
    change.position.set(0.29, 0.46, 0.36);
    g.add(change);
    const flap = box(0.5, 0.15, 0.035, darkMetal);
    flap.position.set(-0.08, 0.2, 0.345);
    g.add(flap);
    const flapLip = box(0.5, 0.025, 0.04, metal);
    flapLip.position.set(-0.08, 0.27, 0.35);
    g.add(flapLip);
    // 落在地上的光池
    const spill = plane(1.7, 1.25, new THREE.MeshBasicMaterial({
      map: tex.spill, color: lightColor, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    spill.rotation.x = -Math.PI / 2;
    spill.position.set(0, 0.006, 0.95);
    spill.renderOrder = 3;
    spill.castShadow = false;
    g.add(spill);
    glowPlanes.push(spill);
    // 正面柔光
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex.glow, color: lightColor, transparent: true, opacity: 0.065,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    halo.position.set(0, 1.15, 0.52);
    halo.scale.set(1.45, 2.05, 1);
    g.add(halo);
    const lamp = new THREE.PointLight(lightColor, 1.7, 4.0, 2);
    lamp.position.set(0, 1.28, 0.52);
    g.add(lamp);
    lights.push(lamp);
    vending.push({ lamp, base: 1.7, halo, haloBase: 0.065, phase: (x + z) * 1.7 });
    return g;
  }
  buildVending(4.80, 4.55, 0);
  buildVending(5.74, 4.55, 1);

  // ═══════════════════════════════════════════════════════════
  //  自行车
  // ═══════════════════════════════════════════════════════════
  function buildBike(x, z, ry, lean, opts = {}) {
    const outer = new THREE.Group();
    outer.position.set(x, WALK_Y, z);
    outer.rotation.y = ry;
    group.add(outer);
    const inner = new THREE.Group();
    inner.rotation.x = lean;
    outer.add(inner);

    const frameMat = toon(opts.frame ?? 0x335d60);
    const fenderMat = toon(opts.fender ?? 0xd9d2bd);
    const V = (a, b, c = 0) => new THREE.Vector3(a, b, c);
    const bb = V(0.0, 0.35), ra = V(-0.52, 0.34), fa = V(0.52, 0.34);
    const st = V(-0.2, 0.88), ht = V(0.36, 0.92), hb = V(0.44, 0.62);

    function wheel(wx) {
      const wg = new THREE.Group();
      wg.position.set(wx, 0.34, 0);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.027, 6, 22), rubber);
      wg.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.292, 0.0115, 4, 22), chrome);
      wg.add(rim);
      const hub = cyl(0.032, 0.032, 0.07, chrome, 8);
      hub.rotation.x = Math.PI / 2;
      wg.add(hub);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.58, 0.006), chrome);
        spoke.rotation.z = a;
        wg.add(spoke);
      }
      const fender = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 4, 14, Math.PI), fenderMat);
      fender.position.z = 0.008;
      wg.add(fender);
      return wg;
    }
    inner.add(wheel(0.52));
    inner.add(wheel(-0.52));

    const bars = [
      [ra, bb, 0.02], [bb, st, 0.022], [st, ht, 0.021], [bb, hb, 0.023],
      [hb, ht, 0.023], [hb, fa, 0.018], [ra, st, 0.015], [ra, bb, 0.016],
    ];
    for (const [a, b, r] of bars) inner.add(tube(a, b, r, frameMat, 6));
    // 后叉与立管
    const seatPost = tube(st, V(-0.22, 0.97), 0.016, chrome, 6);
    inner.add(seatPost);
    const stem = tube(ht, V(0.34, 1.04), 0.016, chrome, 6);
    inner.add(stem);
    const bar = cyl(0.014, 0.014, 0.42, chrome, 6);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0.34, 1.045, 0);
    inner.add(bar);
    for (const gz of [-0.2, 0.2]) {
      const grip = cyl(0.019, 0.019, 0.1, black, 6);
      grip.rotation.x = Math.PI / 2;
      grip.position.set(0.34, 1.045, gz);
      inner.add(grip);
    }
    const seat = box(0.25, 0.055, 0.12, black);
    seat.position.set(-0.22, 0.995, 0);
    seat.rotation.z = -0.04;
    inner.add(seat);
    const seatNose = box(0.11, 0.045, 0.075, black);
    seatNose.position.set(-0.08, 0.99, 0);
    inner.add(seatNose);
    // 车筐
    const bx = 0.63, by = 0.83, bz = 0;
    const bottom = box(0.3, 0.02, 0.27, cream);
    bottom.position.set(bx, by - 0.1, bz);
    inner.add(bottom);
    const frontPanel = box(0.3, 0.2, 0.014, cream);
    frontPanel.position.set(bx, by, bz + 0.135);
    inner.add(frontPanel);
    const backPanel = box(0.3, 0.2, 0.014, cream);
    backPanel.position.set(bx, by, bz - 0.135);
    inner.add(backPanel);
    for (const sx of [-0.145, 0.145]) {
      const sidePanel = box(0.014, 0.2, 0.27, cream);
      sidePanel.position.set(bx + sx, by, bz);
      inner.add(sidePanel);
    }
    for (let i = 0; i < 3; i++) {
      const strip = box(0.3, 0.008, 0.004, toon(0xa89e85));
      strip.position.set(bx, by - 0.04 + i * 0.05, bz + 0.143);
      inner.add(strip);
    }
    const basketPost = tube(V(0.44, 0.68, 0), V(bx - 0.1, by - 0.1, 0), 0.012, chrome, 5);
    inner.add(basketPost);
    // 后货架
    const rack = box(0.34, 0.02, 0.19, chrome);
    rack.position.set(-0.52, 0.76, 0);
    inner.add(rack);
    for (const gz of [-0.1, 0.1]) {
      inner.add(tube(V(-0.42, 0.76, gz * 0.6), V(-0.62, 0.76, gz * 0.6), 0.008, chrome, 4));
      inner.add(tube(V(-0.58, 0.75, gz * 0.6), V(-0.52, 0.36, gz * 0.7), 0.007, chrome, 4));
    }
    const stand = tube(V(-0.12, 0.34, 0.02), V(-0.22, 0.015, 0.16), 0.009, darkMetal, 5);
    inner.add(stand);
    // 前灯
    const head = cyl(0.045, 0.045, 0.06, chrome, 10);
    head.rotation.z = Math.PI / 2;
    head.position.set(0.53, 0.77, 0);
    inner.add(head);
    const lens = cyl(0.036, 0.036, 0.012, flat(0xffedbd), 10);
    lens.rotation.z = Math.PI / 2;
    lens.position.set(0.565, 0.77, 0);
    inner.add(lens);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), chrome);
    bell.position.set(0.3, 1.08, 0.12);
    inner.add(bell);
    const rearRef = box(0.05, 0.035, 0.01, flat(0xb83a32));
    rearRef.position.set(-0.55, 0.72, 0.02);
    inner.add(rearRef);
    const mud = box(0.1, 0.1, 0.14, black);
    mud.position.set(-0.6, 0.24, 0);
    inner.add(mud);
    return outer;
  }
  buildBike(4.63, 2.18, -Math.PI / 2, 0.13, { frame: 0x335d60, fender: 0xd9d2bd });
  buildBike(-9.75, 5.35, 0.52, 0, { frame: 0x6e3a3c, fender: 0xe0d7bd });

  // ═══════════════════════════════════════════════════════════
  //  门口伞架
  // ═══════════════════════════════════════════════════════════
  {
    const g = new THREE.Group();
    g.position.set(1.12, WALK_Y, 4.03);
    group.add(g);
    const stand = cyl(0.17, 0.185, 0.5, metal, 16);
    stand.position.y = 0.25;
    g.add(stand);
    const inner = cyl(0.155, 0.155, 0.46, toon(0x151a1a), 16);
    inner.position.y = 0.28;
    g.add(inner);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.018, 5, 18), darkMetal);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.5;
    g.add(rim);
    const base = cyl(0.2, 0.2, 0.02, darkMetal, 16);
    base.position.y = 0.01;
    g.add(base);
    const umbrellas = [
      { color: 0x27364d, tilt: 0.1, rot: 0.4, clear: false },
      { color: 0xc8b79a, tilt: -0.08, rot: 2.2, clear: false },
      { color: 0xdde6e4, tilt: 0.14, rot: 4.1, clear: true },
    ];
    for (const u of umbrellas) {
      const ug = new THREE.Group();
      ug.position.set(u.rot > 3 ? 0.05 : -0.03, 0.12, u.rot > 3 ? -0.04 : 0.03);
      ug.rotation.z = u.tilt;
      ug.rotation.x = Math.sin(u.rot) * 0.08;
      g.add(ug);
      const shaft = cyl(0.011, 0.011, 0.72, chrome, 6);
      shaft.position.y = 0.42;
      ug.add(shaft);
      const canopyMat = u.clear
        ? toon(0xdbe7e6, { transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        : toon(u.color);
      const canopy = cyl(0.02, 0.075, 0.4, canopyMat, 8);
      canopy.position.y = 0.32;
      ug.add(canopy);
      const tip = cyl(0.006, 0.012, 0.06, chrome, 5);
      tip.position.y = 0.06;
      ug.add(tip);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.011, 4, 10, Math.PI), toon(0x3b2d24));
      handle.rotation.z = Math.PI;
      handle.position.y = 0.8;
      ug.add(handle);
    }
    const drip = plane(0.42, 0.42, new THREE.MeshBasicMaterial({
      map: tex.spill, color: 0xbdd3d2, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    drip.rotation.x = -Math.PI / 2;
    drip.position.set(0, 0.005, 0.05);
    drip.castShadow = false;
    g.add(drip);
    glowPlanes.push(drip);
  }

  // ═══════════════════════════════════════════════════════════
  //  分类垃圾桶
  // ═══════════════════════════════════════════════════════════
  function buildBin(x, z, bodyColor, lidColor, title, sub) {
    const g = new THREE.Group();
    g.position.set(x, WALK_Y, z);
    group.add(g);
    const body = box(0.42, 0.76, 0.4, toon(bodyColor), 0.01);
    body.position.y = 0.4;
    g.add(body);
    const lid = box(0.46, 0.06, 0.44, toon(lidColor));
    lid.position.y = 0.81;
    g.add(lid);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), black);
    hole.position.set(0, 0.72, 0.202);
    g.add(hole);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.008, 4, 14), darkMetal);
    ring.position.set(0, 0.72, 0.206);
    g.add(ring);
    const label = plane(0.3, 0.15, new THREE.MeshBasicMaterial({
      map: binLabel(title, sub), transparent: true,
    }));
    label.position.set(0, 0.46, 0.203);
    g.add(label);
    for (const sx of [-0.16, 0.16]) {
      const foot = box(0.05, 0.04, 0.34, darkMetal);
      foot.position.set(sx, 0.02, 0);
      g.add(foot);
    }
    return g;
  }
  buildBin(-6.58, 4.19, 0xa9b8ae, 0x3f4a46, 'かん・びん', 'CANS & BOTTLES');
  buildBin(-6.58, 4.73, 0xb3b7a6, 0x4a4f43, 'ペットボトル', 'PET BOTTLES');

  // ═══════════════════════════════════════════════════════════
  //  邮筒
  // ═══════════════════════════════════════════════════════════
  {
    const g = new THREE.Group();
    g.position.set(-10.82, WALK_Y, 4.78);
    group.add(g);
    const base = cyl(0.25, 0.29, 0.09, toon(0x5c2823), 16);
    base.position.y = 0.045;
    g.add(base);
    const body = cyl(0.295, 0.305, 1.04, red, 18);
    body.position.y = 0.6;
    g.add(body);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.295, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), red);
    dome.position.y = 1.12;
    g.add(dome);
    const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 4, 20), toon(0x82231f));
    capRing.rotation.x = Math.PI / 2;
    capRing.position.y = 1.12;
    g.add(capRing);
    const slot = box(0.26, 0.035, 0.035, black);
    slot.position.set(0, 1.0, 0.285);
    g.add(slot);
    const slotLip = box(0.3, 0.02, 0.05, toon(0x7e201c));
    slotLip.position.set(0, 1.03, 0.29);
    g.add(slotLip);
    const plate = plane(0.17, 0.21, new THREE.MeshBasicMaterial({ map: postPlate(), transparent: true }));
    plate.position.set(0, 0.72, 0.302);
    g.add(plate);
    const collect = plane(0.2, 0.08, new THREE.MeshBasicMaterial({
      map: canvasTexture(256, 96, (ctx, w, h) => {
        ctx.fillStyle = '#f1ecdf'; rr(ctx, 2, 2, w - 4, h - 4, 4); ctx.fill();
        ctx.textAlign = 'center'; setFont(ctx, 22, 'bold', JP);
        ctx.fillStyle = '#3d4744'; ctx.fillText('取集 平日 9:00', w / 2, 40);
        setFont(ctx, 14, 'normal', JP); ctx.fillStyle = '#6c746e';
        ctx.fillText('土日祝 休', w / 2, 66);
      }), transparent: true,
    }));
    collect.position.set(0, 0.53, 0.302);
    g.add(collect);
    const shadowCatcher = cyl(0.3, 0.3, 0.01, toon(0x6c6a5e), 16);
    shadowCatcher.position.y = 0.005;
    g.add(shadowCatcher);
  }

  // ═══════════════════════════════════════════════════════════
  //  配电箱 + 贴纸
  // ═══════════════════════════════════════════════════════════
  {
    const g = new THREE.Group();
    g.position.set(5.62, WALK_Y, -3.5);
    g.rotation.y = Math.PI / 2;
    group.add(g);
    const body = box(0.56, 1.16, 0.42, toon(0x7d867e), 0.012);
    body.position.y = 0.62;
    g.add(body);
    const cap = box(0.62, 0.05, 0.48, toon(0x5d665f));
    cap.position.y = 1.22;
    g.add(cap);
    const base = box(0.6, 0.08, 0.46, darkMetal);
    base.position.y = 0.04;
    g.add(base);
    const seam = box(0.012, 0.98, 0.012, toon(0x4c5650));
    seam.position.set(0, 0.62, 0.214);
    g.add(seam);
    for (const sx of [-0.14, 0.14]) {
      const handle = box(0.03, 0.1, 0.03, metal);
      handle.position.set(sx, 0.58, 0.222);
      g.add(handle);
      const hinge = box(0.04, 0.06, 0.03, darkMetal);
      hinge.position.set(sx, 0.95, 0.22);
      g.add(hinge);
    }
    const warn = plane(0.22, 0.15, new THREE.MeshBasicMaterial({ map: warningLabel() }));
    warn.position.set(-0.13, 0.92, 0.218);
    g.add(warn);
    const sticker = plane(0.19, 0.24, new THREE.MeshBasicMaterial({ map: tex.notices[1] }));
    sticker.position.set(0.13, 0.6, 0.218);
    g.add(sticker);
    for (let i = 0; i < 4; i++) {
      const vent = box(0.3, 0.018, 0.015, toon(0x59625c));
      vent.position.set(0, 0.28 + i * 0.035, 0.213);
      g.add(vent);
    }
    const seal = box(0.08, 0.02, 0.01, toon(0x9d3c31));
    seal.position.set(0.2, 0.46, 0.22);
    g.add(seal);
  }

  // ═══════════════════════════════════════════════════════════
  //  路锥
  // ═══════════════════════════════════════════════════════════
  function cone(x, z, ry = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0.012, z);
    g.rotation.y = ry;
    group.add(g);
    const base = box(0.3, 0.03, 0.3, toon(0x9c4a25));
    base.position.y = 0.015;
    g.add(base);
    const body = cyl(0.022, 0.128, 0.52, orange, 12);
    body.position.y = 0.29;
    g.add(body);
    const band = cyl(0.068, 0.086, 0.075, flat(0xf0ecdf), 12);
    band.position.y = 0.35;
    g.add(band);
    const band2 = cyl(0.045, 0.056, 0.03, flat(0xf0ecdf), 12);
    band2.position.y = 0.46;
    g.add(band2);
    const tip = cyl(0.012, 0.02, 0.05, toon(0xc25c2c), 8);
    tip.position.y = 0.575;
    g.add(tip);
    return g;
  }
  cone(7.0, 2.36, 0.3);
  cone(7.0, -0.92, -0.2);

  // ═══════════════════════════════════════════════════════════
  //  A 字菜单牌
  // ═══════════════════════════════════════════════════════════
  {
    const g = new THREE.Group();
    g.position.set(0.5, WALK_Y, 5.14);
    g.rotation.y = -0.24;
    group.add(g);
    const boardMat = new THREE.MeshBasicMaterial({ map: chalkMenu() });
    const mkBoard = (zPos, rotX, flip) => {
      const bg = new THREE.Group();
      bg.position.set(0, 0.42, zPos);
      bg.rotation.x = rotX;
      g.add(bg);
      const frame = box(0.56, 0.78, 0.028, wood, 0.008);
      bg.add(frame);
      const face = plane(0.49, 0.68, boardMat);
      face.position.z = flip ? -0.016 : 0.016;
      if (flip) face.rotation.y = Math.PI;
      bg.add(face);
      const topBar = box(0.6, 0.035, 0.045, wood);
      topBar.position.set(0, 0.4, 0);
      bg.add(topBar);
      return bg;
    };
    mkBoard(0.085, -0.17, false);
    mkBoard(-0.085, 0.17, true);
    const hinge = cyl(0.022, 0.022, 0.6, darkMetal, 8);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.81, 0);
    g.add(hinge);
    for (const sx of [-0.26, 0.26]) {
      for (const sz of [-0.12, 0.12]) {
        const foot = box(0.05, 0.03, 0.05, black);
        foot.position.set(sx, 0.015, sz);
        g.add(foot);
      }
    }
    const flag = plane(0.16, 0.1, new THREE.MeshBasicMaterial({
      map: canvasTexture(160, 96, (ctx, w, h) => {
        ctx.fillStyle = '#c9543f'; rr(ctx, 2, 2, w - 4, h - 4, 6); ctx.fill();
        ctx.textAlign = 'center'; setFont(ctx, 26, 'bold', JP);
        ctx.fillStyle = '#f7ecd6'; ctx.fillText('営業中', w / 2, 44);
        setFont(ctx, 13, 'bold', EN); ctx.fillStyle = '#f2dfc2';
        ctx.fillText('OPEN', w / 2, 70);
      }),
    }));
    const flagPole = tube(new THREE.Vector3(0.2, 0.82, 0.08), new THREE.Vector3(0.22, 0.7, 0.16), 0.007, wood, 4);
    g.add(flagPole);
    flag.position.set(0.22, 0.7, 0.17);
    flag.rotation.y = 0.2;
    g.add(flag);
  }

  // ═══════════════════════════════════════════════════════════
  //  盆栽
  // ═══════════════════════════════════════════════════════════
  function pot(x, z, s = 1, tone = 0x3f6b46) {
    const g = new THREE.Group();
    g.position.set(x, WALK_Y, z);
    group.add(g);
    const body = cyl(0.115 * s, 0.16 * s, 0.28 * s, toon(0x9c5a42), 12);
    body.position.y = 0.14 * s;
    g.add(body);
    const lip = cyl(0.17 * s, 0.16 * s, 0.045 * s, toon(0x7e4634), 12);
    lip.position.y = 0.275 * s;
    g.add(lip);
    const soil = cyl(0.145 * s, 0.145 * s, 0.02, toon(0x2e2620), 12);
    soil.position.y = 0.295 * s;
    g.add(soil);
    const leafMat = toon(tone);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.055 * s, 0.32 * s, 4), leafMat);
      leaf.position.set(Math.cos(a) * 0.07 * s, 0.44 * s, Math.sin(a) * 0.07 * s);
      leaf.rotation.z = Math.cos(a) * 0.6;
      leaf.rotation.x = -Math.sin(a) * 0.6;
      g.add(leaf);
    }
    const stem = cyl(0.012 * s, 0.016 * s, 0.2 * s, toon(0x4a5f38), 5);
    stem.position.y = 0.38 * s;
    g.add(stem);
    return g;
  }
  pot(4.38, -0.5, 0.95, 0x3f6b46);
  pot(-6.44, 3.62, 0.85, 0x4a6b3c);

  // ═══════════════════════════════════════════════════════════
  //  侧墙驻轮牌
  // ═══════════════════════════════════════════════════════════
  {
    const plate = plane(0.4, 0.3, new THREE.MeshBasicMaterial({ map: parkingPlate(), transparent: true }));
    plate.rotation.y = Math.PI / 2;
    plate.position.set(STORE.x1 + 0.018, 2.02, 2.5);
    group.add(plate);
    const back = box(0.025, 0.34, 0.44, whitePaint);
    back.position.set(STORE.x1 + 0.006, 2.02, 2.5);
    group.add(back);
  }


  // ── 在门口躲雨的小猫 ─────────────────────────────────────
  {
    const cat = new THREE.Group();
    cat.position.set(-0.28, WALK_Y + 0.003, 4.4);
    cat.rotation.y = 0.18;
    const fur = toon(0x41454d);
    const paleFur = toon(0xded6c6);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 10), fur);
    body.scale.set(1, 1.22, 0.94);
    body.position.set(0, 0.185, 0);
    cat.add(body);
    addOutline(body, 0.006);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), paleFur);
    chest.scale.set(1, 0.95, 0.62);
    chest.position.set(0, 0.19, 0.072);
    cat.add(chest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.073, 14, 10), fur);
    head.position.set(0, 0.33, 0.028);
    head.rotation.z = 0.08;
    cat.add(head);
    addOutline(head, 0.005);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), paleFur);
    muzzle.scale.set(1.1, 0.8, 0.88);
    muzzle.position.set(0, 0.312, 0.083);
    cat.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshBasicMaterial({ color: 0xc98b88 }));
    nose.position.set(0, 0.318, 0.121);
    cat.add(nose);
    // 耳朵
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.033, 0.075, 4), fur);
      ear.position.set(sx * 0.046, 0.395, 0.022);
      ear.rotation.z = sx * 0.2;
      cat.add(ear);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.019, 0.052, 4), new THREE.MeshBasicMaterial({ color: 0xb98f8c }));
      inner.position.set(sx * 0.045, 0.394, 0.034);
      inner.rotation.z = sx * 0.2;
      cat.add(inner);
    }
    // 眼睛：夜里只有一点点反光
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 8, 6), new THREE.MeshBasicMaterial({ color: 0xcfe08a }));
      eye.position.set(sx * 0.03, 0.338, 0.083);
      cat.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 6, 4), new THREE.MeshBasicMaterial({ color: 0x18201c }));
      pupil.position.set(sx * 0.031, 0.338, 0.094);
      cat.add(pupil);
    }
    // 前爪
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.11, 8), fur);
      leg.position.set(sx * 0.048, 0.07, 0.045);
      cat.add(leg);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), paleFur);
      paw.scale.set(1, 0.62, 1.25);
      paw.position.set(sx * 0.048, 0.026, 0.07);
      cat.add(paw);
    }
    // 尾巴绕在脚边
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.15, -0.075),
      new THREE.Vector3(-0.07, 0.115, -0.145),
      new THREE.Vector3(-0.145, 0.06, -0.105),
      new THREE.Vector3(-0.15, 0.035, -0.015),
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.016, 6, false), fur);
    cat.add(tail);
    addOutline(tail, 0.005);
    // 项圈 + 小铃铛
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.007, 6, 14), new THREE.MeshBasicMaterial({ color: 0xa33b34 }));
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.272, 0.012);
    cat.add(collar);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), new THREE.MeshBasicMaterial({ color: 0xd8b25e }));
    bell.position.set(0, 0.256, 0.068);
    cat.add(bell);
    // 坐姿接触阴影
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.34), new THREE.MeshBasicMaterial({
      map: tex.glow, color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false,
    }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    shadow.renderOrder = 1;
    cat.add(shadow);
    group.add(cat);
  }

  // ── 阴影 ───────────────────────────────────────────────────
  group.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  for (const p of glowPlanes) p.castShadow = false;

  function update(t, dt) {
    for (const v of vending) {
      const p = 0.94 + Math.sin(t * 1.6 + v.phase) * 0.045 + Math.sin(t * 23.1 + v.phase) * 0.012;
      v.lamp.intensity = v.base * p;
      v.halo.material.opacity = v.haloBase * (0.9 + p * 0.1);
    }
  }

  return { group, lights, update };
}
