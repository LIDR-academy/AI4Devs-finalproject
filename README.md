## Índice

0. [Ficha del proyecto](0-ficha-del-proyecto.md)
1. [Descripción general del producto](1-descripcion-general-del-producto.md)
2. [Arquitectura del sistema](2-arquitectura-del-sistema.md)
3. [Modelo de datos](3-modelo-de-datos.md)
4. [Especificación de la API](4-especificaciones-de-la-api.md)
5. [Historias de usuario](5-historias-de-usuario.md)
6. [Tickets de trabajo](6-tickets-de-trabajo.md)
7. [Pull requests](7-pull-requests.md)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

David Navarro Arias

### **0.2. Nombre del proyecto:**

Cactify

### **0.3. Descripción breve del proyecto:**

Plataforma web para la gestión de colecciones de cactus y pequeños viveros. Permite registrar plantas asociadas a una especie, introducir manualmente condiciones ambientales (humedad, temperatura, horas de luz, acidez del sustrato) y riego, y recibir recomendaciones de cuidado generadas por IA a partir de los rangos recomendados de cada especie y el historial de la planta. Nace del problema real de gestionar una colección de ~500 cactus, donde el conocimiento y el seguimiento manual (memoria, hojas de cálculo) dejan de ser viables a partir de cierto tamaño.

### **0.4. URL del proyecto:**

> Pendiente.

### 0.5. URL o archivo comprimido del repositorio

> Pendiente.

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Ayudar a coleccionistas y pequeños viveros a registrar sus plantas, introducir condiciones de cultivo (de momento de forma manual) y recibir recomendaciones de cuidado personalizadas basadas en la especie y en los datos registrados, para no depender de la memoria o la intuición del propietario a medida que la colección crece.

**Problema:** los coleccionistas y pequeños viveros gestionan cientos de plantas de forma manual, lo que dificulta saber qué plantas necesitan riego, detectar condiciones de estrés, mantener un historial de cuidados y tomar decisiones basadas en datos.

**Usuario principal:** propietario de una colección de cactus o de un pequeño vivero (uso individual en el MVP, con el modelo pensado para poder extenderse a varios usuarios/organizaciones en el futuro).

**Solución:** una plataforma web que registra plantas, permite introducir manualmente lecturas ambientales y de riego, y utiliza IA para generar recomendaciones de cuidado y alertas de riesgo, apoyándose en una base de conocimiento por especie (rangos de humedad, temperatura, luz y riego).

### **1.2. Características y funcionalidades principales:**

Flujo principal (E2E) del MVP:

```text
Registrar especie y sus rangos de cuidado recomendados
        ↓
Registrar un cactus seleccionando su especie y ubicación
        ↓
Introducir manualmente lecturas (humedad, temperatura, horas de luz, acidez del sustrato, riego)
        ↓
El sistema compara las lecturas con los rangos recomendados de la especie
        ↓
La IA genera una recomendación personalizada (nivel de riesgo, explicación, acción, prioridad)
        ↓
La recomendación queda guardada en el historial de la planta
```

Funcionalidades principales:

* **Catálogo de especies**: cada especie tiene una ficha con sus rangos de cuidado recomendados (humedad, temperatura, horas de luz, frecuencia orientativa de riego) y una mezcla de tierra (soil mix) recomendada. Esta base de conocimiento es determinista, no generada por IA.
* **Catálogo de mezclas de tierra (soil mix)**: mezclas reutilizables definidas por su proporción de componente orgánico y mineral (deben sumar 100%), para poder asociarlas a una o varias especies.
* **Catálogo de localizaciones**: listado plano y reutilizable de ubicaciones (p. ej. "Invernadero 1", "Bandeja A3"), para asociarlas a las plantas sin depender de texto libre. No es jerárquico en el MVP (ver evolución futura en [F.1](docs/user-stories/F.1-organizar-cactus-por-ubicacion-jerarquica.md)).
* **Catálogo de tags**: etiquetas reutilizables (p. ej. "globular", "pequeño", "sin espinas", "híbrido") asignables a varias plantas, para poder filtrar y buscar la colección de forma sencilla.
* **Inventario de plantas**: alta de cactus asociados a una especie y a una localización, con herencia de los cuidados recomendados de su especie.
* **Personalización por ejemplar**: aunque dos plantas compartan especie, un ejemplar concreto puede necesitar más o menos agua, sol, etc. El sistema debe permitir ajustar los cuidados de una planta individual sin perder la herencia de los valores no modificados de la especie (si la ficha de la especie se actualiza después, la planta que no haya sobrescrito ese campo recibe el cambio).
* **Registro de lecturas/cuidados**: introducción manual de humedad, temperatura, horas de luz, acidez del sustrato y cantidad de riego, asociadas a una planta y con fecha/hora automática.
* **Recomendaciones con IA**: la IA recibe la especie, la última lectura, el último riego y las desviaciones respecto a los rangos recomendados, y genera un nivel de riesgo, una explicación breve, una acción recomendada y una prioridad de actuación. La IA no decide de forma autónoma ni se "inventa" los rangos de cuidado: estos provienen siempre de la ficha de la especie (o de sus overrides), y la IA solo interpreta esos datos.
* **Alertas de riesgo**: se generan cuando una lectura está fuera del rango recomendado, indicando la planta afectada y visibles en un dashboard.
* **Historial**: consulta de lecturas, riegos y recomendaciones de IA ordenadas por fecha, accesible desde la ficha de cada planta.

**Explícitamente fuera del alcance del MVP** (quedan documentadas como evolución futura del producto, no como parte de esta entrega):

* Automatización física de riego (bombas, válvulas).
* Integración en tiempo real con sensores/hardware IoT (p. ej. ESP32) — la carga de lecturas será manual en el MVP.
* App móvil con sincronización de sensores por Bluetooth (ver [F.5](docs/user-stories/F.5-app-movil-sincronizacion-sensores-bluetooth.md)) — máxima prioridad del roadmap tras el MVP.
* Alertas push en tiempo real.
* Detección de enfermedades o estimación de estrés hídrico por fotografía.
* Predicción de riego mediante series temporales / modelos entrenados con datos propios.
* Gestión comercial del vivero (stock, ventas, pedidos, facturación).
* Multiempresa y suscripciones tipo SaaS.

### **1.3. Diseño y experiencia de usuario:**

> Pendiente: capturas de pantalla y/o vídeo mostrando el flujo desde el alta de una especie hasta la recomendación de IA.

### **1.4. Instrucciones de instalación:**

> Pendiente de definir hasta que se concrete la implementación (backend, frontend, base de datos, migraciones y semillas de datos).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

> Pendiente de formalizar en Mermaid. Propuesta de alto nivel:

```text
[Frontend: Nuxt 3 / Vue 3 / Pinia]
            │  HTTP (API REST)
            ▼
[Backend: Kotlin + Spring Boot 3 (Spring Web, Spring Data JPA)]
            │                     │
            ▼                     ▼
   [PostgreSQL]        [Proveedor de IA (OpenAI API)]
```

Arquitectura en capas típica de Spring Boot (controller → service → repository), elegida por ser el stack con el que el autor tiene más experiencia previa (Kotlin/Spring en backend, Vue/Nuxt en frontend), lo que reduce el riesgo de la entrega dentro de las ~30 horas disponibles para el MVP.

### **2.2. Descripción de componentes principales:**

* **Frontend**: Nuxt 3 + Vue 3 + Pinia (gestión de estado). Tailwind como opción para estilos.
* **Backend**: Kotlin + Spring Boot 3, con Spring Web para la API REST y Spring Data JPA para la persistencia.
* **Base de datos**: PostgreSQL.
* **IA**: integración con la API de OpenAI mediante un servicio dedicado que construye un prompt estructurado (especie + lecturas + historial corto) y devuelve una recomendación.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Pendiente hasta iniciar la implementación.

### **2.4. Infraestructura y despliegue**

Propuesta:

* Backend: Railway / Render / Fly.io.
* Frontend: Vercel.
* Base de datos: PostgreSQL gestionado (según el proveedor elegido).

### **2.5. Seguridad**

> Pendiente de definir (autenticación, gestión de secretos de la API de IA, validación de entradas, etc.).

### **2.6. Tests**

> Pendiente. Se prevé al menos un test E2E del flujo principal: crear planta → registrar lectura → generar recomendación de IA.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Ver diagrama Mermaid en [docs/diagramas/modelo-datos.md](docs/diagramas/modelo-datos.md). Entidades previstas para el MVP:

```text
SoilMix (1) ────< (N) Species (1) ────< (N) Plant (1) ────< (N) CareRecord (1) ──── (1) AIRecommendation
                                    Location (1) ────< (N) ┘
                                       Plant (N) ──── (N) Tag   (a través de PlantTag)
```

### **3.2. Descripción de entidades principales:**

**SoilMix** (catálogo de mezclas de tierra reutilizables)

* `id`: UUID. Clave primaria.
* `name`: String. Nombre identificativo de la mezcla (p. ej. "Sustrato mineral de drenaje rápido").
* `organicPercentage`: Int. Porcentaje de componente orgánico (0-100).
* `mineralPercentage`: Int. Porcentaje de componente mineral (0-100). `organicPercentage + mineralPercentage` debe sumar 100.
* `phMin` / `phMax`: Decimal. Rango de pH (acidez) recomendado para esta mezcla (p. ej. 5.5-6.5). `phMin` no puede ser mayor que `phMax`.
* `description`: String. Notas u componentes orientativos (p. ej. "akadama, pómez, turba").

**Species** (ficha de especie — base de conocimiento determinista de cuidados recomendados)

* `id`: UUID. Clave primaria.
* `scientificName`: String. Nombre científico (género + epíteto).
* `commonName`: String. Nombre común.
* `minHumidity` / `maxHumidity`: Int. Rango de humedad recomendado (%).
* `minTemperature` / `maxTemperature`: Int. Rango de temperatura recomendado (°C).
* `minLightHours` / `maxLightHours`: Int. Horas de luz recomendadas al día.
* `wateringGuideline`: String. Frecuencia orientativa de riego (p. ej. "cada 10-20 días").
* `soilMixId`: UUID. Clave foránea → `SoilMix.id`. Mezcla de tierra recomendada para la especie.

**Location** (catálogo de localizaciones)

* `id`: UUID. Clave primaria.
* `name`: String. Nombre identificativo de la localización (p. ej. "Invernadero 1", "Bandeja A3"). Catálogo plano, sin jerarquía en el MVP.

**Plant** (ejemplar de la colección)

* `id`: UUID. Clave primaria.
* `nickname`: String. Nombre o código identificativo del ejemplar.
* `locationId`: UUID. Clave foránea → `Location.id`.
* `speciesId`: UUID. Clave foránea → `Species.id`.
* `createdAt`: Timestamp.
* *(Pendiente de decidir)*: campos de override individual (p. ej. `wateringOverride`, `lightOverride`, `temperatureOverride`) para permitir que un ejemplar concreto se aparte de los rangos de su especie sin perder la herencia de los campos no modificados, según lo hablado en la sección de personalización de cuidados.

**Tag** (catálogo de etiquetas de búsqueda)

* `id`: UUID. Clave primaria.
* `name`: String. Nombre de la etiqueta (p. ej. "globular", "pequeño", "sin espinas", "híbrido"). Único.

**PlantTag** (tabla intermedia de la relación N:M entre `Plant` y `Tag`)

* `plantId`: UUID. Clave foránea → `Plant.id`.
* `tagId`: UUID. Clave foránea → `Tag.id`.
* Clave primaria compuesta (`plantId`, `tagId`).

**CareRecord** (lectura/cuidado registrado manualmente)

* `id`: UUID. Clave primaria.
* `plantId`: UUID. Clave foránea → `Plant.id`.
* `humidity`: Int.
* `temperature`: Int.
* `lightHours`: Int.
* `waterAmountMl`: Int. Cantidad de riego.
* `soilPh`: Decimal. Acidez del sustrato medida en el momento de la lectura.
* `recordedAt`: Timestamp (automático).

**AIRecommendation** (salida de la IA asociada a una lectura)

* `id`: UUID. Clave primaria.
* `careRecordId`: UUID. Clave foránea → `CareRecord.id`.
* `riskLevel`: String/Enum. Nivel de riesgo (bajo, moderado, alto).
* `recommendationText`: String. Explicación y acción recomendada.
* `createdAt`: Timestamp.

---

## 4. Especificación de la API

> Endpoints principales del flujo E2E (formato OpenAPI pendiente de detallar):

1. `POST /plants` — crea una planta (nickname, ubicación, especie).
2. `POST /plants/{id}/care-records` — registra una lectura manual (humedad, temperatura, horas de luz, acidez del sustrato, riego) para una planta.
3. `GET /plants/{id}/care-records/{careRecordId}/recommendation` — obtiene/genera la recomendación de IA asociada a una lectura.
4. `POST /soil-mixes` — crea una mezcla de tierra (nombre, % orgánico, % mineral, descripción).
5. `GET /soil-mixes` — lista el catálogo de mezclas de tierra disponibles.
6. `POST /species` / `PUT /species/{id}` — crea o actualiza una especie, incluyendo la referencia a su `soilMixId`.
7. `POST /locations` / `GET /locations` — crea/lista el catálogo de localizaciones.
8. `POST /tags` / `GET /tags` — crea/lista el catálogo de tags.
9. `PUT /plants/{id}/tags` — asigna/reemplaza el conjunto de tags de una planta.
10. `GET /plants?tag={tagId}&location={locationId}` — filtra el inventario de plantas por tag y/o localización.

---

## 5. Historias de Usuario

> El listado completo de historias de usuario (incluidas las que no entran en el alcance del MVP) se documenta, una por archivo, en [docs/user-stories](docs/user-stories/README.md). Aquí se recogen las 3 más representativas del flujo E2E, según pide la plantilla.

**Historias Must-Have (5)** — cubren el flujo E2E completo: *Inventario → Seguimiento → Conocimiento → IA → Historial*.

**US-01 — Registrar un cactus**

**Como** propietario de un vivero **quiero** registrar un cactus seleccionando su especie y localización **para** mantener un inventario organizado.

Criterios de aceptación:
* Se puede seleccionar una especie desde un catálogo.
* Se puede indicar nombre y localización (seleccionada de un catálogo).
* La planta queda registrada en la base de datos.

**US-02 — Registrar condiciones de cultivo**

**Como** propietario de un vivero **quiero** introducir manualmente humedad, temperatura, horas de luz, acidez del sustrato y cantidad de riego **para** llevar un seguimiento del estado de cada planta.

Criterios de aceptación:
* Se pueden introducir los cinco valores.
* La lectura queda asociada a una planta.
* Se registra fecha y hora automáticamente.

**US-03 — Consultar recomendaciones por especie**

**Como** propietario de un vivero **quiero** ver los rangos recomendados para la especie seleccionada **para** saber cuáles son las condiciones ideales de cultivo.

Criterios de aceptación:
* La ficha muestra humedad, temperatura, luz y frecuencia de riego recomendadas.
* Los datos provienen del catálogo de especies.

**US-04 — Obtener análisis de IA**

**Como** propietario de un vivero **quiero** recibir un análisis generado por IA a partir de las lecturas registradas **para** entender si la planta presenta riesgo de estrés hídrico o ambiental.

Criterios de aceptación:
* El sistema envía especie + lecturas + riego a la IA.
* La respuesta incluye nivel de riesgo y acciones recomendadas.
* El análisis se puede guardar.

**US-05 — Consultar historial de cuidados**

**Como** propietario de un vivero **quiero** consultar el historial de lecturas, riegos y recomendaciones **para** analizar la evolución de cada planta.

Criterios de aceptación:
* Se muestran las entradas ordenadas por fecha.
* Se incluyen los análisis de IA asociados.

**Historias Should-Have (opcionales, no obligatorias para el MVP)**

* **US-06 — Carga desde sensor IoT**: recibir automáticamente lecturas desde un dispositivo ESP32. Queda como roadmap futuro, fuera del MVP.
* **US-07 — Detección por fotografía**: subir una imagen y obtener una estimación de estrés hídrico. Queda como roadmap futuro, fuera del MVP.

---

## 6. Tickets de Trabajo

> El detalle completo de cada ticket se documenta, uno por archivo, en [docs/tickets](docs/tickets/README.md). Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

Lista completa prevista para el MVP (detallada individualmente en [docs/tickets](docs/tickets/README.md)):

* **T-01**: Modelo de datos de plantas y lecturas (base de datos).
* **T-02**: API CRUD de plantas (backend).
* **T-03**: API de lecturas ambientales (backend).
* **T-04**: Servicio de recomendaciones con IA (backend).
* **T-05**: Dashboard (frontend).
* **T-06**: Historial y alertas (frontend).
* **T-07**: Test E2E del flujo principal.

**Ticket 1**: [T-01 — Modelo de datos de plantas y lecturas](docs/tickets/T-01-modelo-de-datos-de-plantas-y-lecturas.md) (base de datos)

**Ticket 2**: [T-02 — API CRUD de plantas](docs/tickets/T-02-api-crud-de-plantas.md) (backend)

**Ticket 3**: [T-05 — Dashboard frontend](docs/tickets/T-05-dashboard-frontend.md) (frontend)

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**
