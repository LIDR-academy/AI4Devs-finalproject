# Arquitectura

AuditCare Timeline usa una arquitectura por capas:

- Frontend Next.js.
- Backend FastAPI.
- PostgreSQL para persistencia.
- Statewave para memoria contextual.
- Statewave LLM (LiteLLM) para extracción de eventos clínicos.

```mermaid
flowchart LR
A[Next.js Frontend] --> B[FastAPI Backend]
B --> C[(PostgreSQL)]
B --> D[Statewave]
```
