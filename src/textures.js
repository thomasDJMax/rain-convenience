import * as THREE from 'three';
import {
  canvasTexture, rr, starPath, setFont, fitText, mulberry32, JP, EN, M,
} from './core.js';

const T = (ctx, text, x, y, size, color, opts = {}) => {
  setFont(ctx, size, opts.weight ?? 'bold', opts.family ?? JP);
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = opts.baseline ?? 'middle';
  if (opts.spacing) ctx.letterSpacing = opts.spacing;
  ctx.fillText(text, x, y);
  if (opts.spacing) ctx.letterSpacing = '0px';
};

const vertical = (ctx, text, x, y, size, color, gap = 1.18) => {
  setFont(ctx, size, 'bold', JP);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  [...text].forEach((ch, i) => ctx.fillText(ch, x, y + i * size * gap));
};

const speckle = (ctx, w, h, count, seed, alpha = 0.08, color = '#000') => {
  const r = mulberry32(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha * (0.3 + r() * 0.7);
    const s = 1 + r() * 3;
    ctx.fillRect(r() * w, r() * h, s, s);
  }
  ctx.restore();
};

function paperNoise(ctx, w, h, seed, alpha = 0.05) {
  speckle(ctx, w, h, 800, seed, alpha, '#3a3226');
}

// ── 店招 ─────────────────────────────────────────────────────
function fascia() {
  return canvasTexture(4096, 360, (ctx, w, h) => {
    ctx.fillStyle = '#0f4b44';
    ctx.fillRect(0, 0, w, h);
    // 极淡的横向纸纹
    ctx.globalAlpha = 0.12;
    for (let y = 0; y < h; y += 9) {
      ctx.fillStyle = y % 18 === 0 ? '#2a6a5f' : '#08332e';
      ctx.fillRect(0, y, w, 1);
    }
    ctx.globalAlpha = 1;
    // 底部色带
    ctx.fillStyle = '#0a3833'; ctx.fillRect(0, h - 58, w, 26);
    ctx.fillStyle = '#e3a54a'; ctx.fillRect(0, h - 32, w, 10);
    ctx.fillStyle = '#c4513f'; ctx.fillRect(0, h - 22, w, 22);
    // 左侧星标
    ctx.fillStyle = '#f6ecd4';
    ctx.beginPath(); ctx.arc(228, 158, 118, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f4b44';
    starPath(ctx, 228, 160, 74, 32, 5, -Math.PI / 2);
    ctx.fill();
    ctx.fillStyle = '#f6ecd4';
    starPath(ctx, 228, 160, 38, 16, 5, -Math.PI / 2);
    ctx.fill();
    T(ctx, 'HOSHI', 228, 296, 30, '#f6ecd4', { family: EN, spacing: '8px' });
    // 主字
    setFont(ctx, 196, 'bold', JP);
    ctx.fillStyle = '#f8efd9';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('星マート', 400, 144);
    T(ctx, 'HOSHI MART', 410, 272, 44, '#bcd9ce', {
      family: EN, align: 'left', spacing: '16px', weight: '600',
    });
    // 右侧
    ctx.fillStyle = '#c4513f';
    rr(ctx, 3440, 66, 370, 148, 22); ctx.fill();
    T(ctx, '24', 3560, 142, 106, '#fff4dc', { family: EN });
    T(ctx, 'H', 3688, 142, 96, '#fff4dc', { family: EN });
    T(ctx, '24時間営業', 3625, 264, 52, '#f2e6ce');
    T(ctx, 'ATM ・ コーヒー ・ おでん', 2850, 272, 38, '#9fc3b6', { weight: '600' });
    ctx.fillStyle = '#f6ecd4';
    starPath(ctx, 3360, 272, 22, 9, 5, -Math.PI / 2); ctx.fill();
    paperNoise(ctx, w, h, 9, 0.045);
  });
}

function pylonSign() {
  return canvasTexture(512, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#0f4b44'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#f3e7c9'; ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.fillStyle = '#f3e7c9';
    starPath(ctx, 256, 150, 82, 34, 5); ctx.fill();
    T(ctx, '24', 256, 372, 250, '#fff2d2', { family: EN });
    T(ctx, 'H', 256, 540, 120, '#e8875b', { family: EN });
    T(ctx, 'HOURS', 256, 640, 44, '#fff2d2', { family: EN, spacing: '12px' });
    ctx.strokeStyle = 'rgba(243,231,201,.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(100, 700); ctx.lineTo(412, 700); ctx.stroke();
    vertical(ctx, 'ほしマート', 256, 790, 54, '#f3e7c9', 1.05);
  });
}

// ── 橱窗海报 ─────────────────────────────────────────────────
function posterOnigiri() {
  return canvasTexture(512, 768, (ctx, w, h) => {
    ctx.fillStyle = '#f7e8c6'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c74c3e';
    ctx.save(); ctx.translate(0, 24); ctx.rotate(-0.045);
    ctx.fillRect(-20, 0, w + 40, 112); ctx.restore();
    T(ctx, '新発売', 256, 82, 72, '#fff5df');
    T(ctx, 'おにぎり', 256, 226, 88, '#173d36');
    // 饭团
    ctx.save();
    ctx.translate(256, 430);
    ctx.fillStyle = '#fffdf3';
    ctx.beginPath();
    ctx.moveTo(0, -150); ctx.quadraticCurveTo(150, 108, 120, 138);
    ctx.quadraticCurveTo(0, 178, -120, 138); ctx.quadraticCurveTo(-150, 108, 0, -150);
    ctx.fill();
    ctx.fillStyle = '#18342f';
    rr(ctx, -72, 74, 144, 88, 12); ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    for (let i = 0; i < 22; i++) {
      const a = i * 2.4, r = 40 + (i * 37) % 80;
      ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r - 10, 4, 7);
    }
    ctx.restore();
    ctx.fillStyle = '#c74c3e';
    ctx.beginPath(); ctx.arc(256, 664, 62, 0, Math.PI * 2); ctx.fill();
    T(ctx, '100', 244, 662, 66, '#fff5df', { family: EN });
    T(ctx, '円', 300, 676, 30, '#fff5df');
    T(ctx, 'あたたかごはん', 256, 736, 28, '#6b7058');
    paperNoise(ctx, w, h, 2, 0.055);
  });
}

function posterKaraage() {
  return canvasTexture(512, 768, (ctx, w, h) => {
    ctx.fillStyle = '#e9a83b'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#29302e';
    ctx.save(); ctx.translate(-30, 470); ctx.rotate(0.09);
    ctx.fillRect(0, 0, w + 80, 190); ctx.restore();
    T(ctx, 'HOT SNACK', 256, 72, 34, '#29302e', { family: EN, spacing: '10px' });
    T(ctx, 'からあげ', 256, 168, 92, '#fff8e7');
    ctx.lineWidth = 12; ctx.strokeStyle = '#8c3b2c';
    T(ctx, 'からあげ', 256, 168, 92, '#fff8e7');
    // 纸船 + 炸鸡
    ctx.save(); ctx.translate(256, 470);
    ctx.fillStyle = '#f6e6c2';
    ctx.beginPath();
    ctx.moveTo(-170, -90); ctx.lineTo(170, -90); ctx.lineTo(120, 150); ctx.lineTo(-120, 150);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7d4330';
    for (let i = 0; i < 6; i++) {
      const x = -105 + (i % 3) * 105, y = -30 + Math.floor(i / 3) * 75;
      ctx.beginPath();
      ctx.ellipse(x, y, 48, 36, (i % 2) * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a65e3d';
      ctx.beginPath(); ctx.ellipse(x - 10, y - 9, 22, 15, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7d4330';
    }
    ctx.restore();
    T(ctx, '20% 増量', 256, 650, 50, '#c74c3e');
    T(ctx, '揚げたて ・ 店内調理', 256, 715, 27, '#3e4434');
    paperNoise(ctx, w, h, 4, 0.06);
  });
}

function posterCoffee() {
  return canvasTexture(512, 768, (ctx, w, h) => {
    ctx.fillStyle = '#23302d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#31443f';
    ctx.beginPath(); ctx.arc(256, 440, 195, 0, Math.PI * 2); ctx.fill();
    T(ctx, 'HOT', 256, 102, 52, '#d8b06b', { family: EN, spacing: '18px' });
    T(ctx, 'COFFEE', 256, 172, 86, '#f5e8c9', { family: EN, spacing: '2px' });
    // 杯子
    ctx.save(); ctx.translate(256, 470);
    ctx.fillStyle = '#f5e8c9';
    ctx.beginPath(); ctx.moveTo(-95, -62); ctx.lineTo(95, -62); ctx.lineTo(66, 118);
    ctx.quadraticCurveTo(0, 146, -66, 118); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f5e8c9'; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.arc(98, 12, 54, -1.3, 1.3); ctx.stroke();
    ctx.fillStyle = '#6b3f2c';
    ctx.beginPath(); ctx.ellipse(0, -62, 95, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e8d5ae'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-30 + i * 30, -110 - i * 12);
      ctx.bezierCurveTo(-55 + i * 30, -160 - i * 10, -5 + i * 30, -170, -20 + i * 30, -215 - i * 8);
      ctx.stroke();
    }
    ctx.restore();
    T(ctx, 'ほっと一息。', 256, 668, 46, '#e3c58d');
    T(ctx, '星マート カウンターコーヒー', 256, 730, 24, '#9fb0a1');
    paperNoise(ctx, w, h, 7, 0.04);
  });
}

function posterATM() {
  return canvasTexture(512, 768, (ctx, w, h) => {
    ctx.fillStyle = '#f3ead6'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1d5d57'; ctx.fillRect(0, 0, w, 200);
    T(ctx, 'ATM', 256, 100, 110, '#f6ecd7', { family: EN, spacing: '10px' });
    T(ctx, '24時間', 256, 280, 70, '#1d5d57');
    T(ctx, 'ご利用いただけます', 256, 358, 34, '#4d574e');
    // 简单机器图形
    ctx.strokeStyle = '#1d5d57'; ctx.lineWidth = 12;
    rr(ctx, 136, 424, 240, 210, 22); ctx.stroke();
    ctx.fillStyle = '#1d5d57';
    rr(ctx, 170, 456, 172, 88, 10); ctx.fill();
    ctx.fillStyle = '#f3ead6';
    for (let i = 0; i < 3; i++) ctx.fillRect(190, 482 + i * 20, 132, 8);
    ctx.fillStyle = '#d9a44f';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(190 + j * 45, 574 + i * 22, 8, 0, Math.PI * 2); ctx.fill();
    }
    T(ctx, '星マート', 256, 712, 34, '#1d5d57');
    paperNoise(ctx, w, h, 11, 0.04);
  });
}

// ── 店内灯箱 ─────────────────────────────────────────────────
function lightboxOden() {
  return canvasTexture(768, 480, (ctx, w, h) => {
    ctx.fillStyle = '#33241f'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#4d3228';
    ctx.beginPath(); ctx.arc(610, 130, 150, 0, Math.PI * 2); ctx.fill();
    T(ctx, 'おでん', 300, 120, 112, '#f7e7c6');
    T(ctx, 'はじめました', 310, 220, 54, '#e7b46a');
    // 锅
    ctx.save(); ctx.translate(290, 338);
    ctx.fillStyle = '#cfc3a8'; rr(ctx, -190, -30, 380, 118, 22); ctx.fill();
    ctx.fillStyle = '#8f5e3b'; rr(ctx, -170, -18, 340, 36, 16); ctx.fill();
    ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const x = -130 + i * 65;
      ctx.beginPath(); ctx.moveTo(x, -40); ctx.lineTo(x + 12, -105); ctx.stroke();
      ctx.fillStyle = i % 2 ? '#e2c07b' : '#b88150';
      ctx.beginPath(); ctx.arc(x + 12, -112, 18, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    T(ctx, 'あったか〜い', 640, 338, 34, '#f1d9ad');
    T(ctx, 'STAR MART', 640, 386, 22, '#b8966a', { family: EN, spacing: '6px' });
  });
}

function lightboxBread() {
  return canvasTexture(768, 480, (ctx, w, h) => {
    ctx.fillStyle = '#f6e4cf'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e5b2a0';
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(90 + (i * 97) % 680, 50 + (i * 61) % 120, 28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    T(ctx, '星の', 250, 120, 74, '#7d3f42');
    T(ctx, 'クリームパン', 330, 204, 76, '#8f4a4a');
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath(); ctx.ellipse(560, 330, 120, 78, -0.18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0c26b';
    ctx.beginPath(); ctx.ellipse(560, 312, 92, 48, -0.18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff7e6';
    starPath(ctx, 560, 300, 30, 13, 5); ctx.fill();
    T(ctx, '新発売', 120, 348, 46, '#c0604d');
    T(ctx, 'HOSHI MART BAKERY', 170, 410, 20, '#9b7564', { family: EN, spacing: '5px' });
  });
}

// ── 分类吊牌 ─────────────────────────────────────────────────
function categorySign(label, sub, bg = '#175c52') {
  return canvasTexture(768, 224, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,244,218,.16)';
    ctx.fillRect(0, 0, w, 16);
    ctx.fillStyle = '#fff4da';
    starPath(ctx, 86, 112, 38, 16, 5); ctx.fill();
    T(ctx, label, 440, 100, 78, '#fff4da');
    if (sub) T(ctx, sub, 444, 172, 26, '#cfe0cf', { family: EN, spacing: '5px' });
    ctx.strokeStyle = '#c39f56'; ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, w - 28, h - 28);
  });
}

// ── 价签条 ───────────────────────────────────────────────────
function priceStrip() {
  return canvasTexture(2048, 96, (ctx, w, h) => {
    ctx.fillStyle = '#f7f2e4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d8d2c0'; ctx.fillRect(0, h - 10, w, 10);
    const colors = ['#e05a4e', '#f0c24e', '#4c9e8e', '#396f9e', '#e58a4a'];
    const labels = ['¥100', '¥128', '¥150', '¥98', '¥198', '¥120', '¥158'];
    for (let i = 0; i < 14; i++) {
      const x = i * 146 + 12;
      ctx.fillStyle = colors[i % colors.length];
      rr(ctx, x, 16, 128, 56, 6); ctx.fill();
      T(ctx, labels[i % labels.length], x + 64, 44, 30, '#fffaf0', { family: EN });
      ctx.fillStyle = '#9c9688';
      ctx.fillRect(x + 6, 76, 90, 5);
    }
  });
}

// ── 杂志封面 ─────────────────────────────────────────────────
function magazineCover(i) {
  const designs = [
    { bg: '#f3e5c8', accent: '#1c5b52', title: '月刊 星', sub: 'HOSHIMACHI', shape: 'star' },
    { bg: '#e7b1b7', accent: '#20211f', title: 'COMIC', sub: 'NIGHT EDITION', shape: 'lines' },
    { bg: '#8cb4c9', accent: '#f6eed9', title: 'TRAVEL', sub: 'LOCAL TRIP', shape: 'mountains' },
    { bg: '#282b36', accent: '#f0b95b', title: 'GAME', sub: 'PIXEL NIGHT', shape: 'blocks' },
    { bg: '#ece0c6', accent: '#a64b44', title: 'FASHION', sub: 'AUTUMN', shape: 'circle' },
    { bg: '#b0443e', accent: '#f7edd5', title: 'CAR', sub: 'DRIVE', shape: 'wheel' },
  ];
  const d = designs[i % designs.length];
  return canvasTexture(256, 340, (ctx, w, h) => {
    ctx.fillStyle = d.bg; ctx.fillRect(0, 0, w, h);
    if (d.shape === 'star') {
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.arc(128, 195, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d.bg; starPath(ctx, 128, 195, 58, 24, 5); ctx.fill();
    } else if (d.shape === 'lines') {
      ctx.strokeStyle = d.accent; ctx.lineWidth = 3;
      for (let k = 0; k < 12; k++) {
        ctx.beginPath(); ctx.moveTo(0, 130 + k * 18); ctx.lineTo(w, 90 + k * 18); ctx.stroke();
      }
      ctx.fillStyle = d.accent;
      ctx.beginPath(); ctx.arc(128, 220, 55, 0, Math.PI * 2); ctx.fill();
    } else if (d.shape === 'mountains') {
      ctx.fillStyle = d.accent;
      ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(80, 170); ctx.lineTo(140, 240);
      ctx.lineTo(200, 150); ctx.lineTo(256, 230); ctx.lineTo(256, 300); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.4; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(190, 110, 28, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (d.shape === 'blocks') {
      for (let k = 0; k < 26; k++) {
        ctx.fillStyle = ['#e05a4e', '#4c9e8e', '#f0c24e'][k % 3];
        ctx.fillRect(20 + (k * 47) % 210, 150 + (k * 31) % 130, 18, 14);
      }
    } else if (d.shape === 'circle') {
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.arc(128, 210, 74, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d.bg; ctx.beginPath(); ctx.arc(104, 190, 38, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = d.accent; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(85, 232, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(176, 232, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = d.accent;
      ctx.beginPath(); ctx.moveTo(40, 220); ctx.lineTo(210, 172); ctx.lineTo(206, 196);
      ctx.lineTo(52, 242); ctx.closePath(); ctx.fill();
    }
    T(ctx, d.title, 128, 50, d.title.length > 7 ? 34 : 48, d.accent);
    T(ctx, d.sub, 128, 90, 14, d.accent, { family: EN, spacing: '2px' });
    ctx.fillStyle = '#f7f2e2'; ctx.fillRect(0, h - 28, w, 28);
    ctx.fillStyle = d.accent;
    for (let k = 0; k < 24; k++) ctx.fillRect(12 + k * 3, h - 22, k % 2 ? 1 : 2, 16);
    T(ctx, '¥580', 205, h - 13, 14, d.accent, { family: EN });
  });
}

// ── 自动贩卖机 ───────────────────────────────────────────────
function vendingFront(variant = 0) {
  const cool = variant === 0;
  const frame = cool ? '#154f4b' : '#8f3b36';
  const light = cool ? '#eaf6ef' : '#fae9d2';
  const accent = cool ? '#3b9b8b' : '#e28b54';
  return canvasTexture(512, 1024, (ctx, w, h) => {
    ctx.fillStyle = frame; ctx.fillRect(0, 0, w, h);
    // 发光展示区
    ctx.fillStyle = light;
    rr(ctx, 26, 26, 460, 650, 18); ctx.fill();
    ctx.fillStyle = cool ? '#25685f' : '#a74e3c';
    ctx.fillRect(26, 26, 460, 94);
    T(ctx, 'DRINK', 236, 74, 58, '#fff7e6', { family: EN, spacing: '8px' });
    T(ctx, 'つめたい', 420, 74, 30, '#fff7e6');
    // 饮料网格
    const colors = cool
      ? ['#e35b50', '#f0c34e', '#5bb3a9', '#4d7fc0', '#e7e2cd', '#7fbf6c']
      : ['#e09247', '#d5564d', '#e7d9b8', '#6b9c56', '#c9a35a', '#7a8fb5'];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 56 + col * 89, y = 144 + row * 130;
        const c = colors[(row * 5 + col) % colors.length];
        // 瓶身
        ctx.fillStyle = c;
        rr(ctx, x, y, 58, 92, 12); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.fillRect(x + 8, y + 12, 8, 62);
        ctx.fillStyle = '#ffffff';
        rr(ctx, x + 14, y + 34, 30, 24, 4); ctx.fill();
        ctx.fillStyle = frame;
        ctx.fillRect(x + 6, y + 98, 46, 9);
        T(ctx, ['120', '150', '130', '140'][row], x + 29, y + 116, 20, frame, { family: EN });
      }
    }
    // 按钮
    ctx.fillStyle = '#e8e1cf';
    rr(ctx, 26, 690, 460, 110, 12); ctx.fill();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 3 === 0 ? accent : '#3c4a49';
      ctx.beginPath(); ctx.arc(64 + i * 42, 724, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7c8078';
      ctx.fillRect(52 + i * 42, 748, 24, 30);
    }
    // 投币 / 取物口
    ctx.fillStyle = '#dcd3bd';
    rr(ctx, 340, 820, 146, 72, 10); ctx.fill();
    ctx.fillStyle = '#303a39'; ctx.fillRect(356, 834, 20, 44);
    ctx.fillStyle = '#9b3e35'; ctx.fillRect(392, 834, 30, 14);
    ctx.fillStyle = '#7e7b70'; ctx.fillRect(392, 858, 72, 7);
    ctx.fillStyle = '#222927';
    rr(ctx, 40, 816, 270, 84, 12); ctx.fill();
    ctx.fillStyle = '#0e1211';
    rr(ctx, 62, 840, 226, 34, 14); ctx.fill();
    ctx.fillStyle = '#69736c';
    ctx.fillRect(356, 920, 112, 18);
    T(ctx, 'STAR MART', 256, 968, 30, '#f2e7ce', { family: EN, spacing: '5px' });
    T(ctx, 'つめた〜い', 256, 1000, 22, '#e8dcc1');
    speckle(ctx, w, h, 300, 12 + variant, 0.04, '#ffffff');
  });
}

// ── 公告栏海报 ───────────────────────────────────────────────
function noticeFestival() {
  return canvasTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = '#263544'; ctx.fillRect(0, 0, w, h);
    // 烟花
    for (const [cx, cy, col] of [[100, 140, '#e8c46d'], [286, 106, '#d98277'], [300, 238, '#8fc1bd']]) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46); ctx.stroke();
      }
    }
    ctx.fillStyle = '#c95345'; ctx.fillRect(0, 300, w, 92);
    T(ctx, '星町 夏祭り', 192, 346, 46, '#f9edd2');
    T(ctx, '8.20  SAT  18:00', 192, 432, 25, '#f2dfb9', { family: EN });
    T(ctx, '商店街 特設会場', 192, 468, 22, '#c5cbbf');
    paperNoise(ctx, w, h, 21, 0.06);
  });
}

function noticeCat() {
  return canvasTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f1e5ca'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c35a4a'; ctx.fillRect(0, 0, w, 92);
    T(ctx, '迷い猫', 192, 46, 44, '#fdf3de');
    ctx.fillStyle = '#3f4741';
    // 猫剪影
    ctx.save(); ctx.translate(192, 230);
    ctx.beginPath();
    ctx.moveTo(-54, -10); ctx.lineTo(-42, -92); ctx.lineTo(-8, -54);
    ctx.quadraticCurveTo(0, -58, 8, -54); ctx.lineTo(42, -92); ctx.lineTo(54, -10);
    ctx.quadraticCurveTo(78, 40, 46, 78); ctx.quadraticCurveTo(0, 100, -46, 78);
    ctx.quadraticCurveTo(-78, 40, -54, -10);
    ctx.fill();
    ctx.fillStyle = '#f1e5ca';
    ctx.beginPath(); ctx.ellipse(-20, -6, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20, -6, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f1e5ca'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-10, 18); ctx.quadraticCurveTo(0, 26, 10, 18); ctx.stroke();
    ctx.restore();
    T(ctx, '茶トラ・オス・2歳', 192, 342, 24, '#5a5546');
    T(ctx, '見かけたら 星マートまで', 192, 380, 21, '#5a5546');
    ctx.strokeStyle = '#c35a4a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(192, 446, 42, 0, Math.PI * 2); ctx.stroke();
    T(ctx, '情報', 192, 436, 27, '#c35a4a');
    T(ctx, '求む', 192, 462, 23, '#c35a4a');
    paperNoise(ctx, w, h, 25, 0.07);
  });
}

function noticeCleaning() {
  return canvasTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = '#dfe8d8'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#37684f'; ctx.fillRect(0, 0, w, 100);
    T(ctx, '商店街', 192, 34, 26, '#dfe8d8');
    T(ctx, '大清掃', 192, 74, 42, '#fbf7e8');
    T(ctx, '参加者募集', 192, 176, 34, '#37684f');
    ctx.fillStyle = '#f7f2df';
    rr(ctx, 40, 222, 304, 180, 8); ctx.fill();
    T(ctx, '10月22日（日）', 192, 268, 30, '#3d4a3d');
    T(ctx, '午前 8:00 〜', 192, 312, 26, '#3d4a3d');
    T(ctx, '集合：星マート前', 192, 352, 24, '#3d4a3d');
    T(ctx, 'ほうき・軍手は ご持参ください', 192, 386, 17, '#61705d');
    T(ctx, '星町商店街振興組合', 192, 462, 20, '#37684f');
    ctx.strokeStyle = '#37684f'; ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    paperNoise(ctx, w, h, 31, 0.05);
  });
}

// ── 道路标识 / 铭牌 ─────────────────────────────────────────
function streetSign() {
  return canvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1b5d55'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e9f0e5'; ctx.lineWidth = 10;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    T(ctx, '星町一丁目', 512, 104, 78, '#f7f8ee');
    T(ctx, 'Hoshimachi 1-chome', 512, 174, 34, '#cfdfd2', { family: EN, spacing: '2px' });
    // 箭头
    ctx.fillStyle = '#f7f8ee';
    ctx.beginPath(); ctx.moveTo(88, 128); ctx.lineTo(138, 92); ctx.lineTo(138, 114);
    ctx.lineTo(190, 114); ctx.lineTo(190, 142); ctx.lineTo(138, 142); ctx.lineTo(138, 164);
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(874, 128); ctx.rotate(Math.PI);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(50, -36); ctx.lineTo(50, -14);
    ctx.lineTo(102, -14); ctx.lineTo(102, 14); ctx.lineTo(50, 14); ctx.lineTo(50, 36);
    ctx.closePath(); ctx.fill(); ctx.restore();
  });
}

function stopSign() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(256, 268);
    ctx.beginPath();
    ctx.moveTo(0, -218); ctx.lineTo(238, 126); ctx.lineTo(-238, 126); ctx.closePath();
    ctx.fillStyle = '#f6f2e4'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -188); ctx.lineTo(206, 108); ctx.lineTo(-206, 108); ctx.closePath();
    ctx.fillStyle = '#c03f37'; ctx.fill();
    ctx.fillStyle = '#fff9ed';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    setFont(ctx, 108, 'bold', JP);
    ctx.fillText('止まれ', 0, 18);
    ctx.restore();
  });
}

function parkingSign() {
  return canvasTexture(512, 680, (ctx, w, h) => {
    ctx.fillStyle = '#f1ecdf'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#245a72'; ctx.fillRect(0, 0, w, 570);
    ctx.strokeStyle = '#f1ecdf'; ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, w - 40, 530);
    T(ctx, 'P', 256, 222, 330, '#f6f1e5', { family: EN });
    T(ctx, '駐車場', 256, 470, 66, '#f6f1e5');
    T(ctx, '24H', 256, 618, 44, '#245a72', { family: EN, spacing: '6px' });
    T(ctx, '星マート', 256, 660, 24, '#5e675f');
  });
}

function roadsideStopPaint() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(240,238,224,.88)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(Math.PI);
    setFont(ctx, 150, 'bold', JP);
    ctx.fillText('止', 0, -150);
    ctx.fillText('ま', 0, 20);
    ctx.fillText('れ', 0, 190);
    ctx.restore();
  });
}

function manhole() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#20262a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#596065'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(256, 256, 238, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#353d40'; ctx.lineWidth = 4;
    for (let r = 60; r < 230; r += 34) {
      ctx.beginPath(); ctx.arc(256, 256, r, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(a) * 52, 256 + Math.sin(a) * 52);
      ctx.lineTo(256 + Math.cos(a) * 226, 256 + Math.sin(a) * 226);
      ctx.stroke();
    }
    ctx.fillStyle = '#272e31'; ctx.beginPath(); ctx.arc(256, 256, 52, 0, Math.PI * 2); ctx.fill();
    T(ctx, '星', 256, 254, 50, '#6e787c');
  });
}

function plaque() {
  return canvasTexture(1600, 400, (ctx, w, h) => {
    ctx.fillStyle = '#24221d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#8c7a55'; ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = '#5b4f39'; ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, w - 76, h - 76);
    ctx.fillStyle = '#c1a971';
    starPath(ctx, 112, 200, 52, 22, 5); ctx.fill();
    T(ctx, '星町 ・ 雨夜の街角', 850, 148, 68, '#d3bd8e');
    T(ctx, 'HOSHIMACHI — A RAINY NIGHT CORNER', 850, 232, 30, '#8f8061', {
      family: EN, spacing: '3px',
    });
    T(ctx, 'No. 01　　SCALE 1:90', 850, 306, 26, '#7f7359', { family: EN, spacing: '3px' });
    speckle(ctx, w, h, 400, 71, 0.05, '#d8c79d');
  });
}

function floorDecal() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#2f7a64';
    ctx.save(); ctx.translate(256, 256); ctx.rotate(-0.5);
    ctx.beginPath(); ctx.moveTo(0, -210); ctx.lineTo(116, -30); ctx.lineTo(54, -30);
    ctx.lineTo(54, 170); ctx.lineTo(-54, 170); ctx.lineTo(-54, -30); ctx.lineTo(-116, -30);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    T(ctx, 'レジ', 256, 420, 90, '#2f7a64');
    ctx.globalAlpha = 0.75;
    T(ctx, 'REGISTER', 256, 478, 26, '#2f7a64', { family: EN, spacing: '4px' });
  });
}

function staffDoor() {
  return canvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = '#e8dfc9'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#a9453b'; ctx.fillRect(0, 0, w, 54);
    T(ctx, 'STAFF ONLY', 256, 28, 30, '#f7efe0', { family: EN, spacing: '4px' });
    T(ctx, '関係者以外 立入禁止', 256, 112, 34, '#504d43');
    T(ctx, 'HOSHI MART', 256, 160, 20, '#8b8676', { family: EN, spacing: '3px' });
  });
}

function autoDoor() {
  return canvasTexture(800, 200, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f2e8cf';
    rr(ctx, 6, 22, w - 12, 156, 20); ctx.fill();
    ctx.fillStyle = '#1a5a52';
    rr(ctx, 8, 24, 26, 152, 10); ctx.fill();
    rr(ctx, w - 34, 24, 26, 152, 10); ctx.fill();
    T(ctx, '自動ドア', 400, 92, 62, '#1a5a52');
    T(ctx, 'AUTOMATIC DOOR', 400, 146, 24, '#5f6f62', { family: EN, spacing: '4px' });
  });
}

function sidewalkTex() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#6e6f72'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#626367'; ctx.fillRect(0, 0, w, 8);
    ctx.fillRect(0, 0, 8, h);
    ctx.strokeStyle = '#55565a'; ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    for (let i = 0; i < 5; i++) ctx.fillRect(20, 20 + i * 98, w - 40, 2);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 12; i++) {
      const r = mulberry32(88 + i);
      ctx.fillStyle = '#25282c';
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 12 + r() * 40, 5 + r() * 18, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    speckle(ctx, w, h, 900, 44, 0.08, '#1c1e22');
    speckle(ctx, w, h, 400, 45, 0.10, '#c8c7c2');
  });
}

function wallTile() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#174c46'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 8; x++) {
        const off = (y % 2) * 32;
        ctx.fillStyle = (x + y) % 5 === 0 ? '#1b554e' : '#164a44';
        ctx.fillRect(x * 64 + off + 2, y * 64 + 2, 60, 60);
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.fillRect(x * 64 + off + 6, y * 64 + 5, 52, 3);
      }
    }
    ctx.fillStyle = '#0d312e';
    for (let y = 0; y <= 4; y++) ctx.fillRect(0, y * 64 - 1, w, 4);
    for (let x = 0; x <= 8; x++) ctx.fillRect(x * 64 - 1, 0, 4, h);
    speckle(ctx, w, h, 300, 55, 0.06, '#000000');
  });
}

// ── 雨 / 氛围贴图 ───────────────────────────────────────────
function glassRain() {
  return canvasTexture(2048, 704, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const r = mulberry32(909);
    for (let i = 0; i < 240; i++) {
      const x = r() * w, y = r() * h;
      const rad = 2 + r() * 9;
      ctx.fillStyle = `rgba(214,236,244,${0.06 + r() * 0.16})`;
      ctx.beginPath(); ctx.ellipse(x, y, rad * (0.6 + r() * 0.6), rad, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.3})`;
      ctx.beginPath(); ctx.arc(x - rad * 0.25, y - rad * 0.3, Math.max(0.7, rad * 0.22), 0, Math.PI * 2); ctx.fill();
      if (r() > 0.62) {
        const len = 30 + r() * 190;
        const grad = ctx.createLinearGradient(x, y, x, y + len);
        grad.addColorStop(0, 'rgba(210,232,240,.18)');
        grad.addColorStop(1, 'rgba(210,232,240,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2 + r() * 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 12, y + len); ctx.stroke();
      }
    }
    // 大片水痕
    for (let i = 0; i < 18; i++) {
      const x = r() * w, y = r() * h;
      const grad = ctx.createLinearGradient(x, y, x + 4, y + 250);
      grad.addColorStop(0, 'rgba(220,240,245,0.10)');
      grad.addColorStop(1, 'rgba(220,240,245,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 6 + r() * 14;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 8, y + 80, x - 6, y + 160, x + 4, y + 250);
      ctx.stroke();
    }
  }, { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
}

function glowTex() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

function splashTex() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(220,240,245,.85)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(128, 128, 84, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,240,245,.35)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(128, 128, 62, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(230,245,250,.9)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96, 4, 2.5, a, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function steamTex() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,250,240,.7)');
    g.addColorStop(0.45, 'rgba(255,248,235,.28)');
    g.addColorStop(1, 'rgba(255,248,235,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

function lightSpill() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,214,150,.65)');
    g.addColorStop(0.5, 'rgba(255,206,140,.22)');
    g.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-in';
    const gx = ctx.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(0,0,0,0)');
    gx.addColorStop(0.16, 'rgba(0,0,0,.9)');
    gx.addColorStop(0.84, 'rgba(0,0,0,.9)');
    gx.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gx; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  });
}

function bikeSticker() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0e4c46'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f0e6ce';
    T(ctx, '駐輪場', 256, 90, 86, '#f0e6ce');
    T(ctx, 'NO PARKING', 256, 160, 30, '#a9c1b5', { family: EN, spacing: '5px' });
    T(ctx, '星マート', 256, 212, 26, '#d9cba7');
  });
}

// ── 汇总 ─────────────────────────────────────────────────────
export function createTextures() {
  return {
    fascia: fascia(),
    pylon: pylonSign(),
    posters: [posterOnigiri(), posterKaraage(), posterCoffee(), posterATM()],
    lightboxes: [lightboxOden(), lightboxBread()],
    categories: {
      food: categorySign('おにぎり・弁当', 'RICE & BENTO'),
      drink: categorySign('飲料', 'DRINKS', '#164a5c'),
      snack: categorySign('お菓子', 'SWEETS', '#6b422f'),
      daily: categorySign('日用品', 'DAILY GOODS', '#3b4b61'),
    },
    priceStrip: priceStrip(),
    magazines: [0, 1, 2, 3, 4, 5].map(magazineCover),
    vending: [vendingFront(0), vendingFront(1)],
    notices: [noticeFestival(), noticeCat(), noticeCleaning()],
    streetSign: streetSign(),
    stopSign: stopSign(),
    parkingSign: parkingSign(),
    roadStop: roadsideStopPaint(),
    manhole: manhole(),
    plaque: plaque(),
    floorDecal: floorDecal(),
    staffDoor: staffDoor(),
    autoDoor: autoDoor(),
    sidewalk: sidewalkTex(),
    wallTile: wallTile(),
    glassRain: glassRain(),
    glow: glowTex(),
    splash: splashTex(),
    steam: steamTex(),
    spill: lightSpill(),
    bikeSign: bikeSticker(),
  };
}
