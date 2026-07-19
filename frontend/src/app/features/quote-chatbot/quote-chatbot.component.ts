import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ArtistProfileDto } from '../../core/models/artist-profile.models';
import {
  BODY_ZONES,
  BodyZoneOption,
  QuoteDraft,
  QuoteResponse,
  SIZE_OPTIONS,
  SizeOption,
  TattooStyleOption
} from '../../core/models/quote.models';
import { QuoteService } from './services/quote.service';

type ChatStep = 'zone' | 'size' | 'style' | 'references' | 'options' | 'result';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

interface ReferencePreview {
  name: string;
  dataUrl: string;
}

const MAX_REFERENCES = 3;

@Component({
  selector: 'app-quote-chatbot',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './quote-chatbot.component.html',
  styleUrl: './quote-chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuoteChatbotComponent implements OnInit {
  readonly artist = input<ArtistProfileDto | null>(null);

  readonly closed = output<void>();
  /** CA5 — the client wants to book: the parent scrolls to the slot calendar. */
  readonly reserveRequested = output<void>();

  private readonly quoteService = inject(QuoteService);

  readonly bodyZones = BODY_ZONES;
  readonly sizeOptions = SIZE_OPTIONS;

  // Answers: each step derives from the previous ones (CA2, CA6)
  readonly selectedZone = signal<BodyZoneOption | null>(null);
  readonly selectedSize = signal<SizeOption | null>(null);
  readonly selectedStyle = signal<TattooStyleOption | null>(null);
  readonly referencesDone = signal(false);
  readonly references = signal<ReferencePreview[]>([]);
  readonly isColor = signal(false);
  readonly isCoverup = signal(false);

  readonly quote = signal<QuoteResponse | null>(null);
  readonly calculating = signal(false);
  readonly error = signal<string | null>(null);

  private readonly catalog = signal<TattooStyleOption[]>([]);

  /** Styles the artist actually works with, or all styles in general mode. */
  readonly artistStyles = computed<TattooStyleOption[]>(() => {
    const a = this.artist();
    if (!a) return this.catalog();
    const slugs = a.styles;
    return this.catalog().filter(style => slugs.includes(style.slug));
  });

  readonly step = computed<ChatStep>(() => {
    if (!this.selectedZone()) return 'zone';
    if (!this.selectedSize()) return 'size';
    if (!this.selectedStyle()) return 'style';
    if (!this.referencesDone()) return 'references';
    if (!this.quote()) return 'options';
    return 'result';
  });

  /** Conversation derived from the answers, so going back just clears an answer (CA6). */
  readonly messages = computed<ChatMessage[]>(() => {
    const a = this.artist();
    const greeting = a
      ? `¡Hola! Te ayudo a estimar el precio de tu tatuaje con ${a.artistName}. ¿En qué zona del cuerpo te lo quieres hacer?`
      : '¡Hola! Te ayudo a estimar el precio de tu próximo tatuaje. ¿En qué zona del cuerpo te lo quieres hacer?';
    const msgs: ChatMessage[] = [
      { from: 'bot', text: greeting }
    ];

    const zone = this.selectedZone();
    if (!zone) return msgs;
    msgs.push({ from: 'user', text: zone.label });
    msgs.push({ from: 'bot', text: '¿Qué tamaño aproximado tienes en mente?' });

    const size = this.selectedSize();
    if (!size) return msgs;
    msgs.push({ from: 'user', text: `${size.icon} ${size.label}` });
    msgs.push({ from: 'bot', text: a ? '¿Qué estilo te interesa? Estos son los que maneja este artista:' : '¿Qué estilo de tatuaje te interesa?' });

    const style = this.selectedStyle();
    if (!style) return msgs;
    msgs.push({ from: 'user', text: style.name });
    msgs.push({ from: 'bot', text: '¿Tienes imágenes de referencia? Puedes adjuntar hasta 3 (opcional).' });

    if (!this.referencesDone()) return msgs;
    const refs = this.references();
    msgs.push({
      from: 'user',
      text: refs.length > 0 ? `${refs.length} imagen${refs.length > 1 ? 'es' : ''} de referencia` : 'Sin referencias'
    });
    msgs.push({ from: 'bot', text: 'Última pregunta: ¿color o blanco y negro? ¿Es un cover-up (tapar un tatuaje existente)?' });

    const quote = this.quote();
    if (!quote) return msgs;
    msgs.push({
      from: 'user',
      text: `${this.isColor() ? 'Color' : 'Blanco y negro'}${this.isCoverup() ? ' · Cover-up' : ''}`
    });
    return msgs;
  });

  readonly canGoBack = computed(() => this.step() !== 'zone' && this.step() !== 'result');

  ngOnInit(): void {
    this.quoteService.getStyles().subscribe({
      next: styles => this.catalog.set(styles),
      error: () => this.error.set('No pudimos cargar los estilos. Cierra y vuelve a intentarlo.')
    });
  }

  selectZone(zone: BodyZoneOption): void {
    this.selectedZone.set(zone);
  }

  selectSize(size: SizeOption): void {
    this.selectedSize.set(size);
  }

  selectStyle(style: TattooStyleOption): void {
    this.selectedStyle.set(style);
  }

  onReferencesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []).slice(0, MAX_REFERENCES);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        this.references.update(refs =>
          refs.length < MAX_REFERENCES
            ? [...refs, { name: file.name, dataUrl: reader.result as string }]
            : refs);
      };
      reader.readAsDataURL(file);
    }
  }

  removeReference(index: number): void {
    this.references.update(refs => refs.filter((_, i) => i !== index));
  }

  confirmReferences(): void {
    this.referencesDone.set(true);
  }

  toggleColor(): void {
    this.isColor.update(v => !v);
  }

  toggleCoverup(): void {
    this.isCoverup.update(v => !v);
  }

  /** CA3-CA4 — completes step 5 and asks the backend for the estimate. */
  calculate(): void {
    const zone = this.selectedZone();
    const size = this.selectedSize();
    const style = this.selectedStyle();
    if (!zone || !size || !style || this.calculating()) {
      return;
    }

    this.error.set(null);
    this.calculating.set(true);
    const request = {
      artistProfileId: this.artist()?.id ?? '00000000-0000-0000-0000-000000000000',
      bodyZone: zone.slug,
      sizeReference: size.slug,
      styleId: style.id,
      isColor: this.isColor(),
      isCoverup: this.isCoverup()
    };

    this.quoteService.calculate(request).subscribe({
      next: quote => {
        this.calculating.set(false);
        this.quote.set(quote);
        this.saveDraft(quote);
      },
      error: () => {
        this.calculating.set(false);
        this.error.set('No pudimos calcular la cotización. Inténtalo de nuevo.');
      }
    });
  }

  goBack(): void {
    switch (this.step()) {
      case 'size':
        this.selectedZone.set(null);
        break;
      case 'style':
        this.selectedSize.set(null);
        break;
      case 'references':
        this.selectedStyle.set(null);
        break;
      case 'options':
        this.referencesDone.set(false);
        break;
    }
  }

  reserve(): void {
    this.reserveRequested.emit();
  }

  close(): void {
    this.closed.emit();
  }

  private saveDraft(quote: QuoteResponse): void {
    const zone = this.selectedZone()!;
    const size = this.selectedSize()!;
    const style = this.selectedStyle()!;
    const draft: QuoteDraft = {
      request: {
        artistProfileId: this.artist()?.id ?? '',
        bodyZone: zone.slug,
        sizeReference: size.slug,
        styleId: style.id,
        isColor: this.isColor(),
        isCoverup: this.isCoverup()
      },
      quote,
      savedAt: new Date().toISOString()
    };
    this.quoteService.saveDraft(draft);
  }
}
