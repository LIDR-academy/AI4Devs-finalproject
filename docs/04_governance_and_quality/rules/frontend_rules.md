# 🎨 Reglas de Frontend y UX/UI - Deducción de Especificaciones

Esta directiva rige el desarrollo de la interfaz cliente para terminales táctiles de cocina y backoffice.

---

## 🛠️ Pila Tecnológica Detectada & Cumplimiento de Diseño
* **Framework Core:** React / Next.js (TypeScript)
* **Estilos & Sistema de Diseño (Guard 29, `AGENTS.md`):** Vanilla CSS con variables/tokens centralizados en `index.css`, exportados al estándar de raíz [`/DESIGN.md`](../../../DESIGN.md) (Google Labs Spec v1.0.0, auditado con `npx -y @google/design.md lint DESIGN.md`). `index.css` contiene solo la capa compartida (tokens de espaciado/tipografía, botones, primitivas de layout — clases usadas por 2+ componentes); toda clase específica de un único componente vive en un `Componente.module.css` colocado junto al `.tsx` e importado como `import styles from './Componente.module.css'`.
* **Regla Innegociable de Tokens y Estilos (Guard 29):** Queda estrictamente prohibido hardcodear colores hexadecimales o RGB en línea (`style={{ color: '#HEX' }}`) o maquetar estructuras con objetos `style={{ display: 'flex', gap: ... }}` inline en componentes JSX. Todos los estilos visuales y de layout DEBEN consumir las clases CSS declaradas en `index.css` o `*.module.css` (ej. `className="btn-touch flex-between"`). Única excepción permitida: valores numéricos calculados dinámicamente en runtime (ej. porcentajes de ancho en barras de progreso `style={{ width: `${pct}%` }}`).
* **Persistencia Offline:** Dexie.js (IndexedDB / Cola FIFO local)
* **Testing UI & QA Visual:** Vitest / React Testing Library / SK-21 a11y Auditor

---

## 📱 1. Ergonomía Táctil y Layout
* **Objetivos Táctiles:** Botones e inputs interactivos deben medir mínimo **48px x 48px** con **8px** de margen alrededor. Teclado de PIN: **64px x 64px**.
* **Tokens de Diseño (Dark Petrol Dashboard):** Usar variables CSS del tema oscuro HSL con encabezados de tarjeta con badge circular turquesa a la izquierda y separador de 1px.

---

## ♿ 2. Accesibilidad y Legibilidad (WCAG 2.1)
* **Contraste de Texto:** Exigir una relación de contraste mínima de **4.5:1** (Nivel AA) y objetivo **7:1** (Nivel AAA para entornos industriales de cocina).
* **Independencia del Color:** Notificaciones semafóricas (Rojo/Amarillo/Verde) deben ir acompañadas obligatoriamente de texto o íconos descriptivos.

---

## 🛡️ 3. Arquitectura, SOLID y Estados Defensivos
* **Abstracción por Repositorios (DIP):** Componentes React consumen la API mediante interfaces de repositorio (`IRemanenteRepository`), soportando repositorios HTTP o InMemory (Mock).
* **Custom Hooks (SRP):** Encapsular la lógica de estado o colas de eventos en Custom Hooks dedicados.
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


---

## 🌐 8. Política de Resiliencia de Red y Cliente HTTP Compartido (`apiClient.ts`)

1. **Abstracción Única de Comunicación (`apiRequest<T>`):** Queda estrictamente prohibido invocar `fetch()` directamente en componentes React o servicios de dominio. Todas las operaciones HTTP deben pasar por [`src/shared/http/apiClient.ts`](../../../apps/frontend/src/shared/http/apiClient.ts).
2. **Estrategia de Reintentos Automáticos (Exponential Backoff):**
   - El cliente reintenta automáticamente fallos transitorios de red (`TypeError`, interrupciones de socket) y estados HTTP transitorios (`502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`).
   - El parámetro `retries` define el número de reintentos exponenciales (`retryDelayMs * 2^attempt`).
   - **Regla de Idempotencia:** Las operaciones mutantes no idempotentes (`POST` / `PUT`) solo activan reintentos cuando se solicite de forma explícita (`retries: N`), previniendo registros duplicados de merma o extracción.
3. **Cancelación de Peticiones (`AbortSignal`):** Todo formulario o selector con autocompletado en tiempo real debe pasar el objeto `signal: controller.signal` a `apiRequest` para cancelar peticiones desfasadas y evitar *Race Conditions*.
4. **Desacoplamiento de Proveedor de Token (`setTokenProvider`):** El cliente HTTP soporta inyección de `TokenProvider` dinámico para simplificar mocks unitarios y permitir middleware de refresh token sin acoplamientos circulares.




