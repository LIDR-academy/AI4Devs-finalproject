'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useWorkOrder } from '../hooks/useWorkOrder';
import { useUpdateTask } from '../hooks/useUpdateTask';
import type { WorkOrderTaskDetail } from '../types/work-order.types';
import type { CompleteTaskFormValues } from '../utils/completeTaskSchema';
import { mapWorkOrdersError } from '../utils/mapWorkOrdersError';
import { AddTaskForm } from './AddTaskForm';
import { CompleteTaskModal } from './CompleteTaskModal';
import { LinkOwnerDialog } from './LinkOwnerDialog';
import { ReadyForDeliveryBanner } from './ReadyForDeliveryBanner';
import { TaskList } from './TaskList';
import { WorkOrderDetailHeader } from './WorkOrderDetailHeader';
import { WorkOrderVisitNotesForm } from './WorkOrderVisitNotesForm';

interface WorkOrderDetailPageProps {
  workOrderId: string;
}

export function WorkOrderDetailPage({ workOrderId }: WorkOrderDetailPageProps) {
  const {
    data: workOrder,
    isLoading,
    isError,
  } = useWorkOrder(workOrderId);
  const {
    mutateAsync: updateTask,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdateError,
  } = useUpdateTask(workOrderId);

  const [taskToComplete, setTaskToComplete] =
    useState<WorkOrderTaskDetail | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [linkOwnerOpen, setLinkOwnerOpen] = useState(false);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  if (isLoading) {
    return <LoadingSpinner label="Cargando orden de trabajo..." />;
  }

  if (isError || !workOrder) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Orden de trabajo
        </h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>No se encontró la orden de trabajo solicitada.</p>
          <Link
            href="/work-orders/new"
            className="mt-2 inline-block font-medium text-red-900 underline"
          >
            Crear nueva orden
          </Link>
        </div>
      </div>
    );
  }

  const isEditable = workOrder.status === 'EN_PROCESO';

  const handleStartTask = async (taskId: string) => {
    resetUpdateError();
    try {
      await updateTask({
        taskId,
        data: { status: 'IN_PROGRESS' },
      });
    } catch {
      // Error handled via mutation state
    }
  };

  const handleCompleteTask = (task: WorkOrderTaskDetail) => {
    resetUpdateError();
    setTaskToComplete(task);
  };

  const handleConfirmComplete = async (values: CompleteTaskFormValues) => {
    if (!taskToComplete) {
      return;
    }

    await updateTask({
      taskId: taskToComplete.id,
      data: {
        status: 'COMPLETED',
        cost: values.cost,
        costNotes: values.costNotes,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/work-orders/new"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Nueva orden de trabajo
      </Link>

      <WorkOrderDetailHeader
        workOrder={workOrder}
        onMileageUpdated={() => setToastMessage('Kilometraje actualizado')}
        onLinkOwner={() => setLinkOwnerOpen(true)}
      />

      <LinkOwnerDialog
        workOrderId={workOrderId}
        open={linkOwnerOpen}
        onOpenChange={setLinkOwnerOpen}
        onSuccess={(vehicleOwnerUnchanged) => {
          setToastMessage(
            vehicleOwnerUnchanged
              ? 'El dueño registrado del vehículo es otro; esta visita queda asociada al cliente seleccionado sin transferir la placa.'
              : 'Propietario asociado',
          );
        }}
      />

      <WorkOrderVisitNotesForm
        workOrder={workOrder}
        onSaveSuccess={() => setToastMessage('Notas de visita guardadas')}
      />

      {workOrder.status === 'LISTA_PARA_ENTREGA' && <ReadyForDeliveryBanner />}

      {updateError && !taskToComplete && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {mapWorkOrdersError(updateError)}
        </p>
      )}

      <TaskList
        tasks={workOrder.tasks}
        workOrderId={workOrderId}
        workOrderStatus={workOrder.status}
        isEditable={isEditable}
        isUpdating={isUpdating}
        onStartTask={handleStartTask}
        onCompleteTask={handleCompleteTask}
        onNotesSaved={() => setToastMessage('Notas guardadas')}
      />

      {isEditable && <AddTaskForm workOrderId={workOrderId} />}

      <CompleteTaskModal
        open={taskToComplete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTaskToComplete(null);
            resetUpdateError();
          }
        }}
        task={taskToComplete}
        onConfirm={handleConfirmComplete}
        isPending={isUpdating}
        errorMessage={updateError ? mapWorkOrdersError(updateError) : null}
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
    </div>
  );
}
