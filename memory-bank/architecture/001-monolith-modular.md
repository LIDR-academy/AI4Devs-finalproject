# ADR 001: Monolito Modular vs Microservicios

**Estado**: ✅ Aceptada  
**Fecha**: 2026-01-30  
**Decidido en**: Fase 4 - Diseño de Alto Nivel  
**Implementado en**: Pendiente (diseño completado)  
**Reemplaza a**: N/A

---

## Contexto

Adresles es un MVP que necesita validar el producto en el mercado rápidamente. El equipo de desarrollo es individual (Sergio), y el proyecto requiere:

- Desarrollo ágil con iteraciones rápidas
- Deployment simplificado en servidor dedicado (Konsole H)
- Flexibilidad para evolucionar a microservicios en el futuro
- Límites claros entre dominios (DDD)

### Restricciones

- **Equipo**: 1 desarrollador
- **Infraestructura**: Servidor dedicado (no Kubernetes)
- **Tiempo**: MVP debe estar funcional para validación de mercado
- **Experiencia**: Familiaridad con Docker Compose, limitada con orquestadores complejos

---

## Decisión

**Implementar un Monolito Modular** como arquitectura inicial, con clara separación de dominios internos que permita extracción futura a microservicios si es necesario.

La aplicación se estructura en módulos NestJS bien delimitados:
- **Conversations** (módulo núcleo)
- **Orders**
- **Addresses**
- **Users**
- **Stores**

---

## Justificación

### Análisis de Alternativas

| Arquitectura | Pros | Contras | Veredicto |
|--------------|------|---------|-----------|
| **Monolito Modular** | • Desarrollo rápido<br>• Deploy simple (1 imagen Docker)<br>• Transacciones simples<br>• Debug sencillo<br>• Migración futura posible | • Todo o nada en escalado<br>• Acoplamiento potencial | ✅ Seleccionada |
| **Microservicios** | • Escalado independiente<br>• Tecnologías heterogéneas<br>• Aislamiento de fallos | • Complejidad operacional<br>• Transacciones distribuidas<br>• Debugging complejo<br>• Overhead de red | ❌ Overkill para MVP |
| **Monolito Puro** | • Máxima simplicidad<br>• Sin límites internos | • Difícil extracción futura<br>• Spaghetti code potencial<br>• Acoplamiento alto | ❌ Limitante a largo plazo |

### Razones Principales

1. **Velocidad de Desarrollo**: Un solo repositorio, un solo deploy, debugging directo
2. **Complejidad Apropiada**: No necesitamos escalado independiente en MVP
3. **Transacciones Simples**: Las operaciones son principalmente dentro de un mismo contexto
4. **Infraestructura Simplificada**: Docker Compose es suficiente (vs Kubernetes para microservicios)
5. **Extracción Futura**: Los módulos NestJS con límites claros facilitan migración a microservicios

### Criterios de Evaluación

- ✅ **Time-to-market**: Monolito permite MVP más rápido
- ✅ **Mantenibilidad**: Módulos NestJS con interfaces claras
- ✅ **Escalabilidad MVP**: Suficiente para primeros 1000 usuarios
- ⚠️ **Escalabilidad futura**: Se resolverá con extracción a microservicios si es necesario

---

## Consecuencias

### ✅ Positivas

- **Desarrollo más rápido**: Sin overhead de comunicación entre servicios
- **Deploy simplificado**: Una sola imagen Docker, un solo `docker-compose up`
- **Debugging sencillo**: Stack traces completos, logs centralizados
- **Transacciones atómicas**: Sin problemas de consistencia eventual
- **Menor complejidad operacional**: No necesita service mesh, API gateway, etc.

### ❌ Negativas (Trade-offs)

- **Escalado global**: Si Conversations necesita 10x más recursos que Orders, escalamos todo el monolito (mitigación: Worker separado para IA)
- **Deploy atómico**: Un bug en cualquier módulo requiere redeploy completo (mitigación: Tests comprehensivos + staged rollout)
- **Acoplamiento potencial**: Sin disciplina, los módulos pueden acoplarse (mitigación: Linting rules + code reviews)

### 🔧 Deuda Técnica Introducida

- **Futura extracción a microservicios**: Si el producto escala significativamente, será necesario refactorizar a microservicios
- **Mitigación**: Los límites de módulos siguen principios DDD, facilitando extracción futura

---

## Implementación

### Cambios Requeridos

```
apps/api/                         # Monolito modular NestJS
├── src/
│   ├── conversations/            # Módulo Conversations (bounded context)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── conversations.module.ts
│   │
│   ├── orders/                   # Módulo Orders
│   │   └── orders.module.ts
│   │
│   ├── addresses/                # Módulo Addresses
│   │   └── addresses.module.ts
│   │
│   ├── users/                    # Módulo Users
│   │   └── users.module.ts
│   │
│   ├── stores/                   # Módulo Stores
│   │   └── stores.module.ts
│   │
│   └── app.module.ts             # Módulo raíz que importa todos

apps/worker/                      # Worker separado (BullMQ)
└── src/
    └── processors/
        └── conversation.processor.ts
```

### Separación Crítica: Worker vs API

Para mitigar el problema de escalado del módulo Conversations (que consume OpenAI intensivamente), se separa en un **Worker independiente**:

- **API**: HTTP endpoints, validación, orquestación
- **Worker**: Procesamiento de conversaciones IA (BullMQ + Redis)

Esto permite escalar horizontalmente solo el Worker si la carga de OpenAI aumenta.

### Principios de Diseño Modular

1. **Bounded Contexts claros**: Cada módulo representa un dominio DDD
2. **Interfaces explícitas**: Comunicación entre módulos solo vía interfaces públicas
3. **Dependencias unidireccionales**: Evitar dependencias circulares
4. **Eventos de dominio**: Para comunicación asíncrona entre módulos

### Ejemplo de Código

```typescript
// conversations.module.ts
@Module({
  imports: [
    OrdersModule,      // Dependencia explícita
    AddressesModule,   // Dependencia explícita
  ],
  providers: [
    ConversationService,
    ConversationOrchestrator,
    // ... repositories
  ],
  exports: [ConversationService],  // Interface pública
})
export class ConversationsModule {}
```

---

## Estrategia de Extracción Futura

### Criterios para Migrar a Microservicios

Considerar extracción cuando se cumpla **al menos 2** de estos criterios:

1. **Escalado diferenciado necesario**: Conversations requiere 5x más recursos que Orders
2. **Equipos independientes**: Más de 3 desarrolladores trabajando en dominios diferentes
3. **Ciclos de deploy independientes**: Necesidad de actualizar módulos por separado
4. **Tecnologías heterogéneas**: Un módulo requiere tecnología diferente (ej: Python para ML)

### Módulos Candidatos para Extracción (en orden)

1. **Conversations** → Servicio independiente (alta carga de OpenAI)
2. **Addresses** → Servicio independiente (validación Google Maps)
3. **Orders** → Servicio independiente (core business logic)

---

## Métricas de Éxito

- 📊 **Time-to-production**: MVP desplegado en < 3 meses
- 📊 **Complejidad operacional**: Deploy completo en < 5 minutos
- 📊 **Debugging time**: Resolución de bugs en < 50% del tiempo vs microservicios
- 📊 **Escalabilidad MVP**: Soportar 1000 usuarios concurrentes sin problemas

---

## Referencias

- **Documento fuente**: [Adresles_Business.md - Sección 4.1](../../Adresles_Business.md#41-visión-general-de-la-arquitectura)
- **Registro de Decisiones**: [Adresles_Business.md - Decisión 30/01/2026](../../Adresles_Business.md#registro-de-decisiones)
- **Estructura del Proyecto**: [Adresles_Business.md - Sección 4.5](../../Adresles_Business.md#45-estructura-del-proyecto)
- **NestJS Modules**: https://docs.nestjs.com/modules
- **DDD Bounded Contexts**: https://martinfowler.com/bliki/BoundedContext.html

---

## Notas de Revisión

### 2026-01-30: Decisión inicial

- Separación de Worker confirmada para mitigar problema de escalado de OpenAI
- Límites de módulos alineados con dominios DDD del proyecto

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-07  
**Próxima revisión**: Tras 6 meses en producción o cuando se cumplan criterios de extracción
