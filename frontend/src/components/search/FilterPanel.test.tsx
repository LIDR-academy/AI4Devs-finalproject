import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel Component', () => {
  const mockOnFiltersChange = vi.fn();

  it('renders price range slider', () => {
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText(/price range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument();
  });

  it('renders property type checkboxes', () => {
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText(/property type/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /apartment/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /house/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /villa/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /cabin/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /studio/i })).toBeInTheDocument();
  });

  it('renders bedrooms selector', () => {
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText(/bedrooms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1\+/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\+/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\+/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\+/i })).toBeInTheDocument();
  });

  it('renders amenities checkboxes', () => {
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText(/amenities/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /wifi/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /kitchen/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /air conditioning/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /pool/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /parking/i })).toBeInTheDocument();
  });

  it('calls onFiltersChange when minimum price changes', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const minPriceInput = screen.getByLabelText(/minimum price/i);
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '100');

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        min_price: 100,
      })
    );
  });

  it('calls onFiltersChange when maximum price changes', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const maxPriceInput = screen.getByLabelText(/maximum price/i);
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, '500');

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        max_price: 500,
      })
    );
  });

  it('calls onFiltersChange when property type is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const apartmentCheckbox = screen.getByRole('checkbox', { name: /apartment/i });
    await user.click(apartmentCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        property_type: 'apartment',
      })
    );
  });

  it('calls onFiltersChange when bedrooms is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const twoBedroomsButton = screen.getByRole('button', { name: /2\+/i });
    await user.click(twoBedroomsButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bedrooms: 2,
      })
    );
  });

  it('calls onFiltersChange when amenity is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const wifiCheckbox = screen.getByRole('checkbox', { name: /wifi/i });
    await user.click(wifiCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        amenities: expect.arrayContaining(['WiFi']),
      })
    );
  });

  it('calls onFiltersChange with multiple amenities', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const wifiCheckbox = screen.getByRole('checkbox', { name: /wifi/i });
    const kitchenCheckbox = screen.getByRole('checkbox', { name: /kitchen/i });

    await user.click(wifiCheckbox);
    await user.click(kitchenCheckbox);

    expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        amenities: expect.arrayContaining(['WiFi', 'Kitchen']),
      })
    );
  });

  it('deselects property type when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const apartmentCheckbox = screen.getByRole('checkbox', { name: /apartment/i });
    await user.click(apartmentCheckbox);
    await user.click(apartmentCheckbox);

    expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        property_type: undefined,
      })
    );
  });

  it('deselects amenities when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const wifiCheckbox = screen.getByRole('checkbox', { name: /wifi/i });
    await user.click(wifiCheckbox);
    await user.click(wifiCheckbox);

    expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        amenities: [],
      })
    );
  });

  it('deselects bedrooms when button is clicked again', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const twoBedroomsButton = screen.getByRole('button', { name: /2\+/i });
    await user.click(twoBedroomsButton);
    await user.click(twoBedroomsButton);

    expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bedrooms: undefined,
      })
    );
  });

  it('updates visual state when property type is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const apartmentCheckbox = screen.getByRole('checkbox', { name: /apartment/i }) as HTMLInputElement;
    expect(apartmentCheckbox.checked).toBe(false);

    await user.click(apartmentCheckbox);
    expect(apartmentCheckbox.checked).toBe(true);

    await user.click(apartmentCheckbox);
    expect(apartmentCheckbox.checked).toBe(false);
  });

  it('updates visual state when amenity is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const wifiCheckbox = screen.getByRole('checkbox', { name: /wifi/i }) as HTMLInputElement;
    expect(wifiCheckbox.checked).toBe(false);

    await user.click(wifiCheckbox);
    expect(wifiCheckbox.checked).toBe(true);
  });

  it('updates visual state when bedrooms button is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFiltersChange={mockOnFiltersChange} />);

    const twoBedroomsButton = screen.getByRole('button', { name: /2\+/i });
    expect(twoBedroomsButton).not.toHaveClass('bg-terracotta');

    await user.click(twoBedroomsButton);
    expect(twoBedroomsButton).toHaveClass('bg-terracotta');

    await user.click(twoBedroomsButton);
    expect(twoBedroomsButton).not.toHaveClass('bg-terracotta');
  });
});
