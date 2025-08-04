'use client';

import { useState, useEffect } from 'react';
import contentCache from '@/lib/contentCache';

interface SocialLink {
  _id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface SocialPageProps {
  initialSocialLinks: SocialLink[];
  shopTitle: string;
}

export default function SocialPage({ initialSocialLinks, shopTitle }: SocialPageProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);

  useEffect(() => {
    // Charger depuis le cache si disponible
    const cachedLinks = contentCache.getSocialLinks();
    if (cachedLinks && cachedLinks.length > 0) {
      // Filtrer seulement les liens actifs
      const activeLinks = cachedLinks.filter((link: SocialLink) => link.isActive);
      setSocialLinks(activeLinks);
    }

    // Écouter les mises à jour du cache
    const handleCacheUpdate = () => {
      const updatedLinks = contentCache.getSocialLinks();
      if (updatedLinks) {
        // Filtrer seulement les liens actifs
        const activeLinks = updatedLinks.filter((link: SocialLink) => link.isActive);
        setSocialLinks(activeLinks);
      }
    };

    window.addEventListener('cacheUpdated', handleCacheUpdate);
    return () => window.removeEventListener('cacheUpdated', handleCacheUpdate);
  }, []);

  return (
    <main className="pt-4 pb-24 sm:pb-28 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">
      {/* Titre de la page avec style boutique */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="shop-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
          Nos Réseaux
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-base sm:text-lg max-w-xl mx-auto px-4 font-semibold bg-black/50 backdrop-blur-sm py-2 px-4 rounded-lg">
          Rejoignez <span className="text-yellow-400">{shopTitle}</span> sur nos réseaux sociaux
        </p>
      </div>

      {socialLinks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {socialLinks.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 bg-gray-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20"
            >
              {/* Effet de hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${link.color}, transparent)`
                }}
              />
              
              <div className="relative p-4 sm:p-6 text-center">
                {/* Icône */}
                <div className="text-2xl sm:text-3xl mb-2">{link.icon}</div>
                
                {/* Nom du réseau */}
                <h3 className="text-sm sm:text-base font-semibold text-white mb-2 truncate">
                  {link.name}
                </h3>
                
                {/* Petit indicateur de couleur */}
                <div 
                  className="w-8 h-1 mx-auto rounded-full"
                  style={{ backgroundColor: link.color }}
                />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">
            Aucun réseau social configuré pour le moment.
          </p>
        </div>
      )}
    </main>
  );
}