// Сюжетные ролики: у каждого мира свой.
// Ролик показывается один раз при первом входе в мир.
// Пересмотреть можно в настройках, строка «Сюжет»

const csEase = t => { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

const Cutscene = {
  active: false,
  seen: [],
  scripts: {},

  init() {
    try { this.seen = JSON.parse(localStorage.getItem('dogevo_cs')) || []; } catch (e) { this.seen = []; }
    this.addStyle();
    this.build();
    this.hook();
    this.addReplay();
    setInterval(() => this.watch(), 400);
  },

  // ---------- Оформление ----------
  addStyle() {
    const s = document.createElement('style');
    s.textContent = `
#cutscene{position:fixed;inset:0;z-index:120;display:none;overflow:hidden;background:#000;touch-action:none;user-select:none}
#cutscene.show{display:block}
.cs-canvas{position:absolute;inset:0;display:block;width:100%;height:100%}
.cs-bar{position:absolute;left:0;right:0;z-index:2;height:13vh;background:#000;transition:transform .8s cubic-bezier(.3,1,.4,1)}
.cs-top{top:0;display:flex;align-items:center;justify-content:flex-end;padding:0 12px;transform:translateY(-100%)}
.cs-bottom{bottom:0;display:flex;align-items:center;justify-content:center;padding:0 22px;transform:translateY(100%)}
#cutscene.bars .cs-bar{transform:none}
.cs-sub{max-width:520px;font:800 17px/1.35 'Nunito',system-ui,sans-serif;color:#fff;text-align:center;text-shadow:0 2px 6px rgba(0,0,0,.8)}
.cs-skip{padding:7px 14px;border:2px solid rgba(255,255,255,.6);border-radius:16px;background:rgba(255,255,255,.12);color:#fff;font:800 14px/1 'Nunito',system-ui,sans-serif}
.cs-skip:active{transform:scale(.94)}
.cs-title{position:absolute;left:0;right:0;top:30%;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;pointer-events:none}
#cutscene.titled .cs-title{animation:csTitle 3.9s ease forwards}
@keyframes csTitle{0%{opacity:0;transform:scale(1.5)}14%{opacity:1;transform:scale(1)}82%{opacity:1;transform:scale(1.03)}100%{opacity:0;transform:scale(1.06)}}
.cs-chapter{padding:7px 22px;border:2px solid #fff;border-radius:8px;background:linear-gradient(#ff6b6b,#e03131 55%,#c92a2a);box-shadow:0 4px 0 #8f1d1d,0 8px 14px rgba(0,0,0,.4);font:900 14px/1 'Nunito',system-ui,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 0 #8f1d1d}
.cs-name{font:400 clamp(40px,13vw,64px)/1 'Lilita One','Arial Black',sans-serif;letter-spacing:1px;text-align:center;color:#ffe066;-webkit-text-stroke:2px #4a230a;text-shadow:0 5px 0 #4a230a,0 10px 18px rgba(0,0,0,.55),0 0 30px rgba(255,210,80,.7)}
.cs-line{width:0;height:3px;border-radius:2px;background:linear-gradient(90deg,transparent,#fff3a0,transparent)}
#cutscene.titled .cs-line{animation:csLine 1s .35s ease-out forwards}
@keyframes csLine{to{width:min(70vw,300px)}}
#cutscene.w-winter .cs-chapter{background:linear-gradient(#74c0fc,#1c7ed6 55%,#1864ab);box-shadow:0 4px 0 #0b4f94,0 8px 14px rgba(0,0,0,.4);text-shadow:0 2px 0 #0b4f94}
#cutscene.w-winter .cs-name{color:#fff;-webkit-text-stroke:2px #0e3b6e;text-shadow:0 5px 0 #0e3b6e,0 10px 18px rgba(0,0,0,.5),0 0 30px rgba(150,210,255,.95)}
#cutscene.w-winter .cs-line{background:linear-gradient(90deg,transparent,#d0ebff,transparent)}
.ico-movie{background:radial-gradient(circle at 35% 30%,#ffa8a8,#f03e3e 55%,#a51e1e)}
.cs-replay{display:flex;gap:6px}
.cs-rbtn{width:42px;height:42px;border:3px solid #fff;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c0,#ffcf3a 45%,#e08e00);box-shadow:0 3px 0 #b9781c;font-size:20px;line-height:1}
.cs-rbtn:active{transform:translateY(2px);box-shadow:0 1px 0 #b9781c}`;
    document.head.appendChild(s);
  },

  build() {
    const el = document.createElement('div');
    el.id = 'cutscene';
    el.innerHTML =
      '<canvas class="cs-canvas"></canvas>' +
      '<div class="cs-bar cs-top"><button class="cs-skip">Пропустить ⏭</button></div>' +
      '<div class="cs-bar cs-bottom"><div class="cs-sub"></div></div>' +
      '<div class="cs-title"><div class="cs-chapter"></div><div class="cs-name"></div><div class="cs-line"></div></div>';
    document.body.appendChild(el);
    this.el = el;
    this.cv = el.querySelector('.cs-canvas');
    this.ctx = this.cv.getContext('2d');
    this.subEl = el.querySelector('.cs-sub');
    this.chEl = el.querySelector('.cs-chapter');
    this.nameEl = el.querySelector('.cs-name');
    el.querySelector('.cs-skip').addEventListener('click', e => { e.stopPropagation(); this.skip(); });
  },

  // Пока идёт ролик, экран новой породы и плашки достижений ждут
  hook() {
    const C = this;
    if (typeof Reveal !== 'undefined') {
      const watch = Reveal.watch;
      Reveal.watch = function () { if (C.active) return; return watch.call(this); };
    }
    if (typeof Ach !== 'undefined') {
      const pump = Ach.pump;
      Ach.pump = function () { if (C.active) return; return pump.call(this); };
    }
    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      C.seen = [];
      localStorage.removeItem('dogevo_cs');
    };
  },

  // Строка «Сюжет» в настройках с кнопкой для каждого мира
  addReplay() {
    const list = document.querySelector('#settings .set-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML =
      '<span class="set-ico ico-movie"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2.5" fill="#fff"/><path d="M16 10.5l5-3v9l-5-3z" fill="#fff"/></svg></span>' +
      '<span class="set-text"><b>Сюжет</b><small>посмотреть ролик мира</small></span>' +
      '<span class="cs-replay"></span>';
    const box = row.querySelector('.cs-replay');
    WORLDS.forEach((w, i) => {
      if (!this.scripts[i]) return;
      const b = document.createElement('button');
      b.className = 'cs-rbtn';
      b.textContent = w.icon;
      b.setAttribute('aria-label', w.name);
      b.addEventListener('click', () => {
        if (!World.isOpen(i)) { game.toast('Мир ещё закрыт', w.name); return; }
        Settings.close();
        this.play(i);
      });
      box.appendChild(b);
    });
    list.appendChild(row);
  },

  // Ролик запускается сам, когда игрок первый раз попадает в мир
  watch() {
    if (this.active) return;
    if (typeof Menu !== 'undefined' && Menu.visible) return;
    if (typeof Reveal !== 'undefined' && Reveal.active) return;
    const un = document.getElementById('unlock');
    if (un && un.classList.contains('show')) return;
    const i = World.index;
    if (this.scripts[i] && !this.seen.includes(i)) this.play(i);
  },

  // ---------- Запуск и цикл ----------
  play(i) {
    if (this.active || !this.scripts[i]) return;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.w * this.dpr);
    this.cv.height = Math.round(this.h * this.dpr);
    this.world = i;
    this.T = 0;
    this.endAt = 99;
    this.closing = false;
    this.parts = [];
    this.flakes = [];
    this.snowK = 0;
    this.snowAcc = 0;
    this.white = 0;
    this.shake = 0;
    this.done = {};
    this.fields = {};
    this.scene = null;
    this.setSub('');
    this.el.className = 'show w-' + WORLDS[i].id;
    this.active = true;
    this.scripts[i].start.call(this);
    void this.el.offsetWidth;          // чтобы полосы выехали с анимацией
    this.el.classList.add('bars');
    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  loop(now) {
    if (!this.active) return;
    const dt = U.clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.T += dt;
    this.cueI = 0;
    try {
      this.scripts[this.world].update.call(this, dt);
      if (this.scene && this.scene.field) this.scene.field.update(dt);
      for (const p of this.parts) p.update(dt);
      this.parts = this.parts.filter(p => !p.done);
      this.updateFlakes(dt);
      this.shake = Math.max(0, this.shake - dt);
      this.render();
      this.typeSub(dt);
    } catch (e) {
      this.finish();
      setTimeout(() => { throw e; });
      return;
    }
    if (this.T >= this.endAt && !this.closing) {
      this.closing = true;
      this.el.classList.remove('bars');
    }
    if (this.T >= this.endAt + 0.65) { this.finish(); return; }
    requestAnimationFrame(t => this.loop(t));
  },

  skip() {
    if (!this.active) return;
    if (this.T < this.endAt) this.endAt = this.T;
    this.setSub('');
  },

  finish() {
    this.active = false;
    this.el.className = '';
    this.scene = null;
    this.fields = {};
    this.parts = [];
    this.flakes = [];
    if (!this.seen.includes(this.world)) {
      this.seen.push(this.world);
      localStorage.setItem('dogevo_cs', JSON.stringify(this.seen));
    }
  },

  // ---------- Помощники для сценария ----------
  // Событие срабатывает один раз, когда время ролика доходит до t
  at(t, fn) {
    const k = this.cueI++;
    if (this.T >= t && !this.done[k]) { this.done[k] = true; fn(); }
  },

  // Плавное значение от 0 до 1 между моментами a и b
  seg(a, b) { return csEase((this.T - a) / (b - a)); },

  // Камера по ключевым точкам: [время, x, y, масштаб]
  camPath(keys) {
    const T = this.T;
    if (T <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
    for (let i = 1; i < keys.length; i++) {
      const [t0, x0, y0, s0] = keys[i - 1], [t1, x1, y1, s1] = keys[i];
      if (T <= t1) {
        const k = csEase((T - t0) / (t1 - t0));
        return { x: U.lerp(x0, x1, k), y: U.lerp(y0, y1, k), s: U.lerp(s0, s1, k) };
      }
    }
    const l = keys[keys.length - 1];
    return { x: l[1], y: l[2], s: l[3] };
  },

  // Камера не выходит за края мира
  clampCam(c) {
    const s = Math.max(1, c.s), hw = this.w / (2 * s), hh = this.h / (2 * s);
    return { s, x: U.clamp(c.x, hw, this.w - hw), y: U.clamp(c.y, hh, this.h - hh) };
  },

  // Отдельное поле для ролика, игровое поле не трогается
  field(i) {
    if (!this.fields[i]) {
      const prev = U.shadowRGB;
      U.shadowRGB = WORLDS[i].shadow;
      const f = new WORLDS[i].Field();
      f.resize(this.w, this.h, this.dpr);
      U.shadowRGB = prev;
      this.fields[i] = f;
    }
    return this.fields[i];
  },

  makeDog(x, y, level) {
    const d = new Dog(x, y, level);
    d.spawnT = 1;
    return d;
  },

  // Идёт к tx. Возвращает true, если собака стоит на месте
  stepDog(d, dt, tx, speed) {
    d.animate(dt);
    if (tx === undefined || Math.abs(tx - d.x) < 2) {
      if (d.state === 'walk') d.state = 'idle';
      d.walkT = U.lerp(d.walkT, Math.round(d.walkT / Math.PI) * Math.PI, dt * 10);
      return true;
    }
    d.state = 'walk';
    d.dir = tx > d.x ? 1 : -1;
    d.x += Math.sign(tx - d.x) * Math.min(speed * dt, Math.abs(tx - d.x));
    d.walkT += dt * 10 / Math.sqrt(d.info.legLen);
    return false;
  },

  fx(type, x, y, n, spread = 20) {
    for (let i = 0; i < n; i++) {
      this.parts.push(new Particle(x + U.rand(-spread, spread), y - (type === 'dust' ? U.rand(0, 8) : 0), type));
    }
  },

  snd(f, d, o) { if (typeof Sound !== 'undefined') Sound.tone(f, d, o || {}); },

  melody(notes, o, gap) {
    notes.forEach((f, i) => this.snd(f, o.dur || 0.25, Object.assign({}, o, { delay: (o.delay || 0) + i * gap })));
  },

  setSub(t) { this.subText = t; this.subN = 0; this.subShown = -1; },

  // Субтитры печатаются по буквам
  typeSub(dt) {
    if (this.subN < this.subText.length) this.subN += dt * 30;
    const n = Math.min(this.subText.length, Math.floor(this.subN));
    if (n !== this.subShown) { this.subShown = n; this.subEl.textContent = this.subText.slice(0, n); }
  },

  title(ch, name) {
    this.setSub('');
    this.chEl.textContent = ch;
    this.nameEl.textContent = name;
    this.el.classList.remove('titled');
    void this.el.offsetWidth;
    this.el.classList.add('titled');
  },

  // ---------- Рисование ----------
  render() {
    const c = this.ctx, w = this.w, h = this.h, sc = this.scene;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#000';
    c.fillRect(0, 0, w, h);

    if (sc) {
      const prev = U.shadowRGB;
      U.shadowRGB = WORLDS[sc.wi].shadow;
      const sh = this.shake * 10;
      const cam = this.clampCam({
        x: sc.cam.x + Math.sin(this.T * 70) * sh,
        y: sc.cam.y + Math.cos(this.T * 55) * sh,
        s: sc.cam.s
      });
      c.save();
      c.translate(w / 2, h / 2);
      c.scale(cam.s, cam.s);
      c.translate(-cam.x, -cam.y);
      this.drawWorld(c, sc.field, sc.skyFx);
      [sc.field.house, ...sc.objs].sort((a, b) => a.y - b.y).forEach(o => o.draw(c));
      if (sc.world) sc.world(c);
      sc.field.drawOverlay(c);
      for (const p of this.parts) p.draw(c);
      c.restore();
      U.shadowRGB = prev;
      if (sc.screen) sc.screen(c);
    }

    // Затемнение в начале и в конце
    let fa = 1 - U.clamp(this.T / 0.7, 0, 1);
    if (this.T >= this.endAt) fa = Math.max(fa, U.clamp((this.T - this.endAt) / 0.6, 0, 1));
    if (fa > 0) {
      c.globalAlpha = fa;
      c.fillStyle = '#000';
      c.fillRect(0, 0, w, h);
      c.globalAlpha = 1;
    }
  },

  // То же, что Field.drawBack, но с местом для эффектов на небе
  drawWorld(c, f, skyFx) {
    const a = f.area;
    c.drawImage(f.sky, 0, 0, f.w, a.y);
    for (const cl of f.clouds) {
      const sp = f.cloudSprites[cl.k];
      c.drawImage(sp.c, cl.x, cl.y, sp.w * cl.s, sp.h * cl.s);
    }
    if (skyFx) skyFx(c);
    c.drawImage(f.land, 0, 0, f.w, a.y + 10);
    for (const t of f.trees) {
      const sway = Math.sin(f.t * (t.far ? 0.8 : 1.1) + t.phase) * (t.far ? 0.008 : 0.015);
      c.save();
      c.translate(t.x, t.y);
      c.rotate(sway);
      c.drawImage(t.c, -t.ox, -t.oy, t.w, t.h);
      c.restore();
    }
    c.drawImage(f.near, 0, 0, f.w, f.h);
    f.drawWater(c);
  },

  // Стая птиц над лугом
  birds(c) {
    c.lineCap = 'round';
    c.lineWidth = 1.4;
    c.strokeStyle = 'rgba(40,50,70,0.75)';
    for (let i = 0; i < 6; i++) {
      const x = ((this.T * 38 + i * 23 + (i % 2) * 14) % (this.w + 160)) - 80;
      const y = 26 + i * 7 + Math.sin(this.T * 1.5 + i) * 4;
      const fl = Math.sin(this.T * 9 + i * 1.3) * 3;
      c.beginPath();
      c.moveTo(x - 6, y - fl);
      c.quadraticCurveTo(x - 3, y - 2 - fl * 0.3, x, y);
      c.quadraticCurveTo(x + 3, y - 2 - fl * 0.3, x + 6, y - fl);
      c.stroke();
    }
  },

  // Тёплый рассветный свет, который постепенно уходит
  sunrise(c) {
    const k = 1 - this.seg(0.5, 5.5);
    if (k <= 0) return;
    const g = c.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, `rgba(255,120,50,${0.45 * k})`);
    g.addColorStop(0.5, `rgba(255,170,90,${0.22 * k})`);
    g.addColorStop(1, `rgba(120,60,90,${0.25 * k})`);
    c.fillStyle = g;
    c.fillRect(0, 0, this.w, this.h);
  },

  // Первая снежинка
  drawFlake(c) {
    const fl = this.flake;
    if (!fl) return;
    const z = 7;
    U.softEllipse(c, fl.x, fl.y, z * 3, z * 3, '200,235,255', 0.6);
    c.save();
    c.translate(fl.x, fl.y);
    c.rotate(this.T * 0.8);
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      c.rotate(Math.PI / 3);
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(0, -z);
      c.moveTo(0, -z * 0.55); c.lineTo(-z * 0.3, -z * 0.8);
      c.moveTo(0, -z * 0.55); c.lineTo(z * 0.3, -z * 0.8);
      c.stroke();
    }
    c.restore();
  },

  // Снег и метель поверх кадра
  updateFlakes(dt) {
    this.snowAcc += dt * (this.snowK > 0 ? 12 + 330 * this.snowK : 0);
    while (this.snowAcc >= 1 && this.flakes.length < 450) {
      this.snowAcc -= 1;
      const k = this.snowK;
      this.flakes.push({
        x: U.rand(-this.w * 0.7, this.w), y: U.rand(-30, -5),
        vx: U.rand(20, 50) + k * 420, vy: U.rand(45, 80) + k * 140, r: U.rand(1.2, 3.4)
      });
    }
    if (this.snowAcc > 1) this.snowAcc = 0;
    for (const f of this.flakes) { f.x += f.vx * dt; f.y += f.vy * dt; }
    this.flakes = this.flakes.filter(f => f.y < this.h + 20 && f.x < this.w + 40);
  },

  drawSnowScreen(c) {
    // Сумерки в долине, чтобы было видно северное сияние
    if (this.scene && this.scene.wi === 1) {
      const k = this.seg(9.6, 12.5) * 0.16;
      if (k > 0) { c.fillStyle = `rgba(30,40,110,${k})`; c.fillRect(0, 0, this.w, this.h); }
    }
    c.lineCap = 'round';
    for (const f of this.flakes) {
      if (f.vx > 160) {
        c.strokeStyle = 'rgba(255,255,255,0.85)';
        c.lineWidth = f.r;
        c.beginPath();
        c.moveTo(f.x, f.y);
        c.lineTo(f.x - f.vx * 0.035, f.y - f.vy * 0.035);
        c.stroke();
      } else {
        U.ellipse(c, f.x, f.y, f.r, f.r, 'rgba(255,255,255,0.92)');
      }
    }
    if (this.white > 0) {
      c.fillStyle = `rgba(240,248,255,${this.white})`;
      c.fillRect(0, 0, this.w, this.h);
    }
  },

  // Полоски северного сияния: одна вертикальная полоса на каждый цвет
  auroraSprites() {
    return [[90, 255, 170], [80, 200, 255], [200, 120, 255]].map(([r, g, b]) => {
      const cv = document.createElement('canvas');
      cv.width = 4;
      cv.height = 64;
      const x = cv.getContext('2d');
      const gr = x.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gr.addColorStop(0.75, `rgba(${r},${g},${b},0.45)`);
      gr.addColorStop(0.9, `rgba(${r},${g},${b},0.6)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr;
      x.fillRect(0, 0, 4, 64);
      return cv;
    });
  },

  // Сумеречное небо, звёзды и сияние
  aurora(c) {
    const k = this.seg(9.6, 12.5);
    if (k <= 0) return;
    const T = this.T, f = this.scene.field;
    c.fillStyle = `rgba(18,28,75,${0.55 * k})`;
    c.fillRect(0, 0, this.w, f.area.y);
    for (const s of this.stars) {
      U.ellipse(c, s.x, s.y, s.s, s.s, `rgba(255,255,255,${k * (0.45 + 0.4 * Math.sin(T * 3 + s.ph))})`);
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = k * 0.9;
    this.spr.forEach((spr, i) => {
      for (let x = -6; x < this.w + 6; x += 5) {
        const y = 2 + i * 13 + Math.sin(x * 0.013 + T * 0.7 + i * 2) * 10 + Math.sin(x * 0.04 - T * 1.3 + i) * 4;
        const len = 44 + Math.sin(x * 0.021 + T * 1.1 + i * 3) * 16;
        c.drawImage(spr, x, y, 6, len);
      }
    });
    c.restore();
  }
};

// ================= ГЛАВА 1: ЗЕЛЁНЫЙ ЛУГ =================
Cutscene.scripts[0] = {
  start() {
    const f = this.field(0), a = f.area, w = this.w, h = this.h;
    let p = { x: a.x + a.w / 2, y: a.y + a.h * 0.55 };
    if (f.blocked(p.x, p.y)) p = f.randomPoint();
    this.P = p;
    this.box = null;
    this.pup = null;
    this.endAt = 17.2;
    this.camKeys = [
      [0, w * 0.14, 40, 2.4], [0.8, w * 0.14, 40, 2.4], [4.2, w / 2, h / 2, 1], [6.6, w / 2, h / 2, 1],
      [8.2, p.x, p.y - 40, 1.9], [11.6, p.x, p.y - 40, 2.1], [13.4, p.x, p.y - 30, 1.3], [17.2, p.x, p.y - 30, 1.22]
    ];
    this.scene = {
      wi: 0, field: f, objs: [], cam: this.camPath(this.camKeys),
      skyFx: c => this.birds(c),
      screen: c => this.sunrise(c)
    };
  },

  update(dt) {
    const P = this.P;

    this.at(0.7, () => this.setSub('Раннее утро. Над зелёным лугом встаёт солнце...'));
    this.at(3.4, () => {
      this.box = new Box(P.x, P.y);
      this.box.h = 560;
      this.scene.objs.push(this.box);
      this.snd(900, 0.5, { vol: 0.15, to: 200 });   // свист падения
    });
    this.at(4.3, () => this.setSub('Вдруг прямо с неба на луг упала коробка!'));
    this.at(6.6, () => {
      this.setSub('Внутри кто-то тихонько заскулил...');
      this.snd(700, 0.35, { vol: 0.12, to: 1100 });
      this.snd(800, 0.4, { vol: 0.1, to: 1200, delay: 0.5 });
    });
    this.at(7.6, () => { if (this.box) { this.box.state = 'fall'; this.box.vy = -280; } });   // коробка подпрыгивает
    this.at(8.6, () => {
      const sc = this.scene;
      sc.objs = sc.objs.filter(o => o !== this.box);
      this.box = null;
      this.fx('dust', P.x, P.y, 14);
      this.fx('spark', P.x, P.y - 25, 16, 0);
      this.fx('ring', P.x, P.y, 1, 0);
      this.pup = this.makeDog(P.x, P.y, 1);
      this.pup.spawnT = 0;   // выпрыгивает из коробки
      this.pup.jump = 1;
      this.pup.happy = 2.5;
      sc.objs.push(this.pup);
      this.setSub('А в ней — маленький щенок!');
      this.snd(380, 0.14, { vol: 0.4, to: 900 });
      this.melody([523, 659, 784, 1047], { type: 'triangle', vol: 0.25, dur: 0.22, delay: 0.1 }, 0.07);
    });
    this.at(10.2, () => {
      if (!this.pup) return;
      this.pup.jump = 1;
      this.pup.happy = 2;
      this.fx('heart', P.x, P.y - 62, 4, 12);
      if (typeof Sound !== 'undefined') Sound.woof();
    });
    this.at(11.2, () => this.setSub('Позаботься о нём, и однажды он станет началом большой собачьей семьи.'));
    this.at(13.3, () => {
      this.title('Глава 1', 'Зелёный луг');
      this.melody([392, 523, 659, 784, 1047], { type: 'triangle', vol: 0.22, dur: 0.3 }, 0.12);
    });
    this.at(14.6, () => {
      if (!this.pup) return;
      this.pup.jump = 1;
      this.pup.happy = 2;
      this.fx('heart', P.x, P.y - 62, 3, 12);
    });

    this.scene.cam = this.camPath(this.camKeys);

    // Коробка падает и подпрыгивает
    const b = this.box;
    if (b) {
      b.t += dt;
      if (b.state === 'fall') {
        b.vy += 1400 * dt;
        b.h -= b.vy * dt;
        if (b.h <= 0) {
          b.h = 0;
          if (b.vy > 250) {
            b.vy = -b.vy * 0.3;
            b.squash = 1;
            this.fx('dust', b.x, b.y, 8);
            this.shake = 0.35;
            this.snd(130, 0.22, { type: 'triangle', vol: 0.45, to: 60 });
          } else {
            b.vy = 0;
            b.state = 'wait';
            b.t = 0;
          }
        }
      }
      b.squash = Math.max(0, b.squash - dt * 4);
    }
    if (this.pup) this.stepDog(this.pup, dt);
  }
};

// ================= ГЛАВА 2: СНЕЖНАЯ ДОЛИНА =================
Cutscene.scripts[1] = {
  start() {
    const f0 = this.field(0), f1 = this.field(1), a0 = f0.area, a1 = f1.area;
    let p = { x: a0.x + a0.w / 2, y: a0.y + a0.h * 0.55 };
    if (f0.blocked(p.x, p.y)) p = f0.randomPoint();
    this.ret = this.makeDog(p.x, p.y, 7);
    this.sam = null;
    this.flake = { x0: p.x - 30, y0: a0.y - 70, x: p.x - 30, y: a0.y - 70 };

    const cx = a1.x + a1.w / 2;
    let y = a1.y + a1.h * 0.55;
    if (f1.blocked(cx, y) || f1.blocked(cx - 45, y) || f1.blocked(cx + 55, y)) y = a1.y + a1.h * 0.42;
    this.meet = { x: cx - 45, sx: cx + 55, y };
    this.met = false;

    this.spr = this.auroraSprites();
    const r = U.seeded(5);
    this.stars = Array.from({ length: 26 }, () => ({ x: r() * this.w, y: r() * 90, ph: r() * 6.28, s: 0.6 + r() }));

    const mx = (this.meet.x + this.meet.sx) / 2 + 4, my = y - 45;
    this.camKeys = [[9, this.w / 2, 45, 2.3], [9.8, this.w / 2, 45, 2.3], [13.4, mx, my, 1.15], [15.3, mx, my, 1.6], [19.6, mx, my - 4, 1.5]];
    this.endAt = 19.6;
    this.scene = {
      wi: 0, field: f0, objs: [this.ret], cam: { x: p.x, y: p.y, s: 1.5 },
      world: c => this.drawFlake(c),
      screen: c => this.drawSnowScreen(c)
    };
  },

  update(dt) {
    const d = this.ret, T = this.T;

    this.at(0.6, () => this.setSub('Однажды на луг упала первая снежинка...'));
    this.at(4.7, () => this.setSub('Ретривер побежал за ней — далеко-далеко на север...'));
    this.at(9, () => {
      // Метель переносит ретривера в Снежную долину
      const m = this.meet;
      d.x = -40;
      d.y = m.y;
      d.state = 'idle';
      d.dir = 1;
      this.sam = this.makeDog(m.sx, m.y, 8);
      this.sam.dir = -1;
      this.flake = null;
      this.scene = {
        wi: 1, field: this.field(1), objs: [d, this.sam], cam: this.camPath(this.camKeys),
        skyFx: c => this.aurora(c),
        screen: c => this.drawSnowScreen(c)
      };
    });
    this.at(9.9, () => this.setSub('За снежными горами раскинулась Снежная долина.'));
    this.at(12.4, () => this.setSub('А там ретривера уже ждал новый друг — пушистый самоед!'));
    this.at(15.8, () => {
      this.title('Глава 2', 'Снежная долина');
      this.melody([1047, 1319, 1568, 2093, 1568, 2093], { vol: 0.16, dur: 0.6 }, 0.14);
    });
    this.at(17.4, () => {
      if (!this.sam) return;
      this.sam.jump = 1;
      this.sam.happy = 2;
      this.fx('heart', this.sam.x, this.sam.y - 70, 3, 12);
    });

    const sc = this.scene;
    if (sc.wi === 0) {
      // Снежинка опускается на нос ретривера
      const fl = this.flake;
      if (fl) {
        const k = U.clamp((T - 0.3) / 3.3, 0, 1);
        const tx = d.x + 44, ty = d.y - 82;
        fl.x = U.lerp(fl.x0, tx, k) + Math.sin(T * 2.2) * 14 * (1 - k);
        fl.y = U.lerp(fl.y0, ty, k);
        if (k >= 1) {
          this.flake = null;
          this.fx('spark', tx, ty, 10, 0);
          d.jump = 1;
          d.happy = 2;
          this.melody([1568, 2093], { vol: 0.18, dur: 0.4 }, 0.08);
        }
      }
      const walking = T > 4.7;
      this.stepDog(d, dt, walking ? d.x + 100 : undefined, 58);
      this.snowK = this.seg(3.6, 8.6);
      this.white = this.seg(7.3, 9);
      const s = walking ? 1.75 - 0.3 * this.seg(4.7, 8) : 1.45 + 0.3 * this.seg(0, 3);
      sc.cam = { x: d.x + 25, y: d.y - 50 - 30 * (1 - this.seg(0, 3)), s };
    } else {
      sc.cam = this.camPath(this.camKeys);
      this.snowK = T < 10.6 ? 1 - this.seg(9, 10.6) : 0;
      this.white = 1 - this.seg(9.1, 10.8);
      const m = this.meet;
      const stands = this.stepDog(d, dt, T > 11 ? m.x : undefined, 70);
      this.stepDog(this.sam, dt);
      if (T > 11 && stands && !this.met) {
        // Встреча двух друзей
        this.met = true;
        d.dir = 1;
        this.sam.dir = -1;
        d.jump = 1;
        d.happy = 2.5;
        this.sam.jump = 1;
        this.sam.happy = 2.5;
        this.fx('heart', (m.x + m.sx) / 2, m.y - 80, 6, 25);
        if (typeof Sound !== 'undefined') Sound.woof();
      }
    }
  }
};

// Запуск после всех остальных файлов: миры, показ пород и достижения уже готовы
document.addEventListener('DOMContentLoaded', () => Cutscene.init());
