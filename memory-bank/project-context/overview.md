# Adresles - Visión General del Proyecto

> **Última actualización**: 2026-03-19  
> **Documento fuente**: [Adresles_Business.md](../../Adresles_Business.md) - Secciones 1.1-1.6  
> ✅ **MVP en Producción**: Backend en `backend.adresles.com` (Lightsail), Dashboard en `simulator.adresles.com` (Vercel)

---

## 🎯 Qué es Adresles

**Adresles** es una plataforma SaaS B2B2C que revoluciona el checkout en eCommerce eliminando la fricción de introducir manualmente la dirección de entrega.

### Propuesta Central

> **"Compra solo con nombre + teléfono, nosotros obtenemos tu dirección conversando contigo"**

El comprador completa el checkout indicando únicamente **nombre** y **teléfono**. Después, un **agente IA conversacional (OpenAI GPT-4o-mini)** contacta al usuario para obtener la dirección mediante conversación natural, actualizándola automáticamente en el eCommerce.

---

## 🔄 Flujo Principal

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Usuario  │────▶│  2. Checkout │────▶│ 3. Adresles  │
│    Compra    │     │   Rápido     │     │   Procesa    │
└──────────────┘     │ (2 campos)   │     └──────────────┘
                     └──────────────┘            │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 6. eCommerce │◀────│ 5. Dirección │◀────│ 4. App Chat  │
│  Actualizado │     │   Validada   │     │  Adresles IA │
└──────────────┘     │  (GMaps API) │     └──────────────┘
                     └──────────────┘
```

**Detalle del Flujo**: Ver [Adresles_Business.md - Sección 1.1](../../Adresles_Business.md#11-descripción-del-software)

---

## 💎 Propuesta de Valor

| Stakeholder | Beneficio |
|-------------|-----------|
| **Comprador** | • Checkout ultra-rápido (2 campos vs 12 campos tradicionales)<br>• Libreta de direcciones centralizada<br>• Conversación natural en su idioma |
| **eCommerce** | • Reducción del abandono de carrito<br>• Mayor tasa de conversión<br>• Diferenciación competitiva UX<br>• Prueba gratuita 1 mes |
| **Sistema** | • Efecto red: Más eCommerce → Más usuarios con direcciones pre-guardadas |

**Detalle completo**: Ver [Adresles_Business.md - Sección 1.2](../../Adresles_Business.md#12-propuesta-de-valor)

---

## 🚀 Características Clave

### Para el Comprador
- ✅ Checkout Adresles (solo nombre + teléfono)
- ✅ Conversación IA en lenguaje natural
- ✅ Libreta de direcciones reutilizable
- ✅ **Modo Regalo** (comprar sin conocer dirección del destinatario)
- ✅ Multi-idioma automático

### Para el eCommerce
- ✅ Plugin de integración (WooCommerce → PrestaShop → Magento → Shopify)
- ✅ Dashboard de gestión de pedidos
- ✅ Webhook de sincronización automática
- ✅ API REST para integración custom

### Inteligencia del Sistema
- ✅ **Validación con Google Maps API** (normalización + geocoding) - **Implementación real**
- ✅ **Detección inteligente de datos faltantes** (escalera, bloque, piso, puerta) - **Implementación real**
- 🔄 **Sistema de Reminders** (tras 15 min sin respuesta) - **Pendiente post-MVP**
- ✅ **Escalado a Soporte** (manual cuando IA no puede resolver)

**Detalle completo**: Ver [Adresles_Business.md - Sección 1.4](../../Adresles_Business.md#14-funciones-principales)

---

## 🎭 User Journeys Principales

### Journey 1: Primera Compra (Usuario NO registrado)
Usuario completa checkout tradicional → Adresles le invita a registrarse

### Journey 2: Compra Adresles (Usuario Registrado)
- **Con dirección favorita**: Sistema propone dirección guardada (opción de cambiar)
- **Sin dirección favorita**: IA solicita nueva dirección

### Journey 3: Compra Adresles (Usuario NO registrado)
IA solicita dirección + invita a registrarse para futuras compras

### Journey 4: Modo Regalo 🎁
- Comprador indica nombre + teléfono del **destinatario**
- IA contacta al destinatario para obtener dirección
- IA informa al comprador del progreso
- Si destinatario está registrado → Propone dirección favorita

**Detalle completo**: Ver [Adresles_Business.md - Sección 1.6](../../Adresles_Business.md#16-user-journeys-detallados)

---

## 💰 Modelo de Negocio

### Pricing (Fee Variable por Transacción)

| Importe Compra | Fee % | Ejemplo |
|----------------|-------|---------|
| ≤ 10€ | 5.0% | 10€ → 0.50€ |
| 55€ | 3.75% | 55€ → 2.06€ |
| ≥ 100€ | 2.5% | 100€ → 2.50€ |

**Fórmula**: `fee% = 5 - (2.5 × (importe - 10) / 90)` (lineal entre 10€ y 100€)

**Prueba gratuita**: 1 mes sin coste

**Detalle completo**: Ver [Adresles_Business.md - Sección 1.5 (Lean Canvas)](../../Adresles_Business.md#15-lean-canvas)

---

## 🌍 Alcance y Roadmap

### Alcance Inicial (MVP) — Desplegado en Producción

> ✅ **Estado (marzo 2026)**: MVP funcional desplegado. Integración con eCommerce es mock (entrada JSON), pero el core del producto (IA + validación) funciona en producción.

**Implementación Real (en producción)**:
- ✅ Conversación IA con OpenAI GPT-4o-mini (abstracción `ILLMService` — intercambiable)
- ✅ Validación de direcciones con Google Maps API (normalización, detección de edificios)
- ✅ Backend Node.js + NestJS 10 (API) + Worker BullMQ (Node.js puro)
- ✅ Frontend Dashboard Admin + Simulador (`apps/web-admin` — Next.js 16, Tailwind v4, Shadcn/ui)
- ✅ Infraestructura: AWS Lightsail + Caddy HTTPS + ECR + GitHub Actions CI/CD
- ✅ DynamoDB en AWS con entornos separados (dev `eu-west-1`, prod `eu-central-1`)

**Implementación Mock (para el MVP)**:
- 🔄 Entrada manual de JSON para simular compras del eCommerce (`POST /api/mock/orders`)
- 🔄 Simulación de actualización de dirección al eCommerce (log/notificación)
- 🔄 Sin sistema de reminders automáticos (post-MVP)
- 🔄 Chat App (`apps/web-chat/`) no implementada — simulación integrada en Dashboard Admin

### Roadmap de Integraciones
1. **MVP (Fase 0)**: Integración Mock - Entrada manual JSON
2. **Fase 1**: Plugin WooCommerce real
3. **Fase 2**: PrestaShop
4. **Fase 3**: Magento
5. **Fase 4**: Shopify

---

## 🎯 Actores del Sistema (MVP Mock)

| Actor | Descripción |
|-------|-------------|
| **Buyer** | Comprador que realiza el pedido y proporciona dirección |
| **Recipient** | Destinatario del pedido (en modo regalo) |
| **Admin/Mock UI** | **[MVP]** Ingresa JSON de compra mock + Dashboard web para visualizar pedidos, usuarios y chats |
| **Mock eCommerce** | **[MVP]** Simulación de tienda online para actualizaciones |
| **Adresles System** | Sistema backend (orquestador, IA, validador) |
| **OpenAI GPT-4o-mini** | **[Real]** Motor de conversación inteligente (abstracción `ILLMService`) |
| **Google Maps API** | **[Real]** Validación y normalización de direcciones |

**Detalle completo**: Ver [Adresles_Business.md - Sección 2.1](../../Adresles_Business.md#21-actores-del-sistema)

---

## 📊 Navegación Rápida al Business.md

| Necesito información sobre... | Ir a sección del Business.md |
|-------------------------------|------------------------------|
| Propuesta de valor detallada | [1.2 Propuesta de Valor](../../Adresles_Business.md#12-propuesta-de-valor) |
| Ventajas competitivas | [1.3 Ventajas Competitivas](../../Adresles_Business.md#13-ventajas-competitivas) |
| Funciones principales | [1.4 Funciones Principales](../../Adresles_Business.md#14-funciones-principales) |
| Lean Canvas completo | [1.5 Lean Canvas](../../Adresles_Business.md#15-lean-canvas) |
| User Journeys detallados | [1.6 User Journeys](../../Adresles_Business.md#16-user-journeys-detallados) |
| Flujo de Reminders | [1.7 Flujo de Reminders](../../Adresles_Business.md#17-flujo-de-reminders) |
| Casos de uso con diagramas | [Fase 2: Casos de Uso](../../Adresles_Business.md#fase-2-casos-de-uso) |
| Modelo de datos E-R | [3.2 Modelo E-R](../../Adresles_Business.md#32-modelo-entidad-relación) |
| Diccionario de datos | [3.3 Diccionario de Datos](../../Adresles_Business.md#33-diccionario-de-datos) |
| Arquitectura C4 (todos los niveles) | [4.2-4.4 Diagramas C4](../../Adresles_Business.md#42-diagrama-c4---nivel-1-contexto-del-sistema) |
| Estructura del proyecto | [4.5 Estructura del Proyecto](../../Adresles_Business.md#45-estructura-del-proyecto) |
| Infraestructura y deployment | [4.6 Infraestructura](../../Adresles_Business.md#46-diagrama-de-infraestructura-y-deployment) |
| Diagramas de secuencia | [4.8 Diagramas de Secuencia](../../Adresles_Business.md#48-diagramas-de-secuencia) |
| CI/CD Pipeline | [4.9 CI/CD](../../Adresles_Business.md#49-cicd-pipeline-github-actions) |
| API Endpoints | [4.12 API Endpoints](../../Adresles_Business.md#412-api-endpoints-principales) |
| Registro de Decisiones histórico | [Sección 5](../../Adresles_Business.md#registro-de-decisiones) |
| Glosario completo | [Sección 6 Glosario](../../Adresles_Business.md#glosario) |

---

## 🛠️ Stack Tecnológico (Resumen)

Para detalles completos, ver **[Tech Stack](./tech-stack.md)**

- **Backend API**: Node.js + NestJS 10 + TypeScript (puerto 3000)
- **Worker**: Node.js puro + BullMQ + OpenAI (sin NestJS)
- **Frontend**: React 19 + Next.js 16 (Dashboard Admin + Simulador — única app frontend del MVP)
- **Base de Datos**: Supabase (PostgreSQL) + AWS DynamoDB (tablas por entorno)
- **IA**: OpenAI GPT-4o-mini (abstracción `ILLMService`)
- **Validación**: Google Maps API (Geocoding + normalización)
- **Infraestructura**: Docker Compose + Caddy 2 (HTTPS automático)
- **Deployment**: AWS Lightsail `backend.adresles.com` + Vercel `simulator.adresles.com`
- **CI/CD**: GitHub Actions → AWS ECR → SSH deploy

---

## 📚 Decisiones Arquitecturales Clave

| Decisión | ADR | Resumen |
|----------|-----|---------|
| Arquitectura general | [ADR-001](../architecture/001-monolith-modular.md) | Monolito modular para MVP |
| Base de datos | [ADR-002](../architecture/002-supabase-dynamodb.md) | Híbrida: Supabase + DynamoDB |
| Framework backend | [ADR-003](../architecture/003-nestjs-backend.md) | NestJS con SSE + Redis Pub/Sub |
| Motor conversacional | [ADR-004](../architecture/004-openai-gpt4.md) | OpenAI GPT-4o-mini (abstracción `ILLMService`) |
| Colas asíncronas | [ADR-005](../architecture/005-bullmq-worker-conversations.md) | BullMQ + Worker dedicado |
| Real-time | [ADR-006](../architecture/006-sse-redis-pubsub.md) | SSE + Redis Pub/Sub |
| Tipos compartidos | [ADR-007](../architecture/007-shared-types-package.md) | `packages/shared-types` |
| Schema Prisma | [ADR-009](../architecture/009-prisma-db-package.md) | `packages/prisma-db` (fuente única) |
| DynamoDB AWS | [ADR-010](../architecture/010-dynamodb-aws-multienv.md) | Entornos separados + IAM mínimo privilegio |
| Producción | [ADR-011](../architecture/011-docker-ecr-lightsail-caddy.md) | Docker + ECR + Lightsail + Caddy |

---

## 🎓 Dominios DDD

El sistema se estructura en dominios siguiendo Domain-Driven Design:

1. **Conversations** (núcleo) - Orquestación de conversaciones IA
2. **Orders** - Gestión de pedidos
3. **Addresses** - Validación y gestión de direcciones
4. **Users** - Usuarios y autenticación
5. **Stores** - Tiendas y configuración eCommerce

**Detalle completo**: Ver [Backend Standards - DDD](../../.cursor/rules/backend-standards.mdc)

---

## 📝 Documento Completo

Para análisis exhaustivo, arquitectura detallada, diagramas C4 completos, y especificaciones técnicas:

👉 **[Adresles_Business.md](../../Adresles_Business.md)** (2130 líneas)

---

**Última actualización**: 2026-03-19  
**Mantenido por**: Sergio  
**Documento fuente**: Adresles_Business.md v1.3 (10 febrero 2026)  
**Cambios v1.3**: MVP redefinido con enfoque mock para integración eCommerce, enfocándose en el core (IA + validación)  
**Cambios 2026-02-23**: Dashboard Admin (`apps/web-admin`) implementado — visualización de pedidos, usuarios y conversaciones  
**Cambios 2026-03-19**: MVP en producción — GPT-4→GPT-4o-mini con `ILLMService`; infraestructura Lightsail+Caddy+ECR; tabla ADRs ampliada a 001-011; alcance MVP actualizado a estado real de producción
