// Достижения растут вместе с игрой: у каждого 5 ступеней (I–V).
// Когда ступень выполнена, открывается следующая с целью и наградой побольше.
// Медали ступеней: бронза, серебро, золото, платина, алмаз

const fmtNum = n => (isFinite(n) ? Math.floor(n).toLocaleString('ru-RU') : '∞');
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const TIER_NAMES = ['Бронза', 'Серебро', 'Золото', 'Платина', 'Алмаз'];
const LEGENDS = ['Получи ретривера в короне', 'Открой Снежную долину', 'Получи чау-чау', 'Получи ньюфаундленда', 'Получи ледяного волкодава'];

const ACH = [
  { id: 'pet', icon: '❤️', name: 'Ласковый хозяин', goals: [25, 100, 500, 2000, 10000], rewards: [50, 600, 8e3, 1e5, 2e6],
    desc: g => `Погладь собак ${fmtNum(g)} раз`, val: s => s.pets },
  { id: 'buy', icon: '📦', name: 'Заводчик', goals: [1, 25, 100, 400, 1500], rewards: [20, 400, 6e3, 1e5, 2e6],
    desc: g => `Купи щенков: ${fmtNum(g)}`, val: s => s.buys },
  { id: 'merge', icon: '🧬', name: 'Генетик', goals: [1, 20, 100, 400, 1500], rewards: [30, 500, 8e3, 1.5e5, 3e6],
    desc: g => `Сделай слияний: ${fmtNum(g)}`, val: s => s.merges },
  { id: 'coin', icon: '💰', name: 'Богач', goals: [1e3, 1e5, 1e7, 1e9, 1e11], rewards: [200, 1e4, 5e5, 2e7, 1e9],
    desc: g => `Заработай ${fmtNum(g)} монет`, val: s => s.earned },
  { id: 'breed', icon: '📖', name: 'Коллекционер', goals: [3, 7, 10, 13, 15], rewards: [200, 5e3, 1e5, 1e6, 1e7],
    desc: g => `Открой пород: ${g}`, val: () => Reveal.count() },
  { id: 'yard', icon: '🏡', name: 'Полный двор', goals: [4, 8, 12, 15, 18], rewards: [100, 1500, 3e4, 4e5, 5e6],
    desc: g => `Держи на поле ${g} собак сразу`, val: s => s.maxDogs },
  { id: 'legend', icon: '👑', name: 'Легенды', goals: [7, 8, 11, 13, 15], rewards: [5e3, 2e4, 1.5e5, 1.5e6, 2e7],
    desc: (g, i) => LEGENDS[i], val: () => Math.max(0, ...[...Reveal.seen].filter(l => DOG_LEVELS[l])) },
  { id: 'upg', icon: '🌳', name: 'Мастер прокачки', goals: [1, 6, 12, 24, 36], rewards: [100, 3e3, 6e4, 1.5e6, 3e7],
    desc: g => `Изучи улучшений: ${g}`, val: () => (typeof Upgrades !== 'undefined' ? Upgrades.total() : 0) }
];

const Ach = {
  stats: { pets: 0, buys: 0, merges: 0, earned: 0, maxDogs: 0 },
  tier: {},        // сколько ступеней пройдено у каждого достижения
  fresh: 0,        // новые медали, которые игрок ещё не видел в меню
  queue: [],
  showing: false,
  hiding: false,

  init() {
    const $ = id => document.getElementById(id);
    this.addStyle();
    this.load();
    this.panel = $('achievements');
    this.list = $('achList');
    this.badge = $('achBadge');
    this.pop = $('achPop');

    $('achBtn').addEventListener('click', () => this.open());
    $('closeAch').addEventListener('click', () => this.panel.classList.remove('show'));
    this.panel.addEventListener('click', e => { if (e.target === this.panel) this.panel.classList.remove('show'); });
    this.pop.addEventListener('click', () => this.hidePop());

    // Первый запуск новой системы: уже выполненное засчитывается тихо, без плашек и наград
    if (this.sync) {
      for (const a of ACH) {
        let k = 0;
        while (k < a.goals.length && a.val(this.stats) >= a.goals[k]) k++;
        this.tier[a.id] = k;
      }
      this.save();
    }

    this.hook();
    this.updateBadge();
    setInterval(() => this.check(), 500);
  },

  addStyle() {
    const s = document.createElement('style');
    s.textContent = `
.t3 .medal,#achPop.t3 .ap-coin{background:radial-gradient(circle at 35% 30%,#ffffff,#b8f0e6 45%,#2f9e8f)}
.t4 .medal,#achPop.t4 .ap-coin{background:radial-gradient(circle at 35% 30%,#ffffff,#a5d8ff 40%,#7048e8)}
#achPop.t4 .ap-coin{box-shadow:0 0 0 3px #3b1f8c,0 0 20px 5px rgba(170,140,255,.85)}
.ach-row:not(.done):not(.none) .medal{filter:none;opacity:1}
.ach-stars{display:flex;gap:2px;margin:2px 0}
.ach-stars i{width:12px;height:12px;background:rgba(90,60,30,.3);clip-path:polygon(50% 0,63% 35%,100% 38%,71% 61%,80% 100%,50% 78%,20% 100%,29% 61%,0 38%,37% 35%)}
.ach-stars i.on{background:linear-gradient(#fff3a0,#f59f00)}
.ach-max{flex-shrink:0;padding:5px 10px;border:2px solid #fff;border-radius:12px;background:linear-gradient(#ffe066,#f59f00);box-shadow:0 2px 0 #a35f00;font:900 12px/1 'Nunito',system-ui,sans-serif;color:#fff;text-shadow:0 1px 0 #a35f00}`;
    document.head.appendChild(s);
  },

  load() {
    try { Object.assign(this.stats, JSON.parse(localStorage.getItem('dogevo_stats')) || {}); } catch (e) {}
    let t = null;
    try { t = JSON.parse(localStorage.getItem('dogevo_ach2')); } catch (e) { t = null; }
    if (t && typeof t === 'object') this.tier = t;
    else { this.tier = {}; this.sync = true; }
    this.fresh = Number(localStorage.getItem('dogevo_ach_new')) || 0;
  },

  save() {
    localStorage.setItem('dogevo_stats', JSON.stringify(this.stats));
    localStorage.setItem('dogevo_ach2', JSON.stringify(this.tier));
    localStorage.setItem('dogevo_ach_new', this.fresh);
  },

  add(key, v) {
    this.stats[key] += v;
    this.dirty = true;
  },

  // Подключение к игре без правок в других файлах
  hook() {
    const A = this;

    const pet = Dog.prototype.pet;
    Dog.prototype.pet = function (g) {
      if (this.jump <= 0) A.add('pets', 1);
      return pet.call(this, g);
    };

    const buy = Shop.buy;
    Shop.buy = function (g) {
      const before = this.bought;
      const r = buy.call(this, g);
      if (this.bought > before) A.add('buys', 1);
      return r;
    };

    const mergeDogs = merge;
    merge = function (a, b) {
      A.add('merges', 1);
      return mergeDogs(a, b);
    };

    const addMoney = game.addMoney;
    game.addMoney = function (v) {
      if (isFinite(v)) A.add('earned', v);
      return addMoney.call(this, v);
    };

    const reset = Menu.resetGame;
    Menu.resetGame = function () {
      reset.call(this);
      A.stats = { pets: 0, buys: 0, merges: 0, earned: 0, maxDogs: 0 };
      A.tier = {};
      A.fresh = 0;
      A.queue = [];
      A.save();
      A.updateBadge();
    };
  },

  check() {
    this.stats.maxDogs = Math.max(this.stats.maxDogs, game.dogs.length);
    for (const a of ACH) {
      let k = this.tier[a.id] || 0;
      while (k < a.goals.length && a.val(this.stats) >= a.goals[k]) {
        this.grant(a, k);
        k++;
      }
    }
    if (this.dirty) { this.dirty = false; this.save(); }
    this.pump();
  },

  grant(a, k) {
    this.tier[a.id] = k + 1;
    this.fresh++;
    this.save();

    // Награда идёт мимо счётчика "заработано", чтобы не засчитываться в «Богача»
    game.money += a.rewards[k];
    game.updateMoney(true);
    if (typeof Menu !== 'undefined' && Menu.visible) Menu.coinsEl.textContent = fmtNum(game.money);

    this.queue.push({ a, k });
    this.updateBadge();
    if (this.panel.classList.contains('show')) this.render();
  },

  updateBadge() {
    this.badge.textContent = this.fresh;
    this.badge.classList.toggle('show', this.fresh > 0);
  },

  // ---------- Плашка в игре ----------
  pump() {
    if (this.showing || !this.queue.length) return;
    if (typeof Reveal !== 'undefined' && Reveal.active) return;
    this.showPop(this.queue.shift());
  },

  showPop({ a, k }) {
    const p = this.pop;
    p.className = 't' + k;
    p.querySelector('.ap-kicker').textContent = `Медаль: ${TIER_NAMES[k]}!`;
    p.querySelector('.ap-coin').textContent = a.icon;
    p.querySelector('.ap-name').textContent = `${a.name} ${ROMAN[k]}`;
    p.querySelector('.ap-desc').textContent = a.desc(a.goals[k], k);
    p.querySelector('.ap-reward span').textContent = '+' + fmtNum(a.rewards[k]);

    // Конфетти вылетает из медали
    p.querySelectorAll('.cf').forEach(e => e.remove());
    const cols = ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#cc5de8', '#ffffff'];
    for (let i = 0; i < 18 + k * 4; i++) {
      const s = document.createElement('span');
      s.className = 'cf';
      const ang = U.rand(0, Math.PI * 2), dist = U.rand(50, 120);
      s.style.setProperty('--c', cols[i % cols.length]);
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist * 0.7 + 'px');
      s.style.setProperty('--r', U.rand(-540, 540) + 'deg');
      s.style.setProperty('--d', U.rand(0.15, 0.4) + 's');
      p.appendChild(s);
    }

    void p.offsetWidth;   // перезапуск анимации
    p.classList.add('show');
    this.showing = true;
    this.hiding = false;

    if (typeof Sound !== 'undefined') {
      const base = [784, 988, 1175, 1568, 1976].slice(0, 3 + Math.min(2, k));
      base.forEach((f, i) => Sound.tone(f, 0.22, { type: 'triangle', vol: 0.25, delay: 0.15 + i * 0.09 }));
    }
    if (typeof Settings !== 'undefined') Settings.vibrate([20, 40, 20]);

    clearTimeout(this.popTimer);
    this.popTimer = setTimeout(() => this.hidePop(), this.queue.length ? 2400 : 3200);
  },

  hidePop() {
    if (!this.showing || this.hiding) return;
    this.hiding = true;
    clearTimeout(this.popTimer);
    this.pop.classList.add('hide');
    setTimeout(() => {
      this.pop.classList.remove('show', 'hide');
      this.showing = false;
      this.hiding = false;
      this.pump();
    }, 450);
  },

  // ---------- Окно в меню ----------
  open() {
    this.fresh = 0;
    this.save();
    this.updateBadge();
    this.render();
    this.panel.classList.add('show');
  },

  render() {
    const all = ACH.length * 5;
    const got = ACH.reduce((s, a) => s + (this.tier[a.id] || 0), 0);
    document.getElementById('achTotalFill').style.width = (got / all * 100) + '%';
    document.getElementById('achTotalText').textContent = `${got} / ${all}`;

    const el = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text !== undefined) e.textContent = text;
      return e;
    };

    this.list.replaceChildren();
    for (const a of ACH) {
      const k = this.tier[a.id] || 0, max = k >= a.goals.length;
      const row = el('div', `ach-row t${Math.max(0, k - 1)}` + (max ? ' done' : '') + (k === 0 ? ' none' : ''));
      row.appendChild(el('div', 'medal', a.icon));
      if (max) row.appendChild(el('span', 'ach-check', '✓'));

      const info = el('div', 'ach-info');
      info.appendChild(el('b', '', `${a.name} ${ROMAN[Math.min(k, 4)]}`));
      const stars = el('div', 'ach-stars');
      for (let i = 0; i < 5; i++) stars.appendChild(el('i', i < k ? 'on' : ''));
      info.appendChild(stars);
      info.appendChild(el('small', '', max ? 'Все ступени пройдены!' : a.desc(a.goals[k], k)));

      if (!max) {
        const v = Math.min(a.goals[k], a.val(this.stats));
        const bar = el('div', 'ach-bar');
        const fill = el('i');
        fill.style.width = (v / a.goals[k] * 100) + '%';
        bar.append(fill, el('span', '', `${fmtNum(v)} / ${fmtNum(a.goals[k])}`));
        info.appendChild(bar);
      }
      row.appendChild(info);

      if (max) {
        row.appendChild(el('div', 'ach-max', 'MAX'));
      } else {
        const rw = el('div', 'ach-reward');
        rw.innerHTML = '<svg viewBox="0 0 64 64"><use href="#coin"/></svg>';
        rw.appendChild(el('span', '', '+' + fmtNum(a.rewards[k])));
        row.appendChild(rw);
      }
      this.list.appendChild(row);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Ach.init());
