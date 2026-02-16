'use client';

import { useTranslations } from 'next-intl';
import RegisterDoctorForm from '../../../components/auth/RegisterDoctorForm';

// Forzar renderizado dinámico - no pre-renderizar esta página
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RegisterDoctorPage() {
  const t = useTranslations('auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            {t('registerDoctorTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('registerDoctorSubtitle')}
          </p>
        </div>
        <RegisterDoctorForm />
      </div>
    </div>
  );
}
