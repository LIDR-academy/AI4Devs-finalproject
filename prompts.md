# Prompts — SIGNAL//BLACK

## Contexto y método

**Origen.** El proyecto parte de un **prototipo de interfaz previo** (la base "desk2" del *Analyst Desk*): una maqueta jugable del escritorio del analista. El trabajo del máster es **reconstruir ese slice bien hecho** —con backend, base de datos, modelo, tests y despliegue— aplicando la metodología del curso. Por eso en los prompts se habla de "desk2"/"v2": es la base de la que partimos, no algo creado de cero.

**Método (importante).** El diseño NO se hizo con unos pocos prompts "de un tiro", sino en una **conversación iterativa** con el asistente (Claude). Por eso los "prompts clave" de abajo son las **peticiones y decisiones reales** de esa conversación —dirigidas, corregidas y validadas paso a paso—, no prompts idealizados a posteriori. La nota de *cómo guié* refleja la intervención humana en cada caso.

Herramientas: **Claude (Claude Code)** para diseño/documentación y análisis del código; **ChatGPT** para borradores del diseño narrativo del prototipo.

---

## 1. Producto

**Prompt 1 — Encuadre del proyecto (real).**
> "Lee la documentación del máster sobre el proyecto final y ayúdame a implementarlo. Quiero usar mi juego SIGNAL//BLACK, pero hacerlo *bien* (no *vibe coding*): reconstruir el flujo de la v2 con las ideas claras."

*Cómo guié:* fijé el producto (SignalBlack), el repo de código privado por IP, y el principio rector (reconstruir bien, no improvisar).

**Prompt 2 — Especificación del slice (ACTUAL vs ESPERADO).**
> "Necesito una spec del MVP 'desk2' separando **[ACTUAL]** (lo que ya funciona) de **[ESPERADO]** (lo diseñado pero no construido): flujo del jugador, reloj, operaciones, dossier, marcar texto, commit y finales, contenido del caso, modelo de datos. Si algo no está decidido, dilo."

*Cómo guié:* forcé a distinguir lo construido de lo aspiracional para no documentar humo.

**Prompt 3 — Objetivo y propuesta de valor (con límite de IP).**
> "Redacta el objetivo y la propuesta de valor para público de *investigation games* (Obra Dinn, Her Story…), **sin** revelar el plan de negocio ni el contenido de los casos."

---

## 2. Arquitectura

**Prompt 1 — Comunicación cliente-servidor (real).**
> "Discutamos cómo irá la comunicación cliente-servidor. El juego es hoy frontend-only con la verdad en el cliente; el máster exige backend + BD."

*Cómo guié:* di el criterio temático (es un juego de **información oculta**) → derivó en **servidor autoritativo** (la verdad no viaja al cliente hasta ganarse).

**Prompt 2 — El reloj sin "tic" (real).**
> "El reloj no debe avanzar por un tic del servidor cada segundo. Hay un punto inicial y se sabe cuántos minutos han pasado; el cliente avanza solo hasta cierto punto y se para a preguntar; cada llamada debe decirle hasta dónde puede avanzar; al cerrar el navegador, volver al mismo punto de tiempo."

*Cómo guié:* describí el comportamiento deseado; el asistente lo formalizó como **scheduler de eventos discretos** con horizonte (`nextEventAt`) + **reloj derivado** (sincronizado por origen, no por tic).

**Prompt 3 — Stack y correcciones de los diagramas (real).**
> "El backend con **Clean Architecture** (Spring Boot + PostgreSQL)." Y correcciones puntuales: "en el diagrama de contenedores, el **SPA** habla HTTPS con el servidor, no el analista"; "el enlace backend↔BD es **JDBC**, no JPA".

*Cómo guié:* corregí los diagramas a mano hasta que reflejaron la arquitectura real.

---

## 3. Modelo de datos

**Prompt 1 — ER con dos dominios + tipos.**
> "Genera el ER (Mermaid) separando **contenido del caso** (verdad, solo lectura) de **estado de sesión** (mutable), con atributos y **tipos SQL/constraints**, en el estilo de las soluciones de referencia del máster."

**Prompt 2 — Las decisiones que afinaron el modelo (reales, iterativas).**
> Serie de correcciones mías a lo largo de la conversación: "el extracto debe guardar su `start/end` y comparar **offsets**, no buscar el texto"; "el **idioma** se fija al empezar y no se puede cambiar"; "hay que saber de qué idioma es cada documento → tablas de texto"; "la misma evidencia canónica puede aparecer en **dos documentos**"; "a la evidencia le falta un **título**"; "**descartar, no borrar**: si ya actuaste o avanzó el tiempo, no se reescribe la historia"; "quitar la creación libre: el jugador **solo revela**"; "**unifica la pregunta como nodo**".

*Cómo guié:* el modelo creció por **iteración dirigida** — cada decisión la propuse o corregí yo, no salió de un único prompt. (Decisiones guardadas en `docs/signal_black_evidence_match_algorithm.md` y `docs/signal_black_reversibility_and_undo.md`.)

**Prompt 3 — Validar el modelo con una partida (real).**
> "Recorramos una partida ficticia paso a paso y enlaza cada cosa con una entidad/campo y un endpoint. Detecta lo que el jugador puede hacer que **no** esté modelado."

*Cómo guié:* validé contra una **partida concreta**, no en abstracto → afloraron huecos reales (`/answers` sin la selección, falta de *recall*, el registro de usuario invisible en los diagramas, tickets de frontend e infra que faltaban).

---

## 4. API

**Prompt 1 — Endpoints del flujo + delta + horizonte.**
> "Define los endpoints REST del flujo (sesión, documentos, evidencia, responder, operar, avanzar, dossier, commit); cada acción devuelve el **delta de estado** y el `nextEventAt`."

**Prompt 2 — Huecos detectados al trazar la partida (real).**
> "`/answers` tiene que enviar **la selección** que responde, no solo el id; falta poder **retirar (recall)** una operación; falta **elegir caso**; ¿de dónde salen las **acciones disponibles por nodo**?"

*Cómo guié:* estos huecos no salieron de un prompt sino de **recorrer la partida**; cada uno se cerró añadiendo el endpoint que faltaba.

---

## 5. Historias de usuario

**Prompt 1 — Generación en formato del máster.**
> "Genera las historias del flujo E2E en formato 'Como [rol], quiero…, para…', con criterios de aceptación en **BDD** y evaluación **INVEST**."

**Prompt 2 — Casos alternos, no solo happy path (real).**
> "Las historias deben cubrir no solo el *happy path*, sino también **casos alternos / de error**, como pide la lección de historias del máster."

*Cómo guié:* recordé ese requisito; revisamos las 12 historias y añadimos a las que iban solo por el camino feliz su criterio de error/edge.

---

## 6. Tickets de trabajo

**Prompt 1 — Tickets trazables con la plantilla del máster.**
> "Genera tickets con la plantilla de campos (descripción, criterios, prioridad, estimación, etiquetas, dependencias, testing, riesgos), **trazables** a la historia, separando backend y frontend."

**Prompt 2 — Completar y ordenar (real).**
> "Faltan **tickets técnicos** (crear la infraestructura) y **tickets de frontend**. Ordénalos por **orden de ejecución** y ponlos **enteros**, no resumidos."

*Cómo guié:* además detecté acciones solo-frontend sin ticket (shell de 5 zonas, barra de tensión, carril de hilos) recorriendo lo que el jugador puede hacer.

**Prompt 3 — Tests por ticket y estrategia de migraciones (real).**
> "Los tests no deberían ir en un ticket aparte, sino **dentro de cada ticket** (TDD), ¿no? Y el modelo: ¿se crea de antemano o **incremental** según la necesidad?"

*Cómo guié:* dos correcciones metodológicas mías → (a) testing como **Definición de Hecho por ticket** (solo el arnés + el E2E del flujo tienen ticket propio); (b) esquema de **contenido** de antemano (por el seed) y **estado de sesión incremental** por feature vía migraciones Flyway.

---

## 7. Reflexión sobre el uso de IA

Todo el proyecto se apoya en IA, pero el valor lo ha aportado el **criterio humano**: la IA acelera, pero ni decide ni garantiza que lo que produce sea cierto. Aprendizajes concretos de esta entrega:

**Dónde acertó la IA**

- Generó rápido borradores estructurados (descripción de producto, historias en formato INVEST + BDD, tickets, diagramas Mermaid) que a mano me habrían llevado horas.
- Analizó el código existente para separar lo realmente implementado de lo solo diseñado.
- Formalizó decisiones de arquitectura (servidor autoritativo, *scheduler* de eventos discretos para el reloj) a partir de los criterios que yo le di.

**Dónde tuve que corregir (lo importante)**

- **El grafo lo construye el jugador.** Al implementar la interfaz, un asistente rellenaba automáticamente ~9 nodos en el grafo de conocimiento — justo lo contrario al principio del juego (*el sistema nunca resuelve por ti*). Tuve que reafirmarlo y recuperar la **bandeja de entrada**, que se había omitido. *Antes:* grafo autocompletado. *Después:* el jugador extrae las entidades de los documentos y puede recuperarlos.
- **Documentación que "mentía".** Varios documentos de diseño daban por implementadas cosas que no lo estaban, y convivían dos diseños contradictorios. Antes de documentar, **verifiqué cada afirmación contra el código** (marcando ACTUAL vs. ESPERADO).
- **No fiarme del formato genérico.** En vez de aceptar el README que sale "por defecto", lo **contrasté con las soluciones de referencia del máster** y aparecieron carencias concretas (modelo de datos sin tipos, falta de OpenAPI, historias sin prioridad/puntos) que corregí.
- **Disciplina de alcance.** La IA tiende a proponer de más (más *features*, arquitecturas más grandes). Recorté para ajustarme a las ~30h y para no exponer IP del producto comercial.
- **Quitar la creación libre.** La IA arrastraba "crear evidencia/entidad libre" del prototipo, pero en el loop actual no aporta nada (solo ensucia el grafo). Decidí que **el jugador solo revela**; lo no canónico va a una **nota personal** y el **mentor** avisa. Simplificó el modelo (fuera los "nodos del jugador").
- **Match por offsets, no por texto.** Propuse que el extracto guarde su `start/end` y comparar intervalos, en vez de buscar la frase con `indexOf` (frágil si una frase se repite). La IA lo había planteado peor.
- **Descartar, no reescribir la historia.** Si ya actuaste o avanzó el tiempo, una evidencia no puede desaparecer (rompería la coherencia): se **atenúa**, no se borra; el borrado real solo si la marca está "fresca".
- **Auditoría de localización.** Detecté campos de texto autorado guardados *inline* que debían ir a la tabla de traducción; separé contenido bilingüe (`CONTENT_TEXT`) de texto de sesión (inline, idioma fijo e inmutable).

**Comparativa antes / después**

| | IA sola | IA + criterio humano |
|---|---|---|
| Grafo | Autocompletado | El jugador lo construye + inbox |
| Documentación | Daba por hecho lo no implementado | Verificada contra el código |
| Formato | Genérico | Alineado con las soluciones del máster |
| Alcance | Tendencia a inflarse | Acotado y realista (30h) |
| Creación en el grafo | Libre (ruido) | Solo revelar + nota personal |
| Validación | En abstracto | Contra una partida ficticia (destapó huecos) |

**Conclusión:** la IA es un multiplicador, no un sustituto del criterio. El mayor valor humano fue **decir que no** (al autocompletado, al formato genérico, al sobre-alcance) y **verificar** (código y referencias) antes de dar nada por bueno.
