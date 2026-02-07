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
