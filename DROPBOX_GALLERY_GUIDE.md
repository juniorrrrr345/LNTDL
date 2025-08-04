# 📸 Guide Galerie Dropbox Avancée

## 🎯 Vue d'ensemble

Cette nouvelle solution remplace l'ancien système d'upload par téléphone et offre une gestion moderne des médias Dropbox avec :

- ✅ **Conversion automatique des liens Dropbox** en format direct
- ✅ **Détection automatique** des images et vidéos
- ✅ **Interface moderne** avec prévisualisation
- ✅ **Plusieurs layouts** d'affichage (grille, carousel, masonry)
- ✅ **Gestion complète** des médias (ajout, suppression, modification)
- ✅ **API robuste** pour l'intégration

## 🚀 Installation

### 1. Composants requis

Assurez-vous d'avoir les fichiers suivants :

```
src/
├── components/
│   ├── admin/
│   │   ├── DropboxMediaGallery.tsx    # Gestionnaire de galerie
│   │   └── DropboxGalleryExample.tsx  # Exemple d'utilisation
│   └── MediaDisplay.tsx               # Composant d'affichage
├── hooks/
│   └── useDropboxMedia.ts             # Hook personnalisé
└── app/api/
    └── dropbox-media/
        └── route.ts                   # API de gestion
```

### 2. Configuration Dropbox

Vérifiez que vos variables d'environnement sont configurées :

```env
DROPBOX_ACCESS_TOKEN=votre_token
DROPBOX_APP_KEY=votre_app_key
DROPBOX_APP_SECRET=votre_app_secret
```

## 📖 Utilisation

### 1. Gestionnaire de Galerie

Le composant `DropboxMediaGallery` permet d'ajouter et gérer vos médias :

```tsx
import DropboxMediaGallery from '@/components/admin/DropboxMediaGallery';

function MonComposant() {
  const [media, setMedia] = useState([]);

  return (
    <DropboxMediaGallery
      onMediaChange={setMedia}
      initialMedia={media}
    />
  );
}
```

**Fonctionnalités :**
- ✅ Ajout de liens Dropbox par copier-coller
- ✅ Conversion automatique en format direct
- ✅ Détection automatique image/vidéo
- ✅ Prévisualisation en temps réel
- ✅ Suppression individuelle
- ✅ Interface intuitive

### 2. Affichage des Médias

Le composant `MediaDisplay` affiche vos médias avec différents layouts :

```tsx
import MediaDisplay from '@/components/MediaDisplay';

function MonAffichage() {
  const media = [
    {
      id: '1',
      url: 'https://dl.dropboxusercontent.com/s/xxxxx/image.jpg',
      type: 'image',
      title: 'Mon image'
    }
  ];

  return (
    <MediaDisplay
      media={media}
      layout="grid"           // 'grid' | 'carousel' | 'masonry'
      showControls={true}
      autoPlay={false}
    />
  );
}
```

**Layouts disponibles :**
- 🎯 **Grid** : Affichage en grille responsive
- 🎠 **Carousel** : Diaporama avec navigation
- 🧱 **Masonry** : Layout Pinterest-style

### 3. Hook personnalisé

Le hook `useDropboxMedia` simplifie la gestion :

```tsx
import { useDropboxMedia } from '@/hooks/useDropboxMedia';

function MonHook() {
  const {
    media,
    addMedia,
    removeMedia,
    updateMedia,
    clearMedia,
    fixAllLinks
  } = useDropboxMedia();

  const handleAdd = async () => {
    try {
      await addMedia('https://www.dropbox.com/s/xxxxx/image.jpg?dl=0');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAdd}>Ajouter média</button>
      <button onClick={fixAllLinks}>Corriger liens</button>
      <button onClick={clearMedia}>Vider galerie</button>
    </div>
  );
}
```

## 🔧 API

### Endpoint : `/api/dropbox-media`

#### GET - Analyser un lien
```bash
GET /api/dropbox-media?url=https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
```

**Réponse :**
```json
{
  "success": true,
  "originalUrl": "https://www.dropbox.com/s/xxxxx/image.jpg?dl=0",
  "directUrl": "https://dl.dropboxusercontent.com/s/xxxxx/image.jpg",
  "type": "image",
  "isValid": true,
  "hostname": "dl.dropboxusercontent.com"
}
```

#### POST - Ajouter un média
```bash
POST /api/dropbox-media
{
  "url": "https://www.dropbox.com/s/xxxxx/video.mp4?dl=0",
  "title": "Ma vidéo",
  "description": "Description optionnelle"
}
```

**Réponse :**
```json
{
  "success": true,
  "media": {
    "id": "1234567890abc",
    "url": "https://dl.dropboxusercontent.com/s/xxxxx/video.mp4",
    "type": "video",
    "title": "Ma vidéo",
    "description": "Description optionnelle"
  },
  "message": "Média vidéo ajouté avec succès"
}
```

## 🔗 Conversion des liens

### Formats supportés

**✅ Liens valides :**
```
https://www.dropbox.com/s/xxxxx/image.jpg?raw=1
https://dl.dropboxusercontent.com/s/xxxxx/video.mp4
https://www.dropbox.com/s/xxxxx/image.jpg?dl=1
```

**❌ Liens à corriger :**
```
https://www.dropbox.com/s/xxxxx/image.jpg?dl=0
```

### Conversion automatique

Le système convertit automatiquement :

1. `?dl=0` → `?raw=1`
2. `?dl=0` → `?dl=1` (si raw=1 ne fonctionne pas)
3. Ajout de `?raw=1` si aucun paramètre
4. `www.dropbox.com` → `dl.dropboxusercontent.com`

## 📱 Types de médias supportés

### Images
- JPG, JPEG
- PNG
- GIF
- WebP
- BMP
- SVG

### Vidéos
- MP4
- AVI
- MOV
- WMV
- FLV
- WebM
- MKV
- M4V

## 🎨 Intégration dans votre site

### 1. Page d'administration

```tsx
import DropboxGalleryExample from '@/components/admin/DropboxGalleryExample';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>Administration Galerie</h1>
      <DropboxGalleryExample />
    </div>
  );
}
```

### 2. Page publique

```tsx
import MediaDisplay from '@/components/MediaDisplay';

export default function PublicPage() {
  // Récupérer les médias depuis votre base de données
  const media = [
    {
      id: '1',
      url: 'https://dl.dropboxusercontent.com/s/xxxxx/image.jpg',
      type: 'image',
      title: 'Image publique'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1>Ma Galerie</h1>
      <MediaDisplay
        media={media}
        layout="grid"
        showControls={true}
      />
    </div>
  );
}
```

## 🔄 Migration depuis l'ancien système

### 1. Remplacer l'upload par téléphone

**Avant :**
```tsx
<DropboxUploader
  onUpload={handleUpload}
  type="image"
/>
```

**Après :**
```tsx
<DropboxMediaGallery
  onMediaChange={handleMediaChange}
  initialMedia={existingMedia}
/>
```

### ✅ **Migration complète effectuée :**

- **Supprimé** l'ancien composant `DropboxUploader.tsx`
- **Remplacé** toutes les références par `DropboxMediaGallery`
- **Mis à jour** les placeholders pour indiquer "Collez votre lien Dropbox"
- **Ajouté** la conversion automatique des liens
- **Supprimé** la dépendance aux tokens Dropbox

### 2. Corriger les liens existants

```tsx
import { useDropboxMedia } from '@/hooks/useDropboxMedia';

function MigrationComponent() {
  const { fixAllLinks } = useDropboxMedia(existingMedia);

  return (
    <button onClick={fixAllLinks}>
      🔧 Corriger tous les liens existants
    </button>
  );
}
```

## 🛠️ Dépannage

### Problème : Liens qui ne s'affichent pas

**Solution :**
1. Vérifiez que le lien Dropbox est public
2. Utilisez le bouton "Corriger tous les liens"
3. Testez avec `?raw=1` au lieu de `?dl=0`

### Problème : Token Dropbox expiré

**Solution :**
1. Renouvelez votre token dans l'interface Dropbox
2. Mettez à jour `DROPBOX_ACCESS_TOKEN`
3. Redémarrez votre application

### Problème : Vidéos qui ne se chargent pas

**Solution :**
1. Vérifiez le format de la vidéo (MP4 recommandé)
2. Assurez-vous que la taille < 150MB
3. Testez le lien directement dans le navigateur

## 📊 Avantages de cette solution

### ✅ Comparé à l'ancien système

| Fonctionnalité | Ancien système | Nouvelle solution |
|----------------|----------------|-------------------|
| Upload par téléphone | ✅ | ❌ (remplacé par liens) |
| Conversion liens | ❌ | ✅ Automatique |
| Détection type | ❌ | ✅ Automatique |
| Prévisualisation | ❌ | ✅ Temps réel |
| Layouts multiples | ❌ | ✅ 3 layouts |
| API robuste | ❌ | ✅ Complète |
| Gestion erreurs | ❌ | ✅ Avancée |

### 🚀 Nouvelles fonctionnalités

- **Interface moderne** avec onglets et contrôles
- **Conversion automatique** des liens Dropbox
- **Détection intelligente** des types de médias
- **Layouts multiples** pour différents usages
- **API complète** pour l'intégration
- **Gestion d'erreurs** robuste
- **Statistiques** en temps réel
- **Code d'intégration** généré automatiquement

## 🎯 Prochaines étapes

1. **Intégrer** dans votre interface d'administration
2. **Tester** avec vos liens Dropbox existants
3. **Migrer** les anciens médias si nécessaire
4. **Personnaliser** les layouts selon vos besoins
5. **Sauvegarder** les médias en base de données

---

**💡 Conseil :** Commencez par tester avec quelques liens Dropbox pour vous familiariser avec la nouvelle interface !