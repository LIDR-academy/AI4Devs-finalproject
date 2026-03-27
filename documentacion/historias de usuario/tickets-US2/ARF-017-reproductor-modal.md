# Work Ticket: ARF-017 — Componente ReproductorModal con Smart Embedding

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 3h |
| **Dependencias** | ARF-015 |

**Descripción**: Crear el reproductor modal que muestra el video embebido cuando `permite_iframe = true`. Es la funcionalidad de Smart Embedding central de la plataforma.

**Criterios de Aceptación**:
- [ ] Al hacer clic en "Reproducir" con `permite_iframe = true`, se abre modal con iframe.
- [ ] Modal con cierre por X, clic fuera o ESC.
- [ ] Iframe con URL de origen formateada para YouTube (`/embed/{id}`) o Vimeo (`/video/{id}`).
- [ ] Fallback con botón de Deep Linking si no carga.
- [ ] Responsivo 90% desktop / 100% mobile.

**Tareas Técnicas**:
1. Crear `components/ReproductorModal/ReproductorModal.tsx`.
2. Lógica de construcción de embed URL.
3. Crear `hooks/useObra.ts`.
4. Trap de foco.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
