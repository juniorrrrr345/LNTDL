'use client';
import { useState } from 'react';

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Créer une preview pour les images
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
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
          capture={type === 'video' ? 'environment' : undefined}
        />
        
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-32 mb-4 rounded" />
        ) : (
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
        
        <span className="text-gray-300">
          {uploading ? progress : `Cliquez pour uploader ${type === 'video' ? 'une vidéo' : 'une image'}`}
        </span>
        
        <span className="text-xs text-gray-500 mt-2">
          ☁️ Upload Dropbox
        </span>
      </label>
    </div>
  );
}