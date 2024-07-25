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
        "/images/hd-datta_photo1.jpg" // Cache images
      ]);
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
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        console.error("[Service Worker] Error fetching:", event.request.url);
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});


// Handle the Install Prompt: Optionally, you can handle the install prompt with a custom event listener for a better user experience.

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Show your custom install button
  document.getElementById('install-button').style.display = 'block';
});

document.getElementById('install-button').addEventListener('click', () => {
  // Hide the custom install button
  document.getElementById('install-button').style.display = 'none';
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((result) => {
    if (result.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
});
