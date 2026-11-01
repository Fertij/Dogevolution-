// Ролик третьего мира: ледяной волкодав летит на воздушном шаре на Солнечный остров

// Пляж рисуется своим drawBack, чтобы в ролике были море и прибой
(function () {
  const dw = Cutscene.drawWorld;
  Cutscene.drawWorld = function (c, f, skyFx) {
    if (f instanceof BeachField) return f.drawBack(c);
    return dw.call(this, c, f, skyFx);
  };
})();

// Воздушный шар. (x, y) — низ корзины
Cutscene.drawBalloon = function (c, x, y, dog, flame) {
  const ex = x, ey = y - 140, rx = 44, ry = 50, T = this.T;
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // Стропы
  c.strokeStyle = '#5a3a1c';
  c.lineWidth = 1.2;
  c.beginPath();
  for (const k of [-1, -0.35, 0.35, 1]) { c.moveTo(x + k * 19, y - 27); c.lineTo(ex + k * 16, ey + ry - 4); }
  c.stroke();

  // Пламя и горелка
  if (flame) {
    const fh = 12 + Math.sin(T * 31) * 3 + Math.sin(T * 17) * 2;
    U.softEllipse(c, x, y - 86, 16, 13, '255,180,60', 0.55);
    U.ellipse(c, x, y - 80 - fh / 2, 4, fh / 2, 'rgba(255,140,30,0.9)');
    U.ellipse(c, x, y - 79 - fh / 3, 2, fh / 3, '#fff3bf');
  }
  U.rrect(c, x - 5, y - 80, 10, 6, 1.5);
  c.fillStyle = '#495057';
  c.fill();

  // Юбка купола
  c.fillStyle = '#c92a2a';
  c.beginPath();
  c.moveTo(ex - 18, ey + ry - 8); c.lineTo(ex + 18, ey + ry - 8);
  c.lineTo(ex + 11, ey + ry + 4); c.lineTo(ex - 11, ey + ry + 4);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(90,10,10,0.6)';
  c.lineWidth = 1;
  c.stroke();

  // Купол с цветными полосами
  const dome = () => {
    c.beginPath();
    c.moveTo(ex - 17, ey + ry - 6);
    c.bezierCurveTo(ex - rx * 1.35, ey + ry * 0.2, ex - rx * 1.05, ey - ry * 1.1, ex, ey - ry);
    c.bezierCurveTo(ex + rx * 1.05, ey - ry * 1.1, ex + rx * 1.35, ey + ry * 0.2, ex + 17, ey + ry - 6);
    c.closePath();
  };
  dome();
  c.save();
  c.clip();
  const cols = ['#ff4d4d', '#ffd43b', '#4dabf7', '#ffffff', '#ff4d4d', '#51cf66', '#ffd43b'];
  for (let i = 0; i < 7; i++) {
    c.fillStyle = cols[i];
    c.beginPath();
    c.ellipse(ex, ey, rx * 1.35 * (1 - i / 7), ry * 1.4, 0, 0, Math.PI * 2);
    c.fill();
  }
  const sh = c.createRadialGradient(ex - rx * 0.4, ey - ry * 0.45, 2, ex, ey, rx * 1.4);
  sh.addColorStop(0, 'rgba(255,255,255,0.5)');
  sh.addColorStop(0.45, 'rgba(255,255,255,0)');
  sh.addColorStop(1, 'rgba(20,10,40,0.4)');
  c.fillStyle = sh;
  c.fillRect(ex - rx * 1.5, ey - ry * 1.3, rx * 3, ry * 2.6);
  c.restore();
  dome();
  c.strokeStyle = 'rgba(90,20,10,0.6)';
  c.lineWidth = 1.4;
  c.stroke();

  // Собака в корзине
  if (dog) {
    c.save();
    c.translate(x + 3, y - 12);
    c.scale(0.45, 0.45);
    dog.x = 0;
    dog.y = 0;
    dog.draw(c);
    c.restore();
    c.lineCap = 'round';
    c.lineJoin = 'round';
  }

  // Плетёная корзина
  const bg = c.createLinearGradient(0, y - 27, 0, y);
  bg.addColorStop(0, '#e0aa62');
  bg.addColorStop(1, '#8a5a28');
  U.rrect(c, x - 20, y - 26, 40, 26, 4);
  c.fillStyle = bg;
  c.fill();
  c.strokeStyle = '#5a3a1c';
  c.lineWidth = 1.2;
  c.stroke();
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(90,55,20,0.45)';
  c.lineWidth = 1;
  for (let yy = y - 21; yy < y; yy += 5) { c.beginPath(); c.moveTo(x - 20, yy); c.lineTo(x + 20, yy); c.stroke(); }
  for (let xx = x - 16; xx < x + 20; xx += 6) { c.beginPath(); c.moveTo(xx, y - 26); c.lineTo(xx + 2, y); c.stroke(); }
  c.restore();
  U.rrect(c, x - 22, y - 29, 44, 5, 2.5);
  c.fillStyle = '#b07a3e';
  c.fill();
  c.strokeStyle = '#5a3a1c';
  c.stroke();

  // Мешки с песком
  for (const sx of [-23, 23]) {
    c.beginPath(); c.moveTo(x + sx * 0.9, y - 26); c.lineTo(x + sx, y - 17); c.stroke();
    U.ellipse(c, x + sx, y - 13, 3.5, 4.5, '#d8c49a', '#6b5a3a');
  }
  c.restore();
};

// Тень шара на земле и сам шар
Cutscene.balloonWorld = function (c) {
  const B = this.B, k = U.clamp(1 - (this.ground - B.y) / 220, 0, 1);
  if (k > 0) U.softShadow(c, B.x + 6, this.ground + 2, 36 * (0.5 + 0.5 * k), 9 * (0.5 + 0.5 * k), 0.5 * k);
  this.drawBalloon(c, B.x, B.y, this.inBasket ? this.dog : null, this.flame);
};

// Облака на весь экран при перелёте
Cutscene.cloudCover = function (c) {
  const k = this.cloudK;
  if (!(k > 0)) return;
  const w = this.w, h = this.h;
  for (let i = 0; i < 10; i++) {
    const x = ((i * 0.37 + this.T * 0.05) % 1.2 - 0.1) * w, y = ((i * 0.61) % 1) * h;
    U.softEllipse(c, x, y, w * 0.45, h * 0.18, '255,255,255', 0.95 * k);
  }
  c.fillStyle = `rgba(255,255,255,${0.6 * k})`;
  c.fillRect(0, 0, w, h);
};

// ================= ГЛАВА 3: СОЛНЕЧНЫЙ ОСТРОВ =================
Cutscene.scripts[2] = {
  start() {
    const f1 = this.field(1), a1 = f1.area;
    let p = { x: a1.x + a1.w * 0.3, y: a1.y + a1.h * 0.55 };
    if (f1.blocked(p.x, p.y)) p = f1.randomPoint();
    this.dog = this.makeDog(p.x, p.y, 15);
    this.ground = p.y;
    this.B = { x: Math.min(p.x + 110, a1.x + a1.w - 50), y: p.y };
    this.inBasket = false;
    this.met = false;
    this.big = null;
    this.cloudK = 0;
    this.flame = false;
    this.snowK = 0.35;

    const a2 = this.field(2).area;
    this.L = { x: a2.x + a2.w * 0.22, y: a2.y + a2.h * 0.5 };
    this.endAt = 20.5;

    const cx = (p.x + this.B.x) / 2;
    this.camKeys = [[0, cx, p.y - 60, 1.45], [6.8, cx + 20, p.y - 70, 1.35]];
    const mx = this.L.x + 100;
    this.camKeys2 = [[10.5, this.w / 2, 60, 1.5], [14, mx, this.L.y - 70, 1.25], [20.5, mx, this.L.y - 60, 1.35]];

    this.scene = {
      wi: 1, field: f1, objs: [this.dog], cam: this.camPath(this.camKeys),
      world: c => this.balloonWorld(c),
      screen: c => { this.drawSnowScreen(c); this.cloudCover(c); }
    };
  },

  update(dt) {
    const d = this.dog, B = this.B, T = this.T;

    // События идут по времени. Порядок вызовов at() всегда одинаковый
    this.at(0.6, () => this.setSub('В Снежной долине началась самая долгая зима...'));
    this.at(3.2, () => {
      this.setSub('Ледяной волкодав мечтал хоть разок погреться на солнышке.');
      d.jump = 1;
      d.happy = 1.5;
    });
    this.at(5, () => this.setSub('И тогда он отправился в путь на воздушном шаре!'));
    this.at(6.8, () => {
      this.flame = true;
      this.snd(160, 0.8, { type: 'sawtooth', vol: 0.06, lp: 500 });
    });
    this.at(7.1, () => {
      // Если волкодав не успел дойти, он запрыгивает в корзину сам
      if (this.inBasket) return;
      this.inBasket = true;
      this.scene.objs = this.scene.objs.filter(o => o !== d);
    });
    this.at(10.5, () => {
      // Перелёт: шар появляется над пляжем
      const L = this.L;
      this.ground = L.y;
      B.x = L.x;
      B.y = L.y - 420;
      this.snowK = 0;
      this.flakes = [];
      this.big = this.makeDog(L.x + 185, L.y, 16);
      this.big.dir = -1;
      this.scene = {
        wi: 2, field: this.field(2), objs: [this.big], cam: this.camPath(this.camKeys2),
        world: c => this.balloonWorld(c),
        screen: c => this.cloudCover(c)
      };
      this.snd(160, 0.8, { type: 'sawtooth', vol: 0.06, lp: 500 });
    });
    this.at(11.4, () => this.setSub('Внизу показался тёплый Солнечный остров!'));
    this.at(14, () => {
      B.y = this.ground;
      this.flame = false;
      this.fx('dust', B.x, B.y, 14, 30);
      this.shake = 0.3;
      this.snd(130, 0.22, { type: 'triangle', vol: 0.4, to: 60 });
    });
    this.at(14.6, () => {
      this.inBasket = false;
      d.x = B.x + 45;
      d.y = this.ground;
      d.dir = 1;
      d.state = 'idle';
      d.jump = 1;
      d.happy = 2;
      this.scene.objs.push(d);
      this.fx('dust', d.x, d.y, 6);
    });
    this.at(15.2, () => this.setSub('А на берегу его уже ждал весёлый бигль!'));
    this.at(16.8, () => {
      this.title('Глава 3', 'Солнечный остров');
      this.melody([523, 659, 784, 659, 880, 784, 1047], { type: 'triangle', vol: 0.22, dur: 0.28 }, 0.13);
    });
    this.at(18.6, () => {
      if (!this.big) return;
      this.big.jump = 1;
      this.big.happy = 2;
      this.fx('heart', this.big.x, this.big.y - 70, 3, 12);
    });

    const sc = this.scene;
    if (sc.wi === 1) {
      // Снежная долина: идёт к шару, садится, шар улетает в облака
      if (!this.inBasket) {
        const stands = this.stepDog(d, dt, T > 5 ? B.x : undefined, 60);
        if (T > 5 && stands) {
          this.inBasket = true;
          sc.objs = sc.objs.filter(o => o !== d);
          d.dir = 1;
          this.fx('dust', B.x, B.y, 6);
          this.snd(600, 0.12, { vol: 0.2, to: 900 });
        }
      } else {
        this.stepDog(d, dt);
      }
      if (T > 7.2) B.y = this.ground - 460 * this.seg(7.2, 10.5);
      this.cloudK = this.seg(9, 10.5);
      const c0 = this.camPath(this.camKeys), k = this.seg(6.8, 8.2);
      sc.cam = { x: U.lerp(c0.x, B.x, k), y: U.lerp(c0.y, B.y - 80, k), s: U.lerp(c0.s, 1.35, k) };
    } else {
      // Остров: шар покачиваясь опускается, волкодав бежит к биглю
      sc.cam = this.camPath(this.camKeys2);
      this.cloudK = 1 - this.seg(10.5, 11.8);
      if (T < 14) {
        const k = this.seg(10.5, 14);
        B.y = U.lerp(this.ground - 420, this.ground, k);
        B.x = this.L.x + Math.sin(T * 1.4) * 10 * (1 - k);
      }
      if (this.inBasket) {
        this.stepDog(d, dt);
      } else {
        const tx = this.L.x + 70;
        const stands = this.stepDog(d, dt, T > 15 ? tx : undefined, 60);
        if (T > 15 && stands && !this.met) {
          this.met = true;
          d.dir = 1;
          d.jump = 1;
          d.happy = 2.5;
          this.big.jump = 1;
          this.big.happy = 2.5;
          this.fx('heart', (tx + this.big.x) / 2, this.ground - 80, 6, 25);
          if (typeof Sound !== 'undefined') Sound.woof();
        }
      }
      if (this.big) this.stepDog(this.big, dt);
    }
  }
};
