
import React, { useState, useMemo } from 'react';
import { Role, Language, Provider } from '../types';
import { TRANSLATIONS, ICONS } from '../constants';
import Logo from './Logo';

interface HeaderProps {
  lang: Language;
  setLang: (l: Language) => void;
  role: Role;
  setRole: (r: Role) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  setView: (v: 'home' | 'details' | 'admin' | 'register' | 'favorites') => void;
  providers: Provider[];
}

const Header: React.FC<HeaderProps> = ({ 
  lang, setLang, role, setRole, selectedCity, setSelectedCity, setView, providers 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dynamisch alle Städte aus den Providern extrahieren
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(providers.map(p => p.city)));
    return uniqueCities.sort();
  }, [providers]);

  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-lg border-b border-white/10 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer group py-1"
          onClick={() => setView('home')}
        >
          <Logo compact={true} className="h-10 md:h-12 group-hover:brightness-110 transition-all" />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-gold transition-colors text-sm bg-white/5">
              <ICONS.MapPin className="w-4 h-4 text-gold" />
              <span className="font-semibold">{selectedCity}</span>
              <ICONS.ChevronRight className="w-3 h-3 rotate-90 opacity-40" />
            </button>
            
            <div className="absolute top-full mt-2 left-0 w-48 bg-[#111] border border-white/10 rounded-xl hidden group-hover:block shadow-2xl overflow-hidden animate-fadeIn">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full text-left px-4 py-3 hover:bg-gold hover:text-black transition-all text-sm ${selectedCity === city ? 'bg-gold/10 text-gold font-bold' : 'text-gray-300'}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setView('favorites')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            title={t.favorites}
          >
            <ICONS.Heart className="w-5 h-5 text-white" />
          </button>

          <div className="flex gap-1 border-x border-white/10 px-4">
            <button 
              onClick={() => setLang('de')} 
              className={`text-xs transition-all px-2 py-1 rounded ${lang === 'de' ? 'text-gold font-bold bg-gold/10' : 'text-gray-500 hover:text-white'}`}
            >
              DE
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`text-xs transition-all px-2 py-1 rounded ${lang === 'en' ? 'text-gold font-bold bg-gold/10' : 'text-gray-500 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        <button 
          className="md:hidden p-2 text-gold"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <ICONS.X /> : <ICONS.Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 p-6 space-y-6 shadow-2xl animate-slideDown backdrop-blur-xl">
          <div>
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider">{t.citySelector}</p>
            <div className="grid grid-cols-2 gap-2">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 border border-white/10 rounded-lg text-sm text-left flex items-center gap-3 transition-all ${selectedCity === city ? 'bg-gold text-black font-bold border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white'}`}
                >
                  <ICONS.MapPin className="w-4 h-4" />
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center py-4 border-t border-white/10">
            <div className="flex gap-4">
              <button onClick={() => { setLang('de'); setIsMenuOpen(false); }} className={`text-lg px-2 py-1 rounded ${lang === 'de' ? 'text-gold font-bold bg-gold/10' : 'text-gray-500'}`}>DE</button>
              <button onClick={() => { setLang('en'); setIsMenuOpen(false); }} className={`text-lg px-2 py-1 rounded ${lang === 'en' ? 'text-gold font-bold bg-gold/10' : 'text-gray-500'}`}>EN</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
