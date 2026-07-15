import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { ArtistSuggestionsResponse, TATTOO_STYLES } from '../../../../core/models/artist-filter.models';
import { ArtistFilterService } from '../../services/artist-filter.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  private readonly filterService = inject(ArtistFilterService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  readonly searchText = signal('');
  readonly showDropdown = signal(false);
  readonly suggestions = signal<ArtistSuggestionsResponse | null>(null);
  readonly dropdownStyle = signal<{ top: string; left: string; width: string }>({
    top: '0px', left: '0px', width: '0px'
  });

  private readonly searchSubject = new Subject<string>();
  private readonly suggestionsSubject = new Subject<string>();

  constructor() {
    const currentSearch = this.filterService.currentFilters().search;
    if (currentSearch) {
      this.searchText.set(currentSearch);
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((value) => {
      if (value.length >= 2) {
        this.filterService.updateFilter('search', value);
      } else if (value.length === 0) {
        this.filterService.updateFilter('search', undefined);
      }
    });

    this.suggestionsSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value) => value.length >= 2),
      switchMap((value) =>
        this.http.get<ArtistSuggestionsResponse>(
          `${environment.apiUrl}/artists/suggestions`,
          { params: { q: value } }
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response) => {
      this.suggestions.set(response);
      if (response.styles.length > 0 || response.communes.length > 0) {
        this.updateDropdownPosition();
        this.showDropdown.set(true);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.showDropdown()) {
      this.updateDropdownPosition();
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.searchSubject.next(value);
    this.suggestionsSubject.next(value);

    if (value.length < 2) {
      this.showDropdown.set(false);
      this.suggestions.set(null);
    }
  }

  clearSearch(): void {
    this.searchText.set('');
    this.showDropdown.set(false);
    this.suggestions.set(null);
    this.filterService.updateFilter('search', undefined);
  }

  selectSuggestion(value: string): void {
    this.searchText.set(value);
    this.showDropdown.set(false);
    this.filterService.updateFilter('search', value);
  }

  getStyleName(slug: string): string {
    const style = TATTOO_STYLES.find((s) => s.slug === slug);
    return style ? style.name : slug;
  }

  private updateDropdownPosition(): void {
    const hostEl: HTMLElement = this.elementRef.nativeElement;
    const rect = hostEl.getBoundingClientRect();
    this.dropdownStyle.set({
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    });
  }
}
