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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArtistFilters } from '../../core/models/artist-filter.models';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ArtistFilterService } from './services/artist-filter.service';

@Component({
  selector: 'app-artists-page',
  standalone: true,
  imports: [ArtistCardComponent, FilterPanelComponent, SearchBarComponent, MatButtonModule, MatIconModule],
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
  readonly results = this.filterService.results.asReadonly();
  readonly loading = this.filterService.loading.asReadonly();
  readonly error = this.filterService.error.asReadonly();
  readonly artists = computed(() => this.results()?.data ?? []);

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
