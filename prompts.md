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

> **Nota**: Esta sección debe generar contenido para las subsecciones 1.1, 1.2, 1.3 y 1.4 del README según lo requerido.

**Prompt 1: Generar el objetivo del producto (Subsección 1.1)**

# Rol

Eres un Product Manager Senior especializado en productos SaaS para el sector salud veterinaria con más de 10 años de experiencia en definición de productos y análisis de mercado.

## Contexto del Proyecto

Estás documentando el objetivo del producto **VetConnect** @readme.md, una plataforma digital integral diseñada para centralizar y gestionar toda la información relacionada con la salud de las mascotas.

## Tarea Principal

Genera una descripción clara y concisa del objetivo del producto VetConnect que incluya:

### Estructura requerida:

1. **Propósito principal**: Define claramente qué busca resolver el producto (1-2 párrafos)
2. **Valor aportado por tipo de usuario**: 
   - Para dueños de mascotas
   - Para clínicas veterinarias pequeñas
3. **Problema específico que soluciona**: Referencia el problema central identificado (pérdida de historial, falta de portales en clínicas pequeñas)
4. **Público objetivo**: Define los tres segmentos principales de usuarios

### Criterios de calidad:

- Extensión total: 200-300 palabras
- Tono profesional pero accesible
- Basado en el análisis de sistemas veterinarios realizado
- Enfocado en clínicas pequeñas (1-3 veterinarios)
- Destaca la centralización como solución principal

### Formato de salida:

```markdown
### **1.1. Objetivo:**

[Contenido generado según estructura requerida]
```

---

**Prompt 2: Generar características y funcionalidades principales (Subsección 1.2)**

# Rol

Eres un Product Manager Senior especializado en productos SaaS para el sector salud veterinaria con experiencia en documentación técnica de productos.

## Contexto del Proyecto

Estás documentando las características y funcionalidades principales de **VetConnect** @readme.md, basándote en el análisis de sistemas veterinarios y el flujo E2E definido para el MVP.

**Flujo E2E del sistema**:
1. **Onboarding**: Registro del dueño y creación del perfil de la mascota
2. **Agendamiento**: Búsqueda de servicio (ej. Vacunación) y selección de horario
3. **Cita**: Registro de notas por parte del veterinario
4. **Repositorio**: Carga de documentos/resultados de la cita
5. **Recordatorio**: Notificación automática de la próxima dosis

## Tarea Principal

Genera una descripción detallada de las características principales de VetConnect que cubre el flujo E2E completo. Para cada característica incluye:

### Estructura requerida por característica:

- **Título descriptivo**: Nombre claro de la funcionalidad
- **Descripción**: Qué es, qué hace y por qué es importante (50-100 palabras)
- **Casos de uso**: Escenarios reales de aplicación
- **Relación con el flujo E2E**: En qué etapa(s) se utiliza
- **Prioridad**: Alta/Media/Baja según criticidad para el MVP

### Características mínimas a incluir:

1. Gestión de Citas y Calendario
2. Historias Clínicas Digitales (HCE)
3. Portal del Cliente para Dueños
4. Comunicación Automatizada (SMS/email)
5. Gestión de Vacunaciones y Recordatorios
6. Repositorio de Documentos
7-10. [Otras funcionalidades relevantes para el MVP]

### Criterios de calidad:

- Mínimo 8-10 características principales
- Cada descripción entre 50-100 palabras
- Cubrir todas las etapas del flujo E2E
- Enfoque en clínicas pequeñas (1-3 veterinarios)
- Basado en el análisis de sistemas veterinarios

### Formato de salida:

```markdown
### **1.2. Características y funcionalidades principales:**

#### 1.2.1. [Nombre de la característica]

**Descripción**: [Contenido]

**Casos de uso**:
- [Caso de uso 1]
- [Caso de uso 2]
[...]

**Priorización**: 🔴 **ALTA** / 🟡 **MEDIA** / 🟢 **BAJA**

---

[Repetir para cada característica]
```

---


**Prompt 3: Generar documentación de diseño y experiencia de usuario (Subsección 1.3) e instrucciones de instalación (Subsección 1.4)**

# Rol

Eres un UX Writer y Technical Writer especializado en documentación de productos SaaS.

## Contexto del Proyecto

Estás documentando las subsecciones 1.3 (Diseño y experiencia de usuario) y 1.4 (Instrucciones de instalación) para **VetConnect** @readme.md.

## Tarea Principal

### Parte 1: Diseño y experiencia de usuario (1.3)

Proporciona una descripción detallada de la experiencia del usuario que cubra:

1. **Journey del usuario desde el aterrizaje**: Describe el flujo visual y de navegación
2. **Pantallas principales**: Lista las vistas/pantallas clave del sistema
3. **Interacciones principales**: Cómo el usuario navega por las funcionalidades
4. **Principios de diseño aplicados**: Mobile-first, accesibilidad, simplicidad

**Nota**: Si existen imágenes o videotutoriales, indicar dónde incluirlos y qué deben mostrar.

### Parte 2: Instrucciones de instalación (1.4)

Documenta de manera precisa y secuencial las instrucciones para instalar y poner en marcha el proyecto en local, incluyendo:

1. **Prerequisitos**: Versiones de Ruby, Rails, PostgreSQL, Node.js, etc.
2. **Clonación del repositorio**: Comando git y configuración inicial
3. **Instalación de dependencias**: 
   - Backend (bundle install)
   - Frontend (yarn install o npm install)
4. **Configuración de base de datos**: 
   - Creación de database.yml
   - Variables de entorno necesarias (.env.example)
   - Creación de bases de datos
5. **Migraciones y seeds**: Comandos para poblar la base de datos
6. **Inicio del servidor**: 
   - Servidor Rails
   - Sidekiq (si aplica)
   - Frontend (si aplica)
7. **Verificación**: Cómo verificar que todo funciona correctamente
8. **Troubleshooting común**: Problemas típicos y soluciones

### Criterios de calidad:

- Instrucciones claras y ejecutables paso a paso
- Comandos listos para copiar y pegar
- Indicar qué resultado esperar en cada paso
- Formato profesional y fácil de seguir
- Advertencias sobre errores comunes

### Formato de salida:

```markdown
### **1.3. Diseño y experiencia de usuario:**

[Descripción del journey del usuario, pantallas principales, interacciones]

> **Nota**: Incluir imágenes/videos mostrando:
> - Landing page y onboarding
> - Dashboard principal
> - Flujo de agendamiento de citas
> - [Otras pantallas clave]

---

### **1.4. Instrucciones de instalación:**

#### Prerequisitos

[Lista de prerequisitos con versiones]

#### 1. Clonar el repositorio

\```bash
[Comandos]
\```

#### 2. Instalar dependencias

[Comandos paso a paso]

[Continuar con todos los pasos...]
```

---

## 2. Arquitectura del Sistema

> **Nota**: Esta sección debe generar contenido para las subsecciones 2.1, 2.2, 2.3, 2.4, 2.5 y 2.6 del README según lo requerido.

### **2.1. Diagrama de arquitectura:**

**Prompt 1: Generar diagrama de arquitectura y justificación**

# Rol y Contexto

Eres un Arquitecto de Software Senior especializado en aplicaciones Ruby on Rails con más de 8 años de experiencia en diseño de arquitecturas escalables para aplicaciones web SaaS.

## Contexto del Proyecto

Estás trabajando en el diseño arquitectónico de **VetConnect** @readme.md, una plataforma digital integral diseñada para centralizar y gestionar toda la información relacionada con la salud de las mascotas.

## Tarea Principal

Genera un diagrama de arquitectura completo que muestre:

### Componentes a incluir:

1. **Capa de presentación**: Aplicación web responsive (Rails views con Hotwire/Stimulus)
2. **Capa de aplicación**: Backend API REST (Ruby on Rails)
3. **Capa de datos**: PostgreSQL
4. **Background jobs**: Sidekiq con Redis
5. **Almacenamiento**: AWS S3 o similar para documentos
6. **Servicios externos**: SMS (Twilio), Email (SendGrid/Mailgun)
7. **Monitoreo**: Herramientas de logging y monitoreo

### Formato de entrega:

1. **Diagrama en PlantUML** mostrando:
   - Componentes principales del sistema
   - Flujos de datos entre componentes
   - Servicios externos integrados
   - Capas de la aplicación (presentación, lógica de negocio, datos)

2. **Justificación de decisiones de diseño**:
   - Por qué arquitectura monolítica modular (vs microservicios)
   - Elección de tecnologías (Ruby on Rails, PostgreSQL, Sidekiq)
   - Patrones de diseño aplicados
   - Consideraciones de escalabilidad y mantenibilidad
   - Sacrificios o déficits que implica esta arquitectura

3. **Beneficios principales**:
   - Qué aporta esta arquitectura al proyecto
   - Cómo soporta los requisitos no funcionales (disponibilidad 99.5%, response time < 2s)

### Criterios de calidad:

- Diagrama claro y legible en PlantUML
- Justificación técnica sólida (200-300 palabras)
- Balance entre complejidad y pragmatismo para un MVP
- Enfoque en clínicas pequeñas (1-3 veterinarios)

### Formato de salida:

```markdown
### **2.1. Diagrama de arquitectura:**

\```plantuml
[Código PlantUML del diagrama]
\```

#### Justificación de la arquitectura

[Explicación de por qué se eligió esta arquitectura]

#### Patrones aplicados

[Patrones de diseño utilizados]

#### Beneficios principales

- [Beneficio 1]
- [Beneficio 2]
[...]

#### Sacrificios y consideraciones

- [Limitación 1]
- [Limitación 2]
[...]
```


### **2.2. Descripción de componentes principales:**

**Prompt 1: Descripción detallada de componentes principales del sistema**

# Rol y Contexto

Eres un Arquitecto de Software Senior especializado en Ruby on Rails con experiencia en diseño de componentes modulares y separación de responsabilidades.

## Contexto del Proyecto

Estás trabajando en la documentación de componentes de **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas construida con Ruby on Rails.

## Tarea Principal

Describe detalladamente los componentes principales del sistema VetConnect, incluyendo:

### Componentes a documentar:

1. **Capa de Presentación (Frontend)**:
   - Tecnología utilizada (Rails views, Hotwire, Stimulus)
   - Responsabilidades y funcionalidades

2. **Capa de Aplicación (Backend)**:
   - Ruby on Rails API
   - Controladores principales
   - Service Objects para lógica de negocio

3. **Módulo de Autenticación y Autorización**:
   - Tecnología (Devise, Pundit)
   - Roles y permisos

4. **Módulo de Gestión de Citas**:
   - Modelos principales
   - Lógica de negocio

5. **Módulo de Historias Clínicas**:
   - Estructura de datos
   - Gestión de documentos

6. **Sistema de Notificaciones**:
   - Background jobs (Sidekiq)
   - Integraciones externas (SMS, Email)

7. **Almacenamiento de Archivos**:
   - Active Storage
   - Integración con S3

8. **Base de Datos**:
   - PostgreSQL
   - Estrategia de índices

### Para cada componente incluir:

- **Descripción**: Qué es y qué hace
- **Tecnología utilizada**: Frameworks, gems, servicios
- **Responsabilidades específicas**: Qué funcionalidades implementa
- **Interacciones**: Con qué otros componentes se comunica

### Criterios de calidad:

- Descripciones concisas (50-100 palabras por componente)
- Mención específica de tecnologías utilizadas
- Enfoque en los componentes más relevantes (mínimo 6-8 componentes)
- Claridad técnica apropiada para desarrolladores

### Formato de salida:

```markdown
### **2.2. Descripción de componentes principales:**

#### 1. [Nombre del componente]

**Descripción**: [Qué es y qué hace]

**Tecnología**: [Framework, gems, servicios utilizados]

**Responsabilidades**:
- [Responsabilidad 1]
- [Responsabilidad 2]

**Interacciones**: [Con qué componentes se comunica]

---

[Repetir para cada componente]
```


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1: Estructura del proyecto y organización de archivos**

# Rol y Contexto

Eres un Arquitecto de Software Senior especializado en Ruby on Rails con experiencia en organización de proyectos y convenciones de Rails.

## Contexto del Proyecto

Estás documentando la estructura de alto nivel del proyecto **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas construida con Ruby on Rails.

## Tarea Principal

Describe la estructura del proyecto y la organización de archivos, incluyendo:

### Estructura a documentar:

1. **Diagrama de estructura de directorios** en formato árbol (texto)
2. **Descripción de cada directorio principal**:
   - `app/` (controllers, models, views, jobs, services, etc.)
   - `config/` (routes, database, environments)
   - `db/` (migrations, seeds, schema)
   - `lib/` (custom libraries, tasks)
   - `test/` o `spec/` (tests)
   - Otros directorios relevantes

3. **Patrones y convenciones**:
   - Organización modular (si aplica)
   - Service Objects
   - Políticas de autorización
   - Query Objects

4. **Justificación**:
   - Por qué esta organización
   - Qué beneficios aporta
   - Cómo soporta escalabilidad

### Criterios de calidad:

- Diagrama de árbol claro y legible
- Descripción de propósito de cada directorio (30-50 palabras)
- Mencionar convenciones específicas del proyecto
- Total 200-400 palabras

### Formato de salida:

```markdown
### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

#### Estructura del proyecto

\```
vetconnect/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── services/
│   ├── jobs/
│   └── ...
├── config/
├── db/
├── lib/
└── ...
\```

#### Descripción de directorios principales

**`app/`**: [Descripción]

**`config/`**: [Descripción]

[Continuar con cada directorio...]

#### Patrones y convenciones

[Descripción de patrones aplicados]

#### Justificación

[Por qué esta organización, beneficios, cómo soporta mantenibilidad y escalabilidad]
```


### **2.4. Infraestructura y despliegue**

**Prompt 1: Infraestructura y proceso de despliegue**

# Rol y Contexto

Eres un DevOps Engineer Senior especializado en deployment de aplicaciones Ruby on Rails con experiencia en plataformas cloud y CI/CD.

## Contexto del Proyecto

Estás documentando la infraestructura y el proceso de despliegue de **VetConnect** @readme.md, una plataforma SaaS para gestión de salud de mascotas.

## Tarea Principal

Documenta la infraestructura del proyecto y explica el proceso de despliegue:

### Componentes a documentar:

1. **Diagrama de infraestructura** (formato PlantUML o texto descriptivo):
   - Servidores de aplicación
   - Base de datos PostgreSQL
   - Redis para Sidekiq
   - Almacenamiento S3
   - CDN
   - Servicios de monitoreo

2. **Plataforma de hosting**:
   - Heroku, AWS, DigitalOcean, u otra
   - Justificación de la elección
   - Configuración de servicios

3. **Proceso de deployment**:
   - Pipeline CI/CD (GitHub Actions, GitLab CI, etc.)
   - Pasos del proceso de deployment
   - Estrategia de branching (Git Flow, GitHub Flow)
   - Testing antes de deployment
   - Zero-downtime deployments
   - Estrategia de rollback

4. **Gestión de configuración**:
   - Variables de entorno
   - Secrets management
   - Configuración por ambiente (dev, staging, prod)

### Criterios de calidad:

- Diagrama claro de la infraestructura
- Descripción del proceso de deployment paso a paso
- Mencionar herramientas específicas utilizadas
- Total 300-500 palabras

### Formato de salida:

```markdown
### **2.4. Infraestructura y despliegue**

#### Diagrama de infraestructura

\```plantuml
[Código PlantUML o descripción textual]
\```

#### Plataforma de hosting

[Descripción de la plataforma elegida y justificación]

#### Proceso de deployment

**Pipeline CI/CD**:
1. [Paso 1]
2. [Paso 2]
[...]

**Estrategia de branching**: [Descripción]

**Testing**: [Cómo se ejecutan los tests antes del deployment]

**Deployment**: [Proceso de deployment paso a paso]

**Rollback**: [Cómo realizar rollback si es necesario]
```


### **2.5. Seguridad**

**Prompt 1: Prácticas de seguridad implementadas**

# Rol y Contexto

Eres un Security Engineer Senior especializado en aplicaciones Ruby on Rails con experiencia en protección de datos de salud y cumplimiento normativo.

## Contexto del Proyecto

Estás documentando las prácticas de seguridad implementadas en **VetConnect** @readme.md, una plataforma SaaS que maneja información sensible de salud animal.

## Tarea Principal

Enumera y describe las prácticas de seguridad principales implementadas en el proyecto:

### Áreas de seguridad a cubrir:

1. **Autenticación y Autorización**:
   - Sistema de autenticación (Devise o similar)
   - Password policies
   - Autorización basada en roles (Pundit)
   - Gestión de sesiones

2. **Protección de Datos**:
   - Encriptación en tránsito (HTTPS/TLS)
   - Encriptación en reposo (base de datos)
   - Gestión de secrets y API keys
   - Variables de entorno

3. **Protección contra Ataques Comunes**:
   - SQL injection (ActiveRecord)
   - XSS protection
   - CSRF protection
   - Mass assignment protection (strong parameters)
   - Validación de uploads de archivos

4. **Validación de Entrada**:
   - Strong parameters en controllers
   - Validaciones en modelos
   - Sanitización de input

5. **Rate Limiting**:
   - Protección contra brute force
   - Throttling de APIs
   - Rack::Attack

6. **Logging y Auditoría** (opcional):
   - Logging de acciones sensibles
   - Auditoría de cambios

### Criterios de calidad:

- Mínimo 6-8 prácticas de seguridad documentadas
- Incluir ejemplos de código cuando sea relevante
- Mencionar herramientas o gems específicas utilizadas
- Total 300-500 palabras

### Formato de salida:

```markdown
### **2.5. Seguridad**

#### 1. Autenticación y Autorización

[Descripción de la implementación]

**Tecnologías**: [Devise, Pundit, etc.]

**Ejemplo**:
\```ruby
[Código ejemplo si aplica]
\```

---

#### 2. Protección de Datos

[Descripción]

[Continuar con cada práctica...]
```

---

### **2.6. Tests**

**Prompt 1: Descripción de la estrategia de testing**

# Rol y Contexto

Eres un QA Engineer Senior especializado en Ruby on Rails con experiencia en testing automatizado y TDD/BDD.

## Contexto del Proyecto

Estás documentando la estrategia de testing de **VetConnect** @readme.md, una plataforma SaaS para gestión de salud de mascotas.

## Tarea Principal

Describe brevemente algunos de los tests realizados en el proyecto:

### Tipos de tests a documentar:

1. **Tests Unitarios** (modelos):
   - Validaciones
   - Métodos de instancia
   - Scopes
   - Ejemplos concretos

2. **Tests de Controladores**:
   - Acciones CRUD
   - Autorización
   - Ejemplos concretos

3. **Tests de Integración**:
   - Flujos end-to-end
   - Ejemplos concretos

4. **Tests de Servicios/Jobs** (si aplica):
   - Background jobs
   - Service objects
   - Ejemplos concretos

### Para cada tipo incluir:

- **Framework utilizado**: RSpec, Minitest, etc.
- **Herramientas adicionales**: FactoryBot, Faker, etc.
- **Ejemplos de tests específicos**: 2-3 ejemplos concretos con descripción breve
- **Cobertura**: Mencionar porcentaje de cobertura si está disponible

### Criterios de calidad:

- Descripción concisa de la estrategia (200-300 palabras)
- Ejemplos concretos de tests
- Mencionar herramientas utilizadas
- Opcional: snippets de código de tests relevantes

### Formato de salida:

```markdown
### **2.6. Tests**

#### Estrategia de testing

[Descripción general de la estrategia]

**Framework**: [RSpec/Minitest]

**Herramientas**: [FactoryBot, Faker, etc.]

#### Tests Unitarios

[Descripción breve]

**Ejemplos**:
- Test de validación de modelo Pet
- Test de método de cálculo de próxima vacunación
[...]

#### Tests de Controladores

[Descripción breve]

**Ejemplos**:
- Test de creación de cita con autorización
- Test de listado de mascotas por dueño
[...]

#### Tests de Integración

[Descripción breve]

**Ejemplos**:
- Test de flujo completo de agendamiento de cita
- Test de registro de consulta con documentos
[...]

#### Cobertura

[Porcentaje de cobertura si está disponible]
```

---

## 3. Modelo de Datos

> **Nota**: Esta sección debe generar contenido para las subsecciones 3.1 y 3.2 del README según lo requerido.

**Prompt 1: Generar diagrama del modelo de datos (Subsección 3.1)**

# Rol y Contexto

Eres un Arquitecto de Software Senior especializado en sistemas de gestión de salud con más de 8 años de experiencia en diseño de modelos de datos para aplicaciones Ruby on Rails.

## Contexto del Proyecto

Estás trabajando en el diseño del modelo de datos de **VetConnect** @readme.md, una plataforma digital integral diseñada para centralizar y gestionar toda la información relacionada con la salud de las mascotas.

## Tarea Principal

Diseña un modelo de datos robusto que soporte todas las funcionalidades del MVP de VetConnect.

### Entidades principales a incluir:

- **Users**: Dueños de mascotas, veterinarios, administradores
- **Pets**: Información de mascotas (perros, gatos, etc.)
- **Clinics**: Información de clínicas veterinarias
- **Appointments**: Citas programadas
- **MedicalRecords/Consultations**: Consultas y diagnósticos
- **Vaccinations**: Registro de vacunaciones
- **Documents**: Archivos médicos, resultados, certificados
- **Reminders**: Notificaciones programadas
- **Communications**: Historial de mensajes enviados

### Para cada entidad especificar en el diagrama:

- **Atributos principales**: Nombres y tipos de datos
- **Claves primarias**: `id` (integer, PK)
- **Claves foráneas**: Relaciones con otras tablas
- **Índices importantes**: Para optimización de queries
- **Restricciones**: unique, not null según corresponda

### Formato de entrega:

1. **Diagrama ER en Mermaid** con:
   - Todas las entidades y sus atributos principales
   - Relaciones con cardinalidad (1:1, 1:N, N:M)
   - Claves primarias (PK) y foráneas (FK)
   - Tipos de datos de cada campo

**Recomendación**: Usa la sintaxis completa de Mermaid para el modelo de datos, incluyendo todos los parámetros disponibles (tipos, claves, restricciones).

### Criterios de calidad:

- Diagrama completo que cubra todas las funcionalidades del MVP
- Relaciones claramente definidas con cardinalidad
- Tipos de datos precisos para cada atributo
- Balance entre normalización y performance
- Incluir campos de auditoría (created_at, updated_at)

### Formato de salida:

```markdown
### **3.1. Diagrama del modelo de datos:**

\```mermaid
erDiagram
    USERS {
        integer id PK
        string email UK
        string encrypted_password
        string role
        datetime created_at
        datetime updated_at
    }
    
    PETS {
        integer id PK
        integer user_id FK
        string name
        string species
        date birth_date
        datetime created_at
        datetime updated_at
    }
    
    [Continuar con todas las entidades...]
    
    USERS ||--o{ PETS : "owns"
    PETS ||--o{ APPOINTMENTS : "has"
    [Continuar con todas las relaciones...]
\```
```

---

**Prompt 2: Generar descripción de entidades principales (Subsección 3.2)**

# Rol y Contexto

Eres un Arquitecto de Software Senior especializado en Ruby on Rails con experiencia en diseño de modelos de datos y documentación técnica.

## Contexto del Proyecto

Estás documentando las entidades principales del modelo de datos de **VetConnect** @readme.md.

## Tarea Principal

Describe detalladamente las entidades principales del sistema VetConnect.

### Para cada entidad incluir:

1. **Nombre de la entidad**
2. **Descripción breve**: Qué representa (1-2 frases)
3. **Atributos**:
   - Nombre del atributo
   - Tipo de dato (string, integer, text, date, datetime, boolean, decimal, json, etc.)
   - Restricciones (NOT NULL, UNIQUE, DEFAULT, etc.)
   - Descripción breve si es necesario
4. **Claves primarias**: id (integer, PK, auto-increment)
5. **Claves foráneas**: Relaciones con otras tablas
6. **Relaciones**:
   - Tipo de relación (1:1, 1:N, N:M)
   - Nombre de la relación en Rails (has_many, belongs_to, has_one, has_and_belongs_to_many)
7. **Índices importantes**: Campos indexados para optimización
8. **Restricciones adicionales**: Validaciones a nivel de base de datos

### Entidades mínimas a documentar:

1. Users
2. Pets
3. Clinics
4. Veterinarians/ClinicStaff
5. Appointments
6. MedicalRecords/Consultations
7. Vaccinations
8. Documents
9. Reminders
10. Communications (opcional)

### Criterios de calidad:

- Descripción completa y precisa de cada entidad
- Todos los atributos con sus tipos y restricciones
- Relaciones claramente definidas
- Mencionar índices para performance
- Total 800-1200 palabras

### Formato de salida:

```markdown
### **3.2. Descripción de entidades principales:**

#### 1. Users

**Descripción**: [Qué representa]

**Atributos**:
- `id` (integer, PK): Identificador único
- `email` (string, NOT NULL, UNIQUE): Email del usuario
- `encrypted_password` (string, NOT NULL): Contraseña encriptada
- `role` (string, NOT NULL): Rol (owner, veterinarian, admin)
- `first_name` (string): Nombre
- `last_name` (string): Apellido
- `phone` (string): Teléfono
- `created_at` (datetime): Fecha de creación
- `updated_at` (datetime): Fecha de última actualización

**Relaciones**:
- `has_many :pets` (1:N) - Un usuario puede tener múltiples mascotas
- `has_many :appointments, through: :pets` (1:N indirecta)

**Índices**:
- `email` (UNIQUE)
- `role`

**Restricciones**:
- Email debe ser único y válido
- Role debe ser uno de: owner, veterinarian, admin

---

[Continuar con todas las entidades...]
```

---

## 4. Especificación de la API

> **Nota**: Esta sección debe documentar máximo 3 endpoints principales en formato OpenAPI.

**Prompt 1: Especificación de endpoints principales de la API**

# Rol y Contexto

Eres un API Architect Senior especializado en diseño de APIs RESTful para aplicaciones Ruby on Rails con experiencia en documentación OpenAPI/Swagger.

## Contexto del Proyecto

Estás documentando la API de **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas.

## Tarea Principal

Documenta los 3 endpoints principales de la API en formato OpenAPI 3.0, incluyendo ejemplos de petición y respuesta.

### Endpoints a documentar (elegir los 3 más relevantes):

1. **POST /api/v1/appointments** - Crear una cita
2. **GET /api/v1/pets/:id/medical_records** - Obtener historial médico de una mascota
3. **POST /api/v1/vaccinations** - Registrar una vacunación
4. **GET /api/v1/appointments** - Listar citas (con filtros)
5. **PUT /api/v1/appointments/:id** - Actualizar una cita

**Recomendación**: Selecciona los 3 endpoints que mejor representen la funcionalidad core del sistema.

### Para cada endpoint incluir:

1. **Especificación OpenAPI completa**:
   - Path y método HTTP
   - Descripción del endpoint
   - Parámetros (path, query, body)
   - Esquemas de request y response
   - Códigos de respuesta (200, 201, 400, 401, 404, 422, 500)
   - Headers de autenticación

2. **Ejemplo de petición**:
   - Headers
   - Body (JSON)

3. **Ejemplo de respuesta exitosa**:
   - Status code
   - Body (JSON)

4. **Ejemplo de respuesta de error** (opcional):
   - Status code
   - Body (JSON) con mensaje de error

### Criterios de calidad:

- Especificación OpenAPI 3.0 válida
- Ejemplos realistas y completos
- Documentación clara de cada campo
- Incluir validaciones y restricciones
- Mencionar autenticación requerida

### Formato de salida:

```markdown
## 4. Especificación de la API

### Endpoint 1: Crear una cita

\```yaml
openapi: 3.0.0
info:
  title: VetConnect API
  version: 1.0.0
paths:
  /api/v1/appointments:
    post:
      summary: Crear una nueva cita
      description: Permite a un dueño de mascota programar una cita con un veterinario
      tags:
        - Appointments
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - pet_id
                - veterinarian_id
                - appointment_date
                - reason
              properties:
                pet_id:
                  type: integer
                  description: ID de la mascota
                  example: 123
                veterinarian_id:
                  type: integer
                  description: ID del veterinario
                  example: 45
                appointment_date:
                  type: string
                  format: date-time
                  description: Fecha y hora de la cita
                  example: "2024-01-15T10:00:00Z"
                reason:
                  type: string
                  description: Motivo de la consulta
                  example: "Vacunación anual"
      responses:
        '201':
          description: Cita creada exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 456
                  pet_id:
                    type: integer
                    example: 123
                  veterinarian_id:
                    type: integer
                    example: 45
                  appointment_date:
                    type: string
                    format: date-time
                    example: "2024-01-15T10:00:00Z"
                  reason:
                    type: string
                    example: "Vacunación anual"
                  status:
                    type: string
                    example: "scheduled"
                  created_at:
                    type: string
                    format: date-time
                    example: "2024-01-10T14:30:00Z"
        '400':
          description: Datos inválidos
        '401':
          description: No autorizado
        '422':
          description: Error de validación
          
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
\```

**Ejemplo de petición:**

\```bash
curl -X POST https://api.vetconnect.com/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pet_id": 123,
    "veterinarian_id": 45,
    "appointment_date": "2024-01-15T10:00:00Z",
    "reason": "Vacunación anual"
  }'
\```

**Ejemplo de respuesta exitosa:**

\```json
{
  "id": 456,
  "pet_id": 123,
  "veterinarian_id": 45,
  "appointment_date": "2024-01-15T10:00:00Z",
  "reason": "Vacunación anual",
  "status": "scheduled",
  "created_at": "2024-01-10T14:30:00Z"
}
\```

---

[Repetir para los otros 2 endpoints...]
```

---

## 5. Historias de Usuario

> **Nota**: Esta sección debe documentar 3 de las historias de usuario principales utilizando buenas prácticas de producto.

**Prompt 1: Generar 3 historias de usuario principales**

# Rol y Contexto

Eres un Product Owner Senior con más de 8 años de experiencia en metodologías ágiles y definición de historias de usuario siguiendo el framework INVEST y buenas prácticas de producto.

## Contexto del Proyecto

Estás documentando las historias de usuario principales de **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas.

## Tarea Principal

Documenta 3 historias de usuario principales que representen las funcionalidades core del sistema, siguiendo las buenas prácticas de producto.

### Historias de usuario sugeridas (elegir 3):

1. Registro y creación de perfil de mascota (Onboarding)
2. Agendamiento de cita por parte del dueño
3. Registro de consulta veterinaria con documentos
4. Configuración de recordatorios automáticos de vacunación
5. Visualización de historial médico completo por el dueño

### Para cada historia incluir:

1. **Título**: Nombre descriptivo de la historia
2. **Historia de usuario** (formato estándar):
   - Como [tipo de usuario]
   - Quiero [acción/funcionalidad]
   - Para [beneficio/valor]
3. **Criterios de aceptación** (formato Given-When-Then):
   - Mínimo 3-5 criterios por historia
   - Específicos, medibles y testeables
4. **Prioridad**: Alta/Media/Baja (con justificación breve)
5. **Estimación**: Story points o talla de camiseta (S/M/L/XL)
6. **Notas adicionales** (opcional):
   - Dependencias
   - Consideraciones técnicas
   - Preguntas abiertas

### Criterios de calidad - Framework INVEST:

- ✅ **Independent**: Independiente de otras historias
- ✅ **Negotiable**: Abierta a discusión en detalles de implementación
- ✅ **Valuable**: Aporta valor claro al usuario
- ✅ **Estimable**: Se puede estimar su complejidad
- ✅ **Small**: Completable en un sprint
- ✅ **Testable**: Criterios de aceptación verificables

### Formato de salida:

```markdown
## 5. Historias de Usuario

### Historia de Usuario 1: [Título]

**Como** [tipo de usuario]  
**Quiero** [acción/funcionalidad]  
**Para** [beneficio/valor]

#### Criterios de Aceptación

1. **Given** [contexto inicial]  
   **When** [acción realizada]  
   **Then** [resultado esperado]

2. **Given** [contexto]  
   **When** [acción]  
   **Then** [resultado]

[Continuar con todos los criterios...]

#### Prioridad

🔴 **Alta** - [Justificación breve]

#### Estimación

**Puntos**: 5 puntos (o **Talla**: M)

#### Notas

- [Nota 1]
- [Nota 2]

---

### Historia de Usuario 2: [Título]

[Repetir estructura...]

---

### Historia de Usuario 3: [Título]

[Repetir estructura...]
```

---

## 6. Tickets de Trabajo

> **Nota**: Esta sección debe documentar 3 tickets de trabajo (1 de backend, 1 de frontend, 1 de bases de datos) con todo el detalle necesario para desarrollarlos de inicio a fin.

**Prompt 1: Generar 3 tickets de trabajo detallados**

# Rol y Contexto

Eres un Tech Lead Senior con más de 10 años de experiencia en Ruby on Rails y gestión de proyectos ágiles. Tienes experiencia en la creación de tickets de trabajo detallados que siguen las buenas prácticas de ingeniería de software.

## Contexto del Proyecto

Estás documentando tickets de trabajo para **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas construida con Ruby on Rails.

## Tarea Principal

Documenta 3 tickets de trabajo detallados (uno por cada capa tecnológica):

### Tickets a crear:

1. **Ticket de Backend**: Implementar endpoint para creación de citas
2. **Ticket de Frontend**: Desarrollar formulario de agendamiento de citas
3. **Ticket de Base de Datos**: Crear tablas y migraciones para el módulo de vacunaciones

### Para cada ticket incluir:

1. **Título**: Descriptivo y accionable
2. **Descripción**: 
   - Contexto del problema/necesidad
   - Qué se debe implementar
   - Por qué es necesario
3. **Criterios de aceptación**:
   - Lista específica y verificable (mínimo 4-6 criterios)
   - Incluir casos edge y manejo de errores
4. **Tareas técnicas** (checklist):
   - Pasos específicos de implementación
   - Orden de ejecución
   - Configuraciones necesarias
5. **Especificaciones técnicas**:
   - Tecnologías y herramientas a utilizar
   - Endpoints, modelos, controladores, vistas (según aplique)
   - Esquemas de base de datos (para ticket de DB)
   - Validaciones y restricciones
6. **Tests requeridos**:
   - Tests unitarios
   - Tests de integración
   - Casos a testear
7. **Dependencias**:
   - Otros tickets o tareas bloqueantes
   - Gems o librerías necesarias
8. **Estimación**: Horas o story points
9. **Notas adicionales**:
   - Consideraciones de seguridad
   - Consideraciones de performance
   - Links a documentación relevante

### Criterios de calidad:

- Información completa para implementar sin ambigüedades
- Tareas técnicas específicas y ejecutables
- Criterios de aceptación testeables
- Consideraciones de seguridad y performance
- Total 400-600 palabras por ticket

### Formato de salida:

```markdown
## 6. Tickets de Trabajo

### Ticket 1: [Backend] Implementar endpoint para creación de citas

**ID**: VETC-101  
**Tipo**: Backend  
**Prioridad**: Alta  
**Estimación**: 8 horas (5 story points)

#### Descripción

[Contexto del problema, qué implementar y por qué]

#### Criterios de Aceptación

- [ ] El endpoint POST /api/v1/appointments acepta los parámetros: pet_id, veterinarian_id, appointment_date, reason
- [ ] Se valida que el veterinario esté disponible en la fecha/hora solicitada
- [ ] Se crea un recordatorio automático 24h antes de la cita
- [ ] Se envía una notificación al dueño de la mascota
- [ ] Se retorna error 422 si los datos son inválidos
- [ ] Se requiere autenticación con JWT token

#### Tareas Técnicas

- [ ] Crear modelo Appointment con atributos necesarios
- [ ] Implementar AppointmentsController con acción create
- [ ] Crear servicio AppointmentCreator para lógica de negocio
- [ ] Implementar validación de disponibilidad del veterinario
- [ ] Configurar job de Sidekiq para recordatorios
- [ ] Implementar serializer para la respuesta JSON
- [ ] Agregar política de autorización con Pundit
- [ ] Documentar endpoint en OpenAPI

#### Especificaciones Técnicas

**Modelo: Appointment**
- Atributos: pet_id, veterinarian_id, clinic_id, appointment_date, reason, status, notes
- Validaciones: presence, date validations
- Relaciones: belongs_to :pet, :veterinarian, :clinic

**Controller: AppointmentsController**
- Acción: create
- Autenticación requerida
- Autorización con Pundit

**Servicio: AppointmentCreator**
- Input: appointment_params
- Output: appointment object o errores
- Lógica: validar disponibilidad, crear cita, programar recordatorio

**Job: AppointmentReminderJob**
- Scheduled 24h antes de la cita
- Envía notificación SMS/email

#### Tests Requeridos

**Tests Unitarios**:
- Validaciones del modelo Appointment
- Métodos del servicio AppointmentCreator
- Lógica de disponibilidad

**Tests de Integración**:
- POST /api/v1/appointments con datos válidos retorna 201
- POST con datos inválidos retorna 422 con errores
- POST sin autenticación retorna 401
- POST con horario no disponible retorna 422

**Tests de Jobs**:
- AppointmentReminderJob se programa correctamente
- Job envía notificación al ejecutarse

#### Dependencias

- Modelo User, Pet, Veterinarian, Clinic ya implementados
- Configuración de Sidekiq y Redis
- Gemas: devise, pundit, active_model_serializers

#### Notas

- **Seguridad**: Validar que el usuario solo puede crear citas para sus propias mascotas
- **Performance**: Indexar appointment_date para queries de disponibilidad
- **Documentación**: [Link a docs de Pundit](https://github.com/varvet/pundit)

---

### Ticket 2: [Frontend] Desarrollar formulario de agendamiento de citas

**ID**: VETC-102  
**Tipo**: Frontend  
**Prioridad**: Alta  
**Estimación**: 6 horas (3 story points)

#### Descripción

[Descripción completa del ticket de frontend...]

[Seguir la misma estructura...]

---

### Ticket 3: [Base de Datos] Crear tablas y migraciones para módulo de vacunaciones

**ID**: VETC-103  
**Tipo**: Base de Datos  
**Prioridad**: Alta  
**Estimación**: 4 horas (3 story points)

#### Descripción

[Descripción completa del ticket de base de datos...]

[Seguir la misma estructura, incluyendo esquemas SQL, índices, foreign keys, etc.]
```

---

## 7. Pull Requests

> **Nota**: Esta sección debe documentar 3 de las Pull Requests realizadas durante la ejecución del proyecto.

**Prompt 1: Generar documentación de 3 Pull Requests**

# Rol y Contexto

Eres un Senior Software Engineer con más de 10 años de experiencia en Ruby on Rails y mejores prácticas de Git y code review. Tienes experiencia en la creación de Pull Requests bien documentadas que facilitan el proceso de revisión.

## Contexto del Proyecto

Estás documentando Pull Requests realizadas durante el desarrollo de **VetConnect** @readme.md, una plataforma digital para gestión de salud de mascotas.

## Tarea Principal

Documenta 3 Pull Requests que representen diferentes tipos de cambios (feature, bugfix, refactor, etc.):

### Pull Requests sugeridas:

1. **Feature**: Implementación del módulo de agendamiento de citas
2. **Feature**: Implementación del sistema de recordatorios automáticos
3. **Bugfix**: Corrección de validación de disponibilidad de veterinarios
4. **Refactor**: Extracción de lógica de negocio a Service Objects
5. **Database**: Migraciones para módulo de vacunaciones

### Para cada Pull Request incluir:

1. **Título**: Descriptivo siguiendo convención (ej: "feat: implement appointment booking system")
2. **Descripción**:
   - Resumen de los cambios
   - Contexto y motivación
   - Tipo de cambio (feature, bugfix, refactor, docs, etc.)
3. **Cambios realizados** (lista):
   - Archivos nuevos o modificados principales
   - Funcionalidades añadidas/modificadas
   - Tests añadidos
4. **Relación con tickets**:
   - Issues o tickets relacionados (ej: "Closes #123")
5. **Testing**:
   - Cómo se probaron los cambios
   - Tests automatizados añadidos
   - Testing manual realizado
6. **Screenshots o demos** (si aplica):
   - Indicar qué screenshots serían relevantes
7. **Checklist de revisión**:
   - [ ] Tests pasando
   - [ ] Cobertura de código mantenida/mejorada
   - [ ] Documentación actualizada
   - [ ] Sin conflictos de merge
   - [ ] Code style consistente
8. **Reviewers**: @reviewer1, @reviewer2
9. **Notas adicionales**:
   - Breaking changes (si aplican)
   - Consideraciones de deployment
   - Dependencias con otras PRs

### Criterios de calidad:

- Descripción clara y completa
- Lista específica de cambios
- Contexto suficiente para el reviewer
- Evidencia de testing
- Total 300-500 palabras por PR

### Formato de salida:

```markdown
## 7. Pull Requests

### Pull Request 1: Implementación del módulo de agendamiento de citas

**Título**: `feat: implement appointment booking system`  
**Autor**: @developer  
**Fecha**: 2024-01-15  
**Estado**: ✅ Merged  
**Branch**: `feature/appointment-booking` → `main`

#### Descripción

Este PR implementa el módulo completo de agendamiento de citas para VetConnect, permitiendo a los dueños de mascotas programar citas con veterinarios de manera autónoma a través de la plataforma.

**Contexto**: Anteriormente, las citas solo podían ser creadas por el personal de la clínica. Esta funcionalidad permite a los usuarios finales (dueños) seleccionar horarios disponibles y agendar citas directamente, mejorando la experiencia de usuario y reduciendo la carga administrativa.

**Tipo de cambio**: ✨ Feature

#### Cambios Realizados

**Backend**:
- Creado modelo `Appointment` con validaciones y relaciones
- Implementado `AppointmentsController` con acciones CRUD
- Creado service object `AppointmentCreator` para lógica de negocio
- Implementado `AvailabilityChecker` para validar disponibilidad de veterinarios
- Agregada política de autorización `AppointmentPolicy` con Pundit
- Configurado `AppointmentReminderJob` para recordatorios automáticos

**Database**:
- Migración para tabla `appointments`
- Índices en `appointment_date` y `veterinarian_id`
- Foreign keys con constraints

**Tests**:
- Tests unitarios para modelo `Appointment` (validaciones, scopes)
- Tests de integración para endpoint POST `/api/v1/appointments`
- Tests para service object `AppointmentCreator`
- Tests para job `AppointmentReminderJob`
- Cobertura: 95%

**Archivos principales modificados**:
- `app/models/appointment.rb` (nuevo)
- `app/controllers/api/v1/appointments_controller.rb` (nuevo)
- `app/services/appointment_creator.rb` (nuevo)
- `app/services/availability_checker.rb` (nuevo)
- `app/policies/appointment_policy.rb` (nuevo)
- `app/jobs/appointment_reminder_job.rb` (nuevo)
- `db/migrate/20240115_create_appointments.rb` (nuevo)
- `config/routes.rb` (modificado)

#### Relación con Tickets

- Closes #45: Implementar agendamiento de citas
- Related to #67: Sistema de recordatorios

#### Testing

**Tests Automatizados**:
- ✅ 45 tests unitarios passing
- ✅ 12 tests de integración passing
- ✅ Cobertura de código: 95%

**Testing Manual**:
- ✅ Creación de cita con horario disponible funciona correctamente
- ✅ Validación de horario ocupado retorna error apropiado
- ✅ Recordatorio se programa correctamente 24h antes
- ✅ Autorización funciona: usuarios solo pueden crear citas para sus mascotas

**Comando para ejecutar tests**:
```bash
bundle exec rspec spec/models/appointment_spec.rb
bundle exec rspec spec/controllers/api/v1/appointments_controller_spec.rb
bundle exec rspec spec/services/appointment_creator_spec.rb
```

#### Screenshots

> **Nota**: Incluir screenshots de:
> - Formulario de agendamiento de citas
> - Validación de disponibilidad en acción
> - Confirmación de cita creada
> - Email/SMS de confirmación recibido

#### Checklist de Revisión

- [x] Tests pasando en CI/CD
- [x] Cobertura de código > 90%
- [x] Documentación actualizada (README, API docs)
- [x] Sin conflictos de merge
- [x] Code style consistente (Rubocop passing)
- [x] Migraciones reversibles
- [x] Seeds actualizados si necesario

#### Reviewers

@tech-lead @senior-dev

#### Notas Adicionales

**Consideraciones de Deployment**:
- Ejecutar migraciones antes de deployment: `rails db:migrate`
- Verificar que Redis esté configurado para Sidekiq
- Verificar variables de entorno para SMS/Email (Twilio, SendGrid)

**Breaking Changes**: Ninguno

**Dependencias**: Requiere que PR #43 (modelos Pet y Veterinarian) esté merged primero

---

### Pull Request 2: [Título]

[Seguir la misma estructura...]

---

### Pull Request 3: [Título]

[Seguir la misma estructura...]
```
