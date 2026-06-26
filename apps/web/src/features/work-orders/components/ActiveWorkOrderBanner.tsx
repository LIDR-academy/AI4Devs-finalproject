import Link from 'next/link';
import type { ActiveWorkOrder } from '../types/work-order.types';

interface ActiveWorkOrderBannerProps {
  activeWorkOrder: ActiveWorkOrder;
}

export function ActiveWorkOrderBanner({
  activeWorkOrder,
}: ActiveWorkOrderBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="font-medium">
        Este vehículo ya tiene una orden de trabajo activa.
      </p>
      <Link
        href={`/work-orders/${activeWorkOrder.id}`}
        className="mt-2 inline-block font-medium text-amber-950 underline"
      >
        Ver orden de trabajo
      </Link>
    </div>
  );
}
