import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MapViewComponent } from './map-view.component';
import { MapService } from './map.service';

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;
  let mapService: MapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MapService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    // Prevent Leaflet initialization in test environment (no real DOM map)
    spyOn(component as any, 'initializeMap').and.returnValue(undefined);
    spyOn(component as any, 'requestUserLocation').and.callFake(() => {
      (component as any).userLocation.set({ lat: -33.4489, lng: -70.6693 });
      (component as any).locationLoading.set(false);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle between map and list view', () => {
    expect(component.viewMode()).toBe('map');

    component.setViewMode('list');
    expect(component.viewMode()).toBe('list');

    component.setViewMode('map');
    expect(component.viewMode()).toBe('map');
  });

  it('should change radius and trigger filter change', () => {
    const loadSpy = spyOn(mapService, 'loadArtistsByLocation');
    
    component.onRadiusChange(5);
    expect(component.selectedRadius()).toBe(5);
    
    component.onRadiusChange(1);
    expect(component.selectedRadius()).toBe(1);
  });

  it('should have correct default radius', () => {
    expect(component.selectedRadius()).toBe(10);
  });

  it('should have radius options available', () => {
    expect(component.radiusOptions.length).toBe(4);
    expect(component.radiusOptions.map(o => o.value)).toEqual([1, 5, 10, 0]);
  });

  it('should toggle filters panel', () => {
    expect(component.showFilters()).toBeFalse();
    
    component.toggleFilters();
    expect(component.showFilters()).toBeTrue();
    
    component.toggleFilters();
    expect(component.showFilters()).toBeFalse();
  });

  it('should toggle style selection', () => {
    expect(component.selectedStyles()).toEqual([]);

    component.onStyleToggle('realismo', true);
    expect(component.selectedStyles()).toContain('realismo');

    component.onStyleToggle('blackwork', true);
    expect(component.selectedStyles()).toContain('blackwork');

    component.onStyleToggle('realismo', false);
    expect(component.selectedStyles()).not.toContain('realismo');
    expect(component.selectedStyles()).toContain('blackwork');
  });

  it('should toggle min rating', () => {
    expect(component.minRating()).toBeUndefined();

    component.onMinRatingChange(4);
    expect(component.minRating()).toBe(4);

    // Clicking same rating should deselect
    component.onMinRatingChange(4);
    expect(component.minRating()).toBeUndefined();
  });

  it('should clear all filters', () => {
    component.onStyleToggle('realismo', true);
    component.onMinRatingChange(3);
    component.onCertifiedChange(true);
    component.onArtistTypeChange('independent');

    component.clearAllFilters();

    expect(component.selectedStyles()).toEqual([]);
    expect(component.minRating()).toBeUndefined();
    expect(component.certifiedOnly()).toBeUndefined();
    expect(component.artistType()).toBeNull();
  });
});
