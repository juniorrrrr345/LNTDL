'use client';
import { useState, useEffect } from 'react';

interface DropboxUploaderProps {
  onUploadSuccess: (url: string) => void;
  type?: 'image' | 'video';
  accept?: string;
  className?: string;
}

export default function DropboxUploader({
  onUploadSuccess,
  type = 'image',
  accept = 'image/*',
  className = ''
}: DropboxUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Nettoyer l'URL de la vidéo au démontage
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Créer une preview pour les images et vidéos
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (type === 'video') {
      // Pour les vidéos, créer une URL temporaire
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);
    }

    setUploading(true);
    setProgress('Préparation du fichier...');

    try {
      console.log('🚀 Début upload Dropbox:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      setProgress('Upload vers Dropbox...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload-dropbox', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur upload');
      }

      console.log('✅ Upload Dropbox réussi:', result);
      setProgress('Upload terminé !');
      
      // Appeler le callback avec l'URL
      onUploadSuccess(result.url);
      
      // Reset après succès
      setTimeout(() => {
        // Nettoyer l'URL de la vidéo si nécessaire
        if (type === 'video' && preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setProgress('');
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur upload Dropbox:', error);
      setProgress(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`dropbox-uploader ${className}`}>
      <label className={`
        flex flex-col items-center justify-center
        border-2 border-dashed border-gray-600 rounded-lg
        p-6 cursor-pointer hover:border-blue-500 transition-colors
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        {preview ? (
          type === 'video' ? (
            <video 
              src={preview} 
              className="max-h-32 mb-4 rounded"
              controls
              muted
              playsInline
            />
          ) : (
            <img src={preview} alt="Preview" className="max-h-32 mb-4 rounded" />
          )
        ) : (
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        
        <span className="text-gray-300">
          {uploading ? progress : `Cliquez pour choisir ${type === 'video' ? 'une vidéo' : 'une image'} depuis votre galerie`}
        </span>
        
        <span className="text-xs text-gray-500 mt-2">
          ☁️ Upload Dropbox
        </span>
      </label>
    </div>
  );
}