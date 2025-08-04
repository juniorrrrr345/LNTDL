'use client';

interface ContactPageProps {
  content: string;

  socialLinks: Array<{
    name: string;
    url: string;
    icon: string;
    color: string;
  }>;
}

export default function ContactPage({ content, socialLinks }: ContactPageProps) {
  const parseMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl sm:text-2xl font-bold text-white mb-4 mt-8">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg sm:text-xl font-bold text-white mb-3 mt-6">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1">$1. $2</li>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Titre de la page avec style boutique */}
      <div className="text-center mb-8">
        <h1 className="shop-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
          Contact
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
      </div>

      {/* Contenu principal - Affichage instantané */}
      {content && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 mb-8">
          <div 
            className="prose prose-lg max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        </div>
      )}

      {/* Liens sociaux si disponibles */}
      {socialLinks.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Nos Réseaux</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 border border-white/20"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}



      {/* Si aucun contenu n'est disponible */}
      {!content && !socialLinks.length && (
        <div className="text-center text-gray-500 py-12">
          <p>Aucun contenu disponible</p>
        </div>
      )}
    </div>
  );
}