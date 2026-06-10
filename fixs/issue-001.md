# Issue 001 — Inconsistencias de Coherencia en Documentación

## Estado: � Resuelto

## Resumen

Análisis de coherencia entre `readme.md`, `docs/documentacion.md` y `docs/data-model.md` revela 7 inconsistencias que deben resolverse antes de iniciar implementación.

---

## Hallazgos

### 1. ❌ Versiones del stack contradictorias (Alta)

**Dónde:**
- `docs/backend-standards.md` → .NET Core 10 / C#
- `docs/documentacion.md` (Apéndice) → .NET 8, Angular 17+
- `readme.md` → Solo "Angular · .NET · PostgreSQL" (sin versión)

**Fix:** Unificar a .NET Core 10 / Angular 20 / PostgreSQL 16 en `docs/documentacion.md` (Apéndice: Stack Tecnológico).

### 2. ❌ API spec es placeholder de otro proyecto (Alta)

**Dónde:** `docs/api-spec.yml`

**Problema:** Describe un sistema de recruitment (Candidate, Position, Interview) — no INK·LINK. Está completamente comentado.

**Fix:** Eliminar contenido actual. Dejar como TODO vacío (solo con las llaves del yml, pero el contenido de ellas eliminalo.)

### 3. ⚠️ Videos cortos (30s) sin soporte en data model (Media)

**Dónde:**
- `readme.md` → "portafolio de fotos HD (hasta 100), **videos cortos (30s)**"
- `docs/data-model.md` → `PortfolioItem` solo tiene `image_url` + `thumbnail_url`

**Fix:** mover videos a Won't-Have MVP en readme.
 

### 4. ❌ Falta `cancelled_at` en Booking (Alta)

**Dónde:** `docs/data-model.md` → Booking

**Problema:** CU-07 requiere verificar si cancelación es "dentro del plazo" (24h/48h/72h antes de booking_date). Sin `cancelled_at` es imposible determinar cuándo se solicitó la cancelación.

**Fix:** Agregar `cancelled_at TIMESTAMP` (nullable) a la entidad Booking.

### 5. ⚠️ Anti no-show: contradicción Must/Should vs "no MVP" (Media)

**Dónde:**
- `readme.md` → "📌 Funcionalidad **no considerada para el MVP**"
- `docs/documentacion.md` → CU-07 la documenta como Should-Have con flujo completo

**Fix:** Alinear: documentarla como Wont-Have en ambos documentos. CU-07 queda documentado para referencia pero no se implementa en la primera entrega.

### 6. 💡 Pares antes/después sin modelar (Baja)

**Dónde:** `readme.md` → "pares antes/después" en portafolio

**Problema:** `PortfolioItem` no tiene mecanismo de agrupación para vincular un "antes" con un "después".

**Fix:** Agregar `pair_group_id UUID` nullable a PortfolioItem, o mover a Won't-Have MVP.

### 7. ⚠️ Falta entidad Notification (Media)

**Dónde:** Arquitectura menciona Hangfire y notificaciones a 90 días, pero no hay tabla de tracking.

**Problema:** Sin entidad `Notification` no se puede: rastrear qué se envió, reintentar fallos, evitar duplicados.

**Fix:** Eliminar esta funcionalidad del proyecto:

---

## Plan de Ejecución

| Paso | Acción | Archivo(s) | Hallazgo |
|---|---|---|---|
| 1 | Cambiar stack a .NET Core 10, Angular 20, PostgreSQL 16 en Apéndice | `docs/documentacion.md` | #1 |
| 2 | Vaciar api-spec.yml — dejar solo keys OpenAPI sin contenido | `docs/api-spec.yml` | #2 |
| 3 | Marcar "videos cortos (30s)" como Won't-Have MVP | `readme.md` | #3 |
| 4 | Agregar `cancelled_at TIMESTAMP` nullable a Booking | `docs/data-model.md`, `docs/documentacion.md` | #4 |
| 5 | Cambiar anti no-show a Won't-Have en readme y documentacion.md (CU-07 se mantiene como referencia futura) | `readme.md`, `docs/documentacion.md` | #5 |
| 6 | Marcar "pares antes/después" como Won't-Have MVP | `readme.md` | #6 |
| 7 | Eliminar referencias a notificaciones programadas (Hangfire, 90 días, recordatorios) de arquitectura y CU-03 | `docs/documentacion.md`, `docs/data-model.md` | #7 |

## Criterios de Done

- [ ] `docs/documentacion.md` Apéndice muestra .NET Core 10 / Angular 20 / PostgreSQL 16
- [ ] `docs/api-spec.yml` no contiene referencias a recruitment/candidates
- [ ] `readme.md` marca videos y pares antes/después como Won't-Have
- [ ] `Booking` tiene campo `cancelled_at` en data-model.md y documentacion.md
- [ ] Anti no-show marcado como Won't-Have en readme y documentacion.md
- [ ] No existen referencias a Hangfire, notificaciones a 90 días ni entidad Notification en la documentación
- [ ] CU-03 ajustado: cliente califica voluntariamente (sin notificación automática del sistema)
