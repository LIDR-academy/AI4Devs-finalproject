# HU-001 — Desglose en tickets de trabajo

| Campo | Valor |
|-------|--------|
| **Historia** | [HU-001 en backlog.md](backlog.md) (tabla §3) |
| **Refinamiento** | [HU-001-autenticacion-oidc.md](HU-001-autenticacion-oidc.md) |
| **Épica** | Acceso e identidad |
| **Título HU** | Autenticación OIDC |
| **Estado HU** | **Cerrada** (tickets **TASK-HU-001-01** … **001-16** **Hecho**) |
| **Historia de usuario** | Como colaborador o usuario con rol **ADMIN**, quiero autenticarme mediante el proveedor de identidad OIDC previsto en la arquitectura (JWT), para acceder a las funciones que exigen sesión. |

**Convención de fichero:** este documento sigue el patrón `HU-<id>-ticket-breakdown.md` descrito en [README.md](README.md) de esta carpeta.

**Convención de ID de ticket:** `TASK-HU-001-<nn>` (vinculación explícita a HU-001).

**Reglas aplicables por capa (referencia rápida):**

- **Frontend:** [frontend-vue3.mdc](../../.cursor/rules/frontend-vue3.mdc), [frontend-ux.mdc](../../.cursor/rules/frontend-ux.mdc), [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc)
- **API / contrato (si aplica):** [api-design.mdc](../../.cursor/rules/api-design.mdc), [api-contract.mdc](../../.cursor/rules/api-contract.mdc), [openapi.yaml](../api/openapi.yaml)
- **Calidad / pruebas:** [quality-and-testing.mdc](../../.cursor/rules/quality-and-testing.mdc), [testing-java.md](../engineering/testing-java.md)

**Checks mínimos para cerrar tickets de esta HU:**

- Frontend: `npm run build` y `npm run test` (si se añaden/ajustan tests)
- Backend: `mvn -f services/pom.xml test` (y `verify` si se tocan `testIT`)
- Validar login/logout y acceso protegido por rol (`COLABORADOR`, `ADMIN`) en entorno local

---

## Tickets

### Infra e identidad (Keycloak)

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-001-01** | Realm `mtl` y cliente SPA en Compose | Realm importable (`mtl-realm.json`): cliente público `mtl-spa` (PKCE S256), `consentRequired` off, `rootUrl`/Vite, redirect/web origins, post-logout; `fullScopeAllowed` en dev para heredar scopes estándar (incluye **`roles`** → `realm_access.roles` en access token). Verificación en [infra/compose/README.md](../../infra/compose/README.md) (*Verificación TASK-HU-001-01*). | **Hecho** |
| **TASK-HU-001-02** | Usuarios y roles de prueba | Asegurar cuentas de prueba (colaborador / **ADMIN**) con roles correctos; alinear [infra/compose/README.md](../../infra/compose/README.md) con la realidad del JSON de realm. | **Hecho** |
| **TASK-HU-001-03** | Coherencia issuer JWT (host / Docker) | Documentar y validar `MTL_JWT_ISSUER_URI` cuando el navegador usa `localhost` y los servicios corren en host o en red Docker; evitar mismatch entre `iss` del token y resolución JWKS. | **Hecho** |

### Frontend (Vue 3)

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-001-04** | Cliente OIDC (Authorization Code + PKCE) | Integrar flujo contra Keycloak: discovery, login, callback, gestión del estado de sesión (librería OIDC o implementación acotada). | **Hecho** |
| **TASK-HU-001-05** | Tokens y renovación | Refresh / renovación de access token antes de expirar; no usar el ID token como Bearer hacia la API REST. | **Hecho** |
| **TASK-HU-001-06** | HTTP API con Bearer vía gateway | Interceptor o cliente que envíe `Authorization: Bearer <access_token>` a la base URL del gateway; manejo de **401** (refresh o redirección a login). | **Hecho** |
| **TASK-HU-001-07** | UI mínima de sesión | Login / logout visibles; feedback de usuario autenticado (y opcionalmente rol) para validar la historia en demo. | **Hecho** |
| **TASK-HU-001-08** | CORS con gateway en local | Coordinar orígenes permitidos con la configuración CORS del gateway para el origen del SPA (p. ej. `localhost:5173`). | **Hecho** |

### API Gateway

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-001-09** | CORS explícito en el gateway | Definir en `api-gateway` orígenes, métodos y cabeceras necesarias para el SPA; coherente con [docs/security/jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md) y readme §2.5. | **Hecho** |
| **TASK-HU-001-10** | Correlación `X-Correlation-Id` | Normalizar en gateway (`CorrelationIdWebFilter`) y reenviar cabecera al upstream en proxy; microservicios MVC leen MDC desde la misma cabecera; coherente con [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md) §6. | **Hecho** |

### Backend (cierre funcional con sesión)

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-001-11** | Primer resource server en microservicio | OAuth2 Resource Server en al menos un servicio (p. ej. `catalog-service`) con el mismo `issuer-uri` que el gateway, token relay desde el gateway, **401** alineado con [OpenAPI](../api/openapi.yaml). | **Hecho** |
| **TASK-HU-001-12** | Autorización por rol (piloto) | Una ruta o endpoint que exija `ADMIN` y otra accesible con `COLABORADOR`, leyendo roles del JWT; validar matriz con documentación de producto. | **Hecho** |
| **TASK-HU-001-13** | Tests automatizados del resource server | Pruebas que no dependan de Keycloak manual (JWT de prueba, mock de decoder, o Testcontainers) para el servicio piloto. Convención de carpetas Maven (`src/test/java` vs `src/testIT/java`): [docs/engineering/testing-java.md](../engineering/testing-java.md). | **Hecho** |

### Calidad, seguridad y entrega

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-001-14** | Checklist E2E manual | Login SPA → llamada autenticada al gateway → microservicio; logout; usuario sin rol en ruta admin → **403** esperado. | **Hecho** |
| **TASK-HU-001-15** | Errores 401/403 y mensaje al cliente | Sin fugas de detalle interno; alineación con RFC 9457 donde el contrato ya lo defina. | **Hecho** |
| **TASK-HU-001-16** | Documentación de arranque y variables | Actualizar `services/README`, variables `VITE_*` / env del front, y enlaces en readme §2.5 o jwt-gateway-strategy si cambia el flujo. | **Hecho** |

**Evidencia TASK-HU-001-14:** checklist manual (SPA/OIDC). Complemento back: `services/system-e2e-tests` — `Hu001Scenario02…` (200 + correlación), `03…` (401), `04…` (403); ver [system-e2e-tests/README.md](../../services/system-e2e-tests/README.md).

**Evidencia TASK-HU-001-10:** `CorrelationIdWebFilter` muta la petición con `X-Correlation-Id` antes del proxy; IT `GatewayCatalogProxyJwtIT` (cabecera del cliente y generada sin cabecera) verifica reenvío a WireMock.

---

## Orden sugerido (dependencias)

1. **TASK-HU-001-01** a **03** (Keycloak + issuer) en paralelo o antes de **04**–**06**.  
2. **TASK-HU-001-09** y **001-10** (CORS y correlación en gateway) cuando existan llamadas reales del navegador (**04**–**06**).  
3. **TASK-HU-001-11** a **13** para demostrar acceso a capacidades que exigen sesión más allá del solo login en UI.  
4. **TASK-HU-001-14** a **16** para evidencia y cierre documentado.

---

## Criterio de “historia completada” (orientativo)

- Un colaborador y un usuario con rol **ADMIN** pueden iniciar y cerrar sesión contra Keycloak desde la SPA.
- Las llamadas autenticadas al gateway llegan a al menos un endpoint protegido en backend con JWT validado y comprobación de rol acorde.  
- El gateway propaga **`X-Correlation-Id`** al upstream en proxy (**TASK-HU-001-10**).
- Los flujos documentados, el checklist E2E (**001-14**) y los `Hu001Scenario*` de back pasan sin pasos ad hoc no documentados.

**Cierre de tickets:** todos **Hecho**. HU **Cerrada** en [backlog.md](backlog.md) y [HU-001-autenticacion-oidc.md](HU-001-autenticacion-oidc.md). E2E: manual **001-14**; back automatizado `Hu001Scenario*`; correlación **001-10** (`GatewayCatalogProxyJwtIT` + eco correlación en esc. 2 E2E).
