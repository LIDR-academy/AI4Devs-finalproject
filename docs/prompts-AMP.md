# Historial de prompts 📑

## Categorización de Prompts 🏷️

- 📦 Descripción general del producto
- 🏗️ Arquitectura del sistema
- 🗺️ Diagrama de arquitectura
- 🧩 Descripción de componentes principales
- 🗂️ Descripción de alto nivel del proyecto y estructura de ficheros
- ☁️ Infraestructura y despliegue
- 🛡️ Seguridad
- 🧪 Tests
- 🗃️ Modelo de datos
- 🔌 Especificación de la API
- 👤 Historias de usuario
- 🎟️ Tickets de trabajo
- 🔀 Pull request


---

## Estadísticas 📈

| Categoría                               | Cantidad | Prompts                                 |
|-----------------------------------------|----------|------------------------------------------|
| 📦 Descripción general del producto     | 5        | Prompt 1, Prompt 3, Prompt 11, Prompt 20, Prompt 22            |
| 🏗️ Arquitectura del sistema            | 19       | Prompt 2, Prompt 4, Prompt 5, Prompt 6, Prompt 7, Prompt 8, Prompt 9, Prompt 10, Prompt 11, Prompt 12, Prompt 13, Prompt 17, Prompt 19, Prompt 20, Prompt 21, Prompt 22, Prompt 23, Prompt 24, Prompt 25 |
| 🗺️ Diagrama de arquitectura            | 4        | Prompt 2, Prompt 15, Prompt 16, Prompt 21           |
| 🧩 Descripción de componentes principales| 16       | Prompt 1, Prompt 2, Prompt 3, Prompt 5, Prompt 10, Prompt 11, Prompt 12, Prompt 14, Prompt 15, Prompt 16, Prompt 17, Prompt 19, Prompt 20, Prompt 21, Prompt 22, Prompt 23 |
| 🗂️ Descripción de alto nivel del proyecto y estructura de ficheros | 4 | Prompt 1, Prompt 15, Prompt 17, Prompt 19 |
| ☁️ Infraestructura y despliegue         | 9        | Prompt 6, Prompt 7, Prompt 8, Prompt 9, Prompt 13, Prompt 14, Prompt 16, Prompt 23, Prompt 24 |
| 🛡️ Seguridad                           | 2        | Prompt 13, Prompt 25                     |
| 🧪 Tests                                | 3        | Prompt 12, Prompt 24, Prompt 25          |
| 🗃️ Modelo de datos                     | 1        | Prompt 18                                |
| 🔌 Especificación de la API             | 1        | Prompt 18                                |
| 👤 Historias de usuario                 | 3        | Prompt 3, Prompt 4, Prompt 18            |
| 🎟️ Tickets de trabajo                  | 11       | Prompt 4, Prompt 5, Prompt 6, Prompt 7, Prompt 8, Prompt 9, Prompt 10, Prompt 12, Prompt 8, Prompt 9, Prompt 18 |
| 🔀 Pull request                         | 1        | Prompt 18                                |


**Total de prompts:** 25

---

## Prompts 📝

**Prompt 1:**
- **Categoría:** `📦 Descripción general del producto` `🧩 Descripción de componentes principales` `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros`
- **Prompt:** "Eres un Product Owner con experiencia en proyectos de IA. Yo seré el cliente y el que tenga todo el conocimiento de negocio y tecnico. Estoy trabajando en mi marca personal como software engineer, quiero entregar un valor agregado para que los reclutadores o potenciales clientes que se interesen en mi perfil y me contacten. Actualmente en linkedin tengo buena presencia y me contactan bastante, pero quiero abarcar mas terreno fuea de linkedin y entregar informacion mas enriquecida sobre mi experiencia y trayectoria de trabajo. Para ello he creado un portfolio web interactivo con React, aun está en progreso y no está productivo, la parte frontend esta ok pero me falta hacer el backend. Para mejorar la experiencia de usuario en mi portfolio quiero crear un chatbot que simule ser yo, SOLO en terminos profesionales. Quiero implementar un RAG con información extraida de linkedin y otro origenes con todo el detalle de mi vida laboral y que los usuarios que visiten mi portfolio puedan chatear en lenguaje natural y saber todo lo que necesiten sobre mi perfil, en cualquier horario, en cualquier idioma. Esto también me permitirá mostrar mis habilidades en IA que es el campo donde me quiero insertar laboralmente. Debes crear el PRD con toda la información detallada que ayude a aterrizar la idea de negocio, de momento no entres en nada tecnico. debes enriquecer la informacion con diagramas utilizando codigo plantuml"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 2:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🗺️ Diagrama de arquitectura` `🧩 Descripción de componentes principales`
- **Prompt:** "@PRD.md mejora el titulo del producto/proyecto debe ser relevante y atractivo enfocado en el chatbot IA. Mejora el documento apoyandote en diagramas relevantes para un mejor entendimiento, utiliza codigo mermaid e insertalo en la seccion correspondiente y deja el link a la imagen para cargarla posteriormente las imagenes las dejaré en @/diagramas. Actualiza las caracteristicas del sistema y agrega que se deben generar estadisticas con el objetivo de ir mejorando la areas mas debiles del sistema con informacion mejorada: -preguntas realizadas con mas frecuencias -en que temas el usuario no queda conforme con las respuesta -secciones de mayor interes -tecnologias o stack tecnologico mas consultadas -que industrias o rubros son de mayor interes"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 3:**
- **Categoría:** `👤 Historias de usuario` `📦 Descripción general del producto` `🧩 Descripción de componentes principales`
- **Prompt:** "analiza @PRD.md y genera todas las historias de usuario necesarias para abarcar las funcionalidades del proyecto. guiate por la siguiente informacion y ejemplos: Estructura basica de una User Story Formato estándar: 'Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]'. Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea. Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como 'terminada', éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], 'cuando" [acción realizada], "entonces" [resultado esperado]. Notas adicionales:  Notas que puedan ayudar al desarrollo de la historia Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada Ejemplos de User Story Desarrollo de Productos:'Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo.' Experiencia del Cliente:'Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla.' Aplicación Móvil:'Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente.' Estos ejemplos muestran cómo las User Stories se enfocan en las necesidades y objetivos de los usuarios finales, en lugar de en las funcionalidades técnicas. La estructura simple y el lenguaje natural ayudan a que todos los miembros del equipo, incluyendo stakeholders no técnicos, puedan entender y colaborar en el desarrollo del producto. Ejemplo completo: Título de la Historia de Usuario:  Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación: [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales: [Cualquier consideración adicional] Historias de Usuario Relacionadas: [Relaciones con otras historias de usuario] cada user story debe tener un codigo de identificacion para facilitar el seguimiento formato HDU-XXX por ejemplo HDU-001 la parte numerica del codigo debe ser incremental y secuencial en la medida que se van creando las HDU agrupa las HDU dentro de epicas, las epicas deben tener un nombre representativo y una codificacion EP-XXX ejemplo EP-001, debe ser secuencial e incremental en la medida q se van creando tanto la epica como la hdu deben tener un titulo descriptivo claro y conciso sin ambiguedades documenta todo en @UserStories.md "
- **LLM:** GPT-4.1

**Prompt 4:**
- **Categoría:** `🎟️ Tickets de trabajo` `👤 Historias de usuario` `🏗️ Arquitectura del sistema`
- **Prompt:** "Arma el Backlog de producto con las User Stories generadas anteriormente, agrega otra sección en @UserStories.md. Priorizalas con metodología MosCow. Estima por cada item en el backlog (genera una tabla markdown): Impacto en el usuario y valor del negocio. Urgencia basada en tendencias del mercado y feedback de usuarios. Complejidad y esfuerzo estimado de implementación. Riesgos y dependencias entre tareas. estima el esfuerzo de las historias usando la metodología tallas de camiseta y unidades en puntos de historia. las tallas de camiseta y unidades en puntos de historia deben estar directamente relacionadas. utiliza la siguiente informacion Tallas de camiseta: XS (1), S (2), M (5), L (8), XL (13+)"
- **LLM:** GPT-4.1

**Prompt 5:**
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** "analiza @UserStories.md y genera los Tickets de trabajo correspondientes. Aterrízalos técnicamente, tal y como se hace en las sprint planning. Apoyate tambien en la idea de negocio @PRD.md documenta todo en @Tickets.md el formato de redaccion para el ticket de trabajo debe ser el siguiente: Título Claro y Conciso: Un resumen breve que refleje la esencia de la tarea. Debe ser lo suficientemente descriptivo para que cualquier miembro del equipo entienda rápidamente de qué se trata el ticket. Descripción Detallada: Propósito: Explicación de por qué es necesaria la tarea y qué problema resuelve. Detalles Específicos: Información adicional sobre requerimientos específicos, restricciones, o condiciones necesarias para la realización de la tarea. Criterios de Aceptación: Expectativas Claras: Lista detallada de condiciones que deben cumplirse para que el trabajo en el ticket se considere completado. Pruebas de Validación: Pasos o pruebas específicas que se deben realizar para verificar que la tarea se ha completado correctamente. Prioridad: Una clasificación de la importancia y la urgencia de la tarea, lo cual ayuda a determinar el orden en que deben ser abordadas las tareas dentro del backlog. Estimación de Esfuerzo: Puntos de Historia o Tiempo Estimado: Una evaluación del tiempo o esfuerzo que se espera que tome completar el ticket. Esto es esencial para la planificación y gestión del tiempo del equipo. Asignación: Quién o qué equipo será responsable de completar la tarea. Esto asegura que todos los involucrados entiendan quién está a cargo de cada parte del proyecto. Etiquetas o Tags: Categorización: Etiquetas que ayudan a clasificar el ticket por tipo (bug, mejora, tarea, etc.), por características del producto (UI, backend, etc.), o por sprint/versión. Comentarios y Notas: Colaboración: Espacio para que los miembros del equipo agreguen información relevante, hagan preguntas, o proporcionen actualizaciones sobre el progreso de la tarea. Enlaces o Referencias: Documentación Relacionada: Enlaces a documentos, diseños, especificaciones o tickets relacionados que proporcionen contexto adicional o información necesaria para la ejecución de la tarea. Historial de Cambios: Rastreo de Modificaciones: Un registro de todos los cambios realizados en el ticket, incluyendo actualizaciones de estado, reasignaciones y modificaciones en los detalles o prioridades. aqui tienes un ejemplo de ticket de trabajo bien estructurado: Título: Implementación de Autenticación de Dos Factores (2FA) Descripción: Añadir autenticación de dos factores para mejorar la seguridad del login de usuarios. Debe soportar aplicaciones de autenticación como Authenticator y mensajes SMS. Criterios de Aceptación: Los usuarios pueden seleccionar 2FA desde su perfil. Soporte para Google Authenticator y SMS. Los usuarios deben confirmar el dispositivo 2FA durante la configuración. Prioridad: Alta Estimación: 8 puntos de historia Asignado a: Equipo de Backend Etiquetas: Seguridad, Backend, Sprint 10 Comentarios: Verificar la compatibilidad con la base de usuarios internacionales para el envío de SMS. Enlaces: Documento de Especificación de Requerimientos de Seguridad Historial de Cambios: 01/10/2023: Creado por [nombre] 05/10/2023: Prioridad actualizada a Alta por [nombre] cada ticket debe estar codificado con formato IC-XXX ejemplo IC-001 donde la parte numerica es incremental y secuencial en la medida que se vayan creando los tickets cada ticket debe indicar el codigo de HDU al cual esta relacionado"
- **LLM:** GPT-4.1

**Prompt 6:**
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue`
- **Prompt:** "analiza @PRD.md @UserStories.md @Tickets.md y genera el Product Roadmap"
- **LLM:** Gemini 2.5 Pro

**Prompt 7:**
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue`
- **Prompt:** "eres un experto planificador y necesitas generar la planificacion de todas los ticket @Tickets.md. para desarrollar todo el trabajo se dispone de 30 hh. La fecha de entrega de los entregables será: Documentación técnica: Miércoles 16 de septiembre 2025. Código funcional: Miércoles 14 de octubre 2025. Entrega final: Miércoles 28 de octubre 2025. para llevar el seguimiento de tareas necesito armar un tablero kanban, genera todo lo necesario para exportarlo a otra plataforma como trello. genera un diagrama a alto nivel con el roadmap del proyecto. documenta todo en @Planning.md"
- **LLM:** Gemini 2.5 Pro

**Prompt 8:**
- **Categoría:** `🎟️ Tickets de trabajo` `☁️ Infraestructura y despliegue` `🏗️ Arquitectura del sistema`
- **Prompt:** "ayudame a configurar el mcp de JIRA"
- **LLM:** Gemini 2.5 Pro

**Prompt 9:**
- **Categoría:** `🎟️ Tickets de trabajo` `☁️ Infraestructura y despliegue` `🏗️ Arquitectura del sistema`
- **Prompt:** "analiza @Tickets.md y @Planning.md y genera las tarjetas en JIRA: Las columnas del tablero de JIRA son: Backlog, To Do, In Progress, In Review, Done. Crealas todas en backlog. Crealas automaticamente."
- **LLM:** Gemini 2.5 Pro

**Prompt 10:**
- **Categoría:** `🎟️ Tickets de trabajo` `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** "modifica @Planning.md y detalla los sprints, cantidad de sprints, que se aborda en cada uno, cuanto durará cada sprint, etc. actualiza @Tickets.md con el numero de sprint correspondiente acorde a @Planning.md"
- **LLM:** Gemini 2.5 Pro

**Prompt 11:**
- **Categoría:** `📦 Descripción general del producto` `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** "eres un lider tecnico experimentado en proyectos de IA. tu mision será redactar la propuesta tecnica de la solucion, para ello analiza @PRD.md @UserStories.md @Tickets.md @Planning.md documenta todo en un archivo nuevo llamado tech-solution.md. si consideras que la complejidad de la solucion involucra cambios en otros archivos de los que ya analizaste, comentamelo por el chat"
- **LLM:** Gemini 2.5 Pro

**Prompt 12:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🎟️ Tickets de trabajo` `🧪 Tests`
- **Prompt:** "agrega los cambios recomendados en otros archivos: @UserStories.md: Añadir historias técnicas para monitoreo, logging y fallback de IA. @Tickets.md: Crear tickets para pruebas de carga, seguridad y backup. @PRD.md: Incluir explícitamente la arquitectura de integración Trello y el flujo de feedback. @Planning.md: Reservar buffer para pruebas y hardening en el último sprint."
- **LLM:** Gemini 2.5 Pro

**Prompt 13:**
- **Categoría:** `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue` `🛡️ Seguridad`
- **Prompt:** "modifica @tech-solution.md especifica el alcance, el front ya esta hecho, pero no desplegado, solo se hara el widget para el chatbot (React), backend se hará completo. el lenguaje de programacion será python, se usará la suite de google (GCP, gemini, etc.), control de versiones con github y ci-cd con github actions. para la seguridad guiate por owasp top 10 for llm @https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-2023-slides-v1_0.pdf ajusta del detalle de todas las herramientas, enfocadas en google (vertex ai, GCP, BD, despliegue del front, etc.). actualiza automaticamente cualquier cambio en otros archivos."
- **LLM:** Gemini 2.5 Pro

**Prompt 14:**
- **Categoría:** `🧩 Descripción de componentes principales` `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue`
- **Prompt:** "@tech-solution.md no vi en ninguna parte del documento algo sobre base de datos vectoriales para al implementacion del RAG. agrega la especificacion y el detalle enfocado en GCP no olvides actualizar @prompts-AMP.md"
- **LLM:** Gemini 2.5 Pro

**Prompt 15:**
- **Categoría:** `🗺️ Diagrama de arquitectura` `🧩 Descripción de componentes principales` `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros`
- **Prompt:** "asegurate de que  @tech-solution.md  contenga lo siguiente Diagrama de arquitectura, Descripción de componentes principales, Descripción de alto nivel del proyecto y estructura de ficheros, Infraestructura y despliegue, Seguridad, Tests"
- **LLM:** Gemini 2.5 Pro

**Prompt 16:**
- **Categoría:** `🗺️ Diagrama de arquitectura` `🧩 Descripción de componentes principales` `☁️ Infraestructura y despliegue`
- **Prompt:** "@tech-solution.md agrega los siguientes diagramas en las secciones correspondiente usando mermaid, asegurate que no haya parser error\n1. Diagrama de Secuencia de Interacción Usuario-Chatbot\n2. Diagrama de Componentes Backend\n3. Diagrama de Despliegue (Deployment)\n4. Flujo de CI/CD\n5. Flujo de Feedback y Analítica\n6. Mapa de Seguridad\n7. Flujo de Recuperación ante Fallos (Fallback)\n"
- **LLM:** GPT-4.1

**Prompt 17:**
- **Categoría:** `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros` `🧩 Descripción de componentes principales` `🏗️ Arquitectura del sistema`
- **Prompt:** "actualiza @tech-solution.md indicando que el repo donde se trabajará es @https://github.com/aandmaldonado/my-resume-react/tree/feature-init-prototype en ese repo ya existe toda la parte front y se debe agregar la parte del chatbot, actualiza la estructura de ficheros considerando la del repo y agregando los nuevos componentes que se crearan\nno olvidea actualizar @prompts-AMP.md"
- **LLM:** GPT-4.1

**Prompt 18:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🎟️ Tickets de trabajo` `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros`
- **Prompt:** "Eres un experto en planificacion de proyectos y Necesito que reorganices la informacion del proyecto y su planificación guiate por lo que se necesita entregar @init.md @readme.md Redefine las epicas para que sean relevantes y abarquen todo el proyecto desde el analisis hasta el despliegue y monitoreo. Los hitos serán las fechas de entrega descritas en @init.md cualquier diagrama que generes adicional hazlo en formato mermaid (asegurate de que no tenga error de sintaxis). Modifica toda la referencia a trabajar con trello y cambiala por la implementacion de un MCP para trabajar con suite Atlassian (JIRA y confluence) para la gestion del proyecto. crea los archivos necesarios en formato markdown para documentar por separado lo siguiente: - Ficha del proyecto - Descripción general del producto - Arquitectura del sistema - Modelo de datos - Especificación de la API - Historias de usuario - Tickets de trabajo - Pull requests genera un archivo por cada punto en la carpeta @docs/"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 19:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🗂️ Descripción de alto nivel del proyecto y estructura de ficheros` `🧩 Descripción de componentes principales`
- **Prompt:** "@docs/ Eres un líder tecnico con años de experiencia, necesitas cambiar algunas cosas del proyecto ya definido, te detallo a continuacion los cambios: el repo ya no es mono repo, el repo actual solo contiene el frontend y éste ya está desplegado en produccion @https://almapi.dev/ para el backend se creara un nuevo repo (aun no se crea, deja un placeholder en la documentacion) actualiza todos los documentos y diagramas necesarios para reflejar estos cambios."
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 20:**
- **Categoría:** `📦 Descripción general del producto` `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** "Eres un product owner, necesito que me ayudes a cambiar el nombre del proyecto el actual no me convencé: **AI-Powered Professional Avatar: Tu Gemelo Digital Profesional 🤖** de preferencia tiene q ser en ingles, llamativo y que genere impacto, conciso pero descriptivo. la principal caracteristica de este bot o agente, es que cualquier reclutador o persona q desee trabajar conmigo se haga una idea de mi perfil profesional chateando de manera natural 'supuestamente conmigo' asi tiene un aproach sin la necesidad de una primera entrevista o llamada telefonica. al implementar un sistema RAG tambien demuestro mis habilidades en IA q es hacia donde apunto laboralmente."
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 21:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales` `🗺️ Diagrama de arquitectura`
- **Prompt:** "Eres un arquitecto de IA experto en implementacion de sistemas RAG. necesito que analices toda la documentacion de @docs/ y verifiques este todo correcto o si es necesario algo mas para completar el proyecto con exito, si hace falta detallar algo modifica todo lo necesario o incluye mas diagramas que ayuden a los desarrolladores en la etapa de desarrollo y testing. no olvides considerar medidas para evitar ciberataques y generacion de costos excesivos en GCP"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 22:**
- **Categoría:** `📦 Descripción general del producto` `🏗️ Arquitectura del sistema` `🧩 Descripción de componentes principales`
- **Prompt:** "necesito que detalles, en toda la documentacion que sea necesaria, que la entrega primero será mediante streamlit para cumplir con el hito y si queda tiempo se probará directamente en @https://almapi.dev"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 23:**
- **Categoría:** `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue` `🧩 Descripción de componentes principales`
- **Prompt:** "como arquitecto IA especialista en RAG, implementa un plan de reduccion de costos en la planificacion e implementacion del proyecto, considera que el uso en el MVP será acotado y no quiero generar grandes gastos, utiliza modelos mas baratos, optimizacion de prompts, cache, etc. Modifica todos los documentos necesarios."
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 24:**
- **Categoría:** `🏗️ Arquitectura del sistema` `☁️ Infraestructura y despliegue` `🧪 Tests`
- **Prompt:** "Eres un Professional Machine Learning Engineer experto en GCP certificado por Google. necesito que revises en detalle y profundidad la documentacion @docs/ del proyecto aun en fase de analisis y diseño, toda la documentacion ha sido redactada por PO, TL y un ARQ IA, como la solucion se implementara en GCP necesito la vision de un experto como tu, principalmente, enfocate en optimizacion de costos, seguridad y calidad del producto. antes de hacer cualquier modificacion entregame un reporte completo con tu revision y punto de vista. para ellos genera un nuevo archivo .md"
- **LLM:** Claude-3-Sonnet-20240229

**Prompt 25:**
- **Categoría:** `🏗️ Arquitectura del sistema` `🧪 Tests` `🛡️ Seguridad`
- **Prompt:** "modifica la documentacion actual y agrega todas las mejoras identificadas"
- **LLM:** Claude-3-Sonnet-20240229

## Conclusiones 🏁