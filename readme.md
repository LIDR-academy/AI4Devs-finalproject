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
JUAN CARLOS RAVE ARANGO

### **0.2. Nombre del proyecto:**
Gestión de cartera con base a un sistema de recomendacion.

### **0.3. Descripción breve del proyecto:**
Este proyecto se enfoca en desarrollar un sistema de gestión de cartera de contribuyentes para entidades públicas colombianas, específicamente municipios, que busca optimizar los esfuerzos de recaudación del impuesto predial. La solución utilizará un sistema de recomendación para clasificar a los contribuyentes en diferentes niveles de probabilidad de pago (alto, medio, bajo), permitiendo que las entidades enfoquen sus recursos de manera más eficiente en aquellos contribuyentes con mayor propensión a regularizar su situación.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

### **1.1. Objetivo:**

El objetivo principal del producto es incrementar las tasas de recaudo del impuesto predial en entidades públicas colombianas, específicamente municipios, al optimizar los esfuerzos de cobro y recaudación. Esto se logrará mediante la clasificación de los contribuyentes en diferentes niveles de probabilidad de pago, permitiendo a las entidades aplicar estrategias y acciones de cobro más efectivas y personalizadas.

### **1.2. Características y funcionalidades principales:**

1. Integración con sistemas existentes: Conexión directa a los sistemas ERP de las entidades públicas (municipios) para extraer la información de los contribuyentes y sus pagos históricos a través de APIs.
2. Clasificación de contribuyentes: Implementación de un sistema de recomendación basado en algoritmos de aprendizaje automático que analice los datos de los contribuyentes para clasificarlos en tres niveles de probabilidad de pago: alto, medio y bajo.
3. Estrategias de cobro personalizadas: Definición de estrategias y acciones de cobro específicas para cada nivel de probabilidad de pago:
- Contribuyentes con alta probabilidad: Notificaciones y recordatorios de pago amigables.
- Contribuyentes con probabilidad media: Incentivos como descuentos por pago anticipado, modelos de financiación con entidades bancarias, acuerdos de pago.
- Contribuyentes con baja probabilidad: Acciones más intensivas como visitas de funcionarios, plazos de pago flexibles, medidas legales.

4. Panel de control y analítica: Tablero de control que permita a los administradores de la entidad pública monitorear y analizar el desempeño de la recaudación, incluyendo métricas como tasas de recaudo, eficiencia de las estrategias de cobro, evolución de la cartera de contribuyentes, entre otros.
5. Automatización de procesos: Automatización de tareas repetitivas como envío de notificaciones, generación de acuerdos de pago, programación de visitas, entre otros.

### **1.3. Diseño y experiencia de usuario:**

A continuación, un videotutorial que muestra la experiencia del usuario desde la perspectiva de un administrador de la entidad pública:
[PENDIENTE POR IMPLEMENTAR]

El diseño de la aplicación seguirá un enfoque minimalista y visualmente limpio, con una interfaz intuitiva y de fácil navegación. 

Los elementos clave incluirán:
- Dashboard con métricas y visualizaciones clave
- Sección de gestión de contribuyentes con filtros y clasificación por nivel de probabilidad
- Flujos de trabajo para aplicar las estrategias de cobro personalizadas
- Notificaciones y alertas para mantener informados a los equipos de recaudo
- Informes y análisis detallados sobre el desempeño de la recaudación

El objetivo es crear una experiencia fluida y eficiente que facilite la toma de decisiones informadas por parte de los administradores de las entidades públicas.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

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

### Historia de Usuario 1: Clasificación de Contribuyentes
Como analista de recaudo de una entidad pública, quiero clasificar a los contribuyentes en diferentes niveles de probabilidad de pago, para que podamos enfocar nuestros esfuerzos de cobro de manera más eficiente.

### Criterios de Aceptación:
- El sistema debe conectarse a la base de datos del ERP de la entidad pública y extraer la información relevante de los contribuyentes, incluyendo historial de pagos.
- Debe implementar un algoritmo de aprendizaje automático para analizar los datos de los contribuyentes y clasificarlos en tres niveles de probabilidad de pago: alto, medio y bajo.
- La clasificación debe estar basada en factores como historial de pagos, monto adeudado, tiempo de mora, y cualquier otra variable relevante.
- El sistema debe asignar automáticamente a cada contribuyente su nivel de probabilidad de pago y almacenarlo en la base de datos.
- Debe existir una interfaz de administrador que permita visualizar y consultar la clasificación de los contribuyentes.

### Notas Adicionales:
- Se deberá realizar un análisis exhaustivo de los datos disponibles y validar la pertinencia de las variables a utilizar en el modelo de clasificación.
- Será necesario realizar pruebas y ajustes iterativos al algoritmo de aprendizaje automático para optimizar la precisión de la clasificación.

### Historias de Usuario Relacionadas:
- Historia de Usuario 2: Estrategias de Cobro Personalizadas
- Historia de Usuario 3: Monitoreo y Análisis de Recaudo

### Historia de Usuario 2: Estrategias de Cobro Personalizadas
Como gestor de recaudo de una entidad pública, quiero aplicar estrategias de cobro personalizadas a los contribuyentes de acuerdo a su nivel de probabilidad de pago, para que podamos incrementar las tasas de recaudo de manera más efectiva.

### Criterios de Aceptación:
- El sistema debe permitir definir y configurar las estrategias de cobro específicas para cada nivel de probabilidad de pago (alto, medio, bajo).
- Para los contribuyentes con alta probabilidad de pago, el sistema debe enviar notificaciones y recordatorios de pago de manera automática y amigable.
- Para los contribuyentes con probabilidad media de pago, el sistema debe ofrecer incentivos como descuentos por pago anticipado, modelos de financiación y acuerdos de pago.
- Para los contribuyentes con baja probabilidad de pago, el sistema debe permitir la programación de visitas de funcionarios, aplicación de medidas legales y otras acciones más intensivas.
- Debe existir una interfaz de administrador que permita monitorear y controlar la aplicación de las estrategias de cobro personalizadas.

### Notas Adicionales:
- Se deberá trabajar de cerca con el equipo de recaudo para definir y validar las estrategias de cobro más efectivas para cada nivel de probabilidad de pago.
- Será necesario considerar aspectos legales y normativas aplicables a las acciones de cobro en el sector público.

### Historias de Usuario Relacionadas:
- Historia de Usuario 1: Clasificación de Contribuyentes
- Historia de Usuario 3: Monitoreo y Análisis de Recaudo

### Historia de Usuario 3: Monitoreo y Análisis de Recaudo
Como director de recaudo de una entidad pública, quiero tener una visión general del desempeño de la recaudación y el impacto de las estrategias de cobro personalizadas, para tomar decisiones informadas que mejoren la eficiencia del proceso.

### Criterios de Aceptación:
- El sistema debe proporcionar un panel de control (dashboard) que muestre métricas e indicadores clave sobre el desempeño de la recaudación, incluyendo tasas de recaudo, eficiencia de las estrategias de cobro, evolución de la cartera de contribuyentes, entre otros.
- Debe permitir a los administradores filtrar y segmentar la información por variables como nivel de probabilidad de pago, tipo de contribuyente, zona geográfica, etc.
- Debe generar informes y análisis detallados sobre el impacto de las estrategias de cobro personalizadas, incluyendo métricas como tasa de conversión de contribuyentes, recuperación de cartera, entre otros.
- Debe permitir a los administradores exportar los datos y análisis en formatos estándar (Excel, PDF) para su posterior uso.

### Notas Adicionales:
- Se deberá trabajar en coordinación con el equipo de recaudo y analítica para identificar las métricas e indicadores más relevantes para el monitoreo y análisis del proceso.
- Será importante considerar aspectos de seguridad y permisos de acceso a la información, de acuerdo con las políticas de la entidad pública.

### Historias de Usuario Relacionadas:
- Historia de Usuario 1: Clasificación de Contribuyentes
- Historia de Usuario 2: Estrategias de Cobro Personalizadas

## 6. Tickets de Trabajo

## Ticket de Trabajo Técnico 1: Integración con ERP y Clasificación de Contribuyentes (Backend)

### ID: 001
### Título: Integración con ERP y Clasificación de Contribuyentes

### Descripción:
Desarrollar la funcionalidad de conexión al ERP de la entidad pública para extraer la información de los contribuyentes, e implementar el algoritmo de aprendizaje automático para clasificarlos en niveles de probabilidad de pago.

### Criterios de Aceptación:
- La integración con el ERP debe ser segura, confiable y eficiente en términos de tiempo de respuesta.
- El algoritmo de clasificación debe alcanzar una precisión superior al 80% en la asignación de niveles de probabilidad.
- La clasificación de los contribuyentes debe almacenarse en la base de datos de manera estructurada y consistente.
- Debe existir una API que permita a la capa de frontend consultar la clasificación de los contribuyentes.

### Prioridad: Alta

### Estimación de Esfuerzo: 80 horas

### Tareas Técnicas:
1. Diseñar e implementar la capa de integración con el ERP de la entidad pública.
2. Analizar los datos disponibles de los contribuyentes y seleccionar las variables relevantes para el modelo de clasificación.
3. Implementar el algoritmo de aprendizaje automático para clasificar a los contribuyentes.
4. Diseñar el modelo de datos para almacenar la clasificación de los contribuyentes.
5. Desarrollar la API para que el frontend pueda consultar la clasificación.
6. Realizar pruebas exhaustivas del proceso de clasificación y ajustar el algoritmo según sea necesario.

## Notas:
- Se deberá trabajar de cerca con el equipo de datos para asegurar la calidad y pertinencia de los datos utilizados en el modelo de clasificación.
- Será importante considerar aspectos de seguridad y privacidad en el manejo de la información de los contribuyentes.

## Ticket de Trabajo Técnico 2: Estrategias de Cobro Personalizadas (Frontend)
### ID: 002

### Título del Ticket:
Estrategias de Cobro Personalizadas

### Descripción:
Desarrollar las funcionalidades de la interfaz de usuario para definir, configurar y aplicar las estrategias de cobro personalizadas de acuerdo al nivel de probabilidad de pago de cada contribuyente.

### Criterios de Aceptación:
- Debe permitir a los administradores definir y configurar las estrategias de cobro específicas para cada nivel de probabilidad de pago.
- Debe implementar el envío automático de notificaciones y recordatorios de pago a los contribuyentes de alto nivel de probabilidad.
- Debe ofrecer, de manera automatizada, incentivos como descuentos por pago anticipado, modelos de financiación y acuerdos de pago a los contribuyentes de probabilidad media.
- Debe permitir la programación y seguimiento de visitas de funcionarios, aplicación de medidas legales y otras acciones intensivas para los contribuyentes de baja probabilidad de pago.
- Debe existir una interfaz de administrador que permita monitorear y controlar la aplicación de las estrategias de cobro personalizadas.

### Prioridad: Alta

### Estimación de Esfuerzo: 120 horas

### Tareas Técnicas:
1. Diseñar e implementar las vistas y componentes de la interfaz de usuario para la configuración de estrategias de cobro personalizadas.
2. Desarrollar las interacciones y flujos de trabajo para el envío automático de notificaciones y recordatorios de pago a contribuyentes de alto nivel de probabilidad.
3. Implementar las vistas y lógica de negocio para ofrecer incentivos como descuentos, financiación y acuerdos de pago a contribuyentes de probabilidad media.
4. Diseñar e implementar las vistas y flujos de trabajo para la programación y seguimiento de visitas y acciones legales para contribuyentes de baja probabilidad de pago.
5. Desarrollar la interfaz de administrador para el monitoreo y control de la aplicación de las estrategias de cobro.
6. Realizar pruebas exhaustivas de las funcionalidades de cobro personalizadas y hacer los ajustes necesarios.

### Notas:
- Será importante considerar aspectos legales y normativos aplicables a las estrategias de cobro en el sector público.
- Se deberá trabajar en coordinación con el equipo de recaudo para asegurar que las estrategias implementadas se ajusten a los procesos y mejores prácticas de la entidad.

## Ticket de Trabajo Técnico 3: Panel de Control y Análisis de Recaudo (Base de Datos)
### ID: 003
### Título del Ticket: Panel de Control y Análisis de Recaudo

## Descripción:
Diseñar e implementar la base de datos que soporte las funcionalidades del panel de control y análisis de recaudo.

### Criterios de Aceptación:
- El modelo de datos debe ser capaz de almacenar de manera eficiente y consistente la información sobre la clasificación de los contribuyentes, las estrategias de cobro aplicadas y los indicadores de desempeño de la recaudación.
- Debe permitir consultas y agregaciones rápidas de la información para generar los reportes y análisis requeridos por el panel de control.
- Debe implementar controles de seguridad y permisos de acceso a la información, de acuerdo con las políticas de la entidad pública.
- Debe ser escalable y flexible para acomodar el crecimiento de la información y futuras necesidades de la solución.

### Prioridad: Alta

### Estimación de Esfuerzo: 100 horas

### Tareas Técnicas:
1. Diseñar el modelo de datos que permita almacenar la clasificación de los contribuyentes, las estrategias de cobro aplicadas y los indicadores de desempeño de la recaudación.
2. Implementar las tablas, relaciones y restricciones necesarias para garantizar la integridad y consistencia de la información.
3. Desarrollar las consultas y procedimientos almacenados que permitan generar los reportes y análisis requeridos por el panel de control de manera eficiente.
4. Implementar los controles de seguridad y permisos de acceso a la información, de acuerdo con las políticas de la entidad pública.
5. Optimizar el modelo de datos y las consultas para asegurar un desempeño adecuado a medida que crezca la cantidad de información.
6. Realizar pruebas exhaustivas del modelo de datos y las funcionalidades de acceso a la información.

### Notas:
- Se deberá trabajar en coordinación con el equipo de backend para asegurar que el modelo de datos cumpla con los requisitos de la solución.
- Será importante considerar aspectos de escalabilidad y mantenibilidad del modelo de datos a largo plazo.
---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

