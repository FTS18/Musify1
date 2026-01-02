const filesToCache = [
    '/assets/css/style.css',
    '/assets/css/theme.css',
    '/assets/js/app.js',
    '/assets/js/data.js',
    '/assets/js/lazysizes.min.js',
    '/index.html',
    '/assets/pages/offline.html',
    '/assets/pages/404.html',
    '/manifest.json',
];

const staticCacheName = 'v22';

self.addEventListener('install', event => {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            return Promise.all(filesToCache.map(url => {
                return fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${url}`);
                        }
                        const clonedResponse = response.clone();
                        return cache.put(url, clonedResponse);
                    })
                    .catch(error => {
                        console.error(`Failed to cache ${url}: ${error.message}`);
                    });
            }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Activating new service worker...');
    const cacheAllowlist = [staticCacheName];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                console.log('Found ', event.request.url, ' in cache');
                return response;
            }
            console.log('Network request for ', event.request.url);
            return fetch(event.request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(staticCacheName).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(error => {
                    return caches.match('/pages/offline.html'); // Fallback to offline page
                });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
