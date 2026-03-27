# Work Ticket: ARF-004 — Endpoint POST /watchlist (autenticado)

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2h |
| **Dependencias** | ARF-001, ARF-005 |

**Descripción**: Implementar en el Servicio de Usuario el endpoint para guardar una obra en la Watchlist, protegido por JWT.

**Criterios de Aceptación**:
- [x] `POST /watchlist { id_obra: 42 }` con Bearer Token válido retorna 201 Created.
- [x] `POST /watchlist` sin token retorna 401 Unauthorized.
- [x] Intentar guardar una obra ya guardada retorna 200 (idempotente).
- [x] `GET /watchlist` con Bearer Token retorna la lista de obras guardadas por el usuario.

**Tareas Técnicas**:
1. [x] Crear `UserModule` con `WatchlistService` y controlador en `backend/src/modules/user/`.
2. [x] Aplicar Guard JWT (`@UseGuards(JwtAuthGuard)`).
3. [x] Implementar lógica de upsert en `LISTA_DESEOS`.
4. [x] Crear respuesta tipada con los datos de la obra guardada.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
