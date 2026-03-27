# Work Ticket: ARF-021 — Índice en tabla HITO para búsqueda por nombre

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 0.5h |
| **Dependencias** | ARF-012 |

**Descripción**: Agregar índice de búsqueda textual en el campo `nombre_hito` para que las búsquedas por festival sean performantes.

**Criterios de Aceptación**:
- [ ] Índice `GIN` o `BTREE` creado en `HITO.nombre_hito` (PostgreSQL).
- [ ] La búsqueda por texto parcial funciona: "Oscar" encuentra "Nominado Oscar 2024".
- [ ] La migración es reversible.

**Tareas Técnicas**:
1. Crear migración con PostgreSQL (`USING GIN (to_tsvector('spanish', nombre_hito))`).
2. Validar plan de ejecución con `EXPLAIN ANALYZE`.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
