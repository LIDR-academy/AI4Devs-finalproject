# Guía de desarrollo Vue 3 (MyTreeLibrary)

Guía para el equipo que **empieza con Vue** en este monorepo. El objetivo es que todo el mundo siga el **mismo diseño**, las **buenas prácticas** del proyecto y lo acordado en la revisión de arquitectura del frontend.

**Referencias obligatorias (léelas en paralelo):**

- Reglas Cursor (normas del repo): [`.cursor/rules/fronted-vue3.mdc`](../../.cursor/rules/fronted-vue3.mdc), [`.cursor/rules/frontend-security.mdc`](../../.cursor/rules/frontend-security.mdc), [`.cursor/rules/frontend-ux.mdc`](../../.cursor/rules/frontend-ux.mdc)
- Revisión de arquitectura implementada: [docs/software-revisions/2026-04-25-frontend-architecture-review.md](../software-revisions/2026-04-25-frontend-architecture-review.md)
- Arranque y variables: [frontend/README.md](../../frontend/README.md)
- Producto y copy (IA orientativa): [`.cursor/rules/product-context.mdc`](../../.cursor/rules/product-context.mdc) (si aplica a tu pantalla)

---

## 1. Qué stack usamos

| Pieza | Rol |
|-------|-----|
| **Vue 3** | UI reactiva |
| **TypeScript** | Tipado en código nuevo |
| **Vite** | Dev server y build |
| **Vue Router** | Rutas y guards |
| **Pinia** | Estado global (p. ej. sesión) |
| **vue-i18n** | Textos en español (locale `es`) |
| **oidc-client-ts** | OIDC Authorization Code + PKCE con Keycloak |

Todo el código de la SPA vive bajo **`frontend/src/`**. Mapa de alta: `components/TreeLocationMapPreview.vue` (Leaflet/OSM); uso y atribución en [`frontend/README.md`](../../frontend/README.md) (sección *Mapa*).

---

## 2. Mentalidad: tres capas en la cabeza

Piensa siempre en **tres responsabilidades distintas**:

1. **Vista** (`.vue`): maquetación, eventos de usuario, enlazar datos al template.
2. **Lógica reutilizable o de pantalla** (`composables/`, `stores/`): estado, validación, orquestación.
3. **Infraestructura** (`services/`): HTTP, OIDC, URLs, sin copy de usuario final.

**Mal ejemplo:** un componente de 400 líneas con `fetch`, validación y `t('...')` mezclados.

**Buen ejemplo:** la vista llama a un composable; el composable usa servicios; los textos vienen de i18n.

---

## 3. Estructura de carpetas (mapa mental)

```
frontend/src/
├── views/          # Pantallas enlazadas a rutas
├── components/     # Piezas reutilizables (cuando crezcan)
├── composables/    # Lógica reutilizable (useXxx)
├── stores/         # Pinia (estado global)
├── services/       # HTTP, OIDC, config
├── router/         # Definición de rutas y guards
├── types/          # DTOs TypeScript alineados con API
└── i18n/           # Mensajes y configuración i18n
```

**Convención de imports:** usa el alias **`@/`** que apunta a `src/` (evita `../../../`).

```ts
import { apiFetch } from '@/services/http/apiClient'
import type { CreateTreeRequest } from '@/types/catalog'
```

---

## 4. Vue 3: Composition API y `<script setup>`

Cada vista o componente suele tener:

- `<script setup lang="ts">` — lógica y imports.
- `<template>` — HTML declarativo.
- Estilos: preferir **CSS global del proyecto** (`style.css`) + clases; no estilos inline.

**Ejemplo mínimo de componente:**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}
</script>

<template>
  <p>Contador: {{ count }}</p>
  <button type="button" @click="increment">+1</button>
</template>
```

**Reglas del equipo:**

- Preferir **`ref` / `computed`** en `<script setup>` antes que mezclar lógica compleja en el template.
- **`defineProps` y `defineEmits` tipados** en componentes con interfaz pública.

```vue
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <label class="form-label" :for="label">{{ label }}</label>
  <input
    :id="label"
    class="form-control"
    type="text"
    :value="props.modelValue"
    @input="onInput"
  />
</template>
```

---

## 5. Composables: una responsabilidad

Un **composable** es una función `useAlgo()` que encapsula estado y comportamiento reutilizable.

### 5.1 Patrón que seguimos en el proyecto

Separa en **tres piezas** cuando una pantalla crece (como el alta de árbol):

| Pieza | Qué hace | Ejemplo en repo |
|-------|----------|------------------|
| Validación **pura** | Sin Vue Router, sin i18n, sin `fetch` | `composables/createTreeFormValidation.ts` |
| Mapeo de errores API → texto | `useI18n` + tipos `HttpError` / `NetworkError` | `composables/useApiErrorMapper.ts` |
| Orquestación de la vista | Une validación, servicios y estado `loading`/`error` | `composables/useCreateTreeForm.ts` |

**Ejemplo de orquestación (simplificado):**

```ts
// Pseudocódigo del patrón
async function loadData() {
  isLoading.value = true
  error.value = ''
  try {
    data.value = await fetchFromApi()
  } catch (e) {
    error.value = toMessage(e) // viene del mapper i18n
  } finally {
    isLoading.value = false
  }
}
```

**No hagas:** `authService.login()` desde un composable de formulario para arreglar un 401. Eso lo centraliza **`apiClient`** y el **router guard**.

---

## 6. Estado global: Pinia + fachada `useAuth`

La sesión OIDC vive en un **store Pinia** (`stores/auth.ts`). El composable `useAuth()` es una **fachada** para que las vistas no importen el store directamente si no quieren.

**En vistas:**

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
</script>

<template>
  <p v-if="!auth.isReady">Cargando sesión…</p>
  <button v-else-if="!auth.isAuthenticated" type="button" @click="auth.login('/ruta/destino')">
    Entrar
  </button>
</template>
```

Notas:

- `isAuthenticated` es un **`computed`**, no una función: en plantilla usas `auth.isAuthenticated` (sin `()`).
- `isReady` indica que terminó la inicialización no bloqueante (ver `main.ts` + revisión punto 4).

---

## 7. Router: rutas protegidas y errores de IdP

Las rutas con `meta: { requiresAuth: true }` pasan por un **guard** que:

1. Lee usuario actual.
2. Intenta renovación silenciosa con **timeout corto** (no bloquear la UX).
3. Si hace falta, redirige a login interactivo (Keycloak).
4. Si el IdP falla, manda a una **vista de error** con CTA (`/auth/error`), no pantalla en blanco.

**Para añadir una ruta protegida:**

```ts
{
  path: '/mi-ruta',
  name: 'mi-ruta',
  component: MiVista,
  meta: { requiresAuth: true },
}
```

---

## 8. Servicios HTTP: solo por `apiFetch`

**Nunca** llames `fetch` desde un `.vue` para APIs del backend.

Flujo:

1. **`services/http/apiClient.ts`**: `apiFetch`, Bearer, errores tipados (`HttpError`, `NetworkError`), query params, `signal` para abort, reintento en 401 con `signinSilent` y fallback a login.
2. **`services/catalog/catalogService.ts`** (u otros): funciones por dominio que llaman a `apiFetch`.

**Ejemplo de servicio:**

```ts
import { apiFetch } from '@/services/http/apiClient'

export async function fetchItems(signal?: AbortSignal) {
  return apiFetch<{ id: number }[]>('/api/catalog/items', {
    query: { page: 0, size: 20 },
    signal,
  })
}
```

**Errores:** el cliente **no** devuelve frases en castellano para el usuario; lanza `HttpError` / `NetworkError`. El copy está en **`i18n`** vía `useApiErrorMapper`.

---

## 9. Peticiones cancelables (listados / filtros)

Cuando el usuario cambie filtros rápido o navegue, **aborta** la petición anterior para evitar condiciones de carrera.

Usa el composable **`useAbortableRequest`**:

```ts
import { useAbortableRequest, isAbortError } from '@/composables/useAbortableRequest'

const { runWithAbort } = useAbortableRequest()

async function reload() {
  try {
    const data = await runWithAbort((signal) => fetchItems(signal))
    items.value = data
  } catch (e) {
    if (isAbortError(e)) return
    showError(e)
  }
}
```

Más detalle: [frontend/README.md](../../frontend/README.md) (sección de patrón HU-007/HU-008).

---

## 10. Internacionalización (vue-i18n)

- Los textos viven en **`frontend/src/i18n/locales/es.ts`** (u otros ficheros por idioma).
- En vistas y composables de UI: **`useI18n()`** y `t('clave.anidada')`.
- **No** hardcodees copy nuevo en `.vue` si es texto de producto.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h2>{{ t('home.title') }}</h2>
</template>
```

El proyecto tiene **tipado de mensajes** (`MessageSchema`, `as const`) para reducir typos en claves; al añadir claves nuevas, hazlo en el objeto de locale y úsalas desde `t()`.

---

## 11. Estilos: tokens y clases de formulario

- Variables globales en **`:root`** dentro de `style.css` (fondo, texto, primario, etc.).
- **Evita** estilos globales del tipo `input { ... }` para todo el sitio: chocan con librerías UI.
- Para formularios usamos clases como **`.form-label`**, **`.form-control`**, **`.form-textarea`** (ver `CreateTreeView.vue`).

---

## 12. Accesibilidad y UX mínima (checklist rápido)

- Cada campo con **`<label>`** visible y asociado (`for` / `id`).
- Botones con **`type="button"`** o **`type="submit"`** según corresponda.
- Errores: **`role="alert"`** o regiones con **`aria-live`** donde aplique.
- Estados: **loading**, **error**, **vacío**, **éxito** en pantallas que llaman a API.
- Enlaces externos: `target="_blank"` + **`rel="noopener noreferrer"`**.

---

## 13. Seguridad (recordatorio corto)

- **`VITE_*`** es público en el bundle: **no** secretos.
- **No** loguees tokens; **no** los pongas en URLs.
- **`v-html`**: solo con contenido confiable o saneado explícitamente.

Detalle: regla [frontend-security.mdc](../../.cursor/rules/frontend-security.mdc).

---

## 14. Tests (Vitest)

- Comando: **`npm run test`** en `frontend/`.
- Tests junto al código: `*.test.ts` (p. ej. validación pura, `apiClient` con `fetch` mockeado).
- **No** llames a Keycloak ni al gateway real en unit tests; usa mocks.

Config: `frontend/vitest.config.ts`.

---

## 15. Comandos útiles

```bash
cd frontend
npm install
npm run dev      # desarrollo
npm run build    # tipado + bundle producción
npm run test     # Vitest
```

Proxy local: rutas **`/api/*`** → gateway (ver `frontend/README.md`).

---

## 16. Checklist antes de abrir PR (frontend)

- [ ] Sin `fetch` directo en componentes para API del producto.
- [ ] Textos nuevos en **`i18n/locales`**, no hardcodeados.
- [ ] Imports con **`@/`**.
- [ ] Composables **acotados**; validación pura separada si aplica.
- [ ] Estados **loading / error / success** donde haya API.
- [ ] `npm run build` y **`npm run test`** pasan.

---

## 17. Dónde profundizar

| Tema | Documento |
|------|-------------|
| Arquitectura SPA + auth (diagramas) | [readme.md](../../readme.md) (sección 2.1.1 Autenticación en Front) |
| Revisión y deuda resuelta | [2026-04-25-frontend-architecture-review.md](../software-revisions/2026-04-25-frontend-architecture-review.md) |
| OpenAPI / contratos | [docs/api/openapi.yaml](../api/openapi.yaml) |
| Cursor y reglas `.mdc` | [cursor-rules-primer.md](cursor-rules-primer.md) |

Si tras leer esta guía tienes dudas sobre un ticket concreto, enlaza la **HU** o el fichero de desglose en el PR o en el chat con la IA.
