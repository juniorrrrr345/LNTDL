import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const contentLength = request.headers.get('content-length') || '0';
    
    console.log('📹 Test upload vidéo - Headers:', {
      contentType,
      contentLength,
      contentLengthMB: (parseInt(contentLength) / (1024 * 1024)).toFixed(2) + ' MB'
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'Aucun fichier reçu',
        headers: {
          contentType,
          contentLength
        }
      }, { status: 400 });
    }

    const fileInfo = {
      name: file.name,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type || 'non défini',
      extension: file.name.split('.').pop()?.toLowerCase() || 'inconnu'
    };

    console.log('📁 Fichier reçu:', fileInfo);

    // Vérifier si c'est une vidéo
    const videoExtensions = ['mov', 'mp4', 'avi', '3gp', 'webm', 'mkv', 'm4v'];
    const isVideo = videoExtensions.includes(fileInfo.extension) || 
                   file.type.startsWith('video/');

    return NextResponse.json({
      success: true,
      fileInfo,
      isVideo,
      message: 'Test réussi - Le fichier a été reçu correctement'
    });

  } catch (error: any) {
    console.error('❌ Erreur test upload:', error);
    return NextResponse.json({
      error: 'Erreur lors du test',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;