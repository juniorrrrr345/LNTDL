# Guide de Configuration - LNTDL Boutique

## 🚀 Configuration Rapide

### 1. Variables d'Environnement Requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# MongoDB (OBLIGATOIRE)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Dropbox (OBLIGATOIRE pour les uploads)
DROPBOX_ACCESS_TOKEN=votre_access_token_dropbox
DROPBOX_APP_KEY=votre_app_key_dropbox
DROPBOX_APP_SECRET=votre_app_secret_dropbox

# Admin (OBLIGATOIRE)
ADMIN_PASSWORD=votre_mot_de_passe_admin_securise
```

### 2. Configuration Dropbox

1. **Créer une App Dropbox** :
   - Allez sur [Dropbox Developers](https://www.dropbox.com/developers/apps)
   - Cliquez sur "Create app"
   - Choisissez :
     - API : "Scoped access"
     - Access : "Full Dropbox"
     - Name : Un nom unique pour votre app

2. **Obtenir les Credentials** :
   - Dans les settings de votre app :
     - `App key` → `DROPBOX_APP_KEY`
     - `App secret` → `DROPBOX_APP_SECRET`
   
3. **Générer un Access Token** :
   - Dans l'onglet "OAuth 2"
   - Cliquez sur "Generate access token"
   - Copiez le token → `DROPBOX_ACCESS_TOKEN`
   
   **Note** : Les tokens Dropbox expirent après quelques heures. Pour une solution permanente, implémentez le refresh token.

### 3. Configuration MongoDB

1. **Créer un cluster MongoDB Atlas** :
   - Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créez un compte gratuit
   - Créez un nouveau cluster

2. **Configurer l'accès** :
   - Database Access : Créez un utilisateur
   - Network Access : Ajoutez `0.0.0.0/0` pour autoriser toutes les IPs

3. **Obtenir l'URI de connexion** :
   - Cliquez sur "Connect" → "Connect your application"
   - Copiez l'URI et remplacez `<password>` par votre mot de passe

### 4. Installation et Lancement

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
npm start
```

## 📱 Fonctionnalités Dropbox

### Limites et Recommandations

- **Taille max par fichier** : 150 MB
- **Vidéos** : Format MP4 recommandé, durée minimum 30 secondes
- **Images** : Automatiquement optimisées (max 1920x1920px, JPEG 85%)
- **Stockage** : Illimité avec un compte Dropbox Business

### Format des URLs

Les fichiers uploadés sur Dropbox sont accessibles via des liens directs :
- Images : `https://www.dropbox.com/s/xxxxx/image.jpg?raw=1`
- Vidéos : `https://www.dropbox.com/s/xxxxx/video.mp4?raw=1`

## 🔧 Résolution des Problèmes

### Erreur "Access Token Expired"

Les tokens Dropbox expirent après 4 heures. Solutions :

1. **Court terme** : Générer un nouveau token dans l'interface Dropbox
2. **Long terme** : Implémenter le système de refresh token (voir documentation Dropbox OAuth2)

### Erreur "MongoDB Connection Failed"

1. Vérifiez que l'IP est whitelistée dans MongoDB Atlas
2. Vérifiez le nom d'utilisateur et mot de passe
3. Assurez-vous que le cluster est actif

### Panel Admin - Erreurs Communes

1. **"Mot de passe incorrect"** : Vérifiez `ADMIN_PASSWORD` dans `.env.local`
2. **"Erreur upload"** : Vérifiez les credentials Dropbox
3. **"Erreur serveur"** : Vérifiez la connexion MongoDB

## 🚀 Déploiement sur Vercel

1. **Push sur GitHub** :
```bash
git add .
git commit -m "Configuration initiale"
git push origin main
```

2. **Déployer sur Vercel** :
   - Importez le projet depuis GitHub
   - Ajoutez les variables d'environnement
   - Déployez

3. **Variables d'environnement Vercel** :
   - Ajoutez toutes les variables du `.env.local`
   - Ne pas inclure les commentaires

## 📞 Support

Pour toute question ou problème :
1. Vérifiez d'abord ce guide
2. Consultez les logs du navigateur (F12)
3. Vérifiez les logs serveur (`npm run dev`)

## 🔒 Sécurité

- **Ne jamais** commiter le fichier `.env.local`
- Utilisez des mots de passe forts pour `ADMIN_PASSWORD`
- Renouvelez régulièrement les tokens Dropbox
- Limitez les IPs autorisées sur MongoDB en production