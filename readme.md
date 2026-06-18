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

### **0.1. Tu nombre completo: Roger Eduardo Fonseca Montero**

### **0.2. Nombre del proyecto: MecaTrack**

### **0.3. Descripción breve del proyecto: Flujo E2E de trazabilidad de trabajo en un taller mecánico**

### **0.4. URL del proyecto: https://github.com/rfonseca079/AI4Devs-finalproject.git**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

https://github.com/rfonseca079/AI4Devs-finalproject.git


---

## 1. Descripción general del producto

**MecaTrack** es una aplicación web orientada a talleres mecánicos que centraliza y digitaliza el ciclo completo de atención vehicular: desde el ingreso del vehículo hasta la notificación al propietario para su retiro. Elimina el uso de registros en papel, reduce errores de comunicación entre el equipo y ofrece trazabilidad total sobre diagnósticos, reparaciones, mantenimientos y costos asociados.

La plataforma está diseñada para ser utilizada internamente por los empleados del taller, con una interfaz simple y orientada al trabajo diario del mecánico, sin curva de aprendizaje elevada.

### **1.1. Objetivo:**

La aplicación pretende: 

- **Trazabilidad completa del vehículo:** cada auto tiene un historial detallado de todos los trabajos realizados en cada visita, consultable en cualquier momento.
- **Lista de tareas dinámica:** las órdenes de trabajo no son estáticas; pueden crecer conforme avanza la revisión, reflejando la realidad del trabajo mecánico.
- **Visibilidad del estado del taller:** el administrador puede ver en tiempo real qué vehículos están listos, cuánto deben sus propietarios y cuáles siguen en proceso.
- **Control de costos por tarea:** cada intervención registra su costo de forma independiente, facilitando la generación de resúmenes claros para el cliente.
- **Gestión de usuarios con roles:** separa responsabilidades entre administradores y mecánicos, protegiendo funciones sensibles sin complicar el flujo operativo.
- **Reducción de errores y pérdida de información:** al centralizar datos en una sola plataforma, se evitan olvidos, papeles extraviados o comunicaciones verbales sin registro.

### **1.2. Características y funcionalidades principales:**

### 1. Autenticación y Gestión de Usuarios

El sistema requiere inicio de sesión para todos los usuarios. Existen dos roles:

- **Administrador:** acceso total al sistema. Puede crear nuevas cuentas de usuario, desactivar cuentas existentes y acceder a todas las vistas del sistema.
- **Mecánico:** acceso operativo. Puede registrar clientes, vehículos, gestionar órdenes de trabajo y tareas.

El administrador es el único capaz de gestionar el ciclo de vida de las cuentas de usuario (alta y baja). Las contraseñas se gestionan de forma segura; las cuentas dadas de baja no pueden iniciar sesión pero sus datos históricos se conservan.

---

### 2. Registro de Clientes y Vehículos

Tanto el administrador como el mecánico pueden registrar:

**Clientes:**
- Nombre completo
- Información de contacto (teléfono, correo electrónico)
- Identificación

**Vehículos:**
- Placa (identificador único)
- Marca, modelo y año
- Color
- Propietario asociado (cliente registrado)
- Historial de visitas previas

Un cliente puede tener uno o más vehículos registrados. El sistema permite buscar clientes y vehículos existentes antes de crear registros duplicados.

---

### 3. Ingreso de Vehículo y Orden de Trabajo

Cuando un vehículo ingresa al taller, se crea una **Orden de Trabajo (OT)**, que agrupa todas las actividades de esa visita. Al momento del ingreso se registra:

- Fecha y hora de ingreso
- Motivo de ingreso (descripción inicial del problema reportado por el cliente)
- Kilometraje actual
- Mecánico asignado (opcional)

La OT es el contenedor principal que vincula el vehículo, las tareas, los diagnósticos y los costos de esa visita específica.

---

### 4. Lista de Tareas Dinámica

Dentro de cada Orden de Trabajo se maneja una **lista de tareas** que representa el trabajo a realizar. Esta lista es dinámica:

- Al crear la OT se registra al menos una tarea inicial (por ejemplo: *"Revisión de suspensión por ruido"*).
- Durante la ejecución, cualquier mecánico puede **agregar nuevas tareas** conforme el diagnóstico avanza (por ejemplo: *"Cambio de amortiguador delantero izquierdo"*, *"Ajuste de tornillería"*).
- Cada tarea tiene un estado: **pendiente**, **en progreso** o **completada**.
- Al **completar una tarea**, se registra el costo asociado a esa tarea (mano de obra, repuestos u otros conceptos).

Esta lógica refleja el flujo real del trabajo mecánico, donde el alcance de la intervención frecuentemente se amplía una vez iniciada la inspección.

---

### 5. Registro de Diagnósticos y Reparaciones

Dentro de cada tarea o como elemento independiente de la OT, se puede registrar:

- **Diagnóstico:** descripción técnica del problema identificado.
- **Reparación o mantenimiento realizado:** detalle del trabajo ejecutado.
- **Repuestos utilizados** (descripción libre o catálogo básico).
- **Observaciones adicionales** para el historial del vehículo.

Esta información queda asociada al historial permanente del vehículo, permitiendo consultarla en visitas futuras.

---

### 6. Panel de Vehículos Listos para Entrega

Cuando **todas las tareas** de una Orden de Trabajo están marcadas como completadas, la OT pasa al estado **"Lista para entrega"**. El administrador tiene acceso a una vista dedicada que muestra todos los vehículos en ese estado, con las siguientes columnas:

| Placa | Modelo | Propietario | Monto Total |
|-------|--------|-------------|-------------|
| ABC123 | Toyota Corolla 2018 | Juan Pérez | ₡85,000 |

Al seleccionar un vehículo de esta lista, el administrador puede ver el **detalle de la OT**:

- Lista de todas las tareas realizadas
- Costo individual por tarea
- Total a cobrar al cliente
- Fecha de ingreso y tiempo transcurrido

Esta vista está diseñada para facilitar el proceso de contacto con el propietario y la facturación posterior.

---

### 7. Historial de Vehículos y Clientes

El sistema mantiene un historial completo y consultable de:

- Todas las visitas de un vehículo al taller (ordenadas por fecha)
- Trabajos realizados en cada visita
- Montos cobrados por visita
- Datos del propietario al momento de cada visita

---

## Alcance del Sistema (Versión Inicial)

Esta documentación cubre el alcance de la primera versión funcional (MVP) del sistema. Las funcionalidades listadas a continuación quedan fuera del alcance inicial y se clasifican en dos categorías: **funcionalidades deseables** con alta prioridad para versiones tempranas, y **funcionalidades de largo plazo** para evoluciones posteriores del producto.

---

### Funcionalidades Deseables (Alta Prioridad para V2)

Estas funcionalidades han sido identificadas como extensiones naturales del MVP con impacto directo en la operación del taller. Deben considerarse en el diseño de la arquitectura y el modelo de datos desde la versión inicial para evitar cambios estructurales al implementarlas.

#### D1. Registro de Contacto al Propietario

En el panel de vehículos listos para entrega, el administrador podrá marcar explícitamente que ya se realizó el contacto con el propietario. Al ejecutar esta acción, el sistema deberá:

- Registrar la **fecha y hora exacta** del contacto.
- Registrar el **usuario** que realizó el contacto.
- Actualizar el estado de la OT a **"Propietario contactado"**, diferenciándolo del estado previo de *"Lista para entrega"*.
- Mantener el registro en la vista del panel hasta que el vehículo sea retirado, permitiendo al administrador distinguir entre vehículos pendientes de contactar y vehículos ya contactados.

Esta funcionalidad aporta trazabilidad sobre el proceso post-reparación y evita contactos duplicados o confusiones entre turnos de trabajo.

#### D2. Notificación por Correo Electrónico al Propietario

Como extensión directa de D1, en el momento en que el administrador registre el contacto, el sistema enviará automáticamente un correo electrónico al cliente con un resumen de la orden de trabajo. El correo incluirá:

- Saludo personalizado con el nombre del propietario.
- Datos del vehículo (placa, marca, modelo).
- Listado de tareas realizadas con el costo individual de cada una.
- Monto total a cancelar.
- Mensaje de invitación a retirar el vehículo.

El correo se enviará con **copia (CC) al correo del administrador del taller**, garantizando que quede registro de la comunicación en la bandeja del responsable. El correo del cliente se tomará del perfil registrado en el sistema; si el cliente no tiene correo registrado, el sistema deberá advertir al administrador antes de intentar el envío.

> **Consideración técnica:** esta funcionalidad requiere integración con un servicio de envío de correo transaccional (por ejemplo, SendGrid, Mailgun o AWS SES). El diseño de la arquitectura debe contemplar esta dependencia externa desde etapas tempranas.

#### D3. Transferencia de Propietario de Vehículo

Cuando un vehículo previamente registrado en el sistema cambie de dueño, el administrador o el mecánico podrán actualizar el propietario asociado al vehículo. Esta operación deberá:

- Permitir **seleccionar un cliente existente** en el sistema o **registrar uno nuevo** como nuevo propietario.
- Registrar la **fecha del cambio de propietario** como parte del historial del vehículo.
- **Preservar íntegro el historial de visitas anteriores**, asociadas al propietario original en el momento en que ocurrieron, garantizando la integridad del registro técnico del vehículo.
- Reflejar el nuevo propietario en todas las vistas y órdenes de trabajo **creadas a partir de la fecha del cambio**.

> **Consideración de modelo de datos:** la relación entre vehículo y propietario debe modelarse con soporte para historicidad (fecha de inicio y fecha de fin de la asociación), no como un vínculo simple de uno a uno. Esto es relevante para el diseño del modelo de datos desde la V1.

#### D4. Panel de Recordatorios de Mantenimiento Preventivo

El sistema identificará automáticamente los vehículos que llevan **más de 6 meses sin registrar una visita al taller** y los presentará al administrador en una vista dedicada de recordatorios. El objetivo es facilitar una campaña de reactivación proactiva hacia clientes inactivos, invitándolos a agendar su próxima cita de mantenimiento.

**Criterio de inclusión en la lista:**

- El vehículo tiene al menos una Orden de Trabajo cerrada en el sistema (es decir, es un cliente conocido del taller).
- Han transcurrido más de 180 días desde la fecha de cierre de su última OT.
- El vehículo no ha sido marcado como *"No volver a recordar"*.

**Vista del panel de recordatorios:**

La lista mostrará, por cada vehículo elegible, las siguientes columnas:

| Placa | Modelo | Propietario | Correo del propietario | Última visita | Días sin visita |
|-------|--------|-------------|------------------------|---------------|-----------------|
| ABC123 | Toyota Corolla 2018 | Juan Pérez | juan@email.com | 15/oct/2024 | 217 |

El administrador podrá **seleccionar uno o varios vehículos** de la lista mediante casillas de verificación, o seleccionarlos todos con un control global, para luego ejecutar el envío de correos de forma masiva o individual.

**Envío de correo de recordatorio:**

Al confirmar el envío, el sistema generará y despachará un correo a cada propietario seleccionado. El correo incluirá:

- Saludo personalizado con el nombre del propietario.
- Mención del vehículo (placa, marca, modelo).
- Mensaje amigable indicando que ha pasado un tiempo desde su última visita y que el taller lo invita a agendar su próximo mantenimiento.
- Información de contacto del taller para coordinar la cita.

El correo se enviará con **copia (CC) al administrador del taller**. El sistema advertirá si alguno de los propietarios seleccionados no tiene correo electrónico registrado, excluyéndolos del envío con una notificación explícita al administrador.

El sistema registrará la **fecha y hora del último recordatorio enviado** para cada vehículo, dato visible en el panel para que el administrador sepa si ya se intentó contactar previamente.

**Exclusión permanente de vehículos ("No volver a recordar"):**

El administrador podrá marcar individualmente cualquier vehículo con la opción *"No volver a recordar"*. A partir de ese momento, el vehículo dejará de aparecer en el panel de forma permanente, independientemente del tiempo transcurrido desde su última visita. Esta acción es reversible: el administrador podrá consultar y reactivar vehículos excluidos desde una sección de gestión de exclusiones.

> **Consideración técnica:** el cálculo de vehículos elegibles puede resolverse mediante una consulta programada (job o cron) que actualice la lista periódicamente, o como una consulta en tiempo real al cargar la vista. Se recomienda evaluar el volumen esperado de registros para elegir el enfoque más adecuado. Esta funcionalidad comparte la dependencia de servicio de correo transaccional descrita en D2.

> **Consideración de modelo de datos:** se requiere soporte para registrar el estado de exclusión por vehículo (`no_recordar`, `fecha_exclusion`, `excluido_por`) y el historial de recordatorios enviados (fecha, usuario que ejecutó el envío, vehículos incluidos). Ambos elementos deben contemplarse al diseñar el modelo de datos desde la V1.

---

### Funcionalidades de Largo Plazo

- **Módulo de inventario de repuestos:** control de stock, entradas, salidas y alertas de reabastecimiento.
- **Facturación electrónica:** generación de comprobantes fiscales según normativa local.
- **App móvil nativa:** versión optimizada para dispositivos móviles orientada al mecánico en piso.
- **Reportes y estadísticas avanzadas:** tiempo promedio por tipo de reparación, ingresos por período, rendimiento por mecánico, vehículos más frecuentes, entre otros.
- **Integración con proveedores de repuestos:** consulta de disponibilidad y precios desde el sistema.


### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**

#### Requisitos

- Node.js 20+
- Docker Desktop (PostgreSQL)
- npm

#### Base de datos

Desde la raíz del repositorio:

```bash
docker compose up -d
```

PostgreSQL queda disponible en `localhost:5434` (usuario/contraseña/BD: `mecatrack`).

#### API (backend)

```bash
cd apps/api
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

La API escucha en `http://localhost:4000/api`.

Usuarios de prueba (semilla): `admin@taller.com` / `AdminPass123`, `mechanic@taller.com` / `MechanicPass123`.

#### Frontend

> Pendiente de implementación (US-001 frontend). Se documentará en `apps/web` cuando exista.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

MecaTrack sigue un patrón de **monolito modular en tres capas** (presentación, aplicación y datos). El frontend consume una API REST; la lógica de negocio y la autorización residen en el backend; PostgreSQL es la fuente de verdad. Las integraciones futuras (correo transaccional, recordatorios programados) se conectan mediante adaptadores sin fragmentar el núcleo en microservicios.

```mermaid
flowchart TB
    subgraph client [Cliente]
        Browser[Navegador - SPA]
    end

    subgraph app [Aplicación]
        FE[Frontend - Next.js + TypeScript]
        API[API REST - NestJS]
        Auth[Auth JWT + RBAC]
        Domain[Módulos de dominio]
        Jobs[Worker / cron - V2]
    end

    subgraph data [Datos y servicios externos]
        PG[(PostgreSQL)]
        Mail[Proveedor de correo - V2]
    end

    Browser --> FE
    FE -->|HTTPS / JSON| API
    API --> Auth
    API --> Domain
    Domain --> PG
    Jobs --> PG
    Jobs --> Mail
    API -.->|encolar eventos| Jobs
```

**Justificación de la elección**

| Criterio del proyecto | Decisión arquitectónica |
|----------------------|-------------------------|
| Flujo E2E con estados (OT, tareas) | Reglas de dominio en backend, no solo en UI |
| Roles administrador / mecánico | RBAC en API + rutas protegidas en frontend |
| Historial e integridad de datos | Base relacional con transacciones ACID |
| Extensiones V2 (email, recordatorios, propietario histórico) | Puertos/adaptadores sin reescribir el núcleo |
| MVP académico y operación en un solo taller | Un despliegue, un repositorio, complejidad operativa baja |

**Beneficios principales**

- **Simplicidad operativa:** un solo backend y una base de datos facilitan desarrollo local, pruebas y despliegue.
- **Consistencia transaccional:** crear OT, agregar tareas y registrar costos pueden ejecutarse en la misma unidad de trabajo.
- **Evolución ordenada:** los módulos del monolito (auth, work-orders, notifications) permiten añadir D1–D4 sin cambiar el patrón general.
- **Alineación con el dominio:** el modelo relacional encaja con clientes, vehículos, órdenes de trabajo, tareas e historicidad de propietario.

**Sacrificios y déficits**

- **Escalado horizontal limitado al inicio:** un único proceso API es suficiente para el MVP; picos masivos de envío de correos podrían requerir cola y worker dedicado (previsto en V2).
- **Sin tiempo real:** el panel de entrega no depende de WebSockets; basta refresco manual o polling.
- **Sin multi-tenant:** la arquitectura asume un taller por despliegue; varios talleres independientes implicarían otra iteración (tenant por instancia o por esquema).

Microservicios no se consideran adecuados en esta fase: el volumen, el equipo y el alcance del MVP no justifican la sobrecarga de red, despliegue y consistencia distribuida.

---

### **2.2. Descripción de componentes principales:**

#### Frontend (capa de presentación)

| Aspecto | Detalle |
|---------|---------|
| **Tecnología** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, React Query |
| **Responsabilidad** | Interfaz para empleados del taller: login, dashboards por rol, CRUD de clientes y vehículos, gestión de OT y tareas, panel de entrega (solo admin), consulta de historial |
| **Organización** | Carpetas por **feature** (`auth`, `users`, `clients`, `vehicles`, `work-orders`, `delivery-panel`, `history`) |
| **Estado** | El servidor es la fuente de verdad; estado local solo en formularios y UI transitoria |
| **Seguridad UI** | Guards de ruta por rol; la autorización definitiva la valida el backend |

#### Backend (capa de aplicación)

| Aspecto | Detalle |
|---------|---------|
| **Tecnología** | NestJS, Prisma ORM, class-validator |
| **Responsabilidad** | API REST, autenticación, autorización RBAC, reglas de negocio y persistencia |
| **Capas internas** | Controllers (HTTP/DTO) → Application / use cases → Domain (entidades, estados) → Infrastructure (Prisma, bcrypt, adaptadores de correo) |
| **Módulos de dominio** | Alineados a las historias de usuario (ver tabla siguiente) |

| Módulo | Historias de usuario | Alcance |
|--------|---------------------|---------|
| `auth` | US-001 | Login, logout, sesión, validación de cuenta activa |
| `users` | US-002 | Alta y baja de usuarios (solo administrador) |
| `clients` | US-003 | Registro y búsqueda de clientes |
| `vehicles` | US-004 | Registro de vehículos y asociación a cliente |
| `work-orders` | US-005, US-006 | OT, tareas dinámicas, estados y costos |
| `task-notes` | US-007 | Diagnósticos, reparaciones y observaciones |
| `delivery` | US-008 | Panel de vehículos listos para entrega |
| `history` | US-009 | Historial de vehículos y clientes |
| `notifications` | D1, D2 (V2) | Contacto al propietario y envío de correo (interfaz desde V1) |
| `reminders` | D4 (V2) | Panel de recordatorios y job programado |

**Reglas de negocio críticas (backend)**

- Una sola OT activa por vehículo a la vez.
- Al completar una tarea, el costo (≥ 0) es obligatorio.
- Cuando todas las tareas están completadas, la OT pasa automáticamente a **Lista para entrega**.
- No se agregan tareas a OT en estado `lista_para_entrega` o `entregada`.
- El panel de entrega y la gestión de usuarios son exclusivos del rol **Administrador**.

#### Base de datos

| Aspecto | Detalle |
|---------|---------|
| **Tecnología** | PostgreSQL |
| **Acceso** | Prisma (migraciones versionadas, semillas para entorno local) |
| **Modelo** | Relacional: usuarios, clientes, vehículos, historicidad de propietario (`vehicle_ownership`), órdenes de trabajo, tareas y registros técnicos; tablas preparadas para exclusiones y recordatorios (V2) |

#### Autenticación y autorización

| Aspecto | Detalle |
|---------|---------|
| **Mecanismo** | JWT de acceso de corta duración + refresh token en cookie `httpOnly` |
| **Contraseñas** | Hash con bcrypt o Argon2 |
| **Roles** | `ADMIN`, `MECHANIC` — aplicados mediante guards en cada endpoint |
| **Cuentas inactivas** | Rechazo en login; datos históricos conservados |

#### Integraciones externas (V2, diseño desde V1)

- **`EmailPort`:** abstracción para SendGrid, Mailgun o AWS SES; implementación concreta en V2.
- **`ReminderJob`:** tarea programada (cron o worker en Docker) para calcular vehículos sin visita > 180 días; en MVP puede resolverse con consulta al cargar la vista si el volumen es bajo.

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El repositorio sigue un **monorepo** con aplicaciones separadas para API y web, más configuración compartida de contenedores. El patrón es **feature folders** en el frontend y **módulos verticales** en el backend (cada módulo agrupa controller, service y acceso a datos de su dominio).

```
mecatrack/
├── apps/
│   ├── api/                          # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── clients/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── work-orders/
│   │   │   │   ├── task-notes/
│   │   │   │   ├── delivery/
│   │   │   │   ├── history/
│   │   │   │   ├── notifications/  # stub / interfaz para V2
│   │   │   │   └── reminders/        # stub / interfaz para V2
│   │   │   ├── common/               # guards, filters, pipes compartidos
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── test/
│   └── web/                          # Frontend Next.js
│       ├── src/
│       │   ├── app/                  # rutas App Router
│       │   ├── features/             # auth, users, clients, vehicles, ...
│       │   └── shared/               # cliente API, contexto auth, componentes UI
│       └── public/
├── packages/
│   └── shared-types/                 # opcional: DTOs y tipos compartidos
├── docker-compose.yml                # PostgreSQL + api + web en desarrollo
├── .env.example
├── readme.md
└── prompts.md
```

| Ruta | Propósito |
|------|-----------|
| `apps/api/src/modules/` | Lógica de negocio por dominio; cada carpeta es un módulo NestJS autocontenido |
| `apps/api/prisma/` | Esquema de base de datos, migraciones y datos semilla |
| `apps/web/src/features/` | Pantallas y flujos de usuario agrupados por funcionalidad |
| `apps/web/src/shared/` | Utilidades transversales (cliente HTTP, layout, componentes reutilizables) |
| `packages/shared-types/` | Contratos TypeScript compartidos entre API y web (opcional) |
| `docker-compose.yml` | Orquestación local: base de datos, API y frontend con un solo comando |

Esta estructura facilita que cada historia de usuario se implemente de forma incremental en el módulo correspondiente, manteniendo fronteras claras entre capas sin la complejidad de múltiples repositorios o servicios desplegados por separado en la fase MVP.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

El modelo relacional de MecaTrack está diseñado en PostgreSQL y gestionado con Prisma. Consolida las entidades definidas en las historias de usuario US-001 a US-009, con campos adicionales preparados para extensiones V2 (D1–D4) sin cambios estructurales.

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK "NOT NULL"
        string passwordHash "NOT NULL"
        string fullName "NOT NULL"
        enum role "ADMIN | MECHANIC, NOT NULL"
        boolean active "NOT NULL, DEFAULT true"
        string refreshTokenHash "NULL"
        datetime refreshTokenExpiresAt "NULL"
        datetime createdAt "NOT NULL"
        datetime updatedAt "NOT NULL"
    }

    Client {
        uuid id PK
        string fullName "NOT NULL"
        string nationalId UK "NOT NULL"
        string phone "NULL"
        string email "NULL"
        datetime createdAt "NOT NULL"
        datetime updatedAt "NOT NULL"
    }

    Vehicle {
        uuid id PK
        string licensePlate UK "NOT NULL"
        string brand "NOT NULL"
        string model "NOT NULL"
        int year "NOT NULL"
        string color "NULL"
        boolean excludeFromReminders "DEFAULT false"
        datetime excludedAt "NULL, V2 D4"
        uuid excludedById FK "NULL, V2 D4"
        datetime lastReminderSentAt "NULL, V2 D4"
        datetime createdAt "NOT NULL"
        datetime updatedAt "NOT NULL"
    }

    VehicleOwnership {
        uuid id PK
        uuid vehicleId FK "NOT NULL"
        uuid clientId FK "NOT NULL"
        datetime validFrom "NOT NULL, DEFAULT now"
        datetime validTo "NULL = propietario actual"
    }

    WorkOrder {
        uuid id PK
        uuid vehicleId FK "NOT NULL"
        uuid ownerClientId FK "NOT NULL, snapshot al ingreso"
        enum status "NOT NULL, DEFAULT EN_PROCESO"
        string entryReason "NOT NULL"
        int mileage "NOT NULL"
        uuid assignedMechanicId FK "NULL"
        uuid createdById FK "NOT NULL"
        datetime checkedInAt "NOT NULL, DEFAULT now"
        datetime deliveredAt "NULL"
        datetime ownerContactedAt "NULL, V2 D1"
        uuid ownerContactedById FK "NULL, V2 D1"
        string visitDiagnosis "NULL"
        string visitRepairSummary "NULL"
        string visitPartsUsed "NULL"
        string visitAdditionalNotes "NULL"
        datetime createdAt "NOT NULL"
        datetime updatedAt "NOT NULL"
    }

    WorkOrderTask {
        uuid id PK
        uuid workOrderId FK "NOT NULL"
        string description "NOT NULL"
        enum status "NOT NULL, DEFAULT PENDING"
        decimal cost "NULL, obligatorio si COMPLETED"
        string costNotes "NULL"
        string diagnosis "NULL"
        string repairPerformed "NULL"
        string partsUsed "NULL"
        string additionalNotes "NULL"
        int sortOrder "DEFAULT 0"
        datetime completedAt "NULL"
        datetime createdAt "NOT NULL"
        datetime updatedAt "NOT NULL"
    }

    User ||--o{ WorkOrder : "creates (createdById)"
    User ||--o{ WorkOrder : "assigned (assignedMechanicId)"
    User ||--o{ WorkOrder : "contacted owner (ownerContactedById, V2)"
    User ||--o{ Vehicle : "excluded reminders (excludedById, V2)"

    Client ||--o{ VehicleOwnership : "owns"
    Vehicle ||--o{ VehicleOwnership : "owned by"

    Vehicle ||--o{ WorkOrder : "visits"

    Client ||--o{ WorkOrder : "owner snapshot (ownerClientId)"

    WorkOrder ||--|{ WorkOrderTask : "contains"
```

**Enums del dominio:**

| Enum | Valores | Uso |
|------|---------|-----|
| `UserRole` | `ADMIN`, `MECHANIC` | Rol del empleado del taller |
| `WorkOrderStatus` | `EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED`, `ENTREGADA` | Ciclo de vida de la OT (`OWNER_CONTACTED` reservado V2 D1) |
| `WorkOrderTaskStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED` | Avance de cada tarea |

**Reglas de negocio reflejadas en el modelo:**

- Una sola OT **activa** por vehículo (`EN_PROCESO` o `LISTA_PARA_ENTREGA`) — validada en aplicación.
- `WorkOrder.ownerClientId` es **snapshot** del propietario al ingreso; no se actualiza si el vehículo cambia de dueño (D3).
- `VehicleOwnership.validTo IS NULL` identifica el propietario actual del vehículo.
- `WorkOrderTask.cost` es obligatorio en aplicación cuando `status = COMPLETED`.

---

### **3.2. Descripción de entidades principales:**

#### `User` (US-001, US-002)

Empleado del taller con acceso al sistema.

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `email` | String | UNIQUE, NOT NULL | Credencial de login |
| `passwordHash` | String | NOT NULL | Hash bcrypt/Argon2; nunca expuesto en API |
| `fullName` | String | NOT NULL | Nombre del empleado |
| `role` | UserRole | NOT NULL | `ADMIN` o `MECHANIC` |
| `active` | Boolean | NOT NULL, DEFAULT `true` | `false` impide login; conserva historial |
| `refreshTokenHash` | String | NULL | Hash del refresh token vigente |
| `refreshTokenExpiresAt` | DateTime | NULL | Expiración del refresh token |
| `createdAt` | DateTime | NOT NULL | Alta del registro |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Relaciones:** crea OT (`createdById`), puede ser mecánico asignado (`assignedMechanicId`), contacta propietario en V2 (`ownerContactedById`), excluye vehículo de recordatorios en V2 (`excludedById`).

---

#### `Client` (US-003)

Propietario de vehículos atendidos en el taller.

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `fullName` | String | NOT NULL | Nombre completo |
| `nationalId` | String | UNIQUE, NOT NULL | Cédula u otra identificación |
| `phone` | String | NULL | Teléfono de contacto |
| `email` | String | NULL | Correo (notificaciones V2) |
| `createdAt` | DateTime | NOT NULL | Registro en el sistema |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Relaciones:** uno a muchos con `VehicleOwnership`; uno a muchos con `WorkOrder` vía snapshot `ownerClientId`.

---

#### `Vehicle` (US-004)

Vehículo identificado por placa normalizada (mayúsculas, sin espacios).

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `licensePlate` | String | UNIQUE, NOT NULL | Placa del vehículo |
| `brand` | String | NOT NULL | Marca |
| `model` | String | NOT NULL | Modelo |
| `year` | Int | NOT NULL | Año |
| `color` | String | NULL | Color |
| `excludeFromReminders` | Boolean | DEFAULT `false` | Exclusión del panel de recordatorios (D4) |
| `excludedAt` | DateTime | NULL | Fecha de exclusión (V2 D4) |
| `excludedById` | UUID | FK → User, NULL | Admin que excluyó (V2 D4) |
| `lastReminderSentAt` | DateTime | NULL | Último recordatorio enviado (V2 D4) |
| `createdAt` | DateTime | NOT NULL | Registro en el sistema |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Relaciones:** uno a muchos con `VehicleOwnership` y `WorkOrder`.

---

#### `VehicleOwnership` (US-004, D3)

Historicidad de la relación vehículo–propietario. Soporta transferencia de dueño en V2 sin perder historial de visitas.

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `vehicleId` | UUID | FK → Vehicle, NOT NULL | Vehículo |
| `clientId` | UUID | FK → Client, NOT NULL | Propietario en el período |
| `validFrom` | DateTime | NOT NULL | Inicio de la asociación |
| `validTo` | DateTime | NULL | Fin de la asociación; `NULL` = propietario actual |

**Índices:** `(vehicleId, validTo)`, `clientId`.

**Regla:** solo un registro con `validTo IS NULL` por vehículo.

---

#### `WorkOrder` (US-005, US-008, US-009)

Orden de trabajo: una visita del vehículo al taller.

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `vehicleId` | UUID | FK → Vehicle, NOT NULL | Vehículo atendido |
| `ownerClientId` | UUID | FK → Client, NOT NULL | Propietario al momento del ingreso (snapshot) |
| `status` | WorkOrderStatus | NOT NULL, DEFAULT `EN_PROCESO` | Estado del ciclo de la visita |
| `entryReason` | String | NOT NULL | Motivo de ingreso |
| `mileage` | Int | NOT NULL | Kilometraje al ingreso |
| `assignedMechanicId` | UUID | FK → User, NULL | Mecánico asignado (opcional) |
| `createdById` | UUID | FK → User, NOT NULL | Usuario que creó la OT |
| `checkedInAt` | DateTime | NOT NULL | Fecha/hora de ingreso |
| `deliveredAt` | DateTime | NULL | Fecha/hora de retiro (US-008) |
| `ownerContactedAt` | DateTime | NULL | Contacto al propietario (V2 D1) |
| `ownerContactedById` | UUID | FK → User, NULL | Quién registró el contacto (V2 D1) |
| `visitDiagnosis` | Text | NULL | Diagnóstico general de la visita (US-007) |
| `visitRepairSummary` | Text | NULL | Resumen de reparación de la visita |
| `visitPartsUsed` | Text | NULL | Repuestos a nivel visita |
| `visitAdditionalNotes` | Text | NULL | Observaciones generales de la visita |
| `createdAt` | DateTime | NOT NULL | Creación del registro |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Índices:** `(vehicleId, status)`, `checkedInAt`.

**Transiciones de `status`:** `EN_PROCESO` → `LISTA_PARA_ENTREGA` (todas las tareas completadas, US-006) → `OWNER_CONTACTED` (V2 D1) → `ENTREGADA` (US-008).

---

#### `WorkOrderTask` (US-005, US-006, US-007)

Tarea dinámica dentro de una orden de trabajo.

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| `id` | UUID | PK | Identificador único |
| `workOrderId` | UUID | FK → WorkOrder, NOT NULL, ON DELETE CASCADE | OT contenedora |
| `description` | String | NOT NULL | Trabajo a realizar |
| `status` | WorkOrderTaskStatus | NOT NULL, DEFAULT `PENDING` | Estado de la tarea |
| `cost` | Decimal(12,2) | NULL | Costo al cliente; obligatorio si `COMPLETED` |
| `costNotes` | String | NULL | Detalle del cobro (mano de obra, repuestos) |
| `diagnosis` | Text | NULL | Diagnóstico técnico (US-007) |
| `repairPerformed` | Text | NULL | Reparación o mantenimiento realizado |
| `partsUsed` | Text | NULL | Repuestos utilizados (texto libre) |
| `additionalNotes` | Text | NULL | Observaciones adicionales |
| `sortOrder` | Int | DEFAULT `0` | Orden de visualización |
| `completedAt` | DateTime | NULL | Momento de completado |
| `createdAt` | DateTime | NOT NULL | Creación de la tarea |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Índice:** `workOrderId`.

**Cálculo derivado:** `totalAmount` de la OT = suma de `cost` de tareas con `status = COMPLETED`.

---

#### Entidad prevista V2 — `ReminderSendLog` (D4, no MVP)

Tabla opcional para historial de envíos masivos de recordatorios de mantenimiento.

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `id` | UUID | PK |
| `sentAt` | DateTime | Fecha/hora del envío |
| `sentById` | UUID | FK → User (administrador) |
| `vehicleIds` | JSON / tabla puente | Vehículos incluidos en el envío |

No se implementa en el MVP; se documenta para evitar refactor al añadir D4.

---

#### Esquema Prisma de referencia (MVP)

```prisma
enum UserRole {
  ADMIN
  MECHANIC
}

enum WorkOrderStatus {
  EN_PROCESO
  LISTA_PARA_ENTREGA
  OWNER_CONTACTED
  ENTREGADA
}

enum WorkOrderTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String
  fullName              String
  role                  UserRole
  active                Boolean   @default(true)
  refreshTokenHash      String?
  refreshTokenExpiresAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  workOrdersCreated     WorkOrder[] @relation("CreatedBy")
  workOrdersAssigned    WorkOrder[] @relation("AssignedMechanic")
  workOrdersContacted   WorkOrder[] @relation("OwnerContactedBy")
  vehiclesExcluded      Vehicle[]   @relation("ExcludedBy")
}

model Client {
  id         String   @id @default(uuid())
  fullName   String
  nationalId String   @unique
  phone      String?
  email      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  ownerships  VehicleOwnership[]
  workOrders  WorkOrder[]
}

model Vehicle {
  id                   String    @id @default(uuid())
  licensePlate         String    @unique
  brand                String
  model                String
  year                 Int
  color                String?
  excludeFromReminders Boolean   @default(false)
  excludedAt           DateTime?
  excludedById         String?
  lastReminderSentAt   DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  excludedBy   User?              @relation("ExcludedBy", fields: [excludedById], references: [id])
  ownerships   VehicleOwnership[]
  workOrders   WorkOrder[]
}

model VehicleOwnership {
  id        String    @id @default(uuid())
  vehicleId String
  clientId  String
  validFrom DateTime  @default(now())
  validTo   DateTime?

  vehicle Vehicle @relation(fields: [vehicleId], references: [id])
  client  Client  @relation(fields: [clientId], references: [id])

  @@index([vehicleId, validTo])
  @@index([clientId])
}

model WorkOrder {
  id                   String          @id @default(uuid())
  vehicleId            String
  ownerClientId        String
  status               WorkOrderStatus @default(EN_PROCESO)
  entryReason          String
  mileage              Int
  assignedMechanicId   String?
  createdById          String
  checkedInAt          DateTime        @default(now())
  deliveredAt          DateTime?
  ownerContactedAt     DateTime?
  ownerContactedById   String?
  visitDiagnosis       String?         @db.Text
  visitRepairSummary   String?         @db.Text
  visitPartsUsed       String?         @db.Text
  visitAdditionalNotes String?         @db.Text
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  vehicle          Vehicle         @relation(fields: [vehicleId], references: [id])
  ownerClient      Client          @relation(fields: [ownerClientId], references: [id])
  assignedMechanic User?           @relation("AssignedMechanic", fields: [assignedMechanicId], references: [id])
  createdBy        User            @relation("CreatedBy", fields: [createdById], references: [id])
  ownerContactedBy User?           @relation("OwnerContactedBy", fields: [ownerContactedById], references: [id])
  tasks            WorkOrderTask[]

  @@index([vehicleId, status])
  @@index([checkedInAt])
}

model WorkOrderTask {
  id               String              @id @default(uuid())
  workOrderId      String
  description      String
  status           WorkOrderTaskStatus @default(PENDING)
  cost             Decimal?            @db.Decimal(12, 2)
  costNotes        String?
  diagnosis        String?             @db.Text
  repairPerformed  String?             @db.Text
  partsUsed        String?             @db.Text
  additionalNotes  String?             @db.Text
  sortOrder        Int                 @default(0)
  completedAt      DateTime?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  workOrder WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([workOrderId])
}
```

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

---

### US-001 — Inicio de sesión

**Como** empleado del taller (administrador o mecánico),
**quiero** iniciar sesión con mis credenciales,
**para** acceder al sistema según mi rol y tener acceso solo a las funciones que me corresponden.

**Criterios de Aceptación:**
- El sistema muestra un formulario de login con campos: correo electrónico y contraseña.
- Si las credenciales son válidas, el usuario es redirigido al dashboard correspondiente a su rol.
- Si las credenciales son inválidas, se muestra un mensaje de error genérico (sin indicar cuál campo falló).
- Un usuario con cuenta desactivada no puede iniciar sesión; se muestra mensaje indicando que la cuenta está inactiva.
- La sesión se mantiene activa mientras el usuario no cierre sesión manualmente.
- Existe un botón/opción para cerrar sesión desde cualquier pantalla.

**Roles:** Administrador, Mecánico | **Prioridad:** Alta

---

### US-002 — Gestión de Usuarios

**Como** administrador del taller,
**quiero** crear y desactivar cuentas de usuario,
**para** controlar quién tiene acceso al sistema y con qué rol.

**Criterios de Aceptación:**
- El administrador puede crear un nuevo usuario con: nombre completo, correo electrónico, contraseña temporal y rol (administrador / mecánico).
- El sistema valida que el correo no esté ya registrado antes de crear la cuenta.
- El administrador puede desactivar una cuenta existente; el usuario desactivado deja de poder iniciar sesión de forma inmediata.
- Los datos históricos del usuario desactivado (órdenes de trabajo asignadas, tareas completadas) se conservan intactos.
- El administrador puede consultar el listado de todos los usuarios (activos e inactivos) con su nombre, rol y estado.
- Un mecánico no puede acceder a la gestión de usuarios.

**Roles:** Administrador | **Prioridad:** Alta

---

### US-003 — Registro de Clientes

**Como** mecánico o administrador,
**quiero** registrar un nuevo cliente en el sistema,
**para** asociarlo a sus vehículos y órdenes de trabajo.

**Criterios de Aceptación:**
- El formulario incluye: nombre completo, identificación, teléfono y correo electrónico.
- Los campos nombre completo e identificación son obligatorios; teléfono y correo son opcionales.
- El sistema verifica que la identificación no esté ya registrada; si existe, muestra el cliente encontrado en lugar de duplicar.
- El sistema permite buscar clientes existentes por nombre, identificación o teléfono antes de crear uno nuevo.
- Al guardar, el cliente queda disponible de inmediato para asociarlo a un vehículo.

**Roles:** Administrador, Mecánico | **Prioridad:** Alta

---

### US-004 — Registro de Vehículos

**Como** mecánico o administrador,
**quiero** registrar un vehículo y asociarlo a un cliente,
**para** poder crear órdenes de trabajo y mantener el historial de visitas del vehículo.

**Criterios de Aceptación:**
- El formulario incluye: placa, marca, modelo, año y color.
- La placa es el identificador único; el sistema valida que no esté ya registrada.
- El vehículo debe estar asociado a un cliente registrado (campo obligatorio).
- El sistema permite buscar un cliente existente para asociarlo sin abandonar el flujo.
- Al guardar, el vehículo queda disponible para crear una nueva Orden de Trabajo.
- Desde la ficha del vehículo se puede consultar el historial de visitas previas.

**Roles:** Administrador, Mecánico | **Prioridad:** Alta

---

### US-005 — Crear Orden de Trabajo

**Como** mecánico o administrador,
**quiero** crear una Orden de Trabajo al ingresar un vehículo al taller,
**para** registrar formalmente la visita y comenzar a gestionar las tareas de esa atención.

**Criterios de Aceptación:**
- El usuario puede buscar el vehículo por placa antes de crear la OT; si no existe, puede registrarlo en el mismo flujo.
- Al crear la OT se registra automáticamente la fecha y hora de ingreso.
- El formulario incluye: motivo de ingreso, kilometraje actual y mecánico asignado (opcional).
- Se debe registrar al menos una tarea inicial en el momento de crear la OT.
- La OT creada tiene el estado inicial **"En proceso"**.
- No se puede crear más de una OT activa para el mismo vehículo simultáneamente.

**Roles:** Administrador, Mecánico | **Prioridad:** Alta

---

### US-006 — Gestión de Tareas en la Orden de Trabajo

**Como** mecánico o administrador,
**quiero** agregar, actualizar y completar tareas dentro de una Orden de Trabajo,
**para** reflejar el avance real del trabajo mecánico y registrar los costos de cada intervención.

**Criterios de Aceptación:**
- Desde una OT activa, cualquier mecánico puede agregar nuevas tareas en cualquier momento.
- Cada tarea incluye: descripción y estado inicial **"pendiente"**.
- El usuario puede cambiar el estado de una tarea: `pendiente` → `en progreso` → `completada`.
- Al marcar una tarea como **completada**, el sistema solicita obligatoriamente el costo asociado (≥ 0).
- El listado de tareas muestra: descripción, estado y costo (si fue completada).
- Cuando **todas** las tareas están en estado `completada`, el sistema cambia automáticamente el estado de la OT a **"Lista para entrega"**.
- No se pueden agregar tareas a una OT en estado `lista_para_entrega` o `entregada`.

**Roles:** Administrador, Mecánico | **Prioridad:** Alta

---

### US-007 — Registro de Diagnósticos y Reparaciones

**Como** mecánico o administrador,
**quiero** registrar el diagnóstico y el trabajo realizado dentro de una tarea u Orden de Trabajo,
**para** mantener un historial técnico detallado del vehículo consultable en visitas futuras.

**Criterios de Aceptación:**
- Desde una tarea se puede registrar: diagnóstico, reparación o mantenimiento realizado, repuestos utilizados (texto libre) y observaciones adicionales.
- Todos los campos de diagnóstico son opcionales; la tarea puede completarse sin llenarlos.
- La información queda asociada permanentemente al historial del vehículo.
- Desde el historial del vehículo se puede consultar el diagnóstico y reparación de cada visita anterior.
- Los campos de diagnóstico son editables mientras la tarea no esté en estado `completada`.

**Roles:** Administrador, Mecánico | **Prioridad:** Media

---

### US-008 — Panel de Vehículos Listos para Entrega

**Como** administrador del taller,
**quiero** ver un panel con todos los vehículos cuyas órdenes de trabajo están completadas,
**para** gestionar el proceso de contacto con el propietario y la facturación.

**Criterios de Aceptación:**
- El panel muestra únicamente OTs en estado **"Lista para entrega"**.
- Cada fila muestra: placa, marca y modelo del vehículo, nombre del propietario y monto total a cobrar.
- Al seleccionar un vehículo se despliega el detalle completo: lista de tareas, costo individual por tarea, total, fecha de ingreso y tiempo transcurrido.
- El administrador puede marcar la OT como **"Entregada"** una vez que el propietario retire el vehículo; esto la saca del panel.
- Un mecánico no tiene acceso a este panel.

**Roles:** Administrador | **Prioridad:** Alta

---

### US-009 — Historial de Vehículos y Clientes

**Como** mecánico o administrador,
**quiero** consultar el historial completo de visitas de un vehículo o cliente,
**para** tener contexto técnico antes de iniciar una nueva atención o responder consultas del propietario.

**Criterios de Aceptación:**
- Desde la ficha del vehículo se accede al historial de visitas, ordenadas de la más reciente a la más antigua.
- Cada visita muestra: fecha de ingreso, motivo, tareas realizadas, diagnósticos/reparaciones y monto cobrado.
- Desde la ficha del cliente se puede ver el listado de todos sus vehículos y acceder al historial de cada uno.
- El historial es de solo lectura; no permite editar OTs cerradas.
- La búsqueda de vehículo por placa o de cliente por nombre/identificación permite llegar al historial desde cualquier punto del sistema.

**Roles:** Administrador, Mecánico | **Prioridad:** Media

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1* https://github.com/LIDR-academy/AI4Devs-finalproject/pull/198*

**Pull Request 2**

**Pull Request 3**

