import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import type { AllergySeverity } from '@/services/hce.service';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  UserCircleIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const severityLabels: Record<AllergySeverity, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
};

const PatientFullHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ['medicalHistory', id],
    queryFn: () => hceService.getMedicalHistory(id!),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4" />
          <p className="text-medical-gray-500">Cargando historia clínica...</p>
        </div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="card max-w-2xl">
        <div className="text-center py-12">
          <p className="text-medical-danger mb-4">Error al cargar la historia clínica</p>
          <button type="button" onClick={() => navigate('/hce')} className="btn btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const { patient, medicalRecords, allergies, medications } = history;
  const record = medicalRecords?.[0];
  const patientName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Cabecera: solo visible en pantalla */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/hce/patients/${id}`)}
            className="text-medical-gray-600 hover:text-medical-primary"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-medical-gray-900">
              Historia clínica completa
            </h1>
            <p className="text-medical-gray-600 mt-1">{patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/hce/patients/${id}`}
            className="btn border-2 border-medical-gray-200 bg-white text-medical-gray-800"
          >
            Ver ficha del paciente
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary flex items-center gap-2"
          >
            <PrinterIcon className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Contenido unificado */}
      <div className="max-w-4xl space-y-6 print:max-w-none print:space-y-4">
        {/* 1. Datos del paciente */}
        <section className="card print:shadow-none print:border">
          <h2 className="text-lg font-bold text-medical-gray-900 flex items-center gap-2 mb-4">
            <UserCircleIcon className="w-5 h-5 text-medical-primary" />
            Datos del paciente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-medical-gray-500">Nombre completo</span>
              <p className="font-medium text-medical-gray-900">{patientName}</p>
            </div>
            <div>
              <span className="text-medical-gray-500">Fecha de nacimiento</span>
              <p className="font-medium text-medical-gray-900">
                {new Date(patient.dateOfBirth).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-medical-gray-500">Género</span>
              <p className="font-medium text-medical-gray-900">{patient.gender}</p>
            </div>
            {patient.phone && (
              <div>
                <span className="text-medical-gray-500">Teléfono</span>
                <p className="font-medium text-medical-gray-900">{patient.phone}</p>
              </div>
            )}
            {patient.address && (
              <div className="sm:col-span-2">
                <span className="text-medical-gray-500">Dirección</span>
                <p className="font-medium text-medical-gray-900">{patient.address}</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Antecedentes médicos */}
        <section className="card print:shadow-none print:border">
          <h2 className="text-lg font-bold text-medical-gray-900 flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-medical-primary" />
            Antecedentes médicos
          </h2>
          {record ? (
            <div className="space-y-4 text-sm">
              {record.medicalHistory ? (
                <div>
                  <p className="text-medical-gray-500 font-medium mb-1">Antecedentes personales</p>
                  <p className="text-medical-gray-900 whitespace-pre-wrap">{record.medicalHistory}</p>
                </div>
              ) : null}
              {record.familyHistory ? (
                <div>
                  <p className="text-medical-gray-500 font-medium mb-1">Antecedentes familiares</p>
                  <p className="text-medical-gray-900 whitespace-pre-wrap">{record.familyHistory}</p>
                </div>
              ) : null}
              {record.currentCondition ? (
                <div>
                  <p className="text-medical-gray-500 font-medium mb-1">
                    Motivo de consulta / Condición actual
                  </p>
                  <p className="text-medical-gray-900 whitespace-pre-wrap">
                    {record.currentCondition}
                  </p>
                </div>
              ) : null}
              {!record.medicalHistory && !record.familyHistory && !record.currentCondition && (
                <p className="text-medical-gray-500 italic">Sin antecedentes registrados.</p>
              )}
            </div>
          ) : (
            <p className="text-medical-gray-500 italic">Sin registro de antecedentes.</p>
          )}
        </section>

        {/* 3. Alergias */}
        <section className="card print:shadow-none print:border">
          <h2 className="text-lg font-bold text-medical-gray-900 flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            Alergias
          </h2>
          {allergies?.length ? (
            <ul className="space-y-2">
              {allergies.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-start gap-2 py-2 border-b border-medical-gray-100 last:border-0 text-sm"
                >
                  <span className="font-medium text-medical-gray-900">{a.allergen}</span>
                  <span className="text-medical-gray-600">
                    {severityLabels[a.severity as AllergySeverity] ?? a.severity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-medical-gray-500 italic text-sm">Ninguna alergia registrada.</p>
          )}
        </section>

        {/* 4. Medicación activa */}
        <section className="card print:shadow-none print:border">
          <h2 className="text-lg font-bold text-medical-gray-900 flex items-center gap-2 mb-4">
            <BeakerIcon className="w-5 h-5 text-medical-secondary" />
            Medicación actual
          </h2>
          {medications?.length ? (
            <ul className="space-y-3">
              {medications.map((m) => (
                <li key={m.id} className="py-2 border-b border-medical-gray-100 last:border-0 text-sm">
                  <p className="font-medium text-medical-gray-900">{m.name}</p>
                  <p className="text-medical-gray-600">
                    {m.dosage} · {m.frequency}
                  </p>
                  <p className="text-medical-gray-500 text-xs mt-0.5">
                    Desde {new Date(m.startDate).toLocaleDateString('es-ES')}
                    {m.endDate &&
                      ` — Hasta ${new Date(m.endDate).toLocaleDateString('es-ES')}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-medical-gray-500 italic text-sm">
              Ninguna medicación activa registrada.
            </p>
          )}
        </section>
      </div>

      <p className="text-xs text-medical-gray-400 print:mt-4">
        Documento generado desde SIGQ — Historia clínica electrónica. No tiene valor legal sin firma.
      </p>
    </div>
  );
};

export default PatientFullHistoryPage;
