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
| 0 | Diseño inicial en Figma Make | Diseño de referencia para producto y UX |
| 1 | Contexto general y visión de producto | `1.1 Objetivo` + `1.2 Características` |
| 2 | Lean Canvas — modelo de negocio y valor añadido | Amplía `1.1 Objetivo` |
| 3 | Casos de uso principales | Amplía `1.2 Características` |
| 4 | Diseño y experiencia de usuario (Figma MCP) | `1.3 Diseño y experiencia de usuario` |
| 5 | Modelo de datos | `2.1 Modelo de datos` |
| 6 | Diseño del sistema a alto nivel | `2.2 Diseño del sistema a alto nivel` |
| 7 | Diagrama C4 | `2.3 Diagrama C4` |

---

# Prompt 0: Diseño inicial en Figma Make

## Herramienta

Figma Make

## Prompt

RunMarket es un ecommerce especializado en productos deportivos para running. Permite a corredores principiantes, populares y avanzados encontrar zapatillas, ropa técnica y accesorios según distancia, superficie, nivel, objetivo de entrenamiento y preferencias personales. La primera versión se centra en catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

## Resultado

Genera un diseño inicial del ecommerce que sirva como referencia visual para documentar el producto, sus flujos principales y la experiencia de usuario.

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
Prompt 3.5 Refactor Readme documentación producto
Reorganiza la documentación del proyecto: mueve el contenido detallado de readme-producto.md a docs/PRD.md y reescribe las secciones 1.1, 1.2 y 1.3 de readme.md con versiones concisas que referencian el PRD para el detalle

# Prompt 5: Modelo de datos que cubra entidades, atributos y relaciones

## Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, modelado de datos y diseño de sistemas transaccionales, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero @docs/PRD.md para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket y la definición de arquitectura definida en .2docs/ARCHITECTURE.md.

La primera versión del sistema se centra en catálogo, búsqueda filtrada, ficha de producto, carrito, checkout simulado y gestión básica de pedidos.

## Objetivo

Generar el modelo de datos de las principales entidades para el sistema RunMarket a partir de los tipos y datos reales definidos en el diseño de Figma.

## Entidades de partida

Lee los ficheros del diseño de Figma https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=IpZidqsmflTLTgQ9-1 mediante el MCP (fileKey: `0wtedXb5138odnAOgHlMiA`) y extrae las entidades y sus atributos de:

- `src/app/types/product.ts` — tipos `Product`, `CartItem` y `Order`
- `src/app/data/products.ts` — ejemplos reales de productos con sus atributos de filtrado running

## Instrucciones

- Genera un diagrama `erDiagram` en formato **Mermaid** con todas las entidades, sus atributos (nombre y tipo) y las relaciones entre ellas
- Justifica la decisión sobre cómo modelar los atributos de filtrado running (`distance`, `surface`, `level`, `objective`): arrays, tablas de lookup o columnas enumeradas
- Describe brevemente cada entidad y su rol en el sistema
- Describe qué entidades adicionales serían relevantes en versiones posteriores (USER, REVIEW, WISHLIST, DISCOUNT, etc.) y por qué no se incluyen en el MVP

## Resultado

Resultado
- Crea el fichero docs/DATA-MODEL.md con la documentación completa.
- Actualiza readme.md dejando un resumen profesional en la sección 3. Modelo de Datos las secciones
- No modifiques otras secciones del README.

---

# Prompt 6: Diseño del sistema a alto nivel, explicado y con diagrama adjunto

## Rol
Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, arquitectura web y diseño de MVPs escalables, que colaboras en el diseño de la primera versión de RunMarket.

## Contexto
Toma como base el fichero docs/PRD.md para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket.

## Instrucciones
- Antes de empezar, preguntame que necesitas saber y que vas a considerar para diseñar este diagrama
- Evalúa brevemente las opciones de arquitectura posibles para el MVP
- Propón una arquitectura adecuada para la primera versión del ecommerce y justifica la elección
- Explica los componentes principales del sistema: frontend, backend, base de datos, servicios de dominio e integraciones externas
- Considera cómo el diseño de Figma se traduce en pantallas o módulos funcionales del frontend
- Genera un diagrama de arquitectura en formato Mermaid
- Contexto visual
- Ecommerce para productos deportivos


## Resultado
- Crea el fichero docs/ARCHITECTURE.md con la documentación completa.
- Actualiza readme.md dejando un resumen profesional en la sección 2. Arquitectura del Sistema las secciones: 
 - Diagrama de arquitectura
 - Descripción de componentes principales
 - Descripción de alto nivel del proyecto y estructura de ficheros
- No modifiques otras secciones del README.

---

# Prompt 7: Diagrama C4 que llegue en profundidad a uno de los componentes del sistema

## Rol

Actúa como un Arquitecto de software experto con amplia experiencia en ecommerce, documentación C4 y modelado técnico de sistemas web, que colaboras en el diseño de la primera versión de **RunMarket**.

## Contexto

Toma como base el fichero docs/PRD.md para entender el modelo de negocio, los casos de uso y el modelo de datos de RunMarket y la definición de arquitectura definida en docs/ARCHITECTURE.md.


## Instrucciones

Genera los diagramas C4 del sistema RunMarket con los siguientes niveles: Context, Containers, Components.  
Llega a nivel Code a los componentes principales:

- `ProductCatalogService`
- `CartService`
- `CheckoutSimulationService`
- `OrderManagementService`

## Contexto visual

Si lo consideras necesario, accede al MCP de Figma y utiliza el diseño para alinear los contenedores y componentes técnicos con las pantallas y flujos principales del ecommerce:

[Ecommerce para productos deportivos](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=eF2k70Y9pfxdTUqD-0)

## Resultado

Escribe el contenido en @docs/ARCHITECTURE.md.


---

# Prompt 8: Generación de Historias de Usuario de los principales casos de uso

/generate-user-stories
  
  ## Contexto

  Analiza:

  - `docs/PRD.md`
  - `docs/ARCHITECTURE.md` (solo si es necesario para validar coherencia funcional)
  - Figma Make (fileKey: `0wtedXb5138odnAOgHlMiA`) si necesitas contexto visual de pantallas o flujos. https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos?t=IpZidqsmflTLTgQ9-1

  ## Objetivo

  Generar las User Stories necesarias para soportar exclusivamente estos casos de uso del MVP:

  1. Búsqueda filtrada de productos para running
  2. Consulta de ficha de producto y decisión de compra
  3. Proceso de compra: carrito y checkout simulado

  ## Restricciones

  No incluir funcionalidades fuera de alcance: autenticación, recomendaciones, reviews, wishlist ni pagos reales o cualquier otra funcionalidad no necesaria para los casos de uso definidos                                                           

  ## Resultado

  Escribe el fichero `docs/USER-STORIES.md` con las historias agrupadas por caso de uso.
  

---

# Prompt 9: Generación backlog MVP

Analiza las User Stories generadas en @docs/USER-STORIES.md y añade una sección donde:                                                                                                                
  1. Explicas los criterios de priorización utilizados.                                                       
  2. Genera una tabla con las historias clasificadas como "Imprescindible para el MVP", ordenadas según la secuencia recomendada de implementación.                                             
  3. Genera una segunda tabla con el resto de historias, ordenadas por prioridad.

---

# Prompt 10: Actualiza el readme con el backlog del MVP

Lleva la tabla "Backlog MVP - Historias imprescindibles — Secuencia de implementación recomendada" contenida en @docs/USER-STORIES.md a la sección "5. Historias de Usuario" de @readme.md, además añade referencia al fichero @docs/USER-STORIES.md 


---

# Prompt 11: Primera versión prácticas de seguridad y OWASP

Analiza @docs/ARCHITECTURE.md y @docs/DATA-MODEL.md y enumera las prácticas de seguridad principales a tener en cuenta durante la implementación del proyecto, considerando OWASP Top 10 como referencia. Añádelas como una nueva sección en @CLAUDE.md

-------

# Prompt 12: Infraestructura

Actúa como arquitecto cloud senior especializado en infraestructuras cloud para MVPs eCommerce.

Diseña la infraestructura de despliegue de **RunMarket**. Analiza primero `docs/ARCHITECTURE.md` y utiliza como requisitos obligatorios la arquitectura, tecnologías y estructura allí definidas.

Propón y compara dos opciones:

1. **MVP académico**: coste ideal de 0 € y máximo de 10 €/mes, sencillo de mantener por una persona y suficiente para que los profesores prueben toda la aplicación.
2. **Infraestructura profesional**: preparada inicialmente para cientos o miles de usuarios, con evolución progresiva hasta millones sin rehacer la arquitectura actual.

Idealmentte utiliza un único proveedor, excepto que tengas una opinión muy fuerte para diversificar.

Para ambas opciones, especifica:
- Proveedores y servicios para frontend, backend y base de datos.
- Variables de entorno, migraciones y seed de Prisma.
- CI/CD, observabilidad, seguridad, backups y costes mensuales.
- Pros, contras, riesgos y limitaciones.
- Una recomendación final concreta y justificada.

Para la opción profesional, incluye además:
- CDN, gestión de secretos, cache y escalado horizontal.
- Separación entre `dev`, `staging` y `production`.
- Cuándo introducir Redis, colas, object storage, read replicas, WAF, Kubernetes y microservicios.
- Camino evolutivo: MVP académico → primeros usuarios → cientos/miles → escala alta → escala masiva.
- Evita recomendar Kubernetes o microservicios prematuramente.

Estructura el documento con:
1. Resumen ejecutivo.
2. Tabla comparativa.
3. Diagramas Mermaid.
4. Componentes por capa.
5. Costes estimados.
6. Pros, contras y riesgos.
7. Recomendaciones finales.

Sé concreto, práctico y justifica cada decisión según `docs/ARCHITECTURE.md`. Puedes comparar varios proveedores, pero selecciona una recomendación final para cada opción.

Redacta con tono técnico-académico y genera el resultado en `docs/INFRASTRUCTURE.md`.

# Prompt 13: Despliegue
Haz un Checklist del flujo de despliegue del MVP académico y generalo en `docs/DEPLOYMENT.md`



# Prompt 14: Coding Standards

Qué estandars deberíamos tener dado @docs/ARCHITECTURE.md  tanto en el backend como en el frontend incluido coding estandares

---

# Prompt 15: US técnica de infraestructura local (base de datos)

Añade una historia de usuario técnica en @docs/USER-STORIES.md que cubra la configuración del entorno de base de datos local como tarea previa a cualquier US de negocio.

La historia debe documentar:
- Levantamiento de PostgreSQL 16 mediante Docker Compose
- Configuración de Prisma ORM: `schema.prisma` con el modelo de datos completo según @docs/DATA-MODEL.md
- Ejecución de la migración inicial (`prisma migrate dev --name init`)
- Seed de datos de prueba (`prisma db seed`) con productos representativos del catálogo running
- Antes de generar cualquier fichero, preguntar al desarrollador por los valores de las variables de entorno necesarias:
  - `POSTGRES_USER` — usuario de la base de datos
  - `POSTGRES_PASSWORD` — contraseña
  - `POSTGRES_DB` — nombre de la base de datos
  - `POSTGRES_PORT` — puerto local (por defecto 5432, preguntar si quiere cambiarlo)
  - `BACKEND_PORT` — puerto del servidor Express (por defecto 4000)
  - `FRONTEND_URL` — origen permitido en CORS (por defecto http://localhost:3000)
- Con las respuestas, escribir el fichero `backend/.env` con todos los valores y construir `DATABASE_URL` automáticamente
- Añadir `backend/.env` a `.gitignore`; commitear solo `backend/.env.example` con las claves sin valores como referencia

Criterios de aceptación:
- Un solo comando (`docker compose up -d`) levanta PostgreSQL
- `npx prisma migrate dev` aplica el esquema sin errores
- `npx prisma db seed` inserta datos de prueba verificables
- El resto de USs pueden ejecutarse sobre esta base sin configuración adicional

Colócala antes de las historias de negocio existentes, etiquétala como US técnica (no de negocio) y añade la dependencia correspondiente en las USs que requieran base de datos.

# Prompt 15: Design System

Extrae el design system del prototipo actual en Figma Make y documenta los tokens principales.

- Genera el archivo docs/DESIGN-SYSTEM.md incluyendo: colores, tipografía, grid, spacing,...
- revisa tailwind.config.ts y extiéndelo con los tokens extraídos del prototipo cuando tenga sentido.

Mantén los nombres de tokens claros, reutilizables y alineados con el diseño existente. No rompas la configuración actual de Tailwind; solo añade o mejora los tokens necesarios.

# Prompt 16: Desarrollo US - Flujo SDD

/refine-user-story US-000
/implement-user-story US-000

/refine-user-story US-001
/implement-user-story US-001

...

/refine-user-story US-015
/implement-user-story US-015


# Prompt 17: Test End2End con Playwright

## Prompt 17.1 Crear skill Playwright
Actúa como QA Automation Lead. Crea .claude/skills/e2e-playwright/SKILL.md (en inglés) para guiar tests E2E con Playwright en RunMarket, derivando journeys, puertos y estructura del repo real (docs/ARCHITECTURE.md, package.json, docker-compose.yml) en cada uso, no de valores fijos.

Cubre: regla black-box (sin mocks de red/BD, sistema real arriba); config con baseURL por env var, un solo navegador, retries solo en CI, artefactos de fallo activados; aislamiento entre specs (datos únicos por ejecución, sin conteos absolutos, sin limpieza de datos); selectores por prioridad (rol/texto → data-testid → añadirlo al componente si falta); prohibido waitForTimeout; solo los escenarios de los criterios de aceptación, nunca inventados; rutas de error solo si son alcanzables vía UI sin canal lateral; confirmar que cada spec falla por el motivo correcto antes de confiarlo en verde; checklist final de "definition of done".

## Prompt 17.2 Crear US Para generar Tests E2E con Playwright

## Rol

Actúa como **QA Automation Engineer** de RunMarket.

## Objetivo

Genera `docs/backlog/US-014.md` ("Tests E2E con Playwright", ver `docs/USER-STORIES.md`). No invoques `/refine-user-story` ni `breakdown-user-story`.

## Contexto

US-014 ("Tests E2E con Playwright") es distinta del resto del backlog: no añade código de producto, solo una suite E2E que ejercita el sistema completo ya construido en US-001 a US-013 (archivadas en `docs/backlog/archive/`). El flujo estándar de `/refine-user-story` y `breakdown-user-story` asume contrato de API/componente, que no aplica aquí.

## Instrucciones

**Reglas QA:** no inventes funcionalidades, endpoints ni datos de seed fuera de lo real (verifica en código, no asumas); prioriza comportamiento observable por el usuario; anota riesgos de flakiness anticipados; valida que cada journey ejercita una llamada de red real y su reflejo en la UI, no solo el clic.

**Lee antes de escribir:** US-014 en `docs/USER-STORIES.md`; `.claude/skills/e2e-playwright/SKILL.md` íntegro (fuente de verdad de specs/config/precondiciones); `docs/ARCHITECTURE.md` (ubicación de `e2e/`, puertos); `.claude/skills/breakdown-user-story/task-template.md` (solo la plantilla de tarea); rutas/endpoints reales en el código (`backend/src/app.ts`, rutas frontend, componentes con `data-testid` ya existentes).

**Escribe `docs/backlog/US-014.md`** en español, con la estructura estándar (estado del workflow, US refinada, tabla de tareas, detalle por tarea, verificación integrada, sección OWASP, cierre) para que `/implement-user-story` lo procese sin cambios:

- US refinada → contrato de journeys (los 3 specs: `catalog`, `product`, `purchase`), rutas/endpoints reales ejercitados, precondición de sistema arriba + US-001 a US-013 ya archivadas.
- Tareas → una por spec, `Capa: Frontend`, `Verificacion` = fichero Playwright exacto, más una tarea de config de Playwright y una de documentación.
- Tarea de documentación → crea **`docs/E2E-TESTING.md`** (no toques `readme.md`) con el comando, la precondición y la variable `E2E_BASE_URL`; enlázalo desde la tabla de documentación de `CLAUDE.md`. Anota explícitamente que esto es una desviación deliberada del literal de la US (que dice `readme.md`), sin modificar `docs/USER-STORIES.md`.
- Detalle de tarea → en "Tests TDD", responde **"no"** a "test en rojo antes del código de producción" con el motivo ("sin código de producción nuevo; el spec verifica comportamiento ya construido en US-001 a US-013"). Sustituye el ciclo rojo-verde-refactor por la disciplina de `e2e-playwright`: confirmar que el spec falla por el motivo correcto antes de confiarlo en verde (no por timing/entorno), más riesgo de flakiness anticipado por tarea (o "ninguno detectado").
- Verificación integrada → ejecutar `npx playwright test` (los tres specs juntos, modo headless) y pegar la salida en verde; condición de cierre de la Fase 4 antes de pasar a la Fase 5. Sin los tres specs en verde, la US no avanza de fase.
- Sección OWASP → checklist de 2-3 puntos, no tabla completa del Top 10: (1) artefactos de fallo de Playwright (trace/screenshot/video) no expuestos/commiteados con datos de checkout visibles, (2) sin credenciales reales hardcodeadas en specs/config, (3) `data-testid` no filtra IDs internos sensibles. El resto de categorías OWASP, N/A con motivo ("sin lógica de negocio nueva").
- Sección Cierre (`## Cierre — US-014`) → el mismo checklist de 8 puntos que usa la Fase 6 de `implement-user-story` (tareas implementadas, criterios mapeados, suite en verde, code-review, seguridad aprobada, reglas de `CLAUDE.md`, fases marcadas, sin alcance fuera de la US), todo sin marcar — se completa al cerrar la US, no ahora.

## Resultado

Crea el fichero `docs/backlog/US-014.md` con la estructura descrita. Muestra el fichero al terminar, antes de seguir con `/implement-user-story US-014`.

---

# Prompt 18: Generar la documentación OpenAPI/Swagger

Genera la especificación OpenAPI de la API REST de RunMarket a partir de los schemas Zod existentes en backend/src/schemas/ (usa zod-to-openapi para que no se pueda desincronizar de la validación real). Cubre todos los endpoints reales de backend/src/routes/, con ejemplos de request/response basados en datos reales de backend/prisma/seed.ts (no inventados). Expón el spec como Swagger UI en /api/docs y JSON en /api/docs.json. 

---

# Prompt 19: Pentest final

Eres un pentesting experto, quiero que analices la web y me digas todas las vulnerabilidades posibles. Si lo necesitas, create un docker con herramientas de hacking

Dado el informe de pentesting de esta conversación documenta las historias de usiario para resolver las vulnerabilidades en @docs/USER-STORIES.mdd y luego ejecuta
/refine-user-story para cada historia de usuario.

Actúa como un pentester experto, quiero que analices la aplicación RunMarket y detectes todas las vulnerabilidades de seguridad posibles.

Revisa autenticación, autorización, sesiones, cabeceras HTTP, cookies, CORS, validación de inputs, subida de archivos, APIs y exposición de información sensible. Busca problemas comunes como XSS, SQLi, SSRF, path traversal, CSRF, open redirects, errores de configuración y controles de acceso débiles.

Si necesitas herramientas, puedes preparar un Docker aislado con utilidades de pentesting.

Entrega los resultados con:
- Vulnerabilidad encontrada
- Severidad
- Evidencia
- Impacto
- Cómo reproducirla de forma segura
- Recomendación de corrección

# Prompt 20: Historias de Usuario para Remediación de Vulnerabilidades del Pentest

Dado el informe de pentesting de esta conversación documenta las historias de usiario para resolver las vulnerabilidades en @docs/USER-STORIES.mdd y luego ejecuta /refine-user-story para cada historia de usuario.

# Prompt 21: Implementar Historias de Usuario para Remediación de Vulnerabilidades del Pentest

/implement-user-story US-016

/implement-user-story US-017



