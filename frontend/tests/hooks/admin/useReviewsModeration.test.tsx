/**
 * @jest-environment jsdom
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useReviewsModeration } from '@/hooks/admin/useReviewsModeration';

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const getReviewsModerationQueueMock = jest.fn();
jest.mock('@/lib/api/admin', () => ({
  getReviewsModerationQueue: (...args: unknown[]) => getReviewsModerationQueueMock(...args),
}));

const mockedUseAuthStore = require('@/store/authStore').useAuthStore as jest.Mock;

describe('useReviewsModeration', () => {
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

  it('carga cola de moderación', async () => {
    getReviewsModerationQueueMock.mockResolvedValue({
      items: [
        {
          reviewId: 'review-1',
          patientId: 'patient-1',
          patientName: 'Paciente Uno',
          doctorId: 'doctor-1',
          doctorName: 'Doctor Uno',
          rating: 5,
          comment: 'Excelente',
          createdAt: new Date().toISOString(),
          appointmentId: 'appointment-1',
          moderationStatus: 'pending',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useReviewsModeration(1, 20), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getReviewsModerationQueueMock).toHaveBeenCalledWith('admin-token', {
      page: 1,
      limit: 20,
    });
  });
});
