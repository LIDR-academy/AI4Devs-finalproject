> **Archivo histórico:** no actualizar el cuerpo de este informe; las rutas citadas (`/trees/new`, `CreateTreeView` en contexto antiguo, etc.) corresponden al momento de la revisión. **Referencia actual:** [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md) — SPA en `/ejemplares/new`, `/mis-ejemplares`, …; módulos en inglés técnico con prefijo **Tree** (`CreateTreeView`, `treePhotoUploadSequence`, …). Ver [naming-conventions.md](../engineering/naming-conventions.md).

1. La store de Pinia se inicializa de forma perezosa → se pueden perder eventos OIDC
En frontend/src/composables/useAuth.ts la suscripción a userLoaded/userUnloaded/accessTokenExpired/silentRenewError ocurre dentro de initAuthState(), y solo se ejecuta la primera vez que un componente hace useAuth().


useAuth.ts
Lines 5-18
export function useAuth() {
  const authStore = useAuthStore()
  authStore.initAuthState()
  const { currentUser, isAuthenticated, isReady, isLoading } = storeToRefs(authStore)
  ...
Flujo problemático real:

Keycloak redirige a /auth/callback.
AuthCallbackView llama a authService.completeLogin() → signinRedirectCallback() emite userLoaded sin que nadie esté suscrito todavía (la store no se ha creado: ni AuthCallbackView ni CreateTreeView llaman a useAuth()).
router.replace('/trees/new') → guard pasa porque consulta authService.getUser() directamente desde storage.
La store sigue vacía hasta que el usuario vuelva a /, momento en que HomeView instancia useAuth() y bootstrappea. Entre medias, cualquier UI global (un futuro badge de "logueado como X" en App.vue/topbar) verá isAuthenticated = false aunque la sesión sea válida. Igual ocurre con accessTokenExpired durante un trabajo en /trees/new: nadie lo recibe.
Fix recomendado: instanciar y arrancar la store en main.ts justo después de app.use(createPinia()), o en App.vue. Mover la suscripción fuera del primer useAuth() consumidor.

2. signinSilent() no está protegido contra concurrencia
Si dos peticiones paralelas (p. ej. fetchSpecies + fetchProvinces en loadMasters) reciben 401 a la vez, en apiClient.ts se disparan dos signinSilent() simultáneos:


apiClient.ts
Lines 113-121
  if (response.status === 401 && !hasRetried401) {
    try {
      await authService.signinSilent()
      return requestWithAuthRetry<T>(path, init, true)
    } catch {
      const returnPath = `${globalThis.location.pathname}${globalThis.location.search}`
      await authService.login(returnPath)
    }
  }
oidc-client-ts puede lanzar errores tipo "Concurrent silent renew" o crear varios iframes y reintentos en cascada → en producción provoca login interactivo doble.

Fix: envolver signinSilent() con un singleton Promise<User|null> cacheada mientras esté in-flight (patrón "dedupe").

3. La rama 401 sigue lanzando HttpError aunque ya haya iniciado el login() interactivo
Mismo bloque anterior: cuando signinSilent falla, llamamos a await authService.login(returnPath) (que dispara signinRedirect), pero no se hace return ni throw. La ejecución cae al final de la función:


apiClient.ts
Lines 123-135
  if (response.ok) { ... }
  const problem = await parseProblem(response)
  throw new HttpError(response.status, problem)
→ El consumidor ve un HttpError(401) (y el useApiErrorMapper muestra "Tu sesión no es válida...") un instante antes de la redirección a Keycloak. En conexiones lentas el toast queda visible. Es un bug, no un detalle estético.

Fix: tras await authService.login(...) hacer return new Promise<T>(() => {}) o throw new Error('REDIRECTING_TO_LOGIN') capturado de forma silenciosa por el mapper.

4. Tokens (access_token + refresh) en localStorage → XSS = robo de sesión

oidc.ts
Lines 15-15
  userStore: new WebStorageStateStore({ store: globalThis.localStorage }),
Para una SPA pública con Keycloak es la decisión más arriesgada del proyecto. Cualquier XSS (incluida una dependencia comprometida) puede leer el access_token y suplantar al usuario. No hay CSP ni headers de mitigación documentados.

Fix mínimo: mover a sessionStorage (limita a la pestaña), añadir CSP estricta en el reverse-proxy del front, y/o evaluar el patrón BFF (token solo en backend, cookie HttpOnly desde el gateway).

5. AuthCallbackView navega antes de garantizar que la store esté sincronizada

AuthCallbackView.vue
Lines 11-19
onMounted(async () => {
  try {
    const user = await authService.completeLogin()
    const returnPath = (user.state as { returnPath?: string } | null)?.returnPath ?? '/trees/new'
    await router.replace(returnPath)
  } catch {
    errorMessage.value = t('authCallback.error')
  }
})
Combinado con (1), la sesión "queda en el aire". Además: si el usuario abre directamente /auth/callback (refresh, deep link viejo, error de back), completeLogin() lanza, mostramos un error genérico y se queda atascado: no hay botón de "volver a iniciar sesión". Esto bloquea al usuario en una pantalla muerta.

Fix: instanciar useAuth() aquí (así garantizamos suscripción a eventos antes del signinRedirectCallback interno), y añadir un CTA de recuperación en el catch.

6. No hay manejador global de errores ni de promesas no controladas
main.ts no define app.config.errorHandler ni se escucha window.addEventListener('unhandledrejection', ...):


main.ts
Lines 1-11
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/style.css'
import App from '@/App.vue'
import router from '@/router'
import { i18n, initializeI18n } from '@/i18n'
void initializeI18n()
createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
Cualquier error en un onMounted, en una guard, o en una promesa no awaitada (p. ej. void initializeI18n()) muere en silencio en consola y deja al usuario sin feedback ni telemetría. Para una app que delega tanto en flujos asíncronos (OIDC, fetch, silent renew) esto es crítico.

Fix: registrar app.config.errorHandler (logging + UI fallback) y globalThis.addEventListener('unhandledrejection', ...).

7. Timeout de 800 ms en el silent renew del router guard

index.ts
Lines 9-26
async function trySilentRefreshWithTimeout(timeoutMs = 800) {
  ...
  const refreshedUser = await Promise.race([
    authService.signinSilent(),
    timeoutPromise,
  ])
Un signinSilent real con iframe contra Keycloak rara vez termina en 800 ms en producción (DNS, TLS, cookies de SSO, latencia 4G…). El guard degradará casi siempre a login interactivo, anulando el beneficio del silent renew y produciendo redirecciones innecesarias.

Fix: subir a 3–5 s o, mejor, no usar Promise.race y cancelar con AbortController ligado al UserManager. Y/o confiar en que automaticSilentRenew ya está activo y eliminar este atajo.

8. Doble entrada de apiClient no aborta tareas en vuelo del primer intento
requestWithAuthRetry reentra recursivamente con el mismo init (mismo signal) tras el silent renew. Si el consumidor ya canceló (tab cambia, componente desmonta), el segundo fetch se dispara igualmente porque entre signinSilent y la recursión no se comprueba signal.aborted. Resultado: peticiones zombies con tokens nuevos a endpoints que el usuario ya no quiere consultar.

Fix: comprobar init.signal?.aborted antes de reintentar y lanzar AbortError si está abortado.

Otras de menor severidad (las menciono solo para contexto, no las cuento como críticas)
loadedLocales ya contiene 'es' antes de initializeI18n, por lo que el "lazy loading" no carga nada; la infraestructura es decorativa.
vite.config.ts hardcodea http://localhost:8080 para /api; debería leerse de un env de Vite para entornos de dev/staging.
useAuthStore expone login: authService.login y logout: authService.logout como acciones; funciona porque no usan this, pero en Pinia es preferible envolverlas en una función propia para poder loggear/intercept.
Prioridad sugerida
#1 + #5 (sincronizar store y AuthCallback) — el flujo de login es frágil por diseño.
#3 + #2 (rama 401 del apiClient) — bug visible y race en producción.
#4 (storage del token) — riesgo de seguridad.
#6 (error handler global) — diagnóstico y UX en fallos.
#7 + #8 (router guard y aborts) — pulido del flujo OIDC.
Si quieres, abordo el #1+#5 en un único PR (mover initAuthState() a main.ts y endurecer AuthCallbackView), o el #3+#2 (refactor del apiClient con dedupe de signinSilent y retorno correcto tras login()). Indícame por cuál arrancamos.