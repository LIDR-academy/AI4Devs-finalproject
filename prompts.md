# Uso de IA en el proyecto — ProjectScope AI

> Los prompts fueron iterados y refinados manualmente para ajustar el alcance del MVP y mejorar la calidad de las respuestas generadas por IA.

---

## Índice

1. Descripción general del producto
2. Arquitectura del sistema
3. Modelo de datos
4. Especificación de la API
5. Historias de usuario
6. Tickets de trabajo
7. Pull requests

---

## 1. Descripción general del producto

> Estos prompts se utilizaron para definir el problema, la solución y el alcance del MVP.

---

**Prompt 1:**

Actúa como un Product Manager senior.

Ayudame a definir un producto que permita estimar proyectos de software considerando:

- esfuerzo humano
- uso de inteligencia artificial
- consumo de tokens
- costos asociados

El producto debe:

- tener un MVP realizable en 30 horas
- incluir un flujo E2E claro
- evitar complejidad innecesaria

Devuelve:

- problema
- solución
- propuesta de valor
- flujo principal

Ajuste humano: se priorizó un único flujo E2E para evitar scope creep.

---

**Prompt 2:**

Refiná la idea del producto para que incluya:

- generación de roadmap con fases y entregables
- estimación por fase
- propuesta de equipo de trabajo

El sistema debe estar enfocado en uso real en empresas.

Ajuste humano: se incorporó el concepto de roadmap para mejorar la estimación por fases.

---

**Prompt 3:**

Reducí el alcance del producto a un MVP con:

- máximo 5 funcionalidades principales
- un solo flujo E2E
- sin integraciones externas complejas

Explicá qué queda fuera del MVP.

Ajuste humano: se eliminaron integraciones como Jira o GitHub para simplificar la implementación.

---

## 2. Arquitectura del sistema

### 2.1 Diagrama de arquitectura

> Estos prompts se utilizaron para definir una arquitectura simple y alineada al MVP.

---

**Prompt 1:**

Actúa como un Software Architect.

Diseñá un diagrama de arquitectura para un sistema que:

- recibe proyectos con casos de uso
- genera roadmap con IA
- estima esfuerzo y tokens

Usá un diagrama Mermaid.

Ajuste humano: se validó que el diagrama represente correctamente el flujo E2E.

---

**Prompt 2:**

Refiná el diagrama para que sea simple y alineado a un MVP:

- frontend
- backend
- base de datos
- integración con Azure OpenAI

Ajuste humano: se eliminaron componentes innecesarios.

---

**Prompt 3:**

Simplificá la arquitectura eliminando componentes innecesarios como microservicios o colas.

Ajuste humano: se decidió mantener arquitectura cliente-servidor.

---

### 2.2 Componentes principales

> Estos prompts ayudaron a definir responsabilidades claras.

---

**Prompt 1:**

Describí los componentes principales de una arquitectura cliente-servidor simple.

Ajuste humano: se adaptó el lenguaje a documentación técnica.

---

**Prompt 2:**

Explicá responsabilidades de:

- frontend
- backend
- base de datos
- servicio de IA

Ajuste humano: se alineó con el flujo real del sistema.

---

**Prompt 3:**

Refiná la descripción para que sea clara y profesional.

Ajuste humano: se mejoró la legibilidad.

---

### 2.3 Estructura del proyecto

> Definición de organización del código.

---

**Prompt 1:**

Proponé una estructura de carpetas para:

- frontend React
- backend Node.js con Express

Ajuste humano: se priorizó simplicidad.

---

**Prompt 2:**

Simplificá la estructura para un MVP sin sobreingeniería.

Ajuste humano: se eliminaron capas innecesarias.

---

**Prompt 3:**

Asegurate de que la estructura sea fácil de entender y mantener.

Ajuste humano: se validó claridad para nuevos desarrolladores.

---

### 2.4 Infraestructura y despliegue

> Definición de estrategia de despliegue.

---

**Prompt 1:**

Proponé una estrategia de deploy usando Vercel y Render.

Ajuste humano: se eligieron servicios con CI/CD automático.

---

**Prompt 2:**

Agregá buenas prácticas de variables de entorno.

Ajuste humano: se incorporó gestión de secretos.

---

**Prompt 3:**

Simplificá la infraestructura para un MVP.

Ajuste humano: se evitó complejidad innecesaria.

---

### 2.5 Seguridad

> Medidas básicas para el sistema.

---

**Prompt 1:**

Listá medidas básicas de seguridad para una API REST.

Ajuste humano: se filtraron medidas no necesarias.

---

**Prompt 2:**

Adaptá a un MVP sin autenticación compleja.

Ajuste humano: se evitó sobreingeniería.

---

**Prompt 3:**

Refiná para que sea claro y realista.

Ajuste humano: se simplificó lenguaje técnico.

---

### 2.6 Tests

> Estrategia de testing.

---

**Prompt 1:**

Definí estrategia de testing fullstack.

Ajuste humano: se priorizó flujo principal.

---

**Prompt 2:**

Adaptá a:

- unit tests
- integration tests
- E2E

Ajuste humano: se eligieron herramientas concretas.

---

**Prompt 3:**

Simplificá priorizando el flujo E2E.

Ajuste humano: se evitó sobretestear.

---

## 3. Modelo de datos

> Definición del esquema del sistema.

---

**Prompt 1:**

Definí un modelo de datos para:

- proyectos
- casos de uso
- estimaciones
- fases
- roles
- tokens

Ajuste humano: se validaron entidades necesarias.

---

**Prompt 2:**

Convertí a esquema relacional.

Ajuste humano: se eligió PostgreSQL.

---

**Prompt 3:**

Simplificá para MVP.

Ajuste humano: se redujo complejidad.

---

## 4. Especificación de la API

> Definición de endpoints.

---

**Prompt 1:**

Diseñá endpoints REST para flujo principal.

Ajuste humano: se alineó con flujo E2E.

---

**Prompt 2:**

Simplificá la API.

Ajuste humano: se eliminaron endpoints innecesarios.

---

**Prompt 3:**

Convertí a formato tabla.

Ajuste humano: se mejoró claridad.

---

## 5. Historias de usuario

> Definición funcional.

---

**Prompt 1:**

Generá historias de usuario.

Ajuste humano: se validó coherencia.

---

**Prompt 2:**

Agregá criterios de aceptación.

Ajuste humano: se hicieron testeables.

---

**Prompt 3:**

Limitá cantidad.

Ajuste humano: se respetó alcance MVP.

---

## 6. Tickets de trabajo

> Planificación técnica.

---

**Prompt 1:**

Convertí historias en tickets.

Ajuste humano: se alinearon a tareas reales.

---

**Prompt 2:**

Refiná tickets.

Ajuste humano: se hicieron accionables.

---

**Prompt 3:**

Asegurá trazabilidad.

Ajuste humano: se verificó consistencia.

---

## 7. Pull requests

> Estrategia de entregas.

---

**Prompt 1:**

Definí estrategia de PRs.

Ajuste humano: se alineó al curso.

---

**Prompt 2:**

Generá nombres de ramas.

Ajuste humano: se adaptó naming.

---

**Prompt 3:**

Redactá descripciones de PR.

Ajuste humano: se mejoró claridad.

---

## 8. Resumen de avance y prompts de arranque

> Antes de iniciar implementación, se documenta qué ya quedó definido y qué nuevos prompts se usarán para arrancar desarrollo con foco en el MVP.

### 8.1 Resumen de lo que ya hicimos

Estado actual consolidado:

- Se definió y ajustó el contexto del proyecto en `project_context.md`.
- Se definió una arquitectura limpia y funcional en `architecture.md`.
- Se consolidó stack fullstack TypeScript con Node + React + PostgreSQL en `tech_stack.md`.
- Se dejó planificación local por tickets y sprints (`planning/local-kanban.md` y `planning/plan-inicial-mvp.md`).
- Se creó un marco de trabajo de agentes/rules/skills en modo lean para ejecutar el MVP sin sobreingeniería.
- Se incorporó foco en confiabilidad de salida IA (contrato de estimación y validación de parsing).

Decisiones clave que impactan implementación:

- Arquitectura cliente-servidor simple, sin microservicios en MVP.
- Backend funcional (sin clases), modular por funciones.
- Integración de IA desde backend únicamente.
- Estrategia de test IDs en frontend para automatización posterior.
- Flujo E2E único como prioridad de entrega.

---

### 8.2 Prompts nuevos para iniciar construcción

> Estos prompts extienden los anteriores y sirven para pasar de diseño a ejecución técnica.

---

**Prompt 1 (Kickoff técnico por sprint):**

Actuá como Tech Lead de un MVP fullstack.

Con base en `README.md`, `project_context.md`, `architecture.md`, `tech_stack.md` y `planning/local-kanban.md`, armá un plan de ejecución para **Sprint 1** con:

- orden de implementación por ticket (T01, T02, T05, T06)
- dependencias entre tareas
- definición de done por ticket
- riesgos técnicos por tarea
- checklists de validación rápida

No propongas features fuera del MVP.

Ajuste humano: se busca arrancar construyendo primero el flujo base persistente y validable de punta a punta.

---

**Prompt 2 (Arquitectura funcional backend):**

Actuá como Backend Developer senior.

Diseñá la estructura inicial del backend en Node + Express + TypeScript + Prisma usando un enfoque **100% funcional** (sin clases), incluyendo:

- estructura de carpetas
- responsabilidades por módulo
- contratos de entrada/salida
- estrategia de validación
- estrategia de manejo de errores

Debe quedar lista para implementar:

- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `POST /projects/:id/estimate`

Ajuste humano: se prioriza claridad y mantenibilidad sobre patrones complejos.

---

**Prompt 3 (Contrato de salida IA y parser):**

Actuá como AI Estimation Engineer.

Definí un contrato de salida estricto para la estimación IA que incluya:

- fases
- esfuerzo por rol
- tokens estimados
- costo estimado
- supuestos
- riesgos

Además, devolvé:

- reglas de validación del contrato
- estrategia de normalización
- estrategia de fallback cuando la respuesta sea incompleta o inválida
- casos de prueba mínimos para parser/validador

Ajuste humano: este prompt reduce la variabilidad del modelo y previene errores en el reporte.

---

**Prompt 4 (Frontend con test IDs):**

Actuá como Frontend Developer.

Diseñá los componentes y flujo de frontend para el MVP (crear proyecto, casos de uso, roles, reporte), incluyendo una convención obligatoria de `data-testid` para automatización futura.

Definí:

- árbol de componentes
- estado local por pantalla
- puntos de integración API
- estados de loading/error/empty
- lista de `data-testid` sugeridos por pantalla

Ajuste humano: se prepara el frontend para E2E robusto sin depender de texto visual.

---

**Prompt 5 (Plan de testing mínimo viable):**

Actuá como QA Engineer.

Definí un plan de testing MVP con cobertura mínima obligatoria para:

- unit tests
- integration tests
- E2E del flujo principal

Incluí:

- casos felices
- casos de error
- criterios de bloqueo para merge
- riesgos de regresión más probables

Ajuste humano: se evita sobretestear, pero se protege el flujo crítico completo.

---

**Prompt 6 (Deploy y secretos):**

Actuá como DevOps Engineer para MVP.

Proponé una estrategia mínima de despliegue para frontend y backend con PostgreSQL gestionado, incluyendo:

- variables de entorno requeridas
- pipeline básico de CI
- validaciones previas a deploy
- plan de rollback simple

No incluyas infraestructura enterprise ni complejidad innecesaria.

Ajuste humano: el objetivo es salir a producción temprana con control básico de riesgo.

---

### 8.3 Prompt maestro de ejecución diaria

**Prompt maestro:**

Actuá como Orchestrator de este repositorio.

Tomá el siguiente ticket del `planning/local-kanban.md`, validá contexto en `README.md`, `project_context.md`, `architecture.md` y `tech_stack.md`, y devolvé:

- plan técnico breve
- archivos a crear o modificar
- criterios de aceptación verificables
- tests mínimos a incluir
- riesgos y mitigaciones

Mantené foco estricto en MVP y no agregues alcance nuevo.

Ajuste humano: permite operar ticket por ticket con consistencia y trazabilidad.
