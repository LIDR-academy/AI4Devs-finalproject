import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ArtistCardComponent } from './artist-card.component';
import { ShowcaseItem } from '../../../core/models/showcase.models';

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

describe('ArtistCardComponent', () => {
  let fixture: ComponentFixture<ArtistCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistCardComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistCardComponent);
    fixture.componentRef.setInput('item', mockItem);
    fixture.detectChanges();
  });

  it('renders the artist name', () => {
    const name: HTMLElement = fixture.nativeElement.querySelector('.artist-card__name');
    expect(name.textContent?.trim()).toBe('Ana Pérez');
  });

  it('renders the commune', () => {
    const meta = fixture.nativeElement.querySelectorAll('.artist-card__meta');
    const communeEl = Array.from(meta as NodeListOf<HTMLElement>).find((el) =>
      el.textContent?.includes('Santiago')
    );
    expect(communeEl).toBeTruthy();
  });

  it('does not show the certified badge when isCertified is false', () => {
    const badge = fixture.nativeElement.querySelector('.artist-card__badge');
    expect(badge).toBeNull();
  });

  it('shows the certified badge when isCertified is true', async () => {
    fixture.componentRef.setInput('item', {
      ...mockItem,
      artist: { ...mockItem.artist, isCertified: true }
    });
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.artist-card__badge');
    expect(badge).toBeTruthy();
  });

  it('has a link to the artist profile', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.artist-card');
    expect(link.href).toContain('ana-perez');
  });
});
