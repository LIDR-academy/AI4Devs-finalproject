export interface PortfolioItemDto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  styleSlug: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface CertificationDto {
  type: string;
  name: string;
  issuer: string;
  validUntil: string;
  isActive: boolean;
}

export interface AwardDto {
  title: string;
  eventName: string;
  year: number;
  category: string | null;
  badgeIconUrl: string | null;
}

export interface SponsorBadgeDto {
  brandName: string;
  brandLogoUrl: string;
}

export interface AvailableSlotDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface ArtistProfileDto {
  id: string;
  artistName: string;
  slug: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  yearsExperience: number;
  artistType: 'independent' | 'studio';
  commune: string;
  latitude: number;
  longitude: number;
  address: string | null;
  minSessionPrice: number;
  hourlyRate: number;
  depositPercentage: number;
  cancellationPolicy: 'hours24' | 'hours48' | 'hours72' | 'flexible';
  isCertified: boolean;
  averageRating: number;
  reviewCount: number;
  styles: string[];
  portfolioItems: PortfolioItemDto[];
  certifications: CertificationDto[];
  awards: AwardDto[];
  sponsorBadges: SponsorBadgeDto[];
  availableSlots: AvailableSlotDto[];
}

export interface ReviewDto {
  id: string;
  clientName: string;
  ratingHygiene: number;
  ratingPainManagement: number;
  ratingCustomerService: number;
  ratingResult: number;
  averageRating: number;
  comment: string | null;
  tattooPhotoUrl: string | null;
  createdAt: string;
}

export interface ReviewListResponse {
  data: ReviewDto[];
  total: number;
  page: number;
  pageSize: number;
}
