import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { Link } from 'react-router-dom';
import { UserGroupIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PatientListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patientsData, isLoading, error } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: () => {
      const params: any = {};
      if (searchTerm) {
        // Si el término de búsqueda parece un UUID, buscar por ID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm)) {
          params.id = searchTerm;
        } else {
          // Buscar por nombre o apellido
          const parts = searchTerm.split(' ');
          if (parts.length > 1) {
            params.firstName = parts[0];
            params.lastName = parts.slice(1).join(' ');
          } else {
            params.firstName = searchTerm;
          }
        }
      }
      return hceService.getPatients(params);
    },
  });

  const patients = patientsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">Pacientes</h1>
          <p className="text-medical-gray-600 mt-2">Gestión de Historia Clínica Electrónica</p>
        </div>
        <Link
          to="/hce/patients/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Paciente
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando pacientes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar pacientes</p>
            <p className="text-sm text-medical-gray-500">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <p className="text-medical-gray-500 mb-4">
              {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </p>
            {!searchTerm && (
              <Link
                to="/hce/patients/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Registrar Primer Paciente
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-medical-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Fecha de Nacimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Género</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-medical-gray-900">Teléfono</th>
                  <th className="text-right py-3 px-4 font-semibold text-medical-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-medical-gray-100 hover:bg-medical-light transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/hce/patients/${patient.id}`}
                        className="font-medium text-medical-primary hover:text-medical-secondary"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-medical-gray-700">
                      {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-medical-gray-700">{patient.gender}</td>
                    <td className="py-3 px-4 text-medical-gray-700">{patient.email || '-'}</td>
                    <td className="py-3 px-4 text-medical-gray-700">{patient.phone || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/hce/patients/${patient.id}`}
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

export default PatientListPage;
