export interface SponsorBadge {
  brandName: string;
  brandLogoUrl: string | null;
}

export interface ArtistCard {
  id: string;
  artistName: string;
  slug: string;
  profilePhotoUrl: string | null;
  featuredImageUrl?: string | null;
  bio: string | null;
  styles: string[];
  artistType: 'independent' | 'studio';
  commune: string;
  latitude: number;
  longitude: number;
  minSessionPrice: number;
  hourlyRate: number;
  isCertified: boolean;
  hasAwards?: boolean;
  averageRating: number;
  reviewCount: number;
  sponsorBadges: SponsorBadge[];
}

export interface ShowcaseItem {
  imageUrl: string;
  thumbnailUrl: string | null;
  style: string;
  artist: ArtistCard;
}

export interface ShowcaseSection {
  key: 'near_you' | 'top_rated' | 'popular_styles' | 'awarded_artists';
  title: string;
  items: ShowcaseItem[];
}

export interface ShowcaseResponse {
  sections: ShowcaseSection[];
}
