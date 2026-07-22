> Prompts principales utilizados durante la creación del proyecto **AERP —
> Academy Enterprise Resource Planning**. Máximo 3 por sección, priorizando los
> de creación inicial y los de corrección o adición de funcionalidades más
> relevantes.
>
> **Herramienta:** Claude Code (Anthropic), modelo Opus, sobre el repositorio
> completo como contexto.
>
> **Fidelidad del registro.** Los prompts marcados **✅ textual** están
> transcritos literalmente de la sesión, con sus erratas incluidas. Los marcados
> **↺ reconstruido** expresan la intención a partir del artefacto que
> produjeron, pero no necesariamente las palabras exactas. Se distingue para no
> afirmar más de lo que el registro puede sostener.

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

**Prompt 1 — Levantamiento inicial por entrevista · ↺ reconstruido**

```
Quiero construir un sistema de gestión para academias de artes marciales
en Chile. Entrevístame para levantar el producto: hazme preguntas hasta
entender el negocio, los usuarios y las restricciones. No asumas
respuestas ni empieces a proponer solución todavía.
```

Produjo el levantamiento inicial y, a partir de él, el PRD funcional, el modelo
de dominio y las épicas. La cláusula *"no asumas respuestas ni empieces a
proponer solución"* evitó el fallo más común: saltar a la arquitectura antes de
entender el dominio.

**Prompt 2 — Separar lo decidido de lo abierto · ↺ reconstruido**

```
Repasa toda la especificación y sepárame lo que ya está decidido de lo que
sigue abierto. Para cada decisión abierta dime qué bloquea y en qué fase
hay que cerrarla. No propongas respuestas: quiero la lista de preguntas.
```

Produjo el documento de decisiones abiertas (D-01 a D-15) que después gobernó
toda la priorización. Al existir una lista explícita de "esto no está decidido",
cada sesión posterior pudo preguntar en vez de inventar.

**Prompt 3 — Ajustar objetivos asumiendo desarrollo con IA · ✅ textual**

```
En el prd-ejecutivo, si se toma en cuenta que vamos a utilizar IA para
desarrollar a cuando podemos ajustar los objetivos del producto, ademas en
los objetivos de negocio pretendo estudiar las leyes que deben cumplir las
academias para tenerlo reflejado en su pagina web, y ser fuerte en la
proteccion de datos
```

Reordenó los objetivos por su **reloj dominante**: la IA comprime *escribir
código*, que no era el camino crítico. Fijó el piso del proyecto (los 90 días de
O-4 no se aceleran) y generó el objetivo de "cumplimiento como producto" (O-7).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1 — Revisar la decisión de persistencia con un número · ✅ textual**

```
La arquitectura propone Aurora Serverless v2. Antes de aceptarlo: calcula
el costo fijo mensual real antes del primer cliente, considerando piso de
ACU, RDS Proxy y NAT Gateway para las Lambdas en VPC. Contrástalo con
DynamoDB puro a la escala de nuestro ICP.
```

Cambió la arquitectura completa: de Aurora Serverless v2 a **DynamoDB
single-table** (sin VPC, sin NAT Gateway, sin RDS Proxy). Pedir el número
concreto —USD 100-150/mes antes del primer cliente— reveló que la opción por
defecto contradecía la restricción de costo proporcional al uso.

### **2.2. Descripción de componentes principales:**

**Prompt 1 — Instrucciones permanentes del proyecto (CLAUDE.md) · contexto persistente**

El prompt más influyente no fue un mensaje de chat sino el archivo `CLAUDE.md`,
cargado automáticamente en cada sesión. Fija las reglas no negociables que
definen los componentes y sus límites, por ejemplo:

```
El tenant viaja en el JWT, nunca en el body. Rechazar cualquier tenant_id
que venga del cliente.
```

Las reglas negativas y verificables (*"nunca X"*, *"ningún Y sin Z"*)
resultaron mucho más efectivas que las aspiracionales.

### **2.4. Infraestructura y despliegue**

**Prompt 1 — Auditoría del Terraform existente · ↺ reconstruido**

```
Audita el Terraform que ya existe en este repositorio. Dime qué crea, qué
está mal y qué es irreversible si no lo corregimos ahora. Ordena los
hallazgos por gravedad.
```

Produjo la auditoría del IaC previo con 19 hallazgos. El de mayor valor: los
atributos custom de un Cognito User Pool son **inmutables e imborrables** una
vez creados, lo que obligaba a recrear el pool *ahora*, con solo usuarios de
prueba. *"Qué es irreversible si no lo corregimos ahora"* ordena por coste de
postergación, no por gravedad abstracta.

### **2.5. Seguridad:**

**Prompt 1 — Énfasis en el núcleo y la ficha médica · ✅ textual**

```
Podemos hacer enfasis que el desarrollo de los primeros modulos de gestion
de alumnos, horarios, fichas medicas, es la prioridad?
```

Estableció que la ficha médica **no es un formulario más**: arrastra al camino
crítico la CMK propia y separada, la auditoría append-only, el RBAC real y los
consentimientos versionados con hash, porque son datos de salud de menores bajo
la Ley 21.719. De ahí la regla: **nunca** implementarla "sin cifrar por ahora".

**Prompt 2 — El límite al investigar leyes · ↺ reconstruido**

```
Estudia la legislación aplicable a las academias en Chile para reflejarla en
su web. Pero no cites ninguna ley de memoria: marca como [POR VERIFICAR] todo
lo que no tenga fuente oficial, y déjame la lista de preguntas para el abogado.
```

Produjo el catastro legal como instrumento de investigación, no como respuesta:
áreas descritas sin número de ley, cada ítem marcado `[POR VERIFICAR]`. Quedó
como riesgo R-17: publicar una obligación legal errónea en el sitio de un
cliente es peor que no publicar nada.

---

## 3. Modelo de Datos

**Prompt 1 — Rediseño desde los patrones de acceso · ↺ reconstruido**

```
Vamos a modelar DynamoDB. Antes de escribir una sola clave, enumera todos
los patrones de acceso del sistema y numéralos. Después diseña la tabla
única para resolverlos con el mínimo de GSIs. Ningún índice sin un patrón
numerado que lo justifique.
```

Produjo 26 patrones de acceso numerados y una tabla única con **3 GSIs**. El
intento previo tenía 14 GSIs con proyección `ALL` por modelar *entidades* en vez
de *patrones*. La restricción *"antes de escribir una sola clave"* impone la
secuencia correcta y fue lo que redujo 14 a 3. Quedó como riesgo permanente R-06
y como regla de revisión.

---

## 4. Especificación de la API

**Prompt 1 — Derivada de la ficha del proyecto · ✅ textual (mismo prompt de §6)**

La API no se levantó con un prompt propio: se derivó de la especificación al
rellenar la ficha (ver el prompt de la sección 6). Se eligieron los tres
endpoints del núcleo prioritario —alta de alumno, publicación del horario y
check-in— y se documentaron en OpenAPI 3.0.

La restricción de diseño que gobernó su especificación viene de las reglas
permanentes: el `tenant_id` **nunca viaja en el body ni en la ruta**, se resuelve
desde el claim del JWT; el endpoint de check-in debe ser **idempotente** por
`(claseId, alumnoId)` para soportar el reenvío offline del tótem.

---

## 5. Historias de Usuario

**Prompt 1 — Construir en paralelo a la validación · ✅ textual**

```
Si, aplicar los cambios pero vamos a priorizar el desarrollo de los modulos
que podemos abordar e infraestructura, en paralelo vamos a ir avanzando, la
idea es tener el mvp de las funcionalidades de gestion de alumnos o
usuarios, gestion de horarios, gestion de disciplinas, modulo de reportes
```

Reestructuró el roadmap en dos carriles paralelos y dividió la Fase 1 en 1a (sin
dinero) y 1b (con dinero). El hallazgo: los módulos pedidos son exactamente los
que no tocan ninguna decisión abierta, lo que permitió la regla *"solo se
construye lo que ninguna entrevista puede invalidar"*. De aquí salen las tres
historias de usuario del núcleo: alta de alumno, ficha médica y publicación de
horario.

---

## 6. Tickets de Trabajo

**Prompt 1 — Rellenar la ficha de entrega · ✅ textual**

```
Ayudame a rellenar esta ficha para el proyecto, la dejas en la rais como un
markdown y ademas deja los prompts mas relevantes en la raiz en un promts.md
[+ plantilla completa de la ficha]
```

Produjo la ficha del proyecto (de la que salen los tres tickets: uno de backend
—alta con unicidad de RUT transaccional—, uno de frontend —formulario de alta
con firma de consentimientos— y uno de base de datos e infraestructura —tabla
single-table con 3 GSIs, Streams, CMK y auditoría). La decisión relevante: las
secciones que exigen un sistema en ejecución (UX, instalación, tests ejecutados,
pull requests) se marcaron como **pendientes** en lugar de rellenarlas con
material verosímil, porque el proyecto está en fase de especificación y no tiene
código todavía.

---

## 7. Pull Requests

**Pendiente — no existen pull requests todavía.** El proyecto está en fase de
documentación técnica (Entrega 1) y no tiene código de aplicación ni historial
de desarrollo. Documentar PRs aquí implicaría inventar artefactos inexistentes.

El flujo de trabajo ya está definido para cuando comience la implementación
(Entrega 2): una épica por rama en el orden del roadmap; toda PR debe acreditar
la Definition of Done (test de aislamiento entre tenants en verde, ningún `Scan`,
ningún GSI sin patrón numerado, eventos de dominio, feature flag, DLQ con
alarma); y **revisión humana línea por línea, obligatoria y no delegable**, en
todo lo que toque `TransactWriteItems`, un GSI nuevo, dinero o ficha médica
(mitigación de R-15).
