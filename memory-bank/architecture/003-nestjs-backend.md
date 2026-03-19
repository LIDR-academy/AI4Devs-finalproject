# ADR 003: NestJS como Framework Backend

**Estado**: ✅ Aceptada  
**Fecha**: 2026-01-30  
**Decidido en**: Fase 4 - Diseño de Alto Nivel  
**Implementado en**: ✅ apps/api/ (NestJS 10, producción en `backend.adresles.com`)  
**Reemplaza a**: N/A

---

## Contexto

Adresles requiere un backend robusto con las siguientes características:

- **TypeScript end-to-end**: Type safety desde cliente hasta BD
- **Arquitectura modular**: Preparada para DDD (Domain-Driven Design)
- **Soporte para WebSockets**: Conversaciones en tiempo real
- **Sistema de colas**: Procesamiento asíncrono con BullMQ
- **Documentación API**: OpenAPI/Swagger automático
- **Testing integrado**: Framework de tests robusto

### Restricciones

- **Lenguaje**: Node.js + TypeScript (experiencia del equipo)
- **Desarrollo individual**: Framework que facilite buenas prácticas sin overhead
- **Escalabilidad**: Debe soportar extracción a microservicios en el futuro
- **Ecosistema**: Librería activa y bien documentada

---

## Decisión

**Usar NestJS** como framework principal para el backend.

NestJS proporciona:
- Arquitectura modular out-of-the-box
- Decoradores para routing, validación, guards
- Inyección de dependencias nativa
- Soporte first-class para TypeScript
- Integración directa con BullMQ, Socket.io, Swagger

---

## Justificación

### Análisis de Alternativas

| Framework | Pros | Contras | Veredicto |
|-----------|------|---------|-----------|
| **NestJS** | • Arquitectura modular nativa<br>• DDD-friendly<br>• TypeScript first-class<br>• DI integrada<br>• Ecosystem maduro<br>• Decoradores expresivos | • Curva de aprendizaje media<br>• Más opinado (menos flexible) | ✅ Seleccionado |
| **Express.js** | • Minimalista<br>• Máxima flexibilidad<br>• Ecosistema gigante | • Sin estructura (todo manual)<br>• DI manual<br>• Escalabilidad requiere disciplina | ❌ Requiere mucho boilerplate |
| **Fastify** | • Alto rendimiento<br>• Moderno<br>• Schema validation nativo | • Menos opinado<br>• Ecosistema más pequeño<br>• Sin DI nativa | ❌ Más trabajo manual |
| **Koa** | • Middleware limpio<br>• Async/await nativo | • Minimalista extremo<br>• Sin estructura<br>• Ecosistema limitado | ❌ Muy básico |

### Razones Principales

1. **Arquitectura Modular Nativa**:
   ```typescript
   @Module({
     imports: [OrdersModule, AddressesModule],
     providers: [ConversationService],
     exports: [ConversationService],
   })
   export class ConversationsModule {}
   ```
   Los módulos de NestJS mapean perfectamente a bounded contexts de DDD.

2. **TypeScript First-Class**:
   - Decoradores nativos (`@Controller`, `@Get`, `@Body`)
   - Type inference completo
   - Sin configuración adicional

3. **Inyección de Dependencias**:
   ```typescript
   @Injectable()
   export class ConversationService {
     constructor(
       private readonly orderRepo: OrderRepository,
       private readonly openaiService: OpenAIService,
     ) {}
   }
   ```
   Facilita testing y desacoplamiento.

4. **Integración con Herramientas Clave**:
   - **BullMQ**: `@nestjs/bull` oficial
   - **Socket.io**: `@nestjs/websockets` oficial
   - **Swagger**: `@nestjs/swagger` genera OpenAPI automáticamente
   - **Prisma**: Integración limpia con decoradores

5. **Validación Declarativa**:
   ```typescript
   @Post()
   async create(@Body() dto: CreateOrderDto) {
     // dto ya validado automáticamente
   }
   
   class CreateOrderDto {
     @IsString()
     @IsNotEmpty()
     external_order_id: string;
     
     @IsNumber()
     @Min(0)
     total_amount: number;
   }
   ```

6. **Testing Robusto**:
   - Framework de testing integrado
   - Mocking de dependencias simplificado
   - Unit, integration y E2E tests

7. **Middleware y Guards**:
   ```typescript
   @UseGuards(AuthGuard)
   @Controller('orders')
   export class OrdersController {
     // Rutas protegidas
   }
   ```

### Criterios de Evaluación

- ✅ **Productividad**: Decoradores + DI reducen boilerplate
- ✅ **Mantenibilidad**: Arquitectura modular clara
- ✅ **Type Safety**: TypeScript nativo sin configuración
- ✅ **Escalabilidad**: Módulos extraíbles a microservicios
- ✅ **Testing**: Framework integrado completo
- ✅ **Ecosistema**: Librerías oficiales para necesidades comunes

---

## Consecuencias

### ✅ Positivas

- **Estructura clara**: Módulos, providers, controllers organizados por defecto
- **Menos código boilerplate**: Decoradores + DI eliminan 30-40% de código repetitivo
- **Type safety E2E**: Types compartidos entre cliente y servidor
- **Documentación automática**: Swagger generado desde decoradores
- **Testing simplificado**: `TestingModule` facilita mocking
- **Comunidad activa**: Documentación excelente, ejemplos abundantes
- **Futuro microservicios**: Módulos NestJS se convierten en servicios fácilmente

### ❌ Negativas (Trade-offs)

- **Curva de aprendizaje**: Requiere entender decoradores, DI, módulos
  - *Mitigación*: Documentación oficial excelente + experiencia previa con Angular (similar)
- **Más opinado**: Menos flexible que Express puro
  - *Mitigación*: Opiniones alineadas con buenas prácticas
- **Overhead inicial**: Setup más complejo que Express básico
  - *Mitigación*: CLI de NestJS genera boilerplate automáticamente
- **Bundle size**: Ligeramente mayor que frameworks minimalistas
  - *Mitigación*: No crítico para backend (no afecta UX del cliente)

### 🔧 Deuda Técnica Introducida

- **Ninguna significativa**: NestJS está diseñado para long-term maintainability

---

## Implementación

### Estructura de Carpetas (Siguiendo NestJS + DDD)

```
apps/api/src/
├── main.ts                           # Entry point
├── app.module.ts                     # Root module
│
├── conversations/                    # Bounded Context: Conversations
│   ├── domain/
│   │   ├── entities/
│   │   │   └── conversation.entity.ts
│   │   ├── value-objects/
│   │   │   └── message.vo.ts
│   │   └── repositories/
│   │       └── conversation.repository.interface.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── start-conversation.use-case.ts
│   │   │   └── send-message.use-case.ts
│   │   └── dtos/
│   │       └── create-conversation.dto.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── conversation.repository.ts
│   │   │   └── message.repository.ts
│   │   ├── openai/
│   │   │   └── openai.service.ts
│   │   └── websockets/
│   │       └── conversation.gateway.ts
│   │
│   ├── presentation/
│   │   └── controllers/
│   │       └── conversations.controller.ts
│   │
│   └── conversations.module.ts       # Module definition
│
├── orders/                           # Bounded Context: Orders
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/
│   └── orders.module.ts
│
├── addresses/                        # Bounded Context: Addresses
│   └── addresses.module.ts
│
├── users/                            # Bounded Context: Users
│   └── users.module.ts
│
├── stores/                           # Bounded Context: Stores
│   └── stores.module.ts
│
└── shared/                           # Código compartido
    ├── filters/
    │   └── http-exception.filter.ts
    ├── guards/
    │   └── auth.guard.ts
    ├── interceptors/
    │   └── logging.interceptor.ts
    └── decorators/
        └── current-user.decorator.ts
```

### Ejemplo de Código: Module Definition

```typescript
// conversations.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ConversationsController } from './presentation/controllers/conversations.controller';
import { ConversationGateway } from './infrastructure/websockets/conversation.gateway';
import { StartConversationUseCase } from './application/use-cases/start-conversation.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { MessageRepository } from './infrastructure/repositories/message.repository';
import { OpenAIService } from './infrastructure/openai/openai.service';

import { OrdersModule } from '../orders/orders.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    OrdersModule,      // Dependencias explícitas
    AddressesModule,
    BullModule.registerQueue({
      name: 'conversations',
    }),
  ],
  controllers: [ConversationsController],
  providers: [
    // Gateways
    ConversationGateway,
    
    // Use Cases
    StartConversationUseCase,
    SendMessageUseCase,
    
    // Repositories
    ConversationRepository,
    MessageRepository,
    
    // Services
    OpenAIService,
  ],
  exports: [
    StartConversationUseCase,  // Exporta para otros módulos
  ],
})
export class ConversationsModule {}
```

### Ejemplo: Controller con Validación

```typescript
// conversations.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { StartConversationUseCase } from '../application/use-cases/start-conversation.use-case';
import { CreateConversationDto } from '../application/dtos/create-conversation.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly startConversation: StartConversationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Inicia una nueva conversación' })
  async create(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: User,
  ) {
    return this.startConversation.execute(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una conversación' })
  async findOne(@Param('id') id: string) {
    return this.conversationRepo.findById(id);
  }
}
```

### Ejemplo: DTO con Validación

```typescript
// create-conversation.dto.ts
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ConversationType {
  GET_ADDRESS = 'GET_ADDRESS',
  INFORMATION = 'INFORMATION',
  REGISTER = 'REGISTER',
}

export class CreateConversationDto {
  @ApiProperty({ description: 'ID del pedido' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ enum: ConversationType })
  @IsEnum(ConversationType)
  conversation_type: ConversationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  initial_message?: string;
}
```

---

## Integración con Herramientas

### BullMQ (Colas de Trabajos)

```typescript
// conversation.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('conversations')
export class ConversationProcessor {
  @Process('process-message')
  async handleMessage(job: Job<ProcessMessageJobData>) {
    // Procesa mensaje con OpenAI
    const response = await this.openaiService.generateResponse(job.data);
    return response;
  }
}
```

### WebSockets (Tiempo Real)

```typescript
// conversation.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/conversations' })
export class ConversationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('send-message')
  async handleMessage(client: Socket, payload: SendMessagePayload) {
    // Procesa mensaje
    const response = await this.sendMessage.execute(payload);
    
    // Emite respuesta
    this.server.to(payload.conversation_id).emit('new-message', response);
  }
}
```

### Swagger (Documentación API)

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Adresles API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

## Métricas de Éxito

- 📊 **Tiempo de desarrollo**: -30% código boilerplate vs Express puro
- 📊 **Cobertura de tests**: > 80% (facilitado por TestingModule)
- 📊 **Onboarding nuevo dev**: < 1 semana para ser productivo (arquitectura clara)
- 📊 **Documentación API**: 100% automática (Swagger desde decoradores)
- 📊 **Bugs relacionados con types**: < 5% (TypeScript strict mode)

---

## Referencias

- **Documento fuente**: [Adresles_Business.md - Sección 4.5](../../Adresles_Business.md#45-estructura-del-proyecto)
- **Registro de Decisiones**: [Adresles_Business.md - Decisión 30/01/2026](../../Adresles_Business.md#registro-de-decisiones)
- **Backend Standards**: [.cursor/rules/backend-standards.mdc](../../.cursor/rules/backend-standards.mdc)
- **NestJS Docs**: https://docs.nestjs.com/
- **NestJS + DDD**: https://github.com/nestjs/nest/tree/master/sample/14-typeorm-ddd
- **ADR relacionado**: [ADR-001: Monolito Modular](./001-monolith-modular.md)

---

## Notas de Revisión

### 2026-01-30: Decisión inicial

- NestJS elegido por estructura modular alineada con DDD
- Experiencia previa con Angular (arquitectura similar) facilita adopción
- Integración nativa con BullMQ crítica para Worker de conversaciones

### 2026-03-07: Revisión post-implementación MVP

- **Socket.io → SSE**: La `ConversationGateway` planificada (Socket.io + `@nestjs/websockets`) **no se implementó**. En su lugar, se usa **Server-Sent Events (SSE)** con Redis Pub/Sub para comunicación en tiempo real. El backend expone endpoints SSE en el módulo `Mock`, y el frontend usa `EventSource` nativo. Swagger se usa solo en desarrollo (no en producción).
- **Arquitectura real de módulos**: Ver `ADR-001` actualizado para la estructura de módulos real: `Orders`, `Users`, `Conversations`, `Addresses`, `Mock`, `Admin`, `EcommerceSync`, `Queue`, `Prisma`.

---

**Creado por**: Sergio  
**Última actualización**: 2026-03-07  
**Próxima revisión**: Tras 3 meses de desarrollo (validar productividad real)
