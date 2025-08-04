import QuestionsPage from '@/components/QuestionsPage';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { connectToDatabase } from '@/lib/mongodb-fixed';

async function getQuestionsContent() {
  try {
    const { db } = await connectToDatabase();
    const page = await db.collection('pages').findOne({ slug: 'questions' });
    return page?.content || '';
  } catch (error) {
    console.error('Erreur chargement questions:', error);
    return '';
  }
}

export default async function QuestionsPageRoute() {
  // Charger le contenu côté serveur
  const content = await getQuestionsContent();

  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        <div className="pt-12 sm:pt-14">
          <div className="h-4 sm:h-6"></div>
          <QuestionsPage content={content} />
        </div>
      </div>
      
      {/* BottomNav */}
      <BottomNav />
    </div>
  );
}