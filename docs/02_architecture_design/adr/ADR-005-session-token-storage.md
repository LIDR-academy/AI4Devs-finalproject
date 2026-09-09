---
document: architecture_decision_record
id: ADR-005
version: 1.0.0
status: accepted
date: 2026-09-09
---

# ADR-005: Almacenamiento del Token de Sesión en el Cliente

- **ID:** ADR-005
- **Título:** Almacenamiento del Token de Sesión en el Cliente
- **Estado:** `Accepted`
- **Fecha:** 2026-09-09
- **Autor:** Claude (AI Pair Programmer) — decisión confirmada por el humano en la PAUSA HitL de `SK-36` Fase 3
- **Implementado por:** [`TK-140`](../../05_agile_planning/12_tickets/auth/frontend/TK-140.md) — `approved`, post-entrega
- **Origen:** hallazgo `O-1` de [`AUDIT-SEC-004`](../../audits/AUDIT-SEC-004-hardcoded-credentials-and-auth.md) ("JWT en `localStorage`… httpOnly cookie sería lo correcto"), documentado sin remediar hasta este ADR. Primer ADR generado por [`SK-36`](../../../.agents/skills/specs/02_architecture_design/SK-36_generate_architecture_decision_record.md).

---

## 1. Contexto (Context)

**Pregunta que se decide:** ¿dónde persiste el cliente web el token de sesión emitido por `POST /api/v1/auth/login-pin`?

**Estado actual verificado en código:**

| Punto | Evidencia |
| :--- | :--- |
| Persistencia | `localStorage.setItem('restostock_jwt_token', data.accessToken)` — `apps/frontend/src/features/auth/services/auth.service.ts:29` y `:93` |
| Transporte | `headers.Authorization = \`Bearer ${token}\`` — `apps/frontend/src/shared/http/apiClient.ts:102` |
| Emisión | `jwt.sign(payload, secret, { expiresIn: '12h' })` — `apps/backend/src/application/auth/use-cases/AuthenticateByPinUseCase.ts:71-72` |
| Verificación | `jwt.verify(token, jwtSecret)` — `apps/backend/src/infrastructure/http/middlewares/authenticateJWT.ts:39` |

**Fuerzas en tensión:**

1. **Topología de despliegue:** `nginx` sirve el SPA y hace `proxy_pass` de `location /api/` hacia `backend:3000` — **SPA y API comparten origen**. La fricción habitual de las cookies en SPAs (CORS, cookies de terceros) no existe en este proyecto.
2. **Dispositivo compartido:** la terminal es una tablet táctil de cocina usada por varios operarios con PIN de 4–6 dígitos; un token de 12 h legible por JS amplía la ventana de un robo.
3. **Superficie XSS real medida:** cero usos de `dangerouslySetInnerHTML` / `innerHTML` en todo `apps/frontend/src`; React escapa por defecto. **Pero** el SPA se sirve desde `nginx` **sin ninguna cabecera de seguridad** (`0 add_header` en `apps/frontend/nginx.conf`) — no hay CSP que limite el daño si algún día entra una inyección.
4. **Mitigación ya vigente:** `useIdleTimeout` está **realmente wireado** (`apps/frontend/src/app/useSession.ts:45`, Guard 37), así que la ventana efectiva de sesión es mucho menor que las 12 h nominales.
5. **Coste de oportunidad:** cambiar el almacenamiento toca el contrato de autenticación completo (login, logout, `apiClient`, middleware) y sus tests.

**Qué NO se decide aquí:** la duración del token (`expiresIn: '12h'` hardcodeado), el pinneo de algoritmo en `jwt.verify`, ni las cabeceras de seguridad de `nginx` — los tres son hallazgos independientes de `AUDIT-SEC-004`/`O-1` con su propio tratamiento (el tercero, en `TK-141`).

---

## 2. Opciones Consideradas

| Opción | Ventajas | Desventajas | Recomendada cuando… | Coste de reversión |
| :--- | :--- | :--- | :--- | :--- |
| **A. `localStorage`** *(statu quo)* | Cero trabajo; contrato actual estable; sin CSRF que gestionar; el token viaja explícito y es fácil de depurar; sirve igual a un futuro cliente nativo | Exfiltrable por XSS; el SPA hoy no tiene CSP que acote el daño; en tablet compartida la ventana es amplia | El front y la API viven en orígenes distintos, o el cliente es nativo y no maneja cookies | **Nulo** (es el estado actual) |
| **B. Cookie `httpOnly` + `Secure` + `SameSite=Strict`** | Inaccesible a JavaScript → un XSS ya no puede robar la sesión; el mismo origen ya está resuelto por `nginx`, así que no hay CORS ni cookies de terceros que negociar; la expiración la gestiona el navegador | Exige protección CSRF (muy mitigada por `SameSite=Strict` en mismo origen); cambia login/logout/`apiClient`/middleware y sus tests; `Secure` obliga a HTTPS en producción | La SPA y la API comparten origen — **exactamente este caso** | **Medio**: volver a `Bearer` toca los mismos 4 puntos e invalida las sesiones vivas |
| **C. Access token en memoria (TTL corto) + refresh en cookie `httpOnly`** | Máxima defensa: ni persistencia accesible a JS ni sesión larga robable; habilita revocación real | Exige infraestructura que hoy no existe (endpoint de refresh, rotación, almacén de revocación); el token se pierde al recargar (parpadeo de re-auth); complejidad desproporcionada para un despliegue mono-tenant | Multi-tenant, datos regulados, o necesidad de revocación inmediata | **Alto** |

---

## 3. Decisión (Decision)

Se adopta la **Opción B: cookie `httpOnly` + `Secure` + `SameSite=Strict`**.

**Fuerza decisiva:** la **topología de mismo origen** (fuerza 1). El motivo por el que las SPAs se conforman con `localStorage` — API en otro origen, fricción de CORS y cookies de terceros — **no se paga en este proyecto**, porque `nginx` ya sirve SPA y API bajo el mismo origen. El trade-off que históricamente justificaba la Opción A nunca fue real aquí; se heredó como default, no como decisión.

No es la superficie XSS actual la que decide (es baja y está medida: 0 `innerHTML`, `useIdleTimeout` activo), sino que **la alternativa correcta resulta barata en esta topología concreta**.

**Confirmado por el humano** en la PAUSA HitL de `SK-36` Fase 3 (2026-09-09), junto con la condición de calendario: se registra `Accepted` ahora, se implementa **después del push de la Entrega Final** — es un cambio de contrato de autenticación que exige re-testear el flujo completo, y hacerlo la víspera de la primera corrida real de CI sería temerario.

---

## 4. Consecuencias (Consequences)

**Positivas:**
- Un XSS deja de poder exfiltrar la sesión: la cookie es invisible a `document.cookie` y a cualquier script.
- La expiración pasa a gestionarla el navegador, no código propio.
- `SameSite=Strict` en mismo origen cubre la mayor parte del vector CSRF sin token adicional.

**Negativas / deuda que aceptamos conscientemente:**
- Hay que introducir protección CSRF explícita para las mutaciones, aunque `SameSite=Strict` la reduzca — no se asume cubierta por defecto.
- `Secure` exige HTTPS en producción; el despliegue debe garantizarlo o la cookie no viajará.
- Un futuro cliente nativo (app móvil) no consume cookies con la misma naturalidad y podría necesitar una segunda vía de autenticación.
- **Hasta que `TK-140` se ejecute, la Opción A sigue vigente en producción** — deuda conocida, con las mitigaciones de la fuerza 3/4 documentadas arriba y con `TK-141` (CSP en `nginx`) acotando el riesgo mientras tanto.

**Qué haría falta para revertirla:** restaurar `Authorization: Bearer` en `apiClient`, devolver el token en el cuerpo de `login-pin`, reponer el `localStorage` en `auth.service.ts` y retirar el middleware de cookie/CSRF. Todas las sesiones activas se invalidarían en el cambio.

---

## 5. Alternativas Descartadas

- **Opción A (`localStorage`) — descartada** porque su única ventaja real frente a B en este proyecto es "no hacer nada". El argumento estándar a su favor (evitar la fricción de cookies en SPA cross-origin) **no aplica**: `nginx` ya unifica el origen. Se mantiene vigente de facto solo hasta que `TK-140` se ejecute, no como decisión.
- **Opción C (memoria + refresh) — descartada por desproporción**, no por incorrección: es la más segura de las tres, pero exige construir rotación y revocación de refresh tokens para un despliegue de un solo restaurante, donde el modelo de amenaza no incluye multi-tenancy ni datos regulados. Queda como el camino natural si el producto evoluciona a multi-local.
