
import React from 'react';
import { 
  Utensils, Sparkles, Car, Calendar, ShoppingBag, HeartPulse, Briefcase,
  Star, MapPin, Phone, ExternalLink, Share2, Navigation, ShoppingCart, 
  Trash2, Heart, Search, Menu, X, Plus, LogIn, LayoutDashboard, Settings,
  CheckCircle, ShieldCheck, ChevronRight, Sparkle, Coffee, Sandwich, Drumstick,
  Pizza, Pencil, Instagram, Facebook, User, Globe, Clock
} from 'lucide-react';
import { Category, Provider, GastronomySubCategory } from './types';

// TikTok Icon Workaround
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const COLORS = {
  gold: '#D4AF37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A'
};

export const CATEGORIES = [
  { id: 'gastronomy', label: { de: 'Gastronomie', en: 'Dining & Drinks' }, icon: <Utensils className="w-5 h-5" /> },
  { id: 'beauty', label: { de: 'Beauty & Wellness', en: 'Beauty & Wellbeing' }, icon: <Sparkles className="w-5 h-5" /> },
  { id: 'auto', label: { de: 'Auto & Mobilität', en: 'Automotive' }, icon: <Car className="w-5 h-5" /> },
  { id: 'events', label: { de: 'Freizeit & Events', en: 'Culture & Leisure' }, icon: <Calendar className="w-5 h-5" /> },
  { id: 'shopping', label: { de: 'Shopping', en: 'Boutiques & Retail' }, icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'health', label: { de: 'Gesundheit', en: 'Medical & Health' }, icon: <HeartPulse className="w-5 h-4" /> },
  { id: 'services', label: { de: 'Dienstleistungen', en: 'Professional Services' }, icon: <Briefcase className="w-5 h-5" /> },
];

export const GASTRONOMY_SUB_CATEGORIES: { id: GastronomySubCategory, label: { de: string, en: string }, icon: React.ReactNode }[] = [
  { id: 'breakfast', label: { de: 'Frühstück', en: 'Breakfast & Brunch' }, icon: <Coffee className="w-4 h-4" /> },
  { id: 'doener', label: { de: 'Döner', en: 'Kebab Specials' }, icon: <Sandwich className="w-4 h-4" /> },
  { id: 'italian', label: { de: 'Italienisch', en: 'Italian Cuisine' }, icon: <Pizza className="w-4 h-4" /> },
  { id: 'schnitzel', label: { de: 'Schnitzel', en: 'Traditional Schnitzel' }, icon: <Drumstick className="w-4 h-4" /> },
];

export const ICONS = {
  Star, MapPin, Phone, ExternalLink, Share2, Navigation, ShoppingCart, 
  Trash2, Heart, Search, Menu, X, Plus, LogIn, LayoutDashboard, Settings,
  CheckCircle, ShieldCheck, ChevronRight, Car, Sparkle, Pencil, Instagram, Facebook, User, Briefcase, Globe, Clock, TikTok: TikTokIcon
};

export const TRANSLATIONS = {
  de: {
    slogan: 'Die begehrtesten Plätze der Stadt – sicher dir deinen',
    homeTitle: 'Top 5 in',
    citySelector: 'Stadt wählen',
    searchPlaceholder: 'Suche nach Anbietern...',
    favorites: 'Meine Favoriten',
    call: 'Anrufen',
    route: 'Route',
    recommend: 'Teilen',
    uber: 'Mit Taxi hinfahren',
    website: 'Webseite',
    reviews: 'Bewertungen',
    writeReview: 'Bewertung schreiben',
    pricing: 'Paketmodelle',
    providerReg: 'Als Anbieter registrieren',
    adminPanel: 'Admin Dashboard',
    pendingApprovals: 'Ausstehende Freigaben',
    approved: 'Freigegeben',
    rejected: 'Abgelehnt',
    save: 'Speichern',
    cancel: 'Abbrechen',
    allCities: 'Alle Städte',
    noFavs: 'Noch keine Favoriten gespeichert.',
    back: 'Zurück',
    top5: 'Top 5 Plätze',
    aiTip: 'KI Insider-Tipp',
    aiLoading: 'KI analysiert die Stadt...',
    gallery: 'Galerie',
    social: 'Social Media',
    submitReview: 'Bewertung absenden',
    reviewSuccess: 'Vielen Dank für deine Bewertung!',
    namePlaceholder: 'Dein Name',
    commentPlaceholder: 'Erzähle uns von deiner Erfahrung...'
  },
  en: {
    slogan: 'The city\'s most exclusive destinations – claim your spot',
    homeTitle: 'The Top 5 in',
    citySelector: 'Change City',
    searchPlaceholder: 'Discover exclusive venues...',
    favorites: 'My Collection',
    call: 'Call Now',
    route: 'Get Directions',
    recommend: 'Share Spot',
    uber: 'Take a Taxi',
    website: 'Visit Website',
    reviews: 'Guest Reviews',
    writeReview: 'Leave a Review',
    pricing: 'Partner Programs',
    providerReg: 'Partner with Us',
    adminPanel: 'Management Suite',
    pendingApprovals: 'Pending Approvals',
    approved: 'Approved',
    rejected: 'Declined',
    save: 'Save Changes',
    cancel: 'Discard',
    allCities: 'Everywhere',
    noFavs: 'Your collection is currently empty.',
    back: 'Return',
    top5: 'The Elite 5',
    aiTip: 'Local Expert Insight',
    aiLoading: 'AI is curating the city...',
    gallery: 'Impressions',
    social: 'Social Channels',
    submitReview: 'Post Review',
    reviewSuccess: 'Thank you for sharing your experience!',
    namePlaceholder: 'Your Name',
    commentPlaceholder: 'What made your visit special?'
  }
};

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'carskin-folientechnik-bamberg',
    name: 'CarSkin Folientechnik',
    category: 'auto',
    city: 'Bamberg',
    description: 'Ihr Spezialist für exklusive Fahrzeugfolierung, XPEL-Lackschutz und professionelle Scheibentönung in Bamberg. Wir bieten Voll- und Teilfolierung, Keramikversiegelung und Steinschlagschutz mit bis zu 10 Jahren Garantie. Ihr Fahrzeug wird bei uns zum Unikat.',
    features: 'XPEL-Lackschutz • Fahrzeugfolierung • Scheibentönung • Keramikversiegelung',
    attributes: ['Parkplatz', 'Terminvereinbarung', 'Garantie'],
    tags: ['Fahrzeugfolierung', 'Lackschutz', 'PPF', 'XPEL', 'Scheibentönung'],
    image: 'https://carskin.de/wp-content/uploads/2023/10/Slider-Carskin-Bamberg.jpg',
    gallery: [
      'https://carskin.de/wp-content/uploads/2023/10/Lackschutz-PPF-Bamberg-Portfolio.jpg',
      'https://carskin.de/wp-content/uploads/2023/10/Vollfolierung-Sportwagen-Bamberg-Referenz.jpg',
      'https://carskin.de/wp-content/uploads/2023/10/Scheibentoenung-Carskin-Bamberg-Galerie.jpg'
    ],
    socialMedia: {
      instagram: 'https://www.instagram.com/carskin.de/',
      facebook: 'https://www.facebook.com/carskin',
      tiktok: ''
    },
    website: 'https://carskin.de',
    phone: '+49 173 2682613',
    whatsapp: '+49 173 2682613',
    email: 'info@carskin.de',
    address: 'Laubanger 10, 96052 Bamberg',
    rating: 5.0,
    reviewCount: 158,
    reviews: [],
    tier: 'exclusive',
    openingHours: 'Montag: 09:00 - 16:00\nDienstag: 09:00 - 16:00\nMittwoch: 09:00 - 16:00\nDonnerstag: 09:00 - 16:00\nFreitag: 09:00 - 16:00\nSamstag: Geschlossen\nSonntag: Geschlossen',
    isApproved: true,
    approvalStatus: 'active',
    paymentStatus: 'paid',
    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    coordinates: { lat: 49.91428, lng: 10.88725 },
    mapsUrl: 'https://www.google.com/maps/place/Laubanger+10,+96052+Bamberg'
  }
];
