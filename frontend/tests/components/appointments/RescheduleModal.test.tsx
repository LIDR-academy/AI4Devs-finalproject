/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RescheduleModal from '@/app/components/appointments/RescheduleModal';

const mutateAsyncMock = jest.fn();
const getDoctorSlotsMock = jest.fn();

jest.mock('@/hooks/useAppointments', () => ({
  useRescheduleAppointment: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ accessToken: 'token-test' }),
}));

jest.mock('@/lib/api/doctors', () => ({
  getDoctorSlots: (...args: unknown[]) => getDoctorSlotsMock(...args),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('RescheduleModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDoctorSlotsMock.mockResolvedValue([
      {
        id: 'slot-2',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        isAvailable: true,
        lockedUntil: null,
      },
    ]);
  });

  it('debe cargar horarios y permitir confirmar reprogramación', async () => {
    mutateAsyncMock.mockResolvedValue({ message: 'ok' });
    const onClose = jest.fn();

    render(
      <RescheduleModal
        appointment={{ id: 'appt-1', doctorId: 'doc-1', slotId: 'slot-1' }}
        isOpen
        onClose={onClose}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getDoctorSlotsMock).toHaveBeenCalled();
    });

    const slotButton = await screen.findByRole('button', { name: /\d{2}:\d{2}/ });
    fireEvent.click(slotButton);
    fireEvent.click(
      screen.getByRole('button', { name: 'rescheduleAction' })
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: 'appt-1',
          slotId: 'slot-2',
        })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });
});
