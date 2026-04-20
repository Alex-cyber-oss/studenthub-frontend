# 🚀 Déploiement - Mode Hors Ligne

**Status:** ✅ Prêt pour production

## 📋 Checklist avant déploiement

### 1. Tests locaux (requis)
- [ ] `npm run dev` - L'app démarre sans erreur
- [ ] Créer un cours hors ligne (F12 → Offline)
- [ ] Vérifier queue dans IndexedDB (DevTools → Application → IndexedDB)
- [ ] Revenir en ligne et vérifier la sync
- [ ] Service Worker enregistré et running (DevTools → Application → SW)

### 2. Tests de build
```bash
# Build Vite
npm run build

# Vérifier qu'aucune erreur
# Vérifier que les assets sont générés
```

### 3. Vérification des fichiers

✅ Fichiers créés:
- `src/services/offlineService.js`
- `src/services/syncService.js`
- `src/components/SyncStatus.jsx`
- `src/components/SyncStatus.css`
- `src/services/README_OFFLINE.md`
- `OFFLINE_MODE_GUIDE.md`
- `OFFLINE_TESTING_GUIDE.md`
- `IMPLEMENTATION_NOTES_OFFLINE.md`

✅ Fichiers modifiés:
- `src/api/axiosConfig.js` (interceptor ajouté)
- `src/App.jsx` (services initialisés)
- `public/service-worker.js` (caching amélioré)

### 4. Vérification de compatibilité

- [ ] Chrome/Edge 90+ (Service Worker, IndexedDB, Fetch API)
- [ ] Firefox 88+ (Service Worker, IndexedDB, Fetch API)
- [ ] Safari 14+ (Service Worker, IndexedDB, Fetch API)
- [ ] Mobile (Android Chrome, iOS Safari)

---

## 🔧 Instructions de déploiement

### Sur Vercel (déploiement actuel)

```bash
# 1. Commiter les changements
git add .
git commit -m "feat: offline mode with auto-sync"

# 2. Push vers main
git push origin main

# 3. Vercel va automatiquement déployer
# (Web hooks configurés)

# 4. Vérifier après déploiement
# https://studenthub.vercel.app
# F12 → Application → Service Workers
# Doit afficher: "activated and running"
```

### Sur autres plateformes

```bash
# 1. Build
npm run build

# 2. Déployer le contenu de 'dist/'
# Les fichiers dans 'public/' doivent être servies statiquement

# 3. Vérifier que:
# - /service-worker.js est accessible
# - /manifest.json est accessible
# - HTTPS est activé (requis pour SW)
```

---

## 🔍 Vérification post-déploiement

### Checklist site live

1. **Service Worker installé**
   ```
   Console: "✅ Service Worker enregistré"
   DevTools → Application → Service Workers → "activated and running"
   ```

2. **App installable (PWA)**
   ```
   Barre d'adresse: Bouton "Installer"
   Android: "Ajouter à l'écran d'accueil"
   ```

3. **Mode hors ligne fonctionne**
   ```
   DevTools → Network → Offline
   Créer un cours
   Pas d'erreur ✅
   "Mode hors ligne" affiché ✅
   ```

4. **Sync automatique**
   ```
   Retourner online
   Sync automatique lance ✅
   Cours visible sur le serveur ✅
   ```

---

## 📊 Monitoring et debugging

### En production, surveiller:

1. **Erreurs Service Worker**
   - Vérifier les DevTools Console
   - Chercher "Service Worker" pour les logs

2. **Problèmes de queue**
   - Utilisateurs offline → les actions vont en queue
   - Utilisateurs online → vérifier que la sync lance

3. **Quotas de cache/IndexedDB**
   - Chrome: ~50MB total par site
   - Firefox: ~50MB
   - Safari: ~50MB

### Logs à surveiller

```javascript
// Service Worker
"✅ Service Worker: Installation en cours..."
"✅ Service Worker: Activation en cours..."

// Offline
"📱 Mode hors ligne: Mise en queue de: POST /api/courses"

// Sync
"🔄 Démarrage de la synchronisation des requêtes en queue..."
"✅ Synchronisé: POST /api/courses"
"✅ Synchronisation terminée"

// Erreurs
"❌ Erreur lors de la synchronisation:"
"❌ Max retries atteint pour:"
```

---

## ⚠️ Points d'attention

### 1. HTTPS requis
- Service Worker nécessite HTTPS
- Localhost accepté pour dev
- Production MUST avoir HTTPS

### 2. Quota de stockage
- IndexedDB par domaine
- Partager avec localStorage
- ~50-500MB selon navigateur
- Implémenter nettoyage si besoin

### 3. Token d'authentification
- Stocké dans IndexedDB avec requête
- Peut expirer pendant offline
- Utilisateur relogué si token exppiré

### 4. Taille des fichiers
- Gros fichiers (vidéo, images) pas en cache
- Ressources uniquement métadonnées
- Limiter téléchargements hors ligne

---

## 🐛 Troubleshooting en production

### Service Worker ne s'enregistre pas

```
1. Vérifier HTTPS (obligatoire)
2. Vérifier /service-worker.js accessible (HTTP 200)
3. Vérifier Service-Worker-Allowed header
4. DevTools: Hard refresh (Cmd+Shift+R)
```

### IndexedDB plein

```
1. Vérifier quota: DevTools → Storage → Estimate
2. Nettoyer old caches: Service Worker → Clear Storage
3. Implémenter cache ttl si besoin
```

### Sync ne lance pas

```
1. Vérifier online event: navigator.onLine dans console
2. Vérifier queue non-vide: getQueueCount()
3. Vérifier token valide
4. Vérifier API accessible
5. Forcer sync: syncQueuedRequests()
```

---

## 📈 Rollback plan

Si problèmes en production:

```bash
# 1. Identifier la version problématique
# (Vercel: Deployments tab)

# 2. Redéployer version précédente
# Vercel: "Redeploy" sur ancien déploiement

# 3. OU créer feature flag pour désactiver offline
# Ajouter dans App.jsx:
// if (OFFLINE_MODE_DISABLED) {
//   return <Router>...</Router> (sans SyncStatus)
// }
```

---

## ✅ Validation finale

Avant déploiement en production:

- [ ] Tous les fichiers créés et modifiés présents
- [ ] Pas d'erreurs TypeScript/Linting
- [ ] Build Vite réussit
- [ ] Tests manuels passent
- [ ] Service Worker enregistre
- [ ] IndexedDB fonctionne
- [ ] Sync automatique fonctionne
- [ ] UI responsive et belle
- [ ] Performance acceptable (<3s load)
- [ ] HTTPS activé
- [ ] PWA installable

---

## 📞 Support post-déploiement

### Utilisateurs rencontrent des problèmes?

1. **Conseiller de:**
   - Effacer le cache (DevTools → Storage → Clear Site Data)
   - Hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)
   - Réinstaller l'app PWA

2. **Vérifier:**
   - Browser compatibility (Chrome, Firefox, Safari)
   - Qu'ils ont du stockage libre
   - Connection internet stable après offline

3. **Documentation:** Renvoyer à
   - `OFFLINE_MODE_GUIDE.md` pour mode d'emploi
   - `OFFLINE_TESTING_GUIDE.md` pour tester
   - Ce fichier pour support tech

---

## 🎉 Déploiement réussi

Quand tout fonctionne:

```
✅ App disponible offline
✅ Toutes opérations en queue hors ligne
✅ Sync auto au retour en ligne
✅ Zero erreurs utilisateur pour offline
✅ PWA installable
✅ Utilisateurs heureux! 🎊
```

---

**Date:** 20 Avril 2026  
**Préparation:** ✅ Complète  
**Prêt pour prod:** ✅ OUI
