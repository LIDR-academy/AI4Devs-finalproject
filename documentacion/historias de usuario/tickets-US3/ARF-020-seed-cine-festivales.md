# Work Ticket: ARF-020 — Seed: catálogo de cine de festivales

| Campo | Valor |
|-------|-------|
| **Tipo** | Base de Datos |
| **Estimación** | 1.5h |
| **Dependencias** | ARF-012 |

**Descripción**: Poblar la base de datos con un catálogo representativo del eje "The Cinema" que incluya películas con Hitos de festivales internacionales reconocidos.

**Criterios de Aceptación**:
- [ ] Mínimo 10 obras del eje `EJE_VERTICAL = 'Cinema'`.
- [ ] Festivales: Óscar, Cannes, Berlinale, Sundance, BAFTA.
- [ ] Obras con los tres tipos de acceso: Abierto (🟢), Suscripción (🟡), VOD (🔵).
- [ ] Plataformas: MUBI, YouTube, Vimeo, etc.
- [ ] Cada película tiene `valor_cultural` (máx. 280 caracteres) y al menos 1 Hito con `anio_hito`.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
