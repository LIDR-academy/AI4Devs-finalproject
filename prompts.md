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
```
Eres un Product Owner con experiencia en proyectos de IA. Yo seré el cliente y el que tenga todo el conocimiento de negocio y tecnico. Estoy trabajando en mi marca personal como software engineer, quiero entregar un valor agregado para que los reclutadores o potenciales clientes que se interesen en mi perfil me contacten. Actualmente en linkedin tengo buena presencia y me contactan bastante, pero quiero abarcar mas terreno fuea de linkedin y entregar informacion mas enriquecida sobre mi experiencia y trayectoria de trabajo. Para ello he creado un portfolio web con React, ya está productivo en @https://almapi.dev , la parte frontend esta ok pero me falta hacer el backend. Para mejorar la experiencia de usuario, en mi portfolio quiero crear un chatbot que simule ser yo, SOLO en terminos profesionales. Quiero que la ingesta de datos sea con información extraida de linkedin y otros origenes con todo el detalle de mi vida laboral y que los usuarios que visiten mi portfolio puedan chatear en lenguaje natural y saber todo lo que necesiten sobre mi perfil, en cualquier horario, en cualquier idioma. Esto también me permitirá mostrar mis habilidades en IA que es el campo donde me quiero insertar laboralmente. Debes crear el PRD con toda la información detallada que ayude a aterrizar la idea de negocio, de momento no entres en nada tecnico, enfocate en el QUE y no en el COMO. debes enriquecer la informacion con diagramas utilizando codigo mermaid. utiliza buenas practicas para la redaccion del PRD, documenta todo en formato markdown en un nuevo archivo PRD.md
```

**Prompt 2:**
```
Eres un Product Manager experto en productos de IA. Analiza el PRD del chatbot de portfolio y genera un documento de roadmap de producto que incluya: 1) Fases de desarrollo con funcionalidades por versión, 2) Métricas de éxito y KPIs para cada fase, 3) Análisis de competencia y diferenciación, 4) Estrategia de lanzamiento y go-to-market, 5) Plan de iteración y mejora continua basado en feedback de usuarios. El roadmap debe ser realista y alineado con los objetivos de negocio. Documenta todo en product-roadmap.md
```

**Prompt 3:**
```
Como UX Researcher experto en chatbots, analiza las historias de usuario del proyecto y genera un documento de investigación de usuario que incluya: 1) Personas y segmentos de usuario detallados, 2) Journey maps de la experiencia del usuario, 3) Análisis de usabilidad y accesibilidad, 4) Métricas de experiencia de usuario (NPS, CSAT, tiempo de respuesta), 5) Recomendaciones de mejora basadas en mejores prácticas de UX. El documento debe ser accionable para el equipo de diseño. Documenta todo en user-research.md
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```
eres un especialista en IA experimentado en chatbots. tu mision será redactar la propuesta tecnica de la solucion, para ello analiza @PRD.md @UserStories.md @product-backlog.md documenta todo en un archivo nuevo llamado tech-solution.md. deberas justificar la implementacion recomendada, te debes enfocar en una solucion que abarque el problema de negocio en su justa medida, sin overkill y minimizando costos. primera enfocate en la implementacion tecnica, sin especificar proveedores stack tecnologico, etc. es importante primero aterrizar la idea tecnicamente, despues vamos puliendo los detalles
```

**Prompt 2:**
```
Como arquitecto de sistemas distribuidos, analiza la arquitectura del chatbot de portfolio y genera un diagrama de arquitectura de deployment que muestre: 1) Infraestructura GCP completa (Cloud Run, Cloud SQL, Memorystore, Cloud Storage), 2) Redes y seguridad (VPC, firewall, load balancer), 3) Monitoreo y logging (Cloud Monitoring, Cloud Logging, Error Reporting), 4) CI/CD pipeline (Cloud Build, Cloud Deploy), 5) Disaster recovery y backup. El diagrama debe mostrar la arquitectura de producción completa. Documenta todo en design.md
```

**Prompt 3:**
```
Eres un DevOps Engineer experto en proyectos de IA. Analiza la documentación del proyecto chatbot y crea un diagrama de flujo de desarrollo que muestre el pipeline completo desde el desarrollo local hasta el despliegue en producción. Incluye entornos de desarrollo, testing, staging y producción, así como las herramientas de CI/CD, monitoreo y rollback. El diagrama debe mostrar claramente el proceso de integración continua y despliegue continuo. Documenta todo en design.md usando mermaid
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```
¿Cómo abordarías la implementación de la solución con RAG o In-Context Learning? Justifica tu respuesta
```

**Prompt 2:**
```
y se puede hacer un proceso previo para acortar el documento en el contexto? por ejemplo si la pregunta del usuario es por nua experiencia en especifico, ir al documento extraer solo ese texto y eso pasarselo al contexto para no utiliza tantos tokens?
```

**Prompt 3:**
```
Eres un Software Architect especializado en microservicios. Analiza la arquitectura del chatbot y genera un documento de diseño de componentes que incluya: 1) Descomposición en microservicios (chat service, analytics service, user service), 2) Patrones de comunicación entre servicios (síncrona/asíncrona), 3) Estrategias de resiliencia (circuit breaker, retry, fallback), 4) Gestión de estado y cache distribuido, 5) Estrategias de escalabilidad horizontal y vertical. El diseño debe ser escalable y mantenible. Documenta todo en design.md
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```
Como arquitecto de software senior, analiza la estructura del proyecto chatbot de portfolio y genera un diagrama de alto nivel que muestre la organización de carpetas, archivos y dependencias. Incluye la estructura del frontend React, backend Python/FastAPI, documentación y configuración. El diagrama debe ser claro para desarrolladores y stakeholders, mostrando la arquitectura de carpetas y la relación entre componentes. Utiliza mermaid para crear una visualización clara y documenta todo en design.md
```

**Prompt 2:**
```
Eres un lider tecnico experimentado en proyectos de IA. tu mision será implementar @tech-solution.md siguiendo las guias y recomendaciones que hicieron los especialistas y arquitectos en IA. Tendrás que ser capas de hacer las mejoras en el front ya existente y la creacion del backend

front: @https://github.com/aandmaldonado/my-resume-react/tree/feature-init-prototype 

back: @https://github.com/aandmaldonado/ai-resume-agent 

apoyate en @PRD.md @UserStories.md @product-backlog.md para que no pierdas el foco en lo que se espera a nivel de negocio.

detalla el diseño de la implementacion del sistema en design.md dentro de @docs/ apoyate en diagramas que mejoren el entendimiento.
```

**Prompt 3:**
```
para un mejor entendimiento y mayor trazabilidad genera el detalle de la implementacion en archivos diferentes backend-development.md y frontend-development.md con todos los lineamientos tecnicos para el equipo de desarrollo. Aplica buenas practicas de desarrollo, clean code, desarrollo seguro, etc.
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```
Eres un Professional Machine Learning Engineer experto en GCP certificado por Google. necesito que revises en detalle y profundidad la documentacion del proyecto aun en fase de analisis y diseño, toda la documentacion ha sido redactada por PO, TL y especialista IA y arquitecto IA, como la solucion se implementara en GCP necesito la vision de un experto como tu, principalmente, enfocate en optimizacion de costos, seguridad y calidad del producto. antes de hacer cualquier modificacion entregame un reporte completo con tu revision y punto de vista. para ellos genera un nuevo archivo auditoria-gcp.md
```

**Prompt 2:**
```
Como Cloud Architect experto en GCP, analiza la infraestructura del proyecto chatbot y genera un documento de optimización de costos que incluya: 1) Análisis de costos actuales vs optimizados, 2) Estrategias de uso de free tier y capas gratuitas, 3) Optimización de recursos (CPU, memoria, almacenamiento), 4) Implementación de auto-scaling y cost controls, 5) Monitoreo de costos en tiempo real y alertas. El documento debe mostrar ahorros concretos y estrategias implementables. Documenta todo en auditoria-gcp.md
```

**Prompt 3:**
```
prefiero el back con python. el front ya esta productivo con react, seria solo agregar el componente chatbot. el website esta correiendo con cloud run de google cloud. dame una nueva propuesta con estos nuevos datos
```

### **2.5. Seguridad**

**Prompt 1:**
```
Eres un arquitecto de IA experto en implementacion de chatbots. necesito que analices @tech-solution.md   y verifiques que este todo correcto o si es necesario algo mas para completar el proyecto con exito, si hace falta detallar algo modifica todo lo necesario o incluye mas diagramas que ayuden al TL y devs en la etapa de desarrollo y testing. no olvides considerar medidas para evitar ciberataques , asegurate de implementar buenas practicas para la seguridad guiate por owasp top 10 for llm https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-2023-slides-v1_0.pdf 

si quieres saber mas detalles sobre el negocio revisa @PRD.md y @UserStories.md
```

**Prompt 2:**
```
Como especialista en seguridad de aplicaciones web, analiza la documentación del proyecto chatbot y genera un plan de seguridad detallado que incluya: 1) Análisis de amenazas y vulnerabilidades específicas para chatbots de IA, 2) Implementación de medidas de seguridad para la API (rate limiting, validación de entrada, sanitización), 3) Protección de datos personales de usuarios (GDPR compliance), 4) Auditoría de seguridad del código y dependencias, 5) Plan de respuesta a incidentes. Documenta todo en un nuevo archivo security-plan.md
```

**Prompt 3:**
```
Eres un experto en seguridad de LLMs y chatbots. Analiza la implementación del chatbot de portfolio y genera un documento de mejores prácticas de seguridad específicas para sistemas de IA conversacional. Incluye: 1) Prevención de prompt injection attacks, 2) Protección contra data leakage, 3) Validación de respuestas del LLM, 4) Monitoreo de comportamiento anómalo, 5) Implementación de content filtering. El documento debe ser técnicamente detallado y aplicable al proyecto. Documenta todo en security-plan.md
```

### **2.6. Tests**

**Prompt 1:**
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

**Prompt 2:**
```
Como lider de QA define la estrategia para probar el sistema, identifica que tipos de pruebas aplican y justifica su uso, define los casos de prueba y cobertura. documenta toda la estrategia de testing en QA.md apoyate en @UserStories.md @BDD.md 

aplica @prompt-logging-rule.mdc
```

**Prompt 3:**
```
Como QA Lead especializado en testing de sistemas de IA, analiza la estrategia de testing del chatbot y genera un plan de testing de integración que incluya: 1) Testing de la integración Dialogflow + Vertex AI, 2) Testing de la API completa con diferentes escenarios, 3) Testing de performance y carga, 4) Testing de seguridad y vulnerabilidades, 5) Testing de usabilidad y accesibilidad. El plan debe ser ejecutable y cubrir todos los aspectos críticos del sistema. Documenta todo en QA.md
```

---

## 3. Modelo de Datos

**Prompt 1:**
```
eres un DBA senior, necesito que analices la documentacion tecnica @docs/  y valides que el modelo de datos definido cumple con lo esperado y abarca la necesidad de negocio. en caso de requerir ajustes modifica todos los archivos involucrados
```

**Prompt 2:**
```
Como DBA senior especializado en sistemas de IA, analiza el modelo de datos del chatbot de portfolio y genera un esquema de base de datos optimizado que incluya: 1) Tablas para usuarios, conversaciones, analytics y configuración, 2) Índices optimizados para consultas frecuentes, 3) Estrategias de particionamiento para datos históricos, 4) Políticas de backup y retención, 5) Migraciones y seeds de datos. El esquema debe ser escalable y eficiente para el volumen esperado. Documenta todo en backend-development.md
```

**Prompt 3:**
```
Eres un Data Engineer experto en sistemas de analytics. Analiza el modelo de datos del chatbot y diseña un data warehouse para analytics avanzados que incluya: 1) Tablas de hechos para métricas de conversación, 2) Dimensiones para análisis temporal, geográfico y de usuario, 3) ETL pipelines para procesamiento de datos, 4) Agregaciones pre-calculadas para reportes, 5) Estrategias de optimización para consultas complejas. El diseño debe permitir análisis detallado del comportamiento del chatbot. Documenta todo en backend-development.md
```

---

## 4. Especificación de la API

**Prompt 1:**
```
como TL asegurate que este bien especificado el modelo de datoa y la API, actualiza si es necesario @design.md @backend-development.md @frontend-development.md para agregar el detalle correspondiente, es necesario tener la definicion de la API, endpoints, entradas y salidas, contrato de API etc. se debe especificar tambien que se debe implementar swagger/openAPI para documentar la API
```

**Prompt 2:**
```
Como API Architect senior, analiza la documentación del proyecto chatbot y genera una especificación OpenAPI 3.0 completa que incluya: 1) Todos los endpoints del chatbot (chat, analytics, configuración), 2) Esquemas de request/response detallados, 3) Códigos de error y manejo de excepciones, 4) Autenticación y autorización, 5) Rate limiting y throttling, 6) Ejemplos de uso para cada endpoint. La especificación debe ser completa y lista para implementación. Documenta todo en backend-development.md
```

**Prompt 3:**
```
Eres un experto en diseño de APIs RESTful. Analiza la API del chatbot de portfolio y genera un documento de estándares de API que incluya: 1) Convenciones de nomenclatura para endpoints, 2) Estructura de respuestas y manejo de errores, 3) Versionado de API y estrategias de backward compatibility, 4) Documentación con Swagger/OpenAPI, 5) Testing de API con Postman/Newman, 6) Monitoreo y métricas de API. Los estándares deben ser claros y aplicables al equipo de desarrollo. Documenta todo en backend-development.md
```

---

## 5. Historias de Usuario

**Prompt 1:**
```
analiza @PRD.md y genera todas las historias de usuario necesarias para abarcar las funcionalidades del proyecto. guiate por la siguiente informacion y ejemplos: Estructura basica de una User Story Formato estándar: 'Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]'. Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea. Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como 'terminada', éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], 'cuando" [acción realizada], "entonces" [resultado esperado]. Notas adicionales: Notas que puedan ayudar al desarrollo de la historia Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada Ejemplos de User Story Desarrollo de Productos:'Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo.' Experiencia del Cliente:'Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla.' Aplicación Móvil:'Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente.' Estos ejemplos muestran cómo las User Stories se enfocan en las necesidades y objetivos de los usuarios finales, en lugar de en las funcionalidades técnicas. La estructura simple y el lenguaje natural ayudan a que todos los miembros del equipo, incluyendo stakeholders no técnicos, puedan entender y colaborar en el desarrollo del producto. Ejemplo completo: Título de la Historia de Usuario: Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación: [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales: [Cualquier consideración adicional] Historias de Usuario Relacionadas: [Relaciones con otras historias de usuario] cada user story debe tener un codigo de identificacion para facilitar el seguimiento formato HDU-XXX por ejemplo HDU-001 la parte numerica del codigo debe ser incremental y secuencial en la medida que se van creando las HDU agrupa las HDU dentro de epicas, las epicas deben tener un nombre representativo y una codificacion EP-XXX ejemplo EP-001, debe ser secuencial e incremental en la medida q se van creando tanto la epica como la hdu deben tener un titulo descriptivo claro y conciso sin ambiguedades documenta todo en @UserStories.md
```

**Prompt 2:**
```
Como UX Researcher experto en chatbots, analiza las historias de usuario del proyecto y genera un documento de investigación de usuario que incluya: 1) Personas y segmentos de usuario detallados, 2) Journey maps de la experiencia del usuario, 3) Análisis de usabilidad y accesibilidad, 4) Métricas de experiencia de usuario (NPS, CSAT, tiempo de respuesta), 5) Recomendaciones de mejora basadas en mejores prácticas de UX. El documento debe ser accionable para el equipo de diseño. Documenta todo en user-research.md
```

**Prompt 3:**
```
Como Product Manager experto en productos de IA. Analiza el PRD del chatbot de portfolio y genera un documento de roadmap de producto que incluya: 1) Fases de desarrollo con funcionalidades por versión, 2) Métricas de éxito y KPIs para cada fase, 3) Análisis de competencia y diferenciación, 4) Estrategia de lanzamiento y go-to-market, 5) Plan de iteración y mejora continua basado en feedback de usuarios. El roadmap debe ser realista y alineado con los objetivos de negocio. Documenta todo en product-roadmap.md
```

---

## 6. Tickets de Trabajo

**Prompt 1:**
```
Arma el Backlog de producto con las User Stories generadas anteriormente, genera otro documento product-backlog.md. Priorizalas con metodología MosCow. Estima por cada item en el backlog (genera una tabla markdown): Impacto en el usuario y valor del negocio. Urgencia basada en tendencias del mercado y feedback de usuarios. Complejidad y esfuerzo estimado de implementación. Riesgos y dependencias entre tareas. estima el esfuerzo de las historias usando la metodología tallas de camiseta y unidades en puntos de historia. las tallas de camiseta y unidades en puntos de historia deben estar directamente relacionadas. utiliza la siguiente informacion Tallas de camiseta: XS (1), S (2), M (5), L (8), XL (13+)
```

**Prompt 2:**
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

**Prompt 3:**
```
Eres un Scrum Master experto en proyectos de IA. Analiza los tickets de trabajo del proyecto chatbot y genera un documento de planificación de sprint que incluya: 1) Estimación de esfuerzo refinada para cada ticket, 2) Dependencias entre tareas y critical path, 3) Capacidad del equipo y asignación de recursos, 4) Definición de Done y criterios de aceptación, 5) Plan de mitigación de riesgos y contingencia. El plan debe ser realista y ejecutable en el tiempo disponible. Documenta todo en sprint-planning.md
```

---

## 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## Conversación Completa

Para acceder a la conversación completa y todos los prompts generados durante el desarrollo del proyecto, consulta el archivo: [docs/prompts-AMP.md](docs/prompts-AMP.md)

Este archivo contiene el historial completo de 42 prompts categorizados según las fases del desarrollo, incluyendo:
- Prompts de análisis y diseño inicial
- Prompts de implementación técnica
- Prompts de testing y calidad
- Prompts de documentación y despliegue
- Prompts de optimización y mejora continua
