const CACHE_NAME = 'gurucharitra-v1'; // Use a versioned cache name
const CACHE_EXPIRY_TIME = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const URLS_TO_CACHE = [
        "/",
        "/index.html", // Cache HTML file
        "/css/styles.css", // Cache CSS file
        "/css/homestyles",
        "/js/script.js", // Cache JavaScript file
        "/images/shree_gurucharitra_saramrut.jpg",
        "/images/shree_gurucharitra_saramrut.webp",
        "/chapters.html",
        "/home.html",
        "/registrations.html",
        "/pages/chapters1.html",
        "/pages/chapters2.html",
        "/pages/chapters3.html",
        "/pages/chapters4.html",
        "/pages/chapters5.html",
        "/pages/chapters6.html",
        "/pages/chapters7.html",
        "/pages/chapters8.html",
        "/pages/chapters9.html",
        "/pages/chapters10.html",
        "/pages/chapters11.html",
        "/pages/chapters12.html",
        "/pages/chapters13.html",
        "/pages/chapters14.html",
        "/pages/chapters15.html",
        "/pages/chapters16.html",
        "/pages/sankalp.html",
        "/pages/shreedattamantra.html",
        "/pages/saptahikparayan.html",
        "/pages/socialmedia.html",
        "/pages/annualevents.html",
        "/pages/videogallery.html",
        "/pages/audiogallery.html",
        "/pages/photogallery.html",
        "/pages/sangeetsevaparayan.html",
        "/pages/visheshsevaparayan.html",
        "/pages/granthvachanseva.html",
        "/pages/kavyarupigurucharitra.html",
        "/pages/donations.html",
        "/pages/contactus.html",
        "/images/YTube-Icon-40x40.png",
        "/images/Instagram-Icon-40x40.png",
        "/images/Whatsapp-Icon-40x40.png",
        "/images/Google-maps-Icon-40x40.png",
        "/images/Facebook-Icon-40x40.png",
        "/images/Granth-Vachan-Icon-40x40.png",
        "/images/Registration-Icon-40x40.png",
        "/images/Video-Gallery-Icon-40x40.png",
        "/images/Audio-Gallery-Icon-40x40.png",
        "/images/Photo-Gallery-Icon-40x40.png",
        "/images/Social-Media-Icon-40x40.png",
        "/images/AnnualEvent-Icon-40x40.png",
        "/images/Donations-Icon-40x40.png",
        "/images/ContactUs-Icon-40x40.png",
        "/images/hd-datta_photo1.jpg" // Cache images
  '/offline.html', // Fallback page when offline
];

// Install: Cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
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

// Fetch: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        const fetchTime = new Date(response.headers.get('date'));
        const expiryTime = fetchTime.getTime() + CACHE_EXPIRY_TIME;
        const now = Date.now();
        if (now > expiryTime) {
          return fetchAndUpdateCache(event.request);
        }
        return response;
      }
      return fetchAndUpdateCache(event.request);
    }).catch(() => {
      return caches.match('/offline.html');
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
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

// Periodic Sync (Optional, if supported by the browser)
self.addEventListener('periodicsync', (event) => {
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
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Utility function to fetch and update cache
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

// Push Notification Subscription (Optional, in case you need to subscribe users)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((newSubscription) => {
        // Send the new subscription details to the server
        return fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(newSubscription),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      })
  );
});

// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "gurucharitra-offline-v1";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});
