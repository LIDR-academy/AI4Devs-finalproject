# Plan de Implementación: BACK-001 (Autenticación y Registro)

**Estado:** Completado

## Objetivo
Implementar la lógica de negocio, persistencia y exposición HTTP para el registro e inicio de sesión de usuarios, siguiendo los principios de **Clean Architecture** y **TDD**.

## Arquitectura y Estructura de Directorios

Se adoptará una estructura de Clean Architecture dentro de `apps/backend/src`. 

*Nota sobre `packages/kernel`: Actualmente la carpeta `packages` está vacía. Para esta iteración, definiremos los DTOs y Entidades en el backend. En un futuro refactor, si estos contratos se comparten con el frontend, se migrarán a un paquete compartido `@trace/kernel`.*

```text
apps/backend/src/
├── domain/                  # Capa de Dominio (Empresarial/Negocio puro)
│   ├── entities/            # Entidades de dominio (User)
│   ├── repositories/        # Interfaces de repositorios (IUserRepository)
│   ├── dtos/                # Data Transfer Objects (RegisterDto, LoginDto)
│   └── errors/              # Errores de dominio (UserAlreadyExists, etc.)
├── application/             # Capa de Aplicación (Casos de uso)
│   └── use-cases/           # (RegisterUserUseCase, LoginUserUseCase)
├── infrastructure/          # Capa de Infraestructura (Implementaciones)
│   ├── database/
│   │   └── repositories/    # Implementación Prisma (PrismaUserRepository)
│   ├── security/            # Servicios de Hashing (Bcrypt) y Token (JWT)
│   └── web/                 # (Opcional: adaptadores web si se separan de interfaces)
└── interfaces/              # Capa de Presentación (Entrada)
    └── http/
        ├── controllers/     # (AuthController)
        ├── routes/          # (auth.routes.ts)
        └── middlewares/     # (auth.middleware.ts)
```

## Plan de Trabajo TDD (Test-Driven Development)

### Fase 1: Setup y Test de Integración (RED)
Crear un test de integración que falle ("Red") describiendo el comportamiento esperado de la API.
1.  **Archivo:** `apps/backend/tests/integration/auth.spec.ts`
2.  **Casos de prueba:**
    *   `POST /api/auth/register` -> 201 Created (Datos válidos).
    *   `POST /api/auth/register` -> 409 Conflict (Email duplicado).
    *   `POST /api/auth/login` -> 200 OK + JWT (Credenciales correctas).
    *   `POST /api/auth/login` -> 401 Unauthorized (Credenciales incorrectas).

### Fase 2: Capa de Dominio
Definir los contratos y objetos básicos. Código puro TypeScript sin dependencias externas (excepto quizás `zod` para validación si se decide usar en DTOs, o primitivos).
1.  **Entidad:** `User` (src/domain/entities/user.entity.ts).
2.  **DTOs:** `RegisterUserDto`, `LoginUserDto` (src/domain/dtos/).
3.  **Interface Repositorio:** `IUserRepository` (src/domain/repositories/user.repository.ts). Métodos: `findByEmail`, `save`.

### Fase 3: Capa de Infraestructura (Persistencia)
Implementar el repositorio real conectado a la DB.
1.  **Implementación:** `PrismaUserRepository` implementa `IUserRepository`.
2.  **Tests Unitarios (Opcional pero recomendado):** Mockear Prisma para probar el repositorio aisladamente.

### Fase 4: Capa de Aplicación (Casos de Uso)
Implementar la lógica orquestadora.
1.  **Servicios/UseCases:**
    *   `RegisterUserUseCase`: Recibe DTO, valida reglas de negocio (hash password), llama a repo.
    *   `LoginUserUseCase`: Recibe DTO, busca usuario, verifica password, genera JWT.
2.  **Dependencias:** Inyección de dependencias (DI) manual o simple para el repositorio y servicios de seguridad (`HashService`, `TokenService`).

### Fase 5: Capa de Presentación (API) y "GREEN"
Conectar todo para que el test de integración pase.
1.  **Controller:** `AuthController` recibe UseCases e invoca métodos.
2.  **Rutas:** Definir rutas en `auth.routes.ts`.
3.  **Verificación:** Ejecutar `npm test` y asegurar que todos los tests pasan.

### Fase 6: Refactor
1.  Limpiar código.
2.  Asegurar manejo de errores consistente (Middleware de errores).
3.  Verificar que no haya fugas de lógica de infraestructura en dominio.
4.  Revisar si los DTOs pueden moverse a `packages/kernel` (si se inicializa el monorepo).
