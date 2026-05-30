# HU-001 — Autenticación OIDC

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con backlog: *Autenticación OIDC*. |
| **Formato “Como… quiero… para…”** | Correcto y claro: cubre colaboradores y usuarios con rol **ADMIN** con acceso a funciones protegidas. |
| **Estimación (S/M/L)** | **M** coherente para alcance MVP (IdP, SPA, gateway y primer cierre backend de seguridad). |
| **Prioridad** | **Alta** coherente con dependencia transversal para rutas protegidas del MVP. |
| **Inconsistencias detectadas** | No hay contradicción funcional entre `backlog.md` y `HU-001-ticket-breakdown.md`; sí faltaba el documento de historia refinada como fuente intermedia entre backlog y tickets. |
| **Tamaño / división** | Tamaño adecuado para **M** si se mantiene foco en autenticación y acceso protegido básico; CORS explícito y correlación pueden quedar como cierre posterior dentro de la misma HU según corte de entrega. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-001 |
| **Épica** | Acceso e identidad |
| **Título** | Autenticación OIDC |
| **Estimación de complejidad** | M |
| **Prioridad** | Alta |

**Historia de usuario**

Como colaborador o usuario con rol **ADMIN**, quiero autenticarme mediante el proveedor de identidad OIDC previsto en la arquitectura (JWT), para acceder a las funciones que exigen sesión.

- **Entregable de la historia:** Flujo operativo de autenticación OIDC en SPA (login, callback, renovación de sesión y logout), consumo del gateway con Bearer JWT, y acceso validado a al menos un endpoint protegido con control básico de rol (`COLABORADOR`/`ADMIN`), con manejo coherente de errores `401/403` y documentación mínima de entorno.

### Alcance

#### Incluye

- Configuración del realm `mtl` en entorno local con cliente SPA `mtl-spa` (Authorization Code + PKCE) y usuarios de prueba de colaborador/admin.
- Integración de autenticación en frontend: login, callback, estado de sesión reactivo, silent renew y logout.
- Envío de `Authorization: Bearer` en llamadas al gateway y gestión mínima de `401` con reintento/redirect controlado.
- Validación JWT en gateway y al menos un microservicio piloto como resource server, con rutas protegidas y verificación de rol.
- Mensajes de error de acceso/no autenticado en frontend sin filtrar detalles internos de backend.
- Documentación de variables y flujo de arranque para reproducir autenticación en local.

#### Queda fuera de esta historia

- Gestión completa de CORS productivo y endurecimiento avanzado de gateway fuera del corte MVP básico (si no se cierra en este ciclo).
- Correlación distribuida completa (`X-Correlation-Id`) en toda la malla de servicios.
- SSO multiaplicación, MFA, federación avanzada de identidad o políticas IAM no requeridas por MVP.
- Cierre E2E de todos los casos de uso de negocio; esta HU habilita acceso/seguridad base.

### Dependencias

- Infraestructura local con Keycloak operativa en Compose (realm `mtl`, cliente `mtl-spa`).
- Configuración coherente de `issuer-uri` entre frontend/gateway/microservicios.
- Contrato OpenAPI vigente para distinguir rutas públicas/protegidas.
- HU funcionales de negocio que consumen autenticación (`HU-005`, `HU-011`, `HU-012`, etc.).

### Riesgos

- Desalineación de `issuer` (host `localhost` vs red Docker) y errores de validación JWT.
- Desalineación de roles en token (`realm_access.roles`/claims equivalentes) que rompa guardas o menú por perfil.
- Falta de CORS explícito en gateway en entorno local, bloqueando llamadas desde SPA.
- Dependencia de configuración manual de Keycloak si no se parte de import limpio del realm.

### Aclaraciones pendientes (refinamiento)

- Confirmar si el cierre de HU-001 exige incluir CORS explícito del gateway o se mantiene como pendiente técnico inmediato posterior.
- Confirmar alcance de `TASK-HU-001-10` (correlación) dentro de HU-001 o fuera del corte de “hecho” funcional.
- Definir evidencia mínima aceptada para checklist E2E manual (pasos y resultado esperado por rol).

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-001` (tabla §3), [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md), [infra/compose/README.md](../../infra/compose/README.md), [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md), `readme.md` §1.3 y §2.5.

### Escenario 1 — Login y sesión válida por OIDC

- **Dado que** existe un usuario de rol `COLABORADOR` o `ADMIN` en el realm `mtl`  
- **Cuando** inicia sesión desde la SPA con OIDC Authorization Code + PKCE  
- **Entonces** la aplicación completa callback, mantiene sesión activa y permite navegar por rutas protegidas según rol.

### Escenario 2 — Acceso protegido con JWT y control de rol

- **Dado que** el usuario está autenticado y la SPA envía Bearer JWT al gateway  
- **Cuando** accede a un endpoint/ruta protegida  
- **Entonces** el gateway y el microservicio validan el token y aplican autorización por rol, devolviendo acceso permitido o `403` según corresponda.

### Escenario 3 — Usuario sin sesión o token inválido

- **Dado que** el usuario no tiene sesión válida o el token ha expirado/no es válido  
- **Cuando** intenta acceder a una capacidad protegida  
- **Entonces** el sistema responde de forma controlada (`401`/redirect/login/error de sesión) sin exponer detalles internos y con UX consistente.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: habilita otras HUs y depende de infra de identidad; aun así aporta valor propio verificable. |
| **Negociable** | Sí: grado de cierre en CORS/correlación y nivel de evidencia E2E pueden ajustarse por corte. |
| **Valiosa** | Sí: desbloquea funciones protegidas del MVP y asegura control básico por rol. |
| **Estimable** | Sí: backlog y breakdown delimitan tareas técnicas concretas por capa. |
| **Small** | Aceptable para **M** si se evita ampliar a IAM avanzado o hardening fuera de MVP. |
| **Testable** | Sí: validable con pruebas automáticas (frontend/backend) y checklist E2E por rol. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para MVP, repartido entre configuración de identidad local (Keycloak), integración frontend OIDC, seguridad en gateway y servicio piloto con autorización por rol, más pruebas/documentación de cierre. El esfuerzo residual se concentra en CORS explícito y checklist E2E final.
