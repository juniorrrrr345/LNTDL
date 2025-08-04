// Bibliothèque de conversion des liens Dropbox
// Fonctionne sans API Dropbox - conversion côté client

export interface DropboxLinkInfo {
  originalUrl: string;
  directUrl: string;
  type: 'image' | 'video';
  isValid: boolean;
  hostname: string;
}

// Fonction pour convertir un lien Dropbox en lien direct
export function convertDropboxLink(url: string): string {
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
}

// Fonction pour détecter le type de média
export function detectMediaType(url: string): 'image' | 'video' {
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
}

// Fonction pour valider un lien Dropbox
export function validateDropboxLink(url: string): boolean {
  const dropboxPatterns = [
    /dropbox\.com/,
    /dl\.dropboxusercontent\.com/
  ];
  
  return dropboxPatterns.some(pattern => pattern.test(url));
}

// Fonction pour analyser un lien Dropbox
export function analyzeDropboxLink(url: string): DropboxLinkInfo {
  const isValidDropbox = validateDropboxLink(url);
  const directUrl = convertDropboxLink(url);
  const type = detectMediaType(directUrl);
  
  return {
    originalUrl: url,
    directUrl: directUrl,
    type: type,
    isValid: isValidDropbox,
    hostname: new URL(directUrl).hostname
  };
}

// Fonction pour tester un lien (côté client)
export async function testLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Fonction pour corriger tous les liens dans un objet
export function fixAllLinksInObject(obj: any): any {
  if (typeof obj === 'string' && validateDropboxLink(obj)) {
    return convertDropboxLink(obj);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const fixed = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      fixed[key] = fixAllLinksInObject(obj[key]);
    }
    return fixed;
  }
  
  return obj;
}

// Fonction pour obtenir des exemples de liens corrigés
export function getLinkExamples() {
  return {
    image: {
      original: 'https://www.dropbox.com/s/xxxxx/image.jpg?dl=0',
      corrected: 'https://dl.dropboxusercontent.com/s/xxxxx/image.jpg'
    },
    video: {
      original: 'https://www.dropbox.com/s/xxxxx/video.mp4?dl=0',
      corrected: 'https://dl.dropboxusercontent.com/s/xxxxx/video.mp4'
    }
  };
}