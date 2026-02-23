/**
 * T-0506-FRONT: FiltersSidebar Component Tests
 * 
 * TDD RED Phase: Tests for filters sidebar orchestration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FiltersSidebar from './FiltersSidebar';
import { usePartsStore } from '@/stores/parts.store';

// Mock the store
vi.mock('@/stores/parts.store', () => ({
  usePartsStore: vi.fn(),
}));

describe('FiltersSidebar', () => {
  const mockSetFilters = vi.fn();
  const mockClearFilters = vi.fn();
  const mockGetFilteredParts = vi.fn(() => []);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default store mock
    (usePartsStore as any).mockReturnValue({
      parts: [
        { id: '1', tipologia: 'capitel', status: 'validated' },
        { id: '2', tipologia: 'columna', status: 'uploaded' },
        { id: '3', tipologia: 'capitel', status: 'uploaded' },
      ],
      filters: { status: [], tipologia: [], workshop_id: null },
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
      getFilteredParts: mockGetFilteredParts,
    });
  });

  it('should render three filter sections', () => {
    render(<FiltersSidebar />);

    expect(screen.getByText(/tipología/i)).toBeInTheDocument();
    expect(screen.getByText(/estado/i)).toBeInTheDocument();
    expect(screen.getByText(/taller/i)).toBeInTheDocument();
  });

  it('should render "Limpiar filtros" button', () => {
    render(<FiltersSidebar />);

    const clearButton = screen.getByRole('button', { name: /limpiar/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should call clearFilters when "Limpiar" button is clicked', () => {
    render(<FiltersSidebar />);

    const clearButton = screen.getByRole('button', { name: /limpiar/i });
    fireEvent.click(clearButton);

    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });

  it('should display results counter with correct format', () => {
    mockGetFilteredParts.mockReturnValue([
      { id: '1', tipologia: 'capitel' },
      { id: '2', tipologia: 'capitel' },
    ]);

    (usePartsStore as any).mockReturnValue({
      parts: [
        { id: '1', tipologia: 'capitel' },
        { id: '2', tipologia: 'capitel' },
        { id: '3', tipologia: 'columna' },
      ],
      filters: { status: [], tipologia: ['capitel'], workshop_id: null },
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
      getFilteredParts: mockGetFilteredParts,
    });

    render(<FiltersSidebar />);

    expect(screen.getByText(/mostrando 2 de 3/i)).toBeInTheDocument();
  });

  it('should update counter when filters change', () => {
    // Initial: no filters, all 3 parts visible
    mockGetFilteredParts.mockReturnValue([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);
    (usePartsStore as any).mockReturnValue({
      parts: [{ id: '1' }, { id: '2' }, { id: '3' }],
      filters: { status: [], tipologia: [], workshop_id: null },
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
      getFilteredParts: mockGetFilteredParts,
    });

    const { rerender } = render(<FiltersSidebar />);
    expect(screen.getByText(/mostrando 3 de 3/i)).toBeInTheDocument();

    // Apply filter: only 2 parts match
    mockGetFilteredParts.mockReturnValue([
      { id: '1' },
      { id: '2' },
    ]);
    (usePartsStore as any).mockReturnValue({
      parts: [{ id: '1' }, { id: '2' }, { id: '3' }],
      filters: { status: [], tipologia: ['capitel'], workshop_id: null },
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
      getFilteredParts: mockGetFilteredParts,
    });
    rerender(<FiltersSidebar />);

    expect(screen.getByText(/mostrando 2 de 3/i)).toBeInTheDocument();
  });

  it('should pass current filters to CheckboxGroup components', () => {
    (usePartsStore as any).mockReturnValue({
      parts: [],
      filters: { status: ['validated'], tipologia: ['capitel'], workshop_id: null },
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
      getFilteredParts: mockGetFilteredParts,
    });

    render(<FiltersSidebar />);

    // Verify that checkboxes reflect current filter state
    const validatedCheckbox = screen.getByLabelText(/validado/i) as HTMLInputElement;
    const capitelCheckbox = screen.getByLabelText(/capitel/i) as HTMLInputElement;

    expect(validatedCheckbox.checked).toBe(true);
    expect(capitelCheckbox.checked).toBe(true);
  });

  it('should call setFilters when tipologia checkbox is clicked', () => {
    render(<FiltersSidebar />);

    const capitelCheckbox = screen.getByLabelText(/capitel/i);
    fireEvent.click(capitelCheckbox);

    expect(mockSetFilters).toHaveBeenCalledWith({ tipologia: ['capitel'] });
  });

  it('should call setFilters when status checkbox is clicked', () => {
    render(<FiltersSidebar />);

    const validatedCheckbox = screen.getByLabelText(/validado/i);
    fireEvent.click(validatedCheckbox);

    expect(mockSetFilters).toHaveBeenCalledWith({ status: ['validated'] });
  });
});
