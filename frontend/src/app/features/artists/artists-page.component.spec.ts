import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ArtistsPageComponent } from './artists-page.component';
import { ArtistListResponse } from '../../core/models/artist-filter.models';
import { ArtistFilterService } from './services/artist-filter.service';

const emptyResponse: ArtistListResponse = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 12
};

const listResponse: ArtistListResponse = {
  data: [
    {
      id: 'artist-1',
      artistName: 'Ana Pérez',
      slug: 'ana-perez',
      profilePhotoUrl: null,
      bio: null,
      styles: ['blackwork'],
      artistType: 'independent',
      commune: 'Santiago',
      latitude: -33.44,
      longitude: -70.65,
      minSessionPrice: 90000,
      hourlyRate: 45000,
      isCertified: true,
      averageRating: 4.7,
      reviewCount: 11,
      sponsorBadges: []
    }
  ],
  total: 1,
  page: 1,
  pageSize: 12
};

describe('ArtistsPageComponent', () => {
  let fixture: ComponentFixture<ArtistsPageComponent>;
  let mockService: {
    results: WritableSignal<ArtistListResponse | null>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    currentFilters: WritableSignal<{ page: number; pageSize: number }>;
    hydrateFilters: jasmine.Spy;
    loadArtists: jasmine.Spy;
    clearFilters: jasmine.Spy;
  };

  beforeEach(async () => {
    mockService = {
      results: signal<ArtistListResponse | null>(emptyResponse),
      loading: signal(false),
      error: signal<string | null>(null),
      currentFilters: signal({ page: 1, pageSize: 12 }),
      hydrateFilters: jasmine.createSpy('hydrateFilters'),
      loadArtists: jasmine.createSpy('loadArtists'),
      clearFilters: jasmine.createSpy('clearFilters')
    };

    await TestBed.configureTestingModule({
      imports: [ArtistsPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        { provide: ArtistFilterService, useValue: mockService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }
      ]
    }).compileComponents();
  });

  it('renders with no results and shows empty state', () => {
    fixture = TestBed.createComponent(ArtistsPageComponent);
    fixture.detectChanges();

    const emptyState: HTMLElement = fixture.nativeElement.querySelector('.artists-page__empty');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No encontramos artistas con esos filtros');
  });

  it('renders artists list', () => {
    mockService.results.set(listResponse);

    fixture = TestBed.createComponent(ArtistsPageComponent);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-artist-card');
    const counter: HTMLElement = fixture.nativeElement.querySelector('.artists-page__counter');

    expect(cards.length).toBe(1);
    expect(counter.textContent).toContain('1 artistas encontrados');
  });
});
