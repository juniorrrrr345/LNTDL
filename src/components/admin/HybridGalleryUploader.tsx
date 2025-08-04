'use client';
import { useState } from 'react';

interface HybridGalleryUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
  buttonText?: string;
}

export default function HybridGalleryUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.mp4,.avi,.3gp,.webm,.mkv",
  maxSize = 50,
  className = "",
  buttonText = "📱 Sélectionner depuis la galerie"
}: HybridGalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB. Maximum ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    setError('');
    setProgress('Sélection depuis la galerie...');

    try {
      console.log('📱 Fichier sélectionné depuis la galerie:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Détecter le type
      const isVideo = file.type.startsWith('video/') || 
                     ['.mov', '.mp4', '.avi', '.3gp', '.webm', '.mkv'].some(ext => 
                       file.name.toLowerCase().endsWith(ext)
                     );
      
      // Upload vers Dropbox pour tous les médias (images et vidéos)
      setProgress(`Upload ${isVideo ? 'vidéo' : 'image'} vers Dropbox...`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isVideo ? 'video' : 'image');

      try {
        const response = await fetch('/api/upload-dropbox', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Upload ${isVideo ? 'vidéo' : 'image'} Dropbox réussi:`, result);
          setProgress('Préparation de l\'aperçu...');
          onMediaSelected(result.url, result.resourceType);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur upload: ${response.status}`);
        }
      } catch (uploadError) {
        console.error('❌ Erreur upload Dropbox:', uploadError);
        setError(`Erreur upload ${isVideo ? 'vidéo' : 'image'} vers Dropbox. Réessayez.`);
        return;
      }
      
      // Reset l'input
      event.target.value = '';
      setProgress('✅ Terminé !');
      
    } catch (error) {
      console.error('❌ Erreur traitement fichier:', error);
      setError(error instanceof Error ? error.message : 'Erreur traitement inconnue');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(''), 2000);
    }
  };

  return (
    <div className={`hybrid-gallery-uploader ${className}`}>
      <div className="flex items-center gap-2">
        <label className={`
          inline-flex items-center px-4 py-2 border border-orange-600 rounded-lg 
          bg-orange-700 hover:bg-orange-600 text-white cursor-pointer transition-colors
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
              <span className="text-sm">Upload...</span>
            </>
          ) : (
            <>
              <span className="text-lg mr-2">📱</span>
              <span className="text-sm">{buttonText}</span>
            </>
          )}
        </label>
      </div>

      {progress && (
        <div className="mt-2 text-xs text-orange-400">
          {progress}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
          ❌ {error}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        📱 Upload vers Dropbox pour tous les médias
        <br />
        <span className="text-orange-400">💡 Compatible avec la boutique et les vidéos</span>
      </div>
    </div>
  );
}