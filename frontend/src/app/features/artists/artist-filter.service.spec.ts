import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ArtistListResponse } from '../../core/models/artist-filter.models';
import { ArtistFilterService } from './services/artist-filter.service';

const mockResponse: ArtistListResponse = {
  data: [
    {
      id: 'artist-1',
      artistName: 'Ana Pérez',
      slug: 'ana-perez',
      profilePhotoUrl: null,
      bio: null,
      styles: ['blackwork'],
      artistType: 'independent',
      commune: 'Providencia',
      latitude: -33.44,
      longitude: -70.65,
      minSessionPrice: 80000,
      hourlyRate: 40000,
      isCertified: true,
      averageRating: 4.8,
      reviewCount: 23,
      sponsorBadges: []
    }
  ],
  total: 1,
  page: 1,
  pageSize: 12
};

describe('ArtistFilterService', () => {
  let service: ArtistFilterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ArtistFilterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('updateFilter changes filters and calls loadArtists', () => {
    const loadArtistsSpy = spyOn(service, 'loadArtists');

    service.updateFilter('styles', ['blackwork']);

    expect(service.currentFilters().styles).toEqual(['blackwork']);
    expect(service.currentFilters().page).toBe(1);
    expect(loadArtistsSpy).toHaveBeenCalled();
  });

  it('updatePriceRange updates price filters and calls loadArtists', () => {
    const loadArtistsSpy = spyOn(service, 'loadArtists');

    service.updatePriceRange(50000, 200000);

    expect(service.currentFilters().minPrice).toBe(50000);
    expect(service.currentFilters().maxPrice).toBe(200000);
    expect(service.currentFilters().page).toBe(1);
    expect(loadArtistsSpy).toHaveBeenCalled();
  });

  it('clearFilters resets to defaults', () => {
    spyOn(service, 'loadArtists');
    service.updateFilter('styles', ['realismo']);

    service.clearFilters();

    expect(service.currentFilters()).toEqual({ page: 1, pageSize: 12 });
  });

  it('loadArtists sets loading true then false on success', () => {
    service.loadArtists();

    expect(service.loading()).toBeTrue();
    expect(service.error()).toBeNull();

    const request = httpMock.expectOne(`${environment.apiUrl}/artists`);
    expect(request.request.method).toBe('GET');
    request.flush(mockResponse);

    expect(service.loading()).toBeFalse();
    expect(service.results()).toEqual(mockResponse);
  });

  it('loadArtists sets error on failure', () => {
    service.loadArtists();

    const request = httpMock.expectOne(`${environment.apiUrl}/artists`);
    request.flush('failure', { status: 500, statusText: 'Server Error' });

    expect(service.loading()).toBeFalse();
    expect(service.error()).toBe('No se pudieron cargar los artistas.');
  });
});
