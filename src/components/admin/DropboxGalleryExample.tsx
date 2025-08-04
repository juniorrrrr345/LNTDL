'use client';
import { useState } from 'react';
import { useDropboxMedia } from '@/hooks/useDropboxMedia';
import DropboxMediaGallery from './DropboxMediaGallery';
import MediaDisplay from '@/components/MediaDisplay';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

export default function DropboxGalleryExample() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'display'>('gallery');
  const [displayLayout, setDisplayLayout] = useState<'grid' | 'carousel' | 'masonry'>('grid');
  
  const {
    media,
    isLoading,
    error,
    addMedia,
    removeMedia,
    updateMedia,
    clearMedia,
    fixAllLinks
  } = useDropboxMedia();

  const handleMediaChange = (newMedia: MediaItem[]) => {
    // Ici vous pourriez sauvegarder en base de données
    console.log('Médias mis à jour:', newMedia);
  };

  const handleAddMedia = async (url: string, title?: string, description?: string) => {
    try {
      await addMedia(url, title, description);
      console.log('Média ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du média:', error);
    }
  };

  return (
    <div className="dropbox-gallery-example">
      <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">📸 Galerie Dropbox Avancée</h2>
        
        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🖼️ Gestionnaire de Galerie
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'display'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👁️ Aperçu des Médias
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Galerie Dropbox */}
            <DropboxMediaGallery
              onMediaChange={handleMediaChange}
              initialMedia={media}
            />

            {/* Actions rapides */}
            <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">⚡ Actions Rapides</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={fixAllLinks}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔧 Corriger tous les liens
                </button>
                <button
                  onClick={clearMedia}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🗑️ Vider la galerie
                </button>
                <button
                  onClick={() => {
                    const mediaData = JSON.stringify(media, null, 2);
                    navigator.clipboard.writeText(mediaData);
                    alert('Données copiées dans le presse-papiers !');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📋 Copier les données
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">📊 Statistiques</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{media.length}</div>
                  <div className="text-gray-400 text-sm">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {media.filter(m => m.type === 'image').length}
                  </div>
                  <div className="text-gray-400 text-sm">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {media.filter(m => m.type === 'video').length}
                  </div>
                  <div className="text-gray-400 text-sm">Vidéos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {media.filter(m => !m.url.includes('dl.dropboxusercontent.com')).length}
                  </div>
                  <div className="text-gray-400 text-sm">Liens à corriger</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="space-y-6">
            {/* Contrôles d'affichage */}
            <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">🎛️ Contrôles d'Affichage</h3>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Layout</label>
                  <select
                    value={displayLayout}
                    onChange={(e) => setDisplayLayout(e.target.value as any)}
                    className="bg-gray-700 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="grid">Grille</option>
                    <option value="carousel">Carousel</option>
                    <option value="masonry">Masonry</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Aperçu des médias */}
            <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">👁️ Aperçu</h3>
              <MediaDisplay
                media={media}
                layout={displayLayout}
                showControls={true}
                autoPlay={false}
              />
            </div>

            {/* Code d'intégration */}
            <div className="bg-gray-800 border border-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">💻 Code d'Intégration</h3>
              <div className="bg-gray-900 border border-white/10 rounded-lg p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
{`import MediaDisplay from '@/components/MediaDisplay';

// Dans votre composant
<MediaDisplay
  media={${JSON.stringify(media, null, 2)}}
  layout="${displayLayout}"
  showControls={true}
  autoPlay={false}
/>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Messages d'état */}
        {isLoading && (
          <div className="bg-blue-900 border border-blue-500 text-blue-200 p-3 rounded-lg">
            ⏳ Traitement en cours...
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-yellow-900 border border-yellow-500 text-yellow-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Comment utiliser</h4>
          <div className="text-sm space-y-1">
            <p>1. Collez vos liens Dropbox dans le gestionnaire de galerie</p>
            <p>2. Les liens sont automatiquement convertis en format direct</p>
            <p>3. Les images et vidéos sont automatiquement détectées</p>
            <p>4. Utilisez l'aperçu pour voir le résultat final</p>
            <p>5. Copiez le code d'intégration pour l'utiliser dans votre site</p>
          </div>
        </div>
      </div>
    </div>
  );
}