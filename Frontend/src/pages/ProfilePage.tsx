import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import { updateUser } from '@/services/user.service';
import { updateProfileSchema, type UpdateProfileFormData } from '@/schemas/profile.schema';
import type { ApiError } from '@/types/api.types';

/**
 * Returns initials from a name (e.g. "Juan Pérez" -> "JP")
 */
function getInitials(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Profile page component
 * Displays user identity card and form to edit nombre, email, and optional password.
 * Follows Design System: bg-slate-50, cards rounded-2xl shadow-lg, inputs h-12.
 */
export const ProfilePage = () => {
  const { user, setUser } = useAuthContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombre: user?.nombre ?? '',
      email: user?.email ?? '',
      contraseña: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre,
        email: user.email,
        contraseña: '',
      });
    }
  }, [user?.id, user?.nombre, user?.email, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => {
      if (!user?.id) throw new Error('Usuario no identificado');
      return updateUser(user.id, {
        nombre: data.nombre,
        email: data.email,
        ...(data.contraseña && data.contraseña.length >= 8 && { contraseña: data.contraseña }),
      });
    },
    onSuccess: response => {
      setUser({
        id: response.id,
        nombre: response.nombre,
        email: response.email,
      });
      reset({
        nombre: response.nombre,
        email: response.email,
        contraseña: '',
      });
      setError('root', { type: 'manual', message: '' });
    },
    onError: (error: ApiError) => {
      if (error.statusCode === 403) {
        setError('root', {
          type: 'manual',
          message: 'No tienes permiso para actualizar este perfil.',
        });
      } else if (error.statusCode === 409) {
        setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado.',
        });
      } else if (error.statusCode === 400) {
        setError('root', {
          type: 'manual',
          message:
            error.message ||
            'Los datos ingresados no son válidos. Por favor revisa e intenta de nuevo.',
        });
      } else if (error.statusCode === 0 || error.statusCode >= 500) {
        setError('root', {
          type: 'manual',
          message:
            'No pudimos conectarnos con el servidor. Verifica tu conexión e intenta de nuevo.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Ocurrió un error al guardar. Intenta de nuevo.',
        });
      }
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    mutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  const initials = user.nombre ? getInitials(user.nombre) : '?';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="Perfil" showBackButton={false} />

      <main className="flex-1 max-w-md mx-auto w-full px-6 py-8">
        <div className="space-y-6">
          {/* Identity card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-heading font-semibold text-xl"
                aria-hidden
              >
                {initials}
              </div>
              <div className="text-center">
                <p className="text-lg font-heading font-semibold text-slate-900">{user.nombre}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Edit profile form card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-heading font-semibold text-slate-900 mb-6">
              Editar perfil
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="nombre"
                label="Nombre"
                type="text"
                placeholder="Juan Pérez"
                {...register('nombre')}
                error={errors.nombre?.message}
                autoComplete="name"
              />

              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="juan@example.com"
                {...register('email')}
                error={errors.email?.message}
                autoComplete="email"
              />

              <Input
                id="contraseña"
                label="Nueva contraseña (opcional)"
                type="password"
                placeholder="Dejar en blanco para no cambiar"
                {...register('contraseña')}
                error={errors.contraseña?.message}
                autoComplete="new-password"
              />

              {errors.root?.message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-500" role="alert">
                    {errors.root.message}
                  </p>
                </div>
              )}

              {mutation.isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-700">Datos actualizados correctamente.</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
