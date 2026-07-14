# Issue-004: Informe de análisis bootstrap — inconsistencias detectadas antes de iniciar Entrega 2

**Fecha:** 2026-07-14
**Contexto:** Ejecución de `prompts/MASTER_BOOTSTRAP_PROMPT.md`. Análisis completo del repositorio (README, documentación, US, tickets, api-spec.yml, prompts, infraestructura) previo a implementar cualquier funcionalidad.
**Estado:** 🟡 Abierto — contiene decisiones pendientes que requieren aprobación del usuario.

---

## A. Inconsistencias en `docs/api-spec.yml` (especificación oficial de la API)

> ⚠️ No se corrigió nada de esta sección: `api-spec.yml` es la fuente de verdad de la API y toda modificación requiere autorización (ver Dudas Pendientes).

### A1. 🔴 Referencias a numeración antigua de US (pre issue-003)

Las descripciones de los endpoints usan la numeración del backlog de 14 US, anterior a la reorganización de issue-003 (13 US):

| Endpoint | Dice | Debería decir |
|---|---|---|
| `GET /artists` | US0002, US0003, US0004 | US0003 (vitrina), US0004 (filtros), US0005 (búsqueda) |
| `GET /artists` params `lat/lng/radius` | US0005 | US0012 (mapa) |
| `GET /artists/{slug}` | US0003 | US0006 (perfil) |
| `GET /artists/{id}/reviews` | US0006 | US0006 (correcto por coincidencia, verificar texto) |
| `certified` param | US0007 | US0004.CA5 (el toggle es de filtros; US0007 es solo el badge) |
| `POST /bookings/{id}/review` | US0011 | US0013 (calificar) |
| `POST /payments/init` y callbacks | US0012 | US0009 (pago Flow) |
| `GET /geo/communes` | US0005 | US0012 (mapa, selector de comuna) |

### A2. 🔴 Endpoints requeridos por las US que no existen en la spec

| Endpoint (según notas técnicas de la US) | US | Notas |
|---|---|---|
| `GET /showcase` (secciones de vitrina) | US0003.CA1 | La spec solo tiene `GET /artists` plano, sin agrupación por secciones |
| `GET /artists/{id}/availability?week=` | US0008 | La spec embebe `availableSlots` en `ArtistDetail`, pero son ventanas semanales recurrentes, no slots concretos reservables por semana |
| `POST /bookings/hold` (TTL 5 min) | US0008.CA7-CA8 | El mecanismo de hold temporal no existe en la spec |
| `POST /quotes/calculate` | US0011 | Eliminado deliberadamente en sesión 4, pero US0011 sigue en el backlog como Should-Have — contradicción |
| `GET /artists/geo?lat&lng&radius` | US0012 | `GET /artists` ya acepta lat/lng/radius; decidir si eso cubre US0012 y actualizar las notas de la US |

### A3. 🔴 Regla de negocio errónea en `/payments/init`

La spec responde `409 Booking not in confirmed status`, pero según el modelo de datos y US0009.CA3 el flujo es: booking se crea `pending_payment` → el pago exitoso lo pasa a `confirmed`. El pago debe iniciarse cuando el booking está en `pending_payment`, no en `confirmed`.

### A4. 🟡 Schemas desalineados con `docs/data-model.md`

| Schema | Problema |
|---|---|
| `BookingRequest` | Usa `bookingDate` (datetime) + `description` + `bodyPlacement` + `estimatedDurationMinutes`. El modelo define `booking_date` (DATE) + `start_time`/`end_time` + `body_zone` + `size_reference` + `style_id` + `is_color` + `is_coverup` + `reference_images`. No hay campo `description` en el modelo |
| `Booking` (response) | Faltan `start_time`, `end_time`, `estimated_price_min/max`, `expires_at`, campos del chatbot |
| `Certification` | Spec: `issuingAuthority`, sin `type`/`valid_until`. Modelo: `type`, `issuer`, `valid_until`, `is_active` |
| `Award` | Spec: `name`/`event`/`position`. Modelo: `title`/`event_name`/`category`/`badge_icon_url` |
| `ArtistCard` | Spec: `city`, `minPrice`/`maxPrice`. Modelo: `commune`, `min_session_price` + `hourly_rate` (no existe precio máximo por artista) |
| `AvailabilitySlot` | Representa disponibilidad recurrente (dayOfWeek), no slots concretos que exige US0008 |

### A5. 🟡 Nombres de endpoints inconsistentes entre documentos

| Concepto | api-spec.yml | Notas técnicas US | development_guide.md |
|---|---|---|---|
| Historial de reservas | `GET /bookings` | `GET /api/bookings/me` (US0010) | — |
| Iniciar pago | `POST /payments/init` | `POST /api/payments/create` (US0009) | — |
| Webhook Flow | `POST /payments/callback` | `POST /api/payments/confirm` (US0009) | `ConfirmUrl: .../api/payments/confirm` |

### A6. 🟡 `POST /bookings/{id}/cancel` sin US que lo respalde

La spec lo atribuye a US0010, pero ningún criterio de aceptación de US0010 cubre cancelación. Decidir: ¿la cancelación es alcance MVP (agregar CA) o se elimina de la spec?

---

## B. Inconsistencias en documentación

| # | Archivo | Problema |
|---|---|---|
| B1 🔴 | `readme.md` | El índice promete secciones 2–7 (arquitectura, modelo de datos, API, HU, tickets, PRs) que **no existen** en el archivo. La plantilla de la entrega final las requiere. El contenido ya existe en `docs/` pero no está enlazado |
| B2 🟡 | `prompts.md` | Sección 4 dice que api-spec.yml está "vaciada… pendiente de generar" (obsoleto — se regeneró en sesión 4). Sección 5 menciona "14 US (10 Must-Have)" vs backlog real de 13 US / 9 Must-Have |
| B3 🟡 | `docs/development_guide.md` | Bloque "Estructura del Proyecto" + "Troubleshooting" duplicado al final del archivo. Referencia `docker-compose.yml` y `appsettings.Development.example.json` que aún no existen (documenta el estado objetivo, no el actual) |
| B4 🟢 | `prompts/00-all-prompts.md` | Dice "23 task files" pero existen 25 (`docs/us/*/task*.md`) |
| B5 🟡 | `docs/documentacion.md` | CU-02 (artista configura perfil) y CU-03 (foto de curación 90 días) se describen como parte del flujo, pero decisiones posteriores (issue-002/003) los movieron a seed / Won't-Have. Falta nota de vigencia que remita a `all-us.md` como backlog vigente |
| B6 🟢 | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `codex.md` | Contienen solo la ruta `docs/base-standards.md` como texto plano, sin instrucción. Algunos agentes no interpretan una ruta suelta como "leer y aplicar ese archivo" |
| B7 🟡 | `docs/base-standards.md` | §5 exige "Opus high reasoning" y editar `.claude/settings.json` con un modelo específico — regla acoplada a un proveedor que contradice el objetivo multi-agente y queda obsoleta con cada generación de modelos. §7 impone OpenSpec como fuente de verdad, lo que contradice la directriz vigente del MASTER_BOOTSTRAP ("no utilizar OpenSpec como fuente de verdad") |
| B8 🟢 | Symlinks `.claude/skills/*`, `.cursor/skills/*` | En checkouts Windows sin `core.symlinks=true` se materializan como archivos de texto con la ruta destino — las skills enlazadas no se cargan. Documentar el requisito (git clone con symlinks / Developer Mode) |

---

## C. Infraestructura

| # | Problema |
|---|---|
| C1 🔴 | No existe `docker-compose.yml` ni Dockerfiles, pese a que `development_guide.md` los documenta y el bootstrap exige Docker desde el inicio |
| C2 🔴 | No existe ningún workflow de CI/CD (`.github/workflows/` no existe) |
| C3 🟢 | `backend/` y `frontend/` vacíos — esperado, la Entrega 2 no ha comenzado |

---

## D. Riesgos

### Técnicos
1. **Integración Flow (US0009, 13 SP)** — dependencia externa con sandbox; mitigación: mock del gateway primero (patrón mock-first ya definido).
2. **Stack muy reciente** (.NET 10, Angular 20) — posible fricción de tooling/librerías (TestContainers, Leaflet wrappers). Verificar compatibilidad en Fase 0.
3. **PostGIS + geolocalización** — consultas espaciales y seed con coordenadas reales; requiere imagen Docker postgis y EF Core con NetTopologySuite.
4. **Sin CI** — regresiones invisibles hasta configurar pipeline (Fase 0).
5. **Object Storage (MinIO)** — el seed necesita imágenes reales o placeholders; definir origen de las imágenes seed.

### Funcionales
6. **Hold de slot con TTL 5 min (US0008)** — concurrencia y expiración: la spec ni el modelo definen cómo se materializa el hold (¿booking `pending_payment` con `expires_at`? el modelo lo sugiere, la spec no lo refleja).
7. **Chatbot (US0011, 13 SP)** — wizard determinístico, pero su fórmula de precios usa `estimated_hours` que ningún dato del modelo provee explícitamente.
8. **Depósito sobre precio estimado** — US0008 calcula depósito con `precio_min × deposit_percentage`, pero si el cliente llega sin cotización previa no hay `estimated_price_min` del booking definido (¿se usa `min_session_price` del artista? aclarar).

---

## E. Dudas pendientes (requieren decisión del usuario)

1. **¿Autorizas regenerar `docs/api-spec.yml`** para alinearla con el backlog de 13 US y `data-model.md` (secciones A1–A6)? Propuesta: mantener endpoints existentes, corregir referencias US, alinear schemas al modelo, agregar `/showcase`, `/artists/{id}/availability`, `/bookings/hold` y `/quotes/calculate`, y corregir el 409 de `/payments/init`.
2. **Cancelación de reservas**: ¿alcance MVP (agregar CA a US0010) o eliminar `POST /bookings/{id}/cancel` de la spec?
3. **Nombres de endpoints de pago**: ¿adoptar los de la spec (`/payments/init|callback|return`) y actualizar las notas de US0009 + development_guide, o al revés?
4. **`readme.md` secciones 2–7**: ¿las completo enlazando la documentación existente en `docs/` (requisito de la entrega final)?
5. **`docs/base-standards.md` §5 y §7**: ¿ajusto las reglas contradictorias (modelo fijo Opus / OpenSpec obligatorio)?
6. **Inicio de implementación**: ¿confirmas el plan de `DEVELOPMENT_PLAN.md` (Fase 0 de infraestructura → US0001)?

---

## F. Acciones ya ejecutadas en este análisis (sin decisiones de requisitos)

- Creados documentos permanentes: `PROJECT_STATUS.md`, `DEVELOPMENT_PLAN.md`, `PROMPT_REGISTRY.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`.
- Creada skill `prompt-registry` en `ai-specs/skills/prompt-registry/` con enlaces en `.claude/skills` y `.cursor/skills`.
- Eliminado bloque duplicado en `docs/development_guide.md` (B3, solo la duplicación) y añadida nota de "estado objetivo".
- Registrada la sesión en `prompts/00-all-prompts.md` y `prompts.md`.
