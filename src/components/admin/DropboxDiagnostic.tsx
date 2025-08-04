'use client';
import { useState } from 'react';

interface DropboxDiagnosticProps {
  className?: string;
}

export default function DropboxDiagnostic({ className = '' }: DropboxDiagnosticProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFixingLinks, setIsFixingLinks] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testDropboxConnection = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/test-dropbox');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const fixDropboxLinks = async () => {
    setIsFixingLinks(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/fix-dropbox-links', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsFixingLinks(false);
    }
  };

  const fixDropboxLink = (originalLink: string): string => {
    // Méthodes pour corriger un lien Dropbox
    let fixedLink = originalLink;
    
    // Méthode 1: Remplacer ?dl=0 par ?raw=1
    fixedLink = fixedLink.replace('?dl=0', '?raw=1');
    
    // Méthode 2: Si pas de changement, utiliser dl=1
    if (fixedLink === originalLink) {
      fixedLink = originalLink.replace('?dl=0', '?dl=1');
    }
    
    // Méthode 3: Si pas de paramètre, ajouter ?raw=1
    if (!fixedLink.includes('?')) {
      fixedLink = fixedLink + '?raw=1';
    }
    
    // Méthode 4: Utiliser le format direct de Dropbox
    if (fixedLink.includes('www.dropbox.com')) {
      fixedLink = fixedLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      fixedLink = fixedLink.replace(/[?&]dl=[01]/, '');
      fixedLink = fixedLink.replace(/[?&]raw=[01]/, '');
    }
    
    return fixedLink;
  };

  return (
    <div className={`dropbox-diagnostic ${className}`}>
      <div className="bg-gray-900 border border-white/20 rounded-xl p-4 mb-4">
        <h3 className="text-lg font-bold text-white mb-4">🔧 Diagnostic Dropbox</h3>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={testDropboxConnection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Test en cours...' : 'Tester la connexion Dropbox'}
          </button>
          
          <button
            onClick={fixDropboxLinks}
            disabled={isFixingLinks}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isFixingLinks ? 'Correction en cours...' : '🔧 Corriger les liens existants'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-900 border border-green-500 text-green-200 p-3 rounded-lg mb-4">
            <strong>✅ Succès:</strong> {result.message}
            {result.testUrl && (
              <div className="mt-2">
                <strong>Lien de test:</strong> 
                <a href={result.testUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 ml-2">
                  {result.testUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-800 border border-white/10 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2">🔗 Correction de liens Dropbox</h4>
          <p className="text-gray-300 text-sm mb-3">
            Si vos images affichent un point d'interrogation, utilisez ces méthodes pour corriger les liens :
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-blue-400 mr-2">1.</span>
              <span className="text-gray-300">Remplacer <code className="bg-gray-700 px-1 rounded">?dl=0</code> par <code className="bg-gray-700 px-1 rounded">?raw=1</code></span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-400 mr-2">2.</span>
              <span className="text-gray-300">Ou utiliser <code className="bg-gray-700 px-1 rounded">?dl=1</code></span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-400 mr-2">3.</span>
              <span className="text-gray-300">Ou remplacer <code className="bg-gray-700 px-1 rounded">www.dropbox.com</code> par <code className="bg-gray-700 px-1 rounded">dl.dropboxusercontent.com</code></span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900 border border-yellow-500 text-yellow-200 p-3 rounded-lg mt-4">
          <strong>⚠️ Important:</strong> Les tokens Dropbox expirent après 4 heures. 
          Si les images ne s'affichent plus, renouvelez votre token d'accès dans l'interface Dropbox.
        </div>
      </div>
    </div>
  );
}