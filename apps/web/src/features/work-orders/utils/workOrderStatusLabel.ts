import type { WorkOrderStatus } from '../types/work-order.types';

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  EN_PROCESO: 'En proceso',
  LISTA_PARA_ENTREGA: 'Lista para entrega',
  OWNER_CONTACTED: 'Propietario contactado',
  ENTREGADA: 'Entregada',
};

export function getWorkOrderStatusLabel(status: WorkOrderStatus): string {
  return STATUS_LABELS[status];
}
