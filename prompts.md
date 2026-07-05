> Este archivo documenta los prompts estratégicos estructurados bajo la metodología de Spec-Driven Development (SDD) y Verified Spec-Driven Development (VSDD) para guiar a los asistentes de código (Gemini con IDE Antigravity) de manera determinista y profesional.


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

**Prompt 1 Descubrimiento del Problema e Idea de Producto:**
```md
📋 Prompt para Descubrimiento y Concepción de Producto (Copiar y Usar)
Actúa como un Senior Product Manager y Product Engineer con un enfoque "Product-Led" y amplia experiencia en metodologías ágiles (Scrum, Lean Startup), Domain-Driven Design (DDD) y Spec-Driven Development (SDD). 

Tu objetivo es guiarme a través de la fase de Product Discovery (Descubrimiento de Producto) partiendo de mi idea vaga, realizar la investigación necesaria del dominio y redactar un Documento de Concepción de Producto estructurado y libre de "vibe coding" (improvisación).

Analiza la siguiente idea de producto:
"Hay cierta incertidumbre en el uso de los insumos almacenados en el área de depósito de un restaurante, no se sabe a ciencia cierta quien accede a estos y cual es su finalidad.

Para resolver esta situación, se propone desarrollar una aplicación web que permita controlar el movimiento de los insumos del almacén, registrando que empleado realiza cada movimiento, la cantidad, fecha y el destino del producto.

En cada movimiento, se deberá registrar la fecha, el empleado, tipo de movimiento, almacén involucrado, detalle del movimiento.

Adicionalmente, en caso de ser usado un insumo se debe registrar la fecha, empleado operario, detalles del insumo, la cantidad usada, una descripción de su uso.

Poder rastrear el uso parcial de un producto y saber dónde queda almacenado.

La aplicación permitirá registrar empleados, tipos de movimientos, productos, marcas, áreas del restaurante, almacenes, tipos de almacenes, así como los detalles de cada movimiento y el stock de productos por almacén, uso y el destino del remanente.

 "

Ejecuta tu tarea dividiendo tu análisis en las siguientes fases estructuradas:

---

## 🔍 FASE 1: Investigación del Dominio y Estrategia "Buy vs. Build"
1. ANÁLISIS DEL MERCADO Y COMPETENCIA: Investiga brevemente qué soluciones (tanto open source como comerciales/SaaS) existen actualmente en el mercado para resolver este dolor. 
2. DECISIÓN BUY VS. BUILD: Evalúa de forma estratégica si realmente tiene sentido construir esta solución desde cero o si es un "commodity" que se podría resolver utilizando integraciones existentes. Define cuál es el verdadero "core diferencial" que justifica el desarrollo propio.

## 🎯 FASE 2: Visión del Producto y Objetivos Estratégicos (La "Visión")
Adopta el nivel superior de la "Cebolla de la Planificación" de Agile para definir el rumbo estratégico:
1. PROPÓSITO DE NEGOCIO (Frontera Problema/Solución): Define el dolor real de negocio o del usuario final. REGLA DE ORO: No menciones tecnología ni Inteligencia Artificial en esta sección; concéntrate puramente en el dolor del usuario (pérdidas de tiempo, ineficiencias, sobrecostos).
2. MÉTRICA DE LA ESTRELLA DEL NORTE (North Star Metric): Define la métrica principal que reflejará que el producto está entregando valor real al usuario.
3. TEMAS ENTEROS DEL ROADMAP: Divide la evolución del roadmap a medio plazo en "temas enteros de negocio" (en lugar de un listado desordenado de características). Recuerda el principio: "la gente no tiene medios problemas, sino problemas enteros"; cada tema debe resolver un problema de usuario al 100%.

## 🧭 FASE 3: Delimitación y Alcance del MVP (El "Outcome")
Establece los límites tácticos de la primera rebanada vertical (Vertical Slice) funcional:
1. HIPÓTESIS DE VALIDACIÓN: Formula la hipótesis de negocio utilizando la estructura: "Creemos que si permitimos a [User Persona] realizar [acción de valor], lograremos [cambio de comportamiento / impacto medible]".
2. USER PERSONA: Identifica a la persona o rol concreto que sufre el problema. Describe su contexto operativo, sus frustraciones específicas y el disparador (trigger) que lo motivará a usar la aplicación (evita el "usuario genérico").
3. HAPPY PATH (E2E FLOW): Describe la secuencia lógica y numerada (Paso 1, Paso 2...) del flujo ideal de extremo a extremo que el usuario recorrerá para obtener valor.
4. FUERA DE ALCANCE (Non-goals): Lista de forma explícita qué características, integraciones o flujos secundarios NO se construirán en esta iteración para evitar el crecimiento descontrolado del alcance (scope creep) y guiar de forma segura a futuros agentes de desarrollo.

## ❓ FASE 4: Auditoría Adversarial e Interrogatorio de Reglas de Negocio
Antes de que este documento sea aprobado por un experto, asume el rol de un Adversario Crítico y plantea de 2 a 3 preguntas incómodas sobre reglas de negocio complejas o casos límite (edge cases) que se deban aclarar (ej: manejo de permisos, estados vacíos del sistema, límites físicos o de infraestructura).

---

Genera el documento con un tono directo, sumamente riguroso y en formato Markdown limpio. Comienza directamente en el análisis de la Fase 1 sin preámbulos conversacionales.

Guarda el archivo como "docs/01_idea_inicial.md"

```

### Respuesta del Agente de IA:
El documento completo con el análisis de la concepción del producto se encuentra en:
* [docs/01_idea_inicial.md](file:///home/lacruzjd/Documentos/programacion/iadevs/proyecto-final/AI4Devs-finalproject/docs/01_idea_inicial.md)

### Nota de control humano: 
Se hicieron algunos cambios al archivo generado por el agente adoptando un rol de un operario autorizado para las traslaciones y descartes, ya que el agente sugirió que cualquier operario podría realizar traslaciones y descartes, lo cual no es correcto, solo el operario autorizado puede realizar traslaciones y descartes.

**Prompt 2 Generación del PRD (Product Requirements Document):**

```md
Actúa como un Senior Product Manager y Arquitecto de Software experto en metodologías ágiles, Spec-Driven Development (SDD) y Domain-Driven Design (DDD). Su especialidad es traducir descripciones de alcance o flujos de Happy Path en Documentos de Requisitos de Producto (PRD) de alta fidelidad, diseñados específicamente para actuar como una "especificación ejecutable" que un agente de codificación autónomo pueda implementar sin desviaciones lógicas.

Analiza el siguiente documento de entrada que describe el alcance y flujo principal del MVP:
"docs/01_idea_inicial.md"

Tu objetivo es procesar este insumo y generar un PRD estructurado bajo la versión 1.1.0 (Aprobado para Desarrollo). Debes ser riguroso, explícito y no asumir nada que no esté estrictamente justificado por el negocio. Sigue exactamente la siguiente estructura estándar de salida en Markdown limpio:

---

# 📝 Documento de Requisitos de Producto (PRD): [Nombre del Sistema]

## 🎯 1. Descripción General del Producto

### 1.1. Problemática de Negocio
- Describe el dolor real de negocio, las ineficiencias o las pérdidas financieras del usuario sin prescribir tecnologías, bases de datos o Inteligencia Artificial. Concéntrate en la ineficiencia operativa y el impacto directo en el negocio.

### 1.2. Propuesta de Solución (MVP)
- Define el propósito central de la solución y explica cómo el software resolverá el problema planteado, delimitándolo estrictamente al flujo principal descrito en el insumo.

### 1.3. Objetivos de Negocio y KPIs (Métricas de Éxito)
- Detalla de 2 a 3 indicadores clave de rendimiento (KPIs) cuantitativos que reflejen éxito operativo (ej. reducción de tiempos de proceso, incremento de conversión, tasa de retención de valor). No utilices métricas técnicas de código o infraestructura en esta sección.

---

## 👥 2. Definición de Usuarios (User Personas)
Identifica al menos dos perfiles o roles clave que interactuarán con el sistema (ej. Administrador / Operario de Línea):
- **Contexto operativo:** Dónde y cómo interactúa el usuario (ej. alta transaccionalidad, estrés físico, escritorio o tablet).
- **Necesidades específicas:** Frustraciones de su día a día y qué valor obtiene del sistema.
- **Identificación y Permisos:** Define de forma clara el mecanismo de autenticación del usuario (ej. PIN rápido para entornos ágiles o login tradicional) y restringe rigurosamente los permisos de escritura/auditoría por rol para proteger la integridad de los datos.

---

## 🧭 3. Flujo End-to-End Prioritario

### 3.1. Happy Path: Secuencia de Pasos
- Describe detalladamente la secuencia lógica y numerada (Paso 1, Paso 2...) del flujo ideal de extremo a extremo que el usuario recorre para obtener valor, reflejando el Happy Path provisto en el insumo.

### 3.2. Flujos Alternativos y Manejo de Errores (Edge Cases)
Debes prever y detallar el comportamiento del sistema ante fallos para evitar que la IA improvise la lógica. Incluye de forma obligatoria especificaciones de comportamiento para:
- **Validaciones de Entrada de Datos:** Cómo reacciona el sistema ante campos vacíos, inválidos o transacciones que dejen saldos lógicos negativos.
- **Fallas de Conectividad o Red:** Mecanismos de resiliencia transaccional (ej. almacenamiento local/diferido) en el cliente si se interrumpe la conexión de red.
- **Políticas de Vencimiento o Caducidad Dinámica:** Cómo maneja el sistema la alteración o caducidad del estado de las entidades de negocio.

---

## 🛑 4. Límites del Sistema y "Non-Goals" (Fuera de Alcance)
- Lista explícitamente de 3 a 5 características, módulos complejos, automatizaciones avanzadas o integraciones externas que NO se construirán en esta iteración. Esto actúa como salvaguarda innegociable contra el "scope creep" (deriva de alcance) e impide que los agentes de codificación asuman lógica o inventen endpoints fuera del happy path.

---

## 📋 5. Backlog de Historias de Usuario (INVEST)
Traduce el flujo del MVP en historias de usuario independientes y estimables. Cada historia de usuario debe seguir estrictamente este formato:

### [ID-US-XX]: [Título de la Historia]
*   **Historia:** "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".
*   **Complejidad:** S / M / L (Estimación de esfuerzo relativo).
*   **Evaluación INVEST:** Justifica brevemente por qué la historia cumple con los criterios: Independiente, Negociable, Valiosa, Estimable, Pequeña (Small) y Testeable.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):** Proporciona de 2 a 3 escenarios detallados empleando la estructura:
    *   **Escenario:** [Descripción del caso de uso]
        *   **Given (Dado que)** [Contexto inicial del sistema o estado de datos]
        *   **When (Cuando)** [Acción exacta realizada por el usuario]
        *   **Then (Entonces)** [Resultado medible y observable esperado]

---

## 🛡️ 6. Estrategia de Calidad y Verificación (QA/Testing)
- Especifica la política de desarrollo **Test-First (TDD con IA)**. 
- Prohibe explícitamente que la IA genere de forma simultánea el código y los tests correspondientes para mitigar el riesgo de "Test Theater" (validación circular o autoconfirmación de alucinaciones).
- Establece la regla innegociable de que el humano o un oráculo determinista define o revisa el test (el "qué") y la IA implementa el código mínimo para hacerlo pasar a verde (el "cómo").
- Clasifica las pruebas mínimas requeridas:
  1. **Unitarias:** Pruebas de lógica inmutable de negocio (reglas de dominio y validadores puros sin llamadas de red o persistencia).
  2. **Integración:** Pruebas sobre llamadas HTTP y transacciones utilizando una base de datos real o simulada para verificar estados y respuestas REST.
  3. **End-to-End (E2E):** Un escenario completo con automatización de navegador que replique el Happy Path prioritario del usuario.

---

Genera tu respuesta con un tono directo, estructurado y profesional, comenzando directamente con el título del PRD en formato Markdown, con indice.

Guarda el archivo como "docs/02_[NOMBRE_DEL_SISTEMA]_prd.md"

```

### Respuesta del Agente de IA:
El documento completo de requisitos de producto (PRD) se encuentra en:
* [docs/02_restostock_prd.md](docs/02_restostock_prd.md)

### Nota de control humano:
El PRD fue revisado y aprobado para comenzar con el desarrollo, se hizo un cambio en la duracion del la meta de la Tasa de Rotación de Remanentes, de 24 horas a 48 horas.


**Prompt 3 Especificación Técnica de Arquitectura y Persistencia:**

```md
Actúa como un Senior Software Architect y Principal Database Administrator (DBA) experto en Spec-Driven Development (SDD), Domain-Driven Design (DDD) y arquitecturas limpias. 

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) provisto e implementar el plano técnico de construcción del sistema, el cual se documentará en el archivo de diseño técnico "design.md". Este documento debe actuar como una "especificación técnica ejecutable" inmutable para futuros agentes de programación.

Analiza con extremo cuidado el siguiente PRD de entrada:
" docs/02_restostock_prd.md"

Estructura el archivo de salida aplicando con máximo rigor las siguientes cuatro secciones de ingeniería de software:

---

## 💻 1. Arquitectura de Referencia (Screaming Architecture & Slices)
Para mitigar la degradación de la ventana de contexto de los agentes de codificación, debes estructurar el sistema dividiéndolo en Rebanadas Verticales (Vertical Slices) cohesivas y desacopladas en primer nivel de directorios, organizando internamente cada slice bajo los puertos y adaptadores de la Arquitectura Hexagonal.
1. Dibuja un mapa visual de directorios del proyecto que muestre la estructura de carpetas de la solución (Screaming Architecture).
2. Explica detalladamente las responsabilidades de cada capa técnica:
   - Capa de Dominio (Domain): Entidades puras, Value Objects e interfaces de puertos (Repositories/Services) 100% agnósticas de frameworks o bases de datos.
   - Capa de Aplicación (Application): Casos de uso específicos que orquestan el flujo de datos invocando puertos de dominio.
   - Capa de Infraestructura (Infrastructure): Adaptadores concretos (controladores HTTP de Express, persistencia con Prisma ORM, integraciones externas).

## 🗄️ 2. Modelo de Datos Lógico/Físico Agnóstico (Database-Agnostic Blueprint)
Diseña un modelo de persistencia lógico y físico completamente independiente de la tecnología final (sin mencionar sintaxis de Prisma, SQL DDL, o colecciones de MongoDB). La estructura debe representarse en Markdown utilizando la Tercera Forma Normal (3NF) y modelarse bajo los siguientes estándares de alta fidelidad:

1. CATÁLOGO DE ENTIDADES Y CAMPOS: Para cada entidad de la base de datos, provee una tabla detallada con:
   - Nombre físico del campo (utiliza snake_case por convención de base de datos).
   - Tipo de dato lógico agnóstico (ej: Integer, Decimal(precisión, escala), String(longitud), DateTime, Boolean, Enum). REGLA INNEGOCIABLE: Prohíbe tipos 'Float' o 'Double' para valores monetarios, pesos o inventarios; usa Decimal para evitar errores de precisión acumulados.
   - Restricciones físicas (PK, FK, UNIQUE, NOT NULL, DEFAULT, CHECK).
   - Descripción clara del propósito del campo en el negocio.

2. DICCIONARIO DE ENUMS: Define los dominios cerrados que actúan como Enums nativos de base de datos (estados, motivos, roles) detallando sus valores permitidos para evitar la persistencia de texto basura.

3. MAPA DE RELACIONES Y CARDINALIDADES: Detalla de forma explícita las relaciones existentes utilizando notación estándar (ej: "Insumo (1) ---- (N) Remanente (N) ---- (1) Almacen"). Especifica qué campos físicos actúan como llaves foráneas y cómo se comportarán las acciones referenciales (ON DELETE/ON UPDATE).

4. ESTRATEGIA DE INDEXACIÓN LOGICA: Recomienda qué columnas físicas deben contar con índices de rendimiento basados en la frecuencia esperada de búsquedas lógicas, joins y filtros cronológicos, justificando cada decisión técnica.


## 🔌 3. Contratos de la API REST (Especificación de Endpoints)
Define con absoluta precisión los contratos de comunicación de los endpoints necesarios para resolver el Happy Path del PRD:
1. Para cada endpoint crítico, detalla:
   - Método HTTP, URL exacta y middleware de seguridad aplicable.
   - Payload JSON de entrada esperado (request body) con tipos y reglas de validación necesarias.
   - Payload JSON de respuesta exitosa (HTTP 200/201) con formato de salida predecible.
   - Respuestas HTTP de error esperadas (ej. 401 Unauthorized para autenticaciones inválidas, 422 Unprocessable Entity para violaciones lógicas de negocio) y estructura JSON del mensaje de error.

## 🛡️ 4. Invariantes del Dominio y Reglas de Validación
Identifica las reglas lógicas críticas que el sistema debe validar en memoria antes de permitir cambios de estado en las entidades de la base de datos para mitigar la persistencia de datos corruptos:
1. Define las invariantes de negocio que deben proteger los agregados (ej: "el remanente de un insumo parcial jamás puede ser mayor a la capacidad de la presentación original").
2. Especifica el comportamiento dinámico esperado del ciclo de vida de los estados para evitar transacciones inconsistentes.

---

Genera el documento "docs/03_[nombre_del_sistema]_design.md" en formato Markdown limpio, redactando las explicaciones técnicas manteniendo el código de Prisma ORM y payloads JSON en inglés para máxima compatibilidad con el compilador. Comienza directamente con el título del archivo sin preámbulos conversacionales.

### Respuesta del agente de IA:
El documento completo de diseño de arquitectura y persistencia se encuentra en:
* [docs/03_restostock_design.md](docs/03_restostock_design.md)

### Nota de control humano:
La revision del archivo docs/03_restostock_design.md fue completada y aprobada para continuar con las especificaciones tecnicas, para continuar a mas detalla con la seccion de Arquitectura del Sistema a continuacion.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Generación de Diagramas Mermaid Integrados
``` md 
Actúa como un Senior Systems Architect experto en el Modelo C4 y Diagramas como Código (DaC). Tu objetivo es generar un diagrama de contenedores de Nivel 2 (Modelo C4) en formato Mermaid para documentar de forma visual la arquitectura física y lógica del sistema RestoStock.

Analiza minuciosamente los archivos de especificación técnica del proyecto (principalmente 'docs/02_restostock_prd.md' y 'docs/03_restostock_design.md') para extraer el contexto del sistema, las tecnologías y las fronteras de red. Genera el código Mermaid aplicando con máximo rigor las siguientes directrices:

1. El diagrama debe estructurarse utilizando subgrafos (subgraphs) bien definidos para separar físicamente las capas:
   - Capa de Presentación (Frontend): Debe agrupar los componentes de cliente (Web Backoffice para el Administrador usando React/Next.js, y Terminal Táctil de Cocina para el Staff usando React, IndexedDB y Local Storage para resiliencia offline).
   - Capa de Procesamiento (Backend): Debe ilustrar la API REST en Express/TypeScript, el Core de Dominio puro (inmutable, agnóstico y estructurado por Vertical Slices), y el adaptador de persistencia (Prisma ORM).
   - Capa de Persistencia: Representada por el motor relacional PostgreSQL (estructurado en 3NF con tipos Decimal para existencias y Enums nativos para dominios cerrados).

2. Todos los flujos de datos e interacciones entre componentes deben estar explícitamente etiquetados indicando:
   - La acción de negocio (ej. gestionar catálogos, registrar movimientos, autorizar transacciones).
   - El protocolo de comunicación y formato de intercambio (ej. HTTPS, REST JSON).
   - El mecanismo de seguridad y firma aplicable (ej. autenticación por JWT para el Backoffice, o firma digital por PIN táctil de 4 dígitos para las operaciones del Staff).

3. Asegura el cumplimiento de la Arquitectura Hexagonal en el flujo del backend: la API Express invoca y orquesta los Casos de Uso, el Core de Dominio define las interfaces (puertos) de base de datos, y Prisma ORM actúa como adaptador de infraestructura.

4. Aplica clases de estilo personalizadas de Mermaid (classDef) para que el diagrama sea visualmente pulido y profesional, distinguiendo con colores y bordes claros a las Personas (roles de usuario), los Contenedores de software y la Base de Datos.

Genera únicamente el bloque de código Mermaid compatible con renderizado nativo en GitHub Markdown, comenzando directamente con la etiqueta ```mermaid sin preámbulos conversacionales.

Guarda la respuesta en el archivo docs/04_restostock_architecture_diagram.md
```

#### Respuesta del agente de IA:
El diagrama completo de arquitectura física y lógica se encuentra en:
* [docs/04_restostock_architecture_diagram.md](docs/04_restostock_architecture_diagram.md)

--- 

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Definición de Capas en Arquitectura Hexagonal
```md 
Actúa como un Senior Software Architect y Technical Lead experto en Domain-Driven Design (DDD), Arquitectura Hexagonal (Ports & Adapters) y el Principio de Cierre Común (CCP) aplicado a Vertical Slices.

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) y la Especificación Técnica de Persistencia y Datos (design.md) provistos para estructurar de forma limpia la sección "2.2. Descripción de componentes principales" del sistema, definiendo cómo se dividirá físicamente el software y cómo fluirán las dependencias lógicas.

Analiza con extremo cuidado las siguientes especificaciones del sistema:
- Documento PRD / Requisitos Funcionales:
" ./docs/02_restostock_prd.md "

- Documento de Diseño / Especificación de Datos:
" ./docs/03_restostock_design.md "

Genera de forma exclusiva la sección de arquitectura detallada aplicando con máximo rigor las siguientes cuatro secciones de ingeniería de software:

---   

# 💻 2.2. Descripción de Componentes Principales

## 🧭 1. Estilo Arquitectónico y Slices Verticales (Screaming Architecture)
1. Declara que la solución se estructurará organizando el backend en Rebanadas Verticales (Vertical Slices) independientes en el primer nivel de directorios, basándose en el Principio de Cierre Común (CCP).
2. Mapea y lista los componentes lógicos de negocio (módulos) identificados a partir del PRD, describiendo brevemente la responsabilidad y el dominio operativo de cada módulo (ej: modules/users, modules/billing, etc.).

## 🛡️ 2. Anatomía y Responsabilidades de las Capas (Arquitectura Hexagonal)
Detalla de manera explícita las fronteras y el rol técnico de cada capa dentro de cada módulo:
- Capa de Dominio (Domain Layer): Contiene las entidades ricas, Value Objects e interfaces de puertos (Ports / interfaces de repositorios o servicios). Debe ser pura, desacoplada y agnóstica de frameworks o librerías de persistencia.
- Capa de Aplicación (Application Layer): Contiene los Casos de Uso (Usecases) que orquestan el flujo de datos llamando a los puertos abstractos del dominio, sin interactuar directamente con la red o el almacenamiento.
- Capa de Infraestructura (Infrastructure Layer): Aloja los adaptadores de entrada (controladores HTTP, enrutadores, esquemas de validación de entrada) y de salida (adaptadores ORM de persistencia física, clientes de APIs externas).

## 🔄 3. Regla Estricta de Dependencia Unidireccional
Establece la regla de acoplamiento del software:
- El flujo de importaciones lógicas viaja estrictamente de fuera hacia adentro.
- Infraestructura puede importar de Aplicación y Dominio.
- Aplicación solo puede importar de Dominio.
- Dominio tiene terminantemente prohibido importar de Aplicación, de Infraestructura o de cualquier librería técnica externa (Express, ORMs).

## 🔌 4. Ejemplo Canónico de Código (TypeScript Blueprint)
Proporciona un ejemplo de código de referencia en TypeScript que sirva como "molde" homogéneo para el equipo, modelando un flujo básico del sistema (ej: creación o registro de datos). El código debe ser limpio y tipado, ilustrando de forma secuencial:
1. El Puerto (interface) declarado en la capa de Dominio.
2. El Caso de Uso en la capa de Aplicación que recibe el puerto mediante inyección de dependencias.
3. El Adaptador de Controlador en la capa de Infraestructura que recibe la petición HTTP, valida los datos de entrada y delega la ejecución al caso de uso.

---

Genera el documento en formato Markdown limpio, redactando las explicaciones técnicas y manteniendo las entidades, nombres de variables, interfaces de código TypeScript y payloads JSON en inglés profesional para máxima compatibilidad con tu compilador. Comienza directamente con el título de la sección sin preámbulos conversacionales.

Guarda la respuesta en el archivo docs/05_restostock_components_description.md

```

#### Respuesta del agente de IA:

#### Nota de control humano:

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```md
Basandote en los archivos: 
  - ./docs/02_restostock_prd.md
  - ./docs/03_restostock_design.md
  - ./docs/04_restostock_architecture_diagram.md
  - ./docs/05_restostock_components_description.md

Genera la estructura de carpetas de mi proyecto combinando Vertical Slicing y Arquitectura Hexagonal para un monorepo con Frontend (React/Next.js) y Backend (Node.js/TypeScript).
Quiero que me muestres la jerarquía exacta de ficheros que herede el Principio de Cierre Común (CCP), asegurando que todo lo que cambia en conjunto para una feature (ej. Users, Bookings) viva cerca.
No utilices carpetas globales horizontales de controladores o servicios. Devuelve la estructura en formato de árbol de texto Markdown con anotaciones de lo que almacena cada directorio.

Guarda la respuesta en el archivo docs/06_restostock_folder_structure.md

```

#### Respuesta del agente de IA:
La estructura completa del directorio del proyecto (monorepo con Frontend Next.js y Backend Express) se encuentra en:
* [docs/06_restostock_folder_structure.md](docs/06_restostock_folder_structure.md)


#### Nota de control humano:


### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Pipeline de CI/CD Seguro y Despliegue

```md
Actúa como un Ingeniero de DevOps. Genera un pipeline de GitHub Actions (`ci.yml`) para mi proyecto.
El pipeline debe:
1. Ejecutarse ante cualquier Pull Request hacia la rama `main`.
2. Instalar dependencias del monorepo, correr los linters de TypeScript y ejecutar la suite de pruebas unitarias y de integración.
3. Asegurarse de no exponer secrets o variables de entorno en claro, mapeando la base de datos de pruebas a través de variables del entorno de GitHub.
Proporciona la configuración de YAML limpia y explicada.
```

#### Respuesta del agente de IA:
La configuración detallada y limpia del pipeline de GitHub Actions se encuentra en:
* [.github/workflows/ci.yml](.github/workflows/ci.yml)

#### Nota de control humano:

---

### **2.5. Seguridad**

**Prompt 1:**
```md
Actúa como un Senior Cybersecurity Architect y DevSecOps Specialist con amplia experiencia en las directrices de OWASP (tanto para aplicaciones tradicionales como para LLMs), GDPR y el EU AI Act (2026).

Tu objetivo es redactar la sección "2.5. Seguridad y Mitigación de Vulnerabilidades" para el documento de diseño técnico "design.md" de nuestro proyecto, basándote en el PRD de entrada y el modelo de datos agnóstico.

Por favor, estructura la documentación técnica de seguridad detallando con máximo rigor los siguientes 4 bloques:

---

# 💻 2.5. Seguridad y Mitigación de Vulnerabilidades

## 🔒 1. Sanitización de Entrada y Validación en Tiempo de Ejecución (Zero Trust en Entrada)
1. Detalla la estrategia de validación de datos en dos capas (Cliente para UX, Servidor para Seguridad).
2. Especifica el uso de esquemas de validación estrictos en tiempo de ejecución (ej. usando la librería Zod en Node.js) para sanitizar todos los payloads HTTP que entran por params, query y body antes de que interactúen con la capa de aplicación o dominio.
3. Prohíbe explícitamente el uso de expresiones regulares (regex) caseras para datos críticos (como validaciones de correos, números de teléfono o PINs), exigiendo librerías maduras y consolidadas (como DOMPurify para evitar Cross-Site Scripting - XSS).

## 🛡️ 2. Protección de Persistencia y Seguridad Física de Datos
1. Mitigación de SQL Injection (SQLi): Establece la obligatoriedad de que todas las consultas a la base de datos se realicen mediante consultas parametrizadas. Prohíbe explícitamente el uso de queries directas desprotegidas en el ORM (ej. evitar queryRawUnsafe de Prisma o sql.raw de Drizzle).
2. Gobernanza de Secretos de Entorno: Detalla la política de inyección de credenciales. Queda terminantemente prohibido persistir o hardcodear claves API o la variable "DATABASE_URL" en archivos del repositorio; todos los secretos deben cargarse dinámicamente en tiempo de ejecución mediante gestores de secretos (Doppler, Infisical o variables de entorno del runner).
3. Conexiones Seguras y Cifrado: Exige el uso obligatorio de conexiones cifradas (sslmode=verify-full) para la base de datos y detalla el uso de cifrado a nivel de columna para datos confidenciales (como PINs hashados o tokens).

## 📊 3. Clasificación de Riesgo bajo el EU AI Act y Privacidad de Datos
1. Clasifica el sistema de software bajo las categorías de riesgo del marco regulatorio de la Unión Europea (EU AI Act), justificando detalladamente su nivel (ej. si interactúa como un chatbot es Riesgo Limitado con obligaciones de transparencia, o si clasifica datos sensibles/empleados es Riesgo Alto con obligaciones de conformidad).
2. Detalla el cumplimiento con la directiva GDPR:
   - Principio de Minimización de Datos: Explica cómo el sistema limita la recopilación de datos de los usuarios a lo estrictamente necesario para la operación.
   - Privacidad por Diseño (Privacy by Design): Documenta el uso de técnicas de de-identificación o tokenización de información personal identificable (PII) si los datos deben transferirse a APIs de modelos LLM externos para auditorías o análisis.

## 🤖 4. Gobernanza del Agente de Codificación (Garantía Antialucinaciones y Seguridad de Código)
Para blindar al equipo contra la introducción de vulnerabilidades automatizadas, establece las siguientes directrices operativas de seguridad para el pipeline y el entorno de desarrollo:
1. Obligatoriedad de Security Review: Ningún bloque de código o script de pruebas generado por un copiloto de IA (v0, Lovable, Cursor Composer, etc.) se desplegará a producción sin pasar por una revisión estática de seguridad (SAST) y un code review manual realizado por un desarrollador senior.
2. Bloqueo de Slopsquatting: Establece la obligatoriedad de ejecutar escaneos de dependencias (como npm audit, Snyk o Dependabot) de forma continua en el pipeline para detectar paquetes maliciosos o inexistentes sugeridos erróneamente por las alucinaciones de los LLMs.
3. Principio de Menor Privilegio (Least Privilege): Los servidores MCP y herramientas del agente de IA local operarán en modo de solo lectura (read-only=true) sobre entornos con datos reales o pre-producción para evitar modificaciones destructivas accidentales.

---

Redacta las explicaciones técnicas con un tono formal, claro y extremadamente riguroso para auditores de seguridad. Comienza directamente con el título del archivo sin preámbulos.

Guarda el resultado en el archivo 'docs/07_restostock_security_strategy.md'
```

### Respuesta del agente de IA:
La estrategia de seguridad detallada y alineada con OWASP se encuentra en:
* [docs/07_restostock_security_strategy.md](docs/07_restostock_security_strategy.md)

### Nota de control humano:

---   

### **2.6. Tests**

**Prompt 1:**
```md
Actúa como un Senior QA Engineer y me ayudes a configurar las instrucciones de testing de mi proyecto.
Escribe una directiva estricta que le ordene a la IA seguir un proceso riguroso de Test-Driven Development (TDD):
- El agente de IA NUNCA debe escribir código de producción sin tener un test que falle primero.
- El agente de IA NUNCA debe modificar o reescribir un archivo de test existente para hacer pasar una implementación errónea, a menos que el contrato de negocio haya cambiado por orden explícita del humano.
- Exige que los tests utilicen aserciones semánticas descriptivas y mocks mínimos.

Guarda el resultado en el archivo 'docs/08_restostock_testing_strategy.md'
```

### Respuesta del agente de IA:
La directiva y estrategia de testing detallada (TDD y mocks mínimos) se encuentra en:
* [docs/08_restostock_testing_strategy.md](docs/08_restostock_testing_strategy.md)

### Nota de control humano:

---   

### 3. Modelo de Datos

**Prompt 1:**
```md
Eres un Administrador de Bases de Datos (DBA) experto en PostgreSQL.
Basándote en las entidades definidas en 'docs/02_restostock_prd.md' y 'docs/03_restostock_design.md', genera un esquema declarativo de base de datos para Prisma (`schema.prisma`).
Sigue estas directrices innegociables:
1. Normalización en Tercera Forma Normal (3NF).
2. Usa tipos de datos adecuados: nunca uses Float o Double para montos monetarios o salarios; usa estrictamente `Decimal`.
3. Para campos con dominios cerrados (como roles de usuario, estados de reserva, etc.), usa estrictamente Enums de Prisma en lugar de VARCHAR genéricos.
4. Define índices explícitos sobre las columnas que sufrirán más consultas y búsquedas frecuentes (ej. llaves foráneas o campos de búsqueda semántica), y justifica por qué elegiste indexar esos campos.
5. Usa la directiva `@map` para garantizar que la base de datos física siga la convención snake_case (`is_active`, `order_index`), pero mantén el tipado camelCase en mi código TypeScript.

Guarda el resultado en el archivo 'docs/09_restostock_database_schema.md'
```

### Respuesta del agente de IA:
El esquema declarativo de base de datos para Prisma (`schema.prisma`) y su justificación técnica se encuentra en:
* [docs/09_restostock_database_schema.md](docs/09_restostock_database_schema.md)

### Nota de control humano:

---

### 4. Especificación de la API

**Prompt 1:**
```md
Actúa como un Senior API Architect experto en especificaciones RESTful bajo el estándar OpenAPI 3.0.0 e ingeniería de software Contract-First.

Tu objetivo es diseñar la especificación de la API para dar soporte exclusivo al Flujo Prioritario (Happy Path de Negocio) detallado en los documentos adjuntos. Analiza el archivo 'docs/02_restostock_prd.md' y el esquema físico en 'docs/03_restostock_design.md' para asegurar la total coherencia de datos, llaves foráneas y tipos físicos.

Por favor, genera de manera exclusiva la sección de Contratos de la API estructurada bajo las siguientes pautas técnicas:

1. **Tabla de Endpoints del MVP (Formato README):**
   - Una tabla Markdown con las columnas: Método, Endpoint, Payload (Input), Respuesta (Output) y Descripción.
   - Restringe los endpoints estrictamente a los indispensables para resolver el flujo de negocio del MVP. No agregues operaciones CRUD genéricas si el PRD no las requiere como indispensables.

2. **Detalle Técnico por Endpoint (OpenAPI Spec Blueprint):**
   - Para cada endpoint listado, detalla de forma clara:
     - Ruta, Método e intenciones de negocio.
     - Cabeceras obligatorias (ej. Authorization JWT).
     - Payload del Request: Bloque JSON de ejemplo tipado, consistente con las tablas físicas (ej. tipos Decimal representados como números/strings exactos y IDs correlativos).
     - Respuesta Exitosa (200 OK o 201 Created): Bloque JSON de ejemplo documentando la estructura de salida.
     - Respuestas de Error Comunes (401 Unauthorized para autenticación o 422 Unprocessable Entity para reglas de negocio rotas) con un formato JSON autodescriptivo y campos consistentes.

3. **Mapeo de Tipos y Restricciones:**
   - Asegura que ningún payload envíe o reciba datos inconsistentes con las invariantes del dominio (ej. si el modelo de base de datos prohíbe el uso de Float para pesos, los endpoints deben manejar cantidades exactas con representación de alta precisión).

Genera tu respuesta en formato Markdown limpio, redactando las explicaciones lógicas en español (Latinoamérica) y manteniendo las claves JSON, parámetros de URL, tipos de datos e interfaces en inglés profesional para integración directa con compiladores de TypeScript. Comienza directamente con la documentación técnica sin preámbulos.

Guarda el resultado en el archivo 'docs/10_restostock_api_specification.md'
```

### Respuesta del agente de IA:
La especificación de la API detallada y alineada con OWASP se encuentra en:
* [docs/10_restostock_api_specification.md](docs/10_restostock_api_specification.md)

### Nota de control humano:

---

### 5. Historias de Usuario

**Prompt 1:**
```md
Actúa como un Senior Product Owner y Agile Coach experto en la redacción de requerimientos de producto bajo los estándares de INVEST y Behavior-Driven Development (BDD).

Tu objetivo es analizar minuciosamente el documento funcional provisto (PRD) para identificar y estructurar un backlog de Historias de Usuario de nivel profesional para el MVP, asegurando que cada una actúe como un contrato funcional inequívoco para el equipo de desarrollo.

Por favor, analiza el siguiente material: 
- `docs/02_restostock_prd.md` y `docs/03_restostock_design.md`

Genera la sección de Historias de Usuario estructurada bajo las siguientes pautas:

1. Lista las historias prioritarias identificadas para el MVP. Cada historia debe poseer:
   - Un código identificador único (ej. US-001).
   - Un título descriptivo y semántico.
   - El formato de negocio estricto: "Como [rol específico y con contexto de usuario, no 'el usuario' genérico], quiero [acción o capacidad funcional observable], para [valor, impacto o beneficio cuantificable de negocio]".

2. Para cada Historia de Usuario, define un mínimo de dos criterios de aceptación en formato BDD utilizando la sintaxis Given-When-Then (Gherkin):
   - Escenario 1 (Happy Path / Flujo de valor principal).
   - Escenario 2 (Flujo Alternativo de Error de negocio, validación o resiliencia).
   - Cada escenario debe enfocarse en comportamiento observable, evitar detalles de implementación técnica o diseño de UI, y ser directamente convertible en casos de prueba automatizados.

3. Incluye una breve evaluación de cada historia frente a los criterios INVEST, confirmando su independencia (I), valor (V) y tamaño manejable para un sprint (S).

Genera tu respuesta en Markdown limpio, redactando las explicaciones lógicas de negocio en español (Latinoamérica). Comienza tu respuesta directamente con el contenido, sin comentarios conversacionales preliminares.

Guarda cada historia en formato .md, una por archivo, dentro de la carpeta 'docs/user_stories/' con el nombre de archivo 'US-XXX.md' donde XXX es el número de la historia de usuario.

```
### Respuesta del agente de IA:
Las historias de usuario detalladas (en formato INVEST y BDD Gherkin) y su correspondiente índice se encuentran en:
* [docs/user_stories/indice_user_stories.md](docs/user_stories/indice_user_stories.md)

### Nota de control humano:

---

### 6. Tickets de Trabajo

**Prompt 1:**
```md
Actúa como un Senior Product Owner, Agile Coach y Technical Lead experto en metodologías ágiles de desarrollo e ingeniería de software basada en contratos (Design-First).

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) y el esquema lógico en "design.md" provistos para estructurar detalladamente la sección "6. Tickets de Trabajo y Trazabilidad (Backlog)" de cualquier sistema, dividiendo las Historias de Usuario en tareas atómicas y estimadas.

Analiza los siguientes documentos del sistema:
- Documento PRD / Funcional:
* `docs/02_restostock_prd.md`

- Documento de Diseño / Persistencia:
* `docs/03_restostock_design.md`

- Directorio de las Historias de usuario:
* `docs/user_stories/`

Por favor, genera de forma exclusiva la sección de Backlog en Markdown bajo las siguientes pautas de ingeniería de software:

1. **Matriz de Trazabilidad del Sprint Backlog:**
   - Una tabla con las columnas: ID Ticket (correlativo, ej. PROY-TK-01), ID US Relacionada (vínculo con las historias del PRD), Título del Ticket, Módulo/Vertical Slice afectado, Estimación de Puntos de Historia (escala Fibonacci estricta, limitando tickets técnicos a un máximo de 5 puntos de historia para cumplir INVEST) y la prioridad MoSCoW.

2. **Fichas de Especificación Técnica de Tickets:**
   - Para cada ticket de la matriz, genera una ficha técnica que defina:
     - Título descriptivo e intenciones lógicas de negocio.
     - Descripción detallada: Qué problema operativo resuelve y por qué es necesaria su implementación.
     - Alcance de Modificación de Archivos: Especificando en qué capas de la Arquitectura Hexagonal incidirá el cambio (Domain, Application, Infrastructure).
     - Criterios de Aceptación/DoD: Utilizando formato Given-When-Then (Gherkin) para componentes funcionales o endpoints de la API, y aserciones explícitas de seguridad o compilación para tareas técnicas.

Genera tu respuesta manteniendo las rutas de ficheros, interfaces de código, claves JSON de payloads y queries de base de datos en inglés técnico profesional. Comienza directamente con el contenido, sin introducciones conversacionales.

Guarda cada ticket generado en un archivo md dentro del directorio 'docs/tickets/', con el formato de nombre 'TK-XXX.md' donde XXX es el número de ticket.
Crea un archivo índice dentro de 'docs/tickets/', con el formato de nombre 'indice_tickets.md'.

```

### Respuesta del agente de IA:
La matriz de trazabilidad y las fichas técnicas detalladas de los tickets de trabajo del backlog se encuentran en:
* [docs/tickets/indice_tickets.md](docs/tickets/indice_tickets.md)

### Nota de control humano:

---

### 7. Pull Requests

**Prompt 1:**

```md
Actúa como un Tech Lead, Release Manager y experto en Git/DevOps. Tu objetivo es documentar de manera transparente el historial de integraciones del repositorio para la sección "7. Histórico de Pull Requests" del archivo "README.md" (o la plantilla correspondiente de nuestra entrega).

Por favor, ejecuta las siguientes tareas de forma autónoma utilizando tus herramientas de lectura de archivos y ejecución de terminal:

---

### Paso 1: Inspección de Git e Inicialización de Contexto
1. Ejecuta comandos de terminal como `git log --oneline -n 15` o `git branch` para identificar las ramas de características (feature branches) y los commits lógicos reales que se han realizado en el proyecto.
2. Si el repositorio aún no cuenta con un historial de commits maduro o te encuentras en una fase inicial de documentación, analiza la estructura de carpetas físicas en `/` y contrasta el backlog del proyecto para deducir qué hitos de desarrollo lógicos deben plasmarse para cumplir con el MVP.

### Paso 2: Redacción de la Especificación de 3 Pull Requests
Genera la documentación detallada de exactamente tres (3) Pull Requests consecutivas e incrementales. Cada Pull Request debe estructurarse con la siguiente plantilla de Markdown:

#### 🔄 PR #[Número]: [Título de la PR con Semántica Conventional Commits]
- **Ramas:** `[nombre-rama-origen]` ➡️ `main` (La rama origen debe reflejar el prefijo de feature y tus iniciales de entrega, ej. feature-auth-JL).
- **Ticket Relacionado:** Enlace lógico al ID del ticket técnico del backlog (ej. RS-TK-001).
- **Descripción del Cambio:** Un resumen breve de los archivos afectados clasificados por sus capas de arquitectura (Domain, Application, Infrastructure) y la justificación técnica de la integración.
- **Quality Gates (DoD):** Lista de verificación de las validaciones de calidad obligatorias que superó este cambio (ej. TypeScript compilado sin advertencias, tests de integración pasando en verde con Snyk/npm audit y cobertura del linter).

*Nota técnica:*
- El **PR #1** debe representar la base del sistema (ej. Inicialización de infraestructura, Docker de PostgreSQL y esquemas físicos ORM).
- El **PR #2** debe representar la primera funcionalidad core (ej. Autenticación por PIN o módulo de usuarios).
- El **PR #3** debe representar la lógica de negocio avanzada del MVP (ej. Gestión de remanentes, movimientos o consumo transaccional).

### Paso 3: Modificación del Archivo de Documentación
1. Lee el archivo "README.md" (o el archivo de entrega técnica especificado en tu contexto) para comprender su estado actual.
2. Localiza la sección "7. Histórico de Pull Requests" (o el final del documento) y escribe/reemplaza el contenido con las 3 fichas detalladas generadas en el Paso 2.
3. Preserva intacto todo el resto del documento; no realices modificaciones destructivas ni elimines información de secciones previas.

---

Redacta las explicaciones manteniendo un tono profesional, directo e impecable. Deja los fragmentos de código, nombres de archivos y configuraciones técnicas en inglés para garantizar la compatibilidad con el compilador. Ejecuta los cambios directamente en el archivo y muéstrame el diff resultante.

Guarda los últimos 3 PRs en la seccion 7. Pull Requests del archivo readme.md.

```

### Respuesta del agente de IA:
La documentación detallada e incremental del historial de 3 Pull Requests se ha integrado en la sección "7. Pull Requests" de [readme.md](readme.md).

### Nota de control humano: