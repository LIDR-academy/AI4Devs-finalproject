# Historial de prompts 📑

## Categorización de Prompts 🏷️

- 📦 **Descripción general del producto** - Información sobre funcionalidades y características del producto
- 🏗️ **Arquitectura del sistema** - Estructura técnica, patrones de diseño y decisiones arquitectónicas
- 🗺️ **Diagrama de arquitectura** - Visualizaciones y representaciones gráficas del sistema
- 🧩 **Descripción de componentes principales** - Módulos, servicios y elementos clave del sistema
- 🗂️ **Descripción de alto nivel del proyecto y estructura de ficheros** - Organización general y estructura del proyecto
- ☁️ **Infraestructura y despliegue** - Configuración de servidores, contenedores y procesos de deployment
- 🛡️ **Seguridad** - Autenticación, autorización, protección de datos y medidas de seguridad
- 🧪 **Tests** - Estrategias de testing, casos de prueba y cobertura de código
- 🗃️ **Modelo de datos** - Estructura de bases de datos, esquemas y relaciones
- 🔌 **Especificación de la API** - Endpoints, parámetros, respuestas y documentación de APIs
- 👤 **Historias de usuario** - Requisitos funcionales y casos de uso del sistema
- 🎟️ **Tickets de trabajo** - Tareas, bugs y mejoras del proyecto
- 🔀 **Pull request** - Cambios de código, revisiones y merge de funcionalidades

## Prompts 📝

### Prompt 1:
- **Categoría:** `📦 Descripción general del producto` `👤 Historias de usuario`
- **Prompt:** 
    ```
    Eres un Product Owner con experiencia en proyectos de IA. Yo seré el cliente y el que tenga todo el conocimiento de negocio y tecnico. Estoy trabajando en mi marca personal como software engineer, quiero entregar un valor agregado para que los reclutadores o potenciales clientes que se interesen en mi perfil me contacten. Actualmente en linkedin tengo buena presencia y me contactan bastante, pero quiero abarcar mas terreno fuea de linkedin y entregar informacion mas enriquecida sobre mi experiencia y trayectoria de trabajo. Para ello he creado un portfolio web con React, ya está productivo en @https://almapi.dev , la parte frontend esta ok pero me falta hacer el backend. Para mejorar la experiencia de usuario, en mi portfolio quiero crear un chatbot que simule ser yo, SOLO en terminos profesionales. Quiero que la ingesta de datos sea con información extraida de linkedin y otros origenes con todo el detalle de mi vida laboral y que los usuarios que visiten mi portfolio puedan chatear en lenguaje natural y saber todo lo que necesiten sobre mi perfil, en cualquier horario, en cualquier idioma. Esto también me permitirá mostrar mis habilidades en IA que es el campo donde me quiero insertar laboralmente. Debes crear el PRD con toda la información detallada que ayude a aterrizar la idea de negocio, de momento no entres en nada tecnico, enfocate en el QUE y no en el COMO. debes enriquecer la informacion con diagramas utilizando codigo mermaid. utiliza buenas practicas para la redaccion del PRD, documenta todo en formato markdown en un nuevo archivo PRD.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 2:
- **Categoría:** `📦 Descripción general del producto` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    En general el @PRD.md está bien, pero mejoras cosas como la planificacion y no te inventes % en los objetivos, como por ejemplo 300% aumentar el engagement. La planificacion no puede durar menes, solo tengo 30 hh, revisa @init.md . independiente de todos los origenes de informacion, todo converge en un unico documento que tendrá toda mi vida laboral y sobre ese doc se trabajará para entrenar el modelo. considera alguna forma no invasiva de obtener los datos del usuario minimos, asumiendo que se los puede inventar pero escoge uno q sea lo mas fidedigno posible para despues poder conectactarlo, por ejemplo correo o perfil de linkedin, nombre apellido y rol, o cual es su principal proposito para usar el chatbot. modifica todo lo necesario con esta nueva informacion. las secciones que eliminé del documento no las vuelvas a agregar
    ```
- **LLM:** Claude Sonnet 4

### Prompt 3:
- **Categoría:** `📦 Descripción general del producto` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    @PRD.md checkea si se especifica que la creacion del documento debe ser considerada como una tarea del proyecto, ya que no está creado. Tambien la conversacion con el chatbot abarca hablar sobre mis estudios, concepts estudiados etc. Ajusta lo necesario. Las secciones que ya borre no las vuelvas a agregar
    ```
- **LLM:** Claude Sonnet 4

### Prompt 4:
- **Categoría:** `📦 Descripción general del producto` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    @PRD.md checkea si el documento incluye las caracteristicas del sistema y se agrega que se deben generar estadisticas con el objetivo de ir mejorando la areas mas debiles del sistema con informacion mejorada: -preguntas realizadas con mas frecuencias -en que temas el usuario no queda conforme con las respuesta -secciones de mayor interes -tecnologias o stack tecnologico mas consultadas -que industrias o rubros son de mayor interes
    ```
- **LLM:** Claude Sonnet 4

### Prompt 5:
- **Categoría:** `👤 Historias de usuario` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    analiza @PRD.md y genera todas las historias de usuario necesarias para abarcar las funcionalidades del proyecto. guiate por la siguiente informacion y ejemplos: Estructura basica de una User Story Formato estándar: 'Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]'. Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea. Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como 'terminada', éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], 'cuando" [acción realizada], "entonces" [resultado esperado]. Notas adicionales: Notas que puedan ayudar al desarrollo de la historia Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada Ejemplos de User Story Desarrollo de Productos:'Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo.' Experiencia del Cliente:'Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla.' Aplicación Móvil:'Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente.' Estos ejemplos muestran cómo las User Stories se enfocan en las necesidades y objetivos de los usuarios finales, en lugar de en las funcionalidades técnicas. La estructura simple y el lenguaje natural ayudan a que todos los miembros del equipo, incluyendo stakeholders no técnicos, puedan entender y colaborar en el desarrollo del producto. Ejemplo completo: Título de la Historia de Usuario: Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación: [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales: [Cualquier consideración adicional] Historias de Usuario Relacionadas: [Relaciones con otras historias de usuario] cada user story debe tener un codigo de identificacion para facilitar el seguimiento formato HDU-XXX por ejemplo HDU-001 la parte numerica del codigo debe ser incremental y secuencial en la medida que se van creando las HDU agrupa las HDU dentro de epicas, las epicas deben tener un nombre representativo y una codificacion EP-XXX ejemplo EP-001, debe ser secuencial e incremental en la medida q se van creando tanto la epica como la hdu deben tener un titulo descriptivo claro y conciso sin ambiguedades documenta todo en @UserStories.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 6:
- **Categoría:** `🎟️ Tickets de trabajo` `📦 Descripción general del producto`
- **Prompt:** 
    ```
    Arma el Backlog de producto con las User Stories generadas anteriormente, genera otro documento product-backlog.md. Priorizalas con metodología MosCow. Estima por cada item en el backlog (genera una tabla markdown): Impacto en el usuario y valor del negocio. Urgencia basada en tendencias del mercado y feedback de usuarios. Complejidad y esfuerzo estimado de implementación. Riesgos y dependencias entre tareas. estima el esfuerzo de las historias usando la metodología tallas de camiseta y unidades en puntos de historia. las tallas de camiseta y unidades en puntos de historia deben estar directamente relacionadas. utiliza la siguiente informacion Tallas de camiseta: XS (1), S (2), M (5), L (8), XL (13+)
    ```
- **LLM:** Claude Sonnet 4

### Prompt 7:
- **Categoría:** `🏗️ Arquitectura del sistema` `📦 Descripción general del producto`
- **Prompt:** 
    ```
    eres un especialista en IA experimentado en chatbots. tu mision será redactar la propuesta tecnica de la solucion, para ello analiza @PRD.md @UserStories.md @product-backlog.md documenta todo en un archivo nuevo llamado tech-solution.md. deberas justificar la implementacion recomendada, te debes enfocar en una solucion que abarque el problema de negocio en su justa medida, sin overkill y minimizando costos. primera enfocate en la implementacion tecnica, sin especificar proveedores stack tecnologico, etc. es importante primero aterrizar la idea tecnicamente, despues vamos puliendo los detalles
    ```
- **LLM:** Claude Sonnet 4

### Prompt 8:
- **Categoría:** `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    ¿Cómo abordarías la implementación de la solución con RAG o In-Context Learning? Justifica tu respuesta
    ```
- **LLM:** Claude Sonnet 4

### Prompt 9:
- **Categoría:** `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    y se puede hacer un proceso previo para acortar el documento en el contexto? por ejemplo si la pregunta del usuario es por nua experiencia en especifico, ir al documento extraer solo ese texto y eso pasarselo al contexto para no utiliza tantos tokens?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 10:
- **Categoría:** `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** 
    ```
    cual seria le mejor formato para el documento consolidado? json, yaml o markdown?
    ```
- **LLM:** Claude Sonnet 4

### Prompt 11:
- **Categoría:** `🏗️ Arquitectura del sistema` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    actualiza @tech-solution.md con la estrategia de In-Context Learning y smart context filtering. Tambien especifica el formato para el documento consolidado. Todos los diagramas que estan en el documento estan en formato markdown cambialo por mermaid
    ```
- **LLM:** Claude Sonnet 4

### Prompt 12:
- **Categoría:** `🏗️ Arquitectura del sistema` `🛡️ Seguridad`
- **Prompt:** 
    ```
    Eres un arquitecto de IA experto en implementacion de chatbots. necesito que analices @tech-solution.md   y verifiques que este todo correcto o si es necesario algo mas para completar el proyecto con exito, si hace falta detallar algo modifica todo lo necesario o incluye mas diagramas que ayuden al TL y devs en la etapa de desarrollo y testing. no olvides considerar medidas para evitar ciberataques , asegurate de implementar buenas practicas para la seguridad guiate por owasp top 10 for llm https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-2023-slides-v1_0.pdf 

    si quieres saber mas detalles sobre el negocio revisa @PRD.md y @UserStories.md 
    ```
- **LLM:** Claude Sonnet 4

### Prompt 13:
- **Categoría:** `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue`
- **Prompt:** 
    ```
    prefiero el back con python. el front ya esta productivo con react, seria solo agregar el componente chatbot. el website esta correiendo con cloud run de google cloud. dame una nueva propuesta con estos nuevos datos
    ```
- **LLM:** Claude Sonnet 4

### Prompt 14:
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema`
- **Prompt:** 
    ```
    sintetiza este analisis y agregalo en @tech-solution.md como stack recomendado, redactalo en un lenguaje q sea entendible para el equipo de desarrollo especialmente por el TL, para que tengan una guia de implementacion
    ```
- **LLM:** Claude Sonnet 4

### Prompt 15:
- **Categoría:** `🏗️ Arquitectura del sistema` `🎟️ Tickets de trabajo`
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
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema`
- **Prompt:** 
    ```
    para un mejor entendimiento y mayor trazabilidad genera el detalle de la implementacion en archivos diferentes backend-development.md y frontend-development.md con todos los lineamientos tecnicos para el equipo de desarrollo. Aplica buenas practicas de desarrollo, clean code, desarrollo seguro, etc.
    ```
- **LLM:** Claude Sonnet 4

### Prompt 17:
- **Categoría:** `☁️ Infraestructura y despliegue` `🛡️ Seguridad`
- **Prompt:** 
    ```
    Eres un Professional Machine Learning Engineer experto en GCP certificado por Google. necesito que revises en detalle y profundidad la documentacion del proyecto aun en fase de analisis y diseño, toda la documentacion ha sido redactada por PO, TL y especialista IA y arquitecto IA, como la solucion se implementara en GCP necesito la vision de un experto como tu, principalmente, enfocate en optimizacion de costos, seguridad y calidad del producto. antes de hacer cualquier modificacion entregame un reporte completo con tu revision y punto de vista. para ellos genera un nuevo archivo auditoria-gcp.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 19:
- **Categoría:** `💰 Optimización de costos` `☁️ Infraestructura y despliegue` `🏗️ Arquitectura del sistema`
- **Prompt:** 
    ```
    aplica todas estas consideracion de optimizacion de costos en @auditoria-gcp.md
    ```
- **LLM:** Claude Sonnet 4

### Prompt 20:
- **Categoría:** `🔌 Especificación de la API` `🗃️ Modelo de datos` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    como TL asegurate que este bien especificado el modelo de datoa y la API, actualiza si es necesario @design.md @backend-development.md @frontend-development.md para agregar el detalle correspondiente, es necesario tener la definicion de la API, endpoints, entradas y salidas, contrato de API etc. se debe especificar tambien que se debe implementar swagger/openAPI para documentar la API
    ```
- **LLM:** Claude Sonnet 4

### Prompt 21:
- **Categoría:** `🗃️ Modelo de datos` `🏗️ Arquitectura del sistema` `🎟️ Tickets de trabajo`
- **Prompt:** 
    ```
    eres un DBA senior, necesito que analices la documentacion tecnica @docs/  y valides que el modelo de datos definido cumple con lo esperado y abarca la necesidad de negocio. en caso de requerir ajustes modifica todos los archivos involucrados
    ```
- **LLM:** Claude Sonnet 4

