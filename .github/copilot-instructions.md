
# GitHub Copilot — Strict Operational Instructions  
**Proyecto:** Meditation Builder  
**Ámbito:** Backend (Java 21 + Spring Boot + Hexagonal) y Frontend (React + TypeScript)

---

# 1. Propósito
Estas instrucciones definen **cómo debe comportarse Copilot** al generar especificaciones, planes, tareas o código dentro de este repositorio.

Copilot operará en **modo estricto**, priorizando:

1) Cumplimiento de la Constitución del proyecto  
2) Respeto total al Delivery Playbook  
3) Obediencia absoluta al pipeline vertical BDD → API → Dominio → Aplicación → Infra → Controllers → Contratos → E2E  
4) No introducir nada fuera del alcance de la Historia + BDD  

---

# 2. Jerarquía de fuentes
Copilot debe obedecer este orden:

1. **Historia de Usuario + BDD**  
2. **Constitution.md**  
3. **Delivery Playbook Backend / Frontend**  
4. **Engineering Guidelines**  
5. **Hexagonal Architecture Guide**  
6. **Este archivo (`copilot-instructions.md`)**  
7. Frameworks (Spring, React, etc.)

Copilot **NO puede contradecir** ninguna fuente de jerarquía superior.

---

# 3. Reglas de comportamiento de Copilot (obligatorias)

## 3.1 EN TODOS LOS CASOS

Copilot **DEBE**:

- Mantener estricto cumplimiento de BDD  
- Seguir la arquitectura hexagonal **sin excepciones**  
- Aplicar DDD y TDD en backend  
- Aplicar React Query + Zustand correctamente en frontend  
- Respetar rutas y estructura del repo:

```
/backend/src/main/java/com/poc/hexagonal/<boundedContext>/
/backend/src/main/resources/openapi/<boundedContext>/
/backend/tests/bdd
/backend/tests/contracts
/backend/tests/e2e

/frontend/src
/frontend/tests/e2e
```

- Respetar naming obligatorio:
  - Puertos OUT: `TextGenerationPort`, `MusicGenerationPort`, etc.
  - Use cases: `GenerateMeditation<Text|Music|Image>UseCase`
  - Adapters: `<Resource>AiAdapter`
  - Controllers: `<Resource>Controller`
  - DTOs: `<Resource><Action>{Request|Response}`

- Seguir el pipeline exacto:
  1. BDD  
  2. OpenAPI mínimo  
  3. Dominio  
  4. Aplicación  
  5. Infraestructura  
  6. Controllers  
  7. Frontend  
  8. Contratos  
  9. E2E  

- Dividir las tareas siempre por capa (nunca mezclar capas)

---

## 3.2 COSAS ESTRICTAMENTE PROHIBIDAS

Copilot **NO DEBE**:

- Generar endpoints no presentes en BDD  
- Añadir campos a DTOs sin estar en OpenAPI  
- Crear reglas de negocio nuevas  
- Escribir lógica de negocio en Controllers o Infraestructura  
- Mezclar pasos del pipeline  
- Crear modelos de dominio anticipadamente  
- Crear clases con dependencias de Spring en dominio  
- Usar clientes HTTP sin pasar por el puerto del dominio  
- Escribir código antes de crear: `spec.md`, `plan.md`, `tasks.md`  
- Definir OpenAPI antes de tener BDD  
- Generar persistencia en historias que no la requieren  
- Usar servicios externos reales en tests  
- Crear tareas que mezclen varias capas

---

# 4. Instrucciones para generación de `spec.md`

Copilot **DEBE**:

- Generar narrativa 100% negocio  
- Usar lenguaje neutral, entendible por PO/QA  
- Incluir BDD consolidado si el usuario lo proporciona  
- NO incluir HTTP, JSON, DTOs, arquitectura, código o persistencia

---

# 5. Instrucciones para generación de `plan.md`

Copilot debe producir:

- Pipeline completo fase por fase  
- Qué artefactos se generan  
- Qué carpetas se modifican  
- Sin saltarse pasos ni mezclar capas  

El plan debe seguir EXACTAMENTE el ciclo de vida definido en Constitution.md.

---

# 6. Instrucciones para generación de `tasks.md`

Copilot debe generar:

- Micro‑tareas por capa  
- Objetivo + artefactos + ubicación exacta + criterios de aceptación  
- Sin mezclar capas  
- Sin anticipar historias futuras  
- Sin añadir endpoints nuevos

Si una tarea toca varias capas → DEBE dividirla.

---

# 7. Reglas estrictas para generación de código

Copilot solo puede generar código cuando:

1. Existe `.feature` ejecutable en rojo  
2. Existe OpenAPI validado  
3. Existen `spec.md`, `plan.md` y `tasks.md` completos  
4. El usuario lo solicita explícitamente

### Backend
- Arquitectura hexagonal estricta  
- Dominio sin Spring  
- Use cases sin lógica de negocio  
- Infra implementa puertos OUT  
- Controllers cumplen OpenAPI sin desviaciones

### Frontend
- Cliente OpenAPI autogenerado  
- React Query para server-state  
- Zustand para UI state  
- Sin lógica de negocio en UI  
- Playwright para E2E

---

# 8. Testing obligatorio

### Backend:
- Unit tests (dominio + aplicación)  
- Integration tests (infra, Testcontainers)  
- Contract tests (OpenAPI)  
- BDD (Cucumber)  
- E2E

### Frontend:
- Unit tests (Jest/Vitest)  
- Integration (RTL)  
- E2E (Playwright)

---

# 9. Gates CI/CD
Copilot debe considerar como **bloqueantes**:

1. BDD  
2. API  
3. Unit  
4. Infra  
5. Contract  
6. E2E backend  
7. E2E frontend

---

# 10. Anti‑patterns (RECHAZAR automáticamente)
- Modelos God Object  
- Lógica UI ↔ dominio mezclada  
- Persistencia no solicitada  
- Clases duplicadas  
- Tests sin aserciones  
- Endpoints no basados en BDD  
- “Preparar para el futuro” sin justificación

---

# 11. Principio final
**Copilot debe producir resultados conservadores, trazables y siempre alineados con BDD + Playbooks + Constitución. Nunca más.**

FIN DEL DOCUMENTO
