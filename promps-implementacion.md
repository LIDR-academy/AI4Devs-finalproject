**Prompt 1:**
Actua como un desarrollador expero en NodeJs y Docker

Analiza el fichero @readme.md y explicame la Estructura de directorios que debe contener mi aplicacion descrita ademas de las configuraciones necesarias de docker para ejecutar el proyecto en un ambiente local

-No implementes nada aun
-Revisa si existen especificaciones en contraduccion en las reglas de negocio
-Se consiso en tu respuesta

Hazme las preguntas necesarias antes de responderme

**Prompt 2:**
A partir de la informacion anteriormente recopilada genera la estructura de directorios.

NO generes ningun fichero de codigo o configuracion aun

**Prompt 3:**
Ahora genera los primeros archivos de configuracion:

-docker-compose.yml
-packages.json

**Prompt 4:**
Continua con la instalacion de dependecias de cada servicio.

Ten en cuenta que uso nvm y debes cambiar a la version 20.19.5 cuando vayas a ejecutar algun comando de node

**Prompt 5:**
Genera los ficheros necesarios para una primera version donde solame exista una pagina de "Hola Mundo"

El objetivo es tener la aplicacion funcionando para luego comenzar con las HU documentadas

**Prompt 6:**
Actua como un desarrollador de software senior expert en NodeJS, MySQL y Redis.

Analiza el fichero @documentation/HISTORIAS_USUARIO.md  para determinar el orden de ejecucion de cada uno de los tickets de trabajos definidos en cada una de las HUs.

Vamos a comenzar con los tickets de la HU1.

Antes de comenzar a implementar explicame cual es el orden de ejecucion de HU1

NO implementes nada, primero dime cual es el orden de implementacion de los tickets de trabajo


*Notas*: Aqui comenzé a usar GPT-5.3 Codex y una nueva version de Cursor donde cambiaba en automatico al modo plan y construia un plan de implementacion. Este prompt lo ejecute para cada una de las HUs faltantes para la implementación

**Prompt 7**
Actua como un desarrollador experto en React, NodeJS, TypeScript, TypeORM. Necesito implementar las HU descritas en   @documentation/HUX  . Revisa la documentacion disponible y propponme una plan de implementacion para completar las taraeas. Antes de pasar a la implementacion explicame la propuesta de solucion y espera por mi confirmacion para proceder.


**Prompt 8**
Actua como un experto en calidad de software y QA especializado en pruebas de integracion. Revisa el proyecto y proponme un plan de pruebas de integracions y E2E para probar el 100% del MVP construido

**Prompt 9**
Para completar la suite vamos a emplear cypress. Generame el documento en @documentation donde se detalle el plan de pruebas propuestas. Una vez que termines implementa el plan propuesto. Antes de comenzar hazme todas las preguntas necesarias para un mejor entendimiento del contexto necesitado.
