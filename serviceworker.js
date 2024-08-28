const staticCacheName = "gurucharitra-v1.0.0.0"; // Use a versioned cache name

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
        "/", // Cache the root URL
        "/index.html", // Cache HTML file
        "/css/styles.css", // Cache CSS file
        "/css/homestyles",
        "/js/script.js", // Cache JavaScript file
        "/images/shree_gurucharitra_saramrut.jpg",
        "/images/shree_gurucharitra_saramrut.webp",
        "/chapters.html",
        "/home.html",
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
        "/pages/donations.html",
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
  ]


  // Cache static assets during the install phase
  self.addEventListener('install', event => {
    console.log("[Service Worker] Installing...");
    event.waitUntil((async () => {
        const cache = await caches.open(staticCacheName);
        cache.addAll(PRECACHE_ASSETS).catch((error) => {
        console.error("[Service Worker] Failed to cache during install:", error);
      });
    }).catch((error) => {
      console.error("[Service Worker] Failed to open cache:", error);
    })
  );
});


// Claiming Clients During the Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  console.log("[Service Worker] Activating...");
  });


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


// Add Fetch Event
self.addEventListener('fetch', event => {
  console.log("[Service Worker] Fetching:", event.request.url);
  event.respondWith(async () => {
      const cache = await caches.open(staticCacheName);

      // match the request to our cache
      const cachedResponse = await cache.match(event.request);

      // check if we got a valid response
      if (cachedResponse !== undefined) {
          // Cache hit, return the resource
          return cachedResponse;
      } else {
        // Otherwise, go to the network
          return fetch(event.request)
      }
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
        return caches.match('offline.html'); // Example fallback
      });
    }).catch((error) => {
      console.error("[Service Worker] Error matching cache:", error);
      // Optionally, return a fallback response or cache a fallback page
      return caches.match('offline.html'); // Example fallback
    })
  });

        
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
