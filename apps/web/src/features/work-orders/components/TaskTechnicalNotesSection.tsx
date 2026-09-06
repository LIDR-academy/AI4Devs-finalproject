'use client';

import type { WorkOrderStatus, WorkOrderTaskDetail } from '../types/work-order.types';
import { TaskTechnicalNotesForm } from './TaskTechnicalNotesForm';
import { TaskTechnicalNotesReadOnly } from './TaskTechnicalNotesReadOnly';

interface TaskTechnicalNotesSectionProps {
  task: WorkOrderTaskDetail;
  workOrderId: string;
  workOrderStatus: WorkOrderStatus;
  onSaveSuccess?: () => void;
}

export function TaskTechnicalNotesSection({
  task,
  workOrderId,
  workOrderStatus,
  onSaveSuccess,
}: TaskTechnicalNotesSectionProps) {
  const isEditable =
    workOrderStatus === 'EN_PROCESO' && task.status !== 'COMPLETED';

  return (
    <details className="mt-3 border-t border-slate-100 pt-3">
      <summary
        className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900"
        aria-expanded={undefined}
      >
        Detalles técnicos
      </summary>
      <div className="mt-3">
        {isEditable ? (
          <TaskTechnicalNotesForm
            workOrderId={workOrderId}
            task={task}
            onSuccess={onSaveSuccess}
          />
        ) : (
          <TaskTechnicalNotesReadOnly notes={task} />
        )}
      </div>
    </details>
  );
}
