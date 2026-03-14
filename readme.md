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

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

### **2.7. Observability**

El proyecto implementa una estrategia completa de observabilidad utilizando **OpenTelemetry** y **Micrometer**, proporcionando visibilidad total sobre el rendimiento, comportamiento y salud de la aplicación.

#### Métricas

La aplicación expone métricas personalizadas en formato Prometheus disponibles en `/actuator/prometheus`:

**Métricas de Negocio:**
- `meditation.composition.created` (Counter) - Composiciones creadas, etiquetadas por `output_type`
- `meditation.ai.text.generation.duration` (Timer) - Duración de generación de texto AI, etiquetadas por `ai_provider` y `status`
- `meditation.ai.image.generation.duration` (Timer) - Duración de generación de imágenes AI, etiquetadas por `ai_provider` y `status`
- `meditation.ai.generation.failures` (Counter) - Fallos en generación AI, etiquetadas por `ai_provider`, `operation` y `error_code`

**Métricas HTTP:**
- `http.client.requests` - Métricas automáticas de llamadas HTTP salientes (auto-instrumentadas via ObservationRegistry)

#### Trazas Distribuidas

Las trazas se envían a un recolector OTLP (OpenTelemetry Protocol) configurado por defecto en `http://localhost:4318/v1/traces`.

**Configuración de Sampling:**
- **Local/Desarrollo**: 100% de trazas (AlwaysOnSampler)
- **Producción**: Configurable via variable `OTEL_SAMPLING_PROBABILITY` (default: 1.0)

**Custom Spans:**
Todos los métodos críticos de negocio están instrumentados con `@Observed`:
- `composition.create` - Creación de composiciones
- `composition.update-text` - Actualización de texto
- `composition.select-music` - Selección de música
- `composition.set-image` - Configuración de imagen
- `ai.text.generate` - Generación de texto AI
- `ai.image.generate` - Generación de imagen AI

#### Logging Estructurado

**Eventos de Negocio:**
- `composition.created` - Incluye `compositionId` y `outputType`
- `composition.text.updated` - Incluye `compositionId` y `textLength`
- `composition.music.selected` - Incluye `compositionId` y `musicId`
- `composition.image.set` - Incluye `compositionId` y `outputType`
- `ai.text.generation.requested/completed/failed` - Incluye `promptLength`, `latencyMs`, `errorCode`
- `ai.image.generation.requested/completed/failed` - Incluye `promptLength`, `latencyMs`

**Eventos de Infraestructura:**
- `external.service.call.start/end` - Llamadas HTTP a servicios externos
  - Tags: `service`, `operation`, `httpStatus`, `latencyMs`
  - Servicios monitorizados: MediaCatalog, OpenAI-Text, OpenAI-Image

**Correlation ID:**
Todos los logs relacionados con la misma operación comparten el mismo `compositionId` en MDC (Mapped Diagnostic Context), facilitando el rastreo de transacciones completas.

#### Configuración

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: prometheus
  tracing:
    sampling:
      probability: ${OTEL_SAMPLING_PROBABILITY:1.0}
  otlp:
    tracing:
      endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:http://localhost:4318/v1/traces}
    metrics:
      endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:http://localhost:4318/v1/metrics}
```

#### Stack de Monitoreo Recomendado

**desarrollo Local:**
```bash
# Docker Compose con Grafana + Tempo + Prometheus
docker-compose -f observability/docker-compose.yml up
```

**Producción:**
- **Métricas**: Azure Monitor / Prometheus + Grafana Cloud
- **Trazas**: Azure Application Insights / Jaeger / Tempo
- **Logs**: Azure Log Analytics / ELK Stack / Loki

#### Testing

Los tests de integración de observabilidad verifican:
- Registro correcto de métricas personalizadas
- Presencia de tags/etiquetas en métricas
- Disponibilidad del endpoint de Prometheus
- Funcionalidad del MeterRegistry

Ejecutar tests de observabilidad:
```bash
mvn test -Dtest=ObservabilityIntegrationTest
```

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

