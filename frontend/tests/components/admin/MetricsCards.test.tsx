/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import MetricsCards from '@/app/components/admin/MetricsCards';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('MetricsCards', () => {
  it('renderiza métricas principales', () => {
    render(
      <MetricsCards
        summary={{
          totalReservations: 10,
          totalCompletedAppointments: 8,
          totalCancellations: 2,
          cancellationRate: 20,
          averageRating: 4.5,
          activeDoctors: 4,
          activePatients: 7,
        }}
      />
    );

    expect(screen.getByText('metrics.totalReservations')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
