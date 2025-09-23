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
Jorge Antonio Pérez Moreno

### **0.2. Nombre del proyecto:**
Sistemas de búsqueda de especialidades médicas y profesionales de la salud (Buscadoc)    

### **0.3. Descripción breve del proyecto:**
El sistema de búsqueda de especialidades médicas y profesionales de la salud es una plataforma diseñada para facilitar la localización, comparación y contacto con especialistas médicos. El propósito principal es optimizar la experiencia de búsqueda y agendamiento de citas tanto para pacientes como para médicos, proporcionando información transparente y herramientas que permitan tomar decisiones informadas.
Además, el sistema gestiona direcciones detalladas de pacientes y médicos mediante las entidades LOCATION, CITY y STATE, permitiendo búsquedas y filtrados más precisos por ubicación.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
> https://github.com/rockeroicantonidev/AI4Devs-finalproject.git

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**
> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

#### Objetivos y metas

- Permitir a los usuarios buscar especialistas por especialidad, ubicación (dirección, ciudad y estado) y otros filtros relevantes.
- Facilitar la visualización de perfiles profesionales detallados, incluyendo información de ubicación.
- Ofrecer un proceso sencillo y eficiente para el agendamiento de citas.
- Integrar valoraciones y opiniones de pacientes para fomentar la confianza.
- Proveer notificaciones y recordatorios automáticos sobre citas y eventos importantes.
- Brindar herramientas de gestión para médicos y administradores del sistema, incluyendo la administración de direcciones.
- Garantizar una experiencia de usuario accesible y multiplataforma.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

El sistema está diseñado para satisfacer las necesidades de pacientes, médicos y administradores, ofreciendo las siguientes funcionalidades clave:

- **Búsqueda de especialistas:** Permite localizar médicos por especialidad y ubicación (dirección, ciudad y estado), con filtros adicionales relevantes.
- **Visualización de perfiles profesionales:** Muestra información detallada de los médicos, incluyendo datos de contacto, biografía, foto de perfil, título y cédula profesional.
- **Agendamiento de citas:** Los pacientes pueden reservar consultas con especialistas de manera sencilla y eficiente.
- **Valoraciones y opiniones:** Los pacientes pueden dejar opiniones y calificar a los médicos tras una consulta, fomentando la confianza.
- **Notificaciones y recordatorios:** El sistema envía avisos automáticos a pacientes y médicos sobre citas y eventos importantes.
- **Gestión de agenda para médicos:** Los médicos pueden administrar su disponibilidad, confirmar o rechazar citas y ver el listado de próximas consultas.
- **Gestión de usuarios:** El administrador puede crear, editar o eliminar cuentas de médicos y pacientes.
- **Gestión de especialidades y filtros:** El administrador mantiene actualizado el catálogo de especialidades, ubicaciones y otros filtros.
- **Monitoreo de actividad:** El administrador supervisa el funcionamiento general y la actividad relevante del sistema.
- **Soporte multilenguaje:** El sistema está preparado para operar en varios idiomas.
- **Gestión de direcciones:** Administración de direcciones detalladas de pacientes y médicos mediante entidades LOCATION, CITY y STATE.


### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

```mermaid
flowchart TD
    subgraph "Frontend (Vue.js + Vuetify)"
        F1[Portal Público]
        F2[Portal Paciente]
        F3[Portal Médico]
        F4[Panel Administración]
    end

    subgraph "Adapters de Entrada (Express.js)"
        API[API REST]
        AUTH[Autenticación]
    end

    subgraph "Aplicación (Casos de Uso)"
        CU1[Buscar especialistas]
        CU2[Agendar cita]
        CU3[Gestionar agenda]
        CU4[Valorar especialista]
        CU5[Gestión usuarios/especialidades]
        CU6["Editar perfil (incluye dirección)"]
    end

    subgraph "Core de Dominio"
        ENT["Entidades y Servicios de Dominio
            (Usuarios, Médicos, Pacientes,
            Especialidades, Citas, Valoraciones,
            Notificaciones, Ubicaciones,
            Catálogos de ciudades y estados)"]
    end

    subgraph "Adapters de Salida"
        DB[(Prisma + PostgreSQL)]
        EMAIL["Email (Nodemailer/SendGrid)"]
        STORAGE[Firebase Storage]
    end

    subgraph "Otros"
        I18N["Internacionalización (vue-i18n/backend)"]
        OAUTH["OAuth2 (Google/Outlook)"]
    end

    %% Relaciones
    F1-->|HTTP|API
    F2-->|HTTP|API
    F3-->|HTTP|API
    F4-->|HTTP|API

    API-->|Invoca|AUTH
    AUTH-->|JWT/OAuth2|API
    API-->|Invoca casos de uso|CU1
    API-->|Invoca casos de uso|CU2
    API-->|Invoca casos de uso|CU3
    API-->|Invoca casos de uso|CU4
    API-->|Invoca casos de uso|CU5
    API-->|Invoca casos de uso|CU6

    AUTH-->|OAuth2|OAUTH

    CU1-->|Usa|ENT
    CU2-->|Usa|ENT
    CU3-->|Usa|ENT
    CU4-->|Usa|ENT
    CU5-->|Usa|ENT
    CU6-->|Usa|ENT

    ENT-->|Repositorios|DB
    ENT-->|Notificaciones|EMAIL
    ENT-->|Archivos|STORAGE

    F1-->|Traducción|I18N
    F2-->|Traducción|I18N
    F3-->|Traducción|I18N
    F4-->|Traducción|I18N
```
[Referencia](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)

### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

#### Componentes del MVP

- **Core de Dominio:** Entidades y servicios para usuarios, médicos, pacientes, especialidades, citas, valoraciones, notificaciones y ubicaciones.
- **Aplicación (Casos de Uso):** Lógica de negocio para búsqueda, agendamiento, valoración, gestión de usuarios y edición de perfiles.
- **Frontend:** Portal público, panel de paciente, panel de médico y panel de administración, con soporte de internacionalización.
- **Backend:** API REST, autenticación, orquestadores de casos de uso, endpoints para gestión de direcciones y usuarios.
- **Almacenamiento:** Base de datos para usuarios, médicos, especialidades, citas, valoraciones y direcciones.
- **Notificaciones:** Envío de correos electrónicos y gestión de recordatorios.

#### Tecnologías usadas

- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, Nodemailer, JWT (jsonwebtoken), bcryptjs, dotenv, cors.
- **Frontend:** Vue.js, Vuetify, vue-i18n.
- **Almacenamiento de archivos:** Firebase Storage.
- **Internacionalización:** vue-i18n (frontend), preparado para i18n en backend.
- **Autenticación:** JWT y hash de contraseñas con bcryptjs.


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

La estructura recomendada sigue la arquitectura hexagonal:

```
/src/domain                # Entidades y servicios de dominio
/src/application           # Casos de uso
/src/adapters/in           # Adaptadores de entrada (API REST, controladores)
/src/adapters/out          # Adaptadores de salida (persistencia, email, storage)
/src/config                # Configuración y utilidades
/prisma                    # Archivos de modelo y migraciones
/docs                      # Documentación y planificación
```


### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

- **Gestión de credenciales y datos sensibles:** Uso de variables de entorno y archivos `.env` (excluidos del control de versiones).
- **Autenticación segura:** Implementación de JWT para autenticación y bcryptjs para hash de contraseñas.
- **Cumplimiento normativo:** Adherencia a la LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares) y normativas mexicanas de protección de datos personales.
- **Consentimiento y aviso de privacidad:** Registro y gestión del consentimiento informado de los usuarios, especialmente para datos sensibles.
- **Derechos ARCO:** Interfaces y procesos para que los usuarios ejerzan sus derechos de acceso, rectificación, cancelación y oposición.
- **Control de acceso:** Restricción de visualización de direcciones y datos sensibles solo a usuarios autorizados.
- **Seguridad de la información:** Encriptación, control de acceso, registros de actividad y pruebas de seguridad periódicas.
- **Transferencia y eliminación de datos:** Políticas de retención, eliminación segura y control de transferencias a terceros.


### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

```mermaid
erDiagram
    USER {
        int id PK "required"
        string first_name "required"
        string last_name "required"
        string email "required"
        string password_hash "required"
        string role "required, default: patient"
        datetime registration_date "required, default: now()"
        boolean active "required, default: true"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    DOCTOR {
        int id PK,FK "required"
        string license_number "required"
        string phone "optional"
        int location_id FK "required"
        string biography "optional"
        string photo_url "optional"
        boolean active "required, default: true"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    PATIENT {
        int id PK,FK "required"
        string phone "optional"
        date birth_date "optional"
        string gender "optional"
        int location_id FK "required"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    SPECIALTY {
        int id PK "required"
        string name "required"
        string description "optional"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    DOCTOR_SPECIALTY {
        int id PK "required"
        int doctor_id FK "required"
        int specialty_id FK "required"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    APPOINTMENT {
        int id PK "required"
        int patient_id FK "required"
        int doctor_id FK "required"
        datetime appointment_date "required"
        string status "required, default: pending"
        string reason "optional"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    RATING {
        int id PK "required"
        int patient_id FK "required"
        int doctor_id FK "required"
        int appointment_id FK "required"
        int score "required"
        string comment "optional"
        boolean anonymous "required, default: false"
        datetime rating_date "required, default: now()"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    NOTIFICATION {
        int id PK "required"
        int user_id FK "required"
        string message "required"
        string status "required, default: not_sent"
        datetime sent_at "optional"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }
    LOCATION {
        int id PK "required"
        string address "required"
        string exterior_number "required"
        string interior_number "optional"
        string neighborhood "required"
        string postal_code "required"
        int city_id FK "required"
        int state_id FK "required"
        string google_maps_url "optional"
        date created_at "required, default: now()"
        date updated_at "required, default: now()"
    }
    CITY {
        int id PK "required"
        string name "required" 
        int state_id FK "required"
    }
    STATE {
        int id PK "required"
        string name "required"
    }
    AVAILABILITY {
        int id PK "required"
        int doctor_id FK "required"
        int day_of_week "required"
        datetime start_time "required"
        datetime end_time "required"
        boolean is_available "required"
        datetime created_at "required, default: now()"
        datetime updated_at "required, default: now()"
    }

    USER ||--o| DOCTOR : has
    USER ||--o| PATIENT : has
    DOCTOR ||--o{ DOCTOR_SPECIALTY : has
    SPECIALTY ||--o{ DOCTOR_SPECIALTY : classified_as
    DOCTOR ||--o{ APPOINTMENT : attends
    PATIENT ||--o{ APPOINTMENT : schedules
    APPOINTMENT ||--o{ RATING : generates
    PATIENT ||--o{ RATING : writes
    DOCTOR ||--o{ RATING : receives
    USER ||--o{ NOTIFICATION : receives
    DOCTOR ||--|| LOCATION : has
    PATIENT ||--|| LOCATION : has
    LOCATION }o--|| CITY : "belongs to"
    LOCATION }o--|| STATE : "belongs to"
    CITY }o--|| STATE : "belongs to"
    DOCTOR ||--o{ AVAILABILITY : has

```
[Referencia](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

1. **USER**
   - Representa a cualquier usuario registrado en el sistema. Incluye datos personales, correo electrónico, contraseña (hash), rol (paciente, médico, administrador), estado de actividad y fechas de registro.

2. **DOCTOR**
   - Especialista médico vinculado a un usuario. Contiene información profesional como número de cédula, teléfono, ubicación (dirección), biografía y foto de perfil.

3. **PATIENT**
   - Paciente vinculado a un usuario. Incluye datos como teléfono, fecha de nacimiento, género y dirección.

4. **SPECIALTY**
   - Especialidad médica. Define el área de conocimiento o práctica de los médicos, con nombre y descripción.

5. **DOCTOR_SPECIALTY**
   - Relación entre médicos y especialidades. Permite que un médico tenga una o varias especialidades.

6. **APPOINTMENT**
   - Cita médica entre paciente y médico. Incluye fecha, estado, motivo y referencias a ambos usuarios.

7. **RATING**
   - Valoración realizada por un paciente sobre un médico tras una cita. Incluye puntuación, comentario, anonimato y fecha.

8. **NOTIFICATION**
   - Mensajes enviados a usuarios sobre eventos importantes (citas, recordatorios, etc.), con estado y fecha de envío.

9. **LOCATION**
   - Dirección física detallada de pacientes y médicos. Incluye calle, números, colonia, código postal, ciudad, estado y enlace a Google Maps.

10. **CITY**
    - Ciudad asociada a una dirección. Permite organizar y filtrar ubicaciones.

11. **STATE**
    - Estado asociado a una ciudad y dirección. Facilita la segmentación geográfica.

---
Estas entidades forman la base del sistema, permitiendo la gestión integral de usuarios, profesionales, citas, valoraciones y ubicaciones.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**
- Como **visitante**, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.

**Historia de Usuario 2**
- Como **paciente**, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

**Historia de Usuario 3**
- Como **médico especialista**, quiero gestionar mi agenda y disponibilidad, para organizar mis consultas y confirmar o rechazar citas.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**
```markdown
### 9.1 [Backend] Diseñar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes agendar una cita con un especialista, seleccionando fecha y hora disponibles.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `POST /api/appointments`) que reciba:
  - `doctor_id` (ID del especialista)
  - `patient_id` (ID del paciente, obtenido del token de autenticación)
  - `appointment_date` (fecha y hora solicitada)
  - `reason` (motivo de la consulta, opcional)
El endpoint debe validar que el paciente esté autenticado y que la fecha/hora estén disponibles en la agenda del especialista.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros permiten seleccionar especialista, fecha y hora.
- El endpoint requiere autenticación de paciente.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar la validación de disponibilidad.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con la gestión de agenda y disponibilidad del especialista.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para agendar cita con especialista.
```
**Ticket 2**
```markdown
### 15.2 [Frontend] Maquetar la vista de búsqueda de especialistas (formulario de filtros: especialidad, ciudad, estado)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista principal de búsqueda en Vue.js, permitiendo al usuario filtrar especialistas por especialidad, ciudad y estado.
- **Detalle específico:**  
Crear un formulario con los siguientes campos:
  - Select de especialidad (con datos del catálogo).
  - Select de ciudad y estado (con datos del catálogo).
  - Botón para ejecutar la búsqueda.
Maquetar el área de resultados para mostrar la lista de especialistas filtrados. Utilizar Vuetify para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de búsqueda está implementada y disponible en el frontend.
- El formulario permite seleccionar filtros y ejecutar la búsqueda.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de resultados está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los campos de filtro y el área de resultados se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Vuetify para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de búsqueda de especialistas.
```

**Ticket 3**
```markdown
## 3. Generar la migración de la base de datos para su ejecución (usando Prisma)

**Descripción detallada:**  
- **Propósito:**  
Definir y crear el esquema inicial de la base de datos PostgreSQL para Buscadoc, asegurando que todas las entidades y relaciones del modelo de datos estén correctamente representadas y listas para el desarrollo backend.
- **Detalle específico:**  
Utilizar Prisma para modelar las entidades principales (`USER`, `DOCTOR`, `PATIENT`, `SPECIALTY`, `DOCTOR_SPECIALTY`, `APPOINTMENT`, `RATING`, `NOTIFICATION`, `LOCATION`, `CITY`, `STATE`) y sus relaciones. Generar el archivo `schema.prisma` y ejecutar la migración inicial para crear las tablas en PostgreSQL.

**Criterios de aceptación:**  
- El archivo `schema.prisma` refleja fielmente el modelo de datos definido en la documentación.
- Se ejecuta la migración inicial sin errores y todas las tablas y relaciones se crean correctamente en la base de datos.
- Las claves primarias, foráneas y restricciones están correctamente implementadas.
- **Pruebas de validación:**  
  - Verificar la existencia de todas las tablas y relaciones en PostgreSQL.
  - Probar la inserción y consulta básica de datos en cada entidad.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración, Base de datos

**Comentarios y Notas:**  
Revisar el modelo de datos en `docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md` antes de generar la migración. Documentar cualquier ajuste necesario en el historial de cambios.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para migración inicial de base de datos con Prisma.
```

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

