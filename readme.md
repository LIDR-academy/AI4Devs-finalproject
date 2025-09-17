## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Visión General del Proyecto – MVP Stacklio](#8-vision-general-del-proyecto-mvp-stacklio)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Isabel Núñez de la Torre

### **0.2. Nombre del proyecto:**
Stacklio

### **0.3. Descripción breve del proyecto:**
Stacklio centraliza tu **stack de herramientas, tus proyectos y tu perfil profesional** en un espacio visual y social, pensado para desarrolladores, estudiantes y profesionales técnicos.

### **0.4. URL del proyecto:**
[stacklio.dev](https://stacklio.dev/)

> Nota: Por el momento no se muestra nada, pendiente de desarrollo


### 0.5. URL o archivo comprimido del repositorio
Pendiente

---

## 1. Descripción general del producto

## Descripción general de Stacklio

Stacklio es una aplicación web que combina la **gestión de stack tecnológico**, un **portfolio de proyectos** y una **red social profesional** en un único espacio. Su propósito es permitir a desarrolladores, estudiantes y profesionales técnicos **organizar y visualizar sus herramientas y proyectos**, compartir su experiencia con otros usuarios y mantener un perfil profesional actualizado. Stacklio aporta valor al facilitar el **descubrimiento y la organización de herramientas**, la gestión visual de proyectos y la posibilidad de **mostrar públicamente la experiencia y el progreso profesional**, fomentando la colaboración y la visibilidad dentro de la comunidad tecnológica. Además, permite probar funcionalidades básicas **sin necesidad de registro**, aumentando la accesibilidad y la captación de nuevos usuarios.

### **1.1. Objetivo:**

El propósito de Stacklio es proporcionar a desarrolladores, estudiantes y profesionales técnicos una plataforma donde puedan **organizar su stack de herramientas, gestionar sus proyectos y compartir su experiencia profesional** de manera visual y social. Aporta valor al permitir centralizar y mostrar de forma clara tanto las herramientas utilizadas como los proyectos desarrollados, facilitando la colaboración y la visibilidad dentro de la comunidad tecnológica. Stacklio soluciona la dispersión de información sobre el stack y los proyectos personales, ofreciendo un **perfil profesional completo y fácilmente compartible** para aquellos que quieren destacar sus habilidades y progreso. Además, permite a usuarios **no registrados explorar y probar la aplicación** antes de crear su propio perfil.


### **1.2. Características y funcionalidades principales:**


| Funcionalidad | Descripción | Tipo de usuario | Disponible sin registro? |
|---------------|------------|----------------|-------------------------|
| Cajas personalizables de stack | Permite organizar herramientas en cajas (Frontend, Backend, BBDD, IA, etc.) y personalizar los nombres según el usuario. | Desarrolladores, estudiantes, profesionales técnicos | Sí, solo ver |
| Drag & Drop de herramientas | Los usuarios pueden mover herramientas entre cajas y reorganizarlas fácilmente. | Registrado | No |
| Detalle de herramienta | Cada herramienta muestra información detallada: nombre, descripción, URL, imagen y tags (categorías). | Todos | Sí |
| Favoritos y filtrado | Los usuarios pueden marcar herramientas como favoritas y filtrarlas o buscarlas por tags. | Registrado | No |
| Portfolio de proyectos | Permite crear y gestionar proyectos con estado, herramientas asociadas y descripción. | Registrado | No (proyectos de prueba sí) |
| Perfil público | Muestra información del usuario: nombre, número de proyectos/completados, descripción, followers y following. | Registrado | No (perfil de prueba sí) |
| Compartir en redes sociales | Permite compartir el stack o proyectos en plataformas externas. | Registrado | No |
| Funcionalidad futura: muro principal | Un feed donde los usuarios puedan compartir sus progresos, actualizaciones o novedades sobre sus proyectos. | Registrado | No |

### **1.3. Diseño y experiencia de usuario:**

La experiencia del usuario en Stacklio se adapta a dos escenarios: **usuario no registrado** y **usuario registrado**.

#### **Usuario no registrado**
- Puede explorar las cajas de herramientas y ver detalles de cada herramienta.
- Puede ver proyectos de prueba en el portfolio.
- Puede navegar por un perfil de prueba.
- No puede añadir herramientas, marcar favoritas, crear proyectos o personalizar su perfil.

#### **Usuario registrado**
- Accede a todas las funcionalidades: añadir/mover herramientas, marcar favoritas, crear y editar proyectos, gestionar perfil y compartir contenido.
- Disfruta de su experiencia personalizada y su perfil público con URL propia.

#### **Flujo general y navegación**
- La interfaz está diseñada con un **perfil tipo feed estilo Instagram** pero profesional, con un enfoque visual en **cajas de herramientas**.
- La navegación es intuitiva, con un **panel lateral o superior** para acceder al portfolio, stack y configuración del perfil.
- Funciones de búsqueda, filtrado y favoritos están integradas en la interfaz principal para agilizar la experiencia.
- Todo el diseño está optimizado para que la información sea **visual, clara y fácilmente compartible**, reforzando la profesionalidad y la interacción social.

(VIDEO PENDIENTE DE GRABAR UNA VEZ ESTÉ DESARROLLADA LA APLICACIÓN)


### **1.4. Instrucciones de instalación:**

Sigue estos pasos para instalar y poner en marcha Stacklio en un entorno local:

#### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/stacklio.git
cd stacklio
```
2. Configurar variables de entorno

Crea un archivo .env en la raíz de cada proyecto (frontend y backend) con las siguientes variables:

Backend (/backend/.env)

```bash
DATABASE_URL=postgresql://usuario:password@localhost:5432/stacklio
JWT_SECRET=tu_clave_secreta
PORT=4000
```

Frontend (/frontend/.env)
```bash
VITE_API_URL=http://localhost:4000/api
```
3. Instalación del backend
```bash
cd backend
npm install
```

4. Configuración de la base de datos

- Instala PostgreSQL localmente (o usa Docker)
- Crea la base de datos stacklio
```bash
createdb stacklio
```

Ejecuta migraciones con Prisma
```bash
npx prisma migrate dev --name init
```
Seed de datos de prueba
```bash
npx prisma db seed
```

5. Levantar el backend
```bash
npm run dev
```
El backend estará disponible en http://localhost:4000.

6. Instalación del frontend
```bash
cd ../frontend
npm install
```
7. Levantar el frontend
```bash
npm run dev
```
El frontend estará disponible en http://localhost:5173 (Vite por defecto).

8. Acceso y pruebas

- Accede a la aplicación desde el navegador en http://localhost:5173.

- Regístrate o inicia sesión para probar todas las funcionalidades.

- Puedes probar herramientas y proyectos de ejemplo sin registro.

Notas adicionales

- Asegúrate de tener Node.js v18+ y npm o pnpm instalados.

- Para cualquier error relacionado con la base de datos, revisa que la URL de conexión sea correcta y que PostgreSQL esté corriendo.

- Para desarrollo en Windows, usar WSL2 o Docker puede simplificar la configuración de PostgreSQL.

---

## 2. Arquitectura del Sistema
## Propuesta de stack para el MVP de Stacklio

### Frontend
- **React + Vite**: framework moderno y rápido para el desarrollo del frontend.
- **TailwindCSS**: estilizado rápido y responsive.
- **shadcn/ui**: componentes prehechos para acelerar el desarrollo de la UI.

### Backend
- **Node.js + Express**: backend monolítico sencillo y rápido de implementar para el MVP.
- **Autenticación JWT**: gestionar sesiones y permisos de usuarios registrados.

### Base de datos
- **PostgreSQL + Prisma ORM**: almacenar usuarios, herramientas y proyectos.
- Solo se guardan **URLs de iconos de las herramientas**, no imágenes.

### Servicios adicionales
- **Notificaciones frontend**: toast notifications para alertas e interacciones de usuario.
- **Email y otras notificaciones**: de momento no se implementa, se puede añadir en el futuro.

### Arquitectura
- **Monolito**: todo el frontend y backend en un solo proyecto para acelerar el MVP.
- **Beneficios**: rápido de implementar, fácil de desplegar y documentar.
- **Limitaciones**: menos flexible que microservicios y dependiente de un único despliegue.

### **2.1. Diagrama de arquitectura:**

La arquitectura de Stacklio sigue un **patrón monolítico**, pensado para un MVP rápido y funcional. Todo el backend y frontend se encuentran en un único proyecto, con el frontend consumiendo la API REST del backend. La base de datos almacena información de usuarios, herramientas y proyectos, pero **no se guardan imágenes**, únicamente la URL de los iconos de las herramientas. La autenticación se realiza mediante **JWT**, y las notificaciones se muestran solo en el frontend mediante librerías de UI (toast notifications).

#### Diagrama de arquitectura
```mermaid
graph LR
    A[Frontend: React + Vite + TailwindCSS + shadcn] --> B[Backend: Node.js + Express]
    B --> C[(Base de datos: PostgreSQL + Prisma)]
    B --> D[Autenticación JWT]
```

### **2.2. Descripción de componentes principales:**

### Componentes principales de Stacklio

Los componentes principales del sistema son:

1. **Frontend**
   - Implementado con React + Vite + TailwindCSS + shadcn.
   - Gestiona la interfaz de usuario, interacción con cajas de herramientas, portfolio y perfil de usuario.
   - Soporta tanto usuarios registrados como no registrados, mostrando datos de prueba cuando no se está autenticado.

2. **Backend**
   - Implementado con Node.js + Express.
   - Gestiona la lógica de negocio, rutas de API REST, validación de datos y autenticación JWT.
   - Proporciona los datos al frontend y controla el acceso según el tipo de usuario.

3. **Base de datos**
   - PostgreSQL + Prisma ORM.
   - Almacena información de usuarios, herramientas y proyectos.
   - Solo se guardan URLs de iconos de herramientas, no imágenes.

4. **Gestión del stack**
   - Funcionalidad que permite organizar herramientas en cajas personalizables, arrastrarlas entre cajas y filtrarlas por tags.

5. **Portfolio de proyectos**
   - Permite crear, modificar y visualizar proyectos, mostrando estado, herramientas asociadas y descripción.

6. **Perfil de usuario**
   - Visualización de información del usuario: nombre, descripción, proyectos/completados, followers y following.
   - Permite URL pública opcional para compartir el perfil.

7. **Autenticación JWT**
   - Controla el acceso de usuarios registrados y protege los endpoints del backend.

8. **Notificaciones frontend**
   - Toast notifications para mostrar alertas e interacciones al usuario.

### Tecnologías y responsabilidades de los componentes

| Componente | Tecnología | Propósito y Responsabilidad |
|------------|-----------|-----------------------------|
| Frontend | React + Vite + TailwindCSS + shadcn | Interfaz de usuario para explorar el stack, gestionar proyectos y perfil. Soporta interacción de usuarios registrados y no registrados. |
| Backend | Node.js + Express | Procesa la lógica de negocio, rutas de API REST, validación de datos y autenticación JWT. Controla el flujo de información hacia el frontend. |
| Base de datos | PostgreSQL + Prisma | Almacena usuarios, proyectos y herramientas. Solo URLs de iconos. Permite relaciones consistentes y consultas tipadas con Prisma. |
| Gestión del stack | Frontend + Backend + DB | Permite organizar herramientas en cajas personalizables, arrastrarlas, añadir nuevas y filtrarlas por tags. |
| Portfolio de proyectos | Frontend + Backend + DB | Gestiona creación y seguimiento de proyectos, asociando herramientas y mostrando estado y progreso. |
| Perfil de usuario | Frontend + Backend + DB | Visualiza datos del usuario, followers, following y permite compartir contenido mediante URL pública. |
| Autenticación JWT | Backend | Gestiona sesiones y permisos de usuarios registrados. Protege datos privados y endpoints sensibles. |
| Notificaciones | Frontend (librerías de toast) | Muestra alertas e interacciones en tiempo real para mejorar la experiencia del usuario. |

### Diagrama de componentes principales

```mermaid
graph LR
    U[Usuario no registrado] -->|Explora stack y proyectos de prueba| F[Frontend: React + Vite + TailwindCSS + shadcn]
    UR[Usuario registrado] -->|Accede a su stack y portfolio| F

    F --> B[Backend: Node.js + Express]
    B --> DB[(Base de datos: PostgreSQL + Prisma)]
    B --> Auth[Autenticación JWT]

    F --> Toast[Notificaciones frontend]

    subgraph Funcionalidades
        Stack[Gestión del stack]
        Portfolio[Portfolio de proyectos]
        Perfil[Perfil de usuario]
    end

    F --> Stack
    F --> Portfolio
    F --> Perfil
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

La estructura del proyecto Stacklio sigue un **patrón monolítico** con separación lógica de frontend y backend, pensado para un MVP rápido y funcional. Esto permite un desarrollo ágil, fácil mantenimiento y despliegue sencillo, manteniendo la posibilidad de escalar a microservicios en el futuro si fuese necesario.

#### Estructura de ficheros
- **stacklio/**
  - **frontend/**
    - **src/**
      - components/ – Componentes UI reutilizables (botones, cajas de herramientas, cards)
      - pages/ – Páginas principales: perfil, stack, portfolio
      - styles/ – TailwindCSS + estilos personalizados
      - utils/ – Funciones de ayuda y hooks
    - vite.config.js
  - **backend/**
    - controllers/ – Lógica de negocio de las rutas
    - routes/ – Definición de rutas REST
    - models/ – Modelos de Prisma y esquemas de base de datos
    - middlewares/ – Autenticación JWT, validaciones
    - server.js – Configuración y arranque del servidor
  - **prisma/**
    - schema.prisma – Definición de la base de datos y migraciones
  - package.json
  - README\.md


#### Propósito de las carpetas principales

- **frontend/src/components/** → Componentes reutilizables para la UI (botones, cajas de herramientas, cards, etc.).
- **frontend/src/pages/** → Páginas de la aplicación (perfil, stack, portfolio, página de prueba para usuarios no registrados).
- **frontend/src/styles/** → Estilos globales y configuración de TailwindCSS.
- **frontend/src/utils/** → Funciones de ayuda, hooks personalizados y utilidades para manejo de datos.
- **backend/controllers/** → Controladores que gestionan la lógica de negocio de las rutas.
- **backend/routes/** → Definición de rutas REST que conectan frontend y backend.
- **backend/models/** → Modelos de datos Prisma para interactuar con la base de datos.
- **backend/middlewares/** → Middlewares para autenticación JWT, validaciones de datos y control de acceso.
- **backend/server.js** → Configuración y arranque del servidor.
- **prisma/schema.prisma** → Esquema de la base de datos y migraciones.

#### Patrón y justificación

- **Patrón monolítico con separación lógica** entre frontend y backend.
- **Justificación:** Permite un desarrollo rápido del MVP, simplifica el despliegue inicial y facilita la documentación para el TFM.
- **Ventajas:** Fácil de mantener, claro de entender, rápido de implementar y desplegar.
- **Limitaciones:** Escalabilidad limitada frente a microservicios, todo depende de un único despliegue.


### **2.4. Infraestructura y despliegue**

Stacklio se desplegará como un **MVP monolítico** utilizando servicios gratuitos para agilizar el desarrollo y reducir costes. La infraestructura incluye frontend, backend, base de datos y autenticación, conectados entre sí de forma sencilla y segura.

#### Diagrama de infraestructura
```mermaid
graph LR
    U[Usuario no registrado] -->|Explora stack y proyectos de prueba| FE[Frontend: React + Vite + TailwindCSS + shadcn]
    UR[Usuario registrado] -->|Accede a su stack y portfolio| FE

    FE --> BE[Backend: Node.js + Express]
    BE --> DB[(Base de datos: PostgreSQL + Prisma)]
    BE --> Auth[Autenticación JWT]

    FE --> Toast[Notificaciones frontend]

    subgraph Funcionalidades
        Stack[Gestión del stack]
        Portfolio[Portfolio de proyectos]
        Perfil[Perfil de usuario]
    end

    FE --> Stack
    FE --> Portfolio
    FE --> Perfil
```

### Flujo de despliegue

- **Frontend:** desplegado en **Vercel** (gratuito hasta cierto límite de uso) para servir la aplicación web.
- **Backend:** desplegado en **Render** o **Railway**, ambos con planes gratuitos que permiten Node.js y conexión a PostgreSQL.
- **Base de datos PostgreSQL:** alojada en **Supabase** o **Railway**, con plan gratuito suficiente para un MVP.
- **Conexión y autenticación:** el backend expone **API REST** y gestiona **JWT**; el frontend consume la API. Se recomienda **HTTPS** y uso de **variables de entorno** para claves y URLs.
- **Despliegue:** push a **GitHub** → conexión a Vercel para frontend, y a Render/Railway para backend y base de datos → verificación de rutas y endpoints.

### Ventajas de esta infraestructura

- Totalmente gratuita para MVP y pruebas.
- Fácil de configurar y desplegar sin conocimientos avanzados de DevOps.
- Permite probar la idea y recibir feedback rápido.
- Componentes independientes y escalables a planes de pago o servicios dedicados.

### Limitaciones

- Recursos limitados: RAM, CPU y número de requests.
- Escalabilidad horizontal limitada; no recomendable para alto tráfico inicial.
- Dependencia de servicios externos gratuitos (puede haber restricciones o downtime).
- Seguridad básica: se recomienda añadir **HTTPS** y manejo seguro de variables de entorno.

### **2.5. Seguridad**

Stacklio implementa prácticas de seguridad básicas pero fundamentales para proteger los datos de los usuarios y asegurar la comunicación entre componentes. Estas medidas son fáciles de implementar y adecuadas para un MVP.

#### Autenticación y autorización

- **JWT para autenticación:** Se utiliza JSON Web Tokens para verificar la identidad de los usuarios en cada solicitud al backend.
- **Expiración de tokens:** Los JWT tienen fecha de expiración para limitar el tiempo de acceso.
- **Protección de rutas:** Middleware en Express valida JWT antes de permitir acceso a rutas privadas.
- **Roles básicos:** Se pueden asignar roles si en el futuro hay funcionalidades diferenciadas (por ejemplo, admin o usuario estándar).

#### Protección de datos y comunicación

- **Contraseñas cifradas:** Se almacenan las contraseñas de forma segura usando **bcrypt**.
- **Variables de entorno:** Claves secretas y URLs sensibles se guardan en variables de entorno, nunca en el código.
- **HTTPS:** Se recomienda desplegar el frontend y backend bajo HTTPS para cifrar la comunicación.
- **Validación de datos:** Backend valida entradas del usuario para evitar inyecciones y datos malformados.

#### Seguridad en frontend y buenas prácticas

- **Almacenamiento seguro de JWT:** Se recomienda almacenar tokens en **memory storage o HttpOnly cookies** en lugar de localStorage.
- **Prevención de XSS:** Escapar contenido dinámico y sanitizar inputs antes de renderizar.
- **Validación de formularios:** Comprobaciones básicas en el cliente para asegurar formatos correctos (emails, URLs, nombres).
- **Control de visibilidad:** Información sensible (tokens, emails) no se expone en la UI a usuarios no autorizados.

💡 **Notas:** Estas medidas proporcionan una seguridad básica suficiente para un MVP y pueden ampliarse en futuras versiones con autenticación de dos factores, logging de seguridad y análisis de vulnerabilidades.

### **2.6. Tests**

Para el MVP de Stacklio, se han priorizado tests **simples, rápidos y efectivos** que garanticen la funcionalidad básica del sistema sin retrasar el desarrollo.

#### Estrategia general

- Priorizar tests **unitarios y de integración** sobre tests end-to-end complejos debido al tiempo limitado.
- Cubrir **funcionalidades críticas**: autenticación, gestión de stack, portfolio y visualización de perfil.
- Usar librerías comunes y eficientes: **Jest** para frontend y backend, **React Testing Library** para componentes de React.

#### Tests en frontend

- **Componentes de stack (cajas y herramientas):**  
  - Test de renderizado de cajas y herramientas.  
  - Test de drag & drop básico entre cajas.  
  - Test de marcado de favoritos y filtrado por tags.
- **Portfolio de proyectos:**  
  - Renderizado correcto de lista de proyectos.  
  - Validación de botones de añadir/editar proyecto.
- **Perfil de usuario:**  
  - Renderizado de nombre, proyectos/completados, followers y following.  
  - Prueba de visibilidad de perfil público vs privado.

#### Tests en backend

- **Rutas de autenticación:**  
  - Registro, login y verificación JWT.  
  - Test de expiración de tokens y acceso a rutas privadas.
- **Rutas de stack y herramientas:**  
  - Creación, actualización y listado de cajas y herramientas.  
  - Test de favoritos y filtrado por tags.
- **Rutas de portfolio:**  
  - CRUD básico de proyectos y verificación de ownership por usuario.
- **Base de datos:**  
  - Test de integridad de relaciones (USER ↔ BOX ↔ TOOL, USER ↔ PROJECT).  
  - Validación de constraints (unique email, FK, etc.).

💡 **Notas:** Estos tests permiten un MVP funcional y confiable, asegurando que las funcionalidades esenciales estén cubiertas sin dedicar demasiado tiempo al testing avanzado.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**
```mermaid
erDiagram
    USER ||--o{ BOX : owns
    USER ||--o{ PROJECT : owns
    BOX ||--o{ TOOL : contains
    USER ||--o{ FAVORITE : marks
    TOOL ||--o{ FAVORITE : is_marked

    USER {
        int id PK "Identificador único del usuario"
        string username "Nombre de usuario"
        string email "Correo electrónico (unique, not null)"
        string password "Contraseña cifrada (not null)"
        string profile_url "URL pública del perfil"
        string bio "Descripción breve"
    }

    BOX {
        int id PK "Identificador de la caja"
        string name "Nombre de la caja (Frontend, Backend, etc.)"
        int user_id FK "Referencia al usuario propietario"
    }

    TOOL {
        int id PK "Identificador de la herramienta"
        string name "Nombre de la herramienta"
        string description "Descripción breve"
        string icon_url "URL del icono de la herramienta"
        string tool_url "URL oficial"
        string tags "Categorías/tags separadas por comas"
        int box_id FK "Referencia a la caja donde está"
    }

    PROJECT {
        int id PK "Identificador del proyecto"
        string name "Nombre del proyecto"
        string description "Descripción breve del proyecto"
        string status "Estado del proyecto (en progreso, completado)"
        int user_id FK "Referencia al usuario propietario"
    }

    FAVORITE {
        int id PK "Identificador del favorito"
        int user_id FK "Usuario que marca como favorito"
        int tool_id FK "Herramienta marcada como favorita"
    }
```


### **3.2. Descripción de entidades principales:**
### 3.2. Descripción de entidades principales

**Usuario (USER)**
- `id`: int, PK, identificador único del usuario.
- `username`: string, nombre de usuario.
- `email`: string, unique, not null, correo electrónico.
- `password`: string, not null, contraseña cifrada.
- `profile_url`: string, URL pública del perfil del usuario.
- `bio`: string, breve descripción o presentación del usuario.

**Relaciones:**
- 1 a n con BOX (un usuario puede tener varias cajas).
- 1 a n con PROJECT (un usuario puede tener varios proyectos).
- 1 a n con FAVORITE (un usuario puede marcar varias herramientas como favoritas).

---

**Caja (BOX)**
- `id`: int, PK, identificador único de la caja.
- `name`: string, nombre de la caja (Frontend, Backend, BBDD, IA…).
- `user_id`: int, FK, referencia al propietario (USER).

**Relaciones:**
- 1 a n con TOOL (cada caja puede contener varias herramientas).

---

**Herramienta (TOOL)**
- `id`: int, PK, identificador de la herramienta.
- `name`: string, nombre de la herramienta.
- `description`: string, descripción breve.
- `icon_url`: string, URL del icono de la herramienta (no se almacena la imagen).
- `tool_url`: string, URL oficial de la herramienta.
- `tags`: string, categorías o tags de la herramienta.
- `box_id`: int, FK, referencia a la caja que la contiene.

**Relaciones:**
- n a 1 con BOX.
- n a n con USER a través de FAVORITE.

---

**Proyecto (PROJECT)**
- `id`: int, PK.
- `name`: string, nombre del proyecto.
- `description`: string, descripción breve.
- `status`: string, estado del proyecto (en progreso, completado).
- `user_id`: int, FK, referencia al propietario (USER).

**Relaciones:**
- n a 1 con USER.

---

**Favorito (FAVORITE)**
- `id`: int, PK.
- `user_id`: int, FK, usuario que marca la herramienta como favorita.
- `tool_id`: int, FK, herramienta marcada como favorita.

**Relaciones:**
- n a 1 con USER.
- n a 1 con TOOL.

---

### 3.3 Diagrama de interacción de usuarios con Stacklio
```mermaid
flowchart TD
    subgraph USUARIOS
        A[Usuario No Registrado]
        B[Usuario Registrado]
    end

    subgraph STACK
        C[Cajas de herramientas]
        D[Agregar / Mover herramientas]
        E[Ver detalles de herramientas]
        F[Marcar favoritos]
    end

    subgraph PORTFOLIO
        G[Ver proyectos de prueba]
        H[Agregar / Editar proyectos]
    end

    subgraph PERFIL
        I[Perfil público de prueba]
        J[Perfil propio y configuraciones]
        K[Compartir en redes sociales]
    end

    %% Interacciones de usuario no registrado
    A -->|Puede ver| C
    A -->|Puede arrastrar/mover| D
    A -->|Puede ver detalles| E
    A -->|No puede marcar favoritos| F
    A -->|Puede ver proyectos de prueba| G
    A -->|Puede ver perfil de prueba| I

    %% Interacciones de usuario registrado
    B -->|Puede ver| C
    B -->|Puede arrastrar/mover| D
    B -->|Puede ver detalles| E
    B -->|Puede marcar favoritos| F
    B -->|Puede agregar/editar| H
    B -->|Perfil propio| J
    B -->|Compartir stack/proyectos| K
```

## 4. Especificación de la API

### Endpoints principales REST para Stacklio

| Recurso | Método | Ruta | Descripción | Parámetros importantes |
|---------|-------|------|-------------|----------------------|
| **Usuario** | POST | `/api/users/register` | Registrar un nuevo usuario | `username`, `email`, `password` |
|  | POST | `/api/users/login` | Autenticación y obtención de JWT | `email`, `password` |
|  | GET | `/api/users/{id}` | Obtener perfil de un usuario | `id` (path), JWT opcional si es propio perfil |
| **Herramientas** | GET | `/api/tools` | Listar todas las herramientas | `tag` (query), `favorite` (query, solo usuario registrado) |
|  | POST | `/api/tools` | Añadir nueva herramienta | `name`, `description`, `icon_url`, `tool_url`, `tags`, JWT requerido |
|  | PATCH | `/api/tools/{id}` | Editar herramienta existente | `id` (path), datos a actualizar, JWT |
| **Cajas** | GET | `/api/boxes` | Listar cajas de un usuario | `user_id` (query), JWT requerido |
|  | POST | `/api/boxes` | Crear nueva caja | `name`, JWT requerido |
|  | PATCH | `/api/boxes/{id}` | Actualizar caja | `id` (path), `name`, JWT |
| **Proyectos** | GET | `/api/projects` | Listar proyectos | `user_id` (query), `status` (query) |
|  | POST | `/api/projects` | Crear proyecto | `name`, `description`, `status`, JWT |
|  | PATCH | `/api/projects/{id}` | Actualizar proyecto | `id` (path), datos a actualizar, JWT |
| **Favoritos** | POST | `/api/favorites` | Marcar herramienta como favorita | `tool_id`, JWT |
|  | DELETE | `/api/favorites/{id}` | Quitar herramienta favorita | `id` (path), JWT |

---

### Ejemplo de request y response para login

```json
POST /api/users/login
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}

Response 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "isa",
    "profile_url": "/isa",
    "bio": "Desarrolladora frontend"
  }
}
```

### Resumen OpenAPI (Markdown)

#### Login de usuario
- **Método:** POST  
- **Ruta:** `/api/users/login`  
- **Body:** `email`, `password`  
- **Response:** token JWT + datos del usuario  
- **Códigos de estado:** 200 OK, 401 Unauthorized  

#### Listado de herramientas
- **Método:** GET  
- **Ruta:** `/api/tools`  
- **Query params:** `tag`, `favorite`  
- **Response:** lista de herramientas con `id`, `name`, `description`, `icon_url`, `tool_url`, `tags`  
- **Códigos de estado:** 200 OK  

#### Crear proyecto
- **Método:** POST  
- **Ruta:** `/api/projects`  
- **Body:** `name`, `description`, `status`  
- **Response:** proyecto creado con `id` y datos enviados  
- **Códigos de estado:** 201 Created, 400 Bad Request, 401 Unauthorized

---

## 5. Historias de Usuario

**Historia de Usuario 1: Gestión de Stack Personal**
| Campo | Detalle |
|-------|---------|
| **Título** | Organización y personalización del stack de herramientas |
| **Como** | Desarrollador |
| **Quiero** | Organizar mis herramientas en cajas personalizables (Frontend, Backend, BBDD, IA, etc.) y moverlas entre cajas mediante drag & drop |
| **Para que** | Pueda tener un control visual y flexible de mi stack y acceder rápidamente a mis herramientas favoritas |
| **Criterios de Aceptación** | - Crear y renombrar cajas según las necesidades del usuario <br> - Arrastrar y soltar herramientas entre cajas sin perder datos <br> - Marcar herramientas como favoritas y filtrarlas por tags <br> - Visualización clara de cada herramienta con icono, nombre y descripción |
| **Notas Adicionales** | - Interfaz intuitiva y responsive <br> - Considerar accesibilidad y compatibilidad entre navegadores |


**Historia de Usuario 2: Gestión de Portfolio de Proyectos**
| Campo | Detalle |
|-------|---------|
| **Título** | Creación y seguimiento de proyectos en el portfolio |
| **Como** | Profesional técnico |
| **Quiero** | Crear y gestionar mis proyectos dentro de Stacklio, incluyendo estado, herramientas asociadas y descripción |
| **Para que** | Pueda llevar un registro actualizado de mis proyectos y mostrar mis logros de manera clara en mi perfil |
| **Criterios de Aceptación** | - Crear un proyecto con nombre, descripción, estado y herramientas asociadas <br> - Editar proyectos existentes y actualizar su progreso <br> - Visualizar proyectos en un formato ordenado y atractivo dentro del perfil <br> - Mostrar número total de proyectos y completados en el perfil del usuario |
| **Notas Adicionales** | - Cada proyecto debe poder vincularse a las herramientas utilizadas en el stack <br> - Considerar futuro muro principal para mostrar updates de proyectos |


**Historia de Usuario 3: Perfil público y red social**
| Campo | Detalle |
|-------|---------|
| **Título** | Exhibición profesional de stack y proyectos |
| **Como** | Desarrollador o estudiante |
| **Quiero** | Que mi perfil sea público y tenga su propia URL, pudiendo compartir mi stack y proyectos en redes sociales |
| **Para que** | Otros profesionales puedan ver mi experiencia, seguir mi progreso y conectar conmigo |
| **Criterios de Aceptación** | - Perfil con URL pública personalizable <br> - Opciones para hacer público o privado el stack y los proyectos <br> - Compartición de perfil y proyectos en redes sociales mediante botones directos <br> - Visualización clara de followers y following en el perfil |
| **Notas Adicionales** | - Interfaz del perfil tipo feed profesional <br> - Considerar futuras interacciones como comentarios o likes en el muro principal |

---

## 6. Tickets de Trabajo

**Ticket 1: Backend (Gestión de Stack)**
| Campo | Detalle |
|-------|---------|
| **Título** | API para gestión de herramientas en el stack |
| **Descripción** | Implementar los endpoints REST necesarios para crear, actualizar, eliminar y listar herramientas dentro de cajas del stack. Manejar favoritos y filtros por tags. |
| **Tipo** | Backend |
| **Historia de Usuario Relacionada** | Gestión de Stack Personal |
| **Tareas Técnicas** | - Crear rutas REST en Express: GET /tools, POST /tools, PUT /tools/:id, DELETE /tools/:id <br> - Implementar autenticación JWT <br> - Validar datos de entrada <br> - Conectar con Prisma y PostgreSQL <br> - Implementar lógica para favoritos y filtrado por tags |
| **Criterios de Aceptación** | - Endpoints funcionales y protegidos por JWT <br> - Datos correctamente persistidos en la base de datos <br> - Manejo de errores y respuestas adecuadas <br> - Soporte para usuarios registrados y no registrados según funcionalidad |
| **Notas Adicionales** | Usar middleware para manejo de errores y validaciones. Mantener estructura modular de controladores y servicios. |


**Ticket 2: Frontend (Portfolio de Proyectos)**
| Campo | Detalle |
|-------|---------|
| **Título** | Interfaz de gestión de portfolio de proyectos |
| **Descripción** | Crear componentes React para permitir a los usuarios crear, editar y visualizar proyectos en su portfolio, mostrando estado, herramientas asociadas y descripción. |
| **Tipo** | Frontend |
| **Historia de Usuario Relacionada** | Gestión de Portfolio de Proyectos |
| **Tareas Técnicas** | - Crear formulario de creación y edición de proyectos <br> - Mostrar lista de proyectos con estado y herramientas <br> - Implementar consumo de API REST para CRUD de proyectos <br> - Manejar validaciones y feedback de usuario <br> - Integrar con estado global (context o store) |
| **Criterios de Aceptación** | - Componentes funcionales y responsive <br> - Visualización clara del estado y herramientas asociadas <br> - Validaciones de formulario correctamente implementadas <br> - Comunicación correcta con backend |
| **Notas Adicionales** | Usar librerías existentes (TailwindCSS, shadcn) para mantener consistencia visual y UX profesional. |


**Ticket 3: Base de Datos (Modelo de Datos)**
| Campo | Detalle |
|-------|---------|
| **Título** | Modelado de la base de datos con Prisma y PostgreSQL |
| **Descripción** | Diseñar y crear el esquema de base de datos para usuarios, cajas, herramientas, proyectos y favoritos, incluyendo relaciones y restricciones. |
| **Tipo** | Base de Datos |
| **Historia de Usuario Relacionada** | Todas las funcionalidades principales |
| **Tareas Técnicas** | - Definir modelos en Prisma: User, Box, Tool, Project, Favorite <br> - Establecer relaciones: uno a muchos y muchos a muchos <br> - Crear migraciones para PostgreSQL <br> - Configurar indices, constraints y claves únicas <br> - Preparar datos de prueba (seed) |
| **Criterios de Aceptación** | - Esquema funcional y correctamente migrado en PostgreSQL <br> - Relaciones correctamente implementadas <br> - Permite todas las operaciones CRUD necesarias <br> - Compatible con Prisma y backend Express |
| **Notas Adicionales** | Mantener consistencia de nombres y tipos de datos, y documentar claramente el modelo para futuros desarrollos. |

---

## 7. Pull Requests

**Pull Request 1: Backend – Endpoints de Gestión de Herramientas**
| Campo | Detalle |
|-------|---------|
| **Título** | Implementación de endpoints REST para herramientas |
| **Descripción** | Se crearon los endpoints CRUD para las herramientas del stack: GET /tools, POST /tools, PUT /tools/:id, DELETE /tools/:id, con autenticación JWT y validación de datos. |
| **Autor** | Isabel Núñez de la Torre |
| **Fecha** | [Fecha de creación] |
| **Cambios Principales** | - Creación de rutas y controladores <br> - Validaciones de datos y manejo de errores <br> - Integración con Prisma y PostgreSQL <br> - Soporte para usuarios registrados y no registrados |
| **Criterios de Aceptación** | - Endpoints funcionales <br> - Datos correctamente persistidos <br> - Pruebas unitarias y de integración pasadas |
| **Notas Adicionales** | Se recomienda revisar la seguridad y consistencia de los datos antes de mergear en main. |

**Pull Request 2: Frontend – Interfaz de Portfolio de Proyectos**
| Campo | Detalle |
|-------|---------|
| **Título** | Componentes React para crear y visualizar proyectos |
| **Descripción** | Se implementaron los componentes para mostrar, crear y editar proyectos en el portfolio del usuario, integrando consumo de API REST, validaciones y estado global. |
| **Autor** | Isabel Núñez de la Torre |
| **Fecha** | [Fecha de creación] |
| **Cambios Principales** | - Formulario de creación y edición de proyectos <br> - Listado de proyectos con estado y herramientas asociadas <br> - Consumo de API REST y manejo de estado <br> - Integración con TailwindCSS y shadcn |
| **Criterios de Aceptación** | - Componentes funcionales y responsivos <br> - Validaciones correctas <br> - Comunicación efectiva con backend |
| **Notas Adicionales** | Se recomienda testear la UX en diferentes dispositivos antes de mergear. |


**Pull Request 3: Base de Datos – Modelo de Datos con Prisma**  
| Campo | Detalle |
|-------|---------|
| **Título** | Creación del esquema de base de datos con Prisma para Stacklio |
| **Descripción** | Se ha implementado el modelo de datos completo del MVP de Stacklio utilizando Prisma y PostgreSQL. Incluye los modelos principales: User, Box, Tool, Project y Favorite, con sus relaciones, restricciones y migraciones. Se han añadido datos de prueba (seed) para facilitar testing y desarrollo. |
| **Autor** | Isabel Núñez de la Torre |
| **Fecha** | [Fecha de creación] |
| **Cambios Principales** | - Definición de modelos y relaciones en Prisma <br> - Migraciones a PostgreSQL <br> - Implementación de constraints: PK, FK, unique, not null <br> - Datos de prueba (seed) para testing y desarrollo <br> - Documentación del esquema de la base de datos |
| **Criterios de Aceptación** | - Esquema migrado correctamente en PostgreSQL <br> - Relaciones entre tablas implementadas de forma coherente <br> - Operaciones CRUD soportadas para el MVP <br> - Seed funcional para pruebas |
| **Notas Adicionales** | Revisar consistencia de nombres, tipos de datos y relaciones antes de mergear. Considerar futuras ampliaciones para nuevas funcionalidades del MVP. |

## 8. Vision General del Proyecto MVP Stacklio

### **1. Checklist Detallado por Áreas**

## Frontend
- [ ] Configurar proyecto React + Vite: Crear proyecto base, instalar TailwindCSS y shadcn
- [ ] Crear estructura de carpetas y componentes: Organizar componentes: Stack, Project, Profile, Shared, Layout
- [ ] Implementar gestión de stack: Cajas de stack, drag & drop, favoritos, filtrado por tags
- [ ] Implementar portfolio de proyectos: CRUD de proyectos, visualización de estado y herramientas asociadas
- [ ] Implementar perfil de usuario: Mostrar datos de perfil, proyectos y stack, URL pública
- [ ] Integración con backend: Consumo de API REST, manejo de token JWT
- [ ] UI/UX y diseño: Optimización visual, compatibilidad responsive, feedback de usuario
- [ ] Toasts y mensajes de feedback: Mostrar errores, confirmaciones y estados de carga

## Backend
- [ ] Configurar proyecto Node.js + Express: Crear servidor base, rutas y middlewares
- [ ] Implementar autenticación JWT: Registro, login, protección de endpoints
- [ ] Implementar endpoints REST: CRUD de herramientas, proyectos, perfil, favoritos
- [ ] Validación y manejo de errores: Validar datos, devolver códigos HTTP adecuados

## Base de Datos
- [ ] Configurar PostgreSQL con Prisma: Crear esquema, migraciones y seed
- [ ] Definir modelos y relaciones: User, Box, Tool, Project, Favorite
- [ ] Test de integridad de datos: Comprobar FK, constraints, operaciones CRUD

## DevOps / Infraestructura
- [ ] Configurar repositorio GitHub: Branches main y develop, PR workflow
- [ ] Despliegue Frontend: Vercel gratuito, variables de entorno
- [ ] Despliegue Backend: Render o Railway, configurar base de datos
- [ ] Despliegue Base de Datos: Supabase o Railway, conectar al backend
- [ ] Configuración HTTPS y seguridad básica: Variables de entorno, CORS, JWT

## Testing
- [ ] Tests unitarios frontend: React Testing Library / Jest
- [ ] Tests unitarios backend: Jest / Supertest
- [ ] Tests integración API: Endpoints principales (tools, projects, auth)
- [ ] Pruebas funcionales: Drag & drop, filtros, favoritos, perfil público


### **2. Roadmap / Gantt del MVP**
```mermaid
gantt
    title Roadmap MVP Stacklio
    dateFormat  YYYY-MM-DD
    section Frontend
    Configuración inicial          :done, 2025-09-17, 1d
    Estructura de componentes      :done, 2025-09-18, 1d
    Gestión de stack               :active, 2025-09-19, 5d
    Portfolio de proyectos         :2025-09-24, 4d
    Perfil de usuario público      :2025-09-28, 3d
    Integración con backend        :2025-10-01, 3d
    UI/UX y diseño                 :2025-10-04, 3d

    section Backend
    Configuración inicial          :done, 2025-09-17, 1d
    Endpoints REST                 :2025-09-19, 5d
    Autenticación JWT              :2025-09-24, 3d
    Validación y manejo de errores :2025-09-27, 3d

    section Base de Datos
    Configuración PostgreSQL+Prisma :done, 2025-09-17, 1d
    Modelado y relaciones           :2025-09-19, 3d
    Migraciones y seed              :2025-09-22, 2d

    section DevOps
    Configuración repositorio       :done, 2025-09-17, 1d
    Despliegue frontend             :2025-09-25, 2d
    Despliegue backend              :2025-09-27, 2d
    Despliegue BBDD                 :2025-09-29, 2d
    Configuración seguridad         :2025-10-01, 2d

    section Testing
    Tests unitarios frontend        :2025-10-03, 2d
    Tests unitarios backend         :2025-10-05, 2d
    Tests integración API           :2025-10-07, 2d
    Pruebas funcionales             :2025-10-09, 3d
```

### **3. Diagrama de Secuencia – Usuario Registrado**

```mermaid
sequenceDiagram
    participant User as Usuario Registrado
    participant Front as Frontend
    participant Back as Backend
    participant DB as PostgreSQL+Prisma

    User->>Front: Login
    Front->>Back: POST /login
    Back->>DB: Validar credenciales
    DB-->>Back: Resultado
    Back-->>Front: JWT + datos usuario
    Front-->>User: Acceso al panel principal

    User->>Front: Gestiona stack, proyectos, favoritos
    Front->>Back: CRUD endpoints
    Back->>DB: Persiste cambios
    DB-->>Back: Confirma
    Back-->>Front: Actualiza UI
```

### **4. Diagrama de Secuencia – Usuario No Registrado**

```mermaid
sequenceDiagram
    participant User as Usuario No Registrado
    participant Front as Frontend
    participant Back as Backend
    participant DB as PostgreSQL+Prisma

    User->>Front: Accede a la aplicación
    Front-->>User: Muestra vista de prueba del stack y proyectos
    User->>Front: Interactúa con herramientas o proyectos de prueba
    Front->>Back: Solicita datos de prueba (GET /tools, GET /projects)
    Back->>DB: Consulta herramientas y proyectos de prueba
    DB-->>Back: Devuelve datos
    Back-->>Front: Entrega datos de prueba
    Front-->>User: Muestra datos interactivos pero sin guardar cambios

    User->>Front: Intenta añadir favorito o crear proyecto
    Front-->>User: Solicita registro/login
```

### **5. Diagrama de Arquitectura de Alto Nivel**
```mermaid
graph TD
    subgraph Frontend
        F1[React + Vite + TailwindCSS + shadcn]
    end

    subgraph Backend
        B1[Node.js + Express]
        B2[JWT Auth]
    end

    subgraph Database
        DB1[PostgreSQL + Prisma]
    end

    F1 -->|REST API| B1
    B1 -->|CRUD / Autenticación| DB1
    B1 -->|JWT Token| F1
```
