import { NextResponse } from 'next/server';

export async function GET() {
  // Pour la sécurité, ne pas exposer les valeurs réelles
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌',
    DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN ? 'Configuré ✅' : 'Manquant ❌',
    DROPBOX_APP_KEY: process.env.DROPBOX_APP_KEY ? 'Configuré ✅' : 'Manquant ❌',
    DROPBOX_APP_SECRET: process.env.DROPBOX_APP_SECRET ? 'Configuré ✅' : 'Manquant ❌',
    VERCEL_URL: process.env.VERCEL_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Configuré ✅' : 'Manquant ❌',
  };

  return NextResponse.json({ env });
}