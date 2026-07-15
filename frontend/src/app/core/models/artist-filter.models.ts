import { ArtistCard } from './showcase.models';

export interface ArtistFilters {
  styles?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  certified?: boolean;
  available?: boolean;
  type?: 'independent' | 'studio' | null;
  search?: string;
  page: number;
  pageSize: number;
}

export interface ArtistSuggestionsResponse {
  styles: string[];
  communes: string[];
}

export interface ArtistListResponse {
  data: ArtistCard[];
  total: number;
  page: number;
  pageSize: number;
}

export const TATTOO_STYLES = [
  { slug: 'realismo', name: 'Realismo' },
  { slug: 'tradicional', name: 'Tradicional' },
  { slug: 'blackwork', name: 'Blackwork' },
  { slug: 'fine-line', name: 'Fine Line' },
  { slug: 'japones', name: 'Japonés' },
  { slug: 'lettering', name: 'Lettering' },
  { slug: 'neotradicional', name: 'Neotradicional' },
  { slug: 'acuarela', name: 'Acuarela' },
  { slug: 'geometrico', name: 'Geométrico' },
  { slug: 'minimalista', name: 'Minimalista' },
  { slug: 'dotwork', name: 'Dotwork' },
  { slug: 'tribal', name: 'Tribal' }
] as const;
