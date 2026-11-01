// Настройки: звук, громкость, вибрация, эффекты.
// Звуки создаются кодом через Web Audio, файлы не нужны

const Sound = {
  ctx: null,
  lastCoin: 0,

  // Браузер разрешает звук только после касания экрана
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(freq, dur, o = {}) {
    const S = Settings.data;
    if (!S.sound || S.volume <= 0 || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const v = Math.max(0.0002, (o.vol || 0.3) * S.volume);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) {   // фильтр делает звук мягче
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.lp;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  },

  coin() {
    const now = performance.now();
    if (now - this.lastCoin < 70) return;   // много монет подряд не сливаются в шум
    this.lastCoin = now;
    this.tone(1320, 0.07, { type: 'square', vol: 0.06, lp: 4000 });
    this.tone(1760, 0.14, { type: 'square', vol: 0.06, lp: 4000, delay: 0.05 });
  },
  woof() {
    this.tone(320, 0.1, { type: 'sawtooth', vol: 0.22, to: 180, lp: 900 });
    this.tone(280, 0.13, { type: 'sawtooth', vol: 0.18, to: 150, lp: 800, delay: 0.13 });
  },
  pop() { this.tone(380, 0.14, { vol: 0.4, to: 900 }); },
  drop() { this.tone(900, 0.3, { vol: 0.15, to: 250 }); },
  merge() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, { type: 'triangle', vol: 0.28, delay: i * 0.07 }));
    this.tone(2093, 0.4, { vol: 0.08, delay: 0.3 });
  },
  click() { this.tone(660, 0.06, { vol: 0.2, to: 440 }); },
  error() { this.tone(180, 0.18, { type: 'square', vol: 0.08, to: 120, lp: 1200 }); }
};

const Settings = {
  data: { sound: true, volume: 0.7, vibro: true, effects: true },

  load() {
    try { Object.assign(this.data, JSON.parse(localStorage.getItem('dogevo_settings')) || {}); } catch (e) {}
  },

  save() { localStorage.setItem('dogevo_settings', JSON.stringify(this.data)); },

  init() {
    this.load();
    this.el = document.getElementById('settings');
    this.vol = document.getElementById('volume');
    this.volVal = document.getElementById('volumeVal');
    this.volRow = this.el.querySelector('.vol-row');
    this.switches = [...this.el.querySelectorAll('.switch')];

    for (const sw of this.switches) {
      sw.addEventListener('click', () => {
        const k = sw.dataset.key;
        this.data[k] = !this.data[k];
        this.save();
        this.render();
        if (k === 'effects') this.applyEffects();
        if (k === 'vibro') this.vibrate(40);
        Sound.click();
      });
    }

    this.vol.addEventListener('input', () => { this.data.volume = this.vol.value / 100; this.render(); });
    this.vol.addEventListener('change', () => { this.save(); Sound.coin(); });

    ['settingsBtn', 'gearBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => this.open());
    });
    document.getElementById('okSettings').addEventListener('click', () => this.close());
    this.el.addEventListener('click', e => { if (e.target === this.el) this.close(); });

    this.render();
    this.applyEffects();
  },

  open() { this.render(); this.el.classList.add('show'); },
  close() { this.el.classList.remove('show'); },

  render() {
    for (const sw of this.switches) {
      const on = !!this.data[sw.dataset.key];
      sw.classList.toggle('on', on);
      sw.setAttribute('aria-pressed', on);
    }
    const v = Math.round(this.data.volume * 100);
    this.vol.value = v;
    this.vol.style.setProperty('--v', v);
    this.volVal.textContent = v + '%';
    this.volRow.classList.toggle('off', !this.data.sound);
  },

  vibrate(pattern) {
    if (this.data.vibro && navigator.vibrate) navigator.vibrate(pattern);
  },

  // Бабочки, пыльца и тени облаков убираются, но сохраняются, чтобы вернуть их обратно
  applyEffects() {
    const f = game.field;
    if (!this.stash) this.stash = { b: f.butterflies, m: f.motes, s: f.shadows };
    if (this.data.effects) {
      f.butterflies = this.stash.b;
      f.motes = this.stash.m;
      f.shadows = this.stash.s;
    } else {
      f.butterflies = [];
      f.motes = [];
      f.shadows = [];
    }
  }
};

// Звуки подключаются к игре без правок в других файлах
(function hookSounds() {
  document.addEventListener('pointerdown', () => Sound.unlock(), true);

  const addMoney = game.addMoney;
  game.addMoney = function (v) { Sound.coin(); return addMoney.call(this, v); };

  const pet = Dog.prototype.pet;
  Dog.prototype.pet = function (g) {
    const canJump = this.jump <= 0;
    pet.call(this, g);
    if (canJump) Sound.woof();
  };

  const openBox = Box.prototype.open;
  Box.prototype.open = function (g) {
    if (!this.done) { Sound.pop(); Settings.vibrate(25); }
    return openBox.call(this, g);
  };

  const buy = Shop.buy;
  Shop.buy = function (g) {
    const before = this.bought;
    buy.call(this, g);
    if (this.bought > before) Sound.drop();
    else { Sound.error(); Settings.vibrate(60); }
  };

  const mergeDogs = merge;
  merge = function (a, b) {
    Sound.merge();
    Settings.vibrate([30, 40, 70]);
    return mergeDogs(a, b);
  };

  // Щелчок на кнопках меню
  document.addEventListener('click', e => {
    if (e.target.closest('.mbtn, #homeBtn, #gearBtn')) Sound.click();
  }, true);
})();

Settings.init();
