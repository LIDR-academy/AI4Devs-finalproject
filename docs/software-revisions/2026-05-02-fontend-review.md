# Revisión de arquitectura y diseño – `frontend/` (tercer corte)
- **Fecha**: 2026-05-02
- **Ámbito**: `frontend/` (Vue 3 + Vite + TypeScript). Continuación de [2026-04-25-frontend-architecture-review.md](./2026-04-25-frontend-architecture-review.md) y [2026-04-25-frontend-architecture-second-review.md](./2026-04-25-frontend-architecture-second-review.md), centrada en **solo incidencias críticas y altas** del estado actual.
- **Revisor**: Asistente IA (perfil: experto frontend Vue)
- **Estado**: Borrador
## Resumen ejecutivo
Tras el avance de los cortes anteriores, el frontend cumple ya la mayoría de reglas de [`fronted-vue3.mdc`](../../.cursor/rules/fronted-vue3.mdc) y [`frontend-security.mdc`](../../.cursor/rules/frontend-security.mdc): Pinia como estado de auth, capa HTTP tipada con `NetworkError` / `HttpError`, composables de validación puros, guard de router con silent refresh, alias `@/`, i18n centralizada y tests mínimos con Vitest. Quedan **una incidencia crítica** y **seis altas** de tipo arquitectural / seguridad / performance que deberían abordarse antes de añadir nuevas HU significativas.
## Críticas
### [CRÍTICA] C1 — Duplicación íntegra de la lógica de extracción de roles entre store y router guard
- **Archivos**: `frontend/src/stores/auth.ts` (líneas ~8–85) y `frontend/src/router/index.ts` (líneas ~32–116).
- **Síntoma**: `isRecord`, `normalizeRole`, `decodeJwtPayload`, `collectRolesFromClaims` y la función de extracción de roles (`extractUserRoles` en store, `extractTokenRoles` en router) están reimplementadas con el mismo código en ambos lugares.
- **Riesgo**: cualquier cambio en el contrato de roles (nuevo claim `groups`, alias adicional, quitar `ROLE_`, etc.) obliga a tocar dos sitios. Cuando se desincronicen, la UI (navegación condicional basada en `hasRole`) y el guard (`requiredRoles`) dejarán pasar o bloquearán rutas con criterios distintos → bugs silenciosos difíciles de reproducir y con impacto en seguridad funcional.
- **Fix recomendado**: extraer a `src/auth/jwtRoles.ts` (o `src/services/auth/roles.ts`) una función pura `extractRoles(user): AppRole[]`; consumirla desde `useAuthStore` y desde el guard. Mantener `APP_ROLES` como única fuente de verdad.
## Altas
### [ALTA] A1 — Todas las vistas se importan estáticamente en el router (bundle inicial hinchado)
- **Archivo**: `frontend/src/router/index.ts`, líneas 2–9 (`import AuthCallbackView from …`, `CreateTreeView`, `TreesDetailView`, `TreesListView`, `HomeView`, `PendingView`, etc.).
- **Síntoma**: el bundle principal arrastra dependencias pesadas de vistas que la mayoría de usuarios no visitará en el primer paint: Leaflet + CSS + marker images (`TreeLocationMapPreview`), `exifr` (EXIF GPS), la cadena de subida binaria (`treePhotoUploadSequence`), etc.
- **Riesgo**: Time-To-Interactive degradado de forma innecesaria, especialmente en móvil. Afecta al hit público (home, listado) que es el caso de uso masivo del producto.
- **Fix recomendado**: cambiar a `component: () => import('@/views/...')` al menos para `CreateTreeView`, `TreesListView`, `TreesDetailView` y `PendingView`. Conservar import estático solo en rutas verdaderamente críticas del primer paint (p. ej. `HomeView`, `AuthCallbackView`).
### [ALTA] A2 — Duplicación casi íntegra en `apiClient` (`requestWithAuthRetry` ↔ `requestWithAuthRetryBlob`)
- **Archivo**: `frontend/src/services/http/apiClient.ts` (líneas ~95–138 y ~147–192).
- **Síntoma**: dos funciones con cabeceras, fetch, manejo de `AbortError`, reintento único con `signinSilent` + `login(returnPath)` y parseo de `ProblemDetails` idénticos; solo difieren en la deserialización final (`response.json()` vs `response.blob()` con `404 → null`).
- **Riesgo**: cualquier ajuste de política (no reintentar en rutas públicas, telemetría de 5xx, normalización de `returnPath`, cancelación en cascada) se hace en un sitio y se olvida el otro. El código es **borde de seguridad** (OIDC, tokens, reintentos) y la divergencia aquí se paga cara.
- **Fix recomendado**: extraer `sendWithAuth(path, init): Promise<Response>` que concentre la decisión de reintento; `apiFetch` y `apiFetchBlob` solo deciden la deserialización del `Response` final.
### [ALTA] A3 — `useApiErrorMapper` acoplado a las claves i18n del formulario de árbol
- **Archivo**: `frontend/src/composables/useApiErrorMapper.ts`.
- **Síntoma**: todas las claves que usa son `treeForm.messages.*` (`networkError`, `unauthorized`, `badRequest`, `forbidden`, `serviceError`, `unexpectedError`), pese a que el composable se presenta como genérico y ya se usa desde `useCreateTreeForm`.
- **Riesgo**: el día que otro flujo (suscripciones, admin, media) lo reutilice, la UI mostrará textos de “crear árbol” en contextos ajenos. Incumple la regla [*una responsabilidad por composable*](../../.cursor/rules/fronted-vue3.mdc) que separa **mapeo** de **copy**.
- **Fix recomendado**: dos opciones equivalentes.
  1. Renombrar a `useCreateTreeErrorMapper` y restringir su ámbito explícitamente.
  2. Devolver un código estable (`'networkError' | 'unauthorized' | 'badRequest' | 'forbidden' | 'serviceError' | 'unexpectedError'`) y que cada vista aplique su `t(...)` local (mapper sin dependencia de i18n).
### [ALTA] A4 — Modelo de dominio del frontend mezcla español e inglés sin capa adapter
- **Archivos**: `frontend/src/types/catalog.ts`, `frontend/src/types/media.ts`.
- **Síntoma**: el mismo módulo define `PublicTreeDetail` con `nombreComun`, `nombreCientifico`, `provincia`, `municipio`, `latitud`, `longitud`, `altura`, `descripcion` y a la vez `CreateTreeRequest` con `speciesId`, `provinceId`, `latitude`, `longitude`, `altitude`, `municipality`, `description`. `types/media.ts` va en español (`arbolId`, `nombreFicheroOriginal`, `tipoMime`, `tamanoBytes`, `anchoPx`, `altoPx`, `orden`, `esPrincipal`). En `TreesDetailView.vue` conviven `tree.nombreComun` y `tree.publicMapVisibility` en la misma plantilla.
- **Riesgo**: duplica el vocabulario del código, multiplica errores al tipear propiedades (`altitud` vs `altitude`, `municipio` vs `municipality`) y dificulta refactors. La incoherencia viene del backend (dominio en español, DTOs de escritura en inglés) pero el frontend la propaga tal cual.
- **Fix recomendado**: introducir un adapter en `services/catalog/` y `services/media/` que mapee el wire a un modelo canónico del frontend (elegir un único idioma para el modelo interno) y hacer que las vistas consuman siempre ese vocabulario.
### [ALTA] A5 — `TreesListView` gestiona `AbortController` a mano y no cancela la petición principal
- **Archivo**: `frontend/src/views/TreesListView.vue`, líneas ~49–114.
- **Síntoma**: el componente crea y aborta `thumbLoadAbort` manualmente para las miniaturas, mientras el proyecto dispone de `useAbortableRequest` (ver `frontend/src/composables/useAbortableRequest.ts`) con ese patrón listo y documentado en el [README del frontend](../../frontend/README.md). Peor aún: `fetchPublicTrees` **no** cancela la petición anterior, así que si el usuario edita filtros rápido, pueden llegar respuestas fuera de orden y pisar el estado (race condition clásica de listados filtrables).
- **Riesgo**: UX incorrecta bajo latencias normales de móvil; regresión de comportamiento respecto a la recomendación del propio proyecto (`HU-007/HU-008`).
- **Fix recomendado**: migrar tanto la carga del listado como la de miniaturas a `runWithAbort` y delegar el ciclo de vida en el composable.
### [ALTA] A6 — Router guard decodifica el `access_token` en cliente sin explicitar que es solo UX
- **Archivo**: `frontend/src/router/index.ts`, funciones `decodeJwtPayload`, `extractTokenRoles`, `hasRequiredRole`.
- **Síntoma**: el guard combina reclamos de `user.profile` con los del `access_token` descodificados en cliente mediante `atob`. No se valida firma (imposible en el navegador) y no se documenta que este check es puramente de UX: el backend (gateway + microservicio) siempre revalida.
- **Riesgo**: invita a que un futuro refactor confíe en esa decodificación para algo más sensible (p. ej. feature flags críticas). Al sumar reclamos de dos orígenes enmascara configuraciones de Keycloak incorrectas (por ejemplo, omitir `realm_access.roles` del scope `profile` sin que nadie lo note) y se acopla con [C1] en la duplicación con la store.
- **Fix recomendado**: junto con C1, centralizar en `jwtRoles.ts` una única función con un **comentario explícito** (“decodificación *no verificada* del access token; solo para optimizar UX, la autorización real la aplica el backend”) y preferir `user.profile` con fallback al token.
## Otros puntos detectados (no incluidos en este corte por estar por debajo del umbral)
- `useAuth()` dispara `authStore.initAuthState()` como efecto colateral en cada invocación (idempotente pero acopla inicialización a consumo).
- `oidc-client-ts` usa `localStorage` para tokens — recogido por la excepción de la regla pero conviene evaluar `InMemoryWebStorage` + silent renew por iframe en producción, y añadir CSP estricta en el reverse-proxy.
- `apiFetch` general no tiene timeout de red (solo el PUT a object storage lo tiene).
- Leaflet se empaqueta por import estático (se resuelve con A1 al aplicar code-splitting).
Estos quedan documentados para seguimiento pero fuera del alcance de este corte (severidad media/baja).
## Referencias
- Reglas: [`fronted-vue3.mdc`](../../.cursor/rules/fronted-vue3.mdc), [`frontend-security.mdc`](../../.cursor/rules/frontend-security.mdc), [`frontend-ux.mdc`](../../.cursor/rules/frontend-ux.mdc).
- Revisiones previas: [2026-04-25 (primera)](./2026-04-25-frontend-architecture-review.md), [2026-04-25 (segunda)](./2026-04-25-frontend-architecture-second-review.md).
- Guía de tests frontend: [testing-frontend.md](../engineering/testing-frontend.md).
Cuando cambies a modo Agent, dímelo y lo creo directamente en esa ruta. ¿Quieres que además añada una sección de plan de acción con orden sugerido de ataque (p. ej. C1 → A2 → A1 → resto)?