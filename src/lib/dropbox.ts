import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';

// Configuration Dropbox
const config = {
  accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
  clientId: process.env.DROPBOX_APP_KEY || '',
  clientSecret: process.env.DROPBOX_APP_SECRET || '',
};

console.log('🔧 Configuration Dropbox chargée:', {
  accessToken: config.accessToken ? 'OK' : 'MANQUANT',
  clientId: config.clientId ? `${config.clientId.substring(0, 6)}...` : 'MANQUANT',
  clientSecret: config.clientSecret ? 'OK' : 'MANQUANT'
});

// Initialiser le client Dropbox
const dbx = new Dropbox({
  accessToken: config.accessToken,
  fetch: fetch
});

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
    // Remplacer ?dl=0 par ?raw=1 pour un accès direct
    const directLink = shareLink.result.url.replace('?dl=0', '?raw=1');
    
    return directLink;
  } catch (error: any) {
    // Si le lien existe déjà, le récupérer
    if (error?.error?.error?.['.tag'] === 'shared_link_already_exists') {
      const links = await dbx.sharingListSharedLinks({
        path: `${folder}/${fileName}`,
        direct_only: true
      });
      
      if (links.result.links.length > 0) {
        return links.result.links[0].url.replace('?dl=0', '?raw=1');
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

export default dbx;