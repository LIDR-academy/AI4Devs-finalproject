import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ArtistCardComponent } from '../../../shared/components/artist-card/artist-card.component';
import { QuoteChatbotComponent } from '../../quote-chatbot/quote-chatbot.component';
import { ShowcaseService } from '../showcase.service';
import { ShowcaseSection } from '../../../core/models/showcase.models';

interface TrustItem {
  icon: string;
  title: string;
  detail: string;
}

interface HowItWorksStep {
  number: string;
  icon: string;
  title: string;
  detail: string;
}

interface CommunityReview {
  name: string;
  commune: string;
  date: string;
  style: string;
  comment: string;
  verified: boolean;
}

@Component({
  selector: 'app-showcase-page',
  standalone: true,
  imports: [FormsModule, MatIconModule, ArtistCardComponent, QuoteChatbotComponent],
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.scss'
})
export class ShowcasePageComponent implements OnInit {
  private readonly showcaseService = inject(ShowcaseService);
  private readonly router = inject(Router);

  @ViewChild('carousel') carouselRef?: ElementRef<HTMLDivElement>;
  @ViewChild('stylesCarousel') stylesCarouselRef?: ElementRef<HTMLDivElement>;

  readonly sections = signal<ShowcaseSection[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly topRated = computed(() => this.sections().find((s) => s.key === 'top_rated') ?? null);
  readonly nearYou = computed(() => this.sections().find((s) => s.key === 'near_you') ?? null);
  readonly awarded = computed(() => this.sections().find((s) => s.key === 'awarded_artists') ?? null);
  readonly popularStyles = computed(() => {
    const section = this.sections().find((s) => s.key === 'popular_styles');
    if (!section) return [];
    const seen = new Set<string>();
    return section.items.filter((item) => {
      if (seen.has(item.style)) return false;
      seen.add(item.style);
      return true;
    });
  });

  searchText = '';
  styleFilter = '';
  communeFilter = '';
  newsletterEmail = '';
  readonly newsletterDone = signal(false);

  readonly styleOptions = [
    'Realismo', 'Tradicional', 'Blackwork', 'Fine-line', 'Japonés', 'Lettering',
    'Neotradicional', 'Acuarela', 'Geométrico', 'Minimalista', 'Dotwork', 'Tribal'
  ];

  readonly quickTags = ['Fine-line', 'Blackwork', 'Japonés', 'Realismo', 'Minimalista'];

  readonly communeOptions = [
    'Providencia', 'Ñuñoa', 'Barrio Italia', 'Bellavista', 'Las Condes',
    'Vitacura', 'Santiago Centro', 'La Reina', 'Macul'
  ];

  readonly heroStats = [
    { value: '1.200+', label: 'Artistas activos' },
    { value: '34', label: 'Comunas' },
    { value: '85K+', label: 'Sesiones' },
    { value: '4.95★', label: 'Calificación' }
  ];

  readonly trustItems: TrustItem[] = [
    { icon: 'verified', title: 'Artistas verificados', detail: 'Identidad y portafolio revisados por nuestro equipo editorial.' },
    { icon: 'star', title: 'Reseñas reales', detail: 'Solo clientes que completaron sesión pueden calificar.' },
    { icon: 'health_and_safety', title: 'Certificación sanitaria', detail: 'Verificamos que cada artista cumple normativa MINSAL.' },
    { icon: 'check_circle', title: 'Depósito protegido', detail: 'Reembolso automático si el artista cancela.' }
  ];

  readonly howItWorks: HowItWorksStep[] = [
    { number: '01', icon: 'search', title: 'Descubre y cotiza', detail: 'Filtra por estilo, comuna y precio. Usa el cotizador IA para una estimación instantánea sin esperar DMs.' },
    { number: '02', icon: 'event', title: 'Reserva con confianza', detail: 'Elige el horario disponible y paga el depósito de forma segura. Tu dinero está protegido.' },
    { number: '03', icon: 'star', title: 'Vive la experiencia', detail: 'Asiste a tu sesión y califica en 4 dimensiones. A los 90 días, sube la foto de curación.' }
  ];

  readonly communityReviews: CommunityReview[] = [
    { name: 'Sofía A.', commune: 'Providencia', date: 'Dic 2025', style: 'Realismo', verified: true, comment: 'Valentina transformó mi idea en algo que supera todo lo que imaginé. El realismo del retrato es increíble.' },
    { name: 'Tomás M.', commune: 'Ñuñoa', date: 'Nov 2025', style: 'Blackwork', verified: true, comment: 'La plataforma me dio toda la confianza que necesitaba. Reseñas verificadas, depósito seguro. Matías es un crack.' },
    { name: 'Javiera R.', commune: 'Las Condes', date: 'Ene 2026', style: 'Japonés', verified: false, comment: 'Era mi primer tatuaje. El cotizador IA me dio el precio exacto antes de reservar. Sin sorpresas, sin esperar DMs.' }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.fetchSections(pos.coords.latitude, pos.coords.longitude),
        () => this.fetchSections()
      );
    } else {
      this.fetchSections();
    }
  }

  fetchSections(lat?: number, lng?: number): void {
    this.showcaseService.getShowcase(lat, lng).subscribe({
      next: (data) => {
        this.sections.set(data.sections);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la vitrina. Inténtalo de nuevo más tarde.');
        this.loading.set(false);
      }
    });
  }

  goSearch(): void {
    const queryParams: Record<string, string> = {};
    const text = this.searchText.trim();
    // The backend's `search` matches name, commune, bio and style via a single
    // ILIKE pattern, so free text takes precedence over the commune preset.
    if (text.length >= 2) {
      queryParams['search'] = text;
    } else if (this.communeFilter) {
      queryParams['search'] = this.communeFilter;
    }
    if (this.styleFilter) queryParams['styles'] = this.styleFilter;
    this.router.navigate(['/artistas'], { queryParams });
  }

  goStyle(style: string): void {
    this.router.navigate(['/artistas'], { queryParams: { styles: style } });
  }

  goArtists(): void {
    this.router.navigate(['/artistas']);
  }

  goTopArtistChatbot(): void {
    this.showChatbot.set(true);
  }

  readonly showChatbot = signal(false);

  closeChatbot(): void {
    this.showChatbot.set(false);
  }

  goNearMe(): void {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => this.router.navigate(['/mapa']),
        () => this.router.navigate(['/mapa'])
      );
    } else {
      this.router.navigate(['/mapa']);
    }
  }

  scrollCarousel(direction: 1 | -1): void {
    this.carouselRef?.nativeElement.scrollBy({ left: direction * 640, behavior: 'smooth' });
  }

  scrollStyles(direction: 'left' | 'right'): void {
    const el = this.stylesCarouselRef?.nativeElement;
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' });
    }
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail.includes('@')) {
      this.newsletterDone.set(true);
    }
  }
}
