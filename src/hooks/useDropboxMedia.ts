import { useState, useCallback } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

export function useDropboxMedia(initialMedia: MediaItem[] = []) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fonction pour convertir un lien Dropbox en lien direct
  const convertDropboxLink = useCallback((url: string): string => {
    let directLink = url.trim();
    
    // Méthode 1: Remplacer ?dl=0 par ?raw=1
    directLink = directLink.replace('?dl=0', '?raw=1');
    
    // Méthode 2: Si pas de changement, utiliser dl=1
    if (directLink === url.trim()) {
      directLink = url.trim().replace('?dl=0', '?dl=1');
    }
    
    // Méthode 3: Si pas de paramètre, ajouter ?raw=1
    if (!directLink.includes('?')) {
      directLink = directLink + '?raw=1';
    }
    
    // Méthode 4: Utiliser le format direct de Dropbox
    if (directLink.includes('www.dropbox.com')) {
      directLink = directLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      directLink = directLink.replace(/[?&]dl=[01]/, '');
      directLink = directLink.replace(/[?&]raw=[01]/, '');
    }
    
    return directLink;
  }, []);

  // Fonction pour détecter le type de média
  const detectMediaType = useCallback((url: string): 'image' | 'video' => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    
    const lowerUrl = url.toLowerCase();
    
    // Vérifier les extensions
    for (const ext of imageExtensions) {
      if (lowerUrl.includes(ext)) return 'image';
    }
    
    for (const ext of videoExtensions) {
      if (lowerUrl.includes(ext)) return 'video';
    }
    
    // Par défaut, considérer comme image
    return 'image';
  }, []);

  // Fonction pour valider un lien Dropbox
  const validateDropboxLink = useCallback((url: string): boolean => {
    const dropboxPatterns = [
      /dropbox\.com/,
      /dl\.dropboxusercontent\.com/
    ];
    
    return dropboxPatterns.some(pattern => pattern.test(url));
  }, []);

  // Fonction pour ajouter un média
  const addMedia = useCallback(async (url: string, title?: string, description?: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Valider que c'est un lien Dropbox
      if (!validateDropboxLink(url)) {
        throw new Error('Le lien doit être un lien Dropbox valide');
      }

      // Convertir le lien Dropbox
      const directLink = convertDropboxLink(url);
      
      // Détecter le type de média
      const mediaType = detectMediaType(directLink);
      
      // Créer un nouvel élément média
      const newMedia: MediaItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: directLink,
        type: mediaType,
        title: title || `Média ${media.length + 1}`,
        description: description || `Ajouté le ${new Date().toLocaleDateString('fr-FR')}`
      };

      // Ajouter à la liste
      setMedia(prev => [...prev, newMedia]);
      
      return newMedia;
      
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'ajout du média');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [media.length, convertDropboxLink, detectMediaType, validateDropboxLink]);

  // Fonction pour supprimer un média
  const removeMedia = useCallback((id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  }, []);

  // Fonction pour mettre à jour un média
  const updateMedia = useCallback((id: string, updates: Partial<MediaItem>) => {
    setMedia(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Fonction pour réorganiser les médias
  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    setMedia(prev => {
      const newMedia = [...prev];
      const [removed] = newMedia.splice(fromIndex, 1);
      newMedia.splice(toIndex, 0, removed);
      return newMedia;
    });
  }, []);

  // Fonction pour vider la galerie
  const clearMedia = useCallback(() => {
    setMedia([]);
  }, []);

  // Fonction pour importer des médias depuis un tableau
  const importMedia = useCallback((mediaArray: MediaItem[]) => {
    setMedia(prev => [...prev, ...mediaArray]);
  }, []);

  // Fonction pour exporter les médias
  const exportMedia = useCallback(() => {
    return media;
  }, [media]);

  // Fonction pour tester un lien
  const testLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Fonction pour corriger tous les liens existants
  const fixAllLinks = useCallback(() => {
    setMedia(prev => prev.map(item => ({
      ...item,
      url: convertDropboxLink(item.url)
    })));
  }, [convertDropboxLink]);

  return {
    media,
    isLoading,
    error,
    addMedia,
    removeMedia,
    updateMedia,
    reorderMedia,
    clearMedia,
    importMedia,
    exportMedia,
    testLink,
    fixAllLinks,
    convertDropboxLink,
    detectMediaType,
    validateDropboxLink
  };
}