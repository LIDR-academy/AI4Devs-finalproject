'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getDoctorById } from '@/lib/api/doctors';
import { useAuthStore } from '@/store/authStore';
import SlotSelector from '@/app/components/appointments/SlotSelector';

export default function DoctorAvailabilityPage() {
  const { isAuthenticated, loading } = useAuth();
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const doctorId = params.doctorId as string;
  const locale = params.locale as string;

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => getDoctorById(doctorId, accessToken!),
    enabled: !!doctorId && !!accessToken && !!isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, router, locale]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || (!isLoading && !doctor)) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : 'Médico no encontrado'}
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/search`)}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Volver a búsqueda
        </button>
      </div>
    );
  }

  if (isLoading || !doctor) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando médico...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Confirma tus datos y agenda</h1>
      <p className="mb-6 text-sm text-slate-600">Completa la información para reservar tu cita presencial.</p>
      <SlotSelector
        doctorId={doctorId}
        doctor={doctor}
        accessToken={accessToken!}
      />
    </div>
  );
}
