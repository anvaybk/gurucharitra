var staticCacheName = "gurucharitra-v1"; // Use a versioned cache name

self.addEventListener("install", function (e) {
  console.log("[Service Worker] Installing...");

  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        "/", // Cache the root URL
        "/index.html", // Cache other important resources like main HTML files
        "/css/styles.css", // Example: Cache CSS files
        "/js/script.js", // Example: Cache JavaScript files
        "/images/shree_gurucharitra_saramrut.jpg",
        "/images/hd-datta_photo1.jpg" // Example: Cache images
      ]);
    })
  );
});

self.addEventListener("activate", function (e) {
  console.log("[Service Worker] Activating...");

  // Remove old caches
  e.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith("gurucharitra-") &&
            cacheName !== staticCacheName;
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log("[Service Worker] Fetching:", event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("[Service Worker] Found in Cache:", event.request.url);
        return response;
      }

      console.log("[Service Worker] Not found in Cache. Fetching from network:", event.request.url);

      // Fetch from network and cache the response
      return fetch(event.request).then(function (response) {
        var responseClone = response.clone();

        caches.open(staticCacheName).then(function (cache) {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(function () {
        console.error("[Service Worker] Error fetching:", event.request.url);
      });
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
