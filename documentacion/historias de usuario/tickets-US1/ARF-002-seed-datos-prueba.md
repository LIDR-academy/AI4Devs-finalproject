# Work Ticket: ARF-002 — Seed: datos de prueba para el catálogo MVP

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1h |
| **Dependencias** | ARF-001 |

**Descripción**: Poblar la base de datos con datos de prueba representativos (mínimo 20 obras) que cubran los tres ejes verticales y los tres tipos de acceso.

**Criterios de Aceptación**:
- [x] Al menos 8 obras con `duracion_min ≤ 15` y distintos `vibe_mood`.
- [x] Obras en los tres ejes: Short List, Stage, Cinema.
- [x] Obras con los tres estados de acceso: Abierto, Suscripción, VOD.
- [x] Al menos 2 plataformas origen con `permite_iframe = true` y 2 con `false`.
- [x] Enlaces de YouTube verificados y operativos.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
