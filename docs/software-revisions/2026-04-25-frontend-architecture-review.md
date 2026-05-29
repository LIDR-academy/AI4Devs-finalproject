# Revisión de arquitectura y diseño – `frontend/`

- **Fecha**: 2026-04-25
- **Ámbito**: `frontend/` (Vue 3 + Vite + TypeScript); hallazgos iniciales 2026-04-25; estado del código en la tabla *Estado de los 12 hallazgos* (más abajo).
- **Revisor**: Asistente IA (perfil: experto frontend Vue)
- **Estado**: Borrador con seguimiento de implementación (tabla de estado de los 12 hallazgos más abajo)

> **Nota (2026-05):** snapshot anterior a [ADR-0006](../adr/0006-ejemplar-nomenclature-contracts.md); rutas actuales de la SPA usan `/ejemplares`, `/mis-ejemplares`, etc.

## Resumen ejecutivo

Hallazgos del primer corte del `frontend/`; el **estado frente al código** está en la tabla *Estado de los 12 hallazgos* (siguiente sección). Las secciones numeradas 1–12 conservan el análisis original y el plan de mejora propuesto.

## Estado de los 12 hallazgos (seguimiento)

Tabla de seguimiento respecto a las secciones numeradas **1–12** de este documento (Críticos §1–§5 e Importancia alta §6–§12). Actualizada tras la implementación del plan de mejora en el código de `frontend/` (2026-04-26).

| # | Hallazgo (resumen) | Estado | Notas |
|---|-------------------|--------|--------|
| 1 | `useAuth` sin reactividad real / sin eventos OIDC | Resuelto | Pinia `stores/auth.ts`, `subscribeAuthEvents` en `oidc.ts`, `isAuthenticated` como `computed`. *Matiz*: la suscripción se monta en `initAuthState()` al primer `useAuth()`; conviene inicializar la store una vez en `main.ts` o `App.vue` para no perder `userLoaded` en `/auth/callback`. |
| 2 | Capa HTTP sin refresh / mezcla de responsabilidades | Resuelto | `automaticSilentRenew: true`, `signinSilent()`, reintento único ante 401, `NetworkError` y `HttpError`, mensajes fuera del cliente (`useApiErrorMapper`). *Matiz*: si falla el silent renew y se llama a `login()`, el flujo puede seguir y lanzar `HttpError(401)` antes del redirect; conviene cortar el flujo tras iniciar login interactivo. |
| 3 | Composables con demasiadas responsabilidades | Resuelto | `createTreeFormValidation.ts` (validación pura + tests), `useApiErrorMapper.ts`, `useCreateTreeForm.ts` solo orquesta; redirect de login centralizado en capa HTTP/guard, no en el composable de la vista. |
| 4 | `main.ts` con `await` top-level bloqueante | Resuelto | Montaje inmediato de la app; `isReady` en la store / `HomeView` para el primer paint y botones deshabilitados mientras inicializa auth. |
| 5 | Router guard sin silent refresh ni manejo de error | Resuelto | `trySilentRefreshWithTimeout`, degradación a `login()`, vista `AuthGuardErrorView` con CTA. *Matiz*: timeout de 800 ms puede ser corto en producción; valorar subirlo o no competir con `Promise.race` contra el iframe de Keycloak. |
| 6 | Restos del scaffold de Vite | Resuelto | Eliminados `HelloWorld`, assets de ejemplo, `public/icons.svg` y CSS heredado del template; `public/` reducido a lo necesario (p. ej. favicon). |
| 7 | `apiClient` insuficiente para el roadmap | Resuelto | Opción `query`, `AbortSignal`, `Content-Type` condicional (no forzado con `FormData`), errores tipados sin copy de UI en el cliente. |
| 8 | Sin alias de paths `@/` | Resuelto | Alias en `vite.config.ts` y `tsconfig.app.json`; imports internos con `@/`. |
| 9 | CSS global a nivel de elemento | Parcial | Tokens y utilidades `.form-label`, `.form-control`, `.form-textarea` en `CreateTreeView`. Pendiente la sub-recomendación de componentes reutilizables (`<TextField>`, `<SelectField>`, `<FormActions>`). |
| 10 | Sin gestión de estado central | Resuelto | Pinia registrada en `main.ts`; `useAuthStore` y `useAuth` como fachada. |
| 11 | Sin tests frontend | Resuelto (mínimo) | Vitest + jsdom; tests en `createTreeFormValidation.test.ts` y `apiClient.test.ts` (Problem Details + `AbortError`). El plan original citaba validación vía `useCreateTreeForm`; la cobertura equivalente está en el módulo de validación pura. |
| 12 | i18n: tipado y carga | Parcial | `es` con `as const` + `MessageSchema`, augmentation en `i18n/types.d.ts`, andamiaje `loadLocaleMessages`. Lazy load real para un segundo idioma pendiente (p. ej. `import()` dinámico de `en`). |

**Resumen**: nueve hallazgos quedan cubiertos sin reservas importantes; dos (§9 y §12) tienen sub-recomendaciones accesorias pendientes; §1, §2 y §5 llevan matices de endurecimiento documentados en la columna *Notas*.

---

## Críticos (resolver pronto)

### 1. `useAuth` con estado module-singleton sin reactividad real
- **Archivo**: `frontend/src/composables/useAuth.ts`
- **Síntoma**: `currentUser` / `isLoading` viven como `ref` a nivel de módulo. La UI solo se entera del cambio si alguna vista llama explícitamente a `refreshUser()` (hoy lo hace `HomeView`). Cualquier vista futura que dependa de la sesión la verá desincronizada.
- **Adicional**: `isAuthenticated()` es un método, no un `computed`, así que no reacciona en plantilla de forma garantizada.
- **Causa raíz**: no hay suscripción a los eventos del `UserManager` (`addUserLoaded`, `addUserUnloaded`, `addAccessTokenExpired`, `addSilentRenewError`).
- **Recomendación**:
  - mover el estado de sesión a un store (Pinia o composable inicializado una sola vez en `main.ts`)
  - registrar listeners del `UserManager` para mantener `currentUser` siempre fresco
  - exponer `isAuthenticated` como `computed`

### 2. La capa HTTP no refresca tokens y mezcla responsabilidades
- **Archivo**: `frontend/src/services/http/apiClient.ts`
- **Síntoma**: `automaticSilentRenew: false` en `oidc-client-ts` y no hay `signinSilent()`. Tras la expiración del access token (5–15 min), todas las llamadas devuelven 401 y la UX cae en un re-login completo.
- **Otra fuga**: la decisión “401 → redirigir a login” vive a la vez en `apiClient` (no la implementa) y en `useCreateTreeForm` (sí la implementa). Acabará duplicada en cada composable que llame a la API.
- **Otra fuga**: el cliente HTTP devuelve **copy en español** (“No se pudo conectar con el gateway…”). La traducción debe estar en la capa UX, no en el transport.
- **Recomendación**:
  - activar `automaticSilentRenew: true` y/o `signinSilent()` ante 401 con un único reintento
  - centralizar manejo de 401 en el cliente (interceptor) y notificar a la sesión
  - separar tipos: `NetworkError` vs `HttpError(status, problem)` (evitar el “magic number” `status === 0`)
  - mover los mensajes a i18n; el cliente lanza errores tipados, no copy

### 3. Composables con demasiadas responsabilidades
- **Archivo**: `frontend/src/composables/useCreateTreeForm.ts`
- **Síntoma**: el composable hace, todo a la vez:
  - validación
  - transformación al DTO
  - llamada API
  - traducción de mensajes (`useI18n` dentro)
  - decisión y disparo de redirect a Keycloak (`authService.login`)
  - estado UX (`submitError`, `submitSuccess`, `fieldErrors`)
- **Consecuencia**: difícil de testear (acoplado a `oidc-client-ts`, `vue-i18n` y `fetch`) y difícil de reusar en otras pantallas.
- **Recomendación**:
  - `useFormValidation` (puro, sin i18n)
  - `useApiErrorMapper` (i18n + Problem Details → texto)
  - el composable de la vista solo orquesta
  - el redirect a login lo dispara una capa global (interceptor / guard)

### 4. `main.ts` con `await` top-level bloqueante
- **Archivo**: `frontend/src/main.ts`
- **Síntoma**: `await bootstrapAuth()` antes de montar la app retrasa el primer paint y, si lanza (problemas de `localStorage`, navegador en modo privado, etc.), el usuario ve **página en blanco sin error**.
- **Recomendación**:
  - montar la app sin esperar
  - exponer `auth.ready` como estado consumible por las primeras vistas

### 5. Router guard sin silent refresh ni manejo de error
- **Archivo**: `frontend/src/router/index.ts`
- **Síntoma**: solo comprueba `user.expired`. No intenta `signinSilent`. Si `getUser()` lanza (Keycloak caído), bloquea la navegación con `return false` y deja al usuario en pantalla vacía.
- **Recomendación**:
  - intento de silent refresh antes de redirigir
  - fallback explícito a una vista de error con mensaje y CTA de reintento

---

## Importancia alta

### 6. Restos del scaffold de Vite que no se usan
- **Archivos**:
  - `frontend/src/components/HelloWorld.vue`
  - `frontend/src/assets/vite.svg`, `vue.svg`, `hero.png`
  - `frontend/public/icons.svg`
  - reglas heredadas en `frontend/src/style.css` (`#center`, `#next-steps`, `.hero`, `.ticks`, `.button-icon`, …)
- **Riesgo**: ruido en el bundle, simulan estructura inexistente, ensucian las próximas búsquedas.
- **Recomendación**: limpieza inmediata, antes de que crezca el front.

### 7. `apiClient` insuficiente para el roadmap
- **Archivo**: `frontend/src/services/http/apiClient.ts`
- **Carencias**:
  - no abstrae query params
  - no soporta `AbortController` (cancelación en navegación / búsqueda incremental)
  - fija `Content-Type: application/json` siempre → romperá `multipart/form-data` cuando entre HU-006 (fotos)
  - mezcla copy con transporte (ver §2)
- **Recomendación**: refactor mínimo para query params, cancelación y omitir `Content-Type` cuando el body sea `FormData`.

### 8. Sin alias de paths (`@/...`)
- **Archivos**: todos los imports son relativos (`'../../types/api'`).
- **Riesgo**: fragilidad creciente en cuanto se añadan más vistas/composables. Refactors costosos.
- **Recomendación**: configurar `@` → `src/` en `tsconfig.app.json` y `vite.config.ts`.

### 9. CSS global con muchas reglas a nivel de elemento
- **Archivo**: `frontend/src/style.css`
- **Síntoma**: estilos sobre `input`, `select`, `textarea`, `label` a nivel global. Funciona para una vista, pero colisiona con cualquier librería de UI futura.
- **Recomendación**:
  - mantener tokens en CSS vars (ya está)
  - mover el resto a clases utilitarias o componentes (`<TextField>`, `<SelectField>`, `<FormActions>`)

### 10. Sin gestión de estado central
- Para esta vista basta, pero ya hay tres cosas con estado compartido emergente: usuario, token, locale. Sin Pinia esto crecerá como singletons module-scoped (de hecho `useAuth` ya lo es).
- **Recomendación**: introducir Pinia ahora, antes del listado/mapa.

### 11. Sin tests frontend
- Cero tests; el formulario ya concentra validación + mapeo + i18n.
- **Recomendación**: añadir Vitest + dos tests mínimos:
  - `useCreateTreeForm` (validación)
  - `apiClient` (mapeo de Problem Details)

### 12. i18n: tipado y carga
- **Archivo**: `frontend/src/i18n/index.ts`
- **Carencias**:
  - sin tipado fuerte de claves (riesgo de typos sin error en build)
  - solo carga `es` síncronamente; cuando entre `en` faltará `lazy-load`
- **Recomendación**:
  - declarar `messages` con `as const` y derivar el tipo
  - preparar slot para carga perezosa por idioma

---

## Importancia media (registrar, no bloquea)

- `HomeView.vue` y otras vistas siempre llaman `auth.refreshUser()` en `onMounted`. Con `useAuth` reactivo via eventos OIDC, este boilerplate desaparece.
- Botón “Iniciar sesión” redirige siempre a `/trees/new` (hardcoded). Mejor parametrizar con la ruta original o ir a `/`.
- `apiClient` lanza `ApiError(status=0)` para errores de red. Idea OK, pero conviene separar `NetworkError` y `HttpError`.
- `useCreateTreeForm` no resetea el formulario tras éxito. UX a decidir: ¿reset?, ¿navegar al detalle?
- Falta una región fija con `aria-live` para errores globales (hoy se usa `role="alert"` por elemento, lo cual recrea el nodo).
- `CreateTreeView.vue` mezcla varios estados (cargando masters, hay masters, error, formulario). Un wrapper `LoadingError` o un patrón `useAsyncState` mejoraría legibilidad.

---

## Plan de mejora propuesto (por orden de impacto)

1. **Reorganizar autenticación**
   - introducir Pinia `useAuthStore`
   - registrar listeners del `UserManager`
   - activar `automaticSilentRenew: true`
   - exponer `isAuthenticated` como `computed`
2. **Centralizar la capa HTTP**
   - separar `NetworkError` y `HttpError(status, problem)`
   - interceptor 401 con silent refresh + reintento
   - quitar copy del cliente HTTP (delegar en mapper UX)
   - soportar `FormData` y `AbortController`
3. **Limpieza scaffold**
   - eliminar `HelloWorld.vue`, `assets/*`, `public/icons.svg`, CSS heredado en `style.css`
4. **Alias `@/` en `tsconfig.app.json` + `vite.config.ts`**
5. **Mínimo set de tests con Vitest**
   - `useCreateTreeForm` (validación)
   - `apiClient` (Problem Details)
6. **i18n**: tipado de claves y preparar slot para `en`
7. **Componentes de formulario reutilizables** (`<TextField>`, `<SelectField>`, `<FormActions>`)

> Sugerencia: encadenar 1–4 en una sola pasada (es lo de mayor impacto y desbloquea el resto del frontend antes de HU-006/HU-007).

---

## Anexo: archivos referenciados

- `frontend/src/main.ts`
- `frontend/src/App.vue`
- `frontend/src/router/index.ts`
- `frontend/src/services/auth/oidc.ts`
- `frontend/src/services/http/apiClient.ts`
- `frontend/src/services/catalog/catalogService.ts`
- `frontend/src/services/config.ts`
- `frontend/src/composables/useAuth.ts`
- `frontend/src/composables/useCreateTreeForm.ts`
- `frontend/src/views/HomeView.vue`
- `frontend/src/views/LoginView.vue`
- `frontend/src/views/AuthCallbackView.vue`
- `frontend/src/views/CreateTreeView.vue`
- `frontend/src/style.css`
- `frontend/src/i18n/index.ts`
- `frontend/src/i18n/locales/es.ts`
- `frontend/src/components/HelloWorld.vue` (residual)
- `frontend/src/assets/*` (residual)
- `frontend/public/icons.svg` (residual)
