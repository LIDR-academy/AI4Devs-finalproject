import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ConfirmModal } from '../../../shared/components/ConfirmModal.js';
import { RolesService, RoleDto, PermissionDto } from '../services/roles.service.js';
import { ShieldCheck, Plus, Check, Trash2 } from 'lucide-react';

import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import styles from './RolesManagementModal.module.css';

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewRoleFormProps {
  onCreated: () => Promise<void>;
  setSelectedRole: (role: RoleDto) => void;
  setError: (err: string | null) => void;
}

const NewRoleForm: React.FC<NewRoleFormProps> = ({ onCreated, setSelectedRole, setError }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const created = await RolesService.createRole({ name: newRoleName, description: newRoleDesc });
      setNewRoleName('');
      setNewRoleDesc('');
      await onCreated();
      setSelectedRole(created);
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <form onSubmit={handleCreateRole} className={`card-dashboard metrics-grid flex-gap-xs ${styles['new-role-form']}`}>
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
      <button type="submit" disabled={isCreating} className={`btn-touch btn-primary ${styles['min-w-100']}`}>
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
    <div className={`flex-column flex-gap-xs ${styles['permissions-list-scroll']}`}>
      {permissions.map((perm) => {
        const hasIt = selectedRole.permissions.some((p) => p.id === perm.id);
        return (
          <button
            type="button"
            key={perm.id}
            onClick={() => onTogglePermission(perm.id)}
            className={`flex-between w-full btn-touch ${styles['permission-chip']} ${hasIt ? styles['permission-chip--active'] : styles['permission-chip--inactive']}`}
          >
            <div>
              <span className={`text-primary-color ${styles['permission-code']} fs-xs fw-bold font-mono`}>
                {perm.code}
              </span>
              <span className="text-primary-color fs-md fw-semibold">{perm.name}</span>
            </div>
            <div className={`${styles['permission-check-indicator']} ${hasIt ? styles['permission-check-indicator--active'] : styles['permission-check-indicator--inactive']}`}>
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
  const [error, setError] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);


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
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setError(null);
    try {
      await RolesService.deleteRole(roleToDelete.id);
      await loadData();
    } catch (err) {
      const friendly = mapToUserFriendlyError(err);
      setError(friendly.message);
    } finally {
      setRoleToDelete(null);
    }
  };

  return (
    <Modal size="xl">
      <ModalHeader
        icon={<ShieldCheck className="text-primary-color" />}
        title="Gestión de Roles y Matriz de Permisos (Dynamic RBAC)"
        onClose={onClose}
      />
      <div className="flex-column flex-gap-md mt-4">
        {error && <ErrorBanner message={error} />}
        <NewRoleForm onCreated={loadData} setSelectedRole={setSelectedRole} setError={setError} />


        <div className={`metrics-grid ${styles['roles-permissions-grid']}`}>
          <div className={`flex-column flex-gap-xs ${styles['roles-list-column']}`}>
            <h4 className={`text-secondary-color ${styles['section-label']} fs-xs fw-bold mb-1`}>
              Roles Definidos
            </h4>
            {roles.map((r) => {
              const isSystemRole = r.name === 'ADMIN' || r.name === 'KITCHEN_STAFF' || r.id === 'role-admin' || r.id === 'role-kitchen';
              return (
                <div key={r.id} className="flex-gap-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`btn-touch ${selectedRole?.id === r.id ? 'btn-primary' : 'btn-secondary'} flex-1 ${styles['role-select-btn']}`}
                  >
                    <ShieldCheck size={18} />
                    <span className={styles['text-truncate']}>{r.name}</span>
                  </button>
                  {!isSystemRole && (
                    <button
                      type="button"
                      className={`btn-touch btn-danger ${styles['btn-compact-icon']}`}
                      onClick={() => setRoleToDelete({ id: r.id, name: r.name })}
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
            <h4 className={`text-secondary-color ${styles['section-label']} fs-xs fw-bold mb-1`}>
              Permisos para {selectedRole?.name || 'Seleccione un rol'}
            </h4>

            {selectedRole && (
              <PermissionsList permissions={permissions} selectedRole={selectedRole} onTogglePermission={handleTogglePermission} />
            )}
          </div>
        </div>

        <div className="modal-footer-actions justify-end no-margin-top">
          <button type="button" onClick={onClose} className="btn-touch btn-secondary w-120">
            Cerrar
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={roleToDelete !== null}
        title="Eliminar Rol"
        message={`¿Confirmas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDeleteRole}
        onCancel={() => setRoleToDelete(null)}
      />
    </Modal>
  );
};
