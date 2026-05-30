# Mapa de fuentes canónicas y reglas cortas

Documento estable: **dónde vive la norma detallada** frente a **recordatorios en `.cursor/rules/`**. Objetivo: una sola fuente por tema y menos texto duplicado entre ficheros.

## Reglas cortas frente a canónicos

- **Fuente canónica:** sitio con el detalle suficiente para implementar o revisar (OpenAPI, guías en `docs/`, o un `.mdc` largo cuando ahí se concentra toda la convención, p. ej. capas y paquetes Java).
- **Regla corta (`.cursor/rules/*.mdc`):** viñetas y enlaces; remite al canónico en lugar de copiar párrafos largos.

Al **encargar trabajo** suele bastar con la regla que hace de índice (p. ej. [backend-generation-standard.mdc](../../.cursor/rules/backend-generation-standard.mdc)); en cambios de contrato, seguridad o tests conviene citar **también** el canónico concreto (tabla siguiente).

## Tabla: tema → canónico → regla corta típica

| Tema | Canónico (detalle) | Regla corta / índice |
|------|--------------------|----------------------|
| OpenAPI, operaciones, errores `Problem` | [docs/api/openapi.yaml](../api/openapi.yaml) y [.cursor/rules/api-contract.mdc](../../.cursor/rules/api-contract.mdc) | Una frase + enlace |
| Prefijos `/api/<contexto>/`, diseño REST | [.cursor/rules/api-design.mdc](../../.cursor/rules/api-design.mdc) | Tabla de prefijos; errores → `api-contract` |
| JWT, roles, rutas públicas, relay gateway | [docs/security/jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md) y [.cursor/rules/api-security.mdc](../../.cursor/rules/api-security.mdc) | Resumen mínimo + enlace al doc |
| Capas Maven, `com.mtl.*`, JPA/Mongo, auditoría JPA | [.cursor/rules/spring-boot-4-backend.mdc](../../.cursor/rules/spring-boot-4-backend.mdc) | Única descripción amplia de paquetes |
| Alta REST catálogo (`POST /api/catalog/trees`), `usuario_app`, auditoría R3 | [docs/adr/0004-catalog-rest-write-and-audit.md](../adr/0004-catalog-rest-write-and-audit.md) | Enlace en `spring-boot-4-backend` y `backend-generation-standard` |
| Híbrido SQL + Mongo (catálogo) | [docs/data-model/mongo.md](../data-model/mongo.md) y [.cursor/rules/mongo-hybrid.mdc](../../.cursor/rules/mongo-hybrid.mdc) | Negocio del híbrido; paquetes → `spring-boot-4-backend` |
| Tests backend por capa, Surefire/Failsafe | [testing-java.md](testing-java.md) | [quality-and-testing.mdc](../../.cursor/rules/quality-and-testing.mdc) |
| Tests frontend por capa, Vitest (Vue 3) | [testing-frontend.md](testing-frontend.md) | [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc) y [quality-and-testing.mdc](../../.cursor/rules/quality-and-testing.mdc) |
| Subida de fotos (presign, MinIO, confirm, principal, EXIF cliente, props `mtl.media.*`) | [docs/engineering/media-upload-hu006.md](media-upload-hu006.md) y [docs/api/openapi.yaml](../api/openapi.yaml) | [.cursor/rules/api-security.mdc](../../.cursor/rules/api-security.mdc) (JWT/objeto privado) |
| Eventos Kafka (topics, payload, idempotencia) | [docs/events/kafka-events.md](../events/kafka-events.md) | [.cursor/rules/kafka-events.mdc](../../.cursor/rules/kafka-events.mdc) |
| Agregado *ejemplar* (PG/Mongo/Kafka en español; HTTP `/trees` + `treeId`) | [docs/adr/0006-ejemplar-aggregate-http-kafka-naming.md](../adr/0006-ejemplar-aggregate-http-kafka-naming.md) | [openapi.yaml](../api/openapi.yaml), [mongo.md](../data-model/mongo.md) |
| Contratos HTTP en inglés + persistencia español (mapeo DTO) | [docs/adr/0007-english-http-spanish-persistence.md](../adr/0007-english-http-spanish-persistence.md) | [api-design.mdc](../../.cursor/rules/api-design.mdc), [openapi.yaml](../api/openapi.yaml) |
| Nomenclatura global (BD, API, código, docs, Git, checklist auditoría) | [naming-conventions.md](naming-conventions.md) | [AGENTS.md](../../AGENTS.md), ADR-0006, ADR-0007 |
| Checklist al tocar `services/` | (índice) | [.cursor/rules/backend-generation-standard.mdc](../../.cursor/rules/backend-generation-standard.mdc) |
| Frontend Vue 3 (`frontend/`) | (convenciones en regla; guías en `docs/` cuando existan) | [.cursor/rules/frontend-vue3.mdc](../../.cursor/rules/frontend-vue3.mdc) |

Registro del plan de redacción aplicado (prioridades y ficheros): [ADR-0003](../adr/0003-cursor-rules-refinement-and-canonical-map.md).
