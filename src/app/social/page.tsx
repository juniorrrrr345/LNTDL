import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SocialPage from '@/components/SocialPage';
import { connectToDatabase } from '@/lib/mongodb-fixed';

interface SocialLink {
  _id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface Settings {
  shopTitle: string;
  shopSubtitle: string;
  email: string;
  address: string;

}

async function getSocialData() {
  try {
    const { db } = await connectToDatabase();
    
    const [socialLinks, settings] = await Promise.all([
      db.collection('socialLinks').find({ isActive: true }).toArray(),
      db.collection('settings').findOne({})
    ]);
    
    return {
      socialLinks: socialLinks as SocialLink[],
      settings: settings as Settings | null
    };
  } catch (error) {
    console.error('Erreur chargement social:', error);
    return {
      socialLinks: [],
      settings: null
    };
  }
}

export default async function SocialPage() {
  // Charger les données côté serveur
  const { socialLinks, settings } = await getSocialData();

  // Structure cohérente avec la boutique principale
  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal */}
      <div className="content-layer">
        <Header />
        
        <div className="pt-12 sm:pt-14">
          <div className="h-4 sm:h-6"></div>
          
          <SocialPage 
            initialSocialLinks={socialLinks}
            shopTitle={settings?.shopTitle || 'LANATIONDULAIT'}
          />
        </div>
      </div>
      
      {/* BottomNav toujours visible */}
      <BottomNav />
    </div>
  );
}