// Главное меню: подиум с лучшей собакой, статистика, коллекция пород и новая игра
const MAX_BREEDS = 15;  // все породы во всех мирах


const FLOWER_COLORS = [['#ffffff', '#f5b301'], ['#ffd43b', '#f08c00'], ['#ff8fab', '#fff3bf'], ['#74c0fc', '#fff3bf']];

const Menu = {
  init(game) {
    this.game = game;
    const $ = id => document.getElementById(id);
    this.el = $('menu');
    this.bg = $('menuBg');
    this.canvas = $('menuDog');
    this.ctx = this.canvas.getContext('2d');
    this.coinsEl = $('menuCoins');
    this.breedsEl = $('menuBreeds');
    this.bestEl = $('bestName');
    this.ribbon = $('ribbon');
    this.coll = $('collection');
    this.grid = $('collectionGrid');
    this.confirmEl = $('confirm');
    this.jumpTimer = 2;
    this.sparks = [];
    this.sparkTimer = 0;
    this.cw = 0;
    this.ch = 0;

    // Обработчик вешается, только если кнопка есть в index.html
    const on = (id, fn) => { const b = $(id); if (b) b.addEventListener('click', fn); };
    on('playBtn', () => this.hide());
    on('breedsBtn', () => this.openCollection());
    on('closeCollection', () => this.closeCollection());
    on('homeBtn', () => this.show());
    on('restartBtn', () => this.confirmEl.classList.add('show'));
    on('cancelRestart', () => this.confirmEl.classList.remove('show'));
    on('okRestart', () => { this.confirmEl.classList.remove('show'); this.resetGame(); });

    this.coll.addEventListener('click', e => { if (e.target === this.coll) this.closeCollection(); });
    this.confirmEl.addEventListener('click', e => { if (e.target === this.confirmEl) this.confirmEl.classList.remove('show'); });
    this.canvas.addEventListener('pointerdown', () => this.petDog());
    window.addEventListener('resize', () => { if (this.visible) this.needSnap = true; });

    this.makeDecor();
    this.show();
  },

  // Самая старшая порода, которую открыл игрок
  best() {
    return Math.max(this.game.best, ...this.game.dogs.map(d => d.level));
  },

  show() {
    const best = this.best();
    this.coinsEl.textContent = this.game.money;
    this.breedsEl.textContent = `${best}/${MAX_BREEDS}`;
    this.bestEl.textContent = `${DOG_LEVELS[best].name} · ур. ${best}`;
    this.ribbon.textContent = best >= MAX_BREEDS ? 'Все породы собраны!' : 'Собери все породы!';
    if (!this.dog || this.dog.level !== best) this.dog = new Dog(0, 0, best);
    this.dog.spawnT = 0;   // собака заново "выпрыгивает" на подиум

    this.el.classList.remove('hidden');
    this.visible = true;
    this.needSnap = true;  // фон снимается в следующем кадре, когда игра уже нарисована
    this.game.save();
    this.last = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  },

  hide() {
    this.el.classList.add('hidden');
    this.visible = false;
    this.closeCollection();
  },

  // Размытый снимок игры вместо backdrop-filter
  snapshot() {
    const bg = this.bg, src = document.getElementById('game');
    const k = 0.25;   // маленький снимок, растянутый на экран, сам выглядит размытым
    bg.width = Math.max(1, Math.round(window.innerWidth * k));
    bg.height = Math.max(1, Math.round(window.innerHeight * k));
    const c = bg.getContext('2d');
    c.filter = 'blur(2px)';
    c.drawImage(src, 0, 0, bg.width, bg.height);
    c.filter = 'none';

    const W = bg.width, H = bg.height;
    const shade = c.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(25,70,30,0.35)');
    shade.addColorStop(1, 'rgba(10,35,15,0.8)');
    c.fillStyle = shade;
    c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W / 2, H * 0.26, 0, W / 2, H * 0.26, W * 0.9);
    glow.addColorStop(0, 'rgba(255,232,150,0.45)');
    glow.addColorStop(1, 'rgba(255,232,150,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, W, H);
  },

  // Полный сброс прогресса без перезагрузки страницы
  resetGame() {
    const g = this.game;
    ['dogevo_money', 'dogevo_bought', 'dogevo_dogs', 'dogevo_best', 'dogevo_hint']
      .forEach(k => localStorage.removeItem(k));

    g.dogs = [];
    g.boxes = [];
    g.coins = [];
    g.particles = [];
    g.drag = null;
    g.mergeTarget = null;
    g.money = 0;
    g.best = 1;
    Shop.bought = 0;

    const a = g.field.area;
    let p = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    if (g.field.blocked(p.x, p.y)) p = g.field.randomPoint();
    g.dogs.push(new Dog(p.x, p.y, 1));

    g.updateMoney(false);
    g.save();
    this.dog = null;
    this.show();
  },

  petDog() {
    const d = this.dog;
    if (!d || d.jump > 0) return;
    d.jump = 1;
    d.happy = 1.5;
  },

  // clientWidth не зависит от анимации появления, поэтому собака не размывается
  sizeCanvas() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.cw = this.canvas.clientWidth;
    this.ch = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.cw * this.dpr);
    this.canvas.height = Math.round(this.ch * this.dpr);
  },

  // Травинки и цветы на подиуме: одинаковые при каждом запуске
  makeDecor() {
    const r = U.seeded(42);
    const greens = ['#4f9a3a', '#6cbf47', '#8fd65e'];
    this.blades = [];
    for (let i = 0; i < 34; i++) {
      this.blades.push({
        a: Math.PI * (0.02 + 0.96 * i / 33) + (r() - 0.5) * 0.04,
        len: 4 + r() * 5,
        lean: (r() - 0.5) * 3,
        c: greens[(r() * 3) | 0]
      });
    }
    this.flowers = [];
    for (let i = 0; i < 9; i++) {
      let a;
      if (i < 4) a = Math.PI * (1.12 + r() * 0.76);
      else a = Math.PI * (r() < 0.5 ? 0.08 + r() * 0.22 : 0.7 + r() * 0.22);
      this.flowers.push({ a, d: 0.68 + r() * 0.2, k: (r() * FLOWER_COLORS.length) | 0, s: 0.8 + r() * 0.4 });
    }
  },

  layout() {
    const w = this.cw, h = this.ch;
    const pr = Math.min(w * 0.34, 100), ry = pr * 0.22;
    const t1 = 11;
    const R2 = pr * 1.16, ry2 = R2 * 0.22, t2 = 12;
    const py = h - (t1 + t2 + ry2 + 8);
    return { cx: w / 2, pr, ry, t1, R2, ry2, t2, py };
  },

  loop(now) {
    this.raf = null;
    if (!this.visible) return;
    const dt = U.clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;

    try {
      if (this.needSnap) { this.needSnap = false; this.snapshot(); }
      if (this.canvas.clientWidth !== this.cw || this.canvas.clientHeight !== this.ch) this.sizeCanvas();

      this.dog.animate(dt);
      this.jumpTimer -= dt;
      if (this.jumpTimer <= 0) { this.jumpTimer = U.rand(3, 5); this.petDog(); }

      this.sparkTimer -= dt;
      if (this.sparkTimer <= 0 && this.cw) {
        this.sparkTimer = U.rand(0.15, 0.35);
        const L = this.layout();
        this.sparks.push({
          x: L.cx + U.rand(-L.pr * 0.85, L.pr * 0.85),
          y: L.py - U.rand(0, 30),
          vy: -U.rand(12, 26),
          life: 0,
          max: U.rand(1.2, 2.2),
          s: U.rand(1.8, 3.4)
        });
      }
      for (const p of this.sparks) { p.life += dt; p.y += p.vy * dt; }
      this.sparks = this.sparks.filter(p => p.life < p.max);

      this.drawStage();
    } catch (e) {
      // Ошибка не останавливает меню, а показывается на экране один раз
      if (!this.errShown) { this.errShown = true; setTimeout(() => { throw e; }); }
    }
    this.raf = requestAnimationFrame(t => this.loop(t));
  },

  sidePath(c, cx, y, rx, ry, hgt) {
    c.beginPath();
    c.moveTo(cx - rx, y);
    c.lineTo(cx - rx, y + hgt);
    c.ellipse(cx, y + hgt, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(cx + rx, y);
    c.ellipse(cx, y, rx, ry, 0, 0, Math.PI, false);
    c.closePath();
  },

  flower(c, x, y, f) {
    const [pc, cc] = FLOWER_COLORS[f.k], s = f.s;
    c.strokeStyle = '#3d8530';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 5 * s); c.stroke();
    const fy = y - 5 * s;
    for (let i = 0; i < 5; i++) {
      const an = i / 5 * Math.PI * 2;
      U.ellipse(c, x + Math.cos(an) * 2.2 * s, fy + Math.sin(an) * 1.8 * s, 1.9 * s, 1.6 * s, pc);
    }
    U.ellipse(c, x, fy, 1.3 * s, 1.2 * s, cc);
  },

  sparkle(c, x, y, s, a) {
    c.globalAlpha = a;
    U.ellipse(c, x, y, s * 2.4, s * 2.4, 'rgba(255,240,170,0.25)');
    c.fillStyle = '#fffbe0';
    c.beginPath();
    c.moveTo(x, y - s * 2);
    c.quadraticCurveTo(x, y, x + s * 2, y);
    c.quadraticCurveTo(x, y, x, y + s * 2);
    c.quadraticCurveTo(x, y, x - s * 2, y);
    c.quadraticCurveTo(x, y, x, y - s * 2);
    c.fill();
    c.globalAlpha = 1;
  },

  drawStage() {
    const c = this.ctx, w = this.cw, h = this.ch, d = this.dog;
    if (!w || !h) return;
    const { cx, pr, ry, t1, R2, ry2, t2, py } = this.layout();
    const PI = Math.PI;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.lineCap = 'round';
    c.lineJoin = 'round';

    // Сияние за собакой
    const glow = c.createRadialGradient(cx, py - 45, 4, cx, py - 45, pr * 1.3);
    glow.addColorStop(0, 'rgba(255,240,170,0.55)');
    glow.addColorStop(0.5, 'rgba(255,220,120,0.18)');
    glow.addColorStop(1, 'rgba(255,220,120,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, h);

    // Луч света в два слоя
    for (const [k, a] of [[1.05, 0.14], [0.65, 0.18]]) {
      const g = c.createLinearGradient(0, 0, 0, py);
      g.addColorStop(0, 'rgba(255,248,210,0)');
      g.addColorStop(1, `rgba(255,248,210,${a})`);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(cx - 22 * k, 0); c.lineTo(cx + 22 * k, 0);
      c.lineTo(cx + pr * k, py); c.lineTo(cx - pr * k, py);
      c.closePath();
      c.fill();
    }

    U.softEllipse(c, cx + 5, py + t1 + t2 + 3, R2 * 1.12, ry2 * 1.5, '10,25,10', 0.6);

    // Каменное основание
    const by = py + t1;
    const sg = c.createLinearGradient(cx - R2, 0, cx + R2, 0);
    sg.addColorStop(0, '#8d93a3');
    sg.addColorStop(0.28, '#dde0e8');
    sg.addColorStop(0.6, '#a9aebb');
    sg.addColorStop(1, '#585e6e');
    this.sidePath(c, cx, by, R2, ry2, t2);
    c.fillStyle = sg;
    c.fill();

    c.save();
    c.clip();
    c.strokeStyle = 'rgba(40,45,60,0.4)';
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(cx, by + t2 / 2, R2, ry2, 0, 0, PI); c.stroke();
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 7; i++) {
        const a = PI * (i + row * 0.5 + 0.25) / 7;
        const x = cx + Math.cos(a) * R2;
        const y0 = by + row * t2 / 2 + Math.sin(a) * ry2;
        c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + t2 / 2); c.stroke();
      }
    }
    c.strokeStyle = 'rgba(255,255,255,0.5)';
    c.beginPath(); c.ellipse(cx, by + 1.2, R2 - 1, ry2, 0, 0.1 * PI, 0.9 * PI); c.stroke();
    c.restore();
    c.strokeStyle = 'rgba(30,35,45,0.5)';
    c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(cx, by + t2, R2, ry2, 0, 0, PI); c.stroke();

    const bt = c.createLinearGradient(0, by - ry2, 0, by + ry2);
    bt.addColorStop(0, '#f1f2f6');
    bt.addColorStop(1, '#c4c8d2');
    U.ellipse(c, cx, by, R2, ry2, bt);
    for (const [fx, fy, mw] of [[-0.8, 0.4, 7], [0.55, 0.62, 9], [0.9, 0.15, 5], [-0.35, 0.8, 5]]) {
      U.ellipse(c, cx + fx * R2, by + fy * ry2, mw, 2.2, '#6aa84f');
      U.ellipse(c, cx + fx * R2 - 1, by + fy * ry2 - 0.8, mw * 0.5, 1, '#9ad46a');
    }

    // Золотой ярус
    U.softEllipse(c, cx + 3, by + 2, pr * 1.05, ry * 1.1, '30,30,40', 0.35);
    const gg = c.createLinearGradient(cx - pr, 0, cx + pr, 0);
    gg.addColorStop(0, '#c98500');
    gg.addColorStop(0.25, '#fff1a8');
    gg.addColorStop(0.5, '#f5b301');
    gg.addColorStop(0.8, '#c47f00');
    gg.addColorStop(1, '#8a4f00');
    this.sidePath(c, cx, py, pr, ry, t1);
    c.fillStyle = gg;
    c.fill();
    c.strokeStyle = '#7a4300';
    c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(cx, py + t1, pr, ry, 0, 0, PI); c.stroke();
    c.strokeStyle = 'rgba(122,67,0,0.45)';
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(cx, py + 2.5, pr, ry, 0, 0.02 * PI, 0.98 * PI); c.stroke();
    c.beginPath(); c.ellipse(cx, py + t1 - 2.5, pr, ry, 0, 0.02 * PI, 0.98 * PI); c.stroke();

    for (let i = 0; i < 9; i++) {
      const a = PI * (i + 0.5) / 9;
      const x = cx + Math.cos(a) * pr, y = py + t1 / 2 + Math.sin(a) * ry;
      const rg = c.createRadialGradient(x - 0.8, y - 0.8, 0.2, x, y, 2.4);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(0.4, '#ffe066');
      rg.addColorStop(1, '#a86400');
      U.ellipse(c, x, y, 2.2 * (0.45 + 0.55 * Math.sin(a)), 2.2, rg);
    }

    const lip = c.createLinearGradient(0, py - ry, 0, py + ry);
    lip.addColorStop(0, '#fff3b0');
    lip.addColorStop(1, '#e0a000');
    U.ellipse(c, cx, py, pr, ry, lip);

    // Трава
    const gr = pr - 5, gry = ry - 1.6;
    const top = c.createRadialGradient(cx - gr * 0.3, py - gry * 0.5, 3, cx, py, gr);
    top.addColorStop(0, '#c4f58a');
    top.addColorStop(0.55, '#7ccc52');
    top.addColorStop(1, '#4c9a3a');
    U.ellipse(c, cx, py, gr, gry, top);
    c.save();
    c.beginPath(); c.ellipse(cx, py, gr, gry, 0, 0, PI * 2); c.clip();
    U.softEllipse(c, cx, py - gry, gr, gry * 0.7, '20,60,15', 0.35);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.4)';
    c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(cx, py, gr - 3, gry - 1.5, 0, PI * 1.08, PI * 1.55); c.stroke();

    const fpos = f => [cx + Math.cos(f.a) * gr * f.d, py + Math.sin(f.a) * gry * f.d];
    for (const f of this.flowers) if (Math.sin(f.a) < 0) this.flower(c, ...fpos(f), f);

    // Собака: масштаб подобран так, чтобы любая порода помещалась на подиуме
    const L = d.info;
    const dogH = 18 * L.legLen + 64 + (L.crown ? 14 : 0);
    const k = Math.min((py - 6) / (dogH * d.size + 14), (pr * 2.2) / (100 * L.bodyLen * d.size));
    c.save();
    c.scale(k, k);
    d.x = cx / k - 4;
    d.y = (py + 1) / k;
    d.draw(c);
    c.restore();
    c.lineCap = 'round';

    for (const f of this.flowers) if (Math.sin(f.a) >= 0) this.flower(c, ...fpos(f), f);
    c.lineWidth = 1.5;
    for (const b of this.blades) {
      const x = cx + Math.cos(b.a) * gr, y = py + Math.sin(b.a) * gry;
      c.strokeStyle = b.c;
      c.beginPath();
      c.moveTo(x, y + 1);
      c.quadraticCurveTo(x + b.lean * 0.3, y - b.len * 0.6, x + b.lean, y - b.len);
      c.stroke();
    }

    for (const p of this.sparks) this.sparkle(c, p.x, p.y, p.s, Math.sin(p.life / p.max * PI));
  },

  // ---------- Коллекция ----------
  openCollection() {
    const best = this.best();
    this.grid.replaceChildren();

    for (let l = 1; l <= MAX_BREEDS; l++) {
      const info = DOG_LEVELS[l];
      const open = !!info && l <= best;

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
        v.textContent = '+' + info.coin;
        coin.appendChild(v);
        card.appendChild(coin);
      }

      this.grid.appendChild(card);
      this.drawCard(cv, info ? l : 1, !open);
    }
    this.coll.classList.add('show');
  },

  closeCollection() {
    this.coll.classList.remove('show');
  },

  drawCard(cv, level, locked) {
    const W = 90, H = 72, dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const c = cv.getContext('2d');
    const d = new Dog(0, 0, level);
    d.spawnT = 1;
    const k = 0.6 / d.size;
    c.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    d.x = (W / 2) / k - 5;
    d.y = (H - 6) / k;
    d.draw(c);

    // Закрытая порода: тёмный силуэт
    if (locked) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = '#4a3424';
      c.fillRect(0, 0, cv.width, cv.height);
      c.globalCompositeOperation = 'source-over';
    }
  }
};

Menu.init(game);
