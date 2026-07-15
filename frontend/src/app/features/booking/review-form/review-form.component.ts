import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ReviewService } from '../services/review.service';

const MAX_COMMENT = 500;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * US0013 TASK0002 — Review form: 4-dimension star ratings, optional comment and photo.
 * Route: /reservas/:bookingId/calificar (protected by authGuard in app.routes.ts).
 */
@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule, StarRatingComponent, RouterLink],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly reviewService = inject(ReviewService);

  protected readonly bookingId = signal('');
  protected readonly ratingHygiene = signal(0);
  protected readonly ratingPainManagement = signal(0);
  protected readonly ratingCustomerService = signal(0);
  protected readonly ratingResult = signal(0);
  protected readonly comment = signal('');
  protected readonly photoPreviewUrl = signal<string | null>(null);
  protected readonly photoFile = signal<File | null>(null);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly photoError = signal<string | null>(null);

  readonly MAX_COMMENT = MAX_COMMENT;

  /** CA2: all 4 dimensions required to enable submit */
  readonly canSubmit = computed(
    () =>
      this.ratingHygiene() > 0 &&
      this.ratingPainManagement() > 0 &&
      this.ratingCustomerService() > 0 &&
      this.ratingResult() > 0 &&
      !this.submitting()
  );

  readonly commentLength = computed(() => this.comment().length);

  ngOnInit(): void {
    this.titleService.setTitle('Calificar artista — INK·LINK');
    this.bookingId.set(this.route.snapshot.paramMap.get('bookingId') ?? '');
  }

  protected onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.photoError.set(null);
    if (!file) {
      this.photoFile.set(null);
      this.photoPreviewUrl.set(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.photoError.set('Solo se admiten imágenes JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      this.photoError.set('La foto no debe superar 10 MB.');
      return;
    }
    this.photoFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.photoPreviewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  protected removePhoto(): void {
    this.photoFile.set(null);
    this.photoPreviewUrl.set(null);
    this.photoError.set(null);
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.submitError.set(null);

    const comment = this.comment().trim() || null;
    // Photo upload is deferred to a presigned-URL flow; for now we pass null.
    this.reviewService
      .createReview(this.bookingId(), {
        ratingHygiene: this.ratingHygiene(),
        ratingPainManagement: this.ratingPainManagement(),
        ratingCustomerService: this.ratingCustomerService(),
        ratingResult: this.ratingResult(),
        comment,
        tattooPhotoUrl: null
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/mis-reservas'], {
            state: { toast: '¡Gracias por tu calificación!' }
          });
        },
        error: (err) => {
          this.submitting.set(false);
          if (err?.status === 409) {
            this.submitError.set('Esta reserva ya tiene una calificación.');
          } else {
            this.submitError.set('No pudimos enviar tu calificación. Inténtalo de nuevo.');
          }
        }
      });
  }
}
