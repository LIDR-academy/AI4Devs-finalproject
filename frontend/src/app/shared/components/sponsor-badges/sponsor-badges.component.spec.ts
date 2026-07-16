import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SponsorBadgesComponent } from './sponsor-badges.component';
import { SponsorBadge } from '../../../core/models/showcase.models';

function badge(name: string, logo: string | null = 'https://cdn.test/logo.png'): SponsorBadge {
  return { brandName: name, brandLogoUrl: logo };
}

describe('SponsorBadgesComponent', () => {
  let fixture: ComponentFixture<SponsorBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorBadgesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SponsorBadgesComponent);
  });

  function setBadges(badges: SponsorBadge[]): void {
    fixture.componentRef.setInput('badges', badges);
    fixture.detectChanges();
  }

  it('renders nothing when there are no badges', () => {
    setBadges([]);
    expect(fixture.nativeElement.querySelector('.sponsor-badges')).toBeNull();
  });

  it('renders one pill per badge with the brand logo (CA3)', () => {
    setBadges([badge('Eternal Ink'), badge('Cheyenne')]);
    const logos = fixture.nativeElement.querySelectorAll('img.sponsor-badges__logo');
    expect(logos.length).toBe(2);
  });

  it('shows at most 3 logos plus a "+N más" indicator', () => {
    setBadges([badge('A'), badge('B'), badge('C'), badge('D'), badge('E')]);
    const logos = fixture.nativeElement.querySelectorAll('img.sponsor-badges__logo');
    expect(logos.length).toBe(3);

    const more = fixture.nativeElement.querySelector('.sponsor-badges__pill--more');
    expect(more?.textContent?.trim()).toBe('+2 más');
  });

  it('shows the brand name as fallback when there is no logo', () => {
    setBadges([badge('Dynamic Color', null)]);
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    const name = fixture.nativeElement.querySelector('.sponsor-badges__name');
    expect(name?.textContent?.trim()).toBe('Dynamic Color');
  });

  it('shows the brand name as fallback when the logo fails to load', () => {
    setBadges([badge('Eternal Ink')]);
    const logo = fixture.nativeElement.querySelector('img.sponsor-badges__logo') as HTMLImageElement;
    logo.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sponsor-badges__name')?.textContent?.trim()).toBe('Eternal Ink');
  });
});
