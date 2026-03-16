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
Luis Carlos Charris Molina

### **0.2. Nombre del proyecto:**
OrganIA

### **0.3. Descripción breve del proyecto:**
OrganIA es una plataforma avanzada que conecta proveedores de eventos con organizadores y clientes, utilizando inteligencia artificial para simplificar el proceso de planificación. No solo facilita la búsqueda de los mejores proveedores, sino que también automatiza la selección y coordinación de servicios, optimizando la creación de eventos de principio a fin. OrganIA resuelve el problema de la complejidad en la organización de eventos, reduciendo tiempos y mejorando la calidad al garantizar que los proveedores cumplan con estándares altos y que los organizadores reciban recomendaciones precisas y efectivas.

---

## 1. Descripción general del producto

### **1.1. Objetivo:**
El objetivo principal de OrganIA es transformar la organización de eventos en un proceso automatizado, eficiente y altamente personalizado para organizadores, proveedores y clientes. Cada actor involucrado se beneficia de la siguiente manera:
- **Organizadores de eventos**: Pueden encontrar y coordinar proveedores de manera automatizada, permitiendo enfocarse en la parte creativa del evento.
- **Proveedores**: Gestionan su inventario y servicios, mejorando la visibilidad y aumentando sus oportunidades de contratación.
- **Clientes**: Se benefician de eventos mejor organizados, con menos errores y que cumplen con sus expectativas.

### **1.2. Características y funcionalidades principales:**
- **Entrevista y Evaluación Automática de Proveedores**
- **Recomendación Inteligente de Proveedores**
- **Agentes Proveedores de IA**
- **Gestión de Inventario Integrada**
- **Agente Organizador Futuro**
- **Seguimiento y Coordinación Automatizada**
- **Integración de Servicios de Pago**

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---


## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
La arquitectura de OrganIA sigue un enfoque de microservicios para asegurar la escalabilidad y flexibilidad del sistema. Los componentes principales de la arquitectura son los siguientes:

- **Frontend**: Es la interfaz visual con la que interactúan organizadores, proveedores y clientes. Está diseñado para ser intuitivo y responsivo, permitiendo que los usuarios se conecten desde cualquier dispositivo.
- **Backend**: Gestiona la lógica de negocio, las integraciones con otros servicios y la coordinación de todos los procesos internos. Es el encargado de conectar los datos del frontend con la base de datos y los servicios externos.
- **Base de Datos**: Almacena toda la información relevante, desde los datos de proveedores y organizadores hasta los eventos creados y los inventarios. También incluye almacenamiento de las métricas para el análisis de IA.
- **Servicios de Inteligencia Artificial**: Componen los agentes inteligentes que se encargan de responder las preguntas de los organizadores y de interpretar los requerimientos de los eventos.
- **Servicios Externos**: Incluyen integraciones con plataformas de pago, mensajería, y APIs que faciliten la logística de los eventos (como servicios de geolocalización para encontrar la mejor ubicación).
- **API Gateway**: Actúa como puerta de entrada a los diferentes microservicios, manejando la autenticación y el balanceo de carga, así como facilitando la comunicación segura entre el frontend, backend y otros servicios.

### **2.2. Descripción de componentes principales:**
- **Frontend**: Utiliza React para proporcionar una experiencia de usuario moderna y reactiva. Su propósito es permitir la interacción de los usuarios con la plataforma de forma intuitiva y fluida, tanto para la selección de proveedores como para la visualización del estado de los eventos.
- **Backend**: Desarrollado en Node.js con NestJS, estructurado en microservicios para la lógica de negocio. Utiliza Google Cloud Run para desplegar los microservicios de manera eficiente y escalable.
- **Base de Datos**: Firestore de Firebase es la base de datos principal, aprovechando su capacidad de escalabilidad y su integración nativa con Google Cloud.
- **Servicios de Inteligencia Artificial**: Vertex AI y Gemini se utilizan para desarrollar los agentes proveedores y organizadores, los cuales ayudan a interpretar las necesidades de los usuarios y automatizar la planificación de eventos.
- **Servicios Externos**: Incluyen integración con Stripe para pagos, así como servicios de mensajería como Twilio para la comunicación con los clientes y proveedores. Además, se utilizará Google Maps API para facilitar la búsqueda de locaciones y la logística del evento.
- **API Gateway**: Desarrollado con Kong o Google API Gateway, para gestionar la autenticación, la autorización y el tráfico entre los servicios de backend, asegurando que cada petición sea manejada correctamente y de forma segura.

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
Las principales entidades del modelo de datos de OrganIA son:

- **Proveedor**: Representa a cada negocio o persona que ofrece un servicio o producto para eventos.
- **Organizador**: Representa a los usuarios que gestionan la planificación de los eventos, ya sea para clientes o de forma independiente.
- **Evento**: Representa cada evento específico que se está organizando a través de la plataforma.
- **Cliente**: Representa a la persona o entidad para la cual se organiza el evento.
- **Inventario**: Representa el conjunto de productos o servicios ofrecidos por los proveedores.
- **Solicitud de Servicio**: Representa la interacción entre los organizadores y proveedores, incluyendo detalles de qué se necesita y cuándo.

### **3.2. Descripción de entidades principales:**
- **Proveedor**:
  - **Atributos**: ID del proveedor, nombre, tipo de servicio/producto, calificación promedio, ubicación, contacto, inventario (referencia).
  - **Relaciones**: 
    - Relación uno a muchos con **Eventos**, ya que un proveedor puede participar en múltiples eventos.
    - Relación uno a uno con **Inventario**, ya que cada proveedor tiene su propio inventario de servicios/productos.
  
- **Organizador**:
  - **Atributos**: ID del organizador, nombre, experiencia, eventos organizados, contacto.
  - **Relaciones**: 
    - Relación uno a muchos con **Eventos**, ya que un organizador puede gestionar varios eventos.
    - Relación muchos a muchos con **Proveedores**, a través de las solicitudes de servicios para los eventos.
  
- **Evento**:
  - **Atributos**: ID del evento, nombre del evento, tipo de evento, fecha, ubicación, estado del evento (planificación, en progreso, completado), presupuesto.
  - **Relaciones**: 
    - Relación uno a uno con **Organizador**, ya que cada evento tiene un organizador principal.
    - Relación muchos a muchos con **Proveedores**, ya que un evento puede requerir múltiples proveedores.
    - Relación uno a uno con **Cliente**, ya que cada evento tiene un cliente que lo solicita.
  
- **Cliente**:
  - **Atributos**: ID del cliente, nombre, contacto, eventos solicitados (referencia).
  - **Relaciones**: 
    - Relación uno a muchos con **Eventos**, ya que un cliente puede solicitar varios eventos.
  
- **Inventario**:
  - **Atributos**: ID de inventario, ID del proveedor, lista de productos/servicios, cantidad disponible, precio, estado (disponible/no disponible).
  - **Relaciones**: 
    - Relación uno a uno con **Proveedor**, ya que cada proveedor tiene un inventario único.
  
- **Solicitud de Servicio**:
  - **Atributos**: ID de solicitud, ID del evento, ID del proveedor, fecha de solicitud, detalles del servicio requerido, estado de la solicitud (pendiente, aceptada, rechazada).
  - **Relaciones**: 
    - Relación muchos a uno con **Evento**, ya que un evento puede tener múltiples solicitudes de servicio.
    - Relación muchos a uno con **Proveedor**, ya que un proveedor puede recibir múltiples solicitudes para distintos eventos.

---

## 4. Especificación de la API

**4.1 Descripción de los Endpoints Principales de la API de OrganIA:**

**Endpoint: Creación de Eventos**
   - **URL**: `/api/events/create`
   - **Método**: `POST`
   - **Descripción**: Permite a los organizadores crear un nuevo evento en la plataforma, especificando detalles como nombre, tipo de evento, fecha, ubicación, presupuesto, y requerimientos especiales.
   - **Parámetros**: 
     - `name` (string): Nombre del evento.
     - `eventType` (string): Tipo de evento (e.g., boda, cumpleaños).
     - `date` (string): Fecha del evento.
     - `location` (string): Ubicación del evento.
     - `budget` (number): Presupuesto disponible.
   - **Relación**: Se relaciona con la entidad **Evento** y el **Organizador** que lo crea.

**Endpoint: Listar Proveedores Disponibles**
   - **URL**: `/api/providers/available`
   - **Método**: `GET`
   - **Descripción**: Devuelve una lista de proveedores que están disponibles según ciertos criterios especificados, como la fecha y tipo de servicio.
   - **Parámetros** (query):
     - `eventType` (string): Tipo de evento para el cual se necesita el proveedor.
     - `date` (string): Fecha en la que se necesita el servicio.
     - `location` (string): Ubicación del evento.
   - **Relación**: Consulta la entidad **Proveedor** y devuelve solo aquellos que tienen disponibilidad e inventario adecuado para los requerimientos.

**Endpoint: Realizar Solicitud de Servicio**
   - **URL**: `/api/service-requests/create`
   - **Método**: `POST`
   - **Descripción**: Permite al organizador realizar una solicitud de servicio a un proveedor específico, detallando los servicios requeridos para el evento.
   - **Parámetros**:
     - `eventId` (string): ID del evento para el cual se está solicitando el servicio.
     - `providerId` (string): ID del proveedor al cual se le está realizando la solicitud.
     - `serviceDetails` (object): Detalles del servicio requerido (e.g., tipo de servicio, cantidad).
     - `requestDate` (string): Fecha en la que se está realizando la solicitud.
   - **Relación**: Crea una nueva entidad **Solicitud de Servicio**, conectando las entidades **Evento** y **Proveedor**.

**4.2 Ejemplos de Peticiones y Respuestas:**

- **Creación de Eventos** (Ejemplo de petición):
  ```json
  {
    "name": "Boda de Carlos y Ana",
    "eventType": "Boda",
    "date": "2024-12-15",
    "location": "Bogotá, Colombia",
    "budget": 20000
  }
  ```
  **Respuesta** (Ejemplo):
  ```json
  {
    "success": true,
    "eventId": "evt_12345",
    "message": "Evento creado con éxito"
  }
  ```

- **Listar Proveedores Disponibles** (Ejemplo de petición):
  ```
  GET /api/providers/available?eventType=Boda&date=2024-12-15&location=Bogotá
  ```
  **Respuesta** (Ejemplo):
  ```json
  [
    {
      "providerId": "prov_6789",
      "name": "Floristería Rosas Blancas",
      "serviceType": "Decoración",
      "rating": 4.8
    },
    {
      "providerId": "prov_1357",
      "name": "Catering Delicioso",
      "serviceType": "Catering",
      "rating": 4.7
    }
  ]
  ```

- **Realizar Solicitud de Servicio** (Ejemplo de petición):
  ```json
  {
    "eventId": "evt_12345",
    "providerId": "prov_6789",
    "serviceDetails": {
      "serviceType": "Decoración",
      "quantity": 10,
      "requirements": "Centro de mesa con rosas blancas"
    },
    "requestDate": "2024-11-01"
  }
  ```
  **Respuesta** (Ejemplo):
  ```json
  {
    "success": true,
    "requestId": "req_2468",
    "message": "Solicitud de servicio enviada al proveedor con éxito"
  }
  ```


---

## 5. Historias de Usuario

**1. Historias de Usuario de OrganIA:**

1. **Organizador busca proveedores disponibles**:
   - **Historia**: *Como organizador*, quiero poder buscar proveedores disponibles para una fecha y ubicación específica, *de modo que* pueda planificar el evento con tiempo y asegurarme de contar con los mejores servicios.

2. **Proveedor gestiona su inventario**:
   - **Historia**: *Como proveedor*, quiero poder gestionar mi inventario de productos y servicios directamente en la plataforma, *de modo que* los organizadores siempre vean información precisa sobre mi disponibilidad y puedan realizar solicitudes sin problemas.

3. **Cliente revisa el progreso de su evento**:
   - **Historia**: *Como cliente*, quiero poder revisar el progreso de la planificación de mi evento, *de modo que* tenga claridad sobre los avances, los proveedores seleccionados, y los próximos pasos para asegurar que todo esté bajo control. 

---

## 6. Tickets de Trabajo


1. **Ticket Backend: Implementación del Endpoint de Creación de Eventos**
   - **Descripción**: Desarrollar el endpoint `/api/events/create` para permitir a los organizadores crear nuevos eventos en la plataforma.
   - **Tareas**:
     - Crear el controlador para manejar la solicitud de creación de eventos.
     - Implementar validaciones para los campos obligatorios (nombre, fecha, tipo de evento, etc.).
     - Conectar con la base de datos para almacenar los datos del evento en Firestore.
     - Probar el endpoint y asegurar que responde correctamente con los datos del evento creado.
   - **Detalles Adicionales**:
     - Utilizar NestJS y Google Cloud Run.
     - Asegurar que el endpoint tenga una respuesta clara en caso de éxito o de error (código 201 en caso de creación exitosa).

2. **Ticket Frontend: Creación del Formulario de Registro de Proveedores**
   - **Descripción**: Desarrollar la interfaz de usuario para el registro de proveedores, permitiendo que ingresen sus datos y servicios en la plataforma.
   - **Tareas**:
     - Crear el formulario de registro usando Vue.js, que incluya campos como nombre, tipo de servicio, ubicación, y datos de contacto.
     - Implementar validación en el frontend para todos los campos obligatorios.
     - Añadir lógica para enviar la información del formulario al endpoint correspondiente.
     - Crear una vista de confirmación exitosa del registro.
   - **Detalles Adicionales**:
     - La interfaz debe ser responsiva y alinearse con el diseño general de la plataforma.
     - Añadir mensajes de error adecuados para cada posible falla en el ingreso de datos.

3. **Ticket Base de Datos: Diseño y Creación del Modelo de Inventario**
   - **Descripción**: Diseñar y crear la estructura de datos para la entidad "Inventario" en Firestore, de tal manera que se puedan almacenar los servicios y productos ofrecidos por cada proveedor.
   - **Tareas**:
     - Definir los atributos necesarios del modelo de inventario (e.g., ID del proveedor, lista de productos/servicios, cantidad, precio).
     - Crear una colección en Firestore para almacenar los inventarios de cada proveedor.
     - Implementar relaciones con la entidad "Proveedor" para asegurar que cada proveedor tenga un inventario único.
     - Realizar pruebas para verificar que los datos se almacenan y se pueden consultar correctamente.
   - **Detalles Adicionales**:
     - Optimizar la estructura de los datos para minimizar el costo de lectura/escritura en Firestore.
     - Asegurarse de que el modelo sea escalable para soportar un gran número de productos por proveedor.


---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

