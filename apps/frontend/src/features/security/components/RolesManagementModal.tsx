import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { RolesService, RoleDto, PermissionDto } from '../services/roles.service.js';
import { ShieldCheck, Plus, Check, Trash2 } from 'lucide-react';

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewRoleFormProps {
  onCreated: () => Promise<void>;
  setSelectedRole: (role: RoleDto) => void;
}

const NewRoleForm: React.FC<NewRoleFormProps> = ({ onCreated, setSelectedRole }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreating(true);
    try {
      const created = await RolesService.createRole({ name: newRoleName, description: newRoleDesc });
      setNewRoleName('');
      setNewRoleDesc('');
      await onCreated();
      setSelectedRole(created);
    } catch {
      alert('Error al crear el rol');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateRole}
      className="card-dashboard metrics-grid flex-gap-xs"
      style={{
        padding: '12px',
        gridTemplateColumns: '1fr 1fr auto',
        alignItems: 'end',
      }}
    >
      <div>
        <label htmlFor="new-role-name" className="form-label">
          Nombre Nuevo Rol
        </label>
        <input
          id="new-role-name"
          type="text"
          required
          placeholder="Ej. ENCARGADO_BODEGA"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          className="input-touch w-full"
        />
      </div>
      <div>
        <label htmlFor="new-role-desc" className="form-label">
          Descripción
        </label>
        <input
          id="new-role-desc"
          type="text"
          placeholder="Descripción opcional"
          value={newRoleDesc}
          onChange={(e) => setNewRoleDesc(e.target.value)}
          className="input-touch w-full"
        />
      </div>
      <button type="submit" disabled={isCreating} className="btn-touch btn-primary" style={{ minWidth: '100px' }}>
        <Plus size={20} /> Crear
      </button>
    </form>
  );
};

interface PermissionsListProps {
  permissions: PermissionDto[];
  selectedRole: RoleDto;
  onTogglePermission: (permId: string) => void;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions, selectedRole, onTogglePermission }) => {
  return (
    <div className="flex-column flex-gap-xs" style={{ maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
      {permissions.map((perm) => {
        const hasIt = selectedRole.permissions.some((p) => p.id === perm.id);
        return (
          <button
            type="button"
            key={perm.id}
            onClick={() => onTogglePermission(perm.id)}
            className="flex-between w-full btn-touch"
            style={{
              padding: '12px',
              borderRadius: '4px',
              border: `1px solid ${hasIt ? 'var(--color-primary)' : 'var(--border-card)'}`,
              backgroundColor: hasIt ? 'rgba(255, 106, 0, 0.1)' : 'var(--bg-root)',
              textAlign: 'left',
            }}
          >
            <div>
              <span className="text-primary-color" style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, display: 'block' }}>
                {perm.code}
              </span>
              <span className="text-primary-color" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{perm.name}</span>
            </div>
            <div
              className="flex-center"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: hasIt ? 'var(--color-primary)' : 'transparent',
                border: `1px solid ${hasIt ? 'var(--color-primary)' : 'var(--border-card)'}`,
                color: 'var(--color-primary-on)',
              }}
            >
              {hasIt && <Check size={16} strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const RolesManagementModal: React.FC<RolesManagementModalProps> = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [rList, pList] = await Promise.all([RolesService.fetchRoles(), RolesService.fetchPermissions()]);
      setRoles(rList);
      setPermissions(pList);
      if (rList.length > 0 && (!selectedRole || !rList.some((r) => r.id === selectedRole.id))) {
        setSelectedRole(rList[0]);
      }
    } catch {
      // Handled silently
    }
  }, [selectedRole]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

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

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`¿Confirmas eliminar el rol "${roleName}"?`)) return;
    try {
      await RolesService.deleteRole(roleId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el rol');
    }
  };

  return (
    <Modal maxWidth="760px" width="92%">
      <ModalHeader
        icon={<ShieldCheck style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Roles y Matriz de Permisos (Dynamic RBAC)"
        onClose={onClose}
      />
      <div className="flex-column flex-gap-md" style={{ marginTop: '16px' }}>
        <NewRoleForm onCreated={loadData} setSelectedRole={setSelectedRole} />

        <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
          <div className="flex-column flex-gap-xs" style={{ borderRight: '1px solid var(--border-card)', paddingRight: '12px' }}>
            <h4 className="text-secondary-color" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Roles Definidos
            </h4>
            {roles.map((r) => {
              const isSystemRole = r.name === 'ADMIN' || r.name === 'KITCHEN_STAFF' || r.id === 'role-admin' || r.id === 'role-kitchen';
              return (
                <div key={r.id} className="flex-gap-xs" style={{ alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`btn-touch ${selectedRole?.id === r.id ? 'btn-primary' : 'btn-secondary'} flex-1`}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', overflow: 'hidden' }}
                  >
                    <ShieldCheck size={18} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.name}</span>
                  </button>
                  {!isSystemRole && (
                    <button
                      type="button"
                      className="btn-touch btn-danger"
                      onClick={() => handleDeleteRole(r.id, r.name)}
                      style={{ padding: '6px 10px' }}
                      title="Eliminar Rol"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex-column flex-gap-xs">
            <h4 className="text-secondary-color" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Permisos para {selectedRole?.name || 'Seleccione un rol'}
            </h4>

            {selectedRole && (
              <PermissionsList permissions={permissions} selectedRole={selectedRole} onTogglePermission={handleTogglePermission} />
            )}
          </div>
        </div>

        <div className="modal-footer-actions" style={{ justifyContent: 'flex-end', marginTop: 0 }}>
          <button type="button" onClick={onClose} className="btn-touch btn-secondary" style={{ width: '120px' }}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
