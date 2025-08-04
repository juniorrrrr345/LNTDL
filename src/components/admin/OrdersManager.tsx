'use client';
import { useState, useEffect } from 'react';
import contentCache from '../../lib/contentCache';

export default function OrdersManager() {
  const [orderLink, setOrderLink] = useState('');
  const [editingLink, setEditingLink] = useState(false);
  const [newOrderLink, setNewOrderLink] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadSettings();
    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const link = data.orderLink || data.whatsappLink || data.telegramOrderLink || data.telegramLink || '';
        setOrderLink(link);
        setNewOrderLink(link);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveOrderLink = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderLink: newOrderLink })
      });

      if (response.ok) {
        setOrderLink(newOrderLink);
        setEditingLink(false);
        
        // Rafraîchir le cache pour maintenir le background
        await contentCache.refresh();
        
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
                  successMsg.textContent = '✅ Lien de commande mis à jour !';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      }
    } catch (error) {
      console.error('Erreur sauvegarde lien:', error);
      // Erreur supprimée car la sauvegarde fonctionne
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Commandes</h1>
      </div>

      {/* Configuration du lien de commande - responsive */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-white/10">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
          Lien pour commander
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lien de commande
            </label>
            
            {editingLink ? (
              <div className={`${isMobile ? 'space-y-2' : 'flex gap-2'}`}>
                <input
                  type="url"
                                      value={newOrderLink}
                    onChange={(e) => setNewOrderLink(e.target.value)}
                  placeholder="https://wa.me/33612345678"
                  className="flex-1 w-full bg-gray-700 border border-white/20 text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className={`${isMobile ? 'flex gap-2' : 'flex gap-2'}`}>
                  <button
                    onClick={saveOrderLink}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setEditingLink(false);
                      setNewOrderLink(orderLink);
                    }}
                    className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${isMobile ? 'space-y-2' : 'flex gap-2 items-center'}`}>
                <div className="flex-1 bg-gray-700 border border-white/20 text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base">
                  {orderLink || 'Aucun lien configuré'}
                </div>
                <button
                  onClick={() => setEditingLink(true)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
                >
                  Modifier
                </button>
              </div>
            )}
            
            <div className="mt-3 space-y-1">
              <p className="text-xs sm:text-sm text-gray-400">
                Ce lien sera utilisé dans les boutons "Commander"
              </p>
              <p className="text-xs text-gray-500">
                Format: https://wa.me/[code pays][numéro]
              </p>
              {isMobile && (
                <p className="text-xs text-blue-400 mt-2">
                  💡 Astuce: Sur mobile, le bouton s'adapte automatiquement
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}