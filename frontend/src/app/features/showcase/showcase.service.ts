import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShowcaseResponse } from '../../core/models/showcase.models';

@Injectable({ providedIn: 'root' })
export class ShowcaseService {
  private readonly http = inject(HttpClient);

  getShowcase(lat?: number | null, lng?: number | null): Observable<ShowcaseResponse> {
    let params = new HttpParams();
    if (lat != null && lng != null) {
      params = params.set('lat', lat.toString()).set('lng', lng.toString());
    }
    return this.http.get<ShowcaseResponse>(`${environment.apiUrl}/showcase`, { params });
  }
}
