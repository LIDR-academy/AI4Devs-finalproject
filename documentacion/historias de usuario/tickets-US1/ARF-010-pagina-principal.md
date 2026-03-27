# Work Ticket: ARF-010 — Página principal con resultados y botón "Sorpréndeme"

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-006, ARF-007, ARF-008 |

**Descripción**: Ensamblar la página principal de descubrimiento integrando el Dial de Tiempo, el MoodSelector y la galería de ObraCards.

**Criterios de Aceptación**:
- [x] Muestra el Dial de Tiempo y MoodSelector en la parte superior.
- [x] Los resultados se actualizan automáticamente al cambiar filtros.
- [x] El botón "Sorpréndeme" muestra una obra aleatoria del conjunto filtrado.
- [x] Estado de carga (skeleton cards) y estado vacío implementados.

**Tareas Técnicas**:
1. Crear/actualizar `app/page.tsx` ensamblando los componentes.
2. Implementar lógica de random en el cliente.
3. Crear `components/SkeletonCard/SkeletonCard.tsx`.
4. Crear `components/EmptyState/EmptyState.tsx`.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
