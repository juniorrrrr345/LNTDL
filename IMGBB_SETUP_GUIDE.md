# 📸 Guide Configuration ImgBB

## 🆓 Alternative Gratuite à Cloudinary

### ✅ Avantages d'ImgBB :
- **Gratuit** : 32MB par image/vidéo
- **URLs directes** : Parfait pour l'affichage
- **API simple** : Upload facile
- **Pas de compte** : Upload anonyme possible
- **CDN global** : Rapide partout

## 🔑 Obtenir votre clé API ImgBB :

### 1. **Aller sur ImgBB**
- Visitez : https://imgbb.com/
- Cliquez sur "Get API Key" en haut à droite

### 2. **Créer un compte**
- Inscrivez-vous gratuitement
- Confirmez votre email

### 3. **Obtenir la clé API**
- Allez dans "API" dans votre compte
- Copiez votre clé API

### 4. **Configurer dans .env**
```env
IMGBB_API_KEY=votre_cle_api_imgbb_ici
```

## 🚀 Utilisation :

### **Pour les Images :**
- 📱 **Bouton jaune** : "📱 Sélectionner image depuis la galerie"
- 🖼️ **Upload automatique** vers ImgBB
- ⚡ **URL directe** générée
- ✅ **Accessible partout** - Navigation privée incluse

### **Pour les Vidéos :**
- 📱 **Bouton jaune** : "📱 Sélectionner vidéo depuis la galerie"
- 🎥 **Upload automatique** vers ImgBB
- ⚡ **URL directe** générée
- ✅ **Accessible partout** - Navigation privée incluse

## 💡 Avantages :

- ✅ **Gratuit** - Pas de coût
- ✅ **URLs directes** - Compatible avec `<img>` et `<video>`
- ✅ **CDN global** - Rapide partout
- ✅ **Pas de cache** - Fonctionne en navigation privée
- ✅ **API simple** - Upload en une requête
- ✅ **Optimisation** - Images compressées automatiquement

## 🔧 Configuration :

1. **Remplacez** `your_imgbb_api_key_here` par votre vraie clé
2. **Redémarrez** le serveur
3. **Testez** avec une image/vidéo

## 📊 Limites :

- **Taille max** : 32MB par fichier
- **Format** : Images (JPG, PNG, GIF) et Vidéos (MP4, MOV, etc.)
- **Stockage** : Illimité (gratuit)

## 🎯 Résultat :

Vos médias seront accessibles partout, même en navigation privée, avec des URLs directes comme :
- `https://i.ibb.co/xxxxx/image.jpg`
- `https://i.ibb.co/xxxxx/video.mp4`