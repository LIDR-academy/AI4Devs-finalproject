'use client';

import type {
  WorkOrderStatus,
  WorkOrderTaskDetail,
} from '../types/work-order.types';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: WorkOrderTaskDetail[];
  workOrderId: string;
  workOrderStatus: WorkOrderStatus;
  isEditable: boolean;
  isUpdating: boolean;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (task: WorkOrderTaskDetail) => void;
  onNotesSaved?: () => void;
}

export function TaskList({
  tasks,
  workOrderId,
  workOrderStatus,
  isEditable,
  isUpdating,
  onStartTask,
  onCompleteTask,
  onNotesSaved,
}: TaskListProps) {
  const sortedTasks = [...tasks].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return 0;
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Tareas</h2>

      {sortedTasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">Sin tareas</p>
      ) : (
        <ul className="mt-4 space-y-3" aria-label="Lista de tareas">
          {sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              workOrderId={workOrderId}
              workOrderStatus={workOrderStatus}
              isEditable={isEditable}
              isUpdating={isUpdating}
              onStart={onStartTask}
              onComplete={onCompleteTask}
              onNotesSaved={onNotesSaved}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
