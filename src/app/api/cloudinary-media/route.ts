import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' ou 'video'
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('🔍 Récupération cache Cloudinary synchronisé:', { type, limit });

    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('cloudinary_media');
    
    // Construire la requête
    let query: any = {};
    if (type) {
      query.type = type;
    }
    
    // Récupérer les médias les plus récents
    const media = await mediaCollection
      .find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .toArray();
    
    console.log(`✅ ${media.length} médias Cloudinary synchronisés récupérés`);
    
    return NextResponse.json({
      success: true,
      media: media,
      count: media.length
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération cache Cloudinary:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur récupération inconnue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json();
    
    console.log('📊 Mise à jour statistiques d\'accès Cloudinary:', { url, type });

    const { db } = await connectToDatabase();
    const mediaCollection = db.collection('cloudinary_media');
    
    // Mettre à jour les statistiques d'accès
    await mediaCollection.updateOne(
      { cloudinaryUrl: url },
      { 
        $inc: { accessedCount: 1 },
        $set: { lastAccessed: new Date() }
      }
    );
    
    console.log('✅ Statistiques d\'accès Cloudinary mises à jour');
    
    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour statistiques Cloudinary:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur mise à jour inconnue' },
      { status: 500 }
    );
  }
}