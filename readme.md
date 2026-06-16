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

### **0.1. Tu nombre completo:**
Diego Zamora

### **0.2. Nombre del proyecto:**
ConectaPH

### **0.3. Descripción breve del proyecto:**
ConectaPH es una plataforma web para copropiedades que facilita la gestión de reservas de zonas comunes, conectando residentes, administración y vigilancia en un flujo digital transparente y seguro.

### **0.4. URL del proyecto:**
https://github.com/dfzamora1/AI4Devs-finalproject-DZ

### 0.5. URL o archivo comprimido del repositorio

Repositorio local: `c:\Desarrollos\Lidr\AI4Devs-finalproject-DZ`

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

ConectaPH es una plataforma web diseñada para mejorar la gestión de la copropiedad mediante la conexión entre residentes, administración y vigilancia. El MVP se enfoca en la gestión de reservas de zonas comunes, reduciendo fricciones, evitando sobre-reservas y aportando transparencia a la comunidad.

### **1.2. Características y funcionalidades principales:**

Funcionalidades básicas del MVP de reservas de zonas comunes:

1. Registro y autenticación de residentes y personal autorizado.
2. Visualización del calendario de disponibilidad de zonas comunes.
3. Solicitud de reserva de salón, gimnasio, parque o salón de eventos.
4. Aprobación automática o manual de reservas según reglas definidas.
5. Histórico de reservas y detalles de cada evento.
6. Notificaciones por correo o en la aplicación sobre el estado de la reserva.
7. Gestión de invitados autorizados para cada reserva.
8. Restricción de reservas por tiempos máximos y número de eventos por residente.

Prioridad de mayor a menor:

1. Registro y autenticación de residentes y personal.
2. Calendario de disponibilidad de zonas comunes.
3. Solicitud de reserva de zonas comunes.
4. Aprobación y confirmación de reservas.
5. Notificaciones del estado de la reserva.
6. Histórico de reservas.
7. Gestión de invitados autorizados.
8. Reglas de restricción de tiempos y validación de disponibilidad.

### **1.3. Diseño y experiencia de usuario:**

La experiencia de usuario del MVP se centra en un flujo simple y claro:

- El residente accede con sus credenciales y ve el calendario de zonas comunes.
- Selecciona la zona, la fecha y la hora deseada.
- Envía la solicitud y recibe confirmación o solicitud de más información.
- La administración revisa y aprueba la reserva si es necesario.
- El residente recibe notificaciones y puede ver su reserva dentro del historial.

La interfaz está pensada para que cualquier residente pueda gestionar reservas sin entrenamiento: calendario visible, botones de acción claros y mensajes de estado directos.

### **1.4. Beneficios para la copropiedad:**

- Reducción de conflictos por reservas duplicadas o mal comunicadas.
- Ahorro de tiempo para residentes, administración y vigilancia.
- Mejor control sobre el uso de espacios comunes.
- Transparencia en el proceso de reserva y en el historial de uso.
- Mayor seguridad con invitados autorizados vinculados a cada evento.
- Mejora en la gestión documental de autorizaciones y cambios.

### **1.5. Alternativas manuales actuales y sus problemas:**

Alternativas manuales comunes:

- Reservas por papel y pizarras en portería.
- Mensajes y llamadas entre residentes y administración.
- Hojas de cálculo compartidas o bitácoras físicas.
- Carteles o avisos impresos en zonas comunes.

Problemas de estas alternativas:

- Falta de actualización en tiempo real y errores de doble reserva.
- Dependencia del personal de portería o de un responsable único.
- Pérdida de registros y dificultades para rastrear autorizaciones.
- Baja visibilidad para residentes que no están presentes en el edificio.
- Vulnerabilidad a malentendidos y conflictos entre vecinos.

### **1.6. Customer journey del residente que reserva una zona común:**

1. El residente ingresa a ConectaPH con usuario y contraseña.
2. Accede al módulo de reservas y visualiza el calendario de zonas comunes.
3. Selecciona la zona disponible, fecha y horario preferido.
4. Completa la solicitud indicando invitados y propósito de la reserva.
5. Envía la reserva y recibe confirmación inmediata o en espera de aprobación.
6. Recibe notificación cuando la reserva está confirmada.
7. Si la reserva es aprobada, el residente ve la cita en su historial.
8. En el día de la reserva, el residente y sus invitados presentan la autorización a vigilancia si es necesario.

### **1.7. Customer journey de vigilancia al consultar invitados autorizados:**

1. Vigilancia accede a ConectaPH con su cuenta de seguridad.
2. En el panel de eventos, busca la reserva activa de la zona común.
3. Visualiza los datos de la reserva: responsable, fecha, horario y lista de invitados autorizados.
4. Comprueba la identidad de los visitantes en la entrada.
5. Marca el acceso autorizado o solicita verificación adicional si alguien no coincide.
6. Si hay cambios en la lista de invitados, la vigilancia revisa la actualización en el sistema.
7. Al final del evento, puede registrar observaciones o cerrar el estado de la reserva si corresponde.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

ConectaPH sigue una arquitectura de **tres capas (3-Tier)** con separación clara entre frontend, backend y base de datos. Este patrón fue elegido por:

- **Escalabilidad:** Permite agregar recursos de forma independiente a cada capa.
- **Mantenibilidad:** Facilita el testing y cambios en cada componente sin afectar otros.
- **Seguridad:** Los datos están protegidos en la capa de backend, no expuestos directamente.
- **Flexibilidad:** Permite futuros cambios en tecnologías sin impactar toda la arquitectura.

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Aplicación Web - React/Vue]
        MOBILE[Interfaz Mobile-Responsive]
    end
    
    subgraph "Backend Layer"
        API[REST API]
        AUTH[Autenticación JWT]
        BIZ[Lógica de Negocio]
        NOTIF[Sistema de Notificaciones]
    end
    
    subgraph "Data Layer"
        DB[(Base de Datos - PostgreSQL)]
        CACHE[Cache - Redis]
    end
    
    subgraph "External Services"
        EMAIL[Servicio Email]
        LOGS[Sistema de Logs]
    end
    
    WEB -->|HTTP/HTTPS| API
    MOBILE -->|HTTP/HTTPS| API
    API --> AUTH
    AUTH --> BIZ
    BIZ --> NOTIF
    BIZ --> DB
    API --> CACHE
    NOTIF --> EMAIL
    BIZ --> LOGS
```

---

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Descripción |
|-----------|-----------|------------|
| **Frontend** | React / Vue.js | Interfaz web responsive para usuarios finales |
| **Backend** | Node.js / Express o Python/Django | REST API que gestiona toda la lógica de negocio |
| **Autenticación** | JWT (JSON Web Tokens) | Seguridad sin estado para usuarios |
| **Base de Datos** | PostgreSQL | Base de datos relacional robusta |
| **Cache** | Redis | Caché de sesiones y datos frecuentes |
| **Notificaciones** | SendGrid / NodeMailer | Envío de emails de confirmación y alertas |
| **Hosting** | AWS / Azure / GCP | Infraestructura en la nube escalable |
| **Logs** | ELK Stack / CloudWatch | Monitoreo y análisis de eventos |

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
ConectaPH/
├── frontend/                    # Aplicación cliente (React/Vue)
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales (Dashboard, Reservas, etc.)
│   │   ├── services/           # Servicios API
│   │   ├── store/              # Estado global (Vuex/Redux)
│   │   └── styles/             # Estilos CSS/SCSS
│   └── package.json
│
├── backend/                     # API REST
│   ├── src/
│   │   ├── controllers/        # Controladores (lógica de rutas)
│   │   ├── models/             # Modelos de datos y ORM
│   │   ├── services/           # Lógica de negocio
│   │   ├── middlewares/        # Middlewares (autenticación, validación)
│   │   ├── routes/             # Definición de endpoints
│   │   ├── utils/              # Funciones auxiliares
│   │   └── config/             # Configuración de la app
│   ├── tests/                  # Tests unitarios e integración
│   └── package.json / requirements.txt
│
├── database/                    # Scripts de base de datos
│   ├── migrations/             # Migraciones de esquema
│   ├── seeds/                  # Datos iniciales
│   └── schema.sql              # Definición del esquema
│
├── docs/                        # Documentación
│   ├── API_Endpoints.md        # Especificación de endpoints
│   ├── Database_Schema.md      # Modelo de datos
│   └── DEPLOYMENT.md           # Instrucciones de despliegue
│
└── README.md
```

**Patrón arquitectónico:** MVC (Model-View-Controller)
- **Model:** Entidades de base de datos y lógica de datos
- **View:** Componentes React/Vue que presentan información
- **Controller:** Endpoints que orquestan la lógica entre vistas y modelos

---

### **2.4. Infraestructura y despliegue**

```mermaid
graph LR
    USER[Usuario] -->|Browser| CDN[CDN - Assets Estáticos]
    USER -->|HTTPS| LB[Load Balancer]
    LB -->|Distribuye| INST1[Instancia Backend 1]
    LB -->|Distribuye| INST2[Instancia Backend 2]
    LB -->|Distribuye| INST3[Instancia Backend N]
    
    INST1 --> POOL[(Connection Pool)]
    INST2 --> POOL
    INST3 --> POOL
    
    POOL --> DB[(PostgreSQL<br/>Primary)]
    DB -->|Replicación| DBREPLICA[(PostgreSQL<br/>Replica)]
    
    INST1 --> REDIS[Redis Cache]
    INST1 --> QUEUE[Message Queue<br/>RabbitMQ/SQS]
    QUEUE --> EMAIL[Worker Email]
```

**Despliegue recomendado:**

1. **Desarrollo Local:** Docker Compose con frontend, backend, PostgreSQL y Redis
2. **Staging:** Cloud provider (AWS/Azure) con instancias pequeñas
3. **Producción:** 
   - Mínimo 3 instancias de backend con auto-scaling
   - Base de datos con backup automático
   - CDN para assets estáticos
   - SSL/TLS en todos los endpoints

---

### **2.5. Seguridad**

Prácticas de seguridad implementadas:

- **Autenticación:** JWT con refresh tokens y expiración
- **Autorización:** RBAC (Role-Based Access Control) en todos los endpoints
- **Encriptación:** Contraseñas con bcrypt, datos sensibles encriptados en BD
- **HTTPS:** Todos los endpoints requieren conexión segura
- **CORS:** Restringido a dominios autorizados
- **Validación:** Input validation en frontend y backend
- **Rate Limiting:** Límite de solicitudes por IP/usuario para prevenir ataques
- **SQL Injection Prevention:** ORM con queries parametrizadas
- **CSRF Protection:** Tokens anti-CSRF en formularios
- **Auditoría:** Registro de acciones críticas en tabla de auditoría

---

### **2.6. Tests**

Estrategia de testing:

| Tipo | Cobertura | Herramientas |
|------|-----------|-------------|
| **Unit Tests** | 80% de funciones | Jest, Mocha |
| **Integration Tests** | APIs principales | Supertest, Postman |
| **End-to-End** | Happy paths críticos | Cypress, Selenium |
| **Performance** | Carga y stress | JMeter, k6 |

**Ejemplos de tests:**
- Validar que solo residentes pueden crear reservas
- Verificar que no se puede reservar zonas ocupadas
- Confirmar que invitados se registran en acceso
- Probar aprobación automática de reservas con reglas

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    COPROPIEDAD ||--o{ USUARIO : contiene
    COPROPIEDAD ||--o{ RESIDENTE : pertenecen
    COPROPIEDAD ||--o{ RECURSO : posee
    COPROPIEDAD ||--o{ REGLA_RESERVA : define
    
    USUARIO ||--o{ ROL : tiene
    USUARIO ||--o{ RESIDENTE : es
    USUARIO ||--o{ NOTIFICACION : recibe
    USUARIO ||--o{ AUDITORIA : realiza
    
    RESIDENTE ||--o{ RESERVA : crea
    
    RECURSO ||--o{ RESERVA : tiene
    RECURSO ||--o{ REGLA_RESERVA : sigue
    
    RESERVA ||--o{ INVITADO : contiene
    RESERVA ||--o{ NOTIFICACION : genera
    
    INVITADO ||--o{ ACCESO : realiza
```

---

### **3.2. Descripción de entidades principales:**

#### **1. Copropiedad** (ID PK: `id`)
Entidad raíz que representa la comunidad residencial. Todas las demás entidades están vinculadas a ella.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| nombre | String(255) | NOT NULL, UNIQUE | Nombre de la copropiedad |
| dirección | String(500) | NOT NULL | Ubicación física |
| ciudad | String(100) | NOT NULL | Ciudad |
| teléfono | String(20) | | Contacto general |
| email | String(255) | NOT NULL | Email administrativo |
| total_unidades | Integer | NOT NULL, DEFAULT 0 | Cantidad de viviendas |
| fecha_creación | DateTime | NOT NULL, DEFAULT CURRENT | Fecha de registro |
| estado | Enum('Activa', 'Inactiva') | NOT NULL | Estado del registro |

---

#### **2. Usuario** (ID PK: `id`)
Persona que puede interactuar con el sistema bajo diferentes roles.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| email | String(255) | UNIQUE, NOT NULL | Email de acceso |
| contraseña_hash | String(255) | NOT NULL | Contraseña encriptada |
| nombre | String(100) | NOT NULL | Nombre completo |
| apellido | String(100) | NOT NULL | Apellido |
| teléfono | String(20) | | Teléfono de contacto |
| copropiedad_id | UUID | FK, NOT NULL | Referencia a Copropiedad |
| estado | Enum('Activo', 'Inactivo', 'Suspendido') | NOT NULL | Estado del usuario |
| fecha_creación | DateTime | NOT NULL | Fecha de registro |
| fecha_última_sesión | DateTime | | Último acceso |

---

#### **3. Residente** (ID PK: `id`)
Información específica de un residente de la copropiedad.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| usuario_id | UUID | FK, UNIQUE, NOT NULL | Relación 1:1 con Usuario |
| copropiedad_id | UUID | FK, NOT NULL | Referencia a Copropiedad |
| apartamento | String(50) | NOT NULL | Número de apartamento |
| piso | Integer | | Piso de ubicación |
| teléfono_emergencia | String(20) | | Contacto de emergencia |
| propietario | Boolean | DEFAULT TRUE | Si es propietario o arrendatario |
| fecha_ingreso | DateTime | NOT NULL | Cuándo se unió |

---

#### **4. Rol** (ID PK: `id`)
Define los permisos y funciones dentro del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| nombre | String(50) | UNIQUE, NOT NULL | Residente, Administrador, Vigilancia |
| descripción | String(500) | | Descripción del rol |
| permisos | JSON | | Estructura de permisos |

---

#### **5. Usuario_Rol** (PK: `usuario_id, rol_id`)
Relación many-to-many que asigna roles a usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| usuario_id | UUID | FK, PK, NOT NULL | Referencia a Usuario |
| rol_id | UUID | FK, PK, NOT NULL | Referencia a Rol |
| fecha_asignación | DateTime | NOT NULL | Cuándo se asignó |

---

#### **6. Recurso** (ID PK: `id`)
Zonas comunes disponibles para reserva.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| copropiedad_id | UUID | FK, NOT NULL | Referencia a Copropiedad |
| nombre | String(255) | NOT NULL | Nombre (Salón, Gimnasio, etc.) |
| descripción | String(1000) | | Descripción detallada |
| tipo | Enum('Salón', 'Gimnasio', 'Cancha', 'Parque', 'Otro') | NOT NULL | Tipo de zona |
| capacidad | Integer | NOT NULL | Máximo de personas |
| ubicación | String(500) | | Ubicación dentro de la copropiedad |
| amenidades | JSON | | Facilidades disponibles |
| imagen_url | String(500) | | URL de foto |
| estado | Enum('Disponible', 'Mantenimiento', 'Inactivo') | NOT NULL | Estado actual |

---

#### **7. Regla_Reserva** (ID PK: `id`)
Configuración de reglas específicas para cada zona.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| recurso_id | UUID | FK, NOT NULL | Referencia a Recurso |
| duracion_minima | Integer | DEFAULT 1 | Horas mínimas |
| duracion_maxima | Integer | NOT NULL | Horas máximas |
| max_reservas_por_mes | Integer | NOT NULL | Límite mensual |
| horario_apertura | Time | NOT NULL | Hora de apertura |
| horario_cierre | Time | NOT NULL | Hora de cierre |
| dias_reserva_anticipada | Integer | DEFAULT 30 | Días de anticipación |
| requiere_aprobacion | Boolean | DEFAULT FALSE | Aprobación manual |
| fecha_actualización | DateTime | NOT NULL | Última actualización |

---

#### **8. Reserva** (ID PK: `id`)
Registro de reservas de zonas comunes por residentes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| residente_id | UUID | FK, NOT NULL | Referencia a Residente |
| recurso_id | UUID | FK, NOT NULL | Referencia a Recurso |
| fecha_inicio | DateTime | NOT NULL | Inicio del evento |
| fecha_fin | DateTime | NOT NULL | Fin del evento |
| estado | Enum('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Completada') | NOT NULL | Estado actual |
| descripcion_evento | String(1000) | | Propósito de la reserva |
| numero_personas | Integer | | Cantidad de asistentes esperados |
| notas_residente | String(500) | | Notas adicionales |
| fecha_creación | DateTime | NOT NULL | Cuándo se creó |
| fecha_aprobacion | DateTime | | Cuándo fue aprobada |
| aprobado_por | UUID | FK | Usuario que aprobó |

**Índice compuesto:** `(residente_id, fecha_inicio)` para búsquedas eficientes  
**Índice compuesto:** `(recurso_id, fecha_inicio, fecha_fin)` para detectar conflictos

---

#### **9. Invitado** (ID PK: `id`)
Personas autorizadas a asistir a una reserva.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| reserva_id | UUID | FK, NOT NULL | Referencia a Reserva |
| nombre_completo | String(255) | NOT NULL | Nombre del invitado |
| cedula_identidad | String(50) | | Identificación |
| email | String(255) | | Email del invitado |
| teléfono | String(20) | | Teléfono |
| estado_ingreso | Enum('Pendiente', 'Autorizado', 'Rechazado', 'Ingresó') | DEFAULT 'Pendiente' | Estado |
| fecha_creación | DateTime | NOT NULL | Cuándo se agregó |

---

#### **10. Acceso** (ID PK: `id`)
Registro de ingresos/egresos de invitados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| invitado_id | UUID | FK, NOT NULL | Referencia a Invitado |
| fecha_hora_ingreso | DateTime | NOT NULL | Cuándo ingresó |
| fecha_hora_egreso | DateTime | | Cuándo salió |
| autorizado | Boolean | NOT NULL | Si fue autorizado |
| registrado_por | UUID | FK, NOT NULL | Usuario (Vigilancia) |
| observaciones | String(500) | | Notas sobre el ingreso |

---

#### **11. Notificación** (ID PK: `id`)
Registro de notificaciones enviadas a usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| usuario_id | UUID | FK, NOT NULL | Referencia a Usuario |
| reserva_id | UUID | FK | Referencia a Reserva (opcional) |
| tipo | Enum('Reserva_Aprobada', 'Reserva_Rechazada', 'Invitado_Agregado', 'Recordatorio') | NOT NULL | Tipo de notificación |
| contenido | String(1000) | NOT NULL | Mensaje |
| canal | Enum('Email', 'InApp', 'SMS') | NOT NULL | Medio de entrega |
| leida | Boolean | DEFAULT FALSE | Si fue leída |
| fecha_creación | DateTime | NOT NULL | Cuándo se envió |
| fecha_lectura | DateTime | | Cuándo se leyó |

---

#### **12. Auditoría** (ID PK: `id`)
Registro de auditoría para todas las acciones críticas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|------------|
| id | UUID | PK, NOT NULL | Identificador único |
| usuario_id | UUID | FK, NOT NULL | Usuario que realizó la acción |
| entidad | String(100) | NOT NULL | Tipo de entidad (Reserva, Invitado) |
| entidad_id | UUID | NOT NULL | ID de la entidad afectada |
| accion | Enum('Crear', 'Actualizar', 'Eliminar', 'Aprobar') | NOT NULL | Acción realizada |
| datos_anteriores | JSON | | Estado previo |
| datos_nuevos | JSON | | Nuevo estado |
| fecha_acción | DateTime | NOT NULL | Cuándo ocurrió |
| dirección_ip | String(45) | | IP del usuario |
| descripción | String(500) | | Descripción de la acción |

**Índice:** `(usuario_id, fecha_acción)` para auditoría por usuario

---

## 4. Especificación de la API

### **4.1. Arquitectura de Microservicios**

ConectaPH implementa una arquitectura de **microservicios desacoplados** alojados en contenedores on-premise. Todos los servicios comparten la misma base de datos PostgreSQL, comunicándose a través de una API Gateway que centraliza el acceso.

```mermaid
graph TB
    USER[Cliente / Frontend] -->|HTTP/HTTPS| APIGW[API Gateway<br/>Puerto 3000]
    
    APIGW -->|Route /auth| AUTH[Auth Service<br/>Puerto 3001]
    APIGW -->|Route /reservas| RES[Reservation Service<br/>Puerto 3002]
    APIGW -->|Route /recursos| RESOURCE[Resource Service<br/>Puerto 3003]
    APIGW -->|Route /invitados| GUEST[Guest Service<br/>Puerto 3004]
    APIGW -->|Route /acceso| ACCESS[Access Service<br/>Puerto 3005]
    APIGW -->|Route /notificaciones| NOTIF[Notification Service<br/>Puerto 3006]
    
    AUTH --> PG[(PostgreSQL<br/>5432)]
    RES --> PG
    RESOURCE --> PG
    GUEST --> PG
    ACCESS --> PG
    NOTIF --> PG
    
    NOTIF --> QUEUE[Message Queue<br/>RabbitMQ<br/>5672]
    QUEUE --> WORKER[Email Worker]
    WORKER --> EMAIL[SMTP]
    
    AUTH -.->|JWT Validation| APIGW
```

---

### **4.2. Microservicios**

| Servicio | Puerto | Responsabilidad | Tecnología |
|----------|--------|-----------------|-----------|
| **API Gateway** | 3000 | Enrutamiento, autenticación, rate limiting | Express/Kong |
| **Auth Service** | 3001 | Autenticación, gestión de usuarios y roles | Node.js/Express |
| **Reservation Service** | 3002 | Crear, aprobar, cancelar reservas | Node.js/Express |
| **Resource Service** | 3003 | Gestión de zonas comunes y sus reglas | Node.js/Express |
| **Guest Service** | 3004 | Gestión de invitados autorizados | Node.js/Express |
| **Access Service** | 3005 | Control de ingresos/egresos | Node.js/Express |
| **Notification Service** | 3006 | Envío de emails y notificaciones | Node.js/Express |
| **PostgreSQL** | 5432 | Base de datos relacional compartida | PostgreSQL 14+ |
| **RabbitMQ** | 5672 | Cola de mensajes para notificaciones | RabbitMQ |
| **Redis** | 6379 | Caché y sesiones | Redis |

---

### **4.3. Estructura Docker Compose**

```yaml
version: '3.8'

services:
  # Base de datos compartida
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: conectaph
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache y sesiones
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Cola de mensajes
  rabbitmq:
    image: rabbitmq:3.11-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin

  # API Gateway
  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      JWT_SECRET: your_secret_key
    depends_on:
      - postgres
      - redis

  # Auth Service
  auth-service:
    build: ./backend/auth-service
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Reservation Service
  reservation-service:
    build: ./backend/reservation-service
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
    depends_on:
      - postgres
      - rabbitmq

  # Resource Service
  resource-service:
    build: ./backend/resource-service
    ports:
      - "3003:3003"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
    depends_on:
      - postgres

  # Guest Service
  guest-service:
    build: ./backend/guest-service
    ports:
      - "3004:3004"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
    depends_on:
      - postgres

  # Access Service
  access-service:
    build: ./backend/access-service
    ports:
      - "3005:3005"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
    depends_on:
      - postgres

  # Notification Service
  notification-service:
    build: ./backend/notification-service
    ports:
      - "3006:3006"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/conectaph
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      SMTP_HOST: your_smtp_host
      SMTP_PORT: 587
    depends_on:
      - postgres
      - rabbitmq

volumes:
  postgres_data:
```

---

### **4.4. Endpoints principales en formato OpenAPI**

#### **Endpoint 1: Crear Reserva**

```yaml
POST /reservas
summary: Crear una nueva reserva de zona común
operationId: createReservation
tags:
  - Reservas
security:
  - BearerAuth: []

requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          recurso_id:
            type: string
            format: uuid
            description: ID de la zona común a reservar
          fecha_inicio:
            type: string
            format: date-time
            description: Fecha y hora de inicio (ISO 8601)
          fecha_fin:
            type: string
            format: date-time
            description: Fecha y hora de fin (ISO 8601)
          descripcion_evento:
            type: string
            maxLength: 1000
            description: Descripción del evento
          numero_personas:
            type: integer
            minimum: 1
            description: Número de personas que asistirán
          invitados:
            type: array
            items:
              type: object
              properties:
                nombre_completo:
                  type: string
                cedula_identidad:
                  type: string
                email:
                  type: string
                  format: email
                teléfono:
                  type: string
        required:
          - recurso_id
          - fecha_inicio
          - fecha_fin
          - numero_personas

responses:
  '201':
    description: Reserva creada exitosamente
    content:
      application/json:
        schema:
          type: object
          properties:
            id:
              type: string
              format: uuid
            residente_id:
              type: string
              format: uuid
            recurso_id:
              type: string
              format: uuid
            fecha_inicio:
              type: string
              format: date-time
            fecha_fin:
              type: string
              format: date-time
            estado:
              type: string
              enum: [Pendiente, Aprobada, Rechazada, Cancelada, Completada]
            fecha_creación:
              type: string
              format: date-time
        example:
          id: "550e8400-e29b-41d4-a716-446655440000"
          residente_id: "660e8400-e29b-41d4-a716-446655440000"
          recurso_id: "770e8400-e29b-41d4-a716-446655440000"
          fecha_inicio: "2026-06-20T14:00:00Z"
          fecha_fin: "2026-06-20T18:00:00Z"
          estado: "Pendiente"
          fecha_creación: "2026-06-15T10:30:45Z"

  '400':
    description: Solicitud inválida (fecha en conflicto, zona no disponible, etc.)
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "CONFLICT"
          message: "La zona común ya está reservada en ese horario"

  '401':
    description: No autorizado - Usuario no autenticado
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "UNAUTHORIZED"
          message: "Token JWT no válido o expirado"

  '403':
    description: Prohibido - El usuario no tiene permisos para crear reservas
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "FORBIDDEN"
          message: "Solo residentes pueden crear reservas"
```

**Ejemplo de solicitud cURL:**
```bash
curl -X POST http://localhost:3000/reservas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "recurso_id": "770e8400-e29b-41d4-a716-446655440000",
    "fecha_inicio": "2026-06-20T14:00:00Z",
    "fecha_fin": "2026-06-20T18:00:00Z",
    "descripcion_evento": "Cumpleaños de mi hijo",
    "numero_personas": 25,
    "invitados": [
      {
        "nombre_completo": "Juan Pérez",
        "cedula_identidad": "1234567890",
        "email": "juan@example.com",
        "teléfono": "3001234567"
      }
    ]
  }'
```

---

#### **Endpoint 2: Obtener Invitados de una Reserva**

```yaml
GET /reservas/{reserva_id}/invitados
summary: Obtener lista de invitados autorizados para una reserva
operationId: getReservationGuests
tags:
  - Reservas
  - Invitados
parameters:
  - name: reserva_id
    in: path
    required: true
    schema:
      type: string
      format: uuid
    description: ID de la reserva
security:
  - BearerAuth: []

responses:
  '200':
    description: Lista de invitados obtenida exitosamente
    content:
      application/json:
        schema:
          type: object
          properties:
            reserva_id:
              type: string
              format: uuid
            total_invitados:
              type: integer
            invitados:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  nombre_completo:
                    type: string
                  cedula_identidad:
                    type: string
                  email:
                    type: string
                    format: email
                  teléfono:
                    type: string
                  estado_ingreso:
                    type: string
                    enum: [Pendiente, Autorizado, Rechazado, Ingresó]
                  fecha_creación:
                    type: string
                    format: date-time
        example:
          reserva_id: "550e8400-e29b-41d4-a716-446655440000"
          total_invitados: 2
          invitados:
            - id: "880e8400-e29b-41d4-a716-446655440001"
              nombre_completo: "Juan Pérez"
              cedula_identidad: "1234567890"
              email: "juan@example.com"
              teléfono: "3001234567"
              estado_ingreso: "Autorizado"
              fecha_creación: "2026-06-15T10:30:45Z"
            - id: "880e8400-e29b-41d4-a716-446655440002"
              nombre_completo: "María García"
              cedula_identidad: "0987654321"
              email: "maria@example.com"
              teléfono: "3007654321"
              estado_ingreso: "Pendiente"
              fecha_creación: "2026-06-15T10:45:30Z"

  '404':
    description: Reserva no encontrada
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "NOT_FOUND"
          message: "Reserva no encontrada"

  '401':
    description: No autorizado
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
```

**Ejemplo de solicitud cURL:**
```bash
curl -X GET http://localhost:3000/reservas/550e8400-e29b-41d4-a716-446655440000/invitados \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### **Endpoint 3: Registrar Acceso de Invitado**

```yaml
POST /acceso/registrar
summary: Registrar el ingreso o egreso de un invitado
operationId: registerAccess
tags:
  - Acceso
security:
  - BearerAuth: []

requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          invitado_id:
            type: string
            format: uuid
            description: ID del invitado
          tipo_evento:
            type: string
            enum: [ingreso, egreso]
            description: Si es ingreso o egreso
          autorizado:
            type: boolean
            description: Si se autorizó el acceso
          observaciones:
            type: string
            maxLength: 500
            description: Notas adicionales sobre el acceso
        required:
          - invitado_id
          - tipo_evento
          - autorizado

responses:
  '201':
    description: Acceso registrado exitosamente
    content:
      application/json:
        schema:
          type: object
          properties:
            id:
              type: string
              format: uuid
            invitado_id:
              type: string
              format: uuid
            fecha_hora_ingreso:
              type: string
              format: date-time
            fecha_hora_egreso:
              type: string
              format: date-time
            autorizado:
              type: boolean
            registrado_por:
              type: string
              format: uuid
            observaciones:
              type: string
        example:
          id: "990e8400-e29b-41d4-a716-446655440000"
          invitado_id: "880e8400-e29b-41d4-a716-446655440001"
          fecha_hora_ingreso: "2026-06-20T14:05:30Z"
          fecha_hora_egreso: null
          autorizado: true
          registrado_por: "660e8400-e29b-41d4-a716-446655440000"
          observaciones: "Visitante verificado con cédula"

  '400':
    description: Solicitud inválida (invitado no existe, ya ingresó, etc.)
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "BAD_REQUEST"
          message: "El invitado ya ha ingresado a esta reserva"

  '403':
    description: Prohibido - Solo vigilancia puede registrar acceso
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
        example:
          error: "FORBIDDEN"
          message: "Solo personal de vigilancia puede registrar accesos"
```

**Ejemplo de solicitud cURL:**
```bash
curl -X POST http://localhost:3000/acceso/registrar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "invitado_id": "880e8400-e29b-41d4-a716-446655440001",
    "tipo_evento": "ingreso",
    "autorizado": true,
    "observaciones": "Visitante verificado con cédula"
  }'
```

---

### **4.5. Autenticación**

Todos los endpoints requieren un token JWT en el header `Authorization`:

```
Authorization: Bearer <token_jwt>
```

El token se obtiene a través del endpoint de login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "residente@example.com",
    "password": "password123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "usuario": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "email": "residente@example.com",
    "roles": ["residente"]
  }
}
```

---

### **4.6. Manejo de errores**

Todos los endpoints siguen un estándar de error consistente:

```json
{
  "error": "ERROR_CODE",
  "message": "Descripción legible del error",
  "statusCode": 400,
  "timestamp": "2026-06-15T10:30:45Z"
}
```

**Códigos de error comunes:**
- `400 BAD_REQUEST` - Solicitud inválida
- `401 UNAUTHORIZED` - Token no válido o expirado
- `403 FORBIDDEN` - Permisos insuficientes
- `404 NOT_FOUND` - Recurso no encontrado
- `409 CONFLICT` - Conflicto (zona reservada, etc.)
- `429 TOO_MANY_REQUESTS` - Rate limit excedido
- `500 INTERNAL_SERVER_ERROR` - Error del servidor


## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

### Historia de Usuario 1 — Reservar una zona común

- **Como**: Residente
- **Quiero**: seleccionar una zona común disponible (salón, gimnasio, cancha), elegir fecha y hora, indicar número de invitados y propósito, y enviar la solicitud de reserva.
- **Para que**: pueda asegurar el uso del espacio sin conflictos y recibir confirmación o requerimientos adicionales.

**Criterios de aceptación**:
- El formulario valida campos obligatorios y rangos de fecha/hora.
- El sistema comprueba disponibilidad y reglas del recurso antes de crear la reserva.
- Si existe regla de aprobación manual, la reserva queda en estado `Pendiente`; de lo contrario puede quedar `Aprobada` automáticamente.
- Se envía notificación (InApp/Email) al residente con el resultado y la reserva aparece en su historial.

**Prioridad**: Alta — MVP
**Notas de producto**: Usar validaciones en cliente y servidor; mostrar alternativas de horarios si hay conflictos; incluir CTA claro para editar o cancelar.

---

### Historia de Usuario 2 — Aprobar o rechazar reservas

- **Como**: Administrador de la copropiedad
- **Quiero**: revisar las reservas pendientes, ver conflictos potenciales y aprobar o rechazar con un comentario.
- **Para que**: se garantice el cumplimiento de normativas internas y se eviten reservas que generen problemas operativos.

**Criterios de aceptación**:
- El administrador puede filtrar reservas por fecha, recurso y estado.
- Al aprobar, se actualiza el estado a `Aprobada`, se registra `aprobado_por` y se envía notificación al solicitante.
- Al rechazar, se registra el motivo y se notifica con instrucciones para reprogramar.
- Las decisiones quedan registradas en la auditoría para trazabilidad.

**Prioridad**: Alta — MVP
**Notas de producto**: Interfaz con listado y detalle rápido; acción en 1 clic para aprobar/rechazar; incluir historial y motivos para transparencia.

---

### Historia de Usuario 3 — Registrar el acceso de invitados

- **Como**: Vigilancia
- **Quiero**: buscar la reserva activa, consultar la lista de invitados autorizados y registrar ingreso/egreso de cada invitado.
- **Para que**: se controle el acceso y quede un registro exacto de entradas y salidas por seguridad.

**Criterios de aceptación**:
- La vigilancia puede buscar por número de reserva, fecha o nombre del responsable.
- Puede marcar un invitado como `Autorizado` y registrar `fecha_hora_ingreso` y `fecha_hora_egreso`.
- Si un invitado no está en la lista, la vigilancia puede registrar una excepción y notificar al administrador.
- Todos los registros quedan en la tabla `Acceso` y son consultables para auditoría.

**Prioridad**: Media
**Notas de producto**: Interfaz optimizada para uso en portería (pantalla pequeña); acciones rápidas y posibilidad de escanear identificación.

---

**Buenas prácticas aplicadas**:
- Historias escritas según INVEST: independientes, negociables, valiosas, estimables, pequeñas y testeables.
- Cada historia incluye criterios de aceptación verificables y notas de producto para diseño UX/implementación.
- Priorizar en backlog conforme al impacto en el MVP y complejidad estimada.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

### Ticket 1 — Backend: Endpoint `POST /reservas` (Crear Reserva)

- **Resumen:** Implementar el endpoint `POST /reservas` en el `Reservation Service` que permita crear reservas de zonas comunes aplicando validaciones de negocio, chequear disponibilidad, persistir en PostgreSQL y publicar evento a la cola para notificaciones.

- **Alcance:**
  - Validación de payload y autenticación (JWT + rol `residente`).
  - Comprobación de reglas del recurso (duración mínima/máxima, horario, límite mensual).
  - Detección de conflictos de disponibilidad (checks atómicos dentro de transacción DB).
  - Persistencia de `Reserva` y `Invitado(s)` relacionados.
  - Emisión de evento `reservation.created` a RabbitMQ con payload mínimo para notificaciones.
  - Manejo de errores claros y respuestas OpenAPI conforme especificación.

- **Tareas (subdivididas):**
  1. Diseño API y contract tests (OpenAPI update y ejemplos). (0.5d)
  2. Implementar DTOs/schemas y validaciones (Joi/Zod). (0.5d)
  3. Reglas de negocio: implementar `ReservationService.checkRules()` y tests unitarios. (1d)
  4. Implementar lógica de disponibilidad con bloqueo/transactional SELECT FOR UPDATE o unique constraints y tests de integración. (1d)
  5. Persistir reserva y invitados en transacción; devuelve 201 con recurso creado. (0.5d)
  6. Publicar evento en RabbitMQ y crear fallback/retry. (0.5d)
  7. Añadir logging, métricas y manejo de errores (400/401/403/409/500). (0.5d)
  8. End-to-end integration test contra DB y RabbitMQ (1d).
  9. Documentar en el repositorio y añadir CHANGELOG/PR. (0.5d)

- **Criterios de aceptación:**
  - Endpoint validado contra OpenAPI y tests automatizados pasan.
  - No se permiten dobles reservas en el mismo recurso/horario (tests que demuestran bloqueo o rechazo con 409).
  - Evento `reservation.created` se publica dentro del flujo de creación (pruebas que consumen la cola).
  - Respuesta HTTP 201 con body conforme al ejemplo de la especificación.

- **Dependencias:** PostgreSQL, RabbitMQ, Auth Service (para validar tokens), migraciones de esquema previas.
- **Riesgos & Mitigaciones:** condiciones de carrera (usar transacciones/locks), payload grande (limitar cantidad de invitados por petición).
- **Estimación:** 5-6 días hábiles (incluye integración y pruebas).

---

### Ticket 2 — Frontend: Flujo de creación de reserva (Calendario + Modal)

- **Resumen:** Añadir la experiencia de usuario para crear reservas desde el `Frontend` (SPA). Esto incluye calendario con disponibilidad, modal de creación con validaciones, manejo de errores y feedback inmediato.

- **Alcance:**
  - Integrar calendario (fullcalendar o componente propio) mostrando ocupaciones y ventanas disponibles.
  - Implementar modal/formulario `Crear Reserva` con campos: recurso, fecha/hora inicio, fecha/hora fin, número de personas, descripción e invitados.
  - Validaciones en cliente (fechas, número de personas, reglas básicas) y mensajes UX claros.
  - Mostrar alternativas de horarios si hay conflicto y permitir reintento con uno click.
  - Consumir `POST /reservas` y manejar estados: loading, success, error (409 conflict con sugerencias).
  - Notificaciones InApp cuando la reserva cambia de estado.

- **Tareas (subdivididas):**
  1. Diseño UX: wireframe de calendario + modal y microinteracciones (0.5d).
  2. Integración del componente calendario y mapeo de eventos desde API (`GET /reservas`/`/recursos`). (1d)
  3. Implementar formulario, validaciones y UI states (errors, success). (1d)
  4. Manejo de respuestas conflictivas: mostrar alternativas y CTA para reprogramar. (0.5d)
  5. Integrar con sistema de notificaciones InApp y show-toasts. (0.5d)
  6. Tests E2E (Cypress) cubriendo flujo feliz y conflicto. (1d)
  7. Documentar componentes y prop-types/TS types. (0.25d)

- **Criterios de aceptación:**
  - El usuario puede crear una reserva desde el calendario en menos de 3 clicks.
  - Validaciones de cliente previenen envíos inválidos; servidor puede rechazar con 409 y la UI ofrece alternativas.
  - Componentes con tests unitarios y E2E que pasan en CI.
  - Responsivo y usable en pantallas de portería (tablet) y desktop.

- **Dependencias:** API Gateway/Reservation Service disponible en entorno de staging, diseño aprobado.
- **Riesgos & Mitigaciones:** Latencia alta (optimizar requests y mostrar skeletons), UX confusa (realizar sesión con usuario/PO).
- **Estimación:** 4-5 días hábiles.

---

### Ticket 3 — Base de datos: Migraciones y optimización para tablas `reserva`, `invitado` y `acceso`

- **Resumen:** Crear migraciones DB para soportar el modelo de reservas, añadir índices y constraints necesarios para integridad y rendimiento; preparar scripts de rollback y pruebas de carga básica.

- **Alcance:**
  - Crear/actualizar migraciones SQL (o con ORM) para tablas `reserva`, `invitado`, `recurso`, `regla_reserva`, `acceso`.
  - Añadir índices compuestos recomendados: `(residente_id, fecha_inicio)`, `(recurso_id, fecha_inicio, fecha_fin)`, `reserva.estado` y `invitado.reserva_id`.
  - Constraints: FK, check constraints (fecha_fin > fecha_inicio), triggers para auditoría (opcional).
  - Scripts de seed para datos de prueba y scripts de rollback.
  - Ejecutar pruebas de inserción concurrente para verificar rendimiento y detectar bloqueos.

- **Tareas (subdivididas):**
  1. Definir versiones de migraciones e inputs para ORM (0.5d).
  2. Implementar migraciones y constraints (1d).
  3. Añadir índices y analizar plan de consultas para endpoints críticos (0.5d).
  4. Crear scripts de seed (recursos, reglas, usuarios de prueba). (0.5d)
  5. Realizar pruebas de carga concurrente para creación de reservas y documentar resultados. (1d)
  6. Añadir documentación de rollback y políticas de backup (0.5d).

- **Criterios de aceptación:**
  - Migraciones aplican en ambiente local y staging sin errores y se pueden revertir.
  - Índices mejoran latencia de consultas críticas (medible con EXPLAIN/ANALYZE).
  - Test de concurrencia demuestra que no hay pérdidas de consistencia en escenarios típicos (report incl.).

- **Dependencias:** Acceso a instancia de PostgreSQL staging, acuerdo sobre naming conventions y backup policy.
- **Riesgos & Mitigaciones:** Índices mal elegidos causan writes lentos (probar en staging), locked migrations en producción (usar migraciones online si es necesario).
- **Estimación:** 3-4 días hábiles.


---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

