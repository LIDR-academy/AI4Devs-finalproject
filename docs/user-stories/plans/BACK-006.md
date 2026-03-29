# Plan de Implementación: GUEST Access (BACK-006)

Este documento detalla el plan para implementar la lógica de acceso de invitados mediante tokens de invitación individuales.

## 1. Análisis y Diseño

### 1.1. Modelo de Datos: Tabla Invitation
Se utilizará la tabla `Invitation` existente en el schema para gestionar el acceso de invitados:

```prisma
model Invitation {
  id        String           @id @default(uuid())
  projectId String           @map("project_id")
  project   Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  email     String           // Email del invitado (opcional en UI, requerido en DB)
  token     String           @unique  // Token único para acceso
  expiresAt DateTime         @map("expires_at")  // No usado actualmente, se mantiene para futuro
  status    InvitationStatus @default(PENDING)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}
```

**Características:**
- Cada invitación es individual y está vinculada a un proyecto específico
- El `token` es único y se genera como UUID
- El campo `email` se utiliza para tracking (quién accedió)
- El `status` permite controlar el ciclo de vida (PENDING, ACCEPTED, EXPIRED)
- Los tokens no expiran automáticamente, solo se revocan manualmente

### 1.2. Entidad de Dominio: Invitation
Se creará una entidad `Invitation` en el dominio con lógica de negocio:

```typescript
export class Invitation {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly status: InvitationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Métodos de dominio
  canBeUsed(): boolean {
    return this.status === 'PENDING' || this.status === 'ACCEPTED';
  }

  markAsAccepted(): Invitation {
    return new Invitation(
      this.id,
      this.projectId,
      this.email,
      this.token,
      this.expiresAt,
      'ACCEPTED',
      this.createdAt,
      new Date()
    );
  }

  markAsExpired(): Invitation {
    return new Invitation(
      this.id,
      this.projectId,
      this.email,
      this.token,
      this.expiresAt,
      'EXPIRED',
      this.createdAt,
      new Date()
    );
  }
}
```

### 1.3. Estrategia de Autenticación
Para permitir que el invitado acceda a los recursos del proyecto (planos, capas) sin duplicar endpoints "públicos", se utilizará un flujo de intercambio de credenciales:

1.  **Guest Login:** El frontend envía el `token` a `POST /auth/guest/login`.
2.  **Validación:** El backend verifica que:
    - El token exista en la tabla `Invitation`
    - El status sea `PENDING` o `ACCEPTED`
    - El proyecto asociado esté activo
3.  **Tracking:** Si es el primer uso (status=PENDING), se actualiza a `ACCEPTED`
4.  **Emisión de JWT:** Se genera un JWT temporal con:
    ```typescript
    {
      sub: `guest-${projectId}`,
      role: 'GUEST',
      projectId: projectId,
      permissions: ['READ_PROJECT', 'READ_PLANS', 'READ_LAYERS']
    }
    ```
5.  **Acceso:** El invitado usa este JWT para peticiones subsiguientes. El middleware validará que el usuario GUEST solo acceda al `projectId` codificado en su token.

## 2. Componentes a Implementar

### 2.1. Capa de Dominio

#### Repositorio: `IInvitationRepository`
Interfaz en `src/domain/repositories/invitation.repository.ts`:
```typescript
export interface IInvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  findByProjectId(projectId: string): Promise<Invitation[]>;
  update(invitation: Invitation): Promise<Invitation>;
  delete(id: string): Promise<void>;
  revokeByToken(token: string): Promise<void>;
}
```

#### Implementación Prisma: `PrismaInvitationRepository`
En `src/infrastructure/database/repositories/prisma-invitation.repository.ts`

### 2.2. Capa de Aplicación (Use Cases)

#### `CreateProjectInvitation`
*   **Input:** `CreateInvitationDto { projectId: string, email?: string, userId: string (actor) }`
*   **Lógica:**
    1. Verificar que el usuario sea Owner o Editor del proyecto
    2. Generar token único (UUID)
    3. Establecer expiresAt (ej. 1 año en el futuro, aunque no se usará automáticamente)
    4. Si no se proporciona email, usar un valor por defecto (ej. `guest@system`)
    5. Crear invitación con status PENDING
    6. Retornar la invitación creada
*   **Output:** `Invitation`
*   **Errores:** `Forbidden`, `ProjectNotFound`

#### `GetProjectInvitations`
*   **Input:** `{ projectId: string, userId: string (actor) }`
*   **Lógica:**
    1. Verificar permisos (Owner/Editor)
    2. Retornar lista de invitaciones activas (status != EXPIRED)
*   **Output:** `Invitation[]`

#### `RevokeProjectInvitation`
*   **Input:** `{ projectId: string, token: string, userId: string (actor) }`
*   **Lógica:**
    1. Verificar permisos (Owner/Editor)
    2. Buscar invitación por token
    3. Actualizar status a EXPIRED
*   **Output:** `void`
*   **Errores:** `Forbidden`, `InvitationNotFound`

#### `GuestLogin`
*   **Input:** `{ token: string }`
*   **Lógica:**
    1. Buscar invitación por token
    2. Validar que el token sea válido (`canBeUsed()` = true)
    3. Validar que el proyecto asociado esté activo
    4. Si status = PENDING, actualizar a ACCEPTED
    5. Generar JWT con payload de invitado
*   **Output:** `{ accessToken: string, project: { id, title } }`
*   **Errores:** `InvalidToken`, `ProjectNotActive`

### 2.3. Capa de Infraestructura (API & Persistence)

#### Endpoints en `ProjectController`
```typescript
POST   /api/projects/:id/invitations      // Crear invitación
GET    /api/projects/:id/invitations      // Listar invitaciones
DELETE /api/projects/:id/invitations/:token // Revocar invitación
```

#### Endpoint en `AuthController`
```typescript
POST   /api/auth/guest/login              // Login con token
```
**Body:** `{ token: string }`
**Response:** `{ accessToken: string, project: { id, title } }`

#### DTOs
```typescript
// src/domain/dtos/invitation.dto.ts
export interface CreateInvitationDto {
  projectId: string;
  email?: string;
}

export interface GuestLoginDto {
  token: string;
}
```

### 2.4. Middleware de Autorización

#### Actualizar `authMiddleware`
El middleware actual debe ser extendido para soportar JWT de invitados:

```typescript
// Decodificar JWT
const decoded = jwt.verify(token, env.JWT_SECRET);

// Anexar información del usuario
req.user = {
  id: decoded.sub,
  role: decoded.role,
  projectId: decoded.projectId, // Solo para GUEST
  permissions: decoded.permissions // Solo para GUEST
};
```

#### Crear `guestAccessMiddleware`
Nuevo middleware en `src/interfaces/http/middlewares/guest-access.middleware.ts`:
```typescript
export const guestAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (user.role === 'GUEST') {
    const requestedProjectId = req.params.projectId || req.params.id;
    
    if (requestedProjectId !== user.projectId) {
      return res.status(403).json({ 
        error: 'Access denied: Guest can only access assigned project' 
      });
    }
  }
  
  return next();
};
```

**Uso:** Aplicar en rutas de lectura de proyectos, planes y capas después de `authMiddleware`.

## 3. Tareas Paso a Paso (TDD Approach)

Seguir la estrategia TDD del proyecto: **Escribir tests ANTES de la implementación**.

### 3.1. Fase 1: Tests de Integración (RED)
**Archivo:** `apps/backend/tests/integration/invitations.spec.ts`

**Casos de prueba:**

```typescript
describe('Invitation Integration Tests', () => {
  // Setup: Mock Prisma, JWT, factories
  
  describe('POST /api/projects/:id/invitations', () => {
    it('should return 201 and create invitation when Owner requests', async () => {
      // Given: Usuario Owner del proyecto
      // When: POST con email opcional
      // Then: 201, retorna { id, token, email, projectId, status: 'PENDING' }
    });

    it('should return 201 and create invitation without email (uses default)', async () => {
      // Given: Usuario Owner, sin email en body
      // When: POST
      // Then: 201, email = 'guest@system'
    });

    it('should return 403 when non-Owner/Editor tries to create invitation', async () => {
      // Given: Usuario VIEWER
      // When: POST
      // Then: 403 Forbidden
    });

    it('should return 404 when project does not exist', async () => {
      // Given: projectId inválido
      // When: POST
      // Then: 404 Not Found
    });
  });

  describe('GET /api/projects/:id/invitations', () => {
    it('should return 200 and list active invitations when Owner requests', async () => {
      // Given: Proyecto con 2 invitaciones (1 PENDING, 1 ACCEPTED)
      // When: GET
      // Then: 200, array con 2 invitaciones
    });

    it('should return 403 when Viewer tries to list invitations', async () => {
      // Given: Usuario VIEWER
      // When: GET
      // Then: 403 Forbidden
    });

    it('should not include EXPIRED invitations in list', async () => {
      // Given: Proyecto con invitación EXPIRED
      // When: GET
      // Then: No incluye la expirada
    });
  });

  describe('DELETE /api/projects/:id/invitations/:token', () => {
    it('should return 204 and revoke invitation when Owner requests', async () => {
      // Given: Invitación activa
      // When: DELETE
      // Then: 204, status cambia a EXPIRED
    });

    it('should return 403 when non-Owner tries to revoke', async () => {
      // Given: Usuario VIEWER
      // When: DELETE
      // Then: 403 Forbidden
    });

    it('should return 404 when token does not exist', async () => {
      // Given: Token inválido
      // When: DELETE
      // Then: 404 Not Found
    });
  });

  describe('POST /api/auth/guest/login', () => {
    it('should return 200 with JWT when token is valid and PENDING', async () => {
      // Given: Token válido, status PENDING
      // When: POST { token }
      // Then: 200, { accessToken, project: { id, title } }
      // And: Status actualizado a ACCEPTED
    });

    it('should return 200 with JWT when token is ACCEPTED (reuse)', async () => {
      // Given: Token válido, status ACCEPTED
      // When: POST { token }
      // Then: 200, { accessToken }
      // And: Status permanece ACCEPTED
    });

    it('should return 401 when token is EXPIRED', async () => {
      // Given: Token con status EXPIRED
      // When: POST { token }
      // Then: 401 Unauthorized
    });

    it('should return 401 when token does not exist', async () => {
      // Given: Token inexistente
      // When: POST { token }
      // Then: 401 Unauthorized
    });

    it('should return 403 when project is not ACTIVE', async () => {
      // Given: Token válido pero proyecto ARCHIVED
      // When: POST { token }
      // Then: 403 Forbidden
    });

    it('should return JWT with correct payload structure', async () => {
      // Given: Token válido
      // When: POST, decodificar JWT
      // Then: Payload contiene { sub, role: 'GUEST', projectId, permissions }
    });
  });
});
```

### 3.2. Fase 2: Tests Unitarios (RED)
**Use Cases:** `apps/backend/tests/unit/use-cases/invitations/`

```typescript
describe('CreateProjectInvitationUseCase', () => {
  it('should create invitation with provided email', async () => {});
  it('should use default email when not provided', async () => {});
  it('should throw Forbidden when user is not Owner/Editor', async () => {});
  it('should generate unique UUID token', async () => {});
});

describe('GuestLoginUseCase', () => {
  it('should mark invitation as ACCEPTED on first use', async () => {});
  it('should not change status if already ACCEPTED', async () => {});
  it('should throw InvalidToken when status is EXPIRED', async () => {});
  it('should generate JWT with correct claims', async () => {});
});
```

### 3.3. Fase 3: Implementación (GREEN)

**Orden de implementación:**

1.  **Entidad de Dominio:** Ya existe en `src/domain/entities/invitation.entity.ts` - Añadir métodos `canBeUsed()`, `markAsAccepted()`, `markAsExpired()`

2.  **Repositorio:**
    *   Interfaz: `src/domain/repositories/invitation.repository.ts`
    *   Implementación: `src/infrastructure/database/repositories/prisma-invitation.repository.ts`

3.  **DTOs:**
    *   `src/domain/dtos/invitation.dto.ts`

4.  **Use Cases:**
    *   `src/application/use-cases/create-project-invitation.use-case.ts`
    *   `src/application/use-cases/get-project-invitations.use-case.ts`
    *   `src/application/use-cases/revoke-project-invitation.use-case.ts`
    *   `src/application/use-cases/guest-login.use-case.ts`

5.  **Controllers:**
    *   Actualizar `src/interfaces/http/controllers/project.controller.ts` (añadir métodos)
    *   Actualizar `src/interfaces/http/controllers/auth.controller.ts` (añadir `guestLogin`)

6.  **Routes:**
    *   Actualizar `src/interfaces/http/routes/project.routes.ts`
    *   Actualizar `src/interfaces/http/routes/auth.routes.ts`

7.  **Middlewares:**
    *   Actualizar `src/interfaces/http/middlewares/auth.middleware.ts` (soporte GUEST)
    *   Crear `src/interfaces/http/middlewares/guest-access.middleware.ts`

8.  **Aplicar Middleware:**
    *   En rutas de Project: `GET /projects/:id` - añadir `guestAccessMiddleware`
    *   En rutas de Plans: `GET /projects/:id/plans/*` - añadir `guestAccessMiddleware`
    *   En rutas de Layers: `GET /plans/:id/layers/*` - añadir `guestAccessMiddleware`

### 3.4. Fase 4: Refactoring y Limpieza (REFACTOR)

*   Extraer constantes (ej. `DEFAULT_GUEST_EMAIL = 'guest@system'`)
*   Validar que todos los tests pasen
*   Verificar cobertura de código
*   Documentar decisiones técnicas

## 4. Testing Strategy Detallada

### 4.1. Factory Pattern
**Archivo:** `apps/backend/tests/factories/invitation.factory.ts`

```typescript
import { Invitation } from '@/domain/entities/invitation.entity';
import { v4 as uuid } from 'uuid';

export const createInvitation = (overrides?: Partial<Invitation>): Invitation => {
  const defaults = {
    id: uuid(),
    projectId: 'project-123',
    email: 'guest@example.com',
    token: uuid(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
    status: 'PENDING' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Invitation(
    overrides?.id ?? defaults.id,
    overrides?.projectId ?? defaults.projectId,
    overrides?.email ?? defaults.email,
    overrides?.token ?? defaults.token,
    overrides?.expiresAt ?? defaults.expiresAt,
    overrides?.status ?? defaults.status,
    overrides?.createdAt ?? defaults.createdAt,
    overrides?.updatedAt ?? defaults.updatedAt
  );
};

export const createInvitationDto = (overrides?: any) => ({
  email: 'guest@example.com',
  ...overrides,
});

export const createGuestLoginDto = (overrides?: any) => ({
  token: uuid(),
  ...overrides,
});
```

### 4.2. Estructura de Tests

```
apps/backend/tests/
├── factories/
│   └── invitation.factory.ts          # Nuevo
├── integration/
│   └── invitations.spec.ts            # Nuevo - Tests de API
└── unit/
    └── use-cases/
        └── invitations/               # Nuevo
            ├── create-invitation.spec.ts
            ├── guest-login.spec.ts
            ├── get-invitations.spec.ts
            └── revoke-invitation.spec.ts
```

### 4.3. Mocking Strategy

**Prisma Mocks:**
```typescript
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    invitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    projectMember: {
      findUnique: jest.fn(),
    },
  },
}));
```

**JWT Mocks para Tests:**
```typescript
// Helper para generar JWT de test
const generateGuestToken = (projectId: string): string => {
  return jwt.sign(
    {
      sub: `guest-${projectId}`,
      role: 'GUEST',
      projectId,
      permissions: ['READ_PROJECT', 'READ_PLANS', 'READ_LAYERS']
    },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};
```

### 4.4. Casos Edge a Cubrir

**Seguridad:**
- ✅ Guest intenta acceder a proyecto diferente al asignado
- ✅ Guest intenta crear/modificar/eliminar recursos
- ✅ JWT expirado o malformado
- ✅ Token revocado (EXPIRED) no permite login

**Concurrencia:**
- ✅ Múltiples logins simultáneos con mismo token (ACCEPTED no cambia)
- ✅ Regenerar invitación mientras alguien la usa

**Permisos:**
- ✅ VIEWER no puede crear/revocar invitaciones
- ✅ EDITOR puede crear/revocar invitaciones
- ✅ Owner de otro proyecto no puede revocar invitaciones

**Validaciones:**
- ✅ Email inválido en creación de invitación
- ✅ ProjectId inexistente
- ✅ Token UUID inválido (formato)

### 4.5. Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Solo tests de invitaciones (integración)
npm test -- invitations.spec.ts

# Solo tests unitarios de use cases
npm test -- use-cases/invitations

# Con cobertura
npm test -- --coverage

# Watch mode durante desarrollo
npm test -- --watch
```

### 4.6. Cobertura Mínima Esperada

| Componente | Cobertura Mínima |
|------------|------------------|
| Use Cases  | 90%              |
| Repositories | 80%            |
| Controllers | 85%             |
| Middlewares | 90%             |
| Entities   | 95%              |
