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
Este proyecto se enfoca en desarrollar un sistema de gestión de cartera para entidades públicas colombianas, específicamente municipios, que busca optimizar los esfuerzos de recaudación del impuesto predial. 
La solución utilizará un sistema de recomendación para clasificar a los contribuyentes en diferentes niveles de probabilidad de pago (alto, medio, bajo), permitiendo que las entidades enfoquen sus recursos de manera más eficiente en aquellos contribuyentes con mayor propensión a regularizar su situación.

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

A continuación, una pequeña guia que muestra la experiencia del usuario desde la perspectiva de un administrador de la entidad pública:
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
### Arquitectura de Microservicios
![Arquitectura](/images/arquitectura_base.png)

### **2.2. Descripción de componentes principales:**

**1.Frontend**
   - React + TypeScript
   - Material-UI (componentes pre-construidos)
   - Axios para llamadas HTTP
   - Context API (gestión de estado simple)

**2.API Gateway**
   - nginx como proxy reverso
   - Enrutamiento a microservicios
   - Autenticación centralizada

**3.Microservicios Esenciales**
   - Servicio de Clasificación (Python/FastAPI)
   - Servicio de Gestión de Cobro (Node.js/Express)
   - Servicio de Notificaciones (Node.js/Express)

**4.Base de Datos**
   - PostgreSQL (una instancia con esquemas separados)
   - Redis para caché y sesiones

**5.Mensajería**
   - RabbitMQ para comunicación asíncrona

Esta arquitectura proporciona un balance entre la simplicidad necesaria para un MVP y la flexibilidad requerida para el crecimiento futuro, manteniendo los beneficios clave de los microservicios sin excesiva complejidad inicial.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

## Descripción de Alto Nivel del Proyecto

### Estructura del Proyecto

```
project/
├── api-gateway/               # Puerta de enlace API y enrutamiento
│   ├── src/
│   │   ├── config/           # Configuraciones
│   │   ├── middleware/       # Middlewares compartidos
│   │   └── routes/           # Definición de rutas
│
├── services/                  # Microservicios
│   ├── classification/        # Servicio de Clasificación
│   │   ├── src/
│   │   │   ├── config/       # Configuraciones
│   │   │   ├── controllers/  # Controladores
│   │   │   ├── services/     # Lógica de negocio
│   │   │   ├── models/       # Modelos de datos
│   │   │   └── utils/        # Utilidades
│   │
│   ├── collection/           # Servicio de Gestión de Cobro
│   │   ├── src/
│   │   │   ├── config/      
│   │   │   ├── controllers/ 
│   │   │   ├── services/    
│   │   │   ├── models/      
│   │   │   └── utils/       
│   │
│   └── notification/         # Servicio de Notificaciones
│       ├── src/
│       │   ├── config/      
│       │   ├── controllers/ 
│       │   ├── services/    
│       │   ├── templates/    # Plantillas de notificaciones
│       │   └── utils/       
│
├── frontend/                 # Aplicación Frontend
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios y API clients
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Contextos de React
│   │   ├── utils/           # Utilidades
│   │   └── assets/          # Recursos estáticos
│
└── shared/                   # Recursos compartidos
    ├── types/               # Definiciones de tipos
    └── utils/               # Utilidades comunes
```

## Componentes Principales

### 1. API Gateway
- Punto de entrada único para el frontend
- Enrutamiento a microservicios
- Autenticación centralizada
- Control de acceso y rate limiting

### 2. Microservicios

#### Servicio de Clasificación
- Análisis de contribuyentes
- Cálculo de probabilidades de pago
- Integración con ERP
- Clasificación automática

#### Servicio de Gestión de Cobro
- Gestión de estrategias de cobro
- Seguimiento de acciones
- Planes de pago
- Reportes de gestión

#### Servicio de Notificaciones
- Envío de notificaciones
- Gestión de plantillas
- Seguimiento de comunicaciones
- Programación de recordatorios

### 3. Frontend
- Interfaz de usuario responsive
- Dashboards y reportes
- Gestión de usuarios
- Configuración del sistema

### 4. Recursos Compartidos
- Tipos comunes
- Utilidades compartidas
- Configuraciones base

### Tecnologías Principales

- **Frontend**: React + TypeScript
- **Backend**: Node.js/Express
- **Base de Datos**: PostgreSQL
- **Comunicación**: REST APIs


### **2.4. Infraestructura y despliegue**

## Infraestructura y Despliegue del Sistema

### Descripción de la Infraestructura

La infraestructura del sistema está basada en servicios cloud con los siguientes componentes:

**1. Frontend**
   - Cliente web React alojado en servicios de hosting estático
   - CDN para recursos estáticos
   - SSL/TLS para conexiones seguras

**2. API Gateway**
   - nginx como reverse proxy
   - Balanceador de carga
   - Manejo de SSL/TLS
   - Rate limiting y caching

**3. Microservicios**
   - Contenedores Docker
   - Orquestación con Docker Compose (MVP)
   - Escalamiento horizontal por servicio

**4. Base de Datos**
   - PostgreSQL en cluster dedicado
   - Backups automatizados
   - Replicación para alta disponibilidad

**5. Caché**
   - Redis para caché distribuido
   - Sesiones y datos temporales
   - Mejora de rendimiento

## Diagramas

### Diagrama de Contenedores
![C4 contenedores](/images/C4Container.png)

### Diagrama de Despliegue
![C4 Despliegue](/images/C4Deployment.png)

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**
## Diagrama Entidad Relación (3FN)
![Diagrama entidad relacion](/images/ERD.png)

### **3.2. Descripción de entidades principales:**
## Modelo Entidad Relación y Diccionario de Datos

### Contribuyente

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| documento | VARCHAR(20) | Número de documento | UNIQUE, NOT NULL |
| tipo_documento | VARCHAR(10) | Tipo de documento (CC, NIT, etc.) | NOT NULL |
| nombre | VARCHAR(100) | Nombre completo | NOT NULL |
| direccion | VARCHAR(200) | Dirección física | NOT NULL |
| telefono | VARCHAR(20) | Número de contacto | |
| email | VARCHAR(100) | Correo electrónico | |
| fecha_registro | TIMESTAMP | Fecha de registro en el sistema | NOT NULL, DEFAULT NOW() |
| activo | BOOLEAN | Estado del contribuyente | NOT NULL, DEFAULT TRUE |

### Deuda

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| contribuyente_id | INTEGER | ID del contribuyente | FK (contribuyente.id), NOT NULL |
| monto | DECIMAL(15,2) | Monto de la deuda | NOT NULL |
| fecha_vencimiento | DATE | Fecha de vencimiento | NOT NULL |
| estado | VARCHAR(20) | Estado de la deuda | NOT NULL |
| concepto | VARCHAR(200) | Concepto de la deuda | NOT NULL |
| fecha_registro | TIMESTAMP | Fecha de registro | NOT NULL, DEFAULT NOW() |

### Pago

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| contribuyente_id | INTEGER | ID del contribuyente | FK (contribuyente.id), NOT NULL |
| deuda_id | INTEGER | ID de la deuda | FK (deuda.id), NOT NULL |
| monto | DECIMAL(15,2) | Monto pagado | NOT NULL |
| fecha_pago | DATE | Fecha del pago | NOT NULL |
| medio_pago | VARCHAR(50) | Método de pago | NOT NULL |
| referencia | VARCHAR(50) | Referencia del pago | UNIQUE |
| estado | VARCHAR(20) | Estado del pago | NOT NULL |

### Clasificación

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| contribuyente_id | INTEGER | ID del contribuyente | FK (contribuyente.id), NOT NULL |
| nivel_probabilidad | VARCHAR(20) | Nivel de probabilidad de pago | NOT NULL |
| score | DECIMAL(5,2) | Puntuación calculada | NOT NULL |
| fecha_clasificacion | TIMESTAMP | Fecha de clasificación | NOT NULL |
| estado | VARCHAR(20) | Estado de la clasificación | NOT NULL |

### Estrategia_Cobro

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| clasificacion_id | INTEGER | ID de la clasificación | FK (clasificacion.id), NOT NULL |
| nombre | VARCHAR(100) | Nombre de la estrategia | NOT NULL |
| descripcion | VARCHAR(500) | Descripción detallada | |
| activa | BOOLEAN | Estado de la estrategia | NOT NULL, DEFAULT TRUE |
| fecha_creacion | TIMESTAMP | Fecha de creación | NOT NULL, DEFAULT NOW() |

### Accion_Cobro

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| estrategia_id | INTEGER | ID de la estrategia | FK (estrategia_cobro.id), NOT NULL |
| tipo_accion | VARCHAR(50) | Tipo de acción a realizar | NOT NULL |
| descripcion | VARCHAR(500) | Descripción de la acción | NOT NULL |
| orden | INTEGER | Orden de ejecución | NOT NULL |
| activa | BOOLEAN | Estado de la acción | NOT NULL, DEFAULT TRUE |

### Notificación

| Atributo | Tipo | Descripción | Restricciones |
|----------|------|-------------|---------------|
| id | SERIAL | Identificador único | PK, NOT NULL |
| accion_cobro_id | INTEGER | ID de la acción de cobro | FK (accion_cobro.id), NOT NULL |
| contribuyente_id | INTEGER | ID del contribuyente | FK (contribuyente.id), NOT NULL |
| tipo | VARCHAR(50) | Tipo de notificación | NOT NULL |
| contenido | VARCHAR(1000) | Contenido de la notificación | NOT NULL |
| estado | VARCHAR(20) | Estado de la notificación | NOT NULL |
| fecha_envio | TIMESTAMP | Fecha de envío | NOT NULL |
| fecha_lectura | TIMESTAMP | Fecha de lectura | |

## Relaciones

| Entidad Origen | Tipo | Entidad Destino | Descripción |
|----------------|------|-----------------|-------------|
| Contribuyente | 1:N | Deuda | Un contribuyente puede tener múltiples deudas |
| Contribuyente | 1:N | Pago | Un contribuyente puede realizar múltiples pagos |
| Contribuyente | 1:N | Clasificación | Un contribuyente puede tener múltiples clasificaciones |
| Clasificación | 1:N | Estrategia_Cobro | Una clasificación puede tener múltiples estrategias |
| Estrategia_Cobro | 1:N | Accion_Cobro | Una estrategia puede tener múltiples acciones |
| Accion_Cobro | 1:N | Notificación | Una acción puede generar múltiples notificaciones |

## Índices Recomendados

| Tabla | Columna(s) | Tipo | Descripción |
|-------|------------|------|-------------|
| contribuyente | documento, tipo_documento | UNIQUE | Búsqueda rápida de contribuyentes |
| deuda | contribuyente_id, fecha_vencimiento | INDEX | Consulta de deudas por contribuyente |
| pago | contribuyente_id, fecha_pago | INDEX | Historial de pagos |
| clasificacion | contribuyente_id, fecha_clasificacion | INDEX | Histórico de clasificaciones |
| notificacion | contribuyente_id, fecha_envio | INDEX | Historial de notificaciones |

---

## 4. Especificación de la API

### 4.1. Servicios de Clasificación

Los servicios de clasificación permiten obtener la clasificación de los contribuyentes en función de su historial de pagos y otros factores relevantes. Esto ayuda a las entidades a identificar a los contribuyentes con mayor probabilidad de pago y a aplicar estrategias de cobro personalizadas.

#### Endpoint: Obtener clasificación de un contribuyente
- **Método:** `GET`
- **Ruta:** `/api/collection/contributor/{contribuyenteId}/classification`
- **Parámetros:**
  - `contribuyenteId`: ID del contribuyente (número entero).
- **Respuesta:**
  - **200 OK:** Devuelve la clasificación del contribuyente.
  - **404 Not Found:** Si no se encuentra la clasificación para el contribuyente.
  - **500 Internal Server Error:** En caso de error en el servidor.

#### Ejemplo de uso
```bash
GET http://localhost:3000/api/collection/contributor/1/classification
```

#### Ejemplo de respuesta
```json
{
  "contribuyente_id": 1,
  "contribuyente_nombre": "Juan Pérez",
  "numero_identificacion": "123456789",
  "clasificacion_id": 1,
  "nivel_probabilidad": "ALTO",
  "clasificacion_descripcion": "Clasificación inicial",
  "fecha_clasificacion": "2024-01-01T00:00:00Z"
}
```

### 4.2. Servicios de Gestión de Cobro

Los servicios de gestión de cobro permiten obtener las estrategias de cobro asociadas a un contribuyente. Esto facilita la aplicación de acciones de cobro personalizadas basadas en la clasificación del contribuyente.

#### Endpoint: Obtener estrategias de cobro de un contribuyente
- **Método:** `GET`
- **Ruta:** `/api/collection/contributor/{contribuyenteId}/strategies`
- **Parámetros:**
  - `contribuyenteId`: ID del contribuyente (número entero).
- **Respuesta:**
  - **200 OK:** Devuelve una lista de estrategias de cobro asociadas al contribuyente.
  - **404 Not Found:** Si no se encuentran estrategias para el contribuyente.
  - **500 Internal Server Error:** En caso de error en el servidor.

#### Ejemplo de uso
```bash
GET http://localhost:3000/api/collection/contributor/1/strategies
```

#### Ejemplo de respuesta
```json
[
  {
    "contribuyente_id": 1,
    "contribuyente_nombre": "Juan Pérez",
    "nivel_probabilidad": "ALTO",
    "estrategia_id": 1,
    "estrategia_nombre": "Estrategia Premium",
    "estrategia_descripcion": "Estrategia para contribuyentes de alto valor"
  },
  {
    "contribuyente_id": 1,
    "contribuyente_nombre": "Juan Pérez",
    "nivel_probabilidad": "ALTO",
    "estrategia_id": 2,
    "estrategia_nombre": "Recordatorio de Pago",
    "estrategia_descripcion": "Notificación amigable para recordar el pago"
  }
]
```

### 4.3. Servicios de Monitorización

Además de los servicios de clasificación y gestión de cobro, se han implementado servicios de monitorización que permiten obtener métricas sobre el desempeño de la recaudación, la efectividad de las estrategias de cobro y las tendencias de recaudación.

#### Endpoint: Obtener métricas de recaudación
- **Método:** `GET`
- **Ruta:** `/api/collection/monitoring/metrics`
- **Parámetros:**
  - `fechaInicio`: Fecha inicial del período (formato: YYYY-MM-DD).
  - `fechaFin`: Fecha final del período (formato: YYYY-MM-DD).
- **Respuesta:**
  - **200 OK:** Devuelve las métricas de recaudación.
  - **500 Internal Server Error:** En caso de error en el servidor.

#### Ejemplo de uso
```bash
GET http://localhost:3000/api/collection/monitoring/metrics?fechaInicio=2024-01-01&fechaFin=2024-12-31
```

#### Ejemplo de respuesta
```json
{
  "total_pagos": 100,
  "monto_total_recaudado": 50000,
  "promedio_pago": 500,
  "contribuyentes_pagadores": 80,
  "total_contribuyentes_deuda": 150,
  "monto_total_deuda": 75000
}
```

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

