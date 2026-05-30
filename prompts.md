> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

>  Los prompts fueron iterados y refinados manualmente para ajustar el alcance del MVP y mejorar la calidad de las respuestas generadas por IA.

Conversación completa: [prompts-full-conversation.md](prompts-full-conversation.md)

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

---

### Prompt 1: Contexto general y visión de producto

#### Rol esperado

Actúa como un Business Analyst senior con amplia experiencia en ecommerce, producto digital y procesos de compra online, que trabaja para diseñar la primera versión de **RunMarket**, un ecommerce especializado en productos deportivos para running.

#### Objetivo del sistema

Definir una primera versión que sea:
- Realista
- Competitiva
- Enfocada al MVP

Con foco en:

- Ayudar a corredores principiantes, populares y avanzados a encontrar productos adecuados para su perfil
- Facilitar la exploración del catálogo mediante filtros relevantes: distancia, superficie, nivel y objetivo de entrenamiento
- Ofrecer fichas de producto claras y orientadas a la decisión de compra
- Permitir una experiencia de carrito y checkout simulado sencilla
- Incluir una gestión básica de pedidos para validar el ciclo completo de compra

#### Funcionalidades básicas del sistema

1. Catálogo de productos deportivos para running
2. Búsqueda y filtrado por categoría, distancia, superficie, nivel y objetivo de entrenamiento
3. Ficha de producto con información técnica y relevante para la compra
4. Gestión de carrito
5. Checkout simulado
6. Confirmación de pedido
7. Gestión básica de pedidos

#### Contexto visual

Si tienes acceso al MCP de Figma, consulta el diseño para alinear la descripción del producto con la experiencia visual propuesta:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

#### Resultado

Escribe el contenido en el fichero `readme-producto.md`:

- En `### 1.1. Objetivo`: descripción breve del software RunMarket, valor añadido y ventajas competitivas
- En `### 1.2. Características y funcionalidades principales`: lista detallada de las funcionalidades del MVP


---

### Prompt 2: Descripción de los 3 casos de uso principales, con el diagrama asociado a cada uno

#### Rol

Actúa como un Product Owner experto con amplia experiencia en ecommerce y definición funcional de productos orientados a MVP, que colaboras en el diseño de la primera versión de **RunMarket**.

#### Contexto

Toma como base el fichero `#file:readme-producto.md` para entender el modelo de negocio y la propuesta funcional ya documentada de RunMarket.

#### Objetivo

Describir y documentar los 3 casos de uso principales:

1. Búsqueda filtrada de productos para running
2. Consulta de ficha de producto y decisión de compra
3. Proceso de compra: carrito y checkout simulado

#### Instrucciones

Para cada caso de uso:

- Proporciona una descripción del caso de uso en formato Markdown
- Indica actores principales
- Define el flujo principal paso a paso, incluyendo el diagrama de flujo de usuario en formato **Mermaid**
- Describe escenarios alternativos o errores relevantes

**Fuera del MVP:** RunMarket permite comprar sin registro. Los pedidos quedan asociados a la sesión actual y no se recuperan al cerrar el navegador.

#### Resultado

Amplía la sección `### 1.2. Características y funcionalidades principales` del fichero `readme-producto.md` añadiendo los tres casos de uso con sus diagramas.

---

### Prompt 3: Diseño y experiencia de usuario

#### Rol

Actúa como UX Lead con amplia experiencia en ecommerce y diseño de experiencias de compra digitales, que colaboras en el diseño de la primera versión de **RunMarket**.

#### Contexto

Toma como base el fichero `#file:readme-producto.md` para entender la visión de producto y los casos de uso ya definidos de RunMarket.

Accede al diseño creado con Figma Make a través del MCP de Figma (fileKey: 0wtedXb5138odnAOgHlMiA):

https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=IpZidqsmflTLTgQ9-1

#### Objetivo

Documentar la experiencia de usuario de RunMarket a partir del diseño de Figma, describiendo cada pantalla principal, sus decisiones de diseño y cómo acompañan al usuario en su recorrido de compra.

#### Instrucciones

- Accede al diseño de Figma para obtener el contexto visual real
- Describe cada pantalla principal: home, catálogo con filtros, ficha de producto, carrito, checkout y confirmación de pedido
- Para cada pantalla: explica qué funcionalidad cubre, qué componentes o patrones de diseño destacan y cómo contribuye al objetivo del usuario
- Relaciona cada pantalla con el caso de uso correspondiente ya documentado
- Las capturas de pantalla las realizaré manualmente para evitar consumir exceso de tokens

#### Resultado

Escribe el contenido en la sección `### 1.3. Diseño y experiencia de usuario` del fichero `readme-producto.md`. El contenido debe ser comprensible de forma autónoma, sin necesidad de haber leído las secciones anteriores.

---

---

### Prompt 3.5: Refactor documentación de producto

Reorganiza la documentación del proyecto: mueve el contenido detallado de `readme-producto.md` a `docs/PRD.md` y reescribe las secciones 1.1, 1.2 y 1.3 de `readme.md` con versiones concisas que referencian el PRD para el detalle. Crea además `CLAUDE.md` en la raíz con un resumen ejecutivo del proyecto, el stack técnico, las rutas principales y punteros a los documentos clave, de forma que se cargue automáticamente como contexto en futuras sesiones de Claude Code.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

---

### Prompt 1: Diseño del sistema a alto nivel, explicado y con diagrama adjunto

#### Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, arquitectura web y diseño de MVPs escalables, que colaboras en el diseño de la primera versión de RunMarket.

#### Contexto

Toma como base el fichero `docs/PRD.md` para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket.

#### Instrucciones

- Antes de empezar, preguntame que necesitas saber y que vas a considerar para diseñar este diagrama
- Evalúa brevemente las opciones de arquitectura posibles para el MVP
- Propón una arquitectura adecuada para la primera versión del ecommerce y justifica la elección
- Explica los componentes principales del sistema: frontend, backend, base de datos, servicios de dominio e integraciones externas
- Considera cómo el diseño de Figma se traduce en pantallas o módulos funcionales del frontend
- Genera un diagrama de arquitectura en formato Mermaid

#### Contexto visual

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

#### Resultado

- Crea el fichero `docs/ARCHITECTURE.md` con la documentación completa.
- Actualiza `readme.md` dejando un resumen profesional en la sección 2. Arquitectura del Sistema: Diagrama de arquitectura, Descripción de componentes principales, Descripción de alto nivel del proyecto y estructura de ficheros.
- No modifiques otras secciones del README.

---

### Prompt 2: Diagrama C4 que llegue en profundidad a los componentes del sistema

#### Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, documentación C4 y modelado técnico de sistemas web, que colaboras en el diseño de la primera versión de **RunMarket**.

#### Contexto

Toma como base el fichero `docs/PRD.md` para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket y la definición de arquitectura definida en `docs/ARCHITECTURE.md`.

#### Instrucciones

Genera los diagramas C4 del sistema RunMarket con los siguientes niveles: Context, Containers, Components.
Llega a nivel Code a los componentes principales:

- `ProductCatalogService`
- `CartService`
- `CheckoutSimulationService`
- `OrderManagementService`

#### Contexto visual

Si lo consideras necesario, accede al MCP de Figma y utiliza el diseño para alinear los contenedores y componentes técnicos con las pantallas y flujos principales del ecommerce:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

#### Resultado

Escribe el contenido en `docs/ARCHITECTURE.md`.

### **2.2. Descripción de componentes principales:**

---

### Prompt 1: Diseño del sistema a alto nivel, explicado y con diagrama adjunto

Se ha utilizado el **Prompt 1** de la sección `2.1. Diagrama de arquitectura`, ya que este prompt solicita explícitamente explicar los componentes principales del sistema: frontend, backend, base de datos, servicios de dominio e integraciones externas.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

---

### Prompt 1: Diseño del sistema a alto nivel, explicado y con diagrama adjunto

Se ha utilizado el **Prompt 1** de la sección `2.1. Diagrama de arquitectura`, ya que este prompt genera la documentación completa de `docs/ARCHITECTURE.md` y actualiza el resumen de arquitectura en `readme.md`, incluyendo la descripción de alto nivel y la estructura del proyecto.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 3. Modelo de Datos

---

### Prompt 1: Modelo de datos que cubra entidades, atributos y relaciones

#### Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, modelado de datos y diseño de sistemas transaccionales, que colaboras en el diseño de la primera versión de **RunMarket**.

#### Contexto

Toma como base el fichero `docs/PRD.md` para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket y la definición de arquitectura definida en `docs/ARCHITECTURE.md`.

La primera versión del sistema se centra en catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

#### Objetivo

Generar el modelo de datos de las principales entidades para el sistema RunMarket a partir de los tipos y datos reales definidos en el diseño de Figma.

#### Entidades de partida

Lee los ficheros del diseño de Figma mediante el MCP (fileKey: `0wtedXb5138odnAOgHlMiA`) y extrae las entidades y sus atributos de:

- `src/app/types/product.ts` — tipos `Product`, `CartItem` y `Order`
- `src/app/data/products.ts` — ejemplos reales de productos con sus atributos de filtrado running

#### Instrucciones

- Genera un diagrama `erDiagram` en formato **Mermaid** con todas las entidades, sus atributos (nombre y tipo) y las relaciones entre ellas
- Justifica la decisión sobre cómo modelar los atributos de filtrado running (`distance`, `surface`, `level`, `objective`): arrays, tablas de lookup o columnas enumeradas
- Describe brevemente cada entidad y su rol en el sistema
- Describe qué entidades adicionales serían relevantes en versiones posteriores (USER, REVIEW, WISHLIST, DISCOUNT, etc.) y por qué no se incluyen en el MVP

#### Resultado

- Crea el fichero `docs/DATA-MODEL.md` con la documentación completa.
- Actualiza `readme.md` dejando un resumen profesional en la sección 3. Modelo de Datos.
- No modifiques otras secciones del README.

---

## 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 5. Historias de Usuario


### Prompt 1: Generación de Historias de Usuario de los principales casos de uso*

/generate-user-stories
  
#### Contexto

Analiza:
  - `docs/PRD.md`
  - `docs/ARCHITECTURE.md` (solo si es necesario para validar coherencia funcional)
  - Figma Make (fileKey: `0wtedXb5138odnAOgHlMiA`) si necesitas contexto visual de pantallas o flujos. https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=IpZidqsmflTLTgQ9-1

#### Objetivo

Generar las User Stories necesarias para soportar exclusivamente estos casos de uso del MVP:

  1. Búsqueda filtrada de productos para running
  2. Consulta de ficha de producto y decisión de compra
  3. Proceso de compra: carrito y checkout simulado

#### Restricciones

No incluir funcionalidades fuera de alcance: autenticación, recomendaciones, reviews, wishlist ni pagos reales o cualquier otra funcionalidad no necesaria para los casos de uso definidos                                                           

#### Resultado

Escribe el fichero `docs/USER-STORIES.md` con las historias agrupadas por caso de uso.

### Prompt 2: Generación backlog MVP

Analiza las User Stories generadas en @docs/USER-STORIES.md y añade una sección donde:                                                                                                                
  1. Explicas los criterios de priorización utilizados.                                                       
  2. Genera una tabla con las historias clasificadas como "Imprescindible para el MVP", ordenadas según la secuencia recomendada de implementación.                                             
  3. Genera una segunda tabla con el resto de historias, ordenadas por prioridad.

---

## 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

## 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
