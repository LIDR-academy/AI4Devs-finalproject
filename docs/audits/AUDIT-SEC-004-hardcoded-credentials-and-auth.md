# 🔐 Informe de Auditoría de Seguridad — AUDIT-SEC-004

* **ID Auditoría:** AUDIT-SEC-004
* **Fecha:** 2026-09-08
* **Auditor:** Sesión de continuación — el humano preguntó "¿qué elementos hardcodeados en todo el proyecto violan la seguridad y buenas prácticas?".
* **Alcance:** barrido de `apps/backend/src`, `apps/frontend/src`, `docker-compose.yml`, `infrastructure/opentofu/`, `.env.example` buscando secretos, claves de fallback, URLs/hosts y config que debería ser env-driven con fail-fast.
* **Método:** grep dirigido (secret/key/token/password, `?? '<literal>'`, `http(s)://`, `localhost`, `Math.random`) + lectura de los flujos de auth/credenciales.

---

## 📋 Resumen ejecutivo

| # | Severidad | Título | Estado |
| :-- | :-- | :-- | :-- |
| **F-1** | 🟠 **Alta** | `CredentialEncryptionService` cae a una clave hardcodeada y, antes de eso, **reutiliza `JWT_SECRET`** como clave de cifrado de credenciales; `ENCRYPTION_KEY` no existía en env/validación | **Corregida en `TK-133`** |
| **F-2** | 🟠 **Alta** | Password-reset origin injection: `req.headers.origin` (atacante-controlable) construía la URL del email de recuperación → reset-poisoning | **Corregida en `TK-133`** |
| **F-3** | 🟡 Media | `ConsoleEmailService` (adaptador de dev) es el servicio de email de producción por defecto y **volcaba el token de reseteo a los logs**; sin fail-fast/aviso | **Corregida en `TK-133`** |
| **O-1** | Info | JWT en `localStorage` (exfiltrable por XSS), `jwt.verify` sin pinnear algoritmo, `expiresIn: '12h'` hardcodeado, `scryptSync` con `N` por defecto de Node | Documentado, no remediado (trade-offs / hardening menor) |
| **O-2** | Info | `seedEssentialUsers` (`src/infrastructure/seeds/seed.ts`) usa `SEED_ADMIN_PIN ?? '1234'` sin guard propio de producción — hoy inalcanzable en prod (el caller no lo invoca), pero frágil | Documentado |

**Verificado OK:** sin secretos commiteados (`.gitignore` cubre `.env`/`*.env`, sin `.pem`/`.key`); PIN con scrypt+salt+`timingSafeEqual`+lockout a 5; tokens de reset `randomBytes(32)` hasheados en BD (SHA-256), expiry 15 min exacto, respuesta constante anti-enumeración; `JWT_SECRET`/`CORS_ALLOWED_ORIGINS` con Fail-Fast real en producción; `Math.random` no se usa para nada sensible; endpoints IA por defecto son defaults de proveedor legítimos y overridables.

---

## 🚨 Hallazgo detallado

### F-1 — 🟠 Clave de cifrado de credenciales: fallback hardcodeado + reutilización de `JWT_SECRET`

`CredentialEncryptionService.ts` (antes):
```js
const rawSecret = masterSecret ?? process.env.ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'fallback-insecure-seed-key-32-chars!!';
```
- `ENCRYPTION_KEY` **no existía** en `.env.example`, `docker-compose.yml`, `main.tf` ni en la validación Fail-Fast de `environment.ts`.
- Sitio de composición `app.ts` pasaba **explícitamente `options.jwtSecret ?? process.env.JWT_SECRET`** → en producción las API keys de IA se cifran con el **mismo secreto que firma los JWT**. Rompe la separación de claves: rotar `JWT_SECRET` (p. ej. tras una fuga) vuelve **ilegibles** todas las credenciales cifradas; una fuga del JWT compromete además el almacén de credenciales.
- La constante `'fallback-insecure-seed-key-32-chars!!'` era código muerto peligroso sin ningún fail-fast que impidiera alcanzarla.

**Corrección (`TK-133`):**
- `environment.ts`: `ENCRYPTION_KEY` nuevo (opcional, `min 16`); en producción aborta el arranque si falta **o si es igual a `JWT_SECRET`** (Guard 14).
- `resolveEncryptionMasterSecret()`: usa `ENCRYPTION_KEY`; en su ausencia **lanza** en producción, y sólo fuera de producción usa una constante explícitamente marcada `DEV-ONLY-INSECURE-…` (inalcanzable en prod por el fail-fast anterior).
- `app.ts` deja de pasar `jwtSecret` al cipher.

### F-2 — 🟠 Password-reset origin injection

`auth.controller.ts` → `const clientOrigin = req.headers.origin` → `RequestAdminPinResetUseCase` → `resetUrl = `${origin}?resetToken=${rawToken}``.

`req.headers.origin` lo fija cualquier cliente HTTP. Un atacante que conoce el email del admin:
1. `POST /api/v1/auth/forgot-pin` `{ email: "admin@…" }` con header `Origin: https://evil.com`.
2. El admin real recibe un email con un **token de reseteo válido (15 min)** cuyo enlace apunta a `https://evil.com?resetToken=<TOKEN_REAL>`.
3. Si lo abre, `evil.com` captura el token → `POST /reset-pin` → toma de cuenta.

CORS no protege: `forgot-pin` se puede llamar con `curl` (sin navegador). Fallback hardcodeado `http://localhost:8085`.

**Corrección (`TK-133`):** `RequestAdminPinResetUseCase` recibe el allowlist de orígenes (`CORS_ALLOWED_ORIGINS` resuelto) y `resolveResetOrigin()` prioriza: `CLIENT_ORIGIN` del servidor → `clientOrigin` **sólo si está en el allowlist** → primer origen concreto del allowlist → fallback dev. `CLIENT_ORIGIN` nuevo en `environment.ts` (opcional).

### F-3 — 🟡 `ConsoleEmailService` en producción vuelca el token a los logs

`composition.ts` no inyecta ningún `IEmailService` real → `createAuthRouter` cae a `new ConsoleEmailService()`, que hacía `console.log('🔑 Token Temporal: ${dto.resetToken}')`. Efectos: (a) la recuperación de PIN de admin no funciona en producción; (b) un token de reseteo válido queda en `docker logs` / el agregador de logs → toma de cuenta para quien tenga acceso a logs.

**Corrección (`TK-133`):** `ConsoleEmailService` en `NODE_ENV=production` sólo registra un `console.error` **sin token ni URL** indicando que no hay proveedor real; `createApp` emite un `console.warn` de arranque en producción si no se inyectó un `IEmailService`.

### O-1 / O-2 — hardening menor / decisiones deliberadas (no remediado)

- **JWT en `localStorage`** (`auth.service.ts`): trade-off SPA conocido; httpOnly cookie sería lo correcto. `expiresIn: '12h'` hardcodeado amplía la ventana de un token robado.
- **`jwt.verify(token, secret)`** sin `{ algorithms: ['HS256'] }` ni `issuer`/`audience` — jsonwebtoken v9 mitiga `alg:none`, pinnear es la práctica.
- **`Pin.hashPin` = `scryptSync` con `N` por defecto de Node (16384)** — por debajo de la recomendación OWASP (≥2¹⁷) para un espacio de 10 000 combinaciones (PIN de 4 dígitos). Mitigado online por el lockout a 5 intentos; débil ante fuga de BD.
- **`seedEssentialUsers` sin guard de producción propio** — depende 100% de que `triggerDevSeedingIfNeeded` nunca lo invoque en prod (hoy cierto porque en prod sí hay `userRepository` inyectado).
- **Roles `'ADMIN'`/`'KITCHEN_STAFF'` hardcodeados** (~4 archivos) — atado a `US-015` Escenario 2, ya documentado (memoria `tk118`).

---

## ⚖️ Veredicto

**F-1, F-2, F-3 confirmadas — remediadas en `TK-133`** (remediación técnica, carve-out C-DEV-006-4: cierran defectos de configuración/hardcode; no cambian ninguna regla de negocio de cara al usuario). O-1/O-2 quedan como hardening menor / deuda documentada, no bloqueante.

---

## 🔗 Relacionado
* [`TK-133`](../05_agile_planning/12_tickets/security/backend/TK-133.md) — ticket de remediación.
* [`AUDIT-SEC-001`](./AUDIT-SEC-001-security-posture-report.md) / [`AUDIT-SEC-002`](./AUDIT-SEC-002-roles-endpoint-unguarded.md) / [`AUDIT-SEC-003`](./AUDIT-SEC-003-rate-limiter-shared-bucket.md).
