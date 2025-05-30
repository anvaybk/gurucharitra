// Last updated on 29042025

const CACHE_NAME = 'gurucharitra-v1.0.0.5';

// Dynamically determine the base path (e.g., "/gurucharitra")
const BASE_PATH = self.location.pathname.replace(/\/serviceworker\.js$/, '');

const RESOURCE_PATHS = [
    // your existing list here...
];

// Prepend BASE_PATH to every resource
const INITIAL_CACHED_RESOURCES = RESOURCE_PATHS.map(path => `${BASE_PATH}${path}`);

const DONT_UPDATE_RESOURCES = ['/videos/'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(INITIAL_CACHED_RESOURCES);
            console.log('Resources cached successfully');
        } catch (error) {
            console.error('Failed to cache resources:', error);
        }
    })());
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Ignore non-HTTP(s) requests (e.g., chrome-extension://, file://, etc.)
    if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const fetchResponse = await fetch(event.request);
            if (
                event.request.method === 'GET' &&
                !event.request.url.includes('google-analytics') &&
                !event.request.url.includes('browser-sync')
            ) {
                cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
        } catch (e) {
            if (event.request.mode === 'navigate') {
                await rememberRequestedTip(event.request.url);
                return await cache.match(`${BASE_PATH}/offline.html`);
            }
        }
    })());
});

async function rememberRequestedTip(url) {
    let tips = await localforage.getItem('bg-tips') || [];
    tips.push(url);
    await localforage.setItem('bg-tips', tips);
}

self.addEventListener('sync', event => {
    if (event.tag === 'bg-load-tip') {
        event.waitUntil(backgroundSyncLoadTips());
    }
});

async function backgroundSyncLoadTips() {
    const tips = await localforage.getItem('bg-tips');
    if (!tips || tips.length === 0) return;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(tips);

    registration.showNotification(`${tips.length} tips loaded`, {
        icon: `${BASE_PATH}/images/icon-256x256.png`,
        body: "Tap to view",
        data: tips[0]
    });

    await localforage.removeItem('bg-tips');
}

self.addEventListener('notificationclick', event => {
    event.notification.close();
    clients.openWindow(event.notification.data);
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cached-content') {
        event.waitUntil(updateCachedContent());
    }
});

async function updateCachedContent() {
    const requests = await findCacheEntriesToBeRefreshed();
    const cache = await caches.open(CACHE_NAME);

    for (const request of requests) {
        try {
            const fetchResponse = await fetch(request);
            await cache.put(request, fetchResponse.clone());
        } catch (e) {
            // Fail silently
        }
    }
}

async function findCacheEntriesToBeRefreshed() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    return requests.filter(request => {
        return !DONT_UPDATE_RESOURCES.some(pattern => request.url.includes(pattern));
    });
}
