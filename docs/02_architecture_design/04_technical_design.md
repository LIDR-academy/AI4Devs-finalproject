---
document: technical_design
version: 1.1.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/01_product_definition/01_glosario_y_reglas_negocio.md
  - docs/02_architecture_design/03_domain_model.md
---

# 🏛️ Especificación de Arquitectura de Sistema y Stack Tecnológico

> **Navegación del Framework SDD:**  
> [⬅️ Volver al Modelo de Dominio (03_domain_model.md)](./03_domain_model.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Sistema de Diseño UI/UX (05_ui_ux_design_system.md) ➡️](./05_ui_ux_design_system.md)

---

## 🛠️ 1. Selección y Aprobación del Stack Tecnológico

### Composición del Stack Oficial
- **Core Backend:** Node.js, TypeScript 5.x, Express.js.
- **Core Frontend:** React 18, Vite, Modular Vanilla CSS (UI táctil con targets mínimos de 48px).
- **Persistencia & DB:** PostgreSQL 15, Prisma ORM 5.x, In-Memory Repositories para tests de Vitest.
- **Validación & Sanitización:** Schemas con Zod (sanitización activa en todos los HTTP endpoints).
- **Precisión Aritmética de Dominio:** `decimal.js` (obligatorio para saldos, masas, volúmenes y stock).
- **Suite de Pruebas:** Vitest / React Testing Library (TDD estricto, cobertura de mutación $\ge$ 70%).
- **Infraestructura & Contenedores:** Docker Compose (PostgreSQL 15), `pnpm` monorepo workspaces.

### Justificación Técnica & Trade-Offs
1. **Node.js + Express.js:** Ofrece latencia ultra baja para transacciones táctiles de cocina y amplia compatibilidad con middlewares de sanitización.
2. **`decimal.js` en Dominio:** Previene completamente los errores de acumulación de coma flotante de JS (IEEE 754) en las extracciones y consumos de inventario.
3. **Prisma ORM + In-Memory Fakes:** Permite iteración rápida TDD con repositorios falsos en memoria durante desarrollo/testing sin depender del contenedor Postgres encendido.

### Matriz de Riesgos y Estrategia de Mitigación
| Riesgo Técnico | Impacto | Estrategia Arquitectónica de Mitigación |
| :--- | :--- | :--- |
| **Concurrencia en Consumos en Línea:** Múltiples operarios descontando stock del mismo remanente. | Alto | Transacciones atómicas en Prisma ORM + bloqueos pesimistas / optimistas a nivel de base de datos. |
| **Pérdida de Conexión en Terminal Táctil:** Red de cocina inestable. | Medio | Cola de eventos en cliente (`IndexedDB / OfflineQueue`) con sincronización diferida idempotente. |
| **Degradación de Precisión en JSON:** Pérdida de decimales al serializar números. | Alto | **Invariante de Serialización:** Todos los valores `Decimal` se transmiten en JSON estrictamente como `string` (ej: `"150.0000"`). |

---

## 📊 2. Diagramas de Arquitectura (Modelo C4 Nivel 1, 2, 3 y 4)

### 2.1. C4 Nivel 1: Diagrama de Contexto (System Context Diagram)

```mermaid
graph TD
    Admin["👤 Administrador / Gerente de Cocina<br/>[Persona]"]
    Staff["👤 Staff de Cocina / Personal de Turno<br/>[Persona]"]
    
    System["🏢 RestoStock System (MVP)<br/>[Sistema de Software]<br/>Control de Inventario FEFO & Trazabilidad Táctil en Tiempo Real"]

    Admin -->|"Gestiona catálogos, almacenes, insumos y analítica de mermas<br/>[HTTPS / Web Browser]"| System
    Staff -->|"Registra extracciones de bodega, consumos parciales y descartes<br/>[Interacción Táctil / PIN Auth]"| System
```

### 2.2. C4 Nivel 2: Diagrama de Contenedores (Container Diagram)

```mermaid
graph TB
    %% Users/Personas
    Admin["👤 Administrador (Admin)<br/>[Persona]"]
    Staff["👤 Staff de Cocina (Staff)<br/>[Persona]"]

    %% presentation layer
    subgraph Presentation ["Capa de Presentación (Frontend)"]
        WebBO["💻 Web Backoffice (Admin UI)<br/>[React 18 / Vite]<br/>Gestiona catálogos e inventario global"]
        TabletUI["📱 Terminal Táctil (Kitchen UI)<br/>[React 18 / Vanilla CSS]<br/>Terminal en línea de cocina para operarios"]
        OfflineQueue["💾 Cola Local Offline<br/>[IndexedDB / LocalStorage]<br/>Cola de transacciones local"]
    end

    %% processing layer
    subgraph Processing ["Capa de Procesamiento (Backend)"]
        API["🔌 API REST (Express Router)<br/>[Express / TypeScript]<br/>Router y middlewares de seguridad"]
        Core["⚙️ Core de Dominio (Vertical Slices)<br/>[Domain & Application Layer]<br/>Casos de uso e invariantes de negocio"]
        Prisma["💾 Adaptador Prisma (Infrastructure)<br/>[Prisma ORM]<br/>Implementa los puertos de dominio"]
    end

    %% persistence layer
    subgraph Persistence ["Capa de Persistencia"]
        DB[("🗄️ Base de Datos Relacional<br/>[PostgreSQL 15]<br/>Modelo en 3NF con Decimales y Enums")]
    end

    %% Flows
    Admin -->|"Gestiona catálogos e inventario<br/>[HTTPS / REST JSON + Bearer JWT]"| WebBO
    Staff -->|"Registra consumos y mermas<br/>[Interacción Táctil + PIN 4 dígitos]"| TabletUI

    TabletUI <-->|Almacena/Lee eventos offline| OfflineQueue

    WebBO -->|"API Requests<br/>[HTTPS / REST JSON + Bearer JWT]"| API
    TabletUI -->|"API Requests<br/>[HTTPS / REST JSON + PIN Auth Token]"| API

    API -->|"Orquesta Casos de Uso<br/>[Tipos de TypeScript / DTOs]"| Core
    Core -->|"Llama Puertos (Interfaces)<br/>[Invocación de Dominio]"| Prisma
    Prisma -->|"Operaciones SQL y Transacciones<br/>[Protocolo Postgres DDL/DML]"| DB

    %% Styles
    classDef persona fill:#D4E6F1,stroke:#2980B9,stroke-width:2px,color:#1B4F72;
    classDef container fill:#2C3E50,stroke:#34495E,stroke-width:2px,color:#ECF0F1;
    classDef db fill:#16A085,stroke:#138D75,stroke-width:2px,color:#E8F8F5;

    class Admin,Staff persona;
    class WebBO,TabletUI,OfflineQueue,API,Core,Prisma container;
    class DB db;
```

---

### 2.3. C4 Nivel 3: Diagrama de Componentes (Component Diagram - Screaming Architecture)

```mermaid
graph TD
    subgraph Root ["Estructura de Directorios (Monorepo Workspaces)"]
        subgraph Backend ["apps/backend/src"]
            SharedKernel["shared/ (Domain Errors, ValueObjects, Base Classes)"]
            
            subgraph SliceAuth ["auth/ (Authentication Slice)"]
                AuthDom["domain/ (User Entity, PinVO, UserRepository Port)"]
                AuthApp["application/ (AuthenticatePinUseCase)"]
                AuthInfra["infrastructure/ (AuthController, PrismaUserRepo)"]
            end
            
            subgraph SliceStock ["stock/ (Inventory Movement Slice)"]
                StockDom["domain/ (StockMovement Entity, StockRepo Port)"]
                StockApp["application/ (RecordExtractionUseCase)"]
                StockInfra["infrastructure/ (StockController, PrismaStockRepo)"]
            end

            subgraph SliceKitchen ["kitchen/ (Leftovers & Cooking Slice)"]
                KitchenDom["domain/ (Remanente Entity, Recipe Entity, RemanenteRepo Port)"]
                KitchenApp["application/ (RecordConsumptionUseCase, ConsumeRecipeUseCase)"]
                KitchenInfra["infrastructure/ (KitchenController, PrismaRemanenteRepo)"]
            end
        end

        subgraph Frontend ["apps/frontend/src"]
            UIComponents["components/ (Touch Target Buttons, PinPad, AlertBadges)"]
            UIModules["modules/ (KitchenTablet, StockManager, ReportsDashboard)"]
        end
    end

    style Backend fill:#1e293b,stroke:#3b82f6,color:#fff
    style Frontend fill:#1e293b,stroke:#8b5cf6,color:#fff
```

---

### 2.4. C4 Nivel 4: Diagrama de Código y Dominio (Code Diagram - Class & Entities)

> *Ver especificación de detalle de código y modelo de clases en [`docs/02_architecture_design/03_domain_model.md`](./03_domain_model.md).*

```mermaid
classDiagram
    namespace ContextoAutenticacion {
        class Usuario {
            +UUID id
            +String nombre
            +RolUsuario rol
            +PinHash pin
            +validarPin(pin) Boolean
        }
    }

    namespace ContextoOperativoCocina {
        class Remanente {
            +UUID id
            +CantidadDecimal cantidadActual
            +EstadoRemanente estado
            +DateTime fechaExpiracionCalculada
            +descontar(cantidad)
            +descartar(motivo)
        }

        class Receta {
            +UUID id
            +String nombre
        }

        class MovimientoStock {
            +UUID id
            +TipoMovimiento tipo
            +CantidadDecimal cantidad
            +MotivoDescarte motivo
        }
    }

    Usuario "1" -- "N" MovimientoStock : realiza
    Remanente "1" -- "N" MovimientoStock : descuenta
    Receta "1" -- "N" Remanente : consume en cascada FEFO
```

### 2.5. Diagrama de Despliegue Físico Infraestructura Docker (Physical Deployment Topology)

```mermaid
graph TD
    subgraph HostServer ["🖥️ SERVIDOR HOST PRODUCCIÓN / DOCKER ENGINE"]
        subgraph Net ["🌐 Red Aislada Docker (resto_net)"]
            subgraph FrontendContainer ["📱 Contenedor Web Frontend (Node 18 Alpine / Vite)"]
                ReactApp["React 18 Touch UI App (Puerto 3000)"]
            end

            subgraph BackendContainer ["⚙️ Contenedor API Backend (Node 18 Alpine / Express)"]
                ExpressAPI["Express API Server (Puerto 4000)"]
                ZodGuards["Zod Input Sanitizers"]
                PrismaClient["Prisma Client ORM"]
                ExpressAPI --> ZodGuards
                ZodGuards --> PrismaClient
            end

            subgraph DBContainer ["🗄️ Contenedor Postgres (PostgreSQL 15 Alpine)"]
                PostgresEngine[("PostgreSQL 15 Engine (Puerto 5432)")]
            end
        end

        subgraph Storage ["💾 Almacenamiento Persistente Host"]
            PGData[("Volume: pgdata<br/>/var/lib/postgresql/data")]
        end
    end

    ReactApp -->|"HTTP / REST API (Puerto 4000)"| ExpressAPI
    PrismaClient -->|"TCP Connection (TLS) (Puerto 5432)"| PostgresEngine
    PostgresEngine --- PGData
```

---

### 2.6. Diagramas de Secuencia de Casos de Uso Críticos del Dominio

#### 2.6.1. Consumo por Receta en Cascada FEFO (`ConsumeRecipeUseCase`)

```mermaid
sequenceDiagram
    autonumber
    actor Cocinero as 👨‍🍳 Cocinero (React UI)
    participant UC as ⚙️ ConsumeRecipeUseCase (Application)
    participant RecipeRepo as 📦 RecipeRepository
    participant StockRepo as 🗄️ RemanenteRepository (FEFO)
    participant EventBus as ⚡ EventPublisher

    Cocinero->>UC: execute({ recipeId, portions: 2, userId })
    UC->>RecipeRepo: findById(recipeId)
    RecipeRepo-->>UC: Receta (Ingredientes & Proporciones)
    
    loop Por cada ingrediente de la Receta
        UC->>StockRepo: findActiveRemanentesByInsumoOrderedByExpiry(insumoId)
        StockRepo-->>UC: Lista remanentes activos (Orden FEFO ascendente)
        
        loop Mientras requerimiento > 0 y existan remanentes
            UC->>UC: Calcula descuento parcial / total en remanente actual
            alt Remanente agotado (cantidadActual == 0)
                UC->>StockRepo: updateStatus(remanenteId, "CONSUMED")
            else Remanente parcial (cantidadActual > 0)
                UC->>StockRepo: updateQuantity(remanenteId, nuevaCantidad)
            end
        end
    end

    UC->>EventBus: publish(StockDescontadoEvent)
    UC-->>Cocinero: Consumo registrado exitosamente (Descuento FEFO aplicado)
```

#### 2.6.2. Cierre de Turno y Conciliación (`ShiftReconciliationUseCase`)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👨‍🍳 Admin / Supervisor (React UI)
    participant UC as ⚙️ ShiftReconciliationUseCase (Application)
    participant StockRepo as 🗄️ RemanenteRepository
    participant AuditRepo as 📋 AuditRepository
    participant EventBus as ⚡ EventPublisher

    Admin->>UC: execute({ shiftId, countedStockItems })
    UC->>StockRepo: findExpiredActiveRemanentes(nowUTC)
    StockRepo-->>UC: Remanentes con fechaExpiracionCalculada < nowUTC

    loop Por cada remanente expirado detectado
        UC->>StockRepo: updateStatus(id, "DISCARDED", reason: "EXPIRED_ON_SHIFT_CLOSE")
        UC->>EventBus: publish(RemanenteDescartadoEvent)
    end

    UC->>UC: Compara stock físico contado vs stock lógico del sistema
    UC->>AuditRepo: saveReconciliationReport(discrepancies)
    UC->>EventBus: publish(ConciliacionTurnoCompletadaEvent)
    UC-->>Admin: Reporte de Cierre de Turno (Mermas & Discrepancias)
```

#### 2.6.3. Extracción de Bodega a Cocina (`RecordExtractionUseCase`)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 👨‍🍳 Staff de Cocina (React UI)
    participant UC as ⚙️ RecordExtractionUseCase (Application)
    participant InsumoRepo as 📦 InsumoRepository
    participant RemanenteRepo as 🗄️ RemanenteRepository
    participant EventBus as ⚡ EventPublisher

    Staff->>UC: execute({ insumoId, quantity, userId, destination })
    UC->>InsumoRepo: findById(insumoId)
    InsumoRepo-->>UC: Insumo (Vida útil bodega vs cocina)
    
    UC->>UC: Calcula fechaExpiracionCalculada = min(expiracionBodega, now + horasVidaUtilCocina)
    UC->>RemanenteRepo: createRemanente({ insumoId, quantity, fechaExpiracionCalculada, status: "ACTIVE" })
    RemanenteRepo-->>UC: Nuevo Remanente Creado
    
    UC->>EventBus: publish(RemanenteCreadoEvent)
    UC-->>Staff: Remanente Activo Registrado (Etiqueta FEFO generada)
```

---

## 🧱 4. Responsabilidades de Capas Hexagonales

*   **Capa de Dominio (`domain/`):** Contiene entidades puras, Value Objects (`DecimalQuantity`, `PinHash`), reglas inmutables de negocio e interfaces de **Puertos** (Repositories/Services). **0% dependencias de Express, Prisma o React.**
*   **Capa de Aplicación (`application/`):** Implementa los casos de uso específicos del sistema. Orquesta los flujos invocando entidades de dominio y utilizando los puertos.
*   **Capa de Infraestructura (`infrastructure/`):** Adaptadores concretos (controladores HTTP Express, validadores Zod, repositorios Prisma, integraciones).

---

## 📌 5. Próximos Pasos de Especificación (Siguiente en Cascada SDD)

Para continuar con el pipeline de construcción sin saturar el contexto:
1. **Sistema de Diseño UI/UX:** Ver [`docs/02_architecture_design/05_ui_ux_design_system.md`](./05_ui_ux_design_system.md)
2. **Modelado de Datos 3NF:** Ver [`docs/03_persistence_and_api/06_database_schema.md`](../03_persistence_and_api/06_database_schema.md)
3. **Especificación de API REST & Contratos:** Ver [`docs/03_persistence_and_api/07_api_specification.md`](../03_persistence_and_api/07_api_specification.md)
