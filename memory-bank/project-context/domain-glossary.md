# Glosario del Dominio - Adresles

> **Última actualización**: 2026-02-07  
> **Documento fuente**: [Adresles_Business.md - Glosario](../../Adresles_Business.md#glosario)

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

#### **Checkout Adresles**
Proceso de compra simplificado donde el usuario solo introduce nombre y teléfono (sin dirección).

#### **Checkout Tradicional**
Proceso de compra estándar donde el usuario introduce manualmente todos los datos, incluyendo la dirección completa.

#### **Conversation** (Conversación)
Interacción entre el usuario y el agente IA para obtener la dirección de entrega. Se estructura en mensajes (messages).

#### **User Journey**
Camino específico que sigue un usuario según su contexto (registrado/no registrado, con/sin dirección guardada, compra normal/regalo).

#### **Modo Regalo** (Gift Mode)
Funcionalidad que permite al comprador enviar un pedido a otra persona sin conocer su dirección. El sistema contacta al destinatario para obtenerla.

#### **Reminder Flow** (Flujo de Recordatorios)
Sistema automático que envía recordatorios al usuario si no responde tras 15 minutos de inactividad en la conversación.

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
Tipo de conversación: `INFORMATION`, `GET_ADDRESS`, `REGISTER`, `GIFT_NOTIFICATION`, `SUPPORT`.

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
- `WAITING_USER`: Esperando respuesta del usuario
- `COMPLETED`: Conversación finalizada exitosamente
- `ESCALATED`: Escalada a soporte humano
- `TIMEOUT`: Sin respuesta tras múltiples reminders

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

## 🔗 Referencias

- **Glosario completo**: [Adresles_Business.md - Sección 6](../../Adresles_Business.md#glosario)
- **Casos de uso detallados**: [Adresles_Business.md - Fase 2](../../Adresles_Business.md#fase-2-casos-de-uso)
- **Modelo de datos**: [Adresles_Business.md - Fase 3](../../Adresles_Business.md#fase-3-modelado-de-datos)
- **Backend Standards**: [openspec/specs/backend-standards.mdc](../../openspec/specs/backend-standards.mdc)

---

**Última actualización**: 2026-02-07  
**Mantenido por**: Sergio  
**Evoluciona con**: Cada nuevo término del dominio que surja durante el desarrollo
