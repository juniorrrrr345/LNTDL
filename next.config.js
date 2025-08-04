/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration optimisée pour Vercel
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  // Configuration pour accepter des fichiers plus gros
  api: {
    bodyParser: {
      sizeLimit: '200mb',
    },
  },
}

module.exports = nextConfig