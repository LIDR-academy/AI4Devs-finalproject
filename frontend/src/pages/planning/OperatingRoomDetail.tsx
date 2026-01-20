import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { operatingRoomService } from '@/services/operating-room.service';
import { ArrowLeftIcon, PencilIcon, CheckCircleIcon, XCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const OperatingRoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['operating-room', id],
    queryFn: () => operatingRoomService.getOperatingRoomById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
          <p className="text-medical-gray-500">Cargando quirófano...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar el quirófano</p>
            <Link to="/planning/operating-rooms" className="btn btn-primary">
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
            onClick={() => navigate('/planning/operating-rooms')}
            className="text-medical-gray-600 hover:text-medical-primary"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-medical-gray-900">{room.name}</h1>
            <p className="text-medical-gray-600 mt-2">Detalles del quirófano</p>
          </div>
        </div>
        <Link
          to={`/planning/operating-rooms/${room.id}/edit`}
          className="btn btn-primary flex items-center gap-2"
        >
          <PencilIcon className="w-5 h-5" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Nombre</label>
                <p className="text-medical-gray-900 mt-1 font-medium">{room.name}</p>
              </div>
              {room.code && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Código</label>
                  <p className="text-medical-gray-900 mt-1">{room.code}</p>
                </div>
              )}
              {room.building && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Edificio</label>
                  <p className="text-medical-gray-900 mt-1">{room.building}</p>
                </div>
              )}
              {room.floor && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Piso</label>
                  <p className="text-medical-gray-900 mt-1">{room.floor}</p>
                </div>
              )}
              {room.capacity && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Capacidad</label>
                  <p className="text-medical-gray-900 mt-1">{room.capacity} personas</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Estado</label>
                <div className="mt-1">
                  {room.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-medical-success/10 text-medical-success">
                      <CheckCircleIcon className="w-4 h-4" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-medical-gray-100 text-medical-gray-800">
                      <XCircleIcon className="w-4 h-4" />
                      Inactivo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {room.description && (
            <div className="card">
              <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Descripción</h2>
              <p className="text-medical-gray-700 whitespace-pre-wrap">{room.description}</p>
            </div>
          )}

          {room.equipment && Object.keys(room.equipment).length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Equipamiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.equipment.anesthesiaMachine !== undefined && (
                  <div className="flex items-center gap-2">
                    {room.equipment.anesthesiaMachine ? (
                      <CheckCircleIcon className="w-5 h-5 text-medical-success" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-medical-gray-400" />
                    )}
                    <span className="text-medical-gray-700">Máquina de anestesia</span>
                  </div>
                )}
                {room.equipment.ventilator !== undefined && (
                  <div className="flex items-center gap-2">
                    {room.equipment.ventilator ? (
                      <CheckCircleIcon className="w-5 h-5 text-medical-success" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-medical-gray-400" />
                    )}
                    <span className="text-medical-gray-700">Ventilador</span>
                  </div>
                )}
                {room.equipment.monitoringSystem !== undefined && (
                  <div className="flex items-center gap-2">
                    {room.equipment.monitoringSystem ? (
                      <CheckCircleIcon className="w-5 h-5 text-medical-success" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-medical-gray-400" />
                    )}
                    <span className="text-medical-gray-700">Sistema de monitoreo</span>
                  </div>
                )}
                {room.equipment.surgicalLights !== undefined && (
                  <div>
                    <span className="text-medical-gray-700">Luces quirúrgicas: </span>
                    <span className="font-medium text-medical-gray-900">
                      {room.equipment.surgicalLights}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información del Sistema</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">ID del Quirófano</label>
                <p className="text-medical-gray-900 mt-1 font-mono text-sm">{room.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Fecha de Creación</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(room.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Última Actualización</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(room.updatedAt).toLocaleDateString('es-ES', {
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

export default OperatingRoomDetailPage;
