// Анимация новой породы: тёмный силуэт со знаком «?», вспышка, конфетти.
// Каждая порода показывается так один раз
const Reveal = {
  active: false,
  revealed: false,
  seen: new Set(),

  init() {
    const $ = id => document.getElementById(id);
    this.el = $('reveal');
    this.cv = $('revealDog');
    this.unlockEl = $('unlock');
    this.off = document.createElement('canvas');   // здесь собака рисуется перед превращением в силуэт

    // Холст на весь экран для конфетти
    this.fx = document.createElement('canvas');
    this.fx.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    this.el.appendChild(this.fx);

    $('revealOk').addEventListener('click', () => this.close());
    this.load();

    // Собаку, которую уже показал экран «Новый мир открыт!», второй раз не показываем
    const showUnlock = World.showUnlock;
    World.showUnlock = function (i, first) {
      Reveal.mark(WORLDS[i].min);
      return showUnlock.call(this, i, first);
    };

    // «Начать заново» стирает и открытые породы
    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      Reveal.seen = new Set([1]);
      Reveal.save();
    };

    setInterval(() => this.watch(), 300);
  },

  // При первом запуске этой версии уже полученные породы считаются открытыми
  load() {
    let list = null;
    try { list = JSON.parse(localStorage.getItem('dogevo_seen')); } catch (e) { list = null; }
    if (!Array.isArray(list)) list = this.seedList();
    this.seen = new Set(list);
    this.save();
  },

  seedList() {
    const s = new Set([1]);
    for (let l = 1; l <= game.best; l++) s.add(l);
    WORLDS.forEach((w, i) => {
      try { (JSON.parse(localStorage.getItem(World.keyFor(i, 'dogs'))) || []).forEach(d => s.add(d.l)); } catch (e) {}
    });
    game.dogs.forEach(d => s.add(d.level));
    return [...s];
  },

  save() { localStorage.setItem('dogevo_seen', JSON.stringify([...this.seen])); },

  mark(l) {
    if (this.seen.has(l)) return;
    this.seen.add(l);
    this.save();
  },

  // Сколько пород открыто (считаются только те, что уже есть в игре)
  count() { return [...this.seen].filter(l => DOG_LEVELS[l]).length; },

  // Ищем на поле собаку, которую игрок ещё не видел
  watch() {
    if (this.active) return;
    if (typeof Menu !== 'undefined' && Menu.visible) return;
    if (this.unlockEl.classList.contains('show')) return;
    const d = game.dogs.find(d => DOG_LEVELS[d.level] && !this.seen.has(d.level));
    if (d) { this.mark(d.level); this.show(d.level); }
  },

  show(level) {
    const info = DOG_LEVELS[level];
    const w = WORLDS.find(w => level >= w.min && level <= w.max) || WORLDS[0];
    document.getElementById('revealLvl').textContent = 'Уровень ' + level;
    document.getElementById('revealName').textContent = info.name;
    document.getElementById('revealWorld').textContent = `${w.icon} ${w.name}`;
    document.getElementById('revealCoin').textContent = '+' + info.coin.toLocaleString('ru-RU');

    this.dog = new Dog(0, 0, level);
    this.dog.spawnT = 1;
    this.t = 0;
    this.revealed = false;
    this.parts = [];
    this.active = true;
    this.beat = 0;
    this.el.classList.remove('revealed');
    this.el.classList.add('show');
    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  loop(now) {
    if (!this.active) return;
    const dt = U.clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.t += dt;

    const d = this.dog;
    d.animate(dt);

    // До вспышки звучат нарастающие удары
    if (!this.revealed && this.t > this.beat * 0.45 && this.beat < 4) {
      if (typeof Sound !== 'undefined') Sound.tone(220 + this.beat * 70, 0.12, { type: 'triangle', vol: 0.25 });
      this.beat++;
    }
    if (!this.revealed && this.t >= 1.8) this.burst();
    if (this.revealed && d.jump <= 0 && Math.random() < dt * 0.7) { d.jump = 1; d.happy = 1.5; }

    for (const p of this.parts) {
      p.life += dt;
      p.vy += p.g * dt;
      p.vx *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    this.parts = this.parts.filter(p => p.life < p.max);

    this.draw();
    this.drawFx();
    requestAnimationFrame(t => this.loop(t));
  },

  draw() {
    const cv = this.cv, off = this.off, dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = off.width = Math.round(W * dpr);
      cv.height = off.height = Math.round(H * dpr);
    }
    const c = cv.getContext('2d'), o = off.getContext('2d');
    const d = this.dog, L = d.info;

    // До вспышки силуэт растёт и всё сильнее дрожит
    const pre = Math.min(1, this.t / 1.8);
    const grow = this.revealed ? 1 : 0.45 + 0.55 * (1 - Math.pow(1 - pre, 3));
    const shake = this.revealed ? 0 : Math.sin(this.t * 45) * pre * pre * 4;

    // Собака на отдельном холсте
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, off.width, off.height);
    const dogH = (18 * L.legLen + 64 + (L.crown ? 16 : 0)) * d.size;
    const k = Math.min((H - 20) / dogH, (W - 30) / (100 * L.bodyLen * d.size)) * grow;
    o.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    d.x = (W / 2 + shake) / k - 4;
    d.y = (H - 14) / k;
    d.draw(o);

    // Силуэт: всё нарисованное закрашивается тёмным
    if (!this.revealed) {
      o.setTransform(1, 0, 0, 1, 0, 0);
      o.globalCompositeOperation = 'source-atop';
      o.fillStyle = '#2a160a';
      o.fillRect(0, 0, off.width, off.height);
      o.globalCompositeOperation = 'source-over';
    }

    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);

    // Сияние за собакой пульсирует
    const pulse = this.revealed ? 1 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(this.t * 9)) * pre;
    const gl = c.createRadialGradient(W / 2, H * 0.55, 5, W / 2, H * 0.55, W * 0.5);
    gl.addColorStop(0, `rgba(255,240,170,${0.15 + 0.55 * pulse})`);
    gl.addColorStop(1, 'rgba(255,240,170,0)');
    c.fillStyle = gl;
    c.fillRect(0, 0, W, H);
    U.softEllipse(c, W / 2, H - 12, W * 0.3 * grow, 10, '40,20,5', 0.5);

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(off, 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Знак вопроса над силуэтом
    if (!this.revealed) {
      const qy = H * 0.42 + Math.sin(this.t * 5) * 4;
      c.font = `${Math.round(52 * grow)}px 'Lilita One', 'Arial Black', sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.lineJoin = 'round';
      c.lineWidth = 7;
      c.strokeStyle = '#4a230a';
      c.strokeText('?', W / 2 + shake, qy);
      c.fillStyle = '#ffe066';
      c.fillText('?', W / 2 + shake, qy);
    }
  },

  // Конфетти и звёзды на весь экран
  drawFx() {
    const fx = this.fx, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    if (fx.width !== Math.round(W * dpr) || fx.height !== Math.round(H * dpr)) {
      fx.width = Math.round(W * dpr);
      fx.height = Math.round(H * dpr);
    }
    const c = fx.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    for (const p of this.parts) {
      c.globalAlpha = Math.min(1, (1 - p.life / p.max) * 2);
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      if (p.star) {
        const z = p.w;
        c.fillStyle = '#fff3a0';
        c.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? z * 0.42 : z, a = i * Math.PI / 5 - Math.PI / 2;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath();
        c.fill();
      } else {
        // Конфетти "переворачивается": ширина меняется со временем
        c.scale(Math.cos(p.life * p.flip), 1);
        c.fillStyle = p.c;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      c.restore();
    }
    c.globalAlpha = 1;
  },

  burst() {
    this.revealed = true;
    this.el.classList.add('revealed');
    const d = this.dog;
    d.jump = 1;
    d.happy = 2;

    const r = this.cv.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.55;
    const cols = ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#cc5de8', '#ff922b', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      const a = U.rand(0, Math.PI * 2), sp = U.rand(150, 420);
      this.parts.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 160, g: 420,
        rot: U.rand(0, 6), vr: U.rand(-10, 10), flip: U.rand(6, 14),
        c: cols[i % cols.length], w: U.rand(5, 9), h: U.rand(9, 14),
        life: 0, max: U.rand(1.6, 2.8), star: i % 6 === 0
      });
    }

    if (typeof Sound !== 'undefined') {
      [523, 659, 784, 1047, 1319].forEach((f, i) => Sound.tone(f, 0.3, { type: 'triangle', vol: 0.28, delay: i * 0.08 }));
      Sound.tone(2093, 0.6, { vol: 0.1, delay: 0.4 });
    }
    if (typeof Settings !== 'undefined') Settings.vibrate([40, 30, 90]);
  },

  close() {
    if (!this.revealed) return;   // кнопка работает только после вспышки
    this.active = false;
    this.parts = [];
    this.el.classList.remove('show', 'revealed');
    const c = this.fx.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.fx.width, this.fx.height);
  }
};

// Запуск после worlds.js, когда миры уже загружены
document.addEventListener('DOMContentLoaded', () => Reveal.init());
