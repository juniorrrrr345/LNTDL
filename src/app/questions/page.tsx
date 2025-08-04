import { Metadata } from 'next';
import QuestionsPage from '@/components/QuestionsPage';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';

export const metadata: Metadata = {
  title: 'Questions - LANATIONDULAIT',
  description: 'Questions fréquemment posées'
};

async function getQuestionsData() {
  try {
    await connectDB();
    const page = await Page.findOne({ slug: 'questions' }).lean();
    
    if (!page) {
      return {
        title: 'Questions',
        content: 'Contenu des questions à venir...'
      };
    }
    
    return {
      title: page.title,
      content: page.content
    };
  } catch (error) {
    console.error('Erreur chargement page questions:', error);
    return {
      title: 'Questions',
      content: 'Erreur de chargement'
    };
  }
}

export default async function QuestionsPageRoute() {
  const questionsData = await getQuestionsData();
  
  return <QuestionsPage {...questionsData} />;
}