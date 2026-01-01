// Service Worker for SwimMarks
const CACHE_NAME = 'swimmarks-v1.1';
const APP_PREFIX = 'SwimMarks-';

self.addEventListener('install', function(event) {
    console.log('Service Worker installing');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Caching app shell');
            return cache.addAll([
                '/SwimMarks-/',
                '/SwimMarks-/index.html',
                '/SwimMarks-/manifest.json'
            ]);
        }).then(function() {
            console.log('Skip waiting on install');
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activating');
    event.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== CACHE_NAME) {
                    console.log('Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }).then(function() {
            console.log('Claiming clients');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Only handle same-origin requests
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) {
        return;
    }
    
    // For navigation requests, serve index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/SwimMarks-/index.html').then(function(response) {
                return response || fetch(event.request);
            })
        );
        return;
    }
    
    // For other requests, try cache then network
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});