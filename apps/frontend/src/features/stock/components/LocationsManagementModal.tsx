import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { LocationsService, StorageLocationDto } from '../services/locations.service.js';
import { MapPin, Plus } from 'lucide-react';

interface LocationsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationsManagementModal: React.FC<LocationsManagementModalProps> = ({ isOpen, onClose }) => {
  const [locations, setLocations] = useState<StorageLocationDto[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<'WAREHOUSE' | 'KITCHEN'>('WAREHOUSE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLocations = () => {
    LocationsService.fetchLocations()
      .then((res) => setLocations(res))
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await LocationsService.createLocation({ name, type, description });
      setName('');
      setDescription('');
      loadLocations();
    } catch {
      alert('Error al crear el sector de almacenamiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal maxWidth="600px" width="90%">
      <ModalHeader
        icon={<MapPin style={{ color: 'var(--color-primary)' }} />}
        title="Sectores Físicos de Almacenamiento"
        onClose={onClose}
      />
      <div className="space-y-6 text-slate-100 mt-4">
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Nuevo Sector Físico
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Sector</label>
              <input
                type="text"
                required
                placeholder="Ej. Cámara Congelados 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Sector</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'WAREHOUSE' | 'KITCHEN')}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white min-h-[44px]"
              >
                <option value="WAREHOUSE">📦 Bodega (Warehouse)</option>
                <option value="KITCHEN">🍳 Cocina (Kitchen Area)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Descripción / Ubicación</label>
            <input
              type="text"
              placeholder="Ej. Sector frío del fondo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : 'Crear Sector'}
          </button>
        </form>

        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-2">Sectores Activos</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3 bg-slate-800 border border-slate-700 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-sm block">{loc.name}</span>
                    <span className="text-xs text-slate-400">{loc.description || 'Sin descripción'}</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-bold ${
                    loc.type === 'WAREHOUSE' ? 'bg-blue-900/50 text-blue-300' : 'bg-emerald-900/50 text-emerald-300'
                  }`}
                >
                  {loc.type === 'WAREHOUSE' ? 'BODEGA' : 'COCINA'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded min-h-[44px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
