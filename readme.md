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

### **0.1. Tu nombre completo: JOSE FERNANDO ARIAS**

### **0.2. Nombre del proyecto: GAMY **

### **0.3. Descripción breve del proyecto: 
Gamy es una plataforma web que permite a los entusiastas de juegos de mesa descubrir, aprender y gestionar su colección personal de juegos. El proyecto combina una base de datos curada de juegos con funcionalidades de gestión personal, ofreciendo contenido diferenciado según el nivel de registro del usuario.


### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

3. Product Vision & Objectives
3.1 Vision Statement
"Ser la plataforma de referencia para que los amantes de juegos de mesa en Francia gestionen su pasión, descubran nuevos juegos y accedan a reglas claras y organizadas."

3.2 Mission Statement
"Simplificar la gestión y descubrimiento de juegos de mesa mediante una plataforma intuitiva que conecta a jugadores con contenido curado y herramientas de organización personal."

3.3 Business Objectives (6 meses)
Adopción: 50 usuarios activos mensuales
Engagement: 30% tasa de retención semanal
Satisfacción: Net Promoter Score (NPS) de 70
Contenido: Base de 500+ juegos catalogados
Validación: Feedback positivo de casas de juego locales

3.4 Long-term Objectives (12+ meses)
Modelo de patrocinio con casas de juego parisinas
Expansión a otras ciudades francesas
Sistema de monetización validado


### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

* **Mobile-first** en navegación y formularios.
* Flujos principales:

  1. **Descubrimiento** (explorar catálogo + filtros).
  2. **Gestión personal** (biblioteca y wishlist).
  3. **Solicitud de juegos** (formulario + seguimiento de estado).

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
# Historias de Usuario — Gamy (MVP)

## US-001 — Explorar catálogo como visitante

**Título de la Historia de Usuario:**
Como **visitante**,
quiero **buscar, filtrar y ver la ficha básica de un juego**,
para que **pueda descubrir juegos adecuados sin necesidad de registrarme**.

**Criterios de Aceptación:**

* Puedo **buscar por nombre** y **filtrar** por **número de jugadores**, **tiempo de juego** y **edad mínima**.
* Al abrir un juego, veo **descripción básica**, **categoría**, **rango de jugadores**, **tiempo estimado**, **edad mínima** e **imagen**.
* Se muestran **reglas básicas** y hasta **3 videos intro** (si existen) sin requerir login.
* La interfaz es **responsive** y se carga en **< 3 s** para la ficha y el listado principal.
* Si no hay resultados, el sistema muestra un **mensaje claro** y sugiere **limpiar filtros**.

**Notas Adicionales:**

* Preparar SEO básico (título/meta) para las páginas de detalle.
* Los videos deben **abrirse en una nueva pestaña** (enlace externo).

**Historias de Usuario Relacionadas:**

* **US-002** (Biblioteca/Wishlist — requiere registro).
* **US-003** (Curación de catálogo y reglas por el administrador).

---
**Historia de Usuario 2**

## US-002 — Gestionar mi biblioteca y wishlist

**Título de la Historia de Usuario:**
Como **usuario registrado**,
quiero **agregar/quitar juegos a mi biblioteca y wishlist**,
para que **pueda organizar mi colección y planear futuras compras**.

**Criterios de Aceptación:**

* Desde la ficha de un juego puedo **Agregar a Biblioteca** (estado: *owned*) o **Agregar a Wishlist** (*wishlist*), y **quitar** con un clic.
* El sistema **evita duplicados**: un juego no puede estar dos veces en el mismo estado; mover entre *owned* ↔ *wishlist* es posible con confirmación.
* Puedo **ver mi lista** paginada con **contador** total y **filtros** (owned/wishlist).
* La acción muestra **feedback inmediato** (toast/alerta) y se **persiste** en la base de datos.
* Cumple con **seguridad CSRF** y **requiere sesión**; si no estoy logueado, se me redirige a **login** y luego a la página previa.

**Notas Adicionales:**

* Registrar en la BD **fecha de agregado** para ordenar por **recientes**.
* Preparar endpoint para **recomendaciones futuras** (no obligatorio en MVP).

**Historias de Usuario Relacionadas:**

* **US-001** (Explorar catálogo para descubrir juegos).
* **US-003** (Administrador mantiene el catálogo actualizado).

---
**Historia de Usuario 3**

## US-003 — Curar catálogo, reglas y solicitudes

**Título de la Historia de Usuario:**
Como **administrador/curador**,
quiero **crear/editar juegos, gestionar versiones de reglas y variantes, y aprobar solicitudes de nuevos juegos**,
para que **el catálogo se mantenga actualizado y de alta calidad**.

**Criterios de Aceptación:**

* Puedo **crear/editar** juegos (nombre, descripciones, atributos clave, imagen, categoría) desde **Django Admin**.
* Puedo crear **RuleSets** por **idioma** y **versión** (p. ej. *es/en/fr*, *v2.0*), y asociar **reglas en markdown**.
* Puedo crear **RuleVariants** (oficial o comunidad) con **tags** y **ajustes** (p. ej. deltas de jugadores/tiempo).
* Puedo **asociar videos** de entrenamiento (YouTube/Vimeo/otro) a un **juego** y opcionalmente a un **RuleSet**.
* Puedo **aprobar/rechazar** **solicitudes de nuevos juegos** con **historial** (quién y cuándo lo cambió).
* Las operaciones de admin requieren **permisos**; usuarios sin rol admin reciben **403**.

**Notas Adicionales:**

* Mantener **auditoría básica** (created\_at/updated\_at y usuario que modifica).
* Validar **enlaces de video** y **idiomas** contra lista permitida (ISO-639-1).

**Historias de Usuario Relacionadas:**

* **US-001** (Contenido visible para visitantes: reglas básicas/videos).
* **US-002** (Usuarios registrados gestionan su biblioteca y wishlist).


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

