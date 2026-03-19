## Why

El Dashboard Admin carece de visibilidad sobre el libro de direcciones de los usuarios. Hoy es imposible supervisar las direcciones guardadas, detectar datos incompletos o entender la distribución geográfica de compradores sin acceder directamente a la base de datos.

## What Changes

- Se añade una nueva página `/addresses` al Dashboard Admin (Next.js), insertada entre Usuarios y Simulación en la barra lateral de navegación.
- Se expone un nuevo endpoint `GET /api/admin/addresses` en la API NestJS (AdminModule) con soporte de paginación, ordenación por 7 columnas y dos filtros (búsqueda de texto multicampo y favorita).
- Se añade la función utilitaria `formatAddress()` en `lib/utils.ts` del frontend para concatenar los campos de dirección omitiendo nulos.
- No hay cambios en el modelo de datos (`Address` ya existe en el schema Prisma).

## Capabilities

### New Capabilities

- `addresses-page`: Página `/addresses` en el Dashboard Admin con tabla paginada de direcciones de usuarios, columnas ordenables (Usuario, Alias, Código Postal, Ciudad, Provincia, País, Favorita), filtro de búsqueda multicampo y filtro segmentado de dirección favorita.
- `addresses-admin-api`: Endpoint `GET /api/admin/addresses` en el AdminModule de NestJS con paginación, ordenación y filtros equivalentes a los endpoints existentes de pedidos y usuarios.

### Modified Capabilities

- `admin-dashboard`: Se añade el elemento "Direcciones" (icono `MapPin`) en la barra lateral entre Usuarios y Simulación.
- `admin-api`: Se amplía el AdminController y AdminService con el nuevo endpoint y su lógica de negocio.

## Impact

- **Frontend**: `apps/web-admin/` — nuevos archivos en `app/addresses/` y `components/addresses/`; modificaciones en `types/api.ts`, `lib/api.ts`, `lib/utils.ts` y `components/layout/sidebar.tsx`.
- **Backend**: `apps/api/src/admin/` — se extienden `admin.controller.ts` y `admin.service.ts`; se añaden tests en `admin.service.spec.ts`.
- **Sin cambios en**: schema Prisma, worker, módulos mock, otras páginas del dashboard.
- **Rollback**: revertir los cambios en `admin.controller.ts`, `admin.service.ts` y eliminar los archivos nuevos del frontend. Sin migraciones de base de datos que deshacer.
