import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal
} from '@angular/core';

/**
 * US0013 TASK0002 — Reusable interactive star rating (1-5).
 * Supports click selection and hover preview; keyboard accessible (arrow keys, Enter/Space).
 */
@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  readonly label = input.required<string>();
  readonly value = model<number>(0);

  protected readonly hovered = signal(0);

  protected readonly stars = [1, 2, 3, 4, 5];

  protected isFilled(star: number): boolean {
    const preview = this.hovered();
    return star <= (preview > 0 ? preview : this.value());
  }

  protected hover(star: number): void {
    this.hovered.set(star);
  }

  protected clearHover(): void {
    this.hovered.set(0);
  }

  protected select(star: number): void {
    this.value.set(star);
  }

  /** Keyboard: left/right arrows adjust value; Enter/Space on a star selects it. */
  protected onKeydown(event: KeyboardEvent, star: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(star);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.value.set(Math.min(5, this.value() + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.value.set(Math.max(1, this.value() - 1));
    }
  }
}
