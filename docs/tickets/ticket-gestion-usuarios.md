# Tickets - Gestión de Usuarios

## Índice
- [US-001: Autenticación de usuarios](#us-001-autenticación-de-usuarios)
- [US-002: Control de acceso por roles](#us-002-control-de-acceso-por-roles)

---

## US-001: Autenticación de usuarios

### TICKET-001-DB: Diseño e implementación del modelo de datos de usuarios

**Tipo:** Database  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear el esquema de base de datos para usuarios, sesiones y control de intentos fallidos en PostgreSQL usando Prisma.

#### Tareas técnicas
- [ ] Definir schema de Prisma para entidad `User`
  - Campos: id, email, password_hash, role, first_name, last_name, is_active, failed_attempts, locked_until, created_at, updated_at
- [ ] Definir schema para `Session`
  - Campos: id, user_id, token_hash, expires_at, device_id, created_at
- [ ] Crear índices:
  - `UNIQUE(email)` en User
  - `INDEX(user_id)` en Session
  - `INDEX(expires_at)` en Session
- [ ] Generar y aplicar migration de Prisma
- [ ] Poblar datos de prueba (usuarios de prueba con roles)
- [ ] Documentar esquema y relaciones

#### Criterios de aceptación
- Schema de Prisma compila sin errores
- Migrations se aplican correctamente en PostgreSQL
- Índices creados y funcionando
- Constraints de unicidad funcionando
- Datos de prueba cargados (mínimo 3 usuarios con diferentes roles)

#### Dependencias
- Ninguna

#### Notas técnicas
- Usar bcrypt rounds: 12 para password_hash
- expires_at en Session debe ser timestamp con zona horaria
- failed_attempts debe reiniciarse a 0 tras login exitoso
- locked_until debe ser nullable

---

### TICKET-001-BE-01: Implementación de entidades y value objects del dominio

**Tipo:** Backend - Domain Layer  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 1

#### Descripción
Crear entidades de dominio (User) con sus value objects (Email, Password, Role) siguiendo DDD en TypeScript.

#### Tareas técnicas
- [ ] Crear entidad `User` en `domains/users/entities/User.ts`
  - Propiedades: id, email, passwordHash, role, firstName, lastName, isActive, failedAttempts, lockedUntil
  - Métodos: `create()`, `validateCredentials()`, `lockAccount()`, `unlockAccount()`, `resetFailedAttempts()`
- [ ] Crear Value Object `Email` con validación regex
  - Validar formato email estándar
  - Normalización (lowercase, trim)
- [ ] Crear Value Object `Password` con validaciones
  - Mínimo 8 caracteres, 1 mayúscula, 1 número
- [ ] Crear enum `Role` (TEACHER, DIRECTOR, ADMIN)
- [ ] Implementar Domain Events:
  - `UserLoggedIn`
  - `SessionExpired`
  - `AccountLocked`
- [ ] Tests unitarios para entidades y value objects (>80% coverage)

#### Criterios de aceptación
- Entidades cumplen principios DDD (encapsulación, invariantes)
- Value Objects son inmutables
- Validaciones funcionan correctamente
- Domain events se emiten en momentos correctos
- Tests unitarios pasan (>80% coverage)
- ESLint (con `@typescript-eslint/*`) sin warnings

#### Dependencias
- TICKET-001-DB

#### Notas técnicas
- Usar librerías: `validator` para Email, `bcrypt` para Password
- Value Objects deben lanzar excepciones descriptivas en validación fallida
- Implementar patrón Factory para creación de User

---

### TICKET-001-BE-02: Implementación de UserRepository

**Tipo:** Backend - Infrastructure Layer  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Implementar repositorio de usuarios con Prisma para operaciones CRUD y consultas específicas.

#### Tareas técnicas
- [ ] Crear interfaz `IUserRepository` en `domains/users/repositories/`
  - Métodos: `findByEmail()`, `findById()`, `create()`, `update()`, `updateLastLogin()`, `incrementFailedAttempts()`, `lockAccount()`
- [ ] Implementar `PrismaUserRepository` en `infrastructure/repositories/`
- [ ] Mappers entre entidades de dominio y modelos Prisma
  - `UserMapper.toDomain(prismaUser)`
  - `UserMapper.toPersistence(domainUser)`
- [ ] Manejo de errores específicos (NotFound, DuplicateEmail)
- [ ] Tests de integración con base de datos de prueba

#### Criterios de aceptación
- Todas las operaciones CRUD funcionan correctamente
- Mappers preservan integridad de datos
- Errores de dominio son lanzados apropiadamente
- Tests de integración pasan (usar testcontainers)
- Transacciones atómicas para operaciones críticas

#### Dependencias
- TICKET-001-DB
- TICKET-001-BE-01

---

### TICKET-001-BE-03: Implementación de AuthService

**Tipo:** Backend - Domain Services  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 1

#### Descripción
Crear servicio de autenticación con lógica de negocio: login, logout, validación de tokens, gestión de intentos fallidos.

#### Tareas técnicas
- [ ] Crear `AuthService` en `domains/users/services/`
  - `login(email, password): Promise<{ user, token, refreshToken, expiresIn }>`
  - `logout(userId): Promise<void>`
  - `validateToken(token): Promise<User | null>`
  - `refreshToken(oldToken): Promise<{ token, refreshToken, expiresIn }>`
  - `trackFailedAttempt(email): Promise<void>`
  - `lockAccount(userId, duration): Promise<void>`
- [ ] Implementar generación de JWT con claims:
  - userId, role, email, exp (8 horas)
- [ ] Implementar verificación de password con bcrypt
- [ ] Lógica de bloqueo tras 5 intentos fallidos (15 minutos)
- [ ] Limpieza de sesiones expiradas (cron job)
- [ ] Tests unitarios con mocks del repositorio

#### Criterios de aceptación
- JWT generado correctamente con secret de env
- Password hasheado con bcrypt rounds=12
- Bloqueo funciona tras 5 intentos fallidos
- Token expira a las 8 horas correctamente
- Sesiones expiradas se limpian automáticamente
- Tests unitarios >85% coverage

#### Dependencias
- TICKET-001-BE-01
- TICKET-001-BE-02

#### Notas técnicas
- Usar librerías: `jsonwebtoken`, `bcrypt`
- Secret JWT debe venir de variable de entorno
- Implementar refresh token pattern (opcional para MVP)

---

### TICKET-001-BE-04: Implementación de middlewares de autenticación

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear middlewares de Express para validación de tokens, verificación de sesión y rate limiting.

#### Tareas técnicas
- [ ] Crear `authenticateToken` middleware
  - Extraer token de header Authorization
  - Validar y decodificar JWT
  - Adjuntar user a request
  - Manejo de errores (401 Unauthorized)
- [ ] Crear `checkSessionValidity` middleware
  - Verificar que sesión no ha expirado
  - Validar contra tabla Session en BD
- [ ] Implementar `rateLimitLogin` middleware
  - Límite: 5 intentos por 15 minutos por IP
  - Usar `express-rate-limit`
- [ ] Middleware de logging de peticiones autenticadas
- [ ] Tests de integración de middlewares

#### Criterios de aceptación
- Middleware autentica correctamente tokens válidos
- Rechaza tokens inválidos/expirados con 401
- Rate limiting funciona correctamente
- Request incluye user en req.user tras autenticación
- Tests de integración pasan

#### Dependencias
- TICKET-001-BE-03

#### Notas técnicas
- Usar librerías: `express-rate-limit`, `express-slow-down`
- Cachear validación de token en Redis (opcional para MVP)

---

### TICKET-001-BE-05: Implementación de AuthController y rutas

**Tipo:** Backend - API Layer  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear controlador y endpoints REST para autenticación.

#### Tareas técnicas
- [ ] Crear `AuthController` en `interfaces/controllers/`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/refresh`
- [ ] Validación de request bodies con Zod
  - LoginDto: { email: string, password: string }
- [ ] Respuestas estandarizadas (según contrato OpenAPI):
  - Success (Login): { token: string, refreshToken: string, expiresIn: number, user: User }
  - Error: { error: string, message: string, details?: string }
- [ ] Documentación OpenAPI/Swagger debe coincidir exactamente con las respuestas implementadas
- [ ] Tests de integración E2E de endpoints

#### Criterios de aceptación
- Todos los endpoints responden correctamente
- Validación de inputs funciona (400 Bad Request)
- Respuestas siguen formato estándar
- Documentación Swagger generada
- Tests E2E pasan (usar supertest)

#### Dependencias
- TICKET-001-BE-03
- TICKET-001-BE-04

#### Notas técnicas
- Usar Zod para validación de schemas
- No exponer información sensible en errores
- Implementar CORS correctamente

---

### TICKET-001-FE-01: Implementación de state management de autenticación

**Tipo:** Frontend - State Management  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear provider/notifier de autenticación con Riverpod para gestionar estado global de sesión.

#### Tareas técnicas
- [ ] Crear `AuthState` en `lib/state/auth/`
  - Campos: user, token, isAuthenticated, sessionExpiry, isLoading, error
- [ ] Crear `AuthNotifier extends StateNotifier<AuthState>`
  - Métodos: `login()`, `logout()`, `checkSession()`, `refreshToken()`
- [ ] Implementar persistencia de token con `flutter_secure_storage`
- [ ] Auto-logout en expiración de sesión
- [ ] Gestión de estados: loading, authenticated, unauthenticated, error
- [ ] Tests unitarios de notifier

#### Criterios de aceptación
- Estado reactivo funciona correctamente
- Token persiste en secure storage
- Auto-logout funciona tras expiración
- Manejo de errores apropiado
- Tests unitarios >80% coverage

#### Dependencias
- Ninguna (puede empezar en paralelo)

#### Notas técnicas
- Usar Riverpod 2.x
- flutter_secure_storage para tokens
- Considerar StateNotifierProvider vs NotifierProvider

---

### TICKET-001-FE-02: Implementación de AuthService en Flutter

**Tipo:** Frontend - Services  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear servicio HTTP para comunicación con API de autenticación usando Dio.

#### Tareas técnicas
- [ ] Crear `AuthService` en `lib/services/`
  - Métodos: `login()`, `logout()`, `getCurrentUser()`, `refreshToken()`
- [ ] Configurar Dio con interceptores:
  - Adjuntar token en headers
  - Manejo de errores HTTP
  - Logging de requests (dev only)
  - Retry automático (max 2 intentos)
- [ ] DTOs: `LoginRequest`, `LoginResponse`, `UserDTO`
- [ ] Manejo de timeouts (5 segundos)
- [ ] Tests con mocks de Dio

#### Criterios de aceptación
- Llamadas HTTP funcionan correctamente
- Interceptores agregan token automáticamente
- Errores mapeados a excepciones de dominio
- Timeout funciona apropiadamente
- Tests con mocks pasan

#### Dependencias
- TICKET-001-BE-05 (para pruebas de integración)

#### Notas técnicas
- Usar Dio 5.x
- Implementar retry logic con exponential backoff
- Mapear códigos HTTP a excepciones específicas

---

### TICKET-001-FE-03: Implementación de UI de login

**Tipo:** Frontend - UI  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 1

#### Descripción
Crear pantalla de login con formulario, validaciones y manejo de estados.

#### Tareas técnicas
- [ ] Crear `LoginPage` en `lib/pages/auth/`
- [ ] Formulario con campos:
  - Email (con validación de formato)
  - Password (obscureText, toggle visibility)
- [ ] Validaciones frontend en tiempo real
- [ ] Botón de submit con estados:
  - Habilitado/deshabilitado según validación
  - Loading spinner durante autenticación
- [ ] Mensajes de error user-friendly
- [ ] Navegación a home tras login exitoso
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Tests de widgets

#### Criterios de aceptación
- Formulario valida correctamente
- Errores mostrados apropiadamente
- Loading state visible durante login
- Navegación funciona tras login exitoso
- UI responsive en todos los tamaños
- Tests de widgets pasan

#### Dependencias
- TICKET-001-FE-01
- TICKET-001-FE-02

#### Notas técnicas
- Usar Material Design 3
- Considerar accesibilidad (semantic labels)
- Implementar debouncing en validación (300ms)

---

### TICKET-001-FE-04: Implementación de route guards

**Tipo:** Frontend - Navigation  
**Prioridad:** Crítica  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Crear guards de navegación para proteger rutas que requieren autenticación.

#### Tareas técnicas
- [ ] Configurar go_router con guards
- [ ] Crear `AuthGuard` que verifica autenticación
- [ ] Redirección a login si no autenticado
- [ ] Preservar ruta destino para redirect post-login
- [ ] Manejo de deep links con autenticación
- [ ] Tests de navegación

#### Criterios de aceptación
- Rutas protegidas redirigen a login
- Usuario autenticado puede acceder rutas protegidas
- Redirect a ruta original tras login
- Deep links funcionan correctamente
- Tests pasan

#### Dependencias
- TICKET-001-FE-01

#### Notas técnicas
- Usar go_router 13.x
- Implementar redirect callback
- Considerar lazy loading de páginas

---

### TICKET-001-INT: Integración y pruebas E2E de autenticación

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Pruebas de integración completas del flujo de autenticación desde frontend hasta backend.

#### Tareas técnicas
- [ ] Configurar ambiente de testing E2E
- [ ] Tests de flujo completo:
  - Login exitoso
  - Login con credenciales incorrectas
  - Bloqueo tras intentos fallidos
  - Expiración de sesión
  - Logout
- [ ] Tests de seguridad:
  - Intentos de bypass de autenticación
  - Token manipulation
  - CSRF protection
- [ ] Tests de performance:
  - Tiempo de respuesta <2 segundos
  - Carga concurrente
- [ ] Documentación de casos de prueba

#### Criterios de aceptación
- Todos los flujos funcionan end-to-end
- Tests de seguridad pasan
- Performance dentro de SLA (<2 seg)
- Documentación completa

#### Dependencias
- TICKET-001-BE-05
- TICKET-001-FE-03

#### Notas técnicas
- Usar Postman/Newman para API tests
- Flutter integration tests para E2E
- Considerar usar testcontainers para BD

---

## US-002: Control de acceso por roles

### TICKET-002-DB: Extensión del modelo de datos para roles y permisos

**Tipo:** Database  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Extender esquema de base de datos para soportar RBAC (Role-Based Access Control) y asignaciones de docentes a aulas.

#### Tareas técnicas
- [ ] Agregar campo `role` a tabla User (enum: TEACHER, DIRECTOR, ADMIN)
- [ ] Crear tabla `classroom_assignments`
  - Campos: id, user_id, class_room_id, assigned_at, created_by
  - Relación N:M entre User y ClassRoom
- [ ] Índices:
  - `INDEX(user_id)` en classroom_assignments
  - `INDEX(class_room_id)` en classroom_assignments
  - `UNIQUE(user_id, class_room_id)` para evitar duplicados
- [ ] Constraint FK user_id → users.id
- [ ] Constraint FK class_room_id → class_rooms.id
- [ ] Migration de Prisma
- [ ] Seeds de datos de prueba (docentes asignados a aulas)

#### Criterios de aceptación
- Schema compilado y migrado correctamente
- Constraints funcionando (unicidad, FK)
- Índices creados y optimizados
- Datos de prueba realistas

#### Dependencias
- TICKET-001-DB

---

### TICKET-002-BE-01: Implementación de sistema RBAC en dominio

**Tipo:** Backend - Domain Layer  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 1

#### Descripción
Crear sistema de permisos basado en roles (RBAC) con enums y lógica de verificación.

#### Tareas técnicas
- [ ] Crear enum `Permission` en `domains/users/entities/`
  - CREATE_ATTENDANCE, VIEW_ALL_CLASSROOMS, CREATE_INCIDENT, VIEW_INCIDENT, EXPORT_DATA, MANAGE_USERS, EDIT_ATTENDANCE, etc.
- [ ] Crear clase `RolePermission` con mapeo estático:
  ```typescript
  static rolePermissions: Map<Role, Permission[]> = {
    TEACHER: [CREATE_ATTENDANCE, CREATE_INCIDENT, VIEW_INCIDENT],
    DIRECTOR: [ALL_PERMISSIONS],
    ADMIN: [CREATE_ATTENDANCE, VIEW_ALL_CLASSROOMS, EXPORT_DATA]
  }
  ```
- [ ] Métodos: `getPermissions(role)`, `hasPermission(role, permission)`
- [ ] Crear entidad `ClassRoomAssignment`
- [ ] Tests unitarios exhaustivos de matriz de permisos

#### Criterios de aceptación
- Todos los roles tienen permisos definidos
- Lógica de verificación funciona correctamente
- Tests cubren todas las combinaciones rol-permiso
- Documentación de matriz de permisos

#### Dependencias
- TICKET-002-DB

---

### TICKET-002-BE-02: Implementación de ClassRoomAssignmentRepository

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Repositorio para gestionar asignaciones de docentes a aulas.

#### Tareas técnicas
- [ ] Crear interfaz `IClassRoomAssignmentRepository`
  - `findByUserId(userId): Promise<string[]>`
  - `findByClassRoomId(classRoomId): Promise<string[]>`
  - `assign(userId, classRoomId): Promise<void>`
  - `unassign(userId, classRoomId): Promise<void>`
  - `hasAccess(userId, classRoomId): Promise<boolean>`
- [ ] Implementar con Prisma
- [ ] Manejo de duplicados (idempotencia)
- [ ] Tests de integración

#### Criterios de aceptación
- Todas las operaciones funcionan correctamente
- Duplicados manejados apropiadamente
- Tests pasan

#### Dependencias
- TICKET-002-DB

---

### TICKET-002-BE-03: Implementación de AuthorizationService

**Tipo:** Backend - Domain Services  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Servicio de autorización que combina roles y asignaciones para validar acceso.

#### Tareas técnicas
- [ ] Crear `AuthorizationService` en `domains/users/services/`
  - `canAccessClassRoom(userId, classRoomId): Promise<boolean>`
  - `canPerformAction(userId, action: Permission): Promise<boolean>`
  - `getAccessibleClassRooms(userId): Promise<string[]>`
- [ ] Lógica especial para DIRECTOR (acceso total)
- [ ] Lógica para TEACHER (solo aulas asignadas)
- [ ] Cachear resultados de permisos (opcional)
- [ ] Tests unitarios con mocks

#### Criterios de aceptación
- Directores tienen acceso a todo
- Docentes solo a sus aulas asignadas
- Permisos validados correctamente
- Tests >85% coverage

#### Dependencias
- TICKET-002-BE-01
- TICKET-002-BE-02

---

### TICKET-002-BE-04: Implementación de middlewares de autorización

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Middlewares de Express para validar permisos y acceso a recursos.

#### Tareas técnicas
- [ ] Crear `requirePermission(permission)` middleware
  - Verificar que usuario tiene permiso específico
  - Retornar 403 Forbidden si no
- [ ] Crear `requireClassRoomAccess(classRoomId)` middleware
  - Extraer classRoomId de params/body
  - Validar acceso con AuthorizationService
  - Permitir acceso total a DIRECTOR
- [ ] Crear `requireRole(role)` middleware
- [ ] Middleware de logging de intentos de acceso denegado
- [ ] Tests de integración

#### Criterios de aceptación
- Middlewares bloquean accesos no autorizados (403)
- DIRECTOR puede acceder a todo
- TEACHER solo a sus aulas
- Logs de accesos denegados funcionan
- Tests pasan

#### Dependencias
- TICKET-002-BE-03
- TICKET-001-BE-04

---

### TICKET-002-BE-05: Protección de endpoints existentes con autorización

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Aplicar middlewares de autorización a todos los endpoints relevantes.

#### Tareas técnicas
- [ ] Agregar middlewares a rutas de attendance:
  - `POST /api/attendance/check-in` → requirePermission(CREATE_ATTENDANCE) + requireClassRoomAccess
  - `GET /api/attendance/classroom/:id` → requireClassRoomAccess
- [ ] Agregar middlewares a rutas de incidents (futuro)
- [ ] Agregar middleware a rutas de export
- [ ] Documentar permisos requeridos en Swagger
- [ ] Tests E2E de autorización

#### Criterios de aceptación
- Todos los endpoints críticos protegidos
- Tests verifican bloqueo de accesos no autorizados
- Documentación actualizada

#### Dependencias
- TICKET-002-BE-04
- TICKET-001-BE-05

---

### TICKET-002-FE-01: Extensión de AuthState con permisos

**Tipo:** Frontend - State Management  
**Prioridad:** Crítica  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Extender state de autenticación para incluir rol, permisos y aulas asignadas.

#### Tareas técnicas
- [ ] Agregar a `AuthState`:
  - `role: Role?`
  - `assignedClassRoomIds: List<String>`
  - `permissions: List<Permission>`
- [ ] Métodos en `AuthNotifier`:
  - `hasPermission(Permission permission): bool`
  - `canAccessClassRoom(String classRoomId): bool`
  - `getAccessibleClassRooms(): List<String>`
- [ ] Cargar permisos al hacer login
- [ ] Tests unitarios

#### Criterios de aceptación
- State incluye información de autorización
- Métodos de verificación funcionan
- Se carga correctamente en login
- Tests pasan

#### Dependencias
- TICKET-001-FE-01

---

### TICKET-002-FE-02: Implementación de guards de permisos

**Tipo:** Frontend - Navigation  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Crear guards para proteger rutas basadas en permisos.

#### Tareas técnicas
- [ ] Crear `PermissionGuard` en `lib/utils/`
  - Verificar permisos requeridos para ruta
  - Redirigir a página de acceso denegado si no tiene permiso
- [ ] Integrar con go_router
- [ ] Crear página de "Acceso Denegado"
- [ ] Tests de navegación

#### Criterios de aceptación
- Rutas protegidas por permisos
- Redirección funciona correctamente
- Página de error user-friendly
- Tests pasan

#### Dependencias
- TICKET-002-FE-01
- TICKET-001-FE-04

---

### TICKET-002-FE-03: Componentes UI condicionales por permisos

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Crear widgets que se muestran/ocultan según permisos del usuario.

#### Tareas técnicas
- [ ] Crear `PermissionBasedWidget` en `lib/widgets/`
  - Parámetros: requiredPermission, child
  - Mostrar child solo si tiene permiso
  - Opcionalmente mostrar placeholder si no tiene permiso
- [ ] Crear `RoleBasedWidget` similar
- [ ] Ejemplos de uso en diferentes páginas
- [ ] Tests de widgets

#### Criterios de aceptación
- Widget oculta contenido apropiadamente
- No hay flickering en carga inicial
- Tests de diferentes escenarios pasan

#### Dependencias
- TICKET-002-FE-01

---

### TICKET-002-FE-04: Filtrado de aulas accesibles en UI

**Tipo:** Frontend - Services & UI  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 1

#### Descripción
Implementar lógica para mostrar solo aulas accesibles por el usuario.

#### Tareas técnicas
- [ ] Crear `ClassRoomService` con método `getAccessibleClassRooms()`
- [ ] Filtrar lista de aulas en UI según permisos
- [ ] Dropdown/selector muestra solo aulas permitidas
- [ ] Manejo especial para DIRECTOR (todas las aulas)
- [ ] Tests

#### Criterios de aceptación
- TEACHER ve solo sus aulas asignadas
- DIRECTOR ve todas las aulas
- UI actualizada correctamente
- Tests pasan

#### Dependencias
- TICKET-002-FE-01

---

### TICKET-002-INT: Pruebas E2E de autorización

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 1

#### Descripción
Tests end-to-end verificando sistema completo de autorización.

#### Tareas técnicas
- [ ] Tests de escenarios:
  - TEACHER intenta acceder aula no asignada (debe fallar)
  - TEACHER accede aula asignada (debe funcionar)
  - DIRECTOR accede cualquier aula (debe funcionar)
  - Usuario sin permiso intenta exportar (debe fallar)
- [ ] Tests de seguridad:
  - Intentos de bypass de autorización
  - Manipulación de IDs en requests
- [ ] Tests de UI:
  - Botones/secciones no visibles sin permisos
- [ ] Documentación de matriz de pruebas

#### Criterios de aceptación
- Todos los escenarios de autorización funcionan
- No hay bypasses posibles
- UI respeta permisos correctamente
- Documentación completa

#### Dependencias
- TICKET-002-BE-05
- TICKET-002-FE-04

---

## Resumen de Tickets por Tipo

### Database (2 tickets)
- TICKET-001-DB: Modelo de datos de usuarios
- TICKET-002-DB: Extensión para roles y permisos

### Backend (13 tickets)
- TICKET-001-BE-01: Entidades de dominio
- TICKET-001-BE-02: UserRepository
- TICKET-001-BE-03: AuthService
- TICKET-001-BE-04: Middlewares de autenticación
- TICKET-001-BE-05: AuthController y rutas
- TICKET-002-BE-01: Sistema RBAC
- TICKET-002-BE-02: ClassRoomAssignmentRepository
- TICKET-002-BE-03: AuthorizationService
- TICKET-002-BE-04: Middlewares de autorización
- TICKET-002-BE-05: Protección de endpoints

### Frontend (11 tickets)
- TICKET-001-FE-01: State management de auth
- TICKET-001-FE-02: AuthService en Flutter
- TICKET-001-FE-03: UI de login
- TICKET-001-FE-04: Route guards
- TICKET-002-FE-01: Extension de AuthState
- TICKET-002-FE-02: Guards de permisos
- TICKET-002-FE-03: Componentes condicionales
- TICKET-002-FE-04: Filtrado de aulas

### Integration & Testing (2 tickets)
- TICKET-001-INT: Tests E2E de autenticación
- TICKET-002-INT: Tests E2E de autorización

---

## Orden de Implementación Sugerido

### Sprint 1 - Semana 1-2
1. TICKET-001-DB
2. TICKET-001-BE-01
3. TICKET-001-BE-02
4. TICKET-001-FE-01
5. TICKET-001-FE-02

### Sprint 1 - Semana 2
6. TICKET-001-BE-03
7. TICKET-001-BE-04
8. TICKET-001-BE-05
9. TICKET-001-FE-03
10. TICKET-001-FE-04

### Sprint 1 - Semana 3
11. TICKET-002-DB
12. TICKET-002-BE-01
13. TICKET-002-BE-02
14. TICKET-002-BE-03
15. TICKET-002-FE-01

### Sprint 1 - Semana 4
16. TICKET-002-BE-04
17. TICKET-002-BE-05
18. TICKET-002-FE-02
19. TICKET-002-FE-03
20. TICKET-002-FE-04

### Sprint 1 - Semana 4 (Final)
21. TICKET-001-INT
22. TICKET-002-INT

---

**Total estimación:** ~105 puntos  
**Duración estimada:** 4 semanas (1 Sprint)  
**Equipo sugerido:** 2 backend, 2 frontend, 1 QA
