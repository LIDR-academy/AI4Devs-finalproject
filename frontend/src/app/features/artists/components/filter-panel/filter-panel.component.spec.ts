import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal, WritableSignal } from '@angular/core';
import { FilterPanelComponent } from './filter-panel.component';
import { ArtistFilterService } from '../../services/artist-filter.service';

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<FilterPanelComponent>;
  let mockService: {
    currentFilters: WritableSignal<{ page: number; pageSize: number }>;
    updateFilter: jasmine.Spy;
    updatePriceRange: jasmine.Spy;
    clearFilters: jasmine.Spy;
  };

  beforeEach(async () => {
    mockService = {
      currentFilters: signal({ page: 1, pageSize: 12 }),
      updateFilter: jasmine.createSpy('updateFilter'),
      updatePriceRange: jasmine.createSpy('updatePriceRange'),
      clearFilters: jasmine.createSpy('clearFilters')
    };

    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ArtistFilterService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    fixture.detectChanges();
  });

  it('debounces price slider updates by 300ms', fakeAsync(() => {
    const slider = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;

    slider.value = '80000';
    slider.dispatchEvent(new Event('input'));
    tick(299);

    expect(mockService.updatePriceRange).not.toHaveBeenCalled();

    tick(1);

    expect(mockService.updatePriceRange).toHaveBeenCalledOnceWith(0, 80000);
  }));
});
