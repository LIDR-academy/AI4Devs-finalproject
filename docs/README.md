# Documentación (`docs/`)

Índice de carpetas. Visión de producto, stack y árbol del repositorio: [readme.md](../readme.md).

**Normas de código (Cursor):** carpeta [`.cursor/rules/`](../.cursor/rules/) en la raíz del monorepo. **Checklist al trabajar en `services/`:** [backend-generation-standard.mdc](../.cursor/rules/backend-generation-standard.mdc) (enlaza al resto de reglas y a `docs/`).

**Convención rápida de términos (roles):** en documentación funcional/técnica usar `COLABORADOR` y `ADMIN` cuando se hable de permisos o perfiles (alineado con Keycloak `mtl-realm.json`).

| Carpeta | Contenido principal |
|---------|----------------------|
| [adr/](adr/README.md) | Architecture Decision Records (índice en `adr/README.md`; p. ej. [0003](adr/0003-cursor-rules-refinement-and-canonical-map.md): registro del refinamiento de reglas Cursor y del mapa canónico) |
| [api/](api/openapi.yaml) | Contrato HTTP (OpenAPI 3) del API Gateway |
| [backlog/](backlog/README.md) | Backlog y desgloses `HU-*-ticket-breakdown.md` |
| [data-model/](data-model/data-model.md) | Reglas de negocio y modelo relacional |
| [data-model/mongo.md](data-model/mongo.md) | Colecciones Mongo, validación, índices |
| [engineering/](engineering/testing-java.md) | **Canónico técnico**: guías de implementación y normas estables ([testing-java.md](engineering/testing-java.md), [testing-frontend.md](engineering/testing-frontend.md); [mapa canónico](engineering/canonical-sources.md)). |
| [onboarding/](onboarding/cursor-rules-primer.md) | **Inicio rápido**: cómo empezar, orden de lectura y uso práctico (sin duplicar normativa técnica de `engineering/`); guía Vue: [vue-development-guide.md](onboarding/vue-development-guide.md); guía de diseño frontend: [frontend-design-guide.md](onboarding/frontend-design-guide.md); checklist operativo: [frontend-design-checklist.md](onboarding/frontend-design-checklist.md); playbook IA: [ai-development-playbook.md](onboarding/ai-development-playbook.md); ramas Git/GitHub: [github-branching.md](onboarding/github-branching.md) |
| [events/](events/kafka-events.md) | Contrato de eventos Kafka |
| [security/](security/jwt-gateway-strategy.md) | Estrategia JWT, gateway y realm `mtl` |
| [use-cases/](use-cases/use-case-summary.md) | Resumen y diagrama de casos de uso |

Infra local (Compose, Keycloak, puertos): [infra/compose/README.md](../infra/compose/README.md).
