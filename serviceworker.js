
    // Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js

    /*
      Welcome to our basic Service Worker! This Service Worker offers a basic offline experience
      while also being easily customizeable. You can add in your own code to implement the capabilities
      listed below, or change anything else you would like.


      Need an introduction to Service Workers? Check our docs here: https://docs.pwabuilder.com/#/home/sw-intro
      Want to learn more about how our Service Worker generation works? Check our docs here: https://docs.pwabuilder.com/#/studio/existing-app?id=add-a-service-worker

      Did you know that Service Workers offer many more capabilities than just offline? 
        - Background Sync: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06
        - Periodic Background Sync: https://web.dev/periodic-background-sync/
        - Push Notifications: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=push-notifications-on-the-web
        - Badges: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=application-badges
    */

    const HOSTNAME_WHITELIST = [
        self.location.hostname,
        'fonts.gstatic.com',
        'fonts.googleapis.com',
         'drive.google.com',
         'play.google.com', 
         'googletagmanager.com', 
         'api.google.com',   
        'cdn.jsdelivr.net'
    ]

    // The Util Function to hack URLs of intercepted requests
    const getFixedUrl = (req) => {
        var now = Date.now()
        var url = new URL(req.url)

        // 1. fixed http URL
        // Just keep syncing with location.protocol
        // fetch(httpURL) belongs to active mixed content.
        // And fetch(httpRequest) is not supported yet.
        url.protocol = self.location.protocol

        // 2. add query for caching-busting.
        // Github Pages served with Cache-Control: max-age=600
        // max-age on mutable content is error-prone, with SW life of bugs can even extend.
        // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
        // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
        if (url.hostname === self.location.hostname) {
            url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
        }
        return url.href
    }

    /**
     *  @Lifecycle Activate
     *  New one activated when old isnt being used.
     *
     *  waitUntil(): activating ====> activated
     */
    self.addEventListener('activate', event => {
      event.waitUntil(self.clients.claim())
    })

    /**
     *  @Functional Fetch
     *  All network requests are being intercepted here.
     *
     *  void respondWith(Promise<Response> r)
     */
    self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
        Promise.race([fetched.catch(_ => cached), cached])
            .then(resp => resp || fetched)
            .catch(_ => { /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
        Promise.all([fetchedCopy, caches.open("pwa-cache")])
            .then(([response, cache]) => response.ok && cache.put(event.request, response))
            .catch(_ => { /* eat any errors */ })
        )
    }
    })




// =====
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
    //  console.error("[Service Worker] Failed to delete old caches:", error);
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
          //    console.error("[Service Worker] Failed to cache response:", error);
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
  });

        
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

// Adding A Push Listener to our Service Worker
self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Notification Title', {
      body: 'Notification Body Text',
      icon: 'custom-notification-icon.png',
    })
  );
});

// Handling Notification Clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); 
    var fullPath = self.location.origin + event.notification.data.path; 
    clients.openWindow(fullPath); 
});

// Implement Background Sync
// Check to make sure Sync is supported.
if ('serviceWorker' in navigator && 'SyncManager' in window) {

  // Get our service worker registration.
  const registration = await navigator.serviceWorker.registration;

  try {
    // This is where we request our sync. 
    // We give it a "tag" to allow for differing sync behavior.
    await registration.sync.register('database-sync');

  } catch {
    console.log("Background Sync failed.")
  }
}

// Add an event listener for the `sync` event in your service worker.
self.addEventListener('sync', event => {

  // Check for correct tag on the sync event.
  if (event.tag === 'database-sync') {

    // Execute the desired behavior with waitUntil().
    event.waitUntil(

      // This is just a hypothetical function for the behavior we desire.
      pushLocalDataToDatabase();
    );
    }
});


// Query the user for permission. Implement Periodic Background Sync
const periodicSyncPermission = await navigator.permissions.query({
  name: 'periodic-background-sync',
});

// Check if permission was properly granted.
if (periodicSyncPermission.state == 'granted') {

  // Register a new periodic sync.
  await registration.periodicSync.register('fetch-new-content', {
    // Set the sync to happen no more than once a day.
    minInterval: 24 * 60 * 60 * 1000
  });
} 

// Listen for the `periodicsync` event.
self.addEventListener('periodicsync', event => {

  // Check for correct tag on the periodicSyncPermissionsync event.
  if (event.tag === 'fetch-new-content') {

    // Execute the desired behavior with waitUntil().
    event.waitUntil(

      // This is just a hypothetical function for the behavior we desire.
      fetchNewContent();
    );
  }
});
