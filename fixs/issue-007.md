# Issue-007: Depósito de reserva fijo por artista vs. cotización del chatbot (US0011)

**Fecha:** 2026-07-16
**Contexto:** Antes de iniciar US0011, el usuario detectó una inconsistencia conceptual: el depósito de reserva se cobra como "30% del valor", pero ¿de qué valor? Relacionado con el riesgo funcional #8 de `fixs/issue-004.md` ("Depósito sobre precio estimado"), que quedó abierto.
**Estado:** ✅ Resuelto (2026-07-16) — decisión del usuario: **depósito según cotización**.

---

## Inconsistencia detectada

Hasta US0014, el depósito se calculaba así (`AvailabilityService.HoldSlotAsync`):

- `estimated_price_min` = `min_session_price` del artista (fijo por artista)
- `estimated_price_max` = max(mínimo, `hourly_rate` × duración del slot)
- **`deposit_amount` = `min_session_price` × `deposit_percentage` / 100** — siempre el mismo monto por artista, independiente del tatuaje

Los datos del tatuaje (`body_zone`, `size_reference`, `style_id`, `is_color`, `is_coverup`) se guardaban en el booking pero **no influían en ningún monto**. Con eso, la cotización del chatbot (US0011) habría sido puramente informativa, contradiciendo:

- `docs/api-spec.yml` → `QuoteResponse.depositAmount`: "priceMin × artist.deposit_percentage / 100"
- `docs/api-spec.yml` → descripción de `POST /bookings/hold`: "estimated_price_min/max and deposit_amount are computed from the artist tariffs **(or from the quote data when provided, US0011 CA8)**"
- El modelo de datos, que da al booking sus propias columnas `estimated_price_min/max`

## Decisión (usuario, 2026-07-16)

**Opción 1 — Depósito según cotización:**

1. Cuando la reserva se origina en una cotización (el hold llega con datos de cotización válidos: `size_reference` reconocido + estilo), el backend **recalcula la cotización server-side** (nunca se confía en montos enviados por el cliente) y el booking hereda `estimated_price_min/max` del rango cotizado.
2. `deposit_amount` = `deposit_percentage` × **max(mínimo cotizado, `min_session_price`)** / 100 — el mínimo de sesión del artista actúa como piso.
3. Sin datos de cotización, se mantiene el comportamiento actual (fallback: 30% × `min_session_price`).

## Aplicación

- US0011 gana un criterio de aceptación (CA9) que formaliza la regla en `docs/us/us0011/us0011.md` y `docs/us/all-us.md`.
- `QuoteCalculatorService` es la única fuente de la fórmula: la usan tanto `POST /api/quotes/calculate` como el hold de US0008.
- `QuoteResponse` incorpora `factors: string[]` (los factores aplicados), campo que `task0001.md` ya especificaba; se añade a `api-spec.yml` como cambio aditivo.
