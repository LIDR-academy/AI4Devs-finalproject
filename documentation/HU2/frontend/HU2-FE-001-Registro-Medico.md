# HU2-FE-001: Formulario de Registro de Médico

## Información General
- **ID**: HU2-FE-001
- **Historia de Usuario**: HU2 - Registro de Médico
- **Tipo**: Frontend
- **Prioridad**: Alta
- **Estimación**: 10 horas (1.5 story points)
- **Dependencias**: HU2-BE-001 (Endpoint de registro médico), HU2-DB-001 (Migración tabla DOCTORS)

## Descripción
Implementar el formulario de registro de médico con validación en tiempo real, integración con Google Maps Geocoding API para geolocalización, reCAPTCHA v3, y manejo de errores. El formulario debe permitir a un médico nuevo crear una cuenta proporcionando información personal y profesional.

## Criterios de Aceptación

### CA1: Formulario de Registro Médico
- [ ] Campos obligatorios: email, contraseña, nombre, apellido, dirección, código postal, rol="doctor"
- [ ] Campos opcionales: teléfono, bio (máximo 1000 caracteres)
- [ ] Validación en tiempo real para todos los campos
- [ ] Mensajes de error claros para cada campo inválido

### CA2: Geocodificación de Dirección
- [ ] Al ingresar dirección y código postal, llamar a Google Maps Geocoding API
- [ ] Obtener coordenadas (latitude, longitude) automáticamente
- [ ] Si falla geocodificación, mostrar advertencia pero permitir registro
- [ ] Mostrar mapa con marcador de la ubicación (opcional)

### CA3: Protección Anti-bot
- [ ] Integración con reCAPTCHA v3 antes de enviar
- [ ] Enviar token de reCAPTCHA al backend

### CA4: Validación de Email Único
- [ ] Mostrar error 409 si email ya existe

### CA5: Rate Limiting
- [ ] Mostrar error 429 con mensaje de tiempo de espera si se excede límite

### CA6: Respuesta Exitosa
- [ ] Al completar registro:
  - Guardar accessToken y refreshToken
  - Mostrar mensaje indicando cuenta pendiente de verificación
  - Redirigir al panel de médico con instrucciones

### CA7: Internacionalización
- [ ] Todos los mensajes en español e inglés

## Pasos Técnicos Detallados

### 1. Crear Componente de Registro Médico
**Ubicación**: `frontend/src/components/auth/RegisterDoctorForm.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const registerDoctorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  postalCode: z.string().min(1, 'El código postal es obligatorio'),
  phone: z.string().optional(),
  bio: z.string().max(1000, 'La bio no puede exceder 1000 caracteres').optional(),
  role: z.literal('doctor'),
});

type RegisterDoctorFormData = z.infer<typeof registerDoctorSchema>;

export default function RegisterDoctorForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterDoctorFormData>({
    resolver: zodResolver(registerDoctorSchema),
    defaultValues: {
      role: 'doctor',
    },
  });

  const address = watch('address');
  const postalCode = watch('postalCode');

  // Geocodificar cuando cambien dirección o código postal
  useEffect(() => {
    if (address && postalCode && isLoaded) {
      geocodeAddress(`${address}, ${postalCode}`);
    }
  }, [address, postalCode, isLoaded]);

  const geocodeAddress = async (fullAddress: string) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: fullAddress });
      
      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        setCoordinates({ lat: location.lat(), lng: location.lng() });
        setGeocodingError(null);
      } else {
        setGeocodingError(t('auth.geocodingFailed'));
        setCoordinates(null);
      }
    } catch (err) {
      setGeocodingError(t('auth.geocodingFailed'));
      setCoordinates(null);
    }
  };

  const onSubmit = async (data: RegisterDoctorFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('register');

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('auth.emailExists'));
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          setError(t('auth.rateLimitExceeded', { minutes: retryAfter }));
        } else {
          setError(result.error || t('auth.registerError'));
        }
        return;
      }

      localStorage.setItem('accessToken', result.accessToken);
      router.push('/dashboard/doctor?pendingVerification=true');
    } catch (err) {
      setError(t('auth.registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campos del formulario similares a RegisterForm */}
      {/* Agregar campos: address, postalCode, bio */}
      
      {/* Mapa con marcador si hay coordenadas */}
      {isLoaded && coordinates && (
        <div className="h-64 w-full">
          <GoogleMap
            zoom={15}
            center={coordinates}
            mapContainerClassName="w-full h-full"
          >
            <Marker position={coordinates} />
          </GoogleMap>
        </div>
      )}

      {geocodingError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {geocodingError}
        </div>
      )}

      {/* Resto del formulario */}
    </form>
  );
}
```

## Archivos a Crear/Modificar

1. `frontend/src/components/auth/RegisterDoctorForm.tsx` - Componente principal
2. `frontend/src/app/register/doctor/page.tsx` - Página de registro médico
3. `frontend/src/messages/es.json` - Traducciones adicionales
4. `frontend/src/messages/en.json` - Traducciones adicionales

## Dependencias Adicionales

```json
{
  "dependencies": {
    "@react-google-maps/api": "^2.19.0"
  }
}
```

## Testing

Ver ticket HU2-TEST-001 para detalles de testing.
