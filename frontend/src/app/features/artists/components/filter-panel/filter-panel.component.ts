import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, debounceTime } from 'rxjs';
import { ArtistFilters, TATTOO_STYLES } from '../../../../core/models/artist-filter.models';
import { ArtistFilterService } from '../../services/artist-filter.service';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule,
    MatSlideToggleModule
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterService = inject(ArtistFilterService);
  private readonly priceChange$ = new Subject<{ min: number; max: number }>();

  readonly filters = this.filterService.currentFilters;
  readonly tattooStyles = TATTOO_STYLES;
  readonly minPriceInput = signal<number | null>(null);
  readonly maxPriceInput = signal<number | null>(null);

  constructor() {
    effect(
      () => {
        const filters = this.filters();
        this.minPriceInput.set(filters.minPrice ?? null);
        this.maxPriceInput.set(filters.maxPrice ?? null);
      }
    );

    this.priceChange$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(({ min, max }) => this.filterService.updatePriceRange(min, max));
  }

  toggleStyle(style: string, event: MatCheckboxChange): void {
    const nextStyle = event.checked ? style : undefined;
    this.filterService.updateFilter('style', nextStyle);
  }

  onMinPriceInput(value: string): void {
    this.minPriceInput.set(this.parseInputValue(value));
    this.emitPriceRange();
  }

  onMaxPriceInput(value: string): void {
    this.maxPriceInput.set(this.parseInputValue(value));
    this.emitPriceRange();
  }

  setMinRating(rating: number): void {
    const currentRating = this.filters().minRating;
    this.filterService.updateFilter('minRating', currentRating === rating ? undefined : rating);
  }

  setToggleFilter(key: 'certified' | 'available', event: MatSlideToggleChange): void {
    this.filterService.updateFilter(key, event.checked ? true : undefined);
  }

  setArtistType(event: MatRadioChange): void {
    const value = event.value as ArtistFilters['type'] | 'all';
    this.filterService.updateFilter('type', value === 'all' ? null : value);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
  }

  private emitPriceRange(): void {
    this.priceChange$.next({
      min: this.minPriceInput() ?? 0,
      max: this.maxPriceInput() ?? 0
    });
  }

  private parseInputValue(value: string): number | null {
    if (value.trim().length === 0) {
      return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
  }
}
