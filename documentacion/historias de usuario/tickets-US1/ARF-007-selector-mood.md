# Work Ticket: ARF-007 — Componente MoodSelector (selector de estado de ánimo)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | Ninguna |

**Descripción**: Crear el selector de Mood que complementa el Dial de Tiempo en el filtrado de contenido.

**Criterios de Aceptación**:
- [x] Muestra los moods disponibles como chips/tags seleccionables (Melancólico, Inspirador, etc.).
- [x] Solo se puede seleccionar 1 mood a la vez; un segundo clic deselecciona.
- [x] El mood seleccionado se refleja en la URL como query param `?mood=Melancolico`.
- [x] Integrado con `useObrasFiltradas`.

**Tareas Técnicas**:
1. [x] Crear `components/MoodSelector/MoodSelector.tsx`.
2. [x] Definir lista de moods como constante en `utils/moods.ts`.
3. [x] Sincronizar con URL params.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
