## 1. Setup y Dependencias

- [x] 1.1 Instalar dependencias: `react-hook-form`, `zod`, `@tanstack/react-query`
- [x] 1.2 Verificar/actualizar configuración de Tailwind con paleta del Design System (violet-600, slate-50, emerald-500, red-500)
- [x] 1.3 Configurar fuentes Google Fonts (Plus Jakarta Sans para headings, Inter para body) si no están

## 2. Servicios y API

- [x] 2.1 Crear `Frontend/src/services/auth.service.ts` con función `registerUser()`
- [x] 2.2 Configurar cliente HTTP base (fetch o axios) con manejo de errores
- [x] 2.3 Definir tipos TypeScript para request/response de registro

## 3. Componentes Atómicos (Alineación con Design System)

- [x] 3.1 Actualizar `Input.tsx`:
  - Altura mínima 48px (touch target)
  - Font size 16px (evitar zoom en iOS)
  - Colores según Design System (violet para focus)
  - Soporte para errores visuales
- [x] 3.2 Actualizar `Button.tsx`:
  - Variante primary con color violet-600
  - Tamaños según Design System
  - Estados hover/focus/disabled

## 4. Página de Registro

- [x] 4.1 Crear `RegisterPage.tsx` con estructura mobile-first
- [x] 4.2 Implementar formulario con react-hook-form:
  - Campo nombre (text)
  - Campo email (email)
  - Campo contraseña (password)
- [x] 4.3 Implementar validación con zod:
  - Email válido y único (validación backend)
  - Contraseña > 6 caracteres (alineado con ProductBacklog, aunque backend tiene 8)
  - Nombre requerido
- [x] 4.4 Implementar manejo de errores:
  - Mostrar errores de validación en tiempo real
  - Manejar error 409 (email duplicado) con mensaje claro
  - Manejar errores de red/500 con mensaje genérico
- [x] 4.5 Implementar estados de carga (loading durante submit)
- [x] 4.6 Redirigir a `/login` después de registro exitoso

## 5. Navegación

- [x] 5.1 Agregar ruta `/register` al router
- [x] 5.2 Agregar link "¿No tienes cuenta? Regístrate" en LoginPage (opcional pero recomendado)

## 6. Testing y Validación

- [x] 6.1 Probar flujo completo: registro exitoso → redirección
- [x] 6.2 Probar validaciones: email inválido, contraseña corta, campos vacíos
- [x] 6.3 Probar error de email duplicado (409)
- [x] 6.4 Verificar diseño responsive (mobile-first, 360px-430px)
- [x] 6.5 Verificar accesibilidad básica (labels, focus states)

## 7. Correcciones Post-Auditoría UI/UX

### 7.1 Correcciones de Estilo Visual

- [x] 7.1.1 Agregar `font-heading` al `tailwind.config.ts` o verificar que funcione con CSS global
- [x] 7.1.2 Revisar y documentar uso de magic numbers en Button (considerar tokens si es necesario)
  - Nota: Los magic numbers en Button (min-h-[36px], min-h-[44px], min-h-[52px]) están justificados para mantener tamaños específicos según Design System

### 7.2 Correcciones de Arquitectura UX

- [x] 7.2.1 Agregar estado `focus-visible` explícito en Input component:
  - Agregado `focus-visible:ring-2 focus-visible:ring-violet-600` para mejor accesibilidad con teclado
- [x] 7.2.2 Cambiar `<a href="/login">` por `<Link to="/login">` en RegisterPage (línea 131-136)
- [x] 7.2.3 Mejorar feedback visual durante carga:
  - Agregado spinner animado durante `mutation.isPending`
  - Botón deshabilitado con mejor feedback visual

### 7.3 Correcciones de UX Writing y Psicología

- [x] 7.3.1 Mejorar mensajes de error genéricos:
  - Cambiado "Error al registrar usuario. Por favor intenta nuevamente." por mensajes más específicos y accionables
  - Mensaje de red: "No pudimos conectarnos con el servidor. Verifica tu conexión e intenta de nuevo."
  - Mensaje genérico: "Ocurrió un error inesperado. Por favor intenta nuevamente en unos momentos."
  - Mensaje de validación: "Los datos ingresados no son válidos. Por favor revisa la información e intenta nuevamente."
- [x] 7.3.2 Ajustar placeholder de contraseña:
  - Cambiado "Mínimo 7 caracteres" a "Al menos 8 caracteres" para alinearse con validación backend
  - Actualizado schema de validación de zod de min(7) a min(8)
- [x] 7.3.3 Revisar todos los mensajes de error para asegurar lenguaje amigable y accionable
  - Todos los mensajes de error han sido revisados y mejorados con lenguaje más claro y accionable

