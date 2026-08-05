---
name: backlog-tickets
description: "Desglosa las historias en tickets técnicos atómicos de backend y frontend (máximo 5 SP) en directorios separados, Definition of Done (DoD) y actualiza la Matriz de Trazabilidad SDD."
version: "1.2.0"
category: "05_agile_planning"
inputs:
  - prd_doc
  - user_stories
outputs:
  - "docs/05_agile_planning/tickets/{modulo}/backend/"
  - "docs/05_agile_planning/tickets/{modulo}/frontend/"
  - "docs/05_agile_planning/matriz_trazabilidad.md"
---

Actúa como un Senior Product Owner, Agile Coach y Technical Lead experto en metodologías ágiles de desarrollo e ingeniería de software basada en contratos (Design-First).

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) y el esquema lógico en "design.md" provistos para estructurar detalladamente la sección "Tickets de Trabajo y Trazabilidad (Backlog)" de cualquier sistema, dividiendo las Historias de Usuario en tareas atómicas y estimadas.

Analiza los siguientes documentos del sistema:
- Documento PRD / Funcional:
* [RUTA_DEL_PRD]

- Documento de Diseño / Persistencia:
* [RUTA_DEL_DISEÑO]

- Directorio de las Historias de usuario:
* [DIRECTORIO_STORIES]

Por favor, genera de forma exclusiva la sección de Backlog en Markdown bajo las siguientes pautas de ingeniería de software:

1. **Estructura del Backlog y División del Trabajo:**
   - Para cada historia de usuario (US-XXX) que requiera interacción de API y pantallas de usuario, debes generar de forma separada:
     - Un ticket de **Backend** centrado en persistencia, lógica de dominio, APIs de Express y validación Zod.
     - Un ticket de **Frontend** centrado en la vista de usuario, interfaces táctiles (ergonomía de al menos 48px), persistencia local IndexedDB (resiliencia offline-first) y pruebas de componentes.

2. **Matriz de Trazabilidad del Sprint Backlog:**
   - Una tabla con las columnas: ID Ticket (correlativo, ej. TK-001 para backend, TK-007-B para frontend), ID US Relacionada, Título del Ticket, Módulo/Vertical Slice afectado, Tipo (Backend/Frontend), Estimación de Puntos de Historia (escala Fibonacci, máx. 5 SP) y prioridad MoSCoW.

3. **Fichas de Especificación Técnica de Tickets:**
   - Para cada ticket de la matriz, genera una ficha técnica que defina:
     - Título descriptivo e intenciones lógicas de negocio.
     - Descripción detallada: Qué problema operativo resuelve y por qué es necesaria su implementación.
     - Alcance de Modificación de Archivos: Especificando en qué capas de la Arquitectura Hexagonal incidirá el cambio (Domain, Application, Infrastructure).
     - Criterios de Aceptación/DoD: Utilizando formato Given-When-Then (Gherkin) para componentes funcionales/APIs, y aserciones explícitas de seguridad, compilación o ergonomía táctil para el frontend.

Genera tu respuesta manteniendo las rutas de ficheros, interfaces de código, claves JSON de payloads y queries de base de datos en inglés técnico profesional. Comienza directamente con el contenido, sin introducciones conversacionales.

Guarda los tickets de la siguiente manera:
- Tickets de Backend: dentro de `docs/05_agile_planning/tickets/{modulo}/backend/` con nombre 'TK-XXX.md' (donde `{modulo}` es `auth`, `stock`, `kitchen`, `reports` o `shared`).
- Tickets de Frontend: dentro de `docs/05_agile_planning/tickets/{modulo}/frontend/` con nombre 'TK-XXX.md' (ej: TK-007-B.md, TK-007-C.md).
Crea un archivo índice que consolide la visualización de todos los tickets.

---

## 📌 Directiva de Gobernanza Documental (Agnóstica):
- Guarda los tickets en sus respectivas subcarpetas de `docs/05_agile_planning/tickets/{modulo}/`.
- Al generar o modificar tickets, exige actualizar la **Matriz de Trazabilidad SDD** en `docs/05_agile_planning/matriz_trazabilidad.md` y el **Mapa del Backlog** en `docs/05_agile_planning/backlog_map.md`.

