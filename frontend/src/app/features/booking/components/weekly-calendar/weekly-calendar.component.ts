import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { BookableSlot } from '../../../../core/models/booking.models';
import { BookingService } from '../../services/booking.service';

interface CalendarDay {
  date: string;
  label: string;
  dayNumber: number;
  slots: BookableSlot[];
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** US0008 CA1-CA3 — Weekly calendar with bookable slots (future weeks only). */
@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  templateUrl: './weekly-calendar.component.html',
  styleUrl: './weekly-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyCalendarComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly artistProfileId = input.required<string>();
  readonly slotSelected = output<BookableSlot>();

  readonly weekStart = signal<string>(WeeklyCalendarComponent.mondayOf(new Date()));
  readonly slots = signal<BookableSlot[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly selectedSlot = signal<BookableSlot | null>(null);

  readonly canGoPrevious = computed(
    () => this.weekStart() > WeeklyCalendarComponent.mondayOf(new Date())
  );

  readonly days = computed<CalendarDay[]>(() => {
    const start = this.weekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const date = WeeklyCalendarComponent.addDays(start, i);
      return {
        date,
        label: DAY_LABELS[i],
        dayNumber: Number(date.slice(8, 10)),
        slots: this.slots().filter((s) => s.date === date)
      };
    });
  });

  ngOnInit(): void {
    this.loadWeek();
  }

  previousWeek(): void {
    if (!this.canGoPrevious()) {
      return;
    }
    this.weekStart.update((w) => WeeklyCalendarComponent.addDays(w, -7));
    this.loadWeek();
  }

  nextWeek(): void {
    this.weekStart.update((w) => WeeklyCalendarComponent.addDays(w, 7));
    this.loadWeek();
  }

  selectSlot(slot: BookableSlot): void {
    if (!slot.isAvailable) {
      return;
    }
    this.selectedSlot.set(slot);
    this.slotSelected.emit(slot);
  }

  reload(): void {
    this.loadWeek();
  }

  weekRangeLabel(): string {
    const start = this.weekStart();
    const end = WeeklyCalendarComponent.addDays(start, 6);
    return `${this.formatShort(start)} — ${this.formatShort(end)}`;
  }

  private formatShort(date: string): string {
    const [, month, day] = date.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${Number(day)} ${months[Number(month) - 1]}`;
  }

  private loadWeek(): void {
    this.loading.set(true);
    this.error.set(false);
    this.bookingService.getWeekAvailability(this.artistProfileId(), this.weekStart()).subscribe({
      next: (response) => {
        this.slots.set(response.slots);
        this.loading.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  static mondayOf(date: Date): string {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (local.getDay() + 6) % 7; // 0=Monday
    local.setDate(local.getDate() - offset);
    return WeeklyCalendarComponent.toIso(local);
  }

  static addDays(isoDate: string, days: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day + days);
    return WeeklyCalendarComponent.toIso(date);
  }

  private static toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
