# Work Ticket: ARF-022 — Endpoint GET /obras con búsqueda por Hito

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-014, ARF-021 |

**Descripción**: Extender el endpoint de búsqueda para permitir que el usuario filtre obras por el nombre de un Hito o festival.

**Criterios de Aceptación**:
- [ ] `GET /obras?hito=Oscar` retorna todas las obras que tienen un HITO cuyo `nombre_hito` contiene "Oscar".
- [ ] Combinable con `eje_vertical`.
- [ ] Búsqueda insensible a mayúsculas/minúsculas.
- [ ] Rendimiento < 500ms.

**Tareas Técnicas**:
1. Query param `hito?: string`.
2. Extender query en `CuratedService` con LEFT JOIN a HITO y `ILIKE %hito%`.
3. Agregar test de integración.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
