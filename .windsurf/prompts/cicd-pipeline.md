## T01 – CI Pipeline (Continuous Integration)
**Tipo:** DevOps / Fundacional  
**Objetivo:** Implementar pipeline automatizado de integración continua que valide código, ejecute tests, análisis estático y genere artefactos (imágenes Docker) listos para despliegue.  
**Motivación:** Proveer feedback rápido sobre calidad del código y generar artefactos versionados para cada cambio, habilitando entregas incrementales seguras.

### Context
- In this repository there are 2 submodules: `backend` and `frontend`.
- Information about the frontend project is in the file `frontend/README.md`.
- The backend project is a Spring Boot application built with Java 21 and Gradle.
- The frontend project is a React application built with TypeScript and Vite.
- The backend project uses Flyway for database migrations.
- The container registry is ECR in AWS.
- The CI pipeline will be implemented using GitHub Actions.
- The pipeline must support both PR validation and main branch builds.

### Alcance IN
- **GitHub Actions Workflow** (`.github/workflows/ci.yml`) con stages:
  - Checkout código
  - Setup de entornos (Java 21, Node.js 18+)
  - Cache de dependencias (Gradle, npm)
  - Build backend (Gradle)
  - Build frontend (Vite)
  - Lint backend (detekt/ktlint)
  - Lint frontend (ESLint)
  - Tests unitarios backend (JUnit)
  - Tests unitarios frontend (Vitest)
  - Análisis estático (opcional: SonarCloud o similar)
  - Build imagen Docker multi-stage
  - Publicación imagen en ECR (solo en `main`)
- **Tagging strategy**: `semver` + `commit-sha` para imágenes
- **Dockerfile** multi-stage optimizado (backend + frontend static)
- **Matrix strategy** para ejecutar jobs en paralelo cuando sea posible
- Badge de estado CI en README principal

### Alcance OUT
- Despliegue a entornos (cubierto en T02)
- Ejecución de migraciones (cubierto en T02)
- Infraestructura local con docker-compose (cubierto en T02)
- Tests E2E (Playwright) - se agregarán en futuro
- Observabilidad y métricas avanzadas

### Dependencias
Ninguna (primero en ejecutar).

### Entregables
- `.github/workflows/ci.yml` - Workflow de GitHub Actions
- `Dockerfile` - Imagen multi-stage para backend y frontend
- `.dockerignore` - Optimización de contexto Docker
- Documentación en README raíz:
  - Explicación del pipeline CI
  - Badges de estado
  - Requisitos para contribuir (pasar CI)

### Criterios de Aceptación (CA)
1. **PR Validation**: Commit a PR dispara pipeline completo y muestra resultado en <10 min.
2. **Build Verification**: Pipeline falla si hay errores de compilación en backend o frontend.
3. **Quality Gates**: Pipeline falla si hay errores de lint o tests fallidos.
4. **Image Creation**: En branch `main`, se genera y publica imagen Docker en ECR con tags correctos.
5. **Parallel Execution**: Jobs independientes (backend/frontend) se ejecutan en paralelo.
6. **Cache Effectiveness**: Builds subsecuentes con cache son al menos 30% más rápidos.
7. **Status Visibility**: Badge de CI en README muestra estado actual del pipeline.

### DoD
- Todos los CA verificados con PRs de prueba.
- Pipeline ejecutado exitosamente al menos 3 veces.
- Sin secretos hardcodeados (usar GitHub Secrets).
- Documentación completa en README.

### Riesgos y Mitigación
| Riesgo | Mitigación |
|--------|------------|
| Tiempos largos de build | Implementar cache agresivo de Gradle y node_modules. Usar matrix para paralelizar. |
| Fallo en publicación a ECR | Validar credenciales AWS en secrets. Implementar retry logic. |
| Límites de GitHub Actions | Monitorear uso de minutos. Optimizar jobs para reducir tiempo. |
| Diferencias entre entorno CI y local | Documentar versiones exactas de herramientas (Java, Node). |

### Métricas
- Tiempo medio de pipeline: < 10 min
- Tasa de éxito: >= 95% tras primera semana
- Tiempo de feedback en PR: < 5 min para primeros checks
- Reducción de tiempo con cache: >= 30%

---

## T02 – CD Pipeline (Continuous Deployment)
**Tipo:** DevOps / Fundacional  
**Objetivo:** Implementar pipeline automatizado de despliegue continuo a producción, gestión de migraciones de base de datos y entorno de desarrollo local.  
**Motivación:** Automatizar el despliegue a producción tras validación exitosa, asegurando consistencia entre entornos y habilitando desarrollo local eficiente.

### Context
- This ticket depends on T01 (CI Pipeline) being completed.
- Docker images are published to ECR by the CI pipeline.
- **Assumes AWS infrastructure already exists** (EC2, RDS, ECR) - can be provisioned manually or via T03.
- The runtime environment is an EC2 instance in AWS.
- The database is RDS PostgreSQL in AWS.
- The backend uses Flyway for database migrations.
- Deployment will be triggered automatically on merge to `main`.
- Local development requires PostgreSQL database.

### Alcance IN
- **GitHub Actions Workflow** (`.github/workflows/cd.yml`) para deployment:
  - Trigger automático en merge a `main` (tras CI exitoso)
  - Conexión segura a EC2 (SSH o AWS Systems Manager)
  - Pull de imagen desde ECR
  - Ejecución de migraciones Flyway (fail-fast)
  - Despliegue de contenedores (rolling update)
  - Health check post-deployment
  - Rollback automático si falla health check
- **docker-compose.yml** para desarrollo local:
  - Servicio backend (Spring Boot)
  - Servicio frontend (Vite dev server o static serve)
  - Servicio PostgreSQL
  - Ejecución automática de migraciones en startup
  - Volúmenes para persistencia de datos
  - Network configuration
- **Secrets Management**:
  - GitHub Secrets para credenciales AWS, DB, etc.
  - Variables de entorno documentadas
  - Template `.env.example` para desarrollo local
- **Documentación**:
  - README sección "Ejecutar local" con comandos docker-compose
  - Guía de deployment manual (fallback)
  - Troubleshooting común

### Alcance OUT
- Provisión de infraestructura AWS (cubierto en T03 - Terraform)
- Autoscaling y load balancing (futuro)
- Múltiples entornos (staging, QA) - solo production por ahora
- Observabilidad avanzada (solo logging básico)
- Blue-green deployment o canary releases

### Dependencias
- **T01 (CI Pipeline)**: Requiere imágenes Docker publicadas en ECR.
- **Infraestructura AWS**: EC2, RDS, ECR deben estar configurados previamente (manual o vía T03).

### Entregables
- `.github/workflows/cd.yml` - Workflow de deployment
- `docker-compose.yml` - Entorno local completo
- `.env.example` - Template de variables de entorno
- `scripts/deploy.sh` - Script de deployment (usado por CD y manual)
- `scripts/rollback.sh` - Script de rollback manual
- Documentación en README:
  - Comandos para ejecutar local
  - Proceso de deployment
  - Gestión de migraciones
  - Troubleshooting

### Criterios de Aceptación (CA)
1. **Automated Deployment**: Merge a `main` despliega automáticamente a production tras CI exitoso.
2. **Migration Safety**: Paso de migraciones falla el despliegue si hay error (fail-fast).
3. **Health Verification**: Deployment verifica que la aplicación responde correctamente post-deploy.
4. **Local Environment**: Ejecutar `docker compose up` levanta todos los servicios y backend arranca aplicando migraciones.
5. **Version Tracking**: Logs muestran versión (commit SHA) al iniciar backend en production y local.
6. **Rollback Capability**: Script de rollback puede revertir a versión anterior en <5 min.
7. **Zero Downtime**: Deployment no causa downtime perceptible (>5s).
8. **Secrets Security**: Todas las credenciales gestionadas vía GitHub Secrets, ninguna en código.

### DoD
- Todos los CA verificados con deployment real a production.
- Deployment exitoso ejecutado al menos 2 veces.
- Rollback probado exitosamente.
- Entorno local funcional en al menos 2 máquinas diferentes.
- Sin secretos hardcodeados en ningún archivo.
- Documentación completa y validada.
- Code review aprobado.

### Riesgos y Mitigación
| Riesgo | Mitigación |
|--------|------------|
| Migraciones destructivas inadvertidas | Revisiones obligatorias en PR. Estrategia "fail-fast" Flyway. Backups automáticos RDS. |
| Downtime durante deployment | Implementar health checks. Rolling update strategy. |
| Fallo en conexión a EC2/RDS | Validar conectividad en step temprano. Implementar retry logic. |
| Secrets expuestos | Usar GitHub Secrets. Auditar código regularmente. Pre-commit hooks. |
| Diferencias local vs production | Documentar versiones exactas. Usar mismas imágenes Docker cuando sea posible. |

### Métricas
- Tiempo de deployment: < 5 min desde merge hasta production live
- Tasa de éxito deployment: >= 95%
- Tiempo de rollback: < 5 min
- Downtime por deployment: 0 segundos (objetivo)
- Tiempo setup entorno local: < 10 min para nuevo developer

---

## T03 – Infrastructure as Code (Terraform)
**Tipo:** DevOps / Infraestructura  
**Objetivo:** Automatizar la provisión y gestión de toda la infraestructura AWS mediante Terraform, eliminando configuración manual y permitiendo reproducibilidad de entornos.  
**Motivación:** Infraestructura versionada, reproducible y auditable. Facilita creación de múltiples entornos (staging, production) y disaster recovery.

### Context
- This ticket can be worked on in parallel with T02 or after.
- Currently infrastructure (EC2, RDS, ECR, VPC, Security Groups) is provisioned manually.
- The application requires: EC2 instance, RDS PostgreSQL, ECR registry, VPC with subnets, Security Groups, IAM roles.
- Terraform state will be stored remotely (S3 + DynamoDB for locking).
- Infrastructure should support the deployment pipeline from T02.

### Alcance IN
- **Terraform modules** para provisionar:
  - **VPC**: Subnets públicas y privadas, Internet Gateway, NAT Gateway, Route Tables
  - **Security Groups**: Reglas para EC2, RDS, ALB (si aplica)
  - **ECR**: Container registry con políticas de lifecycle
  - **RDS PostgreSQL**: Instancia con backups automáticos, encryption at rest
  - **EC2**: Instancia para aplicación con IAM role, user data para Docker
  - **IAM**: Roles y policies para EC2 (acceso a ECR, RDS, Secrets Manager)
  - **Secrets Manager** (opcional): Para credenciales de DB
  - **S3 + DynamoDB**: Para Terraform remote state y locking
- **Terraform workspaces** o directorios separados para múltiples entornos (production, staging)
- **Variables y outputs** bien definidos
- **Documentación**:
  - README con instrucciones de uso de Terraform
  - Guía de provisión de nuevo entorno
  - Diagrama de arquitectura AWS actualizado
- **Validación**: `terraform validate`, `terraform plan` en CI

### Alcance OUT
- Kubernetes / EKS (futuro - actualmente EC2 simple)
- CloudFront / CDN (futuro)
- Route53 / DNS management (futuro)
- Multi-region setup (futuro)
- Auto Scaling Groups (futuro - actualmente single EC2)
- Application Load Balancer (futuro - actualmente single instance)

### Dependencias
- **Ninguna técnica**, pero idealmente se ejecuta antes o en paralelo con T02.
- Requiere credenciales AWS con permisos suficientes para provisionar recursos.

### Entregables
- `terraform/` directory con estructura:
  - `main.tf` - Configuración principal
  - `variables.tf` - Variables de entrada
  - `outputs.tf` - Outputs (IPs, endpoints, etc.)
  - `backend.tf` - Configuración de remote state
  - `modules/` - Módulos reutilizables (vpc, ec2, rds, etc.)
  - `environments/` - Configuraciones por entorno
- `.github/workflows/terraform-validate.yml` - Validación de Terraform en CI
- Documentación en `docs/infrastructure/`:
  - Guía de uso de Terraform
  - Diagrama de arquitectura AWS
  - Procedimiento de disaster recovery
- `terraform.tfvars.example` - Template de variables

### Criterios de Aceptación (CA)
1. **Reproducible Provisioning**: Ejecutar `terraform apply` crea toda la infraestructura necesaria desde cero.
2. **Idempotency**: Ejecutar `terraform apply` múltiples veces sin cambios no modifica infraestructura.
3. **State Management**: Terraform state almacenado remotamente en S3 con locking en DynamoDB.
4. **Multiple Environments**: Puede provisionar entornos independientes (production, staging) con misma configuración.
5. **Security**: RDS en subnet privada, EC2 con security groups restrictivos, secrets no hardcodeados.
6. **Outputs**: Terraform outputs proveen toda la información necesaria para T02 (EC2 IP, RDS endpoint, ECR URL).
7. **CI Validation**: PRs con cambios en Terraform ejecutan `terraform validate` y `terraform plan`.
8. **Documentation**: README con instrucciones claras permite a otro developer provisionar entorno.

### DoD
- Todos los CA verificados.
- Infraestructura de production provisionada exitosamente con Terraform.
- Al menos un entorno adicional (staging o dev) provisionado para validar reproducibilidad.
- `terraform plan` no muestra cambios inesperados en infraestructura existente.
- Documentación completa y validada.
- Code review aprobado.
- Diagrama de arquitectura actualizado en `docs/`.

### Riesgos y Mitigación

| Riesgo | Mitigación |
|--------|------------|
| Destrucción accidental de recursos | Habilitar `prevent_destroy` en recursos críticos. Usar `terraform plan` siempre antes de `apply`. |
| State file corruption | Remote state en S3 con versioning habilitado. Backups regulares. |
| Drift entre Terraform y realidad | Ejecutar `terraform plan` regularmente. Evitar cambios manuales en AWS Console. |
| Costos inesperados | Usar `terraform cost` (Infracost). Definir budgets en AWS. |
| Permisos insuficientes | Documentar permisos IAM necesarios. Validar antes de ejecutar. |

### Métricas
- Tiempo de provisión de entorno completo: < 20 min
- Drift detection: 0 cambios no gestionados por Terraform
- Tasa de éxito de `terraform apply`: >= 95%
- Tiempo de disaster recovery (recrear infra): < 30 min