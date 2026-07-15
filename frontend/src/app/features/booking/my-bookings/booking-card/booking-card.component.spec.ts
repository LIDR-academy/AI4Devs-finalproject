import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingCardComponent } from './booking-card.component';
import { Booking } from '../../../../core/models/booking.models';

function mockBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b1',
    clientId: 'c1',
    artist: {
      artistProfileId: 'a1',
      artistName: 'Alice Black',
      slug: 'alice-black',
      profilePhotoUrl: null
    },
    status: 'confirmed',
    bookingDate: '2099-08-03',
    startTime: '10:00',
    endTime: '12:00',
    estimatedPriceMin: 40000,
    estimatedPriceMax: 60000,
    depositAmount: 12000,
    hasReview: false,
    notes: null,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    ...overrides
  };
}

describe('BookingCardComponent', () => {
  let fixture: ComponentFixture<BookingCardComponent>;
  let component: BookingCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookingCardComponent],
      providers: [provideRouter([])]
    });
  });

  function createComponent(booking: Booking): void {
    fixture = TestBed.createComponent(BookingCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('booking', booking);
    fixture.detectChanges();
  }

  it('reserva confirmada futura muestra "Cancelar reserva" pero no "Confirmar asistencia" (CA8, CA10)', () => {
    createComponent(mockBooking());

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Cancelar reserva');
    expect(text).not.toContain('Confirmar asistencia');
  });

  it('reserva confirmada pasada muestra "Confirmar asistencia" (CA8)', () => {
    createComponent(mockBooking({ bookingDate: '2020-01-06' }));

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Confirmar asistencia');
    expect(text).not.toContain('Cancelar reserva');
  });

  it('completada sin reseña muestra CTA Calificar (CA6)', () => {
    createComponent(mockBooking({ status: 'completed', bookingDate: '2020-01-06' }));
    expect(fixture.nativeElement.textContent).toContain('Calificar');
  });

  it('completada con reseña no muestra CTA Calificar', () => {
    createComponent(mockBooking({ status: 'completed', bookingDate: '2020-01-06', hasReview: true }));
    expect(fixture.nativeElement.textContent).not.toContain('Calificar');
  });

  it('hold vivo (pending_payment no expirado) muestra "Continuar pago"', () => {
    createComponent(mockBooking({
      status: 'pending_payment',
      expiresAt: new Date(Date.now() + 4 * 60000).toISOString()
    }));

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Continuar pago');
    expect(text).not.toContain('Cancelar reserva');
  });

  it('hold expirado no muestra "Continuar pago"', () => {
    createComponent(mockBooking({
      status: 'pending_payment',
      expiresAt: new Date(Date.now() - 60000).toISOString()
    }));

    expect(fixture.nativeElement.textContent).not.toContain('Continuar pago');
  });

  it('pide confirmación antes de emitir la acción (diálogo CA10)', () => {
    createComponent(mockBooking({ bookingDate: '2020-01-06' }));
    let emitted = false;
    component.complete.subscribe(() => (emitted = true));

    component.ask('complete');
    fixture.detectChanges();

    expect(emitted).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('¿Asististe a esta sesión?');

    component.confirmPending();
    expect(emitted).toBeTrue();
  });

  it('el diálogo de cancelación recuerda la política de cancelación', () => {
    createComponent(mockBooking());
    component.ask('cancel');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('política de cancelación');
  });

  it('expande el detalle al hacer click (CA5)', () => {
    createComponent(mockBooking({ bodyZone: 'Antebrazo', notes: 'Diseño propio' }));

    (fixture.nativeElement.querySelector('.booking-card__main') as HTMLButtonElement).click();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Antebrazo');
    expect(text).toContain('Diseño propio');
    expect(text).toContain('Precio estimado');
  });
});
