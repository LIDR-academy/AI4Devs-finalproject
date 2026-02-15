'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DoctorProfileForm from '@/app/components/doctors/DoctorProfileForm';
import { UpdateDoctorProfilePayload } from '@/lib/api/doctors';
import { useAuth } from '@/hooks/useAuth';
import { useDoctorProfile, useUpdateDoctorProfile } from '@/hooks/useDoctorProfile';

export default function DoctorProfilePage() {
  const t = useTranslations('doctorProfile');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, loading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const profileQuery = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'doctor') {
      router.push(`/${locale}/appointments`);
    }
  }, [isAuthenticated, loading, locale, router, user?.role]);

  if (loading || profileQuery.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : t('loadError')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
      <p className="text-sm text-gray-600 mb-4">
        {t('email')}: {profileQuery.data.email}
      </p>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/doctors/schedules`)}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          {t('manageSchedules')}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {warningMessage && (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md">
          {warningMessage}
        </div>
      )}

      {updateProfile.isError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {updateProfile.error instanceof Error
            ? updateProfile.error.message
            : t('saveError')}
        </div>
      )}

      <DoctorProfileForm
        profile={profileQuery.data}
        isSaving={updateProfile.isPending}
        onSubmit={async (payload: UpdateDoctorProfilePayload) => {
          setSuccessMessage(null);
          setWarningMessage(null);
          const response = await updateProfile.mutateAsync(payload);
          setSuccessMessage(response.message || t('saveSuccess'));
          if (response.warnings?.length) {
            setWarningMessage(response.warnings.join(' '));
          }
          await profileQuery.refetch();
        }}
      />
    </div>
  );
}
