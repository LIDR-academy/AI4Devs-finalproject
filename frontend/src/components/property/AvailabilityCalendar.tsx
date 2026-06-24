'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UnavailableDate } from '@/types';

interface DateRange {
  checkIn: string | undefined;
  checkOut: string | undefined;
}

interface AvailabilityCalendarProps {
  unavailableDates: UnavailableDate[];
  onDateRangeSelect: (checkIn: string, checkOut: string) => void;
  selectedRange: DateRange;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isBefore(a: string, b: string): boolean {
  return a < b;
}

function isInRange(date: string, checkIn: string | undefined, checkOut: string | undefined): boolean {
  if (!checkIn || !checkOut) return false;
  return date > checkIn && date < checkOut;
}

/** Build all calendar days for a given year/month (0-indexed month). */
function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return cells;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  today: string;
  unavailableSet: Map<string, string>; // date → reason
  selectedRange: DateRange;
  onDayClick: (isoDate: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  showPrev?: boolean;
  showNext?: boolean;
}

function MonthCalendar({
  year,
  month,
  today,
  unavailableSet,
  selectedRange,
  onDayClick,
  onPrev,
  onNext,
  showPrev = true,
  showNext = true,
}: MonthCalendarProps) {
  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);
  const { checkIn, checkOut } = selectedRange;

  return (
    <div className="flex-1 min-w-0" data-testid="month-calendar">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        {showPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="p-1 rounded hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <h3 className="text-sm font-semibold text-ink">
          {MONTHS[month]} {year}
        </h3>
        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            className="p-1 rounded hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-ink" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-taupe py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} />;
          }

          const iso = toIsoDate(date);
          const isPast = iso < today;
          const reason = unavailableSet.get(iso);
          const isUnavailable = !!reason;
          const isCheckIn = iso === checkIn;
          const isCheckOut = iso === checkOut;
          const inRange = isInRange(iso, checkIn, checkOut);
          const isSelected = isCheckIn || isCheckOut;
          const isDisabled = isPast || isUnavailable;

          let cellClasses =
            'relative h-9 w-full flex items-center justify-center rounded-full text-sm transition-colors ';

          if (isDisabled) {
            cellClasses += 'text-taupe cursor-not-allowed ';
            if (reason === 'booked') cellClasses += 'bg-terracotta-tint/40 ';
            else if (reason === 'blocked') cellClasses += 'bg-canvas ';
            else if (reason === 'held') cellClasses += 'bg-canvas ';
          } else if (isSelected) {
            cellClasses += 'bg-terracotta text-white font-semibold cursor-pointer ';
          } else if (inRange) {
            cellClasses += 'bg-terracotta-tint text-ink rounded-none cursor-pointer ';
          } else {
            cellClasses += 'text-ink hover:bg-canvas cursor-pointer ';
          }

          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onDayClick(iso)}
              className={cellClasses}
              aria-label={`${iso}${isUnavailable ? ` (${reason})` : ''}${isCheckIn ? ' check-in' : ''}${isCheckOut ? ' check-out' : ''}`}
              aria-pressed={isSelected}
              data-date={iso}
              data-unavailable={isUnavailable ? reason : undefined}
            >
              {date.getDate()}
              {/* Dot indicator for unavailable reason */}
              {isUnavailable && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    reason === 'booked'
                      ? 'bg-taupe'
                      : reason === 'blocked'
                        ? 'bg-ink'
                        : 'border border-terracotta bg-transparent'
                  }`}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * AvailabilityCalendar Component (T044)
 *
 * 2-month side-by-side calendar with:
 * - Blocked/booked/held date highlighting
 * - Click to set check-in (first click) or check-out (second click)
 * - Validation: no past dates, no unavailable dates, check-in < check-out
 */
export function AvailabilityCalendar({
  unavailableDates,
  onDateRangeSelect,
  selectedRange,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => toIsoDate(new Date()), []);

  const [viewMonth, setViewMonth] = React.useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Build a lookup map: date → reason
  const unavailableSet = useMemo(() => {
    const map = new Map<string, string>();
    for (const ud of unavailableDates) {
      map.set(ud.date, ud.reason);
    }
    return map;
  }, [unavailableDates]);

  const secondMonth = useMemo(() => {
    let m = viewMonth.month + 1;
    let y = viewMonth.year;
    if (m > 11) { m = 0; y += 1; }
    return { year: y, month: m };
  }, [viewMonth]);

  const prevMonth = () => {
    setViewMonth((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) { m = 11; y -= 1; }
      return { year: y, month: m };
    });
  };

  const nextMonth = () => {
    setViewMonth((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  };

  const { checkIn, checkOut } = selectedRange;

  const handleDayClick = (iso: string) => {
    if (iso < today) return;
    if (unavailableSet.has(iso)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // First click: set check-in, clear check-out
      onDateRangeSelect(iso, '');
    } else {
      // Second click: set check-out (must be after check-in)
      if (isBefore(iso, checkIn) || iso === checkIn) {
        // Restart: new check-in
        onDateRangeSelect(iso, '');
      } else {
        // Check there are no unavailable dates in the range
        const rangeHasUnavailable = Array.from(unavailableSet.keys()).some(
          (d) => d > checkIn && d < iso,
        );
        if (rangeHasUnavailable) {
          // Restart with clicked date as new check-in
          onDateRangeSelect(iso, '');
        } else {
          onDateRangeSelect(checkIn, iso);
        }
      }
    }
  };

  return (
    <div data-testid="availability-calendar">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-taupe">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-taupe inline-block" aria-hidden />
          Booked
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-ink inline-block" aria-hidden />
          Blocked
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border border-terracotta bg-transparent inline-block" aria-hidden />
          Held
        </div>
      </div>

      {/* 2-month side-by-side */}
      <div className="flex gap-6 overflow-x-auto">
        <MonthCalendar
          year={viewMonth.year}
          month={viewMonth.month}
          today={today}
          unavailableSet={unavailableSet}
          selectedRange={selectedRange}
          onDayClick={handleDayClick}
          onPrev={prevMonth}
          onNext={nextMonth}
          showPrev
          showNext={false}
        />
        <MonthCalendar
          year={secondMonth.year}
          month={secondMonth.month}
          today={today}
          unavailableSet={unavailableSet}
          selectedRange={selectedRange}
          onDayClick={handleDayClick}
          onPrev={prevMonth}
          onNext={nextMonth}
          showPrev={false}
          showNext
        />
      </div>

      {/* Current selection summary */}
      {(checkIn || checkOut) && (
        <div className="mt-4 text-sm text-taupe">
          {checkIn && (
            <span>
              Check-in: <strong>{checkIn}</strong>
            </span>
          )}
          {checkIn && checkOut && ' → '}
          {checkOut && (
            <span>
              Check-out: <strong>{checkOut}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
