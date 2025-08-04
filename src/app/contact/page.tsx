import ContactPage from '@/components/ContactPage';
import Header from '@/components/Header';
import contentCache from '@/lib/contentCache';
import BottomNav from '@/components/BottomNav';
import { connectToDatabase } from '@/lib/mongodb-fixed';

async function getContactData() {
  try {
    const { db } = await connectToDatabase();
    
    const [page, settings, socialLinks] = await Promise.all([
      db.collection('pages').findOne({ slug: 'contact' }),
      db.collection('settings').findOne({}),
      db.collection('socialLinks').find({ isActive: true }).toArray()
    ]);
    
    return {
      content: page?.content || '',
  
      socialLinks: socialLinks || []
    };
  } catch (error) {
    console.error('Erreur chargement contact:', error);
    return {
      content: '',
  
      socialLinks: []
    };
  }
}

export default async function ContactPageRoute() {
  // Charger les données côté serveur
  const { content, socialLinks } = await getContactData();

  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        <div className="pt-12 sm:pt-14">
          <div className="h-4 sm:h-6"></div>
          <ContactPage 
            content={content}
  
            socialLinks={socialLinks}
          />
        </div>
      </div>
      
      {/* BottomNav */}
      <BottomNav />
    </div>
  );
}