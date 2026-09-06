'use client';

import { Button } from '@/shared/components/Button';
import type {
  WorkOrderStatus,
  WorkOrderTaskDetail,
} from '../types/work-order.types';
import { formatCurrency } from '../utils/formatCurrency';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskTechnicalNotesSection } from './TaskTechnicalNotesSection';

interface TaskRowProps {
  task: WorkOrderTaskDetail;
  workOrderId: string;
  workOrderStatus: WorkOrderStatus;
  isEditable: boolean;
  isUpdating: boolean;
  onStart: (taskId: string) => void;
  onComplete: (task: WorkOrderTaskDetail) => void;
  onNotesSaved?: () => void;
}

export function TaskRow({
  task,
  workOrderId,
  workOrderStatus,
  isEditable,
  isUpdating,
  onStart,
  onComplete,
  onNotesSaved,
}: TaskRowProps) {
  const showActions = isEditable && task.status !== 'COMPLETED';

  return (
    <li className="rounded-lg border border-slate-200 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-slate-900">{task.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            {task.status === 'COMPLETED' && task.cost !== null && (
              <span className="text-sm font-medium text-slate-800">
                {formatCurrency(task.cost)}
              </span>
            )}
          </div>
          {task.costNotes && (
            <p className="text-sm text-slate-600">{task.costNotes}</p>
          )}
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2">
            {task.status === 'PENDING' && (
              <Button
                type="button"
                variant="secondary"
                disabled={isUpdating}
                onClick={() => onStart(task.id)}
              >
                Iniciar
              </Button>
            )}
            {(task.status === 'PENDING' || task.status === 'IN_PROGRESS') && (
              <Button
                type="button"
                disabled={isUpdating}
                onClick={() => onComplete(task)}
              >
                Completar
              </Button>
            )}
          </div>
        )}
      </div>

      <TaskTechnicalNotesSection
        task={task}
        workOrderId={workOrderId}
        workOrderStatus={workOrderStatus}
        onSaveSuccess={onNotesSaved}
      />
    </li>
  );
}
