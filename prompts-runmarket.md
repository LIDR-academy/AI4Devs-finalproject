# ✍️ Prompts Ejercicio Diseño de un ecommerce especializado en running

Herramientas utilizadas en el ejercicio: **Claude Code + MCP de Figma**

## Contexto del proyecto

**RunMarket** es un ecommerce especializado en productos deportivos para running. Permite a corredores principiantes, populares y avanzados encontrar zapatillas, ropa técnica y accesorios según distancia, superficie, nivel, objetivo de entrenamiento y preferencias personales.

La primera versión se centra en: catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

**Diseño de referencia (Figma Make):**  
[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

> Este diseño ha sido creado con Figma Make y puede ser consultado a través del MCP de Figma en Claude. Se usa para alinear funcionalidades, flujos visuales e interfaz con la documentación del proyecto, especialmente en la sección de diseño y experiencia de usuario.

## Requisitos de salida aplicables a todos los prompts

- **Tono:** claro, académico y profesional
- **Enfoque:** solución realista, coherente y bien estructurada
- **Justificación:** evitar explicaciones vagas; todas las decisiones deben estar justificadas
- **Diagramas:** usar siempre formato **Mermaid**
- **Destino:** todo el contenido generado se escribe en `readme-producto.md` en la sección indicada en cada prompt

---

## Estructura de prompts y secciones del README que completan

| Prompt | Contenido | Sección `readme-producto.md` |
|--------|-----------|------------------------------|
| 1 | Contexto general y visión de producto | `1.1 Objetivo` + `1.2 Características` |
| 2 | Lean Canvas — modelo de negocio y valor añadido | Amplía `1.1 Objetivo` |
| 3 | Casos de uso principales | Amplía `1.2 Características` |
| 4 | Diseño y experiencia de usuario (Figma MCP) | `1.3 Diseño y experiencia de usuario` |
| 5 | Modelo de datos | `2.1 Modelo de datos` |
| 6 | Diseño del sistema a alto nivel | `2.2 Diseño del sistema a alto nivel` |
| 7 | Diagrama C4 | `2.3 Diagrama C4` |

---

# Prompt 1: Contexto general y visión de producto

## Rol esperado

Actúa como un Business Analyst senior con amplia experiencia en ecommerce, producto digital y procesos de compra online, que trabaja para diseñar la primera versión de **RunMarket**, un ecommerce especializado en productos deportivos para running.

## Objetivo del sistema

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

## Funcionalidades básicas del sistema

1. Catálogo de productos deportivos para running
2. Búsqueda y filtrado por categoría, distancia, superficie, nivel y objetivo de entrenamiento
3. Ficha de producto con información técnica y relevante para la compra
4. Gestión de carrito
5. Checkout simulado
6. Confirmación de pedido
7. Gestión básica de pedidos

## Contexto visual

Si tienes acceso al MCP de Figma, consulta el diseño para alinear la descripción del producto con la experiencia visual propuesta:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

## Resultado

Escribe el contenido en el fichero `readme-producto.md`:

- En `### 1.1. Objetivo`: descripción breve del software RunMarket, valor añadido y ventajas competitivas
- En `### 1.2. Características y funcionalidades principales`: lista detallada de las funcionalidades del MVP

---

# Prompt 2: Lean Canvas para entender el modelo de negocio

## Rol

Actúa como Product Manager senior con amplia experiencia en ecommerce, retail digital y definición de productos orientados a MVP.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender la visión de producto y las funcionalidades ya documentadas de RunMarket.

Ten en cuenta que RunMarket es un ecommerce especializado en productos deportivos para running cuya primera versión se centra en catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

## Contexto visual

Usa el diseño de Figma Make como apoyo para entender la propuesta de valor y la forma en que se presentan los productos:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

## Resultado

Amplía la sección `### 1.1. Objetivo` del fichero `readme-producto.md` añadiendo un diagrama Lean Canvas visible dentro del Markdown.

El diagrama debe estar en formato **Mermaid** y cubrir:

- Problema
- Segmentos de clientes
- Propuesta de valor única
- Solución
- Canales
- Flujos de ingresos
- Estructura de costes
- Métricas clave
- Ventaja competitiva

---

# Prompt 3: Descripción de los 3 casos de uso principales, con el diagrama asociado a cada uno

## Rol

Actúa como un Product Owner experto con amplia experiencia en ecommerce y definición funcional de productos orientados a MVP, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender el modelo de negocio y la propuesta funcional ya documentada de RunMarket.

## Objetivo

Describir y documentar los 3 casos de uso principales:

1. Búsqueda filtrada de productos para running
2. Consulta de ficha de producto y decisión de compra
3. Proceso de compra: carrito y checkout simulado

## Instrucciones

Para cada caso de uso:

- Proporciona una descripción del caso de uso en formato Markdown
- Indica actores principales
- Define el flujo principal paso a paso, incluyendo el diagrama de flujo de usuario en formato **Mermaid**
- Describe escenarios alternativos o errores relevantes

**Fuera del MVP:** RunMarket permite comprar sin registro. Los pedidos quedan asociados a la sesión actual y no se recuperan al cerrar el navegador.

## Resultado

Amplía la sección `### 1.2. Características y funcionalidades principales` del fichero `readme-producto.md` añadiendo los tres casos de uso con sus diagramas.

---

# Prompt 4: Diseño y experiencia de usuario

## Rol

Actúa como UX Lead con amplia experiencia en ecommerce y diseño de experiencias de compra digitales, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender la visión de producto y los casos de uso ya definidos de RunMarket.

Accede al diseño creado con Figma Make a través del MCP de Figma (fileKey: 0wtedXb5138odnAOgHlMiA):

https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=IpZidqsmflTLTgQ9-1

## Objetivo

Documentar la experiencia de usuario de RunMarket a partir del diseño de Figma, describiendo cada pantalla principal, sus decisiones de diseño y cómo acompañan al usuario en su recorrido de compra.

## Instrucciones

- Accede al diseño de Figma para obtener el contexto visual real
- Describe cada pantalla principal: home, catálogo con filtros, ficha de producto, carrito, checkout y confirmación de pedido
- Para cada pantalla: explica qué funcionalidad cubre, qué componentes o patrones de diseño destacan y cómo contribuye al objetivo del usuario
- Relaciona cada pantalla con el caso de uso correspondiente ya documentado
- Las capturas de pantalla las realizaré manualmente para evitar consumir exceso de tokens

## Resultado

Escribe el contenido en la sección `### 1.3. Diseño y experiencia de usuario` del fichero `readme-producto.md`. El contenido debe ser comprensible de forma autónoma, sin necesidad de haber leído las secciones anteriores.

---

# Prompt 5: Modelo de datos que cubra entidades, atributos y relaciones

## Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, modelado de datos y diseño de sistemas transaccionales, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender el modelo de negocio y los casos de uso principales de RunMarket.

La primera versión del sistema se centra en catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

## Objetivo

Generar el modelo de datos de las principales entidades para el sistema RunMarket a partir de los tipos y datos reales definidos en el diseño de Figma.

## Entidades de partida

Lee los ficheros del diseño de Figma mediante el MCP (fileKey: `0wtedXb5138odnAOgHlMiA`) y extrae las entidades y sus atributos de:

- `src/app/types/product.ts` — tipos `Product`, `CartItem` y `Order`
- `src/app/data/products.ts` — ejemplos reales de productos con sus atributos de filtrado running

Si no tienes acceso al MCP de Figma, infiere las entidades a partir de los casos de uso descritos en `readme-producto.md`.

## Instrucciones

- Genera un diagrama `erDiagram` en formato **Mermaid** con todas las entidades, sus atributos (nombre y tipo) y las relaciones entre ellas
- Justifica la decisión sobre cómo modelar los atributos de filtrado running (`distance`, `surface`, `level`, `objective`): arrays, tablas de lookup o columnas enumeradas
- Describe brevemente cada entidad y su rol en el sistema
- Describe qué entidades adicionales serían relevantes en versiones posteriores (USER, REVIEW, WISHLIST, DISCOUNT, etc.) y por qué no se incluyen en el MVP

## Resultado

Añade una nueva sección `## 2. Arquitectura y diseño técnico` al fichero `readme-producto.md` si no existe, y escribe el contenido en `### 2.1. Modelo de datos`.

---

# Prompt 6: Diseño del sistema a alto nivel, explicado y con diagrama adjunto

## Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, arquitectura web y diseño de MVPs escalables, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket.

## Instrucciones

- Evalúa brevemente las opciones de arquitectura posibles para el MVP
- Propón una arquitectura adecuada para la primera versión del ecommerce y justifica la elección
- Explica los componentes principales del sistema: frontend, backend, base de datos, servicios de dominio e integraciones externas
- Considera cómo el diseño de Figma se traduce en pantallas o módulos funcionales del frontend
- Genera un diagrama de arquitectura en formato **Mermaid**

## Contexto visual

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

## Resultado

Escribe el contenido en la sección `### 2.2. Diseño del sistema a alto nivel` del fichero `readme-producto.md`.

---

# Prompt 7: Diagrama C4 que llegue en profundidad a uno de los componentes del sistema

## Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, documentación C4 y modelado técnico de sistemas web, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero `#file:readme-producto.md` para entender el modelo de negocio, los casos de uso, el modelo de datos y el diseño de arquitectura del sistema RunMarket.

## Instrucciones

Genera los diagramas C4 del sistema RunMarket con los siguientes niveles: Context, Containers, Components.  
Llega a nivel Code sólo en uno de los componentes principales. Selecciona el más representativo del MVP entre los siguientes y justifica brevemente la elección:

- `ProductCatalogService`
- `CartService`
- `CheckoutSimulationService`
- `OrderManagementService`

## Contexto visual

Si tienes acceso al MCP de Figma, utiliza el diseño para alinear los contenedores y componentes técnicos con las pantallas y flujos principales del ecommerce:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

## Resultado

Escribe el contenido en la sección `### 2.3. Diagrama C4` del fichero `readme-producto.md`.
