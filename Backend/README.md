# TravelSplit Backend

Backend API REST para la gestión de gastos de viaje en grupo, construido con NestJS.

## Arquitectura

Este proyecto sigue una **Arquitectura en Capas (Layered Architecture)** con el patrón **Controller-Service-Repository (CSR)**:

- **Controllers**: Manejan las peticiones HTTP y validaciones de entrada
- **Services**: Contienen la lógica de negocio
- **Repositories**: Gestionan el acceso a datos y consultas a la base de datos

### Regla de Oro

> El Controlador NUNCA debe acceder directamente a la base de datos. Debe pasar siempre por el Servicio, y el Servicio debe usar el Repositorio para acceder a los datos.

## Estructura del Proyecto

```
Backend/
├── src/
│   ├── modules/           # Módulos de negocio (auth, trips, expenses, balances)
│   │   └── [module]/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       └── dto/
│   ├── migrations/        # Migraciones de base de datos (TypeORM)
│   ├── common/            # Código compartido
│   │   ├── decorators/
│   │   ├── filters/      # Exception filters
│   │   ├── interceptors/
│   │   └── entities/     # Entidades base (BaseEntity con Soft Delete)
│   ├── config/           # Configuraciones
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── main.ts           # Punto de entrada
│   └── app.module.ts     # Módulo raíz
├── test/                 # Tests
├── docker-compose.yml    # PostgreSQL local
└── .env.example          # Variables de entorno de ejemplo
```

## Características

- ✅ **NestJS v11.x** con TypeScript estricto
- ✅ **TypeORM v0.3.x** con PostgreSQL
- ✅ **Soft Delete Global** mediante `BaseEntity` con `deleted_at`
- ✅ **Validación de DTOs** con `class-validator` y `class-transformer`
- ✅ **Swagger/OpenAPI** documentación automática en `/api/docs`
- ✅ **Manejo global de errores** con filtros de excepciones
- ✅ **Variables de entorno** con `@nestjs/config`

## Requisitos Previos

- Node.js v22.x (Active LTS)
- npm o yarn
- Docker y Docker Compose (para PostgreSQL local)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. Iniciar PostgreSQL con Docker:
```bash
docker-compose up -d
```

4. Ejecutar la aplicación:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Variables de Entorno

Ver `.env.example` para la lista completa de variables. Las principales son:

- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno de ejecución (development/production)
- `DB_HOST`: Host de PostgreSQL
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_USERNAME`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `DB_NAME`: Nombre de la base de datos
- `DB_SYNCHRONIZE`: Sincroniza el esquema automáticamente (default: false). Solo habilitar explícitamente en desarrollo local (`DB_SYNCHRONIZE=true`); en staging/producción usar migraciones.

## Endpoints

- **Health Check**: `GET /api/health`
- **Swagger Docs**: `GET /api/docs`

## Soft Delete

Todas las entidades deben extender `BaseEntity` para heredar automáticamente:
- `id` (UUID)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `deletedAt` (timestamp, nullable) - Soft Delete

TypeORM automáticamente excluye registros con `deleted_at IS NOT NULL` en las consultas.

## Migraciones de Base de Datos

Las migraciones de TypeORM están ubicadas en `src/migrations/`. Para más información sobre cómo ejecutar y crear migraciones, consulta [src/migrations/README.md](src/migrations/README.md).

**Comandos rápidos:**
```bash
# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show

# Generar nueva migración
npm run migration:generate -- src/migrations/NombreDeLaMigracion
```

## Scripts Disponibles

- `npm run start` - Inicia la aplicación
- `npm run start:dev` - Inicia en modo desarrollo con hot-reload
- `npm run build` - Compila el proyecto
- `npm run test` - Ejecuta los tests unitarios
- `npm run test:e2e` - Ejecuta los tests end-to-end
- `npm run lint` - Ejecuta el linter

## Licencia

UNLICENSED
