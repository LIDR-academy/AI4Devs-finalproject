---
document: architecture_decision_record
id: ADR-006
version: 1.0.0
status: accepted
date: 2026-09-09
---

# ADR-006: Topología de Despliegue en Render (entorno de revisión)

- **ID:** ADR-006
- **Título:** Topología de Despliegue en Render (entorno de revisión)
- **Estado:** `Accepted`
- **Fecha:** 2026-09-09
- **Autor:** Claude (AI Pair Programmer) — decisión confirmada por el humano en la PAUSA HitL de `SK-36` Fase 3
- **Implementado por:** [`TK-142`](../../05_agile_planning/12_tickets/shared/frontend/TK-142.md) — `approved`, posterior al PR #3
- **Relacionado:** depende de [`ADR-005`](./ADR-005-session-token-storage.md) — la premisa de mismo origen que decidió aquel ADR es exactamente lo que esta topología debe preservar.

---

## 1. Contexto (Context)

**Pregunta que se decide:** ¿cómo se despliega RestoStock en Render de forma que el tutor pueda revisar el producto funcionando?

**Restricción dura, verificada en código:**

`apps/frontend/src/shared/http/apiClient.ts:3` fija `const DEFAULT_BASE_URL = '/api/v1'` — una ruta **relativa**. El cliente no sabe la URL de la API: asume que vive en su mismo origen. Eso funciona hoy porque `apps/frontend/nginx.conf` hace `proxy_pass` de `location /api/` hacia el backend. El propio comentario de ese fichero documenta que ya se rompió una vez por esto: *"sin esto, `fetch('/api/v1/...')` desde el navegador resolvía contra este mismo nginx (que solo sirve estáticos) en vez de contra el backend real"*.

**Fuerzas en tensión:**

1. **Mismo origen como premisa arquitectónica.** No es una comodidad: es la fuerza decisiva de `ADR-005` (cookie `httpOnly`) y la razón de que la CSP de `TK-141` pueda usar `connect-src 'self'`. Romperlo invalida dos decisiones ya tomadas.
2. **Superficie pública.** Cuanto menos se exponga a internet, mejor — sobre todo con el hallazgo de que el seed crea usuarios con PIN por defecto si no se parametriza (`SEED_ADMIN_PIN`).
3. **Acoplamiento del upstream.** `proxy_pass http://backend:3000` es un alias de la red de `docker-compose`, inexistente en Render.
4. **Guard 22 (IaC declarativa) vs. la realidad de la plataforma.** El manifiesto exige OpenTofu; Render tiene su propio formato declarativo (`render.yaml`) de primera mano.
5. **Guard 24.** Render **no estaba declarado** en `docs/00_stack_manifest.md` §6 — este ADR es lo que lo introduce, con aprobación humana explícita.
6. **Es un entorno de revisión, no la producción del restaurante.** Nivel de servicio y coste no son criterios dominantes; reproducibilidad y fidelidad al producto real, sí.

**Qué NO se decide aquí:** el proveedor de producción real del restaurante (Render se aprueba como entorno de demo/revisión), ni la estrategia de dominio propio/TLS más allá del certificado que Render provee, ni la migración a cookie `httpOnly` (eso es `ADR-005`/`TK-140`).

---

## 2. Opciones Consideradas

| Opción | Ventajas | Desventajas | Recomendada cuando… | Coste de reversión |
| :--- | :--- | :--- | :--- | :--- |
| **A. Static Site (frontend) + Web Service (backend)** — orígenes distintos | La topología por defecto y más barata en Render; el SPA se sirve desde CDN | **Rompe la aplicación entera sin cambios de código:** el navegador pediría `/api/v1/...` al propio static site, que no sirve API → todo 404. Exigiría introducir `VITE_API_URL`, configurar CORS y **invalidar la premisa de `ADR-005`** y el `connect-src 'self'` de `TK-141` | El cliente ya está diseñado para una API en otro origen (base URL absoluta configurable) | **Alto**: arrastra cambios en el cliente, en CORS, y obliga a superseder `ADR-005` |
| **B. Web Service (imagen del frontend, que ya lleva nginx) + Private Service (backend) + Postgres gestionado** | Preserva el mismo origen → **cero cambios en el cliente**, `ADR-005` y la CSP de `TK-141` siguen válidos; el backend **nunca queda expuesto a internet**, sólo alcanzable por el nginx; es la misma topología que ya se verifica en `docker compose` | Exige parametrizar el upstream de nginx (hoy hardcodeado) y su puerto; depende del direccionamiento interno entre servicios de la plataforma | La SPA y la API deben compartir origen y ya existe un proxy inverso en la imagen — **este caso** | **Bajo/medio**: el upstream queda en una variable; volver a compose es cambiar su valor |
| **C. Un solo contenedor monolítico (nginx + Node juntos)** | Un único servicio que desplegar; mismo origen trivialmente garantizado | Contradice la separación de imágenes que el proyecto ya construye y escanea por separado (trivy sobre 2 imágenes); un proceso supervisor dentro del contenedor es un antipatrón; el despliegue dejaría de parecerse a la arquitectura documentada | Prototipo desechable donde la fidelidad arquitectónica no importa | **Medio**: hay que deshacer el Dockerfile combinado |

---

## 3. Decisión (Decision)

Se adopta la **Opción B**: `restostock-frontend` (Web Service público, imagen de `apps/frontend/Dockerfile`) → `restostock-backend` (Private Service, imagen de `apps/backend/Dockerfile`) → `restostock-db` (PostgreSQL gestionado).

**Fuerza decisiva: la fuerza 1.** El mismo origen no es una preferencia de despliegue, es una **premisa de la que ya cuelgan dos decisiones tomadas** (`ADR-005` y la CSP de `TK-141`). La Opción A no es simplemente "otra forma de desplegar": obliga a superseder un ADR aceptado y a reabrir código de cliente y de seguridad. Elegir B es preservar coherencia, no comodidad.

**Decisión secundaria acoplada — mecanismo de IaC:** se declara la infraestructura en un **`render.yaml` versionado en el repo**, no en OpenTofu.

> ⚠️ **Carve-out explícito del Guard 22.** El Guard exige módulos OpenTofu declarativos y prohíbe el aprovisionamiento manual. `render.yaml` **sí satisface el espíritu del Guard** — es declarativo, versionado, revisable y reproducible; lo que no satisface es la letra (*"OpenTofu"*). Se elige frente al provider de OpenTofu para Render porque éste exigiría pinnear y verificar una referencia de terceros contra su fuente real (Guard 30, que ya destapó **3 pins rotos en una sola pasada** en `TK-064`) justo en la ventana de entrega. La opción descartada de configurar a mano en el dashboard sí habría violado el Guard de frente y se rechaza. Este carve-out se documenta aquí y en `docs/00_stack_manifest.md` §6; **no es una excepción silenciosa**.

**Confirmado por el humano** (2026-09-09) en tres decisiones explícitas: aprobar Render en el manifiesto (Guard 24), elegir `render.yaml` con carve-out documentado (Guard 22), y aterrizar este ADR y su ticket antes del push dejando el código para después del PR #3.

---

## 4. Consecuencias (Consequences)

**Positivas:**
- El cliente no cambia: `/api/v1` relativo sigue siendo correcto en local y en Render.
- `ADR-005` y `TK-141` permanecen válidos sin revisión.
- El backend deja de ser alcanzable desde internet: la única puerta pública es el SPA.
- El despliegue revisable por el tutor refleja la arquitectura documentada, no una variante ad-hoc.

**Negativas / deuda que aceptamos conscientemente:**
- Se introduce una dependencia de plataforma (direccionamiento interno entre servicios de Render) que **no está verificada desde este entorno** y debe confirmarse en el primer despliegue real — `rules/04_verified_implementation_standard.md` Antipatrón B: no se dará por buena por lectura de documentación.
- `render.yaml` convive con `infrastructure/opentofu/` describiendo entornos distintos: dos fuentes declarativas para dos destinos. Riesgo de drift entre ambas si el stack cambia y sólo se actualiza una.
- `trust proxy` está fijado en `['loopback','linklocal','uniquelocal']`. Si la red interna de Render no cae en rango privado, el rate limiter volvería a agrupar a todos los clientes en un bucket — el bug exacto que cerró `TK-132`. **Verificable sólo desplegado.**
- En plan gratuito el servicio se suspende por inactividad (arranque en frío de decenas de segundos) y la base de datos gratuita caduca: aceptable para revisión, inaceptable para operación real.

**Qué haría falta para revertirla:** devolver `BACKEND_ORIGIN` a su valor de compose y retirar `render.yaml`. Ningún cambio de código de aplicación, que es precisamente la propiedad que se buscaba.

---

## 5. Alternativas Descartadas

- **Opción A (Static Site + Web Service) — descartada** no por coste ni complejidad, sino porque **rompe la aplicación sin cambios de código** y su arreglo obligaría a superseder `ADR-005`. Es la opción que un despliegue apresurado habría elegido por defecto, y es la razón por la que este ADR existe.
- **Opción C (contenedor monolítico) — descartada** porque el proyecto ya construye, endurece y escanea dos imágenes por separado; fusionarlas para el entorno de revisión haría que lo revisado dejara de parecerse a lo documentado.
- **OpenTofu con provider de Render — descartado por riesgo de calendario, no por incorrección.** Es la opción que cumple el Guard 22 literalmente y sigue siendo el camino natural si Render pasa de entorno de revisión a producción.
- **Configuración manual en el dashboard — rechazada de plano:** aprovisionamiento manual no versionado, violación directa del Guard 22, y el tutor no podría revisar cómo se desplegó.
