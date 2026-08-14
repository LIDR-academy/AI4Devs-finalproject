'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { useEligibleReminders } from '../hooks/useEligibleReminders';
import { useOptedOutReminders } from '../hooks/useOptedOutReminders';
import {
  useReminderOptIn,
} from '../hooks/useReminderMutations';
import type {
  EligibleReminderItem,
  SendRemindersResponse,
} from '../types/reminders.types';
import { mapRemindersError } from '../utils/mapRemindersError';
import { mapSendSummaryToToast } from '../utils/mapReminderEmailStatus';
import { EligibleRemindersTable } from './EligibleRemindersTable';
import { OptedOutRemindersTable } from './OptedOutRemindersTable';
import { OptOutReminderDialog } from './OptOutReminderDialog';
import { SendRemindersDialog } from './SendRemindersDialog';

const PAGE_SIZE = 50;

type TabId = 'eligible' | 'exclusions';

export function RemindersPage() {
  const [tab, setTab] = useState<TabId>('eligible');
  const [offset, setOffset] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendOpen, setSendOpen] = useState(false);
  const [optOutTarget, setOptOutTarget] =
    useState<Pick<EligibleReminderItem, 'vehicleId' | 'licensePlate'> | null>(
      null,
    );
  const [toast, setToast] = useState<string | null>(null);
  const [optInPendingId, setOptInPendingId] = useState<string | null>(null);

  const eligibleQuery = useEligibleReminders({
    limit: PAGE_SIZE,
    offset,
    enabled: tab === 'eligible',
  });
  const optedOutQuery = useOptedOutReminders({
    enabled: tab === 'exclusions',
  });
  const optInMutation = useReminderOptIn();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const items = eligibleQuery.data?.items ?? [];
  const total = eligibleQuery.data?.total ?? 0;
  const thresholdDays = eligibleQuery.data?.thresholdDays ?? 180;

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.vehicleId)),
    [items, selectedIds],
  );

  const toggleRow = (vehicleId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
      } else {
        next.add(vehicleId);
      }
      return next;
    });
  };

  const toggleAllVisible = () => {
    const allSelected =
      items.length > 0 && items.every((item) => selectedIds.has(item.vehicleId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const item of items) {
          next.delete(item.vehicleId);
        }
      } else {
        for (const item of items) {
          next.add(item.vehicleId);
        }
      }
      return next;
    });
  };

  const handleSendCompleted = (response: SendRemindersResponse) => {
    setSelectedIds(new Set());
    setToast(mapSendSummaryToToast(response.summary));
  };

  const handleOptIn = async (vehicleId: string) => {
    setOptInPendingId(vehicleId);
    try {
      await optInMutation.mutateAsync(vehicleId);
      setToast('Vehículo reactivado');
    } catch (error) {
      setToast(mapRemindersError(error));
    } finally {
      setOptInPendingId(null);
    }
  };

  const canGoPrev = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Recordatorios de mantenimiento
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Vehículos con más de {thresholdDays} días sin visita entregada
        </p>
      </section>

      {toast && (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
        >
          {toast}
        </div>
      )}

      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab('eligible')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'eligible'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Elegibles
        </button>
        <button
          type="button"
          onClick={() => setTab('exclusions')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'exclusions'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Exclusiones
        </button>
      </div>

      {tab === 'eligible' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void eligibleQuery.refetch()}
              disabled={eligibleQuery.isFetching}
            >
              Actualizar
            </Button>
            <Button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setSendOpen(true)}
            >
              Enviar recordatorio
            </Button>
          </div>

          {eligibleQuery.isLoading && (
            <p className="text-sm text-slate-600">Cargando recordatorios…</p>
          )}

          {eligibleQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              {mapRemindersError(eligibleQuery.error)}
            </p>
          )}

          {!eligibleQuery.isLoading &&
            !eligibleQuery.isError &&
            total === 0 && (
              <p className="text-sm text-slate-600">
                No hay vehículos pendientes de recordatorio.
              </p>
            )}

          {!eligibleQuery.isLoading &&
            !eligibleQuery.isError &&
            items.length > 0 && (
              <>
                <EligibleRemindersTable
                  items={items}
                  selectedIds={selectedIds}
                  onToggleRow={toggleRow}
                  onToggleAllVisible={toggleAllVisible}
                  onOptOut={(item) =>
                    setOptOutTarget({
                      vehicleId: item.vehicleId,
                      licensePlate: item.licensePlate,
                    })
                  }
                />

                {total > PAGE_SIZE && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      Mostrando {rangeStart}–{rangeEnd} de {total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!canGoPrev}
                        onClick={() => {
                          setOffset((value) => Math.max(0, value - PAGE_SIZE));
                          setSelectedIds(new Set());
                        }}
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!canGoNext}
                        onClick={() => {
                          setOffset((value) => value + PAGE_SIZE);
                          setSelectedIds(new Set());
                        }}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
        </section>
      )}

      {tab === 'exclusions' && (
        <section className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void optedOutQuery.refetch()}
            disabled={optedOutQuery.isFetching}
          >
            Actualizar
          </Button>

          {optedOutQuery.isLoading && (
            <p className="text-sm text-slate-600">Cargando exclusiones…</p>
          )}

          {optedOutQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              {mapRemindersError(optedOutQuery.error)}
            </p>
          )}

          {!optedOutQuery.isLoading &&
            !optedOutQuery.isError &&
            (optedOutQuery.data?.total ?? 0) === 0 && (
              <p className="text-sm text-slate-600">
                No hay vehículos excluidos.
              </p>
            )}

          {!optedOutQuery.isLoading &&
            !optedOutQuery.isError &&
            (optedOutQuery.data?.items.length ?? 0) > 0 && (
              <OptedOutRemindersTable
                items={optedOutQuery.data?.items ?? []}
                onOptIn={(vehicleId) => void handleOptIn(vehicleId)}
                isOptInPending={optInMutation.isPending}
                pendingVehicleId={optInPendingId}
              />
            )}
        </section>
      )}

      <SendRemindersDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        selectedItems={selectedItems}
        onCompleted={handleSendCompleted}
      />

      <OptOutReminderDialog
        target={optOutTarget}
        open={optOutTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOptOutTarget(null);
          }
        }}
        onSuccess={() => {
          setSelectedIds((prev) => {
            if (!optOutTarget) {
              return prev;
            }
            const next = new Set(prev);
            next.delete(optOutTarget.vehicleId);
            return next;
          });
          setToast('Vehículo excluido de recordatorios');
        }}
      />
    </div>
  );
}
