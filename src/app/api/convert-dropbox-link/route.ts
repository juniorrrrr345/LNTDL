import { NextRequest, NextResponse } from 'next/server';
import { analyzeDropboxLink, convertDropboxLink, validateDropboxLink } from '@/lib/dropbox-converter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }

    // Analyser le lien Dropbox
    const analysis = analyzeDropboxLink(url);
    
    return NextResponse.json({
      success: true,
      ...analysis,
      message: `Lien ${analysis.type === 'image' ? 'image' : 'vidéo'} analysé avec succès`
    });

  } catch (error: any) {
    console.error('❌ Erreur conversion lien Dropbox:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la conversion du lien',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

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

    // Analyser le lien Dropbox
    const analysis = analyzeDropboxLink(url);
    
    return NextResponse.json({
      success: true,
      ...analysis
    });

  } catch (error: any) {
    console.error('❌ Erreur analyse lien Dropbox:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'analyse du lien',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';