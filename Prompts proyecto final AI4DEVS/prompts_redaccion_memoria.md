# Prompt (Claude Opus 4.5): Redacción de la Memoria - TFG Salmantour

## Rol y Expertise

Eres un **redactor técnico senior especializado en documentación académica de TFG** con experiencia en:
- Redacción de Memorias de Trabajos de Fin de Grado en Ingeniería Informática
- Documentación técnica de proyectos de desarrollo de software
- Aplicaciones móviles con React Native y arquitecturas modernas
- Metodologías ágiles (Scrumban) y gestión de proyectos
- Redacción académica clara, precisa y profesional

Tu misión es **redactar la Memoria** del TFG de Salmantour con calidad profesional y académica, siguiendo las guías oficiales de la universidad.

---

## Proyecto: Salmantour

**Salmantour** es una aplicación móvil gamificada desarrollada como Trabajo de Fin de Grado. Su objetivo es motivar a estudiantes universitarios a descubrir lugares de interés en Salamanca mediante un sistema de recolección de medallas geolocalizadas con documentación fotográfica.

### Stack Tecnológico
| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React Native, Expo SDK 53, TypeScript, Expo Router, Zustand |
| **Backend** | Supabase (Auth + PostgreSQL + Storage), Row Level Security |
| **Servicios** | Google Maps API, expo-location, expo-camera |

### Estado del Proyecto
- Desarrollo 100% completado (6+1 Sprints)
- Código auditado y tests implementados
- Documentación técnica completa
- Anexos I-V en desarrollo/completados
- **Pendiente:** Redacción de la Memoria

---

## Tu Misión: La Memoria

La **Memoria** es el documento principal y más importante del TFG. Funciona como punto de unión entre todos los documentos del proyecto, conteniendo toda la información relevante en un solo volumen para facilitar su lectura y comprensión.

**Características clave:**
- Debe ser claramente comprensible
- Justifica las soluciones adoptadas
- Describe totalmente el objeto del proyecto
- La información más técnica y detallada va en los Anexos (que se referencian)

---

## Guías Oficiales para la Memoria

### Guía 1 - Universidad (DocumentacionMemoriaTFG.md)

Esta es la guía oficial de la universidad. Define los apartados obligatorios:

1. **Índices** - Capítulos, anexos, tablas y figuras
2. **Introducción** - Dominio del problema, contexto, motivación, estructura del documento
3. **Objeto** - Objetivos funcionales y personales (principal + subobjetivos)
4. **Antecedentes** - Aspectos teóricos previos, contexto no técnico, empresa (si aplica)
5. **Descripción de la situación actual** - Estado del arte / estudio de mercado
6. **Normas y referencias** - Métodos, herramientas, modelos, prototipos, métricas
7. **Requisitos iniciales** - Resumen de casos de uso / historias de usuario
8. **Hipótesis, restricciones y alcance** - Requisitos no funcionales, impacto esperado
9. **Estudio de alternativas y viabilidad** - Justificación de tecnologías, monetización
10. **Descripción de la solución propuesta** - Producto final con capturas, diagramas, enlace/vídeo
11. **Análisis de Riesgos** - Matriz de riesgos, DAFO, registro de riesgos
12. **Organización y gestión del proyecto** - Arquitectura, diseño, desarrollo, pruebas, Gantt
13. **Conclusiones y trabajo futuro** - Cumplimiento de objetivos, reflexiones, limitaciones
14. **Bibliografía** - Formato APA, todas las fuentes citadas

### Guía 2 - Tutor (guia_memoria_gii.md)

Complementa la guía oficial con recomendaciones prácticas:

- **Introducción:** 2 páginas, problema → soluciones existentes → carencias → importancia del proyecto
- **Objeto:** Coherente con la propuesta, objetivos personales incluidos
- **Antecedentes:** Marco contextual, ámbito del proyecto
- **Situación actual:** Análisis de competencia que evidencie el valor de nuestra solución
- **Normas y referencias:** Enumerar brevemente, usar citas bibliográficas
- **Estudio de alternativas:** Justificar decisiones con estudios comparativos
- **Solución propuesta:** Evidenciar el alcance, incluir enlace/vídeo demo
- **Análisis de riesgos:** Riesgo de aceptación, satisfacción, tecnológico
- **Organización:** Buena relación con anexos, sintetizar y referenciar
- **Gestión:** Contraponer estimación inicial vs caso real
- **Conclusiones:** Coherente con introducción y propuesta

### Guía de Errores Frecuentes (errores-frecuentes-redaccion-tfg.md)

Archivo con errores típicos a evitar. **Aplica estas recomendaciones en toda la redacción.**

---

## Archivos de Contexto

### Archivo Principal
- **`docs/context/Informe Planteamiento Salmantour.md`** — Contiene la mayoría de información necesaria para los apartados principales. Revísalo en profundidad.

### Ejemplos de Memorias (Solo Índices)
- **`docs/context/ejemplos/Memoria (Alvaro).md`** — Índice del TFG de un compañero
- **`docs/context/ejemplos/Memoria (Daniel).md`** — Índice del TFG de otro compañero

> ⚠️ **IMPORTANTE:** Estos ejemplos son de proyectos completamente diferentes a Salmantour. Úsalos como referencia de estructura y formato, pero **razona siempre qué y cómo explicar los conceptos específicos de NUESTRO proyecto**. No los sigas ciegamente.

### Documentación Técnica Relevante
- **`docs/DEVELOPMENT.md`** — Proceso de desarrollo, sprints, herramientas, planificación
- **`docs/ARCHITECTURE.md`** — Arquitectura del sistema, decisiones técnicas
- **`docs/USER_STORIES.md`** — Historias de usuario por sprint
- **`README.md`** (raíz, frontend, backend, docs) — Visión general del proyecto

### Documentación Adicional
Existen más archivos en las carpetas `docs/` que pueden ser útiles para apartados específicos, pero para tu comprensión inicial no serán necesarios. Te indicaré cuáles consultar cuando lleguemos a cada apartado.

---

## Instrucciones de Formato

Cuando redactes la Memoria:

1. **Formato:** Markdown en el archivo `docs/context/entrega/Memoria_Salmantour.md`
2. **Destino:** Se convertirá a Google Docs para ajustes finales
3. **Portadas e índices automáticos:** Los añadiré yo manualmente
4. **Imágenes/Capturas:**
   - Deja notas claras donde irían: `[IMAGEN: Descripción detallada de qué incluir]`
   - Yo sustituiré las notas por las imágenes reales
5. **Diagramas:**
    - Si alguna de las imágenes o capturas es de algún diagrama, indícalo con la nota y desarrolla el código del diagrama en 'Mermaid'.
    - Ese código Mermaid lo ejecutaré en herramientas que lo convierten a diagrama, para adjuntar la captura.
5. **Referencias a Anexos:** Usa formato `(ver Anexo X - Título)` cuando corresponda
6. **Bibliografía:** Formato APA, recopila todas las fuentes que uses

---

## Instrucciones - Paso 1: Comprensión y Planificación del Índice

**No redactes ningún contenido de la Memoria todavía.**

### Qué debes hacer ahora:

1. **Analizar en profundidad** el archivo `Informe Planteamiento Salmantour.md`
2. **Revisar las guías oficiales** (DocumentacionMemoriaTFG.md y guia_memoria_gii.md)
3. **Leer la guía de errores frecuentes** para tenerla presente
4. **Analizar los índices de ejemplo** de las Memorias de compañeros
5. **Comprender el proyecto Salmantour** en su totalidad

### Entregable Requerido:

#### 1. Confirmación de Comprensión
- Confirma que has entendido el proyecto Salmantour y su alcance
- Confirma que has entendido los requisitos de la Memoria según las guías
- Indica qué información tienes disponible para cada apartado principal
- Señala si detectas que falta alguna información crítica

#### 2. Índice Propuesto para la Memoria

Basándote en:
- Las guías oficiales de la universidad
- Las recomendaciones del tutor
- El contenido disponible en `Informe Planteamiento Salmantour.md`
- Los índices de ejemplo de compañeros (como referencia de estructura)
- Las particularidades de nuestro proyecto Salmantour

Propón un **índice detallado y completo** con todos los apartados que incluirá nuestra Memoria. Formato:

```
1. [Título del apartado]
   - Breve descripción de qué incluirá (1-2 líneas)
   1.1. [Subapartado si aplica]
        - Descripción breve
   ...
```

**El índice debe ser específico para Salmantour**, no genérico (como lo hicieron mis compañeros con sus proyectos específicos). Adapta los apartados de las guías a nuestro caso concreto.

#### 3. Preguntas o Dudas
- Cualquier aspecto que necesites aclarar antes de comenzar
- Información adicional que puedas necesitar para algún apartado

#### 4. Añadir Índice al Archivo

Una vez tengas el índice completo, **añádelo al archivo `docs/context/entrega/Memoria_Salmantour.md`** que actualmente está vacío (solo tiene el título).

---

## Siguiente Paso

Una vez confirmes tu comprensión y yo valide el índice propuesto:
1. Confirmaré qué apartados comenzaremos a redactar
2. Te indicaré archivos de contexto adicionales si son necesarios
3. Procederemos a la **redacción por partes** de la Memoria

---

## Principios de Trabajo

- **Comprensión primero:** Entender bien todo el contexto antes de redactar
- **Específico para Salmantour:** No contenido genérico, todo adaptado a nuestro proyecto
- **Precisión:** Reflejar exactamente lo implementado y las decisiones tomadas
- **Claridad:** Lenguaje profesional, académico y comprensible
- **Estructura:** Índice claro, apartados bien organizados, referencias a anexos
- **Evitar errores:** Aplicar las recomendaciones de la guía del tutor
- **Síntesis:** La información muy detallada va en Anexos, aquí se resume y referencia

---

## Recordatorio Final

La Memoria es el documento que **cualquier lector debería poder entender** para comprender el proyecto completo. Los detalles técnicos profundos van en los Anexos, pero la Memoria debe dar una visión completa, justificada y bien estructurada de todo el trabajo realizado. Esto no quiere decir que algún apartado tenga alguna especificación técnica, puede existir, pero en lo generar será un documento redactado, explicando con palabras la mayoría de aspectos importantes del desarrollo del proyecto.

---

# Prompt 2

He verificado tu comprensión del contexto y el trabajo que has realizado. Me parece perfecto el índice de 14 capítulos que has propuesto, lo seguiremos como guía para ir desarrollando la redacción de cada parte. Hay algunos apartados que deberemos revisar y modificar ligeramente cuando los abordemos, yo te daré las instrucciones y el contexto necesario para ello cuando llegue el momento. Por ahora, vamos a empezar con el desarrollo de la redacción de la Memoria. Para ello, primero lee y comprende todas las indicaciones y respuestas a preguntas que te indico a continuación, y luego comienza con la redacción de la primera parte de la Memoria que te indico más adelante.

## Aclaraciones

### Respuestas a tus preguntas
1. Sí, deberás detallar bien la parte del análisis de competencia. Me parece muy bien los ejemplos de "competidores" que has indicado. Cuando llegue el momento de desarrollar esa parte, deberás explicar un poco cada uno. Como tenemos muchos ejemplos, no será necesario que sea muy extensa la explicación de cada caso de competencia. Cuando toque redactar esta parte te daré más indicaciones sobre esto
2. Sí, tengo una parte desarrollada de documentación sobre algunas tomas de decisiones que he realizado para la elección de tecnologías. En el archivo `docs/DEVELOPMENT.md` detallo las 4 ADRs (Architecture Decision Records) principales que he decidido para este proyecto, lo cual será muy valioso para el Capítulo 9. Te especificaré más adelante más información.
3. Hay varias capturas de pantalla que ya tengo, pero habrá varias que me indiques que deberé crear cuando toque. Tú limítate a redactar el informe lo mejor que puedas, de manera profesional, añadiendo imágenes cuando lo consideres necesario. Yo seguiré tu redacción profesional para añadir las imágenes necesarias donde lo hayas indicado. Recuerda que si alguna imagen es un diagrama, deberás indicarme el código Mermaid del diagrama. (No habrán muchos diagramas).
4. Sí, ya tengo grabado un vídeo demostrativo en el que muestro todas (o casi todas) las funcionalidades de la app funcionando de verdad, sin nada hardcodeado. Lo único que tuve que mockear para el desarrollo del vídeo fue mi ubicación, porque lo grabé estando en Plasencia y no tenía opción de ir a Salamanca. Creé un script de mock de ubicación para probar la app en su desarrollo, y lo utilicé para colocar mi ubicación cerca de una medalla de Salamanca para grabar el vídeo.
5. Sí, la parte de testing se detalla en profundidad en el archivo `docs/ARCHITECTURE.md`. Analiza el contenido de este archivo cuando necesites detallar partes de la arquitectura desarrollada y del proceso de testing implementado.
7. Sí, los índices de figuras y tablas se implementarán de manera automática al terminar el informe.

### Contexto extra para el desarrollo general de la Memoria
Esta parte de contexto extra no es exclusivamente importante para los 3 puntos que vamos a realizar ahora, se deberán tener en cuenta durante todo el desarrollo de la Memoria (siempre que se pueda/deba implementar alguno de los consejos que te expongo a continuación).

Mi tutor corrigió el archivo de contexto principal `Informe Planteamiento Salmantour.md` y me dio los siguientes consejos para la Memoria:
- "La parte de finalidad del proyecto está bastante bien, a partir de aquí podrás construir las secciones relevantes de la Memoria. Si puedes conseguir alguna referencia (algún artículo en línea sería suficiente), sería positivo.": Debemos referenciar el problema que planteo de que los jóvenes opinen que 'Salamanca es muy pequeña', 'Salir en Salamanca es siempre lo mismo', o 'Salamanca ya me ha ofrecido todo lo que tiene por ofrecer y ya me aburre, me lo conozco entero'. Deberíamos encontrar un artículo para poner como referencia y así "validar de manera profesional" el problema que planteamos.
- "Probablemente las funcionalidades de GPS y de cámara sean lo que más hagan notar al tribunal que no es un mero proyecto de gestión, intentaría darle cierto protagonismo porque este tipo de cosas son las que "dan acceso" a notas superiores al 9. Creo que también lucirán el API de Maps y la parte de testing."

También me dio feedback relevante sobre la aplicación final:
- "Gracias por tu correo y por el vídeo de demostración, la verdad es que la aplicación parece bastante completa, y creo que tiene puntos fuertes en el diseño de interfaz, en los que creo que se puede hacer énfasis para venderlo bien en la Memoria y en la defensa."

## Tu objetivo
Como bien has indicado, creo que lo mejor es que empieces desarrollando la redacción de:
- Resumen/Abstract
- Introducción
- Objeto

Has realizado de manera perfecta la definición de apartados en estas 3 partes, así que sigue la implementación propuesta para desarrollar la redacción de las 3. He actualizado los archivos de las Memorias de ejemplo de nuestros compañeros, ahora puedes consultar cómo desarrollaron ellos estas 3 partes. Analízalo y júntalo con tu conocimiento actual del proyecto para desarrollar estas 3 partes de la mejor manera posible. Escríbelas en Markdown en el documento `Memoria_Salmantour.md`, sustituyendo los "resúmenes" que hiciste de estos 3 apartados por su contenido real redactado.

---

# Prompt 3

Por lo general está bien redactado, pero debes corregir algunas cosas:
- Tu 'Nota importante 3' es un error: Lo de darle énfasis a esas funcionalidades más complejas no significa que tengas que ser tan "descarado" y colocarte medallas de esa manera. No me gustan nada las frases "Estas funcionalidades, junto con la visualización de mapas interactivos mediante Google Maps API, constituyen los pilares técnicos diferenciadores del proyecto." o "Esta funcionalidad constituye el núcleo técnico diferenciador de la aplicación.". No hay que hablar de "ser diferenciador", hay que conocer que valoran que haya hecho esas funcionalidades, y saberlas explicar muy bien en la memoria, no decir abiertamente que "soy el mejor, mira lo que he hecho". Sin esas 2 frases, ya lo estabas haciendo bien, estabas explicando en profundidad estas mecánicas principales tan importantes y retadoras para un TFG. Hay que darle el valor que tienen explicándolas lo mejor posible, demostrando conocimiento sobre ellas (profundizaremos sobre ello en las partes más técnicas de la Memoria, ahora no hace falta). Quita esas frases y repasa todo lo que has escrito por si puedes mejorarlo algo más.
- He retocado un poco el Resumen en español para hacerlo un poco más de mi gusto. Realiza también los retoques en la versión en inglés para que sean una tradución exacta.
- Esto no es una corrección, sino una instrucción para seguir de ahora en adelante: Debes ir realizando el apartado de "Bibliografía" en paralelo. Cada vez que referencies alguna cosa o busques información sobre algo en internet, apunta el enlace de referencia en el apartado de Bibliografía. Esto nos ayudará mucho para el futuro.

También debes resolver esta duda que tengo:
- Ya que vamos a desarrollar un apartado de 'Definiciones y abreviaturas' con un glosario de términos técnicos, ¿crees que podemos incluir algunos de estos en la redacción de la Memoria? Por ejemplo, nombrar en algunas ocasiones 'BaaS' a 'Backend as a Service', como aparecerá referenciado en 'Definiciones y abreviaturas'. ¿Qué opinas sobre esto?

Cuando termines con esas cuestiones de revisión y arreglo de la redacción, ayúdame a abordar la siguiente cuestión.

## Tu objetivo para ahora
Antes de continuar con el apartado de Antecedentes, quiero dejar perfectos los apartados que hemos realizado hasta ahora. Para ello, debemos incluir alguna referencia para validar esta afirmación (de alguna manera). Como no hay ningún estudio específico sobre eso, cualquier artículo o estudio que trate algún tema parecido nos puede servir. Para ello, he realizado una búsqueda en profundidad con un modelo, y me ha encontrado algunas referencias que parecen prometedoras.
Su hallazgo principal es un estudio realizado sobre jóvenes estudiantes de la Universidad de Salamanca, y puede estar algo relacionado con el tema. Este es el resumen introductorio del estudio:
```
La investigación sobre el ocio del alumnado universitario es pertinente porque proporciona insights cruciales para diseñar intervenciones educativas y sociales que promuevan un equilibrio saludable entre el ámbito académico y el bienestar integral de la juventud en la sociedad contemporánea. El estudio presentando se propone averiguar la tipología, la conceptualización, la accesibilidad y las demandas del alumnado de la Universidad de Salamanca con respecto a su ocio y tiempo libre. Se aplicó la metodología cualitativa, el foco de información se centró en captar las experiencias e interpretaciones subjetivas del alumnado mediante el análisis de narrativas procedentes de preguntas abiertas de un cuestionario elaborado ad hoc a partir de la literatura revisada. La muestra quedó constituida por 487 discentes de la Universidad de Salamanca. Tras la realización del análisis de contenido con ayuda del Computer-Aided Qualitative Data Analysis NVivo12, se concluye que la mayoría considera que su tiempo de ocio está relacionado con la salud y que sus hábitos tienden a ser saludables, sienten satisfacción, relajación, liberación y diversión, participan preferentemente en actividades deportivas, más en grupo que individualmente, junto con actividades vinculadas a la música, actividades culturales, asistencia a charlas y conferencias, visitas culturales y voluntariado. También, demandan aumento de viajes y excursiones, junto a las actividades sociales de convivencia. Finalmente, la investigación sobre esta realidad desde la pedagogía y la educación social es fundamental para aplicar enfoques pedagógicos participativos y estrategias de intervención que fomenten el desarrollo personal y social del estudiantado, promoviendo así una cultura del ocio inclusiva y enriquecedora.
```

### Tus tareas
- Revisa el archivo adjunto `Referencia Principal Encontrada.md`, que contiene la respuesta completa del modelo en su investigación, con enlaces de referencia a su análisis.
- Revisa las propuestas de referencia y decide por tu cuenta cuál es la que mejor vendría para mencionarla en nuestra Introducción según el contexto que conoces de la Memoria y del proyecto.
- Modifica las partes que puedas mejorar de la redacción actual. Debes incluir la referencia de alguna manera. Fíjate en cómo lo hacen los informes de ejemplo para hacerlo tú también de manera "profesional" para este proyecto.
- Cuando termines todo, pregúntame las dudas que tengas sobre el siguiente apartado 'Antecedentes' para resolvértelas junto al contexto extra que te daré para ese apartado. Si no tienes dudas, confírmame tu comprensión y únicamente te daré el contexto que considero que necesitas para ese apartado.

---

# Prompt 4

Genial, has hecho un trabajo muy bueno, la redacción de las partes que llevamos es ahora perfecta. Vamos a continuar con los 2 siguientes apartados. Deberás desarrollar la redacción del apartado de 'Antecedentes' y luego el de la 'Descripción de la situación actual', que considero que están relacionados un poco y es mejor que las redactes una seguida de la otra. Respondo a tus preguntas y te doy instrucciones claras sobre lo que debes realizar:

## Tu objetivo
- Revisa el archivo adjunto de contexto extra + respuestas (investigación hecha por el otro modelo)
- Revisa los 2 informes de ejemplo de nuestros compañeros para entender cómo han realizado estas partes
- Planifica y desarrolla la redacción de los apartados 3 y 4 de nuestra Memoria. Asegúrate de redactarlos de la mejor manera posible, son muy importantes.

## Contexto para esta tarea
- He preguntado al otro modelo de investigación para que respondiese a tus preguntas y buscase más información que te pueda servir de contexto para estos 2 apartados. Te he adjuntado su respuesta completa, con todas los links de referencias ajduntas, en el archivo `Contexto para Apartados 3 y 4.md`. Revisa su contenido y extrae de ahí toda la información relevante que necesites para estos apartados. El otro modelo da unas instrucciones claras de cómo realizar algunas cosas, pero no es necesario que le hagas caso en todo. Tú eres el experto desarrollador de Memorias de TFG y conoces la mejor manera de redactar un informe para un proyecto como el mío, así que confío en tus decisiones para hacer estas secciones de manera profesional y adecuada. Si consideras que sus indicaciones son correctas, tenlas en cuenta para tu desarrollo, pero siempre razonando tú cómo hacer cada cosa.
- Te he adjuntado los informes de ejemplo actualizados con las secciones que vamos a desarrollar. He eliminado los apartados anteriores para no saturar el contexto con cosas no necesarias para tu tarea actual. Voy a mantener en esos archivos el índice (como referencia general) y los apartados que estemos desarrollando en ese momento, para que analices cómo los han desarrollado mis compañeros y te puedas hacer una idea de qué cosas incluir para los apartados de la Memoria de MI proyecto.

---

# Prompt 5

Tu redacción de estos 2 apartados ha sido perfecta. Has detallado muy bien todos los puntos de una manera profesional, fácil de entender y muy bien documentada, ensalzando el valor de la propuesta que plantea Salmantour. Con ese excelente trabajo, podemos continuar con el siguiente apartado, el de 'Normas y Referencia'.

## Contexto extra
- He actualizado los informes de ejemplo para que contengan únicamente la información relacionada con el apartado a desarrollar. En este caso, Alvaro tiene 1 apartado y Daniel 2, pero ambos tratan de lo que nosotros hemos definido como el Apartado 5: Normas y Referencia. Analiza cómo han decidido plantearlo cada uno de ellos. Razona en consecuencia cómo desarrollar esta parte en nuestra memoria. Aunque tenemos definidos ya los subapartados, no es necesario que te rijas a ellos exclusivamente, puedes realizar la implementación que mejor consideres para documentar esta parte de nuestro proyecto. Utiliza, si te sirven, estos 2 archivos como contexto extra para ayudarte a definir las cosas que vamos a tratar.
- Por lo que veo, este apartado trata más en profundidad la parte de organización durante el desarrollo, tecnologías y herramientas utilizadas. Para ello, será de mucha ayuda el archivo `DEVELOPMENT.md`, que explica las herramientas utilizadas para la gestión del proyecto. En tu índice inicial no has mencionado 'Toggl' para la gestión y monitorización del tiempo de desarrollo, pero sí viene mencionado en el archivo de `DEVELOPMENT.md`. Recopila toda la información que puedas utilizar de ese archivo. También se especifica la gestión temporal en `USER_STORIES.md` y `USE_CASES.md`, pero son archivos más técnicos y no sé si te servirán tanto para esta parte.
- Otros archivos relevantes para esta tarea son `ARCHITECTURE.md` y los archivos de documentación del frontend `frontend/docs/`, que explican los componentes y servicios implementados. Probablemente puedas sacar mucha información de esos 5 archivos.
- Creo que no se menciona en ningún archivo, pero mi IDE principal de desarrollo ha sido Visual Studio Code.

---

# Prompt 6

## Tu objetivo
Analiza todos los archivos de contexto adjuntados para recopilar la información necesaria para este apartado. Después, desarrolla la redacción del apartado 'Normas y Referencia' de la mejor manera posible.

En general creo que está bastante bien el Apartado 5 que has desarrollado, pero debes mejorar la parte de 'Documentación técnica', explicando mucho mejor la documentación profesional técnica que he realizado para este trabajo. Te han faltado por mencionar muchos archivos relevantes de documentación. Revisa todos las carpetas `docs` y los `README.md` de la aplicación para documentar mejor esa parte.

Después, implementa el apartado 6 de las Definiciones y abreviaturas que hemos usado hasta ahora (y las que crees que vamos a utilizar).

---

# Prompt 7

Mi tutor ha realizado una revisión de lo que llevamos redactado hasta ahora de la memoria. Me ha dicho que, por lo general, los 4 primeros apartados están muy bien redactados, pero que el apartado 5 no está demasiado bien. El contenido elegido y los subapartados definidos para este apartado sí que es correcto, pero falla en la redacción de algunas partes, sobretodo los subapartados '5.5', '5.6' y '5.7'. En general me ha dicho que debo redactar mejor el contenido del apartado 5 entero, y también me ha dado algunas recomendaciones específicas que debes revisar aparte:

- Apartado 5.5: Este apartado contiene demasiados conceptos nombrados como 'bullet points' sin explicación. El comentario de mi tutor: M2ejor que una lista de viñetas es, o bien redactar, o bien utilizar una tabla."
- Apartado 5.6: "También sería mejor presentar este apartado más redactado." y "Lo mismo, sería mejor redactar y explicar un poco más."
- Sobre el apartado 5.7.3 (Decisión de diseño sobre mocking): "Esto hay que explicarlo un poco más, pensando tanto en informáticos poco actualizados como en el no-informático del tribunal. Además, 'mockear' suena un poco coloquial, quizá sería mejor evitar el término."
- "Deberías incluir el término 'Haversine' en el glosario del apartado 6."
- De ahora en adelante, utiliza siempre el término "ludificar" y "ludificación" en vez de "gamificar" y "gamificación", que es el término más correcto en español.

## Tu objetivo
- Asegúrate de corregir los subapartados indicados en las correcciones del tutor.
- Revisa y mejora todo el Apartado 5 entero, no solo esos subapartados mencionados. Aunque los subapartados del 5.1 al 5.4 no están tan mal, debes revisar si puedes aportar más información y una mejor redacción en ellos.
- Además, he visto que no mencionas el uso de la aplicación "Expo Go" para probar el proyecto en el móvil (en mi caso, en Android). Veo que mencionas 'Expo CLI', no estoy seguro de si con eso te querías referir a 'Expo Go', que es la app que de verdad hemos utilizado, o a otra cosa aparte. Revisa todo el contenido del Apartado 5 para corregir detalles como este y que la información presentada sea lo más completa posible.

---

# Prompt 8

Has hecho un trabajo EXCELENTE, ahora tenemos todos los apartados (1-6) muy bien desarrollados, como a mí me gusta. Sigue esta manera de redacción para las futuras fases de redacción de la Memoria. Sin embargo, he visto que has querido evitar el formato de 'bullet point' todo lo posible. No me parece mal que alguna parte la redactes con este formato ordenado si es como mejor quedaría, simplemente quiero que no abuses de ello como hiciste la primera vez. El formato actual de lo que llevamos de Memoria es PERFECTO, con redacción en la mayoría de casos y con algunas tablas y bullet points donde es necesario especificar algunas cosas puntuales.

Continuamos con el desarrollo del apartado 7, Requisitos funcionales. Deberás revisar los archivos que te adjunto para contexto, desarrollar los requisitos no funcionales (serán pocos), rediseñar los subapartados de esta parte, y desarrollar la redacción de este apartado completo, sin necesidad de incluir el contenido de las tablas y diagramas, únicamente será necesaria su mención.

## Archivos de contexto
- `Memoria (Alvaro).md`: El apartado en el informe de ejemplo de Alvaro es bastante completo, incluyendo todos los tipos de tabla que deben recopilarse en este apartado, aunque no tiene una redacción muy explicada. Su apartado de 'Requisitos iniciales' se basa en el Anexo I, como debería ser, reutilizando tablas y diagramas que se entregan en ese Anexo también. Quiero que mi apartado de 'Requisitos iniciales' siga este estilo de adjuntar tablas y diagramas que detallan los objetivos y requisitos del sistema. En este archivo de ejemplo te he indicado dónde tiene las tablas y los diagramas, sin explicarte su contenido, que no será necesario que lo desarrolles porque ya los tengo bien definidos en `USE_CASES.md` (excepto el apartado de 'Requisitos no funcionales', que deberemos añadirlo a `USE_CASES.md`). Por este motivo, en la redacción de este apartado deberás indicar dónde va cada tabla y diagrama a añadir, sin necesidad de desarrollarlos cada uno, ya que lo pasaré yo a limpio de lo que ya tenemos en `USE_CASES.md`.
- `Memoria (Daniel).md`: El apartado de este informe de ejemplo de Daniel es bastante más escueto porque no le dio tiempo a desarrollar las tablas y diagramas del Anexo I que se utilizan para este apartado. Sin embargo, puede ser interesante que le eches un vistazo porque añade una explicación de conceptos que puede ser recomendable incluir en nuestro apartado (algo más de explicación redactada de lo que tiene el ejemplo de Alvaro). Además, este ejemplo incluye varias Historias de Usuario de ejemplo, también muy válidas para el apartado de 'Requisitos iniciales', y que Alvaro no las tenía por no haberlas desarrollado para su proyecto. En mi caso, sí que las tengo, así que también será útil que desarrolles un apartado de memorias de usuario después de los casos de uso y los requisitos no funcionales.
- `USE_CASES.md`: Archivo técnico que contiene los Objetivos del sistema (OBJ), los Requisitos funcionales (Requisitos de información - IRQ, Definición de actores - ACT, Casos de uso - CU) y que contendrá los Requisitos no funcionales (NFR) cuando los desarrolles. Este archivo es muy extenso, tiene desarrolladas todas las tablas con mucha información. No es necesario que revises todo el contenido en profundidad, solo necesitas conocer qué tablas tenemos definidas para cada cosa, y así poder referenciarlas bien en tu redacción.
- `USER_STORIES.md`: Archivo técnico que contiene todas las Historias de usuario desarrolladas de manera profesional, y una separación de ellas por sprints.

Como puedes comprobar, en nuestro caso tenemos un contexto muy completo, con todos los objetivos y requisitos funcionales, los requisitos no funcionales (los tendremos en cuanto los desarrolles) y con todos las historias de usuario desarrolladas en los archivos `USE_CASES.md` (Objetivos y requisitos) y `USER_STORIES.md` (Historias de usuario). Con todo este contexto, deberás reorganizar la estructura de subapartados para este apartado 7 'Requisitos iniciales' a una forma más estructurada y correcta para mostrar todas las tablas y diagramas en orden. Cuando termines de definir este nuevo 'índice' para este apartado, deberás desarrollar la redacción completa de este apartado. En este caso, no tendrás que redactar demasiado, ya que la mayoría del contenido del apartado son tablas y diagramas que yo añadiré manualmente en el informe. Tú lo que debes hacer es esa breve redacción que has visto en los informes de ejemplo que explica e introduce los contenidos presentados por las tablas y diagramas. Deberás indicar con una nota en tu redacción dónde deberé colocar cada tabla y diagrama perteneciente a este apartado. Añade una nota por cada tabla y diagrama en la posición donde deba adjuntarla.

## Resumen de tus tareas
- Redacta los Requisitos no funcionales (NFR-XX) al final del archivo `USE_CASES.md`
- Vuelve a definir la estructura de subapartados de este apartado '7: Requisitos funcionales' para mostrar toda la información disponible de manera organizada.
- Desarrolla la redacción de este apartado, que es algo menor a la de los demás apartados porque la mayoría del contenido son tablas y diagramas que deberás indicar con notas con el formato '[Tabla. ACT-02: Usuario identificado]' sin la información desarrollada. Yo me encargaré de desarrollarlas bien en el documento final. Para indicar el nombre de las tablas y diagramas a añadir, revisa el archivo `USE_CASES.md` para conocer el nombre de las tablas que tenemos.
- Elige los mejores ejemplos de Historias de Usuario del archivo `USER_STORIES.md` para incluirlas en su sección de este apartado. Elige también el Caso de uso (CU) mejor desarrollado para la tabla de ejemplo que pondremos para ellos.
- Se deberá referenciar al 'Anexo I: Especificaciones del sistema' para indicar que ahí se pueden consultar todos los Casos de uso e Historias de usuario definidos para este proyecto.

---

# Prompt 9

Excelente, tu redacción del apartado 7 ha sido prácticamente perfecta. Únicamente me gustaría que mejorases un poco el apartado final, el de 'Historias de usuario' (7.6.1):

## Tarea 1
- Me gustaría que los 3 US de ejemplo sean: 'US-009: Visualización de información de lugar', 'US-014: Captura fotográfica de medalla' y 'US-021: Filtrado de medallas por categoría'.
- Creo que puedes redactar mejor esta parte. En mi archivo de historias de usuario tengo definidos también criterios de aceptación específicos. Esto lo mencionas en la introducción de este subapartado de la Memoria, pero no los incluyes en los ejemplos. Desarrolla mejor estos ejemplos con la información disponible.

Te adjunto a continuación las 3 US elegidas detalladas para que lo utilices como contexto para tu redacción de esta parte:
```
### US-009: Visualización de información de lugar

**Como** usuario explorando el mapa  
**Quiero** ver información detallada de un lugar al seleccionar su marcador  
**Para** decidir si me interesa visitarlo y conocer más del lugar

#### Criterios de Aceptación

1. Al tocar un marcador en el mapa, se abre una tarjeta o modal con información del lugar
2. La tarjeta muestra:
   - Nombre del lugar
   - Categoría (con icono representativo)
   - Descripción breve
   - Dirección exacta
   - Estado de la medalla (obtenida/no obtenida)
3. Si la medalla no ha sido obtenida, se muestra un mensaje informativo
4. Si la medalla ya fue obtenida, se muestra la fecha de obtención y la foto asociada
5. Existe un botón para cerrar la tarjeta de información
6. La tarjeta tiene un diseño atractivo y coherente con el tema de la aplicación

#### Información Técnica

- **Prioridad:** Media (complementa la exploración)
- **Estimación:** 3 Story Points
- **Sprint:** Sprint 2
- **Tareas relacionadas:** Tareas futuras de UI de mapa
- **Dependencias:** Mapa funcional (US-008)
---

### US-014: Captura fotográfica de medalla

**Como** usuario dentro del radio de proximidad de un lugar  
**Quiero** capturar una foto del lugar para obtener la medalla  
**Para** documentar mi visita y crear un álbum de recuerdos de mis descubrimientos

#### Criterios de Aceptación

1. Al activarse la obtención de medalla, se abre automáticamente la cámara del dispositivo
2. La interfaz de la cámara muestra:
   - Visor en tiempo real de la cámara
   - Nombre del lugar para el que se captura la foto
   - Botón de captura claramente visible
   - Opción para cancelar (volver sin obtener la medalla)
3. El usuario puede capturar una foto usando el botón de captura
4. Tras capturar, se muestra una vista previa con opciones:
   - "Usar esta foto" (confirmar)
   - "Capturar de nuevo" (volver a la cámara)
5. Al confirmar, se pasa a la pantalla de guardado (US-015)
6. Se solicitan permisos de cámara si no fueron concedidos previamente
7. Se maneja correctamente el caso de permisos denegados con mensaje informativo

#### Información Técnica

- **Prioridad:** Alta (mecánica core del juego)
- **Estimación:** 5 Story Points
- **Sprint:** Sprint 4
- **Tareas relacionadas:** Integración expo-camera, permisos
- **Dependencias:** Sistema de proximidad activo (US-011)

---

### US-021: Filtrado de medallas por categoría

**Como** usuario explorando medallas  
**Quiero** filtrar las medallas por categoría  
**Para** enfocarme en tipos específicos de lugares que me interesan más

#### Criterios de Aceptación

1. En la pantalla de medallas/colección existe un selector de filtros
2. Se puede filtrar por categorías:
   - Todas (opción por defecto)
   - Monumentos y Cultura
   - Bibliotecas
   - Gastronomía
   - Bares y Pubs
   - Discotecas
   - Deporte
   - Ocio Alternativo
   - Naturaleza
3. Al seleccionar una categoría, solo se muestran medallas de esa categoría
4. El filtro se mantiene activo al navegar entre pantallas
5. Se muestra un contador de medallas filtradas (ej: "Mostrando 5/10 - Gastronomía")
6. El filtro también aplica en el mapa (opcional)
7. Existe un botón "Limpiar filtros" para volver a mostrar todas

#### Información Técnica

- **Prioridad:** Baja (nice-to-have)
- **Estimación:** 3 Story Points
- **Sprint:** Sprint 5
- **Tareas relacionadas:** Mejoras UI de medallas
- **Dependencias:** Sistema de medallas (US-013)
```

## Tarea 2
El resto del contenido del apartado 7 lo has desarrollado perfecto, has seguido todas las indicaciones genial, sigue trabajando así para el resto de apartados.
También debes implementar ahora el contenido redactado del Apartado 8: Alcance, restricciones e impacto esperado. Este apartado no contiene imágenes solo texto redactado, así que asegúrate de escribirlo lo mejor posible. Para ello, sigue el índice de subapartados que está propuesto para esta sección, parece bastante completo. A continuación te detallo el contexto que tienes para redactar esta sección de la mejor manera posible.

## Archivos de contexto
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md`. Estos contienen únicamente el índice y el apartado de 'Alcance, restricciones e impacto esperado' que desarrollaron cada uno de ellos para sus proyectos específicos. Daniel tiene este apartado algo más corto que Alvaro, pero ambos te pueden servir de ejemplo y darte ideas para redactar el apartado 8 de mi proyecto específico. Considero que tenemos información suficiente para redactar un apartado de la extensión del de Alvaro (o incluso más).
- Para conocer con exactitud todas las funcionalidades que se incluyeron en este MVP puedes consultar el archivo `DEVELOPMENT.md`, que menciona las funcionalidades principales que se añadieron en cada Sprint. De ahí puedes conocer el contexto entero de lo que incluye la app, pero si necesitas algo más de información para redactar esta parte, puedes consultar la carpeta de `frontend` para conocer su estructura de carpetas (y hacerte una idea de lo que hay desarrollado).
- En cuanto a limitación geográfica, decidí basar el desarrollo de la aplicación en Salamanca porque es la ciudad donde yo he vivido mis años de carrera, y donde he experimentado de amigos y gente cercana esa sensación de 'aburrimiento por monotonía' al hacer siempre los mismos planes. Además, Salamanca es una ciudad que amo, vivir estos años ahí me ha hecho darme cuenta de todo lo que tiene por ofrecer, y que muchas veces puede pasar desapercibido, lo que motivó al desarrollo de este proyecto, centrado en la ciudad de Salamanca. De todos modos, la aplicación está completamente preparada para adaptarse a cualquier ciudad, todo el código está bien modularizado y no depende de la ciudad de Salamanca. En un futuro sí que se podría expandir su alcance a más ciudades, únicamente sería necesario ejecutar archivos de migraciones en la base de datos para añadir las medallas de esa nueva ciudad, y separar el progreso de las ciudades para que sean independientes. Eso no se ha realizado en este MVP por cuestiones temporales, de finalidad (quería centrarlo en la ciudad que amo) y de contexto (no conozco tan bien otras ciudades como para poder elegir 40 sitios imprescindibles, como he elegido para Salamanca).
- En cuanto a funcionalidades excluidas, no tengo demasiadas ya que he conseguido completar a tiempo prácticamente todas las funcionalidades que propuse para que esta aplicación fuese atractiva. Dejé para el final el componente social, que era muy atractivo para motivar a los usuarios a utilizar la app, y al final me ha dado tiempo a incluirlo, así que no cuenta como excluida. Sí que es verdad que me gustaría implementar otras funcionalidades extra que mejorarían la UX, que no ha dado tiempo a implementar para este MVP:
   - Funcionalidad para poder dar "like" y comentar en las fotos de las medallas de los amigos, para reforzar el componente social y de "conexión".
   - Medallas temporales: Medallas especiales que dependen también del factor temporal, solo se pueden conseguir en momentos específicos. Por ejemplo, una medalla especial para el 'Lunes de Aguas' (festividad muy famosa salmantina) que se podría conseguir en la rivera del río el día específico del Lunes de Aguas de cada año.
   - Logros y badges: Son diferentes a las medallas. Estos se consiguen al realizar acciones específicas ("logros"), que refuerzan el uso de la app y motivan a utilizarla todos los días. Algunos ejemplos podrían ser "Conseguir 20 medallas", "Racha de 1 semana de obtención de medallas", "5 amigos conectados"...

Al final sí que se me han ocurrido algunas funcionalidades "excluidas", pero no son ideas rechazadas, sino funcionalidades que no he añadido en este MVP por cuestiones temporarles y de alcance para un TFG. Considero que para un TFG ya he hecho mucho (y que la aplicación es completa en sí), por lo que no vi en ningún momento estas funcionalidades como "necesarias" y decidí descartarlas para esta entrega, aunque las mantengo como ideas que implementaré en el futuro (proyecto externo al TFG).

### Instrucciones para la Tarea 2
- Revisa los archivos mencionados para recopilar el contexto necesario y que razones la mejor manera de redactar este apartado de manera profesional.
- Comprende todo el contexto extra que te he explicado en el prompt, te he dado información nueva sobre mi proceso de planteamiento de este proyecto. Revisa si es de utilidad para el desarrollo de este apartado.
- Con el contexto claro y el plan de redacción definido, desarrolla toda la redacción de este apartado 8: Alcance, restricciones e impacto esperado.
- Revisa si es recomendable meter alguna cita o referencia a algún artículo o estudio de internet. Si consideras que alguna parte de tu redacción mejoraría al referenciar algo, investiga en internet para añadir la cita a tu redacción, y añade la referencia junto al resto de referencias de la Bibliografía. (Esto solo lo harás si consideras necesario o recomendado la inclusión de una referencia, no lo fuerces si no es así).

---

# Prompt 10

La redacción que has hecho para el apartado 8 es excelente, seguimos con el Apartado 9: Estudio de alternativas y viabilidad.

## Archivos de contexto
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md` actualizados. Estos contienen únicamente el índice y el apartado de 'Estudio de alternativas y viabilidad' que desarrollaron cada uno de ellos para sus proyectos específicos. En este caso, Daniel tiene esta sección más desarrollada, detallando bien su plan de mercado (porque es más complejo que el de Álvaro y que el mío). Revisa ambos ejemplos y recopila información que te pueda servir de inspiración para desarrollar el apartado de mi proyecto específico.
- Para la parte de la sección "Alternativas tecnológicas evaluadas" has definido varios puntos de alternativas evaluadas y decisiones tomadas que son correctos. Yo tengo otras propuestas nuevas, ya que tenía documentadas las 4 ADRs (Architecture Decision Records) principales. Debes leerlas y comprenderlas para razonar si las incluyes todas junto a los subapartados que teníamos planteados, si debemos quitar alguno de los planteados del índice o no incluir alguno de los ADR. En resumen, analiza los ADRs descritos para decidir qué subapartados desarrollaremos en esta sección de 'Alternativas tecnológicas evaluadas':
```
### ADRs (Architecture Decision Records)

A continuación se documentan las principales decisiones arquitectónicas tomadas durante el desarrollo del proyecto:

#### ADR-001: Expo Router vs React Navigation

**Contexto:** Necesidad de elegir sistema de navegación para la aplicación móvil.

**Decisión:** Adoptar **Expo Router** (file-based routing).

**Justificación:**
- Simplificación de la estructura de navegación mediante convención de carpetas
- Alineación con paradigmas modernos de routing (similar a Next.js)
- Mejor integración con el ecosistema Expo SDK 53
- Generación automática de tipos para rutas

**Alternativa descartada:** React Navigation requería configuración manual extensiva y no aprovechaba las convenciones de Expo moderno.

---

#### ADR-002: Supabase como Backend-as-a-Service

**Contexto:** Necesidad de backend con autenticación, base de datos y almacenamiento para un TFG con tiempo limitado.

**Decisión:** Utilizar **Supabase** como BaaS completo.

**Justificación:**
- Velocidad de desarrollo: servicios integrados (Auth, Database, Storage)
- PostgreSQL como base de datos robusta con Row Level Security
- SDK de JavaScript con tipado TypeScript
- Tier gratuito suficiente para proyecto académico
- Reducción drástica de complejidad de infraestructura

**Alternativa descartada:** Firebase ofrecía funcionalidades similares pero con base de datos NoSQL (Firestore), menos adecuada para relaciones complejas del modelo de datos.

---

#### ADR-003: Estrategia de Testing sin Mocks Complejos

**Contexto:** Definir estrategia de testing unitario para la aplicación.

**Decisión:** Enfocar tests unitarios en **lógica de negocio aislada**, sin mockear extensamente Supabase ni módulos nativos.

**Justificación:**
- Los mocks complejos de Supabase son frágiles y propensos a desactualizarse
- Tests con mocks extensos prueban los mocks, no la lógica real
- El valor de tests unitarios está en validar lógica pura (validadores, cálculos, estado)
- TypeScript proporciona validación estática complementaria

**Resultado:** 156 tests unitarios cubriendo validadores, stores de Zustand y utilidades de cálculo.

---

#### ADR-004: Zustand para Gestión de Estado Global

**Contexto:** Seleccionar librería de gestión de estado para React Native.

**Decisión:** Adoptar **Zustand** con stores independientes por dominio.

**Justificación:**
- API minimalista sin boilerplate excesivo (vs. Redux)
- Excelente rendimiento en dispositivos móviles
- Integración natural con TypeScript
- Stores independientes (`authStore`, `medalsStore`, `friendsStore`) evitan acoplamiento
- Selectores para optimizar re-renders

**Alternativa descartada:** Redux Toolkit ofrecía más estructura pero con mayor complejidad y boilerplate innecesario para el alcance del proyecto.
``` 
- La sección de 'Viabilidad técnica' deberás desarrollarla con tu conocimiento del proyecto y de su stack tecnológico, y con tu conocimiento general de experto en Memorias de Ingeniería Informática, junto al posible contexto que recopiles de los informes de ejemplo. El proyecto es completamente válido en el apartado técnico, tiene muy bien definido su stack tecnológico que se decidió después de un periodo de investigación por la compatibilidad entre los componentes del stack y por mi experiencia previa trabajando como desarollador Full Stack en una empresa con typescript principalmente. Antes de comenzar el desarrollo del proyecto, dediqué los meses de verano a familiarizarme y aprender a utilizar React Native + Expo y Supabase, con la realización de varios cursos para estar capacitado para empezar el desarrollo en septiembre, como me propuse.
- Los subapartados de la sección de 'Viabilidad económica están muy bien definidos, síguelos para redactar esa parte de la mejor manera. En cuanto a la monetización del proyecto, tengo planteado presentarlo al ayuntamiento de Salamanca por mi cuenta o junto a la Usal (Universidad de Salamanca). Se trata de un proyecto único que daría una gran diferenciación como ciudad universitaria a Salamanca frente a las demás (las demás ciudades universitarias no cuentan con un producto tan completo como Salmantour que expone los grandes beneficios y espacios de la ciudad). Además, al ayuntamiento de Salamanca le interesa tener un producto que estimula la economía y fomente a los grupos sociales a actividades de ocio fuera de casa, lo cual provoca que más gente consuma y gaste dinero en los servicios y establecimientos de la ciudad. Veo viable que el ayuntamiento me financie el proyecto por los beneficios que le puede suponer Salmantour. También considero que se podría implementar una opción de "publicidad buena" en el futuro, en el que los establecimientos interesados puedan pagar por publicar ofertas atractivas para los jóvenes en un apartado especial de "Ofertas". Esta no sería una publicidad invasiva que empeorase la UI/UX, sino un apartado atractivo para los jóvenes que consultarían para conocer qué ofertas hay y hacer planes aprovechándolas. Por ejemplo, se me ocurre que algún establecimiento financie un fin de semana un anuncio en esta sección con la oferta de "3x2 en cubos de cerveza durante el finde". Con ofertas así, los jóvenes estarían pendientes de esta vista opcional de "Ofertas" para enterarse, y podrían planear con sus grupos de amigos salir ese día a ese establecimiento específico con la premisa de "cervezas más baratas". También podrían existir ofertas específicas que solo se puedan canjear al enseñar la aplicación en los establecimientos, asegurando que la mayor gente posible descargue y utilice la aplicación, lo que generaría aún más interés en los establecimientos para publicitarse en este apartado de ofertas de una aplicación tan utilizada por jóvenes (posibles clientes). En resumen, para este apartado creo que podemos plantear 'Financiación pública de parte del Ayuntamiento' + 'Ingresos por anuncios de establecimientos en la aplicación' como las 2 mayores fuentes de ingreso para el desarrollo de Salmantour. Desarrolla esta parte con una redacción perfecta, planteando de la mejor manera todos los conceptos que tienes ahora como contexto.

## Tu objetivo
Desarrolla la redacción del apartado 9: Estudio de alternativas y viabilidad. Hazlo profesional, siguiendo con la buena redacción que has hecho hasta ahora para la Memoria. Al igual que te comenté para el desarrollo del apartado anterior, debes revisar si es recomendable meter alguna cita o referencia a algún artículo o estudio de internet. Creo que en este apartado sí que vas a necesitar buscar en internet algunos datos que respalden lo que contamos. Valora esto e investiga si es necesario.

---

# Prompt 11

Muy buen trabajo de redacción, ha quedado muy bien el apartado 9. Sin embargo, la referenciación a artículos y estudios públicos de internet para dar valor a la información que exponemos era un poco escasa. Por ese motivo, le he adjuntado el apartado a otro modelo que ha realizado la investigación y ha modificado ligeramente algunas partes para incluir las nuevas referencias. También ha actualizado la Bibliografía general de la memoria (Apartado 14).

## Duda que tengo
Veo algo extraña la manera de referenciar que ha realizado, poniendo corchetes con números al lado de las frases. Esta manera de referenciación es diferente a la que utilizamos nosotros previamente en los primeros apartados, como en el Apartado 3. Revisa estos primeros apartados (por ejemplo, el 3), y entiende a lo que me refiero de "esa otra manera de referenciar", en la que poníamos el nombre de los autores de los artículos de referencia, con el año de publicación entre paréntesis, al lado de las frases de la propia Memoria. Sin embargo, en el apartado 9 no se hace así, sino con corchetes referenciadores.

## Tus tareas
- Verifica las 2 maneras de referenciación que tenemos y explícame qué es cada una. A mí personalmente me gusta más la que tenemos en los primeros apartados, pero acepto la que tú elijas por considerarse mejor.
- Actualiza con pequeños cambios los fragmentos afectados de código que tienen la otra manera de referenciar, para que todo el archivo utilice la misma (la que hayamos elegido).
- Verifica que el apartado de Bibliografía está modificado de manera correcta y que no tiene ningún error.

---

# Prompt 12

Genial, ahora está mucho mejor, hemos dejado el Apartado 9 perfecto. Vamos a continuar con el desarrollo de los demás apartados. Como ahora tienes un buen contexto reciente de los apartados 8 y 9 sobre "Cosas conseguidas", "Impacto (de todos los tipos)," "Posible evolución del proyecto" y "Motivaciones y satisfacciones personales respecto al proyecto", creo que es el mejor momento para desarrollar el 'Apartado 13: Conclusiones y tabajo futuro'. Tenemos definidos en el índice de la Memoria varios subapartados para esta sección, que tendremos que revisar para terminar de definir qué vamos a exponer en este apartado y de qué manera vamos a organizar la información. Para eso, te aporto contexto extra.

## Archivos de contexto
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md` actualizados. Estos contienen únicamente el índice y el apartado de 'Conclusiones y trabajo futuro' que desarrollaron cada uno de ellos para sus proyectos específicos. Como puedes comprobar, este apartado es algo más breve que los anteriores, y sirve como cierre completo a todo lo planteado en la Memoria. Es de vital importancia que lo redactes de la mejor manera posible, quedando una conclusión profesional. Analiza estos 2 archivos para extraer contexto extra de cómo realizar esta parte en nuestro proyecto específico de la mejor manera.
- Deberás revisar los apartados:
   - 'Apartado 8. Alcance, restricciones e impacto esperado': Parece que gran parte de lo que hemos definido para los subapartados de esta sección de conclusión repiten cosas del apartado 8. No deberás repetirte y volver a explicar las mismas cosas de la misma manera. Puedes obtener mucha información relevante para la conclusión de este apartado 8, pero será necesario que le des una vuelta para presentar la información NECESARIA con un tono de conclusión de Memoria, y confianza en el futuro del proyecto, no tan "informativo" como lo era el apartado 8.
   - 'Apartado 9. Estudio de alternativas y viabilidad': En este apartado también hay bastante información relevante que puede servirte para redactar la conclusión. También creo que es relevante mencionar de manera breve en los futuros pasos la posible colaboración del ayuntamiento de Salamanca para convertir Salmantour en un proyecto real, más allá de los límites de un simple TFG (esto mencionalo de una manera más elegante y 'profesional' de la que te lo he indicado aquí). Analiza este apartado para recopilar información de interés que poner en la conclusión y futuros pasos (con tono de cierre, no exponiendo nuevas ideas o repitiendo igual lo que ya se ha explicado antes).
   - Resto de la Memoria: Al ser la conclusión de TODA la Memoria, estoy seguro que habrá algo de información en algunos apartados que te ayuden a redactar mejor este apartado de cierre. Puedes revisar los primeros apartados, por ejemplo, en los que se presentan los objetivos a conseguir con este proyecto. Con ese contexto, puedes ayudarte a escribir la parte de conclusión, cerrando con el conocimiento de que hemos conseguido todo lo propuesto, redactado de manera profesional y con tono de 'cierre'.
- `Informe Planteamiento Salmantour.md`: Aunque no es tan relevante como el resto del contexto que te he mencionado, en este archivo también se exponen algunas conclusioines que pueden ser interesantes que las evalúes para guiarte en la redacción real final del Apartado 13. No debe servirte como base, es una conclusión demasiado pequeña (fíjate en los ejemplos para entender la extensión usual de este apartado), pero puede ayudarte a entender qué debe transmitir la conclusión de la Memoria de un proyecto como este.

---

# Prompt 13

Por lo general tu redacción de este apartado 13 está bien (quizás un poco más extenso de la cuenta por tener 4 subapartados), pero necesito que hagas algunas revisiones y correcciones para mejorarlo:

- El apartado de objetivo principal (1.1) me parece que repite mucha información que ya se ha explicado en otros apartados (sobretodo en los apartados iniciales). La idea de la conclusión no es volver a presentar información, sino plantear readactamente las conclusiones que sacamos del desarrollo del proyecto. Sí que es verdad que debe cerrar la Memoria, y a lo mejor referenciar algo de información ya planteada, pero debe de hacerlo de una manera 'fresca', concluyendo el documento y dando las opiniones finales que surgen del desarrollo completo del proyecto. Este apartado 13.1 es muy rígido y no cumple con esto que te digo.
- A lo mejor deberíamos considerar eliminar el apartado 13.3 'Limitaciones' por completo. Presenta únicamente información repetida, y no me parece interesante plantear en la conclusión 'problemas' del proyecto. Creo que es mejor mantener únicamente los otros apartados, que valoran el trabajo desarrollado y los conocimientos adquiridos, por encima de las adversidades, algo que considero más apropiado para una conclusión (que debería tener un tono profesional pero optimista). Además, si el lector quiere consultar las limitaciones y adversidades que hemos enfrentado, tiene varios apartados redactados en el resto de la memoria. ¿Qué opinas de esto? Toma la decisión más profesional posible en el contexto de un apartado final de Memoria de TFG de Ingeniería Informática.
- Asegúrate de que toda la información que introduces es cierta. Por ejemplo, hablas de una gestión de caché con 'TanStack Query', pero yo no he utilizado eso en mi app ni he hablado de ello en la memoria, es la primera vez que se menciona (te lo has inventado). Debes revisar toda la información presentada en este apartado 13 y corroborar que es cierta.
- Por lo general me gustaría que redactases de nuevo el apartado 13.2.2 de Dificultades encontradas y soluciones aplicadas, ya que no me gustan los ejemplos que has puesto. Puedes mantener el de gestión de geolocalización (que gestionamos el tiempo entre comprobaciones de ubicación de manera dinámica para mejorar la eficiencia), pero deberás editarlo un poco, leyendo en los archivos de documentación la información al respecto de esta medida, para que tu explicación de la solución aplicada sea cierta y correspondiente a lo que hemos desarrollado para este proyecto (no cosas inventadas o no ciertas del todo).
- Revisa el apartado 13.4.3, en el que mencionas opciones de sostenibilidad económica. Esa parte no está bien hecha del todo, ya que te basas en las opciones descritas por Daniel (nunca cojas información de los ejemplos que no sea cierta para mi proyecto). En su lugar, fíjate en el apartado 9.3 de mi Memoria, que explica la viabilidad económica de MI proyecto específico, con varias opciones de financiación posibles en el futuro.
- Aunque algunos apartados creo que están bien redactados (13.2.1, 13.2.3, 13.4 o el resumen final), creo debes hacer una revisión general de todos los subapartados, intentando mejorar la redacción de todos, de manera que sea lo más profesional posible, dado el contexto. También debes asegurarte de que toda la información es veraz y asociada específicamente al proyecto Salmantour descrito

En general creo que no has acertado con el tono y finalidad de este apartado 13 de 'Conclusiones y trabajo futuro', salvo algunos subapartados que sí que me parecen que está bien redactados. Debes fijarte en los informes de ejemplo de Alvaro y Daniel que te adjunto, para que comprendas el tono y contenido que suelen tener estos apartados de cierre de una Memoria de TFG. No debes tomar nada de información del contenido (ellos hablan de sus proyectos específicos que son muy diferentes al mío), sino que debes fijarte en lo que se debe contar en este apartado y adaptarlo al contexto de nuestro proyecto Salmantour.

## Tu objetivo
- Repite la redacción de este apartado aplicando las correcciones que te he indicado. Revisa si debes cambiar la organización de subapartados para mejorar la redacción de una conclusión profesional de Memoria de TFG.

---

# Prompt 14

Perfecto, ahora sí que me gusta cómo está el apartado final. Vamos a continuar con los apartados que faltan, empezando por el 'Apartado 10: Descripción de la solución propuesta'. Antes de empezar con su desarrollo, deberás resolver una duda del concepto de 'Arquitectura por capas'.
- Para el apartado 10: He visto que el proyecto presenta una arquitectura por capas que viene explicada en el archivo `ARCHITECTURE.md` (4 capas definidas). También he descubierto que en el archivo `SECURITY.md` se presenta un Modelo de seguridad en capas, y explica las 5 capas que lo componen. ¿Se refieren a la misma cosa y hay un error porque cada definición tiene un número de capas distintas o son conceptos diferentes que tienen que ver con capas pero no se consideran lo mismo?

Es importante que resuelvas esto y que tengas claro el concepto real para el momento de desarrollar el Apartado 10. Con esa duda resuelta, puedes comenzar a revisar el contexto disponible, y la redacción de este apartado. Es un apartado muy importante (de los más importantes de la Memoria), así que deberás intentar redactarlo de la mejor manera posible, profesional y adecuada para nuestro contexto.

## Archivos de contexto disponibles
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md` actualizados. Estos contienen únicamente el índice y el apartado de 'Conclusiones y trabajo futuro' que desarrollaron cada uno de ellos para sus proyectos específicos. Estos ejemplos para el apartado a desarrollar no los tienes que tomar como fuente de información, sino como ejemplo de formato y entender qué contenidos de nuestro proyecto Salmantour debemos exponer en este apartado.
- Daniel tiene el apartado 10 (nuestro) separado en el 10 y el 13: 'Descripción de la solución' + 'Presentación de la aplicación'. Yo quiero que ambas cosas se redacten en mi apartado 10, así que debemos incluir algo parecido a eso de "Presentación de la aplicación" con capturas de pantalla de las vistas y funcionalidades principales de la app y una breve descripción de cada una, como lo hicieron Alvaro (en su apartado 9.2) y Daniel (en su apartado 13). En nuestro caso, tengo dudas si esta parte se asocia con el apartado 10.1 que hemos definido, de visión general del producto, o con nuestro apartado 10.3, que explica todas las funcionalidades en profundidad 1 a 1. A lo mejor sería buena idea combinar estos 2 apartados en 1 solo que oriente la redacción de esta parte para que explique las funcionalidades pero también algo de la vista en sí. Por ejemplo, no solo "Capacidad de enviar solicitudes de amistad", sino explicando que para eso hay un componente desplegable de buscador de amigos mediante código de amistad que se accede desde la vista 'Amigos'. A cada explicación de funcionalidad le acompañarán las capturas de pantalla necesarias que muestren cómo se ven la app final. De esta manera, tendríamos 2 subapartados para esta sección: '10.1 Arquitectura del sistema' y '10.2 Visión general del producto/Funcionalidades implementadas' (o como se decida nombrar a esta parte). Indica tu opinión sobre esta decisión de formato y explica si prefieres continuar con el índice que teníamos propuesto o si es mejor esta otra opción. Cualquiera de las 2 es válida, elige la mejor para el desarrollo de una Memoria de TFG profesional e impleméntala.
- Para desarrollar este apartado 10.2 (que presenta todas las vistas y funcionalidades de nuestra app), necesitarás revisar en profundidad los componentes de la aplicación para entender cómo interactúa el usuario con las funcionalidades principales de la app. Puedes consultar los componentes principales en el archivo de documentación adjunto `frontend/docs/COMPONENTS.md`.
- Para toda la parte de arquitectura deberás analizar la información del archivo `frontend/docs/ARCHITECTURE.md` que te adjunto. Este archivo tiene información muy detallada de la estructura diseñada para la aplicación.
- En el archivo adjunto `Informe Planteamiento Salmantour.md` hay un apartado en el que se explican de manera resumida todas las vistas de la aplicación que te será útil para conocer qué debemos presentar.

## Tu tarea
- Resuelve la duda para tener todos los conceptos claros.
- Define la organización de subapartados del Apartado 10 teniendo en cuenta el índice inicial propuesto y la propuesta que te he hecho. (Además del formato de los informes de ejemplo).
- Desarrolla la redacción del Apartado 10 siguiendo la organización que hayas decidido. Escribe este apartado de la mejor manera posible, pero sin ser demasiada extensa, teniendo en cuenta que gran parte de la extensión de este apartado será debida a la inclusión de imágenes.
- Deberás especificar en tu redacción dónde irá cada imagen que debo adjuntar, indicándolo con una nota del tipo '[Imagen 7. Vista de Progreso]'.

---

# Prompt 15

Muy buen trabajo, lo has hecho perfecto. Ahora vas a desarrollar el 'Apartado 11: Análisis de riesgos'. Este apartado no incluye imágenes, tiene algunas partes de redacción y otras de tablas que deberás generar con información relacionada con el contexto de la app Salmantour.

## Archivos de contexto disponibles
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md` actualizados. Estos contienen únicamente el índice y el apartado de 'Análisis de riesgos' que desarrollaron cada uno de ellos para sus proyectos específicos. Estos ejemplos para el apartado a desarrollar no los tienes que tomar como fuente de información, sino como ejemplo de formato y entender qué contenidos de nuestro proyecto Salmantour debemos exponer en este apartado. De ellos debes comprender qué tablas debes realizar.
- No tenemos más contexto específico de riesgos de Salmantour. Tenemos desarrollado un apartado de la Memoria sobre 'Restricciones' que puede tener UN POCO de información relevante para esta parte, pero la gran mayoría la deberás generar tú basado en tu conocimiento de los riesgos típicos de apliciones móviles. Realízalo lo más realista posible.

## Tu tarea
- Desarrolla el contenido del apartado 11 tal y como lo hemos descrito en el índice, con las tablas necesarias de este apartado.
- Asegúrate de desarrollar información real y factible relacionada con el contexto de Salmantour.

---

# Prompt 16

Excelente trabajo, vamos a terminar la Memoria con el desarrollo del último apartado pendiente, el 'Apartado 12: Organización y gestión del proyecto'.

## Archivos de contexto
- Te he adjuntado los informes de ejemplo de Alvaro y Daniel, `Memoria (Alvaro).md` y `Memoria (Daniel).md` actualizados. Estos contienen únicamente el índice y el apartado de 'Organización y gestión del tiempo' que desarrollaron cada uno de ellos para sus proyectos específicos. Estos ejemplos para el apartado a desarrollar no los tienes que tomar como fuente de información, sino como ejemplo de formato y entender qué contenidos de nuestro proyecto Salmantour debemos exponer en este apartado. Entre estos 2, creo que está mejor desarrollado el de Daniel, que sí que se centra en explicar en profundidad lo desarrollado en cada Sprint y cómo gestionó su desarrollo. El de Álvaro introduce otros conceptos, como el diagrama de las tablas de la base de datos pero no estoy seguro de si son adecuados para este apartado específico. Te adjunto una imagen de ese diagrama de mi aplicación por si acaso fuese necesario, pero debes razonar y decidir tú si lo deberemos incluir o no.
- Este apartado parece similar al apartado 5 de esta misma Memoria, sobretodo a las primeras secciones del apartado 5, que también parece que hablan de gestión y organización. Sin embargo, debes comprender que este es un apartado diferente, en el que se profundiza mucho más en ello. Puedes analizar el apartado 5 para recopilar información que te sirva para este, pero asegúrate de que no copias y pegas información tal cual sin aportar nada nuevo, este es un apartado nuevo. Fíjate en el índice propuesto y en el ejemplo de Daniel para entender qué debes redactar para este apartado, explicando en profundidad todo el proceso organizativo del desarrollo de Salmantour.
- Los archivos principales de contexto para esto son (en orden): `DEVELOPMENT.md`, `USER_STORIES.md` y `Informe Planificación Salmantour.md`. Revísalos y extra toda la información relacionada con Organización y Gestión de proyecto para redactar esta parte.
- Si necesitas completar algún apartado con información no disponible, puedes suponerla, sin inventar cosas que estén alejadas del contexto real de Salmantour. Todo lo que expongas debe ser realista y tener sentido en el contexto del desarrollo que planteamos para este proyecto.

## Tu tarea
- Realiza la redacción de el apartado 12 como se ha descrito.
- Si consideras útil o necesario incluir alguna imagen, indicándolo con una nota del tipo '[Imagen 3. Backlog]'. No quiero añadir demasiadas imágenes, así que no declares más de 5 para este apartado.