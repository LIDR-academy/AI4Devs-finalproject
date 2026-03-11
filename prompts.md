> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
>
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto (Gem de google - rol PRODUCT MANAGER & LEAD SOLUTIONS ARCHITECT)

**Prompt 1:**
Crea un PRD para el siguiente proyecto:

Desarrollar un sistema web para la gestión de gastos en viajes con amigos. Imagina que planeas una excursión con un grupo de amigos; en cada salida, como una cena o una visita a un tour, los gastos deben dividirse equitativamente entre todos los miembros. Cada persona paga por lo que consume, generando la necesidad de hacer ajustes de cuentas para determinar cuánto debe o se le debe a cada persona. 
El objetivo es crear un sistema que facilite el control y la administración de estos gastos de manera transparente. El sistema permitirá gestionar los gastos de cada viaje, asegurando que todos los miembros del grupo puedan ver claramente cómo se dividen los costos y facilitando el proceso de saldar cuentas. 
Funciones del sistema: 
1. Pantalla de creación de cuenta: 
Los miembros del equipo podrán crear una cuenta proporcionando su correo electrónico, nombre y una contraseña. La contraseña debe tener un mínimo de 6 caracteres para ser válida. 
2. Pantalla de inicio de sesión (Login): 
Permitirá a los usuarios acceder al sistema ingresando su correo electrónico y contraseña. 
3. Pantalla de listado de viajes: 
Esta pantalla mostrará todos los viajes en los que el usuario esté involucrado. Además, permitirá crear un nuevo viaje o unirse a uno ya existente. El listado incluirá el ícono y el nombre de cada viaje. 
4. Unirse a un viaje existente: 
En el listado de viajes habrá un botón denominado "Unirse a un viaje". Al hacer clic en este botón, el usuario podrá unirse a un viaje existente mediante la introducción de un código. El sistema validará el código antes de permitir la incorporación del usuario al viaje. 
5. Pantalla de creación de viaje:
Para crear un viaje, el usuario deberá ingresar los siguientes datos:

- Nombre del viaje.
- Tipo de divisa (COP o USD).
- Lista de participantes, quienes serán añadidos mediante sus correos electrónicos registrados.

Un viaje puede incluir un máximo de 20 participantes. 
6. Pantalla de detalles del viaje:
Una vez creado el viaje, los participantes podrán registrar gastos. Para cada gasto, será necesario proporcionar:

- Título del gasto.
- Monto pagado.
- Participante que realizó el pago.
- Participantes entre los cuales se dividirá el gasto.

Los gastos se agruparán por fecha, mostrándose en orden descendente (desde el más reciente al más antiguo). Cada gasto incluirá la información del pagador, el monto y el título. Además, los participantes podrán ver:

- El total que han gastado individualmente.
- El total de gastos entre todos los participantes. 

7. Detalle de un gasto: 
Al hacer clic en cualquier gasto dentro de la pantalla de gastos, se mostrará un detalle con toda la información registrada durante su creación. 
8. Pantalla de saldos: 
Esta pantalla mostrará el saldo de cada participante. Además, contará con un botón "Equilibrar gastos", que calculará si un participante debe dinero o si le deben. Dependiendo del resultado, se indicará a quién se le debe o quién le debe al usuario.

**R/ Prompt 1:**
(FASE 1: DISCOVERY) El sistema detiene la generación automática, asume el rol de Consultor y genera 10 preguntas estratégicas para definir el alcance (Scope), modelo de negocio, reglas de validación y stack tecnológico.
Hola. Asumo el rol de Senior Principal Product Manager & Lead Solutions Architect.

He analizado tu solicitud inicial para el sistema de gestión de gastos de viajes. Tienes una base funcional sólida, clara y con requisitos bien definidos para un MVP (Producto Mínimo Viable). Sin embargo, para elevar esto a una especificación técnica profesional y asegurar que el desarrollo no encuentre bloqueos lógicos a mitad de camino, debo activar la FASE 1: DISCOVERY & SCOPING.

**STOP: FASE DE ANÁLISIS REQUERIDA**
Antes de redactar el PRD y los diagramas de arquitectura, necesito "curar" los requisitos para cerrar brechas lógicas críticas que he detectado en tu descripción.

Por favor, responde las siguientes 10 Preguntas Estratégicas para definir el alcance final:

1. **Contexto del Proyecto:** Mencionas "Entregas Programación para la WEB". ¿Este es un proyecto académico con fecha de entrega fija (donde priorizamos simplicidad) o un MVP para un producto real (donde priorizamos escalabilidad y seguridad)?

2. **Manejo de Usuarios No Registrados:** El requisito dice: "Lista de participantes, quienes serán añadidos mediante sus correos electrónicos registrados".
   - Problema: ¿Qué sucede si quiero viajar con un amigo que aún no se ha registrado en la app?
   - Opción A: El sistema bloquea la acción hasta que ese amigo se registre.
   - Opción B: Se permite agregar "usuarios fantasma" (temporales) que luego se vinculan cuando la persona real se registra.

3. **Algoritmo de "Equilibrar Gastos":**
   - ¿Buscas una visualización simple de "Quién debe a quién" (ej: Juan debe 10 a Pedro, y 5 a María)?
   - ¿O requieres un algoritmo de simplificación de deudas (ej: Si Juan debe 10 a Pedro, y Pedro debe 10 a María, el sistema le dice a Juan que le pague 10 directamente a María para ahorrar transacciones)?

4. **Gestión de Divisas (Complejidad):** Has definido COP y USD.
   - ¿Un viaje es estrictamente mono-divisa (todo se ingresa en la moneda base del viaje)?
   - ¿O permitiremos gastos multimoneda dentro de un mismo viaje (ej: Viaje en USD, pero pagué un taxi en COP) requiriendo conversión manual o automática?

5. **Evidencia de Gastos:** ¿Es necesario adjuntar fotos de recibos/facturas para validar los gastos, o es puramente basado en confianza (solo texto y números)?

6. **Permisos y Edición:** ¿Quién puede editar o eliminar un gasto? ¿Solo el creador del gasto o cualquier miembro del viaje? (Crucial para evitar conflictos entre amigos).

7. **Notificaciones:** ¿El sistema debe enviar correos electrónicos o alertas cuando alguien te agrega a un viaje o carga un gasto a tu nombre?

8. **Plataforma y Tecnología:** ¿Existe alguna restricción tecnológica obligatoria (ej: Debe ser React + Node.js, o Java Spring Boot, o PHP)? ¿Debe ser Mobile-First (diseño adaptable a móviles) obligatoriamente?

9. **Historial y Papelera:** Si un usuario se elimina de un viaje o se borra un viaje por error, ¿necesitamos un "Soft Delete" (papelera de reciclaje) o el borrado es permanente e inmediato?

10. **Categorización:** ¿Los gastos requieren categorías (Comida, Transporte, Hospedaje) para reportes, o solo Título y Monto?

**Prompt 2:**

1. Prioricemos MVP
2. Opción A
3. Visualización simple
4. Moneda COP
5. Contempla la opción de adjuntar fotos
6. Solo el creador del viaje
7. Contempla enviar alertas
8. Backend con NestJS, seguir la estructura adjunta. Frontend con React + TypeScript, CSS + Tailwind
9. Soft delete
10. Los gastos requieren categoría

**R/ Prompt 2:**
(FASE 2: EXECUTION) Generación del PRD (Product Requirements Document) inicial, incluyendo Resumen Ejecutivo, Reglas de Negocio, Historias de Usuario y Diagramas de Arquitectura/Casos de Uso (Mermaid) basados en las respuestas proporcionadas.

Recibido. He procesado tus respuestas de la Fase 1. Has definido un alcance claro para un MVP (Producto Mínimo Viable) robusto, con un stack tecnológico moderno (NestJS + React) y reglas de negocio estrictas (control centralizado por el creador del viaje y obligatoriedad de registro).

Procedo inmediatamente a la FASE 2: EXECUTION & MASTER DOCUMENTATION.

A continuación, presento el Product Requirements Document (PRD) y la Arquitectura de Solución, alineados con la estructura de carpetas que has suministrado.

**SECCIÓN 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)**

- PRD generado.

**SECCIÓN 2: ARQUITECTURA Y ANÁLISIS DE SISTEMAS** [ROL: Lead Solutions Architect]

He diseñado la arquitectura basándome estrictamente en la imagen de la estructura de directorios que proporcionaste (`src/auth`, `src/users`, `src/trips`, `src/expenses`, `src/balances`, `src/common`).

**2.1 DIAGRAMA DE CASOS DE USO (Mermaid)**

Este diagrama define quién puede hacer qué dentro del sistema.

- Diagrama de casos de uso generado.

**2.2 MODELO DE DATOS Y RELACIONES (ERD)**

Diseño de base de datos relacional soportando Soft Delete y la estructura modular de NestJS.

**2.3 ESPECIFICACIÓN TÉCNICA BACKEND (NestJS)**
Basado en tu captura de pantalla, esta es la responsabilidad de cada módulo:

- **src/auth**
  - `auth.service.ts`: Manejo de JWT, validación de contraseña (bcrypt), Login
  - `guards/`: JwtAuthGuard para proteger rutas

- **src/users**
  - `users.service.ts`: CRUD de usuarios, método `findByEmail` (crítico para validar invitaciones)

- **src/trips**
  - `trips.controller.ts`:
    - `POST /trips`: Crear viaje
    - `POST /trips/:id/join`: Endpoint para validar código y unir usuario
    - `POST /trips/:id/invite`: Valida si el email existe en users. Si no, lanza 404 User Not Found

- **src/expenses**
  - `expenses.controller.ts`: Maneja la subida de archivos (imágenes) usando FileInterceptor
  - `expenses.service.ts`: Lógica transaccional. Al crear un gasto, debe calcular automáticamente los registros en la tabla EXPENSE_SPLITS dividiendo el monto equitativamente
  - Constraint Check: En el método update o delete, se debe verificar: `if (currentUser.id !== trip.creator_id) throw new ForbiddenException()`

- **src/balances**
  - `balances.service.ts`: No guarda datos persistentes complejos. Ejecuta una consulta de agregación (SUM) en tiempo real: (Lo que pagué) - (Lo que me corresponde de gastos de otros) = Mi Saldo

- **src/common**
  - `pipes/`: Validación de datos de entrada (DTOs)
  - `filters/`: Manejo global de excepciones (ej. HttpExceptionFilter)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:** (Workflow agent en Cursor)

Para la generación de diagramas de arquitectura siguiendo el modelo C4 (Context, Containers, Components, Code), este proyecto utiliza los **agentes generadores de diagramas C4** configurados en Cursor:

- **Ubicación:** `.cursor/agents/diagrams/c4-diagrams/`
- **Agente orquestador:** `c4-diagram-generator.md` - Coordina la generación y opera en dos modos:
  - **Modo Extracción:** Analiza el código existente para documentar la arquitectura actual
  - **Modo Diseño:** Lee PRD/documentación y diseña la arquitectura desde cero
- **Subagentes especializados:**
  - `c4-discovery.md` - Descubrimiento de stack tecnológico y patrones
  - `c4-doc-analyzer.md` - Análisis de documentación para extraer elementos C4
  - `c4-architecture-designer.md` - Diseño de arquitectura desde requisitos
  - `c4-context.md`, `c4-container.md`, `c4-component.md`, `c4-code.md` - Generadores por nivel
  - `c4-validation.md` - Validación de diagramas generados

**Uso:** Invocar con prompts como "Generate C4 diagrams for this project" o "Generate context diagram". Los diagramas se generan en formato PlantUML en `docs/diagrams/c4/`.

---

## 3. Modelo de Datos (Gem de google - rol Senior Data Architect & Database Specialist)

**Prompt 1:**
### ROL Y OBJETIVO

Actúa como un **Senior Data Architect & Database Specialist** de nivel Elite. Tu responsabilidad principal es analizar Documentos de Requerimientos de Producto (PRD) y transformarlos en Diagramas de Entidad-Relación (DER) profesionales, normalizados y listos para implementación.

Tu prioridad es la **Integridad Referencial**, la **Escalabilidad** y la **Claridad Semántica**.

### PROTOCOLO DE ANÁLISIS (CORE INSTRUCTION)

Antes de generar cualquier diagrama, debes ejecutar internamente los siguientes procesos cognitivos:

1.  **Extracción de Entidades (NLP):** Analiza el PRD para identificar sustantivos clave que representen objetos de negocio persistentes.
2.  **Inferencia de Relaciones:** Identifica los verbos que conectan a las entidades para determinar la cardinalidad (1:1, 1:N, N:M).
3.  **Normalización (3NF):** Asegura que el modelo cumpla, como mínimo, con la Tercera Forma Normal. Descompón atributos compuestos y elimina dependencias transitivas.
4.  **Estandarización:** Aplica las reglas de nomenclatura y campos de auditoría definidos en los "ESTÁNDARES TÉCNICOS".

### ESTÁNDARES TÉCNICOS OBLIGATORIOS

Debes aplicar estas reglas estrictas en tu salida:

1.  **Nomenclatura:**
    * **Entidades:** PascalCase en Singular (ej: `UserProfile`, `Order`).
    * **Atributos:** snake_case (ej: `first_name`, `total_amount`).
    * **PK:** `id` o `id_{entidad}` (Integer/UUID).
    * **FK:** `{entidad}_id`.

2.  **Campos Automáticos (Auditoría):**
    A menos que el contexto dicte lo contrario, inyecta estos campos en TODAS las entidades principales:
    * `created_at`: TIMESTAMP
    * `updated_at`: TIMESTAMP
    * `is_active`: BOOLEAN (Default TRUE para Soft Delete)

3.  **Manejo de Relaciones:**
    * Las relaciones **N:M** (Muchos a Muchos) deben resolverse explícitamente creando una tabla intermedia (ej: `StudentCourse` para la relación entre `Student` y `Course`).

### FORMATO DE SALIDA (SECUENCIA DE RESPUESTA)

Tu respuesta debe seguir estrictamente esta estructura:

**FASE 1: RAZONAMIENTO Y DICCIONARIO (Chain of Thought)**
* Lista las entidades identificadas del PRD.
* Explica brevemente la lógica de las relaciones complejas.
* *Tree of Thoughts:* Si hay ambigüedad en el PRD (ej: ¿Un usuario tiene un rol o múltiples roles?), plantea 2 opciones, elige la más escalable y explica por qué.

**FASE 2: CÓDIGO MERMAID**
Genera el bloque de código `mermaid` usando la sintaxis `erDiagram`.
* Usa `||--o{` , `||--|{`, etc., para definir cardinalidad exacta.
* Incluye los tipos de datos en el diagrama (ej: `string name`, `int age`).

**FASE 3: VALIDACIÓN Y NOTAS**
* Confirma que no hay "Entidades Huérfanas".
* Lista cualquier suposición que hiciste si el PRD estaba incompleto.

### GUARDRAILS (REGLAS DE SEGURIDAD)

* **Anti-Alucinación:** No inventes entidades de negocio que no se mencionen o deduzcan lógicamente del PRD. Si el PRD habla de "Ventas", no agregues "Módulo de Recursos Humanos" a menos que sea necesario para la venta.
* **Context Grounding:** Si el PRD es demasiado vago, detente en la FASE 1 y pide clarificación sobre el punto específico antes de dibujar el diagrama.

---
**INPUT INICIAL:** Espera a que el usuario te proporcione el texto del PRD o la descripción del sistema.

**R/ Prompt 1:**
He analizado el PRD y la arquitectura propuesta (NestJS + PostgreSQL) requiere un esquema relacional robusto que soporte la lógica financiera y las reglas de negocio estrictas (como el control centralizado del creador).

A continuación, presento el diseño detallado.

FASE 1: RAZONAMIENTO Y DICCIONARIO (Chain of Thought)
1. Extracción de Entidades y Análisis
Del PRD extraigo los siguientes objetos de negocio persistentes:

User: El pilar de la identidad ("Strict User Policy").

Trip: La unidad agrupadora de la lógica de negocio.

Expense: La transacción financiera principal.

Category: Necesaria para clasificar los gastos (Comida, Transporte, etc.).

2. Resolución de Relaciones Complejas (Tree of Thoughts)
¿Cómo manejar la pertenencia de usuarios a viajes?

Opción A: Array de IDs en la tabla Trip (Anti-patrón en SQL).

Opción B: Tabla intermedia TripParticipant.

Decisión: Opción B. Es obligatoria para relaciones N:M. Además, nos permite guardar atributos específicos de la relación, como el role (para distinguir al "Creador" del "Participante") y la fecha de unión.

¿Cómo manejar la división de gastos (Splits)?

Un gasto tiene un pagador (1 usuario), pero beneficia a muchos (N usuarios).

Solución: Entidad ExpenseSplit. Esta tabla desglosa un Expense en múltiples registros, indicando cuánto le corresponde pagar a cada beneficiario. Esto es vital para calcular los "Saldos" matemáticamente (Total pagado vs. Fair share).

¿Cómo manejar las imágenes (Recibos)?

El PRD menciona "subir una foto". Aunque en un sistema Enterprise usaría una tabla Attachment separada para permitir múltiples fotos, para este MVP mantendré un campo receipt_url en la tabla Expense para reducir la complejidad de joins, manteniendo la escalabilidad vertical.

3. Estandarización y Auditoría
Aplicaré los campos created_at, updated_at y deleted_at (para el Soft Delete requerido en el PRD) en todas las tablas transaccionales. Usaremos UUIDs para los IDs para asegurar unicidad global y seguridad (evitar enumeración de IDs).

FASE 2: CÓDIGO MERMAID (Diagrama ER)
Aquí tienes el diagrama normalizado listo para tu documentación técnica.

```mermaid
erDiagram
    %% ENTITIES
    User {
        uuid id PK
        string email UK "Unique, Indexado para búsquedas rápidas"
        string password_hash
        string first_name
        string last_name
        timestamp created_at
        timestamp updated_at
        boolean is_active "Default TRUE"
        timestamp deleted_at "Soft Delete"
    }

    Trip {
        uuid id PK
        string name
        string description
        string invite_code UK "Código alfanumérico único"
        uuid created_by FK "Referencia al User creador original"
        timestamp created_at
        timestamp updated_at
        boolean is_active
        timestamp deleted_at
    }

    TripParticipant {
        uuid id PK
        uuid trip_id FK
        uuid user_id FK
        string role "Enum: CREATOR, MEMBER"
        timestamp joined_at
        boolean is_active
        %% Esta tabla resuelve la relación N:M entre User y Trip
    }

    ExpenseCategory {
        int id PK
        string name "Ej: Comida, Transporte"
        string icon "Referencia visual"
        boolean is_active
    }

    Expense {
        uuid id PK
        uuid trip_id FK
        uuid payer_id FK "User que pagó"
        int category_id FK
        string title
        decimal amount "Monto total en COP"
        string receipt_url "URL a S3/Cloudinary"
        date expense_date
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    ExpenseSplit {
        uuid id PK
        uuid expense_id FK
        uuid user_id FK "Usuario beneficiario del gasto"
        decimal amount_owed "Monto asignado a este usuario (Fair Share)"
        timestamp created_at
        %% Esta tabla permite saber quién debe qué de cada gasto
    }

    %% RELATIONSHIPS
    User ||--o{ TripParticipant : "participates in"
    User ||--o{ Expense : "pays"
    User ||--o{ ExpenseSplit : "owes in"
    User ||--o{ Trip : "creates (ownership)"

    Trip ||--|{ TripParticipant : "has"
    Trip ||--o{ Expense : "contains"

    ExpenseCategory ||--o{ Expense : "categorizes"

    Expense ||--|{ ExpenseSplit : "is divided into"
    ```

**FASE 3: VALIDACIÓN Y NOTAS**

1. **Validación de Integridad**
   - Sin Huérfanos: Todas las entidades están conectadas lógicamente. Expense depende de Trip y User (pagador). ExpenseSplit depende de Expense.
   - Normalización (3NF):
     - No hay grupos repetitivos.
     - Los atributos dependen de la llave primaria.
     - Las categorías se extrajeron a ExpenseCategory para evitar redundancia de strings y facilitar la gestión en el frontend (un dropdown dinámico).

2. **Suposiciones Técnicas y Adaptaciones al PRD**
   - **Roles en TripParticipant:** He añadido explícitamente el campo role en la tabla intermedia. Esto satisface el requisito de "Centralized Control". El backend deberá validar: `IF user.role == 'CREATOR' THEN allow_edit ELSE deny`.
   - **Cálculo de Saldos:** El PRD pide "Visualización simple de deudas". La base de datos no guarda el saldo final (ej: "Juan debe 50k"), sino las transacciones (Expense y ExpenseSplit). El saldo se calcula en tiempo de ejecución (Service Layer) sumando los ExpenseSplit donde user_id = X y restando los Expense donde payer_id = X. Esto asegura la integridad financiera (Single Source of Truth).
   - **Moneda:** No agregué tabla de monedas dado que el PRD especifica explícitamente "Moneda Única: COP". Si esto cambiara en v2, se agregaría un campo currency_code en Trip.


---

## 4. Especificación de la API (cursor modo auto)

### ROL
Actúa como un Senior API Design Engineer. Tu objetivo es sintetizar la documentación técnica y de negocio para generar una especificación técnica definitiva.

### CONTEXTO
Debes analizar todos los archivos dentro del directorio `/docs`, prestando especial atención al PRD (Product Requirements Document) y a los borradores técnicos. Tu meta es crear un archivo `api-specification.md` que sirva como "fuente única de verdad" para el equipo de desarrollo.

### TAREAS DE ANÁLISIS
1. **Extracción de Requisitos:** Identifica los casos de uso del PRD que requieren exposición de datos.
2. **Mapeo de Entidades:** Define los modelos de datos basados en la lógica técnica descrita.
3. **Definición de Endpoints:** Diseña rutas RESTful (o GraphQL según la doc) que cubran las necesidades del negocio.

### ESTRUCTURA DEL ARTEFACTO (api-specification.md)
El archivo resultante DEBE seguir este orden:
1. **Información General:** Versión, Base URL, Protocolos y Autenticación (Auth0, JWT, API Keys, etc.).
2. **Glosario de Modelos:** Esquemas de objetos (JSON) con tipos de datos y descripciones.
3. **Catálogo de Endpoints:** Agrupados por recursos. Para cada endpoint:
    - Método y Ruta.
    - Parámetros (Path, Query, Body).
    - Respuestas Exitosas (2xx) y Errores (4xx, 5xx) con ejemplos.
4. **Rate Limiting y Cuotas:** Si se mencionan en la documentación técnica.

### REGLAS CRÍTICAS
- **Precisión Técnica:** No inventes campos. Si falta información en `/docs`, añade un comentario `[TODO: Pendiente definir en documentación]`.
- **Formato:** Usa bloques de código Markdown para ejemplos de JSON.
- **Tono:** Profesional, técnico y conciso.

### INSTRUCCIÓN DE INICIO
"He leído el directorio `/docs`. Por favor, procede a generar el archivo `api-specification.md` basándote en los hallazgos."

---

## 5. Historias de Usuario (Perplexity - prompt sudolang)

**Prompt 1:**

```sudolang
SoftwareDevelopmentProcess {
  // ============================================================================
  // METADATA & CONFIGURATION
  // ============================================================================
  Meta {
    language: "Spanish"
    style: "Iterative, Wizard-like"
    outputFormat: "Markdown"
    integrations: ["Jira MCP/Connector"]
  }


  // ============================================================================
  // INTERFACE CONSTRAINTS (Rules for the LLM)
  // ============================================================================
  Constraints {
    Guidance: "Al finalizar la ejecución de cualquier comando, DEBES sugerir explícitamente el siguiente comando lógico."
    Output: "Cada vez que se genere un artefacto, entrégalo en un bloque de código Markdown."
    ToolUse: "Cuando se invoque /uploadToJira, utiliza tus herramientas/conectores disponibles para crear los objetos reales en la plataforma externa."
  }


  // ============================================================================
  // STATE
  // ============================================================================
  State {
    currentStep: "IDLE" | "PRD_UPLOADED" | "PERSONAS_DEFINED" | "STORIES_GENERATED" | "EPICS_DEFINED" | "TICKETS_CREATED" | "READY_FOR_EXPORT" | "JIRA_SYNCED"
    
    // Data Stores
    PRD: string
    UserPersonas: List<Persona>
    UserStories: List<UserStory>
    Epics: List<Epic>
    Sprints: List<Sprint>
    WorkTickets: List<Ticket>
  }


  // ============================================================================
  // COMMANDS INTERFACE
  // ============================================================================
  Commands {
    /uploadPRD [content]              => UploadPRD(content)
    /productOwnerReview               => ProductOwner.ReviewPRD()
    /businessAnalystReview            => BusinessAnalyst.ReviewPRDAndCalculateUserStories()
    /generateUserStories              => BusinessAnalyst.GenerateUserStoriesAutomatically()
    /generateEpicsAndSprints          => SoftwareArchitectAndTechLead.GenerateEpicsAndSprints()
    /generateWorkTickets              => SoftwareArchitectAndTechLead.GenerateWorkTickets()
    /generateDocsAndTests             => SoftwareArchitectAndTechLead.GenerateDocumentationAndTestPlan()
    /finalOutput                      => FinalOutput()
    
    // NUEVO COMANDO DE INTEGRACION
    /uploadToJira                     => Integrations.UploadToJira()
    
    /status                           => ShowCurrentStateAndNextStep()
  }


  // ============================================================================
  // COMMAND LOGIC
  // ============================================================================
  
  UploadPRD(content: string) {
    State.PRD = content
    State.currentStep = "PRD_UPLOADED"
    log("PRD Cargado exitosamente.")
    suggest("/productOwnerReview")
  }


  ProductOwner.ReviewPRD() {
    requires: State.currentStep == "PRD_UPLOADED"
    State.UserPersonas = extract(State.PRD, target=UserPersona)
    /output file="Personas.md" { State.UserPersonas }
    State.currentStep = "PERSONAS_DEFINED"
    suggest("/businessAnalystReview")
  }


  BusinessAnalyst.ReviewPRDAndCalculateUserStories() {
    requires: State.currentStep == "PERSONAS_DEFINED"
    log("Analizando alcance...")
    suggest("/generateUserStories")
  }


  BusinessAnalyst.GenerateUserStoriesAutomatically() {
    requires: State.currentStep == "PERSONAS_DEFINED"
    State.UserStories = generate(source=State.PRD, personas=State.UserPersonas, target=UserStory)
    /output file="UserStories.md" { State.UserStories }
    State.currentStep = "STORIES_GENERATED"
    suggest("/generateEpicsAndSprints")
  }


  SoftwareArchitectAndTechLead.GenerateEpicsAndSprints() {
    requires: State.currentStep == "STORIES_GENERATED"
    State.Epics = cluster(State.UserStories, by="feature_set")
    State.Sprints = plan(State.UserStories, velocity=standard)
    /output file="Epics_Roadmap.md" { State.Epics, State.Sprints }
    State.currentStep = "EPICS_DEFINED"
    suggest("/generateWorkTickets")
  }


  SoftwareArchitectAndTechLead.GenerateWorkTickets() {
    requires: State.currentStep == "EPICS_DEFINED"
    State.WorkTickets = decompose(State.UserStories, target=JiraTicket)
    enrich(State.WorkTickets, with=["Acceptance Criteria", "Story Points"])
    /output file="Technical_Backlog.md" { State.WorkTickets }
    State.currentStep = "TICKETS_CREATED"
    suggest("/generateDocsAndTests")
  }


  SoftwareArchitectAndTechLead.GenerateDocumentationAndTestPlan() {
    requires: State.currentStep == "TICKETS_CREATED"
    /output file="QA_Plan.md" { generate_tests(source=State.UserStories) }
    State.currentStep = "READY_FOR_EXPORT"
    suggest("/finalOutput")
  }


  FinalOutput() {
    requires: State.currentStep == "READY_FOR_EXPORT"
    /output file="Master_Backlog.md" { State.Epics + State.UserStories + State.WorkTickets }
    log("Documentación lista. Si tienes el conector de Jira activo, ejecuta el siguiente paso.")
    suggest("/uploadToJira")
  }


  // ============================================================================
  // JIRA INTEGRATION LOGIC
  // ============================================================================
  Integrations.UploadToJira() {
    requires: State.currentStep == "READY_FOR_EXPORT"
    
    log("Iniciando secuencia de carga a Jira via MCP/Connector...")
    log("Nota: Esto ejecutara acciones reales en tu proyecto de Jira conectado.")


    // Instrucción explícita para el LLM con capacidades de Tool Use
    trigger_tool("jira_connector") {
      action: "batch_create",
      strategy: "hierarchy_first",
      instructions: [
        "1. Crea primero las Épicas listadas en State.Epics.",
        "2. Guarda los ID de las Épicas creadas (ej. PROJ-10).",
        "3. Crea las User Stories asignando el 'Parent Epic' correspondiente.",
        "4. (Opcional) Crea las Sub-tasks vinculadas a las Stories."
      ],
      data: {
        epics: State.Epics,
        stories: State.UserStories
      }
    }
    
    log("Solicitud de creación enviada al conector.")
    State.currentStep = "JIRA_SYNCED"
  }


  // ============================================================================
  // INIT
  // ============================================================================
  welcome() {
    log("Sudolang SDLC v2.1 (Jira MCP Enabled).")
    suggest("/uploadPRD [Pegar contenido]")
  }
}


// Start
SoftwareDevelopmentProcess.welcome()
```

Implementa este workflow.

---

## 6. Tickets de Trabajo (Perplexity - prompt sudolang)

Los tickets de trabajo se generan mediante el mismo flujo Sudolang descrito en la sección 5, utilizando el comando `/generateWorkTickets` que produce el archivo `Technical_Backlog.md`.

---


## 7. Pull Requests (cursor-commands)

Para el flujo de trabajo con Git (creación de ramas, commits atómicos y push), este proyecto utiliza el **comando git-workflow** configurado en Cursor:

- **Ubicación:** `.cursor/commands/git-workflow.md`
- **Comando:** `/git-workflow`
- **Descripción:** Analiza el estado del repositorio, crea ramas para nuevas funcionalidades, genera commits estándar (Conventional Commits) y hace push al remoto.
- **Triggers:** "commit", "push", "feature", "branch", "git workflow"
- **Características principales:**
  - Commits atómicos agrupados por tipo lógico de cambio
  - Creación automática de ramas `feature/` para nuevas funcionalidades
  - Mensajes de commit con formato `type(scope): description`
  - Aprobación del usuario antes de ejecutar commits
  - Guardrails para evitar force push y manejo de conflictos

**Uso:** Invocar el comando `/git-workflow` o mencionar "git workflow", "commit", "push" o "feature" en el chat.

---


