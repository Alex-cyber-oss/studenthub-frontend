# 🧪 Guide de Test - Mode Hors Ligne

## ✅ Tests à effectuer

### Test 1: Création de cours hors ligne

**Étapes:**
1. Ouvrir DevTools (F12)
2. Aller à l'onglet "Network" ou "Application"
3. Simuler mode hors ligne:
   - Chrome: Throttle → Offline
   - DevTools Network: Check "Offline" (condition drop-down)
4. Naviguer vers la création d'un cours
5. Remplir le formulaire et cliquer "Créer"

**Résultat attendu:**
```
✅ Pas d'erreur de connexion
✅ Message "Mode hors ligne" en bas à droite
✅ "1 action en attente" visible
✅ Le cours apparaît dans la liste (optimiste)
✅ Console: "Mise en queue de: POST /api/courses"
```

---

### Test 2: Vérifier IndexedDB

**Étapes:**
1. Avec le mode hors ligne encore actif
2. DevTools → Application → IndexedDB
3. Ouvrir "StudentHubOffline" → "requests_queue"

**Résultat attendu:**
```
✅ Voir 1 entrée avec:
  - method: "POST"
  - url: contenant "/api/courses"
  - data: { title: "...", description: "..." }
  - timestamp: [number]
  - retries: 0
```

---

### Test 3: Synchronisation automatique

**Étapes:**
1. Garder le mode hors ligne
2. Créer 2-3 cours supplémentaires
3. Vérifier la queue (3 requêtes en attente)
4. Revenir en ligne:
   - DevTools Network: Uncheck "Offline"
   - ou Throttle → No throttling
5. Observer la synchronisation

**Résultat attendu:**
```
✅ SyncStatus change à "🟢 En ligne"
✅ "3 action(s) à synchroniser"
✅ Synchronisation automatique débute
✅ Console: "Synchronisé: POST /api/courses"
✅ Après quelques secondes: Queue vide
✅ SyncStatus disparaît
```

---

### Test 4: Édition hors ligne

**Étapes:**
1. Aller en ligne et visiter un cours existant
2. Cliquer pour éditer
3. Aller hors ligne
4. Modifier un champ
5. Cliquer "Sauvegarder"

**Résultat attendu:**
```
✅ Pas d'erreur
✅ "1 action en attente"
✅ Modification visuelle appliquée
✅ Retour en ligne → sync auto
```

---

### Test 5: Suppression hors ligne

**Étapes:**
1. Aller hors ligne
2. Trouver une tâche/ressource
3. Cliquer "Supprimer"
4. Confirmer

**Résultat attendu:**
```
✅ Pas d'erreur
✅ L'item disparaît de l'UI (optimiste)
✅ "1 action en attente"
✅ Retour en ligne → sync auto
```

---

### Test 6: Consultation hors ligne

**Étapes:**
1. Aller en ligne
2. Visiter un cours
3. Aller hors ligne
4. Rafraîchir la page
5. Revenir au course

**Résultat attendu:**
```
✅ Les données s'affichent du cache
✅ Pas d'erreur 503
✅ Contenu visible et fonctionnel
```

---

### Test 7: Rechargement hors ligne

**Étapes:**
1. Aller hors ligne
2. Appuyer F5 (rafraîchir)
3. Naviguer dans l'app

**Résultat attendu:**
```
✅ App charge depuis le cache
✅ Pas d'erreur complète
✅ Pages visitées avant sont accessibles
✅ SyncStatus s'affiche correctement
```

---

### Test 8: Retry et erreur

**Étapes:**
1. Aller hors ligne
2. Créer un cours
3. Revenir en ligne MAIS:
   - Arrêter le serveur API
   - ou Bloquer la requête dans les DevTools
4. Observer les retries

**Résultat attendu:**
```
✅ Premier essai échoue
✅ "⏳ Retry 1/3"
✅ Attendre 2-4 secondes
✅ "⏳ Retry 2/3"
✅ Après 3 retries: message d'erreur
✅ Action reste en queue
✅ Relancer le serveur
✅ Cliquer 🔄 pour refaire sync
✅ Succès ✅
```

---

### Test 9: Bouton de sync manuel

**Étapes:**
1. Aller hors ligne
2. Créer une action
3. Revenir en ligne
4. Attendre que SyncStatus apparaisse avec 🔄
5. Cliquer le bouton 🔄

**Résultat attendu:**
```
✅ Icône 🔄 se met à tourner
✅ État: "⏳ Synchronisation..."
✅ Synchronisation s'exécute
✅ "Synchronisation terminée"
✅ SyncStatus disparaît (si succès)
```

---

### Test 10: Mobile simulé

**Étapes (Chrome DevTools):**
1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Sélectionner un appareil mobile
3. Réduire la bande passante (3G lent)
4. Créer une action
5. Désactiver complètement le réseau

**Résultat attendu:**
```
✅ SyncStatus reste visible et lisible
✅ Texte pas trop petit
✅ Bouton 🔄 accessible
✅ Animations fluides
```

---

## 📊 Vérifications en console (F12)

```javascript
// Voir l'état de la queue
await getQueuedRequests().then(items => {
  console.table(items);
});

// Compter les requêtes
await getQueueCount();

// Vérifier la connexion
console.log('Online:', navigator.onLine);

// Tester la sync manuelle
await syncQueuedRequests();

// Vider la queue (ATTENTION!)
// await clearQueue();

// Voir les logs du SW
console.log('Service Worker Controller:', navigator.serviceWorker.controller);
```

---

## 🔍 Debugging avancé

### Activer les logs détaillés

```javascript
// Dans DevTools Console
localStorage.setItem('DEBUG_OFFLINE', 'true');
location.reload();

// Les services vont logger plus de détails
// Chercher: "Offline", "Queue", "Sync", "Retry"
```

### Simuler une connexion lente

1. DevTools → Network
2. Throttle: "Slow 3G" ou "Fast 3G"
3. Tester les actions
4. Observer les délais de sync

### Inspecter le Service Worker

1. DevTools → Application → Service Workers
2. Doit afficher: "activated and running"
3. Cliquer "Inspect" pour voir les logs du SW

### Inspecter IndexedDB

1. DevTools → Application → IndexedDB
2. "StudentHubOffline" → "requests_queue"
3. Voir le contenu en temps réel

---

## ❌ Cas d'erreur à tester

### Cas 1: Token expiré hors ligne

```
1. Aller hors ligne
2. Créer une action
3. Token expire
4. Revenir en ligne
5. Sync échoue (401 Unauthorized)
6. Doit être retryée à la prochaine sync
7. Utilisateur relogué si token vraiment expiré
```

### Cas 2: Données invalides

```
1. Créer une action avec des données invalides
2. Aller hors ligne
3. Ajouter à la queue
4. Revenir en ligne → Sync échoue (validation)
5. Doit rester en queue et afficher erreur
```

### Cas 3: Connexion intermittente

```
1. Aller hors ligne
2. Créer actions
3. Revenir en ligne 2 secondes
4. Repartir hors ligne
5. Sync partiellement complétée
6. Revenir en ligne
7. Sync des actions restantes
```

---

## 📝 Checklist de validation

- [ ] Test 1: Création hors ligne ✅
- [ ] Test 2: IndexedDB contient la queue ✅
- [ ] Test 3: Sync automatique fonctionne ✅
- [ ] Test 4: Édition hors ligne ✅
- [ ] Test 5: Suppression hors ligne ✅
- [ ] Test 6: Consultation du cache ✅
- [ ] Test 7: Rechargement hors ligne ✅
- [ ] Test 8: Retry automatique ✅
- [ ] Test 9: Sync manuel ✅
- [ ] Test 10: Mobile OK ✅
- [ ] Cas d'erreur 1: Token expiré ✅
- [ ] Cas d'erreur 2: Données invalides ✅
- [ ] Cas d'erreur 3: Connexion intermittente ✅

---

## 🎯 Résumé

Une fois tous les tests passés:
- ✅ Mode hors ligne **fonctionne entièrement**
- ✅ Synchronisation **automatique et fiable**
- ✅ UI **réactive et informative**
- ✅ **Zéro erreur** lors d'opérations hors ligne
- ✅ Utilisateur peut **travailler comme si de rien n'était** 😎

---

**Dernière mise à jour:** 20 Avril 2026
