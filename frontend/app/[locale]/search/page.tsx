'use client';

import { Suspense } from 'react';
import DoctorSearch from '@/app/components/search/DoctorSearch';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-4 sm:p-6">Cargando buscador...</div>}>
      <DoctorSearch />
    </Suspense>
  );
}
