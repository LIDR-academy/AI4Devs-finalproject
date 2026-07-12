/**
 * Tests for authService — register and login mutations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegister, useLogin } from './authService';
import type { AuthResponse } from '@/types/auth';

// --------------------------------------------------------------------------
// Mock apiClient
// --------------------------------------------------------------------------

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
  NormalizedApiError: class NormalizedApiError extends Error {
    code: string;
    status?: number;
    constructor(params: { message: string; code: string; status?: number }) {
      super(params.message);
      this.name = 'NormalizedApiError';
      this.code = params.code;
      this.status = params.status;
    }
  },
}));

import { apiClient } from './apiClient';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const mockAuthResponse: AuthResponse = {
  token: 'eyJhbGciOiJIUzI1NiJ9.test.sig',
  user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
  first_name: 'Alice',
};

// --------------------------------------------------------------------------
// useRegister
// --------------------------------------------------------------------------

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('calls POST /api/v1/auth/register with correct payload', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockAuthResponse,
    });

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        email: 'alice@example.com',
        password: 'secret',
        first_name: 'Alice',
        last_name: 'Smith',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', {
      email: 'alice@example.com',
      password: 'secret',
      first_name: 'Alice',
      last_name: 'Smith',
    });
  });

  it('stores token in localStorage on success', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockAuthResponse,
    });

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        email: 'alice@example.com',
        password: 'secret',
        first_name: 'Alice',
        last_name: 'Smith',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
  });

  it('surfaces error on API failure', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Email already taken'),
    );

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        email: 'taken@example.com',
        password: 'secret',
        first_name: 'Bob',
        last_name: 'Jones',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

// --------------------------------------------------------------------------
// useLogin
// --------------------------------------------------------------------------

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('calls POST /api/v1/auth/login with correct payload', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockAuthResponse,
    });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'alice@example.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'alice@example.com',
      password: 'secret',
    });
  });

  it('stores token in localStorage on success', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockAuthResponse,
    });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'alice@example.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
  });

  it('surfaces error on API failure', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Invalid credentials'),
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'bad@example.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
