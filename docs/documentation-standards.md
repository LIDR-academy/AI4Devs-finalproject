---

## description: Estándares y buenas prácticas para la documentación técnica de ConRutina, incluyendo estructura, procesos de actualización y reglas de idioma.
globs:
alwaysApply: true

# Reglas y patrones para documentación y especificaciones de IA — ConRutina

## Introducción

La **documentación técnica** abarca todo el material que describe cómo está estructurado, ejecuta y opera el proyecto: modelo de datos, README, especificación API, guías de desarrollo y demás ficheros en `docs/`.

Las **especificaciones para IA** (AI specs) son las reglas que indican a los agentes cómo documentar, planificar, codificar y verificar cambios. Incluyen acuerdos de equipo, estándares y convenciones (p. ej. [base-standards.md](./base-standards.md), estándares backend/frontend, pasos OpenSpec).

Este documento complementa la sección de idioma de [base-standards.md](./base-standards.md) con reglas concretas de mantenimiento documental.

---

## Reglas generales de idioma

### Documentación en `docs/`

- Escribir **siempre en español**: títulos, párrafos, listas, tablas y explicaciones.
- **Excepciones** (mantener en su forma técnica original):
  - Identificadores de código, rutas de ficheros, comandos shell, nombres de paquetes y versiones.
  - Bloques de código, esquemas OpenAPI (`summary`, `description` de campos técnicos pueden mezclar inglés en nombres de propiedades JSON).
  - Nombres de modelos Prisma y campos de base de datos (convención del ORM en inglés).
- Los **ejemplos orientados al usuario** (respuestas de error, textos de UI) deben estar en **español**, alineados con la aplicación.

### Código y comentarios

- Identificadores en **inglés** (TypeScript/React).
- Comentarios en código: **español** cuando expliquen lógica de negocio o decisiones no obvias; inglés breve aceptable para detalles puramente técnicos.
- Mensajes de error/logs visibles al usuario u operador: **español**.

### Coherencia entre documentos

- Tras actualizar un fichero, revisar referencias cruzadas en el resto de `docs/`.
- Mantener la misma terminología de dominio en todos los documentos:
  - **Hábito**, **Recompensa**, **Perfil de usuario**, **Calendario semanal**, **Puntos**, **Penalización**, **Racha**.
- No duplicar información que ya está en [infrastructure.md](./infrastructure.md); enlazar cuando baste con una referencia.

---

## Conjunto de documentos en `docs/`


| Fichero                                                                  | Propósito                             | Idioma                   | Notas                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| [infrastructure.md](./infrastructure.md)                                 | Stack, arquitectura, comandos, Docker | Español                  | Documento de referencia de infraestructura; no modificar salvo petición explícita |
| [prd.md](./prd.md)                                                       | Requisitos de producto                | Español                  | Original del producto; no modificar salvo petición explícita                      |
| [product-backlog.md](./product-backlog.md)                               | Backlog ágil                          | Español                  | Original del producto; no modificar salvo petición explícita                      |
| [backend-standards.md](./backend-standards.md)                           | Estándares API/backend                | Español                  | Actualizar si cambian patrones, Prisma o scripts                                  |
| [frontend-standards.md](./frontend-standards.md)                         | Estándares UI/React                   | Español                  | Actualizar si cambian stack o convenciones frontend                               |
| [development_guide.md](./development_guide.md)                           | Instalación y flujo dev               | Español                  | Actualizar si cambia setup, `.env` o comandos npm                                 |
| [data-model.md](./data-model.md)                                         | Entidades y relaciones                | Español                  | Actualizar con cambios en Prisma o dominio frontend                               |
| [api-spec.yml](./api-spec.yml)                                           | OpenAPI REST                          | Español en descripciones | Nombres de rutas/campos JSON en inglés                                            |
| [base-standards.md](./base-standards.md)                                 | Reglas globales para IA               | Español                  | Reglas transversales del proyecto                                                 |
| [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md) | Checklist OpenSpec                    | Español                  | Pasos obligatorios en `tasks.md`                                                  |


---

## Documentación técnica: cuándo y cómo actualizarla

Antes de un commit, push, o cuando se pida documentar un cambio, **revisar siempre** qué documentación debe actualizarse.

### Proceso obligatorio para agentes de IA

1. **Revisar** los cambios recientes en el código (backend, frontend, Prisma, configuración).
2. **Identificar** qué ficheros de `docs/` están afectados. Ejemplos:
  - Cambio en `backend/prisma/schema.prisma` → [data-model.md](./data-model.md) y, si aplica, [backend-standards.md](./backend-standards.md).
  - Nueva o modificada ruta en `backend/src/presentation/http/` → [api-spec.yml](./api-spec.yml).
  - Cambio en dependencias, scripts npm, Docker o variables de entorno → [development_guide.md](./development_guide.md) y/o [backend-standards.md](./backend-standards.md) / [frontend-standards.md](./frontend-standards.md).
  - Cambio en convenciones de componentes o hooks → [frontend-standards.md](./frontend-standards.md).
  - Cambio en flujo OpenSpec o verificación manual → [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md).
3. **Actualizar** cada fichero afectado **en español**, manteniendo estructura y tono del documento existente.
4. **Verificar** coherencia interna: mismos endpoints, entidades, puertos y comandos en todos los docs tocados.
5. **No modificar** `infrastructure.md`, `prd.md` ni `product-backlog.md` salvo petición explícita del usuario.
6. **Informar** al usuario qué ficheros se actualizaron y un resumen breve del cambio documental.

### Formato y estilo

- Usar Markdown claro: títulos jerárquicos (`##`, `###`), listas y tablas cuando ayuden.
- Incluir diagramas Mermaid cuando el documento los use ya (p. ej. modelo de datos, flujos).
- Enlaces relativos entre documentos de `docs/` (p. ej. `./api-spec.yml`).
- Orientar el contenido a **agentes de IA y desarrolladores**: pasos accionables, rutas reales del repo, comandos verificables.
- Evitar contenido genérico de otros proyectos.

### OpenAPI (`api-spec.yml`)

- `info.description`, `summary`, `description` de operaciones y schemas: **español**.
- Rutas (`/api/profile`), nombres de propiedades JSON y tags técnicos: mantener convención REST en inglés donde corresponda.
- Ejemplos de error alineados con el código real (p. ej. `"Usuario con id 1 no encontrado"`).

---

## Especificaciones para IA (AI specs)

Esta sección define un proceso para que la IA:

- Aprenda del feedback, correcciones y preferencias del usuario durante las interacciones.
- Detecte oportunidades de mejora en las reglas de desarrollo de forma proactiva.
- Mantenga la asistencia alineada con las necesidades evolutivas de ConRutina.
- Incorpore el feedback al marco operativo del agente.

Aplica tras cualquier interacción con feedback explícito o implícito, sugerencias, correcciones o nueva información. **La IA debe analizar activamente las interacciones en busca de aprendizajes**, no limitarse a esperar feedback directo.

### Anti-patrones a evitar

- **Saltarse la aprobación**: Modificar reglas sin revisión explícita del usuario.
- **Propuestas desvinculadas**: Sugerir cambios de reglas sin conectar con el feedback concreto recibido.
- **Modificaciones imprecisas**: No indicar qué regla o sección exacta debe cambiar.
- **Feedback ignorado**: No iniciar revisión cuando el usuario aporta información relevante para las reglas.
- **Scope creep**: Actualizar varias reglas no relacionadas o exceder el alcance del feedback.
- **Cambios no solicitados**: Modificar reglas sin conexión directa con feedback o aprendizaje; las actualizaciones deben ser reactivas y justificadas.
- **Sin confirmación**: No avisar al usuario tras implementar un cambio de reglas aprobado.

### Actualización de reglas vs. documentación técnica


| Tipo                                                            | Cuándo                                                   | Aprobación                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| Documentación técnica (`data-model.md`, `api-spec.yml`, guías…) | Tras cambios de código o infraestructura                 | No requiere aprobación previa; es parte del flujo de entrega |
| Reglas de IA (`base-standards.md`, este fichero, estándares…)   | Tras feedback del usuario sobre cómo debe trabajar la IA | **Requiere aprobación explícita** antes de modificar         |


---

## Referencias cruzadas obligatorias

Al documentar ConRutina, enlazar o mantener coherencia con:

- [Infraestructura](./infrastructure.md) — stack, puertos (5173 Vite, 3001 API), proxy `/api`, Docker PostgreSQL.
- [Modelo de datos](./data-model.md) — entidades del PRD (§5): `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`; estado de persistencia en PostgreSQL; mapeo provisional frontend (`Habit`/`Reward` en React). El modelo Prisma `Calendar` (LTI) no forma parte del dominio ConRutina.
- [Especificación API](./api-spec.yml) — endpoint actual `GET /api/profile`.
- [Pasos obligatorios OpenSpec](./openspec-tasks-mandatory-steps.md) — verificación manual y informes en `specs/<change-name>/reports/`.

---

*Documento alineado con ConRutina. Idioma principal de documentación: español. Ver también [base-standards.md](./base-standards.md).*