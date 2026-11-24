// 羽球PK 的離線快取。遊戲本體每次先上網抓最新版，抓不到才用快取，所以你上傳新版後玩家馬上就會看到。
const CACHE = 'badminton-pk-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // 只處理自己網站的檔案
  if (req.mode === 'navigate' || req.url.endsWith('.html')) {
    // 遊戲頁面：每次都直接跟伺服器要最新版（不用瀏覽器的 10 分鐘暫存），沒網路才用快取
    e.respondWith(fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else {
    // 圖示等檔案：先用快取，比較快
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
