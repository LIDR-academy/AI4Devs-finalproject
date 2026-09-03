export interface DiscoveryInput {
  businessName: string;
  category: string;
  services: string[];
  products?: string[];
  targetAudience: string;
  tone: string;
  style?: string;
  location: string;
  phone?: string;
  website?: string;
  gdprConsent: boolean;
}

export interface NormalizedProfileData {
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
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function cleanList(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map(clean).filter(Boolean))];
}

export function normalizeDiscovery(input: DiscoveryInput): NormalizedProfileData {
  return {
    businessName: clean(input.businessName),
    category: clean(input.category),
    services: cleanList(input.services),
    products: cleanList(input.products),
    targetAudience: clean(input.targetAudience),
    tone: clean(input.tone),
    style: input.style ? clean(input.style) : null,
    location: clean(input.location),
    phone: input.phone ? clean(input.phone) : null,
    website: input.website ? input.website.trim() : null,
    gdprConsent: input.gdprConsent,
  };
}
