import React, { useState, useEffect, useCallback } from 'react';

import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ConfirmModal } from '../../../shared/components/ConfirmModal.js';
import { LocationsService, StorageLocationDto } from '../services/locations.service.js';
import { MapPin, Plus, Trash2, Power } from 'lucide-react';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';

interface LocationsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewLocationFormProps {
  onCreated: () => void;
  setError: (msg: string | null) => void;
}

const NewLocationForm: React.FC<NewLocationFormProps> = ({ onCreated, setError }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'WAREHOUSE' | 'KITCHEN'>('KITCHEN');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await LocationsService.createLocation({ name, type, description });
      setName('');
      setDescription('');
      onCreated();
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-dashboard flex-column flex-gap-xs mb-2 p-4">
      <h4 className="flex-gap-xs text-primary-color fs-md fw-bold m-0">
        <Plus size={18} /> Registrar Nuevo Sector Físico
      </h4>

      <div className="metrics-grid location-form-grid">
        <div>
          <label htmlFor="location-name" className="form-label">
            Nombre Sector
          </label>
          <input
            id="location-name"
            type="text"
            required
            placeholder="Ej. Cámara Congelados 2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-touch w-full"
          />
        </div>
        <div>
          <label htmlFor="location-type" className="form-label">
            Tipo de Sector
          </label>
          <select
            id="location-type"
            value={type}
            onChange={(e) => setType(e.target.value as 'WAREHOUSE' | 'KITCHEN')}
            className="input-touch w-full"
          >
            <option value="WAREHOUSE">Bodega (Warehouse)</option>
            <option value="KITCHEN">Cocina (Kitchen Area)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location-desc" className="form-label">
          Descripción / Ubicación
        </label>
        <input
          id="location-desc"
          type="text"
          placeholder="Ej. Sector frío del fondo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-touch w-full"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-touch btn-primary w-full mt-1">
        <Plus size={20} />
        {isSubmitting ? 'Guardando...' : 'Crear Sector'}
      </button>
    </form>
  );
};

interface LocationsListProps {
  locations: StorageLocationDto[];
  onToggleActive: (loc: StorageLocationDto) => void;
  onDeleteLocation: (id: string, name: string) => void;
}

const LocationsList: React.FC<LocationsListProps> = ({ locations, onToggleActive, onDeleteLocation }) => {
  return (
    <div>
      <h4 className="text-secondary-color fs-md fw-bold mb-3">
        Sectores Registrados ({locations.length})
      </h4>
      <div className="flex-column flex-gap-xs locations-list-scroll">
        {locations.map((loc) => (
          <div key={loc.id} className={`flex-between ${loc.isActive ? 'location-row' : 'location-row--inactive'}`}>
            <div className="flex-gap-xs">
              <MapPin size={18} className={loc.isActive ? 'text-primary-color' : 'text-secondary-color'} />
              <div>
                <span className="text-primary-color fw-bold fs-md d-block">
                  {loc.name} {!loc.isActive && '(Inactivo)'}
                </span>
                <span className="text-secondary-color fs-sm">
                  {loc.description || 'Sin descripción'}
                </span>
              </div>
            </div>

            <div className="flex-gap-xs">
              <span className={`location-badge ${loc.type === 'WAREHOUSE' ? 'location-badge--warehouse' : 'location-badge--kitchen'}`}>
                {loc.type === 'WAREHOUSE' ? 'BODEGA' : 'COCINA'}
              </span>

              <button
                type="button"
                className={`btn-touch btn-compact-icon-sm ${loc.isActive ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onToggleActive(loc)}
                title={loc.isActive ? 'Desactivar Sector' : 'Activar Sector'}
              >
                <Power size={16} />
              </button>

              <button
                type="button"
                className="btn-touch btn-danger btn-compact-icon-sm"
                onClick={() => onDeleteLocation(loc.id, loc.name)}
                title="Eliminar Sector"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LocationsManagementModal: React.FC<LocationsManagementModalProps> = ({ isOpen, onClose }) => {
  const [locations, setLocations] = useState<StorageLocationDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      const data = await LocationsService.fetchLocations();
      setLocations(data);
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    }
  }, []);


  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen, loadLocations]);

  if (!isOpen) return null;

  const handleToggleActive = async (loc: StorageLocationDto) => {
    setError(null);
    try {
      await LocationsService.updateLocation(loc.id, { isActive: !loc.isActive });
      loadLocations();
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    }
  };

  const handleConfirmDeleteLocation = async () => {
    if (!locationToDelete) return;
    setError(null);
    try {
      await LocationsService.deleteLocation(locationToDelete.id);
      loadLocations();
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    } finally {
      setLocationToDelete(null);
    }
  };

  return (
    <Modal size="lg">
      <ModalHeader
        icon={<MapPin className="text-primary-color" />}
        title="Sectores Físicos de Almacenamiento"
        onClose={onClose}
      />
      <div className="flex-column flex-gap-md mt-4">
        {error && <ErrorBanner message={error} />}
        <NewLocationForm onCreated={loadLocations} setError={setError} />

        <LocationsList
          locations={locations}
          onToggleActive={handleToggleActive}
          onDeleteLocation={(id, name) => setLocationToDelete({ id, name })}
        />

        <div className="modal-footer-actions justify-end no-margin-top">
          <button type="button" onClick={onClose} className="btn-touch btn-secondary w-120">
            Cerrar
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={locationToDelete !== null}
        title="Eliminar Sector"
        message={`¿Confirmas eliminar el sector "${locationToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDeleteLocation}
        onCancel={() => setLocationToDelete(null)}
      />
    </Modal>
  );
};
