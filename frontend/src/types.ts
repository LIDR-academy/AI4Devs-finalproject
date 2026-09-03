export type ProfileStatus = 'DRAFT' | 'NORMALIZED' | 'APPROVED';

export type AssetType =
  | 'BUSINESS_SUMMARY'
  | 'WEBSITE_CONTENT'
  | 'GOOGLE_BUSINESS_DESCRIPTION'
  | 'SOCIAL_MEDIA_BIO'
  | 'FAQ';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Business {
  id: string;
  name: string;
  businessProfile?: BusinessProfile | null;
}

export interface BusinessProfile {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  services: string[];
  products: string[];
  targetAudience: string;
  tone: string;
  style: string | null;
  location: string;
  phone: string | null;
  website: string | null;
  gdprConsent: boolean;
  status: ProfileStatus;
}

export interface Asset {
  id: string;
  businessProfileId: string;
  assetType: AssetType;
  title: string;
  content: string;
  status: 'READY_FOR_REVIEW' | 'EDITED';
}

export interface DiscoveryForm {
  businessName: string;
  category: string;
  services: string;
  products: string;
  targetAudience: string;
  tone: string;
  style: string;
  location: string;
  phone: string;
  website: string;
  gdprConsent: boolean;
}
