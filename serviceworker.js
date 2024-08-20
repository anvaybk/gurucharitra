const CACHE_NAME = 'gurucharitra-cache-v1';
const OFFLINE_URL = 'offline.html';
const CACHE_EXPIRY = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/script.js',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    OFFLINE_URL
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match(OFFLINE_URL));
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-content') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Logic for syncing content goes here
    console.log('Syncing content...');
}

self.addEventListener('periodicsync', event => {
    if (event.tag === 'periodic-sync-content') {
        event.waitUntil(syncContent());
    }
});

self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Push message no payload',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-192x192.png'
    };
    event.waitUntil(
        self.registration.showNotification('Gurucharitra Notification', options)
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_CLEANUP') {
        cacheCleanup();
    }
});

async function cacheCleanup() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();

    requests.forEach(async request => {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
            const date = new Date(dateHeader);
            if ((now - date.getTime()) > CACHE_EXPIRY) {
                await cache.delete(request);
            }
        }
    });
}

self.addEventListener('periodicsync', event => {
    if (event.tag === 'cleanup-cache') {
        event.waitUntil(cacheCleanup());
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
