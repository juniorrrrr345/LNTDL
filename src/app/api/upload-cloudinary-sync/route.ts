import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { connectToDatabase } from '@/lib/mongodb';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwez3etsh',
  api_key: process.env.CLOUDINARY_API_KEY || '567536976535776',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'RRiC4Hdh5OszrTQMDHSRi3kxZZE'
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload Cloudinary synchronisé démarré...');

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
      
      // Vérifier la taille (max 100MB pour Cloudinary)
      if (buffer.length > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'La vidéo est trop grande (max 100MB)' },
          { status: 400 }
        );
      }
      
      console.log('📹 Vidéo prête pour upload:', {
        sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }

    // Convertir en base64 pour Cloudinary
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64Data}`;
    
    // Upload vers Cloudinary
    console.log('☁️ Upload vers Cloudinary...');
    
    const uploadOptions = {
      resource_type: type === 'video' ? 'video' : 'image',
      folder: type === 'video' ? 'videos' : 'images',
      public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      overwrite: true,
      invalidate: true,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'lntdl_media'
    };

    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    console.log('✅ Upload Cloudinary réussi:', cloudinaryResult);

    // Sauvegarder dans MongoDB pour synchronisation
    console.log('💾 Sauvegarde dans MongoDB...');
    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('cloudinary_media');
    
    const mediaDoc = {
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      originalName: file.name,
      type: type,
      size: buffer.length,
      format: cloudinaryResult.format,
      uploadedAt: new Date(),
      accessedCount: 0,
      lastAccessed: new Date()
    };
    
    const mongoResult = await mediaCollection.insertOne(mediaDoc);
    
    console.log('✅ Synchronisation MongoDB réussie:', {
      mediaId: mongoResult.insertedId,
      cloudinaryUrl: cloudinaryResult.secure_url
    });

    return NextResponse.json({
      success: true,
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      format: cloudinaryResult.format,
      resourceType: type,
      size: buffer.length,
      mediaId: mongoResult.insertedId.toString(),
      synced: true
    });

  } catch (error: any) {
    console.error('❌ Erreur upload Cloudinary synchronisé:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur upload inconnue' },
      { status: 500 }
    );
  }
}