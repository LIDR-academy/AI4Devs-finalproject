# Work Ticket: ARF-009 — Hook useWatchlist + integración de Watchlist

| Campo | Valor |
|-------|-------|
| **Tipo** | Frontend |
| **Estimación** | 2h |
| **Dependencias** | ARF-004, ARF-008 |

**Descripción**: Implementar la lógica cliente para guardar/eliminar obras de la Watchlist, incluyendo feedback visual inmediato.

**Criterios de Aceptación**:
- [x] Gestión local del estado de la watchlist (array de IDs).
- [x] Persistencia real mediante llamadas a la API (POST/DELETE).
- [x] Actualización optimista: Cambia el estado en UI instantáneamente.
- [x] Desencadena el `LoginModal` si el usuario no tiene token al intentar guardar.

**Tareas Técnicas**:
1. [x] Crear `hooks/useWatchlist.ts`.
2. [x] Implementar servicio de API base en `services/api.ts`.
3. [x] Integrar con `AuthContext`.
4. [x] Probar flujo Guardar -> Login -> Recarga -> Verificado.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
