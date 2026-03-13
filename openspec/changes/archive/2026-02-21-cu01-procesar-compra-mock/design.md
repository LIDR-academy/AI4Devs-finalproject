# Design: CU-01 Procesar Compra Mock

## Contexto

Adresles es una plataforma SaaS B2B2C para checkout sin fricción. El MVP usa integración mock con eCommerce: entrada manual de JSON simula el webhook que enviaría una tienda real. El CU-01 orquesta: recibir pedido, crear/buscar usuario, iniciar conversación IA según modo, y simular sync de dirección.

## Objetivos / No-Objetivos

**Objetivos:**
- Endpoint mock funcional para flujo principal (adresles) y FA-2 (tradicional)
- Orquestación clara por modo
- Integración con BullMQ para procesamiento asíncrono de conversaciones
- Simulación de sync eCommerce (log estructurado)

**No-Objetivos:**
- FA-1 Modo Regalo (change separado)
- Integración real con WooCommerce
- Sistema de reminders automáticos

## Decisiones

### D1: Store en JSON vs store_id
**Decisión**: El JSON mock incluye objeto store (name, url). El sistema busca o crea store por URL. Para MVP, si no existe ecommerce/store, se crea un ecommerce y store mínimos en el flujo o en seeds.
**Alternativa rechazada**: store_id en JSON requeriría seeds previos obligatorios.

### D2: BullMQ para conversaciones
**Decisión**: Jobs `process-conversation` y `process-response` en Redis/BullMQ. El API encola; el Worker procesa con OpenAI.
**Justificación**: No bloquear API, escalar Worker independientemente.

### D3: DynamoDB para mensajes
**Decisión**: Mensajes de conversación en DynamoDB (PK: conversation_id, SK: timestamp), metadata en Supabase.
**Justificación**: ADR-002, TTL automático para mensajes.

### D4: Fórmula de fee
**Decisión**: Implementar fórmula de pricing (2.5%-5% según importe) en creación de Order.
**Fórmula**: fee% = 5 - (2.5 × (importe - 10) / 90) para 10 < importe < 100.

## Riesgos / Compromisos

- **Riesgo**: Store/ecommerce no existente → Mitigación: seeds con store mock o creación automática en primer uso
- **Compromiso**: Mock UI puede diferirse; usar Postman/curl para pruebas iniciales
