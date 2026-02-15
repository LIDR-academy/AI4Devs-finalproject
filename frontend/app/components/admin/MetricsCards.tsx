'use client';

import { useTranslations } from 'next-intl';

interface MetricsCardsProps {
  summary: {
    totalReservations: number;
    totalCompletedAppointments: number;
    totalCancellations: number;
    cancellationRate: number;
    averageRating: number;
    activeDoctors: number;
    activePatients: number;
  };
}

export default function MetricsCards({ summary }: MetricsCardsProps) {
  const t = useTranslations('adminDashboard');

  const cards = [
    { label: t('metrics.totalReservations'), value: summary.totalReservations },
    { label: t('metrics.totalCompletedAppointments'), value: summary.totalCompletedAppointments },
    { label: t('metrics.totalCancellations'), value: summary.totalCancellations },
    { label: t('metrics.cancellationRate'), value: `${summary.cancellationRate}%` },
    { label: t('metrics.averageRating'), value: summary.averageRating.toFixed(2) },
    { label: t('metrics.activeDoctors'), value: summary.activeDoctors },
    { label: t('metrics.activePatients'), value: summary.activePatients },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
