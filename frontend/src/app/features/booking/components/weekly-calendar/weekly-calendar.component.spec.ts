import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WeeklyCalendarComponent } from './weekly-calendar.component';
import { BookingService } from '../../services/booking.service';
import { BookableSlot, WeekAvailabilityResponse } from '../../../../core/models/booking.models';

describe('WeeklyCalendarComponent', () => {
  let fixture: ComponentFixture<WeeklyCalendarComponent>;
  let component: WeeklyCalendarComponent;
  let bookingService: jasmine.SpyObj<BookingService>;

  const currentMonday = WeeklyCalendarComponent.mondayOf(new Date());

  const mockResponse: WeekAvailabilityResponse = {
    weekStart: currentMonday,
    slots: [
      { date: currentMonday, startTime: '10:00', endTime: '12:00', isAvailable: true },
      { date: currentMonday, startTime: '12:00', endTime: '14:00', isAvailable: false }
    ]
  };

  function createComponent(): void {
    fixture = TestBed.createComponent(WeeklyCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('artistProfileId', 'artist-1');
    fixture.detectChanges();
  }

  beforeEach(() => {
    bookingService = jasmine.createSpyObj<BookingService>('BookingService', ['getWeekAvailability']);
    bookingService.getWeekAvailability.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      imports: [WeeklyCalendarComponent],
      providers: [{ provide: BookingService, useValue: bookingService }]
    });
  });

  it('carga los slots de la semana actual al iniciar', () => {
    createComponent();

    expect(bookingService.getWeekAvailability).toHaveBeenCalledWith('artist-1', currentMonday);
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('.calendar__slot');
    expect(buttons.length).toBe(2);
  });

  it('deshabilita los slots ocupados', () => {
    createComponent();

    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('.calendar__slot');
    expect(buttons[0].disabled).toBeFalse();
    expect(buttons[1].disabled).toBeTrue();
  });

  it('emite slotSelected al hacer click en un slot disponible', () => {
    createComponent();
    let emitted: BookableSlot | undefined;
    component.slotSelected.subscribe((slot) => (emitted = slot));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.calendar__slot');
    button.click();

    expect(emitted).toEqual(mockResponse.slots[0]);
  });

  it('no emite al seleccionar un slot no disponible', () => {
    createComponent();
    let emitted = false;
    component.slotSelected.subscribe(() => (emitted = true));

    component.selectSlot(mockResponse.slots[1]);

    expect(emitted).toBeFalse();
  });

  it('no permite navegar a semanas pasadas', () => {
    createComponent();

    expect(component.canGoPrevious()).toBeFalse();
    component.previousWeek();
    expect(component.weekStart()).toBe(currentMonday);
  });

  it('navega a la semana siguiente y permite volver', () => {
    createComponent();
    const nextMonday = WeeklyCalendarComponent.addDays(currentMonday, 7);

    component.nextWeek();

    expect(component.weekStart()).toBe(nextMonday);
    expect(bookingService.getWeekAvailability).toHaveBeenCalledWith('artist-1', nextMonday);
    expect(component.canGoPrevious()).toBeTrue();

    component.previousWeek();
    expect(component.weekStart()).toBe(currentMonday);
  });

  it('muestra error y permite reintentar cuando la carga falla', () => {
    bookingService.getWeekAvailability.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    expect(component.error()).toBeTrue();

    bookingService.getWeekAvailability.and.returnValue(of(mockResponse));
    component.reload();

    expect(component.error()).toBeFalse();
    expect(component.slots().length).toBe(2);
  });
});
