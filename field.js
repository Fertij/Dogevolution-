// Игровое поле: небо, холмы, лес, луг, пруд, забор, будка, бабочки
// Свет падает сверху слева: блики рисуются слева, тени справа

const TREE_PAL = {
  oak:  { near: ['#22522a', '#3c8434', '#68b342', '#a3d95e'], far: ['#4a7a60', '#5f9274', '#7dad8a', '#9cc5a2'] },
  pine: { near: ['#163d2b', '#235f3b', '#3b874a', '#69b25e'], far: ['#436b5d', '#57846f', '#729e86', '#8fb79c'] }
};
const TRUNK = { near: ['#4e2d16', '#80522a', '#a87443'], far: ['#5a5648', '#736e5e', '#8c8674'] };

// ================= БУДКА =================
class DogHouse {
  constructor(x, y) { this.x = x; this.y = y; }

  // Зона, куда собака не ходит
  blocks(px, py) {
    return px > this.x - 60 && px < this.x + 95 && py > this.y - 50 && py < this.y + 34;
  }

  roofPlane(ctx, pts, c1, c2, ridge, eave) {
    ctx.save();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const g = ctx.createLinearGradient(ridge[0], ridge[1], eave[0], eave[1]);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();

    // Ряды черепицы
    const dx = 22, dy = -12;
    const ex = (eave[0] - ridge[0]) / 6, ey = (eave[1] - ridge[1]) / 6;
    ctx.lineWidth = 1.2;
    for (let k = 1; k <= 6; k++) {
      const px = ridge[0] + ex * k, py = ridge[1] + ey * k;
      ctx.strokeStyle = 'rgba(70,10,5,0.45)';
      ctx.beginPath(); ctx.moveTo(px - dx, py - dy); ctx.lineTo(px + dx * 2, py + dy * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,190,170,0.35)';
      ctx.beginPath(); ctx.moveTo(px - dx, py - dy + 1.2); ctx.lineTo(px + dx * 2, py + dy * 2 + 1.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(70,10,5,0.3)';
      for (let j = 0; j < 5; j++) {
        const t = (j + (k % 2) * 0.5) / 4;
        const qx = px - ex + dx * t, qy = py - ey + dy * t;
        ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx + ex, qy + ey); ctx.stroke();
      }
    }
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    U.softShadow(ctx, 18, 3, 72, 17, 0.5);

    // Боковая стена
    const side = ctx.createLinearGradient(35, 0, 57, 0);
    side.addColorStop(0, '#94592a');
    side.addColorStop(1, '#6e3e1b');
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.moveTo(35, 0); ctx.lineTo(57, -12); ctx.lineTo(57, -60); ctx.lineTo(35, -48);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,5,0.4)'; ctx.lineWidth = 1.2;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(35, -i * 12); ctx.lineTo(57, -12 - i * 12); ctx.stroke();
    }

    // Крыша: левый и правый скаты, конёк
    this.roofPlane(ctx, [[0, -86], [22, -98], [-21, -57], [-43, -45]], '#f0554a', '#c8362c', [0, -86], [-43, -45]);
    this.roofPlane(ctx, [[0, -86], [22, -98], [66, -57], [44, -45]], '#b52f28', '#86201b', [0, -86], [44, -45]);
    ctx.strokeStyle = '#6e1a15'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, -86); ctx.lineTo(22, -98); ctx.stroke();
    ctx.strokeStyle = '#e8574c'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -87); ctx.lineTo(22, -99); ctx.stroke();

    // Передняя стена
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-35, 0); ctx.lineTo(-35, -48); ctx.lineTo(0, -82); ctx.lineTo(35, -48); ctx.lineTo(35, 0);
    ctx.closePath();
    const wall = ctx.createLinearGradient(-35, -82, 35, 0);
    wall.addColorStop(0, '#f4c98f');
    wall.addColorStop(1, '#c4844a');
    ctx.fillStyle = wall;
    ctx.fill();
    ctx.clip();
    for (let i = 0; i < 7; i++) {
      const y = -i * 12;
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(120,60,20,0.07)';
      ctx.fillRect(-35, y - 12, 70, 12);
      ctx.strokeStyle = 'rgba(90,45,15,0.5)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-35, y - 12); ctx.lineTo(35, y - 12); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,210,0.4)';
      ctx.beginPath(); ctx.moveTo(-35, y - 10.8); ctx.lineTo(35, y - 10.8); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(110,60,20,0.3)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 9; i++) {
      const y = -6 - i * 8, x = -30 + (i * 23) % 50;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 1.5, x + 12, y); ctx.stroke();
    }
    const ao = ctx.createLinearGradient(0, -84, 0, -42);
    ao.addColorStop(0, 'rgba(60,25,5,0.5)');
    ao.addColorStop(1, 'rgba(60,25,5,0)');
    ctx.fillStyle = ao;
    ctx.fillRect(-35, -84, 70, 42);
    ctx.restore();

    // Вход
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(-15, -22); ctx.arc(0, -22, 15, Math.PI, 0); ctx.lineTo(15, 0);
    ctx.closePath();
    const door = ctx.createLinearGradient(0, -37, 0, 0);
    door.addColorStop(0, '#140a04');
    door.addColorStop(1, '#3d2614');
    ctx.fillStyle = door; ctx.fill();
    ctx.strokeStyle = '#7a4520'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#f0bb7a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -22, 17, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
    U.ellipse(ctx, 0, -3, 11, 3, '#c9a24a');
    U.ellipse(ctx, -3, -4, 5, 1.2, '#e3c26a');

    // Белые наличники крыши
    ctx.strokeStyle = '#7a3a20'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(-45, -43); ctx.lineTo(0, -87); ctx.lineTo(46, -43); ctx.stroke();
    ctx.strokeStyle = '#fff3dc'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-45, -44); ctx.lineTo(0, -88); ctx.lineTo(46, -44); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-45, -47); ctx.lineTo(0, -91); ctx.stroke();

    // Косточка над входом
    ctx.fillStyle = '#fff8e7';
    U.rrect(ctx, -9, -62, 18, 5, 2.5); ctx.fill();
    [[-9, -63], [-9, -56], [9, -63], [9, -56]].forEach(([bx, by]) => U.ellipse(ctx, bx, by, 3, 3, '#fff8e7'));
    ctx.strokeStyle = 'rgba(120,80,40,0.4)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-7, -57); ctx.lineTo(7, -57); ctx.stroke();

    // Миска с кормом
    U.softShadow(ctx, 57, 17, 18, 5, 0.45);
    const bowl = ctx.createLinearGradient(42, 8, 68, 16);
    bowl.addColorStop(0, '#6aa5ff');
    bowl.addColorStop(1, '#1f55b8');
    U.ellipse(ctx, 54, 12, 13, 6, bowl);
    U.ellipse(ctx, 54, 10, 10.5, 3.6, '#7a4e24');
    for (let i = 0; i < 6; i++) U.ellipse(ctx, 47 + i * 2.8, 9.5 + (i % 2) * 0.8, 1.6, 1.2, '#c48a4a');
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(54, 12, 12, 5, 0, Math.PI * 0.85, Math.PI * 1.15); ctx.stroke();

    // Мячик
    U.softShadow(ctx, -45, 18, 9, 3, 0.45);
    const ball = ctx.createRadialGradient(-48.5, 9, 1, -46, 12, 7);
    ball.addColorStop(0, '#ff9a8f');
    ball.addColorStop(1, '#c62828');
    U.ellipse(ctx, -46, 12, 6.5, 6.5, ball);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-51.5, 9); ctx.quadraticCurveTo(-46, 15, -40.5, 9); ctx.stroke();

    ctx.restore();
  }
}

// ================= БАБОЧКА =================
const BUTTERFLY_COLORS = [['#ffd43b', '#c99700'], ['#ff8fab', '#d6336c'], ['#74c0fc', '#1c7ed6'], ['#ffffff', '#adb5bd'], ['#ffa94d', '#d9480f']];

class Butterfly {
  constructor(x, y) {
    this.x = x; this.y = y; this.tx = x; this.ty = y;
    this.t = U.rand(0, 10);
    this.h = U.rand(22, 38);
    [this.color, this.edge] = BUTTERFLY_COLORS[(Math.random() * BUTTERFLY_COLORS.length) | 0];
  }

  update(dt, field) {
    this.t += dt;
    const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy);
    if (d < 5) {
      const p = field.randomPoint(); this.tx = p.x; this.ty = p.y;
    } else {
      this.x += dx / d * 35 * dt;
      this.y += dy / d * 35 * dt;
    }
  }

  draw(ctx) {
    const f = Math.abs(Math.sin(this.t * 16));
    const x = this.x, y = this.y - this.h - Math.sin(this.t * 3) * 6;
    U.ellipse(ctx, x, this.y, 4, 1.5, 'rgba(0,0,0,0.15)');
    ctx.lineWidth = 0.8;
    U.ellipse(ctx, x - 4 * f - 1, y - 2, 5 * f + 0.6, 4.2, this.color, this.edge);
    U.ellipse(ctx, x + 4 * f + 1, y - 2, 5 * f + 0.6, 4.2, this.color, this.edge);
    U.ellipse(ctx, x - 3 * f - 1, y + 3, 3.5 * f + 0.6, 3, this.color, this.edge);
    U.ellipse(ctx, x + 3 * f + 1, y + 3, 3.5 * f + 0.6, 3, this.color, this.edge);
    U.ellipse(ctx, x - 4.5 * f - 1, y - 2.5, 1.6 * f + 0.2, 1.4, 'rgba(255,255,255,0.7)');
    U.ellipse(ctx, x + 4.5 * f + 1, y - 2.5, 1.6 * f + 0.2, 1.4, 'rgba(255,255,255,0.7)');
    U.ellipse(ctx, x, y, 1.2, 4, '#2b2b2b');
    ctx.strokeStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.moveTo(x, y - 3.5); ctx.lineTo(x - 2, y - 7);
    ctx.moveTo(x, y - 3.5); ctx.lineTo(x + 2, y - 7);
    ctx.stroke();
  }
}

// ================= ПОЛЕ =================
class Field {
  constructor() {
    this.area = { x: 0, y: 0, w: 0, h: 0 };
    this.trees = [];
    this.clouds = [];
    this.cloudSprites = [];
    this.shadows = [];
    this.butterflies = [];
    this.motes = [];
    this.ripples = [];
    this.grass = [];
    this.t = 0;
    this.rippleTimer = 1;
  }

  resize(w, h, dpr) {
    this.w = w; this.h = h; this.dpr = dpr;
    this.skyH = 80;
        const top = 180, side = 22, bottom = 100;
    this.area = { x: side, y: top, w: w - side * 2, h: Math.max(200, h - top - bottom) };
    const a = this.area;

    this.house = new DogHouse(a.x + 62, a.y + 80);
    const prx = Math.min(72, a.w * 0.2);
    this.pond = { x: a.x + a.w - prx - 30, y: a.y + a.h - prx * 0.55 - 44, rx: prx, ry: prx * 0.55 };

    // Статичные слои рисуются один раз в отдельные холсты, так игра не тормозит
    const r = U.seeded(7);
    this.cloudSprites = [0, 1, 2].map(() => this.makeCloud(r));
    this.buildTrees(r);
    this.sky = this.buildSky();
    this.land = this.buildLand(r);
    this.near = this.buildNear(r);
    this.light = this.buildLight();
    this.buildForegroundGrass(r);

    if (!this.clouds.length) {
      for (let i = 0; i < 4; i++) {
        this.clouds.push({ x: U.rand(-60, w), y: U.rand(4, this.skyH - 40), s: U.rand(0.55, 0.95), speed: U.rand(4, 9), k: i % 3 });
      }
      for (let i = 0; i < 3; i++) {
        this.shadows.push({ x: U.rand(0, w), y: U.rand(a.y, h), r: U.rand(80, 150), speed: U.rand(8, 16) });
      }
      for (let i = 0; i < 4; i++) {
        const p = this.randomPoint();
        this.butterflies.push(new Butterfly(p.x, p.y));
      }
      for (let i = 0; i < 22; i++) {
        this.motes.push({ x: U.rand(0, w), y: U.rand(a.y, h), ph: U.rand(0, 6.28), sp: U.rand(4, 10) });
      }
    }
  }

  makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * this.dpr));
    c.height = Math.max(1, Math.round(h * this.dpr));
    const g = c.getContext('2d');
    g.scale(this.dpr, this.dpr);
    return { c, g };
  }

  // ---------- Куда можно ходить ----------
  blocked(x, y) {
    if (this.house.blocks(x, y)) return true;
    const p = this.pond;
    const dx = (x - p.x) / (p.rx + 28), dy = (y - p.y) / (p.ry + 40);
    return dx * dx + dy * dy < 1;
  }

  pathClear(x1, y1, x2, y2) {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (this.blocked(U.lerp(x1, x2, t), U.lerp(y1, y2, t))) return false;
    }
    return true;
  }

  // Случайная точка на лугу. Если передать (fx, fy), путь до точки обходит будку и пруд
  randomPoint(fx, fy) {
    const a = this.area;
    for (let i = 0; i < 40; i++) {
      const x = U.rand(a.x + 34, a.x + a.w - 34);
      const y = U.rand(a.y + 44, a.y + a.h - 34);
      if (this.blocked(x, y)) continue;
      if (fx !== undefined && !this.pathClear(fx, fy, x, y)) continue;
      return { x, y };
    }
    return fx !== undefined ? { x: fx, y: fy } : { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  }

  // ---------- Облака ----------
  makeCloud(r) {
    const W = 130, H = 64;
    const { c, g } = this.makeCanvas(W, H);
    const puffs = [];
    const n = 5 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const rad = 12 + Math.sin(t * Math.PI) * 12 + r() * 5;
      puffs.push([18 + t * 94, 44 - Math.sin(t * Math.PI) * 10 - r() * 4, rad]);
    }
    g.save();
    g.beginPath(); g.rect(0, 0, W, 54); g.clip();
    g.fillStyle = '#c4dcef';
    for (const [x, y, rad] of puffs) { g.beginPath(); g.arc(x + 2, y + 3, rad, 0, Math.PI * 2); g.fill(); }
    const cg = g.createLinearGradient(0, 4, 0, 54);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(1, '#e4f0fa');
    g.fillStyle = cg;
    for (const [x, y, rad] of puffs) { g.beginPath(); g.arc(x - 1, y - 1, rad * 0.94, 0, Math.PI * 2); g.fill(); }
    g.restore();
    return { c, w: W, h: H };
  }

  // ---------- Небо ----------
  buildSky() {
    const w = this.w, H = this.area.y;
    const { c, g } = this.makeCanvas(w, H);
    const sky = g.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, '#4fa8ec');
    sky.addColorStop(0.55, '#9fd6fa');
    sky.addColorStop(1, '#e8f7ff');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, H);

    const sx = w * 0.14, sy = 30;
    const glow = g.createRadialGradient(sx, sy, 0, sx, sy, 110);
    glow.addColorStop(0, 'rgba(255,253,225,1)');
    glow.addColorStop(0.12, 'rgba(255,248,200,0.95)');
    glow.addColorStop(0.35, 'rgba(255,240,180,0.35)');
    glow.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, H);

    g.save();
    g.translate(sx, sy);
    for (let i = 0; i < 12; i++) {
      g.rotate(Math.PI * 2 / 12);
      const rg = g.createLinearGradient(0, 0, 120, 0);
      rg.addColorStop(0, 'rgba(255,250,210,0.25)');
      rg.addColorStop(1, 'rgba(255,250,210,0)');
      g.fillStyle = rg;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(120, -7); g.lineTo(120, 7); g.closePath(); g.fill();
    }
    g.restore();
    U.ellipse(g, sx, sy, 15, 15, '#fffdf0');
    return c;
  }

  // ---------- Холмы и земля под лесом ----------
  hill(g, base, amp, c1, c2, r, bottom) {
    const p1 = r() * 6, p2 = r() * 6, f1 = 0.009 + r() * 0.006, f2 = 0.025 + r() * 0.01;
    g.beginPath();
    g.moveTo(0, bottom);
    for (let x = 0; x <= this.w + 8; x += 6) {
      g.lineTo(x, base - Math.sin(x * f1 + p1) * amp - Math.sin(x * f2 + p2) * amp * 0.35);
    }
    g.lineTo(this.w + 8, bottom);
    g.closePath();
    const grd = g.createLinearGradient(0, base - amp * 1.4, 0, base + 40);
    grd.addColorStop(0, c1);
    grd.addColorStop(1, c2);
    g.fillStyle = grd;
    g.fill();
  }

  buildLand(r) {
    const w = this.w, a = this.area, H = a.y + 10;
    const { c, g } = this.makeCanvas(w, H);
    this.hill(g, this.skyH - 26, 16, '#a9d6a2', '#8cc488', r, H);
    this.hill(g, this.skyH - 8, 13, '#7fc06c', '#5ea54f', r, H);

    const fg = g.createLinearGradient(0, a.y - 90, 0, a.y);
    fg.addColorStop(0, 'rgba(74,149,60,0)');
    fg.addColorStop(0.35, '#4a953c');
    fg.addColorStop(1, '#3f8a34');
    g.fillStyle = fg;
    g.fillRect(0, a.y - 90, w, 100);

    g.lineWidth = 1.1;
    g.lineCap = 'round';
    for (let i = 0; i < w * 0.9; i++) {
      const x = r() * w, y = U.lerp(a.y - 70, a.y + 8, r()), len = 2 + r() * 4;
      g.strokeStyle = r() < 0.5 ? '#3a7d2f' : '#5aa845';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - len); g.stroke();
    }
    for (const t of this.trees) U.softShadow(g, t.x + 12 * t.s, t.y + 2, 42 * t.s, 11 * t.s, t.far ? 0.3 : 0.45);
    return c;
  }

  // ---------- Деревья ----------
  buildTrees(r) {
    this.trees = [];
    const w = this.w, a = this.area;
    for (let x = -20; x < w + 30; x += 34 + r() * 20) {
      this.trees.push(this.makeTree(r() < 0.55 ? 'pine' : 'oak', x, a.y - 72 + r() * 10, 0.55 + r() * 0.2, true, r));
    }
    for (let x = -15; x < w + 40; x += 58 + r() * 26) {
      this.trees.push(this.makeTree(r() < 0.3 ? 'pine' : 'oak', x, a.y - 34 - r() * 10, 0.85 + r() * 0.3, false, r));
    }
    this.trees.sort((p, q) => p.y - q.y);
  }

  makeTree(type, x, y, s, far, r) {
    const W = 130 * s, H = 150 * s;
    const { c, g } = this.makeCanvas(W, H);
    const ox = W / 2, oy = H - 8 * s;
    g.translate(ox, oy);
    g.scale(s, s);
    if (type === 'oak') this.drawOak(g, far, r);
    else this.drawPine(g, far, r);
    return { c, x, y, w: W, h: H, ox, oy, s, far, phase: r() * 6.28 };
  }

  // Крона из слоёв: тёмная основа, средний тон, освещённые верхушки, листья
  canopy(g, cl, P, r, k) {
    g.fillStyle = P[0];
    for (const [x, y, rad] of cl) { g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = P[1];
    for (const [x, y, rad] of cl) { g.beginPath(); g.arc(x - rad * 0.12, y - rad * 0.16, rad * 0.82, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = P[2];
    for (const [x, y, rad] of cl) { g.beginPath(); g.arc(x - rad * 0.3, y - rad * 0.36, rad * 0.48, 0, Math.PI * 2); g.fill(); }
    for (const [x, y, rad] of cl) {
      const n = Math.round(rad * 1.6 * k);
      for (let i = 0; i < n; i++) {
        const an = r() * Math.PI * 2, d = Math.sqrt(r()) * rad;
        const lx = x + Math.cos(an) * d, ly = y + Math.sin(an) * d;
        const lit = (-Math.cos(an) - Math.sin(an)) * (d / rad);
        g.fillStyle = lit > 0.5 ? P[3] : lit > 0 ? P[2] : lit > -0.5 ? P[1] : P[0];
        g.beginPath(); g.ellipse(lx, ly, 3.2, 1.8, an + r(), 0, Math.PI * 2); g.fill();
      }
    }
  }

  drawOak(g, far, r) {
    const P = TREE_PAL.oak[far ? 'far' : 'near'];
    const T = TRUNK[far ? 'far' : 'near'];

    const tg = g.createLinearGradient(-8, 0, 8, 0);
    tg.addColorStop(0, T[2]);
    tg.addColorStop(0.5, T[1]);
    tg.addColorStop(1, T[0]);
    g.fillStyle = tg;
    g.beginPath();
    g.moveTo(-14, 0);
    g.quadraticCurveTo(-7, -2, -6, -14);
    g.lineTo(-5, -55);
    g.lineTo(5, -55);
    g.lineTo(6, -14);
    g.quadraticCurveTo(7, -2, 14, 0);
    g.quadraticCurveTo(0, 3, -14, 0);
    g.closePath();
    g.fill();

    g.strokeStyle = T[1]; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-2, -42); g.quadraticCurveTo(-12, -52, -22, -64); g.stroke();
    g.beginPath(); g.moveTo(2, -46); g.quadraticCurveTo(12, -56, 22, -68); g.stroke();

    g.strokeStyle = 'rgba(30,15,5,0.4)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const bx = -3.5 + r() * 7, by = -6 - r() * 40;
      g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (r() - 0.5) * 2, by - 5 - r() * 6); g.stroke();
    }

    // Тень кроны на стволе (рисуется только поверх ствола)
    g.globalCompositeOperation = 'source-atop';
    const sg = g.createLinearGradient(0, -58, 0, -30);
    sg.addColorStop(0, 'rgba(10,30,5,0.65)');
    sg.addColorStop(1, 'rgba(10,30,5,0)');
    g.fillStyle = sg;
    g.fillRect(-30, -75, 60, 45);
    g.globalCompositeOperation = 'source-over';

    const base = [[0, -82, 30], [-26, -70, 22], [26, -70, 23], [-16, -98, 22], [16, -100, 21], [0, -112, 18], [-34, -86, 16], [34, -88, 16]];
    const cl = base.map(([cx, cy, cr]) => [cx + (r() - 0.5) * 6, cy + (r() - 0.5) * 6, cr * (0.9 + r() * 0.2)]);
    this.canopy(g, cl, P, r, far ? 0.6 : 1);

    if (!far && r() < 0.6) {
      for (let i = 0; i < 7; i++) {
        const [x, y, rad] = cl[(r() * cl.length) | 0];
        const an = r() * Math.PI * 2, d = r() * rad * 0.8;
        const ax = x + Math.cos(an) * d, ay = y + Math.sin(an) * d;
        g.fillStyle = '#7a1010'; g.beginPath(); g.arc(ax + 0.6, ay + 0.8, 3.4, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#e8322b'; g.beginPath(); g.arc(ax, ay, 3.2, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(ax - 1.1, ay - 1.1, 1, 0, Math.PI * 2); g.fill();
      }
    }
  }

  drawPine(g, far, r) {
    const P = TREE_PAL.pine[far ? 'far' : 'near'];
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

    // Ярусы хвои снизу вверх
    for (let i = 0; i < 5; i++) {
      const by = -24 - i * 20, ty = by - 36;
      const hw = 40 - i * 7 + (r() - 0.5) * 4;

      // Тень от верхнего яруса на нижний
      if (i > 0) U.softEllipse(g, 3, by + 3, hw * 0.95, 8, '10,30,15', 0.5);

      g.beginPath();
      g.moveTo(0, ty);
      g.quadraticCurveTo(hw * 0.3, by - 14, hw, by);
      for (let k = 1; k <= 5; k++) {
        const x = hw - 2 * hw * k / 5, xm = hw - 2 * hw * (k - 0.5) / 5;
        g.quadraticCurveTo(xm, by + 6, x, by);
      }
      g.quadraticCurveTo(-hw * 0.3, by - 14, 0, ty);
      g.closePath();
      const lg = g.createLinearGradient(-hw, ty, hw * 0.8, by);
      lg.addColorStop(0, P[3]);
      lg.addColorStop(0.35, P[2]);
      lg.addColorStop(0.7, P[1]);
      lg.addColorStop(1, P[0]);
      g.fillStyle = lg;
      g.fill();

      // Иголки
      g.save();
      g.clip();
      g.lineWidth = 1.2;
      g.lineCap = 'round';
      const cnt = Math.round(hw * (far ? 0.8 : 1.6));
      for (let k = 0; k < cnt; k++) {
        const v = 0.15 + r() * 0.85;
        const y = ty + v * (by - ty), half = hw * v;
        const x = (r() * 2 - 1) * half;
        g.strokeStyle = x < -half * 0.3 ? P[3] : x > half * 0.4 ? P[0] : P[2];
        const sd = x < 0 ? -1 : 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + sd * 2.5, y + 3); g.stroke();
      }
      g.restore();
    }
  }

  // ---------- Луг, пруд, кусты, забор ----------
  buildNear(r) {
    const w = this.w, h = this.h, a = this.area, p = this.pond;
    const { c, g } = this.makeCanvas(w, h);

    // Трава за забором
    const og = g.createLinearGradient(0, a.y - 10, 0, h);
    og.addColorStop(0, '#3f8a34');
    og.addColorStop(1, '#2f7329');
    g.fillStyle = og;
    g.fillRect(0, a.y - 10, w, h - a.y + 10);

    // Луг внутри забора
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    const mg = g.createRadialGradient(cx, cy * 0.9, 20, cx, cy, Math.max(a.w, a.h) * 0.75);
    mg.addColorStop(0, '#a2e46a');
    mg.addColorStop(0.6, '#7cc955');
    mg.addColorStop(1, '#5aa83f');
    g.fillStyle = mg;
    g.fillRect(a.x, a.y, a.w, a.h);

    g.save();
    g.beginPath(); g.rect(a.x, a.y, a.w, a.h); g.clip();

    // Тень от леса у верхнего забора
    const tg = g.createLinearGradient(0, a.y, 0, a.y + 60);
    tg.addColorStop(0, 'rgba(20,60,15,0.35)');
    tg.addColorStop(1, 'rgba(20,60,15,0)');
    g.fillStyle = tg;
    g.fillRect(a.x, a.y, a.w, 60);

    // Полосы газона
    g.fillStyle = 'rgba(255,255,255,0.045)';
    for (let i = a.x - a.h; i < a.x + a.w + a.h; i += 70) {
      g.beginPath();
      g.moveTo(i, a.y); g.lineTo(i + 35, a.y);
      g.lineTo(i + 35 + a.h * 0.4, a.y + a.h); g.lineTo(i + a.h * 0.4, a.y + a.h);
      g.closePath(); g.fill();
    }

    // Пятна света и тени
    for (let i = 0; i < 9; i++) {
      U.softEllipse(g, a.x + r() * a.w, a.y + r() * a.h, 50 + r() * 70, 25 + r() * 30,
        r() < 0.5 ? '255,255,210' : '30,80,20', 0.1 + r() * 0.06);
    }

    // Вытоптанная земля у будки
    U.softEllipse(g, this.house.x + 12, this.house.y + 8, 80, 26, '150,110,60', 0.45);
    U.softEllipse(g, this.house.x, this.house.y + 12, 40, 12, '120,85,45', 0.35);
    g.restore();

    const onPond = (x, y) => {
      const dx = (x - p.x) / (p.rx + 10), dy = (y - p.y) / (p.ry + 8);
      return dx * dx + dy * dy < 1;
    };
    const inside = (x, y) => x > a.x + 6 && x < a.x + a.w - 6 && y > a.y + 6 && y < a.y + a.h - 4;
    const free = (x, y) => inside(x, y) && !onPond(x, y) && !this.house.blocks(x, y);

    // Травинки
    const greens = ['#4c9638', '#64b443', '#7ccc52', '#3d8530', '#9ad968'];
    const darks = ['#2f7329', '#3d8530', '#4c9638'];
    g.lineCap = 'round';
    g.lineWidth = 1.2;
    const count = Math.floor(w * (h - a.y) / 55);
    for (let i = 0; i < count; i++) {
      const x = r() * w, y = a.y - 6 + r() * (h - a.y + 6), len = 3 + r() * 6;
      if (onPond(x, y)) continue;
      const list = inside(x, y) ? greens : darks;
      g.strokeStyle = list[(r() * list.length) | 0];
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + (r() - 0.5) * 2, y - len * 0.6, x + (r() - 0.5) * 5, y - len);
      g.stroke();
    }

    // Кочки травы
    const tufts = Math.floor(a.w * a.h / 2500);
    for (let i = 0; i < tufts; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h;
      if (free(x, y)) this.tuft(g, x, y, r);
    }

    // Клевер
    const clovers = Math.floor(a.w * a.h / 9000);
    for (let i = 0; i < clovers; i++) {
      const x0 = a.x + r() * a.w, y0 = a.y + r() * a.h;
      for (let k = 0; k < 5; k++) {
        const x = x0 + (r() - 0.5) * 24, y = y0 + (r() - 0.5) * 14;
        if (free(x, y)) this.clover(g, x, y, 2.2 + r());
      }
    }

    // Цветы растут группами
    const groups = Math.floor(a.w * a.h / 9000);
    for (let i = 0; i < groups; i++) {
      const kind = (r() * 5) | 0;
      const x0 = a.x + r() * a.w, y0 = a.y + r() * a.h;
      const n = 4 + ((r() * 6) | 0);
      for (let k = 0; k < n; k++) {
        const x = x0 + (r() - 0.5) * 40, y = y0 + (r() - 0.5) * 24;
        if (free(x, y)) this.flower(g, x, y, kind, 0.85 + r() * 0.3);
      }
    }

    // Камни
    for (let i = 0; i < 12; i++) {
      const x = a.x + r() * a.w, y = a.y + r() * a.h;
      if (!free(x, y)) continue;
      this.stone(g, x, y, 2.5 + r() * 3);
      if (r() < 0.4) this.stone(g, x + 6, y + 2, 1.5 + r() * 2);
    }

    // Мухоморы у боковых заборов
    for (let i = 0; i < 4; i++) {
      const left = i % 2 === 0;
      const x = left ? a.x + 12 + r() * 14 : a.x + a.w - 12 - r() * 14;
      const y = a.y + 40 + r() * (a.h - 80);
      if (!free(x, y)) continue;
      this.mushroom(g, x, y, 0.9 + r() * 0.3);
      if (r() < 0.6) this.mushroom(g, x + 7, y + 3, 0.6 + r() * 0.2);
    }

    this.drawPond(g, r);

    // Точки, где на воде мерцают блики
    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      const an = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.7;
      this.sparkles.push({ x: p.x + Math.cos(an) * d * p.rx, y: p.y + Math.sin(an) * d * p.ry, ph: r() * 6.28 });
    }

    // Кусты по бокам и снизу
    for (let y = a.y + 20; y < a.y + a.h; y += 50 + r() * 30) {
      this.bush(g, 8 + r() * 8, y, 0.6 + r() * 0.3, r);
      this.bush(g, w - 8 - r() * 8, y, 0.6 + r() * 0.3, r);
    }
    for (let x = 20; x < w; x += 60 + r() * 40) this.bush(g, x, h - 4 - r() * 8, 0.6 + r() * 0.3, r);

    // Забор: дальняя сторона, бока, ближняя
    this.fence(g, a.x, a.y, a.x + a.w, a.y);
    this.fence(g, a.x, a.y, a.x, a.y + a.h);
    this.fence(g, a.x + a.w, a.y, a.x + a.w, a.y + a.h);
    this.fence(g, a.x, a.y + a.h, a.x + a.w, a.y + a.h);

    return c;
  }

  drawPond(g, r) {
    const p = this.pond;

    // Илистый берег
    U.softShadow(g, p.x + 4, p.y + 6, p.rx + 18, p.ry + 12, 0.35);
    U.ellipse(g, p.x, p.y + 3, p.rx + 9, p.ry + 7, '#7a6a3c');
    U.ellipse(g, p.x, p.y + 1, p.rx + 6, p.ry + 5, '#a8925a');

    // Вода
    g.save();
    g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); g.clip();
    const wg = g.createRadialGradient(p.x + p.rx * 0.15, p.y + p.ry * 0.2, 2, p.x, p.y, p.rx);
    wg.addColorStop(0, '#1f6f8f');
    wg.addColorStop(0.6, '#2f95b5');
    wg.addColorStop(1, '#5cc3d6');
    g.fillStyle = wg;
    g.fillRect(p.x - p.rx, p.y - p.ry, p.rx * 2, p.ry * 2);
    U.softEllipse(g, p.x, p.y - p.ry, p.rx * 1.1, p.ry * 0.55, '10,40,50', 0.45);
    U.softEllipse(g, p.x - p.rx * 0.35, p.y - p.ry * 0.1, p.rx * 0.45, p.ry * 0.22, '255,255,255', 0.3);
    g.restore();

    // Светлая кромка у берега
    g.strokeStyle = 'rgba(255,255,255,0.4)';
    g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(p.x, p.y, p.rx - 1, p.ry - 1, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();

    // Камни на берегу
    this.stone(g, p.x - p.rx - 4, p.y + 4, 4);
    this.stone(g, p.x - p.rx + 6, p.y + p.ry + 2, 3);
    this.stone(g, p.x + p.rx * 0.3, p.y + p.ry + 5, 3.5);

    // Кувшинки
    this.lily(g, p.x - p.rx * 0.35, p.y + p.ry * 0.25, 9, true, r);
    this.lily(g, p.x + p.rx * 0.25, p.y - p.ry * 0.3, 7, false, r);
    this.lily(g, p.x + p.rx * 0.5, p.y + p.ry * 0.35, 6, false, r);

    // Камыши у дальнего края
    g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const bx = p.x + p.rx * 0.35 + i * 5 + r() * 3;
      const by = p.y - p.ry * 0.55 + r() * 4;
      const hgt = 26 + r() * 14, lean = (r() - 0.3) * 8;
      g.strokeStyle = '#6aa84f'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 6, by - hgt * 0.5, bx - 10 + lean, by - hgt * 0.7); g.stroke();
      g.strokeStyle = '#4f8a35'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + lean * 0.3, by - hgt * 0.6, bx + lean, by - hgt); g.stroke();
      if (i % 2 === 0) {
        const hx = bx + lean * 0.75, hy = by - hgt * 0.78;
        U.ellipse(g, hx, hy, 2.4, 6, '#6b3f1f', null, lean * 0.03);
        U.ellipse(g, hx - 0.8, hy - 1.5, 0.8, 3, 'rgba(255,220,180,0.4)', null, lean * 0.03);
      }
    }
  }

  lily(g, x, y, rad, flower, r) {
    U.ellipse(g, x + 1.5, y + 1.5, rad, rad * 0.55, 'rgba(10,40,50,0.35)');
    const a0 = r() * Math.PI * 2;
    g.beginPath();
    g.moveTo(x, y);
    g.ellipse(x, y, rad, rad * 0.55, 0, a0 + 0.35, a0 + Math.PI * 2 - 0.05);
    g.closePath();
    const lg = g.createLinearGradient(x - rad, y - rad, x + rad, y + rad);
    lg.addColorStop(0, '#8ad466');
    lg.addColorStop(1, '#3d8a35');
    g.fillStyle = lg;
    g.fill();
    g.strokeStyle = '#2f6e2a'; g.lineWidth = 0.8; g.stroke();
    g.strokeStyle = 'rgba(40,100,40,0.6)';
    for (let k = 0; k < 4; k++) {
      const an = a0 + 1 + k * 1.3;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * rad * 0.8, y + Math.sin(an) * rad * 0.45); g.stroke();
    }
    if (flower) {
      this.petals(g, x, y - 2, 8, 5, 2, '#ffc9de', '#e64980');
      this.petals(g, x, y - 3, 6, 3, 1.4, '#ffe3ee', null);
      U.ellipse(g, x, y - 3, 1.6, 1.3, '#ffd43b');
    }
  }

  petals(g, x, y, n, len, wid, col, edge) {
    g.lineWidth = 0.6;
    for (let i = 0; i < n; i++) {
      g.save();
      g.translate(x, y);
      g.rotate(i / n * Math.PI * 2);
      U.ellipse(g, len * 0.55, 0, len * 0.6, wid, col, edge);
      g.restore();
    }
  }

  flower(g, x, y, kind, s) {
    U.ellipse(g, x + 1, y + 4.5 * s, 3 * s, 1.2 * s, 'rgba(20,45,10,0.25)');
    g.strokeStyle = '#3d8530'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y + 4 * s); g.lineTo(x, y); g.stroke();
    if (kind === 0) {            // ромашка
      this.petals(g, x, y, 8, 4 * s, 1.5 * s, '#ffffff', '#d0d0d0');
      U.ellipse(g, x, y, 1.8 * s, 1.6 * s, '#f5b301');
      U.ellipse(g, x - 0.5, y - 0.5, 0.7 * s, 0.6 * s, '#ffe066');
    } else if (kind === 1) {     // лютик
      this.petals(g, x, y, 5, 3.4 * s, 1.9 * s, '#ffd43b', '#e8a800');
      U.ellipse(g, x, y, 1.3 * s, 1.2 * s, '#f08c00');
      U.ellipse(g, x - 1.2 * s, y - 1.2 * s, 0.8 * s, 0.5 * s, 'rgba(255,255,255,0.8)');
    } else if (kind === 2) {     // розовый
      this.petals(g, x, y, 5, 3.6 * s, 2 * s, '#ff8fab', '#d6336c');
      this.petals(g, x, y, 5, 1.8 * s, 1 * s, '#ffd1dc', null);
      U.ellipse(g, x, y, 1 * s, 1 * s, '#fff3bf');
    } else if (kind === 3) {     // незабудка
      this.petals(g, x, y, 5, 3 * s, 1.7 * s, '#74c0fc', '#1c7ed6');
      U.ellipse(g, x, y, 1 * s, 1 * s, '#fff3bf');
    } else {                     // колокольчик
      g.fillStyle = '#9775fa';
      g.beginPath();
      g.moveTo(x - 3 * s, y + 1 * s);
      g.quadraticCurveTo(x - 3 * s, y - 5 * s, x, y - 5 * s);
      g.quadraticCurveTo(x + 3 * s, y - 5 * s, x + 3 * s, y + 1 * s);
      g.quadraticCurveTo(x, y - 0.5 * s, x - 3 * s, y + 1 * s);
      g.fill();
      U.ellipse(g, x - 1.2 * s, y - 2.5 * s, 0.8 * s, 1.6 * s, 'rgba(255,255,255,0.45)');
    }
  }

  tuft(g, x, y, r) {
    U.softShadow(g, x + 1, y, 7, 2.5, 0.3);
    const n = 5 + ((r() * 4) | 0);
    g.lineWidth = 1.6;
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const an = -Math.PI / 2 + (t - 0.5) * 1.4 + (r() - 0.5) * 0.2;
      const len = 6 + r() * 6;
      g.strokeStyle = t < 0.4 ? '#b5ea7a' : t < 0.7 ? '#6cbf47' : '#4f9a3a';
      const bx = x + (t - 0.5) * 4;
      g.beginPath();
      g.moveTo(bx, y);
      g.quadraticCurveTo(bx + Math.cos(an) * len * 0.3, y + Math.sin(an) * len * 0.6, bx + Math.cos(an) * len, y + Math.sin(an) * len);
      g.stroke();
    }
  }

  clover(g, x, y, s) {
    for (let k = 0; k < 3; k++) {
      const an = -Math.PI / 2 + k * 2.094;
      const lx = x + Math.cos(an) * s, ly = y + Math.sin(an) * s * 0.8;
      U.ellipse(g, lx, ly, s, s * 0.8, '#3f8f34');
      U.ellipse(g, lx - s * 0.25, ly - s * 0.25, s * 0.45, s * 0.35, '#6cbf47');
    }
  }

  stone(g, x, y, s) {
    U.softShadow(g, x + 1.5, y + 1.5, s * 1.6, s * 0.7, 0.45);
    const sg = g.createRadialGradient(x - s * 0.4, y - s * 0.5, 0.5, x, y, s * 1.3);
    sg.addColorStop(0, '#eeeae2');
    sg.addColorStop(0.5, '#b9b3a8');
    sg.addColorStop(1, '#7f796f');
    U.ellipse(g, x, y, s * 1.2, s * 0.8, sg);
    U.ellipse(g, x - s * 0.4, y - s * 0.35, s * 0.35, s * 0.18, 'rgba(255,255,255,0.8)');
  }

  mushroom(g, x, y, s) {
    U.softShadow(g, x + 2, y + 1, 7 * s, 2.5 * s, 0.4);
    g.fillStyle = '#f8f1e0';
    U.rrect(g, x - 2 * s, y - 7 * s, 4 * s, 7 * s, 1.5 * s); g.fill();
    g.fillStyle = 'rgba(150,120,80,0.3)';
    g.fillRect(x + 0.5 * s, y - 6 * s, 1.5 * s, 6 * s);
    const cg = g.createRadialGradient(x - 2 * s, y - 10 * s, 0.5, x, y - 8 * s, 7 * s);
    cg.addColorStop(0, '#ff7b6b');
    cg.addColorStop(1, '#c92a2a');
    g.fillStyle = cg;
    g.beginPath(); g.ellipse(x, y - 7 * s, 6.5 * s, 5 * s, 0, Math.PI, 0); g.closePath(); g.fill();
    [[-3, -9, 1.1], [1, -10.5, 0.9], [3.5, -8, 0.8], [-0.5, -8, 0.6]]
      .forEach(([dx, dy, rr]) => U.ellipse(g, x + dx * s, y + dy * s, rr * s, rr * s * 0.8, '#ffffff'));
  }

  bush(g, x, y, s, r) {
    U.softShadow(g, x + 4 * s, y + 2, 26 * s, 8 * s, 0.45);
    const cl = [[-11, -9, 12], [11, -9, 12], [0, -17, 14], [-4, -6, 10]]
      .map(([bx, by, br]) => [x + bx * s, y + by * s, br * s * (0.9 + r() * 0.2)]);
    this.canopy(g, cl, TREE_PAL.oak.near, r, 0.8);
    if (r() < 0.5) {
      for (let i = 0; i < 4; i++) {
        const fx = x + (r() - 0.5) * 28 * s, fy = y - (5 + r() * 18) * s;
        U.ellipse(g, fx, fy, 2.2, 2.2, '#ffa8c5', '#e64980');
        U.ellipse(g, fx, fy, 0.8, 0.8, '#fff3bf');
      }
    }
  }

  fence(g, x1, y1, x2, y2) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / 36));
    const H = 24;
    g.lineCap = 'round';

    // Тень на траве
    g.strokeStyle = 'rgba(20,45,10,0.25)'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x1 + 5, y1 + 4); g.lineTo(x2 + 5, y2 + 4); g.stroke();

    // Перекладины: тёмный низ, основной цвет, блик сверху
    [H - 7, H - 17].forEach(off => {
      g.strokeStyle = '#5e3618'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(x1, y1 - off + 1.5); g.lineTo(x2, y2 - off + 1.5); g.stroke();
      g.strokeStyle = '#b07a45'; g.lineWidth = 4.5;
      g.beginPath(); g.moveTo(x1, y1 - off); g.lineTo(x2, y2 - off); g.stroke();
      g.strokeStyle = '#e6b67a'; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(x1, y1 - off - 1.5); g.lineTo(x2, y2 - off - 1.5); g.stroke();
    });

    // Столбики
    for (let i = 0; i <= n; i++) {
      const px = x1 + (x2 - x1) * i / n, py = y1 + (y2 - y1) * i / n;
      U.softShadow(g, px + 3, py + 1, 8, 3, 0.5);
      const pg = g.createLinearGradient(px - 4.5, 0, px + 4.5, 0);
      pg.addColorStop(0, '#d39a5c');
      pg.addColorStop(0.45, '#a46c38');
      pg.addColorStop(1, '#6e4220');
      g.fillStyle = pg;
      U.rrect(g, px - 4.5, py - H, 9, H + 1, 2); g.fill();
      g.strokeStyle = 'rgba(50,25,8,0.6)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(60,30,10,0.35)'; g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(px - 1, py - H + 6); g.lineTo(px - 0.5, py - 4); g.stroke();
      U.ellipse(g, px, py - H, 4.5, 2, '#e3b077', 'rgba(50,25,8,0.5)');
    }
  }

  buildLight() {
    const w = this.w, h = this.h;
    const { c, g } = this.makeCanvas(w, h);
    const sun = g.createRadialGradient(w * 0.14, 30, 0, w * 0.14, 30, Math.max(w, h) * 0.9);
    sun.addColorStop(0, 'rgba(255,240,190,0.22)');
    sun.addColorStop(0.5, 'rgba(255,240,190,0.06)');
    sun.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);
    const v = g.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.45, w / 2, h * 0.55, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(10,30,10,0)');
    v.addColorStop(1, 'rgba(10,30,10,0.38)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
    return c;
  }

  buildForegroundGrass(r) {
    this.grass = [];
    const cols = ['#2f7a2a', '#3f8f34', '#55a83f', '#6fbf4c'];
    for (let x = -5; x < this.w + 5; x += 2.5 + r() * 3) {
      this.grass.push({ x, y: this.h + 2, len: 10 + r() * 16, c: cols[(r() * cols.length) | 0], lean: (r() - 0.5) * 6 });
    }
  }

  // ---------- Анимация ----------
  update(dt) {
    this.t += dt;
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > this.w + 20) c.x = -140 * c.s;
    }
    for (const c of this.shadows) {
      c.x += c.speed * dt;
      if (c.x - c.r * 2 > this.w) { c.x = -c.r * 2; c.y = U.rand(this.area.y, this.h); }
    }
    for (const b of this.butterflies) b.update(dt, this);
    for (const m of this.motes) {
      m.y -= m.sp * dt;
      m.x += Math.sin(this.t * 0.7 + m.ph) * 8 * dt;
      if (m.y < this.area.y - 40) { m.y = this.h + 5; m.x = U.rand(0, this.w); }
    }

    // Круги на воде
    this.rippleTimer -= dt;
    if (this.rippleTimer <= 0) {
      this.rippleTimer = U.rand(1.5, 3.5);
      const p = this.pond, an = U.rand(0, Math.PI * 2), d = Math.sqrt(Math.random()) * 0.6;
      this.ripples.push({ x: p.x + Math.cos(an) * d * p.rx, y: p.y + Math.sin(an) * d * p.ry, t: 0 });
    }
    for (const rp of this.ripples) rp.t += dt;
    this.ripples = this.ripples.filter(rp => rp.t < 2);
  }

  // Всё, что под собаками: небо, облака, лес, луг, вода
  drawBack(ctx) {
    const w = this.w, a = this.area;
    ctx.drawImage(this.sky, 0, 0, w, a.y);
    for (const c of this.clouds) {
      const sp = this.cloudSprites[c.k];
      ctx.drawImage(sp.c, c.x, c.y, sp.w * c.s, sp.h * c.s);
    }
    ctx.drawImage(this.land, 0, 0, w, a.y + 10);
    for (const t of this.trees) {
      const sway = Math.sin(this.t * (t.far ? 0.8 : 1.1) + t.phase) * (t.far ? 0.008 : 0.015);
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(sway);
      ctx.drawImage(t.c, -t.ox, -t.oy, t.w, t.h);
      ctx.restore();
    }
    ctx.drawImage(this.near, 0, 0, w, this.h);
    this.drawWater(ctx);
  }

  drawWater(ctx) {
    const p = this.pond;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const yy = p.y - p.ry * 0.5 + i * p.ry * 0.32;
      const off = Math.sin(this.t * 0.8 + i * 1.7) * p.rx * 0.25;
      ctx.beginPath();
      ctx.moveTo(p.x - p.rx * 0.5 + off, yy);
      ctx.quadraticCurveTo(p.x + off, yy - 3, p.x + p.rx * 0.4 + off, yy);
      ctx.stroke();
    }
    ctx.lineWidth = 1.2;
    for (const rp of this.ripples) {
      const k = rp.t / 2, rad = 4 + k * 24;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - k)})`;
      ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rad, rad * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    }
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

  // Всё, что над собаками: тени облаков, бабочки, пыльца, трава спереди, свет
  drawOverlay(ctx) {
    for (const c of this.shadows) {
      U.softEllipse(ctx, c.x, c.y, c.r * 1.6, c.r, '20,60,20', 0.1);
    }
    for (const b of this.butterflies) b.draw(ctx);

    for (const m of this.motes) {
      const al = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(this.t * 2 + m.ph));
      U.ellipse(ctx, m.x, m.y, 3.5, 3.5, `rgba(255,250,215,${al * 0.25})`);
      U.ellipse(ctx, m.x, m.y, 1.3, 1.3, `rgba(255,250,215,${al})`);
    }

    ctx.lineCap = 'round';
    ctx.lineWidth = 2.4;
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

