// Снежная долина: породы 10–15 уровня.
// Новые детали (грива, шапки, шлейка, ледяная корона, сияние, синий язык)
// подключаются к рисованию из dog.js через функции drawScarf и drawCrown,
// поэтому сам dog.js менять не нужно

DOG_LEVELS[10] = {
  name: 'Акита-ину', coin: 3800,
  body: '#dd8a3e', dark: '#a85a1e', light: '#fff8ef', shine: '#f4b06a', spot: null,
  ear: '#c9732e', earFar: '#8f4a16', earInner: '#f5c2a6', earSize: 0.9,
  collar: '#2f9e44', scarf: ['#2f9e44', '#ffffff'],
  mask: true, bib: true, brow: '#fff1dc',
  legNear: '#f8dcbc', legFar: '#c77d3a',
  outline: 'rgba(90,45,10,0.55)', whisker: '#b98a5a',
  ears: 'pointy', tail: 'curl', legLen: 1.1, bodyLen: 1.1, bodyH: 1.08
};

DOG_LEVELS[11] = {
  name: 'Чау-чау', coin: 9000,
  body: '#cf6f2c', dark: '#8f3f12', light: '#f6be86', shine: '#eb9a5c', spot: null,
  ear: '#b85a20', earFar: '#7e3510', earInner: '#e89a70', earSize: 0.72,
  collar: '#7048e8', scarf: ['#7048e8', '#ffe066'],
  mane: ['#d97a36', '#f6b373', '#8f3f12'],   // грива: основной цвет, светлые кончики, тень
  hat: ['#7048e8', '#ffffff', '#ffe066'],    // шапка: вязка, отворот, помпон
  crown: true,                               // включает рисование головного убора
  tongue: '#5b5bd6',                         // синий язык
  muzzle: '#f0b27a', brow: '#8f3f12',
  legNear: '#d98a4a', legFar: '#a5541f',
  outline: 'rgba(85,35,8,0.55)', whisker: '#a86a3a',
  ears: 'pointy', tail: 'curl', legLen: 0.85, bodyLen: 1.05, bodyH: 1.18
};

DOG_LEVELS[12] = {
  name: 'Маламут', coin: 21000,
  body: '#9aa3ad', dark: '#4b5260', light: '#ffffff', shine: '#c3cad2', spot: null,
  saddle: '#5a5f68', saddleH: 10, mask: true, bib: true,
  ear: '#545b66', earFar: '#3a404a', earInner: '#f0c8c2',
  collar: '#f76707', scarf: ['#f76707', '#ffffff'],
  harness: ['#c92a2a', '#2b2b2b'],           // ездовая шлейка: лямки и полоска
  legNear: '#f6f7f9', legFar: '#c3cad3',
  outline: 'rgba(25,32,45,0.55)', whisker: '#7d8896',
  ears: 'pointy', tail: 'curl', legLen: 1.15, bodyLen: 1.12, bodyH: 1.15
};

DOG_LEVELS[13] = {
  name: 'Ньюфаундленд', coin: 50000,
  body: '#2a2523', dark: '#141110', light: '#5a4f48', shine: '#4a423d', spot: null,
  ear: '#1e1a18', earFar: '#100d0c', earSize: 1.15,
  collar: '#e03131', scarf: ['#e03131', '#ffe066'],
  eyePatch: '#2a2523',                       // на чёрной морде моргание рисуется светлой линией
  brow: '#4a423d', mouth: '#000000',
  ushanka: ['#4a3a30', '#eadbc0', '#b9a07a', '#e03131'],   // верх, мех, тень меха, звезда
  crown: true,
  legNear: '#2f2a27', legFar: '#1a1614',
  tailColor: '#2a2523', tailTop: '#141110', tailTip: '#3a332f',
  outline: 'rgba(0,0,0,0.6)', whisker: '#6a5d55',
  ears: 'floppy', tail: 'bushy', legLen: 1.05, bodyLen: 1.25, bodyH: 1.22
};

DOG_LEVELS[14] = {
  name: 'Тибетский мастиф', coin: 120000,
  body: '#3a2a22', dark: '#1e140f', light: '#d08a4a', shine: '#5a4436', spot: null,
  mane: ['#3a2a22', '#8a5a34', '#140d09'],
  ear: '#2a1d16', earFar: '#140d09', earSize: 0.9,
  collar: '#f59f00', scarf: ['#c92a2a', '#ffd43b'],
  eyePatch: '#3a2a22', muzzle: '#c98444', brow: '#e09a52', mouth: '#000000',
  legNear: '#c98444', legFar: '#8a5a30',
  outline: 'rgba(0,0,0,0.6)', whisker: '#8a6a4a',
  ears: 'floppy', tail: 'curl', legLen: 1.1, bodyLen: 1.22, bodyH: 1.2
};

DOG_LEVELS[15] = {
  name: 'Ледяной волкодав', coin: 300000,
  body: '#dff3ff', dark: '#7fb3d9', light: '#ffffff', shine: '#ffffff', spot: null,
  saddle: '#b8dcf5', saddleH: 9, mask: true, bib: true,
  ear: '#cfe9fb', earFar: '#8fc0e2', earInner: '#9fd8ff', earSize: 1.15,
  collar: '#1c7ed6', scarf: ['#4dabf7', '#e7f5ff'],
  eye: ['#e6fdff', '#38d9ff', '#0b6e99'], brow: '#7fb3d9',
  iceCrown: true, crown: true, aura: true,   // ледяная корона и сияние
  legNear: '#f0f9ff', legFar: '#b5d6ec',
  tailColor: '#d4ecfb', tailTop: '#8fc0e2', tailTip: '#ffffff',
  outline: 'rgba(30,70,110,0.55)', whisker: '#7aa6c6',
  ears: 'pointy', tail: 'bushy', legLen: 1.2, bodyLen: 1.2, bodyH: 1.08
};

(function () {
  // Запоминаем, какая собака рисуется сейчас: головным уборам и языку нужны её данные.
  // Сияние рисуется до собаки, снежинки после
  const draw = Dog.prototype.draw;
  Dog.prototype.draw = function (ctx) {
    Dog.drawing = this;
    const L = this.info;
    try {
      if (L && L.aura) drawAura(ctx, this, false);
      draw.call(this, ctx);
      if (L && L.aura) drawAura(ctx, this, true);
    } finally {
      Dog.drawing = null;
    }
  };

  // Шарф рисуется после тела и перед головой. Грива и шлейка рисуются там же
  const scarf = drawScarf;
  drawScarf = function (ctx, L, bw, cy, OUT, t) {
    if (L.mane) drawMane(ctx, L, bw + 2, cy - 17, OUT);
    if (L.harness) drawHarness(ctx, L, bw, cy, OUT);
    scarf(ctx, L, bw, cy, OUT, t);
  };

  // Корона рисуется последней в координатах головы. Вместо неё может быть другой убор
  const crown = drawCrown;
  drawCrown = function (ctx, now) {
    const d = Dog.drawing, L = d && d.info;
    if (L && L.tongue && (d.happy > 0 || d.held)) blueTongue(ctx, L.tongue);
    if (L && L.hat) drawHat(ctx, now, L);
    else if (L && L.ushanka) drawUshanka(ctx, now, L);
    else if (L && L.iceCrown) drawIceCrown(ctx, now);
    else crown(ctx, now);
  };
})();

// ================= ГРИВА (чау-чау, мастиф) =================
function drawMane(ctx, L, hx, hy, OUT) {
  const [main, tip, shade] = L.mane;
  const puffs = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    puffs.push([Math.cos(a) * 16, Math.sin(a) * 15 + 2, 7 + (i % 3) * 0.9]);
  }
  const path = () => {
    ctx.beginPath();
    for (const [x, y, r] of puffs) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
    ctx.moveTo(16, 2);
    ctx.ellipse(0, 2, 16, 15, 0, 0, Math.PI * 2);
  };

  ctx.save();
  ctx.translate(hx - 3, hy + 2);

  // Толстый контур, сверху заливка: снаружи остаётся только внешний край
  path();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  const g = ctx.createRadialGradient(-6, -6, 3, 0, 2, 26);
  g.addColorStop(0, tip);
  g.addColorStop(0.55, main);
  g.addColorStop(1, shade);
  path();
  ctx.fillStyle = g;
  ctx.fill();

  // Светлые кончики сверху слева
  for (const [x, y, r] of puffs) {
    if (x + y < 6) U.ellipse(ctx, x - r * 0.2, y - r * 0.3, r * 0.5, r * 0.32, tip, null, -0.6);
  }

  // Пряди
  ctx.strokeStyle = shade;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (const [x, y, r] of puffs) {
    const a = Math.atan2(y - 2, x);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2);
    ctx.lineTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75);
    ctx.stroke();
  }
  ctx.restore();
}

// ================= ЯЗЫК (чау-чау) =================
function blueTongue(ctx, color) {
  ctx.lineWidth = 1.2;
  U.ellipse(ctx, 14, 11, 3.5, 4.5, color, '#2a2a80');
  ctx.strokeStyle = '#2a2a80';
  ctx.beginPath(); ctx.moveTo(14, 8.5); ctx.lineTo(14, 12.5); ctx.stroke();
  U.ellipse(ctx, 13, 10, 1, 1.4, 'rgba(255,255,255,0.4)');
}

// ================= ВЯЗАНАЯ ШАПКА (чау-чау) =================
function drawHat(ctx, now, L) {
  const [c1, c2, pom] = L.hat;
  const OUT = L.outline;
  ctx.save();
  ctx.translate(-2, -7);
  ctx.rotate(-0.22);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Купол
  ctx.beginPath();
  ctx.moveTo(-13.5, 0);
  ctx.bezierCurveTo(-14, -19, 14, -19, 13.5, 0);
  ctx.closePath();
  ctx.fillStyle = c1;
  ctx.fill();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = OUT;
  ctx.stroke();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let x = -11; x <= 11; x += 4.4) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x * 0.75, -9, x * 0.35, -15); ctx.stroke();
  }
  ctx.fillStyle = c2;
  ctx.fillRect(-15, -8.5, 30, 2.6);
  U.softEllipse(ctx, -5, -10, 7, 4, '255,255,255', 0.4);
  U.softEllipse(ctx, 8, -2, 8, 6, '0,0,0', 0.2);
  ctx.restore();

  // Отворот в рубчик
  U.rrect(ctx, -15, -2.5, 30, 6.5, 3.2);
  ctx.fillStyle = c2;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.13)';
  ctx.lineWidth = 1;
  for (let x = -12; x <= 12; x += 3) {
    ctx.beginPath(); ctx.moveTo(x, -1.3); ctx.lineTo(x, 2.8); ctx.stroke();
  }

  // Помпон подпрыгивает
  const by = -16.5 + Math.sin(now * 6) * 0.8;
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    U.ellipse(ctx, Math.cos(a) * 4.4, by + Math.sin(a) * 4.2, 1.6, 1.6, pom, OUT);
  }
  const pg = ctx.createRadialGradient(-1.5, by - 1.5, 0.5, 0, by, 6);
  pg.addColorStop(0, '#fffbe0');
  pg.addColorStop(0.6, pom);
  pg.addColorStop(1, '#e0a800');
  U.ellipse(ctx, 0, by, 4.6, 4.4, pg);
  U.ellipse(ctx, -1.5, by - 1.6, 1.4, 1, 'rgba(255,255,255,0.8)');
  ctx.restore();
}

// ================= ШЛЕЙКА (маламут) =================
function drawHarness(ctx, L, bw, cy, OUT) {
  const [c1, c2] = L.harness;
  const bh = 14.5 * (L.bodyH || 1);
  const bx = bw * 0.38;                       // полоса на груди за передними лапами

  // Лямка вдоль спины идёт чуть ниже верхнего края тела
  const x0 = bx, y0 = cy - 0.9 * bh + 2;
  const x2 = -bw * 0.7, y2 = cy - 0.71 * bh + 2;
  const ym = cy - bh + 2.5;
  const yc = (ym - 0.25 * y0 - 0.25 * y2) * 2;
  const back = () => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(-bw * 0.1, yc, x2, y2);
  };

  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, cy, bw, bh, 0, 0, Math.PI * 2); ctx.clip();
  ctx.lineCap = 'round';

  back(); ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.stroke();
  back(); ctx.strokeStyle = c1; ctx.lineWidth = 4.5; ctx.stroke();
  back(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = OUT;
  ctx.fillRect(bx - 3.6, cy - bh, 7.2, bh * 2);
  ctx.fillStyle = c1;
  ctx.fillRect(bx - 2.8, cy - bh, 5.6, bh * 2);
  ctx.fillStyle = c2;
  ctx.fillRect(bx - 0.6, cy - bh, 1.2, bh * 2);

  // Строчка
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([1.5, 1.5]);
  ctx.beginPath(); ctx.moveTo(bx - 2, cy - bh); ctx.lineTo(bx - 2, cy + bh); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Кольцо для поводка на спине
  const rx = -bw * 0.13, ry = ym - 3.5;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8a6a00';
  ctx.beginPath(); ctx.ellipse(rx, ry, 3, 3.3, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = '#ffd43b';
  ctx.stroke();

  // Пряжка на груди
  U.rrect(ctx, bx - 3.4, cy + 1, 6.8, 5.2, 1.2);
  ctx.fillStyle = '#ffd43b';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#8a6a00';
  ctx.stroke();
  ctx.fillStyle = '#5a4300';
  ctx.fillRect(bx - 1.6, cy + 2.4, 3.2, 2.4);
}

// ================= УШАНКА (ньюфаундленд) =================
function drawUshanka(ctx, now, L) {
  const [felt, fur, furShade, star] = L.ushanka;
  const OUT = L.outline;
  ctx.save();
  ctx.translate(-2, -11);
  ctx.rotate(-0.18);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const furGrad = (y1, y2) => {
    const g = ctx.createLinearGradient(0, y1, 0, y2);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, fur);
    g.addColorStop(1, furShade);
    return g;
  };

  // Ухо шапки свисает сзади и покачивается
  ctx.save();
  ctx.translate(-11, -1);
  ctx.rotate(0.15 + Math.sin(now * 3) * 0.06);
  U.rrect(ctx, -4.5, 0, 9, 16, 4.5);
  ctx.fillStyle = furGrad(0, 16);
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  ctx.strokeStyle = furShade;
  ctx.lineWidth = 0.9;
  for (const [x, y] of [[-2, 4], [1.5, 6], [-1, 9], [2, 11], [-2, 13]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.8, y + 2); ctx.stroke();
  }
  // Завязка с помпоном
  ctx.strokeStyle = felt;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 15.5); ctx.quadraticCurveTo(2.5, 20, -1, 23); ctx.stroke();
  U.ellipse(ctx, -1, 23.6, 1.4, 1.4, fur, OUT);
  ctx.restore();

  // Верх шапки
  ctx.beginPath();
  ctx.moveTo(-13.5, -1);
  ctx.bezierCurveTo(-13.5, -17, 13, -17, 13, -1);
  ctx.closePath();
  const fg = ctx.createLinearGradient(-12, -15, 12, 0);
  fg.addColorStop(0, '#7a6656');
  fg.addColorStop(0.5, felt);
  fg.addColorStop(1, '#2a2019');
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-0.5, -13.5); ctx.quadraticCurveTo(1, -7, 0.5, -1); ctx.stroke();
  U.softEllipse(ctx, -5, -10, 6, 3.5, '255,255,255', 0.3);
  ctx.restore();

  // Меховой отворот
  U.rrect(ctx, -15.5, -5, 30, 8.5, 4.2);
  ctx.fillStyle = furGrad(-5, 3.5);
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  for (let x = -13; x <= 12; x += 3) {
    U.ellipse(ctx, x, -4.6, 1.8, 1.2, '#ffffff');
    U.ellipse(ctx, x + 1.4, 3.1, 1.7, 1.1, furShade);
  }
  ctx.strokeStyle = furShade;
  ctx.lineWidth = 0.8;
  for (let x = -12; x <= 11; x += 2.6) {
    ctx.beginPath(); ctx.moveTo(x, -2); ctx.lineTo(x + 0.7, 0.8); ctx.stroke();
  }

  // Звёздочка спереди
  ctx.save();
  ctx.translate(7, -0.7);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 1.2 : 2.9, a = i * Math.PI / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = star;
  ctx.fill();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = '#f5c242';
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ================= ЛЕДЯНАЯ КОРОНА (волкодав) =================
function drawIceCrown(ctx, now) {
  ctx.save();
  ctx.translate(0, -11.5);
  ctx.rotate(-0.2);
  ctx.lineJoin = 'round';

  U.softEllipse(ctx, 0, 1, 11, 2.8, '30,90,150', 0.35);

  // Кристаллы: x, высота, наклон. Крайние рисуются первыми, центральный последним
  const shards = [[-9, 7, -0.35], [9, 7, 0.35], [-4.5, 10.5, -0.15], [4.5, 10.5, 0.15], [0, 15, 0]];
  for (const [x, h, lean] of shards) {
    const tx = x + lean * h * 0.5, ty = -h;
    const g = ctx.createLinearGradient(0, ty, 0, 0);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#a5e3ff');
    g.addColorStop(1, '#1c7ed6');
    ctx.beginPath();
    ctx.moveTo(x - 2.7, -1);
    ctx.lineTo(x - 1.6, ty * 0.55);
    ctx.lineTo(tx, ty);
    ctx.lineTo(x + 1.6, ty * 0.55);
    ctx.lineTo(x + 2.7, -1);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = '#1864ab';
    ctx.stroke();
    // Грань и блик
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x - 1.2, -1.5); ctx.lineTo(tx - 0.3, ty + 1.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,80,140,0.35)';
    ctx.beginPath(); ctx.moveTo(x + 0.8, -1.5); ctx.lineTo(tx + 0.2, ty + 2); ctx.stroke();
  }

  // Обод
  const rim = ctx.createLinearGradient(0, -3, 0, 1.5);
  rim.addColorStop(0, '#e7f5ff');
  rim.addColorStop(1, '#4dabf7');
  U.rrect(ctx, -11, -2.8, 22, 4.2, 1.8);
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1864ab';
  ctx.stroke();

  // Камень в центре
  ctx.beginPath();
  ctx.moveTo(0, -3.4); ctx.lineTo(2.4, -0.7); ctx.lineTo(0, 2); ctx.lineTo(-2.4, -0.7);
  ctx.closePath();
  ctx.fillStyle = '#3bc9db';
  ctx.fill();
  ctx.strokeStyle = '#0b7285';
  ctx.stroke();
  U.ellipse(ctx, -0.7, -1.6, 0.7, 0.5, '#ffffff');

  // Искра на верхнем кристалле каждые 2 секунды
  const t = (now % 2) / 2;
  if (t < 0.22) {
    const a = Math.sin(t / 0.22 * Math.PI), z = 5.5 * a;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -15 - z);
    ctx.quadraticCurveTo(0, -15, z, -15);
    ctx.quadraticCurveTo(0, -15, 0, -15 + z);
    ctx.quadraticCurveTo(0, -15, -z, -15);
    ctx.quadraticCurveTo(0, -15, 0, -15 - z);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ================= СИЯНИЕ И СНЕЖИНКИ (волкодав) =================
function drawAura(ctx, d, front) {
  const s = d.size * U.easeOutBack(Math.min(1, d.spawnT));
  if (s <= 0.05) return;
  const now = performance.now() / 1000;
  const lift = d.held ? 18 : 0;
  const cx = d.x, cy = d.y - d.jumpHeight() - lift - 40 * s;

  // Сзади: пульсирующее голубое свечение
  if (!front) {
    const p = 0.5 + 0.5 * Math.sin(now * 2.2);
    U.softEllipse(ctx, cx, cy, 62 * s, 46 * s, '150,215,255', 0.22 + 0.12 * p);
    return;
  }

  // Спереди: три снежинки кружат вокруг собаки
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = now * 1.4 + i * 2.094;
    const x = cx + Math.cos(a) * 46 * s, y = cy + Math.sin(a) * 18 * s;
    const z = 3.2 * s * (0.8 + 0.2 * Math.sin(a));
    ctx.globalAlpha = 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(a));
    U.ellipse(ctx, x, y, z * 1.8, z * 1.8, 'rgba(180,230,255,0.35)');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(0.8, 0.9 * s);
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const b = a * 0.5 + k * Math.PI / 3;
      ctx.moveTo(x - Math.cos(b) * z, y - Math.sin(b) * z);
      ctx.lineTo(x + Math.cos(b) * z, y + Math.sin(b) * z);
    }
    ctx.stroke();
  }
  ctx.restore();
}
