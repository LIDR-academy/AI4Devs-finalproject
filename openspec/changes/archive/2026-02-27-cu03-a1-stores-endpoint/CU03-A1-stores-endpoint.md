# CU03-A1 — Endpoint GET /api/admin/stores

**App**: `apps/api` (NestJS — AdminModule) + `apps/web-admin` (tipos TypeScript)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU-02 completado ✅

---

## Historia de Usuario

**Como** frontend de la sección `/simulate` del Dashboard Admin,  
**quiero** poder obtener la lista de tiendas disponibles en la base de datos,  
**para** mostrarlas como opciones en el selector obligatorio de tienda del modal de configuración de pedido simulado.

---

## Descripción funcional

El endpoint devuelve la lista completa de tiendas con `status = ACTIVE`, enriquecida con el nombre comercial del eCommerce al que pertenecen. No requiere paginación (el número de tiendas es bajo). No requiere filtros ni ordenación configurables.

Ordenación fija: primero por `ecommerce.commercialName ASC` (fallback a `legalName` si es null), luego por `store.name ASC`.

### Respuesta esperada

```json
{
  "data": [
    {
      "id": "uuid-store-1",
      "name": "ModaMujer Tienda Principal",
      "url": "https://modamujer.example.com",
      "platform": "WOOCOMMERCE",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-2",
      "name": "ModaMujer Outlet",
      "url": "https://modamujer-outlet.example.com",
      "platform": "SHOPIFY",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-3",
      "name": "TechGadgets Store",
      "url": "https://techgadgets.example.com",
      "platform": "PRESTASHOP",
      "ecommerceName": "TechGadgets"
    }
  ]
}
```

---

## Arquitectura de la solución

### Capa backend (`apps/api`)

#### `src/admin/admin.service.ts` — nueva interfaz y método `getStores()`

Añadir la interfaz `SimulateStore` en la zona de interfaces del archivo (junto a `GetOrdersParams`, `GetUsersParams`):

```typescript
export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: string;       // valor del enum StorePlatform: WOOCOMMERCE | PRESTASHOP | MAGENTO | SHOPIFY
  ecommerceName: string;  // commercialName ?? legalName del Ecommerce padre
}
```

Añadir el método `getStores()` en `AdminService`:

```typescript
async getStores(): Promise<{ data: SimulateStore[] }> {
  const stores = await this.prisma.store.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ ecommerce: { commercialName: 'asc' } }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      url: true,
      platform: true,
      ecommerce: { select: { commercialName: true, legalName: true } },
    },
  });

  return {
    data: stores.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      platform: s.platform,
      ecommerceName: s.ecommerce.commercialName ?? s.ecommerce.legalName,
    })),
  };
}
```

> **Nota sobre nulabilidad**: `Ecommerce.commercialName` es `String?` en el schema Prisma. El fallback a `legalName` (siempre presente) garantiza que `ecommerceName` nunca sea null en la respuesta.

#### `src/admin/admin.controller.ts` — nuevo endpoint

```typescript
@Get('stores')
getStores() {
  return this.adminService.getStores();
}
```

No requiere query params ni DTO de entrada.

### Capa frontend (`apps/web-admin`)

#### `src/types/api.ts` — nuevos tipos `StorePlatform`, `SimulateStore` y `StoresResponse`

Añadir junto a los tipos existentes (`OrderStatus`, `OrderMode`, etc.):

```typescript
export type StorePlatform = 'WOOCOMMERCE' | 'PRESTASHOP' | 'MAGENTO' | 'SHOPIFY';

export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: StorePlatform;
  ecommerceName: string;
}

export interface StoresResponse {
  data: SimulateStore[];
}
```

#### `src/lib/api.ts` — nueva función `getStores()`

Añadir el import de los nuevos tipos y la función:

```typescript
// Actualizar el import al inicio del archivo:
import type {
  // ...tipos existentes...
  StoresResponse,
} from '@/types/api';

// Añadir la función:
export const getStores = (): Promise<StoresResponse> =>
  apiFetch<StoresResponse>('/api/admin/stores');
```

---

## Tests

### `apps/api/src/admin/admin.controller.spec.ts`

Añadir `getStores` al objeto `mockAdminService`:

```typescript
const mockAdminService = {
  getOrders: jest.fn(),
  getUsers: jest.fn(),
  getConversationMessages: jest.fn(),
  getStores: jest.fn(),   // ← añadir
};
```

Añadir un nuevo bloque `describe`:

```typescript
describe('GET /admin/stores', () => {
  it('responde 200 con la lista de tiendas', async () => {
    const payload = {
      data: [
        { id: 's1', name: 'Tienda A', url: 'https://a.com', platform: 'WOOCOMMERCE', ecommerceName: 'EcomA' },
      ],
    };
    mockAdminService.getStores.mockResolvedValue(payload);

    const res = await request(app.getHttpServer())
      .get('/admin/stores')
      .expect(200);

    expect(res.body).toEqual(payload);
    expect(mockAdminService.getStores).toHaveBeenCalledTimes(1);
  });

  it('responde 200 con data vacía si no hay tiendas activas', async () => {
    mockAdminService.getStores.mockResolvedValue({ data: [] });

    const res = await request(app.getHttpServer())
      .get('/admin/stores')
      .expect(200);

    expect(res.body).toEqual({ data: [] });
  });
});
```

### `apps/api/src/admin/admin.service.spec.ts`

Añadir `store` al objeto `mockPrisma`:

```typescript
const mockPrisma = {
  order: { findMany: jest.fn(), count: jest.fn() },
  user: { findMany: jest.fn(), count: jest.fn() },
  conversation: { findUnique: jest.fn() },
  store: { findMany: jest.fn() },   // ← añadir
  $transaction: jest.fn(),
};
```

Añadir un nuevo bloque `describe`:

```typescript
describe('getStores', () => {
  it('devuelve las tiendas activas mapeadas con ecommerceName', async () => {
    const rawStores = [
      {
        id: 's1',
        name: 'Tienda A',
        url: 'https://a.com',
        platform: 'WOOCOMMERCE',
        ecommerce: { commercialName: 'EcomA', legalName: 'EcomA SL' },
      },
    ];
    mockPrisma.store.findMany.mockResolvedValue(rawStores);

    const result = await service.getStores();

    expect(result.data).toEqual([
      { id: 's1', name: 'Tienda A', url: 'https://a.com', platform: 'WOOCOMMERCE', ecommerceName: 'EcomA' },
    ]);
    expect(mockPrisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'ACTIVE' } }),
    );
  });

  it('usa legalName como fallback cuando commercialName es null', async () => {
    mockPrisma.store.findMany.mockResolvedValue([
      {
        id: 's2',
        name: 'Tienda B',
        url: 'https://b.com',
        platform: 'SHOPIFY',
        ecommerce: { commercialName: null, legalName: 'EcomB Legal SL' },
      },
    ]);

    const result = await service.getStores();

    expect(result.data[0].ecommerceName).toBe('EcomB Legal SL');
  });

  it('devuelve data vacía si no hay tiendas activas', async () => {
    mockPrisma.store.findMany.mockResolvedValue([]);

    const result = await service.getStores();

    expect(result.data).toEqual([]);
  });
});
```

---

## Criterios de aceptación

- [ ] `GET /api/admin/stores` responde `200 OK` con `{ data: SimulateStore[] }`
- [ ] Solo aparecen tiendas con `status = ACTIVE`
- [ ] `ecommerceName` nunca es null (fallback a `legalName` si `commercialName` es null)
- [ ] `platform` refleja el valor exacto del enum `StorePlatform` del schema
- [ ] Ordenación: `ecommerce.commercialName ASC`, luego `store.name ASC`
- [ ] Tests del controlador cubren respuesta 200 con datos y con lista vacía
- [ ] Tests del servicio cubren el caso de `commercialName` null (fallback a `legalName`)
- [ ] Todos los tests existentes siguen pasando tras los cambios (`pnpm test` en `apps/api`)

---

## Lista de tareas

- [ ] Añadir interfaz `SimulateStore` en `apps/api/src/admin/admin.service.ts` (junto a `GetOrdersParams`)
- [ ] Implementar método `getStores()` en `AdminService` con fallback `commercialName ?? legalName`
- [ ] Añadir handler `@Get('stores')` en `AdminController`
- [ ] Añadir `getStores` al mock en `admin.controller.spec.ts` y el bloque `describe` correspondiente
- [ ] Añadir `store` al mock en `admin.service.spec.ts` y el bloque `describe` correspondiente
- [ ] Añadir tipos `StorePlatform`, `SimulateStore` y `StoresResponse` en `apps/web-admin/src/types/api.ts`
- [ ] Añadir función `getStores()` en `apps/web-admin/src/lib/api.ts` con el import actualizado
- [ ] Verificar que el endpoint responde correctamente con los datos de seed (3 tiendas)
