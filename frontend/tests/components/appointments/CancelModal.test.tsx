/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CancelModal from '@/app/components/appointments/CancelModal';

const mutateAsyncMock = jest.fn();

jest.mock('@/hooks/useAppointments', () => ({
  useCancelAppointment: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('CancelModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar cuando está abierto', () => {
    render(
      <CancelModal appointmentId="appt-1" isOpen onClose={jest.fn()} />
    );

    expect(screen.getByText('cancelTitle')).toBeInTheDocument();
  });

  it('debe ejecutar cancelación con motivo', async () => {
    const onClose = jest.fn();
    mutateAsyncMock.mockResolvedValue({ message: 'ok' });

    render(
      <CancelModal appointmentId="appt-1" isOpen onClose={onClose} />
    );

    fireEvent.change(
      screen.getByPlaceholderText('cancelReasonPlaceholder'),
      { target: { value: 'No podré asistir' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'cancelAction' }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        appointmentId: 'appt-1',
        cancellationReason: 'No podré asistir',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });
});
