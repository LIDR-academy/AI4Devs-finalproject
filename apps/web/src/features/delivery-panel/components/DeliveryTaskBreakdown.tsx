import { formatCurrency } from '@/features/work-orders/utils/formatCurrency';

interface DeliveryTaskBreakdownProps {
  tasks: Array<{
    id: string;
    description: string;
    cost: number | null;
    costNotes: string | null;
  }>;
}

export function DeliveryTaskBreakdown({ tasks }: DeliveryTaskBreakdownProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 text-left font-medium text-slate-700"
            >
              Tarea
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-right font-medium text-slate-700"
            >
              Costo
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left font-medium text-slate-700"
            >
              Detalle cobro
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-3 py-2 text-slate-900">{task.description}</td>
              <td className="px-3 py-2 text-right text-slate-700">
                {formatCurrency(task.cost ?? 0)}
              </td>
              <td className="px-3 py-2 text-slate-600">
                {task.costNotes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
