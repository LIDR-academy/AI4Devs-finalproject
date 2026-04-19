> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Generación de PRD](#1-generacion-prd)
2. [Generación Backlog de producto](#2-generacion-backlog)
3. [Adaptar Readme Entrega1](#3-adaptar-readme-entrega1)

---

## 1. Generación de PRD

**Prompt 1:**

Quiero que generes un PRD estructurado para el proyecto que detallaré a continuación. 

ROLE 
Eres un experto product manager con amplia experiencia en creación de productos, análisis de mercado y diseño de propuestas de valor. Estás especializado en transformar ideas en conceptos de producto bien estructurados y claros. Tus responsabilidades principales: 

- Análisis de ideas: Cuando se te presenta una idea de producto, la desglosas sistemáticamente para entender su esencia principal, impacto potencial y viabilidad. Haces preguntas aclaratorias para descubrir supuestos ocultos y oportunidades. 

- Identificación de casos de uso: Destacas en descubrir y articular casos de uso específicos donde el producto aportaría valor. Piensas más allá de las aplicaciones obvias para identificar edge cases y oportunidades inesperadas. Presenta los casos de uso en un formato estructurado: 
  - Descripción del escenario 
  - Problema del usuario que se aborda 
  - Cómo el producto lo soluciona 
  - Resultado esperado 

- Definición del usuario objetivo: Creas perfiles de usuario detallados basados en: 
  - Necesidades específicas y puntos de dolor 
  - Alternativas actuales que utilizan 
  - Disposición a adoptar nuevas soluciones 
  - Segmentos de usuarios potenciales ordenados por oportunidad de mercado 

- Desarrollo de la propuesta de valor: Elaboras propuestas de valor convincentes utilizando marcos como: 
  - Análisis Jobs-to-be-Done 
  - Value Proposition Canvas 
  - Propuestas únicas de venta frente a competidores 
  - Articulación clara de beneficios frente a características 

Tu metodología: 
- Hacer antes las preguntas estratégicas necesarias para entender el contexto y las restricciones 
- Utilizar marcos estructurados adecuados 
- Identificar riesgos potenciales y estrategias de mitigación desde el principio 
- Sugerir enfoques de MVP para validar supuestos clave 
- Considerar la escalabilidad y las implicaciones del modelo de negocio 

CONTEXT:
ConRutina será un aplicativo web para la gestión de un sistema de calendarios semanales de rutinas y buenos hábitos, adaptados al usuario, y basado en la gamificación con el objetivo de incentivar la motivación y la constancia del usuario de una forma sostenida en el tiempo.  

El público objetivo son usuarios con voluntad de mejora en sus rutinas diarias, pero que tienen poca motivación ante el cambio, poca constancia y necesitan que se les incentive.  

La dinámica del aplicativo debe de seguir los siguientes principios:  
- Cada tarea del calendario debe llevar asociada una cantidad de puntos positivos si se marca como lograda, o puntos negativos (penalizaciones) si se marca como no conseguida.  
- Los puntos se considerarán nulos mientras no se marque la tarea con ningún estado.  
- En fase de MVP, el propio usuario será el responsable de cambiar el estado de cada tarea por día para la semana en curso mediante checkboxes.  
- Por otro lado, existirán las recompensas que tienen un coste de puntos.  
- El usuario puede canjear recompensas a medida que va obteniendo los puntos necesarios en la semana en curso.  
- Cada semana empezará con la puntuación a 0 y por tanto sólo puede canjear lso puntos de la semana en curso. 
- El usuario también debe tener la opción de crear nuevas rutinas y nuevas recompensas en cualquier momento, asignarles sus valores, y incorporarlos a la semana en curso.  
- Cuando una semana termina, debe de quedar bloqueada y no se puede modificar su puntuación.  
- Cuando una semana termina, en la pantalla principal debe de aparecer la nueva semana en curso y mostrar por defecto las mismas rutinas que el usuario tuviese en la semana anterior pero las puntuaciones a 0.  
- El usuario debe de poder consultar los resultados de las semanas anteriores, aunque estas estén bloqueadas. 
- Se guardará el histórico de las semanas, sus hábitos y puntuaciones de forma persistente en el bloqueo de cada semana. Las semanas no tienen porqué tener siempre los mismos hábitos asociados. Estos son editables por el usuario y pueden ser distintos cada semana. 

UI:  
- Clara y sencilla.  
- Puede ser una SPA (Single Page Application)  
- Amigable.  
- Orientada a la gamificación y con el foco en los logros alcanzados.  
- Debe de mostrar al menos estos 4 bloques en orden:  
  - Barra de progreso del día en curso.  
  - Bloque con contadores totales. Por ejemplo: semana anterior, semana en curso, total penalizaciones, mejor racha, etc.  
  - Calendario semanal con sus tareas y checks.  
  - Botón para añadir un nuevo hábito.  
  - Bloque con las recompensas a elegir y los puntos restantes para poder canjearlas  
  - Botón para añadir una nueva recompensa. 

Adjuntamos unas imágenes de referencia a modo de prototipo que deben de ayudar a mejorar este contexto.  

TECNOLOGÍA:  
- Queremos usar tecnologías actuales y ligeras.  
- Ejemplo para FrontEnd: React, Tailwind, Typescript, Vite.  
- Ejemplo Backend: Express, Prisma, API HTTP  
- Base de datos: PostgreSQL (en Docker)  
- Componentes Material  
- Arquitectura tipo “Clean Architecture” con separación de FrontEnd y BackEnd.  
- Respeta las tecnologías, estructuras, etc que implementadas en este primer MVP que existe en el proyecto actual (C:\Users\IsaacMani\Cursor\AI4DEVS-LIDR\ConRutina) 

 

GOAL:
Tu misión es diseñar la primera versión del sistema, entregando los siguientes artefactos: 
- Breve descripción del software ConRutina, valor añadido y ventajas competitivas. 
- Explicación de las funciones principales. 
- Añadir un diagrama Lean Canvas para entender el modelo de negocio. Muestra una breve descripción como resumen narrativo al inicio de cada bloque de Lean Canvas. 
- Descripción de los principales casos de uso, con el diagrama de casos de uso compatible correspondiente a cada uno. 
- Modelo de datos que cubra entidades, atributos (nombre y tipo) y relaciones, diagrama de ER y un bloque tipo "Relationships (summary)" que explica brevemente cada relación entre entidades utilizando una tabla corta con columnas: From, To, Cardinality, Description. 
- API (Alto-Nivel) que liste los posibles EndPoints e incluya una tabla de recursos y operaciones alineada con el modelo. 
- Diseño de sistema a alto nivel, tanto explicado como con un diagrama adjunto. 
- Diagramas C4 que profundicen en los componentes del sistema. Recuerda generar las 4 capas del diagrama. 
- Añade una breve descripción en cada Goal explicando que se va a mostrar y cuál es el propósito. 
- Out of Scope / Non-Goals listando los aspectos o funcionalidades que quedan fuera del MVP. 


Output Fil:e 
Crea un archivo markdown local en: ./docs/prd.md. 

 
Output Structure: 
Estructura el documento incluyendo los artefactos entregados. Utiliza markdown legible con encabezados apropiados, listas y bloques de código cuando sea útil. 

 
RULES: 
- Siempre utilizas Español. 
- Siempre utilizas Mermaid para los diagramas. 
- Mantienes un equilibrio entre visión optimista y evaluación realista. 
- Cuando necesites más información, pide todo lo necesario para proporcionar un análisis valioso. 

**Prompt 2:**

**Prompt 3:**

---

## 2. Generación Backlog de producto

**Prompt 1:**

Eres un "Product Owner" experto con conocimientos de "metodologías ágiles".  

Vas a generar un documento del tipo “Product backlog” a partir de un “PRD” y lo llamarás “ConRutina-Product-Backlog.md” en el directorio docs del proyecto. 

Quiero que analices el documento adjunto que es el PRD del proyecto (está en formato MarkDown), y que, basándote en el mismo, y en el código fuente actual, me identifiques todas las User Stories correspondientes partiendo de la premisa de empezar el proyecto desde el principio (greenfield), orquestando la infraestructura, diseñando el frontend, etc. 

En el análisis debes de detectar si falta algún aspecto importante e imprescindible para llevar a cabo un primer MVP y considerarlo. 

Añade, si es necesario, requisitos no funcionales de escalabilidad, seguridad, mantenibilidad y disponibilidad. 

Genera un primer bloque con la definición de cada una de las User Stories, donde debes de aplicar buenas prácticas, entre ellas las siguientes: 
- Crear cada US con un título conciso, claro y descriptivo. 
- Formato "Como [rol], quiero [acción], para [beneficio]" 
- Evaluación breve "INVEST" (Independent, Negotiable, Valuable, Estimable, Small, Testable). 
- Listar los "Acceptance Criteria" (AC) en formato "Behavior-Driven Development" (BDD) (Gherkin): Given/When/Then. 
- Los "Acceptance Criteria" (AC) deben de incluir el "happy path" y sugerir escenarios de "edge-cases". 
- Detectar algunos escenarios de error habituales. 
- Añadir una estimación de complejidad (S/M/L) 
- Clasificar según su importancia para el MVP siguiendo el método de priorización MoSCoW (Must have, Should have, Could Have, Won't Have). 

Una vez elaborada la lista de las US, quiero que valides la consistencia entre las que estén relacionadas. 

El siguiente paso es añadir un bloque donde se diseñe su Backlog, se listen las US sugiriendo su orden de priorización para el MVP (MoSCoW), y se tengan en cuenta criterios importantes como pueden ser los siguientes: 
- Valor para el Negocio. 
- Urgencia. 
- Dependencias. 
- Coste de implementación basado en esfuerzo y complejidad. 
- Riesgos y obstáculos potenciales. 
- Madurez tecnológica. 

Añade un bloque a modo de resumen con una matriz en formato tabla que resuma el backlog ordenado incluyendo las siguientes columnas: Item, Impacto usuario / negocio, Urgencia, Complejidad, Riesgos / dependencias, MoSCoW. 

Muestra también un roadmap en formato Mermaid con el Backlog priorizado por Sprints. Cada conjunto de US debe aportar funcionalidades completas. 


Por último, quiero que actúes cómo un "Project Manager" experto con conocimientos de "metodologías ágiles". Tu objetivo es analizar cada User Story del Backlog y dividirla en sus respectivos Tickets necesarios para su desarrollo y entrega del MVP. 

Los tickets deben de estar bien estructurados y tener un nombre breve, conciso, claro y descriptivo. Cada ticket debe de contener toda la información necesaria para llevarse a cabo su desarrollo, así como incluir las partes relevantes de la US a la que pertenecen, como pueden ser los "Acceptance Criteria", "happy path", "edge-cases", etc. También debe quedar muy claro en cada ticket a que US pertenece. Los tickets, al igual que se ha hecho con las User Stories, deben tener su estimación de complejidad (S/M/L) y unidades (puntos de historia).

**Prompt 2:**

**Prompt 3:**

---

### 3. Adaptar Readme Entrega1

**Prompt 1:**

Dado el fichero Markdown @readme-entrega-1.md , quiero que conserves exactamente esta estructura de documento y  rellenes cada punto con la información de los documentos @docs/prd.md  y @docs/product-backlog.md. 
No debes de inventar nada. 
Usa únicamente información de esos ficheros adjuntos. 
Utiliza el máximo de información posible siempre y cuando tenga sentido y sea relecante para cada punto. 
Utiliza también los gráficos de los ficheros.

**Prompt 2:**

**Prompt 3:**

