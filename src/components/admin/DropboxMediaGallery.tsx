'use client';
import { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

interface DropboxMediaGalleryProps {
  className?: string;
  onMediaChange?: (media: MediaItem[]) => void;
  initialMedia?: MediaItem[];
}

export default function DropboxMediaGallery({ 
  className = '', 
  onMediaChange,
  initialMedia = []
}: DropboxMediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [newUrl, setNewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction pour convertir un lien Dropbox en lien direct
  const convertDropboxLink = (url: string): string => {
    let directLink = url.trim();
    
    // Méthode 1: Remplacer ?dl=0 par ?raw=1
    directLink = directLink.replace('?dl=0', '?raw=1');
    
    // Méthode 2: Si pas de changement, utiliser dl=1
    if (directLink === url.trim()) {
      directLink = url.trim().replace('?dl=0', '?dl=1');
    }
    
    // Méthode 3: Si pas de paramètre, ajouter ?raw=1
    if (!directLink.includes('?')) {
      directLink = directLink + '?raw=1';
    }
    
    // Méthode 4: Utiliser le format direct de Dropbox
    if (directLink.includes('www.dropbox.com')) {
      directLink = directLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      directLink = directLink.replace(/[?&]dl=[01]/, '');
      directLink = directLink.replace(/[?&]raw=[01]/, '');
    }
    
    return directLink;
  };

  // Fonction pour détecter le type de média
  const detectMediaType = (url: string): 'image' | 'video' => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    
    const lowerUrl = url.toLowerCase();
    
    // Vérifier les extensions
    for (const ext of imageExtensions) {
      if (lowerUrl.includes(ext)) return 'image';
    }
    
    for (const ext of videoExtensions) {
      if (lowerUrl.includes(ext)) return 'video';
    }
    
    // Par défaut, considérer comme image
    return 'image';
  };

  // Fonction pour valider et ajouter un média
  const addMedia = async () => {
    if (!newUrl.trim()) {
      setError('Veuillez entrer un lien Dropbox');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Convertir le lien Dropbox
      const directLink = convertDropboxLink(newUrl);
      
      // Détecter le type de média
      const mediaType = detectMediaType(directLink);
      
      // Créer un nouvel élément média
      const newMedia: MediaItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: directLink,
        type: mediaType,
        title: `Média ${media.length + 1}`,
        description: `Ajouté le ${new Date().toLocaleDateString('fr-FR')}`
      };

      // Ajouter à la liste
      const updatedMedia = [...media, newMedia];
      setMedia(updatedMedia);
      
      // Notifier le parent
      if (onMediaChange) {
        onMediaChange(updatedMedia);
      }

      setSuccess(`Média ${mediaType === 'image' ? 'image' : 'vidéo'} ajouté avec succès !`);
      setNewUrl('');
      
    } catch (error) {
      setError('Erreur lors de l\'ajout du média');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour supprimer un média
  const removeMedia = (id: string) => {
    const updatedMedia = media.filter(item => item.id !== id);
    setMedia(updatedMedia);
    
    if (onMediaChange) {
      onMediaChange(updatedMedia);
    }
  };

  // Fonction pour tester un lien
  const testLink = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <div className={`dropbox-media-gallery ${className}`}>
      <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">📸 Galerie Médias Dropbox</h3>
        
        {/* Formulaire d'ajout */}
        <div className="mb-6">
          <div className="flex gap-3 mb-3">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Collez votre lien Dropbox ici..."
              className="flex-1 bg-gray-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={addMedia}
              disabled={isProcessing || !newUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <span>+</span>
                  Ajouter
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded-lg mb-3">
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900 border border-green-500 text-green-200 p-3 rounded-lg mb-3">
              ✅ {success}
            </div>
          )}
        </div>

        {/* Liste des médias */}
        {media.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              Médias ({media.length})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <div key={item.id} className="bg-gray-800 border border-white/10 rounded-lg overflow-hidden">
                  {/* Prévisualisation */}
                  <div className="aspect-video bg-gray-700 relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title || 'Image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    )}
                    
                    {/* Fallback si erreur */}
                    <div className="hidden absolute inset-0 bg-gray-600 flex items-center justify-center">
                      <div className="text-center text-gray-300">
                        <div className="text-2xl mb-2">
                          {item.type === 'image' ? '🖼️' : '🎥'}
                        </div>
                        <div className="text-sm">Lien invalide</div>
                      </div>
                    </div>
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Informations */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                        {item.type === 'image' ? 'Image' : 'Vidéo'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new URL(item.url).hostname}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-300 truncate">
                      {item.title}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">📋 Instructions</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p>• Collez directement vos liens Dropbox dans le champ ci-dessus</p>
            <p>• Les liens seront automatiquement convertis en format direct</p>
            <p>• Supporte les images (JPG, PNG, GIF, WebP) et vidéos (MP4, MOV, AVI)</p>
            <p>• Les médias sont automatiquement détectés et affichés</p>
          </div>
        </div>

        {/* Aide pour les liens Dropbox */}
        <div className="mt-4 bg-blue-900 border border-blue-500 text-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">🔗 Format des liens Dropbox</h4>
          <div className="text-sm space-y-1">
            <p>✅ <code className="bg-blue-800 px-1 rounded">https://www.dropbox.com/s/xxxxx/image.jpg?raw=1</code></p>
            <p>✅ <code className="bg-blue-800 px-1 rounded">https://dl.dropboxusercontent.com/s/xxxxx/video.mp4</code></p>
            <p>❌ <code className="bg-red-800 px-1 rounded">https://www.dropbox.com/s/xxxxx/image.jpg?dl=0</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}