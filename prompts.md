> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Model: Gemini 3
```markdown
# Rol
Eres un experto en Producto Digital en aplicaciones web para gestión de proyectos de construcción e interiorismo.

# Contexto
Quiero crear una plataforma web que permita una comunicación eficiente entre arquitectos o interioristas con los clientes de un proyecto de obra.
No es una plataforma para construir planos. 
Es una plataforma donde visualizar planos por capas, realizar comentarios sobre ellos en sitios específicos, adjuntar imágenes, subir nuevas versiones, y gestionar los accesos a dichos proyectos.
El objetivo es proporcionar una comunicación facil de propuestas y feedback entre arquitectos y clientes.

El problema que intenta mitigar esta web es que esta comunicación se realiza mediante correos con pdfs, no hay posibilidad de dar feedback ordenado y conciso, y no hay control de versiones.

# Tarea
Analiza estos requisitos para la construcción de un MVP. Crea una descripción del proyecto, objetivo y funcionalidades básicas donde aportar más valor.

Proporciona descripciones concisas.

Hazme todas las preguntas que necesites para realizar esta tarea.
```

**Resumen de la conversación:**

El asistente analizó la petición inicial y planteó preguntas clave para acotar el alcance técnico:
1. **Formato de archivos:** ¿PDF/Imágenes o DWG? -> Usuario selecciona PDF o Imágenes.
2. **Dispositivos:** ¿Desktop o Móvil/Tablet? -> Usuario prioriza Ordenador y Tablet.
3. **Concepto de Capas:** ¿Capas del archivo o superposición de imágenes? -> Usuario define "superposición" (Opción B).
4. **Modelo de Negocio:** ¿SaaS o pago por proyecto? -> Usuario propone "3 proyectos gratis" y pide consejo.

**Decisión final:**
Se acuerda un modelo de negocio **Freemium basado en "Slots de Proyectos Activos"** (3 gratis, suscripción para más capacidad) y una funcionalidad core de **Visor con Slider de Opacidad** para comparar propuestas superpuestas.

**Prompt 2:**

Hazme 10 propuestas de nombres para la aplicación, logos, estilos para imagen corporativa y paleta de colores. La plataforma debe transmitir una imagen profesional, seria, fresca y moderna.

**Resumen de la conversación:**

El asistente generó 10 propuestas de branding completas (Nombre, Concepto, Logo, Estilo y Paleta).
Entre las opciones (KLAR, TRACÉ, LAYER, VISO, COTA, ALIGN, ONPLAN, DRAFT, SYNCRO, STRUCT), el usuario seleccionó la opción 2.

**Identidad seleccionada: TRACÉ**
- **Concepto:** Evoca el "trazado" y el papel cebolla de arquitectura.
- **Estilo:** Editorial, minimalista y premium.
- **Paleta de Colores:** Negro Tinta (#000000), Amarillo Ocre (#F2E8C9) y Gris Cemento (#95A5A6).

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```markdown
# Rol 
Eres un experto arquitecto de software con especialidad en sistemas SaaS

# Contexto
Analiza los requisitos del proyecto.

# Tarea
Dame varias propuestas de arquitectura del sistema, analizando las ventajas y desventajas de cada uno para el proyecto, tanto para conseguir una solución rápida y mejorar el time-to-market, como para poder escalarlo en el futuro, más allá del mvp.

# Stack tecnológico
- Frontend: Vue 
- Backend: Node.js
- Base de datos relacional con sql. 
- Redis para la gestión de tokens de sesiones.
- Deployment: medianto docker con ci/cd en github

Dame las propuestas de forma precisa y resumida.
```

**Resumen de la respuesta:**
El asistente analizó el stack y los requisitos (especialmente el procesamiento de imágenes/planos) y propuso dos modelos:
1. **Monolito Modular:** Todo en un servidor Node.js. Rápido de desarrollar pero con riesgo de bloquear el "Event Loop" al procesar archivos pesados.
2. **Desacoplada con Workers:** API separada de los "Workers" de procesamiento, unidos por una cola Redis. Escalable y robusta.

**Recomendación:** Se optó por una **"Propuesta 2 Simplificada"** (Monorepo con despliegue de roles), donde el mismo código se despliega como API o como Worker según el comando de inicio, combinando simplicidad de gestión con rendimiento asíncrono.

**Prompt 2:**
Genera un archivo en la carpeta docs con la propuesta 2 simplificada. Incluye una descripción de cada módulo, un diagrama UML para mermaid, y un resumen general.
Crea este documento de forma precisa, clara y profesional.

**Resumen de la respuesta:**
El asistente generó el archivo `docs/architecture_proposal.md` detallando:
- **Frontend (Vue):** SPA.
- **Backend API (Node.js):** Gestión de usuarios y subidas "raw".
- **Worker Service (Node.js):** Procesamiento de fondo de PDFs a Imágenes.
- **Redis:** Cola de tareas y Pub/Sub para notificaciones.
- **Diagrama Mermaid:** Inicialmente se incluyó un diagrama de secuencia mostrando el flujo asíncrono.

**Prompt 3:**


### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```markdown
genera un archivo de doc de cada uno de los módulos de la arquitectura especificando la tecnología, objetivo y estructura que va a seguir.
Hazlo siguiendo las buenas prácticas de arquitectura para cada uno.
Hazme todas las preguntas que necesitas para realizar esta tarea
```

**Resumen de la respuesta:**
El asistente solicitó confirmación sobre cuatro puntos clave del stack tecnológico (Backend Framework, Frontend Framework, BD/ORM y Estringura de documentación).
Tras recibir las preferencias del usuario (1. Express Puro, 2. Nuxt, 3. PostgreSQL + Prisma, 4. Archivos independientes), se generaron cuatro documentos de especificación técnica bajo la carpeta `docs/modules/`:
- `frontend_nuxt.md`: Detalla el uso de Nuxt 3, Pinia, Tailwind y una arquitectura basada en "Composables" y "Atomic Design".
- `backend_api_express.md`: Define una arquitectura por capas (Controller-Service-Repository) sobre Express y TypeScript.
- `worker_service.md`: Especifica el pipeline de procesamiento de imágenes con BullMQ, Sharp y Redis.
- `database_infrastructure.md`: Describe el esquema relacional, el uso de Redis para colas/cache y la orquestación Docker.

**Prompt 2:**

```markdown
# Rol 

Eres un experto developer de backend en node.js y express.

# Tarea

Analiza los requisitos del proyecto y cambia la especificación de los módulos de backend api y worker service para seguir una arquitectura DDD.

Hazme todas las preguntas que necesites
```

**Resumen de la conversación:**

El asistente analizó la documentación existente y recomendó una transición hacia una arquitectura DDD con Adaptadores Hexagonales para mejorar la mantenibilidad y testabilidad.
Se propuso un modelo de "Monorepo con Shared Core" para compartir la lógica de dominio entre la API y el Worker.

**Puntos clave acordados:**
1.  **Arquitectura Hexagonal Estricta:** Eliminación de capas Controller-Service tradicionales en favor de Use Cases y Domain Entities.
2.  **Shared Core:** Creación de un paquete compartido (`packages/core`) con los Bounded Contexts (IAM, Collaboration, FileProcessing).
3.  **Inversión de Dependencias:** El Worker ahora ejecuta Casos de Uso del Dominio inyectando adaptadores de infraestructura específicos (ej: `GhostscriptPdfConverter`).

Tras la confirmación del usuario, se actualizaron los documentos `backend_api_express.md` y `worker_service.md` reflejando esta nueva estructura.

**Prompt 3:**
```markdown
# Rol 
Eres un experto arquitecto de software con especialidad en sistemas SaaS

# Contexto
Analiza los requisitos del proyecto del proyecto y la arquitectura propuesta.

# Tarea
Revisa la arquitectura propuesta para incluir los use-cases de:
- gestión y creación de usuarios
- gestión y creación de proyectos
- gestión y creación de acceso a los proyectos mediante invitación.
- gestión y creación de capas dentro de los proyectos
- gestión y creación de pins y comments de en capas.
```

**Resumen de la respuesta:**

El asistente analizó la documentación actual y actualizó los ficheros de definición de arquitectura para cubrir explícitamente los casos de uso solicitados:

1.  **En `database_infrastructure.md`**: Se añadieron las entidades `ProjectMember` (para gestión de permisos), `Invitation` (para invitaciones por email), y se refinó la entidad `Layer` para permitir composición de planos base y overlays.
2.  **En `backend_api_express.md`**: Se detallaron los **Use Cases** específicos dentro de los Bounded Contexts de IAM y Collaboration (ej: `InviteUserToProjectUseCase`, `AddLayerToPlanUseCase`), formalizando cómo se implementarán estas funcionalidades en la arquitectura DDD.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```markdown
eres un experto full stack en proyectos node y nuxt
genera un documento con las especificaciones de estructura de archivos y carpetas para este proyecto teniendo en cuenta:
- una carpeta frontend
- una carpeta backend
- una carpeta worker
- especificaciones de tecnologias usadas y librerias
- breve descripción de cada módulo y su arquitectura
- archivo docker
- variables de entorno
```

**Resumen de la respuesta:**
El asistente generó el archivo `docs/project_structure.md` que define la estructura física del proyecto bajo una estrategia de **Monorepo**.
Se estableció una organización clara:
- `apps/frontend`: Aplicación Nuxt 3 para la UI.
- `apps/backend`: API REST con Express y arquitectura Hexagonal.
- `apps/worker`: Servicio de procesamiento asíncrono con Node.js.
- `packages/core`: Paquete compartido con la lógica de Dominio (DDD) y Entidades.
Además, el documento incluye las especificaciones tecnológicas detalladas (Prisma, BullMQ, Sharp), la definición de los archivos `Dockerfile` (destacando las dependencias del sistema para el worker) y las variables de entorno para la configuración de la infraestructura.

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

```markdown
# Rol 

Eres un experto arquitecto de base de datos postgresql

# Tarea

Analiza los requisitos del proyecto y verifica la estructura de base de datos propuesta para seguir las prácticas recomendadas ACID y los campos necesarios para el tipo de entidades.

Genera un UML para mermaid con el modelo de datos de la base de datos.

Hazme todas las preguntas que necesites
```

**Resumen de la conversación:**

El asistente analizó la propuesta inicial de base de datos contenida en la documentación y sugirió mejoras críticas para garantizar integridad y escalabilidad:
- **UUIDs:** Reemplazo de IDs secuenciales por UUID v4 para seguridad.
- **Auditoría:** Inclusión de campos `created_at`, `updated_at` y `deleted_at` (Soft Delete).
- **Semántica:** Diferenciación clara entre "Hoja de Plano" (Concepto) y "Plan" (Versión del archivo).

Se realizaron preguntas de clarificación sobre la persistencia de pines entre versiones y el sistema de coordenadas.
Tras la respuesta del usuario (Pines ligados a versión estricta, Coordenadas %, MVP para suscripciones), el asistente generó un **Diagrama ER en Mermaid** definitivo y actualizó el archivo `docs/modules/database_infrastructure.md` con el esquema refinado.

**Prompt 2:**

Evalua si el status en la entidad Plan debería estar en la entidad Layer ya que el campo image se guarda en esta tabla

**Resumen de la conversación:**

El asistente evaluó la estructura de datos actual y confirmó que mover el estado de procesamiento de `Plan` a `Layer` es la decisión correcta por tres motivos:
1.  **Coherencia:** El resultado del procesamiento (`image_url`) vive en `Layer`, por lo que su estado también debería estar ahí.
2.  **Multicapa:** Permite que un plano tenga una capa base lista mientras se procesa una nueva capa superpuesta.
3.  **Granularidad:** Si falla una capa, no invalida todo el plano.

**Cambios realizados:**
- Se actualizó `docs/modules/database_infrastructure.md`.
- **Entidad Plan:** Se eliminó `status` y se añadió `lifecycle_status` ("DRAFT | ACTIVE | ARCHIVED").
- **Entidad Layer:** Se añadió `status` ("PENDING | PROCESSING | READY | ERROR").
- Se actualizó el diagrama Mermaid acorde a estos cambios.

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

Model: Gemini 3 (Preview)
```markdown
eres un experto desarrollador de backend en Node y APIs.

Añade la especificación de la API en formato OpenAPI para este proyecto en el documento de backend.
La API debe seguir las buenas prácticas REST de http methods, http status codes y gestión de errores.
Incluye información sobre los niveles de autenticación requeridos para cada llamada de la API en base al rol del User.
```

**Resumen de la conversación:**

Se solicitó generar la especificación técnica de la API en formato OpenAPI para incluirla en la documentación del módulo de backend.
El asistente analizó la documentación existente (historias de usuario y arquitectura) y actualizó el archivo `docs/modules/backend_api_express.md` insertando una definición YAML completa (OpenAPI 3.0.3).
La especificación incluye:
- Esquemas de seguridad (Bearer/JWT).
- Endpoints para IAM (Registro, Login).
- Endpoints para Gestión de Proyectos (CRUD con control de límites).
- Endpoints para Planos (Subida asíncrona).
- Endpoints de Colaboración (Pines y Comentarios).
- Definición de respuestas de error estándar y control de roles.

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

Model: Gemini 3
```markdown
# Rol 

Eres un experto product owner en proyectos de desarrollo SaaS.

# Tarea

Analiza los requisitos y objetivos del proyecto y crea las historias de usuario necesarias para implementar el MVP.

Utiliza la plantilla
`Como [tipo de usuario] quiero [realizar acción] para [valor generado]`

Incluye en cada historia:
- titulo breve
- descripción
- criterios de aceptación en formato Gherkin incluyendo edge-cases
- prioridad
- depedendencia de otras historias
- orden de ejecución
- estado (pending, done)

Genera un documento con cada user story dentro de una carpeta docs/user-stories.
Genera un documento resumen para una visión general de las historias y su estado en docs.

Hazme todas las preguntas que necesites para realizar esta tarea.
```

**Resumen de la respuesta:**

El asistente analizó la documentación existente (`mvp_specification.md` y `architecture_proposal.md`) para extraer los requisitos clave.
Generó un set completo de **7 Historias de Usuario** priorizadas para el MVP, cubriendo desde el registro hasta la funcionalidad core de comparación de planos.

**Entregables generados:**
1. **Estructura de carpetas:** Creación de `docs/user-stories/` con archivos individuales (ej: `US-001-RegistroAutenticacion.md`, `US-003-CargaPlanos.md`).
2. **Resumen:** Creación de `docs/user_stories_summary.md` actuando como tablero de estado del proyecto.
3. **Contenido:** Definición de criterios de aceptación Gherkin para flujos críticos como la conversión de planes en background (Worker) y el modelo Freemium de slots.

**Prioridad de implementación definida:**
Registro -> Gestión Proyectos -> Carga & Procesamiento -> Visor -> Acceso Invitado -> Colaboración -> Comparador.

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

Model: Gemini 3
```markdown
genera los tickets de trabajo de las historias de usuario y añadelas a cada documento, incluyendo:
- titulo
- tipo (feature, tech, ...)
- propósito
- especificaciones técnicas
- criterios de aceptación en formato gherkin
- equipo asignado
- esfuerzo
```

**Resumen de la respuesta:**

El asistente procesó cada archivo de Historia de Usuario existente (`US-001` a `US-007`) y añadió una sección técnica detallada de **Tickets de Trabajo**.
Se desglosaron las historias en tareas de Backend, Frontend y Workers.

**Ejemplos de tickets generados:**
- **[BACK-003] API Endpoints & Queue Producer:** Manejo de subida a S3 y encolado en Redis.
- **[WORKER-001] Procesador de Planos:** Servicio consumidor para conversión PDF -> Imagen.
- **[FRONT-007] Implementación Comparador de Opacidad:** Lógica de UI para superposición de capas.

Cada ticket incluye especificaciones técnicas concretas (endpoints, nombres de componentes, librerías sugeridas como `sharp` o `@panzoom/panzoom`) y estimación de esfuerzo en puntos.

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
