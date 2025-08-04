'use client';
import { useState } from 'react';

interface ImgBBGalleryUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
  buttonText?: string;
}

export default function ImgBBGalleryUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.mp4,.avi,.3gp,.webm,.mkv",
  maxSize = 32, // ImgBB limite à 32MB
  className = "",
  buttonText = "📱 Sélectionner depuis la galerie"
}: ImgBBGalleryUploaderProps) {
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
      
      // Upload vers ImgBB
      setProgress(`Upload ${isVideo ? 'vidéo' : 'image'} vers ImgBB...`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isVideo ? 'video' : 'image');

      const response = await fetch('/api/upload-imgbb', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur upload: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Upload ${isVideo ? 'vidéo' : 'image'} ImgBB réussi:`, result);
      
      setProgress('Préparation de l\'aperçu...');
      
      // Utiliser l'URL directe d'ImgBB
      onMediaSelected(result.url, result.resourceType);
      
      // Reset l'input
      event.target.value = '';
      setProgress('✅ Terminé !');
      
    } catch (error) {
      console.error('❌ Erreur upload ImgBB:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload inconnue');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(''), 2000);
    }
  };

  return (
    <div className={`imgbb-gallery-uploader ${className}`}>
      <div className="flex items-center gap-2">
        <label className={`
          inline-flex items-center px-4 py-2 border border-yellow-600 rounded-lg 
          bg-yellow-700 hover:bg-yellow-600 text-white cursor-pointer transition-colors
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
        <div className="mt-2 text-xs text-yellow-400">
          {progress}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
          ❌ {error}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        📱 Upload vers ImgBB (gratuit)
        <br />
        <span className="text-yellow-400">💡 URLs directes accessibles partout</span>
      </div>
    </div>
  );
}