import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { LocationsService, StorageLocationDto } from '../services/locations.service.js';
import { MapPin, Plus, Trash2, Power } from 'lucide-react';

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

  const handleToggleActive = async (loc: StorageLocationDto) => {
    try {
      await LocationsService.updateLocation(loc.id, { isActive: !loc.isActive });
      loadLocations();
    } catch {
      alert('Error al cambiar estado del sector');
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!window.confirm(`¿Confirmas eliminar el sector "${name}"?`)) return;
    try {
      await LocationsService.deleteLocation(id);
      loadLocations();
    } catch {
      alert('Error al eliminar el sector');
    }
  };

  return (
    <Modal maxWidth="640px" width="92%">
      <ModalHeader
        icon={<MapPin style={{ color: 'var(--color-primary)' }} />}
        title="Sectores Físicos de Almacenamiento"
        onClose={onClose}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-root)',
            border: '1px solid var(--border-card)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Registrar Nuevo Sector Físico
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Nombre Sector</label>
              <input
                type="text"
                required
                placeholder="Ej. Cámara Congelados 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-touch"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label">Tipo de Sector</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'WAREHOUSE' | 'KITCHEN')}
                className="input-touch"
                style={{ width: '100%' }}
              >
                <option value="WAREHOUSE">📦 Bodega (Warehouse)</option>
                <option value="KITCHEN">🍳 Cocina (Kitchen Area)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción / Ubicación</label>
            <input
              type="text"
              placeholder="Ej. Sector frío del fondo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-touch"
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-touch btn-primary"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <Plus size={20} />
            {isSubmitting ? 'Guardando...' : 'Crear Sector'}
          </button>
        </form>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Sectores Registrados ({locations.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
            {locations.map((loc) => (
              <div
                key={loc.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-root)',
                  border: `1px solid ${loc.isActive ? 'var(--border-card)' : 'var(--color-danger)'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: loc.isActive ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} style={{ color: loc.isActive ? 'var(--color-primary)' : 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                      {loc.name} {!loc.isActive && '(Inactivo)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {loc.description || 'Sin descripción'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      backgroundColor: loc.type === 'WAREHOUSE' ? 'rgba(0, 102, 255, 0.15)' : 'rgba(47, 191, 110, 0.15)',
                      color: loc.type === 'WAREHOUSE' ? '#4da6ff' : 'var(--color-success)',
                      border: `1px solid ${loc.type === 'WAREHOUSE' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(47, 191, 110, 0.3)'}`,
                    }}
                  >
                    {loc.type === 'WAREHOUSE' ? 'BODEGA' : 'COCINA'}
                  </span>

                  <button
                    type="button"
                    className={`btn-touch ${loc.isActive ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggleActive(loc)}
                    style={{ padding: '6px 8px' }}
                    title={loc.isActive ? 'Desactivar Sector' : 'Activar Sector'}
                  >
                    <Power size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn-touch btn-danger"
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    style={{ padding: '6px 8px' }}
                    title="Eliminar Sector"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-card)' }}>
          <button type="button" onClick={onClose} className="btn-touch btn-secondary" style={{ width: '120px' }}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
