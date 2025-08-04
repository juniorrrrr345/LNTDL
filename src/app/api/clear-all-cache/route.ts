import { NextResponse } from 'next/server';

export async function GET() {
  // Cette route est appelée côté serveur, donc on retourne juste un script
  // qui nettoiera le localStorage côté client
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nettoyage du cache...</title>
      <meta charset="utf-8">
    </head>
    <body style="background: black; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <div style="text-align: center;">
        <h1>Nettoyage du cache en cours...</h1>
        <p>Redirection dans 2 secondes...</p>
      </div>
      <script>
        // Nettoyer tout le localStorage
        localStorage.clear();
        
        // Nettoyer aussi sessionStorage
        sessionStorage.clear();
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}