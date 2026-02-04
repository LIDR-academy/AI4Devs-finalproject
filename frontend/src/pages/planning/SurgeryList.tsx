import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { planningService, SurgeryStatus, SurgeryType } from '@/services/planning.service';
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const statusLabels: Record<SurgeryStatus, string> = {
  [SurgeryStatus.PLANNED]: 'Planificada',
  [SurgeryStatus.SCHEDULED]: 'Programada',
  [SurgeryStatus.IN_PROGRESS]: 'En Progreso',
  [SurgeryStatus.COMPLETED]: 'Completada',
  [SurgeryStatus.CANCELLED]: 'Cancelada',
};

const statusColors: Record<SurgeryStatus, string> = {
  [SurgeryStatus.PLANNED]: 'bg-medical-gray-100 text-medical-gray-800',
  [SurgeryStatus.SCHEDULED]: 'bg-medical-primary/10 text-medical-primary',
  [SurgeryStatus.IN_PROGRESS]: 'bg-medical-warning/10 text-medical-warning',
  [SurgeryStatus.COMPLETED]: 'bg-medical-success/10 text-medical-success',
  [SurgeryStatus.CANCELLED]: 'bg-medical-danger/10 text-medical-danger',
};

const typeLabels: Record<SurgeryType, string> = {
  [SurgeryType.ELECTIVE]: 'Electiva',
  [SurgeryType.URGENT]: 'Urgente',
  [SurgeryType.EMERGENCY]: 'Emergencia',
};

const SurgeryListPage = () => {
  useAuth(); // auth context for protected route
  const [statusFilter, setStatusFilter] = useState<SurgeryStatus | ''>('');

  const { data: surgeries, isLoading, error } = useQuery({
    queryKey: ['surgeries', statusFilter],
    queryFn: () => {
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      // Nota: No filtramos por surgeonId por defecto para mostrar todas las cirugías
      // Si se necesita filtrar por cirujano, se puede agregar un filtro adicional en la UI
      return planningService.getSurgeries(params);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">Cirugías</h1>
          <p className="text-medical-gray-600 mt-2">Gestión de cirugías y planificación preoperatoria</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/planning/calendar"
            className="btn btn-outline flex items-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            Calendario
          </Link>
          <Link
            to="/planning/operating-rooms"
            className="btn btn-outline flex items-center gap-2"
          >
            Quirófanos
          </Link>
          <Link
            to="/planning/surgeries/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Cirugía
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-medical-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SurgeryStatus | '')}
              className="input"
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando cirugías...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar cirugías</p>
            <p className="text-sm text-medical-gray-500">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        ) : !surgeries || surgeries.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <p className="text-medical-gray-500 mb-4">
              {statusFilter ? 'No hay cirugías con este estado' : 'No hay cirugías registradas'}
            </p>
            {!statusFilter && (
              <Link
                to="/planning/surgeries/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Registrar Primera Cirugía
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Paciente</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Procedimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Fecha Programada</th>
                  <th className="text-right py-3 px-4 font-semibold text-medical-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {surgeries.map((surgery) => (
                  <tr
                    key={surgery.id}
                    className="border-b border-medical-gray-100 hover:bg-medical-light transition-colors"
                  >
                    <td className="py-3 px-4">
                      {surgery.patient ? (
                        <div>
                          <p className="font-medium text-medical-gray-900">
                            {surgery.patient.firstName} {surgery.patient.lastName}
                          </p>
                          <p className="text-sm text-medical-gray-500">
                            {new Date(surgery.patient.dateOfBirth).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-medical-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-medical-gray-900">{surgery.procedure}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-medical-gray-700">
                        {typeLabels[surgery.type] || surgery.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[surgery.status] || statusColors[SurgeryStatus.PLANNED]
                        }`}
                      >
                        {statusLabels[surgery.status] || surgery.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {surgery.scheduledDate ? (
                        <div className="flex items-center gap-1 text-sm text-medical-gray-700">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(surgery.scheduledDate).toLocaleDateString('es-ES')}
                          {surgery.scheduledDate.includes('T') && (
                            <span className="text-medical-gray-500">
                              {new Date(surgery.scheduledDate).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-medical-gray-400">No programada</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/planning/surgeries/${surgery.id}`}
                        className="text-medical-primary hover:text-medical-secondary text-sm font-medium"
                      >
                        Ver detalles →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurgeryListPage;
