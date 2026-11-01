// Мир 4: Звёздный храм. Здесь живёт одна большая собака — Небесный страж.
// Открывается, когда объединяешь двух фараоновых собак (уровень 20).
// Страж рисуется в своей системе координат: (0, 0) — точка под лапами,
// вверх — минус. Потом всё масштабируется под экран

const GUARD = {
  fur: '#3c3f9e', mid: '#2a2c78', dark: '#17184d', deep: '#0d0d30',
  light: '#aeb9ff', pale: '#e4e9ff',
  inner: ['#ffc2f0', '#a062e0', '#4a2a90'],
  iris: ['#e8fdff', '#5ff0ff', '#3a7bff', '#2a1a7a'],
  glow: '127,243,255', glow2: '200,140,255',
  gold: ['#fff4b8', '#ffd166', '#c98a00', '#7a4a00']
};

// Пушистый контур: эллипс с "кочками" наружу
function gFluff(c, cx, cy, rx, ry, n, d, a0 = 0, a1 = Math.PI * 2) {
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (i === 0) { c.moveTo(x, y); continue; }
    const am = a0 + (a1 - a0) * (i - 0.5) / n;
    c.quadraticCurveTo(cx + Math.cos(am) * rx * (1 + d), cy + Math.sin(am) * ry * (1 + d), x, y);
  }
  c.closePath();
}

// Четырёхлучевая звёздочка
function gStar4(c, x, y, r, col) {
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y);
  c.quadraticCurveTo(x, y, x, y - r);
  c.fill();
}

// Пряди шерсти
function gStrands(c, list) {
  c.lineCap = 'round';
  for (const s of list) {
    const ex = s.x + Math.cos(s.a) * s.l, ey = s.y + Math.sin(s.a) * s.l;
    c.strokeStyle = s.c;
    c.lineWidth = s.w;
    c.beginPath();
    c.moveTo(s.x, s.y);
    c.quadraticCurveTo((s.x + ex) / 2 + Math.sin(s.a) * s.l * 0.25, (s.y + ey) / 2 - Math.cos(s.a) * s.l * 0.25, ex, ey);
    c.stroke();
  }
}

// Короткая запись больших чисел: 1,5 млрд
const gShort = n => {
  if (!isFinite(n)) return '∞';
  for (const [v, s] of [[1e12, ' трлн'], [1e9, ' млрд'], [1e6, ' млн'], [1e3, ' тыс']]) {
    if (n >= v) return (n / v).toFixed(n / v < 10 ? 1 : 0).replace('.', ',') + s;
  }
  return String(Math.round(n));
};

const STAR_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21.5 9l-5.3 4.5L18 20.5 12 16.8 6 20.5l1.8-7L2.5 9l6.9-.4z" fill="#fff6cf"/></svg>';
const HOME_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff6cf" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h5v-5h3v5h5V10"/></svg>';

const Sanctum = {
  opened: false,
  lvl: 0,
  visible: false,
  parts: [],
  texts: [],
  falls: [],
  fallT: 2,
  shootT: 4,
  shoot: null,
  lastWoof: 0,

  isOpen() { return this.opened || World.testAll; },
  income() { return typeof Upgrades !== 'undefined' ? Upgrades.fx('income') : 1; },
  tapValue() { return Math.round(5e7 * Math.pow(1.6, this.lvl) * this.income()); },
  upCost() { return Math.round(5e8 * Math.pow(2.2, this.lvl)); },

  init() {
    try {
      const s = JSON.parse(localStorage.getItem('dogevo_star')) || {};
      this.opened = !!s.open;
      this.lvl = s.lvl || 0;
    } catch (e) {}
    this.addStyle();
    this.build();
    this.makeFur();
    this.resetState();
    this.hook();
    const hud = () => { this.hud.style.display = this.isOpen() ? 'grid' : 'none'; };
    hud();
    setInterval(hud, 1000);
    window.addEventListener('resize', () => { if (this.visible) this.layout(); });
  },

  save() { localStorage.setItem('dogevo_star', JSON.stringify({ open: this.opened, lvl: this.lvl })); },

  resetState() {
    this.st = {
      t: 0, blink: 0, blinkT: 2, dbl: 0, happy: 0, boop: 0, bounce: 0,
      twL: 0, twR: 0, earT: 3, glanceT: 2, pointerT: 0,
      look: { x: 0, y: 0 }, aim: { x: 0, y: 0 }
    };
  },

  // ---------- Подключение к игре ----------
  hook() {
    const S = this;
    const nearSame = dog => {
      let best = null, bd = 55;
      for (const d of game.dogs) {
        if (d === dog || d.level !== dog.level) continue;
        const k = Math.hypot(d.x - dog.x, d.y - dog.y);
        if (k < bd) { bd = k; best = d; }
      }
      return best;
    };

    // Две фараоновы собаки теперь сливаются и открывают храм
    const find = findMergeTarget;
    findMergeTarget = function (dog) {
      if (dog.level === 20) return nearSame(dog);
      return find(dog);
    };
    const mg = merge;
    merge = function (a, b) {
      if (a.level === 20 && b.level === 20) return S.ascend(a, b);
      return mg(a, b);
    };

    // Карточка храма в списке миров
    const ol = World.openList;
    World.openList = function () { ol.call(this); S.addCard(this.listEl); };

    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      S.opened = false;
      S.lvl = 0;
      S.save();
      S.close();
    };
  },

  ascend(a, b) {
    game.dogs = game.dogs.filter(d => d !== a && d !== b);
    game.ring(b.x, b.y);
    game.sparks(b.x, b.y - 30, 24);
    game.hearts(b.x, b.y - 60, 6);
    if (typeof Sound !== 'undefined') Sound.merge();
    if (typeof Settings !== 'undefined') Settings.vibrate([40, 40, 120]);
    const first = !this.opened;
    this.opened = true;
    this.save();
    game.save();
    Shop.refresh(game);
    game.toast('✨ Звёздный храм открыт!', 'Тебя ждёт Небесный страж');
    setTimeout(() => this.show(first), 1300);
  },

  addCard(list) {
    const open = this.isOpen();
    const card = document.createElement('button');
    card.className = 'world-card w-star' + (open ? '' : ' locked');
    card.innerHTML =
      `<span class="wc-art"><span class="wc-icon">${open ? '🌙' : '🔒'}</span></span>` +
      '<span class="wc-info"><b>Звёздный храм</b><small>Небесный страж</small>' +
      `<small>${open ? 'Сила звёзд: ' + (this.lvl + 1) : 'Объедини двух фараоновых собак'}</small></span>` +
      `<span class="wc-tag">${open ? 'Открыт' : 'Закрыт'}</span>`;
    card.addEventListener('click', () => {
      if (!open) { game.toast('Храм закрыт', 'Объедини двух фараоновых собак'); return; }
      document.getElementById('worlds').classList.remove('show');
      this.show(false);
    });
    list.appendChild(card);
  },

  // ---------- Окно ----------
  build() {
    const hud = document.createElement('button');
    hud.id = 'starBtn';
    hud.setAttribute('aria-label', 'Звёздный храм');
    hud.innerHTML = STAR_ICON;
    hud.addEventListener('click', () => this.show(false));
    document.body.appendChild(hud);
    this.hud = hud;

    const el = document.createElement('div');
    el.id = 'sanctum';
    el.innerHTML =
      '<canvas class="sg-cv"></canvas>' +
      `<button class="sg-back" aria-label="Назад">${HOME_ICON}</button>` +
      '<div class="sg-coins"><svg viewBox="0 0 64 64"><use href="#coin"/></svg><span></span></div>' +
      '<div class="sg-plate"><small>Звёздный храм</small><b>Небесный страж</b><span class="sg-lv"></span></div>' +
      '<div class="sg-hint">Погладь стража, нажми на нос или лови звёзды!</div>' +
      '<button class="sg-up"><span>Сила звёзд</span>' +
      '<span class="sg-up-c"><svg viewBox="0 0 64 64"><use href="#coin"/></svg><b></b></span><small></small></button>';
    document.body.appendChild(el);
    this.el = el;
    this.cv = el.querySelector('.sg-cv');
    this.ctx = this.cv.getContext('2d');
    this.coinEl = el.querySelector('.sg-coins span');
    this.lvEl = el.querySelector('.sg-lv');
    this.hint = el.querySelector('.sg-hint');
    this.upBtn = el.querySelector('.sg-up');
    this.costEl = el.querySelector('.sg-up-c b');
    this.incEl = el.querySelector('.sg-up small');

    el.querySelector('.sg-back').addEventListener('click', () => this.close());
    this.upBtn.addEventListener('click', () => this.buyUp());
    this.cv.addEventListener('pointerdown', e => this.tap(e.clientX, e.clientY));
    this.cv.addEventListener('pointermove', e => { this.st.pointerT = 1.5; this.aimAt(e.clientX, e.clientY); });
  },

  show(first) {
    if (!this.isOpen()) return;
    this.first = first;
    this.visible = true;
    this.el.classList.add('show');
    this.layout();
    this.last = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  },

  close() {
    this.visible = false;
    this.el.classList.remove('show');
  },

  layout() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.w * this.dpr);
    this.cv.height = Math.round(this.h * this.dpr);
    this.k = Math.min((this.h - 190) / 470, this.w / 400);
    this.ox = this.w / 2 - 12 * this.k;
    this.oy = this.h - 92;
    this.buildBg();

    const r = U.seeded(9);
    this.tw = Array.from({ length: 60 }, () => ({ x: r() * this.w, y: r() * this.h * 0.75, ph: r() * 6.28, sp: 1 + r() * 2, s: 1 + r() * 2 }));
    this.dust = Array.from({ length: 40 }, () => ({ x: r() * this.w, y: r() * this.h, vy: 8 + r() * 18, ph: r() * 6.28, s: 0.8 + r() * 1.8 }));
  },

  toDog(sx, sy) { return { x: (sx - this.ox) / this.k, y: (sy - this.oy) / this.k }; },
  toScreen(x, y) { return { x: this.ox + x * this.k, y: this.oy + y * this.k }; },

  aimAt(sx, sy) {
    const p = this.toDog(sx, sy), S = this.st;
    S.aim.x = U.clamp(p.x / 45, -1, 1) * 4.5;
    S.aim.y = U.clamp((p.y + 313) / 45, -1, 1) * 3.5;
  },

  // ---------- Касания ----------
  tap(sx, sy) {
    if (typeof Sound !== 'undefined') Sound.unlock();
    this.st.pointerT = 1.5;
    this.aimAt(sx, sy);

    // Поймать падающую звезду
    for (const f of this.falls) {
      if (Math.hypot(f.x - sx, f.y - sy) < 40) { this.landStar(f, 3); return; }
    }

    const p = this.toDog(sx, sy);
    const nose = (p.x / 22) ** 2 + ((p.y + 286) / 17) ** 2 < 1;
    const head = (p.x / 98) ** 2 + ((p.y + 305) / 88) ** 2 < 1;
    const body = (p.x / 170) ** 2 + ((p.y + 110) / 130) ** 2 < 1;
    if (nose) this.boop(sx, sy);
    else if (head || body) this.pet(sx, sy);
  },

  pet(sx, sy) {
    const S = this.st;
    S.happy = 1.6;
    S.bounce = 1;
    this.give(this.tapValue(), sx, sy - 20);
    for (let i = 0; i < 3; i++) {
      this.parts.push({ type: 'heart', x: sx + U.rand(-20, 20), y: sy, vx: U.rand(-20, 20), vy: U.rand(-90, -60), life: 0, max: 1.3, s: U.rand(1.4, 2) });
    }
    this.woof();
    if (typeof Settings !== 'undefined') Settings.vibrate(12);
    if (typeof Ach !== 'undefined') Ach.add('pets', 1);
    this.hint.classList.add('off');
  },

  boop(sx, sy) {
    const S = this.st;
    S.boop = 1;
    S.happy = 0;
    S.bounce = 1;
    this.give(this.tapValue() * 2, sx, sy - 30, 'Буп! ');
    this.burst(sx, sy, 14);
    if (typeof Sound !== 'undefined') {
      Sound.tone(900, 0.08, { vol: 0.25, to: 1500 });
      Sound.tone(1400, 0.15, { type: 'triangle', vol: 0.15, delay: 0.08 });
    }
    if (typeof Settings !== 'undefined') Settings.vibrate(20);
    if (typeof Ach !== 'undefined') Ach.add('pets', 1);
    this.hint.classList.add('off');
  },

  woof() {
    const now = performance.now();
    if (now - this.lastWoof < 250 || typeof Sound === 'undefined') return;
    this.lastWoof = now;
    Sound.tone(210, 0.16, { type: 'sawtooth', vol: 0.25, to: 110, lp: 700 });
    Sound.tone(190, 0.2, { type: 'sawtooth', vol: 0.2, to: 95, lp: 650, delay: 0.18 });
  },

  give(v, x, y, pre = '') {
    game.addMoney(v);
    this.texts.push({ x, y, txt: pre + '+' + gShort(v), life: 0 });
  },

  burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = U.rand(0, Math.PI * 2), sp = U.rand(80, 220);
      this.parts.push({ type: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.7, s: U.rand(3, 6) });
    }
  },

  landStar(f, mul) {
    this.falls = this.falls.filter(o => o !== f);
    this.give(this.tapValue() * 2 * mul, f.x, f.y - 10, mul > 1 ? 'Поймал! ' : '');
    this.burst(f.x, f.y, mul > 1 ? 18 : 8);
    if (mul > 1) { this.st.happy = 1.2; this.st.bounce = 1; }
    if (typeof Sound !== 'undefined') {
      [1319, 1568, 2093].forEach((fr, i) => Sound.tone(fr, 0.18, { type: 'triangle', vol: 0.15, delay: i * 0.06 }));
    }
  },

  buyUp() {
    const cost = this.upCost();
    if (game.money < cost) {
      this.upBtn.classList.remove('shake');
      void this.upBtn.offsetWidth;
      this.upBtn.classList.add('shake');
      if (typeof Sound !== 'undefined') Sound.error();
      game.toast('Не хватает монет', 'Нужно ' + gShort(cost));
      return;
    }
    game.money -= cost;
    game.updateMoney(false);
    this.lvl++;
    this.save();
    const S = this.st;
    S.happy = 2;
    S.bounce = 1;
    const c = this.toScreen(0, -250);
    this.burst(c.x, c.y, 30);
    this.texts.push({ x: c.x, y: c.y - 60, txt: `Сила звёзд ${this.lvl + 1}!`, life: 0 });
    if (typeof Sound !== 'undefined') {
      [523, 659, 784, 1047, 1319].forEach((f, i) => Sound.tone(f, 0.25, { type: 'triangle', vol: 0.25, delay: i * 0.08 }));
    }
    if (typeof Settings !== 'undefined') Settings.vibrate([30, 30, 60]);
  },

  // ---------- Цикл ----------
  loop(now) {
    this.raf = null;
    if (!this.visible) return;
    const dt = U.clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.update(dt);
    this.draw();
    this.refreshUI();
    this.raf = requestAnimationFrame(t => this.loop(t));
  },

  refreshUI() {
    const m = gShort(game.money);
    if (m !== this._m) { this._m = m; this.coinEl.textContent = m; }
    const lv = `Сила звёзд ${this.lvl + 1}`;
    if (lv !== this._lv) {
      this._lv = lv;
      this.lvEl.textContent = lv;
      this.costEl.textContent = gShort(this.upCost());
      this.incEl.textContent = `касание +${gShort(this.tapValue())} · звезда +${gShort(this.tapValue() * 2)}`;
    }
    this.upBtn.classList.toggle('poor', game.money < this.upCost());
  },

  update(dt) {
    const S = this.st;
    S.t += dt;

    // Моргание, иногда двойное
    S.blinkT -= dt;
    if (S.blinkT <= 0) {
      S.blink = 0.16;
      S.blinkT = U.rand(2.5, 5);
      if (Math.random() < 0.25) S.dbl = 0.35;
    }
    if (S.dbl > 0) { S.dbl -= dt; if (S.dbl <= 0) S.blink = 0.16; }
    S.blink = Math.max(0, S.blink - dt);

    // Уши иногда дёргаются
    S.earT -= dt;
    if (S.earT <= 0) {
      S.earT = U.rand(3, 6);
      if (Math.random() < 0.5) S.twL = 0.35; else S.twR = 0.35;
    }
    S.twL = Math.max(0, S.twL - dt);
    S.twR = Math.max(0, S.twR - dt);

    S.happy = Math.max(0, S.happy - dt);
    S.bounce = Math.max(0, S.bounce - dt * 2.5);
    S.boop = Math.max(0, S.boop - dt * 2);

    // Куда смотрит: на палец, на падающую звезду или по сторонам
    if (S.pointerT > 0) S.pointerT -= dt;
    else if (this.falls.length) this.aimAt(this.falls[0].x, this.falls[0].y);
    else {
      S.glanceT -= dt;
      if (S.glanceT <= 0) {
        S.glanceT = U.rand(1.5, 3.5);
        S.aim.x = U.rand(-3, 3);
        S.aim.y = U.rand(-1.5, 2);
      }
    }
    const lk = Math.min(1, dt * 8);
    S.look.x = U.lerp(S.look.x, S.aim.x, lk);
    S.look.y = U.lerp(S.look.y, S.aim.y, lk);

    // Падающие звёзды с монетами
    this.fallT -= dt;
    if (this.fallT <= 0) {
      this.fallT = U.rand(3, 4.5);
      const tgt = this.toScreen(U.rand(-110, 110), U.rand(-330, -140));
      const x0 = U.rand(this.w * 0.1, this.w * 0.9);
      this.falls.push({ x0, y0: -20, x: x0, y: -20, tx: tgt.x, ty: tgt.y, t: 0, dur: U.rand(2, 2.6) });
    }
    for (const f of [...this.falls]) {
      f.t += dt;
      const k = Math.min(1, f.t / f.dur), e = k * k;
      f.x = U.lerp(f.x0, f.tx, e);
      f.y = U.lerp(f.y0, f.ty, e);
      if (k >= 1) this.landStar(f, 1);
    }

    // Метеор
    this.shootT -= dt;
    if (this.shootT <= 0) {
      this.shootT = U.rand(5, 9);
      this.shoot = { x: U.rand(this.w * 0.2, this.w), y: U.rand(10, this.h * 0.3), vx: -U.rand(380, 520), vy: U.rand(120, 200), life: 0 };
    }
    if (this.shoot) {
      const s = this.shoot;
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life > 1) this.shoot = null;
    }

    for (const d of this.dust) {
      d.y -= d.vy * dt;
      d.x += Math.sin(S.t + d.ph) * 6 * dt;
      if (d.y < -10) { d.y = this.h + 10; d.x = Math.random() * this.w; }
    }
    for (const p of this.parts) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
    }
    this.parts = this.parts.filter(p => p.life < p.max);
    for (const t of this.texts) { t.life += dt; t.y -= 40 * dt; }
    this.texts = this.texts.filter(t => t.life < 1.2);
  },

  // ---------- Фон: рисуется один раз ----------
  buildBg() {
    const w = this.w, h = this.h, dpr = this.dpr;
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const r = U.seeded(77);

    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#05051a');
    sky.addColorStop(0.45, '#1b1050');
    sky.addColorStop(0.75, '#4a1f6e');
    sky.addColorStop(1, '#b0477a');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    // Туманности
    g.globalCompositeOperation = 'lighter';
    const neb = [[0.2, 0.25, 0.5, 0.18, GUARD.glow2, 0.22], [0.8, 0.18, 0.45, 0.15, GUARD.glow, 0.14],
      [0.55, 0.42, 0.6, 0.12, '255,120,200', 0.12], [0.1, 0.55, 0.35, 0.12, GUARD.glow, 0.1], [0.9, 0.5, 0.4, 0.14, GUARD.glow2, 0.15]];
    for (const [x, y, rx, ry, rgb, a] of neb) U.softEllipse(g, x * w, y * h, rx * w, ry * h, rgb, a);
    g.globalCompositeOperation = 'source-over';

    // Млечный путь
    for (let i = 0; i < 500; i++) {
      const t = r();
      const x = t * w, y = h * 0.08 + t * h * 0.3 + (r() - 0.5) * h * 0.12;
      U.ellipse(g, x, y, 0.6, 0.6, `rgba(255,255,255,${0.15 + r() * 0.4})`);
    }
    for (let i = 0; i < 220; i++) {
      U.ellipse(g, r() * w, r() * h * 0.8, 0.5 + r() * 1.1, 0.5 + r() * 1.1, `rgba(255,255,255,${0.3 + r() * 0.6})`);
    }

    // Горы вдали
    for (const [base, col, amp] of [[h * 0.8, '#1d1145', 40], [h * 0.86, '#120a2e', 28]]) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w + 20; x += 20) g.lineTo(x, base - Math.abs(Math.sin(x * 0.013 + base)) * amp - r() * 8);
      g.lineTo(w + 20, h);
      g.closePath();
      g.fill();
    }

    this.island(g, w * 0.14, h * 0.33, 0.75, r);
    this.island(g, w * 0.86, h * 0.26, 0.6, r);
    this.island(g, w * 0.8, h * 0.56, 0.45, r);
    this.pillar(g, w * 0.06, h * 0.92, h * 0.42, 1);
    this.pillar(g, w * 0.94, h * 0.92, h * 0.38, 1);

    // Облака у земли
    for (let i = 0; i < 8; i++) U.softEllipse(g, r() * w, h * (0.86 + r() * 0.1), w * 0.3, 30, '200,170,255', 0.18);
    this.bg = cv;
  },

  island(g, x, y, s, r) {
    const rg = g.createLinearGradient(0, y, 0, y + 70 * s);
    rg.addColorStop(0, '#5b4a9a');
    rg.addColorStop(0.6, '#2a1f55');
    rg.addColorStop(1, 'rgba(20,15,50,0)');
    g.fillStyle = rg;
    g.beginPath();
    g.moveTo(x - 52 * s, y);
    g.quadraticCurveTo(x - 30 * s, y + 30 * s, x - 6 * s, y + 70 * s);
    g.lineTo(x + 6 * s, y + 52 * s);
    g.quadraticCurveTo(x + 30 * s, y + 26 * s, x + 50 * s, y);
    g.closePath();
    g.fill();

    // Светящийся водопад
    const wg = g.createLinearGradient(0, y, 0, y + 130 * s);
    wg.addColorStop(0, 'rgba(150,230,255,0.75)');
    wg.addColorStop(1, 'rgba(150,230,255,0)');
    g.fillStyle = wg;
    g.fillRect(x + 22 * s, y, 5 * s, 130 * s);
    U.softEllipse(g, x + 24 * s, y + 4 * s, 14 * s, 6 * s, GUARD.glow, 0.5);

    // Трава
    U.ellipse(g, x, y, 52 * s, 8 * s, '#3fb894');
    U.ellipse(g, x - 6 * s, y - 2 * s, 40 * s, 4 * s, '#9ff5d0');

    // Кристальные деревья
    for (let k = 0; k < 3; k++) {
      const tx = x - 28 * s + k * 24 * s + r() * 6 * s, th = (22 + r() * 14) * s;
      g.strokeStyle = '#2a1f55';
      g.lineWidth = 2 * s;
      g.beginPath(); g.moveTo(tx, y - 2 * s); g.lineTo(tx, y - th * 0.6); g.stroke();
      const col = k % 2 ? GUARD.glow2 : GUARD.glow;
      U.softEllipse(g, tx, y - th, 16 * s, 16 * s, col, 0.45);
      const cg = g.createLinearGradient(tx, y - th - 14 * s, tx, y - th + 12 * s);
      cg.addColorStop(0, '#ffffff');
      cg.addColorStop(1, `rgba(${col},0.9)`);
      g.fillStyle = cg;
      g.beginPath();
      g.moveTo(tx, y - th - 14 * s); g.lineTo(tx + 8 * s, y - th); g.lineTo(tx, y - th + 12 * s); g.lineTo(tx - 8 * s, y - th);
      g.closePath();
      g.fill();
    }
  },

  pillar(g, x, bottom, top, s) {
    const pg = g.createLinearGradient(x - 20, 0, x + 20, 0);
    pg.addColorStop(0, '#7b6fd0');
    pg.addColorStop(0.45, '#3a2f80');
    pg.addColorStop(1, '#1a1245');
    g.fillStyle = pg;
    g.beginPath();
    g.moveTo(x - 20 * s, bottom); g.lineTo(x - 14 * s, top); g.lineTo(x, top - 28 * s); g.lineTo(x + 14 * s, top); g.lineTo(x + 20 * s, bottom);
    g.closePath();
    g.fill();

    // Руны
    g.fillStyle = `rgba(${GUARD.glow},0.6)`;
    for (let y = top + 20; y < bottom - 30; y += 26) {
      g.fillRect(x - 6, y, 12, 2);
      g.fillRect(x - 1, y - 6, 2, 14);
      U.ellipse(g, x + 6, y + 6, 1.6, 1.6, `rgba(${GUARD.glow},0.7)`);
    }

    // Золотые пояса
    g.fillStyle = GUARD.gold[1];
    g.fillRect(x - 21 * s, bottom - 18, 42 * s, 7);
    g.fillRect(x - 15 * s, top, 30 * s, 5);

    // Кристалл на вершине
    const cy = top - 52 * s;
    U.softEllipse(g, x, cy, 40 * s, 40 * s, GUARD.glow, 0.5);
    const cg = g.createLinearGradient(x, cy - 20, x, cy + 20);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.5, '#9ff7ff');
    cg.addColorStop(1, '#3a7bff');
    g.fillStyle = cg;
    g.beginPath();
    g.moveTo(x, cy - 20 * s); g.lineTo(x + 10 * s, cy); g.lineTo(x, cy + 18 * s); g.lineTo(x - 10 * s, cy);
    g.closePath();
    g.fill();
  },

  // ---------- Кадр ----------
  draw() {
    const c = this.ctx, w = this.w, h = this.h, t = this.st.t;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.drawImage(this.bg, 0, 0, w, h);

    // Мерцающие звёзды
    c.lineCap = 'round';
    for (const s of this.tw) {
      const a = Math.max(0, Math.sin(t * s.sp + s.ph));
      if (a < 0.05) continue;
      c.strokeStyle = `rgba(255,255,255,${a * 0.9})`;
      c.lineWidth = 1;
      const z = s.s * (1 + a);
      c.beginPath();
      c.moveTo(s.x - z, s.y); c.lineTo(s.x + z, s.y);
      c.moveTo(s.x, s.y - z); c.lineTo(s.x, s.y + z);
      c.stroke();
    }

    // Метеор
    if (this.shoot) {
      const s = this.shoot, a = Math.sin(s.life * Math.PI);
      const g = c.createLinearGradient(s.x, s.y, s.x - s.vx * 0.15, s.y - s.vy * 0.15);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.strokeStyle = g;
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - s.vx * 0.15, s.y - s.vy * 0.15); c.stroke();
    }

    // Луна, помост и страж
    c.save();
    c.translate(this.ox, this.oy);
    c.scale(this.k, this.k);
    this.drawMoon(c, t);
    this.drawDais(c, t);
    this.drawGuardian(c);
    c.restore();

    // Звёздная пыль
    for (const d of this.dust) {
      const a = 0.3 + 0.4 * Math.sin(t * 2 + d.ph);
      U.ellipse(c, d.x, d.y, d.s * 2.5, d.s * 2.5, `rgba(${GUARD.glow},${a * 0.15})`);
      U.ellipse(c, d.x, d.y, d.s, d.s, `rgba(220,250,255,${a})`);
    }

    // Падающие звёзды
    for (const f of this.falls) {
      const tx = f.x - (f.tx - f.x0) * 0.12, ty = f.y - (f.ty - f.y0) * 0.12;
      const g = c.createLinearGradient(f.x, f.y, tx, ty);
      g.addColorStop(0, 'rgba(255,230,140,0.9)');
      g.addColorStop(1, 'rgba(255,230,140,0)');
      c.strokeStyle = g;
      c.lineWidth = 4;
      c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(tx, ty); c.stroke();
      U.softEllipse(c, f.x, f.y, 24, 24, '255,220,120', 0.6);
      gStar4(c, f.x, f.y, 10, '#fff3b0');
      gStar4(c, f.x, f.y, 4.5, '#ffffff');
    }

    // Сердечки и искры
    for (const p of this.parts) {
      c.globalAlpha = 1 - p.life / p.max;
      if (p.type === 'heart') U.heart(c, p.x, p.y, p.s, '#ff6bcb');
      else gStar4(c, p.x, p.y, p.s, '#fff3b0');
    }
    c.globalAlpha = 1;

    // Числа монет
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    for (const tx of this.texts) {
      const k = tx.life / 1.2;
      c.globalAlpha = 1 - k * k;
      c.font = `${Math.round(24 * (1 + 0.25 * Math.sin(Math.min(1, tx.life * 5) * Math.PI)))}px 'Lilita One', 'Arial Black', sans-serif`;
      c.lineWidth = 5;
      c.strokeStyle = '#2e1470';
      c.strokeText(tx.txt, tx.x, tx.y);
      c.fillStyle = '#ffe066';
      c.fillText(tx.txt, tx.x, tx.y);
    }
    c.globalAlpha = 1;
  },

  drawMoon(c, t) {
    U.softEllipse(c, 0, -330, 340, 340, GUARD.glow2, 0.2);
    U.softEllipse(c, 0, -330, 230, 230, '255,240,255', 0.2);
    const mg = c.createRadialGradient(-60, -390, 10, 0, -330, 175);
    mg.addColorStop(0, '#fffdf5');
    mg.addColorStop(0.6, '#e9e3ff');
    mg.addColorStop(1, '#b8b0ea');
    U.ellipse(c, 0, -330, 175, 175, mg);
    for (const [x, y, r] of [[-70, -420, 22], [60, -370, 30], [-110, -330, 18], [95, -445, 14], [-30, -470, 12], [120, -300, 16]]) {
      U.ellipse(c, x, y, r, r * 0.9, 'rgba(150,140,210,0.35)');
      U.ellipse(c, x + r * 0.15, y + r * 0.15, r * 0.8, r * 0.7, 'rgba(175,165,225,0.3)');
    }
    c.save();
    c.translate(0, -330);
    c.rotate(t * 0.05);
    c.setLineDash([3, 12]);
    c.strokeStyle = `rgba(${GUARD.glow},0.5)`;
    c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 196, 0, Math.PI * 2); c.stroke();
    c.setLineDash([]);
    c.restore();
  },

  drawDais(c, t) {
    const G = GUARD, PI = Math.PI;
    U.softEllipse(c, 0, 44, 320, 70, '0,0,20', 0.6);

    // Боковина
    c.beginPath();
    c.moveTo(-240, 8);
    c.lineTo(-240, 34);
    c.ellipse(0, 34, 240, 48, 0, PI, 0, true);
    c.lineTo(240, 8);
    c.ellipse(0, 8, 240, 48, 0, 0, PI, false);
    c.closePath();
    const sg = c.createLinearGradient(-240, 0, 240, 0);
    sg.addColorStop(0, '#8a84c8');
    sg.addColorStop(0.3, '#e6e3ff');
    sg.addColorStop(0.6, '#a39fd8');
    sg.addColorStop(1, '#4b4690');
    c.fillStyle = sg;
    c.fill();
    c.strokeStyle = G.gold[1];
    c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 34, 240, 48, 0, 0, PI); c.stroke();
    c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, 21, 240, 48, 0, 0.05 * PI, 0.95 * PI); c.stroke();

    // Верх
    const tg = c.createRadialGradient(-60, -10, 10, 0, 8, 240);
    tg.addColorStop(0, '#f4f2ff');
    tg.addColorStop(1, '#a9a3e2');
    U.ellipse(c, 0, 8, 240, 48, tg);
    const rim = c.createLinearGradient(-240, 0, 240, 0);
    rim.addColorStop(0, G.gold[2]);
    rim.addColorStop(0.35, G.gold[0]);
    rim.addColorStop(1, G.gold[2]);
    c.strokeStyle = rim;
    c.lineWidth = 3.5;
    c.beginPath(); c.ellipse(0, 8, 240, 48, 0, 0, PI * 2); c.stroke();

    // Кольцо светящихся рун
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(${G.glow},0.45)`;
    c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, 8, 205, 39, 0, 0, PI * 2); c.stroke();
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 8, 168, 32, 0, 0, PI * 2); c.stroke();
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * PI * 2 + t * 0.12;
      const x = Math.cos(a) * 186, y = 8 + Math.sin(a) * 35.5;
      const al = 0.35 + 0.35 * Math.sin(t * 3 + i);
      if (i % 3 === 0) gStar4(c, x, y, 4, `rgba(${G.glow},${al})`);
      else {
        c.fillStyle = `rgba(${G.glow},${al})`;
        c.fillRect(x - 1, y - 3, 2, 6);
        c.fillRect(x - 3, y - 1, 6, 1.5);
      }
    }
    c.restore();
  },

  // ---------- Небесный страж ----------
  makeFur() {
    const r = U.seeded(2026), PI = Math.PI;
    const ring = (cx, cy, rx, ry, n, a0, a1, len, cols) => {
      const L = [];
      for (let i = 0; i < n; i++) {
        const a = a0 + (a1 - a0) * r(), k = 0.84 + r() * 0.14;
        L.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k, a: a + (r() - 0.5) * 0.6,
          l: len * (0.6 + r() * 0.7), c: cols[(r() * cols.length) | 0], w: 1 + r() * 1.3 });
      }
      return L;
    };
    const haunchCols = ['rgba(20,20,70,0.5)', 'rgba(150,165,255,0.4)'];
    const chest = [];
    for (let i = 0; i < 60; i++) {
      const x = (r() - 0.5) * 92, y = -235 + r() * 170;
      chest.push({ x, y, a: PI / 2 - x * 0.01 + (r() - 0.5) * 0.3, l: 8 + r() * 9,
        c: r() < 0.6 ? 'rgba(255,255,255,0.7)' : 'rgba(120,135,230,0.55)', w: 1 + r() });
    }
    this.fur = {
      head: ring(0, -300, 86, 70, 70, PI * 0.95, PI * 2.05, 10, ['rgba(170,185,255,0.55)', 'rgba(20,20,70,0.55)', '#4a50b8']),
      mane: ring(0, -262, 108, 74, 110, 0, PI * 2, 18, ['#2a2c78', '#17184d', 'rgba(140,155,255,0.45)']),
      haunch: [...ring(-82, -66, 74, 62, 40, PI * 0.6, PI * 1.6, 12, haunchCols), ...ring(82, -66, 74, 62, 40, -PI * 0.6, PI * 0.4, 12, haunchCols)],
      chest
    };
  },

  drawGuardian(c) {
    const S = this.st, G = GUARD, t = S.t, PI = Math.PI;
    const hk = Math.min(1, S.happy);
    const breath = Math.sin(t * 1.6);
    const bq = Math.sin(S.bounce * PI) * 0.035;
    c.save();
    c.scale(1 + bq, 1 - bq + breath * 0.006);
    c.lineJoin = 'round';
    c.lineCap = 'round';

    U.softEllipse(c, 0, -4, 210, 34, '5,5,30', 0.65);   // тень на помосте

    this.drawTail(c, t, hk);

    // Бёдра и задние лапы
    for (const sd of [-1, 1]) {
      const hg = c.createRadialGradient(sd * 62 - 20, -100, 6, sd * 82, -66, 90);
      hg.addColorStop(0, '#5a5fc8');
      hg.addColorStop(0.5, G.fur);
      hg.addColorStop(1, G.dark);
      gFluff(c, sd * 82, -66, 74, 62, 14, 0.07);
      c.fillStyle = hg;
      c.fill();
    }
    gStrands(c, this.fur.haunch);
    for (const sd of [-1, 1]) this.paw(c, sd * 122, -10, 30, 13);

    // Тело
    const bg = c.createRadialGradient(-30, -210, 10, 0, -140, 150);
    bg.addColorStop(0, '#5f66cc');
    bg.addColorStop(0.5, G.fur);
    bg.addColorStop(1, G.dark);
    U.ellipse(c, 0, -140, 86, 122, bg);
    c.strokeStyle = 'rgba(205,225,255,0.45)';
    c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, -140, 84, 120, 0, PI * 0.9, PI * 1.3); c.stroke();
    this.constellation(c, t);

    // Пушистая грудь
    const cg = c.createLinearGradient(0, -250, 0, -50);
    cg.addColorStop(0, G.pale);
    cg.addColorStop(0.55, G.light);
    cg.addColorStop(1, 'rgba(120,135,230,0.9)');
    gFluff(c, 0, -150, 56, 100, 16, 0.1);
    c.fillStyle = cg;
    c.fill();
    gStrands(c, this.fur.chest);

    for (const sd of [-1, 1]) this.frontLeg(c, sd * 44);

    // Грива
    const mg = c.createRadialGradient(-30, -300, 10, 0, -262, 120);
    mg.addColorStop(0, '#4b50b8');
    mg.addColorStop(0.5, G.mid);
    mg.addColorStop(1, G.deep);
    gFluff(c, 0, -262, 108, 74, 20, 0.15);
    c.fillStyle = mg;
    c.fill();
    gStrands(c, this.fur.mane);
    const rg = c.createLinearGradient(0, -260, 0, -190);
    rg.addColorStop(0, G.light);
    rg.addColorStop(1, '#7d88e0');
    gFluff(c, 0, -226, 80, 38, 14, 0.22, 0, PI);
    c.fillStyle = rg;
    c.fill();

    this.collar(c, t);
    U.softEllipse(c, 0, -234, 70, 16, '8,8,35', 0.45);   // тень от головы

    // Голова немного наклоняется и покачивается
    c.save();
    c.translate(0, -236);
    c.rotate(Math.sin(t * 0.7) * 0.025 + S.look.x * 0.005);
    c.translate(0, 236 + Math.sin(t * 1.6 + 0.6) * 1.5);
    this.drawHead(c, S, hk);
    c.restore();
    c.restore();
  },

  drawTail(c, t, hk) {
    const G = GUARD;
    c.save();
    c.translate(70, -40);
    c.rotate(Math.sin(t * (1.6 + hk * 5)) * (0.06 + hk * 0.08));
    const P = u => {
      const v = 1 - u;
      return [3 * v * v * u * 120 + 3 * v * u * u * 140 + u * u * u * 100,
        3 * v * v * u * 10 + 3 * v * u * u * -110 + u * u * u * -180];
    };
    for (let i = 0; i <= 11; i++) {
      const u = i / 11, [x, y] = P(u), R = 34 - u * 10, tip = u > 0.75;
      const g = c.createRadialGradient(x - R * 0.4, y - R * 0.4, 2, x, y, R * 1.1);
      g.addColorStop(0, tip ? G.pale : '#5a5fc8');
      g.addColorStop(0.55, tip ? G.light : G.fur);
      g.addColorStop(1, tip ? '#7f8be0' : G.dark);
      gFluff(c, x, y, R, R * 0.92, 9, 0.12, u * 3, u * 3 + Math.PI * 2);
      c.fillStyle = g;
      c.fill();
    }
    const [x, y] = P(1);
    U.softEllipse(c, x, y, 42, 42, G.glow, 0.35 * (0.6 + 0.4 * Math.sin(t * 2)));
    gStar4(c, x, y - 4, 7, '#ffffff');
    c.restore();
  },

  paw(c, x, y, rx, ry) {
    const g = c.createLinearGradient(0, y - ry, 0, y + ry);
    g.addColorStop(0, GUARD.pale);
    g.addColorStop(1, '#9aa6ec');
    gFluff(c, x, y, rx, ry, 9, 0.1);
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = 'rgba(60,70,150,0.55)';
    c.lineWidth = 1.6;
    for (const k of [-1, 0, 1]) {
      c.beginPath();
      c.moveTo(x + k * rx * 0.33, y - ry * 0.9);
      c.quadraticCurveTo(x + k * rx * 0.36 + 1, y - ry * 0.2, x + k * rx * 0.3, y + ry * 0.5);
      c.stroke();
    }
    for (const k of [-1.5, -0.5, 0.5, 1.5]) U.ellipse(c, x + k * rx * 0.32, y + ry * 0.85, 2.2, 1.6, '#dfe4ff');
  },

  frontLeg(c, x) {
    const G = GUARD;
    const path = () => {
      c.beginPath();
      c.moveTo(x - 19, -205);
      c.bezierCurveTo(x - 23, -140, x - 22, -60, x - 18, -26);
      c.lineTo(x + 18, -26);
      c.bezierCurveTo(x + 22, -60, x + 23, -140, x + 19, -205);
      c.closePath();
    };
    const g = c.createLinearGradient(x - 20, 0, x + 20, 0);
    g.addColorStop(0, '#6168cc');
    g.addColorStop(0.35, G.fur);
    g.addColorStop(1, G.dark);
    path();
    c.fillStyle = g;
    c.fill();

    c.save();
    path();
    c.clip();
    // Белые носочки
    const sg = c.createLinearGradient(0, -110, 0, -30);
    sg.addColorStop(0, 'rgba(228,233,255,0)');
    sg.addColorStop(1, 'rgba(228,233,255,0.95)');
    c.fillStyle = sg;
    c.fillRect(x - 25, -110, 50, 90);
    c.strokeStyle = 'rgba(20,20,70,0.35)';
    c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const yy = -190 + i * 30;
      c.beginPath(); c.moveTo(x + 8, yy); c.quadraticCurveTo(x + 12, yy + 10, x + 9, yy + 18); c.stroke();
    }
    c.strokeStyle = 'rgba(200,215,255,0.45)';
    c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - 14, -195); c.quadraticCurveTo(x - 17, -140, x - 14, -90); c.stroke();
    c.restore();
    this.paw(c, x, -17, 28, 15);
  },

  constellation(c, t) {
    const G = GUARD;
    const groups = [[[-58, -200], [-40, -170], [-62, -140], [-44, -112]], [[96, -96], [122, -72], [104, -44], [86, -60]]];
    for (const grp of groups) {
      c.strokeStyle = `rgba(${G.glow},0.35)`;
      c.lineWidth = 1.2;
      c.beginPath();
      grp.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
      grp.forEach(([x, y], i) => {
        const a = 0.6 + 0.4 * Math.sin(t * 2.2 + i * 1.7 + x);
        U.softEllipse(c, x, y, 10, 10, G.glow, 0.35 * a);
        gStar4(c, x, y, 3.2 + a * 1.4, '#ffffff');
      });
    }
  },

  collar(c, t) {
    const G = GUARD, PI = Math.PI;
    c.lineCap = 'round';
    c.strokeStyle = G.gold[3];
    c.lineWidth = 14;
    c.beginPath(); c.ellipse(0, -228, 66, 19, 0, 0.08 * PI, 0.92 * PI); c.stroke();
    const gg = c.createLinearGradient(-66, 0, 66, 0);
    gg.addColorStop(0, G.gold[2]);
    gg.addColorStop(0.3, G.gold[0]);
    gg.addColorStop(0.55, G.gold[1]);
    gg.addColorStop(1, G.gold[2]);
    c.strokeStyle = gg;
    c.lineWidth = 10;
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.6)';
    c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(0, -231, 66, 19, 0, 0.15 * PI, 0.6 * PI); c.stroke();

    // Камни на ошейнике
    c.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const a = PI * (0.18 + 0.64 * i / 6);
      const x = Math.cos(a) * 66, y = -228 + Math.sin(a) * 19;
      U.ellipse(c, x, y, 3.2, 3.2, i % 2 ? '#c08bff' : '#5ff0ff', 'rgba(40,20,80,0.6)');
      U.ellipse(c, x - 1, y - 1, 1, 1, '#ffffff');
    }

    // Подвеска-кристалл качается
    const py = -209;
    c.strokeStyle = G.gold[2];
    c.lineWidth = 2.4;
    c.beginPath(); c.arc(0, py, 5, 0, PI * 2); c.stroke();
    c.save();
    c.translate(0, py + 4);
    c.rotate(Math.sin(t * 1.3) * 0.08);
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.4);
    U.softEllipse(c, 0, 18, 36, 36, G.glow, 0.4 * pulse);
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 ? 6 : 16, a = i * PI / 4 - PI / 2;
      c.lineTo(Math.cos(a) * rr, 18 + Math.sin(a) * rr);
    }
    c.closePath();
    const cg = c.createLinearGradient(-16, 2, 16, 34);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.4, '#9ff7ff');
    cg.addColorStop(1, '#3a7bff');
    c.fillStyle = cg;
    c.fill();
    c.strokeStyle = 'rgba(20,40,120,0.7)';
    c.lineWidth = 1.2;
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.5)';
    c.lineWidth = 0.8;
    c.beginPath();
    for (let i = 0; i < 8; i += 2) {
      const a = i * PI / 4 - PI / 2;
      c.moveTo(0, 18); c.lineTo(Math.cos(a) * 16, 18 + Math.sin(a) * 16);
    }
    c.stroke();
    U.ellipse(c, -4, 12, 2.4, 1.4, '#ffffff');
    c.restore();
  },

  ear(c, sd, ang, t) {
    const G = GUARD;
    c.save();
    c.translate(sd * 50, -338);
    c.scale(sd, 1);
    c.rotate(0.12 + ang);
    const og = c.createLinearGradient(0, -110, 0, 10);
    og.addColorStop(0, G.deep);
    og.addColorStop(0.5, G.mid);
    og.addColorStop(1, G.fur);
    c.beginPath();
    c.moveTo(-30, 10);
    c.quadraticCurveTo(-12, -60, 22, -110);
    c.quadraticCurveTo(48, -50, 40, 14);
    c.closePath();
    c.fillStyle = og;
    c.fill();

    const ig = c.createLinearGradient(0, -90, 0, 8);
    ig.addColorStop(0, G.inner[2]);
    ig.addColorStop(0.5, G.inner[1]);
    ig.addColorStop(1, G.inner[0]);
    c.beginPath();
    c.moveTo(-16, 4);
    c.quadraticCurveTo(-4, -50, 19, -88);
    c.quadraticCurveTo(33, -44, 27, 6);
    c.closePath();
    c.fillStyle = ig;
    c.fill();

    // Пушок внутри уха
    c.strokeStyle = 'rgba(240,230,255,0.75)';
    c.lineWidth = 1.3;
    for (let i = 0; i < 8; i++) {
      const x = -10 + i * 5;
      c.beginPath(); c.moveTo(x, 6); c.quadraticCurveTo(x + 2, -8, x + 6 + i, -18 - (i % 3) * 6); c.stroke();
    }
    c.strokeStyle = 'rgba(190,210,255,0.55)';
    c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(-28, 6); c.quadraticCurveTo(-11, -60, 21, -107); c.stroke();

    const a = 0.5 + 0.5 * Math.sin(t * 2 + sd);
    U.softEllipse(c, 22, -110, 15, 15, G.glow, 0.5 * a);
    gStar4(c, 22, -110, 4 + a * 2, '#ffffff');
    c.restore();
  },

  drawHead(c, S, hk) {
    const G = GUARD, PI = Math.PI, t = S.t;

    // Уши: дёргаются и отводятся назад от радости
    this.ear(c, -1, Math.sin(S.twL * 40) * S.twL * 0.6 + hk * 0.14, t);
    this.ear(c, 1, Math.sin(S.twR * 40) * S.twR * 0.6 + hk * 0.14, t);

    // Пушистые щёки
    for (const sd of [-1, 1]) {
      c.save();
      c.translate(sd * 72, -282);
      c.scale(sd, 1);
      c.beginPath();
      c.moveTo(-6, -26); c.lineTo(34, -14); c.lineTo(14, -8); c.lineTo(36, 6);
      c.lineTo(12, 6); c.lineTo(28, 22); c.lineTo(-6, 16);
      c.closePath();
      const tg = c.createLinearGradient(0, -20, 30, 20);
      tg.addColorStop(0, G.light);
      tg.addColorStop(1, '#6f78d6');
      c.fillStyle = tg;
      c.fill();
      c.restore();
    }

    // Голова
    const hg = c.createRadialGradient(-30, -345, 8, 0, -300, 105);
    hg.addColorStop(0, '#646bd2');
    hg.addColorStop(0.45, G.fur);
    hg.addColorStop(1, G.dark);
    gFluff(c, 0, -300, 86, 70, 16, 0.07);
    c.fillStyle = hg;
    c.fill();

    c.save();
    gFluff(c, 0, -300, 86, 70, 16, 0.07);
    c.clip();
    U.ellipse(c, 0, -338, 54, 26, 'rgba(20,20,70,0.55)');   // тёмная шапочка
    const mk = c.createRadialGradient(0, -262, 10, 0, -270, 70);
    mk.addColorStop(0, G.pale);
    mk.addColorStop(0.6, G.light);
    mk.addColorStop(1, 'rgba(174,185,255,0)');
    U.ellipse(c, 0, -266, 70, 48, mk);                       // светлая маска
    for (const sd of [-1, 1]) {
      U.ellipse(c, sd * 36, -297, 20, 8, 'rgba(228,233,255,0.55)', null, sd * 0.15);
      U.ellipse(c, sd * 31, -340, 11, 6, G.light, null, -sd * 0.35);   // брови
    }
    U.softEllipse(c, 0, -362, 60, 25, '210,220,255', 0.18);
    c.restore();
    gStrands(c, this.fur.head);
    c.strokeStyle = 'rgba(205,225,255,0.6)';
    c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, -300, 84, 68, 0, PI * 1.08, PI * 1.5); c.stroke();

    // Созвездие на лбу
    const p = 0.6 + 0.4 * Math.sin(t * 1.8);
    U.softEllipse(c, 0, -352, 24, 24, G.glow, 0.45 * p);
    c.strokeStyle = `rgba(${G.glow},${0.5 * p})`;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(0, -352); c.lineTo(-16, -368); c.lineTo(-30, -362);
    c.moveTo(0, -352); c.lineTo(16, -368); c.lineTo(30, -362);
    c.stroke();
    for (const [x, y] of [[-16, -368], [-30, -362], [16, -368], [30, -362]]) gStar4(c, x, y, 2.8, '#ffffff');
    gStar4(c, 0, -352, 8 + p * 2, '#ffffff');

    // Морда
    const mz = c.createRadialGradient(-10, -280, 4, 0, -262, 48);
    mz.addColorStop(0, '#ffffff');
    mz.addColorStop(0.5, G.pale);
    mz.addColorStop(1, '#a9b4f5');
    U.ellipse(c, 0, -260, 44, 33, mz);
    U.softEllipse(c, 0, -236, 36, 10, '60,70,160', 0.25);
    for (const sd of [-1, 1]) {
      for (let k = 0; k < 3; k++) U.ellipse(c, sd * (18 + k * 7), -262 + k * 4, 1.4, 1.4, 'rgba(80,90,170,0.55)');
    }
    c.strokeStyle = 'rgba(235,240,255,0.45)';
    c.lineWidth = 1;
    for (const sd of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        c.beginPath(); c.moveTo(sd * 30, -262 + k * 5); c.quadraticCurveTo(sd * 60, -268 + k * 6, sd * 94, -262 + k * 12); c.stroke();
      }
    }

    for (const sd of [-1, 1]) this.eye(c, sd, S, hk);
    this.mouth(c, S, hk);
    this.nose(c, S);
    if (hk > 0) for (const sd of [-1, 1]) U.softEllipse(c, sd * 54, -276, 15, 8, '255,120,200', 0.45 * hk);
  },

  eye(c, sd, S, hk) {
    const G = GUARD, w = 18, h = 15;
    c.save();
    c.translate(sd * 35, -313);
    c.rotate(-sd * 0.12);
    U.softEllipse(c, 0, 0, 30, 22, G.glow, 0.18);

    // Счастливые глаза — дуги
    if (hk > 0.15 && S.boop <= 0) {
      c.strokeStyle = G.deep;
      c.lineWidth = 4.5;
      c.beginPath(); c.moveTo(-15, 4); c.quadraticCurveTo(0, -13, 15, 4); c.stroke();
      c.restore();
      return;
    }

    const bl = S.blink > 0 ? Math.sin(S.blink / 0.16 * Math.PI) : 0;
    c.scale(1, Math.max(0.06, 1 - bl - S.boop * 0.55));
    const al = () => {
      c.beginPath();
      c.moveTo(-w, 2);
      c.bezierCurveTo(-w * 0.5, -h, w * 0.5, -h, w, -2);
      c.bezierCurveTo(w * 0.5, h * 0.9, -w * 0.5, h * 0.9, -w, 2);
      c.closePath();
    };
    al();
    c.fillStyle = '#0c0a2a';
    c.fill();

    c.save();
    al();
    c.clip();
    const lx = S.look.x, ly = S.look.y;
    const ig = c.createRadialGradient(lx - 3, ly - 4, 1, lx, ly, 14);
    ig.addColorStop(0, G.iris[0]);
    ig.addColorStop(0.3, G.iris[1]);
    ig.addColorStop(0.7, G.iris[2]);
    ig.addColorStop(1, G.iris[3]);
    U.ellipse(c, lx, ly, 13.5, 13.5, ig);
    c.strokeStyle = 'rgba(255,255,255,0.22)';
    c.lineWidth = 0.8;
    c.beginPath();
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2;
      c.moveTo(lx + Math.cos(a) * 6, ly + Math.sin(a) * 6);
      c.lineTo(lx + Math.cos(a) * 12, ly + Math.sin(a) * 12);
    }
    c.stroke();
    c.strokeStyle = 'rgba(20,10,60,0.7)';
    c.lineWidth = 1.4;
    c.beginPath(); c.arc(lx, ly, 13.3, 0, Math.PI * 2); c.stroke();
    U.ellipse(c, lx, ly, 5.6, 6.4, '#05030f');
    const sh = c.createLinearGradient(0, -h, 0, 2);
    sh.addColorStop(0, 'rgba(5,3,20,0.75)');
    sh.addColorStop(1, 'rgba(5,3,20,0)');
    c.fillStyle = sh;
    c.fillRect(-w, -h, w * 2, h + 2);
    U.ellipse(c, lx - 4, ly - 5, 3.6, 3, '#ffffff');
    U.ellipse(c, lx + 4, ly + 3.5, 1.6, 1.4, 'rgba(255,255,255,0.85)');
    gStar4(c, lx + 5, ly - 5, 1.8, 'rgba(255,255,255,0.9)');
    c.restore();

    // Линия века и ресничка
    c.strokeStyle = G.deep;
    c.lineWidth = 3.2;
    c.beginPath(); c.moveTo(-w, 2); c.bezierCurveTo(-w * 0.5, -h, w * 0.5, -h, w, -2); c.stroke();
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(sd * w, sd < 0 ? 2 : -2);
    c.quadraticCurveTo(sd * (w + 5), -4, sd * (w + 8), -9);
    c.stroke();
    c.restore();
  },

  mouth(c, S, hk) {
    c.strokeStyle = 'rgba(30,25,80,0.85)';
    c.lineWidth = 2.4;
    c.lineCap = 'round';
    if (hk > 0.15) {
      const ta = Math.sin(S.t * 6) * 1.5;
      c.beginPath();
      c.moveTo(-20, -258);
      c.quadraticCurveTo(-9, -253, 0, -262);
      c.quadraticCurveTo(9, -253, 20, -258);
      c.quadraticCurveTo(12, -232, 0, -230);
      c.quadraticCurveTo(-12, -232, -20, -258);
      c.closePath();
      c.fillStyle = '#2a0b30';
      c.fill();
      c.stroke();
      const tg = c.createLinearGradient(0, -248, 0, -218);
      tg.addColorStop(0, '#ff9ed2');
      tg.addColorStop(1, '#e0478f');
      c.beginPath();
      c.moveTo(-11, -244);
      c.quadraticCurveTo(-13, -220 + ta, 0, -218 + ta);
      c.quadraticCurveTo(13, -220 + ta, 11, -244);
      c.closePath();
      c.fillStyle = tg;
      c.fill();
      c.strokeStyle = 'rgba(120,20,70,0.7)';
      c.lineWidth = 1.4;
      c.stroke();
      c.beginPath(); c.moveTo(0, -242); c.lineTo(0, -226 + ta); c.stroke();
      U.ellipse(c, -5, -238, 2.5, 1.4, 'rgba(255,255,255,0.5)');
      c.strokeStyle = 'rgba(30,25,80,0.85)';
      c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(0, -274); c.lineTo(0, -262); c.stroke();
    } else {
      c.beginPath();
      c.moveTo(0, -274); c.lineTo(0, -262);
      c.moveTo(-20, -257); c.quadraticCurveTo(-9, -252, 0, -262); c.quadraticCurveTo(9, -252, 20, -257);
      c.stroke();
    }
  },

  nose(c, S) {
    const b = S.boop;
    c.save();
    c.translate(0, -286);
    c.scale(1 + b * 0.18, 1 - b * 0.18);
    c.beginPath();
    c.moveTo(0, 13);
    c.bezierCurveTo(-10, 11, -18, 3, -17, -4);
    c.bezierCurveTo(-16, -11, -6, -12, 0, -10);
    c.bezierCurveTo(6, -12, 16, -11, 17, -4);
    c.bezierCurveTo(18, 3, 10, 11, 0, 13);
    const ng = c.createRadialGradient(-5, -6, 1, 0, 0, 20);
    ng.addColorStop(0, '#5d5880');
    ng.addColorStop(0.55, '#1a1630');
    ng.addColorStop(1, '#070614');
    c.fillStyle = ng;
    c.fill();
    U.ellipse(c, -7, 2, 3.6, 2.2, '#000000', null, 0.4);
    U.ellipse(c, 7, 2, 3.6, 2.2, '#000000', null, -0.4);
    U.ellipse(c, -4, -6, 6, 2.6, 'rgba(255,255,255,0.75)', null, -0.15);
    U.ellipse(c, 6, -5, 2, 1.2, 'rgba(255,255,255,0.4)');
    c.restore();
  },
  addStyle() {
    const s = document.createElement('style');
    s.textContent = `
#starBtn{position:fixed;top:130px;left:12px;z-index:11;display:none;place-items:center;width:46px;height:46px;border:3px solid #f2b638;border-radius:50%;background:radial-gradient(circle at 35% 30%,#b197fc,#3b1f8c);box-shadow:0 4px 0 #8a5a12,0 8px 14px rgba(0,0,0,.35),0 0 14px rgba(180,150,255,.7)}
#starBtn svg{width:26px;height:26px}
#starBtn:active{transform:translateY(3px)}
.w-star .wc-art{background:radial-gradient(circle at 50% 42%,#fffdf5 0 10px,rgba(255,255,255,.4) 13px,rgba(255,255,255,0) 24px),linear-gradient(#05051a,#3b1a6e 60%,#b0477a)}
#sanctum{position:fixed;inset:0;z-index:85;display:none;background:#05051a;touch-action:none;user-select:none}
#sanctum.show{display:block;animation:sgIn .7s ease}
@keyframes sgIn{from{opacity:0;transform:scale(1.08)}to{opacity:1;transform:none}}
.sg-cv{position:absolute;inset:0;display:block;width:100%;height:100%}
.sg-back{position:absolute;top:18px;left:12px;display:grid;place-items:center;width:46px;height:46px;border:3px solid #f2b638;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9775fa,#3b1f8c);box-shadow:0 4px 0 #8a5a12,0 8px 14px rgba(0,0,0,.4)}
.sg-back svg{width:24px;height:24px}
.sg-back:active{transform:translateY(3px)}
.sg-coins{position:absolute;top:18px;right:12px;display:flex;align-items:center;gap:6px;height:42px;padding:0 14px 0 4px;border:3px solid #f2b638;border-radius:21px;background:linear-gradient(#3b2a7a,#1a1145);box-shadow:0 4px 0 #8a5a12,inset 0 2px 0 rgba(255,255,255,.2);font:900 18px/1 'Nunito',system-ui,sans-serif;color:#fff6cf}
.sg-coins svg{width:32px;height:32px}
.sg-plate{position:absolute;top:74px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 22px 9px;border:3px solid #f2b638;border-radius:18px;background:linear-gradient(rgba(60,40,140,.85),rgba(20,12,60,.85));box-shadow:0 0 0 3px #2e1470,0 6px 16px rgba(0,0,0,.5);white-space:nowrap;pointer-events:none}
.sg-plate small{font:900 10px/1 'Nunito',system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#c9b8ff}
.sg-plate b{font:400 24px/1 'Lilita One','Arial Black',sans-serif;letter-spacing:.5px;color:#ffe066;-webkit-text-stroke:1px #2e1470;text-shadow:0 3px 0 #2e1470,0 0 16px rgba(255,210,80,.6)}
.sg-lv{padding:3px 10px;border-radius:10px;background:rgba(127,243,255,.18);font:800 12px/1 'Nunito',system-ui,sans-serif;color:#9ff7ff}
.sg-hint{position:absolute;left:0;right:0;bottom:104px;width:max-content;max-width:92vw;margin:0 auto;padding:6px 14px;border-radius:14px;background:rgba(10,5,40,.6);font:800 13px/1.2 'Nunito',system-ui,sans-serif;color:#e4e9ff;text-align:center;pointer-events:none;transition:opacity .6s;animation:floaty 2.4s ease-in-out infinite}
.sg-hint.off{opacity:0}
.sg-up{position:absolute;left:0;right:0;bottom:16px;width:max-content;min-width:230px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 20px 8px;border:3px solid #5f3dc4;border-radius:22px;background:linear-gradient(#e5dbff,#9775fa 45%,#6741d9);box-shadow:0 5px 0 #3b1f8c,0 0 18px rgba(180,150,255,.6),inset 0 3px 0 rgba(255,255,255,.55);color:#fff;font:900 18px/1 'Nunito',system-ui,sans-serif;text-shadow:0 2px 0 #3b1f8c}
.sg-up:active{transform:translateY(4px);box-shadow:0 1px 0 #3b1f8c,inset 0 3px 0 rgba(255,255,255,.55)}
.sg-up-c{display:flex;align-items:center;gap:4px;padding:2px 10px 2px 2px;border-radius:12px;background:rgba(30,10,80,.4);font-size:15px}
.sg-up-c svg{width:20px;height:20px}
.sg-up small{font:800 11px/1 'Nunito',system-ui,sans-serif;color:#f3f0ff;text-shadow:none}
.sg-up.poor{filter:grayscale(.6) brightness(.85)}
.sg-up.shake{animation:shake .35s}`;
    document.head.appendChild(s);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Sanctum.init();

  // Пока игрок в храме, ролики других миров ждут
  if (typeof Cutscene !== 'undefined') {
    const watch = Cutscene.watch;
    Cutscene.watch = function () {
      if (Sanctum.visible) return;
      return watch.call(this);
    };
  }
});

  
