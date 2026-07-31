# Feature Specification: Infraestructura Local, Configuración por Ambiente y CI/CD

**Feature Branch**: `004-infraestructura-config-cicd`

**Created**: 2026-07-28

**Status**: Draft

**Input**: EPIC-01 / TKT-004 + TKT-006 + TKT-007 — Infraestructura local (Docker Compose con SQL Server y Redis), configuración por ambiente y gestión de secrets, y pipeline CI/CD en Azure DevOps (DEV → QAS → STG → PRD).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entorno local reproducible con un comando (Priority: P1) 🎯 MVP

Como desarrollador, quiero levantar todo el entorno local (los 3 microservicios + SQL Server + Redis) con un solo comando, para desarrollar y probar de forma reproducible sin instalar dependencias manualmente.

**Why this priority**: Sin un entorno local ejecutable, el desarrollo y las pruebas de integración de todas las demás features se ralentizan. Es el habilitador operativo inmediato.

**Independent Test**: Ejecutar el arranque del entorno y verificar que los 3 servicios y las dependencias (SQL Server, Redis) quedan disponibles y sus health checks responden 200 en menos de 3 minutos.

**Acceptance Scenarios**:

1. **Given** un clon del repositorio con el archivo de variables local configurado, **When** se levanta el entorno, **Then** los 3 microservicios, SQL Server y Redis arrancan y sus health checks responden 200 en < 3 minutos.
2. **Given** el entorno levantado, **When** se consultan los health checks de los 3 servicios, **Then** todos responden 200.
3. **Given** los archivos versionados, **When** se inspeccionan, **Then** no contienen secretos; el archivo de ejemplo de variables documenta todas las requeridas sin valores reales.

---

### User Story 2 - Configuración por ambiente sin secretos en el código (Priority: P1)

Como responsable de operaciones, quiero que cada microservicio se configure por perfil de ambiente (local, DEV, QAS, STG, PRD) y que todo valor sensible provenga de variables de entorno, para desplegar de forma segura y trazable en los cuatro ambientes de la CCB.

**Why this priority**: La constitución prohíbe secretos en texto claro (Principio VII) y exige configuración parametrizable por ambiente; es prerequisito de cualquier despliegue.

**Independent Test**: Arrancar cada servicio en el perfil local con solo el archivo de variables, y verificar que las propiedades sensibles se resuelven por variables de entorno y que ningún secreto está hardcodeado.

**Acceptance Scenarios**:

1. **Given** el perfil local y el archivo de variables, **When** arrancan los 3 servicios, **Then** cargan sin errores usando exclusivamente variables de entorno para valores sensibles.
2. **Given** los perfiles por ambiente, **When** se activa `dev`, `qas`, `stg` o `prd`, **Then** cada uno apunta inequívocamente a los servicios y niveles de log de su ambiente (p. ej. `prd` con log `WARN` y sin detalles en health).
3. **Given** el código y la configuración versionados, **When** se busca por credenciales/secretos, **Then** no se encuentra ningún valor sensible en texto claro.

---

### User Story 3 - Pipeline CI/CD automatizado en Azure DevOps (Priority: P2)

Como equipo de ingeniería, quiero un pipeline de CI/CD en Azure DevOps que compile, pruebe, analice y despliegue automáticamente hacia DEV y QAS y, con aprobación, hacia STG y PRD, para que ninguna compilación o despliegue sea manual y se garanticen los quality gates.

**Why this priority**: Formaliza la entrega y protege la calidad (cobertura, seguridad, arquitectura). Depende de que exista el entorno (US1) y la configuración por ambiente (US2).

**Independent Test**: Abrir un PR y verificar que el pipeline de CI ejecuta compilación, pruebas con gate de cobertura, análisis de seguridad y build de imágenes; y que el merge a la rama de integración dispara el despliegue automático a DEV y luego QAS.

**Acceptance Scenarios**:

1. **Given** un PR hacia una rama protegida, **When** se ejecuta el pipeline de CI, **Then** compila, corre pruebas (con gate de cobertura ≥ 80% en `*-domain`/`*-application`), análisis de seguridad y construcción de imágenes; y el PR no puede fusionarse sin CI en verde.
2. **Given** un merge a la rama de integración, **When** el CI es exitoso, **Then** se despliega automáticamente a DEV y, tras éxito, a QAS, con smoke test de health y rollback automático si falla.
3. **Given** la rama de producción, **When** se solicita el despliegue a STG y PRD, **Then** requiere aprobación manual (STG un aprobador; PRD doble aprobación), despliega sin downtime (una instancia a la vez) y hace rollback si el smoke test falla.

---

### Edge Cases

- ¿Qué ocurre si el smoke test post-deploy falla en cualquier ambiente? → Se ejecuta rollback automático a la versión anterior.
- ¿Qué ocurre si la cobertura cae por debajo del 80% en `*-domain`/`*-application`? → El pipeline de CI falla y bloquea el avance.
- ¿Qué ocurre si el análisis de seguridad detecta una vulnerabilidad crítica? → El pipeline falla en la etapa correspondiente.
- ¿Qué ocurre si falta una variable de entorno requerida al arrancar un perfil? → El servicio no arranca y reporta claramente la propiedad faltante.
- ¿Qué ocurre con la aprobación de PRD si nadie aprueba? → El despliegue espera hasta el timeout definido y luego expira sin desplegar.

## Requirements *(mandatory)*

### Functional Requirements

**Infraestructura local (TKT-004)**

- **FR-001**: El repositorio MUST proveer una imagen contenedorizada por microservicio, con parámetros de JVM apropiados por servicio y perfil de ejecución.
- **FR-002**: El repositorio MUST proveer una orquestación local que levante los 3 microservicios (puertos 8081/8082/8083), SQL Server (1433) y Redis (6379), con health checks para las dependencias.
- **FR-003**: El repositorio MUST proveer una variante de orquestación para desarrollo (montajes y puertos de depuración) y un script de despliegue reutilizable.
- **FR-004**: El repositorio MUST incluir un archivo de ejemplo de variables de entorno con TODAS las variables requeridas, sin valores reales.
- **FR-005**: El arranque local completo MUST alcanzar health 200 en los 3 servicios en menos de 3 minutos.

**Configuración por ambiente y secrets (TKT-007)**

- **FR-006**: Cada microservicio MUST tener una configuración base con todos los valores sensibles referenciados como variables de entorno sin valor por defecto (datasource, Redis, integraciones, Cognito, S3).
- **FR-007**: El sistema MUST proveer perfiles por ambiente (`dev`, `qas`, `stg`, `prd`) que solo sobrescriban lo que cambia entre ambientes (URLs, niveles de log, detalle de health, observabilidad).
- **FR-008**: El perfil `prd` MUST usar nivel de log `WARN` y MUST NOT exponer detalles en el health check; los perfiles `stg` y `prd` MUST habilitar la exportación de métricas a la observabilidad corporativa.
- **FR-009**: Ningún secreto MUST estar en texto claro en archivos versionados; todos se inyectan por variables de entorno.
- **FR-010**: Los timeouts de todas las integraciones externas MUST estar externalizados y documentados por variable.

**CI/CD Azure DevOps (TKT-006)**

- **FR-011**: El repositorio MUST proveer un pipeline de CI en Azure DevOps que compile, ejecute pruebas unitarias e de integración, publique cobertura, ejecute análisis de seguridad de dependencias y construya y publique imágenes al registro de contenedores.
- **FR-012**: El pipeline MUST fallar si la cobertura en `*-domain`/`*-application` es menor al 80% o si el análisis de seguridad detecta vulnerabilidades críticas.
- **FR-013**: El pipeline MUST desplegar automáticamente a DEV y luego a QAS tras CI exitoso en la rama de integración, con smoke test de health y rollback automático ante fallo.
- **FR-014**: El pipeline MUST desplegar a STG y PRD solo con aprobación manual (STG un aprobador; PRD dos aprobadores), con despliegue sin downtime (una instancia a la vez) y rollback automático ante fallo de smoke test.
- **FR-015**: Los secretos por ambiente MUST gestionarse en grupos de variables (uno por ambiente) y MUST NOT figurar en el YAML del pipeline.
- **FR-016**: Las ramas protegidas MUST exigir PR con CI en verde y revisores (la rama de producción con doble revisión y política de merge desde la rama de integración).
- **FR-017**: El pipeline base MUST dejar el punto de extensión para el despliegue a PRD; las notificaciones (Teams/email) y otras tareas específicas de la entidad se configuran por el equipo DevOps de la CCB sobre ese pipeline (fuera del alcance de este repositorio).
- **FR-018**: El pipeline de CI MUST completarse en menos de 15 minutos.

### Key Entities

No aplica: esta feature entrega infraestructura, configuración y automatización de entrega; no introduce entidades de datos de negocio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El arranque local levanta los 3 microservicios + SQL Server + Redis con health 200 en menos de 3 minutos.
- **SC-002**: Una búsqueda de secretos en el código/configuración versionada no encuentra valores sensibles en texto claro.
- **SC-003**: Cada perfil (`dev`/`qas`/`stg`/`prd`) apunta inequívocamente a su ambiente (verificable en los logs de arranque) y `prd` no expone detalles en health.
- **SC-004**: El pipeline de CI se completa en menos de 15 minutos.
- **SC-005**: Un PR sin CI en verde no puede fusionarse en ninguna rama protegida.
- **SC-006**: Una cobertura menor al 80% en `*-domain`/`*-application` hace fallar el CI.
- **SC-007**: Un merge a la rama de integración despliega automáticamente a DEV y luego a QAS; STG y PRD solo se despliegan con aprobación manual.
- **SC-008**: Un fallo de smoke test post-deploy dispara rollback automático en cualquier ambiente.

## Assumptions

- Se construye sobre el andamiaje `001-andamiaje-monorepo` (existen los 3 `-api`, `deploy/` y el health check en `/health`).
- El stack (SQL Server 2022, Redis 7, contenedores, Azure DevOps, registro de contenedores, observabilidad Dynatrace) está fijado por la constitución (Principios I, X); versiones y detalles se concretan en `/speckit.plan`.
- La organización de Azure DevOps, el registro de contenedores y las credenciales de nube/observabilidad existen y se aprovisionan por el equipo de plataforma (fuera del alcance de código de esta feature).
- Los cuatro ambientes CCB (DEV, QAS, STG, PRD) y su topología de servidores están disponibles.
- El repositorio remoto en Azure DevOps aún puede no existir al inicio; el pipeline se activa cuando el repositorio y los grupos de variables estén configurados.
- El equipo DevOps de la CCB se encarga de ajustar el pipeline para añadir tareas específicas de la entidad (notificaciones Teams/email, integraciones internas, aprobaciones adicionales); este repositorio entrega el pipeline base con sus puntos de extensión.
