'use client';

import { Button } from '@/shared/components/Button';
import { WorkOrderStatusBadge } from '@/features/work-orders/components/WorkOrderStatusBadge';
import type { WorkOrderStatus } from '@/features/work-orders/types/work-order.types';
import { formatCurrency } from '@/features/work-orders/utils/formatCurrency';
import type { DeliverTarget, DeliveryReadyItem } from '../types/delivery.types';
import { OwnerPhoneCell } from './OwnerPhoneCell';
import { DeliveryReadyDetail } from './DeliveryReadyDetail';

interface DeliveryReadyTableProps {
  items: DeliveryReadyItem[];
  expandedId: string | null;
  onToggleExpand: (workOrderId: string) => void;
  onMarkContacted: (item: DeliveryReadyItem) => void;
  onMarkDelivered: (target: DeliverTarget) => void;
}

export function DeliveryReadyTable({
  items,
  expandedId,
  onToggleExpand,
  onMarkContacted,
  onMarkDelivered,
}: DeliveryReadyTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-slate-700"
            >
              Placa
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-slate-700"
            >
              Modelo
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-slate-700"
            >
              Propietario
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-slate-700"
            >
              Teléfono
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-slate-700"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-slate-700"
            >
              Monto total
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-slate-700"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => {
            const isExpanded = expandedId === item.workOrderId;

            return (
              <ItemRows
                key={item.workOrderId}
                item={item}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                onMarkContacted={onMarkContacted}
                onMarkDelivered={onMarkDelivered}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ItemRows({
  item,
  isExpanded,
  onToggleExpand,
  onMarkContacted,
  onMarkDelivered,
}: {
  item: DeliveryReadyItem;
  isExpanded: boolean;
  onToggleExpand: (workOrderId: string) => void;
  onMarkContacted: (item: DeliveryReadyItem) => void;
  onMarkDelivered: (target: DeliverTarget) => void;
}) {
  const status = (item.status || 'LISTA_PARA_ENTREGA') as WorkOrderStatus;

  return (
    <>
      <tr className={isExpanded ? 'bg-slate-50' : undefined}>
        <td className="px-4 py-3 font-medium text-slate-900">
          {item.licensePlate}
        </td>
        <td className="px-4 py-3 text-slate-700">{item.vehicleLabel}</td>
        <td className="px-4 py-3 text-slate-700">
          {item.ownerName ?? 'Sin propietario'}
          {!item.ownerName && item.broughtByName ? (
            <span className="mt-1 block text-xs text-slate-500">
              Traído por: {item.broughtByName}
            </span>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <OwnerPhoneCell
            phone={item.ownerPhone}
            phoneDisplay={item.ownerPhoneDisplay}
          />
        </td>
        <td className="px-4 py-3">
          <WorkOrderStatusBadge status={status} />
        </td>
        <td className="px-4 py-3 text-right font-medium text-slate-900">
          {formatCurrency(item.totalAmount)}
        </td>
        <td className="px-4 py-3 text-right">
          <Button
            type="button"
            variant="ghost"
            aria-expanded={isExpanded}
            aria-controls={`delivery-detail-${item.workOrderId}`}
            onClick={() => onToggleExpand(item.workOrderId)}
          >
            {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr id={`delivery-detail-${item.workOrderId}`}>
          <td colSpan={7} className="border-t border-slate-100 bg-slate-50/80">
            <DeliveryReadyDetail
              workOrderId={item.workOrderId}
              licensePlate={item.licensePlate}
              onMarkContacted={() => onMarkContacted(item)}
              onMarkDelivered={onMarkDelivered}
            />
          </td>
        </tr>
      )}
    </>
  );
}
