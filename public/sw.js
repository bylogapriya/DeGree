self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // A basic network-first or fallback fetch approach
  event.respondWith(
    fetch(event.request).catch(() => new Response('Offline text or proper offline page'))
  );
});
