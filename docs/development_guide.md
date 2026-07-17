# Development Guide — INK·LINK

Guía de configuración del entorno de desarrollo y ejecución del proyecto INK·LINK.

> ℹ️ **Estado**: la Fase 0 de `DEVELOPMENT_PLAN.md` está completada — `backend/` (.NET 10), `frontend/` (Angular 20), `docker-compose.yml` y CI existen. Las migraciones EF Core y el seed (`dotnet ef database update`, `dotnet run --seed`) se incorporan con US0001 — ver `PROJECT_STATUS.md`.
>
> 💡 `docker-compose up -d` levanta solo la infraestructura (PostgreSQL + MinIO). Para el stack completo dockerizado: `docker compose --profile full up --build`.

## Prerequisites

| Herramienta | Versión mínima | Propósito |
|---|---|---|
| .NET SDK | 10.0 | Backend API |
| Node.js | 22+ | Angular CLI y tooling frontend |
| Angular CLI | 20 | Scaffolding y dev server frontend |
| Docker + Docker Compose | latest | PostgreSQL + MinIO (Object Storage) |
| Git | 2.40+ | Control de versiones |

## Quick Start

```bash
# 1. Clonar el repositorio
git clone https://github.com/rchamycruz/AI4Devs-finalproject.git
cd AI4Devs-finalproject

# 2. Levantar infraestructura (PostgreSQL 16 + MinIO)
docker-compose up -d

# 3. Backend
cd backend
cp appsettings.Development.example.json appsettings.Development.json
dotnet restore
dotnet ef database update
dotnet run --seed   # Aplica migraciones + carga datos seed
# API disponible en http://localhost:5000

# 4. Frontend
cd ../frontend
npm install
ng serve
# App disponible en http://localhost:4200
```

## Infraestructura Local (Docker Compose)

El archivo `docker-compose.yml` en la raíz levanta:

| Servicio | Puerto | Propósito |
|---|---|---|
| PostgreSQL 16 + PostGIS | 5432 | Base de datos principal |
| MinIO | 9000 / 9001 (console) | Object Storage (imágenes portafolio) |

## Variables de Entorno

> 💳 **Credenciales de Flow (sandbox) y pruebas de pago end-to-end**: ver
> [flow-sandbox-testing.md](flow-sandbox-testing.md) — configuración segura de claves
> (user-secrets / .env, nunca en el repo), tarjetas de prueba y confirmación manual del
> webhook en local.

### Backend (`backend/appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=inklink_dev;Username=inklink;Password=<tu-password-local>"
  },
  "Jwt": {
    "Secret": "<secret-local-256-bits>",
    "Issuer": "inklink-api",
    "Audience": "inklink-web",
    "ExpirationHours": 24
  },
  "Storage": {
    "Endpoint": "localhost:9000",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin",
    "BucketName": "inklink-images"
  },
  "Flow": {
    "ApiKey": "<flow-sandbox-api-key>",
    "SecretKey": "<flow-sandbox-secret>",
    "BaseUrl": "https://sandbox.flow.cl/api",
    "ReturnUrl": "http://localhost:4200/bookings/confirm",
    "ConfirmUrl": "http://localhost:5000/api/payments/confirm"
  },
  "Platform": {
    "CommissionRate": 0.07
  }
}
```

### Frontend (`frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  mapTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};
```

## Seed de Datos

El comando `dotnet run --seed` carga datos iniciales para desarrollo:

- **Usuarios**: 3 clientes + 5 artistas con credenciales de login
- **Artistas**: Perfiles completos (bio, estilos, tarifas, ubicación en Santiago)
- **Portafolio**: 10-20 imágenes por artista (URLs a MinIO local)
- **Disponibilidad**: Agenda semanal configurada por artista
- **Certificaciones**: 3 artistas con certificación sanitaria vigente
- **Premios**: 2 artistas con reconocimientos en convenciones
- **Auspicios**: 2 artistas con marcas asociadas (ambassador/sponsored/certified)
- **Estilos**: Catálogo de 12 estilos predefinidos

## Comandos Útiles

### Backend

```bash
cd backend
dotnet build                          # Compilar
dotnet run                            # Ejecutar (puerto 5000)
dotnet run --seed                     # Ejecutar con seed de datos
dotnet ef migrations add <nombre>     # Crear migración
dotnet ef database update             # Aplicar migraciones
dotnet test                           # Ejecutar tests (xUnit)
```

### Frontend

```bash
cd frontend
ng serve                              # Dev server (puerto 4200)
ng build                              # Build producción
ng test                               # Unit tests (Karma/Jest)
ng e2e                                # E2E tests (Cypress)
ng generate component <nombre>        # Generar componente
```

### Docker

```bash
docker-compose up -d                  # Levantar infra
docker-compose down                   # Detener infra
docker-compose down -v                # Detener + eliminar volúmenes (reset BD)
```

## Estructura del Proyecto

```
AI4Devs-finalproject/
├── backend/                    # .NET Core 10 Web API
│   ├── Controllers/            # API Controllers
│   ├── Domain/                 # Entidades y lógica de dominio
│   ├── Infrastructure/         # EF Core, repositorios, servicios externos
│   ├── Migrations/             # Migraciones EF Core
│   ├── Seed/                   # Datos iniciales
│   └── Program.cs              # Entry point
├── frontend/                   # Angular 20 SPA
│   ├── src/app/
│   │   ├── core/               # Guards, interceptors, servicios base
│   │   ├── shared/             # Componentes reutilizables
│   │   ├── features/           # Módulos por funcionalidad
│   │   └── app.routes.ts       # Rutas principales
│   └── src/environments/       # Configuración por entorno
├── docs/                       # Documentación del proyecto
├── docker-compose.yml          # Infraestructura local
└── README.md                   # Descripción general
```

## Troubleshooting

| Problema | Solución |
|---|---|
| Puerto 5432 ocupado | Detener PostgreSQL local o cambiar puerto en docker-compose |
| Error de migraciones | `dotnet ef database drop` + `dotnet ef database update` |
| MinIO no accesible | Verificar que el contenedor esté corriendo: `docker ps` |
| CORS error en frontend | Verificar que backend esté en puerto 5000 y CORS configurado |
| Seed falla | Verificar que la BD esté vacía (o usar `--force-seed`) |
