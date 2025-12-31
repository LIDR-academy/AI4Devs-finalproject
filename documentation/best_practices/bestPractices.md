# Guía de Buenas Prácticas Proyecto UNLOKD

Este documento resume las principales buenas prácticas de diseño que se utilizarán en el proyecto UNLOKD, con foco en Domain-Driven Design (DDD), principios SOLID y DRY, aplicados al stack NestJS + TypeScript + MySQL.

---

## 1. Domain-Driven Design (DDD)

La lógica de negocio de UNLOKD (mensajes condicionados, desbloqueo, intentos, etc.) se organiza siguiendo principios de DDD: se modelan **entidades**, **value objects**, **agregados**, **repositorios** y **servicios de dominio** que reflejan el lenguaje ubicuo del producto.

### 1.1. Value Objects

Value Objects describen aspectos del dominio sin identidad propia, definidos por sus atributos (por ejemplo, una condición de desbloqueo de tipo “contraseña numérica” o “fecha de desbloqueo”).

**Antes (condiciones como tipos primitivos dispersos)**
```
// Mezcla de datos sin encapsulación
const conditionType = "PASSWORD";
const password = "1234";
const maxAttempts = 3;

// Lógica de validación repetida en varios servicios
if (conditionType === "PASSWORD") {
    if (!input || input !== password) {
    // manejar intento fallido...
    }
}
```
**Después (Value Object `PasswordCondition`)**
```
export class PasswordCondition {
    constructor(
        private readonly password: string,
        private readonly maxAttempts: number,
) {}

validate(input: string, currentAttempts: number): boolean {
    if (currentAttempts >= this.maxAttempts) return false;
        return input === this.password;
    }
}
```


**Explicación:**  
El VO encapsula la lógica de validación y las reglas de intentos máximos, evitando duplicar condiciones en múltiples servicios y concentrando el conocimiento del dominio en un solo lugar.

---

### 1.2. Agregados

Un agregado agrupa entidades y value objects que deben ser tratados como una unidad consistente, por ejemplo, un **Mensaje Condicionado** que incluye su contenido, estado, condiciones y contador de intentos.

**Antes (mensaje y condición separados sin invariantes)**
```
// Mensaje y condición gestionados por separado
const message = await messagesRepository.findById(messageId);
const condition = await conditionsRepository.findByMessageId(messageId);

// En el servicio se mezclan muchas reglas:
if (condition.type === "PASSWORD") {
    // validar intentos, estado, etc.
}
```

**Después (agregado `ConditionalMessageAggregate`)**
```
export class ConditionalMessageAggregate {
    constructor(
        private readonly message: Message,
        private readonly condition: Condition,
    ) {}

    canBeUnlocked(input: any, now: Date): boolean {
        return this.condition.validate(input, now, this.message);
    }

    markAsUnlocked() {
        this.message.status = "UNLOCKED";
        this.message.unlockedAt = new Date();
    }
}
```

**Explicación:**  
El agregado garantiza que las reglas de desbloqueo y cambios de estado se apliquen de forma consistente, evitando estados inválidos (por ejemplo, mensaje desbloqueado sin cumplir la condición).

---

### 1.3. Repositorios

Los repositorios son interfaces que proporcionan acceso a agregados y entidades, aislando al dominio de detalles de persistencia (MySQL, Prisma/TypeORM, etc.).

**Antes (acceso directo a ORM dentro de servicios)**
```
@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaClient) {}

    async unlockMessage(id: string) {
        const message = await this.prisma.message.findUnique({ where: { id } });
        // lógica de dominio + SQL mezclados...
    }
}
```

**Después (interfaz de repositorio + implementación)**
```
export interface ConditionalMessageRepository {
    findById(id: string): Promise<ConditionalMessageAggregate | null>;
    save(aggregate: ConditionalMessageAggregate): Promise<void>;
}

@Injectable()
export class PrismaConditionalMessageRepository
implements ConditionalMessageRepository
{
    constructor(private prisma: PrismaClient) {}

    async findById(id: string): Promise<ConditionalMessageAggregate | null> {
        const row = await this.prisma.message.findUnique({
        where: { id },
        include: { condition: true },
    });
    if (!row) return null;
    return mapToAggregate(row);
}

    async save(aggregate: ConditionalMessageAggregate): Promise<void> {
        // mapear de vuelta y persistir
    }
}
```


**Explicación:**  
El dominio conoce solo la interfaz `ConditionalMessageRepository`, lo que facilita pruebas (mocks), cambios de tecnología de persistencia y mantiene el código más claro.

---

### 1.4. Servicios de Dominio

Los servicios de dominio encapsulan lógica de negocio que no pertenece naturalmente a una sola entidad o value object (por ejemplo, lógica que involucra varios agregados o políticas de negocio globales).

**Antes (controlador con lógica de desbloqueo compleja)**
```
@Post(":id/unlock")
async unlock(@Param("id") id: string, @Body() body: any) {
    const message = await this.messagesRepo.findById(id);
    const condition = await this.conditionsRepo.findByMessageId(id);
    // reglas complejas aquí...
}
```

**Después (servicio de dominio `UnlockMessageService`)**
```
@Injectable()
export class UnlockMessageService {
    constructor(
        private readonly repo: ConditionalMessageRepository,
    ) {}

async execute(command: UnlockMessageCommand): Promise<UnlockResult> {
    const aggregate = await this.repo.findById(command.messageId);
    if (!aggregate) throw new NotFoundException();
    if (!aggregate.canBeUnlocked(command.input, new Date())) {
        return { success: false, reason: "INVALID_CONDITION" };
    }

    aggregate.markAsUnlocked();
    await this.repo.save(aggregate);

    return { success: true };
    }
}
```

**Explicación:**  
El servicio de dominio concentra la lógica de desbloqueo, permitiendo que controladores y gateways WebSocket sean capas finas que sólo orquestan entrada/salida.

---

## 2. Principios SOLID y DRY

Los módulos NestJS se diseñan siguiendo SOLID para mejorar mantenibilidad y extensibilidad, y se aplica DRY para evitar duplicar lógica de negocio y validación en distintos puntos de la aplicación.

### 2.1. S - Single Responsibility Principle (SRP)

Cada clase debería tener una única **responsabilidad clara**, por ejemplo, un servicio para lógica de dominio y un repositorio para acceso a datos.

**Antes (servicio con demasiadas responsabilidades)**
```
@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaClient) {}

    async createAndNotify(dto: CreateMessageDto) {
    // validar DTO
    // crear mensaje
    // guardar en DB
    // enviar notificación push
    // emitir evento WebSocket
    }
}
```

**Después (servicios separados por responsabilidad)**
```
@Injectable()
export class MessagesService {
    constructor(private readonly repo: ConditionalMessageRepository) {}

    async create(dto: CreateMessageDto) {
        // lógica para crear agregado y guardarlo
    }
}

@Injectable()
export class NotificationService {
    async sendNewMessageNotification(messageId: string) {
    // lógica de notificaciones
    }
}
```


**Explicación:**  
Separar responsabilidades evita clases “Dios” y facilita el testeo unitario de cada parte.

---

### 2.2. O - Open/Closed Principle (OCP)

Las clases deben estar **abiertas a extensión** pero **cerradas a modificación**, permitiendo añadir nuevas condiciones de desbloqueo sin romper código existente.

**Antes (switch gigante en el servicio)**
```
switch (condition.type) {
    case "PASSWORD":
    // validar password
    break;
    case "TIME":
    // validar fecha
    break;
    // cada nuevo tipo implica modificar este switch
}
```

**Después (polimorfismo con estrategia de condición)**
```
export interface ConditionStrategy {
    supports(type: string): boolean;
    validate(input: any, now: Date, message: Message): boolean;
}
```

**Explicación:**  
Agregar un nuevo tipo de condición implica crear una nueva estrategia que implemente la interfaz, sin tocar el código que ya funciona.

---

### 2.3. L - Liskov Substitution Principle (LSP)

Las subclases deben poder sustituir a sus superclases sin romper el comportamiento esperado; en UNLOKD aplica principalmente a interfaces de servicios y repositorios.

**Ejemplo:**  
Si `PrismaConditionalMessageRepository` implementa `ConditionalMessageRepository`, cualquier uso de la interfaz debería funcionar igual si se reemplaza por una implementación en memoria para tests.

---

### 2.4. I - Interface Segregation Principle (ISP)

Es preferible tener **interfaces específicas** para cada necesidad, en lugar de una interfaz general y pesada.

**Antes (repositorio gigante)**
```
export interface GenericRepository {
    findAll();
    findById(id: string);
    update(entity: any);
    delete(id: string);
    findByUserAndStatus(userId: string, status: string);
    // ...
}
```

**Después (interfaces más pequeñas y enfocadas)**
```
export interface ConditionalMessageRepository {
    findById(id: string): Promise<ConditionalMessageAggregate | null>;
    save(aggregate: ConditionalMessageAggregate): Promise<void>;
}
```

**Explicación:**  
Interfaces pequeñas facilitan mocks y minimizan dependencias innecesarias entre módulos.

---

### 2.5. D - Dependency Inversion Principle (DIP)

Los módulos de alto nivel dependen de **abstracciones**, no de implementaciones concretas, facilitando cambios de infraestructura (por ejemplo, de Prisma a TypeORM o de MySQL a otro motor).

**Antes (dependencia directa del ORM)**
```
@Injectable()
export class UnlockMessageService {
    constructor(private prisma: PrismaClient) {}
}
```

**Después (inyección de repositorio como abstracción)**
```
@Injectable()
export class UnlockMessageService {
    constructor(
    @Inject("ConditionalMessageRepository")
        private readonly repo: ConditionalMessageRepository,
    ) {}
}
```

**Explicación:**  
El servicio no conoce detalles de MySQL o Prisma; solo requiere una interfaz que pueda ser implementada por distintas tecnologías.

---

### 2.6. DRY (Don't Repeat Yourself)

Se evita duplicar lógica de negocio, validaciones y transformaciones entre distintas capas; en su lugar se centraliza en servicios, value objects o utilidades compartidas.

**Antes (validación de condición repetida en varios controladores/gateways)**
```
/ Controller
if (dto.password.length < 4) throw new Error("Too short");

// Gateway WebSocket
if (payload.password.length < 4) throw new Error("Too short");
```

**Después (validador reutilizable)**
```
export class PasswordValidator {
    static validate(password: string): void {
        if (!password || password.length < 4) {
            throw new Error("Password demasiado corta");
        }
    }
}
```

**Explicación:**  
Cualquier cambio en la regla (por ejemplo, longitud mínima) se hace en un solo lugar, reduciendo errores y divergencias.

---

## 3. Resumen de aplicación en UNLOKD

- DDD guía la forma en que se modelan mensajes condicionados, intentos de desbloqueo y reglas de negocio, usando agregados, value objects y servicios de dominio.
- SOLID garantiza que los módulos NestJS sean fáciles de mantener, extender y probar a medida que se añaden nuevas condiciones y funcionalidades.
- DRY evita duplicar lógica crítica (validaciones, reglas de condiciones), lo que reduce inconsistencias entre API REST y WebSocket, y facilita la evolución del sistema.

