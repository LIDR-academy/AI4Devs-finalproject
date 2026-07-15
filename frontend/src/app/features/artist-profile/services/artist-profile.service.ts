import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ArtistProfileDto, ReviewListResponse } from '../../../core/models/artist-profile.models';

@Injectable({ providedIn: 'root' })
export class ArtistProfileService {
  private readonly http = inject(HttpClient);

  getArtistProfile(slug: string): Observable<ArtistProfileDto> {
    return this.http.get<ArtistProfileDto>(`${environment.apiUrl}/artists/${slug}`);
  }

  getArtistReviews(slug: string, page: number, pageSize: number): Observable<ReviewListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ReviewListResponse>(`${environment.apiUrl}/artists/${slug}/reviews`, { params });
  }
}
