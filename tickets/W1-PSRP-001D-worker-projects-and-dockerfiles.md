## PSRP-001D: chore(infra): worker-projects-and-dockerfiles

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** XS (0.5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001A, PSRP-001B, PSRP-001C

## Resumen de Funcionalidad

Crear los 3 proyectos worker (Email, WhatsApp, SSG) como BackgroundService mínimos de .NET 10 y los 6 Dockerfiles multi-stage para todos los servicios desplegables. Una vez mergeado, las imágenes Docker están listas para los manifiestos K8s de PSRP-001E.

## Requisitos

- [ ] Crear `backend/workers/Aura.Workers.Email/` con .csproj (net10.0, referencia Core + Infrastructure) y Program.cs (BackgroundService mínimo)
- [ ] Crear `backend/workers/Aura.Workers.WhatsApp/` con .csproj y Program.cs (BackgroundService mínimo)
- [ ] Crear `backend/workers/Aura.Workers.SSG/` con .csproj y Program.cs (BackgroundService mínimo)
- [ ] Crear `backend/src/Aura.Api/Dockerfile` (multi-stage: sdk:10.0 build → aspnet:10.0 runtime)
- [ ] Crear `backend/workers/Aura.Workers.Email/Dockerfile` (mismo patrón)
- [ ] Crear `backend/workers/Aura.Workers.WhatsApp/Dockerfile` (mismo patrón)
- [ ] Crear `backend/workers/Aura.Workers.SSG/Dockerfile` (mismo patrón)
- [ ] Crear `frontend/Dockerfile` (multi-stage: node:22-alpine build → nginx:alpine serve)
- [ ] Añadir job `docker-build` al CI: matrix 5 servicios, GHCR login, push con tags git SHA + latest

## Notas Técnicas

- **Workers:** Son placeholders — BackgroundService que loggea "Worker started". La lógica real viene en PSRP-010, PSRP-012, PSRP-015.
- **Dockerfiles .NET:** Stage 1: `mcr.microsoft.com/dotnet/sdk:10.0` (build), Stage 2: `mcr.microsoft.com/dotnet/aspnet:10.0` (runtime).
- **Dockerfile Frontend:** Stage 1: `node:22-alpine` (npm ci + ng build), Stage 2: `nginx:alpine` (serve dist/ con nginx.conf).
- **GHCR:** Imágenes como `ghcr.io/pedrosrp/aura-{service}:{git-sha}` y `:latest`.
- **Sin docker-compose.yml:** K8s es el target desde día 1.

## Criterios de Aceptación

- [ ] AC1: Dado los proyectos worker, cuando se ejecuta `dotnet build` para cada uno, entonces se construyen sin errores
- [ ] AC2: Dado cada Dockerfile, cuando se ejecuta `docker build`, entonces la imagen se construye sin errores
- [ ] AC3: Dado un push a main, cuando el CI corre, entonces el job `docker-build` construye y pushea las 6 imágenes a GHCR exitosamente

## Elementos Relacionados

- **Architecture:** 02-components.md (Worker deployments), 04-infrastructure-deployment.md (container registry)

## Bloqueadores

Bloqueado por: PSRP-001B, PSRP-001C

## Branch Name

`feature/PSRP-001D-dockerfiles`
