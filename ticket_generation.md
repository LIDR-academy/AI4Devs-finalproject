# Guía de Generación y Desarrollo de Tickets — Adresles

## 1. El Sistema de Herramientas

Este proyecto combina tres capas de herramientas que trabajan juntas:

```
┌─────────────────────────────────────────────────────┐
│  MEMORY BANK  (contexto persistente entre sesiones) │
│  memory-bank/README.md · ADRs · sessions/           │
└────────────────────────┬────────────────────────────┘
                         │ alimenta contexto a ↓
┌────────────────────────▼────────────────────────────┐
│  OPENSPEC WORKFLOW  (gestión de cambios estructurada)│
│  openspec/changes/<name>/  →  proposal → specs →   │
│  design → tasks → apply → verify → archive          │
└────────────────────────┬────────────────────────────┘
                         │ comandos del agente desde ↓
┌────────────────────────▼────────────────────────────┐
│  CURSOR COMMANDS + SKILLS  (puntos de entrada)       │
│  /opsx-new · /opsx-ff · /opsx-apply · /opsx-verify  │
│  /plan-backend-ticket · /develop-backend · etc.      │
└─────────────────────────────────────────────────────┘
```

### 1.1 Comandos disponibles

| Comando | Cuándo usarlo |
|---------|--------------|
| `/opsx-new <nombre>` | Crear un nuevo change (scaffolding vacío) |
| `/opsx-ff <nombre>` | Crear TODOS los artefactos de un change de golpe (recomendado para tickets pequeños) |
| `/opsx-continue <nombre>` | Crear el siguiente artefacto uno a uno (para mayor control) |
| `/opsx-apply <nombre>` | Implementar las tareas del change |
| `/opsx-verify <nombre>` | Verificar que la implementación es completa y coherente antes de archivar |
| `/opsx-sync <nombre>` | Sincronizar delta specs con las specs principales (sin archivar) |
| `/opsx-archive <nombre>` | Archivar el change completado |
| `/opsx-explore <descripción>` | Pensar en voz alta / explorar ideas antes de crear el change |
| `/enrich-us <ticket-id>` | Enriquecer una historia de usuario con detalle técnico |
| `/plan-backend-ticket <ticket-id>` | Generar plan detallado de implementación backend |
| `/plan-frontend-ticket <ticket-id>` | Generar plan detallado de implementación frontend |
| `/develop-backend <ticket-id>` | Implementar directamente un ticket backend (lee memory-bank primero) |
| `/develop-frontend <ticket-id>` | Implementar directamente un ticket frontend |
| `/update-docs` | Actualizar documentación tras cambios |

### 1.2 Memory Bank: para qué sirve en cada momento

| Momento | Qué leer / actualizar |
|---------|----------------------|
| Inicio de sesión | `memory-bank/README.md` + `project-context/overview.md` |
| Antes de diseñar | ADR relevante en `memory-bank/architecture/` |
| Al tomar decisión arquitectural nueva | Crear nuevo ADR con plantilla `_template.md` |
| Al terminar una sesión | Crear/actualizar `memory-bank/sessions/YYYY-MM-DD-<nombre>.md` |
| Al descubrir un patrón repetible | Documentar en `memory-bank/patterns/` (sección pendiente) |

---

## 2. Flujo Recomendado para Tickets Pequeños

El objetivo es tickets que **terminen en una sola sesión**, con revisión profunda en cada paso.

```
SESIÓN
  │
  ├─ 0. Leer contexto ──── memory-bank/README.md + ADRs relevantes
  │
  ├─ 1. Preparar change ── /opsx-ff <nombre>     ← genera todos los artefactos
  │        │
  │        ├── proposal.md   (¿POR QUÉ?)  ← REVISAR antes de continuar
  │        ├── specs/        (¿QUÉ?)      ← REVISAR: requisitos y escenarios
  │        ├── design.md     (¿CÓMO?)     ← REVISAR: decisiones técnicas
  │        └── tasks.md      (checklist)  ← REVISAR: orden y granularidad
  │
  ├─ 2. Implementar ─────── /opsx-apply <nombre> ← tarea a tarea
  │
  ├─ 3. Verificar ──────────/opsx-verify <nombre> ← revisar CRITICAL/WARNING
  │        └── fix si hay problemas, luego re-verificar
  │
  ├─ 4. Actualizar docs ─── /update-docs          ← specs, api-spec, standards
  │
  ├─ 5. Actualizar MB ───── memory-bank/sessions/  ← notas de la sesión
  │
  └─ 6. Archivar ──────────/opsx-archive <nombre> ← sincroniza specs y mueve a archive/
```

### 2.1 Cuándo usar `/opsx-ff` vs `/opsx-new` + `/opsx-continue`

- **`/opsx-ff`** → para tickets pequeños donde confías en que la IA puede generar los artefactos en un solo paso. Luego los revisas todos.
- **`/opsx-new` + `/opsx-continue`** → para tickets más complejos o cuando quieres revisar y ajustar cada artefacto antes de continuar al siguiente. Más control, más lento.

Para la filosofía de este proyecto (tickets pequeños, revisión profunda), **la combinación recomendada es `/opsx-ff` seguido de revisión manual de los artefactos generados, editándolos si es necesario antes de `/opsx-apply`**.

### 2.2 Cuándo usar `/enrich-us` y `/plan-backend-ticket`

Estos comandos son para cuando partes de un ticket definido externamente (por ejemplo en Jira o en un doc de producto):

- `/enrich-us CU-03` → toma el ticket crudo y lo enriquece con contexto técnico del `memory-bank` antes de crear el change
- `/plan-backend-ticket CU-03` → genera un plan de implementación estructurado en `openspec/changes/<feature>/[ticket_id]_backend.md`

Si el ticket lo defines tú directamente en la conversación con la IA (sin Jira), **puedes saltarte estos pasos** e ir directamente a `/opsx-ff`.

---

## 3. Ejemplo 1 — Ticket Backend: Webhook de notificación a eCommerce

**Descripción del ticket**: Cuando una `Order` pasa a estado `SYNCED`, el sistema debe notificar al eCommerce mediante una llamada HTTP al webhook configurado en `Ecommerce.webhookUrl`.

### Paso 0: Leer contexto de sesión

Antes de empezar, indicarle a la IA:

> Lee `memory-bank/README.md` y los ADRs relevantes antes de comenzar.

Esto garantiza que la IA conoce el stack (NestJS, Prisma, DDD, BullMQ) y las decisiones ya tomadas.

### Paso 1: (Opcional) Explorar dudas previas

Si tienes dudas sobre el diseño, usa explorar primero:

```
/opsx-explore ¿Cómo debería gestionar los reintentos del webhook de notificación
a eCommerce? ¿Cola BullMQ o llamada directa?
```

La IA actuará como partner de pensamiento, sin generar artefactos aún.

### Paso 2: Crear el change y generar todos los artefactos

```
/opsx-ff cu02-webhook-ecommerce-sync
```

La IA ejecuta internamente:

```bash
openspec new change "cu02-webhook-ecommerce-sync"
openspec status --change "cu02-webhook-ecommerce-sync" --json
openspec instructions proposal --change "cu02-webhook-ecommerce-sync" --json
# → crea proposal.md
openspec instructions specs --change "cu02-webhook-ecommerce-sync" --json
# → crea specs/ecommerce-webhook/spec.md
openspec instructions design --change "cu02-webhook-ecommerce-sync" --json
# → crea design.md
openspec instructions tasks --change "cu02-webhook-ecommerce-sync" --json
# → crea tasks.md
openspec status --change "cu02-webhook-ecommerce-sync"
```

Resultado en `openspec/changes/cu02-webhook-ecommerce-sync/`:

```
proposal.md
specs/
  ecommerce-webhook/
    spec.md
design.md
tasks.md
.openspec.yaml
```

### Paso 3: Revisar los artefactos (el paso más importante)

**Revisar `proposal.md`** — verifica:
- ¿El "Por Qué" refleja correctamente la necesidad de negocio?
- ¿"Qué Cambia" lista todos los efectos (nuevo servicio, nuevo campo en Ecommerce para webhookUrl, cola de reintentos)?
- ¿Las capacidades identificadas son correctas?

**Revisar `specs/ecommerce-webhook/spec.md`** — verifica:
- ¿Cubre el escenario happy path (webhook OK → 200)?
- ¿Cubre el escenario de fallo (webhook falla → reintento)?
- ¿Cubre el caso de Ecommerce sin webhookUrl configurada?
- ¿Usa formato SHALL/MUST? ¿Los escenarios tienen `####` (4 hashtags)?

**Revisar `design.md`** — verifica:
- ¿Propone usar BullMQ para los reintentos (consistente con ADR-003 y el uso de BullMQ en CU-01)?
- ¿Documenta el contrato del payload JSON enviado al webhook?
- ¿Lista alternativas consideradas?

**Revisar `tasks.md`** — verifica:
- ¿Hay una tarea para añadir `webhookUrl` al modelo `Ecommerce`?
- ¿Hay tarea de migración Prisma?
- ¿Las tareas son lo suficientemente pequeñas (máximo 30 min cada una)?
- ¿El orden respeta las dependencias (schema → service → tests)?

Si algo no está bien, **edita los archivos directamente en el editor** o dile a la IA que los corrija antes de continuar.

### Paso 4: Implementar

```
/opsx-apply cu02-webhook-ecommerce-sync
```

La IA irá tarea a tarea marcando `- [ ]` → `- [x]` conforme avanza. Si detecta un bloqueante, pausa y pregunta.

**Durante la implementación**, para cada tarea revisa:
- ¿El código generado sigue los patrones DDD existentes (módulos NestJS, servicios, repositorios)?
- ¿Los tests cubren los escenarios de la spec?
- ¿El naming es consistente con el resto del proyecto?

### Paso 5: Verificar la implementación

```
/opsx-verify cu02-webhook-ecommerce-sync
```

La IA genera un reporte con tres dimensiones:

```
## Verification Report: cu02-webhook-ecommerce-sync

### Summary
| Dimension    | Status                     |
|--------------|----------------------------|
| Completeness | 8/8 tasks, 3 requirements  |
| Correctness  | 3/3 requirements covered   |
| Coherence    | Followed                   |

All checks passed. Ready for archive.
```

Si hay issues **CRITICAL**: resuelve antes de continuar. **WARNING**: evalúa si debes resolverlos. **SUGGESTION**: opcional.

### Paso 6: Actualizar documentación

```
/update-docs
```

La IA revisa qué documentación necesita actualización:
- `openspec/specs/data-model.md` → campo `webhookUrl` en `Ecommerce`
- `openspec/specs/api-spec-example.yml` → si hay cambio de API pública
- `openspec/specs/backend-standards.mdc` → si se introduce un patrón nuevo

### Paso 7: Actualizar Memory Bank

Crear (o actualizar) `memory-bank/sessions/2026-02-19-cu02-webhook.md`:

```markdown
# Sesión 2026-02-19: CU-02 Webhook eCommerce Sync

> **Change**: `cu02-webhook-ecommerce-sync`
> **Estado**: Completado (8/8 tareas)

## Completado
- Campo `webhookUrl` en modelo `Ecommerce` (Prisma + migración)
- `EcommerceWebhookService` con lógica de llamada HTTP y reintentos BullMQ
- Queue `ecommerce-webhook` en Worker
- Tests unitarios del servicio

## Decisiones tomadas
- Reintentos con backoff exponencial (3 intentos máx.) — consistente con patrón BullMQ existente
- Payload incluye: orderId, status, timestamp, storeId

## Notas para próxima sesión
- Considerar alertas si los 3 reintentos fallan (Slack/email)
```

Si se tomó una decisión arquitectural importante (por ejemplo: "elegimos cola sobre llamada directa por resiliencia"), crear un ADR en `memory-bank/architecture/005-webhook-queue.md` usando la plantilla `_template.md`, y actualizar la tabla en `memory-bank/README.md`.

### Paso 8: Archivar el change

```
/opsx-archive cu02-webhook-ecommerce-sync
```

La IA:
1. Verifica artefactos completos → `openspec status --change "cu02-webhook-ecommerce-sync" --json`
2. Verifica tareas completas → lee `tasks.md`
3. Muestra resumen de qué se va a sincronizar en specs principales
4. Pregunta confirmación para sincronizar delta specs → confirma "Sync now"
5. Aplica cambios a `openspec/specs/ecommerce-webhook/spec.md` (specs principales)
6. Mueve el change a `openspec/changes/archive/2026-02-19-cu02-webhook-ecommerce-sync/`

Resultado final:

```
## Archive Complete

Change: cu02-webhook-ecommerce-sync
Schema: my-workflow
Archived to: openspec/changes/archive/2026-02-19-cu02-webhook-ecommerce-sync/
Specs: ✓ Synced to main specs

All artifacts complete. All tasks complete.
```

---

## 4. Ejemplo 2 — Ticket Backend: Consultar historial de conversación por Order

**Descripción del ticket**: Añadir un endpoint `GET /api/orders/:orderId/conversations` que devuelva el historial de conversaciones de una Order, incluyendo estado, tipo y timestamps. Solo accesible por el eCommerce propietario de la Order.

### Paso 0: Leer contexto

> Lee `memory-bank/README.md` antes de empezar.

La IA identificará que existe `Conversation` en el schema Prisma con relación a `Order`, y que el proyecto usa NestJS con módulos DDD.

### Paso 1: Enriquecer la historia (opcional, si partimos de Jira)

Si el ticket en Jira está poco detallado:

```
/enrich-us CU-03
```

La IA consulta el ticket (o recibe la descripción), aplica contexto del `memory-bank` y devuelve una versión enriquecida con:
- Lista exacta de endpoints con método HTTP, URL y body/response
- Campos del response (id, type, status, createdAt, updatedAt)
- Reglas de autorización (solo eCommerce propietario)
- Casos edge (orderId no existe, Order de otro eCommerce)
- Requisitos de tests

### Paso 2: Crear change y artefactos (modo controlado — uno a uno)

En este ejemplo usamos `new` + `continue` para mayor control:

```
/opsx-new cu03-order-conversation-history
```

La IA crea el scaffolding y muestra el primer artefacto a crear. Luego:

```
/opsx-continue cu03-order-conversation-history
```

→ Crea `proposal.md`. **REVISAR**: ¿está claro el "Por Qué" (necesidad de trazabilidad del cliente)?

```
/opsx-continue cu03-order-conversation-history
```

→ Crea `specs/order-conversations/spec.md`. **REVISAR A FONDO**:
- ¿Hay escenario para Order inexistente (404)?
- ¿Hay escenario para acceso de eCommerce no propietario (403)?
- ¿Hay escenario para Order sin conversaciones (array vacío, no error)?
- ¿El formato de los escenarios usa `#### Scenario:` con 4 hashtags?

```
/opsx-continue cu03-order-conversation-history
```

→ Crea `design.md`. **REVISAR**:
- ¿Propone usar el módulo `ConversationsModule` existente o crear uno nuevo?
- ¿Documenta la estrategia de autorización (validar que la Store pertenece al eCommerce)?

```
/opsx-continue cu03-order-conversation-history
```

→ Crea `tasks.md`. **REVISAR**:
- ¿Hay tarea para el endpoint en el controlador?
- ¿Hay tarea para el método de servicio (con query Prisma que incluya relaciones)?
- ¿Hay tarea para el DTO de respuesta?
- ¿Hay tarea para la validación de autorización?
- ¿Hay tareas de tests unitarios e integración?

### Paso 3: Ajuste fino de tasks.md antes de implementar

En este ejemplo, después de revisar `tasks.md`, decides que falta una tarea de autorización. **Editas directamente** `openspec/changes/cu03-order-conversation-history/tasks.md`:

```markdown
## 3. Seguridad

- [ ] 3.1 Crear guard EcommerceOwnerGuard que valide que orderId pertenece al eCommerce autenticado
- [ ] 3.2 Aplicar guard en el endpoint GET /api/orders/:orderId/conversations
```

Esto es correcto: los artefactos son documentos vivos que puedes editar antes de implementar.

### Paso 4: Implementar

```
/opsx-apply cu03-order-conversation-history
```

La IA implementa tarea a tarea. Al llegar a la tarea del guard, pausará si necesita clarificación sobre el mecanismo de autenticación del eCommerce y preguntará.

### Paso 5: Verificar

```
/opsx-verify cu03-order-conversation-history
```

Revisas el reporte. Ejemplo de output con issues:

```
### Issues

CRITICAL:
- Task 5.2 (integration test) marked incomplete
  → Complete task or mark done if already implemented

WARNING:
- Scenario "Access by non-owner eCommerce" not found in tests
  → Add test: GET /api/orders/:orderId/conversations with wrong eCommerce token → 403
```

Resuelves el CRITICAL implementando el test, luego verificas de nuevo.

### Paso 6: Actualizar docs y Memory Bank

```
/update-docs
```

Luego creas `memory-bank/sessions/2026-02-19-cu03-conversation-history.md` con el resumen de la sesión.

### Paso 7: Archivar

```
/opsx-archive cu03-order-conversation-history
```

---

## 5. Resumen Visual del Flujo Completo

```
┌──────────────────────────────────────────────────────────────────┐
│  TICKET PEQUEÑO — Flujo completo en una sesión                   │
│                                                                  │
│  1. CONTEXTO     → leer memory-bank/README.md                   │
│                                                                  │
│  2. (Opcional)   → /opsx-explore <duda de diseño>               │
│                                                                  │
│  3. (Opcional)   → /enrich-us <ticket-id>   (si viene de Jira)  │
│                                                                  │
│  4. ARTEFACTOS   → /opsx-ff <nombre>        (rápido)            │
│                  → o /opsx-new + /opsx-continue × N  (control)  │
│                                                                  │
│  5. REVISIÓN     → leer y editar proposal.md + specs/ + tasks.md│
│                    (NO implementar hasta estar satisfecho)       │
│                                                                  │
│  6. IMPLEMENTAR  → /opsx-apply <nombre>                         │
│                                                                  │
│  7. VERIFICAR    → /opsx-verify <nombre>                        │
│                    → fix CRITICALs → re-verificar si aplica     │
│                                                                  │
│  8. DOCS         → /update-docs                                  │
│                                                                  │
│  9. MEMORY BANK  → crear/actualizar sessions/ + ADRs si aplica  │
│                                                                  │
│  10. ARCHIVAR    → /opsx-archive <nombre>                       │
│                    (sincroniza specs + mueve a archive/)        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Buenas Prácticas para Tickets Pequeños

### Mantener el scope pequeño

- Un ticket = una capacidad cohesiva
- Si `tasks.md` tiene más de 15 tareas, considera dividir en dos changes
- Las tasks deben completarse en ≤30 min cada una

### Revisar antes de implementar (el paso más valioso)

- Los artefactos de OpenSpec son el "plano" del código: si el plano está mal, el código estará mal
- Dedica el 30% del tiempo a revisar y ajustar proposal + specs + design + tasks
- Editar los artefactos directamente (en el editor) antes de `/opsx-apply` es perfectamente válido

### Memory Bank: cuándo actualizar

- **Siempre**: crear nota de sesión en `sessions/` (2-5 min)
- **Si hay decisión nueva**: crear ADR en `architecture/`
- **Si hay patrón emergente repetible**: documentar en `patterns/`
- **No sobrecargar**: solo documenta lo que la IA necesita saber en la próxima sesión

### Naming de changes

El nombre del change en OpenSpec debe ser kebab-case y descriptivo:

```
cu02-webhook-ecommerce-sync      ✓
cu03-order-conversation-history  ✓
feature-webhook                  ✗ (demasiado genérico)
CU02WebhookSync                  ✗ (no kebab-case)
```

### Verificar siempre antes de archivar

El comando `/opsx-verify` es el "code review" automatizado. Un CRITICAL significa que hay algo objetivamente incompleto. No archives con CRITICALs sin revisar.

---

## 7. Referencia Rápida de Archivos Clave

| Propósito | Ruta |
|-----------|------|
| Contexto del proyecto | `memory-bank/README.md` |
| Visión ejecutiva | `memory-bank/project-context/overview.md` |
| Stack tecnológico | `memory-bank/project-context/tech-stack.md` |
| Glosario del dominio | `memory-bank/project-context/domain-glossary.md` |
| ADRs | `memory-bank/architecture/` |
| Notas de sesiones | `memory-bank/sessions/` |
| Standards backend | `openspec/specs/backend-standards.mdc` |
| Standards frontend | `openspec/specs/frontend-standards.mdc` |
| Modelo de datos | `openspec/specs/data-model.md` |
| Changes activos | `openspec/changes/` |
| Changes archivados | `openspec/changes/archive/` |
| Specs principales | `openspec/specs/` |

---

*Guía generada el 2026-02-19. Actualizar si cambia el workflow o se añaden nuevos comandos.*
