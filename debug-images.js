// Debug-Script für Bilder
// Führe dies in der Browser-Konsole aus (F12 -> Console)

console.log('🔍 === BILDER-DEBUG START ===');

// 1. Prüfe localStorage
const providersData = localStorage.getItem('top5_providers');
if (providersData) {
  const providers = JSON.parse(providersData);
  console.log('📦 Provider im localStorage:', providers.length);
  
  // Finde CarSkin
  const carskin = providers.find(p => p.id === 'carskin-folientechnik-bamberg' || p.name.includes('CarSkin'));
  if (carskin) {
    console.log('🚗 CarSkin Provider gefunden:', {
      name: carskin.name,
      id: carskin.id,
      image: carskin.image,
      logo: carskin.logo,
      gallery: carskin.gallery,
      galleryCount: carskin.gallery?.length || 0
    });
    
    // Prüfe ob URLs Supabase sind
    if (carskin.image) {
      console.log('📸 Hauptbild:', {
        url: carskin.image,
        isSupabase: carskin.image.includes('supabase.co'),
        isPublic: carskin.image.includes('/public/')
      });
      
      // Teste ob URL erreichbar ist
      fetch(carskin.image, { method: 'HEAD' })
        .then(response => {
          console.log('✅ Hauptbild erreichbar:', response.status, response.ok);
        })
        .catch(error => {
          console.error('❌ Hauptbild NICHT erreichbar:', error);
        });
    }
    
    if (carskin.logo) {
      console.log('🖼️ Logo:', {
        url: carskin.logo,
        isSupabase: carskin.logo.includes('supabase.co'),
        isPublic: carskin.logo.includes('/public/')
      });
    }
    
    if (carskin.gallery && carskin.gallery.length > 0) {
      console.log('🖼️ Galerie:', carskin.gallery.length, 'Bilder');
      carskin.gallery.forEach((url, idx) => {
        console.log(`  Bild ${idx}:`, {
          url,
          isSupabase: url.includes('supabase.co'),
          isPublic: url.includes('/public/')
        });
      });
    }
  } else {
    console.warn('⚠️ CarSkin Provider NICHT gefunden!');
  }
} else {
  console.warn('⚠️ Keine Provider im localStorage gefunden!');
}

// 2. Prüfe ob Supabase konfiguriert ist
if (window.supabase || window.__SUPABASE_URL__) {
  console.log('✅ Supabase Client gefunden');
} else {
  console.warn('⚠️ Supabase Client NICHT gefunden');
}

console.log('🔍 === BILDER-DEBUG ENDE ===');
console.log('');
console.log('📋 Nächste Schritte:');
console.log('1. Kopiere die URLs aus den Logs oben');
console.log('2. Öffne eine URL in einem neuen Tab');
console.log('3. Prüfe ob das Bild geladen wird');
console.log('4. Falls nicht: Bucket ist nicht öffentlich oder URL ist falsch');
