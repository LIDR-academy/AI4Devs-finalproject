# US-010: Visor 3D Web (PROPUESTA ENRIQUECIDA)

**User Story:** Como **Responsable de Taller**, quiero visualizar la pieza 3D asignada directamente en el navegador, para poder rotarla, hacer zoom y entender su geometría sin instalar software CAD.

**Valoración Original:** 8 Story Points  
**Valoración Enriquecida:** **15 Story Points** (+7 SP de mejoras UX/Security/Performance)  
**Dependencias:** US-001 (Upload), US-005 (Dashboard 3D), US-002 (Validación geometría)

---

## CRITERIOS DE ACEPTACIÓN (ENRIQUECIDOS)

### ✅ Scenario 1 (Happy Path - Load Success)
**Given:** Una pieza con geometría procesada (`.glb` disponible en `blocks.low_poly_url`) y estado `validated`.  
**When:** Click en pieza del Dashboard 3D (o botón "Ver 3D" en lista).  
**Then:**
- Se abre modal fullscreen con visor 3D
- Modelo aparece centrado con iluminación neutra (ambient 0.6 + directional 0.8)
- **OrbitControls activos:** Rotate (left-drag), Zoom (scroll), Pan (right-drag)
- **Performance:** >60 FPS desktop, >30 FPS mobile, <2s load time
- **Metadata sidebar** (colapsable): `iso_code`, status badge coloreado, workshop, volumen, área, bbox
- **Toolbar:** Reset camera 🔄, Snapshot 📸, Fullscreen ⛶
- **Footer:** Prev/Next buttons (navegación sin cerrar modal), counter "Pieza X de Y"
- **Keyboard shortcuts:** `R` reset, `F` fullscreen, `←/→` prev/next, `ESC` close
- **ARIA:** Modal tiene `role="dialog"`, `aria-label="Visor 3D de {iso_code}"`, focus trap

### ⚠️ Scenario 2 (Edge Case - Model Not Found)
**Given:** Pieza con estado `processing` (geometría aún no generada, `low_poly_url IS NULL`).  
**When:** Intento abrir visor.  
**Then:**
- Modal se abre con **BBox wireframe** gris (reutilizando `BBoxProxy.tsx` de T-0507)
- Overlay centrado: Spinner + mensaje "⏳ Geometría en procesamiento..."
- Botón "Cerrar" disponible (no bloqueo)
- **Backend:** Endpoint retorna HTTP 200 con `glb_url: null`, frontend maneja gracefully
- **NO mostrar error** (es estado esperado, no fallo)

### 🔴 Scenario 3 (Error Handling - Load Fail)
**Given:** URL de GLB es 404, 403 (expirada), o archivo corrupto (Draco decode fail).  
**When:** `useGLTF` arroja error.  
**Then:**
- **React Error Boundary** captura excepción
- Fallback UI: ⚠️ "No se pudo cargar la geometría 3D. Por favor, intenta más tarde."
- Botón "Reportar problema" (copia error + part_id al portapapeles)
- **Logging:** Enviar error a Sentry/Railway con stack trace + metadata (part_id, url, user_id)
- **NO pantalla blanca** (error controlado siempre)

### 🔒 Scenario 4 (Security - RLS Enforcement) **[NUEVO]**
**Given:** Usuario con `workshop_id = 'granollers'` intenta ver pieza con `workshop_id = 'sabadell'`.  
**When:** Request `GET /api/parts/{id}`.  
**Then:**
- Backend retorna **HTTP 403 Forbidden** con error `{ "detail": "No tienes permisos para ver esta pieza" }`
- Frontend muestra toast de error (no abre modal)
- Audit log registra intento de acceso no autorizado

### 🚀 Scenario 5 (Performance - Large Model) **[NUEVO]**
**Given:** Modelo GLB de 45 MB (pieza compleja con 500K triángulos).  
**When:** Inicio de carga.  
**Then:**
- **Progressive loading:** Mostrar low-poly proxy primero, cargar high-poly en background
- **Progress bar:** "Cargando geometría... 12.3 MB de 45 MB" (chunked download)
- **Timeout:** Si carga excede 30 segundos, mostrar error "El modelo es demasiado grande. Contacta a soporte."
- **Memory budget:** Si heap excede 200 MB, aplicar LOD automático (simplify mesh)

### 📱 Scenario 6 (Responsive - Mobile) **[NUEVO]**
**Given:** Usuario en tablet/móvil (viewport <768px).  
**When:** Abre visor.  
**Then:**
- Modal ocupa 100% viewport (fullscreen automático)
- **Touch gestures:** 1 finger rotate, 2 fingers zoom/pan
- Metadata sidebar se oculta por defecto (botón toggle `ℹ️` en toolbar)
- Toolbar colapsado (iconos sin texto)
- Performance target: >30 FPS, <5s load time

---

## DESGLOSE DE TICKETS TÉCNICOS (ENRIQUECIDO)

### Frontend

| ID | Título | Tech Spec | DoD | SP |
|----|--------|-----------|-----|-----|
| **T-040-FRONT** | **Viewer Canvas Component** | Componente `<PartViewer3D partId={id}>` reutilizable. **Reusa Canvas3D de T-0504** (no duplicar). `<Canvas>` con `camera={{ fov: 50, position: [5,5,5], near: 0.1, far: 1000 }}`. `<OrbitControls enableDamping dampingFactor={0.05} />`. Lighting: `<ambientLight intensity={0.6} />` + `<directionalLight position={[10,10,5]} intensity={0.8} />`. Grid opcional. | Canvas renderiza cubo de prueba rotable. Touch gestures funcionan en mobile. | **3 SP** |
| **T-041-FRONT** | **Model Loader & Stage** | Componente `<PartModel3D url={glbUrl} />` usando `useGLTF(url)` de `@react-three/drei`. Wrapper `<Suspense fallback={<LoadingSkeleton />}>` para async loading. **NO usar `<Stage>`** (conflicto con custom lighting de T-040). If `glbUrl === null`, renderizar `<BBoxProxy bbox={part.bbox} />` (reutilizar T-0507). Preload adjacent parts con `useGLTF.preload(adjacentUrls)` en background. | Carga modelo desde S3 presigned URL. Skeleton loader durante carga. BBox fallback si null. | **3 SP** |
| **T-042-FRONT** | **Error Boundary & Fallback** | `<ViewerErrorBoundary>` wrapper React Error Boundary. Captura errores de WebGL, Draco decode, network timeout. Fallback: `<ViewerError error={e} partId={id} onReport={copyToClipboard} />`. Timeout 30s: usar `setTimeout` en `useEffect` para cancelar carga lenta. WebGL detection: `const isWebGLAvailable = !!document.createElement('canvas').getContext('webgl2')`. | Tests: URL 404 muestra error, corrupted GLB muestra error, timeout 30s triggers fallback. No pantalla blanca nunca. | **2 SP** |
| **T-044-TEST-FRONT** ⭐ **[NUEVO]** | **3D Viewer Integration Tests** | Test suite `PartViewer3D.test.tsx` con Vitest. **Casos mínimos (15 tests):** <br>- Rendering: Canvas renderiza con partId válido (5 tests) <br>- Loading states: Suspense fallback, skeleton visible (3 tests) <br>- Error handling: 404, corrupted, timeout (3 tests) <br>- Controls: OrbitControls respond to mouse events (2 tests) <br>- Accessibility: ARIA labels, keyboard shortcuts (2 tests) <br>**Performance benchmark** (Chrome Puppeteer): Medir FPS con 1 modelo, assert >60 FPS. Mock useGLTF en setup.ts. | 15/15 tests passing. Cobertura >80% (PartViewer3D, PartModel3D, ViewerErrorBoundary). Performance test automated en CI/CD. | **2 SP** |
| **T-045-FRONT** ⭐ **[NUEVO]** | **Integrate Viewer into PartDetailModal** | Refactorizar `PartDetailModal.tsx` (T-0508) para incluir tabs: <br>1️⃣ **3D Viewer** (default): `<PartViewer3D>` <br>2️⃣ **Metadata**: Tabla con iso_code, status, tipologia, workshop, volumen, área <br>3️⃣ **Validation Report**: Reutilizar `<ValidationReportModal>` (T-032-FRONT) <br>Toolbar: Reset 🔄, Snapshot 📸, Fullscreen ⛶ (hooks: `useViewerControls`). Footer: Prev/Next buttons con `usePartNavigation({ currentId })`. Counter "Pieza X de Y". Keyboard: `←/→` navegar, `R` reset, `F` fullscreen. | Modal reusable. Tabs navegables con teclado (Arrow keys). Prev/Next funciona sin cerrar modal. Tests 10/10. | **3 SP** |
| **T-046-FRONT** ⭐ **[NUEVO]** | **Viewer Metadata Sidebar** | Componente `<ViewerMetadata part={part} />` colapsable (hook `useLocalStorage('viewer-metadata-collapsed')`). **Secciones:** <br>- Identificación: `iso_code`, status badge, tipologia, workshop <br>- Geometría: Volumen (m³), Área (m²), Peso estimado (kg formula) <br>- BBox: Dimensiones X × Y × Z (mm) <br>- Technical: Triangles, Vertices, File size GLB <br>Button "Copiar metadata" (export JSON a clipboard). Mobile: Sidebar → Bottom drawer (swipe up/down). | Sidebar renderiza con datos reales. Colapsa/expande. Copia metadata. Responsive mobile. Tests 8/8. | **1 SP** |

### Backend

| ID | Título | Tech Spec | DoD | SP |
|----|--------|-----------|-----|-----|
| **T-043-BACK** ⭐ **[ENRIQUECIDO]** | **Get Part Detail API** | **Nuevo endpoint:** `GET /api/parts/{id}` (singular, no reutilizar T-0501 lista). <br><br>**Service Layer:** `PartDetailService.get_part_detail(part_id: str, user_workshop_id: str) -> Tuple[bool, Optional[PartDetail], Optional[str]]`. <br><br>**Query SQL:** <br>```sql<br>SELECT id, iso_code, status, tipologia, created_at, <br>       low_poly_url, bbox, workshop_id, workshop_name, <br>       validation_report <br>FROM blocks <br>WHERE id = :part_id <br>  AND (workshop_id = :user_workshop_id OR workshop_id IS NULL) -- RLS<br>``` <br><br>**Presigned URL:** Si `low_poly_url IS NOT NULL`, generar presigned GET URL (TTL 5min) con Supabase Storage. <br><br>**Response Schema:** <br>```python<br>class PartDetailResponse(BaseModel):<br>    id: str<br>    iso_code: str<br>    status: BlockStatus<br>    tipologia: str<br>    low_poly_url: Optional[str]  # Presigned URL o None<br>    bbox: Optional[dict]<br>    workshop_name: Optional[str]<br>    validation_report: Optional[ValidationReport]<br>    glb_size_bytes: Optional[int]  # Metadata adicional<br>    triangle_count: Optional[int]  # Extraída de validation_report<br>```<br><br>**Error handling:** <br>- 400 Bad Request: UUID formato inválido <br>- 403 Forbidden: RLS violation (workshop mismatch) <br>- 404 Not Found: part_id no existe <br>- 500 Internal Server Error: DB error, S3 unavailable <br><br>**Rate limiting:** 60 requests/minute por usuario (Redis decorator `@limiter.limit("60/minute")`). <br><br>**Audit log:** Registrar accesos en tabla `events`: `{"event": "part_viewed", "part_id": "xxx", "user_id": "yyy"}`. | **Unit tests:** 12/12 PASS (T-043 service layer). <br>**Integration tests:** 8/8 PASS (API endpoint con mock Supabase). <br>Casos: Success 200 ✓, UUID inválido 400 ✓, RLS violation 403 ✓, Not found 404 ✓, glb_url NULL retorna 200 con campo null ✓, presigned URL válida 5min ✓. | **3 SP** |
| **T-047-BACK** ⭐ **[NUEVO]** | **Part Navigation API** | Endpoint `GET /api/parts/{id}/adjacent?workshop_id=xxx&filters=...` retorna IDs de pieza anterior/siguiente en orden lógico (sorted by `created_at ASC`). <br><br>**Response:** <br>```json<br>{<br>  "prev_id": "uuid-123" or null,<br>  "next_id": "uuid-456" or null,<br>  "current_index": 42,<br>  "total_count": 150<br>}<br>```<br><br>Usa mismos filtros que T-0501 (status, tipologia). RLS enforcement. Cache 5min (Redis). | Endpoint retorna IDs correctos. Tests 6/6. Frontend puede navegar con Prev/Next. | **1 SP** |

### Infrastructure

| ID | Título | Tech Spec | DoD | SP |
|----|--------|-----------|-----|-----|
| **T-048-INFRA** ⭐ **[NUEVO]** | **GLB Presigned URL Optimization** | Configurar CloudFront CDN frente a S3 bucket `processed-geometry/`. <br>Cache policy: TTL 24h, invalidación automática on upload. <br>CORS: `Access-Control-Allow-Origin: app.sfpm.io` (no `*`). <br>Compression: Brotli + Gzip (auto). <br>Logging: CloudFront access logs a S3 `logs/`. <br>Metrics: CloudWatch alarmas si latency >500ms p95 o 4xx rate >5%. | CDN activo. Presigned URLs resuelven vía CloudFront. Latency <200ms median. Tests Postman 10/10. | **2 SP** |

---

## RESUMEN DE CAMBIOS

### Tickets Originales (8 SP)
- T-040-FRONT: Viewer Canvas Component
- T-041-FRONT: Model Loader & Stage
- T-042-FRONT: Error Boundary & Fallback
- T-043-BACK: Get Model URL

### Tickets NUEVOS (+7 SP)
- ⭐ T-044-TEST-FRONT: 3D Viewer Integration Tests **(2 SP)**
- ⭐ T-045-FRONT: Integrate Viewer into PartDetailModal **(3 SP)**
- ⭐ T-046-FRONT: Viewer Metadata Sidebar **(1 SP)**
- ⭐ T-047-BACK: Part Navigation API **(1 SP)**
- ⭐ T-048-INFRA: GLB CDN Optimization **(2 SP)**

### Tickets ENRIQUECIDOS (sin cambio SP)
- ⭐ T-043-BACK: Spec completa (RLS, presigned URL, error handling, rate limiting, audit log)

**Total:** 15 Story Points (vs 8 original = +87% scope)

---

## RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **GLB >50MB causa timeout** | Medium | High | Progressive loading (stream chunks), timeout 30s con fallback |
| **WebGL no disponible (Safari viejo, mobile)** | Low | Critical | Detect `getContext('webgl2')`, fallback a imagen estática PNG |
| **Presigned URL expira mientras usuario navega** | Medium | Medium | TTL 5min, auto-refresh en background antes de expirar |
| **Performance <30 FPS en mobile** | High | High | LOD agresivo (bbox para distancias >50 units), dpr=[1,1] forzado |
| **RLS bypass vía URL manipulation** | Low | Critical | Validar workshop_id en backend SIEMPRE, never trust frontend |
| **Concurrent edits (2 usuarios misma pieza)** | Low | Medium | Read-only viewer en MVP, locking en US futura |

---

## ACCEPTANCE CRITERIA CHECKLIST

- [ ] **Rendering:** Modelo GLB carga y es rotable con OrbitControls
- [ ] **Performance:** >60 FPS desktop, >30 FPS mobile, <2s load time
- [ ] **Fallback:** BBox wireframe si `low_poly_url IS NULL` (status processing)
- [ ] **Error handling:** 404/timeout/corrupted muestra error controlado (no crash)
- [ ] **Security:** RLS enforced (403 si workshop mismatch), audit log registra accesos
- [ ] **Navigation:** Prev/Next buttons funcionan sin cerrar modal
- [ ] **Accessibility:** ARIA labels, keyboard shortcuts (R/F/ESC/arrows), focus trap
- [ ] **Mobile:** Touch gestures (1 finger rotate, 2 fingers zoom), responsive layout
- [ ] **Tests:** >80% coverage frontend, 20/20 integration tests passing, CI/CD includes performance benchmark

---

## DEFINITION OF DONE

### Code Quality
- [ ] TypeScript strict mode (no `any` types)
- [ ] JSDoc en APIs públicas con ejemplos de uso
- [ ] Constants extraction (no magic numbers/strings)
- [ ] Clean Architecture pattern (service layer, thin components)
- [ ] Zero console.logs en producción

### Testing
- [ ] Unit tests: PartViewer3D, PartModel3D, ViewerErrorBoundary (15 tests min)
- [ ] Integration tests: Endpoint GET /api/parts/{id} (8 tests min)
- [ ] Performance test: FPS >60 desktop automated (Puppeteer + Lighthouse)
- [ ] Accessibility audit: Axe DevTools 0 violations (WCAG 2.1 AA)

### Documentation
- [ ] Memory Bank updated: `systemPatterns.md` (Viewer component patterns), `decisions.md` (ADR: Why not Stage component)
- [ ] Tech spec files: T-040 to T-048 created in `docs/US-010/`
- [ ] Storybook stories: PartViewer3D interactive examples (opcional MVP)
- [ ] README updated: "Running 3D Viewer locally" section

### Deployment
- [ ] CloudFront CDN configured (T-048-INFRA)
- [ ] Environment variable `CDN_BASE_URL` en .env.production
- [ ] Railway deploy preview links include viewer test page
- [ ] Sentry error tracking configured para ViewerErrorBoundary

---

## REFERENCES

- US-005 Canvas3D implementation: [docs/US-005/T-0504-FRONT-TechnicalSpec.md](../US-005/T-0504-FRONT-TechnicalSpec.md)
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber/
- useGLTF hook: https://github.com/pmndrs/drei#usegltf
- Draco compression: https://github.com/google/draco
- T-0507 LOD system: [docs/US-005/T-0507-FRONT-TechnicalSpec.md](../US-005/T-0507-FRONT-TechnicalSpec.md)
- T-0508 PartDetailModal: [src/frontend/src/components/Dashboard/PartDetailModal.tsx](../../src/frontend/src/components/Dashboard/PartDetailModal.tsx)
