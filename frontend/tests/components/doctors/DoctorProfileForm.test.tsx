/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DoctorProfileForm from '@/app/components/doctors/DoctorProfileForm';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('DoctorProfileForm', () => {
  const baseProfile = {
    id: 'doctor-1',
    userId: 'user-1',
    email: 'doctor@test.com',
    firstName: 'Ana',
    lastName: 'Pérez',
    phone: '+5215511122233',
    bio: 'Cardióloga',
    address: 'Av. Reforma 100',
    postalCode: '06000',
    latitude: 19.43,
    longitude: -99.13,
    verificationStatus: 'approved',
    ratingAverage: 4.8,
    totalReviews: 50,
    specialties: [],
    updatedAt: new Date().toISOString(),
  };

  it('debe renderizar datos del perfil', () => {
    render(
      <DoctorProfileForm
        profile={baseProfile}
        isSaving={false}
        onSubmit={jest.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+5215511122233')).toBeInTheDocument();
  });

  it('debe mostrar error cuando el teléfono no está en E.164', async () => {
    render(
      <DoctorProfileForm
        profile={baseProfile}
        isSaving={false}
        onSubmit={jest.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.change(screen.getByLabelText('phone'), {
      target: { value: '5512345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(
        screen.getByText('validation.phoneE164')
      ).toBeInTheDocument();
    });
  });

  it('debe enviar payload al guardar', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <DoctorProfileForm profile={baseProfile} isSaving={false} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'Elena' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'Ruiz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Elena',
          lastName: 'Ruiz',
        })
      );
    });
  });
});
