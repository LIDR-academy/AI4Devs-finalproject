# HU-001 — Autenticación OIDC

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con backlog: *Autenticación OIDC*. |
| **Formato “Como… quiero… para…”** | Correcto y claro: cubre colaboradores y usuarios con rol **ADMIN** con acceso a funciones protegidas. |
| **Estimación (S/M/L)** | **M** coherente para alcance MVP (IdP, SPA, gateway y primer cierre backend de seguridad). |
| **Prioridad** | **Alta** coherente con dependencia transversal para rutas protegidas del MVP. |
| **Inconsistencias detectadas** | **Cerrado:** desglose en [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md) (tickets **TASK-HU-001-01** … **001-16** **Hecho**, incl. correlación **001-10**). |
| **Estado** | **Cerrada** — tickets **TASK-HU-001-01** … **001-16** **Hecho**; E2E: manual **001-14**, back `Hu001Scenario*` ([breakdown](HU-001-ticket-breakdown.md)); correlación **001-10**. |
| **Tamaño / división** | Entregado: Keycloak local, SPA OIDC (login/callback/silent renew/logout), Bearer al gateway, resource server piloto en **catalog-service**, autorización por rol, CORS local, tests automatizados y documentación de arranque. **HU-013** cubre mapa de rutas y guardas de navegación por rol. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-001 |
| **Épica** | Acceso e identidad |
| **Título** | Autenticación OIDC |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |
| **Estado** | **Cerrada** |

**Historia de usuario**

Como colaborador o usuario con rol **ADMIN**, quiero autenticarme mediante el proveedor de identidad OIDC previsto en la arquitectura (JWT), para acceder a las funciones que exigen sesión.

- **Entregable de la historia:** Flujo operativo de autenticación OIDC en SPA (login, callback en `/auth/callback`, renovación silenciosa y logout), consumo del **API Gateway** con `Authorization: Bearer` (access token, no ID token), validación JWT en gateway y **catalog-service** como resource server piloto con **token relay**, autorización por rol de realm (`COLABORADOR` / `ADMIN`) en al menos un endpoint de cada tipo, CORS explícito para orígenes del SPA en local y correlación `X-Correlation-Id` (gateway → upstream), manejo coherente de **401**/**403** (Problem RFC 9457 en API; redirect/error de sesión en front) y documentación mínima de variables y arranque local. Desglose: **[HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md)**.

### Alcance

#### Incluye

- Configuración del realm `mtl` en entorno local con cliente SPA `mtl-spa` (Authorization Code + PKCE) y usuarios de prueba colaborador / **ADMIN** ([infra/compose/README.md](../../infra/compose/README.md)).
- Integración OIDC en frontend: discovery, login, callback, estado de sesión reactivo (`oidc-client-ts`), `automaticSilentRenew`, logout; rutas `/login`, `/auth/callback`, `/auth/error`.
- Envío de `Authorization: Bearer` en llamadas autenticadas al gateway; gestión de **401** con `signinSilent` y reintento o redirect a login con `returnPath`.
- Validación JWT en **api-gateway** (lista blanca de rutas públicas según [openapi.yaml](../api/openapi.yaml)) y en **catalog-service** con el mismo `issuer-uri` y conversión de `realm_access.roles` a `ROLE_*`.
- Piloto de autorización por rol: rutas que exigen **COLABORADOR** o **ADMIN** según matriz de producto (p. ej. maestros solo **ADMIN**).
- **CORS** explícito en gateway para orígenes del SPA en local (`localhost:5173`, `127.0.0.1:5173`), alineado con [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md).
- **Correlación** `X-Correlation-Id`: normalización en gateway, reenvío al upstream en proxy y lectura en MDC de microservicios MVC (**TASK-HU-001-10**).
- Mensajes de error de acceso o sesión en frontend sin filtrar detalle interno del backend.
- Tests automatizados del resource server sin depender de Keycloak manual en cada ejecución (JWT de prueba / decoder stub).
- Documentación de variables (`VITE_*`, `MTL_JWT_ISSUER_URI`, etc.) y flujo de arranque en [services/README.md](../../services/README.md), [frontend/README.md](../../frontend/README.md) y readme §2.5 / §3.1.1.

#### Queda fuera de esta historia

- **Mapa de rutas, menú global y guardas de router** por perfil (**HU-013**): esta HU aporta identidad y token; HU-013 aplica `requiresAuth` / `requiredRoles` en Vue Router.
- Envío opcional de **`X-Correlation-Id`** desde la SPA (el gateway genera uno si el cliente no lo envía).
- Correlación en **`ai-assistant-service`** cuando exponga API REST (stub sin filtro MDC aún).
- Endurecimiento de CORS y políticas de producción (orígenes reales, TLS, secretos) fuera del corte de desarrollo local.
- SSO multiaplicación, MFA, federación avanzada o políticas IAM enterprise.
- Cierre funcional de todos los casos de uso de negocio (alta de árbol, notificaciones, IA, etc.): esta HU solo **habilita** el acceso autenticado que consumen otras historias.

### Relación con otras historias

| Historia | Relación |
|----------|----------|
| **HU-013** | Depende de HU-001 (sesión y roles). HU-013 entrega estructura de páginas y guardas; HU-001 no sustituye esa capa. |
| **HU-005**, **HU-008**, **HU-011**, **HU-012** | Consumidoras: requieren JWT y roles para operaciones de catálogo o administración. |
| **HU-002**, **HU-004** | No requieren sesión para el flujo público principal (consulta / suscripción por correo). |

### Dependencias

- Infraestructura local con **Keycloak** operativa en Compose (realm `mtl`, cliente `mtl-spa`).
- **API Gateway** en marcha con rutas `/api/*` y OAuth2 Resource Server.
- Configuración coherente de **`issuer-uri`** entre navegador, gateway y microservicios (`MTL_JWT_ISSUER_URI`).
- Contrato [openapi.yaml](../api/openapi.yaml) para distinguir rutas públicas y protegidas.

### Decisiones de refinamiento (registro)

| Tema | Decisión |
|------|----------|
| **CORS en gateway (local)** | **Incluido** en el cierre de HU-001 (**TASK-HU-001-08**, **001-09**). Producción: endurecimiento fuera de este corte. |
| **Correlación (`TASK-HU-001-10`)** | **Incluido:** gateway normaliza `X-Correlation-Id`, lo reenvía al upstream en proxy y lo expone en respuesta/Problem; microservicios MVC leen la cabecera en MDC ([jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md) §6). |
| **Evidencia E2E** | Manual **TASK-HU-001-14** (SPA/OIDC). Back esc. 2–4 automatizado: `system-e2e-tests` (`Hu001Scenario02…`–`04…`); matriz § [testing-java.md](../engineering/testing-java.md) 2.1.1. |
| **Microservicio piloto** | **catalog-service** como resource server de referencia; resto de servicios siguen el mismo patrón `issuer-uri` + roles. |
| **ID token vs access token** | Solo el **access token** como Bearer hacia la API REST (**TASK-HU-001-05**). |
| **Frontera HU-013** | HU-001 valida OIDC, JWT y API por rol; HU-013 valida navegación y guardas de rutas SPA. |

### Desglose en tickets

Ver [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md) (`TASK-HU-001-01` … `TASK-HU-001-16`, todos **Hecho**).

### Riesgos

| Riesgo | Mitigación acordada |
|--------|---------------------|
| **`issuer` mismatch** (localhost vs Docker) | **TASK-HU-001-03** documentado; `MTL_JWT_ISSUER_URI` en servicios. |
| **Roles no presentes en JWT** | Realm con `fullScopeAllowed` en dev; scopes estándar; verificación **TASK-HU-001-01**. |
| **CORS bloquea SPA** | CORS explícito en gateway (**TASK-HU-001-08**, **001-09**). |
| **Keycloak manual** | Realm importable `mtl-realm.json` en Compose (**TASK-HU-001-01**, **002**). |

### Aclaraciones pendientes (refinamiento)

*Ninguna.* Refinamiento cerrado; desglose y evidencia en [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md).

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-001` (tabla §3); [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md); [infra/compose/README.md](../../infra/compose/README.md); [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md); [readme.md](../../readme.md) §1.3 (matriz de páginas por rol), §2.5 y §3.1.1 (autenticación en front); [frontend/README.md](../../frontend/README.md) (flujo OIDC).

### Escenario 1 — Login y sesión válida por OIDC

- **Dado que** existe un usuario de rol `COLABORADOR` o `ADMIN` en el realm `mtl`  
- **Cuando** inicia sesión desde la SPA con OIDC Authorization Code + PKCE  
- **Entonces** la aplicación completa el callback, mantiene sesión activa (renovación silenciosa operativa) y puede invocar la API con Bearer JWT; las rutas protegidas del router (**HU-013**) permiten el acceso según el rol del token.

### Escenario 2 — Acceso protegido con JWT y control de rol

- **Dado que** el usuario está autenticado y la SPA envía Bearer JWT al gateway  
- **Cuando** accede a un endpoint HTTP protegido (p. ej. operación de catálogo que exige **COLABORADOR** o ruta solo **ADMIN**)  
- **Entonces** el gateway y el microservicio validan el token y aplican autorización por rol, devolviendo acceso permitido o **403** según corresponda.

### Escenario 3 — Usuario sin sesión o token inválido

- **Dado que** el usuario no tiene sesión válida o el token ha expirado o no es válido  
- **Cuando** intenta acceder a una capacidad protegida (ruta SPA con `requiresAuth` o API sin Bearer válido)  
- **Entonces** el sistema responde de forma controlada (**401** / redirect a login / vista `/auth/error` con `reason=session`) sin exponer detalles internos y con UX consistente.

### Escenario 4 — Denegación por rol en administración (E2E)

- **Dado que** un usuario con rol `COLABORADOR` está autenticado  
- **Cuando** intenta acceder a una ruta o API reservada a **ADMIN** (p. ej. gestión de maestros o suscripciones)  
- **Entonces** recibe **403** o redirección/error de permisos (`reason=forbidden`) según capa (API vs router), sin datos de negocio de la operación admin.

**Automatización:** esc. 2–4 back → [system-e2e-tests/README.md](../../services/system-e2e-tests/README.md); esc. 1 OIDC → **TASK-HU-001-14** / UI E2E; guardas SPA → **HU-013**. Matriz: [testing-java.md](../engineering/testing-java.md) §2.1.1.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de infra Keycloak; aporta valor verificable propio (login + API autenticada). Otras HUs dependen de esta. |
| **Negociable** | Cerrado para MVP; sin tickets abiertos en el desglose. |
| **Valiosa** | Sí: desbloquea funciones protegidas del MVP y control básico por rol. |
| **Estimable** | Sí: breakdown por capa (infra, front, gateway, catalog, QA). |
| **Small** | Aceptable para **M**; no se amplió a IAM avanzado. |
| **Testable** | Sí: IT por capa; `system-e2e-tests` (esc. 2–4); checklist manual esc. 1 (**001-14**); navegación/guardas en **HU-013** (Vitest; UI según §2.1.1). |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para MVP, repartido entre Keycloak local, integración OIDC en SPA, seguridad en gateway y **catalog-service**, CORS local, correlación gateway → upstream, pruebas automatizadas y documentación de cierre (**TASK-HU-001-01** … **001-16**).
