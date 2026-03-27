# Work Ticket: ARF-014 — Extender GET /obras con filtros tipo_contenido y genero_musical

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-003, ARF-012 |

**Descripción**: Ampliar el endpoint de búsqueda del Servicio de Curaduría para soportar los nuevos filtros específicos de la sección The Stage.

**Criterios de Aceptación**:
- [ ] `GET /obras?eje_vertical=Stage&tipo_contenido=fragmento&genero=Jazz` retorna solo fragmentos de Jazz.
- [ ] Los Hitos se incluyen en la respuesta como array: `hitos: string[]`.
- [ ] El filtro `eje_vertical` acepta: `Short List`, `Stage`, `Cinema`.
- [ ] Retro-compatible con filtros anteriores.

**Tareas Técnicas**:
1. Extender `ObraResponseDto`.
2. Actualizar la query en `CuratedService` para hacer JOIN con tabla `HITO`.
3. Agregar query params en el controlador.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
