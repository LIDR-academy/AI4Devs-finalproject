'use client';

import { Fragment, useState } from 'react';
import { TaskStatusBadge } from '@/features/work-orders/components/TaskStatusBadge';
import { formatCurrency } from '@/features/work-orders/utils/formatCurrency';
import type { WorkOrderTaskStatus } from '@/features/work-orders/types/work-order.types';
import type { HistoryTask } from '../types/history.types';
import { VisitTechnicalNotesReadOnly } from './VisitTechnicalNotesReadOnly';

interface VisitTasksListProps {
  tasks: HistoryTask[];
  workOrderId: string;
}

export function VisitTasksList({ tasks, workOrderId }: VisitTasksListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <p className="text-sm italic text-slate-500">Sin tareas registradas</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-700">
              Tarea
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-700">
              Estado
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-700">
              Costo
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-700">
              Detalle cobro
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-700">
              Detalle
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {tasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;

            return (
              <Fragment key={task.id}>
                <tr>
                  <td className="px-3 py-2 text-slate-900">{task.description}</td>
                  <td className="px-3 py-2">
                    <TaskStatusBadge status={task.status as WorkOrderTaskStatus} />
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {task.cost !== null ? formatCurrency(task.cost) : '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {task.costNotes ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedTaskId(isExpanded ? null : task.id)
                      }
                    >
                      {isExpanded ? 'Ocultar' : 'Técnico'}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50 px-3 py-3">
                      <VisitTechnicalNotesReadOnly
                        visitNotes={{
                          visitDiagnosis: null,
                          visitRepairSummary: null,
                          visitPartsUsed: null,
                          visitAdditionalNotes: null,
                        }}
                        workOrderId={workOrderId}
                        variant="task"
                        task={task}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
