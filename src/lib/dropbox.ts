import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';

// Configuration Dropbox
const config = {
  accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
  refreshToken: process.env.DROPBOX_REFRESH_TOKEN || '',
  clientId: process.env.DROPBOX_APP_KEY || '',
  clientSecret: process.env.DROPBOX_APP_SECRET || '',
};

console.log('🔧 Configuration Dropbox chargée:', {
  accessToken: config.accessToken ? 'OK' : 'MANQUANT',
  refreshToken: config.refreshToken ? 'OK' : 'MANQUANT',
  clientId: config.clientId ? `${config.clientId.substring(0, 6)}...` : 'MANQUANT',
  clientSecret: config.clientSecret ? 'OK' : 'MANQUANT'
});

// Initialiser le client Dropbox avec refresh token
const dbx = new Dropbox({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  refreshToken: config.refreshToken,
  accessToken: config.accessToken,
  fetch: fetch
});

// Fonction pour convertir un lien Dropbox en lien direct
function convertToDirectLink(shareLink: string): string {
  // Méthode 1: Remplacer ?dl=0 par ?raw=1
  let directLink = shareLink.replace('?dl=0', '?raw=1');
  
  // Méthode 2: Si ça ne marche pas, utiliser dl=1
  if (directLink === shareLink) {
    directLink = shareLink.replace('?dl=0', '?dl=1');
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

// Fonction pour uploader un fichier
export async function uploadToDropbox(file: Buffer, fileName: string, folder: string = '/media'): Promise<string> {
  try {
    const path = `${folder}/${fileName}`;
    
    // Upload du fichier
    const response = await dbx.filesUpload({
      path: path,
      contents: file,
      mode: { '.tag': 'overwrite' },
      autorename: true,
      mute: false
    });

    // Créer un lien de partage
    const shareLink = await dbx.sharingCreateSharedLinkWithSettings({
      path: response.result.path_display!,
      settings: {
        requested_visibility: { '.tag': 'public' },
        audience: { '.tag': 'public' },
        access: { '.tag': 'viewer' }
      }
    });

    // Convertir le lien Dropbox en lien direct
    const directLink = convertToDirectLink(shareLink.result.url);
    
    console.log('🔗 Lien Dropbox généré:', {
      original: shareLink.result.url,
      direct: directLink
    });
    
    return directLink;
  } catch (error: any) {
    // Si le lien existe déjà, le récupérer
    if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
      const links = await dbx.sharingListSharedLinks({
        path: `${folder}/${fileName}`,
        direct_only: true
      });
      
      if (links.result.links.length > 0) {
        const directLink = convertToDirectLink(links.result.links[0].url);
        console.log('🔗 Lien Dropbox existant récupéré:', directLink);
        return directLink;
      }
    }
    
    console.error('Erreur upload Dropbox:', error);
    throw error;
  }
}

// Fonction pour supprimer un fichier
export async function deleteFromDropbox(path: string): Promise<void> {
  try {
    await dbx.filesDeleteV2({ path });
  } catch (error) {
    console.error('Erreur suppression Dropbox:', error);
    throw error;
  }
}

// Fonction pour lister les fichiers
export async function listDropboxFiles(folder: string = '/media'): Promise<any[]> {
  try {
    const response = await dbx.filesListFolder({ path: folder });
    return response.result.entries;
  } catch (error) {
    console.error('Erreur listing Dropbox:', error);
    throw error;
  }
}

// Fonction pour tester la connexion Dropbox
export async function testDropboxConnection(): Promise<boolean> {
  try {
    await dbx.usersGetCurrentAccount();
    console.log('✅ Connexion Dropbox OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Dropbox:', error);
    return false;
  }
}

export default dbx;