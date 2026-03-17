# 6. Tickets de Trabajo

Se documentan tres tickets principales, uno por cada capa tecnológica (base de datos, backend y frontend), alineados con el flujo de desarrollo.

---

## Ticket 1 (Base de datos) – Configuración inicial con Entity Framework Core

**Tipo:** Base de datos (SQL Server + EF Core)  
**Objetivo:** Configurar la base de datos mediante EF Core, definir entidades iniciales y generar la primera migración.

### Descripción

- Configurar **DbContext** en la capa **Infrastructure** del backend.
- Crear entidades en la capa **Domain**: `Product`, `Inventory`, `Movement`, `Sale`, `SaleDetail`, `User`, `Location`.
- Definir relaciones entre entidades mediante Fluent API.
- Generar la migración inicial y crear la base de datos en SQL Server.
- Asegurar integridad referencial (claves primarias, foráneas y restricciones).

### Tareas técnicas

1. Instalar paquetes EF Core (`Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools`).
2. Crear clase `AppDbContext` en **Infrastructure/Database**.
3. Configurar `DbSet<T>` para cada entidad.
4. Implementar configuraciones con Fluent API en `OnModelCreating`.
5. Generar migración inicial:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
6. Validar que la base de datos y tablas se creen correctamente.

Criterios de aceptación

- Base de datos creada en SQL Server con todas las tablas definidas.
- Relaciones y restricciones configuradas.
- Migraciones versionadas en el repositorio.
- Eliminada la necesidad de procedimientos almacenados: la lógica se manejará desde EF Core y la capa de aplicación.

---

## Ticket 2 (Backend) – Registrar productos como saldos iniciales / compras

**Tipo:** Backend (.NET 8 – C#)  
**Objetivo:** Implementar endpoint para registrar productos y entradas iniciales de inventario.

### Descripción

- Crear endpoint `POST /products` que permita registrar un producto nuevo junto con su cantidad inicial (saldos iniciales o compras).
- El registro debe generar automáticamente un **movimiento de tipo "Inbound"** en la tabla `Movement`.
- Actualizar el campo `AverageCost` en `Product` usando el costo del movimiento y recalculando el promedio si ya existen entradas previas.

### Tareas técnicas

1. Crear caso de uso `RegisterProductUseCase` en **Application**.
2. Definir entidad `Product` y DTOs en **Domain**.
3. Implementar repositorio `IProductRepository` en **Domain** y su implementación en **Infrastructure** (con EF Core).
4. Crear controlador en **Presentation**: `ProductsController`.
5. Implementar lógica de actualización de inventario en la tabla `Inventory`.
6. Generar pruebas unitarias para validar el cálculo del costo promedio.

### Criterios de aceptación

- Se crea el producto con su código único (`Code`) y atributos.
- Se genera un movimiento de entrada (`MovementType = Inbound`).
- El inventario de la sede (bodega principal) refleja la cantidad inicial.
- El costo promedio del producto se calcula correctamente.

---

## Ticket 3 (Frontend) – Transferencia de inventario entre sedes

**Tipo:** Frontend (React 18)  
**Objetivo:** Implementar interfaz de usuario para realizar transferencias de productos entre sedes.

### Descripción

- Crear una vista en la capa **Presentation** (React) para que el administrador seleccione:
  - Producto
  - Sede origen
  - Sede destino
  - Cantidad
- Al confirmar, enviar la petición al endpoint `POST /movements/transfer`.
- Mostrar mensaje de éxito o error.

### Tareas técnicas

1. Crear componente `TransferForm` en **Presentation/components**.
2. Conectar con caso de uso `TransferInventoryUseCase` en **Application**.
3. Implementar llamada a API en **Infrastructure/api/transferApi.ts**.
4. Manejar estado global con **Redux** para actualizar inventario de la sede origen y destino en tiempo real.
5. Validar en UI que la cantidad solicitada no supere el stock de la sede origen.
6. Implementar pruebas unitarias del componente con React Testing Library.

### Criterios de aceptación

- El formulario se renderiza correctamente.
- No se permite transferir más stock del disponible en sede origen.
- El sistema muestra confirmación de éxito al registrar la transferencia.
- El estado de Redux se actualiza en tiempo real reflejando el nuevo stock.
