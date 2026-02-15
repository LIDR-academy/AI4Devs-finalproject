/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReviewForm from '@/app/components/reviews/ReviewForm';

const mutateAsyncMock = jest.fn();

jest.mock('@/hooks/useReview', () => ({
  useCreateAppointmentReview: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

describe('ReviewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra error cuando no se selecciona rating', async () => {
    render(<ReviewForm appointmentId="appt-1" />);

    fireEvent.change(screen.getByLabelText('comment'), {
      target: { value: 'Comentario suficientemente largo para validar.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByText('ratingRequired')).toBeInTheDocument();
    });
  });

  it('muestra validación de comentario mínimo', async () => {
    render(<ReviewForm appointmentId="appt-1" />);

    fireEvent.click(screen.getByLabelText('ratingValue:{"value":5}'));
    fireEvent.change(screen.getByLabelText('comment'), {
      target: { value: 'corto' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByText('commentMin')).toBeInTheDocument();
    });
  });

  it('envía reseña correctamente y ejecuta onCreated', async () => {
    const onCreated = jest.fn();
    mutateAsyncMock.mockResolvedValue({
      message: 'Tu reseña ha sido enviada y está pendiente de moderación',
    });

    render(<ReviewForm appointmentId="appt-1" onCreated={onCreated} />);

    fireEvent.click(screen.getByLabelText('ratingValue:{"value":4}'));
    fireEvent.change(screen.getByLabelText('comment'), {
      target: { value: 'Excelente consulta, explicación clara y puntual.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        appointmentId: 'appt-1',
        payload: {
          rating: 4,
          comment: 'Excelente consulta, explicación clara y puntual.',
        },
      });
    });

    expect(onCreated).toHaveBeenCalled();
    expect(
      screen.getByText('Tu reseña ha sido enviada y está pendiente de moderación')
    ).toBeInTheDocument();
  });

  it('mapea errores backend a mensajes de UI', async () => {
    mutateAsyncMock.mockRejectedValue({
      status: 409,
      code: 'REVIEW_ALREADY_EXISTS',
    });

    render(<ReviewForm appointmentId="appt-1" />);

    fireEvent.click(screen.getByLabelText('ratingValue:{"value":5}'));
    fireEvent.change(screen.getByLabelText('comment'), {
      target: { value: 'Comentario válido para probar error de duplicado.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByText('errors.alreadyExists')).toBeInTheDocument();
    });
  });
});
