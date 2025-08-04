import { NextRequest, NextResponse } from 'next/server';
import { uploadToDropbox } from '@/lib/dropbox';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload Dropbox démarré...');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    console.log('📁 Fichier reçu:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Générer un nom unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    let fileName = `${timestamp}-${randomString}`;

    // Traitement selon le type
    if (type === 'image' && file.type.startsWith('image/')) {
      console.log('🖼️ Traitement de l\'image...');
      
      // Optimiser l'image avec Sharp
      buffer = await sharp(buffer)
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      
      fileName += '.jpg';
    } else if (type === 'video') {
      console.log('🎥 Traitement de la vidéo...');
      
      // Accepter différents types MIME pour les vidéos mobiles
      const videoTypes = ['video/', 'application/octet-stream', '.mov', '.mp4', '.avi', '.webm'];
      const isVideo = videoTypes.some(vType => 
        file.type.includes(vType) || file.name.toLowerCase().includes(vType)
      );
      
      if (!isVideo) {
        console.warn('⚠️ Type de fichier non reconnu comme vidéo:', file.type);
      }
      
      // Pour les vidéos, on garde le format original
      const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      fileName += `.${extension}`;
      
      // Vérifier la taille (max 150MB pour Dropbox)
      if (buffer.length > 150 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'La vidéo est trop grande (max 150MB)' },
          { status: 400 }
        );
      }
      
      console.log('📹 Vidéo prête pour upload:', {
        extension,
        sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'
      });
    } else {
      // Autres fichiers
      const extension = file.name.split('.').pop() || 'bin';
      fileName += `.${extension}`;
    }

    // Upload vers Dropbox
    console.log('☁️ Upload vers Dropbox...');
    const url = await uploadToDropbox(buffer, fileName, `/${type}s`);
    
    console.log('✅ Upload réussi:', url);

    return NextResponse.json({
      success: true,
      url: url,
      publicId: fileName,
      format: fileName.split('.').pop(),
      resourceType: type
    });

  } catch (error: any) {
    console.error('❌ Erreur upload Dropbox:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 secondes pour les vidéos

// Configuration pour augmenter la limite de taille
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '200mb',
    },
  },
};