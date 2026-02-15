/**
 * @jest-environment jsdom
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminMetrics } from '@/hooks/admin/useAdminMetrics';

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const getAdminMetricsMock = jest.fn();
jest.mock('@/lib/api/admin', () => ({
  getAdminMetrics: (...args: unknown[]) => getAdminMetricsMock(...args),
}));

const mockedUseAuthStore = require('@/store/authStore').useAuthStore as jest.Mock;

describe('useAdminMetrics', () => {
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

  it('carga métricas admin', async () => {
    getAdminMetricsMock.mockResolvedValue({
      summary: { totalReservations: 1 },
      reservationsSeries: [],
      cancellationsSeries: [],
      cancellationsByReason: [],
      ratingsBySpecialty: [],
      topDoctorsByAppointments: [],
      topDoctorsByRating: [],
      generatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useAdminMetrics(), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAdminMetricsMock).toHaveBeenCalledWith('admin-token');
  });
});
