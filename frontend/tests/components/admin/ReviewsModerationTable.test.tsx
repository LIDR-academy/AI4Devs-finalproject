/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import ReviewsModerationTable from '@/app/components/admin/ReviewsModerationTable';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/hooks/admin/useReviewsModeration', () => ({
  useApproveReviewModeration: () => ({ mutate: jest.fn() }),
  useRejectReviewModeration: () => ({ mutate: jest.fn() }),
}));

describe('ReviewsModerationTable', () => {
  it('renderiza filas de reseñas pendientes', () => {
    render(
      <ReviewsModerationTable
        items={[
          {
            reviewId: 'r1',
            patientName: 'Paciente 1',
            doctorName: 'Doctor 1',
            rating: 5,
            comment: 'Excelente atención',
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    );

    expect(screen.getByText('Paciente 1')).toBeInTheDocument();
    expect(screen.getByText('Doctor 1')).toBeInTheDocument();
    expect(screen.getByText('Excelente atención')).toBeInTheDocument();
  });
});
