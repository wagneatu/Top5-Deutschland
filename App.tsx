
import React, { useState, useEffect, useRef } from 'react';
import { Role, Language, Category, Provider, GastronomySubCategory, Review, CategoryInfo } from './types';
import { CATEGORIES as INITIAL_CATEGORIES, TRANSLATIONS, MOCK_PROVIDERS, ICONS, GASTRONOMY_SUB_CATEGORIES } from './constants';
import ProviderCard from './components/ProviderCard';
import Header from './components/Header';
import ProviderDetail from './components/ProviderDetail';
import AdminDashboard from './components/AdminDashboard';
import ProviderRegistration from './components/ProviderRegistration';
import AIInsider from './components/AIInsider';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('visitor');
  const [lang, setLang] = useState<Language>('de');
  const [selectedCity, setSelectedCity] = useState<string>('Bamberg');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<GastronomySubCategory>('all');
  const [showAITip, setShowAITip] = useState(false);
  
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const saved = localStorage.getItem('top5_categories');
    if (saved) return JSON.parse(saved);
    return INITIAL_CATEGORIES.map(cat => ({
      id: cat.id,
      label: cat.label,
      iconName: Object.keys(ICONS).find(key => key.toLowerCase() === cat.id.toLowerCase()) || 'Briefcase',
      subCategories: cat.id === 'gastronomy' 
        ? GASTRONOMY_SUB_CATEGORIES.map(sub => ({ id: sub.id, label: sub.label }))
        : []
    }));
  });

  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('top5_providers');
    return saved ? JSON.parse(saved) : MOCK_PROVIDERS;
  });
  
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('top5_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setViewState] = useState<'home' | 'details' | 'admin' | 'register' | 'favorites'>(() => {
    // Beim Laden prüfen, ob Hash vorhanden ist
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') return 'admin';
    return 'home';
  });

  // Wrapper-Funktion, die auch den Hash synchronisiert
  const setView = (newView: 'home' | 'details' | 'admin' | 'register' | 'favorites') => {
    setViewState(newView);
    if (newView === 'admin') {
      window.location.hash = 'admin';
    } else if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  useEffect(() => {
    localStorage.setItem('top5_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('top5_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('top5_categories', JSON.stringify(categories));
  }, [categories]);

  // CarSkin Folientechnik automatisch hinzufügen, falls noch nicht vorhanden
  useEffect(() => {
    const carskinId = 'carskin-folientechnik-bamberg';
    setProviders(prev => {
      const carskinExists = prev.some(p => p.id === carskinId);
      if (!carskinExists) {
        const carskinProvider = MOCK_PROVIDERS.find(p => p.id === carskinId);
        if (carskinProvider) {
          return [carskinProvider, ...prev];
        }
      }
      return prev;
    });
  }, []); // Nur einmal beim ersten Laden ausführen

  useEffect(() => {
    setActiveSubCategory('all');
    setShowAITip(false);
  }, [activeCategory, selectedCity]);

  // Hash-basierte Navigation für Admin-Zugang - MEHRFACH PRÜFEN
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase().trim();
      if (hash === 'admin') {
        setViewState('admin');
        return true;
      }
      return false;
    };

    // Sofort beim Mount prüfen
    if (checkHash()) return;

    // Mehrfach prüfen für verschiedene Szenarien
    const timers = [
      setTimeout(() => checkHash(), 50),
      setTimeout(() => checkHash(), 100),
      setTimeout(() => checkHash(), 200),
      setTimeout(() => checkHash(), 500),
    ];

    // Auf Hash-Änderungen hören
    const handleHashChange = () => {
      checkHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    
    // Auch auf Load-Event hören
    window.addEventListener('load', checkHash);
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('load', checkHash);
    };
  }, []);

  // Globale Funktion für direkten Zugriff über Konsole
  useEffect(() => {
    (window as any).openAdmin = () => {
      setViewState('admin');
      window.location.hash = 'admin';
    };
  }, []);

  // Versteckter Admin-Zugang: Strg+Shift+A
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setView('admin');
        window.location.hash = 'admin';
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleAddReview = (providerId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')
    };

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const newReviewCount = updatedReviews.length;
        const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newReviewCount).toFixed(1));
        return { ...p, reviews: updatedReviews, reviewCount: newReviewCount, rating: newRating };
      }
      return p;
    }));
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => alert(lang === 'de' ? "Standort erkannt! Bamberg wird als Standard verwendet." : "Location found! Using Bamberg as default."),
        () => alert(lang === 'de' ? "Zugriff verweigert." : "Access denied.")
      );
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // Debug: Zeige Provider-Daten in Konsole
  useEffect(() => {
    if (selectedProvider) {
      console.log('🔍 === SELECTED PROVIDER DEBUG ===');
      console.log('Provider:', selectedProvider.name);
      console.log('Image:', selectedProvider.image);
      console.log('Logo:', selectedProvider.logo);
      console.log('Gallery:', selectedProvider.gallery);
      console.log('Gallery Count:', selectedProvider.gallery?.length || 0);
      
      // Teste alle Bild-URLs
      const testImage = async (url: string, name: string) => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          console.log(`${name} (${url}):`, response.status, response.ok ? '✅ OK' : '❌ FEHLER');
        } catch (error) {
          console.error(`${name} (${url}): ❌ NICHT ERREICHBAR`, error);
        }
      };
      
      if (selectedProvider.image) {
        testImage(selectedProvider.image, 'Hauptbild');
      }
      if (selectedProvider.logo) {
        testImage(selectedProvider.logo, 'Logo');
      }
      if (selectedProvider.gallery) {
        selectedProvider.gallery.forEach((url, idx) => {
          testImage(url, `Galerie ${idx}`);
        });
      }
      console.log('🔍 === ENDE DEBUG ===');
    }
  }, [selectedProvider]);

  const filteredProviders = providers.filter(p => {
    const cityMatch = p.city === selectedCity;
    const categoryMatch = activeCategory ? p.category === activeCategory : true;
    const subCategoryMatch = (activeCategory && activeSubCategory !== 'all') 
      ? p.subCategory === activeSubCategory 
      : true;
    return cityMatch && categoryMatch && subCategoryMatch && p.isApproved;
  });

  const t = TRANSLATIONS[lang];

  // Versteckter Admin-Zugang: 5x auf Logo klicken
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setView('admin');
        window.location.hash = 'admin';
        return 0;
      }
      // Reset nach 2 Sekunden
      if (logoClickTimer.current) {
        clearTimeout(logoClickTimer.current);
      }
      logoClickTimer.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
      return newCount;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white pb-20 md:pb-0">
      <Header 
        lang={lang} 
        setLang={setLang} 
        role={role} 
        setRole={setRole} 
        setView={setView} 
        selectedCity={selectedCity} 
        setSelectedCity={setSelectedCity}
        providers={providers}
        onLogoClick={handleLogoClick}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-4">
        {view === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-4xl md:text-6xl font-playfair font-bold text-gold tracking-tight">
                    Top 5 in {selectedCity}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAITip(!showAITip)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        showAITip 
                        ? 'bg-gold text-black border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                        : 'border-gold/30 text-gold hover:bg-gold/10'
                      }`}
                    >
                      <ICONS.Sparkle className={`w-4 h-4 ${showAITip ? 'animate-spin' : ''}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Insider</span>
                    </button>
                    <button 
                      onClick={handleLocateMe}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-gray-500 hover:text-white hover:border-white transition-all"
                    >
                      <ICONS.MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Standort</span>
                    </button>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gold mt-4 opacity-30 rounded-full" />
              </div>
            </div>

            {showAITip && (
              <div className="animate-slideDown">
                <AIInsider city={selectedCity} lang={lang} />
              </div>
            )}

            <div className="space-y-4 sticky top-[72px] z-30 bg-black/80 backdrop-blur-md pt-2">
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`flex items-center gap-3 px-7 py-3.5 rounded-full border transition-all shrink-0 ${
                      activeCategory === cat.id 
                      ? 'bg-gold border-gold text-white font-bold shadow-[0_0_25px_rgba(212,175,55,0.4)]' 
                      : 'border-white/10 text-white hover:border-gold/50'
                    }`}
                  >
                    <span className="scale-110">
                      {React.createElement((ICONS as any)[cat.iconName] || ICONS.Briefcase, { className: "w-5 h-5" })}
                    </span>
                    <span className="text-lg leading-none">{cat.label[lang]}</span>
                  </button>
                ))}
              </div>

              {activeCategory && categories.find(c => c.id === activeCategory)?.subCategories.length! > 0 && (
                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar animate-slideDown">
                  <button
                    onClick={() => setActiveSubCategory('all')}
                    className={`px-6 py-2.5 rounded-full text-base font-semibold border transition-all shrink-0 ${
                      activeSubCategory === 'all'
                      ? 'bg-gold/20 border-gold/60 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'border-gold/10 text-gold hover:border-gold/30 hover:bg-gold/5'
                    }`}
                  >
                    Alle
                  </button>
                  {categories.find(c => c.id === activeCategory)?.subCategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubCategory(sub.id)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-semibold border transition-all shrink-0 ${
                        activeSubCategory === sub.id
                        ? 'bg-gold/20 border-gold/60 text-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'border-gold/10 text-gold hover:border-gold/30 hover:bg-gold/5'
                      }`}
                    >
                      <span>{sub.label[lang]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider, index) => (
                  <ProviderCard 
                    key={provider.id} 
                    provider={provider} 
                    index={index}
                    isFavorite={favorites.includes(provider.id)}
                    onToggleFavorite={() => toggleFavorite(provider.id)}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setView('details');
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-500">
                  <ICONS.Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Keine Einträge in {selectedCity} gefunden.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'details' && selectedProvider && (
          <ProviderDetail 
            provider={selectedProvider} 
            lang={lang} 
            onBack={() => setView('home')} 
            isFavorite={favorites.includes(selectedProvider.id)}
            onToggleFavorite={() => toggleFavorite(selectedProvider.id)}
            onAddReview={(review) => handleAddReview(selectedProvider.id, review)}
          />
        )}

        {view === 'favorites' && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ICONS.ChevronRight className="rotate-180" />
              </button>
              <h1 className="text-3xl font-playfair font-bold text-gold">{t.favorites}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.filter(p => favorites.includes(p.id)).length > 0 ? (
                providers.filter(p => favorites.includes(p.id)).map((provider, index) => (
                  <ProviderCard 
                    key={provider.id} 
                    provider={provider} 
                    index={index}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(provider.id)}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setView('details');
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-500">
                  <ICONS.Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>{t.noFavs}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'admin' && (
          <AdminDashboard 
            providers={providers} 
            setProviders={setProviders} 
            categories={categories}
            setCategories={setCategories}
            lang={lang}
          />
        )}

        {view === 'register' && (
          <ProviderRegistration 
            lang={lang} 
            categories={categories}
            onSubmit={(newProvider) => {
              setProviders(prev => [newProvider, ...prev]);
              setView('home');
              alert(lang === 'de' ? 'Unternehmen erfolgreich registriert!' : 'Business successfully registered!');
            }}
          />
        )}
      </main>

      {/* Footer & Mobile Nav */}
      <footer className="border-t border-white/10 bg-[#050505] py-16 px-4 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <h3 className="text-gold font-playfair font-bold text-2xl">Top5Deutschland</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{t.slogan}</p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest">Plattform</h4>
              <nav className="flex flex-col gap-2">
                <button onClick={() => setView('home')} className="text-gray-500 hover:text-white text-sm text-left">Entdecken</button>
                <button onClick={() => setView('register')} className="text-gray-500 hover:text-white text-sm text-left">Unternehmen</button>
              </nav>
            </div>
          </div>
        </div>
        {/* VERSTECKTER ADMIN-BUTTON - Rechts unten, unsichtbar aber klickbar */}
        <button 
          onClick={() => {
            setViewState('admin');
            window.location.hash = 'admin';
          }}
          className="fixed bottom-20 right-4 w-12 h-12 bg-gold/10 border border-gold/30 rounded-full hover:bg-gold/20 transition-all z-[9999] opacity-30 hover:opacity-100"
          aria-label="Admin"
          title="Admin Zugang"
          style={{ 
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            width: '48px',
            height: '48px',
            zIndex: 9999
          }}
        >
          <ICONS.LayoutDashboard className="w-6 h-6 text-gold mx-auto" />
        </button>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 md:hidden flex justify-around items-center p-3 z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-gold' : 'text-gray-500'}`}>
          <ICONS.Search className="w-6 h-6" />
          <span className="text-[10px]">Entdecken</span>
        </button>
        <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 ${view === 'favorites' ? 'text-gold' : 'text-gray-500'}`}>
          <ICONS.Heart className="w-6 h-6" />
          <span className="text-[10px]">Favoriten</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
