
import React from 'react';
import { Provider } from '../types';
import { ICONS, COLORS } from '../constants';

interface ProviderCardProps {
  provider: Provider;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, index, isFavorite, onToggleFavorite, onClick 
}) => {
  const formatUrl = (url: string | undefined) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div 
      className="group relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-gold/50 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-slideUp cursor-pointer flex flex-col h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-56 overflow-hidden" onClick={onClick}>
        {provider.image ? (
          <img 
            src={provider.image} 
            alt={provider.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('❌ Fehler beim Laden des Provider-Bildes:', provider.image);
              console.error('Provider:', provider.name, 'ID:', provider.id);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Zeige einen Platzhalter statt Fallback-Bild
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full bg-zinc-900 flex items-center justify-center text-gray-600 text-sm">Bild konnte nicht geladen werden</div>';
              }
            }}
            onLoad={() => console.log('✅ Provider-Bild erfolgreich geladen:', provider.image)}
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-gray-600 text-sm">
            Kein Bild
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 bg-gold text-black font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <span className="text-xs">#</span>
          <span className="text-lg">{index + 1}</span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-gold/80 transition-colors group/heart"
        >
          <ICONS.Heart 
            className={`w-5 h-5 transition-all ${isFavorite ? 'fill-gold text-gold scale-125' : 'text-white group-hover/heart:text-black'}`} 
          />
        </button>
      </div>

      <div className="p-6 space-y-4 flex flex-col flex-grow" onClick={onClick}>
        <div className="flex-grow">
          <div className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
            <span className="bg-gold/20 px-2 py-0.5 rounded">{provider.category}</span>
          </div>
          <h3 className="text-xl font-playfair font-bold text-white group-hover:text-gold transition-colors">
            {provider.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 font-light mt-2">
            {provider.description}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex gap-2 items-center py-2">
          {provider.website && (
            <a 
              href={formatUrl(provider.website)} 
              target="_blank" 
              onClick={(e) => e.stopPropagation()} 
              className="p-2 bg-white/5 hover:bg-gold hover:text-black rounded-lg transition-all border border-white/5"
            >
              <ICONS.Globe className="w-4 h-4" />
            </a>
          )}
          {provider.socialMedia?.instagram && (
            <a 
              href={formatUrl(provider.socialMedia.instagram)} 
              target="_blank" 
              onClick={(e) => e.stopPropagation()} 
              className="p-2 bg-white/5 hover:bg-gold hover:text-black rounded-lg transition-all border border-white/5"
            >
              <ICONS.Instagram className="w-4 h-4" />
            </a>
          )}
          {provider.socialMedia?.facebook && (
            <a 
              href={formatUrl(provider.socialMedia.facebook)} 
              target="_blank" 
              onClick={(e) => e.stopPropagation()} 
              className="p-2 bg-white/5 hover:bg-gold hover:text-black rounded-lg transition-all border border-white/5"
            >
              <ICONS.Facebook className="w-4 h-4" />
            </a>
          )}
          {provider.whatsapp && (
            <a 
              href={`https://wa.me/${provider.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} 
              target="_blank" 
              onClick={(e) => e.stopPropagation()} 
              className="p-2 bg-green-600/10 hover:bg-green-600 hover:text-white rounded-lg transition-all border border-green-600/20 text-green-500"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </a>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-1">
            <ICONS.Star className="w-4 h-4 text-gold fill-gold" />
            <span className="font-bold text-sm">
              {typeof provider.rating === 'number' 
                ? provider.rating.toFixed(1).replace('.', ',')
                : Number(provider.rating || 0).toFixed(1).replace('.', ',')
              }
            </span>
            <span className="text-gray-500 text-xs font-light">({provider.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <ICONS.MapPin className="w-3 h-3" />
            <span className="text-xs truncate max-w-[120px]">{provider.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
