# Work Ticket: ARF-013 — Seed: catálogo de conciertos y fragmentos musicales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1h |
| **Dependencias** | ARF-012 |

**Descripción**: Poblar la base de datos con datos representativos del eje "The Stage" cubriendo todos los géneros y tipos de acceso.

**Criterios de Aceptación**:
- [ ] Mínimo 8 obras del eje `EJE_VERTICAL = 'Stage'`.
- [ ] Al menos 2 fragmentos (`tipo_contenido = 'fragmento'`) y 2 completos por género principal.
- [ ] Géneros: Jazz, Sinfónico, Ópera, Bolero/Salsa.
- [ ] Obras con `permite_iframe = true` y `permite_iframe = false`.
- [ ] Cada obra de The Stage tiene al menos 1 Hito registrado.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
