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
    <div className="min-h-screen flex items-center justify-center bg-medical-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">⚕️</span>
            </div>
            <h2 className="text-2xl font-semibold text-medical-primary mb-2">
              SIGQ
            </h2>
            <p className="text-medical-gray-500">
              Sistema Integral de Gestión Quirúrgica
            </p>
            <p className="text-sm text-medical-gray-400 mt-2">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-medical-danger text-medical-danger px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-medical-gray-800 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 border-2 border-medical-gray-200 rounded-lg focus:outline-none focus:border-medical-secondary transition-colors"
                      placeholder="cirujano@hospital.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-medical-danger">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-medical-gray-800 mb-2">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="w-full px-4 py-3 border-2 border-medical-gray-200 rounded-lg focus:outline-none focus:border-medical-secondary transition-colors"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-medical-danger">{errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-medical-primary to-medical-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                  
                  <div className="text-center mt-4">
                    <div className="inline-flex items-center gap-2 bg-medical-accent/20 text-medical-primary px-4 py-2 rounded-full text-xs font-semibold">
                      🔒 Autenticación MFA Requerida
                    </div>
                  </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
