# 📋 **Análisis del Problema**

## **Ineficiencias en el Onboarding y Gestión del Conocimiento**

- **Onboarding fragmentado**: Poca eficiencia en el onboarding interno a devs sobre componentes, servicios y/o productos construidos por el área de ingeniería
- **Implementaciones frágiles**: Muchas implementaciones en código quedan frágiles por falta de conocimiento oportuno de las reglas de negocio vitales dentro de los procesos de la compañía
- **Documentación inaccesible**: Tenemos una wiki con instructivos especializados en Confluence, si. Pero acceder a ellos depende de que la persona sepa que esa wiki existe o que demore varios minutos filtrando la búsqueda de páginas relacionadas dentro de la herramienta

## **Deficiencias en la Gestión de Producto y Procesos**

- **Refinamiento deficiente**: Nos quedamos sin equipo de producto y ahora quien desempeña rol de Scrum Master junto con el líder técnico, documentan y pre refinan pobremente las historias de usuario y los tickets de trabajo
- **Falta de coordinación**: Dos equipos de desarrollo con productos a cargo, pero operando muchas veces sobre una misma base de datos o servicios transversales de los cuales hay poco conocimiento

## **Desconocimiento de la Arquitectura Existente**

- **Duplicación de código**: El desarrollo de nuevas iniciativas o integraciones, ignora muchas veces los sistemas o componentes existentes por desconocimiento que el equipo técnico tiene de la existencia de los mismos (lo que motiva a veces a duplicar código)
- **Falta de vistas arquitectónicas**: El equipo desconoce el nivel de acoplamiento o dependencia entre componentes o sistemas que deben mantener y modificar. Esto, porque no existen vistas de arquitectura "vivas" que muestren el estado del arte actual de la arquitectura de toda la solución
    - Estos diagramas y base de conocimiento, deben servir para razonar sobre nuevos cambios e incrementos funcionales, para detectar riesgos y evitar re procesos

## **Necesidades Ejecutivas**

- **Nice to have**: Para C-Level, utilidad conversaciones de product discovery con contexto de nuestros productos y servicios para nuevas iniciativas e incrementos de Q.
    - Un agente para planificación de frentes o iniciativas técnicas a partir de cambios o experimentos de negocio. AI-copilot para managers

# 🎯 **Propuesta de Solución: Nura**

## **Filosofía Central: "Vibe CEO'ing"**

- **Principio Fundamental**: "Tú diriges como CEO con recursos ilimitados, los agentes AI ejecutan como tu equipo especializado"

### **Valores Centrales**

1. **Maximizar el aprovechamiento de la IA**: Empuja a la AI a entregar más, itera hasta la excelencia
2. **Control de calidad**: Tú eres el árbitro final de calidad
3. **Supervisión estratégica**: Mantén la visión de alto nivel
4. **Refinamiento iterativo**:  Espera revisitar pasos, no es proceso lineal
5. **Instrucciones claras**: Peticiones precisas = mejores resultados
6. **La documentación es clave**: Buenos inputs (briefs, PRDs) = buenos outputs

### **Filosofía de Diseño**

- **Los agentes desarrollan código, los agentes de planeación planifican** – No mezclar responsabilidades
- **Lenguaje natural primero** – Con bloques de código y formato natural (markdown si es necesario) para la UI
- **Especialización de agentes** – Cada agente maestro en una función específica
- **Transiciones limpias** – Contextos frescos entre agentes para máxima efectividad

## **Características del Producto**

### **Sistema Multi-Agente Especializado**

- Personas cognitivas por rol con capacidades de autonomía, planificación y acción
- Contexto proactivo: Aun sin una pregunta explícita, la herramienta debe mostrar información relevante (decisiones, PRs, docs, vistas de arquitectura, y cualquier información o contexto relacionado con la necesidad del usuario, pero basado en toda la base de código y documentación del área de ingeniería recolectada durante la etapa de carga de información)

### **Usuarios Objetivo**

- **Área de Ingeniería**: Para todo lo relacionado con SDLC
- **Corporativos y C-Level**: Para todo lo relacionado con el negocio, ventas, data science, y consulta de características funcionales de los productos tecnológicos de la compañía

## **Capacidades Clave**

### **Onboarding Inteligente**

- **Onboarding técnico para devs**: Acelerar el entendimiento de un proyecto o lineamientos del área de ingeniería sin depender de onboarding manual de otro dev con mayor seniority
- **Guía de buenas prácticas** de desarrollo del área de ingeniería de la compañía (esto debe ser auto-detectado por el sistema, pero al mismo tiempo debe haber una opción para alimentar ese contexto)

### **Análisis de Infraestructura**

- **Recomendación de stack tecnológico** para nuevos proyectos o la evolución de proyectos existentes. El sistema deberá conectarse a los repositorios y AWS para comprender que tecnologías usamos. Debe existir un proceso de sincronización previo y análisis de toda la malla de servicios e infraestructura. Será un proceso asíncrono por la duración y complejidad del mismo
- **Conectar con AWS** (por CLI o por MCP) para contar con un "service map" vivo que comprenda la malla de servicios actuales y los que se vayan sumando a toda la solución de la arquitectura propietaria del equipo de ingeniería. Para comprender de forma inteligente que dependencias y nivel de acoplamiento existen entre ellas
    - Poder pedir en un solo sitio a un agente que me diga que dependencias tiene una unidad de despliegue, a recursos externos o servicios internos

### **Capacidades de Desarrollo**

- **Feature para diseño** de mockups e interfaces de usuario para nuevas funcionalidades
- **Conexión contra base de datos** de lectura (configurable) para creación y ejecución de consultas de base de datos para alimentar el contexto de una conversación
    - También la opción de entregarle al desarrollador una query construida correctamente a partir de la profunda comprensión del modelo de datos y buenas prácticas para garantizar la eficiencia en su
    ejecución

### **Gestión de Conocimiento**

- **Proporciona fuentes** para cada respuesta (si las tiene) para soportar y fundamentar el porque de las desiciones o respuestas entregadas
- **Modo: Hablar con documentos** cargados a mano o con base de conocimiento desde Google Drive, Confluence o Notion
- **Entrega de snippets de código** para CI/CD y DevOps basado en los repositorios de IoC almacenados en Bitbucket

### **Planificación y Gestión**

- **Creación de plan de trabajo** con subtareas propuestas por la IA de cara a un nuevo desarrollo o modificación
    - Identificar restricciones de arquitectura
    - Identificar posibles fallas. Crear un pre-mortem

# 🏗️ **Overview Técnico**

## **Sistema de Agentes**

### **🎯 Equipo Principal de Desarrollo**

1. **`analyst` (Business Analyst)** 📊
    - **Función**: Investigación de mercado y análisis competitivo
    - **Responsabilidad**: Análisis estratégico, brainstorming, brief de proyectos
    - **Cuándo usar**: Planificación inicial, investigación, documentación de proyectos existentes
2. **`pm` (Product Manager)** 📋
    - **Función**: Creación de PRDs y priorización de features
    - **Responsabilidad**: Planificación estratégica, roadmaps, gestión de producto
    - **Cuándo usar**: Definición de requisitos, planificación estratégica
3. **`architect` (Solution Architect)** 🏗️
    - **Función**: Diseño de sistemas, arquitectura y documentación técnica
    - **Responsabilidad**: Arquitectura escalable, decisiones técnicas complejas
    - **Cuándo usar**: Sistemas complejos, planificación de escalabilidad
4. **`dev` (Developer)** 💻
    - **Función**: Implementación de código y debugging
    - **Responsabilidad**: Desarrollo, testing, implementación técnica
    - **Cuándo usar**: Todas las tareas de desarrollo y codificación
5. **`devops` (DevOps Engineer)** 🛠️
    - **Función**: Automatización de infraestructura y delivery continuo
    - **Responsabilidad**: CI/CD, infraestructura como código, monitoreo y confiabilidad de sistemas
    - **Cuándo usar**: Despliegues, configuración de entornos, monitoreo y optimización en la nube
6. **`qa` (QA Specialist)** 🧪
    - **Función**: Planificación de testing, code review y aseguramiento de calidad
    - **Responsabilidad**: Estrategias de testing, validación de bugs
    - **Cuándo usar**: Testing, revisión de código, validación de calidad
7. **`ux-expert` (UX Designer)** 🎨
    - **Función**: Diseño UI/UX y prototipos
    - **Responsabilidad**: Experiencia de usuario, diseño de interfaces
    - **Cuándo usar**: Diseño de interfaces, experiencia de usuario
8. **`po` (Product Owner)** 📝
    - **Función**: Gestión de backlog y validación de historias
    - **Responsabilidad**: Refinamiento de historias, criterios de aceptación
    - **Cuándo usar**: Gestión de historias, validación de requisitos
9. **`sm` (Scrum Master)** 🎯
    - **Función**: Planificación de sprints y creación de historias
    - **Responsabilidad**: Gestión de proyectos, workflow
    - **Cuándo usar**: Creación de historias desde épicas, gestión de sprints

### **🤖 Meta Agentes**

1. **`nura-orchestrator` (Team Coordinator)** 🎼
    - **Función**: Coordinación multi-agente y cambio de roles
    - **Responsabilidad**: Workflows complejos multi-rol
    - **Cuándo usar**: Tareas que requieren múltiples especialistas
2. **`nura-master` (Universal Expert)** 🔧
    - **Función**: Todas las capacidades sin cambiar de agente
    - **Responsabilidad**: Trabajo comprehensive en una sola sesión
    - **Cuándo usar**: Tareas que requieren múltiples roles sin fragmentar

### **Flujo de Trabajo Típico**

- **Planificación** → `analyst` (investigación) → `pm` (PRD) → `architect` (diseño)
- **Desarrollo** → `sm` (historias) → `dev` (implementación) → `qa` (revisión)

## **Capacidades de Integración**

### **Gestión de Código Legacy**

- **Conector con Jira** para implementación de tickets de desarrollo
- **Entender código heredado (legacy code)**: Facilidad para comprender código antiguo sin documentación clara. También permitirá convertir de código legado a stacks modernos

### **Flujos de Integración**

- **Desde la interfaz de chatbot**: Opción para listar y seleccionar repositorio de bitbucket para anexarlo a la sesión como referencia y concentrar el contexto únicamente en las unidades de código de ese repositorio y poder tener conversaciones en lenguaje natural
- **Desde el IDE** (VS Code o CursorAI): Extensión del producto original, se construirá un plugin de VS Code o CursorAI para que esta característica viva dentro del entorno de desarrollo y que los devs no tengan que salir de su IDE para obtener respuesta y poder conversar con el repositorio de forma natural, pero con el contexto extendido del entendimiento de todos los repositorios, servicios,  arquitecturas, documentación técnica, bases de conocimiento del área de ingeniería y características, incrementos funcionales o evolución de los sistemas

## **Integraciones**

### **Herramientas de Desarrollo**

- Jira
- Bitbucket
- GitHub
- Jenkins
- ArgoCD
- GitHub Actions

### **Gestión de Documentos**

- Google Drive
- Google Sheets (poder usar un libro de excel como contexto en una conversación)
- Confluence
- Notion

### **Comunicación**

- Google Chat
- Slack

### **MCPs (Model Context Protocols)**

- Context7
- Pensamiento Secuencial
- Magic MCP
- Puppeteer
- Playwright
- Atlassian (Jira, Confluence)
- AWS

### **Consultas Externas**

- Sitios web externos para consulta de referencia

# 🚀 **Funcionalidades Core**

## **1. 🏗️ Sistema de Gestión de Agentes**

### **Para Desarrolladores**

- **Agent Hub**: Panel central con todos los agentes especializados
- **Context Switcher**: Cambio fluido entre agentes (@dev, @qa, @architect, etc…), pero conservando el contexto del problema en la sesión o proyecto en curso
- **Agent Status**: Mostrar estado actual y disponibilidad de cada agente
- **Fresh Context Management**: Auto-creación de contextos limpios por workflow, sesión o proyecto

### **Para Analistas/PMs**

- **Planning Suite**: Acceso directo a analyst, pm, architect
- **Document Generator**: Workflows guiados para generación de PRDs, arquitectura, benchmark y product discovery

## **2. 📋 Gestión de Workflows y Estados**

### **Story Management Dashboard**

- **Status Pipeline**: Draft → Approved → InProgress → Done
- **Epic Breakdown**: Visualización de épicas → historias → subtareas (conectado a Jira)
- **Progress Tracking**: Métricas de avance por desarrollador/equipo (Conectado a Jira y Bitbucket)
- **Dependency Mapping**: Relaciones entre historias y componentes

### **Document Lifecycle**

- **Document Sharding**: Auto-división de PRDs/arquitectura para simplificar el contexto, dividir y vencer, y que el LLM se especialice en analizar aspectos particulares de la solución para ser más eficiente, y haga uso de las otras partes del contexto si lo considera necesario
- **Version Control**: Histórico de cambios en PRDs y arquitecturas
- **Validation Gates**: Checklists automáticos de calidad

## **3. 🔧 Project Context Engine**

### **Brownfield Intelligence (proyectos con base existente)**

- **Codebase Analysis**: Auto-documentación de proyectos existentes
- **Legacy Integration**: Mapeo de código existente → nuevas features
- **Risk Assessment**: Evaluación automática de impacto de cambios

### **Greenfield Setup (proyectos desde cero)**

- **Project Bootstrap**: Configuración inicial guiada
- **Tech Stack Selection**: Recomendaciones basadas en requerimientos y el stack tecnológico aprendido
- **Architecture Templates**: Patrones proven para diferentes tipos de proyecto

## **4. 🎨 Collaborative Development Interface**

### **Para Equipos de Desarrollo**

- **Parallel Development**: Múltiples devs trabajando diferentes historias
- **Code Review Workflows**: Integración automática con qa agent
- **Real-time Status**: Dashboard de progreso compartido
- **Handoff Management**: Transiciones SM → Dev → QA automatizadas

### **Para Stakeholders No-Técnicos**

- **Executive Dashboard**: Métricas de alto nivel y progreso
- **Requirements Validation**: Preview de features antes de desarrollo con criterios de aceptación
- **Change Request Management**: Proceso estructurado para modificaciones

## **5. 💡 AI-Powered Intelligence Layer**

### **Smart Recommendations**

- **Next Best Action**: Sugerencias contextuales basadas en estado actual
- **Resource Optimization**: Asignación inteligente de agentes a tareas
- **Quality Prediction**: Alertas tempranas sobre posibles issues
- **Performance Analytics**: Métricas de eficiencia del equipo

### **Context Enhancement**

- **Auto-Context Loading**: Carga automática de archivos relevantes por agente. Como si de un banco de memoria por contexto / proyecto se tratara
- **Smart Caching**: Optimización de memoria y tokens. Identificando y cachando de forma inteligente, l búsquedas similares entre todos los colaboradores del equipo de desarrollo
- **Cross-Reference Intelligence**: Detección automática de dependencias