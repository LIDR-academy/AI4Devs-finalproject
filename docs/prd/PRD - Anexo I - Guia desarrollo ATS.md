## Anexo Técnico - Simulación del API y Webhooks de Teamtailor (para ATS MVP)

### 1. Objetivo

Este anexo define los lineamientos técnicos para asegurar que el **ATS MVP** funcione como un **mock realista de Teamtailor**, permitiendo pruebas confiables de integración con la **Plataforma TalentIA Core AI** y garantizando una futura transición fluida al entorno real de Teamtailor.

---

### 2. API RESTful Simulada

#### 2.1. Estilo JSON\:API

Teamtailor sigue la especificación [JSON](https://jsonapi.org/)[:API](https://jsonapi.org/). El ATS MVP deberá:

- Utilizar encabezado `Content-Type: application/vnd.api+json`
- Estructurar sus respuestas siguiendo el formato JSON\:API:

```json
{
  "data": {
    "id": "123",
    "type": "job",
    "attributes": {
      "title": "Frontend Developer",
      "status": "published"
    },
    "relationships": {
      "recruiter": {
        "data": { "type": "user", "id": "42" }
      }
    }
  }
}
```

#### 2.2. Endpoints Simulados (Principales)

| Método | Ruta               | Descripción                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | /jobs              | Listado de vacantes                |
| GET    | /jobs/\:id         | Detalle de vacante                 |
| POST   | /jobs              | Crear nueva vacante                |
| GET    | /candidates        | Listado de candidatos              |
| GET    | /candidates/\:id   | Detalle de candidato               |
| POST   | /candidates        | Crear nuevo candidato              |
| POST   | /applications      | Registrar aplicación a una vacante |
| GET    | /applications/\:id | Detalle de candidatura             |
| PATCH  | /applications/\:id | Actualizar etapa de candidatura    |
| GET    | /stages            | Listado de etapas del pipeline     |
| GET    | /rejection-reasons | Listado de motivos de rechazo      |

---

### 3. Autenticación

- Simular autenticación por **API Token**.
- Encabezado requerido:

```
Authorization: Token token="{API_KEY}"
```

---

### 4. Webhooks Simulados

#### 4.1. Formato

- Encabezado `X-Teamtailor-Signature: {HMAC_SHA256}` sobre el payload con una clave compartida.
- Payload en formato JSON:

```json
{
  "data": {
    "id": "234",
    "type": "candidate",
    "attributes": {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  },
  "event": "candidate.created"
}
```

#### 4.2. Eventos a simular

| Evento              | Descripción                                |
| ------------------- | ------------------------------------------ |
| candidate.created   | Nuevo candidato creado                     |
| job.created         | Nueva vacante publicada                    |
| application.created | Nueva aplicación a una vacante recibida    |
| application.updated | Cambio de etapa o estado de la candidatura |

#### 4.3. Configuración

- El ATS MVP deberá permitir configurar manualmente:
  - La URL de destino de los webhooks.
  - El secreto compartido para firma.

---

### 5. Códigos de Respuesta y Errores

| Código | Descripción                                   |
| ------ | --------------------------------------------- |
| 200    | OK (GET/PATCH exitoso)                        |
| 201    | Creado (POST exitoso)                         |
| 204    | Sin contenido (DELETE exitoso)                |
| 400    | Error de validación                           |
| 401    | No autorizado                                 |
| 404    | No encontrado                                 |
| 422    | Entidad no procesable (validaciones fallidas) |

---

### 6. Recomendaciones para Testing

- Reutilizar herramientas de integración real con Teamtailor apuntando al ATS MVP (mock).
- Usar la misma estructura de peticiones/respuestas esperadas por la Core AI.
- Validar el comportamiento completo de ida y vuelta (candidato -> evaluación -> webhook de cambio).

---

### 7. Referencias

- [Teamtailor Public API](https://docs.teamtailor.com/)
- [Teamtailor Webhooks](https://support.teamtailor.com/en/articles/8068954-webhooks-events)
- [Teamtailor JSON API Guide](https://jsonapi.org/)

---

> Este anexo es parte del PRD TalentIA Fase 1. Se debe usar como referencia técnica para el desarrollo del ATS MVP en modo "mock Teamtailor-compatible".

