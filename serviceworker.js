var staticCacheName = "gurucharitra-v1"; // Use a versioned cache name

self.addEventListener("install", function (e) {
  console.log("[Service Worker] Installing...");

  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        "/", // Cache the root URL
        "/index.html", // Cache other important resources like main HTML files
        "/styles/main.css", // Example: Cache CSS files
        "/scripts/main.js", // Example: Cache JavaScript files
        "/images/logo.png" // Example: Cache images
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
      // Return response from cache if available
      if (response) {
        console.log("[Service Worker] Found in Cache:", event.request.url);
        return response;
      }

      // Fetch from network if not cached
      return fetch(event.request).then(function (response) {
        // Clone the response to cache it
        var responseClone = response.clone();

        caches.open(staticCacheName).then(function (cache) {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(function () {
        // Handle errors fetching from cache or network
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

// Track how the PWA was launched (from cache or network)
self.addEventListener("fetch", function (event) {
  console.log("[Service Worker] Fetching:", event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("[Service Worker] Found in Cache:", event.request.url);

        // Serve from cache if available
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

        // Handle errors fetching from cache or network
      });
    })
  );
});

// Automatically update when there are changes in files
self.addEventListener("message", function (event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
