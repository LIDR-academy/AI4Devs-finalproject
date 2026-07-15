import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaymentReturnComponent } from './payment-return.component';
import { BookingService } from '../services/booking.service';
import { Booking } from '../../../core/models/booking.models';

function mockBooking(status: string): Booking {
  return {
    id: 'b1b2b3b4-0000-0000-0000-000000000000',
    clientId: 'c1',
    artist: {
      artistProfileId: 'a1',
      artistName: 'Alice Black',
      slug: 'alice-black',
      profilePhotoUrl: null
    },
    status,
    bookingDate: '2026-08-03',
    startTime: '10:00',
    endTime: '12:00',
    estimatedPriceMin: 40000,
    estimatedPriceMax: 60000,
    depositAmount: 12000,
    notes: null,
    createdAt: new Date().toISOString(),
    expiresAt: null
  };
}

describe('PaymentReturnComponent', () => {
  let fixture: ComponentFixture<PaymentReturnComponent>;
  let component: PaymentReturnComponent;
  let bookingService: BookingService;

  function configure(status: string): void {
    TestBed.configureTestingModule({
      imports: [PaymentReturnComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { bookingId: 'b1b2b3b4-0000-0000-0000-000000000000' },
              queryParams: { status }
            }
          }
        }
      ]
    });
    bookingService = TestBed.inject(BookingService);
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(PaymentReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('con status=success muestra la confirmación con los datos de la reserva (CA4)', () => {
    configure('success');
    spyOn(bookingService, 'getBooking').and.returnValue(of(mockBooking('confirmed')));

    createComponent();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('¡Reserva confirmada!');
    expect(text).toContain('B1B2B3B4');
    expect(text).toContain('Alice Black');
    expect(text).toContain('10:00 — 12:00');
    expect(text).toContain('12.000');
  });

  it('con status=failed muestra el error con opción de reintentar (CA5)', () => {
    configure('failed');
    spyOn(bookingService, 'getBooking').and.returnValue(of(mockBooking('pending_payment')));

    createComponent();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('El pago no se completó');
    expect(text).toContain('Reintentar pago');
  });

  it('reintentar crea una nueva orden y redirige al checkout', () => {
    configure('failed');
    spyOn(bookingService, 'getBooking').and.returnValue(of(mockBooking('pending_payment')));
    const createSpy = spyOn(bookingService, 'createPayment').and.returnValue(
      of({ paymentUrl: 'http://flow.test/checkout?token=t2', token: 't2' })
    );
    const redirectSpy = spyOn(bookingService, 'redirectTo');
    createComponent();

    component.retryPayment();

    expect(createSpy).toHaveBeenCalledWith('b1b2b3b4-0000-0000-0000-000000000000');
    expect(redirectSpy).toHaveBeenCalledWith('http://flow.test/checkout?token=t2');
  });

  it('confía en el estado del booking sobre el query param (webhook en vuelo)', () => {
    configure('failed');
    spyOn(bookingService, 'getBooking').and.returnValue(of(mockBooking('confirmed')));

    createComponent();
    fixture.detectChanges();

    expect(component.success()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('¡Reserva confirmada!');
  });

  it('muestra no encontrada si el booking no existe', () => {
    configure('success');
    spyOn(bookingService, 'getBooking').and.returnValue(throwError(() => new Error('404')));

    createComponent();
    fixture.detectChanges();

    expect(component.notFound()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Reserva no encontrada');
  });
});
