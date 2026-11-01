// Солнечный остров: породы 19 и 20.
// Аксессуары подключаются к рисованию из dog.js через drawScarf и drawCrown

DOG_LEVELS[19] = {
  name: 'Водяная собака', coin: 11000000,
  body: '#2b2b30', dark: '#141418', light: '#f1f3f5', shine: '#4a4a55', spot: null,
  ear: '#222228', earFar: '#111114', earSize: 1.1,
  collar: '#1c7ed6',
  scarf: true, diver: true, curls: ['#5a5a66', '#0e0e12'],   // кудри и надувной круг
  crown: true, snorkel: true,                                 // маска с трубкой
  eyePatch: '#2b2b30', muzzle: '#3a3a42', mouth: '#000000', brow: '#4a4a55',
  legNear: '#2f2f36', legFar: '#1a1a1e',
  outline: 'rgba(0,0,0,0.6)', whisker: '#6a6a75',
  ears: 'floppy', tail: 'fluffy', legLen: 1.05, bodyLen: 1.1, bodyH: 1.08
};

DOG_LEVELS[20] = {
  name: 'Фараонова собака', coin: 27000000,
  body: '#d9874a', dark: '#9c5626', light: '#ffd9b0', shine: '#f5b07a', spot: null,
  ear: '#d07c40', earFar: '#9c5626', earInner: '#ffb08a', earSize: 1.35,
  collar: '#f5b301',
  scarf: true, usekh: true,                    // египетское ожерелье
  crown: true, sunCrown: true, sunAura: true,  // диадема с солнцем и сияние
  eye: ['#fff3bf', '#f59f00', '#8a4b00'], brow: '#9c5626',
  legNear: '#e09658', legFar: '#a8622e',
  outline: 'rgba(90,40,10,0.55)', whisker: '#b0703c',
  ears: 'pointy', tail: 'long', legLen: 1.25, bodyLen: 1.12, bodyH: 0.95
};

(function () {
  // Сияние рисуется до собаки, искры после
  const draw = Dog.prototype.draw;
  Dog.prototype.draw = function (ctx) {
    const L = this.info;
    if (L && L.sunAura) sunAura(ctx, this, false);
    draw.call(this, ctx);
    if (L && L.sunAura) sunAura(ctx, this, true);
  };

  const scarf = drawScarf;
  drawScarf = function (ctx, L, bw, cy, OUT, t) {
    if (L.diver) return drawDiverBody(ctx, L, bw, cy);
    if (L.usekh) return drawUsekh(ctx, bw, cy);
    return scarf(ctx, L, bw, cy, OUT, t);
  };

  const crown = drawCrown;
  drawCrown = function (ctx, now) {
    const d = Dog.drawing, L = d && d.info;
    if (L && L.snorkel) return drawSnorkel(ctx);
    if (L && L.sunCrown) return drawSunCrown(ctx, now);
    return crown(ctx, now);
  };
})();

// ================= КУДРИ И НАДУВНОЙ КРУГ (водяная собака) =================
function drawDiverBody(ctx, L, bw, cy) {
  const bh = 14.5 * (L.bodyH || 1);

  // Колечки шерсти на теле
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, cy, bw, bh, 0, 0, Math.PI * 2); ctx.clip();
  ctx.lineWidth = 1;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 9; i++) {
      const x = -bw + 4 + i * (bw * 2 - 8) / 8 + (row % 2) * 2.5;
      const y = cy - bh + 4 + row * (bh * 2 - 6) / 4;
      ctx.strokeStyle = row < 2 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0.4, Math.PI * 1.7); ctx.stroke();
    }
  }
  ctx.restore();

  // Белое кудрявое жабо на груди
  const chest = Object.assign({}, L, { body: '#f1f3f5', curls: ['#ffffff', '#adb5bd'], outline: 'rgba(60,60,70,0.5)' });
  curlyPuff(ctx, bw - 5, cy - 6, 9, 6, chest);

  // Круг вокруг живота
  const x0 = -bw * 0.62, x1 = bw * 0.55, y = cy + 3, hh = 10;
  U.rrect(ctx, x0, y - hh / 2, x1 - x0, hh, hh / 2);
  const g = ctx.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
  g.addColorStop(0, '#fff3a0');
  g.addColorStop(0.45, '#ffd43b');
  g.addColorStop(1, '#e8a800');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,0,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0 + 5, y - hh / 2 + 2.2); ctx.lineTo(x1 - 6, y - hh / 2 + 2.2); ctx.stroke();
  U.ellipse(ctx, x0 + 8, y + 1, 1.6, 1.6, '#ff922b', 'rgba(120,60,0,0.6)');

  // Голова уточки спереди
  const hx = x1 + 1, hy = y - 7, edge = 'rgba(120,80,0,0.7)';
  ctx.lineWidth = 1;
  U.ellipse(ctx, x1 - 2, y - 3, 4.5, 6, '#ffd43b', edge);
  U.ellipse(ctx, hx, hy, 5.2, 4.8, '#ffe066', edge);
  ctx.fillStyle = '#ff922b';
  ctx.beginPath();
  ctx.moveTo(hx + 3.5, hy - 0.5);
  ctx.quadraticCurveTo(hx + 9, hy, hx + 3.8, hy + 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a34700';
  ctx.stroke();
  U.ellipse(ctx, hx + 1.2, hy - 1.6, 1.1, 1.3, '#1a1a1a');
  U.ellipse(ctx, hx + 1.5, hy - 2.1, 0.4, 0.4, '#ffffff');
  U.ellipse(ctx, hx - 1.5, hy - 2.5, 1.6, 0.9, 'rgba(255,255,255,0.7)');
}

// ================= МАСКА С ТРУБКОЙ (водяная собака) =================
function drawSnorkel(ctx) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Трубка идёт от рта вверх за голову
  const tube = () => {
    ctx.beginPath();
    ctx.moveTo(13, 9);
    ctx.quadraticCurveTo(2, 12, -5, 4);
    ctx.quadraticCurveTo(-9, -6, -7, -24);
  };
  tube(); ctx.strokeStyle = '#0b4f94'; ctx.lineWidth = 4.6; ctx.stroke();
  tube(); ctx.strokeStyle = '#4dabf7'; ctx.lineWidth = 3; ctx.stroke();
  tube(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
  U.rrect(ctx, -10, -29, 6.5, 6, 2);
  ctx.fillStyle = '#ff922b';
  ctx.fill();
  ctx.strokeStyle = '#a34700';
  ctx.lineWidth = 1;
  ctx.stroke();
  U.ellipse(ctx, 13.5, 9, 2.2, 1.8, '#1c7ed6', '#0b4f94');

  // Ремешок
  ctx.strokeStyle = '#1c7ed6';
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(1, -5.5); ctx.quadraticCurveTo(-6, -8, -13, -4); ctx.stroke();

  // Рамка и прозрачное стекло: глаз виден сквозь маску
  ctx.lineWidth = 1.2;
  U.ellipse(ctx, 7.2, -4.5, 6.8, 5.6, '#1c7ed6', '#0b4f94');
  U.ellipse(ctx, 7.4, -4.5, 5.2, 4.2, 'rgba(190,235,255,0.5)');
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(4.5, -6.5); ctx.lineTo(6.5, -8); ctx.stroke();
  ctx.restore();
}

// ================= ЕГИПЕТСКОЕ ОЖЕРЕЛЬЕ (фараонова собака) =================
function drawUsekh(ctx, bw, cy) {
  ctx.save();
  ctx.translate(bw - 6, cy - 8);
  ctx.rotate(-0.5);
  U.rrect(ctx, -7, -12, 14, 24, 7);
  const g = ctx.createLinearGradient(-7, 0, 7, 0);
  g.addColorStop(0, '#fff3a0');
  g.addColorStop(0.5, '#f5b301');
  g.addColorStop(1, '#b86e00');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#7a4300';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  for (const [x, col] of [[-4.2, '#1098ad'], [-0.6, '#ffe066'], [3, '#364fc7']]) {
    ctx.fillStyle = col;
    ctx.fillRect(x - 1.2, -12, 2.4, 24);
  }
  ctx.restore();
  for (let i = 0; i < 7; i++) U.ellipse(ctx, 7.6, -10 + i * 3.4, 1.6, 1.2, i % 2 ? '#1098ad' : '#ffd43b', '#7a4300');
  ctx.restore();

  // Скарабей-медальон
  const mx = bw - 2, my = cy + 1;
  const mg = ctx.createRadialGradient(mx - 1, my - 1, 0.3, mx, my, 4);
  mg.addColorStop(0, '#fff3a0');
  mg.addColorStop(1, '#d98e00');
  ctx.lineWidth = 1;
  U.ellipse(ctx, mx, my, 3.4, 3.8, mg, '#7a4300');
  U.ellipse(ctx, mx, my + 0.3, 1.8, 2.2, '#1098ad');
  U.ellipse(ctx, mx - 0.6, my - 0.6, 0.6, 0.5, '#ffffff');
}

// ================= ДИАДЕМА С СОЛНЦЕМ (фараонова собака) =================
function drawSunCrown(ctx, now) {
  ctx.save();
  ctx.translate(-1, -11);
  ctx.rotate(-0.2);
  ctx.lineCap = 'round';

  // Рога держат солнечный диск
  ctx.strokeStyle = '#d99000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, -2); ctx.quadraticCurveTo(-9, -8, -6, -13);
  ctx.moveTo(5, -2); ctx.quadraticCurveTo(9, -8, 6, -13);
  ctx.stroke();

  // Лучи вращаются
  ctx.save();
  ctx.translate(0, -12);
  ctx.rotate(now * 0.6);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    const rg = ctx.createLinearGradient(0, -6, 0, -16);
    rg.addColorStop(0, 'rgba(255,240,160,0.95)');
    rg.addColorStop(1, 'rgba(255,190,40,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.moveTo(-1.6, -6); ctx.lineTo(0, -14 - (i % 2) * 3); ctx.lineTo(1.6, -6); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Диск
  const dg = ctx.createRadialGradient(-2, -14, 0.5, 0, -12, 7);
  dg.addColorStop(0, '#ffffff');
  dg.addColorStop(0.4, '#ffd43b');
  dg.addColorStop(1, '#e8590c');
  ctx.lineWidth = 1;
  U.ellipse(ctx, 0, -12, 6.5, 6.5, dg, '#8a3a00');
  U.ellipse(ctx, -2, -14.5, 1.8, 1, 'rgba(255,255,255,0.8)');

  // Обод с бирюзовыми вставками
  const rim = ctx.createLinearGradient(0, -3, 0, 1.5);
  rim.addColorStop(0, '#ffe066');
  rim.addColorStop(1, '#c47f00');
  U.rrect(ctx, -12, -3, 23, 4.2, 2);
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.strokeStyle = '#7a4300';
  ctx.stroke();
  ctx.fillStyle = '#1098ad';
  for (const x of [-9, -4, 1, 6]) ctx.fillRect(x, -2.3, 2, 2.8);
  ctx.restore();
}

// ================= СИЯНИЕ И ИСКРЫ (фараонова собака) =================
function sunAura(ctx, d, front) {
  const s = d.size * U.easeOutBack(Math.min(1, d.spawnT));
  if (s <= 0.05) return;
  const now = performance.now() / 1000;
  const lift = d.held ? 18 : 0;
  const cx = d.x, cy = d.y - d.jumpHeight() - lift - 42 * s;

  if (!front) {
    const p = 0.5 + 0.5 * Math.sin(now * 2);
    U.softEllipse(ctx, cx, cy, 66 * s, 50 * s, '255,200,90', 0.22 + 0.14 * p);
    return;
  }
  ctx.save();
  ctx.fillStyle = '#fff3a0';
  for (let i = 0; i < 4; i++) {
    const a = now * 1.1 + i * Math.PI / 2;
    const x = cx + Math.cos(a) * 48 * s, y = cy + Math.sin(a) * 18 * s;
    const z = (2.8 + Math.sin(a) * 0.8) * s;
    ctx.globalAlpha = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(a));
    ctx.beginPath();
    ctx.moveTo(x, y - z * 2);
    ctx.quadraticCurveTo(x, y, x + z * 2, y);
    ctx.quadraticCurveTo(x, y, x, y + z * 2);
    ctx.quadraticCurveTo(x, y, x - z * 2, y);
    ctx.quadraticCurveTo(x, y, x, y - z * 2);
    ctx.fill();
  }
  ctx.restore();
}
