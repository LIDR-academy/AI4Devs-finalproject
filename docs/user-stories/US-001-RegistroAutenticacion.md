# US-001: Registro e Inicio de Sesión de Arquitecto

**Como** Arquitecto  
**Quiero** registrarme e iniciar sesión en la plataforma  
**Para** poder acceder a mi espacio de trabajo y gestionar mis proyectos.

## Detalles
- **Titulo breve:** Registro y Autenticación
- **Prioridad:** Alta (P1)
- **Estimación:** 3 Puntos
- **Dependencias:** Ninguna
- **Orden de ejecución:** 1
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Página de Registro (Sign Up)
- **Elementos:**
  - Logo de la aplicación (TRACÉ).
  - Formulario: Email, Contraseña, Confirmar Contraseña, Nombre Completo.
  - Botón principal "Crear Cuenta".
  - Enlace "Ya tengo cuenta" para ir al Login.
- **Estilo:** Minimalista, fondo limpio, foco en el formulario.

### 2. Página de Inicio de Sesión (Login)
- **Elementos:**
  - Formulario: Email, Contraseña.
  - Botón "Iniciar Sesión".
  - Enlace "¿Olvidaste tu contraseña?".
  - Botones de SSO (Google/Apple) [Opcional para MVP].

## Criterios de Aceptación (Gherkin)

### Escenario 1: Registro de nuevo usuario exitoso
**Dado** que el usuario está en la página de registro
**Cuando** introduce un email válido "arq@test.com", una contraseña segura y confirma
**Y** hace clic en "Registrarse"
**Entonces** el sistema crea la cuenta
**Y** redirige al usuario al Dashboard principal

### Escenario 2: Inicio de sesión exitoso
**Dado** obligatoriamente un usuario registrado con email "arq@test.com"
**Cuando** ingresa su email y contraseña correctos en el login
**Entonces** el sistema le otorga acceso al Dashboard

### Escenario 3: Inicio de sesión fallido
**Dado** que el usuario está en la página de login
**Cuando** ingresa credenciales incorrectas
**Entonces** el sistema muestra un mensaje de error "Usuario o contraseña incorrectos"
**Y** mantiene al usuario en la página de login

## Tickets de Trabajo

### [DB-001] Esquema Base de Datos: Usuarios
- **Tipo:** Database
- **Propósito:** Crear la estructura de datos para gestionar usuarios y seguridad.
- **Especificaciones Técnicas:**
  - Definir modelo `User` en `schema.prisma`.
  - Campos: `id` (UUID), `email` (Unique), `password_hash`, `full_name`, `role` (ADMIN/CLIENT), `subscription_tier`, `created_at`, `updated_at`.
  - Generar migración inicial.
- **Criterios de Aceptación:**
  - La tabla `User` se crea correctamente en PostgreSQL.
  - El campo email tiene restricción de unicidad.
- **Equipo Asignado:** Backend/DBA
- **Esfuerzo:** 2 pts

### [BACK-001] API Endpoints: Autenticación
- **Tipo:** Backend Feature
- **Propósito:** Implementar la lógica de registro, login y generación de tokens JWT.
- **Especificaciones Técnicas:**
  - `POST /auth/register`: Recibe email, password, name. Valida, hashea password (bcyrpt/argon2), guarda en DB.
  - `POST /auth/login`: Recibe email, password. Devuelve JWT (access_token).
  - Middleware `auth`: Validar JWT en cabecera Authorization.
- **Criterios de Aceptación:**
  - Registro devuelve 201 Created.
  - Login devuelve 200 OK + Token.
  - Error 401 para credenciales inválidas.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 3 pts

### [FRONT-001] Vistas: Login y Registro
- **Tipo:** Frontend Feature
- **Propósito:** Crear las páginas de acceso con validación de formularios y conexión a API.
- **Especificaciones Técnicas:**
  - Setup inicial de Pinia store `useAuthStore`.
  - Página `/login` y `/register`.
  - Validación de campos (VeeValidate o custom).
  - Redirección a `/dashboard` tras éxito.
- **Criterios de Aceptación:**
  - El usuario puede completar el flujo de registro.
  - El token se guarda en LocalStorage/Cookie.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 5 pts

