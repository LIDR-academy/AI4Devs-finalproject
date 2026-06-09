## PSRP-001: chore(infra): project-scaffolding

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** None

## Resumen de Funcionalidad
Configurar el esqueleto completo del proyecto incluyendo estructura de solución .NET 10, workspace Angular 22, Dockerfiles para todos los servicios, manifiestos base de Kubernetes con Kustomize, y pipeline CI/CD de GitHub Actions. Esta es la foundation en la que se basan todos los demás tickets.

## Requisitos
- [ ] Crear solución .NET 10 con proyectos: Aura.Api, Aura.Core, Aura.Infrastructure, Aura.Workers.Email, Aura.Workers.WhatsApp, Aura.Workers.SSG
- [ ] Crear workspace Angular 22 con standalone components, signals, y strict mode habilitado
- [ ] Crear Dockerfiles para los 5 proyectos .NET (multi-stage builds) y Angular frontend (nginx)
- [ ] Crear manifiestos base de Kubernetes: namespace, API deployment, 3 worker deployments, PostgreSQL StatefulSet, Dragonfly StatefulSet, MinIO StatefulSet, frontend deployment
- [ ] Crear overlays Kustomize para local (Rancher Desktop) y producción environments
- [ ] Crear workflow de GitHub Actions para build, test, Docker image push a GHCR, y kubectl apply
- [ ] Configurar environment variables y estructura de appsettings.json para todos los servicios
- [ ] Configurar .editorconfig, .gitignore, y reglas de formateo de código

## Notas Técnicas
- **Backend:** Solution file en `backend/AuraPlanning.sln`. Los proyectos siguen Clean Architecture: Api (presentation), Core (domain/application), Infrastructure (data access, external services), Workers (separate entry points)
- **Frontend:** Angular workspace en `frontend/` con `src/app/core/`, `src/app/features/`, `src/app/shared/`
- **Database:** PostgreSQL 16 StatefulSet con PVC, connection string en K8s Secret
- **Integrations:** Dragonfly (Redis-compatible) para queue/cache, MinIO para object storage
- **Key files:**
  - `backend/AuraPlanning.sln`
  - `backend/src/Aura.Api/Program.cs`
  - `backend/src/Aura.Core/Aura.Core.csproj`
  - `backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj`
  - `backend/workers/Aura.Workers.*/Program.cs`
  - `frontend/angular.json`
  - `frontend/package.json`
  - `k8s/base/kustomization.yaml`
  - `k8s/overlays/local/kustomization.yaml`
  - `k8s/overlays/production/kustomization.yaml`
  - `.github/workflows/build-and-test.yml`
  - `Dockerfile` files en cada project root

## Criterios de Aceptación
- [ ] AC1: Dado que el repositorio está clonado, cuando se ejecuta `dotnet build backend/AuraPlanning.sln`, entonces todos los 5 proyectos .NET se construyen exitosamente sin errores
- [ ] AC2: Dado el directorio frontend, cuando se ejecuta `npm install && npm run build`, entonces Angular se construye exitosamente sin errores
- [ ] AC3: Dado que Docker está instalado, cuando se ejecuta `docker build` para cada servicio, entonces todas las 6 imágenes Docker (5 .NET + 1 Angular) se construyen exitosamente
- [ ] AC4: Dado que el cluster de Kubernetes está corriendo, cuando se ejecuta `kubectl apply -k k8s/overlays/local`, entonces todos los pods inician y alcanzan estado Ready
- [ ] AC5: Dado un push a la rama main, cuando el workflow de GitHub Actions corre, entonces los pasos de build, test, y Docker push completan exitosamente

## Elementos Relacionados
- **PRD section:** 07-work-breakdown.md (Infrastructure/DevOps)
- **Architecture:** 03-project-structure.md, 04-infrastructure-deployment.md
- **Data model:** N/A (no entities aún)

## Bloqueadores
Ninguno

## Branch Name
`feature/PSRP-001-project-scaffolding`