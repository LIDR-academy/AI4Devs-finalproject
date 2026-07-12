import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AmenityList } from './AmenityList';

describe('AmenityList Component', () => {
  describe('Empty state', () => {
    it('renders empty state when no amenities', () => {
      render(<AmenityList amenities={[]} />);
      expect(screen.getByTestId('amenity-list-empty')).toBeInTheDocument();
      expect(screen.getByText(/no amenities listed/i)).toBeInTheDocument();
    });
  });

  describe('Small list (≤ 6)', () => {
    const fewAmenities = ['wifi', 'kitchen', 'air_conditioning'];

    it('renders all amenities when count ≤ 6', () => {
      render(<AmenityList amenities={fewAmenities} />);
      expect(screen.getByText('Wifi')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Air Conditioning')).toBeInTheDocument();
    });

    it('does NOT show "Show all" button when count ≤ 6', () => {
      render(<AmenityList amenities={fewAmenities} />);
      expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument();
    });
  });

  describe('Large list (> 6)', () => {
    const manyAmenities = [
      'wifi', 'kitchen', 'air_conditioning', 'washer', 'tv', 'parking',
      'pool', 'gym', 'fireplace',
    ];

    it('shows only 6 amenities initially', () => {
      render(<AmenityList amenities={manyAmenities} />);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(6);
    });

    it('shows "Show all (N)" button when count > 6', () => {
      render(<AmenityList amenities={manyAmenities} />);
      const btn = screen.getByRole('button', { name: /show all \(9\)/i });
      expect(btn).toBeInTheDocument();
    });

    it('expands to show all amenities on button click', () => {
      render(<AmenityList amenities={manyAmenities} />);
      fireEvent.click(screen.getByRole('button', { name: /show all/i }));
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(9);
    });

    it('shows "Show less" button after expansion', () => {
      render(<AmenityList amenities={manyAmenities} />);
      fireEvent.click(screen.getByRole('button', { name: /show all/i }));
      expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
    });

    it('collapses back to 6 on "Show less" click', () => {
      render(<AmenityList amenities={manyAmenities} />);
      fireEvent.click(screen.getByRole('button', { name: /show all/i }));
      fireEvent.click(screen.getByRole('button', { name: /show less/i }));
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(6);
    });
  });

  describe('Amenity formatting', () => {
    it('converts snake_case to Title Case display', () => {
      render(<AmenityList amenities={['air_conditioning']} />);
      expect(screen.getByText('Air Conditioning')).toBeInTheDocument();
    });

    it('renders amenity with an icon (aria-hidden)', () => {
      const { container } = render(<AmenityList amenities={['wifi']} />);
      const icons = container.querySelectorAll('[aria-hidden]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
