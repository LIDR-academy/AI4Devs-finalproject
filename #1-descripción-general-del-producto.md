# 1. Descripción general del producto

## **1.1. Objetivo:**

El propósito de **LogSentinel** es transformar la gestión de incidentes en entornos de infraestructura reduciendo el Tiempo Medio de Resolución (MTTR) de horas a segundos. Aporta valor al eliminar la sobrecarga cognitiva que sufren los ingenieros al interpretar texto caótico bajo situaciones de alta presión. Su meta es interceptar e interpretar semánticamente logs o *stacktraces* complejos y desestructurados, emparejándolos de manera inteligente con su manual de solución (*Runbook*) óptimo y permitiendo una mitigación inmediata. Está diseñado específicamente para **ingenieros SRE, especialistas en DevOps y desarrolladores de guardia (On-Call)** que necesitan resolver caídas de servicio de forma guiada y eficiente.

## **1.2. Características y funcionalidades principales:**

* **Simulador de Escenarios de Error:** Un selector integrado que permite cargar flujos de logs sintéticos precargados (errores de bases de datos, caídas de red, desbordamientos de memoria) para facilitar pruebas y demostraciones inmediatas.
* **Intérprete Semántico de Logs:** Módulo inteligente que analiza texto plano amorfo o trazas de error corruptas y, sin utilizar complejas expresiones regulares tradicionales, extrae una estructura limpia con variables clave (nivel de log, servicio afectado, firma del error y resumen ejecutable).
* **Motor de Búsqueda Contextual (RAG):** Sistema de recuperación que convierte el contexto del error en un vector matemático para consultar una base de conocimientos. Identifica y extrae el manual de mitigación (*Runbook*) más idóneo, calculando un porcentaje preciso de similitud conceptual.
* **Gestor de Base de Conocimientos:** Interfaz administrativa para insertar, actualizar y etiquetar nuevos manuales de solución, los cuales se indexan automáticamente de forma matemática para quedar disponibles ante futuros incidentes.
* **Consola de Razonamiento Agéntico:** Pantalla interactiva que muestra de forma secuencial y en tiempo real el flujo de pensamiento lógico que sigue el agente de IA antes de emitir su diagnóstico final.
* **Mitigación Asistida (Auto-Healing Simulado):** Un botón de acción rápida que ejecuta de manera segura un script mockeado en el servidor para resolver el problema técnico subyacente y actualiza el estado del incidente a "Resuelto" en el historial del sistema.

## **1.3. Diseño y experiencia de usuario:**

El espacio de trabajo cuenta con una interfaz limpia y profesional optimizada para operaciones técnicas en **modo oscuro** (estilo consola SRE), organizada visualmente de la siguiente manera:

1. **Aterrizaje e Ingesta (Columna Izquierda):** El usuario ingresa a la aplicación y encuentra un área de texto junto con un menú desplegable de escenarios. Al seleccionar un escenario (ej. *Saturación de conexiones en Base de Datos*), el cuadro se puebla automáticamente con un log desestructurado y complejo. El usuario hace clic en el botón "Analizar Incidente".
2. **Línea de Tiempo del Agente (Columna Central):** Al iniciar el análisis, esta sección cobra vida mediante animaciones de texto simulando una terminal activa. El usuario observa el paso a paso del agente: *“Normalizando estructura del log...”*, *“Aislando firma del error...”*, *“Consultando base de conocimientos vectorizada...”*.
3. **Resolución y Acción (Columna Derecha / Panel de Resultados):** Una vez concluido el pensamiento del agente, se despliega una tarjeta detallada que muestra el diagnóstico en lenguaje humano, el *Runbook* de solución recuperado de la base de datos con su score de coincidencia y un botón destacado: **"Ejecutar Plan de Remediación"**. Al presionarlo, un indicador de carga confirma la ejecución exitosa de la solución y cambia visualmente el estado del incidente a resuelto.

> *(Nota para tu entrega: En esta sección de tu documento final deberás incrustar las capturas de pantalla de tu frontend en React o el enlace al video de la demo E2E ejecutando este flujo).*

## **1.4. Instrucciones de instalación:**

Para poner en marcha el proyecto completo de manera local de extremo a extremo (E2E), sigue estos pasos:

**Prerrequisitos:**

* Tener instalado **Docker** y **Docker Compose** en tu sistema.
* Contar con una API Key válida del proveedor de modelo de lenguaje utilizado (configurada en el archivo de entorno).

**Paso 1: Configuración del entorno**
En la raíz del proyecto, duplica el archivo de plantilla de configuración y renómbralo a `.env`:

```bash
cp .env.example .env

```

Abre el archivo `.env` y define tu clave de acceso de IA:

```env
AI_PROVIDER_API_KEY=tu_api_key_aqui

```

**Paso 2: Construcción y despliegue automatizado**
LogSentinel está completamente contenerizado. Para compilar el backend, instalar las dependencias del frontend, levantar la base de datos relacional-vectorial y aplicar el entorno, ejecuta el siguiente comando en tu terminal:

```bash
docker-compose up --build -d

```

**Paso 3: Migraciones y Semillas de Datos**
Al iniciar los contenedores por primera vez, el sistema ejecutará de forma automática los siguientes procesos de preparación:

1. Activación de las extensiones vectoriales en la base de datos relacional.
2. Creación de los esquemas y tablas necesarios tanto para el historial de incidentes como para los manuales operativos.
3. Ejecución de un script de semillas (*seed data*) que poblará de forma asíncrona la base de conocimientos con los vectores de los *Runbooks* iniciales de prueba.

**Paso 4: Acceso a la aplicación**
Una vez que todos los servicios reporten un estado saludable (*healthy*), puedes abrir tu navegador e ingresar a las URLs locales:

* **Interfaz de Usuario (Frontend):** `http://localhost:3000`
* **Consola de Servicios (Backend API Docs):** `http://localhost:8080/swagger-ui.html`