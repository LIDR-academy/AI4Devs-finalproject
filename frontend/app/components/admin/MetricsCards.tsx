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
  const numberFormatter = new Intl.NumberFormat('es-MX');

  const cards = [
    { label: t('metrics.totalReservations'), value: numberFormatter.format(summary.totalReservations) },
    {
      label: t('metrics.totalCompletedAppointments'),
      value: numberFormatter.format(summary.totalCompletedAppointments),
    },
    { label: t('metrics.totalCancellations'), value: numberFormatter.format(summary.totalCancellations) },
    { label: t('metrics.cancellationRate'), value: `${summary.cancellationRate}%` },
    { label: t('metrics.averageRating'), value: summary.averageRating.toFixed(2) },
    { label: t('metrics.activeDoctors'), value: numberFormatter.format(summary.activeDoctors) },
    { label: t('metrics.activePatients'), value: numberFormatter.format(summary.activePatients) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-testid="admin-metrics-cards">
      {cards.map((card, index) => (
        <div
          key={card.label}
          data-testid={`admin-metric-card-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-slate-600">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
