# RunMarket — Contexto del proyecto

## Qué es

**RunMarket** es un ecommerce especializado en productos deportivos para running (zapatillas, ropa técnica, accesorios). Su diferencial es el filtrado multidimensional por atributos propios del running: `distance`, `surface`, `level` y `objective`.

El MVP cubre: catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos. No requiere autenticación.

## Stack técnico

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Estado:** Context API (`CartContext`) + localStorage para persistencia de sesión (Client Components)
- **Iconos:** Lucide React
- **Notificaciones:** Sonner (toasts)
- **Prototipo de referencia:** Figma Make (`fileKey: 0wtedXb5138odnAOgHlMiA`)

## Documentación

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Lean Canvas, casos de uso detallados con diagramas UML y decisiones de diseño UX | Trabajo en producto, nuevas features o casos de uso |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Evaluación de opciones de arquitectura, diagramas C4 (Context → Code), stack tecnológico, estructura de ficheros y decisiones de diseño | Cambios estructurales, nuevos componentes, decisiones de infraestructura |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) | Diagrama ER, decisiones de modelado (arrays GIN vs junction tables), esquema Prisma y restricciones de integridad | Cambios en entidades, nuevas queries, migraciones |
| [`docs/USER-STORIES.md`](docs/USER-STORIES.md) | 13 historias de usuario con criterios de aceptación, estimación y prioridad organizadas por caso de uso | Siempre que se mencione una US (p.ej. "implementa US-007"): leer la historia completa y sus criterios de aceptación antes de escribir código |
| [`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md) | Estándares de código: TypeScript, estructura de capas, naming, testing y commits | Antes de escribir código nuevo, revisar una PR o incorporar una nueva funcionalidad |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Tokens de color (paleta shadcn + tokens RunMarket), tipografía, layout, anatomía de componentes (ProductCard, FilterPanel, badges), mapeos dominio→etiqueta UI y patrones de estados (loading/empty/error) — extraído del prototipo Figma Make | **Obligatorio antes de implementar cualquier componente o página Frontend.** Es la fuente de verdad visual: Tailwind classes, colores semánticos `bg-rm-*`/`text-rm-*` y constantes en `lib/product-utils.ts` |
| [`docs/SDD-WORKFLOW.md`](docs/SDD-WORKFLOW.md) | Workflow SDD completo: qué comandos ejecutas tú y qué pasos son automáticos, modos, mapa de agentes/skills | Antes de usar el sistema AI por primera vez o para resolver dudas sobre el flujo |

## Sistema de workflow SDD (`.claude/`)

`.claude/` es la **única fuente de verdad** para agents, skills y commands del
workflow Specification-Driven Development. El backlog técnico vive en `docs/backlog/`
(US activas) y `docs/backlog/archive/` (US cerradas). Flujo: refinar US → implementar
backend/frontend con **TDD obligatorio** → verificar → **revisión OWASP con bucle de
remediación** → cierre.

| Tipo de tarea | Leer primero |
|---|---|
| **Producto / refinar US** | [`.claude/agents/product-owner.md`](.claude/agents/product-owner.md) · [`.claude/skills/breakdown-user-story/SKILL.md`](.claude/skills/breakdown-user-story/SKILL.md) · `docs/USER-STORIES.md` |
| **Implementar US (workflow)** | [`.claude/skills/implement-user-story/SKILL.md`](.claude/skills/implement-user-story/SKILL.md) · [`.claude/skills/implement-task/SKILL.md`](.claude/skills/implement-task/SKILL.md) |
| **Backend** | [`.claude/agents/backend-developer.md`](.claude/agents/backend-developer.md) · [`.claude/skills/backend-feature/SKILL.md`](.claude/skills/backend-feature/SKILL.md) · [`.claude/skills/tdd-implementation/SKILL.md`](.claude/skills/tdd-implementation/SKILL.md) |
| **Frontend** | [`.claude/agents/frontend-developer.md`](.claude/agents/frontend-developer.md) · [`.claude/skills/frontend-feature/SKILL.md`](.claude/skills/frontend-feature/SKILL.md) · [`.claude/skills/tdd-implementation/SKILL.md`](.claude/skills/tdd-implementation/SKILL.md) |
| **Seguridad** | [`.claude/agents/security.md`](.claude/agents/security.md) · [`.claude/skills/owasp-security-review/SKILL.md`](.claude/skills/owasp-security-review/SKILL.md) |
| **Revisión de código** | [`.claude/skills/code-review/SKILL.md`](.claude/skills/code-review/SKILL.md) |

Comandos: `/refine-user-story` · `/implement-user-story` ·
`/implement-task` · `/archive-user-story`.

**Reglas universales del workflow:**

- TDD obligatorio en implementación (fases 2-3 y fixes de seguridad): test que falla →
  código mínimo → refactor en verde. Si no es viable, documentar el motivo en el backlog.
- Toda US pasa revisión OWASP antes de cerrarse; HIGH/CRITICAL se corrigen y se
  re-revisa hasta quedar limpio.
- Backlog en **español**; `.claude/` en **inglés**.
- Cada tarea mapea ≥1 criterio de aceptación de la US. No expandir scope fuera de la US.
- Las reglas de seguridad de este documento (más abajo) son verificaciones concretas
  del workflow, no recomendaciones.
- **Todo commit sigue Conventional Commits** (inglés, imperativo, conciso). Leer
  [`.claude/skills/conventional-commit/SKILL.md`](.claude/skills/conventional-commit/SKILL.md)
  antes de hacer cualquier `git commit`.

## Rutas principales de la aplicación

| Ruta | Componente (page) | Tipo | Funcionalidad |
|---|---|---|---|
| `/` | `CatalogPage` | Server Component | Catálogo con filtros |
| `/product/[id]` | `ProductDetailPage` | Server Component | Ficha de producto |
| `/cart` | `CartPage` | Client Component | Carrito de compra |
| `/checkout` | `CheckoutPage` | Client Component | Checkout simulado (3 pasos: envío → pago → revisión) |
| `/orders` | `OrdersPage` | Client Component | Historial de pedidos |

## Entidades de datos clave

- `Product` — id, name, brand, price, image, category, subcategory, description, features[], distance[], surface[], level[], objective[], sizes[], colors[], stock
- `Cart` — id, sessionId, items[] (carrito persistente por sesión en BD)
- `CartItem` — id, cartId, productId, quantity, size?, color?
- `Order` — id (`ORD-{timestamp}`), sessionId, date, status, subtotal, shipping, total, datos de envío (shippingName, shippingEmail, shippingPhone?, shippingAddress, shippingCity, shippingPostalCode, shippingCountry)
- `OrderItem` — id, orderId, productId, productName, productBrand, productPrice (snapshot), quantity, size?, color?

> El modelo completo, con enums y restricciones, vive en [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) (fuente de verdad).

## Convenciones

- Diagramas siempre en formato **Mermaid**
- Tono académico y profesional en documentación
- Todas las decisiones técnicas deben estar justificadas

### Código — reglas críticas (ver detalle en `docs/CODING-STANDARDS.md`)

**TypeScript strict siempre.** `"strict": true` en ambos `tsconfig.json`. Prohibido `any`.

**Las capas no se saltan.** Controllers no importan Prisma. Services no importan Express ni Prisma. Repositories son el único punto de contacto con Prisma. Romper esta jerarquía hace los tests unitarios imposibles.

**Repositories mapean a tipos de dominio.** Las capas superiores nunca ven tipos generados por Prisma. El mapeo ocurre dentro del repository.

**`'use client'` solo cuando sea necesario.** Empezar como Server Component; bajar a Client Component solo cuando el componente use estado, efectos o event handlers.

**Un fichero por recurso por capa, en kebab-case.** `catalog.service.ts`, `product.repository.ts`, `products.controller.ts`.

**Tests unitarios de Services: mocks de repositorio, nunca base de datos real.**

## Seguridad — reglas no negociables

Estas reglas aplican siempre durante la implementación. Son específicas al stack y complementan OWASP Top 10.

### Backend (Express + Prisma + Zod)

**Nunca confiar en datos de precio o total del cliente**
El precio de cada ítem se lee siempre de la base de datos (`ProductRepository`) en el momento de crear el pedido. El campo `price` que pueda llegar en el body del request se ignora. `ORDER_ITEM.productPrice` se toma del `Product` devuelto por Prisma, nunca del payload.

**Zod en modo estricto en los boundaries de la API**
Todos los schemas Zod usados en controllers deben usar `.strict()` (o `.strip()` como mínimo). Nunca `.passthrough()` en schemas de entrada expuestos a la red. Esto evita que campos no declarados pasen silenciosamente a la capa de negocio.

**Prisma raw queries solo con template literals parametrizados**
Si en algún caso es necesario usar `$queryRaw`, usar obligatoriamente la sintaxis de tagged template literal de Prisma (`$queryRaw\`SELECT ... WHERE id = ${id}\``), que parametriza automáticamente. Nunca construir el string SQL con concatenación o interpolación manual.

**CORS sin wildcard fuera de desarrollo**
El middleware `cors.ts` debe leer el origen permitido de una variable de entorno (`CORS_ORIGIN`). El valor `origin: '*'` solo es aceptable en entorno local de desarrollo y debe bloquearse en staging y producción.

**sessionId generado con `crypto.randomUUID()`**
El `sessionId` que identifica carrito y pedidos de una sesión debe generarse server-side con `crypto.randomUUID()` (módulo nativo de Node.js 19+) y transmitirse al cliente mediante cookie. Nunca usar `Math.random()`, timestamps ni IDs predecibles.

**Respuestas de error sin detalles internos**
El `error-handler.ts` global debe mapear errores de Prisma (`PrismaClientKnownRequestError`, etc.) y errores internos de Express a respuestas genéricas `{ error: string }` antes de enviarlas al cliente. Stack traces y códigos de error de Prisma solo van al logger del servidor, nunca al body de la respuesta.

**Validación de stock también en CheckoutService**
`CartService.validateStock()` protege al añadir ítems, pero entre ese momento y el checkout puede haber pasado tiempo. `CheckoutService.processCheckout()` debe re-validar stock de todos los ítems del carrito antes de crear el `ORDER`, dentro de una transacción Prisma.

**Rate limiting obligatorio en endpoints de mutación**
Los endpoints `POST /api/checkout`, `POST /api/cart` y `PUT /api/cart/:productId` deben tener rate limiting más restrictivo que el catálogo. Límite recomendado: 20 req/min por IP en checkout. Usar `express-rate-limit`.

**No loggear PII**
El logger (Morgan + logger propio) no debe registrar campos de PII: `email`, `phone`, `shippingAddress`, `cardNumber`, `cardCVV`. Configurar Morgan con un formato custom que excluya el body de las peticiones a `/api/checkout`.

### Frontend (Next.js / React)

**Nunca almacenar datos de tarjeta en estado o localStorage**
El `CartContext` y cualquier otro estado de React o localStorage solo puede contener ítems de carrito y resumen de pedido. El `sessionId` vive en una cookie gestionada por el servidor, no en localStorage. Los datos de `PaymentData` solo viven en el estado local del componente `CheckoutPage` durante el flujo y se descartan al completar o abandonar.

**Sanitizar parámetros de URL antes de usarlos como filtros**
Los valores de query string que alimentan los filtros del catálogo (`?distance=marathon&surface=trail`) deben validarse contra los enums cerrados del dominio antes de enviarse a la API. Un valor desconocido se descarta silenciosamente, no se reenvía.

**`dangerouslySetInnerHTML` prohibido**
No usar `dangerouslySetInnerHTML` en ningún componente. Cualquier contenido dinámico (descripciones de producto, nombres) se renderiza como texto plano a través de JSX, que escapa automáticamente.
