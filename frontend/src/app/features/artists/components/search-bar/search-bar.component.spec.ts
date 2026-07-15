import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { SearchBarComponent } from './search-bar.component';
import { ArtistFilterService } from '../../services/artist-filter.service';
import { environment } from '../../../../../environments/environment';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let mockFilterService: jasmine.SpyObj<ArtistFilterService> & { currentFilters: ReturnType<typeof signal> };
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    mockFilterService = {
      ...jasmine.createSpyObj('ArtistFilterService', ['updateFilter', 'clearFilters', 'loadArtists']),
      currentFilters: signal({ page: 1, pageSize: 12 }),
      results: signal(null),
      loading: signal(false),
      error: signal(null)
    } as any;

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArtistFilterService, useValue: mockFilterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders_search_input_and_icon', () => {
    const input = fixture.nativeElement.querySelector('.search-bar__input');
    const icon = fixture.nativeElement.querySelector('.search-bar__icon');
    expect(input).toBeTruthy();
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain('search');
  });

  it('debounces_filter_update', fakeAsync(() => {
    const input = fixture.nativeElement.querySelector('.search-bar__input') as HTMLInputElement;
    input.value = 'alice';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(mockFilterService.updateFilter).not.toHaveBeenCalled();

    tick(300);

    // Flush the suggestions request triggered by debounce
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/artists/suggestions`
    );
    req.flush({ styles: [], communes: [] });

    expect(mockFilterService.updateFilter).toHaveBeenCalledWith('search', 'alice');
  }));

  it('does_not_call_filter_for_single_char', fakeAsync(() => {
    const input = fixture.nativeElement.querySelector('.search-bar__input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    tick(300);

    expect(mockFilterService.updateFilter).not.toHaveBeenCalled();
  }));

  it('clear_button_visible_when_text_present', () => {
    const input = fixture.nativeElement.querySelector('.search-bar__input') as HTMLInputElement;
    input.value = 'alice';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('.search-bar__clear');
    expect(clearBtn).toBeTruthy();
  });

  it('clear_button_clears_input', fakeAsync(() => {
    const input = fixture.nativeElement.querySelector('.search-bar__input') as HTMLInputElement;
    input.value = 'alice';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(300);

    // Flush the suggestions request
    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/artists/suggestions`
    );
    req.flush({ styles: [], communes: [] });

    mockFilterService.updateFilter.calls.reset();

    const clearBtn = fixture.nativeElement.querySelector('.search-bar__clear') as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(component.searchText()).toBe('');
    expect(mockFilterService.updateFilter).toHaveBeenCalledWith('search', undefined);
  }));

  it('shows_suggestions_dropdown', fakeAsync(() => {
    const input = fixture.nativeElement.querySelector('.search-bar__input') as HTMLInputElement;
    input.value = 'black';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    tick(300);

    const req = httpTesting.expectOne(
      (r) => r.url === `${environment.apiUrl}/artists/suggestions` && r.params.get('q') === 'black'
    );
    req.flush({ styles: ['blackwork'], communes: ['Santiago'] });
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.search-bar__dropdown');
    expect(dropdown).toBeTruthy();

    const options = fixture.nativeElement.querySelectorAll('.search-bar__option');
    expect(options.length).toBe(2);
    expect(options[0].textContent.trim()).toBe('Blackwork');
    expect(options[1].textContent.trim()).toBe('Santiago');
  }));
});
