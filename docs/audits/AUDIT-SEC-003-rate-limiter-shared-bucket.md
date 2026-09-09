# 🔐 Informe de Auditoría de Seguridad — AUDIT-SEC-003

* **ID Auditoría:** AUDIT-SEC-003
* **Fecha:** 2026-09-08
* **Auditor:** Sesión de continuación — el humano preguntó por el significado del error "Has realizado demasiados intentos" que vio en la app y si afecta a producción.
* **Alcance:** `rateLimiter.ts`, `app.ts` (montaje del limiter global y de auth), `auth.routes.ts` (limiter de login), topología de despliegue (`docker-compose.yml`, `apps/frontend/nginx.conf`).
* **Método:** Lectura de código + trazado de la resolución de `req.ip` a través de la topología real de contenedores.

---

## 📋 Resumen ejecutivo

| # | Severidad | Título | Estado |
| :-- | :-- | :-- | :-- |
| **F-1** | 🟠 **Alta** | `trust proxy` no configurado → detrás de nginx, `req.ip` es la IP del contenedor de nginx para **todos** los clientes → un único bucket de rate-limit compartido por todo el restaurante | **Confirmada, corregida en `TK-132`** |
| **F-2** | 🟡 Media | Límite global `100/15min` demasiado bajo una vez que pasa a ser por-cliente (una sola sesión activa hace 20-30 peticiones) | Corregida en `TK-132` (default → `300`) |
| **F-3** | 🟢 Baja | Límite de login hardcodeado (`10/15min`) — sin vía de ajuste para sitios con NAT compartido (varias terminales tras una IP) sin re-desplegar | Corregida en `TK-132` (`LOGIN_RATE_LIMIT_*`) |
| **O-1** | Info | El mensaje del frontend decía "aguarda unos **segundos**" cuando la ventana es de 15 min; el `detail` del backend ya trae el tiempo real pero el mapper lo descartaba | Corregida en `TK-132` |

---

## 🚨 Hallazgo detallado

### F-1 — 🟠 Alta: bucket de rate-limit compartido por todos los clientes

**Path de datos:**

1. Topología desplegada (`docker-compose.yml` + `apps/frontend/nginx.conf`): `navegador → nginx (frontend:8080) → location /api/ → proxy_pass http://backend:3000`. nginx añade `X-Forwarded-For` / `X-Real-IP`.
2. `app.ts` `createApp()` **nunca llamaba `app.set('trust proxy', …)`**. Con Express 4 y `trust proxy` en su valor por defecto (`false`), `req.ip` devuelve la IP del **peer inmediato del socket** — que detrás de nginx es la IP del **contenedor de nginx en la red bridge de Docker**, idéntica para cualqu­ier navegador.
3. `rateLimiter.ts` agrupa su contador `store[ip]`. Con `ip` colapsado a un único valor:
   - **Limiter global** (`app.ts`, `/api/v1/*`): `100` peticiones / 15 min **para toda la operación combinada**, no por usuario.
   - **Limiter de login** (`auth.routes.ts`, `/login-pin`·`/forgot-pin`·`/reset-pin`): `10` intentos / 15 min **para todo el restaurante combinado**.
4. **Consecuencia operativa:** en un cambio de turno con varias terminales, 10 intentos de login compartidos se agotan de inmediato y **todos** los operarios reciben `429`. En operación normal, 3-4 usuarios activos agotan las 100 peticiones globales en un par de minutos y el restaurante entero queda bloqueado el resto de la ventana.
5. **Consecuencia de seguridad (menor, pero real):** el limiter anti-fuerza-bruta de login (Guard 16) pierde su granularidad — un atacante desde una IP y un operario legítimo desde otra comparten cuota, así que el atacante puede negarle el servicio al operario consumiéndole los 10 intentos, y a la vez el atacante se ve "menos limitado" de lo previsto si el tráfico legítimo ya consumió parte de la cuota (menos intentos disponibles para él, pero el modelo de protección no es el diseñado).

**Por qué no se detectó antes:** `TK-046` (que introdujo el limiter global) lo verificó con smoke tests que golpean el backend **directamente** (`host:3000`), donde `req.ip` sí es la IP real del cliente — nunca a través de nginx. Los tests unitarios/integración corren con supertest desde loopback, IP constante, así que tampoco lo ejercen.

**Corrección (`TK-132`):**
- `app.ts`: `app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])` — se confía en el `X-Forwarded-For` sólo cuando el peer del socket está en un rango privado/loopback (la red bridge de Docker es `uniquelocal`, `172.16/12`). Una petición directa desde una IP **pública** no entra en la lista → su `X-Forwarded-For` se ignora y se usa el socket real → **sin spoofing de XFF** aunque el puerto `3000` siga expuesto.
- Resultado: `req.ip` pasa a ser la IP real de cada terminal → contadores independientes.

### F-2 — 🟡 Media: límite global bajo para operación por-cliente

`RATE_LIMIT_MAX_REQUESTS` default `100/15min` (≈ 6.7 req/min). Una sola sesión activa de inventario (dashboard + navegación + un par de mutaciones) supera eso fácil. **Corrección:** default → `300/15min` (≈ 20 req/min), holgado para uso normal, aún tapa un script desbocado. Sigue siendo configurable por env.

### F-3 — 🟢 Baja: límite de login sin vía de ajuste

El `createRateLimiter({ windowMs: 15*60*1000, max: 10 })` de `auth.routes.ts` estaba hardcodeado. **Corrección:** `LOGIN_RATE_LIMIT_WINDOW_MS` / `LOGIN_RATE_LIMIT_MAX` (default `900000` / `10`), resueltos en `app.ts` y pasados a `createAuthRouter`. Un sitio con 6 terminales tras un router NAT doméstico puede subir `LOGIN_RATE_LIMIT_MAX` a `40` sin re-compilar.

### O-1 — Info: mensaje de reintento engañoso

`errorMessageMapper.ts` caso `429` devolvía un literal "aguarda unos segundos". El backend ya emite `detail: "Reintente en N segundos."` con el tiempo real. **Corrección:** el mapper propaga el `detail` del servidor (mismo patrón que ya usa para `403`/`409`/`422`); `rateLimiter.ts` además añade la cabecera `Retry-After`.

---

## ⚖️ Veredicto

**F-1 confirmada — remediada en `TK-132`** (remediación técnica, carve-out C-DEV-006-4: no cambia ninguna regla de negocio de cara al usuario, cierra un defecto de configuración; el comportamiento *previsto* — rate limiting por IP, Guard 16 — ya estaba documentado). F-2/F-3/O-1 remediadas en el mismo ticket por ser el mismo subsistema. No se toca el `ports: "3000:3000"` del backend en `docker-compose.yml` (dejar de exponerlo rompería `workflows/09_live_stack_verification`); con la lista de subredes de `trust proxy` el puerto directo ya no es un vector de spoofing.

---

## 🔗 Relacionado
* [`docs/00_stack_manifest.md`](../00_stack_manifest.md) §CORS/Rate-limit — nota de `TK-046` (introdujo el limiter global, sin `trust proxy`).
* [`TK-132`](../05_agile_planning/12_tickets/security/backend/TK-132.md) — ticket de remediación.
* [`AUDIT-SEC-001`](./AUDIT-SEC-001-security-posture-report.md) / [`AUDIT-SEC-002`](./AUDIT-SEC-002-roles-endpoint-unguarded.md) — hallazgos de RBAC, subsistema distinto.
