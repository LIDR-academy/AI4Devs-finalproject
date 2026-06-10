# EventFlow — Product Backlog Prioritization Input

> **Versión:** 1.0  
> **Fecha:** 2026-06-09  
> **Artifact origen:** `management/artifacts/User-Stories-Coverage-Matrix.md`  
> **Propósito:** cerrar decisiones de Product Owner / Business Analysis necesarias para generar el **Product Backlog Priorizado** de EventFlow.

---

## 1. Resumen ejecutivo

La matriz de cobertura confirma que el Epic Map MVP está cubierto por **150 User Stories de 150 capacidades candidatas**, equivalente a **100% de cobertura**. Por lo tanto, no es necesario generar más User Stories antes de priorizar.

Sin embargo, sí es necesario generar este documento intermedio como **Decision Record de priorización**, porque la matriz identifica decisiones pendientes que afectan:

- Qué historias entran al MVP inicial.
- Qué historias se difieren a Future / v1.1.
- Qué parámetros operacionales se fijan antes de desarrollo.
- Qué reglas funcionales deben quedar explícitas para evitar ambigüedad en backlog, tasks y acceptance criteria.

Este documento debe usarse como entrada directa para:

- `management/artifacts/Product-Backlog-Prioritized.md`
- `management/artifacts/Sprint-Plan-Roadmap.md`
- `management/development-tasks/`
- Refinamiento de Acceptance Criteria por User Story.

---

## 2. Decisiones PO sobre scope pendiente

| User Story | Tema | Decisión PO/BA | Impacto en backlog |
|---|---|---|---|
| US-008 | Login con Google | **Diferir a Future / v1.1.** No bloquea el MVP académico ni el flujo E2E. Mantener email/password + captcha como flujo canónico. | Excluir del MVP inicial. Marcar como `Future` o `Could Have - Not Planned`. |
| US-023 | Vendor genera bio/paquetes con IA | **Diferir a Future / v1.1.** Es útil, pero no forma parte de la cuña principal del MVP, que es planificación asistida para organizadores. | Excluir del MVP inicial. Mantener como enhancement post-MVP. |
| US-022 | Resumen IA del comparador | **Mantener en MVP como P2 / Should Have.** Aporta diferenciación IA al flujo de cotizaciones, pero no bloquea el flujo base. | Incluir después de Quote + Comparator + AI foundation. |
| US-024 | Top 3 tareas urgentes IA | **Mantener en MVP como P2 / Should Have.** Mejora dashboard y demo, pero depende de tareas + AIRecommendation. | Incluir después de Tasks + Event Dashboard. |
| US-026 | Regenerar sugerencia con feedback | **Mantener en MVP como P2 / Should Have.** Refuerza HITL y calidad de IA; no debe bloquear P1. | Incluir después de HITL base. |

---

## 3. Parámetros operacionales aprobados

| User Story | Parámetro | Decisión aprobada | Notas para AC / Tasks |
|---|---|---|---|
| US-026 | Máximo de regeneraciones IA por sugerencia | **5 regeneraciones** | Debe ser configurable por env var o config app. Mostrar error controlado al exceder. |
| US-031 | Máximo de IDs por bulk confirm | **50 IDs por operación** | Evita payloads grandes y errores parciales complejos. |
| US-053 | Máximo absoluto de validez de Quote | **90 días calendario** | Si el proveedor envía más de 90 días, el backend rechaza con validación. |
| US-055 | Días sin respuesta para expirar QuoteRequest | **30 días calendario** | Job diario debe marcar como expired si no hubo respuesta. |
| US-015 | Horario AutoCompleteEventsJob | **00:30 UTC diario** | Completa eventos 2 días después de `event_date`. |
| US-034 | Horario EmitT7NotificationsJob | **08:00 hora local del evento** | Para MVP puede resolverse con timezone del evento o fallback a America/Guatemala. |
| US-055 | Horario QuoteExpirationJob / QuoteRequestExpirationJob | **Diario a las 01:00 UTC** | Debe ser idempotente. |
| US-003 | Vida de cookie de sesión | **30 días** | Cookie HTTP-only, Secure en ambientes no-locales, SameSite=Lax. |
| US-004 | Vida de token de reset password | **30 minutos** | Token de un solo uso, almacenado hasheado. |

---

## 4. Decisiones funcionales aprobadas

| User Story | Decisión PO/BA | Criterio esperado |
|---|---|---|
| US-010 | Si cambia `event_date`, el sistema debe **respetar overrides manuales**. Solo recalcula tareas IA no editadas manualmente. | El usuario debe ver aviso de impacto antes de confirmar cambio de fecha. |
| US-011 | Al cancelar un evento, los `BookingIntent` y `QuoteRequest` activos asociados deben pasar a `cancelled` cuando aplique, con notificación in-app/email simulado. | No hay penalización en plataforma. Se conserva auditoría. |
| US-056 | No permitir cancelar una `QuoteRequest` si ya existe `BookingIntent.confirmed_intent` asociado. Sí permitir cancelar si sólo existen quotes sin booking confirmado. | Backend debe validar estado antes de cancelar. |
| US-065 | La ventana para crear reseña será de **30 días calendario** después de que el evento quede `completed`. | Requiere `BookingIntent.confirmed_intent` y rating 1–5. |
| US-006 | Cuando el usuario cambia contraseña, se deben invalidar otras sesiones activas. | La sesión actual puede mantenerse o reautenticarse según implementación; otras sesiones deben cerrarse. |
| US-007 | El selector de idioma debe mostrar nombres nativos: `Español LATAM`, `Español`, `Português`, `English`. | El valor interno debe mapear a `es-LATAM`, `es-ES`, `pt`, `en`. |
| US-041 | Cambios mayores del perfil vendor deben regresar el perfil a revisión admin. | Campos sensibles: nombre comercial, ciudad/ubicación, categorías, servicios principales y visibilidad pública. |
| US-077 | La moderación de reseñas por admin no enviará notificaciones en MVP. | Debe quedar auditado en `AdminAction`. |

---

## 5. Decisiones técnicas / académicas aprobadas

| User Story | Decisión | Impacto |
|---|---|---|
| US-098 | Generar OpenAPI desde Zod usando `zod-to-openapi` o herramienta equivalente. | Evita contrato manual divergente. Mantener snapshot en CI. |
| US-115 | Métricas IA en formato JSON estructurado para MVP. | Prometheus / OpenTelemetry quedan como Future. |
| US-144 | Documentar toggle Mock/OpenAI en runbook de demo. | Debe existir procedimiento claro por variable de entorno. |
| US-145 | Seed debe incluir al menos 1 `confirmed_intent` visible y 1 reseña verificada para vendor demo principal. | Requisito de demo readiness. |
| US-148 | Crear matriz canónica de trazabilidad US → FRD / UC / BR / NFR / ADR. | Artifact recomendado: `management/artifacts/User-Stories-Traceability-Matrix.md`. |
| US-149 | Crear catálogo sanitizado de prompts y outputs ejemplares. | Artifact recomendado: `management/artifacts/AI-Prompt-Evidence-Catalog.md`. |

---

## 6. Modelo de priorización recomendado

La priorización debe combinar:

1. **Dependencias técnicas.** Nada de producto avanza sin foundation mínima.
2. **Camino crítico demo E2E.** Auth → Event → AI Plan → Tasks → Budget → Vendors → QuoteRequest → Quote → Compare → Booking → Review.
3. **Riesgo temprano.** IA, seguridad, DB, API y seed deben validarse pronto.
4. **MoSCoW + P-level.** Mantener prioridad de producto, pero ordenar ejecución por P0/P1/P2/P3.
5. **Valor académico.** Evidencia IA, trazabilidad, testing y demo readiness son parte del éxito del proyecto.

---

## 7. Buckets de backlog aprobados

### P0 — Foundation técnica y riesgo base

Debe implementarse primero porque desbloquea todo lo demás.

- Backend foundation: US-090 a US-094.
- API foundation: US-095 a US-099.
- Database foundation: US-100 a US-103.
- Frontend foundation: US-104 a US-107.
- Security foundation: US-108 a US-112.
- AI foundation: US-117 a US-124.
- DevOps minimum foundation: US-133, US-134, US-139.
- Seed base: US-085 a US-088.

### P1 — Producto Must Have / camino crítico E2E

Debe entregar el flujo demostrable principal del MVP.

- Auth básico: US-001 a US-007, excluyendo US-008.
- Events: US-009 a US-016.
- AI planning must: US-017 a US-021, US-025.
- Tasks must: US-027 a US-033.
- Budget: US-035 a US-039.
- Vendors must: US-040 a US-048.
- Quote flow: US-049 a US-056.
- Comparator + Booking: US-057, US-058, US-060 a US-064.
- Reviews: US-065 a US-067.
- Admin core: US-074 a US-080.
- I18N/currency: US-081 a US-084.

### P2 — Should Have / soporte de experiencia, calidad y diferenciación

Debe planificarse después del flujo E2E estable.

- US-022 — Resumen IA comparador.
- US-024 — Top 3 tareas urgentes IA.
- US-026 — Regenerar IA con feedback.
- US-034 / US-071 — Notificación T-7.
- US-068 a US-073 — Notificaciones in-app, priorizando US-073 por dependencia con rechazo/expiración.
- US-113 a US-116 — Observabilidad mínima.
- US-125 a US-132 — QA automation y quality gates.
- US-147 a US-149 — Evidencia académica y trazabilidad.

### P3 — Demo readiness y entrega final

Debe cerrarse antes de la presentación final.

- US-140 — Seed reset endpoint Demo.
- US-141 — Monitoring mínimo.
- US-142 — Guion demo 10–15 min.
- US-143 — Checklist pre-demo.
- US-144 — Toggle Mock/OpenAI.
- US-145 — Seed visible con confirmed intent + review.
- US-146 — Smoke test sobre Demo URL.
- US-150 — Reporte académico final.

### Future / fuera del MVP inicial

- US-008 — OAuth Google.
- US-023 — Vendor bio/paquetes con IA.

---

## 8. Criterios de readiness para generar el Product Backlog Priorizado

El backlog prioritario puede generarse cuando se cumplan estas condiciones:

- La matriz de cobertura mantiene 100% de cobertura de Epic Map.
- Las decisiones de scope de este documento están aceptadas por el PO.
- Cada User Story tiene prioridad MoSCoW y bucket P0/P1/P2/P3/Future.
- Las dependencias técnicas P0 están antes que features consumidoras.
- Las historias Future no aparecen como comprometidas en MVP inicial.
- Las historias IA mantienen human-in-the-loop y trazabilidad `AIRecommendation`.
- Las historias de seguridad mantienen backend como fuente de verdad.
- El backlog permite armar un roadmap por sprints sin romper dependencias.

---

## 9. Siguiente artifact recomendado

El siguiente documento a generar es:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

Contenido mínimo recomendado:

1. Propósito.
2. Fuentes utilizadas.
3. Modelo de priorización.
4. Product Backlog por prioridad P0/P1/P2/P3/Future.
5. Tabla por User Story con:
   - ID
   - Epic
   - Título
   - MoSCoW
   - P-level
   - Dependencias
   - Riesgo
   - Valor demo
   - Valor académico
   - Estado
   - Notas PO/BA
6. Roadmap preliminar por sprint.
7. Riesgos de ejecución.
8. Definition of Ready para pasar a Development Tasks.

---

## 10. Estado final

**Estado:** Aprobado como input de priorización.  
**Resultado:** Listo para generar Product Backlog Priorizado.  
**Acción siguiente:** Generar prompt AAA para construir `management/artifacts/Product-Backlog-Prioritized.md` usando este documento y la matriz de cobertura como fuentes principales.
