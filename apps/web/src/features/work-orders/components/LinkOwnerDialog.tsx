'use client';

import { useEffect, useState } from 'react';
import type { Client } from '@/features/clients/types/client.types';
import { ClientPicker } from '@/features/vehicles';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useLinkOwner } from '../hooks/useLinkOwner';
import { mapWorkOrdersError } from '../utils/mapWorkOrdersError';

interface LinkOwnerDialogProps {
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (vehicleOwnerUnchanged: boolean) => void;
}

export function LinkOwnerDialog({
  workOrderId,
  open,
  onOpenChange,
  onSuccess,
}: LinkOwnerDialogProps) {
  const { mutateAsync, isPending, error, reset } = useLinkOwner(workOrderId);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedClient(null);
    }
  }, [open, reset]);

  const handleConfirm = async () => {
    if (!selectedClient) {
      return;
    }

    reset();
    try {
      const result = await mutateAsync(selectedClient.id);
      onOpenChange(false);
      onSuccess(result.vehicleOwnerUnchanged);
    } catch {
      // Error shown via mapWorkOrdersError
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Asociar propietario">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Selecciona el cliente propietario para asociarlo a esta visita.
        </p>

        <ClientPicker
          value={selectedClient?.id ?? null}
          onChange={setSelectedClient}
          selectedClient={selectedClient}
        />

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {mapWorkOrdersError(error)}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isPending || !selectedClient}
          >
            {isPending ? 'Guardando...' : 'Asociar propietario'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
