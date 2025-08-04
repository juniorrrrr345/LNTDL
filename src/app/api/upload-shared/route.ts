import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload partagé démarré...');

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

    // Créer le dossier de stockage
    const uploadDir = join(process.cwd(), 'public', 'uploads', type + 's');
    await mkdir(uploadDir, { recursive: true });

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

    // Sauvegarder le fichier
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Créer l'URL publique
    const publicUrl = `/uploads/${type}s/${fileName}`;
    
    // Sauvegarder dans MongoDB pour le cache partagé
    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('shared_media');
    
    const mediaDoc = {
      url: publicUrl,
      type: type,
      fileName: fileName,
      originalName: file.name,
      size: buffer.length,
      uploadedAt: new Date(),
      accessedCount: 0,
      lastAccessed: new Date()
    };
    
    await mediaCollection.insertOne(mediaDoc);
    
    console.log('✅ Upload partagé réussi:', {
      filePath,
      publicUrl,
      size: buffer.length,
      mongoId: mediaDoc._id
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicId: fileName,
      format: fileName.split('.').pop(),
      resourceType: type,
      shared: true
    });

  } catch (error: any) {
    console.error('❌ Erreur upload partagé:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur upload inconnue' },
      { status: 500 }
    );
  }
}