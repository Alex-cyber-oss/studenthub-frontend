# StudentHub - Frontend React + Vite

Application de gestion de cours en ligne avec authentification.

## Prérequis

- Node.js (v16 ou supérieur)
- npm

## Installation

```bash
npm.cmd install
```

## Configuration

Créez un fichier `.env` à la racine du projet (ou modifiez `.env.example`) :

```
VITE_API_URL=http://localhost:8000/api
```

Adaptez l'URL selon votre backend Laravel.

## Démarrage du serveur de développement

```bash
npm.cmd run dev
```

L'application sera accessible à `http://localhost:5173`

## Structure du projet

```
src/
├── api/
│   └── axiosConfig.js       # Configuration Axios
├── components/
│   ├── Login.jsx            # Écran de connexion
│   ├── Dashboard.jsx        # Tableau de bord
│   └── PrivateRoute.jsx     # Route protégée
├── services/
│   ├── authService.js       # Service d'authentification
│   └── coursService.js      # Service des cours
├── styles/
│   ├── Login.css
│   ├── Dashboard.css
│   └── App.css
├── App.jsx                  # Composant principal
└── main.jsx                 # Point d'entrée
```

## Flux d'authentification

1. **Login** : L'utilisateur se connecte avec email/mot de passe
2. **Token** : Le serveur retourne un token JWT stocké dans `localStorage`
3. **Private Routes** : Les routes protégées vérifient le token
4. **Dashboard** : Affiche les cours de l'utilisateur
5. **Logout** : Supprime le token et redirige vers login

## Configuration API Expected

L'API Laravel doit disposer des endpoints :

### POST /api/login
**Requête :**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Réponse :**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Utilisateur",
    "email": "user@example.com"
  }
}
```

### GET /api/courses
**Headers :** `Authorization: Bearer {token}`

**Réponse :**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React Basics",
      "code": "REACT101",
      "description": "Introduction à React",
      "instructor": "Jean Dupont"
    }
  ]
}
```

### POST /api/logout
**Headers :** `Authorization: Bearer {token}`

## Build pour la production

```bash
npm.cmd run build
```

Les fichiers compilés seront dans le dossier `dist/`.

## Dépannage

### CORS Error
Si vous avez une erreur CORS, assurez-vous que votre API Laravel accepte les requêtes du domaine front-end.

### Token expiré
Le token expiré (status 401) redirige automatiquement vers `/login`.

### Module not found
Vérifiez que vous avez exécuté `npm.cmd install` avec les bonnes dépendances.
