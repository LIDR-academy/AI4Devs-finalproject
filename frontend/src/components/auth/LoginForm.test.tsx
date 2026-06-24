/**
 * LoginForm component tests.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';

// --------------------------------------------------------------------------
// Mock authService
// --------------------------------------------------------------------------

const mockMutate = vi.fn();
const mockLoginState = {
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  mutate: mockMutate,
};

vi.mock('@/services/authService', () => ({
  useLogin: () => mockLoginState,
}));

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(QueryClientProvider, { client: queryClient }, ui),
  );
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginState.isPending = false;
    mockLoginState.isError = false;
    mockLoginState.isSuccess = false;
    mockLoginState.error = null;
  });

  it('renders email and password inputs', () => {
    renderWithQuery(React.createElement(LoginForm));

    expect(screen.getByTestId('login-email')).toBeDefined();
    expect(screen.getByTestId('login-password')).toBeDefined();
  });

  it('renders a submit button', () => {
    renderWithQuery(React.createElement(LoginForm));

    const button = screen.getByTestId('login-submit');
    expect(button).toBeDefined();
    expect(button.textContent).toContain('Sign in');
  });

  it('calls mutation with email and password on submit', async () => {
    const onSuccess = vi.fn();
    renderWithQuery(React.createElement(LoginForm, { onSuccess }));

    fireEvent.change(screen.getByTestId('login-email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByTestId('login-password'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByTestId('login-form'));

    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'alice@example.com', password: 'secret123' },
      expect.any(Object),
    );
  });

  it('shows loading state when pending', () => {
    mockLoginState.isPending = true;
    renderWithQuery(React.createElement(LoginForm));

    const button = screen.getByTestId('login-submit');
    expect(button.textContent).toContain('Signing in');
    expect(button).toHaveProperty('disabled', true);
  });

  it('shows error message when mutation fails', () => {
    mockLoginState.isError = true;
    mockLoginState.error = new Error('Invalid credentials');
    renderWithQuery(React.createElement(LoginForm));

    expect(screen.getByTestId('login-error')).toBeDefined();
    expect(screen.getByTestId('login-error').textContent).toContain('Invalid credentials');
  });
});
