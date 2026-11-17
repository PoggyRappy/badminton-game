// 羽球PK 的離線快取。遊戲本體每次先上網抓最新版，抓不到才用快取，所以你上傳新版後玩家馬上就會看到。
const CACHE = 'badminton-pk-v1';
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
    // 遊戲頁面：先抓網路上的最新版，沒網路才用快取
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else {
    // 圖示等檔案：先用快取，比較快
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
