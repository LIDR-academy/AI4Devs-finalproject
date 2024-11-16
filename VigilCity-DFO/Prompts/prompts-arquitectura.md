# Mapa de Seguridad Urbana - Diego Fernando Orozco (DFO)
> Modelo - ChatGPT

## Índice

1. [Descripción general del producto](prompts-descripcion.md#1-descripción-general-del-producto)
2. [Arquitectura del sistema](prompts-arquitectura.md#2-arquitectura-del-sistema)
3. [Modelo de datos](prompts-modelo-datos.md#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

> Modelo - ChatGPT

Define la arquitectura e infraestructura para el producto "Mapa de Seguridad Urbana". La solución debe incluir:

Frontend: Interfaz de usuario donde se carguen las imágenes y se formulen preguntas.
Backend: Procesamiento de imágenes y manejo de la lógica de negocio.
Servicios de IA: Herramientas o frameworks para el análisis de imágenes y la generación de respuestas.
Almacenamiento: Ubicación para almacenar las imágenes y resultados del análisis.
Escalabilidad: Capacidad de manejar múltiples solicitudes simultáneas.
Seguridad: Protección de los datos cargados y respuestas generadas.
Despliegue: Infraestructura necesaria (on-premise o en la nube) para el despliegue de la solución.

1. Proporciona un diagrama de la arquitectura y explique la elección de cada componente y servicio
2. Proporciona el prompt para incluirlo en "diagramgpt" y generar el diagrama correspondiente. 

**Prompt 2:**
> Modelo - DaG diagramgpt

Create an architecture diagram for a product named 'Mapa de Seguridad Urbana' with the following components:

Frontend: A user interface built with React/Angular for reporting safety issues in a map-based view, using Mapbox or Google Maps for interactive maps.
Backend: Managed by Node.js or Django for handling report management, authentication, and communication with storage and AI services.
AI Services: AWS Rekognition or Google Vision for image analysis, and GPT-4 API for response generation based on user input.
Storage: Amazon S3 for storing images and reports, and MongoDB or PostgreSQL for handling user and report data.
Scalability: Using Kubernetes with Auto Scaling for container orchestration to handle high traffic.
Security: HTTPS/TLS for data encryption, AWS IAM for resource protection, and OAuth/JWT for user authentication.
Deployment: Hosted on AWS or GCP, using EC2 for backend, Lambda for serverless functions, and CloudFront for global distribution.

### **2.2. Descripción de componentes principales:**

> Modelo - ChatGPT

**Prompt 1:**

Describe cada uno de los componentes que hacen parte de la arquitectura del producto "Mapa de Seguridad Urbana"

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Modelo - ChatGPT

**Prompt 1:**

Quiero diseñar la arquitectura para el proyecto "Mapa de Seguridad Urbana" con los siguientes componentes tecnológicos: Angular en el frontend, Node.js en el backend y PostgreSQL como base de datos. Estoy interesado en una arquitectura de microservicios y en aplicar patrones arquitectónicos adecuados para este stack. Necesito recomendaciones sobre los patrones específicos de arquitectura que mejor se adapten a este ecosistema y que consideren aspectos como escalabilidad, resiliencia, y seguridad en un ambiente de producción. Además, me gustaría conocer recomendaciones sobre la organización del código y la comunicación entre servicios, incluyendo protocolos adecuados. Finalmente, necesito sugerencias de herramientas o tecnologías complementarias que puedan facilitar la implementación y el mantenimiento de esta arquitectura.

**Prompt 2:**

¿Cuál es debería implementar RabbitMQ o Kafka?

**Prompt 3:**

Me iré por RabbitMQ, ahora ¿cuál debería elegir sobre Jaeger o Zipkin?

**Prompt 4:**

> Modelo - DaG diagramgpt

```
Frontend
  [Angular] - "Interfaz de usuario y mapas interactivos"

API Gateway
  [NGINX] - "Punto de entrada, autenticación, y distribución de solicitudes"

Microservicios
  [Microservicio de Reportes (Node.js)] - "Gestión de reportes de seguridad"
  [Microservicio de Usuarios (Node.js)] - "Gestión de usuarios y autenticación"
  [Microservicio de Comentarios (Node.js)] - "Gestión de comentarios en zonas"
  [Microservicio de Notificaciones (Node.js)] - "Envía alertas sobre zonas inseguras"

Base de Datos
  [PostgreSQL] - "Base de datos para almacenamiento de reportes, usuarios y comentarios"

Mensajería
  [RabbitMQ] - "Manejo de comunicación asíncrona y eventos entre servicios"

Cache
  [Redis] - "Cache de datos frecuentes y sesiones de usuario"

Monitoreo y Logs
  [Prometheus + Grafana] - "Monitoreo de métricas"
  [ELK Stack] - "Análisis y búsqueda de logs"
  [Jaeger] - "Trazabilidad de solicitudes"

Seguridad
  [JWT] - "Autenticación y autorización"
  [Certbot] - "Certificados SSL para HTTPS"
```


Teniendo en cuenta el patrón de microservicios que me has presentado, 
1. ¿Qué patrón de arquitectura debería usar para la implementación del código?
2. ¿Cuál sería la estructura de carpetas que debería tener el proyecto en el back?

Te recuerdo que los microservicios que me has propuesto son:
  [Microservicio de Reportes (Node.js)] - "Gestión de reportes de seguridad"
  [Microservicio de Usuarios (Node.js)] - "Gestión de usuarios y autenticación"
  [Microservicio de Comentarios (Node.js)] - "Gestión de comentarios en zonas"
  [Microservicio de Notificaciones (Node.js)] - "Envía alertas sobre zonas inseguras"

**Prompt 5:**

> Modelo - ChatGPT

Teniendo en cuenta el patrón de microservicios que me has presentado, 
1. ¿Qué patrón de arquitectura debería usar para la implementación del código?
2. ¿Cuál sería la estructura de carpetas que debería tener el proyecto en el back?

Te recuerdo que los microservicios que me has propuesto son:
  [Microservicio de Reportes (Node.js)] - "Gestión de reportes de seguridad"
  [Microservicio de Usuarios (Node.js)] - "Gestión de usuarios y autenticación"
  [Microservicio de Comentarios (Node.js)] - "Gestión de comentarios en zonas"
  [Microservicio de Notificaciones (Node.js)] - "Envía alertas sobre zonas inseguras"

**Prompt 6:**

Genera la estructura de archivos completa para todos los microservicios.

**Prompt 7:**

Genera un archivo .bat para correrlo en windows 11 con comandos de DOS, para crear toda la estructura de archivos del back del proyecto para todos los microservicios en modalidad de "monorepo". Ten en cuenta que se deben crear las carpetas y los archivos donde correspondan.

**Prompt 8:**

Dame el modelo de arquitectura en mermaid para MVP, teniendo en cuenta que solo se ha de contar con el back, front y postgres, no vamos a usar caché, balanceadores ni componentes adicionales, necesitamos una arquitectura liviana que nos permita hacer un despliegue rápido, un ejemplo como si fuesemos a desplegar en Heroku.

**Prompt 9:**

¿Cuál sería la infraestructura de despliegue para el MVP si lo voy a desplegar en back4app y la base de datos la tendré de manera externa en ElefanteSQL?

**Prompt 10:**

Teniendo en cuenta que el código fuente lo tendré en github, el back y el front será desplegado en back4app y la base de datos estará en elephantsql, ¿Cuál sería el proceso de despliegue?
Genera una respuesta detallada

**Prompt 11:**

> Usando el asistente Cursor

Vamos a trabajar con node y express, teniendo en cuenta el las variables dentro del environment en @docker-compose.yml ¿Cómo se puede dejar en un archivo .env y que sean mapeadas al archivo docker-compose?

Para mover las variables de entorno a un archivo .env y hacer que sean mapeadas en tu archivo docker-compose.yml, puedes seguir estos pasos:
1. Crea un archivo .env en el mismo directorio que tu docker-compose.yml y agrega las variables de entorno allí. Por ejemplo:
Modifica tu archivo docker-compose.yml para que use las variables del archivo .env. Aquí está el código actualizado:
Explicación de los cambios:
Se creó un archivo .env que contiene las variables de entorno.
En el archivo docker-compose.yml, se reemplazaron las variables de entorno por referencias a las variables definidas en el archivo .env usando la sintaxis ${VARIABLE_NAME}.
Esto permite que Docker Compose cargue automáticamente las variables desde el archivo .env al iniciar los servicios.
# Contexto del proyecto: @readme.md 
La estructura de archivos estaba pensada para hacerlo por microservicios, pero lo vamos a cambiar y a usar api rest en una única estructura de archivos que contenga las funcionalidades para el MVP que se compone de las entidades Usuario, Reporte, Cometario y Rating.

Usando el patrón de arquitectura DDD, define:

1. La estructura de carpetas y archivos del backend
2. Genera en un script .bat para DOS que permita crear la estructura de archivos
3. Explica la estructura de las carpetas