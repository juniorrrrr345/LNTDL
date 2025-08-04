import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🔍 API Pages GET - Slug:', params.slug);
    
    const { db } = await connectToDatabase();
    const pagesCollection = db.collection('pages');
    
    const page = await pagesCollection.findOne({ slug: params.slug });
    console.log('📄 Page trouvée:', page ? 'OUI' : 'NON');
    
    // Si la page n'existe pas, créer une page vide
    if (!page) {
      const defaultContent = params.slug === 'questions' 
        ? '# Questions fréquemment posées\n\n## Comment passer commande ?\n\nPour passer commande, cliquez sur le bouton "Commander" sur la page du produit qui vous intéresse. Vous serez redirigé vers notre service de commande.\n\n## Quels sont les délais de livraison ?\n\nLes délais de livraison varient selon votre localisation :\n- **Casablanca** : 24-48h\n- **Autres villes** : 48-72h\n\n## Quels sont les moyens de paiement acceptés ?\n\nNous acceptons :\n- Paiement à la livraison\n- Virement bancaire\n- Paiement mobile\n\n## Les produits sont-ils garantis ?\n\nOui, tous nos produits sont garantis. La durée de garantie varie selon le type de produit.\n\n## Comment puis-je suivre ma commande ?\n\nUne fois votre commande confirmée, vous recevrez un numéro de suivi par SMS ou email.\n\n## Politique de retour\n\nVous disposez de 7 jours après réception pour retourner un produit non conforme.\n\n## Contact\n\nPour toute autre question, n\'hésitez pas à nous contacter via la page Contact.'
        : '';
      
      const defaultPage = {
        slug: params.slug,
        title: params.slug === 'info' ? 'À propos' : 
               params.slug === 'contact' ? 'Contact' : 
               params.slug === 'questions' ? 'Questions fréquemment posées' : params.slug,
        content: defaultContent,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await pagesCollection.insertOne(defaultPage);
      console.log('✅ Page vide créée:', params.slug);
      
      return NextResponse.json({
        content: defaultPage.content,
        title: defaultPage.title
      });
    }
    
    return NextResponse.json({
      content: page.content || '',
      title: page.title || params.slug
    });
  } catch (error) {
    console.error('❌ Erreur API Pages GET:', error);
    return NextResponse.json({ 
      content: '', 
      title: params.slug,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('📝 API Pages POST - Slug:', params.slug);
    
    const { content, title } = await request.json();
    const { db } = await connectToDatabase();
    const pagesCollection = db.collection('pages');
    
    const result = await pagesCollection.replaceOne(
      { slug: params.slug },
      { 
        slug: params.slug, 
        title: title || params.slug, 
        content: content || '', 
        updatedAt: new Date() 
      },
      { upsert: true }
    );
    
    console.log('✅ Page sauvegardée:', {
      slug: params.slug,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur API Pages POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: any) {
  return POST(req, context);
}