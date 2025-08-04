import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Clé API ImgBB (à remplacer par votre clé)
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'your_imgbb_api_key_here';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload ImgBB démarré...');

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
      
    } else if (type === 'video') {
      console.log('🎥 Traitement de la vidéo...');
      
      // Vérifier la taille (max 32MB pour ImgBB)
      if (buffer.length > 32 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'La vidéo est trop grande (max 32MB)' },
          { status: 400 }
        );
      }
      
      console.log('📹 Vidéo prête pour upload:', {
        sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }

    // Convertir en base64 pour ImgBB
    const base64Data = buffer.toString('base64');
    
    // Upload vers ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', IMGBB_API_KEY);
    imgbbFormData.append('image', base64Data);
    imgbbFormData.append('name', file.name);

    console.log('☁️ Upload vers ImgBB...');
    
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });

    if (!imgbbResponse.ok) {
      const errorData = await imgbbResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erreur ImgBB: ${imgbbResponse.status}`);
    }

    const imgbbResult = await imgbbResponse.json();
    
    if (!imgbbResult.success) {
      throw new Error(imgbbResult.error?.message || 'Erreur upload ImgBB');
    }

    // URLs ImgBB
    const directUrl = imgbbResult.data.url; // URL directe
    const displayUrl = imgbbResult.data.display_url; // URL d'affichage
    const deleteUrl = imgbbResult.data.delete_url; // URL de suppression

    console.log('✅ Upload ImgBB réussi:', {
      directUrl,
      displayUrl,
      deleteUrl
    });

    return NextResponse.json({
      success: true,
      url: directUrl,
      displayUrl: displayUrl,
      deleteUrl: deleteUrl,
      publicId: imgbbResult.data.id,
      format: file.name.split('.').pop(),
      resourceType: type,
      size: buffer.length
    });

  } catch (error: any) {
    console.error('❌ Erreur upload ImgBB:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur upload inconnue' },
      { status: 500 }
    );
  }
}