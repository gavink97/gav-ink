const cacheName = 'v1';

const cacheAssets = ['/', '/public/scenes/hero/index.js'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheName).then((cache) => {
			return cache.addAll(cacheAssets);
		}),
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		}),
	);
});
