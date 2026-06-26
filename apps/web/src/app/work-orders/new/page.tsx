import { Suspense } from 'react';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { NewWorkOrderPageClient } from './NewWorkOrderPageClient';

export default function NewWorkOrderPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando..." />}>
      <NewWorkOrderPageClient />
    </Suspense>
  );
}
