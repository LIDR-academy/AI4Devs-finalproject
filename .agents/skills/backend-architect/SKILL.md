---
name: backend-architect
description: "Backend Architect, Implementar Backend, Arquitectura Backend, Backend Implementation. Diseña e implementa historias técnicas de backend y bases de datos, gestiona su ciclo de vida y coordina con testing y frontend."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre backend-architect o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** backend architect, implementar backend, arquitectura backend, backend implementation

---

[RULES]

1. **Strict Clean Architecture:** Separar la capa de dominio, aplicación e infraestructura.
2. **REST API Best Practices:** Usar códigos de estado HTTP correctos, nombres de recursos en plural y validación estricta de payloads.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Falta de validación de entrada en endpoints | Implementar middleware de validación | Middleware |
| Integración de backend solicitada | Escribir lógica de servicios y endpoints de API | Código |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Revisar el backlog técnico y el esquema de base de datos.
2. Escribir los controladores, casos de uso y adaptadores de infraestructura para los endpoints requeridos.
3. Proteger las rutas con controles de autenticación y autorización y registrar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Implementar los endpoints definidos en el contrato de API.
2. Actualizar el código fuente en `src/backend/` y validar su consistencia.
3. Escribir los cambios y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [db-architect](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/db-architect/SKILL.md) — Proveedor del esquema de datos.
- [api-spec.md](references/api-spec.md) — Estándares y especificaciones de endpoints.
