# 📦 Services Hors Ligne - StudentHub

Ce dossier contient les services pour gérer le fonctionnement hors ligne de StudentHub.

## 📄 Services

### `offlineService.js`
Gestion de la queue des requêtes hors ligne via IndexedDB.

**Fonctions principales:**
- `addToQueue(request)` - Ajoute une requête à la queue
- `getQueuedRequests()` - Récupère toutes les requêtes en attente
- `removeFromQueue(id)` - Supprime une requête (après succès)
- `updateQueueItem(id, updates)` - Met à jour une requête (retries, erreurs)
- `getQueueCount()` - Compte les requêtes en attente
- `clearQueue()` - Vide complètement la queue

**Exemple d'usage:**
```javascript
import { addToQueue, getQueueCount } from './offlineService';

// Ajouter une requête à la queue
await addToQueue({
  method: 'POST',
  url: '/api/courses',
  data: { title: 'Mon cours' },
  headers: { 'Authorization': 'Bearer token' }
});

// Vérifier le nombre de requêtes
const count = await getQueueCount();
console.log(`${count} requête(s) en attente`);
```

---

### `syncService.js`
Service de synchronisation intelligente avec retry automatique.

**Fonctions principales:**
- `syncQueuedRequests()` - Synchronise la queue avec le serveur
- `listenForConnectionChanges()` - Détecte les changements de connexion
- `isOnline()` - Vérifie si on est connecté

**Caractéristiques:**
- ✅ Synchronisation automatique au retour de connexion
- ✅ Retry jusqu'à 3 fois avec backoff exponentiel
- ✅ Évite les sync parallèles
- ✅ Notifie les clients via messages

**Exemple d'usage:**
```javascript
import { syncQueuedRequests, listenForConnectionChanges, isOnline } from './syncService';

// Écouter les changements de connexion
listenForConnectionChanges();

// Forcer une synchronisation
await syncQueuedRequests();

// Vérifier la connexion
if (isOnline()) {
  console.log('En ligne');
} else {
  console.log('Hors ligne');
}
```

---

### `axiosConfig.js` (modifié)
Configuration d'Axios avec gestion hors ligne.

**Modifications:**
- Interceptor de réponse qui détecte les erreurs réseau
- Mise automatique en queue des requêtes POST/PUT/DELETE/PATCH
- Retourne 202 (Accepted) au lieu de rejeter

**Statut de réponse:**
- `200-299` : Succès normal
- `202` : Requête acceptée mais hors ligne (en queue)
- Autres : Erreur

---

## 🔄 Flux de synchronisation

```
┌─────────────────────────────────────────────────────────────┐
│                   UTILISATEUR HORS LIGNE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/courses                                           │
│       ↓                                                      │
│  Erreur réseau détectée                                      │
│       ↓                                                      │
│  Mise en queue IndexedDB                                    │
│       ↓                                                      │
│  Retour 202 "Accepted offline"                              │
│       ↓                                                      │
│  UI continue normalement ✅                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         (utilisateur se reconnecte)
┌─────────────────────────────────────────────────────────────┐
│             UTILISATEUR EN LIGNE - AUTO SYNC                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Événement 'online' déclenché                               │
│       ↓                                                      │
│  syncQueuedRequests() lancé                                 │
│       ↓                                                      │
│  Pour chaque requête en queue:                              │
│    1. executeRequest() (avec token auth)                    │
│    2. Si succès → removeFromQueue()                         │
│    3. Si erreur → retry (max 3 fois)                        │
│    4. Notifier les clients                                  │
│       ↓                                                      │
│  Queue vidée ✅                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Structure IndexedDB

**Base de données:** `StudentHubOffline`

**Object Store:** `requests_queue`
```javascript
{
  id: 1,                    // autoIncrement
  method: 'POST',
  url: '/api/courses',
  data: { title: 'Mon cours' },
  headers: { 'Authorization': 'Bearer ...' },
  timestamp: 1234567890,
  retries: 0,               // Nombre de tentatives
  lastError: null           // Message d'erreur si échoué
}
```

---

## 🔐 Authentification

Les requêtes en queue **conservent le token d'authentification** au moment de la mise en queue.

⚠️ **Important:** Si le token expire pendant qu'on est hors ligne:
- Les requêtes échoueront lors de la sync (401)
- Elles seront retryées à la prochaine sync
- L'utilisateur sera invité à se réauthentifier

---

## 📊 Monitoring

### Console (F12)

**Logs disponibles:**
```javascript
// Voir la queue
getQueuedRequests()

// Compter les requêtes
getQueueCount()

// Forcer la sync
syncQueuedRequests()

// Vider la queue
clearQueue()
```

### SyncStatus Component

Le composant `SyncStatus.jsx` affiche visuellement:
- 🟢 En ligne / 🔴 Hors ligne
- Nombre d'actions en attente
- Bouton pour forcer la sync

---

## 🚀 Performance

- **IndexedDB** pour le stockage persistant
- **Retry exponentiel** (2s, 4s, 6s) pour éviter les overload
- **Sync dedupliqué** (une seule sync à la fois)
- **Cache API** séparé du cache assets

---

## 🐛 Débogage

### Activer les logs détaillés

```javascript
// Dans la console
localStorage.setItem('DEBUG_OFFLINE', 'true');

// Les services logeront plus de détails
```

### Voir la queue

```javascript
const db = await openDB();
const requests = await getQueuedRequests();
requests.forEach(r => {
  console.log(`${r.method} ${r.url} - Retries: ${r.retries}`);
});
```

### Simuler une erreur de sync

```javascript
// Désactiver le réseau et forcer la sync
navigator.serviceWorker.ready.then(reg => {
  syncQueuedRequests();
});
```

---

## 📋 Checklist d'intégration

- [x] `offlineService.js` créé et testé
- [x] `syncService.js` créé et testé
- [x] `axiosConfig.js` modifié avec interceptor
- [x] `service-worker.js` amélioré
- [x] `App.jsx` initialise les services
- [x] `SyncStatus.jsx` pour l'UI
- [x] Tests manuels hors ligne

---

## 📝 Notes

- Service Worker est déjà enregistré dans `App.jsx`
- La synchronisation est **automatique** au retour en ligne
- L'utilisateur peut aussi forcer manuellement via le bouton 🔄
- Les données restent en cache même après sync (pour consultation hors ligne)

---

## 🔗 Références

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
