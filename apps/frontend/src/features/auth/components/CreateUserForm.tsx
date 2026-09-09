import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { UsersService } from '../services/users.service.js';
import { RolesService, RoleDto } from '../../security/services/roles.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface CreateUserFormProps {
  onCreated: (message: string) => void;
}

interface CreateUserFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  availableRoles: RoleDto[];
  pin: string;
  onPinChange: (v: string) => void;
}

interface RoleSelectFieldProps {
  role: string;
  onRoleChange: (v: string) => void;
  availableRoles: RoleDto[];
}

const RoleSelectField: React.FC<RoleSelectFieldProps> = ({ role, onRoleChange, availableRoles }) => (
  <div>
    <label htmlFor="select-new-user-role" className="form-label">
      Rol del Personal:
    </label>
    <select
      id="select-new-user-role"
      className="input-touch"
      value={role}
      onChange={(e) => onRoleChange(e.target.value)}
    >
      {availableRoles.length > 0 ? (
        availableRoles.map((r) => (
          <option key={r.id} value={r.name}>
            {r.name} {r.description ? `(${r.description})` : ''}
          </option>
        ))
      ) : (
        <>
          <option value="KITCHEN_STAFF">Personal de Cocina (KITCHEN_STAFF)</option>
          <option value="ADMIN">Administrador (ADMIN)</option>
        </>
      )}
    </select>
  </div>
);

const CreateUserFields: React.FC<CreateUserFieldsProps> = ({
  name,
  onNameChange,
  role,
  onRoleChange,
  availableRoles,
  pin,
  onPinChange,
}) => (
  <>
    <div>
      <label htmlFor="input-new-user-name" className="form-label">
        Nombre Completo:
      </label>
      <input
        type="text"
        id="input-new-user-name"
        className="input-touch"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        minLength={2}
      />
    </div>

    <RoleSelectField role={role} onRoleChange={onRoleChange} availableRoles={availableRoles} />

    <div>
      <label htmlFor="input-new-user-pin" className="form-label">
        PIN (4-6 dígitos):
      </label>
      <input
        type="password"
        id="input-new-user-pin"
        className="input-touch"
        value={pin}
        onChange={(e) => onPinChange(e.target.value)}
        pattern="\d{4,6}"
        required
        autoComplete="new-password"
      />
    </div>
  </>
);

async function submitCreateUser(
  data: { name: string; role: string; pin: string },
  onCreated: (message: string) => void,
  reset: () => void,
  setError: (msg: string | null) => void
): Promise<void> {
  try {
    const created = await UsersService.createUser(data);
    onCreated(`Operario "${created.name}" creado con estado ${created.status}.`);
    reset();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error creando el operario.');
  }
}

function useCreateUserForm(onCreated: (message: string) => void) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('KITCHEN_STAFF');
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    RolesService.fetchRoles()
      .then((roles) => {
        setAvailableRoles(roles);
        if (roles.length > 0) {
          const kitchenRole = roles.find((r) => r.name === 'KITCHEN_STAFF');
          setRole(kitchenRole ? kitchenRole.name : roles[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const reset = () => {
    setName('');
    setPin('');
    if (availableRoles.length > 0) {
      const kitchenRole = availableRoles.find((r) => r.name === 'KITCHEN_STAFF');
      setRole(kitchenRole ? kitchenRole.name : availableRoles[0].name);
    } else {
      setRole('KITCHEN_STAFF');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    await submitCreateUser({ name, role, pin }, onCreated, reset, setError);
    setIsSubmitting(false);
  };

  return { name, setName, role, setRole, availableRoles, pin, setPin, error, isSubmitting, handleSubmit };
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCreated }) => {
  const form = useCreateUserForm(onCreated);

  return (
    <form onSubmit={form.handleSubmit} className="flex-column flex-gap-md settings-form">
      {form.error && <ErrorBanner message={form.error} />}

      <CreateUserFields
        name={form.name}
        onNameChange={form.setName}
        role={form.role}
        onRoleChange={form.setRole}
        availableRoles={form.availableRoles}
        pin={form.pin}
        onPinChange={form.setPin}
      />

      <button
        type="submit"
        className="btn-touch btn-primary flex-center flex-gap-xs mt-1"
        disabled={form.isSubmitting}
        aria-busy={form.isSubmitting}
      >
        <UserPlus size={18} />
        {form.isSubmitting ? 'Creando...' : 'Crear Operario'}
      </button>
    </form>
  );
};
