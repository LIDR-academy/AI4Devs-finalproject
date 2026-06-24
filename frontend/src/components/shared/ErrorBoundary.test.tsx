import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function Boom({ traceId }: { traceId?: string }): React.ReactElement {
  const err = new Error('boom') as Error & { traceId?: string };
  if (traceId) err.traceId = traceId;
  throw err;
}

describe('ErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="ok">fine</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-retry')).toBeInTheDocument();
  });

  it('shows the trace id when the thrown error carries one', () => {
    render(
      <ErrorBoundary>
        <Boom traceId="trace-123" />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-trace-id')).toHaveTextContent('trace-123');
  });

  it('hides the trace id for a plain error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.queryByTestId('error-trace-id')).not.toBeInTheDocument();
  });

  it('recovers after Try again when the child no longer throws', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    function Child() {
      if (shouldThrow) throw new Error('boom');
      return <div data-testid="recovered">ok</div>;
    }
    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    shouldThrow = false;
    await user.click(screen.getByTestId('error-retry'));
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });
});
