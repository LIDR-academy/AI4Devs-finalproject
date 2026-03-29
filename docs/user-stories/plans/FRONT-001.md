# FRONT-001: Vistas Login y Registro

**Estado:** Completo

## Resumen del Plan Implementado

Se ha completado la implementación de las vistas de autenticación, la gestión de estado y la integración con la API, cumpliendo con los requisitos de diseño (Tailwind corporativo, Responsive) y validación (VeeValidate + Zod).

### 1. Configuración e Instalación
- [x] Instalación de `vee-validate`, `@vee-validate/zod` y `zod`.
- [x] Configuración de variables de entorno en `.env` (`NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_SOCKET_URL`) para apuntar al puerto 4000.
- [x] Configuración de temas en `tailwind.config.js` mapeando variables CSS.

### 2. Gestión de Estado y Lógica (Composables/Stores)
- [x] **Store (`stores/auth.ts`)**: Gestión de estado de usuario y token con persistencia en Cookies (SSR friendly).
- [x] **Composable (`composables/useAuth.ts`)**: Lógica de negocio para Login, Registro y Logout.
- [x] **Wrapper API (`composables/useApi.ts`)**: Interceptor de `$fetch` para inyectar token JWT y manejo global de errores (401).
- [x] **Tipado (`types/auth.ts`)**: Interfaces TS para User, AuthResponse y Payloads.

### 3. Componentes UI (Design System)
- [x] **`UiInput.vue`**: Input reutilizable con integración directa a `vee-validate` y estados de error.
- [x] **`UiButton.vue`**: Botón con variantes (primary, secondary, outline, ghost) y estado `loading`.
- [x] **Layout (`layouts/auth.vue`)**: Diseño específico para auth, centrado y con logo corporativo (`trace-logo.png`).

### 4. Vistas y Routing
- [x] **Login (`pages/login.vue`)**: Formulario con validación de credenciales.
- [x] **Registro (`pages/register.vue`)**: Formulario con validación de contraseña y confirmación.
- [x] **Dashboard (`pages/dashboard/index.vue`)**: Vista protegida básica para comprobar redirección.

### 5. Seguridad (Middleware)
- [x] **`middleware/auth.ts`**: Protege rutas privadas redirigiendo a login.
- [x] **`middleware/guest.ts`**: Evita acceso a login/registro si ya existe sesión activa.
