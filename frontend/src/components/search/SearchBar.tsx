'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

/**
 * SearchParams type for the SearchBar component.
 * Passed to the onSearch callback when the user submits the form.
 */
export type SearchParams = {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
};

/**
 * SearchBar component props
 */
export interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
}

/**
 * SearchBar Component (T030)
 *
 * A controlled form component that captures search parameters for property search:
 * - Location input with autocomplete placeholder
 * - Check-in date picker
 * - Check-out date picker
 * - Guests counter with +/- controls
 * - Search button to submit the form
 *
 * All inputs are controlled and managed via React state.
 * On form submission, calls the onSearch callback with current search parameters.
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Local yyyy-mm-dd "today" — used to disable past check-in dates.
  const todayIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const validateDates = (ci: string, co: string): string | null => {
    if (ci && ci < todayIso) return "Check-in date can't be in the past";
    if (ci && co && co <= ci) return 'Check-out date must be after check-in date';
    return null;
  };

  /**
   * Handles location input change
   */
  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  /**
   * Handles check-in date change
   */
  const handleCheckInChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCheckInDate(value);
    if (checkOutDate && value && checkOutDate <= value) {
      setCheckOutDate('');
    }
    setError(null);
  };

  /**
   * Handles check-out date change
   */
  const handleCheckOutChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCheckOutDate(e.target.value);
    setError(null);
  };

  /**
   * Increments guests counter
   */
  const handleIncrement = () => {
    setGuests(prev => prev + 1);
  };

  /**
   * Decrements guests counter (minimum 1)
   */
  const handleDecrement = () => {
    setGuests(prev => (prev > 1 ? prev - 1 : 1));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateDates(checkInDate, checkOutDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Call the onSearch callback with current search parameters
    onSearch({
      location,
      checkInDate,
      checkOutDate,
      guests,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="search-form"
      className="w-full rounded-card md:rounded-pill border border-border bg-surface p-2 md:flex md:items-center md:gap-2"
    >
      {/* Location Input */}
      <div className="flex flex-col gap-1 flex-1 px-2 py-1">
        <label htmlFor="location" className="font-sans text-xs uppercase tracking-[0.1em] text-taupe">
          Where
        </label>
        <input
          id="location"
          type="text"
          data-testid="search-location"
          placeholder="Where are you going?"
          value={location}
          onChange={handleLocationChange}
          className="bg-transparent font-sans text-ink placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta rounded-pill px-4 py-2"
        />
      </div>

      {/* Check-in Date Picker */}
      <div className="flex flex-col gap-1 flex-1 px-2 py-1">
        <label htmlFor="check-in" className="font-sans text-xs uppercase tracking-[0.1em] text-taupe">
          Check-in
        </label>
        <input
          id="check-in"
          type="date"
          min={todayIso}
          value={checkInDate}
          onChange={handleCheckInChange}
          onBlur={() => setError(validateDates(checkInDate, checkOutDate))}
          className="bg-transparent font-sans text-ink placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta rounded-pill px-4 py-2"
        />
      </div>

      {/* Check-out Date Picker */}
      <div className="flex flex-col gap-1 flex-1 px-2 py-1">
        <label htmlFor="check-out" className="font-sans text-xs uppercase tracking-[0.1em] text-taupe">
          Check-out
        </label>
        <input
          id="check-out"
          type="date"
          min={checkInDate}
          value={checkOutDate}
          onChange={handleCheckOutChange}
          onBlur={() => setError(validateDates(checkInDate, checkOutDate))}
          className="bg-transparent font-sans text-ink placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta rounded-pill px-4 py-2"
        />
      </div>

      {/* Guests Counter */}
      <div className="flex flex-col gap-1 px-2 py-1">
        <label htmlFor="guests" className="font-sans text-xs uppercase tracking-[0.1em] text-taupe">
          Guests
        </label>
        <div className="flex items-center rounded-pill border border-border">
          <button
            type="button"
            onClick={handleDecrement}
            className="px-3 py-2 text-taupe hover:bg-terracotta-tint rounded-pill transition-colors"
            aria-label="Decrease guests"
          >
            -
          </button>
          <input
            id="guests"
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 20) {
                setGuests(value);
              }
            }}
            className="flex-1 text-center border-none focus:outline-none py-2 bg-transparent font-sans text-ink"
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="px-3 py-2 text-taupe hover:bg-terracotta-tint rounded-pill transition-colors"
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <p data-testid="search-error" role="alert" className="mt-3 text-sm text-terracotta md:mt-0 px-2">
          {error}
        </p>
      )}

      {/* Search Button */}
      <div className="flex justify-center md:justify-end px-2 py-1">
        <button
          type="submit"
          data-testid="search-submit"
          className="rounded-pill bg-terracotta px-8 py-3 font-sans text-sm font-semibold text-white hover:opacity-90 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};
