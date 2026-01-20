import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => hceService.getPatientById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
          <p className="text-medical-gray-500">Cargando paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar el paciente</p>
            <Link to="/hce" className="btn btn-primary">
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hce')}
            className="text-medical-gray-600 hover:text-medical-primary"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-medical-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-medical-gray-600 mt-2">Detalles del paciente</p>
          </div>
        </div>
        <Link
          to={`/hce/patients/${patient.id}/edit`}
          className="btn btn-primary flex items-center gap-2"
        >
          <PencilIcon className="w-5 h-5" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Nombre</label>
                <p className="text-medical-gray-900 mt-1">{patient.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Apellido</label>
                <p className="text-medical-gray-900 mt-1">{patient.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Fecha de Nacimiento</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Género</label>
                <p className="text-medical-gray-900 mt-1">{patient.gender}</p>
              </div>
              {patient.email && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Email</label>
                  <p className="text-medical-gray-900 mt-1">{patient.email}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Teléfono</label>
                  <p className="text-medical-gray-900 mt-1">{patient.phone}</p>
                </div>
              )}
              {patient.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-medical-gray-500">Dirección</label>
                  <p className="text-medical-gray-900 mt-1">{patient.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información del Sistema</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">ID del Paciente</label>
                <p className="text-medical-gray-900 mt-1 font-mono text-sm">{patient.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Fecha de Registro</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(patient.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Última Actualización</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(patient.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
