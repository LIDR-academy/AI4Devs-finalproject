import { WorkOrderStatus } from '@prisma/client';

export const ACTIVE_WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.EN_PROCESO,
  WorkOrderStatus.LISTA_PARA_ENTREGA,
];
