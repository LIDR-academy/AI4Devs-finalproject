import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReviewFormComponent } from './review-form.component';
import { ReviewService } from '../services/review.service';
import { ReviewDto } from '../../../core/models/booking.models';

function mockReviewDto(): ReviewDto {
  return {
    id: 'rv1',
    clientName: 'Carla Cliente',
    ratingHygiene: 5,
    ratingPainManagement: 4,
    ratingCustomerService: 5,
    ratingResult: 4,
    averageRating: 4.5,
    comment: 'Excelente',
    tattooPhotoUrl: null,
    createdAt: new Date().toISOString()
  };
}

function stubRoute(bookingId = 'booking-123'): Partial<ActivatedRoute> {
  return { snapshot: { paramMap: { get: () => bookingId } } as any };
}

describe('ReviewFormComponent', () => {
  let fixture: ComponentFixture<ReviewFormComponent>;
  let component: ReviewFormComponent;
  let reviewService: ReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReviewFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'mis-reservas', component: ReviewFormComponent }]),
        { provide: ActivatedRoute, useValue: stubRoute() }
      ]
    });
    reviewService = TestBed.inject(ReviewService);
    fixture = TestBed.createComponent(ReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('el botón Enviar está deshabilitado cuando no se han dado los 4 ratings (CA2)', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[type="submit"]');
    expect(btn.disabled).toBeTrue();
  });

  it('el botón Enviar se habilita cuando todos los ratings son >= 1', () => {
    // set all 4 ratings via the signal
    (component as any).ratingHygiene.set(5);
    (component as any).ratingPainManagement.set(4);
    (component as any).ratingCustomerService.set(5);
    (component as any).ratingResult.set(4);
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[type="submit"]');
    expect(btn.disabled).toBeFalse();
  });

  it('submit llama al servicio con los datos correctos', fakeAsync(() => {
    const spy = spyOn(reviewService, 'createReview').and.returnValue(of(mockReviewDto()));
    (component as any).ratingHygiene.set(5);
    (component as any).ratingPainManagement.set(4);
    (component as any).ratingCustomerService.set(5);
    (component as any).ratingResult.set(4);
    (component as any).comment.set('Excelente experiencia');
    fixture.detectChanges();

    (component as any).submit();
    tick();

    expect(spy).toHaveBeenCalledOnceWith('booking-123', {
      ratingHygiene: 5,
      ratingPainManagement: 4,
      ratingCustomerService: 5,
      ratingResult: 4,
      comment: 'Excelente experiencia',
      tattooPhotoUrl: null
    });
  }));

  it('error 409 muestra mensaje "ya tiene una calificación"', fakeAsync(() => {
    spyOn(reviewService, 'createReview').and.returnValue(
      throwError(() => ({ status: 409 }))
    );
    (component as any).ratingHygiene.set(3);
    (component as any).ratingPainManagement.set(3);
    (component as any).ratingCustomerService.set(3);
    (component as any).ratingResult.set(3);
    fixture.detectChanges();

    (component as any).submit();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ya tiene una calificación');
  }));

  it('error genérico muestra mensaje de reintento', fakeAsync(() => {
    spyOn(reviewService, 'createReview').and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    (component as any).ratingHygiene.set(3);
    (component as any).ratingPainManagement.set(3);
    (component as any).ratingCustomerService.set(3);
    (component as any).ratingResult.set(3);
    fixture.detectChanges();

    (component as any).submit();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Inténtalo de nuevo');
  }));

  it('counter de caracteres del comentario se actualiza', () => {
    (component as any).comment.set('Hola mundo');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('10 / 500');
  });
});
