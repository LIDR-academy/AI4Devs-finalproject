import { cn } from '@/lib/utils';
import type { OrderStatus, OrderMode } from '@/types/api';

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-gray-100 text-gray-600 border-gray-200',
  PENDING_ADDRESS: 'bg-brand-lime text-brand-black border-brand-lime',
  READY_TO_PROCESS: 'bg-brand-teal text-white border-brand-teal',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELED: 'bg-red-100 text-red-600 border-red-200',
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  PENDING_ADDRESS: 'Dirección pendiente',
  READY_TO_PROCESS: 'Listo',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

const ORDER_MODE_STYLES: Record<OrderMode, string> = {
  ADRESLES: 'bg-brand-black text-brand-lime border-brand-black',
  TRADITIONAL: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ORDER_MODE_LABELS: Record<OrderMode, string> = {
  ADRESLES: 'Adresles',
  TRADITIONAL: 'Tradicional',
};

interface BadgeBaseProps {
  className?: string;
}

export function OrderStatusBadge({
  status,
  className,
}: BadgeBaseProps & { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        ORDER_STATUS_STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderModeBadge({
  mode,
  className,
}: BadgeBaseProps & { mode: OrderMode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        ORDER_MODE_STYLES[mode],
        className,
      )}
    >
      {ORDER_MODE_LABELS[mode]}
    </span>
  );
}
