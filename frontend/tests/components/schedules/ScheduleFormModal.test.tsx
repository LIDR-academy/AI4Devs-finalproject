/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScheduleFormModal from '@/app/components/schedules/ScheduleFormModal';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    if (key === 'doctorSchedules.slotLabel' && values) {
      return `Duración: ${values.duration} min | Pausa: ${values.break} min`;
    }
    return key;
  },
}));

describe('ScheduleFormModal', () => {
  it('muestra error si endTime <= startTime', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <ScheduleFormModal
        isOpen
        mode="create"
        isSubmitting={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('fields.startTime'), {
      target: { value: '10:00' },
    });
    fireEvent.change(screen.getByLabelText('fields.endTime'), {
      target: { value: '09:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'create' }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('envía payload normalizado al crear horario', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <ScheduleFormModal
        isOpen
        mode="create"
        isSubmitting={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('fields.day'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('fields.startTime'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('fields.endTime'), {
      target: { value: '12:00' },
    });
    fireEvent.change(screen.getByLabelText('fields.slotDuration'), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText('fields.breakDuration'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'create' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        dayOfWeek: 2,
        startTime: '09:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 20,
        breakDurationMinutes: 10,
        isActive: true,
      });
    });
  });
});
