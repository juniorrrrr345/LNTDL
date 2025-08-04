'use client';
import { useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

interface MediaDisplayProps {
  media: MediaItem[];
  className?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
  showControls?: boolean;
  autoPlay?: boolean;
}

export default function MediaDisplay({ 
  media, 
  className = '', 
  layout = 'grid',
  showControls = true,
  autoPlay = false
}: MediaDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!media || media.length === 0) {
    return (
      <div className={`media-display-empty ${className}`}>
        <div className="bg-gray-800 border border-white/10 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📸</div>
          <h3 className="text-white font-semibold mb-2">Aucun média disponible</h3>
          <p className="text-gray-400">Ajoutez des images ou vidéos depuis votre galerie Dropbox</p>
        </div>
      </div>
    );
  }

  // Layout Grid (par défaut)
  if (layout === 'grid') {
    return (
      <div className={`media-display-grid ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title || 'Image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls={showControls}
                    autoPlay={autoPlay}
                    muted
                    loop
                    loading="lazy"
                  />
                )}
                
                {/* Overlay au survol */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-sm px-3 py-1 bg-black bg-opacity-50 rounded-full">
                      {item.type === 'image' ? '🖼️' : '🎥'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Titre et description */}
              {(item.title || item.description) && (
                <div className="mt-2">
                  {item.title && (
                    <h4 className="text-white font-medium text-sm truncate">
                      {item.title}
                    </h4>
                  )}
                  {item.description && (
                    <p className="text-gray-400 text-xs truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Layout Carousel
  if (layout === 'carousel') {
    return (
      <div className={`media-display-carousel ${className}`}>
        <div className="relative">
          {/* Média principal */}
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {media[currentIndex] && (
              media[currentIndex].type === 'image' ? (
                <img
                  src={media[currentIndex].url}
                  alt={media[currentIndex].title || 'Image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={media[currentIndex].url}
                  className="w-full h-full object-cover"
                  controls={showControls}
                  autoPlay={autoPlay}
                  muted
                />
              )
            )}
          </div>

          {/* Contrôles de navigation */}
          {media.length > 1 && (
            <>
              {/* Bouton précédent */}
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
              >
                ‹
              </button>

              {/* Bouton suivant */}
              <button
                onClick={() => setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
              >
                ›
              </button>

              {/* Indicateurs */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Informations du média */}
          {media[currentIndex] && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                  {media[currentIndex].type === 'image' ? 'Image' : 'Vidéo'}
                </span>
                <span className="text-white text-sm">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
              {media[currentIndex].title && (
                <h3 className="text-white font-semibold text-sm">
                  {media[currentIndex].title}
                </h3>
              )}
              {media[currentIndex].description && (
                <p className="text-gray-300 text-xs">
                  {media[currentIndex].description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Miniatures */}
        {media.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 aspect-square w-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500' 
                    : 'border-transparent hover:border-white/30'
                }`}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title || 'Miniature'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-lg">🎥</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Layout Masonry
  if (layout === 'masonry') {
    return (
      <div className={`media-display-masonry ${className}`}>
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="break-inside-avoid mb-4 group">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title || 'Image'}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-auto object-cover"
                    controls={showControls}
                    autoPlay={autoPlay}
                    muted
                    loop
                    loading="lazy"
                  />
                )}
                
                {/* Informations */}
                {(item.title || item.description) && (
                  <div className="p-3">
                    {item.title && (
                      <h4 className="text-white font-medium text-sm mb-1">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-gray-400 text-xs">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}