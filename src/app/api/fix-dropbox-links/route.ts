import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Fonction pour convertir un lien Dropbox en lien direct
function convertToDirectLink(shareLink: string): string {
  // Méthode 1: Remplacer ?dl=0 par ?raw=1
  let directLink = shareLink.replace('?dl=0', '?raw=1');
  
  // Méthode 2: Si ça ne marche pas, utiliser dl=1
  if (directLink === shareLink) {
    directLink = shareLink.replace('?dl=0', '?dl=1');
  }
  
  // Méthode 3: Si pas de paramètre, ajouter ?raw=1
  if (!directLink.includes('?')) {
    directLink = directLink + '?raw=1';
  }
  
  // Méthode 4: Utiliser le format direct de Dropbox
  if (directLink.includes('www.dropbox.com')) {
    directLink = directLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    directLink = directLink.replace(/[?&]dl=[01]/, '');
    directLink = directLink.replace(/[?&]raw=[01]/, '');
  }
  
  return directLink;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Début de la correction des liens Dropbox...');
    
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    // Récupérer tous les produits
    const products = await productsCollection.find({}).toArray();
    console.log(`📦 ${products.length} produits trouvés`);
    
    let fixedCount = 0;
    const results = [];
    
    for (const product of products) {
      let hasChanges = false;
      const changes = [];
      
      // Corriger le lien de l'image
      if (product.image && product.image.includes('dropbox.com')) {
        const originalImage = product.image;
        const fixedImage = convertToDirectLink(product.image);
        
        if (originalImage !== fixedImage) {
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { image: fixedImage } }
          );
          hasChanges = true;
          changes.push(`Image: ${originalImage} → ${fixedImage}`);
        }
      }
      
      // Corriger le lien de la vidéo
      if (product.video && product.video.includes('dropbox.com')) {
        const originalVideo = product.video;
        const fixedVideo = convertToDirectLink(product.video);
        
        if (originalVideo !== fixedVideo) {
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { video: fixedVideo } }
          );
          hasChanges = true;
          changes.push(`Vidéo: ${originalVideo} → ${fixedVideo}`);
        }
      }
      
      if (hasChanges) {
        fixedCount++;
        results.push({
          productId: product._id,
          productName: product.name,
          changes: changes
        });
      }
    }
    
    console.log(`✅ Correction terminée: ${fixedCount} produits corrigés`);
    
    return NextResponse.json({
      success: true,
      message: `Correction terminée: ${fixedCount} produits corrigés`,
      fixedCount,
      totalProducts: products.length,
      results
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des liens Dropbox:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la correction des liens',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}