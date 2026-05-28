# Registro de Prompts de IA · FMS SaaS Platform (Logike)

Este documento detalla la bitácora de prompts avanzados y técnicas de ingeniería de prompts (Role-playing, Few-shot, Chain-of-thought) utilizados con asistentes de código inteligentes en cada una de las fases de análisis, diseño y especificación técnica de la primera entrega.

---

## 1. Descripción general del producto

### **Prompt 1: Ideación del MVP y Modelo de Negocio (Zero-Shot + Role Playing)**
> **Rol e Instrucción:** Definir el alcance y propuesta de valor del producto final enfocándonos en un problema real del transporte.

```text
Actúa como un Lead Product Manager con 15 años de experiencia en logística B2B y SaaS para transporte terrestre de carga pesada en Latinoamérica. Quiero diseñar un MVP de un sistema multi-tenant de Fleet Management (FMS) llamado "Logike". 

Por favor, define de manera concisa:
1. El objetivo de negocio principal y a quién resuelve la vida.
2. Las 4 características críticas del MVP (priorizando Viajes con control de kilometraje, asignación de conductores y finanzas operativas en ruta).
3. Una narrativa breve de experiencia de usuario (UX) de extremo a extremo que demuestre el flujo desde que el administrador crea el viaje en Vaadin SSR hasta que el chofer reporta sus gastos.

Escribe la respuesta estructurada en Markdown profesional y limpio.
```

*   **Nota de Ajuste Humano:** El LLM inicialmente propuso añadir integraciones complejas de GPS en tiempo real y mapas interactivos. Con criterio de ingeniería, lo acotamos en el prompt final a un control manual por odómetro (kilometraje) validado en backend, asegurando un alcance realista del MVP que minimizara costes de APIs de terceros en la primera etapa.

---

## 2. Arquitectura del Sistema

### **Prompt 1: Selección de Patrón y C4 Container Diagram (Few-Shot)**
> **Rol e Instrucción:** Generar un diagrama de contenedores interactivo en Mermaid.js y la justificación técnica de la arquitectura.

```text
Eres un Arquitecto de Software Principal experto en el ecosistema Java (Java 21, Spring Boot 4) y la plataforma Vaadin Flow (SSR). 

Necesito justificar técnicamente por qué una arquitectura de "Monolito Modular" estructurada bajo "Arquitectura Hexagonal" y "Domain-Driven Design (DDD)" es la elección ideal para nuestro producto "Logike FMS SaaS", en comparación con una arquitectura distribuida de microservicios.

Por favor, genera:
1. Un diagrama Mermaid.js de tipo "C4 Container" que represente a los actores (Gerente, Admin, Conductor), los contenedores (Keycloak IAM, fms-core-service con capas Vaadin UI, Fleet, Personnel, Trips, Accounting, y fms-db PostgreSQL 16 con aislamiento lógico).
2. Un listado riguroso de pros y contras (beneficios y sacrificios/trade-offs).

Sigue el siguiente formato de sintaxis Mermaid para contenedores:
graph TD
    actor["👤 Nombre Actor"] --> container["🖥️ Nombre Contenedor"]
```

*   **Nota de Ajuste Humano:** Modificamos la sintaxis del diagrama generado por el LLM para forzar que la capa visual Vaadin UI se representara dentro de la misma burbuja de proceso JVM de Spring Boot (Vaadin Flow), ya que la primera versión del asistente la dibujaba como un SPA separado en Node.js (lo cual violaba la especificación del monolito de classpath compartido).

### **Prompt 2: Aislamiento Multi-tenant Seguro (Role-Playing + Chain-of-Thought)**
> **Rol e Instrucción:** Diseñar el mecanismo de seguridad y partición de datos para inquilinos.

```text
Actúa como un Especialista en Ciberseguridad y Arquitectura de Bases de Datos multi-inquilino. Explica de forma detallada cómo podemos implementar un aislamiento lógico multi-tenant ultra seguro en PostgreSQL 16 utilizando Hibernate y Spring Boot sin crear una base de datos física por cada cliente (Tenant-per-DB). 

Describe el flujo paso a paso (desde que Keycloak emite el JWT, Spring Security extrae el Tenant ID de las claims, y Hibernate lo inyecta dinámicamente en el contexto a través de anotaciones tipo @TenantId). Proporciona ejemplos cortos de cómo se vería la entidad Java y cómo se indexan estas tablas transaccionales.
```

*   **Nota de Ajuste Humano:** Corregimos la sugerencia inicial del LLM que proponía realizar el filtrado de inquilinos de manera manual escribiendo cláusulas `WHERE company_id = :tenantId` en todos los repositorios de Spring Data. En su lugar, decidimos automatizar esto a nivel de infraestructura utilizando el mecanismo nativo `@TenantId` de Hibernate 6+ para evitar el riesgo de olvido humano por parte de los desarrolladores.

---

## 3. Modelo de Datos

### **Prompt 1: Generación del MER en Mermaid y Diccionario de Datos (Few-Shot)**
> **Rol e Instrucción:** Diseñar el modelo relacional de la base de datos PostgreSQL enfocada en el flujo prioritario.

```text
Actúa como un Administrador de Bases de Datos (DBA) experto en PostgreSQL 16. Necesito diseñar el esquema relacional enfocado en nuestro flujo priorizado: Compañías, Empleados, Conductores con licencias, Vehículos de la flota, Viajes (Trips) con odómetros y Transacciones financieras en ruta (Deals).

Por favor, genera:
1. Un diagrama de Entidad-Relación en Mermaid (erDiagram) utilizando cardinalidades estándar (||--o{ para uno a muchos, etc.). Detalla las claves primarias (PK), foráneas (FK) y anotaciones de tipo de datos de cada campo crítico.
2. Un diccionario de datos preciso en formato de tabla Markdown para las entidades 'vehicle', 'trip' y 'deal', especificando nombres de campos, tipos SQL y restricciones (Not Null, Unique, Check).
```

*   **Nota de Ajuste Humano:** La IA omitió las relaciones de integridad geográfica en los viajes. Agregamos manualmente la normalización de la tabla `location` para los puntos de origen y destino de los camiones para prevenir inconsistencias de nombres de ciudades escritos a mano en los despachos.

---

## 4. Especificación de la API

### **Prompt 1: Generación de la API en OpenAPI 3.0 YAML**
> **Rol e Instrucción:** Generar el contrato de interfaz complementaria para integraciones.

```text
Eres un Ingeniero de Integraciones B2B. Escribe la especificación de API complementaria de FMS SaaS en formato OpenAPI 3.0 YAML. Documenta exactamente tres endpoints críticos del flujo:
1. GET /api/v1/trips (para que el GPS consulte viajes activos).
2. POST /api/v1/trips (para registrar un viaje en estado PENDING).
3. GET /api/v1/vehicles (para consultar la flota de camiones).

Incluye esquemas de componentes detallados (schemas) con tipos de datos (UUID, String, Number), ejemplos realistas y códigos de respuesta estándar (200, 201, 400, 401). Devuelve solo el código YAML limpio dentro de un bloque de código.
```

*   **Nota de Ajuste Humano:** Se ajustaron los esquemas de respuesta del endpoint de creación de viajes para que incluyeran de forma obligatoria el atributo `manifest` (Manifiesto de Carga Gubernamental), un dato legal omitido por la IA pero crítico en las carreteras nacionales.

---

## 5. Historias de Usuario

### **Prompt 1: Redacción de Historias de Usuario Ágiles y Criterios Gherkin**
> **Rol e Instrucción:** Escribir las 3 historias de usuario núcleo con criterios de aceptación Gherkin.

```text
Actúa como un Business Analyst experto y Scrum Master de nuestro equipo de desarrollo. Quiero que redactes 3 historias de usuario sumamente rigurosas que cubran el flujo prioritario:
- HU 1: Registro y Asignación de Conductor a Vehículo con Comisión Operativa.
- HU 2: Creación e Inicio de Viaje con Control de Odómetro y Manifiesto de Carga.
- HU 3: Registro de Gastos en Ruta (Peajes, Combustible) y su Vinculación al Viaje.

Para cada historia de usuario, proporciona:
1. El formato ágil clásico: "Como... Quiero... Para...".
2. Dos escenarios detallados de criterios de aceptación utilizando la sintaxis Gherkin (Given-When-Then), cubriendo un camino feliz y un caso de borde o error de negocio (como licencias vencidas u odómetros imposibles).
```

*   **Nota de Ajuste Humano:** Estructuramos a mano el formato de comisiones del conductor en la HU 1, ya que la versión inicial del LLM no especificaba cómo se remuneraba al conductor, lo cual dejaba incompleto el requerimiento financiero de ruta (Deals).

---

## 6. Tickets de Trabajo

### **Prompt 1: Desglose de Tickets Técnicos para el Sprint (Zero-Shot)**
> **Rol e Instrucción:** Traducir las historias de usuario en tickets técnicos ejecutables.

```text
Eres el Líder Técnico de Desarrollo. Necesito traducir las historias de usuario en 3 tickets de trabajo específicos y de distinta naturaleza para nuestro Sprint:
1. Un ticket de Base de Datos (creación de tablas, constraints SQL e índices compuestos).
2. Un ticket de Backend Hexagonal (Java / Use Cases / validaciones de dominio).
3. Un ticket de Frontend en Vaadin 25 SSR (Vistas, Grid, Diálogos y alertas de notificación).

El nivel de detalle debe ser absoluto, de modo que cualquier desarrollador junior pueda leerlos e iniciar la codificación sin ambigüedad. Describe los objetivos, especificaciones técnicas precisas y la definición de hecho (Definition of Done).
```

*   **Nota de Ajuste Humano:** En el ticket de Frontend (Ticket 3), forzamos al LLM a inyectar directamente la interfaz del Use Case en memoria en el constructor de la vista de Vaadin, en lugar de utilizar un controlador REST como intermediario, manteniendo la fidelidad de la arquitectura modular libre de latencia.

---

## 7. Pull Requests

### **Prompt 1: Logs de Pull Requests y Flujo Git (Zero-Shot)**
> **Rol e Instrucción:** Simular la bitácora de entrega de código y trazabilidad del proyecto.

```text
Actúa como un Release Manager y QA Principal. Escribe la bitácora documentada de 3 Pull Requests clave que representen la construcción incremental de este MVP. 

Cada Pull Request debe contener:
1. Un título bajo el estándar de Conventional Commits (ej. feat(trip): ...).
2. Una descripción detallada del cambio técnico, su impacto en la modularidad y cómo se asocia a las historias de usuario y tickets previamente definidos.
```

*   **Nota de Ajuste Humano:** Añadimos referencias directas a las pruebas unitarias y de arquitectura (ArchUnit) en los reportes de PRs como condición obligatoria de paso, garantizando que el pipeline de calidad rechazara cualquier PR que rompiera la cobertura del 90%.
