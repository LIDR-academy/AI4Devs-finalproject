**Prompt 1:**
De acuerdo al PRD @readme.md vamos a dar inicio creando la estructura del proyecto, la cual se encuentra definida en ### Estructura del Proyecto; para lo cual requiero que generes los comandos necesarios para crear toda la estructura del proyecto en windows. Realiza esta actividad haciando uso de los estandares actuales de la industria para la definición de directorios de acuerdo a cada una de las tecnologias que se referencian.

**Prompt 2:**
Ahora vamos a definir la estrucutra de la base de datos con base a ## Modelo Entidad Relación y Diccionario de Datos, de acuerdo a lo especificado en el documento @readme.md. Para esto debemos crear el archivo de configuracion para correr PostresQL sobre Docker e instalar todas las dependencias necesarias para que esto opere de manera correcta.

**Prompt 3:**
Requiero poblar todas las tablas en la base de datos con datos de ejemplo, en pro de al momento de realizar los consumos, estos retornen datos.

**Prompt 4:**
Al ejecutar las instrucciones los nombres como "Juan Pérez", me quedaron de la siguiente manera "Juan P??rez", podriamos ajustar el script para borrar todos los datos y volverlos a crear de manera correcta?

**Prompt 5:**
Hasta hora todo va perfecto, el siguiente paso es crear solo los microservicios que te solicite. 
Vamos a comenzar con los micro servicios para del modulo de clasificacion de acuerdo al apartado #### Servicio de Clasificación del documento @readme.md. Los servicios para el Análisis de contribuyentes deben ser creados usando FASTAPI. Genera cada uno de los archivos necesarios incluyendo los archivos para instalar todas las dependencias y modulos necesarios para el correcto funcionamiento de los servicios. Usa buenas prácticas como SOLID, DRY y patrones de diseño.

**Prompt 6:**
Vamos a dar inicio a los servicios de Gestión de Cobro, los cuales se encuentran definidos en la historia de usuario ## Ticket de Trabajo Técnico 2: Estrategias de Cobro Personalizadas (Frontend).
Para comenzar creemos los servicios que nos permitan dar respuesta a cada una de las siguientes funcionalidades, estos deben estar implementados en Node.js/Express y hacer uso del modelo de datos ## Modelo Entidad Relación y Diccionario de Datos, tambien presente en el documento PRD.
1. Diseñar e implementar las vistas y componentes de la interfaz de usuario para la configuración de estrategias de cobro personalizadas.
2. Desarrollar las interacciones y flujos de trabajo para el envío automático de notificaciones y recordatorios de pago a contribuyentes de alto nivel de probabilidad.
3. Implementar las vistas y lógica de negocio para ofrecer incentivos como descuentos, financiación y acuerdos de pago a contribuyentes de probabilidad media.
4. Diseñar e implementar las vistas y flujos de trabajo para la programación y seguimiento de visitas y acciones legales para contribuyentes de baja probabilidad de pago.
5. Desarrollar la interfaz de administrador para el monitoreo y control de la aplicación de las estrategias de cobro.

Actualmente ya se encuentra implementado el modelo de datos y el script de creacion son: project\database\init\01-init.sql
Realiza la implementacion usando el estandar OpenAPI

**Prompt 7**
Ahora creemos dos nuevos servicios que permitan obtener la clasificacion de un contribuyente, y otro para obtener las estrategias de cobro asociadas al contribuyente. Ambos servicios recibiran como parametro el id del contribuyente, se consulta la informacion del contribuyente y la clasificacion otorgada, informacion que es almacenada en la tabla clasificacion, para el primer servicio. Y para el segundo, se consulta tambien la tabla estategia de cobro, la cual se asocia a la tabla clasificacion a traves de la columna clasificacion_id. Recuerda implementar estos con el estandar OpenAPI.

**Prompt 8:**
Ahora de acuerdo al documento de especificacion @readme.md vamos a crear los servicios de monitorizacion del proceso de gestion de cobro.
