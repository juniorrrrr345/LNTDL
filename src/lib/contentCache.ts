// Cache global pour avoir les données admin instantanément disponibles
interface CachedData {
  settings?: any;
  infoPage?: any;
  contactPage?: any;
  socialLinks?: any[];
  products?: any[];
  categories?: any[];
  farms?: any[];
  pages?: {
    info?: { title: string; content: string };
    contact?: { title: string; content: string };
  };
}

class ContentCache {
  private data: any = {};
  private lastUpdate: number = 0;
  private cacheDuration: number = 500; // 0.5 seconde pour synchronisation ultra rapide
  private isRefreshing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Vider le cache localStorage au démarrage pour forcer le chargement frais
      this.clearLocalStorage();
      // Charger immédiatement depuis l'API
      this.forceRefresh();
      // Rafraîchir très fréquemment
      setInterval(() => this.forceRefresh(), 500); // Toutes les 0.5 secondes
    }
  }
  
  // Méthode pour vider le localStorage
  private clearLocalStorage() {
    try {
      localStorage.removeItem('products');
      localStorage.removeItem('categories');
      localStorage.removeItem('farms');
      localStorage.removeItem('shopSettings');
      localStorage.removeItem('socialLinks');
      localStorage.removeItem('infoPage');
      localStorage.removeItem('contactPage');
      localStorage.removeItem('questionsPage');
    } catch (e) {
      console.log('Erreur lors du nettoyage du localStorage:', e);
    }
  }
  
  private async forceRefresh() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    
    try {
      // Charger TOUT depuis l'API en parallèle
      const [products, categories, farms, settings, socialLinks, infoPage, contactPage, questionsPage] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/categories', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/farms', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/settings', { cache: 'no-store' }).then(r => r.ok ? r.json() : {}),
        fetch('/api/social-links', { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch('/api/pages/info', { cache: 'no-store' }).then(r => r.ok ? r.json() : { content: '', title: 'Info' }),
        fetch('/api/pages/contact', { cache: 'no-store' }).then(r => r.ok ? r.json() : { content: '', title: 'Contact' }),
        fetch('/api/pages/questions', { cache: 'no-store' }).then(r => r.ok ? r.json() : { content: '', title: 'Questions' })
      ]);
      
      // Mettre à jour le cache ET localStorage
      const pages = {
        info: infoPage,
        contact: contactPage,
        questions: questionsPage
      };
      this.data = { products, categories, farms, settings, socialLinks, pages };
      
      // Sauvegarder dans localStorage pour affichage instantané
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('farms', JSON.stringify(farms));
      localStorage.setItem('shopSettings', JSON.stringify(settings));
      localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
      localStorage.setItem('infoPage', JSON.stringify(infoPage));
      localStorage.setItem('contactPage', JSON.stringify(contactPage));
      localStorage.setItem('questionsPage', JSON.stringify(questionsPage));
      
      // Émettre un événement pour notifier les composants
      window.dispatchEvent(new CustomEvent('cacheUpdated', { detail: this.data }));
      
    } catch (error) {
      console.log('Erreur refresh cache:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  // Obtenir les settings instantanément - TOUJOURS depuis l'API admin
  getSettings() {
    // Retourner null si pas de données admin pour forcer le chargement depuis l'API
    return this.data.settings || null;
  }

  // Obtenir le contenu info instantanément - TOUJOURS depuis cache frais
  getInfoContent() {
    return this.data.infoPage?.content || null; // Retourner null si pas de données admin
  }

  // Obtenir le contenu contact instantanément - TOUJOURS depuis cache frais
  getContactContent() {
    return this.data.contactPage?.content || null; // Retourner null si pas de données admin
  }

  // Obtenir les produits instantanément
  getProducts() {
    // Retourner un tableau vide si pas encore chargé depuis l'API
    return this.data.products || [];
  }

  // Obtenir les catégories instantanément
  getCategories() {
    // Retourner un tableau vide si pas encore chargé depuis l'API
    return this.data.categories || [];
  }

  // Obtenir les farms instantanément
  getFarms() {
    // Retourner un tableau vide si pas encore chargé depuis l'API
    return this.data.farms || [];
  }

  // Obtenir les liens sociaux
  getSocialLinks() {
    return this.data.socialLinks || [];
  }

  // Getters pour les pages
  getInfoPage() {
    return this.data.pages?.info || null;
  }

  getContactPage() {
    return this.data.pages?.contact || null;
  }

  getQuestionsPage() {
    return this.data.pages?.questions || null;
  }

  // Updaters pour les pages
  updateInfoPage(page: { title: string; content: string }) {
    if (!this.data.pages) {
      this.data.pages = {};
    }
    this.data.pages.info = page;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('infoPage', JSON.stringify(page));
    } catch (e) {}
  }

  updateContactPage(page: { title: string; content: string }) {
    if (!this.data.pages) {
      this.data.pages = {};
    }
    this.data.pages.contact = page;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('contactPage', JSON.stringify(page));
    } catch (e) {}
  }

  updateQuestionsPage(page: { title: string; content: string }) {
    if (!this.data.pages) {
      this.data.pages = {};
    }
    this.data.pages.questions = page;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('questionsPage', JSON.stringify(page));
    } catch (e) {}
  }



  updateSettings(settings: any) {
    this.data.settings = settings;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('shopSettings', JSON.stringify(settings));
    } catch (e) {}
  }

  updateProducts(products: any[]) {
    this.data.products = products;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (e) {}
  }

  updateCategories(categories: any[]) {
    this.data.categories = categories;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('categories', JSON.stringify(categories));
    } catch (e) {}
  }

  updateFarms(farms: any[]) {
    this.data.farms = farms;
    // Sauvegarder aussi dans localStorage séparément pour chargement instantané
    try {
      localStorage.setItem('farms', JSON.stringify(farms));
    } catch (e) {}
  }

  // Invalidate cache - force une nouvelle récupération IMMÉDIATE
  invalidate() {
    console.log('♻️ CACHE INVALIDÉ - Prochaine requête sera ultra-fraîche');
    this.lastUpdate = 0;
    this.data = {}; // Vider complètement les données
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contentCache');
    }
  }

  // Obtenir le timestamp de la dernière mise à jour
  getLastUpdate() {
    return this.lastUpdate;
  }

  // Vérifier si le cache est frais
  isFresh() {
    return (Date.now() - this.lastUpdate) < this.cacheDuration;
  }

  // Récupérer les pages
  getPages() {
    return this.data.pages || {};
  }

  // Récupérer une page spécifique
  getPage(slug: string) {
    const pages = this.getPages();
    return pages[slug] || null;
  }
}

// Instance singleton
const contentCache = new ContentCache();

// Export pour compatibilité avec l'ancien code
export const instantContent = contentCache;

// Export nommé pour la route API
export { contentCache };

export default contentCache;
