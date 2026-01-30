***

## copilot-instructions.md (versión refactor)

```markdown
# GitHub Copilot — Strict Operational Instructions
**Proyecto:** Meditation Builder  
**Ámbito:** Backend (Java 21 + Spring Boot + Hexagonal) y Frontend (React + TypeScript)

---

# 0. Principio general

Copilot opera en **modo estricto** y debe aplicar, sin reinterpretar, las normas definidas en:

1. Historia de Usuario + BDD (`.feature`)
2. `.specify/memory/constitution.md`
3. `delivery-playbook-backend.md` / `delivery-playbook-frontend.md`
4. `engineering-guidelines.md`
5. `java21-best-practices.md` (Records, UUID, Clock, inmutabilidad)
6. `hexagonal-architecture-guide.md` y `testing.instructions.md`

Este archivo solo define **cómo** Copilot usa esas normas; no redefine arquitectura ni pipeline.[file:2][file:3][file:4][file:5][file:7][file:8]

---

# 1. Jerarquía de fuentes

Copilot debe respetar el mismo orden que la Constitución:[file:2]

1. Historia de Usuario + BDD
2. Constitución
3. Delivery Playbooks backend/frontend
4. Engineering Guidelines
5. **Java 21 Best Practices** (`java21-best-practices.md`)
6. Hexagonal Architecture Guide
7. Testing Instructions
8. ESTE archivo (`copilot-instructions.md`)
9. Frameworks (Spring, React, etc.)

Copilot NO puede contradecir ninguna fuente de nivel superior.

---

# 2. Reglas de comportamiento (todas las tareas)

Copilot DEBE:[file:2][file:3][file:4][file:5][file:7][file:8]

- Mantener cumplimiento estricto de BDD (nada fuera del comportamiento definido).
- Seguir la arquitectura hexagonal y las reglas de dependencia.
- Aplicar DDD + TDD en backend.
- Usar React Query + Zustand correctamente en frontend.
- Respetar rutas del repo según Constitución/Hexagonal Guide:
  - Backend: `backend/src/main/java/com/hexagonal/<boundedContext>/...`
  - OpenAPI: `backend/src/main/resources/openapi/<boundedContext>/...`
  - Tests backend: `backend/tests/bdd`, `backend/tests/contracts`, `backend/tests/e2e`
  - Frontend: `frontend/src`, `frontend/tests/e2e`
- Dividir siempre las tareas por capa (nunca mezclar dominio, aplicación, infra, controllers, frontend en la misma tarea).

---

# 3. Estrictamente prohibido

Copilot NO DEBE:[file:2][file:3][file:5][file:7][file:8]

- Generar endpoints no presentes en BDD/OpenAPI aprobados.
- Añadir campos a DTOs sin estar en OpenAPI.
- Crear reglas de negocio nuevas.
- Poner lógica de negocio en controllers o infraestructura.
- Mezclar pasos del pipeline (por ejemplo, generar dominio antes de BDD+OpenAPI).
- Crear modelos de dominio “por anticipación” sin respaldo en BDD.
- Usar clientes HTTP directos sin pasar por puertos de dominio.
- Generar persistencia si la historia no la requiere.
- Usar servicios externos reales en tests.
- Crear tareas que mezclen varias capas.

---

# 4. Instrucciones para `spec.md`

Copilot DEBE:[file:2][file:3][file:9]

- Generar narrativa 100% negocio, entendible para PO/QA.
- Usar BDD consolidado proporcionado por la persona usuaria.
- Incluir solo:
  - Resumen de alcance.
  - Escenarios BDD de negocio.
  - No-objetivos y riesgos de negocio si se solicitan.
- NO incluir:
  - HTTP, JSON, DTOs, arquitectura, código, persistencia.
  - Métricas técnicas, tiempos de respuesta, formatos, CI/CD.

---

# 5. Instrucciones para `plan.md`

Copilot DEBE:[file:2][file:3]

- Describir el pipeline completo de la historia, fase por fase, **siguiendo exactamente** el ciclo de vida de la Constitución y los Playbooks.
- Explicar qué artefactos se generan y en qué carpetas.
- No saltarse pasos ni mezclar capas.

---

# 6. Instrucciones para `tasks.md`

Copilot DEBE:[file:3][file:6]

- Generar micro-tareas por capa (dominio / aplicación / infra / controllers / frontend / tests).
- Para cada tarea: objetivo, artefactos, ubicación exacta, criterios de aceptación.
- No anticipar historias futuras ni añadir endpoints nuevos.
- Si una tarea toca varias capas → dividirla en varias tareas.

---

# 7. Reglas para generación de código

Copilot solo puede generar código cuando:[file:2][file:3][file:7]

1. Existe `.feature` ejecutable en rojo.
2. Existe OpenAPI mínimo validado para la historia.
3. Existen `spec.md`, `plan.md` y `tasks.md` completos.
4. La persona usuaria lo solicita explícitamente.

### Backend

- Arquitectura hexagonal estricta.
- Dominio sin Spring ni tipos de infraestructura.
- Use cases sin lógica de negocio (solo orquestación).
- Infraestructura que implementa puertos out.
- Controllers que cumplen OpenAPI sin desviaciones.

### Frontend

- Cliente OpenAPI autogenerado.
- React Query para server-state; Zustand para UI-state.
- Sin lógica de negocio en UI.
- Playwright para E2E.

---

# 8. Testing obligatorio (recordatorio)

Copilot debe seguir `testing.instructions.md` al sugerir tests:[file:7]

- Backend:
  - Unit tests (dominio + aplicación).
  - Integration tests (infra).
  - Contract tests (OpenAPI).
  - BDD (Cucumber).
  - E2E.
- Frontend:
  - Unit tests (Jest/Vitest).
  - Integration (RTL + MSW).
  - E2E (Playwright).

---

# 9. CI/CD Gates

Copilot debe considerar como bloqueantes los gates definidos en la Constitución y Testing Instructions:[file:2][file:7]

1. BDD
2. API
3. Unit
4. Infra
5. Contract
6. E2E backend
7. E2E frontend

---

# 10. Anti‑patterns (rechazar)

Copilot debe evitar activamente y sugerir alternativas cuando detecte:[file:2][file:3][file:5][file:7][file:8]

- God Objects.
- Lógica UI ↔ dominio mezclada.
- Persistencia no solicitada.
- Clases duplicadas.
- Tests sin aserciones.
- Endpoints no basados en BDD.
- Diseño “para el futuro” sin justificación en historias/BDD.

---

# 11. Principio final

Copilot debe producir resultados **conservadores, trazables y alineados** con:

- BDD + User Stories
- Constitución
- Playbooks
- Guías de ingeniería y arquitectura

Nunca más allá de lo que el negocio haya definido.

FIN DEL DOCUMENTO