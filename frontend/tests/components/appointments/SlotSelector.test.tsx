/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import SlotSelector from '@/app/components/appointments/SlotSelector';
import * as doctorsApi from '@/lib/api/doctors';
import * as appointmentsApi from '@/lib/api/appointments';

jest.mock('@/lib/api/doctors', () => ({
  getDoctorSlots: jest.fn(),
}));

jest.mock('@/lib/api/appointments', () => ({
  createAppointment: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'es' }),
}));

const mockDoctor = {
  id: 'doctor-1',
  firstName: 'Juan',
  lastName: 'García',
  specialties: [
    { id: 's1', nameEs: 'Cardiología', nameEn: 'Cardiology' },
  ],
  address: 'Av. Reforma 123',
  postalCode: '06000',
  totalReviews: 10,
  verificationStatus: 'approved',
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10, 0, 0, 0);

const mockSlots = [
  {
    id: 'slot-1',
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
    isAvailable: true,
    lockedUntil: null,
  },
  {
    id: 'slot-2',
    startTime: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
    endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    lockedUntil: null,
  },
];

const messages = {
  appointments: {
    title: 'Reservar cita',
    selectDate: 'Selecciona una fecha',
    selectSlot: 'Selecciona un horario',
    loadingSlots: 'Cargando horarios disponibles...',
    noSlots: 'No hay horarios disponibles para esta fecha.',
    reserving: 'Reservando...',
    confirmAppointment: 'Confirmar cita',
    cancel: 'Cancelar',
    notesPlaceholder: 'Nota opcional (máximo 500 caracteres)',
    doctorInfo: 'Información del médico',
    appointmentSummary: 'Resumen de tu cita',
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider messages={messages} locale="es">
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe('SlotSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (doctorsApi.getDoctorSlots as jest.Mock).mockResolvedValue(mockSlots);
  });

  it('debe mostrar información del médico', () => {
    render(
      <SlotSelector
        doctorId="doctor-1"
        doctor={mockDoctor}
        accessToken="test-token"
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText(/Dr. Juan García/)).toBeInTheDocument();
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText('Av. Reforma 123')).toBeInTheDocument();
  });

  it('debe cargar y mostrar slots disponibles', async () => {
    render(
      <SlotSelector
        doctorId="doctor-1"
        doctor={mockDoctor}
        accessToken="test-token"
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(doctorsApi.getDoctorSlots).toHaveBeenCalledWith(
        'doctor-1',
        expect.any(String),
        'test-token',
      );
    });

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay slots', async () => {
    (doctorsApi.getDoctorSlots as jest.Mock).mockResolvedValue([]);

    render(
      <SlotSelector
        doctorId="doctor-1"
        doctor={mockDoctor}
        accessToken="test-token"
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText('No hay horarios disponibles para esta fecha.')).toBeInTheDocument();
    });
  });

  it('debe permitir seleccionar slot y mostrar panel de confirmación', async () => {
    render(
      <SlotSelector
        doctorId="doctor-1"
        doctor={mockDoctor}
        accessToken="test-token"
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('10:00'));

    await waitFor(() => {
      expect(screen.getByText('Resumen de tu cita')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nota opcional (máximo 500 caracteres)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar cita/ })).toBeInTheDocument();
    });
  });

  it('debe llamar createAppointment y redirigir al confirmar', async () => {
    (appointmentsApi.createAppointment as jest.Mock).mockResolvedValue({
      id: 'appointment-1',
      message: 'Cita reservada correctamente',
    });

    render(
      <SlotSelector
        doctorId="doctor-1"
        doctor={mockDoctor}
        accessToken="test-token"
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('10:00'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirmar cita/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar cita/ }));

    await waitFor(() => {
      expect(appointmentsApi.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorId: 'doctor-1',
          slotId: 'slot-1',
        }),
        'test-token',
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/es/search');
    });
  });
});
