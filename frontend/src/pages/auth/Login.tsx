import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth.service';
import { LoginCredentials } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Debe ser un email válido').min(1, 'El email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data as LoginCredentials);
      
      // Verificar que la respuesta tenga los datos necesarios
      if (!response.accessToken) {
        throw new Error('No se recibió token de acceso');
      }
      
      if (!response.user) {
        throw new Error('No se recibió información del usuario');
      }

      login(response.accessToken, response.user, response.devMode);

      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Mejor manejo de errores
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (err.response) {
        // Error del servidor
        if (err.response.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message.join(', ');
          } else {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (err.response.status === 400) {
          errorMessage = 'Datos inválidos. Verifica el formato de tu email.';
        } else if (err.response.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }
      } else if (err.request) {
        // Error de red
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      } else if (err.message) {
        // Error del código
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-primary to-medical-secondary">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-2xl font-bold text-medical-primary text-center">
              Sistema Integral de Gestión Quirúrgica
            </h2>
            <p className="text-center text-medical-gray-600 mt-2">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-medical-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input"
                placeholder="Ingresa tu email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-medical-danger">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-medical-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="input"
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-medical-danger">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
