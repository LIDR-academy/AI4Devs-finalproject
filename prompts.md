> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Sistema multi-agente de desarrollo](#8-sistema-multi-agente-de-desarrollo)

> **Nota metodológica:** en este proyecto la IA intervino en dos planos. (1) **Fase de definición** (producto, arquitectura, backlog): prompts directos a un LLM con role-playing experto, documentados abajo. (2) **Fase de implementación**: un sistema multi-agente autónomo ([Multi-Agent-AI-Ecosystem](https://github.com/Jonnhyx/Multi-Agent-AI-Ecosystem)) ejecutó los tickets — en esta fase, **el prompt de cada desarrollo era el propio ticket** (estructura de 10 puntos con user story, criterios de aceptación y edge cases), inyectado por los agentes a Claude Code CLI. Ver sección 8 y [`docs/sistema-agentes.md`](docs/sistema-agentes.md).

---

## 1. Descripción general del producto

**Prompt 1 — Concepción y análisis de viabilidad (inicio del proyecto):**

```
Actúa como un Senior Lead Developer & Experto en Monitorización (Zabbix/SNMP) con
especialidad en Orquestación de Agentes IA.

Contexto: Queremos desarrollar OBJ 1 · Motor generación automática plantillas como un
MUP en 30 horas que automatice la creación de plantillas de Zabbix 6. El sistema debe
recibir un fichero MIB y un string de contexto (ej: "Cisco Catalyst Switch") y devolver
un fichero YAML/XML listo para importar en Zabbix.

Tu misión es diseñar la arquitectura y el flujo de trabajo para este MUP, considerando
los siguientes agentes:
- Agente Analista de MIBs: parsear el fichero, identificar los OID críticos, sus tipos
  de datos y descripciones.
- Agente Estratega de Monitorización: según el tipo de equipo, decidir qué métricas son
  "imprescindibles" (CPU, Memoria, Tráfico, Sensores) basándose en mejores prácticas.
- Agente Arquitecto Zabbix: mapear los OIDs seleccionados al formato oficial de Zabbix 6.

Requerimientos del Plan (Entregables):
- Análisis de Viabilidad en 30h: prioriza qué funciones son "Core" y cuáles quedan como
  "Skills" futuras (Triggers complejos, Discovery rules, Node-RED).
- Definición de Salida: cómo estructurar el prompt del "Agente Arquitecto" para que el
  YAML de Zabbix no dé errores de validación.
- Diseño de Escalabilidad: añadir protocolos (Modbus, OPC-UA), chat de iteración,
  perfiles de usuario para telemetría.

Criterio de éxito: generar al menos 5 items básicos correctamente mapeados en menos de
2 minutos de procesamiento. ¿Puedes desglosar el plan de ejecución de 30 horas y la
estructura de prompts para estos agentes?
```

*Cómo guié al asistente:* partí de una necesidad real de mi empresa con requisitos concretos (30 h, Zabbix 6, MIB como input) y un criterio de éxito medible. El role-playing doble (experto en monitorización + orquestación de agentes) forzó respuestas en ambos dominios. Tras el análisis, le pasé un repositorio de referencia (SNMP2ZABBIX) para aterrizar la parte técnica del parsing.

**Prompt 2 — Generación del PRD:**

```
Actúa como un Lead Product Manager y Senior Solution Architect.

Contexto del Proyecto: Vamos a desarrollar un MUP llamado "Zabbix AI Template Generator".
El sistema permitirá cargar un fichero MIB y un contexto de texto (ej. "Firewall
Fortinet") para que un sistema multi-agente genere automáticamente plantillas de
Zabbix 6 (YAML). El proyecto debe ser escalable para soportar protocolos industriales
(Modbus/OPCUA) y telemetría de usuario en el futuro.

Tu objetivo es generar exclusivamente los siguientes dos artefactos:

1. Documentación Técnica del Producto
   - Visión y Objetivos: qué resolvemos y qué no (scope-in vs scope-out para 30h)
   - Arquitectura del Sistema: flujo de datos (MIB → LLM Parser → JSON Intermedio →
     Zabbix YAML) y la interacción de los 3 agentes
   - Modelo de Datos: esquema básico (PostgreSQL/MongoDB) para metadatos del fichero,
     perfil de usuario y métricas de refinamiento
   - Escalabilidad: cómo se insertarán las "Skills" de Modbus/OPCUA y Node-RED

2. Historias de Usuario y Backlog de Trabajo
   - User Stories con Criterios de Aceptación, tickets de trabajo, trazabilidad a
     componentes de la arquitectura, y prioridad MoSCoW para encajar en 30 horas
```

*Cómo guié al asistente:* el primer PRD no era lo que buscaba. En vez de reescribir el prompt a ciegas, le pregunté **qué es un PRD y qué suele contener**, y le pedí que **contrastase su propio documento contra esa definición** para señalar qué tenía y qué faltaba. Ese patrón de auto-crítica dirigida produjo la estructura final. Después iteré casos de uso, arquitectura y roadmap hasta el PRD v1.0.

**Prompt 3 — Auditoría de coherencia PRD ↔ Backlog:**

Con el desarrollo avanzado, pedí una auditoría de trazabilidad entre PRD y backlog que destapó inconsistencias internas (el round-trip aparecía como entregable en unas secciones y como no implementado en otras; el modelo de ejecución era ambiguo entre síncrono y worker). El resultado fueron dos decisiones formales (ADR-013: validación local en v1.0, round-trip diferido; ADR-014: asíncrono 202+polling) propagadas a PRD, backlog y diagramas.

*Cómo guié al asistente:* auditoría con mandato explícito de señalar contradicciones, no de resumir. Las resoluciones las decidí yo; el asistente propagó el cambio a todos los documentos afectados manteniendo la coherencia.

---

## 2. Arquitectura del Sistema

### 2.1. Diagrama de arquitectura

**Prompt 1 — Decisión de infraestructura con pensamiento crítico (Nginx vs Traefik):**

```
Actúa como un Arquitecto de Software Principal con más de 15 años de experiencia en
infraestructura, sistemas distribuidos y alta disponibilidad. Eres pragmático, escéptico
con las modas tecnológicas y priorizas la mantenibilidad a largo plazo, el rendimiento
y la sobrecarga operativa (Ops overhead).

Contexto: Estamos trabajando en el proyecto "Muugen". Asume este contexto.

Tu Tarea: evaluación técnica rigurosa y crítica para decidir el Reverse Proxy / Ingress
ideal para Muugen. Opciones: Nginx y Traefik.

Estructura obligatoria de la respuesta:
1. Análisis de Características y Trade-offs (tabla comparativa orientada a Muugen)
2. Ajuste Arquitectónico: cómo se adapta cada tecnología a NUESTRO proyecto, no en general
3. Veredicto Ejecutivo: decisión rotunda, prohibido decir "depende"
4. Pensamiento Crítico y Abogado del Diablo: cuestiona tu propia decisión — debilidades
   y riesgos ocultos de la opción elegida, ¿en qué escenario sería un fracaso?

Estilo: directo, analítico, profundamente técnico y brutalmente honesto.
```

*Cómo guié al asistente:* dos mecanismos deliberados — **prohibir el "depende"** (obligando a una decisión con responsabilidad) y **exigir el abogado del diablo** sobre su propia elección, que es donde aparecen los riesgos reales. Este patrón se reutilizó para otras decisiones (PostgreSQL host vs Docker, compose único vs separados), todas registradas como ADRs con alternativas y consecuencias.

**Prompt 2 — Diagramas técnicos (C4, secuencias, E-R):** a partir del PRD aprobado, se generó el anexo técnico completo (diagramas C4 de contexto/contenedores/componentes, secuencias del happy path/self-healing/dedup, y E-R) en Mermaid, iterando hasta que cada diagrama reflejara las decisiones de los ADRs. La instrucción clave fue mantener los diagramas **como fuente derivada de los ADRs**, no al revés: cada revisión de un ADR obligaba a propagar el cambio a los diagramas afectados y a registrarlo en un changelog.

### 2.4. Infraestructura y despliegue

**Prompt 1:** el ticket MUU-002 (provisión AlmaLinux: Nginx + PostgreSQL + Certbot nativos) y MUU-018/019/020 (Docker, compose, Nginx SSL) fueron ejecutados por el `devops_agent` del sistema multi-agente — el ticket completo, con sus criterios de aceptación y edge cases, era el prompt. El script resultante (`infra/setup-server.sh`) es idempotente y renderiza la configuración de Nginx desde plantilla.

### 2.5. Seguridad

**Prompt 1 — Auditoría de seguridad (julio 2026):** se solicitó una auditoría del modelo de autenticación que concluyó en un endurecimiento: eliminar el pre-check del token en Nginx (dos copias del secreto que mantener sincronizadas), convertir la aplicación en el único autenticador, y sustituir la cookie con el token en crudo por una **cookie de sesión firmada con expiración** (HMAC-SHA256). El razonamiento y la resolución están documentados en [`docs/post-mvp-deviations.md`](https://github.com/Jonnhyx/muugen/blob/main/docs/post-mvp-deviations.md) (D-1, D-7).

### 2.6. Tests

**Prompt 1 — Patrón de diagnóstico manual de tests (usado en SCRUM-30 y SCRUM-31):** cuando la fase de auto-corrección de los agentes se agotaba, el patrón de trabajo con el asistente fue: (1) instalar el paquete en el workspace para destapar los fallos reales (sin ello, solo aparecen errores de colección engañosos), (2) pedir el diagnóstico de causa raíz test a test — nunca "arregla los tests" a ciegas, sino "explícame por qué falla este assert concreto", (3) validar cada parche en un sandbox aislado antes de aplicarlo (compilación + verificación de que el reemplazo casa exactamente una vez), (4) commit con el diagnóstico documentado para el revisor. Ejemplos reales: un `AsyncMock` sin `return_value` que devolvía mocks en lugar de strings, y asserts estrictos que no toleraban el newline final legítimo de un YAML.

---

## 3. Modelo de Datos

**Prompt 1:** el modelo inicial se definió dentro del prompt del PRD (sección "Modelo de Datos": esquema para metadatos del fichero cargado, perfil de usuario y métricas de refinamiento), y se refinó en el anexo de diagramas como E-R completo con claves, restricciones e índices justificados por las queries de trazabilidad y dedup.

**Prompt 2:** la implementación (ticket MUU-003) la ejecutó el `backend_agent` con el ticket como prompt: Alembic, migración inicial de 5 tablas, constraints UNIQUE (slug/email/hash), `ON DELETE` por entidad (CASCADE/RESTRICT/SET NULL) e índices. El esquema evolucionó después con 9 migraciones incrementales (leasing del worker, identidad del ingeniero, duraciones por etapa), validando la elección de migraciones versionadas.

**Prompt 3 — Acotación por auditoría:** la auditoría PRD↔Backlog sacó del MVP el schema de aprendizaje (`learning_events`, vista materializada) hacia un ticket v1.1 (MUU-027), evitando construir tablas sin consumidor — decisión humana de alcance sobre una propuesta del asistente que tendía a construirlo todo.

---

## 4. Especificación de la API

**Prompt 1 — Resolución del modelo de ejecución (ADR-014):** la ambigüedad del contrato original (respuesta síncrona con resultado completo vs worker asíncrono) se resolvió pidiendo al asistente el análisis de las tres alternativas (síncrono / worker+cola / async in-process) con sus consecuencias sobre timeouts de Nginx y navegador. Decisión final: `POST /generate` → `202 {generation_id}` + polling de `GET /generations/{id}` — el contrato que la UI consume.

**Prompt 2:** los endpoints (MUU-011, MUU-012, MUU-023, MUU-024) los implementaron los agentes con los tickets como prompt; la referencia de la API con ejemplos curl ([`docs/api-examples.md`](https://github.com/Jonnhyx/muugen/blob/main/docs/api-examples.md)) forma parte de la documentación generada del producto.

---

## 5. Historias de Usuario

**Prompt 1 — Generación del backlog completo:**

```
Actúa como un Senior Product Manager experto en metodologías Ágiles (Scrum/Kanban).
Tu objetivo es desglosar el MVP en un backlog técnico de tickets de trabajo listos
para desarrollo (Ready for Development).

Genera un documento con los tickets necesarios. Cada ticket debe seguir estrictamente
esta estructura de 10 puntos:
1. Título: formato "[Componente] - Acción clara"
2. Descripción Detallada: User Story (Como [rol], quiero [acción], para [valor]) y el
   problema técnico/de negocio que resuelve
3. Criterios de Aceptación: checklist con escenarios "Happy Path" y casos de borde
4. Prioridad: MoSCoW
5. Estimación: Puntos de Historia (Fibonacci) justificando la complejidad
6. Asignación Sugerida: perfil (Frontend, Backend, DevOps, QA, UX/UI)
7. Etiquetas: tipo y área
8. Comentarios/Notas: riesgos y dependencias
9. Enlaces/Referencias
10. Historial de Cambios

Restricciones: tono profesional, técnico y extremadamente preciso. No acepto
generalidades. Si el ticket es sobre un login, quiero detalles sobre manejo de tokens
o validaciones de errores. Si un ticket depende de otro, indícalo claramente.
```

*Cómo guié al asistente:* la estructura de 10 puntos no es estética — cada ticket debía ser ejecutable **sin contexto adicional**, porque su destino era servir de prompt a los agentes de desarrollo. El "no acepto generalidades" con ejemplo concreto (login → tokens) elevó el nivel de detalle de los edge cases. Resultado: 27 tickets, 108 puntos, con dependencias explícitas.

---

## 6. Tickets de Trabajo

**Prompt 1 — Creación de los tickets en Jira vía MCP:**

```
Actúa como un PM Técnico con permisos de escritura en Jira a través de MCP.
Objetivo: genera los tickets del backlog en el proyecto, como Task, con el
identificador MUU-NNN al inicio del título, la descripción completa del backlog
(user story, criterios de aceptación, prioridad, estimación) en formato markdown,
y estado inicial "To Do".
```

*Cómo guié al asistente:* la integración MCP con Jira permitió pasar del documento de backlog a tickets reales sin transcripción manual. Cada ticket conserva la trazabilidad MUU-NNN ↔ SCRUM-NN. Durante el desarrollo, el asistente también registró worklogs con los diagnósticos y decisiones de cada intervención manual — que constituyen el registro histórico del criterio humano aplicado.

**Prompt 2 — Tickets de bugs desde el despliegue real:** los bugs detectados al validar el MVP en producción (reintento infinito del worker ante un MIB desaparecido, crash de la UI ante un item sin categoría, healthcheck mal configurado, contrato de items incompleto) se registraron como tickets con síntoma, causa raíz, reproducción y fix propuesto — redactados por el asistente a partir del diagnóstico conjunto de los logs.

---

## 7. Pull Requests

**Prompt 1 — El prompt de implementación de los agentes:** cada PR del repositorio fue abierto por un agente cuyo prompt operativo era el ticket completo más las convenciones del proyecto (tests obligatorios, cobertura mínima, lint). La fase de auto-corrección usa un prompt acotado del estilo:

```
[El agente, ante tests en rojo:]
4. Fix the bug. To verify quickly, run ONE specific test:
   pytest <path>::<TestClass>::<test_name> -v --tb=short
5. Then run `make test` to confirm the whole suite passes.
Do NOT make git commits. Do NOT modify the test if the code is broken.
```

*Cómo se guió:* las dos restricciones finales son las importantes — prohibir commits (el commit lo hace el agente tras verificar, no el LLM) y prohibir "arreglar" tests para que pasen cuando el roto es el código, que es el atajo típico que degrada la calidad.

**Prompt 2 — Revisión automática de PRs:** el `reviewer_agent` clona el PR, extrae los ficheros cambiados y pide a Claude una revisión con veredicto (aprobar / solicitar cambios). El criterio humano fijó sus límites operativos: presupuesto de turnos, y la lección de que PRs muy grandes (100+ ficheros) exceden lo revisable automáticamente y deben pasar a revisión humana.

---

## 8. Sistema multi-agente de desarrollo

**Prompt 1 — Diseño del ecosistema de agentes:**

```
Role: Actúa como un Senior AI Platform Architect especializado en flujos de trabajo
autónomos y orquestación de agentes (DevOps + AI Ops).

Contexto: Estamos en la fase "Zero" del MVP de Muugen. Ya tenemos el PRD y el Backlog
definidos. El objetivo es integrar un "Pack de Agentes de Desarrollo
(Multi-Agent-AI-Ecosystem)" en nuestro servidor de desarrollo para que asuman la
ejecución de los tickets del backlog de forma eficiente.

Tarea: Diseña el Plan de Integración Técnica para desplegar estos agentes.
Tu respuesta debe incluir:
1. Mapeo de Roles vs. Backlog: qué agente es responsable de cada tipo de tarea
2. Protocolo de Comunicación: cómo se comunican los agentes entre sí y con el servidor
   (Webhooks, CLI, o cola de mensajes como RabbitMQ/Redis)
3. Configuración del Entorno: permisos, dependencias y variables necesarias
4. Workflow de Ejecución del Primer Ticket: paso a paso desde el trigger hasta el
   Merge Request
5. Sistema de Observabilidad: método para supervisar logs y decisiones en tiempo real

Constraints: prioriza la seguridad (gestión de secretos), compatibilidad con el stack
de Muugen, arquitectura escalable para añadir más agentes.
```

*Cómo guié al asistente:* el diseño resultó en el sistema descrito en el [anexo del readme](readme.md#anexo-metodología-de-desarrollo-asistido-por-ia): orquestador + 7 agentes especializados + Redis Streams + Claude Code CLI + PRs con revisores automáticos y notificaciones Slack. Requirió varias iteraciones para el despliegue correcto (systemd por instancia, workspaces efímeros, gestión de credenciales).

**Prompt 2 — Operación y mejora del sistema:** durante el desarrollo, el propio sistema requirió mantenimiento con criterio humano: purga de colas preservando consumer groups, corrección del detector de rate-limit del CLI (no reconocía la variante "session limit" y marcaba como fallo permanente lo que era recuperable), re-autenticación de sesiones caducadas, y ajuste del presupuesto de turnos del revisor. Cada incidencia siguió el mismo patrón: diagnóstico sobre logs reales → parche mínimo validado en sandbox → verificación con los servicios reiniciados.

*Detalle completo del funcionamiento, fallos e intervenciones:* [`docs/sistema-agentes.md`](docs/sistema-agentes.md) · *Código del sistema:* https://github.com/Jonnhyx/Multi-Agent-AI-Ecosystem