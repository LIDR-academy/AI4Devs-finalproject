// US0008 — Weekly availability and slot hold

export interface BookableSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
}

export interface WeekAvailabilityResponse {
  weekStart: string; // YYYY-MM-DD (Monday)
  slots: BookableSlot[];
}

export interface BookingHoldRequest {
  artistProfileId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface BookingArtistSummary {
  artistProfileId: string;
  artistName: string;
  slug: string;
  profilePhotoUrl: string | null;
}

export interface PaymentCreateResponse {
  paymentUrl: string;
  token: string;
}

export interface MockOutcomeResponse {
  returnUrl: string;
}

export interface BookingListResponse {
  data: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Booking {
  id: string;
  clientId: string;
  artist: BookingArtistSummary;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  depositAmount: number;
  bodyZone?: string | null;
  sizeReference?: string | null;
  styleName?: string | null;
  hasReview?: boolean;
  notes: string | null;
  createdAt: string;
  expiresAt: string | null;
}

// US0013 — Post-session review

export interface ReviewRequest {
  ratingHygiene: number;
  ratingPainManagement: number;
  ratingCustomerService: number;
  ratingResult: number;
  comment?: string | null;
  tattooPhotoUrl?: string | null;
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
