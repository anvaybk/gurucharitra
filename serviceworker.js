const staticCacheName = "gurucharitra-v1"; // Use a versioned cache name

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  // Cache static assets during the install phase
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        "/", // Cache the root URL
        "/index.html", // Cache HTML file
        "/css/styles.css", // Cache CSS file
        "/js/script.js", // Cache JavaScript file
        "/images/shree_gurucharitra_saramrut.jpg",
        "/chapters.html",
        "/images/hd-datta_photo1.jpg" // Cache images
      ]).catch((error) => {
        console.error("[Service Worker] Failed to cache during install:", error);
      });
    }).catch((error) => {
      console.error("[Service Worker] Failed to open cache:", error);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith("gurucharitra-") && cacheName !== staticCacheName;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).catch((error) => {
      console.error("[Service Worker] Failed to delete old caches:", error);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Fetching:", event.request.url);

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("[Service Worker] Found in Cache:", event.request.url);
        return response;
      }

      console.log("[Service Worker] Not found in Cache. Fetching from network:", event.request.url);

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(staticCacheName).then((cache) => {
            cache.put(event.request, responseClone).catch((error) => {
              console.error("[Service Worker] Failed to cache response:", error);
            });
          }).catch((error) => {
            console.error("[Service Worker] Failed to open cache:", error);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.error("[Service Worker] Error fetching:", event.request.url, error);
        // Optionally, return a fallback response or cache a fallback page
        return caches.match('/offline.html'); // Example fallback
      });
    }).catch((error) => {
      console.error("[Service Worker] Error matching cache:", error);
      // Optionally, return a fallback response or cache a fallback page
      return caches.match('/offline.html'); // Example fallback
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
