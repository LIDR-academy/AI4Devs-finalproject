# RunMarket — User Stories

## Resumen

| ID | Título | Caso de uso | Talla | Prioridad |
|---|---|---|---|---|
| US-001 | Ver el catálogo de productos | CU1 | M | Imprescindible |
| US-002 | Filtrar el catálogo por atributos de running | CU1 | M | Imprescindible |
| US-003 | Filtrar por categoría y precio | CU1 | S | Importante |
| US-004 | Limpiar filtros activos | CU1 | S | Importante |
| US-005 | Consultar la ficha técnica de un producto | CU2 | M | Imprescindible |
| US-006 | Seleccionar talla y color del producto | CU2 | S | Imprescindible |
| US-007 | Añadir un producto al carrito | CU2 | M | Imprescindible |
| US-008 | Revisar y modificar el carrito | CU3 | M | Imprescindible |
| US-009 | Introducir datos de envío | CU3 | M | Imprescindible |
| US-010 | Introducir los datos de pago simulado | CU3 | M | Imprescindible |
| US-011 | Revisar y confirmar el pedido | CU3 | S | Imprescindible |
| US-012 | Ver la confirmación del pedido | CU3 | S | Imprescindible |
| US-013 | Consultar el historial de pedidos | CU3 | S | Importante |

---

## Priorización y secuencia de implementación

### Criterios de priorización

Las historias se han clasificado aplicando tres criterios combinados:

**1. Necesidad para el ciclo mínimo de compra**
Una historia es imprescindible si su ausencia impide al corredor completar el flujo completo descubrir → evaluar → añadir → pagar → confirmar. Cualquier historia que bloquee ese ciclo recibe prioridad máxima independientemente de su complejidad técnica.

**2. Dependencia técnica**
Las historias fundacionales —catálogo, ficha de producto, carrito— deben existir antes que las que dependen de ellas —filtros, variantes, checkout—. La secuencia de implementación respeta este orden de construcción para poder entregar incrementos funcionales verificables en cada paso.

**3. Validación de la propuesta de valor diferencial**
Los filtros por atributos de running (US-002) son el diferencial central de RunMarket frente a eCommerce generalistas. Aunque técnicamente no bloquean el ciclo de compra, su implementación temprana permite validar la propuesta de valor del producto desde las primeras iteraciones. Por eso se clasifican como imprescindibles y se ubican en las primeras posiciones de la secuencia.

---

### Backlog MVP - Historias imprescindibles — Secuencia de implementación recomendada

| Orden | ID | Título | Caso de uso | Talla | Justificación de la posición |
|---|---|---|---|---|---|
| 1 | US-001 | Ver el catálogo de productos | CU1 | M | Base de toda la experiencia; sin catálogo no hay entrada al producto |
| 2 | US-002 | Filtrar el catálogo por atributos de running | CU1 | M | Propuesta de valor diferencial; valida el núcleo del producto desde el inicio |
| 3 | US-005 | Consultar la ficha técnica de un producto | CU2 | M | Destino de navegación desde el catálogo; principal punto de conversión |
| 4 | US-006 | Seleccionar talla y color del producto | CU2 | S | Prerrequisito directo de US-007; sin variante válida no hay añadido al carrito |
| 5 | US-007 | Añadir un producto al carrito | CU2 | M | Conecta el descubrimiento con la compra; primer paso transaccional |
| 6 | US-008 | Revisar y modificar el carrito | CU3 | M | Punto de entrada al checkout; el corredor revisa y confirma su selección |
| 7 | US-009 | Introducir datos de envío | CU3 | M | Paso 1 del checkout; sin dirección no hay pedido |
| 8 | US-010 | Introducir los datos de pago simulado | CU3 | M | Paso 2 del checkout; completa los datos necesarios para generar el pedido |
| 9 | US-011 | Revisar y confirmar el pedido | CU3 | S | Paso 3 del checkout; crea el pedido y vacía el carrito |
| 10 | US-012 | Ver la confirmación del pedido | CU3 | S | Cierra el ciclo de compra; sin confirmación el corredor no sabe si la compra fue exitosa |

---

### Resto de historias — Ordenadas por prioridad

| ID | Título | Caso de uso | Talla | Prioridad | Motivo |
|---|---|---|---|---|---|
| US-003 | Filtrar por categoría y precio | CU1 | S | Importante | Complementa los filtros running sin ser parte del diferencial; implementable en un segundo ciclo |
| US-004 | Limpiar filtros activos | CU1 | S | Importante | Mejora la usabilidad del panel de filtros; depende de que US-002 y US-003 estén implementados |
| US-013 | Consultar el historial de pedidos | CU3 | S | Importante | Depende de que existan pedidos creados (US-011); aporta valor pero no bloquea el ciclo de compra |

---

## CU1 — Búsqueda filtrada de productos para running

---

### US-001 — Ver el catálogo de productos

**Caso de uso asociado:** CU1 — Búsqueda filtrada de productos para running

**Historia de usuario:**
Como corredor, quiero ver el catálogo completo de productos de running al acceder a RunMarket, para explorar la oferta disponible y descubrir opciones antes de acotar por mis criterios.

**Descripción:**
Pantalla principal del eCommerce. Muestra el listado de productos (zapatillas, ropa técnica y accesorios) con imagen, nombre, marca, precio y etiquetas de nivel. Es el punto de entrada a la experiencia de compra y el primer estímulo de descubrimiento para el corredor.

**Criterios de aceptación:**
- [ ] Escenario principal: al acceder a `/`, se muestra el listado de todos los productos disponibles en rejilla responsiva (3 columnas en desktop, 2 en tablet, 1 en móvil)
- [ ] Cada tarjeta de producto muestra imagen principal, nombre, marca, precio y etiqueta de nivel (principiante, popular, avanzado)
- [ ] Se muestra el contador de resultados con el total de productos visibles (`X productos encontrados`)
- [ ] Escenario alternativo: si el catálogo no tiene productos, se muestra un estado vacío informativo con mensaje orientativo
- [ ] Error/validación: si la carga de productos falla, se muestra un mensaje de error no bloqueante con opción de reintentar; el layout de página no se rompe

**Datos o entidades implicadas:**
- `Product`: id, name, brand, price, image, level[], category

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-002 — Filtrar el catálogo por atributos de running

**Caso de uso asociado:** CU1 — Búsqueda filtrada de productos para running

**Historia de usuario:**
Como corredor, quiero filtrar el catálogo por distancia objetivo, tipo de superficie, nivel y objetivo de entrenamiento, para ver únicamente los productos que se adaptan a mi perfil sin tener que revisar el catálogo completo.

**Descripción:**
Funcionalidad diferencial de RunMarket. El panel lateral de filtros expone las cuatro dimensiones propias del running. Los filtros son combinables: dentro de una dimensión se aplica lógica OR (un producto puede cubrir varias distancias), entre dimensiones se aplica AND. Los resultados se actualizan de forma dinámica sin recarga de página.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor selecciona uno o más valores en distancia (5K, 10K, media maratón, maratón, ultra), superficie (asfalto, trail, pista, mixto), nivel (principiante, popular, avanzado) u objetivo (entrenamiento, competición, recuperación, uso diario); el catálogo se actualiza mostrando únicamente los productos que satisfacen todos los criterios activos
- [ ] Los filtros activos se reflejan visualmente en el panel (checkbox marcado); el contador de resultados se actualiza en tiempo real
- [ ] La lógica de filtrado es AND entre dimensiones y OR dentro de cada dimensión
- [ ] Escenario alternativo: el corredor selecciona una combinación de filtros sin resultados; se muestra el mensaje «No se encontraron productos para esta combinación» con la opción de eliminar algún filtro
- [ ] Error/validación: los filtros no bloquean combinaciones inválidas; si la combinación no produce resultados, la UI lo comunica claramente sin estado de error técnico visible

**Datos o entidades implicadas:**
- `Product`: distance[], surface[], level[], objective[]

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-003 — Filtrar por categoría y precio

**Caso de uso asociado:** CU1 — Búsqueda filtrada de productos para running

**Historia de usuario:**
Como corredor, quiero filtrar el catálogo por categoría de producto y rango de precio, para acotar mi búsqueda a un tipo específico de artículo y ajustarla a mi presupuesto.

**Descripción:**
Complementa los filtros de atributos running con dos dimensiones transversales: categoría (zapatillas, ropa, accesorios) y precio máximo mediante slider. Ambos filtros son compatibles con los filtros running y operan de forma aditiva.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor selecciona una categoría; el catálogo filtra mostrando solo los productos de esa categoría, compatibles con los demás filtros activos
- [ ] El corredor ajusta el slider de precio máximo; el catálogo actualiza en tiempo real mostrando solo productos con precio ≤ valor seleccionado; la etiqueta del slider muestra el rango activo
- [ ] Categoría y precio son compatibles con los filtros de running (se aplican conjuntamente)
- [ ] Escenario alternativo: el corredor selecciona categoría «Zapatillas» con distancia «Maratón»; se muestran solo zapatillas aptas para maratón
- [ ] Error/validación: el slider de precio no permite valor máximo menor que el mínimo

**Datos o entidades implicadas:**
- `Product`: category, price

**Estimación:** S

**Prioridad:** Importante

---

### US-004 — Limpiar filtros activos

**Caso de uso asociado:** CU1 — Búsqueda filtrada de productos para running

**Historia de usuario:**
Como corredor, quiero ver cuántos filtros tengo activos y poder eliminarlos todos de una vez, para recuperar el catálogo completo rápidamente sin tener que desmarcar cada filtro individualmente.

**Descripción:**
Mecanismo de retroalimentación y control del estado de filtrado. Informa al corredor de cuántos filtros tiene activos y le permite resetear la búsqueda con una única acción. Historia de soporte a US-002 y US-003 que mejora la usabilidad del panel de filtros.

**Criterios de aceptación:**
- [ ] Escenario principal: cuando hay filtros activos, se muestra un badge con el número total de filtros activos y un botón «Limpiar filtros»; al pulsarlo, todos los filtros se resetean y el catálogo muestra el listado completo
- [ ] El botón «Limpiar filtros» solo es visible cuando hay al menos un filtro activo
- [ ] Al limpiar, el badge desaparece y el contador de resultados refleja el total del catálogo
- [ ] Escenario alternativo: el corredor elimina filtros uno a uno desde el panel; el badge se decrementa en consecuencia
- [ ] Error/validación: limpiar filtros no recarga la página ni modifica la posición de scroll del corredor en el catálogo

**Datos o entidades implicadas:**
- Estado local de filtros activos en el componente `FilterPanel`

**Estimación:** S

**Prioridad:** Importante

---

## CU2 — Consulta de ficha de producto y decisión de compra

---

### US-005 — Consultar la ficha técnica de un producto

**Caso de uso asociado:** CU2 — Consulta de ficha de producto y decisión de compra

**Historia de usuario:**
Como corredor, quiero acceder a la ficha completa de un producto con sus atributos técnicos de running, para evaluar si se ajusta a mi perfil de entrenamiento antes de decidir comprarlo.

**Descripción:**
Página de detalle de producto. Principal punto de conversión del eCommerce. Expone la galería de imágenes, descripción técnica, atributos running como etiquetas de color (nivel, distancia, superficie, objetivo), lista de características técnicas, precio y señales de confianza (envío gratis, devolución, garantía).

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor accede a `/product/:id`; la página muestra imagen del producto, nombre, marca, precio, descripción técnica, atributos running como etiquetas coloreadas, lista de características y señales de confianza de compra
- [ ] Los atributos running (nivel, distancia, superficie, objetivo) se muestran como etiquetas visuales diferenciadas por color
- [ ] Si el producto está agotado (`stock === 0`), el botón «Añadir al carrito» aparece deshabilitado con el texto «Agotado»; la ficha sigue siendo navegable
- [ ] Escenario alternativo: el corredor accede a un `id` inexistente; se muestra un mensaje «Producto no encontrado» con enlace de vuelta al catálogo
- [ ] Error/validación: los metadatos de la página (`title`, `description`) incluyen el nombre y descripción del producto para permitir indexación SEO

**Datos o entidades implicadas:**
- `Product`: id, name, brand, price, image, description, features[], distance[], surface[], level[], objective[], stock

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-006 — Seleccionar talla y color del producto

**Caso de uso asociado:** CU2 — Consulta de ficha de producto y decisión de compra

**Historia de usuario:**
Como corredor, quiero seleccionar la talla y el color del producto que quiero comprar, para asegurarme de que la variante añadida al carrito es la correcta.

**Descripción:**
Selectores de variante en la ficha de producto. Solo se muestran cuando el producto tiene tallas o colores disponibles. La selección de talla es obligatoria cuando el producto la requiere: sin ella no es posible añadir al carrito. El stepper de cantidad permite ajustar el número de unidades antes de añadir.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor selecciona talla y color mediante botones; la variante seleccionada queda marcada visualmente; puede añadir el producto al carrito
- [ ] Si el producto no tiene tallas disponibles, el selector de talla no se muestra; el corredor puede añadir al carrito directamente
- [ ] El stepper de cantidad permite valores entre 1 y el stock disponible del producto
- [ ] Escenario alternativo: el corredor pulsa «Añadir al carrito» sin haber seleccionado talla en un producto que la requiere; se muestra un aviso «Por favor, selecciona una talla» y no se añade al carrito
- [ ] Error/validación: la cantidad no puede superar el stock disponible ni ser inferior a 1; el stepper bloquea los límites

**Datos o entidades implicadas:**
- `Product`: sizes[], colors[], stock
- `CartItem`: size, color, quantity

**Estimación:** S

**Prioridad:** Imprescindible para el MVP

---

### US-007 — Añadir un producto al carrito

**Caso de uso asociado:** CU2 — Consulta de ficha de producto y decisión de compra

**Historia de usuario:**
Como corredor, quiero añadir un producto al carrito desde su ficha, para reservarlo y poder continuar comprando o proceder al pago cuando esté listo.

**Descripción:**
Acción principal de la ficha de producto. Desencadena la actualización del badge del carrito en el header y muestra un toast de confirmación. Si el mismo producto con idéntica talla y color ya existe en el carrito, incrementa su cantidad en lugar de crear una entrada duplicada. El corredor no es redirigido al carrito: puede seguir navegando.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor pulsa «Añadir al carrito» con variante válida seleccionada; el producto se añade al carrito, el badge del header se actualiza con la nueva cantidad total y aparece un toast «Producto añadido al carrito»
- [ ] Si el mismo producto (misma talla y color) ya está en el carrito, la cantidad se incrementa en el número seleccionado en el stepper
- [ ] El corredor permanece en la ficha de producto tras añadir; no hay redirección automática
- [ ] Escenario alternativo: el corredor añade el mismo producto varias veces; la cantidad acumulada en el carrito no supera el stock disponible del producto
- [ ] Error/validación: si el producto está agotado, el botón «Añadir al carrito» está deshabilitado; el añadido no es posible bajo ninguna interacción

**Datos o entidades implicadas:**
- `CartItem`: productId, quantity, size, color
- `Product`: stock

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

## CU3 — Proceso de compra: carrito y checkout simulado

---

### US-008 — Revisar y modificar el carrito

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero ver todos los productos que he añadido al carrito, modificar cantidades y eliminar artículos, para revisar mi selección final y conocer el coste total antes de proceder al pago.

**Descripción:**
Vista de carrito en `/cart`. Muestra el listado de artículos con imagen, nombre, variante seleccionada (talla, color), precio unitario y stepper de cantidad. El panel lateral expone el subtotal, coste de envío (gratuito a partir de 50€ con incentivo visual) y total. El carrito persiste durante la sesión del navegador.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor accede a `/cart`; ve todos los artículos añadidos con sus variantes; puede modificar cantidades y eliminar artículos; el subtotal y total se recalculan en tiempo real
- [ ] Si el subtotal es ≥ 50€, el envío se muestra como «Gratis»; si no, se muestra el coste (4,99€) con el mensaje incentivador «¡Añade X€ más para envío gratis!»
- [ ] Al eliminar todos los artículos, se muestra el estado vacío con CTA «Ver catálogo»
- [ ] El botón «Tramitar pedido» está deshabilitado cuando el carrito está vacío
- [ ] Escenario alternativo: el corredor regresa al catálogo sin vaciar el carrito; al volver a `/cart`, los artículos siguen presentes (persistencia de sesión)
- [ ] Error/validación: desde un carrito vacío no es posible iniciar el checkout; el sistema redirige al catálogo

**Datos o entidades implicadas:**
- `CartItem`: product, quantity, size, color
- `Product`: price, stock

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-009 — Introducir datos de envío

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero introducir mi dirección de envío en el primer paso del checkout, para que mi pedido llegue a la dirección correcta sin necesitar crear una cuenta.

**Descripción:**
Paso 1 del checkout de tres pasos. Recoge los datos necesarios para el envío: nombre completo, email, teléfono (opcional), dirección, ciudad, código postal y país. No se requiere autenticación: el corredor compra de forma completamente anónima. Un indicador de progreso muestra el avance dentro del flujo de checkout.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor rellena todos los campos obligatorios y pulsa «Continuar al pago»; el sistema avanza al paso 2 y el indicador de progreso se actualiza
- [ ] Los campos obligatorios son: nombre completo, email, dirección, ciudad y código postal; el teléfono es opcional
- [ ] El resumen del pedido (artículos, subtotal y total) es visible en el lateral durante todo el proceso de checkout
- [ ] Escenario alternativo: el corredor deja campos obligatorios vacíos y pulsa «Continuar»; los campos inválidos se marcan en rojo con mensajes descriptivos por campo; el sistema no avanza al paso 2
- [ ] Error/validación: si el corredor accede a `/checkout` con el carrito vacío, es redirigido automáticamente a `/cart`

**Datos o entidades implicadas:**
- `Order`: shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, shippingPostalCode, shippingCountry

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-010 — Introducir los datos de pago simulado

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero introducir los datos de pago en el segundo paso del checkout, para completar formalmente la compra aunque el procesamiento sea simulado.

**Descripción:**
Paso 2 del checkout. Recoge los datos de la tarjeta de crédito: número, titular, fecha de vencimiento y CVV. La tarjeta es el único método de pago del MVP; no hay selector de método. El pago no se procesa con ninguna pasarela real. El corredor puede volver al paso anterior sin perder los datos de envío. El resumen del pedido permanece visible en el lateral.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor rellena los datos de la tarjeta y pulsa «Confirmar pedido»; el sistema avanza al paso de revisión y confirmación
- [ ] El indicador de progreso muestra el paso 2 activo
- [ ] El botón «Volver» regresa al paso 1 con los datos de envío ya introducidos intactos
- [ ] El resumen del pedido (productos, subtotal y total) permanece visible en el lateral
- [ ] Escenario alternativo: el corredor deja campos de la tarjeta vacíos y pulsa «Confirmar»; aparece un aviso de validación; no se avanza ni se crea ningún pedido
- [ ] Error/validación: el sistema acepta cualquier número de tarjeta de 16 dígitos con fecha MM/AA válida y CVV de 3 dígitos; no se realiza ninguna verificación con pasarelas externas

**Datos o entidades implicadas:**
- Datos de tarjeta: solo a nivel de interfaz (no se almacenan en el MVP)

**Estimación:** M

**Prioridad:** Imprescindible para el MVP

---

### US-011 — Revisar y confirmar el pedido

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero revisar el resumen completo de mi pedido antes de confirmarlo, para verificar que los productos, la dirección de envío y el total son correctos.

**Descripción:**
Paso 3 (revisión final) del checkout. Muestra el desglose completo del pedido: artículos con variante y precio, dirección de envío introducida y total definitivo. El corredor puede volver a pasos anteriores para hacer correcciones o confirmar el pedido. Al confirmar, el sistema genera el pedido y vacía el carrito.

**Criterios de aceptación:**
- [ ] Escenario principal: la pantalla de revisión muestra todos los artículos del carrito con sus variantes, la dirección de envío confirmada y el total; el corredor pulsa «Confirmar pedido»; el sistema crea el pedido con estado `processing` y vacía el carrito
- [ ] El corredor puede navegar de vuelta al paso 2 (pago) o al paso 1 (envío) para corregir datos sin perder la información ya introducida
- [ ] Escenario alternativo: el corredor decide modificar la dirección; pulsa «Volver» hasta el paso 1, la modifica y avanza de nuevo; el resumen refleja la dirección actualizada
- [ ] Error/validación: si se produce un error al generar el pedido, se muestra un mensaje de error con opción de reintentar; el carrito no se vacía hasta que el pedido se crea con éxito

**Datos o entidades implicadas:**
- `Order`: id (ORD-timestamp), status: processing, total, items[], shippingAddress
- `CartItem`: product, quantity, size, color

**Estimación:** S

**Prioridad:** Imprescindible para el MVP

---

### US-012 — Ver la confirmación del pedido

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero ver una pantalla de confirmación clara tras completar la compra, para tener certeza de que mi pedido ha sido registrado y conocer su número de referencia.

**Descripción:**
Pantalla de éxito post-checkout. Cierre del ciclo de compra. Muestra el número de pedido generado, el email al que se enviaría la notificación y dos acciones: ver el historial de pedidos o continuar comprando. En este punto el carrito ya ha sido vaciado.

**Criterios de aceptación:**
- [ ] Escenario principal: tras confirmar el pedido, el corredor ve la pantalla de éxito con icono de confirmación, el número de pedido (ORD-XXXXXXX), el mensaje de notificación por email y los CTA «Ver mis pedidos» y «Seguir comprando»
- [ ] El badge del carrito en el header muestra 0 artículos
- [ ] «Ver mis pedidos» navega a `/orders`; «Seguir comprando» navega a `/`
- [ ] Escenario alternativo: el corredor recarga la página de confirmación; no se genera un segundo pedido; la pantalla muestra la confirmación del pedido ya creado
- [ ] Error/validación: si el corredor llega a esta pantalla sin un pedido válido recién creado, es redirigido al catálogo

**Datos o entidades implicadas:**
- `Order`: id, status

**Estimación:** S

**Prioridad:** Imprescindible para el MVP

---

### US-013 — Consultar el historial de pedidos

**Caso de uso asociado:** CU3 — Proceso de compra: carrito y checkout simulado

**Historia de usuario:**
Como corredor, quiero consultar el listado de mis pedidos con su estado actual, para hacer seguimiento de mis compras y verificar que han sido procesadas correctamente.

**Descripción:**
Vista de historial de pedidos en `/orders`. Muestra los pedidos de la sesión activa con tarjeta por pedido que incluye ID, fecha, estado con badge de color, total y listado de productos con enlace a la ficha para facilitar la recompra. En el MVP los pedidos están asociados a la sesión del navegador: sin autenticación no hay historial persistente entre sesiones.

**Criterios de aceptación:**
- [ ] Escenario principal: el corredor accede a `/orders`; ve sus pedidos de la sesión activa ordenados por fecha descendente; cada tarjeta muestra ID, fecha, estado con badge de color, total y productos con imagen, nombre y precio
- [ ] Los estados se representan con color diferenciado: `processing` (azul), `shipped` (ámbar), `delivered` (verde), `cancelled` (rojo)
- [ ] Cada producto del pedido enlaza a su ficha (`/product/:id`) para facilitar la recompra
- [ ] Escenario alternativo: el corredor no ha realizado ningún pedido en la sesión activa; se muestra el estado vacío con CTA «Explorar productos»
- [ ] Error/validación: el historial solo muestra pedidos de la sesión activa; este comportamiento es esperado en el MVP sin autenticación y debe estar documentado en la interfaz

**Datos o entidades implicadas:**
- `Order`: id, date, status, total, items[], shippingAddress
- `OrderItem`: productName, productPrice, quantity, size, color

**Estimación:** S

**Prioridad:** Importante
