# Arquitectura — MotoCiudad

> Decisiones técnicas, stack, diagramas y rationale.
> Acompaña a `prd.md` (qué construimos) explicando el **cómo**.

**Versión**: 0.1
**Última actualización**: Mayo 2026

---

## 1. Resumen del stack

| Capa | Tecnología | Versión objetivo |
|---|---|---|
| App móvil | **React Native + Expo SDK** | SDK 52+ (React Native 0.76+) |
| Lenguaje | **TypeScript** (strict mode) | 5.4+ |
| Routing móvil | **Expo Router** (file-based) | v4 |
| Estado global ligero | **Zustand** | 4.x |
| Data fetching y cache | **TanStack Query** (React Query) | v5 |
| Styling | **NativeWind** (Tailwind para RN) | 4.x |
| Mapas | **react-native-maps** | 1.x |
| Cámara | **expo-camera** | SDK incluido |
| Backend (BaaS) | **Supabase** | Cloud (managed) |
| Base de datos | **PostgreSQL + PostGIS** | Postgres 15, PostGIS 3.4 |
| Auth | **Supabase Auth** | OAuth Apple, Google + email |
| Storage | **Supabase Storage** | Bucket `parkings-photos` |
| Realtime | **Supabase Realtime** | Para rankings live (post-MVP) |
| Funciones serverless | **Supabase Edge Functions** (Deno) | TypeScript |
| Push notifications | **Expo Notifications** + FCM/APNs | EAS |
| Error tracking | **Sentry** | RN SDK + Edge SDK |
| Analytics + feature flags | **PostHog** (cloud EU) | RN SDK |
| Build y distribución | **EAS Build** + **EAS Submit** | Expo |
| OTA updates | **EAS Update** | — |
| CI/CD | **GitHub Actions** | — |

---

## 2. Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    APP MÓVIL (iOS + Android)                │
│                                                             │
│   ┌────────────┐   ┌────────────┐   ┌────────────────┐      │
│   │   Mapa     │   │   Lista    │   │ Aportar/Verif. │      │
│   │ (RN Maps)  │   │ (FlashList)│   │ (Camera + GPS) │      │
│   └────────────┘   └────────────┘   └────────────────┘      │
│                                                             │
│   ┌────────────────────────────────────────────────────┐    │
│   │  Capa de datos: TanStack Query + Supabase Client   │    │
│   └────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS (REST + Realtime over WS)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE CLOUD                        │
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │     Auth     │  │   Storage    │  │   Realtime (WS)  │  │
│   │ (OAuth+JWT)  │  │  (S3-like)   │  │  (Postgres CDC)  │  │
│   └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│   ┌────────────────────────────────────────────────────┐    │
│   │               PostgreSQL 15 + PostGIS 3.4          │    │
│   │     (RLS policies, triggers, materialized views)   │    │
│   └────────────────────────────────────────────────────┘    │
│                                                             │
│   ┌────────────────────────────────────────────────────┐    │
│   │  Edge Functions (Deno / TS)                        │    │
│   │  · validate-verification (geofence, anti-abuse)    │    │
│   │  · award-octanos (transaccional)                   │    │
│   │  · check-badges (post-evento)                      │    │
│   │  · compute-monthly-ranking (cron diario)           │    │
│   └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────────┐
        │ Servicios externos                │
        │  · Sentry (errores)               │
        │  · PostHog (analytics)            │
        │  · Apple/Google APNs/FCM (push)   │
        │  · Apple Maps / Google Maps URLs  │
        └──────────────────────────────────┘
```

---

## 3. Decisiones técnicas

### 3.1 ¿Por qué React Native + Expo y no Flutter o nativo?

**Decisión**: React Native con Expo (managed workflow al inicio, prebuild si hace falta).

**Rationale**:
- TypeScript end-to-end (mismo lenguaje en app, edge functions y scripts) → contexto homogéneo para Claude Code, mejor calidad de generación.
- Expo Router permite estructura file-based familiar a quien viene de Next.js.
- EAS Build elimina la necesidad de Mac local para builds iOS al inicio.
- EAS Update permite OTA de JavaScript (fixes en horas, no semanas).
- Ecosistema enorme: `react-native-maps`, `expo-camera`, `expo-location`, `expo-image-manipulator` cubren 90% de necesidades nativas sin escribir Swift/Kotlin.
- Curva de aprendizaje suave para desarrollador con base en JS/CSS.

**Trade-offs aceptados**:
- Algunas integraciones nativas muy específicas pueden requerir EAS Build con código nativo (no managed). Aceptable.
- Bundle size mayor que nativo puro. No relevante a esta escala.

### 3.2 ¿Por qué Supabase y no Laravel/NestJS/Firebase?

**Decisión**: Supabase como backend principal.

**Rationale**:
- **PostgreSQL real con PostGIS**: queries geoespaciales nativas (`ST_DWithin`, `ST_Distance`) — imprescindibles para "parkings en radio de 5 km", "verificación geofenced ≤100 m".
- **Row Level Security (RLS)**: políticas de seguridad declaradas a nivel de tabla, evita escribir middleware de autorización repetitivo.
- **Auth integrada**: OAuth Apple/Google y email-link sin escribir backend de identidad.
- **Edge Functions en TypeScript**: la lógica anti-abuso (validar geofence + timestamp + cap diario) vive cerca de los datos y comparte tipos con el cliente.
- **Storage con CDN integrado**: subida directa desde el cliente con políticas RLS.
- **Sin servidores que mantener**: enfoque en producto, no en infra.
- **Coste predecible**: tier gratuito generoso, plan Pro a 25 €/mes cubre miles de usuarios en MVP.

**Trade-offs aceptados**:
- Vendor lock-in moderado. Mitigado: PostgreSQL es estándar, las funciones edge son TypeScript portable. Migrar a otro provider en el futuro es factible.
- Menos control que un VPS propio. Aceptable a esta escala.

**Alternativas descartadas**:
- *Laravel*: excelente DX pero introduce un segundo lenguaje (PHP) y el peso de mantener servidor. No aporta ventaja sobre Supabase para este caso.
- *Firebase*: Firestore no es relacional y el modelo de gamificación (Octanos transaccionales, joins por ciudad) es mucho más natural en SQL. Además Google está dejando atrás varias APIs.
- *NestJS + Postgres propio*: más boilerplate, más infra, sin ganar nada relevante.

### 3.3 Estado: ¿por qué Zustand + TanStack Query y no Redux?

**Decisión**: Zustand para estado **cliente local** (UI, sesión, filtros activos). TanStack Query para estado **servidor** (parkings, perfil, ranking).

**Rationale**:
- TanStack Query gestiona caché, refetch, estados de loading/error de forma idiomática y elimina ~70% del código de gestión de estado.
- Zustand es minimalista para lo que queda (filtros activos, tab seleccionado, modal abierto).
- Redux Toolkit es overkill para este alcance.

### 3.4 Mapas: ¿react-native-maps o Mapbox?

**Decisión inicial**: `react-native-maps` (Apple Maps en iOS / Google Maps en Android — providers nativos por defecto).

**Rationale**:
- En iOS usa Apple Maps gratis y en Android Google Maps (cuota gratuita generosa para volumen MVP).
- Look & feel nativo, integración con permisos del sistema fluida.
- Cumple con la estética dark de los mocks vía estilos custom.

**Pendiente de decidir**: si los mocks requieren clustering avanzado o estilizado muy específico, evaluar migración a `@rnmapbox/maps` (Mapbox GL Native) en v1.1 — implica añadir SDK key y coste por MAU.

### 3.5 Estilizado: ¿NativeWind?

**Decisión**: NativeWind 4 (Tailwind CSS para React Native con Jit y soporte CSS variables).

**Rationale**:
- El usuario ya domina CSS — Tailwind es conceptualmente cercano.
- Misma estética cross-platform sin escribir StyleSheet manualmente.
- Tema dark configurado en `tailwind.config.js` (paleta de marca centralizada).

### 3.6 Validación de datos

**Decisión**: **Zod** para schemas en cliente + edge functions.

Motivo: tipos derivados de schemas (`z.infer<>`), validación run-time con mensajes claros, un único lugar donde definir formas de payloads.

---

## 4. Estructura del repositorio

Monorepo simple con dos proyectos independientes, sin necesidad de Turborepo en MVP:

```
motociudad/
├── apps/
│   └── mobile/                     # App React Native (Expo)
│       ├── app/                    # Expo Router (file-based)
│       │   ├── (auth)/             # Stack de auth
│       │   ├── (tabs)/             # Stack principal con tabs
│       │   │   ├── map.tsx
│       │   │   ├── list.tsx
│       │   │   ├── contribute.tsx
│       │   │   ├── ranking.tsx
│       │   │   └── profile.tsx
│       │   ├── parking/[id].tsx    # Detalle de parking
│       │   └── _layout.tsx
│       ├── components/             # Componentes UI reutilizables
│       ├── features/               # Lógica por dominio (parkings, gamification...)
│       ├── lib/                    # Cliente Supabase, utils
│       ├── hooks/                  # Hooks custom
│       ├── types/                  # Tipos derivados de DB y zod schemas
│       └── app.config.ts
│
├── supabase/                       # Backend (gestionado por Supabase CLI)
│   ├── migrations/                 # Migraciones SQL versionadas
│   ├── functions/                  # Edge Functions
│   │   ├── validate-verification/
│   │   ├── award-octanos/
│   │   ├── check-badges/
│   │   └── compute-monthly-ranking/
│   ├── seed.sql                    # Datos seed para dev
│   └── config.toml
│
├── docs/                           # Toda la documentación md
│   ├── prd.md
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   ├── gamificacion.md
│   ├── testing.md
│   ├── infraestructura.md
│   ├── CLAUDE.md
│   └── AGENTS.md
│
├── .github/
│   └── workflows/
│       ├── mobile-ci.yml           # Tests + typecheck en PRs
│       ├── supabase-deploy.yml     # Deploy migraciones + functions
│       └── eas-build.yml           # Builds y submits móviles
│
├── package.json                    # Workspace root
└── README.md
```

---

## 5. Diseño de la API

**No hay API custom propia**. Toda la comunicación va contra:

1. **Supabase Postgres** vía librería `@supabase/supabase-js` (auto-genera REST sobre el schema, con RLS).
2. **Supabase Edge Functions** para operaciones que requieren lógica server-side (validación, transacciones complejas).

### 5.1 Endpoints REST (auto-generados por PostgREST)

Lectura simple desde el cliente, todas con RLS aplicada:

```
GET  /rest/v1/parkings?select=*,verifications(count)
GET  /rest/v1/parkings?nearby=...        (vía RPC)
GET  /rest/v1/users?id=eq.{uuid}
GET  /rest/v1/badges
GET  /rest/v1/user_badges?user_id=eq.{uuid}
```

### 5.2 RPC functions (en Postgres, llamadas desde el cliente)

- `nearby_parkings(lat float, lng float, radius_m int, filter_type text)`
  Devuelve parkings dentro del radio, ordenados por distancia. Implementado con `ST_DWithin`.

- `compute_user_octanos(user_id uuid)`
  Suma confirmada desde `octano_events`. Usado para reconciliar caché.

- `get_ranking(scope text, city text, period text, limit int)`
  Devuelve top N usuarios según vista (totales / mes), scope (global / city / friends).

### 5.3 Edge Functions (operaciones críticas)

Todas devuelven `{ success: bool, data?: any, error?: { code, message } }`.

| Función | Trigger | Responsabilidad |
|---|---|---|
| `validate-verification` | Cliente al verificar | Validar geofence (≤100m), timestamp foto (≤5min), cap diario, cooldown |
| `award-octanos` | Llamada interna desde otras Edge Fn | Insertar `octano_event`, actualizar caché de usuario en transacción |
| `check-badges` | Trigger Postgres tras `award-octanos` | Evaluar reglas de insignias y otorgar las nuevas |
| `compute-monthly-ranking` | Cron diario (00:05 UTC) | Recalcular `octanos_this_month` para todos los usuarios |
| `process-photo-upload` | Tras upload a Storage | Comprimir, generar thumbnail, validar formato, ejecutar moderación de contenido |
| `delete-account` | Cliente desde ajustes | Borrado RGPD: anonimizar contribuciones, borrar cuenta y datos personales |

---

## 6. Seguridad

### 6.1 Autenticación

- Email + magic link (Supabase Auth).
- Apple Sign-In (obligatorio en App Store si hay otros OAuth).
- Google Sign-In.
- Tokens JWT gestionados por Supabase, refresh automático en cliente.

### 6.2 Autorización (RLS)

Reglas declaradas en SQL. Ejemplos:

- Cualquier autenticado puede leer `parkings` con `status = 'verified'`.
- Solo el autor puede ver sus propias propuestas en estado `pending`.
- Solo usuarios de nivel ≥ Cartógrafo (4) pueden insertar en `parking_reports` con peso doble.
- Nadie puede editar `octano_events` después de creado (insert-only desde el cliente vía edge function).

Detalles en `modelo-datos.md` §7.

### 6.3 Anti-abuso

Toda confirmación de Octanos pasa por la edge function `validate-verification`, que aplica las reglas del §2.2 de `gamificacion.md`:

- Geofence: distancia entre `gps_position` del cliente y `parking.location` ≤ 100m.
- Timestamp foto: diferencia con `now()` ≤ 5 minutos.
- Cap diario: suma de Octanos confirmados en últimas 24h < 200.
- Cooldown: el usuario no ha verificado este parking previamente.
- Auto-detección: > 5 propuestas rechazadas en 7 días → marcar cuenta para revisión.

### 6.4 Privacidad

- Geolocalización del usuario nunca persistida; usada solo en validación puntual y descartada.
- Fotos de verificación: EXIF de geolocalización stripped en cliente (`expo-image-manipulator`) antes de upload.
- Política de privacidad publicada antes del primer release público.
- Endpoint de borrado RGPD funcional (`delete-account`).

---

## 7. Performance

### 7.1 Patrones aplicados

- **Carga incremental del mapa**: solo cargar parkings visibles en viewport actual (`bbox` query).
- **Clustering en cliente** cuando hay > 50 pins en pantalla (`supercluster` o nativo).
- **Lista con FlashList** (Shopify): mejor rendimiento que FlatList con datasets > 100.
- **Imágenes optimizadas**: thumbnails 400px en listas, full size solo en detalle. WebP servido desde Supabase Storage.
- **Caché agresiva con TanStack Query**: stale-while-revalidate en perfiles y rankings.
- **Materialized views** para rankings (refresh cada 5 minutos vía cron).

### 7.2 Métricas objetivo

| Métrica | Objetivo |
|---|---|
| Cold start (gama media Android) | < 3s |
| Tiempo a primer pin en mapa | < 2s |
| Query parkings cercanos | < 500ms (p95) |
| Subida de foto + verificación | < 5s (p95) |
| TTI tras navegar a detalle | < 800ms |

---

## 8. Observabilidad

- **Sentry**: errores frontend (RN SDK) y backend (Edge Functions).
- **PostHog**: eventos de producto, embudos, retention. Cohortes para A/B (post-MVP).
- **Supabase Logs**: queries lentas, fallos de RLS, errores de edge functions.
- **Health check semanal**: revisión de métricas clave por el equipo (KPIs de `prd.md` §12).

Eventos críticos a trackear en PostHog:

```
app_opened, registration_completed, location_permission_granted,
map_viewed, list_viewed, parking_detail_viewed, navigation_started,
parking_proposed, parking_verified, parking_reported,
octanos_awarded, level_up, badge_earned,
ranking_viewed, profile_viewed
```

---

## 9. Internacionalización

MVP solo en castellano (es-ES).

Aun así se estructura el código con `i18next` y `expo-localization` desde el día 1 para facilitar añadir inglés en v1.1 sin refactor masivo. Todas las cadenas en archivos `locales/es.json` desde el principio.

---

## 10. Deeplinks y navegación nativa

- Esquema de deeplinks: `motociudad://parking/{id}` y `https://motociudad.app/parking/{id}` (Universal Links iOS / App Links Android).
- Apertura de mapas externos:
  - iOS: `maps://?daddr={lat},{lng}` (Apple Maps) con fallback a `https://maps.google.com/?q={lat},{lng}`.
  - Android: `geo:{lat},{lng}?q={lat},{lng}({nombre})` con fallback a Google Maps.

---

## 11. Decisiones cerradas

- ✅ React Native + Expo + TypeScript.
- ✅ Supabase como backend integral.
- ✅ PostgreSQL + PostGIS para datos y geo.
- ✅ Edge Functions para anti-abuso y lógica crítica.
- ✅ Expo Router para navegación.
- ✅ NativeWind para estilizado.

## 12. Decisiones pendientes

- ⏳ Mapbox vs `react-native-maps` (decisión final cuando haya prototipo navegable).
- ⏳ Estrategia exacta de OTA updates (canales: production / preview / development).
- ⏳ ¿Usar Reanimated 3 + Skia para animaciones celebratorias de subida de nivel o bastan animaciones nativas básicas?
- ⏳ Política de retención de fotos antiguas (impacta storage y privacidad).

---

## 13. Documentos relacionados

- `prd.md` — requisitos de producto.
- `modelo-datos.md` — schema completo y RLS.
- `gamificacion.md` — reglas de Octanos / niveles / insignias.
- `testing.md` — estrategia de tests.
- `infraestructura.md` — entornos, deploy, costes.
- `CLAUDE.md` — instrucciones para Claude Code.
