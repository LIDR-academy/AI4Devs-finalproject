# AGENTS.md

## Proyecto (resumen)

MyTreeLibrary: visión de producto, objetivos, stack y arquitectura en [readme.md](readme.md) (§§0–2). Regla de producto detallada: `.cursor/rules/product-context.mdc`.

## Estructura del repositorio (monorepo)

Carpetas principales: **`frontend/`**, **`services/`**, **`platform/observability/`**, **`infra/`**, **`docs/`**. Árbol y contexto: [readme.md](readme.md) (§2.3). Infra Docker: [infra/compose/README.md](infra/compose/README.md).

**Build, arranque local backend y puertos:** [services/README.md](services/README.md). **Tests Java (Surefire/Failsafe, `test` / `testIT`):** [docs/engineering/testing-java.md](docs/engineering/testing-java.md).

## Encargos al agente (plantilla)

**Texto de la plantilla (única fuente):** [`.cursor/skills/encargo-mtl/SKILL.md`](.cursor/skills/encargo-mtl/SKILL.md). **No** se repite aquí el cuerpo para evitar desalineación; modifica solo ese fichero si cambias la plantilla del equipo.

**Uso en Cursor:** paso a paso en la sección **«Cómo usar»** del propio [`.cursor/skills/encargo-mtl/SKILL.md`](.cursor/skills/encargo-mtl/SKILL.md) (resumen: insertar con **`/`** o **`@`**, rellenar corchetes **en el mensaje antes de enviar**, opcionalmente **`@`** a archivos). También puedes copiar/pegar desde el editor o usar un snippet.

**Hábitos de trabajo** (“cómo encargar”, “no tocar `docs/` salvo…”) pueden ampliar este `AGENTS.md` o **reglas cortas** en `.cursor/rules/*.mdc` enlazando a `docs/`. Reserva **`docs/`** para arquitectura, contrato y decisiones estables; evita ficheros nuevos sueltos en `docs/engineering/` salvo **guías estables** (p. ej. [canonical-sources.md](docs/engineering/canonical-sources.md)).

## Documentación normativa complementaria

- **Índice `docs/`:** [docs/README.md](docs/README.md). **Reglas Cursor (globs, `alwaysApply`, uso):** [docs/onboarding/cursor-rules-primer.md](docs/onboarding/cursor-rules-primer.md).
- **Mapa tema → fuente canónica:** [docs/engineering/canonical-sources.md](docs/engineering/canonical-sources.md).
- **Backend Spring (paquetes, persistencia, Lombok, auditoría):** [.cursor/rules/spring-boot-4-backend.mdc](.cursor/rules/spring-boot-4-backend.mdc).
- **Checklist al tocar `services/`** (definición de hecho en el propio fichero): [.cursor/rules/backend-generation-standard.mdc](.cursor/rules/backend-generation-standard.mdc).
- **Patrones microservicios (MVP):** [.cursor/rules/microservices-patterns.mdc](.cursor/rules/microservices-patterns.mdc).
- **Seguridad API / JWT:** [.cursor/rules/api-security.mdc](.cursor/rules/api-security.mdc) · [docs/security/jwt-gateway-strategy.md](docs/security/jwt-gateway-strategy.md) · Keycloak local: [infra/compose/README.md](infra/compose/README.md) · visión producto: [readme.md](readme.md) §2.5.
- **Logging:** [.cursor/rules/logging.mdc](.cursor/rules/logging.mdc).
- **Contrato HTTP (cliente):** [docs/api/openapi.yaml](docs/api/openapi.yaml) · convenciones [.cursor/rules/api-design.mdc](.cursor/rules/api-design.mdc) · reglas [.cursor/rules/api-contract.mdc](.cursor/rules/api-contract.mdc).
- **Frontend Vue 3 (`frontend/`):** [.cursor/rules/frontend-vue3.mdc](.cursor/rules/frontend-vue3.mdc).
- **Eventos Kafka:** [docs/events/kafka-events.md](docs/events/kafka-events.md) · [.cursor/rules/kafka-events.mdc](.cursor/rules/kafka-events.mdc).
- **Híbrido SQL + Mongo (catálogo):** [docs/data-model/mongo.md](docs/data-model/mongo.md) · [.cursor/rules/mongo-hybrid.mdc](.cursor/rules/mongo-hybrid.mdc).

## Prioridades del MVP

Funcionalidades y backlog: [readme.md](readme.md) (§1.2) · [docs/backlog/backlog.md](docs/backlog/backlog.md).

## Criterios generales
- No exponer entidades JPA directamente en la API.
- Priorizar claridad, mantenibilidad y separación de responsabilidades.
- Proponer código pequeño, modular y bien nombrado.
- Añadir validación, manejo de errores y pruebas básicas en código nuevo.
- Mantener el enfoque del producto: hobby, comunidad y memoria de árboles.

## Reglas de generación
- Al **crear o ampliar un microservicio** Spring Boot con REST, seguir la **plantilla de paquetes** y la tabla módulo ↔ `com.mtl.*` en [`.cursor/rules/spring-boot-4-backend.mdc`](.cursor/rules/spring-boot-4-backend.mdc) y el checklist [`.cursor/rules/backend-generation-standard.mdc`](.cursor/rules/backend-generation-standard.mdc); tomar **catalog-service** como referencia de estructura hasta que exista un segundo servicio completo equivalente.
- Antes de crear código nuevo, revisar si ya existe una pieza reutilizable.
- Si una clase o componente crece demasiado, proponer división.
- Si hay una decisión de diseño ambigua, escoger la opción más simple compatible con el MVP.

## Reglas de nomenclatura e idioma del proyecto
- El idioma del proyecto es el español, la documentación se generará en este idioma
- El nombre de los archivos de documentación generados será en INGLÉS, por coherencia con nomenclatura heredada (readme)
- El nombre de las columnas en Base de datos será en español
- **Nomenclatura (auditoría):** [docs/engineering/naming-conventions.md](docs/engineering/naming-conventions.md) — BD y docs en español (fuente de verdad de dominio); API en inglés con mapeo DTO ([ADR-0007](docs/adr/0007-english-http-spanish-persistence.md), justificación de la disparidad en ese ADR); *ejemplar* ([ADR-0006](docs/adr/0006-ejemplar-aggregate-http-kafka-naming.md))
