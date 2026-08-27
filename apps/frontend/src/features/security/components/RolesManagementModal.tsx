import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { RolesService, RoleDto, PermissionDto } from '../services/roles.service.js';
import { ShieldCheck, Plus, Check } from 'lucide-react';

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesManagementModal: React.FC<RolesManagementModalProps> = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      const [rList, pList] = await Promise.all([RolesService.fetchRoles(), RolesService.fetchPermissions()]);
      setRoles(rList);
      setPermissions(pList);
      if (rList.length > 0 && !selectedRole) {
        setSelectedRole(rList[0]);
      }
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreating(true);
    try {
      const created = await RolesService.createRole({ name: newRoleName, description: newRoleDesc });
      setNewRoleName('');
      setNewRoleDesc('');
      await loadData();
      setSelectedRole(created);
    } catch {
      alert('Error al crear el rol');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePermission = async (permId: string) => {
    if (!selectedRole) return;
    const currentPermIds = selectedRole.permissions.map((p) => p.id);
    const updatedPermIds = currentPermIds.includes(permId)
      ? currentPermIds.filter((id) => id !== permId)
      : [...currentPermIds, permId];

    try {
      await RolesService.updateRolePermissions(selectedRole.id, updatedPermIds);
      await loadData();
      const updated = roles.find((r) => r.id === selectedRole.id);
      if (updated) setSelectedRole(updated);
    } catch {
      alert('Error al actualizar permisos');
    }
  };

  return (
    <Modal maxWidth="720px" width="90%">
      <ModalHeader
        icon={<ShieldCheck style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Roles y Matriz de Permisos (Dynamic RBAC)"
        onClose={onClose}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
        {/* Formulario Alta Rol */}
        <form
          onSubmit={handleCreateRole}
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-root)',
            border: '1px solid var(--border-card)',
            borderRadius: '6px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <div>
            <label className="form-label">Nombre Nuevo Rol</label>
            <input
              type="text"
              required
              placeholder="Ej. ENCARGADO_BODEGA"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="input-touch"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <input
              type="text"
              placeholder="Descripción opcional"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="input-touch"
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={isCreating} className="btn-touch btn-primary" style={{ minWidth: '100px' }}>
            <Plus size={20} /> Crear
          </button>
        </form>

        {/* Matriz de Roles y Permisos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
          {/* Columna Selección de Rol */}
          <div style={{ borderRight: '1px solid var(--border-card)', paddingRight: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Roles Definidos
            </h4>
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`btn-touch ${selectedRole?.id === r.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <ShieldCheck size={18} />
                <span>{r.name}</span>
              </button>
            ))}
          </div>

          {/* Columna Permisos del Rol Seleccionado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Permisos para {selectedRole?.name || 'Seleccione un rol'}
            </h4>

            {selectedRole && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                {permissions.map((perm) => {
                  const hasIt = selectedRole.permissions.some((p) => p.id === perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: `1px solid ${hasIt ? 'var(--color-primary)' : 'var(--border-card)'}`,
                        backgroundColor: hasIt ? 'rgba(255, 106, 0, 0.1)' : 'var(--bg-root)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, display: 'block', color: 'var(--color-primary)' }}>
                          {perm.code}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{perm.name}</span>
                      </div>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: hasIt ? 'var(--color-primary)' : 'transparent',
                          border: `1px solid ${hasIt ? 'var(--color-primary)' : 'var(--border-card)'}`,
                          color: 'var(--color-primary-on)',
                        }}
                      >
                        {hasIt && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
