# Criterios concretos de alertas de complicaciones (Ticket 8)

Referencia para validación y auditoría del módulo de seguimiento postoperatorio.

## 1. Definición de alerta

- **Alerta de complicación**: Cualquier registro de evolución postoperatoria (`PostopEvolution`) con el campo **`hasComplications = true`**.
- No se consideran alertas las evoluciones con `hasComplications = false` o sin valor (por defecto `false`).

## 2. Origen del dato

- El valor `hasComplications` es **explícito**: lo establece el usuario (médico/enfermería) al crear o editar una evolución.
- Endpoint: `POST /api/v1/followup/evolutions` con cuerpo `{ "surgeryId", "evolutionDate", "clinicalNotes", "hasComplications", "complicationsNotes?" }`.
- Opcionalmente el cliente envía **`complicationsNotes`** con el detalle de la complicación (texto libre). Este campo se almacena y se devuelve en la consulta de alertas para mostrar en UI.

## 3. Consulta de alertas

- **Endpoint**: `GET /api/v1/followup/evolutions/surgery/:surgeryId/complications`.
- **Comportamiento**: Devuelve **solo** las evoluciones de esa cirugía con `hasComplications === true`, ordenadas por **evolutionDate** descendente (más reciente primero).
- Si la cirugía no existe: `404 NotFound`.
- Si no hay evoluciones con complicaciones: array vacío `[]`.

## 4. Qué no se considera (alcance actual)

- **No** hay alertas automáticas por umbrales (p. ej. fiebre >38°C, TA fuera de rango). Los signos vitales se guardan en `vitalSigns` pero no generan por sí solos una alerta.
- **No** hay notificaciones push/email al registrar una complicación; la alerta es consultada vía API y mostrada en la UI de seguimiento.

## 5. Uso en frontend (recomendado)

- Llamar a `GET .../complications` al cargar la vista de seguimiento de la cirugía.
- Si `response.length > 0`: mostrar banner de aviso y/o lista de evoluciones con complicaciones.
- En la lista de evoluciones, marcar visualmente (borde, etiqueta "Complicación") las que tienen `hasComplications === true` y mostrar `complicationsNotes` si existe.

## 6. Tests

- `followup.service.spec.ts` → `getComplicationsAlerts`:
  - Devuelve solo evoluciones con `hasComplications: true`.
  - Devuelve array vacío cuando no hay complicaciones.
  - Lanza `NotFoundException` si la cirugía no existe.
