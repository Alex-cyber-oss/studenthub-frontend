# 📱 StudentHub - PWA & Système de Rappels

## ✨ Nouvellesfoncionalités

### 1️⃣ **Progressive Web App (PWA)**

StudentHub est maintenant une **PWA complète** ! Vous pouvez :

- 📲 **Installer l'app** depuis votre navigateur (Android, iOS, Windows, Mac, Linux)
- 🔄 **Utiliser hors ligne** - Les données mises en cache restent accessibles
- 🚀 **Accès instantané** depuis l'écran d'accueil
- 🔔 **Recevoir des notifications** push

#### Installation

**Sur Android :**
1. Ouvrez StudentHub dans Chrome/Edge
2. Appuyez sur le bouton "⋮" (options)
3. Sélectionnez "Installer l'app" ou "Ajouter à l'écran d'accueil"

**Sur iPhone :**
1. Ouvrez StudentHub dans Safari
2. Appuyez sur "Partager"
3. Sélectionnez "Sur l'écran d'accueil"

**Sur Desktop (Windows/Mac/Linux) :**
1. Ouvrez StudentHub dans Chrome/Edge
2. Cliquez sur le bouton "Installer" dans la barre d'adresse
3. Confirmez l'installation

### 2️⃣ **Système de Rappels Intelligents** 🔔

Quand vous créez une tâche avec une deadline, le système génère automatiquement des rappels :

#### Fréquence des rappels

| Jours avant deadline | Fréquence | Horaires |
|---|---|---|
| +7 jours | 1x par jour | 20h30 |
| 3-7 jours | 2x par jour | 20h30 + 22h |
| 2-3 jours | 2x par jour | 20h30 + 22h |
| Jour J | 2x par jour | 20h30 + 22h |

**Exemples :**
- Deadline 2 avril → 1 rappel à 20h30 chaque jour jusqu'au 31 mars
- Deadline 25 mars → 2 rappels à 20h30 et 22h du 22 au 25 mars

#### Comment activer les rappels

1. Allez sur le **Tableau de bord**
2. Cliquez sur **"Activer les rappels"**
3. Autorisez les notifications du navigateur
4. Les rappels arriveront automatiquement ! 📬

#### Fonctionnalités des notifications

- ⏰ Apparaissent aux heures programmées
- 🎯 Clic = Voir la tâche
- 🔕 Fermer = Ignorer
- 💤 "Rappeler plus tard" = Snooze 30 min

---

## 🚀 Hébergement

### Option 1 : **Heroku** (Facile, gratuit limitellement)

**Avantages :**
- Configuration minimale
- Laravel prêt à l'emploi
- SSL gratuit

**Étapes :**

```bash
# 1. Installer Heroku CLI
# Pour Windows : https://devcenter.heroku.com/articles/heroku-cli

# 2. Se connecter
heroku login

# 3. Créer une app
heroku create studenthub-app

# 4. Ajouter une base de données PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Configurer les variables d'environnement
heroku config:set APP_KEY=your-app-key
heroku config:set APP_DEBUG=false
heroku config:set APP_ENV=production

# 6. Déployer
git push heroku main
```

**Coût :** Gratuit jusqu'à certaines limites (2024), puis ~$7/mois

### Option 2 : **DigitalOcean** (Recommandé, meilleur rapport prix/perf)

**Avantages :**
- VPS complet (contrôle total)
- Bon rapport prix (~$5-10/mois)
- Facile pour Laravel

**Étapes :**

```bash
# 1. Créer un Droplet (VPS) sur DigitalOcean
# - Sélectionner "Ubuntu 24.04 LTS"
# - Taille minimale : $5/mois
# - Ajouter SSH key

# 2. Se connecter au serveur
ssh root@votre_ip

# 3. Installer les dépendances
apt update && apt upgrade
apt install -y nginx mariadb-server php php-cli php-fpm php-mysql php-mbstring php-xml php-json npm nodejs

# 4. Cloner le projet
cd /var/www
git clone https://github.com/votre-username/studenthub-api.git

# 5. Installer les dépendances Laravel
cd studenthub-api
composer install
cp .env.example .env
php artisan key:generate

# 6. Configurer la base de données
# Éditer .env avec vos infos:
# DB_HOST=localhost
# DB_DATABASE=studenthub
# DB_USERNAME=studenthub
# DB_PASSWORD=...

# Créer la base de données
mysql -u root -e "CREATE DATABASE studenthub;"
mysql -u root -e "CREATE USER 'studenthub'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -e "GRANT ALL PRIVILEGES ON studenthub.* TO 'studenthub'@'localhost';"

# Exécuter les migrations
php artisan migrate

# 7. Configurer Nginx (voir config ci-dessous)

# 8. Frontenddeploi
cd ../studenthub-frontend
npm install
npm run build
# Copier le dossier dist dans /var/www/studenthub-api/public

# 9. Démarrer les services
systemctl restart nginx php8.X-fpm
```

**Configuration Nginx :**

Créer `/etc/nginx/sites-available/studenthub` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/studenthub-api/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Activer :
```bash
ln -s /etc/nginx/sites-available/studenthub /etc/nginx/sites-enabled/
systemctl restart nginx
```

### Option 3 : **Vercel + Railway/Render** (Modern, Serverless)

**Pour le API (Railway/Render) :**
- Connecter votre repo GitHub
- Variables d'env automatiques
- DB PostgreSQL intégrée
- ~$10/mois

**Pour le Frontend (Vercel) :**
- Déploiement automatique à chaque git push
- CDN global
- Gratuit pour les petits projets

---

## 🛠 Configuration Entièrement Optionnelle

### Ajouter des icônes personnalisées (PWA)

1. Créer des icônes :
   - 192x192px (icon-192x192.png)
   - 512x512px (icon-512x512.png)
   - Versions "maskable" pour iOS

2. Placer dans `/studenthub-frontend/public/`

3. Modifier `manifest.json` si nécessaire

### Notifications Push avancées (Web Push)

Si vous voulez des vraies notifications push (même quand l'app est fermée) :

1. **Générer une clé VAPID :**
```bash
# Sur Node.js
npm install -g web-push
web-push generate-vapid-keys
```

2. **Configurer Laravel :**
   - Stocker les clés dans `.env`
   - Implémenter l'endpoint `/subscribe` pour les push subscriptions
   - Utiliser `laravel-notification-channels/webpush`

3. **Test simple (déjà implémenté) :**
   - Les notifications locales fonctionnent sans clés VAPID
   - Pour chaque rappel, une notification s'affiche

---

## 📋 Checklist Avant d'Héberger

- [ ] Configurer `.env` correctement
- [ ] `APP_KEY` généré (`php artisan key:generate`)
- [ ] `APP_DEBUG=false` en production
- [ ] Base de données créée et migrée
- [ ] Frontend compilé (npm run build)
- [ ] CORS configuré (voir `config/cors.php`)
- [ ] SSL/HTTPS activé
- [ ] Sauvegardes automatiques de DB
- [ ] Logs configurés (voir `config/logging.php`)

---

## 🆘 Dépannage Commun

### "Service Worker non enregistré"
- Vérifier que vous êtes en **HTTPS** (ou localhost)
- Vérifier que `public/service-worker.js` existe

### "Les notifications ne fonctionnent pas"
- Vérifier les permissions dans les paramètres du navigateur
- Vérifier les logs de la console (F12)
- S'assurer que le Service Worker est actif (DevTools > Application > Service Workers)

### "Les rappels ne se créent pas"
- Vérifier que la migration a été exécutée : `php artisan migrate`
- Vérifier les logs : `tail -f storage/logs/laravel.log`
- Tester via l'API : `curl http://localhost/api/test`

---

## 📞 Support

Para plus d'aide :
- Documentation Laravel : https://laravel.com/docs
- Documentation PWA : https://web.dev/progressive-web-apps/
- Support DigitalOcean : https://www.digitalocean.com/support
