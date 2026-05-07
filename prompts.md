> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Soy un apasionado de los árboles y quiero desarrollar un proyecto web para almacenar las fotografías que les tomo junto con la ubicación en la que están. El sistema permitirá almacenar datos y fotografías de árboles, posicionar en un mapa (mediante API de terceros) su ubicación y compartir la información de forma pública. También contará con un módulo de notificaciones de novedades y una interacción con ChatGPT: tanto para identificar el árbol a partir de las fotografías como para interactuar en modo chat. La tecnología a usar debe ser Microservicios con Spring Boot en la parte back y Vue. El proyecto va a seguir todas las buenas prácticas de la ingeniería de software. En este momento estoy abordando la fase inicial para definir las características del producto y planificar adecuadamente. Te voy a pedir que me proporciones una descripción breve que permita entender y poner en valor el proyecto; antes de generarla confírmame si has entendido el objetivo y el contexto; pregúntame cualquier aclaración que necesites para elaborar dicha descripción y mejorar mi idea.

1.- el público objetivo será el aficionado general 
2.- un enfoque predominante de catalogación personal pero abierto a una comunidad colaborativa 
3.- la identificación con IA es una importante ayuda orientativa, aunque no una funcionalidad central 
4.- quiero que el proyecto se perciba como  memoria/localización de árboles singulares añadiendo la componente de disfrute como hobby 
5.- El sistema público permitirá consulta sin registrarse 
6.- El nombre pensado es "MyTreeLibrary"


**Prompt 2:**

Actúa como un Product Manager con experiencia en aplicaciones web colaborativas y defíneme las las características y funcionalidades específicas que debe tener el producto para satisfacer las necesidades identificadas. Se conciso, céntrate en los puntos más importantes a incluir en un MVP. Pregúntame cualquier duda antes de empezar.

1.- quiero contemplar 3 roles: administrador, colaborador (con posibilidad de añadir y editar) y público (sin necesidad de identificación). Los dos primeros deben estar dados de alta en el sistema. 
2.- La publicación por parte del colaborador será directa en el sistema; el administrador tiene potestad para que las fotografías subidas por los colaboradores dejen de estar accesibles al publico general e incluso borrarlas. El usuario público puede apuntarse para recibir notificaciones sin necesidad de estar logado,

**Prompt 3:**

Actúa como un analista de negocio experto y define el modelo de casos de uso del sistema. El modelo debe ajustarse a la descripción del sistema dada en @readme.md y a estas indicaciones:
---
Usuarios: 
Debe haber 3 tipos de usuario: Administrador, Colaborador y Público. 
---
Casos de uso:
Deben modelarse estos casos: 
- Usuario público: puede consultar y registrarse para recibir notificaciones - 
- Colaborador: además de los casos de uso públicos, puede dar del alta árboles o modificar los que ha registrado él; como punto de extensión está la consulta a la IA para identificar un árbol; puede consultar a la IA vía chat. 
- Administrador: puede realizar las tareas de los usuarios anteriores y Gestionar las tablas de catálogo; puede modificar las solicitudes de notificación dejándolas inactivas o borrándolas. 
- Además el sistema debe mandar notificaciones por mail a los usuarios registrados cuando se produzca una alta/modificación
---
Restricciones
Para los casos de uso de Colaborador y Administrador se requiere estar autenticado
Emplea las buenas practicas de modelado de casos de uso y genera un archivo en planUML y una tabla resumen para incluir en formato md.
Si tienes alguna duda, pregúntame antes de seguir con el proceso.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Tengo que diseñar una arquitectura de microservcicos para implementar el sistema descrito en los puntos 1 y 2 del documento @readme.md Las tecnologías base a emplear son Spring Boot en su última versión para el back end y Vue 3 para el front. La autenticación se hará mediante JWT empleadno keycloak para la generación del token. El sistema empleará kafka para las comunicaciones asincronas (en el alta se publica un evento que consumirá el microservicio de notificaciones) El modelo de datos se debe implementar en PostgreSQL (para la parte transaccional pura) y Mongopara. El almacenamiento de los ficheros imagen mediante APSI compatible con S3, para el desarrollo se usará MinIO. Para la cache se empleará Redis. El sistema debe cumplir con altos estándares de calidad y seguir loa patrones y buenas practicas del desaarrollo de software. Actua como un experto arquitecto de sofware y define la arquitectura del sistema; antes de proceder consultame cualquier duda que tengas.

**Prompt 2:**

Actúa como un arquitecto de datos con gran experiencia y define el modelo conceptual del sistema a partir de los casos de uso de y de la definición del sistema de los documentos . Al ser el modelo conceptual no hagas distinción sobre que entidad irá después en cada tipo de almacenamiento (PostgreSQL, Mongo, ...); quiero un modelo general del sistema completo.
---
Ten además en cuenta:
---
Entidades principales
- Arbol
- Especie (relación N:1 con arbol; un arbol tiene una especia; una especie puede estar en N arboles)
- Características/Observaciones (relación 1:N con arbol; un árbol tiene N características/Observaciones) podrá contener información no estructurada  
- Usuario de notificación
- Notificaciones (relacionada con usuario y arbol)
- Fotografías (relación 1:N con arbol; un árbol tiene N fotografías)
---
Requisitos
- se debe guardar auditoria de las altas/modificaciones del catálogo 
- el árbol debe estar bien identificado con especie; nombre científico y nombre común 
- se deben guardar las coordenadas de la ubicación del árbol 
- las imágenes subidas pueden tener 2 categorías de visibilidad: PUBLIC y PRIVATE; PRIVATE solo la pueden ver el administrador y quien creó la fotografía (salvo reglas adicionales del producto); PUBLIC según acceso público a la ficha 
- las notificaciones se mandan a usuarios que previamente se han registrado proporcionando su mail
- debe haber unas tablas de catálogo como ESPECIE, PROVINCIA solo la pueden ver el administrador y e

Si tienes alguna duda consultamela antes de continuar con el proceso

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
La seguridad del sistema se implementará con JWT usando keycloak. Revisa la documentación de @readme y @infra/compose/docker-compose.yml confirmando que el enfoque es correcto, si ves algún punto no claro preguntame.

**Prompt 2:**
Vamos a definir los siguientes puntos de la implementación 
1.- documenta de forma concisa que Keycloak en start-dev solo se debe usar en desarrollo

2.- define el Realm a configurar en keycloak y preprar el desplegarlo en el contenedor cuando se levante con compose up. Los roles a usar son COLABORADOR y ADMIN y lo que tiene que  tenerse en cuenta en la parte front y back. 

3.- Prepara una estrategia de validación del JWT en el Gateway, los servicios implementarán la necesidad de autorización con un token validado por el Gateway  para las operaciones del COLABORADOR y ADMIN permitiendo  el consumo sin token de la parte pública.  

4.- Añade los puntos que consideres necesarios

**Prompt 3:**
Actúa como revisor de seguridad de aplicaciones (AppSec) especializado en OAuth2/OIDC, JWT, Spring Boot y SPAs.
Contexto del proyecto: MyTreeLibrary — monorepo con SPA Vue 3, API Gateway Spring, microservicios Spring Boot 4, Keycloak (realm `mtl`, roles de realm COLABORADOR y ADMIN), contrato en docs/api/openapi.yaml y normativa en .cursor/rules/api-security.mdc y docs/security/jwt-gateway-strategy.md.
Tarea: revisar la seguridad IMPLEMENTADA en el código y configuración que te indique (rutas, filtros Spring Security, CORS, gateway, clientes Keycloak, manejo de tokens en el front, logs, errores). No inventes requisitos: contrasta con OpenAPI, api-security.mdc y jwt-gateway-strategy.md.
Comprueba explícitamente:
1. Rutas públicas vs protegidas: coincidencia con OpenAPI (incl. POST /api/notifications/subscriptions sin Bearer) y ausencia de endpoints sensibles expuestos sin autenticación.
2. Validación JWT: issuer-uri/JWKS, audience si aplica, caducidad, rechazo de tokens malformados; coherencia entre gateway y microservicios (estrategia token relay documentada).
3. Autorización: comprobación de roles COLABORADOR y ADMIN donde el modelo lo exige (maestros solo ADMIN, etc.).
4. Front: almacenamiento y envío del access token; no uso del id_token como Bearer; PKCE; redirect URIs.
5. Cabeceras: correlación; no filtrar tokens ni PII en logs o respuestas de error (RFC 9457).
6. Superficie interna: si los microservicios son alcanzables sin pasar por el gateway y qué riesgo implica.
7. CORS y CSRF donde aplique al flujo elegido.
Salida pedida:
- Lista breve de hallazgos por severidad (crítico / alto / medio / bajo / informativo).
- Para cada hallazgo: ubicación (fichero o ruta), qué falla, remediación concreta.
- Si algo no se puede verificar por falta de contexto, indícalo como “no verificable” y qué habría que mostrar.
No generes código salvo que pida un snippet ilustrativo de una línea; prioriza diagnóstico y priorización.

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
Estoy diseñando el modelo de datos para una aplicación web que me permita gestionar mi colección personal de fotografías de árboles singulares. Además de las fotografías, cada ejemplar tiene una serie de datos asociados como especie, ubicación y descripción. La arquitectura definida consiste en una base de datos SQL (PostgreSQL) que mantiene el inventario y los datos esenciales mencionados anteriormente y una base de datos MongoDB que permite ampliar la información de cada ejemplar y especie con datos y notas sin una estructura claramente definida. Actúa como un ingeniero de datos experto, tu primer objetivo es validar la arquitectura propuesta y generar un primer diseño de alto nivel; solo con las entidades principales sin entrar por ahora en la definición de las columnas. El diseño debe ser profesional generando junto a la justificación los diagramas Mermaid ER correspondientes.

**Prompt 2:**

Una vez validada la arquitectura vamos a centrarnos solo en el diseño de la base de datos Mongo; ya si vamos a bajar al diseño de campos de cada entidad. Por decisión de diseño se ha decidido que las claves primarias serán numéricas; no uuid. Los metadatos asociados a cada fotografía se van a almacenar solo en PostgreSQL y la fotografía en S3; a partir de ahora no modeles estos conceptos relacionados con la imagen. Para facilitar búsquedas se quiere que el nombre común y científico de la especie también se guarde en MongoDB; estos dos datos se repetirán tanto en PostgreSQL como en MongoDB pero podemos considerarlo como una 'desnormalización' que nos permite ejecutar en MongoDB búsquedas más completas sin necesidad de acceder a PostgreSQL. Genera el modelo ER en Mermaid;

P: En el modelo anterior teníamos EJEMPLAR_DETALLE y ESPECIE_DETALLE como colecciones separadas. ¿Cómo quieres estructurar la relación entre ambas en MongoDB?
R: Si no ves problema en el diseño  EJEMPLAR_DETALLE y ESPECIE_DETALLE  serían colecciones independientes referenciadas por ID

P: Las OBSERVACIONES del ejemplar, ¿cómo deben modelarse?
R: Embebidas como array dentro de EJEMPLAR_DETALLE


**Prompt 3:**
. En el caso de uso los datos de ESPECIE_DETALLE se quieren cargar con una consulta a un LLM; define un JSON de ejemplo para cada colección que se pueda usar en la interacción con el LLM.

Generame un md resumen con el diseño que hemos definido. Incluye un ER en mermaid, la definición del modelo, los indices, los JSON de ejemplo. Si ves algún punto relevante que deba estar en un diseño profesional, pregúntame para ver si lo incluimos.

P: ¿Incluimos una sección de convenciones de nombrado y tipos de datos (ej: fechas en ISO 8601, IDs siempre int, arrays nunca null sino vacíos)?
R: No es necesario

P: ¿Incluimos consideraciones sobre la sincronización de los datos desnormalizados entre PostgreSQL y MongoDB (nombre_cientifico, nombre_comun)?
R: No, se gestiona fuera de este documento

P: ¿Incluimos una sección sobre el proceso de carga de ESPECIE_DETALLE vía LLM (prompt de referencia, campos a validar, riesgos)?
R: Sí, inclúyela

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

Actúa como un Product Owner senior, Business Analyst y especialista en backlog ágil.

Usa el  @readme.md  y ten en cuenta la carpeta @docs/ Tu tarea es transformarlo en un backlog profesional, claro y priorizado, listo para una primera fase de refinamiento.

El documento debe tener un enfoque  LEAN, sin texto o información que no aporte:
- mínima información viable
- máxima claridad
- cero burocracia innecesaria
- backlog útil para decidir, priorizar y planificar

TRABAJA SOLO CON INFORMACIÓN DEL LAS FUENTES INDICADAS

- No inventes requisitos, reglas ni comportamientos no respaldados por el PRD.
- Si falta información importante, no la completes por tu cuenta: recógela en una sección llamada “Suposiciones / Huecos detectados”.
- Si detectas ambigüedades, contradicciones o alcance poco definido, indícalo explícitamente.

OBJETIVO
Convertir el PRD en un backlog inicial útil, consistente, priorizable y accionable, separando claramente el backlog del detalle posterior de cada historia.

CRITERIOS DE TRABAJO

1. Identifica el objetivo del MVP, los tipos de usuario, las funcionalidades y las restricciones relevantes.
2. Agrupa los ítems por épicas o bloques funcionales cuando tenga sentido.
3. Redacta historias orientadas a valor para el usuario o para el producto.
4. No conviertas tareas técnicas internas en historias de usuario, salvo que sean habilitadores imprescindibles claramente derivados de los documentos.
5. Si un requisito es demasiado grande, divídelo en historias más pequeñas y manejables.
6. Evita duplicidades, solapamientos y redacción ambigua.
7. Prioriza pensando en una primera versión MVP, salvo que el PRD indique otra lógica.
8. Mantén un tono profesional, concreto y directo.
9. No incluyas criterios BDD, evaluación INVEST ni notas extensas dentro del backlog; ese nivel de detalle pertenece al refinamiento posterior de cada historia.


FORMATO OBLIGATORIO DE CADA ÍTEM DEL BACKLOG
Para cada historia incluye exactamente estos campos:

- ID: formato HU-001, HU-002, HU-003...
- Épica
- Título
- Historia de usuario: en formato “Como [rol], quiero [acción], para [beneficio]”
- Estimación: S, M o L
- Prioridad: Alta, Media o Baja

CRITERIOS DE CALIDAD
Cada historia debe ser:

- comprensible
- valiosa
- estimable a alto nivel
- suficientemente acotada
- redactada sin ambigüedad

REGLAS IMPORTANTES

- No mezcles varias necesidades distintas en una sola historia si pueden separarse.
- No generes historias excesivamente detalladas.
- No añadas criterios de aceptación, BDD ni validaciones funcionales en esta fase.
- No uses lenguaje impreciso o genérico.
- Si una historia parece demasiado grande o inmadura, mantenla en el backlog pero indícala después en la sección “Elementos que conviene refinar después”.

FORMATO DE SALIDA
Devuelve toda la respuesta en formato markdown generando un documento backlog.md en una carpeta backlog dentro de docs

SALIDA OBLIGATORIA
Devuelve el resultado en este orden exacto:

1. Resumen del MVP en 3 a 5 líneas
2. Lista de épicas identificadas
3. Backlog completo en formato tabla
4. Suposiciones / Huecos detectados
5. Elementos que conviene refinar después

FORMATO DE LA TABLA
Usa exactamente estas columnas:
| ID | Épica | Título | Historia de usuario | Estimación | Prioridad |

Antes de generar el backlog:

- analiza la documentación al completo
- asegúrate de que las historias no duplican requisitos
- asegúrate de que no mezclan objetivos distintos dentro de una misma historia


**Prompt 2 — Solo épicas (sin historias de usuario aún)**

Actúa como **Product Owner** y **analista de dominio** con experiencia en descomposición de backlog.

**Objetivo de esta sesión (solo esto):** proponer o **revisar la división en épicas** del MVP de MyTreeLibrary. **No** redactes historias de usuario (formato “Como… quiero… para…”); **no** asignes HU-00x; **no** entres en criterios de aceptación. Eso irá en un **paso posterior** con otro prompt.

**Fuentes obligatorias** (léelas y cítalas al agrupar):

- [readme.md](readme.md) (visión, arquitectura de alto nivel, reglas de negocio relevantes al MVP).
- [docs/use-cases/use-case-summary.md](docs/use-cases/use-case-summary.md) y, si hace falta, [docs/use-cases/use-case-model.puml](docs/use-cases/use-case-model.puml).
- [docs/data-model/data-model.md](docs/data-model/data-model.md) solo para acotar alcance funcional, no para diseñar tablas.
- Si ya existe backlog por épicas: [docs/backlog/backlog.md](docs/backlog/backlog.md) §2 (lista de épicas).

**Qué es una épica aquí**

- Bloque de **valor de producto** coherente (no una tarea técnica salvo un habilitador imprescindible y explícito en las fuentes).
- Tamaño: debe poder **descomponerse** después en varias historias; una épica no es una sola botonera ni un solo endpoint.
- **Límites claros:** indica qué queda **fuera** de cada épica cuando pueda solaparse con otra (p. ej. “Notificaciones” vs “Catálogo”).

**Cómo trabajar**

1. Lista las **épicas** que consideres necesarias (puedes mantener, fusionar o dividir las del `backlog.md` actual si lo justificas).
2. Para cada épica: **nombre corto**, **objetivo en 1–3 frases**, **alcance** (qué incluye), **límites** (qué excluye explícitamente), **trazabilidad** (UC / sección del readme / regla R# si aplica).
3. Señala **dependencias o precondiciones** entre épicas solo a alto nivel (qué debe existir antes), sin plan de sprints.
4. Incluye una sección **“Riesgos de solapamiento”** si dos épicas podrían pisarse y cómo las separas.
5. Cierra con **“Huecos o decisiones pendientes”** (solo lo que impida cerrar bien los límites de épica).

**Formato de salida (markdown)**

1. Tabla: | Épica | Objetivo | Incluye (resumen) | Excluye / límite con otras | Trazabilidad (UC, readme, reglas) |
2. Diagrama o lista breve de **orden de dependencia** entre épicas (opcional).
3. **Cambios respecto al backlog actual** (si comparas con §2 de `backlog.md`): fusionar / partir / renombrar, con motivo en una línea.
4. **Huecos o decisiones pendientes** (sin inventar requisitos).

Si falta información en las fuentes, **no la inventes**: listada como hueco.

---

Actúa como **Product Owner** y **analista de negocio**. Tu trabajo es **descomponer las épicas del MVP en historias de usuario concretas** y **actualizar el fichero** [docs/backlog/backlog.md](docs/backlog/backlog.md) de forma coherente.

**Entradas que debes considerar (todas):**

- Las **fuentes normativas** del propio backlog (cabecera del `backlog.md`: readme, casos de uso, data-model, mongo, kafka, OpenAPI, ADR).
- La **lista de épicas** actual o revisada en `backlog.md` §2, **alineada con los límites y trazabilidad (UC, R#)** que hayas establecido con el **Prompt 2** (épicas: objetivo, incluye/excluye, dependencias, riesgos de solapamiento).
- Si en el chat se ha pegado la **salida del Prompt 2**, úsala como guía explícita para no duplicar ni mezclar responsabilidades entre historias.

**Alcance funcional**

- Cada historia debe cubrir **una intención de valor** clara; si una épica amerita **varias** historias (p. ej. separar flujos, actores o entregables), **divide**; si dos líneas actuales del §3 duplican el mismo requisito, **fusiona** y renumera.
- Formato de historia: **“Como [rol], quiero [acción], para [beneficio]”**.
- Estimación: **S**, **M** o **L**; Prioridad: **Alta**, **Media** o **Baja**, alineado con MVP.
- **No** escribas criterios de aceptación detallados ni BDD en la tabla; **no** inventes requisitos no respaldados por las fuentes.

**Salida obligatoria (solo esto, aplicada sobre `docs/backlog/backlog.md`):**

1. **§3 — Backlog completo en formato tabla**  
   - Sustituye o amplía la tabla con las columnas **exactas**:  
     `| ID | Épica | Título | Historia de usuario | Estimación | Prioridad |`  
   - IDs consecutivos **`HU-001`, `HU-002`, …** (renumera si cambia el número de filas).  
   - Cada fila ha de asignarse a **una épica** de §2 (nombre coherente con la tabla de épicas actual o la revisión del Prompt 2).

2. **Resto del documento** — revisión y actualización **consistente** con el nuevo §3 y con el análisis de épicas (Prompt 2):  
   - **§1** Resumen del MVP: ajústalo si la descomposición revela alcance distinto (sin alargar; 3–5 líneas).  
   - **§2** Lista de épicas: alinea textos si renombraste, partiste o fusionaste épicas.  
   - **§3.1** Desgloses por HU: añade o corrige filas si hay HUs nuevas o IDs cambiados (enlaces solo si existen ficheros; si no, mención “pendiente” según convención [backlog/README.md](docs/backlog/README.md)).  
   - **§4** Suposiciones / huecos: integra nuevos huecos o cierra los que la nueva descomposición resuelva; no contradigas las fuentes.  
   - **§5** Refinar después: prioriza según dependencias entre historias o riesgos detectados al partir épicas.

**Qué no hagas**

- No generes otro documento aparte ni dupliques la tabla fuera de `backlog.md`.  
- No añadas tareas puramente técnicas como historias salvo habilitador imprescindible y citado en fuentes.

**Formato de entrega**

- Entrega el **contenido íntegro actualizado de `docs/backlog/backlog.md`** listo para reemplazar el fichero (o aplica los cambios en el archivo del repositorio si tu entorno lo permite).

---

**Prompt 3 — Definición de historias a partir del listado de `backlog.md`**

[readme]
[Backlog]
[Historia de usuario]

A partir del [readme] y del [Backlog], revisa y completa la siguiente [Historia de usuario].

Objetivo:

- validar que la información existente sea correcta
- comprobar si la historia cumple INVEST
- completar solo la información necesaria para refinamiento y desarrollo

Comprueba la información existente:

- Título descriptivo
- Historia en formato “Como [rol], quiero [acción], para [beneficio]”
- Estimación de complejidad (S/M/L)
- Prioridad

Añade:

- 3 criterios de aceptación en formato BDD con “Dado que / Cuando / Entonces”
- Evaluación breve contra INVEST
- Esfuerzo estimado de implementación
- Riesgos
- Dependencias
- Huecos o aclaraciones necesarias

Reglas:

- No inventes información no respaldada por el readme o el backlog
- Si detectas inconsistencias, indícalas
- Si la historia es demasiado grande, dilo y propone división
- Usa lenguaje claro, concreto y profesional
- Devuelve la respuesta en markdown
- si hay huecos, listarlos en “Aclaraciones pendientes”.

Estructura de salida:

1. Validación de la información existente
2. Historia refinada con
  Criterios de aceptación BDD
     Referencias
3. Evaluación INVEST

Salida: genera un único documento Markdown con esta estructura:

Título # HU-XXX — …
Tabla inicial con: ID, Épica, Título, Estimación de complejidad, Prioridad
Historia de usuario: texto en formato “Como… quiero… para…” sin referencias (sin citas a secciones del PRD ni notas al pie)
Una viñeta final bajo la historia que defina con precisión el entregable de la historia
Alcance con subapartados Incluye y Queda fuera de esta historia (listas con viñetas)
Dependencias
Riesgos
Aclaraciones pendientes (refinamiento)
Criterios de aceptación (BDD) con escenarios en Dado que / Cuando / Entonces
Evaluación INVEST (resumen) en tabla con columnas Criterio y Comentario

Guarda el resultado en HU-XXX_…md (nombre en kebab-case coherente con el título).

---
### 6. Tickets de Trabajo

**Prompt 1:**

Digamos que no tenemos nada —lo cual es cierto— y queremos construir lo suficiente de la **HU-005** para el MVP y para obtener aprendizaje validado. ¿Qué necesitamos construir?

El stack tecnológico y los diagramas de la arquitectura están en [readme.md](readme.md). El equipo está formado por **un ingeniero full-stack** que además tiene conocimientos sólidos de HTML/CSS.

Dame una **lista de tickets** (IDs estables `TASK-HU-005-<nn>`) para implementar el desarrollo, con **orden y dependencias** razonables.

**Salida esperada:** documento [docs/backlog/HU-005-ticket-breakdown.md](docs/backlog/HU-005-ticket-breakdown.md) (patrón `HU-<id>-ticket-breakdown.md`), actualizando el índice en [docs/backlog/README.md](docs/backlog/README.md) y la tabla §3.1 de [docs/backlog/backlog.md](docs/backlog/backlog.md) cuando proceda.

**Prompt 2:**

Actúa como UX/UI Designer Senior + Frontend Engineer especializado en diseño visual para aplicaciones web Vue 3.
Contexto:
- Proyecto: MyTreeLibrary (frontend en Vue 3 + TypeScript).
- Objetivo: elevar la calidad visual de la aplicación.
- Enfoque deseado: estilo muy profesional, moderno, limpio y sencillo (sin sobrecargar la interfaz).
- Restricción: priorizar consistencia, accesibilidad y mantenibilidad.
Tarea:
1) Revisa los estilos actuales del frontend (estructura, tipografía, espaciados, paleta, botones, formularios, estados, layout, responsive).
2) Detecta problemas de consistencia visual, jerarquía, legibilidad y UX.
3) Define una propuesta de sistema de estilos mínimo pero robusto para todo el proyecto.
4) Implementa los cambios necesarios en CSS y componentes para aplicar esa propuesta.
5) Mantén la lógica funcional intacta: solo mejorar apariencia/UX visual.
Criterios de diseño:
- Visual: profesional, moderno, claro, sobrio.
- Simplicidad: evitar adornos innecesarios.
- Coherencia: unificar patrones de botones, inputs, cards, títulos, feedback.
- Accesibilidad: contraste correcto, foco visible, tamaños y espaciados legibles.
- Responsive: buena experiencia en móvil y escritorio.
- Mantenibilidad: usar tokens CSS y clases reutilizables; evitar duplicación.
Entregables esperados:
- Resumen inicial de hallazgos (breve y accionable).
- Sistema visual propuesto:
  - Paleta (tokens)
  - Tipografía (escala)
  - Espaciado (escala)
  - Radios, bordes y sombras
  - Estados (hover, focus, error, success, disabled)
- Cambios implementados en archivos concretos.
- Mini guía de uso para mantener el estilo en futuras pantallas.
Archivos a revisar como mínimo:
- frontend/src/style.css
- frontend/src/App.vue
- frontend/src/views/HomeView.vue
- frontend/src/views/CreateTreeView.vue
- frontend/src/components/** (si aplica)
Reglas de trabajo:
- No introducir librerías UI nuevas.
- No romper rutas ni lógica de negocio.
- Si algo es ambiguo, elige la opción más simple compatible con MVP.
- Mantén textos en español y consistentes con el tono del producto.

**Prompt 3:**

Actúa como Product Designer + UX para una aplicación Vue 3 (MyTreeLibrary).
Quiero que identifiques y propongas la estructura de páginas del MVP teniendo en cuenta 3 tipos de usuario:
1) COLABORADOR (autenticado)
2) ADMINISTRADOR (autenticado)
3) Público (sin login)
Contexto funcional (apóyate en backlog y readme):
- Consulta pública de árboles publicados (listado y detalle).
- Alta/edición de árboles para colaborador y administrador.
- Gestión de maestros y suscripciones para administrador.
- Debe existir una Home que contemple claramente los 3 perfiles.
- Debe decidirse si hace falta menú global o no (y por qué).
Entregables:
1. Mapa de páginas por tipo de usuario (qué ve cada perfil).
2. Propuesta de Home (bloques, CTAs y flujo principal por perfil).
3. Decisión sobre menú:
   - si SÍ: estructura mínima de navegación.
   - si NO: alternativa de navegación (cards/CTAs/rutas directas).
4. Reglas de visibilidad por rol (qué páginas son públicas y cuáles protegidas).
5. Recomendación final para MVP: opción más simple, profesional y escalable.
Formato de respuesta:
- Breve y accionable.
- En español.
- Usa listas claras.
- Sin código.

**Prompt 4:**


Usar Vue 3 con la librería vue-zoomable para crear un visor de fotografía.
El componente debe permitir zoom con la rueda del ratón hasta 600%, usando maxZoom = 6.
El zoom mínimo debe ser 100%, usando minZoom = 1.
Debe permitir pan o desplazamiento arrastrando con el ratón cuando la imagen esté ampliada.
El visor debe tener overflow hidden, fondo oscuro, bordes redondeados y altura responsive.
Debe incluir botón para restablecer zoom y, si la librería lo permite, indicador del porcentaje de zoom.
La imagen debe tener draggable="false", alt accesible y no debe seleccionarse al arrastrar.

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
