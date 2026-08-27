# prompts.md — Registro de uso de IA

**Proyecto:** CODEMIND
**Autora:** Cristina Rodríguez Núñez
**Máster:** AI4Devs — Proyecto Final

> Este documento recoge los prompts y workflows principales usados en la creación del proyecto, siguiendo la estructura de la plantilla oficial: máximo 3 prompts por sección, priorizando los de creación inicial y los de corrección o adición de funcionalidades más relevantes.
>
> Cada sección incluye además **qué ajustes humanos** hubo que hacer sobre la salida del modelo. Esa parte es deliberada: es donde se ve el criterio propio, y en varios casos es más informativa que el prompt.

---

## Índice

0. [Flujo de trabajo con IA](#0-flujo-de-trabajo-con-ia)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Lecciones sobre el uso de IA en este proyecto](#8-lecciones-sobre-el-uso-de-ia-en-este-proyecto)

---

# 0. Flujo de trabajo con IA

## 0.1. Herramientas y modelos por fase

| Fase | Herramienta | Modelo | Por qué ese |
|---|---|---|---|
| Definición y crítica de la propuesta | Claude (Cowork) | Opus | Razonamiento largo sobre un documento completo; necesitaba que sostuviera 40 páginas de contexto y detectara contradicciones entre secciones |
| Investigación de referencias | Claude (Cowork) con búsqueda web | Opus | Verificación de citas reales en vez de generarlas de memoria |
| Redacción de documentación técnica | Claude (Cowork) | Opus | Documentos largos con estructura fija |
| Diseño de esquema de datos y API | Claude (Cowork) | Opus | Decisiones con consecuencias en cascada |

Esta tabla recoge **solo las fases ya ejecutadas**, que en esta entrega son las de documentación. El reparto previsto para las fases de código —Cursor con Sonnet para implementación y tests, Claude Code con Opus para revisión de pull requests— se registrará aquí cuando se haya usado, en la Entrega 3.

**Criterio de reparto.** Opus para lo que tiene consecuencias difíciles de revertir —arquitectura, esquema de base de datos, decisiones de seguridad—; Sonnet para lo que es rápido de verificar y de rehacer —código, tests, refactors—. El coste de un error de Opus en el esquema de datos se paga durante semanas; el de Sonnet en una función se paga en cinco minutos.

## 0.2. Skills, subagentes y comandos personalizados

### El harness de trabajo

Antes de arrancar el desarrollo construí un **harness propio de Spec-Driven Development**, `sdd-harness-kit`, para no montar el andamiaje de trabajo con IA desde cero en cada proyecto. Es un instalable que deja en el repositorio destino 27 skills y 9 subagentes como fuente canónica en `ai-specs/`, 9 hooks deterministas del ciclo de vida, estándares por capa en `docs/`, adaptadores por stack y los cuatro ficheros de memoria de copiloto apuntando a una doctrina única. Su huella en este repositorio está descrita en la sección 2.3 del readme.

**Es un repositorio privado, así que no se puede enlazar aquí.** Lo digo explícitamente porque conviene: es la única afirmación de este documento que quien evalúa no puede comprobar por sí mismo. Lo que sí es verificable es su resultado, que está instalado y a la vista en este repositorio — `ai-specs/`, `.claude/hooks/`, los estándares de `docs/` y el `.mcp.json`.

**Procedencia.** El harness sale de los apuntes de las clases del máster y toma como punto de partida ideas de [`LIDR-academy/lidr-specboot`](https://github.com/LIDR-academy/lidr-specboot) (MIT), el repositorio de referencia del propio máster: la disposición de `ai-specs/` con skills y subagentes como fuente canónica, los estándares en `docs/`, y los cuatro ficheros de memoria apuntando a una doctrina única. Lo añadido por mí es el instalable con detección de stack, los 9 hooks deterministas, los adaptadores, el `doctor`, el soporte en Windows y los gates de secretos. Queda declarado en el `CREDITS.md` y el `LICENSE` del kit, que conserva el aviso de copyright de specboot.

**Lo que hubo que hacer para este proyecto.** El kit traía adaptadores para Laravel, AdonisJS y React, y CODEMIND es **Fastify sobre un monorepo hexagonal**: no había ninguno que sirviera. Escribí el adaptador `fastify`, y su guarda de arquitectura codifica la regla de dependencias de la sección 2.3 del readme — si un fichero de `packages/core` menciona `adapters/` o `analyzers/`, el hook avisa al guardar.

**Y aquí está la conexión con el producto**, que es lo que más me interesa señalar de todo este apartado. Los hooks del harness, según su propia documentación, *«actúan sobre la ruta del fichero, no sobre qué comando lo escribió»*. Es exactamente el razonamiento por el que CODEMIND verifica sus propias citas en lugar de pedirle al modelo que las aporte bien, y por el que la independencia del lenguaje es un test en CI y no un párrafo en el readme. **Tres veces la misma idea: no se le pide al modelo que cumpla, se monta un mecanismo que lo comprueba.** Que aparezca en mi herramienta de trabajo, en la arquitectura del producto y en el pipeline no es casualidad: es la única convicción técnica que sostiene el proyecto entero.

### Recursos concretos

**Usado en esta entrega:**

| Recurso | Tipo | Para qué |
|---|---|---|
| `critico-adversarial` | Subagente | Recibe una sección de documentación y devuelve solo objeciones, sin reformularla. Se usó sobre todas las secciones del readme |
| Adaptador `fastify` | Adaptador de stack del harness | Escrito para este proyecto: comandos, rutas de capa y guardas de arquitectura del monorepo hexagonal. Ya en el kit, aún no instalado en el repositorio |

**Previsto para las fases de código** (Entregas 2 y 3), aquí por decisión tomada, no por uso:

| Recurso | Tipo | Para qué |
|---|---|---|
| `/revisar-arquitectura` | Comando personalizado (Cursor) | Aplicar sobre un fichero la regla de dependencias: comprobar que `packages/core` no importe de `adapters`, `analyzers` ni `api`, y explicar cada violación |
| `verificador-de-evidencias` | Subagente | Ejecutar el proceso del Ticket 1 sobre respuestas de prueba, para validar el diseño antes de implementar el componente |
| Reglas de proyecto (`.cursorrules`) | Rules | Fijar el estilo: TypeScript estricto, sin `any`, errores como tipos y no como excepciones, y prohibición de importar infraestructura desde `core` |

**Nota sobre `critico-adversarial`.** Fue el recurso más rentable del proyecto. Pedir «mejora este texto» produce texto más largo; pedir «dame solo las objeciones, sin reescribir nada» produce los agujeros. Casi todos los cambios de fondo en la propuesta salieron de ahí.

## 0.3. Conversaciones completas

Las sesiones que originaron los prompts de este documento se archivan en `docs/ai-sessions/`, una por sesión de trabajo y con la fecha en el nombre. Los prompts que siguen se reproducen **literalmente**, tal como se enviaron: cuando una decisión posterior los deja desfasados, se dice en el «ajuste humano» en lugar de reescribir el prompt.

---

# 1. Descripción general del producto

### Prompt 1 — Crítica adversarial de la propuesta inicial

Contexto: había escrito una primera propuesta de 40 páginas y quería saber si se sostenía antes de invertir semanas en ella.

```
Actúa como un revisor exigente de propuestas de proyecto técnico.

Adjunto CODEMIND.md, mi propuesta de proyecto final.

No quiero que la mejores ni que la reescribas. Quiero que la audites y me
digas qué grietas tiene, ordenadas por gravedad: qué se cae en cuanto
alguien pregunte, qué es inconsistente entre secciones, y qué falta.

Presta atención específicamente a:
- afirmaciones que no puedo demostrar con lo que propongo construir
- contradicciones entre lo que declaro como principio y lo que planifico
- viabilidad técnica real de la extracción de código que doy por hecha
- si el alcance es ejecutable por una persona

Para cada grieta: qué es, por qué importa, y qué cambio concreto la cierra.
Si algo está bien, no lo menciones — no necesito validación, necesito los
problemas.
```

**Por qué funcionó.** Tres elementos: prohibir la reescritura, pedir orden por gravedad, y prohibir explícitamente el refuerzo positivo. Sin la última frase, la mitad de la respuesta habría sido «tu idea es sólida y…».

**Ajuste humano.** La auditoría fue correcta en el fondo pero **calibrada al objetivo equivocado**: me empujó hacia rigor académico —estado del arte con 25 referencias, hipótesis con umbrales estadísticos, validación de juez con κ de Cohen— porque mi documento estaba escrito con forma de tesis de investigación. No lo era. El error fue mío, por no dar el enunciado. Ver §1 Prompt 2.

### Prompt 2 — Corrección de rumbo con el enunciado real

```
Antes de seguir, lee TMF.docx: son las indicaciones oficiales que tengo para
construir y entregar este proyecto. Contiene enlaces; ábrelos también.

Después dime, sin suavizarlo:
1. En qué se desvía mi propuesta de lo que realmente se me pide.
2. Qué partes de tu revisión anterior dejan de ser válidas a la luz de esto.
3. Cuál es el calendario real y si mi alcance cabe en él.
```

**Por qué este prompt es el más importante del proyecto.** El punto 2 es el que lo hace útil: obliga al modelo a revisar su propio trabajo anterior en lugar de acumular recomendaciones sobre una premisa falsa. Sin él habría tenido dos capas de consejos incompatibles.

**Ajuste humano.** El resultado cambió el proyecto entero. El enunciado no pedía una tesis: pedía un MVP funcional evaluado por idea/arquitectura, calidad de código y uso de IA. Y el calendario era de 13 semanas, no de las 20 que se habían planificado. **Recorté el alcance a la mitad y reasigné todo el tiempo ganado a construir producto.** Aquí es donde tuve que decidir yo: el modelo había producido una propuesta más ambiciosa y mejor argumentada, pero inviable.

### Prompt 3 — Definición del valor diferencial

```
Necesito la sección 1.1 (Objetivo) del README.

Restricción: no puede describir CODEMIND como "un asistente que responde
preguntas sobre código". Eso ya existe. Tiene que dejar claro en un párrafo
qué hace este sistema que un asistente con RAG sobre el repositorio no hace.

Escribe primero, en una lista, los 3 o 4 comportamientos concretos y
verificables que lo diferencian. Después el texto.
No uses las palabras "revolucionario", "potente" ni "innovador".
```

**Ajuste humano.** La lista inicial tenía cinco puntos y dos eran el mismo. Los fusioné y **añadí uno que el modelo no había propuesto: que el sistema sepa responder `UNKNOWN`**. Salió de mi experiencia usando asistentes de código: lo que más desconfianza genera no es que fallen, es que fallen con seguridad y una cita que parece válida. Ese comportamiento acabó siendo el criterio de aceptación más distintivo de la HU2 y el paso 3 del guion de demostración.

---

# 2. Arquitectura del Sistema

## 2.1. Diagrama de arquitectura

### Prompt 1 — Elección de patrón con la extensibilidad como restricción

```
Quiero decidir el patrón arquitectónico de CODEMIND, no que me lo confirmes.

Requisito que manda sobre los demás: el núcleo debe ser independiente del
lenguaje analizado. Va a haber dos analizadores (PHP/Laravel y TypeScript) y
quiero poder demostrar —no afirmar— que añadir el segundo no obliga a tocar
el núcleo.

Propón 2 o 3 patrones candidatos. Para cada uno:
- cómo satisface ese requisito
- qué cuesta en complejidad para un proyecto de 13 semanas
- cómo se COMPRUEBA automáticamente que la separación no se ha roto

Recomienda uno y explica qué sacrifico al elegirlo.
```

**Por qué funcionó.** La tercera viñeta. Preguntar «cómo se comprueba» convirtió una decisión estética en una decisión con mecanismo: de ahí salió el test de arquitectura en CI con `dependency-cruiser` que falla el build si alguien importa infraestructura desde `core`.

**Ajuste humano.** Escogí hexagonal, pero **rechacé la propuesta de crear un paquete de puertos separado** por lenguaje. Con dos analizadores es sobreingeniería: un solo `AnalyzerPort` basta y se ve de un vistazo. Añadí por mi cuenta el criterio de aceptación de la PR 3: *el diff no toca `packages/core`*. Eso hace la afirmación falsable con un `git diff`, que era el objetivo original del prompt.

### Prompt 2 — Sacrificios de la arquitectura

```
La plantilla de documentación exige, en la sección de arquitectura, no solo
los beneficios sino "los sacrificios o déficits que implica".

Dame los sacrificios REALES de la arquitectura que hemos elegido para
CODEMIND. No los de cortesía tipo "requiere disciplina del equipo".

Quiero los que un revisor técnico usaría para atacar la propuesta. Para cada
uno: en qué situación concreta duele, y si lo mitigo o lo acepto.
```

**Ajuste humano.** De seis sacrificios propuestos descarté dos por genéricos y **reescribí el primero**, que es el importante: el grafo de llamadas nunca será completo en Laravel por las facades, el contenedor de servicios y las rutas resueltas por string. El modelo lo planteaba como una debilidad a minimizar. Le di la vuelta: **lo convertí en una medición**. Si el mismo núcleo produce un grafo peor en PHP que en TypeScript —donde el compilador resuelve referencias— eso es un resultado interesante, no una vergüenza. De ahí salió la Tabla 2 de la sección 2.6.

### Prompt 3 — Justificación del framework

```
Estoy dudando entre NestJS y Fastify para la API de CODEMIND.

Datos: son 3 endpoints, la plantilla exige especificación OpenAPI, el
proyecto es un monorepo con el dominio ya aislado en packages/core, y lo
desarrollo yo sola en 13 semanas.

No me des una comparativa general de los dos frameworks. Dime cuál elegir
CON ESOS DATOS y qué me estaría comprando de más con el otro.
```

**Ajuste humano.** Ninguno de fondo: Fastify, y la razón —con el dominio ya aislado, la inyección de dependencias de NestJS resuelve un problema que no tengo— se incorporó tal cual a la sección 2.2. Sí acorté la respuesta: llegó con una tabla de ocho criterios de los que seis eran irrelevantes para el caso.

## 2.2. Descripción de componentes principales

### Prompt 1 — Pedir criterio en lugar de aprobar en bloque

Contexto: una revisión cruzada había devuelto una lista de inconsistencias entre el readme y la propuesta. La tentación era aprobarlas todas de golpe.

```
y propones arreglarlas?
```

**Por qué funcionó.** Es el prompt más corto del proyecto y uno de los más rentables. Aprobar una lista de correcciones en bloque trata todos los defectos como equivalentes; preguntar si se propone arreglarlos obliga a justificar cada uno por separado, y ahí se ve que **dos de ellos no eran defectos que borrar sino decisiones que documentar**.

**Ajuste humano.** Dos cambios de fondo salieron de esa distinción:

- El comando `drift` aparecía en el diagrama, en la tabla de componentes y en el enum `capability`, pero su funcionalidad (F6) es *should-have*. La respuesta inicial era quitarlo. Decidí **conservarlo y marcarlo como previsto**: añadir un valor a un enum con datos dentro es una migración, no un cambio de código, así que el punto de extensión se diseña ahora. Lo que había que arreglar era la promesa, no el diseño.
- El Ticket 3 hablaba de «9 tablas» y el diagrama tenía una relación de muchos a muchos entre `FILE` y `COMMIT`, que necesita tabla intermedia. En lugar de corregir el número, **añadí la tabla**: `FILE_COMMIT` es de donde sale el peso de las aristas `co_changed`, que es lo que sostiene el análisis de impacto justo donde el análisis estático de PHP no llega. Un error de recuento resultó ser una tabla que faltaba.

La lección es que una inconsistencia señala un sitio donde no habías pensado del todo, y a veces la salida no es tachar sino terminar de pensarlo.

## 2.3. Descripción de alto nivel del proyecto y estructura de ficheros

### Prompt 1 — Nombres que digan lo que son, con una parada antes de ejecutar

```
Revisa detalladamente: primero el ai4devs-requisitos-y-encaje.md y después
todo lo demás.

Necesito poner un poco de orden. [...] los nombres de los archivos .md en la
raíz de la carpeta no los veo coherentes a lo que son, es un recorrido hasta
afinar la propuesta final.

Tu primera tarea es: vamos a crear una nueva carpeta y dentro vas a crear
estos archivos de nuevo, pero con nombres más coherentes.
El contenido de los archivos, si tienen inconsistencias avísame antes de
seguir.
```

**Por qué funcionó.** La última frase. Sin ella habría recibido cuatro ficheros renombrados y nada más; con ella, el trabajo se detuvo antes de ejecutar y devolvió **nueve inconsistencias** entre los documentos, tres de ellas en el readme de la entrega: afirmaciones sobre la ausencia de imágenes que habían dejado de ser ciertas, un valor de confianza que se mostraba en tres sitios y no se explicaba en ninguno, y una carpeta referenciada que no figuraba en la estructura de ficheros.

Poner una condición de parada en el propio prompt —«avísame antes de seguir»— convierte una tarea mecánica en una revisión. Cuesta una línea.

**Ajuste humano.** Decidí que los cuatro documentos del recorrido se copiaran **literalmente**, con sus contradicciones dentro, y que las correcciones se aplicaran solo a los documentos vivos. Un registro de cómo cambió el criterio pierde su valor si se reescribe para que parezca coherente desde el principio. Las inconsistencias que sí importaban eran las de la entrega, no las del histórico.

### Prompt 2 — La estructura oficial, no la que yo suponía

```
ahora que sabes todo lo necesario, como me recomiendas proceder? no hagas
cambios en la carpeta todavía. Si la idea es subirlo al repo, ¿Qué estructura
de carpetas me recomiendas hacer? lo que está dentro de la carpeta
final-project era temporal también. Quiero empezar a crear ya el proyecto y
la estructura de carpetas debe ser la oficial ya.
```

**Por qué funcionó.** Dos restricciones explícitas. «No hagas cambios todavía» separó la decisión de la ejecución, que en cuestiones de estructura es donde se cometen los errores caros. Y «debe ser la oficial ya» forzó ir a **comprobar** la plantilla y los dos repositorios de ejemplo en lugar de deducirla: resultó que la plantilla trae únicamente `readme.md` y `prompts.md` en la raíz, que el código va arriba y que la carpeta `final-project/` que estaba usando de trabajo no formaba parte de nada.

**Ajuste humano.** El más importante de esta sección, y va contra el ejemplo oficial. La estructura propuesta incluía ocho documentos numerados en `docs/` espejando el readme sección por sección, como hace el Ejemplo 1 del máster. **Lo rechacé.** Duplicar el documento evaluado en ocho ficheros más es crear ocho sitios donde el contenido puede desincronizarse — y detectar exactamente eso es la funcionalidad F6 de este producto. Documentar de una forma que genere el problema que el sistema resuelve habría sido una mala señal sobre el criterio con el que está hecho. `docs/` quedó para lo que el readme no contiene: el guion de demostración, los pesos de la fórmula de confianza, las guías de tests y despliegue, y las transcripciones de estas sesiones.

## 2.4. Infraestructura y despliegue

### Prompt 1 — Diagrama, paridad de entornos y demo de coste acotado

```
Actúas como un Arquitecto de Software y Lead DevOps evaluando la documentación técnica para el Trabajo de Fin de Máster (TFM) del programa AI4Devs.

Tarea: Redacta la sección "2.4. Infraestructura y despliegue" del documento de arquitectura. Debe documentar de forma clara, directa y estructurada la estrategia de CI/CD, entornos, optimización de costes y gestión de secretos.

Requisitos de contenido y estructura:

Diagrama: Incluye un diagrama Mermaid (flowchart LR) que represente el flujo completo desde el desarrollo local (make up con Postgres + pgvector), paso por GitHub / GitHub Actions (lint, tests, build), registro de imágenes, servidor propio (API + web + TLS), base de datos y conexión a la API del LLM.

Proceso de despliegue: Explica brevemente el pipeline de CI/CD, enfatizando la ejecución de pruebas (unitarias, integración con contenedor Postgres, E2E) y el paso de verificación final (npm run verify).

Estrategia de Entornos: Compara en una tabla el entorno Local y la demo alojada. Subraya por qué ambos usan el mismo docker-compose (paridad dev/prod) y qué garantías ofrece cada uno.

Modo Demo y Gestión de Costes: Explica cómo se sostiene la demo pública sin agotar cuota de API LLM mediante un sistema de caché de embeddings/respuestas precalculadas, límites por IP y fallback a "modo solo-caché". Resume la estrategia de costes en una tabla comparativa.

Gestión de Secretos: Resume la política de seguridad (uso de .env.example, .gitignore y gestor de secretos del proveedor).

Evita introducciones genéricas o paja narrativa; ve directo al contenido técnico.
```

**Por qué funcionó.** El prompt no pedía «diseñar» la infraestructura: pedía **documentar decisiones ya tomadas**, con forma fija (diagrama Mermaid, tabla de entornos, tabla de costes, secretos) y con la prohibición de paja al final. Eso evita la respuesta por defecto —comparativas de PaaS, listas de buenas prácticas— y fuerza el contenido que la plantilla evalúa: flujo, paridad local/demo y techo de coste de la demo pública.

**Ajuste humano.** Tres cambios de fondo sobre la primera salida. Primero: **añadí la carga de semillas y el test de arquitectura al pipeline** — el prompt pedía lint, tests y `npm run verify`, pero sin semillas el despliegue deja un sistema vacío, y sin el test de arquitectura la regla del núcleo no se comprueba en CI. Segundo: **recorté el párrafo de alternativas gestionadas** (Railway, Render, Fly.io, Cloud Run) que el modelo añadió como «por si acaso»; en la entrega el destino es servidor propio, y enumerar PaaS sin comprometerse diluye la decisión. Tercero: **exige que la métrica de acierto de caché se muestre en la interfaz**, no solo que exista el mecanismo: si el modo demo es el argumento de coste, tiene que ser auditable desde fuera.

## 2.5. Seguridad

### Prompt 1 — Modelo de amenazas de un sistema con LLM y agentes

```
CODEMIND lee repositorios de código y envía fragmentos a un LLM. El
contenido del repositorio (comentarios, mensajes de commit, cuerpos de
issues) no es de confianza: puede contener instrucciones dirigidas al modelo.

Construye el modelo de amenazas. Referencias: OWASP Top 10 for LLM
Applications y OWASP Top 10 for Agentic Applications (busca las ediciones
vigentes, no las cites de memoria).

Para cada amenaza: vector concreto en ESTE sistema, mitigación, y cómo se
mide que la mitigación funciona.

Importante: no me propongas "detectar inyecciones de prompt" como mitigación
principal. Quiero defensas arquitectónicas, del tipo que funcionan aunque el
detector falle.
```

**Por qué funcionó.** La última restricción. La respuesta por defecto a la inyección de prompt es «añade un detector», que tiene falsos negativos conocidos y da una falsa sensación de seguridad. Prohibirlo explícitamente forzó las defensas que de verdad sostienen: sistema de solo lectura, agente en cuarentena sin acceso a herramientas, validación de salida por esquema.

**Ajuste humano.** Dos añadidos míos. Primero: **detectar secretos antes de indexar, no antes de enviar al modelo** — un secreto que nunca entra en la base de datos no puede filtrarse por una consulta posterior. El modelo lo había puesto en el paso de envío. Segundo, y más importante: **añadí la tasa de falsos positivos como métrica obligatoria**. Solo se medía la tasa de bloqueo, y un detector que bloquea todo obtiene un 100 % de bloqueo. Medir solo el acierto es engañarse.

### Prompt 2 — Datos personales en el historial de Git

```
Una de las fuentes de CODEMIND es el historial de Git, que contiene nombres
y direcciones de correo de contribuidores.

¿Qué implicaciones de RGPD tiene esto y cuál es el diseño mínimo que las
respeta sin perder funcionalidad útil?

Considera también que una funcionalidad que descarté era detectar qué
personas concentran el conocimiento de un módulo. Dime si ese descarte fue
acertado y por qué.
```

**Ajuste humano.** Confirmó el descarte y aportó el argumento que no había formulado: además del RGPD, una métrica de concentración de conocimiento por persona es **sensible en el plano laboral**, porque se puede leer como evaluación de individuos. Adopté la seudonimización del autor por defecto (hash con sal) y lo dejé escrito en la descripción de la entidad `COMMIT`, para que la decisión quede en el esquema y no solo en la intención.

## 2.6. Tests

### Prompt 1 — Estrategia de pruebas atada a los criterios de aceptación

```
Adjunto las 3 historias de usuario de CODEMIND con sus criterios de
aceptación, y los 3 tickets.

Diseña la estrategia de tests. Restricciones:
- cada nivel (unitario, integración, E2E) debe justificar por qué existe;
  no quiero pirámide por costumbre
- debe haber un test que compruebe la regla de arquitectura (core no importa
  infraestructura) y que falle el build si se rompe
- la evidencia de funcionamiento del proyecto NO serán capturas ni vídeo,
  así que necesito una comprobación ejecutable que alguien externo pueda
  correr para verificar que su instalación reproduce lo documentado

Para cada criterio de aceptación, indica qué nivel de test lo cubre.
Si algún criterio no es testeable como está escrito, dímelo.
```

**Por qué funcionó.** La última línea. Devolvió tres criterios de aceptación mal formulados —incluido uno mío que decía «la respuesta es útil», que no es verificable— y los reescribí antes de seguir. Es más barato arreglar un criterio que un test.

**Ajuste humano.** De aquí salió `npm run verify`, que no estaba en mi plan: una prueba de humo que consulta cada proyecto de muestra y compara con la salida esperada. Cumple doble función —test de integración en CI y verificación para quien evalúa— y es la forma en que se demuestra que el sistema funciona.

**Nota posterior.** La restricción que escribí en el prompt —«la evidencia NO serán capturas ni vídeo»— se matizó después: la sección 1.3 del README incluye wireframes de las tres pantallas. No es una marcha atrás, es una distinción que al escribir el prompt no había hecho: **un wireframe documenta el diseño, una captura documenta un sistema en marcha.** En la Entrega 1 no hay código, así que la captura era imposible y el wireframe es lo que corresponde. El vídeo sigue descartado y la evidencia de funcionamiento sigue siendo ejecutable.

---

# 3. Modelo de Datos

### Prompt 1 — Traducir una decisión conceptual a esquema

```
CODEMIND distingue entre conocimiento observado (extraído por un parser, sin
LLM) y conocimiento inferido (producido por un LLM a partir de evidencias).
Esa distinción es central: no quiero que una inferencia pueda presentarse
nunca como un hecho.

Diseña el esquema PostgreSQL que hace esa distinción IMPOSIBLE de violar a
nivel de base de datos, no solo por convención en el código.

Incluye: entidades, tipos exactos, claves primarias y foráneas,
restricciones CHECK, e índices necesarios para travesía del grafo y búsqueda
vectorial con pgvector.
Entrégalo como diagrama Mermaid erDiagram más el DDL de las restricciones.
```

**Por qué funcionó.** «Imposible de violar a nivel de base de datos» es lo que produjo las dos restricciones `CHECK` que son, probablemente, el detalle del que estoy más satisfecha:

```sql
ALTER TABLE claim ADD CONSTRAINT fact_only_from_l1
  CHECK (type <> 'FACT' OR layer = 'L1');

ALTER TABLE claim ADD CONSTRAINT l2_requires_provenance
  CHECK (layer <> 'L2' OR provenance IS NOT NULL);
```

Un principio de diseño que la base de datos hace cumplir no se erosiona con las prisas.

**Ajuste humano.** El primer esquema tenía `layer` y `type` fusionados en un solo campo. **Los separé**: `layer` dice de dónde salió la afirmación, `type` dice qué garantía tiene. Son cosas distintas y fusionarlas habría impedido justamente la restricción que quería.

### Prompt 2 — Campo `resolution` en las aristas

```
Problema concreto. En PHP/Laravel, muchas llamadas no se pueden resolver con
certeza: facades, bindings del contenedor de servicios, rutas por string,
atributos mágicos de Eloquent. En TypeScript, en cambio, el compilador las
resuelve con precisión.

Quiero que el grafo refleje esa diferencia de fiabilidad en lugar de
esconderla, y que se propague hasta la respuesta que ve el usuario.

Propón el diseño. Debe permitir: (a) filtrar por fiabilidad al recuperar
contexto, (b) impedir que una arista poco fiable sustente un hecho, y
(c) comparar la calidad de los dos analizadores con datos.
```

**Ajuste humano.** El diseño propuesto usaba una puntuación continua de 0 a 1. **Lo cambié a un enum de dos valores, `exact` | `heuristic`.** Una puntuación continua obliga a elegir umbrales que no puedo justificar con datos, y da una precisión aparente que no tengo. Dos valores son honestos y suficientes para las tres cosas que pedía. Añadí también el campo `extractor`, que no estaba propuesto, para poder auditar el origen de cada arista y comparar analizadores.

### Prompt 3 — Incrementalidad e invalidación

```
El README afirma que CODEMIND mantiene una "memoria viva" del proyecto, pero
no tengo diseñado qué pasa cuando llegan commits nuevos. Reindexar todo en
cada cambio no es viable.

Diseña la política de actualización incremental, incluyendo qué ocurre con
las inferencias del LLM cuyo código de soporte ha cambiado.

Sé concreta sobre el mecanismo: qué campo dispara la invalidación, cuándo se
recalcula, y qué se muestra al usuario mientras un dato está obsoleto.
```

**Ajuste humano.** Acepté el mecanismo —`content_hash` por fichero, `status = stale` en los claims afectados, re-inferencia perezosa— y descarté la propuesta de un sistema de versionado completo del grafo. Es correcto en abstracto y no cabe en 13 semanas. Queda anotado como trabajo futuro.

---

# 4. Especificación de la API

### Prompt 1 — Diseño de los tres endpoints

```
Diseña la API REST de CODEMIND en OpenAPI 3.0.3.

Restricción fuerte: exactamente 3 endpoints como máximo (lo exige la
plantilla de entrega). Elige los tres que cubren las 3 historias de usuario
must-have sin dejar ninguna a medias.

Requisitos de la respuesta de la consulta:
- cada afirmación por separado, con su tipo (FACT/INFERENCE) y el resultado
  de la verificación de su evidencia
- las evidencias referenciables desde las afirmaciones
- el consumo: tokens, coste, latencia, y cuántos tokens habría costado
  enviar contexto bruto

Incluye ejemplos realistas de peticiones y respuestas, con datos coherentes
entre sí. Nada de "string" ni "example value".
```

**Por qué funcionó.** «Datos coherentes entre sí» evitó el ejemplo típico donde el `answer` habla de un fichero que no aparece en `evidence`. Los ejemplos del documento se pueden leer como una respuesta real.

**Ajuste humano.** Añadí el campo `baselineTokens`, que no estaba. Sin él, mostrar el ahorro en la interfaz obliga a recalcularlo en el cliente. Con él, el dato viaja con la respuesta y queda registrado en `QUERY_LOG`, que es lo que alimenta la tabla de mediciones.

### Prompt 2 — Formato del informe de impacto

```
El endpoint de impacto devuelve un conjunto de elementos afectados por un
cambio. Esos elementos vienen de dos fuentes muy distintas:

1. el grafo estático (fiable, pero incompleto en PHP)
2. la señal histórica de co-cambio en Git (ruidosa, pero captura relaciones
   que el análisis estático no ve)

Diseña el formato de respuesta de manera que quien lo lee pueda distinguir
siempre de dónde viene cada elemento y con qué fiabilidad.

Argumenta por qué mezclarlos sin distinguir sería un error.
```

**Ajuste humano.** Ninguno significativo. El argumento que devolvió —que sin distinguir el origen el usuario no puede calibrar cuánto confiar en cada línea, y acaba desconfiando de todas— se incorporó a la justificación de la HU3. La estructura con `origin` y `resolution` por elemento se adoptó tal cual.

---

# 5. Historias de Usuario

### Prompt 1 — Criterios de aceptación verificables

```
Adjunto la lista de funcionalidades de CODEMIND.

Escribe las 3 historias de usuario must-have en formato "Como / quiero /
para", cada una con criterios de aceptación en formato Dado-Cuando-Entonces.

Reglas para los criterios:
- cada uno debe poder convertirse en un test automático; si no es
  verificable, no lo incluyas
- incluye al menos un criterio de comportamiento negativo (qué NO debe
  hacer el sistema)
- incluye criterios de rendimiento con números concretos
- no repitas en los criterios lo que ya dice la narrativa de la historia

Después, revisa tu propio resultado y señala cuál de los criterios sería
más difícil de cumplir y por qué.
```

**Por qué funcionó.** Dos cosas. La exigencia de un criterio negativo produjo el mejor criterio del proyecto: *«dada una pregunta sin evidencia suficiente, el sistema responde que no lo sabe en lugar de generar una explicación plausible»*. Y la autorrevisión final identificó correctamente que el criterio de latencia (<10 s) sería el más difícil, dado que la verificación de evidencias añade una llamada al modelo.

**Ajuste humano.** Subí la estimación de la HU2 de 13 a 21 puntos precisamente por lo que señaló la autorrevisión. Y reescribí el criterio de la HU1 sobre multi-lenguaje para que dijera **«sin que el núcleo haya cambiado»**: así el criterio de aceptación de una historia de usuario es comprobable con un `git diff`, no con una opinión.

### Prompt 2 — Priorización del backlog

```
Tengo 7 funcionalidades candidatas para CODEMIND y 13 semanas, con la
documentación entregada en la semana 6 y el código funcional en la 10.

Ayúdame a clasificarlas en must-have y should-have. Criterio de decisión: el
proyecto se evalúa por idea/arquitectura, calidad de código y uso de IA — no
por número de funcionalidades.

Para cada una que propongas como must, dime qué se rompe si falta. Si algo
es must solo porque "queda bien", dímelo.
```

**Ajuste humano.** El modelo proponía como *should* la funcionalidad de poder probar el sistema sin configurar nada. **La subí a must**, y fue la decisión de producto más importante que tomé: al no haber ni vídeo ni capturas de un sistema en marcha, esa funcionalidad **es** toda la evidencia de funcionamiento del proyecto. Lo que empezó siendo comodidad para el usuario acabó siendo el soporte de la evaluación.

---

# 6. Tickets de Trabajo

### Prompt 1 — Ticket del componente diferencial

```
Escribe el ticket de trabajo para el verificador de evidencias de CODEMIND:
el componente que comprueba, para cada afirmación de una respuesta generada,
si sus citas la sustentan realmente.

Nivel de detalle: alguien que no conozca el proyecto debe poder
implementarlo de principio a fin con este ticket.

Incluye: descripción, tareas numeradas, criterios de aceptación, definición
de hecho, dependencias y estimación.

Requisito específico: un criterio de aceptación que acote el coste añadido
en llamadas al LLM, porque este componente añade una llamada por consulta y
no quiero que duplique la factura.
```

**Ajuste humano.** Añadí la tarea 7 (cachear resultados por par afirmación-span), que no estaba y es lo que hace alcanzable el criterio de coste que yo misma había pedido. Es un caso claro de haber pedido un límite sin dar el mecanismo para respetarlo: el modelo puso el criterio, pero no la forma de cumplirlo.

### Prompt 2 — Ticket de base de datos con las restricciones como entregable

```
Escribe el ticket de base de datos de CODEMIND, a partir del modelo de datos
adjunto.

Debe incluir explícitamente como tareas:
- las dos restricciones CHECK que protegen la distinción FACT/INFERENCE
- el trigger de invalidación de claims cuando cambia el hash de un fichero
- la generación de las semillas con los dos repositorios de muestra ya
  indexados

Y un criterio de aceptación que verifique que insertar un FACT en la capa
inferida falla EN LA BASE DE DATOS, no en la aplicación.
```

**Ajuste humano.** Ninguno de fondo. Sí añadí el criterio sobre `npm run db:seed`: que deje el sistema consultable sin necesidad de tener PHP instalado ni de clonar repositorios ajenos. Es lo que hace que el arranque local funcione como evidencia.

### Prompt 3 — Ticket de frontend con la evidencia como objetivo de diseño

```
Escribe el ticket de la pantalla principal de la web de CODEMIND.

El objetivo de diseño no es que sea bonita: es que la fiabilidad de la
respuesta sea legible de un vistazo. Concretamente, que una afirmación
inferida se distinga de un hecho SIN necesidad de leer texto adicional, y
que el ahorro de tokens se vea sin abrir ningún panel.

Incluye los componentes a construir, criterios de aceptación, accesibilidad
y el test E2E que lo cubre.

La definición de hecho NO puede incluir capturas de pantalla: la evidencia
del proyecto es la demo alojada y el arranque local.
```

**Ajuste humano.** La propuesta inicial distinguía hechos de inferencias solo por color. **Lo cambié**: color más icono más etiqueta textual. Depender del color excluye a quien no lo distingue, y en un sistema cuyo argumento central es la fiabilidad de la información sería una contradicción incómoda.

**Nota posterior.** La última línea del prompt —«la definición de hecho NO puede incluir capturas de pantalla»— sigue vigente para la definición de hecho del ticket, que se cierra con el E2E y con `docs/DEMO.md`. Lo que cambió es la sección 1.3 del README, que ahora sí lleva wireframes: son la referencia de diseño **de entrada** para construir la pantalla, no la prueba **de salida** de que funciona.

---

# 7. Pull Requests

*(pendiente — Entrega 3)*

En esta entrega no hay código, luego no hay pull requests y no hay prompts que registrar aquí. La sección 7 del readme lo dice en los mismos términos, y las dos deben coincidir: un registro de uso de IA que documentase la revisión de una pull request inexistente sería, precisamente, el tipo de divergencia entre documentación y realidad que este proyecto se propone detectar.

El enfoque previsto está descrito en el ticket correspondiente del readme; los prompts que realmente se usen se transcribirán aquí cuando existan las PR.

---

# 8. Lecciones sobre el uso de IA en este proyecto

Cinco cosas que aprendí, incluyendo las que salieron mal.

**1. El error más caro fue no dar el contexto de evaluación.** Pedí una auditoría de mi propuesta sin adjuntar el enunciado del proyecto. Recibí una crítica excelente y calibrada al objetivo equivocado, que me habría llevado a construir una tesis de investigación en lugar del MVP que se me pedía. El modelo no podía saberlo. Lo detecté al leer el documento oficial de indicaciones, y la corrección exigió reescribir la propuesta entera. **Antes de pedir una evaluación, hay que dar el criterio con el que a ti te evalúan.**

**2. Prohibir explícitamente da mejores resultados que pedir.** Los prompts más productivos de este proyecto llevan una prohibición: «no lo reescribas», «no me propongas un detector», «no incluyas criterios no verificables», «no lo distingas solo por color». La salida por defecto de un modelo tiende a lo convencional; la restricción es lo que la empuja fuera de ahí.

**3. Preguntar «cómo se comprueba» convierte opiniones en mecanismos.** La misma pregunta sobre arquitectura, formulada como «qué patrón usar», da una recomendación. Formulada como «cómo compruebo automáticamente que la separación no se ha roto», da un test en CI. La segunda es la que sirve.

**4. Los ajustes humanos se concentraron en el mismo sitio: la honestidad del sistema.** Repasando este documento, casi todas mis correcciones van en una dirección: la tasa de falsos positivos que faltaba, el enum de dos valores en lugar de la puntuación continua falsamente precisa, la respuesta `UNKNOWN`, el icono además del color. El modelo tiende a producir sistemas que parecen más seguros y más precisos de lo que son. **Corregir eso, sistemáticamente, fue mi aportación principal.**

**5. Pedir autorrevisión dentro del mismo prompt es barato y rentable.** «Después, revisa tu propio resultado y señala cuál sería más difícil de cumplir» identificó correctamente el criterio de latencia como el punto frágil, y me hizo subir una estimación antes de comprometerme con ella. Cuesta una frase.

---

*A partir de aquí, empezaremos a construir el proyecto y las conversaciones completas archivadas estarán en `docs/ai-sessions/`.*
