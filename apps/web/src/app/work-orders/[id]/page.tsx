'use client';

import { useParams } from 'next/navigation';
import { WorkOrderDetailPage } from '@/features/work-orders/components/WorkOrderDetailPage';

export default function WorkOrderDetailRoute() {
  const params = useParams<{ id: string }>();

  return <WorkOrderDetailPage workOrderId={params.id} />;
}
