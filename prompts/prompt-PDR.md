# Instructions 
You are an expert in prompt engineering. Given the following prompt, prepare it using best-practice structure (role, objective, etc.) and formatting to achieve a precise and comprehensive result. Stick strictly to the requested objective by carefully analyzing what is asked in the original prompt. Make it in md so it's easier to copy-paste.
# Original Prompt: 
I have this info And I  need to create a PRD in english.
Quiero desarrollar una plataforma para mi entrenador personal.
Necesita una plataforma donde poder registrar a sus coachees, y asignarles distintas categorias segun su nivel (5 categorias en total, 5 colores distintos). Tambien añadir a otros coaches
Él hace tanto classes individuales como classes grupales. Las clases grupales son de un máximo de 4 personas. Y estas estan agrupadas segun nivel. 
Actualmente tiene a otro coach trabajando para él.
El sitio/gimnasio donde realiza las clases tiene una capacidad de:
2 clases individuales al mismo tiempo
1 clase grupal
Este sistema que necesita, tiene 2 partes:
La plataforma para el coach donde él puede dar de alta a sus coachees y gestionar las clases, calendario, etc.
La plataforma para el cochee, donde verà el calendario con sus clases y podrá recibir notificaciones cuando haya alguna clase de su alcance disponible.
Me gustaria que las plataformas en realidad fueran una unica aplicación por detras. Me gustaria que segun el rol del usuario que se logea, aparezcan unas pantallas u otras. Y toda la gestión de calendario, no deberiamos partir de cero, sino usar Google Calendar API.
Roles de la plataforma:
Admin: añade usuarios (coachees), crea y agenda clases, bloquea calendario, añade coaches
Coach: crea y agenda clases
Cochee: ve el calendario con todas las clases pero:
- las clases inidivuales de otros usuarios solo ve el calendario como ocupado , color gris
- sus propias clases ya ajendadas las ve en azul, y con la opción de cancelar, ya sea individual o grupal
- Las clases grupales de su nivel, un nivel mas o un nivel menos en las que no este apuntado (esas son las clases a su alcance) las ve de color verde y tiene la opción de apuntarse. Si la clase esta llena, se apuntara en un waiting list
- Las clases grupales que no esten a su alcance, las verá como ocupadas y del mismo gris que las individuales ajenas
PANTALLAS ADMIN & COACH:
Diseño desktop & mobile
Estructura general: barra lateral izquierda con opciones:
Today
Calendario
Coachees
Coaches (solo visible para el admin)
Tambien me gustaria la tipica campanita de notificaciones arriba a la derecha, con su tipico desplegable. Solo se mostraran las notificaciones del dia actual
Pagina today:
Le aparecerà el listado de clases que tenga agendadas ese coach. Se mostrara por bloques con orden vertical cronologico. Cada bloque muestra el nombre del/de los coachees y la hora de inicio. Si la clase es individual, se mostrara con el background de un color y si es grupal, de otro color distinto. Si tenia alguna clase que se ha cancelado, la mostraremos en gris y añadiremos un tag de cancelada. 
Pagina calendario:
Tiene un calendario basado en Google Calendar API  y arriba hay una barra con varias opciones, empezaremos por la de añadir eventos/clases. 
Como los eventos que se van a añadir tienen una estructura distinta de cara al usuario (en este caso coach) que los tipicos eventos del google calendar, tendremos un botón que ponga "Add class". Esto abrira un modal donde se podra escoger el tipo de clase (individual, grupal o bloqueo), añadir a los coachees que van a participar, una descripción, un nivel de cochee (selector entre los 5niveles mencionados anteriormente , el dia en el que la quieren añadir  y de alguna forma mostrarles las horas disponibles. Todas las clases siempre seran de 1 hora.
Si la clase es individual, no permitir añadir mas de 1 cochee, si la clase es grupal, no permitir añadir mas de 4 coachees ni menos de 3 coachees. Y un boton que diga "Save" y que guarde esa clase.  En el caso de escojer el tipo bloqueo, no aparecera ningun campo para añadir coachees, ni el campo para escoger nivel .
Pagina coachees
Mostrara una tabla de todos los Coachees con Nombre, correo, telefono, una columna que diga si hace clases indiv iduales, grupales o los 2, y una columna de estado (active/inactive).Al final de cada row, habra una columna mas que sera la de acciones. Se mostrara el tipico icono de 3 puntitos en vertical y al hacer click, aparecera una cajita con la opcion de desactivar si el coachee esta activo o Activar si el Coachee esta desactivado.    
Arriba a la derecha habra un botón que diga Add Coachee (Este botón solo sera visible para el admin) y este abrirá un modal donde pedira la siguiente info: nombre, apellido, correo electronico, numero telefono movil, tipo de clases (multi check con opcion individual y opcion grupal), additional info (text area), nivel (selector entre los 5).  Y tendrà un botón "save". Al guardar, también guardaremos la fecha actual. 
Encima de la tabla, en la izquierda, habra un filtro de activo/desactivado del tipo select pero con checkboxes para cada opcion y que sea multiselect. Y al lado, otro que sea por niveles
PANTALLAS ADMIN
Pagina Coaches
Mostrara una tabla con todos los coaches con Nombre, correo, telefono, cuenta bancaria, numero seguridad social, dni, estado. En la ultima columna se mostrara el tipico icono de 3 puntitos en vertical y al hacer click, aparecera una cajita con la opcion de:
- ver detalles, y se abrirá un modal que pondra "Additional info" como titulo y debajo el contenido de ese campo.
- desactivar si esta activado, o activar si esta desactivado
Arriba a la derecha habrá un botón que diga Add Coach y este abrirà un modal donde pedira la misma info que se muestra en la tabla y habrá un campo de Additional info con un text area. A bajo a la derecha, habrá un botón que diga Save y guardara ese coach y cerrará el modal.
Encima de la tabla, en la izquierda, habra un filtro de activo/desactivado del tipo select pero con checkboxes para cada opcion y que sea multiselect. 
PANTALLA COACHEE
Diseño mobile-firs
Me gustaria que en algun sitio por la parte superior se viese el dia y hora de su proxima clase.
Despues, me gustaria que viese una sección que mostrara lasproximas clases grupales a las que se puede unir. 10 dias vista. 
Y en la parte de abajo, me gustaria que hubiera una barra tipo menu con 3 opciones:
- Home (lo descrito arriba)
- Calendario: que se viera un calendario, mostrando solo una semana, con las cosas mencionadas en la descripción del rol.
- Notificaciones: la tipica campanita de notificaciones con su tipico desplegable.
OTRAS NORMAS/CARACTERISTICAS de la plataforma:
Cuando un coachee se apunta a una waiting list, si esa clase luego tiene una vacante por la baja de otro coachee, este recibirà una push notificación en el telefono avisandole que hay un sitio libre y puede apuntarse.
Si de repente se añade una clase grupal del alcance de un cochee y en esa clase hay una vacante, este recibirà una push notificación en el telefono avisandole que hay un sitio libre y puede apuntarse.
Si un coachee cancela su clase individual, El coach recibirà una notificación informandole.
CARACTERISTICAS TECNICAS:
Tiene que ser una web app que pueda mandar push notifications y se pueda crear un acceso directo en el mobil de tal manera que parezca una applicacion nativa. 
Tiene que usar el Google Calendar API
Tiene que tener una clean architecture o architectura hexagonal.
Tiene que tener una buena performance
Tiene que tener una buena UX