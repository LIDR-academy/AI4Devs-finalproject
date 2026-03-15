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

LIGENIA es una innovadora plataforma web que utiliza inteligencia artificial para mejorar la experiencia en el ámbito deportivo. El proyecto se centra en ofrecer una liga virtual con estadísticas en tiempo real, proporcionando análisis predictivo de rendimiento y generación automática de rankings basados en estadísticas avanzadas.

### **1.1. Objetivo:**
El objetivo principal de LIGENIA es crear una aplicación web que asista a los usuarios en todos los pasos del proceso deportivo, desde el análisis y diseño inicial hasta el despliegue final.

### **1.2. Características y funcionalidades principales:**
- Análisis de Rendimiento: Herramientas avanzadas para analizar el rendimiento deportivo.
- Rutinas Personalizadas: Generación de rutinas deportivas adaptadas a las necesidades individuales.
- Liga Virtual: Creación y gestión de ligas con estadísticas en tiempo real.
- Estadísticas Avanzadas: Uso de IA para generar estadísticas y rankings automáticos.

### **1.3. Diseño y experiencia de usuario:**
En el siguiente enlace se puede encontrar un videotutorial explicativo que muestra la experiencia del usuario y las principales funcionalidades de la aplicación: https://www.loom.com/share/de45a1364eac466d8b22a5099d270d66?sid=e8645223-852a-4ac0-9142-33f9c930732f

### **1.4. Instrucciones de instalación:**
Para instalar y poner en marcha el proyecto LIGENIA en local, sigue estos pasos:

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/moncio/Ligenia.git
   cd Ligenia
   ```

2. **Configuración del Backend:**
   ```bash
   cd backend
   npm install
   ```
   - Copiar `.env.example` a `.env` y configurar:
     - Variables de conexión a PostgreSQL
     - Credenciales de Supabase (URL y API Key)
     - Ajustes de JWT y seguridad
   
   - Iniciar la base de datos con Docker:
   ```bash
   ./scripts/db/db-manager.sh start dev
   ```
   
   - Generar cliente Prisma y ejecutar migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Configuración del Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   - Copiar `.env.example` a `.env` y configurar:
     - `NEXT_PUBLIC_API_URL`: URL del backend (local)
     - `NEXT_PUBLIC_SUPABASE_URL`: URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase

4. **Ejecutar la Aplicación en Modo Desarrollo:**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Acceder a la Aplicación:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - Swagger API Docs: http://localhost:3000/api-docs

6. **Ejecutar Tests:**
   ```bash
   # En directorio backend
   npm test
   
   # En directorio frontend
   npm test
   ```

> **Nota**: El despliegue en Railway presentó problemas de certificados SSL que no pudieron resolverse completamente, pero la aplicación funciona correctamente en entorno local.

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
- **Chatbot IA:** OpenAI GPT-4 API (planificado para futura ampliación).

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
Railway se utiliza para el despliegue unificado del frontend, backend y base de datos, asegurando un entorno de producción robusto y escalable. La arquitectura se implementa en servicios separados que se comunican entre sí a través de variables de entorno referenciadas.

El backend se conecta a una base de datos PostgreSQL proporcionada por Railway, y la autenticación se maneja a través de Supabase, lo que permite una gestión segura de usuarios.

### **2.5. Seguridad**
Se han implementado las siguientes prácticas de seguridad:

- **Autenticación JWT**: Implementación de tokens JWT para sesiones seguras con expiración controlada.
- **Middleware de autorización**: Control de acceso basado en roles para rutas protegidas.
- **Validación de entradas**: Uso de express-validator para validar todas las entradas de usuario.
- **Sanitización de datos**: Prevención de inyección SQL y XSS mediante sanitización.
- **Variables de entorno**: Configuración segura mediante variables de entorno, separadas por ambiente.
- **HTTPS**: Comunicaciones cifradas en producción mediante HTTPS.
- **Rate limiting**: Protección contra ataques de fuerza bruta mediante limitación de peticiones.

Ejemplo de middleware de autorización:
```typescript
export const authorize = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso prohibido' });
    }

    next();
  };
};
```

### **2.6. Tests**
El proyecto incluye tests unitarios, de integración y end-to-end:

- **Tests unitarios**: Verifican componentes individuales como controladores y servicios.
- **Tests de integración**: Prueban la interacción entre múltiples componentes.
- **Tests de API**: Verifican el comportamiento de los endpoints del backend.

Ejemplos de tests implementados:
- Verificación de creación y consulta de ligas
- Pruebas de autenticación y autorización
- Validación de flujos de datos para estadísticas
- Tests de integración con Supabase

Los tests se ejecutan automáticamente en el pipeline de CI/CD antes de cada despliegue para garantizar la calidad del código.

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

La API de LIGENIA está diseñada siguiendo principios RESTful con una arquitectura limpia (Clean Architecture) y documentada con Swagger para facilitar pruebas y exploración. La autenticación se implementa a través de Supabase, proporcionando un sistema robusto para la gestión de usuarios y sesiones.

> **Nota importante**: Aunque la implementación local funciona correctamente, el despliegue en Railway no ha sido posible de completar debido a problemas técnicos con certificados SSL y configuración del entorno. Se intentaron numerosos enfoques (Docker, Nixpacks, configuraciones personalizadas), pero estas limitaciones no pudieron resolverse completamente.

### 4.1. Estructura de la API

La API sigue una arquitectura de capas claramente definidas:
- **API (`src/api/`)**: Controladores, rutas, middlewares y validaciones
- **Core (`src/core/`)**: Entidades de dominio, casos de uso e interfaces
- **Infraestructura (`src/infrastructure/`)**: Implementaciones de interfaces
- **Servicios Compartidos (`src/shared/`)**: Utilidades y configuraciones comunes

### 4.2. Principales Endpoints

#### Autenticación (via Supabase)
- `POST /api/auth/login`: Inicio de sesión de usuario
- `POST /api/auth/signup`: Registro de nuevo usuario
- `POST /api/auth/logout`: Cierre de sesión

#### Torneos
| Método | Endpoint                          | Descripción                             |
|--------|-----------------------------------|------------------------------------------|
| GET    | `/api/tournaments`                | Listar torneos con filtros              |
| GET    | `/api/tournaments/:id`            | Obtener detalles de un torneo           |
| POST   | `/api/tournaments`                | Crear nuevo torneo (admin)              |
| PUT    | `/api/tournaments/:id`            | Actualizar información de torneo        |
| POST   | `/api/tournaments/:id/register`   | Registrar equipo en torneo              |
| DELETE | `/api/tournaments/:id/unregister` | Cancelar registro en torneo             |
| GET    | `/api/tournaments/:id/standings`  | Obtener clasificación del torneo        |
| GET    | `/api/tournaments/:id/matches`    | Obtener partidos de un torneo           |
| GET    | `/api/tournaments/:id/bracket`    | Obtener cuadro de eliminatorias         |

#### Usuarios y Jugadores
| Método | Endpoint                         | Descripción                              |
|--------|----------------------------------|------------------------------------------|
| GET    | `/api/users`                     | Listar usuarios (admin)                  |
| GET    | `/api/users/:id`                 | Obtener información de usuario           |
| PUT    | `/api/users/:id`                 | Actualizar información de usuario        |
| GET    | `/api/players`                   | Listar jugadores disponibles             |
| GET    | `/api/players/:id`               | Obtener perfil de jugador                |
| PUT    | `/api/players/:id`               | Actualizar perfil de jugador             |
| GET    | `/api/users/:id/statistics`      | Obtener estadísticas del usuario         |
| GET    | `/api/users/:id/match-history`   | Obtener historial de partidos            |

#### Partidos
| Método | Endpoint                    | Descripción                             |
|--------|-----------------------------|-----------------------------------------|
| GET    | `/api/matches`              | Listar partidos con filtros             |
| GET    | `/api/matches/:id`          | Obtener detalles de un partido          |
| POST   | `/api/matches`              | Crear nuevo partido (admin)             |
| PUT    | `/api/matches/:id`          | Actualizar información de partido       |
| DELETE | `/api/matches/:id`          | Eliminar partido (admin)                |

#### Estadísticas y Rankings
| Método | Endpoint                                | Descripción                           |
|--------|----------------------------------------|---------------------------------------|
| GET    | `/api/rankings`                        | Obtener ranking global                |
| GET    | `/api/rankings/:categoryId`            | Obtener ranking por categoría         |
| GET    | `/api/statistics/player/:playerId`     | Estadísticas detalladas de jugador    |
| GET    | `/api/statistics/tournament/:tournamentId` | Estadísticas de torneo            |
| GET    | `/api/statistics/global`               | Estadísticas globales del sistema     |
| GET    | `/api/performance/history`             | Historial de rendimiento              |
| GET    | `/api/performance/trends`              | Tendencias de rendimiento             |

### 4.3. Validación y Seguridad

Todos los endpoints implementan:
- Validación rigurosa de datos de entrada mediante Zod
- Middlewares de autenticación para rutas protegidas
- Control de acceso basado en roles (ADMIN, PLAYER)
- Sanitización de datos para prevenir inyecciones y ataques XSS

### 4.4. Documentación y Pruebas

En desarrollo local, la API incluye:
- Documentación Swagger completa disponible en `/api-docs`
- Herramienta personalizada para pruebas de API (`api_tester.py`)
- Pruebas automatizadas para cada endpoint

La estructura del proyecto está diseñada para facilitar el mantenimiento y la expansión de la API, siguiendo buenas prácticas de desarrollo y arquitectura limpia.

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

https://github.com/moncio/Ligenia/pull/2

Implementación completa del MVP incluyendo:
    - Desarrollo del backend con Node.js/Express y arquitectura limpia
    - Frontend con React/Next.js y diseño responsive
    - Base de datos PostgreSQL con Prisma como ORM
    - Integración con Supabase para autenticación
    - Tests unitarios e integración
    - Configuración del despliegue en Railway

**Pull Request 3:**

