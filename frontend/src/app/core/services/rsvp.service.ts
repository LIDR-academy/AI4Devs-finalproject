import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExistingRsvpDto {
  attendance: 'Yes' | 'No' | 'Maybe';
  dietaryRestrictions?: string;
  needsTransport: boolean;
  bringingPlusOne: boolean;
  plusOneName?: string;
  personalMessage?: string;
}

export interface RsvpInfoResponse {
  guestName: string;
  eventName: string;
  coupleNames: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  existingRsvp?: ExistingRsvpDto;
  deadlinePassed: boolean;
}

export interface SubmitRsvpRequest {
  attendance: 'Yes' | 'No' | 'Maybe';
  dietaryRestrictions?: string;
  needsTransport: boolean;
  bringingPlusOne: boolean;
  plusOneName?: string;
  personalMessage?: string;
}

export interface RsvpConfirmationResponse {
  confirmationId: string;
  guestName: string;
  attendance: 'Yes' | 'No' | 'Maybe';
  eventName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  constructor(private http: HttpClient) {}

  getRsvpInfo(token: string): Observable<RsvpInfoResponse> {
    return this.http.get<RsvpInfoResponse>(`/api/rsvp/${token}`);
  }

  submitRsvp(token: string, request: SubmitRsvpRequest): Observable<RsvpConfirmationResponse> {
    return this.http.post<RsvpConfirmationResponse>(`/api/rsvp/${token}`, request);
  }
}
