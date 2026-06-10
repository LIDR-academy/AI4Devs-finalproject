# RunMarket — Estándares de código

Complementa las reglas de seguridad de `CLAUDE.md`. Se aplica a todo código nuevo o modificado en el proyecto.

---

## 1. TypeScript — común a frontend y backend

- **Strict mode** activo: `"strict": true` en ambos `tsconfig.json`. Sin excepciones.
- **Prohibido `any`**. Usar `unknown` + type guard, o tipar correctamente. El compilador es la primera línea de defensa.
- **Interfaces** para contratos públicos (lo que se exporta y se mockeará en tests). **Types** para uniones, aliases e intersecciones.
- **No `React.FC<Props>`**. Funciones normales con `interface Props` explícita definida justo encima del componente.
- **Exports nombrados** siempre. `default export` solo en page components donde el framework lo exija (Next.js App Router).
- **No castings `as X`** salvo en boundaries de parsing (Zod `.parse()` devuelve el tipo inferido; no hace falta cast). Si necesitas un cast, es señal de que falta tipado upstream.

**Tipos compartidos entre capas:**
Los tipos de dominio (`Product`, `Order`, `CartItem`, `OrderStatus`) se definen en `frontend/src/types/index.ts` como fuente de verdad del monorepo. El backend los replica en `backend/src/types/domain.ts` con la misma forma. No se comparte código compilado entre paquetes en el MVP — solo se mantienen en sync manualmente.

---

## 2. Backend — Express + Prisma + Zod

### 2.1 Estructura de ficheros

Un fichero por recurso por capa. Nomenclatura en kebab-case:

```
routes/       products.routes.ts    orders.routes.ts
controllers/  products.controller.ts  checkout.controller.ts
services/     catalog.service.ts    cart.service.ts
repositories/ product.repository.ts  order.repository.ts
schemas/      product.schemas.ts    checkout.schemas.ts
middleware/   error-handler.ts      cors.ts  logger.ts  rate-limit.ts
types/        domain.ts             errors.ts
```

Las interfaces de repositorio se colocan en el mismo fichero que el repositorio que las implementa, exportadas con prefijo `I`:

```typescript
// product.repository.ts
export interface IProductRepository { ... }
export class ProductRepository implements IProductRepository { ... }
```

### 2.2 Capas — qué puede importar qué

| Capa | Puede importar | No puede importar |
|---|---|---|
| **Router** | Controller, Express Router | Services, Repositories, Prisma |
| **Controller** | Service interfaces, Zod schemas, Express types | Prisma, Repository implementations |
| **Service** | Repository interfaces, domain types, error types | Express (`Request`/`Response`), Prisma client |
| **Repository** | Prisma client, domain types | Express, Services |

Romper esta jerarquía invalida el beneficio de la arquitectura en capas y hace los tests unitarios imposibles.

### 2.3 Controllers

- Responsabilidad única: parsear request → llamar service → devolver response.
- Validar con Zod **antes** de llamar al service. Nunca pasar `req.body` directamente.
- Respuesta tipada explícita:

```typescript
// bien
const product = await catalogService.getProductById(id);
if (!product) return res.status(404).json({ error: 'Product not found' });
return res.status(200).json(product satisfies Product);

// mal — body sin validar llega al service
const result = await catalogService.getProducts(req.query as any);
```

- Errores de dominio (`NotFoundError`, `StockError`, `ValidationError`) se lanzan desde el service y los captura el `errorHandler` global. El controller no hace `try/catch` salvo que necesite lógica de recuperación específica.

### 2.4 Services

- Sin imports de Express ni de Prisma. Solo interfaces de repositorio y tipos de dominio.
- Constructor con inyección de dependencias:

```typescript
export class CatalogService implements ICatalogService {
  constructor(private readonly productRepository: IProductRepository) {}
}
```

- Métodos públicos `async`; helpers privados síncronos cuando sea posible.
- Lanzar errores de dominio custom con mensaje descriptivo. El `errorHandler` los mapea a HTTP status.

### 2.5 Repositories

- Único punto de contacto con Prisma en todo el proyecto.
- **Mapear el modelo Prisma al tipo de dominio** dentro del repository. Las capas superiores nunca deben ver tipos generados por Prisma:

```typescript
// bien — repository mapea
private toDomain(p: PrismaProduct): Product {
  return { id: p.id, name: p.name, ... };
}

// mal — Prisma type se filtra fuera
async findById(id: string): Promise<PrismaProduct | null> { ... }
```

- Operaciones que afectan múltiples tablas usan `prisma.$transaction`.

### 2.6 Zod schemas

- Definidos en `schemas/` — nunca inline en el controller.
- `.strict()` en todos los schemas de entrada de red. Nunca `.passthrough()`.
- El schema infiere el tipo TypeScript: `type CheckoutInput = z.infer<typeof CheckoutSchema>`. No duplicar la definición manual.

### 2.7 Naming — endpoints y métodos

| Endpoint | Router | Controller method | Service method |
|---|---|---|---|
| `GET /api/products` | `ProductRouter` | `list()` | `getProducts()` |
| `GET /api/products/:id` | `ProductRouter` | `getById()` | `getProductById()` |
| `POST /api/cart` | `CartRouter` | `addItem()` | `addItem()` |
| `PUT /api/cart/:productId` | `CartRouter` | `updateItem()` | `updateItem()` |
| `DELETE /api/cart/:productId` | `CartRouter` | `removeItem()` | `removeItem()` |
| `POST /api/checkout` | `CheckoutRouter` | `process()` | `processCheckout()` |
| `GET /api/orders` | `OrderRouter` | `list()` | `getOrders()` |
| `GET /api/orders/:id` | `OrderRouter` | `getById()` | `getOrderById()` |

### 2.8 Errores de dominio

Definir en `types/errors.ts`:

```typescript
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class StockError extends Error { ... }
export class ValidationError extends Error { ... }
```

El `errorHandler` global mapea cada tipo a su HTTP status. Nunca devolver stack traces al cliente.

---

## 3. Frontend — React + TypeScript

### 3.1 Server Components vs Client Components

- **Por defecto: Server Component**. Añadir `'use client'` solo cuando sea necesario.
- `'use client'` es necesario cuando el componente usa: `useState`, `useEffect`, `useContext`, event handlers (`onClick`, `onChange`), o APIs de navegador.
- Un Server Component **no importa** nada marcado con `'use client'`. La frontera es estricta: si necesitas un componente interactivo dentro de una página SSR, extráelo a un Client Component hijo.
- Los datos se fetchean en Server Components y se pasan como props a los Client Components — no al revés.

### 3.2 Estado

- `CartContext` es el único estado global. No crear contextos adicionales en el MVP.
- Estado de formularios: `useState` local en el componente. No llevar al contexto.
- No duplicar en contexto datos que ya vienen de la API. Fetch en Server Component → prop → render.
- `localStorage` solo como caché del carrito entre recargas; el `sessionId` se gestiona en una cookie (servidor), no en localStorage. Nunca datos de pago.

### 3.3 Naming de ficheros y componentes

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componente React | PascalCase | `ProductCard.tsx` |
| Hook custom | camelCase con prefijo `use` | `useCart.ts` |
| Utility / helper | camelCase | `formatPrice.ts` |
| Fichero de tipos | camelCase | `index.ts` |
| Directorio | kebab-case | `catalog/`, `product/` |

### 3.4 Estructura de un componente

```typescript
// 1. Imports externos
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

// 2. Imports internos
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

// 3. Interface Props — siempre explícita, justo antes del componente
interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// 4. Componente — función nombrada, no arrow function exportada
export function ProductCard({ product, onAddToCart }: Props) {
  // ...
}
```

### 3.5 Tailwind

- Solo utility classes de Tailwind. Sin CSS modules ni `style={}` inline salvo valores dinámicos no resolubles en build time (p.ej. alturas calculadas).
- Variantes condicionales con `cva` (class-variance-authority). No concatenar strings de clases con lógica ternaria compleja.
- Clases ordenadas con el plugin `prettier-plugin-tailwindcss` (orden: layout → spacing → typography → color → misc).

### 3.6 API Client

- Todas las llamadas al backend pasan por `lib/api-client.ts`. Nunca `fetch()` directo en componentes.
- El API client lanza errores tipados en caso de respuesta no-2xx. Los componentes solo manejan el happy path; el error boundary o el `errorHandler` del componente captura el resto.

---

## 4. Testing

### 4.1 Organización

- Ficheros de test **junto al código** que prueban, con sufijo `.test.ts` / `.test.tsx`:
  ```
  catalog.service.ts
  catalog.service.test.ts
  ```
- Tests E2E en `e2e/tests/` con sufijo `.spec.ts`.

### 4.2 Estructura de tests

```typescript
describe('CatalogService', () => {
  describe('getProducts', () => {
    it('returns filtered products by distance', async () => { ... });
    it('returns empty array when no products match filters', async () => { ... });
    it('throws NotFoundError when product does not exist', async () => { ... });
  });
});
```

- Un `describe` por clase o módulo.
- Un `it` por comportamiento observable, no por línea de código.
- Nombres en inglés (consistencia con el ecosistema de testing).

### 4.3 Mocks

- **Unit tests de Services**: mock del repositorio con `jest.fn()`. Nunca levantar base de datos.
- **Unit tests de Controllers**: mock del service con `jest.fn()` + Supertest contra Express.
- **Integration tests**: base de datos PostgreSQL real en Docker. Solo para flows críticos (checkout completo).
- No usar `jest.mock()` para módulos de dominio propios — si necesitas mockearlo, es señal de que la dependencia debería inyectarse.

### 4.4 Cobertura E2E

Cubrir el happy path + el error crítico más probable por flujo:

| Fichero | Happy path | Error crítico |
|---|---|---|
| `catalog.spec.ts` | Buscar y filtrar productos | Filtro sin resultados |
| `product.spec.ts` | Ver ficha y añadir al carrito | Producto sin stock |
| `purchase.spec.ts` | Carrito → checkout → confirmación | Datos de envío inválidos |

---

## 5. Git y commits

- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Scope opcional pero recomendado: `feat(catalog):`, `fix(checkout):`, `test(cart):`
- Un commit por unidad lógica de cambio. No mezclar refactor con feature en el mismo commit.
- No commitear ficheros `.env`, `node_modules/`, ni artefactos de build.
