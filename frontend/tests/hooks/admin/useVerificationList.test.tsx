/**
 * @jest-environment jsdom
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useVerificationList } from '@/hooks/admin/useVerificationList';

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const getAdminVerificationListMock = jest.fn();
jest.mock('@/lib/api/admin', () => ({
  getAdminVerificationList: (...args: unknown[]) => getAdminVerificationListMock(...args),
}));

const mockedUseAuthStore = require('@/store/authStore').useAuthStore as jest.Mock;

describe('useVerificationList', () => {
  function wrapperFactory() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({ accessToken: 'admin-token' });
  });

  it('carga lista de verificación', async () => {
    getAdminVerificationListMock.mockResolvedValue({
      items: [
        {
          doctorId: 'doctor-1',
          userId: 'user-1',
          fullName: 'Doctor Uno',
          email: 'doctor1@test.com',
          specialty: 'General',
          verificationStatus: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useVerificationList(1, 20, 'pending'), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAdminVerificationListMock).toHaveBeenCalledWith('admin-token', {
      page: 1,
      limit: 20,
      status: 'pending',
    });
  });
});
