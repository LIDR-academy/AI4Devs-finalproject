import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { of, throwError } from 'rxjs';

registerLocaleData(localeEsCl);
import { QuoteChatbotComponent } from './quote-chatbot.component';
import { QuoteService } from './services/quote.service';
import { ArtistProfileDto } from '../../core/models/artist-profile.models';
import { QuoteResponse, TattooStyleOption } from '../../core/models/quote.models';

const mockArtist = {
  id: 'artist-1',
  artistName: 'Matías Herrera',
  slug: 'matias-herrera',
  styles: ['blackwork'],
  minSessionPrice: 80000,
  hourlyRate: 60000,
  depositPercentage: 30
} as unknown as ArtistProfileDto;

const mockStyles: TattooStyleOption[] = [
  { id: 'style-1', name: 'Blackwork', slug: 'blackwork' },
  { id: 'style-2', name: 'Realismo', slug: 'realismo' }
];

const mockQuote: QuoteResponse = {
  priceMin: 192000,
  priceMax: 312000,
  currency: 'CLP',
  depositAmount: 57600,
  factors: []
};

describe('QuoteChatbotComponent', () => {
  let fixture: ComponentFixture<QuoteChatbotComponent>;
  let component: QuoteChatbotComponent;
  let quoteService: jasmine.SpyObj<QuoteService>;

  beforeEach(async () => {
    quoteService = jasmine.createSpyObj<QuoteService>('QuoteService', [
      'getStyles', 'calculate', 'saveDraft', 'draftFor', 'clearDraft'
    ]);
    quoteService.getStyles.and.returnValue(of(mockStyles));
    quoteService.calculate.and.returnValue(of(mockQuote));

    await TestBed.configureTestingModule({
      imports: [QuoteChatbotComponent],
      providers: [{ provide: QuoteService, useValue: quoteService }]
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteChatbotComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('artist', mockArtist);
    fixture.detectChanges();
  });

  function chipLabels(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.option-chip'))
      .map(chip => (chip as HTMLElement).textContent?.trim() ?? '');
  }

  function answerUpToOptions(): void {
    component.selectZone({ slug: 'brazo', label: 'Brazo', difficult: false });
    component.selectSize({ slug: 'hand', label: 'Mano completa (~20 cm)', icon: '🖐' });
    component.selectStyle(mockStyles[0]);
    component.confirmReferences();
    fixture.detectChanges();
  }

  it('starts at the body-zone step with a greeting (CA1-CA2)', () => {
    expect(component.step()).toBe('zone');
    const firstMessage = fixture.nativeElement.querySelector('.message--bot');
    expect(firstMessage?.textContent).toContain('¿En qué zona del cuerpo');
    expect(chipLabels().some(label => label.startsWith('Costillas'))).toBeTrue();
  });

  it('advances through the steps as questions are answered (CA2)', () => {
    component.selectZone({ slug: 'brazo', label: 'Brazo', difficult: false });
    fixture.detectChanges();
    expect(component.step()).toBe('size');

    component.selectSize({ slug: 'coin', label: 'Moneda (~3 cm)', icon: '🪙' });
    fixture.detectChanges();
    expect(component.step()).toBe('style');

    component.selectStyle(mockStyles[0]);
    fixture.detectChanges();
    expect(component.step()).toBe('references');

    component.confirmReferences();
    fixture.detectChanges();
    expect(component.step()).toBe('options');
  });

  it('only offers the artist styles in the style step (CA2 paso 3)', () => {
    component.selectZone({ slug: 'brazo', label: 'Brazo', difficult: false });
    component.selectSize({ slug: 'coin', label: 'Moneda (~3 cm)', icon: '🪙' });
    fixture.detectChanges();

    const labels = chipLabels();
    expect(labels).toContain('Blackwork');
    expect(labels).not.toContain('Realismo');
  });

  it('goes back one step and lets the answer be changed (CA6)', () => {
    component.selectZone({ slug: 'brazo', label: 'Brazo', difficult: false });
    component.selectSize({ slug: 'coin', label: 'Moneda (~3 cm)', icon: '🪙' });
    fixture.detectChanges();
    expect(component.step()).toBe('style');

    component.goBack();
    fixture.detectChanges();
    expect(component.step()).toBe('size');
    expect(component.selectedSize()).toBeNull();
  });

  it('calculates after the five steps and shows the price range (CA3)', () => {
    answerUpToOptions();
    component.calculate();
    fixture.detectChanges();

    expect(quoteService.calculate).toHaveBeenCalledWith({
      artistProfileId: 'artist-1',
      bodyZone: 'brazo',
      sizeReference: 'hand',
      styleId: 'style-1',
      isColor: false,
      isCoverup: false
    });
    const result = fixture.nativeElement.querySelector('.quote-result');
    expect(result?.textContent).toContain('192.000');
    expect(result?.textContent).toContain('312.000');
    expect(result?.textContent).toContain('57.600');
  });

  it('saves the draft after a successful quote (CA7-CA8)', () => {
    answerUpToOptions();
    component.calculate();

    expect(quoteService.saveDraft).toHaveBeenCalledWith(jasmine.objectContaining({
      request: jasmine.objectContaining({ artistProfileId: 'artist-1', sizeReference: 'hand' }),
      quote: mockQuote
    }));
  });

  it('emits reserveRequested from the result CTA (CA5)', () => {
    let requested = false;
    component.reserveRequested.subscribe(() => (requested = true));

    answerUpToOptions();
    component.calculate();
    fixture.detectChanges();

    const reserveButton = Array.from(fixture.nativeElement.querySelectorAll('.option-chip'))
      .find(chip => (chip as HTMLElement).textContent?.includes('reservar')) as HTMLButtonElement;
    reserveButton.click();
    expect(requested).toBeTrue();
  });

  it('shows an error message when the calculation fails', () => {
    quoteService.calculate.and.returnValue(throwError(() => new Error('boom')));
    answerUpToOptions();
    component.calculate();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chatbot__error')?.textContent)
      .toContain('No pudimos calcular');
    expect(component.step()).toBe('options');
  });
});
