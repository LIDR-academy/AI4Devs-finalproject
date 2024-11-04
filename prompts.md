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
Actúa como un *gerente de producto experto* en la definición de productos para entidades publicas colombianas, para lo cual requiero crear un Documento de requisitos de producto con base a la siguiente idea de negocio: "Gestión de cartera con base a un sistema de recomendación para priorizar a los contribuyentes mas propensos a regularizar su situación, la cual es una manera de optimizar los esfuerzos de recaudación, permitiendo que tanto entidades publicas como privadas enfoquen sus recursos de manera mas eficiente de acuerdo a la clasificación del contribuyente en niveles de probabilidad las cuales podrían ser (alto, medio, bajo).

Las categorías son:
- Contribuyentes con alta probabilidad de pago: Estos son los que pueden ser mas fácilmente incentivados para pagar con una simple notificación.
- Contribuyentes con probabilidad media: A este grupo se le podrían ofrecer incentivados adicionales (descuentos por pago anticipado, modelos de financiación a través de bancos o acuerdos de pago directamente con la entidad)
- Contribuyentes con baja probabilidad: En este caso seria necesario implementar estrategias mas intensivas, como visitas con funcionarios, plazo de pago mas flexibles, medidas legales.

En la media que se reduce la probabilidad se pasaria de un tono mas familiar y amigable a un tono mas persuasivo y legal.
La idea principal es maximizar la eficiencia y el retorno de la inversión (ROI) de las acciones de cobro al centrar los esfuerzos en aquellos contribuyentes mas propensos a regularizar su situación."

Actualmente las entidades públicas colombianas tiene bajas tasas de recuado para impuestos como el **PREDIAL**.

La respuesta debe ser dada en el siguiente formato:
### 0. Descripción breve del proyecto:**

> Descripcion del proyecto.

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

No generes ningún tipo de respuesta hasta tanto no te lo solicite de manera expresa, realiza todas las preguntas que consideres necesarias para alcanzar un mayor entendimiento del producto a desarrollar.

**Prompt 2:**
1. Entidades territoriales como Municipios o Alcaldias, las cuales cobrar tributos sobre los predios como casas, apartamentos, locales, fincas y terrenos.
2. La tasa de recaudo puede estar entre el 40% y el 78%, debido a factores como serios problemas de gestión y administración tributaria, evasión, corrupción y violencia. 
3. La corrupción, motivo por el cual el Colombiano promedio no quiere pagar impuestos, pues tiene un fuerte sentimiento que todo lo que pasa se lo roban personas del estado.
4. Nuestro proyecto iniciara con un Municipio como la Estrella, Antioquia el cual cuenta con 37.194 predios, o Bugalagrande, Valle del Cauca con 9.590 predios.
5. Cuento con informacion detallada como valores del impuesto, historico de pagos, informacion del contribuyente.
6. No existe ninguna restricción.
7. Si, tengo acceso directamente al ERP de varias entidades, con lo que puedo obtener la información directamente desde la base de datos.
Adicionalmente, la idea no es construir un ERP, la comunicacion con estos para extraer los datos se hara a traves de API.
8. El principal beneficio es incrementar las tasas de recaudo del impuesto predial y reducir la cantidad de contribuyentes con pagos pendientes ante el Municipio.

**Prompt 3:**
Ahora requiero generar 3 "historias de usuario" para un producto mínimo viable, 
el cual se debe enfocar en mostrar el valor de la solución en el proceso de clasificacion de contribuyentes y las estrategias de cobro personalizado de acuerdo a la probabilidad de pago.
El resultado debe ser en formato markdown de acuerdo a la siguiente especificación:

Cada "historia de usuario" debe contener:
- Título de la Historia de Usuario: 
- Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario].

- Criterios de Aceptación:
[Detalle específico de funcionalidad]
[Detalle específico de funcionalidad]
[Detalle específico de funcionalidad]

- Notas Adicionales:
[Cualquier consideración adicional]

- Historias de Usuario Relacionadas:
[Relaciones con otras historias de usuario]

Ahora documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend y uno de base de datos para la historia de usuario: 
Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta buenas prácticas al respecto.
 
Cada "Ticket de Trabajo Técnico" debe incluir:
  - ID:
  - Título:
  - Descripción:
  - Criterios de aceptación:
  - Prioridad:
  - Estimación de esfuerzo (en horas):
  - Tareas Técnicas:
  - Notas

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

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

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

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
