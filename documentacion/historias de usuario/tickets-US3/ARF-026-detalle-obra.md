# Work Ticket: ARF-026 — Página de detalle de obra (ficha técnica de película)

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-015, ARF-019, ARF-023 |

**Descripción**: Crear la página de detalle completa para una obra cinematográfica, con todos los datos de la ficha técnica, todos sus Hitos y el botón de acceso.

**Criterios de Aceptación**:
- [ ] Página accesible en `/obra/[id]`.
- [ ] SSR para SEO con datos de la obra.
- [ ] Muestra: título, director, región, duración, `valor_cultural` (280) y todos los Hitos.
- [ ] Botón dinámico: Reproducir (Smart Embedding) o Ver en [Plataforma] (Deep Linking).
- [ ] Soporte para `disponible = false` con botón deshabilitado.

**Tareas Técnicas**:
1. Crear `app/obra/[id]/page.tsx` (Next.js App Router).
2. Crear `components/FichaTecnica/FichaTecnica.tsx`.
3. Crear `components/BotonAcceso/BotonAcceso.tsx`.
4. Meta tags dinámicos.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
