# Prompts

Registro de los prompts más relevantes utilizados durante la creación de Cactify, siguiendo la misma estructura de secciones que el `README.md`. Se documentan dos fuentes de IA:

* **ChatGPT** — fase de ideación y definición formal de producto, antes de escribir ninguna línea de documentación técnica ([chats/chatgp1.txt](chats/chatgp1.txt), [chats/primera-definicion-producto.ms](chats/primera-definicion-producto.ms)).
* **Claude Code** — construcción y refinamiento de toda la documentación técnica (README, modelo de datos, historias de usuario, tickets, infraestructura).

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

Fuente: [chats/primera-definicion-producto.ms](chats/primera-definicion-producto.ms) (conversación con ChatGPT).

**Prompt 1:**

> "Actúa como un Product Manager, Solution Architect, Consultor de Startups SaaS, experto en IoT y especialista en validación de productos digitales [...] Tu objetivo no es validar mi idea automáticamente, sino analizarla de forma crítica y objetiva [...] No asumas que la idea es buena únicamente porque sea la propuesta inicial. Evalúala con criterios objetivos y, si consideras que no es adecuada para el Proyecto Final, indícalo claramente." (extracto de un prompt de rol + contexto + instrucciones + formato de salida de ~290 líneas — ver fichero completo)

Fija el problema real (gestionar ~500 cactus manualmente), pide que el MVP sea completamente manual sin depender de hardware, y exige un análisis completo: validación del problema, público objetivo, competencia, MVP con matriz de priorización, historias de usuario, arquitectura, estrategias de captura de datos, riesgos y roadmap. Es la base directa de las secciones 1 y 3 del README (objetivo, alcance del MVP, historias Must/Should-Have).

**Prompt 2:**

> "Hay cosas que me gustarían añadir: Las distintas especies de cactus necesitan distintas composiciones de tierras así que habría que poder añadirlas también, la composiciión mineral/orgánica y con distintas categorías. El registro de especies debería tener también los cuidados asociados aunque esto tiene que poder sobreescribirse en cada cáctus pues no cada individuo también puede variar. También tags para poder hacer búsquedas rápidas"

Este único prompt originó tres funcionalidades que luego se llevaron literalmente al modelo de datos con Claude Code: la mezcla de tierra por especie (`SoilMix`, historia [0.8](docs/user-stories/0.8-registrar-mezcla-de-tierra.md)), el override de cuidados por ejemplar individual (historia [0.7](docs/user-stories/0.7-personalizar-cuidados-de-un-ejemplar.md)) y el catálogo de tags (historia [0.10](docs/user-stories/0.10-etiquetar-cactus-con-tags.md)).

**Prompt 3:**

> "quiero añadir en el roadmap 2 cosas más: Sesonres que registren luz, temperatura, humedad y acided de la tierras / app que capture estos datos de los sensores y se sincronice con el backend / Obviamente esto queda fuera del MVP pero quiero añadirlo al roadmap"

Origen directo de las dos historias de roadmap sobre IoT: la carga automática desde sensor ([F.4](docs/user-stories/F.4-carga-automatica-desde-sensor-iot.md)) y la app móvil con sincronización de sensores por Bluetooth ([F.5](docs/user-stories/F.5-app-movil-sincronizacion-sensores-bluetooth.md)) — esta última reordenada más tarde a máxima prioridad del roadmap (ver sección 5, prompts 2 y 3).

**Cómo se guió al LLM:** a diferencia de la lluvia de ideas inicial y abierta con ChatGPT ([chats/chatgp1.txt](chats/chatgp1.txt)), esta sesión usó un prompt de rol e instrucciones muy estructurado, pidiendo explícitamente que la IA no validara la idea por defecto sino que la cuestionara con criterios objetivos (mercado, competencia, complejidad vs. tiempo disponible). Las rondas de refinamiento posteriores fueron peticiones cortas y muy concretas del usuario, que la IA tradujo cada vez en un modelo de entidades propuesto antes de que se llevara a la documentación técnica definitiva.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

*(sin prompt dedicado — el diagrama de alto nivel se redactó directamente en el README junto con la descripción de componentes)*

### **2.2. Descripción de componentes principales:**

*(sin prompt dedicado)*

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

*(pendiente de detallar hasta que exista código de aplicación; ver prompt 1 de la sección 2.4, que ya fijó dónde vive cada cosa en el repo)*

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> "escribe un CLAUDE.md conciso sobre qué va a ir el proyecto y dónde está cada cosa: backend, frontend, modelo de datos, user stories, tickets, diagramas. Además quiero que se haga un dockerfile para cada uno de los proyectos (backend y frontend) y un iac/local con un docker compose para arrancar ambos y una bbdd postgres"

Petición directa y acotada: documento guía del repo ([CLAUDE.md](CLAUDE.md)) + esqueleto de infraestructura local ([iac/local/](iac/local/)). Se validó la sintaxis del `docker-compose.yml` generado antes de darlo por bueno.

**Prompt 2:**

> "quiero añadir git, ya tengo el github creado que es este: git@github.com:dnavarro-bj/AI4Devs-finalproject.git"

Inicialización del repositorio y conexión al remoto ya creado por el usuario. Se guio explícitamente a no hacer commit todavía ("no quiero que hagas ningún commit de momento"), respetado en todas las sesiones posteriores hasta que el usuario lo pidió expresamente.

### **2.5. Seguridad**

*(pendiente — sin prácticas de seguridad implementadas todavía, no hay código de aplicación)*

### **2.6. Tests**

*(pendiente — no hay código de aplicación todavía)*

---

## 3. Modelo de Datos

**Prompt 1:**

> "el proyecto va tomando forma pero el modelo es bastante pobre y quiero añadir alguna cosilla más como mix de soil que va a necesitar cada cactus (dividiendo porcentajes de orgánico y mineral) así que hay que añadir una funcionalidad para registrar estas tierras y luego poder añadirlo en las especies"

Petición de ampliar el modelo con una nueva entidad de dominio (`SoilMix`). El asistente propuso el diseño (catálogo reutilizable vs. campos embebidos en `Species`) y se confirmó la opción de catálogo 1:N mediante pregunta directa antes de implementarla.

**Prompt 2:**

> "me gustaría añadir también localizaciones para estos cactus y un registro de tags para poder buscarlos de forma sencilla (globulares, pequeños, sin espinas, híbridos, etc)"

Ampliación de modelo con dos entidades nuevas (`Location`, `Tag`). Se preguntó explícitamente por la forma de la relación (catálogo plano vs. jerárquico para `Location`; N:M con tabla intermedia vs. array de strings para `Tag`) antes de tocar ningún fichero.

**Prompt 3:**

> "dime el estado actual del proyecto y esta ultima conversacion de definicion que te he pasado y dime que falta, diría que añadir la acided del soilmix y en el registro de datos de los cactus"

En vez de pedir el cambio directamente, el usuario pidió primero un contraste entre lo ya documentado y [primera-definicion-producto.ms](chats/primera-definicion-producto.ms) (que sí mencionaba el pH como variable de sustrato a monitorizar). El asistente confirmó el hueco exacto — faltaba en `SoilMix` y en `CareRecord` — y propuso dónde encajaba cada campo antes de tocar nada; el usuario confirmó con un simple "si, haz todo eso". Resultado: `phMin`/`phMax` como rango recomendado en `SoilMix` (mismo patrón que humedad/temperatura en `Species`) y `soilPh` como lectura real en `CareRecord`.

**Cómo se guió al LLM:** cada ampliación de modelo se trató como una decisión de diseño, no como una ejecución directa — se le pidió al asistente plantear alternativas concretas (con trade-offs) y se eligió una explícitamente antes de propagar el cambio a modelo de datos, README, historias de usuario y tickets a la vez, manteniendo todo consistente.

---

## 4. Especificación de la API

*(sin prompt dedicado — los endpoints se fueron añadiendo como consecuencia directa de cada cambio de modelo de datos, documentados junto a él; ver sección 3)*

---

## 5. Historias de Usuario
**Prompt 1:**

> "está bastante bien, me gustaría en docs, crear una carpeta para user stories e ir añadiendo ahí un archivo por userstory, otra carpeta de tickets y un archivo por ticket. En las historias de usuario quiero añadir más aunque no entren (las historias deben de ser del tipo 0.1 - Registrar cactus...) y las que no entren en el alcance tendrán que tener una codificación distinta para que estén al final del todo"

Definió la convención de organización (`0.x` para alcance MVP, `F.x` para roadmap, un fichero por historia) que se ha mantenido durante todo el proyecto.

**Prompt 2:**

> "quiero que añadas una app movil en el roadmap"

Alta inicial de una historia de roadmap (`F.x`) genérica de app móvil.

**Prompt 3:**

> "la app movil para registrar via bluetooth los datos de los sensores y que se sincronice con el backend debería tener mucha más prioridad creo yo"

Corrección de prioridad sobre el prompt anterior: obligó a renumerar todo el bloque `F.x` (respetando que "el orden de los archivos es el orden de prioridad", regla fijada en el prompt 1) y a reformular la historia genérica de "app móvil nativa" como algo concreto (sincronización de sensores por Bluetooth, historia [F.5](docs/user-stories/F.5-app-movil-sincronizacion-sensores-bluetooth.md)), en vez de mantenerla como placeholder de baja prioridad.

**Cómo se guió al LLM:** primero se fijaron las reglas de organización del repositorio (una historia/ticket por fichero, convención de numeración por prioridad); después, el feedback de priorización en lenguaje natural ("mucha más prioridad") se tradujo en una operación mecánica pero delicada (renumerar 9 ficheros, arreglar enlaces cruzados y cabeceras), verificando al final que no quedaran referencias rotas.

---

## 6. Tickets de Trabajo

*(misma convención de organización que las historias de usuario — ver prompt 1 de la sección 5, que creó a la vez las carpetas `docs/user-stories/` y `docs/tickets/` con un fichero por ticket)*

---

## 7. Pull Requests

*(pendiente — se documentará aquí una vez abiertas las PRs de cada entrega)*

---

## Notas generales de uso de la IA

* Todo el trabajo de documentación (README, modelo de datos, historias, tickets, diagramas Mermaid) se ha generado con Claude Code, siempre a partir de instrucciones en español dadas de forma incremental, revisando cada resultado antes de pedir el siguiente cambio.
* La fase de producto tuvo dos etapas, ambas antes de empezar a usar Claude Code: primero una lluvia de ideas abierta con ChatGPT ([chatgp1.txt](chats/chatgp1.txt) / [chat gpt 1.pdf](chats/chat%20gpt%201.pdf), y [chat gpt 2.pdf](chats/chat%20gpt%202.pdf)) para decidir el dominio, arrancada con el prompt "Tengo unos 500 cactus y como entenderás, gestionarlos todos es bastante lío [...]"; después un análisis formal con prompt estructurado de rol ([primera-definicion-producto.ms](chats/primera-definicion-producto.ms), sección 1 de este documento).
* Ajuste humano constante: ninguna entidad o decisión de alcance se ha aceptado tal cual la propuso la IA sin al menos una pregunta de confirmación (tipo de relación de datos, alcance del MVP vs. roadmap, nombres de campos); varias funcionalidades sugeridas por ChatGPT (hardware IoT, riego físico automatizado, visión artificial) se descartaron explícitamente del MVP por exceder las ~30h disponibles.
