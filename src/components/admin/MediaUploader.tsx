'use client';
import { useState } from 'react';

interface MediaUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
  showGalleryButton?: boolean;
  galleryButtonText?: string;
}

export default function MediaUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.mp4,.avi,.3gp,.webm,.mkv",
  maxSize = 10, // Limite par défaut réduite
  className = "",
  showGalleryButton = false,
  galleryButtonText = "📱 Galerie"
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille selon le type de fichier
    const videoExtensions = ['.mov', '.mp4', '.avi', '.3gp', '.webm', '.mkv'];
    const isVideo = file.type.startsWith('video/') || 
                   videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const actualMaxSize = isVideo ? 150 : 10; // 150MB pour vidéos, 10MB pour images
    const maxBytes = actualMaxSize * 1024 * 1024;
    
    if (file.size > maxBytes) {
      setError(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB. Maximum ${actualMaxSize}MB pour ${isVideo ? 'les vidéos' : 'les images'}.`);
      return;
    }
    
    // Vérification supplémentaire pour éviter les erreurs MongoDB
    if (isVideo && file.size > 8 * 1024 * 1024) {
      setError(`Vidéo trop volumineuse (${Math.round(file.size / 1024 / 1024)}MB). Utilisez max 8MB pour éviter les erreurs de base de données.`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('🚀 Début upload client:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Réponse serveur:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload réussi:', result);
      
      // Si c'est un upload local, on peut l'uploader vers Dropbox automatiquement
      if (result.url.startsWith('data:') || result.url.startsWith('/api/')) {
        try {
          console.log('🔄 Upload automatique vers Dropbox...');
          const dropboxResponse = await fetch('/api/upload-dropbox', {
            method: 'POST',
            body: formData,
          });
          
          if (dropboxResponse.ok) {
            const dropboxResult = await dropboxResponse.json();
            console.log('✅ Upload Dropbox réussi:', dropboxResult);
            onMediaSelected(dropboxResult.url, result.type);
          } else {
            // Si l'upload Dropbox échoue, on utilise l'URL locale
            onMediaSelected(result.url, result.type);
          }
        } catch (dropboxError) {
          console.warn('⚠️ Upload Dropbox échoué, utilisation URL locale:', dropboxError);
          onMediaSelected(result.url, result.type);
        }
      } else {
        onMediaSelected(result.url, result.type);
      }
      
      // Reset l'input
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ Erreur upload client:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload inconnue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`media-uploader ${className}`}>
      <div className="flex items-center gap-2">
        <label className={`
          inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg 
          bg-gray-700 hover:bg-gray-600 text-white cursor-pointer transition-colors
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Upload...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choisir depuis la galerie
            </>
          )}
        </label>
        
        <span className="text-sm text-gray-400">
          {acceptedTypes.includes('video') && acceptedTypes.includes('image') 
            ? 'Images (10MB) & Vidéos (150MB) - MP4, MOV, WebM'
            : acceptedTypes.includes('video')
            ? 'Vidéos (max 150MB) - MP4, MOV, WebM'
            : 'Images (max 10MB) - JPG, PNG, WebP'
          }
        </span>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500">
          {error}
        </div>
      )}
    </div>
  );
}