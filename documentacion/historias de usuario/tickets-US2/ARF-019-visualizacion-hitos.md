# Work Ticket: ARF-019 — Visualización de Hitos en ObraCard y página de detalle

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-008, ARF-015 |

**Descripción**: Mostrar los Hitos (sellos de calidad) de forma prominente en las tarjetas de resultado y en la página de detalle de obra.

**Criterios de Aceptación**:
- [ ] En `ObraCard`, si la obra tiene Hitos, se muestra el primero como badge: "🏆 Ganador Cannes".
- [ ] Tooltip con "+N más" al hacer hover.
- [ ] Página de detalle con lista completa de Hitos y año.
- [ ] Badge dorado/premium.

**Tareas Técnicas**:
1. Crear `components/HitoBadge/HitoBadge.tsx`.
2. Actualizar `ObraCard` para renderizado condicional.
3. Crear `app/obra/[id]/page.tsx` (App Router).
4. Renderizar lista completa de Hitos.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
