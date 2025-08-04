# 🔧 Guide de Dépannage Dropbox

## Problème : Images avec point d'interrogation

Si vos images uploadées sur Dropbox affichent un point d'interrogation, voici les solutions :

### 1. **Diagnostic Automatique**
Utilisez le composant de diagnostic dans l'interface d'administration :
- Allez dans la section "Gestion des Produits"
- Cliquez sur "Tester la connexion Dropbox"
- Cliquez sur "🔧 Corriger les liens existants"

### 2. **Correction Manuelle des Liens**

#### Méthode 1 : Paramètre `?raw=1`
```
❌ Lien incorrect : https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
✅ Lien corrigé : https://www.dropbox.com/s/xxxxx/image.jpg?raw=1
```

#### Méthode 2 : Paramètre `?dl=1`
```
❌ Lien incorrect : https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
✅ Lien corrigé : https://www.dropbox.com/s/xxxxx/image.jpg?dl=1
```

#### Méthode 3 : Domaine direct
```
❌ Lien incorrect : https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
✅ Lien corrigé : https://dl.dropboxusercontent.com/s/xxxxx/image.jpg
```

### 3. **Token d'Accès Expiré**

Les tokens Dropbox expirent après 4 heures. Pour les renouveler :

1. Allez sur [Dropbox Developers](https://www.dropbox.com/developers/apps)
2. Sélectionnez votre app
3. Allez dans "Permissions"
4. Générez un nouveau token d'accès
5. Mettez à jour `DROPBOX_ACCESS_TOKEN` dans vos variables d'environnement

### 4. **Configuration Requise**

Vérifiez que ces variables sont configurées :
```env
DROPBOX_ACCESS_TOKEN=votre_token_d_acces
DROPBOX_APP_KEY=votre_app_key
DROPBOX_APP_SECRET=votre_app_secret
```

### 5. **Test de Connexion**

Utilisez l'API de test :
```bash
curl http://localhost:3000/api/test-dropbox
```

### 6. **Correction Automatique**

Pour corriger tous les liens existants :
```bash
curl -X POST http://localhost:3000/api/fix-dropbox-links
```

## Solutions Avancées

### Refresh Token (Recommandé)
Pour éviter les expirations, implémentez le refresh token :

1. Configurez `DROPBOX_REFRESH_TOKEN`
2. Le système renouvellera automatiquement les tokens

### Monitoring
Surveillez les logs pour détecter les problèmes :
```bash
# Logs de connexion
🔧 Configuration Dropbox chargée: { accessToken: 'OK', ... }

# Logs d'upload
🔗 Lien Dropbox généré: { original: '...', direct: '...' }

# Erreurs
❌ Erreur connexion Dropbox: { ... }
```

## Prévention

1. **Vérifiez régulièrement** la connexion Dropbox
2. **Renouvelez les tokens** avant expiration
3. **Testez les uploads** après configuration
4. **Surveillez les logs** pour détecter les problèmes

## Support

Si les problèmes persistent :
1. Vérifiez les logs de l'application
2. Testez la connexion Dropbox
3. Renouvelez les tokens d'accès
4. Contactez le support technique