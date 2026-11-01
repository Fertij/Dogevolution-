// Дерево прокачки: 6 веток по 6 улучшений, покупаются за монеты.
// В каждой ветке следующее улучшение открывается после предыдущего.
// Здесь же новая цена щенка

// Базовая цена щенка в каждом мире
const PRICE_BASE = { forest: 10, winter: 1500 };
const PRICE_STEP = 0.08;   // +8% от базовой цены за каждую покупку
const PRICE_CAP = 20;      // но не дороже базовой в 20 раз

const UPG_COST = [150, 2000, 25000, 4e5, 6e6, 1e8];

// fx: значение эффекта в зависимости от того, сколько улучшений ветки изучено (0–6)
const UPG = [
  { id: 'income', name: 'Доход', icon: '💰', col: ['#fff3a0', '#f59f00', '#8a4b00'], k: 1,
    fx: { income: [1, 1.1, 1.25, 1.5, 1.8, 2.2, 3] },
    nodes: [['🪙', 'Блестящие монеты', 'Все монеты ×1,1'], ['💵', 'Копилка', 'Все монеты ×1,25'],
      ['💳', 'Сбережения', 'Все монеты ×1,5'], ['🏦', 'Банк', 'Все монеты ×1,8'],
      ['💎', 'Сокровища', 'Все монеты ×2,2'], ['👑', 'Золотой дождь', 'Все монеты ×3']] },
  { id: 'speed', name: 'Скорость', icon: '⚡', col: ['#a5d8ff', '#228be6', '#0b4f94'], k: 1.2,
    fx: { speed: [1, 0.93, 0.86, 0.78, 0.7, 0.62, 0.5] },
    nodes: [['🦴', 'Бодрость', 'Пауза между монетами −7%'], ['🥩', 'Энергия', 'Пауза между монетами −14%'],
      ['🐾', 'Резвые лапы', 'Пауза между монетами −22%'], ['🌀', 'Вихрь', 'Пауза между монетами −30%'],
      ['🚀', 'Турбо', 'Пауза между монетами −38%'], ['⭐', 'Молния', 'Монеты появляются в 2 раза чаще']] },
  { id: 'shop', name: 'Магазин', icon: '🛒', col: ['#b2f2bb', '#2fb84a', '#1a6b2c'], k: 0.8,
    fx: { disc: [1, 0.95, 0.9, 0.9, 0.82, 0.75, 0.75], luck: [0, 0, 0, 0.1, 0.1, 0.1, 0.25] },
    nodes: [['🏷️', 'Скидка', 'Щенки дешевле на 5%'], ['🎟️', 'Купон', 'Щенки дешевле на 10%'],
      ['🍀', 'Удачная коробка', '10% шанс: в коробке собака уровнем выше'], ['🛍️', 'Оптом', 'Щенки дешевле на 18%'],
      ['🏪', 'Свой магазин', 'Щенки дешевле на 25%'], ['🎁', 'Сюрприз', '25% шанс на собаку уровнем выше']] },
  { id: 'yard', name: 'Двор', icon: '🏡', col: ['#ffd8a8', '#e8590c', '#8a3a0c'], k: 1.5,
    fx: { cap: [12, 13, 14, 15, 16, 17, 18] },
    nodes: [['🪵', 'Колышки', 'Мест на поле: 13'], ['🧱', 'Новый забор', 'Мест на поле: 14'],
      ['🌼', 'Клумбы', 'Мест на поле: 15'], ['🏠', 'Вторая будка', 'Мест на поле: 16'],
      ['🏘️', 'Большой двор', 'Мест на поле: 17'], ['🏰', 'Поместье', 'Мест на поле: 18']] },
  { id: 'care', name: 'Забота', icon: '❤️', col: ['#ffc9de', '#e64980', '#8f1d4a'], k: 1,
    fx: { pet: [1, 2, 3, 3, 5, 5, 8], auto: [0, 0, 0, 15, 15, 8, 5] },
    nodes: [['🤚', 'Ласка', 'Поглаживание: монеты ×2'], ['🧸', 'Игрушки', 'Поглаживание: монеты ×3'],
      ['🤖', 'Автоглажка', 'Сама гладит собаку раз в 15 с'], ['🛁', 'Купание', 'Поглаживание: монеты ×5'],
      ['🎾', 'Мячик', 'Автоглажка раз в 8 с'], ['💖', 'Любовь', 'Поглаживание ×8, автоглажка раз в 5 с']] },
  { id: 'evo', name: 'Эволюция', icon: '✨', col: ['#e5dbff', '#845ef7', '#3b1f8c'], k: 1.4,
    fx: { bonus: [0, 5, 10, 10, 20, 20, 40], skip: [0, 0, 0, 0.1, 0.1, 0.2, 0.25] },
    nodes: [['✨', 'Искра', 'Слияние: бонус 5 монет новой собаки'], ['🧪', 'Мутация', 'Бонус за слияние ×10'],
      ['🧬', 'Скачок', '10% шанс: слияние даёт +2 уровня'], ['🔮', 'Магия', 'Бонус за слияние ×20'],
      ['🌟', 'Чудо', '20% шанс на +2 уровня'], ['🌈', 'Золотое слияние', 'Бонус ×40, шанс +2 уровня 25%']] }
];

const TREE_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 0-4.8 3.6A4.5 4.5 0 0 0 5 14h5.5v4.5H8.5V21h7v-2.5h-2V14H19a4.5 4.5 0 0 0-2.2-8.4A5 5 0 0 0 12 2z"/></svg>';

const Upgrades = {
  lv: {},
  sel: [0, 0],
  petting: false,
  autoAcc: 0,

  n(id) { return this.lv[id] || 0; },
  total() { return UPG.reduce((s, b) => s + this.n(b.id), 0); },
  fx(name) { const b = UPG.find(b => b.fx[name]); return b.fx[name][this.n(b.id)]; },
  priceMul() { return this.fx('disc'); },
  cost(b, i) { return Math.round(UPG_COST[i] * b.k); },

  init() {
    try { this.lv = JSON.parse(localStorage.getItem('dogevo_upg')) || {}; } catch (e) { this.lv = {}; }
    this.addStyle();
    this.build();
    this.hook();
    this.apply();
    setInterval(() => this.tick(), 500);
  },

  save() { localStorage.setItem('dogevo_upg', JSON.stringify(this.lv)); },

  apply() {
    SHOP.maxDogs = this.fx('cap');
    Shop.refresh(game);
  },

  // ---------- Подключение эффектов к игре ----------
  hook() {
    const UP = this;

    // Новая цена щенка: растёт медленно и с потолком
    Shop.price = function () {
      const w = World.cur();
      const base = PRICE_BASE[w.id] || SHOP.basePrice * w.priceMul;
      const grow = Math.min(PRICE_CAP, 1 + PRICE_STEP * this.bought);
      return Math.max(1, Math.round(base * grow * UP.priceMul()));
    };

    // Доход и поглаживание
    const spawn = game.spawnCoin;
    game.spawnCoin = function (x, y, v) {
      let m = UP.fx('income');
      if (UP.petting) m *= UP.fx('pet');
      return spawn.call(this, x, y, Math.max(1, Math.round(v * m)));
    };

    const pet = Dog.prototype.pet;
    Dog.prototype.pet = function (g) {
      UP.petting = true;
      try { return pet.call(this, g); } finally { UP.petting = false; }
    };

    // Скорость: когда таймер монеты перезапускается, он становится короче
    const upd = Dog.prototype.update;
    Dog.prototype.update = function (dt, g) {
      const before = this.coinTimer;
      upd.call(this, dt, g);
      if (this.coinTimer > before) this.coinTimer *= UP.fx('speed');
    };

    // Удачная коробка
    const open = Box.prototype.open;
    Box.prototype.open = function (g) {
      const before = game.dogs.length;
      const r = open.call(this, g);
      if (game.dogs.length > before && Math.random() < UP.fx('luck')) {
        UP.levelUp(game.dogs[game.dogs.length - 1], '🍀 Удачная коробка!');
      }
      return r;
    };

    // Эволюция: бонус и скачок через уровень
    const mergeDogs = merge;
    merge = function (a, b) {
      const before = new Set(game.dogs);
      const r = mergeDogs(a, b);
      const nd = game.dogs.find(d => !before.has(d));
      if (nd) {
        if (Math.random() < UP.fx('skip')) UP.levelUp(nd, '🧬 Скачок эволюции!');
        const bonus = UP.fx('bonus');
        if (bonus) game.spawnCoin(nd.x, nd.y - 40 * nd.size, DOG_LEVELS[nd.level].coin * bonus);
      }
      return r;
    };

    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      UP.lv = {};
      UP.save();
      UP.apply();
    };
  },

  levelUp(d, title) {
    const nl = d.level + 1;
    if (!DOG_LEVELS[nl] || nl > World.topLevel(World.index)) return;
    d.level = nl;
    d.size = new Dog(0, 0, nl).size;
    d.happy = 2;
    d.labelT = 3;
    game.sparks(d.x, d.y - 30, 14);
    game.ring(d.x, d.y);
    if (nl > game.best) {
      game.best = nl;
      localStorage.setItem('dogevo_best', nl);
    }
    game.toast(title, DOG_LEVELS[nl].name);
    game.save();
  },

  // Автоглажка и красная точка на кнопке
  tick() {
    const canBuy = UPG.some(b => this.n(b.id) < 6 && game.money >= this.cost(b, this.n(b.id)));
    this.hud.classList.toggle('can', canBuy);
    if (this.el.classList.contains('show')) this.render();

    const iv = this.fx('auto');
    if (!iv || Menu.visible || (typeof Cutscene !== 'undefined' && Cutscene.active)) return;
    this.autoAcc += 0.5;
    if (this.autoAcc < iv) return;
    this.autoAcc = 0;
    const list = game.dogs.filter(d => !d.held && d.jump <= 0);
    if (list.length) list[(Math.random() * list.length) | 0].pet(game);
  },

  // ---------- Окно ----------
  vars(el, b) {
    el.style.setProperty('--c1', b.col[0]);
    el.style.setProperty('--c2', b.col[1]);
    el.style.setProperty('--c3', b.col[2]);
  },

  build() {
    // Кнопка в игре
    const hud = document.createElement('button');
    hud.id = 'upgBtn';
    hud.setAttribute('aria-label', 'Прокачка');
    hud.innerHTML = TREE_ICON;
    hud.addEventListener('click', () => this.open());
    document.body.appendChild(hud);
    this.hud = hud;

    // Кнопка в меню
    const mb = document.querySelector('#menu .menu-buttons');
    if (mb) {
      const row = document.createElement('div');
      row.className = 'menu-row';
      row.innerHTML = `<button class="mbtn upg">${TREE_ICON}<span>Прокачка</span></button>`;
      row.firstChild.addEventListener('click', () => this.open());
      mb.appendChild(row);
    }

    const el = document.createElement('div');
    el.id = 'upgrades';
    el.innerHTML =
      `<div class="panel"><div class="panel-badge up-badge">${TREE_ICON}</div>` +
      '<button class="close" aria-label="Закрыть">✕</button>' +
      '<div class="panel-title">Прокачка</div>' +
      '<div class="up-wallet"><svg viewBox="0 0 64 64"><use href="#coin"/></svg><span class="up-money"></span></div>' +
      '<div class="up-tree"></div>' +
      '<div class="up-root"><span>🌱 Изучено</span><div class="up-bar"><i></i></div><b class="up-count"></b></div>' +
      '<div class="up-info"></div></div>';
    document.body.appendChild(el);
    this.el = el;
    el.querySelector('.close').addEventListener('click', () => el.classList.remove('show'));
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });

    // Колонки веток: первое улучшение внизу, название ветки сверху
    const tree = el.querySelector('.up-tree');
    this.cols = UPG.map((b, bi) => {
      const col = document.createElement('div');
      col.className = 'up-col';
      this.vars(col, b);
      const track = document.createElement('div');
      track.className = 'up-track';
      track.innerHTML = '<i></i>';
      col.appendChild(track);
      const nodes = b.nodes.map((nd, i) => {
        const n = document.createElement('button');
        n.className = 'up-node';
        n.addEventListener('click', () => { this.sel = [bi, i]; this.render(); });
        col.appendChild(n);
        return n;
      });
      const head = document.createElement('div');
      head.className = 'up-head';
      head.innerHTML = `<b>${b.icon}</b>`;
      head.appendChild(document.createTextNode(b.name));
      col.appendChild(head);
      tree.appendChild(col);
      return { fill: track.firstChild, nodes };
    });
  },

  open() {
    // Выбираем первое доступное улучшение
    const bi = UPG.findIndex(b => this.n(b.id) < 6);
    if (bi >= 0) this.sel = [bi, this.n(UPG[bi].id)];
    this.render();
    this.el.classList.add('show');
  },

  render() {
    const money = game.money;
    this.el.querySelector('.up-money').textContent = fmtNum(money);
    const tot = this.total();
    this.el.querySelector('.up-count').textContent = `${tot} / 36`;
    this.el.querySelector('.up-bar i').style.width = (tot / 36 * 100) + '%';

    UPG.forEach((b, bi) => {
      const n = this.n(b.id), c = this.cols[bi];
      c.fill.style.height = n ? (31 + (n - 1) * 46) + 'px' : '0';
      c.nodes.forEach((el, i) => {
        const sel = this.sel[0] === bi && this.sel[1] === i;
        el.className = 'up-node' + (i < n ? ' got' : i === n ? ' next' : ' lock') + (sel ? ' sel' : '');
        el.innerHTML = b.nodes[i][0] + (i < n ? '<span class="ck">✓</span>' : i > n ? '<span class="lk">🔒</span>' : '');
      });
    });

    // Карточка выбранного улучшения
    const [bi, i] = this.sel, b = UPG[bi], nd = b.nodes[i], n = this.n(b.id);
    const info = this.el.querySelector('.up-info');
    this.vars(info, b);
    const state = i < n ? 'got' : i === n ? 'next' : 'lock';
    const cost = this.cost(b, i), can = state === 'next' && money >= cost;
    info.innerHTML =
      `<div class="up-big">${nd[0]}</div>` +
      `<div class="up-txt"><small>${b.icon} ${b.name} · ${i + 1}/6</small><b>${nd[1]}</b><span>${nd[2]}</span></div>`;
    const btn = document.createElement('button');
    btn.className = 'up-buy' + (can ? '' : ' off') + (state === 'got' ? ' got' : '');
    btn.innerHTML = state === 'got' ? '✓<em>Изучено</em>'
      : state === 'lock' ? '🔒<em>Нужно прошлое</em>'
      : `Изучить<em><svg viewBox="0 0 64 64"><use href="#coin"/></svg>${fmtNum(cost)}</em>`;
    btn.addEventListener('click', () => this.buy(bi, i));
    info.appendChild(btn);
  },

  buy(bi, i) {
    const b = UPG[bi], n = this.n(b.id);
    if (i !== n) return;
    const cost = this.cost(b, i);
    if (game.money < cost) {
      if (typeof Sound !== 'undefined') Sound.error();
      if (typeof Settings !== 'undefined') Settings.vibrate(60);
      game.toast('Не хватает монет', 'Нужно ' + fmtNum(cost));
      return;
    }
    game.money -= cost;
    game.updateMoney(false);
    this.lv[b.id] = n + 1;
    this.save();
    this.apply();
    if (i < 5) this.sel = [bi, i + 1];
    this.render();

    // Улучшение вспыхивает
    const node = this.cols[bi].nodes[i];
    node.classList.add('pop');
    const burst = document.createElement('span');
    burst.className = 'up-burst';
    node.appendChild(burst);
    if (typeof Sound !== 'undefined') {
      [659, 784, 988, 1319].forEach((f, k) => Sound.tone(f, 0.2, { type: 'triangle', vol: 0.25, delay: k * 0.07 }));
    }
    if (typeof Settings !== 'undefined') Settings.vibrate([20, 30, 40]);
  },

  addStyle() {
    const s = document.createElement('style');
    s.textContent = `
#upgBtn{position:fixed;top:74px;right:12px;z-index:11;display:grid;place-items:center;width:46px;height:46px;border:3px solid #f2b638;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8ce99a,#2b8a3e);box-shadow:0 4px 0 #8a5a12,0 8px 14px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.35)}
#upgBtn svg{width:26px;height:26px;fill:#fff6cf}
#upgBtn:active{transform:translateY(3px);box-shadow:0 1px 0 #8a5a12}
#upgBtn.can::after{content:'';position:absolute;top:-3px;right:-3px;width:14px;height:14px;border:2px solid #fff;border-radius:50%;background:#e03131;animation:badgePulse 1.2s ease-in-out infinite}
.mbtn.upg{flex:1;width:auto;height:50px;font-size:20px;border:3px solid #0b7285;background:linear-gradient(#99e9f2 0%,#3bc9db 40%,#15aabf 65%,#0c8599 100%);box-shadow:0 6px 0 #0b5f6e,0 12px 20px rgba(0,0,0,.35),inset 0 3px 0 rgba(255,255,255,.55);text-shadow:0 2px 0 #0b5f6e}
.mbtn.upg svg{width:24px;height:24px;fill:#fff;filter:drop-shadow(0 2px 0 #0b5f6e)}
.mbtn.upg:active{transform:translateY(5px);box-shadow:0 1px 0 #0b5f6e}
#upgrades{position:fixed;inset:0;z-index:74;display:flex;padding:40px 10px 14px;overflow-y:auto;background:rgba(10,25,10,.7);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}
#upgrades.show{opacity:1;visibility:visible}
#upgrades .panel{margin:auto;width:min(96vw,410px);max-height:none;padding:42px 10px 12px;overflow:visible}
#upgrades.show .panel{transform:scale(1)}
.up-badge svg{width:36px;height:36px;fill:#7a4300;animation:trophyBob 2.4s ease-in-out infinite}
.up-wallet{display:flex;align-items:center;gap:6px;width:max-content;margin:-6px auto 10px;padding:4px 14px 4px 4px;border:2px solid #f2b638;border-radius:16px;background:linear-gradient(#70482a,#3e2611);box-shadow:0 3px 0 #8a5a12;font:900 17px/1 'Nunito',system-ui,sans-serif;color:#fff6cf}
.up-wallet svg{width:26px;height:26px}
.up-tree{display:flex;justify-content:space-between;gap:2px;padding:10px 4px 0;border:3px solid #5a3010;border-bottom:0;border-radius:18px 18px 0 0;background:radial-gradient(ellipse at 50% 105%,rgba(150,230,110,.45),transparent 65%),radial-gradient(circle at 20% 15%,rgba(255,255,255,.08),transparent 40%),linear-gradient(#22402a,#16291a);box-shadow:inset 0 4px 10px rgba(0,0,0,.5)}
.up-col{position:relative;flex:1;display:flex;flex-direction:column-reverse;align-items:center;gap:8px;padding-bottom:12px}
.up-track{position:absolute;left:50%;bottom:0;width:6px;height:261px;margin-left:-3px;border-radius:3px;background:rgba(0,0,0,.45)}
.up-track i{position:absolute;left:0;right:0;bottom:0;height:0;border-radius:3px;background:linear-gradient(var(--c1),var(--c2));box-shadow:0 0 8px var(--c2);transition:height .5s}
.up-head{display:flex;flex-direction:column;align-items:center;gap:3px;height:34px;margin-bottom:2px;font:900 10px/1 'Nunito',system-ui,sans-serif;color:#fff;text-shadow:0 1px 0 #000;white-space:nowrap}
.up-head b{display:grid;place-items:center;width:24px;height:24px;border:2px solid #fff;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--c1),var(--c2) 60%,var(--c3));font-size:12px}
.up-node{position:relative;z-index:1;width:38px;height:38px;padding:0;border:3px solid #6b7a6a;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8a968a,#4a564a);font-size:17px;line-height:1;box-shadow:0 3px 0 rgba(0,0,0,.45);transition:transform .15s}
.up-node.lock{filter:grayscale(1) brightness(.85)}
.up-node.got{border-color:#fff;background:radial-gradient(circle at 35% 30%,var(--c1),var(--c2) 60%,var(--c3));box-shadow:0 3px 0 var(--c3),0 0 12px var(--c2)}
.up-node.next{border-color:var(--c2);background:radial-gradient(circle at 35% 30%,#ffffff,#e9e3d3);animation:upPulse 1.4s ease-in-out infinite}
.up-node.sel{transform:scale(1.18);outline:3px solid #fff3a0;outline-offset:2px}
.up-node .ck{position:absolute;right:-6px;bottom:-5px;width:16px;height:16px;border:2px solid #fff;border-radius:50%;background:#2fb84a;font:900 9px/12px system-ui,sans-serif;color:#fff}
.up-node .lk{position:absolute;right:-6px;bottom:-5px;font-size:10px}
@keyframes upPulse{50%{box-shadow:0 3px 0 rgba(0,0,0,.45),0 0 0 6px rgba(255,240,160,.35)}}
.up-node.pop{animation:upPop .6s cubic-bezier(.3,1.6,.5,1)}
@keyframes upPop{0%{transform:scale(.6)}60%{transform:scale(1.4)}100%{transform:scale(1)}}
.up-burst{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px;border:3px solid var(--c1);border-radius:50%;pointer-events:none;animation:upBurst .7s ease-out forwards}
@keyframes upBurst{to{transform:scale(2.8);opacity:0}}
.up-root{display:flex;align-items:center;gap:8px;padding:8px 12px;border:3px solid #5a3010;border-radius:0 0 18px 18px;background:linear-gradient(#7a4e2c,#3e2611);font:900 13px/1 'Nunito',system-ui,sans-serif;color:#ffe9a8;white-space:nowrap}
.up-bar{flex:1;height:12px;overflow:hidden;border-radius:6px;background:rgba(0,0,0,.4)}
.up-bar i{display:block;width:0;height:100%;background:linear-gradient(90deg,#8ce99a,#ffe066);transition:width .5s}
.up-info{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border:3px solid #f0b54a;border-radius:18px;background:linear-gradient(#fffaf0,#ffe7b8);box-shadow:0 4px 0 #b9781c,inset 0 2px 0 #fff;font-family:'Nunito',system-ui,sans-serif}
.up-big{flex-shrink:0;display:grid;place-items:center;width:52px;height:52px;border:3px solid #fff;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--c1),var(--c2) 60%,var(--c3));box-shadow:0 3px 0 rgba(0,0,0,.25);font-size:26px}
.up-txt{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.up-txt small{font-size:11px;font-weight:800;color:#b36b00}
.up-txt b{font-size:16px;font-weight:900;line-height:1.1;color:#7a4300}
.up-txt span{font-size:12px;font-weight:700;line-height:1.2;color:#8a5a20}
.up-buy{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:88px;padding:8px;border:3px solid #1f7a33;border-radius:16px;background:linear-gradient(#8ef09b,#2fb84a);box-shadow:0 4px 0 #1a6b2c;font:900 15px/1 'Nunito',system-ui,sans-serif;color:#fff;text-shadow:0 1px 0 #1a6b2c}
.up-buy em{display:flex;align-items:center;gap:3px;font-size:12px;font-style:normal}
.up-buy svg{width:16px;height:16px}
.up-buy:active{transform:translateY(3px);box-shadow:0 1px 0 #1a6b2c}
.up-buy.off{border-color:#5c6b7a;background:linear-gradient(#d3dbe3,#8796a5);box-shadow:0 4px 0 #56636f;text-shadow:0 1px 0 #56636f}
.up-buy.got{border-color:#a35f00;background:linear-gradient(#ffe066,#f59f00);box-shadow:0 4px 0 #a35f00;text-shadow:0 1px 0 #a35f00}`;
    document.head.appendChild(s);
  }
};

document.addEventListener('DOMContentLoaded', () => Upgrades.init());
