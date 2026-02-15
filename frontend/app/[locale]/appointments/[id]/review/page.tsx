'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ReviewForm from '@/app/components/reviews/ReviewForm';
import { useAppointmentReview } from '@/hooks/useReview';
import { useAuth } from '@/hooks/useAuth';

export default function AppointmentReviewPage() {
  const t = useTranslations('reviews');
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const locale = params.locale as string;
  const appointmentId = params.id as string;
  const [createdNow, setCreatedNow] = useState(false);

  const reviewQuery = useAppointmentReview(appointmentId);
  const reviewExists = reviewQuery.data || createdNow;
  const isReviewMissing = (reviewQuery.error as { status?: number } | undefined)?.status === 404;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  if (loading) {
    return <div className="container mx-auto p-4">{t('loading')}</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('createTitle')}</h1>
      <p className="text-gray-600 mb-6">{t('subtitle')}</p>

      {reviewQuery.isLoading ? (
        <div className="text-gray-600">{t('loadingReviewStatus')}</div>
      ) : reviewExists ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
          {t('alreadyReviewed')}
        </div>
      ) : isReviewMissing ? (
        <ReviewForm appointmentId={appointmentId} onCreated={() => setCreatedNow(true)} />
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {t('errors.generic')}
        </div>
      )}

      <div className="mt-6">
        <Link href={`/${locale}/appointments`} className="text-blue-700 hover:underline">
          {t('backToAppointments')}
        </Link>
      </div>
    </div>
  );
}
