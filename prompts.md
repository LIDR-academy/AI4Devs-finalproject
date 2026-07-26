# Registro de Prompts Relevantes (Entrega Final)

> **Nota:** Este archivo contiene los prompts reales utilizados durante la recta final del desarrollo, extraídos directamente del log de conversaciones (`_log.md`) y centrados en el trabajo posterior a la Entrega 2. El proceso completo de desarrollo ha estado orquestado por el meta-workflow propio **LIDR Specboot**, por lo que el usuario rara vez pide "escribe código", sino que orquesta el ciclo de vida mediante comandos (`/opsx-propose`, `/opsx-apply`, `/verify-change`) y enfoca sus prompts en corregir y refinar los artefactos (propuestas, diseño, código y UI) generados por el agente.

---

## Sección 1: Fase 09 - Extracción de Parámetros con Inteligencia Artificial

**Contexto:** Se planeaba posponer el procesamiento de PDFs, pero el usuario decidió avanzar con una solución híbrida (Multimodal) en tiempo real, priorizando la arquitectura y la experiencia de usuario (UX).

**Prompt Clave 1: Corrección de la Propuesta (Proposal) - Estrategia Multimodal**
```text
En el proposal no me gustó esto: Instead, the AI will accept **pasted text** (e.g., from a datasheet PDF) as input, allowing the core extraction functionality to work immediately. 

No, lo que quiero es que aunque no podamos guardar el PDF porque no podemos guardarlo aún, que se pueda subir y analizar. Y para el análisis quiero que se usen una estrategia mixta de extracción de texto y OCR usando un modelo multimodal como Gemini Flash (usaremos la API de Google), pero como siempre el diseño debe permitir que podamos cambiar el modelo y el endpoint de manera fácil (modularidad).
```
*Cómo guié al asistente:* El desarrollo inició orquestando el ciclo con `/opsx-propose`. Al revisar el artefacto `proposal.md` generado por el agente, noté que sugirió inicialmente usar texto pegado para facilitar el MVP. Intervine inmediatamente rechazando el artefacto para exigir un procesamiento directo de PDF en memoria usando estrategias multimodales de la API de Google, además de asentar la base arquitectónica exigiendo el uso de un Patrón Provider para futura modularidad.

**Prompt Clave 2: Diseño de la UI (Right Toolbar y Split Screen)**
```text
Lo que quiero es que la IA proponga los valores, pero el usuario los acepta o no. Puede: aceptar todas las propuestas con un único botón, o ir aceptando y rechazando una a una las propuestas. Cada propuesta es un valor para un parámetro por supuesto. Para poder analizar bien, el usuario tendrá la información visible de una vez. La zona central principal de la UI se dividirá en dos, a la izquierda verá cada parámetro y los valores propuestos por la IA y para cada uno de ellos tendrá un botón de aceptar y rechazar individual. A la derecha tendrá el PDF con herramientas muy sencillas de zoom y pan para poder verlo y comprobar que la información extraída por la IA es correcta.

En realidad lo que me imagino es que el usuario entra a crear un nuevo componente y en un in-context right toolbar le aparece un botón de "Completar formulario con IA, sube el pdf del datasheet" o algo así. El formulario actual no habría que tocarlo.
```
*Cómo guié al asistente:* Antes de autorizar el diseño definitivo, delineé una visión muy clara de la UI: proteger el flujo de trabajo estándar e invocar la herramienta de IA de manera opcional (Right Toolbar) y obligar a una revisión visual dividida (Split-Screen) que fomente el principio de "Human-in-the-Loop". Tras aprobar esto, ordené `/opsx-apply`.

---

## Sección 2: Fase 08 - Búsqueda Paramétrica y Frontend HTMX

**Contexto:** Creación de una interfaz de búsqueda dinámica basada en el modelo Entity-Attribute-Value (EAV), donde la UI muta según la familia de componente seleccionada.

**Prompt Clave 1: Workflow de Navegación UX**
```text
Buena pregunta. Estoy viendo que actualmente cuando entramos a /components/ vemos todos los componentes en una lista. Eso no tiene mucho sentido porque normalmente lo que va a querer el usuario es buscar por tipo de componente y luego que esté en un determinado tipo de componente empezar a buscar por los parámetros que le corresponden a ese componente, no parámetros que no tienen nada que ver.

Vamos a hacer un nuevo menú, component search (no borremos de momento lo que tenemos en componentes). Lo primero es que van a salir cards, una por cada component type. El usuario puede darle click directamente y se irá al search "especializado en el componente". [...] Los filtros podrían estar en un sidebar a la derecha. Como lo ves? puedes hacer un sketch primero para que lo decidamos? igual me muestra un modelo estático o una imagen?
```
*Cómo guié al asistente:* Durante la fase inicial del workflow, el agente requería aclaraciones sobre el enrutamiento. Cambié su lógica estándar de "listar todo y filtrar" a una navegación progresiva (Tipos → Parámetros) y le obligué a generar un prototipo HTML (mockup) interactivo temporal en la carpeta de *scratch* antes de permitirle consolidar el diseño técnico con `/opsx-propose`.

**Prompt Clave 2: Iteración en Implementación y Corrección Arquitectónica (`/opsx-apply`)**
```text
pero tienes consultas a la base de datos en la view... no se supone que eso es mala práctica? no está prohibido en nuestras reglas?

mira... como no me voy a enfadar si no sacas una bien.... mira como tapa el título
```
*Cómo guié al asistente:* Ya en la fase de código (`/opsx-apply`), mantuve al agente alineado estrictamente a las reglas de arquitectura del proyecto (forzándole a mover las queries de BD a un `Service Layer`) y le corregí de forma directa errores visuales de CSS donde el diseño que creó tapaba el título de la página al colapsarse. Este prompt demuestra el ciclo iterativo real y la necesidad de supervisión humana (VQA) antes de autorizar el cierre con `/verify-change`.

---

## Sección 3: Fase 06 - Gestión de Documentos y Etiquetas

**Contexto:** Desarrollo de un sistema de subida de archivos técnicos y control de versiones, soportando un esquema de herencia en árbol (Materialized Path).

**Prompt Clave: Resolución de Ambigüedades (`/enrich-task`)**
```text
1. Formato: no lo tengo claro. Qué sugieres? Visualización: creo que el modal estaría bien. Cómo lo ves tú? Docs heredados: todo en una tabla porque en general serán más los heredados que los propios. Igual un indicador más "minimalista" como un badge y un label arriba o abajo que diga qué significa el badge? 
2. Tipos y tamaños: PDF, imágenes, swg, dwg (que son de cad) y step, u otros de modelos 3D. [...] Límite de unos 100 MB (10 MB es muy poco). Eliminación: soft delete de momento para el usuario. Delete real tal vez sólo de admin, pero sólo si no está asociado a nodo. 
3. De momento sólo etiquetas creadas por seed o django admin. Lo que nos toca ahora es asignar las etiquetas.
```
*Cómo guié al asistente:* Antes incluso de lanzar `/opsx-propose`, utilicé la skill `/enrich-task` (Fase 1 del workflow Specboot) para obligar al agente a levantar dudas funcionales. En un solo prompt de respuesta a su entrevista logré limitar el alcance innecesario (eliminando la necesidad de crear un CRUD de etiquetas en el front) y definí lógicas de negocio sólidas como la visualización combinada en UI y el límite realista de subida a 100MB por archivos CAD. Una vez el contexto estuvo 100% claro, el resto del ciclo fluyó sin ambigüedades.
