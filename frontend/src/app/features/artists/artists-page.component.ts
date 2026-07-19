import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ArtistFilters } from '../../core/models/artist-filter.models';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ArtistFilterService } from './services/artist-filter.service';

@Component({
  selector: 'app-artists-page',
  standalone: true,
  imports: [ArtistCardComponent, FilterPanelComponent, SearchBarComponent, MatIconModule],
  templateUrl: './artists-page.component.html',
  styleUrl: './artists-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly filterService = inject(ArtistFilterService);
  private readonly filtersInitialized = signal(false);

  readonly showFilters = signal(false);
  readonly showFilterPanel = signal(true);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly sortBy = signal<'relevance' | 'rating' | 'priceAsc' | 'priceDesc' | 'reviews'>('relevance');
  readonly results = this.filterService.results.asReadonly();
  readonly loading = this.filterService.loading.asReadonly();
  readonly error = this.filterService.error.asReadonly();
  readonly artists = computed(() => {
    let data = this.results()?.data ?? [];
    // Client-side filter: awarded (backend doesn't support this param)
    if (this.filterService.currentFilters().awarded) {
      data = data.filter(a => a.hasAwards);
    }
    switch (this.sortBy()) {
      case 'rating':
        return [...data].sort((a, b) => b.averageRating - a.averageRating);
      case 'priceAsc':
        return [...data].sort((a, b) => a.hourlyRate - b.hourlyRate);
      case 'priceDesc':
        return [...data].sort((a, b) => b.hourlyRate - a.hourlyRate);
      case 'reviews':
        return [...data].sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return data;
    }
  });

  onSortChange(value: string): void {
    this.sortBy.set(value as 'relevance' | 'rating' | 'priceAsc' | 'priceDesc' | 'reviews');
  }

  constructor() {
    effect(() => {
      if (!this.filtersInitialized()) {
        return;
      }

      const filters = this.filterService.currentFilters();
      const queryParams = this.buildQueryParams(filters);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        replaceUrl: true
      });
    });
  }

  ngOnInit(): void {
    this.filterService.hydrateFilters(this.route.snapshot.queryParams);
    this.filtersInitialized.set(true);
    this.filterService.loadArtists();
  }

  clearFilters(): void {
    this.filterService.clearFilters();
  }

  retry(): void {
    this.filterService.loadArtists();
  }

  openFilters(): void {
    this.showFilters.set(true);
  }

  closeFilters(): void {
    this.showFilters.set(false);
  }

  private buildQueryParams(filters: ArtistFilters): Params {
    const queryParams: Params = {};

    if (filters.styles && filters.styles.length > 0) {
      queryParams['styles'] = filters.styles.join(',');
    }

    if (filters.minPrice != null && filters.minPrice > 0) {
      queryParams['minPrice'] = filters.minPrice;
    }

    if (filters.maxPrice != null && filters.maxPrice > 0) {
      queryParams['maxPrice'] = filters.maxPrice;
    }

    if (filters.minRating != null) {
      queryParams['minRating'] = filters.minRating;
    }

    if (filters.certified != null) {
      queryParams['certified'] = filters.certified;
    }

    if (filters.available != null) {
      queryParams['available'] = filters.available;
    }

    if (filters.awarded != null) {
      queryParams['awarded'] = filters.awarded;
    }

    if (filters.commune) {
      queryParams['commune'] = filters.commune;
    }

    if (filters.type) {
      queryParams['type'] = filters.type;
    }

    if (filters.search && filters.search.length >= 2) {
      queryParams['search'] = filters.search;
    }

    if (filters.page !== 1) {
      queryParams['page'] = filters.page;
    }

    if (filters.pageSize !== 12) {
      queryParams['pageSize'] = filters.pageSize;
    }

    return queryParams;
  }
}
