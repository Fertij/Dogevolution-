// Мир 3: Солнечный остров (уровни 16–20) и его первая порода — бигль.
// Подключается сразу после worlds.js: сам добавляет мир в список WORLDS,
// рисует пляж и новые аксессуары собак, поэтому другие файлы менять не нужно

const TOTAL_BREEDS = 20;   // все породы во всех мирах

const BEACH_PALM = {
  near: ['#1f6b3a', '#2f8f45', '#52b356', '#8fd96a'],
  far: ['#4f8a7a', '#64a08c', '#82b8a2', '#a8d2bc']
};
const BEACH_TRUNK = { near: ['#7a5230', '#a87a4a', '#d0a46c'], far: ['#8a8070', '#a39985', '#bdb39c'] };
const DUNE_GRASS = ['#9cbf5a', '#7fa848', '#c2d67a', '#6a9440'];

// Цветок гибискуса: на будке, кустах и доске
function hibiscus(ctx, x, y, s, col, edge) {
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 - Math.PI / 2;
    U.ellipse(ctx, x + Math.cos(a) * 3 * s, y + Math.sin(a) * 3 * s, 3.2 * s, 2.3 * s, col, edge, a);
  }
  U.ellipse(ctx, x, y, 1.5 * s, 1.5 * s, '#fff3bf');
  ctx.strokeStyle = '#ffd43b';
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3 * s, y - 3 * s); ctx.stroke();
  U.ellipse(ctx, x + 3 * s, y - 3 * s, 0.9 * s, 0.9 * s, '#ffd43b');
}

// Маленький цветок для ожерелья
function miniFlower(ctx, x, y, s, col) {
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    U.ellipse(ctx, x + Math.cos(a) * 1.5 * s, y + Math.sin(a) * 1.5 * s, 1.5 * s, 1.5 * s, col, 'rgba(150,50,80,0.4)');
  }
  U.ellipse(ctx, x, y, 0.8 * s, 0.8 * s, '#ffd43b');
}

// ================= БУДКА НА ПЛЯЖЕ =================
class BeachHouse extends DogHouse {
  draw(ctx) {
    // Доска для сёрфинга стоит за будкой
    ctx.save();
    ctx.translate(this.x - 46, this.y);
    ctx.rotate(-0.2);
    U.softShadow(ctx, 6, 2, 14, 4, 0.4);
    const bg = ctx.createLinearGradient(-8, 0, 8, 0);
    bg.addColorStop(0, '#7ee8f5');
    bg.addColorStop(0.5, '#22b8cf');
    bg.addColorStop(1, '#0c8599');
    ctx.beginPath();
    ctx.ellipse(0, -40, 8.5, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = 'rgba(10,60,80,0.6)';
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.3, -84, 2.6, 86);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-9, -60, 18, 4);
    ctx.fillRect(-9, -53, 18, 2);
    ctx.restore();
    U.ellipse(ctx, -3.5, -58, 1.8, 14, 'rgba(255,255,255,0.5)');
    hibiscus(ctx, 0, -26, 1.1, '#ffd43b', 'rgba(150,90,0,0.5)');
    ctx.restore();

    super.draw(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Спасательный круг на боковой стене
    ctx.save();
    ctx.translate(46, -32);
    ctx.transform(1, -0.55, 0, 1, 0, 0);
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ff4d4d';
    ctx.setLineDash([5.5, 5.5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(80,20,10,0.6)';
    ctx.beginPath(); ctx.arc(0, 0, 9.3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 4.7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // Цветок на коньке и песок у стен
    hibiscus(ctx, 2, -92, 1.3, '#ff4d6d', 'rgba(120,20,40,0.5)');
    U.ellipse(ctx, -28, 1.5, 11, 3.5, '#f6e2ae');
    U.ellipse(ctx, 30, 1.5, 9, 3, '#f6e2ae');
    ctx.restore();
  }
}

// ================= ПОЛЕ =================
class BeachField extends Field {
  resize(w, h, dpr) {
    super.resize(w, h, dpr);
    this.house = new BeachHouse(this.house.x, this.house.y);
    this.butterflies = [];   // на пляже вместо бабочек чайки
    this.motes = [];
    if (!this.gulls) {
      this.gulls = [];
      for (let i = 0; i < 4; i++) {
        this.gulls.push({ x: U.rand(0, w), y: U.rand(14, 60), sp: U.rand(16, 30), ph: U.rand(0, 6), s: U.rand(0.7, 1.1) });
      }
      this.boat = { x: U.rand(w * 0.1, w * 0.3) };
    }
  }

  // Зонт и замок тоже препятствия. Зона зонта высокая, чтобы собака не заходила за купол
  blocked(x, y) {
    if (super.blocked(x, y)) return true;
    const c = this.castle, u = this.umb;
    if (c && x > c.x - 50 && x < c.x + 52 && y > c.y - 60 && y < c.y + 16) return true;
    return !!u && x > u.x - 46 && x < u.x + 46 && y > u.y - 100 && y < u.y + 26;
  }

  shoreY(x) { return this.shore + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.051 + 1) * 3; }

  // ---------- Небо ----------
  buildSky() {
    const w = this.w, H = this.area.y;
    const { c, g } = this.makeCanvas(w, H);
    const sky = g.createLinearGradient(0, 0, 0, H * 0.5);
    sky.addColorStop(0, '#2f9fe0');
    sky.addColorStop(0.6, '#7fd0f5');
    sky.addColorStop(1, '#d8f5ff');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, H);

    const sx = w * 0.78, sy = 34;
    const glow = g.createRadialGradient(sx, sy, 0, sx, sy, 120);
    glow.addColorStop(0, 'rgba(255,253,225,1)');
    glow.addColorStop(0.12, 'rgba(255,245,190,0.95)');
    glow.addColorStop(0.4, 'rgba(255,235,170,0.3)');
    glow.addColorStop(1, 'rgba(255,235,170,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, H);
    g.save();
    g.translate(sx, sy);
    for (let i = 0; i < 14; i++) {
      g.rotate(Math.PI * 2 / 14);
      const rg = g.createLinearGradient(0, 0, 130, 0);
      rg.addColorStop(0, 'rgba(255,250,210,0.28)');
      rg.addColorStop(1, 'rgba(255,250,210,0)');
      g.fillStyle = rg;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(130, -7); g.lineTo(130, 7); g.closePath(); g.fill();
    }
    g.restore();
    U.ellipse(g, sx, sy, 16, 16, '#fffdf0');
    return c;
  }

  // ---------- Море, острова, песчаный берег ----------
  buildLand(r) {
    const w = this.w, a = this.area, H = a.y + 10;
    const { c, g } = this.makeCanvas(w, H);
    const hz = this.skyH - 6;
    this.hz = hz;
    this.shore = a.y - 46;

    // Море: у горизонта синее, у берега бирюзовое
    const sg = g.createLinearGradient(0, hz, 0, this.shore);
    sg.addColorStop(0, '#2a8fc9');
    sg.addColorStop(0.45, '#22a6d0');
    sg.addColorStop(0.8, '#35c9d6');
    sg.addColorStop(1, '#6fe3d8');
    g.fillStyle = sg;
    g.fillRect(0, hz, w, this.shore - hz + 14);
    g.fillStyle = 'rgba(255,255,255,0.4)';
    g.fillRect(0, hz, w, 1.5);

    // Остров с дымящимся вулканом
    const ix = w * 0.4;
    g.fillStyle = '#6fa898';
    g.beginPath(); g.ellipse(ix, hz, 58, 13, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#86a7a6';
    g.beginPath(); g.moveTo(ix + 6, hz - 6); g.lineTo(ix + 26, hz - 30); g.lineTo(ix + 34, hz - 30); g.lineTo(ix + 56, hz - 1); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.beginPath(); g.moveTo(ix + 26, hz - 30); g.lineTo(ix + 30, hz - 30); g.lineTo(ix + 18, hz - 12); g.lineTo(ix + 12, hz - 10); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) U.softEllipse(g, ix + 30 + k * 6, hz - 36 - k * 7, 6 + k * 3, 4 + k * 2, '255,255,255', 0.55 - k * 0.12);
    g.strokeStyle = '#4f8a7a';
    g.lineCap = 'round';
    for (const px of [ix - 34, ix - 20, ix - 8]) {
      g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(px, hz - 6); g.quadraticCurveTo(px - 1, hz - 16, px + 3, hz - 24); g.stroke();
      g.lineWidth = 1.2;
      for (let k = 0; k < 5; k++) {
        const an = -Math.PI + k * Math.PI / 4;
        g.beginPath(); g.moveTo(px + 3, hz - 24);
        g.quadraticCurveTo(px + 3 + Math.cos(an) * 5, hz - 27, px + 3 + Math.cos(an) * 8, hz - 22 - Math.abs(Math.sin(an)) * 2);
        g.stroke();
      }
    }
    g.fillStyle = '#7fb3a4';
    g.beginPath(); g.ellipse(w * 0.62, hz, 26, 6, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(40,110,140,0.25)';
    g.beginPath(); g.ellipse(ix, hz + 3, 56, 4, 0, 0, Math.PI * 2); g.fill();

    // Песок
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, this.shoreY(x));
    g.lineTo(w + 8, H);
    g.closePath();
    const sand = g.createLinearGradient(0, this.shore, 0, H);
    sand.addColorStop(0, '#f3dca2');
    sand.addColorStop(1, '#ecd08e');
    g.fillStyle = sand;
    g.fill();

    // Мокрая полоса у воды
    g.strokeStyle = 'rgba(200,160,95,0.55)';
    g.lineWidth = 7;
    g.beginPath();
    for (let x = 0; x <= w + 8; x += 8) (x ? g.lineTo(x, this.shoreY(x) + 3) : g.moveTo(x, this.shoreY(x) + 3));
    g.stroke();

    for (let i = 0; i < w * 0.8; i++) {
      U.ellipse(g, r() * w, U.lerp(this.shore + 4, H, r()), 0.7, 0.5, r() < 0.5 ? 'rgba(160,115,55,0.35)' : 'rgba(255,255,255,0.6)');
    }
    for (const t of this.trees) U.softShadow(g, t.x + 14 * t.s, t.y + 2, 40 * t.s, 10 * t.s, 0.4);
    return c;
  }

  // ---------- Пальмы только по краям, чтобы было видно море ----------
  buildTrees(r) {
    this.trees = [];
    const w = this.w, a = this.area;
    const spots = [[-6, 0.95, 'oak'], [34, 1.1, 'pine'], [72, 0.8, 'oak'], [w - 74, 0.85, 'pine'], [w - 36, 1.12, 'oak'], [w + 4, 0.9, 'pine']];
    for (const [x, s, type] of spots) {
      this.lean = x < w / 2 ? 1 : -1;   // пальмы наклоняются к центру
      this.trees.push(this.makeTree(type, x, a.y - 38 - r() * 8, s, false, r));
    }
    this.trees.sort((p, q) => p.y - q.y);
  }

  drawOak(g, far, r) { this.drawPalm(g, far, r, true); }    // пальма с кокосами
  drawPine(g, far, r) { this.drawPalm(g, far, r, false); }  // пальма без кокосов

  // Пальмовый лист: изогнутая жилка и много узких листочков
  frond(g, sx, sy, a, len, c1, c2) {
    const ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len * 0.45 + 20;
    const cx = sx + Math.cos(a) * len * 0.5, cy = sy + Math.sin(a) * len * 0.25 - 14;
    g.lineCap = 'round';
    for (let t = 0.08; t <= 0.98; t += 0.06) {
      const u = 1 - t;
      const qx = u * u * sx + 2 * u * t * cx + t * t * ex, qy = u * u * sy + 2 * u * t * cy + t * t * ey;
      let dx = 2 * u * (cx - sx) + 2 * t * (ex - cx), dy = 2 * u * (cy - sy) + 2 * t * (ey - cy);
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl; dy /= dl;
      const l = 13 * Math.sin(Math.PI * Math.min(1, t * 1.05)) + 2;
      for (const sgn of [1, -1]) {
        const nx = -dy * sgn * 0.8 + dx * 0.5, ny = dx * sgn * 0.8 + dy * 0.5 + 0.55;
        g.strokeStyle = sgn > 0 ? c1 : c2;
        g.lineWidth = 2.4 - t;
        g.beginPath(); g.moveTo(qx, qy); g.lineTo(qx + nx * l, qy + ny * l); g.stroke();
      }
    }
    g.strokeStyle = c2;
    g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
  }

  drawPalm(g, far, r, nuts) {
    const P = BEACH_PALM[far ? 'far' : 'near'], T = BEACH_TRUNK[far ? 'far' : 'near'];
    const L = this.lean || 1;
    const tx = L * 16, ty = -106, qx = -L * 7, qy = -52;
    const at = t => [2 * (1 - t) * t * qx + t * t * tx, 2 * (1 - t) * t * qy + t * t * ty];

    // Ствол из колец
    U.ellipse(g, 0, 0, 11, 3.5, T[0]);
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, [x, y] = at(t), wd = 8.5 - t * 4;
      const tg = g.createLinearGradient(x - wd, 0, x + wd, 0);
      tg.addColorStop(0, T[2]);
      tg.addColorStop(0.5, T[1]);
      tg.addColorStop(1, T[0]);
      g.fillStyle = tg;
      g.beginPath(); g.ellipse(x, y, wd, 4.2, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(60,35,15,0.45)';
      g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y + 1.2, wd, 3, 0, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    }

    // Задние листья темнее, передние светлее, кокосы между ними
    const fr = [];
    for (let i = 0; i < 9; i++) fr.push([i / 9 * Math.PI * 2 + r() * 0.3, 34 + r() * 8]);
    for (const [a, len] of fr) if (Math.sin(a) < 0) this.frond(g, tx, ty, a, len, P[1], P[0]);
    if (nuts) {
      for (const [dx, dy] of [[-4, 4], [3, 5], [-0.5, 8]]) {
        const cg = g.createRadialGradient(tx + dx - 1.2, ty + dy - 1.2, 0.5, tx + dx, ty + dy, 4.6);
        cg.addColorStop(0, '#b08050');
        cg.addColorStop(1, '#5a3a1c');
        U.ellipse(g, tx + dx, ty + dy, 4.4, 4.2, cg);
        U.ellipse(g, tx + dx - 1.4, ty + dy - 1.5, 1.1, 0.8, 'rgba(255,255,255,0.4)');
      }
    }
    for (const [a, len] of fr) if (Math.sin(a) >= 0) this.frond(g, tx, ty, a, len, P[3], P[2]);
    U.ellipse(g, tx, ty - 1, 4, 3, P[1]);
  }

  // ---------- Пляж внутри забора ----------
  buildNear(r) {
    const w = this.w, h = this.h, a = this.area, p = this.pond;
    const { c, g } = this.makeCanvas(w, h);
    this.castle = { x: a.x + 64, y: a.y + a.h - 46 };
    this.umb = { x: a.x + a.w - 74, y: a.y + 104 };
    const cs = this.castle, um = this.umb;

    const og = g.createLinearGradient(0, a.y - 10, 0, h);
    og.addColorStop(0, '#ecd08e');
    og.addColorStop(1, '#d9b46e');
    g.fillStyle = og;
    g.fillRect(0, a.y - 10, w, h - a.y + 10);

    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    const mg = g.createRadialGradient(cx, cy * 0.9, 20, cx, cy, Math.max(a.w, a.h) * 0.75);
    mg.addColorStop(0, '#fdf0cc');
    mg.addColorStop(0.6, '#f3dca6');
    mg.addColorStop(1, '#e6c58a');
    g.fillStyle = mg;
    g.fillRect(a.x, a.y, a.w, a.h);

    g.save();
    g.beginPath(); g.rect(a.x, a.y, a.w, a.h); g.clip();
    const tg = g.createLinearGradient(0, a.y, 0, a.y + 50);
    tg.addColorStop(0, 'rgba(140,90,30,0.25)');
    tg.addColorStop(1, 'rgba(140,90,30,0)');
    g.fillStyle = tg;
    g.fillRect(a.x, a.y, a.w, 50);

    // Рябь на песке от ветра
    g.strokeStyle = 'rgba(180,135,70,0.22)';
    g.lineWidth = 1.2;
    for (let i = 0; i < a.w * a.h / 2600; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h, L = 14 + r() * 22;
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * 0.3, y - 3, x + L * 0.6, y + 3, x + L, y); g.stroke();
    }
    for (let i = 0; i < 9; i++) {
      U.softEllipse(g, a.x + r() * a.w, a.y + r() * a.h, 50 + r() * 70, 25 + r() * 30,
        r() < 0.5 ? '255,250,225' : '190,140,70', 0.12 + r() * 0.06);
    }
    U.softEllipse(g, this.house.x + 12, this.house.y + 8, 80, 26, '190,145,85', 0.35);
    g.restore();

    const onPond = (x, y) => {
      const dx = (x - p.x) / (p.rx + 12), dy = (y - p.y) / (p.ry + 10);
      return dx * dx + dy * dy < 1;
    };
    const inside = (x, y, m = 6) => x > a.x + m && x < a.x + a.w - m && y > a.y + m && y < a.y + a.h - 4;
    const free = (x, y) => inside(x, y) && !onPond(x, y) && !this.house.blocks(x, y) &&
      !(Math.abs(x - cs.x) < 52 && y > cs.y - 50 && y < cs.y + 14) &&
      !(Math.abs(x - um.x) < 50 && y > um.y - 20 && y < um.y + 26);

    // Песчинки
    for (let i = 0; i < w * (h - a.y) / 60; i++) {
      const x = r() * w, y = a.y - 6 + r() * (h - a.y + 6);
      if (onPond(x, y)) continue;
      U.ellipse(g, x, y, 0.7, 0.5, r() < 0.6 ? 'rgba(160,115,55,0.35)' : 'rgba(255,255,255,0.7)');
    }

    // Цепочка следов лап
    let px = a.x + a.w * 0.25, py = a.y + a.h * 0.35, ang = 0.5;
    for (let i = 0; i < 34; i++) {
      ang += (r() - 0.5) * 0.5;
      const nx = px + Math.cos(ang) * 13, ny = py + Math.sin(ang) * 8;
      if (!inside(nx, ny, 30)) { ang += Math.PI * 0.6; continue; }
      px = nx; py = ny;
      const side = i % 2 ? 1 : -1;
      const fx = px - Math.sin(ang) * 4 * side, fy = py + Math.cos(ang) * 2.5 * side;
      if (free(fx, fy)) this.pawPrint(g, fx, fy, ang);
    }

    // Ракушки, морские звёзды, камешки
    const shellCols = ['#ffb3c6', '#ffd8a8', '#e9d8fd', '#ffffff'];
    for (let i = 0; i < a.w * a.h / 7000; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h, k = r();
      if (!free(x, y)) continue;
      if (k < 0.45) this.shell(g, x, y, 0.7 + r() * 0.4, shellCols[(r() * 4) | 0]);
      else if (k < 0.7) this.starfish(g, x, y, 0.8 + r() * 0.4, r() * 6);
      else { this.stone(g, x, y, 2 + r() * 2); if (r() < 0.5) this.stone(g, x + 5, y + 2, 1.4 + r()); }
    }

    // Пучки травы у забора
    for (let i = 0; i < 16; i++) {
      const left = i % 2 === 0;
      const x = left ? a.x + 10 + r() * 20 : a.x + a.w - 10 - r() * 20;
      const y = a.y + 30 + r() * (a.h - 50);
      if (free(x, y)) this.duneTuft(g, x, y, r);
    }

    this.drawUmbrella(g, um.x, um.y);
    this.drawCastle(g, cs.x, cs.y, r);
    this.drawPond(g, r);

    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      const an = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.7;
      this.sparkles.push({ x: p.x + Math.cos(an) * d * p.rx, y: p.y + Math.sin(an) * d * p.ry, ph: r() * 6.28 });
    }

    // Тропические растения по бокам и снизу
    for (let y = a.y + 20; y < a.y + a.h; y += 50 + r() * 30) {
      this.tropicalPlant(g, 8 + r() * 8, y, 0.65 + r() * 0.3, r);
      this.tropicalPlant(g, w - 8 - r() * 8, y, 0.65 + r() * 0.3, r);
    }
    for (let x = 20; x < w; x += 60 + r() * 40) this.tropicalPlant(g, x, h - 4 - r() * 8, 0.6 + r() * 0.3, r);

    // Забор из коряг и канатов
    this.beachFence(g, a.x, a.y, a.x + a.w, a.y);
    this.beachFence(g, a.x, a.y, a.x, a.y + a.h);
    this.beachFence(g, a.x + a.w, a.y, a.x + a.w, a.y + a.h);
    this.beachFence(g, a.x, a.y + a.h, a.x + a.w, a.y + a.h);

    // Краб бегает между ракушками
    this.crab = { x0: a.x + a.w * 0.32, x1: a.x + a.w * 0.58, y: a.y + a.h * 0.66, x: a.x + a.w * 0.4, dir: 1, pause: 1, moving: false };
    return c;
  }

  pawPrint(g, x, y, ang) {
    g.save();
    g.translate(x, y);
    g.scale(1, 0.6);
    g.rotate(ang);
    g.fillStyle = 'rgba(175,125,60,0.35)';
    g.beginPath(); g.ellipse(0, 0, 2.6, 2.2, 0, 0, Math.PI * 2); g.fill();
    for (const [tx, ty] of [[3.4, -2.3], [4.3, 0], [3.4, 2.3]]) {
      g.beginPath(); g.arc(tx, ty, 1.1, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  shell(g, x, y, s, col) {
    U.softShadow(g, x + 1, y + 1.5, 6 * s, 2.4 * s, 0.35);
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    const sg = g.createRadialGradient(0, 2, 0.5, 0, 0, 8);
    sg.addColorStop(0, '#ffffff');
    sg.addColorStop(1, col);
    g.beginPath(); g.moveTo(0, 3); g.arc(0, 3, 7, Math.PI * 1.12, Math.PI * 1.88); g.closePath();
    g.fillStyle = sg;
    g.fill();
    g.strokeStyle = 'rgba(150,80,60,0.45)';
    g.lineWidth = 0.8;
    g.stroke();
    for (let k = 1; k < 6; k++) {
      const an = Math.PI * (1.12 + 0.76 * k / 6);
      g.beginPath(); g.moveTo(0, 3); g.lineTo(Math.cos(an) * 7, 3 + Math.sin(an) * 7); g.stroke();
    }
    g.fillStyle = col;
    g.fillRect(-1.6, 2, 3.2, 2.2);
    g.restore();
  }

  starfish(g, x, y, s, rot) {
    U.softShadow(g, x + 1, y + 1.5, 7 * s, 3 * s, 0.35);
    g.save();
    g.translate(x, y);
    g.scale(s, s * 0.75);
    g.rotate(rot);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? 2.6 : 6.5, an = i * Math.PI / 5 - Math.PI / 2;
      g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    g.closePath();
    const sg = g.createRadialGradient(-1, -1, 0.5, 0, 0, 7);
    sg.addColorStop(0, '#ffd8a8');
    sg.addColorStop(0.5, '#ff922b');
    sg.addColorStop(1, '#d9480f');
    g.fillStyle = sg;
    g.lineJoin = 'round';
    g.fill();
    g.strokeStyle = 'rgba(140,40,0,0.45)';
    g.lineWidth = 0.8;
    g.stroke();
    for (let i = 0; i < 5; i++) {
      const an = i * Math.PI * 2 / 5 - Math.PI / 2;
      U.ellipse(g, Math.cos(an) * 3.6, Math.sin(an) * 3.6, 0.6, 0.6, 'rgba(255,240,200,0.9)');
    }
    g.restore();
  }

  duneTuft(g, x, y, r) {
    U.softShadow(g, x + 1, y, 6, 2, 0.3);
    g.lineCap = 'round';
    g.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const an = -Math.PI / 2 + (i / 5 - 0.5) * 1.3, len = 6 + r() * 8;
      g.strokeStyle = DUNE_GRASS[(r() * DUNE_GRASS.length) | 0];
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(an) * len * 0.3, y + Math.sin(an) * len * 0.7, x + Math.cos(an) * len, y + Math.sin(an) * len);
      g.stroke();
    }
  }

  // Полосатый зонт, полотенце и мяч
  drawUmbrella(g, x, y) {
    g.save();
    g.translate(x - 8, y + 12);
    g.rotate(-0.12);
    g.fillStyle = 'rgba(140,90,30,0.25)';
    g.fillRect(-21, -9, 48, 24);
    const tc = ['#ff6b9d', '#ffffff', '#4dabf7'];
    for (let i = 0; i < 6; i++) { g.fillStyle = tc[i % 3]; g.fillRect(-24 + i * 8, -12, 8, 24); }
    g.strokeStyle = 'rgba(0,0,0,0.15)';
    g.lineWidth = 1;
    g.strokeRect(-24, -12, 48, 24);
    g.strokeStyle = '#ffffff';
    for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(-23 + i * 4, 12); g.lineTo(-23 + i * 4, 15); g.stroke(); }
    g.restore();

    U.softShadow(g, x + 14, y + 8, 46, 14, 0.4);
    this.beachBall(g, x + 30, y + 16, 7);

    // Стойка
    g.lineCap = 'round';
    g.strokeStyle = '#adb5bd';
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + 0.6, y + 2); g.lineTo(x + 0.6, y - 62); g.stroke();
    g.strokeStyle = '#f8f9fa';
    g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x - 0.4, y + 2); g.lineTo(x - 0.4, y - 62); g.stroke();

    // Купол с волнистым краем
    const L = x - 42, R = x + 42, by = y - 58, top = y - 84;
    const dome = () => {
      g.beginPath();
      g.moveTo(L, by);
      g.bezierCurveTo(L + 6, top, R - 6, top, R, by);
      for (let k = 1; k <= 6; k++) {
        const xm = R - 84 * (k - 0.5) / 6, x1 = R - 84 * k / 6;
        g.quadraticCurveTo(xm, by + 7, x1, by);
      }
      g.closePath();
    };
    dome();
    g.save();
    g.clip();
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? '#ffffff' : '#ff4d4d';
      g.beginPath(); g.moveTo(x, top - 6); g.lineTo(L + i * 14, by + 10); g.lineTo(L + (i + 1) * 14, by + 10); g.closePath(); g.fill();
    }
    const sh = g.createLinearGradient(L, 0, R, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0.35)');
    sh.addColorStop(0.45, 'rgba(255,255,255,0)');
    sh.addColorStop(1, 'rgba(90,20,10,0.35)');
    g.fillStyle = sh;
    g.fillRect(L, top - 5, 84, by - top + 15);
    g.restore();
    dome();
    g.strokeStyle = 'rgba(120,20,10,0.55)';
    g.lineWidth = 1.2;
    g.stroke();
    U.ellipse(g, x, top + 5, 2.6, 2.6, '#ffd43b', '#a35f00');
  }

  beachBall(g, x, y, R) {
    U.softShadow(g, x + 2, y + R * 0.9, R * 1.2, R * 0.35, 0.45);
    U.ellipse(g, x, y, R, R, '#ffffff');
    const cols = ['#ff4d4d', '#4dabf7', '#ffd43b'];
    for (let k = 0; k < 3; k++) {
      const a0 = k * Math.PI * 2 / 3 - 0.4;
      g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, a0, a0 + Math.PI / 3); g.closePath();
      g.fillStyle = cols[k];
      g.fill();
    }
    U.ellipse(g, x, y, R * 0.25, R * 0.25, '#ffffff');
    const hg = g.createRadialGradient(x - R * 0.4, y - R * 0.4, 0.5, x, y, R);
    hg.addColorStop(0, 'rgba(255,255,255,0.6)');
    hg.addColorStop(0.5, 'rgba(255,255,255,0)');
    hg.addColorStop(1, 'rgba(0,0,0,0.25)');
    g.lineWidth = 1;
    U.ellipse(g, x, y, R, R, hg, 'rgba(60,40,20,0.5)');
  }

  // Замок из песка с флажком, ведёрком и лопаткой
  drawCastle(g, x, y, r) {
    U.softShadow(g, x + 8, y + 3, 52, 12, 0.45);
    const sand = (x0, y0, x1, y1) => {
      const gr = g.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, '#f9e2a8');
      gr.addColorStop(1, '#d3a55c');
      return gr;
    };
    g.fillStyle = sand(x - 40, y - 10, x + 40, y + 6);
    g.beginPath(); g.ellipse(x, y, 44, 9, 0, 0, Math.PI * 2); g.fill();

    const block = (bx, top, bw, bh) => {
      g.fillStyle = sand(bx - bw / 2, top, bx + bw / 2, top + bh);
      g.fillRect(bx - bw / 2, top, bw, bh);
      const cw = bw / 5;
      for (const cx of [bx - bw / 2, bx - cw / 2, bx + bw / 2 - cw]) g.fillRect(cx, top - 4.5, cw, 4.5);
      g.fillStyle = 'rgba(140,90,30,0.22)';
      g.fillRect(bx + bw * 0.15, top - 4.5, bw * 0.35, bh + 4.5);
      g.strokeStyle = 'rgba(140,95,40,0.5)';
      g.lineWidth = 1;
      g.strokeRect(bx - bw / 2, top, bw, bh);
    };

    // Стена, две башни по бокам и высокая в центре
    block(x, y - 24, 56, 20);
    block(x - 30, y - 32, 15, 28);
    block(x + 30, y - 32, 15, 28);
    const t = y - 46;
    block(x, t, 19, 42);

    for (const wx of [x - 30, x + 30, x]) {
      g.fillStyle = '#8a5a28';
      U.rrect(g, wx - 1.7, (wx === x ? t : y - 32) + 6, 3.4, 5, 1.7);
      g.fill();
    }

    // Ворота
    g.fillStyle = '#7a4e22';
    g.beginPath();
    g.moveTo(x - 5, y - 4); g.lineTo(x - 5, y - 11); g.arc(x, y - 11, 5, Math.PI, 0); g.lineTo(x + 5, y - 4);
    g.closePath();
    g.fill();

    // Флажок
    g.strokeStyle = '#6b4a2e';
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x, t - 4); g.lineTo(x, t - 21); g.stroke();
    g.fillStyle = '#ff4d6d';
    g.beginPath(); g.moveTo(x, t - 21); g.lineTo(x + 11, t - 17.5); g.lineTo(x, t - 14); g.closePath(); g.fill();

    // Песчинки и ракушка на стене
    for (let i = 0; i < 40; i++) {
      U.ellipse(g, x - 36 + r() * 72, y - 40 + r() * 38, 0.6, 0.5, r() < 0.5 ? 'rgba(150,100,40,0.45)' : 'rgba(255,255,255,0.6)');
    }
    this.shell(g, x - 14, y - 12, 0.45, '#ffb3c6');

    // Ведёрко
    const bx = x + 44, byy = y + 6;
    const bg = g.createLinearGradient(bx - 6, 0, bx + 6, 0);
    bg.addColorStop(0, '#74c0fc');
    bg.addColorStop(1, '#1864ab');
    g.fillStyle = bg;
    g.beginPath(); g.moveTo(bx - 6, byy - 11); g.lineTo(bx + 6, byy - 11); g.lineTo(bx + 4.5, byy); g.lineTo(bx - 4.5, byy); g.closePath(); g.fill();
    U.ellipse(g, bx, byy - 11, 6, 1.6, '#a5d8ff', '#1864ab');
    g.strokeStyle = '#ffd43b';
    g.lineWidth = 1;
    g.beginPath(); g.arc(bx, byy - 11, 5.5, Math.PI, 0); g.stroke();

    // Лопатка
    g.strokeStyle = '#e03131';
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 46, y + 4); g.lineTo(x - 41, y - 14); g.stroke();
    U.ellipse(g, x - 47, y + 7, 3.6, 2.6, '#ffd43b', '#c99700', 0.25);
  }

  // Лагуна вместо пруда
  drawPond(g, r) {
    const p = this.pond;
    U.softShadow(g, p.x + 4, p.y + 6, p.rx + 20, p.ry + 13, 0.35);
    U.ellipse(g, p.x, p.y + 3, p.rx + 11, p.ry + 9, '#c9a060');
    U.ellipse(g, p.x, p.y + 1, p.rx + 7, p.ry + 5, '#e3c27e');

    g.save();
    g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); g.clip();
    const wg = g.createRadialGradient(p.x + p.rx * 0.1, p.y + p.ry * 0.15, 2, p.x, p.y, p.rx);
    wg.addColorStop(0, '#0c8599');
    wg.addColorStop(0.55, '#22b8cf');
    wg.addColorStop(0.85, '#66d9e8');
    wg.addColorStop(1, '#c3fae8');
    g.fillStyle = wg;
    g.fillRect(p.x - p.rx, p.y - p.ry, p.rx * 2, p.ry * 2);
    for (let i = 0; i < 12; i++) {
      const an = r() * Math.PI * 2, d = 0.3 + r() * 0.6;
      U.ellipse(g, p.x + Math.cos(an) * d * p.rx, p.y + Math.sin(an) * d * p.ry, 1.5 + r() * 2, 1 + r(), 'rgba(255,240,200,0.3)');
    }
    U.softEllipse(g, p.x - p.rx * 0.3, p.y - p.ry * 0.2, p.rx * 0.4, p.ry * 0.2, '255,255,255', 0.3);
    g.restore();

    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(p.x, p.y, p.rx - 1, p.ry - 1, 0, 0, Math.PI * 2); g.stroke();

    // Камни вокруг лагуны
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * Math.PI * 2 + r() * 0.3;
      this.stone(g, p.x + Math.cos(an) * (p.rx + 6), p.y + Math.sin(an) * (p.ry + 5), 2.5 + r() * 3);
    }
    this.starfish(g, p.x - p.rx * 0.7, p.y + p.ry + 7, 0.7, 0.4);
  }

  tropicalPlant(g, x, y, s, r) {
    U.softShadow(g, x + 4 * s, y + 2, 24 * s, 7 * s, 0.4);
    for (let i = 0; i < 6; i++) {
      const an = -Math.PI * (0.08 + 0.84 * i / 5) + (r() - 0.5) * 0.15;
      const L = (18 + r() * 6) * s, W = (5.5 + r() * 1.5) * s;
      g.save();
      g.translate(x, y);
      g.rotate(an);
      const lg = g.createLinearGradient(0, -W, 0, W);
      lg.addColorStop(0, '#8fd96a');
      lg.addColorStop(0.5, '#2f8f45');
      lg.addColorStop(1, '#1a5a2e');
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(L * 0.45, -W * 1.3, L, 0);
      g.quadraticCurveTo(L * 0.45, W * 1.3, 0, 0);
      g.fillStyle = lg;
      g.fill();
      g.strokeStyle = '#bfe89a';
      g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(2, 0); g.lineTo(L * 0.92, 0); g.stroke();
      g.restore();
    }
    if (r() < 0.7) hibiscus(g, x + (r() - 0.5) * 14 * s, y - (8 + r() * 8) * s, 0.9 * s, '#ff4d6d', 'rgba(120,20,40,0.5)');
  }

  // Забор из коряг с провисшими канатами
  beachFence(g, x1, y1, x2, y2) {
    const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(len / 42)), H = 24;
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(110,75,30,0.25)';
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(x1 + 5, y1 + 4); g.lineTo(x2 + 5, y2 + 4); g.stroke();

    const P = [];
    for (let i = 0; i <= n; i++) P.push({ x: x1 + (x2 - x1) * i / n, y: y1 + (y2 - y1) * i / n, h: H - 2 + (i * 7) % 5 });

    // Канаты
    for (const off of [H - 8, H - 17]) {
      for (let i = 0; i < n; i++) {
        const a = P[i], b = P[i + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const rope = () => { g.beginPath(); g.moveTo(a.x, a.y - off); g.quadraticCurveTo(mx, my - off + 8, b.x, b.y - off); };
        rope(); g.strokeStyle = '#7a5a2e'; g.lineWidth = 2.8; g.stroke();
        rope(); g.strokeStyle = '#e0c48a'; g.lineWidth = 1.6; g.stroke();
        g.setLineDash([2, 2.5]);
        rope(); g.strokeStyle = 'rgba(120,85,40,0.6)'; g.lineWidth = 1; g.stroke();
        g.setLineDash([]);
      }
    }

    // Столбы-коряги
    for (const p of P) {
      U.softShadow(g, p.x + 3, p.y + 1, 8, 3, 0.5);
      const pg = g.createLinearGradient(p.x - 5, 0, p.x + 5, 0);
      pg.addColorStop(0, '#e2d6bc');
      pg.addColorStop(0.5, '#a89a7e');
      pg.addColorStop(1, '#6e624c');
      g.beginPath();
      g.moveTo(p.x - 4.5, p.y);
      g.lineTo(p.x - 4, p.y - p.h);
      g.quadraticCurveTo(p.x, p.y - p.h - 3, p.x + 4, p.y - p.h + 1);
      g.lineTo(p.x + 4.5, p.y);
      g.closePath();
      g.fillStyle = pg;
      g.fill();
      g.strokeStyle = 'rgba(60,50,35,0.6)';
      g.lineWidth = 1;
      g.stroke();
      g.strokeStyle = 'rgba(80,65,45,0.4)';
      g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(p.x - 1.5, p.y - p.h + 5); g.quadraticCurveTo(p.x - 0.5, p.y - p.h / 2, p.x - 1, p.y - 3); g.stroke();
      for (const off of [H - 8, H - 17]) U.ellipse(g, p.x, p.y - off, 5, 1.8, '#d9b878', 'rgba(110,80,40,0.6)');
    }
  }

  buildLight() {
    const w = this.w, h = this.h;
    const { c, g } = this.makeCanvas(w, h);
    const sun = g.createRadialGradient(w * 0.78, 34, 0, w * 0.78, 34, Math.max(w, h) * 0.9);
    sun.addColorStop(0, 'rgba(255,235,170,0.25)');
    sun.addColorStop(0.5, 'rgba(255,235,170,0.07)');
    sun.addColorStop(1, 'rgba(255,235,170,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);
    const v = g.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.45, w / 2, h * 0.55, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(90,50,10,0)');
    v.addColorStop(1, 'rgba(90,50,10,0.3)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
    return c;
  }

  // Трава дюн на переднем плане
  buildForegroundGrass(r) {
    this.grass = [];
    for (let x = -5; x < this.w + 5; x += 8 + r() * 16) {
      for (let k = 0; k < 3; k++) {
        this.grass.push({ x: x + k * 2, y: this.h + 2, len: 8 + r() * 14, c: DUNE_GRASS[(r() * DUNE_GRASS.length) | 0], lean: (r() - 0.5) * 8 });
      }
    }
  }

  // ---------- Анимация ----------
  update(dt) {
    super.update(dt);
    for (const gl of this.gulls) {
      gl.x += gl.sp * dt;
      if (gl.x > this.w + 30) { gl.x = -30; gl.y = U.rand(14, 60); }
    }
    this.boat.x += 4 * dt;
    if (this.boat.x > this.w + 40) this.boat.x = -40;

    const c = this.crab;
    if (!c) return;
    if (c.pause > 0) { c.pause -= dt; c.moving = false; return; }
    c.moving = true;
    c.x += c.dir * 22 * dt;
    if (c.x > c.x1) { c.x = c.x1; c.dir = -1; c.pause = U.rand(1, 2.5); }
    else if (c.x < c.x0) { c.x = c.x0; c.dir = 1; c.pause = U.rand(1, 2.5); }
    else if (Math.random() < dt * 0.25) c.pause = U.rand(0.6, 1.6);
  }

  // Как в field.js, но море с прибоем рисуется перед пальмами
  drawBack(ctx) {
    const w = this.w, a = this.area;
    ctx.drawImage(this.sky, 0, 0, w, a.y);
    for (const cl of this.clouds) {
      const sp = this.cloudSprites[cl.k];
      ctx.drawImage(sp.c, cl.x, cl.y, sp.w * cl.s, sp.h * cl.s);
    }
    ctx.drawImage(this.land, 0, 0, w, a.y + 10);
    this.drawSea(ctx);
    for (const t of this.trees) {
      const sway = Math.sin(this.t * 1.1 + t.phase) * 0.018;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(sway);
      ctx.drawImage(t.c, -t.ox, -t.oy, t.w, t.h);
      ctx.restore();
    }
    ctx.drawImage(this.near, 0, 0, w, this.h);
    this.drawWater(ctx);
  }

  drawSea(ctx) {
    const w = this.w, hz = this.hz, sh = this.shore, t = this.t;
    ctx.save();
    ctx.lineCap = 'round';

    // Солнечная дорожка
    const sx = w * 0.78;
    for (let i = 0; i < 24; i++) {
      const k = i / 24, y = hz + 3 + k * (sh - hz - 12);
      const x = sx + Math.sin(i * 12.99) * (6 + k * 34);
      const a = Math.sin(t * 3 + i * 1.7);
      if (a > 0.2) U.ellipse(ctx, x, y, 2 + k * 6, 0.8 + k * 0.7, `rgba(255,255,230,${(a - 0.2) * 0.9})`);
    }

    // Волны
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      const k = (i * 0.618) % 1, y = hz + 6 + k * (sh - hz - 16);
      const x = ((i * 97 + t * (6 + k * 12)) % (w + 60)) - 30, L = 8 + k * 18;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y - 1.5 - k * 2, x + L, y); ctx.stroke();
    }

    this.drawBoat(ctx, this.boat.x, hz + 3 + Math.sin(t * 1.5) * 0.6);
    if (typeof Settings === 'undefined' || Settings.data.effects) for (const gl of this.gulls) this.drawGull(ctx, gl);

    // Прибой накатывает на песок
    const k = 0.5 + 0.5 * Math.sin(t * 0.9);
    const edge = x => this.shoreY(x) + 2 + k * 7 + Math.sin(x * 0.07 + t * 2) * 1.5;
    const xs = [];
    for (let x = 0; x <= w + 8; x += 8) xs.push(x);
    ctx.beginPath();
    xs.forEach((x, i) => (i ? ctx.lineTo(x, this.shoreY(x) - 1) : ctx.moveTo(x, this.shoreY(x) - 1)));
    for (let i = xs.length - 1; i >= 0; i--) ctx.lineTo(xs[i], edge(xs[i]));
    ctx.closePath();
    ctx.fillStyle = 'rgba(140,230,225,0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    xs.forEach((x, i) => (i ? ctx.lineTo(x, edge(x)) : ctx.moveTo(x, edge(x))));
    ctx.stroke();
    for (let i = 0; i < xs.length; i += 2) {
      const x = xs[i] + 3;
      U.ellipse(ctx, x, edge(x) - 2 - (i % 3), 1.3, 1, 'rgba(255,255,255,0.85)');
    }
    ctx.restore();
  }

  drawBoat(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    U.ellipse(ctx, 0, 2.5, 11, 1.6, 'rgba(20,70,110,0.3)');
    ctx.fillStyle = '#8a5a30';
    ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(10, -2); ctx.lineTo(7, 2); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-9.2, -2, 18.4, 1.2);
    ctx.strokeStyle = '#5a3a1c';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -22); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(1, -21); ctx.lineTo(1, -4); ctx.lineTo(10, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe3e3';
    ctx.beginPath(); ctx.moveTo(-1, -17); ctx.lineTo(-1, -4); ctx.lineTo(-7.5, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(5, -20.5); ctx.lineTo(0, -19); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawGull(ctx, gl) {
    const s = gl.s, fl = Math.sin(this.t * 6 + gl.ph) * 3 * s, x = gl.x, y = gl.y;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, y - fl);
      ctx.quadraticCurveTo(x - 4 * s, y - 4 * s - fl * 0.3, x, y);
      ctx.quadraticCurveTo(x + 4 * s, y - 4 * s - fl * 0.3, x + 8 * s, y - fl);
    };
    path(); ctx.strokeStyle = 'rgba(60,70,90,0.6)'; ctx.lineWidth = 2.6 * s; ctx.stroke();
    path(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4 * s; ctx.stroke();
  }

  // Блики на дне, рыбки, круги на воде и краб
  drawWater(ctx) {
    const p = this.pond, t = this.t;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.clip();

    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.2;
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 8; i++) {
        const x = p.x - p.rx + i * (p.rx * 2 / 7) + Math.sin(t * 1.3 + j + i) * 4;
        const y = p.y - p.ry + j * (p.ry * 2 / 4) + Math.cos(t * 1.1 + i) * 3;
        ctx.beginPath(); ctx.ellipse(x, y, 6, 3, Math.sin(t + i * j) * 0.5, 0, Math.PI * 2); ctx.stroke();
      }
    }

    const fish = [['#ff922b', '#ffd43b'], ['#ffd43b', '#ff922b']];
    fish.forEach(([c1, c2], i) => {
      const a = t * (0.45 + i * 0.15) + i * Math.PI;
      const fx = p.x + Math.cos(a) * p.rx * 0.5, fy = p.y + Math.sin(a) * p.ry * 0.45;
      const dir = Math.sin(a) < 0 ? 1 : -1, wig = Math.sin(t * 10 + i) * 1.2;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(dir, 1);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-10, -3.5 + wig); ctx.lineTo(-10, 3.5 + wig); ctx.closePath(); ctx.fill();
      U.ellipse(ctx, 0, 0, 6, 3.2, c1);
      U.ellipse(ctx, -0.5, 0, 1.2, 3, 'rgba(255,255,255,0.8)');
      U.ellipse(ctx, 3.4, -0.8, 0.9, 0.9, '#1a1a1a');
      ctx.restore();
    });
    ctx.restore();

    super.drawWater(ctx);
    this.drawCrab(ctx);
  }

  drawCrab(ctx) {
    const c = this.crab;
    if (!c) return;
    const t = this.t, walk = c.moving;
    U.softShadow(ctx, c.x + 1, c.y + 2, 11, 3, 0.45);
    ctx.save();
    ctx.translate(c.x, c.y - (walk ? Math.abs(Math.sin(t * 16)) * 0.8 : 0));
    ctx.lineCap = 'round';

    // Ноги
    ctx.strokeStyle = '#c92a2a';
    ctx.lineWidth = 1.4;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const ph = walk ? Math.sin(t * 18 + k * 2 + side) * 1.5 : 0;
        ctx.beginPath();
        ctx.moveTo(side * 5, -3 + k * 1.5);
        ctx.quadraticCurveTo(side * 9, -6 + k * 2 + ph, side * 11, -1 + k * 2.2 + ph);
        ctx.stroke();
      }
    }

    // Клешни щёлкают
    const snap = Math.abs(Math.sin(t * (walk ? 4 : 7))) * 0.5;
    ctx.lineWidth = 0.8;
    for (const side of [-1, 1]) {
      ctx.strokeStyle = '#c92a2a';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(side * 5, -5); ctx.lineTo(side * 9, -10); ctx.stroke();
      ctx.lineWidth = 0.8;
      U.ellipse(ctx, side * 10.5, -12.8, 3, 1.8, '#ff6b6b', '#8a1010', -side * snap);
      U.ellipse(ctx, side * 10.5, -10.8, 3, 1.5, '#ff6b6b', '#8a1010', side * snap);
    }

    // Панцирь
    const bg = ctx.createRadialGradient(-2, -6, 1, 0, -4, 9);
    bg.addColorStop(0, '#ffa8a8');
    bg.addColorStop(0.5, '#f03e3e');
    bg.addColorStop(1, '#a51e1e');
    ctx.lineWidth = 1;
    U.ellipse(ctx, 0, -4, 8, 5.5, bg, 'rgba(100,10,10,0.6)');
    U.ellipse(ctx, -2.5, -6.5, 2.5, 1.2, 'rgba(255,255,255,0.45)');

    // Глаза на стебельках и улыбка
    ctx.strokeStyle = '#a51e1e';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-2.5, -12); ctx.moveTo(2, -8); ctx.lineTo(2.5, -12); ctx.stroke();
    ctx.lineWidth = 0.6;
    for (const ex of [-2.5, 2.5]) {
      U.ellipse(ctx, ex, -12.6, 1.6, 1.6, '#ffffff', '#333');
      U.ellipse(ctx, ex + c.dir * 0.4, -12.5, 0.8, 0.8, '#111');
    }
    ctx.strokeStyle = '#7a1010';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(0, -4, 2.4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    ctx.restore();
  }

  // Над собаками: тени облаков, трава дюн, солнечный свет
  drawOverlay(ctx) {
    for (const c of this.shadows) U.softEllipse(ctx, c.x, c.y, c.r * 1.6, c.r, '120,80,30', 0.08);
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.2;
    for (const b of this.grass) {
      const sway = Math.sin(this.t * 1.8 + b.x * 0.03) * 3;
      ctx.strokeStyle = b.c;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.quadraticCurveTo(b.x + b.lean * 0.3, b.y - b.len * 0.6, b.x + b.lean + sway, b.y - b.len);
      ctx.stroke();
    }
    ctx.drawImage(this.light, 0, 0, this.w, this.h);
  }
}

// ================= ПОРОДА 16: БИГЛЬ =================
DOG_LEVELS[16] = {
  name: 'Бигль', coin: 750000,
  body: '#d9883e', dark: '#9a5420', light: '#ffffff', shine: '#f0aa66', spot: null,
  saddle: '#2b2420', saddleH: 10, bib: true, blaze: true,
  ear: '#b8692c', earFar: '#7a3e14', earSize: 1.15,
  collar: '#ff6b9d',
  scarf: true, lei: ['#ff6b9d', '#ffd43b', '#ffffff'],   // гавайское ожерелье вместо шарфа
  crown: true, shades: true,                              // тёмные очки вместо короны
  legNear: '#ffffff', legFar: '#d9d0c4', brow: '#7a3e14',
  outline: 'rgba(70,35,10,0.55)', whisker: '#a0703c',
  ears: 'floppy', tail: 'long', legLen: 0.95, bodyLen: 1.1, bodyH: 1.05
};

// В третьем мире собаки снова начинают с обычного размера.
// Размер задаётся в конструкторе Dog, здесь он перехватывается
Object.defineProperty(Dog.prototype, 'size', {
  configurable: true,
  get() { return this._size; },
  set(v) { this._size = this.level >= 16 ? 1.05 + (this.level - 16) * 0.07 : v; }
});

// Ожерелье и очки подключаются к функциям рисования из dog.js
(function () {
  const scarf = drawScarf;
  drawScarf = function (ctx, L, bw, cy, OUT, t) {
    if (L.lei) return drawLei(ctx, L, bw, cy);
    return scarf(ctx, L, bw, cy, OUT, t);
  };
  const crown = drawCrown;
  drawCrown = function (ctx, now) {
    const d = Dog.drawing, L = d && d.info;
    if (L && L.shades) return drawShades(ctx, d);
    return crown(ctx, now);
  };
})();

// Гавайское ожерелье из цветов
function drawLei(ctx, L, bw, cy) {
  const cols = L.lei;
  ctx.save();
  ctx.translate(bw - 6, cy - 8);
  ctx.rotate(-0.5);
  for (let i = 0; i < 8; i++) {
    U.ellipse(ctx, Math.sin(i * 1.7) * 1.1 + 2.6, -11 + i * 3.1 + 1.2, 2.3, 1, '#2f9e44', null, 0.7);
  }
  for (let i = 0; i < 8; i++) miniFlower(ctx, Math.sin(i * 1.7) * 1.1, -11 + i * 3.1, 1, cols[i % cols.length]);
  ctx.restore();
  for (let k = 0; k < 3; k++) miniFlower(ctx, bw - 9 + k * 1.5, cy + 1 + k * 3.4, 1.1, cols[(k + 1) % cols.length]);
}

// Тёмные очки с радужными стёклами. Когда собака радуется, очки уезжают на лоб
function drawShades(ctx, d) {
  const up = d && (d.happy > 0 || d.held);
  ctx.save();
  if (up) { ctx.translate(-1, -9.5); ctx.rotate(-0.25); }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const lens = (x, y, rx, ry) => {
    const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
    g.addColorStop(0, '#ff6b9d');
    g.addColorStop(0.5, '#845ef7');
    g.addColorStop(1, '#15aabf');
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.95;
    U.ellipse(ctx, x, y, rx, ry, g, '#1a1a1a');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - rx * 0.5, y - ry * 0.3); ctx.lineTo(x - rx * 0.1, y - ry * 0.65); ctx.stroke();
  };

  // Дужка к уху
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(1.5, -5.5); ctx.lineTo(-9, -7); ctx.stroke();

  // Дальнее стекло выглядывает из-за морды, потом перемычка и ближнее стекло
  lens(13.8, -4.6, 1.8, 3.4);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(11.5, -5.5); ctx.quadraticCurveTo(12.6, -6.8, 13.6, -5.8); ctx.stroke();
  lens(6.6, -4.2, 5.2, 4.3);
  ctx.restore();
}

// ================= МИР В СПИСКЕ =================
WORLDS.push({
  id: 'beach', name: 'Солнечный остров', icon: '🏝️', min: 16, max: 20, priceMul: 150000,
  Field: BeachField, shadow: '110,75,30', prefix: 'dogevo_w3_'
});

(function addStyle() {
  const s = document.createElement('style');
  s.textContent = '.w-beach .wc-art{background:radial-gradient(circle at 78% 24%,#fffdf0 0 6px,rgba(255,250,210,0) 14px),' +
    'linear-gradient(#2f9fe0,#9fe0f8 45%,#2aa7d0 45%,#5fd8d6 62%,#f3dca2 62%)}';
  document.head.appendChild(s);
})();

// Счётчик пород и коллекция в меню теперь на 20 пород
function fixMenuText() {
  if (typeof Menu === 'undefined' || !Menu.breedsEl) return;
  const n = typeof Reveal !== 'undefined' && Reveal.seen.size ? Reveal.count() : Menu.best();
  Menu.breedsEl.textContent = `${n}/${TOTAL_BREEDS}`;
  Menu.ribbon.textContent = n >= TOTAL_BREEDS ? 'Все породы собраны!' : 'Собери все породы!';
}

document.addEventListener('DOMContentLoaded', () => {
  // Цена первого щенка на острове. upgrades.js берёт её отсюда
  PRICE_BASE.beach = 1500000;

  const show = Menu.show;
  Menu.show = function () { show.call(this); fixMenuText(); };

  Menu.openCollection = function () {
    const best = this.best();
    this.grid.replaceChildren();
    for (let l = 1; l <= TOTAL_BREEDS; l++) {
      const info = DOG_LEVELS[l];
      const open = !!info && (typeof Reveal !== 'undefined' ? Reveal.seen.has(l) : l <= best);
      const card = document.createElement('div');
      card.className = 'card' + (open ? '' : ' locked') + (l === best ? ' top' : '');
      const cv = document.createElement('canvas');
      card.appendChild(cv);
      if (!open) {
        const q = document.createElement('div');
        q.className = 'q';
        q.textContent = '?';
        card.appendChild(q);
      }
      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = open ? info.name : '???';
      const lvl = document.createElement('div');
      lvl.className = 'card-lvl';
      lvl.textContent = 'ур. ' + l;
      card.append(name, lvl);
      if (open) {
        const coin = document.createElement('div');
        coin.className = 'card-coin';
        coin.innerHTML = '<svg viewBox="0 0 64 64"><use href="#coin"/></svg>';
        const v = document.createElement('span');
        v.textContent = '+' + fmtNum(info.coin);
        coin.appendChild(v);
        card.appendChild(coin);
      }
      this.grid.appendChild(card);
      this.drawCard(cv, info ? l : 1, !open);
    }
    this.coll.classList.add('show');
  };

  // После того как все файлы загрузились, обновляем надписи в меню
  setTimeout(fixMenuText);
});
