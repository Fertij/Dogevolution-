// Породы по уровням. Каждая порода описана параметрами внешности.
// Необязательные параметры: shine (блик шерсти), outline (контур), eye (цвета глаза),
// legNear/legFar (цвет лап), saddle/saddleH (тёмная спина), mask (маска хаски),
// dots (пятна далматина), earFar (дальнее ухо), earSize (размер ушей), brow (бровь),
// cap (тёмная макушка), muzzle (цвет морды), mouth (цвет рта), bodyH (толщина тела),
// tailColor/tailTop/tailTip (цвета пушистого хвоста), headPatch (цвет головы поверх белого),
// eyePatch (пятно вокруг глаза), jowls (отвисшие щёки), barrel (бочонок на ошейнике)
const DOG_LEVELS = [
  null,
  {
    name: 'Дворняжка', coin: 1,
    body: '#d9a066', dark: '#a8692e', light: '#f6dcb4', spot: '#8a5422', ear: '#8a5422', collar: '#e03131',
    ears: 'floppy', tail: 'long', legLen: 1, bodyLen: 1, blaze: false, bib: false
  },
  {
    name: 'Корги', coin: 3,
    body: '#ec9442', dark: '#b8611f', light: '#fff6ea', spot: null, ear: '#e08a3a', earInner: '#ffc2a1', collar: '#1c7ed6',
    ears: 'pointy', tail: 'fluffy', legLen: 0.6, bodyLen: 1.15, blaze: true, bib: true
  },
  {
    name: 'Хаски', coin: 8,
    body: '#8592a3', dark: '#3c4552', light: '#ffffff', shine: '#b9c3cf', spot: null,
    ear: '#4a5563', earInner: '#f6c9c4', collar: '#2f9e44',
    saddle: '#4a5462', mask: true, legNear: '#f4f6f8', legFar: '#c5ccd6',
    eye: ['#bfe9ff', '#3d9be0', '#16507d'], outline: 'rgba(25,32,45,0.55)', whisker: '#7d8896',
    ears: 'pointy', tail: 'curl', legLen: 1.1, bodyLen: 1.05, blaze: false, bib: true
  },
  {
    name: 'Далматин', coin: 20,
    body: '#f4f5f2', dark: '#b9c0c9', light: '#ffffff', shine: '#ffffff', spot: null,
    ear: '#2a2a2a', earFar: '#161616', collar: '#7048e8', brow: '#2a2a2a',
    dots: '#242424', legNear: '#f7f7f5', legFar: '#d3d8de',
    outline: 'rgba(35,38,48,0.55)', whisker: '#3a3a3a',
    ears: 'floppy', tail: 'long', legLen: 1.12, bodyLen: 1.05, blaze: false, bib: false
  },
  {
    name: 'Овчарка', coin: 50,
    body: '#c98a45', dark: '#8a5424', light: '#efc890', shine: '#e9b877', spot: null,
    ear: '#2e2622', earFar: '#1d1815', earInner: '#7a4f33', earSize: 1.2, collar: '#f76707',
    saddle: '#2e2622', saddleH: 10, cap: '#2e2622', muzzle: '#3b2e25', mouth: '#120c08',
    brow: '#f3c98c', legNear: '#d39556', legFar: '#a8682f', tailTop: '#2e2622',
    outline: 'rgba(40,25,15,0.6)', whisker: '#7a5a42',
    ears: 'pointy', tail: 'bushy', legLen: 1.15, bodyLen: 1.12, blaze: false, bib: false
  },
  {
    name: 'Сенбернар', coin: 120,
    body: '#fbf6ee', dark: '#cdb9a2', light: '#ffffff', shine: '#ffffff', spot: '#a9481a',
    saddle: '#b5541c', saddleH: 11, bib: true, blaze: true,
    headPatch: '#b5541c', eyePatch: '#5a2410', jowls: true, barrel: true,
    ear: '#9a4318', earFar: '#6e2f0c', earSize: 1.12, collar: '#c2255c', brow: '#5a2410',
    legNear: '#fdfaf5', legFar: '#dccfbf',
    tailColor: '#b5541c', tailTop: '#8a3a12', tailTip: '#ffffff',
    outline: 'rgba(80,40,15,0.55)', whisker: '#9a7a5a',
        ears: 'floppy', tail: 'bushy', legLen: 1.05, bodyLen: 1.2, bodyH: 1.12
  },
  {
    name: 'Ретривер', coin: 300,
    body: '#e9b45a', dark: '#b8792c', light: '#fbe6b8', shine: '#ffe1a0', spot: null,
    ear: '#cf8f3c', earFar: '#a3672a', earSize: 1.15, collar: '#c92a2a', brow: '#a3672a',
    bib: true, crown: true, legNear: '#f0c06e', legFar: '#c48a3e',
    tailColor: '#e2a84e', tailTop: '#c48434', tailTip: '#fbe6b8',
    outline: 'rgba(95,55,10,0.55)', whisker: '#a8763e',
        ears: 'floppy', tail: 'bushy', legLen: 1.1, bodyLen: 1.15, bodyH: 1.05
  },
  // ===== Снежная долина =====
  {
    name: 'Самоед', coin: 700,
    body: '#fbf8f2', dark: '#d7d0c4', light: '#ffffff', shine: '#ffffff', spot: null,
    ear: '#f3eee6', earFar: '#e2dbd0', earInner: '#ffd0c8', collar: '#e03131', scarf: ['#e03131', '#ffffff'],
    legNear: '#fdfbf7', legFar: '#e6e0d6', bib: true, brow: '#d7d0c4',
    outline: 'rgba(110,100,90,0.5)', whisker: '#b5aa9a',
    ears: 'pointy', tail: 'curl', legLen: 0.95, bodyLen: 1.05, bodyH: 1.12
  },
  {
    name: 'Зенненхунд', coin: 1600,
    body: '#2b2724', dark: '#141210', light: '#ffffff', shine: '#4a443f', spot: null,
    ear: '#1d1a18', earFar: '#100e0d', earSize: 1.1, collar: '#1c7ed6', scarf: ['#1c7ed6', '#ffe066'],
    bib: true, blaze: true, brow: '#c8743a', eyePatch: '#2b2724',
    legNear: '#c8743a', legFar: '#9a5426',
    tailColor: '#2b2724', tailTop: '#141210', tailTip: '#ffffff',
    outline: 'rgba(10,8,6,0.6)', whisker: '#6a5a4a',
    ears: 'floppy', tail: 'bushy', legLen: 1.1, bodyLen: 1.2, bodyH: 1.12
  }
];


// Пятна далматина: [x, y, ширина, высота, поворот]. На теле x умножается на длину тела
const BODY_DOTS = [
  [-15, -5, 3.4, 2.8, 0.3], [-5, -9, 2.8, 2.2, -0.2], [6, -6, 3.2, 2.6, 0.5], [15, -9, 2.2, 1.9, 0],
  [-19, 4, 2.4, 2, 0.2], [-8, 2, 2.2, 1.8, -0.4], [3, 3, 1.8, 1.5, 0], [12, 2, 2.6, 2.1, 0.3],
  [-12, -12, 1.8, 1.4, 0], [20, -1, 1.7, 1.5, 0], [-1, -13, 1.5, 1.2, 0], [9, -12.5, 1.6, 1.3, 0.2]
];
const HEAD_DOTS = [
  [-7, -5, 2.4, 2, 0.3], [-2, -10, 1.7, 1.4, 0], [-10, 3, 2, 1.7, 0], [1, 4, 1.3, 1.1, 0], [4, -10.5, 1.3, 1.1, 0]
];

class Dog {
  constructor(x, y, level = 1) {
    this.x = x; this.y = y;
    this.level = level;
        this.size = level <= 7 ? 1 + (level - 1) * 0.08 : 1.05 + (level - 8) * 0.07;
    this.dir = 1;              // 1 смотрит вправо, -1 влево
    this.state = 'idle';
    this.held = false;         // собаку держат пальцем
    this.timer = U.rand(1, 2);
    this.tx = x; this.ty = y;
    this.speed = 45;
    this.walkT = 0;
    this.tailT = 0;
    this.blink = 0;
    this.blinkTimer = U.rand(2, 5);
    this.jump = 0;
    this.squash = 0;
    this.happy = 0;
    this.labelT = 0;
    this.coinTimer = U.rand(3, 5);
    this.dustT = 0;
    this.spawnT = 0;
  }

  get info() { return DOG_LEVELS[this.level]; }

  // Анимация на месте: хвост, моргание, прыжок. Возвращает true в момент приземления.
  // Её же использует собака на подиуме в меню
  animate(dt) {
    this.spawnT = Math.min(1, this.spawnT + dt * 2.5);
    this.tailT += dt * (this.happy > 0 || this.held ? 24 : 9);
    this.happy = Math.max(0, this.happy - dt);
    this.labelT = Math.max(0, this.labelT - dt);

    const pj = this.jump;
    this.jump = Math.max(0, this.jump - dt * 2.2);
    const landed = pj > 0 && this.jump === 0;
    if (landed) this.squash = 0.22;
    this.squash = Math.max(0, this.squash - dt);

    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) { this.blink = 0.15; this.blinkTimer = U.rand(2, 5); }
    this.blink = Math.max(0, this.blink - dt);
    return landed;
  }

  update(dt, game) {
    if (this.animate(dt)) game.dust(this.x, this.y, 5);

    // В руке: лапы болтаются, собака не ходит и не приносит монеты
    if (this.held) { this.walkT += dt * 14; return; }

    // Поведение: стоит, потом идёт в случайную точку в обход будки и пруда
    if (this.state === 'idle') {
      this.timer -= dt;
      if (this.timer <= 0) {
        const p = game.field.randomPoint(this.x, this.y);
        this.tx = p.x; this.ty = p.y;
        this.state = 'walk';
      }
      this.walkT = U.lerp(this.walkT, Math.round(this.walkT / Math.PI) * Math.PI, dt * 10);
    } else {
      const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy);
      if (d < 3) {
        this.state = 'idle';
        this.timer = U.rand(1.5, 4);
      } else {
        const step = Math.min(this.speed * dt, d);
        this.x += dx / d * step;
        this.y += dy / d * step;
        if (Math.abs(dx) > 2) this.dir = dx > 0 ? 1 : -1;
        this.walkT += dt * 10 / Math.sqrt(this.info.legLen);   // короткие лапы шагают чаще
        this.dustT -= dt;
        if (this.dustT <= 0) { this.dustT = 0.5; game.dust(this.x - this.dir * 15, this.y, 1); }
      }
    }

    // Доход
    this.coinTimer -= dt;
    if (this.coinTimer <= 0) {
      this.coinTimer = U.rand(4, 7);
      game.spawnCoin(this.x, this.y - 40 * this.size, this.info.coin);
    }
  }

  hit(px, py) {
    return Math.abs(px - this.x) < 40 * this.size && py < this.y + 14 && py > this.y - 75 * this.size;
  }

  pet(game) {
    if (this.jump > 0) return;
    this.jump = 1;
    this.happy = 1.5;
    this.labelT = 2.5;
    game.hearts(this.x, this.y - 70 * this.size, 3);
    game.spawnCoin(this.x, this.y - 40 * this.size, this.info.coin);
  }

  jumpHeight() { return Math.sin(this.jump * Math.PI) * 28; }

  drawDots(ctx, list, color, kx = 1, oy = 0) {
    for (const [x, y, rx, ry, rot] of list) U.ellipse(ctx, x * kx, y + oy, rx, ry, color, null, rot);
  }

  drawLeg(ctx, x, lh, angle, color, out) {
    ctx.save();
    ctx.translate(x, -lh);
    ctx.rotate(angle);
    ctx.lineWidth = 1.5;
    ctx.fillStyle = color;
    U.rrect(ctx, -3.8, -2, 7.6, lh + 2, 3.8);
    ctx.fill();
    ctx.strokeStyle = out;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    U.rrect(ctx, -2.6, 0, 2.2, lh * 0.75, 1.1);
    ctx.fill();

    // Пятна на лапе (далматин)
    const D = this.info.dots;
    if (D) {
      const k = x > 0 ? 0.3 : 0.5;
      U.ellipse(ctx, 0.3, lh * k, 1.7, 1.9, D);
      U.ellipse(ctx, -1, lh * (k + 0.3), 1.2, 1.3, D);
    }

    // Лапа с пальцами
    U.ellipse(ctx, 1.8, lh - 0.5, 5.4, 3.2, this.info.light, out);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(2.6, lh - 2.2); ctx.lineTo(2.6, lh + 0.6);
    ctx.moveTo(4.8, lh - 1.8); ctx.lineTo(4.8, lh + 0.8);
    ctx.stroke();
    ctx.restore();
  }

  drawTail(ctx, L, OUT) {
    const wag = Math.sin(this.tailT);

    // Хвост-бублик над спиной (хаски)
    if (L.tail === 'curl') {
      ctx.rotate(wag * 0.18);
      ctx.beginPath();
      ctx.moveTo(4, 3);
      ctx.bezierCurveTo(-14, 0, -17, -22, -5, -25);
      ctx.bezierCurveTo(4, -27, 9, -19, 5, -13);
      ctx.strokeStyle = OUT; ctx.lineWidth = 11.5; ctx.stroke();
      ctx.strokeStyle = L.body; ctx.lineWidth = 8.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, 3);
      ctx.bezierCurveTo(-12, 1, -15, -16, -9, -21);
      ctx.strokeStyle = L.light; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, -20); ctx.bezierCurveTo(-4, -26, 3, -25, 5, -19);
      ctx.strokeStyle = L.dark; ctx.lineWidth = 3; ctx.stroke();
      U.ellipse(ctx, 5, -13, 4, 4, L.light, OUT);
      return;
    }

    // Пушистый опущенный хвост (овчарка, сенбернар)
    if (L.tail === 'bushy') {
      const top = L.tailTop || L.dark;
      ctx.rotate(wag * 0.22 + 0.1);
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.bezierCurveTo(-10, 0, -18, 8, -20, 22);
      ctx.strokeStyle = OUT; ctx.lineWidth = 13; ctx.stroke();
      ctx.strokeStyle = L.tailColor || L.body; ctx.lineWidth = 10; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -2.5); ctx.bezierCurveTo(-11, -2.5, -20, 5, -22.5, 18);
      ctx.strokeStyle = top; ctx.lineWidth = 4.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, 3); ctx.bezierCurveTo(-8, 4, -14, 10, -16, 20);
      ctx.strokeStyle = L.light; ctx.lineWidth = 2.5; ctx.stroke();
      U.ellipse(ctx, -20.5, 23, 5, 6, L.tailTip || top, OUT, 0.3);
      return;
    }

    ctx.rotate(wag * 0.5 - 0.2);
    if (L.tail === 'fluffy') {
      U.ellipse(ctx, -7, -3, 9, 6, L.body, OUT, -0.5);
      U.ellipse(ctx, -11, -6, 4.5, 3.2, L.light, null, -0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-3, -5); ctx.quadraticCurveTo(-7, -8, -11, -8); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-12, -2, -14, -16);
      ctx.strokeStyle = OUT; ctx.lineWidth = 8.5; ctx.stroke();
      ctx.strokeStyle = L.body; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(-11, -4, -13, -13); ctx.stroke();
      U.ellipse(ctx, -14, -17, 3.6, 3.6, L.light);
      if (L.dots) {
        U.ellipse(ctx, -8, -3.5, 1.8, 1.6, L.dots);
        U.ellipse(ctx, -12.4, -9.8, 1.5, 1.4, L.dots);
      }
    }
  }

  // Стоячее ухо (корги, хаски, овчарка)
  pointyEar(ctx, x, y, rot, fill, inner, OUT, es = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(es, es);
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.quadraticCurveTo(-5, -12, 0, -20);
    ctx.quadraticCurveTo(6, -9, 7, 2);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 1.5 / es; ctx.stroke();
    if (inner) {
      ctx.beginPath();
      ctx.moveTo(-3, 1);
      ctx.quadraticCurveTo(-2.5, -9, 0.3, -15);
      ctx.quadraticCurveTo(4, -7, 4, 1);
      ctx.closePath();
      ctx.fillStyle = inner; ctx.fill();
    }
    ctx.restore();
  }

  // Бочонок на ошейнике (сенбернар)
  drawBarrel(ctx, x, y, OUT) {
    U.ellipse(ctx, x - 1, y - 5, 1.8, 1.8, '#f5c242', '#9c7400');
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.12);
    const g = ctx.createLinearGradient(0, -5, 0, 5);
    g.addColorStop(0, '#d6975a');
    g.addColorStop(0.5, '#9a6030');
    g.addColorStop(1, '#5e3416');
    ctx.fillStyle = g;
    U.rrect(ctx, -6.5, -4.5, 13, 9, 4);
    ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#f5c242';
    ctx.fillRect(-4.6, -4.5, 1.7, 9);
    ctx.fillRect(2.9, -4.5, 1.7, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    U.rrect(ctx, -5.5, -3.6, 11, 1.5, 0.7);
    ctx.fill();
    U.ellipse(ctx, 6.3, 0, 1.6, 4.2, '#b87a44', OUT);
    U.ellipse(ctx, 6.3, 0, 0.6, 1.2, '#5e3416');
    ctx.restore();
  }

  draw(ctx) {
    const L = this.info;
    const s = this.size * U.easeOutBack(this.spawnT);
    if (s <= 0.01) return;

    const walking = this.state === 'walk' && !this.held;
    const leg = Math.sin(this.walkT);
    const now = performance.now() / 1000;
    const bob = walking ? Math.abs(Math.sin(this.walkT)) * 2 : Math.sin(now * 2.5) * 0.6;
    const jumpH = this.jumpHeight();
    const lift = this.held ? 18 + Math.sin(now * 8) * 1.5 : 0;
    const OUT = L.outline || 'rgba(70,35,10,0.55)';
    const shine = L.shine || L.light;

    // Размеры породы
    const lh = 18 * L.legLen;
    const bl = L.bodyLen;
    const cy = -lh - 11;
    const bw = 25 * bl, bh = 14.5 * (L.bodyH || 1);

    // Сжатие и растяжение: дыхание, прыжок, приземление
    let sx = 1, sy = 1 + Math.sin(now * 2.5) * 0.012;
    if (this.jump > 0) {
      const st = Math.abs(Math.cos(this.jump * Math.PI)) * 0.12;
      sy = 1 + st; sx = 1 - st * 0.6;
    }
    if (this.squash > 0) {
      const k = this.squash / 0.22;
      sy = 1 - 0.16 * k; sx = 1 + 0.12 * k;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    const sh = Math.max(0.3, 1 - (jumpH + lift) / 70);
    U.softShadow(ctx, 2, 1, 32 * bl * s * sh, 8 * s * sh, 0.55);
    U.ellipse(ctx, 0, 0, 20 * bl * s * sh, 4.5 * s * sh, 'rgba(20,45,10,0.25)');

    ctx.translate(0, -jumpH - bob - lift);
    ctx.scale(this.dir * s * sx, s * sy);
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const tail = () => {
      ctx.save();
      ctx.translate(-bw + 3, cy - 3);
      this.drawTail(ctx, L, OUT);
      ctx.restore();
      ctx.lineWidth = 1.5;
    };

    // Дальние лапы
    this.drawLeg(ctx, 18 * bl, lh, -leg * 0.45, L.legFar || L.dark, OUT);
    this.drawLeg(ctx, -12 * bl, lh, leg * 0.45, L.legFar || L.dark, OUT);

    if (L.tail !== 'curl') tail();

    // Тело
    const bodyG = ctx.createRadialGradient(-6 * bl, cy - 11, 3, 0, cy + 1, 30 * bl);
    bodyG.addColorStop(0, shine);
    bodyG.addColorStop(0.45, L.body);
    bodyG.addColorStop(1, L.dark);
    U.ellipse(ctx, 0, cy, bw, bh, bodyG, OUT);

    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, cy, bw, bh, 0, 0, Math.PI * 2); ctx.clip();
    U.ellipse(ctx, 4 * bl, cy + 8.5, 15 * bl, 5.5, L.light);                  // живот
    if (L.saddle) {                                                             // тёмная спина
      U.ellipse(ctx, -3 * bl, cy - 10, bw * 0.85, L.saddleH || 8, L.saddle);
      U.ellipse(ctx, -8 * bl, cy - 13, bw * 0.4, 2.5, 'rgba(255,255,255,0.15)');
    }
    if (L.spot) {
      U.ellipse(ctx, -9 * bl, cy - 6, 9, 6, L.spot, null, -0.2);
      U.ellipse(ctx, -11 * bl, cy - 8, 4, 2.2, 'rgba(255,255,255,0.15)', null, -0.2);
    }
    if (L.bib) U.ellipse(ctx, bw - 4, cy + 2, 10, 13, L.light);               // белая грудь
    if (L.dots) {
      this.drawDots(ctx, BODY_DOTS, L.dots, bl, cy);
      U.softEllipse(ctx, 6 * bl, cy + 10, bw * 0.9, 6, '120,130,145', 0.25);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.2;            // блики шерсти
    for (const [fx, fy] of [[-2, -12], [6, -12.5], [-15, -9.5]]) {
      const x = fx * bl, y = cy + fy;
      ctx.beginPath(); ctx.moveTo(x - 3, y + 1); ctx.quadraticCurveTo(x, y - 1.5, x + 3, y + 1); ctx.stroke();
    }
    ctx.restore();
    ctx.lineWidth = 1.5;

    if (L.tail === 'curl') tail();

    // Ближние лапы
    this.drawLeg(ctx, 14 * bl, lh, leg * 0.45, L.legNear || L.body, OUT);
    this.drawLeg(ctx, -16 * bl, lh, -leg * 0.45, L.legNear || L.body, OUT);

    // Ошейник
    ctx.save();
    ctx.translate(bw - 6, cy - 8);
    ctx.rotate(-0.5);
    ctx.fillStyle = L.collar;
    U.rrect(ctx, -3, -9, 6, 18, 3); ctx.fill();
    ctx.strokeStyle = OUT; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    U.rrect(ctx, -2, -7, 1.5, 13, 0.7); ctx.fill();
    ctx.restore();

    // Жетон или бочонок
    const tx = bw - 3, ty = cy - 1;
    if (L.barrel) {
      this.drawBarrel(ctx, tx, ty + 4, OUT);
    } else {
      const tagG = ctx.createRadialGradient(tx - 1, ty - 1, 0.3, tx, ty, 3.5);
      tagG.addColorStop(0, '#fff3a0');
      tagG.addColorStop(1, '#d9a400');
      U.ellipse(ctx, tx, ty, 3, 3, tagG, '#9c7400');
    }

    if (L.scarf) drawScarf(ctx, L, bw, cy, OUT, this.walkT + now * 2);   // шарф (Снежная долина)
    // Голова
    const tilt = this.state === 'idle' && !this.held ? Math.sin(now * 1.3) * 0.06 : 0;
    const earFlap = Math.sin(this.walkT) * 0.15 - Math.sin(this.jump * Math.PI) * 0.5;
    const es = L.earSize || 1;
    ctx.save();
    ctx.translate(bw + 2, cy - 17);
    ctx.rotate(tilt);

    // Уши за головой
    if (L.ears === 'pointy') {
      this.pointyEar(ctx, -7, -7, -0.45 + earFlap * 0.3, L.earFar || L.dark, null, OUT, es);
      this.pointyEar(ctx, 2, -8, 0.2 + earFlap * 0.3, L.ear, L.earInner, OUT, es);
    } else {
      U.ellipse(ctx, -2, -10, 6 * es, 10 * es, L.earFar || L.dark, OUT, -0.5 + earFlap);
    }

    const headG = ctx.createRadialGradient(-5, -7, 2, 0, 0, 16);
    headG.addColorStop(0, shine);
    headG.addColorStop(0.5, L.body);
    headG.addColorStop(1, L.dark);
    U.ellipse(ctx, 0, 0, 14, 13, headG, OUT);

    // Рисунок на голове
    if (L.blaze || L.mask || L.dots || L.cap || L.headPatch) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, 0, 13.3, 12.3, 0, 0, Math.PI * 2); ctx.clip();
      if (L.headPatch) {                                                       // цветная голова (сенбернар)
        U.ellipse(ctx, -4, -3, 12.5, 11.5, L.headPatch);
        U.ellipse(ctx, -7, -9, 5, 2.2, 'rgba(255,255,255,0.15)', null, -0.3);
      }
      if (L.blaze) U.ellipse(ctx, 7.5, -4, 3.2, 10, L.light, null, -0.45);   // белая полоса
      if (L.mask) {                                                            // маска (хаски)
        U.ellipse(ctx, -2, -10, 12, 6, L.dark);
        U.ellipse(ctx, 4, 7, 15, 8, L.light);
        U.ellipse(ctx, 6.5, -3, 6.5, 5.5, L.light);
        U.ellipse(ctx, -9, 4, 5, 7, L.light, null, 0.3);
      }
      if (L.cap) {                                                             // макушка и маска (овчарка)
        U.ellipse(ctx, -3, -9, 13, 7.5, L.cap, null, -0.15);
        U.ellipse(ctx, 9, 3, 7, 6, L.cap);
        U.ellipse(ctx, -6, -12, 5, 2, 'rgba(255,255,255,0.12)', null, -0.2);
      }
      if (L.eyePatch) U.ellipse(ctx, 5.5, -4, 5.6, 5.4, L.eyePatch);         // пятно у глаза
      if (L.dots) this.drawDots(ctx, HEAD_DOTS, L.dots);
      ctx.restore();
    }
    U.ellipse(ctx, -3, -8, 6, 3, 'rgba(255,255,255,0.3)', null, -0.3);  // блик на макушке

    // Морда
    U.ellipse(ctx, 11, 5, 10, 7, L.muzzle || L.light, OUT);
    if (L.muzzle) U.ellipse(ctx, 9, 2.5, 5, 2, 'rgba(255,255,255,0.12)');
    if (L.jowls) {                                                             // отвисшие щёки
      U.ellipse(ctx, 12.5, 9.5, 6.5, 3.8, L.light, OUT);
      U.ellipse(ctx, 12.5, 11, 5, 1.8, 'rgba(160,120,90,0.2)');
    }
    U.ellipse(ctx, 12, 8.5, 8, 2.8, 'rgba(160,100,50,0.18)');
    [[9, 3.5], [11.5, 5.5], [8.5, 6.5]].forEach(([wx, wy]) => U.ellipse(ctx, wx, wy, 0.6, 0.6, L.whisker || '#b07a4a'));

    // Нос
    const noseG = ctx.createRadialGradient(18, 1, 0.5, 19, 2, 4.5);
    noseG.addColorStop(0, '#5a4a40');
    noseG.addColorStop(1, '#1a110c');
    U.ellipse(ctx, 19, 2, 4.2, 3.2, noseG);
    U.ellipse(ctx, 17.8, 0.8, 1.5, 0.9, 'rgba(255,255,255,0.85)');

    // Рот и язык
    ctx.strokeStyle = L.mouth || '#5a3418'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(18.5, 5); ctx.quadraticCurveTo(16, 9, 12, 8); ctx.stroke();
    if (this.happy > 0 || this.held) {
      ctx.lineWidth = 1.2;
      U.ellipse(ctx, 14, 11, 3.5, 4.5, '#ff6b81', '#c2185b');
      ctx.strokeStyle = '#c2185b';
      ctx.beginPath(); ctx.moveTo(14, 8.5); ctx.lineTo(14, 12.5); ctx.stroke();
    }

    U.softEllipse(ctx, 5, 6.5, 4.5, 2.6, '255,110,110', 0.45);      // щёчка

    // Глаз: моргает, а когда радуется, становится "^". На тёмной шерсти линия светлая
    const darkFur = L.cap || L.eyePatch;
    ctx.strokeStyle = darkFur ? '#f3dcb8' : '#2b1d14';
    if (this.blink > 0) {
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(9, -4); ctx.stroke();
    } else if (this.happy > 0) {
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(3, -3); ctx.quadraticCurveTo(6, -8, 9, -3); ctx.stroke();
    } else {
      const E = L.eye || ['#6b4426', '#2b1d14', '#120b07'];
      ctx.lineWidth = 1.2;
      U.ellipse(ctx, 6, -4, 3.8, 4.4, '#fff', OUT);
      const eyeG = ctx.createRadialGradient(7, -4.5, 0.3, 7, -3.5, 3);
      eyeG.addColorStop(0, E[0]);
      eyeG.addColorStop(0.6, E[1]);
      eyeG.addColorStop(1, E[2]);
      U.ellipse(ctx, 7, -3.5, 2.6, 3, eyeG);
      if (L.eye) U.ellipse(ctx, 7.2, -3.3, 1.1, 1.3, '#0b1a26');
      U.ellipse(ctx, 7.9, -5, 1.1, 1.1, '#fff');
      U.ellipse(ctx, 6.2, -2.2, 0.5, 0.5, 'rgba(255,255,255,0.8)');
    }

    // Бровь (у овчарки это рыжая точка над глазом)
    const browY = this.happy > 0 ? -11.5 : -10;
    ctx.strokeStyle = L.brow || L.dark; ctx.lineWidth = L.cap ? 2.4 : 1.6;
    ctx.beginPath(); ctx.moveTo(3, browY + 0.8); ctx.quadraticCurveTo(6, browY - 1, 9.5, browY + 0.5); ctx.stroke();

    // Ближнее висячее ухо (дворняжка, далматин, сенбернар)
    if (L.ears === 'floppy') {
      ctx.lineWidth = 1.5;
      U.ellipse(ctx, -6, -1 + (es - 1) * 6, 6 * es, 11 * es, L.ear, OUT, 0.35 + earFlap);
            U.ellipse(ctx, -5, -3 + (es - 1) * 6, 2.5 * es, 6.5 * es, 'rgba(255,255,255,0.13)', null, 0.35 + earFlap);
    }
    if (L.crown) drawCrown(ctx, now);   // корона (ретривер)
    ctx.restore();

    ctx.restore();
  }

  // Табличка с именем после нажатия
  drawLabel(ctx) {
    if (this.labelT <= 0) return;
    const text = `${this.info.name} · ур. ${this.level}`;
    const y = this.y - 90 * this.size - this.jumpHeight();
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.labelT * 2);
    ctx.font = 'bold 13px system-ui, sans-serif';
    const w = ctx.measureText(text).width + 22;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    U.rrect(ctx, this.x - w / 2 + 1, y - 10, w, 24, 12); ctx.fill();

    const lg = ctx.createLinearGradient(0, y - 12, 0, y + 12);
    lg.addColorStop(0, '#ffffff');
    lg.addColorStop(1, '#fff1d0');
    ctx.fillStyle = lg;
    U.rrect(ctx, this.x - w / 2, y - 12, w, 24, 12); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x - 6, y + 11); ctx.lineTo(this.x, y + 18); ctx.lineTo(this.x + 6, y + 11);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f08c00'; ctx.lineWidth = 2;
    U.rrect(ctx, this.x - w / 2, y - 12, w, 24, 12); ctx.stroke();

    ctx.fillStyle = '#8a4b00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.x, y + 1);
    ctx.restore();
  }
}
// Корона ретривера. Рисуется в координатах головы
function drawCrown(ctx, now) {
  ctx.save();
  ctx.translate(0, -11.5);
  ctx.rotate(-0.2);
  ctx.lineJoin = 'round';

  U.softEllipse(ctx, 0, 1, 10, 2.6, '90,50,0', 0.35);   // тень на макушке

  // Зубцы
  const g = ctx.createLinearGradient(-10, -13, 10, 2);
  g.addColorStop(0, '#fff7c2');
  g.addColorStop(0.35, '#ffd43b');
  g.addColorStop(0.75, '#f0a500');
  g.addColorStop(1, '#b86e00');
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(-10.5, -10);
  ctx.lineTo(-5, -5.5);
  ctx.lineTo(0, -13);
  ctx.lineTo(5, -5.5);
  ctx.lineTo(10.5, -10);
  ctx.lineTo(9, 0);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#8a5200';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Обод
  const rim = ctx.createLinearGradient(0, -3, 0, 1.5);
  rim.addColorStop(0, '#ffe066');
  rim.addColorStop(1, '#c47f00');
  ctx.fillStyle = rim;
  U.rrect(ctx, -9.8, -3, 19.6, 4, 1.8);
  ctx.fill();
  ctx.stroke();

  // Шарики на зубцах
  for (const [x, y] of [[-10.5, -10], [0, -13], [10.5, -10]]) {
    U.ellipse(ctx, x, y, 1.9, 1.9, '#fff3a0', '#8a5200');
    U.ellipse(ctx, x - 0.6, y - 0.6, 0.6, 0.6, '#ffffff');
  }

  // Камни
  U.ellipse(ctx, 0, -1, 2.2, 1.6, '#e03131', '#7a1010');
  U.ellipse(ctx, -0.7, -1.5, 0.7, 0.45, 'rgba(255,255,255,0.85)');
  U.ellipse(ctx, -5.8, -1, 1.3, 1.1, '#4dabf7', '#1864ab');
  U.ellipse(ctx, 5.8, -1, 1.3, 1.1, '#51cf66', '#2b8a3e');

  // Блик на золоте
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(-8, -4.5); ctx.lineTo(-9, -8.5); ctx.stroke();

  // Искра на верхнем зубце раз в 2,5 секунды
  const t = (now % 2.5) / 2.5;
  if (t < 0.2) {
    const a = Math.sin(t / 0.2 * Math.PI), z = 5 * a;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -13 - z);
    ctx.quadraticCurveTo(0, -13, z, -13);
    ctx.quadraticCurveTo(0, -13, 0, -13 + z);
    ctx.quadraticCurveTo(0, -13, -z, -13);
    ctx.quadraticCurveTo(0, -13, 0, -13 - z);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// Вязаный шарф. Рисуется поверх ошейника
function drawScarf(ctx, L, bw, cy, OUT, t) {
  const [c1, c2] = L.scarf;

  // Кольцо вокруг шеи
  ctx.save();
  ctx.translate(bw - 6, cy - 8);
  ctx.rotate(-0.5);
  U.rrect(ctx, -5, -11, 10, 22, 5);
  ctx.fillStyle = c1;
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = c2;
  for (const y of [-6, 0, 6]) ctx.fillRect(-5, y - 1.2, 10, 2.4);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.8;
  for (let y = -10; y < 11; y += 2.5) {
    ctx.beginPath(); ctx.moveTo(-1, y); ctx.lineTo(1, y + 1.2); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  // Свисающий конец с бахромой
  ctx.save();
  ctx.translate(bw - 10, cy - 1);
  ctx.rotate(0.2 + Math.sin(t) * 0.12);
  U.rrect(ctx, -3.5, 0, 7, 15, 2.5);
  ctx.fillStyle = c1;
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = c2;
  ctx.fillRect(-3.5, 4, 7, 2);
  ctx.fillRect(-3.5, 9, 7, 2);
  ctx.strokeStyle = c2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const x of [-2.4, -0.8, 0.8, 2.4]) { ctx.moveTo(x, 15.5); ctx.lineTo(x, 18.5); }
  ctx.stroke();
  ctx.restore();
}
