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

El endpoint devuelve la lista completa de tiendas activas, enriquecida con el nombre comercial del eCommerce al que pertenecen. No requiere paginación (el número de tiendas es bajo). No requiere filtros ni ordenación.

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

#### `src/admin/admin.service.ts` — nuevo método `getStores()`

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
      ecommerce: { select: { commercialName: true } },
    },
  });

  return {
    data: stores.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      platform: s.platform,
      ecommerceName: s.ecommerce.commercialName,
    })),
  };
}
```

Añadir el tipo `SimulateStore` al mismo archivo (o en un archivo `dto/stores-response.ts`):

```typescript
export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: string;
  ecommerceName: string;
}
```

#### `src/admin/admin.controller.ts` — nuevo endpoint

```typescript
@Get('stores')
getStores() {
  return this.adminService.getStores();
}
```

No requiere query params ni DTO de entrada.

### Capa frontend (`apps/web-admin`)

#### `src/types/api.ts` — nuevo tipo `SimulateStore`

```typescript
export interface SimulateStore {
  id: string;
  name: string;
  url: string;
  platform: string;
  ecommerceName: string;
}

export interface StoresResponse {
  data: SimulateStore[];
}
```

#### `src/lib/api.ts` — nueva función `getStores()`

```typescript
export async function getStores(): Promise<StoresResponse> {
  return apiFetch<StoresResponse>('/api/admin/stores');
}
```

---

## Lista de tareas

- [ ] Añadir interfaz `SimulateStore` en `apps/api/src/admin/admin.service.ts`
- [ ] Implementar método `getStores()` en `AdminService`
- [ ] Añadir handler `@Get('stores')` en `AdminController`
- [ ] Añadir tipo `SimulateStore` e interfaz `StoresResponse` en `apps/web-admin/src/types/api.ts`
- [ ] Añadir función `getStores()` en `apps/web-admin/src/lib/api.ts`
- [ ] Verificar que el endpoint responde correctamente con los datos de seed (3 tiendas)
