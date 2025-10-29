import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size by default', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('accepts custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('custom-class');
  });

  it('has animation class', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('animate-spin');
  });
});

describe('LoadingOverlay', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
  });

  it('shows loading overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('shows custom loading message', () => {
    render(
      <LoadingOverlay isLoading={true} message="Custom loading message">
        <div>Content</div>
      </LoadingOverlay>
    );
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders loading spinner in overlay', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-12', 'w-12'); // Large size by default
  });
});
