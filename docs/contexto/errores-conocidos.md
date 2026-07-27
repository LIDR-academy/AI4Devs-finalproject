# Errores conocidos y gotchas

## Backend

### DuplicateKeyError en project_files al crear rama
- **Sintoma:** `DuplicateKeyError` al hacer deep-copy de archivos entre branches.
- **Causa:** El indice unico original en `project_files` no inclua `branch_id`.
- **Fix:** Commit `0a47cce` — el indice unico ahora es `project_id+branch_id+parent_id+name`.
- **Prevencion:** Siempre incluir `branch_id` en operaciones sobre `project_files`.

### HTTPException debe capturarse primero en try/except
- **Sintoma:** Errores HTTP custom se convierten en 500 genericos.
- **Causa:** `except Exception` captura `HTTPException` antes de que FastAPI la maneje.
- **Regla:** Siempre `except HTTPException: raise` antes de `except Exception:` (ver team memory "except HTTPException pattern").

### Campos de MongoDB pueden no existir (KeyError)
- **Sintoma:** `KeyError` al acceder a `doc["campo"]` cuando el campo no fue guardado en documentos antiguos.
- **Patron seguro:** Usar `.get("campo", default)` o helper `_safe_get_id()`. Ver team memory "Defensive field validation".
- **Lugares criticos:** cualquier codigo que lea documentos creados antes de que se anadiera un campo nuevo.

### SAML requiere certificados en certs/
- **Sintoma:** Error al iniciar SAML SSO si no existe el directorio `certs/`.
- **Estado:** [PENDIENTE: verificar si certs/ ya existe en el repo o solo en produccion]
- **Nota:** `python3-saml` es sincrono y se ejecuta en ThreadPoolExecutor.

### Llamadas LLM bloquean el event loop si no usan to_thread
- **Sintoma:** Timeouts o requests lentos durante generacion AI.
- **Causa:** Los SDKs de openai y httpx son sincronos. Si se llaman sin `asyncio.to_thread()`, bloquean el event loop de FastAPI.
- **Verificacion:** Todas las llamadas `_call_deepseek()`, `_call_minimax()`, `_call_mimo()` usan `asyncio.to_thread()`.

### Cache Redis es best-effort (no critico)
- **Sintoma:** Si Redis no esta disponible, el servidor funciona igual con cache en memoria.
- **Limitacion:** `invalidate()` solo limpia L1 (memoria), NO Redis. Si hay multiples instancias, la invalidacion no se propaga entre ellas.
- **Impacto:** Stale cache en instancias secundarias hasta que expire el TTL.

### Indice TTL en landing_events
- **Sintoma:** La coleccion `landing_events` tiene TTL de 90 dias en el campo `ts`.
- **Nota:** Si cambias el campo de timestamp, el TTL deja de funcionar.

### Migraciones en startup pueden impedir el arranque
- **Sintoma:** El servidor no arranca si una migracion en `@app.on_event("startup")` falla.
- **Prevencion:** Todas las migraciones deben ser idempotentes (verificar estado antes de modificar).
- **Debug:** Revisa logs en `backend/logs/app.log`.

### .env del backend contiene credenciales reales
- **Riesgo:** API keys de Stripe, Google OAuth, Resend en texto plano en `.env`.
- **Regla:** NUNCA commitear `.env`. Esta en `.gitignore`.
- **Relacionado:** El backup de MongoDB usa `.env` via cron, no via supervisor (ver team memory "Backup .env drift").

## Frontend

### ESLint warnings: exhaustive-deps
- **Sintoma:** Multiples warnings de `react-hooks/exhaustive-deps` en build de produccion.
- **Archivos afectados:** AnalyticsDialog, FilePreviewPanel, ProjectTree, SimulatorDialog, UMLDialog, ValidationDialog, AdminUsersPage, BpmnComponentsLibrary, DiagramsLibrary, ProjectDetailPage, LandingPage.
- **Estado:** No criticos (warnings, no errores). Build continua.
- **Deuda tecnica:** [PENDIENTE: plan para limpiar estos warnings]

### Warnings de source maps en dompurify
- **Sintoma:** `Failed to parse source map from .../dompurify/src/attrs.ts` durante build.
- **Causa:** Source maps de dependencia apuntan a archivos TypeScript no incluidos en el paquete npm.
- **Impacto:** Solo cosmetico, no afecta funcionalidad.

### authHeaders() duplicada entre paginas
- **Sintoma:** Cada pagina define su propia funcion `authHeaders()` o `getToken()` inline.
- **Riesgo:** Inconsistencia si una pagina usa solo localStorage y otra solo cookies.
- **Regla:** Usar ambas fuentes (cookie primero, localStorage fallback) como en ProtectedRoute.
- **Deuda tecnica:** [PENDIENTE: crear hook useApi() compartido]

### downloadFile en iframe sandbox
- **Sintoma:** Descargas no funcionan dentro de iframes con `sandbox` attribute.
- **Handling:** `downloadFile.js` muestra modal instructivo si detecta que esta en sandboxed iframe.
- **Workaround:** Auto-apendiza `session_token` como query param a URLs para preservar autenticacion.

### Props drilling de autenticacion
- **Sintoma:** `ProtectedRoute`, `AdminRoute`, y `PublicRoute` pasan `user` como `location.state.user` entre rutas.
- **Riesgo:** Si el usuario refresca la pagina en una ruta protegida, `location.state` se pierde y hay que revalidar el token.
- **Handling:** Cada ruta protegida re-valida el token si `location.state.user` no esta disponible.

### Babel plugin de visual-edits solo en dev
- **Sintoma:** `craco.config.js` carga plugins de `visual-edits/` solo cuando `process.env.NODE_ENV !== "production"`.
- **Impacto:** Si necesitas debuggear visual-edits en build de prod, no funciona.

## Base de datos

### No hay transacciones multi-documento
- **Riesgo:** Operaciones que modifican multiples colecciones pueden quedar en estado inconsistente si fallan a medio camino.
- **Ejemplo:** Crear un `ProjectBranch` + copiar `ProjectFileNode`s + actualizar `Project.active_branch_id`.
- **Mitigacion:** El codigo hace las operaciones en orden (crear primero, luego referenciar) para minimizar la ventana de inconsistencia.

### Sesiones huerfanas
- **Sintoma:** `session_token` en cookie/localStorage pero la sesion fue borrada de BD (single-device policy).
- **Handling:** `get_current_user()` retorna None -> frontend redirige a login.

### Admin emails en .env falso
- **Contexto:** Bug historico donde `ADMIN_EMAILS` tenia valor placeholder que no coincidia con usuarios reales (ver team memory "Known server bugs").
- **Estado:** Resuelto.
- **Regla:** Verificar que `ADMIN_EMAILS` contenga emails reales de administradores.

## Infraestructura

### El backup MongoDB usa .env via cron
- **Riesgo:** Si cambias `MONGO_URL` en `.env` pero el cron job tiene la ruta antigua, el backup falla silenciosamente.
- **Regla:** Mantener `.env` sincronizado entre supervisor y cron (ver team memory "Backup .env drift").

### update.sh usa git pull, no git fetch + checkout
- **Riesgo:** Si hay cambios locales en el servidor (ej. archivos creados por linter/forks), `git pull` puede fallar.
- **Handling:** `update.sh` hace `git stash` antes del pull.
- **Origen del problema:** Linter o forks crean archivos en el servidor que no estan sincronizados al repo local (ver team memory "Server file sync drift").

### Token de GitHub en update.sh (resuelto 2026-07-20)
- **Sintoma:** `update.sh` fallaba con "Invalid username or token" al hacer fetch.
- **Causa:** El script tenia hardcodeado un PAT (`ghp_...`) expirado y sobrescribia la remote en cada ejecucion.
- **Fix:** El token hardcodeado se elimino del script; ahora solo sobrescribe la remote si se pasa `GITHUB_TOKEN` por entorno. La remote del servidor y `~/.git-credentials` usan el token actual del gestor de credenciales local.
- **Regla:** Si vuelve a fallar la autenticacion, actualizar el token en la remote del servidor: `git remote set-url origin https://thorpette:<TOKEN>@github.com/thorpette/bpmnoo.git` y en `/home/ubuntu/.git-credentials`.
