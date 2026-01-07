
import React, { useState, useRef } from 'react';
import { Language, Category, PricingTier, Provider, CategoryInfo } from '../types';
import { ICONS } from '../constants';
import { SUPABASE_STORAGE_BUCKET } from '../config';
import { supabase } from '../lib/supabaseclient';

interface ProviderRegistrationProps {
  lang: Language;
  categories: CategoryInfo[];
  onSubmit: (provider: Provider) => void;
}

const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({ lang, categories, onSubmit }) => {
  const [tier, setTier] = useState<PricingTier>('free');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState({
    logo: '',
    mainImage: '',
    gallery: [] as string[]
  });
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    // Prüfe zuerst, ob der Bucket existiert
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Fehler beim Abrufen der Buckets:', listError);
      throw new Error(`Konnte Buckets nicht abrufen: ${listError.message}`);
    }

    const bucketExists = buckets?.some(b => b.name === SUPABASE_STORAGE_BUCKET);
    if (!bucketExists) {
      const availableBuckets = buckets?.map(b => b.name).join(', ') || 'keine';
      console.error(`Bucket "${SUPABASE_STORAGE_BUCKET}" existiert nicht! Verfügbare Buckets: ${availableBuckets}`);
      throw new Error(`Bucket "${SUPABASE_STORAGE_BUCKET}" existiert nicht. Verfügbare Buckets: ${availableBuckets}`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    console.log('Upload startet:', { bucket: SUPABASE_STORAGE_BUCKET, filePath, fileName: file.name, fileSize: file.size });

    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Upload-Fehler Details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      });
      throw new Error(`Upload fehlgeschlagen: ${error.message} (Code: ${error.statusCode || 'unbekannt'})`);
    }

    console.log('Upload erfolgreich:', data);

    const { data: urlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (type === 'logo' || type === 'main') {
        const file = files[0];
        if (file) {
          const imageUrl = await uploadToSupabase(file);
          
          if (imageUrl) {
            if (type === 'logo') {
              setImages(prev => ({ ...prev, logo: imageUrl }));
            } else {
              setImages(prev => ({ ...prev, mainImage: imageUrl }));
            }
          }
        }
      } else {
        // Galerie - mehrere Bilder
        const uploadPromises = Array.from(files).map(file => uploadToSupabase(file));
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);
        
        setImages(prev => ({ ...prev, gallery: [...prev.gallery, ...validUrls] }));
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      alert(`Fehler beim Hochladen der Bilder: ${errorMessage}\n\nBitte öffne die Browser-Konsole (F12) für mehr Details.`);
    } finally {
      setUploading(false);
    }
  };

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
      image: images.mainImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      logo: images.logo || undefined,
      gallery: images.gallery,
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

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Adresse</label>
          <input required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Beschreibung</label>
          <textarea 
            rows={3}
            maxLength={300}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all resize-none" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Beschreiben Sie Ihr Unternehmen (max. 300 Zeichen)"
          />
          <p className="text-[10px] text-gray-600 text-right">{formData.description.length}/300</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Website (Optional)</label>
            <input className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Instagram (Optional)</label>
            <input className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.socialInstagram} onChange={e => setFormData({...formData, socialInstagram: e.target.value})} placeholder="@username" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Facebook (Optional)</label>
            <input className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all" value={formData.socialFacebook} onChange={e => setFormData({...formData, socialFacebook: e.target.value})} placeholder="Facebook-Seite" />
          </div>
        </div>

        {/* Bild-Upload Felder */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h3 className="text-gold font-playfair font-bold text-xl">Bilder</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Logo (Optional)</label>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => logoInputRef.current?.click()} 
                  disabled={uploading}
                  className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-gold hover:border-gold/30 transition-all bg-black/50 disabled:opacity-50"
                >
                  {uploading && !images.logo ? (
                    <span className="text-xs text-gold animate-pulse">Upload...</span>
                  ) : images.logo ? (
                    <img src={images.logo} className="w-full h-full object-cover rounded-lg" alt="Logo" />
                  ) : (
                    <>
                      <ICONS.Plus className="w-6 h-6 mb-1" />
                      <span className="text-[8px] font-bold uppercase">Logo</span>
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  disabled={uploading}
                />
                {images.logo && (
                  <button 
                    type="button"
                    onClick={() => setImages(prev => ({ ...prev, logo: '' }))} 
                    className="text-red-500 text-xs font-bold uppercase hover:underline"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>

            {/* Hauptbild Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Hauptbild (Optional)</label>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()} 
                  disabled={uploading}
                  className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-gold hover:border-gold/30 transition-all bg-black/50 disabled:opacity-50"
                >
                  {uploading && !images.mainImage ? (
                    <span className="text-xs text-gold animate-pulse">Upload...</span>
                  ) : images.mainImage ? (
                    <img src={images.mainImage} className="w-full h-full object-cover rounded-lg" alt="Hauptbild" />
                  ) : (
                    <>
                      <ICONS.Plus className="w-6 h-6 mb-1" />
                      <span className="text-[8px] font-bold uppercase">Bild</span>
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={mainImageInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'main')}
                  disabled={uploading}
                />
                {images.mainImage && (
                  <button 
                    type="button"
                    onClick={() => setImages(prev => ({ ...prev, mainImage: '' }))} 
                    className="text-red-500 text-xs font-bold uppercase hover:underline"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Galerie Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Galerie (Optional, mehrere Bilder)</label>
            <div className="flex items-start gap-4">
              <button 
                type="button"
                onClick={() => galleryInputRef.current?.click()} 
                disabled={uploading}
                className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-gold hover:border-gold/30 transition-all bg-black/50 disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-xs text-gold animate-pulse">Upload...</span>
                ) : (
                  <>
                    <ICONS.Plus className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-bold uppercase">Hinzufügen</span>
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={galleryInputRef} 
                className="hidden" 
                accept="image/*" 
                multiple
                onChange={(e) => handleImageUpload(e, 'gallery')}
                disabled={uploading}
              />
              <div className="flex-1 grid grid-cols-4 gap-2">
                {images.gallery.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} className="w-full h-24 object-cover rounded-lg" alt={`Galerie ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => setImages(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          className="w-full py-4 bg-gold text-black font-bold rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Bilder werden hochgeladen...' : 'Registrierung einreichen'}
        </button>
      </form>
    </div>
  );
};

export default ProviderRegistration;
