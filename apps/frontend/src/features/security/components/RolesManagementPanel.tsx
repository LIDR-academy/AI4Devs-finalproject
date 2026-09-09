import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Plus, Check, Trash2 } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { ConfirmModal } from '../../../shared/components/ConfirmModal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { RolesService, RoleDto, PermissionDto } from '../services/roles.service.js';
import styles from './RolesManagementPanel.module.css';

const SYSTEM_ROLE_IDS = new Set(['role-admin', 'role-kitchen']);
const isSystemRole = (r: RoleDto) => r.name === 'ADMIN' || r.name === 'KITCHEN_STAFF' || SYSTEM_ROLE_IDS.has(r.id);

interface NewRoleFormProps {
  onCreated: () => Promise<void>;
  setSelectedRole: (role: RoleDto) => void;
  setError: (err: string | null) => void;
}

const NewRoleForm: React.FC<NewRoleFormProps> = ({ onCreated, setSelectedRole, setError }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const created = await RolesService.createRole({ name, description: desc });
      setName('');
      setDesc('');
      await onCreated();
      setSelectedRole(created);
    } catch (err) {
      setError(mapToUserFriendlyError(err).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreateRole} className={`card-dashboard metrics-grid flex-gap-xs ${styles['new-role-form']}`}>
      <div>
        <label htmlFor="new-role-name" className="form-label">Nombre Nuevo Rol</label>
        <input id="new-role-name" type="text" required placeholder="Ej. ENCARGADO_BODEGA" value={name} onChange={(e) => setName(e.target.value)} className="input-touch w-full" />
      </div>
      <div>
        <label htmlFor="new-role-desc" className="form-label">Descripción</label>
        <input id="new-role-desc" type="text" placeholder="Descripción opcional" value={desc} onChange={(e) => setDesc(e.target.value)} className="input-touch w-full" />
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

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions, selectedRole, onTogglePermission }) => (
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
            <span className={`text-primary-color ${styles['permission-code']} fs-xs fw-bold font-mono`}>{perm.code}</span>
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

interface RolesListColumnProps {
  roles: RoleDto[];
  selectedRoleId: string | undefined;
  onSelect: (role: RoleDto) => void;
  onRequestDelete: (role: { id: string; name: string }) => void;
}

const RolesListColumn: React.FC<RolesListColumnProps> = ({ roles, selectedRoleId, onSelect, onRequestDelete }) => (
  <div className={`flex-column flex-gap-xs ${styles['roles-list-column']}`}>
    <h4 className={`text-secondary-color ${styles['section-label']} fs-xs fw-bold mb-1`}>Roles Definidos</h4>
    {roles.map((r) => (
      <div key={r.id} className="flex-gap-xs">
        <button
          type="button"
          onClick={() => onSelect(r)}
          className={`btn-touch ${selectedRoleId === r.id ? 'btn-primary' : 'btn-secondary'} flex-1 ${styles['role-select-btn']}`}
        >
          <ShieldCheck size={18} />
          <span className={styles['text-truncate']}>{r.name}</span>
        </button>
        {!isSystemRole(r) && (
          <button
            type="button"
            className={`btn-touch btn-danger ${styles['btn-compact-icon']}`}
            onClick={() => onRequestDelete({ id: r.id, name: r.name })}
            title="Eliminar Rol"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    ))}
  </div>
);

function useRolesManagement() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [rList, pList] = await Promise.all([RolesService.fetchRoles(), RolesService.fetchPermissions()]);
      setRoles(rList);
      setPermissions(pList);
      setSelectedRole((prev) => (prev && rList.some((r) => r.id === prev.id) ? prev : rList[0] ?? null));
    } catch {
      // Handled silently — la UI muestra la lista vacía
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePermission = useCallback(
    async (permId: string) => {
      if (!selectedRole) return;
      const current = selectedRole.permissions.map((p) => p.id);
      const next = current.includes(permId) ? current.filter((id) => id !== permId) : [...current, permId];
      try {
        await RolesService.updateRolePermissions(selectedRole.id, next);
        await loadData();
      } catch (err) {
        setError(mapToUserFriendlyError(err).message);
      }
    },
    [selectedRole, loadData],
  );

  const deleteRole = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await RolesService.deleteRole(id);
        await loadData();
      } catch (err) {
        setError(mapToUserFriendlyError(err).message);
      }
    },
    [loadData],
  );

  return { roles, permissions, selectedRole, setSelectedRole, error, setError, loadData, togglePermission, deleteRole };
}

/**
 * Sección Roles de `/ajustes/roles` (US-024) — inline. ADMIN-only vía
 * `<ProtectedRoute>` sobre el layout de Ajustes.
 */
export const RolesManagementPanel: React.FC = () => {
  const rm = useRolesManagement();
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <PanelHeader icon={<ShieldCheck className="text-primary-color" />} title="Gestión de Roles y Matriz de Permisos (Dynamic RBAC)" />
      <div className="flex-column flex-gap-md mt-4">
        {rm.error && <ErrorBanner message={rm.error} />}
        <NewRoleForm onCreated={rm.loadData} setSelectedRole={rm.setSelectedRole} setError={rm.setError} />

        <div className={`metrics-grid ${styles['roles-permissions-grid']}`}>
          <RolesListColumn
            roles={rm.roles}
            selectedRoleId={rm.selectedRole?.id}
            onSelect={rm.setSelectedRole}
            onRequestDelete={setRoleToDelete}
          />
          <div className="flex-column flex-gap-xs">
            <h4 className={`text-secondary-color ${styles['section-label']} fs-xs fw-bold mb-1`}>
              Permisos para {rm.selectedRole?.name || 'Seleccione un rol'}
            </h4>
            {rm.selectedRole && (
              <PermissionsList permissions={rm.permissions} selectedRole={rm.selectedRole} onTogglePermission={rm.togglePermission} />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={roleToDelete !== null}
        title="Eliminar Rol"
        message={`¿Confirmas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (roleToDelete) await rm.deleteRole(roleToDelete.id);
          setRoleToDelete(null);
        }}
        onCancel={() => setRoleToDelete(null)}
      />
    </>
  );
};
