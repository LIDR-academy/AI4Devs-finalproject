# CLAUDE.md — MotoCiudad

> Documento principal de instrucciones para [Claude Code](https://code.claude.com/docs).
> Este es el primer fichero que Claude Code lee al abrir el repo. Define **cómo trabajar** en este proyecto.
> Compañero de `AGENTS.md` (subagentes especializados).

---

## 1. Visión rápida del proyecto

**MotoCiudad** es una app móvil colaborativa para encontrar, proponer y verificar parkings de moto. El sistema se sostiene en una comunidad gamificada con Octanos, niveles e insignias.

Para detalles completos: lee siempre `prd.md` antes de proponer cambios de producto.

**Estado actual**: MVP en desarrollo con metodología Spec Driven Development.

---

## 2. Documentos canónicos del proyecto

Todo cambio relevante debe ser **coherente** con estos documentos. Si una instrucción del usuario contradice un documento canónico, **señalar la discrepancia y pedir confirmación** antes de proceder.

| Documento | Contenido | Cuándo consultarlo |
|---|---|---|
| `docs/prd.md` | Qué construimos y por qué | Antes de cualquier feature nueva |
| `docs/arquitectura.md` | Stack, decisiones técnicas | Antes de crear módulos nuevos o introducir libs |
| `docs/modelo-datos.md` | Schema SQL, RLS, funciones | Antes de migraciones o cambios en queries |
| `docs/gamificacion.md` | Octanos, niveles, insignias | Antes de tocar lógica de puntuación |
| `docs/testing.md` | Estrategia de tests | Al añadir o modificar tests |
| `docs/infraestructura.md` | Hosting, CI/CD, secretos | Al modificar workflows o desplegar |
| `CLAUDE.md` (este archivo) | Cómo trabajar | Siempre primero |
| `AGENTS.md` | Subagentes disponibles | Al delegar tareas especializadas |

---

## 3. Stack del proyecto

```
Mobile      : React Native + Expo (SDK 52+) · TypeScript strict · Expo Router v4
State       : Zustand (cliente) + TanStack Query v5 (server)
Styling     : NativeWind 4 (Tailwind para RN)
Mapas       : react-native-maps (Apple Maps iOS / Google Maps Android)
Cámara      : expo-camera
Backend     : Supabase Cloud (PostgreSQL 15 + PostGIS + Auth + Storage + Edge Functions)
Edge Funcs  : Deno + TypeScript
Validación  : Zod (cliente y edge)
Tests       : Vitest, RN Testing Library, Maestro (E2E), pgTAP (RLS)
CI/CD       : GitHub Actions + EAS Build + EAS Update (OTA)
Observ.     : Sentry + PostHog (cloud EU)
```

---

## 4. Comandos esenciales

### 4.1 Local

```bash
# Setup primera vez
pnpm install
supabase start                       # arranca DB local en Docker

# Desarrollo
pnpm dev:mobile                      # Expo dev server con dev client
supabase status                      # verificar servicios locales
supabase db reset                    # reaplicar todas las migraciones desde cero
supabase functions serve             # edge functions locales

# Tipos
pnpm typecheck                       # tsc --noEmit en todos los packages
pnpm gen:types                       # genera tipos TS desde schema Supabase
```

### 4.2 Tests

```bash
pnpm test                            # Vitest (unit + integración)
pnpm test --coverage                 # con cobertura
maestro test .maestro/               # E2E (requiere simulador/dispositivo)
supabase test db                     # pgTAP (RLS y funciones SQL)
deno test supabase/functions/**/*.test.ts   # edge functions
```

### 4.3 Migraciones

```bash
supabase migration new <descripcion>     # crear migración nueva
supabase db push                         # aplicar a entorno linkeado
supabase db diff -f <descripcion>        # generar migración desde cambios en local
```

### 4.4 Build y deploy

```bash
eas build --platform all --profile preview          # build TestFlight + internal
eas submit --platform all --profile production      # publicar en stores
eas update --branch production --message "<msg>"   # OTA update
```

---

## 5. Convenciones del proyecto

### 5.1 Idioma

- **Código** (variables, funciones, comentarios): **inglés**.
- **UI** (textos visibles, copy): **castellano (es-ES)**.
- **Documentación md y commits**: **castellano**.
- **PR descriptions**: **castellano**.

### 5.2 Estilo de código

- TypeScript con `strict: true` y `noUncheckedIndexedAccess: true`.
- Imports absolutos vía `@/` (configurado en `tsconfig.json`).
- ESLint + Prettier (configuración en `.eslintrc.cjs` y `.prettierrc`).
- Nombres de componentes en PascalCase, hooks en camelCase con prefijo `use`.
- Archivos de componentes: un componente por archivo, mismo nombre que el archivo.
- Schemas Zod junto al hook o función que los usa, exportados.

### 5.3 Estructura de features

Cada dominio funcional vive en `features/<dominio>/` con esta estructura:

```
features/parkings/
├── api.ts            # llamadas a Supabase (queries y mutations)
├── hooks.ts          # hooks TanStack Query (useNearbyParkings, etc.)
├── schemas.ts        # zod schemas y tipos derivados
├── components/       # componentes específicos del dominio
└── __tests__/
```

### 5.4 SQL

- Tablas en plural, columnas en snake_case.
- Cada migración es atómica (una idea por archivo).
- Toda tabla nueva debe llevar política RLS y test pgTAP en el mismo PR.
- Evitar `*` en SELECTs en producción; especificar columnas.

### 5.5 Commits

Formato: **Conventional Commits**.

```
feat(parkings): add nearby search with PostGIS radius
fix(octanos): respect daily cap when reverting confirmed events
docs(prd): clarify out-of-scope for messaging features
test(rls): add pgTAP coverage for parkings_update_own_pending policy
```

### 5.6 Pull Requests

- Una feature por PR. Si crece, partir.
- Descripción incluye: qué cambia, por qué, cómo probar, links a documentos canónicos relevantes.
- Cubrir con tests automatizados antes de pedir review.
- CI verde es prerequisito de merge.

---

## 6. Spec Driven Development — flujo de trabajo

### 6.1 Para una feature nueva

```
1. Leer prd.md sección que la describe (o discutir si no está definida).
2. Confirmar con el usuario que el spec es preciso. Si hay ambigüedad, levantarla.
3. Identificar documentos a actualizar:
   - prd.md: si cambia alcance o user story.
   - arquitectura.md: si introduce nueva tecnología o patrón.
   - modelo-datos.md: si toca schema.
   - gamificacion.md: si toca Octanos / niveles / insignias.
4. Crear/actualizar specs ANTES del código.
5. Implementar siguiendo el spec.
6. Tests cubriendo la lógica.
7. PR con referencia explícita al spec actualizado.
```

### 6.2 Para un bug

```
1. Reproducir el bug con un test que falla.
2. Verificar que el comportamiento esperado está documentado en spec.
   - Si no lo está, completar spec.
3. Arreglar el código.
4. Verificar test verde + no regresiones.
```

### 6.3 Mantenimiento de specs

**Regla crítica**: si el código y el spec divergen, **el código se ajusta al spec o el spec se actualiza con justificación documentada en el commit**. Nunca dejar el repo en estado inconsistente.

Cuando un cambio de implementación obligue a actualizar varios documentos, es preferible **delegar al subagente `prd-keeper`** (ver `AGENTS.md`).

---

## 7. Cómo trabajar con esta base de código

### 7.1 Antes de crear código

- [ ] Lee la sección relevante de `prd.md` y `arquitectura.md`.
- [ ] Si tocas DB, lee `modelo-datos.md` completo de la zona afectada.
- [ ] Si tocas Octanos, lee `gamificacion.md` y `modelo-datos.md` §7.
- [ ] Verifica si ya existe código similar (buscar en `features/`).

### 7.2 Reglas no negociables

1. **No inventar features no documentadas** sin proponerlas y obtener confirmación.
2. **No tocar `octano_events` directamente desde el cliente** — siempre vía Edge Function.
3. **No exponer `service_role_key` en código del cliente**.
4. **No persistir geolocalización del usuario** salvo el campo `user_location` en una verificación concreta (regla privacidad).
5. **Toda tabla nueva nace con RLS activa** y al menos una policy + un test pgTAP.
6. **Toda función con efectos sobre Octanos** debe tener al menos un test que cubra el camino feliz y un test que cubra cada regla anti-abuso.
7. **No deprecar columnas con `DROP` en una migración**: marcar como deprecated, esperar al menos un release, luego retirar.

### 7.3 Cosas explícitamente prohibidas en MVP

Recordatorio rápido (lista completa en `prd.md` §7.2):

- ❌ Modo claro / light theme.
- ❌ Mensajería privada o foros.
- ❌ Sistema de pagos / reservas.
- ❌ Multi-idioma (solo es-ES; código preparado para i18n pero único locale activo).
- ❌ Importación masiva de datos externos.
- ❌ Modificación post-lanzamiento del baremo de Octanos sin actualizar `gamificacion.md` primero.

---

## 8. Skills recomendadas para este proyecto

Las [skills](https://code.claude.com/docs/build-skills) son carpetas con `SKILL.md` que enseñan a Claude Code procedimientos repetitivos. Para este proyecto, considerar crear estas skills personalizadas en `.claude/skills/`:

### 8.1 `supabase-migration`

- **Triggers**: "crear migración", "añadir tabla", "modificar schema", "nueva columna".
- **Contenido**: workflow completo (`supabase migration new` → editar → probar local → push → PR).
- **Incluye**: plantillas de migración, checklist (RLS, índices, test pgTAP).

### 8.2 `edge-function`

- **Triggers**: "crear edge function", "función serverless", "endpoint Supabase".
- **Contenido**: scaffold de carpeta `supabase/functions/<name>/`, plantilla con auth check, manejo de errores, tipo de respuesta uniforme, test inicial.

### 8.3 `rls-policy`

- **Triggers**: "policy de RLS", "permisos de tabla", "seguridad de fila".
- **Contenido**: plantillas de policies habituales (read own, insert own, admin only) y test pgTAP que las acompaña.

### 8.4 `expo-screen`

- **Triggers**: "nueva pantalla", "ruta nueva", "agregar tab".
- **Contenido**: scaffold de archivo en `apps/mobile/app/`, layout, tipos de params, hook de data, manejo de loading/error/empty, accesibilidad básica.

### 8.5 `gamification-event`

- **Triggers**: "añadir acción puntuable", "evento de Octanos", "nueva acción que da puntos".
- **Contenido**: checklist completo (añadir enum `octano_action`, regla de puntos, validación anti-abuso, test, actualizar `gamificacion.md`).
- **Importante**: este skill enfatiza actualizar la documentación junto con el código.

### 8.6 `maestro-flow`

- **Triggers**: "test E2E", "flow de Maestro", "test de integración móvil".
- **Contenido**: estructura YAML estándar para Maestro, mocks de cámara y GPS, integración con CI.

> **Nota**: cada skill se materializa en `.claude/skills/<nombre>/SKILL.md` con descripción precisa de cuándo activarse. Mantenerlas actualizadas conforme evoluciona el proyecto.

---

## 9. Subagentes disponibles

Ver `AGENTS.md` para lista completa. Resumen rápido:

| Subagente | Para qué |
|---|---|
| `prd-keeper` | Actualizar documentos canónicos cuando cambian |
| `migration-builder` | Crear migraciones SQL con RLS y tests |
| `ui-implementer` | Traducir mocks de Figma/PNG a componentes RN |
| `gamification-engineer` | Cambios en lógica de Octanos / niveles / insignias |
| `e2e-author` | Crear/actualizar flows Maestro |
| `rls-auditor` | Revisar y endurecer policies |

---

## 10. Mantenimiento de la documentación

> **Esta es una de las instrucciones más importantes del proyecto.**

Si Claude Code (o cualquier subagente) detecta que:

- Una decisión técnica nueva contradice o complementa `arquitectura.md`.
- Una feature nueva no está reflejada en `prd.md`.
- Un cambio de schema no está en `modelo-datos.md`.
- Una nueva acción puntuable no está en `gamificacion.md`.
- Un cambio en CI/CD no está en `infraestructura.md`.

Debe **proponer la actualización del documento correspondiente en el mismo PR** (o delegar al subagente `prd-keeper`).

**El repo nunca debe quedar en estado donde código y specs divergen sin justificación documentada.**

Cuando un PR introduce un cambio en docs canónicos, la descripción del PR debe incluir un apartado **"Cambios en specs"** listando qué se ha modificado y por qué.

---

## 11. Atajos de productividad

### 11.1 Plantilla de tarea

Cuando el usuario pide una tarea no trivial, Claude Code estructura su respuesta como:

```
1. Documentos consultados: <lista>
2. Análisis del impacto: <breve>
3. Plan de cambios:
   - Código: <archivos>
   - Tests: <archivos>
   - Docs: <archivos a actualizar>
4. Cambios propuestos.
5. Cómo verificarlos manualmente.
```

### 11.2 Búsqueda en docs

Antes de inventar, Claude busca en los `.md` del proyecto. Especialmente útil para:

- Lista exacta de Octanos por acción → `gamificacion.md` §2.1.
- Schema completo de una tabla → `modelo-datos.md`.
- Variables de entorno necesarias → `infraestructura.md` §4.

---

## 12. Recursos externos clave

- [Documentación de Claude Code](https://code.claude.com/docs)
- [Documentación Expo](https://docs.expo.dev/)
- [Documentación Supabase](https://supabase.com/docs)
- [PostGIS reference](https://postgis.net/docs/)
- [TanStack Query](https://tanstack.com/query/latest/docs)
- [NativeWind](https://www.nativewind.dev/)
- [Maestro](https://maestro.mobile.dev/)

---

## 13. Cuando algo no esté claro

Si una instrucción del usuario:

- Contradice un documento canónico → señalarlo y pedir cómo proceder.
- Toca varios dominios sin priorizar → pedir orden.
- Implica decisiones arquitectónicas no cubiertas → proponer 2 opciones con trade-offs y dejar que decida.
- Es ambigua sobre alcance → pedir alcance preciso (un commit / un PR / una feature).

**Mejor preguntar 30 segundos que dedicar 30 minutos a la dirección equivocada.**
