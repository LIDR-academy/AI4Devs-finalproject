import { Suspense } from 'react';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { NewVehiclePageClient } from './NewVehiclePageClient';

export default function NewVehiclePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando..." />}>
      <NewVehiclePageClient />
    </Suspense>
  );
}
