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

**Prompt 2** *(Modo Agent):*

```
No tengo AWS conectado a la terminal
```

**Respuestas / decisiones tomadas:**

- **DynamoDB Local**: Opción 1 — DynamoDB Local en Docker (imagen `amazon/dynamodb-local`) sin necesidad de AWS CLI ni credenciales reales
- **Supabase**: La base de datos PostgreSQL permanece en Supabase Cloud; no se mete en Docker
- **Redis**: Necesario para BullMQ; se levanta con Docker junto a DynamoDB Local
- **Prisma**: No requiere configuración adicional; el `.env` ya apunta a Supabase Cloud y las tablas existen en el dashboard

> **Resumen de objetivos alcanzados:** Se añadió el servicio `dynamodb-local` al `docker-compose.yml` en modo `-inMemory` (para evitar problemas de permisos en Windows). Se creó el script `infrastructure/scripts/setup-dynamodb.ts` para crear la tabla `adresles-messages` con TTL de 90 días. Se creó `apps/worker/src/dynamodb/dynamodb.service.ts` con `saveMessage()` y `getMessages()`. Se añadió el script `pnpm dynamo:setup` en el `package.json` raíz. Se actualizó `apps/api/.env` con las variables `AWS_ACCESS_KEY_ID=local`, `AWS_SECRET_ACCESS_KEY=local` y `DYNAMODB_ENDPOINT=http://localhost:8000`.

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

**Prompt 3** *(Modo Agent):*

```
añade a @apps/api/prisma/seed.ts lo siguiente:
- 2 ecommerce
- 1 de ellos con 2 tiendas, el otro sólo con una (tenemos 3 tiendas)
- 10 usuarios, de los cuales:
    - preferred_language: 7 en español, 1 en catalán , 1 en francés y 1 en inglés
    - phone_country: 9 de España y uno de Francia
    - is_registerd: sólo 4 de ellos
- Para los usuarios registrados:
    - Dos de ellos tienen una sóla Address guardada, uno tiene 2 y otro tiene 3. Pon label razonables. Las direcciones todas de España.
- Todos los usuarios han realizado como mínimo una compra, algunos más, hasta un máximo de 4 compras.
- Un 20% de las compras (aproximadamente) debe tener is_gift, y poblar los GiftRecipient apropiadamente.
- Todas las compras deben tener su OrderAddres en consonancia con si es gift o no. Un 5% de las compras deben de tener en OrderAddress un PlaceHolder y estar sin confirmar todavía. No todas las direcciones deben tener todos los campos de bloque, escalera piso y puerta rellenos, pueden quedar algunos vacíos, lo razonable.
```

> **Resumen de objetivos alcanzados:** Se generó un `seed.ts` completo con 2 ecommerces (ModaMujer con 2 tiendas WooCommerce/Shopify, TechGadgets con 1 tienda PrestaShop), 10 usuarios con distribución correcta de idiomas (7 es, 1 ca, 1 fr, 1 en) y países (9 ES, 1 FR), 4 usuarios registrados con 1, 1, 2 y 3 direcciones guardadas respectivamente, y 20 pedidos distribuidos entre 1 y 4 por usuario. Se poblaron 4 GiftRecipient (~20%) con sus OrderAddress en modo `GIFT_RECIPIENT`, y 1 pedido en estado `PENDING_ADDRESS` sin OrderAddress (placeholder ~5%).

---

**Prompt 4** *(Modo Plan):*

```
Necesito corregir un poco @apps/api/prisma/schema.prisma 
- Cambiar el enum de OrderStatus a PENDING_PAYMENT, PENDING_ADDRESS, READY_TO_PROCESS, COMPLETED y CANCELED.
- Añadir un sourceUserId, opcional, en GiftRecipient para los casos en los que el regalado también sea usuario de Adresles.
- Añadir un addressOrigin en OrderAddress para reflejar si la dirección viene de la Tienda por compra tradicional, de la Tienda pero usando modo Adresles, de Adresles (dirección previamente guardada por usuario registrado) o del Usuario (indicada mediante conversación en WhatsApp). Usa un enum apropiado que refleje estos 4 orígenes.
- Añade un orderMode en Order para indicar si la Order se ha hecho en Modo Tradicional o Modo Adresles.
- Añade un paymentType para indicar el modo de compra usado (Tarjeta de Crédito, PayPal, Bizum, Transferencia, Contra Reembolso, u Otros)
- Todos los phone tienen que ser un modelo propio que tenga los campos más importantes extraídos de la librería phone_numbers, que es la que usaremos para verificarlos (investiga dichos campos y pregúntame cuáles implantar antes de hacerlo). No puede haber teléfonos repetidos. En consecuencia, todos los phone en el resto de modelos se tienen que sustituir por un phoneId obligatorio.
```

> **Resumen de objetivos alcanzados:** Se planificó la corrección completa del schema. Se consultaron los campos de libphonenumber-js y se acordó incluir: `e164` (único), `countryCallingCode`, `nationalNumber`, `country`, `numberType` (enum PhoneNumberType), `isValid`, `formattedNational` y `formattedInternational`. Se decidió mantener `Ecommerce.phone` como `String?` sin cambios. Se diseñó el modelo Phone con relación `users User[]` (varios históricos por soft-delete) y relaciones `1:N` a GiftRecipient y OrderAddress.

---

**Prompt 5** *(Modo Plan → Agent):*

```
Cambia lo siguiente: GiftRecipient siempre tendrá un sourceUserId, porque siempre se crea un usuario cuando tenemos un teléfono nuevo, aunque puede estar no registrado.
Revisa estrictamente que si un teléfono ya existe, y pertenece a un usuario registrado, se tiene que asgnar la Order o el GiftRecipient a dicho usuario registrado. Si no está registrado, crear un nuevo usuario sin registrar con el mismo phoneId. 
Verifica el proceso y pregúntame si ves algo que no sientes coherente
```

> **Resumen de objetivos alcanzados:** Se detectó una contradicción: "crear un nuevo usuario para un teléfono existente no registrado" chocaba con la restricción `User.phoneId @unique`. Se plantearon tres preguntas de clarificación sobre este caso, sobre el renombrado de `sourceUserId` y sobre si garantizar la unicidad activa a nivel de BD o de aplicación. Las respuestas fueron: adoptar **soft-delete** para liberar el `phoneId` del usuario antiguo (phoneId → null, isDeleted = true), renombrar el campo a `recipientUserId`, y garantizar la unicidad activa únicamente a nivel de aplicación. Con la confirmación del plan (`si`), se implementaron todos los cambios en `schema.prisma`: nuevo enum `OrderStatus` (5 valores), enums `OrderMode`, `PaymentType`, `AddressOrigin` y `PhoneNumberType`; nuevo modelo `Phone`; actualización de `User` (phoneId nullable, isDeleted, deletedAt), `Order` (orderMode, paymentType), `OrderAddress` (recipientPhoneId, addressOrigin) y `GiftRecipient` (phoneId, recipientUserId obligatorio, eliminado campo `phone`). Se regeneró el cliente Prisma (`prisma generate`).

---

**Prompt 6** *(Modo Agent):*

```
Actualiza @apps/api/prisma/seed.ts con los cambios, procurando tener una semilla lo más variada posible en cuanto a modos de compra, tipos de pago, estados de orden y origen de dirección. Revisa estrictamente la coherencia entre las instancias creadas en cuando al uso de userId, phoneId, etc.
```

> **Resumen de objetivos alcanzados:** Se reescribió completamente `seed.ts` adaptándolo al nuevo schema. Se crearon 14 registros `Phone` (10 compradores + 4 destinatarios de regalo) con todos los campos de libphonenumber-js. Se crearon 14 `User` (incluyendo los 4 usuarios no registrados para destinatarios de regalo, cada uno con su phoneId). Los 20 pedidos cubren todos los valores de los nuevos enums: `OrderStatus` (COMPLETED×14, READY_TO_PROCESS×2, PENDING_ADDRESS×1, PENDING_PAYMENT×1, CANCELED×1), `OrderMode` (TRADITIONAL×7, ADRESLES×13), `PaymentType` (los 6 valores), `AddressOrigin` (los 4 valores). Se verificó estrictamente la coherencia: `GiftRecipient.phoneId == recipientUser.phoneId`, `OrderAddress.recipientPhoneId` apunta al phone del destinatario correcto, y las 2 órdenes con `ADRESLES_SAVED` referencian `sourceAddressId` de una `Address` guardada real.

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

**Prompt 2** *(Modo Agent):*

```
continua con la tarea 4.3. Pregúntame todo lo que consideres necesario para afrontarla con garantías
```

**Respuestas a las preguntas previas a la implementación:**

- **OpenAI API key**: No disponible todavía; estructurar el código para cuando la tenga (mock fallback si no hay key)
- **Flujo mock sin WhatsApp**: Crear un endpoint adicional en la API (`POST /api/mock/conversations/:id/reply`) para simular la respuesta del usuario manualmente
- **Sub-journeys GET_ADDRESS**: Solo el básico para este MVP — usuario sin dirección guardada → preguntar dirección
- **Idioma del prompt**: Usar el `preferredLanguage` del usuario de la base de datos (ya modelado)

> **Resumen de objetivos alcanzados:** Se implementó el journey GET_ADDRESS completo en el Worker: llamada a OpenAI `gpt-4o-mini` con prompt adaptado al idioma del usuario, guardado de 3 mensajes en DynamoDB (system, user-context, assistant). Se añadieron los endpoints `POST /api/mock/conversations/:id/reply` y `GET /api/mock/conversations/:id/history`. Se añadió la cola `process-response` en `QueueService`. Se registró el worker `process-response` (stub) en `apps/worker/src/main.ts`. Se corrigieron bugs pre-existentes en `UsersService` (campos del esquema antiguo `phone`/`phoneCountry` → modelo `Phone` con `e164`, `countryCallingCode`, `nationalNumber`, `isValid`), `OrdersService` (`recipientPhone` → `recipientPhoneId`, `ADDRESS_CONFIRMED` → `READY_TO_PROCESS`, `SYNCED` → `COMPLETED`) y `MockOrdersService` (pasar `phoneId` al crear dirección en modo tradicional).

---

**Prompt 3** *(Modo Agent):*

```
si, de la misma forma, pregúntame lo necesario antes de implementar
```

*(Tarea 4.5: Implementar ResponseProcessor)*

**Respuestas a las preguntas previas a la implementación:**

- **Google Maps API key**: No disponible; estructurar el código para cuando la tenga (misma aproximación que OpenAI)
- **Dirección incompleta**: Conversación multi-turno — el asistente pregunta los datos que faltan; el usuario responde con un nuevo `POST /reply`
- **Tras confirmación**: Simular sync con eCommerce (log estructurado) + actualizar `Order` a `READY_TO_PROCESS` + `Conversation` a `COMPLETED`
- **Bug recipientPhone**: Corregir como parte de esta tarea para no acumular deuda técnica

> **Resumen de objetivos alcanzados:** Se implementó `processResponseProcessor` con extracción de dirección via OpenAI (modo JSON), validación con Google Maps (mock si no hay key), conversación multi-turno con límite de 3 intentos antes de escalar, creación de `OrderAddress` en Supabase, actualización de `Order` a `READY_TO_PROCESS` y `Conversation` a `COMPLETED`, y simulación del sync con eCommerce (log estructurado).

---

**Prompt 4** *(Modo Plan → Agent):*

```
No, necesito que modifiques el flujo de la siguiente forma:
Cuando recibe dirección pausible para ser validad con GMaps, se valida primero con Gmaps y se le devuelve al usuario toda la información completa de la dirección: dirección con número (y bloque, escalera y/o piso y puerta si el usuario la había especificado), código postal, ciudad, provincia y país. aunque el usuario haya omitido alguno de esos datos en su primera respuesta. Si hay más de una dirección válida para los datos enviados a GMaps, solicitar al usuario cual quiere usar. En todo caso se mantiene la pregunta o solicitud de información adicional si se considera que a la dirección le puede faltar bloque, escalera y/o piso y puerta, pero no insistir en el tema si el usuario confirma que no son necesarios esos datos (por ser una casa o porque indica que es un local). Antes de sincronizar la dirección con el ECommerce se necesita confirmación explícita del usuario de la dirección que se va a enviar (expresada tal y como se ha indicado antes). Como puedes observar, la conversación puede tener varios flujos de mensajes de ida y vuelta hasta la confirmación final y sincronización con el ECommerce, tras la cual, de tener una respuesta 200 (OK), se confirma al usuario que la dirección ha sido grabada satisfactoriamente.
```

> **Resumen de objetivos alcanzados:** Se rediseñó `processResponseProcessor` como máquina de estados con 4 fases persistidas en DynamoDB (SK `__state__`): `WAITING_ADDRESS` (extrae dirección con OpenAI y valida con GMaps), `WAITING_DISAMBIGUATION` (múltiples resultados GMaps → el usuario elige), `WAITING_BUILDING_DETAILS` (dirección parece edificio → pregunta piso/puerta, sin insistir si el usuario confirma que no aplica), `WAITING_CONFIRMATION` (muestra dirección completa normalizada y pide confirmación explícita antes de sincronizar). Tras confirmación y sync mock con 200 OK, se confirma al usuario que la dirección ha sido registrada correctamente. Se refactorizó `address.service.ts` con: `validateWithGoogleMaps()` devolviendo múltiples resultados con `address_components` estructurados, `interpretUserIntent()` vía OpenAI para clasificar intenciones, constructores de mensajes por fase e idioma, y `simulateEcommerceSync()`. Se añadieron `saveConversationState()` / `getConversationState()` en `dynamodb.service.ts`.

---

### 5. Historias de Usuario

#### cu02-frontend-admin

**Prompt 1** *(Modo Plan — Exploración):*

```
/opsx-explore generar un frontend que me permita como administrador ver todas las compras realizadas y los usuarios de adresles (registrados o no registrados), y como usuario me permita recibir los mensajes de Adresles y responder los mensajes para confirmar mi dirección.
```

> **Resumen de objetivos alcanzados:** Se entró en modo exploración para definir el alcance del frontend. Se analizó el estado del proyecto (CU-01 completado, backend operativo, apps/web-chat y apps/web-admin inexistentes). Se mapearon las dos superficies del producto: `web-admin` (Next.js 14) y `web-chat` (React 18 + Vite). Se identificó la pregunta clave de acceso del usuario al chat (magic link por conversationId). Se acordó comenzar por `web-admin` como primera prioridad, con acceso via magic link para el chat de usuario en iteraciones posteriores. Se generó un plan estructurado en 6 tareas con backend y frontend detallados.

---

**Prompt 2** *(Modo Plan):*

```
Corrige el plan para que desde admin también se puedan ver las conversaciones realizadas entre el sistema adresles y el usuario, tipo chat. Obviamente esaas conversaciones tienen que mentener un TTL de 90 días.
```

> **Resumen de objetivos alcanzados:** Se amplió el plan con una tercera vista en el dashboard admin: el visor de conversaciones tipo chat. Se añadió el endpoint `GET /api/admin/conversations/:conversationId/messages` que reutiliza la lógica DynamoDB ya existente en `MockConversationsService.getConversationHistory()`. Se incorporaron los componentes `chat-view.tsx`, `chat-bubble.tsx` y `chat-expiry-banner.tsx`. Se añadió un icono de chat por fila en la tabla de órdenes como punto de entrada a la conversación. Se documentó que el TTL de 90 días ya está implementado via campo `expiresAt` en cada mensaje DynamoDB.

---

**Prompt 3** *(Modo Plan):*

```
Lee @memory-bank y corrige y/o actualiza el Plan asegurando que está perfectamente definido para lo que llevamos hecho de Proyecto
```

> **Resumen de objetivos alcanzados:** Tras leer el memory-bank completo (README, sesión CU-01, tech-stack), se corrigieron y alinearon varias partes del plan con el estado real del proyecto: se eliminó la tarea de configurar `pnpm-workspace.yaml` y `turbo.json` (ya cubren `apps/*` automáticamente), se confirmó que el DynamoDB client existe en `mock-conversations.service.ts` y no hay que recrearlo, se añadieron tests requeridos (`admin.controller.spec.ts` y `admin.service.spec.ts`) siguiendo el patrón de los 37 tests existentes, se precisaron los colores exactos de badges alineados con los `OrderStatus` del schema Prisma, y se añadió el aviso de expiración TTL con umbral de 7 días usando el campo `expiresAt`.

---

**Prompt 4** *(Modo Agent):*

```
Genera un nuevo caso de uso cu02-frontend-admin.md a guardar en openspec/changes/ (no dentro de archive) con toda la información contenida en este Plan. Sé exhaustivo. De momento sólo genera este nuevo archivo en formato markdown, no hagas nada más.
```

> **Resumen de objetivos alcanzados:** Se creó el archivo `openspec/changes/cu02-frontend-admin.md` con la especificación completa del change. El documento sigue el formato de CU-01 (proposal, diseño, API, estructura, vistas, tareas) en un único archivo con 576 líneas. Incluye: propuesta con capacidades y plan de rollback, diseño con decisiones técnicas D1-D4, contratos JSON de los 3 endpoints con ejemplos reales, estructura de archivos de backend y frontend, especificación de cada vista con columnas/campos/colores, 25 tareas de implementación numeradas y ordenadas, variables de entorno y notas de implementación.

---

**Prompt 5** *(Modo Agent):*

```
/enrich-us @openspec/changes/cu02-frontend-admin.md como si fueras una IA experta en desarrollo frontend, con más de 20 años de experiencia, usando las mejores prácticas en desarrollo de frontend y con un diseño moderno utilizando colores Adresles (PRIMARIOS con HEX #000000 o HEX #DBFF36 y SECUNDARIOS con HEX #00687D o blanco).
```

> **Resumen de objetivos alcanzados:** Se enriqueció exhaustivamente el documento `cu02-frontend-admin.md` (de 576 a 1319 líneas) añadiendo: sistema de diseño completo con paleta de colores Adresles (#000000, #DBFF36, #00687D, #FFFFFF) y ratios de contraste WCAG AA verificados; configuración completa de `tailwind.config.ts` con tokens de marca y `borderRadius: chat`; variables CSS para overrides de Shadcn/ui; tipografía Inter via `next/font`; diseño detallado del sidebar, tablas, badges y burbujas de chat con clases Tailwind exactas; decisión D5 sobre Server Components por defecto; sección completa de tipos TypeScript (interfaces `AdminOrder`, `AdminUser`, `ConversationMessage`, `PaginatedResponse<T>`); estructura de archivos ampliada con `loading.tsx`, `error.tsx` y componentes de estado vacío y skeleton por cada ruta; código completo de `api.ts` (ISR 30s), `utils.ts` (date-fns locale ES, `cn()`), `Sidebar`, `OrderStatusBadge`, `ChatBubble` y `ChatExpiryBanner`; especificación de accesibilidad WCAG 2.1 AA; requisitos no funcionales de rendimiento (FCP < 1.5s); y wireframe del chat con anotaciones de colores de marca.

---

**Prompt 6** *(Modo Agent):*

```
Lee memory-bank/README.md y los ADRs relevantes antes de comenzar.
```

> **Resumen de objetivos alcanzados:** Se leyeron y resumieron todos los documentos del memory-bank (README, overview, tech-stack, ADRs 001-005). Se proporcionó un resumen completo del contexto arquitectural del proyecto como punto de partida para la sesión de implementación.

---

**Prompt 7** *(Modo Agent):*

```
/opsx-apply @openspec/changes/cu02-frontend-admin Pregunta cualquier aspecto que requiera más concreción por mi parte
```

**Respuestas a las preguntas de clarificación previas a la implementación:**

- **Pregunta 1** — No acabo de entender la pregunta. El repositorio actual sólo tiene backend y todavía no se ha creado el frontend, por lo que no sí la pregunta es coherente. Como IA experta en desarrollo frontend en repositorios monolíticos, analiza y justifica la decisión que tú tomarías ¿dónde se van a generar todos los archivos del frontend?
- **Pregunta 2** — Puedes usar la última, pero asegurando que lo que está generado hasta la fecha funciona igualmente con la versión 15.x
- **Pregunta 3** — Lo has entendido bien, me parece correcto tu enfoque.
- **Pregunta 4** — En formato e163 me parece el más idóneo, pues contiene en una única string la información del país de origen y del número de teléfono en un formato bonito.

> **Resumen de objetivos alcanzados:** Se implementaron las 40 tareas del change completas. Backend: `AdminModule` (NestJS) con 3 endpoints GET (`/admin/orders`, `/admin/users`, `/admin/conversations/:id/messages`), `AdminService` con paginación y filtrado `isDeleted: false`, tests unitarios e integración con supertest. `MockModule` actualizado para exportar `MockConversationsService`. Frontend (`apps/web-admin`): scaffolding con Next.js 16, React 19, Tailwind v4 (CSS-first), Shadcn/ui; tokens de marca Adresles en `globals.css` vía `@theme`; vistas de pedidos, usuarios y conversaciones tipo chat con burbujas por rol; layout con sidebar, skip link y `TooltipProvider` global; `force-dynamic` y `cache: 'no-store'` para evitar errores de prerendering en build time. La decisión de usar directorio `src/` dentro de `apps/web-admin` se tomó como experto, alineada con convenciones modernas de Next.js en monorepo.

---

**Prompt 8** *(Modo Agent):*

```
Corrige los 2 warnings (W1 y W2) tal y como lo sugieres, y realiza las 2 mejoras opcionales. Respecto a la primera mejroa opcional (S1) decide como IA experta en frontend y cuál es la mejor manera de mostrar la infromación de forma que el usuario tenga la mejor experiencia UX. Si finalmente decides no utlizar el componente separator, y verificas que efectivamente no se usa en ningún lado, elimínalo. Para la S2 implementa tu recomendacón.
```

> **Resumen de objetivos alcanzados:** Se corrigieron los dos warnings y se implementaron las dos mejoras opcionales: **W1** — añadido test explícito en `admin.service.spec.ts` para verificar que usuarios con `isDeleted: true` son filtrados correctamente. **W2** — reemplazado el atributo `title` inaccessible en `UsersTable` por un `<Tooltip>` completo de Shadcn, creando el componente cliente `RelativeDateCell` y el wrapper `<Providers>` con `TooltipProvider` en el root layout. **S1** — como decisión experta de UX, se mantuvo el patrón "separador flanqueado" para mensajes de sistema en `ChatBubble` por ofrecer mejor experiencia visual; se eliminó `separator.tsx` y su dependencia `@radix-ui/react-separator` al verificar que no estaban en uso en ningún otro lugar. **S2** — prop `expiresAtUnix` de `ChatExpiryBanner` cambiado a `number | undefined` con guard interno, simplificando el uso en el componente padre `ChatView`. Build de producción y `tsc --noEmit` pasaron sin errores.

---

**Prompt 9** *(Modo Agent):*

```
/update-docs
```

> **Resumen de objetivos alcanzados:** Se actualizó la documentación de proyecto para reflejar el estado post-CU-02: `memory-bank/README.md` con estado del change y sesión del 2026-02-23; `memory-bank/project-context/tech-stack.md` con versiones reales del Dashboard Admin (Next.js 16, React 19, Tailwind 4, nuevas dependencias); `memory-bank/project-context/overview.md` con el actor "Admin/Mock UI" actualizado y el Dashboard como implementación real; `openspec/specs/frontend-standards.mdc` con stack real, estructura de archivos y patrones clave del Dashboard Admin; y creación del archivo de sesión `memory-bank/sessions/2026-02-23-cu02-frontend-admin.md` con el registro completo de la sesión.

---

**Prompt 10** *(Modo Agent):*

```
/opsx-archive @openspec/changes/cu02-frontend-admin
```

> **Resumen de objetivos alcanzados:** Se verificó que los 4 artefactos del change (`proposal`, `design`, `specs`, `tasks`) estaban en estado `done` y las 40 tareas marcadas `[x]`. Se detectaron 2 delta specs (`admin-api/spec.md` y `admin-dashboard/spec.md`) sin correspondencia en `openspec/specs/`. El usuario eligió sincronizar antes de archivar: se copiaron ambos delta specs a `openspec/specs/admin-api/` y `openspec/specs/admin-dashboard/`. Finalmente se movió el directorio del change a `openspec/changes/archive/2026-02-23-cu02-frontend-admin/`.

---

### 6. Tickets de Trabajo

#### t01-orders-sorting

**Prompt 1** *(Modo Agent):*

```
lee memory bank para iniciar un ticket de frontend
```

> **Resumen de objetivos alcanzados:** Se leyeron los documentos del memory-bank (`overview.md`, `tech-stack.md`, sesión `2026-02-23-cu02-frontend-admin.md`) para cargar el contexto del proyecto antes de iniciar el nuevo ticket. Se identificó el estado actual del dashboard admin (CU-02 completado) y se estableció la base de conocimiento necesaria para abordar el nuevo cambio en la página de Pedidos.

---

**Prompt 2** *(Modo Agent):*

```
Quiero cambiar añadir features a la página de Pedidos. Quiero que se puedan ordenar según Tienda, Usuario, Importe, Estado, Modo y Fecha, tanto en orden ascendente como en orden descendente, mediante un botoncito situado a la derecha del nombre de la columna con el cual puedas ordenar en orden ascendente según esa columna (trriangulito arriba) o en orden descendente (triangulito abajo). Cuando se ordena por Tienda también se tiene que subordenar por Nº de pedido (por cierto, la columna "N.º pedido" debe llamarse "Referencia"). Crea primero un archivo markdown con el nombre "T01-frontend-xxx.md", siendo xxx algo que identifique este ticket. Luego lo desarrollaremos con el comando /enrich-us . Pregúntame todo lo necesario para enriquecer el ticket todo lo necesario para luego crear los artefactos del change adecuadamente.
```

> **Resumen de objetivos alcanzados:** Se creó el archivo `openspec/changes/T01-frontend-orders-sorting.md` con la propuesta inicial del ticket. Se ejecutó `/enrich-us` con una batería de 8 preguntas para afinar todos los aspectos de la implementación: tipo de ordenación (server-side vs client-side), persistencia del estado, orden por defecto, columnas no ordenables, lógica de sort por usuario, icono neutro, y comportamiento del subsort. El documento quedó listo para ser procesado por `/opsx-ff`.

---

**Prompt 3** *(Modo Agent):*

```
1- Implementación server-side 2- En la URL 3- Ordenado por fecha de forma descendente (primero los pedidos más recientes) 4y5- No hace falta ordenar las columnas Estado y Modo, para visualizar estas columnas mejor aplicaremos una capa de filtros, a resolver en otro ticket. 6- Por nombre completo concatenado 7- A 8- La Referencia también es ordenable de forma individual, aunque lo que más me interesa es que si se ordena por Tienda, se ordenen los pedidos de una misma Tienda por Referencia (en ascendente o descendente). Las columnas Estado y Modo no son ordenables (srán filtrables)
```

> **Resumen de objetivos alcanzados:** Se completó la fase de enriquecimiento del ticket con todas las decisiones de diseño: sort server-side, estado persistido en URL como query params (`?sort=<col>&dir=<asc|desc>`), orden por defecto `date DESC`, columnas Estado y Modo excluidas del sort (se abordarán con filtros en otro ticket), sort de Usuario por nombre completo concatenado, icono neutro `ChevronsUpDown`, y Referencia como columna ordenable de forma individual y como subsort de Tienda. El archivo `T01-frontend-orders-sorting.md` quedó completamente enriquecido.

---

**Prompt 4** *(Modo Agent):*

```
/opsx-ff t01-orders-sorting
```

> **Resumen de objetivos alcanzados:** Se generaron en secuencia los 4 artefactos OpenSpec del change `t01-orders-sorting`: `proposal.md` (justificación del cambio y alcance), `specs/orders-column-sorting/spec.md` (requisitos frontend: columnas ordenables, subsort, indicadores visuales, accesibilidad WCAG 2.1 AA, renombrado de columna), `specs/admin-dashboard/spec.md` (contrato API: parámetros `sortBy` y `sortDir` opcionales con fallback silencioso), `design.md` (decisiones técnicas: sort server-side, `searchParams` como Promise, Client Component, `buildOrderBy` privado, DTO extendido, tipos compartidos), y `tasks.md` (30 tareas ordenadas por dependencias en 9 grupos). Todos los artefactos marcados como `done`.

---

**Prompt 5** *(Modo Agent):*

```
/opsx-apply t01-orders-sorting
```

> **Resumen de objetivos alcanzados:** Se implementaron las 30 tareas del change completamente. **Backend**: nuevo `OrdersQuery extends PaginationQuery` con `@IsIn([...])` en el controlador, método privado `buildOrderBy()` en `AdminService` con los 5 casos de sort y fallback doble (sortBy + sortDir) ante parámetros inválidos, 9 nuevos tests unitarios de `buildOrderBy` y 2 tests de integración en el controlador. **Frontend**: tipos `SortByColumn`/`SortDir` y constantes en `types/api.ts`, `getOrders()` extendido con `URLSearchParams`, `orders/page.tsx` actualizado para recibir `searchParams: Promise<{...}>` (Next.js 15/16) con validación allowlist y reset conjunto, `orders-table.tsx` convertido a `'use client'` con columna renombrada a "Referencia" y `aria-sort` en `<th>`, y nuevo componente `sortable-column-header.tsx` con `useRouter`/`usePathname`, iconos `ChevronsUpDown`/`ChevronUp`/`ChevronDown` y `aria-label` accesible. Todos los tests pasaron.

---

**Prompt 6** *(Modo Agent):*

```
Atiende la Suggestion S1, pero con el escenario ?sort=invalido&dir=asc (sortBy inválido pero sortDir válido), el comportamiento tiene que ser date DESC.
```

> **Resumen de objetivos alcanzados:** Se corrigió una inconsistencia en la validación de parámetros de sort: cuando `sortBy` es inválido, el `sortDir` recibido (aunque sea válido) también se descarta y se resetea al defecto. El fix se aplicó en `admin.service.ts` (reset conjunto del dir al validar sortBy), en `apps/web-admin/src/app/orders/page.tsx` (misma lógica en frontend: `sortDir` solo se respeta si `isValidSort` es true), y en `openspec/changes/t01-orders-sorting/specs/orders-column-sorting/spec.md` (nuevo escenario documentado: "sortBy inválido con sortDir válido → reset completo al defecto"). El test fallido `sortBy inválido → fallback a date desc` pasó tras la corrección.

---

**Prompt 7** *(Modo Agent):*

```
/update-docs
```

> **Resumen de objetivos alcanzados:** Se actualizaron 3 archivos de documentación: `openspec/specs/frontend-standards.mdc` con 3 nuevos patrones clave (async `searchParams: Promise<{...}>` en Next.js 15/16, patrón `SortableColumnHeader` como Client Component con props en vez de `useSearchParams`, y validación de query params con reset conjunto); `memory-bank/patterns/validation-patterns.md` con el patrón 5 (DTO con herencia y `@IsIn` para enums) y el patrón 6 (`buildOrderBy()` privado para ordenación dinámica con Prisma); y creación del nuevo archivo de sesión `memory-bank/sessions/2026-02-24-t01-orders-sorting.md` con el registro completo del change.

---

**Prompt 8** *(Modo Agent):*

```
/opsx-archive @openspec/changes/t01-orders-sorting
```

> **Resumen de objetivos alcanzados:** Tras verificar artefactos (4/4 completos) y tareas (30/30 marcadas `[x]`), se ejecutó el sync de delta specs antes de archivar (elección del usuario): se creó `openspec/specs/orders-column-sorting/spec.md` (nueva capability) y se actualizó `openspec/specs/admin-dashboard/spec.md` (columna renombrada, ordenación dinámica, nuevo requirement del endpoint, estructura de archivos y firma de `getOrders` actualizadas). Finalmente se movió el directorio del change a `openspec/changes/archive/2026-02-24-t01-orders-sorting/`.

---

#### t02-orders-filters

**Prompt 1** *(Modo Agent):*

```
lee memory bank para iniciar un ticket de frontend
```

> **Resumen de objetivos alcanzados:** Se leyeron los documentos del memory-bank (`README.md`, `overview.md`, `tech-stack.md`, sesión `2026-02-24-t01-orders-sorting.md`, `spec.md` del admin-dashboard, `T01-frontend-orders-sorting.md`, `admin.controller.ts` y `admin.service.ts`) para cargar el contexto completo del proyecto. Se identificó el estado actual del dashboard admin (CU-02 + T01 completados, todos los changes archivados) y se presentaron los tickets de frontend pendientes identificados como no-objetivos de tickets anteriores. Mediante una pregunta estructurada el usuario eligió el ticket **A — Filtros en /orders (Estado, Modo)** como próxima tarea.

---

**Prompt 2** *(Modo Plan):*

```
Quiero filtros en la página de Pedidos, en las columnas de Estado y Modo. También necesito una opción de buscar por Tienda, Referencia, Usuario o fecha, pero no sé la mejor manera de hacerlo, si con una única celda de Search de forma que, a medida que escribes, se vean en pantalla sólo los Pedidos con coincidencias en alguna de esas columnas, o mejor con un search by especificando la columna primeramente. Como IA experta en frontend y UX/UI razona cuál sería la mejor práctica en mi caso para obtener la mejor UX/UI.
```

> **Resumen de objetivos alcanzados:** Se realizó un análisis exhaustivo de UX/UI comparando tres patrones de búsqueda (search box único, búsqueda por columna y enfoque híbrido), teniendo en cuenta el factor determinante de que el filtrado debe ser obligatoriamente server-side por la paginación existente. Se recomendó la **Opción C — búsqueda global + filtros discretos**, el mismo patrón usado por Linear, GitHub Issues y Retool: search box único con placeholder descriptivo para texto libre (Tienda, Referencia, Usuario), dropdowns multi-select para Estado y Modo (valores discretos conocidos), y date range picker para fechas (semántica diferente). Se documentó la lógica de combinación (AND entre controles, OR dentro de multi-select), la gestión de URL y la integración con el sort de T01.

---

**Prompt 3** *(Modo Agent):*

```
primero genera un fichero markdown llamado T02-orders-filters.md denro de la carpeta @openspec/changes  con la misma estructura que @openspec/changes/T01-frontend-orders-sorting.md para entender y exandir mejor la definición de este ticket. También incluye dentro del ticket el mejor approach para poder filtrar por rangos de fecha, coordinando que todos los orderings y los filters (tanto el search box como los multi-select dropdown y el date range picker) queden bien integrados en la expereincia UI del usuario, siguiendo las mejoes prácticas. Utiliza el comando /enrich-us para enriquezer el ticket.
```

> **Resumen de objetivos alcanzados:** Se leyó el comando `/enrich-us`, el archivo T01 de referencia y el estado actual del backend (`admin.controller.ts`, `admin.service.ts`, `schema.prisma`) para obtener el contexto técnico real. Se creó `openspec/changes/T02-orders-filters.md` (346 líneas) siguiendo la misma estructura que T01, con: historia de usuario, descripción funcional completa de los 4 controles (search box con debounce 300ms, status multi-select con puntos de color, mode multi-select, date range picker con Popover + `<input type="date">` nativo y botón "Aplicar"), esquema de URL con tabla completa de 9 parámetros y reglas de combinación, arquitectura frontend detallada (`OrdersFilterBar` coordinador con `buildUrl()` centralizado, sub-componentes tipados), arquitectura backend (`buildWhere()` privado análogo a `buildOrderBy()` con `Prisma.OrderWhereInput`), criterios de aceptación exhaustivos (search, estado, modo, fecha, integración, chips, accesibilidad, backend) y tabla de archivos a crear o modificar.

---

**Prompt 4** *(Modo Agent):*

```
/opsx-ff t02-orders-filters teniendo en cuenta también todo el dcumento @openspec/changes/T02-orders-filters.md 
```

> **Resumen de objetivos alcanzados:** Se ejecutó el skill `openspec-ff-change` generando en secuencia los 4 artefactos OpenSpec del change `t02-orders-filters`: `proposal.md` (justificación, capacidades nuevas `orders-filters` y modificación de `admin-dashboard`, impacto y plan de rollback), `specs/orders-filters/spec.md` (7 requisitos con 25 escenarios: barra de filtros, search multi-columna, status multi-select, mode multi-select, date range picker, chips de filtros activos, endpoint backend), `specs/admin-dashboard/spec.md` (MODIFIED del requisito existente: tabla con barra de filtros, subtítulo dinámico `meta.total`, estado vacío adaptativo), `design.md` (10 decisiones técnicas documentadas: D1-URL-as-state, D2-FilterBar independiente de OrdersTable, D3-buildUrl centralizado, D4-debounce solo en search, D5-date range con "Aplicar", D6-input nativo sin Calendar, D7-refactor firma a objeto, D8-buildWhere privado, D9-validación doble de enums, D10-mode insensitive) y `tasks.md` (36 tareas en 9 grupos: Backend DTO → Backend lógica → Backend tests → Frontend tipos → Frontend page → Frontend sub-componentes → OrdersFilterBar → OrdersEmptyState → Integración y verificación). Todos los artefactos marcados como `done`.

---

**Prompt 5** *(Modo Agent):*

```
/opsx-apply  t02-orders-filters
```

> **Resumen de objetivos alcanzados:** Se implementaron las 34 tareas del change completas. **Backend**: interfaz `GetOrdersParams` exportada en `admin.service.ts`; `OrdersQuery` DTO ampliado con `q`, `status`, `mode` (`@IsString`) y `from`/`to` (`@Matches(/^\d{4}-\d{2}-\d{2}$/)`); firma de `getOrders()` refactorizada a objeto `params`; método privado `buildWhere()` con lógica AND entre filtros (OR sobre 4 columnas con `mode: 'insensitive'`, status/mode CSV con allowlist e `{ in: [...] }`, rango de fechas `gte 00:00:00Z / lte 23:59:59.999Z` sobre `webhookReceivedAt`); `prisma.order.count({ where })` compartiendo el mismo `where` que `findMany` para que `meta.total` sea siempre el count filtrado; 11 nuevos tests de `buildWhere()` y 2 nuevos tests en el controller. **Frontend**: `OrdersFilters`, `VALID_ORDER_STATUSES`, `VALID_ORDER_MODES`, `ORDER_STATUS_LABELS`, `ORDER_MODE_LABELS` en `types/api.ts`; `getOrders()` en `lib/api.ts` con `filters?`; `orders/page.tsx` con parsing y validación de los nuevos `searchParams`, subtítulo dinámico (`meta.total`), `OrdersFilterBar` integrado y `hasFilters` a `OrdersEmptyState`; componente `Popover` Shadcn (`@radix-ui/react-popover` instalado); y 6 nuevos componentes: `orders-search-input.tsx`, `orders-status-filter.tsx`, `orders-mode-filter.tsx`, `orders-date-filter.tsx`, `orders-active-filter-chips.tsx` y `orders-filter-bar.tsx` (coordinador con `buildUrl()` centralizado y debounce 300ms). 40/40 tests backend pasando, `tsc --noEmit` sin errores.

---

**Prompt 6** *(Modo Agent):*

```
/opsx-verify t02-orders-filters
```

> **Resumen de objetivos alcanzados:** Se realizó la verificación completa en tres dimensiones (Completeness, Correctness, Coherence). Se confirmaron 34/34 tareas completas, todos los artefactos en estado `done` y cobertura de 6/7 escenarios de spec. Se detectó un **WARNING** crítico (W1): `SortableColumnHeader` construía la URL con `${pathname}?sort=${column}&dir=${nextDir}` sin preservar los params de filtro activos, violando los escenarios "Sort preserva filtros activos" y "Filtros y sort coexisten en la URL" de la spec. Se identificaron 2 sugerencias opcionales (stale closure en debounce, comportamiento heterogéneo de `@Matches` vs allowlist para valores inválidos).

---

**Prompt 7** *(Modo Agent):*

```
si
```

> **Resumen de objetivos alcanzados:** Se corrigió el warning W1 en `sortable-column-header.tsx`: se añadió `useSearchParams()` de `next/navigation` y se refactorizó `handleClick` para copiar los params de filtro activos (`q`, `status`, `mode`, `from`, `to`) al construir la nueva URL de sort. `tsc --noEmit` pasó sin errores. Con esta corrección, los dos escenarios de la spec quedaron cubiertos: `OrdersFilterBar` preserva el sort al filtrar (ya funcionaba) y `SortableColumnHeader` preserva los filtros al cambiar la ordenación (corregido).

---

**Prompt 8** *(Modo Agent):*

```
/update-docs 
```

> **Resumen de objetivos alcanzados:** Se actualizaron 3 archivos de documentación: `openspec/specs/admin-dashboard/spec.md` — requisito "Vista de órdenes" ampliado con `OrdersFilterBar`, subtítulo dinámico (`meta.total`), estado vacío adaptativo y 4 nuevos escenarios; estructura de archivos actualizada con los 6 nuevos componentes de filtros; firma de `getOrders()` en `lib/api.ts` actualizada. `openspec/specs/admin-api/spec.md` — endpoint `/admin/orders` con tabla completa de query params (`q`, `status`, `mode`, `from`, `to`), documentación de `buildWhere()`, `meta.total` como count filtrado y 5 nuevos escenarios; sección `src/types/api.ts` con los nuevos tipos `OrdersFilters`, `VALID_ORDER_STATUSES`, `VALID_ORDER_MODES`, `ORDER_STATUS_LABELS`, `ORDER_MODE_LABELS`. `openspec/specs/orders-column-sorting/spec.md` — 2 nuevos escenarios: "Sort preserva los filtros activos" y "Filtros y sort coexisten al activar un filtro con sort activo".

---

**Prompt 9** *(Modo Agent):*

```
actualiza @memory-bank , revisando que se incluya lo  realizado en esta sersión
```

> **Resumen de objetivos alcanzados:** Se creó el archivo `memory-bank/sessions/2026-02-25-t02-orders-filters.md` con el registro completo de la sesión: resumen de implementación backend y frontend, tabla de decisiones técnicas (D1-D10), corrección post-verificación W1, listado de archivos modificados/creados y resultados de tests. Se actualizó `memory-bank/README.md`: cabecera con la fecha y change activo del día, tabla de sesiones con T01 (que faltaba) y T02 añadidos, sección "Próximo change" apuntando al archive pendiente de T02 y luego a `cu02-webhook-ecommerce-sync`, y sección "Cambios recientes" con el resumen de T02.

---

**Prompt 10** *(Modo Agent):*

```
/opsx-archive t02-orders-filters
```

> **Resumen de objetivos alcanzados:** Tras confirmar 4/4 artefactos completos y 34/34 tareas marcadas `[x]`, se evaluó el estado de sync de los delta specs. La spec de `admin-dashboard` ya estaba sincronizada (vía `/update-docs`), pero la spec de la nueva capability `orders-filters` no existía aún en `openspec/specs/`. El usuario eligió sincronizar antes de archivar: se creó `openspec/specs/orders-filters/spec.md` con el contenido completo de la delta spec (7 requisitos, 31 escenarios). Finalmente se movió el directorio del change a `openspec/changes/archive/2026-02-25-t02-orders-filters/` y se movió el archivo de overview `T02-orders-filters.md` al mismo directorio de archive.

---

#### t03-users-sorting-filters

**Prompt 1** *(Modo Agent):*

```
Vamos a iniciar un nuevo ticket de frontend. lee primero los archivos de @memory-bank , y a continuación genera un ticket T03 de frontend para agregar sorting y filtering a la páginad eUsuarios igual que se hizo en los tickets 1 y 2 con la página de Pedidos.
De momento sólo genera el documento markdown "T03-frontend-users-sorting&filters.md" con la misma estructura y diseños que @openspec/changes/archive/2026-02-24-t01-orders-sorting/T01-frontend-orders-sorting.md  y @openspec/changes/archive/2026-02-25-t02-orders-filters/T02-orders-filters.md , pero adaptados a la página de Usuarios.
Dentor de la página de usuarios las columnas ordenables son Nombre, Email (vacíos al final ), Pedidos, Direcciones y Última interacción. La vista por defecto es ordenados de forma descendente por la columna Última interacción (arriba el más reciente). La barra de búsqueda para los filtros debe poder buscar por nombre o email, y poder filtar con botones la columna Registrado.
```

> **Resumen de objetivos alcanzados:** Se leyeron los archivos del memory-bank y los tickets T01 y T02 de referencia. Se creó el archivo `openspec/changes/T03-frontend-users-sorting-filters.md` (912 líneas) con la especificación completa del ticket, adaptada al dominio de usuarios: 5 columnas ordenables (Nombre, Email con nulls al final, Pedidos, Direcciones, Última interacción por defecto DESC), filtro de búsqueda por nombre/email con debounce 300ms, control segmentado de selección única `[Todos]/[Registrado]/[No registrado]` para el filtro de registro, arquitectura frontend completa (tipos, componentes, page) y backend completa (`buildUsersOrderBy`, `buildUsersWhere`, `GetUsersParams`, `UsersQuery` DTO), criterios de aceptación exhaustivos y tabla de archivos a crear/modificar.

---

**Prompt 2** *(Modo Agent):*

```
/enrich-us @openspec/changes/T03-frontend-users-sorting-filters.md
```

> **Resumen de objetivos alcanzados:** Se aplicó el comando `/enrich-us` evaluando el ticket T03 contra las mejores prácticas de producto. El ticket ya era muy sólido técnicamente, pero se identificaron y añadieron tres gaps críticos para la autonomía completa del desarrollador: (1) **`<Suspense>` boundary obligatorio** — `UsersSortableColumnHeader` usa `useSearchParams()`, lo que requiere envolver `UsersTable` en `<Suspense fallback={<UsersTableSkeleton />}>` en la página para evitar la advertencia de build de Next.js App Router; el snippet de `page.tsx` se actualizó con el código exacto y la advertencia explicativa. (2) **Sección "Documentación a actualizar post-implementación"** — nueva sección con instrucciones precisas para actualizar `openspec/specs/admin-dashboard/spec.md`, `openspec/specs/admin-api/spec.md` (tabla completa de query params del endpoint usuarios), y crear el nuevo `openspec/specs/users-sorting-filters/spec.md` y la nota de sesión en `memory-bank/sessions/`. (3) **Criterios de build/compilación** — nueva subsección con 3 checks: `tsc --noEmit` sin errores, ausencia de la advertencia Suspense en el build de Next.js, y no regresión de los 40+ tests existentes.

---

**Prompt 3** *(Modo Agent):*

```
/opsx-ff @openspec/changes/T03-frontend-users-sorting-filters.md
```

> **Resumen de objetivos alcanzados:** Se ejecutó el skill `openspec-ff-change` para el change `t03-users-sorting-filters`, generando los 4 artefactos OpenSpec en secuencia: `proposal.md` (justificación del cambio, capacidades nueva `users-sorting-filters` y modificadas `admin-dashboard`/`admin-api`, impacto y rollback); `design.md` (6 decisiones técnicas: control segmentado vs. dropdown multi-select para el filtro booleano `isRegistered`, `useSearchParams()` en `UsersSortableColumnHeader` desde el inicio para evitar la regresión W1 de T02, métodos privados `buildUsersOrderBy`/`buildUsersWhere`, `<Suspense>` explícito, ordenación por `_count` de relaciones en Prisma, `isDeleted: false` como condición base invariable); `specs/users-sorting-filters/spec.md` (nueva capability con 6 requirements y 20+ scenarios en formato SHALL/WHEN/THEN); `specs/admin-dashboard/spec.md` y `specs/admin-api/spec.md` (deltas MODIFIED con tabla de columnas actualizada, FilterBar, subtítulo dinámico y tabla completa de query params del endpoint); y `tasks.md` (26 tareas en 8 grupos: backend DTO → lógica → tests → frontend tipos → componentes nuevos → modificados → page → verificación). Todos los artefactos marcados como `done`.

---

**Prompt 4** *(Modo Agent):*

```
/opsx-apply t03-frontend-users-sorting-filters
```

> **Resumen de objetivos alcanzados:** Se implementaron las 27 tareas del change. **Backend**: interfaz `GetUsersParams` exportada en `admin.service.ts`; DTO `UsersQuery extends PaginationQuery` en `admin.controller.ts` con `@IsIn` para `sortBy` (5 valores), `sortDir`, `registered` y `@IsString` para `q`; propiedad privada `validUserSortColumns`; métodos privados `buildUsersOrderBy` (5 casos con `nulls: 'last'` para escalares y `_count` para relaciones) y `buildUsersWhere` (condición base `{ isDeleted: false }`, OR sobre `firstName`/`lastName`/`email` con `mode: 'insensitive'`, filtro `registered` booleano); firma de `getUsers()` refactorizada a `(page, limit, params: GetUsersParams = {})`; `prisma.user.count({ where })` compartiendo el mismo `where` que `findMany`; 18 nuevos tests en `admin.service.spec.ts` (12 de `buildUsersOrderBy`, 6 de `buildUsersWhere`) y tests de controlador actualizados — 40/40 tests pasando. **Frontend**: tipos `UserSortByColumn`, `VALID_USER_SORT_COLUMNS`, `DEFAULT_USER_SORT`, `DEFAULT_USER_DIR`, `UsersFilters`, `USER_REGISTERED_FILTER_LABELS` en `types/api.ts`; `getUsers()` en `lib/api.ts` con `sortBy`, `sortDir` y `filters`; 5 componentes nuevos: `users-sortable-column-header.tsx` (usa `useSearchParams` para preservar filtros al ordenar), `users-search-input.tsx`, `users-registered-filter.tsx` (control segmentado `[Todos]/[Registrado]/[No registrado]`), `users-active-filter-chips.tsx`, `users-filter-bar.tsx` (coordinador con `buildUrl()` centralizado y debounce 300ms); modificados `users-table.tsx` (`'use client'`, props `sortBy`/`sortDir`, `aria-sort`) y `users-empty-state.tsx` (prop `hasFilters`); `users/page.tsx` refactorizado como Server Component con `await searchParams`, validación con allowlist, subtítulo dinámico `meta.total`, `<Suspense fallback={<UsersTableSkeleton />}>` y `UsersFilterBar`. `tsc --noEmit` sin errores.

---

**Prompt 5** *(Modo Agent):*

```
/opsx-verify t03-users-sorting-filters
```

> **Resumen de objetivos alcanzados:** Se realizó la verificación completa en tres dimensiones (Completeness, Correctness, Coherence). Se confirmaron 27/27 tareas completas, todos los artefactos en estado `done` y cobertura de los escenarios de spec. Se detectó un **WARNING** (W1): el DTO `UsersQuery` usa `@IsIn` con `ValidationPipe`, provocando que clientes externos que envíen `sortBy` inválido reciban HTTP 400 en lugar del 200 especificado en la spec (fallback silencioso). Se identificó un segundo warning (W2): cuando `sortBy` es inválido, `sortDir` también se fuerza al default — comportamiento no documentado explícitamente en la spec. Se identificó una sugerencia (S1): posible stale closure en el `useRef` del debounce del `UsersFilterBar`.

---

**Prompt 6** *(Modo Ask):*

```
Explica mas detenidamente el W1 para saber qué decisión tomar. Cuáles son los riesgos con cada una de las opciones y qué archivos habría que cambiar
```

> **Resumen de objetivos alcanzados:** Se analizaron en detalle las tres opciones para resolver W1: **Opción A** (no cambiar código, documentar la deuda técnica en el spec) — sin riesgo inmediato, requiere solo actualizar `openspec/specs/admin-api/spec.md`; **Opción B** (eliminar `@IsIn` de `UsersQuery.sortBy`, `sortDir` y `registered`, delegando validación de valores al servicio) — requiere cambios en `admin.controller.ts`, `admin.controller.spec.ts` y el spec, con riesgo bajo pero elimina la capa de validación temprana del DTO; **Opción C** (pipe de transformación custom que haga el fallback en el controlador) — máxima fidelidad a la spec pero mayor complejidad. Se detallaron los archivos afectados y el nivel de riesgo de cada opción.

---

**Prompt 7** *(Modo Agent):*

```
Arregla el W1 con la Opción A + la nota para refactorizar tanto UserQuery como OrdersQuery. Para el W2 el comportamiento presente es el deseado, basta con documentarlo en el spec. Para la S1 acepta el patrón como está.
```

> **Resumen de objetivos alcanzados:** Se aplicaron las tres decisiones del usuario: (1) **W1 — Opción A**: sin cambio de código; se añadió una nota detallada de deuda técnica en el escenario "sortBy inválido hace fallback silencioso" de `openspec/specs/admin-api/spec.md`, indicando que eliminar `@IsIn` de `UsersQuery.sortBy`, `sortDir`, `registered` y `OrdersQuery.sortBy` queda pendiente como refactor en `admin.controller.ts` y sus tests. (2) **W2**: se documentó en el spec el comportamiento de diseño — `sortDir` solo se respeta cuando `sortBy` también es válido; si `sortBy` cae al fallback, ambos se fuerzan a los defaults, tanto en el servicio como en el Server Component. (3) **S1**: el patrón de `useRef` con debounce se aceptó como está, sin cambios.

---

**Prompt 8** *(Modo Agent):*

```
actualiza @memory-bank , revisando que se incluya lo realizado en esta sersión
```

> **Resumen de objetivos alcanzados:** Se creó el archivo `memory-bank/sessions/2026-02-26-t03-users-sorting-filters.md` con el registro completo de la sesión: resumen de implementación backend y frontend, tabla de componentes nuevos y archivos modificados, decisiones técnicas tomadas durante la verificación (W1/W2/S1) y deuda técnica documentada. Se actualizó `memory-bank/README.md`: fecha y change activo actualizados, nueva sesión añadida a la tabla de sesiones, sección "Próximo change" apuntando al archive pendiente de T03.

---

**Prompt 9** *(Modo Agent):*

```
/opsx-archive t03-users-sorting-filters
```

> **Resumen de objetivos alcanzados:** Tras confirmar 4/4 artefactos completos y 27/27 tareas marcadas `[x]`, se evaluó el estado de sync de los delta specs. Los delta specs de `admin-api` y `admin-dashboard` ya estaban sincronizados con los specs principales (vía `/update-docs` de la sesión anterior). La delta spec de la nueva capability `users-sorting-filters` no existía aún en `openspec/specs/`. El usuario eligió sincronizar antes de archivar: se creó `openspec/specs/users-sorting-filters/spec.md` con el contenido completo (6 requirements, ~30 scenarios). Finalmente se movió el directorio del change a `openspec/changes/archive/2026-02-26-t03-users-sorting-filters/`.

---

### 7. Pull Requests

**Prompt 1** *(Modo Agent):*

```
Estás operando dentro de un repositorio Git con una rama activa que se va a fusionar contra la rama principal (main o master).

Tu tarea es analizar todas las diferencias (git diff) entre la rama actual y la rama principal y generar el texto completo de una Pull Request.Genera un documento PR.md con el título y el texto de esta PULL REQUEST, incluyendo una descripción detallada de lo que cambia (el por qué y el impacto).
```

---

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
