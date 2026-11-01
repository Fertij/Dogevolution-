// ТЕСТОВЫЙ РЕЖИМ: бесконечные монеты и все миры открыты.
// Сейчас выключен. Чтобы включить для проверки, поставь true
const TEST_MODE = false;

(function () {
  if (!TEST_MODE) return;
  World.testAll = true;
  game.money = Infinity;

  // Счётчик показывает ∞ и ничего не записывает в память
  game.updateMoney = function (bump) {
    coinsEl.textContent = '∞';
    if (bump) {
      coinsBox.classList.remove('bump');
      void coinsBox.offsetWidth;
      coinsBox.classList.add('bump');
    }
    Shop.refresh(this);
  };
  game.updateMoney(false);

  // Значок «ТЕСТ» на счётчике
  const badge = document.createElement('span');
  badge.textContent = 'ТЕСТ';
  badge.style.cssText = 'position:absolute;top:-10px;right:-8px;padding:2px 7px;border:2px solid #fff;' +
    'border-radius:8px;background:#e03131;color:#fff;font:900 11px/1 system-ui,sans-serif;box-shadow:0 2px 0 #8f1d1d;';
  coinsBox.appendChild(badge);

  // Меню тоже показывает ∞
  const show = Menu.show;
  Menu.show = function () {
    show.call(this);
    this.coinsEl.textContent = '∞';
  };
  Menu.coinsEl.textContent = '∞';

  // После «Начать заново» монеты снова бесконечные
  const reset = Menu.resetGame;
  Menu.resetGame = function () {
    reset.call(this);
    game.money = Infinity;
    game.updateMoney(false);
    this.coinsEl.textContent = '∞';
  };
})();
