const CACHE_NAME = 'upload2library-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/uploadForm.html',
    '/styles/app.css',
    '/styles/futuristic.css',
    '/manifest.json',
    '/icons/upload-192.png',
    '/icons/upload-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});