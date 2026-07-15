import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { ShowcasePageComponent } from './showcase-page.component';
import { ShowcaseService } from '../showcase.service';
import { ShowcaseResponse } from '../../../core/models/showcase.models';

const mockResponse: ShowcaseResponse = {
  sections: [
    { key: 'near_you', title: 'Cerca de ti', items: [] },
    { key: 'top_rated', title: 'Mejor calificados', items: [] },
    { key: 'popular_styles', title: 'Estilos populares', items: [] },
    { key: 'awarded_artists', title: 'Artistas premiados', items: [] }
  ]
};

describe('ShowcasePageComponent', () => {
  let fixture: ComponentFixture<ShowcasePageComponent>;
  let mockService: jasmine.SpyObj<ShowcaseService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ShowcaseService', ['getShowcase']);

    // Simulate geolocation permission denied so fetchSections is called without coords
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
      (_success, error) => { error?.({ code: 1, message: 'denied' } as GeolocationPositionError); }
    );

    await TestBed.configureTestingModule({
      imports: [ShowcasePageComponent],
      providers: [
        { provide: ShowcaseService, useValue: mockService },
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('renders 4 showcase sections when API returns data', () => {
    mockService.getShowcase.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const sections = fixture.nativeElement.querySelectorAll('app-showcase-section');
    expect(sections.length).toBe(4);
  });

  it('shows error message when API fails', () => {
    mockService.getShowcase.and.returnValue(throwError(() => new Error('Network error')));

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const error: HTMLElement = fixture.nativeElement.querySelector('.showcase-page__error');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('No se pudo cargar la vitrina');
  });

  it('shows skeleton while loading', () => {
    // Service returns an observable that never completes
    mockService.getShowcase.and.returnValue(new Subject());

    fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.showcase-page__skeleton');
    expect(skeleton).toBeTruthy();
  });
});
