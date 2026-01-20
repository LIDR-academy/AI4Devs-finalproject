import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { operatingRoomService } from '@/services/operating-room.service';
import { PlusIcon, BuildingOfficeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const OperatingRoomListPage = () => {
  const [activeOnly, setActiveOnly] = useState(true);

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['operating-rooms', activeOnly],
    queryFn: () => operatingRoomService.getOperatingRooms(activeOnly),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">Quirófanos</h1>
          <p className="text-medical-gray-600 mt-2">Gestión de quirófanos y salas de cirugía</p>
        </div>
        <Link
          to="/planning/operating-rooms/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Quirófano
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-medical-gray-300 text-medical-primary focus:ring-medical-primary"
            />
            <label htmlFor="activeOnly" className="text-sm font-medium text-medical-gray-700">
              Solo activos
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando quirófanos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar quirófanos</p>
            <p className="text-sm text-medical-gray-500">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <p className="text-medical-gray-500 mb-4">
              {activeOnly ? 'No hay quirófanos activos' : 'No hay quirófanos registrados'}
            </p>
            {!activeOnly && (
              <Link
                to="/planning/operating-rooms/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Registrar Primer Quirófano
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/planning/operating-rooms/${room.id}`}
                className="block p-6 rounded-lg border border-medical-gray-200 hover:border-medical-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-medical-gray-900 mb-1">
                      {room.name}
                    </h3>
                    {room.code && (
                      <p className="text-sm text-medical-gray-500">Código: {room.code}</p>
                    )}
                  </div>
                  {room.isActive ? (
                    <CheckCircleIcon className="w-6 h-6 text-medical-success" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-medical-gray-400" />
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-medical-gray-600 mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-medical-gray-600">
                  {(room.floor || room.building) && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>
                        {room.building && room.floor
                          ? `${room.building} - ${room.floor}`
                          : room.building || room.floor}
                      </span>
                    </div>
                  )}
                  {room.capacity && (
                    <div>
                      <span className="font-medium">Capacidad:</span> {room.capacity} personas
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-medical-gray-200">
                  <span className="text-xs text-medical-primary font-medium">
                    Ver detalles →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatingRoomListPage;
