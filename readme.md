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

Permitirá inscribirse a los socios, actualizar sus datos, ver el calendario de actividades, ver la galería de imágenes de las rutas, subir rutas o ver rutas ya hechas, pasarela de pago para rutas con hotel o restaurante... Además habrá una parte de administración para que se pueda gestionar y enviar correos con la próxima ruta y demás avisos.

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
    MEMBERS ||--o{ ROUTE_REGISTRATIONS : "member_id"
    ROUTES ||--o{ ROUTE_REGISTRATIONS : "route_id"
    MEMBERS ||--o{ PAYMENTS : "member_id"
    ROUTES ||--o{ PAYMENTS : "route_id"
    MEMBERS ||--o{ NOTIFICATIONS : "member_id"
    ADMIN_USERS ||--o{ NOTIFICATIONS : "created_by"
    ROUTES ||--o{ NOTIFICATIONS : "route_id"
    ROUTES ||--o{ ROUTE_MEDIA : "route_id"
    ROUTES ||--o{ CALENDAR_EVENTS : "route_id"
    ADMIN_USERS ||--o{ ROUTES : "created_by"
    ADMIN_USERS ||--o{ CALENDAR_EVENTS : "created_by"

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
        UUID created_by FK "FK -> admin_users.admin_id"
        VARCHAR title "not null"
        TEXT description
        VARCHAR difficulty "EASY, MEDIUM, HARD"
        DECIMAL distance_km
        VARCHAR meeting_point
        VARCHAR status "DRAFT, PUBLISHED, COMPLETED, CANCELLED"
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

- La entidad `members` representa el perfil principal de los socios. También puede ser reutilizada para autenticación, control de acceso y trazabilidad de actividades.
- La entidad `admin_users` permite separar el acceso administrativo del perfil principal del socio. En una implementación real puede ser un perfil bajo la misma tabla de usuario, pero el diseño lo expresa de forma explícita para mantener el control de permisos.
- Las rutas están relacionadas con una política de publicación y con precio y disponibilidad.
- `route_registrations` es la tabla de inscripción de socio a ruta.
- `payments` se asocia al socio, a la ruta y a la inscripción como una operación de cobro transaccional.
- `notifications` y `notification_recipients` permiten la administración de comunicaciones y el envío de avisos a socios.
- `audit_logs` recoge operaciones relevantes y ayuda a la seguridad y a la observabilidad.

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
- `created_by`: UUID, clave foránea a `admin_users.admin_id`.
- `title`: título de la ruta.
- `description`: texto descriptivo.
- `difficulty`: nivel de dificultad, con opciones como `EASY`, `MEDIUM`, `HARD`.
- `distance_km`: distancia de la ruta.
- `meeting_point`: punto de encuentro.
- `status`: `DRAFT`, `PUBLISHED`, `COMPLETED`, `CANCELLED`.
- `departure_date`, `departure_time`: fecha y hora de salida.
- `return_date`: fecha estimada de regreso.
- `has_lodging`, `has_restaurant`: banderas de servicios complementarios.
- `base_price`: precio base de la ruta.
- `lodging_price`: coste de alojamiento asociado.
- `restaurant_price`: coste del restaurante asociado.
- `total_price`: precio total calculado.
- `route_data`: JSONB para criterios de cálculo o información adicional.
- `created_at`, `updated_at`: trazabilidad.

Relaciones:

- La ruta es creada por un administrador.
- La ruta puede tener varias imágenes y varios eventos de calendario.
- La ruta puede generar varias inscripciones y pagos.
- La ruta puede asociar avisos y comunicaciones.

Restricciones:

- `title` no nulo.
- `status` restringido por `CHECK`.
- `total_price` permitir validación consistente con los precios parciales.

### 3.2.3 `calendar_events`

Representa una entrada en el calendario de actividades del club.

Atributos:

- `event_id`: UUID, clave primaria.
- `route_id`: UUID, clave foránea a `routes.route_id`, puede ser nulo si el evento no corresponde exactamente con una ruta.
- `created_by`: UUID, clave foránea a `admin_users.admin_id`.
- `title`: nombre del evento.
- `description`: texto descriptivo.
- `start_at`, `end_at`: fecha y hora de inicio y fin.
- `location`: lugar del evento.
- `status`: `SCHEDULED`, `DONE`, `CANCELLED`.
- `capacity`: número de plazas disponibles para la actividad.
- `created_at`, `updated_at`: trazabilidad.

Relaciones:

- Un evento puede estar asociado a una ruta o ser independiente.
- Se crea desde administración.

Restricciones:

- `start_at` no nulo.
- El `status` puede controlarse mediante `CHECK`.

### 3.2.4 `payments`

Entidad de control del proceso de cobro asociado a una ruta o actividad.

Atributos:

- `payment_id`: UUID, clave primaria.
- `member_id`: UUID, clave foránea a `members.member_id`.
- `route_id`: UUID, clave foránea a `routes.route_id`.
- `registration_id`: UUID, clave foránea a `route_registrations.registration_id`, si el pago se ha asociado a una inscripción.
- `provider`: proveedor externo de pago (`STRIPE`, `PAYPAL`, `MANUAL`).
- `provider_payment_id`: identificador externo del intento/cobro.
- `status`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`.
- `amount`: importe del pago.
- `currency`: moneda usada en el cobro.
- `created_at`: fecha de creación del pago.
- `paid_at`: fecha de confirmación del cobro.
- `provider_payload`: JSONB con el payload de la pasarela.

Relaciones:

- Un pago está vinculado a un socio.
- Un pago puede estar asociado a una ruta concreta.
- Un pago puede vincularse a una inscripción.

Restricciones:

- `provider_payment_id` debe ser único si se utiliza como identificador externo.
- `amount` no puede ser negativo.
- `currency` con `CHECK` si se desea limitar a códigos ISO.

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

### 4.1.2 Socios

- `GET /members/{memberId}`: devuelve el perfil de un socio por identificador.
- `PUT /members/{memberId}`: actualiza datos del perfil del socio.

### 4.1.3 Rutas

- `GET /routes`: obtiene rutas públicas o visibles.
- `POST /routes`: crea una nueva ruta, usado por administración.
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

**Historia de Usuario 1: Registro y acceso del socio**

### ID
HU-01

### Como
socio del club Frapen Angels

### Quiero
registrarme en la plataforma, crear mi perfil y acceder con mis credenciales

### Para
poder participar en rutas, consultar información relevante del club y gestionar mi perfil de forma autónoma.

### Valor de negocio
Permite captar nuevos socios y habilitar su participación en la experiencia digital del club desde el primer contacto.

### Criterios de aceptación
- El usuario puede registrarse con nombre, apellidos, correo electrónico, contraseña y datos básicos de contacto.
- El sistema valida que el correo electrónico sea único y que los datos obligatorios estén completos.
- Tras el registro, el socio queda con un estado inicial activo o pendiente de activación según la regla de negocio definida.
- El socio puede iniciar sesión con su correo y contraseña y recibir un token de sesión válido.
- Si las credenciales son incorrectas, el sistema devuelve un error de autenticación claro y sin exponer información sensible.

### Notas de producto
El flujo de registro debe ser simple y rápido, con un proceso que reduzca fricción y genere confianza desde el inicio.

**Historia de Usuario 2: Consulta y reserva de rutas**

### ID
HU-02

### Como
socio del club

### Quiero
consultar las rutas publicadas y poder inscribirme en aquellas que me interesen

### Para
planificar mi participación en actividades del club y reservar mi plaza de forma sencilla.

### Valor de negocio
Aumenta la participación de los socios y facilita la organización de actividades con una experiencia más fluida.

### Criterios de aceptación
- El socio puede ver una lista de rutas publicadas con información básica: título, fecha, dificultad, precio, punto de encuentro y estado.
- Al abrir una ruta, puede consultar detalles como descripción, distancia, servicios incluidos y si tiene alojamiento o restaurante.
- El socio puede inscribirse en una ruta indicando, si procede, el número de acompañantes.
- El sistema evita duplicidades de inscripción para el mismo socio en la misma ruta.
- Si la ruta requiere pago asociado, el sistema genera un registro de pago y refleja el estado de la operación.
- El socio recibe una confirmación clara de la inscripción y del estado del pago.

### Notas de producto
Esta historia es central para el valor del producto, ya que conecta la experiencia del socio con la gestión operativa del club.

**Historia de Usuario 3: Gestión de rutas, calendario y avisos por parte del administrador**

### ID
HU-03

### Como
administrador del sistema

### Quiero
crear y gestionar rutas, eventos del calendario y avisos para los socios

### Para
mantener informados a los socios, organizar la actividad del club y controlar la operación diaria del servicio.

### Valor de negocio
Permite a la organización operar de manera más eficiente y mantener una comunicación efectiva con los socios.

### Criterios de aceptación
- El administrador puede crear una ruta con sus datos principales: título, descripción, dificultad, fechas, precio y servicios asociados.
- El administrador puede adjuntar imágenes o contenido visual a la ruta para enriquecer la galería.
- El administrador puede programar eventos de calendario vinculados a rutas o actividades del club.
- El administrador puede crear y enviar avisos a los socios con información relevante sobre próximas rutas o cambios.
- Solo los usuarios con permisos de administrador pueden realizar estas acciones.
- Las operaciones realizadas quedan registradas con trazabilidad para auditoría y control.

### Notas de producto
Esta historia garantiza que el producto no solo sirve para la participación del socio, sino también para la gestión operativa y la comunicación del club.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1: Implementación del flujo de registro y autenticación**

### ID
TB-01

### Título
Implementar endpoints de registro y login para socios en la API

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-01 exige que un nuevo socio pueda registrarse en la plataforma y acceder con credenciales válidas. Este flujo debe ser soportado por la API propuesta en [documentos/apis.md](apis.md) y por el modelo de datos descrito en [documentos/modeloDatos.md](modeloDatos.md).

### Objetivo
Desarrollar los servicios backend necesarios para:
- crear un nuevo perfil de socio;
- validar credenciales de acceso;
- emitir un token de sesión seguro;
- devolver respuestas claras para casos exitosos y de error.

### Alcance
Incluye:
- creación del endpoint POST /auth/register;
- creación del endpoint POST /auth/login;
- validación de datos obligatorios y formato de correo;
- hash seguro de contraseñas;
- gestión de errores de autenticación y duplicidad de correo;
- integración con el modelo de datos de miembros;
- generación y retorno de un token JWT o mecanismo equivalente de sesión.

### Fuera de alcance
- recuperación de contraseña;
- integración con proveedores externos de identidad;
- gestión avanzada de roles y permisos;
- flujo de activación por email.

### Requisitos funcionales
- Un nuevo socio debe poder registrarse con nombre, apellidos, correo, contraseña y datos opcionales de contacto.
- El sistema debe rechazar registros con correo duplicado.
- El sistema debe almacenar la contraseña de forma segura mediante hash.
- El sistema debe permitir iniciar sesión con correo y contraseña válidos.
- Si las credenciales son incorrectas, la API debe devolver un error 401 con mensaje claro.
- La respuesta de login debe incluir el token de sesión y los datos básicos del socio.

### Requisitos técnicos
- Implementar en la capa de aplicación o casos de uso la lógica de registro y autenticación.
- Utilizar una librería de hashing segura para contraseñas.
- Utilizar un mecanismo de sesión basado en JWT o un mecanismo equivalente de autenticación.
- Aplicar validación de entrada en los DTOs o schemas de request.
- Registrar eventos relevantes para auditoría y trazabilidad.

### Tareas de implementación
1. Definir DTOs para registro y login.
2. Crear el servicio de autenticación.
3. Implementar la lógica de registro en el caso de uso correspondiente.
4. Implementar la lógica de login y generación de token.
5. Añadir validaciones de negocio y manejo de errores.
6. Conectar con la capa de persistencia para crear y recuperar miembros.
7. Escribir pruebas unitarias e integración para registro y login.
8. Actualizar la documentación de API con ejemplos reales.

### Criterios de aceptación
- Un usuario puede registrarse correctamente con datos válidos.
- El sistema no permite registrarse dos veces con el mismo correo.
- El sistema devuelve un error consistente para datos incompletos o inválidos.
- El login con credenciales correctas devuelve un token válido.
- El login con credenciales incorrectas devuelve un error de autenticación.
- Las contraseñas nunca se almacenan en texto plano.

### Dependencias
- Modelo de datos de miembros y roles.
- Configuración de JWT o mecanismo de sesión.
- Entorno de base de datos disponible.
- Endpoint de autenticación documentado en [documentos/apis.md](apis.md).

### Riesgos
- Implementación insegura de manejo de contraseñas.
- Token mal configurado o expuesto incorrectamente.
- Duplicidad de usuarios por ausencia de restricciones o validación.

### Entregables
- Endpoints funcionales de registro y login.
- Pruebas automatizadas para flujos positivos y negativos.
- Documentación técnica actualizada.

### Definición de hecho
El ticket se considera completo cuando:
- los endpoints están operativos;
- las pruebas pasan;
- la API responde según los criterios de aceptación;
- la seguridad básica está implementada.

**Ticket 2: Diseñar y desarrollar el flujo de registro y acceso**

### ID
TF-01

### Título
Crear la experiencia de registro y login para el socio en la web

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend ofrecerá los endpoints necesarios, pero la historia HU-01 requiere que el socio pueda completar el proceso desde la interfaz web sin fricción. La solución debe ser intuitiva, clara y alineada con el producto del club.

### Objetivo
Desarrollar las pantallas y flujos de usuario para:
- registro inicial;
- acceso a la plataforma;
- manejo básico de errores de formulario;
- redirección tras login exitoso.

### Alcance
Incluye:
- pantalla de registro con formulario de datos básicos;
- pantalla de login con correo y contraseña;
- validación visual de campos obligatorios;
- mensajes de error y éxito;
- almacenamiento local de sesión o token tras login;
- redirección al área principal del socio.

### Fuera de alcance
- recuperación de contraseña;
- integración con redes sociales;
- vistas administrativas para gestión de usuarios.

### Requisitos funcionales
- El socio puede completar un formulario de registro con los datos mínimos requeridos.
- El formulario muestra errores inline si faltan campos o el formato es incorrecto.
- Al registrarse correctamente, el usuario ve una confirmación y puede iniciar sesión.
- El login redirige al usuario a una vista principal o panel del socio.
- Si el backend devuelve un error, la interfaz lo muestra de forma comprensible.

### Requisitos técnicos
- Consumo de los endpoints de autenticación del backend.
- Manejo de estados de carga, error y éxito.
- Uso de rutas protegidas para usuarios autenticados.
- Almacenamiento seguro del token en el cliente, idealmente con medidas de seguridad apropiadas.

### Tareas de implementación
1. Crear las rutas de registro y login en la SPA o aplicación web.
2. Diseñar y desarrollar los formularios de entrada.
3. Implementar la integración con la API de registro y login.
4. Mostrar mensajes de error y validaciones para el usuario.
5. Implementar la redirección tras el login exitoso.
6. Añadir tests de interfaz básicos para el flujo principal.

### Criterios de aceptación
- El usuario puede registrarse y ver que el proceso ha terminado con éxito.
- El usuario puede iniciar sesión y acceder a una vista protegida.
- Los formularios muestran errores claros si los datos son inválidos.
- Los mensajes de error del backend se traducen en una experiencia comprensible para el usuario.

### Dependencias
- Endpoints de autenticación disponibles en backend.
- Diseño visual del flujo aprobado por producto.
- Definición de rutas de navegación del usuario autenticado.

### Riesgos
- Mala experiencia de usuario por formularios poco claros.
- Problemas de integración con la API.
- Gestión insegura del token en el cliente.

### Entregables
- Pantallas de registro y login.
- Flujo completo funcional.
- Pruebas de interfaz básicas.

### Definición de hecho
El ticket se considera completo cuando:
- las pantallas funcionan correctamente;
- el flujo de login y registro se valida en el navegador;
- los errores se gestionan correctamente;
- la experiencia es coherente con la propuesta de producto.

**Ticket 3: Crear la estructura de persistencia para socios y autenticación**

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
Crear la estructura de base de datos necesaria para almacenar los datos de registro y acceso de los socios, así como la información asociada a roles y perfiles.

### Alcance
Incluye:
- creación de la tabla de roles;
- creación de la tabla de miembros;
- creación de la tabla de administradores si se desea separar el acceso administrativo del perfil socio;
- restricciones de unicidad para correo, DNI y número de socio;
- migraciones iniciales para el esquema;
- índices básicos de búsqueda y rendimiento.

### Fuera de alcance
- migraciones de datos históricas;
- particionado de tablas;
- gestión avanzada de auditoría masiva.

### Requisitos funcionales
- El sistema debe poder almacenar correctamente los datos del socio.
- Las credenciales deben almacenarse de forma segura.
- No debe existir más de un registro de miembro con el mismo correo.
- La base de datos debe permitir identificar el rol del usuario.

### Requisitos técnicos
- Definir tipos apropiados para UUID, texto, fechas, estados y hash de contraseñas.
- Crear restricciones `NOT NULL`, `UNIQUE` y `CHECK` donde corresponda.
- Añadir comentarios descriptivos a tablas y columnas cuando sea necesario.
- Preparar migraciones idempotentes y versionadas.

### Tareas de implementación
1. Crear la migración de la tabla `roles`.
2. Crear la migración de la tabla `members`.
3. Crear la migración de la tabla `admin_users` si se integra en el diseño.
4. Definir restricciones de unicidad y de integridad referencial.
5. Añadir índices para búsquedas por correo y estado.
6. Validar la migración en un entorno limpio.

### Criterios de aceptación
- Las tablas se crean correctamente con la estructura definida.
- Las relaciones entre tablas son correctas.
- Las restricciones de unicidad se aplican.
- La migración puede ejecutarse sin errores en un entorno limpio.
- El backend puede insertar y leer registros de forma consistente.

### Dependencias
- Modelo de datos consensuado.
- Motor de base de datos PostgreSQL propuesto en [documentos/arquitectura.md](arquitectura.md).
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

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**
En esta 1ra pull request se entrega la parte de la documentación técnica que se puede realizar sin haber empezado los desarrollos. En la misma, se ha creado una carpeta documentos con todo lo referente a la arquitectura, modelo de datos, API, 3 historias de usuarios y 3 tickets de la primera historia de usuario. También se ha completado lo que se podía en el readme.md y los prompts en prompts.md que se han usado para esta parte.

**Pull Request 2**

**Pull Request 3**

