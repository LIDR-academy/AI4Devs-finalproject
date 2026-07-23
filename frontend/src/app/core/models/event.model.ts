export interface EventResponse {
  id: string;
  name: string;
  slug: string;
  templateId?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  heroImageUrl?: string;
  coupleNames: string;
  eventDate: string;
  eventEndDate: string;
  venueName: string;
  venueAddress: string;
  status: string;
  guestCount: number;
  pendingRsvps: number;
  confirmedRsvps: number;
  declinedRsvps: number;
  thankYouMessage?: string;
  photoGalleryUrl?: string;
}

export interface CreateEventRequest {
  name: string;
  templateId?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  coupleNames: string;
  eventDate: string;
  eventEndDate?: string;
  venueName: string;
  venueAddress: string;
}

export interface UpdateEventRequest {
  name: string;
  templateId?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  heroImageUrl?: string;
  coupleNames: string;
  eventDate: string;
  eventEndDate?: string;
  venueName: string;
  venueAddress: string;
  status?: string;
  thankYouMessage?: string;
  photoGalleryUrl?: string;
}
