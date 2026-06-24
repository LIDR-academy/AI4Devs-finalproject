// Shared API types for StayHub frontend.
//
// These mirror the OpenAPI contracts in
// specs/001-guest-search-booking/contracts/ verbatim — field names are
// snake_case to match the wire format, so responses can be consumed without
// remapping. UUIDs are strings; dates are ISO strings ("YYYY-MM-DD" for dates,
// RFC 3339 for date-times).

export type UUID = string;
/** ISO date, "YYYY-MM-DD". */
export type IsoDate = string;
/** RFC 3339 date-time. */
export type IsoDateTime = string;

export type PropertyType = "apartment" | "house" | "villa" | "cabin" | "studio";

export type SortOrder = "relevance" | "price_asc" | "price_desc" | "rating";

export type UnavailableReason = "booked" | "blocked" | "held";

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export type TripStatusFilter = "upcoming" | "past" | "cancelled" | "all";

export type RefundStatus = "full_refund" | "no_refund";

// --- Shared building blocks -------------------------------------------------

export interface Pagination {
  page: number;
  size: number;
  total_results: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: Pagination;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
  region?: string | null;
  country: string;
  address: string;
}

export interface PropertyPhoto {
  url: string;
  caption: string;
}

export interface Host {
  id: UUID;
  first_name: string;
  avatar_url?: string | null;
  is_verified: boolean;
}

// --- Search -----------------------------------------------------------------

export interface SearchFilters {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
  check_in: IsoDate;
  check_out: IsoDate;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: PropertyType;
  bedrooms?: number;
  amenities?: string[];
  sort?: SortOrder;
  page?: number;
  size?: number;
}

export interface PropertySummary {
  id: UUID;
  title: string;
  photo_url: string;
  nightly_rate_eur: number;
  cleaning_fee_eur?: number;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  avg_rating?: number | null;
  review_count: number;
  property_type: string;
  max_guests: number;
  bedrooms?: number;
}

export type SearchResultsResponse = PaginatedResponse<PropertySummary>;

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  bbox?: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
  };
}

export interface GeocodeResponse {
  results: GeocodeResult[];
}

// --- Property details -------------------------------------------------------

export interface Property {
  id: UUID;
  title: string;
  description: string;
  property_type: PropertyType;
  location: GeoLocation;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  nightly_rate_eur: number;
  cleaning_fee_eur: number;
  amenities: string[];
  house_rules: string[];
  photos: PropertyPhoto[];
  host: Host;
  avg_rating?: number | null;
  review_count: number;
}

export interface UnavailableDate {
  date: IsoDate;
  reason: UnavailableReason;
}

export interface AvailabilityResponse {
  property_id: UUID;
  unavailable_dates: UnavailableDate[];
}

export interface Review {
  id: UUID;
  guest_name: string;
  guest_avatar_url?: string | null;
  rating: number;
  comment?: string | null;
  created_at: IsoDateTime;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
  avg_rating: number;
  total_reviews: number;
}

// --- Pricing ----------------------------------------------------------------

export interface PriceBreakdown {
  nights: number;
  nightly_rate_eur: number;
  subtotal_eur: number;
  cleaning_fee_eur: number;
  service_fee_eur: number;
  tax_eur: number;
  total_eur: number;
}

export interface PriceBreakdownResponse extends PriceBreakdown {
  property_id: UUID;
  check_in: IsoDate;
  check_out: IsoDate;
}

// --- Bookings ---------------------------------------------------------------

export interface CreateBookingRequest {
  property_id: UUID;
  check_in: IsoDate;
  check_out: IsoDate;
  guest_count: number;
}

export interface CreateBookingResponse {
  booking_id: UUID;
  reference_number: string;
  price_breakdown: PriceBreakdown;
  stripe_client_secret: string;
  hold_expires_at: IsoDateTime;
}

export interface BookingPropertyRef {
  id: UUID;
  title: string;
  photo_url: string;
  city: string;
  country: string;
  address?: string;
  host_name?: string;
}

export interface BookingDetailResponse {
  id: UUID;
  reference_number: string;
  property: BookingPropertyRef;
  check_in: IsoDate;
  check_out: IsoDate;
  guest_count: number;
  status: BookingStatus;
  price_breakdown: PriceBreakdown;
  cancellation_policy?: string;
  can_cancel?: boolean;
  refund_amount_eur?: number | null;
  created_at: IsoDateTime;
}

export interface CancellationResponse {
  booking_id: UUID;
  status: "cancelled";
  refund_amount_eur: number;
  refund_status: RefundStatus;
}

export interface BookingSummary {
  id: UUID;
  reference_number: string;
  property_title: string;
  property_photo_url: string;
  city: string;
  check_in: IsoDate;
  check_out: IsoDate;
  status: BookingStatus;
  total_eur: number;
}

export interface MyTripsResponse {
  bookings: BookingSummary[];
  pagination: Pagination;
}
