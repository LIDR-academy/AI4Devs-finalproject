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

> **UX Dashboard (alineado a D10):** además del panel `/admin/reminders`, el **Dashboard de administración** mostrará un resumen de hasta **~5 vehículos** elegibles con enlace **“Ver más”** a la lista completa.

> **Consideración de modelo de datos:** se requiere soporte para registrar el estado de exclusión por vehículo (`no_recordar`, `fecha_exclusion`, `excluido_por`) y el historial de recordatorios enviados (fecha, usuario que ejecutó el envío, vehículos incluidos). Ambos elementos deben contemplarse al diseñar el modelo de datos desde la V1.

#### D5. Búsqueda de Clientes por Correo Electrónico

En la versión inicial, la búsqueda de clientes en `/clients` admite **nombre**, **identificación** y **teléfono**. En V2 se extenderá el criterio de búsqueda para incluir el **correo electrónico** del cliente, de modo que términos como `juan@email.com` o fragmentos del dominio (`@email.com`) devuelvan coincidencias en la misma barra de búsqueda unificada.

Esta extensión facilita localizar propietarios cuando el taller solo dispone del correo (por ejemplo, antes de enviar notificaciones D2 o recordatorios D4) y alinea la experiencia con la expectativa del usuario de buscar por cualquier dato de contacto visible en la ficha.

**Comportamiento previsto en V2:**

- La consulta `GET /api/clients/search?q=` incluirá `email` en la condición `OR`, con comparación insensible a mayúsculas/minúsculas.
- El placeholder de la UI pasará a indicar explícitamente *nombre, identificación, teléfono o correo*.
- Se recomienda añadir índice en `Client.email` si el volumen de clientes crece o si D2/D4 dependen de consultas frecuentes por correo.

> **Consideración técnica:** no requiere cambios estructurales en el modelo `Client` (el campo `email` ya existe en V1); basta extender el servicio de búsqueda y los tests asociados.

#### D6. Edición de Usuarios del Taller

El MVP de gestión de usuarios (US-002) cubre **alta**, **listado** y **desactivación** (soft delete). En V2 el administrador podrá **editar cuentas existentes** sin recrearlas ni perder el historial operativo vinculado.

**Campos editables previstos:**

| Campo | Reglas |
|-------|--------|
| Nombre completo | Actualización directa; validación 2–120 caracteres |
| Correo electrónico | Único en el sistema; normalización a minúsculas; conflicto → `409` |
| Rol | Cambio entre `ADMIN` y `MECHANIC`; no permitir dejar el sistema sin al menos un administrador activo |
| Contraseña | Reseteo opcional por el administrador (nueva contraseña temporal) o flujo de cambio obligatorio en primer login |
| Flag mecánico (D8) | Solo relevante si `role = ADMIN`: `canActAsMechanic` para aparecer en asignación de OT |

**Comportamiento previsto en V2:**

- Endpoint `PATCH /api/users/:id` (solo `ADMIN`) para actualizar datos de perfil.
- UI en `/admin/users`: acción **Editar** por fila, con formulario modal o página dedicada.
- Mantener las reglas de integridad del MVP: no desactivar al último admin activo; no auto-desactivación; usuarios inactivos no editables para cambio de rol hasta reactivación (si se implementa).
- Opcionalmente en la misma versión o en V2.1: **reactivación** de cuentas inactivas (`PATCH .../reactivate`) y **cambio obligatorio de contraseña** en el primer inicio de sesión (`mustChangePassword`).

> **Consideración de modelo de datos:** puede requerir campos `mustChangePassword` y `passwordChangedAt` en `User` (ya previstos en US-002 como extensión V2). El historial de OT y tareas no se altera al editar nombre o correo del empleado.

#### D7. Kilometraje Opcional en la Orden de Trabajo

En el MVP, el kilometraje se exige al crear la orden de trabajo. En la práctica, algunos vehículos ingresan **varados o en condiciones en las que el odómetro no es legible** (sin batería, tablero apagado, daños, etc.), por lo que forzar el dato en el ingreso retrasa la recepción.

En V2 el kilometraje de la OT será **opcional en el alta** y **actualizable en cualquier momento** (incluido el momento de entrega). Si al entregar aún no está registrado, se mostrará un recordatorio para capturarlo entonces, sin bloquear la entrega si se omite.

**Comportamiento previsto en V2:**

- Al crear la OT (`POST /api/work-orders`), `mileage` podrá omitirse o enviarse como `null`.
- El formulario de creación no bloqueará el envío si el kilometraje está vacío; podrá mostrarse como campo opcional con ayuda contextual (“puede completarse más adelante”).
- Desde el detalle de la OT, administrador o mecánico podrán **registrar o corregir** el kilometraje en cuanto sea posible leerlo (`PATCH /api/work-orders/:id` o endpoint dedicado de kilometraje).
- El historial y las vistas que muestren kilometraje deben tolerar el valor ausente (por ejemplo, “Sin registrar”) hasta que se complete.
- Si ya existe un valor, una actualización posterior debe quedar auditada al menos con la marca de tiempo de la OT (`updatedAt`) o, idealmente, con nota operativa si el taller lo requiere.
- **Al momento de la entrega:** si el kilometraje sigue sin registrar, la UI mostrará un **recordatorio** y permitirá agregarlo en ese paso. Completarlo será **opcional**: el usuario podrá omitirlo y la entrega avanzará dejando el kilometraje vacío.

> **Consideración de modelo de datos / API:** el atributo `WorkOrder.mileage` debería pasar de obligatorio a **nullable** (o equivalente), con migración y ajuste de DTOs/validaciones Zod del frontend. Las reglas de “solo números positivos” se mantienen cuando el valor sí se informa. El flujo de entrega (US-008) no debe exigir `mileage` para confirmar la entrega.

#### D8. Administradores con Capacidad de Mecánico

En el MVP, el campo **mecánico asignado** de la orden de trabajo solo admite usuarios con rol `MECHANIC`. En talleres pequeños es frecuente que el administrador también atienda piso: con el rol `ADMIN` conserva permisos administrativos, pero hoy **no aparece** en el listado de asignación.

En V2, un administrador podrá marcarse con un **flag de mecánico** (`canActAsMechanic` o equivalente). Quienes lo tengan activo podrán:

- Aparecer en el listado de asignables al **crear la OT** (y al cambiar el asignado si la OT lo permite).
- Ser **asignados** como responsables de la visita / trabajo mecánico, igual que un usuario `MECHANIC`.
- Seguir usando el resto de funciones de administrador (usuarios, panel de entrega, etc.).

**Comportamiento previsto en V2:**

- En alta/edición de usuarios (US-002 / D6): si el rol es `ADMIN`, checkbox u opción *“También puede realizar trabajo de mecánico”*.
- Usuarios `MECHANIC` no necesitan el flag (ya son asignables por definición); el flag aplica a `ADMIN`.
- El endpoint de candidatos a asignación (`GET .../mechanics` o equivalente) devolverá: mecánicos activos **unión** administradores activos con `canActAsMechanic = true`.
- Validación al crear/actualizar OT: `assignedMechanicId` acepta esos mismos criterios (no solo `role = MECHANIC`).
- El flag no sustituye el rol: un admin con flag **no pierde** acceso a rutas de administración.
- Desactivar el flag o la cuenta quita al usuario de futuros listados; las OT históricas conservan la referencia al usuario asignado.

> **Consideración de modelo de datos:** añadir booleano en `User` (p. ej. `canActAsMechanic Boolean @default(false)`). La FK `WorkOrder.assignedMechanicId` puede seguir apuntando a `User` sin cambio estructural; solo cambia la regla de elegibilidad en servicio y UI.

#### D10. Órdenes Activas en el Dashboard

Hoy los paneles `/admin/dashboard` y `/mechanic/dashboard` solo muestran un saludo. En V2 deberán ofrecer un resumen operativo de **órdenes de trabajo en curso**.

**Comportamiento previsto en V2:**

- En el Dashboard, un cuadro **“Órdenes en curso”** con **máximo 5** OT activas (más recientes primero), cada una con enlace al detalle.
- Estados considerados activos: `EN_PROCESO`, `LISTA_PARA_ENTREGA` y `OWNER_CONTACTED` (misma familia que las OT que impiden abrir otra visita sobre el mismo vehículo).
- Enlace **“Ver todas”** hacia una pantalla dedicada de listado completo (p. ej. `/work-orders/in-progress`), con paginación.
- **Administrador:** ve todas las OT activas del taller. **Mecánico:** solo las asignadas a sí mismo.
- Si no hay OT activas: mensaje claro (*“No hay órdenes en curso.”*) y, opcionalmente, acceso a crear una nueva OT.
- Entrada de navegación **“En curso”** (o equivalente) en el menú por rol.

> **Consideración técnica:** hoy solo existe consulta de OT activa **por vehículo** (`GET /api/work-orders/active?vehicleId=`). Hará falta un endpoint de listado de OT activas (con `limit` / paginación y filtro por rol). No sustituye el panel de entrega (US-008).

---

### Funcionalidades de Largo Plazo

- **Módulo de inventario de repuestos:** control de stock, entradas, salidas y alertas de reabastecimiento.
- **Facturación electrónica:** generación de comprobantes fiscales según normativa local.
- **App móvil nativa:** versión optimizada para dispositivos móviles orientada al mecánico en piso.
- **Reportes y estadísticas avanzadas:** tiempo promedio por tipo de reparación, ingresos por período, rendimiento por mecánico, vehículos más frecuentes, entre otros.
- **Integración con proveedores de repuestos:** consulta de disponibilidad y precios desde el sistema.


### **1.3. Diseño y experiencia de usuario:**



Las imágenes de como luce para los usuarios el sistema se pueden ver en el folder: /docs/Diseño y experiencia de usuario


Se puede ver un video del proyecto corriendo en: \docs\Diseño y experiencia de usuario\ProyectoFinal_RFM.mp4



### **1.4. Instrucciones de instalación:**

#### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)

#### Despliegue completo con Docker (recomendado)

No necesitas Node.js ni terminal para el día a día: con Docker Desktop puedes levantar **PostgreSQL, API y frontend** con un solo comando o desde la interfaz gráfica.

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

O en **Docker Desktop**: *Open* el proyecto → pestaña *Compose* → **Start**.

Cuando los contenedores estén en verde:

| Servicio | URL |
|----------|-----|
| **Aplicación web** | http://localhost:3000 |
| PostgreSQL (opcional, depuración) | `localhost:5434` |

La primera vez, el contenedor `api` aplica migraciones y carga datos de prueba automáticamente.

**Usuarios de prueba:**

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@taller.com` | `AdminPass123` | Administrador |
| `mechanic@taller.com` | `MechanicPass123` | Mecánico |

Para detener todo: `docker compose down` (los datos persisten en el volumen `mecatrack_pg_data`).

Variables JWT opcionales: copia `.env.docker.example` a `.env` en la raíz si quieres personalizar secretos.

#### Acceso desde la red WiFi (móvil, tablet u otro PC)

Los dispositivos en la misma red pueden usar MecaTrack si apuntan a la **IP local** del equipo donde corre Docker (no uses `localhost` en el teléfono).

1. **Levanta el stack** (si no está ya en marcha): `docker compose up -d --build`
2. **Obtén la IP del PC** en Windows (PowerShell o CMD):
   ```bash
   ipconfig
   ```
   Busca la dirección **IPv4** de tu adaptador WiFi (ejemplo: `192.168.1.42`).
3. **En el otro dispositivo**, abre el navegador en:
   ```
   http://192.168.1.42:3000
   ```
   (sustituye por tu IP real).
4. **Firewall de Windows**: si no carga, permite conexiones entrantes en el puerto **3000** (Panel de control → Firewall → Reglas de entrada → puerto TCP 3000).

Requisitos: el PC con Docker y el dispositivo cliente deben estar en la **misma red WiFi**. Tras cambiar la configuración de red, reconstruye el frontend una vez: `docker compose up -d --build web`.

#### Desarrollo local (sin contenedores de app)

- Node.js 20+
- Docker Desktop (solo PostgreSQL)
- npm

```bash
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000` (requiere la API en ejecución).

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
| Extensiones V2 (email, recordatorios, propietario histórico, búsqueda por correo, edición de usuarios, kilometraje opcional, admin-mecánico) | Puertos/adaptadores y endpoints PATCH sin reescribir el núcleo |
| MVP académico y operación en un solo taller | Un despliegue, un repositorio, complejidad operativa baja |

**Beneficios principales**

- **Simplicidad operativa:** un solo backend y una base de datos facilitan desarrollo local, pruebas y despliegue.
- **Consistencia transaccional:** crear OT, agregar tareas y registrar costos pueden ejecutarse en la misma unidad de trabajo.
- **Evolución ordenada:** los módulos del monolito (auth, work-orders, notifications, users, clients) permiten añadir D1–D8 sin cambiar el patrón general.
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
| **Organización** | Carpetas por **feature** (`auth`, `users`, `clients`, `vehicles`, `work-orders`, `delivery-panel`, `history`); shell compartido `AppChrome` (`AppHeader` + `RoleNav` + `MobileNavDrawer`, US-F1) |
| **Estado** | El servidor es la fuente de verdad; estado local solo en formularios y UI transitoria (p. ej. menú móvil abierto/cerrado) |
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
| `users` | US-002, D6 (V2), D8 (V2) | Alta, listado y desactivación (MVP); edición de perfil y flag de mecánico en admin (V2) |
| `clients` | US-003, D5 (V2) | Búsqueda, alta y edición de clientes (MVP); búsqueda por correo en V2 |
| `vehicles` | US-004 | Búsqueda, alta, edición y eliminación de vehículos (sin OT); asociación a cliente |
| `work-orders` | US-005, US-006, D7 (V2), D8 (V2) | OT, tareas dinámicas, estados y costos; kilometraje opcional; admins con flag asignables en V2 |
| `task-notes` | US-007 | Diagnósticos, reparaciones y observaciones |
| `delivery` | US-008 | Panel de vehículos listos para entrega |
| `history` | US-009 | Historial de vehículos y clientes |
| `health` | US-O1 | Probes públicos de liveness/readiness (`/api/health/*`) |
| `metrics` | US-O2 | Exposición Prometheus (`/api/metrics`) e instrumentación HTTP RED |
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
| **Mecanismo** | JWT de acceso de corta duración + refresh token en cookie `httpOnly` (web) o en el cuerpo JSON para clientes nativos (`X-MecaTrack-Client: mobile`) |
| **Contraseñas** | Hash con bcrypt o Argon2 |
| **Roles** | `ADMIN`, `MECHANIC` — aplicados mediante guards en cada endpoint |
| **Cuentas inactivas** | Rechazo en login; datos históricos conservados |

#### Integraciones externas (V2, diseño desde V1)

- **`EmailPort`:** abstracción para SendGrid, Mailgun o AWS SES; implementación concreta en V2.
- **`ReminderJob`:** tarea programada (cron o worker en Docker) para calcular vehículos sin visita > 180 días; en MVP puede resolverse con consulta al cargar la vista si el volumen es bajo.

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El repositorio sigue un **monorepo** con aplicaciones separadas para API, web y Android, más configuración compartida de contenedores. El patrón es **feature folders** en el frontend y **módulos verticales** en el backend (cada módulo agrupa controller, service y acceso a datos de su dominio).

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
│   ├── web/                          # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/                  # rutas App Router
│   │   │   ├── features/             # auth, users, clients, vehicles, ...
│   │   │   └── shared/               # cliente API, contexto auth, componentes UI
│   │   └── public/
│   └── android/                      # Native Android client (Kotlin + Compose)

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
| `apps/web/src/shared/` | Utilidades transversales (cliente HTTP, shell `AppChrome` / nav responsive US-F1, componentes reutilizables) |
| `apps/android/` | Cliente nativo Android (Kotlin + Jetpack Compose) que consume la misma API |
| `packages/shared-types/` | Contratos TypeScript compartidos entre API y web (opcional) |
| `docker-compose.yml` | Orquestación local: base de datos, API y frontend con un solo comando |

Esta estructura facilita que cada historia de usuario se implemente de forma incremental en el módulo correspondiente, manteniendo fronteras claras entre capas sin la complejidad de múltiples repositorios o servicios desplegados por separado en la fase MVP.

### **2.4. Infraestructura y despliegue**

La infraestructura actual de MecaTrack se apoya en **Docker Compose** para orquestar los componentes principales del sistema en el entorno productivo local. El despliegue sigue un esquema de **tres servicios base**: un contenedor para PostgreSQL, un contenedor para la API NestJS y un contenedor para el frontend Next.js. El navegador del usuario solo se conecta al frontend; este reenvía las solicitudes `/api` al backend dentro de la red interna de Docker, y la API persiste la información en PostgreSQL. De forma **opcional**, el profile Compose `observability` (US-O3) añade Prometheus para scrapear `http://api:4000/api/metrics` sin publicar métricas al exterior.

```mermaid
flowchart LR
    User[Navegador del usuario]

    subgraph Host [Host local]
        Web[Contenedor web\nNext.js standalone\npuerto 3000]
        PG[Contenedor postgres\nPostgreSQL 16\npuerto host 5434]
        Prom[Prometheus opcional\n127.0.0.1:9090]
        Graf[Grafana opcional\n127.0.0.1:3001]
    end

    subgraph Docker [Red interna Docker Compose]
        API[Contenedor api\nNestJS\npuerto interno 4000]
        DB[(PostgreSQL\npuerto interno 5432)]
    end

    Volume[(Volumen persistente\nmecatrack_pg_data)]

    User -->|HTTP| Web
    Web -->|/api proxy| API
    API -->|Prisma / SQL| DB
    DB --- Volume
    PG --- DB
    Prom -->|scrape /api/metrics| API
    Graf -->|datasource| Prom
```

#### Componentes de infraestructura

| Componente | Implementación actual | Función en el despliegue |
|------------|------------------------|---------------------------|
| **Frontend** | Contenedor `mecatrack-web` construido desde `apps/web/Dockerfile` | Sirve la aplicación Next.js en modo `standalone`, expuesta al host por el puerto `3000` (o `WEB_PORT` si se sobreescribe) |
| **Backend** | Contenedor `mecatrack-api` construido desde `apps/api/Dockerfile` | Expone la API NestJS dentro de la red Docker, aplica reglas de negocio, autenticación y acceso a datos |
| **Base de datos** | Contenedor `mecatrack-postgres` con imagen `postgres:16-alpine` | Almacena usuarios, clientes, vehículos, órdenes de trabajo, tareas e historial en la BD `mecatrack` |
| **Persistencia** | Volumen Docker `mecatrack_pg_data` | Conserva los datos de PostgreSQL entre reinicios o recreaciones de contenedores |
| **Orquestación** | Archivo `docker-compose.yml` del entorno productivo | Coordina construcción, variables de entorno, dependencias y puertos publicados |
| **Observabilidad (opcional)** | Profile `observability` → Prometheus + Grafana + reglas de alerta | Scrapeo `GET /api/metrics`, dashboard API Overview, alertas básicas (`MecaTrackApiDown` / 5xx / p95). Guía: `infra/observability/README.md`; runbook: `infra/observability/runbooks/alerts.md` |

#### Proceso de despliegue actual

El despliegue productivo se levanta desde un `docker-compose.yml` que construye y arranca `postgres`, `api` y `web`. PostgreSQL se inicia primero, publica el puerto `5434` **solo en `127.0.0.1`** y declara un `healthcheck` con `pg_isready`. La API depende de que la base esté saludable, declara un `healthcheck` contra `GET /api/health/ready` (US-O1) y recibe por variables de entorno (archivo `.env` del host, sin fallbacks inseguros) la cadena `DATABASE_URL`, los secretos JWT y los tiempos de expiración de sesión.

Para métricas, dashboards y alertas (US-O2 … US-O5), define `GRAFANA_ADMIN_PASSWORD` en el `.env` del host y ejecuta:

```bash
docker compose --profile observability up -d
```

Prometheus: http://127.0.0.1:9090 · Grafana: http://127.0.0.1:3001 (loopback). Detalle en [`infra/observability/README.md`](infra/observability/README.md).

La imagen de la API se construye en múltiples etapas: instala dependencias, genera el cliente Prisma, compila NestJS y artefactos de bootstrap/seed opcionales. Al arrancar, `docker-entrypoint.sh` ejecuta `prisma migrate deploy`, puede correr un **bootstrap de admin opcional** solo si `ENABLE_ADMIN_BOOTSTRAP=true` (BD vacía), **no ejecuta el seed de desarrollo**, e inicia la aplicación como usuario no privilegiado (`nestjs`).

El frontend también se construye en múltiples etapas y se publica como aplicación Next.js `standalone`. Su contenedor no llama al backend por `localhost`, sino por la variable `API_PROXY_TARGET=http://api:4000`, lo que mantiene la comunicación dentro de la red interna de Docker. Hacia el navegador, el frontend publica el puerto `3000` y resuelve las llamadas a `/api/*` como proxy al contenedor `api`, manteniendo una única URL de acceso para el usuario final.

#### Separación entre desarrollo y producción

En la operación actual existen dos configuraciones distintas. **Producción** utiliza el stack completo con `postgres` + `api` + `web`, expuesto en `127.0.0.1:5434` y `3000`. En cambio, esta copia de **desarrollo** usa un `docker-compose.yml` aislado con `name: mecatrack-dev` y solo levanta PostgreSQL en `127.0.0.1:5435`, precisamente para no interferir con el entorno productivo local. La API y el frontend de desarrollo se ejecutan por separado cuando se necesitan pruebas locales.

#### Consideraciones operativas

- El puerto **`3000`** es la entrada principal del sistema para el usuario final; la API no se expone directamente al host en el despliegue productivo actual.
- El puerto **`5434`** queda bound a **localhost** para herramientas locales (pgAdmin/DBeaver); no debe publicarse en todas las interfaces.
- El puerto **`9090`** (Prometheus) y **`3001`** (Grafana), con profile `observability`, quedan bound a **`127.0.0.1`**; no son necesarios para el flujo diario del taller.
- El volumen **`mecatrack_pg_data`** es crítico: ahí persisten los datos reales aunque el contenedor de PostgreSQL se reinicie o se recree.
- La API depende de PostgreSQL con validación de salud, pero el frontend solo depende del contenedor `api` a nivel de arranque; por ello, un fallo del backend impacta inmediatamente las rutas `/api` aunque el frontend siga respondiendo HTML.
- El **seed de desarrollo no forma parte del arranque productativo**; datos demo solo vía comandos explícitos (`db:seed:dev`) fuera de `NODE_ENV=production`.

### **2.5. Seguridad**

MecaTrack combina una línea base de autenticación/autorización del MVP con un **endurecimiento posterior a auditoría** (informe `reporteDeSeguridad.md`, historias `us/seguridad/US-010` … `US-014`). El enfoque sigue siendo el de un sistema interno de taller: tokens, RBAC, validación de entrada y restricciones sobre rutas y operaciones sensibles, con mitigaciones explícitas sobre bootstrap, secretos, exposición de base de datos, revocación de sesión y endurecimiento HTTP/runtime.

#### Hallazgos de auditoría y mitigaciones implementadas

| ID auditoría | Riesgo | Mitigación (estado) |
|--------------|--------|---------------------|
| Seed automático en arranque de API (credenciales conocidas) | Crítico | **US-010:** entrypoint sin seed; seed solo en desarrollo; bootstrap de admin opt-in y solo si la tabla `User` está vacía |
| Postgres expuesto + credenciales triviales | Alto | **US-011:** bind `127.0.0.1`, password rotado/inyectado por `.env`, sin literales débiles en compose prod |
| JWT con fallbacks predecibles en compose | Alto | **US-011:** secretos obligatorios `${VAR:?…}`; validación fail-fast en arranque (`validate-environment`) |
| Scripts destructivos sin salvaguardas / reset de admin | Alto | **US-013:** bloqueo si `NODE_ENV=production`; exige `ALLOW_DESTRUCTIVE_DB_OPS=true` y `--confirm`; ya no resetea a `AdminPass123` |
| Access token válido tras desactivar / sin rotación de refresh | Alto | **US-012:** `sessionVersion` + chequeo en `JwtStrategy`; refresh rota en cada `/auth/refresh` |
| Login de inactivos con mensaje distinto / headers / root en contenedor | Medio | **US-014:** inactive → mismo `401` genérico; `helmet`; imagen API como usuario `nestjs` |

Artefactos de referencia: `reporteDeSeguridad.md`, `us/seguridad/`, `docs/plans/US-010_*` … `US-014_*`, ejemplo endurecido `docker-compose.production.example.yml`.

#### Controles actuales

| Mecanismo | Implementación actual | Qué protege / cómo se aplica |
|-----------|------------------------|-------------------------------|
| **Autenticación** | JWT de acceso (`15m`) + refresh (`7d`) | Login con email/contraseña; `accessToken` en Bearer y `refreshToken` en cookie |
| **Gestión de sesión** | Cookie `httpOnly`, `sameSite: strict`, path `/api/auth` | Limita exposición del refresh al JS del navegador |
| **Rotación de refresh** | Nuevo refresh en cada `POST /api/auth/refresh` | El cookie anterior queda inválido (reuso → `401`) |
| **Revocación inmediata** | Campo `User.sessionVersion` en el JWT y re-chequeo en DB | Logout y desactivación incrementan la versión; `JwtStrategy` rechaza tokens stale, usuarios inactivos o ausentes, y usa el **rol actual** de la BD |
| **Access token en frontend** | Solo en memoria | Evita persistir el JWT en `localStorage` / `sessionStorage` |
| **Contraseñas** | Hash `bcrypt` | Sin texto plano; comparación en login |
| **Autorización** | RBAC `ADMIN` / `MECHANIC` | `JwtAuthGuard` + `RolesGuard`; UI con `ProtectedRoute` |
| **Validación de entrada** | `ValidationPipe` global | `whitelist`, `forbidNonWhitelisted`, DTOs |
| **Rate limiting** | `ThrottlerGuard` en login | **5** intentos / **15** minutos (prod/test) |
| **Cuentas inactivas** | `active` en login + en cada request protegido | Login falla como credenciales inválidas (`401`); requests con token stale → `401` |
| **Mensajes de login** | Respuesta genérica + UI alineada | Wrong password e inactive no distinguen al atacante (US-014) |
| **Configuración segura** | `validateEnvironmentFromProcessEnv()` | En `NODE_ENV=production` exige JWT ≥32 chars, sin placeholders, y rechaza passwords DB triviales |
| **Headers HTTP** | `helmet` | `X-Frame-Options`, `nosniff`, COOP/CORP, etc.; HSTS solo si `ENABLE_HSTS=true` (HTTPS) |
| **Runtime del contenedor API** | Usuario no-root `nestjs` | Reduce impacto de un compromiso del proceso Node |
| **Operaciones destructivas** | Guards en `destructive-db-ops` | Impiden wipe accidental de prod |
| **Errores HTTP** | `HttpExceptionFilter` | Formato uniforme `400` / `401` / `403` / `409` / `429` |

#### Cómo se combinan frontend y backend

El backend firma el JWT con `JWT_ACCESS_SECRET`, valida expiración **y estado de sesión en base de datos**, compara contraseñas con `bcrypt`, guarda el hash del refresh token, rota ese refresh en cada renovación y comprueba roles (desde DB) en endpoints protegidos. El frontend limita la navegación por rol, redirige a login sin sesión y, ante un `401`, intenta un único `POST /api/auth/refresh` con cookie; si falla, limpia estado local y redirige a `/login?session=expired`.

Aunque un usuario fuerce una URL manualmente, la API sigue siendo la autoridad final sobre autenticación y permisos.

#### Sesión y renovación de acceso

La sesión activa tiene dos piezas: `accessToken` (**15 minutos**, Bearer) y `refreshToken` (**7 días**, cookie `httpOnly`). El payload del access incluye `sessionVersion`. Al renovar, la API emite access + refresh nuevos y actualiza la cookie. Si la renovación falla (revocado, reusado, usuario inactivo), el frontend limpia sesión y muestra el aviso de sesión expirada.

El refresh no se guarda en claro: se persiste el hash SHA-256 y su expiración. Logout y desactivación **limpian el refresh y suben `sessionVersion`**, de modo que ni refresh ni access previos siguen siendo aceptados.

#### Bootstrap, seed y secretos de despliegue

- **Producción:** migrate (+ bootstrap admin solo con flag explícito y tabla vacía); nunca seed de demo en el entrypoint.
- **Desarrollo:** `npm run db:seed:dev` / `prisma db seed` fuera de `NODE_ENV=production`; re-seed preserva `passwordHash` de usuarios ya existentes.
- **Secretos prod:** obligatorios vía `.env` del host (`JWT_*`, `POSTGRES_*`); sin valores `mecatrack-docker-…` ni placeholders `change-me-…`.
- Referencia de compose endurecido: `docker-compose.production.example.yml` (el compose vivo de Despliegues debe seguir el mismo modelo).

#### Consideraciones y límites remanentes

- El rate limiting reforzado sigue centrado en **login**; no hay throttle global en todos los endpoints.
- La cookie `secure` se activa con `NODE_ENV=production`; en despliegues solo-HTTP locales puede requerir `COOKIE_SECURE=false` consciente hasta disponer de HTTPS.
- HSTS está **apagado por defecto** (`ENABLE_HSTS`); conviene activarlo únicamente detrás de TLS real.
- Un cambio de **rol** vía un futuro endpoint de edición de usuarios (D6) deberá incrementar `sessionVersion` igual que la desactivación.
- CORS sigue amarrado a `CORS_ORIGIN` con credenciales: debe coincidir con la URL pública del front.
- Mejoras deseables posteriores: secretos en vault, Postgres solo en red interna Docker, MFA, rate limit configurable y endpoint de edición de usuarios con revocación de sesión.

La estrategia de pruebas de MecaTrack combina **pruebas unitarias**, **pruebas end-to-end del backend** y **pruebas end-to-end del frontend** para validar tanto las reglas de negocio aisladas como los flujos completos del MVP. La cobertura está organizada por capas: Jest se utiliza en la API para servicios y contratos HTTP, mientras que Playwright valida el comportamiento real de la aplicación web desde la perspectiva del usuario.

| Nivel de prueba | Herramienta | Ubicación principal | Qué valida |
|-----------------|-------------|----------------------|------------|
| **Unitarias backend** | Jest | `apps/api/src/**/**.spec.ts` | Reglas de negocio, validaciones, transiciones de estado, normalización de datos y respuestas de servicios |
| **E2E backend** | Jest + Supertest | `apps/api/test/*.e2e-spec.ts` | Endpoints reales de la API, autenticación, autorización, persistencia y flujos HTTP completos contra la aplicación NestJS |
| **E2E frontend** | Playwright | `apps/web/e2e/*.spec.ts` | Flujos de usuario en navegador: login, navegación por rol (incl. menú hamburguesa móvil US-F1), formularios, órdenes de trabajo, entrega e historial |

#### Cobertura actual por capa

En el **backend**, las pruebas unitarias cubren módulos y servicios clave como `auth`, `users`, `clients`, `vehicles`, `history`, `delivery` y `work-orders`, además de utilidades de dominio como el cálculo de totales de órdenes de trabajo. Este nivel valida reglas críticas del negocio, por ejemplo: evitar correos duplicados, impedir la auto-desactivación del último administrador, exigir costos al completar tareas, bloquear edición de órdenes cerradas y mantener coherencia en la selección de mecánicos o propietarios.

Las **pruebas end-to-end del backend** ejercitan la API NestJS con la aplicación real inicializada, `ValidationPipe`, filtros HTTP y persistencia contra PostgreSQL. Las suites actuales cubren autenticación (`auth.e2e-spec.ts`), gestión de usuarios, clientes y vehículos, creación de órdenes de trabajo, gestión de tareas, notas técnicas, panel de entrega e historial. Con ello se validan respuestas HTTP, restricciones por rol, estados de sesión, mensajes de error, payloads de entrada y continuidad entre operaciones encadenadas.

En el **frontend**, Playwright valida el comportamiento funcional de la interfaz Next.js desde la perspectiva del usuario final. Las suites cubren autenticación, usuarios, clientes, vehículos, creación de órdenes de trabajo, gestión de tareas, notas técnicas, panel de entrega, historial y navegación responsive (`mobile-nav.spec.ts`, US-F1). Estas pruebas confirman redirecciones por rol, mensajes de error, bloqueo de accesos, navegación entre pantallas (barra horizontal en desktop y drawer hamburguesa en viewport estrecho), formularios con datos reales y flujos completos como registrar un vehículo, crear una orden de trabajo, completar tareas o consultar historial.

#### Organización y ejecución de las suites

La API usa los scripts `npm test` para unitarias y `npm run test:e2e` para pruebas end-to-end. Las suites E2E del backend emplean `jest-e2e.json`, levantan la aplicación NestJS con su configuración real y preparan la base de datos de prueba ejecutando `prisma migrate deploy` y `prisma db seed` antes de correr los casos.

El frontend usa `npm run test:e2e` con Playwright. La configuración define proyectos separados por dominio (`chromium-admin`, `chromium-clients`, `chromium-vehicles`, `chromium-work-orders`, `chromium-work-order-tasks`, `chromium-technical-notes`, `chromium-delivery-panel`, `chromium-history`, `chromium-mobile-nav`) y utiliza `globalSetup` para sembrar datos, además de archivos `storageState` distintos para sesiones de administrador y mecánico en la mayoría de proyectos. El servidor web se inicia automáticamente con `webServer` (`next dev` en el puerto `3010`) cuando es necesario. Detalle del shell responsive: [`apps/web/README.md`](apps/web/README.md) (sección *Responsive navigation*) y [`docs/responsive-navigation.md`](docs/responsive-navigation.md).

#### Pruebas de regresión

Para reducir regresiones al introducir nuevas funcionalidades, el proyecto ya permite una estrategia incremental basada en las suites existentes. El enfoque recomendado es ejecutar primero las **unitarias del módulo afectado**, después la **suite E2E del backend** relacionada con ese flujo y finalmente el **proyecto Playwright** correspondiente a la superficie UI impactada. Por ejemplo, un cambio en órdenes de trabajo debería validar al menos `work-orders`, `work-order-tasks`, `technical-notes` y, si afecta cierre de órdenes, también `delivery` o `history`.

Como validación de regresión amplia antes de integrar cambios mayores, conviene correr el conjunto completo de pruebas del backend y las suites Playwright principales del frontend. Esta combinación aporta confianza sobre compatibilidad entre autenticación, roles, formularios, endpoints y reglas de negocio compartidas entre módulos.

#### Limitaciones y consideraciones actuales

- La cobertura es sólida sobre el **MVP funcional** (US-001 a US-009), pero no implica cobertura exhaustiva de cada combinación posible de errores o datos extremos.
- Las pruebas E2E dependen de una base de datos accesible y de semillas consistentes; por tanto, el entorno debe mantenerse alineado con migraciones y datos de prueba.
- Playwright cubre los flujos más importantes por dominio y un smoke de nav responsive (US-F1), pero no sustituye pruebas exploratorias manuales sobre UX fina, tablas densas en móvil u otros comportamientos visuales fuera de los casos automatizados.
- La regresión completa del sistema requiere coordinar backend, base de datos y frontend, por lo que el costo de ejecución es mayor que el de las pruebas unitarias aisladas.

---

## 3. Modelo de Datos

El modelo relacional de MecaTrack está diseñado en PostgreSQL y gestionado con Prisma. Consolida las entidades definidas en las historias de usuario US-001 a US-009, con campos adicionales preparados para extensiones V2 (D1–D8) sin cambios estructurales.

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
        int sessionVersion "DEFAULT 0, US-012"
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
| `canActAsMechanic` | Boolean | NOT NULL, DEFAULT `false` | V2 (D8): si `ADMIN`, permite listarlo y asignarlo como mecánico de OT; ignorado/redundante en `MECHANIC` |
| `active` | Boolean | NOT NULL, DEFAULT `true` | `false` impide login y falla requests protegidos; conserva historial |
| `sessionVersion` | Int | NOT NULL, DEFAULT `0` | Versión de sesión en el JWT; se incrementa en logout/desactivación (US-012) |
| `refreshTokenHash` | String | NULL | Hash del refresh token vigente |
| `refreshTokenExpiresAt` | DateTime | NULL | Expiración del refresh token |
| `createdAt` | DateTime | NOT NULL | Alta del registro |
| `updatedAt` | DateTime | NOT NULL | Última modificación |

**Relaciones:** crea OT (`createdById`), puede ser mecánico asignado (`assignedMechanicId`; en V2 también admins con `canActAsMechanic`), contacta propietario en V2 (`ownerContactedById`), excluye vehículo de recordatorios en V2 (`excludedById`).

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

La API de MecaTrack se expone como un backend REST bajo el prefijo `/api` y cubre el flujo completo del MVP (autenticación, usuarios, clientes, vehículos, órdenes de trabajo, tareas, entrega e historial) más endpoints de **operaciones** para salud y métricas (US-O1 / US-O2). La documentación OpenAPI del proyecto está separada por dominio para mantener cada módulo autocontenido y facilitar su evolución independiente. Resumen técnico en inglés: [`docs/observability.md`](docs/observability.md).

### Especificaciones OpenAPI disponibles

| Archivo | Dominio cubierto | Endpoints principales |
|---------|------------------|-----------------------|
| `docs/api-spec.auth.yml` | Autenticación | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| `docs/api-spec.users.yml` | Gestión de usuarios | `GET /users`, `POST /users`, `PATCH /users/{id}/deactivate` |
| `docs/api-spec.clients.yml` | Clientes | `GET /clients/search`, `POST /clients`, `GET/PATCH /clients/{id}` |
| `docs/api-spec.vehicles.yml` | Vehículos | `GET /vehicles/search`, `POST /vehicles`, `GET/PATCH/DELETE /vehicles/{id}` |
| `docs/api-spec.work-orders.yml` | Órdenes de trabajo, tareas y notas técnicas | `POST /work-orders`, `GET /work-orders/{id}`, `POST/PATCH /work-orders/{id}/tasks`, `PATCH /work-orders/{id}/visit-notes` |
| `docs/api-spec.delivery.yml` | Entrega | `GET /delivery/ready`, `GET /delivery/ready/{workOrderId}`, `PATCH /delivery/ready/{workOrderId}/deliver` |
| `docs/api-spec.history.yml` | Historial | `GET /vehicles/{vehicleId}/history`, `GET /clients/{clientId}` |
| `docs/api-spec.health.yml` | Salud (ops) | `GET /health/live`, `GET /health/ready` |
| `docs/api-spec.metrics.yml` | Métricas (ops) | `GET /metrics` |

### Endpoints representativos del MVP

Aunque el proyecto dispone de documentación detallada por dominio, los siguientes tres endpoints resumen bien el flujo central del sistema: autenticación, creación de una orden de trabajo y consulta del historial técnico.

#### 1. Autenticación de usuario

- **Método:** `POST`
- **Ruta:** `/api/auth/login`
- **Propósito:** valida credenciales, entrega un `accessToken` JWT y emite el `refreshToken` en cookie `httpOnly`.
- **Contexto de uso:** punto de entrada obligatorio para administradores y mecánicos.

**Ejemplo de request**

```json
{
  "email": "user@taller.com",
  "password": "Usuario123"
}
```

**Ejemplo de response**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "bb42fa72-c22d-4c88-9cc4-aa73e95cb264",
    "email": "admin@taller.com",
    "fullName": "Workshop Admin",
    "role": "ADMIN"
  }
}
```

**Notas relevantes**

- `401 Unauthorized`: credenciales inválidas.
- `403 Forbidden`: cuenta inactiva.
- `429 Too Many Requests`: demasiados intentos de login.

#### 2. Creación de orden de trabajo

- **Método:** `POST`
- **Ruta:** `/api/work-orders`
- **Propósito:** crea una orden de trabajo con sus tareas iniciales en una sola transacción, tomando una instantánea del propietario actual del vehículo.
- **Contexto de uso:** flujo principal de ingreso del vehículo al taller; accesible para `ADMIN` y `MECHANIC`.

**Ejemplo de request**

```json
{
  "vehicleId": "1f0d9710-c9fd-4fae-8ce7-4a72e91f7fcb",
  "entryReason": "Revisión general del vehículo",
  "mileage": 45000,
  "assignedMechanicId": "7daf14b6-6de4-4c4b-8ac6-05b6ad8c33ab",
  "initialTasks": [
    {
      "description": "Cambio de aceite"
    }
  ]
}
```

**Ejemplo de response**

```json
{
  "id": "9a54db58-4f77-46e4-9857-cf5afdb43f5d",
  "status": "EN_PROCESO",
  "entryReason": "Revisión general del vehículo",
  "mileage": 45000,
  "totalAmount": 0,
  "vehicle": {
    "licensePlate": "WO123456",
    "brand": "Toyota",
    "model": "Yaris"
  },
  "owner": {
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789"
  },
  "tasks": [
    {
      "id": "0f6f5352-5985-4b6d-95e8-0eb1b854db0c",
      "description": "Cambio de aceite",
      "status": "PENDING",
      "sortOrder": 0
    }
  ]
}
```

**Notas relevantes**

- `409 Conflict`: el vehículo ya tiene una orden activa (`activeWorkOrderId` en la respuesta).
- `400 Bad Request`: mecánico inválido, vehículo sin propietario activo o validación fallida.
- `404 Not Found`: vehículo inexistente.

#### 3. Consulta de historial del vehículo

- **Método:** `GET`
- **Ruta:** `/api/vehicles/{vehicleId}/history`
- **Propósito:** devuelve la línea de tiempo completa de visitas del vehículo, incluyendo tareas, notas técnicas, montos cobrados y propietario al momento de cada visita.
- **Contexto de uso:** soporte a diagnósticos posteriores, revisión de antecedentes y trazabilidad de reparaciones; accesible para `ADMIN` y `MECHANIC`.

**Ejemplo de response**

```json
{
  "vehicleId": "1f0d9710-c9fd-4fae-8ce7-4a72e91f7fcb",
  "licensePlate": "ABC123",
  "vehicleLabel": "Toyota Corolla 2018",
  "currentOwner": {
    "id": "a4a8f84a-2f63-4f97-89cb-8f1a963ea1d2",
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789"
  },
  "visits": [
    {
      "workOrderId": "9a54db58-4f77-46e4-9857-cf5afdb43f5d",
      "checkedInAt": "2026-06-28T20:12:00.000Z",
      "status": "ENTREGADA",
      "statusLabel": "Entregada",
      "entryReason": "Revisión general del vehículo",
      "mileage": 45000,
      "totalAmount": 35000,
      "ownerAtVisit": {
        "id": "a4a8f84a-2f63-4f97-89cb-8f1a963ea1d2",
        "fullName": "Juan Pérez",
        "nationalId": "1-2345-6789"
      },
      "visitNotes": {
        "visitDiagnosis": "Cambio preventivo por mantenimiento",
        "visitRepairSummary": "Aceite y filtro reemplazados"
      },
      "tasks": [
        {
          "description": "Cambio de aceite",
          "status": "COMPLETED",
          "cost": 35000
        }
      ]
    }
  ],
  "total": 1
}
```

**Notas relevantes**

- `404 Not Found`: vehículo inexistente.
- La respuesta es de solo lectura y representa el historial persistido por visitas.

### Cómo esta API soporta el flujo del MVP

En conjunto, la API permite cubrir el recorrido principal del sistema: un usuario se autentica, registra o selecciona clientes y vehículos, crea una orden de trabajo, agrega y completa tareas, mueve la orden al panel de entrega y finalmente consulta el historial resultante del vehículo o del cliente. La separación de especificaciones por dominio facilita que cada historia de usuario del MVP tenga su contrato API claramente identificable sin perder coherencia global.

---

## 5. Historias de Usuario

---

### Observabilidad (US-O1 … US-O5)

Epic de operaciones (Prometheus / Grafana). Historias enriquecidas y criterios detallados:

[`us/monitoreo y observabilidad/`](us/monitoreo%20y%20observabilidad/) · resumen técnico: [`docs/observability.md`](docs/observability.md) · guía Compose: [`infra/observability/README.md`](infra/observability/README.md)

| ID | Título | Entrega |
|----|--------|---------|
| US-O1 | Health (liveness / readiness) | `GET /api/health/live`, `GET /api/health/ready` |
| US-O2 | Métricas Prometheus | `GET /api/metrics` + RED HTTP |
| US-O3 | Prometheus en Compose | Profile `observability`, scrape `api:4000` |
| US-O4 | Dashboards Grafana | UI `127.0.0.1:3001`, dashboard API Overview |
| US-O5 | Alertas básicas | Reglas Prometheus + runbook |

**Roles:** Operador / desarrollador de despliegue | **Prioridad:** Alta (ops)

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
**quiero** buscar, registrar y editar clientes en el sistema,
**para** asociarlos a vehículos y órdenes de trabajo con datos de contacto actualizados.

**Criterios de Aceptación:**
- El formulario incluye: nombre completo, identificación, teléfono y correo electrónico.
- Los campos nombre completo e identificación son obligatorios en alta; teléfono y correo son opcionales.
- El sistema verifica que la identificación no esté ya registrada al crear; si existe, muestra el cliente encontrado en lugar de duplicar.
- El sistema permite buscar clientes existentes por nombre, identificación o teléfono antes de crear uno nuevo (búsqueda por correo electrónico prevista en V2 — D5).
- El administrador o mecánico puede **editar** nombre, teléfono y correo de un cliente existente; la identificación **no se modifica**.
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

Esta sección resume tres tickets técnicos representativos del desarrollo de MecaTrack. Se seleccionó un ticket de **backend**, uno de **frontend** y uno de **base de datos**, todos basados en funcionalidades reales del MVP ya implementado. El objetivo es que cada ticket sirva como especificación de trabajo ejecutable, no solo como descripción funcional.

### **Ticket 1 — Backend: US-002 User Management**

- **Tipo:** Backend
- **Título:** Implementar gestión de usuarios solo para administradores
- **Objetivo:** Exponer endpoints seguros para listar usuarios, crear cuentas de empleados y desactivar cuentas sin eliminar historial operativo.
- **Contexto:** Tras completar la autenticación (US-001), el sistema necesitaba una capa administrativa para controlar qué empleados pueden acceder al taller digital y con qué rol. El ticket debía reutilizar la infraestructura de JWT, guards y modelo `User` ya existente.
- **Alcance:**
  - `GET /api/users`
  - `POST /api/users`
  - `PATCH /api/users/:id/deactivate`
  - validación de DTOs y respuestas tipadas
  - revocación de refresh tokens al desactivar
- **Fuera de alcance:**
  - edición de usuarios
  - reactivación de cuentas
  - eliminación física
  - reseteo de contraseña
- **Requisitos funcionales y técnicos:**
  - solo `ADMIN` puede acceder a la gestión de usuarios
  - el listado debe devolver activos e inactivos
  - no se puede registrar un email duplicado
  - no se puede desactivar la propia cuenta
  - no se puede desactivar al último administrador activo
  - la respuesta nunca debe exponer `passwordHash` ni tokens
  - la desactivación debe invalidar la sesión renovable del usuario
- **Criterios de aceptación:**
  - un administrador autenticado puede listar usuarios y ver estado/rol
  - un administrador puede crear un usuario `ADMIN` o `MECHANIC`
  - un mecánico recibe `403` si intenta usar estos endpoints
  - al desactivar, el usuario queda con `active = false`
  - un usuario inactivo no puede volver a iniciar sesión
- **Componentes / archivos impactados:**
  - `apps/api/src/modules/users/users.module.ts`
  - `apps/api/src/modules/users/users.controller.ts`
  - `apps/api/src/modules/users/users.service.ts`
  - `apps/api/src/modules/users/dto/create-user.dto.ts`
  - `apps/api/src/modules/users/dto/user-response.dto.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/test/users.e2e-spec.ts`
  - `apps/api/src/modules/users/users.service.spec.ts`
- **Plan de implementación a alto nivel:**
  1. Definir DTOs y mapping de respuesta.
  2. Crear `UsersService` con reglas de negocio (email único, no self-deactivate, protección del último admin).
  3. Exponer controlador protegido por `JwtAuthGuard` + `RolesGuard`.
  4. Integrar el módulo en `AppModule`.
  5. Añadir pruebas unitarias y E2E.
- **Estrategia de pruebas:**
  - unitarias de servicio para reglas críticas
  - E2E de API para roles, conflictos, validación y desactivación real
- **Dependencias, riesgos y consideraciones:**
  - depende de US-001 (auth, JWT, roles)
  - la desactivación revoca refresh token y sube `sessionVersion`, invalidando también el access token de inmediato (US-012)
  - cualquier cambio futuro de roles o edición de usuarios debe respetar la regla del último admin

### **Ticket 2 — Frontend: US-008 Delivery Panel**

- **Tipo:** Frontend
- **Título:** Implementar panel administrativo de vehículos listos para entrega
- **Objetivo:** Permitir que el administrador vea en una sola pantalla las órdenes en estado `LISTA_PARA_ENTREGA`, consulte el detalle de cobro y marque un vehículo como entregado.
- **Contexto:** Después de crear órdenes de trabajo y completar tareas (US-005 y US-006), faltaba una interfaz operativa para cerrar el ciclo en la recepción del taller. El panel debía ser exclusivo para administradores y mostrar información útil sin obligar a entrar al detalle de cada OT.
- **Alcance:**
  - ruta `/admin/delivery`
  - tabla con órdenes listas para entrega
  - columna visible de teléfono del propietario
  - expansión de fila con detalle de tareas y total
  - confirmación para marcar como entregada
  - actualización manual y polling opcional
- **Fuera de alcance:**
  - contacto al propietario (D1)
  - envío de correo (D2)
  - acceso de mecánicos
  - tiempo real con WebSockets
- **Requisitos funcionales y técnicos:**
  - acceso restringido a `ADMIN`
  - lista alimentada desde React Query
  - proxy de llamadas vía `apiClient`
  - feedback visual para carga, vacío, error y éxito
  - invalidación/refresco de caché tras entregar
  - detalle expandible sin navegación extra
- **Criterios de aceptación:**
  - el administrador ve la tabla con placa, modelo, propietario, teléfono y total
  - si el propietario tiene teléfono, se muestra link `tel:`
  - si no tiene teléfono, se muestra “Sin teléfono”
  - al marcar como entregada, la orden desaparece de la lista
  - un mecánico no puede acceder y termina en `/403`
- **Componentes / archivos impactados:**
  - `apps/web/src/app/admin/delivery/page.tsx`
  - `apps/web/src/features/delivery-panel/components/DeliveryPanelPage.tsx`
  - `apps/web/src/features/delivery-panel/components/DeliveryReadyTable.tsx`
  - `apps/web/src/features/delivery-panel/components/DeliveryReadyDetail.tsx`
  - `apps/web/src/features/delivery-panel/components/OwnerPhoneCell.tsx`
  - `apps/web/src/features/delivery-panel/components/MarkDeliveredDialog.tsx`
  - `apps/web/src/features/delivery-panel/hooks/*.ts`
  - `apps/web/src/features/delivery-panel/services/deliveryApi.ts`
  - `apps/web/src/shared/components/RoleNav.tsx`
  - `apps/web/e2e/delivery-panel.spec.ts`
- **Plan de implementación a alto nivel:**
  1. Definir tipos del dominio `delivery-panel`.
  2. Implementar capa de servicios y hooks con React Query.
  3. Construir componentes de tabla, detalle expandible y diálogo de confirmación.
  4. Registrar la ruta bajo layout admin y navegación.
  5. Validar el flujo con Playwright.
- **Estrategia de pruebas:**
  - Playwright para flujos admin: abrir panel, ver teléfono, expandir detalle, marcar entregado
  - pruebas manuales de estados de carga, vacío y error
- **Dependencias, riesgos y consideraciones:**
  - depende de US-008 backend y de órdenes que ya hayan transitado a `LISTA_PARA_ENTREGA`
  - el polling debe ser opcional para no sobrecargar el backend
  - el panel usa snapshot del propietario registrado al ingreso, no necesariamente el contacto más reciente del cliente

### **Ticket 3 — Base de datos: Modelo relacional para órdenes de trabajo y tareas**

- **Tipo:** Database
- **Título:** Diseñar e implementar la migración de `WorkOrder` y `WorkOrderTask`
- **Objetivo:** Incorporar en PostgreSQL la estructura necesaria para registrar visitas al taller, tareas dinámicas, costos y estados operativos, preservando integridad referencial y soporte para extensiones futuras.
- **Contexto:** El sistema ya gestionaba usuarios, clientes y vehículos, pero aún no tenía una entidad que representara formalmente el ingreso del vehículo al taller ni el detalle granular del trabajo realizado. La base de datos debía soportar una OT activa por vehículo, tareas múltiples, costos por tarea, notas técnicas y el panel de entrega.
- **Alcance:**
  - enums `WorkOrderStatus` y `WorkOrderTaskStatus`
  - tabla `WorkOrder`
  - tabla `WorkOrderTask`
  - relaciones con `User`, `Client` y `Vehicle`
  - índices para búsquedas por estado y cronología
  - snapshot de propietario (`ownerClientId`)
  - soporte estructural para V2 (`OWNER_CONTACTED`, notas de visita)
- **Fuera de alcance:**
  - panel de recordatorios
  - transferencia de propietario D3
  - bitácora histórica de recordatorios
  - multi-tenant
- **Requisitos funcionales y técnicos:**
  - una OT debe pertenecer a un vehículo existente
  - una tarea debe pertenecer a una OT existente
  - `WorkOrderTask` debe borrarse en cascada si la OT se elimina
  - debe ser posible distinguir OT activas por `status`
  - el esquema debe permitir costos nulos hasta completar una tarea
  - las consultas por historial y entrega deben ser eficientes
- **Criterios de aceptación:**
  - migración aplicable con Prisma sin cambios manuales posteriores
  - tablas creadas con claves foráneas correctas
  - índices para `vehicleId + status`, `checkedInAt` y `workOrderId`
  - relaciones accesibles desde Prisma Client
  - el seed y los servicios pueden operar sobre el nuevo modelo
- **Componentes / archivos impactados:**
  - `apps/api/prisma/schema.prisma`
  - `apps/api/prisma/migrations/20260619160000_add_work_order_and_tasks/migration.sql`
  - `apps/api/prisma/seed.ts`
  - `apps/api/src/modules/work-orders/**`
  - `apps/api/src/modules/history/**`
- **Plan de implementación a alto nivel:**
  1. Extender `schema.prisma` con enums, modelos y relaciones.
  2. Generar migración versionada.
  3. Validar claves foráneas, `onDelete`, índices y nullable fields.
  4. Ajustar seed y servicios consumidores.
  5. Ejecutar migración sobre base limpia y verificar lectura/escritura desde Prisma.
- **Estrategia de pruebas:**
  - aplicar `prisma migrate deploy` en entorno de prueba
  - ejecutar seed y confirmar consistencia referencial
  - validar mediante E2E backend la creación de OTs, tareas, notas y transición a entrega
- **Dependencias, riesgos y consideraciones:**
  - depende del modelo previo de `User`, `Client`, `Vehicle` y `VehicleOwnership`
  - una mala definición de relaciones rompería historial, entrega y asignación de mecánicos
  - el valor `OWNER_CONTACTED` se reserva desde ahora para evitar refactors posteriores
  - la unicidad de “una sola OT activa por vehículo” se implementa en la capa de aplicación, no como constraint SQL directa

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1* https://github.com/LIDR-academy/AI4Devs-finalproject/pull/198*

**Pull Request 2* https://github.com/LIDR-academy/AI4Devs-finalproject/pull/301*

**Pull Request 3**

