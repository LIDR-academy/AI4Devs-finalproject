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
> "Necesito generar una aplicación que sirve para que sea mas sencillo el dividir los tickets de los restaurantes cuando van muchas personas (grupos) y al final es un lío para los camareros.
> - dada una entrada tanto de texto (hablado, o transcrito) como mediante foto, a un ticket, principalmente de comida haga lo siguiente:
> - Escanee el ticket
> - Reconozca los conceptos, en el caso de un ticket de restaurante, debe reconocer lo que se ha consumido, las unidades, precio unitario
> - Se mostrará una lista seleccionable para saber qué productos ha consumido cada persona..."

**Prompt 2:**
> "Quiero mantener la aplicación de manera gratuíta el mayor tiempo posible, es por ello que estas ideas pueden ser una apuesta a futuro. Ahora nos interesa tener ideas que se puedan usar de implantación como la ruleta del redondeo, quien le toca pagar la cuenta por una apuesta o la alerta de platos huérfanos"

**Prompt 3:**
> "La base / filosofía es mobile & offline first, por lo que los tickets compartidos pueden ser una opción pero no la principal"

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
> "como /product-owner  y /tech-lead Para la creación  de los diseños técnicos, hazme un listado de todos los diagramas y documentaciones necesarias que tiene que tener un proyecto, como por ejemplo PRD, C4, Stack tecnológico, etc.... genera ficheros de documentación separados. Pregúntame si no lo tienes 100% definido y claro"

**Prompt 2:**
> "de la ayuda de /product-owner y /tech-lead valorar la posibilidad de que el MVP pueda realizarse con una base de datos en el navegador para hacer las primeras pruebas y luego que sea migrable / escalable a una base de datos en la nube (firebase)"

### **2.2. Descripción de componentes principales:**
**Prompt 1:**
> "investiga por qué usar react 18 y no vamos con la version 19"

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**
**Prompt 1:**
> "cual es el coste de migración posterior de toda la arquitectura a versiones / stack más moderno"

### **2.4. Infraestructura y despliegue**
**Prompt 1:**
> "el punto 6 lo metería como registro ya que requiere infraestructura"

### **2.5. Seguridad**
### **2.6. Tests**

---

### 3. Modelo de Datos

**Prompt 1:**
> "Incluiremos que al analizar la foto subida para sacar la cuenta, podemos extraer los metadatos de la imagen (telefono, tipo de camara, geoposicionamiento, etc) al igual que iva aplicado, nombre del establecimiento, propinas, día del evento ,etc"

**Prompt 2:**
> "1) era el planteamiento que quería
> 2) si permitimos la división de platos, tenemos que tener en cuenta que luego cuadre con el total del ticket
> 3) De momento esa inforamción será privada de nuestra aplicación con el posible fin de explotar los datos analíticos"

---

### 4. Especificación de la API

**Prompt 1:**
> "/judgment-day revisa la documentación y revisa el estado. Indícame si está en lo correcto o por el contrario hay que modificar"

---

### 5. Historias de Usuario

**Prompt 1:**
> "Replantea las épicas como si fueran historias o flujos completos, prevaleciendo las funcionalidades core, que son necesarias para todos los flujos como la primera épica. Las funcionalidades que requieren registro las podemos poner despues de las de 'sin registro'"

**Prompt 2:**
> "con la ayuda de /product-owner y /tech-lead coge las historias de usuario y crea un scaffold dentro de `docs/` en el cual se pueda agrupar las historias de usuario con la documentación correspondiente y asociada que se pueda generar despues."

---

### 6. Tickets de Trabajo

**Prompt 1:**
> "generemos un backlog, separado por carpetas si es necesario con las tareas técnicas que deberemos abordar. Sé lo más detallado posible para que la skill que lo tenga que hacer no tenga ambigüedades."

**Prompt 2:**
> "las tareas deben ir con las historias de usuario en la documentación, no deben ir en la carpeta de tech-lead porque las puede interpretar otra skill"

**Prompt 3:**
> "Las tareas técnicas no deben pertenecer a las historias de usuario, deben ir en ficheros independientes dentro de las historias de usuario"

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
