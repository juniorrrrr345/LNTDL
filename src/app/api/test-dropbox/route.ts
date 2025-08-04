import { NextRequest, NextResponse } from 'next/server';
import { testDropboxConnection, uploadToDropbox } from '@/lib/dropbox';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de connexion Dropbox...');
    
    // Test de la connexion
    const isConnected = await testDropboxConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Connexion Dropbox échouée',
        message: 'Vérifiez vos tokens Dropbox dans les variables d\'environnement'
      }, { status: 500 });
    }
    
    // Test avec un petit fichier de test
    const testBuffer = Buffer.from('Test Dropbox');
    const testFileName = `test-${Date.now()}.txt`;
    
    try {
      const testUrl = await uploadToDropbox(testBuffer, testFileName, '/test');
      
      return NextResponse.json({
        success: true,
        message: 'Connexion Dropbox OK',
        testUrl: testUrl,
        config: {
          hasAccessToken: !!process.env.DROPBOX_ACCESS_TOKEN,
          hasAppKey: !!process.env.DROPBOX_APP_KEY,
          hasAppSecret: !!process.env.DROPBOX_APP_SECRET,
          hasRefreshToken: !!process.env.DROPBOX_REFRESH_TOKEN
        }
      });
    } catch (uploadError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du test d\'upload',
        details: uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur test Dropbox:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test Dropbox',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}