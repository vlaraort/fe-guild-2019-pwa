importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');
importScripts('src/lib/idb.js');
importScripts('src/js/utility.js');

// const SERVER_URL = '192.168.43.209:3000';
// const API_URL = `${SERVER_URL}/selfies`;

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({
      cacheName: 'google-fonts',
      plugins: [
          new workbox.expiration.Plugin({
              maxEntries: 3,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
          })
      ]
  }));

  workbox.routing.registerRoute(
    routeData => routeData.event.request.headers.get('accept').includes('text/html'),
    args => {
        return caches.match(args.event.request)
            .then(response => {
                if (response) {
                    console.log(response);
                    return response;
                }

                // Clone the request - a request is a stream and can be only consumed once
                const requestToCache = args.event.request.clone();

                // Try to make the original HTTP request as intended
                return fetch(requestToCache)
                    .then(response => {
                        // If request fails or server responds with an error code, return that error immediately
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Again clone the response because you need to add it into the cache and because it's used
                        // for the final return response
                        const responseToCache = response.clone();

                        caches.open('dynamic')
                            .then(cache => {
                                cache.put(requestToCache, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(error => {
                return caches.match('/fe-guild-2019-pwa/offline.html');
            });
    }
);

workbox.routing.registerRoute(API_URL, args => {
  return fetch(args.event.request)
      .then(response => {
          const clonedResponse = response.clone();
          clearAllData('selfies')
              .then(() => clonedResponse.json())
              .then(selfies => {
                  for (const selfie in selfies) {
                      writeData('selfies', selfies[selfie])
                  }
              });
          return response;
      });
});

self.addEventListener('sync', event => {
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-selfies') {
      console.log('[Service Worker] Syncing new Posts');
      event.waitUntil(
          readAllData('sync-selfies')
              .then(syncSelfies => {
                  for (const syncSelfie of syncSelfies) {
                      const postData = new FormData();
                      postData.append('id', syncSelfie.id);
                      postData.append('title', syncSelfie.title);
                      postData.append('location', syncSelfie.location);
                      postData.append('selfie', syncSelfie.selfie);

                      fetch(API_URL, {method: 'POST', body: postData})
                          .then(response => {
                              console.log('Sent data', response);
                              if (response.ok) {
                                  response.json()
                                      .then(resData => {
                                          deleteItemFromData('sync-selfies', parseInt(resData.id));
                                      });
                              }
                          })
                          .catch(error => console.log('Error while sending data', error));
                  }
              })
      );
  }
});