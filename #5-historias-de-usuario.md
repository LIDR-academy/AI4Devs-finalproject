# Historias de Usuario Refinadas (LogSentinel)

Para dar continuidad al enfoque de **Desarrollo Guiado por Especificaciones (Spec-Driven Development)**, como Product Owner senior he desglosado el MVP de LogSentinel en 4 Historias de Usuario críticas. Cada una ha sido estructurada bajo el principio **INVEST** y refinada con la profundidad técnica necesaria para guiar directamente la generación de código con IA.

---

## US1: Declaración e Ingesta de Incidentes Críticos

### Narrativa

> **Como** Ingeniero de Confiabilidad del Sitio (SRE)
> **Quiero** registrar un nuevo incidente ingresando el volcado de logs y su nivel de urgencia
> **Para** que el sistema inicialice el ciclo de vida de remediación y habilite el análisis contextual.



### Evaluación INVEST

* **Independent:** Sí. Guarda el estado inicial del incidente de forma autónoma sin depender del motor RAG ni de la IA.
* **Negotiable:** Sí. La UI puede simplificarse a texto plano o selectores básicos de prioridad en esta etapa.
* **Valuable:** Alta. Proporciona el punto de entrada de datos persistente indispensable para todo el flujo.
* **Estimable:** Sí. Es un flujo CRUD transaccional clásico de Spring Boot con JPA.
* **Small:** Enfocado estrictamente en la creación y el cambio de estado inicial (`OPEN`).
* **Testable:** Sí. Validable mediante pruebas automatizadas de integración HTTP en el controlador.

### Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Creación exitosa de un incidente crítico

  Dado que el endpoint "/api/v1/incidents" recibe una petición POST válida
  Y el payload contiene systemName="payment-gateway", priority="P1" y un rawLogSnapshot con errores de timeout

  Cuando el backend procesa la solicitud con éxito

  Entonces el sistema debe responder con HTTP 201 Created
  Y el payload de respuesta debe incluir un "id" en formato UUID, el estado "OPEN" y las marcas de tiempo correspondientes.


Escenario: Rechazo de ingesta por datos incompletos

  Dado que el endpoint recibe una petición POST donde el campo "rawLogSnapshot" está vacío

  Cuando se ejecuta la validación en el controlador

  Entonces el sistema debe responder con HTTP 400 Bad Request
  Y el cuerpo de la respuesta debe listar el error de validación explícito.

```

### Especificación Técnica de Implementación

* **Capa Web (Java):** Controlador REST que valida el DTO de entrada mediante anotaciones `@Valid`, `@NotNull` y `@Size(min=10)`.
* **Capa de Persistencia:** Mapeo directo a la entidad `@Entity` de JPA correspondiente a la tabla `incidents`. Generación automática de UUID v4 del lado de la base de datos a través de Hibernate (`@GeneratedValue`).
* **Respuesta:** Retorno de un objeto `IncidentResponseDTO` aislando la entidad física de la API externa.

---

## US2: Búsqueda Semántica Automatizada de Runbooks (Contexto RAG)

### Narrativa

> **Como** Motor Orquestador de Backend
> **Quiero** calcular el vector del log ingresado y compararlo contra los fragmentos de la base de conocimiento
> **Para** extraer de forma automatizada las 3 guías de solución técnicas más relevantes del historial.

### Evaluación INVEST

* **Independent:** Se conecta con US1 mediante el ID del incidente, pero su lógica matemática de vectores es completamente aislada.
* **Negotiable:** El número de fragmentos recuperados (Top K) es parametrizable en el archivo de propiedades.
* **Valuable:** Crítica. Evita el "alucinamiento" del LLM inyectando información técnica verídica corporativa.
* **Estimable:** Sí. Depende de la llamada a la API de embeddings y una consulta nativa en la base de datos.
* **Small:** Se limita exclusivamente a recibir texto, extraer fragmentos por proximidad vectorial y devolverlos ordenados.
* **Testable:** Sí. Se valida mediante aserciones matemáticas de similitud coseno en un entorno de pruebas con datos controlados.

### Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Recuperación exitosa de fragmentos de Runbooks por similitud semántica

  Dado que la base de datos contiene chunks indexados con vectores de la dimensión del modelo de embeddings activo (768 por defecto con Ollama/`nomic-embed-text`; 1536 si el perfil `openai` está activo)

  Cuando el servicio interno ejecuta la búsqueda por coseno usando el embedding del log del incidente

  Entonces la consulta debe retornar exactamente un máximo de 3 registros de la tabla "runbook_chunks"

  Y los registros deben estar ordenados descendentemente por su cercanía geométrica (menor distancia de coseno).

```

### Especificación Técnica de Implementación

* **Capa de Servicio (Java):** `EmbeddingModel` de Spring AI, configurado por defecto contra Ollama local (`nomic-embed-text`, dimensión 768) y opcionalmente contra OpenAI (`text-embedding-3-small`, dimensión 1536) vía el perfil `openai`. Cambiar de proveedor luego de tener datos persistidos requiere backfill/re-embedding.
* **Capa de Datos (SQL Nativo en JPA):** Uso del operador de distancia de coseno `<=>` provisto por la extensión `pgvector` de PostgreSQL.
* **Consulta SQL de Referencia:**
```sql
SELECT id, content, (embedding <=> ?1::vector) as distance 
FROM runbook_chunks 
ORDER BY distance ASC 
LIMIT 3;

```



---

## US3: Emisión en Streaming del Diagnóstico de Causa Raíz (IA)

### Narrativa

> **Como** Ingeniero SRE
> **Quiero** visualizar en tiempo real y de forma progresiva el diagnóstico redactado por la IA
> **Para** comprender la raíz del problema inmediatamente sin esperar a que finalice la generación completa del texto.

### Evaluación INVEST

* **Independent:** Requiere el contexto recuperado en US2, pero la gestión de la conexión y el búfer web es una funcionalidad de red aislada.
* **Negotiable:** El formato del streaming es texto plano estructurado en Markdown.
* **Valuable:** Altísima para la experiencia de usuario (UX) en situaciones de alta tensión.
* **Estimable:** Complejidad media debido al manejo asíncrono e hilos en Spring Boot.
* **Small:** Se enfoca puramente en el transporte reactivo token a token desde el LLM hacia la interfaz del usuario.
* **Testable:** Sí. Pruebas de integración verificando la cabecera `text/event-stream` y la persistencia final del texto consolidado.

### Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Consumo interactivo del diagnóstico vía Server-Sent Events
  Dado que un cliente Frontend establece una conexión GET al endpoint "/api/v1/incidents/{id}/stream"
  Cuando el orquestador de Spring Boot comienza a recibir tokens desde la API del LLM
  Entonces el servidor debe mantener la conexión abierta enviando eventos con la cabecera "Content-Type: text/event-stream"
  Y al finalizar la transmisión, el texto completo del diagnóstico debe quedar persistido en "incident_analyses".

```

### Especificación Técnica de Implementación

* **Backend (Spring Boot Controller):** Retorno de un objeto de tipo `SseEmitter`. La lógica del servicio se ejecuta en un hilo asíncrono (`@Async`) consumiendo la API del LLM configurando la propiedad `stream = true`.
* **Manejo de Memoria:** Al terminar el ciclo de tokens, se ejecuta `emitter.complete()` dentro de un bloque `try-catch-finally` para evitar hilos huérfanos o fugas de memoria en el servidor web Tomcat.
* **Frontend (React):** Instanciación de un objeto nativo del navegador `EventSource` apuntando a la URL del stream, actualizando secuencialmente el estado local (`setDiagnostic`) conforme ingresan los fragmentos de datos.

---

## US4: Ejecución Controlada y Auditoría de Scripts de Solución

### Narrativa

> **Como** Ingeniero SRE
> **Quiero** activar de forma manual el script de mitigación sugerido por la IA y ver sus trazas de salida
> **Para** resolver el incidente de forma segura dejando constancia en el historial de auditoría de la plataforma.

### Evaluación INVEST

* **Independent:** Depende de la generación del análisis en US3, pero la lógica de ejecución del comando y el registro del resultado en la base de datos es una unidad de software separada.
* **Negotiable:** El entorno de ejecución está acotado y simula llamadas seguras a scripts del sistema o playbooks de automatización configurados previamente.
* **Valuable:** Crítica. Cierra el bucle de reparación y provee el insumo para futuras métricas de cumplimiento (*Compliance*).
* **Estimable:** Sí. Involucra el uso del API de ejecución de procesos o comandos de Java.
* **Small:** Se centra en guardar el script, disparar su ejecución, capturar la consola y actualizar los estados del incidente a `RESOLVED` o `FAILED`.
* **Testable:** Sí. Mediante pruebas automatizadas inyectando un script mock (ej: `echo 'success'`) y validando el contenido de los logs grabados.

### Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Ejecución exitosa de un script de remediación generado por la IA
  Dado que existe un análisis guardado con un script de solución sugerido
  Cuando el SRE presiona el botón "Ejecutar Remediación" en la interfaz web
  Entonces el backend crea un registro en la tabla "remediation_actions" en estado "DRY_RUN" o "SUCCESS"
  Y el estado del incidente principal debe actualizarse automáticamente a "RESOLVED" si el código de salida del proceso es cero (0).

```

### Especificación Técnica de Implementación

* **Aislamiento y Ejecución:** La capa de servicio mapea el script a través de un componente ejecutor especializado (ej: `ProcessBuilder` de Java encapsulado de manera segura para prevenir vulnerabilidades de inyección de comandos).
* **Persistencia:** Captura el flujo de salida estándar (`stdout`) y el flujo de errores (`stderr`) combinándolos en un solo campo de texto para rellenar la columna `execution_log` de la tabla `remediation_actions`.
* **Transaccionalidad:** Se aplica la anotación `@Transactional` de Spring para asegurar que la actualización del estado del incidente y la inserción de la acción de remediación se ejecuten de manera atómica en la base de datos PostgreSQL.
