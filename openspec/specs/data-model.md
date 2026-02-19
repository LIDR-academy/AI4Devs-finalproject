# Documentación del Modelo de Datos - Adresles

Este documento describe el modelo de datos para **Adresles**, incluyendo descripciones de entidades, definiciones de campos, relaciones y diagramas entidad-relación.

**Ver modelo completo y detallado**: [Adresles_Business.md - Sección 3.2-3.3](../../Adresles_Business.md#32-modelo-entidad-relación)

## Arquitectura de Base de Datos Híbrida

Adresles utiliza dos sistemas de base de datos optimizados para diferentes tipos de datos:

### Supabase (PostgreSQL)
**Propósito**: Datos relacionales con transacciones ACID

Entidades principales:
- `phone` - Números de teléfono normalizados (E.164) compartidos entre entidades
- `ecommerce` - Plataformas de comercio electrónico registradas
- `store` - Tiendas individuales de un eCommerce
- `user` - Usuarios finales (compradores/destinatarios)
- `address` - Direcciones de entrega guardadas
- `order` - Pedidos realizados
- `order_address` - Snapshot inmutable de dirección del pedido
- `gift_recipient` - Información de destinatario regalo
- `plugin_config` - Configuración de plugins por tienda
- `conversation` - Metadata de conversaciones
- `conversation_metadata` - Metadata persistente (2 años)

### DynamoDB
**Propósito**: Mensajes de conversaciones (alta volumetría, TTL automático)

Tabla:
- `adresles-messages` - Mensajes de chat IA-usuario
  - Partition Key: `conversation_id`
  - Sort Key: `timestamp`
  - TTL: 90 días automático

**Decisión arquitectural**: Ver [ADR-002](../../memory-bank/architecture/002-supabase-dynamodb.md)

## Entidades Principales (Supabase)

### 1. Phone

Centraliza la gestión de números de teléfono con validación y normalización E.164. Es una entidad compartida referenciada por `User`, `GiftRecipient` y `OrderAddress`, evitando duplicar la lógica de validación telefónica.

**Campos**:
- `id`: UUID (PK)
- `e164`: VARCHAR (UNIQUE, NOT NULL) - Número en formato E.164 (ej. +34612345678)
- `country_calling_code`: VARCHAR (NOT NULL) - Prefijo país (ej. "34")
- `national_number`: VARCHAR (NOT NULL) - Número nacional sin prefijo
- `country`: VARCHAR - Código ISO del país (ej. "ES")
- `number_type`: ENUM `PhoneNumberType` - Tipo de línea (MOBILE, FIXED_LINE, VOIP, etc.)
- `is_valid`: BOOLEAN (NOT NULL) - Resultado de validación
- `formatted_national`: VARCHAR - Formato nacional (ej. "612 34 56 78")
- `formatted_international`: VARCHAR - Formato internacional (ej. "+34 612 34 56 78")
- `created_at`: TIMESTAMPTZ (NOT NULL, DEFAULT now())

**Enum `PhoneNumberType`**: `MOBILE`, `FIXED_LINE`, `FIXED_LINE_OR_MOBILE`, `TOLL_FREE`, `PREMIUM_RATE`, `SHARED_COST`, `VOIP`, `PERSONAL_NUMBER`, `PAGER`, `UAN`, `VOICEMAIL`

**Reglas de Validación**:
- El campo `e164` es el identificador único del teléfono a nivel de negocio
- Un mismo teléfono puede estar asociado a múltiples usuarios (soft-delete histórico)
- Solo un usuario con `is_deleted = false` puede estar activo para un `phone_id` dado

**Relaciones**:
- `users`: Uno-a-muchos con User (un teléfono puede tener historial de usuarios)
- `gift_recipients`: Uno-a-muchos con GiftRecipient
- `order_addresses`: Uno-a-muchos con OrderAddress

---

### 2. User

Representa usuarios finales del sistema (compradores y destinatarios de regalos). Identificados por su número de teléfono a través de la relación con `Phone`.

**Campos**:
- `id`: UUID (PK)
- `phone_id`: UUID (FK → phone, UNIQUE) - Referencia al teléfono activo del usuario (nullable para permitir soft-delete)
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `email`: VARCHAR(255)
- `preferred_language`: VARCHAR(5) - Idioma detectado
- `is_registered`: BOOLEAN (DEFAULT false)
- `registered_at`: TIMESTAMPTZ
- `last_interaction_at`: TIMESTAMPTZ
- `is_deleted`: BOOLEAN (DEFAULT false) - Soft delete
- `deleted_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ (NOT NULL, DEFAULT now())
- `updated_at`: TIMESTAMPTZ (NOT NULL, DEFAULT now())

**Reglas de Validación**:
- El teléfono sigue siendo el identificador único del usuario, pero ahora a través de la FK `phone_id`
- `phone_id` se pone a `null` al desactivar el usuario (soft-delete), permitiendo que un nuevo usuario asuma ese mismo número
- Solo puede haber un usuario activo (`is_deleted = false`) por número de teléfono
- Usuario puede existir sin estar registrado formalmente

**Relaciones**:
- `phone`: Muchos-a-uno con Phone (nullable)
- `addresses`: Uno-a-muchos con Address
- `orders`: Uno-a-muchos con Order (como comprador)
- `gift_recipients`: Uno-a-muchos con GiftRecipient (como destinatario)

### 2. Address

Representa direcciones de entrega guardadas en la libreta del usuario.

**Campos**:
- `id`: UUID (PK)
- `user_id`: UUID (FK → user, NOT NULL)
- `label`: VARCHAR(100) - Etiqueta amigable (Casa, Trabajo, etc.)
- `full_address`: VARCHAR(500) (NOT NULL)
- `street`: VARCHAR(255) (NOT NULL)
- `number`: VARCHAR(20)
- `block`: VARCHAR(20)
- `staircase`: VARCHAR(20)
- `floor`: VARCHAR(20)
- `door`: VARCHAR(20)
- `additional_info`: VARCHAR(255)
- `postal_code`: VARCHAR(20) (NOT NULL)
- `city`: VARCHAR(100) (NOT NULL)
- `province`: VARCHAR(100)
- `country`: VARCHAR(2) (NOT NULL) - Código ISO
- `gmaps_place_id`: VARCHAR(255) - ID de Google Maps
- `latitude`: DECIMAL(10,8)
- `longitude`: DECIMAL(11,8)
- `is_default`: BOOLEAN (DEFAULT false)
- `is_deleted`: BOOLEAN (DEFAULT false) - Soft delete
- `created_at`: TIMESTAMPTZ

**Validación inteligente**:
- Integración con Google Maps API para normalización
- Detección de datos faltantes (escalera, bloque, piso, puerta) mediante IA

**Relaciones**:
- `user`: Muchos-a-uno con User

### 3. Order

Representa pedidos realizados en tiendas eCommerce integradas.

**Campos**:
- `id`: UUID (PK)
- `store_id`: UUID (FK → store, NOT NULL)
- `user_id`: UUID (FK → user, NOT NULL)
- `external_order_id`: VARCHAR(100) (NOT NULL) - ID en el eCommerce
- `external_order_number`: VARCHAR(50)
- `total_amount`: DECIMAL(12,2) (NOT NULL)
- `currency`: VARCHAR(3) (NOT NULL)
- `fee_percentage`: DECIMAL(5,2) (NOT NULL)
- `fee_amount`: DECIMAL(12,2) (NOT NULL)
- `status`: ENUM `OrderStatus` (DEFAULT PENDING_ADDRESS)
- `order_mode`: ENUM `OrderMode` (NOT NULL) - Modo de operación del pedido
- `payment_type`: ENUM `PaymentType` (NOT NULL) - Tipo de pago usado
- `is_gift`: BOOLEAN (DEFAULT false)
- `items_summary`: JSONB
- `webhook_received_at`: TIMESTAMPTZ (NOT NULL)
- `address_confirmed_at`: TIMESTAMPTZ
- `synced_at`: TIMESTAMPTZ

**Enum `OrderStatus`**: `PENDING_PAYMENT`, `PENDING_ADDRESS`, `READY_TO_PROCESS`, `COMPLETED`, `CANCELED`

**Enum `OrderMode`**: `TRADITIONAL` (flujo estándar sin Adresles), `ADRESLES` (flujo con gestión de dirección por IA)

**Enum `PaymentType`**: `CREDIT_CARD`, `PAYPAL`, `BIZUM`, `BANK_TRANSFER`, `CASH_ON_DELIVERY`, `OTHER`

**Estados del pedido**:
```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT: Webhook recibido (pago pendiente)
    PENDING_PAYMENT --> PENDING_ADDRESS: Pago confirmado
    PENDING_ADDRESS --> READY_TO_PROCESS: Usuario confirma dirección
    READY_TO_PROCESS --> COMPLETED: Dirección sincronizada con eCommerce
    PENDING_ADDRESS --> CANCELED: Usuario cancela o error
    PENDING_PAYMENT --> CANCELED: Pago fallido o cancelado
    COMPLETED --> [*]
    CANCELED --> [*]
```

**Relaciones**:
- `store`: Muchos-a-uno con Store
- `user`: Muchos-a-uno con User (comprador)
- `order_address`: Uno-a-uno con OrderAddress (snapshot inmutable)
- `gift_recipient`: Uno-a-uno con GiftRecipient (si is_gift = true)
- `conversation`: Uno-a-muchos con Conversation

### 4. OrderAddress

Snapshot inmutable de la dirección de entrega confirmada para un pedido. Se crea una sola vez al confirmar la dirección y no se modifica aunque el usuario cambie sus datos posteriormente.

**Campos**:
- `id`: UUID (PK)
- `order_id`: UUID (FK → order, UNIQUE, NOT NULL)
- `source_address_id`: UUID (FK → address, nullable) - Dirección origen si fue copiada de la libreta
- `recipient_type`: ENUM `RecipientType` (NOT NULL) - `BUYER` o `GIFT_RECIPIENT`
- `recipient_name`: VARCHAR (NOT NULL) - Nombre completo del destinatario
- `recipient_phone_id`: UUID (FK → phone, NOT NULL) - Teléfono del destinatario
- `full_address`: VARCHAR (NOT NULL)
- `street`: VARCHAR (NOT NULL)
- `number`: VARCHAR
- `block`: VARCHAR
- `staircase`: VARCHAR
- `floor`: VARCHAR
- `door`: VARCHAR
- `additional_info`: VARCHAR
- `postal_code`: VARCHAR (NOT NULL)
- `city`: VARCHAR (NOT NULL)
- `province`: VARCHAR
- `country`: VARCHAR (NOT NULL) - Código ISO
- `gmaps_place_id`: VARCHAR - ID de Google Maps
- `address_origin`: ENUM `AddressOrigin` (NOT NULL) - Origen de la dirección
- `confirmed_at`: TIMESTAMPTZ (NOT NULL)
- `confirmed_via`: ENUM `ConfirmedVia` (NOT NULL) - `CONVERSATION` o `MANUAL`

**Enum `AddressOrigin`**: `STORE_TRADITIONAL` (dirección del pedido original), `STORE_ADRESLES` (enviada por tienda vía Adresles), `ADRESLES_SAVED` (de la libreta del usuario), `USER_CONVERSATION` (introducida en conversación)

**Reglas de Validación**:
- Es un snapshot inmutable: no se modifica tras la confirmación
- La FK `recipient_phone_id` referencia la entidad `Phone` normalizada

**Relaciones**:
- `order`: Uno-a-uno con Order
- `recipient_phone`: Muchos-a-uno con Phone

---

### 5. GiftRecipient

Almacena información del destinatario de un pedido regalo. Vinculado tanto al `Phone` del destinatario como al `User` que representa ese destinatario en el sistema.

**Campos**:
- `id`: UUID (PK)
- `order_id`: UUID (FK → order, UNIQUE, NOT NULL)
- `phone_id`: UUID (FK → phone, NOT NULL) - Teléfono del destinatario regalo
- `recipient_user_id`: UUID (FK → user, NOT NULL) - Usuario destinatario
- `first_name`: VARCHAR (NOT NULL)
- `last_name`: VARCHAR (NOT NULL)
- `note`: VARCHAR - Mensaje de regalo
- `status`: ENUM `GiftRecipientStatus` (DEFAULT PENDING_CONTACT)
- `created_at`: TIMESTAMPTZ (NOT NULL, DEFAULT now())
- `updated_at`: TIMESTAMPTZ (NOT NULL, DEFAULT now())

**Reglas de Validación**:
- Solo existe si `order.is_gift = true`
- `phone_id` referencia el teléfono normalizado del destinatario
- `recipient_user_id` apunta al `User` del destinatario en el sistema

**Relaciones**:
- `order`: Uno-a-uno con Order
- `phone`: Muchos-a-uno con Phone
- `recipient_user`: Muchos-a-uno con User

---

### 6. Conversation

Representa metadata de una conversación entre usuario y agente IA.

**Campos**:
- `id`: UUID (PK)
- `order_id`: UUID (FK → order, NOT NULL)
- `user_id`: UUID (FK → user, NOT NULL)
- `conversation_type`: ENUM - INFORMATION, GET_ADDRESS, REGISTER, GIFT_NOTIFICATION, SUPPORT
- `user_type`: ENUM - BUYER, RECIPIENT
- `status`: ENUM - ACTIVE, WAITING_USER, COMPLETED, ESCALATED, TIMEOUT
- `started_at`: TIMESTAMPTZ (NOT NULL)
- `completed_at`: TIMESTAMPTZ
- `is_registered_adresles`: BOOLEAN
- `is_registered_ecommerce`: BOOLEAN
- `has_address_adresles`: BOOLEAN
- `has_address_ecommerce`: BOOLEAN

**Mensajes**: Almacenados en DynamoDB (`adresles-messages`)

**Relaciones**:
- `order`: Muchos-a-uno con Order
- `user`: Muchos-a-uno con User

## Mensajes de Conversaciones (DynamoDB)

### Tabla: adresles-messages

**Esquema**:

```typescript
{
  PK: string;              // conversation_id (Partition Key)
  SK: string;              // timestamp ISO (Sort Key)
  message_id: string;      // UUID
  conversation_id: string;
  order_id: string;        // Para GSI
  user_id: string;         // Para GSI
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    model?: string;
    tokens?: number;
    // ...
  };
  ttl: number;             // Unix timestamp (90 días)
}
```

**Índices GSI**:
1. `user_id-timestamp-index` - Buscar mensajes por usuario
2. `order_id-timestamp-index` - Buscar mensajes por pedido

**Política de retención**: Ver [Adresles_Business.md - Sección 3.4](../../Adresles_Business.md#34-política-de-retención-de-datos)

## Diagrama Entidad-Relación Simplificado

```mermaid
erDiagram
    ECOMMERCE ||--o{ STORE : "has"
    STORE ||--o{ PLUGIN_CONFIG : "configures"
    STORE ||--o{ ORDER : "receives"

    PHONE ||--o{ USER : "identified_by"
    PHONE ||--o{ GIFT_RECIPIENT : "contact_of"
    PHONE ||--o{ ORDER_ADDRESS : "recipient_of"

    USER ||--o{ ADDRESS : "saves"
    USER ||--o{ ORDER : "places"
    USER ||--o{ CONVERSATION : "participates"
    USER ||--o{ GIFT_RECIPIENT : "is_recipient"

    ORDER ||--|| ORDER_ADDRESS : "has_snapshot"
    ORDER ||--o| GIFT_RECIPIENT : "may_have"
    ORDER ||--o{ CONVERSATION : "generates"

    CONVERSATION }o--|| ORDER : "belongs_to"
    CONVERSATION }o--|| USER : "with"

    PHONE {
        uuid id PK
        string e164 UK
        string country_calling_code
        string national_number
        string country
        boolean is_valid
    }

    ECOMMERCE {
        uuid id PK
        string tax_id UK
        string legal_name
    }

    STORE {
        uuid id PK
        uuid ecommerce_id FK
        string name
        string url UK
    }

    USER {
        uuid id PK
        uuid phone_id FK
        string first_name
        string last_name
        boolean is_registered
        boolean is_deleted
    }

    ADDRESS {
        uuid id PK
        uuid user_id FK
        string full_address
        string gmaps_place_id
        boolean is_default
        boolean is_deleted
    }

    ORDER {
        uuid id PK
        uuid store_id FK
        uuid user_id FK
        string external_order_id
        decimal total_amount
        string status
        string order_mode
        string payment_type
        boolean is_gift
    }

    ORDER_ADDRESS {
        uuid id PK
        uuid order_id FK
        uuid recipient_phone_id FK
        string full_address
        string recipient_name
        string address_origin
        string confirmed_via
    }

    GIFT_RECIPIENT {
        uuid id PK
        uuid order_id FK
        uuid phone_id FK
        uuid recipient_user_id FK
        string first_name
        string last_name
    }

    CONVERSATION {
        uuid id PK
        uuid order_id FK
        uuid user_id FK
        string conversation_type
        string status
    }
```

**Nota**: Los mensajes individuales se almacenan en DynamoDB, no en el diagrama E-R de Supabase.

## Principios Clave de Diseño

1. **Arquitectura Híbrida**: Datos relacionales en Supabase, mensajes alta volumetría en DynamoDB
2. **Multi-tenant**: Row Level Security (RLS) en Supabase por `store_id`
3. **Inmutabilidad**: OrderAddress es snapshot inmutable (no se modifica si usuario cambia dirección después)
4. **TTL Automático**: DynamoDB elimina mensajes automáticamente tras 90 días
5. **Teléfono como ID**: El número de teléfono sigue siendo el identificador único del usuario, gestionado a través de la entidad `Phone` (formato E.164 normalizado)
6. **Entidad Phone Centralizada**: `Phone` es una entidad compartida entre `User`, `GiftRecipient` y `OrderAddress`, evitando duplicación de lógica de validación telefónica
7. **Soft Delete**: `User` y `Address` usan `is_deleted`/`deleted_at` en lugar de eliminación física; `User.phone_id` se pone a `null` al desactivarse, permitiendo reasignación del número
8. **Audit Trail**: Timestamps completos en todas las entidades
9. **Trazabilidad de Dirección**: `OrderAddress.address_origin` registra el origen de cada dirección confirmada (tienda tradicional, Adresles, libreta del usuario o conversación)

## Referencias

- **Modelo completo**: [Adresles_Business.md - Sección 3](../../Adresles_Business.md#fase-3-modelado-de-datos)
- **Decisión DB híbrida**: [ADR-002](../../memory-bank/architecture/002-supabase-dynamodb.md)
- **Diccionario de datos detallado**: [Adresles_Business.md - Sección 3.3](../../Adresles_Business.md#33-diccionario-de-datos)
