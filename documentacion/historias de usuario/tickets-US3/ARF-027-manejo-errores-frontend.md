# Work Ticket: ARF-027 — Estado de indisponibilidad y manejo de errores en el Frontend

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-024, ARF-026 |

**Descripción**: Implementar la capa de UI que comunica al usuario de forma amigable cuando un contenido no está disponible por fallo de plataforma.

**Criterios de Aceptación**:
- [ ] Si `disponible = false` en `ObraCard`, se muestra badge "No disponible" sobre la imagen.
- [ ] Botón de acceso se deshabilita si `disponible = false`.
- [ ] Toast si `play-url` retorna 503.
- [ ] No rompe la página ni propaga errores.

**Tareas Técnicas**:
1. Prop `disponible: boolean` a `ObraCard`.
2. Try/catch con toast de error en `BotonAcceso`.
3. Crear `components/IndisponibleBadge/IndisponibleBadge.tsx`.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
