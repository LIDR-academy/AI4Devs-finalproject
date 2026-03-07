import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { registerUser, type RegisterRequest } from '@/services/auth.service';
import type { ApiError } from '@/types/api.types';

/**
 * Registration form schema
 * Validates: name required, email format, password >= 8 characters (aligned with backend)
 */
const registerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('El email debe tener un formato válido').min(1, 'El email es requerido'),
  contraseña: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register page component
 * Mobile-first registration form following Design System Guide
 */
export const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerUser(data),
    onSuccess: () => {
      // Redirect to login after successful registration
      navigate('/login');
    },
    onError: (error: ApiError) => {
      // Handle different error types
      if (error.statusCode === 409) {
        setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado',
        });
      } else if (error.statusCode === 400) {
        // Backend validation error
        setError('root', {
          type: 'manual',
          message:
            error.message ||
            'Los datos ingresados no son válidos. Por favor revisa la información e intenta nuevamente.',
        });
      } else if (error.statusCode === 0 || error.statusCode >= 500) {
        // Network or server error
        setError('root', {
          type: 'manual',
          message:
            'No pudimos conectarnos con el servidor. Verifica tu conexión e intenta de nuevo.',
        });
      } else {
        // Other errors
        setError('root', {
          type: 'manual',
          message: 'Ocurrió un error inesperado. Por favor intenta nuevamente en unos momentos.',
        });
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-2">
            Crear cuenta
          </h1>
          <p className="text-slate-500 mb-6">Regístrate para empezar a dividir gastos</p>

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
              label="Contraseña"
              type="password"
              placeholder="Al menos 8 caracteres"
              {...register('contraseña')}
              error={errors.contraseña?.message}
              autoComplete="new-password"
            />

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full relative"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Registrarse'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
