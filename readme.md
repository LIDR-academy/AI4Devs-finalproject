## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Nombre completo: Xavier Vergés Marín**

### **0.2. Nombre del proyecto: **

Clickoteca

### **0.3. Descripción breve del proyecto:**

**Clickoteca** es una *biblioteca de sets de Lego por suscripción*: el
suscriptor recibe un set, lo disfruta y lo devuelve para pedir otro. Este PRD
cubre el **MVP**: el circuito completo end-to-end (suscripción → selección →
cola de reservas → alquiler → devolución → inspección → higienización → vuelta
a circulación), tanto desde la cara del **suscriptor** como desde el
**back-office** (operadores + admin).

### **0.4. URL del proyecto:**

https://github.com/xaviverges/AI4Devs-finalproject-xvm/tree/project-xvm

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

- **Historial de alquileres del suscriptor ("Mis sets")**: vista con los sets que
  tiene actualmente en préstamo, el histórico de alquileres pasados y su posición
  en la(s) cola(s) de reservas activas.
- **Cancelación de la suscripción (camino feliz)**: el suscriptor puede
  cancelar/pausar su suscripción cuando no tiene ninguna copia en su poder; el
  sistema confirma que no hay devoluciones pendientes ni saldo pendiente antes de
  completar la baja.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

Capa de datos en **PostgreSQL + Prisma**. El esquema ejecutable vive en
[`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) y su especificación
detallada (con diagramas por anillos de importancia y decisiones de modelado) en
[`documents/PRD.md` §15](documents/PRD.md). Los modelos van en inglés (convención
Prisma) y mapean a los términos de dominio en español.

Las entidades se organizan en tres anillos por orden de importancia:

- **Anillo 1 — Núcleo del circuito E2E:** `User`, `Set`, `Copy`, `Subscription`,
  `Rental`, `ReservationQueueEntry`, `ReservationOffer`.
- **Anillo 2 — Operación y trazabilidad:** `ConditionReport`, `Incident`,
  `CopyStateTransition`, `AuditLog`, `Notification`, `Shipment`.
- **Anillo 3 — Configuración y pagos (simulados):** `Plan`, `SystemSetting`,
  `RetentionReminderConfig`, `PaymentMethod`, `Payment`, `Address`, `Theme`,
  `MediaAsset`.

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    USER ||--o{ ADDRESS : posee
    USER ||--o{ SUBSCRIPTION : contrata
    PLAN ||--o{ SUBSCRIPTION : define
    USER ||--o{ RENTAL : alquila
    SUBSCRIPTION |o--o{ RENTAL : cubre
    THEME ||--o{ THEME : "sub-tema"
    THEME ||--o{ SET : agrupa
    SET ||--o{ COPY : "tiene copias"
    COPY ||--o{ RENTAL : "se alquila en"
    SET ||--o{ RESERVATION_QUEUE_ENTRY : "cola de"
    USER ||--o{ RESERVATION_QUEUE_ENTRY : "espera en"
    RESERVATION_QUEUE_ENTRY ||--o{ RESERVATION_OFFER : genera
    COPY ||--o{ RESERVATION_OFFER : "se ofrece como"
    RESERVATION_OFFER |o--o| RENTAL : "al aceptar crea"
    COPY ||--o{ COPY_STATE_TRANSITION : "historia de estados"
    USER ||--o{ COPY_STATE_TRANSITION : "actor"
    COPY ||--o{ CONDITION_REPORT : documenta
    RENTAL |o--o{ CONDITION_REPORT : "entrega/inspección"
    USER ||--o{ CONDITION_REPORT : operador
    COPY ||--o{ INCIDENT : afecta
    RENTAL |o--o{ INCIDENT : origina
    USER ||--o{ INCIDENT : "reporta"
    USER ||--o{ INCIDENT : "atiende"
    USER ||--o{ NOTIFICATION : recibe
    USER ||--o{ AUDIT_LOG : "acción admin"
    RENTAL ||--o{ SHIPMENT : mueve
    USER ||--o{ SHIPMENT : "marca (operador)"
    USER ||--o{ PAYMENT_METHOD : "tarjeta simulada"
    USER ||--o{ PAYMENT : realiza
    SUBSCRIPTION |o--o{ PAYMENT : "cuota mensual"
    RENTAL |o--o{ PAYMENT : "alquiler puntual"
    PAYMENT_METHOD |o--o{ PAYMENT : usa
    SET ||--o| RETENTION_REMINDER_CONFIG : "recordatorios"
    USER ||--o{ RETENTION_REMINDER_CONFIG : "activa (admin)"
    USER ||--o{ SYSTEM_SETTING : actualiza

    USER {
        uuid id PK
        string email UK "not null"
        string passwordHash "not null"
        enum role "SUBSCRIBER|OPERATOR|ADMIN"
        string fullName
        bool isAdult "declaración mayoría edad"
        enum status "ACTIVE|SUSPENDED"
        timestamptz createdAt
    }
    ADDRESS {
        uuid id PK
        uuid userId FK
        string line1
        string city
        string postalCode
        string country
        bool isDefault
    }
    PLAN {
        uuid id PK
        enum code UK "BASIC|PREMIUM"
        decimal monthlyPrice "configurable"
        int maxSimultaneousSets "1|2"
        int queueBonus "bono cola PREMIUM"
        bool active
    }
    SUBSCRIPTION {
        uuid id PK
        uuid userId FK
        uuid planId FK
        enum status "ACTIVE|PAUSED|CANCELLED"
        timestamptz startedAt
        timestamptz cancelledAt
    }
    THEME {
        uuid id PK
        string name
        uuid parentId FK "auto-relación (Rebrickable)"
    }
    SET {
        uuid id PK
        uuid themeId FK
        string name
        int pieceCount
        string recommendedAge "curado a mano"
        string difficulty "curado a mano"
        decimal referenceValue "obligatorio p/publicar"
        bool restricted "sujeto a antigüedad mín."
        bool published
    }
    COPY {
        uuid id PK
        uuid setId FK
        enum state "INTAKE..BAJA (9 estados)"
        timestamptz acquiredAt
        timestamptz retiredAt
    }
    RENTAL {
        uuid id PK
        uuid copyId FK
        uuid userId FK
        uuid subscriptionId FK "null si puntual"
        enum type "SUBSCRIPTION|ONE_OFF"
        enum status "ACTIVE|RETURN_INITIATED|IN_INSPECTION|COMPLETED"
        json shippingAddress "snapshot inmutable"
        decimal price "solo puntual"
        timestamptz startedAt
        timestamptz completedAt
    }
    RESERVATION_QUEUE_ENTRY {
        uuid id PK
        uuid setId FK
        uuid userId FK
        enum status "WAITING|OFFERED|CONFIRMED|EXPIRED|LEFT"
        int score "materializado: días_espera + bono_plan"
        int priorityPenalty "tras caducar oferta"
        timestamptz enqueuedAt
    }
    RESERVATION_OFFER {
        uuid id PK
        uuid queueEntryId FK
        uuid copyId FK
        uuid rentalId FK "UK, null hasta aceptar"
        enum status "PENDING|ACCEPTED|REJECTED|EXPIRED"
        timestamptz windowExpiresAt
        timestamptz reminderSentAt
    }
    COPY_STATE_TRANSITION {
        uuid id PK
        uuid copyId FK
        uuid actorId FK
        enum fromState
        enum toState
        string reason
        timestamptz createdAt
    }
    CONDITION_REPORT {
        uuid id PK
        uuid copyId FK
        uuid rentalId FK "null en alta"
        uuid operatorId FK
        enum kind "DELIVERY|INSPECTION"
        json checklist
        enum result "OK|INCOMPLETE|DAMAGED"
        timestamptz createdAt
    }
    INCIDENT {
        uuid id PK
        uuid copyId FK
        uuid rentalId FK
        uuid reportedById FK
        uuid assignedToId FK
        enum type "DELIVERY_DISCREPANCY|INCOMPLETE|DAMAGE|LOSS"
        enum status "OPEN|IN_PROGRESS|RESOLVED"
        timestamptz createdAt
    }
    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string type "QUEUE_TURN|OFFER_REMINDER|.."
        json payload
        timestamptz sentAt
        timestamptz readAt
    }
    AUDIT_LOG {
        uuid id PK
        uuid actorId FK
        string action
        string entityType
        uuid entityId
        json metadata
        timestamptz createdAt
    }
    SHIPMENT {
        uuid id PK
        uuid rentalId FK
        enum direction "OUTBOUND|RETURN"
        string status
        uuid markedByOperatorId FK
        timestamptz createdAt
    }
    PAYMENT_METHOD {
        uuid id PK
        uuid userId FK
        string brand
        string last4
        int expMonth
        int expYear
        bool isDefault
    }
    PAYMENT {
        uuid id PK
        uuid userId FK
        uuid subscriptionId FK
        uuid rentalId FK
        uuid paymentMethodId FK
        decimal amount
        enum kind "SUBSCRIPTION_MONTHLY|ONE_OFF_RENTAL"
        enum status "SIMULATED_PAID|FAILED"
    }
    RETENTION_REMINDER_CONFIG {
        uuid id PK
        uuid setId FK "UK (1:1 con Set)"
        bool enabled
        int cadenceDays
        uuid activatedByAdminId FK
    }
    SYSTEM_SETTING {
        string key PK
        json value
        uuid updatedById FK
        timestamptz updatedAt
    }
    MEDIA_ASSET {
        uuid id PK
        enum ownerType "SET|CONDITION_REPORT"
        uuid ownerId "referencia polimórfica (sin FK)"
        string url
        enum kind "BOX_PHOTO|CHECKLIST_PHOTO"
    }
```

> Nota: `MEDIA_ASSET` usa una referencia polimórfica (`ownerType` + `ownerId`)
> hacia `Set` o `ConditionReport`, por lo que no tiene FK de BD (integridad
> validada en la aplicación) y aparece sin arista en el diagrama.

### **3.2. Descripción de entidades principales:**

Claves: **PK** primaria, **FK** foránea, **UK** única. Todos los `id` son `uuid`
(`@default(uuid())`); los timestamps son `timestamptz`.

**Anillo 1 — Núcleo del circuito E2E**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **User** | Cuenta única con rol; un solo modelo cubre suscriptor, operador y admin (no hay entidad `Employee` en el MVP). | `role` (SUBSCRIBER/OPERATOR/ADMIN), `email` **UK**, `isAdult`. 1—N con casi todas las entidades operativas. |
| **Set** | Modelo de catálogo (semilla Rebrickable). No publicable sin `referenceValue`. | `referenceValue` **not null**, `restricted`, `published`; FK `themeId`. 1—N con `Copy` y `ReservationQueueEntry`. |
| **Copy** | Unidad física concreta de un Set; portadora del estado del ciclo de vida (9 estados). | `state` (enum `CopyState`); FK `setId`. 1—N con `Rental`, `ConditionReport`, `Incident`, `CopyStateTransition`. |
| **Subscription** | Suscripción de un usuario a un plan. | `status` (ACTIVE/PAUSED/CANCELLED); FK `userId`, `planId`. |
| **Rental** | Alquiler de una copia por un usuario. `subscriptionId` nulo ⇒ alquiler puntual. | `type` (SUBSCRIPTION/ONE_OFF), `shippingAddress` (snapshot JSON inmutable), `price` (solo puntual); FK `copyId`, `userId`, `subscriptionId?`. 1—1 opcional con `ReservationOffer`. |
| **ReservationQueueEntry** | Entrada en la cola de un Set. Una cola por Set. | `score` **materializado** (`días_espera + bono_plan`, recalculado), `priorityPenalty`, `status`; FK `setId`, `userId`. |
| **ReservationOffer** | Oferta de una copia al cabeza de cola dentro de la ventana de confirmación. Una entrada puede recibir varias ofertas. | `windowExpiresAt`, `status`; FK `queueEntryId`, `copyId`, `rentalId?` **UK**. |

**Anillo 2 — Operación y trazabilidad**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **ConditionReport** | Registro de condición en la entrega (`DELIVERY`) o en la inspección de devolución (`INSPECTION`). | `kind`, `result` (OK/INCOMPLETE/DAMAGED), `checklist` (JSON); FK `copyId`, `rentalId?`, `operatorId`. |
| **Incident** | Discrepancia reportada por el suscriptor (sin imputársela) o copia incompleta/dañada/perdida detectada por operador. | `type`, `status`; FK `copyId`, `rentalId?`, `reportedById`, `assignedToId?`. |
| **CopyStateTransition** | Historia auditada del ciclo de vida de la copia ("quién/cuándo"). | `fromState`, `toState`; FK `copyId`, `actorId`. |
| **AuditLog** | Auditoría genérica de acciones administrativas (config, gestión de empleados). | `action`, `entityType`, `entityId`, `metadata`; FK `actorId`. |
| **Notification** | Aviso al suscriptor o al back-office dirigido por eventos de dominio. | `type`, `payload`, `readAt`; FK `userId`. |
| **Shipment** | Movimiento logístico simulado; lo marca un operador manualmente. | `direction` (OUTBOUND/RETURN); FK `rentalId`, `markedByOperatorId?`. |

**Anillo 3 — Configuración y pagos (simulados)**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **Plan** | Plan de suscripción configurable. | `code` **UK** (BASIC/PREMIUM), `monthlyPrice`, `maxSimultaneousSets`, `queueBonus`. |
| **PaymentMethod** | Tarjeta simulada (tokenizada ficticia). | `brand`, `last4`, `exp*`; FK `userId`. |
| **Payment** | Cargo simulado: cuota mensual o alquiler puntual. | `kind`, `amount`, `status`; FK `userId`, `subscriptionId?`, `rentalId?`, `paymentMethodId?`. |
| **RetentionReminderConfig** | Activación por admin de recordatorios de retención de un Set (1:1 con `Set`). | `enabled`, `cadenceDays`; FK `setId` **UK**, `activatedByAdminId?`. |
| **SystemSetting** | Parámetros configurables (clave-valor): ventana de confirmación, cadencia, límite de colas, antigüedad mínima, bono premium. | `key` **PK**, `value` (JSON); FK `updatedById?`. |
| **Address** | Dirección de envío/contacto. `Rental` captura un snapshot, por lo que editar aquí solo afecta a envíos futuros. | `isDefault`; FK `userId`. |
| **Theme** | Tema del catálogo con jerarquía (auto-relación padre/hijo). | `parentId?` (auto-FK). 1—N con `Set`. |
| **MediaAsset** | Adjuntos (fotos). Referencia polimórfica a `Set` o `ConditionReport`. | `ownerType`, `ownerId` (sin FK de BD), `kind`. |

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

