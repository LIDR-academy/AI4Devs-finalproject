/**
 * @jest-environment jsdom
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useDoctorProfile, useUpdateDoctorProfile } from '@/hooks/useDoctorProfile';

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const getMyDoctorProfileMock = jest.fn();
const updateMyDoctorProfileMock = jest.fn();

jest.mock('@/lib/api/doctors', () => ({
  getMyDoctorProfile: (...args: unknown[]) => getMyDoctorProfileMock(...args),
  updateMyDoctorProfile: (...args: unknown[]) =>
    updateMyDoctorProfileMock(...args),
}));

const mockedUseAuthStore = require('@/store/authStore').useAuthStore as jest.Mock;

describe('useDoctorProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({
      accessToken: 'token-test',
    });
  });

  function wrapperFactory() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it('carga perfil con useQuery', async () => {
    getMyDoctorProfileMock.mockResolvedValue({
      id: 'doctor-1',
      userId: 'user-1',
      email: 'doctor@test.com',
      firstName: 'Ana',
      lastName: 'Pérez',
      address: 'Av. Reforma',
      postalCode: '06000',
      verificationStatus: 'approved',
      totalReviews: 0,
      specialties: [],
      updatedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useDoctorProfile(), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBe('doctor@test.com');
    expect(getMyDoctorProfileMock).toHaveBeenCalledWith('token-test');
  });

  it('actualiza perfil con useMutation', async () => {
    updateMyDoctorProfileMock.mockResolvedValue({
      message: 'ok',
      doctor: {
        id: 'doctor-1',
        userId: 'user-1',
        email: 'doctor@test.com',
        firstName: 'Ana',
        lastName: 'Pérez',
        address: 'Nueva dirección',
        postalCode: '06000',
        verificationStatus: 'approved',
        totalReviews: 0,
        specialties: [],
        updatedAt: new Date().toISOString(),
      },
    });

    const { result } = renderHook(() => useUpdateDoctorProfile(), {
      wrapper: wrapperFactory(),
    });

    await result.current.mutateAsync({
      address: 'Nueva dirección',
      postalCode: '06000',
    });

    expect(updateMyDoctorProfileMock).toHaveBeenCalledWith(
      {
        address: 'Nueva dirección',
        postalCode: '06000',
      },
      'token-test'
    );
  });
});
