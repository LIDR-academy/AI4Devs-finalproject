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

Juan Pablo Peche Altez.  

### **0.2. Nombre del proyecto:**

CRM Específico para Importadora.

### **0.3. Descripción breve del proyecto:**

Sistema web full-stack para gestionar el ciclo comercial y operativo de una empresa de importación. El producto permite administrar clientes, contactos, conversaciones, oportunidades, cotizaciones, productos, proveedores, órdenes de cliente, solicitudes de abastecimiento, órdenes al proveedor, envíos, recepción de productos, facturación, pagos y reportes.

El sistema está diseñado para una empresa con 3 empresarios / socios y 2 vendedores. Los empresarios / socios tienen acceso completo al negocio, mientras que los vendedores solo pueden ver y gestionar los clientes que les fueron asignados. Cada producto tiene un proveedor principal y cada orden normalmente se asocia a un solo proveedor.

### **0.4. URL del proyecto:**

https://github.com/jpeche1/AI4Devs-finalproject-jpp



### 0.5. URL o archivo comprimido del repositorio

https://github.com/jpeche1/AI4Devs-finalproject-jpp

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

El objetivo del producto es centralizar y controlar el flujo completo de ventas, abastecimiento, logística y cobranza de una empresa de importación.

El sistema soluciona los siguientes problemas:

- Falta de visibilidad centralizada sobre clientes, conversaciones y oportunidades.
- Dificultad para hacer seguimiento del estado de órdenes.
- Falta de control sobre qué vendedor puede ver cada cliente.
- Necesidad de relacionar cada producto con su proveedor principal.
- Necesidad de dar seguimiento al abastecimiento de productos.
- Falta de control sobre envíos, recepción del producto y pagos.
- Necesidad de reportes de ventas, pagos pendientes, órdenes y abastecimiento.

El producto está dirigido a empresarios / socios, vendedores y administradores de una empresa de importación que necesita operar con mayor trazabilidad y control.

### **1.2. Características y funcionalidades principales:**

#### Gestión de usuarios y roles

- Inicio de sesión con usuario y contraseña.
- Roles definidos:
  - Administrador del sistema.
  - Empresario / Socio.
  - Vendedor.
- Administración de usuarios por parte del administrador.
- Control de visibilidad según rol.
- Control de acceso por cliente asignado.

#### Gestión de clientes

- Registro de clientes.
- Registro de contactos por cliente.
- Asignación de clientes a vendedores.
- Historial de conversaciones.
- Registro de actividades comerciales.
- Tareas de seguimiento.
- Ficha completa del cliente con oportunidades, cotizaciones, órdenes, pagos, documentos y miembros asignados.

#### Gestión comercial

- Registro de oportunidades.
- Seguimiento por estado comercial.
- Creación de cotizaciones.
- Conversión de cotizaciones aceptadas en órdenes de cliente.
- Seguimiento de órdenes por cliente y vendedor.

#### Gestión de proveedores y productos

- Registro de proveedores.
- Registro de contactos de proveedores.
- Registro de productos.
- Asociación de cada producto con un proveedor principal.
- Validación para evitar productos activos sin proveedor principal.
- Identificación automática del proveedor desde el producto.

#### Gestión de órdenes y abastecimiento

- Creación de órdenes de cliente.
- Validación de proveedor asociado al producto.
- Alerta si una orden contiene productos de diferentes proveedores.
- Creación de solicitudes de abastecimiento.
- Creación de órdenes al proveedor.
- Seguimiento del estado de abastecimiento.
- Registro de producto disponible.

#### Gestión logística

- Registro de preparación de pedido.
- Registro de despacho.
- Registro de transportista.
- Registro de tracking.
- Registro de entrega.
- Registro de incidencias logísticas.

#### Gestión financiera

- Registro de facturas.
- Registro de pagos parciales.
- Registro de pagos completos.
- Cálculo automático de saldo pendiente.
- Identificación de pagos vencidos.
- Adjuntos de comprobantes de pago.

#### Reportes y dashboard

- Dashboard general para administradores y empresarios / socios.
- Dashboard limitado para vendedores.
- Reportes de ventas.
- Reportes de órdenes.
- Reportes de abastecimiento.
- Reportes de pagos.
- Reportes de proveedores y productos.
- Reportes de rentabilidad para usuarios autorizados.

#### Auditoría

- Tabla interna de audit logs.
- Registro de cambios críticos.
- Registro de usuario, fecha, acción, valor anterior y valor nuevo.

### **1.3. Diseño y experiencia de usuario:**

Todavía no existen imágenes, wireframes o videotutorial. Pendiente por incorporar cuando se avance con el diseño UX.

#### Experiencia esperada

El usuario inicia sesión y visualiza un dashboard según su rol.

##### Empresario / Socio

Al ingresar, ve un dashboard con:

- Ventas totales.
- Órdenes abiertas.
- Órdenes en abastecimiento.
- Órdenes enviadas.
- Órdenes entregadas.
- Pagos pendientes.
- Pagos vencidos.
- Oportunidades abiertas.
- Ventas por vendedor.
- Solicitudes de abastecimiento pendientes.

##### Vendedor

Al ingresar, ve un dashboard limitado con:

- Clientes asignados.
- Oportunidades abiertas.
- Cotizaciones enviadas.
- Tareas pendientes.
- Órdenes de sus clientes.
- Estados visibles de abastecimiento.
- Próximos seguimientos.

#### Navegación principal sugerida

- Dashboard.
- Clientes.
- Actividades.
- Oportunidades.
- Cotizaciones.
- Órdenes de cliente.
- Abastecimiento.
- Proveedores.
- Productos.
- Órdenes al proveedor.
- Envíos.
- Pagos.
- Reportes.
- Usuarios.
- Configuración.

#### Pestañas sugeridas en la ficha del cliente

- Resumen.
- Contactos.
- Actividades.
- Oportunidades.
- Cotizaciones.
- Órdenes.
- Abastecimiento.
- Pagos.
- Documentos.
- Miembros asignados.
- Historial.

### **1.4. Instrucciones de instalación:**

> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

Estas instrucciones asumen el stack definido para el proyecto:

- Next.js.
- TypeScript.
- Server Actions / API Routes.
- Tailwind CSS.
- shadcn/ui.
- TanStack Table.
- React Hook Form.
- Zod.
- PostgreSQL.
- Prisma.
- Supabase Auth.
- Supabase Storage.
- Vercel.
- Dashboard interno en fase 1.
- Power BI o Metabase en fase 2.

#### Requisitos previos

- Node.js LTS instalado.
- npm, pnpm o yarn instalado.
- Cuenta en Supabase.
- Cuenta en Vercel.
- Base de datos PostgreSQL disponible en Supabase.
- Variables de entorno configuradas.

#### Instalación local sugerida

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
npm install
```

#### Variables de entorno sugeridas

Crear un archivo `.env.local` con las siguientes variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxxxx"
SUPABASE_SERVICE_ROLE_KEY="xxxxx"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Configurar Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

#### Ejecutar semillas de datos

```bash
npm run seed
```

Pendiente por implementar script de seed.

#### Ejecutar el proyecto en local

```bash
npm run dev
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

#### Comandos sugeridos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npx prisma studio
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

La arquitectura recomendada es un monolito modular full-stack con Next.js.

```mermaid
flowchart TD
    U[Usuarios] --> B[Aplicación Web Next.js]
    B --> UI[UI: Tailwind CSS + shadcn/ui]
    B --> SA[Server Actions / API Routes]
    SA --> AUTH[Supabase Auth]
    SA --> DB[(PostgreSQL en Supabase)]
    SA --> ORM[Prisma ORM]
    SA --> ST[Supabase Storage]
    SA --> AUDIT[Audit Logs]
    DB --> REPORTS[Dashboard interno]
    REPORTS --> BI[Power BI o Metabase en fase 2]
    B --> V[Vercel Hosting]
```

#### Patrón arquitectónico

El proyecto sigue un enfoque de monolito modular. La aplicación vive en un solo proyecto Next.js, pero se organiza por dominios funcionales:

- Clientes.
- Proveedores.
- Productos.
- Oportunidades.
- Cotizaciones.
- Órdenes.
- Abastecimiento.
- Pagos.
- Reportes.
- Auditoría.

#### Justificación

Esta arquitectura se eligió porque permite:

- Reducir complejidad inicial.
- Desarrollar rápidamente un MVP.
- Mantener el sistema escalable.
- Tener frontend y backend en un mismo repositorio.
- Facilitar despliegue en Vercel.
- Usar Supabase para autenticación, base de datos y archivos.
- Mantener PostgreSQL como fuente principal de datos.

#### Sacrificios o déficits

- Si el sistema crece mucho, podría ser necesario separar backend y frontend.
- Las reglas de permisos deben diseñarse cuidadosamente desde el inicio.
- Las Server Actions deben organizarse bien para evitar lógica dispersa.
- Los reportes avanzados pueden requerir Power BI, Metabase o una capa analítica posterior.

### **2.2. Descripción de componentes principales:**

#### Next.js

Framework principal de la aplicación. Se usará para frontend, backend, rutas, vistas, Server Actions y API Routes.

#### TypeScript

Lenguaje principal del proyecto. Permite mayor seguridad en tipos, mejor mantenibilidad y menor riesgo de errores.

#### Tailwind CSS

Framework CSS para construir interfaces rápidas, consistentes y responsive.

#### shadcn/ui

Biblioteca de componentes UI reutilizables para acelerar la construcción de formularios, tablas, modales, menús y dashboards.

#### TanStack Table

Herramienta para tablas avanzadas con filtros, ordenamiento, paginación y columnas configurables.

#### React Hook Form

Librería para gestión de formularios.

#### Zod

Librería para validaciones de datos en frontend y backend.

#### PostgreSQL

Base de datos relacional principal del sistema.

#### Prisma

ORM utilizado para modelar entidades, relaciones, migraciones y acceso a base de datos.

#### Supabase Auth

Servicio de autenticación para manejo de usuarios, sesiones y credenciales.

#### Supabase Storage

Servicio para almacenamiento de documentos, comprobantes, cotizaciones, facturas y archivos adjuntos.

#### Vercel

Plataforma de despliegue de la aplicación web.

#### Audit Logs

Tabla interna para registrar acciones críticas y cambios relevantes del sistema.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Estructura sugerida del proyecto:

```bash
crm-importacion/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── reset-password/
│   ├── dashboard/
│   ├── clients/
│   ├── suppliers/
│   ├── products/
│   ├── opportunities/
│   ├── quotes/
│   ├── customer-orders/
│   ├── procurement/
│   ├── supplier-orders/
│   ├── shipments/
│   ├── payments/
│   ├── reports/
│   ├── users/
│   └── api/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── layout/
│   └── dashboard/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   ├── validations/
│   ├── storage/
│   └── audit/
├── modules/
│   ├── clients/
│   ├── suppliers/
│   ├── products/
│   ├── orders/
│   ├── procurement/
│   ├── payments/
│   └── reports/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── tests/
├── .env.local.example
├── package.json
└── README.md
```

#### Descripción de carpetas principales

- `app/`: rutas principales de Next.js.
- `components/`: componentes reutilizables.
- `lib/`: lógica compartida como autenticación, permisos, validaciones y auditoría.
- `modules/`: lógica organizada por dominio funcional.
- `prisma/`: modelo de datos, migraciones y seeds.
- `public/`: archivos públicos.
- `tests/`: pruebas unitarias, integración y e2e.

### **2.4. Infraestructura y despliegue**

```mermaid
flowchart LR
    DEV[Desarrollador] --> GH[Repositorio GitHub]
    GH --> VC[Vercel]
    VC --> APP[Aplicación Next.js]
    APP --> SB[Supabase]
    SB --> DB[(PostgreSQL)]
    SB --> AUTH[Auth]
    SB --> STORAGE[Storage]
```

#### Infraestructura

- Código fuente alojado en GitHub o repositorio equivalente.
- Aplicación desplegada en Vercel.
- Base de datos en Supabase PostgreSQL.
- Autenticación en Supabase Auth.
- Archivos en Supabase Storage.
- Variables de entorno gestionadas en Vercel y entorno local.

#### Proceso de despliegue sugerido

1. El desarrollador sube cambios al repositorio.
2. Se crea un Pull Request.
3. Se ejecutan validaciones.
4. Se revisa el código.
5. Se aprueba el Pull Request.
6. Se mergea a la rama principal.
7. Vercel despliega automáticamente.
8. Prisma ejecuta migraciones según el proceso definido.

### **2.5. Seguridad**

#### Autenticación

- Login mediante Supabase Auth.
- Sesiones seguras.
- Recuperación de contraseña.

#### Autorización

- Permisos por rol:
  - Administrador.
  - Empresario / Socio.
  - Vendedor.
- Visibilidad por cliente asignado.
- Validación de permisos en frontend y backend.

#### Seguridad de datos

- Los vendedores solo pueden ver clientes asignados.
- Los vendedores no pueden ver costos ni márgenes.
- Los vendedores no pueden acceder a clientes no asignados por URL directa.
- Los documentos respetan los permisos del registro asociado.
- Los pagos solo pueden ser modificados por administradores y empresarios / socios.

#### Auditoría

- Registro de cambios críticos.
- Usuario que realizó la acción.
- Fecha y hora.
- Entidad afectada.
- Valor anterior.
- Valor nuevo.

#### Validación

- Validaciones con Zod.
- Validación de formularios en frontend.
- Validación de datos en Server Actions / API Routes.

### **2.6. Tests**

Pendiente de implementación. Se proponen los siguientes tests:

#### Tests unitarios

- Validación de roles y permisos.
- Validación de formularios con Zod.
- Cálculo de saldos pendientes.
- Validación de producto con proveedor principal.
- Validación de orden con proveedor único.

#### Tests de integración

- Crear cliente.
- Asignar cliente a vendedor.
- Crear producto con proveedor.
- Crear orden de cliente.
- Crear solicitud de abastecimiento.
- Registrar pago parcial.
- Registrar pago completo.

#### Tests e2e

- Flujo completo de vendedor:
  - Login.
  - Crear cliente.
  - Crear oportunidad.
  - Crear cotización.
  - Ver estado de orden.

- Flujo completo de empresario / socio:
  - Login.
  - Crear proveedor.
  - Crear producto.
  - Crear orden de cliente.
  - Crear orden al proveedor.
  - Registrar envío.
  - Registrar pago.
  - Cerrar orden.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    USERS {
        uuid id PK
        string full_name
        string email UK
        string role
        string status
        datetime created_at
        datetime updated_at
    }

    CLIENTS {
        uuid id PK
        string commercial_name
        string legal_name
        string client_type
        string status
        string country
        string city
        string address
        string phone
        string email
        string tax_id
        uuid primary_owner_id FK
        datetime created_at
        datetime updated_at
    }

    CLIENT_MEMBERS {
        uuid id PK
        uuid client_id FK
        uuid user_id FK
        string member_role
        datetime created_at
    }

    CLIENT_CONTACTS {
        uuid id PK
        uuid client_id FK
        string first_name
        string last_name
        string position
        string email
        string phone
        boolean is_primary
        string status
        datetime created_at
        datetime updated_at
    }

    ACTIVITIES {
        uuid id PK
        uuid client_id FK
        uuid contact_id FK
        uuid user_id FK
        string activity_type
        string result
        string next_action
        datetime next_follow_up_at
        text comments
        datetime created_at
        datetime updated_at
    }

    OPPORTUNITIES {
        uuid id PK
        uuid client_id FK
        uuid contact_id FK
        uuid owner_id FK
        uuid product_id FK
        string name
        int estimated_quantity
        decimal estimated_value
        int probability
        string status
        datetime estimated_close_date
        text lost_reason
        datetime created_at
        datetime updated_at
    }

    SUPPLIERS {
        uuid id PK
        string commercial_name
        string legal_name
        string supplier_type
        string status
        string country
        string city
        string email
        string phone
        string payment_terms
        string currency
        string incoterm
        int average_lead_time_days
        datetime created_at
        datetime updated_at
    }

    SUPPLIER_CONTACTS {
        uuid id PK
        uuid supplier_id FK
        string first_name
        string last_name
        string position
        string email
        string phone
        boolean is_primary
        string status
        datetime created_at
        datetime updated_at
    }

    PRODUCTS {
        uuid id PK
        uuid supplier_id FK
        string sku
        string supplier_sku
        string name
        string brand
        string category
        string presentation
        string unit
        decimal base_price
        decimal estimated_cost
        decimal estimated_margin
        int lead_time_days
        int minimum_order_quantity
        string status
        datetime created_at
        datetime updated_at
    }

    QUOTES {
        uuid id PK
        uuid client_id FK
        uuid opportunity_id FK
        uuid owner_id FK
        string quote_number UK
        string status
        decimal subtotal
        decimal discount
        decimal taxes
        decimal total
        datetime issued_at
        datetime expires_at
        datetime created_at
        datetime updated_at
    }

    QUOTE_ITEMS {
        uuid id PK
        uuid quote_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal discount
        decimal total
    }

    CUSTOMER_ORDERS {
        uuid id PK
        uuid client_id FK
        uuid quote_id FK
        uuid owner_id FK
        uuid supplier_id FK
        string order_number UK
        string commercial_status
        string procurement_status
        string logistics_status
        string payment_status
        decimal subtotal
        decimal discount
        decimal taxes
        decimal total
        datetime promised_delivery_date
        datetime created_at
        datetime updated_at
    }

    CUSTOMER_ORDER_ITEMS {
        uuid id PK
        uuid customer_order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal discount
        decimal total
    }

    PROCUREMENT_REQUESTS {
        uuid id PK
        uuid client_id FK
        uuid product_id FK
        uuid supplier_id FK
        uuid customer_order_id FK
        uuid requested_by FK
        int quantity_required
        datetime required_by
        string status
        text comments
        datetime created_at
        datetime updated_at
    }

    SUPPLIER_ORDERS {
        uuid id PK
        uuid supplier_id FK
        uuid customer_order_id FK
        uuid procurement_request_id FK
        string supplier_order_number UK
        string status
        decimal total_cost
        string currency
        datetime estimated_arrival_date
        datetime received_at
        datetime created_at
        datetime updated_at
    }

    SUPPLIER_ORDER_ITEMS {
        uuid id PK
        uuid supplier_order_id FK
        uuid product_id FK
        int quantity
        decimal unit_cost
        decimal total_cost
    }

    SHIPMENTS {
        uuid id PK
        uuid customer_order_id FK
        string carrier
        string tracking_number
        string status
        datetime shipped_at
        datetime estimated_delivery_at
        datetime delivered_at
        text comments
        datetime created_at
        datetime updated_at
    }

    INVOICES {
        uuid id PK
        uuid customer_order_id FK
        string invoice_number UK
        decimal amount
        datetime issued_at
        datetime due_at
        string status
        datetime created_at
        datetime updated_at
    }

    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        uuid customer_order_id FK
        decimal amount
        string payment_method
        datetime paid_at
        string status
        text comments
        datetime created_at
        datetime updated_at
    }

    DOCUMENTS {
        uuid id PK
        string entity_type
        uuid entity_id
        string file_name
        string file_url
        string file_type
        uuid uploaded_by FK
        datetime created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string entity_type
        uuid entity_id
        string action
        json old_value
        json new_value
        datetime created_at
    }

    USERS ||--o{ CLIENTS : owns
    USERS ||--o{ CLIENT_MEMBERS : assigned
    CLIENTS ||--o{ CLIENT_MEMBERS : has
    CLIENTS ||--o{ CLIENT_CONTACTS : has
    CLIENTS ||--o{ ACTIVITIES : has
    CLIENT_CONTACTS ||--o{ ACTIVITIES : referenced_by
    CLIENTS ||--o{ OPPORTUNITIES : has
    PRODUCTS ||--o{ OPPORTUNITIES : requested_in
    SUPPLIERS ||--o{ PRODUCTS : supplies
    SUPPLIERS ||--o{ SUPPLIER_CONTACTS : has
    CLIENTS ||--o{ QUOTES : receives
    QUOTES ||--o{ QUOTE_ITEMS : contains
    PRODUCTS ||--o{ QUOTE_ITEMS : quoted
    CLIENTS ||--o{ CUSTOMER_ORDERS : places
    CUSTOMER_ORDERS ||--o{ CUSTOMER_ORDER_ITEMS : contains
    PRODUCTS ||--o{ CUSTOMER_ORDER_ITEMS : ordered
    SUPPLIERS ||--o{ CUSTOMER_ORDERS : fulfills
    CUSTOMER_ORDERS ||--o{ PROCUREMENT_REQUESTS : may_have
    PRODUCTS ||--o{ PROCUREMENT_REQUESTS : requested
    SUPPLIERS ||--o{ PROCUREMENT_REQUESTS : supplier
    SUPPLIERS ||--o{ SUPPLIER_ORDERS : receives
    CUSTOMER_ORDERS ||--o{ SUPPLIER_ORDERS : may_generate
    SUPPLIER_ORDERS ||--o{ SUPPLIER_ORDER_ITEMS : contains
    PRODUCTS ||--o{ SUPPLIER_ORDER_ITEMS : procured
    CUSTOMER_ORDERS ||--o{ SHIPMENTS : has
    CUSTOMER_ORDERS ||--o{ INVOICES : has
    INVOICES ||--o{ PAYMENTS : has
    USERS ||--o{ AUDIT_LOGS : creates
```

### **3.2. Descripción de entidades principales:**

#### USERS

Representa a los usuarios del sistema.

Campos principales:

- `id`: UUID, clave primaria.
- `full_name`: nombre completo.
- `email`: email único.
- `role`: administrador, empresario_socio o vendedor.
- `status`: activo o inactivo.
- `created_at`: fecha de creación.
- `updated_at`: fecha de actualización.

Restricciones:

- `email` debe ser único.
- `role` debe pertenecer a los roles permitidos.

#### CLIENTS

Representa a los clientes o prospectos.

Campos principales:

- `id`: UUID, clave primaria.
- `commercial_name`: nombre comercial.
- `legal_name`: razón social.
- `client_type`: tipo de cliente.
- `status`: prospecto, activo, inactivo, perdido o bloqueado.
- `primary_owner_id`: usuario responsable principal.

Relaciones:

- Un cliente puede tener muchos contactos.
- Un cliente puede tener muchos miembros asignados.
- Un cliente puede tener muchas actividades, oportunidades, cotizaciones y órdenes.

#### CLIENT_MEMBERS

Representa la asignación de usuarios a clientes.

Campos principales:

- `id`: UUID, clave primaria.
- `client_id`: FK a clientes.
- `user_id`: FK a usuarios.
- `member_role`: responsable, vendedor, observador u otro.

Uso:

- Permite que los vendedores solo vean clientes asignados.
- Los empresarios / socios y administradores pueden ver todos los clientes.

#### SUPPLIERS

Representa proveedores.

Campos principales:

- `id`: UUID, clave primaria.
- `commercial_name`: nombre comercial.
- `legal_name`: razón social.
- `supplier_type`: fabricante, productor, exportador, distribuidor u otro.
- `status`: prospecto, en evaluación, activo, inactivo o bloqueado.
- `payment_terms`: condiciones de pago.
- `currency`: moneda.
- `incoterm`: Incoterm, si aplica.
- `average_lead_time_days`: tiempo promedio de abastecimiento.

Relaciones:

- Un proveedor puede tener muchos productos.
- Un proveedor puede tener muchos contactos.
- Un proveedor puede tener muchas órdenes al proveedor.

#### PRODUCTS

Representa productos comercializados por la empresa.

Campos principales:

- `id`: UUID, clave primaria.
- `supplier_id`: FK al proveedor principal.
- `sku`: SKU interno.
- `supplier_sku`: SKU del proveedor.
- `name`: nombre del producto.
- `brand`: marca.
- `category`: categoría.
- `presentation`: presentación.
- `unit`: unidad de venta.
- `base_price`: precio base.
- `estimated_cost`: costo estimado.
- `estimated_margin`: margen estimado.
- `lead_time_days`: tiempo estimado de abastecimiento.
- `minimum_order_quantity`: cantidad mínima.
- `status`: activo o inactivo.

Restricciones:

- Un producto activo debe tener proveedor principal.
- El SKU interno debe ser único.

#### CUSTOMER_ORDERS

Representa órdenes de cliente.

Campos principales:

- `id`: UUID, clave primaria.
- `client_id`: FK al cliente.
- `quote_id`: FK a cotización, opcional.
- `owner_id`: usuario responsable.
- `supplier_id`: proveedor relacionado, derivado del producto principal.
- `order_number`: número único de orden.
- `commercial_status`: estado comercial.
- `procurement_status`: estado de abastecimiento.
- `logistics_status`: estado logístico.
- `payment_status`: estado de pago.
- `total`: total de la orden.

Restricciones:

- Toda orden debe tener cliente.
- Toda orden debe tener al menos un producto.
- Una orden normalmente debe pertenecer a un solo proveedor.
- Si hay productos de distintos proveedores, el sistema debe mostrar una alerta y recomendar dividir la orden por proveedor.

#### PROCUREMENT_REQUESTS

Representa solicitudes de abastecimiento.

Campos principales:

- `id`: UUID, clave primaria.
- `client_id`: FK al cliente.
- `product_id`: FK al producto.
- `supplier_id`: FK al proveedor principal.
- `customer_order_id`: FK a orden de cliente, opcional.
- `requested_by`: usuario solicitante.
- `quantity_required`: cantidad requerida.
- `required_by`: fecha requerida.
- `status`: estado de abastecimiento.
- `comments`: comentarios.

Uso:

- Puede ser creada por vendedores para clientes asignados.
- Solo empresarios / socios y administradores pueden continuar con órdenes al proveedor.

#### SUPPLIER_ORDERS

Representa órdenes realizadas al proveedor.

Campos principales:

- `id`: UUID, clave primaria.
- `supplier_id`: FK al proveedor.
- `customer_order_id`: FK a orden de cliente.
- `procurement_request_id`: FK a solicitud de abastecimiento.
- `supplier_order_number`: número único.
- `status`: estado de la orden al proveedor.
- `total_cost`: costo total.
- `currency`: moneda.
- `estimated_arrival_date`: fecha estimada.
- `received_at`: fecha real de recepción.

#### INVOICES y PAYMENTS

Representan facturas y pagos.

Uso:

- Una orden puede tener una o varias facturas.
- Una factura puede tener uno o varios pagos.
- El sistema debe calcular saldo pendiente.
- Si el saldo es mayor a cero después del vencimiento, el pago queda vencido.

#### DOCUMENTS

Representa archivos adjuntos.

Uso:

- Puede asociarse a clientes, proveedores, cotizaciones, órdenes, facturas, pagos o documentos logísticos.
- Los permisos de acceso dependen de la entidad asociada.

#### AUDIT_LOGS

Representa el historial de cambios críticos.

Uso:

- Registrar usuario.
- Entidad afectada.
- Acción realizada.
- Valor anterior.
- Valor nuevo.
- Fecha y hora.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad.

Aunque la arquitectura usa Next.js con Server Actions, también se proponen API Routes para operaciones principales o integraciones futuras.

```yaml
openapi: 3.0.3
info:
  title: CRM Específico para Importadora API
  version: 1.0.0
  description: API principal para clientes, órdenes y abastecimiento.
servers:
  - url: https://example.com/api
    description: Producción
  - url: http://localhost:3000/api
    description: Local

paths:
  /clients:
    get:
      summary: Listar clientes visibles para el usuario autenticado
      tags:
        - Clients
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Lista de clientes
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Client"
    post:
      summary: Crear un cliente
      tags:
        - Clients
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateClientRequest"
      responses:
        "201":
          description: Cliente creado
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Client"

  /customer-orders:
    post:
      summary: Crear orden de cliente
      tags:
        - CustomerOrders
      security:
        - bearerAuth: []
      description: Crea una orden de cliente e identifica automáticamente el proveedor principal según los productos seleccionados.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateCustomerOrderRequest"
      responses:
        "201":
          description: Orden creada
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CustomerOrder"
        "400":
          description: Orden inválida, por ejemplo productos de diferentes proveedores

  /procurement-requests:
    post:
      summary: Crear solicitud de abastecimiento
      tags:
        - Procurement
      security:
        - bearerAuth: []
      description: Permite crear una solicitud de abastecimiento asociada a cliente, producto y proveedor principal.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateProcurementRequest"
      responses:
        "201":
          description: Solicitud creada
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProcurementRequest"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Client:
      type: object
      properties:
        id:
          type: string
          format: uuid
        commercialName:
          type: string
        legalName:
          type: string
        status:
          type: string
        country:
          type: string
        city:
          type: string
        primaryOwnerId:
          type: string
          format: uuid

    CreateClientRequest:
      type: object
      required:
        - commercialName
      properties:
        commercialName:
          type: string
        legalName:
          type: string
        country:
          type: string
        city:
          type: string
        email:
          type: string
        phone:
          type: string

    CreateCustomerOrderRequest:
      type: object
      required:
        - clientId
        - items
      properties:
        clientId:
          type: string
          format: uuid
        quoteId:
          type: string
          format: uuid
        items:
          type: array
          items:
            type: object
            required:
              - productId
              - quantity
              - unitPrice
            properties:
              productId:
                type: string
                format: uuid
              quantity:
                type: integer
              unitPrice:
                type: number

    CustomerOrder:
      type: object
      properties:
        id:
          type: string
          format: uuid
        orderNumber:
          type: string
        clientId:
          type: string
          format: uuid
        supplierId:
          type: string
          format: uuid
        commercialStatus:
          type: string
        procurementStatus:
          type: string
        logisticsStatus:
          type: string
        paymentStatus:
          type: string
        total:
          type: number

    CreateProcurementRequest:
      type: object
      required:
        - clientId
        - productId
        - quantityRequired
      properties:
        clientId:
          type: string
          format: uuid
        productId:
          type: string
          format: uuid
        customerOrderId:
          type: string
          format: uuid
        quantityRequired:
          type: integer
        requiredBy:
          type: string
          format: date

    ProcurementRequest:
      type: object
      properties:
        id:
          type: string
          format: uuid
        clientId:
          type: string
          format: uuid
        productId:
          type: string
          format: uuid
        supplierId:
          type: string
          format: uuid
        quantityRequired:
          type: integer
        status:
          type: string
```

---

## 5. Historias de Usuario

> Se documentan todas las historias de usuario principales definidas para el sistema, agrupadas por rol.

---

### 5.1. Historias de usuario del Administrador del sistema

#### **US-001. Crear usuario**

**Como** administrador del sistema,  
**quiero** crear usuarios,  
**para** que cada miembro de la empresa pueda acceder al sistema con el rol correspondiente.

**Criterios de aceptación:**

- El administrador puede ingresar nombre, email y rol.
- El sistema valida que el email no esté duplicado.
- El usuario queda activo por defecto.
- El sistema registra la fecha de creación.
- El usuario creado puede iniciar sesión si tiene credenciales válidas.

---

#### **US-002. Editar usuario**

**Como** administrador del sistema,  
**quiero** editar usuarios,  
**para** actualizar su información o cambiar sus permisos.

**Criterios de aceptación:**

- El administrador puede cambiar nombre, email, rol y estado.
- El cambio de rol se aplica inmediatamente.
- El sistema registra quién hizo el cambio.
- Un usuario desactivado no puede iniciar sesión.
- El historial del usuario no se elimina.

---

#### **US-003. Desactivar usuario**

**Como** administrador del sistema,  
**quiero** desactivar usuarios,  
**para** bloquear accesos no autorizados sin perder el historial de acciones.

**Criterios de aceptación:**

- El usuario desactivado no puede iniciar sesión.
- El historial del usuario se conserva.
- Los clientes asignados al usuario pueden ser reasignados.
- Las actividades históricas siguen asociadas al usuario original.
- El sistema registra la fecha y el usuario que realizó la desactivación.

---

### 5.2. Historias de usuario de Empresarios / Socios

#### **US-004. Ver todos los clientes**

**Como** empresario / socio,  
**quiero** ver todos los clientes,  
**para** tener control completo de la cartera comercial.

**Criterios de aceptación:**

- Puede ver clientes de todos los vendedores.
- Puede filtrar por estado, vendedor, ciudad, país o tipo de cliente.
- Puede acceder al detalle de cualquier cliente.
- Puede ver oportunidades, órdenes, pagos y actividades asociadas al cliente.
- Puede ver miembros asignados al cliente.

---

#### **US-005. Asignar clientes a vendedores**

**Como** empresario / socio,  
**quiero** asignar clientes a vendedores,  
**para** controlar quién trabaja cada cuenta.

**Criterios de aceptación:**

- Puede agregar o quitar vendedores asignados.
- El vendedor solo ve el cliente si está asignado.
- El sistema registra el historial de asignación.
- La asignación puede incluir más de un miembro si el negocio lo requiere.
- El cliente sigue visible para empresarios / socios y administradores.

---

#### **US-006. Crear proveedor**

**Como** empresario / socio,  
**quiero** crear proveedores,  
**para** registrar empresas que suministran productos a la importadora.

**Criterios de aceptación:**

- Puede registrar nombre comercial y razón social.
- Puede registrar país, ciudad, email, teléfono y contacto principal.
- Puede registrar condiciones de pago, moneda e Incoterm si aplica.
- Puede marcar el proveedor como prospecto, en evaluación, activo, inactivo o bloqueado.
- El proveedor queda disponible para asociarse a productos.

---

#### **US-007. Crear producto con proveedor principal**

**Como** empresario / socio,  
**quiero** crear productos y asignarles un proveedor principal,  
**para** que el sistema sepa quién suministra cada producto.

**Criterios de aceptación:**

- El producto debe tener SKU, nombre y proveedor principal.
- El proveedor principal debe estar activo.
- El sistema no permite activar un producto sin proveedor principal.
- El producto queda disponible para cotizaciones y órdenes.
- Los vendedores no pueden ver costos ni márgenes del producto.

---

#### **US-008. Crear orden de cliente**

**Como** empresario / socio,  
**quiero** crear órdenes de cliente,  
**para** formalizar pedidos aceptados por los clientes.

**Criterios de aceptación:**

- La orden debe estar asociada a un cliente.
- La orden debe tener al menos un producto.
- El sistema identifica automáticamente el proveedor principal del producto.
- La orden calcula subtotal, descuentos, impuestos y total.
- La orden queda asociada al vendedor responsable o usuario creador.
- La orden inicia con un estado comercial definido.
- Si hay productos de diferentes proveedores, el sistema muestra una alerta y recomienda dividir la orden.

---

#### **US-009. Crear orden al proveedor**

**Como** empresario / socio,  
**quiero** crear una orden al proveedor,  
**para** abastecer una orden de cliente cuando el producto lo requiera.

**Criterios de aceptación:**

- La orden al proveedor se asocia al proveedor principal del producto.
- Puede estar vinculada a una orden de cliente.
- Puede estar vinculada a una solicitud de abastecimiento.
- Se registran productos, cantidades, costos y fechas estimadas.
- El sistema permite actualizar el estado de abastecimiento.
- Los vendedores no pueden crear ni modificar órdenes al proveedor.

---

#### **US-010. Registrar pago**

**Como** empresario / socio,  
**quiero** registrar pagos,  
**para** controlar el saldo pendiente de las órdenes.

**Criterios de aceptación:**

- Puede registrar pago parcial o completo.
- Puede registrar método de pago.
- Puede registrar fecha de pago.
- Puede adjuntar comprobante.
- El sistema calcula saldo pendiente.
- Si el saldo llega a cero, el estado cambia a pagado.
- Si la fecha de vencimiento pasa y existe saldo pendiente, el sistema marca el pago como vencido.

---

#### **US-011. Ver reportes generales**

**Como** empresario / socio,  
**quiero** ver reportes generales,  
**para** analizar ventas, pagos, órdenes, abastecimiento y desempeño comercial.

**Criterios de aceptación:**

- Puede ver ventas totales.
- Puede ver pagos pendientes y vencidos.
- Puede ver órdenes por estado.
- Puede ver oportunidades abiertas, ganadas y perdidas.
- Puede ver desempeño por vendedor.
- Puede ver abastecimiento pendiente.
- Puede ver reportes de proveedores y productos.
- Puede ver métricas de margen si tiene permiso.

---

#### **US-012. Actualizar estado de abastecimiento**

**Como** empresario / socio,  
**quiero** actualizar el estado de abastecimiento,  
**para** saber si el producto está pendiente, confirmado, en producción, en tránsito o disponible.

**Criterios de aceptación:**

- Puede cambiar el estado de abastecimiento.
- Puede registrar fecha estimada de disponibilidad.
- Puede registrar comentarios internos.
- Puede adjuntar documentos relacionados.
- El vendedor solo puede ver el estado permitido, sin costos ni márgenes.
- El sistema registra historial de cambios.

---

#### **US-013. Registrar envío y recepción del cliente**

**Como** empresario / socio,  
**quiero** registrar el envío y recepción de productos,  
**para** controlar la etapa logística de la orden de cliente.

**Criterios de aceptación:**

- Puede registrar transportista.
- Puede registrar número de tracking.
- Puede registrar fecha de despacho.
- Puede registrar fecha estimada de entrega.
- Puede registrar fecha real de entrega.
- Puede marcar la orden como recibida por el cliente.
- Puede registrar incidencias logísticas.
- El sistema guarda historial de cambios.

---

### 5.3. Historias de usuario de Vendedores

#### **US-014. Ver clientes asignados**

**Como** vendedor,  
**quiero** ver solo los clientes que me fueron asignados,  
**para** trabajar mi cartera comercial sin acceder a información de otros vendedores.

**Criterios de aceptación:**

- El vendedor solo ve clientes donde aparece como miembro asignado.
- El vendedor no puede buscar clientes de otros vendedores.
- El vendedor no puede acceder por URL directa a clientes no asignados.
- El administrador y los empresarios / socios sí pueden ver todos los clientes.
- El sistema debe validar la autorización en frontend y backend.

---

#### **US-015. Crear cliente**

**Como** vendedor,  
**quiero** crear clientes nuevos,  
**para** registrar prospectos o compradores potenciales.

**Criterios de aceptación:**

- El vendedor puede crear un cliente.
- El cliente queda asignado automáticamente al vendedor que lo creó.
- El cliente queda visible para empresarios / socios y administradores.
- El vendedor puede registrar información comercial básica.
- El vendedor puede registrar contactos del cliente.

---

#### **US-016. Registrar conversación**

**Como** vendedor,  
**quiero** registrar conversaciones con mis clientes,  
**para** mantener un historial de seguimiento comercial.

**Criterios de aceptación:**

- Puede registrar llamada, WhatsApp, email, reunión o nota interna.
- Puede agregar comentarios.
- Puede definir resultado de la actividad.
- Puede definir próxima acción.
- Puede crear una tarea de seguimiento.
- La actividad queda visible dentro de la ficha del cliente.

---

#### **US-017. Crear oportunidad**

**Como** vendedor,  
**quiero** crear oportunidades,  
**para** registrar ventas potenciales de mis clientes asignados.

**Criterios de aceptación:**

- La oportunidad debe estar asociada a un cliente asignado.
- Puede registrar producto de interés.
- Puede registrar cantidad estimada.
- Puede registrar valor estimado.
- Puede cambiar estado comercial.
- No puede crear oportunidades para clientes no asignados.

---

#### **US-018. Crear cotización**

**Como** vendedor,  
**quiero** crear cotizaciones,  
**para** avanzar negociaciones con clientes asignados, siempre que la empresa me otorgue ese permiso.

**Criterios de aceptación:**

- Puede crear cotizaciones para clientes asignados.
- Puede agregar productos y cantidades.
- Puede marcar la cotización como enviada.
- No puede aprobar descuentos especiales si no tiene permiso.
- El sistema identifica el proveedor principal del producto cotizado.
- La cotización puede convertirse en orden si es aceptada y el usuario tiene permiso.

---

#### **US-019. Solicitar abastecimiento**

**Como** vendedor,  
**quiero** crear una solicitud de abastecimiento para un cliente asignado,  
**para** pedir confirmación de disponibilidad cuando el producto lo requiera.

**Criterios de aceptación:**

- El vendedor selecciona un cliente asignado.
- El vendedor selecciona un producto.
- El sistema identifica el proveedor principal del producto.
- El vendedor puede indicar cantidad requerida y fecha requerida.
- El vendedor no ve costos ni márgenes.
- El empresario / socio puede revisar y continuar la solicitud.
- El vendedor puede ver el estado limitado de la solicitud.

---

#### **US-020. Ver estado de orden**

**Como** vendedor,  
**quiero** ver el estado de las órdenes de mis clientes,  
**para** responder consultas comerciales sin acceder a información financiera sensible.

**Criterios de aceptación:**

- Puede ver si la orden está creada, aprobada, en abastecimiento, enviada, recibida, facturada o pagada.
- Puede ver fecha estimada de disponibilidad si aplica.
- Puede ver fecha estimada de entrega si aplica.
- No puede modificar pagos.
- No puede ver costos ni márgenes.
- No puede modificar órdenes al proveedor.
- No puede cerrar órdenes.

---

#### **US-021. Crear tareas de seguimiento**

**Como** vendedor,  
**quiero** crear tareas de seguimiento,  
**para** recordar próximas llamadas, mensajes, reuniones o acciones comerciales.

**Criterios de aceptación:**

- Puede crear tareas asociadas a clientes asignados.
- Puede definir fecha de vencimiento.
- Puede marcar tareas como completadas.
- Puede ver tareas pendientes en su dashboard.
- Las tareas vencidas deben mostrarse como alertas o pendientes.

---

### 5.4. Historias de usuario transversales

#### **US-022. Adjuntar documentos**

**Como** usuario autorizado,  
**quiero** adjuntar documentos a clientes, proveedores, cotizaciones, órdenes o pagos,  
**para** centralizar la documentación de la operación.

**Criterios de aceptación:**

- El usuario puede subir documentos según sus permisos.
- Los documentos se guardan en Supabase Storage.
- Los documentos quedan asociados a una entidad.
- Los permisos de visualización respetan la entidad asociada.
- El sistema registra quién subió el documento y cuándo.

---

#### **US-023. Registrar historial de cambios**

**Como** administrador o empresario / socio,  
**quiero** que el sistema registre cambios críticos,  
**para** auditar acciones importantes dentro del sistema.

**Criterios de aceptación:**

- El sistema registra usuario, fecha, entidad y acción.
- El sistema registra valor anterior y valor nuevo cuando aplica.
- Se auditan cambios en clientes, usuarios, productos, órdenes, pagos y proveedores.
- El historial no puede ser editado por usuarios comunes.
- El historial puede consultarse desde la entidad correspondiente.

---

#### **US-024. Validar orden con productos de diferentes proveedores**

**Como** empresario / socio,  
**quiero** que el sistema me alerte cuando una orden tenga productos de diferentes proveedores,  
**para** decidir si conviene dividir la orden y facilitar el seguimiento operativo.

**Criterios de aceptación:**

- El sistema identifica el proveedor principal de cada producto.
- Si todos los productos tienen el mismo proveedor, la orden continúa normalmente.
- Si existen productos de diferentes proveedores, el sistema muestra una alerta.
- La alerta recomienda dividir la orden por proveedor.
- La alerta no bloquea la operación.
- El usuario autorizado puede continuar si lo considera necesario.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

**Ticket 1**

### Backend: Implementar control de permisos por rol y cliente asignado

#### Tipo

Backend.

#### Objetivo

Implementar la lógica de autorización para que los usuarios accedan únicamente a la información permitida según su rol y asignación de cliente.

#### Alcance

- Crear función `getCurrentUser`.
- Crear función `canAccessClient`.
- Crear función `requireRole`.
- Crear función `requireClientAccess`.
- Validar permisos en Server Actions y API Routes.
- Impedir acceso directo por URL a clientes no asignados.

#### Reglas

- Administrador puede acceder a todo.
- Empresario / Socio puede acceder a todo.
- Vendedor solo puede acceder a clientes asignados.
- Vendedor no puede ver costos ni márgenes.
- Vendedor no puede modificar pagos.

#### Criterios de aceptación

- Un vendedor no puede listar clientes no asignados.
- Un vendedor no puede abrir detalle de cliente no asignado.
- Un empresario / socio puede ver todos los clientes.
- Un administrador puede ver todos los clientes.
- Las acciones protegidas devuelven error si el usuario no tiene permiso.
- Los tests de autorización pasan correctamente.

---

**Ticket 2**

### Frontend: Construir ficha del cliente con pestañas principales

#### Tipo

Frontend.

#### Objetivo

Crear la pantalla de detalle del cliente con pestañas para centralizar toda la información comercial y operativa.

#### Alcance

Crear la vista `/clients/[id]` con las siguientes pestañas:

- Resumen.
- Contactos.
- Actividades.
- Oportunidades.
- Cotizaciones.
- Órdenes.
- Abastecimiento.
- Pagos.
- Documentos.
- Miembros asignados.
- Historial.

#### Componentes sugeridos

- `ClientHeader`.
- `ClientTabs`.
- `ClientSummary`.
- `ContactsTable`.
- `ActivitiesTimeline`.
- `OpportunitiesTable`.
- `QuotesTable`.
- `OrdersTable`.
- `ProcurementTable`.
- `PaymentsTable`.
- `DocumentsList`.
- `ClientMembersTable`.
- `AuditLogTimeline`.

#### Criterios de aceptación

- La ficha carga datos del cliente.
- El usuario solo puede abrir clientes permitidos.
- Las pestañas muestran información según permisos.
- El vendedor no ve costos ni márgenes.
- El vendedor no puede editar pagos.
- El diseño es responsive.
- Los estados principales se muestran visualmente.

---

**Ticket 3**

### Base de datos: Crear esquema inicial con clientes, usuarios, proveedores, productos y órdenes

#### Tipo

Base de datos.

#### Objetivo

Crear el esquema inicial en Prisma y PostgreSQL para soportar el MVP.

#### Alcance

Crear modelos principales:

- User.
- Client.
- ClientMember.
- ClientContact.
- Activity.
- Opportunity.
- Supplier.
- SupplierContact.
- Product.
- Quote.
- QuoteItem.
- CustomerOrder.
- CustomerOrderItem.
- ProcurementRequest.
- SupplierOrder.
- SupplierOrderItem.
- Shipment.
- Invoice.
- Payment.
- Document.
- AuditLog.

#### Restricciones

- `users.email` debe ser único.
- `products.sku` debe ser único.
- `products.supplier_id` debe ser obligatorio para productos activos.
- `customer_orders.order_number` debe ser único.
- `supplier_orders.supplier_order_number` debe ser único.
- `invoices.invoice_number` debe ser único.
- Las entidades principales deben tener `created_at` y `updated_at`.

#### Criterios de aceptación

- El comando `npx prisma migrate dev` crea las tablas correctamente.
- El comando `npx prisma generate` genera el cliente Prisma.
- Las relaciones principales se crean correctamente.
- Se pueden insertar datos semilla.
- Los modelos permiten representar el flujo completo del MVP.

---

## 7. Pull Requests

> Actualmente no existen Pull Requests reales porque el desarrollo todavía no ha sido ejecutado.

No se documentan Pull Requests inventadas.

Cuando el desarrollo inicie, esta sección deberá completarse con las Pull Requests reales generadas durante la implementación del proyecto.


