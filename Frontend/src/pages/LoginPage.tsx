import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useAuthContext } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/services/auth.service';
import type { ApiError } from '@/types/api.types';

/**
 * Login form schema
 * Validates: email format, password required (minimum 6 characters as per backlog)
 */
const loginSchema = z.object({
  email: z.string().email('El email debe tener un formato válido').min(1, 'El email es requerido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page component
 * Mobile-first login form following Design System Guide
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onError: (error: ApiError) => {
      // Handle different error types
      if (error.statusCode === 401) {
        setError('root', {
          type: 'manual',
          message: 'Email o contraseña incorrectos',
        });
      } else if (error.statusCode === 400) {
        // Backend validation error - show user-friendly message
        setError('root', {
          type: 'manual',
          message: 'Los datos ingresados no son válidos. Por favor verifica tu email y contraseña.',
        });
      } else if (error.statusCode === 0 || error.statusCode >= 500) {
        // Network or server error
        setError('root', {
          type: 'manual',
          message:
            'No pudimos conectarnos con el servidor. Verifica tu conexión e intenta de nuevo.',
        });
      } else {
        // Other errors - clean up the message
        const cleanMessage = error.message
          ? error.message.split('must be')[0].split('should not be')[0].trim()
          : 'Ocurrió un error inesperado. Por favor intenta nuevamente en unos momentos.';

        setError('root', {
          type: 'manual',
          message:
            cleanMessage ||
            'Ocurrió un error inesperado. Por favor intenta nuevamente en unos momentos.',
        });
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-2">
            Iniciar sesión
          </h1>
          <p className="text-slate-500 mb-6">Ingresa tus credenciales para acceder</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Tu contraseña"
              {...register('contraseña')}
              error={errors.contraseña?.message}
              autoComplete="current-password"
            />

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-500">{errors.root.message}</p>
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
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-violet-600 hover:text-violet-700 font-medium">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
