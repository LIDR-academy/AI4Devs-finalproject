import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuoteService } from './quote.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuoteDraft } from '../../../core/models/quote.models';
import { environment } from '../../../../environments/environment';

const draft: QuoteDraft = {
  request: {
    artistProfileId: 'artist-1',
    bodyZone: 'brazo',
    sizeReference: 'hand',
    styleId: 'style-1',
    isColor: false,
    isCoverup: true
  },
  quote: { priceMin: 249600, priceMax: 405600, currency: 'CLP', depositAmount: 74880, factors: ['Cover-up (+30%)'] },
  savedAt: '2026-07-16T12:00:00Z'
};

describe('QuoteService', () => {
  let service: QuoteService;
  let http: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    localStorage.clear();
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    authService.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService }
      ]
    });
    service = TestBed.inject(QuoteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('posts the quote request to /quotes/calculate', () => {
    service.calculate(draft.request).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/quotes/calculate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(draft.request);
    req.flush(draft.quote);
  });

  it('fetches the style catalog from /styles', () => {
    service.getStyles().subscribe();

    const req = http.expectOne(`${environment.apiUrl}/styles`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('persists the draft in localStorage when authenticated (CA7)', () => {
    service.saveDraft(draft);

    const stored = localStorage.getItem('inklink.quote.artist-1');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).quote.depositAmount).toBe(74880);
  });

  it('keeps the draft only in memory when anonymous', () => {
    authService.isAuthenticated.and.returnValue(false);

    service.saveDraft(draft);

    expect(localStorage.getItem('inklink.quote.artist-1')).toBeNull();
    expect(service.draftFor('artist-1')).toEqual(draft);
  });

  it('recovers the draft from localStorage in a new session (CA7)', () => {
    localStorage.setItem('inklink.quote.artist-1', JSON.stringify(draft));

    expect(service.draftFor('artist-1')).toEqual(draft);
  });

  it('returns null and clears correctly', () => {
    expect(service.draftFor('unknown')).toBeNull();

    service.saveDraft(draft);
    service.clearDraft('artist-1');
    expect(service.draftFor('artist-1')).toBeNull();
    expect(localStorage.getItem('inklink.quote.artist-1')).toBeNull();
  });
});
