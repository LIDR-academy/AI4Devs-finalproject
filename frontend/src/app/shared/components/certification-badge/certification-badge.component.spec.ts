import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificationBadgeComponent } from './certification-badge.component';

describe('CertificationBadgeComponent', () => {
  let fixture: ComponentFixture<CertificationBadgeComponent>;

  function create(isCertified: boolean, size: 'sm' | 'md' = 'sm') {
    TestBed.configureTestingModule({ imports: [CertificationBadgeComponent] });
    fixture = TestBed.createComponent(CertificationBadgeComponent);
    fixture.componentRef.setInput('isCertified', isCertified);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders badge when isCertified is true', () => {
    const el = create(true);
    expect(el.querySelector('.cert-badge')).toBeTruthy();
    expect(el.querySelector('.cert-badge__text')?.textContent).toContain('Certificado');
  });

  it('renders nothing when isCertified is false', () => {
    const el = create(false);
    expect(el.querySelector('.cert-badge')).toBeNull();
  });

  it('applies md modifier when size is md', () => {
    const el = create(true, 'md');
    expect(el.querySelector('.cert-badge--md')).toBeTruthy();
  });

  it('defaults to sm size without md class', () => {
    const el = create(true, 'sm');
    expect(el.querySelector('.cert-badge--md')).toBeNull();
  });

  it('has aria-label for accessibility', () => {
    const el = create(true);
    const badge = el.querySelector('.cert-badge');
    expect(badge?.getAttribute('aria-label')).toContain('certificación sanitaria');
  });
});
