const CACHE_NAME = 'studenthub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/main.jsx',
  '/style.css',
  '/App.css'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
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
  // Ne traiter que les requêtes HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ne pas cacher les requêtes API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => {
          // Retourner une réponse d'erreur au lieu de undefined
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        })
    );
    return;
  }

  // Cacher le reste
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || !response.url.startsWith('http')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Retourner index.html si disponible, sinon une réponse d'erreur
        return caches.match('/index.html').then(cached => {
          return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
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
