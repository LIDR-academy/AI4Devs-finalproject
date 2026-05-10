# AGENTS.md — MotoCiudad

> Definición de los subagentes especializados del proyecto.
> Compañero de `CLAUDE.md`. Estos subagentes se invocan desde Claude Code para tareas con contexto y herramientas específicas.

**Referencia oficial**: [Claude Code Subagents docs](https://code.claude.com/docs/agents/subagents)

---

## 1. Cómo se invocan

Cada subagente vive en `.claude/agents/<nombre>.md` con frontmatter YAML que define cuándo Claude Code lo activa.

Convenciones de uso:

- **Automático**: Claude Code los activa cuando reconoce una tarea que coincide con la descripción del subagente.
- **Manual**: el usuario o Claude principal puede pedir explícitamente "usa el subagente X para esto".
- **Contexto aislado**: cada subagente trabaja en su propia ventana de contexto, lee solo los documentos que necesita y devuelve un resultado al agente principal.

Antes de invocar uno, **Claude Code lee este archivo** para saber qué subagentes existen y cuál encaja con la tarea.

---

## 2. Subagentes definidos

### 2.1 `prd-keeper`

**Misión**: mantener los documentos canónicos del proyecto sincronizados con el código.

**Cuándo se invoca**:

- Tras una feature nueva que afecte a alcance, schema, gamificación, infra o testing.
- Al detectar que código y specs divergen.
- Cuando el usuario pide explícitamente "actualiza los PRDs".

**Documentos que mantiene**:

- `prd.md`
- `arquitectura.md`
- `modelo-datos.md`
- `gamificacion.md`
- `testing.md`
- `infraestructura.md`

**Reglas estrictas**:

1. **No introducir cambios funcionales** — solo documentación.
2. **Cada cambio justificado**: el commit debe explicar qué cambio de código motiva la actualización del documento.
3. **Coherencia cruzada**: si actualiza `modelo-datos.md` y la nueva tabla afecta a Octanos, también actualiza `gamificacion.md`.
4. **No borrar histórico** sin marcar la sección como deprecated y conservar 1 release.
5. **Fechado**: actualiza el campo "Última actualización" en cada documento que toca.

**Salida esperada**: un diff propuesto de los archivos `.md` afectados, con explicación de qué cambia y por qué.

**Ejemplo de invocación**:

> "Acabamos de añadir una acción puntuable nueva (`share_parking`) que da +5 Octanos. Usa `prd-keeper` para actualizar la documentación."

---

### 2.2 `migration-builder`

**Misión**: crear migraciones SQL completas, seguras y testeadas para Supabase.

**Cuándo se invoca**:

- Crear o modificar tablas, índices, funciones SQL, RLS policies, materialized views.
- Añadir extensiones de PostgreSQL.

**Herramientas**: filesystem, bash (para ejecutar `supabase db diff` y `supabase test db` localmente).

**Producto que entrega**:

1. Archivo de migración en `supabase/migrations/<timestamp>_<nombre>.sql`.
2. Tests pgTAP en `supabase/tests/<area>/`.
3. Actualización de `modelo-datos.md` con el nuevo schema.
4. Si hay datos seed nuevos, actualización de `supabase/seed.sql`.

**Checklist obligatorio antes de marcar como completo**:

- [ ] Migración aplica limpia desde estado vacío (`supabase db reset`).
- [ ] La tabla nueva tiene RLS activa (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [ ] Al menos una policy por operación que se permita (SELECT, INSERT, UPDATE).
- [ ] Índices necesarios para las queries previstas (incluido GiST si hay `geography`).
- [ ] Test pgTAP que cubre la policy y casos límite.
- [ ] `modelo-datos.md` actualizado en el mismo PR.

**Reglas no negociables**:

- Migraciones forward-only (no edita migraciones ya mergeadas).
- Sin `DROP COLUMN` en datos productivos sin estrategia de migración previa documentada.
- Nombres en snake_case, tablas en plural.

---

### 2.3 `ui-implementer`

**Misión**: traducir mocks (PNG, Figma export) a pantallas React Native funcionales con NativeWind, accesibilidad y datos reales conectados.

**Cuándo se invoca**:

- "Implementa la pantalla X según el mock".
- "Crea el componente Y según el diseño".

**Herramientas**: filesystem, lectura de imágenes en `/mocks/`, ejecución de `pnpm dev:mobile` para verificar.

**Producto que entrega**:

1. Componente o pantalla en `apps/mobile/app/` o `apps/mobile/components/`.
2. Estilos vía NativeWind (clases utility, no `StyleSheet.create` salvo edge cases).
3. Accesibilidad: `accessibilityRole`, `accessibilityLabel`, soporte Dynamic Type.
4. Estados loading / error / empty.
5. Test de RNTL cubriendo render, interacción y al menos un estado de error.

**Reglas estrictas**:

- **Diseño es ley**: no cambia espaciados, colores, tipografías sin pedir confirmación.
- **Tokens centralizados**: colores y radios desde `tailwind.config.js`, no hardcoded.
- **Dark mode obligatorio**: todo componente nace en modo oscuro.
- **Mobile-only**: nada de breakpoints web, no responsive a tablet salvo que esté en el mock.
- **Sin estado servidor sin TanStack Query**: nada de `useEffect + fetch`.

**Activos disponibles** en `/mnt/project/`:
- iOS y Android: entrada, mapa, lista, perfil, ranking, detalle, proponer parking, verificar parking, taller (POI secundario).

---

### 2.4 `gamification-engineer`

**Misión**: implementar y mantener la lógica de Octanos, niveles, insignias y rankings.

**Cuándo se invoca**:

- Añadir o modificar acciones puntuables.
- Cambiar reglas anti-abuso.
- Crear nuevas insignias.
- Cambiar baremos de niveles.
- Implementar rankings nuevos (por amigos, por temporada, etc.).

**Documentos canónicos**: `gamificacion.md` (regla por excelencia) y `modelo-datos.md` §7.

**Producto que entrega**:

1. Cambios en migraciones (`octano_events.action_type`, badges, etc.).
2. Implementación en Edge Function (`award-octanos`, `validate-verification`, `check-badges`).
3. Tests unitarios para el camino feliz y todas las reglas anti-abuso.
4. Actualización de `gamificacion.md` con el nuevo baremo.
5. Tests pgTAP si añade trigger o función SQL.

**Checklist obligatorio**:

- [ ] La acción nueva está en el enum `octano_action`.
- [ ] El cap diario sigue siendo respetado.
- [ ] La acción pasa por `validate-verification` o tiene su propio guard.
- [ ] Hay test que comprueba que el evento queda en `pending` y solo pasa a `confirmed` tras moderación.
- [ ] Hay test de cooldown (no se puede ganar 2 veces por misma referencia).
- [ ] `gamificacion.md` §2.1 actualizada en el mismo PR.

**Reglas no negociables**:

- **Niveles solo suben** (regla `gamificacion.md` §1).
- **Sin canjes monetarios** (regla `prd.md` §7.2).
- **Sin compras in-app de Octanos**.
- **Acciones siempre auditables** vía `octano_events`.
- **Nunca tocar `users.total_octanos` directamente**: dejar que el trigger lo recalcule.

---

### 2.5 `e2e-author`

**Misión**: crear y mantener flows de Maestro que cubren los flujos críticos de la app.

**Cuándo se invoca**:

- Tras implementar una feature crítica que necesita cobertura E2E.
- Cuando un bug llegó a producción y el flow no lo capturaba.
- Al refactorizar pantallas que ya tenían tests E2E.

**Producto que entrega**:

1. Archivo YAML en `.maestro/<flow>.yaml`.
2. Mocks necesarios (cámara con imagen fija, GPS con coordenadas fijas).
3. Documentación del flow en comentarios YAML.
4. Integración en CI si es un flow recurrente.

**Reglas**:

- Tests deterministas: nada que dependa del reloj real, datos cambiantes o red flaky.
- Cada flow representa un user journey, no un test atómico.
- Usar selectores estables (`testID`, `accessibilityLabel`), nunca texto que pueda cambiar con i18n.
- Si añade un `testID` nuevo en código, documentarlo en el componente.

**Flows mínimos a mantener**:

- `onboarding.yaml`
- `find-and-navigate.yaml`
- `propose-parking.yaml`
- `verify-parking.yaml`
- `profile-and-ranking.yaml`

---

### 2.6 `rls-auditor`

**Misión**: revisar y endurecer las políticas de Row Level Security para evitar leaks de datos.

**Cuándo se invoca**:

- Antes de un release público.
- Al añadir cualquier tabla nueva.
- Cuando un usuario reporta acceso a datos que no debería ver.
- Periódicamente (mensual) como auditoría rutinaria.

**Producto que entrega**:

1. Informe `.md` en `docs/auditorias/<fecha>-rls.md` con:
   - Tablas auditadas.
   - Policies analizadas.
   - Hallazgos (gravedad alta / media / baja).
   - Recomendaciones.
2. Si hay correcciones, PR con la migración correspondiente.

**Checks que ejecuta sobre cada tabla**:

- ¿RLS está habilitada?
- ¿Hay al menos una policy permisiva por operación necesaria?
- ¿Las policies de UPDATE / DELETE comprueban `auth.uid() = owner_id`?
- ¿Los joins en views también respetan RLS?
- ¿Las funciones `SECURITY DEFINER` están limitadas y comentadas?
- ¿Hay tests pgTAP que validan tanto el camino permitido como el bloqueado?

**Reglas no negociables**:

- **Sin policies abiertas** (`USING (true)`) salvo en tablas de catálogo público (`user_levels`, `badges`).
- **Sin `service_role`** desde el cliente bajo ningún concepto.
- **Cualquier función con `SECURITY DEFINER` debe tener un comentario justificando por qué**.

---

### 2.7 `dx-mantainer`

**Misión**: mantener la experiencia de desarrollo limpia y rápida.

**Cuándo se invoca**:

- Tras semanas de desarrollo intenso, cuando el repo se desordena.
- Al detectar comandos repetitivos que merecen un script.
- Al actualizar versiones de dependencias.

**Producto que entrega**:

- Scripts útiles en `package.json` y/o `scripts/`.
- Actualización de README y `CLAUDE.md` cuando cambian comandos.
- Actualizaciones controladas de dependencias (no de golpe).

**Reglas**:

- Nunca actualiza dependencias mayores sin verificar breaking changes.
- Documenta cualquier cambio de versión en commit detallado.
- Mantiene el lockfile siempre commiteado.

---

## 3. Cómo crear un nuevo subagente

Cuando aparezca una necesidad recurrente que no encaja con los subagentes existentes:

1. Definir su **misión** en una frase.
2. Listar **cuándo se invoca**.
3. Listar **qué entrega**.
4. Definir **reglas estrictas**.
5. Crear `.claude/agents/<nombre>.md` con frontmatter YAML según [docs oficiales](https://code.claude.com/docs/agents/subagents).
6. Añadirlo a este `AGENTS.md`.

Plantilla mínima:

```markdown
---
name: <nombre-kebab>
description: <una frase precisa que active al subagente cuando coincida la tarea>
tools:
  - Read
  - Edit
  - Bash
---

# <Nombre>

## Misión
<una frase>

## Cuándo se invoca
<bullets>

## Producto que entrega
<bullets>

## Reglas estrictas
<bullets>

## Documentos a leer antes de empezar
<lista de paths>
```

---

## 4. Reglas comunes a todos los subagentes

Todos los subagentes de este proyecto comparten estas reglas, además de las propias:

1. **Leen `CLAUDE.md` antes de empezar** para conocer convenciones globales.
2. **Leen `prd.md`** si la tarea toca alcance de producto.
3. **Mantienen documentación al día** o delegan en `prd-keeper`.
4. **No introducen tecnologías nuevas** sin actualizar `arquitectura.md` y obtener confirmación.
5. **Tests siempre acompañan código**.
6. **Commits con Conventional Commits**.
7. **PR descriptions en castellano**.
8. **Si hay ambigüedad, preguntan** antes de inventar.

---

## 5. Coordinación entre subagentes

Algunos cambios cruzan dominios. Ejemplo: añadir una acción puntuable nueva (`share_parking`) toca:

- **Schema** → `migration-builder` (añade enum value, ajusta seeds).
- **Lógica** → `gamification-engineer` (Edge Function que la otorga).
- **UI** → `ui-implementer` (botón de compartir en detalle).
- **E2E** → `e2e-author` (flow que cubre la acción).
- **Documentación** → `prd-keeper` (`gamificacion.md`, `modelo-datos.md`).

En ese caso, Claude Code principal **orquesta** la secuencia, no la hace en paralelo desordenada. El orden recomendado es:

```
1. prd-keeper       (define la acción en docs)
2. migration-builder (refleja en schema)
3. gamification-engineer (implementa lógica)
4. ui-implementer   (UI)
5. e2e-author       (cobertura E2E)
6. prd-keeper       (cierra: revisión final de coherencia)
```

---

## 6. Subagentes de futuro (no implementados aún)

Lista de subagentes que probablemente queramos crear post-MVP:

- `i18n-translator`: cuando llegue el inglés en v1.1.
- `analytics-curator`: para mantener limpia la lista de eventos en PostHog.
- `release-manager`: para automatizar release notes y submits a stores.
- `ai-moderator`: para decidir cuándo aplicar moderación automática a propuestas (post-MVP).

---

## 7. Documentos relacionados

- `CLAUDE.md` — instrucciones principales para Claude Code.
- `prd.md`, `arquitectura.md`, `modelo-datos.md`, `gamificacion.md`, `testing.md`, `infraestructura.md` — documentos canónicos.
- [Claude Code agents docs](https://code.claude.com/docs/agents/subagents) — referencia oficial.
