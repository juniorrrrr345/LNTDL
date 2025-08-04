import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de média invalide' },
        { status: 400 }
      );
    }

    console.log('🔍 Récupération média:', id);

    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('media');
    
    const media = await mediaCollection.findOne({ _id: new ObjectId(id) });
    
    if (!media) {
      return NextResponse.json(
        { error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour les statistiques d'accès
    await mediaCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { accessedCount: 1 },
        $set: { lastAccessed: new Date() }
      }
    );

    // Convertir les données base64 en buffer
    const buffer = Buffer.from(media.data, 'base64');
    
    // Déterminer le type MIME
    let contentType = 'application/octet-stream';
    if (media.type === 'image') {
      contentType = 'image/jpeg';
    } else if (media.type === 'video') {
      const extension = media.fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'mp4':
          contentType = 'video/mp4';
          break;
        case 'mov':
          contentType = 'video/quicktime';
          break;
        case 'avi':
          contentType = 'video/x-msvideo';
          break;
        case 'webm':
          contentType = 'video/webm';
          break;
        default:
          contentType = 'video/mp4';
      }
    }

    console.log('✅ Média servi:', {
      id,
      type: media.type,
      size: buffer.length,
      contentType
    });

    // Retourner le média avec les bons headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache 1 an
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération média:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur récupération inconnue' },
      { status: 500 }
    );
  }
}