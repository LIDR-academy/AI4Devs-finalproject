import { ApiError } from '@/shared/lib/apiError';

const MESSAGE_MAP: Record<string, string> = {
  'This email is already registered': 'Este correo ya está registrado',
  'You cannot deactivate your own account':
    'No puedes desactivar tu propia cuenta',
  'At least one active administrator is required':
    'Debe haber al menos un administrador activo',
  'User is already inactive': 'El usuario ya está inactivo',
  'User is inactive': 'El usuario está inactivo',
  'At least one field is required': 'Debes modificar al menos un campo',
  'Not Found': 'Usuario no encontrado',
};

export function mapUsersError(error: unknown): string {
  if (error instanceof ApiError) {
    const message = Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;

    if (MESSAGE_MAP[message]) {
      return MESSAGE_MAP[message];
    }

    if (error.statusCode === 400 || error.statusCode === 409) {
      return message;
    }
  }

  return 'Error de conexión. Intenta de nuevo.';
}
