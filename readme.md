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

Julio Jordá Gómez

### **0.2. Nombre del proyecto:**

Frapen Angels

### **0.3. Descripción breve del proyecto:**

Frapen Angels es un club de motos y el proyecto consiste en crear su web.

### **0.4. URL del proyecto:**

https://github.com/Juls-85/AI4Devs-finalproject

### 0.5. URL o archivo comprimido del repositorio

https://github.com/Juls-85/AI4Devs-finalproject


---

## 1. Descripción general del producto


### **1.1. Objetivo:**

Web específica para los socios del club. 

### **1.2. Características y funcionalidades principales:**

Permitirá inscribirse a los socios, actualizar sus datos, ver el calendario de actividades, ver la galería de imágenes de las rutas, proponer rutas para su revisión, consultar rutas publicadas o ya realizadas, y realizar pagos asociados a rutas con hotel o restaurante. Además habrá una parte de administración para revisar propuestas de rutas, aprobarlas o rechazarlas, gestionar la publicación y enviar correos con la próxima ruta y demás avisos.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Este conjunto de funciones presenta un dominio claramente cohesivo: el club, sus socios y sus actividades. Por ello, la arquitectura propuesta se centra en una solución con un único motor de ejecución, modular y organizada por capas funcionales, en lugar de distribuir la lógica en microservicios independientes

Se propone una arquitectura de tipo monolito modular, organizada en capas:

- capa de presentación (frontend).
- capa de aplicación o casos de uso.
- capa de dominio.
- capa de infraestructura y acceso a datos.
- servicios externos (pagos, correo, almacenamiento de media).

La razón principal es que el proyecto combina varias funcionalidades relacionadas entre sí, pero no requiere todavía un crecimiento tan alto ni un aislamiento tan fuerte entre dominios como para justificar varios servicios desplegados por separado.

Aporta ventajas muy claras:

1. Menor complejidad operativa
   - un único despliegue.
   - una sola base de datos principal.
   - menos puntos de fallo y menos coordinación entre equipos.

2. Desarrollo más rápido
   - el dominio es integrado y no necesita interfaz entre múltiples servicios.
   - las funcionalidades están muy relacionadas entre sí.

3. Mejor trazabilidad transaccional
   - una operación como "inscribir socio + pagar + crear avisos" puede gestionarse con una sola transacción o con un flujo gobernado por el backend.

4. Facilidad de evolución
   - si más adelante el proyecto crece, se pueden extraer módulos o servicios específicos sin romper completamente el sistema.

5. Mantener una sola lógica de seguridad y permisos
   - simplifica el control de accesos y la auditoría.

Algunos límites:

1. Escala vertical más que horizontal
   - cuando el número de socios o las peticiones crezca mucho, el monolito puede convertirse en un cuello de botella.

2. Acoplamiento funcional si no se modulariza bien
   - si el desarrollo no separa claramente dominios, el backend puede volverse difícil de mantener.

3. Menor aislamiento de fallos
   - un problema en un módulo puede afectar al conjunto, aunque el patrón modular ayuda a reducirlo.

4. Evolución más lenta hacia microservicios
   - la separación posterior a servicios requiere reestructuración y cambios en despliegue y observabilidad.


### **2.2. Descripción de componentes principales:**

1. Frontend: React o Next.js
 - Responsabilidad:
    - ofrecer la experiencia web para socios.
    - renderizar calendario, galería, perfil, rutas y panel administrativo.
    - integrar flujos de autenticación y pagos con la API.

2. API / Backend: Node.js con NestJS o Express
 - Responsabilidad:
    - exponer endpoints REST para socios, rutas, calendario, administración y pagos.
    - validar permisos según rol.
    - coordinar casos de uso y orquestar integraciones externas.

3. Capa de dominio
 - Responsabilidad:
    - representar las reglas del negocio: inscripción, acceso a rutas, validación del perfil, gestión de pagos, envío de avisos.
    - mantener las entidades y los servicios centralizados.

4. Persistencia: PostgreSQL
 - Responsabilidad:
    - almacenar socios, rutas, calendario, pagos, incidencias, correos y estados de administración.
    - soportar transacciones necesarias para procesos de alta y pago.

5. Almacenamiento de media: S3-compatible storage o Cloudinary
 - Responsabilidad:
    - guardar imágenes de rutas y galerías.
    - servir contenido optimizado y reducir carga en el backend.

6. Notificaciones y correo: SMTP o SendGrid
 - Responsabilidad:
    - enviar avisos sobre próximas rutas, recordatorios y comunicaciones administrativas.

7. Pasarela de pagos: Stripe
 - Responsabilidad:
    - gestionar cobros asociados a rutas con hotel o restaurante.
    - devolver estados de pago para confirmar disponibilidad y reserva.

8. Capa de caché y sesiones: Redis
 - Responsabilidad:
    - agilizar autenticación y sesiones.
    - cachear datos frecuentes como calendario, rutas destacadas o contenido público.


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Una estructura recomendada para este sistema, siguiendo un monolito modular, sería la siguiente:

```text
src/
  app/
    admin/
    auth/
    calendar/
    gallery/
    routes/
    payments/
    notifications/
  domain/
    members/
    routes/
    activities/
    payments/
    notifications/
  infrastructure/
    persistence/
    storage/
    mail/
    payments/
  shared/
    config/
    utils/
    security/
public/
  assets/
  media/
config/
  env/
  deployment/
  ci/
```
Proposito:

- `src/app`: contiene el nivel de presentación y la coordinación de las rutas e interfaces de usuario.
- `src/domain`: encapsula las entidades, reglas y casos de negocio del club.
- `src/infrastructure`: organiza adaptadores para base de datos, correo, medios y pagos.
- `src/shared`: reutiliza utilidades, políticas de seguridad y configuración centralizada.
- `public/`: recursos públicos, assets y media estáticos.
- `config/`: entorno, CI/CD y parámetros de despliegue.

Este patrón responde bien a una arquitectura modular monolítica, donde cada dominio funcional se puede agrupar sin forzar la distribución por servicios

### **2.4. Infraestructura y despliegue**

1. Despliegue recomentado:
    - frontend y backend desplegados en una plataforma PaaS o contenedores.
    - base de datos gestionada en PostgreSQL.
    - almacenamiento de imágenes en S3-compatible o Cloudinary.
    - integración de pagos y correo a través de servicios externos.
    - configuración de entornos separados: desarrollo, pruebas y producción.

2. Proceso de despliegue:
    - commit y validación en CI;
    - ejecución de tests automatizados;
    - build de frontend y backend;
    - migraciones de base de datos;
    - despliegue a entorno de pruebas;
    - validación funcional;
    - despliegue a producción con política de release controlada.

3. Arquitectura de despliegue:

```mermaid
flowchart TB
    U[Usuario final] --> CDN[CDN / Proxy Web]
    CDN --> APP[Aplicación Web]
    APP --> API[Backend API]
    API --> DB[(PostgreSQL)]
    API --> CACHE[(Redis)]
    API --> PAY[Stripe]
    API --> MAIL[SMTP / SendGrid]
    APP --> MEDIA[S3 / Cloudinary]
```   

### **2.5. Seguridad**

La seguridad debe tratarse como un eje transversal en la solución. Las buenas prácticas recomendadas son:

1. Autenticación y autorización por roles
   - socios y administradores con permisos diferenciados.
   - control de acceso a rutas administrativas y a operaciones de pago.

2. Protecciones en la API
   - validación de entrada.
   - prevención de inyección SQL y XSS.
   - uso de tokens firmados o sesiones seguras.

3. Almacenamiento seguro de credenciales
   - variables de entorno para secretos.
   - no persistir claves ni tokens en repositorio.

4. Protección de pagos
   - no manejar datos financieros directamente en el frontend.
   - comunicar la pasarela de pago mediante flujo seguro y confirmación de estado en backend.

5. Observabilidad y trazabilidad
   - registro de accesos, errores y cambios relevantes.
   - auditoría para operaciones administrativas.

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    ROLES ||--o{ MEMBERS : "role_id"
    ROLES ||--o{ ADMIN_USERS : "role_id"
    MEMBERS ||--o{ ADMIN_USERS : "member_id"
    MEMBERS ||--o{ ROUTE_REGISTRATIONS : "member_id"
    ROUTES ||--o{ ROUTE_REGISTRATIONS : "route_id"
    MEMBERS ||--o{ PAYMENTS : "member_id"
    ROUTES ||--o{ PAYMENTS : "route_id"
    NOTIFICATIONS ||--o{ NOTIFICATION_RECIPIENTS : "notification_id"
    MEMBERS ||--o{ NOTIFICATION_RECIPIENTS : "member_id"
    ADMIN_USERS ||--o{ NOTIFICATIONS : "created_by"
    ROUTES ||--o{ NOTIFICATIONS : "route_id"
    ROUTES ||--o{ ROUTE_MEDIA : "route_id"
    ROUTES ||--o{ CALENDAR_EVENTS : "route_id"
    ADMIN_USERS ||--o{ ROUTES : "created_by_admin"
    MEMBERS ||--o{ ROUTES : "created_by_member"
    ADMIN_USERS ||--o{ CALENDAR_EVENTS : "created_by"
    ADMIN_USERS ||--o{ ROUTE_MEDIA : "uploaded_by"
    MEMBERS ||--o{ AUDIT_LOGS : "actor_member_id"
    ADMIN_USERS ||--o{ AUDIT_LOGS : "actor_admin_id"

    ROLES {
        UUID role_id PK
        VARCHAR role_name UK "SOCIO, ADMIN, etc."
        JSONB permissions
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    MEMBERS {
        UUID member_id PK
        UUID role_id FK "FK -> roles.role_id"
        VARCHAR email UK "not null"
        VARCHAR password_hash "not null"
        VARCHAR first_name "not null"
        VARCHAR last_name "not null"
        VARCHAR dni UK
        DATE birth_date
        VARCHAR phone
        VARCHAR address
        VARCHAR city
        VARCHAR postal_code
        VARCHAR membership_number UK
        VARCHAR status "ACTIVE, INACTIVE, BLOCKED"
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP last_login_at
    }

    ADMIN_USERS {
        UUID admin_id PK
        UUID role_id FK "FK -> roles.role_id"
        UUID member_id FK "FK -> members.member_id, opcional"
        VARCHAR username UK "not null"
        VARCHAR email UK "not null"
        VARCHAR password_hash "not null"
        VARCHAR status "ACTIVE, INACTIVE"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ROUTES {
        UUID route_id PK
        UUID created_by_member FK "FK -> members.member_id, nullable"
        UUID created_by_admin FK "FK -> admin_users.admin_id, nullable"
        VARCHAR created_by_type "MEMBER, ADMIN"
        UUID reviewed_by FK "FK -> admin_users.admin_id, nullable"
        VARCHAR title "not null"
        TEXT description
        VARCHAR difficulty "EASY, MEDIUM, HARD"
        DECIMAL distance_km
        VARCHAR meeting_point
        VARCHAR status "PROPOSAL, PENDING_REVIEW, PUBLISHED, REJECTED, COMPLETED, CANCELLED"
        DATE departure_date
        TIME departure_time
        DATE return_date
        BOOLEAN has_lodging
        BOOLEAN has_restaurant
        DECIMAL base_price
        DECIMAL lodging_price
        DECIMAL restaurant_price
        DECIMAL total_price
        JSONB route_data "info extra"
        TIMESTAMP reviewed_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ROUTE_MEDIA {
        UUID media_id PK
        UUID route_id FK "FK -> routes.route_id"
        VARCHAR media_type "IMAGE, VIDEO"
        VARCHAR file_url "not null"
        VARCHAR cloud_key
        VARCHAR caption
        BOOLEAN is_cover
        UUID uploaded_by FK "FK -> admin_users.admin_id"
        TIMESTAMP created_at
    }

    CALENDAR_EVENTS {
        UUID event_id PK
        UUID route_id FK "FK -> routes.route_id, nullable"
        UUID created_by FK "FK -> admin_users.admin_id"
        VARCHAR title "not null"
        TEXT description
        TIMESTAMP start_at "not null"
        TIMESTAMP end_at
        VARCHAR location
        VARCHAR status "SCHEDULED, DONE, CANCELLED"
        INTEGER capacity
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ROUTE_REGISTRATIONS {
        UUID registration_id PK
        UUID route_id FK "FK -> routes.route_id"
        UUID member_id FK "FK -> members.member_id"
        VARCHAR registration_status "PENDING, CONFIRMED, CANCELLED, COMPLETED"
        INTEGER companions
        DECIMAL amount_due
        DECIMAL amount_paid
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    PAYMENTS {
        UUID payment_id PK
        UUID member_id FK "FK -> members.member_id"
        UUID route_id FK "FK -> routes.route_id"
        UUID registration_id FK "FK -> route_registrations.registration_id, nullable"
        VARCHAR provider "STRIPE, PAYPAL, MANUAL"
        VARCHAR provider_payment_id UK
        VARCHAR status "PENDING, PAID, FAILED, REFUNDED"
        DECIMAL amount "not null"
        VARCHAR currency "EUR"
        TIMESTAMP created_at
        TIMESTAMP paid_at
        JSONB provider_payload
    }

    NOTIFICATIONS {
        UUID notification_id PK
        UUID route_id FK "FK -> routes.route_id, nullable"
        UUID created_by FK "FK -> admin_users.admin_id"
        VARCHAR title "not null"
        TEXT body "not null"
        VARCHAR type "ROUTE, GENERAL, REMINDER"
        VARCHAR status "DRAFT, SENT, FAILED"
        TIMESTAMP scheduled_at
        TIMESTAMP sent_at
        TIMESTAMP created_at
    }

    NOTIFICATION_RECIPIENTS {
        UUID notification_recipient_id PK
        UUID notification_id FK "FK -> notifications.notification_id"
        UUID member_id FK "FK -> members.member_id"
        VARCHAR delivery_status "PENDING, SENT, OPENED, FAILED"
        TIMESTAMP delivered_at
        TIMESTAMP read_at
    }

    AUDIT_LOGS {
        UUID audit_id PK
        UUID actor_member_id FK "FK -> members.member_id, nullable"
        UUID actor_admin_id FK "FK -> admin_users.admin_id, nullable"
        VARCHAR entity_type
        UUID entity_id
        VARCHAR action "CREATE, UPDATE, DELETE, PAYMENT, SEND_EMAIL"
        JSONB payload
        TIMESTAMP created_at
    }
```

### Notas de diseño

- La entidad `members` representa el perfil principal de los socios. También puede reutilizarse para autenticación, control de acceso y trazabilidad de actividades.
- La entidad `admin_users` permite separar el acceso administrativo del perfil principal del socio. En una implementación real puede ser un perfil bajo la misma tabla de usuario, pero el diseño lo expresa de forma explícita para mantener el control de permisos. Cada administrador debe tener un rol explícito asociado en `roles`.
- Las rutas pueden ser propuestas por un socio o creadas por administración. En ambos casos se registran en la misma entidad `routes`, diferenciando el origen por `created_by_type` y el estado de revisión por `status`.
- `route_registrations` es la tabla de inscripción de socio a ruta. El campo `companions` registra el número de acompañantes ADICIONALES (no incluye al socio principal).
- `payments` se asocia al socio, a la ruta y a la inscripción como una operación de cobro transaccional. Las rutas y eventos pueden no tener precio (son gratuitos o de participación voluntaria).
- `notifications` y `notification_recipients` permiten la administración de comunicaciones y el envío de avisos a socios.
- `audit_logs` recoge operaciones relevantes y ayuda a la seguridad y a la observabilidad. Debe registrar al menos un actor, ya sea un miembro o un administrador.
- `calendar_events` es un instrumento de visualización para que los socios puedan consultar cuándo son la próximas rutas y eventos del año. Aunque está asociado a rutas, se administra de forma independiente para mayor flexibilidad en la presentación de la agenda del club.

### **3.2. Descripción de entidades principales:**
Se añade la descripción de 4 de las entidades

### 3.2.1 `members`

Entidad principal del dominio del socio.

Atributos:

- `member_id`: UUID, clave primaria.
- `role_id`: UUID, clave foránea a `roles.role_id`.
- `email`: correo electrónico único para autenticación y contacto.
- `password_hash`: hash de contraseña almacenado con política segura.
- `first_name`: nombre del socio.
- `last_name`: apellidos.
- `dni`: documento de identidad, índice único si se desea una relación fuerte con identidad.
- `birth_date`: fecha de nacimiento.
- `phone`: teléfono de contacto.
- `address`: dirección postal.
- `city`: ciudad postal.
- `postal_code`: código postal.
- `membership_number`: número interno de socio, único.
- `status`: estado del perfil, con valores `ACTIVE`, `INACTIVE`, `BLOCKED`.
- `created_at`, `updated_at`, `last_login_at`: trazabilidad y seguridad.

Relaciones:

- Un socio pertenece a un rol.
- Un socio puede registrarse en varias rutas.
- Un socio puede generar varios pagos y recibir varios avisos.

Restricciones:

- Email único.
- Dni único si aplica en el negocio.
- Membership number único.
- Email y `password_hash` no nulos.
- Se recomienda `status` con control de dominio y `CHECK` para limitar valores válidos.

### 3.2.2 `routes`

Entidad central del negocio de rutas y actividades del club.

Atributos:

- `route_id`: UUID, clave primaria.
- `created_by_member`: UUID, clave foránea a `members.member_id`, nula si la ruta la crea un administrador.
- `created_by_admin`: UUID, clave foránea a `admin_users.admin_id`, nula si la ruta la propone un socio.
- `created_by_type`: tipo de creador (`MEMBER`, `ADMIN`).
- `reviewed_by`: UUID de un administrador que revisa o resuelve la propuesta (aprobación o rechazo).
- `title`: título de la ruta.
- `description`: texto descriptivo.
- `difficulty`: nivel de dificultad, con opciones como `EASY`, `MEDIUM`, `HARD`.
- `distance_km`: distancia de la ruta.
- `meeting_point`: punto de encuentro.
- `status`: `PROPOSAL`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `COMPLETED`, `CANCELLED`.
- `departure_date`, `departure_time`: fecha y hora de salida.
- `return_date`: fecha estimada de regreso.
- `has_lodging`, `has_restaurant`: banderas de servicios complementarios.
- `base_price`: precio base de la ruta. Puede ser NULL o 0 si es gratuita.
- `lodging_price`: coste de alojamiento asociado. Puede ser NULL o 0 si no aplica.
- `restaurant_price`: coste del restaurante asociado. Puede ser NULL o 0 si no aplica.
- `total_price`: precio total calculado. Puede ser NULL o 0 si es gratuita.
- `route_data`: JSONB flexible para almacenar información adicional (ej: requisitos técnicos, restricciones de edad, capacidad máxima, etc.). Estructura abierta según necesidades de la ruta.
- `reviewed_at`: fecha en que un administrador revisa o resuelve la propuesta (se rellena en cualquier resolución: aprobación, rechazo o cambio de estado administrativo).
- `created_at`, `updated_at`: trazabilidad.

Relaciones:

- Una ruta puede ser propuesta por un socio o creada por un administrador.
- La propuesta del socio queda en revisión antes de publicarse.
- La ruta puede tener varias imágenes y varios eventos de calendario.
- La ruta puede generar varias inscripciones y pagos.
- La ruta puede asociar avisos y comunicaciones.

Restricciones:

- `title` no nulo.
- Debe existir exactamente un origen de creación: `created_by_member` o `created_by_admin`, nunca ambos nulos (validar con `CHECK ((created_by_member IS NOT NULL) XOR (created_by_admin IS NOT NULL))`).
- `status` restringido por `CHECK ((status IN ('PROPOSAL', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'COMPLETED', 'CANCELLED')))`.
- Los precios deben ser valores monetarios válidos (>= 0) o NULL.
- `reviewed_by` se rellena cuando la ruta cambia de estado `PENDING_REVIEW` a `PUBLISHED` o `REJECTED`.

### 3.2.3 `calendar_events`

Representa una entrada en el calendario de actividades del club. Su propósito principal es permitir que los socios visualicen cuándo son la próximas rutas y eventos del año. Se administra de forma independiente a las rutas para mayor flexibilidad en la presentación de la agenda.

Atributos:

- `event_id`: UUID, clave primaria.
- `route_id`: UUID, clave foránea a `routes.route_id`, puede ser nulo si el evento es un compromiso u actividad independiente de una ruta.
- `created_by`: UUID, clave foránea a `admin_users.admin_id`.
- `title`: nombre del evento.
- `description`: texto descriptivo.
- `start_at`, `end_at`: fecha y hora de inicio y fin.
- `location`: lugar del evento.
- `status`: `SCHEDULED`, `DONE`, `CANCELLED`.
- `capacity`: número de plazas disponibles para la actividad (opcional).
- `created_at`, `updated_at`: trazabilidad.

Relaciones:

- Un evento puede estar asociado a una ruta existente (para mostrar su programación en el calendario) o ser independiente (ej: reunión administrativa, evento especial del club).
- Se crea desde administración.

Restricciones:

- `start_at` no nulo.
- El `status` se controla mediante restricción `CHECK` con valores válidos: `SCHEDULED`, `DONE`, `CANCELLED`.


---

## 4. Especificación de la API

## 4.1 Descripción de los endpoints principales
Se describen 3 de los principales endpoints:

1. Autenticación y registro de socio.
2. Consulta y gestión del perfil del socio.
3. Consulta y administración de rutas.

### 4.1.1 Auth

- `POST /auth/login`: valida credenciales del socio o administrador y devuelve JWT y perfil.
- `POST /auth/register`: crea el registro inicial de un socio y su cuenta de acceso.
- `POST /auth/logout`: cierra sesión

### 4.1.2 Socios

- `GET /members/{memberId}`: devuelve el perfil de un socio por identificador.
- `PUT /members/{memberId}`: actualiza datos del perfil del socio.

### 4.1.3 Rutas

- `GET /routes`: obtiene rutas públicas o visibles.
- `POST /routes`: crea una nueva ruta, usado por administración.
- `POST /members/{memberId}/route-proposals`: permite a un socio proponer una nueva ruta para revisión.
- `GET /routes/proposals`: lista propuestas de rutas pendientes de revisión administrativa.
- `POST /routes/{routeId}/review`: aprueba o rechaza una propuesta de ruta.
- `GET /routes/{routeId}`: obtiene una ruta con detalle.
- `PUT /routes/{routeId}`: actualiza una ruta.
- `GET /routes/{routeId}/media`: devuelve medios asociados.
- `POST /routes/{routeId}/media`: carga una imagen o vídeo para una ruta.

## 4.2 Ejemplos de petición y respuesta
### 4.2.1 Auth/Login

```yaml
/auth/login:
    post:
      tags: [Auth]
      summary: Iniciar sesión en la plataforma
      operationId: loginMember
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
            examples:
              loginSocio:
                summary: Inicio de sesión de socio
                value:
                  email: socio@frapenangels.com
                  password: P@ssw0rd123
      responses:
        '200':
          description: Login correcto
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
              examples:
                loginOk:
                  summary: Respuesta de login correcta
                  value:
                    token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2NpbyIsImV4cCI6MTcyNTk0OTQwMH0.abc123def456
                    expiresAt: 2026-08-11T12:30:00Z
                    member:
                      memberId: 11111111-1111-1111-1111-111111111111
                      roleId: 22222222-2222-2222-2222-222222222222
                      email: socio@frapenangels.com
                      firstName: Ana
                      lastName: García
                      membershipNumber: FRP-1001
                      status: ACTIVE
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

 responses:
    Unauthorized:
      description: Credenciales inválidas o sesión no autorizada
 schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    AuthToken:
      type: object
      properties:
        token:
          type: string
        expiresAt:
          type: string
          format: date-time
        member:
          $ref: '#/components/schemas/Member'  
          
    Member:
      type: object
      properties:
        memberId:
          type: string
          format: uuid
        roleId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        dni:
          type: string
        membershipNumber:
          type: string
        status:
          type: string
          enum: [ACTIVE, INACTIVE, BLOCKED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```
### 4.2.2 Auth/Register

```yaml
/auth/register:
    post:
      tags: [Auth]
      summary: Registro inicial de un socio
      operationId: registerMember
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateMemberRequest'
            examples:
              registroSocio:
                summary: Registro de un nuevo socio
                value:
                  email: nueva.socia@frapenangels.com
                  password: P@ssw0rd123
                  firstName: Marta
                  lastName: Ruiz
                  dni: 12345678Z
                  phone: 600123456
                  address: Calle Mayor 10
                  city: Valencia
                  postalCode: 46001
      responses:
        '201':
          description: Socio creado correctamente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
              examples:
                memberCreated:
                  summary: Socio creado correctamente
                  value:
                    memberId: 33333333-3333-3333-3333-333333333333
                    roleId: 22222222-2222-2222-2222-222222222222
                    email: nueva.socia@frapenangels.com
                    firstName: Marta
                    lastName: Ruiz
                    dni: 12345678Z
                    membershipNumber: FRP-1002
                    status: ACTIVE
        '409':
          $ref: '#/components/responses/Conflict'

components:
 responses:
   Conflict:
      description: El recurso ya existe o el estado no es válido
 schemas:
   CreateMemberRequest:
      type: object
      required: [email, password, firstName, lastName]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        firstName:
          type: string
        lastName:
          type: string
        dni:
          type: string
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        postalCode:
          type: string

    Member:
      type: object
      properties:
        memberId:
          type: string
          format: uuid
        roleId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        dni:
          type: string
        membershipNumber:
          type: string
        status:
          type: string
          enum: [ACTIVE, INACTIVE, BLOCKED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

```

## 5. Historias de Usuario

**Historia de Usuario 1: Gestión de perfil y autenticación del socio**

### ID
HU-01

### Como
socio del club Frapen Angels

### Quiero
registrarme en la plataforma, acceder con mis credenciales, crear y mantener mi perfil actualizado

### Para
participar en rutas, consultar información del club y gestionar mi información personal de forma autónoma y segura.

### Valor de negocio
Permite captar nuevos socios, asegurar datos actualizados en la base de datos del club, mejorar la calidad de comunicaciones y pagos, y habilitar la participación digital desde el primer contacto.

### Criterios de aceptación

**Registro inicial:**
- El usuario puede registrarse con nombre, apellidos, correo electrónico, contraseña y datos básicos de contacto (teléfono, dirección, ciudad, código postal).
- El sistema valida que el correo sea único y que los datos obligatorios estén completos.
- Las contraseñas se almacenan de forma segura mediante hash (bcrypt).
- Tras el registro, el socio queda con estado `ACTIVE` o `INACTIVE` según la política del negocio.
- El socio recibe una confirmación de registro (por correo o interfaz) con su número de socio asignado.

**Acceso y autenticación:**
- El socio puede iniciar sesión con correo y contraseña y recibir un token JWT válido.
- Si las credenciales son incorrectas, el sistema devuelve un error claro sin exponer información sensible.
- La autenticación y autorización se validan en la capa de aplicación según el rol del usuario.
- El sistema permite cerrar sesión y limpiar el token.

**Actualización de perfil:**
- El socio puede acceder a una vista de edición de su perfil desde un área protegida.
- Puede actualizar: nombre, apellidos, teléfono, dirección, ciudad, código postal.
- No puede cambiar: correo de acceso original, número de socio, fecha de nacimiento (si se registraron).
- El socio puede cambiar su contraseña mediante validación de contraseña actual.
- El sistema valida el formato de datos (teléfono, código postal, etc.).
- Todos los cambios se guardan con timestamp para trazabilidad.
- El sistema muestra confirmación clara de cambios guardados.

### Notas de producto
El flujo de registro debe ser simple, rápido y confiable. Un perfil bien mantenido es fundamental para la calidad operativa del club en comunicaciones y cobros. La capacidad de auto-mantener datos reduce fricción y errores.

**Historia de Usuario 2: Experiencia de rutas para el socio**

### ID
HU-02

### Como
socio del club

### Quiero
consultar rutas publicadas, ver galerías de fotos, acceder al calendario, inscribirme en rutas, proponer nuevas rutas y revisar mi historial de participación

### Para
planificar mi participación, conocer actividades disponibles con detalle visual, contribuir al club con propuestas y recordar mi participación histórica.

### Valor de negocio
Aumenta participación, facilita la toma de decisiones del socio, enriquece el catálogo de forma colaborativa, fortalece la fidelización mediante historial visible, y reduce fricción en la experiencia de usuario.

### Criterios de aceptación

**Consulta y visualización de rutas:**
- El socio ve una lista de rutas publicadas con: título, fecha, dificultad, precio, punto de encuentro, estado.
- Al abrir una ruta, accede a detalles: descripción, distancia, servicios (alojamiento, restaurante), duración, fotos.
- El socio puede ver la galería de imágenes asociadas a cada ruta (fotos de viajes anteriores, puntos de interés).
- El socio accede a un calendario de actividades que muestra rutas programadas y eventos del club por fecha.
- Puede filtrar rutas por dificultad, fecha, precio o servicios incluidos.

**Inscripción y reserva:**
- El socio puede inscribirse en una ruta publicada indicando número de acompañantes si es permitido.
- El sistema evita duplicidades de inscripción para el mismo socio en la misma ruta.
- Si la ruta requiere pago, el sistema genera un registro de pago con desglose de costos.
- El socio recibe confirmación clara de inscripción con detalles del importe total y estado del pago.
- La inscripción se registra en `route_registrations` consistente con el flujo de pagos.

**Propuesta de nuevas rutas:**
- El socio accede a un formulario para proponer nuevas rutas desde su área personal.
- Propone: título, descripción, dificultad, distancia, fecha, punto de encuentro, servicios, precios estimados.
- Puede adjuntar fotos que haya tomado previamente.
- El sistema valida datos obligatorios antes de enviar.
- Una propuesta queda en estado `PENDING_REVIEW` no visible para otros socios.
- El socio recibe confirmación y puede hacer seguimiento del estado de sus propuestas.
- Si es rechazada, recibe notificación con el motivo para mejorar propuestas futuras.

**Historial y seguimiento:**
- El socio accede a "Mis Rutas" con dos secciones: "Próximas Rutas" (inscritas) y "Rutas Realizadas" (históricas).
- Cada entrada muestra: título, fecha, dificultad, estado de inscripción, estado del pago si aplica.
- Al hacer clic, ve detalles completos: descripción, fotos, servicios, costo final.
- Puede filtrar historial por fecha o rango.
- El sistema muestra contadores: rutas totales realizadas, km recorridos, dificultad promedio.
- Para rutas pagadas, ve desglose de costos y estado del pago (PENDING, PAID, REFUNDED).

### Notas de producto
Esta es la historia central del valor del producto. Una experiencia clara y visual en la consulta de rutas, combinada con propuestas colaborativas y un historial motivador, crea un ciclo de participación recurrente y fidelización del socio.

**Historia de Usuario 3: Gestión administrativa de rutas, contenido y comunicaciones**

### ID
HU-03

### Como
administrador del sistema

### Quiero
crear y gestionar rutas, cargar contenido multimedia, programar eventos, moderar propuestas de socios y enviar comunicaciones

### Para
mantener una oferta de rutas atractiva, enriquecer la experiencia visual, organizar la actividad del club, asegurar calidad de propuestas y comunicar cambios y novedades a los socios.

### Valor de negocio
Permite operación eficiente del club, garantiza calidad de contenido, reduce fricción administrativa, fomenta participación mediante comunicación efectiva, y centraliza el control de la experiencia del socio.

### Criterios de aceptación

**Creación y gestión de rutas:**
- El administrador puede crear rutas con: título, descripción, dificultad, fechas, punto de encuentro, distancia, servicios (alojamiento, restaurante), precios.
- Puede editar y actualizar rutas ya creadas.
- Puede cambiar estado: DRAFT, PUBLISHED, COMPLETED, CANCELLED.
- Solo administradores con permisos pueden realizar estas acciones (verificado en backend).

**Gestión de contenido multimedia y galería:**
- El administrador adjunta imágenes y vídeos a una ruta para enriquecer la galería.
- Puede marcar una imagen como portada de la ruta.
- La galería es visible para socios en la consulta de rutas.

**Gestión del calendario:**
- El administrador crea eventos de calendario vinculados a rutas o como actividades independientes.
- Define: fecha, hora, ubicación, descripción, capacidad máxima.
- Los eventos se muestran en la vista de calendario pública para socios.

**Moderación de propuestas de socios:**
- El administrador accede a una lista de propuestas en estado `PENDING_REVIEW`.
- Ve datos básicos: propuesta, autor, fecha de creación.
- Puede aprobar la propuesta → cambia a `PUBLISHED` y es visible para otros socios.
- Puede rechazar con motivo → el socio recibe notificación explicativa.
- Puede devolver para revisión → el socio puede mejorar y reenviar.
- La decisión queda registrada con identificador del administrador y timestamp.

**Comunicaciones y avisos:**
- El administrador crea avisos (notificaciones) con: título, descripción, tipo (ROUTE, GENERAL, REMINDER).
- Puede programar cuándo enviar o enviar inmediatamente.
- Los avisos se entregan a socios con registro de entrega y lectura.
- El administrador ve estadísticas de entrega y apertura.

**Trazabilidad y auditoría:**
- Todas las operaciones se registran con: identificador del administrador, tipo de acción, entidad modificada, timestamp.
- El sistema permite auditoría y seguimiento de cambios en rutas, propuestas y comunicaciones.

### Notas de producto
Esta historia es el corazón operativo del club. Un administrador capacitado con herramientas claras puede enriquecer la experiencia del socio, mantener estándares de calidad, moderar colaborativamente y comunicar eficientemente. El flujo respeta la arquitectura modular: todo se gestiona desde la capa de aplicación/services del backend mediante endpoints REST.

---

## 6. Tickets de Trabajo 

**Ticket 1: Gestión de perfil y autenticación del socio - Base de datos**

### ID
TD-01

### Título
Crear las tablas y migraciones para socios, roles y autenticación

### Tipo
Base de datos

### Prioridad
Alta

### Responsable sugerido
Desarrollador de base de datos / backend

### Contexto
El sistema necesita persistir la información de los socios y la autenticación de acceso. El modelo propuesto en [documentos/modeloDatos.md](modeloDatos.md) define la estructura base de estas entidades y debe materializarse de forma segura y consistente.

### Objetivo
Crear la estructura de base de datos necesaria para almacenar los datos de registro, acceso y perfil de los socios, así como roles y permisos.

### Alcance
Incluye:
- creación de la tabla `roles`;
- creación de la tabla `members`;
- creación de la tabla `admin_users` para separar acceso administrativo;
- restricciones de unicidad para correo, DNI y número de socio;
- migraciones iniciales para el esquema;
- índices básicos de búsqueda y rendimiento.

### Fuera de alcance
- migraciones de datos históricas;
- particionado de tablas;
- gestión avanzada de auditoría masiva.

### Requisitos funcionales
- El sistema debe almacenar correctamente los datos del socio (nombre, apellidos, contacto, etc.).
- Las credenciales deben almacenarse de forma segura mediante hash.
- No debe existir más de un registro de miembro con el mismo correo.
- La base de datos debe permitir identificar el rol del usuario (socio, admin).
- Debe registrarse el timestamp de creación, actualización y último login.

### Requisitos técnicos
- Definir tipos apropiados para UUID, texto, fechas, estados y hash de contraseñas.
- Crear restricciones `NOT NULL`, `UNIQUE` y `CHECK` donde corresponda.
- Añadir comentarios descriptivos a tablas y columnas.
- Preparar migraciones idempotentes y versionadas.

### Tareas de implementación
1. Crear la migración de la tabla `roles` con permisos JSONB.
2. Crear la migración de la tabla `members` con todos los campos de perfil.
3. Crear la migración de la tabla `admin_users` para administradores.
4. Definir restricciones de unicidad (correo, DNI, membership_number).
5. Añadir índices para búsquedas por correo y estado.
6. Validar la migración en un entorno limpio.

### Criterios de aceptación
- Las tablas se crean correctamente con la estructura definida.
- Las relaciones entre tablas son correctas.
- Las restricciones de unicidad se aplican (no duplicar correo, DNI, membership_number).
- La migración puede ejecutarse sin errores en un entorno limpio.
- El backend puede insertar y leer registros de forma consistente.

### Dependencias
- Modelo de datos consensuado en [documentos/modeloDatos.md](modeloDatos.md).
- Motor de base de datos PostgreSQL propuesto.
- Requisitos de negocio para estados de usuario y roles.

### Riesgos
- Diseño incompleto del esquema.
- Falta de restricciones que provoque datos duplicados.
- Problemas de migración en entornos diferentes.

### Entregables
- Migraciones SQL versionadas.
- Esquema de base de datos listo para el backend.
- Validación de integridad y unicidad.

### Definición de hecho
El ticket se considera completo cuando:
- las migraciones ejecutan correctamente;
- las tablas y relaciones quedan creadas;
- el backend puede interactuar con ellas sin errores;
- las reglas de integridad y unicidad están aplicadas.

### Dependencia directa
Debe completarse antes que TB-01 (backend).

**Ticket 2: Gestión de perfil y autenticación del socio - Backend**

### ID
TB-01

### Título
Implementar endpoints de registro, login y actualización de perfil para socios

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-01 exige que un nuevo socio pueda registrarse, acceder y mantener su perfil actualizado. Este flujo debe ser soportado por la API propuesta en [documentos/apis.md](apis.md) y por el modelo de datos descrito en [documentos/modeloDatos.md](modeloDatos.md).

### Objetivo
Desarrollar los servicios backend necesarios para:
- crear un nuevo perfil de socio;
- validar credenciales de acceso;
- emitir un token de sesión seguro;
- permitir actualización de datos de perfil;
- devolver respuestas claras para casos exitosos y de error.

### Alcance
Incluye:
- creación del endpoint `POST /auth/register`;
- creación del endpoint `POST /auth/login`;
- creación del endpoint `PUT /members/{memberId}` para actualización de perfil;
- validación de datos obligatorios y formato de correo;
- hash seguro de contraseñas usando bcrypt;
- cambio de contraseña con validación de contraseña actual;
- gestión de errores de autenticación y duplicidad;
- integración con el modelo de datos de miembros;
- generación y retorno de un token JWT;
- logging de operaciones para auditoría.

### Fuera de alcance
- recuperación de contraseña;
- integración con proveedores externos de identidad;
- gestión avanzada de roles y permisos;
- flujo de activación por email.

### Requisitos funcionales
- Un nuevo socio debe poder registrarse con nombre, apellidos, correo, contraseña y datos opcionales.
- El sistema debe rechazar registros con correo duplicado.
- El sistema debe almacenar la contraseña de forma segura mediante hash.
- El sistema debe permitir iniciar sesión con correo y contraseña válidos.
- Si las credenciales son incorrectas, la API debe devolver error 401 sin exponer información sensible.
- La respuesta de login debe incluir token JWT y datos básicos del socio.
- El socio puede actualizar sus datos personales (nombre, apellidos, teléfono, dirección, ciudad, código postal).
- El socio NO puede cambiar su email de acceso original ni su número de socio.
- El socio puede cambiar su contraseña mediante validación de contraseña actual.
- Todos los cambios quedan registrados con timestamp para trazabilidad.

### Requisitos técnicos
- Implementar en la capa de aplicación/services la lógica de autenticación y perfil.
- Utilizar librería bcrypt para hashing seguro de contraseñas.
- Utilizar JWT para generación de tokens con expiración configurable.
- Aplicar validación de entrada en DTOs.
- Registrar eventos relevantes para auditoría.
- Usar patrones de error consistentes en toda la API.

### Tareas de implementación
1. Definir DTOs para registro, login y actualización de perfil.
2. Crear el servicio de autenticación con lógica de registro.
3. Crear servicio de perfil para actualización de datos.
4. Implementar lógica de login y generación de JWT.
5. Añadir validaciones de negocio y manejo de errores.
6. Conectar con la capa de persistencia (TypeORM).
7. Escribir pruebas unitarias e integración.
8. Actualizar documentación de API con ejemplos.

### Criterios de aceptación
- Un usuario puede registrarse correctamente con datos válidos.
- El sistema no permite registrarse dos veces con el mismo correo.
- El sistema devuelve errores consistentes para datos incompletos o inválidos.
- El login con credenciales correctas devuelve un token válido.
- El login con credenciales incorrectas devuelve error 401.
- Las contraseñas nunca se almacenan en texto plano.
- El socio puede actualizar su perfil con cambios reflejados inmediatamente.
- El cambio de contraseña requiere validación de contraseña actual.

### Dependencias
- Base de datos completada (TD-01).
- Modelo de datos de miembros y roles.
- Configuración de JWT en el proyecto.
- Endpoint de autenticación documentado.

### Riesgos
- Implementación insegura de manejo de contraseñas.
- Token mal configurado o expuesto incorrectamente.
- Duplicidad de usuarios por ausencia de restricciones.
- Validación insuficiente de datos de entrada.

### Entregables
- Endpoints funcionales de registro, login y actualización.
- Pruebas automatizadas para flujos positivos y negativos.
- Documentación técnica actualizada.

### Definición de hecho
El ticket se considera completo cuando:
- los endpoints están operativos y responden correctamente;
- las pruebas pasan exitosamente;
- la API responde según los criterios de aceptación;
- la seguridad básica está implementada (hash, JWT);
- la documentación está actualizada.

### Dependencia directa
Debe ejecutarse después de TD-01 y antes de TF-01.

**Ticket 3: Gestión de perfil y autenticación del socio - Frontend**

### ID
TF-01

### Título
Crear la experiencia de registro, login y gestión de perfil para el socio

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend ofrecerá los endpoints necesarios, pero la historia HU-01 requiere que el socio pueda completar registro, login y mantener su perfil desde la interfaz web sin fricción. La solución debe ser intuitiva, clara y alineada con el producto del club.

### Objetivo
Desarrollar las pantallas y flujos de usuario para:
- registro inicial del socio;
- acceso a la plataforma;
- gestión y actualización del perfil;
- cambio de contraseña;
- manejo de errores de formulario;
- redirección tras login exitoso.

### Alcance
Incluye:
- pantalla de registro con formulario de datos básicos;
- pantalla de login con correo y contraseña;
- pantalla de perfil con edición de datos;
- pantalla de cambio de contraseña;
- validación visual de campos obligatorios;
- mensajes de error y éxito;
- almacenamiento seguro del token tras login;
- rutas protegidas para usuarios autenticados;
- redirección al área principal del socio.

### Fuera de alcance
- recuperación de contraseña;
- integración con redes sociales;
- vistas administrativas;
- multi-factor authentication.

### Requisitos funcionales
- El socio puede completar un formulario de registro con datos mínimos requeridos.
- El formulario muestra errores inline si faltan campos o el formato es incorrecto.
- Al registrarse correctamente, el usuario ve una confirmación y puede iniciar sesión.
- El login redirige al usuario a su panel principal.
- Si el backend devuelve un error, la interfaz lo muestra de forma comprensible.
- El socio accede a una pantalla de perfil donde puede ver y editar sus datos.
- El socio puede cambiar su contraseña mediante un formulario separado.
- Logout limpia la sesión y redirige a login.

### Requisitos técnicos
- Consumo de los endpoints de autenticación del backend.
- Manejo de estados de carga, error y éxito.
- Uso de rutas protegidas para usuarios autenticados.
- Almacenamiento seguro del token en el cliente (localStorage o sessionStorage).
- Interceptores HTTP para inyectar token en requests.
- Validación de formularios en el cliente.

### Tareas de implementación
1. Crear rutas de `/auth/register`, `/auth/login`, `/profile`.
2. Diseñar y desarrollar el formulario de registro.
3. Diseñar y desarrollar el formulario de login.
4. Implementar integración con API de registro y login.
5. Crear pantalla de perfil con edición de datos.
6. Crear pantalla de cambio de contraseña.
7. Implementar manejo de errores y validaciones.
8. Implementar redirecciones tras login exitoso.
9. Añadir tests de interfaz básicos.

### Criterios de aceptación
- El usuario puede registrarse y ver confirmación de éxito.
- El usuario puede iniciar sesión y acceder a su panel principal.
- El usuario puede editar su perfil y ver cambios reflejados.
- El usuario puede cambiar su contraseña exitosamente.
- Los formularios muestran errores claros si los datos son inválidos.
- Los mensajes de error del backend se traducen en UX comprensible.
- El token se almacena y se utiliza en requests subsecuentes.

### Dependencias
- Endpoints de autenticación disponibles y funcionales (TB-01).
- Diseño visual del flujo aprobado por producto.
- Definición de rutas de navegación del usuario autenticado.

### Riesgos
- Mala experiencia de usuario por formularios poco claros.
- Problemas de integración con la API.
- Gestión insegura del token en el cliente.
- Falta de validación client-side causando UX pobre.

### Entregables
- Pantallas de registro, login, perfil y cambio de contraseña.
- Flujo completo funcional end-to-end.
- Tests de interfaz básicos.
- Documentación de flujos de usuario.

### Definición de hecho
El ticket se considera completo cuando:
- las pantallas funcionan correctamente;
- el flujo de registro, login y perfil se valida en el navegador;
- los errores se gestionan correctamente;
- la experiencia es coherente con la propuesta de producto;
- el usuario puede completar el flujo completo sin fricción.

### Dependencia directa
Debe ejecutarse después de TB-01.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**
En esta 1ra pull request se entrega la parte de la documentación técnica que se puede realizar sin haber empezado los desarrollos. En la misma, se ha creado una carpeta documentos con todo lo referente a la arquitectura, modelo de datos, API, 3 historias de usuarios y 3 tickets de la primera historia de usuario. También se ha completado lo que se podía en el readme.md y los prompts en prompts.md que se han usado para esta parte.

**Pull Request 2**

**Pull Request 3**

