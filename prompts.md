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

```
Como experto en análisis de software vas a diseñar y documentar un sistema de software siguiendo estas fases:
1- Investigación y análisis
2- Casos de uso
3- Modelado de datos
4- Diseño de alto nivel

No lo vamos a hacer todo de golpe, vas a empezar por la primera fase y a partir de ahí me vas a ir ayudando con el resto, haciendo las preguntas que consideres necesarias en cada fase para hacer el diseño siguiendo las mejores prácticas del sector, y para documentarlo al detalle.

El sistema a diseñar y documentar es el Adresles: una startup que quiere desarrollar un plugin para Tiendas Online con el cual poder realizar las compras sin necesidad de introducir la dirección de entrega. La ventaja que quiere aportar Adresles es una mejor experiencia para el usuario y una compra más rápida, sin fricciones. Para hacerlo realidad luego Adresles se pone en contacto con el usuario vía WhatsApp o mediante canal propio en aplicación, mediante el cual, usando LLM's, le pregunta la dirección de entrega con lenguaje natural y la actualiza en el ECommerce. Todavía no hay nada creado, así que también toca ponerse el gorro de product manager y definir esas funcionalidades clave que harán brillar a Adresles por encima de los competidores. De momento quiero desarrollar un sistema agéntico para las conversaciónes con los usuarios usando , de momento, el modelo GPT 4.0 de OpenAI. Quiero simular que a la palicación le llega toda la información sobre la compra realizada por el usuario, y a partir de ahí se desencadena la conversación por WhatsApp. Hay que tener en cuenta que las conversaciones serán diferentes en función de los distintos Journeys posibles por el Usuario:

- Compra Tradicional Normal -> cuando el usuario no ha usado todavía el modo Adresles: El agente tiene que informarle de la compra realizada en la Tienda online, y le invita a registrarse con  Adresles.
- Compra Adresles -> cuando el usuario usa el modo Adresles en el Checkout de la Tienda online, es decir, sólo indica su Nombre y Apellidos, y el número de teléfono. Para este Journey hay otros subjourneys:
    - El Usuario está registrado en Adresles:
        - El Usuario tiene una dirección favorita guardada en Adresles: El agente le informa que ha realizado una compra en la Tienda Online y le propone la dirección guardada en su Libreta de Direcciones Adresles para enviarle el pedido, dándole la opción de cambiarla si quiere.
        - El Usuario no tiene una dirección guardada en Adresles: El agente le informa que ha realizado una compra en la Tienda Online y le pregunta a qué dirección quere enviarla.
    - El Usuario está registrado en el ECommerce:
        - El Usuario tiene una dirección favorita registrada en el ECommerce: El agente le informa que ha realizado una compra en la Tienda Online y le propone la dirección guardada en la Tienda Online para enviarle el pedido, dándole la opción de cambiarla si quiere. Y, si el Usuario no está registrado en Adresles, le invita a registrarse con  Adresles.
        - El Usuario no tiene ninguna dirección registara en el ECommerce: El agente le informa que ha realizado una compra en la Tienda Online y le pregunta a qué dirección quere enviarla. Y, si el Usuario no está registrado en Adresles, le invita a registrarse con  Adresles.
    - El Usuario no está registrado en el ECommerce ni en Adresles: El agente le informa que ha realizado una compra en la Tienda Online y le pregunta a qué dirección quere enviarla, y le invita a registrarse con  Adresles.

Adicional en Adresles añadimos la opción Regalo, es decir, que el comprador indique que queire regalar el pedido a otra persona, indicando adicionalmente su nombre y apellidos y sólo el número de teléfono. Adresles se pondrá en contacto con ambas personas: con el regalado para preguntarle por la dirección de entrega (o proponerle directamente su dirección favorita si está ya registrado en Adresles y tiene una dirección favorita en su Libreta de Direcciones Adresles), y con el comprador para informarle de la compra que ha hecho y el proceso que está llevando a cabo con el regalado.

La aplicación que queremos crear ahora es la de orquestación de toda esta conversación con OpenAI, y la visualización de la misma. De momento simulamos la recepción de la información con un json, así como la escritura de la infromación recibida en la Tienda Online. Pero sí vamos a necesitar una base de datos para guarda la información de Adresles (ECommerces, Tiendas, Plugins, Usuarios, Direcciones, Conversaciones). Yo había pensado utilizar una Base de Datos tipo Dynamo DB, pero queda totalmente abierto al mejor análisis (sólo quiero que se contemple el uso de Dynamo DB en ese análisis)

Tu misión es diseñar la primera versión del sistema, entregando los siguientes artefactos:
- Descripción breve del software Adresles, valor añadido y ventajas competitivas.
- Explicación de las funciones principales.
- Añadir un diagrama Lean Canvas para entender el modelo de negocio.
- Descripción de los 3 casos de uso principales, con el diagrama asociado a cada uno.
- Modelo de datos que cubra entidades, atributos (nombre y tipo) y relaciones.
- Diseño del sistema a alto nivel, tanto explicado como diagrama adjunto.
- Diagrama C4 que llegue en profundidad a uno de los componentes del sistema, el que prefieras.

Vamos a ir documentando todo en un único documento Markdown (.md) con el nombre Adresles_Business.md
```

> **Resumen de objetivos alcanzados:** Se inició el diseño completo del sistema Adresles. Se creó el documento `Adresles_Business.md` con la estructura inicial, incluyendo la descripción del software, propuesta de valor, ventajas competitivas, funciones principales, Lean Canvas en formato visual, y la identificación de los 5 User Journeys principales. Se plantearon 12 preguntas de clarificación para afinar el diseño.

---

**Prompt 2:**

```
1. Cobro por transacción al ECommerce, con un fee inversamente variable en función del importe total de la compra (máxima de un 5% para importes <=10eur, hasta una mínima fee de un 2.5% para importes >= 100eur, lineal) con una prueba gratuita de un mes.
2. Empezaremos con WooCommerce, luego PrestaShop -> Magento -> Shopify.
3. La queremos hacer Global desde un inicio, multilengua y multi currency.
4. El identificador único será el número de teléfono, si dos personas comparten teléfono el sistema no lo sabrá, y de estar registrado, Adresles se dirigirá  al nombre y apellidos registrados con ese número de teléfono.
5. Hay un tiempo de espera de 15min, pasado el cual se empezará un flujo de reminders.
6. Sí, tenemos que incluir un servicio de validación de direcciones con GMaps para asegurar validación y normalización. Adicional, queremos que el LLM avise al usuario la necesidad de indicar escalera, bloque, piso o puerta en aquella direcciones que no se detecte y que sean susceptibles de pertnecer a un edificio, o dudas razonables al respecto.
7. Bajo tu mejor criterio, pero dejando claro al usuario qué dirección está escogiendo para cada pedido, y asegurando que luego no confunda direcciones a la hora de actualizarlas en cada tienda online correspondiente.
8. Sera multiidioma, detectando previamente el idioma usado por el usuario (esto de momento lo simularemos).
9. Sí, enviando un correo a un email de soporte de Adresles resumiendo la incidencia.
10. De momento no. Sólo tiene que recordar toda la conversación referente a los pedidos activos (no completados).
11. De momento no vamos a integrar WhatsApp, lo vamos a hacer con un frontend de aplicación.
12. No entiendo la diferencia entre Webhook estándar o API polling, favor de clarificar. Puede que dependa de cada plataforma, a lo que se ajuste mejor.
```

> **Resumen de objetivos alcanzados:** Se definió el modelo de monetización (fee variable 2.5%-5%), el roadmap de plataformas (WooCommerce primero), alcance global multiidioma/multi-moneda, teléfono como identificador único, timeout de 15 minutos con flujo de reminders, integración con Google Maps API para validación de direcciones con detección inteligente de datos faltantes en edificios, escalado a soporte por email, y frontend propio en lugar de WhatsApp. Se actualizó el documento con la Fase 2 completa (3 casos de uso con diagramas).

---

**Prompt 3:**

```
En @Adresles_Business.md hay 3 casos de uso definidos, pero no se está teniendo en cuenta que vamos a "mockear" toda la interacción con la tiendas online. A nuestra aplicación sólo le va a llegar un json con los datos de la compra (la tienda online, el número de pedido en la tienda, los datos del comprador, los datos de la dirección de entrega si existen, soi la compra se ha hecho en modo adresles o tradicional, si es para regalo, los datos del regalado si existen, etc.), es decir, todos los datos extraídos en fase del checkout de la compra realizada en la Tienda Online. Y nosotros queremos desarrollar la aplicación para, mediante el uso de GPT, ponernos en contacto con el comprador y solicitar o confirmar la dirección de entrega, para luego simular una vez más la actualización de estos datos en el ECommerce.
Entoces el Caso CU-01 se reduciría a mockear la llegada de datos a nuestra aplicación, la simulación de conversación y confirmación de dirección con el cliente (que es básicamente el Caso CU-02), simular la entrega del la dirección al EComemrce, y por último, la simulación de conversasción para solictar el registro voluntario del cliente en Adresles.
El CU-02 se desarrollaría al completo, con toda la configuración necesaria con los servicios de OPENAI (para la conversación) y GMAPS (para la validación de la dirección).
El CU-03 yo lo integraría como flujo alternativo al CU-01, simplemente que en este caso se simularía una compra con regalo, y se tendrían que simular dos conversaciones síncronas, una con el comprador y otra con el regalado.
Y añadiría otro caso de uso CU-04 para desarrollar la solicitud de registro a Adresles por Conversación.
Revisa en profundidad @Adresles_Business.md , y, como IA experta en desarrollo de producto con más de 20 años de experiencia, actualiza los Casos de Uso definidos en función de lo explicado.
Pregúntame todo lo que se necesario para poder ejecutar la tarea perfctamente.
```

> **Resumen de objetivos alcanzados:** Se redefinió el MVP con enfoque mock. Se creó plan detallado para actualizar los 3 casos de uso: CU-01 cambió a "Procesar Compra Mock" con entrada JSON manual, viejo CU-03 (Modo Regalo) se integró como FA-1 en CU-01, se eliminó sección 2.4 completa del viejo CU-03, se creó nuevo CU-03 "Solicitud de Registro Voluntario" en nueva sección 2.4. Se eliminó flujo de reminders automáticos (marcado pendiente post-MVP). Se actualizaron todos los diagramas PlantUML y de secuencia. Documento actualizado de v1.2 a v1.3 (2170 líneas).

---

**Prompt 4:**

```
Revisa y actualiza @memory-bank con los cambios realizados en @Adresles_Business.md
```

> **Resumen de objetivos alcanzados:** Se actualizó completamente el memory-bank para reflejar cambios en v1.3: `business-doc-map.md` con nuevos CU y referencias actualizadas, `overview.md` con sección MVP Mock diferenciando implementación real (OpenAI, GMaps) vs mock (entrada JSON, simulación), `domain-glossary.md` con 6 nuevos términos específicos de MVP Mock, y `README.md` con versión y fechas actualizadas.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

```
Para la Fase 4 voy a necesitar más ayuda tuya, como IA senior experta en Arquitectura de software con más de 20 años de experiencia.
1. Tú que recomiendas? O que diferencias importantes hay entre una u otra
2. El Hosting frontend me gustaría poder meterlos en un servidor dedicado que tengo con Konsole H, pero no sé si se puede o las complicaciones que puedo tener.
3. Explícame mejores prácticas, diferencias y tus recomendaciones
```

> **Resumen de objetivos alcanzados:** Se realizó un análisis exhaustivo comparando Microservicios vs Monolito Modular, recomendando Monolito Modular para el MVP con extracción estratégica futura. Se evaluó la viabilidad de hosting en servidor dedicado (Konsole H) con análisis de trade-offs vs servicios cloud managed. Se recomendó arquitectura híbrida: Dashboard en Vercel (free tier) y Backend en servidor dedicado. Se explicaron mejores prácticas de frameworks frontend, recomendando React+Vite para Chat App y Next.js para Dashboard Admin.

---

### **2.2. Descripción de componentes principales:**

> Los componentes principales fueron definidos como parte de la Fase 4 en respuesta al prompt de arquitectura (2.1), incluyendo: API Backend (NestJS), Worker de Conversaciones (BullMQ), Chat App (React), Dashboard Admin (Next.js), Redis (cache/colas), y servicios externos (Supabase, DynamoDB, OpenAI, Google Maps).

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

```
Si, procede con la Fase 4 con las recomendaciones realizadas, usando Node.js como backend y usando Docker para el deployment en el servidor (aunque mi experiencia es limitada, he trabajado con ellos pero no he hecho con CI/CD con dockers)
```

> **Resumen de objetivos alcanzados:** Se completó la Fase 4 del documento incluyendo: Diagramas C4 completos (Contexto, Contenedores, Componentes del módulo Conversations), estructura detallada del proyecto como monorepo con pnpm+Turborepo, diagramas de secuencia para flujos principales (Checkout completo y Reminders), configuración Docker Compose lista para usar, pipeline CI/CD con GitHub Actions con comentarios explicativos adaptados al nivel de experiencia del usuario, checklist de seguridad, y especificación OpenAPI de endpoints principales.

---

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> La infraestructura y despliegue fueron definidos en la Fase 4 como respuesta al prompt anterior (2.3), incluyendo: Docker Compose con Traefik como reverse proxy con SSL automático (Let's Encrypt), configuración de servicios (API, Worker, Redis, Chat App), setup inicial del servidor para CI/CD, y secrets necesarios en GitHub Actions.

---

### **2.5. Seguridad**

> Las consideraciones de seguridad fueron incluidas en la Fase 4 como parte integral del diseño, incluyendo: capas de seguridad (perímetro, aplicación, datos), checklist completo de medidas de seguridad, ejemplo de Row Level Security (RLS) en Supabase para aislamiento multi-tenant.

---

### **2.6. Tests**

> Pendiente de desarrollo en fases posteriores del proyecto.

---

### 3. Modelo de Datos

**Prompt 1:**

```
He revisado lo realizado y actualizado lo ya realizado. Lée la nueva versión antes de seguir con la sigueinte fase de Modelado de Datos, para la cual te respondo a las pregntas: 
1 Incialmente se debe guardar el historial completo por un cierto periodo de tiempo (a definir), incuyendo metadata, que es lo único que se conservará pasado cierto tiempo (hay que crear política de conservación de data)
2 Sí, se necesita Auditoría
3 Pueden elminarlas, pero las direcciones asociadas en los pedidos tienen que persistir y mantenerse invariables una vez confirmadas (anque el usuario modifique a posteriori uan de esas direcciones en su Libreta de Direcciones)
4 Cada eCommerce sólo ve los datos de sus tiendas, pero un eCommerce (determinado por una Razón Social única), puede tener más de una tienda asociada (determinada por una única url de acceso algo totalmete y únicamente distintivo).
5 Por experiencia previa y uso de otros ambientes en AWS, nada más.
```

> **Resumen de objetivos alcanzados:** Se completó la Fase 3 de Modelado de Datos incluyendo: análisis comparativo DynamoDB vs PostgreSQL/Aurora con decisión de arquitectura híbrida, modelo E-R completo con todas las entidades y relaciones, diccionario de datos detallado para 11 tablas (Supabase y DynamoDB), política de retención de datos (90 días mensajes, 2 años metadata, 7 años pedidos), y diagramas de estados para Order, Conversation y GiftRecipient.

---

**Prompt 2:**

```
Primero realiza los siguientes cambios en la documentación generada hasta ahora:
- Mantén el uso de una base de datos híbrida, pero cambia el uso de Aurora por una Supabase.
- Cambia todos los diagramas, flujos y modelos entidad-relación a formato mermaid o plantUML, según lo que se necesite de acuerdo a las mejores prácticas.
- El GiftRecipient no depende del User, sino de la Order, una Order puede tener o no GiftRecipient (aunque sea una cosa que decida el comprador User)
- Incluye en la Conversación el tipo de conversación (information, get_address, register, etc.) y cambia el nombre que ahora está de type por user_type (buyer | recipient), y se ha de incluir más información sobre el buyer o el recipient (si ya está registrado en Adresles y si ya está registrado en el ECommerce).
```

> **Resumen de objetivos alcanzados:** Se actualizó el documento completo con: cambio de Aurora PostgreSQL a Supabase (manteniendo arquitectura híbrida), conversión de todos los diagramas ASCII a formato Mermaid y PlantUML, corrección de la relación GiftRecipient para que dependa únicamente de Order (eliminando FK a User), ampliación de la entidad Conversation con nuevos campos: `conversation_type` (INFORMATION, GET_ADDRESS, REGISTER, GIFT_NOTIFICATION, SUPPORT), renombre de `type` a `user_type` (BUYER | RECIPIENT), y flags de contexto (`is_registered_adresles`, `is_registered_ecommerce`, `has_address_adresles`, `has_address_ecommerce`).

---

### 4. Especificación de la API

**Prompt 1:**

```
Eres un Asistente IA de planificación técnica para el proyecto Adresles. Tu tarea es **planificar paso a paso** el desarrollo del **Caso de Uso 1 (CU-01): Procesar Compra desde eCommerce (Mock)**.

---

## CONTEXTO OBLIGATORIO

Antes de planificar, debes leer y entender:

1. **Adresles_Business.md** – Especialmente:
   - Sección 2.2: Caso de Uso 1 (flujo principal, FA-1 Modo Regalo, FA-2 Compra Tradicional)
   - Sección 2.1: Actores del sistema
   - Sección 3: Modelado de datos (tablas order, user, order_address, gift_recipient)
   - Sección 4.5: Estructura del proyecto
   - Sección 4.8: Diagrama de secuencia "Procesar Compra Mock"

2. **memory-bank/README.md** – Para entender:
   - Flujo de trabajo con OpenSpec
   - ADRs relevantes
   - Referencias a specs (backend-standards, data-model)

3. **memory-bank/project-context/overview.md** – Para el alcance MVP (mock vs real)

---

## REGLAS DE PLANIFICACIÓN

### 1. Metodología paso a paso

- **No avances** al siguiente paso hasta que el anterior esté claro y validado.
- Presenta cada paso con: objetivo, entregables, criterios de aceptación y dependencias.
- Si un paso es ambiguo o tiene varias opciones, **detente y pregunta** antes de continuar.

### 2. Preguntas en cualquier momento

- **Puedes y debes preguntar** cuando:
  - Falte información en la documentación
  - Haya ambigüedad técnica o de negocio
  - Existan varias alternativas razonables
  - Necesites priorizar entre flujos (principal, FA-1, FA-2)
  - Tengas dudas sobre el alcance MVP (qué mockear vs qué implementar real)
- Indica explícitamente: *"Antes de continuar, necesito aclarar: [pregunta]"*.
- No asumas decisiones importantes sin confirmar.

### 3. Integración con OpenSpec

- **Desde el momento en que se vaya a escribir código**, la planificación debe incluir el uso de **OpenSpec**.
- El flujo de implementación será:
  1. Crear un change con `openspec new change` (ej: `cu01-procesar-compra-mock`)
  2. Crear artefactos en orden: proposal → specs → design → tasks
  3. Implementar siguiendo las tareas con `openspec apply`
  4. Archivar el change al completar
- Los artefactos deben alinearse con:
  - `openspec/specs/backend-standards.mdc`
  - `openspec/specs/data-model.md`
  - Estructura del monorepo en `Adresles_Business.md` sección 4.5

---

## ESTRUCTURA DEL PLAN QUE DEBES GENERAR

### Fase 0: Validación de contexto (antes de planificar)

1. Confirmar que has leído los documentos indicados.
2. Resumir en 3–5 líneas qué hace el CU-01 y qué actores intervienen.
3. Preguntar si hay restricciones adicionales (plazos, prioridades, tecnologías).

### Fase 1: Descomposición del CU-01

1. Listar los **flujos** a implementar:
   - Flujo principal (modo Adresles sin dirección)
   - FA-1: Modo Regalo (con subflujos FA-1.1 y FA-1.2)
   - FA-2: Compra Tradicional con dirección
2. Para cada flujo, identificar:
   - Pasos del caso de uso
   - Entidades/tablas afectadas
   - Integraciones externas (Google Maps, OpenAI, etc.)
   - Dependencias con CU-02 y CU-03
3. Preguntar si se prioriza algún flujo para el MVP o si se implementan todos en paralelo.

### Fase 2: Plan de implementación por capas

1. **Infraestructura y datos**
   - Migraciones/creación de tablas en Supabase
   - Configuración DynamoDB (si aplica para conversaciones)
   - Seeds o datos de prueba para mock
2. **Backend (API NestJS)**
   - Endpoint(s) para recibir JSON mock de compra
   - Servicios: Orders, Users, Conversations
   - Lógica de orquestación (crear Order, buscar/crear User, iniciar conversación)
3. **Worker y conversaciones**
   - Integración con CU-02 (obtención de dirección por IA)
   - Cola BullMQ y procesamiento asíncrono
4. **Simulación eCommerce**
   - Mock de actualización de dirección (log estructurado o notificación)
5. **Frontend Mock UI (si aplica)**
   - Interfaz para introducir JSON de compra manualmente

Para cada capa, indica:
- Tareas concretas
- Orden de implementación
- Dependencias entre tareas

### Fase 3: Integración con OpenSpec

1. Definir el **nombre del change** (kebab-case): ej. `cu01-procesar-compra-mock`.
2. Describir el contenido de cada artefacto:
   - **Proposal**: Resumen del CU-01, alcance, flujos incluidos
   - **Specs**: Contratos API, DTOs, esquemas de JSON mock
   - **Design**: Diagramas de secuencia actualizados, decisiones técnicas
   - **Tasks**: Lista de tareas ordenadas por dependencias
3. Indicar en qué momento se ejecuta `openspec new change` y cuándo se pasa a `openspec apply`.

### Fase 4: Criterios de aceptación y verificación

1. Definir cómo se verificará cada flujo:
   - Flujo principal: JSON mock → Order creado → Conversación iniciada → Dirección confirmada → Order SYNCED
   - FA-1: JSON con `is_gift: true` → Dos conversaciones paralelas → Dirección regalado → SYNCED
   - FA-2: JSON con `mode: "tradicional"` → Order ADDRESS_CONFIRMED → Conversación informativa → SYNCED
2. Proponer tests (unitarios, integración, E2E) según backend-standards.

---

## ENTREGABLES ESPERADOS

1. **Plan de desarrollo** en formato estructurado (markdown o lista numerada).
2. **Puntos de decisión** explícitos donde debas preguntar al usuario.
3. **Checklist de OpenSpec** integrado en el plan (cuándo crear change, artefactos, apply, archive).
4. **Orden de implementación** claro, con dependencias entre tareas.

---

## RECORDATORIO FINAL

- Avanza **paso a paso**; no saltes fases.
- **Pregunta** siempre que haya duda o ambigüedad.
- **Integra OpenSpec** desde el inicio de la fase de implementación.
- Usa la documentación del proyecto como fuente de verdad; si algo contradice el Business.md, señálalo y pregunta.
```

**Respuestas a la planificación del plan:**

- **Priorización**: Flujo principal + FA-2 (tradicional) primero; FA-1 (modo regalo) en fase posterior.
- **Store mock**: Store mínimo en seeds (validar existencia).
- **Cálculo de fee**: Implementar fórmula de pricing (2.5%-5%) en creación de Order.
- **FA-1 (Regalo)**: Change separado `cu01-fa1-modo-regalo` para mantener scope manejable.

> **Resumen de objetivos alcanzados:** Se generó el plan CU-01, artefactos OpenSpec (proposal, specs mock-orders-api, design, tasks) y la implementación base: endpoint POST /api/mock/orders, DTOs, servicios NestJS, Worker BullMQ, Mock UI y seeds.

---

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 8. Gestión de Documentación y Workflow de Desarrollo

### **8.1. Configuración del Memory-Bank**

**Prompt 1:**

```
Es compatible activar un memory-bank con el SDD que estamos implementando en este repositorio? Analiza como tendría que trabajar para no estorbarse y acabar generando documentos duplicados en el memory-bank y en @openspec (concretamente con @openspec/changes ). Como IA experta en desarrollo de software SDD, cuál sería tu opinión al respecto y la mejor práctica a implementar. Puedes dar más de una opción, con los pros y contras de cada una de ella. Y pregúntame las dudas que tengas al respecto para poder generar una respuesta más adecuada a mi contexto
```

> **Resumen de objetivos alcanzados:** Se analizó la compatibilidad entre memory-bank y OpenSpec, identificando 4 opciones de integración con sus pros y contras. Se recomendó la opción de "Memory-Bank como capa de contexto superior" donde el memory-bank almacena contexto de proyecto persistente (arquitectura, decisiones, stack) mientras OpenSpec maneja cambios específicos por feature. Se clarificaron aspectos clave: uso de directorio `memory-bank/` sin punto, propósito de mantener contexto entre sesiones de IA y documentar decisiones arquitecturales de alto nivel.

---

**Prompt 2:**

```
Primero te respondo las preguntas de clarificación: 1 - Un directorio memory-bank (sin el punto) 2 - Contexto del proyecto actualizado, incluyendo las decisiones arquitecturales históricas. 3 - Uso Cursor para desarrollo, normalmente en sesiones cortas, para no colapsar la ventana de contexto, y sólo estoy trabajando yo. Respecto a tu última pregunta: a) Mantener contexto entre sesiones de IA (memoria persistente) y b) Documentar decisiones arquitecturales de alto nivel
```

> **Resumen de objetivos alcanzados:** Se definió el propósito preciso del memory-bank: actuar como memoria persistente entre sesiones cortas de IA y documentar decisiones arquitecturales (ADRs). Se estableció la estrategia de integración con el documento `Adresles_Business.md` usando el memory-bank como capa de síntesis e indexación inteligente que referencia el documento completo, minimizando duplicación.

---

**Prompt 3:**

```
Puedo integrar @Adresles_Business.md en el memory-bank para no repetir documentación en sitios distintos?
```

> **Resumen de objetivos alcanzados:** Se diseñó una estrategia de integración donde el memory-bank no duplica el contenido de `Adresles_Business.md`, sino que actúa como capa de navegación y síntesis. Se propuso crear: `README.md` maestro, `overview.md` ejecutivo (80 líneas), `tech-stack.md`, ADRs que referencian secciones específicas del Business.md, y un `business-doc-map.md` para navegación rápida del documento de 2130 líneas.

---

**Prompt 4:**

```
Crea la estructura inicial del memory-bank y genera los documentos que la deben contener en esta fase, tal y como has descrito, con referencias a @Adresles_Business.md. En Fases posteriores iremos actualizando y evolucionando el memory-bank con información más actualizada.
```

> **Resumen de objetivos alcanzados:** Se creó la estructura completa del memory-bank con 11 archivos markdown:
> - `README.md`: Índice maestro con enlaces a todas las secciones
> - `project-context/overview.md`: Resumen ejecutivo de 80 líneas sobre Adresles
> - `project-context/tech-stack.md`: Stack tecnológico detallado (NestJS, Supabase, DynamoDB, OpenAI, etc.)
> - `project-context/domain-glossary.md`: Glosario de términos de dominio
> - `architecture/_template.md`: Template para futuros ADRs
> - `architecture/001-monolith-modular.md`: ADR sobre arquitectura modular
> - `architecture/002-supabase-dynamodb.md`: ADR sobre base de datos híbrida
> - `architecture/003-nestjs-backend.md`: ADR sobre elección de NestJS
> - `architecture/004-openai-gpt4.md`: ADR sobre motor conversacional
> - `references/business-doc-map.md`: Mapa de navegación del Business.md
> - `patterns/.gitkeep` y `sessions/.gitkeep`: Directorios para futuro crecimiento
> - `SETUP-COMPLETE.md`: Resumen de setup y guía de uso

---

### **8.2. Integración OpenSpec con Memory-Bank**

**Prompt 1:**

```
En función del nuevo memory-bank creado: 
- Revisa y actualiza los documentos en @openspec/specs para que hagan referencia al stack utilizado en este proyecto, pero manteniendo exactamente el mismo formato y estructura, y minimizando los cambios (para no cambiar el comportamiento de openspec, sólo optimizarlo) 
- Revisa de forma general toda la carpeta @openspec para identificar posibles cambios @openspec/.agents o en los @openspec/.commands para añadir al flujo de openspec que revise primero los documentos del memory-bank, si es que lo consideras realmente necesario. 
- Revisa y actualiza @openspec/config.yaml de ser necesario para adecuarlo a nuestro flujo de trabajo
```

> **Resumen de objetivos alcanzados:** Se creó un plan detallado de actualización de OpenSpec con 8 archivos a modificar:
> 
> 1. **openspec/config.yaml**: Añadida sección `context` completa con referencias al memory-bank, stack tecnológico (NestJS, Supabase, DynamoDB, OpenAI GPT-4, Google Maps), dominios DDD, y descripción del proyecto Adresles.
> 
> 2. **openspec/specs/backend-standards.mdc**: Actualizado de Express a NestJS, PostgreSQL a Supabase+DynamoDB, añadidos servicios externos clave (OpenAI, Google Maps, Redis, BullMQ), actualizada estructura del proyecto para arquitectura modular NestJS con bounded contexts, actualizada sección de DI para NestJS, y cambiado deployment de Serverless a Docker Compose.
> 
> 3. **openspec/specs/frontend-standards.mdc**: Clarificadas las dos aplicaciones frontend (Chat App con React+Vite y Dashboard Admin con Next.js), actualizado stack a TanStack Query, Zustand, Socket.io, TailwindCSS, Shadcn/ui, y actualizada estructura del proyecto para ambas apps.
> 
> 4. **openspec/specs/development_guide.md**: Reemplazado setup PostgreSQL Docker por Supabase + DynamoDB local + Redis, actualizadas variables de entorno para todas las apps (API, Chat, Dashboard), actualizado setup de backend para NestJS con pnpm, y añadida configuración de Worker BullMQ.
> 
> 5. **openspec/specs/data-model.md**: Reemplazado completamente el modelo genérico por el modelo real de Adresles, documentada arquitectura híbrida (Supabase + DynamoDB), incluidas todas las entidades principales con campos y relaciones, añadido diagrama ER completo en Mermaid, y documentados principios clave de diseño.
> 
> 6. **openspec/.agents/backend-developer.md**: Actualizada descripción para NestJS + Supabase + DynamoDB + OpenAI, añadida sección "Contexto del Proyecto" al inicio con referencias explícitas al memory-bank, actualizadas todas las secciones de experiencia central para tecnologías de Adresles, y actualizado enfoque de desarrollo para bounded contexts.
> 
> 7. **openspec/.agents/frontend-developer.md**: Añadida sección "Contexto del Proyecto" con referencias al memory-bank, documentadas las dos aplicaciones frontend con sus stacks específicos, y actualizados principios arquitectónicos para TanStack Query, Zustand, Socket.io, Next.js.
> 
> 8. **openspec/.commands/**: Añadidas notas al inicio de `develop-backend.md` y `develop-frontend.md` para consultar el memory-bank antes de empezar cualquier desarrollo.
> 
> **Resultado final**: OpenSpec está ahora completamente alineado con el stack real de Adresles. Todos los artifacts generados usarán automáticamente el contexto correcto del memory-bank y generarán código alineado con la arquitectura NestJS + Supabase + DynamoDB + OpenAI GPT-4 + Next.js del proyecto.

---

### **8.3. Principios de Integración Memory-Bank + OpenSpec**

**Lecciones aprendidas y mejores prácticas:**

1. **Separación clara de responsabilidades**:
   - **Memory-Bank**: Contexto de proyecto persistente, decisiones arquitecturales (ADRs), glosario de dominio, stack tecnológico
   - **OpenSpec**: Cambios específicos por feature, artifacts temporales de desarrollo (proposals, specs, design, tasks)

2. **Referencias vs Duplicación**:
   - El memory-bank no duplica contenido, sino que crea capas de síntesis y navegación
   - Los ADRs referencian secciones específicas del documento principal (`Adresles_Business.md`)
   - Los specs de OpenSpec referencian ADRs del memory-bank para contexto detallado

3. **Integración en el flujo de desarrollo**:
   - El `config.yaml` de OpenSpec carga automáticamente contexto del memory-bank
   - Los agentes (backend/frontend) leen el memory-bank al inicio de cada tarea
   - Los comandos incluyen recordatorios explícitos para consultar el memory-bank

4. **Evolución orgánica**:
   - La estructura inicial es mínima pero extensible
   - Directorios `patterns/` y `sessions/` preparados para futuro crecimiento
   - Los ADRs documentan el "por qué" de decisiones técnicas para referencia futura

5. **Optimización para sesiones cortas de IA**:
   - Documentos concisos (overview de 80 líneas vs Business.md de 2130)
   - Navegación rápida con índices y mapas
   - Referencias directas para profundización cuando es necesario
