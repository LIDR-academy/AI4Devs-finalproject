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

Alejandro Sepúlveda.

### **0.2. Nombre del proyecto:**

**RoboDock AI**

### **0.3. Descripción breve del proyecto:**

RoboDock AI es una plataforma edge-first de automatización logística que simula una zona de descarga inteligente de camiones. El sistema identifica un camión mediante un código QR ubicado sobre la cabina, detecta cubos de colores dentro del pickup con una cámara cenital, calcula posiciones físicas de la carga y controla un brazo robótico Hiwonder MaxArm para mover los cubos hacia zonas de descarga. La operación queda registrada en PostgreSQL y puede visualizarse desde dashboards web operacionales, históricos y de trazabilidad.

### **0.4. URL del proyecto:**

Repositorio del proyecto en GitHub:

```text
https://github.com/afspage/AI4Devs-finalproject
```

> Este repositorio corresponde al fork personal del repositorio original del curso:
> `https://github.com/LIDR-academy/AI4Devs-finalproject`

### 0.5. URL o archivo comprimido del repositorio

Repositorio de entrega:

```text
https://github.com/afspage/AI4Devs-finalproject
```

> La entrega se realizará mediante una rama y Pull Request desde el fork personal hacia el repositorio original del curso.

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

El objetivo de RoboDock AI es demostrar un flujo E2E de automatización logística combinando software web, base de datos, visión computacional y robótica física.

El producto aporta valor porque permite:

- identificar automáticamente un camión mediante QR;
- detectar carga física por color;
- calcular posiciones de objetos dentro de una zona de carga;
- controlar un brazo robótico para ejecutar una descarga;
- registrar trazabilidad completa de la operación;
- visualizar estado y métricas en dashboards web.

El usuario principal es un operador o supervisor de una zona de descarga, muelle, laboratorio o centro logístico que necesita monitorear operaciones automatizadas y revisar histórico de descargas.

### **1.2. Características y funcionalidades principales:**

1. **Identificación de camión por QR**  
   El camión simulado incluye un QR en la cabina con códigos funcionales como `TRUCK-001`, `TRUCK-002` o `TRUCK-003`.

2. **Detección de carga por visión computacional**  
   Una cámara cenital detecta cubos físicos de colores rojo, azul, verde y amarillo. La detección usa OpenCV, rangos HSV, ROI, homografía y validación de tamaño.

3. **Calibración visual y robótica**  
   El sistema mantiene perfiles de calibración de cámara y robot. La calibración permite transformar coordenadas visuales del pickup a coordenadas del MaxArm.

4. **Control del brazo robótico MaxArm**  
   El Edge Service envía comandos seriales `POSE x y z suck` al MaxArm para ejecutar secuencias de pick & drop.

5. **Zonas y posiciones de descarga por color**  
   Cada color tiene una `DropZone`, y cada zona tiene varias `DropPosition`, evitando dejar múltiples cubos del mismo color en la misma coordenada.

6. **Registro de sesiones de descarga**  
   Cada descarga queda registrada como `UnloadSession`, asociada al camión, edge node, calibración de cámara, calibración robot, cubos detectados, acciones y eventos.

7. **Dashboard operacional**  
   Muestra cámara en vivo, camión detectado, conteo por color, estado de descarga, últimas acciones del robot y estado técnico.

8. **Dashboard histórico y trazabilidad**  
   Permite revisar sesiones anteriores, métricas de operación, errores, movimientos ejecutados y detalle de cubos procesados.

9. **Modo simulado y modo real**  
   El sistema se diseña con modo simulado para pruebas y modo real para cámara/MaxArm físico.

### **1.3. Diseño y experiencia de usuario:**

La experiencia de usuario principal corresponde al dashboard operacional:

1. El operador abre la pantalla principal.
2. El sistema muestra la cámara cenital en vivo.
3. Al llegar un camión, el QR se detecta automáticamente.
4. El dashboard muestra el código del camión, por ejemplo `TRUCK-003`.
5. El sistema detecta los cubos y muestra el conteo por color.
6. El operador puede iniciar o monitorear la descarga.
7. El robot toma cubos y el dashboard registra las acciones.
8. La sesión queda disponible para trazabilidad.

Imágenes conceptuales y evidencias de spikes se ubicarán en:

```text
docs/images/zona_descarga_cenital.png
docs/images/zona_descarga_cenital-varios.png
docs/images/dashboard_operacional.png
docs/images/dashboard_analytics.png
docs/images/dashboard_live_camera_spike.png
```

Vista conceptual del dashboard operacional:

```text
+------------------------------------------------------+
| RoboDock AI                                          |
+------------------------------------------------------+
| Cámara cenital / Live View     | Estado descarga     |
| [stream cámara procesado]      | Truck: TRUCK-003    |
|                                | Estado: UNLOADING   |
|                                | Cubos restantes: 6  |
+------------------------------------------------------+
| Conteo actual: RED 0 | BLUE 2 | GREEN 3 | YELLOW 2 |
+------------------------------------------------------+
| Últimas acciones robot        | Estado técnico       |
| CUBE-001 BLUE -> DROP_BLUE_01 | Cámara: ACTIVE       |
| ACTION-001 SUCCESS            | Robot: ACTIVE        |
+------------------------------------------------------+
```

### **1.4. Instrucciones de instalación:**

> Estas instrucciones corresponden al diseño objetivo del MVP. Durante la Entrega 2 se implementarán y validarán en el repositorio.

#### Requisitos

- Node.js 20+
- npm
- Docker Desktop
- PostgreSQL vía Docker
- Python 3.11+
- Cámara USB
- Hiwonder MaxArm conectado por serial
- VS Code

#### Instalación backend

```bash
cd backend
npm install
cp .env.example .env
```

Configurar `.env`:

```env
DATABASE_URL="postgresql://robodock:robodock@localhost:5432/robodockdb?schema=public"
```

Levantar PostgreSQL:

```bash
docker compose up -d
```

Ejecutar migraciones y seed:

```bash
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Instalación frontend

```bash
cd frontend
npm install
npm run dev
```

#### Instalación edge service

```bash
cd edge-service
python -m venv .venv

# Windows:
.venv\Scripts\activate

# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python app/main.py
```

#### Modo simulado

```env
VISION_MODE=mock
ROBOT_MODE=simulated
```

#### Modo real

```env
VISION_MODE=camera
ROBOT_MODE=real
MAXARM_SERIAL_PORT=COM4
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```mermaid
flowchart LR
    Camera[Cámara cenital USB] --> Edge[Edge Service Python\nOpenCV + QR + Cubos + MaxArm]
    MaxArm[MaxArm ESP32] <--> Edge

    Edge --> Core[Backend Core\nNode.js + TypeScript]
    Core --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL Docker)]

    Frontend[Frontend Web\nReact + Vite + TypeScript] --> Core
    Frontend --> EdgeStream[Stream cámara / status edge]
    Edge --> EdgeStream
```

La arquitectura sigue un enfoque **edge-first**:

- El procesamiento de cámara y control del robot se ejecutan localmente en el edge/laptop.
- El Backend Core centraliza reglas de negocio, persistencia, dashboards y trazabilidad.
- PostgreSQL permite persistencia relacional robusta.
- Prisma permite modelado, migraciones y acceso tipado a datos.
- El frontend consume datos operacionales desde Backend Core y puede visualizar stream/status del Edge Service.

#### Beneficios

- Baja latencia para visión y robot.
- Separación clara entre operación física y negocio.
- Soporte para modo simulado.
- Modelo preparado para múltiples sitios, edges, cámaras y robots.
- Fácil evolución futura hacia cloud.

#### Sacrificios o déficits

- Mayor complejidad que un backend monolítico simple.
- Requiere sincronización entre Edge Service y Backend Core.
- Requiere manejo de fallas locales de cámara/robot.
- La demo real depende de hardware físico.

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Frontend Web | React + Vite + TypeScript | Dashboards, UI operacional, histórico y trazabilidad. |
| Backend Core | Node.js + TypeScript / NestJS | API, sesiones, eventos, acciones robot, dashboards y persistencia. |
| Prisma ORM | Prisma | Schema, migraciones, cliente tipado y seeds. |
| Base de datos | PostgreSQL | Persistencia relacional. |
| Edge Service | Python + OpenCV | Cámara, QR, cubos, calibración y comunicación con MaxArm. |
| MaxArm | Hiwonder MaxArm + ESP32 | Movimiento físico mediante comandos `POSE`. |
| Cámara | USB / OpenCV index | Captura cenital para QR y cubos. |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Estructura objetivo:

```text
robodock-ai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── modules/
│   │   │   ├── sites/
│   │   │   ├── edge-nodes/
│   │   │   ├── cameras/
│   │   │   ├── robot-arms/
│   │   │   ├── unload-sessions/
│   │   │   ├── detected-cubes/
│   │   │   ├── robot-actions/
│   │   │   ├── drop-zones/
│   │   │   ├── dashboard/
│   │   │   └── events/
│   │   ├── common/
│   │   └── main.ts
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── i18n/
│   │   └── types/
│   └── tests/
│
├── edge-service/
│   ├── app/
│   │   ├── vision/
│   │   ├── robot/
│   │   ├── calibration/
│   │   ├── events_client/
│   │   └── main.py
│   └── tests/
│
├── docs/
│   └── images/
│
├── experiments/
│   ├── vision_color_detection/
│   ├── truck_code_detection/
│   ├── integrated_vision_detection/
│   ├── dashboard_live_camera/
│   ├── dynamic_pickup_detection/
│   └── dynamic_pickup_maxarm_pick/
│
├── docker-compose.yml
├── readme.md
└── prompts.md
```

La estructura obedece a una separación por capas:

- `backend`: negocio y persistencia.
- `frontend`: experiencia de usuario.
- `edge-service`: hardware, visión y robot.
- `experiments`: spikes técnicos ya validados.
- `docs`: evidencias visuales y documentación.

### **2.4. Infraestructura y despliegue**

Infraestructura MVP local:

```mermaid
flowchart TB
    Dev[Notebook / Edge Node] --> Docker[Docker Compose]
    Docker --> Postgres[(PostgreSQL)]
    Dev --> Backend[Backend Core localhost]
    Dev --> Frontend[Frontend localhost]
    Dev --> Edge[Edge Service Python]
    Edge --> Camera[Cámara USB]
    Edge --> MaxArm[MaxArm COM4]
```

Proceso de despliegue local:

1. Clonar repositorio.
2. Configurar variables `.env`.
3. Levantar PostgreSQL con Docker Compose.
4. Ejecutar migraciones Prisma.
5. Ejecutar seeds.
6. Levantar Backend Core.
7. Levantar Frontend.
8. Levantar Edge Service.
9. Ejecutar modo simulado o modo real.

Evolución futura:

- Frontend en Vercel.
- Backend Core en Render, Railway, Azure o similar.
- PostgreSQL administrado.
- Edge Service local enviando eventos al Backend Core cloud.

### **2.5. Seguridad**

La estrategia de seguridad de RoboDock AI se divide en dos niveles:

1. **Prácticas comprometidas para las siguientes entregas del curso**, aplicables al MVP local.
2. **Prácticas consideradas para una evolución futura del producto**, cuando RoboDock AI opere como plataforma cloud/multiusuario.

#### Seguridad comprometida para el MVP académico

| Práctica | Implementación comprometida |
|---|---|
| Separación modo real/simulado | El sistema debe soportar `ROBOT_MODE=simulated` y `ROBOT_MODE=real`. El modo simulado será usado para pruebas y respaldo de demo, evitando movimientos físicos accidentales del MaxArm. |
| Configuración segura | Variables como `DATABASE_URL`, puerto serial del MaxArm, modo de cámara y modo robot se gestionarán mediante `.env`. El archivo `.env` no se subirá al repositorio; se incluirá `.env.example`. |
| Validación de entrada | El Backend Core validará los payloads principales antes de crear sesiones, registrar eventos, registrar cubos o registrar acciones robot. |
| Prevención de SQL Injection | El acceso a la base de datos se realizará mediante Prisma Client. Cualquier uso futuro de SQL raw deberá ser parametrizado. |
| Integridad relacional | PostgreSQL y Prisma aplicarán claves primarias UUID, claves foráneas, restricciones `unique`, índices y relaciones explícitas entre `Site`, `EdgeNode`, `CameraDevice`, `RobotArm`, calibraciones, sesiones, cubos, acciones y eventos. |
| Consistencia operacional por EdgeNode | El backend deberá validar que cámara, robot, calibraciones, zonas de descarga y sesiones pertenezcan al mismo `EdgeNode`, evitando mezclar configuraciones de distintos muelles o laptops. |
| Control de estados | Las sesiones usarán estados controlados como `CREATED`, `DETECTING`, `UNLOADING`, `COMPLETED`, `FAILED` y `CANCELLED`, evitando transiciones inválidas. |
| Seguridad de movimiento robótico | Antes de mover el MaxArm, el Edge Service deberá validar poses requeridas, usar coordenadas enteras, aplicar `safeZ`, pasar por `reset` y ejecutar secuencias controladas. |
| Manejo de errores del robot | Si falla un paso del robot, la acción debe quedar en estado `ERROR`, registrar `errorMessage` y detener la secuencia o intentar volver a una posición segura con `suck=0`. |
| Prevención de sobreposición en descarga | La asignación de `DropPosition` debe evitar que dos cubos del mismo color usen la misma posición física. Para ello se usará `DropPosition.occupied` y validación transaccional al asignar posiciones. |
| Trazabilidad operacional | Las entidades `Event`, `SystemLog`, `RobotAction` y `RobotActionStep` registrarán detecciones, comandos enviados al MaxArm, respuestas, errores y cambios de estado. |
| Datos sensibles | El MVP no almacenará pagos, tarjetas, credenciales de usuarios finales ni datos personales sensibles. Los datos registrados serán operacionales y de demostración. |

#### Seguridad considerada para evolución futura

| Práctica | Evolución propuesta |
|---|---|
| Autenticación | En una versión cloud o multiusuario se deberá incorporar autenticación mediante JWT, OAuth2, proveedor externo o mecanismo equivalente. |
| RBAC | Se consideran roles como `operator`, `supervisor` y `admin`, con permisos diferenciados para operación, consulta histórica y configuración de cámaras, robots, calibraciones y zonas. |
| Rate limiting | Si la API queda expuesta fuera del entorno local, se deberá aplicar rate limiting en endpoints públicos, endpoints de eventos y endpoints de dashboard. |
| HTTPS | En despliegues cloud o accesos remotos, todo tráfico deberá usar HTTPS. |
| Auditoría avanzada | En una versión productiva se podría agregar auditoría de usuario, IP, dispositivo, cambios de configuración y operaciones críticas. |
| Gestión de secretos | Para cloud se deberá usar un secret manager o mecanismo equivalente, evitando gestionar secretos manualmente en archivos locales. |
| Privacidad y retención de datos | Si se incorporan usuarios reales o datos personales, se deberán definir políticas de retención, anonimización y eliminación de datos. |
| Multi-tenant SaaS | Si RoboDock AI evoluciona a producto SaaS, se deberá agregar aislamiento formal por organización/cliente, más allá del modelo actual basado en `Site` y `EdgeNode`. |

### **2.6. Tests**

Estrategia de testing:

#### Unitarios

- Validar formato de QR (`TRUCK-001`).
- Generar `code` funcional de sesión.
- Contar cubos por color.
- Seleccionar `DropPosition` disponible por color.
- Generar secuencia robot.
- Validar transición de estados.
- Mapear coordenadas pickup → MaxArm.
- Validar payloads de eventos.

#### Integración

- Crear `Site`, `EdgeNode`, `CameraDevice`, `RobotArm`.
- Crear calibraciones de cámara y robot.
- Crear sesión de descarga.
- Registrar detecciones.
- Registrar acciones robot y pasos.
- Consultar dashboard operacional.
- Verificar persistencia en PostgreSQL.

#### E2E simulado

```text
simular camión
→ simular cubos
→ seleccionar drop positions
→ simular acciones robot
→ registrar datos
→ consultar dashboard
→ cerrar sesión
```

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    Site ||--o{ EdgeNode : contains

    EdgeNode ||--o{ CameraDevice : has
    EdgeNode ||--o{ RobotArm : has
    EdgeNode ||--o{ DropZone : has
    EdgeNode ||--o{ UnloadSession : runs
    EdgeNode ||--o{ Event : emits
    EdgeNode ||--o{ SystemLog : logs

    CameraDevice ||--o{ CameraCalibrationProfile : has

    RobotArm ||--o{ RobotPose : has
    RobotArm ||--o{ RobotCalibrationProfile : has
    RobotArm ||--o{ RobotAction : executes

    DropZone ||--o{ DropPosition : contains
    DropZone ||--o{ RobotAction : target_zone
    DropPosition ||--o{ RobotAction : target_position

    Truck ||--o{ UnloadSession : participates

    CameraCalibrationProfile ||--o{ UnloadSession : used_by
    RobotCalibrationProfile ||--o{ UnloadSession : used_by

    UnloadSession ||--o{ DetectedCube : contains
    UnloadSession ||--o{ RobotAction : records
    UnloadSession ||--o{ Event : groups
    UnloadSession ||--o{ SystemLog : logs

    DetectedCube ||--o{ RobotAction : processed_by
    RobotAction ||--o{ RobotActionStep : includes

    Site {
        UUID id PK
        VARCHAR code UK
        VARCHAR name
        VARCHAR city
        VARCHAR country
        VARCHAR location
        ENUM type
        BOOLEAN active
        DATETIME createdAt
        DATETIME updatedAt
    }

    EdgeNode {
        UUID id PK
        UUID siteId FK
        VARCHAR code UK
        VARCHAR name
        VARCHAR location
        ENUM status
        DATETIME lastSeenAt
        DATETIME createdAt
        DATETIME updatedAt
    }

    CameraDevice {
        UUID id PK
        UUID edgeNodeId FK
        VARCHAR code
        VARCHAR name
        INT cameraIndex
        ENUM role
        ENUM status
        JSONB config
        DATETIME createdAt
        DATETIME updatedAt
    }

    CameraCalibrationProfile {
        UUID id PK
        UUID cameraDeviceId FK
        VARCHAR code
        VARCHAR name
        FLOAT pickupWidthCm
        FLOAT pickupHeightCm
        FLOAT cubeSizeCm
        JSONB cameraCorners
        JSONB qrRoi
        JSONB cargoRoi
        JSONB hsvConfig
        BOOLEAN active
        INT version
        DATETIME createdAt
        DATETIME updatedAt
    }

    RobotArm {
        UUID id PK
        UUID edgeNodeId FK
        VARCHAR code
        VARCHAR name
        VARCHAR model
        ENUM connectionType
        VARCHAR serialPort
        ENUM status
        DATETIME createdAt
        DATETIME updatedAt
    }

    RobotPose {
        UUID id PK
        UUID robotArmId FK
        VARCHAR code
        VARCHAR name
        FLOAT x
        FLOAT y
        FLOAT z
        INT suck
        VARCHAR description
        BOOLEAN active
        INT version
        DATETIME createdAt
        DATETIME updatedAt
    }

    RobotCalibrationProfile {
        UUID id PK
        UUID robotArmId FK
        VARCHAR code
        VARCHAR name
        FLOAT pickupWidthCm
        FLOAT pickupHeightCm
        FLOAT cubeSizeCm
        JSONB robotCorners
        FLOAT safeZ
        FLOAT pickZ
        BOOLEAN active
        INT version
        DATETIME createdAt
        DATETIME updatedAt
    }

    DropZone {
        UUID id PK
        UUID edgeNodeId FK
        VARCHAR code
        VARCHAR name
        ENUM color
        BOOLEAN active
        DATETIME createdAt
        DATETIME updatedAt
    }

    DropPosition {
        UUID id PK
        UUID dropZoneId FK
        VARCHAR code
        INT positionOrder
        FLOAT x
        FLOAT y
        FLOAT z
        INT suck
        BOOLEAN active
        BOOLEAN occupied
        DATETIME createdAt
        DATETIME updatedAt
    }

    Truck {
        UUID id PK
        VARCHAR code UK
        VARCHAR description
        DATETIME createdAt
        DATETIME updatedAt
    }

    UnloadSession {
        UUID id PK
        UUID edgeNodeId FK
        UUID truckId FK
        UUID cameraCalibrationProfileId FK
        UUID robotCalibrationProfileId FK
        VARCHAR code UK
        ENUM status
        DATETIME startedAt
        DATETIME finishedAt
        INT totalCubesDetected
        INT totalCubesProcessed
        INT redCount
        INT blueCount
        INT greenCount
        INT yellowCount
        INT errorCount
        VARCHAR notes
        DATETIME createdAt
        DATETIME updatedAt
    }

    DetectedCube {
        UUID id PK
        UUID sessionId FK
        VARCHAR code
        ENUM color
        ENUM status
        FLOAT confidence
        FLOAT pickupXcm
        FLOAT pickupYcm
        FLOAT pixelX
        FLOAT pixelY
        FLOAT estimatedWidthCm
        FLOAT estimatedHeightCm
        BOOLEAN sizeValid
        FLOAT robotTargetX
        FLOAT robotTargetY
        FLOAT robotTargetZ
        FLOAT robotSafeX
        FLOAT robotSafeY
        FLOAT robotSafeZ
        JSONB metadata
        DATETIME detectedAt
        DATETIME updatedAt
    }

    RobotAction {
        UUID id PK
        UUID sessionId FK
        UUID robotArmId FK
        UUID cubeId FK
        UUID dropZoneId FK
        UUID dropPositionId FK
        VARCHAR code
        ENUM actionType
        ENUM status
        JSONB plannedSequence
        DATETIME startedAt
        DATETIME finishedAt
        VARCHAR errorMessage
        JSONB metadata
        DATETIME createdAt
        DATETIME updatedAt
    }

    RobotActionStep {
        UUID id PK
        UUID robotActionId FK
        VARCHAR code
        INT stepOrder
        VARCHAR stepName
        FLOAT x
        FLOAT y
        FLOAT z
        INT suck
        VARCHAR command
        ENUM status
        VARCHAR response
        VARCHAR errorMessage
        DATETIME startedAt
        DATETIME finishedAt
        DATETIME createdAt
    }

    Event {
        UUID id PK
        UUID edgeNodeId FK
        UUID sessionId FK
        VARCHAR code
        ENUM eventType
        JSONB payload
        DATETIME createdAt
        DATETIME syncedAt
    }

    SystemLog {
        UUID id PK
        UUID edgeNodeId FK
        UUID sessionId FK
        VARCHAR code
        ENUM level
        VARCHAR source
        VARCHAR eventType
        VARCHAR message
        JSONB metadata
        DATETIME createdAt
    }
```

### **3.2. Descripción de entidades principales:**

#### Criterio de identificadores

| Campo | Tipo | Uso |
|---|---|---|
| `id` | UUID técnico | PK y FK internas. |
| `code` | VARCHAR funcional | Identificador de negocio visible en dashboards, QR, logs y reportes. |

Ejemplo:

```text
id   = bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
code = UNLOAD-20260610-EDGE-DOCK-01-001
```

#### Entidades de configuración física

| Entidad | Descripción | Restricciones principales |
|---|---|---|
| `Site` | Puerto, sede o laboratorio. | `code` único. |
| `EdgeNode` | Laptop/nodo edge asociado a un sitio. | `siteId` FK, `code` único. |
| `CameraDevice` | Cámara conectada a un edge. | `edgeNodeId` FK, `code` único por edge. |
| `RobotArm` | Brazo conectado a un edge. | `edgeNodeId` FK, `code` único por edge. |
| `RobotPose` | Poses generales del robot. | `robotArmId` FK, `code + version` único por robot. |
| `CameraCalibrationProfile` | Calibración visual de cámara/pickup. | `cameraDeviceId` FK, versión y activo. |
| `RobotCalibrationProfile` | Calibración pickup → MaxArm. | `robotArmId` FK, versión y activo. |
| `DropZone` | Zona lógica de descarga por color. | `edgeNodeId` FK, `color` único por edge. |
| `DropPosition` | Coordenada física disponible dentro de una zona. | `dropZoneId` FK, `positionOrder` único por zona. |

#### Entidades operacionales

| Entidad | Descripción | Restricciones principales |
|---|---|---|
| `Truck` | Camión identificado por QR. | `code` único, por ejemplo `TRUCK-003`. |
| `UnloadSession` | Sesión de descarga. | FK a edge, truck, calibración cámara y calibración robot. |
| `DetectedCube` | Cubo detectado durante una sesión. | FK a sesión, `code` único por sesión. |
| `RobotAction` | Acción de alto nivel del robot. | FK a sesión, robot, cubo y posición destino. |
| `RobotActionStep` | Paso físico de movimiento. | FK a acción, `stepOrder` único por acción. |
| `Event` | Evento operacional. | FK a edge y opcional a sesión. |
| `SystemLog` | Log técnico. | FK opcional a edge y sesión. |

#### Notas de diseño

- `UnloadSession.cameraCalibrationProfileId` y `UnloadSession.robotCalibrationProfileId` se mantienen para trazabilidad histórica.
- `sessionId` en tablas hijas siempre apunta a `UnloadSession.id`.
- `DropZone` no contiene coordenadas. Las coordenadas están en `DropPosition`.
- `RobotActionStep.command` permite registrar el comando físico enviado al MaxArm, por ejemplo `POSE 32 -204 124 1`.
- `Event` y `SystemLog` tienen propósitos distintos: evento operacional vs diagnóstico técnico.

#### Datos de ejemplo consistentes

Ejemplo de `UnloadSession`:

```json
{
  "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "edgeNodeId": "22222222-2222-4222-8222-222222222222",
  "truckId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "cameraCalibrationProfileId": "44444444-4444-4444-8444-444444444444",
  "robotCalibrationProfileId": "77777777-7777-4777-8777-777777777777",
  "code": "UNLOAD-20260610-EDGE-DOCK-01-001",
  "status": "UNLOADING",
  "startedAt": "2026-06-10T10:02:00.000Z",
  "finishedAt": null,
  "totalCubesDetected": 7,
  "totalCubesProcessed": 1,
  "redCount": 0,
  "blueCount": 2,
  "greenCount": 3,
  "yellowCount": 2,
  "errorCount": 0,
  "notes": "Sesión de prueba con camión TRUCK-003",
  "createdAt": "2026-06-10T10:02:00.000Z",
  "updatedAt": "2026-06-10T10:04:20.000Z"
}
```

Ejemplo de `RobotAction`:

```json
{
  "id": "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  "sessionId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "robotArmId": "55555555-5555-4555-8555-555555555555",
  "cubeId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "dropZoneId": "88888888-8888-4888-8888-888888888801",
  "dropPositionId": "99999999-9999-4999-8999-999999999901",
  "code": "ACTION-001",
  "actionType": "PICK_AND_DROP",
  "status": "SUCCESS",
  "plannedSequence": [
    { "stepName": "ready_to_take", "x": 164, "y": 21, "z": 124, "suck": 0 },
    { "stepName": "reset", "x": 0, "y": -163, "z": 212, "suck": 0 },
    { "stepName": "cube_target_pick", "x": 32, "y": -204, "z": 124, "suck": 1 },
    { "stepName": "drop_blue_01", "x": -128, "y": -63, "z": 92, "suck": 0 }
  ],
  "startedAt": "2026-06-10T10:03:00.000Z",
  "finishedAt": "2026-06-10T10:04:20.000Z",
  "errorMessage": null,
  "metadata": {
    "dryRun": false,
    "selectedBy": "nearest_to_center",
    "serialPort": "COM4"
  },
  "createdAt": "2026-06-10T10:03:00.000Z",
  "updatedAt": "2026-06-10T10:04:20.000Z"
}
```

---

## 4. Especificación de la API

A continuación se documentan los 3 endpoints principales del MVP en formato OpenAPI.

```yaml
openapi: 3.0.3
info:
  title: RoboDock AI API
  version: 1.0.0
paths:
  /api/unload-sessions/start:
    post:
      summary: Inicia una sesión de descarga
      description: Crea una sesión asociada a un edge node, camión y calibraciones activas.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - edgeNodeCode
                - truckCode
              properties:
                edgeNodeCode:
                  type: string
                  example: EDGE-DOCK-01
                truckCode:
                  type: string
                  example: TRUCK-003
      responses:
        "201":
          description: Sesión creada
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  code:
                    type: string
                  status:
                    type: string
              example:
                id: bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
                code: UNLOAD-20260610-EDGE-DOCK-01-001
                status: DETECTING

  /api/edge-events:
    post:
      summary: Registra eventos desde el Edge Service
      description: Permite registrar detecciones, acciones robot, errores o cambios de estado generados por el edge.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - edgeNodeCode
                - eventType
                - payload
              properties:
                edgeNodeCode:
                  type: string
                  example: EDGE-DOCK-01
                sessionId:
                  type: string
                  format: uuid
                  nullable: true
                eventType:
                  type: string
                  example: CUBE_DETECTED
                payload:
                  type: object
      responses:
        "201":
          description: Evento registrado
          content:
            application/json:
              example:
                id: ffffffff-ffff-4fff-8fff-ffffffffffff
                code: EVT-0001
                eventType: CUBE_DETECTED

  /api/dashboard/operational:
    get:
      summary: Obtiene el estado operacional actual
      parameters:
        - in: query
          name: edgeNodeCode
          schema:
            type: string
          required: true
          example: EDGE-DOCK-01
      responses:
        "200":
          description: Estado operacional
          content:
            application/json:
              example:
                edgeNodeCode: EDGE-DOCK-01
                truckCode: TRUCK-003
                sessionCode: UNLOAD-20260610-EDGE-DOCK-01-001
                status: UNLOADING
                counts:
                  red: 0
                  blue: 2
                  green: 3
                  yellow: 2
                  total: 7
                robot:
                  code: MAXARM-01
                  status: ACTIVE
                lastActions:
                  - ACTION-001 PICK_AND_DROP SUCCESS
```

---

## 5. Historias de Usuario

### **Historia de Usuario 1**

**Título:** Iniciar sesión de descarga con identificación de camión.

**Como** operador de muelle,  
**quiero** iniciar una sesión de descarga cuando llega un camión identificado por QR,  
**para** registrar y monitorear la operación desde el sistema.

#### Criterios de aceptación

- El sistema recibe un `edgeNodeCode` válido.
- El sistema detecta o recibe un `truckCode` válido.
- Si el camión no existe, se crea.
- Se seleccionan calibraciones activas de cámara y robot.
- Se genera un `code` funcional para la sesión.
- La sesión queda en estado `DETECTING`.

---

### **Historia de Usuario 2**

**Título:** Detectar cubos y asignar posiciones de descarga.

**Como** sistema,  
**quiero** detectar los cubos dentro del pickup y asignar una posición de descarga disponible según el color,  
**para** planificar la descarga sin superponer cubos en una misma posición.

#### Criterios de aceptación

- El sistema detecta color, coordenadas y confianza del cubo.
- El sistema registra el cubo en `DetectedCube`.
- El sistema identifica la `DropZone` asociada al color.
- El sistema selecciona una `DropPosition` activa y no ocupada.
- Si no hay posiciones disponibles, se registra evento `DROP_ZONE_FULL`.
- El dashboard muestra el conteo por color.

---

### **Historia de Usuario 3**

**Título:** Ejecutar y trazar una acción de descarga con MaxArm.

**Como** operador,  
**quiero** que el MaxArm tome un cubo detectado y lo deje en una posición de descarga,  
**para** automatizar la descarga física y mantener trazabilidad del movimiento.

#### Criterios de aceptación

- El sistema calcula `safe_robot_pose` y `target_robot_pose`.
- Se genera una `RobotAction` de tipo `PICK_AND_DROP`.
- Se generan `RobotActionStep` para cada movimiento físico.
- Cada paso registra comando, estado, respuesta y error si corresponde.
- La acción queda en `SUCCESS` o `ERROR`.
- La posición de descarga queda ocupada si el drop fue exitoso.

---

## 6. Tickets de Trabajo

### **Ticket 1 — Backend**

**Título:** Implementar flujo de sesión de descarga y eventos del Edge Service.

**Tipo:** Backend  
**Prioridad:** Must  
**Historia asociada:** Historia de Usuario 1 y 3.

#### Descripción

Implementar los endpoints principales para iniciar una sesión de descarga y registrar eventos enviados desde el Edge Service.

#### Alcance

- Crear módulo `unload-sessions`.
- Crear módulo `edge-events`.
- Implementar endpoint `POST /api/unload-sessions/start`.
- Implementar endpoint `POST /api/edge-events`.
- Validar existencia de `EdgeNode`.
- Crear o reutilizar `Truck` por `truckCode`.
- Buscar calibraciones activas de cámara y robot.
- Generar `UnloadSession.code`.
- Registrar eventos operacionales.
- Manejar errores con respuestas consistentes.

#### Criterios de aceptación

- Endpoint crea sesión correctamente.
- Endpoint registra eventos con payload JSON.
- Se validan estados y relaciones.
- Incluye tests unitarios de generación de `code`.
- Incluye tests de integración contra PostgreSQL.

---

### **Ticket 2 — Frontend**

**Título:** Implementar dashboard operacional de RoboDock AI.

**Tipo:** Frontend  
**Prioridad:** Must  
**Historia asociada:** Historia de Usuario 1, 2 y 3.

#### Descripción

Crear pantalla operacional que muestre estado actual de la descarga, conteo por color, camión detectado, robot activo y últimas acciones.

#### Alcance

- Crear página `OperationalDashboard`.
- Crear componentes:
  - `CameraPanel`
  - `SessionStatusCard`
  - `ColorCountPanel`
  - `RobotStatusPanel`
  - `LastActionsList`
- Consumir `GET /api/dashboard/operational`.
- Mostrar estados de carga/error.
- Preparar layout responsive.
- Incluir textos base para i18n español/inglés.

#### Criterios de aceptación

- El dashboard muestra `truckCode`, `sessionCode` y `status`.
- El dashboard muestra conteos por color.
- El dashboard muestra estado del robot.
- El dashboard muestra últimas acciones.
- Si la API falla, se muestra estado de error.
- Incluye test de render con datos mock.

---

### **Ticket 3 — Base de datos**

**Título:** Implementar modelo Prisma inicial de RoboDock AI.

**Tipo:** Base de datos  
**Prioridad:** Must  
**Historia asociada:** Todas.

#### Descripción

Crear el schema Prisma inicial con las entidades principales del modelo de datos y seeds mínimos para ejecutar el MVP en local.

#### Alcance

- Definir enums del dominio.
- Crear modelos:
  - `Site`
  - `EdgeNode`
  - `CameraDevice`
  - `CameraCalibrationProfile`
  - `RobotArm`
  - `RobotPose`
  - `RobotCalibrationProfile`
  - `DropZone`
  - `DropPosition`
  - `Truck`
  - `UnloadSession`
  - `DetectedCube`
  - `RobotAction`
  - `RobotActionStep`
  - `Event`
  - `SystemLog`
- Crear migración inicial.
- Crear seed con:
  - sitio demo;
  - edge demo;
  - cámara demo;
  - MaxArm demo;
  - poses iniciales;
  - calibraciones iniciales;
  - zonas y posiciones de descarga.

#### Criterios de aceptación

- `npx prisma migrate dev` ejecuta sin errores.
- `npx prisma db seed` carga datos mínimos.
- Las FK funcionan correctamente.
- `id` usa UUID nativo PostgreSQL.
- `code` usa identificadores funcionales.
- Existen índices y unique constraints definidos.

---

## 7. Pull Requests

### **Pull Request 1**

**Título:** Entrega 1: documentación técnica inicial de RoboDock AI.

**Rama:** `feature-entrega1-ASP`

**URL:**  
https://github.com/LIDR-academy/AI4Devs-finalproject/pull/180

#### Contenido

- `readme.md` con ficha del proyecto, descripción general, arquitectura, modelo de datos, API, historias de usuario, tickets y pull requests.
- `prompts.md` con prompts principales utilizados durante la ideación, diseño y planificación del proyecto.
- Diagramas Mermaid para arquitectura y modelo de datos.
- Documentación del modelo de datos con `Site`, `EdgeNode`, `CameraDevice`, `RobotArm`, calibraciones, `DropZone`, `DropPosition`, sesiones, cubos, acciones y eventos.
- Evidencias visuales en `docs/images`.

#### Estado

Creado para Entrega 1.

---

### **Pull Request 2**

**Título:** Entrega 2: MVP funcional de RoboDock AI.

**Rama:** `feature-entrega2-ASP`

#### Contenido

- Backend Core con Node.js/TypeScript.
- Prisma + PostgreSQL.
- Migración inicial y seeds.
- Endpoints principales.
- Frontend inicial.
- Dashboard operacional.
- Modo simulado.
- Tests básicos.

#### Estado

Planificado para Entrega 2.

---

### **Pull Request 3**

**Título:** Entrega final: integración completa y demo de RoboDock AI.

**Rama:** `finalproject-ASP`

#### Contenido

- Integración con cámara real.
- Integración con MaxArm real.
- Dashboard operacional completo.
- Dashboard histórico y trazabilidad.
- Tests finales.
- Evidencias visuales.
- Video demostrativo.
- Documentación final.

#### Estado

Planificado para Entrega final.
