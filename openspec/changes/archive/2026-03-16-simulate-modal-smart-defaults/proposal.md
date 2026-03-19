## Why

El modal "Configurar pedido simulado" arranca con todos los campos vacíos, obligando al administrador a rellenar manualmente o pulsar botones de aleatorios uno a uno antes de poder lanzar cualquier simulación. Esto genera fricción innecesaria en un flujo de demostración donde el contenido exacto de los datos es secundario. Adicionalmente, el `UserCombobox` muestra todos los usuarios sin discriminar por registro en Adresles, lo que dificulta probar escenarios específicos (usuario registrado vs. no registrado) con listas de usuarios largas.

## What Changes

- **Productos pre-rellenados al abrir**: en cada apertura del modal, `orderItems` se inicializa con una entrada aleatoria de `FAKE_ORDERS` en lugar de un array vacío. El botón "Productos aleatorios" sigue disponible para regenerar.
- **Dirección de entrega pre-rellenada al activar TRADICIONAL**: cuando el administrador cambia al modo TRADICIONAL y el campo de dirección está completamente vacío, se rellena automáticamente con `getRandomAddress()`. Si la dirección ya contiene datos, se conserva.
- **Dirección eCommerce pre-rellenada al activar el switch**: cuando se activa "¿Tiene dirección guardada en el eCommerce?" y la dirección eCommerce está completamente vacía, se rellena automáticamente con `getRandomAddress()`. Si ya contiene datos, se conserva.
- **Filtro de registro en `UserCombobox`**: tres pills (`[Todos]` / `[Adresles]` / `[No Adresles]`) aparecen alineadas a la derecha del label del combobox. Filtran la lista del dropdown y se combinan con la búsqueda por texto de cmdk. Se aplica a las instancias de Comprador y Destinatario del regalo. Se resetea a `Todos` en cada apertura del modal.

## Capabilities

### New Capabilities

_(ninguna — todos los cambios son modificaciones a la capacidad existente)_

### Modified Capabilities

- `order-config-modal`: se modifican los requisitos de inicialización de productos, comportamiento de cambio de modo/switch respecto a las direcciones, y el comportamiento del `UserCombobox` (nuevo filtro de registro).

## Impact

- **Archivos modificados**:
  - `apps/web-admin/src/components/simulate/order-config-modal.tsx` — lógica de inicialización y triggers
  - `apps/web-admin/src/components/simulate/user-combobox.tsx` — nuevo estado de filtro + UI de pills
- **Sin cambios en backend**: no hay nuevos endpoints, DTOs ni migraciones.
- **Sin cambios en `simulate-data.ts`**: `getRandomAddress()` y `getRandomOrder()` ya existen y son suficientes.
- **Sin cambios en tipos (`types/api.ts`)**: `AdminUser.isRegistered` ya está disponible.
- **Rollback**: revertir los dos archivos afectados a su estado anterior. No hay persistencia de estado entre sesiones ni cambios en la API.
