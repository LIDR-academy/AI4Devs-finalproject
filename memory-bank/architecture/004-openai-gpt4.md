# ADR 004: OpenAI GPT-4 como Motor Conversacional

**Estado**: ✅ Aceptada  
**Fecha**: 2026-01-30  
**Decidido en**: Fase 1 - Investigación y Análisis (requisito del cliente)  
**Implementado en**: Pendiente (diseño completado)  
**Reemplaza a**: N/A

---

## Contexto

El núcleo funcional de Adresles es un agente conversacional que:

- Obtiene direcciones de entrega mediante conversación natural
- Entiende múltiples idiomas automáticamente
- Detecta información faltante en direcciones (piso, puerta, escalera)
- Maneja ambigüedades y errores de usuario con naturalidad
- Se adapta al contexto (usuario registrado, regalo, etc.)

### Requisitos del Agente IA

| Requisito | Descripción |
|-----------|-------------|
| **Comprensión de lenguaje natural** | Entender direcciones expresadas informalmente |
| **Multi-idioma** | Español, inglés, francés, alemán... (global) |
| **Detección de intención** | Identificar confirmación, cambio de dirección, cancelación |
| **Contexto persistente** | Recordar conversación completa |
| **Validación inteligente** | Identificar datos faltantes (ej: "Calle Mayor 5" → falta piso) |
| **Tono conversacional** | Amigable, no robótico |

### Restricciones

- **Requisito del cliente**: Usar GPT-4.0 de OpenAI
- **Budget limitado**: Optimizar coste por conversación
- **Latencia**: < 3 segundos para respuesta percibida como natural
- **Escalabilidad**: Soportar 10K conversaciones/día

---

## Decisión

**Usar OpenAI GPT-4** como motor de lenguaje para el agente conversacional.

Configuración:
- Modelo: `gpt-4` (no fine-tuned inicialmente)
- Temperature: `0.7` (balance creatividad/consistencia)
- Max tokens: `500` (respuestas concisas)
- System prompts estructurados por tipo de conversación

---

## Justificación

### Análisis de Alternativas

| Modelo | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **GPT-4 (OpenAI)** | • Mejor comprensión NLU<br>• Multi-idioma nativo<br>• Context window 8K tokens<br>• Función calling | • Coste alto ($0.03/1K tokens)<br>• Latencia ~2s<br>• Vendor lock-in | ✅ Seleccionado (requisito) |
| **GPT-3.5-turbo** | • Más barato ($0.002/1K)<br>• Más rápido (~1s)<br>• Suficiente para tareas simples | • Menor comprensión contextual<br>• Más errores en ambigüedades | ⚠️ Considerar para fallback |
| **Claude 2 (Anthropic)** | • Context window 100K<br>• Excelente en instrucciones<br>• Menor alucinación | • Sin experiencia previa<br>• API menos madura | ❌ No requisito cliente |
| **LLaMA 2 (Self-hosted)** | • Coste marginal $0<br>• Control total<br>• Sin límites de rate | • Requiere GPU ($500+/mes)<br>• Mantenimiento complejo<br>• Menor calidad que GPT-4 | ❌ Complejidad prohibitiva |
| **Dialogflow CX** | • Especializado en conversaciones<br>• Integración Google Cloud | • Menos flexible<br>• Requiere training manual<br>• Peor NLU que GPT-4 | ❌ Menos potente |

### Razones Principales

1. **Requisito del Cliente**: Especificación explícita de usar GPT-4.0

2. **Comprensión Contextual Superior**:
   ```
   Usuario: "Ah no, perdona, mejor envíamelo al trabajo"
   ```
   GPT-4 entiende que:
   - Usuario cambió de opinión
   - Necesita dirección alternativa (trabajo)
   - Debe invalidar dirección anterior propuesta

3. **Multi-idioma Sin Configuración**:
   - Detección automática del idioma
   - Respuestas naturales en 50+ idiomas
   - No requiere training específico por idioma

4. **Function Calling**:
   ```typescript
   functions: [
     {
       name: "validate_address_with_gmaps",
       description: "Valida dirección con Google Maps",
       parameters: {
         type: "object",
         properties: {
           address: { type: "string" }
         }
       }
     }
   ]
   ```
   GPT-4 puede llamar a Google Maps API directamente cuando detecta dirección completa.

5. **Context Window Suficiente**:
   - 8K tokens = ~6K palabras
   - Suficiente para conversación completa (típicamente < 2K tokens)

6. **Experiencia Previa del Equipo**:
   - Familiaridad con API de OpenAI
   - Prompts ya iterados en prototipos

### Criterios de Evaluación

- ✅ **Calidad NLU**: GPT-4 top-tier en comprensión
- ✅ **Multi-idioma**: Nativo sin configuración adicional
- ✅ **Flexibilidad**: System prompts ajustables sin reentrenamiento
- ⚠️ **Coste**: Alto pero aceptable para MVP ($0.03/1K tokens ≈ $0.10/conversación)
- ⚠️ **Latencia**: ~2s aceptable con UX apropiado (typing indicator)
- ❌ **Vendor lock-in**: Mitigado con abstracción en código

---

## Consecuencias

### ✅ Positivas

- **Calidad conversacional excepcional**: Respuestas naturales, contextuales
- **Time-to-market rápido**: No requiere training ni fine-tuning inicial
- **Multi-idioma sin esfuerzo**: Soporta global desde día 1
- **Flexibilidad**: Ajustar comportamiento con prompt engineering
- **Function calling**: Integración directa con Google Maps API
- **Mantenimiento mínimo**: OpenAI gestiona infraestructura y updates

### ❌ Negativas (Trade-offs)

- **Coste por conversación alto**: ~$0.10/conversación (vs $0.01 con GPT-3.5)
  - *Mitigación*: Optimizar prompts, truncar historial, considerar GPT-3.5 para tareas simples
- **Latencia ~2s**: Puede sentirse lento
  - *Mitigación*: UX con typing indicator, streaming de respuesta
- **Vendor lock-in**: Dependencia total de OpenAI
  - *Mitigación*: Abstracción con interface `LLMService`, permitir cambio futuro
- **Rate limits**: 10K TPM (tokens per minute) en tier free
  - *Mitigación*: Monitorear uso, upgrade a tier pagado si necesario
- **Sin control de infraestructura**: Outage de OpenAI = outage de Adresles
  - *Mitigación*: Fallback a respuestas pre-escritas + escalado a soporte humano

### 🔧 Deuda Técnica Introducida

- **Optimización de prompts**: Requiere iteración continua para reducir tokens
- **Fine-tuning futuro**: Considerar fine-tuning para reducir costes (~50% reduction)
- **Abstracción LLM**: Implementar interface para permitir cambio de proveedor

---

## Implementación

### Abstracción del Servicio LLM

```typescript
// domain/ports/llm.service.interface.ts
export interface ILLMService {
  generateResponse(params: GenerateResponseParams): Promise<string>;
  streamResponse(params: GenerateResponseParams): AsyncIterable<string>;
}

export interface GenerateResponseParams {
  systemPrompt: string;
  messages: Message[];
  functions?: FunctionDefinition[];
  temperature?: number;
  maxTokens?: number;
}
```

### Implementación OpenAI

```typescript
// infrastructure/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService implements ILLMService {
  private client: OpenAI;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  async generateResponse(params: GenerateResponseParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 500,
      messages: [
        { role: 'system', content: params.systemPrompt },
        ...params.messages,
      ],
      functions: params.functions,
    });

    return response.choices[0].message.content;
  }

  async *streamResponse(params: GenerateResponseParams): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4',
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 500,
      messages: [
        { role: 'system', content: params.systemPrompt },
        ...params.messages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) yield content;
    }
  }
}
```

### System Prompts por Tipo de Conversación

```typescript
// infrastructure/openai/prompts/get-address.prompt.ts
export const GET_ADDRESS_SYSTEM_PROMPT = `
Eres un asistente amigable de Adresles que ayuda a obtener direcciones de entrega.

CONTEXTO:
- Usuario: {{user_name}}
- Pedido: {{order_summary}}
- Tienda: {{store_name}}

TU OBJETIVO:
Obtener la dirección de entrega completa y validada con Google Maps.

DIRECTRICES:
1. Saluda al usuario por su nombre
2. Confirma el pedido que realizó
3. Si tiene dirección favorita, proponla primero
4. Si no, solicita la dirección de forma conversacional
5. Valida la dirección con Google Maps (function calling)
6. Detecta datos faltantes: escalera, bloque, piso, puerta
7. Si la dirección es de edificio y falta info, pregúntalo
8. Confirma dirección completa antes de finalizar
9. Mantén tono amigable, no robótico

LIMITACIONES:
- Máximo 3 mensajes para obtener dirección
- Si tras 3 intentos no se obtiene, escalar a soporte
- No inventes información, pregunta si falta algo

IDIOMA:
Detecta y responde en el idioma del usuario automáticamente.
`.trim();
```

### Ejemplo de Conversación

```typescript
// Uso en conversation orchestrator
const response = await this.llmService.generateResponse({
  systemPrompt: GET_ADDRESS_SYSTEM_PROMPT
    .replace('{{user_name}}', user.name)
    .replace('{{order_summary}}', order.summary)
    .replace('{{store_name}}', store.name),
  
  messages: [
    { role: 'assistant', content: '¡Hola María! Vi que compraste en TechStore...' },
    { role: 'user', content: 'Sí, envíamelo a casa' },
    { role: 'assistant', content: 'Perfecto, ¿cuál es tu dirección?' },
    { role: 'user', content: 'Calle Mayor 5, Madrid' },
  ],
  
  functions: [
    {
      name: 'validate_address_with_gmaps',
      description: 'Valida dirección con Google Maps API',
      parameters: {
        type: 'object',
        properties: {
          address: { type: 'string', description: 'Dirección a validar' },
        },
        required: ['address'],
      },
    },
  ],
});
```

---

## Optimización de Costes

### Estrategias de Reducción

| Estrategia | Ahorro Estimado | Implementación |
|------------|-----------------|----------------|
| **Truncar historial** | 20-30% | Mantener solo últimos 5 mensajes |
| **Reducir max_tokens** | 10-15% | De 500 a 300 tokens |
| **GPT-3.5 para INFO** | 90% en info | Usar GPT-3.5 para conversations tipo INFORMATION |
| **Caching de respuestas comunes** | 5-10% | Redis cache para saludos iniciales |
| **Fine-tuning** | 50% | Tras 1000 conversaciones, fine-tune modelo |

### Cálculo de Costes

```
Conversación típica:
- System prompt: 200 tokens
- Historial (5 mensajes): 300 tokens
- Respuesta: 150 tokens
Total: 650 tokens

Coste por conversación:
- Input (500 tokens): $0.03/1K * 0.5 = $0.015
- Output (150 tokens): $0.06/1K * 0.15 = $0.009
Total: ~$0.024 por conversación

Con 1000 conversaciones/día:
- Coste diario: $24
- Coste mensual: $720
- Con optimizaciones: ~$400/mes
```

---

## Métricas de Éxito

- 📊 **Tasa de éxito conversacional**: > 90% de conversaciones completan sin escalado
- 📊 **Latencia percibida**: < 3s con typing indicator
- 📊 **Satisfacción usuario**: NPS > 8/10 en experiencia conversacional
- 📊 **Coste por conversación**: < $0.05 tras optimizaciones
- 📊 **Multi-idioma**: Soporte efectivo en top 10 idiomas desde día 1

---

## Referencias

- **Documento fuente**: [Adresles_Business.md - Sección 1.1](../../Adresles_Business.md#11-descripción-del-software)
- **Registro de Decisiones**: [Adresles_Business.md - Decisión 30/01/2026](../../Adresles_Business.md#registro-de-decisiones)
- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference
- **GPT-4 Pricing**: https://openai.com/pricing
- **Function Calling**: https://platform.openai.com/docs/guides/function-calling
- **ADR relacionado**: [ADR-001: Monolito Modular](./001-monolith-modular.md) (Worker separado para IA)

---

## Notas de Revisión

### 2026-01-30: Decisión inicial

- Requisito del cliente: GPT-4.0
- Confirmado que coste por conversación (~$0.024) es aceptable para pricing (fee 2.5-5%)
- Worker separado para no bloquear API con llamadas a OpenAI

### Próximas Iteraciones

- **Fine-tuning**: Considerar tras 1000 conversaciones reales (reducción 50% coste)
- **GPT-3.5 fallback**: Implementar para conversaciones simples (tipo INFORMATION)
- **Prompt optimization**: Iterar con A/B testing para reducir tokens

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-07  
**Próxima revisión**: Tras 1 mes en producción (validar coste real y calidad)
