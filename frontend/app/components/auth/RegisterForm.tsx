'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuthStore } from '@/store/authStore';

// Schema de validación con Zod
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined))
    .refine(
      (val) => {
        if (!val) return true;
        // Permitir formato internacional con + o sin él
        // Aceptar números de 10-15 dígitos, con o sin +
        const cleaned = val.replace(/\s/g, ''); // Remover espacios
        return /^\+?[1-9]\d{9,14}$/.test(cleaned) || /^\d{10,15}$/.test(cleaned);
      },
      'Formato de teléfono inválido. Use formato internacional (ej: +521234567890)'
    ),
  role: z.literal('patient'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { setToken, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'patient',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('✅ Iniciando registro con datos:', { 
        email: data.email, 
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        password: '***' 
      });
      
      // Validar que todos los campos requeridos estén presentes
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }
      
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        console.error('❌ reCAPTCHA no está disponible');
        throw new Error('reCAPTCHA no está disponible. Por favor recarga la página.');
      }

      console.log('🔄 Obteniendo token de reCAPTCHA...');
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha('register');
        console.log('✅ Token de reCAPTCHA obtenido');
      } catch (recaptchaError) {
        console.error('❌ Error al obtener token de reCAPTCHA:', recaptchaError);
        throw new Error('Error al validar reCAPTCHA. Por favor intenta nuevamente.');
      }

      // Llamar al endpoint de registro
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
        /\/api\/v1\/?$/,
        ''
      );
      const url = `${apiUrl}/api/v1/auth/register`;
      console.log('Enviando petición a:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined, // Enviar undefined si está vacío
          role: data.role,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos
        if (response.status === 409) {
          setError(t('emailExists'));
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          setError(t('rateLimitExceeded', { minutes: retryAfter || 60 }));
        } else {
          setError(result.error || t('registerError'));
        }
        return;
      }

      // Guardar tokens y usuario
      setToken(result.accessToken);
      setUser(result.user);

      // El refreshToken se guarda automáticamente en cookie httpOnly por el backend

      // Redirigir al flujo principal de paciente
      router.push(`/${locale}/search`);
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMessage = err instanceof Error ? err.message : t('registerError');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          data-testid="register-email"
          {...register('email')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('emailPlaceholder')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          data-testid="register-password"
          {...register('password')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('passwordPlaceholder')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('firstName')}
        </label>
        <input
          id="firstName"
          type="text"
          data-testid="register-firstName"
          {...register('firstName')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.firstName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('firstNamePlaceholder')}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('lastName')}
        </label>
        <input
          id="lastName"
          type="text"
          data-testid="register-lastName"
          {...register('lastName')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.lastName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('lastNamePlaceholder')}
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

      {/* Phone (Opcional) */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          {t('phone')} <span className="text-gray-500 text-xs">({t('optional')})</span>
        </label>
        <input
          id="phone"
          type="tel"
          data-testid="register-phone"
          {...register('phone')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('phonePlaceholder')}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Role (hidden, siempre patient) */}
      <input type="hidden" {...register('role')} value="patient" />

      {/* Error general */}
      {error && (
        <div
          className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md"
          data-testid="register-error"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="register-submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t('registering') : t('register')}
      </button>
    </form>
  );
}
