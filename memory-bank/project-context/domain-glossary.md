# Glosario del Dominio - Adresles

> **Última actualización**: 2026-02-10  
> **Documento fuente**: [Adresles_Business.md - Glosario](../../Adresles_Business.md#glosario)  
> ⚠️ **Actualizado**: Términos relacionados con MVP Mock añadidos

---

## 📖 Términos del Dominio

### Entidades y Conceptos Clave

#### **Adresles**
Nombre del producto. Plataforma SaaS B2B2C que permite checkout sin introducir dirección manualmente.

#### **Buyer** (Comprador)
Usuario que realiza una compra en un eCommerce integrado con Adresles.

#### **Recipient** (Destinatario)
Persona que recibe un pedido en el modo regalo. Puede ser diferente del Buyer.

#### **Store** (Tienda)
Una tienda online de un eCommerce registrado en Adresles. Un eCommerce puede tener múltiples stores (identificadas por URL única).

#### **eCommerce**
Plataforma de comercio electrónico (WooCommerce, PrestaShop, Magento, Shopify). En el contexto de negocio, representa una razón social única que puede tener varias tiendas.

#### **Plugin**
Módulo de integración que se instala en el eCommerce para habilitar el checkout Adresles.

---

### Flujos y Procesos

#### **Checkout Adresles** (Modo Adresles)
Proceso de compra simplificado donde el usuario solo introduce nombre y teléfono (sin dirección). En el MVP, se simula mediante entrada JSON con `mode: "adresles"`.

#### **Checkout Tradicional** (Modo Tradicional)
Proceso de compra estándar donde el usuario introduce manualmente todos los datos, incluyendo la dirección completa. En el MVP, se simula mediante entrada JSON con `mode: "tradicional"` y dirección incluida.

#### **Conversation** (Conversación)
Interacción entre el usuario y el agente IA para obtener la dirección de entrega. Se estructura en mensajes (messages).

#### **User Journey**
Camino específico que sigue un usuario según su contexto (registrado/no registrado, con/sin dirección guardada, compra normal/regalo).

#### **Modo Regalo** (Gift Mode)
Funcionalidad que permite al comprador enviar un pedido a otra persona sin conocer su dirección. El sistema contacta al destinatario para obtenerla. En el MVP, se simula mediante JSON con `is_gift: true`.

#### **Reminder Flow** (Flujo de Recordatorios)
> ⚠️ **Pendiente post-MVP**: Sistema automático que enviaría recordatorios al usuario si no responde tras 15 minutos. No implementado en MVP inicial.

#### **Mock Order Entry** (Entrada Mock de Pedido)
Proceso de ingresar manualmente un JSON con datos de compra simulando la llegada desde un eCommerce real. Incluye: tienda, número de pedido, datos del comprador, dirección (opcional), modo de compra, datos del regalo (opcional).

#### **Mock eCommerce Update** (Actualización Mock al eCommerce)
Simulación de la actualización de dirección al sistema eCommerce, implementado como log estructurado o notificación en el MVP.

---

### Componentes Técnicos

#### **Conversation Orchestrator**
Servicio backend que gestiona el flujo de conversaciones, selecciona el journey apropiado y coordina con OpenAI.

#### **Address Validator**
Servicio que valida y normaliza direcciones usando Google Maps API, detectando datos faltantes (piso, puerta, etc.).

#### **Worker**
Proceso asíncrono (BullMQ) que ejecuta tareas en background (envío de reminders, procesamiento de webhooks).

#### **Webhook**
Notificación HTTP que el eCommerce envía a Adresles cuando se crea un nuevo pedido.

#### **Plugin Configuration**
Configuración específica de cada tienda (API keys, webhook URLs, opciones de personalización).

---

### Datos y Modelos

#### **Libreta de Direcciones** (Address Book)
Colección de direcciones guardadas por un usuario en Adresles, reutilizables en cualquier eCommerce integrado.

#### **Dirección Favorita** (Default Address)
Dirección marcada como predeterminada en la libreta del usuario. Se propone automáticamente en nuevas compras.

#### **Order Address Snapshot**
Copia inmutable de la dirección de un pedido. Persiste incluso si el usuario modifica posteriormente la dirección en su libreta.

#### **Message**
Mensaje individual dentro de una conversación. Puede ser del usuario o del agente IA.

#### **Conversation Type**
Tipo de conversación: 
- `INFORMATION` - Conversación informativa (ej: compra tradicional)
- `GET_ADDRESS` - Obtener dirección de entrega
- `REGISTER` - Invitar/completar registro en Adresles
- `GIFT_NOTIFICATION` - Notificar al comprador sobre estado del regalo
- `SUPPORT` - Escalado a soporte humano

#### **User Type**
Rol del usuario en una conversación: `BUYER` (comprador) o `RECIPIENT` (destinatario regalo).

---

### Estados y Transiciones

#### **Order Status**
Estados del pedido:
- `PENDING_ADDRESS`: Esperando dirección del usuario
- `ADDRESS_CONFIRMED`: Dirección confirmada por el usuario
- `SYNCED`: Dirección sincronizada con eCommerce
- `FAILED`: Error en el proceso
- `CANCELLED`: Pedido cancelado

#### **Conversation Status**
Estados de la conversación:
- `ACTIVE`: Conversación en curso
- `WAITING_RESPONSE`: Esperando respuesta del usuario (sin timeout automático en MVP)
- `COMPLETED`: Conversación finalizada exitosamente
- `ESCALATED`: Escalada manualmente a soporte humano
- `TIMEOUT`: ~~Sin respuesta tras múltiples reminders~~ (No implementado en MVP)

---

### Integraciones Externas

#### **GPT-4**
Modelo de lenguaje de OpenAI usado para generar respuestas conversacionales naturales y entender las respuestas del usuario.

#### **Google Maps API**
Servicio de Google para geocoding, validación y normalización de direcciones.

#### **Supabase**
Plataforma managed de PostgreSQL con Auth, RLS y Realtime. Almacena datos relacionales (users, stores, orders, addresses).

#### **DynamoDB**
Base de datos NoSQL de AWS. Almacena mensajes de conversaciones (alta volumetría).

---

### Arquitectura

#### **Monolito Modular**
Arquitectura elegida para el MVP: un único despliegue con módulos bien delimitados internamente (vs microservicios).

#### **DDD (Domain-Driven Design)**
Enfoque de diseño que estructura el código en dominios: Conversations, Orders, Addresses, Users, Stores.

#### **Agregado** (Aggregate)
Conjunto de entidades y value objects tratados como unidad en DDD. Ejemplo: `Order` + `OrderAddress` + `GiftRecipient`.

#### **Repository Pattern**
Patrón que abstrae el acceso a datos, separando lógica de negocio de lógica de persistencia.

---

### Pricing y Negocio

#### **Fee Variable**
Comisión que Adresles cobra al eCommerce por transacción, calculada como porcentaje del importe total:
- 5% para importes ≤ 10€
- 2.5% para importes ≥ 100€
- Escala lineal entre 10€ y 100€

**Fórmula**: `fee% = 5 - (2.5 × (importe - 10) / 90)`

#### **Trial Period** (Periodo de Prueba)
1 mes gratuito para nuevos eCommerce registrados.

#### **B2B2C**
Modelo de negocio: Business-to-Business-to-Consumer. Adresles vende a eCommerce (B2B), que vende a consumidores finales (B2C).

---

### Seguridad

#### **API Key / API Secret**
Credenciales para autenticar las peticiones del plugin eCommerce al backend Adresles.

#### **Webhook Secret**
Secreto compartido para validar la autenticidad de webhooks (firma HMAC).

#### **Row Level Security (RLS)**
Mecanismo de Supabase que aísla datos entre tenants (tiendas) a nivel de base de datos.

---

### Multiidioma y Multi-moneda

#### **Language Detection**
Detección automática del idioma preferido del usuario basado en interacciones previas o contexto del eCommerce.

#### **Multi-currency**
Soporte de múltiples monedas (EUR, USD, GBP, etc.) desde el inicio del proyecto.

---

## 🆕 Términos Específicos del MVP Mock

#### **Mock UI / Admin Interface**
Interfaz administrativa que permite ingresar manualmente JSONs de compra para simular pedidos del eCommerce durante el MVP.

#### **JSON Order Mock**
Estructura JSON que contiene todos los datos de una compra simulada:
- `store_name`, `store_url`: Identificación de la tienda
- `order_id`, `order_number`: Identificación del pedido
- `buyer`: Datos del comprador (nombre, teléfono, email)
- `mode`: "adresles" o "tradicional"
- `delivery_address`: (opcional) Dirección si modo tradicional
- `is_gift`: Boolean indicando si es regalo
- `gift_recipient`: (opcional) Datos del regalado
- `items`: Lista de productos
- `total_amount`, `currency`: Importe y moneda

#### **Fase 0 (MVP Mock)**
Fase inicial del proyecto donde se mockean las integraciones con eCommerce, enfocándose en validar el core del producto (conversación IA + validación de direcciones con Google Maps).

#### **Registro Voluntario** (Voluntary Registration)
Proceso donde el usuario puede optar por registrarse en Adresles después de completar una compra, para aprovechar beneficios como libreta de direcciones y checkouts más rápidos en futuras compras.

---

## 🔗 Referencias

- **Glosario completo**: [Adresles_Business.md - Sección 6](../../Adresles_Business.md#glosario)
- **Casos de uso detallados**: [Adresles_Business.md - Fase 2](../../Adresles_Business.md#fase-2-casos-de-uso)
- **Modelo de datos**: [Adresles_Business.md - Fase 3](../../Adresles_Business.md#fase-3-modelado-de-datos)
- **Backend Standards**: [openspec/specs/backend-standards.mdc](../../openspec/specs/backend-standards.mdc)

---

**Última actualización**: 2026-02-10  
**Mantenido por**: Sergio  
**Cambios v1.3**: Términos mock añadidos, estados actualizados para MVP sin reminders  
**Evoluciona con**: Cada nuevo término del dominio que surja durante el desarrollo
