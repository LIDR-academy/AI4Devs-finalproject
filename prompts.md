He estado usando Cursor durante toda la conversación, para así tener acceso a gpt-4o en modo ilimitado. Puntualmente, he utilizado la versión gratuita de ChatGPT.


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
Actua como un experto analista de producto, en el area de software para gestión de inversiones financieras.

Quiero crear un gestor de inversiones con el que los usuarios puedan seguir inversiones dentro de un portfolio, siendo los tipos de activos (lista no cerrada): acciones, fondos de inversión, depósitos a plazo fijo, cuentas de ahorro.

Dime cuál serían las 10 características para que este gestor estuviera posicionado como un productor innovador y fácil de utilizar


**Prompt 2:**
Hay algún producto opensource que pueda usar como base para hacer realidad esta idea que tengo?

--> Aquí he obtenido conocimiento de varios proyectos, el que me ha parecido más interesante es Ghostfolio, que es una aplicación opensource para llevar el seguimiento de tu patrimonio personal. Me ha parecido muy interesante ya que incluye las funcionalidades que busco tener en mi proyecto, así como una interfaz bastante atractiva.

**Prompt 3:**
EasyPortfolio (ndlr - nombre provisional) es una aplicación para llevar el seguimiento de tu patrimonio personal de manera sencilla y eficiente.
Intenta ser capaz de manejar distintos tipos de patrimonio, desde acciones, fondos de inversión, criptomonedas, depósitos a plazo fijo, cuentas de ahorro.

(ndlr - Pegado contenido de la seccion "1.2. Características y funcionalidades principales" del readme.md)

Generame tres imágenes, una para cada pantalla que se acaba de describir

**Prompt 4:**
Puedes generarme una pantalla que sea para desktop y no para terminales móviles?

**Prompt 5:**
Viendo como describo la aplicación, proponme 5 nombres para mi aplicación. Tienen que reflejar cierta simplicidad en el uso pero una buena riqueza de funcionalidades



---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Teniendo en cuenta lo explicado en @readme.md hasta la línea 76 (puedes ignorar el resto), quiero que me propongas una arquitectura técnica para esta aplicación. Esta tiene que ser simple, en la medida de lo posible, para así poder ir rápidamente en "time-to-market", pero escalable.

Piensa en que tipo o tipos de base de datos se va a necesitar, sobre todo si es necesario tener algún tipo de NoSQL DB para la parte de almacenar el histórico de precios.

Generame el diagrama de arquitectura de tipo C4Component, en formato Mermaid

**Prompt 2:**
Gracias, podrías tener en cuenta que quiero que el backend sea en Java, Springboot a ser posible. Regenera de nuevo teniendo en cuenta esto

**Prompt 3:**
Añade al diseño de la arquitectura las llamadas al servicio de precios (ie YAHOO) así como la referencia a este servicio externo. Estas llamadas se realizarán desde el backend

**Prompt 4:**
Puedes hacer que el tipo de cajita "external price service" sea diferente a "component"? 

**Prompt 5:**
cuales son los distintos tipos de componentes en un diagrama C4?

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Hazme una descripción de los componentes técnicos más importantes, explicando las tecnología utilizada y las ventajas que estos aportan

**Prompt 2:**
modificame el punto 2 para especificar que utilizaremos java 21. Asimismo, enumera las ventajas que nuestra aplicación se puede beneficiar de usar esta versión de java
También si hay algún incoveniente en que esta versión sea usada, avísame.

**Prompt 3:**
(ndlr - nueva sesión con ChatGPT) Quiero hacer uso de una API que me dé valorizaciones de activos en mercados financieros (acciones, etfs, fondos de inversión). Qué opciones tengo a disposición, que sean gratuitas? Voy a hacer un uso moderado de ellas en una aplicación de portfolio management, pero me gustaría saber cuál de las opciones tienen límites más altos

**Prompt 4:**
Cómo de fácil es integrarse Yahoo Finance para mi caso de uso? Quiero ir fácil, no descargar muchos campos, en un primer tiempo, y quiero integrarlo en un backend en Java+Springboot, con lo que normalmente voy a descartar la opción de usar yfinance

--> Decido ir con YahooFinance, a través de la librería "YahooFinanceAPI". No descarto en el futuro ir también con polygon.io y así tener dos proveedores de datos de mercado.



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
