# Work Ticket: ARF-015 — Endpoint GET /obras/:id con detalle completo e Hitos

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-014 |

**Descripción**: Implementar el endpoint de detalle de obra que devuelve todos los metadatos necesarios para la reproducción, incluyendo si es embebible y todos sus Hitos.

**Criterios de Aceptación**:
- [ ] `GET /obras/42` retorna campos de OBRA + array de Hitos + PLATAFORMA_ORIGEN (`permite_iframe`, `url_origen`).
- [ ] 404 si la obra no existe.
- [ ] Retorna `permite_iframe` para decisión de reproducción en frontend.

**Tareas Técnicas**:
1. Método `findOneWithDetails(id)` en `CuratedService`.
2. Crear `ObraDetailDto`.
3. Registrar endpoint en el controlador.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
