# Work Ticket: ARF-023 — Endpoint GET /obras/:id/play-url con afiliación

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-015 |

**Descripción**: Implementar el endpoint que genera la URL de redirección con los parámetros de afiliación inyectados de forma segura en el backend.

**Criterios de Aceptación**:
- [ ] `GET /obras/42/play-url` retorna `{ url: "https://mubi.com/..." }`.
- [ ] Los parámetros de afiliación se leen desde variables de entorno.
- [ ] Si `permite_iframe = true`, retorna embed URL.
- [ ] Endpoint público.

**Tareas Técnicas**:
1. Método `getPlayUrl(id_obra)` en `CuratedService`.
2. Leer códigos de afiliado de plataformas externas.
3. Registrar endpoint en el controlador.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
