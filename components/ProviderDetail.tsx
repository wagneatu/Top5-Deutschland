
import React, { useState, useMemo, useRef } from 'react';
import { Provider, Language, Review } from '../types';
import { ICONS, TRANSLATIONS } from '../constants';
import { SUPABASE_STORAGE_BUCKET } from '../config';
import { supabase } from '../lib/supabaseclient';

interface ProviderDetailProps {
  provider: Provider;
  lang: Language;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ 
  provider, lang, onBack, isFavorite, onToggleFavorite, onAddReview 
}) => {
  const t = TRANSLATIONS[lang];
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '', image: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatUrl = (url: string | undefined) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file);

      if (error) {
        throw new Error(error.message);
      }

      const { data: urlData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      setNewReview(prev => ({ ...prev, image: urlData.publicUrl }));
    } catch (error) {
      console.error('Upload-Fehler:', error);
      alert('Fehler beim Hochladen des Bildes. Bitte versuche es erneut.');
    } finally {
      setUploadingImage(false);
    }
  };

  const openingHoursInfo = useMemo(() => {
    const hours = provider.openingHours || '';
    const lines = hours.split('\n').filter(line => line.trim() !== '');
    const todayLabel = new Date().toLocaleDateString('de-DE', { weekday: 'long' });
    const todayLine = lines.find(line => line.startsWith(todayLabel)) || lines[0] || 'Keine Angabe';
    return { todayLine, allLines: lines };
  }, [provider.openingHours]);

  const communityImages = useMemo(() => {
    return (provider.reviews || []).filter(r => r.image).map(r => r.image as string);
  }, [provider.reviews]);

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors">
          <ICONS.ChevronRight className="rotate-180 w-5 h-5" />
          <span>{t.back}</span>
        </button>
        <button onClick={onToggleFavorite} className={`p-3 bg-white/5 rounded-full border border-white/10 ${isFavorite ? 'text-gold' : 'text-white'}`}>
          <ICONS.Heart className={`w-5 h-5 ${isFavorite ? 'fill-gold' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
            {provider.image && <img src={provider.image} className="w-full h-full object-cover" />}
            {provider.logo && (
              <div className="absolute top-4 left-4 w-16 h-16 bg-black p-2 rounded-2xl border border-gold/30 shadow-2xl">
                <img src={provider.logo} className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white">{provider.name}</h1>
            
            {provider.attributes && provider.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {provider.attributes.map(attr => (
                  <span key={attr} className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase border border-gold/20 rounded-full tracking-wider">
                    {attr}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-300 text-lg leading-relaxed italic border-l-2 border-gold/30 pl-6">
              {provider.description}
            </p>

            {provider.features && (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h4 className="text-gold font-bold text-[10px] uppercase tracking-widest mb-3">Besonderheiten</h4>
                <p className="text-gray-400 text-sm">{provider.features}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-playfair font-bold text-gold">Galerie</h3>
              <div className="grid grid-cols-3 gap-4">
                {(provider.gallery && provider.gallery.length > 0) ? (
                  provider.gallery.map((img, idx) => (
                    <img key={idx} src={img} className="aspect-square rounded-2xl object-cover border border-white/5 hover:scale-105 transition-transform duration-500 cursor-zoom-in shadow-lg bg-zinc-900" />
                  ))
                ) : (
                  [1,2,3].map(i => <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5" />)
                )}
              </div>
            </div>

            {communityImages.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-playfair font-bold text-white">Community Impressionen</h3>
                  <span className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full border border-gold/20 font-bold uppercase">Live</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {communityImages.map((img, idx) => (
                    <div key={idx} className="shrink-0 w-40 h-40 rounded-2xl overflow-hidden border border-white/10 shadow-xl group/ci">
                      <img src={img} className="w-full h-full object-cover group-hover/ci:scale-110 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bewertungen Section matches screenshot layout */}
          <div className="space-y-8 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-playfair font-bold text-white">Bewertungen ({provider.reviewCount})</h3>
               <button 
                onClick={() => setShowReviewForm(!showReviewForm)} 
                className="bg-transparent text-gold border border-gold/40 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gold hover:text-black transition-all flex items-center gap-2"
               >
                 <ICONS.Pencil className="w-3 h-3" />
                 {t.writeReview}
               </button>
            </div>

            {showReviewForm && (
              <div className="bg-[#111] p-8 rounded-3xl border border-gold/20 animate-slideDown space-y-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] text-gray-500 font-bold uppercase">{t.namePlaceholder}</label>
                     <input className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={newReview.userName} onChange={e => setNewReview({...newReview, userName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] text-gray-500 font-bold uppercase">Bewertung</label>
                     <div className="flex gap-2">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setNewReview({...newReview, rating: s})} className={`p-2 rounded-lg border transition-all ${newReview.rating >= s ? 'bg-gold/10 border-gold/40 text-gold' : 'border-white/5 text-gray-600'}`}>
                            <ICONS.Star className={`w-5 h-5 ${newReview.rating >= s ? 'fill-gold' : ''}`} />
                          </button>
                        ))}
                     </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">{t.commentPlaceholder}</label>
                  <textarea rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Foto hinzufügen (Optional)</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={uploadingImage}
                      className="w-24 h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600 hover:text-gold hover:border-gold/30 transition-all bg-black group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <div className="text-gold text-xs font-bold uppercase animate-pulse">
                          Upload...
                        </div>
                      ) : newReview.image ? (
                        <img src={newReview.image} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <ICONS.Plus className="w-6 h-6 mb-1" />
                          <span className="text-[8px] font-bold uppercase">Upload</span>
                        </>
                      )}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    {newReview.image && !uploadingImage && (
                      <button onClick={() => setNewReview({...newReview, image: ''})} className="text-red-500 text-xs font-bold uppercase hover:underline">Entfernen</button>
                    )}
                  </div>
                </div>

                <button onClick={() => { onAddReview(newReview); setShowReviewForm(false); setNewReview({userName:'', rating:5, comment:'', image:''}) }} className="w-full bg-gold text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:brightness-110 transition-all">
                  {t.submitReview}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {provider.reviews && provider.reviews.length > 0 ? (
                provider.reviews.map(rev => (
                  <div key={rev.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                           {rev.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="text-white font-bold text-sm">{rev.userName}</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider">{rev.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <ICONS.Star key={s} className={`w-3 h-3 ${rev.rating >= s ? 'text-gold fill-gold' : 'text-gray-800'}`} />)}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      {rev.image && (
                        <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <img src={rev.image} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-gray-400 text-sm italic leading-relaxed">"{rev.comment}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-600 italic">Noch keine Bewertungen vorhanden.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111] p-8 rounded-3xl border border-white/10 space-y-8 sticky top-24 shadow-2xl">
            <h3 className="text-xl font-playfair font-bold text-gold">Informationen</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <ICONS.Briefcase className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <p className="text-white text-sm font-bold">{provider.name}</p>
              </div>
              <div className="flex items-start gap-4">
                <ICONS.MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <p className="text-white text-sm">{provider.address}</p>
              </div>
              <div className="flex items-start gap-4">
                <ICONS.Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <button 
                    onClick={() => setShowAllHours(!showAllHours)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <p className="text-white text-sm font-semibold">{openingHoursInfo.todayLine}</p>
                    <ICONS.ChevronRight className={`w-4 h-4 text-gold/60 transition-transform duration-300 ${showAllHours ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showAllHours && (
                    <div className="mt-4 space-y-2 pt-4 border-t border-white/5 animate-slideDown overflow-hidden">
                      {openingHoursInfo.allLines.map((line, idx) => (
                        <p key={idx} className={`text-[11px] leading-relaxed ${line.startsWith(new Date().toLocaleDateString('de-DE', { weekday: 'long' })) ? 'text-gold font-bold' : 'text-gray-400'}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/5">
               {provider.website && (
                 <a href={formatUrl(provider.website)} target="_blank" className="flex-1 flex items-center justify-center p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl border border-white/10 transition-all shadow-md">
                   <ICONS.Globe className="w-4 h-4" />
                 </a>
               )}
               {provider.socialMedia?.instagram && (
                 <a href={formatUrl(provider.socialMedia.instagram)} target="_blank" className="flex-1 flex items-center justify-center p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl border border-white/10 transition-all shadow-md">
                   <ICONS.Instagram className="w-4 h-4" />
                 </a>
               )}
               {provider.socialMedia?.facebook && (
                 <a href={formatUrl(provider.socialMedia.facebook)} target="_blank" className="flex-1 flex items-center justify-center p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl border border-white/10 transition-all shadow-md">
                   <ICONS.Facebook className="w-4 h-4" />
                 </a>
               )}
               {provider.socialMedia?.tiktok && (
                 <a href={formatUrl(provider.socialMedia.tiktok)} target="_blank" className="flex-1 flex items-center justify-center p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl border border-white/10 transition-all shadow-md">
                   <ICONS.TikTok className="w-4 h-4" />
                 </a>
               )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
              <a href={`tel:${provider.phone}`} className="w-full flex items-center justify-center gap-3 bg-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:brightness-110 transition-all">
                <ICONS.Phone className="w-4 h-4" />
                <span>{t.call}</span>
              </a>
              {provider.whatsapp && (
                <a href={`https://wa.me/${provider.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" className="w-full flex items-center justify-center gap-3 bg-green-600/10 text-green-500 border border-green-600/30 py-4 rounded-2xl font-bold text-[10px] uppercase transition-all hover:bg-green-600 hover:text-white shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>WhatsApp</span>
                </a>
              )}
              <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provider.address)}`, '_blank')} className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold text-[10px] uppercase shadow-md hover:bg-white/10 transition-all">
                <ICONS.Navigation className="w-4 h-4 text-gold" />
                <span>{t.route}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetail;
