'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getSpecialties } from '@/lib/api/doctors';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';

interface HomeHeroActionsProps {
  locale: string;
  ctaSearch: string;
  ctaDoctor: string;
}

interface HeroSearchFormData {
  specialty: string;
  postalCode: string;
  radius: number;
}

export default function HomeHeroActions({
  locale,
  ctaSearch,
  ctaDoctor,
}: HomeHeroActionsProps) {
  const tSearch = useTranslations('search');
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { location, loading: locationLoading, error: locationError, requestLocation } = useGeolocation();
  const isPatient = user?.role === 'patient' || user?.role === 'client';
  const shouldShowDoctorCTA = !loading && !(isAuthenticated && isPatient);
  const { data: specialtiesData } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  });

  const { register, handleSubmit, watch } = useForm<HeroSearchFormData>({
    defaultValues: {
      specialty: '',
      postalCode: '',
      radius: 5,
    },
  });

  const specialty = watch('specialty');
  const postalCode = watch('postalCode');

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const onSubmit = (values: HeroSearchFormData) => {
    const trimmedPostalCode = values.postalCode.trim();
    const hasLocation = !!location;
    const hasPostalCode = trimmedPostalCode.length > 0;

    if (!hasLocation && !hasPostalCode) {
      return;
    }

    const params = new URLSearchParams({
      specialty: values.specialty,
      radius: String(values.radius || 5),
    });

    if (location) {
      params.set('lat', String(location.lat));
      params.set('lng', String(location.lng));
    }

    if (hasPostalCode) {
      params.set('postalCode', trimmedPostalCode);
    }

    router.push(`/${locale}/search?${params.toString()}`);
  };

  return (
    <div className="mt-6 space-y-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-3 rounded-xl bg-white/95 p-4 text-slate-900 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="hero-specialty" className="mb-1 block text-xs font-medium text-slate-700">
            {tSearch('specialty')}
          </label>
          <select
            id="hero-specialty"
            {...register('specialty', { required: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">{tSearch('selectSpecialty')}</option>
            {specialtiesData?.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.nameEs}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="hero-postal-code" className="mb-1 block text-xs font-medium text-slate-700">
            {tSearch('postalCode')}
          </label>
          <input
            id="hero-postal-code"
            type="text"
            {...register('postalCode')}
            placeholder={tSearch('postalCodePlaceholder')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="hero-radius" className="mb-1 block text-xs font-medium text-slate-700">
            {tSearch('radius')}
          </label>
          <select
            id="hero-radius"
            {...register('radius', { valueAsNumber: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!specialty || (!location && !postalCode.trim())}
            className="w-full rounded-md border border-[#0b7f6f] bg-[#0f9a86] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0b7f6f] focus:outline-none focus:ring-2 focus:ring-[#0b7f6f]/50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-400"
          >
            {ctaSearch}
          </button>
        </div>

        {locationLoading ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-slate-600">
            {tSearch('gettingLocation')}
          </p>
        ) : null}

        {location ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-emerald-700">
            {tSearch('yourLocation')}
          </p>
        ) : null}

        {!location && locationError ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-amber-700">{locationError}</p>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-3">
        {shouldShowDoctorCTA ? (
          <Link
            href={`/${locale}/register/doctor`}
            className="rounded-md border border-white/70 px-5 py-2.5 font-medium text-white hover:bg-white/10"
          >
            {ctaDoctor}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
