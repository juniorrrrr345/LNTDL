'use client';
import { useState, useEffect } from 'react';

interface SharedMedia {
  _id: string;
  url: string;
  type: 'image' | 'video';
  fileName: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  accessedCount: number;
  lastAccessed: string;
}

interface SharedMediaCacheProps {
  onMediaSelected?: (url: string, type: 'image' | 'video') => void;
  type?: 'image' | 'video';
  limit?: number;
}

export default function SharedMediaCache({ 
  onMediaSelected, 
  type, 
  limit = 20 
}: SharedMediaCacheProps) {
  const [media, setMedia] = useState<SharedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSharedMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/shared-media?${params}`);
      if (!response.ok) {
        throw new Error('Erreur chargement cache partagé');
      }

      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('❌ Erreur chargement cache partagé:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = async (mediaItem: SharedMedia) => {
    if (onMediaSelected) {
      onMediaSelected(mediaItem.url, mediaItem.type);
      
      // Mettre à jour les statistiques d'accès
      try {
        await fetch('/api/shared-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mediaItem.url, type: mediaItem.type })
        });
      } catch (error) {
        console.warn('⚠️ Erreur mise à jour statistiques:', error);
      }
    }
  };

  useEffect(() => {
    loadSharedMedia();
  }, [type, limit]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
          <span className="ml-2 text-green-400">Chargement du cache partagé...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
        <div className="text-red-400">❌ {error}</div>
        <button 
          onClick={loadSharedMedia}
          className="mt-2 text-sm text-red-300 hover:text-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-gray-400 text-center">
          Aucun média dans le cache partagé
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          Cache partagé ({media.length} médias)
        </h3>
        <button 
          onClick={loadSharedMedia}
          className="text-sm text-green-400 hover:text-green-300"
        >
          🔄 Actualiser
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map((item) => (
          <div 
            key={item._id}
            className={`
              relative cursor-pointer rounded-lg overflow-hidden border-2 border-transparent
              hover:border-green-400 transition-all duration-200
              ${onMediaSelected ? 'hover:scale-105' : ''}
            `}
            onClick={() => handleMediaClick(item)}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.originalName}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <video 
                src={item.url}
                className="w-full h-24 object-cover"
                muted
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
              <div className="truncate">{item.originalName}</div>
              <div className="text-gray-300">
                {Math.round(item.size / 1024 / 1024)}MB • {item.accessedCount} accès
              </div>
            </div>
            
            {onMediaSelected && (
              <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                📱
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}