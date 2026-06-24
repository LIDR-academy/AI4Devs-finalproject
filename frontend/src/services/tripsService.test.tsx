import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

import { apiClient } from './apiClient';
import { useMyTrips, useBookingDetail, useCancelBooking } from './tripsService';

const mockedGet = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

function wrapperWith(client: QueryClient) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('tripsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useMyTrips calls my-trips with status/page/size params', async () => {
    mockedGet.mockResolvedValue({
      data: { bookings: [], pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 } },
    });

    const { result } = renderHook(() => useMyTrips('upcoming', 2, 10), {
      wrapper: wrapperWith(newClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/bookings/my-trips', {
      params: { status: 'upcoming', page: 2, size: 10 },
    });
  });

  it('useBookingDetail is disabled when id is undefined and enabled when set', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'b1' } });

    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useBookingDetail(id),
      { wrapper: wrapperWith(newClient()), initialProps: { id: undefined } as { id?: string } },
    );
    expect(mockedGet).not.toHaveBeenCalled();

    rerender({ id: 'b1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/bookings/b1');
  });

  it('useCancelBooking posts cancel with reason and invalidates trips + detail queries', async () => {
    mockedPost.mockResolvedValue({
      data: { booking_id: 'b1', status: 'cancelled', refund_amount_eur: 386, refund_status: 'full_refund' },
    });
    const client = newClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useCancelBooking(), { wrapper: wrapperWith(client) });

    await result.current.mutateAsync({ bookingId: 'b1', reason: 'plans changed' });

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/bookings/b1/cancel', { reason: 'plans changed' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['myTrips'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['bookingDetail', 'b1'] });
  });

  it('useCancelBooking posts an empty body when no reason is given', async () => {
    mockedPost.mockResolvedValue({
      data: { booking_id: 'b1', status: 'cancelled', refund_amount_eur: 0, refund_status: 'no_refund' },
    });
    const { result } = renderHook(() => useCancelBooking(), { wrapper: wrapperWith(newClient()) });

    await result.current.mutateAsync({ bookingId: 'b1' });

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/bookings/b1/cancel', {});
  });
});
