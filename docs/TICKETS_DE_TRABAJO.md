# Tickets de Trabajo — Sistema de Certificados Electrónicos CCB

**Producto:** Certificados Electrónicos — Cámara de Comercio de Bogotá  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Derivado de:** PRD v2.3 · Arquitectura Java · Historias de Usuario v1.1  
**Stack:** Java 25 LTS · Spring Boot 4.1 · Angular 22 · SQL Server 2022 · Redis 7 · Amazon S3

---

## Convenciones

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único del ticket (TKT-XXX) |
| **Épica** | Épica a la que pertenece el ticket |
| **Tipo** | Feature / Task / Spike / Bug |
| **HU** | Historia(s) de usuario que implementa |
| **RF / RNF** | Requisitos funcionales y no funcionales cubiertos |
| **Estimación** | Puntos de historia (Fibonacci: 1, 2, 3, 5, 8, 13, 21) |
| **Prioridad** | Alta / Media / Baja |
| **Fase** | Fase del plan de migración (0–6) |

### Escala de estimación
| Puntos | Esfuerzo estimado |
|--------|-------------------|
| 1–2 | ≤ 4 horas |
| 3 | Medio día |
| 5 | 1–2 días |
| 8 | 3–4 días |
| 13 | 1 semana |
| 21 | > 1 semana — considerar dividir |

### Metodología de desarrollo: TDD (Test-Driven Development)

Todo el desarrollo sigue el ciclo **Red → Green → Refactor** sin excepciones:

| Fase | Símbolo | Acción |
|------|---------|--------|
| **Red** | 🔴 | Escribir el test que describe el comportamiento esperado. El test **debe fallar** antes de escribir código de producción. |
| **Green** | 🟢 | Escribir el **mínimo** código de producción necesario para que el test pase. Sin gold-plating. |
| **Refactor** | ♻️ | Limpiar el código (eliminar duplicación, mejorar nombres, extraer métodos) manteniendo todos los tests en verde. |

**Reglas de aplicación en este proyecto:**

1. **Orden obligatorio por capa:** los tests se escriben capa por capa siguiendo la dirección `domain → application → infrastructure → api`. Nunca se implementa una capa sin su test previo en verde.
2. **Test del dominio primero:** las reglas de negocio del `*-domain` se validan con tests unitarios puros (JUnit 5 + AssertJ) antes de escribir cualquier código de infraestructura.
3. **Mocks en la capa de aplicación:** los `*Handler` y `*Service` se testean con Mockito sobre los ports (interfaces), no sobre implementaciones reales.
4. **Testcontainers para infraestructura:** los repositorios JDBC y adaptadores SOAP se testean contra contenedores reales (SQL Server, WireMock) — nunca con mocks de BD.
5. **MockMvc para controllers:** los endpoints REST se validan con `@WebMvcTest` + MockMvc antes de levantar el servidor completo.
6. **ArchUnit siempre:** cada módulo incluye un test de arquitectura que verifica que `*-domain` no depende de Spring ni de `*-infrastructure`.
7. **Cobertura mínima:** 80% en módulos `*-domain` y `*-application` como quality gate del pipeline (TKT-006).

En las tareas técnicas de cada ticket, las filas marcadas con 🔴 se ejecutan **antes** que las marcadas con 🟢. No se inicia la implementación de un componente sin un test fallido que la justifique.

---

## Índice de Épicas

| Épica | Nombre | Fase | HUs relacionadas |
|-------|--------|------|-----------------|
| [EPIC-01](#epic-01--fundación-y-setup-técnico) | Fundación y Setup Técnico | 0 | — |
| [EPIC-02](#epic-02--servicio-de-verificación) | Servicio de Verificación | 1 | HU-14 |
| [EPIC-03](#epic-03--servicio-de-descargas) | Servicio de Descargas | 2 | HU-12, HU-13, HU-17 |
| [EPIC-04](#epic-04--servicio-de-solicitudes--core) | Servicio de Solicitudes — Core | 3 | HU-01, HU-02, HU-03, HU-10, HU-11, HU-15, HU-16 |
| [EPIC-05](#epic-05--módulos-especiales-de-solicitudes) | Módulos Especiales de Solicitudes | 4 | HU-03A, HU-04, HU-05, HU-06, HU-06A, HU-06B, HU-06C, HU-07, HU-07A, HU-07B, HU-08, HU-09 |
| [EPIC-06](#epic-06--frontends-angular-22) | Frontends Angular 22 | 5 | Todas las HU |
| [EPIC-07](#epic-07--hardening-observabilidad-y-cierre) | Hardening, Observabilidad y Cierre | 6 | — |

---

## EPIC-01 — Fundación y Setup Técnico

> **Objetivo:** Establecer la estructura base del proyecto multi-módulo Gradle, la infraestructura de desarrollo, CI/CD, clientes SOAP y el modelo de datos. Sin esta épica ningún otro desarrollo es posible.

---

### TKT-001 — Inicializar proyecto multi-módulo Gradle (Clean Architecture)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-001 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 0 |

**Descripción**  
Crear el proyecto raíz multi-módulo con Gradle 9 (Kotlin DSL) con todos los módulos definidos en la arquitectura. Incluye el catálogo de versiones centralizado (`libs.versions.toml`) y las dependencias compartidas.

**Estructura de módulos a crear:**
```
certificados-electronicos/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/libs.versions.toml
├── solicitudes/
│   ├── solicitudes-api/
│   ├── solicitudes-application/
│   ├── solicitudes-domain/
│   └── solicitudes-infrastructure/
├── descargas/
│   ├── descargas-api/
│   ├── descargas-application/
│   └── descargas-infrastructure/
├── verificacion/
│   ├── verificacion-api/
│   ├── verificacion-application/
│   └── verificacion-infrastructure/
├── shared/
│   ├── shared-kernel/
│   ├── shared-auth/
│   └── shared-contracts/
├── frontend/
│   ├── portal-certificados/
│   └── portal-verificacion/
└── deploy/
    ├── docker/
    └── scripts/
```

**Tareas técnicas** _(ciclo TDD: el primer commit del proyecto es siempre un test de arquitectura que falla; el segundo commit es el scaffold que lo hace pasar)_**:**

- [ ] 🔴 Escribir `ArchitectureTest.java` en `shared-kernel` con reglas ArchUnit: (a) clases en `*-domain` no usan paquetes de Spring, (b) clases en `*-infrastructure` no acceden directamente a `*-api`, (c) dependencias solo fluyen hacia adentro (anti-corruption layer) — este test **falla** porque el proyecto aún no existe
- [ ] 🟢 Crear estructura Gradle multi-módulo: `settings.gradle.kts`, `build.gradle.kts` raíz, `gradle/libs.versions.toml` con versiones (Java 25, Spring Boot 4.1.x, Apache CXF 4.x, AWS SDK 2.x, Bucket4j 8.x, Liquibase 4.x, JUnit 5, Testcontainers, ArchUnit)
- [ ] 🟢 Crear `build.gradle.kts` de cada submódulo respetando reglas de dependencia: domain (Java puro), application (domain + shared-kernel), infrastructure (application + Spring JDBC + CXF), api (infrastructure + Spring Boot)
- [ ] 🟢 Configurar plugin `wsdl2java` en `solicitudes-infrastructure`; crear clase base `Application.java` en cada módulo `*-api`
- [ ] Verificar que `./gradlew build` pasa y `ArchitectureTest` está en verde

♻️ **Refactorizar** tras ciclos en verde: asegurar que el `version catalog` es la **única** fuente de verdad para versiones — sin versiones hardcodeadas en ningún `build.gradle.kts`

**Criterios de aceptación:**
- `./gradlew build` ejecuta sin errores para todos los módulos
- El módulo `*-domain` no tiene dependencias de Spring (verificado con ArchUnit)
- Los tres servicios (solicitudes, descargas, verificacion) arrancan como Spring Boot apps independientes
- El catálogo de versiones es la única fuente de verdad para versiones de dependencias

**Dependencias:** Ninguna (primer ticket)

---

### TKT-002 — Implementar módulos `shared-kernel` y `shared-auth`

| Campo | Valor |
|-------|-------|
| **ID** | TKT-002 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **RF** | RNF-12, RNF-17 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 0 |

**Descripción**  
Implementar las clases base compartidas por todos los microservicios: manejo de resultados (`Result<T>`), excepciones de dominio, entidad base, filtro de Correlation ID, configuración de Spring Security para JWT MAUC y configuración CORS.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`shared-kernel`:
- [ ] 🔴 Escribir `ResultTest`: (a) `Result.success(value)` → `isSuccess()=true`, `getValue()=value`, (b) `Result.failure(error)` → `isFailure()=true`, `getError()=error`, (c) no lanza checked exceptions en ningún caso
- [ ] 🟢 Implementar `Result<T>`
- [ ] 🔴 Escribir `GlobalExceptionHandlerTest` con `@WebMvcTest`: `RecursoNoEncontradoException` → 404; `ConflictoEstadoException` → 409; `ReglaNegocioException` → 422; excepción inesperada → 500
- [ ] 🟢 Implementar `DomainException` y subclases, `ApiResponse<T>`, `GlobalExceptionHandler`

`shared-auth`:
- [ ] 🔴 Escribir `CorrelationIdFilterTest`: request sin header `X-Correlation-Id` → se genera UUID; request con header → se propaga; el valor está en MDC durante el request
- [ ] 🟢 Implementar `CorrelationIdFilter`
- [ ] 🔴 Escribir `SecurityConfigTest`: request a `/actuator/health` sin JWT → 200; request a `/api/**` sin JWT → 401; request a `/api/**` con JWT inválido → 401; CORS desde `https://malicio.so` → rechazado; CORS desde `https://portal.ccb.org.co` → permitido
- [ ] 🟢 Implementar `SecurityConfig`, `JwtDecoder` (validación contra JWKS endpoint de MAUC)

♻️ **Refactorizar** tras ciclos en verde: revisar si `MatriculaFormatter` y `NitFormatter` deben estar en `shared-kernel` (ya que TKT-030 y TKT-048 los necesitan) en lugar de en `solicitudes-domain`

**Criterios de aceptación:**
- `Result<T>` encapsula éxito/error sin checked exceptions
- `GlobalExceptionHandler` retorna respuestas HTTP correctas: 404 para `RecursoNoEncontrado`, 409 para `ConflictoEstado`, 400 para validación, 500 para errores inesperados
- El Correlation ID se propaga correctamente en MDC y en el header de respuesta
- CORS rechaza requests desde dominios que no son `*.ccb.org.co`
- JWT sin firma válida retorna HTTP 401

**Dependencias:** TKT-001

---

### TKT-003 — Generar clientes SOAP desde WSDLs (PUP, TiendaWS, SHD)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-003 |
| **Épica** | EPIC-01 |
| **Tipo** | Spike + Task |
| **HU** | HU-03, HU-04, HU-05 |
| **RF** | RF-04, RF-12, RF-13 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 0 |

**Descripción**  
Obtener los WSDLs de los servicios WCF legacy (PUP, TiendaWS, SHD), versionarlos en el repositorio y configurar `wsdl2java` (Apache CXF) para generar los clientes tipados. Implementar la configuración de timeout y circuit breaker para cada cliente.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor — los tests WireMock se escriben antes de implementar cada adaptador SOAP)_**:**

- [ ] **[SPIKE]** Descargar WSDLs desde ambientes DEV/QA: `ModuloPrincipal.wsdl` (PUP), `TiendaWS.wsdl`, `ShdWS.wsdl`; versionarlos en `solicitudes-infrastructure/src/main/resources/wsdl/`
- [ ] Configurar plugin `wsdl2java`; ejecutar generación y verificar stubs: `RealizarLiquidacion`, `ObtenerCatalogoCertificados`, `ObtenerSaldoAfiliacion`, `ObtenerRepresentantesLegales`, `ObtenerMatriculaPrincipal`
- [ ] 🔴 Escribir `PupSoapAdapterIT` con WireMock (SOAP): (a) `RealizarLiquidacion` exitosa → respuesta mapeada a DTO de dominio, (b) timeout a los 10s → `PupTimeoutException`, (c) circuit breaker tras 5 fallos → siguiente llamada falla rápido sin request real, (d) response SOAP con error → excepción de dominio correcta
- [ ] 🟢 Implementar `PupSoapAdapter` con `JaxWsProxyFactoryBean`, timeout 10s y circuit breaker (Resilience4j)
- [ ] 🔴 Escribir `TiendaSoapAdapterIT` con WireMock: operaciones de catálogo y representantes legales; timeout 8s; circuit breaker
- [ ] 🟢 Implementar `TiendaSoapAdapter` con timeout 8s y circuit breaker
- [ ] 🔴 Escribir `ShdSoapAdapterIT` con WireMock: `ObtenerMatriculaPrincipal`; timeout 8s; circuit breaker
- [ ] 🟢 Implementar `ShdSoapAdapter` con timeout 8s y circuit breaker

♻️ **Refactorizar** tras ciclos en verde: extraer la configuración de circuit breaker (umbral de fallos, ventana de tiempo, timeout de recovery) a propiedades en `application.yml` para poder variarla por ambiente

**Criterios de aceptación:**
- Los clientes SOAP tipados se generan correctamente desde los WSDLs
- Cada cliente tiene timeout configurado según la tabla de integraciones (PRD §8)
- El circuit breaker se abre tras 5 fallos consecutivos y retorna fallback en lugar de propagar error
- Los tests de integración con WireMock pasan en CI sin dependencia de servicios reales

**Dependencias:** TKT-001, acceso a WSDLs de ambiente de QA

---

### TKT-004 — Configurar infraestructura local (Docker Compose, SQL Server, Redis)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-004 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 0 |

**Descripción**  
Crear los `Dockerfile` para cada microservicio y el `docker-compose.yml` que permite levantar el entorno de desarrollo completo (3 servicios + SQL Server + Redis).

**Tareas técnicas** _(ciclo TDD: los smoke tests se escriben antes de escribir los Dockerfiles — el test verifica que el contenedor arranca y responde health check)_**:**

- [ ] 🔴 Escribir `DockerSmokeTest.sh` (o test de integración con Testcontainers): (a) imagen de `solicitudes` arranca en < 60s y `/actuator/health` retorna 200, (b) imagen de `descargas` arranca y salud OK, (c) imagen de `verificacion` arranca y salud OK — estos tests fallan porque las imágenes aún no existen
- [ ] 🟢 Crear `Dockerfile.solicitudes` (base `eclipse-temurin:25-jre-alpine`, `-Xmx1024m`, G1GC, profile `production`), `Dockerfile.descargas` (`-Xmx512m`, ZGC), `Dockerfile.verificacion` (`-Xmx512m`, G1GC)
- [ ] 🟢 Crear `docker-compose.yml` con servicios: solicitudes (8081), descargas (8082), verificacion (8083), sql-server (1433), redis (6379); health checks para SQL Server y Redis
- [ ] 🟢 Crear `docker-compose.override.yml` para desarrollo (bind mounts, debug ports)
- [ ] 🟢 Documentar variables de entorno en `.env.example` (sin valores reales); crear `deploy/scripts/deploy.sh`
- [ ] Verificar que los smoke tests pasan: `docker compose up` en < 3 minutos, 3 servicios con 200 en health

♻️ **Refactorizar** tras ciclos en verde: revisar parámetros JVM por ambiente (DEV puede tener menos memoria); consolidar las variables compartidas entre microservicios en el `docker-compose.yml`

**Criterios de aceptación:**
- `docker compose up` levanta los 3 microservicios en menos de 3 minutos
- Los health checks de `actuator/health` responden 200 OK para los 3 servicios
- `.env.example` documenta todas las variables requeridas sin valores sensibles
- No hay secrets hardcodeados en ningún archivo versionado

**Dependencias:** TKT-001

---

### TKT-005 — Implementar modelo de datos y migraciones Liquibase para verificaciones

| Campo | Valor |
|-------|-------|
| **ID** | TKT-005 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **RF** | RF-25, RF-26, RF-27, RF-29 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 0 |

**Descripción**  
Crear los scripts de migración Liquibase **exclusivamente para las tablas del módulo de verificaciones** en SQL Server 2022. Las tablas de solicitudes, cotizaciones, trazabilidad, catálogos y demás estructuras existentes **no se crean, modifican ni migran** — se consumen tal como están en la base de datos actual. Solo las tablas de `CodigoVerificacion` y `RegistroVerificacion` son nuevas en SQL Server, ya que provienen del sistema legado (MySQL) y deben trasladarse a esta base de datos.

> **Alcance:** Solo esquema `verificaciones` con sus dos tablas e índices asociados. El resto de la base de datos existente permanece intacto.

**Tareas técnicas** _(ciclo TDD: los tests de migración Testcontainers se escriben antes de crear los changelogs Liquibase — el test verifica que la migración crea exactamente lo esperado)_**:**

- [ ] **[SPIKE]** Revisar el esquema actual de las tablas de verificaciones en el sistema legado (MySQL) para asegurar equivalencia en SQL Server
- [ ] 🔴 Escribir `LiquibaseMigrationIT` con Testcontainers (SQL Server 2022): (a) ejecutar las migraciones → tablas `CodigoVerificacion` y `RegistroVerificacion` creadas con la estructura esperada, (b) ejecutar dos veces → idempotente, sin errores, (c) verificar que los 3 índices existen, (d) verificar que **no existen** tablas de solicitudes ni catálogos en el esquema — este test falla porque los changelogs aún no existen
- [ ] 🟢 Crear estructura `db/changelog/` con `db.changelog-master.xml` — **solo en el módulo `verificacion-infrastructure`**
- [ ] `001-create-schema-verificaciones.xml` — crear esquema `verificaciones` si no existe
- [ ] `002-create-tables-verificaciones.xml` — tablas:
  ```sql
  CREATE TABLE verificaciones.CodigoVerificacion (
      id           BIGINT IDENTITY(1,1) PRIMARY KEY,
      codigo       VARCHAR(14)   NOT NULL UNIQUE,
      solicitud_id BIGINT        NOT NULL,
      matricula    VARCHAR(20),
      tipo_certificado INT,
      nombre_archivo   VARCHAR(500) NOT NULL,
      fecha_cargue     DATETIME2 DEFAULT GETDATE(),
      fecha_vencimiento DATE      NOT NULL,
      max_verificaciones     INT  DEFAULT 999,
      verificaciones_realizadas INT DEFAULT 0
  );

  CREATE TABLE verificaciones.RegistroVerificacion (
      id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
      codigo_verificacion_id  BIGINT NOT NULL
          REFERENCES verificaciones.CodigoVerificacion(id),
      ip_verificador          VARCHAR(45) NOT NULL,
      fecha                   DATETIME2 DEFAULT GETDATE()
  );
  ```
- [ ] `003-create-indexes-verificaciones.xml` — índices:
  - `IX_CodigoVerificacion_codigo` sobre `codigo` (búsqueda principal)
  - `IX_CodigoVerificacion_fecha_vencimiento` sobre `fecha_vencimiento` (filtro de vigencia)
  - `IX_RegistroVerificacion_codigo_id` sobre `codigo_verificacion_id`
- [ ] Configurar Liquibase **únicamente** en `verificacion-api/application.yml` (no en solicitudes ni descargas)
- [ ] **[SPIKE]** Definir estrategia de migración de datos existentes desde MySQL hacia las nuevas tablas en SQL Server (script de ETL o carga inicial)
- [ ] Tests de migración con Testcontainers (SQL Server 2022): verificar que las migraciones son idempotentes

**Restricciones importantes:**
- ❌ **No crear** esquemas `solicitudes` ni `catalogos` en SQL Server
- ❌ **No tocar** tablas existentes de solicitudes, cotizaciones, trazabilidad ni catálogos
- ❌ **No agregar** Liquibase a los módulos `solicitudes-infrastructure` ni `descargas-infrastructure`
- ✅ Los microservicios de solicitudes y descargas consumen las tablas existentes mediante JDBC, apuntando a la BD actual sin Liquibase

**Criterios de aceptación:**
- `./gradlew :verificacion:verificacion-infrastructure:liquibaseUpdate` crea el esquema y las dos tablas sin errores en SQL Server 2022
- Las migraciones son idempotentes: ejecutar dos veces no genera errores
- Los índices `IX_CodigoVerificacion_codigo` y `IX_CodigoVerificacion_fecha_vencimiento` están creados
- Liquibase genera `DATABASECHANGELOG` solo en el contexto de verificaciones
- Las tablas existentes de la base de datos actual no son alteradas en ningún momento

**Dependencias:** TKT-001, TKT-004

---

### TKT-006 — Configurar pipeline CI/CD en Azure DevOps (DEV → QAS → STG → PRD)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-006 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **RF** | RNF-28, RNF-29 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 0 |

**Descripción**  
Configurar el pipeline de CI/CD en **Azure DevOps** para compilación, tests, análisis de código y despliegue automatizado en los cuatro ambientes de la CCB: **DEV → QAS → STG → PRD**. Este pipeline es la **única** vía de compilación y despliegue; no se realizan builds ni deploys manuales en ningún ambiente.

**Ambientes y propósito:**

| Ambiente | Propósito | Activación | Aprobación |
|----------|-----------|------------|------------|
| **DEV** | Integración continua del equipo de desarrollo | Automático en cada merge a `develop` | Ninguna |
| **QAS** | Pruebas funcionales y de integración del equipo de QA | Automático tras deploy exitoso en DEV | Ninguna |
| **STG** | Validación final, pruebas de carga y UAT con datos similares a producción | Manual — requiere aprobación | Responsable técnico |
| **PRD** | Producción | Manual — requiere aprobación | Responsable técnico + Gerencia TI |

**Estrategia de ramas:**

| Rama | Ambiente destino | Observaciones |
|------|-----------------|---------------|
| `develop` | DEV → QAS | Merge de feature branches; CI + deploy automático |
| `main` | STG → PRD | Solo recibe merges desde `develop` vía PR aprobado |

**Tareas técnicas** _(ciclo TDD aplicado al pipeline: primero se define el quality gate que debe pasar — cobertura ≥ 80%, ArchUnit verde, OWASP sin críticos — y luego se configura el YAML que lo verifica)_**:**

Estructura de archivos:
- [ ] Crear `azure-pipelines.yml` en la raíz del repositorio (pipeline principal)
- [ ] Crear `deploy/azure-devops/templates/` con templates YAML reutilizables:
  - `build-and-test.yml` — stages de CI compartidos
  - `docker-build-push.yml` — build y push a ACR parametrizado por ambiente
  - `deploy-environment.yml` — deploy parametrizado por ambiente y servicio
  - `smoke-test.yml` — verificación de salud post-deploy

Pipeline — **CI (Integración Continua):** se activa en cada PR y push a `develop` / `main`
- [ ] **Stage 1 — Compilación:** `./gradlew compileJava compileTestJava`
  - Agente: `ubuntu-latest` con Java 25 (Eclipse Temurin)
  - Caché de Gradle con tarea `Cache@2` (`$(Pipeline.Workspace)/.gradle`)
- [ ] **Stage 2 — Tests unitarios:** `./gradlew test`
  - Reporte de cobertura JaCoCo publicado en Azure DevOps (pestaña "Tests")
  - Quality gate: cobertura < 80% en módulos `*-domain` y `*-application` → pipeline falla
  - Publicar con `PublishTestResults@2` (JUnit XML) y `PublishCodeCoverageResults@2`
- [ ] **Stage 3 — Tests de integración:** `./gradlew integrationTest`
  - Testcontainers requiere Docker en el agente
  - Jobs paralelos por microservicio (solicitudes, descargas, verificacion)
- [ ] **Stage 4 — Análisis de seguridad:** OWASP Dependency Check
  - Publicar reporte como artefacto del pipeline
  - Falla si hay vulnerabilidades de severidad **Critical**
- [ ] **Stage 5 — Build de imágenes Docker:**
  - `docker build` para los 3 microservicios
  - Push a **Azure Container Registry (ACR)** con tags: `{servicio}:{commitSHA}` y `{servicio}:develop-latest` / `{servicio}:main-latest` según rama
  - Tarea `Docker@2` con `command: buildAndPush`

Pipeline — **CD (Entrega Continua):** stages de deploy activados tras CI exitoso

- [ ] **Stage 6 — Deploy a DEV** _(automático, rama `develop`)_
  - Usa Variable Group `vg-dev`
  - Rolling deployment en servidores DEV
  - Smoke test: `GET /health` de los 3 servicios → 200 OK
  - Rollback automático si smoke test falla

- [ ] **Stage 7 — Deploy a QAS** _(automático si DEV exitoso, rama `develop`)_
  - Usa Variable Group `vg-qas`
  - Rolling deployment en servidores QAS
  - Smoke test idéntico al de DEV
  - Rollback automático si smoke test falla

- [ ] **Stage 8 — Deploy a STG** _(manual, rama `main`, requiere aprobación del responsable técnico)_
  - Environment `STG` en Azure DevOps con approval gate configurado
  - Usa Variable Group `vg-stg`
  - Rolling deployment en servidores STG
  - Smoke test extendido: health + prueba de endpoint de verificación
  - Rollback automático si smoke test falla

- [ ] **Stage 9 — Deploy a PRD** _(manual, rama `main`, requiere doble aprobación)_
  - Environment `PRD` en Azure DevOps con approval gate de dos aprobadores (responsable técnico + Gerencia TI)
  - Usa Variable Group `vg-prd`
  - Rolling deployment: una instancia a la vez para garantizar zero-downtime (RNF-29)
  - Smoke test en PRD: solo endpoints de health (sin carga de datos reales)
  - Rollback automático si smoke test falla
  - Notificación a canal de Teams/email al completar deploy exitoso en PRD

Configuración adicional:
- [ ] Crear **4 Variable Groups** en Azure DevOps (uno por ambiente) con los secrets correspondientes — nunca en el YAML:
  - `vg-dev`: URLs de servicios DEV, credenciales BD DEV, Redis DEV, MAUC DEV
  - `vg-qas`: URLs de servicios QAS, credenciales BD QAS, Redis QAS, MAUC QAS
  - `vg-stg`: URLs de servicios STG, credenciales BD STG, Redis STG, MAUC STG
  - `vg-prd`: URLs de servicios PRD, credenciales BD PRD, Redis PRD, MAUC PRD
  - Variables comunes a todos: `ACR_NAME`, `DYNATRACE_API_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- [ ] Configurar **branch policies** en Azure DevOps:
  - Rama `develop`: requiere PR con pipeline CI verde + 1 revisor
  - Rama `main`: requiere PR con pipeline CI verde + 2 revisores + policy de merge desde `develop`
- [ ] Crear **Environments** en Azure DevOps: `DEV` (sin aprobación), `QAS` (sin aprobación), `STG` (1 aprobador), `PRD` (2 aprobadores con timeout de 4h)
- [ ] Documentar el pipeline en `deploy/azure-devops/README.md` con: flujo de ramas, ambientes, cómo aprobar un deploy, cómo ejecutar rollback manual

**Estructura del `azure-pipelines.yml`:**
```yaml
trigger:
  branches:
    include: [ main, develop ]

pr:
  branches:
    include: [ main, develop ]

variables:
  GRADLE_USER_HOME: $(Pipeline.Workspace)/.gradle
  ACR_NAME: 'ccbcertificadosacr'

stages:

  # ── CI ────────────────────────────────────────────────────────────────
  - stage: CI_Build_Test
    displayName: 'CI — Compilar y Probar'
    jobs:
      - job: Build_And_Test
        pool: { vmImage: 'ubuntu-latest' }
        steps:
          - task: Cache@2             # caché Gradle
            inputs:
              key: 'gradle | "$(Agent.OS)" | **/build.gradle.kts'
              path: $(GRADLE_USER_HOME)
          - script: ./gradlew compileJava test integrationTest
            displayName: 'Compilar + Tests'
          - task: PublishTestResults@2
          - task: PublishCodeCoverageResults@2
      - job: Security_Scan
        steps:
          - script: ./gradlew dependencyCheckAnalyze
            displayName: 'OWASP Dependency Check'
          - task: PublishPipelineArtifact@1
            inputs: { artifactName: 'security-report' }

  # ── Docker Build + Push ───────────────────────────────────────────────
  - stage: Docker_Build
    displayName: 'Build imágenes Docker → ACR'
    dependsOn: CI_Build_Test
    jobs:
      - job: Docker_Push
        steps:
          - task: Docker@2
            inputs:
              command: buildAndPush
              containerRegistry: 'sc-acr-ccb'
              tags: |
                $(Build.SourceVersion)
                $(Build.SourceBranchName)-latest

  # ── Deploy DEV (rama develop) ─────────────────────────────────────────
  - stage: Deploy_DEV
    displayName: 'Deploy → DEV'
    dependsOn: Docker_Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    variables: [ group: vg-dev ]
    jobs:
      - deployment: Deploy
        environment: DEV
        strategy:
          rolling:
            deploy:
              steps:
                - script: ./deploy/scripts/deploy.sh dev
                - script: ./deploy/scripts/smoke-test.sh dev

  # ── Deploy QAS (rama develop, tras DEV exitoso) ───────────────────────
  - stage: Deploy_QAS
    displayName: 'Deploy → QAS'
    dependsOn: Deploy_DEV
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    variables: [ group: vg-qas ]
    jobs:
      - deployment: Deploy
        environment: QAS
        strategy:
          rolling:
            deploy:
              steps:
                - script: ./deploy/scripts/deploy.sh qas
                - script: ./deploy/scripts/smoke-test.sh qas

  # ── Deploy STG (rama main, aprobación manual) ─────────────────────────
  - stage: Deploy_STG
    displayName: 'Deploy → STG'
    dependsOn: Docker_Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    variables: [ group: vg-stg ]
    jobs:
      - deployment: Deploy
        environment: STG                  # approval gate: responsable técnico
        strategy:
          rolling:
            deploy:
              steps:
                - script: ./deploy/scripts/deploy.sh stg
                - script: ./deploy/scripts/smoke-test.sh stg

  # ── Deploy PRD (rama main, doble aprobación manual) ───────────────────
  - stage: Deploy_PRD
    displayName: 'Deploy → PRD'
    dependsOn: Deploy_STG
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    variables: [ group: vg-prd ]
    jobs:
      - deployment: Deploy
        environment: PRD                  # approval gate: responsable + Gerencia TI
        strategy:
          rolling:
            deploy:
              steps:
                - script: ./deploy/scripts/deploy.sh prd
                - script: ./deploy/scripts/smoke-test.sh prd
```

**Criterios de aceptación:**
- Pipeline CI completo ejecuta en < 15 minutos (SLO §10.2)
- PR sin pipeline CI verde **no puede** hacer merge en ninguna rama protegida
- Cobertura < 80% en módulos `*-domain` y `*-application` → pipeline falla en Stage CI
- Imágenes Docker en ACR etiquetadas con SHA del commit y con alias de rama (`develop-latest`, `main-latest`)
- Deploy automático DEV → QAS al hacer merge en `develop`
- Deploy a STG y PRD solo con aprobación manual en Azure DevOps; el pipeline espera hasta 4h antes de expirar
- Zero-downtime en todos los ambientes: una instancia actualizada a la vez (RNF-29)
- Rollback automático en cualquier ambiente si el smoke test falla post-deploy
- Ningún secret en el YAML del pipeline (se usan los 4 Variable Groups por ambiente)
- Notificación automática al equipo (Teams/email) al completar deploy exitoso en PRD

**Dependencias:** TKT-001, TKT-004

---

### TKT-007 — Implementar `application.yml` por ambiente y gestión de secrets

| Campo | Valor |
|-------|-------|
| **ID** | TKT-007 |
| **Épica** | EPIC-01 |
| **Tipo** | Task |
| **HU** | — |
| **RF** | RNF-13 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 0 |

**Descripción**  
Configurar los archivos `application.yml` y los perfiles Spring Boot para los cuatro ambientes de la CCB: **DEV, QAS, STG y PRD**. Ningún secret puede estar hardcodeado; todos los valores sensibles se inyectan como variables de entorno provenientes de los Variable Groups de Azure DevOps (TKT-006) en el momento del despliegue.

**Perfiles Spring Boot y su correspondencia con ambientes CCB:**

| Perfil Spring (`spring.profiles.active`) | Ambiente CCB | Activación |
|------------------------------------------|--------------|------------|
| _(sin perfil / `default`)_ | Local (Docker Compose) | Manual por el desarrollador |
| `dev` | DEV | Pipeline Azure DevOps — Stage Deploy_DEV |
| `qas` | QAS | Pipeline Azure DevOps — Stage Deploy_QAS |
| `stg` | STG | Pipeline Azure DevOps — Stage Deploy_STG |
| `prd` | PRD | Pipeline Azure DevOps — Stage Deploy_PRD |

**Tareas técnicas** _(ciclo TDD: antes de crear los archivos `application-*.yml`, se escribe un test que verifica que el contexto de Spring Boot arranca correctamente con cada perfil y que no hay propiedades requeridas faltantes)_**:**

Archivos base (comunes a todos los ambientes):
- [ ] `application.yml` — propiedades base; todos los valores sensibles como `${VARIABLE}` sin valor por defecto:
  ```yaml
  spring:
    datasource:
      url: jdbc:sqlserver://${DB_HOST}:1433;databaseName=${DB_NAME};encrypt=true
      username: ${DB_USER}
      password: ${DB_PASSWORD}
      hikari:
        minimum-idle: 10
        maximum-pool-size: 50
        connection-timeout: 5000
    data.redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT:6379}
  integrations:
    pup.url: ${PUP_WSDL_URL}
    pup.timeout-ms: ${PUP_TIMEOUT_MS:10000}
    tienda.url: ${TIENDA_WSDL_URL}
    tienda.timeout-ms: ${TIENDA_TIMEOUT_MS:8000}
    shd.url: ${SHD_WSDL_URL}
    shd.timeout-ms: ${SHD_TIMEOUT_MS:8000}
    inscritos.url: ${INSCRITOS_REST_URL}
    mauc.jwk-set-uri: ${MAUC_JWK_URI}
    encriptacion.url: ${AWS_ENCRYPT_URL}
  aws.s3:
    bucket: ${S3_BUCKET}
    region: ${S3_REGION:us-east-1}
  server:
    port: 8080
    compression.enabled: true
  management.endpoints.web.exposure.include: health,info,metrics
  ```

Perfil por ambiente — solo sobrescribe lo que cambia entre ambientes:
- [ ] `application-dev.yml` — apunta a servicios DEV de PUP/TiendaWS/SHD; nivel de log `DEBUG` para paquetes `co.org.ccb`; `show-details: always` en health
- [ ] `application-qas.yml` — apunta a servicios QAS; nivel de log `INFO`; `show-details: when-authorized`
- [ ] `application-stg.yml` — apunta a servicios STG (datos similares a PRD); nivel de log `INFO`; configuración de Dynatrace activa; pool Hikari igual a PRD
- [ ] `application-prd.yml` — apunta a servicios PRD; nivel de log `WARN`; pool Hikari máximo; Dynatrace activo; `show-details: never` en health

Configuración adicional:
- [ ] Configurar compresión HTTP: `mime-types: application/json,application/xml,text/plain`
- [ ] Configurar Micrometer + Dynatrace en perfiles `stg` y `prd`:
  ```yaml
  management.metrics.export.dynatrace:
    api-token: ${DYNATRACE_API_TOKEN}
    uri: ${DYNATRACE_ENVIRONMENT_URL}
    v2.metric-key-prefix: certificados-electronicos
  ```
- [ ] Crear `.env.example` en la raíz del proyecto con **todas** las variables requeridas (sin valores reales), usado exclusivamente para entorno local con Docker Compose
- [ ] Documentar en `README.md` la tabla completa de variables por microservicio y por ambiente
- [ ] Validar que el perfil activo se pasa correctamente desde el script de deploy: `-Dspring.profiles.active=dev|qas|stg|prd`

**Criterios de aceptación:**
- `grep -r "password\|secret\|token" src/main/resources/` no retorna ningún valor hardcodeado
- Los 3 servicios arrancan en perfil `default` (local) con solo el `.env` configurado desde Docker Compose
- Los 3 servicios arrancan en perfil `dev` usando los valores del Variable Group `vg-dev` inyectados por el pipeline
- Cada perfil apunta inequívocamente a los servicios de su ambiente (verificar con logs de inicio que muestran las URLs configuradas)
- El perfil `prd` tiene nivel de log `WARN` y **no** expone detalles en `/health`
- Timeouts de todas las integraciones externalizados y documentados

**Dependencias:** TKT-001, TKT-004, TKT-006

---

## EPIC-02 — Servicio de Verificación

> **Objetivo:** Implementar el servicio de verificación pública de autenticidad de certificados. Es la fase de menor riesgo y mayor impacto visible — funciona sin integración con PUP. Incluye el microservicio Spring Boot y el Portal de Verificación Angular.

**Épica cubre:** HU-14 (Verificar autenticidad de un certificado)

---

### TKT-010 — Implementar endpoint de validación de código de verificación

| Campo | Valor |
|-------|-------|
| **ID** | TKT-010 |
| **Épica** | EPIC-02 |
| **Tipo** | Feature |
| **HU** | HU-14 |
| **RF** | RF-25, RF-26, RF-27, RF-30 |
| **RN** | RN-01, RN-07 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 1 |

**Descripción**  
Implementar `GET /api/v1/verificaciones/{codigo}` que valida un código de verificación de 14 caracteres alfanuméricos sin requerir autenticación, aplicando las reglas de negocio de vigencia (60 días) y límite de verificaciones.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`verificacion-domain`:
- [ ] 🔴 Escribir `CodigoVerificacionTest`: casos para `estaVigente()` — código dentro de los 60 días con verificaciones disponibles (true), código vencido (false), verificaciones agotadas (false), combinación de ambas condiciones
- [ ] 🟢 Implementar Value Object `CodigoVerificacion`: atributos `codigo`, `fechaVencimiento`, `maxVerificaciones`, `verificacionesRealizadas`, `nombreArchivo` y método `estaVigente(): boolean`
- [ ] 🔴 Escribir tests para excepciones de dominio: `CodigoExpiradoException`, `LimiteVerificacionesException`, `CodigoNoEncontradoException` — verificar mensajes y jerarquía
- [ ] 🟢 Implementar las tres excepciones extendiendo `DomainException` (shared-kernel)

`verificacion-application`:
- [ ] 🔴 Escribir `ValidarCodigoHandlerTest` con Mockito: (a) código válido → retorna resultado con `{valido:true, archivo}`, (b) código expirado → lanza `CodigoExpiradoException`, (c) verificaciones agotadas → lanza `LimiteVerificacionesException`, (d) código inexistente → lanza `CodigoNoEncontradoException`
- [ ] 🟢 Implementar `ValidarCodigoQuery(String codigo)` y `ValidarCodigoHandler`: consulta repositorio mock, aplica reglas de dominio, retorna resultado

`verificacion-infrastructure`:
- [ ] 🔴 Escribir `CodigoVerificacionRepositoryIT` con Testcontainers (SQL Server): (a) código existente → retorna el objeto correctamente mapeado, (b) código inexistente → `Optional.empty()`
- [ ] 🟢 Implementar `CodigoVerificacionRepository.findByCodigo()` con query JDBC: `SELECT codigo, fecha_vencimiento, max_verificaciones, verificaciones_realizadas, nombre_archivo FROM verificaciones.CodigoVerificacion WHERE codigo = :codigo`

`verificacion-api`:
- [ ] 🔴 Escribir `VerificacionesControllerTest` con `@WebMvcTest` + MockMvc: (a) código válido → 200 con `{valido:true, archivo}`, (b) código inexistente → 404, (c) código expirado → 410, (d) verificaciones agotadas → 410, (e) código con formato inválido (≠14 chars) → 400
- [ ] 🟢 Implementar `VerificacionesController.GET /{codigo}` con las respuestas HTTP correctas y validación de formato de código
- [ ] 🔴 Escribir `ArchitectureTest`: `verificacion-domain` no depende de `org.springframework..` ni de `..infrastructure..`
- [ ] 🟢 Corregir cualquier violación de arquitectura detectada (debe ser cero desde el inicio)

♻️ **Refactorizar** tras ciclos en verde: revisar duplicación en mapeo de excepciones → códigos HTTP en el `GlobalExceptionHandler`; extraer constante para el patrón de validación del código (14 chars alfanuméricos)

**Criterios de aceptación (derivados de HU-14):**
- CA-14.1: Código válido retorna 200 `{valido: true, archivo: "nombre.pdf"}`
- CA-14.2: Código expirado (> 60 días) retorna 410 con mensaje orientativo
- CA-14.3: Verificaciones agotadas retorna 410 con mensaje orientativo
- CA-14.4: Código inexistente retorna 404 sin revelar información extra
- Latencia P95 < 500ms (RNF-03)

**Dependencias:** TKT-001, TKT-002, TKT-005

---

### TKT-011 — Implementar endpoint de descarga de PDF para verificación

| Campo | Valor |
|-------|-------|
| **ID** | TKT-011 |
| **Épica** | EPIC-02 |
| **Tipo** | Feature |
| **HU** | HU-14 |
| **RF** | RF-28 |
| **RNF** | RNF-19 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 1 |

**Descripción**  
Implementar `GET /api/v1/verificaciones/{codigo}/documento` que descarga el PDF desde Amazon S3 y lo retorna en Base64 para ser renderizado por el visor pdf.js en el frontend público.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`verificacion-infrastructure`:
- [ ] 🔴 Escribir `S3StorageServiceIT` con Testcontainers + Localstack: (a) archivo existente → retorna string Base64 no vacío, (b) archivo inexistente → lanza `ArchivoNoEncontradoException`, (c) S3 no disponible → lanza excepción mapeada a 503
- [ ] 🟢 Implementar `S3StorageService.descargarComoBase64(String nombreArchivo)` con AWS SDK v2; configurar `S3Client` con credenciales desde variables de entorno; mapear `NoSuchKeyException` → `ArchivoNoEncontradoException`

`verificacion-application`:
- [ ] 🔴 Escribir `ObtenerDocumentoHandlerTest` con Mockito: (a) código válido con PDF en S3 → retorna Base64, (b) código válido pero archivo no existe en S3 → lanza `ArchivoNoEncontradoException`, (c) S3 no disponible → lanza excepción de infraestructura
- [ ] 🟢 Implementar `ObtenerDocumentoQuery(String codigo)` y `ObtenerDocumentoHandler`: reutilizar validación de código de TKT-010, luego invocar `StorageService`

`verificacion-api`:
- [ ] 🔴 Escribir `DocumentoControllerTest` con MockMvc: (a) código válido → 200 con `{contenido, tipo:"application/pdf"}`, (b) archivo no encontrado → 404, (c) S3 no disponible → 503 con mensaje amigable
- [ ] 🟢 Implementar `GET /{codigo}/documento` en `VerificacionesController`

♻️ **Refactorizar** tras ciclos en verde: extraer método de validación de código compartido entre `ValidarCodigoHandler` y `ObtenerDocumentoHandler` hacia un servicio de dominio reutilizable

**Criterios de aceptación:**
- Código válido + PDF en S3 → 200 con contenido Base64 del PDF
- Código no válido o expirado → mismos errores que TKT-010 (validación previa)
- Archivo no encontrado en S3 → 404 con mensaje de error
- El PDF en Base64 es renderizable por pdf.js (test manual)

**Dependencias:** TKT-010

---

### TKT-012 — Implementar endpoint de registro de verificación

| Campo | Valor |
|-------|-------|
| **ID** | TKT-012 |
| **Épica** | EPIC-02 |
| **Tipo** | Feature |
| **HU** | HU-14 |
| **RF** | RF-29 |
| **RNF** | RNF-20 |
| **Prioridad** | Alta |
| **Estimación** | 3 pts |
| **Fase** | 1 |

**Descripción**  
Implementar `POST /api/v1/verificaciones/{codigo}/registros` que registra cada verificación realizada con la IP del verificador, la fecha/hora y el incremento del contador.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`verificacion-domain`:
- [ ] 🔴 Ampliar `CodigoVerificacionTest`: caso `registrarVerificacion()` — verificar que `verificacionesRealizadas` aumenta en 1 tras cada llamada
- [ ] 🟢 Implementar método `registrarVerificacion()` en `CodigoVerificacion`

`verificacion-infrastructure`:
- [ ] 🔴 Escribir `RegistrarVerificacionRepositoryIT` con Testcontainers (SQL Server): (a) registro exitoso → `RegistroVerificacion` insertado + contador incrementado, (b) fallo en UPDATE → rollback completo del INSERT (atomicidad)
- [ ] 🟢 Implementar `RegistrarVerificacionRepository` con `@Transactional`: INSERT en `verificaciones.RegistroVerificacion` + UPDATE de `verificaciones_realizadas` en `CodigoVerificacion`

`verificacion-api`:
- [ ] 🔴 Escribir `RegistrosControllerTest` con MockMvc: (a) POST con IP válida → 201 Created, (b) extracción correcta de IP desde `X-Forwarded-For`, (c) extracción de IP directa cuando no hay proxy
- [ ] 🟢 Implementar `POST /{codigo}/registros` con lógica de extracción de IP real

♻️ **Refactorizar** tras ciclos en verde: extraer `IpExtractorUtil` como componente compartido reutilizable en futuros endpoints que requieran IP del cliente

**Criterios de aceptación:**
- Verificación registrada: `verificaciones_realizadas` se incrementa en 1 en BD
- IP del verificador almacenada correctamente (considerando load balancer)
- Operación es atómica: si falla el UPDATE del contador, se hace rollback del INSERT
- Registro siempre se guarda (RNF-20: audit trail)

**Dependencias:** TKT-010

---

### TKT-013 — Implementar rate limiting para verificación pública

| Campo | Valor |
|-------|-------|
| **ID** | TKT-013 |
| **Épica** | EPIC-02 |
| **Tipo** | Feature |
| **HU** | HU-14 (CA-14.5) |
| **RF** | RNF-15 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 1 |

**Descripción**  
Implementar rate limiting de 100 requests/segundo por IP usando Bucket4j + Redis para proteger el endpoint público de verificación contra abuso (RNF-15, CA-14.5).

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `RateLimitFilterTest`: (a) primer request desde IP → pasa (200), (b) request número 101 en el mismo segundo desde misma IP → 429 con header `Retry-After: 1`, (c) requests desde IPs distintas → no se afectan entre sí, (d) Redis caído → permite el request (fallback graceful, no bloquea)
- [ ] 🟢 Implementar `RateLimitConfig` con `Bucket4j` + `LettuceConnectionFactory` (Redis): capacity=100, refill 100 tokens/segundo por IP; key Redis `rate:verificacion:{ip}`
- [ ] 🟢 Implementar `RateLimitFilter extends OncePerRequestFilter`: extrae IP desde `X-Forwarded-For`, consulta/crea bucket en Redis, retorna 429 con `Retry-After: 1` si agotado; aplica solo a `/api/v1/verificaciones/**`
- [ ] 🔴 Escribir `RateLimitIntegrationTest` con `@SpringBootTest` + Redis Testcontainer: simular ráfaga de 110 requests seguidos y verificar que los primeros 100 pasan y los restantes reciben 429

♻️ **Refactorizar** tras ciclos en verde: extraer la lógica de extracción de IP y creación de bucket key a métodos privados con nombres expresivos en el filter

**Criterios de aceptación:**
- CA-14.5: Request número 101 desde la misma IP en el mismo segundo retorna HTTP 429
- Respuesta 429 incluye header `Retry-After` con segundos de espera
- Rate limit es por IP: IPs distintas no se afectan entre sí
- Redis caído → fallback graceful (permitir requests en lugar de bloquear todo)

**Dependencias:** TKT-010, TKT-004 (Redis)

---

## EPIC-03 — Servicio de Descargas

> **Objetivo:** Implementar el servicio de consulta y descarga de certificados emitidos desde Amazon S3. Permite a los solicitantes acceder a sus certificados históricos del último año.

**Épica cubre:** HU-12, HU-13, HU-17

---

### TKT-020 — Implementar listado de historial de certificados (HU-12)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-020 |
| **Épica** | EPIC-03 |
| **Tipo** | Feature |
| **HU** | HU-12 |
| **RF** | RF-21, RF-24, RF-37 |
| **RN** | RN-16 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 2 |

**Descripción**  
Implementar `GET /api/v1/certificados` que retorna el historial paginado de solicitudes del solicitante, limitado a los últimos 365 días desde la fecha de consulta (RN-16).

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`descargas-domain`:
- [ ] 🔴 Escribir `CertificadoDescargableTest`: (a) `disponibleParaDescarga` es `true` solo cuando estado es CERTIFICADO_EMITIDO o DESCARGADA, (b) `EstadoSolicitud` cubre los 8 estados del ciclo de vida
- [ ] 🟢 Implementar `CertificadoDescargable` y `EstadoSolicitud` enum: CREADA, GENERADA, ORDEN_PAGO_GENERADA, PAGADA, CERTIFICADO_EMITIDO, DESCARGADA, DEVUELTA, VENCIDA

`descargas-application`:
- [ ] 🔴 Escribir `ListarCertificadosHandlerTest` con Mockito: (a) documentos con solicitudes en los últimos 365 días → retorna lista paginada, (b) solicitudes con más de 365 días → **no aparecen** en el resultado, (c) sin solicitudes → retorna `Page.empty()`, (d) número de documento vacío → lanza excepción de validación
- [ ] 🟢 Implementar `ListarCertificadosQuery` y `ListarCertificadosHandler` con filtro de 365 días y paginación

`descargas-infrastructure`:
- [ ] 🔴 Escribir `CertificadoRepositoryIT` con Testcontainers (SQL Server): (a) consulta retorna solo registros dentro del rango de 365 días, (b) paginación funciona con `OFFSET/FETCH NEXT`, (c) historial vacío retorna lista vacía
- [ ] 🟢 Implementar `CertificadoRepository` con query JDBC paginada filtrada por `DATEADD(day, -365, GETDATE())`

`descargas-api`:
- [ ] 🔴 Escribir `CertificadosControllerTest` con `@WebMvcTest` + MockMvc: (a) sin JWT → 401, (b) con JWT + documento válido → 200 con lista paginada, (c) sin número de documento → 400, (d) respuesta incluye estado legible por cada solicitud
- [ ] 🟢 Implementar `CertificadosController.GET /certificados` con validación Jakarta y autenticación JWT MAUC obligatoria

♻️ **Refactorizar** tras ciclos en verde: revisar si el filtro de 365 días debe ser una constante configurable en `application.yml`; simplificar el `RowMapper` de `CertificadoDescargable` extrayendo métodos de mapeo de estado

**Criterios de aceptación:**
- CA-12.1: Historial muestra solicitudes de los últimos 365 días con estado correcto
- CA-12.2: Historial vacío muestra mensaje informativo, sin error técnico
- CA-12.3: Solicitud pagada sin PDF generado aparece como "En proceso de generación"
- CA-12.4: Documento vacío retorna HTTP 400 con mensaje de validación
- CA-12.5: Solicitudes con más de 365 días de antigüedad NO aparecen
- CA-12.6: Resultados paginados, ordenados por fecha desc, P95 < 2s

**Dependencias:** TKT-001, TKT-002, TKT-007 _(las tablas de solicitudes existen en la BD actual; se consumen vía JDBC sin Liquibase)_

---

### TKT-021 — Implementar descarga directa de PDF desde S3 (HU-13)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-021 |
| **Épica** | EPIC-03 |
| **Tipo** | Feature |
| **HU** | HU-13 |
| **RF** | RF-22, RF-23 |
| **RNF** | RNF-19 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 2 |

**Descripción**  
Implementar los endpoints de descarga de PDF: stream directo (`GET /{id}/archivo`) y URL pre-firmada S3 con expiración de 15 minutos (`GET /{id}/url`). Actualiza el estado de la solicitud a DESCARGADA.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`descargas-domain`:
- [ ] 🔴 Escribir `SolicitudDescargaTest`: (a) `registrarDescarga()` en estado CERTIFICADO_EMITIDO → cambia a DESCARGADA, (b) `registrarDescarga()` en otro estado → lanza `EstadoInvalidoException`
- [ ] 🟢 Implementar método `registrarDescarga()` en la entidad `Solicitud` con validación de estado previo

`descargas-infrastructure`:
- [ ] 🔴 Escribir `S3StorageServiceIT` con Testcontainers + Localstack: (a) `descargarStream()` para archivo existente → InputStream no vacío, (b) `generarUrlPrefirmada()` → URL contiene expiración de 15 minutos exactos, (c) archivo inexistente → `ArchivoNoEncontradoException`
- [ ] 🟢 Implementar `S3StorageService.descargarStream()` y `generarUrlPrefirmada()` con `S3Presigner` de AWS SDK v2

`descargas-api`:
- [ ] 🔴 Escribir `DescargaControllerTest` con MockMvc: (a) GET archivo con JWT del dueño → 200 con `Content-Type: application/pdf` y cabecera `Content-Disposition`, (b) GET URL pre-firmada → 200 con `{url, expiraEn}`, (c) certificado de otro solicitante → 403, (d) PDF no encontrado en S3 → 404
- [ ] 🔴 Escribir `DescargaConcurrenciaIT` con `@SpringBootTest`: 10 threads descargando el mismo certificado simultáneamente → todos retornan 200 sin errores ni condiciones de carrera en el cambio de estado
- [ ] 🟢 Implementar `GET /certificados/{id}/archivo` y `GET /certificados/{id}/url` con verificación de pertenencia al solicitante autenticado y actualización de estado a DESCARGADA

♻️ **Refactorizar** tras ciclos en verde: extraer la verificación de pertenencia (solicitante autenticado vs. dueño del certificado) a un `@PreAuthorize` reutilizable o a un servicio de autorización compartido

**Criterios de aceptación:**
- CA-13.1: Descarga exitosa + estado cambia a DESCARGADA + trazabilidad registrada
- CA-13.2: Archivo no encontrado en S3 → 404 + alerta logueada
- CA-13.3: URL expirada → S3 retorna 403 → portal ofrece regenerar URL
- CA-13.4: PDF de 5MB se descarga en < 3s P95 con concurrencia (RNF-04)
- PDF solo accesible via URL pre-firmada (no URL pública) (RNF-19)

**Dependencias:** TKT-020

---

### TKT-022 — Implementar consulta de certificados por número de orden (HU-17)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-022 |
| **Épica** | EPIC-03 |
| **Tipo** | Feature |
| **HU** | HU-17 |
| **RF** | RF-31 (complementario) |
| **Prioridad** | Media |
| **Estimación** | 3 pts |
| **Fase** | 2 |

**Descripción**  
Implementar `GET /api/v1/certificados?numOrden={orden}` para que el backoffice y el motor de generación puedan consultar los certificados asociados a un número de orden con sus códigos de verificación y contadores.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `CertificadoPorOrdenRepositoryIT` con Testcontainers (SQL Server): (a) orden con 3 certificados → lista de 3 `{codVerificacion, cntVerificaciones, cntVerificados}`, (b) orden sin certificados → lista vacía, (c) consulta durante inserción parcial → solo certificados ya persistidos (CA-17.4)
- [ ] 🟢 Implementar `CertificadoRepository.buscarPorNumOrden(String numOrden)`
- [ ] 🔴 Escribir `CertificadoPorOrdenControllerTest` con MockMvc: (a) con numOrden y credenciales de backoffice → 200 con lista, (b) sin numOrden → 400 (CA-17.3), (c) orden sin certificados → 200 con `[]` (CA-17.2), (d) sin credenciales → 403
- [ ] 🟢 Implementar `GET /certificados?numOrden={orden}` con autenticación de backoffice

♻️ **Refactorizar** tras ciclos en verde: verificar si este endpoint puede reutilizar el mismo `CertificadoRepository` del TKT-020 o si necesita su propia query especializada

**Criterios de aceptación:**
- CA-17.1: Orden con 3 certificados retorna lista de 3 objetos con `codVerificacion`, `cntVerificaciones`, `cntVerificados`
- CA-17.2: Orden sin certificados retorna 200 con `[]`
- CA-17.3: Sin `numOrden` retorna 400
- CA-17.4: Consulta durante registro parcial retorna solo los certificados ya persistidos

**Dependencias:** TKT-020 _(las tablas de verificaciones se crean en TKT-005; las de solicitudes existen en la BD actual)_

---

## EPIC-04 — Servicio de Solicitudes — Core

> **Objetivo:** Implementar el flujo principal de solicitud estándar: búsqueda de inscritos → catálogo → carrito → liquidación PUP → pago → notificación de backoffice. Es la fase más crítica del proyecto.

**Épica cubre:** HU-01, HU-02, HU-03, HU-10, HU-11, HU-15, HU-16

---

### TKT-030 — Implementar búsqueda de inscritos (HU-01)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-030 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-01 |
| **RF** | RF-01 |
| **RN** | RN-12, RN-13 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `GET /api/v1/inscritos` que busca inscritos en el registro mercantil por matrícula, NIT, razón social, palabra clave o número de proponente, invocando el servicio REST de Inscritos.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `MatriculaFormatterTest`: `12345` → `00012345`; `12345678` → `12345678`; matrícula nula → excepción
- [ ] 🔴 Escribir `NitFormatterTest`: `123456789` → `000000123456789`; valor ya de 15 dígitos → sin cambios; NIT con letras → excepción
- [ ] 🟢 Implementar `MatriculaFormatter.formatear(String): String` (pad-left a 8 dígitos) y `NitFormatter.formatear(String): String` (pad-left a 15 dígitos)
- [ ] 🟢 Implementar Value Object `Inscrito`: matricula, nit, razonSocial, estado, esAfiliado, tipoMatricula

`solicitudes-application`:
- [ ] 🔴 Escribir `BuscarInscritosHandlerTest` con Mockito: (a) búsqueda por matrícula `12345` → invoca servicio con `00012345`, (b) NIT con letras → lanza `FormatoInvalidoException` **antes** de invocar `InscritosService`, (c) servicio caído → lanza `ServicioNoDisponibleException`
- [ ] 🟢 Implementar `BuscarInscritosQuery`, `BuscarInscritosHandler` y port `InscritosService`

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `InscritosRestClientIT` con WireMock: (a) búsqueda exitosa → lista mapeada correctamente, (b) sin resultados → lista vacía, (c) servicio caído (timeout 5s) → `ServicioNoDisponibleException`
- [ ] 🟢 Implementar `InscritosRestClient` con `Spring RestClient`; timeout 5s; mapeo de respuesta REST → `List<Inscrito>`

`solicitudes-api`:
- [ ] 🔴 Escribir `InscritosControllerTest` con MockMvc: (a) NIT con letras → 400 sin invocar servicio, (b) búsqueda exitosa → 200 paginado, (c) servicio REST caído → 503, (d) sin resultados → 200 con `[]`
- [ ] 🟢 Implementar `InscritosController.GET /inscritos` con validación de NIT (solo dígitos, máx 15) y paginación

♻️ **Refactorizar** tras ciclos en verde: unificar `MatriculaFormatter` y `NitFormatter` en un `DocumentoFormatter` con estrategia parametrizable por tipo

**Criterios de aceptación:**
- CA-01.1: Búsqueda por matrícula `12345` → formatea a `00012345` y retorna inscrito
- CA-01.2: Matrícula inexistente → 200 con lista vacía + mensaje informativo
- CA-01.3: Más de 50 resultados → paginados, P95 < 2s (RNF-01)
- CA-01.4: Servicio REST caído → 503 con mensaje amigable + error en logs con correlationId
- CA-01.5: NIT con caracteres no numéricos → 400 sin invocar servicio externo

**Dependencias:** TKT-001, TKT-002, TKT-007

---

### TKT-031 — Implementar consulta de catálogo de certificados (HU-02)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-031 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-02 |
| **RF** | RF-02, RF-08 |
| **RN** | RN-09, RN-10 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `GET /api/v1/inscritos/{matricula}/certificados` que retorna el catálogo de tipos de certificado disponibles para una matrícula, aplicando las exclusiones de la regla de negocio (IDs excluidos y estado de proponente).

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `CatalogoFilterTest`: (a) catálogo completo de TiendaWS → excluye IDs 8, 13, 14, 19-28 siempre, (b) proponente en estado 2800 → además excluye ID 7, (c) proponente en estado 2802 → además excluye ID 7, (d) proponente en otro estado → ID 7 incluido
- [ ] 🟢 Implementar `CatalogoFilter.filtrarParaWebPublica(List<TipoCertificado>, boolean esProponente2800or2802)` y Value Object `TipoCertificado`

`solicitudes-application`:
- [ ] 🔴 Escribir `ConsultarCatalogoCertificadosHandlerTest` con Mockito: (a) TiendaWS retorna catálogo → se aplica filtro y retorna lista filtrada, (b) TiendaWS con timeout → lanza `ServicioNoDisponibleException`, (c) cache hit → `TiendaService` **no se invoca**
- [ ] 🟢 Implementar `ConsultarCatalogoCertificadosQuery`, `ConsultarCatalogoCertificadosHandler` y port `TiendaService`

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `TiendaSoapAdapterIT` con WireMock (SOAP): (a) operación `ObtenerCatalogoCertificados` exitosa → mapeo correcto, (b) timeout → `ServicioNoDisponibleException`, (c) circuit breaker abierto → falla-rápido sin llamada real
- [ ] 🟢 Implementar `TiendaSoapAdapter` con Apache CXF; timeout 8s; circuit breaker de TKT-003

`solicitudes-api`:
- [ ] 🔴 Escribir `CatalogoControllerTest` con MockMvc: (a) primera llamada → 200 con lista filtrada, (b) segunda llamada inmediata → cacheada (verificar con spy que el handler no se invoca dos veces), (c) TiendaWS caído → 503
- [ ] 🟢 Implementar `GET /inscritos/{matricula}/certificados` con `@Cacheable` Redis (TTL configurable)

♻️ **Refactorizar** tras ciclos en verde: verificar si la lista de IDs excluidos (RN-09) debe ser configurable en `application.yml` en lugar de hardcodeada en el dominio

**Criterios de aceptación:**
- CA-02.1: Catálogo no incluye IDs: 8, 13, 14, 19-28
- CA-02.2: Proponente en estado 2800/2802 → catálogo tampoco incluye ID 7
- CA-02.3: TiendaWS con timeout → circuit breaker activo → 503
- CA-02.4: Sin certificados disponibles → 200 con lista vacía
- Catálogo cacheado en Redis con TTL configurable (RF-36)

**Dependencias:** TKT-003, TKT-030

---

### TKT-032 — Implementar liquidación estándar PUP (HU-03)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-032 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-03 |
| **RF** | RF-03, RF-04, RF-05, RF-06, RF-14 |
| **RN** | RN-02, RN-03, RN-12, RN-14 |
| **Prioridad** | Alta |
| **Estimación** | 21 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `POST /api/v1/liquidaciones` — el flujo de liquidación estándar completo: crear solicitante, crear solicitud, liquidar en PUP (servicioId=36), crear cotización, registrar trazabilidad y retornar URL de pasarela. Opera como transacción atómica.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain` — _las reglas de negocio más críticas; se testean primero sin Spring_:
- [ ] 🔴 Escribir `SolicitudEstadosTest`: (a) transiciones válidas CREADA→GENERADA→ORDEN_PAGO_GENERADA→PAGADA→CERTIFICADO_EMITIDO→DESCARGADA, (b) transición inválida → `EstadoInvalidoException`, (c) `generarOrdenPago()` solo válido en estado GENERADA
- [ ] 🔴 Escribir `SolicitudReglasNegocioTest`: (a) carrito con 100 ítems exactos → válido, (b) carrito con 101 ítems → `LimiteSolicitudException` (RN-02), (c) `calcularFechaLimitePago()` → 31-dic del año en curso (RN-03)
- [ ] 🟢 Implementar entidades `Solicitud` (máquina de estados + reglas), `Solicitante`, `Cotizacion`, `Trazabilidad`, `SolicitudCertificado` y excepción `LimiteSolicitudException`

`solicitudes-application`:
- [ ] 🔴 Escribir `LiquidarSolicitudHandlerTest` con Mockito (todos los puertos mockeados): (a) flujo completo exitoso → retorna `{solicitudId, total, numeroOrden, urlPasarela}` con 9 pasos en orden correcto, (b) carrito con > 100 ítems → `LimiteSolicitudException` **antes** de invocar PUP, (c) email inválido → `ValidacionException` **antes** de invocar PUP, (d) PUP falla → `PupException` + rollback, (e) segunda llamada idéntica → retorna misma respuesta (idempotencia)
- [ ] 🔴 Escribir `IdempotenciaTest`: dos `LiquidarSolicitudCommand` con mismo hash de datos → mismo `solicitudId`, PUP invocado solo una vez
- [ ] 🟢 Implementar `LiquidarSolicitudCommand`, `LiquidarSolicitudHandler` (orquestador de 9 pasos) y ports: `SolicitudRepository`, `PupLiquidacionService`, `EncriptacionService`

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `JdbcSolicitudRepositoryIT` con Testcontainers (SQL Server): (a) `createSolicitante()` inserta y retorna ID, (b) `createSolicitud()` genera solicitud en estado GENERADA, (c) `createCotizacion()` y `createTrazabilidad()` insertan correctamente, (d) fallo en cualquier paso → rollback completo de la transacción
- [ ] 🔴 Escribir `EncriptacionRestClientIT` con WireMock: Lambda disponible → retorna token; Lambda timeout (2s) → `EncriptacionException`
- [ ] 🟢 Implementar `JdbcSolicitudRepository`, `EncriptacionRestClient` y la anotación `@Transactional` en el handler

`solicitudes-api`:
- [ ] 🔴 Escribir `LiquidacionesControllerTest` con MockMvc: (a) request válido → 201 con `{solicitudId, total, numeroOrden, urlPasarela}`, (b) email inválido en body → 400 con campo específico, (c) carrito vacío → 400, (d) cantidad ≤ 0 → 400 en campo específico
- [ ] 🔴 Escribir `LiquidacionConcurrenciaIT` con `@SpringBootTest`: doble clic simultáneo (2 threads idénticos) → misma solicitudId en ambas respuestas, sin registros duplicados en BD
- [ ] 🟢 Implementar `LiquidacionesController.POST /liquidaciones` con validación Jakarta y timer Micrometer para SLO de latencia (P95 < 10s)

♻️ **Refactorizar** tras ciclos en verde: extraer los 9 pasos del orquestador a métodos privados con nombres que reflejen el dominio; revisar si la idempotencia puede ser un aspecto `@Idempotent` reutilizable

**Criterios de aceptación:**
- CA-03.1: Liquidación exitosa → solicitud creada, cotización creada, URL pasarela retornada, estados y trazabilidad registrados
- CA-03.2: > 100 ítems → 422 con mensaje "máximo 100 certificados por transacción"
- CA-03.3: Error PUP → sin cotización, trazabilidad del error, opción de reintentar
- CA-03.4: Email inválido → 400 con error en campo específico, sin invocar PUP
- CA-03.5: Doble clic → mismo solicitudId retornado, sin duplicados en BD ni en PUP
- Latencia P95 < 10s (RNF-02)

**Dependencias:** TKT-003, TKT-030, TKT-031, TKT-007 _(las tablas de solicitudes, cotizaciones y trazabilidad existen en la BD actual; no requieren migración Liquibase)_

---

### TKT-033 — Implementar integración con pasarela de pagos (HU-10)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-033 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-10 |
| **RF** | RF-06 |
| **RN** | RN-03 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 3 |

**Descripción**  
Implementar el flujo de integración con la pasarela de pagos CCB: encriptación del solicitudId vía AWS Lambda, construcción de la URL de redirección, recepción del callback de confirmación de pago y actualización de estado a PAGADA.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Ampliar `SolicitudEstadosTest`: (a) `registrarPago()` en estado ORDEN_PAGO_GENERADA → PAGADA, (b) `registrarPago()` en otro estado → `EstadoInvalidoException`, (c) `marcarVencida()` cuando fecha límite superada → VENCIDA
- [ ] 🟢 Implementar `Solicitud.registrarPago()` y `Solicitud.marcarVencida()` en la máquina de estados

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `EncriptacionLambdaClientIT` con WireMock: (a) Lambda disponible → retorna `{token}` en < 2s, (b) Lambda timeout → lanza `EncriptacionException` tras 2s exactos, (c) Lambda error 500 → lanza `EncriptacionException`
- [ ] 🔴 Escribir `PasarelaPagoUrlBuilderTest`: token encriptado + servicioId → URL con formato correcto (protocolo pasarela CCB)
- [ ] 🟢 Implementar `EncriptacionLambdaClient` y `PasarelaPagoUrlBuilder`

`solicitudes-api`:
- [ ] 🔴 Escribir `PagoControllerTest` con MockMvc: (a) GET `/solicitudes/{id}/pago-url` → 200 con URL, (b) Lambda no disponible → 503 y solicitud permanece en estado ORDEN_PAGO_GENERADA (CA-10.3), (c) POST callback con firma válida → 200 + estado cambia a PAGADA, (d) POST callback con firma inválida → 401
- [ ] 🟢 Implementar `GET /pago-url`, `POST /confirmacion-pago` con validación de firma y actualización de estado + trazabilidad
- [ ] 🔴 Escribir `VencimientoJobTest`: solicitudes en estado ORDEN_PAGO_GENERADA con fecha límite anterior a hoy → `marcarVencida()` invocado en cada una; solicitudes pagadas → no afectadas
- [ ] 🟢 Implementar `@Scheduled` job que procese vencimientos diariamente (CA-10.4)

♻️ **Refactorizar** tras ciclos en verde: validar si el job de vencimiento debe tener su propia transacción por solicitud (para que un fallo individual no detenga el batch completo)

**Criterios de aceptación:**
- CA-10.1: Liquidación > $0 → URL de pasarela generada con token encriptado
- CA-10.2: Pago abandonado → solicitud permanece en ORDEN_PAGO_GENERADA hasta 31-dic
- CA-10.3: Lambda no disponible → 503 + solicitud no pierde estado
- CA-10.4: Orden después de 31-dic → estado VENCIDA, opción de nueva solicitud

**Dependencias:** TKT-032

---

### TKT-034 — Implementar pago en cero para afiliados (HU-11)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-034 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-11 |
| **RF** | RF-07 |
| **RN** | RN-14 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 3 |

**Descripción**  
Implementar el registro automático de pago en cero cuando el total de liquidación PUP es $0, sin necesidad de redirigir a la pasarela de pagos. Aplica para afiliados con beneficio completo.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Ampliar `SolicitudEstadosTest`: (a) `registrarPagoEnCero()` en estado ORDEN_PAGO_GENERADA con total=0 → PAGADA, (b) `registrarPagoEnCero()` con total>0 → `TotalNoEsCeroException`, (c) `registrarPagoEnCero()` en estado distinto a ORDEN_PAGO_GENERADA → `ConflictoEstadoException`
- [ ] 🟢 Implementar `Solicitud.registrarPagoEnCero()` con validaciones de total y estado

`solicitudes-application`:
- [ ] 🔴 Escribir `RegistrarPagoEnCeroHandlerTest` con Mockito: (a) total=0 + contexto válido → estado PAGADA + trazabilidad registrada, (b) total=0 para usuario no afiliado → pago registrado + alerta logueada (CA-11.2, no bloquea)
- [ ] 🟢 Implementar `RegistrarPagoEnCeroCommand` y `RegistrarPagoEnCeroHandler`

`solicitudes-api`:
- [ ] 🔴 Ampliar `LiquidacionesControllerTest`: total=0 de PUP → NO aparece campo `urlPasarela` en la respuesta; aparece `{confirmacionInmediata: true}` (CA-11.1)
- [ ] 🟢 Actualizar `LiquidarSolicitudHandler` para invocar automáticamente `RegistrarPagoEnCeroHandler` cuando total=0; no incluir redirect en respuesta

♻️ **Refactorizar** tras ciclos en verde: validar si la regla de "total=0 para no afiliado" debería ser una alerta de auditoría persistente en BD o solo un log

**Criterios de aceptación:**
- CA-11.1: Total $0 de PUP → pago en cero automático → estado PAGADA → trazabilidad → sin redirect a pasarela
- CA-11.2: Total $0 para no afiliado → alerta en logs + revisión manual (no bloquea transacción válida)
- CA-11.3: Saldo parcial → total > $0 → redirige a pasarela por el monto restante + informa unidades cubiertas

**Dependencias:** TKT-032

---

### TKT-035 — Implementar notificación de certificado generado por backoffice (HU-15)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-035 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-15 |
| **RF** | RF-31, RF-32, RF-33 |
| **RN** | RN-01, RN-07, RN-15 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `PUT /api/v1/solicitudes/{id}/estado` para que el motor de generación notifique que un certificado PDF fue generado. Inserta los códigos de verificación (14 chars, vigencia 60 días) y envía email al solicitante.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Ampliar `SolicitudEstadosTest`: (a) `marcarCertificadoGenerado()` en estado PAGADA → CERTIFICADO_EMITIDO, (b) `marcarCertificadoGenerado()` en estado ya CERTIFICADO_EMITIDO → no lanza excepción (idempotente, CA-15.3), (c) `marcarCertificadoGenerado()` en otro estado → `ConflictoEstadoException`
- [ ] 🔴 Escribir `CodigoVerificacionDomainTest`: (a) código de 14 chars alfanuméricos → válido, (b) código de 13 chars → `FormatoInvalidoException` (RN-07), (c) `diasVigencia=60` → `fechaVencimiento = hoy + 60 días`
- [ ] 🟢 Implementar `Solicitud.marcarCertificadoGenerado()` con lógica de idempotencia y `CodigoVerificacion.crear(String codigo, int diasVigencia)`

`solicitudes-application`:
- [ ] 🔴 Escribir `NotificarCertificadoHandlerTest` con Mockito: (a) flujo completo exitoso → estado actualizado, códigos persistidos, email enviado, (b) segunda notificación idéntica → 200 sin duplicados, `EmailService` **no invocado** segunda vez (CA-15.3), (c) solicitud no encontrada → `RecursoNoEncontradoException`, (d) estado incorrecto → `ConflictoEstadoException`, (e) fallo SMTP → BD comprometida OK, error logueado, reintento encolado (CA-15.4)
- [ ] 🟢 Implementar `NotificarCertificadoCommand`, `NotificarCertificadoHandler` y port `EmailNotificationService`

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `EmailNotificationServiceIT` con GreenMail (SMTP embebido para tests): (a) email enviado → se recibe en servidor de test, (b) SMTP caído → `EmailException` después de N reintentos
- [ ] 🟢 Implementar `SpringEmailNotificationService` con `JavaMailSender` y template de email; lógica de reintento con fallo graceful

`solicitudes-api`:
- [ ] 🔴 Escribir `EstadoControllerTest` con MockMvc: (a) PUT con credenciales backoffice → 200, (b) segunda llamada idéntica → 200 sin errores (idempotencia), (c) sin credenciales → 401, (d) solicitud inexistente → 404, (e) estado incorrecto → 409
- [ ] 🟢 Implementar `PUT /solicitudes/{id}/estado` con autenticación de credenciales de servicio

♻️ **Refactorizar** tras ciclos en verde: el envío de email puede convertirse en un evento de dominio (`CertificadoGeneradoEvent`) publicado asincrónicamente, desacoplando la notificación del flujo principal

**Criterios de aceptación:**
- CA-15.1: Notificación exitosa → estado CERTIFICADO_EMITIDO, códigos insertados (60 días), email enviado
- CA-15.2: Solicitud no existe → 404; estado no es PAGADA → 409
- CA-15.3: Segunda notificación → 200 idempotente, sin duplicados, sin doble email
- CA-15.4: Fallo SMTP → transacción BD comprometida OK, fallo logueado, reintento encolado
- CA-15.5: Sin credenciales → 401, intento registrado en logs de seguridad

**Dependencias:** TKT-032, TKT-033

---

### TKT-036 — Implementar devolución de solicitud (HU-16)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-036 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | HU-16 |
| **RF** | RF-34 |
| **Prioridad** | Media |
| **Estimación** | 5 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `PUT /api/v1/solicitudes/{id}/devolucion` para que el backoffice devuelva una solicitud que no pudo ser procesada, incluyendo motivo, notificación al solicitante y alerta de reembolso.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Ampliar `SolicitudEstadosTest`: (a) `devolver("motivo")` en estado PAGADA → DEVUELTA, (b) `devolver()` en estado distinto a PAGADA → `ConflictoEstadoException`, (c) `devolver()` con motivo vacío → `MotivoRequeridoException`
- [ ] 🟢 Implementar `Solicitud.devolver(String motivo)` con validaciones de estado y motivo

`solicitudes-application`:
- [ ] 🔴 Escribir `DevolverSolicitudHandlerTest` con Mockito: (a) devolución de solicitud PAGADA con total > 0 → actualiza estado, envía email, genera alerta de reembolso, (b) devolución de solicitud PAGADA con total = 0 → actualiza estado, envía email, **no** genera alerta, (c) estado no PAGADA → lanza `ConflictoEstadoException` sin efectos secundarios
- [ ] 🟢 Implementar `DevolverSolicitudCommand` y `DevolverSolicitudHandler`

`solicitudes-api`:
- [ ] 🔴 Escribir `DevolucionControllerTest` con MockMvc: (a) PUT con motivo válido y credencial backoffice → 200, (b) motivo vacío → 400 con mensaje específico (CA-16.3), (c) solicitud en estado no PAGADA → 409 (CA-16.2), (d) sin credencial backoffice → 403
- [ ] 🟢 Implementar `PUT /solicitudes/{id}/devolucion` con autenticación de backoffice

♻️ **Refactorizar** tras ciclos en verde: extraer el patrón de "ejecutar acción de dominio + emitir notificación" a un template reutilizable en otros handlers (TKT-035, TKT-036)

**Criterios de aceptación:**
- CA-16.1: Devolución exitosa → estado DEVUELTA, trazabilidad, email con motivo al solicitante
- CA-16.2: Estado no PAGADA → 409 "Solo se pueden devolver solicitudes en estado PAGADA"
- CA-16.3: Sin motivo → 400 "El motivo es obligatorio"
- CA-16.4: Solicitud con total > 0 → alerta de reembolso generada para equipo de finanzas

**Dependencias:** TKT-035

---

### TKT-037 — Implementar catálogos con caché Redis

| Campo | Valor |
|-------|-------|
| **ID** | TKT-037 |
| **Épica** | EPIC-04 |
| **Tipo** | Feature |
| **HU** | — |
| **RF** | RF-35, RF-36 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 3 |

**Descripción**  
Implementar `GET /api/v1/catalogos/{tipo}` que retorna catálogos estáticos (tipos de documento, municipios, sedes, formas de pago, opciones de búsqueda) con caché Redis de TTL configurable.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `CatalogosRepositoryIT` con Testcontainers (SQL Server): cada tipo de catálogo (`tiposDocumento`, `municipios`, `sedes`, `formasPago`, `opcionesBusqueda`) retorna datos correctamente desde las tablas existentes
- [ ] 🟢 Implementar `CatalogosRepository` con queries JDBC sobre tablas existentes de catálogos en BD
- [ ] 🔴 Escribir `CatalogosControllerTest` con MockMvc: (a) primera llamada → 200 con datos del repositorio, (b) segunda llamada inmediata → respuesta cacheada (spy verifica que el repositorio no fue invocado dos veces), (c) tipo desconocido → 404, (d) Redis caído → 200 consultando BD directamente (degradado)
- [ ] 🟢 Implementar `CatalogosController.GET /catalogos/{tipo}` con `@Cacheable("catalogos")` y TTL por tipo configurable en `application.yml`; fallback a BD si Redis no disponible
- [ ] 🔴 Escribir `CacheInvalidacionTest`: `DELETE /catalogos/cache` elimina la entrada de Redis → siguiente GET consulta BD nuevamente
- [ ] 🟢 Implementar `DELETE /catalogos/cache` (endpoint interno de admin)

♻️ **Refactorizar** tras ciclos en verde: revisar si el TTL debería ser configurable por tipo de catálogo individual (catálogos más dinámicos como sedes vs. más estáticos como tipos de documento)

**Criterios de aceptación:**
- Primera llamada consulta BD y almacena en Redis
- Segunda llamada retorna desde Redis (sin consulta a BD)
- TTL configurable por tipo de catálogo
- Si Redis no disponible → funciona degradado consultando BD directamente

**Dependencias:** TKT-001, TKT-004, TKT-007 _(las tablas de catálogos existen en la BD actual; Redis se usa solo como capa de caché, no como almacenamiento primario)_

---

## EPIC-05 — Módulos Especiales de Solicitudes

> **Objetivo:** Implementar los módulos de afiliados, depósitos, especiales, costumbres mercantiles y app móvil sobre la base del servicio de solicitudes core.

---

### TKT-040 — Implementar autenticación MAUC SSO para afiliados (HU-03A)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-040 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-03A |
| **RF** | RF-16, RF-17, RF-19 |
| **RN** | RN-05 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 4 |

**Descripción**  
Implementar la autenticación completa vía MAUC SSO (OIDC/JWT): validación de token JWT con firma verificada, validación de representante legal, validación pre-pago del token y cierre de sesión.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `TokenMaucTest`: (a) `correspondeASolicitante()` con tipo y número correctos → `true`, (b) documento distinto → `false`, (c) token expirado → `false`, (d) formato username inválido → excepción al construir el VO
- [ ] 🟢 Implementar `TokenMauc` Value Object con `correspondeASolicitante()`, `TokenMaucNoCorrespondeException` y `NoEsRepresentanteLegalException`

`solicitudes-application`:
- [ ] 🔴 Escribir `ValidarTokenMaucHandlerTest` con Mockito (los 5 pasos son casos de test separados): (a) token con firma inválida → rechazado **sin** consultar TiendaWS, (b) claim `username` no coincide → `TokenMaucNoCorrespondeException` **sin** consultar TiendaWS, (c) no es representante legal → `NoEsRepresentanteLegalException`, (d) token expirado pre-pago → `TokenExpiradoException`, (e) flujo exitoso → retorna `{esAfiliado:true, saldoDisponible}`
- [ ] 🔴 Escribir test de seguridad: verificar con ArchUnit que la validación de firma JWKS se realiza **siempre** antes de extraer claims (no se hace parse directo del JWT sin verificar)
- [ ] 🟢 Implementar `ValidarTokenMaucHandler` (verifica JWKS endpoint de MAUC), `ValidarTokenPrePagoCommand`, `CerrarSesionMaucCommand` y port `MaucAuthService`

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `MaucAuthRestClientIT` con WireMock: (a) `tokenCheck()` retorna `true` → válido, (b) `tokenCheck()` con token expirado → `false`, (c) MAUC no disponible → `ServicioNoDisponibleException`, (d) `signOut()` exitoso → 200 en MAUC
- [ ] 🟢 Implementar `MaucAuthRestClient` y ampliar `TiendaSoapAdapter` con `obtenerRepresentantesLegales()`

`solicitudes-api`:
- [ ] 🔴 Escribir `TokenMaucControllerTest` con MockMvc: (a) token válido → 200 `{esAfiliado, saldoDisponible}`, (b) MAUC no disponible → 503 con mensaje para flujo estándar (CA-03A.3)
- [ ] 🟢 Implementar `POST /auth/token-mauc`

♻️ **Refactorizar** tras ciclos en verde: crear `JwtVerifier` como componente desacoplado que encapsule toda la lógica de verificación JWKS, usable también en el security filter general

**Criterios de aceptación:**
- CA-03A.1: Autenticación exitosa + representante legal → flujo de beneficio habilitado
- CA-03A.2: Token con documento diferente → mensaje de error + opción de flujo estándar
- CA-03A.3: MAUC no disponible → degradación graceful con flujo estándar
- CA-03A.4: Token expirado antes del pago → re-autenticación sin perder carrito
- CA-03A.5: No es representante legal → mensaje + flujo estándar (sin beneficio)
- CA-03A.6: Sesión cerrada post-transacción → token invalidado en MAUC
- CA-03A.7: Establecimiento → busca afiliación en sociedad propietaria

**Dependencias:** TKT-003, TKT-032

---

### TKT-041 — Implementar liquidación de afiliados (HU-04)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-041 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-04 |
| **RF** | RF-12, RF-20 |
| **RN** | RN-04, RN-05 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 4 |

**Descripción**  
Implementar `POST /api/v1/liquidaciones/afiliados` que liquida certificados gratuitos con `servicioLiquidarId=4` contra la cuota de afiliación, y certificados con costo con el flujo estándar.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `ClasificarCertificadosTest`: (a) carrito con solo IDs gratuitos → todos en `gratuitos`, (b) carrito con solo IDs no gratuitos → todos en `conCosto`, (c) carrito mixto → clasificados correctamente, (d) carrito con ID 7 → clasificado como `conCosto`
- [ ] 🟢 Implementar `CertificadosGratuitosAfiliado` (IDs = {1,2,3,4,11,13,17,32}, RN-04) y `ClasificarCertificados.clasificar()`

`solicitudes-application`:
- [ ] 🔴 Escribir `LiquidarAfiliadoHandlerTest` con Mockito (7 pasos, cada uno es un caso de test): (a) saldo suficiente + carrito solo gratuitos → `servicioLiquidarId=4` en PUP, sin cargo, (b) saldo suficiente + carrito mixto → dos liquidaciones separadas: gratuitos con `id=4`, con costo con `id=36`, (c) saldo insuficiente → informar y ofrecer estándar sin bloquear (CA-04.4), (d) no es representante legal → rechaza antes de consultar saldo
- [ ] 🟢 Implementar `LiquidarAfiliadoCommand` y `LiquidarAfiliadoHandler` con los 7 pasos

**Criterios de aceptación:**
- CA-04.1: Certificados gratuitos con saldo → liquidación $0, pago en cero, descuento de cuota
- CA-04.2: No es representante legal → denegado, opción de flujo estándar
- CA-04.3: Carrito mixto → dos liquidaciones separadas correctamente
- CA-04.4: Saldo agotado → informa, ofrece pago estándar sin bloquear
- CA-04.5: Token expirado → re-autenticación sin perder carrito

**Dependencias:** TKT-040, TKT-032, TKT-034

---

### TKT-042 — Implementar consulta de matrícula principal SHD (HU-05)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-042 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-05 |
| **RF** | RF-13 |
| **RN** | RN-06 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 4 |

**Descripción**  
Implementar `GET /api/v1/inscritos/{matricula}/principal` que consulta vía SHD la matrícula principal (sociedad propietaria) de un establecimiento comercial para validar afiliación.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Ampliar `ShdSoapAdapterIT` (de TKT-003) con WireMock: `obtenerMatriculaPrincipal()` con establecimiento válido → matrícula de sociedad propietaria; establecimiento sin propietario afiliado → `Optional.empty()`
- [ ] 🟢 Implementar `ShdSoapAdapter.obtenerMatriculaPrincipal(String matriculaEstablecimiento)`
- [ ] 🔴 Escribir `ConsultarMatriculaPrincipalHandlerTest` con Mockito: (a) establecimiento con sociedad afiliada → retorna `{matriculaPrincipal, esAfiliado: true}`, (b) sociedad no afiliada → `{esAfiliado: false}` (CA-05.2), (c) SHD caído → lanza `ServicioNoDisponibleException`
- [ ] 🟢 Implementar `ConsultarMatriculaPrincipalHandler`
- [ ] 🔴 Escribir `MatriculaPrincipalControllerTest` con MockMvc: (a) respuesta exitosa → 200 con `{matriculaPrincipal, esAfiliado}`, (b) SHD no disponible → 503 con mensaje de flujo estándar (CA-05.3)
- [ ] 🟢 Implementar `GET /inscritos/{matricula}/principal`

♻️ **Refactorizar** tras ciclos en verde: verificar si el circuit breaker de SHD es compartido con el de TiendaWS o son instancias independientes

**Criterios de aceptación:**
- CA-05.1: Establecimiento con sociedad afiliada → matrícula principal + beneficio habilitado
- CA-05.2: Sociedad propietaria no afiliada → `esAfiliado: false`, flujo estándar
- CA-05.3: SHD no disponible → 503, flujo estándar sin beneficio

**Dependencias:** TKT-003, TKT-030, TKT-041

---

### TKT-043 — Implementar liquidación de certificados especiales (HU-06)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-043 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-06 |
| **RF** | RF-09 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 4 |

**Descripción**  
Implementar `POST /api/v1/liquidaciones/especiales` para certificados textual (tipo=1), negativo (tipo=2) e histórico (tipo=3) con `servicioNegocioVirtualId=19` y `servicioLiquidarId=34`.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `TipoEspecialTest`: (a) tipo=1 → TEXTUAL, (b) tipo=2 → NEGATIVO, (c) tipo=3 → HISTORICO, (d) tipo=4 → `TipoEspecialInvalidoException` (CA-06.4)
- [ ] 🟢 Implementar `TipoEspecial` enum y `SolicitudEspecial` con campos: tipoEspecial, matricula (opcional), datos formulario

`solicitudes-application`:
- [ ] 🔴 Escribir `LiquidarEspecialHandlerTest` con Mockito: (a) tipo=1 (Textual) + matrícula → PUP invocado con `servicioNegocioVirtualId=19`, `servicioLiquidarId=34`, solicitud tipo 2 creada, carta generada (TKT-046), (b) tipo=2 (Negativo) sin matrícula → flujo de no matriculado habilitado (CA-06.2), (c) error PUP → sin carta, sin cotización, datos preservados (CA-06.3), (d) tipo=4 → `TipoEspecialInvalidoException` antes de invocar PUP
- [ ] 🟢 Implementar `LiquidarEspecialCommand` y `LiquidarEspecialHandler` (4 pasos)

♻️ **Refactorizar** tras ciclos en verde: evaluar si TKT-043 y TKT-044 pueden compartir el mismo handler con una estrategia polimórfica por tipo especial

**Criterios de aceptación:**
- CA-06.1: Textual exitoso → liquidación, solicitud tipo 2, carta adjunta, URL pago
- CA-06.2: Negativo sin matrícula → formulario "no matriculado" habilitado
- CA-06.3: Error PUP → sin carta, sin cotización, datos preservados para reintento
- CA-06.4: Tipo diferente a 1/2/3 → 400 con valores permitidos

**Dependencias:** TKT-032, TKT-046

---

### TKT-044 — Implementar certificado negativo para no matriculados (HU-06A)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-044 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-06A |
| **RF** | RF-09 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 4 |

**Descripción**  
Implementar el formulario y flujo de liquidación para personas sin matrícula activa que necesitan un certificado negativo (ID 101, servicio `01010107`), con ingreso manual de datos de identificación.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `LiquidarNegativoNoMatriculadoHandlerTest` con Mockito: (a) formulario completo → invoca PUP con `servicioNegocioVirtualId=19`, `servicioLiquidarId=34`, `IdServicio=34`, (b) nombre vacío → `ValidacionException` **antes** de invocar PUP, (c) cantidad ≤ 0 → `ValidacionException`, (d) segundo ítem en carrito → reemplaza el primero (CA-06A.4, solo un ítem)
- [ ] 🟢 Implementar `LiquidarNegativoNoMatriculadoCommand` con validaciones Jakarta
- [ ] 🟢 Implementar handler que usa los datos del formulario como datos de la carta (en lugar de datos de matrícula del inscrito)
- [ ] 🔴 Escribir `NegativoNoMatriculadoControllerTest` con MockMvc: (a) request válido → 201, (b) campos obligatorios vacíos → 400 por campo específico, (c) cantidad = 0 → 400

♻️ **Refactorizar** tras ciclos en verde: extraer la lógica de "un solo ítem en carrito" como política reutilizable compartida con TKT-043

**Criterios de aceptación:**
- CA-06A.1: Liquidación exitosa → solicitud tipo 2, carta con datos del formulario, redirect a pago
- CA-06A.2: Campos obligatorios vacíos → 400 por campo faltante
- CA-06A.3: Cantidad ≤ 0 → 400 "la cantidad mínima es 1"
- CA-06A.4: Segundo ítem → reemplaza el primero, no crea duplicado

**Dependencias:** TKT-043

---

### TKT-045 — Implementar consulta de Kardex mercantil (HU-06B)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-045 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-06B |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 4 |

**Descripción**  
Implementar búsqueda y selección de registros del Kardex mercantil para la solicitud de certificados textuales, con filtros por fecha, número de registro y palabra clave.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `FiltroKardexTest`: (a) ningún criterio → `FiltroCriterioException`, (b) fechaInicio sin fechaFin → `FechaFinRequeridaException`, (c) ambas fechas → válido
- [ ] 🟢 Implementar `FiltroKardex` con validaciones de negocio y `RegistroKardex` con pad-left 8 dígitos en `numeroRegistro`
- [ ] 🔴 Escribir `KardexRepositoryIT` con Testcontainers (SQL Server): (a) SP `SCISP_ObtenerKardex` retorna resultados → lista mapeada correctamente, (b) SP sin resultados → lista vacía
- [ ] 🟢 Implementar `KardexRepository.buscar()` invocando SP existente con los parámetros del filtro
- [ ] 🔴 Escribir `KardexControllerTest` con MockMvc: (a) sin criterios → 400, (b) fechaInicio sin fechaFin → 400, (c) búsqueda exitosa → 200 con lista, (d) sin resultados → 200 con `[]`
- [ ] 🟢 Implementar `GET /inscritos/{matricula}/kardex` con validación de filtros

♻️ **Refactorizar** tras ciclos en verde: revisar si el pad-left de `numeroRegistro` debe estar en el dominio (`RegistroKardex`) o en el mapper de infraestructura

**Criterios de aceptación:**
- CA-06B.1: Búsqueda por fechas → lista con número de registro, tipo, libro, fechas
- CA-06B.2: Sin criterios → 400 "ingrese al menos un criterio"
- CA-06B.3: Fecha inicio sin fecha fin → 400
- CA-06B.4: Sin resultados → 200 lista vacía
- CA-06B.5: Selección de registro + cantidad + observación → agrega al carrito de textuales

**Dependencias:** TKT-043

---

### TKT-046 — Implementar generación de carta para certificados especiales (HU-06C)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-046 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-06C |
| **RF** | RF-09 |
| **Prioridad** | Media |
| **Estimación** | 8 pts |
| **Fase** | 4 |

**Descripción**  
Implementar la generación automática de carta de solicitud en PDF para certificados especiales, con almacenamiento en file share y capacidad de regeneración.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `CartaEspecialPdfGeneratorTest`: PDF generado con datos del solicitante contiene el texto esperado; lista de detalles aparece en el documento
- [ ] 🟢 Implementar `CartaEspecialPdfGenerator` (usando iText o similar)
- [ ] 🔴 Escribir `FileShareStorageServiceTest`: (a) guardado exitoso → sin excepción, (b) file share no disponible → lanza `FileShareNoDisponibleException` (no `RuntimeException` genérico)
- [ ] 🟢 Implementar `FileShareStorageService.guardar()` con patrón de nombre `Sol_{solicitudId}_{orden}_CartaEspecial.pdf`
- [ ] 🔴 Escribir `GenerarCartaEspecialHandlerTest` con Mockito: (a) guardado exitoso → 201, (b) file share no disponible → se loguea el error, se lanza excepción específica, la liquidación **no** se revierte (CA-06C.2 — validar con spy que `SolicitudRepository.revertir()` **no** fue llamado)
- [ ] 🟢 Implementar `GenerarCartaEspecialCommand` y `GET /solicitudes/{id}/carta` (regeneración desde BD)

♻️ **Refactorizar** tras ciclos en verde: compartir `FileShareStorageService` con TKT-049; extraer el patrón de nombre de archivo como método de fábrica reutilizable

**Criterios de aceptación:**
- CA-06C.1: Liquidación exitosa → carta generada y almacenada en file share
- CA-06C.2: File share no disponible → log + 500, liquidación no se revierte
- CA-06C.3: Regeneración manual → carta regenerada desde BD, sobrescribe anterior

**Dependencias:** TKT-043

---

### TKT-047 — Implementar autenticación OAuth para módulo de depósitos (HU-07A)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-047 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-07A |
| **RF** | RF-18 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 4 |

**Descripción**  
Implementar el sistema de autenticación OAuth propio para el módulo de depósitos financieros: login con tipo documento + número documento + clave + email, emisión de JWT con expiración de 8 horas.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

`solicitudes-domain`:
- [ ] 🔴 Escribir `UsuarioDepositosTest`: (a) número cédula con letras → `FormatoInvalidoException`, (b) email vacío → `EmailRequeridoException`, (c) datos válidos → objeto creado correctamente
- [ ] 🟢 Implementar `UsuarioDepositos` con validaciones de tipo documento y email

`solicitudes-infrastructure`:
- [ ] 🔴 Escribir `DepositosAuthRepositoryIT` con Testcontainers (SQL Server): (a) SP `SCISP_ValidarIngresoAfiliados` con credenciales válidas → `Optional<UsuarioDepositos>` con datos, (b) credenciales inválidas → `Optional.empty()`
- [ ] 🟢 Implementar `DepositosAuthRepository.validarCredenciales()` invocando el SP existente
- [ ] 🔴 Escribir `JwtTokenGeneratorTest`: token generado tiene expiración de exactamente 8 horas; claims contienen tipo y número de documento
- [ ] 🟢 Implementar `JwtTokenGenerator.generarTokenDepositos(UsuarioDepositos, Duration)` — expiración 8h

`solicitudes-api`:
- [ ] 🔴 Escribir `DepositosAuthControllerTest` con MockMvc: (a) credenciales válidas → 200 con `{access_token, token_type:"Bearer", expires_in:28800}`, (b) credenciales inválidas → 401 `{error:"invalid_grant"}` (CA-07A.2), (c) tipo cédula con letras → 400, (d) email vacío → 400
- [ ] 🟢 Implementar `POST /auth/depositos` y filtro de validación de token expirado → 401 en subsiguientes requests

♻️ **Refactorizar** tras ciclos en verde: unificar `JwtTokenGenerator` con el componente de generación JWT de MAUC si la estructura de claims es compatible

**Criterios de aceptación:**
- CA-07A.1: Credenciales válidas → access_token JWT 8h, navegación a matrículas vinculadas
- CA-07A.2: Credenciales inválidas → `invalid_grant` con mensaje orientativo
- CA-07A.3: Tipo cédula con letras → 400 validación client-side (y server-side)
- CA-07A.4: Email vacío → 400 campo obligatorio
- CA-07A.5: Token expirado → 401 + redirect a login de depósitos
- CA-07A.6: Sin aceptar términos → formulario no se envía

**Dependencias:** TKT-001, TKT-002, TKT-007 _(la tabla de usuarios de depósitos existe en la BD actual; se valida vía SP `SCISP_ValidarIngresoAfiliados`)_

---

### TKT-048 — Implementar liquidación de depósitos financieros (HU-07)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-048 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-07 |
| **RF** | RF-10 |
| **RN** | RN-12 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 4 |

**Descripción**  
Implementar `POST /api/v1/liquidaciones/depositos` para solicitudes de certificados de estados financieros depositados, con autenticación OAuth, consulta de matrículas vinculadas y liquidación con `servicioLiquidarId=35`.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `MatriculasVinculadasControllerTest` con MockMvc: (a) token OAuth depósitos válido → 200 con lista de matrículas, (b) token expirado → 401, (c) matrícula con < 8 dígitos → pad-left automático en la consulta (CA-07.4)
- [ ] 🟢 Implementar `GET /matriculas/{matricula}/vinculadas` y `GET /matriculas/{matricula}/depositos`
- [ ] 🔴 Escribir `LiquidarDepositosHandlerTest` con Mockito: (a) flujo completo → PUP invocado con `servicioLiquidarId=35`, solicitud tipo 3 creada, URL de pago retornada, (b) matrícula sin depósitos → 200 con mensaje informativo **sin** invocar PUP (CA-07.3), (c) matrícula con 5 dígitos → se pasa a PUP con 8 dígitos (pad-left)
- [ ] 🟢 Implementar `LiquidarDepositosCommand` y handler completo
- [ ] 🔴 Escribir `LiquidarDepositosControllerTest` con MockMvc: request válido → 201; sin token → 401

♻️ **Refactorizar** tras ciclos en verde: reutilizar `MatriculaFormatter` de TKT-030 en lugar de re-implementar el pad-left

**Criterios de aceptación:**
- CA-07.1: Flujo completo → autenticación OAuth, matrículas, estados, liquidación tipo 3, URL pago
- CA-07.2: Credenciales inválidas → 401 "Credenciales incorrectas"
- CA-07.3: Sin depósitos para matrícula → mensaje informativo, sin error
- CA-07.4: Matrícula con < 8 dígitos → pad-left automático antes de consultar

**Dependencias:** TKT-047, TKT-032

---

### TKT-049 — Implementar carta de solicitud para depósitos financieros (HU-07B)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-049 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-07B |
| **RF** | RF-10 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 4 |

**Descripción**  
Implementar el flujo completo de carta de depósitos: generación preliminar, liquidación, upload de PDFs adjuntos al file share (con contadores secuenciales), generación de carta final y vinculación con número de orden.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `CartaDepositosHandlerTest` con Mockito: (a) POST carta preliminar → contenido correcto con datos solicitante + carrito, (b) file share no disponible → error logueado, liquidación **no** revertida (CA-07B.3, verificar con spy que `SolicitudRepository.revertir()` no fue llamado), (c) token OAuth expirado durante upload → 401 con datos preservados (CA-07B.5)
- [ ] 🔴 Escribir `UploadSecuencialTest`: (a) 3 archivos PDF → contadores `_1.pdf`, `_2.pdf`, `_3.pdf`, (b) archivo no PDF → `ArchivoNoPdfException` (CA-07B.2), (c) `carritoNotas` y `carritoOtrosDocumentos` en secuencia continua (CA-07B.4)
- [ ] 🟢 Implementar `POST /carta-depositos` (generación preliminar) y upload secuencial a file share con nombre `Sol_{solicitudId}_{orden}_{n}.pdf`
- [ ] 🔴 Escribir `VincularOrdenTest`: PUT `/carta-depositos` vincula el `numeroOrden` a la carta correcta
- [ ] 🟢 Implementar `PUT /carta-depositos` — vinculación de número de orden

♻️ **Refactorizar** tras ciclos en verde: extraer el contador secuencial y la generación del nombre del archivo como un `NombreArchivoFactory` reutilizable con TKT-046

**Criterios de aceptación:**
- CA-07B.1: Flujo completo → carta preliminar, liquidación, uploads con contadores, carta final, redirect pago
- CA-07B.2: Archivo no PDF → mensaje con nombres inválidos, bloqueo hasta corrección
- CA-07B.3: File share no accesible → log + 500, liquidación preservada
- CA-07B.4: Notas y otros documentos subidos en secuencia con contadores correctos
- CA-07B.5: Token expirado → 401, datos preservados para re-autenticación

**Dependencias:** TKT-048

---

### TKT-050 — Implementar solicitud de costumbres mercantiles (HU-08)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-050 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-08 |
| **RF** | RF-11 |
| **Prioridad** | Media |
| **Estimación** | 5 pts |
| **Fase** | 4 |

**Descripción**  
Implementar el módulo de costumbres mercantiles: consulta de sectores disponibles vía TiendaWS (tipo 506), selección de certificados y liquidación estándar con `servicioId=36`.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Ampliar `TiendaSoapAdapterIT` (de TKT-003): `obtenerSectores(tipo=506)` retorna lista; sin sectores → lista vacía
- [ ] 🟢 Implementar `GET /costumbres/sectores` con manejo de lista vacía → 200 con mensaje informativo (CA-08.2)
- [ ] 🔴 Escribir `CostumbresControllerTest` con MockMvc: (a) sector disponible + liquidación → 201 con URL pago, (b) sector removido durante liquidación → error descriptivo de PUP (CA-08.3)
- [ ] 🟢 Reutilizar `LiquidarSolicitudHandler` con certificados de costumbres; `servicioId=36`

♻️ **Refactorizar** tras ciclos en verde: verificar si el endpoint de sectores puede cachearse en Redis (TTL corto, 5 min) dada la baja frecuencia de cambio

**Criterios de aceptación:**
- CA-08.1: Sectores disponibles → solicitud con certificados de costumbres, URL pago
- CA-08.2: TiendaWS retorna lista vacía → mensaje "no disponibles", opción de volver
- CA-08.3: Sector removido → error en liquidación + mensaje al usuario

**Dependencias:** TKT-003, TKT-032

---

### TKT-051 — Implementar API dedicada para app móvil (HU-09)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-051 |
| **Épica** | EPIC-05 |
| **Tipo** | Feature |
| **HU** | HU-09 |
| **RF** | RF-15 |
| **Prioridad** | Media |
| **Estimación** | 5 pts |
| **Fase** | 4 |

**Descripción**  
Exponer la API dedicada para la app móvil CCB con `tipoSolicitud=4`, autenticación por API key y respuestas estructuradas para errores de validación.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor por cada unidad)_**:**

- [ ] 🔴 Escribir `ApiKeyFilterTest`: (a) header `X-API-Key` con valor válido → permite request, (b) sin header → 401 sin detalles técnicos (CA-09.2), (c) API key inválida → 401 + log de intento fallido
- [ ] 🟢 Implementar `ApiKeyAuthFilter` y configurar en `SecurityConfig` para la ruta `/api/v1/solicitudes/movil`
- [ ] 🔴 Escribir `MovilControllerTest` con MockMvc: (a) payload completo + API key → 201 con URL pago, (b) email faltante → 400 `{"errores": [{"campo": "email", "mensaje": "..."}]}` (CA-09.3), (c) matricula faltante → 400 por campo, (d) sin API key → 401
- [ ] 🟢 Implementar `POST /api/v1/solicitudes/movil` reutilizando `LiquidarSolicitudHandler` con `tipoSolicitud=4`

♻️ **Refactorizar** tras ciclos en verde: el `ApiKeyAuthFilter` puede ser reutilizado por otros endpoints de servicio a servicio (backoffice, motor de generación) en lugar de usar credenciales separadas por cada uno

**Criterios de aceptación:**
- CA-09.1: Request válido → solicitud tipo 4, liquidación PUP, respuesta JSON con pago
- CA-09.2: Sin API key → 401 sin revelar detalles + log en seguridad
- CA-09.3: Campos faltantes → 400 con objeto de errores por campo

**Dependencias:** TKT-032

---

## EPIC-06 — Frontends Angular 22

> **Objetivo:** Implementar los dos portales frontend: Portal Certificados (autenticado, solicitudes + descargas) y Portal Verificación (público). Desarrollo en paralelo desde la Fase 1.

---

### TKT-060 — Setup y arquitectura del Portal Certificados Angular 22

| Campo | Valor |
|-------|-------|
| **ID** | TKT-060 |
| **Épica** | EPIC-06 |
| **Tipo** | Task |
| **HU** | — |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 5 (inicia en Fase 1) |

**Descripción**  
Configurar el proyecto Angular 22 para el Portal Certificados con estructura de features lazy-loaded, interceptores HTTP, guards de autenticación, Tailwind CSS 4.x y el store con Angular Signals.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor — en Angular: spec `.spec.ts` antes del componente/servicio)_**:**

- [ ] `ng new portal-certificados --standalone --routing --style=scss`; configurar Tailwind CSS 4.x, PrimeNG con tema CCB, proxy Angular CLI para `/api/**`
- [ ] 🔴 Escribir `auth.guard.spec.ts`: (a) sin token en sessionStorage → `canActivate()` retorna `UrlTree` a login, (b) con token válido → retorna `true`
- [ ] 🟢 Implementar `AuthGuard`
- [ ] 🔴 Escribir `auth.interceptor.spec.ts`: request sin token → no agrega header; request con token → agrega `Authorization: Bearer {token}`
- [ ] 🟢 Implementar `AuthInterceptor` y `CorrelationIdInterceptor`
- [ ] 🔴 Escribir `error.interceptor.spec.ts`: respuesta 401 → redirect a login; respuesta 503 → muestra toast de error
- [ ] 🟢 Implementar `ErrorInterceptor`
- [ ] 🔴 Escribir `carrito.store.spec.ts` (Angular Signals): agregar ítem → total actualizado; quitar ítem → lista actualizada; intentar agregar ≥ 101 → estado rechazado
- [ ] 🟢 Implementar `CarritoStore` con Angular Signals
- [ ] 🔴 Escribir specs para `LoadingSpinner`, `ErrorMessage`, `CarritoIndicator` y `NotificationService`
- [ ] 🟢 Implementar componentes y servicios `shared/`
- [ ] Estructura de features lazy-loaded: `busqueda`, `carrito`, `liquidacion`, `afiliados`, `depositos`, `especiales`, `costumbres`, `descargas`

♻️ **Refactorizar** tras ciclos en verde: revisar si el `CarritoStore` debe ser un Signal local o un store global (depende de si el carrito persiste entre rutas)

**Criterios de aceptación:**
- `ng build --configuration production` compila sin errores ni warnings
- Lazy loading verificado: cada feature se carga solo al navegar a su ruta
- Interceptores activos: token en headers, correlation ID propagado
- Responsive y compatible: Chrome, Edge, Firefox, Safari (RNF-31)

**Dependencias:** TKT-001

---

### TKT-061 — Implementar módulo de búsqueda de inscrito (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-061 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-01, HU-02 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 5 |

**Descripción**  
Implementar la pantalla de búsqueda de inscritos con formulario, resultados paginados, selección de inscrito y consulta de catálogo de certificados.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] 🔴 Escribir `inscritos.service.spec.ts`: (a) GET exitoso → retorna lista mapeada, (b) NIT con letras → error de validación **antes** de llamar al API, (c) servicio caído → observable con error 503
- [ ] 🟢 Implementar `InscritosService` con `debounceTime(500)` para búsqueda por nombre
- [ ] 🔴 Escribir `busqueda.component.spec.ts`: (a) NIT con letras → error inline visible sin llamar al servicio, (b) resultados retornados → tabla renderizada, (c) sin resultados → mensaje "no se encontraron resultados", (d) error 503 → toast de error
- [ ] 🟢 Implementar `BusquedaComponent` con formulario reactivo y validación en tiempo real
- [ ] 🔴 Escribir `catalogo-certificados.component.spec.ts`: (a) carga de catálogo → lista con precios, (b) click "Agregar al carrito" → `CarritoStore.agregar()` invocado con el ítem correcto
- [ ] 🟢 Implementar `ResultadosBusquedaComponent` y `CatalogoCertificadosComponent`

♻️ **Refactorizar** tras ciclos en verde: extraer el debounce + control de llamadas duplicadas a un operador RxJS compartido en `core/`

**Criterios de aceptación:**
- Búsqueda por matrícula/NIT/nombre muestra resultados o mensaje vacío
- NIT con letras muestra error inline sin llamar al API
- Selección de inscrito carga catálogo filtrado automáticamente
- Errores de backend muestran toast con mensaje amigable

**Dependencias:** TKT-060, TKT-030, TKT-031

---

### TKT-062 — Implementar módulo de carrito y liquidación estándar (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-062 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-03, HU-10, HU-11 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 5 |

**Descripción**  
Implementar el carrito de compras, formulario de datos del solicitante, liquidación y redirección a pasarela de pagos.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] 🔴 Ampliar `carrito.store.spec.ts` (de TKT-060): actualizar cantidad → subtotal recalculado; quitar ítem → eliminado de la lista; 101 ítems → intento rechazado con mensaje
- [ ] 🟢 Completar `CarritoStore` (Angular Signals) con las operaciones de actualización y eliminación
- [ ] 🔴 Escribir `datos-solicitante.component.spec.ts`: (a) email inválido → botón "Liquidar" deshabilitado, (b) email válido + campos completos → botón habilitado
- [ ] 🟢 Implementar `DatosSolicitanteComponent` con formulario reactivo y validación inline
- [ ] 🔴 Escribir `liquidacion.service.spec.ts`: (a) POST exitoso → retorna `{solicitudId, total, numeroOrden, urlPasarela}`, (b) error 422 (límite) → observable con mensaje específico, (c) Lambda no disponible → observable con 503
- [ ] 🟢 Implementar `LiquidacionService`
- [ ] 🔴 Escribir `carrito.component.spec.ts`: (a) botón "Liquidar" deshabilitado durante la llamada HTTP activa (previene doble clic CA-03.5), (b) total > 0 post-liquidación → redirect a pasarela, (c) total = 0 → pantalla de confirmación inmediata (CA-11.1)
- [ ] 🟢 Implementar `CarritoComponent` y `ConfirmacionComponent`

♻️ **Refactorizar** tras ciclos en verde: extraer el guard anti-doble-clic a una directiva `[appPreventDoubleClick]` reutilizable

**Criterios de aceptación:**
- Carrito permite máximo 100 ítems con mensaje al intentar exceder
- Formulario valida email antes de llamar al backend
- Botón deshabilitado durante procesamiento
- Total > 0 → redirect a pasarela; Total = 0 → confirmación inmediata

**Dependencias:** TKT-060, TKT-061, TKT-032, TKT-033, TKT-034

---

### TKT-063 — Implementar módulo de afiliados MAUC SSO (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-063 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-03A, HU-04, HU-05 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 5 |

**Descripción**  
Implementar el flujo frontend completo de afiliados: detección de matrícula afiliada, redirect a MAUC SSO, captura del token, validación y clasificación de certificados gratuitos/con costo.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] 🔴 Escribir `mauc-auth.service.spec.ts`: (a) `validarToken()` exitoso → token almacenado en `sessionStorage` (nunca en `localStorage`), (b) token con documento diferente → error con opciones de flujo estándar (CA-03A.2), (c) MAUC no disponible → toast + opción de continuar (CA-03A.3), (d) `cerrarSesion()` → sessionStorage limpiado + backend notificado (CA-03A.6)
- [ ] 🔴 Escribir `afiliado.guard.spec.ts`: inscrito con `esAfiliado=1` → permite ruta; inscrito sin afiliado → redirige a flujo estándar
- [ ] 🟢 Implementar `AfiliadoGuard` y `MaucAuthService`
- [ ] 🔴 Escribir `catalogo-afiliados.component.spec.ts`: certificados gratuitos muestran badge verde; certificados con costo muestran precio; clasificación correcta según IDs de RN-04
- [ ] 🟢 Implementar componente de clasificación visual del catálogo para afiliados

♻️ **Refactorizar** tras ciclos en verde: asegurarse de que **ningún** test use `localStorage` — el spy debe verificar exclusivamente `sessionStorage.setItem()`

**Criterios de aceptación:**
- Token capturado de URL post-redirect y validado en backend
- Token con documento diferente → error + opciones claras al usuario
- MAUC caído → toast informativo + botón para continuar sin beneficio
- Post-transacción → sesión MAUC cerrada, sessionStorage limpiado

**Dependencias:** TKT-062, TKT-040, TKT-041

---

### TKT-064 — Implementar módulo de depósitos financieros (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-064 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-07A, HU-07, HU-07B |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 5 |

**Descripción**  
Implementar el portal de depósitos financieros: login propio, selección de matrícula, carrito de estados financieros, upload de PDFs y gestión de carta de solicitud.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] 🔴 Escribir `depositos-auth.service.spec.ts`: (a) credenciales válidas → token almacenado en sessionStorage, (b) credenciales inválidas → `invalid_grant` visible al usuario sin detalles técnicos (CA-07A.2), (c) tipo cédula con letras → 400 en frontend antes de llamar al API, (d) sin email → validación bloqueante
- [ ] 🟢 Implementar `LoginDepositosComponent`, `DepositosAuthService` y `DepositosAuthGuard`
- [ ] 🔴 Escribir `carrito-depositos.component.spec.ts`: (a) archivo no PDF → rechazo con mensaje por nombre de archivo (CA-07B.2), (b) archivos PDF → aceptados y encolados, (c) token expirado durante upload → 401 redirige a login con datos preservados (CA-07B.5)
- [ ] 🟢 Implementar `CarritoDepositosComponent` con validación MIME type y drag & drop
- [ ] 🔴 Escribir `depositos-auth.guard.spec.ts`: token OAuth depósitos válido → permite; sin token → redirect a login depósitos; token expirado → 401 → redirect preservando datos
- [ ] 🟢 Implementar `MatriculasVinculadasComponent` y `EstadosFinancierosComponent`

♻️ **Refactorizar** tras ciclos en verde: unificar la lógica de "token expirado → redirect → preservar datos" de `DepositosAuthGuard` y `ErrorInterceptor` para evitar duplicación

**Criterios de aceptación:**
- Login con credenciales inválidas → mensaje "usuario no autorizado" sin revelar detalles técnicos
- Solo archivos PDF aceptados (validación en el cliente antes del upload)
- Token expirado durante proceso → redirect a login con datos del carrito preservados

**Dependencias:** TKT-060, TKT-047, TKT-048, TKT-049

---

### TKT-065 — Implementar módulos de especiales, Kardex y costumbres (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-065 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-06, HU-06A, HU-06B, HU-06C, HU-08 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 5 |

**Descripción**  
Implementar los módulos frontend de certificados especiales (textual, negativo, histórico), negativo para no matriculados, Kardex mercantil y costumbres mercantiles.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

Especiales:
- [ ] 🔴 Escribir `especiales.component.spec.ts`: (a) selector tipo=1 → muestra `BuscadorKardexComponent` inline, (b) selector tipo=2 + matrícula → formulario estándar, (c) tipo=2 sin matrícula → formulario no matriculado (CA-06A.1), (d) cantidad=0 → error inline (CA-06A.3)
- [ ] 🟢 Implementar `EspecialesComponent` con los 3 flujos

Kardex:
- [ ] 🔴 Escribir `buscador-kardex.component.spec.ts`: (a) sin criterios → error "ingrese al menos un criterio" (CA-06B.2), (b) fechaInicio sin fechaFin → error (CA-06B.3), (c) resultados → tabla renderizada; botón "Agregar al carrito" invoca `CarritoStore.agregar()` (CA-06B.5)
- [ ] 🟢 Implementar `BuscadorKardexComponent`

Costumbres:
- [ ] 🔴 Escribir `costumbres.component.spec.ts`: sectores cargados desde API → lista visible; sin sectores → mensaje "no disponibles"
- [ ] 🟢 Implementar `CostumbresComponent`

**Criterios de aceptación:**
- Selector de tipo especial visible y funcional
- Formulario no matriculado valida todos los campos requeridos
- Buscador de Kardex muestra error si no hay criterios
- Sectores de costumbres cargados desde TiendaWS vía backend

**Dependencias:** TKT-060, TKT-043, TKT-044, TKT-045, TKT-050

---

### TKT-066 — Implementar módulo de historial y descargas (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-066 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-12, HU-13 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 5 |

**Descripción**  
Implementar la pantalla de historial de certificados disponibles para descarga, con paginación, estados visuales y descarga de PDF.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] 🔴 Escribir `estado-solicitud-badge.component.spec.ts`: CERTIFICADO_EMITIDO → class CSS `badge-verde`; PAGADA → `badge-azul`; DEVUELTA → `badge-rojo`; VENCIDA → `badge-gris`
- [ ] 🟢 Implementar `EstadoSolicitudBadge`
- [ ] 🔴 Escribir `certificados.service.spec.ts`: (a) GET con JWT → lista paginada correctamente mapeada, (b) sin JWT → observable con error 401
- [ ] 🟢 Implementar `CertificadosService`
- [ ] 🔴 Escribir `historial-certificados.component.spec.ts`: (a) sin solicitudes → mensaje "no hay solicitudes en el último año" (CA-12.2), (b) solicitud PAGADA sin PDF → indicador "En proceso" (CA-12.3), (c) click "Descargar PDF" → llama a `/certificados/{id}/url`; URL expirada (403) → botón "Regenerar URL" visible (CA-13.3)
- [ ] 🟢 Implementar `HistorialCertificadosComponent` con tabla paginada y lógica de descarga

♻️ **Refactorizar** tras ciclos en verde: extraer `EstadoSolicitudBadge` a `shared/` para reutilizarlo en el backoffice

**Criterios de aceptación:**
- Solo se muestran solicitudes de los últimos 365 días (RN-16)
- Estados con color diferenciado y legible
- Descarga exitosa de PDF (< 3s P95)
- URL expirada → botón de regeneración sin buscar de nuevo

**Dependencias:** TKT-060, TKT-020, TKT-021

---

### TKT-067 — Setup y feature completa del Portal de Verificación (FE)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-067 |
| **Épica** | EPIC-06 |
| **Tipo** | Feature |
| **HU** | HU-14 |
| **RF** | RF-28 |
| **RNF** | RNF-32 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 5 (inicia en Fase 1) |

**Descripción**  
Implementar el Portal de Verificación como SPA pública sin autenticación: ingreso de código, validación, visor de PDF con pdf.js y registro de verificación.

**Tareas técnicas** _(ciclo TDD: 🔴 Red → 🟢 Green → ♻️ Refactor)_**:**

- [ ] `ng new portal-verificacion --standalone --routing` — sin interceptor de JWT; sin sesión persistida
- [ ] 🔴 Escribir `verificacion.service.spec.ts`: (a) código válido → retorna datos del certificado, (b) 404 → observable con mensaje "código no existe", (c) 410 expirado → "ha expirado", (d) 410 límite → "límite de verificaciones alcanzado"
- [ ] 🟢 Implementar `VerificacionService`
- [ ] 🔴 Escribir `verificacion.component.spec.ts`: (a) código con caracteres no alfanuméricos → error inline sin llamar al servicio (CA-14.4), (b) código de < 14 chars → error inline, (c) código válido → `PdfViewerComponent` renderiza PDF + `registrarVerificacion()` invocado automáticamente
- [ ] 🟢 Implementar `VerificacionComponent` con validación de formato
- [ ] 🔴 Escribir `pdf-viewer.component.spec.ts`: recibe Base64 → `pdf.js` invocado con los bytes correctos; prop vacía → no renderiza
- [ ] 🟢 Implementar `PdfViewerComponent` con pdf.js

♻️ **Refactorizar** tras ciclos en verde: verificar que el bundle del portal de verificación cargue en < 3s en 3G; si no, separar pdf.js en un chunk lazy-loaded

**Criterios de aceptación:**
- CA-14.1: Código válido → visor PDF + registro de verificación
- CA-14.2: Código expirado → mensaje "ha expirado" (no muestra PDF)
- CA-14.3: Límite alcanzado → mensaje "límite de verificaciones" (no muestra PDF)
- CA-14.4: Código inexistente → mensaje "no existe"
- Carga del portal < 3s en 3G (RNF-32)
- WCAG 2.1 nivel AA (RNF-33)

**Dependencias:** TKT-010, TKT-011, TKT-012, TKT-013

---

## EPIC-07 — Hardening, Observabilidad y Cierre

> **Objetivo:** Garantizar que el sistema cumple todos los SLOs de rendimiento, seguridad y disponibilidad antes del cutover a producción.

---

### TKT-070 — Implementar observabilidad completa con Dynatrace

| Campo | Valor |
|-------|-------|
| **ID** | TKT-070 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-27 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 6 |

**Descripción**  
Implementar observabilidad completa: logs estructurados JSON con MDC, métricas Micrometer exportadas a Dynatrace, trazas OpenTelemetry y health checks.

**Tareas técnicas** _(ciclo TDD: en observabilidad, los tests primero verifican que la métrica/log existe; luego se implementa)_**:**

- [ ] 🔴 Escribir `LiquidacionMetricasTest` con `@SpringBootTest`: ejecutar liquidación exitosa → `liquidacion.duration` registra una entrada; liquidación fallida → `liquidacion.errors` incrementa en 1
- [ ] 🟢 Implementar timers Micrometer en `LiquidarSolicitudHandler`: `liquidacion.duration`, `verificacion.requests` (Counter: válido/expirado/no_encontrado), `descarga.duration`, `pup.calls`
- [ ] 🔴 Escribir `HealthIndicatorTest`: (a) PUP disponible → `PupHealthIndicator` retorna `UP`, (b) PUP caído → `DOWN` con detalle, (c) S3 accesible → `S3HealthIndicator` retorna `UP`
- [ ] 🟢 Implementar `PupHealthIndicator`, `TiendaHealthIndicator`, `S3HealthIndicator`, `RedisHealthIndicator`
- [ ] 🟢 Configurar `logback-spring.xml` con `LogstashEncoder` para perfil `production` (JSON con correlationId en MDC)
- [ ] 🟢 Configurar `micrometer-registry-dynatrace` con API token y URL por ambiente (desde Variable Group de Azure DevOps)
- [ ] 🟢 Configurar alertas SLO en Dynatrace: P95 liquidación > 10s, P95 verificación > 500ms, error 5xx > 0.5%, uptime < 99.5%

♻️ **Refactorizar** tras ciclos en verde: extraer los timers de métricas a un aspecto `@Around` (AOP) para no contaminar la lógica de negocio con código de instrumentación

**Criterios de aceptación:**
- Logs en JSON con `correlationId` visible en Dynatrace Log Management
- Dashboard Dynatrace con: throughput/min, latencia P50/P95/P99, tasa de errores por endpoint
- Health check `/health/readiness` refleja estado real de dependencias
- Alerta de Dynatrace se dispara en < 5 minutos ante fallo simulado (§10.3 criterio 8)

**Dependencias:** TKT-001, TKT-002

---

### TKT-071 — Tests de arquitectura con ArchUnit

| Campo | Valor |
|-------|-------|
| **ID** | TKT-071 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-25, RNF-26 |
| **Prioridad** | Alta |
| **Estimación** | 5 pts |
| **Fase** | 6 |

**Descripción**  
Implementar tests de arquitectura con ArchUnit que verifican el cumplimiento de Clean Architecture en todos los microservicios.

**Tareas técnicas** _(TKT-071 es en sí mismo TDD a nivel de arquitectura: los tests de arquitectura definen las reglas que el código de producción debe cumplir. Si ArchUnit falla, el código viola las reglas)_**:**

- [ ] 🔴 Escribir `ArchitectureRulesTest` para `solicitudes`, `descargas` y `verificacion`:
  - `domain` no depende de `infrastructure`
  - `domain` no depende de `org.springframework..`
  - `application` no depende de `infrastructure`
  - `infrastructure` no accede directamente a `..api..`
  - Clases en `..api..` no contienen anotación `@Service`
  - `@Transactional` no existe en `..domain..` ni en `..api..controllers..`
  - Handlers en `..application..` solo dependen de ports (interfaces), nunca de implementaciones de infraestructura directamente
- [ ] Corregir cualquier violación existente (el código debe cumplir las reglas desde el primer commit)
- [ ] 🟢 Integrar `ArchUnit` como quality gate en `azure-pipelines.yml` (stage de CI falla si el test ArchUnit está en rojo)

♻️ **Refactorizar** tras ciclos en verde: consolidar las reglas comunes en un `ArchitectureRulesBase` en `shared-kernel` que cada microservicio extiende, para evitar duplicación de reglas

**Criterios de aceptación:**
- Todos los tests ArchUnit pasan en verde
- CI falla si se introduce una dependencia que viola Clean Architecture
- Informe de dependencias entre capas visible en CI

**Dependencias:** TKT-006

---

### TKT-072 — Pruebas de carga y performance (Load Testing)

| Campo | Valor |
|-------|-------|
| **ID** | TKT-072 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 6 |

**Descripción**  
Diseñar y ejecutar las pruebas de carga con Gatling o k6 para validar que el sistema soporta los SLOs bajo carga de pico (25K certificados/día, 20 tx/seg).

**Escenarios a probar:**
- [ ] **Escenario 1 — Carga normal:** 12 tx/seg durante 1 hora → P95 búsqueda < 2s, P95 liquidación < 10s
- [ ] **Escenario 2 — Pico de temporada:** 20 tx/seg durante 30 minutos → sin degradación, sin errores 5xx
- [ ] **Escenario 3 — Verificación pública:** 100 req/seg por 10 minutos → P95 < 500ms, rate limiter activo
- [ ] **Escenario 4 — Descarga concurrente:** 50 descargas simultáneas de PDF 5MB → P95 < 3s
- [ ] **Escenario 5 — Fallo de PUP:** simular PUP con 5s de latencia → circuit breaker activa, degradación controlada
- [ ] Documentar resultados y ajustar JVM heap/GC si es necesario

**Criterios de aceptación (SLOs del PRD §10.2):**
- Búsqueda inscritos P95 < 2s (RNF-01)
- Liquidación P95 < 10s (RNF-02)
- Verificación P95 < 500ms (RNF-03)
- Descarga P95 < 3s (RNF-04)
- Sin errores 5xx > 0.5% bajo carga normal (SLO)
- 20 tx/seg sin degradación observable (RNF-05)

**Dependencias:** Todos los tickets de backend completados

---

### TKT-073 — Pruebas de seguridad y penetration testing

| Campo | Valor |
|-------|-------|
| **ID** | TKT-073 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-12 al RNF-20 |
| **Prioridad** | Alta |
| **Estimación** | 13 pts |
| **Fase** | 6 |

**Descripción**  
Ejecutar el checklist de seguridad y pruebas de penetración para verificar el cumplimiento de los requisitos de seguridad (RNF-12 a RNF-20).

**Checklist de seguridad:**
- [ ] HTTPS forzado (HTTP redirige a HTTPS) — TLS 1.3 + HSTS (RNF-12)
- [ ] Sin secrets en archivos de configuración versionados (RNF-13)
- [ ] CORS rechaza dominios fuera de `*.ccb.org.co` (RNF-14)
- [ ] Rate limiting verificado: 101 req/seg desde misma IP → 429 (RNF-15)
- [ ] Inyección SQL: inputs validados con Jakarta Validation, queries parametrizadas (RNF-16)
- [ ] XSS: inputs sanitizados, Content-Security-Policy configurado
- [ ] JWT con expiración máx 8h, rechaza tokens sin firma válida (RNF-17)
- [ ] API de backoffice no expuesta públicamente, requiere credenciales (RNF-18)
- [ ] PDFs en S3 no accesibles sin URL pre-firmada (bucket no público) (RNF-19)
- [ ] Audit trail de operaciones de escritura (RNF-20)
- [ ] Enumeración de códigos de verificación: 404 no revela info adicional (CA-14.4)
- [ ] OWASP Top 10 checklist completado

**Criterios de aceptación:**
- Todas las vulnerabilidades críticas del sistema actual resueltas (§10.3 criterio 5)
- OWASP ZAP scan: sin vulnerabilidades de severidad Alta o Crítica
- Penetration test completado con informe y remediación de hallazgos

**Dependencias:** Todos los tickets completados

---

### TKT-074 — Documentación de API con OpenAPI / Swagger

| Campo | Valor |
|-------|-------|
| **ID** | TKT-074 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-30 |
| **Prioridad** | Media |
| **Estimación** | 5 pts |
| **Fase** | 6 |

**Descripción**  
Configurar SpringDoc OpenAPI para generar automáticamente la documentación de todos los endpoints con descripciones, esquemas de request/response y ejemplos.

**Tareas técnicas** _(en OpenAPI la "prueba" es verificar que el spec generado está completo y es válido — el test falla si falta algún endpoint o respuesta)_**:**

- [ ] 🔴 Escribir `OpenApiCompletenessTest` con `@SpringBootTest`: (a) spec generado contiene TODOS los endpoints del microservicio, (b) cada endpoint documenta respuestas 200, 400, 401, 403, 500, y las adicionales relevantes (404, 409, 410, 422, 429, 503)
- [ ] 🟢 Configurar `springdoc-openapi-starter-webmvc-ui` en cada microservicio
- [ ] 🟢 Añadir anotaciones `@Operation`, `@ApiResponse`, `@Schema` en todos los controllers; documentar headers `Authorization`, `X-Correlation-Id`
- [ ] 🟢 Configurar Swagger UI en `/swagger-ui.html` solo para perfiles non-production; exportar OpenAPI 3.0 JSON para colección Postman del equipo de QA

♻️ **Refactorizar** tras ciclos en verde: extraer los errores estándar a una anotación compuesta `@StandardApiResponses` para evitar repetir `@ApiResponse` en cada método

**Criterios de aceptación:**
- Swagger UI funcional en ambiente de QA con todos los endpoints documentados
- Colección Postman generada desde OpenAPI y verificada en QA
- Documentación generada automáticamente en cada build (no documentación manual) (RNF-30)

**Dependencias:** TKT-006

---

### TKT-075 — Validar zero-downtime deployment y cutover

| Campo | Valor |
|-------|-------|
| **ID** | TKT-075 |
| **Épica** | EPIC-07 |
| **Tipo** | Task |
| **HU** | — |
| **RNF** | RNF-29 |
| **Prioridad** | Alta |
| **Estimación** | 8 pts |
| **Fase** | 6 |

**Descripción**  
Validar el deployment sin downtime mediante rolling deployment o blue-green, ejecutar 3 deployments consecutivos sin interrupción del servicio y preparar el plan de cutover a producción.

**Tareas técnicas** _(el "test" aquí es el propio deployment: pasa si 0 solicitudes se pierden; falla si hay downtime observable)_**:**

- [ ] Documentar el procedimiento de rolling deployment en `deploy/README.md`; verificar que health checks de readiness están activos antes de enviar tráfico
- [ ] 🔴 Ejecutar test de deployment: 3 deployments consecutivos en QAS mientras Gatling/k6 genera tráfico continuo → el test falla si cualquier request retorna error durante el deployment
- [ ] 🟢 Ajustar parámetros de rolling deployment hasta que el test pase: 0 requests perdidos, sin 5xx durante el cambio de versión
- [ ] 🔴 Test de rollback: hacer rollback de una versión en < 5 minutos → el test falla si toma más
- [ ] 🟢 Documentar y ajustar el script de rollback hasta que el test pase
- [ ] Preparar runbook de producción: escalar instancias, drenar tráfico, revisar logs, contactos de guardia

♻️ **Refactorizar** tras ciclos en verde: automatizar el test de zero-downtime como stage adicional en el pipeline de CD de Azure DevOps (no solo ejecutarlo manualmente)

**Criterios de aceptación:**
- 3 deployments consecutivos en QA sin downtime observable (§10.3 criterio 7)
- 0 solicitudes perdidas durante rolling deployment (verificado con logs)
- Rollback en < 5 minutos documentado y probado
- Runbook de producción revisado y aprobado por el equipo de operaciones

**Dependencias:** TKT-006, TKT-072

---

## Resumen de Tickets por Épica

| Épica | Tickets | Total estimación |
|-------|---------|-----------------|
| EPIC-01 Fundación | TKT-001 al TKT-007 | 57 pts |
| EPIC-02 Verificación | TKT-010 al TKT-013 | 21 pts |
| EPIC-03 Descargas | TKT-020 al TKT-022 | 19 pts |
| EPIC-04 Solicitudes Core | TKT-030 al TKT-037 | 57 pts |
| EPIC-05 Módulos Especiales | TKT-040 al TKT-051 | 87 pts |
| EPIC-06 Frontends | TKT-060 al TKT-067 | 86 pts |
| EPIC-07 Hardening | TKT-070 al TKT-075 | 52 pts |
| **TOTAL** | **36 tickets** | **~379 pts** |

---

## Mapa de Dependencias Críticas

```
TKT-001 (Gradle setup)
  └─→ TKT-002 (shared-kernel/auth)
        └─→ TKT-005 (Liquibase — solo tablas verificaciones en SQL Server)
              └─→ TKT-010 (Verificación endpoint)
                    └─→ TKT-011 (PDF S3 verificación)
                          └─→ TKT-012 (Registro verificación)
                                └─→ TKT-013 (Rate limiting)
                                      └─→ TKT-067 (Portal Verificación Angular)

  └─→ TKT-003 (Clientes SOAP)
        └─→ TKT-030 (Búsqueda inscritos)
              └─→ TKT-031 (Catálogo certificados)
                    └─→ TKT-032 (Liquidación estándar) ← CRÍTICO
                          ├─→ TKT-033 (Pasarela pagos)
                          ├─→ TKT-034 (Pago en cero)
                          ├─→ TKT-035 (Notificación backoffice)
                          │     └─→ TKT-036 (Devolución)
                          └─→ TKT-040 (MAUC SSO)
                                └─→ TKT-041 (Liquidación afiliados)
                                └─→ TKT-043 (Especiales)
                                └─→ TKT-048 (Depósitos)
```

---

## Trazabilidad Historias de Usuario → Tickets

| Historia | Descripción | Ticket(s) |
|----------|-------------|-----------|
| HU-01 | Buscar inscrito | TKT-030, TKT-061 |
| HU-02 | Consultar catálogo | TKT-031, TKT-061 |
| HU-03 | Solicitar estándar | TKT-032, TKT-062 |
| HU-03A | Autenticarse MAUC SSO | TKT-040, TKT-063 |
| HU-04 | Solicitar como afiliado | TKT-041, TKT-063 |
| HU-05 | Matrícula principal SHD | TKT-042 |
| HU-06 | Especiales | TKT-043, TKT-065 |
| HU-06A | Negativo no matriculado | TKT-044, TKT-065 |
| HU-06B | Kardex mercantil | TKT-045, TKT-065 |
| HU-06C | Carta especiales | TKT-046 |
| HU-07 | Depósitos financieros | TKT-048, TKT-064 |
| HU-07A | Auth depósitos OAuth | TKT-047, TKT-064 |
| HU-07B | Carta depósitos | TKT-049, TKT-064 |
| HU-08 | Costumbres mercantiles | TKT-050, TKT-065 |
| HU-09 | App móvil API | TKT-051 |
| HU-10 | Pago pasarela | TKT-033, TKT-062 |
| HU-11 | Pago en cero afiliados | TKT-034, TKT-062 |
| HU-12 | Historial certificados | TKT-020, TKT-066 |
| HU-13 | Descargar PDF | TKT-021, TKT-066 |
| HU-14 | Verificar autenticidad | TKT-010, TKT-011, TKT-012, TKT-013, TKT-067 |
| HU-15 | Notificar certificado | TKT-035 |
| HU-16 | Devolver solicitud | TKT-036 |
| HU-17 | Consulta por número orden | TKT-022 |

---

## Definition of Done (DoD) — Aplicable a todos los tickets

Un ticket se considera **DONE** cuando:

**Proceso TDD (verificado en la revisión del PR):**
- [ ] 🔴 Todos los tests del ticket se escribieron **antes** del código de producción correspondiente (evidenciado en el historial de commits)
- [ ] 🟢 Cada test estaba en rojo antes de escribir la implementación mínima (no se hizo "test after")
- [ ] ♻️ Se realizó al menos una sesión de refactoring después de pasar los tests al verde, sin romper ninguno

**Calidad del código:**
- [ ] Código implementado y revisado en Pull Request (mínimo 1 revisor)
- [ ] Cobertura ≥ 80% en módulos `*-domain` y `*-application` (medida por JaCoCo en el pipeline)
- [ ] Tests de integración cubren happy path y casos de error principales
- [ ] Tests ArchUnit pasan: `domain` sin dependencias de Spring ni de `infrastructure`
- [ ] Linter y análisis estático sin errores nuevos introducidos

**Documentación y entrega:**
- [ ] Documentación OpenAPI actualizada para endpoints nuevos o modificados
- [ ] Desplegado en ambiente DEV mediante el pipeline de Azure DevOps (no deploy manual)
- [ ] Validado en ambiente QAS por el equipo de QA
- [ ] Criterios de aceptación de la HU verificados en QAS con datos de prueba reales
- [ ] No introduce regresiones en tests existentes (pipeline completo en verde)
- [ ] Merge a rama `develop` via PR aprobado en Azure DevOps

---

## Notas para el Equipo

### Para el equipo de QA
- Las HUs con integración SOAP (PUP, TiendaWS, SHD) requieren WireMock en tests unitarios/integración y acceso a QA de los servicios para tests E2E.
- HU-14 (verificación), HU-15 (notificación duplicada) y HU-03 (doble clic) requieren pruebas de concurrencia.
- El flujo E2E completo a probar: HU-01 → HU-02 → HU-03 → HU-10 → HU-15 → HU-13 → HU-14.

### Para el equipo de DevOps
- Gestión de secrets mediante HashiCorp Vault o AWS Secrets Manager (definir con CCB).
- Pipeline CI/CD debe ejecutar en < 15 minutos (SLO §10.2).
- Configurar Dynatrace OneAgent en todos los servidores antes de Fase 3.

### Para el equipo de desarrollo
- La regla más crítica: el módulo `*-domain` es Java puro sin dependencias de Spring. ArchUnit lo verifica automáticamente.
- `LiquidarSolicitudHandler` (TKT-032) es la clase más compleja del sistema: requiere revisión especial de par en PR.
- Todos los clientes SOAP deben tener circuit breaker configurado (TKT-003) antes de ir a producción.
- La integración MAUC SSO debe validar la firma JWT del lado del servidor (no solo parsear el token como hace el sistema actual).
