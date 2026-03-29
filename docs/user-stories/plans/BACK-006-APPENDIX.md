# BACK-006 APPENDIX: Consideraciones de Seguridad y Criterios de Aceptación

## 5. Consideraciones de Seguridad

### 5.1. Tokens de Invitación
*   **Generación:** Usar UUID v4 para garantizar unicidad y dificultar adivinación
*   **Almacenamiento:** Token almacenado en texto plano en DB (es una credencial de un solo uso/revocable)
*   **Revocación:** Cambiar status a EXPIRED invalida el token inmediatamente
*   **No Expiración Automática:** Los tokens no expiran por tiempo, solo manualmente

### 5.2. JWT de Guest
*   **Payload Específico:**
    ```json
    {
      "sub": "guest-<projectId>",
      "role": "GUEST",
      "projectId": "<project-id>",
      "permissions": ["READ_PROJECT", "READ_PLANS", "READ_LAYERS"],
      "iat": <timestamp>,
      "exp": <timestamp + 24h>
    }
    ```
*   **Expiración JWT:** 24 horas (aunque el token de invitación no expire, el JWT sí)
*   **Validación Estricta:** El middleware debe validar que `user.projectId` coincida con el recurso solicitado

### 5.3. Control de Acceso
*   **Lectura Permitida:** GET a `/projects/:id`, `/projects/:id/plans`, `/plans/:id/layers`
*   **Escritura Prohibida:** POST, PUT, DELETE retornan 403 para role GUEST
*   **Scope Limitado:** Un guest solo puede acceder a su proyecto asignado

### 5.4. Rate Limiting (Futuro)
*   Considerar limitar intentos de login con token inválido
*   Prevenir fuerza bruta en endpoint `/auth/guest/login`

## 6. Criterios de Aceptación (Verificación)

Basados en la User Story US-005:

### ✅ Escenario 1: Generar enlace (Adaptado a Invitaciones)
- **Dado:** Un proyecto creado por el Arquitecto (Owner)
- **Cuando:** Hace clic en "Compartir" (frontend llama a `POST /projects/:id/invitations`)
- **Entonces:** 
  - Sistema genera una invitación con token único
  - Retorna 201 con estructura: `{ id, token, email, projectId, status: 'PENDING' }`
  - El token puede construirse como URL: `https://trace.app/guest?token=<uuid>`

### ✅ Escenario 2: Acceso de invitado
- **Dado:** Un usuario no registrado (Cliente) con el token de invitación
- **Cuando:** Navega a la URL y el frontend llama `POST /auth/guest/login { token }`
- **Entonces:**
  - Sistema valida el token
  - Retorna 200 con `{ accessToken: <JWT>, project: { id, title } }`
  - El JWT permite acceso de solo lectura al proyecto
  - Frontend almacena JWT y redirige al visor del proyecto

### ✅ Permisos Limitados
- **Dado:** Un guest autenticado con JWT
- **Cuando:** Intenta realizar acciones:
  - GET `/projects/:id` → 200 OK ✅
  - GET `/projects/:id/plans` → 200 OK ✅
  - POST `/projects/:id/plans` → 403 Forbidden ✅
  - DELETE `/projects/:id` → 403 Forbidden ✅
  - Acceder a otro proyecto → 403 Forbidden ✅

### ✅ Revocación
- **Dado:** Una invitación activa (PENDING o ACCEPTED)
- **Cuando:** El Owner llama `DELETE /projects/:id/invitations/:token`
- **Entonces:**
  - Sistema actualiza status a EXPIRED
  - Nuevos intentos de login con ese token retornan 401
  - JWTs ya emitidos siguen válidos hasta su expiración (24h)

## 7. Dependencias y Pre-requisitos

### Dependencias de User Stories:
- ✅ US-002 (Gestión de Proyectos) - Debe estar implementado
- ✅ US-003 (Carga de Planos) - Debe estar implementado
- ✅ Autenticación JWT básica funcionando

### Librerías Requeridas (ya instaladas):
- `jsonwebtoken` - Generación y validación de JWT
- `uuid` - Generación de tokens únicos
- `@prisma/client` - ORM
- `jest` + `supertest` - Testing

## 8. Checklist de Implementación

### Fase 1: Preparación (Tests)
- [ ] Crear `invitation.factory.ts`
- [ ] Escribir tests de integración en `invitations.spec.ts`
- [ ] Escribir tests unitarios de use cases
- [ ] Verificar que todos fallen (RED)

### Fase 2: Dominio
- [ ] Actualizar `invitation.entity.ts` con métodos de dominio
- [ ] Crear `IInvitationRepository` interface
- [ ] Implementar `PrismaInvitationRepository`

### Fase 3: Aplicación
- [ ] Crear DTOs en `invitation.dto.ts`
- [ ] Implementar `CreateProjectInvitationUseCase`
- [ ] Implementar `GetProjectInvitationsUseCase`
- [ ] Implementar `RevokeProjectInvitationUseCase`
- [ ] Implementar `GuestLoginUseCase`

### Fase 4: Infraestructura
- [ ] Actualizar `ProjectController` (3 nuevos métodos)
- [ ] Actualizar `AuthController` (`guestLogin` method)
- [ ] Crear `guest-access.middleware.ts`
- [ ] Actualizar `auth.middleware.ts` para soporte GUEST
- [ ] Actualizar routes en `project.routes.ts`
- [ ] Actualizar routes en `auth.routes.ts`
- [ ] Aplicar `guestAccessMiddleware` en rutas de lectura

### Fase 5: Verificación
- [ ] Ejecutar tests unitarios → GREEN
- [ ] Ejecutar tests de integración → GREEN
- [ ] Verificar cobertura de código (>85%)
- [ ] Pruebas manuales con Postman/cURL
- [ ] Validar todos los criterios de aceptación

### Fase 6: Documentación
- [ ] Actualizar README con endpoints nuevos
- [ ] Documentar estructura de JWT de guest
- [ ] Añadir ejemplos de uso en docs

## 9. Estimación de Esfuerzo

| Fase | Tarea | Puntos | Tiempo Estimado |
|------|-------|--------|-----------------|
| 1 | Setup de Tests (factories + specs) | 2 | 2-3 horas |
| 2 | Dominio (Entity + Repository) | 2 | 2-3 horas |
| 3 | Use Cases (4 casos) | 3 | 4-5 horas |
| 4 | Controllers + Routes + Middleware | 2 | 3-4 horas |
| 5 | Integración y Testing | 1 | 2 horas |
| 6 | Refactoring y Documentación | 1 | 1-2 horas |
| **TOTAL** | **11 pts** | **14-19 horas** |

**Nota:** La estimación original de 5 pts en BACK-006 debería actualizarse a ~11 pts dada la complejidad completa de la implementación con testing TDD.

## 10. Flujo de Datos Completo

### Diagrama de Secuencia: Crear Invitación

```
Arquitecto → Frontend → Backend
1. Click "Compartir"
2. POST /projects/:id/invitations { email: "client@example.com" }
3. Verificar permisos (Owner/Editor)
4. Generar token UUID
5. Guardar en BD → Invitation { status: PENDING }
6. Retornar { id, token, email, projectId }
7. Mostrar URL: https://trace.app/guest?token=<uuid>
8. Copiar al portapapeles
```

### Diagrama de Secuencia: Login Guest

```
Cliente → Frontend → Backend
1. Abrir URL con token
2. POST /auth/guest/login { token }
3. Buscar Invitation por token
4. Validar status (canBeUsed())
5. Validar proyecto activo
6. Si PENDING → Actualizar a ACCEPTED
7. Generar JWT con payload guest
8. Retornar { accessToken, project }
9. Guardar JWT en localStorage
10. Redirigir a /projects/:id/viewer
```

### Diagrama de Secuencia: Acceso a Recurso

```
Guest → Frontend → Backend
1. GET /projects/:id (con JWT en header)
2. authMiddleware → Decodificar JWT
3. Extraer { role: 'GUEST', projectId }
4. guestAccessMiddleware → Validar projectId coincide con :id
5. Si válido → Procesar request
6. Retornar datos del proyecto
```

## 11. Casos de Uso Extendidos

### CU-1: Regenerar Invitación
**Actor:** Owner/Editor  
**Precondición:** Ya existe una invitación activa  
**Flujo:**
1. Owner hace clic en "Regenerar enlace"
2. Frontend llama a `POST /projects/:id/invitations` (mismo endpoint)
3. Backend crea una NUEVA invitación (no actualiza la existente)
4. Opcionalmente, puede revocar (EXPIRE) las invitaciones anteriores
5. Retorna nuevo token

**Resultado:** Nuevo token generado, anterior token puede o no seguir activo

### CU-2: Tracking de Accesos
**Actor:** Sistema  
**Precondición:** Invitación con status PENDING  
**Flujo:**
1. Guest hace login con token
2. Backend actualiza status a ACCEPTED
3. Se registra fecha de primer acceso (updatedAt)
4. Owner puede ver en panel cuándo fue aceptada

**Resultado:** Invitación marcada como ACCEPTED, tracking disponible

### CU-3: Guest Intenta Acción Prohibida
**Actor:** Guest autenticado  
**Precondición:** Guest tiene JWT válido  
**Flujo:**
1. Guest intenta `POST /projects/:id/plans`
2. authMiddleware valida JWT → OK
3. Controller verifica `req.user.role === 'GUEST'`
4. Retorna 403 Forbidden

**Resultado:** Acción bloqueada, mensaje de error al usuario

## 12. Mejoras Futuras (Fuera de Scope)

### Funcionalidades Adicionales
- **Comentarios de Guest:** Permitir que guests comenten en planos
- **Múltiples Proyectos por Guest:** Un token que dé acceso a N proyectos
- **Invitaciones con Expiración Automática:** Usar el campo `expiresAt` activamente
- **Notificaciones:** Enviar email cuando alguien accede por primera vez
- **Analytics:** Dashboard de accesos (cuántas veces, desde dónde, etc.)
- **Permisos Granulares:** Guest puede ver solo ciertos planes, no todos

### Mejoras Técnicas
- **Redis Cache:** Cachear validaciones de tokens frecuentes
- **Rate Limiting:** Implementar en `/auth/guest/login`
- **Logs de Auditoría:** Registrar todos los accesos de guests
- **Webhook Events:** Notificar al Owner cuando guest accede por primera vez
