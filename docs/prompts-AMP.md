# Historial de prompts 📑

## Categorización de Prompts 🏷️

- 📦 **Descripción general del producto** - Información sobre funcionalidades y características del producto
- 🏗️ **Diagrama de arquitectura** - Visualizaciones y representaciones gráficas del sistema
- 🧩 **Descripción de componentes principales** - Módulos, servicios y elementos clave del sistema
- 🗂️ **Descripción de alto nivel del proyecto y estructura de ficheros** - Organización general y estructura del proyecto
- ☁️ **Infraestructura y despliegue** - Configuración de servidores, contenedores y procesos de deployment
- 🛡️ **Seguridad** - Autenticación, autorización, protección de datos y medidas de seguridad
- 🧪 **Tests** - Estrategias de testing, casos de prueba y cobertura de código
- 🗃️ **Modelo de datos** - Estructura de bases de datos, esquemas y relaciones
- 🔌 **Especificación de la API** - Endpoints, parámetros, respuestas y documentación de APIs
- 👤 **Historias de usuario** - Requisitos funcionales y casos de uso del sistema
- 🎟️ **Tickets de trabajo** - Tareas, bugs y mejoras del proyecto

## Prompts 📝

### Prompt 1:
- **Categoría:** `📦 Descripción general del producto`
- **Prompt:** 
    ```
    Eres un Product Owner con experiencia en proyectos de IA. Yo seré el cliente y el que tenga todo el conocimiento de negocio y tecnico. Estoy trabajando en mi marca personal como software engineer, quiero entregar un valor agregado para que los reclutadores o potenciales clientes que se interesen en mi perfil me contacten. Actualmente en linkedin tengo buena presencia y me contactan bastante, pero quiero abarcar mas terreno fuea de linkedin y entregar informacion mas enriquecida sobre mi experiencia y trayectoria de trabajo. Para ello he creado un portfolio web con React, ya está productivo en @https://almapi.dev , la parte frontend esta ok pero me falta hacer el backend. Para mejorar la experiencia de usuario, en mi portfolio quiero crear un chatbot que simule ser yo, SOLO en terminos profesionales. Quiero que la ingesta de datos sea con información extraida de linkedin y otros origenes con todo el detalle de mi vida laboral y que los usuarios que visiten mi portfolio puedan chatear en lenguaje natural y saber todo lo que necesiten sobre mi perfil, en cualquier horario, en cualquier idioma. Esto también me permitirá mostrar mis habilidades en IA que es el campo donde me quiero insertar laboralmente. Debes crear el PRD con toda la información detallada que ayude a aterrizar la idea de negocio, de momento no entres en nada tecnico, enfocate en el QUE y no en el COMO. debes enriquecer la informacion con diagramas utilizando codigo mermaid. utiliza buenas practicas para la redaccion del PRD, documenta todo en formato markdown en un nuevo archivo PRD.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 2:
- **Categoría:** `📦 Descripción general del producto`
- **Prompt:** 
    ```
    En general el @PRD.md está bien, pero mejoras cosas como la planificacion y no te inventes % en los objetivos, como por ejemplo 300% aumentar el engagement. La planificacion no puede durar menes, solo tengo 30 hh, revisa @init.md . independiente de todos los origenes de informacion, todo converge en un unico documento que tendrá toda mi vida laboral y sobre ese doc se trabajará para entrenar el modelo. considera alguna forma no invasiva de obtener los datos del usuario minimos, asumiendo que se los puede inventar pero escoge uno q sea lo mas fidedigno posible para despues poder conectactarlo, por ejemplo correo o perfil de linkedin, nombre apellido y rol, o cual es su principal proposito para usar el chatbot. modifica todo lo necesario con esta nueva informacion. las secciones que eliminé del documento no las vuelvas a agregar
    ```
- **LLM:** Claude Sonnet 4

### Prompt 3:
- **Categoría:** `📦 Descripción general del producto`
- **Prompt:** 
    ```
    @PRD.md checkea si se especifica que la creacion del documento debe ser considerada como una tarea del proyecto, ya que no está creado. Tambien la conversacion con el chatbot abarca hablar sobre mis estudios, concepts estudiados etc. Ajusta lo necesario. Las secciones que ya borre no las vuelvas a agregar
    ```
- **LLM:** Claude Sonnet 4

### Prompt 4:
- **Categoría:** `📦 Descripción general del producto`
- **Prompt:** 
    ```
    @PRD.md checkea si el documento incluye las caracteristicas del sistema y se agrega que se deben generar estadisticas con el objetivo de ir mejorando la areas mas debiles del sistema con informacion mejorada: -preguntas realizadas con mas frecuencias -en que temas el usuario no queda conforme con las respuesta -secciones de mayor interes -tecnologias o stack tecnologico mas consultadas -que industrias o rubros son de mayor interes
    ```
- **LLM:** Claude Sonnet 4

### Prompt 5:
- **Categoría:** `👤 Historias de usuario`
- **Prompt:** 
    ```
    analiza @PRD.md y genera todas las historias de usuario necesarias para abarcar las funcionalidades del proyecto. guiate por la siguiente informacion y ejemplos: Estructura basica de una User Story Formato estándar: 'Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]'. Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea. Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como 'terminada', éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], 'cuando" [acción realizada], "entonces" [resultado esperado]. Notas adicionales: Notas que puedan ayudar al desarrollo de la historia Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada Ejemplos de User Story Desarrollo de Productos:'Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo.' Experiencia del Cliente:'Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla.' Aplicación Móvil:'Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente.' Estos ejemplos muestran cómo las User Stories se enfocan en las necesidades y objetivos de los usuarios finales, en lugar de en las funcionalidades técnicas. La estructura simple y el lenguaje natural ayudan a que todos los miembros del equipo, incluyendo stakeholders no técnicos, puedan entender y colaborar en el desarrollo del producto. Ejemplo completo: Título de la Historia de Usuario: Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación: [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales: [Cualquier consideración adicional] Historias de Usuario Relacionadas: [Relaciones con otras historias de usuario] cada user story debe tener un codigo de identificacion para facilitar el seguimiento formato HDU-XXX por ejemplo HDU-001 la parte numerica del codigo debe ser incremental y secuencial en la medida que se van creando las HDU agrupa las HDU dentro de epicas, las epicas deben tener un nombre representativo y una codificacion EP-XXX ejemplo EP-001, debe ser secuencial e incremental en la medida q se van creando tanto la epica como la hdu deben tener un titulo descriptivo claro y conciso sin ambiguedades documenta todo en @UserStories.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 6:
- **Categoría:** `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    Arma el Backlog de producto con las User Stories generadas anteriormente, genera otro documento product-backlog.md. Priorizalas con metodología MosCow. Estima por cada item en el backlog (genera una tabla markdown): Impacto en el usuario y valor del negocio. Urgencia basada en tendencias del mercado y feedback de usuarios. Complejidad y esfuerzo estimado de implementación. Riesgos y dependencias entre tareas. estima el esfuerzo de las historias usando la metodología tallas de camiseta y unidades en puntos de historia. las tallas de camiseta y unidades en puntos de historia deben estar directamente relacionadas. utiliza la siguiente informacion Tallas de camiseta: XS (1), S (2), M (5), L (8), XL (13+)
    ```
- **LLM:** Claude Sonnet 4

### Prompt 7:
- **Categoría:** `🏗️ Diagrama de arquitectura`
- **Prompt:** 
    ```
    eres un especialista en IA experimentado en chatbots. tu mision será redactar la propuesta tecnica de la solucion, para ello analiza @PRD.md @UserStories.md @product-backlog.md documenta todo en un archivo nuevo llamado tech-solution.md. deberas justificar la implementacion recomendada, te debes enfocar en una solucion que abarque el problema de negocio en su justa medida, sin overkill y minimizando costos. primera enfocate en la implementacion tecnica, sin especificar proveedores stack tecnologico, etc. es importante primero aterrizar la idea tecnicamente, despues vamos puliendo los detalles
    ```
- **LLM:** Claude Sonnet 4

### Prompt 8:
- **Categoría:** `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    ¿Cómo abordarías la implementación de la solución con RAG o In-Context Learning? Justifica tu respuesta
    ```
- **LLM:** Claude Sonnet 4

### Prompt 9:
- **Categoría:** `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    y se puede hacer un proceso previo para acortar el documento en el contexto? por ejemplo si la pregunta del usuario es por nua experiencia en especifico, ir al documento extraer solo ese texto y eso pasarselo al contexto para no utiliza tantos tokens?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 10:
- **Categoría:** `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    cual seria le mejor formato para el documento consolidado? json, yaml o markdown?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 11:
- **Categoría:** `🏗️ Diagrama de arquitectura`
- **Prompt:** 
    ```
    actualiza @tech-solution.md con la estrategia de In-Context Learning y smart context filtering. Tambien especifica el formato para el documento consolidado. Todos los diagramas que estan en el documento estan en formato markdown cambialo por mermaid
    ```
- **LLM:** Claude Sonnet 4

### Prompt 12:
- **Categoría:** `🛡️ Seguridad`
- **Prompt:** 
    ```
    Eres un arquitecto de IA experto en implementacion de chatbots. necesito que analices @tech-solution.md   y verifiques que este todo correcto o si es necesario algo mas para completar el proyecto con exito, si hace falta detallar algo modifica todo lo necesario o incluye mas diagramas que ayuden al TL y devs en la etapa de desarrollo y testing. no olvides considerar medidas para evitar ciberataques , asegurate de implementar buenas practicas para la seguridad guiate por owasp top 10 for llm https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-2023-slides-v1_0.pdf 

    si quieres saber mas detalles sobre el negocio revisa @PRD.md y @UserStories.md 
    ```
- **LLM:** Claude Sonnet 4

### Prompt 13:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    prefiero el back con python. el front ya esta productivo con react, seria solo agregar el componente chatbot. el website esta correiendo con cloud run de google cloud. dame una nueva propuesta con estos nuevos datos
    ```
- **LLM:** Claude Sonnet 4

### Prompt 14:
- **Categoría:** `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    sintetiza este analisis y agregalo en @tech-solution.md como stack recomendado, redactalo en un lenguaje q sea entendible para el equipo de desarrollo especialmente por el TL, para que tengan una guia de implementacion
    ```
- **LLM:** Claude Sonnet 4

### Prompt 15:
- **Categoría:** `🏗️ Diagrama de arquitectura`
- **Prompt:** 
    ```
    eres un lider tecnico experimentado en proyectos de IA. tu mision será implementar @tech-solution.md siguiendo las guias y recomendaciones que hicieron los especialistas y arquitectos en IA. Tendrás que ser capas de hacer las mejoras en el front ya existente y la creacion del backend

    front: @https://github.com/aandmaldonado/my-resume-react/tree/feature-init-prototype 

    back: @https://github.com/aandmaldonado/ai-resume-agent 

    apoyate en @PRD.md @UserStories.md @product-backlog.md para que no pierdas el foco en lo que se espera a nivel de negocio.

    detalla el diseño de la implementacion del sistema en design.md dentro de @docs/ apoyate en diagramas que mejoren el entendimiento.
    ```
- **LLM:** Claude Sonnet 4

### Prompt 16:
- **Categoría:** `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    para un mejor entendimiento y mayor trazabilidad genera el detalle de la implementacion en archivos diferentes backend-development.md y frontend-development.md con todos los lineamientos tecnicos para el equipo de desarrollo. Aplica buenas practicas de desarrollo, clean code, desarrollo seguro, etc.
    ```
- **LLM:** Claude Sonnet 4

### Prompt 17:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    Eres un Professional Machine Learning Engineer experto en GCP certificado por Google. necesito que revises en detalle y profundidad la documentacion del proyecto aun en fase de analisis y diseño, toda la documentacion ha sido redactada por PO, TL y especialista IA y arquitecto IA, como la solucion se implementara en GCP necesito la vision de un experto como tu, principalmente, enfocate en optimizacion de costos, seguridad y calidad del producto. antes de hacer cualquier modificacion entregame un reporte completo con tu revision y punto de vista. para ellos genera un nuevo archivo auditoria-gcp.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 19:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    aplica todas estas consideracion de optimizacion de costos en @auditoria-gcp.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 20:
- **Categoría:** `🔌 Especificación de la API`
- **Prompt:** 
    ```
    como TL asegurate que este bien especificado el modelo de datoa y la API, actualiza si es necesario @design.md @backend-development.md @frontend-development.md para agregar el detalle correspondiente, es necesario tener la definicion de la API, endpoints, entradas y salidas, contrato de API etc. se debe especificar tambien que se debe implementar swagger/openAPI para documentar la API
    ```
- **LLM:** Claude Sonnet 4

### Prompt 21:
- **Categoría:** `🗃️ Modelo de datos`
- **Prompt:** 
    ```
    eres un DBA senior, necesito que analices la documentacion tecnica @docs/  y valides que el modelo de datos definido cumple con lo esperado y abarca la necesidad de negocio. en caso de requerir ajustes modifica todos los archivos involucrados
    ```
- **LLM:** Claude Sonnet 4

### Prompt 22:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    como experto en GCP ves viable usar dialog flow en este proyecto? cuales serian las ventajas?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 23:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    que otros servicios ves viables para mejorar el proyecto?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 24:
- **Categoría:** `🏗️ Diagrama de arquitectura`
- **Prompt:** 
    ```
    de momento solo actualiza la documentacion tecnica para incorporar dialog flow al proyecto, actualiza documentos y dagramas. checkea todo en @docs/
    ```
- **LLM:** Claude Sonnet 4

### Prompt 25:
- **Categoría:** `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    Como lider tecnico experimentado en proyectos de IA analiza @UserStories.md y genera los Tickets de trabajo correspondientes. Aterrízalos técnicamente, tal y como se hace en las sprint planning.

    Apoyate en toda la documentacion del proyecto @docs/ 

    organizalos de tal forma que se puede aplicar un desarrollo incremental y funcional, define bien los alcances del proyecto y lo esperado en cada entregable. fijate bien en las fechas de entrega y los sprints definidos. no olvides que tenemos 30hh para completar el proyecto.

    documenta todo en un nuevo documento tickets.md

    el formato de redaccion para el ticket de trabajo debe ser el siguiente:

    Título Claro y Conciso: Un resumen breve que refleje la esencia de la tarea. Debe ser lo suficientemente descriptivo para que cualquier miembro del equipo entienda rápidamente de qué se trata el ticket.

    Descripción Detallada: Propósito: Explicación de por qué es necesaria la tarea y qué problema resuelve. Detalles Específicos: Información adicional sobre requerimientos específicos, restricciones, o condiciones necesarias para la realización de la tarea.

    Criterios de Aceptación: Expectativas Claras: Lista detallada de condiciones que deben cumplirse para que el trabajo en el ticket se considere completado. Pruebas de Validación: Pasos o pruebas específicas que se deben realizar para verificar que la tarea se ha completado correctamente.

    Prioridad: Una clasificación de la importancia y la urgencia de la tarea, lo cual ayuda a determinar el orden en que deben ser abordadas las tareas dentro del backlog.

    Estimación de Esfuerzo: Puntos de Historia o Tiempo Estimado: Una evaluación del tiempo o esfuerzo que se espera que tome completar el ticket. Esto es esencial para la planificación y gestión del tiempo del equipo.

    Asignación: Quién o qué equipo será responsable de completar la tarea. Esto asegura que todos los involucrados entiendan quién está a cargo de cada parte del proyecto.

    Etiquetas o Tags: Categorización: Etiquetas que ayudan a clasificar el ticket por tipo (bug, mejora, tarea, etc.), por características del producto (UI, backend, etc.), o por sprint/versión.

    Comentarios y Notas: Colaboración: Espacio para que los miembros del equipo agreguen información relevante, hagan preguntas, o proporcionen actualizaciones sobre el progreso de la tarea.

    Enlaces o Referencias: Documentación Relacionada: Enlaces a documentos, diseños, especificaciones o tickets relacionados que proporcionen contexto adicional o información necesaria para la ejecución de la tarea.

    Historial de Cambios: Rastreo de Modificaciones: Un registro de todos los cambios realizados en el ticket, incluyendo actualizaciones de estado, reasignaciones y modificaciones en los detalles o prioridades.

    aqui tienes un ejemplo de ticket de trabajo bien estructurado:

    Título: Implementación de Autenticación de Dos Factores (2FA)

    Descripción: Añadir autenticación de dos factores para mejorar la seguridad del login de usuarios. Debe soportar aplicaciones de autenticación como Authenticator y mensajes SMS.

    Criterios de Aceptación:

    Los usuarios pueden seleccionar 2FA desde su perfil. Soporte para Google Authenticator y SMS. Los usuarios deben confirmar el dispositivo 2FA durante la configuración. Prioridad: Alta

    Estimación: 8 puntos de historia

    Asignado a: Equipo de Backend

    Etiquetas: Seguridad, Backend, Sprint 10

    Comentarios: Verificar la compatibilidad con la base de usuarios internacionales para el envío de SMS.

    Enlaces: Documento de Especificación de Requerimientos de Seguridad

    Historial de Cambios:

    01/10/2023: Creado por [nombre] 05/10/2023: Prioridad actualizada a Alta por [nombre]
    ```
- **LLM:** Claude Sonnet 4

### Prompt 26:
- **Categoría:** `🧪 Tests`
- **Prompt:** 
    ```
    Para un mejor entendimiento de todas las partes involucradas utiliza @UserStories.md  y redacta el comportamiento del sistema usando enfoque BDD con lenguaje gherkin:

    Feature: Descripción general de lo que se está probando.
    Scenario: Un caso específico de uso o situación.
    Given: Configuración inicial del escenario.
    When: Acción o evento que se está probando.
    Then: Resultado esperado después de la acción.

    ejemplo:

    Feature: User login
    
        Scenario: User logs in with valid credentials
    
          Given the user is on the login page
    
          When the user enters a valid username and password
    
          Then the user should be redirected to the dashboard
    
    redactalo de tal manera que usuarios no tecnicos como la parte de negocio puedan entenderlo y que la parte tecnica como desarrolladores sean capaces de escribir los casos de pruebas a partir de este documento

    documenta todo en  BDD.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 27:
- **Categoría:** `🧪 Tests`
- **Prompt:** 
    ```
    Como lider de QA define la estrategia para probar el sistema, identifica que tipos de pruebas aplican y justifica su uso, define los casos de prueba y cobertura. documenta toda la estrategia de testing en QA.md apoyate en @UserStories.md @BDD.md 

    aplica @prompt-logging-rule.mdc
    ```
- **LLM:** Claude Sonnet 4

### Prompt 28:
- **Categoría:** `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros`
- **Prompt:** 
    ```
    Como arquitecto de software senior, analiza la estructura del proyecto chatbot de portfolio y genera un diagrama de alto nivel que muestre la organización de carpetas, archivos y dependencias. Incluye la estructura del frontend React, backend Python/FastAPI, documentación y configuración. El diagrama debe ser claro para desarrolladores y stakeholders, mostrando la arquitectura de carpetas y la relación entre componentes. Utiliza mermaid para crear una visualización clara y documenta todo en design.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 29:
- **Categoría:** `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros`
- **Prompt:** 
    ```
    Eres un DevOps Engineer experto en proyectos de IA. Analiza la documentación del proyecto chatbot y crea un diagrama de flujo de desarrollo que muestre el pipeline completo desde el desarrollo local hasta el despliegue en producción. Incluye entornos de desarrollo, testing, staging y producción, así como las herramientas de CI/CD, monitoreo y rollback. El diagrama debe mostrar claramente el proceso de integración continua y despliegue continuo. Documenta todo en design.md usando mermaid
    ```
- **LLM:** Claude Sonnet 4

### Prompt 30:
- **Categoría:** `🛡️ Seguridad`
- **Prompt:** 
    ```
    Como especialista en seguridad de aplicaciones web, analiza la documentación del proyecto chatbot y genera un plan de seguridad detallado que incluya: 1) Análisis de amenazas y vulnerabilidades específicas para chatbots de IA, 2) Implementación de medidas de seguridad para la API (rate limiting, validación de entrada, sanitización), 3) Protección de datos personales de usuarios (GDPR compliance), 4) Auditoría de seguridad del código y dependencias, 5) Plan de respuesta a incidentes. Documenta todo en un nuevo archivo security-plan.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 31:
- **Categoría:** `🛡️ Seguridad`
- **Prompt:** 
    ```
    Eres un experto en seguridad de LLMs y chatbots. Analiza la implementación del chatbot de portfolio y genera un documento de mejores prácticas de seguridad específicas para sistemas de IA conversacional. Incluye: 1) Prevención de prompt injection attacks, 2) Protección contra data leakage, 3) Validación de respuestas del LLM, 4) Monitoreo de comportamiento anómalo, 5) Implementación de content filtering. El documento debe ser técnicamente detallado y aplicable al proyecto. Documenta todo en security-plan.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 32:
- **Categoría:** `🗃️ Modelo de datos`
- **Prompt:** 
    ```
    Como DBA senior especializado en sistemas de IA, analiza el modelo de datos del chatbot de portfolio y genera un esquema de base de datos optimizado que incluya: 1) Tablas para usuarios, conversaciones, analytics y configuración, 2) Índices optimizados para consultas frecuentes, 3) Estrategias de particionamiento para datos históricos, 4) Políticas de backup y retención, 5) Migraciones y seeds de datos. El esquema debe ser escalable y eficiente para el volumen esperado. Documenta todo en backend-development.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 33:
- **Categoría:** `🗃️ Modelo de datos`
- **Prompt:** 
    ```
    Eres un Data Engineer experto en sistemas de analytics. Analiza el modelo de datos del chatbot y diseña un data warehouse para analytics avanzados que incluya: 1) Tablas de hechos para métricas de conversación, 2) Dimensiones para análisis temporal, geográfico y de usuario, 3) ETL pipelines para procesamiento de datos, 4) Agregaciones pre-calculadas para reportes, 5) Estrategias de optimización para consultas complejas. El diseño debe permitir análisis detallado del comportamiento del chatbot. Documenta todo en backend-development.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 34:
- **Categoría:** `🔌 Especificación de la API`
- **Prompt:** 
    ```
    Como API Architect senior, analiza la documentación del proyecto chatbot y genera una especificación OpenAPI 3.0 completa que incluya: 1) Todos los endpoints del chatbot (chat, analytics, configuración), 2) Esquemas de request/response detallados, 3) Códigos de error y manejo de excepciones, 4) Autenticación y autorización, 5) Rate limiting y throttling, 6) Ejemplos de uso para cada endpoint. La especificación debe ser completa y lista para implementación. Documenta todo en backend-development.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 35:
- **Categoría:** `🔌 Especificación de la API`
- **Prompt:** 
    ```
    Eres un experto en diseño de APIs RESTful. Analiza la API del chatbot de portfolio y genera un documento de estándares de API que incluya: 1) Convenciones de nomenclatura para endpoints, 2) Estructura de respuestas y manejo de errores, 3) Versionado de API y estrategias de backward compatibility, 4) Documentación con Swagger/OpenAPI, 5) Testing de API con Postman/Newman, 6) Monitoreo y métricas de API. Los estándares deben ser claros y aplicables al equipo de desarrollo. Documenta todo en backend-development.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 36:
- **Categoría:** `🧪 Tests`
- **Prompt:** 
    ```
    Como QA Lead especializado en testing de sistemas de IA, analiza la estrategia de testing del chatbot y genera un plan de testing de integración que incluya: 1) Testing de la integración Dialogflow + Vertex AI, 2) Testing de la API completa con diferentes escenarios, 3) Testing de performance y carga, 4) Testing de seguridad y vulnerabilidades, 5) Testing de usabilidad y accesibilidad. El plan debe ser ejecutable y cubrir todos los aspectos críticos del sistema. Documenta todo en QA.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 37:
- **Categoría:** `📦 Descripción general del producto`
- **Prompt:** 
    ```
    Eres un Product Manager experto en productos de IA. Analiza el PRD del chatbot de portfolio y genera un documento de roadmap de producto que incluya: 1) Fases de desarrollo con funcionalidades por versión, 2) Métricas de éxito y KPIs para cada fase, 3) Análisis de competencia y diferenciación, 4) Estrategia de lanzamiento y go-to-market, 5) Plan de iteración y mejora continua basado en feedback de usuarios. El roadmap debe ser realista y alineado con los objetivos de negocio. Documenta todo en product-roadmap.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 38:
- **Categoría:** `🏗️ Diagrama de arquitectura`
- **Prompt:** 
    ```
    Como arquitecto de sistemas distribuidos, analiza la arquitectura del chatbot de portfolio y genera un diagrama de arquitectura de deployment que muestre: 1) Infraestructura GCP completa (Cloud Run, Cloud SQL, Memorystore, Cloud Storage), 2) Redes y seguridad (VPC, firewall, load balancer), 3) Monitoreo y logging (Cloud Monitoring, Cloud Logging, Error Reporting), 4) CI/CD pipeline (Cloud Build, Cloud Deploy), 5) Disaster recovery y backup. El diagrama debe mostrar la arquitectura de producción completa. Documenta todo en design.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 39:
- **Categoría:** `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    Eres un Software Architect especializado en microservicios. Analiza la arquitectura del chatbot y genera un documento de diseño de componentes que incluya: 1) Descomposición en microservicios (chat service, analytics service, user service), 2) Patrones de comunicación entre servicios (síncrona/asíncrona), 3) Estrategias de resiliencia (circuit breaker, retry, fallback), 4) Gestión de estado y cache distribuido, 5) Estrategias de escalabilidad horizontal y vertical. El diseño debe ser escalable y mantenible. Documenta todo en design.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 40:
- **Categoría:** `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    Como Cloud Architect experto en GCP, analiza la infraestructura del proyecto chatbot y genera un documento de optimización de costos que incluya: 1) Análisis de costos actuales vs optimizados, 2) Estrategias de uso de free tier y capas gratuitas, 3) Optimización de recursos (CPU, memoria, almacenamiento), 4) Implementación de auto-scaling y cost controls, 5) Monitoreo de costos en tiempo real y alertas. El documento debe mostrar ahorros concretos y estrategias implementables. Documenta todo en auditoria-gcp.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 41:
- **Categoría:** `👤 Historias de usuario`
- **Prompt:** 
    ```
    Como UX Researcher experto en chatbots, analiza las historias de usuario del proyecto y genera un documento de investigación de usuario que incluya: 1) Personas y segmentos de usuario detallados, 2) Journey maps de la experiencia del usuario, 3) Análisis de usabilidad y accesibilidad, 4) Métricas de experiencia de usuario (NPS, CSAT, tiempo de respuesta), 5) Recomendaciones de mejora basadas en mejores prácticas de UX. El documento debe ser accionable para el equipo de diseño. Documenta todo en user-research.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 42:
- **Categoría:** `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    Eres un Scrum Master experto en proyectos de IA. Analiza los tickets de trabajo del proyecto chatbot y genera un documento de planificación de sprint que incluya: 1) Estimación de esfuerzo refinada para cada ticket, 2) Dependencias entre tareas y critical path, 3) Capacidad del equipo y asignación de recursos, 4) Definición de Done y criterios de aceptación, 5) Plan de mitigación de riesgos y contingencia. El plan debe ser realista y ejecutable en el tiempo disponible. Documenta todo en sprint-planning.md
    ```
- **LLM:** Claude Sonnet 4