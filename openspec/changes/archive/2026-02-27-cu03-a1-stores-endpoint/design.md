## Context

El `AdminModule` de `apps/api` ya expone tres endpoints (`GET /orders`, `GET /users`, `GET /conversations/:id/messages`) implementados en `AdminController` + `AdminService`. El patrón está bien establecido: el controlador parsea query params y delega al servicio, que ejecuta consultas Prisma.

El frontend `apps/web-admin` dispone de `src/lib/api.ts` con funciones tipadas (`getOrders`, `getUsers`, `getConversationMessages`) y tipos centralizados en `src/types/api.ts`.

La nueva sección `/simulate` del Dashboard necesita un selector de tienda, por lo que requiere que el backend exponga la lista de tiendas activas con el nombre de su eCommerce propietario.

## Goals / Non-Goals

**Goals:**
- Añadir `GET /api/admin/stores` al `AdminController` existente siguiendo el patrón establecido.
- Exponer solo tiendas con `status = ACTIVE`, ordenadas por nombre de eCommerce y luego nombre de tienda.
- Proveer tipos TypeScript en el frontend (`StorePlatform`, `SimulateStore`, `StoresResponse`) y la función `getStores()` en `src/lib/api.ts`.
- Mantener todos los tests existentes pasando.

**Non-Goals:**
- Paginación, filtros ni ordenación dinámica (el número de tiendas es bajo y fijo por sesión).
- Autenticación o autorización (el AdminModule completo es interno al MVP mock, sin guard de sesión).
- Caché del resultado (fuera de alcance para este MVP).

## Decisions

### Ubicación en AdminModule (no en StoresModule)
El endpoint sirve únicamente al Dashboard Admin para poblar un selector de UI. No es una operación de negocio del dominio Stores; es una consulta de soporte administrativo. Añadirlo al `AdminModule` mantiene toda la lógica del Dashboard cohesionada y evita introducir dependencias cruzadas entre módulos.

### Sin DTO de entrada
El endpoint no acepta parámetros: ni paginación, ni filtros, ni ordenación configurable. La lista de tiendas activas es pequeña (típicamente < 20), por lo que devolver todo en una sola respuesta es correcto y simplifica la implementación.

### Fallback `commercialName ?? legalName`
`Ecommerce.commercialName` es nullable en el schema (`String?`). Para garantizar que `ecommerceName` nunca sea null en la respuesta, se usa `legalName` (siempre presente, `String` no nullable) como fallback. Esto hace el mapeo robusto sin necesidad de lógica adicional en el frontend.

### `StorePlatform` como union type en frontend
En lugar de usar `string` genérico, se define `type StorePlatform = 'WOOCOMMERCE' | 'PRESTASHOP' | 'MAGENTO' | 'SHOPIFY'` en `src/types/api.ts`, alineado con el enum del schema Prisma. Esto mejora el autocompletado y la seguridad de tipos en componentes React que rendericen etiquetas o iconos por plataforma.

## Risks / Trade-offs

- **[Riesgo] Tiendas sin `commercialName`** → Mitigación: fallback a `legalName` garantiza que la respuesta nunca tenga `ecommerceName: null`.
- **[Trade-off] Sin paginación** → Aceptable para el MVP. Si el número de tiendas crece significativamente, se deberá añadir paginación como mejora futura.
- **[Trade-off] Tipos duplicados backend/frontend** → `SimulateStore` se define en ambas capas. Es el patrón establecido en el proyecto (ver `GetOrdersParams` en servicio vs tipos en `api.ts`). No hay contrato OpenAPI compartido en este MVP.
