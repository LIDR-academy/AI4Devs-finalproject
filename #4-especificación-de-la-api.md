# Contrato de la API REST: LogSentinel (OpenAPI 3.0.3)

A continuación se presenta el contrato de la API REST estructurado bajo la especificación oficial **OpenAPI 3.0.3 (Swagger)** en formato YAML. Este diseño refleja fielmente la Clean Architecture del backend en Java y la persistencia relacional optimizada expuesta en el modelo de datos.

```yaml
openapi: 3.0.3
info:
  title: LogSentinel API - Motor de Diagnóstico y Remediación SRE
  description: API REST para la gestión de incidentes, streaming de diagnósticos basados en RAG (AI) y ejecución de scripts de remediación automatizada.
  version: 1.0.0
servers:
  - url: http://localhost:8080/api/v1
    description: Servidor de Desarrollo Local (Spring Boot)
  - url: https://logsentinel-backend.onrender.com/api/v1
    description: Servidor de Staging / Producción (Render)

paths:
  /incidents:
    get:
      summary: Listar incidentes filtrados
      description: Recupera un listado paginado de incidentes operativos, permitiendo filtrar por su estado y criticidad.
      parameters:
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [OPEN, ANALYZING, RESOLVED]
        - name: priority
          in: query
          required: false
          schema:
            type: string
            enum: [P1, P2, P3]
      responses:
        '200':
          description: Listado de incidentes recuperado con éxito.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Incident'

    post:
      summary: Ingestar un nuevo incidente (Disparar Alerta)
      description: Registra un fallo en la base de datos a partir del volcado inicial de logs de un sistema afectado.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/IncidentCreate'
      responses:
        '201':
          description: Incidente creado exitosamente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Incident'

  /incidents/{id}:
    get:
      summary: Obtener el detalle consolidado de un incidente
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Detalle del incidente encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IncidentDetail'
        '404':
          description: El incidente especificado no existe.

  /incidents/{id}/stream:
    get:
      summary: Streaming SSE del diagnóstico generado por IA (RAG)
      description: Abre un canal interactivo Server-Sent Events (SSE). El backend ejecuta la búsqueda vectorial en `pgvector`, monta el prompt contextualizado y envía la respuesta del LLM en fragmentos (chunks) en tiempo real.
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Conexión SSE establecida con éxito. El cuerpo emite fragmentos de texto progresivamente.
          content:
            text/event-stream:
              schema:
                type: string
                example: "data: {\"chunk\": \"Error detectado de conexión a la base de datos...\"}"

  /incident-analyses/{analysisId}/remediations:
    post:
      summary: Ejecutar script de remediación sugerido
      description: Dispara la ejecución del script Bash o SQL generado por la IA en la infraestructura simulada y registra el log final del resultado.
      parameters:
        - name: analysisId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Script ejecutado. Devuelve el estado de salida de la consola.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RemediationAction'

components:
  schemas:
    Incident:
      type: object
      properties:
        id:
          type: string
          format: uuid
        systemName:
          type: string
          example: "auth-service"
        status:
          type: string
          enum: [OPEN, ANALYZING, RESOLVED]
          example: "OPEN"
        priority:
          type: string
          enum: [P1, P2, P3]
          example: "P1"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    IncidentCreate:
      type: object
      required:
        - systemName
        - priority
        - rawLogSnapshot
      properties:
        systemName:
          type: string
          example: "auth-service"
        priority:
          type: string
          enum: [P1, P2, P3]
          example: "P1"
        rawLogSnapshot:
          type: string
          example: "2026-06-11 20:15:03 ERROR org.postgresql.Driver - Connection refused. Total connections exceeded max_connections limit."

    IncidentAnalysis:
      type: object
      properties:
        id:
          type: string
          format: uuid
        rawLogSnapshot:
          type: string
        diagnosticOutput:
          type: string
          example: "El microservicio saturó el pool de conexiones debido a un pico de tráfico sin cierre de cursores."
        tokensUsed:
          type: integer
          example: 845
        createdAt:
          type: string
          format: date-time

    RemediationAction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        generatedScript:
          type: string
          example: "#!/bin/bash\nansible-playbook -i production kill-idle-conns.yml"
        executionStatus:
          type: string
          enum: [SUCCESS, FAILED, DRY_RUN]
          example: "SUCCESS"
        executedAt:
          type: string
          format: date-time
        executionLog:
          type: string
          example: "PLAY [kill-idle-conns] ********************\nchanged: [db-master]\nSUCCESS"

    IncidentDetail:
      allOf:
        - $ref: '#/components/schemas/Incident'
        - type: object
          properties:
            analyses:
              type: array
              items:
                $ref: '#/components/schemas/IncidentAnalysis'

```

---

## 4. Arquitectura de Endpoints y Correspondencia Java

* **El Endpoint de Streaming (`/incidents/{id}/stream`):** En tu controlador de Spring Boot (`@RestController`), este método no devolverá una entidad común, sino un tipo nativo `SseEmitter` de Spring MVC. Al mapearlo como `text/event-stream`, aseguras la compatibilidad directa con el objeto de javascript `EventSource` en el Frontend de React.
* **Separación de Responsabilidades (Clean Architecture):** Los esquemas definidos en el bloque `components/schemas` corresponden exactamente a tus clases **DTO (Data Transfer Objects)** en la capa de `infrastructure/web/dto`. Ningún modelo interno de persistencia (Entidad `@Entity` de JPA) se expone directamente a la API, manteniendo el desacoplamiento exigido por las buenas prácticas del backend.
