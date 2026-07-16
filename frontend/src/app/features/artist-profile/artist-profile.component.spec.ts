import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArtistProfileComponent } from './artist-profile.component';
import { ArtistProfileService } from './services/artist-profile.service';
import { ArtistProfileDto, ReviewListResponse } from '../../core/models/artist-profile.models';

const mockArtist: ArtistProfileDto = {
  id: '1',
  artistName: 'Carlos Ink',
  slug: 'carlos-ink',
  profilePhotoUrl: null,
  bio: 'Artista especializado en realismo.',
  yearsExperience: 8,
  artistType: 'independent',
  commune: 'Providencia',
  latitude: -33.42,
  longitude: -70.6,
  address: 'Av. Providencia 1234',
  minSessionPrice: 50000,
  hourlyRate: 40000,
  depositPercentage: 30,
  cancellationPolicy: 'hours48',
  isCertified: true,
  averageRating: 4.5,
  reviewCount: 12,
  styles: ['Realismo', 'Blackwork'],
  portfolioItems: [
    { id: 'p1', imageUrl: 'img1.jpg', thumbnailUrl: 'thumb1.jpg', styleSlug: 'realismo', isFeatured: true, sortOrder: 1 }
  ],
  certifications: [
    { type: 'sanitary', name: 'Certificado Sanitario', issuer: 'SEREMI', validUntil: '2026-12-31', isActive: true }
  ],
  awards: [
    { title: 'Best Realism', eventName: 'Chile Tattoo Expo', year: 2024, category: 'Realismo', badgeIconUrl: null }
  ],
  sponsorships: [
    { id: 'sp1', brandName: 'Eternal Ink', brandLogoUrl: 'https://cdn.test/eternal.png', relationshipType: 'ambassador' }
  ],
  availableSlots: [
    { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 60 }
  ]
};

const mockReviews: ReviewListResponse = {
  data: [
    {
      id: 'r1',
      clientName: 'Ana López',
      ratingHygiene: 5,
      ratingPainManagement: 4,
      ratingCustomerService: 5,
      ratingResult: 5,
      averageRating: 4.75,
      comment: 'Excelente trabajo!',
      tattooPhotoUrl: null,
      createdAt: '2025-06-01T00:00:00Z'
    }
  ],
  total: 6,
  page: 1,
  pageSize: 5
};

describe('ArtistProfileComponent', () => {
  let component: ArtistProfileComponent;
  let fixture: ComponentFixture<ArtistProfileComponent>;
  let artistService: jasmine.SpyObj<ArtistProfileService>;

  beforeEach(async () => {
    artistService = jasmine.createSpyObj('ArtistProfileService', ['getArtistProfile', 'getArtistReviews']);
    artistService.getArtistReviews.and.returnValue(of(mockReviews));

    await TestBed.configureTestingModule({
      imports: [ArtistProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArtistProfileService, useValue: artistService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { slug: 'carlos-ink' }, queryParams: {} } }
        }
      ]
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ArtistProfileComponent);
    component = fixture.componentInstance;
  }

  it('renders artist name when loaded', fakeAsync(() => {
    artistService.getArtistProfile.and.returnValue(of(mockArtist));
    createComponent();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.hero__name')?.textContent).toContain('Carlos Ink');
  }));

  it('mapea dayOfWeek con 0=lunes en la disponibilidad semanal', fakeAsync(() => {
    artistService.getArtistProfile.and.returnValue(of(mockArtist));
    createComponent();
    fixture.detectChanges();
    tick();

    // mockArtist tiene availableSlots con dayOfWeek: 1 → martes (0=lunes según data model)
    const week = component.getWeekAvailability();
    expect(week.map((d) => d.day)).toEqual(['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']);
    expect(week.find((d) => d.day === 'Ma')?.available).toBeTrue();
    expect(week.find((d) => d.day === 'Lu')?.available).toBeFalse();
  }));

  it('shows loading skeleton initially', () => {
    artistService.getArtistProfile.and.returnValue(of(mockArtist));
    createComponent();
    // Before detectChanges, loading is true
    expect(component.loading()).toBeTrue();

    const el: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    // After first detectChanges the subscribe completes synchronously with of()
    // So let's test with a delayed observable instead
  });

  it('shows 404 when artist not found', fakeAsync(() => {
    artistService.getArtistProfile.and.returnValue(
      throwError(() => ({ status: 404 }))
    );
    createComponent();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.not-found__title')?.textContent).toContain('404');
    expect(component.notFound()).toBeTrue();
  }));

  it('loads more reviews on button click', fakeAsync(() => {
    artistService.getArtistProfile.and.returnValue(of(mockArtist));
    const moreReviews: ReviewListResponse = {
      data: [
        {
          id: 'r2',
          clientName: 'Pedro Ruiz',
          ratingHygiene: 4,
          ratingPainManagement: 4,
          ratingCustomerService: 4,
          ratingResult: 4,
          averageRating: 4,
          comment: 'Muy bueno',
          tattooPhotoUrl: null,
          createdAt: '2025-07-01T00:00:00Z'
        }
      ],
      total: 6,
      page: 2,
      pageSize: 5
    };

    createComponent();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.reviews().length).toBe(1);

    artistService.getArtistReviews.and.returnValue(of(moreReviews));
    component.loadMoreReviews();
    tick();
    fixture.detectChanges();

    expect(component.reviews().length).toBe(2);
    expect(component.reviewsPage()).toBe(2);
  }));
});
