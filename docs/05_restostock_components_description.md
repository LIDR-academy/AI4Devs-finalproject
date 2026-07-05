# 💻 2.2. Descripción de Componentes Principales

## 🧭 1. Estilo Arquitectónico y Slices Verticales (Screaming Architecture)

La arquitectura de RestoStock se organiza en **Vertical Slices (Rebanadas Verticales)** en lugar de capas horizontales tradicionales. Esta decisión se fundamenta en el **Principio de Cierre Común (Common Closure Principle - CCP)**: *"Aquellas clases que cambian juntas, deben empaquetarse juntas"*.

En lugar de tener una carpeta global `controllers`, una carpeta global `models` y una carpeta global `services` que acoplan todo el sistema, cada dominio funcional de negocio posee su propia estructura independiente de Dominio, Aplicación e Infraestructura. Esto permite que un cambio en una funcionalidad (por ejemplo, cómo se consume un remanente en cocina) se localice por completo dentro de su slice, facilitando el desarrollo aislado y reduciendo drásticamente la carga cognitiva y el riesgo de regresiones.

A continuación se listan y describen los componentes lógicos de negocio (módulos) identificados a partir del PRD:

*   **`src/shared` (Kernel Compartido):** Agrupa tipos de datos comunes, utilidades del sistema, manejo centralizado de errores y middlewares transversales, como el validador de firmas digitales por PIN.
*   **`src/auth` (Módulo de Autenticación):** Responsable de gestionar el ciclo de vida de las sesiones y la validación de credenciales. Maneja la autenticación web mediante JWT para roles administrativos y la verificación rápida mediante PIN de 4 dígitos para operarios de cocina.
*   **`src/catalog` (Módulo de Catálogo Maestro):** Administra el inventario de insumos e ingredientes (catálogo de insumos, factores de conversión, categoría y vida útil en días) así como la definición y proporciones de recetas de platos elaborados. Solo accesible por perfiles administrativos.
*   **`src/stock` (Módulo de Existencias y Extracciones):** Controla el inventario global dentro de la bodega principal y procesa el egreso/extracción física de insumos hacia la cocina.
*   **`src/kitchen` (Módulo de Cocina y Remanentes):** Gestiona la conversión de insumos extraídos en remanentes, el cálculo acelerado de expiración (invariante de 48h TRR), el registro de consumos parciales, los descartes por merma física y el descuento rápido de stock mediante recetas (cascada FEFO). También procesa el flujo de cierre de turno (conciliación de inventario físico vs teórico y auto-descarte masivo de insumos vencidos) y el motor de alertas críticas.



---

## 🛡️ 2. Anatomía y Responsabilidades de las Capas (Arquitectura Hexagonal)

Cada módulo o *Vertical Slice* implementa internamente el patrón de **Arquitectura Hexagonal (Puertos y Adaptadores)** para separar el negocio de la tecnología:

```
                  ┌────────────────────────────────────────┐
                  │            INFRASTRUCTURE              │
                  │   ┌────────────────────────────────┐   │
                  │   │          APPLICATION           │   │
                  │   │   ┌────────────────────────┐   │   │
                  │   │   │         DOMAIN         │   │   │
                  │   │   │                        │   │   │
                  │   │   │  [Entities & VOs]      │   │   │
  [Express] ─────>│──>│──>│                        │   │   │
  (Controller)    │   │   │  [Ports (Interfaces)]  │   │   │
                  │   │   └────────────────────────┘   │   │
                  │   │       [Use Cases]              │   │
                  │   └────────────────────────────────┘   │
                  │       [Prisma Adapters / DB] ──────────┼───> [PostgreSQL]
                  └────────────────────────────────────────┘
```

### Capa de Dominio (Domain Layer)
Es el núcleo central de cada slice. Contiene los modelos de negocio (**Entidades ricas y Value Objects**) que encapsulan las reglas e invariantes y los **Puertos (Interfaces)** que definen el contrato que la infraestructura debe implementar.
*   **Regla estricta:** Debe ser código puro en TypeScript, 100% agnóstico de Express, Prisma, bases de datos o frameworks de terceros. No debe importar librerías externas que aten la lógica a un detalle técnico.

### Capa de Aplicación (Application Layer)
Orquesta el comportamiento del sistema mediante la implementación de **Casos de Uso (Use Cases)**. Cada caso de uso representa un flujo de negocio único (Happy Path o flujos alternativos definidos en el PRD).
*   **Regla estricta:** Invoca las entidades de dominio y coordina el flujo interactuando únicamente con las interfaces abstractas (puertos). No maneja peticiones HTTP de red ni llamadas SQL directas.

### Capa de Infraestructura (Infrastructure Layer)
Contiene los adaptadores concretos para conectar el núcleo del negocio con el mundo exterior.
*   **Adaptadores de Entrada (Driving Adapters):** Enrutadores de Express, controladores de endpoints REST y esquemas de validación (por ejemplo, Zod) encargados de recibir requests HTTP, extraer payloads y ejecutar los casos de uso.
*   **Adaptadores de Salida (Driven Adapters):** Repositorios concretos implementados utilizando Prisma ORM para persistir datos en PostgreSQL, adaptadores para comunicación con clientes externos o envío de notificaciones.

---

## 🔄 3. Regla Estricta de Dependencia Unidireccional

Para garantizar un acoplamiento débil y evitar la corrupción de la lógica del negocio, se establece una directriz innegociable de importación de dependencias:

*   **El flujo de dependencias viaja estrictamente de fuera hacia adentro:**
    *   La capa de **Infraestructura** puede importar recursos de **Aplicación** (para instanciar y ejecutar casos de uso) y de **Dominio** (para mapear datos).
    *   La capa de **Aplicación** solo puede importar recursos de la capa de **Dominio**.
    *   La capa de **Dominio** tiene **terminantemente prohibido** importar elementos de las capas de Aplicación o de Infraestructura, así como de librerías técnicas externas de infraestructura (como Express o Prisma).

Cualquier transgresión a esta regla (por ejemplo, importar un modelo de Prisma directamente en una entidad de dominio) anula las garantías de portabilidad y testabilidad del sistema RestoStock.

---

## 🔌 4. Ejemplo Canónico de Código (TypeScript Blueprint)

A continuación se muestra el molde homogéneo que el equipo de desarrollo debe seguir para implementar cada caso de uso, ilustrando de forma secuencial las tres capas dentro del slice de **`stock`** para el flujo de registrar una extracción:

### 1. Capa de Dominio (Domain)
Define el puerto (contrato) y la entidad del negocio libre de acoplamientos técnicos.

```typescript
// src/stock/domain/entities/stock-movement.entity.ts

export type MovementType = 'EXTRACTION' | 'CONSUMPTION' | 'DISCARD';
export type Location = 'WAREHOUSE' | 'KITCHEN';

export interface StockMovementProps {
  id: string;
  insumoId: string;
  userId: string;
  type: MovementType;
  fromLocation: Location;
  toLocation: Location;
  quantity: number;
  unit: string;
  createdAt: Date;
}

export class StockMovement {
  private constructor(public readonly props: StockMovementProps) {}

  public static create(props: Omit<StockMovementProps, 'id' | 'createdAt'>): StockMovement {
    // Invariante de Dominio: No se permiten cantidades negativas ni iguales a cero
    if (props.quantity <= 0) {
      throw new Error("Quantity must be a positive decimal value");
    }

    return new StockMovement({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
}
```

```typescript
// src/stock/domain/ports/stock-movement-repository.port.ts
import { StockMovement } from '../entities/stock-movement.entity';

export interface IStockMovementRepository {
  save(movement: StockMovement): Promise<void>;
}
```

### 2. Capa de Aplicación (Application)
Orquesta el caso de uso sin conocer los controladores Express ni la implementación física de Prisma.

```typescript
// src/stock/application/use-cases/record-extraction.use-case.ts
import { StockMovement } from '../../domain/entities/stock-movement.entity';
import { IStockMovementRepository } from '../../domain/ports/stock-movement-repository.port';

export interface RecordExtractionInput {
  insumoId: string;
  userId: string;
  quantity: number;
  unit: string;
}

export class RecordExtractionUseCase {
  // Inyección de dependencias a través del constructor usando el Puerto (Interfaz)
  constructor(
    private readonly stockMovementRepository: IStockMovementRepository
  ) {}

  public async execute(input: RecordExtractionInput): Promise<void> {
    // Lógica del caso de uso
    const movement = StockMovement.create({
      insumoId: input.insumoId,
      userId: input.userId,
      type: 'EXTRACTION',
      fromLocation: 'WAREHOUSE',
      toLocation: 'KITCHEN',
      quantity: input.quantity,
      unit: input.unit,
    });

    // Guardado mediante el puerto abstracto
    await this.stockMovementRepository.save(movement);
  }
}
```

### 3. Capa de Infraestructura (Infrastructure)
Controlador encargado de recibir la solicitud HTTP, validar la entrada del cliente, instanciar/invocar el caso de uso y responder con el código de estado adecuado.

```typescript
// src/stock/infrastructure/controllers/stock.controller.ts
import { Request, Response } from 'express';
import { RecordExtractionUseCase } from '../../application/use-cases/record-extraction.use-case';

export class StockController {
  constructor(private readonly recordExtractionUseCase: RecordExtractionUseCase) {}

  public async handleExtraction(req: Request, res: Response): Promise<void> {
    try {
      const { insumoId, userId, quantity, unit } = req.body;

      // Validación simple en capa de transporte (HTTP Controller Adapter)
      if (!insumoId || !userId || !quantity || !unit) {
        res.status(422).json({ error: "Missing required fields: insumoId, userId, quantity, and unit are required" });
        return;
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        res.status(422).json({ error: "Quantity must be a positive number" });
        return;
      }

      // Delegar ejecución al Caso de Uso de Aplicación
      await this.recordExtractionUseCase.execute({
        insumoId,
        userId,
        quantity,
        unit,
      });

      res.status(201).json({ 
        message: "Stock extraction recorded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message || "Internal server error while recording extraction" 
      });
    }
  }
}
```
