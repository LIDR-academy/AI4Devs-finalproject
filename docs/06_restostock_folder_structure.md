# 📂 Estructura de Carpetas de RestoStock (Monorepo)

Esta especificación detalla la estructura física de archivos del monorepo RestoStock, combinando **Vertical Slicing** y **Arquitectura Hexagonal**. El diseño sigue estrictamente el **Principio de Cierre Común (CCP)**, asegurando que todos los archivos necesarios para implementar una funcionalidad o caso de uso específico (Frontend y Backend) residan lo más cerca posible.

Se evitan por completo los directorios globales horizontales de controladores, rutas o servicios para evitar acoplamientos innecesarios.

---

## 🌳 Árbol de Directorios del Monorepo

```
restostock-monorepo/
├── package.json                     # Configuración raíz de dependencias y workspaces
├── pnpm-workspace.yaml              # Definición de workspaces del monorepo (usando pnpm)
├── docker-compose.yml               # Orquestación de base de datos local (PostgreSQL & PgAdmin)
├── readme.md                        # Documentación general de instalación y setup del proyecto
├── docs/                            # Documentación de requerimientos, arquitectura y diseño técnico
│   ├── 01_idea_inicial.md
│   ├── 02_restostock_prd.md
│   ├── 03_restostock_design.md
│   ├── 04_restostock_architecture_diagram.md
│   ├── 05_restostock_components_description.md
│   └── 06_restostock_folder_structure.md
│
├── apps/                            # Contenedor de aplicaciones del monorepo
│   │
│   ├── frontend/                    # --- FRONTEND (React / Next.js Web App) ---
│   │   ├── package.json             # Dependencias del frontend (React, Next.js, Tailwind)
│   │   ├── next.config.js           # Configuración de compilación y optimización de Next.js
│   │   ├── tailwind.config.js       # Configuración del motor de estilos y tokens visuales
│   │   ├── tsconfig.json            # Configuración de compilación TypeScript de Frontend
│   │   ├── public/                  # Archivos estáticos públicos (logos, iconos, fotos de insumos)
│   │   └── src/
│   │       ├── app/                 # Next.js App Router (Mapea rutas de la UI)
│   │       │   ├── layout.tsx       # Estructura global (Layout base con providers)
│   │       │   ├── page.tsx         # landing page o redirección inicial de autenticación
│   │       │   ├── admin/           # Panel Web Administrativo (Backoffice)
│   │       │   │   ├── page.tsx     # Dashboard general con métricas e indicadores de merma
│   │       │   │   ├── catalog/     # Vista administrativa para CRUD de Insumos
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── recipes/     # Vista administrativa para CRUD de Recetas e ingredientes
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── stock/       # Vista de existencias y reportes de bodega
│   │       │   │   │   └── page.tsx
│   │       │   │   └── reports/     # Vista administrativa de reporte de mermas
│   │       │   │       └── page.tsx
│   │       │   └── kitchen/         # Pantalla Táctil de Operación en Cocina (Staff)
│   │       │       ├── page.tsx     # Autenticación rápida por teclado numérico (PIN)
│   │       │       ├── board/       # Tablero táctil de remanentes activos
│   │       │       │   └── page.tsx
│   │       │       └── notifications/   # Pantalla táctil de notificaciones y alertas críticas en tiempo real
│   │       │           └── page.tsx
│   │       │
│   │       ├── components/          # Componentes de presentación reutilizables (Design System)
│   │       │   ├── ui/              # Componentes atómicos (Button, Input, Card, Modal, Spinner)
│   │       │   └── layout/          # Estructuras de contenedores (Sidebar, Header, MainContainer)
│   │       │
│   │       ├── features/            # Slices funcionales del cliente (Suelen cambiar juntos)
│   │       │   ├── auth/            # Características de autenticación
│   │       │   │   ├── components/  # PinPad.tsx (Teclado táctil para PIN), AdminLoginForm.tsx
│   │       │   │   ├── hooks/       # useAuth.ts (Administración del token JWT y sesión local)
│   │       │   │   └── services/    # authApi.ts (Llamadas Axios/Fetch a /api/auth/*)
│   │       │   │
│   │       │   ├── catalog/         # Características del catálogo de insumos y recetas
│   │       │   │   ├── components/  # InsumoFormModal.tsx, InsumoTable.tsx, RecipeFormModal.tsx, RecipeTable.tsx
│   │       │   │   └── services/    # catalogApi.ts (Llamadas Axios/Fetch a /api/catalog/*)
│   │       │   │
│   │       │   ├── stock/           # Características de stock y bodega
│   │       │   │   ├── components/  # RecordExtractionForm.tsx (Registro de extracción)
│   │       │   │   └── services/    # stockApi.ts (Llamadas Axios/Fetch a /api/stock/*)
│   │       │   │
│   │       │   ├── kitchen/         # Características operacionales de cocina
│   │       │   │   ├── components/  # RemanenteCard.tsx, ConsumePartialForm.tsx, DiscardForm.tsx, NotificationFeed.tsx, NotificationBanner.tsx, RecipeSelectorModal.tsx, ShiftReconciliationModal.tsx
│   │       │   │   ├── hooks/       # useOfflineQueue.ts (Manejo del almacenamiento local y reintento)
│   │       │   │   └── services/    # kitchenApi.ts (Llamadas Axios/Fetch a /api/kitchen/*)
│   │       │   │
│   │       │   └── reports/         # Características del módulo de reportes
│   │       │       ├── components/  # WasteDashboard.tsx (Visualización de gráficos y tablas)
│   │       │       └── services/    # reportsApi.ts (Llamadas Axios/Fetch a /api/reports/*)
│   │       │
│   │       └── lib/                 # Utilidades generales del Frontend
│   │           ├── apiClient.ts     # Cliente HTTP configurado para inyectar JWT/PIN en headers
│   │           └── indexeddb.ts     # Configuración y operaciones de base de datos local IndexedDB
│   │
│   └── backend/                     # --- BACKEND (Express / Node.js API REST) ---
│       ├── package.json             # Dependencias del backend (Express, Prisma, Zod, JWT)
│       ├── tsconfig.json            # Configuración de compilación TypeScript de Backend
│       ├── prisma/                  # Configuración y migración de base de datos (Prisma ORM)
│       │   ├── schema.prisma        # Definición del esquema físico (Tablas, PK, FK, Índices)
│       │   └── seed.ts              # Script de inserción de datos iniciales para pruebas
│       └── src/
│           ├── index.ts             # Punto de arranque del servidor HTTP Express
│           ├── app.ts               # Configuración del servidor (Middlewares, enrutador general)
│           │
│           ├── shared/              # Kernel Compartido (Elementos compartidos entre slices)
│           │   ├── domain/          # Lógica de dominio transversal y Value Objects comunes
│           │   │   └── value-objects/
│           │   │       └── DecimalValue.ts  # Wrapper para operaciones precisas de inventario
│           │   │
│           │   └── infrastructure/  # Código de infraestructura compartido
│           │       ├── prisma/      # Cliente único de base de datos
│           │       │   └── client.ts
│           │       └── middleware/  # Middlewares transversales de Express
│           │           ├── errorHandler.ts   # Manejador global de excepciones REST
│           │           └── pinAuth.ts        # Middleware interceptor de seguridad para endpoints con PIN
│           │
│           ├── auth/                # --- Vertical Slice: Autenticación ---
│           │   ├── domain/          # Dominio: Credenciales, entidades de usuario y puertos
│           │   │   ├── entities/    # User.entity.ts
│           │   │   ├── value-objects/ # PinHash.ts, PasswordHash.ts
│           │   │   └── ports/       # IUserRepository.ts (Interfaz del repositorio)
│           │   ├── application/     # Aplicación: Casos de uso
│           │   │   └── use-cases/   # AuthenticateWithPin.ts, AuthenticateAdmin.ts
│           │   └── infrastructure/  # Infraestructura: Adaptadores Express y Repositorios Prisma
│           │       ├── controllers/ # AuthController.ts (Manejo de HTTP Requests)
│           │       ├── repositories/ # PrismaUserRepository.ts (Adaptador concreto de Prisma)
│           │       └── routes.ts    # Rutas HTTP (/api/auth) de este módulo
│           │
│           ├── catalog/             # --- Vertical Slice: Catálogo Maestro ---
│           │   ├── domain/          # Dominio: Estructura del ingrediente (Insumo), Recetas y puertos
│           │   │   ├── entities/    # Insumo.entity.ts, Recipe.entity.ts, RecipeIngredient.value-object.ts
│           │   │   └── ports/       # IInsumoRepository.ts, IRecipeRepository.ts
│           │   ├── application/     # Aplicación: Casos de uso del catálogo
│           │   │   └── use-cases/   # CreateInsumo.ts, UpdateInsumo.ts, GetCatalog.ts, CreateRecipe.ts
│           │   └── infrastructure/  # Infraestructura: Adaptadores Express y Repositorios Prisma
│           │       ├── controllers/ # CatalogController.ts
│           │       ├── repositories/ # PrismaInsumoRepository.ts, PrismaRecipeRepository.ts
│           │       └── routes.ts    # Rutas HTTP (/api/catalog) de este módulo
│           │
│           ├── stock/               # --- Vertical Slice: Existencias y Extracciones ---
│           │   ├── domain/          # Dominio: Movimientos de stock y bodega central
│           │   │   ├── entities/    # StockMovement.entity.ts, WarehouseStock.entity.ts
│           │   │   └── ports/       # IStockRepository.ts
│           │   ├── application/     # Aplicación: Casos de uso de egresos
│           │   │   └── use-cases/   # RecordExtraction.ts, GetWarehouseStock.ts
│           │   └── infrastructure/  # Infraestructura: Adaptadores Express y Repositorios Prisma
│           │       ├── controllers/ # StockController.ts
│           │       ├── repositories/ # PrismaStockRepository.ts
│           │       └── routes.ts    # Rutas HTTP (/api/stock) de este módulo
│           │
│           └── kitchen/             # --- Vertical Slice: Cocina y Remanentes ---
│               ├── domain/          # Dominio: Entidades de remanente, consumo, conciliaciones y puertos
│               │   ├── entities/    # Remanente.entity.ts, PartialConsumption.entity.ts, ShiftReconciliation.entity.ts, ShiftReconciliationItem.entity.ts
│               │   └── ports/       # IRemanenteRepository.ts, IShiftReconciliationRepository.ts
│               ├── application/     # Aplicación: Reglas del ciclo de vida, consumos y cierres
│               │   └── use-cases/   # RecordPartialConsumption.ts, GetActiveRemanentes.ts, RecordDiscard.ts, ConsumeRecipe.ts, PerformShiftReconciliation.ts
│               └── infrastructure/  # Infraestructura: Adaptadores Express y Repositorios Prisma
│                   ├── controllers/ # KitchenController.ts
│                   ├── repositories/ # PrismaRemanenteRepository.ts, PrismaShiftReconciliationRepository.ts
│                   └── routes.ts    # Rutas HTTP (/api/kitchen) de este módulo
│
│           ├── reports/             # --- Vertical Slice: Reportes y Analíticas ---
│           │   ├── domain/          # Dominio: Estructura del reporte y puerto de persistencia
│           │   │   ├── entities/    # WasteSummary.entity.ts
│           │   │   └── ports/       # IReportRepository.ts
│           │   ├── application/     # Aplicación: Casos de uso de generación de informes
│           │   │   └── use-cases/   # GetWasteReport.ts
│           │   └── infrastructure/  # Infraestructura: Adaptadores Express y Repositorios Prisma
│           │       ├── controllers/ # ReportController.ts
│           │       ├── repositories/ # PrismaReportRepository.ts
│           │       └── routes.ts    # Rutas HTTP (/api/reports) de este módulo


```

---

## 🛠️ Justificación Técnica de la Estructura

1.  **Herencia del Principio de Cierre Común (CCP):** Si las reglas de negocio de cocina cambian (por ejemplo, se añade una nueva regla para el cálculo de expiración acelerada), los cambios se concentran exclusivamente dentro de `src/kitchen` en el backend y `features/kitchen` en el frontend. No es necesario modificar múltiples carpetas dispersas por todo el proyecto.
2.  **Aislamiento Tecnológico:** La separación clara de carpetas `domain/`, `application/` e `infrastructure/` en el backend garantiza que el núcleo del negocio (Domain) no conozca detalles externos como el framework web (Express) o el cliente de persistencia (Prisma). Esto permite ejecutar tests unitarios de dominio sin requerir mocks complejos de bases de datos o conexiones de red.
3.  **Resiliencia del Monorepo:** Las aplicaciones de Frontend y Backend residen en la misma base de código pero ejecutan pipelines de dependencias y despliegues independientes gracias a la gestión de workspaces (pnpm/yarn/npm workspaces). Esto simplifica el control de versiones y el mantenimiento del tipado compartido en interfaces API.
