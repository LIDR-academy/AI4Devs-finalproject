# HU1-FE-001: Formulario de Registro de Paciente

## Información General
- **ID**: HU1-FE-001
- **Historia de Usuario**: HU1 - Registro de Paciente
- **Tipo**: Frontend
- **Prioridad**: Alta
- **Estimación**: 8 horas (1 story point)
- **Dependencias**: HU1-BE-001 (Endpoint de registro), HU1-DB-001 (Migración de tabla USERS)

## Descripción
Implementar el formulario de registro de paciente con validación en tiempo real, integración con reCAPTCHA v3, y manejo de errores. El formulario debe permitir a un paciente nuevo crear una cuenta proporcionando información básica.

## Criterios de Aceptación

### CA1: Formulario de Registro
- [ ] El formulario debe incluir los siguientes campos obligatorios:
  - Email (validación de formato)
  - Contraseña (mínimo 8 caracteres)
  - Nombre (firstName)
  - Apellido (lastName)
  - Rol: "patient" (pre-seleccionado, no editable)
- [ ] El formulario debe incluir campo opcional:
  - Teléfono (formato internacional)
- [ ] Todos los campos deben tener validación en tiempo real
- [ ] El formulario debe mostrar mensajes de error claros para cada campo inválido

### CA2: Protección Anti-bot
- [ ] El formulario debe incluir reCAPTCHA v3 antes de enviar
- [ ] El score de reCAPTCHA debe enviarse al backend junto con los datos del formulario
- [ ] Si el score es rechazado, se debe mostrar mensaje apropiado

### CA3: Validación de Email Único
- [ ] Si el email existe, debe mostrar error 409: "Email ya está registrado"
- [ ] El mensaje debe mostrarse claramente en el frontend

### CA4: Rate Limiting
- [ ] Si se excede el límite, debe mostrar error 429 con mensaje indicando cuánto tiempo debe esperar el usuario

### CA5: Respuesta Exitosa
- [ ] Al completar el registro exitosamente:
  - Se almacena el accessToken en localStorage o estado global
  - Se almacena el refreshToken en cookie httpOnly (manejado por backend)
  - Se muestra mensaje de éxito
  - El usuario debe ser redirigido automáticamente al dashboard de paciente

### CA6: Internacionalización
- [ ] Todos los mensajes del formulario y errores deben estar disponibles en español e inglés
- [ ] El idioma debe detectarse automáticamente según preferencias del navegador
- [ ] El usuario debe poder cambiar el idioma manualmente

## Pasos Técnicos Detallados

### 1. Crear Componente de Registro
**Ubicación**: `frontend/src/components/auth/RegisterForm.tsx`

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Schema de validación con Zod
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().optional().refine(
    (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
    'Formato de teléfono inválido'
  ),
  role: z.literal('patient'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'patient',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Obtener token de reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA no está disponible');
      }

      const recaptchaToken = await executeRecaptcha('register');

      // Llamar al endpoint de registro
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos
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

      // Guardar tokens
      localStorage.setItem('accessToken', result.accessToken);
      
      // El refreshToken se guarda automáticamente en cookie httpOnly por el backend

      // Redirigir al dashboard
      router.push('/dashboard/patient');
    } catch (err) {
      setError(t('auth.registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campos del formulario */}
      <div>
        <label htmlFor="email">{t('auth.email')}</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Repetir para password, firstName, lastName, phone */}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? t('auth.registering') : t('auth.register')}
      </button>
    </form>
  );
}
```

### 2. Configurar reCAPTCHA v3
**Ubicación**: `frontend/src/app/layout.tsx` o componente raíz

```typescript
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RootLayout({ children }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      language="es"
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
```

### 3. Crear Hook de Autenticación
**Ubicación**: `frontend/src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Validar token y obtener información del usuario
      fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout };
}
```

### 4. Configurar Internacionalización
**Ubicación**: `frontend/src/messages/es.json` y `frontend/src/messages/en.json`

```json
{
  "auth": {
    "email": "Correo electrónico",
    "password": "Contraseña",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "phone": "Teléfono (opcional)",
    "register": "Registrarse",
    "registering": "Registrando...",
    "emailExists": "Este email ya está registrado",
    "rateLimitExceeded": "Has excedido el límite de intentos. Intenta nuevamente en {minutes} minutos",
    "registerError": "Error al registrar. Por favor intenta nuevamente"
  }
}
```

### 5. Crear Página de Registro
**Ubicación**: `frontend/src/app/register/page.tsx`

```typescript
import RegisterForm from '@/components/auth/RegisterForm';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">{t('registerTitle')}</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
```

### 6. Manejo de Errores de Validación
- Implementar validación en tiempo real usando `react-hook-form` con `mode: 'onChange'`
- Mostrar mensajes de error específicos para cada campo
- Validar formato de email con regex
- Validar formato de teléfono internacional (E.164)

### 7. Integración con Estado Global (Zustand)
**Ubicación**: `frontend/src/store/authStore.ts`

```typescript
import create from 'zustand';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },
}));
```

## Archivos a Crear/Modificar

1. `frontend/src/components/auth/RegisterForm.tsx` - Componente principal del formulario
2. `frontend/src/hooks/useAuth.ts` - Hook de autenticación
3. `frontend/src/store/authStore.ts` - Store de Zustand para autenticación
4. `frontend/src/app/register/page.tsx` - Página de registro
5. `frontend/src/messages/es.json` - Traducciones en español
6. `frontend/src/messages/en.json` - Traducciones en inglés
7. `frontend/src/app/layout.tsx` - Configurar GoogleReCaptchaProvider
8. `frontend/.env.local` - Variables de entorno (NEXT_PUBLIC_RECAPTCHA_SITE_KEY)

## Dependencias de Paquetes

```json
{
  "dependencies": {
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "next-intl": "^3.0.0",
    "react-google-recaptcha-v3": "^1.10.0",
    "zustand": "^4.5.0"
  }
}
```

## Testing

Ver ticket HU1-TEST-001 para detalles de testing.

## Notas Adicionales

- El refreshToken se maneja automáticamente mediante cookies httpOnly configuradas en el backend
- El accessToken debe incluirse en todas las peticiones autenticadas: `Authorization: Bearer <token>`
- Implementar interceptor de axios/fetch para refrescar token automáticamente cuando expire
- Considerar usar React Query para manejo de estado del servidor y cache

## Referencias

- [Documentación de react-hook-form](https://react-hook-form.com/)
- [Documentación de Zod](https://zod.dev/)
- [Documentación de next-intl](https://next-intl-docs.vercel.app/)
- [Documentación de reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
