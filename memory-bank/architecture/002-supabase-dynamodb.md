# ADR 002: Arquitectura de Base de Datos Híbrida (Supabase + DynamoDB)

**Estado**: ✅ Aceptada  
**Fecha**: 2026-01-30  
**Decidido en**: Fase 3 - Modelado de Datos  
**Implementado en**: Pendiente (diseño completado)  
**Reemplaza a**: N/A

---

## Contexto

Adresles necesita almacenar dos tipos de datos con características muy diferentes:

### Datos Relacionales (Frecuencia media, Relaciones complejas)
- **Users**: Usuarios registrados
- **Stores**: Tiendas eCommerce
- **Orders**: Pedidos
- **Addresses**: Direcciones de usuarios
- **Plugin Configs**: Configuraciones

**Características**: Muchas relaciones (FKs), JOINs frecuentes, transacciones ACID, baja volumetría relativa

### Datos No Estructurados (Alta volumetría, Writes intensivos)
- **Messages**: Mensajes de conversaciones

**Características**: 100K+ mensajes/día estimados en escala, writes muy frecuentes, lectura secuencial por conversation, TTL automático (política de retención)

### Restricciones

- **Budget limitado**: MVP con costos optimizados
- **Multi-tenant**: Aislamiento de datos entre tiendas
- **Global desde inicio**: Multi-región potencial
- **Experiencia del equipo**: Familiaridad con PostgreSQL y DynamoDB (AWS)

---

## Decisión

**Arquitectura híbrida de base de datos**:

- **Supabase (PostgreSQL)** para datos relacionales + Auth + RLS multi-tenant
- **DynamoDB** para mensajes de conversaciones (alta volumetría)

---

## Justificación

### Análisis de Alternativas

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **Supabase + DynamoDB** (híbrida) | • Mejor rendimiento por tipo<br>• Free tier maximizado<br>• Auth integrado<br>• RLS nativo | • Complejidad (2 sistemas)<br>• Dos SDKs diferentes | ✅ Seleccionada |
| **Solo Supabase** | • Un solo sistema<br>• Simplicidad máxima<br>• JOINs entre todas las tablas | • Writes intensivos degradan PG<br>• Storage caro a escala<br>• Sin TTL nativo | ❌ No escala bien |
| **Solo DynamoDB** | • Escalado horizontal infinito<br>• TTL nativo | • Modelar relaciones complejo<br>• Sin RLS nativo<br>• Sin Auth integrado<br>• Más código custom | ❌ Complejo para relaciones |
| **PostgreSQL + Aurora** | • PostgreSQL estándar<br>• Escalado automático | • Coste alto (mínimo ~$45/mes)<br>• Overkill para MVP | ❌ Coste prohibitivo |

### Razones Principales

1. **Optimización de Costos**: 
   - Supabase free tier: 500MB DB + 50K usuarios Auth
   - DynamoDB free tier: 25GB storage + 25 WCU/RCU
   - Total: ~$0/mes para MVP (vs $45+/mes Aurora)

2. **Rendimiento Diferenciado**:
   - Datos relacionales → PostgreSQL (JOINs eficientes)
   - Mensajes (alta volumetría) → DynamoDB (escrituras escalables)

3. **Multi-tenant Nativo**:
   - Supabase RLS: Aislamiento a nivel de BD (no código)
   - Políticas RLS por `store_id`

4. **Auth Integrado**:
   - Supabase Auth: JWT, proveedores OAuth, gestión de usuarios
   - Evita implementar auth custom

5. **TTL Automático**:
   - DynamoDB: Eliminación automática de mensajes según política de retención
   - PostgreSQL requeriría cron jobs custom

6. **Experiencia del Equipo**:
   - Familiaridad con PostgreSQL (desarrollo tradicional)
   - Experiencia previa con DynamoDB en AWS

### Criterios de Evaluación

- ✅ **Coste MVP**: Free tier maximizado (~$0/mes inicialmente)
- ✅ **Escalabilidad writes**: DynamoDB soporta 100K+ msg/día sin degradación
- ✅ **Multi-tenant**: RLS nativo en Supabase
- ✅ **Desarrollo ágil**: Auth + Realtime + Storage integrados
- ⚠️ **Complejidad**: Trade-off aceptado (2 sistemas vs 1)

---

## Consecuencias

### ✅ Positivas

- **Mejor rendimiento por workload**: Cada BD optimizada para su tipo de dato
- **Costos optimizados**: Free tier combinado cubre necesidades MVP
- **Escalabilidad horizontal**: DynamoDB escala infinitamente para mensajes
- **Multi-tenant seguro**: RLS a nivel de BD (no bugs en código)
- **Auth listo para usar**: Supabase Auth evita 2-3 semanas de desarrollo
- **TTL automático**: Cumple política de retención sin cron jobs
- **Realtime built-in**: Supabase Realtime para updates en Dashboard

### ❌ Negativas (Trade-offs)

- **Dos sistemas**: Mayor complejidad operacional
  - *Mitigación*: Ambos son managed services (sin mantenimiento de servidor)
- **Dos SDKs**: `@supabase/supabase-js` + `@aws-sdk/client-dynamodb`
  - *Mitigación*: Abstracción en repositories (patrón Repository)
- **Sin transacciones distribuidas**: No podemos hacer transacciones atómicas entre Supabase y DynamoDB
  - *Mitigación*: No necesarias en este caso (mensajes son append-only, sin rollback)
- **Debugging más complejo**: Logs en dos sistemas
  - *Mitigación*: Correlación por `conversation_id` + `order_id`

### 🔧 Deuda Técnica Introducida

- **Potencial inconsistencia**: Si API cae entre write a Supabase y DynamoDB
  - *Mitigación*: Pattern de eventos + retry con idempotencia

---

## Implementación

### Estructura de Datos

#### Supabase (PostgreSQL)

```sql
-- Datos relacionales con RLS
users (id, phone, name, ...)
stores (id, name, url, ...)
orders (id, store_id, user_id, status, ...)
addresses (id, user_id, street, city, ...)
order_address (id, order_id, snapshot de dirección)
gift_recipient (id, order_id, recipient data)
plugin_config (id, store_id, api_key, ...)

-- RLS Policy example
CREATE POLICY "Stores can only see their own orders"
  ON orders FOR SELECT
  USING (store_id = auth.uid()::uuid);
```

#### DynamoDB

```typescript
// Tabla: adresles-messages
{
  PK: "conversation_id",      // Partition Key
  SK: "timestamp",            // Sort Key (ISO string)
  message_id: "uuid",
  conversation_id: "uuid",
  order_id: "uuid",           // Para GSI
  user_id: "uuid",            // Para GSI
  role: "user | assistant",
  content: "mensaje...",
  metadata: { ... },
  ttl: 1234567890             // TTL automático (90 días)
}

// GSI 1: user_id-timestamp-index
// GSI 2: order_id-timestamp-index
```

### Estructura de Carpetas

```
backend/src/infrastructure/
├── supabase/
│   ├── supabase.service.ts
│   ├── supabase.config.ts
│   └── repositories/
│       ├── user.repository.ts
│       ├── store.repository.ts
│       ├── order.repository.ts
│       └── address.repository.ts
│
└── dynamodb/
    ├── dynamodb.service.ts
    ├── dynamodb.config.ts
    └── repositories/
        └── message.repository.ts
```

### Ejemplo de Código

```typescript
// Order Repository (Supabase)
export class OrderRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(order: CreateOrderDto): Promise<Order> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw new DatabaseError(error);
    return data;
  }

  async findByStoreId(storeId: string): Promise<Order[]> {
    // RLS automáticamente filtra por store_id
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, order_address(*)')
      .eq('store_id', storeId);
    
    if (error) throw new DatabaseError(error);
    return data;
  }
}

// Message Repository (DynamoDB)
export class MessageRepository {
  constructor(private readonly dynamodb: DynamoDBService) {}

  async create(message: CreateMessageDto): Promise<Message> {
    const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 días
    
    await this.dynamodb.client.putItem({
      TableName: 'adresles-messages',
      Item: {
        PK: { S: message.conversation_id },
        SK: { S: new Date().toISOString() },
        message_id: { S: uuidv4() },
        role: { S: message.role },
        content: { S: message.content },
        ttl: { N: ttl.toString() },
      },
    });
    
    return message;
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    const result = await this.dynamodb.client.query({
      TableName: 'adresles-messages',
      KeyConditionExpression: 'PK = :conversationId',
      ExpressionAttributeValues: {
        ':conversationId': { S: conversationId },
      },
      ScanIndexForward: true, // Orden cronológico
    });
    
    return result.Items.map(item => this.mapToMessage(item));
  }
}
```

---

## Política de Retención de Datos

Según [Adresles_Business.md - Sección 3.4](../../Adresles_Business.md#34-política-de-retención-de-datos):

| Tipo de Dato | Retención | Implementación |
|--------------|-----------|----------------|
| **Mensajes completos** | 90 días | DynamoDB TTL |
| **Metadata de mensajes** | 2 años | Supabase (tabla `conversation_metadata`) |
| **Pedidos** | 7 años | Supabase (soft delete) |
| **Direcciones** | Indefinido (mientras usuario activo) | Supabase (soft delete) |

---

## Métricas de Éxito

- 📊 **Coste mensual MVP**: < $10/mes (vs $45+ con Aurora)
- 📊 **Latencia writes mensajes**: < 50ms p95
- 📊 **Latencia reads users/orders**: < 100ms p95
- 📊 **Escalabilidad**: Soportar 10K mensajes/día sin degradación
- 📊 **Multi-tenant isolation**: 0 brechas de seguridad (RLS funciona)

---

## Referencias

- **Documento fuente**: [Adresles_Business.md - Sección 3.1](../../Adresles_Business.md#31-análisis-de-base-de-datos-dynamodb-vs-alternativas)
- **Modelo E-R completo**: [Adresles_Business.md - Sección 3.2](../../Adresles_Business.md#32-modelo-entidad-relación)
- **Diccionario de Datos**: [Adresles_Business.md - Sección 3.3](../../Adresles_Business.md#33-diccionario-de-datos)
- **Política de Retención**: [Adresles_Business.md - Sección 3.4](../../Adresles_Business.md#34-política-de-retención-de-datos)
- **Registro de Decisiones**: [Adresles_Business.md - Decisiones 30/01/2026](../../Adresles_Business.md#registro-de-decisiones)
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **DynamoDB TTL**: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html

---

## Notas de Revisión

### 2026-01-30: Decisión inicial

- Confirmada experiencia previa con DynamoDB en AWS
- RLS multi-tenant crítico para seguridad → Supabase ideal
- TTL automático de DynamoDB simplifica política de retención

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-07  
**Próxima revisión**: Tras primeros 1000 usuarios en producción (validar costos reales)
