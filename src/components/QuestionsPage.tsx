'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import contentCache from '@/lib/contentCache';

interface QuestionsPageProps {
  title: string;
  content: string;
}

export default function QuestionsPage({ title: initialTitle, content: initialContent }: QuestionsPageProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    // Charger depuis le cache si disponible
    const cachedPage = contentCache.getPage('questions');
    if (cachedPage) {
      setTitle(cachedPage.title);
      setContent(cachedPage.content);
    }

    // Écouter les mises à jour du cache
    const handleCacheUpdate = () => {
      const updatedPage = contentCache.getPage('questions');
      if (updatedPage) {
        setTitle(updatedPage.title);
        setContent(updatedPage.content);
      }
    };

    window.addEventListener('cacheUpdated', handleCacheUpdate);
    return () => window.removeEventListener('cacheUpdated', handleCacheUpdate);
  }, []);

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <div className="min-h-screen">
          {/* Header avec navigation */}
          <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span>Retour</span>
                </Link>
                
                <h1 className="text-xl font-bold text-white">Questions</h1>
                
                <div className="w-20"></div>
              </div>
            </div>
          </div>

          {/* Contenu principal avec padding pour éviter que le footer cache le texte */}
          <div className="container mx-auto px-4 py-8 pb-24 sm:pb-20">
            <div className="max-w-4xl mx-auto">
              {/* Icône et titre */}
              <div className="text-center mb-8">
                <QuestionMarkCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
              </div>

              {/* Contenu */}
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-800">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                />
              </div>
            </div>
          </div>

          {/* Footer navigation fixe */}
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gray-800 z-30">
            <div className="container mx-auto px-4">
              <div className="flex justify-around py-3">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                  <span className="text-xs">Accueil</span>
                </Link>
                <Link href="/info" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                  <span className="text-xs">Info</span>
                </Link>
                <Link href="/contact" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                  <span className="text-xs">Contact</span>
                </Link>
                <Link href="/questions" className="flex flex-col items-center gap-1 text-white">
                  <QuestionMarkCircleIcon className="w-6 h-6" />
                  <span className="text-xs">Questions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}