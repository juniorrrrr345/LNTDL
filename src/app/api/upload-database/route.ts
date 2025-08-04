import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload base de données démarré...');

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
      
      // Pour les vidéos, on garde le format original
      const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      fileName += `.${extension}`;
      
      // Vérifier la taille (max 150MB)
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

    // Convertir en base64 pour stockage dans MongoDB
    const base64Data = buffer.toString('base64');
    
    // Sauvegarder dans MongoDB
    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('media');
    
    const mediaDoc = {
      fileName: fileName,
      originalName: file.name,
      type: type,
      data: base64Data,
      size: buffer.length,
      uploadedAt: new Date(),
      accessedCount: 0,
      lastAccessed: new Date()
    };
    
    const result = await mediaCollection.insertOne(mediaDoc);
    
    // Créer l'URL pour accéder au média
    const mediaUrl = `/api/media/${result.insertedId}`;
    
    console.log('✅ Upload base de données réussi:', {
      mediaId: result.insertedId,
      mediaUrl,
      size: buffer.length
    });

    return NextResponse.json({
      success: true,
      url: mediaUrl,
      publicId: fileName,
      format: fileName.split('.').pop(),
      resourceType: type,
      mediaId: result.insertedId.toString()
    });

  } catch (error: any) {
    console.error('❌ Erreur upload base de données:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur upload inconnue' },
      { status: 500 }
    );
  }
}