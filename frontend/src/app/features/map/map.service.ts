import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtistListResponse, GeoFilters } from '../../core/models/artist-filter.models';

const DEFAULT_RADIUS_KM = 10;

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly http = inject(HttpClient);
  private requestSubscription: Subscription | null = null;

  readonly artists = signal<ArtistListResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadArtistsByLocation(filters: GeoFilters): void {
    this.requestSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildParams(filters);
    this.requestSubscription = this.http
      .get<ArtistListResponse>(`${environment.apiUrl}/artists/geo`, { params })
      .subscribe({
        next: (response) => {
          this.artists.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los artistas.');
          this.loading.set(false);
        }
      });
  }

  private buildParams(filters: GeoFilters): HttpParams {
    let params = new HttpParams()
      .set('lat', filters.lat.toString())
      .set('lng', filters.lng.toString())
      .set('radiusKm', (filters.radiusKm ?? DEFAULT_RADIUS_KM).toString());

    if (filters.styles && filters.styles.length > 0) {
      filters.styles.forEach((s) => {
        params = params.append('styles', s);
      });
    }

    if (filters.minPrice != null && filters.minPrice > 0) {
      params = params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice != null && filters.maxPrice > 0) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.minRating != null) {
      params = params.set('minRating', filters.minRating.toString());
    }

    if (filters.certified != null) {
      params = params.set('certified', filters.certified.toString());
    }

    if (filters.type) {
      params = params.set('type', filters.type);
    }

    return params;
  }
}
