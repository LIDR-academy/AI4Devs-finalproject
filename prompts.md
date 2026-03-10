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
En general el @PRD.md está bien, pero mejoras cosas como la planificacion y no te inventes % en los objetivos, como por ejemplo 300% aumentar el engagement. La planificacion no puede durar menes, solo tengo 30 hh, revisa @init.md . independiente de todos los origenes de informacion, todo converge en un unico documento que tendrá toda mi vida laboral y sobre ese doc se trabajará para entrenar el modelo. considera alguna forma no invasiva de obtener los datos del usuario minimos, asumiendo que se los puede inventar pero escoge uno q sea lo mas fidedigno posible para despues poder conectactarlo, por ejemplo correo o perfil de linkedin, nombre apellido y rol, o cual es su principal proposito para usar el chatbot. modifica todo lo necesario con esta nueva informacion. las secciones que eliminé del documento no las vuelvas a agregar
```

**Prompt 3:**
```
@docs/ necesito actualizar la documentacion del proyecto ya q esto es un entregable de mvp, tengo demasiados documentos la mayoria con informacion obsoleta, analiza que documentos ya no aplican para eliminarlos o los q no aporten valor y de los que sirven cuales se pueden agrupas y consolidar en otro documento, finalmente revisa el contenido q hay q actualizar segun el codigo y las mejoras actuales.

asegurate de q la documentacion sirva para completar todos estos puntos

0. Ficha del proyecto
0.1. Tu nombre completo:
0.2. Nombre del proyecto:
0.3. Descripción breve del proyecto:
0.4. URL del proyecto:
Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a alvaro@lidr.co usando algún servicio como onetimesecret.

0.5. URL o archivo comprimido del repositorio
Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a alvaro@lidr.co usando algún servicio como onetimesecret. También puedes compartir por correo un archivo zip con el contenido

1. Descripción general del producto
Describe en detalle los siguientes aspectos del producto:

1.1. Objetivo:
Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

1.2. Características y funcionalidades principales:
Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

1.3. Diseño y experiencia de usuario:
Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

1.4. Instrucciones de instalación:
Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

2. Arquitectura del Sistema
2.1. Diagrama de arquitectura:
Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

2.2. Descripción de componentes principales:
Describe los componentes más importantes, incluyendo la tecnología utilizada

2.3. Descripción de alto nivel del proyecto y estructura de ficheros
Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

2.4. Infraestructura y despliegue
Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

2.5. Seguridad
Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

2.6. Tests
Describe brevemente algunos de los tests realizados

3. Modelo de Datos
3.1. Diagrama del modelo de datos:
Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

3.2. Descripción de entidades principales:
Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

4. Especificación de la API
Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

5. Historias de Usuario
Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

Hstoria de Usuario 1

Hstoria de Usuario 2

Hstoria de Usuario 3

6. Tickets de Trabajo
Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

Ticket 1

Ticket 2

Ticket 3
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
eres un experto en IA especializado en la implementacion de RAG. Estoy creando un chatbot q hable como yo sobre mi experiencia laboral, pero no se comporta como deberia, esta cayendo excesivamente en fallback

datos del modelo:

# Google Gemini API (LLM alternativo)
    GEMINI_API_KEY: str = "[OBFUSCATED]"
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Modelo más rápido y menos restrictivo
    GEMINI_TEMPERATURE: float = 0.1
    GEMINI_TOP_P: float = 0.3  # Nucleus sampling para reducir alucinación
    GEMINI_MAX_TOKENS: int = 256  # Reducido de 1024 para minimizar costos

prompt:

template = f"""
Eres Álvaro Andrés Maldonado Pinto, Product Engineer con 15+ años de experiencia.
[...]
(Se omite el resto del prompt inicial por brevedad, ya que está documentado en prompts posteriores)
[...]
RESPUESTA:"""

estoy usando el contexto adjunto en el yaml (esto esta vectorizado)

problemas:

no responde preguntas tan basicas como cual es tu experiencia con java?

contenido en el yaml:
[...]

analiza el problema y propon soluciones efectivas
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
tengo este cloudbuild.yaml
[...]
(Se omite el YAML de Cloud Build por brevedad)
[...]
substitutions:
  _REGION: 'europe-west1'
  _CLOUD_SQL_CONNECTION_NAME: '[OBFUSCATED]'
  _CLOUD_SQL_HOST: '[OBFUSCATED]'
  _CLOUD_SQL_PORT: '5432'
  _CLOUD_SQL_DB: '[DB-NAME]'
  _CLOUD_SQL_USER: '[DB-USER]'
  _PORTFOLIO_BUCKET: '[BUCKET-NAME]'
[...]
despliega bien...

carga bien los secretos como variables de entorno

ambos secretos tienen permisos

el problema es q no puede leer las variables de entorno asociada a secretos y se cae al conectar la bd

q sugieres?
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
eres un experto en seguridad en proyectos de IA analiza el codigo y asegurate q estan mitigados los top10 owasp llm
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
aplique las mejoras q me indicaste, pero...

necesito mejorar algunas cosas, sigue teniendo fallbacks excesivos... te adjunto una conversacion de una prueba q hice
[...]
(Se omite el log de conversación por brevedad)
[...]
temas q rescato:
el fallback deberia ser en ingles o español dependiendo el idioma de la pregunta del usuario...
las respuesta q no sepa responder antes del fallback debe responder estrategicamente...
en respuesta fuera de scope como la liga de futbol?? hizo fallback y deberia responder algo como eso se escapa del foco de la conversacion... etc.
el yaml sigue siendo el mismo analiza si con todo lo q tiene de contexto podria haber armado una mejor respuesta...
luego de eso dame soluciones de mejoras efectivas...
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
tengo todas mis conversaciones de linkedin exportadas en un csv. vale la pena procesarlas y darle algun uso para mejorar al bot??
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
en las primera preguntas antes de la captura de datos que campos deberia enviar en el endpoint /chat?
```

---

## 5. Historias de Usuario

**Prompt 1:**
```
analiza @PRD.md y genera todas las historias de usuario necesarias para abarcar las funcionalidades del proyecto. guiate por la siguiente informacion y ejemplos: Estructura basica de una User Story Formato estándar: 'Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]'. Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea. Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como 'terminada', éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], 'cuando" [acción realizada], "entonces" [resultado esperado]. Notas adicionales: Notas que puedan ayudar al desarrollo de la historia Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada Ejemplos de User Story Desarrollo de Productos:'Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo.' Experiencia del Cliente:'Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla.' Aplicación Móvil:'Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente.' Estos ejemplos muestran cómo las User Stories se enfocan en las necesidades y objetivos de los usuarios finales, en lugar de en las funcionalidades técnicas. La estructura simple y el lenguaje natural ayudan a que todos los miembros del equipo, incluyendo stakeholders no técnicos, puedan entender y colaborar en el desarrollo del producto. Ejemplo completo: Título de la Historia de Usuario: Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación: [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales: [Cualquier consideración adicional] Historias de Usuario Relacionadas: [Relaciones con otras historias de usuario] cada user story debe tener un codigo de identificacion para facilitar el seguimiento formato HDU-XXX por ejemplo HDU-001 la parte numerica del codigo debe ser incremental y secuencial en la medida que se van creando las HDU agrupa las HDU dentro de epicas, las epicas deben tener un nombre representativo y una codificacion EP-XXX ejemplo EP-001, debe ser secuencial e incremental en la medida q se van creando tanto la epica como la hdu deben tener un titulo descriptivo claro y conciso sin ambiguedades documenta todo en @UserStories.md
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
```
haz el commit apra validar el precommit
```

**Prompt 2:**
```
cuando termines no despliegues por comando dejame hacerlo por push
```

**Prompt 3:**
```
no hizo nada el push se habia desconectado el repo, lo volvi a conectar, esta carganado
```

---

## Conversación Completa

Para acceder a la conversación completa y todos los prompts generados durante el desarrollo del proyecto, consulta el archivo: [docs/prompts-AMP.md](docs/prompts-AMP.md)

Este archivo contiene el historial completo de 130 prompts categorizados según las fases del desarrollo, incluyendo:
- Prompts de análisis y diseño inicial
- Prompts de implementación técnica
- Prompts de testing y calidad
- Prompts de documentación y despliegue
- Prompts de optimización y mejora continua
- Estadísticas y métricas detalladas de uso de prompts

### **Selección de Prompts Más Relevantes**

Los prompts seleccionados en este documento representan los **3 más relevantes de cada categoría** basados en:
- **Impacto en el proyecto**: Prompts que definieron la dirección del desarrollo
- **Complejidad técnica**: Prompts que abordaron desafíos técnicos importantes
- **Valor práctico**: Prompts que generaron resultados tangibles y aplicables

### **Categorías Incluidas:**
- 📦 **Descripción general del producto** (3 prompts)
- 🏗️ **Diagrama de arquitectura** (3 prompts)
- 🧩 **Descripción de componentes principales** (3 prompts)
- 🗂️ **Descripción de alto nivel** (3 prompts)
- ☁️ **Infraestructura y despliegue** (3 prompts)
- 🛡️ **Seguridad** (3 prompts)
- 🧪 **Tests** (3 prompts)
- 🗃️ **Modelo de datos** (3 prompts)
- 🔌 **Especificación de la API** (3 prompts)
- 👤 **Historias de usuario** (1 prompt)
- 🎟️ **Tickets de trabajo** (3 prompts)
