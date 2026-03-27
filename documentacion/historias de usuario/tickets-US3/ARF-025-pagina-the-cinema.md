# Work Ticket: ARF-025 — Página The Cinema con buscador por Hito/festival

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-022, ARF-008 |

**Descripción**: Crear la página del eje "The Cinema" con su buscador especializado por nombre de hito o festival.

**Criterios de Aceptación**:
- [ ] Página accesible en `/cinema`.
- [ ] Campo de búsqueda con debounce (400ms).
- [ ] Resultados con `ObraCard` mostrando acceso (🟢🟡🔵).
- [ ] Término se refleja en URL: `/cinema?hito=Oscar`.
- [ ] Chips sugeridos clicables ("Oscar", "Cannes", etc.).

**Tareas Técnicas**:
1. Crear `app/cinema/page.tsx` (Next.js App Router).
2. Crear `components/HitoBuscador/HitoBuscador.tsx`.
3. Crear `components/SugerenciasHito/SugerenciasHito.tsx`.
4. Extender `hooks/useObrasFiltradas.ts` con `hito`.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
