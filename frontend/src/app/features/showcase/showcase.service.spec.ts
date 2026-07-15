import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShowcaseService } from './showcase.service';
import { ShowcaseResponse } from '../../core/models/showcase.models';

const mockResponse: ShowcaseResponse = {
  sections: [
    { key: 'near_you', title: 'Cerca de ti', items: [] },
    { key: 'top_rated', title: 'Mejor calificados', items: [] },
    { key: 'popular_styles', title: 'Estilos populares', items: [] },
    { key: 'awarded_artists', title: 'Artistas premiados', items: [] }
  ]
};

describe('ShowcaseService', () => {
  let service: ShowcaseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ShowcaseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls GET /showcase without query params when no coords', () => {
    service.getShowcase().subscribe((data) => {
      expect(data.sections.length).toBe(4);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/showcase`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('lat')).toBeFalse();
    req.flush(mockResponse);
  });

  it('calls GET /showcase with lat and lng params when coords are provided', () => {
    service.getShowcase(-33.4372, -70.6506).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/showcase` && r.params.has('lat')
    );
    expect(req.request.params.get('lat')).toBe('-33.4372');
    expect(req.request.params.get('lng')).toBe('-70.6506');
    req.flush(mockResponse);
  });
});
