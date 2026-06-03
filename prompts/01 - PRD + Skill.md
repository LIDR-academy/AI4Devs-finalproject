# Diseño del sistema ConRutina
_Exported on 5/25/2026 at 21:29:06 UTC from Cursor (3.5.17)_

---

**User**

# PROMPT:

# Role

Eres un experto product manager con amplia experiencia en creación de productos, análisis de mercado y diseño de propuestas de valor. Estás especializado en transformar ideas en conceptos de producto bien estructurados y claros.
Tus responsabilidades principales:

1. Análisis de ideas: Cuando se te presenta una idea de producto, la desglosas sistemáticamente para entender su esencia principal, impacto potencial y viabilidad. Haces preguntas aclaratorias para descubrir supuestos ocultos y oportunidades.

2. Identificación de casos de uso: Destacas en descubrir y articular casos de uso específicos donde el producto aportaría valor. Piensas más allá de las aplicaciones obvias para identificar edge cases y oportunidades inesperadas. Presenta los casos de uso en un formato estructurado:
* Descripción del escenario
* Problema del usuario que se aborda
* Cómo el producto lo soluciona
* Resultado esperado

3. Definición del usuario objetivo: Creas perfiles de usuario detallados basados en:
* Necesidades específicas y puntos de dolor
* Alternativas actuales que utilizan
* Disposición a adoptar nuevas soluciones
* Segmentos de usuarios potenciales ordenados por oportunidad de mercado

4. Desarrollo de la propuesta de valor: Elaboras propuestas de valor convincentes utilizando marcos como:
* Análisis Jobs-to-be-Done
* Value Proposition Canvas
* Propuestas únicas de venta frente a competidores
* Articulación clara de beneficios frente a características

Tu metodología:

* Hacer antes las preguntas estratégicas necesarias para entender el contexto y las restricciones
* Utilizar marcos estructurados adecuados
* Identificar riesgos potenciales y estrategias de mitigación desde el principio
* Sugerir enfoques de MVP para validar supuestos clave
* Considerar la escalabilidad y las implicaciones del modelo de negocio

---

# Context

ConRutina será un aplicativo web para la gestión de un sistema de calendarios semanales de rutinas y buenos hábitos, adaptados al usuario, y basado en la gamificación con el objetivo de incentivar la motivación y la constancia del usuario de una forma sostenida en el tiempo. 

El público objetivo son usuarios con voluntad de mejora en sus rutinas diarias, pero que tienen poca motivación ante el cambio, poca constancia y necesitan que se les incentive. 

La dinámica del aplicativo debe de seguir los siguientes principios: 

- Cada tarea del calendario debe llevar asociada una cantidad de puntos positivos si se marca como lograda, o puntos negativos (penalizaciones) si se marca como no conseguida.  
- Los puntos se considerarán nulos mientras no se marque la tarea con ningún estado.  
- En fase de MVP, el propio usuario será el responsable de cambiar el estado de cada tarea por día para la semana en curso mediante checkboxes. 
- Por otro lado, existirán las recompensas que tienen un coste de puntos.  
- El usuario puede canjear recompensas a medida que va obteniendo los puntos necesarios en la semana en curso. 
- Cada semana empezará con la puntuación a 0 y por tanto sólo puede canjear los puntos de la semana en curso.
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
- Ejemplo Backend: Express, Prisma, API HTTP.
- Base de datos: PostgreSQL (en Docker).
- Componentes Material.
- Arquitectura tipo “Clean Architecture” con separación de FrontEnd y BackEnd. 
- Respeta las tecnologías, estructuras, etc indicadas en este primer MVP.

---

# Goal

Tu misión es diseñar la primera versión del sistema, entregando los siguientes artefactos:

* Breve descripción del software ConRutina, valor añadido y ventajas competitivas.
* Explicación de las funciones principales.
* Añadir un diagrama Lean Canvas para entender el modelo de negocio. Muestra una breve descripción como resumen narrativo al inicio de cada bloque de Lean Canvas.
* Descripción de los principales casos de uso, con el diagrama de casos de uso compatible correspondiente a cada uno.
* Modelo de datos que cubra entidades, atributos (nombre y tipo) y relaciones, diagrama de ER y un bloque tipo "Relationships (summary)"  que explica brevemente cada relación entre entidades utilizando una tabla corta con columnas: From, To, Cardinality, Description.
* Diseño de sistema a alto nivel, tanto explicado como con un diagrama adjunto.
* Diagramas C4 que profundicen en los componentes del sistema. Recuerda generar las 4 capas del diagrama.
* Añade una breve descripción en cada Goal explicando que se va a mostrar y cuál es el propósito.

---

# Output File

Crea un archivo markdown local en: `./docs/prd.md`.

---

# Output Structure

Estructura el documento incluyendo los artefactos entregados. Utiliza markdown legible con encabezados apropiados, listas y bloques de código cuando sea útil.

---

# Rules

* Siempre utilizas Español.
* Siempre utilizas Mermaid para los diagramas.
* Mantienes un equilibrio entre visión optimista y evaluación realista.
* Cuando necesites más información, pide todo lo necesario para proporcionar un análisis valioso.


@screenshots 

---

**Cursor**

Now let me look at the screenshot images to understand the visual design:

Now I have all the context needed. Let me create the comprehensive PRD document.

El documento ha sido creado en `docs/prd.md`. Aquí tienes un resumen de lo que contiene:

---

### Estructura del PRD — ConRutina

**1. Descripción del software**
Propuesta de valor, tabla comparativa con competidores (Habitica, Streaks, Notion) y ventajas diferenciales centradas en las recompensas autoconfiguradas y el historial inmutable.

**2. Funciones principales**
Seis bloques funcionales: gestión de hábitos, sistema de puntuación (doble: positivo/negativo), recompensas, calendario semanal + histórico, estadísticas, y perfil de usuario.

**3. Lean Canvas**
Los 9 bloques del modelo de negocio en formato tabla visual + resumen narrativo por bloque, incluyendo flujos de ingresos freemium y opción B2B para bienestar corporativo.

**4. Casos de uso (8 casos)**
UC-01 al UC-08 con diagrama general, descripción de escenario/problema/solución/resultado, y diagrama de secuencia Mermaid para cada caso.

**5. Modelo de datos**
- 6 entidades completas (User, Week, Habit, WeekHabit, HabitEntry, Reward, RewardRedemption) con todos sus atributos tipados
- Diagrama ER completo en Mermaid
- Tabla "Relationships summary" con 8 relaciones descritas

**6. Diseño del sistema a alto nivel**
Principios Clean Architecture, diagrama de capas ASCII, diagrama de arquitectura Mermaid, y descripción de los 3 flujos principales.

**7. Diagramas C4 (4 niveles)**
- C1 Contexto: ConRutina con el usuario y la BBDD
- C2 Contenedores: SPA + API + PostgreSQL y sus tecnologías
- C3 Componentes: desglose interno del frontend (12 componentes) y del backend (capas Clean Architecture)
- C4 Código: diagrama de clases del hook central `useHabitDashboard` con sus dependencias de dominio

---

**User**

Quiero que uses las mejoras prácticas del IDE Cursor y crees un agente o una skill, lo que mejor proceda, en este proyecto llamado "generate-prd" con el Contenido del prompt anterior, que sea capaz de generar un PRD como el que hemos generado, y que el bloque "Context" se deba de pasar como parámetro obligatorio.

---

**Cursor**

Revisando la estructura de skills del proyecto y la guía de creación de skills para implementar "generate-prd" correctamente.



Creando la skill del proyecto `generate-prd` (mejor encaje que un agente: versionable, descubrible por descripción y alineada con las prácticas de Cursor) y un comando `/generate-prd` para invocarla con el parámetro obligatorio **Context**.



He optado por una **skill de proyecto** (`generate-prd`) en lugar de un “agente” suelto: en Cursor las skills son el mecanismo recomendado para flujos repetibles, van en el repo con el equipo y la **descripción del frontmatter** ayuda a que el modelo las aplique cuando pides un PRD. Un agente genérico no quedaría versionado igual ni tan descubrible.

## Qué se ha creado

| Ruta | Propósito |
|------|-----------|
| [`.cursor/skills/generate-prd/SKILL.md`](.cursor/skills/generate-prd/SKILL.md) | Instrucciones del agente: rol PM, artefactos del PRD, español, Mermaid, **Context obligatorio** (si falta → no escribir archivo y pedir solo ese bloque). |
| [`.cursor/skills/generate-prd/reference-prd-structure.md`](.cursor/skills/generate-prd/reference-prd-structure.md) | Referencia detallada (esqueleto del doc, tipos de diagrama, calidad) — *progressive disclosure* para no hinchar la skill. |
| [`.cursor/commands/generate-prd.md`](.cursor/commands/generate-prd.md) | Comando **`/generate-prd`**: documenta el mismo contrato y enlaza a la skill. |

## Parámetro obligatorio: **Context**

La skill define que **no se genera el PRD** si no hay una sección explícita (`# Context`, `## Context`, etc.) con al menos: **producto**, **objetivo/restricciones** y **audiencia o problema**. Si falta, el agente debe pedir únicamente ese bloque (con el esqueleto incluido en la skill) y **no** crear el markdown hasta tenerlo.

## Cómo usarlo

1. **Natural:** *“Genera el PRD con la skill generate-prd”* y pegas el bloque **Context** (y opcionalmente **Goal** con la ruta, p. ej. `./docs/MiProducto-PRD.md`).
2. **Comando:** escribe **`/generate-prd`** y en el mismo mensaje incluye **`## Context`** con el contenido.

Cursor incluye automáticamente las skills del proyecto según su configuración; si en algún entorno no se cargara, basta con mencionar **@generate-prd** o la ruta del `SKILL.md` para forzar el contexto.

Si quieres que además quede registrado en **Cursor Rules** del repo (“cuando alguien diga PRD, usar generate-prd”), lo puedo añadir en un `.cursor/rules` mínimo sin tocar otros docs.

