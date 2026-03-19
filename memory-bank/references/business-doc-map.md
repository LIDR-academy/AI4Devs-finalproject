# Business Document Map - Adresles

> **Mapa navegable del documento [Adresles_Business.md](../../Adresles_Business.md)**  
> **Documento fuente**: 2170 líneas - v1.3 (10 febrero 2026)  
> **Última actualización**: Casos de Uso redefinidos para MVP con enfoque Mock

Este mapa te ayuda a encontrar rápidamente información específica en el documento de diseño completo.

---

## 🗺️ Navegación por Tema

### Contexto de Negocio

| Tema | Sección | Contenido |
|------|---------|-----------|
| **¿Qué es Adresles?** | [1.1 Descripción del Software](../../Adresles_Business.md#11-descripción-del-software) | Descripción general, características clave, flujo principal |
| **Propuesta de valor** | [1.2 Propuesta de Valor](../../Adresles_Business.md#12-propuesta-de-valor) | Valor para Comprador, eCommerce, Tienda física |
| **Ventajas competitivas** | [1.3 Ventajas Competitivas](../../Adresles_Business.md#13-ventajas-competitivas) | Checkout sin fricción, IA conversacional, validación inteligente, efecto red |
| **Funciones principales** | [1.4 Funciones Principales](../../Adresles_Business.md#14-funciones-principales) | Para Comprador (B2C), para eCommerce (B2B), para Sistema |
| **Modelo de negocio** | [1.5 Lean Canvas](../../Adresles_Business.md#15-lean-canvas) | Canvas completo, pricing, segmentos, métricas |
| **Fórmula de pricing** | [1.8 Fórmula de Pricing](../../Adresles_Business.md#18-fórmula-de-pricing) | Fee variable 2.5%-5%, cálculo detallado |

### User Journeys

| Journey | Sección | Contenido |
|---------|---------|-----------|
| **Journeys completos** | [1.6 User Journeys Detallados](../../Adresles_Business.md#16-user-journeys-detallados) | 5 journeys principales con diagramas |
| **Flujo de reminders** | [1.7 Flujo de Reminders](../../Adresles_Business.md#17-flujo-de-reminders) | ⚠️ **Pendiente para fase post-MVP** |

---

## 🎭 Casos de Uso (MVP Mock)

> ⚠️ **Actualización v1.3**: Casos de Uso rediseñados para MVP con integración mock al eCommerce

| Caso de Uso | Sección | Contenido |
|-------------|---------|-----------|
| **Actores del sistema** | [2.1 Actores del Sistema](../../Adresles_Business.md#21-actores-del-sistema) | Incluye Mock UI/Admin, Sistema Mock eCommerce |
| **CU-01: Procesar Compra Mock** | [2.2 Caso de Uso 1](../../Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock) | Entrada JSON mock, incluye FA-1 Modo Regalo y FA-2 Compra Tradicional |
| **CU-02: Conversación IA** | [2.3 Caso de Uso 2](../../Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación) | Obtención dirección, validación Google Maps real, sin reminders automáticos |
| **CU-03: Registro Voluntario** | [2.4 Caso de Uso 3](../../Adresles_Business.md#24-caso-de-uso-3-solicitud-de-registro-voluntario-en-adresles) | **NUEVO**: Invitación a registro en Adresles post-compra |
| **Matriz de trazabilidad** | [2.5 Matriz de Trazabilidad](../../Adresles_Business.md#25-matriz-de-trazabilidad-casos-de-uso---requisitos) | Actualizada con nuevos requisitos mock |

---

## 💾 Modelado de Datos

| Tema | Sección | Contenido |
|------|---------|-----------|
| **Análisis de BD** | [3.1 Análisis de Base de Datos](../../Adresles_Business.md#31-análisis-de-base-de-datos-dynamodb-vs-alternativas) | Comparativa DynamoDB vs Supabase vs Híbrido |
| **Modelo E-R** | [3.2 Modelo Entidad-Relación](../../Adresles_Business.md#32-modelo-entidad-relación) | Diagrama Mermaid completo con todas las entidades |
| **Diccionario de datos** | [3.3 Diccionario de Datos](../../Adresles_Business.md#33-diccionario-de-datos) | Tablas detalladas: atributos, tipos, restricciones |
| **Política de retención** | [3.4 Política de Retención](../../Adresles_Business.md#34-política-de-retención-de-datos) | 90 días mensajes, 2 años metadata, 7 años pedidos |
| **Diagramas de estados** | [3.5 Diagramas de Estados](../../Adresles_Business.md#35-diagramas-de-estados) | Estados de Order, Conversation, GiftRecipient |

### Tablas Específicas (Diccionario de Datos)

- **ecommerce** (Supabase)
- **store** (Supabase)
- **plugin_config** (Supabase)
- **user** (Supabase)
- **address** (Supabase)
- **order** (Supabase)
- **order_address** (Supabase - Snapshot inmutable)
- **gift_recipient** (Supabase)
- **conversation** (Supabase)
- **conversation_metadata** (Supabase)
- **message** (DynamoDB - Alta volumetría)

---

## 🏗️ Arquitectura y Diseño

| Tema | Sección | Contenido |
|------|---------|-----------|
| **Visión general** | [4.1 Visión General de la Arquitectura](../../Adresles_Business.md#41-visión-general-de-la-arquitectura) | Decisión Monolito Modular, justificación |
| **C4 - Contexto** | [4.2 Diagrama C4 Nivel 1](../../Adresles_Business.md#42-diagrama-c4---nivel-1-contexto-del-sistema) | Vista externa del sistema |
| **C4 - Contenedores** | [4.3 Diagrama C4 Nivel 2](../../Adresles_Business.md#43-diagrama-c4---nivel-2-contenedores) | API, Worker, Frontends, BD, Redis |
| **C4 - Componentes** | [4.4 Diagrama C4 Nivel 3](../../Adresles_Business.md#44-diagrama-c4---nivel-3-componentes-módulo-conversations) | Detalle módulo Conversations |
| **Estructura del proyecto** | [4.5 Estructura del Proyecto](../../Adresles_Business.md#45-estructura-del-proyecto) | Monorepo pnpm + Turborepo, carpetas completas |
| **Infraestructura** | [4.6 Diagrama de Infraestructura](../../Adresles_Business.md#46-diagrama-de-infraestructura-y-deployment) | AWS Lightsail, Docker, Caddy 2, servicios managed (Business.md dice Traefik — ver [ADR-011](../architecture/011-docker-ecr-lightsail-caddy.md)) |
| **Docker Compose** | [4.7 Docker Compose](../../Adresles_Business.md#47-docker-compose---configuración) | Configuración completa YAML |
| **Diagramas de secuencia** | [4.8 Diagramas de Secuencia](../../Adresles_Business.md#48-diagramas-de-secuencia) | Secuencia 1: Procesar Compra Mock (actualizado), Secuencia 2 eliminada |
| **CI/CD Pipeline** | [4.9 CI/CD Pipeline](../../Adresles_Business.md#49-cicd-pipeline-github-actions) | GitHub Actions workflow completo |
| **Seguridad** | [4.10 Seguridad](../../Adresles_Business.md#410-seguridad) | RLS, API Keys, Webhooks, HTTPS, Rate limiting |
| **Monitorización** | [4.11 Monitorización](../../Adresles_Business.md#411-monitorización-y-observabilidad) | Estrategia futura (Grafana, Prometheus) |
| **API Endpoints** | [4.12 API Endpoints Principales](../../Adresles_Business.md#412-api-endpoints-principales) | Especificación OpenAPI (YAML completo) |

---

## 📊 Decisiones y Glosario

| Tema | Sección | Contenido |
|------|---------|-----------|
| **Registro de Decisiones** | [Sección 5](../../Adresles_Business.md#registro-de-decisiones) | Tabla completa con 21 decisiones (30/01/2026) |
| **Glosario** | [Sección 6](../../Adresles_Business.md#glosario) | Términos clave del dominio y técnicos |

---

## 🔍 Búsqueda Rápida por Concepto

### Tecnologías

- **Node.js + NestJS**: [4.1](../../Adresles_Business.md#41-visión-general-de-la-arquitectura), [4.5](../../Adresles_Business.md#45-estructura-del-proyecto)
- **Supabase**: [3.1](../../Adresles_Business.md#31-análisis-de-base-de-datos-dynamodb-vs-alternativas), [3.3](../../Adresles_Business.md#33-diccionario-de-datos)
- **DynamoDB**: [3.1](../../Adresles_Business.md#31-análisis-de-base-de-datos-dynamodb-vs-alternativas), [3.3 Messages](../../Adresles_Business.md#33-diccionario-de-datos)
- **OpenAI GPT-4o-mini** (req. original GPT-4): [1.1](../../Adresles_Business.md#11-descripción-del-software), [Decisión 30/01](../../Adresles_Business.md#registro-de-decisiones), [ADR-004](../architecture/004-openai-gpt4.md)
- **Google Maps API**: [1.3](../../Adresles_Business.md#13-ventajas-competitivas), [2.3 CU-02](../../Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación)
- **Docker + Caddy** (Business.md dice Traefik, producción real usa Caddy): [4.6](../../Adresles_Business.md#46-diagrama-de-infraestructura-y-deployment), [4.7](../../Adresles_Business.md#47-docker-compose---configuración), [ADR-011](../architecture/011-docker-ecr-lightsail-caddy.md)
- **BullMQ + Redis**: [4.3](../../Adresles_Business.md#43-diagrama-c4---nivel-2-contenedores), [Decisión 30/01](../../Adresles_Business.md#registro-de-decisiones)

### Funcionalidades

- **Procesar Compra Mock**: [2.2 CU-01](../../Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock) - Entrada manual JSON
- **Conversación IA**: [2.3 CU-02](../../Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación), [4.4 C4 Componentes](../../Adresles_Business.md#44-diagrama-c4---nivel-3-componentes-módulo-conversations)
- **Modo Regalo**: [2.2 CU-01 FA-1](../../Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock) - Integrado como flujo alternativo
- **Compra Tradicional**: [2.2 CU-01 FA-2](../../Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock) - Con dirección incluida
- **Registro Voluntario**: [2.4 CU-03](../../Adresles_Business.md#24-caso-de-uso-3-solicitud-de-registro-voluntario-en-adresles) - **NUEVO**
- **Validación de direcciones**: [1.3](../../Adresles_Business.md#13-ventajas-competitivas), [2.3 CU-02](../../Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación) - Google Maps real
- **Sistema de Reminders**: [1.7](../../Adresles_Business.md#17-flujo-de-reminders) - ⚠️ Pendiente post-MVP
- **Libreta de Direcciones**: [1.3](../../Adresles_Business.md#13-ventajas-competitivas), [3.2 Modelo E-R](../../Adresles_Business.md#32-modelo-entidad-relación)
- **Multi-idioma**: [1.1](../../Adresles_Business.md#11-descripción-del-software), [1.3](../../Adresles_Business.md#13-ventajas-competitivas)
- **Multi-tenant (RLS)**: [3.1](../../Adresles_Business.md#31-análisis-de-base-de-datos-dynamodb-vs-alternativas), [4.10](../../Adresles_Business.md#410-seguridad)

### Datos y Modelos

- **Tabla Users**: [3.3 Diccionario](../../Adresles_Business.md#33-diccionario-de-datos) (buscar "user")
- **Tabla Orders**: [3.3 Diccionario](../../Adresles_Business.md#33-diccionario-de-datos) (buscar "order")
- **Tabla Addresses**: [3.3 Diccionario](../../Adresles_Business.md#33-diccionario-de-datos) (buscar "address")
- **Tabla Messages**: [3.3 Diccionario](../../Adresles_Business.md#33-diccionario-de-datos) (buscar "message")
- **Estados de Order**: [3.5 Diagramas de Estados](../../Adresles_Business.md#35-diagramas-de-estados)
- **Estados de Conversation**: [3.5 Diagramas de Estados](../../Adresles_Business.md#35-diagramas-de-estados)

---

## 📐 Diagramas por Tipo

### Diagramas Mermaid

- **Flujo Principal Simplificado**: [1.1](../../Adresles_Business.md#11-descripción-del-software)
- **Modelo Entidad-Relación**: [3.2](../../Adresles_Business.md#32-modelo-entidad-relación)
- **Diagramas de Estados**: [3.5](../../Adresles_Business.md#35-diagramas-de-estados)
- **Diagrama C4 Nivel 1**: [4.2](../../Adresles_Business.md#42-diagrama-c4---nivel-1-contexto-del-sistema)
- **Diagrama C4 Nivel 2**: [4.3](../../Adresles_Business.md#43-diagrama-c4---nivel-2-contenedores)
- **Diagrama C4 Nivel 3**: [4.4](../../Adresles_Business.md#44-diagrama-c4---nivel-3-componentes-módulo-conversations)
- **Infraestructura**: [4.6](../../Adresles_Business.md#46-diagrama-de-infraestructura-y-deployment)
- **Secuencia Procesar Compra Mock**: [4.8](../../Adresles_Business.md#48-diagramas-de-secuencia) - Actualizado con Mock UI
- **Secuencia Reminders**: ~~Eliminada~~ - Pendiente post-MVP

### Diagramas PlantUML

- **Casos de Uso CU-01**: [2.2](../../Adresles_Business.md#22-caso-de-uso-1-procesar-compra-desde-ecommerce-mock) - Procesar Compra Mock
- **Casos de Uso CU-02**: [2.3](../../Adresles_Business.md#23-caso-de-uso-2-obtención-de-dirección-por-conversación) - Conversación IA
- **Casos de Uso CU-03**: [2.4](../../Adresles_Business.md#24-caso-de-uso-3-solicitud-de-registro-voluntario-en-adresles) - **NUEVO**: Registro Voluntario

### Diagramas ASCII

- **Lean Canvas**: [1.5](../../Adresles_Business.md#15-lean-canvas)

---

## 🎯 Uso Recomendado de este Mapa

### Para empezar un nuevo feature:
1. Revisa el **User Journey** correspondiente ([1.6](../../Adresles_Business.md#16-user-journeys-detallados))
2. Consulta el **Caso de Uso** detallado ([Sección 2](../../Adresles_Business.md#fase-2-casos-de-uso))
3. Identifica las **tablas afectadas** ([3.3](../../Adresles_Business.md#33-diccionario-de-datos))
4. Revisa el **módulo correspondiente** en arquitectura ([4.4](../../Adresles_Business.md#44-diagrama-c4---nivel-3-componentes-módulo-conversations))

### Para entender una decisión arquitectural:
1. Busca en **Registro de Decisiones** ([Sección 5](../../Adresles_Business.md#registro-de-decisiones))
2. Revisa el **ADR correspondiente** en [memory-bank/architecture/](../architecture/)

### Para implementar un endpoint:
1. Revisa **API Endpoints** ([4.12](../../Adresles_Business.md#412-api-endpoints-principales))
2. Consulta **Backend Standards** ([.cursor/rules/backend-standards.mdc](../../.cursor/rules/backend-standards.mdc))

---

**Última actualización**: 2026-02-10  
**Documento fuente**: Adresles_Business.md v1.3 (10 febrero 2026)  
**Cambios principales v1.3**:
- CU-01 redefinido como "Procesar Compra Mock" con entrada JSON manual
- Viejo CU-03 (Modo Regalo) integrado como FA-1 dentro de CU-01
- Nuevo CU-03: "Solicitud de Registro Voluntario en Adresles"
- Sistema de Reminders marcado como pendiente para post-MVP
- Actores actualizados con Mock UI/Admin y Sistema Mock eCommerce

**Mantenido por**: Sergio
