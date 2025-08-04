// Test de conversion Dropbox sans serveur
function convertDropboxLink(url) {
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

function detectMediaType(url) {
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

const testUrl = "https://www.dropbox.com/scl/fi/572oj349fw6yam2wi0g0l/Vid-o-04-08-2025-12-51-11.mov?rlkey=itutp0l5g7oscldw24p21siyn&st=s6ys9acq&dl=0";

console.log('🔗 Test de conversion Dropbox');
console.log('Original:', testUrl);
console.log('Converti:', convertDropboxLink(testUrl));
console.log('Type:', detectMediaType(convertDropboxLink(testUrl)));

// Test avec différents formats
const testUrls = [
  "https://www.dropbox.com/s/xxxxx/image.jpg?dl=0",
  "https://www.dropbox.com/s/xxxxx/video.mp4?dl=0",
  "https://www.dropbox.com/s/xxxxx/document.pdf?raw=1",
  testUrl
];

console.log('\n📋 Tests avec différents formats :');
testUrls.forEach((url, index) => {
  const converted = convertDropboxLink(url);
  const type = detectMediaType(converted);
  console.log(`${index + 1}. ${type.toUpperCase()}: ${converted}`);
});