# [UNLOKD-001] Setup Proyecto NestJS + MySQL + Redis con Docker

## Tipo
- [x] Feature
- [ ] Bug
- [ ] Technical Debt
- [ ] Documentation

## Épica
EPIC-1: Fundación - Autenticación y Usuarios

## Prioridad
- [x] P0 - Blocker
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low

## Sprint
Sprint 1 (06/01 - 19/01)

## Estimación
**Story Points**: 5

## Descripción

Configurar la estructura inicial del proyecto UNLOKD backend con todas las herramientas, dependencias y configuraciones base necesarias para el desarrollo del MVP. Este ticket establece la base sobre la cual se construirá todo el sistema.

Se debe crear un proyecto NestJS limpio con arquitectura modular, configurar MySQL como base de datos principal, Redis para cache/colas, y Docker para facilitar el desarrollo local y despliegue.

## Historia de Usuario Relacionada
- Base técnica para todas las HUs del Sprint 1

## Caso de Uso Relacionado
- Base técnica para todos los UCs

## Criterios de Aceptación

- [ ] Proyecto NestJS inicializado con CLI oficial (`nest new unlokd-backend`)
- [ ] Estructura de carpetas modular implementada según diseño:
  - `src/modules/` (auth, users, chats, messages, conditions, etc.)
  - `src/common/` (decorators, filters, interceptors, utils)
  - `src/config/` (configuración centralizada)
  - `src/infrastructure/` (database, redis, storage)
- [ ] TypeScript configurado con tsconfig.json estricto
- [ ] ESLint y Prettier configurados para mantener código limpio
- [ ] Prisma ORM instalado y configurado para MySQL
- [ ] Redis configurado con cliente `ioredis`
- [ ] Docker Compose creado con servicios:
  - Backend NestJS (puerto 3000)
  - MySQL 8.0 (puerto 3306)
  - Redis 7 (puerto 6379)
- [ ] Variables de entorno configuradas con `.env.example`
- [ ] Scripts package.json para desarrollo:
  - `npm run start:dev` (desarrollo con hot reload)
  - `npm run build` (compilación producción)
  - `npm run docker:up` (levantar servicios)
  - `npm run docker:down` (detener servicios)
- [ ] Endpoint de health check `/health` implementado
- [ ] README.md con instrucciones de instalación y ejecución
- [ ] Documentación actualizada

## Tareas Técnicas

- [ ] Inicializar proyecto con NestJS CLI
- [ ] Crear estructura de carpetas modular
- [ ] Instalar dependencias principales:
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
  - `@nestjs/config` para variables entorno
  - `@nestjs/swagger` para documentación API
  - `@prisma/client` y `prisma` para ORM
  - `ioredis` para Redis
  - `class-validator`, `class-transformer` para validaciones
  - `bcrypt` para hash de contraseñas
  - `@nestjs/jwt`, `@nestjs/passport` para auth
- [ ] Configurar Prisma con MySQL:
  - Crear `prisma/schema.prisma`
  - Configurar conexión a MySQL
- [ ] Crear Dockerfile para backend
- [ ] Crear docker-compose.yml con MySQL, Redis y backend
- [ ] Configurar módulo de configuración (`ConfigModule`)
- [ ] Crear endpoint `/health` que retorne status del sistema
- [ ] Crear `.env.example` con todas las variables necesarias
- [ ] Escribir README.md con instrucciones claras
- [ ] Configurar `.gitignore` apropiado
- [ ] Configurar EditorConfig para consistencia entre IDEs

## Dependencias
- Ninguna (primer ticket del proyecto)

## Definición de Done (DoD)

- [x] Código implementado y funcional
- [x] Proyecto levanta correctamente con `docker-compose up`
- [x] Endpoint `/health` responde 200 OK
- [x] MySQL y Redis accesibles desde backend
- [x] Sin linter errors
- [x] README.md actualizado con instrucciones
- [x] `.env.example` documentado
- [x] Code review aprobado por 1+ reviewer

## Consideraciones Técnicas

### Módulos NestJS
- `app.module.ts` (módulo raíz)
- `config.module.ts` (configuración global)

### Endpoints API
- GET `/health` → `{status: "ok", timestamp: "...", services: {db: "ok", redis: "ok"}}`

### Docker Compose (servicios)
```yaml
services:
  backend:
    build: .
    ports: ["3000:3000"]
    depends_on: [mysql, redis]
  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: unlokd2025
      MYSQL_DATABASE: unlokd_db
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

### Variables de Entorno (.env.example)
```
NODE_ENV=development
PORT=3000

DATABASE_URL="mysql://root:unlokd2025@localhost:3306/unlokd_db"

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
```

### Principios SOLID
- **SRP**: Cada módulo tiene una responsabilidad clara
- **DIP**: Usar inyección de dependencias de NestJS

### Patrones de Diseño
- Module Pattern (NestJS modules)
- Dependency Injection

## Notas

- Usar versiones LTS de Node.js (v20+)
- MySQL 8.0 para compatibilidad con Prisma
- Redis 7 para mejor performance
- Considerar usar `docker-compose.dev.yml` para desarrollo y `docker-compose.prod.yml` para producción
- Documentar cualquier problema encontrado durante el setup

## Labels
`setup`, `infra`, `docker`, `nestjs`, `sprint-1`, `p0-blocker`

## Tiempo Real Invertido
(Actualizar durante desarrollo)

## Enlaces/Referencias
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

