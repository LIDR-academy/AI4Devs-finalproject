> Este archivo documenta los prompts estratégicos estructurados bajo la metodología de Spec-Driven Development (SDD) y Verified Spec-Driven Development (VSDD) para guiar a los asistentes de código (Gemini con IDE Antigravity) de manera determinista y profesional.


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Segunda Entrega: Desarrollo del Backend y MVP (Lógica Core)](#8-segunda-entrega-desarrollo-del-backend-y-mvp-lógica-core)

---

## 1. Descripción general del producto

**Prompt 1 Descubrimiento del Problema e Idea de Producto:**
```md
Usando el skill de Descubrimiento de Producto en `.agents/skills/specs/01_product_definition/SK-01_discover_product_vision.md`, analiza la siguiente idea de producto:

"Hay cierta incertidumbre en el uso de los insumos almacenados en el área de depósito de un restaurante, no se sabe a ciencia cierta quien accede a estos y cual es su finalidad.

Para resolver esta situación, se propone desarrollar una aplicación web que permita controlar el movimiento de los insumos del almacén, registrando que empleado realiza cada movimiento, la cantidad, fecha y el destino del producto.

En cada movimiento, se deberá registrar la fecha, el empleado, tipo de movimiento, almacén involucrado, detalle del movimiento.

Adicionalmente, en caso de ser usado un insumo se debe registrar la fecha, empleado operario, detalles del insumo, la cantidad usada, una descripción de su uso.

Poder rastrear el uso parcial de un producto y saber dónde queda almacenado.

La aplicación permitirá registrar empleados, tipos de movimientos, productos, marcas, áreas del restaurante, almacenes, tipos de almacenes, así como los detalles de cada movimiento y el stock de productos por almacén, uso y el destino del remanente."

---

Genera el documento con un tono directo, sumamente riguroso y en formato Markdown limpio. Comienza directamente en el análisis de la Fase 1 sin preámbulos conversacionales.

Guarda el archivo como "docs/01_product_definition/01_product_discovery.md"

```

### Respuesta del Agente de IA:
El documento completo con el análisis de la concepción del producto se encuentra en:
* [docs/01_product_definition/01_product_discovery.md](docs/01_product_definition/01_product_discovery.md)


### Nota de control humano: 
Se hicieron algunos cambios al archivo generado por el agente adoptando un rol de un operario autorizado para las traslaciones y descartes, ya que el agente sugirió que cualquier operario podría realizar traslaciones y descartes, lo cual no es correcto, solo el operario autorizado puede realizar traslaciones y descartes.

**Prompt 2 Generación del PRD (Product Requirements Document):**

```md
Usando el skill de Generación del PRD en `.agents/skills/specs/01_product_definition/SK-02_generate_prd.md`, analiza el documento de concepción de producto `docs/01_product_definition/01_product_discovery.md` para generar el PRD de RestoStock.

```

### Respuesta del Agente de IA:
El documento completo de requisitos de producto (PRD) se encuentra en:
* [docs/01_product_definition/02_prd.md](docs/01_product_definition/02_prd.md)

### Nota de control humano:
El PRD fue revisado y aprobado para comenzar con el desarrollo. Se unificó la meta de la Tasa de Rotación de Remanentes (TRR) a 24 horas para mantener consistencia con el documento de framing.


**Prompt 3 Especificación Técnica de Arquitectura y Persistencia:**

```md
Usando el skill de Modelo de Dominio en `.agents/skills/specs/02_architecture_design/SK-03_design_domain_model.md`, analiza el PRD `docs/01_product_definition/02_prd.md` para generar la especificación técnica en `docs/02_architecture_design/03_domain_model.md`.
```

### Respuesta del agente de IA:
El documento completo de diseño de arquitectura y persistencia se encuentra en:
* [docs/02_architecture_design/03_domain_model.md](docs/02_architecture_design/03_domain_model.md)

### Nota de control humano:
La revision del archivo docs/02_architecture_design/03_domain_model.md fue completada y aprobada para continuar con las especificaciones tecnicas, para continuar a mas detalla con la seccion de Arquitectura del Sistema a continuacion.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Generación de Diagramas Mermaid Integrados
``` md 
Usando el skill de Diseño Técnico en `.agents/skills/specs/02_architecture_design/SK-04_design_technical_architecture.md`, analiza los archivos `docs/01_product_definition/02_prd.md` y `docs/02_architecture_design/03_domain_model.md` para generar el diagrama C4 de la arquitectura física y lógica en Mermaid en `docs/02_architecture_design/04_technical_design.md`.
```

#### Respuesta del agente de IA:
El diagrama completo de arquitectura física y lógica se encuentra en:
* [docs/02_architecture_design/04_technical_design.md](docs/02_architecture_design/04_technical_design.md)

--- 

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Definición de Capas y UI/UX
```md 
Usando el skill de Asistente UI/UX y Capas en `.agents/skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md`, analiza `docs/01_product_definition/02_prd.md` y `docs/02_architecture_design/03_domain_model.md` para estructurar la sección "2.2. Descripción de componentes principales" en `docs/02_architecture_design/05_ui_ux_design_system.md`.

```

#### Respuesta del agente de IA:
La especificación completa del sistema de diseño UI/UX, tokens HSL, ergonomía táctil y exportación al estándar [`DESIGN.md`](DESIGN.md) de Google Labs se encuentra en:
* [docs/02_architecture_design/05_ui_ux_design_system.md](docs/02_architecture_design/05_ui_ux_design_system.md)
* [DESIGN.md](DESIGN.md)

#### Nota de control humano:
Se auditó la generación de `DESIGN.md` utilizando el linter oficial de Google Labs (`npx @google/design.md lint DESIGN.md`), verificando 0 errores, 0 advertencias y pleno cumplimiento de WCAG 2.2 AA en contrastes de color y áreas táctiles de 48px.

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```md
Usando el skill de Diseño Técnico en `.agents/skills/specs/02_architecture_design/SK-04_design_technical_architecture.md`, analiza los archivos de diseño y arquitectura en `./docs/` para generar la jerarquía exacta de ficheros combinando Vertical Slices y Arquitectura Hexagonal en `docs/02_architecture_design/04_technical_design.md`.

```

#### Respuesta del agente de IA:
La estructura completa del directorio del proyecto (monorepo con Frontend Next.js y Backend Express) se encuentra en:
* [docs/02_architecture_design/04_technical_design.md](docs/02_architecture_design/04_technical_design.md)


#### Nota de control humano:


### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Pipeline de CI/CD Seguro y Despliegue

```md
Usando el skill de Pipeline CI/CD en `.agents/skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md`, genera el pipeline de GitHub Actions en `.github/workflows/ci.yml`.
```

#### Respuesta del agente de IA:
La configuración detallada y limpia del pipeline de GitHub Actions se encuentra en:
* [.github/workflows/ci.yml](.github/workflows/ci.yml)

#### Nota de control humano:

---

### **2.5. Seguridad**

**Prompt 1:**
```md
Usando el skill de Ciberseguridad en `.agents/skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md`, analiza el PRD y el modelo de datos para generar la estrategia de seguridad y mitigación de vulnerabilidades en `docs/04_governance_and_quality/08_security_strategy.md`.
```

### Respuesta del agente de IA:
La estrategia de seguridad detallada y alineada con OWASP se encuentra en:
* [docs/04_governance_and_quality/08_security_strategy.md](docs/04_governance_and_quality/08_security_strategy.md)

### Nota de control humano:

---   

### **2.6. Tests**

**Prompt 1:**
```md
Usando el skill de Estrategia de Pruebas en `.agents/skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md`, configura la directiva de pruebas y testing de TDD en `docs/04_governance_and_quality/09_testing_strategy.md`.
```

### Respuesta del agente de IA:
La directiva y estrategia de testing detallada (TDD y mocks mínimos) se encuentra en:
* [docs/04_governance_and_quality/09_testing_strategy.md](docs/04_governance_and_quality/09_testing_strategy.md)

### Nota de control humano:

---   

### 3. Modelo de Datos

**Prompt 1:**
```md
Usando el skill de Base de Datos en `.agents/skills/specs/03_persistence_and_api/SK-06_design_database_schema.md`, genera el esquema declarativo de base de datos para Prisma en `docs/03_persistence_and_api/06_database_schema.md` a partir de `docs/01_product_definition/02_prd.md` y `docs/02_architecture_design/03_domain_model.md`.
```

### Respuesta del agente de IA:
El esquema declarativo de base de datos para Prisma (`schema.prisma`) y su justificación técnica se encuentra en:
* [docs/03_persistence_and_api/06_database_schema.md](docs/03_persistence_and_api/06_database_schema.md)

### Nota de control humano:
Se validó que el archivo destinado a `schema.prisma` sea un archivo ejecutable con sintaxis pura de Prisma, sin bloques Markdown explicativos embebidos, y que cualquier justificación adicional de índices se mantenga en el artefacto de documentación separado.

---

### 4. Especificación de la API

**Prompt 1:**
```md
Usando el skill de Especificación API REST en `.agents/skills/specs/03_persistence_and_api/SK-07_design_api_specification.md`, diseña los contratos de endpoints REST en `docs/03_persistence_and_api/07_api_specification.md` basándote en el PRD y el esquema físico.
```

### Respuesta del agente de IA:
La especificación de la API detallada y alineada con OWASP se encuentra en:
* [docs/03_persistence_and_api/07_api_specification.md](docs/03_persistence_and_api/07_api_specification.md)

### Nota de control humano:
Se garantizó que todas las cantidades y representaciones de tipo Decimal en payloads JSON se serialicen de forma consistente y determinista exclusivamente como strings (cadenas de texto numéricas, ej: `"2.0000"`), indicando su precisión y escala.

---

### 5. Historias de Usuario

**Prompt 1:**
```md
Usando el skill de Historias de Usuario en `.agents/skills/specs/05_agile_planning/SK-11_generate_user_stories.md`, genera el backlog de Historias de Usuario bajo INVEST y BDD Gherkin en las subcarpetas del directorio `docs/05_agile_planning/11_user_stories/{modulo}/` y su respectivo `docs/05_agile_planning/11_user_stories/indice_user_stories.md`.

```
### Respuesta del agente de IA:
Las historias de usuario detalladas (en formato INVEST y BDD Gherkin) y su correspondiente índice se encuentran en:
* [docs/05_agile_planning/11_user_stories/indice_user_stories.md](docs/05_agile_planning/11_user_stories/indice_user_stories.md)

### Nota de control humano:
Se revisó que los escenarios de negocio prohíban saldos negativos en remanentes, y que cualquier descarte sobre un remanente ya CONSUMED o DISCARDED sea explícitamente rechazado sin mutar la base de datos.

---

### 6. Tickets de Trabajo

**Prompt 1:**
```md
Usando el skill de Planificación de Tickets en `.agents/skills/specs/05_agile_planning/SK-12_generate_backlog_tickets.md`, desglosa las historias en tareas atómicas estimadas en las subcarpetas de `docs/05_agile_planning/12_tickets/{modulo}/` y su correspondiente `docs/05_agile_planning/12_tickets/indice_tickets.md`.

```

### Respuesta del agente de IA:
La matriz de trazabilidad y las fichas técnicas detalladas de los tickets de trabajo del backlog se encuentran en:
* [docs/05_agile_planning/12_tickets/indice_tickets.md](docs/05_agile_planning/12_tickets/indice_tickets.md)

### Nota de control humano:
Se corroboró que el manejo de caídas de red en el frontend (TK-007) se mitigue mediante capturas explícitas de promesas asíncronas y actualización de estados de error de data-fetching locales, en lugar de Error Boundaries de React.

---

### 7. Pull Requests

**Prompt 1:**

```md
Usando el skill de Registro de PRs en `.agents/skills/specs/05_agile_planning/SK-15_document_pull_requests.md`, documenta las Pull Requests iniciales reales e integraciones del proyecto e infúndelas en la sección correspondiente de `readme.md`.

```

### Respuesta del agente de IA:
La documentación detallada de las Pull Requests reales se ha integrado en la sección "7. Pull Requests" de [readme.md](readme.md).

### Nota de control humano:
Se auditó la documentación de Pull Requests para asegurar que solo contenga información verídica y verificable del repositorio (evitando la invención de PRs ficticios o pipelines de CI falsos), admitiendo documentar menos de tres PRs cuando no existan más en el historial de Git.

---

## 8. Desarrollo del Backend y MVP (Lógica Core)

### **8.1. Andamiaje y Configuración Inicial (TK-001)**

**Prompt 1 Configuración del Entorno de Desarrollo y Monorepo:**
```md
Usando el ticket `TK-001` (docs/05_agile_planning/12_tickets/shared/backend/TK-001.md) y las directivas de `docs/04_governance_and_quality/rules/backend_rules.md`, inicializa la estructura física del monorepo en Node.js y TypeScript:
1. Configura el workspace con `pnpm`.
2. Inicializa TypeScript con `tsconfig.json` optimizado.
3. Instala e inicializa Express y Prisma ORM con PostgreSQL.
4. Configura Vitest para ejecutar la suite de pruebas.
5. Configura un archivo `docker-compose.yml` para levantar la base de datos de test efímera.
6. Habilita el servidor Express básico escuchando en el puerto 3000.
```

### Respuesta del agente de IA:
Se ha inicializado y configurado la base técnica y el andamiaje del monorepo (`TK-001`) con los siguientes entregables y configuraciones:
1. **Configuración del Workspace Root:**
   - [package.json](package.json): Gestión de tareas compartidas y autorización de build scripts en pnpm.
   - [pnpm-workspace.yaml](pnpm-workspace.yaml): Definición del alcance del monorepo (`apps/*`).
   - [docker-compose.yml](docker-compose.yml): Orquestación de dos instancias PostgreSQL independientes en los puertos `5435` (Desarrollo) y `5436` (Pruebas).
   - [.env](.env) y [.env.example](.env.example): Archivos de configuración de variables de entorno locales.
2. **Estructura del Backend (`apps/backend`):**
   - [apps/backend/package.json](apps/backend/package.json): Dependencias del backend (Express, Prisma, Zod, bcrypt, decimal.js, jwt, vitest, ts-node).
   - [apps/backend/tsconfig.json](apps/backend/tsconfig.json) y [apps/backend/.eslintrc.json](apps/backend/.eslintrc.json): Estándares de compilación TypeScript y reglas linter estrictas.
3. **Persistencia y Seeding:**
   - [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma): Modelado en 3NF con índices FEFO (`status, calculated_expiration_date`).
   - [apps/backend/prisma/seed.ts](apps/backend/prisma/seed.ts): Inserción del usuario Administrador (`admin@restostock.com`) y Operador de Cocina (`1234`).
4. **Bootstrapping del Servidor HTTP:**
   - [apps/backend/src/index.ts](apps/backend/src/index.ts) y [apps/backend/src/app.ts](apps/backend/src/app.ts): Arranque seguro, comprobación de conectividad a PostgreSQL y validador de entorno por Zod en [apps/backend/src/shared/infrastructure/config/environment.ts](apps/backend/src/shared/infrastructure/config/environment.ts).
   - [apps/backend/src/shared/infrastructure/middleware/errorHandler.ts](apps/backend/src/shared/infrastructure/middleware/errorHandler.ts) y [apps/backend/src/shared/infrastructure/middleware/validation.middleware.ts](apps/backend/src/shared/infrastructure/middleware/validation.middleware.ts): Middleware global de excepciones (DDD, Zod y 500) y de validación genérica.
5. **Logger e Integración de Tests:**
   - [apps/backend/src/shared/domain/logger.interface.ts](apps/backend/src/shared/domain/logger.interface.ts) y [apps/backend/src/shared/infrastructure/logger/console.logger.ts](apps/backend/src/shared/infrastructure/logger/console.logger.ts): Logger desacoplado en el dominio e implementado en consola.
   - [apps/backend/src/shared/infrastructure/__tests__/health.spec.ts](apps/backend/src/shared/infrastructure/__tests__/health.spec.ts): Prueba de integración de API con Vitest y Supertest (`GET /health`).

### Nota de control humano:
Se auditó y ejecutó de manera presencial el andamiaje del backend:
- Se corroboró que el linter (`pnpm run lint`) y compilador (`pnpm run build`) no arrojen errores de código.
- Se verificó que el test de integración pase de manera exitosa y que el servidor Express lance un error crítico controlable al iniciarse sin variables de entorno indispensables como `DATABASE_URL`.
- Se validó el aislamiento de la base de datos de test efímera (puerto 5436) versus desarrollo (puerto 5435) en docker-compose para garantizar tests de integración idempotentes y libres de colisiones de datos.

---

### **8.2. Autenticación de Operarios por PIN (TK-002)**

**Prompt 2 Implementación de Módulo de Autenticación:**
```md
Usando el ticket `TK-002` (docs/05_agile_planning/12_tickets/auth/backend/TK-002.md) y las directivas de `docs/04_governance_and_quality/rules/domain_rules.md` y `docs/04_governance_and_quality/rules/backend_rules.md`, implementa el vertical slice `auth` de autenticación por PIN:
1. Diseña la entidad de dominio `User` y el Value Object `Pin` con hashing de `bcrypt` y validación de 4 dígitos.
2. Define la interfaz `IUserRepository` en el dominio.
3. Escribe las pruebas unitarias en rojo (TDD) para validar y comparar PINs usando InMemoryRepository.
4. Implementa el caso de uso `AuthenticateByPinUseCase` y su suite de pruebas unitarias.
5. Desarrolla el adaptador de infraestructura `PrismaUserRepository` y el controlador Express con validación Zod.
6. Registra la ruta en Express bajo `/api/auth/pin` y verifica que los tests de integración pasen con éxito.
```

### Respuesta del agente de IA:
Se ha implementado el vertical slice completo de **Autenticación por PIN (`TK-002`)** siguiendo el flujo de arquitectura hexagonal:
1. **Dominio:**
   - Entidad [User](apps/backend/src/auth/domain/entities/user.entity.ts) que representa las propiedades puras del operario/admin y sus estados de actividad.
   - Value Object [Pin](apps/backend/src/auth/domain/value-objects/pin.value-object.ts) que contiene la regla invariable de 4 dígitos exclusivamente numéricos e introduce `InvalidPinError`.
   - Puerto de persistencia [IUserRepository](apps/backend/src/auth/domain/ports/user-repository.interface.ts).
   - Excepción de seguridad [InvalidCredentialsError](apps/backend/src/auth/domain/errors/invalid-credentials.error.ts) (para retornar 401 sin revelar la causa o existencia del ID).
2. **Aplicación:**
   - Caso de uso [AuthenticateByPinUseCase](apps/backend/src/auth/application/use-cases/authenticate-by-pin.use-case.ts) que implementa la orquestación del login, mitigación contra ataques de tiempo (Timing Attacks) realizando comparaciones dummy si el usuario no existe, y emitiendo un token JWT de 12 horas de duración.
3. **Infraestructura:**
   - Adaptador [PrismaUserRepository](apps/backend/src/auth/infrastructure/repositories/prisma-user.repository.ts) con validación previa de sintaxis de UUID para prevenir excepciones no controladas del driver de base de datos Postgres.
   - Mapeador [UserMapper](apps/backend/src/auth/infrastructure/mappers/user.mapper.ts) para mantener el acoplamiento desacoplado hacia el ORM.
   - [AuthController](apps/backend/src/auth/infrastructure/controllers/auth.controller.ts) con esquema Zod estricto para la sanitización de payloads de entrada.
   - Registro de la ruta `/api/auth/pin` en [routes.ts](apps/backend/src/auth/infrastructure/routes.ts) y montaje en el ruteador global de [app.ts](apps/backend/src/app.ts).
4. **Verificación de Calidad (TDD):**
   - Suite de pruebas unitarias usando `InMemoryUserRepository` en [user.entity.spec.ts](apps/backend/src/auth/domain/__tests__/user.entity.spec.ts) y [authenticate-by-pin.use-case.spec.ts](apps/backend/src/auth/application/__tests__/authenticate-by-pin.use-case.spec.ts).
   - Suite de pruebas de integración HTTP físicas en [auth.integration.spec.ts](apps/backend/src/auth/infrastructure/__tests__/auth.integration.spec.ts).

### Nota de control humano:
Se auditó y ejecutó de manera exitosa la autenticación de operarios:
- Se validó el cumplimiento del ciclo TDD unitario e integración.
- Se comprobó la solidez del sistema ante Timing Attacks mediante comparaciones de bcrypt constantes.
- Se verificó que las validaciones de Zod impiden el paso de UUIDs corruptos o PINs inválidos (no numéricos o de longitud diferente a 4) arrojando códigos `400 Bad Request` limpimante en vez de propagar fallos a capas más internas.

---

### **8.3. Extracciones de Bodega a Cocina (TK-003)**

**Prompt 3 Implementación de Módulo de Extracción de Bodega:**
```md
Usando el ticket `TK-003` (docs/05_agile_planning/12_tickets/stock/backend/TK-003.md) y las directivas de backend y dominio, implementa el vertical slice `stock` de registro de extracciones:
1. Define la entidad `Remanente` con su cálculo de vencimiento dinámico y la invariante de no-negatividad.
2. Crea los puertos e implementaciones de repositorio `IStockMovementRepository` e `IWarehouseStockRepository`.
3. Desarrolla el caso de uso `RecordExtractionUseCase` que gestiona de manera atómica transaccional el débito en bodega y la creación del remanente activo.
4. Diseña el controlador `StockController` con validaciones estrictas en Zod.
5. Integra la ruta `POST /api/stock/extraction` con el middleware `requireAuth`.
```

### Respuesta del agente de IA:
Se ha implementado por completo el vertical slice de **Registro de Extracciones de Bodega (`TK-003`)**:
1. **Dominio:**
   - Creación de clases de error específicas de dominio (`InsufficientStockError`, `InvalidQuantityError`, `InvalidUnitError`, `InsumoNotFoundError`, `InactiveInsumoError`) heredadas de `DomainError`.
   - Lógica de vencimiento acelerado (24h TRR) e integridad física de cantidades no negativas.
2. **Aplicación:**
   - Orquestación del caso de uso `RecordExtractionUseCase` con persistencia transaccional.
3. **Infraestructura:**
   - Controlador y rutas debidamente montados y mapeados al gestor de errores global `errorHandler` de Express.
   - Suite de pruebas unitarias (`record-extraction.use-case.spec.ts`) y de integración (`stock.integration.spec.ts`) funcionando al 100%.

---

### **8.4. Consulta de Remanentes Activos en Cocina - FEFO (TK-004)**

**Prompt 4 Implementación de Módulo de Consulta de Remanentes:**
```md
Usando el ticket `TK-004` (docs/05_agile_planning/12_tickets/kitchen/backend/TK-004.md) y las directivas de backend y dominio, implementa el vertical slice `kitchen` de consulta de remanentes activos:
1. Declara la firma `findActiveInKitchen(location?)` en `IRemanenteRepository`.
2. Crea el caso de uso `GetActiveRemanentesUseCase` aplicando ordenación FEFO.
3. Implementa los adaptadores físico (`PrismaRemanenteRepository`) e in-memory (`InMemoryRemanenteRepository`) resolviendo problemas de consultas N+1 mediante join explícito con el catálogo maestro (`Insumo`).
4. Desarrolla el controlador `GetActiveRemanentesController` con esquema de validación query parametrizada de Zod.
5. Monta la ruta `GET /api/kitchen/remanentes` protegida mediante `requireAuth`.
```

### Respuesta del agente de IA:
Se ha implementado por completo el vertical slice de **Consulta de Remanentes Activos en Cocina (`TK-004`)**:
1. **Dominio:**
   - Ampliación de la entidad `Remanente` y su interfaz de persistencia `IRemanenteRepository` para soportar consultas asociadas de insumos.
2. **Aplicación:**
   - Caso de uso `GetActiveRemanentesUseCase` aplicando ordenamiento cronológico por fecha de expiración acelerada calculada (FEFO).
3. **Infraestructura:**
   - Adaptador Prisma optimizado con carga unificada de datos `include: { insumo: ... }` para mitigar problemas N+1 y aprovechar los índices físicos.
   - Creación del nuevo router y slice de cocina (`kitchenRouter`), montado bajo `/api/kitchen`.
   - Pruebas unitarias e integración certificadas bajo TDD, inmunes a interferencia de datos concurrentes.

---

### **8.5. Consumo Parcial de Remanentes (TK-005)**

**Prompt 5 Implementación de Módulo de Consumo de Remanentes:**
```md
Usando el ticket `TK-005` (docs/05_agile_planning/12_tickets/kitchen/backend/TK-005.md) y las directivas de backend y dominio, implementa el vertical slice `kitchen` de consumo parcial de remanentes:
1. Define el método `consume` en la clase `Remanente` para realizar restas matemáticas precisas usando `decimal.js`, validando que no quede en stock negativo y pasando a estado `CONSUMED` si el saldo es cero.
2. Implementa el caso de uso `RecordConsumptionUseCase` que orquesta la transacción del consumo del remanente.
3. Desarrolla el controlador `RecordConsumptionController` y las rutas `POST /api/kitchen/consumption` protegidas por el middleware `requireAuth`.
4. Cubre el desarrollo mediante tests TDD unitarios y de integración con supertest.
```

### Respuesta del agente de IA:
Se ha implementado el vertical slice de **Consumo Parcial de Remanentes (`TK-005`)**:
1. **Dominio:**
   - Adición del método `consume` en `Remanente` con la lógica de negocio FEFO e integridad decimal mediante `decimal.js`.
2. **Aplicación:**
   - Creación del caso de uso `RecordConsumptionUseCase` para registrar consumos de insumos en cocina.
3. **Infraestructura:**
   - Endpoint `POST /api/kitchen/consumption` validado con Zod y protegido por JWT.
   - Pruebas unitarias e integración en verde.

---

### **8.6. Descarte de Remanentes por Merma (TK-006)**

**Prompt 6 Implementación de Módulo de Descarte por Merma:**
```md
Usando el ticket `TK-006` (docs/05_agile_planning/12_tickets/kitchen/backend/TK-006.md) y las directivas de backend y dominio, implementa el vertical slice `kitchen` de descarte de remanentes por merma:
1. Agrega el método `discard` en la entidad `Remanente` que realiza la transición a `DISCARDED` y setea a cero la cantidad, arrojando excepciones si ya está consumido o descartado previamente.
2. Crea el caso de uso `DiscardRemanenteUseCase`.
3. Desarrolla el controlador `DiscardRemanenteController` y monta el endpoint `POST /api/kitchen/remanentes/:id/discard` en el router de cocina.
4. Cubre todo el comportamiento bajo la estrategia TDD.
```

### Respuesta del agente de IA:
Se ha implementado el vertical slice de **Descarte de Remanentes por Merma (`TK-006`)**:
1. **Dominio:**
   - Reglas de transición de estados y prevención de "Double Discard" sobre insumos consumidos o inactivos.
2. **Aplicación:**
   - Caso de uso `DiscardRemanenteUseCase` para coordinar el descarte por motivos del enum `DiscardReason`.
3. **Infraestructura:**
   - Endpoint `POST /api/kitchen/remanentes/:id/discard` protegido.
   - Tests asertivos de integración y unitarios pasando al 100%.

---

## 9. Tercera Entrega: Desarrollo del Frontend e Interfaz Offline-First (TK-007)

### **9.1. Pantalla de Notificaciones y Alertas Dinámicas en Frontend (TK-007)**

**Prompt 1 Configuración del Frontend, Persistencia Local e Interfaz:**
```md
Usando el ticket `TK-007` (docs/05_agile_planning/12_tickets/kitchen/frontend/TK-007.md) y las directivas de `docs/04_governance_and_quality/rules/frontend_rules.md`, implementa el módulo frontend de notificaciones táctiles y resiliencia offline:
1. Configura el entorno en `/apps/frontend` bajo @restostock/frontend con HSL CSS variables, escala ergonómica para botones táctiles (mínimo 48px) e Industrial Dark Mode.
2. Define los modelos `ActiveRemanentDto` y puertos de repositorio `IRemanenteRepository`.
3. Crea la lógica pura de semáforos FEFO (`calculateAlertSeverity`) y cúbrela con tests unitarios.
4. Configura Dexie.js para la persistencia local de transacciones offline y crea el hook `useOfflineQueue` para la sincronización FIFO automática basada en el estado de red.
5. Desarrolla los componentes `NotificationBanner` y `NotificationFeed` (con modales para consumo y descarte) y sus correspondientes tests unitarios e integración.
6. Crea el componente raíz `App.tsx` integrando todos los elementos en un layout industrial premium que sirva como dashboard interactivo.
7. Refactoriza todo el código importado para ajustarse a `verbatimModuleSyntax` usando `import type` e impide el uso de parameter properties para evitar excepciones en `tsc` con `erasableSyntaxOnly`.
```

### Respuesta del agente de IA:
Se ha implementado la pantalla de alertas del frontend y la resiliencia offline-first con IndexedDB (`TK-007`) con las siguientes características:
1. **Andamiaje y Estilos:**
   - [index.css](apps/frontend/src/index.css) y [App.css](apps/frontend/src/App.css) con el sistema de diseño completo Industrial Dark Mode y accesibilidad para tabletas de cocina.
2. **Lógica de Negocio y Dominio:**
   - [remanente.ts](apps/frontend/src/domain/models/remanente.ts) y [alert-calculator.ts](apps/frontend/src/domain/services/alert-calculator.ts) con tests unitarios asertivos para el cálculo FEFO (Rojo, Amarillo, Verde).
3. **Resiliencia Offline-First:**
   - [dexie-db.ts](apps/frontend/src/infrastructure/persistence/dexie-db.ts) y [useOfflineQueue.ts](apps/frontend/src/presentation/hooks/useOfflineQueue.ts) con cola FIFO persistente localmente.
4. **UI y Componentes:**
   - [NotificationBanner.tsx](apps/frontend/src/presentation/components/NotificationBanner.tsx), [NotificationFeed.tsx](apps/frontend/src/presentation/components/NotificationFeed.tsx) y [App.tsx](apps/frontend/src/App.tsx) integrados y probados.
5. **Testing de Calidad (DoD):**
   - 23 tests de componentes e integración pasando exitosamente en total.
   - Compilación limpia con `pnpm build` y linter oxlint con 0 advertencias y 0 errores.

---

## 10. Gobernanza VSDD y Flujos Maestros de Desarrollo

Para garantizar el cumplimiento de los flujos de desarrollo industrializado y las 3 Quality Gates Enterprise:

### **10.1. Flujos Maestros Reorganizados (`.agents/workflows/`)**
1. **[00_master_vsdd_workflow.md](.agents/workflows/00_master_vsdd_workflow.md):** Trazo máster end-to-end (Idea ➔ PRD ➔ Rules ➔ TDD ➔ Reviewer ➔ Commit).
2. **[00_greenfield_bootstrap_workflow.md](.agents/workflows/00_greenfield_bootstrap_workflow.md):** Arranque de proyecto nuevo desde cero (Idea ➔ Stack aprobado ➔ Repositorio Operativo), una única vez por proyecto.
3. **[00_brownfield_adoption_workflow.md](.agents/workflows/00_brownfield_adoption_workflow.md):** Adopción de `.agents/` en código existente sin `docs/` previo (Código Existente ➔ `.agents/` Operativo), una única vez por proyecto.
4. **[01_cascading_spec_workflow.md](.agents/workflows/01_cascading_spec_workflow.md):** Protocolo de especificación en cascada.
5. **[02_cascading_dev_workflow.md](.agents/workflows/02_cascading_dev_workflow.md):** Protocolo de desarrollo guiado por tickets técnicos.
6. **[03_spec_audit_workflow.md](.agents/workflows/03_spec_audit_workflow.md):** Prompt de auditoría de especificaciones VSDD en 7 fases (`docs/`).
7. **[04_dev_audit_workflow.md](.agents/workflows/04_dev_audit_workflow.md):** Prompt de auditoría de código y calidad VSDD en 7 fases (`apps/`).
8. **[05_test_runner_workflow.md](.agents/workflows/05_test_runner_workflow.md):** Subagente autónomo de Testing TDD (Red-Green-Refactor).
9. **[06_full_qa_pipeline.md](.agents/workflows/06_full_qa_pipeline.md):** Pipeline QA Completo SOTA v2.1 con Stryker Mutation Score ≥ 70% y veredicto JSON Schema.
10. **[07_production_observability_workflow.md](.agents/workflows/07_production_observability_workflow.md):** Observabilidad en Producción Shift-Right — de incidencia a ticket `TK-XXX`.
11. **[08_smoke_test_deploy_validation.md](.agents/workflows/08_smoke_test_deploy_validation.md):** Validación post-despliegue con veredicto PASS/FAIL y rollback automático OpenTofu.

### **10.2. Catálogo Completo de Skills (`.agents/skills/` — 35 Skills)**

#### Fase Documental (`specs/`)
| ID | Skill | Archivo |
|:---|:------|:--------|
| SK-01 | Descubrimiento de Producto | `specs/01_product_definition/SK-01_discover_product_vision.md` |
| SK-02 | Generación del PRD | `specs/01_product_definition/SK-02_generate_prd.md` |
| SK-03 | Modelo de Dominio | `specs/02_architecture_design/SK-03_design_domain_model.md` |
| SK-04 | Diseño Técnico | `specs/02_architecture_design/SK-04_design_technical_architecture.md` |
| SK-05 | Asistente UI/UX | `specs/02_architecture_design/SK-05_design_ui_ux_system.md` |
| SK-06 | Esquema de Base de Datos | `specs/03_persistence_and_api/SK-06_design_database_schema.md` |
| SK-07 | Especificación API REST | `specs/03_persistence_and_api/SK-07_design_api_specification.md` |
| SK-08 | Estrategia de Seguridad | `specs/04_governance_and_quality/SK-08_define_security_strategy.md` |
| SK-09 | Estrategia de Pruebas | `specs/04_governance_and_quality/SK-09_define_testing_strategy.md` |
| SK-10 | Pipeline CI/CD | `specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md` |
| SK-11 | Historias de Usuario (INVEST) | `specs/05_agile_planning/SK-11_generate_user_stories.md` |
| SK-12 | Planificación de Tickets | `specs/05_agile_planning/SK-12_generate_backlog_tickets.md` |
| SK-13 | Matriz de Trazabilidad | `specs/05_agile_planning/SK-13_generate_traceability_matrix.md` |
| SK-14 | Mapa del Backlog | `specs/05_agile_planning/SK-14_generate_backlog_map.md` |
| SK-15 | Registro de PRs | `specs/05_agile_planning/SK-15_document_pull_requests.md` |
| SK-35 | Generación del Contrato Operativo Raíz (AGENTS.md) | `specs/04_governance_and_quality/SK-35_generate_root_contract.md` |

#### Fase de Codificación (`development/`)
| ID | Skill | Archivo |
|:---|:------|:--------|
| SK-16 | Desarrollo Backend & Entidades | `development/02_backend_development/SK-16_develop_backend_ticket.md` |
| SK-17 | Desarrollo Frontend & Touch UI | `development/03_frontend_development/SK-17_develop_frontend_ticket.md` |
| SK-18 | Migraciones, Seeds & Anti-Orfandad | `development/04_persistence_and_db/SK-18_execute_db_migration.md` |
| SK-19 | Refactor & Anti-N+1 / Anti-Mass-Assignment | `development/05_quality_and_lint/SK-19_refactor_and_lint.md` |
| SK-20 | Browser Visual QA | `development/06_visual_qa/SK-20_execute_browser_qa.md` |
| SK-21 | Auditoría Accesibilidad UI/a11y | `development/06_visual_qa/SK-21_audit_ui_accessibility.md` |
| SK-22 | DBA Log Analysis & Troubleshooting | `development/05_quality_and_lint/SK-22_agent_troubleshooting.md` |
| SK-23 | Seguridad Anti-Slopsquatting | `development/05_quality_and_lint/SK-23_audit_dependency_security.md` |
| SK-24 | Characterization Testing | `development/05_quality_and_lint/SK-24_execute_characterization_testing.md` |
| SK-25 | Auditoría de Validación de Contratos | `development/05_quality_and_lint/SK-25_audit_contract_validation.md` |
| SK-26 | Recuperador Dinámico Few-Shot | `development/05_quality_and_lint/SK-26_retrieve_few_shot_context.md` |
| SK-27 | Extracción de Reglas Legacy | `development/01_rules_extraction/SK-27_extract_project_rules.md` |
| SK-28 | Seeding Profesional Idempotente | `development/04_persistence_and_db/SK-28_manage_database_seeding.md` |
| SK-29 | Load & Performance Testing | `development/07_performance_and_observability/SK-29_load_and_performance_testing.md` |
| SK-30 | Extractor de Diagramas Legacy (C4/ERD) | `development/01_rules_extraction/SK-30_legacy_diagram_extractor.md` |
| SK-31 | Indexador de Deuda Técnica | `development/01_rules_extraction/SK-31_technical_debt_indexer.md` |
| SK-32 | Test Fixture Builder (Object Mother) | `development/05_quality_and_lint/SK-32_test_fixture_builder.md` |
| SK-33 | Auditoría de Configuración de Entorno Fail-Fast | `development/01_rules_extraction/SK-33_environment_configuration_auditor.md` |
| SK-34 | Model-Based Testing Designer (MBT & Oracles) | `development/08_testing/SK-34_model_based_testing_designer.md` |

### **10.3. Integridad del Framework y Scripts de Validación**
- **Validar integridad:** `bash .agents/scripts/validate_agents.sh` — verifica directorios, cuenta skills/workflows y audita 0 enlaces rotos.
- **Auditar enlaces:** `python3 .agents/scripts/check_links.py` — resolución portable vía `__file__` (sin rutas hardcodeadas).
- **Auto-reparar enlaces:** `python3 .agents/scripts/fix_links.py` — corrige enlaces rotos que apunten a `docs/`.

### **10.4. Prompt para Ejecución de Tickets con Reviewer Independiente y Quality Gates Enterprise:**
```md
Agente, ejecuta el ticket técnico TK-XXX siguiendo el protocolo `.agents/workflows/02_cascading_dev_workflow.md`:
1. Sincroniza las reglas de gobernanza en `docs/04_governance_and_quality/rules/` y `DESIGN.md`.
2. Aplica TDD (RED-GREEN-REFACTOR) usando repositorios InMemory.
3. Supera las Quality Gates: 0 errores linter/compilador (`pnpm run lint`), `npx @google/design.md lint DESIGN.md` (0 errores/warnings) y Mutation Score >= 70% con @stryker-mutator/core.
4. Invoca la revisión adversarial del Reviewer Independiente (Validación Cruzada).
5. Tras dictamen APROBADO, realiza un único commit atómico.
```