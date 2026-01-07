
export type Role = 'visitor' | 'provider' | 'admin';

export type Language = 'de' | 'en';

export type Category = string;

export type GastronomySubCategory = string;

export type PricingTier = 'free' | 'basic' | 'premium' | 'exclusive';

export type PaymentStatus = 'paid' | 'unpaid' | 'pending';

export type ApprovalStatus = 'active' | 'pending' | 'expired';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  image?: string; 
}

export interface CategoryInfo {
  id: string;
  label: { de: string; en: string };
  iconName: string;
  subCategories: { id: string; label: { de: string; en: string } }[];
}

export interface Provider {
  id: string;
  name: string;
  category: Category;
  subCategory?: GastronomySubCategory;
  city: string;
  description: string; // Max 300 chars
  features?: string; // Specialties / Features
  attributes?: string[]; // e.g., ["vegan", "parking", "family friendly"]
  tags?: string[]; // Keywords
  logo?: string;
  image?: string; // Main image
  gallery?: string[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  website?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  tier: PricingTier;
  openingHours: string;
  isApproved: boolean;
  approvalStatus?: ApprovalStatus;
  paymentStatus?: PaymentStatus;
  validUntil?: string;
  coordinates: { lat: number; lng: number };
  mapsUrl?: string;
  promotionalOffer?: string;
}

export interface City {
  name: string;
  region: string;
}
