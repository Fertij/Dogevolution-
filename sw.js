// Сервис-воркер: сохраняет игру на телефоне, чтобы она работала без интернета.
// С интернетом берёт свежие файлы с сайта, без интернета — сохранённые.
// Если добавишь новый файл в игру, допиши его в FILES и увеличь номер VERSION

const VERSION = 'dogevo-v1';
const FONTS = 'dogevo-fonts';

const FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/utils.js',
  './js/field.js',
  './js/field-winter.js',
  './js/dog.js',
  './js/dogs-winter.js',
  './js/worlds.js',
  './js/world3.js',
  './js/dogs-beach.js',
  './js/dogs-beach2.js',
  './js/shop.js',
  './js/main.js',
  './js/menu.js',
  './js/settings.js',
  './js/test.js',
  './js/reveal.js',
  './js/achievements.js',
  './js/cutscene.js',
  './js/cutscene-beach.js',
  './js/upgrades.js',
  './js/sanctuary.js',
  './js/cutscene-star.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Установка: сохраняем все файлы. Если какого-то нет (например, иконок), остальные всё равно сохранятся
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(FILES.map(f => cache.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// Активация: удаляем старые версии сохранённых файлов
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Шрифты Google: сохраняем один раз и дальше берём из памяти
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req));
    return;
  }

  // Файлы игры: сначала сеть (свежая версия), без сети — сохранённые
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  const net = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  });
  net.catch(() => {});

  // Если сеть медленная, через 3 секунды берём сохранённый файл
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
  try {
    return await Promise.race([net, timeout]);
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true }) ||
      (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (hit) return hit;
    return net;
  }
}
