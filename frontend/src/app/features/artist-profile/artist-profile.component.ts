import { Component, HostListener, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ArtistProfileDto, ReviewDto } from '../../core/models/artist-profile.models';
import { BookableSlot } from '../../core/models/booking.models';
import { ArtistProfileService } from './services/artist-profile.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../booking/services/booking.service';
import { CertificationBadgeComponent } from '../../shared/components/certification-badge/certification-badge.component';
import { WeeklyCalendarComponent } from '../booking/components/weekly-calendar/weekly-calendar.component';

@Component({
  selector: 'app-artist-profile',
  standalone: true,
  imports: [DatePipe, CertificationBadgeComponent, WeeklyCalendarComponent],
  templateUrl: './artist-profile.component.html',
  styleUrl: './artist-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly artistService = inject(ArtistProfileService);
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);

  readonly artist = signal<ArtistProfileDto | null>(null);
  readonly holdError = signal<string | null>(null);
  readonly holding = signal(false);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly reviews = signal<ReviewDto[]>([]);
  readonly reviewsTotal = signal(0);
  readonly reviewsPage = signal(1);
  readonly reviewsLoading = signal(false);
  readonly selectedImage = signal<string | null>(null);
  readonly bioExpanded = signal(false);

  private readonly PAGE_SIZE = 5;

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'];
    if (!slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.artistService.getArtistProfile(slug).subscribe({
      next: (profile) => {
        this.artist.set(profile);
        this.titleService.setTitle(`${profile.artistName} — INK·LINK`);
        this.loading.set(false);
        this.loadReviews(slug);
        this.holdPreselectedSlot();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound.set(true);
        }
        this.loading.set(false);
      }
    });
  }

  private loadReviews(slug: string): void {
    this.reviewsLoading.set(true);
    this.artistService.getArtistReviews(slug, this.reviewsPage(), this.PAGE_SIZE).subscribe({
      next: (res) => {
        this.reviews.update(prev => [...prev, ...res.data]);
        this.reviewsTotal.set(res.total);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsLoading.set(false);
      }
    });
  }

  loadMoreReviews(): void {
    this.reviewsPage.update(p => p + 1);
    const slug = this.route.snapshot.params['slug'];
    this.loadReviews(slug);
  }

  get hasMoreReviews(): boolean {
    return this.reviews().length < this.reviewsTotal();
  }

  openLightbox(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  closeLightbox(): void {
    this.selectedImage.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeLightbox();
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
  }

  getCancellationLabel(policy: string): string {
    const labels: Record<string, string> = {
      hours24: '24 horas antes',
      hours48: '48 horas antes',
      hours72: '72 horas antes',
      flexible: 'Flexible'
    };
    return labels[policy] ?? policy;
  }

  getArtistTypeLabel(type: string): string {
    return type === 'independent' ? 'Independiente' : 'Estudio';
  }

  getStars(rating: number): number[] {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < full ? 1 : 0);
  }

  getRatingPercent(value: number): number {
    return (value / 5) * 100;
  }

  // day_of_week: 0=Monday ... 6=Sunday (convención del modelo de datos)
  getDayLabel(dayOfWeek: number): string {
    const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    return days[dayOfWeek] ?? '';
  }

  getWeekAvailability(): { day: string; available: boolean }[] {
    const slots = this.artist()?.availableSlots ?? [];
    const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    return days.map((day, i) => ({
      day,
      available: slots.some(s => s.dayOfWeek === i)
    }));
  }

  getActiveCertifications(): boolean {
    return (this.artist()?.certifications ?? []).some(c => c.isActive);
  }

  /** US0008 CA5 — Selecting a slot requires login; CA7 — creates the 5-minute hold. */
  onSlotSelected(slot: BookableSlot): void {
    const artist = this.artist();
    if (!artist) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      const returnUrl = this.router
        .createUrlTree(['/artista', artist.slug], {
          queryParams: { slotDate: slot.date, slotStart: slot.startTime, slotEnd: slot.endTime }
        })
        .toString();
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }

    this.holdError.set(null);
    this.holding.set(true);
    this.bookingService
      .holdSlot({
        artistProfileId: artist.id,
        bookingDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      })
      .subscribe({
        next: (booking) => {
          this.holding.set(false);
          this.bookingService.currentBooking.set(booking);
          this.router.navigate(['/reserva']);
        },
        error: (err: HttpErrorResponse) => {
          this.holding.set(false);
          this.holdError.set(
            err.status === 409
              ? 'Este horario ya fue reservado. Elige otro, por favor.'
              : 'No pudimos reservar el horario. Inténtalo de nuevo.'
          );
        }
      });
  }

  /** Post-login return (CA5): the slot preselected before login travels as query params. */
  private holdPreselectedSlot(): void {
    const { slotDate, slotStart, slotEnd } = this.route.snapshot.queryParams;
    if (!slotDate || !slotStart || !slotEnd || !this.authService.isAuthenticated()) {
      return;
    }
    this.onSlotSelected({ date: slotDate, startTime: slotStart, endTime: slotEnd, isAvailable: true });
  }
}
