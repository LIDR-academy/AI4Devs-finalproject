## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto.md)
1. [Descripción general del producto](#1-descripción-general-del-producto.md)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema.md)
3. [Modelo de datos](#3-modelo-de-datos.md)
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

## Summary
- Añade el esquema `runbook_chunks` (pgvector, columna `vector(768)`, índice HNSW `vector_cosine_ops`) vía migración Flyway, sin usar el `VectorStore`/`PgVectorStore` autoconfigurado de Spring AI (Opción B, decisión documentada en el ledger de orquestación).
- Implementa la búsqueda semántica con query nativa JPA (operador `<=>`) y un fallback automático a Full-Text (`tsvector`/`ts_rank`) cuando falla la llamada al proveedor de embeddings, garantizando que la búsqueda nunca retorne vacío por esa causa.
- Parametriza el Top K de resultados vía `logsentinel.rag.top-k` (default 3), verificado como genuinamente configurable con un valor forzado distinto en los tests de integración.
- Alinea documentación (`tickets.md`, user story US2, `agents.md`, skills de IA) para reflejar el modelo de tabla única y la arquitectura elegida.

## Changes
- `V3__create_runbook_chunks_table.sql`: extensión `vector`, tabla `runbook_chunks`, índice HNSW.
- `V4__add_fulltext_search_to_runbook_chunks.sql`: columna `content_tsv tsvector` generada + índice GIN para el fallback Full-Text.
- `RunbookChunk` (dominio), `RunbookSearchPort` (puerto de salida).
- `PgVectorRunbookSearchAdapter` / `FullTextRunbookSearchAdapter`, `RunbookChunkJpaEntity`/`RunbookChunkJpaRepository` con las queries nativas de búsqueda por coseno y por texto completo.
- `VectorType`: `UserType` de Hibernate para mapear `vector(N)` con `pgvector-java`.
- Suite de tests: unitarios (Mockito) para ambos adaptadores + integración real con Testcontainers (`pgvector/pgvector:pg16`) cubriendo esquema, ranking por coseno, activación del fallback y Top K parametrizable.

## Test plan
- [x] `mvn test` (suite completa backend, incl. Testcontainers) — BUILD SUCCESS
- [x] Cobertura JaCoCo ≥ 95% (gate `LOG-CORE-BE-00`)
- [x] `verify-clean-arch` (checks 1, 2, 4, 5 aplicables al alcance) — sin violaciones
- [x] Auditoría anti-H2 en tests de integración (0 referencias — todo Testcontainers real)

🤖 Generado con [Claude Code](https://claude.com/claude-code)

**Pull Request 2**
## Resumen

Implementa US3 completa (Emisión en Streaming del Diagnóstico de Causa Raíz):

- **LOG-US3-BE-01**: endpoint `GET /api/v1/incidents/{id}/diagnostic/stream` vía `SseEmitter`, orquestando `ChatClient` con `stream=true` (provider-agnostic ollama/openai).
- **LOG-US3-DB-02**: persistencia del diagnóstico consolidado en `incident_diagnostics` (1:1 con `incidents`) al cerrar el stream, con test de integración Testcontainers.
- **LOG-US3-FE-03**: terminal interactiva en React que consume el stream vía `EventSource`, renderiza Markdown sanitizado (`marked` + `DOMPurify`), con reconexión por backoff exponencial y auto-scroll inteligente.

## Criterios de aceptación (Gherkin)

- [x] Conexión GET a `/incidents/{id}/diagnostic/stream` con `Content-Type: text/event-stream`
- [x] Persistencia del texto completo del diagnóstico en `incident_diagnostics` al finalizar la transmisión
- [x] Consumo interactivo desde el frontend vía `EventSource`, actualizando el estado progresivamente

## Deuda técnica registrada (no bloqueante)

`DEBT-001` (`docs/deuda-tecnica.md`): el backend no emite una señal SSE explícita de cierre (`event: complete`/`error`); el frontend resuelve esto con una heurística (chunk recibido antes de `onerror` ⇒ completado, cero chunks ⇒ falla real con backoff). Se sugiere un ticket futuro para agregar la señal de protocolo explícita.

## Validación

- Backend: `mvn test` → 93 tests, 0 fallos
- Frontend: `npm run build` OK, `npm test -- --run` → 49 tests, 0 fallos
- `verify-clean-arch`: checks 1–8 sobre el código de US3 → OK

## Test plan

- [x] Suite backend (`mvn test`)
- [x] Build + suite frontend (`npm run build && npm test -- --run`)
- [x] Checks de arquitectura/DevSecOps (`verify-clean-arch`)


**Pull Request 3**

## Resumen

Implementa la US4 completa (ejecución controlada y auditoría de scripts de remediación sugeridos por la IA), más dos refactors de contrato aguas arriba (US3) detectados como drift durante la orquestación.

- Sandbox de ejecución con allowlist de comandos y aislamiento no-root (`ProcessBuilder` + watchdog).
- Endpoint `POST /incidents/{id}/remediations`: crea el registro de auditoría en `EXECUTING` (transacción A, commit inmediato) y lo cierra en `SUCCESS`/`FAILED` (transacción B) según el código de salida, actualizando el incidente a `RESOLVED` si es 0.
- Captura diferenciada de `stdout_log`/`stderr_log` en columnas independientes (reemplaza el diseño original de un único `execution_log`).
- Matriz de 5 vectores de inyección Bash (`|`, `&&`, `$(...)`, backticks, `>`) cubierta por tests dedicados.
- `GET /incidents/{id}`: endpoint de detalle consolidado (incluye `analyses[].suggestedScript`), requerido para que el panel de remediación tenga de dónde leer el script sugerido.
- Panel de autorización en frontend con modal de doble confirmación y terminal de salida stdout/stderr, montado en el dashboard del incidente.
- E2E Playwright del happy-path completo (siembra de fixture → ejecución → verificación de auditoría en base).
- Persistencia estructurada del script sugerido al momento de generar el diagnóstico (US3), en vez de parsearlo en el momento de ejecutar.

## Tickets

`LOG-US4-BE-01`, `LOG-US4-BE-02`, `LOG-US4-TEST-03`, `LOG-US4-BE-02B`, `LOG-US4-FE-03`, `LOG-US4-BE-03`, `LOG-US4-FE-04`, `LOG-US4-E2E-04`, más el ticket de soporte `LOG-US3-DB-02B`.

## Validación

- [x] Backend: 170/170 tests (`mvn test`)
- [x] Frontend: build OK + 109/109 tests
- [x] `verify-clean-arch`: 13/13 checks PASS (arquitectura hexagonal, sin Lombok, DTOs inmutables, sandbox validado, `SseEmitter.complete()` en `finally`, sin secrets, Dockerfile no-root, CI con `permissions:`/Actions pineadas, contrato OpenAPI sin drift sin resolver)
- [x] E2E Playwright happy-path (headed + automatizado)

## Deuda técnica registrada (no bloqueante)

`DEBT-002` (firma de auditoría del autorizador), `DEBT-004` (gaps `tokensUsed`/`updatedAt`), `DEBT-005` (arranque en frío de Ollama dockerizado) — ver `docs/deuda-tecnica.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
