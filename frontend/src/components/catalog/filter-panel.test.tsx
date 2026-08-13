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

function expandFilterPanel() {
  fireEvent.click(screen.getByRole('button', { name: /filtros/i }));
}

describe('FilterPanel — mobile collapse', () => {
  it('hides filter sections by default', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-sections')).toHaveClass('hidden');
  });

  it('shows filter sections when the toggle button is clicked', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

    expect(screen.getByTestId('filter-sections')).toHaveClass('block');
    expect(screen.getByText('Distancia')).toBeVisible();
  });

  it('collapses filter sections when the toggle button is clicked again', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    const toggle = screen.getByRole('button', { name: /filtros/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(screen.getByTestId('filter-sections')).toHaveClass('hidden');
  });
  it('opens filter sections by default when filters are active in the URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-sections')).toHaveClass('block');
  });
});

describe('FilterPanel — rendering', () => {
  it('renders the four filter sections', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

    expect(screen.getByText('Distancia')).toBeInTheDocument();
    expect(screen.getByText('Superficie')).toBeInTheDocument();
    expect(screen.getByText('Nivel')).toBeInTheDocument();
    expect(screen.getByText('Objetivo')).toBeInTheDocument();
  });

  it('renders distance options with correct labels', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

    expect(screen.getByLabelText('5K')).toBeInTheDocument();
    expect(screen.getByLabelText('10K')).toBeInTheDocument();
    expect(screen.getByLabelText('Media Maratón')).toBeInTheDocument();
    expect(screen.getByLabelText('Maratón')).toBeInTheDocument();
    expect(screen.getByLabelText('Ultra')).toBeInTheDocument();
  });

  it('renders surface options with correct labels', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

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
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
  });

  it('calls router.refresh after router.replace to force RSC re-render', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls router.replace with multiple values when adding to an existing selection', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('Maratón'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('distance=marathon');
  });

  it('removes value from params when unchecking a checkbox', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K&distance=marathon');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).not.toContain('distance=5K');
    expect(url).toContain('distance=marathon');
  });

  it('calls router.replace with "/" when unchecking the last active filter', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toBe('/');
  });

  it('includes params from other dimensions when toggling one dimension', () => {
    mockSearchParamsValue = new URLSearchParams('surface=road');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('surface=road');
  });
});

describe('FilterPanel — category section', () => {
  it('renders the Categoría section with all options', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Todas')).toBeInTheDocument();
    expect(screen.getByLabelText('Zapatillas')).toBeInTheDocument();
    expect(screen.getByLabelText('Ropa')).toBeInTheDocument();
    expect(screen.getByLabelText('Accesorios')).toBeInTheDocument();
  });

  it('marks the category radio matching the URL as checked', () => {
    mockSearchParamsValue = new URLSearchParams('category=shoes');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByLabelText('Zapatillas')).toBeChecked();
    expect(screen.getByLabelText('Todas')).not.toBeChecked();
  });

  it('defaults to "Todas" checked when no category param is present', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByLabelText('Todas')).toBeChecked();
  });

  it('selecting a category calls router.replace with the category param', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('Ropa'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('category=clothing');
  });

  it('selecting "Todas" removes the category param from the URL', () => {
    mockSearchParamsValue = new URLSearchParams('category=shoes');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('Todas'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).not.toContain('category=');
  });

  it('selecting a category preserves other active filters in the URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('Zapatillas'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('category=shoes');
    expect(url).toContain('distance=5K');
  });

  it('badge count includes the category filter', () => {
    mockSearchParamsValue = new URLSearchParams('category=shoes');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-badge')).toHaveTextContent('1');
  });
});

describe('FilterPanel — Limpiar button', () => {
  it('does not render the Limpiar button when no filters are active', () => {
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });

  it('renders the Limpiar button when at least one filter is active', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
  });

  it('calls router.replace with "/" and scroll:false when Limpiar is clicked', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('calls router.refresh after router.replace when Limpiar is clicked', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('clears all active params, not just one, when Limpiar is clicked', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K&category=shoes&priceMax=100');
    render(<FilterPanel activeFilters={noFilters} />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('still allows toggling the mobile collapse button after the header restructuring', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);
    const toggle = screen.getByRole('button', { name: /filtros/i });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('filter-sections')).toHaveClass('hidden');
  });
});

describe('FilterPanel — US-004 regression: badge reflects individual filter removal', () => {
  it('removing one filter from several active ones preserves the rest in the resulting URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K&surface=road');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.click(screen.getByLabelText('5K'));

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).not.toContain('distance=5K');
    expect(url).toContain('surface=road');
  });

  it('does not render the badge when there are no active filters left', () => {
    mockSearchParamsValue = new URLSearchParams();
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.queryByTestId('filter-badge')).not.toBeInTheDocument();
  });
});

describe('FilterPanel — price section', () => {
  it('renders the price slider with correct min/max/step attributes', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    const slider = screen.getByLabelText('Precio máximo');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '400');
    expect(slider).toHaveAttribute('step', '10');
  });

  it('defaults to PRICE_MAX when no priceMax param is present', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByLabelText('Precio máximo')).toHaveValue('400');
  });

  it('reflects the priceMax value from the URL', () => {
    mockSearchParamsValue = new URLSearchParams('priceMax=150');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByLabelText('Precio máximo')).toHaveValue('150');
  });

  it('moving the slider below the max calls router.replace with the priceMax param', () => {
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '150' } });

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('priceMax=150');
  });

  it('moving the slider to PRICE_MAX removes the priceMax param from the URL', () => {
    mockSearchParamsValue = new URLSearchParams('priceMax=150');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '400' } });

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).not.toContain('priceMax=');
  });

  it('the label shows the active price formatted as euros', () => {
    mockSearchParamsValue = new URLSearchParams('priceMax=150');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    expect(screen.getByText(/Hasta 150,00\s*€/)).toBeInTheDocument();
  });

  it('moving the slider preserves other active filters in the URL', () => {
    mockSearchParamsValue = new URLSearchParams('distance=5K');
    render(<FilterPanel activeFilters={noFilters} />);
    expandFilterPanel();

    fireEvent.change(screen.getByLabelText('Precio máximo'), { target: { value: '100' } });

    const url = mockReplace.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('priceMax=100');
  });

  it('badge count includes the price filter when active', () => {
    mockSearchParamsValue = new URLSearchParams('priceMax=150');
    render(<FilterPanel activeFilters={noFilters} />);

    expect(screen.getByTestId('filter-badge')).toHaveTextContent('1');
  });
});
