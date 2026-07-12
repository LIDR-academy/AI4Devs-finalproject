/**
 * RegisterForm component tests.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from './RegisterForm';

// --------------------------------------------------------------------------
// Mock authService
// --------------------------------------------------------------------------

const mockMutate = vi.fn();
const mockRegisterState = {
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null as Error | null,
  mutate: mockMutate,
};

vi.mock('@/services/authService', () => ({
  useRegister: () => mockRegisterState,
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

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterState.isPending = false;
    mockRegisterState.isError = false;
    mockRegisterState.isSuccess = false;
    mockRegisterState.error = null;
  });

  it('renders all required input fields', () => {
    renderWithQuery(React.createElement(RegisterForm));

    expect(screen.getByTestId('register-first-name')).toBeDefined();
    expect(screen.getByTestId('register-last-name')).toBeDefined();
    expect(screen.getByTestId('register-email')).toBeDefined();
    expect(screen.getByTestId('register-password')).toBeDefined();
  });

  it('renders a submit button', () => {
    renderWithQuery(React.createElement(RegisterForm));

    const button = screen.getByTestId('register-submit');
    expect(button).toBeDefined();
    expect(button.textContent).toContain('Create account');
  });

  it('calls mutation with all fields on submit', async () => {
    const onSuccess = vi.fn();
    renderWithQuery(React.createElement(RegisterForm, { onSuccess }));

    fireEvent.change(screen.getByTestId('register-first-name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByTestId('register-last-name'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByTestId('register-email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByTestId('register-password'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByTestId('register-form'));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        email: 'alice@example.com',
        password: 'secret123',
        first_name: 'Alice',
        last_name: 'Smith',
      },
      expect.any(Object),
    );
  });

  it('shows loading state when pending', () => {
    mockRegisterState.isPending = true;
    renderWithQuery(React.createElement(RegisterForm));

    const button = screen.getByTestId('register-submit');
    expect(button.textContent).toContain('Creating account');
    expect(button).toHaveProperty('disabled', true);
  });

  it('shows error message when mutation fails', () => {
    mockRegisterState.isError = true;
    mockRegisterState.error = new Error('Email already registered');
    renderWithQuery(React.createElement(RegisterForm));

    expect(screen.getByTestId('register-error')).toBeDefined();
    expect(screen.getByTestId('register-error').textContent).toContain(
      'Email already registered',
    );
  });
});
