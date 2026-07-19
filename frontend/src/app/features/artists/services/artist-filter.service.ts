import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ArtistFilters, ArtistListResponse } from '../../../core/models/artist-filter.models';

const DEFAULT_FILTERS: ArtistFilters = {
  page: 1,
  pageSize: 12
};

@Injectable({ providedIn: 'root' })
export class ArtistFilterService {
  private readonly http = inject(HttpClient);
  private requestSubscription: Subscription | null = null;
  private readonly filters = signal<ArtistFilters>({ ...DEFAULT_FILTERS });

  readonly results = signal<ArtistListResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentFilters = this.filters.asReadonly();

  updateFilter<K extends keyof ArtistFilters>(key: K, value: ArtistFilters[K]): void {
    if (key !== 'page') {
      this.filters.update((filters) => ({ ...filters, [key]: value, page: 1 }));
    } else {
      this.filters.update((filters) => ({ ...filters, [key]: value }));
    }

    this.loadArtists();
  }

  updatePriceRange(min: number, max: number): void {
    this.filters.update((filters) => ({
      ...filters,
      minPrice: min > 0 ? min : undefined,
      maxPrice: max > 0 ? max : undefined,
      page: 1
    }));

    this.loadArtists();
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.loadArtists();
  }

  hydrateFilters(queryParams: Params): void {
    const parsedFilters: ArtistFilters = {
      page: this.parseNumber(queryParams['page']) ?? DEFAULT_FILTERS.page,
      pageSize: this.parseNumber(queryParams['pageSize']) ?? DEFAULT_FILTERS.pageSize
    };

    if (typeof queryParams['styles'] === 'string' && queryParams['styles'].trim().length > 0) {
      parsedFilters.styles = queryParams['styles'].split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }

    const minPrice = this.parseNumber(queryParams['minPrice']);
    if (minPrice && minPrice > 0) {
      parsedFilters.minPrice = minPrice;
    }

    const maxPrice = this.parseNumber(queryParams['maxPrice']);
    if (maxPrice && maxPrice > 0) {
      parsedFilters.maxPrice = maxPrice;
    }

    const minRating = this.parseNumber(queryParams['minRating']);
    if (minRating && minRating >= 1 && minRating <= 5) {
      parsedFilters.minRating = minRating;
    }

    if (queryParams['certified'] === 'true') {
      parsedFilters.certified = true;
    }

    if (queryParams['available'] === 'true') {
      parsedFilters.available = true;
    }

    if (queryParams['awarded'] === 'true') {
      parsedFilters.awarded = true;
    }

    if (typeof queryParams['commune'] === 'string' && queryParams['commune'].trim().length > 0) {
      parsedFilters.commune = queryParams['commune'].trim();
    }

    if (queryParams['type'] === 'independent' || queryParams['type'] === 'studio') {
      parsedFilters.type = queryParams['type'];
    }

    if (typeof queryParams['search'] === 'string' && queryParams['search'].trim().length >= 2) {
      parsedFilters.search = queryParams['search'].trim();
    }

    this.filters.set(parsedFilters);
  }

  loadArtists(): void {
    this.requestSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildParams();
    this.requestSubscription = this.http
      .get<ArtistListResponse>(`${environment.apiUrl}/artists`, { params })
      .subscribe({
        next: (response) => {
          this.results.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los artistas.');
          this.loading.set(false);
        }
      });
  }

  private buildParams(): HttpParams {
    const filters = this.filters();
    let params = new HttpParams();

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

    if (filters.available != null) {
      params = params.set('available', filters.available.toString());
    }

    if (filters.type) {
      params = params.set('type', filters.type);
    }

    if (filters.search && filters.search.length >= 2) {
      params = params.set('search', filters.search);
    } else if (filters.commune) {
      // Backend's search does ILIKE on commune, name, bio — use commune as search text
      params = params.set('search', filters.commune);
    }

    if (filters.page !== DEFAULT_FILTERS.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.pageSize !== DEFAULT_FILTERS.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    return params;
  }

  private parseNumber(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
  }
}
