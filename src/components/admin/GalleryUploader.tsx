'use client';
import { useState } from 'react';

interface GalleryUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
  buttonText?: string;
}

export default function GalleryUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.mp4,.avi,.3gp,.webm,.mkv",
  maxSize = 50,
  className = "",
  buttonText = "📱 Sélectionner depuis la galerie"
}: GalleryUploaderProps) {
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

      // Upload local d'abord
      setProgress('Upload local...');
      const formData = new FormData();
      formData.append('file', file);
      
      const localResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!localResponse.ok) {
        const errorData = await localResponse.json();
        throw new Error(errorData.error || `Erreur upload local ${localResponse.status}`);
      }

      const localResult = await localResponse.json();
      console.log('✅ Upload local réussi:', localResult);
      
      // Maintenant essayer l'upload vers Dropbox
      setProgress('Upload vers Dropbox...');
      try {
        const dropboxResponse = await fetch('/api/upload-dropbox', {
          method: 'POST',
          body: formData,
        });

        if (dropboxResponse.ok) {
          const dropboxResult = await dropboxResponse.json();
          console.log('✅ Upload Dropbox réussi:', dropboxResult);
          setProgress('Conversion en lien direct...');
          onMediaSelected(dropboxResult.url, dropboxResult.resourceType);
        } else {
          // Si Dropbox échoue, utiliser l'upload local
          console.warn('⚠️ Upload Dropbox échoué, utilisation upload local');
          setProgress('Utilisation upload local...');
          onMediaSelected(localResult.url, localResult.type);
        }
      } catch (dropboxError) {
        console.warn('⚠️ Erreur Dropbox, utilisation upload local:', dropboxError);
        setProgress('Utilisation upload local...');
        onMediaSelected(localResult.url, localResult.type);
      }
      
      // Reset l'input
      event.target.value = '';
      setProgress('✅ Terminé !');
      
    } catch (error) {
      console.error('❌ Erreur upload galerie:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload inconnue');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(''), 2000);
    }
  };

  return (
    <div className={`gallery-uploader ${className}`}>
      <div className="flex items-center gap-2">
        <label className={`
          inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg 
          bg-blue-700 hover:bg-blue-600 text-white cursor-pointer transition-colors
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
        <div className="mt-2 text-xs text-blue-400">
          {progress}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
          ❌ {error}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        📱 Sélectionnez depuis votre galerie téléphone → Upload local + Dropbox (si disponible) → Lien direct généré
      </div>
    </div>
  );
}