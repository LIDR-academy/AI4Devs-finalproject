import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import type { AllergySeverity } from '@/services/hce.service';
import { ArrowLeftIcon, PencilIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, ExclamationTriangleIcon, BeakerIcon } from '@heroicons/react/24/outline';

const severityLabels: Record<AllergySeverity, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
};

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
        <div className="flex items-center gap-2">
          <Link
            to={`/hce/patients/${patient.id}/full-history`}
            className="btn border-2 border-medical-primary text-medical-primary bg-white hover:bg-medical-primary hover:text-white flex items-center gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Historia clínica completa
          </Link>
          <Link
            to={`/hce/patients/${patient.id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Editar
          </Link>
        </div>
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

          {/* Antecedentes médicos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-medical-primary" />
                Antecedentes médicos
              </h2>
              <Link
                to={`/hce/patients/${patient.id}/medical-history/edit`}
                className="text-sm font-medium text-medical-primary hover:underline"
              >
                Editar antecedentes
              </Link>
            </div>
            {patient.medicalRecords?.[0] ? (
              <div className="space-y-4 text-medical-gray-700">
                {patient.medicalRecords[0].medicalHistory ? (
                  <div>
                    <p className="text-sm font-medium text-medical-gray-500">Personales</p>
                    <p className="whitespace-pre-wrap mt-1">{patient.medicalRecords[0].medicalHistory}</p>
                  </div>
                ) : null}
                {patient.medicalRecords[0].familyHistory ? (
                  <div>
                    <p className="text-sm font-medium text-medical-gray-500">Familiares</p>
                    <p className="whitespace-pre-wrap mt-1">{patient.medicalRecords[0].familyHistory}</p>
                  </div>
                ) : null}
                {patient.medicalRecords[0].currentCondition ? (
                  <div>
                    <p className="text-sm font-medium text-medical-gray-500">Motivo de consulta / Condición actual</p>
                    <p className="whitespace-pre-wrap mt-1">{patient.medicalRecords[0].currentCondition}</p>
                  </div>
                ) : null}
                {!patient.medicalRecords[0].medicalHistory && !patient.medicalRecords[0].familyHistory && !patient.medicalRecords[0].currentCondition && (
                  <p className="text-medical-gray-500 italic">Sin antecedentes registrados.</p>
                )}
              </div>
            ) : (
              <p className="text-medical-gray-500 italic">Sin registro médico. <Link to={`/hce/patients/${patient.id}/medical-history/edit`} className="text-medical-primary hover:underline">Completar antecedentes</Link></p>
            )}
          </div>

          {/* Alergias */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                Alergias
              </h2>
              <Link
                to={`/hce/patients/${patient.id}/allergies`}
                className="text-sm font-medium text-medical-primary hover:underline"
              >
                Gestionar alergias
              </Link>
            </div>
            {patient.allergies?.length ? (
              <ul className="space-y-2">
                {patient.allergies.map((a) => (
                  <li key={a.id} className="flex justify-between items-start gap-2 py-2 border-b border-medical-gray-100 last:border-0">
                    <span className="font-medium">{a.allergen}</span>
                    <span className="text-sm text-medical-gray-600">{severityLabels[a.severity as AllergySeverity] ?? a.severity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-medical-gray-500 italic">Ninguna alergia registrada.</p>
            )}
          </div>

          {/* Medicación */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
                <BeakerIcon className="w-6 h-6 text-medical-secondary" />
                Medicación
              </h2>
              <Link
                to={`/hce/patients/${patient.id}/medications`}
                className="text-sm font-medium text-medical-primary hover:underline"
              >
                Gestionar medicación
              </Link>
            </div>
            {patient.medications?.length ? (
              <ul className="space-y-2">
                {patient.medications.slice(0, 5).map((m) => (
                  <li key={m.id} className="py-2 border-b border-medical-gray-100 last:border-0">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-medical-gray-600"> — {m.dosage}, {m.frequency}</span>
                  </li>
                ))}
                {patient.medications.length > 5 && (
                  <Link to={`/hce/patients/${patient.id}/medications`} className="text-sm text-medical-primary hover:underline">
                    Ver todas ({patient.medications.length})
                  </Link>
                )}
              </ul>
            ) : (
              <p className="text-medical-gray-500 italic">Ninguna medicación registrada.</p>
            )}
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
