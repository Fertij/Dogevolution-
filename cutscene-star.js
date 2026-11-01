// Ролик четвёртого мира: две фараоновы собаки поднимаются в Звёздный храм,
// и из звёздного света рождается Небесный страж.
// Ролик идёт поверх храма и использует его рисование из sanctuary.js

const stEase = t => { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

const StarStory = {
  active: false,
  KEY: 'dogevo_cs_star',

  seen() { return localStorage.getItem(this.KEY) === '1'; },

  init() {
    this.addStyle();
    const el = Sanctum.el;
    el.insertAdjacentHTML('beforeend',
      '<div class="st-bar st-top"><button class="st-skip">Пропустить ⏭</button></div>' +
      '<div class="st-bar st-bottom"><div class="st-sub"></div></div>' +
      '<div class="st-title"><div class="st-ch">Глава 4</div><div class="st-name">Звёздный храм</div><div class="st-line"></div></div>');
    this.subEl = el.querySelector('.st-sub');
    el.querySelector('.st-skip').addEventListener('click', e => { e.stopPropagation(); this.skip(); });
    this.hook();
    this.addReplay();
  },

  // Подключение к храму без правок в sanctuary.js
  hook() {
    const ST = this, S = Sanctum;

    const show = S.show;
    S.show = function (first) {
      show.call(this, first);
      if (this.visible && !ST.seen()) ST.play();
    };

    const close = S.close;
    S.close = function () {
      if (ST.active) ST.finish();
      return close.call(this);
    };

    // Во время ролика касания и падающие звёзды не работают
    const tap = S.tap;
    S.tap = function (x, y) { if (ST.active) return; return tap.call(this, x, y); };

    const upd = S.update;
    S.update = function (dt) {
      upd.call(this, dt);
      if (ST.active) { ST.update(dt); this.falls = []; this.fallT = 5; }
    };

    const draw = S.draw;
    S.draw = function () { return ST.active ? ST.draw() : draw.call(this); };

    // Плашки достижений ждут конца ролика
    if (typeof Ach !== 'undefined') {
      const pump = Ach.pump;
      Ach.pump = function () { if (ST.active) return; return pump.call(this); };
    }

    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      localStorage.removeItem(ST.KEY);
    };
  },

  // Кнопка 🌙 в строке «Сюжет» в настройках
  addReplay() {
    const box = document.querySelector('#settings .cs-replay');
    if (!box) return;
    const b = document.createElement('button');
    b.className = 'cs-rbtn';
    b.textContent = '🌙';
    b.setAttribute('aria-label', 'Звёздный храм');
    b.addEventListener('click', () => {
      if (!Sanctum.isOpen()) { game.toast('Храм ещё закрыт', 'Объедини двух фараоновых собак'); return; }
      Settings.close();
      Sanctum.show(false);
      if (!this.active) this.play();
    });
    box.appendChild(b);
  },

  play() {
    const S = Sanctum;
    if (this.active || !S.visible) return;
    this.active = true;
    this.T = 0;
    this.endAt = 19.5;
    this.closing = false;
    this.done = {};
    this.flash = 0;
    this.say('');

    // Две фараоновы собаки заходят с краёв помоста
    this.a = new Dog(0, 0, 20);
    this.b = new Dog(0, 0, 20);
    for (const [d, x] of [[this.a, -330], [this.b, 330]]) {
      d.spawnT = 1;
      d.px = x;
      d.dir = x < 0 ? 1 : -1;
    }
    S.st.happy = 0;

    S.el.classList.remove('st-titled');
    S.el.classList.add('story');
    void S.el.offsetWidth;   // чтобы полосы выехали с анимацией
    S.el.classList.add('st-bars');
  },

  skip() {
    if (!this.active) return;
    if (this.T < this.endAt) this.endAt = this.T;
    this.say('');
  },

  finish() {
    const S = Sanctum;
    this.active = false;
    this.a = this.b = null;
    localStorage.setItem(this.KEY, '1');
    S.el.classList.remove('story', 'st-bars', 'st-titled');
    this.subEl.textContent = '';
    S.fallT = 2;
  },

  // ---------- Помощники ----------
  at(t, fn) {
    const k = this.cue++;
    if (this.T >= t && !this.done[k]) { this.done[k] = true; fn(); }
  },

  seg(a, b) { return stEase((this.T - a) / (b - a)); },

  say(t) { this.sub = t; this.subN = 0; this.subShown = -1; },

  tone(notes, gap, dur = 0.26) {
    if (typeof Sound === 'undefined') return;
    notes.forEach((f, i) => Sound.tone(f, dur, { type: 'triangle', vol: 0.22, delay: i * gap }));
  },

  // Сердечки в координатах стража
  hearts(x, y, n) {
    const p = Sanctum.toScreen(x, y);
    for (let i = 0; i < n; i++) {
      Sanctum.parts.push({ type: 'heart', x: p.x + U.rand(-30, 30), y: p.y, vx: U.rand(-25, 25), vy: U.rand(-90, -60), life: 0, max: 1.4, s: U.rand(1.4, 2) });
    }
  },

  // ---------- Сценарий ----------
  update(dt) {
    const S = Sanctum, st = S.st;
    this.T += dt;
    this.cue = 0;
    const T = this.T;

    this.at(0.8, () => this.say('Высоко над Солнечным островом, среди звёзд, спрятан древний храм...'));
    this.at(4.2, () => this.say('Однажды к нему поднялись две фараоновы собаки.'));
    this.at(8.2, () => {
      this.say('Они посмотрели в небо — и звёзды ответили им.');
      for (const d of [this.a, this.b]) if (d) { d.jump = 1; d.happy = 2; }
      this.hearts(0, -120, 5);
      if (typeof Sound !== 'undefined') Sound.woof();
    });
    this.at(9.2, () => this.tone([784, 988, 1175, 1568], 0.2, 0.4));
    this.at(11.3, () => {
      // Вспышка: собаки превращаются в стража
      this.flash = 1;
      this.a = this.b = null;
      const p = S.toScreen(0, -250);
      S.burst(p.x, p.y, 34);
      this.tone([523, 659, 784, 1047, 1319], 0.08, 0.35);
      if (typeof Settings !== 'undefined') Settings.vibrate([40, 30, 90]);
    });
    this.at(11.8, () => this.say('Из звёздного света родился Небесный страж...'));
    this.at(13.6, () => {
      st.happy = 1.8;
      st.bounce = 1;
      this.hearts(0, -330, 6);
      S.woof();
    });
    this.at(14.3, () => this.say('...хранитель всех собак во всех мирах.'));
    this.at(15.6, () => {
      this.say('');
      S.el.classList.add('st-titled');
      this.tone([392, 523, 659, 784, 1047, 1319], 0.13, 0.3);
    });

    // Собаки идут к центру помоста и встают друг напротив друга
    for (const [d, side] of [[this.a, -1], [this.b, 1]]) {
      if (!d) continue;
      d.animate(dt);
      const goal = side * 78;
      if (T > 3.8 && Math.abs(d.px - goal) > 1) {
        d.state = 'walk';
        d.dir = -side;
        d.walkT += dt * 9;
        d.px += Math.sign(goal - d.px) * Math.min(70 * dt, Math.abs(goal - d.px));
      } else {
        d.state = 'idle';
        d.dir = -side;
        d.walkT = U.lerp(d.walkT, Math.round(d.walkT / Math.PI) * Math.PI, dt * 10);
      }
    }

    // Страж появляется с закрытыми глазами и открывает их на 13-й секунде
    if (T < 13) { st.blink = 0.08; st.dbl = 0; st.happy = 0; }
    this.flash = Math.max(0, this.flash - dt * 1.2);

    // Субтитры печатаются по буквам
    if (this.subN < this.sub.length) this.subN += dt * 30;
    const n = Math.min(this.sub.length, Math.floor(this.subN));
    if (n !== this.subShown) { this.subShown = n; this.subEl.textContent = this.sub.slice(0, n); }

    if (T >= this.endAt && !this.closing) {
      this.closing = true;
      S.el.classList.remove('st-bars');
    }
    if (T >= this.endAt + 0.7) this.finish();
  },

  // Камера: луна → помост → страж. В конце совпадает с обычным видом храма
  cam() {
    const S = Sanctum, w = S.w, h = S.h, T = this.T;
    const m = S.toScreen(0, -330), d = S.toScreen(0, -60), g = S.toScreen(0, -230);
    const K = [[0, m.x, m.y, 2.3], [3.4, m.x, m.y, 2.0], [6.4, d.x, d.y, 1.7], [9, g.x, g.y, 1.2],
      [11.3, g.x, g.y, 1.05], [13.5, g.x, g.y, 1.12], [19.5, g.x, g.y, 1]];
    let x = K[0][1], y = K[0][2], s = K[0][3];
    for (let i = 1; i < K.length; i++) {
      const [t0, x0, y0, s0] = K[i - 1], [t1, x1, y1, s1] = K[i];
      if (T <= t1) {
        const k = stEase((T - t0) / (t1 - t0));
        x = U.lerp(x0, x1, k); y = U.lerp(y0, y1, k); s = U.lerp(s0, s1, k);
        break;
      }
      x = x1; y = y1; s = s1;
    }
    s = Math.max(1, s);
    const hw = w / (2 * s), hh = h / (2 * s);
    return { x: U.clamp(x, hw, w - hw), y: U.clamp(y, hh, h - hh), s };
  },

  // ---------- Рисование ----------
  draw() {
    const S = Sanctum, c = S.ctx, w = S.w, h = S.h, T = this.T, t = S.st.t;
    c.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    const cam = this.cam(), sh = this.flash * 6;

    c.save();
    c.translate(w / 2 + Math.sin(T * 60) * sh, h / 2 + Math.cos(T * 50) * sh);
    c.scale(cam.s, cam.s);
    c.translate(-cam.x, -cam.y);
    c.drawImage(S.bg, 0, 0, w, h);

    // Звёзды загораются одна за другой
    const sa = this.seg(0.3, 3);
    for (const s of S.tw) {
      const a = Math.max(0, Math.sin(t * s.sp + s.ph)) * sa;
      if (a > 0.05) gStar4(c, s.x, s.y, s.s * (1 + a) * 1.4, `rgba(255,255,255,${a})`);
    }

    c.save();
    c.translate(S.ox, S.oy);
    c.scale(S.k, S.k);
    S.drawMoon(c, t);
    S.drawDais(c, t);
    this.drawConstellation(c);
    for (const d of [this.a, this.b]) if (d) this.drawDog(c, d);
    if (T >= 11.3) {
      const g = this.seg(11.3, 12.4), k = 0.7 + 0.3 * g;
      c.save();
      c.globalAlpha = g;
      c.translate(0, -200);
      c.scale(k, k);
      c.translate(0, 200);
      S.drawGuardian(c);
      c.restore();
    }
    c.restore();

    // Звёздная пыль, сердечки и искры
    for (const d of S.dust) {
      const a = (0.3 + 0.4 * Math.sin(t * 2 + d.ph)) * sa;
      U.ellipse(c, d.x, d.y, d.s, d.s, `rgba(220,250,255,${a})`);
    }
    for (const p of S.parts) {
      c.globalAlpha = 1 - p.life / p.max;
      if (p.type === 'heart') U.heart(c, p.x, p.y, p.s, '#ff6bcb');
      else gStar4(c, p.x, p.y, p.s, '#fff3b0');
    }
    c.globalAlpha = 1;
    c.restore();

    if (this.flash > 0) {
      c.fillStyle = `rgba(255,250,230,${this.flash})`;
      c.fillRect(0, 0, w, h);
    }
    const fa = 1 - U.clamp(T / 1.2, 0, 1);   // появление из темноты
    if (fa > 0) {
      c.fillStyle = `rgba(0,0,0,${fa})`;
      c.fillRect(0, 0, w, h);
    }
  },

  // Собаки поднимаются, сходятся к центру и растворяются в свете
  drawDog(c, d) {
    const up = this.seg(9.4, 11.3), k = 1 - up;
    const x = d.px * (0.35 + 0.65 * k), y = 8 - up * 110;
    U.softEllipse(c, x, y - 60, 90, 90, GUARD.glow, 0.55 * up);
    c.save();
    c.globalAlpha = Math.max(0, k);
    c.translate(x, y);
    c.scale(1.7, 1.7);
    d.x = 0;
    d.y = 0;
    d.draw(c);
    c.restore();
  },

  // Созвездие кружится и сжимается в точку, где появится страж
  drawConstellation(c) {
    const T = this.T, a = this.seg(8.6, 9.6) * (1 - this.seg(11.1, 11.4));
    if (a <= 0) return;
    const conv = this.seg(9.4, 11.3), R = 330 * (1 - conv) + 8, cy = -250;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const an = i / 10 * Math.PI * 2 + T * 0.5, r = R * (i % 2 ? 0.75 : 1);
      pts.push([Math.cos(an) * r, cy + Math.sin(an) * r * 0.85]);
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    c.strokeStyle = `rgba(${GUARD.glow},${0.55 * a})`;
    c.lineWidth = 2.5;
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.stroke();
    c.strokeStyle = `rgba(${GUARD.glow2},${0.35 * a})`;
    c.lineWidth = 1.5;
    c.beginPath();
    for (const [x, y] of pts) { c.moveTo(0, cy); c.lineTo(x, y); }
    c.stroke();
    for (const [x, y] of pts) {
      U.softEllipse(c, x, y, 22, 22, GUARD.glow, 0.5 * a);
      gStar4(c, x, y, 9, `rgba(255,255,255,${a})`);
    }
    const g = 60 + conv * 120;
    U.softEllipse(c, 0, cy, g, g, '255,250,220', 0.5 * a * conv);
    c.restore();
  },

  addStyle() {
    const s = document.createElement('style');
    s.textContent = `
#sanctum.story .sg-back,#sanctum.story .sg-coins,#sanctum.story .sg-plate,#sanctum.story .sg-hint,#sanctum.story .sg-up{opacity:0;pointer-events:none;transition:opacity .4s}
.st-bar{position:absolute;left:0;right:0;z-index:3;height:calc(12vh + env(safe-area-inset-top));background:#000;transition:transform .8s cubic-bezier(.3,1,.4,1);pointer-events:none}
.st-top{top:0;display:flex;align-items:center;justify-content:flex-end;padding:env(safe-area-inset-top) 12px 0;transform:translateY(-100%)}
.st-bottom{bottom:0;height:calc(12vh + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:center;padding:0 22px env(safe-area-inset-bottom);transform:translateY(100%)}
#sanctum.st-bars .st-bar{transform:none}
.st-skip{pointer-events:auto;padding:7px 14px;border:2px solid rgba(255,255,255,.6);border-radius:16px;background:rgba(255,255,255,.12);color:#fff;font:800 14px/1 'Nunito',system-ui,sans-serif}
.st-skip:active{transform:scale(.94)}
.st-sub{max-width:520px;font:800 17px/1.35 'Nunito',system-ui,sans-serif;color:#fff;text-align:center;text-shadow:0 2px 6px rgba(0,0,0,.8)}
.st-title{position:absolute;left:0;right:0;top:24%;z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;pointer-events:none}
#sanctum.st-titled .st-title{animation:stTitle 3.8s ease forwards}
@keyframes stTitle{0%{opacity:0;transform:scale(1.5)}14%{opacity:1;transform:scale(1)}82%{opacity:1;transform:scale(1.03)}100%{opacity:0;transform:scale(1.06)}}
.st-ch{padding:7px 22px;border:2px solid #fff;border-radius:8px;background:linear-gradient(#b197fc,#7048e8 55%,#5f3dc4);box-shadow:0 4px 0 #3b1f8c,0 8px 14px rgba(0,0,0,.4);font:900 14px/1 'Nunito',system-ui,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 0 #3b1f8c}
.st-name{font:400 clamp(40px,13vw,64px)/1 'Lilita One','Arial Black',sans-serif;letter-spacing:1px;text-align:center;color:#ffe066;-webkit-text-stroke:2px #2e1470;text-shadow:0 5px 0 #2e1470,0 10px 18px rgba(0,0,0,.55),0 0 30px rgba(180,150,255,.9)}
.st-line{width:0;height:3px;border-radius:2px;background:linear-gradient(90deg,transparent,#c9b8ff,transparent)}
#sanctum.st-titled .st-line{animation:stLine 1s .35s ease-out forwards}
@keyframes stLine{to{width:min(70vw,300px)}}`;
    document.head.appendChild(s);
  }
};

// Запуск после sanctuary.js и cutscene.js: храм и кнопки «Сюжет» уже готовы
document.addEventListener('DOMContentLoaded', () => StarStory.init());
