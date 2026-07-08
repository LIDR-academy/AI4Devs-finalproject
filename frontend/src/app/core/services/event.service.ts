import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventResponse, CreateEventRequest, UpdateEventRequest } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/events`;

  createEvent(request: CreateEventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(this.apiUrl, request);
  }

  getEvent(slug: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/${slug}`);
  }

  updateEvent(slug: string, request: UpdateEventRequest): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.apiUrl}/${slug}`, request);
  }

  deleteEvent(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${slug}`);
  }
}
