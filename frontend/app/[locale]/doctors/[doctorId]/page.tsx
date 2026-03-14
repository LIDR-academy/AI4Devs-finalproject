'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { getDoctorById } from '@/lib/api/doctors';

export default function DoctorPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const doctorId = params.doctorId as string;
  const { isAuthenticated, loading } = useAuth();
  const { accessToken } = useAuthStore();

  const doctorQuery = useQuery({
    queryKey: ['doctor-profile-public', doctorId],
    queryFn: () => getDoctorById(doctorId, accessToken!),
    enabled: !!doctorId && !!accessToken && isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  if (loading || doctorQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="text-slate-600">Cargando perfil del médico...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (doctorQuery.isError || !doctorQuery.data) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {doctorQuery.error instanceof Error ? doctorQuery.error.message : 'Médico no encontrado'}
        </div>
        <Link
          href={`/${locale}/search`}
          className="mt-3 inline-flex rounded-md bg-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-300"
        >
          Volver a búsqueda
        </Link>
      </div>
    );
  }

  const doctor = doctorQuery.data;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-4 lg:grid-cols-3">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dra./Dr. {doctor.firstName} {doctor.lastName}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {doctor.specialties.map((spec) => (
            <span key={spec.id} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
              {locale === 'en' ? spec.nameEn : spec.nameEs}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-700">{doctor.address}</p>
        {doctor.bio && <p className="mt-4 text-sm text-slate-600">{doctor.bio}</p>}
      </section>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Agenda presencial disponible</p>
        <Link
          href={`/${locale}/doctors/${doctorId}/availability`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Ver disponibilidad
        </Link>
        <Link
          href={`/${locale}/search`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Seguir buscando
        </Link>
      </aside>
    </div>
  );
}
