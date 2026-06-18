## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Xavier Venteo

### **0.2. Nombre del proyecto:**

RunMarket

### **0.3. Descripción breve del proyecto:**

eCommerce especializado en productos deportivos para running. Permite a corredores principiantes, populares y avanzados encontrar zapatillas, ropa técnica y accesorios adaptados a su perfil mediante filtros propios de la disciplina: distancia objetivo, tipo de superficie, nivel del corredor y objetivo de entrenamiento.

### **0.4. URL del proyecto:**

> Pendiente de documentar.

### 0.5. URL o archivo comprimido del repositorio

[xavierventeo/AI4Devs-finalproject](https://github.com/xavierventeo/AI4Devs-finalproject/tree/feature-entrega1-XVB)


---

## 1. Descripción general del producto

### **1.1. Objetivo:**

**RunMarket** es un eCommerce especializado en productos deportivos para running. Permite a corredores principiantes, populares y avanzados encontrar zapatillas, ropa técnica y accesorios adaptados a su perfil mediante filtros propios de la disciplina: distancia objetivo, tipo de superficie, nivel del corredor y objetivo de entrenamiento.

El problema que resuelve es de orientación y relevancia: los eCommerce generalistas no ofrecen filtros específicos de running, lo que obliga al corredor a navegar catálogos irrelevantes sin criterios técnicos. RunMarket reduce esa fricción colocando al corredor y su perfil en el centro del catálogo.

**Propuesta de valor:** el único eCommerce donde el catálogo se adapta al corredor, no al revés.

> Documentación completa de producto (Lean Canvas, casos de uso, decisiones de diseño): [docs/PRD.md](docs/PRD.md)

### **1.2. Características y funcionalidades principales:**

El MVP cubre el ciclo completo de descubrimiento y compra:

1. **Catálogo de productos** — zapatillas, ropa técnica y accesorios para running
2. **Búsqueda y filtrado multidimensional** — por categoría, distancia, superficie, nivel y objetivo de entrenamiento; filtros combinables con actualización dinámica
3. **Ficha de producto** — descripción técnica, atributos running como etiquetas de color, selector de talla/color, stepper de cantidad y trust signals (envío, devolución, garantía)
4. **Gestión de carrito** — añadir, modificar cantidad y eliminar; resumen con subtotal, envío y total; persiste en sesión
5. **Checkout simulado** — flujo en 2 pasos (datos de envío + método de pago); sin procesamiento real de pagos ni autenticación requerida
6. **Confirmación de pedido** — número de pedido generado y resumen de compra
7. **Gestión básica de pedidos** — historial con estados: pendiente, procesando, enviado, entregado

> Casos de uso detallados con diagramas de flujo: [docs/PRD.md#casos-de-uso-principales](docs/PRD.md)

### **1.3. Diseño y experiencia de usuario:**

Prototipo interactivo: [eCommerce para productos deportivos — Figma Make](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos)

Las capturas de pantalla se encuentran en [`docs/prototypes/`](docs/prototypes/).

---

**Home — Catálogo con filtros** · *Caso de uso 1*

![Home — Catálogo con filtros](docs/prototypes/01-home-catalog.png)

Catálogo con panel lateral de filtros running. Punto de entrada y diferencial principal del producto.

---

**Ficha de producto** · *Caso de uso 2*

![Ficha de producto](docs/prototypes/02-pdp.png)

Detalle técnico del producto con atributos running, selector de talla/color y botón de añadir al carrito.

---

**Carrito** · *Caso de uso 3*

![Carrito de compra](docs/prototypes/03-cart.png)

Resumen de selección con subtotal, envío y acceso al checkout.

---

**Checkout — Datos de envío** · *Caso de uso 3*

![Checkout — Datos de envío](docs/prototypes/04-checkout-send-data.png)

Formulario de envío, paso 1 del proceso de compra simulado.

---

**Checkout — Método de pago** · *Caso de uso 3*

![Checkout — Método de pago](docs/prototypes/05-checkout-payment.png)

Formulario de tarjeta simulada, paso 2 del proceso de compra.

---

**Confirmación de pedido** · *Caso de uso 3*

![Confirmación de pedido](docs/prototypes/06-order-confirmation.png)

Pantalla de éxito con número de pedido generado.

---

**Mis pedidos**

![Mis pedidos](docs/prototypes/07-my-orders.png)

Historial de pedidos con estado y detalle de productos.

### **1.4. Instrucciones de instalación:**

**Requisitos previos:** Node.js 20+, npm 10+, Docker y Docker Compose.

**1. Clonar el repositorio**

```bash
git clone https://github.com/xavierventeo/AI4Devs-finalproject.git
cd AI4Devs-finalproject
git checkout feature-entrega2-XVB
```

**2. Configurar variables de entorno**

Desde la raíz del repo (`AI4Devs-finalproject/`). El proyecto usa un único fichero `.env`, compartido por backend y Docker Compose.

```bash
cp .env.example .env
```

**3. Instalar dependencias**

Desde la raíz del repo. Monorepo con npm workspaces: una sola instalación resuelve `frontend/` y `backend/`.

```bash
npm install
```

**4. Levantar la base de datos**

Desde la raíz del repo (ahí está `docker-compose.yml`).

```bash
docker compose up -d
```

Esto arranca PostgreSQL 16 en el puerto definido por `DB_PORT` (por defecto `5432`).

**5. Aplicar migraciones y cargar datos de prueba**

Desde la raíz del repo.

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
cd ..
```

**6. Arrancar el backend**

Desde la raíz del repo.

```bash
npm run dev --workspace=backend
```

API disponible en `http://localhost:4000`. 
Comprueba que está activa en `http://localhost:4000/api/health`.

**7. Arrancar el frontend**

Desde la raíz del repo, en otra terminal.

```bash
npm run dev --workspace=frontend
```

Aplicación disponible en `http://localhost:3000`.

---

## 2. Arquitectura del Sistema

> Documentación completa de arquitectura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### **2.1. Diagrama de arquitectura:**

RunMarket sigue una arquitectura de **frontend SSR desacoplado + API REST + base de datos relacional**. La separación en tres capas independientes permite testing unitario aislado en cada nivel y escala natural en versiones posteriores.

```mermaid
graph TB
    subgraph Browser["Cliente — Navegador"]
        UI["React · componentes hidratados"]
    end

    subgraph FE["Frontend — Next.js 14 SSR · :3000"]
        SC["Server Components · SSR + SEO"]
        CC["Client Components · Interactividad"]
        APICL["API Client · fetch tipado"]
    end

    subgraph BE["Backend — Express REST API · :4000"]
        ROUTER["Routers · /api/products /api/orders /api/cart /api/checkout"]
        SVC["Domain Services · CatalogService · CartService · CheckoutService · OrderService"]
        REPO["Repositories · abstracción de datos"]
    end

    subgraph DATA["Datos"]
        ORM["Prisma ORM"]
        PG[("PostgreSQL · :5432")]
    end

    UI <-->|HTTPS| SC
    SC --- CC
    SC --> APICL
    CC --> APICL
    APICL <-->|"REST JSON"| ROUTER
    ROUTER --> SVC
    SVC --> REPO
    REPO --> ORM
    ORM --> PG
```

**Patrón:** [Layered Architecture](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) con Repository Pattern en el backend (Router → Controller → Service → Repository). SSR selectivo en el frontend: solo catálogo y ficha de producto se renderizan en servidor (valor SEO); carrito, checkout y pedidos son Client Components.

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **Frontend** | Next.js 14 · React 18 · TypeScript · Tailwind CSS · shadcn/ui | Renderizado SSR de catálogo y fichas de producto; interactividad client-side para carrito y checkout |
| **Backend API** | Node.js 20 · Express 4 · TypeScript · Zod | API REST con lógica de negocio organizada en Services; validación de entrada con Zod |
| **ORM** | Prisma 5 | Abstracción type-safe de acceso a PostgreSQL; gestión de migraciones y seeds |
| **Base de datos** | PostgreSQL 16 | Persistencia relacional del catálogo, pedidos e ítems de pedido |
| **Tests unitarios** | Vitest + RTL (FE) · Jest + Supertest (BE) | Cobertura de componentes, services y endpoints de forma aislada |
| **Tests E2E** | Playwright | Validación de flujos completos: filtrado → ficha → carrito → checkout → confirmación |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto se organiza como **monorepo con npm workspaces** en tres paquetes independientes:

```
runmarket/
├── frontend/          ← Next.js 14 (SSR · puerto 3000)
│   └── src/
│       ├── app/       ← App Router: rutas SSR y Client pages
│       ├── components/← Catálogo, Producto, Carrito, Checkout
│       ├── lib/       ← API client tipado hacia el backend
│       └── types/     ← Tipos compartidos (Product, Order, CartItem)
│
├── backend/           ← Express REST API (puerto 4000)
│   ├── src/
│   │   ├── routes/    ← Definición de endpoints REST
│   │   ├── controllers/← Capa HTTP: validación y respuesta
│   │   ├── services/  ← Lógica de negocio (CatalogService, OrderService…)
│   │   ├── repositories/← Acceso a datos via Prisma
│   │   └── middleware/← CORS, error handler, logger
│   └── prisma/        ← Schema, migraciones y seed de datos
│
└── e2e/               ← Playwright E2E tests
    └── tests/         ← catalog.spec · product.spec · purchase.spec
```

El backend sigue el patrón **Repository + Service Layer**: los Services contienen la lógica de negocio pura (sin dependencias HTTP ni de base de datos directas), lo que permite testearlos de forma aislada con mocks de Repository.

### **2.4. Infraestructura y despliegue**

El despliegue del MVP academico se plantea con una infraestructura de coste 0 EUR/mes, suficiente para que los profesores puedan consultar la aplicacion completa durante la evaluacion:

| Capa | Servicio | Plan | Responsabilidad |
|---|---|---|---|
| Frontend | Vercel | Hobby | Publica la aplicacion Next.js 14 con SSR y assets estaticos |
| Backend | Render | Free Web Service | Publica la API REST Express |
| Base de datos | Supabase | Free PostgreSQL | Aloja PostgreSQL para catalogo, carrito y pedidos |
| Repositorio | GitHub | Free | Fuente de codigo y disparador de despliegues automaticos |

La pipeline del MVP es deliberadamente sencilla: al vincular el repositorio, Vercel despliega automaticamente el frontend y Render despliega automaticamente el backend en cada push. Supabase no despliega codigo; la base de datos se prepara de forma puntual con Prisma:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Esta decision evita sobreingenieria para la entrega y mantiene la arquitectura desacoplada definida en el sistema: frontend SSR, API REST independiente y PostgreSQL gestionado. La principal limitacion es que Render Free puede dormirse tras inactividad y Supabase Free puede pausarse si no se usa durante un periodo prolongado.

> Propuesta completa de infraestructura: [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)  
> Pipeline de despliegue del MVP: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### **2.5. Seguridad**

> Pendiente de documentar.

### **2.6. Tests**

> Pendiente de documentar.

---

## 3. Modelo de Datos

> Documentación completa del modelo de datos, decisiones de diseño y esquema Prisma: [docs/DATA-MODEL.md](docs/DATA-MODEL.md)

### **3.1. Diagrama del modelo de datos:**

El modelo cubre las cinco entidades del MVP: catálogo de productos, carrito de sesión y ciclo de pedido. Los atributos de filtrado running (`distance`, `surface`, `level`, `objective`) se modelan como **arrays nativos de PostgreSQL** indexados con GIN, evitando cuatro tablas de junction innecesarias para un conjunto de valores pequeño y cerrado.

```mermaid
erDiagram
    PRODUCT {
        string   id          PK
        string   name
        string   brand
        decimal  price
        string   category       "shoes | clothing | accessories"
        string[] distance       "Array GIN-indexed"
        string[] surface        "Array GIN-indexed"
        string[] level          "Array GIN-indexed"
        string[] objective      "Array GIN-indexed"
        string[] sizes
        string[] colors
        int      stock
    }

    CART {
        string   id          PK
        string   sessionId   UK
        datetime createdAt
    }

    CART_ITEM {
        string   id          PK
        string   cartId      FK
        string   productId   FK
        int      quantity
        string   size
        string   color
    }

    ORDER {
        string   id          PK  "ORD-timestamp"
        string   sessionId
        string   status          "processing | shipped | delivered | cancelled"
        decimal  total
        string   shippingName
        string   shippingEmail
        string   shippingPhone
        string   shippingAddress
        string   shippingCity
        datetime createdAt
    }

    ORDER_ITEM {
        string   id           PK
        string   orderId      FK
        string   productId    FK
        string   productName     "Snapshot precio de compra"
        decimal  productPrice    "Snapshot precio de compra"
        int      quantity
        string   size
        string   color
    }

    CART        ||--o{ CART_ITEM  : "contiene"
    PRODUCT     ||--o{ CART_ITEM  : "referenciado en"
    ORDER       ||--|{ ORDER_ITEM : "contiene"
    PRODUCT     ||--o{ ORDER_ITEM : "origen del snapshot"
```

### **3.2. Descripción de entidades principales:**

| Entidad | Rol | Restricciones clave |
|---|---|---|
| **PRODUCT** | Catálogo de productos de running. Atributos de filtrado como arrays GIN-indexed para consultas eficientes. | `price` como `Decimal` (no Float); `stock ≥ 0`; `category` enum cerrado |
| **CART** | Carrito activo de una sesión de navegador. Se vacía al completar el checkout. | `sessionId` unique — un carrito por sesión |
| **CART_ITEM** | Línea de ítem del carrito. Usa precio actual del producto (no snapshot). | Unique constraint por `(cartId, productId, size, color)` |
| **ORDER** | Pedido generado tras checkout. Almacena dirección de envío como campos planos (sin entidad ADDRESS en MVP). | `subtotal + shipping = total`; `id` formato `ORD-{timestamp}` |
| **ORDER_ITEM** | Línea de ítem del pedido con **snapshot** de nombre, marca y precio del producto en el momento de compra. Garantiza inmutabilidad del historial. | `productPrice` fijado en checkout; no se actualiza si cambia el producto |

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Set completo de historias (13 US) con criterios de aceptación, estimación y prioridad organizadas por caso de uso: [docs/USER-STORIES.md](docs/USER-STORIES.md)

### Backlog MVP — Secuencia de implementación recomendada

| Orden | ID | Título | Caso de uso | Talla | Justificación de la posición |
|---|---|---|---|---|---|
| 1 | US-001 | Ver el catálogo de productos | CU1 | M | Base de toda la experiencia; sin catálogo no hay entrada al producto |
| 2 | US-002 | Filtrar el catálogo por atributos de running | CU1 | M | Propuesta de valor diferencial; valida el núcleo del producto desde el inicio |
| 3 | US-005 | Consultar la ficha técnica de un producto | CU2 | M | Destino de navegación desde el catálogo; principal punto de conversión |
| 4 | US-006 | Seleccionar talla y color del producto | CU2 | S | Prerrequisito directo de US-007; sin variante válida no hay añadido al carrito |
| 5 | US-007 | Añadir un producto al carrito | CU2 | M | Conecta el descubrimiento con la compra; primer paso transaccional |
| 6 | US-008 | Revisar y modificar el carrito | CU3 | M | Punto de entrada al checkout; el corredor revisa y confirma su selección |
| 7 | US-009 | Introducir datos de envío | CU3 | M | Paso 1 del checkout; sin dirección no hay pedido |
| 8 | US-010 | Seleccionar método de pago simulado | CU3 | M | Paso 2 del checkout; completa los datos necesarios para generar el pedido |
| 9 | US-011 | Revisar y confirmar el pedido | CU3 | S | Paso 3 del checkout; crea el pedido y vacía el carrito |
| 10 | US-012 | Ver la confirmación del pedido | CU3 | S | Cierra el ciclo de compra; sin confirmación el corredor no sabe si la compra fue exitosa |

---

### Muestra de historias representativas

---

### US-002 — Filtrar productos por atributos de running

**Caso de uso asociado:** CU1 — Búsqueda filtrada de productos para running

**Historia de usuario:**
Como corredor, quiero filtrar el catálogo por distancia, superficie, nivel y objetivo de entrenamiento, para encontrar únicamente los productos adaptados a mi perfil sin navegar un catálogo irrelevante.

**Criterios de aceptación:**
- [ ] El corredor selecciona uno o más valores en distancia, superficie, nivel u objetivo; el catálogo se actualiza mostrando solo los productos que cumplen todos los criterios activos (AND entre dimensiones, OR dentro de cada dimensión)
- [ ] El contador de productos se actualiza en tiempo real al cambiar filtros
- [ ] Si no hay resultados, se muestra "No se encontraron productos" con enlace a "Limpiar filtros"
- [ ] Los filtros no bloquean combinaciones: si no hay resultados, la UI lo comunica sin estado de error técnico

**Datos o entidades implicadas:** `Product.distance[]`, `Product.surface[]`, `Product.level[]`, `Product.objective[]` — arrays GIN-indexed en PostgreSQL, filtrado via `CatalogService.getProducts(filters)`

**Estimación:** M · **Prioridad:** Imprescindible para el MVP

---

### US-005 — Consultar ficha técnica de un producto

**Caso de uso asociado:** CU2 — Consulta de ficha de producto y decisión de compra

**Historia de usuario:**
Como corredor, quiero ver la ficha completa de un producto con sus atributos técnicos de running, para decidir si se adapta a mi perfil antes de añadirlo al carrito.

**Criterios de aceptación:**
- [ ] Se muestran imagen, nombre, marca, precio, descripción técnica, atributos running como etiquetas coloreadas (nivel azul, distancia verde, superficie ámbar) y lista de características con check verde
- [ ] Si el producto está agotado (`stock === 0`), el botón "Añadir al carrito" se muestra deshabilitado con texto "Agotado"
- [ ] Producto inexistente: mensaje "Producto no encontrado" con enlace al catálogo
- [ ] La página se renderiza con SSR e incluye metadata `og:title` y `og:description` para SEO

**Datos o entidades implicadas:** `Product`: name, brand, price, image, description, features[], distance[], surface[], level[], stock

**Estimación:** M · **Prioridad:** Imprescindible para el MVP

---

### US-008 — Revisar y modificar el carrito de compra

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero revisar los productos añadidos al carrito y modificar cantidades o eliminar artículos, para confirmar mi selección antes de proceder al pago.

**Criterios de aceptación:**
- [ ] Se muestran todos los productos con imagen, nombre, talla, color, precio unitario, stepper de cantidad y botón eliminar; el panel lateral muestra subtotal, envío y total en tiempo real
- [ ] Envío gratuito a partir de 50€; por debajo, se muestra el coste (4,99€) con nudge "¡Añade X€ más para envío gratis!"
- [ ] Carrito vacío: estado vacío con CTA "Ver catálogo"; botón de checkout deshabilitado
- [ ] El carrito persiste durante la sesión del navegador

**Datos o entidades implicadas:** `Cart.items[]`, `CartItem`: product, quantity, size, color — `CartService.updateItem()`, `CartService.removeItem()`

**Estimación:** M · **Prioridad:** Imprescindible para el MVP

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3 — Base de datos: US-000-TASK-03 — Esquema Prisma**

| Campo | Detalle |
|---|---|
| **ID** | US-000-TASK-03 |
| **Capa** | Backend |
| **Depende de** | US-000-TASK-02 (scaffolding del proyecto backend) |
| **Criterio cubierto** | Prerequisito de CA-2 — define el esquema que hace posible la migración |

**Descripción**

Definición del esquema Prisma completo con todas las entidades del modelo de datos según `docs/DATA-MODEL.md`. Ficheros producidos:

- `backend/prisma/schema.prisma` con datasource apuntando a `env("DATABASE_URL")` y generator `prisma-client-js`.
- Enums `Category { shoes clothing accessories }` y `OrderStatus { processing shipped delivered cancelled }`.
- Modelos `Product`, `Cart`, `CartItem`, `Order`, `OrderItem` con todos los campos, relaciones e **índices GIN** para los arrays de filtrado running (`distance`, `surface`, `level`, `objective`).

Los atributos multivaluados de filtrado running se modelan como **arrays nativos de PostgreSQL** indexados con GIN, evitando cuatro tablas de junction innecesarias para un conjunto de valores pequeño y cerrado. El campo `price` usa `Decimal @db.Decimal(10, 2)` en lugar de `Float` para evitar errores de redondeo en cálculos monetarios.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1 — [US-000: Technical Setup](https://github.com/xavierventeo/AI4Devs-finalproject/pull/1)**
https://github.com/xavierventeo/AI4Devs-finalproject/pull/1

Scaffolding completo del monorepo: workspace npm con `frontend/` (Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Vitest) y `backend/` (Express 4 + Prisma 5 + Zod + Jest + Supertest). Incluye Docker Compose para PostgreSQL 16, esquema Prisma con 5 entidades e índices GIN, seed de 12 productos, middlewares de seguridad (CORS, rate-limit, error handler) y health endpoint. Revisión OWASP superada (3 CVEs HIGH corregidos actualizando Next.js a 15.5.19).

**Pull Request 2**

**Pull Request 3**
