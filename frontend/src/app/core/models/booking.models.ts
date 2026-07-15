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
  notes: string | null;
  createdAt: string;
  expiresAt: string | null;
}
