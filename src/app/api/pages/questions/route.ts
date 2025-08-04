import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Page from '@/models/Page';

export async function GET() {
  try {
    await connectToDatabase();
    
    let page = await Page.findOne({ slug: 'questions' });
    
    if (!page) {
      // Créer la page par défaut si elle n'existe pas
      page = await Page.create({
        slug: 'questions',
        title: 'Questions fréquemment posées',
        content: '# Questions fréquemment posées\n\n## Comment passer commande ?\n\nPour passer commande, cliquez sur le bouton "Commander" sur la page du produit qui vous intéresse. Vous serez redirigé vers notre service de commande.\n\n## Quels sont les délais de livraison ?\n\nLes délais de livraison varient selon votre localisation :\n- **Casablanca** : 24-48h\n- **Autres villes** : 48-72h\n\n## Quels sont les moyens de paiement acceptés ?\n\nNous acceptons :\n- Paiement à la livraison\n- Virement bancaire\n- Paiement mobile\n\n## Les produits sont-ils garantis ?\n\nOui, tous nos produits sont garantis. La durée de garantie varie selon le type de produit.\n\n## Comment puis-je suivre ma commande ?\n\nUne fois votre commande confirmée, vous recevrez un numéro de suivi par SMS ou email.\n\n## Politique de retour\n\nVous disposez de 7 jours après réception pour retourner un produit non conforme.\n\n## Contact\n\nPour toute autre question, n\'hésitez pas à nous contacter via la page Contact.'
      });
    }
    
    return NextResponse.json({
      title: page.title,
      content: page.content
    });
  } catch (error) {
    console.error('Erreur GET page questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la page' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { title, content } = await request.json();
    
    const page = await Page.findOneAndUpdate(
      { slug: 'questions' },
      { title, content },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      page: {
        title: page.title,
        content: page.content
      }
    });
  } catch (error) {
    console.error('Erreur POST page questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}