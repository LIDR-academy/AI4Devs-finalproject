# 🧭 Reglas de Routing (`react-router-dom` 7) — Deducción de Especificaciones

> Generado por `SK-27` a partir de la documentación oficial `reactrouter.com` (Guard 34,
> fuente confirmada por el humano en `US-023`). Aplica a `apps/frontend`.
> Stack: `react-router-dom@7.18.3` (data router), React 18, Vite 5 — ver
> [`docs/00_stack_manifest.md`](../../00_stack_manifest.md) §4.

---

## 1. Data Router obligatorio (`createBrowserRouter` + `RouterProvider`)

* **DEBE** definirse un único árbol de rutas con `createBrowserRouter([...])` en
  [`apps/frontend/src/app/router.tsx`](../../../apps/frontend/src/app/router.tsx) y montarse
  con `<RouterProvider router={router} />` en `App.tsx`.
* **PROHIBIDO** `<BrowserRouter>` + `<Routes>`/`<Route>` (modo declarativo): el proyecto
  usa data router para tener disponibles `loader`/`action` a futuro sin re-arquitectura.
* **PROHIBIDO** `react-router` v8.x: su `peerDependencies.react` es `>=19` — incompatible
  con el React 18 pineado. Cualquier bump requiere aprobación humana (Guard 24).

## 2. Estructura de rutas

* La ruta raíz es una **layout route sin `path`** cuyo `element` es `<AppShell />`; sus
  hijas se renderizan en el `<Outlet />` de `AppShell`. **PROHIBIDO** el antipatrón
  `{ path: "", element: <Layout/> }` — se omite `path`, no se pone vacío.
* La pantalla por defecto es una **index route** (`{ index: true, element: <InventarioRoute/> }`).
  **PROHIBIDO** combinar `index: true` con `children` en la misma entrada.
* Ruta catch-all al final: `{ path: "*", element: <Navigate to="/" replace /> }`.
* El `createBrowserRouter` se instancia **una sola vez a nivel de módulo**, nunca dentro
  de un componente (evita recrear el router en cada render).

## 3. Guarda de acceso por rol (`<ProtectedRoute>`)

* Toda ruta restringida se envuelve en
  [`<ProtectedRoute requiredRole="ADMIN">`](../../../apps/frontend/src/app/ProtectedRoute.tsx)
  dentro de `router.tsx` — nunca con comprobaciones de rol dispersas dentro de cada pantalla.
* Un usuario autenticado sin el rol requerido se redirige con `<Navigate to="/" replace />`
  (`replace` evita dejar la ruta prohibida en el historial).
* La ausencia de sesión la resuelve `AppShell` (renderiza `PinLoginModal`), **no**
  `ProtectedRoute` — separación de responsabilidades: sesión en el shell, rol en la guarda.
* Rutas `ADMIN` actuales: `/reportes`, `/ajustes`. Alineación futura con `US-015`
  (Dynamic RBAC): la comparación `currentUser.role` pasará a consulta de permisos sin
  cambiar la forma del componente.

## 4. Navegación — SOLO APIs de react-router

* **DEBE** usarse `<Link>` / `<NavLink>` para navegación declarativa y `useNavigate()`
  para navegación imperativa (p. ej. `onClose` de un panel de ruta → `navigate('/')`).
* **PROHIBIDO** `window.location.assign/href`, `window.history.pushState/replaceState`
  y `<a href>` hacia rutas internas — rompen la navegación cliente. `<a href>` solo para
  destinos externos.
* Estado activo de la nav: `<NavLink className={({ isActive }) => ...}>` con la render-prop,
  nunca comparando `useLocation().pathname` a mano.
* La ruta index se marca con `end` en su `<NavLink to="/" end>` para que no quede activa
  en todas las sub-rutas.
* Lectura/escritura de query params (p. ej. `?resetToken=`) vía `useSearchParams()`,
  nunca parseando `window.location.search`.

## 5. Paso de contexto a rutas hijas

* Los datos de sesión (`currentUser`, `onLogout`, `reloadUser`) se inyectan desde
  `AppShell` vía `<Outlet context={...} />` y se consumen con el hook tipado
  `useAppShell()` ([`app/session.ts`](../../../apps/frontend/src/app/session.ts)) —
  **PROHIBIDO** prop-drilling de la sesión a través de cada `element` de ruta.
* `useAppShell()` lanza si se usa fuera del provider (fail-fast), nunca devuelve `null` silencioso.

## 6. Operaciones transitorias siguen siendo modales

* Extracción de bodega, selección de receta, conciliación de turno y descarte **NO son
  rutas** — son modales (`isOpen`/`onClose`) lanzados desde el `element` de su ruta padre
  (decisión de negocio `US-023` Pregunta 5). No crear rutas `/extraer`, `/descartar`, etc.

## 7. Tests

* Los tests que renderizan `<App />` funcionan tal cual porque `createBrowserRouter` opera
  sobre el `location` de jsdom (URL inicial `/` → index route) para el **render inicial**.
* **Excepción documentada (jsdom + undici):** la **navegación** de un data router
  (`createMemoryRouter`/`createBrowserRouter`) **falla bajo jsdom** — react-router 7
  construye objetos `Request` con un `AbortSignal` de jsdom que `undici` rechaza
  (`"Expected signal to be an instance of AbortSignal"`, choque de realms). Por eso:
  * Un test de **estructura de shell / guardas / render de ruta** DEBE montar los
    componentes reales (`AppShell`, `ProtectedRoute`, `routes/*`) dentro de un
    `<MemoryRouter initialEntries=[...]>` + `<Routes>`/`<Route>` **declarativo** —
    ahí `<Navigate>` y la navegación por `<NavLink>` sí funcionan. Es la única
    situación en que se permite el modo declarativo (la prohibición de §1 aplica al
    **código de aplicación**, no a estos tests).
  * Un test que necesite ejercitar la **navegación imperativa del data router real**
    se marca `it.skip` con enlace a este párrafo hasta que se resuelva a nivel de
    entorno (shim de `AbortController`/`AbortSignal` nativos en `src/test/setup.ts`).
  * **PROHIBIDO** mutar `window.history` directamente en un test.
* Un smoke test DEBE importar el `router` real de `app/router.tsx` y verificar al menos
  la forma del árbol (paths declarados y qué rutas están tras `<ProtectedRoute>`), para
  que un drift en `router.tsx` no quede sin cobertura.
* **PROHIBIDO** `loader`/`action` que invoquen servicios sin validación Zod de sus
  `params`/`request` (Guard 8, Untrusted Context) — hoy el proyecto no usa ninguno;
  cuando se añadan, la entrada se parsea con Zod antes de tocar red.
