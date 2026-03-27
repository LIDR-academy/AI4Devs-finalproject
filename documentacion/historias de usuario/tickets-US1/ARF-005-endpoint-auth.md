# Work Ticket: ARF-005 — Endpoint POST /auth/register y POST /auth/login

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 3h |
| **Dependencias** | ARF-001 |

**Descripción**: Implementar autenticación básica con JWT para habilitar la Watchlist personal.

**Criterios de Aceptación**:
- [x] `POST /auth/register { email, password }` crea usuario y retorna JWT (expiración 7d).
- [x] `POST /auth/login { email, password }` retorna JWT si las credenciales son correctas.
- [x] Password almacenado con bcrypt.
- [x] Email duplicado en registro retorna 409 Conflict.
- [x] Credenciales incorrectas retornan 401 con mensaje genérico.

**Tareas Técnicas**:
1. [x] Crear `AuthModule` con `AuthService`, `JwtStrategy` y controlador en `backend/src/modules/auth/`.
2. [x] Configurar `JwtModule` con secret desde variables de entorno.
3. [x] Crear tabla `USUARIO` (migrada en ARF-001).
4. [x] Implementar guards y decoradores reutilizables.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
