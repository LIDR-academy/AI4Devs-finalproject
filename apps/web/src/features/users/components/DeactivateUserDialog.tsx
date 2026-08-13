'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useDeactivateUser } from '../hooks/useDeactivateUser';
import type { UserListItem } from '../types/user.types';
import { mapUsersError } from '../utils/mapUsersError';

interface DeactivateUserDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeactivateUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: DeactivateUserDialogProps) {
  const { mutateAsync, isPending, error, reset } = useDeactivateUser();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleConfirm = async () => {
    if (!user) {
      return;
    }

    reset();
    try {
      await mutateAsync(user.id);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error surfaced via mutation state
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Desactivar usuario"
    >
        {user && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              ¿Desactivar la cuenta de <strong>{user.fullName}</strong>? No podrá
              iniciar sesión.
            </p>

            {error && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {mapUsersError(error)}
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
                variant="danger"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? 'Desactivando...' : 'Desactivar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    );
}
