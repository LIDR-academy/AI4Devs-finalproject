Prompt 1

Ahora que ya hemos desarrollado la primera parte del front vamos a continuar con el desarrollo.
El siguiente paso es empezar a implementar el backend relacionado con la historia de usuario US-08 disponible en @historiasUsuarioYBacklog.md . 

Los tickets de la historias están en @ticketsTrabajo-US-08.md 

La especificación del proyecto la tienes en los ficheros @prd.md y @20250506-TaskDistributor-Funcional-v1.1.md 

Además, tienes la especificación del api de redmine en @redmine-api-spec.yaml 

Tb tienes el modelo de datos en @modeloDatos.md .

En la carpeta @taskdistributor-bbdd tienes la definición de la base de datos. Si hay que moverla dentro del backend, indícamelo.
Uno de los primeros pasos será conectar el backend con la base de datos y migrar la información a la misma en base a los ficheros existentes.

Antes de empezar, hazme todas las preguntas necesarias y haz un plan por el que empezar el desarrollo. Quiero ir paso a paso para tener claro todo lo que se desarrolla.

------------------------------------------------------------------------------------

Prompt 2 

Te respondo a las preguntas planteadas.

1. Estructura del proyecto
Prefiero mover la carpeta @taskdistributor-bbdd dentro del backend.
Si, consolida con lo que hay dentro de la carpeta @backend 

2. Integración con redmine
Por ahora no tengo un servidor de redmine de prueba. Lo haré más adelante. Mockea la información por ahora.
Te daré las credenciales más adelante.

3. Base de datos
Si, ya la tengo configurada pero aun no están cargados los datos del seed.js.
Dime los pasos a seguir para cargar la información.
Tengo la base de datos configurada en mi herramienta Dbeaver.

4. Autenticación y autorización.
Por ahora, implementación propia para la autenticación.
Si, implementa el sistema completo ahora.

5. Priorización de tickets.
Vamos a empezar por US-08-02. En el front ya tengo la funcionalidad para engancharla con el backend cuando esté disponible.

En relación al plan de desarrollo me parece.

Si no tienes más preguntas, vamos a comenzar con la fase 1, relacionada con la base de datos.