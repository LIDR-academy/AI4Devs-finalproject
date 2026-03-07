# Change: Implementar Frontend de Registro de Usuario

## Why

El ProductBacklog especifica la Historia de Usuario TS-003 "Registro de Usuario" como crítica para el MVP. El backend ya tiene implementado el endpoint `POST /auth/login` para registro, pero falta la interfaz de usuario que permita a los nuevos usuarios registrarse en el sistema. Esta funcionalidad es un requisito previo para la regla de negocio "Strict User Policy" que requiere que todos los usuarios estén registrados antes de ser invitados a viajes.

## What Changes

- Crear página de registro (`RegisterPage`) siguiendo el Design System Guide aprobado
- Implementar formulario de registro con validación (react-hook-form + zod)
- Crear servicio de API para comunicación con el backend
- Actualizar componentes atómicos (Input, Button) para alinearlos con el Design System Guide
- Agregar ruta `/register` al router
- Implementar manejo de errores y feedback visual según el Design System
- Redirigir a Login después de registro exitoso

## Impact

- **Affected specs:** Nueva capacidad `user-registration` (frontend)
- **Affected code:**
  - `Frontend/src/pages/RegisterPage.tsx` (nuevo)
  - `Frontend/src/components/atoms/Input.tsx` (modificar para alinearse con Design System)
  - `Frontend/src/components/atoms/Button.tsx` (modificar para alinearse con Design System)
  - `Frontend/src/routes/index.tsx` (agregar ruta)
  - `Frontend/src/services/auth.service.ts` (nuevo)
  - `Frontend/package.json` (agregar dependencias: react-hook-form, zod, @tanstack/react-query)
  - `Frontend/tailwind.config.ts` (configurar paleta de colores del Design System si no está)

