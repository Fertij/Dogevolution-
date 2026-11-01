// Магазин: покупка щенка, который прилетает в коробке
const SHOP = {
  basePrice: 10,   // цена первого щенка (в других мирах умножается на priceMul)
  growth: 1.15,    // каждый следующий дороже на 15%
  maxDogs: 12      // сколько собак помещается на поле
};

class Box {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.h = 420;
    this.vy = 0;
    this.state = 'fall';
    this.t = 0;
    this.squash = 0;
    this.done = false;
  }

  update(dt, game) {
    this.t += dt;
    if (this.state === 'fall') {
      this.vy += 1400 * dt;
      this.h -= this.vy * dt;
      if (this.h <= 0) {
        this.h = 0;
        if (this.vy > 250) {
          this.vy = -this.vy * 0.3;
          this.squash = 1;
          game.dust(this.x, this.y, 6);
        } else {
          this.vy = 0;
          this.state = 'wait';
          this.t = 0;
        }
      }
    } else if (this.state === 'wait' && this.t > 1.2) {
      this.open(game);
    }
    this.squash = Math.max(0, this.squash - dt * 4);
  }

  hit(px, py) {
    return px > this.x - 26 && px < this.x + 34 && py > this.y - this.h - 44 && py < this.y + 6;
  }

  open(game) {
    if (this.done) return;
    this.done = true;
    game.dust(this.x, this.y, 14);
    game.sparks(this.x, this.y - 25, 10);
    game.ring(this.x, this.y);
    const dog = new Dog(this.x, this.y, World.base());
    dog.happy = 1;
    game.addDog(dog);

    // Подсказка про слияние, один раз
    const pups = game.dogs.filter(d => d.level === World.base()).length;
    if (pups >= 2 && !localStorage.getItem('dogevo_hint')) {
      localStorage.setItem('dogevo_hint', '1');
      game.toast('Перетащи щенка на другого', 'Получится новая порода');
    }
  }

  draw(ctx) {
    const air = Math.min(1, this.h / 300);
    U.softShadow(ctx, this.x + 3, this.y + 1, 30 - air * 16, 8 - air * 4, 0.5 - air * 0.3);

    const wob = this.state === 'wait' ? Math.sin(this.t * 22) * 0.06 * Math.min(1, this.t / 0.6) : 0;
    const OUT = 'rgba(70,35,10,0.6)';
    ctx.save();
    ctx.translate(this.x, this.y - this.h);
    ctx.rotate(wob);
    ctx.scale(1 + this.squash * 0.2, 1 - this.squash * 0.18);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = OUT;

    // Бок
    ctx.fillStyle = '#9a6630';
    ctx.beginPath();
    ctx.moveTo(22, 0); ctx.lineTo(32, -7); ctx.lineTo(32, -41); ctx.lineTo(22, -34);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Перед
    const fg = ctx.createLinearGradient(-22, -34, 22, 0);
    fg.addColorStop(0, '#ecbd78');
    fg.addColorStop(1, '#c08443');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.rect(-22, -34, 44, 34); ctx.fill(); ctx.stroke();

    // Верх
    ctx.fillStyle = '#f5d394';
    ctx.beginPath();
    ctx.moveTo(-22, -34); ctx.lineTo(-12, -41); ctx.lineTo(32, -41); ctx.lineTo(22, -34);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,70,25,0.6)';
    ctx.beginPath(); ctx.moveTo(-17, -37.5); ctx.lineTo(27, -37.5); ctx.stroke();

    // Скотч
    ctx.fillStyle = 'rgba(255,240,200,0.8)';
    ctx.beginPath();
    ctx.moveTo(-4, -34); ctx.lineTo(4, -34); ctx.lineTo(14, -41); ctx.lineTo(6, -41);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(-4, -34, 8, 11);

    // Отпечаток лапы
    const paw = 'rgba(110,60,20,0.55)';
    U.ellipse(ctx, 0, -10, 5.5, 4.5, paw);
    [[-5, -15.5], [-1.8, -18.5], [1.8, -18.5], [5, -15.5]].forEach(([px, py]) => U.ellipse(ctx, px, py, 1.9, 2.2, paw));

    // Блик на ребре
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.moveTo(-20.5, -32); ctx.lineTo(-20.5, -2); ctx.stroke();
    ctx.restore();
  }
}

const Shop = {
  bought: Number(localStorage.getItem('dogevo_bought')) || 0,

  price() { return Math.round(SHOP.basePrice * World.cur().priceMul * Math.pow(SHOP.growth, this.bought)); },

  full(game) { return game.dogs.length + game.boxes.length >= SHOP.maxDogs; },

  init(game) {
    this.btn = document.getElementById('buyBtn');
    this.priceEl = document.getElementById('price');
    this.btn.addEventListener('click', () => this.buy(game));
    this.refresh(game);
  },

  refresh(game) {
    if (!this.btn) return;
    const p = this.price();
    const full = this.full(game);
    const can = !full && game.money >= p;
    this.priceEl.textContent = p;
    this.btn.classList.toggle('poor', !can);
    this.btn.classList.toggle('ready', can);
    this.btn.style.setProperty('--p', full ? 0 : Math.min(1, game.money / p));
  },

  shake() {
    this.btn.classList.remove('shake');
    void this.btn.offsetWidth;
    this.btn.classList.add('shake');
  },

  buy(game) {
    if (this.full(game)) {
      this.shake();
      game.toast('Поле заполнено', 'Объедини одинаковых собак');
      return;
    }
    const p = this.price();
    if (game.money < p) {
      this.shake();
      return;
    }
    game.money -= p;
    this.bought++;
    localStorage.setItem(World.key('bought'), this.bought);
    const pt = game.field.randomPoint();
    game.boxes.push(new Box(pt.x, pt.y));
    game.updateMoney(false);
    game.save();
  }
};
