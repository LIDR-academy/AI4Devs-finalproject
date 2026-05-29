## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

### **1.1. Objetivo:**

**RunMarket** es un ecommerce especializado en productos deportivos para running. Permite a corredores principiantes, populares y avanzados encontrar zapatillas, ropa técnica y accesorios adaptados a su perfil mediante filtros propios de la disciplina: distancia objetivo, tipo de superficie, nivel del corredor y objetivo de entrenamiento.

El problema que resuelve es de orientación y relevancia: los ecommerce generalistas no ofrecen filtros específicos de running, lo que obliga al corredor a navegar catálogos irrelevantes sin criterios técnicos. RunMarket reduce esa fricción colocando al corredor y su perfil en el centro del catálogo.

**Propuesta de valor:** el único ecommerce donde el catálogo se adapta al corredor, no al revés.

> Documentación completa de producto (Lean Canvas, casos de uso, decisiones de diseño): [docs/PRD.md](docs/PRD.md)

### **1.2. Características y funcionalidades principales:**

El MVP cubre el ciclo completo de descubrimiento y compra:

1. **Catálogo de productos** — zapatillas, ropa técnica y accesorios para running
2. **Búsqueda y filtrado multidimensional** — por categoría, distancia, superficie, nivel y objetivo de entrenamiento; filtros combinables con actualización dinámica
3. **Ficha de producto** — descripción técnica, atributos running como etiquetas de color, selector de talla/color, stepper de cantidad y trust signals (envío, devolución, garantía)
4. **Gestión de carrito** — añadir, modificar cantidad y eliminar; resumen con subtotal, envío y total; persiste en sesión
5. **Checkout simulado** — flujo en 2 pasos (datos de envío + método de pago); sin procesamiento real de pagos ni autenticación requerida
6. **Confirmación de pedido** — número de pedido generado y resumen de compra
7. **Gestión básica de pedidos** — historial con estados: pendiente, procesando, enviado, entregado

> Casos de uso detallados con diagramas de flujo: [docs/PRD.md#casos-de-uso-principales](docs/PRD.md)

### **1.3. Diseño y experiencia de usuario:**

Prototipo interactivo: [Ecommerce para productos deportivos — Figma Make](https://www.figma.com/make/0wtedXb5138odnAOgHlMiA/Ecommerce-para-productos-deportivos)

Las capturas de pantalla se encuentran en [`docs/prototypes/`](docs/prototypes/).

---

**Home — Catálogo con filtros** · *Caso de uso 1*

![Home — Catálogo con filtros](docs/prototypes/01-home-catalog.png)

Catálogo con panel lateral de filtros running. Punto de entrada y diferencial principal del producto.

---

**Ficha de producto** · *Caso de uso 2*

![Ficha de producto](docs/prototypes/02-pdp.png)

Detalle técnico del producto con atributos running, selector de talla/color y botón de añadir al carrito.

---

**Carrito** · *Caso de uso 3*

![Carrito de compra](docs/prototypes/03-cart.png)

Resumen de selección con subtotal, envío y acceso al checkout.

---

**Checkout — Datos de envío** · *Caso de uso 3*

![Checkout — Datos de envío](docs/prototypes/04-checkout-send-data.png)

Formulario de envío, paso 1 del proceso de compra simulado.

---

**Checkout — Método de pago** · *Caso de uso 3*

![Checkout — Método de pago](docs/prototypes/05-checkout-payment.png)

Formulario de tarjeta simulada, paso 2 del proceso de compra.

---

**Confirmación de pedido** · *Caso de uso 3*

![Confirmación de pedido](docs/prototypes/06-order-confirmation.png)

Pantalla de éxito con número de pedido generado.

---

**Mis pedidos**

![Mis pedidos](docs/prototypes/07-my-orders.png)

Historial de pedidos con estado y detalle de productos.

### **1.4. Instrucciones de instalación:**

> Pendiente de documentar.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

