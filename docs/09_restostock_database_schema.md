# 🗄️ Esquema de Base de Datos para Prisma (RestoStock)

Este documento detalla el esquema declarativo físico de persistencia utilizando la sintaxis de **Prisma ORM** (`schema.prisma`), estructurado en **Tercera Forma Normal (3NF)** y optimizado para una base de datos **PostgreSQL**.

---

## 📄 1. Código del Esquema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// 1. DICCIONARIO DE ENUMS (Dominios Cerrados)
// ==========================================

enum Role {
  ADMIN
  OPERATOR
}

enum MovementType {
  EXTRACTION  // Salida de depósito cerrado a cocina
  CONSUMPTION // Registro de consumo parcial de remanente
  TRANSFER    // Traslado entre sububicaciones o terminales
  DISCARD     // Descarte o merma física
}

enum DiscardReason {
  EXPIRATION
  DAMAGE_OR_DROP
  CONTAMINATION
  SPOILAGE
}

enum LocationType {
  MAIN_WAREHOUSE    // Depósito central / Bodega principal
  KITCHEN_FRIDGE    // Heladera de cocina
  KITCHEN_FREEZER   // Congelador de cocina
  KITCHEN_PANTRY    // Alacena de secos
  KITCHEN_PREP      // Línea de despacho / Preparación
}

enum RemanenteStatus {
  ACTIVE      // Disponible para su uso en cocina
  CONSUMED    // Agotado al 100%
  DISCARDED   // Retirado por merma/vencimiento
}

// ==========================================
// 2. MODELOS / ENTIDADES (3NF)
// ==========================================

model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String?  @unique @db.VarChar(255)
  passwordHash String?  @map("password_hash") @db.VarChar(255)
  pinHash      String?  @map("pin_hash") @db.VarChar(255)
  name         String   @db.VarChar(100)
  photoUrl     String?  @map("photo_url") @db.VarChar(500)
  role         Role     @default(OPERATOR)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relaciones
  remanentes          Remanente[]
  stockMovements      StockMovement[]
  shiftReconciliations ShiftReconciliation[]

  @@map("users")
}

model Insumo {
  id                 String   @id @default(uuid()) @db.Uuid
  name               String   @db.VarChar(100)
  brand              String?  @db.VarChar(100)
  category           String   @db.VarChar(50)
  purchaseUnit       String   @map("purchase_unit") @db.VarChar(20)
  consumptionUnit    String   @map("consumption_unit") @db.VarChar(20)
  conversionFactor   Decimal  @map("conversion_factor") @db.Decimal(10, 2)
  openShelfLifeDays  Int?     @map("open_shelf_life_days")
  isActive           Boolean  @default(true) @map("is_active")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  // Relaciones
  warehouseStocks         WarehouseStock[]
  remanentes              Remanente[]
  stockMovements          StockMovement[]
  recipeIngredients       RecipeIngredient[]
  shiftReconciliationItems ShiftReconciliationItem[]

  @@map("insumos")
}

model WarehouseStock {
  id        String       @id @default(uuid()) @db.Uuid
  insumoId  String       @map("insumo_id") @db.Uuid
  location  LocationType
  quantity  Decimal      @db.Decimal(12, 4)
  updatedAt DateTime     @updatedAt @map("updated_at")

  // Relaciones e Integridad Referencial (Cascade delete on master catalog modification)
  insumo Insumo @relation(fields: [insumoId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  // Restricciones e Índices
  @@unique([insumoId, location], name: "idx_unique_insumo_location")
  @@index([location])
  @@map("warehouse_stocks")
}

model Remanente {
  id                       String          @id @default(uuid()) @db.Uuid
  insumoId                 String          @map("insumo_id") @db.Uuid
  userId                   String          @map("user_id") @db.Uuid
  initialQuantity          Decimal         @map("initial_quantity") @db.Decimal(12, 4)
  currentQuantity          Decimal         @map("current_quantity") @db.Decimal(12, 4)
  location                 LocationType
  sublocation              String?         @db.VarChar(100)
  status                   RemanenteStatus @default(ACTIVE)
  openedAt                 DateTime        @default(now()) @map("opened_at")
  originalExpirationDate   DateTime        @map("original_expiration_date")
  calculatedExpirationDate DateTime        @map("calculated_expiration_date")
  createdAt                DateTime        @default(now()) @map("created_at")
  updatedAt                DateTime        @updatedAt @map("updated_at")

  // Relaciones
  insumo Insumo @relation(fields: [insumoId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade) // RESTRICT prevents orphan audit trails

  stockMovements StockMovement[]

  // Índices
  @@index([status, calculatedExpirationDate])
  @@index([insumoId])
  @@index([userId])
  @@map("remanentes")
}

model StockMovement {
  id           String         @id @default(uuid()) @db.Uuid
  insumoId     String         @map("insumo_id") @db.Uuid
  remanenteId  String?        @map("remanente_id") @db.Uuid
  userId       String         @map("user_id") @db.Uuid
  type         MovementType
  fromLocation LocationType   @map("from_location")
  toLocation   LocationType   @map("to_location")
  quantity     Decimal        @db.Decimal(12, 4)
  unit         String         @db.VarChar(20)
  reason       DiscardReason?
  createdAt    DateTime       @default(now()) @map("created_at")

  // Relaciones
  insumo    Insumo     @relation(fields: [insumoId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  remanente Remanente? @relation(fields: [remanenteId], references: [id], onDelete: SetNull, onUpdate: Cascade) // SET NULL to keep historic log
  user      User       @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  // Índices
  @@index([createdAt, insumoId])
  @@index([userId])
  @@index([remanenteId])
  @@map("stock_movements")
}

model Recipe {
  id          String             @id @default(uuid()) @db.Uuid
  name        String             @db.VarChar(100)
  description String?            @db.VarChar(500)
  isActive    Boolean            @default(true) @map("is_active")
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")
  ingredients RecipeIngredient[]

  @@map("recipes")
}

model RecipeIngredient {
  id        String   @id @default(uuid()) @db.Uuid
  recipeId  String   @map("recipe_id") @db.Uuid
  insumoId  String   @map("insumo_id") @db.Uuid
  quantity  Decimal  @db.Decimal(12, 4)
  createdAt DateTime @default(now()) @map("created_at")

  // Relaciones
  recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  insumo Insumo @relation(fields: [insumoId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  // Restricciones
  @@unique([recipeId, insumoId], name: "idx_unique_recipe_insumo")
  @@index([insumoId])
  @@map("recipe_ingredients")
}

model ShiftReconciliation {
  id        String                    @id @default(uuid()) @db.Uuid
  userId    String                    @map("user_id") @db.Uuid
  closedAt  DateTime                  @default(now()) @map("closed_at")
  createdAt DateTime                  @default(now()) @map("created_at")
  user      User                      @relation(fields: [userId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  items     ShiftReconciliationItem[]

  @@index([userId])
  @@map("shift_reconciliations")
}

model ShiftReconciliationItem {
  id                    String   @id @default(uuid()) @db.Uuid
  shiftReconciliationId String   @map("shift_reconciliation_id") @db.Uuid
  insumoId              String   @map("insumo_id") @db.Uuid
  physicalQuantity      Decimal  @map("physical_quantity") @db.Decimal(12, 4)
  theoreticalQuantity   Decimal  @map("theoretical_quantity") @db.Decimal(12, 4)
  variance              Decimal  @db.Decimal(12, 4)
  createdAt             DateTime @default(now()) @map("created_at")

  // Relaciones
  shiftReconciliation ShiftReconciliation @relation(fields: [shiftReconciliationId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  insumo              Insumo              @relation(fields: [insumoId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  // Restricciones
  @@unique([shiftReconciliationId, insumoId], name: "idx_unique_reconciliation_insumo")
  @@index([insumoId])
  @@map("shift_reconciliation_items")
}
```


---

## 📈 2. Estrategia y Justificación de Índices Físicos

Para garantizar el rendimiento óptimo del motor PostgreSQL ante alta concurrencia de consultas en la cocina táctil y reportes del backoffice, se implementan los siguientes índices:

1.  **Índice FEFO en `remanentes (status, calculated_expiration_date)`**:
    *   *Justificación:* La pantalla táctil del cocinero consulta constantemente los insumos abiertos y utilizables (`status = 'ACTIVE'`) ordenados del de vencimiento más próximo al más lejano (política FEFO). Un índice compuesto ordenado permite resolver esta consulta con un costo de búsqueda logarítmico $O(\log N)$ directo sobre el índice, evitando el costoso ordenamiento en memoria (*filesort*) en el servidor PostgreSQL.
2.  **Índice Único en `warehouse_stocks (insumo_id, location)`**:
    *   *Justificación:* Asegura la consistencia lógica de que no existan registros de stock duplicados para el mismo insumo en una ubicación física específica. Además de mantener la 3NF, actúa como un índice de búsqueda ultra rápido para lecturas directas del stock consolidado.
3.  **Índice por Ubicación en `warehouse_stocks (location)`**:
    *   *Justificación:* Los filtros y reportes de inventario que listan todas las existencias de un área específica (ej. listar todo el stock de la bodega principal) utilizarán este índice, acelerando las agregaciones y sumatorias.
4.  **Índice Cronológico Compuesto en `stock_movements (created_at, insumo_id)`**:
    *   *Justificación:* Las consultas en el panel administrativo del backoffice suelen listar transacciones de inventario filtrando por rangos de fecha y agrupando por insumo (ej. conciliar diferencias semanales). Este índice compuesto optimiza sustancialmente las operaciones de filtrado temporal y agrupamiento.
5.  **Índices implícitos en Relaciones Extranjeras (Foreign Keys)**:
    *   *Justificación:* Prisma crea de forma automática índices para campos FK (como `insumo_id`, `user_id` y `remanente_id`). Esto optimiza las operaciones de JOIN lógicas al realizar consultas complejas y agiliza las cascadas de integridad referencial de base de datos.
