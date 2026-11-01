// Вторая локация: Снежная долина.
// Берёт всё из field.js (класс Field) и меняет только внешний вид

// Цвет теней задаёт текущий мир (worlds.js): на траве тени зелёные, на снегу голубые
U.shadowRGB = '20,45,10';
U.softShadow = (ctx, x, y, rx, ry, a) => U.softEllipse(ctx, x, y, rx, ry, U.shadowRGB, a);

const WINTER_PINE = {
  near: ['#143a30', '#20543f', '#357152', '#56936b'],
  far: ['#4f6f72', '#62838a', '#7d9ea3', '#a3bfc2']
};
const WINTER_BUSH = ['#1c4636', '#2a5d4a', '#417a62', '#679c84'];
const DRY_GRASS = ['#b59a5a', '#9c8248', '#c9b27a'];

// ================= БУДКА СО СНЕГОМ =================
class WinterHouse extends DogHouse {
  draw(ctx) {
    super.draw(ctx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Снег на боковом скате крыши
    const sg = ctx.createLinearGradient(0, -100, 50, -60);
    sg.addColorStop(0, '#ffffff');
    sg.addColorStop(1, '#d3e3f3');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(0, -88);
    ctx.lineTo(22, -100);
    ctx.lineTo(48.4, -73.4);
    ctx.quadraticCurveTo(48.4, -68, 41.1, -69.4);
    ctx.quadraticCurveTo(41, -64, 33.7, -65.4);
    ctx.quadraticCurveTo(33.7, -60, 26.4, -61.4);
    ctx.closePath();
    ctx.fill();

    // Снег на наличниках
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-44, -49); ctx.lineTo(0, -93); ctx.lineTo(45, -49); ctx.stroke();
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      U.ellipse(ctx, -44 + 44 * t, -49 - 44 * t, 3.4, 2.6, '#ffffff');
      U.ellipse(ctx, 45 - 45 * t, -49 - 44 * t, 3.4, 2.6, '#ffffff');
    }

    // Снежная кромка и сосульки вдоль ската
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(44, -45.5); ctx.lineTo(66, -57.5); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7, x = 44 + 22 * t, y = -45 - 12 * t, len = 5 + ((i * 5) % 4) * 1.6;
      const ig = ctx.createLinearGradient(x, y, x, y + len);
      ig.addColorStop(0, '#ffffff');
      ig.addColorStop(1, 'rgba(170,215,245,0.6)');
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.lineTo(x + 1.6, y); ctx.lineTo(x, y + len); ctx.closePath(); ctx.fill();
    }

    // Сугробики у стен
    for (const [x, w] of [[-30, 12], [30, 10]]) {
      U.ellipse(ctx, x, 1, w, 4, '#ffffff');
      U.ellipse(ctx, x + 2, 2.5, w * 0.7, 1.6, 'rgba(160,190,225,0.5)');
    }
    ctx.restore();
  }
}

// ================= ПОЛЕ =================
class WinterField extends Field {
  resize(w, h, dpr) {
    super.resize(w, h, dpr);
    this.house = new WinterHouse(this.house.x, this.house.y);
    this.butterflies = [];   // зимой бабочек нет
    this.motes = [];         // вместо пыльцы идёт снег
    if (!this.snow) {
      this.snow = [];
      for (let i = 0; i < 70; i++) {
        this.snow.push({ x: U.rand(0, w), y: U.rand(0, h), ph: U.rand(0, 6.28), sp: U.rand(18, 42), s: U.rand(1, 2.6) });
      }
    }
  }

  // Снеговик тоже препятствие
  blocked(x, y) {
    if (super.blocked(x, y)) return true;
    const s = this.snowman;
    return !!s && x > s.x - 30 && x < s.x + 30 && y > s.y - 80 && y < s.y + 18;
  }

  // ---------- Небо ----------
  buildSky() {
    const w = this.w, H = this.area.y;
    const { c, g } = this.makeCanvas(w, H);
    const sky = g.createLinearGradient(0, 0, 0, H * 0.75);
    sky.addColorStop(0, '#5f93cf');
    sky.addColorStop(0.55, '#a8cbec');
    sky.addColorStop(1, '#eef6fd');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, H);

    const sx = w * 0.84, sy = 32;
    const glow = g.createRadialGradient(sx, sy, 0, sx, sy, 100);
    glow.addColorStop(0, 'rgba(255,253,240,1)');
    glow.addColorStop(0.15, 'rgba(255,250,230,0.8)');
    glow.addColorStop(0.45, 'rgba(255,245,220,0.2)');
    glow.addColorStop(1, 'rgba(255,245,220,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, H);
    U.ellipse(g, sx, sy, 13, 13, '#fffdf6');
    return c;
  }

  // ---------- Горы, холмы, земля под лесом ----------
  buildLand(r) {
    const w = this.w, a = this.area, H = a.y + 10;
    const { c, g } = this.makeCanvas(w, H);
    const base = this.skyH + 18;

    for (let x = -30; x < w + 60; x += 55 + r() * 45) {
      const ph = 45 + r() * 40, hw = 50 + r() * 35, top = base - ph;
      const mg = g.createLinearGradient(0, top, 0, base);
      mg.addColorStop(0, '#8fa9c8');
      mg.addColorStop(1, '#b9cde2');
      g.fillStyle = mg;
      g.beginPath(); g.moveTo(x - hw, base); g.lineTo(x, top); g.lineTo(x + hw, base); g.closePath(); g.fill();

      // Теневая сторона горы
      g.fillStyle = 'rgba(40,60,100,0.18)';
      g.beginPath(); g.moveTo(x, top); g.lineTo(x + hw, base); g.lineTo(x + hw * 0.15, base); g.closePath(); g.fill();

      // Снежная шапка с неровным краем
      const cy = top + ph * 0.38, cw = hw * 0.38;
      g.fillStyle = '#f7fbff';
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x + cw, cy);
      g.lineTo(x + cw * 0.45, cy - ph * 0.06);
      g.lineTo(x + cw * 0.1, cy + ph * 0.05);
      g.lineTo(x - cw * 0.35, cy - ph * 0.05);
      g.lineTo(x - cw, cy);
      g.closePath();
      g.fill();
    }

    this.hill(g, this.skyH - 4, 14, '#e9f1f9', '#cddcec', r, H);
    this.hill(g, this.skyH + 14, 12, '#f6f9fc', '#dbe6f1', r, H);

    const fg = g.createLinearGradient(0, a.y - 90, 0, a.y);
    fg.addColorStop(0, 'rgba(225,235,245,0)');
    fg.addColorStop(0.35, '#e1eaf3');
    fg.addColorStop(1, '#d5e2ee');
    g.fillStyle = fg;
    g.fillRect(0, a.y - 90, w, 100);

    // Мелкая текстура снега
    for (let i = 0; i < w * 0.6; i++) {
      U.ellipse(g, r() * w, U.lerp(a.y - 70, a.y + 8, r()), 0.8, 0.6, 'rgba(140,170,210,0.35)');
    }
    for (const t of this.trees) U.softShadow(g, t.x + 12 * t.s, t.y + 2, 42 * t.s, 11 * t.s, t.far ? 0.25 : 0.4);
    return c;
  }

  // ---------- Ель со снегом на каждом ярусе ----------
  tierPath(g, hw, by, ty) {
    g.beginPath();
    g.moveTo(0, ty);
    g.quadraticCurveTo(hw * 0.3, by - 14, hw, by);
    for (let k = 1; k <= 5; k++) {
      const x = hw - 2 * hw * k / 5, xm = hw - 2 * hw * (k - 0.5) / 5;
      g.quadraticCurveTo(xm, by + 6, x, by);
    }
    g.quadraticCurveTo(-hw * 0.3, by - 14, 0, ty);
    g.closePath();
  }

  drawPine(g, far, r) {
    const P = WINTER_PINE[far ? 'far' : 'near'];
    const S = far ? ['#eef4f9', '#c6d4e2'] : ['#ffffff', '#c9dbec'];
    const T = TRUNK[far ? 'far' : 'near'];

    // Ствол
    const tg = g.createLinearGradient(-5, 0, 5, 0);
    tg.addColorStop(0, T[2]);
    tg.addColorStop(1, T[0]);
    g.fillStyle = tg;
    g.beginPath();
    g.moveTo(-8, 0); g.quadraticCurveTo(-4, -2, -4, -10); g.lineTo(-3, -34);
    g.lineTo(3, -34); g.lineTo(4, -10); g.quadraticCurveTo(4, -2, 8, 0);
    g.closePath(); g.fill();

    for (let i = 0; i < 5; i++) {
      const by = -24 - i * 20, ty = by - 36;
      const hw = 40 - i * 7 + (r() - 0.5) * 4;

      if (i > 0) U.softEllipse(g, 3, by + 3, hw * 0.95, 8, '20,40,70', 0.45);

      // Хвоя
      this.tierPath(g, hw, by, ty);
      const lg = g.createLinearGradient(-hw, ty, hw * 0.8, by);
      lg.addColorStop(0, P[3]);
      lg.addColorStop(0.35, P[2]);
      lg.addColorStop(0.7, P[1]);
      lg.addColorStop(1, P[0]);
      g.fillStyle = lg;
      g.fill();

      g.save();
      g.clip();

      // Иголки внизу яруса
      g.lineWidth = 1.2;
      g.lineCap = 'round';
      for (let k = 0; k < (far ? 10 : 22); k++) {
        const v = 0.6 + r() * 0.4, y = ty + v * (by - ty), half = hw * v;
        const x = (r() * 2 - 1) * half;
        g.strokeStyle = x < 0 ? P[3] : P[0];
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x < 0 ? -2.5 : 2.5), y + 3); g.stroke();
      }

      // Снежная шапка с волнистым краем
      const sy = ty + (by - ty) * (0.5 + r() * 0.1);
      const sg = g.createLinearGradient(-hw, ty, hw, by);
      sg.addColorStop(0, S[0]);
      sg.addColorStop(0.6, S[0]);
      sg.addColorStop(1, S[1]);
      g.fillStyle = sg;
      g.beginPath();
      g.moveTo(-hw - 2, ty - 2);
      g.lineTo(hw + 2, ty - 2);
      g.lineTo(hw + 2, sy);
      for (let k = 1; k <= 6; k++) {
        const x0 = hw + 2 - (2 * hw + 4) * (k - 0.5) / 6;
        const x1 = hw + 2 - (2 * hw + 4) * k / 6;
        g.quadraticCurveTo(x0, sy + 5 + r() * 3, x1, sy + (r() - 0.5) * 2);
      }
      g.closePath();
      g.fill();
      U.softEllipse(g, hw * 0.45, sy - 3, hw * 0.5, 6, '120,150,190', 0.3);   // тень на снегу справа
      g.restore();
    }
    U.ellipse(g, 0, -139, 3, 2.5, S[0]);
  }

  // ---------- Голая берёза со снегом на ветках ----------
  drawOak(g, far, r) {
    const bark = far ? ['#dde4ea', '#b7c2cc'] : ['#ffffff', '#cfd8e0'];
    const mark = far ? '#6d7883' : '#2e2a28';
    const twig = far ? '#8794a0' : '#5b4a42';
    const snow = far ? '#eef4f9' : '#ffffff';
    g.lineCap = 'round';

    const branch = (x, y, ang, len, w, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      g.strokeStyle = twig;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      if (Math.abs(Math.cos(ang)) > 0.35) {          // снег лежит только на пологих ветках
        g.strokeStyle = snow;
        g.lineWidth = w * 0.7;
        g.beginPath(); g.moveTo(x, y - w * 0.5); g.lineTo(x2, y2 - w * 0.5); g.stroke();
      }
      if (depth > 0) {
        branch(x2, y2, ang - 0.4 - r() * 0.3, len * 0.65, w * 0.65, depth - 1);
        branch(x2, y2, ang + 0.35 + r() * 0.3, len * 0.6, w * 0.6, depth - 1);
      }
    };

    // Ветки рисуются до ствола, чтобы ствол закрыл место крепления
    for (let i = 0; i < 6; i++) {
      const side = i % 2 ? 1 : -1;
      const y = -48 - i * 11 - r() * 4;
      const ang = side > 0 ? -0.6 - r() * 0.4 : -Math.PI + 0.6 + r() * 0.4;
      branch(side * 2, y, ang, 18 + r() * 10 - i, 2.6 - i * 0.2, 2);
    }
    branch(0, -108, -Math.PI / 2 + (r() - 0.5) * 0.3, 14, 2, 2);

    // Ствол
    const tg = g.createLinearGradient(-6, 0, 6, 0);
    tg.addColorStop(0, bark[0]);
    tg.addColorStop(1, bark[1]);
    g.fillStyle = tg;
    g.beginPath();
    g.moveTo(-7, 0);
    g.quadraticCurveTo(-5, -2, -4.5, -12);
    g.lineTo(-2.5, -112);
    g.lineTo(2.5, -112);
    g.lineTo(4.5, -12);
    g.quadraticCurveTo(5, -2, 7, 0);
    g.closePath();
    g.fill();

    // Чёрные полоски коры
    g.save();
    g.clip();
    g.fillStyle = mark;
    for (let i = 0; i < 12; i++) {
      const y = -6 - r() * 100, x = -5 + r() * 6;
      g.beginPath();
      g.ellipse(x, y, 3 + r() * 4, 0.9 + r() * 0.6, (r() - 0.5) * 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  // ---------- Снежный луг, замёрзший пруд, кусты, забор ----------
  buildNear(r) {
    const w = this.w, h = this.h, a = this.area, p = this.pond;
    const { c, g } = this.makeCanvas(w, h);
    this.snowman = { x: a.x + 58, y: a.y + a.h - 44 };
    const sm = this.snowman;

    // Снег за забором
    const og = g.createLinearGradient(0, a.y - 10, 0, h);
    og.addColorStop(0, '#dbe5ef');
    og.addColorStop(1, '#bfcfdf');
    g.fillStyle = og;
    g.fillRect(0, a.y - 10, w, h - a.y + 10);

    // Снег внутри забора
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    const mg = g.createRadialGradient(cx, cy * 0.9, 20, cx, cy, Math.max(a.w, a.h) * 0.75);
    mg.addColorStop(0, '#ffffff');
    mg.addColorStop(0.6, '#eef3f9');
    mg.addColorStop(1, '#d6e2ee');
    g.fillStyle = mg;
    g.fillRect(a.x, a.y, a.w, a.h);

    g.save();
    g.beginPath(); g.rect(a.x, a.y, a.w, a.h); g.clip();

    // Тень от леса у верхнего забора
    const tg = g.createLinearGradient(0, a.y, 0, a.y + 60);
    tg.addColorStop(0, 'rgba(70,100,150,0.3)');
    tg.addColorStop(1, 'rgba(70,100,150,0)');
    g.fillStyle = tg;
    g.fillRect(a.x, a.y, a.w, 60);

    // Волны сугробов: голубая тень и белый гребень
    for (let i = 0; i < 10; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h, rx = 50 + r() * 70, ry = 16 + r() * 14;
      U.softEllipse(g, x + 8, y + 6, rx, ry, '120,150,195', 0.16);
      U.softEllipse(g, x, y, rx * 0.9, ry * 0.8, '255,255,255', 0.7);
    }

    // Утоптанный снег у будки
    U.softEllipse(g, this.house.x + 12, this.house.y + 8, 80, 26, '160,185,215', 0.4);
    U.softEllipse(g, this.house.x, this.house.y + 12, 40, 12, '140,165,200', 0.3);
    g.restore();

    const onPond = (x, y) => {
      const dx = (x - p.x) / (p.rx + 10), dy = (y - p.y) / (p.ry + 8);
      return dx * dx + dy * dy < 1;
    };
    const inside = (x, y, m = 6) => x > a.x + m && x < a.x + a.w - m && y > a.y + m && y < a.y + a.h - 4;
    const onSnowman = (x, y) => Math.abs(x - sm.x) < 34 && y > sm.y - 30 && y < sm.y + 16;
    const free = (x, y) => inside(x, y) && !onPond(x, y) && !this.house.blocks(x, y) && !onSnowman(x, y);

    // Текстура снега
    const dots = Math.floor(w * (h - a.y) / 90);
    for (let i = 0; i < dots; i++) {
      const x = r() * w, y = a.y - 6 + r() * (h - a.y + 6);
      if (onPond(x, y)) continue;
      U.ellipse(g, x, y, 0.8 + r() * 0.6, 0.6, 'rgba(140,170,210,0.35)');
    }

    // Искорки на снегу
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 1;
    for (let i = 0; i < a.w * a.h / 3000; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h;
      if (!free(x, y)) continue;
      U.ellipse(g, x, y, 1.6, 1.6, 'rgba(150,180,220,0.35)');
      g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + 2, y); g.moveTo(x, y - 2); g.lineTo(x, y + 2); g.stroke();
    }

    // Сухая трава из-под снега
    for (let i = 0; i < a.w * a.h / 1400; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h;
      if (free(x, y)) this.dryTuft(g, x, y, r);
    }

    // Цепочка следов лап
    let tx = a.x + a.w * 0.2, ty = a.y + a.h * 0.5, tang = -0.4;
    for (let i = 0; i < 36; i++) {
      tang += (r() - 0.5) * 0.5;
      const nx = tx + Math.cos(tang) * 13, ny = ty + Math.sin(tang) * 8;
      if (!inside(nx, ny, 30)) { tang += Math.PI * 0.6; continue; }
      tx = nx; ty = ny;
      const side = i % 2 ? 1 : -1;
      const px = tx - Math.sin(tang) * 4 * side, py = ty + Math.cos(tang) * 2.5 * side;
      if (free(px, py)) this.pawPrint(g, px, py, tang);
    }

    // Камни под снегом
    for (let i = 0; i < 10; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h;
      if (!free(x, y)) continue;
      this.snowStone(g, x, y, 2.5 + r() * 3);
      if (r() < 0.4) this.snowStone(g, x + 6, y + 2, 1.5 + r() * 2);
    }

    this.drawSnowman(g, sm.x, sm.y);
    this.drawPond(g, r);

    // Точки, где на льду мерцают блики
    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      const an = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.7;
      this.sparkles.push({ x: p.x + Math.cos(an) * d * p.rx, y: p.y + Math.sin(an) * d * p.ry, ph: r() * 6.28 });
    }

    // Кусты с ягодами по бокам и снизу
    for (let y = a.y + 20; y < a.y + a.h; y += 50 + r() * 30) {
      this.winterBush(g, 8 + r() * 8, y, 0.6 + r() * 0.3, r);
      this.winterBush(g, w - 8 - r() * 8, y, 0.6 + r() * 0.3, r);
    }
    for (let x = 20; x < w; x += 60 + r() * 40) this.winterBush(g, x, h - 4 - r() * 8, 0.6 + r() * 0.3, r);

    // Забор со снегом: дальняя сторона, бока, ближняя
    this.snowFence(g, a.x, a.y, a.x + a.w, a.y);
    this.snowFence(g, a.x, a.y, a.x, a.y + a.h);
    this.snowFence(g, a.x + a.w, a.y, a.x + a.w, a.y + a.h);
    this.snowFence(g, a.x, a.y + a.h, a.x + a.w, a.y + a.h);

    return c;
  }

  dryTuft(g, x, y, r) {
    U.ellipse(g, x, y + 0.5, 4, 1.2, 'rgba(140,165,200,0.35)');
    const n = 3 + ((r() * 3) | 0);
    g.lineWidth = 1.2;
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const an = -Math.PI / 2 + (i / (n - 1) - 0.5) * 1.1 + (r() - 0.5) * 0.2;
      const len = 4 + r() * 6, bx = x + (i - n / 2) * 1.2;
      g.strokeStyle = DRY_GRASS[(r() * DRY_GRASS.length) | 0];
      g.beginPath();
      g.moveTo(bx, y);
      g.quadraticCurveTo(bx + Math.cos(an) * len * 0.3, y + Math.sin(an) * len * 0.6, bx + Math.cos(an) * len, y + Math.sin(an) * len);
      g.stroke();
    }
  }

  pawPrint(g, x, y, ang) {
    g.save();
    g.translate(x, y);
    g.scale(1, 0.6);   // след "лежит" на земле
    g.rotate(ang);
    g.fillStyle = 'rgba(120,150,195,0.4)';
    g.beginPath(); g.ellipse(0, 0, 2.6, 2.2, 0, 0, Math.PI * 2); g.fill();
    for (const [tx, ty] of [[3.4, -2.3], [4.3, 0], [3.4, 2.3]]) {
      g.beginPath(); g.arc(tx, ty, 1.1, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  snowStone(g, x, y, s) {
    this.stone(g, x, y, s);
    U.ellipse(g, x - s * 0.1, y - s * 0.5, s * 1.1, s * 0.42, '#ffffff');
  }

  drawSnowman(g, x, y) {
    U.softShadow(g, x + 7, y + 2, 30, 8, 0.5);
    g.lineCap = 'round';
    g.lineJoin = 'round';

    // Руки-веточки
    g.strokeStyle = '#6b4a2e';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(x - 10, y - 42); g.lineTo(x - 27, y - 54);
    g.moveTo(x - 22, y - 51); g.lineTo(x - 25, y - 60);
    g.moveTo(x - 22, y - 51); g.lineTo(x - 30, y - 50);
    g.moveTo(x + 10, y - 42); g.lineTo(x + 26, y - 50);
    g.moveTo(x + 21, y - 47.5); g.lineTo(x + 25, y - 56);
    g.stroke();

    // Три снежных кома
    const ball = (bx, by, rad) => {
      const bg = g.createRadialGradient(bx - rad * 0.35, by - rad * 0.4, rad * 0.1, bx, by, rad);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.6, '#eef4fa');
      bg.addColorStop(1, '#bccde0');
      g.lineWidth = 1.2;
      U.ellipse(g, bx, by, rad, rad * 0.95, bg, 'rgba(90,120,165,0.45)');
    };
    ball(x, y - 15, 17);
    ball(x, y - 40, 13);
    ball(x, y - 60, 10);

    // Пуговицы-угольки
    for (const by of [-46, -40, -34]) {
      U.ellipse(g, x + 1, y + by, 1.7, 1.7, '#2b2b2b');
      U.ellipse(g, x + 0.5, y + by - 0.5, 0.5, 0.5, 'rgba(255,255,255,0.6)');
    }

    // Глаза и улыбка
    U.ellipse(g, x - 3, y - 63, 1.5, 1.7, '#2b2b2b');
    U.ellipse(g, x + 4, y - 63, 1.5, 1.7, '#2b2b2b');
    U.ellipse(g, x - 3.4, y - 63.6, 0.5, 0.5, '#ffffff');
    U.ellipse(g, x + 3.6, y - 63.6, 0.5, 0.5, '#ffffff');
    for (const [sx, sy] of [[-4, -56.5], [-2, -55.3], [0.5, -55], [3, -55.3], [5, -56.5]]) {
      U.ellipse(g, x + sx, y + sy, 0.8, 0.8, '#2b2b2b');
    }

    // Нос-морковка
    const cg = g.createLinearGradient(x, y - 61, x + 13, y - 58);
    cg.addColorStop(0, '#ffa94d');
    cg.addColorStop(1, '#e8590c');
    g.fillStyle = cg;
    g.beginPath(); g.moveTo(x + 1, y - 61); g.lineTo(x + 13, y - 58.5); g.lineTo(x + 1, y - 57); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(150,60,0,0.5)';
    g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(x + 4, y - 60.3); g.lineTo(x + 4.6, y - 58.2); g.moveTo(x + 7.5, y - 59.6); g.lineTo(x + 8, y - 58); g.stroke();

    // Шарф
    g.fillStyle = '#e03131';
    U.rrect(g, x - 11, y - 53, 22, 5, 2.5); g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(x - 6, y - 53, 2, 5);
    g.fillRect(x + 3, y - 53, 2, 5);
    g.save();
    g.translate(x + 6, y - 50);
    g.rotate(0.15);
    g.fillStyle = '#e03131';
    U.rrect(g, -2.5, 0, 5, 12, 2); g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(-2.5, 3.5, 5, 1.6);
    g.fillRect(-2.5, 7.5, 5, 1.6);
    g.strokeStyle = '#e03131';
    g.lineWidth = 1;
    g.beginPath();
    for (const fx of [-1.6, 0, 1.6]) { g.moveTo(fx, 12); g.lineTo(fx, 14.5); }
    g.stroke();
    g.restore();

    // Ведро на голове
    const bk = g.createLinearGradient(x - 8, 0, x + 8, 0);
    bk.addColorStop(0, '#91a7ff');
    bk.addColorStop(0.5, '#4c6ef5');
    bk.addColorStop(1, '#2f4ac0');
    g.fillStyle = bk;
    g.beginPath(); g.moveTo(x - 8, y - 67); g.lineTo(x + 8, y - 67); g.lineTo(x + 6, y - 79); g.lineTo(x - 6, y - 79); g.closePath(); g.fill();
    g.strokeStyle = '#26408b';
    g.lineWidth = 1;
    g.stroke();
    U.ellipse(g, x, y - 67, 8.5, 2, '#4c6ef5', '#26408b');
    U.ellipse(g, x, y - 79, 6, 1.5, '#91a7ff', '#26408b');
    U.ellipse(g, x, y - 80, 6, 1.6, '#ffffff');
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.beginPath(); g.moveTo(x - 5, y - 69); g.lineTo(x - 4, y - 77); g.stroke();
  }

  // Замёрзший пруд
  drawPond(g, r) {
    const p = this.pond;

    // Снежный берег
    U.softShadow(g, p.x + 4, p.y + 6, p.rx + 20, p.ry + 13, 0.4);
    U.ellipse(g, p.x, p.y + 3, p.rx + 10, p.ry + 8, '#c3d3e4');
    U.ellipse(g, p.x, p.y + 1, p.rx + 7, p.ry + 6, '#f6f9fc');

    g.save();
    g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); g.clip();

    // Лёд
    const ig = g.createLinearGradient(p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry);
    ig.addColorStop(0, '#e6f6ff');
    ig.addColorStop(0.45, '#a9d8f0');
    ig.addColorStop(1, '#6fafd6');
    g.fillStyle = ig;
    g.fillRect(p.x - p.rx, p.y - p.ry, p.rx * 2, p.ry * 2);
    U.softEllipse(g, p.x + p.rx * 0.2, p.y + p.ry * 0.15, p.rx * 0.55, p.ry * 0.45, '40,100,160', 0.3);
    U.softEllipse(g, p.x, p.y - p.ry, p.rx * 1.1, p.ry * 0.5, '40,80,130', 0.3);

    // Трещины: тёмная линия и светлая рядом
    for (let i = 0; i < 4; i++) {
      let x = p.x + (r() - 0.5) * p.rx * 1.2, y = p.y + (r() - 0.5) * p.ry;
      let an = r() * Math.PI * 2;
      const pts = [[x, y]];
      for (let k = 0; k < 4; k++) {
        an += (r() - 0.5) * 1.2;
        x += Math.cos(an) * 8;
        y += Math.sin(an) * 4;
        pts.push([x, y]);
      }
      for (const [col, off] of [['rgba(40,90,140,0.35)', 0.8], ['rgba(255,255,255,0.75)', 0]]) {
        g.strokeStyle = col;
        g.lineWidth = 1;
        g.beginPath();
        pts.forEach(([px, py], j) => (j ? g.lineTo(px, py + off) : g.moveTo(px, py + off)));
        g.stroke();
      }
    }

    // Следы коньков
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 0.9;
    for (let i = 0; i < 3; i++) {
      const s = r() * Math.PI;
      g.beginPath();
      g.ellipse(p.x + (r() - 0.5) * p.rx * 0.6, p.y + (r() - 0.5) * p.ry * 0.4,
        p.rx * (0.3 + r() * 0.25), p.ry * (0.25 + r() * 0.2), (r() - 0.5) * 0.4, s, s + Math.PI * 1.1);
      g.stroke();
    }

    // Иней по краю
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 5;
    g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = 2;
    g.beginPath(); g.ellipse(p.x, p.y, p.rx - 4, p.ry - 3, 0, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 40; i++) {
      const an = r() * Math.PI * 2, d = 0.85 + r() * 0.12;
      U.ellipse(g, p.x + Math.cos(an) * d * p.rx, p.y + Math.sin(an) * d * p.ry, 1 + r(), 0.8, 'rgba(255,255,255,0.85)');
    }
    g.restore();

    // Снег на льду
    U.ellipse(g, p.x - p.rx * 0.55, p.y + p.ry * 0.55, 9, 3.2, '#ffffff');
    U.ellipse(g, p.x + p.rx * 0.6, p.y - p.ry * 0.5, 7, 2.6, '#ffffff');

    // Камни на берегу
    this.snowStone(g, p.x - p.rx - 4, p.y + 4, 4);
    this.snowStone(g, p.x - p.rx + 6, p.y + p.ry + 2, 3);
    this.snowStone(g, p.x + p.rx * 0.3, p.y + p.ry + 5, 3.5);

    // Сухой камыш со снегом
    g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const bx = p.x + p.rx * 0.35 + i * 5 + r() * 3;
      const by = p.y - p.ry * 0.55 + r() * 4;
      const hgt = 26 + r() * 14, lean = (r() - 0.3) * 8;
      g.strokeStyle = '#c2a46a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 6, by - hgt * 0.5, bx - 10 + lean, by - hgt * 0.7); g.stroke();
      g.strokeStyle = '#a88a52'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + lean * 0.3, by - hgt * 0.6, bx + lean, by - hgt); g.stroke();
      if (i % 2 === 0) {
        const hx = bx + lean * 0.75, hy = by - hgt * 0.78;
        U.ellipse(g, hx, hy, 2.4, 6, '#7a5230', null, lean * 0.03);
        U.ellipse(g, hx, hy - 5, 2.4, 1.6, '#ffffff');
      }
    }
  }

  winterBush(g, x, y, s, r) {
    U.softShadow(g, x + 4 * s, y + 2, 26 * s, 8 * s, 0.45);
    const cl = [[-11, -9, 12], [11, -9, 12], [0, -17, 14], [-4, -6, 10]]
      .map(([bx, by, br]) => [x + bx * s, y + by * s, br * s * (0.9 + r() * 0.2)]);
    this.canopy(g, cl, WINTER_BUSH, r, 0.6);

    // Снег на верхушках
    for (const [bx, by, br] of cl) {
      const sg = g.createLinearGradient(0, by - br, 0, by);
      sg.addColorStop(0, '#ffffff');
      sg.addColorStop(1, '#d6e3f0');
      U.ellipse(g, bx - br * 0.1, by - br * 0.45, br * 0.85, br * 0.5, sg);
    }

    // Красные ягоды
    g.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const fx = x + (r() - 0.5) * 26 * s, fy = y - (3 + r() * 12) * s;
      U.ellipse(g, fx, fy, 2.1, 2.1, '#d6213a', '#8a1020');
      U.ellipse(g, fx - 0.7, fy - 0.7, 0.6, 0.6, '#ffffff');
    }
  }

  snowFence(g, x1, y1, x2, y2) {
    this.fence(g, x1, y1, x2, y2);
    const H = 24;
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 36));
    g.lineCap = 'round';

    // Снег на перекладинах
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(x1, y1 - 20.5); g.lineTo(x2, y2 - 20.5); g.stroke();
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(x1, y1 - 10.5); g.lineTo(x2, y2 - 10.5); g.stroke();

    // Шапки на столбиках
    for (let i = 0; i <= n; i++) {
      const px = x1 + (x2 - x1) * i / n, py = y1 + (y2 - y1) * i / n;
      U.ellipse(g, px + 0.5, py - H - 1, 5.4, 2.4, 'rgba(150,180,215,0.6)');
      U.ellipse(g, px, py - H - 2.2, 5.2, 2.8, '#ffffff');
    }
  }

  buildLight() {
    const w = this.w, h = this.h;
    const { c, g } = this.makeCanvas(w, h);
    const sun = g.createRadialGradient(w * 0.84, 32, 0, w * 0.84, 32, Math.max(w, h) * 0.9);
    sun.addColorStop(0, 'rgba(255,248,230,0.2)');
    sun.addColorStop(0.5, 'rgba(255,248,230,0.05)');
    sun.addColorStop(1, 'rgba(255,248,230,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);
    const v = g.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.45, w / 2, h * 0.55, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(30,50,90,0)');
    v.addColorStop(1, 'rgba(30,50,90,0.34)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
    return c;
  }

  // Вместо травы спереди лежит сугроб
  buildForegroundGrass(r) {
    this.grass = [];
    const w = this.w, H = 46;
    const { c, g } = this.makeCanvas(w, H);
    const top = x => 16 + Math.sin(x * 0.03 + 1) * 6 + Math.sin(x * 0.11) * 3;

    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, top(x));
    g.lineTo(w + 8, H);
    g.closePath();
    const dg = g.createLinearGradient(0, 8, 0, H);
    dg.addColorStop(0, '#ffffff');
    dg.addColorStop(1, '#cfdcea');
    g.fillStyle = dg;
    g.fill();

    // Голубая тень под гребнем
    g.strokeStyle = 'rgba(140,170,210,0.45)';
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= w + 8; x += 8) (x ? g.lineTo(x, top(x) + 4) : g.moveTo(x, top(x) + 4));
    g.stroke();

    // Сухие травинки из сугроба
    g.lineWidth = 1.6;
    g.lineCap = 'round';
    for (let x = 10; x < w; x += 25 + r() * 40) {
      const y = top(x) + 2;
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = DRY_GRASS[(r() * DRY_GRASS.length) | 0];
        g.beginPath(); g.moveTo(x + k * 2, y); g.lineTo(x + k * 2 + (k - 1) * 3, y - 7 - r() * 7); g.stroke();
      }
    }
    this.drift = c;
    this.driftH = H;
  }

  // ---------- Анимация ----------
  update(dt) {
    super.update(dt);
    for (const s of this.snow) {
      s.y += s.sp * dt;
      s.x += (Math.sin(this.t * 1.2 + s.ph) * 14 + 8) * dt;
      if (s.y > this.h + 5) { s.y = -5; s.x = U.rand(-20, this.w); }
      if (s.x > this.w + 10) s.x = -10;
    }
  }

  // Блик, который пробегает по льду, и искры
  drawWater(ctx) {
    const p = this.pond;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.clip();
    const k = (this.t * 0.18) % 1.4 - 0.2;
    ctx.translate(p.x - p.rx * 1.3 + k * p.rx * 2.6, p.y);
    ctx.transform(1, 0, -0.6, 1, 0, 0);
    const sg = ctx.createLinearGradient(-18, 0, 18, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-18, -p.ry, 36, p.ry * 2);
    ctx.restore();

    for (const s of this.sparkles) {
      const v = Math.sin(this.t * 2.5 + s.ph);
      if (v <= 0.3) continue;
      const al = (v - 0.3) / 0.7, z = 2 + al * 2.5;
      ctx.strokeStyle = `rgba(255,255,255,${al})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x - z, s.y); ctx.lineTo(s.x + z, s.y);
      ctx.moveTo(s.x, s.y - z); ctx.lineTo(s.x, s.y + z);
      ctx.stroke();
    }
  }

  // Над собаками: тени облаков, сугроб, свет, снегопад
  drawOverlay(ctx) {
    for (const c of this.shadows) U.softEllipse(ctx, c.x, c.y, c.r * 1.6, c.r, '60,90,140', 0.08);
    ctx.drawImage(this.drift, 0, this.h - this.driftH, this.w, this.driftH);
    ctx.drawImage(this.light, 0, 0, this.w, this.h);

    const fx = typeof Settings === 'undefined' || Settings.data.effects;
    if (!fx) return;
    for (const s of this.snow) {
      if (s.s > 2) U.ellipse(ctx, s.x, s.y, s.s * 2, s.s * 2, 'rgba(255,255,255,0.18)');
      U.ellipse(ctx, s.x, s.y, s.s, s.s, 'rgba(255,255,255,0.92)');
    }
  }
}
