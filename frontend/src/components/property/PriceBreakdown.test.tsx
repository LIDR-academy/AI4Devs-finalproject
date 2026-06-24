import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceBreakdown } from './PriceBreakdown';
import type { PriceBreakdownResponse } from '@/types';

// Mock the propertyService
vi.mock('@/services/propertyService', () => ({
  usePriceCalculation: vi.fn(),
}));

import { usePriceCalculation } from '@/services/propertyService';

const mockPriceData: PriceBreakdownResponse = {
  property_id: 'prop-1',
  check_in: '2026-07-10',
  check_out: '2026-07-15',
  nights: 5,
  nightly_rate_eur: 95.0,
  subtotal_eur: 475.0,
  cleaning_fee_eur: 35.0,
  service_fee_eur: 57.0,
  tax_eur: 0.0,
  total_eur: 567.0,
};

describe('PriceBreakdown Component', () => {
  describe('No dates selected', () => {
    it('shows placeholder when checkIn is undefined', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn={undefined} checkOut={undefined} />);
      expect(screen.getByTestId('price-breakdown-placeholder')).toBeInTheDocument();
      expect(screen.getByText(/select dates to see total price/i)).toBeInTheDocument();
    });

    it('shows placeholder when only checkIn is provided', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut={undefined} />);
      expect(screen.getByTestId('price-breakdown-placeholder')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows skeleton loading when isLoading is true', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByTestId('price-breakdown-loading')).toBeInTheDocument();
      expect(screen.getByLabelText(/loading price breakdown/i)).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error message when request fails', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByTestId('price-breakdown-error')).toBeInTheDocument();
      expect(screen.getByText(/unable to calculate price/i)).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    beforeEach(() => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockPriceData,
        isLoading: false,
        error: null,
      });
    });

    it('renders price breakdown container', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    it('shows nightly rate × nights', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText(/€95.00 × 5 nights/i)).toBeInTheDocument();
    });

    it('shows subtotal', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText('€475.00')).toBeInTheDocument();
    });

    it('shows cleaning fee', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText(/cleaning fee/i)).toBeInTheDocument();
      expect(screen.getByText('€35.00')).toBeInTheDocument();
    });

    it('shows service fee', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText(/service fee/i)).toBeInTheDocument();
      expect(screen.getByText('€57.00')).toBeInTheDocument();
    });

    it('shows total', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('€567.00')).toBeInTheDocument();
    });

    it('does NOT show tax row when tax_eur is 0', () => {
      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.queryByText(/taxes/i)).not.toBeInTheDocument();
    });

    it('shows tax row when tax_eur > 0', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { ...mockPriceData, tax_eur: 25.0, total_eur: 592.0 },
        isLoading: false,
        error: null,
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-15" />);
      expect(screen.getByText(/taxes/i)).toBeInTheDocument();
      expect(screen.getByText('€25.00')).toBeInTheDocument();
    });

    it('uses singular "night" for 1-night stays', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { ...mockPriceData, nights: 1, subtotal_eur: 95.0, total_eur: 187.0 },
        isLoading: false,
        error: null,
      });

      render(<PriceBreakdown propertyId="prop-1" checkIn="2026-07-10" checkOut="2026-07-11" />);
      expect(screen.getByText(/€95.00 × 1 night$/i)).toBeInTheDocument();
    });
  });

  describe('flat prop', () => {
    it('omits its own card chrome when flat', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      render(<PriceBreakdown propertyId="p1" checkIn={undefined} checkOut={undefined} flat />);
      const el = screen.getByTestId('price-breakdown-placeholder');
      expect(el.className).not.toContain('border-border');
      expect(el.className).not.toContain('bg-surface');
    });
    it('keeps card chrome by default (not flat)', () => {
      (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      render(<PriceBreakdown propertyId="p1" checkIn={undefined} checkOut={undefined} />);
      expect(screen.getByTestId('price-breakdown-placeholder').className).toContain('border-border');
    });
  });
});
