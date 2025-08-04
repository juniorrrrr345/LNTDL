import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const pagesCollection = db.collection('pages');
    
    // Supprimer l'ancienne page questions si elle existe
    await pagesCollection.deleteOne({ slug: 'questions' });
    
    // Créer la nouvelle page questions avec le contenu par défaut
    const defaultContent = '# Questions fréquemment posées\n\n## Comment passer commande ?\n\nPour passer commande, cliquez sur le bouton "Commander" sur la page du produit qui vous intéresse. Vous serez redirigé vers notre service de commande.\n\n## Quels sont les délais de livraison ?\n\nLes délais de livraison varient selon votre localisation :\n- **Casablanca** : 24-48h\n- **Autres villes** : 48-72h\n\n## Quels sont les moyens de paiement acceptés ?\n\nNous acceptons :\n- Paiement à la livraison\n- Virement bancaire\n- Paiement mobile\n\n## Les produits sont-ils garantis ?\n\nOui, tous nos produits sont garantis. La durée de garantie varie selon le type de produit.\n\n## Comment puis-je suivre ma commande ?\n\nUne fois votre commande confirmée, vous recevrez un numéro de suivi par SMS ou email.\n\n## Politique de retour\n\nVous disposez de 7 jours après réception pour retourner un produit non conforme.\n\n## Contact\n\nPour toute autre question, n\'hésitez pas à nous contacter via la page Contact.';
    
    const result = await pagesCollection.insertOne({
      slug: 'questions',
      title: 'Questions fréquemment posées',
      content: defaultContent,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Page questions réinitialisée avec succès',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('Erreur reset questions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}