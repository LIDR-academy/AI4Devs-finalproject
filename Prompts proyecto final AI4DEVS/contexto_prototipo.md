· Prompt 1: 
# Rol
Eres un experto Project Manager, especializado en desarrollo con metodologías ágiles como Scrumban.

# Objetivo
Debes analizar en profundidad el repositorio actual, en especial los archivos de documentación. Debes comprender todo el contexto de la aplicación que estamos desarrollando, el punto actual y los siguientes pasos a desarrollar. Según el archivo `DEVELOPMENT.md`, acabamos de terminar la fase 1 y vamos a empezar la 2, la del desarrollo de un prototipo básico funcional. Una vez comprendido, haz un resumen de la finalidad del proyecto, los componentes básicos de este, la arquitectura elegida, la situación actual y los pasos siguientes. Cuando me confirmes que entiendes el contexto, podremos empezar a planificar el prototipo funcional de manera profesional con tu conocimiento.

Realiza todas las preguntas que necesites para realizar tu objetivo lo mejor posible.

---

### Preguntas que me realizó:
PREGUNTAS PARA PLANIFICACIÓN PROFESIONAL
Antes de proceder con la planificación detallada del Sprint 1, necesito clarificar:

1. Sobre el Equipo y Recursos
- ¿Trabajas solo en el desarrollo o hay más personas involucradas?
- ¿Cuántas horas reales puedes dedicar a la semana al proyecto?
- ¿Tienes experiencia previa con React Native, Supabase, o es tu primera vez?
2. Sobre Infraestructura
- ¿Ya tienes cuenta de Supabase configurada o necesitamos crearla?
- ¿Ya tienes API Key de Google Maps o necesitas obtenerla?
- ¿Prefieres trabajar con Supabase en la nube o localmente con Docker?
3. Sobre Datos
- ¿Ya tienes una lista de lugares/medallas de Salamanca o debemos investigarla?
- ¿Cuántas medallas quieres para el MVP? (recomiendo 20-30 para empezar)
- ¿Tienes coordenadas GPS reales de esos lugares?
4. Sobre Alcance del Sprint 1
- ¿Prefieres un enfoque conservador (asegurar lo mínimo) o ambicioso?
- ¿Quieres incluir recuperación de contraseña en Sprint 1 o posponerlo?
- ¿El seed data debe incluir imágenes reales de lugares o placeholders?
5. Sobre Metodología
- ¿Quieres que planifique con sistema de puntos de complejidad (1-5)?
- ¿Prefieres desglose de tareas muy granular (sub-tareas de 2-4h) o más general?
- ¿Quieres que creemos un tablero Kanban en GitHub Projects?

### Su confirmación de comprensión:

**Confirmo que entiendo completamente:**

- ✅ El problema que resuelve Salmantour
- ✅ La arquitectura cliente-servidor con Supabase
- ✅ El stack tecnológico y sus justificaciones
- ✅ La estructura del código y organización
- ✅ El estado actual (Fase 1 completada, código estructural listo)
- ✅ Los objetivos de la Fase 2 (prototipo funcional en 8 semanas)
- ✅ La metodología Scrumban adaptada para TFG individual

**Estoy listo para:**

- 📋 Crear planificación detallada del Sprint 1
- 📝 Generar Product Backlog completo de la Fase 2
- 🎯 Definir user stories con criterios de aceptación
- 📊 Estimar complejidad de tareas
- 🗂️ Organizar trabajo en GitHub Projects (si lo deseas)
- 📅 Crear calendario de desarrollo con hitos concretos
**¿Procedemos con la planificación profesional del Sprint 1, o prefieres que primero respondas a las preguntas para ajustar mejor el alcance?**

---

· Prompt 2:

Voy a responderte a tus preguntas. Después de procesar mis respuestas, realiza una planificación profesional del Sprint 1, cuya finalidad es:
- Obtener un sistema de usuarios y sesiones completo
- Desarrollo de componentes clave básicos (navbar y vistas básicas navegables)
- Lógica de navegación entre todas las vistas
- Desarrollo de las tablas de la base de datos
- Conexión entre frontend y backend (cliente) y este con el backend (servidor) de Supabase. 
 
Cuando aseguremos todo esto, añadiremos entonces las medallas reales de Salamanca e implementaremos la funcionalidad principal del mapa en el siguiente Sprint.

# Tu objetivo a desarrollar:
- Backlog completo de tareas para el Sprint 1
- Estimación de complejidad para cada tarea
- Orden recomendado de desarrollo de tareas del sprint (planificación del Sprint 1)
- Explicación paso a paso de cómo añadir estas tareas a GitHub Projects y a Toggl Track (Es mi primera vez trabajando con ambas)

# Respuestas a tus preguntas
1. **Sobre el Equipo y Recursos**
- Trabajo solo, pero con ayuda de modelos de github copilot para el desarrollo completo del proyecto. Tú eres el modelo encargado de la planificación del proyecto, como PM que eres. Existen otros modelos expertos en desarrollo de código que seguirán las tareas e historias de usuarios que diseñemos en el orden que les indiquemos.
- Podremos trabajar alrededor de 40 horas semanales en el proyecto.
- Es mi primera vez trabajando con Supabase y React Native, por lo que alguna tarea deberá ser investigar sobre ello y entender cómo enlazar los componentes. De todos modos, el equipo de desarrollo compuesto por modelos es experto en estos campos.

2. **Sobre Infraestructura**
- Ya tengo creada una cuenta Supabase y un proyecto "Salmantour" vacío. Debemos configurarlo desde 0.
- No, deberé obtener la API Key de Google Maps, es una de las tareas pendientes.
- Prefiero trabajar por ahora con Supabase en la nube, ya que es mucho menos complejo y servirá completamente para el dominio de este proyecto.

3. **Sobre Datos**
- Tengo pensado algunos lugares, pero deberemos pensar más lugares destacables y las diferentes categorías en las que organizaremos estos lugares.
- Para el resultado del Sprint 1 no necesitamos ninguna medalla. En un futuro, querré implementar 30-50 medallas para este TFG, pero empezaré probando con 20.
- Todavía no, pero se pueden obtener de manera muy sencilla las coordenadas GPS reales de cada lugar.

4. **Sobre Alcance del Sprint 1**
- Ya te he definido todo lo que necesito que hagas y lo que queremos conseguir para este Sprint 1.
- Como priorizamos la implementación rápida de funcionalidades importantes para conseguir cuanto antes un prototipo funcional, pospondré el desarrollo de funcionalidades secundarias como la 'Recuperación de Contraseña', pero inclúyela de todas formas en las tareas del Backlog para tenerla presente ya.
- Cuando añadamos las medallas en el futuro, deberán tener imágenes reales de cada lugar.

5. **Sobre Metodología**
- Sí, utiliza ese sistema de puntos de complejidad. Debes desarrollar esta parte de planificación siguiendo las directrices descritas en `DEVELOPMENT.md`.
- No tengo preferencia sobre el desglose de tareas. Realízalo bajo tu criterio personal en cada caso, lo que consideres más profesional y mejor para este desarrollo veloz de la aplicación.
- Sí, quiero crear un tablero Kanban en GitHub Projects y añadir todas estas tareas en un backlog general ahí. También quiero definir un tablero de "Sprint 1" para trabajar en él con estas tareas de este Sprint.

# Siguientes pasos
Como has podido comprobar, te he pedido que te centres en el desarrollo de las tareas específicas, dejando de lado las historias de usuario que propusiste. Después de registrar todas las tareas en las plataformas de gestión del proyecto (cosa que necesito para la documentación de la memoria del TFG), me ayudarás en siguientes prompts a definir user stories profesionales con criterios de aceptación y documentos técnicos específicos de estas funcionalidades más desarrollados para guiar a otros modelos que actuarán como desarrolladores expertos. Por ahora céntrate en la planificación de tareas que te he pedido para el Sprint 1.

---

· Prompt 3:

Genial, me parece perfecto tu diseño de tareas. He realizado todos los pasos que me has indicado para Toggle Track y hasta el paso de añadir Labels de Complejidad a GitHub Projects. 

# Tu objetivo
Realiza un script que añada un issue para cada tarea que has definido a mi repositorio "Salmantour". Añade TODAS las tareas definidas, luego moveremos al project "Salmantour - Sprint 1" las tareas seleccionadas para este sprint. Al project "Salmantour - Backlog general" añaderemos todas las tareas.
Indica qué necesitas para que funcione (mi token de GitHub o lo que sea).

Cuando tengamos todas las issues definidas y colocadas en las tablas, seguiremos con las User Stories profesionales y la documentación técnica detallada de cada feature para guiar a los modelos. Por ahora, céntrate en que el script añada TODAS las issues definidas.

---

· Prompt 4:

Perfecto, confirmo que se han añadido todos bien al proyecto Salmantour y aparecen en la tabla que les corresponde. Ahora necesito tener Historias de Usuario profesionales para presentar en la memoria de mi TFG. Necesito tenerlas en un formato adecuado para la memoria (probablemente en tablas de Google Docs que luego pasaré a pdf, pero no es seguro).

# Tu objetivo
Debes analizar la planificación temporal ideada para identificar las funcionalidades a desarrollar, y definir qué user stories son relevantes a especificar. También debes pensar el formato de salida en el que me entregarás las user stories completas para que las pueda adaptar (o copiar) de manera sencilla directamente al Docs de mi memoria.

---

· Prompt 5:

Bien, ahora voy a empezar con el desarrollo de las tareas técnicas, las que hablaré y haré a la par con otro modelo 'Claude Sonnet 4.5' en modo Agente que está especializado en desarrollo de aplicaciones móviles.

# Tu objetivo
Realiza documentación técnica de las tareas a desarrollar en este Sprint 1. Esta documentación deberá ser lo más detallada posible para ayudar al modelo a desarrollar cada tarea de la mejor manera. Genera los documentos necesarios, yo copiaré los fragmentos que sean relevantes para el desarrollo de la tarea en la que estemos trabajando. El objetivo final es tener Documentación Técnica profesional detallada + User Stories para que el modelo de desarrollo tenga todo el contexto bien definido y haga su tarea de la mejor manera posible. Esfuérzate en hacer una buena documentación técnica del Sprint 1.

---

· Prompt 6 (final de esta conversación):

Ayúdame a empezar una nueva conversación con otro modelo Claude Sonnet 4.5 en modo agente en vscode. Ahora mismo tengo implementadas las tareas de Setup de configuración (01) y de Base de datos (02), por lo que este modelo me ayudará en la implementación del sistema de usuarios, el siguiente paso (03). 

Debemos definir su rol como un "Desarrollador experto de aplicaciones móviles con React Native, Expo y Zustand, especializado en la creación del sistema de usuarios de la aplicación". En el prompt, debes explicar el contexto de la aplicación y la tarea que vamos a realizar juntos, que serán completando las tareas de los archivos de documentación técnica `SPRINT1_03_AUTENTICACION.md` y `SPRINT1_03_AUTENTICACION_PARTE2.md`. 

Genera un prompt inicial de contexto, en el que le pedimos que no haga nada de código todavía, únicamente debe el repositorio, los archivos de documentación y comprender el contexto entero del proyecto para realizar bien la tarea. Al final, debe generar un breve resumen del contexto que ha comprendido (así comprobamos si lo ha entendido todo o si debemos especificar algo más antes de empezar). También debes indicarme qué archivos debería adjuntarle acompañando al prompt, para ayudarle en la comprensión del contexto.

Genera el prompt con las mejores prácticas de prompt engineering para el modelo Claude Sonnet 4.5. Hazlo en formato markdown y mételo en el archivo vacío `prompts_autenticacion.md` que te he adjuntado.


---

Después de terminar el Sprint 1. Volví a un Checkpoint anterior para limpiar un poco el contexto de la última parte de la conversación y le pedí la documentación técnica para el siguiente Sprint:

· Prompt 7 (Claude Opus 4.5):

Ya he terminado de desarrollar todas las Tareas del Sprint 1. Ahora podemos eliminar todos los archivos de documentación técnica de desarrollo de la carpeta `docs/technical/`, y también los archivos `SPRINT_1_CHECKLIST.md` y `SPRINT_1_TASKS.md`. Deberemos desarrollar ahora la planificación en Tareas del Sprint 2.

## Tu objetivo
- Debes diseñar las Tareas a desarrollar para completar el Sprint 2. Asegúrate de desarrollarlas de la mejor manera posible, que este Sprint implementa las funcionalidades principales de la aplicación y es el más importante. Utiliza tus habilidades como Project Manager profesional para definir las Tareas del Sprint 2 de la mejor manera posible. Ya tenemos definida la Tarea-002 "Obtener y configurar Google Maps API Key", genera el resto de tareas, empezando por el número 028.
- Crea un script similar a `create-issues-final.ps1` para añadir automáticamente a GitHub Projects las Tareas del Sprint 2. Asegúrate de utilizar de manera correcta los 'labels' que hemos definido en el proyecto, y de atribuirle a todas las Tareas el 'Milestone' -> "Sprint 2 - Mapa y Medallas".
- Genera documentación técnica profesional de las Tareas a realizar en este Sprint en la carpeta `docs/technical`.
- Al terminar con todo lo anterior, elimina la documentación técnica y archivos support específicos del Sprint 1.

Realiza todos tus objetivos de 1 en 1, paso a paso, razonando y explicando todo lo que vayas haciendo de manera que entienda todas tus decisiones tomadas.

---

· Prompt 8:

Actualización: Ya he completado el desarrollo completo del Sprint 2, empezamos la planificación del Sprint 3.

## Tu objetivo
- Desarrolla todas las Tareas del Sprint 3. Asegúrate como Project Manager experto de que estén bien descritas y que sean fácilmente comprensible por el equipo de desarrolladores expertos. Sin embargo, no tienes que ser muy específico indicando cómo hacer cada cosa en profundidad, los desarrolladores son seniors expertos y sabrán tomar las mejores decisiones para cada Tarea si es necesario. Las descripciones de las Tareas que diseñes deben servir como una guía base para el desarrollo. Genera el archivo `docs/SPRINT_3_TASKS.md` con todas las Tareas de este Sprint.
- Genera un script `scripts/create-issues-sprint3.ps1` para automatizar el añadir las tareas a GitHub Projects para el Sprint 3. Todavía no he creado un Milestone para este Sprint, asegúrate de que tu script lo cree, o si no pídeme que lo cree manualmente antes de ejecutar el script, lo que consideres mejor.

Si tienes alguna duda para realizar tu objetivo de la mejor manera posible, realízamela antes de empezar.

---

· Prompt 9:

He revisado las tareas que has definido y las he ajustado un poco. He recopilado varias dudas y sugerencias de cambios que necesito que revises y que cambies algunas cosas en las tareas de `SPRINT_3_TASKS.md` y `create-issues-sprint3.ps1` si lo consideras necesario. Analiza estas dudas y sugerencias 1 a 1:

- TASK-045 (Crear componente NearbyMedalNotification): No estoy seguro de que quiera notificar de esta manera al usuario de que está cerca de una medalla disponible. Considero que mostrar un mensaje como notificación con slide o popup sería incorrecto. Si el usuario se acerca a 2 medallas muy cercanas entre ellas y entra en el radio de proximidad a la vez, ¿se muestran 2 mensajes a la vez? Esto podría ser confuso y no me parece una buena manera de indicar al usuario de que tiene disponible una medalla cercana para obtenenerla. En su defecto, me gustaría implementar algún tipo de animación en el marcador de medalla que se active cuando se detecte la cercanía. De esta manera, el usuario puede ver que la medalla cercana se mueve, "palpita o "brilla" más (lo que elijamos), lo que le hará saber que puede seleccionarla para mostrar la tarjeta de información que le permite pulsar en el botón de "Conseguir medalla". Dime qué opinas de esta alternativa de UI/UX para dar a entender que una medalla está dentro del rango y cambia la descripción de esta Tarea-045 en `SPRINT_3_TASKS.md` y `create-issues-sprint3.ps1`.

- Parece que la TASK-049 utiliza para crear la vista componentes reutilizables que se desarrollan en la TASK-050. Creo que deberíamos invertir el orden de estas tareas y que se hagan los componentes visuales antes de implementar la vista 'progress', que los necesita.

- La TASK-052 consiste en desarrollar la tarjeta de detalle para las medallas al ser seleccionadas en la lista de la vista 'progress'. El desarrollo de esta tarjeta de detalle ya está explicado en la TASK-050, como componente reutilizable que crear. Recoge la información de ambos sitios y centraliza la descripción del desarrollo de MedalCard en un único sitio. Además, ocurre lo mismo que te he descrito en el punto anterior: Esta tarea (junto a la TASK-051 de implementar el hook de obtención de medallas) deberían realizarse antes de implementar la vista principal de este Sprint 'progress' descrita en la TASK-049. Reorganiza el orden de las tareas para que se hagan primero las que no tengan dependencias de otras siguientes.

- No he entendido bien qué es la vista de galería que describes en la TASK-053. Yo tenía pensado realizar únicamente la vista de Progreso para revisar las medallas obtenidas y no obtenidas, y poder consultar las fotos desde ahí al seleccionar una medalla obtenida para mostrar su tarjeta desplegable `MedalCard` con toda su información (y la foto tomada asignada). Entiendo que esta vista la propones como una subvista que se pueda navegar desde `progress.tsx` y que muestren las medallas obtenidas por el usuario en pequeñas tarjetas en vista grid que contengan el nombre de la medalla y la foto tomada como miniatura. Si se selecciona una de estas tarjetas, se debería mostrar la tarjeta desplegada de detalle de la medalla `MedalCard.tsx`. Si es así lo que tenías pensado, entiendo que la tarjeta que describes en la TASK-052 se refiere a esta pequeña tarjeta que muestra las imágenes tomadas por el usuario en formato grid en esta vista "galería". Si es así, deberíamos crear otro archivo aparte para definir a este componente o añadirlo directamente sobre la vista, sin necesidad de crear un componente reutilizable para esta tarjeta específica. ¿Qué opinas sobre esto? Confirma si la descripción que he dado sobre esta subvista es correcta o explícame mejor en qué consiste, y decide cómo definimos la creación de esta subtarjeta en las tareas, si como componente en archivo aparte o manualmente en la propia vista.

---

· Prompt 10:

Ya he terminado de implementar el contenido del Sprint 3: Hemos implementado correctamente la lógica para "capturar" medallas, la vista Tab principal "Progreso", una vista "Galería" para consultar las imágenes tomadas de manera más sencilla y visual, la vista modal "Camera" para obtener las medallas (está hecha la vista completa de cámara pero con una lógica mockeada de capturar medallas hasta que implementemos el módulo de cámara correctamente) y una vista de confirmación/celebración al capturar una medalla. También hemos implementado una lógica para mockear la ubicación del usuario para testing y hemos decidido no implementar `proximityService.ts` ni `useProximityDetection.ts` para el cálculo de distancias y la detección de medallas disponibles, ya que `useMedals.ts` utiliza 'useMemo' para ello, que ya lo optimiza bien.

En resumen: Hemos terminado de implementar todo lo que había que desarrollar en el Sprint 3 y hemos adelantado algo de trabajo del Sprint 4: ya tenemos una base para la vista modal de cámara y la vista galería (así como la lógica para mostrar las imágenes de las medallas, que ahora tienen una imagen placeholder pero están preparadas para funcionar). Vamos a continuar con el desarrollo del siguiente Sprint.

## Tu objetivo
Analiza qué requisitos tiene el Sprint 4 y genera todas las Tareas del sprint en un archivo `docs/sprint_tasks/SPRINT_4_TASKS.md`. Genera después el script `scripts/create-issues-sprint4.ps1` y realiza el comando de parseo/encoding necesario para que se pueda ejecutar y añadir automáticamente todas las tareas del Sprint 4 a GitHub Projects. No ejecutes este script, necesito revisar todas las tareas antes de hacerlo. Únicamente céntrate en razonar qué Tareas vas a definir para este Sprint lo mejor posible, como Project Manager experto que eres, y configura el script para que sea ejecutable sin errores de parsing o de encoding.

---

# Prompt 11:

Hemos terminado el desarrollo del Sprint 4. Ahora necesito que planees el desarrollo del Sprint 5. Este va a ser algo más rápido y diferente que lo que tenemos definido en `USER_STORIES.md`, ya que ya tengo implementado las user stories:
- US-018: Filtrado de medallas por categoría
- US-019: Búsqueda de lugares por nombre
- US-020: Notificaciones de proximidad (No está implementado del todo como se describe, pero no lo veo necesario para ahora, sino como una futura mejora cuando la app está terminada. Priorizo seguir únicamente con las cosas esenciales para terminar la app)

Además, he decidido hacer un cambio muy importante en el diseño estructural de la app:

## Descripción de cosas a desarrollar en el Sprint
- He tomado una decisión que cambia el diseño principal de la aplicación: Quiero eliminar la vista "tab" de favoritos y implementar la lógica de favoritos como un filtro que poder activar en el resto de vistas (Progreso, Galería y Mapa). En su lugar, quiero colocar la vista 'Galería' en el Navbar, en la posición en la que estaba la vista favoritos (entre el mapa y el perfil). Considero que esta es una vista mucho más interesante para el usuario, y que tenerla fácilmente accesible para consultar sus fotos tomadas será una mejora para la UX. Además, he notado que hay bastante distinción entre la vista de 'Progreso' (las medallas aparecen listadas por categoría, dando protagonismo a los porcentajes de captura y barras de progreso para conocer cuánto has conseguido utilizando la app) y la vista de 'Galería' (se centra mucho más en mostrar las fotos que has tomado con la app. Es una manera más rápida de consultar los lugares que has visitado y poder ver tus fotos, sin la separación por categorías ni tanta atención en el progreso obtenido, a excepción de un porcentaje simple del total). Me gustaría mantener también el acceso a la galería que tenemos desde la vista 'progress', que también es útil además del del tab. Después de este cambio, ese botón deberá redirigir a la tab de Galería (de manera similar que hace el botón "amigos" de la vista del perfil, que redirige a la tab de amigos). Para este cambio estructural, no hay que cambiar casi nada de las otras vistas, solo hacer que `gallery.tsx` no sea una vista modal, sino una principal de `(tabs)`. Debes describir las Tareas del Sprint 5 para implementar estos cambios, cambiar la posición de la vista `gallery.tsx` a `(tabs)` y cambiar el icono de la tab del corazón a un icono de imágenes para la galería. Debe existir también la tarea de, cuando se termine de cambiar el código, se debe revisar todos los archivos de documentación para buscar menciones a las vistas principales definidas, cambiar todas las referencias a "Favoritos" y cambiarlo por "Galería". Hay muchas menciones de esto (incluido en diagramas y esquemas de arquitectura de archivos también) así que se debe asegurar de revisar todos los archivos en profundidad y actualizarlos uno a uno el que se encargue de la Tarea.

- En este Sprint se debe añadir un botón "corazón" a las tarjetas de 'Progress', las tarjetas de 'Map' y las tarjetas de 'Gallery', que deben estar sincronizadas (si una medalla se guarda como favorita en una vista, se debe actualizar el estado de las otras vistas para que se muestre así al visitar las otras vistas).

- Se debe implementar un componente reutilizable de filtro por favoritos en forma de "Chip", que se pulse para activarlo y se vuelva a pulsar para desactivarlo, y que funciona junto al resto de filtros (se filtra por favoritos y se aplican el resto de filtros activos también).

- Quitar el filtro por categorías de la vista 'Progress' y cambiarlo por el filtro de "Favoritos", "Medallas conseguidas" y "Medallas no conseguidas", que serán más útiles para esta vista.

## Tu objetivo
- Analiza en profundidad el contexto de este Sprint 5 y desarrolla las Tareas que hay que realizar para completarlo.
- Genera las Tareas en un archivo nuevo `docs/sprint_tasks/SPRINT_5_TASKS.md`, empezando con la numeración desde 'TASK-069'.
- Genera también un archivo `create-issues-sprint5.ps1` fijándote en el archivo `create-issues-sprint4.ps1` que te adjunto para que lo tengas como base para desarrollar el script nuevo.

---

# Prompt 12

Hemos terminado el desarrollo del Sprint 5. Ahora necesito que planees el desarrollo del Sprint 6, el Sprint final de desarrollo.

## Tu objetivo
- Analiza en profundidad el contexto de este Sprint 6 y desarrolla las Tareas que hay que realizar para completarlo.
- Genera las Tareas en un archivo nuevo `docs/sprint_tasks/SPRINT_6_TASKS.md`, empezando con la numeración desde 'TASK-082'.
- Genera también un archivo `create-issues-sprint6.ps1` fijándote en el archivo `create-issues-sprint5.ps1` que te adjunto para que lo tengas como base para desarrollar el script nuevo.

---

# Prompt 13

Hemos terminado el desarrollo del Sprint 6 y, por tanto, el desarrollo del proyecto completo. Ayúdame a crear un nuevo prompt inicial de contexto y explicación de tareas a realizar para un nuevo chat:

## Tu objetivo
Lee el prompt de ejemplo que aparece en el archivo que te he adjuntado, lo utilizarás como base para el nuevo prompt, pero modificando todas las cosas necesarias para reflejar el estado actual real del proyecto y de las tareas que debe realizar el nuevo modelo. El prompt de ejemplo es un poco largo de más, y explica varias cosas que el modelo puede consultar en los archivos de documentación profesionales del proyecto. Tenlo en cuenta para generar un nuevo prompt actualizado y mejorarlo.

Este prompt inicial de contexto al modelo que debes realizar deberá ser como el que te dejo de ejemplo, pidiendo en el primer paso que analice y comprenda el contexto del proyecto y el trabajo realizado hasta ahora, pero no que no realice nada todavía. Su primer objetivo es comprender TODO el proyecto, analizando los diferentes flujos que existen y cómo interactúan los archivos entre ellos. Debe generar un resumen completo del proyecto, de su arquitectura, su código, su documentación y los flujos principales entre archivos. Este resumen debe ser más completo que el que pide el prompt de ejemplo que te he adjuntado, este nuevo modelo debe ser EXPERTO en conocimiento sobre el proyecto Salmantour, su trabajo de revisión en profundidad es muy importante, así que debe ser conocedor de TODO. Ese conocimiento también será muy importante para realizar los tests, ya que sabrá cuáles realizar y cómo realizarlos al conocer los flujos y funcionalidades principales.

## Contexto para el prompt
- Necesito realizar una revisión completa de este proyecto en una nuevo chat de copilot con un modelo Claude Opus 4.5 que sea experto en desarrollo de software con este stack, para verificar si todo lo que está implementado es óptimo y está bien o si debemos cambiar algunas cosas para mejorarlo. Necesito que el código final sea lo más profesional posible, sin redundancias y aprovechando al máximo las buenas prácticas del desarrollo de software. Entre las tareas del modelo, una de ellas es identificar todos los "placeholders" que quedan en la app, razonar cuál sería su utilidad en caso de desarrollarse y determinar si debemos eliminar el placeholder o implementarlo para mejorar el diseño estructural de la app. La app ya funciona bien sin esos archivos no implementados, únicamente los añadiría si supone mejoría en diseño estructural (quedando un proyecto más "profesional") o mejoría en rendimiento.
- Además de esta revisión exhaustiva final del código, estructura y documentación del proyecto, también nos falta por implementar los test unitarios de todas las funcionalidades del sistema (o de las más importantes, al menos). En varios Sprints se incluían tareas de implementar test unitarios, pero no se han realizado. Hasta ahora, hemos probado todas las funcionalidades de la app manualmente, pero debemos implementar los test unitarios como buena práctica de desarrollo de software, que valorarán en la entrega del proyecto. Debes indicar en el prompt que se deberá encargar del desarrollo de los tests unitarios de la aplicación, metiendo los archivos en `frontend/__tests__`.

---

# Prompt 14 (Casos de uso)

Después de la auditoría completa que ha realizado el modelo, hemos terminado el desarrollo completo del proyecto. He subido todos los cambios y lo he preparado para producción, código terminado. Ahora debo realizar toda la documentación necesaria para la entrega del TFG. Para ello, voy a ayudarme de un nuevo chat en modo Agente con un modelo Claude Opus 4.5, que deberá conocer el contexto completo de la app mediante los archivos de documentación profesional que tiene el proyecto, y conocerá el formato exacto de los archivos que debe desarrollar al analizar y comprender lo que se explica en los archivos de la carpeta `docs/context/guias`. Ayúdame a crear el prompt inicial de contexto y explicación de tareas a realizar para el nuevo chat.

## Tu objetivo
Lee el prompt de ejemplo que aparece en el archivo que te he adjuntado, lo utilizarás como base para el nuevo prompt, pero deberás modificarlo para reflejar el estado actual (final) del proyecto y para explicar sus tareas específicas, que están orientadas a que comprenda el contexto completo del proyecto (que se convierta en un experto de la aplicación, como si la hubiese desarrollado él) y a que sea un experto redactor de informes, ya que su objetivo será desarrollar los documentos entregables del TFG.

Este prompt inicial de contexto al modelo que debes realizar deberá ser como el que te dejo de ejemplo, pidiendo en el primer paso que analice y comprenda el contexto del proyecto y el trabajo realizado, pero no que no realice ningún Anexo o Memoria todavía. Los archivos de documentación los desarrollaremos de 1 en 1 según se lo vaya pidiendo yo, que le daré instrucciones específicas para cada uno. Indica en el prompt que, por ahora, revise todos los archivos de documentación relevantes del proyecto, que lo necesitará para su tarea de comprensión.

Mete el nuevo prompt que generes en el archivo adjunto `prompts_redaccion_anexos.md`, sustituyendo al prompt que te dejé como base.

## Tareas para el nuevo modelo
- Su primer objetivo es comprender TODO el proyecto, aprendiendo cómo funciona el código de la app analizando los diferentes flujos que existen y cómo interactúan los archivos entre ellos, pero sobretodo enfocándose en comprender en profundidad todos los archivos de documentación del proyecto, que son los que más le harán comprender el proceso de desarrollo de este (lo que hay que explicar en los Anexos y en la memoria).
- Debe generar un resumen completo del proyecto, las metodologías utilizadas para su desarrollo, la planificación temporal seguida, las medidas de seguridad implementadas, su arquitectura, código y documentación. Este resumen debe ser lo más completo posible, me servirá para confimar su conocimiento completo del proyecto y comenzar con la redacción de los Anexos. El nuevo modelo debe ser EXPERTO en conocimiento sobre el proyecto Salmantour, su trabajo de redacción de los documentos entregables es muy importante, así que debe ser conocedor de TODO.
- Además del resumen, deberá generar TODOS los casos de uso de la aplicación. Una gran parte de la documentación a entregar es la inclusión de Use Cases y User Stories detallados. Ya tengo desarrolladas todas las User Stories (en `USER_STORIES.md`), ahora debe desarrollar todas las Use Cases que considere relevantes. En este paso (en este primer prompt), no se le pedirá que las desarrolle completamente todas, si no que diseñe CUÁNTAS Y CUÁLES desarrollaremos. Necesito que, después de el resumen de comprensión total del proyecto, haga una lista en las que nombre todos los casos de uso del proyecto, para que pueda comprobarlos, cambiar alguno si lo veo necesario y confirmarle la lista de casos de uso final que deberemos desarrollar en el siguiente prompt.

### Contexto para los informes
El modelo debe saber que para redactar cada archivo de la entrega que le pida, va a contar con el siguiente contexto extra, además de la documentación profesional del proyecto (y su resumen inicial de comprensión completa del proyecto):
- Se le adjuntarán los archivos de `docs/context/guias`, que explican cómo desarrollar los documentos de Anexos y Memoria que hay que entregar.
- Se le adjuntará el archivo `Informe Planteamiento Salmantour.md`, que incluye el planteamiento inicial de la app de manera muy bien desarrollada y que nos servirá de gran ayuda para desarrollar toda la parte inicial de la Memoria (La parte de finalidad del proyecto y la de conclusión).
- Se le adjuntará para cada documento a realizar un informe completo de un compañero de clase. Mi compañero me ha cedido su proyecto completo para utilizarlo como base y entender mejor qué desarrollar en cada parte. Su proyecto de software es muy diferente al mío (no es ni siquiera una app de móvil), y en sus Anexos y Memoria trata cosas que yo no tendré que incluir en mis archivos, pero nos servirán como contexto para entender la estructura de cada archivo y qué debemos incluir en cada uno.

### Instrucciones de formato
- Cuando se le pida desarrollar un informe de los de la entrega, lo deberá hacer en formato markdown en los archivos vacíos de la carpeta `docs/context/entrega`. Esto me servirá para parsearlo directamente a Docs con el conversor de Google Docs, y ajustar manualmente el informe final para su entrega. Yo me encargaré de incluir la portada y las imágenes de cada informe.
- En los informes entregables debo incluir varios diagramas, tablas, imágenes, capturas de pantalla... Todas esas cosas las incluiré yo manualmente en el informe parseado a Google Docs. En los informes markdown que él genere, debe dejar siempre notificado dónde iría una imagen, para que yo quite la nota y la adjunte en la parte del documento que me indique.

---

# Prompt 15 (Anexos 3 y 4)

He trabajado con el nuevo chat, que ha comprendido y resumido todo el contexto del proyecto en el archivo `INFORME_COMPRENSION_PROYECTO.md` y ha desarrollado todos los casos de uso en el archivo `USER_STORIES.md`. Sin embargo, como ha necesitado hacer un gran trabajo de comprensión de contexto, me está dando error ahora de 'Límite de contexto' para seguir con el desarrollo de los Anexos y la Memoria. Es por esto que he decidido separar el desarrollo de los informes en varios modelos, para que ninguno se sature de contexto y que hagan cada documento de la mejor manera posible. Como cada Anexo trata de un aspecto muy específico del desarrollo del proyecto, no será necesario que los modelos conozcan el contexto de TODO el proyecto, únicamente deberán conocer en profundidad el contexto relacionado con los Anexos que desarrollarán. Eso sí, deben ser expertos de ese contexto específico, y saber redactar de manera profesional y perfecta todos los apartados que se piden para el documento que le toque hacer con la información que yo les de.

## Tu objetivo
Debes realizar un prompt inicial para un nuevo chat en modo Agente con el modelo Opus 4.5 que se va a encargar de desarrollar únicamente el Anexo III y el Anexo IV. En este prompt inicial no se le pedirá que desarrolle nada todavía, solo queremos que comprenda los contenidos que deberá desarrollar para cada archivo y el contexto del proyecto relacionado con esos 2 Anexos. Deberá confirmar su comprensión de la tarea y si tiene toda la información necesaria para desarrollar ambos archivos, preguntando todas las dudas necesarias antes de continuar. En este caso, deberá centrarse un poco más en el Anexo IV 'Plan de seguridad', que será el que desarrollaremos primero. Le daré indicaciones de lo que debe contener este documento y un ejemplo de las secciones desarrolladas por un compañero para el Anexo IV de su proyecto. El modelo deberá analizar esta información específica de este Anexo y desarrollar un 'Índice' para este documento, en el que se declara los apartados que vamos a realizar para nuestro Anexo IV específico de nuestro proyecto. En el siguiente prompt, cuando yo confirme su comprensión de las tareas y valide el plan de redacción del Anexo IV con los apartados elegidos y la información a explicar, comenzaremos con la redacción completa del 'Anexo IV- Plan de seguridad.md' en formato markdown con el índice y los apartados que hemos definido.

Lee el prompt de ejemplo del archivo que te he adjuntado `prompt_redaccion_anexos.md` para basarte en él y editar el archivo con el nuevo prompt. Ese prompt de ejemplo es el que utilizamos antes para el macro resumen y los casos de uso, lo deberás adaptar para que siga pidiendo comprensión del contexto necesario para su tarea, pero que se centre en comprender lo necesario para redactar los Anexos III y IV, que son sus objetivos. No le pidas el resumen de TODO, que le llena el contexto, únicamente lo necesario.

## Guías para los Anexos
Esta parte inclúyela prácticamente igual (pocos retoques) en el prompt. Contiene información muy buena e importante directamente de guías oficiales y de nuestro tutor. Esto le sirve de gran ayuda al modelo para comprender el contexto de lo que debe realizar.

### Anexo IV- Plan de seguridad
- **Guía 1**: En este anexo se deben definir la seguridad de las entidades y elementos relacionados con el proyecto y las medidas que hay que utilizar para integrar ésta dentro del proyecto. Sin ser excluyente, este apartado debe contener metodologías y herramientas a utilizar en la gestión de la seguridad en el proyecto y la identificación de los puntos críticos donde la seguridad es determinante o está impuesta por ley. En este apartado se definirían todos los aspectos técnicos, organizativos y legales de la gestión de la seguridad, en caso necesario.

- **Guía 2**: Debe incluir todo lo relativo a las consideraciones tomadas para la construcción de un software seguro. Se puede hablar de las metodologías empleadas para detectar o prevenir posibles vulnerabilidades y para la protección de los datos, así como identificar las componentes del software en que esto es más crítico. También es conveniente exponer aquí los aspectos legales relevantes, citando las leyes o normativas que se deben guardar.

- **Archivos de contexto**: Tenemos desarrollado el archivo `docs/SECURITY.md`, que documenté durante el desarrollo con este Anexo IV en mente. En ese archivo se encuentra toda o CASI TODA la información necesaria para redactar el Anexo IV. El trabajo del modelo es prácticamente redactar mejor la información de este archivo, para dejarlo en formato de documento de Anexo de TFG, con mejor definición de los apartados y un índice. También le puede ser útil algunas partes de `docs/ARCHITECTURE.md` para completar con algo más de información extra relevante.

### Anexo III- Estimación del tamaño y esfuerzo
- **Guía 1**: Este anexo debe detallar y estimar cuantas métricas sean de aplicación y de interés al proyecto en decisión de su autor y los tutores. El contenido de este anexo debe servir de base para la elaboración del presupuesto detallado. Se debe determinar la o las métricas a aplicar al TFG y se debe valorar cada una de ellas de
acuerdo con los datos contenidos en el proyecto y usando los criterios estándar determinados por las instituciones de normalización de métricas. Si se utilizasen métricas propias deben estar adecuadamente documentadas, contrastadas y referenciadas. Se deberá realizar una estimación al menos de los costes en cuanto a tiempo.

- **Guía 2**: Deberá incluir el análisis realizado al inicio del proyecto en que se estima el esfuerzo de su elaboración. Es importante referenciar adecuadamente la metodología empleada para la obtención de las métricas. También se ubicaría aquí la planificación temporal completa (habitualmente con digramas de Gantt), siendo interesante recoger tanto la planificación inicial para la misma como el resultado real.

- **Archivos de contexto**: El archivo principal que utilizaremos de contexto es `docs/DEVELOPMENT.md`, que fue desarrollado con este Anexo III en mente. En este archivo se documenta muy bien toda la planificación temporal, estimación de costes y tiempo (y los resultados finales reales) y las herramientas utilizadas para esta parte de gestión, entre otras cosas útiles. También viene algo de información extra que no necesitamos para este Anexo (como los ADRs, por ejemplo), así que debe analizar y comprender qué información necesitaremos para redactar el Anexo III. También hay parte de este Anexo en `docs/context/Informe Planteamiento Salmantour.md`, aunque ese archivo está más centrado en el desarrollo de la memoria, hay partes que detallan información necesaria para este Anexo, debe echarle un vistazo. Puede leer también el archivo `USER_STORIES.md`, que desarrolla las historias de usuario que están relacionadas con los Sprints planteados en `DEVELOPMENT.md` y puede que haya algo de información útil. También tenemos el archivo `USE_CASES.md`, que desarrolla todos los casos de uso, pero no creo que sea relevante nada de eso para la redacción de este Anexo, sobretodo se va a tener que centrar en la información de `DEVELOPMENT.md` y revisar si hay algo más útil en `USER_STORIES.md` o en `Informe Planteamiento Salmantour.md`.

### Guía para evitar errores
- La guía `docs/context/guias/errores-frecuentes-redaccion-tfg.md` está desarrollada por mi tutor, y menciona varios aspectos que hay que tener en cuenta a la hora de redactar para evitar algunos errores típicos. Esta guía le servirá en general para el desarrollo de los 2 Anexos, para que evite errores de redacción.

---

# Prompt 16 (Memoria)

Genial, ha desarrollado muy bien los archivos. Ahora necesito que me ayudes a hacer el prompt inicial de contexto para un nuevo chat en modo Agente con un modelo Claude Opus 4.5. Este nuevo chat me ayudará a redactar el archivo principal y más importante de todos, el de la Memoria.

## Tu objetivo
Haz un prompt muy similar al anterior, pero específico para la tarea de comprender el contexto de la Memoria (en vez de los Anexos II y IV). Te he adjuntado un archivo `prompts_redaccion_memoria.md` que contiene el prompt que nos ha servido para darle el contexto necesario al chat que se encargaba de los Anexos. Debes tomar ese prompt como base y generar el nuevo prompt específico para el desarrollo de la Memoria. Deberá pedirle comprensión del contexto y de su tarea antes de confirmarle el comienzo del desarrollo, que lo haremos por partes. También deberá desarrollar el "Índice" del documento, planificando todos los apartados que tendrá la Memoria de nuestro proyecto específico, teniendo en cuenta toda la información que tenemos de este. Se le adjuntarán como ejemplo 2 índices de proyectos de compañeros que le pueden ayudar a diseñar mejor los apartados que redactaremos para nuestro proyecto.

Debe añadir el 'Índice' diseñado al archivo vacío que le adjuntaré, `Memoria_Salmantour.md`. Deberá esperar a que confirme su comprensión completa del contexto y comenzaremos a redactar juntos los primeros apartados.

## Guías para la memoria
- **Guía 1**: Le adjuntaré el archivo `docs/context/guias/DocumentacionMemoriaTFG.md`, que es la guía oficial de la universidad en la que explican todos los apartados que deberá contener la Memoria y qué realizar en cada uno. Bastante detallado.
- **Guía 2**: Le adjuntaré el archivo `docs/context/guias/guia_memoria_gii.md`, que es la guía realizada por mi profesor en base a la anterior. Estas 2 guías son complementarias y dan bastante buen contexto de qué va a tener que redactar.
- **Guía para evitar errores**: La guía `docs/context/guias/errores-frecuentes-redaccion-tfg.md` está desarrollada por mi tutor, y menciona varios aspectos que hay que tener en cuenta a la hora de redactar para evitar algunos errores típicos. También debemos adjuntarla para que no cometa errores de redacción.

## Archivos de contexto
- `docs/context/Informe Planteamiento Salmantour.md`: Este es el archivo principal de contexto, en el que aparece resumida la gran mayoría de información necesaria para muchos de los apartados principales de la Memoria. Deberá revisarlo en profundidad.
- `docs/context/ejemplos/Memoria (Alvaro).md` y `docs/context/ejemplos/Memoria (Daniel).md`: Estos son los 2 archivos que contienen los índices de los proyectos de mis compañeros. Por ahora, únicamente contienen los índices, pero iré completando el archivo con los apartados que vayamos a desarrollar en cada momento, para que lo tome de contexto (sin necesidad de meter todo el archivo y saturar el contexto). Estos ejemplos son muy valiosos como contexto extra, pero no debe seguirlos ciegamente, son de proyectos completamente diferentes al mío. Debe razonar siempre qué y cómo explicar los conceptos de desarrollo de MI proyecto específico, Salmantour.
- `DEVELOPMENT.md`, `ARCHITECTURE.md`, `USER_STORIES.md` y todos los `README.md` del proyecto: Del resto de archivos de documentación, considero que estos son los más relevantes de los que quedan, puede que le aporten contexto extra valioso para desarrollar algunos apartados específicos.
- Resto de archivos de alguna carpeta 'docs': Hay más archivos de documentación del proyecto. Prácticamente todos pueden llegar a ser útiles, pero es mejor que por ahora revise solo los índicados, diciéndole que puede que en el futuro se le indiquen otros archivos extra de documentación para algún apartado específico.