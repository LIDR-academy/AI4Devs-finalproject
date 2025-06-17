# Task Distributor
## Documento Funcional

**Última actualización:** 05-11-2024  
**Autor:** Leo Benítez

## Índice

1. [Introducción](#1-introducción)
2. [Estado actual](#2-estado-actual)
   1. [Puntos flojos](#21-puntos-flojos)
   2. [Necesidad actual](#22-necesidad-actual)
3. [Task Distributor](#3-task-distributor)
   1. [¿Qué es task distributor?](#31-qué-es-task-distributor)
      1. [Herramientas que lo soportan](#311-herramientas-que-lo-soportan)
         1. [Redmine](#3111-redmine)
         2. [CM Gestión del cambio](#3112-cm-gestión-del-cambio)
         3. [Nueva herramienta de gestión](#3113-nueva-herramienta-de-gestión)
            1. [Roles](#31131-roles)
   2. [Funcionalidades](#32-funcionalidades)
      1. [Gestión de tareas](#321-gestión-de-tareas)
         1. [Crear tarea](#3211-crear-tarea)
         2. [Editar tarea](#3221-editar-tarea)
            1. [Editar - Asignar tarea](#32211-editar---asignar-tarea)
            2. [Editar - Planificar fechas](#32212-editar---planificar-fechas)
               1. [Sistema de recomendación de asignación de tareas](#322121-editar---planificar---sistema-de-recomendación-de-asignación-de-tareas)
         3. [Borrar tarea](#3231-borrar-tarea)
      2. [Visualización de tareas](#322-visualización-de-tareas)
         1. [KPIs](#3221-kpis)
            1. [Listado de KPIs](#32211-listado-de-kpis)
         2. [Gantt](#3222-gantt)
      3. [Gestión de capacidades](#323-gestión-de-capacidades)
         1. [Equipos de desarrollo](#3231-equipos-de-desarrollo)
            1. [Equipos de desarrollo internos](#32311-equipos-de-desarrollo-internos)
            2. [Equipos de desarrollo externos](#32312-equipos-de-desarrollo-externos)
         2. [Matriz de asignación equipos a departamentos](#3232-matriz-de-asignación-equipos-a-departamentos)
            1. [Definición de la matriz](#32321-definición-de-la-matriz)
            2. [Ejemplo de sugerencia](#32322-ejemplo-de-sugerencia)
      4. [Alertas](#324-alertas)
         1. [Fecha de fin próxima](#3241-fecha-de-fin-próxima)
         2. [Fecha de fin sobrepasada](#3242-fecha-de-fin-sobrepasada)
         3. [Tarea sin responsable de negocio asignado](#3243-tarea-sin-responsable-de-negocio-asignado)
         4. [Tarea sin funcional asignado](#3244-tarea-sin-funcional-asignado)
         5. [Tarea sin estimación inicial](#3245-tarea-sin-estimación-inicial)
         6. [Fecha de fin de tarea modificada](#3246-fecha-de-fin-de-tarea-modificada)
         7. [Necesidad de proyectos en un departamento](#3247-necesidad-de-proyectos-en-un-departamento)
         8. [Necesidad de proyectos para un equipo en base a su capacidad](#3248-necesidad-de-proyectos-para-un-equipo-en-base-a-su-capacidad)
   3. [Ciclo de vida de un proyecto en Task Distributor](#33-ciclo-de-vida-de-un-proyecto-en-task-distributor)
      1. [Fases del ciclo de vida](#331-fases-del-ciclo-de-vida)
         1. [Creación](#3311-creación)
         2. [Priorización](#3312-priorización)
         3. [Asignación y planificación](#3313-asignación-y-planificación)
         4. [Ejecución](#3314-ejecución)
         5. [Finalización](#3315-finalización)
      2. [Ejemplos del ciclo de vida](#332-ejemplos-del-ciclo-de-vida)
         1. [Ejemplo 1. Tarea con prioridad baja](#3321-ejemplo-1-tarea-con-prioridad-baja)
         2. [Ejemplo 2. Tarea con prioridad alta que modifica la planificación actual](#3322-ejemplo-2-tarea-con-prioridad-alta-que-modifica-la-planificación-actual)
   4. [Diseño](#34-diseño)
      1. [Proyectos planificados](#341-proyectos-planificados)
      2. [Proyectos pendientes de planificar](#342-proyectos-pendientes-de-planificar)
      3. [Formulario alta proyecto](#343-formulario-alta-proyecto)

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 04/11/2024 | v.1 | Leo Benítez | Primera versión del funcional |
| 06/05/2025 | v.1.1 | Leo Benítez | Revisión del documento y ajustes menores |

## 1. Introducción

El siguiente documento recoge el funcional de requisitos para abordar un proyecto de desarrollo que dé cobertura a la necesidad que tiene la compañía, a través del departamento de tecnología, de buscar una nueva forma de planificación de proyectos de desarrollo.

## 2. Estado actual

En el momento de creación de este documento, el sistema de planificación de proyectos se realiza a través de Redmine, y está soportado por un CM.

En momentos puntuales, donde se hacen planificaciones de proyectos a corto o medio plazo, se soporta además en documentos sheet, que aunque tienen un formato semi estandarizado, no es conocido por el total de los departamentos de negocio y puede crear confusión en algunos momentos.

Este sistema ha dado cobertura en el pasado y la da en el presente a la gestión de proyectos pero con el aumento progresivo de las solicitudes de negocio y el entorno de constante cambio en el que estamos, tiene algunas debilidades y necesita de algunas mejoras que se indican a continuación.

### 2.1. Puntos flojos

Se enumeran algunos de los puntos flojos que hacen necesario un nuevo sistema de planificación:

* Desde el **punto de vista de negocio**:
   * Nuevas necesidades y cambios de prioridades constantes
   * Falta de gestión en redmine por parte de negocio
   * Falta de visibilidad sobre el estado de sus tareas
      * Hay que ir una a una para detectar datos pendientes (funcional, responsable, pdte feedback, ...)
* Desde el **punto de vista tecnología**:
   * Falta de actualización de tareas por los equipos de desarrollo, lo que provoca una mala visibilidad en el CM.
   * Planificación de tareas y asignación a equipos sin tener visibilidad completa de las cargas de trabajo.
   * Necesidad de insistir a negocio para que complete la información en las tareas

### 2.2. Necesidad actual

Actualmente, se ve la necesidad de disponer de una herramienta más ágil, que soportada por Redmine, para mantener todas las conexiones que ya existen, permita tanto a negocio como a tecnología gestionar la planificación de proyectos y que dé más visibilidad de la que existe actualmente, así como que esa visibilidad sea en tiempo real.

El principal objetivo es que tanto negocio como tecnología sepan que hay en marcha y que hay solicitado, para que las planificaciones sean lo más reales posibles y las estimaciones en fechas que se den se basen en la carga de trabajo existente y la disponibilidad de los equipos de desarrollo.

## 3. Task Distributor

### 3.1. ¿Qué es task distributor?

Task Distributor es el nombre de la herramienta que se propone desarrollar para cubrir las necesidades indicadas anteriormente con el principal objetivo de mejorar la planificación de proyectos de tecnología y hacerla más ágil.

Las principales cuestiones que debe cubrir esta nueva herramienta y que no existen en la actualidad son:

* Sistema de recomendación de asignación de tareas a equipos
* Visualización gráfica en tiempo real de la planificación
* KPIs del estado de las tareas
* Alertas sobre la gestión de tareas

#### 3.1.1. Herramientas que lo soportan

Como ya se ha comentado anteriormente, no se quiere perder la potencia de redmine y de los cuadros de mando asociados disponibles, con lo que seguiremos utilizando algunas de las herramientas existentes, pero llevaremos el grueso de la gestión a la nueva herramienta de desarrollo interno, que cubrirá todas las necesidades actuales.

##### 3.1.1.1. Redmine

Seguirá siendo la base que almacenará toda la información de las tareas a realizar.

No se tendrá que realizar ninguna acción sobre ella relacionada con la planificación de proyectos.

Se seguirá utilizando como herramienta de imputación de tiempos y de gestión de proyectos, pero no de planificación, aunque sí seguirá llegando la información a ella para su posterior explotación gracias a la interconexión con la nueva herramienta propuesta.

##### 3.1.1.2. CM Gestión del cambio

Seguirá siendo la herramienta donde se podrá visualizar el estado de los equipos y los departamentos para poder hacer seguimiento general.

##### 3.1.1.3. Nueva herramienta de gestión

Será la nueva herramienta, desde la que negocio y tecnología harán las gestiones necesarias relacionadas con la planificación de proyectos utilizando su recomendador de asignación de proyectos, además de que tendrá los KPIs y alertas necesarias para que el trabajo de planificación de proyectos sea lo más ágil y sencillo posible y esté centralizado en una herramienta de uso común por negocio y tecnología, facilitando a cada uno de los usuarios, en base a sus roles, una opciones concretas.

###### 3.1.1.3.1. Roles

Esta nueva herramienta, tendrá dos roles diferentes.

Por un lado tendremos usuarios con rol "negocio" y por otro lado tendremos usuarios con rol "tecnología".

Sobre cada una de las funcionalidades se detalla qué acciones puede realizar cada uno de los roles.

### 3.2. Funcionalidades

A continuación se describen las funcionalidades que tendrá esta nueva herramienta.

#### 3.2.1. Gestión de tareas

La gestión de tareas se llevará a cabo sobre la nueva herramienta, pero todo lo que se gestione sobre ésta, se sincronizará con Redmine de forma automática en tiempo real.

Se utilizará para ello la API disponible en Redmine.

Los campos a rellenar sobre una tarea van a ser todos los necesarios para la creación de la misma, que pueden verse en la siguiente imagen denominada "20250506-TaskDistributor-TareaRedmine-Campos.png".

Las acciones a realizar serán las detalladas a continuación.

##### 3.2.1.1. Crear tarea

La creación de una tarea sobre la nueva herramienta dará de alta la tarea en Redmine, con todos los campos indicados anteriormente.

Podrán crear tareas los usuarios con rol de negocio y con rol de tecnología.

##### 3.2.2.1. Editar tarea

La edición de una tarea modificará la tarea en Redmine.

Podrán editar tareas los usuarios con rol de negocio y con rol de tecnología.

###### 3.2.2.1.1 Editar - Asignar tarea

La asignación de tareas a los diferentes equipos solo se podrá realizar por usuarios con rol tecnología.

###### 3.2.2.1.2 Editar - Planificar fechas

La planificación de fechas, es decir, la asignación de fechas de inicio y fin, solo se podrá realizar por usuarios con rol tecnología.

Para poder planificar una tarea, previamente hay que dar una estimación del tiempo que puede emplearse en llevar a cabo esa tarea, en forma de sprints.

Una vez informado el total de sprints estimado, entra en juego el sistema de recomendación de asignación de tareas.

###### 3.2.2.1.2.1 Editar - Planificar - Sistema de recomendación de asignación de tareas

La nueva herramienta va a disponer de un sistema de recomendación de equipo que gracias a un algoritmo propondrá al mejor equipo para la realización de la tarea.

Este algoritmo no elegirá al equipo, sino que mostrará el mejor equipo seleccionable para la realización de la tarea, mostrando a todos los equipos disponibles, en función del orden que asigne el algoritmo a cada uno de ellos. Tendrá en cuenta la situación del equipo y la tarea a abordar.

Para ello, se van a tener en cuenta una serie de métricas que darán el orden final de los equipos, para que se muestre al planificador de la tarea, quien tendrá que tomar la decisión final.

Las métricas a analizar por el recomendador son las siguientes:

* En relación a la **tarea a realizar**:
   * Factor de carga de trabajo la tarea
      * Se utilizará un número para indicar:
         * 0,5: necesidad de un trabajador al 50% del tiempo.
         * 1: necesidad de un trabajador a jornada completa.
         * 2: necesidad de dos trabajadores a jornada completa.
         * n: necesidad de n trabajadores a jornada completa.
   * Estimación en sprints de la tarea.
   * Departamento para el que se realiza el proyecto.
* En relación a los **equipos**:
   * Total de proyectos planificados
   * Total de sprints planificados pendientes
   * Factor de capacidad del equipo
   * Último día planificado con capacidad para el proyecto (depende del factor de dedicación de cada uno de los proyectos que está abordando el equipo)
   * Matriz de asignación de departamentos a equipos (ver apartado detallado más adelante).
* En base a esto, el sistema calculará, para cada equipo
   * Posible fecha de inicio del proyecto
   * Posible fecha de fin del proyecto
* Una vez calculados los datos, utilizando además la matriz de asignación, propondrá un orden de elección de equipos, poniendo en primera posición a los equipos que realizan tareas sobre el departamento en cuestión y posteriormente ordenando por la posible fecha de inicio.

Ejemplo gráfico:

* Disponible en la imagen denominada "20250506-TaskDistributor-EjemploRecomendacion.png"

En base a estos datos, el usuario de tecnología que está planificando los proyectos, podrá visualizar las posibles fechas estimadas de inicio y fin de la tarea que está planificando, para así ver si la tarea encaja o no con la planificación solicitada por negocio.

De esta forma, podrá justificar que una tarea puede o no planificarse pudiendo mover fechas en otras tareas o incluso haciendo visible la necesidad de nuevos equipos de trabajo para la planificación de la tarea.

Cualquier equipo es susceptible de recibir la tarea, aunque la priorización de las mismas irá en base a la matriz de asignación.

En el caso de que una tarea se quiera planificar afectando a la planificación existente, el sistema de recomendación mostrará cómo afecta a la planificación actual. **PENDIENTE DE DEFINIR BIEN ESTA CASUÍSTICA.**

##### 3.2.3.1. Borrar tarea

El borrado de tareas se podrá realizar por un rol u otro, en función de la información asociada a una tarea:

* **Rol negocio**: solo se podrá borrar una tarea que no tenga cualquiera de la siguiente información:
   * Equipo asignado
   * Fecha de inicio informada
   * Fecha de fin informada
   * Tiempo imputado
* **Rol tecnología**: podrá borrar cualquier tarea a menos una que tenga tiempo imputado informado.
   * En este caso, esta gestión habrá que realizarla desde Redmine, si fuera necesario, moviendo primero los tiempos a otra tarea.

#### 3.2.2. Visualización de tareas

Otro de los puntos fuertes de esta aplicación, será el de visualización en tiempo real de la planificación de los proyectos.

Cada departamento tendrá acceso a una pantalla, donde podrá visualizar la información de su departamento y podrá ver en qué estado está cada una.

Esta pantalla mostrará KPIs con información relevante en la parte superior y un gantt en la parte inferior (al final de este documento se detallan cada una de las pantallas).

##### 3.2.2.1. KPIs

La herramienta mostrará una serie de KPIs que ayudarán a los usuarios de la aplicación a actuar o tomar decisiones sobre la planificación y asignación de tareas.

###### 3.2.2.1.1. Listado de KPIs

Los KPIs que mostrará la herramienta serán:

* **Generales**
   * Total de tareas en backlog
   * Total de tareas planificadas (con fechas asignadas por tecnología)
   * Total de tareas en ejecución
   * Total de sprints planificados
   * Total de sprints pendientes de planificar
   * ... AÑADIR MÁS AQUÍ
* **Para negocio**
   * Total de tareas sin funcional asignado
   * Total de tareas sin responsable asignado
   * ... AÑADIR MÁS AQUÍ
* **Para tecnología**
   * Total de tareas sin equipo asignado
   * Total de tareas sin fechas de inicio/fin asignadas
   * Total de tareas sin estimación de sprints informada
   * Total de tareas con fechas de fin pasadas
   * ... AÑADIR MÁS AQUÍ

##### 3.2.2.2. Gantt

Mostrará en pantalla un Gantt con la información de las tareas planificadas dentro del departamento.

A partir de las fechas de inicio y fin, se visualizará el estado de cada tarea.

Además tendremos tendremos un código de colores para mostrar el estado de cada una de las tareas planificadas. La paleta de colores será la siguiente:

* **To Do**
   * Mostrará tareas planificadas en fechas que no están arrancadas.
   * Color: Blanco
* **Doing / Demo**
   * Mostrará proyectos planificados en fechas que están arrancados y sobre los que se está trabajando.
   * Color: Amarillo

El resto de estados (backlog y producción) no aparecerán en el Gantt, ya que no aportan información sobre el trabajo que está en ejecución.

#### 3.2.3. Gestión de capacidades

Uno de los puntos fuertes del recomendador de asignación deberá ser el de buscar un equipo que pueda abordar una tarea.

Para ello, deberemos tener configurados los equipos de desarrollo en el sistema, así como sus departamentos "favoritos".

Un equipo podrá tener varios departamentos favoritos, que ayudarán al recomendador a posicionar al equipo cuando se esté abordando un proyecto.

##### 3.2.3.1. Equipos de desarrollo

El sistema permitirá disponer de los equipos de desarrollo.

###### 3.2.3.1.1. Equipos de desarrollo internos

Definiremos como equipos internos todos los equipos de desarrollos disponibles.

El listado de equipos es el siguiente:

* Dev 01
* Dev 03
* Dev 04
* Dev 05
* Dev 06
* Dev 07
* Dev 08
* Dev 09
* Dev 10
* Dev 11

Cada equipo interno tiene la capacidad de abordar dos proyectos en paralelo.

###### 3.2.3.1.2. Equipos de desarrollo externos

Definiremos como equipos de desarrollo externos todos los equipos de proveedores.

El listado de equipos es el siguiente:

* Equipo Externo 1
* Equipo Externo 2
* Equipo Externo 3
* Equipo Externo 4
* Equipo Externo 5
* Equipo Externo 6
* Equipo Externo 7
* Equipo Externo 8
* Equipo Externo 9
* Equipo Externo 10

Cada equipo externo tiene la capacidad de abordar dos proyectos en paralelo.

##### 3.2.3.2 Matriz de asignación equipos a departamentos

Se definirá una matriz de afinidad entre equipos y departamentos, para que el sistema de recomendación priorice la asignación de tareas de los diferentes departamentos a los equipos más afines.

No será una condición excluyente, sino que el sistema la utilizará para dar un orden de asignación, que el usuario planificador de tareas podrá utilizar o no.

###### 3.2.3.2.1. Definición de la matriz

**AÑADIR DEFINICIÓN AQUÍ**

###### 3.2.3.2.2. Ejemplo de sugerencia

Si el departamento X tiene una tarea, los primeros equipos susceptibles de abordar esa tarea serán los equipos de "Dev 01", "Dev 05" o "Dev 08", pero la asignación final dependerá del estado actual de los equipos y la carga de trabajo existente en el momento de la planificación.

#### 3.2.4. Alertas

Además de los KPIs, y en base a algunos de ellos, el sistema notificará a los usuarios (en función de su rol) sobre acciones pendientes a realizar o acciones que requieren de su intervención para que los usuarios no tengan que estar pendiente de esas acciones de forma manual o revisando de forma periódica las tareas planificadas o pendientes de planificar.

Estas alertas serán notificaciones por correo electrónico a diferentes usuarios. En unos casos será al usuario responsable de la tarea, en otros casos al usuario que tiene asignada la tarea o también al usuario que creó la tarea.

Si hay más de una tarea en el mismo tipo de notificación para el mismo destinatario se agruparán en una misma notificación, para evitar que el usuario reciba varias notificaciones similares.

El sistema contará con las alertas que se definen a continuación.

##### 3.2.4.1. Fecha de fin próxima

El sistema notificará al usuario asignado a la tarea, indicando que la tarea está próxima a finalizar, cuando queden 15 días para finalizar la tarea (en base a la fecha fin).

Volverá a avisar al usuario cuando queden 7 días para completar la tarea (en base a la fecha fin).

El envío de esta alerta se ejecutará una vez al día.

##### 3.2.4.2. Fecha de fin sobrepasada

El sistema notificará al usuario asignado a la tarea cuando una tarea haya sobrepasado la fecha de finalización.

El envío de esta alerta se ejecutará una vez al día.

##### 3.2.4.3. Tarea sin responsable de negocio asignado

El sistema notificará al usuario creador de la tarea, cuando una tarea no tenga un responsable asignado y lleve creada más de una semana.

El envío de esta alerta se ejecutará una vez al día.

##### 3.2.4.4. Tarea sin funcional asignado

El sistema notificará al usuario creador de la tarea, cuando una tarea no tenga un funcional asignado y lleve creada más de una semana.

El envío de esta alerta se ejecutará una vez al día.

##### 3.2.4.5. Tarea sin estimación inicial

El sistema notificará a los responsables de desarrollo, si hay tareas con responsable y funcional asignado, que no tengan una estimación inicial de los posibles sprints de desarrollo.

Solo se notificarán las siguientes 5 tareas, en base al orden de prioridad establecido por negocio, existentes en el backlog.

El envío de esta alerta se ejecutará una vez a la semana.

##### 3.2.4.6. Fecha de fin de tarea modificada

El sistema notificará al responsable de negocio de la tarea, que la fecha de fin de la tarea se ha modificado.

La notificación informará la fecha original y la nueva fecha informada.

El envío de esta alerta se ejecutará cada vez que se modifique la fecha de una tarea.

##### 3.2.4.7. Necesidad de proyectos en un departamento

El sistema notificará al responsable de negocio del departamento, de que no hay tareas en el backlog para ser asignadas a los equipos.

El envío de esta alerta se ejecutará una vez a la semana.

El envío de esta alerta se podrá desactivar para un departamento concreto.

##### 3.2.4.8. Necesidad de proyectos para un equipo en base a su capacidad

El sistema notificará a los responsables de desarrollo, de que no hay planificación suficiente para un equipo para el día actual +30, es decir, que el equipo se quedará sin trabajo planificado dentro de un mes de acuerdo a su capacidad.

Con esta alerta nos aseguramos de que ningún equipo tiene planificado menos de lo máximo que puede abordar, teniendo en cuenta el factor de dedicación de las tareas, que hará que unas tareas necesiten a un trabajador a tiempo completo mientras otras necesiten más o menos.

El envío de esta alerta se ejecutará una vez a la semana.

El envío de esta alerta se podrá desactivar para un equipo concreto.

### 3.3. Ciclo de vida de un proyecto en Task Distributor

A continuación se detallan los diferentes estados por los que pasará una tarea desde que negocio la solicita hasta que en tecnología se planifica y se desarrolla.

#### 3.3.1. Fases del ciclo de vida

##### 3.3.1.1 Creación

Negocio es el responsable de creación de la tarea.

Una vez creada, es necesario informar el responsable de la tarea y el funcional de la misma.

Una tarea sin responsable y sin funcional, nunca pasará a ser planificada por tecnología.

##### 3.3.1.2. Priorización

Una vez informados el responsable y el funcional, tendrá que ser priorizada por negocio.

Para priorizar una tarea se usará el orden respecto al resto de tareas existentes.

Hay dos tipos de priorizaciones:

* **Priorización sobre tareas en backlog**
   * En este caso, basta con asignar un orden respecto al resto de tareas en backlog, para que los responsables de desarrollo la puedan planificar en tiempo.
* **Priorización sobre tareas en ejecución**
   * Si hay que priorizar una tarea sobre el resto de tareas en ejecución, habrá que tener en cuenta que el resto de tareas planificadas se verán afectadas.

##### 3.3.1.3. Asignación y planificación

Una vez informados el responsable, el funcional y la prioridad, los responsables de desarrollo la estimarán en tiempo, de forma aproximada, y la planificarán en fechas, utilizando el recomendador de asignación.

En caso de planificar tareas sobre una planificación ya existente hay que tener en cuenta que el sistema deberá proponer la corrección automática de las fechas de finalización de las planificaciones existentes para poder encajar la nueva tarea planificada.

##### 3.3.1.4. Ejecución

Durante el desarrollo de un proyecto, se puede modificar la fecha de finalización del mismo.

Esto afectará al resto de planificaciones que haya para el equipo afectado. Será el sistema el que propondrá las nuevas fechas de finalización de las tareas existentes.

##### 3.3.1.5. Finalización

Una vez finalizado un proyecto, desaparecerá de la planificación y se dará por terminado.

Cualquier ampliación sobre un proyecto terminado tendrá que gestionarse sobre una nueva tarea.

#### 3.3.2. Ejemplos del ciclo de vida

A continuación se muestran dos ejemplos del ciclo de vida de las solicitudes de desarrollo por parte de negocio.

##### 3.3.2.1. Ejemplo 1. Tarea con prioridad baja

Desde el departamento X se crea una tarea a través de la nueva herramienta, a la que se asigna como responsable a la persona Y, se le adjunta el funcional y se prioriza como la primera tarea de las pendientes de planificar.

Como la tarea no altera la planificación, empezará a aparecer en las alertas que llegan a los responsables de desarrollo, por ser una de las primeras 5 tareas pendientes de planificar con toda la información necesaria para ser planificada.

Cuando el responsable de desarrollo encargado vaya a planificar la tarea, utilizará el recomendador para elegir uno de los equipos que la abordará. Antes de ello, tendrá que estimar en sprints la tarea para que pueda ser planificada.

El recomendador mostrará todos los equipos de desarrollo existentes, propondrá un orden de asignación, en base al algoritmo de priorización, y será el responsable de desarrollo el que haga la elección definitiva de equipo.

Una vez elegido el equipo, se asignarán fechas de inicio y fin y en base a la planificación existente y la carga del equipo.

Conforme se asignen las fechas, el sistema de alertas notificará al creador de la tarea, para que tenga conocimiento de que la tarea ha sido planificada en fechas.

El equipo de desarrollo llegará al momento de iniciar la tarea, pasando la misma de estado To Do a estado Doing.

Una vez finalizada, se dará por cerrada la tarea.

##### 3.3.2.2. Ejemplo 2. Tarea con prioridad alta que modifica la planificación actual

**PENDIENTE de definir**

### 3.4. Diseño

A continuación se detallan las pantallas de la aplicación.

#### 3.4.1. Proyectos planificados

Será la pantalla principal, a la que se accederá al acceder a la aplicación.

La pantalla principal mostrará unos filtros en la parte superior donde se podrá filtrar por departamento, equipo, fechas de inicio y fecha de fin.

Para el rol negocio, solo aparecerán los proyectos del departamento de los usuarios que accedan mientras que para el rol tecnología aparecerán todos los departamentos.

En esta pantalla se mostrarán todos los proyectos planificados y tendrá dos zonas.

En la parte superior se mostrarán los KPIs documentados arriba.

En la parte de abajo se mostrará un gantt similar al utilizado en los Timeline de Google Sheet.

#### 3.4.2. Proyectos pendientes de planificar

Será una pantalla, con los mismos filtros que la pantalla de proyectos planificados.

En la zona central mostrará KPIs relacionados con los proyectos pendientes de planificar.

En la zona baja, mostrará una tabla con el detalle de todos los proyectos pendientes de planificar.

#### 3.4.3. Formulario alta proyecto

Existirá un formulario donde tanto negocio podrá dar de alta un proyecto.


