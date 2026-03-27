# Work Ticket: ARF-018 — Componente DeepLinkButton con parámetros de afiliación

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-015 |

**Descripción**: Crear el componente de botón de Deep Linking para obras cuya plataforma no permite iframe. El botón abre la plataforma externa y el backend inyecta los parámetros de afiliación.

**Criterios de Aceptación**:
- [ ] Para obras con `permite_iframe = false`, botón "Ver en [nombre_plataforma]".
- [ ] Abre nueva pestaña con `rel="noopener noreferrer"`.
- [ ] La URL incluye parámetro de afiliación recibido del backend.
- [ ] Muestra icono de la plataforma (MUBI, Netflix, Apple TV, etc.).

**Tareas Técnicas**:
1. Crear `components/DeepLinkButton/DeepLinkButton.tsx`.
2. Mapa de logos en `utils/platformLogos.ts`.
3. Actualizar `ObraCard` para decidir entre modal o botón según `permite_iframe`.
4. Endpoint `GET /obras/:id/play-url` que retorna la URL de afiliado.

---
**User Story de referencia (US-2)**: Como Melómano, quiero explorar fragmentos musicales curados.
