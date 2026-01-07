
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Provider, Language, PricingTier, CategoryInfo, PaymentStatus, ApprovalStatus, Review } from '../types';
import { ICONS } from '../constants';
import { SUPABASE_STORAGE_BUCKET } from '../config';
import { supabase } from '../lib/supabaseclient';

interface AdminDashboardProps {
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  categories: CategoryInfo[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
  lang: Language;
}

const DAYS = [
  { id: 'mo', label: 'Montag' },
  { id: 'di', label: 'Dienstag' },
  { id: 'mi', label: 'Mittwoch' },
  { id: 'do', label: 'Donnerstag' },
  { id: 'fr', label: 'Freitag' },
  { id: 'sa', label: 'Samstag' },
  { id: 'so', label: 'Sonntag' }
];

const ADMIN_PASSWORD = "Top5Admin2025"; // Das Passwort wurde hier korrigiert

const AdminDashboard: React.FC<AdminDashboardProps> = ({ providers, setProviders, categories, setCategories, lang }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'providers' | 'categories'>('providers');
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // States for Category Management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCat, setNewCat] = useState({ id: '', labelDe: '', labelEn: '', icon: 'Briefcase' });
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSub, setNewSub] = useState({ labelDe: '', labelEn: '' });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [tempHours, setTempHours] = useState<Record<string, string>>({
    mo: '09:00 - 18:00', di: '09:00 - 18:00', mi: '09:00 - 18:00', do: '09:00 - 18:00', fr: '09:00 - 18:00', sa: '10:00 - 16:00', so: 'Geschlossen'
  });

  const emptyProvider: Omit<Provider, 'id'> = {
    name: '',
    category: categories[0]?.id || 'gastronomy',
    subCategory: '',
    city: 'Bamberg',
    address: '',
    description: '',
    features: '',
    attributes: [],
    tags: [],
    tier: 'premium',
    website: '',
    phone: '',
    whatsapp: '',
    email: '',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    logo: '',
    gallery: [],
    reviews: [],
    rating: 0,
    reviewCount: 0,
    openingHours: '',
    isApproved: true,
    approvalStatus: 'active',
    paymentStatus: 'paid',
    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    coordinates: { lat: 49.89, lng: 10.89 },
    mapsUrl: '',
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    promotionalOffer: ''
  };

  const [formState, setFormState] = useState<Provider>(() => ({ ...emptyProvider, id: 'temp' } as Provider));

  useEffect(() => {
    if (editingProvider) {
      setFormState(editingProvider);
      const hours = editingProvider.openingHours || '';
      const lines = hours.split('\n');
      const newTempHours: Record<string, string> = {};
      lines.forEach(line => {
        const parts = line.split(': ');
        if (parts.length >= 2) {
          const dayEntry = DAYS.find(d => d.label === parts[0]);
          if (dayEntry) newTempHours[dayEntry.id] = parts.slice(1).join(': ');
        }
      });
      setTempHours(prev => ({ ...prev, ...newTempHours }));
    } else {
      setFormState({ ...emptyProvider, id: Math.random().toString(36).substr(2, 9) } as Provider);
    }
  }, [editingProvider, isAddingNew, categories]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
  };

  const saveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = DAYS.map(d => `${d.label}: ${tempHours[d.id] || 'Geschlossen'}`).join('\n');
    const updatedProvider = { ...formState, openingHours: hours };

    if (editingProvider) {
      setProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
    } else {
      setProviders(prev => [updatedProvider, ...prev]);
    }
    
    setEditingProvider(null);
    setIsAddingNew(false);
  };

  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Upload-Fehler:', error);
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (target === 'logo' || target === 'main') {
        const file = files[0];
        if (file) {
          const imageUrl = await uploadToSupabase(file);
          if (imageUrl) {
            setFormState(prev => ({ ...prev, [target === 'logo' ? 'logo' : 'image']: imageUrl }));
          }
        }
      } else {
        // Mehrere Bilder für Galerie
        const uploadPromises = Array.from(files).map(file => uploadToSupabase(file));
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);
        
        setFormState(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...validUrls] }));
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      alert('Fehler beim Hochladen der Bilder. Bitte versuche es erneut.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = () => {
    if (deletingId) {
      setProviders(prev => prev.filter(p => p.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleAddCategory = () => {
    if (!newCat.id || !newCat.labelDe) return;
    const catId = newCat.id.toLowerCase().replace(/\s/g, '-');
    const cat: CategoryInfo = {
      id: catId,
      label: { de: newCat.labelDe, en: newCat.labelEn || newCat.labelDe },
      iconName: newCat.icon,
      subCategories: []
    };
    setCategories(prev => [...prev, cat]);
    setIsAddingCategory(false);
    
    if (editingProvider || isAddingNew) {
      setFormState(prev => ({ ...prev, category: catId, subCategory: '' }));
    }
    
    setNewCat({ id: '', labelDe: '', labelEn: '', icon: 'Briefcase' });
  };

  const handleAddSubCategory = (catId: string) => {
    if (!newSub.labelDe) return;
    const subId = newSub.labelDe.toLowerCase().replace(/\s/g, '-');
    setCategories(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          subCategories: [
            ...cat.subCategories,
            { 
              id: subId, 
              label: { de: newSub.labelDe, en: newSub.labelEn || newSub.labelDe } 
            }
          ]
        };
      }
      return cat;
    }));
    
    if ((editingProvider || isAddingNew) && formState.category === catId) {
      setFormState(prev => ({ ...prev, subCategory: subId }));
    }

    setAddingSubTo(null);
    setNewSub({ labelDe: '', labelEn: '' });
  };

  const handleDeleteReview = (reviewId: string) => {
    const updatedReviews = (formState.reviews || []).filter(r => r.id !== reviewId);
    const newCount = updatedReviews.length;
    const newAvg = newCount > 0 
      ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1))
      : 0;

    setFormState(prev => ({
      ...prev,
      reviews: updatedReviews,
      reviewCount: newCount,
      rating: newAvg
    }));
  };

  const activeCategoryData = useMemo(() => 
    categories.find(c => c.id === formState.category), 
    [categories, formState.category]
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn">
        <div className="bg-[#111] border border-gold/20 p-12 rounded-[2.5rem] w-full max-w-md space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold/20">
              <ICONS.ShieldCheck className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl font-playfair font-bold text-white tracking-tight">Admin Access</h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Geschützter Bereich</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">Passwort eingeben</label>
              <div className="relative group">
                <ICONS.LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-gold transition-colors" />
                <input 
                  type="password"
                  autoFocus
                  className={`w-full bg-black border ${loginError ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white focus:border-gold outline-none transition-all shadow-inner`}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-red-500 text-[10px] font-bold uppercase text-center mt-2 animate-bounce">Ungültiges Passwort</p>}
            </div>
            <button 
              type="submit" 
              className="w-full bg-gold text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Identität bestätigen
            </button>
          </form>
          <p className="text-[9px] text-center text-gray-600 uppercase tracking-widest">Nur autorisiertes Personal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-playfair font-bold text-gold">Plattform Steuerung</h2>
        <div className="flex gap-2">
          {activeTab === 'providers' ? (
            <button onClick={() => { setIsAddingNew(true); setEditingProvider(null); }} className="bg-gold text-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg">
              Neuer Eintrag
            </button>
          ) : (
            <button onClick={() => setIsAddingCategory(true)} className="bg-gold text-black px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg">
              Neue Kategorie
            </button>
          )}
          <button onClick={() => setIsAuthenticated(false)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-500 transition-all">
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/10 gap-8">
        <button onClick={() => setActiveTab('providers')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'providers' ? 'text-gold' : 'text-gray-500 hover:text-white'}`}>
          Anbieter
        </button>
        <button onClick={() => setActiveTab('categories')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'categories' ? 'text-gold' : 'text-gray-500 hover:text-white'}`}>
          Struktur
        </button>
      </div>

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 gap-3">
          {providers.map(p => (
            <div key={p.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-gold/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                  <img src={p.image || p.logo} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{p.name}</h4>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">{p.city} • {p.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingProvider(p)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><ICONS.Pencil className="w-5 h-5" /></button>
                <button onClick={() => setDeletingId(p.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><ICONS.Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                    {React.createElement((ICONS as any)[cat.iconName] || ICONS.Briefcase, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{cat.label.de}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{cat.id}</p>
                  </div>
                </div>
                <button 
                   onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))}
                   className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <ICONS.Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Unterkategorien</p>
                <div className="flex flex-wrap gap-2">
                  {cat.subCategories.map(sub => (
                    <span key={sub.id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center gap-2 group">
                      {sub.label.de}
                      <button onClick={() => setCategories(prev => prev.map(c => c.id === cat.id ? {...c, subCategories: c.subCategories.filter(s => s.id !== sub.id)} : c))} className="opacity-0 group-hover:opacity-100 text-red-500">
                        <ICONS.X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button 
                    onClick={() => setAddingSubTo(cat.id)}
                    className="px-3 py-1.5 border border-dashed border-gold/30 text-gold rounded-lg text-xs hover:bg-gold/5 transition-all"
                  >
                    + Neu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAddingCategory || addingSubTo) && (
        <div className="fixed inset-0 bg-black/80 z-[125] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          {isAddingCategory ? (
            <div className="bg-[#111] border border-gold/30 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
              <h3 className="text-xl font-playfair font-bold text-white">Neue Haupt-Kategorie</h3>
              <div className="space-y-4">
                <input placeholder="ID (z.B. fashion)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newCat.id} onChange={e => setNewCat({...newCat, id: e.target.value})} />
                <input placeholder="Anzeige Name (DE)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newCat.labelDe} onChange={e => setNewCat({...newCat, labelDe: e.target.value})} />
                <input placeholder="Anzeige Name (EN)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newCat.labelEn} onChange={e => setNewCat({...newCat, labelEn: e.target.value})} />
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Icon wählen</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})}>
                    {Object.keys(ICONS).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddCategory} className="flex-1 bg-gold text-black py-3 rounded-xl font-bold">Kategorie erstellen</button>
                <button onClick={() => setIsAddingCategory(false)} className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold border border-white/10">Abbrechen</button>
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-gold/30 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl">
              <h3 className="text-xl font-playfair font-bold text-white">Unterkategorie zu {categories.find(c => c.id === addingSubTo)?.label.de}</h3>
              <div className="space-y-4">
                <input placeholder="Name (DE)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newSub.labelDe} onChange={e => setNewSub({...newSub, labelDe: e.target.value})} />
                <input placeholder="Name (EN)" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={newSub.labelEn} onChange={e => setNewSub({...newSub, labelEn: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAddSubCategory(addingSubTo!)} className="flex-1 bg-gold text-black py-3 rounded-xl font-bold">Hinzufügen</button>
                <button onClick={() => setAddingSubTo(null)} className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold border border-white/10">Abbrechen</button>
              </div>
            </div>
          )}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111] border border-red-500/30 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-playfair font-bold text-white">Eintrag löschen?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Möchten Sie den Eintrag <span className="text-white font-bold">"{providers.find(p => p.id === deletingId)?.name}"</span> wirklich unwiderruflich von der Plattform entfernen?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                Löschen
              </button>
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-white/5 text-white py-3.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {(editingProvider || isAddingNew) && (
        <div className="fixed inset-0 bg-black/98 z-[110] overflow-y-auto p-4 md:p-12 backdrop-blur-md animate-fadeIn">
          <div className="max-w-6xl mx-auto bg-[#0a0a0a] border border-gold/20 rounded-[2.5rem] overflow-hidden shadow-2xl pb-10">
            <div className="bg-gold px-10 py-6 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-black font-black uppercase tracking-widest text-sm">
                {editingProvider ? `${formState.name} bearbeiten` : 'Neuer Top 5 Eintrag'}
              </h3>
              <button onClick={() => { setEditingProvider(null); setIsAddingNew(false); }} className="text-black hover:scale-125 transition-transform"><ICONS.X className="w-8 h-8" /></button>
            </div>
            
            <form onSubmit={saveProvider} className="p-10 space-y-12">
              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Basis Informationen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Business Name</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex justify-between items-center">
                      <span>Kategorie</span>
                      <button type="button" onClick={() => setIsAddingCategory(true)} className="p-1 text-gold hover:scale-110 transition-all">
                        <ICONS.Plus className="w-6 h-6" />
                      </button>
                    </label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.category} onChange={e => setFormState({...formState, category: e.target.value, subCategory: ''})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.label.de}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex justify-between items-center">
                      <span>Unterkategorie</span>
                      <button type="button" onClick={() => setAddingSubTo(formState.category)} className="p-1 text-gold hover:scale-110 transition-all">
                        <ICONS.Plus className="w-6 h-6" />
                      </button>
                    </label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" 
                      value={formState.subCategory || ''} 
                      onChange={e => setFormState({...formState, subCategory: e.target.value})}
                      disabled={!activeCategoryData || activeCategoryData.subCategories.length === 0}
                    >
                      <option value="">Keine</option>
                      {activeCategoryData?.subCategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.label.de}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stadt</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.city} onChange={e => setFormState({...formState, city: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vollständige Adresse (Str., PLZ, Stadt)</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.address} onChange={e => setFormState({...formState, address: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Maps URL / Koordinaten</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.mapsUrl || ''} onChange={e => setFormState({...formState, mapsUrl: e.target.value})} />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Logo (Quadratisch)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center relative group">
                        {formState.logo ? <img src={formState.logo} className="w-full h-full object-contain" /> : <ICONS.Plus className="text-gray-700" />}
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gold"><ICONS.Pencil /></button>
                      </div>
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hauptbild</label>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-24 rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center relative group">
                        {formState.image ? <img src={formState.image} className="w-full h-full object-cover" /> : <ICONS.Plus className="text-gray-700" />}
                        <button type="button" onClick={() => mainImageInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gold"><ICONS.Pencil /></button>
                      </div>
                      <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'main')} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Galerie (1-3 Bilder)</label>
                  <div className="flex gap-4 flex-wrap">
                    {formState.gallery?.map((img, i) => (
                      <div key={i} className="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => {
                          const g = [...(formState.gallery || [])]; g.splice(i, 1); setFormState({...formState, gallery: g});
                        }} className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><ICONS.Trash2 /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-32 h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 hover:text-gold transition-all">
                      <ICONS.Plus />
                    </button>
                    <input type="file" ref={galleryInputRef} className="hidden" multiple accept="image/*" onChange={e => handleImageUpload(e, 'gallery')} />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Business Details</h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex justify-between">
                      <span>Kurzbeschreibung (max 300)</span>
                      <span>{formState.description.length}/300</span>
                    </label>
                    <textarea maxLength={300} rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Besonderheiten / Specialties</label>
                    <textarea rows={2} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.features || ''} onChange={e => setFormState({...formState, features: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Öffnungszeiten</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DAYS.map(d => (
                      <div key={d.id} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                        <p className="text-[9px] font-black text-gold uppercase mb-2">{d.label}</p>
                        <input className="w-full bg-transparent text-white text-xs outline-none border-b border-white/10 focus:border-gold" value={tempHours[d.id] || ''} onChange={e => setTempHours({...tempHours, [d.id]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Kontakt & Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Telefon</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">WhatsApp (+49...)</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.whatsapp || ''} onChange={e => setFormState({...formState, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Email</label>
                    <input type="email" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.email || ''} onChange={e => setFormState({...formState, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Webseite</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.website || ''} onChange={e => setFormState({...formState, website: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Instagram</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.socialMedia?.instagram || ''} onChange={e => setFormState({...formState, socialMedia: {...(formState.socialMedia || {}), instagram: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Facebook</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.socialMedia?.facebook || ''} onChange={e => setFormState({...formState, socialMedia: {...(formState.socialMedia || {}), facebook: e.target.value}})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TikTok</label>
                    <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.socialMedia?.tiktok || ''} onChange={e => setFormState({...formState, socialMedia: {...(formState.socialMedia || {}), tiktok: e.target.value}})} />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Admin</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Paket</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.tier} onChange={e => setFormState({...formState, tier: e.target.value as PricingTier})}>
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Approval</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.approvalStatus} onChange={e => setFormState({...formState, approvalStatus: e.target.value as ApprovalStatus, isApproved: e.target.value === 'active'})}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payment</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.paymentStatus} onChange={e => setFormState({...formState, paymentStatus: e.target.value as PaymentStatus})}>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gültig bis</label>
                    <input type="date" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.validUntil || ''} onChange={e => setFormState({...formState, validUntil: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rating Override (Manuell)</label>
                    <input type="number" step="0.1" min="0" max="5" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.rating} onChange={e => setFormState({...formState, rating: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Review Count Override (Manuell)</label>
                    <input type="number" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={formState.reviewCount} onChange={e => setFormState({...formState, reviewCount: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Filter Attribute / Tags (Komma getrennt)</label>
                  <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" placeholder="vegan, parking, family friendly" value={formState.attributes?.join(', ') || ''} onChange={e => setFormState({...formState, attributes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-gold font-playfair font-bold text-xl border-b border-gold/10 pb-2">Bewertungen verwalten</h4>
                {formState.reviews && formState.reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {formState.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start justify-between group/rev">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-sm">{rev.userName}</span>
                            <div className="flex items-center gap-1">
                              <ICONS.Star className="w-3 h-3 text-gold fill-gold" />
                              <span className="text-gold font-bold text-xs">{rev.rating}</span>
                            </div>
                            <span className="text-gray-600 text-[10px] uppercase tracking-wider">{rev.date}</span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-3 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover/rev:opacity-100"
                        >
                          <ICONS.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">Keine Bewertungen vorhanden</p>
                  </div>
                )}
              </section>

              <div className="flex gap-4 pt-10 sticky bottom-0 bg-black/95 py-6 border-t border-white/10">
                <button type="submit" className="flex-grow py-5 bg-gold text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl">Eintrag speichern</button>
                <button type="button" onClick={() => { setEditingProvider(null); setIsAddingNew(false); }} className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10">Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
