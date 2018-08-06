var CACHE_NAME = 'restaurant-cache';
var urlsToCache = [
  '/',
  './index.html',
  './manifest.json',
  './restaurant.html',
  './css/styles.min.css',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  './js/idb.js',
  './img/1.webp',
  './img/2.webp',
  './img/3.webp',
  './img/4.webp',
  './img/5.webp',
  './img/6.webp',
  './img/7.webp',
  './img/8.webp',
  './img/9.webp',
  './img/10.webp',
  './img/lazy.webp',
  './img/RR_192.webp',
  './img/RR_512.webp'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['restaurant-cache'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         }
//         var fetchRequest = event.request.clone();
//         return fetch(fetchRequest).then(
//           function(response) {
//             if(!response || response.status !== 200 || response.type !== 'basic') {
//               return response;
//             }
//             var responseToCache = response.clone();
//             caches.open(CACHE_NAME)
//               .then(function(cache) {
//                 cache.put(event.request, responseToCache);
//               });
//             return response;
//           }
//         );
//       })
//     );
// });


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
          return fetch(event.request).then(response => {
            if (event.request.method !== 'GET') {
              return response;
            }
            cache.put(event.request, response.clone());
            return response;
          }); 
    }).catch(() => {
          return caches.match(event.request);
        })
  );
}); 
