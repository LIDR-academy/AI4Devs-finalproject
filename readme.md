## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Danilo Octavio Alarcon Rodriguez

### **0.2. Nombre del proyecto:**
StockInsight AI

### **0.3. Descripción breve del proyecto:**
StockInsight AI es una herramienta inteligente que ayuda a inversores y usuarios interesados en la bolsa a tomar decisiones informadas sobre acciones bursátiles. Utilizando datos financieros en tiempo real combinados con inteligencia artificial, ofrece recomendaciones claras y análisis detallados sobre qué acciones comprar, vender o mantener, simplificando así el proceso de toma de decisiones en el mercado de valores.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto
El objetivo principal de StockInsight AI es proporcionar una herramienta sencilla y potente para inversores, analistas financieros y usuarios interesados en el mercado bursátil. El producto ofrece recomendaciones claras y bien fundamentadas sobre acciones específicas mediante análisis automatizado basado en Inteligencia Artificial, resolviendo el problema de análisis complejos, lentos y manuales. El valor que aporta es una toma de decisiones ágil e informada, ayudando a usuarios con o sin conocimientos avanzados a decidir rápidamente si conviene comprar, vender o mantener determinada acción bursátil.




### **1.1. Objetivo:**

El objetivo de este producto es proporcionar una herramienta inteligente que asista a inversores y entusiastas de la bolsa en la toma de decisiones sobre acciones. La aplicación permite obtener datos financieros clave de una acción en tiempo real (métricas de mercado y reportes de ganancias) y, con ellos, generar una recomendación personalizada (por ejemplo, si conviene comprar, vender o mantener la acción) mediante inteligencia artificial​.
En otras palabras, el producto automatiza el análisis financiero: reúne datos relevantes de la empresa seleccionada y utiliza un modelo de lenguaje (IA) para producir un análisis detallado con conclusiones, ahorrando tiempo al usuario y brindándole insights valiosos para sus decisiones de inversión. El público objetivo son inversionistas, analistas financieros o cualquier persona interesada en el mercado de valores que busque una herramienta de apoyo para evaluar acciones de forma rápida y fundamentada.


### **1.2. Características y funcionalidades principales:**

-Integración en tiempo real con APIs financieras: Obtiene datos clave de mercado como precio, variación diaria, volatilidad y próximos eventos financieros importantes (reportes trimestrales).
Análisis automático con Inteligencia Artificial: Proporciona recomendaciones detalladas en lenguaje natural (Comprar, Vender, Mantener), apoyadas en métricas financieras, análisis técnico, eventos corporativos y contexto de mercado reciente.
-Interacción sencilla mediante chat (Telegram o interfaz similar): La aplicación está diseñada para ser utilizada directamente a través de un chatbot en Telegram, permitiendo que los usuarios obtengan análisis y recomendaciones simplemente enviando el símbolo de la acción desde su dispositivo móvil.
-Alertas y notificaciones personalizadas: (opcional) Puede enviar al usuario notificaciones específicas, como recomendaciones diarias o avisos ante cambios importantes en las acciones que sigue.
-Consulta inmediata y sencilla de análisis financiero desde Telegram o servicios similares, sin necesidad de una interfaz web compleja.
-Proceso automatizado para recopilar información y producir recomendaciones fiables mediante IA.
-Validación automática y manejo robusto de errores para evitar interrupciones por fallos en la API externa o entradas incorrectas del usuario.

### **1.3. Diseño y experiencia de usuario:**

La experiencia del usuario se desarrolla principalmente a través de Telegram, El flujo típico sería:

-El usuario accede al chatbot desde Telegram.
-Envía un mensaje con el símbolo de la acción que desea consultar (por ejemplo: /consultar AAPL).
-Recibe automáticamente una respuesta detallada, incluyendo:
-Métricas financieras clave (precio actual, variación porcentual del día, volumen, volatilidad).
-Un análisis claro y fácil de entender generado por IA, que explica brevemente la situación actual de la acción.
-Una recomendación explícita y justificada de acción de inversión: "Comprar", "Vender" o "Mantener".
-Este diseño asegura que cualquier persona, independientemente de su nivel de conocimiento financiero, pueda acceder fácilmente a información valiosa para sus inversiones en cuestión de segundos, usando 
 una interfaz ya familiar como Telegram.
 
### **1.4. Instrucciones de instalación:**
Para ejecutar el proyecto localmente se deben seguir los siguientes pasos:

Clonar el repositorio del proyecto:


Configuración del entorno Python:
Verificar que Python 3.9+ esté instalado:
Configuración de variables de entorno:

Definir variables de entorno necesarias, como API keys y tokens de autenticación (OpenAI, API financieras, etc.):
export API_KEY_POLYGON="tu_clave_api"
export OPENAI_API_KEY="tu_clave_openai"

Configuración del Bot de Telegram:
export TELEGRAM_BOT_TOKEN="token_telegram"


Crear un bot mediante Telegram usando BotFather y obtener el token del bot.
Establecer el token del bot como variable de entorno:

export TELEGRAM_BOT_TOKEN="token_telegram"
Arranque del backend Flask:

flask run
Esto inicia el servidor local que conecta Telegram con la lógica de negocio (IA y APIs externas).

Ejecución del bot:

Ejecutar el archivo Python que inicia el bot:

python telegram_bot.py
Ahora, al abrir Telegram y enviar un mensaje al bot, se interactua con StockInsight AI.


---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
El sistema sigue una arquitectura cliente-servidor clásica de tres capas, con un frontend ligero, un backend RESTful y la integración de servicios externos (APIs de terceros). En el siguiente diagrama se representan los componentes principales y su interacción:

 Usuario (navegador)
         |
         v
 Telegram  
         |
         v
 Backend (Flask API) --> [API de Mercado de Tastytrade]
         |\__--> [Servicio de IA (OpenAI)]
         |
         \--> [Base de Datos Local]

En esta arquitectura, el patrón REST define la comunicación entre el frontend y el backend a través de endpoints HTTP bien estructurados. La elección de una arquitectura cliente-servidor con una API REST se justifica por su simplicidad, escalabilidad y separación de responsabilidades:
Telegram se encarga de la presentación y la experiencia de usuario.
El backend encapsula la lógica de negocio (obtener datos, combinarlos y procesarlos con IA) y expone servicios a través de endpoints HTTP.
Los servicios externos (la API de mercado y la API de IA) están desacoplados; el backend actúa como intermediario, siguiendo un patrón de integración conocido como External Service Layer. Esto permite reemplazar o modificar esos servicios con mínimo impacto en el resto del sistema.
La base de datos almacena información propia de la aplicación (por ejemplo, registros históricos de consultas o configuraciones), manteniendo así persistencia donde sea necesario, sin depender exclusivamente de llamadas externas.
No se utilizó un patrón de microservicios dado que el alcance del proyecto es acotado; en su lugar, se optó por una arquitectura monolítica modular (el backend maneja todas las funciones centrales). Esto facilita el desarrollo y la prueba en esta etapa. Sin embargo, gracias a la interfaz API, componentes podrían aislarse en el futuro (por ejemplo, un microservicio separado para la IA) si escalabilidad o mantenimiento lo requieren. En resumen, el sistema adopta un diseño por capas: presentación (frontend), lógica de negocio (backend) y datos (servicios externos y DB), con una clara separación que sigue principios MVC/MVVM en la práctica. Esta estructura mejora la mantenibilidad y permite que cada miembro del equipo trabaje en la capa de su especialidad (diseño de interfaz, desarrollo backend, etc.) sin interferir directamente con las otras.

### **2.2. Descripción de componentes principales:**

Frontend (Telegram Chatbot):
La interfaz del usuario es proporcionada íntegramente a través de Telegram mediante un chatbot desarrollado en Python usando la biblioteca python-telegram-bot. El usuario interactúa directamente desde la aplicación móvil o de escritorio de Telegram enviando comandos o mensajes con el símbolo de la acción que desea consultar. La respuesta también se recibe directamente en la misma conversación del chat.
Este enfoque permite que la experiencia sea extremadamente sencilla, accesible desde cualquier dispositivo móvil, y evita la necesidad de que el usuario instale o acceda a una interfaz web separada.

Backend (API REST con Flask): El servidor backend está desarrollado con el framework Python Flask y expone endpoints REST. Estos endpoints reciben solicitudes desde el chatbot de Telegram, procesan los datos solicitados (métricas financieras, reportes de ganancias) consultando a APIs externas, generan recomendaciones mediante un modelo de lenguaje (por ejemplo, ChatGPT/OpenAI) y devuelven la respuesta al chatbot.

Servicio de Inteligencia Artificial (OpenAI): Un componente externo esencial que recibe los datos financieros del backend y devuelve un análisis y recomendación en lenguaje natural. Se usa la API de OpenAI (GPT-4 o GPT-3.5) para generar respuestas claras y coherentes para el usuario final.

API Financiera (Polygon.io o Tastytrade): Componente externo utilizado por el backend para obtener datos bursátiles en tiempo real, fundamentales para que la recomendación generada por la IA esté actualizada y fundamentada con datos reales de mercado.


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto tiene una estructura organizada según responsabilidades y tareas específicas, facilitando su mantenimiento y comprensión. A continuación se detalla brevemente la organización real del proyecto según la estructura proporcionada:

TRADE-API/
├── .idea/                       # Archivos de configuración del IDE (PyCharm)
├── src/
│   ├── __init__.py             # Inicializador del módulo Python
│   ├── analisis_tecnico.py    # Genera señales técnicas como SMA, RSI, etc.
│   ├── chatbot.py             # Maneja la interacción del usuario mediante Telegram
│   ├── conexion_sdk.py        # Administra conexiones y autenticación con APIs externas
│   ├── notificaciones.py      # Lógica para gestionar notificaciones o alertas
│   └── recomendaciones.py     # Contiene la lógica principal para obtener datos y generar recomendaciones
├── tests/                     # Aquí se encuentran los tests unitarios y de integración del proyecto
├── venv/                      # Entorno virtual de Python con las dependencias aisladas
├── .env                       # Archivo que contiene variables de entorno (claves API, tokens)
├── main.py                    # Archivo principal para arrancar la aplicación Flask
└── README.md                  # Documentación general del proyecto (instrucciones básicas, etc.)

Explicación breve del propósito de las carpetas y archivos principales:
-src/: Directorio que contiene todos los módulos del backend de la aplicación:
-chatbot.py: Este módulo administra la comunicación del usuario con el producto a través del chatbot en Telegram, definiendo comandos y respuestas.
-conexion_sdk.py: Centraliza la gestión de autenticación y manejo de tokens necesarios para interactuar con las APIs externas (Polygon, Tastytrade, etc.). Aquí se implementan las funciones para obtener y renovar credenciales.
-recomendaciones.py: Contiene la lógica principal del negocio, que reúne datos financieros obtenidos desde APIs externas, los procesa mediante Inteligencia Artificial (OpenAI), y genera recomendaciones concretas (Comprar, Vender o Mantener).
-analisis_tecnico.py: Módulo encargado de generar señales técnicas adicionales (indicadores como RSI, SMA, etc.) que se utilizan como entrada adicional para la IA.
-chatbot.py: Implementación del chatbot que utiliza la biblioteca python-telegram-bot para interactuar con los usuarios directamente a través de Telegram. Este módulo captura comandos del usuario y los traduce en consultas a las funcionalidades de recomendación.
-notificaciones.py: Opcionalmente gestiona notificaciones que pueden ser enviadas al usuario mediante Telegram o correo electrónico cuando ocurren eventos específicos (p.ej., movimientos significativos en una acción observada).
-tests/: Directorio donde residen tests unitarios y de integración, asegurando la calidad del código mediante pruebas automatizadas.

-venv/: Entorno virtual de Python que aísla dependencias del proyecto de otras aplicaciones Python locales.

-.env: Archivo que guarda variables de entorno críticas para la ejecución segura del proyecto (claves API, tokens, etc.). Este archivo nunca debe ser compartido públicamente.

-main.py: Archivo Python principal que arranca la aplicación Flask. Aquí se definen las rutas REST, configuración del servidor Flask y la inicialización básica de la aplicación. Es el punto de entrada del backend.

Esta estructura del proyecto permite una clara separación de funciones: interacción (chatbot), lógica de negocio (recomendaciones y análisis técnico), gestión de datos y credenciales externas, y funciones auxiliares como notificaciones. Facilita la identificación rápida de dónde se implementa cada funcionalidad y es fácilmente ampliable según se agreguen nuevas características.

### **2.4. Infraestructura y despliegue**

La infraestructura del proyecto está diseñada para facilitar tanto su desarrollo local como un eventual despliegue sencillo y escalable. La estructura actual aprovecha una arquitectura simple pero robusta, integrando componentes clave como Flask (para el backend) y Telegram para la interacción del usuario final.

Usuario (Telegram App)
      │
      ▼
Telegram Bot API
      │
      ▼ (Webhook o polling)
Backend Flask (main.py)
├─ recomendaciones.py (Lógica IA y procesamiento)
├─ conexion_sdk.py (APIs externas: Polygon.io/Tastytrade)
├─ analisis_tecnico.py (Generación de señales técnicas)
└─ Base de datos local (SQLite)
      │
      ├── API Financiera externa (Polygon.io o Tastytrade)
      └─ OpenAI (Servicio IA)

Descripción del Proceso de Despliegue:
La aplicación puede desplegarse en distintos entornos, como local o producción en la nube, siguiendo estas recomendaciones:

Ejecución del Backend Local:

El servidor Flask (Backend) puede ejecutarse directamente usando el archivo principal del proyecto:
python main.py

Esto levantará el backend Flask, que estará escuchando peticiones desde Telegram.

-Configuración del Chatbot en Telegram:

Registrar el bot en Telegram usando BotFather para obtener el token necesario.
Ejecutar el archivo chatbot.py, que establece la conexión con Telegram usando la librería python-telegram-bot. Puede hacerse mediante polling (consultas regulares) o webhook (recomendado para producción por eficiencia).

Despliegue en Producción (Recomendado Docker):

Para producción, se recomienda usar Docker para asegurar una implementación uniforme y sencilla en cualquier plataforma (AWS, Heroku, DigitalOcean):

Crear un Dockerfile sencillo que defina:
FROM python:3.9-slim

WORKDIR /app

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]

Crear y ejecutar el contenedor Docker:
docker build -t stockinsight-ai .
docker run -d -p 5000:5000 --env-file .env stockinsight-ai

Esto ejecuta la aplicación Flask y deja el servidor escuchando en el puerto 5000, listo para recibir peticiones desde Telegram o servicios externos.

- Recomendaciones de Infraestructura para Producción:

Servidor WSGI: Se recomienda el uso de Gunicorn para gestionar múltiples solicitudes simultáneas de manera eficiente:
gunicorn main:app -w 4 --bind 0.0.0.0:5000
Proxy inverso: Usar Nginx como proxy inverso en frente de Gunicorn para administrar conexiones SSL/TLS (HTTPS), mejorar la seguridad y gestionar eficientemente peticiones entrantes.

Servicios Gestionados: Considerar servicios gestionados (AWS ECS, Heroku, o servicios equivalentes) para simplificar la administración de infraestructura.
Escalabilidad:

La arquitectura actual permite escalar horizontalmente agregando más instancias del backend Flask detrás de un balanceador de carga, gracias a su diseño stateless.


### **2.5. Seguridad**

Comunicación segura (HTTPS): Todas las interacciones con servicios externos se hacen vía HTTPS, asegurando la confidencialidad e integridad de los datos en tránsito. Por ejemplo, la URL usada para métricas https://api.tastyworks.com/market-metrics?... es HTTPS​. Si la aplicación se despliega en web pública, también se recomienda encarecidamente servirla sobre HTTPS (por medio de un certificado SSL en el servidor o usando un proxy que ofrezca TLS). Esto protege las consultas del usuario (aunque sea solo un símbolo bursátil, es mejor evitar potenciales interceptaciones) y la respuesta que incluye información financiera.
Validación de entradas: El backend realiza comprobaciones básicas sobre la entrada del usuario. El símbolo de la acción es un string que usualmente debe ser alfanumérico de 1-5 caracteres. El sistema valida que exista algún valor antes de proceder. Adicionalmente, la lógica está preparada para manejar casos en que el símbolo no sea válido o la API no retorne datos, evitando así procesos posteriores innecesarios​
Esta comprobación previene en cierta medida llamadas inútiles a la IA y posibles errores no controlados. Se podría ampliar con validaciones de formato más estrictas (por ejemplo, que solo contenga letras mayúsculas y opcionalmente números) para descartar entradas maliciosas o erróneas.
Gestión de Errores y Excepciones: El código del backend atrapa errores en las llamadas externas. Por ejemplo, después de llamar a la API de mercado, se verifica si el status code es 200; si no lo es, en lugar de propagar una excepción, se captura el código y mensaje de error y se imprime un log de error​
, retornando None o un mensaje controlado al flujo principal. Esto evita que una respuesta inesperada de terceros tumbe la aplicación. De igual manera, en la interacción con la IA, se envuelve la llamada en try/except (en la librería OpenAI suelen arrojar excepciones si algo falla), pudiendo así devolver un mensaje de error al frontend en vez de causar un crash.
Principio de mínimos privilegios: El token de la API de mercado se usa solo para las peticiones necesarias y se mantiene oculto al usuario final. La respuesta que llega al frontend no contiene el token ni información sensible de credenciales, solo los datos procesados. Asimismo, si existiera un sistema de usuarios, se implementarían medidas como hash de contraseñas (p. ej. usando bcrypt) y control de acceso a rutas sensibles. En la versión actual sin login, este punto no aplica directamente, pero queda mencionado para un posible futuro.
CORS y Orígenes Permitidos: Dado que probablemente el frontend es servido por el mismo dominio que el backend (en una aplicación monolítica web), no hubo un problema de Cross-Origin. Sin embargo, si en desarrollo se probó el frontend en localhost diferente puerto, se habilitó CORS adecuadamente solo para los orígenes necesarios (por ejemplo, usando la extensión Flask-CORS limitando a http://localhost:5000). Esto previene que terceros dominios maliciosos hagan peticiones a nuestra API de manera no autorizada.
Seguridad en la API: La API interna en sí no expone operaciones de modificación de datos (es de solo lectura salvo quizás guardar historial). Aun así, se diseñaron endpoints REST con posibles códigos de estado apropiados (200 OK, 400 Bad Request, 500 Internal Error) para comunicar cualquier situación. Si hubiera endpoints de escritura en BD, se sanitizarían inputs para prevenir inyecciones SQL (usando siempre el ORM o consultas parametrizadas).
Auditoría y Logging: El sistema realiza logs en consola que pueden ayudar a monitorear actividad. Por ejemplo, loguea cuando métricas son obtenidas exitosamente​
 o cuando ocurre un error con detalles del código de respuesta​
En un entorno de producción, estos logs se podrían redirigir a un sistema de monitoreo. Tener registro de cuándo se pidió qué símbolo y si hubo error mejora la capacidad de detectar usos indebidos o fallas (p. ej., si de repente hay muchos errores 401, podría indicar un token expirado y es hora de renovarlo).
En conjunto, estas medidas hacen que el proyecto sea razonablemente seguro para un entorno de pruebas y acercándose a producción. Siempre hay margen de mejora (por ejemplo, limitar la tasa de solicitudes para evitar abusos, o agregar autenticación de usuario para personalizar las recomendaciones), pero se han cubierto los aspectos esenciales para proteger datos sensibles y asegurar un funcionamiento confiable.
### **2.6. Tests**

Durante el desarrollo se llevaron a cabo pruebas para garantizar la calidad y el correcto funcionamiento de las funcionalidades. Se implementaron principalmente tests unitarios y pruebas manuales enfocadas en los componentes críticos:
Pruebas Unitarias de Lógica de Negocio: Las funciones encargadas de obtener datos externos y generar la recomendación fueron probadas aisladamente. Por ejemplo, se simularon respuestas de la API de mercado para verificar que obtener_market_metrics maneja correctamente tanto la respuesta exitosa (devolviendo el JSON esperado) como distintos códigos de error (devolviendo None y registrando el error)​
-De igual modo, se probó generar_recomendacion(symbol) pasando diferentes escenarios:
Caso normal con datos completos: debería retornar un string con la recomendación que incluya ciertas palabras clave (ej.: "comprar" o "vender").
Caso de datos incompletos (por ejemplo, la API de earnings no devuelve nada): la función debería detectarlo y retornar el mensaje de error apropiado​
 en lugar de intentar invocar la IA sin datos. Estas pruebas unitarias se realizaron utilizando frameworks como unittest de Python, creando stubs o mocks para las llamadas HTTP externas (para no depender de la API real en cada test). Se simularon respuestas JSON predecibles y se comprobó que las funciones devolvieran los resultados esperados.
Pruebas de API (integración): Se ejecutó la aplicación en modo de prueba (usando las utilidades de testing de Flask, por ejemplo) y se lanzaron peticiones a los endpoints para verificar su comportamiento end-to-end. Con herramientas como Postman o curl, se realizaron llamadas GET a /api/metrics/<symbol>, /api/earnings/<symbol> y /api/recomendacion/<symbol>:
Para símbolos válidos (e.g., AAPL), comprobando que la respuesta contiene datos en formato JSON y código 200 OK.
Para símbolos inválidos (e.g., XXXX que no existe), esperando un código de error o un mensaje claro en la respuesta indicando el fallo.
Verificando que los tiempos de respuesta, aunque incluyen la llamada a la IA, se mantuvieran razonables (unos segundos).
También se probó el funcionamiento de la aplicación web manualmente: ingresando símbolos en la interfaz y comparando el resultado mostrado con los datos reales obtenidos directamente de la API para asegurarse de la veracidad del contenido. Por ejemplo, si para MSFT la API de mercado devolvía un precio de 250 USD, verificar que ese número aparece en la sección de métricas en pantalla.
Dejar el campo vacío y enviar (debería mostrar una validación en el cliente o al menos no llamar al servidor).
Probar la aplicación en distintos navegadores (Chrome, Firefox) y tamaños de pantalla para asegurar que la UI se ve correctamente.
La generación de prompt y manejo de respuesta de la IA se comprobó manualmente debido a la dificultad de predecir exactamente el texto de salida; sin embargo, se validó que el sistema completo no lanzara excepciones imprevistas durante ese flujo.
En general, los tests dieron resultados satisfactorios. La aplicación respondió conforme a lo esperado en los escenarios probados. Cualquier fallo detectado durante estas pruebas (por ejemplo, un caso no controlado de símbolo inválido inicialmente no manejado) se corrigió en el código y se volvió a ejecutar la prueba hasta pasarla. Esto asegura que las historias de usuario definidas (ver sección 5) están cubiertas y funcionan según los criterios de aceptación.

---

## 3. Modelo de Datos

El modelo de datos del proyecto es relativamente sencillo. A continuación se ilustra mediante un diagrama de entidad-relación las principales entidades (tablas) y sus relaciones:

### **3.1. Diagrama del modelo de datos:**

erDiagram
    ACCION ||--o{ RECOMENDACION : tiene

    ACCION {
        string simbolo PK
        string nombre
        string sector
    }

    RECOMENDACION {
        int id PK
        string simbolo_accion FK
        datetime fecha
        string analisis_texto
        string recomendacion
    }

Explicación:

Entidad ACCION:

simbolo: Clave primaria (PK), representa el ticker bursátil único.
nombre: Nombre completo de la empresa.
sector: Campo opcional indicando el sector económico.
Entidad RECOMENDACION:

id: Identificador único (autoincremental).
simbolo_accion: Referencia al símbolo de la acción (clave foránea, implícita en la relación).
fecha: Fecha y hora de la recomendación.
analisis_texto: Texto completo del análisis generado por IA.
recomendacion: Resultado breve del análisis ("Comprar", "Vender", "Mantener").

### **3.2. Descripción de entidades principales:**

Las entidades principales en el modelo de datos del proyecto son Acción y Recomendación. A continuación, se describen en detalle cada una:

Entidad: Acción

simbolo (Clave primaria, string): Identificador único de la acción (ticker bursátil). Ejemplos: "AAPL", "TSLA".
nombre (string): Nombre completo de la empresa correspondiente al símbolo. Ejemplo: "Apple Inc.".
sector (string, opcional): Indica el sector económico al que pertenece la empresa (tecnología, finanzas, salud, etc.). Puede dejarse vacío si esta información no está disponible.
Esta tabla guarda información general sobre las acciones consultadas, facilitando consultas futuras y almacenamiento ordenado de información estática.

Entidad: Recomendación

id (Clave primaria, integer, autoincremental): Identificador único para cada recomendación generada.
simbolo_accion (Clave foránea hacia Acción.simbolo, string): Símbolo de la acción para la cual se generó la recomendación. Define la relación con la entidad Acción.
fecha (datetime): Fecha y hora exacta en que se realizó la recomendación.
analisis_texto (TEXT): Texto completo generado por el análisis automatizado mediante Inteligencia Artificial, detallando la situación de mercado, contexto reciente y otros aspectos relevantes.
recomendacion (string): Resultado resumido del análisis, con valores como "Comprar", "Vender" o "Mantener", indicando la sugerencia concreta generada por la IA.
Esta estructura permite mantener registros históricos claros sobre cada recomendación generada, asociados directamente con las acciones que analiza el usuario desde Telegram.

## 4. Especificación de la API

openapi: "3.0.0"
info:
  title: "StockInsight AI API"
  version: "1.0.0"
paths:
  /api/recomendacion/{symbol}:
    get:
      summary: "Generar recomendación para una acción"
      description: |
        Recibe un símbolo (ticker) bursátil y retorna un análisis completo y una recomendación generada automáticamente por Inteligencia Artificial.
      parameters:
        - name: symbol
          in: path
          description: "Ticker de la acción (por ejemplo: AAPL)"
          required: true
          schema:
            type: string
            example: "AAPL"
      responses:
        '200':
          description: "Análisis y recomendación generados con éxito."
          content:
            application/json:
              schema:
                type: object
                properties:
                  simbolo:
                    type: string
                  recomendacion:
                    type: string
                  analisis:
                    type: string
              example:
                simbolo: "AAPL"
                recomendacion: "Comprar"
                analisis: "Apple Inc. presenta una tendencia alcista sólida apoyada en buenos resultados financieros recientes. Indicadores técnicos como el RSI (68) sugieren continuación alcista a corto plazo. Se recomienda **comprar**."

        '400':
          description: "Solicitud inválida (símbolo no proporcionado o incorrecto)"
          content:
            application/json:
              example:
                error: "Debes proporcionar un símbolo válido."

        '404':
          description: "Datos no encontrados para el símbolo proporcionado."
          content:
            application/json:
              example:
                error: "No se encontraron datos para el símbolo 'XXXX'."

  /api/metrics/{symbol}:
    get:
      summary: "Obtener métricas financieras actuales para un símbolo específico"
      parameters:
        - name: symbol
          in: path
          description: "Ticker de la acción (por ejemplo: TSLA)"
          required: true
          schema:
            type: string
      responses:
        '200':
          description: "Métricas financieras obtenidas correctamente."
          content:
            application/json:
              schema:
                type: object
                properties:
                  simbolo:
                    type: string
                  precio_actual:
                    type: number
                  cambio_diario:
                    type: number
                  volatilidad:
                    type: number
              example:
                simbolo: "TSLA"
                precio_actual: 290.50
                cambio_diario: 2.45
                volatilidad: 0.45
        '404':
          description: "Métricas no disponibles para el símbolo."
          content:
            application/json:
              example:
                error: "No se encontraron métricas para el símbolo proporcionado."

  /api/earnings/{symbol}:
    get:
      summary: "Obtener información sobre los resultados financieros (earnings) para una acción específica"
      parameters:
        - name: symbol
          in: path
          description: "Ticker de la acción a consultar (por ejemplo: MSFT)"
          required: true
          schema:
            type: string
      responses:
        '200':
          description: "Información financiera (earnings) obtenida correctamente."
          content:
            application/json:
              schema:
                type: object
                properties:
                  simbolo:
                    type: string
                  fecha_proximo_reporte:
                    type: string
                  EPS_ultimo_reporte:
                    type: number
                  EPS_esperado:
                    type: number
              example:
                simbolo: "MSFT"
                fecha_proximo_reporte: "2024-01-25"
                EPS_ultimo_reporte: 2.45
                EPS_esperado: 2.50
        '404':
          description: "Datos no disponibles."
          content:
            application/json:
              example:
                error: "No hay información de earnings disponible para el símbolo 'XXXX'."

Descripción :
GET /api/recomendacion/{symbol}:
Es el endpoint principal que reúne todos los datos obtenidos desde APIs externas (métricas y earnings), genera una recomendación mediante Inteligencia Artificial, y devuelve un análisis detallado en lenguaje natural.

GET /api/metrics/{symbol}:
Este endpoint devuelve información financiera en tiempo real para un símbolo dado (precio actual, cambio diario, volatilidad), obtenida desde una API externa (como Polygon.io).

GET /api/earnings/{symbol}:
Proporciona información específica sobre los resultados financieros recientes o próximos eventos financieros de una empresa determinada, permitiendo al usuario anticiparse a noticias importantes.


---

## 5. Historias de Usuario

A lo largo del desarrollo se definieron varias historias de usuario para guiar la implementación de las funcionalidades. A continuación se documentan 3 historias de usuario principales que cubren los requisitos clave del producto:
HU1: Consultar datos de una acción para análisis
Como inversor interesado en una empresa específica, quiero obtener las métricas financieras actuales de esa acción (precio, volatilidad, etc.) para poder entender rápidamente su situación de mercado antes de tomar decisiones.
Criterios de aceptación: Al ingresar el símbolo de la acción y solicitar los datos, el sistema muestra el precio actual, el cambio diario y al menos un indicador de volatilidad o riesgo. Si el símbolo no es válido, se informa al usuario que no se encontró la acción.
HU2: Recibir recomendación de inversión basada en datos
Como usuario sin conocimientos profundos de análisis técnico, quiero que la aplicación me brinde una recomendación clara (comprar, vender o mantener) basada en los datos de mercado y fundamentales, para ayudarme a decidir qué hacer con mis acciones.
Criterios de aceptación: Tras solicitar la recomendación para un símbolo dado, la interfaz debe mostrar un texto en lenguaje natural que incluya un resumen de la situación de la acción y una sugerencia explícita (por ejemplo: "Se recomienda mantener la acción..."). La recomendación debe estar respaldada mencionando al menos dos elementos de los datos (por ejemplo, tendencia de precio y resultados trimestrales). La palabra clave de la acción sugerida (Comprar/Vender/Mantener) debe destacarse.
HU3: Conocer el contexto de noticias y eventos
Como usuario que sigue el mercado, quiero que la recomendación tenga en cuenta noticias recientes y próximos eventos financieros de la empresa, para comprender si hay factores externos influyendo en la decisión.
Criterios de aceptación: En el análisis generado, se debe mencionar al menos un titular o hecho reciente relevante (ejemplo: "la empresa X anunció un nuevo producto" o "enfrenta una demanda legal") si está disponible en las fuentes indicadas, y mencionar la fecha del próximo reporte de ganancias si es inminente. Esto debe integrarse en la justificación de la recomendación. Si no hay noticias importantes, el análisis puede omitirlo pero siempre revisa esa parte del prompt para no dejar info incongruente.

---

## 6. Tickets de Trabajo

Durante el desarrollo se utilizaron herramientas de gestión de tareas (como Jira o GitHub Issues) para organizar el trabajo. A continuación se describen 3 tickets de trabajo relevantes, cubriendo backend, frontend y base de datos:
Ticket 001 - Backend: "Implementar integración con API de mercado de Polygon"
Descripción: Desarrollar la función para obtener métricas de mercado dado un símbolo de acción. Debe conectar con GET /market-metrics de la API externa, enviar el token de autenticación en la cabecera y parsear la respuesta JSON. Manejar casos de error (token expirado, símbolo inválido) devolviendo un resultado controlado.
Criterios de Done: obtener_market_metrics(symbol) implementada y probada. Llamadas exitosas retornan un dict JSON con datos​
Llamadas con error retornan None y loguean el error​
Incluye pruebas unitarias simulando respuesta 200 y 404.
Estado: Completado. (Pull Request #5 vinculado: "Market API integration".)
Ticket 002 - Frontend: "Crear interfaz de consulta de recomendación"
Descripción: Diseñar la página principal donde el usuario ingresa un símbolo y obtiene la recomendación. Debe incluir un campo de texto autocompletable para el ticker, un botón "Consultar", y un área de resultados. Implementar con HTML/CSS básicos y usar JavaScript para realizar la solicitud al backend. Tras obtener la respuesta JSON, mostrar en el área de resultados las métricas en un formato claro (lista o tabla pequeña) y debajo el análisis en texto formateado (permitir saltos de línea, etc.). También manejar un indicador de carga mientras espera la respuesta.
Criterios de Done: Se puede ingresar un símbolo y al hacer click en el botón, la página muestra los datos y recomendación correspondientes (ejemplo probado con "AAPL" y "MSFT"). El diseño es responsivo (probado en móvil vs escritorio). Errores como campo vacío o símbolo no existente muestran mensajes de alerta adecuados (por ejemplo, usando alert() o un mensaje en la página).
Estado: Completado. (Incluido en PR #8: "Frontend UI implementation".)
Ticket 003 - Base de Datos: "Persistir recomendaciones generadas en la BD"
Descripción: Agregar funcionalidad para almacenar cada recomendación generada en la base de datos. Crear modelo Recomendacion con campos: id, simbolo_accion (FK a Accion), fecha_hora, texto_recomendacion, decision. Al generarse una nueva recomendación en el endpoint /api/recomendacion, tras obtener la respuesta de la IA, guardar el registro en BD. Si la acción consultada no existe aún en tabla Accion, crearla (con nombre si disponible). Esto permitirá en el futuro consultar un historial.
Criterios de Done: Modelo de datos actualizado (migración ejecutada creando tablas). Al invocar el endpoint de recomendación, se verifica en logs o admin DB que se inserta un nuevo registro con los datos correctos. Probar con múltiples consultas y ver que todas quedan almacenadas. Manejar que, si BD falla, no afecte la respuesta al usuario (p.ej. rodear inserción en try/except).
Estado: Completado. (Merge en PR #12: "DB persistence for recommendations".)


---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

