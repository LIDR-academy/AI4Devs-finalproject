import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BookingSummaryComponent } from './booking-summary.component';
import { BookingService } from '../services/booking.service';
import { Booking } from '../../../core/models/booking.models';

function mockBooking(expiresInSeconds: number): Booking {
  return {
    id: 'b1',
    clientId: 'c1',
    artist: {
      artistProfileId: 'a1',
      artistName: 'Alice Black',
      slug: 'alice-black',
      profilePhotoUrl: null
    },
    status: 'pending_payment',
    bookingDate: '2026-08-03',
    startTime: '10:00',
    endTime: '12:00',
    estimatedPriceMin: 40000,
    estimatedPriceMax: 60000,
    depositAmount: 12000,
    notes: null,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString()
  };
}

describe('BookingSummaryComponent', () => {
  let fixture: ComponentFixture<BookingSummaryComponent>;
  let component: BookingSummaryComponent;
  let bookingService: BookingService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookingSummaryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    bookingService = TestBed.inject(BookingService);
    router = TestBed.inject(Router);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(BookingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('redirige al home si no hay reserva en curso', () => {
    const navigateSpy = spyOn(router, 'navigate');
    bookingService.currentBooking.set(null);

    createComponent();

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('muestra los datos de la reserva con el depósito calculado', fakeAsync(() => {
    bookingService.currentBooking.set(mockBooking(300));
    createComponent();
    tick(1000);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Alice Black');
    expect(text).toContain('10:00 — 12:00');
    expect(text).toContain('2 h');
    expect(text).toContain('12.000');
    discardPeriodicTasks();
  }));

  it('el countdown avanza cada segundo', fakeAsync(() => {
    bookingService.currentBooking.set(mockBooking(300));
    createComponent();

    const initial = component.remainingSeconds();
    tick(5000);
    expect(component.remainingSeconds()).toBeLessThan(initial);
    discardPeriodicTasks();
  }));

  it('al expirar muestra el mensaje y deshabilita el pago', fakeAsync(() => {
    bookingService.currentBooking.set(mockBooking(2));
    createComponent();

    tick(3000);
    fixture.detectChanges();

    expect(component.expired()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Tiempo expirado');
    const payButton: HTMLButtonElement = fixture.nativeElement.querySelector('.summary__pay');
    expect(payButton.disabled).toBeTrue();
  }));

  it('el botón pagar crea la orden Flow y redirige al checkout (US0009 CA1)', fakeAsync(() => {
    bookingService.currentBooking.set(mockBooking(300));
    createComponent();
    const createSpy = spyOn(bookingService, 'createPayment').and.returnValue(
      of({ paymentUrl: 'http://flow.test/checkout?token=t1', token: 't1' })
    );
    const redirectSpy = spyOn(bookingService, 'redirectTo');

    component.payDeposit();

    expect(createSpy).toHaveBeenCalledWith('b1');
    expect(redirectSpy).toHaveBeenCalledWith('http://flow.test/checkout?token=t1');
    discardPeriodicTasks();
  }));

  it('muestra error si la creación del pago falla', fakeAsync(() => {
    bookingService.currentBooking.set(mockBooking(300));
    createComponent();
    spyOn(bookingService, 'createPayment').and.returnValue(throwError(() => new Error('fail')));

    component.payDeposit();
    fixture.detectChanges();

    expect(component.paymentError()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('No pudimos iniciar el pago');
    discardPeriodicTasks();
  }));
});
