import { NextRequest, NextResponse } from 'next/server';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

// Fonction pour convertir un lien Dropbox en lien direct
function convertDropboxLink(url: string): string {
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
function detectMediaType(url: string): 'image' | 'video' {
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
function validateDropboxLink(url: string): boolean {
  const dropboxPatterns = [
    /dropbox\.com/,
    /dl\.dropboxusercontent\.com/
  ];
  
  return dropboxPatterns.some(pattern => pattern.test(url));
}

// Fonction pour tester un lien
async function testLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// GET - Récupérer les informations d'un média
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }

    // Valider que c'est un lien Dropbox
    if (!validateDropboxLink(url)) {
      return NextResponse.json(
        { error: 'Le lien doit être un lien Dropbox valide' },
        { status: 400 }
      );
    }

    // Convertir le lien Dropbox
    const directLink = convertDropboxLink(url);
    
    // Détecter le type de média
    const mediaType = detectMediaType(directLink);
    
    // Tester le lien
    const isValid = await testLink(directLink);
    
    return NextResponse.json({
      success: true,
      originalUrl: url,
      directUrl: directLink,
      type: mediaType,
      isValid,
      hostname: new URL(directLink).hostname
    });

  } catch (error: any) {
    console.error('❌ Erreur API Dropbox Media:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du lien',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Traiter un média Dropbox
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }

    // Valider que c'est un lien Dropbox
    if (!validateDropboxLink(url)) {
      return NextResponse.json(
        { error: 'Le lien doit être un lien Dropbox valide' },
        { status: 400 }
      );
    }

    // Convertir le lien Dropbox
    const directLink = convertDropboxLink(url);
    
    // Détecter le type de média
    const mediaType = detectMediaType(directLink);
    
    // Tester le lien
    const isValid = await testLink(directLink);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Le lien Dropbox n\'est pas accessible' },
        { status: 400 }
      );
    }

    // Créer l'objet média
    const mediaItem: MediaItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: directLink,
      type: mediaType,
      title: title || `Média ${Date.now()}`,
      description: description || `Ajouté le ${new Date().toLocaleDateString('fr-FR')}`
    };

    return NextResponse.json({
      success: true,
      media: mediaItem,
      message: `Média ${mediaType === 'image' ? 'image' : 'vidéo'} ajouté avec succès`
    });

  } catch (error: any) {
    console.error('❌ Erreur API Dropbox Media:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du média',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un média
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    // Ici vous pourriez sauvegarder en base de données
    // Pour l'instant, on retourne juste une confirmation
    return NextResponse.json({
      success: true,
      message: 'Média mis à jour avec succès',
      id,
      updates
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour média:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un média
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    // Ici vous pourriez supprimer de la base de données
    // Pour l'instant, on retourne juste une confirmation
    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès',
      id
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression média:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';