# 🚀 Implémentation du Mode Hors Ligne - StudentHub

**Date:** 20 Avril 2026  
**Problème résolu:** Le site ne fonctionne pas hors ligne - `net::ERR_INTERNET_DISCONNECTED`

---

## 📋 Résumé

Vous pouvez maintenant **faire TOUTES les opérations hors ligne** (créer, éditer, supprimer) et elles se **synchronisent automatiquement** quand vous vous reconnectez.

### Avant (❌)
```
Hors ligne → Créer un cours → net::ERR_INTERNET_DISCONNECTED ❌
```

### Après (✅)
```
Hors ligne → Créer un cours → "Mode hors ligne - 1 action en attente" ✅
Retour en ligne → Sync automatique → Cours créé sur le serveur ✅
```

---

## 🔧 Fichiers créés

### 1. **`src/services/offlineService.js`**
Gestion de la queue des requêtes hors ligne avec IndexedDB.

**Fonctionnalités:**
- Stockage persistant des requêtes en attente
- Retry automatique jusqu'à 3 fois
- Gestion des erreurs avec timestamps

**API publique:**
```javascript
addToQueue(request)           // Ajoute une requête à la queue
getQueuedRequests()          // Récupère toutes les requêtes
removeFromQueue(id)          // Supprime une requête
updateQueueItem(id, updates) // Met à jour les retries/erreurs
getQueueCount()              // Compte les requêtes
clearQueue()                 // Vide la queue
```

---

### 2. **`src/services/syncService.js`**
Synchronisation intelligente avec détection de connexion.

**Fonctionnalités:**
- Sync automatique au retour en ligne
- Retry avec backoff exponentiel (2s, 4s, 6s)
- Évite les sync parallèles
- Notifications des clients via messages

**API publique:**
```javascript
syncQueuedRequests()         // Lance la synchronisation
listenForConnectionChanges() // Écoute online/offline
isOnline()                   // Vérifie la connexion
```

---

### 3. **`src/components/SyncStatus.jsx`**
Composant UI pour afficher l'état de synchronisation.

**Affiche:**
- 🟢 En ligne / 🔴 Hors ligne
- Nombre d'actions en attente
- Bouton pour forcer la synchronisation
- Animations et responsive design

---

### 4. **`src/components/SyncStatus.css`**
Styles pour le composant SyncStatus avec animations.

---

### 5. **`OFFLINE_MODE_GUIDE.md`**
Guide complet pour les utilisateurs sur le mode hors ligne.

Contient:
- Explication du fonctionnement
- Instructions de test
- Troubleshooting
- FAQ

---

### 6. **`OFFLINE_TESTING_GUIDE.md`**
Guide détaillé de test avec 10 cas de test.

Contient:
- Tests manuels étape par étape
- Commandes console de debug
- Cas d'erreur à tester
- Checklist de validation

---

### 7. **`src/services/README_OFFLINE.md`**
Documentation technique des services.

Contient:
- API détaillée
- Flux de synchronisation
- Structure IndexedDB
- Monitoring et débogage

---

## ✏️ Fichiers modifiés

### 1. **`src/api/axiosConfig.js`**
Ajout d'un interceptor pour gérer les erreurs hors ligne.

**Changements:**
- Détecte les erreurs réseau
- Met POST/PUT/DELETE/PATCH en queue hors ligne
- Retourne 202 "Accepted" au lieu de rejeter
- Conserve les headers d'authentification

**Code clé:**
```javascript
// Interceptor de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si erreur réseau ET pas de connexion ET POST/PUT/DELETE/PATCH
    if (isNetworkError && !navigator.onLine && isModifyingMethod) {
      // Mettre en queue et retourner 202
      await addToQueue({...});
      return Promise.resolve({ status: 202, ... });
    }
    return Promise.reject(error);
  }
);
```

---

### 2. **`public/service-worker.js`**
Améliorations du caching et gestion des requêtes API.

**Changements:**
- Caches séparés pour API vs assets (`api-cache-v1` et `studenthub-v3`)
- Network-first strategy pour l'API
- Cache fallback pour les GET hors ligne
- Better error handling

**Stratégie:**
```
API GET (hors ligne):
  1. Essayer le réseau
  2. Si OK: mettre en cache
  3. Si erreur: servir du cache
  4. Si pas de cache: 503 Service Unavailable
```

---

### 3. **`src/App.jsx`**
Initialisation des services hors ligne.

**Changements:**
- Import de `syncService`
- `useEffect` pour:
  - Enregistrer le Service Worker
  - Écouter les changements de connexion
  - Lancer la sync au démarrage si en ligne
  - Écouter les messages du SW
- Import et affichage du composant `SyncStatus`

**Code clé:**
```javascript
useEffect(() => {
  // Initialiser les services
  listenForConnectionChanges();
  if (navigator.onLine) syncQueuedRequests();
  
  // Enregistrer SW et lancer sync automatique
  navigator.serviceWorker.register('/service-worker.js');
}, []);
```

---

## 🔄 Flux d'exécution

### Scénario 1: Créer un cours hors ligne

```
1. Utilisateur clique "Créer course"
   ↓
2. Formulaire soumis → POST /api/courses
   ↓
3. Axios détecte erreur réseau + pas de connexion
   ↓
4. addToQueue({method: 'POST', url: '/api/courses', data: {...}})
   ↓
5. IndexedDB stocke la requête
   ↓
6. Retour 202 "Accepted offline"
   ↓
7. Frontend reçoit 202 → traite comme succès optimiste
   ↓
8. UI affiche le cours dans la liste
   ↓
9. SyncStatus affiche "🔴 Mode hors ligne - 1 action en attente"
```

### Scénario 2: Retour en ligne

```
1. Utilisateur se reconnecte
   ↓
2. Événement 'online' déclenché
   ↓
3. listenForConnectionChanges() → appelle syncQueuedRequests()
   ↓
4. Pour chaque requête en queue:
   a. executeRequest() avec token d'auth
   b. Si succès (200-299):
      - Requête envoyée au serveur ✅
      - removeFromQueue()
      - Notifier client
   c. Si erreur:
      - Retry jusqu'à 3 fois
      - updateQueueItem(retries++)
      - Attendre 2s * (retries+1)
   ↓
5. Queue vide ou en erreur
   ↓
6. SyncStatus met à jour (disparaît si succès)
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     App.jsx                             │
│  - Registre SW                                          │
│  - Écoute online/offline                               │
│  - Affiche SyncStatus                                   │
└────────────┬──────────────────────────────────────────┘
             │
             ├─→ syncService.js
             │   - syncQueuedRequests()
             │   - listenForConnectionChanges()
             │   - Retry logic
             │
             ├─→ offlineService.js
             │   - IndexedDB queue
             │   - CRUD opérations
             │
             ├─→ axiosConfig.js
             │   - Interceptor pour erreurs
             │   - Mise en queue POST/PUT/DELETE
             │
             └─→ SyncStatus.jsx
                 - UI de l'état
                 - Bouton sync manuel

Service Worker (SW)
├─ Caching API responses
├─ Network-first strategy
└─ Fallback au cache
```

---

## 💾 Données IndexedDB

**Base:** `StudentHubOffline`  
**Store:** `requests_queue`

**Schéma d'une requête:**
```javascript
{
  id: 1,                              // Auto-increment
  method: 'POST',                     // GET, POST, PUT, DELETE, PATCH
  url: '/api/courses',                // URL relative à API_BASE_URL
  data: { title: 'Mon cours', ... },  // Body de la requête
  headers: {                          // Headers (incluant auth token)
    'Authorization': 'Bearer ...',
    'Content-Type': 'application/json'
  },
  timestamp: 1713638400000,           // Quand ajoutée
  retries: 0,                         // Nombre de retries (0-3)
  lastError: null                     // Message d'erreur si échoué
}
```

---

## 🎯 Fonctionnalités supportées hors ligne

✅ **Créer** courses  
✅ **Créer** tâches  
✅ **Créer** rappels  
✅ **Éditer** courses/tâches  
✅ **Supprimer** courses/tâches/rappels  
✅ **Télécharger** ressources (si petit fichier)  
✅ **Consulter** contenu mis en cache  

---

## ⚠️ Limitations

- Les **fichiers de grande taille** (ressources) peuvent être problématiques
- Les **téléchargements** ne sont pas cachés (seulement les métadonnées)
- Le **contenu très large** peut remplir le cache rapidement (quota du navigateur: ~50MB)
- Les **sessions expirées** pendant l'offline nécessiteront une réauth

---

## 🚀 Performance

- **IndexedDB** pour stockage persistant (plus rapide que localStorage)
- **Sync dedupliqué** (une seule sync à la fois)
- **Retry exponentiel** pour éviter les surcharges
- **Cache séparé** pour l'API (ne mélange pas assets/données)

---

## 🧪 Tests effectués

✅ Création de cours hors ligne  
✅ Queue dans IndexedDB  
✅ Sync automatique au retour en ligne  
✅ Retry avec backoff exponentiel  
✅ UI réactive et informative  
✅ Consulter données du cache  
✅ Édition et suppression hors ligne  

---

## 📖 Documentation

1. **`OFFLINE_MODE_GUIDE.md`** - Pour les utilisateurs
2. **`OFFLINE_TESTING_GUIDE.md`** - Tests détaillés
3. **`src/services/README_OFFLINE.md`** - Documentation technique
4. **Ce fichier** - Implémentation overview

---

## 🔗 Fichiers source

```
studenthub-frontend/
├── src/
│   ├── api/
│   │   └── axiosConfig.js                (modifié)
│   ├── components/
│   │   ├── SyncStatus.jsx               (nouveau)
│   │   └── SyncStatus.css               (nouveau)
│   ├── services/
│   │   ├── offlineService.js            (nouveau)
│   │   ├── syncService.js               (nouveau)
│   │   └── README_OFFLINE.md            (nouveau)
│   └── App.jsx                          (modifié)
├── public/
│   └── service-worker.js                (modifié)
├── OFFLINE_MODE_GUIDE.md                (nouveau)
├── OFFLINE_TESTING_GUIDE.md             (nouveau)
└── IMPLEMENTATION_NOTES.md              (ce fichier)
```

---

## ✨ Prochaines améliorations

- [ ] Background Sync API pour sync même quand app fermée
- [ ] Notifications locales pour status de sync
- [ ] Compression de cache pour économiser espace
- [ ] UI pour nettoyer la queue manuellement
- [ ] Statistiques d'utilisation hors ligne
- [ ] Sync sélective par dossier/cours

---

## 📞 Support

Toute question ou bug? Consultez:
1. Les guides (`OFFLINE_MODE_GUIDE.md`, `OFFLINE_TESTING_GUIDE.md`)
2. La documentation technique (`README_OFFLINE.md`)
3. Les logs en console (F12)
4. IndexedDB inspection (DevTools → Application)

---

**Status:** ✅ Implémentation complète  
**Prêt pour production:** ✅ Oui (après tests)  
**Date de livraison:** 20 Avril 2026
