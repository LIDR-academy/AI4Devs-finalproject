'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
// Importación condicional de Google Maps
let useLoadScript: any;
let GoogleMap: any;
let Marker: any;

try {
  const googleMapsModule = require('@react-google-maps/api');
  useLoadScript = googleMapsModule.useLoadScript;
  GoogleMap = googleMapsModule.GoogleMap;
  Marker = googleMapsModule.Marker;
} catch (e) {
  // Si no está instalado, se manejará más adelante
  console.warn('@react-google-maps/api no está instalado');
}
import { useAuthStore } from '@/store/authStore';

// Schema de validación con Zod
const registerDoctorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  postalCode: z.string().min(1, 'El código postal es obligatorio'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined))
    .refine(
      (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\s/g, '');
        return /^\+?[1-9]\d{9,14}$/.test(cleaned) || /^\d{10,15}$/.test(cleaned);
      },
      'Formato de teléfono inválido. Use formato internacional (ej: +521234567890)'
    ),
  bio: z.string().max(1000, 'La bio no puede exceder 1000 caracteres').optional(),
  role: z.literal('doctor'),
});

type RegisterDoctorFormData = z.infer<typeof registerDoctorSchema>;

export default function RegisterDoctorForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { setToken, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const googleMapsAvailable = typeof useLoadScript !== 'undefined';

  const { isLoaded, loadError } = googleMapsAvailable
    ? useLoadScript({
        googleMapsApiKey,
      })
    : { isLoaded: false, loadError: true };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterDoctorFormData>({
    resolver: zodResolver(registerDoctorSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'doctor',
      phone: '',
      bio: '',
    },
  });

  const address = watch('address');
  const postalCode = watch('postalCode');
  const bio = watch('bio');

  // Geocodificar cuando cambien dirección o código postal
  useEffect(() => {
    if (address && postalCode && isLoaded && googleMapsApiKey) {
      const timeoutId = setTimeout(() => {
        geocodeAddress(`${address}, ${postalCode}`);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setCoordinates(null);
      setGeocodingError(null);
    }
  }, [address, postalCode, isLoaded, googleMapsApiKey]);

  const geocodeAddress = async (fullAddress: string) => {
    if (!isLoaded || !googleMapsApiKey || typeof window === 'undefined' || !(window as any).google) {
      return;
    }

    setGeocodingLoading(true);
    setGeocodingError(null);

    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const result = await geocoder.geocode({ address: fullAddress });

      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        setCoordinates({ lat: location.lat(), lng: location.lng() });
        setGeocodingError(null);
      } else {
        setGeocodingError(t('geocodingFailed'));
        setCoordinates(null);
      }
    } catch (err) {
      console.error('Error en geocodificación:', err);
      setGeocodingError(t('geocodingFailed'));
      setCoordinates(null);
    } finally {
      setGeocodingLoading(false);
    }
  };

  const onSubmit = async (data: RegisterDoctorFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('✅ Iniciando registro de médico con datos:', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        postalCode: data.postalCode,
        role: data.role,
        password: '***',
      });

      // Validar que todos los campos requeridos estén presentes
      if (!data.email || !data.password || !data.firstName || !data.lastName || !data.address || !data.postalCode) {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${apiUrl}/api/v1/auth/register`;
      console.log('Enviando petición a:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          role: data.role,
          address: data.address,
          postalCode: data.postalCode,
          bio: data.bio || undefined,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
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

      // Redirigir al panel de médico con mensaje de verificación pendiente
      router.push('/dashboard/doctor?pendingVerification=true');
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMessage = err instanceof Error ? err.message : t('registerError');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
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

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          {t('address')}
        </label>
        <input
          id="address"
          type="text"
          {...register('address')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('addressPlaceholder')}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {/* Postal Code */}
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
          {t('postalCode')}
        </label>
        <input
          id="postalCode"
          type="text"
          {...register('postalCode')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.postalCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('postalCodePlaceholder')}
        />
        {errors.postalCode && (
          <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
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

      {/* Bio (Opcional) */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          {t('bio')} <span className="text-gray-500 text-xs">({t('optional')})</span>
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('bioPlaceholder')}
          maxLength={1000}
        />
        <div className="mt-1 flex justify-between">
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {bio?.length || 0}/1000 {t('characters')}
          </p>
        </div>
      </div>

      {/* Mapa con marcador si hay coordenadas */}
      {isLoaded && coordinates && googleMapsAvailable && GoogleMap && Marker && (
        <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300">
          <GoogleMap
            zoom={15}
            center={coordinates}
            mapContainerClassName="w-full h-full"
          >
            <Marker position={coordinates} />
          </GoogleMap>
        </div>
      )}

      {/* Advertencia de geocodificación */}
      {geocodingError && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md">
          <p className="text-sm">{geocodingError}</p>
          <p className="text-xs mt-1">{t('geocodingWarning')}</p>
        </div>
      )}

      {/* Loading de geocodificación */}
      {geocodingLoading && (
        <div className="text-sm text-gray-500">
          {t('geocodingLoading')}
        </div>
      )}

      {/* Error si Google Maps no está disponible */}
      {loadError && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md text-sm">
          {t('googleMapsNotAvailable')}
        </div>
      )}

      {/* Role (hidden, siempre doctor) */}
      <input type="hidden" {...register('role')} value="doctor" />

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t('registering') : t('register')}
      </button>
    </form>
  );
}
