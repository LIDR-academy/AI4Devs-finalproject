# 7. Pull Requests

Se documentan tres Pull Requests simulados, alineados con los tickets de trabajo principales:

1. Configuración inicial con EF Core (DB).
2. Endpoint para registrar productos (Backend).
3. Interfaz de transferencia de inventario (Frontend).

---

## Pull Request 1 – Configuración inicial con Entity Framework Core

**Título:** `feat(db): configuración inicial con EF Core y migraciones`

**Descripción:**

- Se agregó `AppDbContext` en la capa **Infrastructure/Database**.
- Se definieron entidades en la capa **Domain**:
  - Product, Inventory, Movement, Sale, SaleDetail, User, Location.
- Se configuraron relaciones mediante Fluent API en `OnModelCreating`.
- Se generó la migración inicial `InitialCreate`.
- Se aplicó la migración a SQL Server creando todas las tablas y relaciones.

**Motivación:**  
Este PR establece la base de datos inicial para el sistema, permitiendo trabajar con persistencia de datos sin necesidad de procedimientos almacenados.

**Evidencia:**

- Migración generada en `/Infrastructure/Database/Migrations/20250921_InitialCreate.cs`.
- Base de datos creada correctamente en SQL Server.

---

## Pull Request 2 – Endpoint para registrar productos y compras iniciales

**Título:** `feat(api): endpoint POST /products para registrar productos y saldos iniciales`

**Descripción:**

- Se creó caso de uso `RegisterProductUseCase` en la capa **Application**.
- Se añadieron DTOs y validaciones en la capa **Domain**.
- Se implementó `ProductRepository` en **Infrastructure/Repositories**.
- Se creó `ProductsController` en la capa **Presentation**.
- Se añadió endpoint `POST /products` con lógica para:
  - Crear producto con su código único (`Code`).
  - Registrar movimiento de entrada (`Inbound`).
  - Actualizar inventario de la sede principal.
  - Calcular costo promedio (`AverageCost`).
- Se agregaron pruebas unitarias con xUnit para el cálculo de costo promedio.

**Motivación:**  
Permitir el registro de productos y la carga de inventario inicial es el primer paso operativo para habilitar el flujo de negocio.

**Evidencia:**  
Ejemplo de request probado con Postman:

```json
{
  "code": "PROD-001",
  "name": "Camisa básica",
  "description": "Camisa manga corta",
  "salePrice": 50000,
  "averageCost": 30000,
  "minStock": 10,
  "initialQuantity": 100,
  "locationId": 1
}
```

Response esperado:

```json
{
  "productId": 1,
  "code": "PROD-001",
  "name": "Camisa básica",
  "salePrice": 50000,
  "averageCost": 30000,
  "stock": 100,
  "locationId": 1,
  "movementId": 1
}
```

Estado HTTP: 201 Created.

---

## Pull Request 3 – Interfaz de transferencia de inventario en frontend

**Título:** `feat(ui): formulario de transferencia de inventario entre sedes`

**Descripción:**

- Se creó componente `TransferForm` en **Presentation/components**.
- Se implementó caso de uso `TransferInventoryUseCase` en la capa **Application**.
- Se añadió cliente `transferApi.ts` en **Infrastructure/api** para consumir el endpoint `POST /movements/transfer`.
- Se conectó Redux en **Infrastructure/redux** para actualizar inventarios de sede origen y destino.
- Se agregó validación en la UI para evitar transferencias con stock insuficiente.
- Se implementaron pruebas unitarias con React Testing Library.

**Motivación:**  
Ofrecer al administrador una interfaz intuitiva para transferir productos entre sedes y garantizar actualización inmediata del inventario en la aplicación.

**Evidencia:**

- Formulario `TransferForm` renderizado con campos: Producto, Sede Origen, Sede Destino y Cantidad.
- Ejemplo de request enviado al backend:

```json
{
  "productCode": "PROD-001",
  "sourceLocationId": 1,
  "targetLocationId": 2,
  "quantity": 10,
  "userId": 1
}
```

Mensaje de confirmación al registrar transferencia:

```json
{
  "message": "Transfer registered successfully",
  "movementId": 45
}
```

Estado HTTP: 201 Created.

- Redux actualiza el stock en ambas sedes inmediatamente después de la operación.
