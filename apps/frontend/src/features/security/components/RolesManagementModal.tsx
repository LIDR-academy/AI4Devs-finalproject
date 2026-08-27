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
    <Modal maxWidth="700px" width="90%">
      <ModalHeader
        icon={<ShieldCheck style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Roles y Matriz de Permisos (Dynamic RBAC)"
        onClose={onClose}
      />
      <div className="space-y-6 text-slate-100 mt-4">
        {/* Formulario Alta Rol */}
        <form onSubmit={handleCreateRole} className="p-3 bg-slate-900 border border-slate-800 rounded flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">Nombre Nuevo Rol</label>
            <input
              type="text"
              required
              placeholder="Ej. ENCARGADO_BODEGA"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white min-h-[44px]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Descripción opcional"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded flex items-center gap-1 min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Crear
          </button>
        </form>

        {/* Matriz de Roles y Permisos */}
        <div className="grid grid-cols-3 gap-4">
          {/* Columna Selección de Rol */}
          <div className="col-span-1 border-r border-slate-800 pr-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roles Definidos</h4>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`w-full text-left p-3 rounded font-medium text-sm flex items-center justify-between transition-colors min-h-[44px] ${
                  selectedRole?.id === r.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{r.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Columna Permisos del Rol Seleccionado */}
          <div className="col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Permisos para {selectedRole?.name || 'Seleccione un rol'}
            </h4>

            {selectedRole && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {permissions.map((perm) => {
                  const hasIt = selectedRole.permissions.some((p) => p.id === perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className={`p-3 border rounded flex items-center justify-between cursor-pointer transition-colors min-h-[48px] ${
                        hasIt ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-mono font-bold block text-slate-300">{perm.code}</span>
                        <span className="text-sm font-semibold">{perm.name}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center border ${
                          hasIt ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                        }`}
                      >
                        {hasIt && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
