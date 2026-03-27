# Work Ticket: ARF-003 — Endpoint GET /obras con filtros duracion_max y mood

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 3h |
| **Dependencias** | ARF-001 |

**Descripción**: Implementar en el Servicio de Curaduría (NestJS) el endpoint de búsqueda filtrada que es el corazón del Dial de Tiempo.

**Criterios de Aceptación**:
- [x] `GET /obras?duracion_max=15&mood=Melancolico` retorna obras filtradas con status 200.
- [x] El resultado incluye: título, director, duración, vibe_mood, estado_acceso (tipo + codigo_color), plataforma_origen, lista de hitos.
- [x] Si no hay resultados, retorna array vacío `[]` con status 200 (nunca 404).
- [x] Parámetros son opcionales; sin filtros devuelve todo el catálogo.
- [x] Contenido gratuito (`ESTADO_ACCESO = Abierto`) aparece primero en los resultados.

**Tareas Técnicas**:
1. [x] Crear `CuratedModule` con su servicio y controlador en `backend/src/modules/curated/`.
2. [x] Implementar query con filtros opcionales y ORDER BY estado_acceso.
3. [x] Crear DTO de respuesta `ObraResponseDto`.
4. [x] Agregar validación de parámetros con `class-validator`.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
