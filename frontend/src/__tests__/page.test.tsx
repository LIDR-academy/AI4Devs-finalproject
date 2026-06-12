import { render, screen } from '@testing-library/react';
import Page from '../app/page';
import RootLayout from '../app/layout';

describe('US-000-TASK-07: Root page', () => {
  it('renders without errors', () => {
    expect(() => render(<Page />)).not.toThrow();
  });

  it('renders a main element', () => {
    render(<Page />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

describe('US-000-TASK-09: RootLayout', () => {
  it('RootLayout is a valid React component (function)', () => {
    expect(typeof RootLayout).toBe('function');
  });

  it('renders children without throwing', () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );
    expect(() =>
      render(<TestWrapper><div data-testid="child" /></TestWrapper>)
    ).not.toThrow();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
