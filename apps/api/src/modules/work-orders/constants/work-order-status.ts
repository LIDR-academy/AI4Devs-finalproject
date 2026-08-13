import { WorkOrderStatus } from '@prisma/client';

export const ACTIVE_WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.EN_PROCESO,
  WorkOrderStatus.LISTA_PARA_ENTREGA,
  WorkOrderStatus.OWNER_CONTACTED,
];

/** Statuses where mileage may be edited by ADMIN or MECHANIC (US-D7). */
export const MILEAGE_EDITABLE_PRE_DELIVERY_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.EN_PROCESO,
  WorkOrderStatus.LISTA_PARA_ENTREGA,
  WorkOrderStatus.OWNER_CONTACTED,
];
