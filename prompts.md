He estado usando Cursor durante toda la conversación, para así tener acceso a gpt-4o en modo ilimitado. Puntualmente, he utilizado la versión gratuita de ChatGPT.


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
Actua como un experto analista de producto, en el area de software para gestión de inversiones financieras.

Quiero crear un gestor de inversiones con el que los usuarios puedan seguir inversiones dentro de un portfolio, siendo los tipos de activos (lista no cerrada): acciones, fondos de inversión, depósitos a plazo fijo, cuentas de ahorro.

Dime cuál serían las 10 características para que este gestor estuviera posicionado como un productor innovador y fácil de utilizar


**Prompt 2:**
Hay algún producto opensource que pueda usar como base para hacer realidad esta idea que tengo?

--> Aquí he obtenido conocimiento de varios proyectos, el que me ha parecido más interesante es Ghostfolio, que es una aplicación opensource para llevar el seguimiento de tu patrimonio personal. Me ha parecido muy interesante ya que incluye las funcionalidades que busco tener en mi proyecto, así como una interfaz bastante atractiva.

**Prompt 3:**
EasyPortfolio (ndlr - nombre provisional) es una aplicación para llevar el seguimiento de tu patrimonio personal de manera sencilla y eficiente.
Intenta ser capaz de manejar distintos tipos de patrimonio, desde acciones, fondos de inversión, criptomonedas, depósitos a plazo fijo, cuentas de ahorro.

(ndlr - Pegado contenido de la seccion "1.2. Características y funcionalidades principales" del readme.md)

Generame tres imágenes, una para cada pantalla que se acaba de describir

**Prompt 4:**
Puedes generarme una pantalla que sea para desktop y no para terminales móviles?

**Prompt 5:**
Viendo como describo la aplicación, proponme 5 nombres para mi aplicación. Tienen que reflejar cierta simplicidad en el uso pero una buena riqueza de funcionalidades



---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Teniendo en cuenta lo explicado en @readme.md hasta la línea 76 (puedes ignorar el resto), quiero que me propongas una arquitectura técnica para esta aplicación. Esta tiene que ser simple, en la medida de lo posible, para así poder ir rápidamente en "time-to-market", pero escalable.

Piensa en que tipo o tipos de base de datos se va a necesitar, sobre todo si es necesario tener algún tipo de NoSQL DB para la parte de almacenar el histórico de precios.

Generame el diagrama de arquitectura de tipo C4Component, en formato Mermaid

**Prompt 2:**
Gracias, podrías tener en cuenta que quiero que el backend sea en Java, Springboot a ser posible. Regenera de nuevo teniendo en cuenta esto

**Prompt 3:**
Añade al diseño de la arquitectura las llamadas al servicio de precios (ie YAHOO) así como la referencia a este servicio externo. Estas llamadas se realizarán desde el backend

**Prompt 4:**
Puedes hacer que el tipo de cajita "external price service" sea diferente a "component"? 

**Prompt 5:**
cuales son los distintos tipos de componentes en un diagrama C4?

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Hazme una descripción de los componentes técnicos más importantes, explicando las tecnología utilizada y las ventajas que estos aportan

**Prompt 2:**
modificame el punto 2 para especificar que utilizaremos java 21. Asimismo, enumera las ventajas que nuestra aplicación se puede beneficiar de usar esta versión de java
También si hay algún incoveniente en que esta versión sea usada, avísame.

**Prompt 3:**
(ndlr - nueva sesión con ChatGPT) Quiero hacer uso de una API que me dé valorizaciones de activos en mercados financieros (acciones, etfs, fondos de inversión). Qué opciones tengo a disposición, que sean gratuitas? Voy a hacer un uso moderado de ellas en una aplicación de portfolio management, pero me gustaría saber cuál de las opciones tienen límites más altos

**Prompt 4:**
Cómo de fácil es integrarse Yahoo Finance para mi caso de uso? Quiero ir fácil, no descargar muchos campos, en un primer tiempo, y quiero integrarlo en un backend en Java+Springboot, con lo que normalmente voy a descartar la opción de usar yfinance

--> Decido ir con YahooFinance, a través de la librería "YahooFinanceAPI". No descarto en el futuro ir también con polygon.io y así tener dos proveedores de datos de mercado.



### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
```
Teniendo en cuenta lo explicado en @readme.md hasta la línea 87 (puedes ignorar el resto) y las siguientes especificaciones, quiero que me respondas a ciertas preguntas. Antes que nada, dime si tienes alguna duda, encuentras alguna inconsistencia o algún dato que no esté presente.
## La aplicación podrá tener más de un portfolio. 
Cada portfolio tendrá una lista de activos presentes y pasados (ya vendidos o expirados). 
De cada portfolio tendremos las siguientes informaciones (aparte de los diferentes activos)
- Divisa principal
- Fecha creación
- Valor actual
* Para cada portfolio, me gustaría guardar las valorizaciones de días especificos, para no tener que volver a calcularlo


## De cada activo tendremos las siguientes informaciones. Ten en cuenta para las restricciones de nulabilidad y cardinalidad, que algunas informaciones se usarán para cierto tipo de activos
- Tipo de activo (lista no cerrada: acciones, ETF, fondo de inversión, criptomonedas, cuenta de ahorro, depósito a plazo fijo)
- Nombre
- Ticker
- Divisa
- Tipo de cambio divisa compra
- Fecha de compra
- Número de títulos
- Precio medio unitario
- Coste en comisiones y gastos
- Precio total de coste
- Precio actual
- Última valorización
- Fecha de actualización

- Tasa de interés nóminal
- Plazo de inversión
- Precio unitariode venta
- Tipo de cambio divisa venta


## Para los activos que tengan precios que oscilan, guardaremos las siguientes informaciones (una línea por cada día y activo):
- Fecha
- Precio de cierre
- Divisa
- Ticker
- Nombre
- Precio de apertura
- Precio máximo
- Precio mínimo
- Volumen
```

Respuesta del LLM:
```
No tengo dudas ni encuentro inconsistencias en la información proporcionada. Sin embargo, hay algunos datos que no están presentes y que podrían ser útiles para una implementación completa:
1. Identificadores únicos: No se mencionan identificadores únicos para portfolios y activos. Estos son necesarios para relacionar las entidades en la base de datos.
2. Relaciones entre entidades: No se especifica cómo se relacionan los activos con los portfolios en términos de claves foráneas.
3. Frecuencia de actualización: No se menciona con qué frecuencia se actualizarán los precios de los activos.
4. Historial de valorizaciones: No se especifica cómo se almacenará el historial de valorizaciones de los portfolios.
Con esta información, puedo responder a tus preguntas y ayudarte a diseñar el modelo de datos y la estructura de la base de datos. ¿Te gustaría proceder con alguna pregunta específica o necesitas ayuda con el diseño del modelo de datos?
```

**Prompt 2:**
1. y 2. Son columnas técnicas, que te voy a pedir que proporciones más adelante, cuando te pida generar el modelo de datos (todavía no, por favor)
3. 1 vez al día
4. Proporcioname una solución que me permita guardar esta información de manera eficiente, así como extraerlo rápidamente

**Prompt 3:**
Todo está correcto, generame el modelo completo por favor

**Prompt 4:**
De momento no veo necesario el uso de una BD NoSQL como DocumentDB o DynamoDB. Qué opinas?

**Prompt 5:**
Eres un experto diseñador de modelos de bases de datos relacionales, conoces todas las formas normales, incluyendo las 1FN, 2FN, 3FN y la Forma Normal de Boyce-Codd (FNBC)?

**Prompt 6:**
De acuerdo. Entonces, tomando este rol y teniendo en cuenta lo descrito en @readme.md  acerca de la aplicación WeathTrack que estoy diseñando, podrías analizar el modelo de datos descrito en @schema.sql y decirme si cumple todas las formas normales, mencionadas en mi anterior pregunta. En caso contrario, sugiéreme cómo deberíamos de adaptar el modelo para que sí las cumpla

**Prompt 7:**
Las columnas de DetallesActivos, están ya incluidas en las tables Activos (ticker, nombre y divisa). No podríamos simplemente evitar esta tabla DetallesActivos?



---

### 4. Especificación de la API

**Prompt 1:**
Basado en todo lo explicado en @readme.md y en el modelo de datos especificado en @schema.sql, listame los endpoints que la API de mi backend tiene que tener.

**Prompt 2:**
Puedes listarme los endpoints, así como una descripcion de lo que hace? Te pediré la especificación OpenAPI completa más tarde

**Prompt 3:**
Analiza las dudas que tengo en los siguientes puntos:

- Portfolios: Queremos sólo obtener la información de un cierto portfolio. Hay que pensar que un portfolio es una familia y, con la autentificación implementada, no tendrá sentido obtener más de un portfolio
- Activos: Queremos obtener los activos de un cierto portfolio, el parametro sería "portfolio_id", no id. GET /activos también debería desaparecer
- Valorizaciones Diarias: similar a portfolio, sólo queremos para un portfolio dado
- Precios de Activos: queremos solo aquellos relacionados con un portfolio, o un sólo activo, en caso de ver el detalle de ese activo

Si estás de acuerdo en todo, actualiza esta lista. Sino, hablemos

**Prompt 4:**
Refactoriza @openAPI.yaml para que todas las propiedades estén en formato camelCase


---

### 5. Historias de Usuario

**Prompt 1:**
Eres un experto jefe de producto y business analyst. En base a las especificaciones descritas en @readme.md listame las diferentes historias de usuario (sólo con un título para cada una de ellas) que identificas

**Prompt 2:**
En base a esta lista, generame el CSV en @userStories.csv   para poder importarlo en JIRA y que cada línea sea una user story de JIRA basado en @https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/ 
Las columnas serán las siguientes: 
Summary, Reporter, Issue Type, Priority
Pon prioridad 100 a todas, para empezar

**Prompt 3:**
Teniendo en cuenta lo que está descrito en @readme.md y en @schema.sql ,  redefine la prioridad de las historias. Menos valor es menos prioridad. Mayor prioridad son las de más de 100 (200, 300 o incluso más). Actualiza @userStories.csv adecuadamente

---

### 6. Tickets de Trabajo

**Prompt 1:**
Eres un desarrollador full stack experimentado, teniendo en cuenta
- las historias de usuario que hemos definido en @userStories.csv
- la arquitectura del sistema descrita en @readme.md
- el modelo de datos descrito en @schema.sql
- la especificación de la API hacia el backend descrita en @openAPI.yaml

Rellename el fichero @technicalTasks.csv con los tickets de trabajo adecuados para cada historia de usuario. Encontrarás las diferentes columnas que tienes que rellenar, como por ejemplo  UserStoryId, que es el id de la historia de usuario, y InitialEstimate, que es el tiempo estimado para completar la historia de usuario en horas. 

**Prompt 2:**
Quiero focalizarme en crear valor para el usuario, desde el punto de vista de una demo, para el potencial cliente. Cuales son las 6 primeras tareas que me aconsejarías tomar para hacer un POC? Funcionalidades como el registro de usuario, la identificación no son necesarias en este contexto.

**Prompt 3:**

---

### 7. Pull Requests
### 7.1. Backend

**Prompt 1:**
Eres un experto programador de backend en Java. Crea un esqueleto de proyecto, para un microservicio de backend:
- Utilizaremos la última versión LTS de Java, 21
- Servirá peticiones REST usando el framework SpringBoot. 
- Usará Maven para la compilación
Crea todo lo necesario para que después podamos empezar a añadir endpoints:
- Prevee la estructura necesaria para los test unitarios. Añade un test unitario de ejemplo. Haz que use Mockito
- Crea un fichero de configuración de SpringBoot, con el perfil adecuado para desarrollo.
- Crea un fichero dockerfile para la construcción de la imagen de docker

**Prompt 2:**
Genera en @backend lo necesario para empezar a comunicar con una DB postgresql, incluyendo el uso de Spring JPA y de Hibernate, si necesario. Igualmente, genera en el paquete "com.ai4devs.enrique_finalproject.data" los data beans correspondientes a las tablas definidas en @schema.sql 

**Prompt 3:** (nueva sesión)
Eres un programador experto en backend con Java y Springboot. 
Utiliza un enfoque de desarrollo TDD y una arquitectura de código hexagonal para crear en @backend el endpoint /portfolio (get) como se ha definido en @openAPI.yaml 

Si necesitas validar alguna validar alguna suposición, pregúntame antes de escribir código

**Prompt 4:**
Eres un experto backend developer. Modifica algunas tablas en  @schema.sql 
- Portfolio no tiene valorizaciones diarias. Estas últimas ya tienen la referencia del portfolioID
- Activo no tiene precios activos. Similar al anterior, PreciosActivos ya tienen el ticker del activo y de ahí los podríamos recuperar

Ten en cuenta todo el @backend ya que hecho cambios en las capas repository, service y controller. 
Refactoriza los test unitarios existentes para que sigan teniendo sentido y cubran todos los casos existentes y cualquier nuevo que pueda aparecer (cerciorate de verificar la existencia)

### 7.2. Frontend
**Prompt 1:**
CREATION DE ESQUELETO DE FRONTEND - usando v0 by Vercel
I want to create an application to do wealth management, at personal and family level, in a simple and efficient way. It has an dashboard where we have the list of assets where it displays the current value as well as the potential benefit or loss you are incurring it, among other informations. Secondly, we have a graph with the total value of the portfolio over time.

I'm attaching some pictures of an application I want to be inspired of, even though I would like the esthetics to look more similar to the default design from the Bootstrap library


**NO IA Prompt 3:**
He usado el código generado por v0 dentro de un esqueleto de proyecto creado desde "React Shadcn Starter"

**Prompt 4:** NO ENVIADO
Eres un programador de frontend experimentado. Aplica patrones de código limpio para refactorizar @dashboard.tsx para que los datos que se muestran en la tabla de holdings se obtengan del backend. Son varios endpoints (todos GET, en esta ocasión) los que se van a llamar:

http://localhost:8080/portfolio
```json
{
  "id": 1,
  "nombre": "Acciones",
  "divisaPrincipal": "EUR",
  "fechaCreacion": "2024-09-16",
  "valorActual": 10000,
  "activos": [],
  "valorizacionesDiarias": []
}
```
http://localhost:8080/valorizacion-diaria/1
```json
[
  {
    "id": 2,
    "portfolioId": 1,
    "fecha": "2024-09-16",
    "valor": 10000
  },
  {
    "id": 3,
    "portfolioId": 1,
    "fecha": "2024-09-15",
    "valor": 9000
  },
  {
    "id": 4,
    "portfolioId": 1,
    "fecha": "2024-09-14",
    "valor": 8500
  }
]
```
http://localhost:8080/activos/1
```json
[
  {
    "id": 1,
    "portfolioId": 1,
    "tipo": "ACCION",
    "nombre": "Microsoft",
    "ticker": "MSFT",
    "divisa": "USD",
    "tipoCambioDivisaCompra": 105,
    "fechaCompra": "2024-09-10",
    "numeroTitulos": 10,
    "precioMedioUnitario": 490,
    "costeComisiones": 4,
    "precioTotalCoste": 4700,
    "precioActual": 510,
    "ultimaValorizacion": 4857,
    "fechaActualizacion": null,
    "tasaInteresNominal": null,
    "plazoInversion": null,
    "precioUnitarioVenta": null,
    "tipoCambioDivisaVenta": null
  }
]
```

Asegúrate de que las urls están externalizadas en un fichero de configuración y no hardcodeadas. También de que @dashboard.tsx reciba un objeto de datos ya completo con la estructura de lo que se va a mostrar y que el cálculo de este se haga fuera, usando el patrón de desarrollo más adecuado a esta situación, en componentes frontend.

NDLR Respuesta del gpt-4o:
```
Para refactorizar el código de dashboard.tsx y obtener los datos del backend, aquí hay algunas preguntas clave para asegurarme de que entiendo completamente tus necesidades:
Estructura de Datos:
¿Podrías confirmar la estructura exacta de los datos que deseas mostrar en la tabla de holdings? Por ejemplo, ¿cómo se calculan los campos value, allocation, change, y performance a partir de los datos obtenidos del backend?
Endpoints:
¿Hay algún endpoint adicional que deba considerar, o solo los tres mencionados (/portfolio, /valorizacion-diaria/1, /activos/1)?
¿Los endpoints siempre devolverán datos en el formato proporcionado?
Configuración de URLs:
¿Tienes alguna preferencia sobre cómo y dónde almacenar las URLs de los endpoints? Por ejemplo, ¿en un archivo de configuración específico como config.js o config.ts?
4. Manejo de Errores:
¿Cómo te gustaría manejar los errores de red o de datos? ¿Deberíamos mostrar mensajes de error en la UI, o simplemente registrar los errores en la consola?
Estado de Carga:
¿Deseas mostrar algún tipo de indicador de carga mientras se obtienen los datos del backend?
Librerías:
¿Hay alguna librería específica que prefieras para realizar las solicitudes HTTP? Por ejemplo, axios o fetch.
7. Patrón de Desarrollo:
¿Prefieres usar un patrón específico para la gestión del estado y la obtención de datos, como React Context, Redux, o React Query?
Una vez que tenga respuestas a estas preguntas, podré proceder con la refactorización del código.
```


**Prompt 5:**


1. Todos los campos vienen del backend. Los que no se usan, se usarán en el futuro, una vez que el frontend vaya evolucionando.
2. Siempre devolverán datos, a no ser que el portfolio indicado sea incorrecto. Para simplicidad, y porque cuando la capa de autentificación esté implementada la aplicación no pedirá información sobre portfolios incorrectos, asume que siempre serán correctos. Los id en /valorizacion-diaria/1 y  /activos/1 vienen de la llamada a /portfolio, el atributo "id".
3. No tengo ninguna preferencia, pero dame lo que sea más compatible con el stack técnico que tiene el frontend ahora mismo.
4. Prefiero mostrar los errores en la UI
5. No es necesario en un primer momento. Anotala en un TODO en el emplazamiento donde sería adecuado
6. La que sea más compatible con el stack técnico actual del frontend
7. Utiliza el patrón de React que sea más sencillo de implementar, así como de mantener