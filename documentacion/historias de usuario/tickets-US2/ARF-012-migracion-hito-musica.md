# Work Ticket: ARF-012 — Migración: tabla HITO y géneros musicales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-001 |

**Descripción**: Crear la tabla `HITO` para los sellos de calidad/premios y agregar los campos necesarios para clasificación musical en `OBRA`.

**Criterios de Aceptación**:
- [ ] Tabla `HITO` creada: `id_hito`, `id_obra` (FK), `nombre_hito`, `anio_hito`.
- [ ] Campo `tipo_contenido` agregado a `OBRA`: enum `('fragmento', 'completo')`.
- [ ] Campo `genero_musical` agregado a `OBRA`: VARCHAR nullable.
- [ ] Migración es reversible.
- [ ] Seed actualizado con al menos 6 obras de The Stage.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
