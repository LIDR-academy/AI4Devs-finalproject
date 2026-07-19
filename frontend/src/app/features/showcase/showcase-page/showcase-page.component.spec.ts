import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { ShowcasePageComponent } from './showcase-page.component';
import { ShowcaseService } from '../showcase.service';
import { ShowcaseResponse, ShowcaseItem } from '../../../core/models/showcase.models';

const mockItem: ShowcaseItem = {
  imageUrl: 'http://example.com/thumb.jpg',
  thumbnailUrl: 'http://example.com/thumb.jpg',
  style: 'blackwork',
  artist: {
    id: 'abc-123',
    artistName: 'Ana Pérez',
    slug: 'ana-perez',
    profilePhotoUrl: null,
    bio: null,
    styles: ['blackwork'],
    artistType: 'independent',
    commune: 'Santiago',
    latitude: -33.44,
    longitude: -70.65,
    minSessionPrice: 50000,
    hourlyRate: 40000,
    isCertified: false,
    averageRating: 4.5,
    reviewCount: 10,
    sponsorBadges: []
  }
};

const mockResponse: ShowcaseResponse = {
  sections: [
    { key: 'near_you', title: 'Cerca de ti', items: [mockItem] },
    { key: 'top_rated', title: 'Mejor calificados', items: [mockItem] },
    { key: 'popular_styles', title: 'Estilos populares', items: [mockItem] },
    { key: 'awarded_artists', title: 'Artistas premiados', items: [mockItem] }
  ]
};

describe('ShowcasePageComponent', () => {
  let fixture: ComponentFixture<ShowcasePageComponent>;
  let mockService: jasmine.SpyObj<ShowcaseService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ShowcaseService', ['getShowcase']);

    // Simulate geolocation permission denied so fetchSections is called without coords
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
      (_success, error) => { error?.({ code: 1, message: 'denied' } as GeolocationPositionError); }
    );

    await TestBed.configureTestingModule({
      imports: [ShowcasePageComponent],
      providers: [
        { provide: ShowcaseService, useValue: mockService },
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('renders the hero and data-driven sections when API returns data', () => {
    mockService.getShowcase.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.home-hero')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.home-carousel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.home-styles')).toBeTruthy();
    const cards = fixture.nativeElement.querySelectorAll('app-artist-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('shows error message when API fails', () => {
    mockService.getShowcase.and.returnValue(throwError(() => new Error('Network error')));

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const error: HTMLElement = fixture.nativeElement.querySelector('.showcase-page__error');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('No se pudo cargar la vitrina');
  });

  it('shows skeleton while loading', () => {
    // Service returns an observable that never completes
    mockService.getShowcase.and.returnValue(new Subject());

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.showcase-page__skeleton');
    expect(skeleton).toBeTruthy();
  });
});
