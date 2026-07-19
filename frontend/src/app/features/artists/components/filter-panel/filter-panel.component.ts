import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { ArtistFilters, COMMUNE_OPTIONS, TATTOO_STYLES } from '../../../../core/models/artist-filter.models';
import { ArtistFilterService } from '../../services/artist-filter.service';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterService = inject(ArtistFilterService);
  private readonly priceChange$ = new Subject<number>();

  readonly filters = this.filterService.currentFilters;
  readonly tattooStyles = TATTOO_STYLES;
  readonly communeOptions = COMMUNE_OPTIONS;
  readonly ratingOptions = [
    { value: 0, label: 'Todos' },
    { value: 3, label: '3+★' },
    { value: 4, label: '4+★' },
    { value: 4.5, label: '4.5+★' },
    { value: 5, label: '5★' }
  ];
  readonly typeOptions: { value: 'all' | 'independent' | 'studio'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'independent', label: 'Independiente' },
    { value: 'studio', label: 'Estudio' }
  ];
  readonly maxPriceSlider = signal(110000);

  constructor() {
    effect(
      () => {
        const filters = this.filters();
        this.maxPriceSlider.set(filters.maxPrice ?? 110000);
      }
    );

    this.priceChange$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((max) => this.filterService.updatePriceRange(0, max < 110000 ? max : 0));
  }

  toggleStyle(slug: string): void {
    const current = this.filters().styles ?? [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    this.filterService.updateFilter('styles', next.length > 0 ? next : undefined);
  }

  isStyleActive(slug: string): boolean {
    return this.filters().styles?.includes(slug) ?? false;
  }

  onMaxPriceSlider(value: string): void {
    const v = Number(value);
    this.maxPriceSlider.set(v);
    this.priceChange$.next(v);
  }

  setMinRating(rating: number): void {
    this.filterService.updateFilter('minRating', rating === 0 ? undefined : rating);
  }

  toggleFilter(key: 'certified' | 'available' | 'awarded'): void {
    const current = !!this.filters()[key];
    this.filterService.updateFilter(key, current ? undefined : true);
  }

  setArtistType(value: 'all' | 'independent' | 'studio'): void {
    this.filterService.updateFilter('type', value === 'all' ? null : (value as ArtistFilters['type']));
  }

  setCommune(value: string): void {
    this.filterService.updateFilter('commune', value || undefined);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
  }

  formatCLP(value: number): string {
    return '$' + value.toLocaleString('es-CL');
  }
}
