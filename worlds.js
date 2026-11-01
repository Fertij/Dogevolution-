// Миры: у каждого свой фон, свои породы и свои собаки на поле. Монеты общие.
// Сохранения первого мира лежат под старыми ключами, поэтому прогресс не теряется
const WORLDS = [
  { id: 'forest', name: 'Зелёный луг', icon: '🌳', min: 1, max: 7, priceMul: 1, Field: Field, shadow: '20,45,10', prefix: 'dogevo_' },
  { id: 'winter', name: 'Снежная долина', icon: '⛄', min: 8, max: 15, priceMul: 400, Field: WinterField, shadow: '45,70,115', prefix: 'dogevo_w2_' }
];

const World = {
  index: 0,
  testAll: false,   // test.js включает, чтобы все миры были открыты

  cur() { return WORLDS[this.index]; },
  base() { return this.cur().min; },
  keyFor(i, name) { return WORLDS[i].prefix + name; },
  key(name) { return this.keyFor(this.index, name); },
  unlockedCount() { return Math.max(1, Number(localStorage.getItem('dogevo_worlds')) || 1); },
  isOpen(i) { return this.testAll || i < this.unlockedCount(); },
  // Старшая порода мира, которая уже есть в игре
  topLevel(i) { return Math.min(WORLDS[i].max, DOG_LEVELS.length - 1); },
  hasNext(i) { return !!WORLDS[i + 1] && !!DOG_LEVELS[WORLDS[i + 1].min]; },

  init() {
    this.hook();
    this.initUI();
    const saved = Number(localStorage.getItem('dogevo_world')) || 0;
    if (saved > 0 && WORLDS[saved] && this.isOpen(saved)) this.switchTo(saved, true);
  },

  // Подключение к main.js и menu.js без правок в этих файлах
  hook() {
    const W = this;

    // Собаки каждого мира сохраняются отдельно
    game.save = function () {
      const a = this.field.area, base = W.base();
      const list = [
        ...this.dogs.map(d => ({ l: d.level, x: d.x, y: d.y })),
        ...this.boxes.filter(b => !b.done).map(b => ({ l: base, x: b.x, y: b.y }))
      ].map(d => ({ l: d.l, x: (d.x - a.x) / a.w, y: (d.y - a.y) / a.h }));
      localStorage.setItem(W.key('dogs'), JSON.stringify(list));
    };

    // Старшие собаки мира сливаются только ради открытия следующего мира
    const findNear = dog => {
      let best = null, bd = 55;
      for (const d of game.dogs) {
        if (d === dog || d.level !== dog.level) continue;
        const dist = Math.hypot(d.x - dog.x, d.y - dog.y);
        if (dist < bd) { bd = dist; best = d; }
      }
      return best;
    };
    const origFind = findMergeTarget;
    findMergeTarget = function (dog) {
      const top = W.topLevel(W.index);
      if (dog.level > top) return null;
      if (dog.level === top) return W.hasNext(W.index) ? findNear(dog) : null;
      return origFind(dog);
    };

    const origMerge = merge;
    merge = function (a, b) {
      if (a.level === W.topLevel(W.index) && W.hasNext(W.index)) return W.ascend(a, b);
      return origMerge(a, b);
    };

    // «Начать заново» сбрасывает все миры и возвращает на первый
    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      if (W.index !== 0) { game.dogs = []; W.switchTo(0, true); }
      for (let i = 1; i < WORLDS.length; i++) {
        localStorage.removeItem(W.keyFor(i, 'dogs'));
        localStorage.removeItem(W.keyFor(i, 'bought'));
      }
      localStorage.removeItem('dogevo_world');
      localStorage.removeItem('dogevo_worlds');
      return reset.call(this);
    };
  },

  // Две старшие собаки уходят, в следующем мире появляется его первая порода
  ascend(a, b) {
    const next = this.index + 1, w = WORLDS[next];
    game.dogs = game.dogs.filter(d => d !== a && d !== b);
    game.ring(b.x, b.y);
    game.sparks(b.x, b.y - 30, 20);
    game.hearts(b.x, b.y - 60, 6);
    game.dust(b.x, b.y, 12);
    if (typeof Sound !== 'undefined') Sound.merge();
    if (typeof Settings !== 'undefined') Settings.vibrate([30, 40, 70, 40, 120]);

    const key = this.keyFor(next, 'dogs');
    let list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
    list.push({ l: w.min, x: 0.5, y: 0.55 });
    localStorage.setItem(key, JSON.stringify(list));

    const first = this.unlockedCount() <= next;
    localStorage.setItem('dogevo_worlds', Math.max(this.unlockedCount(), next + 1));
    if (w.min > game.best) {
      game.best = w.min;
      localStorage.setItem('dogevo_best', w.min);
    }
    game.save();
    Shop.refresh(game);
    this.showUnlock(next, first);
  },

  switchTo(i, silent) {
    if (i === this.index || !WORLDS[i]) return;
    game.save();

    // Монеты, которые ещё летят, не пропадают
    const pending = game.coins.reduce((s, c) => s + c.value, 0);
    game.dogs = [];
    game.boxes = [];
    game.coins = [];
    game.particles = [];
    game.drag = null;
    game.mergeTarget = null;

    this.index = i;
    localStorage.setItem('dogevo_world', i);
    U.shadowRGB = WORLDS[i].shadow;
    game.field = new WORLDS[i].Field();
    resize();
    this.loadDogs();

    Shop.bought = Number(localStorage.getItem(this.key('bought'))) || 0;
    if (pending) game.addMoney(pending);
    else Shop.refresh(game);

    if (typeof Settings !== 'undefined') { Settings.stash = null; Settings.applyEffects(); }
    if (typeof Menu !== 'undefined' && Menu.visible) Menu.needSnap = true;
    if (!silent) game.toast(`${WORLDS[i].icon} ${WORLDS[i].name}`, `Породы ${WORLDS[i].min}–${WORLDS[i].max} уровня`);
  },

  loadDogs() {
    const a = game.field.area, w = this.cur(), top = this.topLevel(this.index);
    let list = [];
    try { list = JSON.parse(localStorage.getItem(this.key('dogs'))) || []; } catch (e) { list = []; }
    for (const d of list) {
      if (!DOG_LEVELS[d.l] || d.l < w.min || d.l > top) continue;
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
      game.dogs.push(new Dog(p.x, p.y, w.min));
    }
    game.save();
  },

  dogCount(i) {
    if (i === this.index) return game.dogs.length;
    try { return (JSON.parse(localStorage.getItem(this.keyFor(i, 'dogs'))) || []).length; } catch (e) { return 0; }
  },

  // ---------- Окна ----------
  initUI() {
    const $ = id => document.getElementById(id);
    this.panel = $('worlds');
    this.listEl = $('worldList');
    this.unlockEl = $('unlock');
    this.uCanvas = $('unlockDog');

    $('worldBtn').addEventListener('click', () => this.openList());
    $('closeWorlds').addEventListener('click', () => this.panel.classList.remove('show'));
    this.panel.addEventListener('click', e => { if (e.target === this.panel) this.panel.classList.remove('show'); });

    $('goWorld').addEventListener('click', () => {
      this.unlockEl.classList.remove('show');
      if (typeof Menu !== 'undefined' && Menu.visible) Menu.hide();
      this.switchTo(this.unlockTarget);
    });
    $('laterWorld').addEventListener('click', () => {
      this.unlockEl.classList.remove('show');
      game.toast('Мир ждёт тебя', 'Кнопка с глобусом слева вверху');
    });
  },

  openList() {
    this.listEl.replaceChildren();
    WORLDS.forEach((w, i) => {
      const open = this.isOpen(i), here = i === this.index;
      const card = document.createElement('button');
      card.className = `world-card w-${w.id}` + (here ? ' here' : '') + (open ? '' : ' locked');

      const art = document.createElement('span');
      art.className = 'wc-art';
      const icon = document.createElement('span');
      icon.className = 'wc-icon';
      icon.textContent = open ? w.icon : '🔒';
      art.appendChild(icon);

      const info = document.createElement('span');
      info.className = 'wc-info';
      const name = document.createElement('b');
      name.textContent = w.name;
      const lv = document.createElement('small');
      lv.textContent = `Уровни ${w.min}–${w.max}`;
      const sub = document.createElement('small');
      sub.textContent = open
        ? `Собак на поле: ${this.dogCount(i)}`
        : `Объедини двух: ${DOG_LEVELS[this.topLevel(i - 1)].name}`;
      info.append(name, lv, sub);

      const tag = document.createElement('span');
      tag.className = 'wc-tag';
      tag.textContent = here ? 'Ты здесь' : open ? 'Открыт' : 'Закрыт';

      card.append(art, info, tag);
      card.addEventListener('click', () => {
        if (!open) { game.toast('Мир закрыт', sub.textContent); return; }
        this.panel.classList.remove('show');
        this.switchTo(i);
      });
      this.listEl.appendChild(card);
    });
    this.panel.classList.add('show');
  },

  showUnlock(i, first) {
    const w = WORLDS[i];
    this.unlockTarget = i;
    this.unlockEl.querySelector('.unlock-kicker').textContent = first ? 'Новый мир открыт!' : 'Подарок ждёт!';
    document.getElementById('unlockName').textContent = `${w.icon} ${w.name}`;
    document.getElementById('unlockText').textContent =
      `Тебя ждёт ${DOG_LEVELS[w.min].name}. Здесь живут новые породы ${w.min}–${w.max} уровня.`;
    this.uDog = new Dog(0, 0, w.min);
    this.uDog.happy = 3;
    this.unlockEl.classList.add('show');
    if (!this.uRunning) {
      this.uRunning = true;
      this.uLast = performance.now();
      requestAnimationFrame(t => this.unlockLoop(t));
    }
  },

  // Собака на экране открытия прыгает и виляет хвостом
  unlockLoop(now) {
    if (!this.unlockEl.classList.contains('show')) { this.uRunning = false; return; }
    const dt = U.clamp((now - this.uLast) / 1000, 0, 0.05);
    this.uLast = now;
    const d = this.uDog;
    d.animate(dt);
    if (d.jump <= 0 && Math.random() < dt * 0.6) { d.jump = 1; d.happy = 1.5; }

    const cv = this.uCanvas, dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const L = d.info;
    const k = Math.min(H / ((18 * L.legLen + 64) * d.size + 30), W / (100 * L.bodyLen * d.size + 20));
    c.save();
    c.scale(k, k);
    d.x = W / 2 / k - 4;
    d.y = (H - 6) / k;
    d.draw(c);
    c.restore();
    requestAnimationFrame(t => this.unlockLoop(t));
  }
};

// Запуск после загрузки всех скриптов, когда game, Menu и Settings уже готовы
document.addEventListener('DOMContentLoaded', () => World.init());
