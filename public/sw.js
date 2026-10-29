// TCT E-Training Service Worker for Desktop & Mobile PWA Installability
// Updated with strict Network-First for HTML to prevent stale browser caching on computers/browsers
const CACHE_NAME = 'tct-app-v3-realtime';

// Only precache static brand assets, NEVER precache HTML documents or scripts!
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/app-icon.svg'
];

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial notice:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Delete all older caches (tct-app-v1, tct-app-v2, etc.) so PC browsers never serve stale HTML
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. NEVER intercept or cache backend API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. ALWAYS fetch navigation & HTML from network fresh
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
        }
        return networkResponse;
      }).catch(async () => {
        // Fallback to cached index.html if offline
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/index.html');
        if (cachedResponse) return cachedResponse;
        return new Response('<!DOCTYPE html><html><body><div style="font-family:sans-serif;text-align:center;padding:40px;"><h2>กำลังเชื่อมต่อระบบ TCT E-Training...</h2><p>กรุณารอสักครู่ หรือกดรีเฟรชหน้าจอ</p><button onclick="window.location.reload()" style="padding:10px 20px;border-radius:8px;background:#002D5A;color:#fff;border:none;cursor:pointer;">รีเฟรชหน้าจอ</button></div></body></html>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // 3. Static icons and images - Stale-while-revalidate for fast badge/icon display
  if (url.origin === location.origin && (url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico'))) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
  }
});

// Support manual clear cache message from web app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});
