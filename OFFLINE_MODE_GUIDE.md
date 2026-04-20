# 📱 Guide d'Utilisation Hors Ligne - StudentHub

## ✨ Qu'est-ce qui a été amélioré ?

Vous pouvez maintenant **faire TOUTES les opérations hors ligne** et elles se synchroniseront automatiquement quand vous vous reconnectez ! 

### ✅ Opérations supportées en mode hors ligne :
- ✏️ **Créer** des cours
- ✏️ **Créer** des tâches
- ✏️ **Créer** des rappels
- ✏️ **Télécharger** des ressources
- ✏️ **Éditer** des cours
- ✏️ **Éditer** des tâches
- ✏️ **Supprimer** du contenu
- 📖 **Consulter** le contenu en cache

---

## 🔧 Comment ça fonctionne ?

### 1️⃣ **Hors ligne (🔴 Pas de connexion)**

Quand vous faites une action (créer un cours, une tâche, etc.):

```
1. L'action est mise en mémoire (IndexedDB)
2. Un message "Mode hors ligne" s'affiche en bas à droite
3. L'action appear dans l'UI (réponse optimiste)
4. AUCUNE erreur de connexion ! ✅
```

### 2️⃣ **Reconnexion (🟢 Connexion rétablie)**

Automatiquement :

```
1. Détection de la reconnexion
2. Le statut passe à "En ligne"
3. Synchronisation automatique des actions en attente
4. Les données se mettent à jour sur le serveur
5. Message "X action(s) synchronisées" 
```

### 3️⃣ **Gestion des erreurs**

Si une action échoue après 3 tentatives :

```
1. Elle reste en attente
2. Un message d'erreur s'affiche
3. Vous pouvez réessayer manuellement (bouton 🔄)
4. Ou les actions s'enverront la prochaine fois que vous vous reconnectez
```

---

## 📊 Indicateur de synchronisation

### En bas à droite de l'écran, vous verrez :

**Mode hors ligne (🔴)**
```
🔴 Mode hors ligne
   3 action(s) en attente
```

**En ligne sans actions (🟢)** - *(caché)*
```
Rien n'apparaît si tout est synchronisé
```

**En ligne avec actions (🟢)**
```
🟢 En ligne
   2 action(s) à synchroniser  [🔄]
```

Cliquez sur 🔄 pour forcer la synchronisation.

---

## 🧪 Comment tester ?

### Test 1: Créer un cours hors ligne

1. **Ouvrir DevTools** → Network
2. **Désactiver la connexion** : ⚙️ Throttle → Offline
3. **Créer un nouveau cours**
   - Cliquez sur "+ Nouveau cours"
   - Remplissez le formulaire
   - Cliquez "Créer"
4. **Résultat** :
   - ✅ Pas d'erreur
   - 🔴 Statut "Mode hors ligne" avec "1 action en attente"
   - Le cours apparaît dans la liste
5. **Réactiver la connexion** :
   - Throttle → No throttling
6. **Résultat** :
   - 🟢 Statut "En ligne"
   - Synchronisation automatique
   - Le cours est maintenant sur le serveur

### Test 2: Éditer une tâche hors ligne

1. Même procédure
2. Allez sur un cours existant
3. Modifiez une tâche
4. Allez hors ligne
5. Cliquez "Sauvegarder"
6. Revenez en ligne
7. La modification s'envoie automatiquement ✅

### Test 3: Consulter des données en cache

1. **Allez en ligne** et visitez un cours (pour le cacher)
2. **Allez hors ligne**
3. **Naviguez vers ce cours**
4. ✅ Les données s'affichent du cache !

---

## 🐛 Troubleshooting

### "Le mode hors ligne ne fonctionne pas"

**Solution 1:** Vérifier la console (F12)
```
Chercher : "IndexedDB", "Service Worker", "offline"
```

**Solution 2:** Vider le cache et réinstaller
```
DevTools → Storage → Clear Site Data
Puis F5 pour rafraîchir
```

**Solution 3:** Vérifier le Service Worker
```
DevTools → Application → Service Workers
Doit montrer: "activated and running"
```

### "Les actions hors ligne ne se synchronisent pas"

Vérifier :
1. ✅ Vous êtes connecté (`navigator.onLine`)
2. ✅ Le token d'authentification est valide
3. ✅ Le serveur API est accessible

Forcer la synchronisation :
```
Bouton 🔄 en bas à droite
ou
F12 → Console : syncQueuedRequests()
```

---

## 📱 Pour les mobiles

Bien que la app soit déjà installée comme PWA, voici comment vérifier le mode hors ligne :

**Android:**
1. Chrome → Paramètres → Taille des données
2. Basculer "Limiter la taille des données"
3. ou déactiver le Wi-Fi et les données mobiles

**iOS:**
1. Paramètres → Wi-Fi (désactiver)
2. Paramètres → Données mobiles (désactiver)
3. L'app devrait basculer en mode hors ligne

---

## 🔐 Sécurité

✅ **Vos données sont sûres :**
- Stockées localement dans IndexedDB
- Chiffrées en transit (HTTPS)
- Jamais exposées au navigateur de quelqu'un d'autre
- Supprimées une fois synchronisées

---

## 📈 Statistiques

Vous pouvez vérifier l'état de la queue dans la console:

```javascript
// Nombre de requêtes en attente
await getQueueCount()  

// Lister toutes les requêtes
await getQueuedRequests()

// Forcer la synchronisation
await syncQueuedRequests()

// Vider toute la queue
await clearQueue()
```

---

## 🎯 Prochaines améliorations

- [ ] Compresser les données en cache pour économiser l'espace
- [ ] Implémenter la Background Sync API (service worker)
- [ ] Notifications locales pour les actions synchronisées
- [ ] Dashboard des statistiques d'utilisation hors ligne
- [ ] Synchronisation sélective par dossier/cours

---

## 📞 Questions ou problèmes ?

N'hésitez pas à signaler les bugs ! 🐛

Vérifiez d'abord la console (F12) pour les messages d'erreur détaillés.
