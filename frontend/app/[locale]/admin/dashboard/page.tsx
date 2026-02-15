'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminMetrics,
  useAdminRatings,
} from '@/hooks/admin/useAdminMetrics';
import { useVerificationList } from '@/hooks/admin/useVerificationList';
import { useReviewsModeration } from '@/hooks/admin/useReviewsModeration';
import MetricsCards from '@/app/components/admin/MetricsCards';
import ReservationsChart from '@/app/components/admin/ReservationsChart';
import CancellationsChart from '@/app/components/admin/CancellationsChart';
import RatingsPie from '@/app/components/admin/RatingsPie';
import VerificationTable from '@/app/components/admin/VerificationTable';
import ReviewsModerationTable from '@/app/components/admin/ReviewsModerationTable';

export default function AdminDashboardPage() {
  const t = useTranslations('adminDashboard');
  const { user, isAuthenticated, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const metricsQuery = useAdminMetrics();
  const ratingsQuery = useAdminRatings();
  const verificationQuery = useVerificationList(1, 20, 'pending');
  const reviewsQuery = useReviewsModeration(1, 20);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (!loading && user && user.role !== 'admin') {
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, loading, locale, router, user]);

  if (loading || metricsQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (metricsQuery.isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700">
          {(metricsQuery.error as Error).message || t('common.error')}
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-600">{t('common.empty')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        {metrics.stale && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
            {t('common.staleData')}
          </span>
        )}
      </div>

      <MetricsCards summary={metrics.summary} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReservationsChart data={metrics.reservationsSeries} />
        <CancellationsChart data={metrics.cancellationsSeries} />
      </div>

      <RatingsPie data={ratingsQuery.data?.ratingsBySpecialty || metrics.ratingsBySpecialty} />

      <VerificationTable items={verificationQuery.data?.items || []} />
      <ReviewsModerationTable items={reviewsQuery.data?.items || []} />
    </div>
  );
}
