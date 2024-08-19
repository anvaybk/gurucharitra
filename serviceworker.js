const CACHE_NAME = 'gurucharitra-cache-v1';
const CACHE_EXPIRY_TIME = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  'js/scripts.js',
  '/offline.html', // Fallback page when offline
  '/icon.png'
];

// Install event: Cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve cached content or fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match('/offline.html'));
    })
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const response = await fetch('/sync-data-endpoint');
    const data = await response.json();
    console.log('Background sync successful:', data);
  } catch (err) {
    console.error('Background sync failed:', err);
  }
}

// Periodic Sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    const response = await fetch('/update-content-endpoint');
    const data = await response.json();
    console.log('Periodic sync successful:', data);
  } catch (err) {
    console.error('Periodic sync failed:', err);
  }
}

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification',
    icon: '/icon.png',
    badge: '/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Cache Management: Check for cache expiry and update
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        const fetchTime = response.headers.get('date');
        const expiryTime = new Date(fetchTime).getTime() + CACHE_EXPIRY_TIME;
        if (Date.now() > expiryTime) {
          return fetchAndUpdateCache(event.request);
        }
        return response;
      }
      return fetchAndUpdateCache(event.request);
    }).catch(() => caches.match('/offline.html'))
  );
});

async function fetchAndUpdateCache(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return caches.match('/offline.html');
  }
}
