## Context

El frontend necesita implementar la página de registro de usuarios para completar la Historia de Usuario TS-003 del ProductBacklog. El backend ya expone el endpoint `POST /auth/login` que acepta `{ nombre, email, contraseña }` y retorna el usuario creado o errores apropiados (400, 409).

El Design System Guide establece lineamientos claros de UI/UX que deben seguirse estrictamente para mantener consistencia visual y experiencia de usuario.

## Goals / Non-Goals

### Goals
- Implementar formulario de registro funcional y accesible
- Alinear componentes con el Design System Guide (colores, tipografía, espaciado)
- Validación robusta en frontend y manejo de errores del backend
- Experiencia mobile-first optimizada
- Redirección automática a login después de registro exitoso

### Non-Goals
- Autenticación automática después del registro (el usuario debe hacer login explícitamente)
- Verificación de email (fuera del scope del MVP)
- Recuperación de contraseña (fuera del scope del MVP)
- Integración con OAuth/social login (fuera del scope del MVP)

## Decisions

### Decision: Usar react-hook-form + zod para validación
**Rationale:** 
- El Design System Guide recomienda `zod` + `react-hook-form` para validación
- Proporciona validación declarativa y type-safe
- Mejor UX con validación en tiempo real

**Alternatives considered:**
- Validación manual con useState: Más código boilerplate, menos type-safe
- Solo validación backend: Mala UX, requiere round-trip al servidor

### Decision: Validación de contraseña > 6 caracteres en frontend
**Rationale:**
- El ProductBacklog especifica "contraseña > 6 caracteres" como criterio de aceptación
- El backend tiene validación de mínimo 8 caracteres, pero el frontend debe validar > 6 para dar feedback temprano
- El backend rechazará con 400 si la contraseña es < 8, pero el frontend puede prevenir envíos inválidos

**Alternatives considered:**
- Validar mínimo 8 en frontend: No alineado con ProductBacklog, pero más consistente con backend
- **Elegido:** Validar > 6 en frontend, backend rechazará < 8 (doble validación es aceptable)

### Decision: No autenticar automáticamente después del registro
**Rationale:**
- El criterio de aceptación dice "redirigir a Login" explícitamente
- Separación clara entre registro y autenticación
- Permite al usuario verificar que el registro fue exitoso antes de iniciar sesión

**Alternatives considered:**
- Auto-login después de registro: Más conveniente pero no está en los criterios de aceptación

### Decision: Usar @tanstack/react-query para llamadas API
**Rationale:**
- El project.md especifica TanStack Query para sincronizar con NestJS
- Proporciona manejo de estado, caché, y errores de forma declarativa
- Mejor que fetch manual o useState para estado asíncrono

**Alternatives considered:**
- useState + fetch: Más código manual, sin caché, manejo de errores manual
- Axios: Más pesado, no necesario para este caso simple

### Decision: Colores según Design System Guide
**Rationale:**
- El Design System especifica violet-600 como primary, slate-50 para backgrounds
- Mantiene consistencia visual con el resto de la aplicación
- Reduce decisiones de diseño ad-hoc

**Alternatives considered:**
- Usar colores genéricos (blue, gray): No alineado con Design System

## Risks / Trade-offs

### Riesgo: Discrepancia entre validación frontend (> 6) y backend (>= 8)
**Mitigación:** 
- Documentar claramente en código y specs
- El backend rechazará con 400 si la contraseña es < 8, mostrando mensaje de error apropiado
- Considerar actualizar backend para alinearse con ProductBacklog en el futuro

### Riesgo: Componentes atómicos no alineados con Design System
**Mitigación:**
- Actualizar Input y Button como parte de esta propuesta
- Revisar con el auditor UI/UX si es necesario

### Riesgo: Falta de manejo de errores de red
**Mitigación:**
- Implementar manejo genérico de errores 500/network
- Mostrar mensaje claro al usuario

## Migration Plan

No aplica - esta es una nueva funcionalidad, no una migración.

## Open Questions

- ¿Debe el frontend validar exactamente igual que el backend (mínimo 8 caracteres) o seguir el ProductBacklog (> 6)?
  - **Decisión:** Frontend valida > 6, backend valida >= 8. El backend rechazará con 400 si es < 8.

