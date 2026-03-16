import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { planningService, SurgeryStatus } from '@/services/planning.service';
import { Link } from 'react-router-dom';
import { UserGroupIcon, CalendarIcon, ClipboardDocumentCheckIcon, CubeIcon } from '@heroicons/react/24/outline';

const getTodayRangeISO = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
};

const DashboardPage = () => {
  const { user } = useAuth();
  const todayRange = useMemo(() => getTodayRangeISO(), []);

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', 'dashboard'],
    queryFn: () => hceService.getPatients({ limit: 10 }),
  });

  const { data: surgeries = [], isLoading: surgeriesLoading } = useQuery({
    queryKey: ['surgeries', 'dashboard'],
    queryFn: () => planningService.getSurgeries(),
  });

  const { data: surgeriesToday = [], isLoading: surgeriesTodayLoading } = useQuery({
    queryKey: ['surgeries', 'today', todayRange.from, todayRange.to],
    queryFn: () => planningService.getSurgeries({ from: todayRange.from, to: todayRange.to }),
  });

  const patients = patientsData?.data || [];
  const patientsCount = patients.length;
  const surgeriesCount = surgeries.length;
  const surgeriesTodayCount = surgeriesToday.length;
  const checklistsPendingCount = surgeries.filter(
    (s) =>
      s.status === SurgeryStatus.PLANNED ||
      s.status === SurgeryStatus.SCHEDULED ||
      s.status === SurgeryStatus.IN_PROGRESS,
  ).length;
  const planningsCount = surgeries.filter((s) => s.planning != null).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-medical-gray-200">
        <div>
          <h1 className="text-3xl font-semibold text-medical-primary">
            Bienvenido, {user?.firstName || user?.email || 'Usuario'}
          </h1>
          <p className="text-medical-gray-500 mt-1">
            Sistema Integral de Gestión Quirúrgica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/planning/surgeries"
          className="bg-gradient-to-br from-medical-gray-50 to-white border border-medical-gray-200 rounded-lg p-5 border-l-4 border-l-medical-secondary hover:shadow-lg transition-all block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-medical-gray-500 mb-2">Cirugías programadas hoy</p>
              <p className="text-3xl font-bold text-medical-primary">
                {surgeriesTodayLoading ? '...' : surgeriesTodayCount}
              </p>
              <p className="text-xs text-medical-gray-500 mt-1">
                {surgeriesLoading ? '' : `${surgeriesCount} total`}
              </p>
            </div>
            <CalendarIcon className="w-12 h-12 text-medical-primary opacity-20" />
          </div>
        </Link>

        <div className="bg-gradient-to-br from-medical-gray-50 to-white border border-medical-gray-200 rounded-lg p-5 border-l-4 border-l-medical-secondary hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-medical-gray-500 mb-2">Pacientes Registrados</p>
              <p className="text-3xl font-bold text-medical-primary">
                {patientsLoading ? '...' : patientsCount}
              </p>
              <p className="text-xs text-medical-gray-500 mt-1">Total en sistema</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-medical-primary opacity-20" />
          </div>
        </div>

        <Link
          to="/checklist"
          className="bg-gradient-to-br from-medical-gray-50 to-white border border-medical-gray-200 rounded-lg p-5 border-l-4 border-l-medical-secondary hover:shadow-lg transition-all block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-medical-gray-500 mb-2">Checklists pendientes</p>
              <p className="text-3xl font-bold text-medical-primary">
                {surgeriesLoading ? '...' : checklistsPendingCount}
              </p>
              <p className="text-xs text-medical-gray-500 mt-1">Por completar</p>
            </div>
            <ClipboardDocumentCheckIcon className="w-12 h-12 text-medical-primary opacity-20" />
          </div>
        </Link>

        <Link
          to="/planning/surgeries"
          className="bg-gradient-to-br from-medical-gray-50 to-white border border-medical-gray-200 rounded-lg p-5 border-l-4 border-l-medical-secondary hover:shadow-lg transition-all block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-medical-gray-500 mb-2">Planificaciones</p>
              <p className="text-3xl font-bold text-medical-primary">
                {surgeriesLoading ? '...' : planningsCount}
              </p>
              <p className="text-xs text-medical-gray-500 mt-1">Con planificación 3D</p>
            </div>
            <CubeIcon className="w-12 h-12 text-medical-primary opacity-20" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-medical-gray-800">
                Cirugías recientes
              </h2>
              <Link
                to="/planning/surgeries"
                className="text-sm text-medical-primary hover:text-medical-secondary font-medium"
              >
                Ver todas →
              </Link>
            </div>
            {surgeriesLoading ? (
              <div className="text-center py-8">
                <p className="text-medical-gray-500">Cargando cirugías...</p>
              </div>
            ) : surgeries.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-2" />
                <p className="text-medical-gray-500 mb-4">No hay cirugías registradas</p>
                <Link
                  to="/planning/surgeries/new"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  Planificar cirugía
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {surgeries.slice(0, 5).map((surgery) => (
                  <Link
                    key={surgery.id}
                    to={`/planning/surgeries/${surgery.id}`}
                    className="block p-3 rounded-lg border border-medical-gray-200 hover:border-medical-primary hover:bg-medical-light transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-medical-gray-900">{surgery.procedure}</p>
                        <p className="text-sm text-medical-gray-500">
                          {surgery.patient
                            ? `${surgery.patient.firstName} ${surgery.patient.lastName}`
                            : 'Paciente'}{' '}
                          •{' '}
                          {surgery.scheduledDate
                            ? new Date(surgery.scheduledDate).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Sin fecha'}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          surgery.status === 'completed'
                            ? 'bg-medical-success/10 text-medical-success'
                            : surgery.status === 'cancelled'
                              ? 'bg-medical-danger/10 text-medical-danger'
                              : 'bg-medical-primary/10 text-medical-primary'
                        }`}
                      >
                        {surgery.status === 'planned'
                          ? 'Planificada'
                          : surgery.status === 'scheduled'
                            ? 'Programada'
                            : surgery.status === 'in_progress'
                              ? 'En curso'
                              : surgery.status === 'completed'
                                ? 'Completada'
                                : surgery.status === 'cancelled'
                                  ? 'Cancelada'
                                  : surgery.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-medical-gray-800">
                Pacientes recientes
              </h2>
              <Link
                to="/hce"
                className="text-sm text-medical-primary hover:text-medical-secondary font-medium"
              >
                Ver todos →
              </Link>
            </div>
            {patientsLoading ? (
            <div className="text-center py-8">
              <p className="text-medical-gray-500">Cargando pacientes...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-2" />
              <p className="text-medical-gray-500 mb-4">No hay pacientes registrados</p>
              <Link
                to="/hce"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <UserGroupIcon className="w-4 h-4" />
                Registrar Primer Paciente
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.slice(0, 5).map((patient) => (
                <Link
                  key={patient.id}
                  to={`/hce/patients/${patient.id}`}
                  className="block p-3 rounded-lg border border-medical-gray-200 hover:border-medical-primary hover:bg-medical-light transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-medical-gray-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-medical-gray-500">
                        {patient.gender} • {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-xs text-medical-gray-400">
                      {new Date(patient.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-medical-gray-800 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/hce/patients/new"
              className="p-4 bg-white border-2 border-medical-gray-200 rounded-lg text-center cursor-pointer transition-all hover:border-medical-secondary hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">👤</div>
              <div className="font-semibold text-medical-gray-800 mb-1">Nuevo Paciente</div>
              <div className="text-xs text-medical-gray-500">Registrar paciente</div>
            </Link>
            <Link
              to="/planning/surgeries/new"
              className="p-4 bg-white border-2 border-medical-gray-200 rounded-lg text-center cursor-pointer transition-all hover:border-medical-secondary hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-medical-gray-800 mb-1">Planificar Cirugía</div>
              <div className="text-xs text-medical-gray-500">Crear planificación</div>
            </Link>
            <Link
              to="/checklist"
              className="p-4 bg-white border-2 border-medical-gray-200 rounded-lg text-center cursor-pointer transition-all hover:border-medical-secondary hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold text-medical-gray-800 mb-1">Ver Checklist</div>
              <div className="text-xs text-medical-gray-500">Revisar checklist</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
