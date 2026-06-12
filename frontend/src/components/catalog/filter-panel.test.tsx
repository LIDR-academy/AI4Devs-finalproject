import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductFilters } from '../../types';

// Mutable ref so individual tests can override the URL search params.
let mockSearchParamsValue = new URLSearchParams();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => mockSearchParamsValue,
}));

import { FilterPanel } from './filter-panel';

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParamsValue = new URLSearchParams();
});

const noFilters: ProductFilters = {};

describe('FilterPanel — rendering', () => {
  it('renders the four filter sections', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByText('Distancia')).toBeInTheDocument();
    expect(screen.getByText('Superficie')).toBeInTheDocument();
    expect(screen.getByText('Nivel')).toBeInTheDocument();
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
  });

  it('renders distance options with correct labels', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('5K')).toBeInTheDocument();
    expect(screen.getByLabelText('10K')).toBeInTheDocument();
    expect(screen.getByLabelText('Media Maratón')).toBeInTheDocument();
    expect(screen.getByLabelText('Maratón')).toBeInTheDocument();
    expect(screen.getByLabelText('Ultra')).toBeInTheDocument();
  });

  it('renders surface options with correct labels', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('Asfalto')).toBeInTheDocument();
    expect(screen.getByLabelText('Trail')).toBeInTheDocument();
    expect(screen.getByLabelText('Pista')).toBeInTheDocument();
    expect(screen.getByLabelText('Mixto')).toBeInTheDocument();
  });

  it('does not show the active-count badge when no filters are active', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.queryByTestId('filter-badge')).not.toBeInTheDocument();
  });
});

describe('FilterPanel — active filters reflected in checkboxes', () => {
  it('marks distance checkbox as checked when value is in URL search params', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('5K')).toBeChecked();
  });

  it('leaves other distance checkboxes unchecked', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('Maratón')).not.toBeChecked();
  });

  it('marks multiple checkboxes when multiple values are active in URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K&distance=marathon');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('5K')).toBeChecked();
    expect(screen.getByLabelText('Maratón')).toBeChecked();
    expect(screen.getByLabelText('10K')).not.toBeChecked();
  });

  it('marks checkboxes across different dimensions from URL params', () => {
    mockSearchParamsValue = new URLSearchParams('distance=marathon&surface=road');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByLabelText('Maratón')).toBeChecked();
    expect(screen.getByLabelText('Asfalto')).toBeChecked();
    expect(screen.getByLabelText('5K')).not.toBeChecked();
  });
});

describe('FilterPanel — active filter badge', () => {
  it('shows badge with count 1 when one filter is active in URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-badge')).toHaveTextContent('1');
  });

  it('shows badge with summed count across all dimensions in URL', () => {
    mockSearchParamsValue = new URLSearchParams(
      'distance=5K&distance=marathon&surface=road&level=advanced',
    );
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-badge')).toHaveTextContent('4');
  });
});

describe('FilterPanel — checkbox interaction updates URL', () => {
  it('calls router.replace with the checked value added to params', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('5K'));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
  });

  it('calls router.refresh after router.replace to force RSC re-render', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('5K'));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls router.replace with multiple values when adding to an existing selection', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('Maratón'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('distance=marathon');
  });

  it('removes value from params when unchecking a checkbox', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K&distance=marathon');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).not.toContain('distance=5K');
    expect(url).toContain('distance=marathon');
  });

  it('calls router.replace with "/" when unchecking the last active filter', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toBe('/');
  });

  it('includes params from other dimensions when toggling one dimension', () => {
    mockSearchParamsValue = new URLSearchParams('surface=road');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('surface=road');
  });
});
