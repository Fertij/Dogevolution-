// Главный файл: игровой цикл, монеты, частицы, перетаскивание и слияние собак
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const coinsEl = document.getElementById('coins');
const coinsBox = document.getElementById('coinsBox');
const coinIcon = document.getElementById('coinIcon');
const toastEl = document.getElementById('toast');

class Coin {
  constructor(x, y, value) {
    this.x = x; this.y = y; this.value = value;
    this.vx = U.rand(-50, 50);
    this.vy = U.rand(-220, -170);
    this.groundY = y + U.rand(30, 45);
    this.phase = 'pop';
    this.t = 0;
    this.spin = U.rand(0, 6);
    this.done = false;
  }

  update(dt, game) {
    this.t += dt;
    this.spin += dt * 8;
    if (this.phase === 'pop') {
      this.vy += 600 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.y > this.groundY) { this.y = this.groundY; this.vy *= -0.4; this.vx *= 0.6; }
      if (this.t > 1.1) { this.phase = 'fly'; this.t = 0; this.sx = this.x; this.sy = this.y; }
    } else {
      const k = Math.min(1, this.t / 0.6), e = k * k;
      this.x = U.lerp(this.sx, game.coinTarget.x, e);
      this.y = U.lerp(this.sy, game.coinTarget.y, e);
      if (k >= 1) {
        this.done = true;
        game.addMoney(this.value);
        game.sparks(game.coinTarget.x, game.coinTarget.y, 6);
      }
    }
  }

  draw(ctx) {
    if (this.phase === 'pop') U.softShadow(ctx, this.x, this.groundY + 2, 8, 2.5, 0.4);
    const c = Math.cos(this.spin);
    const w = Math.max(1.2, Math.abs(c) * 9);
    const e = Math.sin(this.spin) * 2;

    U.ellipse(ctx, this.x + e, this.y, w, 9, '#b87a00');
    ctx.fillStyle = '#b87a00';
    ctx.fillRect(Math.min(this.x, this.x + e), this.y - 9, Math.abs(e), 18);

    const fg = ctx.createLinearGradient(this.x - w, this.y - 9, this.x + w, this.y + 9);
    fg.addColorStop(0, '#fff3a0');
    fg.addColorStop(0.5, '#f5b301');
    fg.addColorStop(1, '#d98e00');
    ctx.lineWidth = 1.2;
    U.ellipse(ctx, this.x, this.y, w, 9, fg, '#a86b00');
    ctx.strokeStyle = 'rgba(168,107,0,0.6)';
    ctx.beginPath(); ctx.ellipse(this.x, this.y, w * 0.65, 6.2, 0, 0, Math.PI * 2); ctx.stroke();
    U.ellipse(ctx, this.x - w * 0.35, this.y - 3.5, w * 0.2, 2, 'rgba(255,255,255,0.85)');
  }
}

class Particle {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.life = 0;
    if (type === 'spark') {
      const an = U.rand(0, Math.PI * 2), sp = U.rand(60, 140);
      this.vx = Math.cos(an) * sp;
      this.vy = Math.sin(an) * sp;
      this.max = 0.5;
      this.size = U.rand(3, 5);
    } else if (type === 'ring') {
      this.vx = 0; this.vy = 0;
      this.max = 0.6;
      this.size = 1;
    } else {
      this.vx = U.rand(-25, 25);
      this.vy = type === 'heart' ? U.rand(-70, -45) : U.rand(-60, -20);
      this.max = type === 'heart' ? 1.2 : 0.7;
      this.size = type === 'heart' ? U.rand(1, 1.4) : U.rand(3, 6);
    }
  }

  get done() { return this.life >= this.max; }

  update(dt) {
    this.life += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.type !== 'heart') { this.vx *= 0.92; this.vy *= 0.92; }
  }

  draw(ctx) {
    const k = this.life / this.max;
    ctx.globalAlpha = 1 - k;
    if (this.type === 'heart') {
      U.heart(ctx, this.x + 1, this.y + 1.5, this.size * (1 + this.life * 0.3), 'rgba(120,0,30,0.3)');
      U.heart(ctx, this.x, this.y, this.size * (1 + this.life * 0.3), '#ff4d6d');
    } else if (this.type === 'spark') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.life * 6);
      ctx.fillStyle = '#fff3a0';
      const z = this.size * (1 - k * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? z * 0.35 : z, an = i * Math.PI / 4;
        ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'ring') {
      const rad = 10 + k * 60;
      ctx.strokeStyle = '#fff3a0';
      ctx.lineWidth = 4 * (1 - k) + 1;
      ctx.beginPath(); ctx.ellipse(this.x, this.y, rad, rad * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    } else {
      U.ellipse(ctx, this.x, this.y, this.size * (1 + this.life), this.size * 0.7 * (1 + this.life), '#efe4c0');
    }
    ctx.globalAlpha = 1;
  }
}

const game = {
  w: 0, h: 0, dpr: 1,
  field: new Field(),
  dogs: [],
  boxes: [],
  coins: [],
  particles: [],
  coinTarget: { x: 0, y: 0 },
  money: Number(localStorage.getItem('dogevo_money')) || 0,
  best: Number(localStorage.getItem('dogevo_best')) || 1,
  drag: null,
  mergeTarget: null,

  spawnCoin(x, y, value) { this.coins.push(new Coin(x, y, value)); },

  addMoney(v) {
    this.money += v;
    this.updateMoney(true);
  },

  updateMoney(bump) {
    coinsEl.textContent = this.money;
    localStorage.setItem('dogevo_money', this.money);
    if (bump) {
      coinsBox.classList.remove('bump');
      void coinsBox.offsetWidth;          // перезапуск анимации
      coinsBox.classList.add('bump');
    }
    Shop.refresh(this);
  },

  hearts(x, y, n) {
    for (let i = 0; i < n; i++) this.particles.push(new Particle(x + U.rand(-12, 12), y, 'heart'));
  },

  dust(x, y, n) {
    for (let i = 0; i < n; i++) this.particles.push(new Particle(x + U.rand(-20, 20), y - U.rand(0, 8), 'dust'));
  },

  sparks(x, y, n) {
    for (let i = 0; i < n; i++) this.particles.push(new Particle(x, y, 'spark'));
  },

  ring(x, y) { this.particles.push(new Particle(x, y, 'ring')); },

  addDog(dog) {
    this.dogs.push(dog);
    this.save();
    Shop.refresh(this);
  },

  // Позиции хранятся в долях от размера луга, чтобы пережить поворот экрана.
  // Неоткрытые коробки сохраняются как щенки, чтобы покупка не пропала
  save() {
    const a = this.field.area;
    const list = [
      ...this.dogs.map(d => ({ l: d.level, x: d.x, y: d.y })),
      ...this.boxes.filter(b => !b.done).map(b => ({ l: 1, x: b.x, y: b.y }))
    ].map(d => ({ l: d.l, x: (d.x - a.x) / a.w, y: (d.y - a.y) / a.h }));
    localStorage.setItem('dogevo_dogs', JSON.stringify(list));
  },

  toast(title, sub) {
    toastEl.replaceChildren(document.createTextNode(title));
    if (sub) {
      const s = document.createElement('small');
      s.textContent = sub;
      toastEl.appendChild(s);
    }
    toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }
};

function resize() {
  game.dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.w = window.innerWidth;
  game.h = window.innerHeight;
  canvas.width = Math.round(game.w * game.dpr);
  canvas.height = Math.round(game.h * game.dpr);
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  game.field.resize(game.w, game.h, game.dpr);

  const a = game.field.area;
  for (const d of game.dogs) {
    d.x = U.clamp(d.x, a.x + 34, a.x + a.w - 34);
    d.y = U.clamp(d.y, a.y + 44, a.y + a.h - 34);
    if (game.field.blocked(d.x, d.y)) {
      const p = game.field.randomPoint();
      d.x = p.x; d.y = p.y;
    }
    d.state = 'idle';
  }
  const r = coinIcon.getBoundingClientRect();
  game.coinTarget = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
window.addEventListener('resize', resize);
resize();

// Загрузка сохранённых собак
function loadDogs() {
  const a = game.field.area;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('dogevo_dogs')) || []; } catch (e) { list = []; }
  for (const d of list) {
    if (!DOG_LEVELS[d.l]) continue;
    let x = a.x + d.x * a.w, y = a.y + d.y * a.h;
    if (!isFinite(x) || !isFinite(y) || game.field.blocked(x, y)) {
      const p = game.field.randomPoint(); x = p.x; y = p.y;
    }
    x = U.clamp(x, a.x + 34, a.x + a.w - 34);
    y = U.clamp(y, a.y + 44, a.y + a.h - 34);
    game.dogs.push(new Dog(x, y, d.l));
  }
  if (!game.dogs.length) {
    let p = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    if (game.field.blocked(p.x, p.y)) p = game.field.randomPoint();
    game.dogs.push(new Dog(p.x, p.y, 1));
    game.dust(p.x, p.y, 12);
  }
}
loadDogs();
Shop.init(game);
game.updateMoney(false);

// ---------- Слияние ----------
function findMergeTarget(dog) {
  if (!DOG_LEVELS[dog.level + 1]) return null;     // это последняя порода
  let best = null, bd = 55;
  for (const d of game.dogs) {
    if (d === dog || d.level !== dog.level) continue;
    const dist = Math.hypot(d.x - dog.x, d.y - dog.y);
    if (dist < bd) { bd = dist; best = d; }
  }
  return best;
}

function merge(a, b) {
  const lvl = a.level + 1;
  game.dogs = game.dogs.filter(d => d !== a && d !== b);
  const nd = new Dog(b.x, b.y, lvl);
  nd.happy = 2;
  nd.labelT = 3;
  game.dogs.push(nd);
  game.ring(b.x, b.y);
  game.sparks(b.x, b.y - 30, 14);
  game.hearts(b.x, b.y - 60, 5);
  game.dust(b.x, b.y, 10);
  if (lvl > game.best) {
    game.best = lvl;
    localStorage.setItem('dogevo_best', lvl);
    game.toast('Новая порода!', DOG_LEVELS[lvl].name);
  }
  game.save();
  Shop.refresh(game);
}

function nearestFree(x, y) {
  let best = game.field.randomPoint(), bd = Infinity;
  for (let i = 0; i < 40; i++) {
    const p = game.field.randomPoint();
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

// ---------- Касания: короткое нажатие гладит, перетаскивание сливает ----------
canvas.addEventListener('pointerdown', (e) => {
  if (game.drag) return;
  const x = e.clientX, y = e.clientY;

  for (const b of game.boxes) {
    if (b.state === 'wait' && b.hit(x, y)) { b.open(game); return; }
  }

  const sorted = [...game.dogs].sort((p, q) => q.y - p.y);   // ближние проверяем первыми
  const d = sorted.find(dog => dog.hit(x, y));
  if (!d) return;
  canvas.setPointerCapture(e.pointerId);
  game.drag = { dog: d, id: e.pointerId, ox: d.x - x, oy: d.y - y, sx: x, sy: y, moved: false };
});

canvas.addEventListener('pointermove', (e) => {
  const g = game.drag;
  if (!g || e.pointerId !== g.id) return;
  if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 10) {
    g.moved = true;
    g.dog.held = true;
    g.dog.state = 'idle';
  }
  if (!g.moved) return;

  const a = game.field.area;
  const nx = U.clamp(e.clientX + g.ox, a.x + 20, a.x + a.w - 20);
  const ny = U.clamp(e.clientY + g.oy, a.y + 30, a.y + a.h - 10);
  if (Math.abs(nx - g.dog.x) > 1) g.dog.dir = nx > g.dog.x ? 1 : -1;
  g.dog.x = nx;
  g.dog.y = ny;
  game.mergeTarget = findMergeTarget(g.dog);
});

function endDrag(e) {
  const g = game.drag;
  if (!g || e.pointerId !== g.id) return;
  game.drag = null;
  const d = g.dog;

  if (!g.moved) { d.pet(game); return; }

  d.held = false;
  game.mergeTarget = null;
  const target = findMergeTarget(d);
  if (target) { merge(d, target); return; }

  // Отпустили на будку или пруд: собака переносится на ближайшее свободное место
  if (game.field.blocked(d.x, d.y)) {
    const p = nearestFree(d.x, d.y);
    d.x = p.x; d.y = p.y;
  }
  d.squash = 0.22;
  d.state = 'idle';
  d.timer = U.rand(1, 2);
  game.dust(d.x, d.y, 6);
  game.save();
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

document.addEventListener('visibilitychange', () => { if (document.hidden) game.save(); });

// ---------- Игровой цикл ----------
function sortKey(o) {
  if (o.held) return 2e6;                 // собака в руке поверх всех
  if (o.h > 0) return 1e6 + o.y;          // падающая коробка поверх всех
  return o.y;
}

function drawMergeHint(now) {
  const t = game.mergeTarget;
  if (!t) return;
  const p = 1 + Math.sin(now / 120) * 0.08;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,230,90,0.95)';
  ctx.shadowColor = '#ffd43b';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(t.x, t.y, 36 * p * t.size, 12 * p * t.size, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

let last = performance.now();
let saveTimer = 5;
function loop(now) {
  // dt не бывает отрицательным: из-за этого в прошлой версии пропадала собака
  const dt = U.clamp((now - last) / 1000, 0, 0.05);
  last = now;

  game.field.update(dt);
  game.dogs.forEach(d => d.update(dt, game));
  game.boxes.forEach(b => b.update(dt, game));
  game.coins.forEach(c => c.update(dt, game));
  game.particles.forEach(p => p.update(dt));
  game.boxes = game.boxes.filter(b => !b.done);
  game.coins = game.coins.filter(c => !c.done);
  game.particles = game.particles.filter(p => !p.done);

  saveTimer -= dt;
  if (saveTimer <= 0) { saveTimer = 5; game.save(); }

  game.field.drawBack(ctx);
  drawMergeHint(now);

  [game.field.house, ...game.dogs, ...game.boxes]
    .sort((p, q) => sortKey(p) - sortKey(q))
    .forEach(o => o.draw(ctx));

  game.field.drawOverlay(ctx);
  game.dogs.forEach(d => d.drawLabel(ctx));
  game.coins.forEach(c => c.draw(ctx));
  game.particles.forEach(p => p.draw(ctx));

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
