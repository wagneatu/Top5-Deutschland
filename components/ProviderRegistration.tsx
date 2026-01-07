
import React, { useState } from 'react';
import { Language, Category, PricingTier, Provider, CategoryInfo } from '../types';
import { ICONS } from '../constants';

interface ProviderRegistrationProps {
  lang: Language;
  categories: CategoryInfo[];
  onSubmit: (provider: Provider) => void;
}

const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({ lang, categories, onSubmit }) => {
  const [tier, setTier] = useState<PricingTier>('free');
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0]?.id || '',
    city: 'Bamberg',
    description: '',
    address: '',
    phone: '',
    website: '',
    socialInstagram: '',
    socialFacebook: ''
  });

  const tiers = [
    { id: 'free', name: 'Free', price: '0€', features: ['Basis Eintrag', 'Kategorie'] },
    { id: 'basic', name: 'Basic', price: '19€', features: ['Logo & Link', 'Social Media'] },
    { id: 'premium', name: 'Premium', price: '49€', features: ['Bilder-Galerie', 'Maps Integration', 'Beschreibung'] },
    { id: 'exclusive', name: 'Exclusive', price: '99€', features: ['Top 5 Platzierung', 'Ads Support', 'Priority Boost'] }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProvider: Provider = {
      name: formData.name,
      category: formData.category,
      city: formData.city,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      website: formData.website,
      socialMedia: {
        instagram: formData.socialInstagram,
        facebook: formData.socialFacebook
      },
      id: Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviewCount: 0,
      tier,
      openingHours: '09:00 - 18:00',
      isApproved: false,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      gallery: [],
      coordinates: { lat: 49.89, lng: 10.89 }
    };
    onSubmit(newProvider);
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-playfair font-bold text-gold mb-3">Werde Teil der Top 5</h1>
        <p className="text-gray-400">Präsentieren Sie Ihr Unternehmen den Suchenden Ihrer Stadt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {tiers.map((t) => (
          <div 
            key={t.id}
            onClick={() => setTier(t.id as PricingTier)}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${tier === t.id ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10 bg-[#111]'}`}
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">{t.name}</p>
            <p className="text-2xl font-playfair font-bold text-white mb-4">{t.price}<span className="text-sm font-light text-gray-400">/Monat</span></p>
            <ul className="space-y-2">
              {t.features.map(f => (
                <li key={f} className="text-[10px] text-gray-400 flex items-center gap-2">
                  <ICONS.CheckCircle className={`w-3 h-3 ${tier === t.id ? 'text-gold' : 'text-gray-700'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Unternehmen Name</label>
            <input required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Kategorie</label>
            <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} > 
              {categories.map(c => <option key={c.id} value={c.id}>{c.label[lang]}</option>)} 
            </select>
          </div>
          {/* ... andere Felder bleiben gleich ... */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Stadt</label>
            <input required readOnly className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed outline-none transition-all" value={formData.city} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Telefon</label>
            <input required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-gold text-black font-bold rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.2)]">Registrierung einreichen</button>
      </form>
    </div>
  );
};

export default ProviderRegistration;
