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

Sergio Valdueza Lozano

### **0.2. Nombre del proyecto:**

ADRESLES

### **0.3. Descripción breve del proyecto:**

Adresles es una plataforma SaaS B2B2C que revoluciona la experiencia de checkout en tiendas online eliminando la fricción más común: la introducción manual de la dirección de entrega. El comprador completa su pedido indicando únicamente nombre y número de teléfono. Un agente conversacional basado en IA (GPT-4) contacta al usuario para obtener la dirección mediante conversación natural, actualizándola automáticamente en el sistema del eCommerce.

**Propuesta de valor central**: "Compra solo con nombre + teléfono, nosotros obtenemos tu dirección conversando contigo"

### **0.4. URL del proyecto:**

https://github.com/SValduezaL/AI4Devs-finalproject/tree/finalproject-SVL

> Repositorio público en GitHub

### 0.5. URL o archivo comprimido del repositorio

https://github.com/SValduezaL/AI4Devs-finalproject/tree/finalproject-SVL

> Repositorio público accesible directamente desde GitHub

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

**Propósito**: Eliminar la fricción del checkout en eCommerce reduciendo drásticamente el abandono de carrito causado por formularios largos y tediosos.

**Qué soluciona**:

- **Para el Comprador**: Elimina la tarea de introducir manualmente 12+ campos de dirección en dispositivos móviles o desktop
- **Para el eCommerce**: Reduce el abandono de carrito en el checkout, aumenta la tasa de conversión y mejora significativamente la experiencia de usuario
- **Para tiendas con e-commerce**: Ofrece experiencia omnicanal mejorada y fidelización de clientes

**Valor diferencial**:

1. **Checkout ultra-rápido**: Solo nombre + teléfono (2 campos vs 12 tradicionales)
2. **Conversación natural con IA**: GPT-4 obtiene la dirección mediante diálogo fluido adaptado al usuario
3. **Validación inteligente**: Integración con Google Maps API + detección proactiva de datos faltantes (escalera, bloque, piso, puerta)
4. **Libreta de direcciones centralizada**: El usuario guarda direcciones reutilizables en cualquier eCommerce integrado con Adresles
5. **Funcionalidad de Regalo**: Permite comprar para terceros sin conocer su dirección
6. **Efecto red**: Cuantos más eCommerce usan Adresles, más usuarios tienen dirección pre-guardada
7. **Global desde el inicio**: Multi-idioma y multi-moneda

**Modelo de monetización**: Fee variable por transacción (2.5%-5% inversamente proporcional al importe), con 1 mes de prueba gratuita.

> 📖 **Documentación detallada**: [Adresles_Business.md - Sección 1](./Adresles_Business.md#fase-1-investigación-y-análisis)

### **1.2. Características y funcionalidades principales:**

#### **Para el Comprador (B2C)**

| Función                       | Descripción                                                  | Estado                            |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------- |
| **Checkout Adresles**         | Completar compra solo con nombre y teléfono (sin dirección)  | ✅ Diseñado (MVP Mock)            |
| **Conversación IA**           | Indicar dirección por chat natural en App Adresles con GPT-4 | ✅ Diseñado (Implementación real) |
| **Libreta de Direcciones**    | Gestionar direcciones favoritas reutilizables                | ✅ Diseñado                       |
| **Modo Regalo**               | Enviar pedido a otra persona sin conocer su dirección        | ✅ Diseñado (MVP Mock)            |
| **Registro Adresles**         | Crear cuenta para persistir preferencias y direcciones       | ✅ Diseñado                       |
| **Detección de idioma**       | Conversación automática en el idioma del usuario             | ✅ Diseñado (simulado en MVP)     |
| **Validación de direcciones** | Google Maps API normaliza y detecta datos faltantes          | ✅ Diseñado (Implementación real) |

#### **Para el eCommerce (B2B)**

| Función                   | Descripción                                    | Estado                                      |
| ------------------------- | ---------------------------------------------- | ------------------------------------------- |
| **Plugin de Checkout**    | Integración en el proceso de pago              | 🔄 Pendiente (MVP usa entrada JSON mock)    |
| **Webhook de Compras**    | Recepción automática de pedidos en tiempo real | ✅ Implementado (POST /api/mock/orders)     |
| **Dashboard de Gestión**  | Monitorización de pedidos y conversaciones     | ✅ Implementado (CU-02 MVP)                 |
| **API de Sincronización** | Actualización de direcciones en el sistema     | 🔄 Mockeado (log estructurado/notificación) |
| **Prueba gratuita**       | 1 mes sin coste para evaluar el servicio       | ✅ Definido en modelo de negocio            |

#### **Para el Sistema (Interno)**

| Función                           | Descripción                                           | Estado                              |
| --------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| **Orquestador de Conversaciones** | Gestión del flujo conversacional con GPT-4            | ✅ Implementado (Backend NestJS)    |
| **Motor de Journeys**             | Selección automática del flujo según contexto usuario | ✅ Implementado (GET_ADDRESS, INFORMATION, ResponseProcessor) |
| **Sistema de Reminders**          | Recordatorios tras 15 min sin respuesta               | ⏳ Pendiente post-MVP               |
| **Validador de Direcciones**      | Google Maps API + detección datos faltantes           | ✅ Diseñado (Implementación real)   |
| **Escalado a Soporte**            | Envío de incidencias por email cuando IA no resuelve  | ✅ Diseñado                         |
| **Multi-tenant con RLS**          | Aislamiento de datos entre eCommerce                  | ✅ Diseñado (Supabase RLS policies) |

#### **Roadmap de Integraciones**

1. **Fase 0 (MVP actual)**: Integración Mock - Entrada manual JSON
2. **Fase 1**: Plugin WooCommerce real
3. **Fase 2**: PrestaShop
4. **Fase 3**: Magento
5. **Fase 4**: Shopify

> 📖 **Casos de uso detallados**: [Adresles_Business.md - Fase 2](./Adresles_Business.md#fase-2-casos-de-uso)

### **1.3. Diseño y experiencia de usuario:**

#### **User Journeys Principales**

**Journey 1: Compra Tradicional (Usuario NO usa modo Adresles)**

- Usuario completa checkout tradicional con dirección
- Adresles le invita a registrarse para futuras compras más rápidas

**Journey 2: Compra Adresles - Usuario Registrado en Adresles**

- **Con dirección favorita**: Sistema propone dirección guardada, opción de cambiar
- **Sin dirección favorita**: IA solicita nueva dirección

**Journey 3: Compra Adresles - Usuario Registrado solo en eCommerce**

- **Con dirección en eCommerce**: Sistema propone dirección + invitación registro Adresles
- **Sin dirección en eCommerce**: IA solicita dirección + invitación registro Adresles

**Journey 4: Compra Adresles - Usuario Nuevo**

- Usuario no registrado en ningún sistema
- IA solicita dirección + invitación registro Adresles

**Journey 5: Modo Regalo 🎁**

- **Comprador**: Indica nombre + teléfono del destinatario
- **Sistema**: Inicia dos conversaciones paralelas:
    - Con **destinatario** para obtener/confirmar dirección (si registrado, propone su favorita)
    - Con **comprador** para informar del proceso (sin revelar dirección por protección de datos)

#### **Flujo Principal Simplificado**

```
1. Usuario Compra → 2. Checkout Rápido (nombre + teléfono)
                      ↓
3. Adresles Procesa → 4. App Adresles - Conversación IA
                      ↓
5. Dirección Validada (Google Maps) → 6. eCommerce Actualizado
```

#### **Experiencia de Conversación**

La conversación con el agente IA (GPT-4) incluye:

- **Saludo personalizado** en el idioma del usuario
- **Confirmación de compra** (tienda, productos)
- **Propuesta de dirección** si existe en libreta o eCommerce
- **Solicitud conversacional** de dirección si no existe
- **Validación inteligente** con Google Maps
- **Detección proactiva** de datos faltantes en edificios (piso, puerta, escalera, bloque)
- **Confirmación final** antes de sincronizar con eCommerce
- **Invitación opcional** a registrarse en Adresles

> 📖 **Journeys detallados**: [Adresles_Business.md - Sección 1.6](./Adresles_Business.md#16-user-journeys-detallados)  
> 📖 **Diagramas de secuencia**: [Adresles_Business.md - Sección 4.8](./Adresles_Business.md#48-diagramas-de-secuencia)

> ⚠️ **Nota**: El proyecto se encuentra en fase de diseño y documentación. Las capturas de pantalla y videotutoriales se generarán durante la fase de implementación.

### **1.4. Instrucciones de instalación:**

#### **Arquitectura Técnica**

**Stack Tecnológico**:

- **Backend**: Node.js + NestJS + TypeScript
- **Frontend Chat**: React + Vite + TailwindCSS + Shadcn/ui
- **Frontend Admin**: Next.js 16 + Tailwind v4 + Shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL) + AWS DynamoDB
- **IA Conversacional**: OpenAI GPT-4
- **Validación de Direcciones**: Google Maps API (Geocoding)
- **Colas**: Redis + BullMQ
- **Deployment**: Docker Compose + Traefik (reverse proxy con SSL automático)
- **CI/CD**: GitHub Actions
- **Hosting**: Servidor dedicado Konsole H (backend) + Vercel (dashboard admin)

#### **Estructura del Proyecto (Diseñada)**

```
adresles/
├── apps/
│   ├── api/                    # Backend NestJS
│   ├── worker/                 # Worker BullMQ para conversaciones
│   ├── web-chat/              # Frontend Chat (React + Vite)
│   └── web-admin/             # Frontend Admin (Next.js)
├── packages/
│   ├── shared-types/          # TypeScript types compartidos
│   └── api-client/            # Cliente API generado
├── infrastructure/
│   ├── docker/                # Docker Compose configs
│   └── scripts/               # Scripts de deployment
└── openspec/                  # Especificaciones SDD
```

#### **Servicios Externos Requeridos**

| Servicio         | Propósito                                   | Configuración              |
| ---------------- | ------------------------------------------- | -------------------------- |
| **Supabase**     | PostgreSQL + Auth + RLS                     | Cuenta gratuita disponible |
| **AWS DynamoDB** | Mensajes conversacionales (alta volumetría) | Modo pay-per-request       |
| **OpenAI**       | API GPT-4 para conversaciones               | API Key requerida          |
| **Google Maps**  | Geocoding y validación de direcciones       | API Key requerida          |
| **Vercel**       | Hosting Dashboard Admin (opcional)          | Free tier disponible       |

#### **Variables de Entorno (`.env`)**

**API (`apps/api/.env`)**:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/adresles
REDIS_URL=redis://localhost:6379
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_MAPS_API_KEY=xxx
```

**Worker (`apps/worker/.env`)**:

```bash
REDIS_URL=redis://localhost:6379
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_MAPS_API_KEY=xxx
```

**Web Admin (`apps/web-admin/.env.local`)**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### **Instalación**

```bash
# 1. Clonar repositorio
git clone https://github.com/SValduezaL/AI4Devs-finalproject.git
cd AI4Devs-finalproject

# 2. Instalar dependencias (pnpm requerido)
pnpm install

# 3. Configurar variables de entorno
# Copiar y editar los .env de cada app (ver sección anterior)

# 4. Iniciar servicios con Docker Compose
docker-compose up -d redis

# 5. Ejecutar migraciones de base de datos (Supabase/PostgreSQL)
cd apps/api && npx prisma migrate dev

# 6. Cargar datos de prueba (ecommerce + store mock)
cd apps/api && npx prisma db seed

# 7. Iniciar aplicaciones en modo desarrollo
# API Backend
pnpm --filter api dev          # http://localhost:3000

# Worker BullMQ
pnpm --filter worker dev       # (background, sin UI)

# Dashboard Admin
pnpm --filter web-admin dev    # http://localhost:3001

# Ejecutar tests (desde apps/api)
cd apps/api && pnpm test
cd apps/api && pnpm test:cov
```

> 📖 **Arquitectura completa**: [Adresles_Business.md - Fase 4](./Adresles_Business.md#fase-4-diseño-de-alto-nivel)  
> 📖 **Stack detallado**: [memory-bank/tech-stack.md](./memory-bank/project-context/tech-stack.md)  
> 📖 **Docker Compose**: [Adresles_Business.md - Sección 4.7](./Adresles_Business.md#47-docker-compose---configuración)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

#### **Patrón Arquitectónico: Monolito Modular**

Se ha elegido una arquitectura de **Monolito Modular** con separación clara de responsabilidades, siguiendo principios de Domain-Driven Design (DDD).

**Justificación**:

- ✅ **Velocidad de desarrollo**: Un solo repositorio, despliegue simplificado
- ✅ **Coste optimizado**: Aprovecha servidor dedicado existente + servicios managed
- ✅ **Escalabilidad futura**: Módulos con interfaces claras, fácil extracción a microservicios
- ✅ **Apropiado para MVP**: Menor complejidad operacional, ideal para validar producto

**Trade-offs**:

- ⚠️ **Escalado horizontal**: Requiere escalar toda la aplicación (no componentes individuales)
- ⚠️ **Acoplamiento potencial**: Requiere disciplina para mantener módulos independientes
- ✅ **Mitigación**: Bounded contexts claros, interfaces bien definidas, repository pattern

#### **Diagrama C4 - Nivel 1: Contexto del Sistema**

```mermaid
C4Context
    title Diagrama de Contexto - Adresles

    Person(buyer, "Comprador", "Compra en eCommerce")
    Person(recipient, "Regalado", "Recibe un regalo")
    Person(admin, "Admin eCommerce", "Gestiona tienda")

    System(adresles, "Adresles", "Checkout sin dirección\nIA conversacional")

    System_Ext(ecommerce, "eCommerce", "Woo / Presta / Shopify")
    System_Ext(openai, "OpenAI API", "IA conversacional")
    System_Ext(gmaps, "Google Maps API", "Validación direcciones")
    System_Ext(supabase, "Supabase", "PostgreSQL + Auth")
    System_Ext(dynamodb, "AWS DynamoDB", "Conversaciones")

    Rel(buyer, adresles, "Proporciona dirección", "HTTPS / WebSocket")
    Rel(recipient, adresles, "Dirección regalo", "HTTPS / WebSocket")
    Rel(admin, adresles, "Gestión y configuración", "HTTPS")

    Rel(ecommerce, adresles, "Webhook pedidos", "HTTPS")
    Rel(adresles, ecommerce, "Actualiza direcciones", "REST API")
    Rel(adresles, openai, "Genera respuestas", "HTTPS")
    Rel(adresles, gmaps, "Valida direcciones", "HTTPS")
    Rel(adresles, supabase, "Datos relacionales", "HTTPS")
    Rel(adresles, dynamodb, "Persistencia chat", "HTTPS")
```

#### **Diagrama C4 - Nivel 2: Contenedores**

```mermaid
C4Container
    title Diagrama de Contenedores - Adresles

    Person(buyer, "Comprador/Regalado", "Usuario final")
    Person(admin, "Admin eCommerce", "Gestiona tienda")

    System_Boundary(adresles, "Adresles Platform") {
        Container(spa_chat, "Chat App", "React + Vite", "Aplicación de conversación para usuarios")
        Container(spa_admin, "Dashboard Admin", "Next.js", "Panel de gestión para eCommerce")
        Container(api, "API Backend", "Node.js + NestJS", "API REST + WebSocket para toda la lógica de negocio")
        Container(worker, "Conversation Worker", "Node.js + BullMQ", "Procesa conversaciones con OpenAI de forma asíncrona")
        Container(redis, "Redis", "Redis 7", "Cache + Cola de mensajes")
    }

    System_Ext(ecommerce, "eCommerce Platform", "WooCommerce, etc.")
    System_Ext(supabase, "Supabase", "PostgreSQL + Auth")
    System_Ext(dynamodb, "DynamoDB", "Conversaciones")
    System_Ext(openai, "OpenAI", "GPT-4")
    System_Ext(gmaps, "Google Maps", "Geocoding")

    Rel(buyer, spa_chat, "Usa", "HTTPS")
    Rel(admin, spa_admin, "Usa", "HTTPS")
    Rel(spa_chat, api, "API calls + WebSocket", "HTTPS/WSS")
    Rel(spa_admin, api, "API calls", "HTTPS")

    Rel(api, redis, "Cache + Publish jobs", "TCP")
    Rel(worker, redis, "Subscribe jobs", "TCP")
    Rel(api, supabase, "CRUD datos", "HTTPS")
    Rel(api, dynamodb, "CRUD conversaciones", "HTTPS")
    Rel(worker, dynamodb, "Guarda mensajes", "HTTPS")
    Rel(worker, openai, "Genera respuestas", "HTTPS")
    Rel(api, gmaps, "Valida direcciones", "HTTPS")

    Rel(ecommerce, api, "Webhooks", "HTTPS")
    Rel(api, ecommerce, "Sync direcciones", "HTTPS")
```

**Principios Arquitectónicos Aplicados**:

| Principio                  | Aplicación en Adresles                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Separación de concerns** | Módulos independientes por dominio (Conversations, Orders, Addresses, Users, Stores) |
| **Dependency Inversion**   | Repositorios abstraídos, servicios inyectables con NestJS DI                         |
| **Event-Driven**           | Colas BullMQ para procesamiento asíncrono de conversaciones                          |
| **API-First**              | Contratos OpenAPI definidos antes de implementación                                  |
| **Infrastructure as Code** | Docker Compose para reproducibilidad                                                 |

> 📖 **Diagramas C4 completos**: [Adresles_Business.md - Secciones 4.2-4.4](./Adresles_Business.md#42-diagrama-c4---nivel-1-contexto-del-sistema)  
> 📖 **ADR Arquitectura**: [memory-bank/architecture/001-monolith-modular.md](./memory-bank/architecture/001-monolith-modular.md)

### **2.2. Descripción de componentes principales:**

#### **Backend - API (NestJS)**

**Tecnología**: Node.js + NestJS + TypeScript  
**Puerto**: 3000  
**Responsabilidades**:

- Endpoints REST para gestión de pedidos, direcciones, usuarios
- WebSocket Gateway para comunicación en tiempo real con usuarios
- Orquestación de conversaciones (Journey Engine)
- Integración con Google Maps API para validación de direcciones
- Gestión de webhooks desde eCommerce (mockeados en MVP)
- Autenticación y autorización con Supabase Auth

**Módulos principales**:

- `mock/`: Endpoint `POST /api/mock/orders` — orquestación por modo (adresles / tradicional)
- `orders/`: Gestión del ciclo de vida de pedidos y cálculo de fee
- `users/`: Búsqueda o creación de usuario por teléfono E.164
- `conversations/`: Creación de conversación y encola job BullMQ
- `stores/`: Búsqueda o creación de tienda por URL
- `ecommerce-sync/`: Simulación de sincronización con eCommerce (mock)
- `admin/`: Endpoints de visualización para el dashboard admin (`GET /admin/orders`, `GET /admin/users`, `GET /admin/conversations/:id/messages`)
- `queue/`: Configuración de BullMQ (cola `process-conversation` y `process-response`)
- `prisma/`: Módulo de acceso a base de datos (Prisma ORM + Supabase)

#### **Worker - Conversation Processor (BullMQ)**

**Tecnología**: Node.js + BullMQ + TypeScript  
**Responsabilidades**:

- Procesamiento asíncrono de jobs de conversación
- Llamadas a OpenAI GPT-4 para generar respuestas
- Construcción de prompts según journey y contexto
- Parseo y validación de respuestas de IA
- Programación de reminders (pendiente post-MVP)

**Procesadores y servicios principales**:

- `processors/conversation.processor.ts`: Consume cola `process-conversation`; gestiona journeys `GET_ADDRESS` (llama a OpenAI, guarda en DynamoDB) e `INFORMATION` (confirmación tradicional)
- `processors/response.processor.ts`: Máquina de estados para cola `process-response`; valida dirección con Google Maps, detecta edificios (solicita datos adicionales), confirma y sincroniza
- `services/address.service.ts`: Integración con Google Maps API
- `dynamodb/dynamodb.service.ts`: Escritura y lectura de mensajes en DynamoDB

#### **Frontend - Chat App (React + Vite)**

**Tecnología**: React + Vite + TailwindCSS + Shadcn/ui  
**Puerto**: 5173 (dev)  
**Responsabilidades**:

- Interfaz de conversación para usuarios (comprador/destinatario)
- Conexión WebSocket en tiempo real con backend
- Gestión de libreta de direcciones
- Visualización de pedidos activos

**Stack**:

- **State Management**: Zustand
- **API Client**: TanStack Query (React Query)
- **WebSocket**: Socket.io client
- **UI Components**: Shadcn/ui (sobre Radix UI)

#### **Frontend - Dashboard Admin (Next.js)**

**Tecnología**: Next.js 16.1.6 + React 19 + Tailwind v4 + Shadcn/ui  
**Puerto**: 3001 (dev)  
**Responsabilidades**:

- Panel de visualización para administradores de eCommerce
- Tabla de pedidos con estados, badges y enlace a chat
- Tabla de usuarios con registro relativo y tooltips accesibles
- Visor de chat con burbujas por rol, metadatos de conversación y banner TTL

**Stack**:

- **Rendering**: Server Components + Client Components (mínimo client side)
- **Estilos**: Tailwind v4 CSS-first (`@theme` en `globals.css`); tokens de marca `brand-black`, `brand-lime`, `brand-teal`
- **UI Components**: Shadcn/ui (Radix UI)
- **Accesibilidad**: WCAG 2.1 AA (`aria-label`, `scope="col"`, `role="log"`, tooltips, `focus-visible`)
- **Deployment**: Vercel (free tier)

#### **Base de Datos - Arquitectura Híbrida**

**Supabase (PostgreSQL)**  
**Propósito**: Datos relacionales con integridad referencial  
**Tablas principales**:

- `ecommerce`: Razón social de eCommerce
- `store`: Tiendas (identificadas por URL única)
- `user`: Usuarios (identificador único: teléfono)
- `address`: Libreta de direcciones
- `order`: Pedidos
- `order_address`: Snapshot inmutable de dirección en pedido
- `gift_recipient`: Datos de destinatario en modo regalo

**Ventajas**:

- Auth integrado (JWT)
- Row Level Security (RLS) para multi-tenant
- Realtime subscriptions
- PostgreSQL estándar (SQL completo)

**AWS DynamoDB**  
**Propósito**: Mensajes conversacionales (alta volumetría, TTL automático)  
**Tablas**:

- `Conversations`: Metadata de conversaciones (PK: conversation_id)
- `Messages`: Mensajes individuales (PK: conversation_id, SK: ulid)
- `AuditLog`: Logs de auditoría con TTL

**Ventajas**:

- TTL nativo (90 días para mensajes, configurable)
- Alto throughput para escrituras
- Pay-per-request (coste optimizado)

> 📖 **ADR Base de Datos**: [memory-bank/architecture/002-supabase-dynamodb.md](./memory-bank/architecture/002-supabase-dynamodb.md)

#### **Servicios Externos**

**OpenAI GPT-4**  
**Propósito**: Motor de conversación inteligente  
**Uso**: Generación de respuestas naturales, comprensión de direcciones, detección de intenciones

**Google Maps API (Geocoding)**  
**Propósito**: Validación y normalización de direcciones  
**Uso**: Validación de direcciones, normalización de formato, obtención de coordenadas

**Redis**  
**Propósito**: Cache + Cola de mensajes  
**Uso**: BullMQ jobs, cache de sesiones, PubSub para WebSocket

> 📖 **Stack completo**: [memory-bank/tech-stack.md](./memory-bank/project-context/tech-stack.md)

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

#### **Estructura del Proyecto (Monorepo con pnpm + Turborepo)**

```
adresles/
├── apps/                              # Aplicaciones
│   ├── api/                           # Backend NestJS
│   │   ├── src/
│   │   │   ├── admin/                 # AdminModule — dashboard endpoints
│   │   │   ├── conversations/         # ConversationsService — crea y encola
│   │   │   ├── ecommerce-sync/        # EcommerceSyncService — sync mock
│   │   │   ├── mock/                  # 🎯 MockOrdersController POST /api/mock/orders
│   │   │   ├── orders/                # OrdersService — ciclo de vida + fee
│   │   │   ├── prisma/                # PrismaModule (Prisma ORM + Supabase)
│   │   │   ├── queue/                 # BullMQ — colas process-conversation / process-response
│   │   │   ├── shared/                # fee.utils, helpers
│   │   │   ├── stores/                # StoresService — findOrCreate por URL
│   │   │   ├── users/                 # UsersService — findOrCreate por teléfono E.164
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── migrations/            # 3 migraciones versionadas (Supabase)
│   │   │   ├── schema.prisma          # Modelos: Ecommerce, Store, User, Order, etc.
│   │   │   └── seed.ts                # Seeds de ecommerce y store mock
│   │   └── package.json
│   │
│   ├── worker/                        # Worker BullMQ para conversaciones
│   │   ├── src/
│   │   │   ├── processors/
│   │   │   │   └── conversation.processor.ts  # Journeys GET_ADDRESS e INFORMATION
│   │   │   ├── services/
│   │   │   │   └── address.service.ts          # Google Maps API
│   │   │   ├── dynamodb/
│   │   │   │   └── dynamodb.service.ts         # Tabla adresles-messages (TTL 90d)
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── web-chat/                      # Frontend Chat (React + Vite) — pendiente implementación
│   │   └── package.json
│   │
│   └── web-admin/                     # Frontend Admin (Next.js 16)
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css        # Tokens de marca con @theme (Tailwind v4)
│       │   │   ├── layout.tsx         # Sidebar + TooltipProvider global
│       │   │   ├── page.tsx           # Redirect a /orders
│       │   │   ├── orders/            # Tabla de pedidos + badges
│       │   │   ├── users/             # Tabla de usuarios + fecha relativa
│       │   │   └── conversations/[conversationId]/  # Visor de chat con burbujas
│       │   ├── components/
│       │   │   ├── ui/                # Shadcn/ui (table, badge, button, skeleton, tooltip)
│       │   │   ├── layout/            # Sidebar, Providers
│       │   │   ├── orders/            # OrdersTable, OrderStatusBadge, OrderModeBadge
│       │   │   ├── users/             # UsersTable, UserRegisteredBadge, RelativeDateCell
│       │   │   └── chat/              # ChatView, ChatBubble, ChatExpiryBanner, ConversationBadges
│       │   ├── lib/
│       │   │   ├── api.ts             # Funciones fetch hacia API NestJS
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── api.ts             # Tipos TypeScript de respuesta API
│       ├── components.json
│       ├── next.config.ts
│       └── package.json
│
├── memory-bank/                       # Documentación persistente
│   ├── project-context/               # Contexto del proyecto
│   ├── architecture/                  # ADRs
│   ├── sessions/                      # Notas por sesión de desarrollo
│   └── references/                    # Referencias rápidas
│
├── openspec/                          # Especificaciones SDD
│   ├── specs/                         # Estándares del proyecto
│   └── changes/                       # Cambios específicos por feature
│
├── docs/
│   ├── mock-orders-ui.html            # UI de prueba para POST /api/mock/orders
│   └── MOCK-ORDERS-README.md          # Guía de uso del endpoint mock
│
├── package.json                       # Monorepo root
├── pnpm-workspace.yaml               # Configuración workspaces
├── turbo.json                         # Turborepo config
├── Adresles_Business.md              # Documento de diseño completo
└── README.md                          # Este archivo
```

#### **Patrón de Organización: Domain-Driven Design (DDD)**

El backend sigue principios de DDD con **Bounded Contexts** claros:

| Dominio           | Responsabilidad                                        | Módulo                   |
| ----------------- | ------------------------------------------------------ | ------------------------ |
| **Conversations** | 🎯 Núcleo del sistema - Orquestación conversaciones IA | `modules/conversations/` |
| **Orders**        | Gestión del ciclo de vida de pedidos                   | `modules/orders/`        |
| **Addresses**     | Validación, normalización y gestión de direcciones     | `modules/addresses/`     |
| **Users**         | Identidad, autenticación y perfiles                    | `modules/users/`         |
| **Stores**        | Configuración de tiendas y eCommerce                   | `modules/stores/`        |

**Ventajas de esta estructura**:

- ✅ Separación clara de responsabilidades
- ✅ Fácil localización de código por funcionalidad
- ✅ Extracción futura a microservicios sin refactoring mayor
- ✅ Onboarding rápido de nuevos desarrolladores

> 📖 **Estructura completa**: [Adresles_Business.md - Sección 4.5](./Adresles_Business.md#45-estructura-del-proyecto)  
> 📖 **Backend Standards**: [openspec/specs/backend-standards.mdc](./openspec/specs/backend-standards.mdc)

### **2.4. Infraestructura y despliegue**

#### **Diagrama de Infraestructura**

```mermaid
flowchart TB
    subgraph "Internet"
        U[Usuarios]
        WH[Webhooks eCommerce]
    end

    subgraph "CDN (Vercel)"
        FE_ADMIN[Dashboard Admin<br/>Next.js SSR]
    end

    subgraph "Servidor Dedicado (Konsole H)"
        subgraph "Docker Compose"
            TR[Traefik<br/>Reverse Proxy<br/>SSL Let's Encrypt]

            subgraph "Aplicaciones"
                FE_CHAT[Chat App<br/>React SPA<br/>Nginx]
                API[API Backend<br/>NestJS<br/>Port 3000]
                WK[Worker<br/>BullMQ<br/>Port 3001]
            end

            RD[(Redis<br/>Cache + Queue<br/>Port 6379)]
        end
    end

    subgraph "Servicios Managed"
        SB[(Supabase<br/>PostgreSQL)]
        DY[(AWS DynamoDB)]
        OAI[OpenAI API]
        GM[Google Maps API]
    end

    U --> TR
    WH --> TR
    U --> FE_ADMIN

    TR --> FE_CHAT
    TR --> API
    FE_ADMIN --> API

    API --> RD
    WK --> RD

    API --> SB
    API --> DY
    API --> GM
    WK --> DY
    WK --> OAI
```

#### **Componentes de Infraestructura**

**Traefik (Reverse Proxy)**

- **Función**: Enrutamiento de tráfico, SSL automático con Let's Encrypt
- **Puertos**: 80 (HTTP), 443 (HTTPS)
- **Ventajas**: Integración nativa con Docker, SSL automático, dashboards

**Servidor Dedicado (Konsole H)**

- **Especificaciones**: (Por definir en fase de implementación)
- **Sistema Operativo**: Linux (Ubuntu/Debian)
- **Servicios alojados**: API Backend, Worker, Chat App, Redis
- **Ventaja**: Coste fijo predecible, control total

**Vercel (Frontend Admin)**

- **Plan**: Free tier (escalable a Pro si necesario)
- **Características**: CDN global, deploy automático desde Git, SSL incluido
- **Ventaja**: SSR optimizado para Next.js, zero-config

#### **Proceso de Despliegue (CI/CD con GitHub Actions)**

**Pipeline Automatizado**:

1. **Trigger**: Push a rama `main` o ejecución manual
2. **Job 1 - Tests**: Ejecuta linter + tests unitarios
3. **Job 2 - Build**: Construye imágenes Docker y las publica en GitHub Container Registry
4. **Job 3 - Deploy**:
    - Copia docker-compose.yml al servidor vía SSH
    - Ejecuta `docker compose pull` para descargar nuevas imágenes
    - Ejecuta `docker compose up -d` para reiniciar servicios
    - Limpia imágenes antiguas

**Comandos principales**:

```bash
# En servidor (vía GitHub Actions SSH)
cd /opt/adresles
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
```

**Secrets requeridos en GitHub**:

- `SERVER_HOST`: IP o dominio del servidor
- `SERVER_USER`: Usuario SSH (ej: `deploy`)
- `SERVER_SSH_KEY`: Clave privada SSH

> 📖 **CI/CD completo**: [Adresles_Business.md - Sección 4.9](./Adresles_Business.md#49-cicd-pipeline-github-actions)  
> 📖 **Docker Compose YAML**: [Adresles_Business.md - Sección 4.7](./Adresles_Business.md#47-docker-compose---configuración)

### **2.5. Seguridad**

#### **Capas de Seguridad**

**Capa 1: Perímetro**

- **Firewall**: UFW configurado, solo puertos 80, 443, 22 abiertos
- **SSL/TLS**: Certificados Let's Encrypt renovados automáticamente vía Traefik
- **Rate Limiting**: Traefik middleware para limitar peticiones por IP

**Capa 2: Aplicación**

- **Autenticación**: JWT tokens gestionados por Supabase Auth
- **API Keys**: Para webhooks de eCommerce (validación HMAC)
- **Validación de entrada**: DTOs con class-validator + Zod en NestJS
- **CORS**: Whitelist de dominios permitidos
- **Helmet**: Headers de seguridad HTTP

**Capa 3: Datos**

- **Row Level Security (RLS)**: Políticas de Supabase para aislamiento multi-tenant
- **Encriptación**:
    - At rest: Supabase automático
    - In transit: TLS obligatorio
- **Audit Log**: Registro de todas las operaciones críticas en DynamoDB

#### **Prácticas de Seguridad Implementadas**

| Área        | Medida               | Implementación                      |
| ----------- | -------------------- | ----------------------------------- |
| **Red**     | Firewall             | UFW: solo 80, 443, 22               |
| **Red**     | SSL/TLS              | Let's Encrypt via Traefik           |
| **Red**     | Rate limiting        | Traefik middleware                  |
| **Auth**    | JWT tokens           | Supabase Auth                       |
| **Auth**    | API Keys             | Para webhooks de eCommerce          |
| **Auth**    | Webhook signatures   | Validar HMAC de cada plataforma     |
| **API**     | Input validation     | class-validator + Zod               |
| **API**     | CORS                 | Whitelist de dominios               |
| **API**     | Helmet               | Headers de seguridad                |
| **DB**      | Row Level Security   | Supabase RLS policies               |
| **DB**      | Encriptación         | Supabase (at rest), TLS (transit)   |
| **Secrets** | Variables de entorno | .env en servidor, no en repo        |
| **Secrets** | Rotación             | API keys rotables                   |
| **Audit**   | Logging              | Todos los cambios en AuditLog       |
| **Backup**  | Base de datos        | Supabase automático + DynamoDB PITR |

#### **Ejemplo de RLS Policy (Supabase)**

```sql
-- Un eCommerce solo puede ver sus tiendas
CREATE POLICY "ecommerce_isolation" ON store
    FOR ALL
    USING (
        ecommerce_id IN (
            SELECT id FROM ecommerce
            WHERE id = auth.jwt() ->> 'ecommerce_id'
        )
    );

-- Un eCommerce solo puede ver pedidos de sus tiendas
CREATE POLICY "orders_isolation" ON "order"
    FOR ALL
    USING (
        store_id IN (
            SELECT id FROM store
            WHERE ecommerce_id = auth.jwt() ->> 'ecommerce_id'
        )
    );
```

> 📖 **Seguridad completa**: [Adresles_Business.md - Sección 4.10](./Adresles_Business.md#410-seguridad)

### **2.6. Tests**

**Framework**: Jest + Supertest (`@nestjs/testing`)

#### **Tests implementados — Backend API (apps/api)**

**CU-01 — 37 tests, 100% pasan**

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `src/shared/fee.utils.spec.ts` | Fórmula de fee (bordes e intermedios) | Lógica de cálculo |
| `src/orders/orders.service.spec.ts` | `createFromMock`, `updateStatus`, `createAddressFromConversation` | Servicio de pedidos |
| `src/users/users.service.spec.ts` | `findOrCreateByPhone` (crear/actualizar/preservar email, prefijos internacionales) | Servicio de usuarios |
| `src/mock/mock-orders.service.spec.ts` | Orquestación modos adresles y tradicional; `BadRequestException` sin dirección | Orquestación mock |
| `src/mock/mock-orders.controller.spec.ts` | HTTP `supertest`; 400 para campos inválidos, URL inválida, email inválido | Controller HTTP |

**CU-02 — Tests admin, todos pasan**

| Archivo | Tests |
|---------|-------|
| `src/admin/admin.service.spec.ts` | Paginación, filtrado `isDeleted: false`, datos relacionales, usuarios eliminados |
| `src/admin/admin.controller.spec.ts` | Integración HTTP con `supertest` para los 3 endpoints admin |

#### **Comandos de tests**

```bash
# Desde apps/api
cd apps/api && pnpm test          # Todos los tests
cd apps/api && pnpm test:cov      # Con cobertura
```

#### **Tests pendientes (post-MVP)**

- **Frontend**: Vitest + React Testing Library (componentes, hooks)
- **E2E**: Playwright (flujo completo de checkout, conversación, modo regalo)
- **Carga**: Artillery o k6 (múltiples conversaciones simultáneas)

**Cobertura objetivo**: 80% en lógica de negocio crítica (Conversations, Orders, Addresses)

> 📖 **Backend Standards incluye testing**: [openspec/specs/backend-standards.mdc](./openspec/specs/backend-standards.mdc)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

#### **Arquitectura de Base de Datos: Híbrida (Supabase + DynamoDB)**

**Decisión arquitectural**: Se utiliza una arquitectura híbrida para optimizar rendimiento y costes:

- **Supabase (PostgreSQL)**: Datos relacionales con integridad referencial
- **DynamoDB**: Mensajes conversacionales (alta volumetría, TTL automático)

#### **Modelo Entidad-Relación (Supabase - PostgreSQL)**

```mermaid
erDiagram
    ECOMMERCE ||--o{ STORE : "tiene"
    STORE ||--|| PLUGIN_CONFIG : "configura"
    STORE ||--o{ ORDER : "recibe"
    USER ||--o{ ADDRESS : "tiene"
    USER ||--o{ ORDER : "realiza"
    ORDER ||--o| ORDER_ADDRESS : "tiene"
    ORDER ||--o| GIFT_RECIPIENT : "puede tener"

    ECOMMERCE {
        uuid id PK
        string tax_id UK "Razón Social"
        string legal_name
        string commercial_name
        string email
        string phone
        string country
        jsonb billing_address
        timestamp trial_ends_at
        enum status "ACTIVE|SUSPENDED|CANCELLED"
        timestamp created_at
        timestamp updated_at
    }

    STORE {
        uuid id PK
        uuid ecommerce_id FK
        string url UK "URL única"
        string name
        enum platform "WOOCOMMERCE|PRESTASHOP|MAGENTO|SHOPIFY"
        string default_language
        string default_currency
        string timezone
        string logo_url
        enum status "ACTIVE|INACTIVE|PENDING_SETUP"
        timestamp created_at
        timestamp updated_at
    }

    PLUGIN_CONFIG {
        uuid id PK
        uuid store_id FK "UNIQUE (1-1)"
        string api_key
        string api_secret_hash
        string webhook_secret
        string webhook_url
        boolean gift_enabled
        boolean auto_register_invite
        jsonb custom_branding
        timestamp created_at
        timestamp updated_at
    }

    USER {
        uuid id PK
        string phone UK "Identificador único"
        string phone_country
        string first_name
        string last_name
        string email
        string preferred_language
        boolean is_registered
        timestamp registered_at
        timestamp last_interaction_at
        timestamp created_at
        timestamp updated_at
    }

    ADDRESS {
        uuid id PK
        uuid user_id FK
        string label "Casa, Trabajo..."
        string full_address
        string street
        string number
        string block
        string staircase
        string floor
        string door
        string additional_info
        string postal_code
        string city
        string province
        string country
        string gmaps_place_id
        decimal latitude
        decimal longitude
        boolean is_default
        boolean is_deleted
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    ORDER {
        uuid id PK
        uuid store_id FK
        uuid user_id FK
        string external_order_id
        string external_order_number
        decimal total_amount
        string currency
        decimal fee_percentage
        decimal fee_amount
        enum status "PENDING_ADDRESS|READY_TO_PROCESS|COMPLETED|FAILED|CANCELLED"
        boolean is_gift
        jsonb items_summary
        timestamp webhook_received_at
        timestamp address_confirmed_at
        timestamp synced_at
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ADDRESS {
        uuid id PK
        uuid order_id FK "UNIQUE (1-1)"
        uuid source_address_id FK "nullable"
        enum recipient_type "BUYER|GIFT_RECIPIENT"
        string recipient_name
        string recipient_phone
        string full_address
        string street
        string number
        string block
        string staircase
        string floor
        string door
        string additional_info
        string postal_code
        string city
        string province
        string country
        string gmaps_place_id
        timestamp confirmed_at
        enum confirmed_via "CONVERSATION|MANUAL|ECOMMERCE_SYNC"
    }

    GIFT_RECIPIENT {
        uuid id PK
        uuid order_id FK "UNIQUE (1-1)"
        string first_name
        string last_name
        string phone
        text note
        enum status "PENDING_CONTACT|CONTACTED|ADDRESS_RECEIVED|COMPLETED"
        timestamp created_at
        timestamp updated_at
    }
```

#### **Modelo de Conversaciones (DynamoDB)**

**Tabla: Conversations**

| Atributo            | Tipo   | Key           | Descripción                                                                      |
| ------------------- | ------ | ------------- | -------------------------------------------------------------------------------- |
| `PK`                | String | Partition Key | `CONV#{conversation_id}`                                                         |
| `SK`                | String | Sort Key      | `METADATA`                                                                       |
| `conversation_id`   | String |               | UUID de la conversación                                                          |
| `order_id`          | String | GSI1-PK       | UUID del pedido                                                                  |
| `user_phone`        | String | GSI2-PK       | Teléfono del usuario                                                             |
| `user_type`         | String |               | `BUYER` \| `RECIPIENT`                                                           |
| `conversation_type` | String |               | `INFORMATION` \| `GET_ADDRESS` \| `REGISTER` \| `GIFT_NOTIFICATION` \| `SUPPORT` |
| `status`            | String |               | `ACTIVE` \| `WAITING_RESPONSE` \| `COMPLETED` \| `ESCALATED` \| `TIMEOUT`        |
| `language`          | String |               | Código de idioma detectado                                                       |
| `journey_type`      | String |               | Tipo de journey activo                                                           |
| `context`           | Map    |               | Contexto acumulado para el LLM                                                   |
| `created_at`        | String |               | ISO timestamp                                                                    |
| `ttl`               | Number |               | Epoch para metadata (2 años)                                                     |

**Tabla: Messages**

| Atributo     | Tipo   | Key           | Descripción                       |
| ------------ | ------ | ------------- | --------------------------------- |
| `PK`         | String | Partition Key | `CONV#{conversation_id}`          |
| `SK`         | String | Sort Key      | `MSG#{ulid}`                      |
| `message_id` | String |               | ULID del mensaje                  |
| `role`       | String |               | `USER` \| `ASSISTANT` \| `SYSTEM` |
| `content`    | String |               | Contenido del mensaje             |
| `metadata`   | Map    |               | Metadata adicional (tokens, etc.) |
| `timestamp`  | String |               | ISO timestamp                     |
| `ttl`        | Number |               | Epoch para auto-delete (90 días)  |

#### **Política de Retención de Datos**

| Dato                        | Retención                                  | Justificación                          |
| --------------------------- | ------------------------------------------ | -------------------------------------- |
| **Messages** (contenido)    | 90 días → Auto-delete vía TTL              | Cumplimiento GDPR, reducción de costes |
| **Conversation** (metadata) | 2 años → Luego solo estadísticas agregadas | Análisis y mejora del servicio         |
| **AuditLog**                | 1 año → Configurable por compliance        | Auditoría y trazabilidad               |
| **Order**                   | 7 años → Requisito fiscal                  | Obligaciones legales                   |
| **OrderAddress**            | 7 años → Vinculado a Order                 | Inmutable, requisito fiscal            |
| **User**                    | Indefinido mientras activo                 | Hasta que usuario solicite eliminación |
| **Address** (soft deleted)  | 1 año tras soft-delete → Hard delete       | Balance entre recuperación y GDPR      |
| **ECommerce/Store**         | Indefinido mientras activo                 | Datos de negocio críticos              |

> 📖 **Modelo de datos completo**: [Adresles_Business.md - Fase 3](./Adresles_Business.md#fase-3-modelado-de-datos)  
> 📖 **ADR Base de Datos**: [memory-bank/architecture/002-supabase-dynamodb.md](./memory-bank/architecture/002-supabase-dynamodb.md)

### **3.2. Descripción de entidades principales:**

#### **ECOMMERCE** (Supabase)

Representa la razón social (empresa) que contrata Adresles. Un eCommerce puede tener múltiples tiendas (stores).

| Atributo          | Tipo         | Restricciones           | Descripción                                           |
| ----------------- | ------------ | ----------------------- | ----------------------------------------------------- |
| `id`              | UUID         | PK                      | Identificador único                                   |
| `tax_id`          | VARCHAR(50)  | UNIQUE, NOT NULL        | Razón Social / CIF / VAT (identificador fiscal único) |
| `legal_name`      | VARCHAR(255) | NOT NULL                | Nombre legal de la empresa                            |
| `commercial_name` | VARCHAR(255) |                         | Nombre comercial                                      |
| `email`           | VARCHAR(255) | NOT NULL                | Email de contacto principal                           |
| `phone`           | VARCHAR(20)  |                         | Teléfono de contacto                                  |
| `country`         | VARCHAR(2)   | NOT NULL                | Código ISO país sede                                  |
| `billing_address` | JSONB        |                         | Dirección de facturación completa                     |
| `trial_ends_at`   | TIMESTAMPTZ  |                         | Fin del periodo de prueba (1 mes)                     |
| `status`          | TEXT         | NOT NULL, CHECK         | `ACTIVE` \| `SUSPENDED` \| `CANCELLED`                |
| `created_at`      | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | Fecha de creación                                     |
| `updated_at`      | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | Última modificación                                   |

**Relaciones**:

- `1:N` con **STORE** (un eCommerce tiene múltiples tiendas)

---

#### **STORE** (Supabase)

Representa una tienda online específica de un eCommerce, identificada por URL única.

| Atributo           | Tipo         | Restricciones            | Descripción                                             |
| ------------------ | ------------ | ------------------------ | ------------------------------------------------------- |
| `id`               | UUID         | PK                       | Identificador único                                     |
| `ecommerce_id`     | UUID         | FK → ecommerce, NOT NULL | eCommerce propietario                                   |
| `url`              | VARCHAR(500) | UNIQUE, NOT NULL         | URL única de la tienda (ej: https://shop.example.com)   |
| `name`             | VARCHAR(255) | NOT NULL                 | Nombre de la tienda                                     |
| `platform`         | TEXT         | NOT NULL, CHECK          | `WOOCOMMERCE` \| `PRESTASHOP` \| `MAGENTO` \| `SHOPIFY` |
| `default_language` | VARCHAR(5)   | NOT NULL                 | Idioma por defecto (ISO 639-1: es, en, fr...)           |
| `default_currency` | VARCHAR(3)   | NOT NULL                 | Moneda por defecto (ISO 4217: EUR, USD, GBP...)         |
| `timezone`         | VARCHAR(50)  | NOT NULL                 | Zona horaria (ej: Europe/Madrid)                        |
| `logo_url`         | VARCHAR(500) |                          | Logo de la tienda                                       |
| `status`           | TEXT         | NOT NULL, CHECK          | `ACTIVE` \| `INACTIVE` \| `PENDING_SETUP`               |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | Fecha de creación                                       |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT now()  | Última modificación                                     |

**Relaciones**:

- `N:1` con **ECOMMERCE** (muchas tiendas pertenecen a un eCommerce)
- `1:1` con **PLUGIN_CONFIG** (cada tienda tiene una configuración de plugin)
- `1:N` con **ORDER** (una tienda recibe múltiples pedidos)

---

#### **USER** (Supabase)

Representa un comprador o destinatario. El **número de teléfono** es el identificador único.

| Atributo              | Tipo         | Restricciones           | Descripción                                    |
| --------------------- | ------------ | ----------------------- | ---------------------------------------------- |
| `id`                  | UUID         | PK                      | Identificador único interno                    |
| `phone`               | VARCHAR(20)  | UNIQUE, NOT NULL        | **Teléfono (identificador único del usuario)** |
| `phone_country`       | VARCHAR(2)   | NOT NULL                | Código país del teléfono (ISO 3166-1 alpha-2)  |
| `first_name`          | VARCHAR(100) |                         | Nombre                                         |
| `last_name`           | VARCHAR(100) |                         | Apellidos                                      |
| `email`               | VARCHAR(255) |                         | Email opcional                                 |
| `preferred_language`  | VARCHAR(5)   |                         | Idioma preferido detectado automáticamente     |
| `is_registered`       | BOOLEAN      | DEFAULT false           | Usuario registrado voluntariamente en Adresles |
| `registered_at`       | TIMESTAMPTZ  |                         | Fecha de registro voluntario                   |
| `last_interaction_at` | TIMESTAMPTZ  |                         | Última interacción con el sistema              |
| `created_at`          | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | Primera vez que aparece en el sistema          |
| `updated_at`          | TIMESTAMPTZ  | NOT NULL, DEFAULT now() | Última modificación                            |

**Relaciones**:

- `1:N` con **ADDRESS** (un usuario tiene múltiples direcciones en su libreta)
- `1:N` con **ORDER** (un usuario realiza múltiples compras)

**Notas importantes**:

- El teléfono es el identificador único. Si dos personas comparten teléfono, el sistema las trata como un solo usuario.
- `is_registered = false`: Usuario existe pero no se ha registrado voluntariamente (solo compró)
- `is_registered = true`: Usuario aceptó registrarse para aprovechar beneficios (libreta de direcciones, checkouts más rápidos)

---

#### **ADDRESS** (Supabase)

Representa direcciones en la libreta del usuario. Las direcciones son reutilizables entre diferentes eCommerce.

| Atributo          | Tipo          | Restricciones           | Descripción                                         |
| ----------------- | ------------- | ----------------------- | --------------------------------------------------- |
| `id`              | UUID          | PK                      | Identificador único                                 |
| `user_id`         | UUID          | FK → user, NOT NULL     | Usuario propietario                                 |
| `label`           | VARCHAR(100)  |                         | Etiqueta amigable (Casa, Trabajo, Oficina...)       |
| `full_address`    | VARCHAR(500)  | NOT NULL                | Dirección completa formateada (legible)             |
| `street`          | VARCHAR(255)  | NOT NULL                | Calle                                               |
| `number`          | VARCHAR(20)   |                         | Número                                              |
| `block`           | VARCHAR(20)   |                         | Bloque                                              |
| `staircase`       | VARCHAR(20)   |                         | Escalera                                            |
| `floor`           | VARCHAR(20)   |                         | Piso                                                |
| `door`            | VARCHAR(20)   |                         | Puerta                                              |
| `additional_info` | VARCHAR(255)  |                         | Info adicional (ej: "Timbre roto, llamar al móvil") |
| `postal_code`     | VARCHAR(20)   | NOT NULL                | Código postal                                       |
| `city`            | VARCHAR(100)  | NOT NULL                | Ciudad                                              |
| `province`        | VARCHAR(100)  |                         | Provincia/Estado                                    |
| `country`         | VARCHAR(2)    | NOT NULL                | Código ISO país (ISO 3166-1 alpha-2)                |
| `gmaps_place_id`  | VARCHAR(255)  |                         | ID de Google Maps (validación)                      |
| `latitude`        | DECIMAL(10,8) |                         | Latitud (coordenadas)                               |
| `longitude`       | DECIMAL(11,8) |                         | Longitud (coordenadas)                              |
| `is_default`      | BOOLEAN       | DEFAULT false           | Dirección favorita del usuario                      |
| `is_deleted`      | BOOLEAN       | DEFAULT false           | Soft delete (no se elimina físicamente)             |
| `deleted_at`      | TIMESTAMPTZ   |                         | Fecha de soft delete                                |
| `created_at`      | TIMESTAMPTZ   | NOT NULL, DEFAULT now() | Fecha de creación                                   |
| `updated_at`      | TIMESTAMPTZ   | NOT NULL, DEFAULT now() | Última modificación                                 |

**Relaciones**:

- `N:1` con **USER** (muchas direcciones pertenecen a un usuario)
- `1:N` con **ORDER_ADDRESS** (una dirección puede ser fuente de múltiples snapshots)

**Notas importantes**:

- **Soft delete**: `is_deleted = true` marca la dirección como eliminada pero persiste 1 año
- **Dirección favorita**: Solo una dirección por usuario tiene `is_default = true`
- **Google Maps**: `gmaps_place_id`, `latitude`, `longitude` se obtienen de validación con Google Maps API

---

#### **ORDER** (Supabase)

Representa un pedido realizado en una tienda online.

| Atributo                | Tipo          | Restricciones           | Descripción                                                                     |
| ----------------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `id`                    | UUID          | PK                      | Identificador único interno de Adresles                                         |
| `store_id`              | UUID          | FK → store, NOT NULL    | Tienda origen del pedido                                                        |
| `user_id`               | UUID          | FK → user, NOT NULL     | Comprador (siempre el que paga)                                                 |
| `external_order_id`     | VARCHAR(100)  | NOT NULL                | ID del pedido en el sistema eCommerce                                           |
| `external_order_number` | VARCHAR(50)   |                         | Número visible del pedido para el usuario (ej: #12345)                          |
| `total_amount`          | DECIMAL(12,2) | NOT NULL                | Importe total del pedido                                                        |
| `currency`              | VARCHAR(3)    | NOT NULL                | Moneda (ISO 4217: EUR, USD, GBP...)                                             |
| `fee_percentage`        | DECIMAL(5,2)  | NOT NULL                | % de fee aplicado (2.5% - 5%)                                                   |
| `fee_amount`            | DECIMAL(12,2) | NOT NULL                | Importe de fee cobrado a eCommerce                                              |
| `status`                | TEXT          | NOT NULL, CHECK         | `PENDING_ADDRESS` \| `READY_TO_PROCESS` \| `COMPLETED` \| `FAILED` \| `CANCELLED` |
| `is_gift`               | BOOLEAN       | DEFAULT false           | Pedido es un regalo (modo regalo activo)                                        |
| `items_summary`         | JSONB         |                         | Resumen de productos comprados                                                  |
| `webhook_received_at`   | TIMESTAMPTZ   | NOT NULL                | Cuándo se recibió el webhook del eCommerce                                      |
| `address_confirmed_at`  | TIMESTAMPTZ   |                         | Cuándo el usuario confirmó la dirección                                         |
| `synced_at`             | TIMESTAMPTZ   |                         | Cuándo se sincronizó con eCommerce                                              |
| `created_at`            | TIMESTAMPTZ   | NOT NULL, DEFAULT now() | Fecha de creación                                                               |
| `updated_at`            | TIMESTAMPTZ   | NOT NULL, DEFAULT now() | Última modificación                                                             |

**Relaciones**:

- `N:1` con **STORE** (muchos pedidos pertenecen a una tienda)
- `N:1` con **USER** (muchos pedidos realizados por un usuario)
- `1:1` con **ORDER_ADDRESS** (un pedido tiene una dirección confirmada)
- `1:1` con **GIFT_RECIPIENT** (si `is_gift = true`)

**Estados del pedido**:

```mermaid
stateDiagram-v2
    [*] --> PENDING_ADDRESS : Modo adresles (sin dirección)
    [*] --> READY_TO_PROCESS : Modo tradicional (con dirección)

    PENDING_ADDRESS --> READY_TO_PROCESS : Dirección confirmada por conversación
    PENDING_ADDRESS --> ESCALATED : Timeout/Escalado
    PENDING_ADDRESS --> CANCELLED : Cancelado

    READY_TO_PROCESS --> COMPLETED : Sync OK
    READY_TO_PROCESS --> FAILED : Sync fails

    ESCALATED --> COMPLETED : Resuelto

    FAILED --> COMPLETED : Retry exitoso
    FAILED --> FAILED : Retry fallido

    COMPLETED --> [*]
    CANCELLED --> [*]
```

**Fórmula de fee**:

```
Si importe ≤ 10€:       fee = 5%
Si importe ≥ 100€:      fee = 2.5%
Si 10€ < importe < 100€: fee = 5 - (2.5 × (importe - 10) / 90)
```

**Índices**:

- `idx_order_store_status` ON (store_id, status)
- `idx_order_user` ON (user_id)
- `idx_order_external` ON (store_id, external_order_id) UNIQUE

---

#### **ORDER_ADDRESS** (Supabase) - Snapshot Inmutable

Representa la dirección confirmada de un pedido específico. **Este registro es INMUTABLE** una vez creado.

| Atributo            | Tipo         | Restricciones                    | Descripción                                             |
| ------------------- | ------------ | -------------------------------- | ------------------------------------------------------- |
| `id`                | UUID         | PK                               | Identificador único                                     |
| `order_id`          | UUID         | FK → order, **UNIQUE**, NOT NULL | Pedido asociado (relación 1:1)                          |
| `source_address_id` | UUID         | FK → address, NULL               | Dirección origen si aplica (puede ser null si es nueva) |
| `recipient_type`    | TEXT         | NOT NULL, CHECK                  | `BUYER` \| `GIFT_RECIPIENT`                             |
| `recipient_name`    | VARCHAR(200) | NOT NULL                         | Nombre completo del destinatario                        |
| `recipient_phone`   | VARCHAR(20)  | NOT NULL                         | Teléfono del destinatario                               |
| `full_address`      | VARCHAR(500) | NOT NULL                         | Dirección completa formateada                           |
| `street`            | VARCHAR(255) | NOT NULL                         | Calle                                                   |
| `number`            | VARCHAR(20)  |                                  | Número                                                  |
| `block`             | VARCHAR(20)  |                                  | Bloque                                                  |
| `staircase`         | VARCHAR(20)  |                                  | Escalera                                                |
| `floor`             | VARCHAR(20)  |                                  | Piso                                                    |
| `door`              | VARCHAR(20)  |                                  | Puerta                                                  |
| `additional_info`   | VARCHAR(255) |                                  | Info adicional                                          |
| `postal_code`       | VARCHAR(20)  | NOT NULL                         | Código postal                                           |
| `city`              | VARCHAR(100) | NOT NULL                         | Ciudad                                                  |
| `province`          | VARCHAR(100) |                                  | Provincia                                               |
| `country`           | VARCHAR(2)   | NOT NULL                         | País (ISO 3166-1 alpha-2)                               |
| `gmaps_place_id`    | VARCHAR(255) |                                  | ID de Google Maps                                       |
| `confirmed_at`      | TIMESTAMPTZ  | NOT NULL                         | Momento exacto de confirmación                          |
| `confirmed_via`     | TEXT         | NOT NULL, CHECK                  | `CONVERSATION` \| `MANUAL` \| `ECOMMERCE_SYNC`          |

**Relaciones**:

- `1:1` con **ORDER** (cada pedido tiene exactamente un snapshot de dirección)
- `N:1` con **ADDRESS** (opcional, si la dirección proviene de libreta)

**⚠️ IMPORTANTE - Inmutabilidad**:

- Una vez creado, este registro **NO SE MODIFICA NUNCA**
- Si el usuario cambia su dirección en la libreta (`address`), este snapshot permanece intacto
- Garantiza trazabilidad: siempre sabremos exactamente dónde se envió cada pedido
- Requisito legal: direcciones de pedidos deben conservarse 7 años sin modificación

---

#### **GIFT_RECIPIENT** (Supabase)

Representa al destinatario de un regalo. Solo existe si `order.is_gift = true`.

| Atributo     | Tipo         | Restricciones                    | Descripción                                                           |
| ------------ | ------------ | -------------------------------- | --------------------------------------------------------------------- |
| `id`         | UUID         | PK                               | Identificador único                                                   |
| `order_id`   | UUID         | FK → order, **UNIQUE**, NOT NULL | Pedido regalo asociado (relación 1:1)                                 |
| `first_name` | VARCHAR(100) | NOT NULL                         | Nombre del destinatario del regalo                                    |
| `last_name`  | VARCHAR(100) | NOT NULL                         | Apellidos del destinatario                                            |
| `phone`      | VARCHAR(20)  | NOT NULL                         | Teléfono del destinatario                                             |
| `note`       | TEXT         |                                  | Nota opcional del comprador para el destinatario                      |
| `status`     | TEXT         | NOT NULL, CHECK                  | `PENDING_CONTACT` \| `CONTACTED` \| `ADDRESS_RECEIVED` \| `COMPLETED` |
| `created_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | Fecha de creación                                                     |
| `updated_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | Última modificación                                                   |

**Relaciones**:

- `1:1` con **ORDER** (cada regalo tiene exactamente un destinatario)
- **NO tiene FK a USER**: El destinatario puede no existir como usuario registrado

**Estados del destinatario de regalo**:

```mermaid
stateDiagram-v2
    [*] --> PENDING_CONTACT : Regalo creado

    PENDING_CONTACT --> CONTACTED : Mensaje enviado

    CONTACTED --> ADDRESS_RECEIVED : Dirección obtenida
    CONTACTED --> PENDING_CONTACT : Retry necesario

    ADDRESS_RECEIVED --> COMPLETED : Sincronizado

    COMPLETED --> [*]
```

**Nota importante**:

- El destinatario puede o no existir en la tabla `user`
- Si el destinatario tiene cuenta Adresles (mismo teléfono en `user`), se le propondrá su dirección favorita
- Si no tiene cuenta, se le solicitará dirección y luego se le invitará a registrarse

> 📖 **Diccionario completo**: [Adresles_Business.md - Sección 3.3](./Adresles_Business.md#33-diccionario-de-datos)  
> 📖 **Diagramas de estados**: [Adresles_Business.md - Sección 3.5](./Adresles_Business.md#35-diagramas-de-estados)

---

## 4. Especificación de la API

El backend expone una API REST + WebSocket para comunicación en tiempo real. A continuación se describen 3 endpoints principales en formato OpenAPI.

### **Endpoint 1: Recibir Pedido Mock desde eCommerce**

```yaml
/api/mock/orders:
    post:
        summary: Recibe pedidos mock (simula webhook de eCommerce)
        description: |
            Endpoint de entrada manual que simula la recepción de un pedido desde
            un eCommerce. Orquesta el flujo según el modo (adresles / tradicional).
            En modo adresles crea la Order en PENDING_ADDRESS e inicia una
            conversación GET_ADDRESS con GPT-4. En modo tradicional crea la Order
            en READY_TO_PROCESS con OrderAddress incluida y la marca COMPLETED.
        requestBody:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - order_id
                            - order_number
                            - store_url
                            - customer
                            - total
                            - currency
                            - mode
                        properties:
                            order_id:
                                type: string
                                description: ID del pedido en WooCommerce
                                example: "wc_12345"
                            order_number:
                                type: string
                                description: Número visible del pedido
                                example: "#12345"
                            store_url:
                                type: string
                                format: uri
                                description: URL de la tienda
                                example: "https://shop.example.com"
                            customer:
                                type: object
                                required:
                                    - first_name
                                    - last_name
                                    - phone
                                properties:
                                    first_name:
                                        type: string
                                        example: "Juan"
                                    last_name:
                                        type: string
                                        example: "Pérez"
                                    phone:
                                        type: string
                                        example: "+34612345678"
                                    email:
                                        type: string
                                        format: email
                                        example: "juan@example.com"
                            total:
                                type: number
                                format: decimal
                                description: Importe total del pedido
                                example: 55.90
                            currency:
                                type: string
                                description: Código ISO 4217
                                example: "EUR"
                            mode:
                                type: string
                                enum: [adresles, tradicional]
                                description: Modo de checkout utilizado
                                example: "adresles"
                            delivery_address:
                                type: object
                                description: Dirección de entrega (solo si mode=tradicional)
                                properties:
                                    street:
                                        type: string
                                    number:
                                        type: string
                                    city:
                                        type: string
                                    postal_code:
                                        type: string
                                    country:
                                        type: string
                            is_gift:
                                type: boolean
                                description: Si el pedido es un regalo
                                example: false
                            gift_recipient:
                                type: object
                                description: Datos del destinatario (solo si is_gift=true)
                                properties:
                                    first_name:
                                        type: string
                                    last_name:
                                        type: string
                                    phone:
                                        type: string
                                    note:
                                        type: string
                            items:
                                type: array
                                description: Productos del pedido
                                items:
                                    type: object
                                    properties:
                                        name:
                                            type: string
                                        quantity:
                                            type: integer
                                        price:
                                            type: number
        responses:
            "201":
                description: Pedido creado y procesado correctamente
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                orderId:
                                    type: string
                                    description: ID interno de Adresles
                                    example: "550e8400-e29b-41d4-a716-446655440000"
                                conversationId:
                                    type: string
                                    description: ID de la conversación iniciada
                                    example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                                status:
                                    type: string
                                    example: "PENDING_ADDRESS"
            "400":
                description: Datos del pedido inválidos (class-validator)
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                message:
                                    type: array
                                    example: ["phone must be a valid phone number"]
                                statusCode:
                                    type: number
                                    example: 400
```

**Ejemplo de petición (Modo Adresles sin dirección)**:

```json
{
    "order_id": "wc_12345",
    "order_number": "#12345",
    "store_url": "https://shop.example.com",
    "customer": {
        "first_name": "Juan",
        "last_name": "Pérez",
        "phone": "+34612345678",
        "email": "juan@example.com"
    },
    "total": 55.9,
    "currency": "EUR",
    "mode": "adresles",
    "is_gift": false,
    "items": [
        {
            "name": "Camiseta Azul",
            "quantity": 2,
            "price": 19.95
        },
        {
            "name": "Pantalón Vaquero",
            "quantity": 1,
            "price": 35.95
        }
    ]
}
```

---

### **Endpoint 2: Enviar Mensaje en Conversación**

```yaml
/conversations/{conversation_id}/messages:
    post:
        summary: Envía mensaje del usuario en una conversación
        description: |
            El usuario responde en la conversación activa. 
            El sistema procesa el mensaje con GPT-4 y genera respuesta.
        security:
            - bearerAuth: []
        parameters:
            - name: conversation_id
              in: path
              required: true
              schema:
                  type: string
                  format: uuid
              description: ID de la conversación
        requestBody:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - content
                        properties:
                            content:
                                type: string
                                description: Contenido del mensaje del usuario
                                example: "Calle Mayor 123, 3º B, Madrid"
        responses:
            "200":
                description: Mensaje enviado correctamente
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                success:
                                    type: boolean
                                    example: true
                                message_id:
                                    type: string
                                    format: ulid
                                    example: "01HZJQXYZ1234567890ABCDEFG"
                                status:
                                    type: string
                                    enum: [processing, completed]
                                    example: "processing"
            "401":
                description: Usuario no autenticado
            "404":
                description: Conversación no encontrada
            "400":
                description: Mensaje vacío o inválido
```

**Ejemplo de petición**:

```json
{
    "content": "Calle Mayor 123, 3º B, 28013 Madrid"
}
```

**Ejemplo de respuesta**:

```json
{
    "success": true,
    "message_id": "01HZJQXYZ1234567890ABCDEFG",
    "status": "processing"
}
```

---

### **Endpoint 3: Validar Dirección con Google Maps**

```yaml
/addresses/validate:
    post:
        summary: Valida y normaliza una dirección usando Google Maps API
        description: |
            Valida formato de dirección, normaliza campos y detecta datos faltantes 
            (escalera, piso, puerta) en edificios.
        security:
            - bearerAuth: []
        requestBody:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - address
                        properties:
                            address:
                                type: string
                                description: Dirección en texto libre
                                example: "Calle Mayor 123, Madrid"
                            country_hint:
                                type: string
                                description: Código ISO país (hint para mejorar precisión)
                                example: "ES"
        responses:
            "200":
                description: Dirección validada correctamente
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                valid:
                                    type: boolean
                                    description: Si la dirección es válida según Google Maps
                                    example: true
                                normalized:
                                    type: object
                                    description: Dirección normalizada por Google Maps
                                    properties:
                                        full_address:
                                            type: string
                                            example: "Calle Mayor, 123, 28013 Madrid, España"
                                        street:
                                            type: string
                                            example: "Calle Mayor"
                                        number:
                                            type: string
                                            example: "123"
                                        postal_code:
                                            type: string
                                            example: "28013"
                                        city:
                                            type: string
                                            example: "Madrid"
                                        province:
                                            type: string
                                            example: "Madrid"
                                        country:
                                            type: string
                                            example: "ES"
                                        gmaps_place_id:
                                            type: string
                                            example: "ChIJgTwKgJQpQg0RaSKMYcHeNsQ"
                                        latitude:
                                            type: number
                                            format: decimal
                                            example: 40.4167
                                        longitude:
                                            type: number
                                            format: decimal
                                            example: -3.7037
                                missing_fields:
                                    type: array
                                    description: Campos que probablemente faltan (edificios)
                                    items:
                                        type: string
                                        enum: [floor, door, staircase, block]
                                    example: ["floor", "door"]
                                is_building:
                                    type: boolean
                                    description: Si parece ser un edificio con múltiples viviendas
                                    example: true
            "400":
                description: Dirección inválida o no encontrada
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                valid:
                                    type: boolean
                                    example: false
                                error:
                                    type: string
                                    example: "Address not found in Google Maps"
                                suggestions:
                                    type: array
                                    description: Sugerencias de direcciones similares
                                    items:
                                        type: string
                                    example:
                                        [
                                            "Calle Mayor, 123, Madrid",
                                            "Calle Mayor, 123, Móstoles",
                                        ]
            "401":
                description: Usuario no autenticado
```

**Ejemplo de petición**:

```json
{
    "address": "Calle Mayor 123, Madrid",
    "country_hint": "ES"
}
```

**Ejemplo de respuesta (dirección válida, edificio con datos faltantes)**:

```json
{
    "valid": true,
    "normalized": {
        "full_address": "Calle Mayor, 123, 28013 Madrid, España",
        "street": "Calle Mayor",
        "number": "123",
        "postal_code": "28013",
        "city": "Madrid",
        "province": "Madrid",
        "country": "ES",
        "gmaps_place_id": "ChIJgTwKgJQpQg0RaSKMYcHeNsQ",
        "latitude": 40.4167,
        "longitude": -3.7037
    },
    "missing_fields": ["floor", "door"],
    "is_building": true
}
```

---

---

### **Endpoint 4: Dashboard Admin — Pedidos, Usuarios y Chat**

```yaml
/admin/orders:
    get:
        summary: Lista pedidos con paginación y datos relacionales
        parameters:
            - name: page
              in: query
              schema: { type: integer, default: 1 }
            - name: limit
              in: query
              schema: { type: integer, default: 20 }
        responses:
            "200":
                description: Lista paginada de pedidos
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                data:
                                    type: array
                                    items: { $ref: '#/components/schemas/Order' }
                                total:
                                    type: integer
                                page:
                                    type: integer
                                limit:
                                    type: integer

/admin/users:
    get:
        summary: Lista usuarios (excluye soft-deleted)
        parameters:
            - name: page
              in: query
              schema: { type: integer, default: 1 }
            - name: limit
              in: query
              schema: { type: integer, default: 20 }
        responses:
            "200":
                description: Lista paginada de usuarios

/admin/conversations/{conversationId}/messages:
    get:
        summary: Devuelve mensajes de una conversación con contexto
        description: |
            Incluye ConversationContext (tipo, estado, timestamps, número de pedido)
            en la respuesta para evitar múltiples peticiones desde el frontend.
        parameters:
            - name: conversationId
              in: path
              required: true
              schema: { type: string, format: uuid }
        responses:
            "200":
                description: Mensajes de la conversación con contexto
            "404":
                description: Conversación no encontrada
```

---

### **Componentes de Seguridad**

```yaml
components:
    securitySchemes:
        bearerAuth:
            type: http
            scheme: bearer
            bearerFormat: JWT
            description: JWT token de Supabase Auth
        webhookSignature:
            type: apiKey
            in: header
            name: X-WC-Webhook-Signature
            description: Firma HMAC del webhook de WooCommerce
```

> 📖 **API completa**: [Adresles_Business.md - Sección 4.12](./Adresles_Business.md#412-api-endpoints-principales)

---

## 5. Historias de Usuario

> ⚠️ **Estado**: El proyecto se encuentra en fase de diseño y documentación. Las historias de usuario se definirán detalladamente durante la fase de implementación.

A continuación se presentan 3 historias de usuario principales basadas en los casos de uso diseñados:

### **Historia de Usuario 1: Compra Rápida con Modo Adresles**

**Como** comprador habitual online  
**Quiero** completar mi compra solo con nombre y teléfono (sin introducir dirección manualmente)  
**Para** ahorrar tiempo y evitar la fricción de formularios largos en móvil

**Criterios de Aceptación**:

- ✅ El checkout muestra solo 2 campos obligatorios: Nombre completo y Teléfono
- ✅ El sistema valida el formato del teléfono (internacional)
- ✅ Tras confirmar compra, recibo una notificación en la App Adresles en menos de 30 segundos
- ✅ El agente IA me saluda en mi idioma preferido
- ✅ Si tengo dirección favorita guardada, el sistema me la propone automáticamente
- ✅ Si no tengo dirección guardada, el agente IA me solicita la dirección mediante conversación natural
- ✅ El sistema valida mi dirección con Google Maps y detecta si faltan datos (piso, puerta)
- ✅ Tras confirmar dirección, el pedido se sincroniza con la tienda online en menos de 1 minuto
- ✅ Recibo confirmación de que mi pedido está procesándose

**Escenarios**:

1. **Usuario registrado con dirección favorita**:
    - Sistema propone dirección guardada
    - Usuario confirma con un "Sí" o cambia a otra dirección
    - Tiempo total: ~30 segundos

2. **Usuario registrado sin dirección favorita**:
    - IA solicita dirección conversacionalmente
    - Usuario proporciona dirección ("Calle Mayor 123, 3º B, Madrid")
    - IA valida con Google Maps
    - IA solicita confirmación
    - Usuario confirma
    - Tiempo total: ~2 minutos

3. **Usuario nuevo (no registrado)**:
    - IA solicita dirección conversacionalmente
    - Usuario proporciona dirección
    - IA valida y solicita confirmación
    - Usuario confirma
    - IA invita a registrarse en Adresles
    - Usuario acepta o rechaza registro
    - Tiempo total: ~3 minutos

**Prioridad**: ALTA (Core del producto)  
**Puntos de Historia**: 13 (Epic - se descompondrá en subtareas)  
**Dependencies**: Integración OpenAI GPT-4, Google Maps API, Supabase Auth

> 📖 **Caso de Uso detallado**: [Adresles_Business.md - CU-02](./Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación)

---

### **Historia de Usuario 2: Enviar Regalo sin Conocer Dirección**

**Como** comprador que quiere enviar un regalo  
**Quiero** comprar sin conocer la dirección del destinatario  
**Para** sorprender al destinatario sin tener que preguntarle su dirección previamente

**Criterios de Aceptación**:

- ✅ El checkout tiene opción "Es un regalo" visible y clara
- ✅ Al activar "Es un regalo", aparecen campos adicionales: Nombre destinatario, Teléfono destinatario, Nota opcional
- ✅ Completo la compra solo con mis datos + datos básicos del destinatario
- ✅ El sistema inicia DOS conversaciones paralelas:
    - **Conversación conmigo (comprador)**: Recibo confirmación de compra y se me informa que se está contactando al destinatario
    - **Conversación con destinatario**: IA contacta al destinatario para obtener/confirmar su dirección
- ✅ Como comprador, recibo actualizaciones del progreso ("Hemos contactado a María", "María ha confirmado su dirección")
- ✅ La dirección del destinatario NO se me revela (protección de datos)
- ✅ Si el destinatario tiene dirección favorita en Adresles, el sistema se la propone automáticamente
- ✅ Si el destinatario no responde, recibo notificación del estado
- ✅ Cuando la dirección es confirmada, recibo confirmación final de que el regalo se enviará

**Escenarios**:

1. **Destinatario registrado con dirección favorita**:
    - IA contacta al destinatario
    - IA: "Hola María, Juan te ha enviado un regalo 🎁. ¿Confirmas que lo enviemos a tu dirección: Calle Luna 45, 2º A, Barcelona?"
    - Destinatario confirma
    - Comprador recibe: "María ha confirmado su dirección. Tu regalo se enviará pronto."
    - Tiempo total: ~1 minuto

2. **Destinatario no registrado**:
    - IA contacta al destinatario
    - IA: "Hola María, Juan te ha enviado un regalo 🎁. ¿A qué dirección te lo enviamos?"
    - Destinatario proporciona dirección
    - IA valida con Google Maps y confirma
    - IA invita al destinatario a registrarse
    - Comprador recibe actualización
    - Tiempo total: ~3-5 minutos

3. **Destinatario no responde**:
    - IA contacta al destinatario
    - Tras 15 minutos sin respuesta, comprador recibe: "Todavía no hemos recibido respuesta de María. Le hemos enviado recordatorio."
    - Sistema escala manualmente a soporte si no hay respuesta prolongada (MVP)
    - Tiempo: Variable

**Prioridad**: ALTA (Diferenciador competitivo)  
**Puntos de Historia**: 13 (Epic - incluye gestión de dos conversaciones paralelas)  
**Dependencies**: Sistema de conversaciones, gestión de estado de `gift_recipient`

> 📖 **Caso de Uso detallado**: [Adresles_Business.md - CU-01 FA-1](./Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock)

---

### **Historia de Usuario 3: Registro Voluntario en Adresles**

**Como** usuario que ha completado una compra (modo Adresles o tradicional)  
**Quiero** registrarme voluntariamente en Adresles  
**Para** aprovechar beneficios como libreta de direcciones y checkouts más rápidos en futuras compras

**Criterios de Aceptación**:

- ✅ Tras confirmar dirección de pedido, el agente IA me invita a registrarme
- ✅ IA explica claramente los beneficios del registro:
    - Futuras compras más rápidas en cualquier tienda integrada
    - Libreta de direcciones centralizada
    - Reutilizar direcciones guardadas sin repetirlas
    - Gestión unificada de direcciones
- ✅ IA me pregunta: "¿Desea registrarse en Adresles para disfrutar de estos beneficios?"
- ✅ Puedo aceptar o rechazar el registro
- ✅ Si acepto:
    - Mi cuenta se crea/actualiza con `is_registered = true`
    - IA me pregunta si quiero guardar la dirección de esta compra en mi libreta
    - Si acepto guardar dirección, se marca como favorita (si es mi primera dirección)
    - Recibo confirmación: "¡Registro completado! Ya puede usar Adresles en cualquier tienda integrada"
- ✅ Si rechazo:
    - IA respeta mi decisión: "Entendido. Puede registrarse cuando lo desee desde cualquier compra futura"
    - No se modifica `is_registered` (permanece false)
    - Puedo seguir usando Adresles sin registrarme
- ✅ Si pido más información sobre privacidad:
    - IA explica política de privacidad
    - IA explica datos almacenados (nombre, teléfono, email opcional, direcciones)
    - IA lista tiendas integradas con Adresles
    - IA informa que puedo actualizar o eliminar mi cuenta en cualquier momento
    - Tras información, IA vuelve a preguntar si deseo registrarme

**Escenarios**:

1. **Usuario acepta registro y guarda dirección**:
    - IA invita a registro tras confirmar pedido
    - Usuario: "Sí, quiero registrarme"
    - IA: "¿Desea guardar esta dirección para futuras compras?"
    - Usuario: "Sí"
    - Sistema crea cuenta y guarda dirección como favorita
    - IA: "¡Registro completado! Su dirección ha sido guardada"
    - Tiempo: ~30 segundos

2. **Usuario acepta registro pero no guarda dirección**:
    - Similar al anterior, pero usuario rechaza guardar dirección
    - Sistema crea cuenta sin direcciones guardadas
    - Tiempo: ~30 segundos

3. **Usuario rechaza registro**:
    - IA invita a registro
    - Usuario: "No, gracias"
    - IA: "Entendido. Puede registrarse cuando lo desee"
    - Sistema no modifica estado de registro
    - Tiempo: ~15 segundos

4. **Usuario pide más información**:
    - IA invita a registro
    - Usuario: "¿Qué datos almacenáis?"
    - IA proporciona información detallada
    - Usuario decide (acepta/rechaza)
    - Tiempo: ~2 minutos

**Prioridad**: MEDIA (Feature importante pero no bloqueante para MVP)  
**Puntos de Historia**: 8  
**Dependencies**: Sistema de conversaciones, gestión de estado `user.is_registered`

> 📖 **Caso de Uso detallado**: [Adresles_Business.md - CU-03](./Adresles_Business.md#24-caso-de-uso-3-solicitud-de-registro-voluntario-en-adresles)

---

### **Mapa de Historias de Usuario → Journeys**

| Historia de Usuario          | Journey Asociado            | Caso de Uso |
| ---------------------------- | --------------------------- | ----------- |
| HU-1: Compra Rápida Adresles | Journey 2, 3, 4             | CU-02       |
| HU-2: Regalo sin Dirección   | Journey 5                   | CU-01 FA-1  |
| HU-3: Registro Voluntario    | Aplica a todos los journeys | CU-03       |

> 📖 **User Journeys completos**: [Adresles_Business.md - Sección 1.6](./Adresles_Business.md#16-user-journeys-detallados)

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

### **Pull Request 1: Implementación Completa de la Infraestructura del Proyecto Adresles**

#### 📋 Información General

- **Rama origen**: `finalproject-SVL`
- **Rama destino**: `main`
- **Autor**: Sergio Valdueza Lozano
- **Fecha**: 10 de febrero de 2026
- **Tipo de cambio**: Feature - Infraestructura inicial del proyecto
- **Estado**: ✅ Merged
- **Commits incluidos**: 11 commits
- **Link**: [Ver PR completa](./PR%2020260210.md)

#### 🎯 Resumen Ejecutivo

Esta Pull Request establece **la base completa del proyecto Adresles**. Incluye toda la documentación arquitectural, infraestructura de desarrollo con OPENSPEC, sistema de memoria persistente (Memory-Bank), y definición exhaustiva del producto.

**Impacto**: Representa la fase de **planificación y diseño completada** del proyecto, sentando las bases técnicas, arquitecturales y de proceso para las futuras implementaciones del MVP.

#### 📊 Estadísticas de Cambios

```
93 archivos modificados
19,857 líneas añadidas (+)
43 líneas eliminadas (-)
```

**Distribución por Categorías**:

| Categoría | Archivos | Líneas | Descripción |
|-----------|----------|--------|-------------|
| **OPENSPEC (Skills & Commands)** | 42 | ~7,500 | Framework de desarrollo con workflows |
| **Memory-Bank** | 13 | ~3,000 | Sistema de documentación persistente |
| **Documentación de Negocio** | 2 | ~2,400 | Diseño completo del sistema y prompts |
| **Especificaciones Técnicas** | 10 | ~4,200 | Standards, API specs, modelos de datos |
| **README & Configuración** | 3 | ~2,400 | Documentación principal del proyecto |
| **Infraestructura** | 23 | ~350 | .gitignore, configs, templates |

#### 🚀 Principales Cambios Implementados

##### 1️⃣ Implementación de OPENSPEC (Framework de Desarrollo)

OPENSPEC es un framework de desarrollo dirigido por especificaciones que estructura el trabajo en artifacts (proposal → specs → design → tasks → implementation).

**Archivos principales**:
- `.cursor/skills/openspec-*/SKILL.md` (7 skills)
- `.cursor/commands/opsx-*.md` (7 comandos)
- `openspec/config.yaml` (configuración central)
- `openspec/schemas/my-workflow/` (templates y schemas)

**Beneficios**:
- ✅ **Consistencia**: Workflow estandarizado para todos los desarrollos
- ✅ **Trazabilidad**: Cada cambio documentado desde propuesta hasta implementación
- ✅ **Productividad**: Comandos reutilizables (`/opsx:new`, `/opsx:continue`, `/opsx:apply`)
- ✅ **Calidad**: Verificación sistemática con `/opsx:verify` antes de archivar cambios

##### 2️⃣ Memory-Bank (Sistema de Contexto Persistente)

Sistema de documentación modular diseñado para que sesiones de IA conserven contexto del proyecto sin tener que releer documentos de 2,000+ líneas.

**Estructura**:
```
memory-bank/
├── README.md (índice maestro)
├── project-context/ (overview, tech-stack, domain-glossary)
├── architecture/ (4 ADRs - Decisiones Arquitecturales)
├── patterns/ (patrones emergentes)
└── references/ (navegación temática)
```

**Impacto**: Reduce tiempo de onboarding de nuevas sesiones de IA de ~10 minutos a ~2 minutos.

##### 3️⃣ Documentación de Negocio (Adresles_Business.md)

Documento maestro de **2,170 líneas** que contiene el diseño completo del sistema en 4 fases:
1. **Fase 1**: Investigación y Análisis (Lean Canvas, User Journeys, Pricing)
2. **Fase 2**: Casos de Uso (3 casos con diagramas UML)
3. **Fase 3**: Modelado de Datos (Modelo E-R, diccionario de datos, políticas de retención)
4. **Fase 4**: Diseño de Alto Nivel (Arquitectura C4, diagramas de secuencia, API endpoints, CI/CD)

**Contenido destacado**:
- 🎨 Diagramas C4 (niveles 1-3)
- 🗂️ Modelo E-R completo: 9 entidades principales
- 📡 42 API Endpoints documentados por módulo
- 🔄 8 Diagramas de Secuencia
- 🏗️ Estructura del Proyecto: Arquitectura modular DDD (5 bounded contexts)

##### 4️⃣ Especificaciones Técnicas (openspec/specs/)

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `backend-standards.mdc` | 1,327 | Principios DDD, SOLID, arquitectura hexagonal, testing |
| `frontend-standards.mdc` | 638 | Componentes React, Next.js, TypeScript, UX patterns |
| `data-model.md` | 284 | Modelo de datos detallado (Supabase + DynamoDB) |
| `api-spec-example.yml` | 1,093 | Especificación OpenAPI 3.0 de ejemplo |
| `development_guide.md` | 220 | Guía de desarrollo para nuevos contribuidores |

##### 5️⃣ Actualización Masiva del README.md

De un README básico de ~76 líneas a un **documento completo de 2,019 líneas** que incluye:
- ✅ Ficha del Proyecto
- ✅ Descripción General (objetivo, características, diseño UX)
- ✅ Arquitectura del Sistema
- ✅ Modelo de Datos
- ✅ Especificación de la API
- ✅ 3 Historias de Usuario detalladas

##### 6️⃣ Configuración del Repositorio

- `.gitignore` (294 líneas) - Seguridad y prevención de commits accidentales
- `prompts.md` (351 líneas) - Trazabilidad de uso de IA
- Configuraciones de `.cursor/` y `.claude/` para trabajo con IA

#### 🎯 Decisiones Arquitecturales Clave (ADRs)

Esta PR documenta **4 decisiones arquitecturales fundamentales**:

**ADR-001: Monolito Modular vs Microservicios**
- ✅ **Decisión**: Monolito modular con 5 bounded contexts (DDD)
- 🎯 **Razón**: Simplicidad en MVP, menor overhead operacional
- 📦 **Módulos**: Conversations, Orders, Addresses, Users, Stores

**ADR-002: Arquitectura DB Híbrida (Supabase + DynamoDB)**
- ✅ **Decisión**: Supabase para datos relacionales + DynamoDB para mensajes
- 🎯 **Razón**: PostgreSQL ideal para entidades + DynamoDB para alta volumetría
- 🔐 **Ventaja**: RLS (Row Level Security) nativo en Supabase para multi-tenancy

**ADR-003: NestJS como Framework Backend**
- ✅ **Decisión**: NestJS + TypeScript
- 🎯 **Razón**: Arquitectura modular nativa, soporte DDD, inyección de dependencias
- 🏗️ **Patrón**: Hexagonal architecture (Ports & Adapters)

**ADR-004: OpenAI GPT-4 para Conversaciones**
- ✅ **Decisión**: OpenAI GPT-4 como motor conversacional
- 🎯 **Razón**: Mejor comprensión de contexto, multiidioma nativo, "tools calling"
- 🔄 **Alternativas consideradas**: Claude, Gemini, modelos open-source

#### 🏗️ Estructura del Proyecto Definida

```
AI4Devs-finalproject/
├── .cursor/                    # Configuración Cursor IDE
│   ├── commands/              # Comandos reutilizables
│   └── skills/                # Skills de OPENSPEC
├── memory-bank/                # Sistema de contexto persistente
│   ├── project-context/       # Síntesis del proyecto
│   ├── architecture/          # ADRs
│   └── references/            # Índices de navegación
├── openspec/                   # Framework de desarrollo
│   ├── schemas/               # Schemas de workflows
│   └── specs/                 # Especificaciones técnicas
├── Adresles_Business.md        # Documento maestro (2170 líneas)
├── prompts.md                  # Histórico de prompts IA
├── readme.md                   # Documentación principal
└── .gitignore                  # Configuración Git
```

#### 🔍 Commits Incluidos (11 total)

1. `70dabd4` - Format README tables and whitespace cleanup
2. `1477a6d` - Actualización del README.md para Adresles
3. `c64e07f` - Redefinición del MVP de Adresles con enfoque mock
4. `03e8cf9` - Implementación del Memory-Bank para Adresles
5. `94473cb` - Expand Adresles system design documentation
6. `6be6b82` - Add initial documentation for Adresles system design
7. `b899c94` - Enhance my-workflow schema.yaml with improved instructions
8. `d22b9fa` - Integración de AI-SPECS de Lidr con OPENSPEC
9. `5428af2` - Implementación y Configuración de OPEN SPEC
10. `7eec2bb` - Remove WooCommerce plugin ignore rule from .gitignore
11. `6d3544a` - Add comprehensive .gitignore file

#### 💡 Impacto en el Proyecto

**Corto Plazo (Inmediato)**:
- ✅ Base documentada para empezar implementación
- ✅ Workflow de desarrollo estructurado con OPENSPEC
- ✅ Claridad total sobre arquitectura y decisiones técnicas

**Medio Plazo (2-4 semanas)**:
- ✅ Implementación del MVP siguiendo especificaciones
- ✅ Consistencia en código gracias a standards definidos
- ✅ Reducción de tiempo de desarrollo por contexto claro

**Largo Plazo (Post-MVP)**:
- ✅ Fácil onboarding de nuevos desarrolladores
- ✅ Base sólida para migración a microservicios si es necesario
- ✅ Documentación técnica que evoluciona con el código

#### 🎓 Aprendizajes y Buenas Prácticas Aplicadas

1. **Documentación como código**: Todos los documentos versionados con Git
2. **ADRs para decisiones**: Registro del "por qué" de cada decisión arquitectural
3. **Separación de concerns**: Documentación de negocio vs documentación técnica
4. **Onboarding optimizado**: Memory-Bank permite arrancar rápido en nuevas sesiones
5. **Workflow estructurado**: OPENSPEC garantiza consistencia en futuros desarrollos

#### 🎯 Conclusión

Esta Pull Request representa **la fundación completa del proyecto Adresles**. No contiene código de aplicación, pero establece:

1. ✅ **Qué se va a construir** (Adresles_Business.md)
2. ✅ **Cómo se va a construir** (OPENSPEC + Standards)
3. ✅ **Por qué se toman ciertas decisiones** (ADRs en Memory-Bank)
4. ✅ **Cómo mantener contexto** (Memory-Bank)

**Este es el trabajo previo necesario para un desarrollo exitoso**. Invertir tiempo en diseño, arquitectura y documentación evita refactorizaciones costosas después.

> 📄 **Documentación completa**: [PR 20260210.md](./PR%2020260210.md)

---

### **Pull Request 2:**

### **Pull Request 3:**
