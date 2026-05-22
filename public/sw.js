self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Nuevo Aviso - Empanadas CRM';
    const options = {
        body: data.body || 'Tienes una nueva actualización en tu panel.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Basic install event to allow PWA installation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
