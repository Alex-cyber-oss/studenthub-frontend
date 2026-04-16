const CACHE_NAME = 'studenthub-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache ouvert');
        // Cache each URL individually to avoid failing installation if one asset is missing.
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
      .catch(err => console.log('Service Worker: Erreur lors du caching', err))
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation en cours...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Network first, puis cache en fallback
self.addEventListener('fetch', event => {
  // Eviter les requetes non cacheables/non supportees.
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (!['http:', 'https:'].includes(requestUrl.protocol)) {
    return;
  }

  // Ignorer les URLs navigateur/extension qui font echouer Cache.put().
  if (requestUrl.protocol === 'chrome-extension:' || requestUrl.pathname.startsWith('/__')) {
    return;
  }

  // Ne pas mettre en cache les appels API.
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response('Network error', { status: 503, statusText: 'Service Unavailable' })
      )
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))
            .catch(() => {})
        );

        return networkResponse;
      } catch {
        const offlinePage = await caches.match('/index.html');
        return offlinePage || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});

// Gestion des messages push (notifications de rappels)
self.addEventListener('push', event => {
  console.log('Push notification reçue:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Rappel de tâche',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: data.taskId || 'task-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'snooze',
            title: 'Rappeler plus tard'
          },
          {
            action: 'open',
            title: 'Voir la tâche'
          }
        ],
        data: {
          url: data.url || '/tasks',
          taskId: data.taskId,
          taskTitle: data.title
        }
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'StudentHub - Rappel', options)
      );
    } catch (err) {
      console.log('Erreur parsing push data:', err);
      event.waitUntil(
        self.registration.showNotification('StudentHub - Rappel', {
          body: event.data.text(),
          icon: '/icon-192x192.png'
        })
      );
    }
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('Notification cliquée:', event);
  event.notification.close();

  if (event.action === 'snooze') {
    // Implémenter la logique de snooze (rappeler dans 30 min)
    console.log('Snooze: Rappel dans 30 minutes');
  } else {
    // Ouvrir l'URL de la tâche
    const url = event.notification.data.url || '/tasks';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre si aucune n'existe
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', event => {
  console.log('Notification fermée:', event);
});

// Sync en background pour synchroniser les données
self.addEventListener('sync', event => {
  console.log('Background sync déclenchée:', event.tag);
  
  if (event.tag === 'sync-reminders') {
    event.waitUntil(
      fetch('/api/reminders/sync')
        .then(response => response.json())
        .then(data => {
          console.log('Reminders synced:', data);
        })
        .catch(err => console.log('Erreur sync reminders:', err))
    );
  }
});
