import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SponsorshipSectionComponent } from './sponsorship-section.component';
import { SponsorshipDto } from '../../../../core/models/artist-profile.models';

const mockSponsorships: SponsorshipDto[] = [
  { id: 's1', brandName: 'Eternal Ink', brandLogoUrl: 'https://cdn.test/eternal.png', relationshipType: 'ambassador' },
  { id: 's2', brandName: 'Cheyenne', brandLogoUrl: 'https://cdn.test/cheyenne.png', relationshipType: 'certified' },
  { id: 's3', brandName: 'Dynamic Color', brandLogoUrl: null, relationshipType: 'sponsored' }
];

describe('SponsorshipSectionComponent', () => {
  let fixture: ComponentFixture<SponsorshipSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorshipSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SponsorshipSectionComponent);
  });

  function setSponsorships(sponsorships: SponsorshipDto[]): void {
    fixture.componentRef.setInput('sponsorships', sponsorships);
    fixture.detectChanges();
  }

  it('does not render the section when there are no sponsorships (CA4)', () => {
    setSponsorships([]);
    expect(fixture.nativeElement.querySelector('.sponsorship-card')).toBeNull();
  });

  it('renders the section title "Auspiciado por" when sponsorships exist (CA1)', () => {
    setSponsorships(mockSponsorships);
    const title = fixture.nativeElement.querySelector('.sponsorship-card__title');
    expect(title?.textContent).toContain('Auspiciado por');
  });

  it('renders logo, name and relationship badge for each brand (CA2)', () => {
    setSponsorships(mockSponsorships);
    const items = fixture.nativeElement.querySelectorAll('.sponsorship-item');
    expect(items.length).toBe(3);

    const names = Array.from(items).map(item => (item as HTMLElement).querySelector('.sponsorship-item__name')?.textContent?.trim());
    expect(names).toEqual(['Eternal Ink', 'Cheyenne', 'Dynamic Color']);

    const firstLogo = items[0].querySelector('img.sponsorship-item__logo') as HTMLImageElement;
    expect(firstLogo.src).toBe('https://cdn.test/eternal.png');
  });

  it('translates relationship types to Spanish badges (CA2)', () => {
    setSponsorships(mockSponsorships);
    const badges = Array.from(fixture.nativeElement.querySelectorAll('.sponsorship-item__type'))
      .map(badge => (badge as HTMLElement).textContent?.trim());
    expect(badges).toEqual(['Embajador', 'Certificado', 'Auspiciado']);
  });

  it('shows the brand initial as fallback when there is no logo', () => {
    setSponsorships(mockSponsorships);
    const items = fixture.nativeElement.querySelectorAll('.sponsorship-item');
    const fallback = items[2].querySelector('.sponsorship-item__fallback');
    expect(fallback?.textContent?.trim()).toBe('D');
    expect(items[2].querySelector('img')).toBeNull();
  });

  it('falls back to the brand initial when the logo fails to load', () => {
    setSponsorships(mockSponsorships);
    const firstLogo = fixture.nativeElement.querySelector('img.sponsorship-item__logo') as HTMLImageElement;
    firstLogo.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const firstItem = fixture.nativeElement.querySelectorAll('.sponsorship-item')[0];
    expect(firstItem.querySelector('img')).toBeNull();
    expect(firstItem.querySelector('.sponsorship-item__fallback')?.textContent?.trim()).toBe('E');
  });
});
