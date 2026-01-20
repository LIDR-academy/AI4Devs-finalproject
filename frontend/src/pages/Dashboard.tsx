import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { Link } from 'react-router-dom';
import { UserGroupIcon, CalendarIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch patients
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', 'dashboard'],
    queryFn: () => hceService.getPatients({ limit: 10 }),
  });

  // Fetch surgeries (placeholder - implementar cuando esté disponible)
  const surgeriesCount = 0;
  const checklistsCount = 0;
  const planningsCount = 0;

  const patients = patientsData?.data || [];
  const patientsCount = patients.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-medical-gray-900">
          Bienvenido, {user?.firstName || user?.email || 'Usuario'}
        </h1>
        <p className="text-medical-gray-600 mt-2">
          Sistema Integral de Gestión Quirúrgica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-900 mb-2">
                Cirugías Programadas
              </h3>
              <p className="text-3xl font-bold text-medical-primary">{surgeriesCount}</p>
              <p className="text-sm text-medical-gray-500 mt-1">Hoy</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-medical-primary opacity-20" />
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-900 mb-2">
                Pacientes Registrados
              </h3>
              <p className="text-3xl font-bold text-medical-secondary">
                {patientsLoading ? '...' : patientsCount}
              </p>
              <p className="text-sm text-medical-gray-500 mt-1">Total en sistema</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-medical-secondary opacity-20" />
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-900 mb-2">
                Checklists Pendientes
              </h3>
              <p className="text-3xl font-bold text-medical-warning">{checklistsCount}</p>
              <p className="text-sm text-medical-gray-500 mt-1">Por completar</p>
            </div>
            <ClipboardDocumentCheckIcon className="w-12 h-12 text-medical-warning opacity-20" />
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-900 mb-2">
                Planificaciones
              </h3>
              <p className="text-3xl font-bold text-medical-accent">{planningsCount}</p>
              <p className="text-sm text-medical-gray-500 mt-1">En proceso</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-medical-accent opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-medical-gray-900">
              Pacientes Recientes
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

        <div className="card">
          <h2 className="text-xl font-bold text-medical-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="text-center py-8">
            <p className="text-medical-gray-500">
              No hay actividad reciente para mostrar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
