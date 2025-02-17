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
Jaime Menéndez Llana

### **0.2. Nombre del proyecto:**
LIGENIA

### **0.3. Descripción breve del proyecto:**
LIGENIA es una plataforma web innovadora que utiliza inteligencia artificial para mejorar la experiencia en el ámbito deportivo, ofreciendo una liga virtual con estadísticas en tiempo real y análisis predictivo de rendimiento.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
https://github.com/moncio/Ligenia

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**
El objetivo principal de LIGENIA es crear una aplicación web que asista a los usuarios en todos los pasos del proceso deportivo, desde el análisis y diseño inicial hasta el despliegue final.

### **1.2. Características y funcionalidades principales:**
- Análisis de Rendimiento: Herramientas avanzadas para analizar el rendimiento deportivo.
- Rutinas Personalizadas: Generación de rutinas deportivas adaptadas a las necesidades individuales.
- Liga Virtual: Creación y gestión de ligas con estadísticas en tiempo real.
- Estadísticas Avanzadas: Uso de IA para generar estadísticas y rankings automáticos.

### **1.3. Diseño y experiencia de usuario:**
Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
Para instalar y poner en marcha el proyecto LIGENIA en local, sigue estos pasos:

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/moncio/Ligenia.git
   cd Ligenia
   ```

2. **Configurar Variables de Entorno:**
   - Copiar el archivo `.env.example` a `.env` y ajustar las variables según el entorno.

3. **Instalar Dependencias:**
   - **Node.js:** `npm install`

4. **Construir Imágenes Docker:**
   ```bash
   docker-compose build
   ```

5. **Levantar Servicios:**
   ```bash
   docker-compose up
   ```

6. **Ejecutar Tests:**
   ```bash
   npm test
   ```

7. **Desplegar en Producción:**
   - Configurar el pipeline de CI/CD en GitHub Actions para automatizar el despliegue en Railway.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
La arquitectura de LIGENIA se basa en microservicios, permitiendo escalabilidad y flexibilidad. Utiliza un patrón de API Gateway para gestionar las solicitudes del cliente y distribuirlas a los servicios backend. La infraestructura se despliega en Railway, integrando servicios como Supabase para autenticación y PostgreSQL para la base de datos.

![Diagrama de Infraestructura](https://github.com/moncio/Ligenia/blob/main/docs/Arquitectura%20del%20Sistema/diagramas/diagrama%20infraestructura.png)

### **2.2. Descripción de componentes principales:**
- **Frontend:** React.js y Next.js para la interfaz de usuario.
- **Backend:** Node.js con Express para la lógica de negocio.
- **Base de Datos:** PostgreSQL gestionada por Supabase.
- **Autenticación:** Supabase Auth.
- **Chatbot IA:** OpenAI GPT-4 API.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**
El proyecto sigue el modelo MVC, con una clara separación entre frontend, backend y base de datos. La estructura de directorios está diseñada para facilitar el desarrollo y despliegue continuo.

```plaintext
LIGENIA/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── config/
│   │   ├── default.json
│   │   └── production.json
│   ├── scripts/
│   ├── docker/
│   │   └── Dockerfile
│   ├── .env
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── config/
│   │   ├── default.json
│   │   └── production.json
│   ├── scripts/
│   ├── docker/
│   │   └── Dockerfile
│   ├── .env
│   └── README.md
├── docker-compose.yml
├── .github/
│   └── workflows/
├── docs/
└── README.md
```

### **2.4. Infraestructura y despliegue**
Railway se utiliza para el despliegue unificado del frontend, backend y base de datos, asegurando un entorno de producción robusto y escalable.

### **2.5. Seguridad**
Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede.

### **2.6. Tests**
Describe brevemente algunos de los tests realizados.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**
El modelo de datos de LIGENIA está diseñado para soportar la gestión de usuarios, ligas, torneos, equipos, partidos y estadísticas. Cada entidad está normalizada para asegurar la integridad de los datos y minimizar la redundancia. Las relaciones entre las entidades están claramente definidas para facilitar las consultas y operaciones comunes.

![Diagrama del Modelo de Datos](https://github.com/moncio/Ligenia/blob/main/docs/Dise%C3%B1o%20del%20Sistema/diagramas/modelo%20base%20datos.png)

### **3.2. Descripción de entidades principales:**
- **Usuarios:** Gestiona la información de registro, autenticación y roles de los usuarios en la plataforma.
- **Ligas:** Administra los detalles de las ligas organizadas, incluyendo su creación, configuración y gestión.
- **Torneos:** Maneja la información sobre los torneos que se llevan a cabo dentro de las ligas, incluyendo sus reglas y estructura.
- **Equipos:** Contiene los datos de los equipos participantes, incluyendo su formación, miembros y estadísticas.
- **Partidos:** Registra los resultados y la programación de los encuentros entre equipos, así como los eventos ocurridos durante los partidos.
- **Estadísticas:** Almacena y procesa el desempeño de jugadores y equipos, generando informes y análisis de rendimiento.

---

## 4. Especificación de la API

A continuación se describen los endpoints principales de la API:

| Método | Endpoint          | Descripción                          |
|--------|-------------------|--------------------------------------|
| GET    | /api/leagues      | Obtiene la lista de ligas.           |
| POST   | /api/matches      | Crea un nuevo partido.               |
| GET    | /api/statistics   | Recupera estadísticas de un jugador. |

---

## 5. Historias de Usuario

### **Historia de Usuario 1: Creación de Ligas**
- **Formato estándar:** "Como administrador, quiero crear ligas para organizar torneos y gestionar equipos."
- **Descripción:** Permitir a los administradores generar ligas con sus respectivas reglas y configuraciones.
- **Criterios de Aceptación:**
  - Dado que un administrador accede al sistema,
  - cuando ingresa los datos de una nueva liga y la guarda,
  - entonces el sistema almacena la liga y la muestra en su lista de ligas creadas.
- **Notas adicionales:** Definir reglas personalizables para cada liga.
- **Tareas:**
  - Crear formulario de creación de liga.
  - Implementar almacenamiento en base de datos.
  - Validar datos ingresados por el administrador.

### **Historia de Usuario 2: Consulta de Estadísticas**
- **Formato estándar:** "Como jugador, quiero consultar mis estadísticas personales para conocer mi rendimiento en los torneos."
- **Descripción:** Permitir a los jugadores visualizar su historial de partidos, puntos y clasificación.
- **Criterios de Aceptación:**
  - Dado que un jugador accede a su perfil,
  - cuando selecciona la opción de estadísticas,
  - entonces el sistema muestra su historial de torneos, partidos jugados y estadísticas relevantes.
- **Notas adicionales:** Posibilidad de exportar datos en formato PDF o CSV.
- **Tareas:**
  - Diseñar interfaz para la consulta de estadísticas.
  - Implementar conexión con base de datos.
  - Agregar opción de exportación de datos.

### **Historia de Usuario 3: Asistencia con Chatbot IA**
- **Formato estándar:** "Como usuario, quiero interactuar con un chatbot para obtener respuestas rápidas sobre reglas, estadísticas y próximos partidos."
- **Descripción:** Proveer un chatbot que responda a preguntas frecuentes y ofrezca estadísticas personalizadas.
- **Criterios de Aceptación:**
  - Dado que un usuario accede al chatbot,
  - cuando realiza una consulta sobre reglas o estadísticas,
  - entonces el chatbot proporciona una respuesta precisa y relevante.
- **Notas adicionales:** El chatbot debe aprender de interacciones previas para mejorar sus respuestas.
- **Tareas:**
  - Integrar OpenAI GPT-4 API para el chatbot.
  - Diseñar interfaz de chat.
  - Implementar lógica de aprendizaje automático.

---

## 6. Tickets de Trabajo

### **LIG-001: Creación de Ligas**
- **Descripción:** Implementar la funcionalidad para crear ligas.
- **Criterios de Aceptación:**
  - Formulario de creación de liga.
  - Almacenamiento en base de datos.
- **Prioridad:** Alta
- **Esfuerzo Estimado:** 5 puntos de historia

### **LIG-006: Consulta de Estadísticas**
- **Descripción:** Permitir a los jugadores consultar sus estadísticas.
- **Criterios de Aceptación:**
  - Interfaz de consulta de estadísticas.
  - Exportación de datos.
- **Prioridad:** Media
- **Esfuerzo Estimado:** 3 puntos de historia

### **LIG-007: Implementación de Chatbot**
- **Descripción:** Desarrollar chatbot de asistencia para responder preguntas frecuentes.
- **Criterios de Aceptación:**
  - Responder preguntas sobre torneos, reglas y estadísticas.
  - Base de conocimiento actualizable.
- **Prioridad:** Media
- **Esfuerzo Estimado:** 4 puntos de historia

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto.

**Pull Request 1:** 

https://github.com/moncio/Ligenia/pull/1

Documentación añadida para:
    - Visión general del proyecto
    - Análisis, requisitos y backlog
    - Diseño del sistema
    - Arquitectura e infraestructura

**Pull Request 2:**

**Pull Request 3:**

