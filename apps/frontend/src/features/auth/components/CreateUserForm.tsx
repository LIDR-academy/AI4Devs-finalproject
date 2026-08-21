import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { UsersService } from '../services/users.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface CreateUserFormProps {
  onCreated: (message: string) => void;
}

interface CreateUserFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  role: 'KITCHEN_STAFF' | 'ADMIN';
  onRoleChange: (v: 'KITCHEN_STAFF' | 'ADMIN') => void;
  pin: string;
  onPinChange: (v: string) => void;
}

const CreateUserFields: React.FC<CreateUserFieldsProps> = ({ name, onNameChange, role, onRoleChange, pin, onPinChange }) => (
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

    <div>
      <label htmlFor="select-new-user-role" className="form-label">
        Rol:
      </label>
      <select
        id="select-new-user-role"
        className="input-touch"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as 'KITCHEN_STAFF' | 'ADMIN')}
      >
        <option value="KITCHEN_STAFF">Personal de Cocina (KITCHEN_STAFF)</option>
        <option value="ADMIN">Administrador (ADMIN)</option>
      </select>
    </div>

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
  data: { name: string; role: 'KITCHEN_STAFF' | 'ADMIN'; pin: string },
  onCreated: (message: string) => void,
  reset: () => void,
  setError: (msg: string | null) => void
): Promise<void> {
  try {
    const created = await UsersService.createUser(data);
    onCreated(`Operario "${created.name}" creado con estado ${created.status}.`);
    reset();
  } catch (err) {
    // No se cae en un fallback de éxito silencioso — un alta de operario fallida
    // debe verse como error real, nunca como si la cuenta se hubiera creado.
    setError(err instanceof Error ? err.message : 'Error creando el operario.');
  }
}

function useCreateUserForm(onCreated: (message: string) => void) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'KITCHEN_STAFF' | 'ADMIN'>('KITCHEN_STAFF');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setPin('');
    setRole('KITCHEN_STAFF');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    await submitCreateUser({ name, role, pin }, onCreated, reset, setError);
    setIsSubmitting(false);
  };

  return { name, setName, role, setRole, pin, setPin, error, isSubmitting, handleSubmit };
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCreated }) => {
  const form = useCreateUserForm(onCreated);

  return (
    <form onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {form.error && <ErrorBanner message={form.error} />}

      <CreateUserFields
        name={form.name}
        onNameChange={form.setName}
        role={form.role}
        onRoleChange={form.setRole}
        pin={form.pin}
        onPinChange={form.setPin}
      />

      <button
        type="submit"
        className="btn-touch btn-primary"
        disabled={form.isSubmitting}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}
      >
        <UserPlus size={18} />
        {form.isSubmitting ? 'Creando...' : 'Crear Operario'}
      </button>
    </form>
  );
};
