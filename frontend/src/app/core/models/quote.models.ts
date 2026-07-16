// US0011 — Chatbot price estimation

export interface TattooStyleOption {
  id: string;
  name: string;
  slug: string;
}

export interface QuoteRequest {
  artistProfileId: string;
  bodyZone: string;
  sizeReference: string; // coin | palm | hand | arm
  styleId: string;
  isColor: boolean;
  isCoverup: boolean;
}

export interface QuoteResponse {
  priceMin: number;
  priceMax: number;
  currency: string;
  depositAmount: number;
  factors: string[];
}

/** Quote kept after closing the chatbot; feeds the hold when the client books (CA7-CA8). */
export interface QuoteDraft {
  request: QuoteRequest;
  quote: QuoteResponse;
  savedAt: string; // ISO datetime
}

export interface BodyZoneOption {
  slug: string;
  label: string;
  difficult: boolean;
}

export interface SizeOption {
  slug: string; // canonical sizeReference (api-spec)
  label: string;
  icon: string;
}

export const BODY_ZONES: BodyZoneOption[] = [
  { slug: 'brazo', label: 'Brazo', difficult: false },
  { slug: 'antebrazo', label: 'Antebrazo', difficult: false },
  { slug: 'muñeca', label: 'Muñeca', difficult: false },
  { slug: 'pierna', label: 'Pierna', difficult: false },
  { slug: 'tobillo', label: 'Tobillo', difficult: false },
  { slug: 'espalda', label: 'Espalda', difficult: false },
  { slug: 'pecho', label: 'Pecho', difficult: false },
  { slug: 'costillas', label: 'Costillas', difficult: true },
  { slug: 'cuello', label: 'Cuello', difficult: true },
  { slug: 'manos', label: 'Manos', difficult: true }
];

export const SIZE_OPTIONS: SizeOption[] = [
  { slug: 'coin', label: 'Moneda (~3 cm)', icon: '🪙' },
  { slug: 'palm', label: 'Palma (~10 cm)', icon: '✋' },
  { slug: 'hand', label: 'Mano completa (~20 cm)', icon: '🖐' },
  { slug: 'arm', label: 'Brazo completo (30+ cm)', icon: '💪' }
];
