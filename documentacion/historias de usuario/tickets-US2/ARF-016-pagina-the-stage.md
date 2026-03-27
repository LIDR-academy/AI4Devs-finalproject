# Work Ticket: ARF-016 — Página The Stage con filtros de género y tipo

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-014, ARF-006, ARF-008 |

**Descripción**: Crear la página dedicada al eje "The Stage" con sus filtros específicos: selector de género musical y toggle "Solo Fragmentos / Concierto Completo".

**Criterios de Aceptación**:
- [ ] Página accesible en `/stage`.
- [ ] Toggle visual "Solo Fragmentos | Concierto Completo | Todos".
- [ ] Selector de género como chips horizontales.
- [ ] Resultados con `ObraCard`.
- [ ] Filtros reflejados en URL (`/stage?tipo=fragmento&genero=Jazz`).

**Tareas Técnicas**:
1. Crear `app/stage/page.tsx` (Next.js App Router).
2. Crear `components/TipoContenidoToggle/TipoContenidoToggle.tsx`.
3. Crear `components/GeneroSelector/GeneroSelector.tsx`.
4. Extender `hooks/useObrasFiltradas.ts`.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
