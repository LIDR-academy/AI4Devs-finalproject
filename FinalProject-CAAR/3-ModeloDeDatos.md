# 3. Modelo de Datos

---

## 3.1. Diagrama del modelo de datos

- Permite inventario en tiempo real por sede y producto.
- Maneja costeo por promedio ponderado mediante movimientos.
- Escalable: soporta más sedes y nuevos tipos de movimientos.
- Diferencia claramente entre ventas y movimientos administrativos.
- Uso de Code en Product garantiza un identificador de negocio independiente del ID interno.

```mermaid
erDiagram
    Product {
        int ProductId PK
        string Code "Unique product code"
        string Name
        string Description
        decimal SalePrice
        decimal AverageCost
        int MinStock
        bool Active
    }

    Inventory {
        int InventoryId PK
        int ProductId FK
        int LocationId FK
        int Quantity
        datetime LastUpdated
    }

    Movement {
        int MovementId PK
        int ProductId FK
        int SourceLocationId
        int TargetLocationId
        string MovementType
        int Quantity
        decimal UnitCost
        datetime Date
        string Notes
        int UserId FK
    }

    Sale {
        int SaleId PK
        int LocationId FK
        datetime Date
        decimal Total
        string PaymentMethod
        int UserId FK
    }

    SaleDetail {
        int SaleDetailId PK
        int SaleId FK
        int ProductId FK
        int Quantity
        decimal UnitPrice
        decimal Subtotal
    }

    User {
        int UserId PK
        string Name
        string Email
        string Role
        bool Active
    }

    Location {
        int LocationId PK
        string Name
        string Address
        bool Active
    }

    Product ||--o{ Inventory : contains
    Location ||--o{ Inventory : stores
    Product ||--o{ Movement : generates
    User ||--o{ Movement : records
    Location ||--o{ Movement : origin_target
    Sale ||--o{ SaleDetail : includes
    Product ||--o{ SaleDetail : sold_in
    User ||--o{ Sale : records
    Location ||--o{ Sale : happens_at
```

3.2. Descripción de entidades principales

Producto (Product)

- ProductId (PK, int) → Identificador único interno.
- Code (string, unique, not null) → Código único de negocio.
- Name (string, not null).
- Description (string, opcional).
- SalePrice (decimal, not null).
- AverageCost (decimal, calculado con movimientos de entrada).
- MinStock (int, configurable por producto).
- Active (bool).

Inventario (Inventory)

- InventoryId (PK, int).
- ProductId (FK → Product).
- LocationId (FK → Location).
- Quantity (int).
- LastUpdated (datetime).
- Nota: representa stock por producto en cada sede.

Movimiento (Movement)

- MovementId (PK, int).
- ProductId (FK → Product).
- SourceLocationId (int, nullable).
- TargetLocationId (int, nullable).
- MovementType (string → Inbound, Outbound, Transfer, Adjustment).
- Quantity (int).
- UnitCost (decimal).
- Date (datetime).
- Notes (string, opcional).
- UserId (FK → User).

Venta (Sale)

- SaleId (PK, int).
- LocationId (FK → Location).
- Date (datetime).
- Total (decimal).
- PaymentMethod (string → Cash, Card, BankTransfer, Deposit).
- UserId (FK → User).

DetalleVenta (SaleDetail)

- SaleDetailId (PK, int).
- SaleId (FK → Sale).
- ProductId (FK → Product).
- Quantity (int).
- UnitPrice (decimal).
- Subtotal (decimal).

Usuario (User)

- UserId (PK, int).
- Name (string).
- Email (string, unique).
- Role (string → Admin, Sales).
- Active (bool).

Sede (Location)

- LocationId (PK, int).
- Name (string).
- Address (string).
- Active (bool).
