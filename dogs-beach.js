// Солнечный остров: породы 17 и 18.
// Аксессуары (жилет, кепка, свисток, кудри, пучок, бантики) подключаются
// к рисованию из dog.js через drawScarf и drawCrown, другие файлы менять не нужно

DOG_LEVELS[17] = {
  name: 'Лабрадор-спасатель', coin: 1800000,
  body: '#7a4a2a', dark: '#4a2a14', light: '#b07a52', shine: '#9a6a46', spot: null,
  ear: '#6a3e22', earFar: '#3e2210', earSize: 1.05,
  collar: '#e03131',
  scarf: true, vest: ['#e03131', '#8f1d1d', '#ffd43b'],   // спасательный жилет вместо шарфа
  crown: true, lgCap: true,                                // кепка спасателя
  eyePatch: '#6e4224', brow: '#3e2210', mouth: '#1a0e06',
  legNear: '#7a4a2a', legFar: '#4f3018',
  outline: 'rgba(40,20,8,0.6)', whisker: '#4a2a14',
  ears: 'floppy', tail: 'long', legLen: 1.1, bodyLen: 1.15, bodyH: 1.12
};

DOG_LEVELS[18] = {
  name: 'Пудель', coin: 4500000,
  body: '#f2b27a', dark: '#c97d45', light: '#ffe1c4', shine: '#ffd2a8', spot: null,
  ear: '#e8a068', earFar: '#b8703a', earSize: 1.1,
  collar: '#e64980',
  scarf: true, curls: ['#ffe8d0', '#c97d45'], bow: '#e64980',   // кудри и бантик на шее
  crown: true, topknot: true,                                   // пучок на макушке
  brow: '#c97d45',
  legNear: '#f5bc8a', legFar: '#d0894e',
  outline: 'rgba(110,55,20,0.5)', whisker: '#c08050',
  ears: 'floppy', tail: 'fluffy', legLen: 1.2, bodyLen: 1.0, bodyH: 1.0
};

(function () {
  // Шарф рисуется после тела и перед головой: сюда попадают жилет и кудри
  const scarf = drawScarf;
  drawScarf = function (ctx, L, bw, cy, OUT, t) {
    if (L.vest) return drawVest(ctx, L, bw, cy, OUT);
    if (L.curls) return drawCurls(ctx, L, bw, cy);
    return scarf(ctx, L, bw, cy, OUT, t);
  };

  // Корона рисуется последней в координатах головы: сюда попадают кепка и пучок
  const crown = drawCrown;
  drawCrown = function (ctx, now) {
    const d = Dog.drawing, L = d && d.info;
    if (L && L.lgCap) return drawLifeguardCap(ctx, L);
    if (L && L.topknot) return drawTopknot(ctx, L, now);
    return crown(ctx, now);
  };
})();

// ================= ЖИЛЕТ И СВИСТОК (лабрадор) =================
function drawVest(ctx, L, bw, cy, OUT) {
  const [red, dark, stripe] = L.vest;
  const bh = 14.5 * (L.bodyH || 1);
  const x0 = -bw * 0.2, x1 = bw * 0.8, mid = (x0 + x1) / 2;

  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, cy, bw, bh, 0, 0, Math.PI * 2); ctx.clip();

  // Ткань жилета
  const g = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
  g.addColorStop(0, '#ff8787');
  g.addColorStop(0.4, red);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, cy - bh); ctx.lineTo(x1, cy - bh); ctx.lineTo(x1 + 4, cy + bh); ctx.lineTo(x0 - 3, cy + bh);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(x0, cy - bh); ctx.lineTo(x0 - 3, cy + bh); ctx.stroke();

  // Отражающие полосы
  for (const sx of [x0 + 5, x1 - 6]) {
    ctx.fillStyle = stripe;
    ctx.fillRect(sx - 1.6, cy - bh, 3.2, bh * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(sx - 1.6, cy - bh, 1, bh * 2);
  }

  // Белый крест
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(mid - 1.6, cy - 6.5, 3.2, 9);
  ctx.fillRect(mid - 4.5, cy - 3.6, 9, 3.2);

  // Ремешок и блик на ткани
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(x0 - 3, cy + 5, x1 - x0 + 8, 2.6);
  U.softEllipse(ctx, mid - 4, cy - bh + 4, bw * 0.4, 3, '255,255,255', 0.35);
  ctx.restore();

  // Пряжка
  U.rrect(ctx, mid - 3, cy + 4.1, 6, 4.4, 1);
  ctx.fillStyle = '#ffd43b';
  ctx.fill();
  ctx.strokeStyle = '#8a6a00';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = '#5a4300';
  ctx.fillRect(mid - 1.4, cy + 5.4, 2.8, 1.8);

  // Шнурок и свисток
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bw - 9, cy - 11); ctx.quadraticCurveTo(bw - 4, cy - 2, bw - 1, cy + 3); ctx.stroke();
  ctx.save();
  ctx.translate(bw - 1, cy + 4.5);
  ctx.rotate(0.4);
  const wg = ctx.createLinearGradient(0, -2, 0, 2);
  wg.addColorStop(0, '#ffffff');
  wg.addColorStop(1, '#868e96');
  U.rrect(ctx, -2, -2, 6.5, 4, 1.8);
  ctx.fillStyle = wg;
  ctx.fill();
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  U.ellipse(ctx, -1.5, 0, 2.3, 2.3, '#dee2e6', '#495057');
  U.ellipse(ctx, -2.2, -0.8, 0.7, 0.5, '#ffffff');
  ctx.restore();
}

// ================= КЕПКА СПАСАТЕЛЯ (лабрадор) =================
function drawLifeguardCap(ctx, L) {
  const OUT = L.outline;
  ctx.save();
  ctx.translate(-1, -10);
  ctx.rotate(-0.15);
  ctx.lineJoin = 'round';

  // Козырёк смотрит вперёд
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.quadraticCurveTo(16, -1.5, 21, 2.5);
  ctx.quadraticCurveTo(14, 4.2, 6, 3.5);
  ctx.closePath();
  const vg = ctx.createLinearGradient(6, 0, 21, 3);
  vg.addColorStop(0, '#e03131');
  vg.addColorStop(1, '#8f1d1d');
  ctx.fillStyle = vg;
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Купол
  ctx.beginPath();
  ctx.moveTo(-13, 1);
  ctx.bezierCurveTo(-13, -16, 12, -16, 12.5, 1);
  ctx.closePath();
  const dg = ctx.createRadialGradient(-4, -9, 1, 0, -4, 15);
  dg.addColorStop(0, '#ff8787');
  dg.addColorStop(0.55, '#e03131');
  dg.addColorStop(1, '#a51e1e');
  ctx.fillStyle = dg;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-0.5, -12); ctx.quadraticCurveTo(-5, -6, -6, 1);
  ctx.moveTo(-0.5, -12); ctx.quadraticCurveTo(4, -6, 5.5, 1);
  ctx.stroke();
  U.softEllipse(ctx, -5, -8, 6, 3, '255,255,255', 0.4);
  ctx.restore();

  // Белый крест спереди
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3.6, -8, 2.4, 6.5);
  ctx.fillRect(1.6, -5.9, 6.4, 2.4);

  // Белый околыш и пуговка
  U.rrect(ctx, -13.5, -1.5, 26.5, 3.4, 1.7);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = OUT;
  ctx.stroke();
  U.ellipse(ctx, -0.5, -12, 1.8, 1.4, '#c92a2a', OUT);
  ctx.restore();
}

// ================= КУДРИ (пудель) =================
// Пушистый комок из нескольких кругов с колечками шерсти
function curlyPuff(ctx, cx, cy, R, n, L) {
  const [lt, dk] = L.curls;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    pts.push([cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.68, R * 0.46]);
  }
  pts.push([cx, cy, R * 0.6]);
  const path = () => {
    ctx.beginPath();
    for (const [x, y, r] of pts) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
  };
  path();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = L.outline;
  ctx.stroke();
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, 1, cx, cy, R * 1.2);
  g.addColorStop(0, lt);
  g.addColorStop(0.6, L.body);
  g.addColorStop(1, dk);
  path();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,80,30,0.45)';
  ctx.lineWidth = 0.8;
  for (const [x, y, r] of pts) {
    ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0.3, Math.PI * 1.6); ctx.stroke();
  }
}

function drawBow(ctx, x, y, s, col) {
  const edge = 'rgba(90,10,40,0.6)';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 0.8;
  for (const sg of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sg * 5, -4.5, sg * 5.5, 0);
    ctx.quadraticCurveTo(sg * 5, 4.5, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(sg * 2.6, 5.5); ctx.lineTo(sg * 0.8, 5);
    ctx.closePath();
    ctx.fill();
  }
  U.ellipse(ctx, 0, 0, 1.6, 1.8, col, edge);
  U.ellipse(ctx, -3, -1.2, 1.2, 0.6, 'rgba(255,255,255,0.6)');
  ctx.restore();
}

// Колечки на теле, жабо на груди, бантик на шее
function drawCurls(ctx, L, bw, cy) {
  const bh = 14.5 * (L.bodyH || 1);
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, cy, bw, bh, 0, 0, Math.PI * 2); ctx.clip();
  ctx.lineWidth = 1;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 9; i++) {
      const x = -bw + 4 + i * (bw * 2 - 8) / 8 + (row % 2) * 2.5;
      const y = cy - bh + 4 + row * (bh * 2 - 6) / 4;
      ctx.strokeStyle = row < 2 ? 'rgba(255,255,255,0.55)' : 'rgba(150,80,30,0.35)';
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0.4, Math.PI * 1.7); ctx.stroke();
    }
  }
  ctx.restore();
  curlyPuff(ctx, bw - 5, cy - 6, 9, 6, L);
  drawBow(ctx, bw - 3, cy - 13, 1, L.bow);
}

// Пушистые уши и пучок с бантиком на макушке
function drawTopknot(ctx, L, now) {
  curlyPuff(ctx, -7, 3, 8, 6, L);
  const by = -13 + Math.sin(now * 4) * 0.6;
  curlyPuff(ctx, -2, by, 9.5, 7, L);
  drawBow(ctx, 4.5, by - 6, 0.95, L.bow);
}
