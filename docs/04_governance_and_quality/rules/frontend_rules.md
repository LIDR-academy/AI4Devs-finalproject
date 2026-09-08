# 🎨 Reglas de Frontend y UX/UI - Deducción de Especificaciones

Esta directiva rige el desarrollo de la interfaz cliente para terminales táctiles de cocina y backoffice.

---

## 🛠️ Pila Tecnológica Detectada & Cumplimiento de Diseño
* **Framework Core:** React 18 + Vite 5 (TypeScript) — SPA única, sin SSR.
* **Routing:** `react-router-dom` 7 (data router). Reglas dedicadas: [`react-router_rules.md`](./react-router_rules.md). El shell de rutas (`AppShell`, `ProtectedRoute`, `router.tsx`) vive en `apps/frontend/src/app/`.
* **Estilos & Sistema de Diseño (Guard 29, `AGENTS.md`):** Vanilla CSS con variables/tokens centralizados, exportados al estándar de raíz [`/DESIGN.md`](../../../DESIGN.md) (Google Labs Spec v1.0.0, auditado con `npx -y @google/design.md lint DESIGN.md`). Toda clase específica de un único componente vive en un `Componente.module.css` colocado junto al `.tsx` e importado como `import styles from './Componente.module.css'`.
* **Manifiesto de Partials, no archivo monolítico (patrón ITCSS/7-1):** `apps/frontend/src/index.css` **no declara ninguna regla propia** — es únicamente un manifiesto de `@import url(...)` en cascada (`variables/` → `base/` → `components/` → `layout/utilities.css` al final) hacia `apps/frontend/src/styles/`. Una categoría, un archivo, ubicación predecible:
  - `styles/variables/{colors,typography,spacing,motion}.css` — tokens (`--color-*`, `--font-family-*`/`--fs-*`/`--fw-*`, `--space-*`, `--duration-*`/`--ease-*`).
  - `styles/base/{reset,typography}.css` — reset y estilos base de encabezados.
  - `styles/components/{buttons,inputs,cards,tables,modals,banners,pin,user-management}.css` — clases compartidas por 2+ componentes, una por dominio.
  - `styles/layout/utilities.css` — utilidades de una sola responsabilidad (`.flex-*`, `.mb-*`/`.p-*`, `.fs-*`/`.fw-*`); se importa **al final** a propósito, para que gane sobre estilos de componente cuando se combinan en el mismo elemento (ej. `className="card-dashboard mb-4"`).
  - **Antes de añadir un token o clase nueva:** localizar el partial de su categoría y añadirlo ahí — nunca crear una regla suelta en `index.css` ni un nuevo archivo de categoría sin verificar primero si ya existe uno. Ver el "Mapa de Ubicación en Código" de `docs/02_architecture_design/05_ui_ux_design_system.md` §9.
* **Regla Innegociable de Tokens y Estilos (Guard 29):** Queda estrictamente prohibido hardcodear colores hexadecimales o RGB en línea (`style={{ color: '#HEX' }}`) o maquetar estructuras con objetos `style={{ display: 'flex', gap: ... }}` inline en componentes JSX. Todos los estilos visuales y de layout DEBEN consumir las clases CSS declaradas en `index.css` o `*.module.css` (ej. `className="btn-touch flex-between"`). Única excepción permitida: valores numéricos calculados dinámicamente en runtime (ej. porcentajes de ancho en barras de progreso `style={{ width: `${pct}%` }}`).
* **Persistencia Offline:** Dexie.js (IndexedDB / Cola FIFO local)
* **Testing UI & QA Visual:** Vitest / React Testing Library / SK-21 a11y Auditor

---

## 📱 1. Ergonomía Táctil y Layout
* **Objetivos Táctiles:** Botones e inputs interactivos deben medir mínimo **48px x 48px** con **8px** de margen alrededor. Teclado de PIN: **64px x 64px**. (El piso normativo de WCAG 2.2 SC 2.5.8 es 24×24 CSS px con excepción de espaciado — el 48px de este proyecto es más estricto y prevalece.)
* **Tokens de Diseño (Sistema FEFO, `US-022`/`US-023`):** Usar exclusivamente las variables CSS de `apps/frontend/src/styles/variables/` (turno Día por defecto en `:root`, turno Noche en `:root[data-theme="dark"]`) — nunca hardcodear un valor que ya existe como token. Encabezados de tarjeta con badge circular a la izquierda y separador de 2px `dashed var(--rule)`; esquinas rectas (`border-radius: 0`) salvo el botón de acción circular de la lámina "Aplicación".

---

## ♿ 2. Accesibilidad y Legibilidad (WCAG 2.2)
* **Contraste de Texto:** Exigir una relación de contraste mínima de **4.5:1** (Nivel AA) y objetivo **7:1** (Nivel AAA para entornos industriales de cocina).
* **Contraste de Componentes (SC 1.4.11):** El contorno de todo control interactivo (input, botón, toggle, checkbox) que sea el único indicador visual de su límite debe alcanzar **≥ 3:1** contra el fondo adyacente. Por esto los bordes de control usan `var(--rule)` (tinta) y no `var(--border-hairline)` — el hairline decorativo (v5.3.0) va solo en contenedores/paneles/divisores.
* **Foco visible (SC 2.4.7 / 2.4.11):** Todo elemento interactivo muestra un `:focus-visible` con contraste ≥ 3:1, y ningún elemento fijo (topbar, toast) lo obstruye al tabular. Implementado como regla global en `styles/base/reset.css` (`outline: 3px solid var(--color-primary); outline-offset: 2px`); un componente solo la anula si aporta un anillo equivalente propio (ej. `.input-touch`).
* **Autenticación accesible (SC 3.3.8):** El campo de PIN/credencial permite pegar y no bloquea gestores de contraseñas (`autocomplete` correcto, sin `onpaste` cancelado).
* **Reducción de movimiento (SC 2.3.3):** `styles/base/reset.css` declara una regla global `@media (prefers-reduced-motion: reduce)` que vuelve instantánea toda transición/animación. No se usa el patrón opt-in (`no-preference`) por componente — el reset global es la fuente única; una animación que necesite sobrevivir en modo reducido (ninguna hoy) debe justificarlo explícitamente.
* **Medida de legibilidad:** Todo bloque de texto corrido (subtítulo de panel, texto de ayuda, párrafo explicativo) que renderice en el ancho completo del `<main>` acota su ancho a **45–75 caracteres por línea** — utilidad `.measure` (`max-width: 65ch`, en `styles/layout/utilities.css`). No aplica a texto dentro de modales (ya acotados por `.modal-*`), celdas de tabla, ni chips.
* **Independencia del Color:** Notificaciones semafóricas (Rojo/Amarillo/Verde) deben ir acompañadas obligatoriamente de texto o íconos descriptivos.
* **Token de Texto Dedicado sobre Fondo Auto-Tintado (Discovered in `TK-081-FE`, reforzado en `TK-084-FE`):** Prohibido reutilizar un color de estado (`--color-danger`, `--color-warning`, `--color-success`, `--color-info`, etc.) como `color` de texto cuando ese mismo texto se renderiza sobre un fondo tintado del propio color (patrón `color-mix(in srgb, var(--color-X) 12-15%, transparent)`, común en badges/chips). Ese color fue elegido pensando en su uso como relleno/ícono, no como texto sobre su propia versión diluida — el par puede caer por debajo de AA (verificado: `~3.98:1`, `~3.57:1` y `~4.19:1` en distintos badges de este proyecto) aunque el mismo color SÍ cumpla contraste como texto sobre el fondo base de la página. Esta regla es **incondicional**: se debe declarar un token `--color-X-text` separado siempre que exista el patrón, incluso si un cálculo puntual da un resultado que técnicamente pasa AA — un margen ajustado (`TK-084-FE` encontró un caso a 4.63:1, apenas 0.13 sobre el piso de 4.5:1) no es motivo válido para omitir el token dedicado. El contraste se calcula por fórmula de luminancia relativa WCAG (no estimado a ojo) **contra el fondo real donde el elemento realmente compone** — el color-mix se mezcla sobre el fondo del contenedor inmediato que lo envuelve en el DOM (ej. `--bg-root` si el badge vive dentro de una fila con ese fondo), no contra `--bg-card` u otro fondo asumido por conveniencia; verificar el contenedor real antes de calcular, no asumirlo.

---

## 🛡️ 3. Arquitectura, SOLID y Estados Defensivos
* **RBAC al Reubicar un Componente a un Contexto Menos Restringido (Discovered in `TK-085-FE`, `AUDIT-DEV-003` D-1):** Antes de montar un componente existente en una ruta o contenedor con **menor restricción de acceso** que su punto de montaje anterior, auditar cada `<button>` / acción de mutación del componente contra el RBAC del endpoint que dispara. Si el endpoint exige un rol superior al de la nueva ubicación, la acción se renderiza condicionalmente por rol (prop `canManage`/equivalente con default seguro `false`), nunca se deja fallar en 403 — un botón que devuelve 403 es una regresión de UX, no "cero cambio funcional". Caso concreto: mover `InsumoCatalogPanel`/`RecipeCatalogPanel` del menú `Administración ▾` (gate `userRole !== 'ADMIN'`) a las rutas de operario `/estaciones` y `/recetas` expuso `+ Nuevo Insumo` / `Reabastecer` / `+ Nueva Receta` (todos `requireRole('ADMIN')` en backend) a `KITCHEN_STAFF`.
* **Abstracción por Repositorios (DIP):** Componentes React consumen la API mediante interfaces de repositorio (`IRemanenteRepository`), soportando repositorios HTTP o InMemory (Mock).
* **Custom Hooks (SRP):** Encapsular la lógica de estado o colas de eventos en Custom Hooks dedicados.
* **Limpieza Incondicional de Estado Derivado en Efectos Dependientes de una Key (Discovered in `TK-080-FE`):** En un `useEffect` que dispara una consulta asíncrona dependiente de una key cambiante (`insumoId`, filtro, término de búsqueda), el estado derivado de la respuesta anterior DEBE limpiarse incondicionalmente al inicio del efecto — antes de cualquier `if (!key) return` — y no solo en la rama donde la key es falsy. De lo contrario, al cambiar de un valor de key A a un valor B mientras la nueva consulta está en vuelo, el resultado ya resuelto de A permanece visible y se atribuye erróneamente al valor B recién seleccionado (falso positivo/negativo transitorio pero engañoso para el usuario), incluso con guard de cancelación (`let cancelled = false`) correctamente implementado — el guard de cancelación previene que una respuesta desordenada sobrescriba una más reciente, pero no limpia el estado obsoleto del valor previamente seleccionado.
* **`useLayoutEffect` para Mutaciones de Atributos DOM Consumidos por CSS de Primer Pintado (Discovered in `TK-081-FE`):** Prohibido usar `useEffect` para mutar un atributo del DOM (`document.documentElement.dataset.X`, `lang`, `dir`, etc.) del que depende una regla CSS que determina la apariencia del primer pintado (ej. un selector `:root[data-theme="dark"]`). `useEffect` se programa después de que el navegador pinta, así que en el caso exacto que la funcionalidad suele existir para resolver — una preferencia guardada que difiere del valor por defecto de la hoja de estilos (ej. `prefers-color-scheme` del SO) — se produce un parpadeo real con el valor incorrecto antes de que el efecto corra. `useLayoutEffect` corre sincrónicamente antes del pintado y cierra ese hueco; en una app CSR pura (sin SSR/hydration) no tiene la contraindicación habitual de `useLayoutEffect` en servidor.
* **Estados Obligatorios:** Implementar obligatoriamente Skeletons (Loading), Empty State, Error State con reintento, y Banner Offline.
* **Capa de Reutilización Cross-Cutting (`src/shared/`):** Todo módulo usado por 2+ features vive en `src/shared/`, nunca duplicado dentro de `features/*`. Subcarpetas establecidas:
  - `shared/http/apiClient.ts`: cliente HTTP único (`apiRequest<T>`), maneja el Bearer token y errores (`ApiError`). Ningún servicio de `features/*/services/` debe llamar `fetch()` directamente.
  - `shared/domain/`: Value Objects de dominio compartidos entre features (ej. `DecimalQuantity` para aritmética de cantidades, ver sección 4).
  - `shared/hooks/`: hooks transversales sin relación con un dominio de feature específico (ej. `useOnlineStatus`).
  - `shared/components/`: primitivos de UI reutilizados por 2+ pantallas (ej. `Modal`, `ModalHeader`, `ModalFooterActions`, `ErrorBanner`).
  - Antes de implementar un ticket que necesite HTTP, aritmética decimal, un hook transversal o un primitivo de UI, se debe verificar si ya existe en `shared/` antes de escribir una nueva copia (ver `SK-17` Fase 2, paso 4).

---

## 🔢 4. Formateo y Aritmética de Cantidades
* **Prohibición de `parseFloat` en Cálculos de Inventario:** Queda estrictamente prohibido realizar operaciones aritméticas de punto flotante nativo (`parseFloat`, `+`, `-`, `*`, `/`) en servicios o componentes para modificar cantidades o stocks. Se deben utilizar librerías de precisión arbitraria (`decimal.js`) o manipulaciones de cadenas exactas.
* **Formateador Inteligente (`formatQuantity`):** Los componentes de UI deben usar obligatoriamente helpers de formateo para renderizar valores numéricos.
* **Insumos Contables:** Para unidades discretas (`UNITS`, `UNIDADES`, `PZA`), mostrar enteros simples en español (ej. `12 Ud.`) evitando ceros decimales que se confundan con separadores de miles (`12.000`).
* **Botones Adaptativos:** Adaptar los decrementos rápidos según la unidad (`-1`, `-2`, `-5` para `UNITS` frente a `-0.25`, `-0.5`, `-1.0` para `KG`/`L`).

---

## 🚨 5. Manejo Activo de Errores en Servicios
* **Prohibición de Excepciones Tragadas (*No Swallowed Catches*):** Queda estrictamente prohibido incluir bloques `catch {}` vacíos en servicios o componentes. Todo fallo de comunicación HTTP debe ser registrado con `console.error` o notificado a la interfaz del usuario.

---

## 📐 6. Accesibilidad Semántica (a11y) y Métricas de Código UI
* **Vinculación Semántica de Controles (`htmlFor` / `id`):** Todo elemento `<label>` dentro de un formulario debe incluir obligatoriamente el atributo `htmlFor` coincidiendo exactamente con el `id` único del control asociado (`<input>`, `<select>`, `<textarea>`).
* **Elementos Interactivos Nativos (`<button type="button">`):** Queda estrictamente prohibido utilizar elementos estáticos no semánticos (`<div onClick={...}>`, `<span onClick={...}>`) para desencadenar acciones. Todo control interactivo debe ser un `<button type="button">` o `<a href>` con navegación por teclado accesible.
* **Métricas de Función UI ($\le 60$ Líneas, Complejidad $\le 10$):** Ninguna función o componente React debe superar las 60 líneas de código ni una complejidad ciclomática mayor a 10. Si un modal o formulario crece, debe descomponerse inmediatamente en sub-componentes limpios y desacoplados (ej. `EditingUserForm`, `NewRoleForm`, `PermissionsList`).

---

## 🏛️ 7. Manifiesto de Ingeniería Senior React (Código Limpio & Clean Architecture)

1. **Arquitectura de Datos y Formularios:**
   - **Única Fuente de Verdad:** Componentes controlados mediante `useState` por defecto.
   - **Higienización Inicial:** Inicializar siempre estados de inputs numéricos y texto en `''` (string vacío) para prevenir la advertencia de React por cambio de no controlado a controlado.
   - **Handler Universal `[name]`:** Centralizar formulaciones extensas en objetos de estado evaluando `type === 'checkbox'` y conversiones `Number(value)`.
2. **Validación Reactiva y Desacoplamiento:**
   - **Estado Espejo (`errors`):** Las validaciones residen en un objeto espejo `errors` desacoplado de los datos del formulario.
   - **Funciones Puras:** Evaluación de reglas aislada en funciones puras o esquemas Zod.
   - **Submit Guard:** Todo `onSubmit` ejecuta `e.preventDefault()` y realiza validación en cascada antes de consumir red.
3. **Anatomía de Componente de 3 Zonas:**
   - **Zona 1 (Raíz):** Declaración de Hooks incondicionales. Lógica operativa asíncrona extraída a Custom Hooks (`use...ts`).
   - **Zona de Retorno Temprano (Early Returns):** Evaluación de Skeletons/Loading y Errores Críticos.
   - **Zona 2 (Retorno JSX Declarativo):** Marcado JSX puro actuando como función declarativa del estado y las props (<60 líneas).
4. **Gobernanza de Estilos:** Prohibición absoluta de objetos `style={{ display, gap }}` inline (salvo dinámicos numéricos de microsegundo en runtime). Todo layout consume clases utilitarias o componentes CSS.

---

## 🚫 9. Prohibición de Alertas Nativas (`alert`) y Centralización de Errores UX (Guard 38)

1. **Prohibición de `window.alert(...)` y `window.confirm(...)`:** Queda estrictamente prohibido utilizar popups nativos del navegador (`alert`, `confirm`) para notificar errores o pedir confirmación en pantallas táctiles de cocina y administración.
2. **Traductor Centralizado (`errorMessageMapper.ts`):** Todo error capturado (`catch (err)`) en servicios o componentes de UI debe procesarse obligatoriamente mediante `mapToUserFriendlyError(err)` ([`apps/frontend/src/shared/utils/errorMessageMapper.ts`](../../../apps/frontend/src/shared/utils/errorMessageMapper.ts)).
3. **Parseo Estricto de RFC 7807:** El traductor debe extraer y priorizar el campo `detail` entregado por el backend RFC 7807, traduciendo códigos técnicos (401, 403, 404, 409, 422, 429, 500, 502, 503) a mensajes claros en español.
4. **Banners Inline Desacoplados:** Las notificaciones de error en modales y paneles deben renderizarse mediante componentes inline no invasivos (`ErrorBanner`).
5. **Prohibido Sintetizar un Éxito Falso en el `catch` de un Servicio (C-DEV-006-3, Discovered in `AUDIT-DEV-006` F-5):** Un bloque `catch` en la capa de servicio HTTP (`*.service.ts`) NUNCA debe devolver un objeto con la forma de la respuesta de éxito de una **mutación** (p. ej. `recordExtraction` devolviendo un `ExtractionResult` fabricado con un `remanenteId` inventado tras un `422`/`500`). Eso le muestra al operario una operación exitosa que no ocurrió — en un sistema de inventario, corrupción de la confianza operativa. El error se propaga al componente para su traducción vía `mapToUserFriendlyError` → `ErrorBanner`. Un fallback de **solo-lectura** a datos estáticos (catálogo, listas) es admisible únicamente detrás de un flag de entorno explícito (`VITE_DEMO_MODE`), nunca por defecto y nunca para una escritura.


---

## 🌐 8. Política de Resiliencia de Red y Cliente HTTP Compartido (`apiClient.ts`)

1. **Abstracción Única de Comunicación (`apiRequest<T>`):** Queda estrictamente prohibido invocar `fetch()` directamente en componentes React o servicios de dominio. Todas las operaciones HTTP deben pasar por [`src/shared/http/apiClient.ts`](../../../apps/frontend/src/shared/http/apiClient.ts).
2. **Estrategia de Reintentos Automáticos (Exponential Backoff):**
   - El cliente reintenta automáticamente fallos transitorios de red (`TypeError`, interrupciones de socket) y estados HTTP transitorios (`502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`).
   - El parámetro `retries` define el número de reintentos exponenciales (`retryDelayMs * 2^attempt`).
   - **Regla de Idempotencia:** Las operaciones mutantes no idempotentes (`POST` / `PUT`) solo activan reintentos cuando se solicite de forma explícita (`retries: N`), previniendo registros duplicados de merma o extracción.
3. **Cancelación de Peticiones (`AbortSignal`):** Todo formulario o selector con autocompletado en tiempo real debe pasar el objeto `signal: controller.signal` a `apiRequest` para cancelar peticiones desfasadas y evitar *Race Conditions*.
4. **Desacoplamiento de Proveedor de Token (`setTokenProvider`):** El cliente HTTP soporta inyección de `TokenProvider` dinámico para simplificar mocks unitarios y permitir middleware de refresh token sin acoplamientos circulares.




