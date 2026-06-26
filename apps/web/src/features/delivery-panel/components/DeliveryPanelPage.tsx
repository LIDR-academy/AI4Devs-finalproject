'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useDeliveryReadyList } from '../hooks/useDeliveryReadyList';
import { mapDeliveryError } from '../utils/mapDeliveryError';
import type { DeliveryReadyItem } from '../types/delivery.types';
import { DeliveryReadyTable } from './DeliveryReadyTable';
import { MarkDeliveredDialog } from './MarkDeliveredDialog';

export function DeliveryPanelPage() {
  const [enablePolling, setEnablePolling] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliverTarget, setDeliverTarget] = useState<DeliveryReadyItem | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDeliveryReadyList({ enablePolling });

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleToggleExpand = (workOrderId: string) => {
    setExpandedId((current) => (current === workOrderId ? null : workOrderId));
  };

  const handleDeliverSuccess = () => {
    setDeliverTarget(null);
    setExpandedId(null);
    setToastMessage('Vehículo marcado como entregado');
  };

  const handleDeliverConflict = () => {
    setDeliverTarget(null);
    setExpandedId(null);
    setToastMessage('Esta orden ya fue entregada');
    void refetch();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Listos para entrega
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Vehículos con todas las tareas completadas, pendientes de retiro.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={enablePolling}
              onChange={(event) => setEnablePolling(event.target.checked)}
            />
            Actualizar automáticamente
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner label="Cargando panel de entrega..." />}

      {isError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {mapDeliveryError(error)}
        </p>
      )}

      {!isLoading && !isError && data?.items.length === 0 && (
        <EmptyState
          title="No hay vehículos listos para entrega"
          description="Las órdenes aparecerán aquí cuando todas sus tareas estén completadas."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <DeliveryReadyTable
          items={data.items}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onMarkDelivered={(item) => setDeliverTarget(item)}
        />
      )}

      <MarkDeliveredDialog
        target={deliverTarget}
        open={deliverTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeliverTarget(null);
          }
        }}
        onSuccess={handleDeliverSuccess}
        onConflict={handleDeliverConflict}
      />

      {toastMessage && (
        <p
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toastMessage}
        </p>
      )}
    </section>
  );
}
