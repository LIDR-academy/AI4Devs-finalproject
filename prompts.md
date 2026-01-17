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

---

## 8. Desarrollo de Funcionalidades Core

> **Nota**: Esta sección contiene prompts técnicos para implementar las funcionalidades principales del MVP de manera progresiva.

### **8.1. Implementación del Sistema de Autenticación**

**Prompt 1: Configurar autenticación base con Devise**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en implementación de sistemas de autenticación seguros con más de 8 años de experiencia.

## Contexto del Proyecto

Estás implementando el sistema de autenticación para **VetConnect** @readme.md, una plataforma que maneja información sensible de salud de mascotas. El sistema debe soportar múltiples tipos de usuarios (dueños, veterinarios, administradores).

## Tarea Principal

Implementa un sistema de autenticación robusto usando Devise que incluya:

### Requerimientos funcionales:

1. **Instalación y configuración de Devise**:
   - Instalar gem Devise
   - Generar configuración inicial
   - Configurar mailer para confirmación de email
   - Configurar vistas personalizadas

2. **Modelo User con roles**:
   - Campos: email, encrypted_password, role (enum), first_name, last_name, phone
   - Roles: owner (dueño), veterinarian, admin
   - Validaciones apropiadas
   - Índices en email y role

3. **Funcionalidades de Devise a habilitar**:
   - :database_authenticatable
   - :registerable
   - :recoverable
   - :rememberable
   - :validatable
   - :confirmable (confirmación de email)
   - :trackable (rastreo de sign-ins)

4. **Autenticación de dos factores (opcional MVP)**:
   - Preparar estructura para añadir 2FA en futuro
   - Documentar cómo se agregaría

### Especificaciones técnicas:

```ruby
# Esquema esperado del modelo User
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :trackable

  enum role: { owner: 0, veterinarian: 1, admin: 2 }
  
  validates :email, presence: true, uniqueness: true
  validates :role, presence: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :phone, format: { with: /\A\+?[0-9\s\-()]+\z/ }, allow_blank: true
end
```

### Criterios de entrega:

- [ ] Gem Devise instalado y configurado
- [ ] Migración de tabla users creada y ejecutada
- [ ] Modelo User con validaciones y enum de roles
- [ ] Rutas de autenticación configuradas
- [ ] Vistas de Devise personalizadas con diseño de VetConnect
- [ ] Mailer configurado para emails de confirmación
- [ ] Tests unitarios para modelo User
- [ ] Tests de integración para flujo de registro/login
- [ ] Documentación de configuración en README

### Tests requeridos:

**Tests Unitarios**:
```ruby
# spec/models/user_spec.rb
describe User do
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email).case_insensitive }
  it { should validate_presence_of(:role) }
  it { should define_enum_for(:role).with_values(owner: 0, veterinarian: 1, admin: 2) }
end
```

**Tests de Integración**:
```ruby
# spec/features/authentication_spec.rb
describe "User Authentication" do
  it "allows a user to sign up with valid credentials" do
    visit new_user_registration_path
    fill_in "Email", with: "test@example.com"
    fill_in "Password", with: "password123"
    select "Owner", from: "Role"
    click_button "Sign up"
    
    expect(page).to have_content("confirmation email")
  end
end
```

### Comandos de implementación:

```bash
# 1. Añadir gem a Gemfile
echo "gem 'devise'" >> Gemfile
bundle install

# 2. Instalar Devise
rails generate devise:install

# 3. Generar modelo User
rails generate devise User

# 4. Generar vistas personalizables
rails generate devise:views

# 5. Ejecutar migración
rails db:migrate

# 6. Ejecutar tests
bundle exec rspec spec/models/user_spec.rb
```

### Notas de seguridad:

- Configurar `config.secret_key` en production
- Habilitar HTTPS en production
- Configurar políticas de contraseña segura (mínimo 8 caracteres)
- Rate limiting para intentos de login
- Logs de auditoría para accesos a información sensible

### Referencias:

- [Documentación oficial de Devise](https://github.com/heartcombo/devise)
- [Best practices de autenticación Rails](https://guides.rubyonrails.org/security.html#user-management)

---

**Prompt 2: Implementar autorización con Pundit**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en sistemas de autorización y control de acceso basado en roles (RBAC).

## Contexto del Proyecto

Estás implementando el sistema de autorización para **VetConnect** @readme.md. El sistema tiene diferentes tipos de usuarios (owners, veterinarians, admins) con permisos específicos para cada recurso.

## Tarea Principal

Implementa un sistema de autorización completo usando Pundit que defina qué acciones puede realizar cada rol sobre cada recurso.

### Matriz de permisos por rol:

**Owner (Dueño de mascota)**:
- ✅ Ver sus propias mascotas
- ✅ Crear/editar/eliminar sus propias mascotas
- ✅ Ver historial médico de sus mascotas
- ✅ Agendar citas para sus mascotas
- ✅ Ver/cancelar sus propias citas
- ✅ Ver documentos de sus mascotas
- ❌ Ver mascotas de otros dueños
- ❌ Editar citas pasadas
- ❌ Acceder a panel administrativo

**Veterinarian (Veterinario)**:
- ✅ Ver todas las mascotas de la clínica
- ✅ Ver historiales médicos completos
- ✅ Crear/editar consultas médicas
- ✅ Subir documentos médicos
- ✅ Ver/gestionar citas asignadas
- ✅ Enviar mensajes a dueños
- ❌ Eliminar historiales médicos
- ❌ Cambiar configuración de clínica
- ❌ Gestionar usuarios

**Admin (Administrador de clínica)**:
- ✅ Todas las acciones de veterinarian
- ✅ Gestionar usuarios de la clínica
- ✅ Configurar horarios y servicios
- ✅ Ver reportes y analíticas
- ✅ Gestionar configuración de clínica
- ✅ Acceder a panel administrativo completo

### Implementación requerida:

**1. Instalar y configurar Pundit**:

```bash
# Añadir gem
echo "gem 'pundit'" >> Gemfile
bundle install

# Instalar Pundit
rails generate pundit:install
```

**2. Configurar ApplicationController**:

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  include Pundit::Authorization
  
  before_action :authenticate_user!
  after_action :verify_authorized, except: :index, unless: :devise_controller?
  after_action :verify_policy_scoped, only: :index, unless: :devise_controller?
  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  
  private
  
  def user_not_authorized
    flash[:alert] = "No estás autorizado para realizar esta acción."
    redirect_to(request.referer || root_path)
  end
end
```

**3. Crear políticas para recursos principales**:

```ruby
# app/policies/pet_policy.rb
class PetPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        scope.all
      elsif user.owner?
        scope.where(user_id: user.id)
      else
        scope.none
      end
    end
  end
  
  def show?
    user.admin? || user.veterinarian? || record.user_id == user.id
  end
  
  def create?
    user.owner?
  end
  
  def update?
    user.owner? && record.user_id == user.id
  end
  
  def destroy?
    user.owner? && record.user_id == user.id
  end
end

# app/policies/appointment_policy.rb
class AppointmentPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.admin? || user.veterinarian?
        scope.all
      elsif user.owner?
        scope.joins(:pet).where(pets: { user_id: user.id })
      else
        scope.none
      end
    end
  end
  
  def show?
    user.admin? || user.veterinarian? || record.pet.user_id == user.id
  end
  
  def create?
    user.owner? || user.veterinarian? || user.admin?
  end
  
  def update?
    return false if record.completed?
    user.admin? || user.veterinarian? || (user.owner? && record.pet.user_id == user.id)
  end
  
  def destroy?
    !record.completed? && (user.admin? || (user.owner? && record.pet.user_id == user.id))
  end
end

# app/policies/medical_record_policy.rb
class MedicalRecordPolicy < ApplicationPolicy
  def show?
    user.admin? || user.veterinarian? || record.pet.user_id == user.id
  end
  
  def create?
    user.veterinarian? || user.admin?
  end
  
  def update?
    user.veterinarian? || user.admin?
  end
  
  def destroy?
    false # No permitir eliminación de registros médicos
  end
end
```

**4. Usar políticas en controladores**:

```ruby
# app/controllers/pets_controller.rb
class PetsController < ApplicationController
  def index
    @pets = policy_scope(Pet)
  end
  
  def show
    @pet = Pet.find(params[:id])
    authorize @pet
  end
  
  def create
    @pet = current_user.pets.build(pet_params)
    authorize @pet
    
    if @pet.save
      redirect_to @pet, notice: 'Mascota creada exitosamente.'
    else
      render :new
    end
  end
  
  # ... más acciones
end
```

### Tests requeridos:

```ruby
# spec/policies/pet_policy_spec.rb
RSpec.describe PetPolicy do
  subject { described_class }
  
  let(:owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }
  let(:other_owner) { create(:user, role: :owner) }
  
  let(:pet) { create(:pet, user: owner) }
  
  permissions :show? do
    it "allows owner to view their own pet" do
      expect(subject).to permit(owner, pet)
    end
    
    it "allows veterinarian to view any pet" do
      expect(subject).to permit(veterinarian, pet)
    end
    
    it "denies other owners from viewing the pet" do
      expect(subject).not_to permit(other_owner, pet)
    end
  end
  
  permissions :update? do
    it "allows owner to update their own pet" do
      expect(subject).to permit(owner, pet)
    end
    
    it "denies veterinarians from updating pets" do
      expect(subject).not_to permit(veterinarian, pet)
    end
  end
end
```

### Criterios de entrega:

- [ ] Pundit instalado y configurado
- [ ] ApplicationController con manejo de autorización
- [ ] Políticas creadas para: Pet, Appointment, MedicalRecord, Document, User
- [ ] Scopes implementados para filtrar recursos por usuario
- [ ] Controladores usando authorize y policy_scope
- [ ] Tests de políticas con cobertura completa de casos
- [ ] Documentación de matriz de permisos

### Comandos de testing:

```bash
# Ejecutar tests de políticas
bundle exec rspec spec/policies/

# Verificar cobertura
bundle exec rspec --format documentation
```

---

### **8.2. Implementación del Módulo de Mascotas (Pets)**

**Prompt: Implementar CRUD completo de Pets con validaciones y relaciones**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en desarrollo de modelos de dominio y ActiveRecord.

## Contexto del Proyecto

Estás implementando el módulo de Mascotas para **VetConnect** @readme.md, que es la entidad central del sistema alrededor de la cual giran todas las demás funcionalidades.

## Tarea Principal

Implementa el modelo Pet con todas sus relaciones, validaciones, y funcionalidades asociadas.

### Especificaciones del modelo Pet:

**Atributos**:
- `name` (string, required): Nombre de la mascota
- `species` (string, required): Especie (dog, cat, rabbit, bird, other)
- `breed` (string, optional): Raza específica
- `birth_date` (date, required): Fecha de nacimiento
- `gender` (string, required): Sexo (male, female, unknown)
- `color` (string, optional): Color predominante
- `weight` (decimal, optional): Peso actual en kg
- `microchip_number` (string, optional, unique): Número de microchip
- `special_notes` (text, optional): Notas especiales (alergias, comportamiento)
- `user_id` (integer, required, FK): Dueño de la mascota
- `active` (boolean, default: true): Estado activo/inactivo

**Relaciones**:
- `belongs_to :user` (dueño)
- `has_many :appointments`
- `has_many :medical_records`
- `has_many :vaccinations`
- `has_many :documents`
- `has_one_attached :photo` (Active Storage)

**Validaciones**:
- Nombre: presente, longitud 1-50 caracteres
- Especie: presente, incluido en lista válida
- Fecha de nacimiento: presente, no futura, no mayor a 30 años atrás
- Género: presente, incluido en lista válida
- Microchip: único si presente, formato específico
- User: presente (debe pertenecer a un usuario)

**Métodos del modelo**:
- `age`: Calcula edad en años
- `age_in_months`: Calcula edad en meses
- `next_vaccination_due`: Próxima vacunación pendiente
- `recent_appointments(limit = 5)`: Últimas citas
- `full_name`: Nombre completo con especie

### Implementación completa:

**1. Migración**:

```ruby
# db/migrate/YYYYMMDDHHMMSS_create_pets.rb
class CreatePets < ActiveRecord::Migration[7.1]
  def change
    create_table :pets do |t|
      t.string :name, null: false
      t.string :species, null: false
      t.string :breed
      t.date :birth_date, null: false
      t.string :gender, null: false
      t.string :color
      t.decimal :weight, precision: 5, scale: 2
      t.string :microchip_number
      t.text :special_notes
      t.references :user, null: false, foreign_key: true
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :pets, :microchip_number, unique: true, where: "microchip_number IS NOT NULL"
    add_index :pets, [:user_id, :name]
    add_index :pets, :species
    add_index :pets, :active
  end
end
```

**2. Modelo**:

```ruby
# app/models/pet.rb
class Pet < ApplicationRecord
  # Asociaciones
  belongs_to :user
  has_many :appointments, dependent: :destroy
  has_many :medical_records, dependent: :destroy
  has_many :vaccinations, dependent: :destroy
  has_many :documents, dependent: :destroy
  
  has_one_attached :photo
  
  # Enumeraciones
  enum species: { 
    dog: 'dog', 
    cat: 'cat', 
    rabbit: 'rabbit', 
    bird: 'bird', 
    reptile: 'reptile',
    other: 'other' 
  }
  
  enum gender: { 
    male: 'male', 
    female: 'female', 
    unknown: 'unknown' 
  }
  
  # Validaciones
  validates :name, presence: true, length: { minimum: 1, maximum: 50 }
  validates :species, presence: true, inclusion: { in: species.keys }
  validates :birth_date, presence: true
  validates :gender, presence: true, inclusion: { in: genders.keys }
  validates :microchip_number, uniqueness: { case_sensitive: false }, allow_blank: true
  validates :weight, numericality: { greater_than: 0, less_than: 500 }, allow_nil: true
  
  validate :birth_date_cannot_be_in_future
  validate :birth_date_cannot_be_too_old
  validate :photo_format
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :by_species, ->(species) { where(species: species) }
  scope :recent, -> { order(created_at: :desc) }
  scope :alphabetical, -> { order(name: :asc) }
  
  # Métodos de instancia
  def age
    return nil unless birth_date
    ((Date.today - birth_date) / 365.25).floor
  end
  
  def age_in_months
    return nil unless birth_date
    ((Date.today - birth_date) / 30.44).floor
  end
  
  def full_name
    "#{name} (#{species.humanize})"
  end
  
  def next_vaccination_due
    vaccinations.pending.order(:due_date).first
  end
  
  def recent_appointments(limit = 5)
    appointments.order(appointment_date: :desc).limit(limit)
  end
  
  def deactivate!
    update(active: false)
  end
  
  def activate!
    update(active: true)
  end
  
  private
  
  def birth_date_cannot_be_in_future
    if birth_date.present? && birth_date > Date.today
      errors.add(:birth_date, "no puede ser en el futuro")
    end
  end
  
  def birth_date_cannot_be_too_old
    if birth_date.present? && birth_date < 30.years.ago
      errors.add(:birth_date, "es demasiado antigua (máximo 30 años)")
    end
  end
  
  def photo_format
    if photo.attached? && !photo.content_type.in?(%w[image/jpeg image/png image/jpg])
      errors.add(:photo, "debe ser JPEG o PNG")
    end
  end
end
```

**3. Controlador**:

```ruby
# app/controllers/pets_controller.rb
class PetsController < ApplicationController
  before_action :set_pet, only: [:show, :edit, :update, :destroy]
  
  def index
    @pets = policy_scope(Pet).active.includes(:user).page(params[:page])
  end
  
  def show
    authorize @pet
    @recent_appointments = @pet.recent_appointments
    @next_vaccination = @pet.next_vaccination_due
  end
  
  def new
    @pet = current_user.pets.build
    authorize @pet
  end
  
  def create
    @pet = current_user.pets.build(pet_params)
    authorize @pet
    
    if @pet.save
      redirect_to @pet, notice: 'Mascota registrada exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def update
    authorize @pet
    
    if @pet.update(pet_params)
      redirect_to @pet, notice: 'Mascota actualizada exitosamente.'
    else
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    authorize @pet
    
    if @pet.deactivate!
      redirect_to pets_path, notice: 'Mascota desactivada exitosamente.'
    else
      redirect_to @pet, alert: 'No se pudo desactivar la mascota.'
    end
  end
  
  private
  
  def set_pet
    @pet = Pet.find(params[:id])
  end
  
  def pet_params
    params.require(:pet).permit(
      :name, :species, :breed, :birth_date, :gender, 
      :color, :weight, :microchip_number, :special_notes, :photo
    )
  end
end
```

**4. Tests**:

```ruby
# spec/models/pet_spec.rb
RSpec.describe Pet, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
    it { should have_many(:appointments) }
    it { should have_many(:medical_records) }
    it { should have_many(:vaccinations) }
  end
  
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:species) }
    it { should validate_presence_of(:birth_date) }
    it { should validate_length_of(:name).is_at_most(50) }
    
    it 'validates birth_date is not in the future' do
      pet = build(:pet, birth_date: 1.day.from_now)
      expect(pet).not_to be_valid
      expect(pet.errors[:birth_date]).to include("no puede ser en el futuro")
    end
  end
  
  describe '#age' do
    it 'calculates age correctly' do
      pet = create(:pet, birth_date: 3.years.ago)
      expect(pet.age).to eq(3)
    end
    
    it 'returns nil if birth_date is not set' do
      pet = build(:pet, birth_date: nil)
      expect(pet.age).to be_nil
    end
  end
  
  describe '#full_name' do
    it 'returns name with species' do
      pet = build(:pet, name: 'Max', species: :dog)
      expect(pet.full_name).to eq('Max (Dog)')
    end
  end
  
  describe 'scopes' do
    it 'returns active pets' do
      active_pet = create(:pet, active: true)
      inactive_pet = create(:pet, active: false)
      
      expect(Pet.active).to include(active_pet)
      expect(Pet.active).not_to include(inactive_pet)
    end
  end
end

# spec/controllers/pets_controller_spec.rb
RSpec.describe PetsController, type: :controller do
  let(:user) { create(:user, role: :owner) }
  let(:pet) { create(:pet, user: user) }
  
  before { sign_in user }
  
  describe 'GET #index' do
    it 'returns a success response' do
      get :index
      expect(response).to be_successful
    end
    
    it 'assigns @pets' do
      get :index
      expect(assigns(:pets)).to eq([pet])
    end
  end
  
  describe 'POST #create' do
    context 'with valid params' do
      it 'creates a new Pet' do
        expect {
          post :create, params: { pet: attributes_for(:pet) }
        }.to change(Pet, :count).by(1)
      end
      
      it 'redirects to the created pet' do
        post :create, params: { pet: attributes_for(:pet) }
        expect(response).to redirect_to(Pet.last)
      end
    end
    
    context 'with invalid params' do
      it 'does not create a new Pet' do
        expect {
          post :create, params: { pet: { name: '' } }
        }.not_to change(Pet, :count)
      end
    end
  end
end
```

### Criterios de entrega:

- [ ] Migración de pets creada y ejecutada
- [ ] Modelo Pet con todas las validaciones y métodos
- [ ] Active Storage configurado para fotos
- [ ] Controlador con acciones CRUD completas
- [ ] Políticas de autorización aplicadas
- [ ] Vistas para formularios y listados
- [ ] Tests unitarios con cobertura > 90%
- [ ] Tests de controlador para todas las acciones
- [ ] Seeds con datos de ejemplo

### Comandos de ejecución:

```bash
# Generar modelo
rails generate model Pet name:string species:string breed:string birth_date:date gender:string color:string weight:decimal microchip_number:string special_notes:text user:references active:boolean

# Editar migración para añadir índices

# Ejecutar migración
rails db:migrate

# Generar controlador
rails generate controller Pets index show new create edit update destroy

# Ejecutar tests
bundle exec rspec spec/models/pet_spec.rb
bundle exec rspec spec/controllers/pets_controller_spec.rb

# Verificar cobertura
open coverage/index.html
```

---

### **8.3. Implementación del Sistema de Citas (Appointments)**

**Prompt: Implementar módulo de agendamiento con validación de disponibilidad**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en sistemas de scheduling y gestión de citas con lógica de negocio compleja.

## Contexto del Proyecto

Estás implementando el módulo de agendamiento de citas para **VetConnect** @readme.md, que debe manejar disponibilidad de veterinarios, prevención de solapamientos, y recordatorios automáticos por email.

## Notas de Implementación

El sistema ya tiene:
- ✅ Modelo básico de Appointment con campo `scheduled_at`
- ✅ Controladores y políticas básicas
- ❌ Falta modelo Clinic
- ❌ Falta validación de solapamientos
- ❌ Falta sistema de recordatorios

## Tarea Principal

Implementa el sistema completo de agendamiento de citas con toda la lógica de negocio asociada, incluyendo el modelo Clinic.

### Especificaciones del modelo Appointment:

**Atributos**:
- `pet_id` (integer, required, FK): Mascota que recibe la atención
- `veterinarian_id` (integer, required, FK): Veterinario asignado
- `clinic_id` (integer, required, FK): Clínica donde se realiza
- `appointment_date` (datetime, required): Fecha y hora de la cita
- `duration_minutes` (integer, default: 30): Duración estimada
- `reason` (string, required): Motivo de la consulta
- `status` (string, required): Estado (scheduled, confirmed, completed, cancelled, no_show)
- `notes` (text, optional): Notas adicionales del dueño
- `reminder_sent_at` (datetime, optional): Cuándo se envió el recordatorio
- `cancellation_reason` (text, optional): Razón de cancelación si aplica

**Relaciones**:
- `belongs_to :pet`
- `belongs_to :veterinarian, class_name: 'User'`
- `belongs_to :clinic`
- `has_one :medical_record`
- `has_one :user, through: :pet` (dueño)

**Validaciones**:
- Pet, veterinarian, clinic: presentes
- appointment_date: presente, no en el pasado (para nuevas citas)
- duration_minutes: entre 15 y 180 minutos
- reason: presente, longitud máxima 200 caracteres
- status: incluido en lista válida
- Validación custom: veterinario disponible en ese horario
- Validación custom: horario dentro de horas de operación de la clínica

### Implementación completa:

**1. Migraciones necesarias**:

```ruby
# Paso 1: Crear modelo Clinic
# db/migrate/YYYYMMDD_create_clinics.rb
class CreateClinics < ActiveRecord::Migration[7.1]
  def change
    create_table :clinics do |t|
      t.string :name, null: false
      t.text :address, null: false
      t.string :phone, null: false
      t.string :email
      t.text :operating_hours # JSON stored as text for SQLite
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :clinics, :name
    add_index :clinics, :active
  end
end

# Paso 2: Agregar campos faltantes a appointments
# db/migrate/YYYYMMDD_add_clinic_to_appointments.rb
class AddClinicToAppointments < ActiveRecord::Migration[7.1]
  def change
    add_reference :appointments, :clinic, foreign_key: true, index: true
    add_column :appointments, :reminder_sent_at, :datetime
    add_column :appointments, :cancellation_reason, :text
    add_index :appointments, :reminder_sent_at
  end
end

# Paso 3: Renombrar scheduled_at a appointment_date
# db/migrate/YYYYMMDD_rename_scheduled_at_to_appointment_date.rb
class RenameScheduledAtToAppointmentDate < ActiveRecord::Migration[7.1]
  def change
    rename_column :appointments, :scheduled_at, :appointment_date
  end
end

# Paso 4: Actualizar enum de status
# db/migrate/YYYYMMDD_update_appointment_status_enum.rb
class UpdateAppointmentStatusEnum < ActiveRecord::Migration[7.1]
  def up
    # Convertir in_progress (2) a confirmed (1)
    execute "UPDATE appointments SET status = 1 WHERE status = 2"
    # Actualizar completed de 3 a 2
    execute "UPDATE appointments SET status = 2 WHERE status = 3"
    # Actualizar cancelled de 4 a 3
    execute "UPDATE appointments SET status = 3 WHERE status = 4"
  end

  def down
    # Reversible
    execute "UPDATE appointments SET status = 4 WHERE status = 3"
    execute "UPDATE appointments SET status = 3 WHERE status = 2"
  end
end
```

**2. Modelo Appointment**:

```ruby
# app/models/appointment.rb
class Appointment < ApplicationRecord
  # Asociaciones
  belongs_to :pet
  belongs_to :veterinarian, class_name: 'User'
  belongs_to :clinic
  has_one :medical_record, dependent: :destroy
  has_one :user, through: :pet
  
  # Enumeraciones (usando integers para performance)
  enum status: {
    scheduled: 0,
    confirmed: 1,
    completed: 2,
    cancelled: 3,
    no_show: 4
  }, _prefix: true
  
  # Validaciones
  validates :appointment_date, presence: true
  validates :duration_minutes, numericality: { 
    only_integer: true, 
    greater_than_or_equal_to: 15, 
    less_than_or_equal_to: 180 
  }
  validates :reason, presence: true, length: { maximum: 200 }
  validates :status, presence: true
  
  validate :appointment_date_cannot_be_in_past, on: :create
  validate :veterinarian_must_be_vet_or_admin
  validate :veterinarian_available_at_time
  validate :within_clinic_operating_hours
  
  # Scopes
  scope :upcoming, -> { where('appointment_date >= ?', Time.current).order(:appointment_date) }
  scope :past, -> { where('appointment_date < ?', Time.current).order(appointment_date: :desc) }
  scope :today, -> { where('DATE(appointment_date) = ?', Date.today) }
  scope :this_week, -> { where(appointment_date: Time.current.beginning_of_week..Time.current.end_of_week) }
  scope :pending_reminder, -> { where(status: [:scheduled, :confirmed], reminder_sent_at: nil) }
  scope :for_veterinarian, ->(vet_id) { where(veterinarian_id: vet_id) }
  scope :for_clinic, ->(clinic_id) { where(clinic_id: clinic_id) }
  
  # Callbacks
  after_create :schedule_reminder
  after_update :notify_changes, if: :saved_change_to_appointment_date?
  
  # Métodos de instancia
  def end_time
    appointment_date + duration_minutes.minutes
  end
  
  def completed?
    status_completed?
  end

  def can_be_cancelled?
    status_scheduled? || status_confirmed?
  end
  
  def can_be_rescheduled?
    status_scheduled? || status_confirmed?
  end
  
  def cancel!(reason = nil)
    return false unless can_be_cancelled?
    update(status: :cancelled, cancellation_reason: reason)
  end
  
  def complete!
    update(status: :completed)
  end
  
  def confirm!
    update(status: :confirmed)
  end
  
  def mark_no_show!
    update(status: :no_show)
  end
  
  def reschedule!(new_date)
    return false unless can_be_rescheduled?
    update(appointment_date: new_date, reminder_sent_at: nil)
  end
  
  def send_reminder!
    AppointmentReminderJob.perform_later(id)
    update(reminder_sent_at: Time.current)
  end
  
  def self.available_slots(veterinarian_id, date, clinic_id)
    clinic = Clinic.find(clinic_id)
    existing_appointments = where(
      veterinarian_id: veterinarian_id,
      appointment_date: date.beginning_of_day..date.end_of_day
    ).where.not(status: [:cancelled, :no_show])
    
    AvailabilityCalculator.new(clinic, veterinarian_id, date, existing_appointments).calculate
  end
  
  private
  
  def appointment_date_cannot_be_in_past
    if appointment_date.present? && appointment_date < Time.current
      errors.add(:appointment_date, "no puede ser en el pasado")
    end
  end
  
  def veterinarian_must_be_vet_or_admin
    if veterinarian.present? && !veterinarian.veterinarian? && !veterinarian.admin?
      errors.add(:veterinarian, "debe ser un veterinario o administrador")
    end
  end
  
  def veterinarian_available_at_time
    return if appointment_date.blank? || veterinarian_id.blank?
    return if persisted? && !appointment_date_changed?
    
    # Buscar citas en ventana de tiempo cercana (optimización para SQLite)
    overlapping_appointments = Appointment
      .where(veterinarian_id: veterinarian_id)
      .where.not(id: id)
      .where.not(status: [:cancelled, :no_show])
      .where('appointment_date >= ? AND appointment_date <= ?',
             appointment_date - 4.hours, appointment_date + 4.hours)
    
    # Verificar solapamiento en Ruby: (start1 < end2) AND (end1 > start2)
    overlapping_appointments.each do |apt|
      apt_end = apt.end_time
      if (appointment_date < apt_end) && (end_time > apt.appointment_date)
        errors.add(:appointment_date, "el veterinario ya tiene una cita en ese horario")
        break
      end
    end
  end
  
  def within_clinic_operating_hours
    return if appointment_date.blank? || clinic.blank?
    
    day_of_week = appointment_date.strftime('%A').downcase
    operating_hours = clinic.operating_hours[day_of_week]
    
    if operating_hours.blank? || !operating_hours['open']
      errors.add(:appointment_date, "la clínica está cerrada ese día")
      return
    end
    
    time = appointment_date.strftime('%H:%M')
    appointment_end_time = end_time.strftime('%H:%M')
    
    if time < operating_hours['start'] || appointment_end_time > operating_hours['end']
      errors.add(:appointment_date, "fuera del horario de atención (#{operating_hours['start']} - #{operating_hours['end']})")
    end
  end
  
  def schedule_reminder
    # Solo programar si la cita es en más de 24 horas
    if appointment_date > 24.hours.from_now
      AppointmentReminderJob.set(wait_until: appointment_date - 24.hours).perform_later(id)
    end
  end
  
  def notify_changes
    AppointmentChangeNotificationJob.perform_later(id)
  end
end
```

**3. Modelo Clinic (IMPORTANTE - Crear primero)**:

```ruby
# Primero generar el modelo
rails generate model Clinic name:string address:text phone:string email:string active:boolean

# Luego editar la migración para agregar operating_hours
# db/migrate/YYYYMMDD_create_clinics.rb
class CreateClinics < ActiveRecord::Migration[7.1]
  def change
    create_table :clinics do |t|
      t.string :name, null: false
      t.text :address, null: false
      t.string :phone, null: false
      t.string :email
      t.text :operating_hours # JSON stored as text for SQLite
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :clinics, :name
    add_index :clinics, :active
  end
end
```

**4. Modelo Clinic**:

```ruby
# app/models/clinic.rb
class Clinic < ApplicationRecord
  has_many :appointments, dependent: :restrict_with_error
  has_many :pets, through: :appointments
  has_many :veterinarians, -> { distinct }, through: :appointments

  serialize :operating_hours, coder: JSON

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :address, presence: true
  validates :phone, presence: true
  validate :operating_hours_format

  scope :active, -> { where(active: true) }

  def open_on?(date)
    day_name = date.strftime('%A').downcase
    hours = operating_hours&.dig(day_name)
    hours.present? && hours['open'] == true
  end

  def operating_hours_for(date)
    day_name = date.strftime('%A').downcase
    operating_hours&.dig(day_name) || {}
  end
end
```

**5. Job de Recordatorios (solo Email)**:

```ruby
# app/jobs/appointment_reminder_job.rb
class AppointmentReminderJob < ApplicationJob
  queue_as :default
  
  def perform(appointment_id)
    appointment = Appointment.find_by(id: appointment_id)
    
    return unless appointment
    return if appointment.status_cancelled? || appointment.status_completed?
    return if appointment.reminder_sent_at.present?
    
    # Enviar Email únicamente
    AppointmentMailer.reminder(appointment).deliver_now
    
    appointment.update_column(:reminder_sent_at, Time.current)
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn("AppointmentReminderJob: Appointment #{appointment_id} not found")
  end
end

# app/jobs/appointment_change_notification_job.rb
class AppointmentChangeNotificationJob < ApplicationJob
  queue_as :default

  def perform(appointment_id)
    appointment = Appointment.find_by(id: appointment_id)
    
    return unless appointment
    return if appointment.status_cancelled? || appointment.status_completed?
    
    AppointmentMailer.rescheduled(appointment).deliver_now
  end
end

# app/mailers/appointment_mailer.rb
class AppointmentMailer < ApplicationMailer
  def reminder(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(to: @owner.email, subject: "Recordatorio: Cita para #{@pet.name} mañana")
  end

  def confirmation(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(to: @owner.email, subject: "Confirmación de cita para #{@pet.name}")
  end

  def cancellation(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @clinic = appointment.clinic
    
    mail(to: @owner.email, subject: "Cita cancelada para #{@pet.name}")
  end

  def rescheduled(appointment)
    @appointment = appointment
    @owner = appointment.owner
    @pet = appointment.pet
    @veterinarian = appointment.veterinarian
    @clinic = appointment.clinic
    
    mail(to: @owner.email, subject: "Cita reprogramada para #{@pet.name}")
  end
end
```

**6. Service Object - Calculador de Disponibilidad**:

```ruby
# app/services/availability_calculator.rb
class AvailabilityCalculator
  SLOT_DURATION = 30 # minutes

  def initialize(clinic, veterinarian_id, date, existing_appointments)
    @clinic = clinic
    @veterinarian_id = veterinarian_id
    @date = date
    @existing_appointments = existing_appointments
  end

  def calculate
    return [] unless @clinic.open_on?(@date)

    generate_slots
  end

  private

  def generate_slots
    slots = []
    current_time = start_time

    while current_time < end_time
      slot_end = current_time + SLOT_DURATION.minutes

      if available?(current_time, slot_end)
        slots << {
          start_time: current_time,
          end_time: slot_end,
          available: true
        }
      end

      current_time += SLOT_DURATION.minutes
    end

    slots
  end

  def start_time
    hours = @clinic.operating_hours_for(@date)
    hour, minute = hours['start'].split(':').map(&:to_i)
    Time.zone.local(@date.year, @date.month, @date.day, hour, minute)
  end

  def end_time
    hours = @clinic.operating_hours_for(@date)
    hour, minute = hours['end'].split(':').map(&:to_i)
    Time.zone.local(@date.year, @date.month, @date.day, hour, minute)
  end

  def available?(slot_start, slot_end)
    @existing_appointments.none? do |appointment|
      appointment_end = appointment.end_time
      (slot_start < appointment_end) && (slot_end > appointment.appointment_date)
    end
  end
end
```

**7. Controlador**:

```ruby
# app/controllers/appointments_controller.rb
class AppointmentsController < ApplicationController
  before_action :set_appointment, only: [:show, :edit, :update, :destroy, :complete, :cancel, :confirm, :mark_no_show]

  def index
    @appointments = policy_scope(Appointment)
                      .includes(:pet, :veterinarian, :clinic)
                      .order(appointment_date: :desc)
    @appointments = @appointments.where(status: params[:status]) if params[:status].present?
  end

  def show
    authorize @appointment
  end

  def new
    @appointment = Appointment.new
    @appointment.pet_id = params[:pet_id] if params[:pet_id].present?
    authorize @appointment
    
    @pets = policy_scope(Pet)
    @veterinarians = User.veterinarians
    @clinics = Clinic.active
  end

  def create
    @appointment = Appointment.new(appointment_params)
    authorize @appointment

    if @appointment.save
      # Enviar email de confirmación
      AppointmentMailer.confirmation(@appointment).deliver_later
      redirect_to @appointment, notice: 'Cita creada exitosamente.'
    else
      @pets = policy_scope(Pet)
      @veterinarians = User.veterinarians
      @clinics = Clinic.active
      render :new, status: :unprocessable_entity
    end
  end

  def update
    authorize @appointment

    if @appointment.update(appointment_params)
      redirect_to @appointment, notice: 'Cita actualizada exitosamente.'
    else
      @pets = policy_scope(Pet)
      @veterinarians = User.veterinarians
      @clinics = Clinic.active
      render :edit, status: :unprocessable_entity
    end
  end

  def cancel
    authorize @appointment, :cancel?
    
    if @appointment.cancel!(params[:cancellation_reason])
      AppointmentMailer.cancellation(@appointment).deliver_later
      redirect_to @appointment, notice: 'Cita cancelada exitosamente.'
    else
      redirect_to @appointment, alert: 'No se pudo cancelar la cita.'
    end
  end

  def complete
    authorize @appointment, :complete?
    
    if @appointment.complete!
      redirect_to new_appointment_medical_record_path(@appointment), 
                  notice: 'Cita completada. Por favor, registra la consulta.'
    else
      redirect_to @appointment, alert: 'No se pudo completar la cita.'
    end
  end

  def confirm
    authorize @appointment
    
    if @appointment.confirm!
      redirect_to @appointment, notice: 'Cita confirmada exitosamente.'
    else
      redirect_to @appointment, alert: 'No se pudo confirmar la cita.'
    end
  end

  def mark_no_show
    authorize @appointment, :complete?
    
    if @appointment.mark_no_show!
      redirect_to @appointment, notice: 'Cita marcada como no asistió.'
    else
      redirect_to @appointment, alert: 'No se pudo marcar la cita.'
    end
  end

  def available_slots
    skip_authorization # API endpoint público
    
    begin
      veterinarian_id = params[:veterinarian_id]
      date = Date.parse(params[:date])
      clinic_id = params[:clinic_id]
      
      slots = Appointment.available_slots(veterinarian_id, date, clinic_id)
      render json: { slots: slots }
    rescue ArgumentError => e
      render json: { error: 'Invalid date format' }, status: :bad_request
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: 'Clinic not found' }, status: :not_found
    end
  end

  private

  def set_appointment
    @appointment = Appointment.find(params[:id])
  end

  def appointment_params
    params.require(:appointment).permit(
      :pet_id, :veterinarian_id, :clinic_id, :appointment_date, :duration_minutes,
      :appointment_type, :reason, :notes, :status, :cancellation_reason
    )
  end
end
```

**8. Rutas**:

```ruby
# config/routes.rb
resources :appointments do
  member do
    post :complete
    post :cancel
    post :confirm
    post :mark_no_show
  end
  collection do
    get :available_slots
  end
end

# Nested routes para medical records
resources :appointments, only: [] do
  resources :medical_records, only: [:new, :create]
end

resources :clinics
```

**9. Controladores de Namespace** (Dashboards por Rol):

```ruby
# app/controllers/owner/dashboard_controller.rb
module Owner
  class DashboardController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_owner!

    def index
      @pets = current_user.pets.active.includes(:appointments)
      @upcoming_appointments = Appointment.joins(:pet)
                                         .where(pets: { user_id: current_user.id })
                                         .upcoming
                                         .includes(:pet, :veterinarian, :clinic)
                                         .limit(5)
    end

    private

    def ensure_owner!
      redirect_to root_path, alert: 'Access denied' unless current_user.owner?
    end
  end
end

# Similares para Veterinarian y Admin namespaces
```

**10. Vistas Principales**:

Crear vistas para:
- `app/views/appointments/` - CRUD de citas
- `app/views/owner/dashboard/` - Dashboard del owner
- `app/views/veterinarian/dashboard/` - Dashboard del veterinario
- `app/views/admin/dashboard/` - Dashboard del admin
- `app/views/appointment_mailer/` - Templates de emails (HTML y text)

**11. Tests Mínimos**:

```ruby
# spec/models/appointment_spec.rb - Tests básicos de validaciones
# spec/services/availability_calculator_spec.rb - Tests del calculador
# spec/jobs/appointment_reminder_job_spec.rb - Tests del job
# spec/mailers/appointment_mailer_spec.rb - Tests de emails
# spec/requests/appointment_flow_spec.rb - Tests de integración
```

### Criterios de entrega:

- [x] Modelo Clinic con operating_hours creado
- [x] Migraciones para actualizar appointments ejecutadas
- [x] Modelo Appointment con todas las validaciones
- [x] Service Object AvailabilityCalculator implementado
- [x] Jobs de recordatorios y notificaciones configurados
- [x] AppointmentMailer con 4 tipos de emails (HTML + text)
- [x] Controlador con todas las acciones (including API)
- [x] API endpoint available_slots funcionando
- [x] Controladores de namespace (Owner, Veterinarian, Admin)
- [x] Vistas para todos los roles y acciones
- [x] Tests funcionales completos (70+ pruebas)
- [x] Sistema validado con cada rol

### Comandos ejecutados:

```bash
# 1. Crear modelo Clinic
rails generate model Clinic name:string address:text phone:string email:string active:boolean

# 2. Crear migraciones adicionales
rails generate migration AddClinicToAppointments clinic:references reminder_sent_at:datetime cancellation_reason:text
rails generate migration RenameScheduledAtToAppointmentDate
rails generate migration UpdateAppointmentStatusEnum

# 3. Ejecutar migraciones
rails db:migrate

# 4. Generar jobs
rails generate job AppointmentReminder
rails generate job AppointmentChangeNotification

# 5. Generar mailer
rails generate mailer AppointmentMailer

# 6. Resetear base de datos y cargar seeds
rails db:reset

# 7. Ejecutar pruebas funcionales
rails runner "
  # Script de pruebas (ver test_complete_system.rb)
  # Verifica todos los roles, modelos, asociaciones, validaciones
"

# 8. Test de API
curl "http://localhost:3000/appointments/available_slots?veterinarian_id=8&date=2026-01-20&clinic_id=4"
```

### Notas Importantes:

1. **SQLite Compatibility**: La validación de solapamiento usa estrategia compatible con SQLite (busca en ventana temporal + verifica en Ruby)

2. **Email Only**: Sistema usa solo emails para recordatorios (sin SMS/Twilio), configurado con Letter Opener en desarrollo

3. **Status Enum**: Usa integers (0-4) para mejor performance y compatibilidad

4. **Namespaced Controllers**: IMPORTANTE - Agregar `skip_after_action` en todos los controladores de namespace para evitar errores de Pundit:
   ```ruby
   skip_after_action :verify_authorized
   skip_after_action :verify_policy_scoped
   ```

5. **API Endpoint**: El endpoint `available_slots` debe permitir acceso sin autenticación:
   ```ruby
   skip_before_action :authenticate_user!, only: [:available_slots]
   skip_after_action :verify_authorized, only: [:available_slots]
   ```

6. **Clinic Policy**: Crear `app/policies/clinic_policy.rb` para autorización de clínicas

7. **Owner Appointments Query**: Usar `Appointment.joins(:pet).where(pets: { user_id: current_user.id })` para obtener citas del owner

### Validación Final:

Ejecutar servidor y pruebas:
```bash
# Iniciar servidor
rails server -b 0.0.0.0 -p 3000

# En otra terminal, verificar sistema
cd vetconnect
./bin/verify_system

# Probar API endpoint
curl "http://localhost:3000/appointments/available_slots?veterinarian_id=8&date=2026-01-20&clinic_id=4"

# Prueba manual en navegador
# http://localhost:3000
# Login con: maria@example.com / password123 (owner)
# Login con: carlos@vetconnect.com / password123 (veterinarian)  
# Login con: admin@vetconnect.com / password123 (admin)
```

### Resultado Esperado:

✅ **100% de pruebas pasando:**
- 3 endpoints públicos funcionando
- API available_slots retornando slots
- 5 funcionalidades de Owner operativas
- 3 funcionalidades de Veterinarian operativas
- 4 funcionalidades de Admin operativas
- 5 modelos verificados en base de datos

**El sistema debe estar completamente funcional con todos los roles y dashboards accesibles.**

---

## 9. Testing y Calidad de Código

> **Nota**: Esta sección contiene prompts para implementar una estrategia de testing completa y asegurar la calidad del código.

### **9.1. Configuración de Suite de Testing**

**Prompt: Configurar RSpec, FactoryBot y herramientas de testing**

# Rol

Eres un QA Engineer Senior especializado en Ruby on Rails con más de 8 años de experiencia en testing automatizado, TDD y BDD.

## Contexto del Proyecto

Estás configurando la suite completa de testing para **VetConnect** @readme.md, incluyendo tests unitarios, de integración y de aceptación.

## Tarea Principal

Configura un entorno de testing robusto con todas las herramientas necesarias para asegurar la calidad del código.

### Herramientas a configurar:

1. **RSpec** - Framework de testing
2. **FactoryBot** - Fixtures dinámicas
3. **Faker** - Datos aleatorios
4. **Shoulda Matchers** - Matchers para validaciones
5. **Database Cleaner** - Limpieza de BD entre tests
6. **SimpleCov** - Cobertura de código
7. **Capybara** - Tests de integración
8. **WebMock** - Mock de llamadas HTTP
9. **VCR** - Grabación de interacciones HTTP

### Paso 1: Añadir gems al Gemfile

```ruby
# Gemfile

group :development, :test do
  gem 'rspec-rails', '~> 6.1'
  gem 'factory_bot_rails', '~> 6.4'
  gem 'faker', '~> 3.2'
  gem 'pry-rails'
  gem 'pry-byebug'
end

group :test do
  gem 'shoulda-matchers', '~> 6.0'
  gem 'database_cleaner-active_record', '~> 2.1'
  gem 'simplecov', require: false
  gem 'capybara', '~> 3.39'
  gem 'selenium-webdriver'
  gem 'webmock', '~> 3.19'
  gem 'vcr', '~> 6.2'
  gem 'pundit-matchers', '~> 3.1'
end
```

### Paso 2: Instalar y configurar RSpec

```bash
# Instalar gems
bundle install

# Instalar RSpec
rails generate rspec:install

# Generar archivo de configuración de FactoryBot
mkdir spec/support
touch spec/support/factory_bot.rb
touch spec/support/shoulda_matchers.rb
touch spec/support/database_cleaner.rb
```

### Paso 3: Configurar RSpec

```ruby
# spec/spec_helper.rb
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  add_filter '/config/'
  add_filter '/vendor/'
  
  add_group 'Controllers', 'app/controllers'
  add_group 'Models', 'app/models'
  add_group 'Services', 'app/services'
  add_group 'Jobs', 'app/jobs'
  add_group 'Policies', 'app/policies'
  
  minimum_coverage 90
end

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = "spec/examples.txt"
  config.disable_monkey_patching!
  config.default_formatter = "doc" if config.files_to_run.one?
  config.order = :random
  Kernel.srand config.seed
end
```

```ruby
# spec/rails_helper.rb
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'
require 'capybara/rails'
require 'webmock/rspec'

# Require support files
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  
  # Devise helpers
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include Devise::Test::ControllerHelpers, type: :controller
  
  # FactoryBot
  config.include FactoryBot::Syntax::Methods
  
  # Pundit matchers
  config.include Pundit::Matchers
end

# WebMock configuration
WebMock.disable_net_connect!(allow_localhost: true)
```

### Paso 4: Configurar FactoryBot

```ruby
# spec/support/factory_bot.rb
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  
  config.before(:suite) do
    FactoryBot.find_definitions
  end
end
```

### Paso 5: Configurar Shoulda Matchers

```ruby
# spec/support/shoulda_matchers.rb
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

### Paso 6: Configurar Database Cleaner

```ruby
# spec/support/database_cleaner.rb
RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
```

### Paso 7: Configurar VCR

```ruby
# spec/support/vcr.rb
VCR.configure do |config|
  config.cassette_library_dir = "spec/fixtures/vcr_cassettes"
  config.hook_into :webmock
  config.configure_rspec_metadata!
  config.ignore_localhost = true
  
  # Filtrar secrets de las grabaciones
  config.filter_sensitive_data('<SENDGRID_API_KEY>') { ENV['SENDGRID_API_KEY'] }
  config.filter_sensitive_data('<TWILIO_ACCOUNT_SID>') { ENV['TWILIO_ACCOUNT_SID'] }
  config.filter_sensitive_data('<TWILIO_AUTH_TOKEN>') { ENV['TWILIO_AUTH_TOKEN'] }
  config.filter_sensitive_data('<AWS_ACCESS_KEY_ID>') { ENV['AWS_ACCESS_KEY_ID'] }
  config.filter_sensitive_data('<AWS_SECRET_ACCESS_KEY>') { ENV['AWS_SECRET_ACCESS_KEY'] }
end
```

### Paso 8: Crear factories base

```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { 'password123' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    phone { Faker::PhoneNumber.phone_number }
    role { :owner }
    confirmed_at { Time.current }
    
    trait :owner do
      role { :owner }
    end
    
    trait :veterinarian do
      role { :veterinarian }
    end
    
    trait :admin do
      role { :admin }
    end
    
    trait :unconfirmed do
      confirmed_at { nil }
    end
  end
end

# spec/factories/pets.rb
FactoryBot.define do
  factory :pet do
    association :user, factory: [:user, :owner]
    name { Faker::Creature::Dog.name }
    species { :dog }
    breed { Faker::Creature::Dog.breed }
    birth_date { Faker::Date.between(from: 15.years.ago, to: 1.month.ago) }
    gender { [:male, :female].sample }
    color { Faker::Color.color_name }
    weight { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    active { true }
    
    trait :cat do
      species { :cat }
      breed { ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair'].sample }
    end
    
    trait :inactive do
      active { false }
    end
    
    trait :with_photo do
      after(:create) do |pet|
        pet.photo.attach(
          io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'pet_photo.jpg')),
          filename: 'pet_photo.jpg',
          content_type: 'image/jpeg'
        )
      end
    end
  end
end

# spec/factories/appointments.rb
FactoryBot.define do
  factory :appointment do
    association :pet
    association :veterinarian, factory: [:user, :veterinarian]
    association :clinic
    appointment_date { Faker::Time.between(from: 1.day.from_now, to: 30.days.from_now) }
    duration_minutes { 30 }
    reason { ['Vacunación', 'Consulta general', 'Control', 'Emergencia'].sample }
    status { :scheduled }
    
    trait :today do
      appointment_date { Time.current.change(hour: 10, min: 0) }
    end
    
    trait :past do
      appointment_date { Faker::Time.between(from: 30.days.ago, to: 1.day.ago) }
    end
    
    trait :confirmed do
      status { :confirmed }
    end
    
    trait :completed do
      status { :completed }
      appointment_date { 1.week.ago }
    end
    
    trait :cancelled do
      status { :cancelled }
      cancellation_reason { 'Cambio de planes' }
    end
  end
end
```

### Paso 9: Configurar Capybara para tests de integración

```ruby
# spec/support/capybara.rb
require 'capybara/rspec'

Capybara.register_driver :selenium_chrome_headless do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument('--window-size=1400,1400')

  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

Capybara.javascript_driver = :selenium_chrome_headless
Capybara.default_max_wait_time = 5

RSpec.configure do |config|
  config.before(:each, type: :system) do
    driven_by :rack_test
  end

  config.before(:each, type: :system, js: true) do
    driven_by :selenium_chrome_headless
  end
end
```

### Paso 10: Ejemplo de test completo

```ruby
# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:pets).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:user) }
    
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:role) }
    it { should define_enum_for(:role).with_values(owner: 0, veterinarian: 1, admin: 2) }
  end

  describe 'factory' do
    it 'has a valid factory' do
      expect(build(:user)).to be_valid
    end
    
    it 'creates owner by default' do
      user = create(:user)
      expect(user.owner?).to be true
    end
  end
end

# spec/requests/appointments_spec.rb
require 'rails_helper'

RSpec.describe 'Appointments', type: :request do
  let(:user) { create(:user, :owner) }
  let(:pet) { create(:pet, user: user) }
  let(:veterinarian) { create(:user, :veterinarian) }
  let(:clinic) { create(:clinic) }
  
  before { sign_in user }
  
  describe 'GET /appointments' do
    it 'returns a success response' do
      get appointments_path
      expect(response).to have_http_status(:success)
    end
  end
  
  describe 'POST /appointments' do
    let(:valid_attributes) do
      {
        pet_id: pet.id,
        veterinarian_id: veterinarian.id,
        clinic_id: clinic.id,
        appointment_date: 1.day.from_now.change(hour: 10, min: 0),
        reason: 'Vacunación'
      }
    end
    
    context 'with valid params' do
      it 'creates a new appointment' do
        expect {
          post appointments_path, params: { appointment: valid_attributes }
        }.to change(Appointment, :count).by(1)
      end
      
      it 'schedules a reminder job' do
        expect {
          post appointments_path, params: { appointment: valid_attributes }
        }.to have_enqueued_job(AppointmentReminderJob)
      end
    end
  end
end

# spec/system/appointment_booking_spec.rb
require 'rails_helper'

RSpec.describe 'Appointment Booking', type: :system, js: true do
  let(:user) { create(:user, :owner) }
  let(:pet) { create(:pet, user: user) }
  let(:veterinarian) { create(:user, :veterinarian) }
  let(:clinic) { create(:clinic) }
  
  before do
    sign_in user
    visit root_path
  end
  
  it 'allows user to book an appointment' do
    click_link 'Agendar Cita'
    
    select pet.name, from: 'Mascota'
    select 'Vacunación', from: 'Motivo'
    select veterinarian.full_name, from: 'Veterinario'
    
    # Seleccionar fecha y hora
    fill_in 'Fecha', with: 1.day.from_now.strftime('%Y-%m-%d')
    select '10:00', from: 'Hora'
    
    click_button 'Confirmar Cita'
    
    expect(page).to have_content('Cita agendada exitosamente')
    expect(Appointment.count).to eq(1)
  end
end
```

### Criterios de entrega:

- [ ] Todas las gems instaladas
- [ ] RSpec configurado con soporte para Rails
- [ ] FactoryBot configurado con factories base
- [ ] SimpleCov configurado para cobertura > 90%
- [ ] Database Cleaner configurado
- [ ] Capybara configurado para tests de sistema
- [ ] VCR configurado para mock de APIs externas
- [ ] Ejemplos de tests para modelos, controladores y sistema
- [ ] Documentación de cómo ejecutar tests

### Comandos de ejecución:

```bash
# Instalar gems
bundle install

# Ejecutar todos los tests
bundle exec rspec

# Ejecutar tests específicos
bundle exec rspec spec/models/
bundle exec rspec spec/requests/
bundle exec rspec spec/system/

# Ejecutar con cobertura
COVERAGE=true bundle exec rspec

# Ver reporte de cobertura
open coverage/index.html

# Ejecutar tests en paralelo (más rápido)
gem install parallel_tests
parallel_rspec spec/
```

---

### **9.2. Tests de Servicios y Jobs**

**Prompt: Implementar tests para Service Objects y Background Jobs**

# Rol

Eres un QA Engineer Senior especializado en testing de lógica de negocio compleja y background jobs en Rails.

## Contexto del Proyecto

Estás escribiendo tests para los Service Objects y Background Jobs de **VetConnect** @readme.md.

## Tarea Principal

Implementa tests completos para servicios y jobs, asegurando que toda la lógica de negocio esté cubierta.

### Servicios a testear:

1. **AppointmentCreator** - Creación de citas con validaciones
2. **AvailabilityCalculator** - Cálculo de horarios disponibles
3. **VaccinationScheduler** - Programación de vacunas
4. **DocumentProcessor** - Procesamiento de documentos médicos

### Jobs a testear:

1. **AppointmentReminderJob** - Envío de recordatorios
2. **VaccinationReminderJob** - Recordatorios de vacunas
3. **DocumentCleanupJob** - Limpieza de documentos antiguos

### Ejemplo completo de tests para Service Object:

```ruby
# spec/services/appointment_creator_spec.rb
require 'rails_helper'

RSpec.describe AppointmentCreator do
  let(:user) { create(:user, :owner) }
  let(:pet) { create(:pet, user: user) }
  let(:veterinarian) { create(:user, :veterinarian) }
  let(:clinic) { create(:clinic) }
  
  let(:valid_params) do
    {
      pet_id: pet.id,
      veterinarian_id: veterinarian.id,
      clinic_id: clinic.id,
      appointment_date: 1.day.from_now.change(hour: 10, min: 0),
      reason: 'Vacunación',
      duration_minutes: 30
    }
  end
  
  describe '#call' do
    context 'with valid parameters' do
      it 'creates an appointment successfully' do
        service = described_class.new(valid_params)
        result = service.call
        
        expect(result.success?).to be true
        expect(result.appointment).to be_persisted
        expect(result.appointment.pet).to eq(pet)
      end
      
      it 'schedules a reminder job' do
        service = described_class.new(valid_params)
        
        expect {
          service.call
        }.to have_enqueued_job(AppointmentReminderJob)
          .with { |appointment_id| Appointment.exists?(appointment_id) }
          .on_queue('default')
          .at(valid_params[:appointment_date] - 24.hours)
      end
      
      it 'sends confirmation email' do
        service = described_class.new(valid_params)
        
        expect {
          service.call
        }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
          .with('AppointmentMailer', 'confirmation', 'deliver_now', { args: [anything] })
      end
    end
    
    context 'with invalid parameters' do
      it 'fails when pet does not exist' do
        invalid_params = valid_params.merge(pet_id: 99999)
        service = described_class.new(invalid_params)
        result = service.call
        
        expect(result.success?).to be false
        expect(result.errors).to include('Pet not found')
      end
      
      it 'fails when veterinarian is not available' do
        # Crear cita existente en el mismo horario
        create(:appointment, 
          veterinarian: veterinarian,
          appointment_date: valid_params[:appointment_date],
          duration_minutes: 30
        )
        
        service = described_class.new(valid_params)
        result = service.call
        
        expect(result.success?).to be false
        expect(result.errors).to include(/veterinario.*no disponible/i)
      end
      
      it 'fails when appointment is outside clinic hours' do
        invalid_params = valid_params.merge(
          appointment_date: 1.day.from_now.change(hour: 22, min: 0) # Fuera de horario
        )
        
        service = described_class.new(invalid_params)
        result = service.call
        
        expect(result.success?).to be false
        expect(result.errors).to include(/horario de atención/i)
      end
    end
    
    context 'with edge cases' do
      it 'handles concurrent appointment creation' do
        # Simular dos usuarios intentando agendar el mismo horario simultáneamente
        service1 = described_class.new(valid_params)
        service2 = described_class.new(valid_params)
        
        result1 = nil
        result2 = nil
        
        threads = [
          Thread.new { result1 = service1.call },
          Thread.new { result2 = service2.call }
        ]
        
        threads.each(&:join)
        
        # Solo una debe tener éxito
        expect([result1.success?, result2.success?]).to include(true).and include(false)
      end
    end
  end
end
```

### Ejemplo completo de tests para Background Job:

```ruby
# spec/jobs/appointment_reminder_job_spec.rb
require 'rails_helper'

RSpec.describe AppointmentReminderJob, type: :job do
  let(:appointment) { create(:appointment, :confirmed) }
  
  describe '#perform' do
    context 'when appointment exists and is valid' do
      it 'sends SMS reminder', vcr: { cassette_name: 'twilio/send_sms' } do
        expect(TwilioService).to receive(:send_sms).with(
          to: appointment.user.phone,
          body: /Recordatorio.*#{appointment.pet.name}/i
        )
        
        described_class.perform_now(appointment.id)
      end
      
      it 'sends email reminder' do
        expect {
          described_class.perform_now(appointment.id)
        }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
          .with('AppointmentMailer', 'reminder', 'deliver_now', { args: [appointment] })
      end
      
      it 'updates reminder_sent_at timestamp' do
        expect {
          described_class.perform_now(appointment.id)
        }.to change { appointment.reload.reminder_sent_at }.from(nil).to(be_within(1.second).of(Time.current))
      end
    end
    
    context 'when appointment is cancelled' do
      let(:appointment) { create(:appointment, :cancelled) }
      
      it 'does not send reminders' do
        expect(TwilioService).not_to receive(:send_sms)
        
        described_class.perform_now(appointment.id)
      end
    end
    
    context 'when reminder was already sent' do
      let(:appointment) { create(:appointment, reminder_sent_at: 1.hour.ago) }
      
      it 'does not send duplicate reminder' do
        expect(TwilioService).not_to receive(:send_sms)
        
        described_class.perform_now(appointment.id)
      end
    end
    
    context 'when Twilio API fails' do
      before do
        allow(TwilioService).to receive(:send_sms).and_raise(TwilioService::Error)
      end
      
      it 'retries the job' do
        expect {
          described_class.perform_now(appointment.id)
        }.to raise_error(TwilioService::Error)
        
        # Verificar que el job será reintentado
        expect(described_class).to have_been_enqueued.on_queue('default')
      end
      
      it 'logs the error' do
        allow(Rails.logger).to receive(:error)
        
        expect {
          described_class.perform_now(appointment.id) rescue nil
        }.to change { Rails.logger.error.call_count }.by_at_least(1)
      end
    end
    
    context 'when appointment does not exist' do
      it 'handles gracefully' do
        expect {
          described_class.perform_now(99999)
        }.not_to raise_error
      end
    end
  end
  
  describe 'queueing' do
    it 'is queued on default queue' do
      described_class.perform_later(appointment.id)
      
      expect(described_class).to have_been_enqueued.on_queue('default')
    end
    
    it 'can be scheduled for future execution' do
      scheduled_time = 1.day.from_now
      
      described_class.set(wait_until: scheduled_time).perform_later(appointment.id)
      
      expect(described_class).to have_been_enqueued
        .with(appointment.id)
        .at(be_within(1.second).of(scheduled_time))
    end
  end
end
```

### Tests con VCR para APIs externas:

```ruby
# spec/services/twilio_service_spec.rb
require 'rails_helper'

RSpec.describe TwilioService do
  describe '.send_sms', vcr: { cassette_name: 'twilio/send_sms_success' } do
    let(:phone) { '+34600000000' }
    let(:message) { 'Test message' }
    
    it 'sends SMS successfully' do
      result = described_class.send_sms(to: phone, body: message)
      
      expect(result).to be_success
      expect(result.sid).to be_present
    end
  end
  
  describe 'error handling', vcr: { cassette_name: 'twilio/send_sms_error' } do
    it 'handles invalid phone numbers' do
      expect {
        described_class.send_sms(to: 'invalid', body: 'Test')
      }.to raise_error(TwilioService::Error, /número inválido/i)
    end
  end
end
```

### Helpers personalizados para tests:

```ruby
# spec/support/job_helpers.rb
module JobHelpers
  def clear_enqueued_jobs
    ActiveJob::Base.queue_adapter.enqueued_jobs.clear
  end
  
  def perform_enqueued_jobs_now
    ActiveJob::Base.queue_adapter.enqueued_jobs.each do |job|
      job[:job].perform_now(*job[:args])
    end
  end
end

RSpec.configure do |config|
  config.include JobHelpers
  
  config.before(:each) do
    clear_enqueued_jobs
  end
end
```

### Criterios de entrega:

- [ ] Tests de Service Objects con todos los casos
- [ ] Tests de Background Jobs con casos de éxito y error
- [ ] Uso de VCR para mock de APIs externas
- [ ] Tests de concurrencia para operaciones críticas
- [ ] Tests de retry y error handling
- [ ] Helpers personalizados para facilitar testing
- [ ] Cobertura de código > 90% en servicios y jobs

### Comandos:

```bash
# Ejecutar tests de servicios
bundle exec rspec spec/services/

# Ejecutar tests de jobs
bundle exec rspec spec/jobs/

# Regenerar cassettes de VCR (si API cambió)
rm -rf spec/fixtures/vcr_cassettes/
VCR_RECORD_MODE=all bundle exec rspec

# Ver jobs encolados en desarrollo
rails console
> Sidekiq::Queue.all.map(&:name)
> Sidekiq::Queue.new('default').size
```

---

## 10. Integraciones y Servicios Externos

> **Nota**: Esta sección contiene prompts para implementar integraciones con servicios externos como SMS, email, almacenamiento en la nube, etc.

### **10.1. Integración de SMS con Twilio**

**Prompt: Implementar servicio de SMS con Twilio**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en integraciones con APIs de terceros y servicios de comunicación.

## Contexto del Proyecto

Estás implementando la integración con Twilio para envío de SMS en **VetConnect** @readme.md, que se usará para recordatorios de citas y notificaciones importantes.

## Tarea Principal

Implementa un servicio robusto para envío de SMS usando la API de Twilio, con manejo de errores, reintentos y logging.

### Especificaciones:

**Casos de uso de SMS**:
1. Recordatorios de citas 24h antes
2. Confirmación de cita agendada
3. Notificación de cambio de horario
4. Recordatorios de vacunación
5. Alertas de documentos disponibles

### Implementación completa:

**1. Añadir gem de Twilio**:

```ruby
# Gemfile
gem 'twilio-ruby', '~> 6.10'
```

**2. Configurar credenciales**:

```bash
# .env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

```ruby
# config/initializers/twilio.rb
require 'twilio-ruby'

Twilio.configure do |config|
  config.account_sid = ENV['TWILIO_ACCOUNT_SID']
  config.auth_token = ENV['TWILIO_AUTH_TOKEN']
end

TWILIO_PHONE_NUMBER = ENV['TWILIO_PHONE_NUMBER']
```

**3. Crear Service Object para Twilio**:

```ruby
# app/services/twilio_service.rb
class TwilioService
  class Error < StandardError; end
  class InvalidPhoneError < Error; end
  class QuotaExceededError < Error; end
  class NetworkError < Error; end
  
  def initialize
    @client = Twilio::REST::Client.new(
      ENV['TWILIO_ACCOUNT_SID'],
      ENV['TWILIO_AUTH_TOKEN']
    )
  end
  
  def send_sms(to:, body:, from: TWILIO_PHONE_NUMBER)
    validate_phone_number!(to)
    validate_message_body!(body)
    
    message = @client.messages.create(
      from: from,
      to: format_phone_number(to),
      body: truncate_message(body)
    )
    
    log_success(message)
    
    OpenStruct.new(
      success?: true,
      sid: message.sid,
      status: message.status,
      error: nil
    )
  rescue Twilio::REST::RestError => e
    handle_twilio_error(e, to, body)
  rescue StandardError => e
    handle_generic_error(e, to, body)
  end
  
  def self.send_sms(**)
    new.send_sms(**)
  end
  
  def send_appointment_reminder(appointment)
    user = appointment.user
    pet = appointment.pet
    date = appointment.appointment_date.strftime('%d/%m/%Y a las %H:%M')
    
    body = "Hola #{user.first_name}! Recordatorio: mañana tienes cita con #{pet.name} " \
           "el #{date}. ¡Te esperamos! - VetConnect"
    
    send_sms(to: user.phone, body: body)
  end
  
  def send_vaccination_reminder(vaccination)
    user = vaccination.pet.user
    pet = vaccination.pet
    vaccine_name = vaccination.vaccine_name
    
    body = "Hola #{user.first_name}! Es momento de vacunar a #{pet.name} " \
           "contra #{vaccine_name}. Agenda tu cita en VetConnect."
    
    send_sms(to: user.phone, body: body)
  end
  
  private
  
  def validate_phone_number!(phone)
    return if phone.present? && phone.match?(/\A\+?[1-9]\d{1,14}\z/)
    raise InvalidPhoneError, "Número de teléfono inválido: #{phone}"
  end
  
  def validate_message_body!(body)
    raise ArgumentError, "El mensaje no puede estar vacío" if body.blank?
    raise ArgumentError, "El mensaje es demasiado largo (máximo 1600 caracteres)" if body.length > 1600
  end
  
  def format_phone_number(phone)
    # Asegurar que el número tenga código de país
    phone = phone.gsub(/[\s\-\(\)]/, '')
    phone = "+#{phone}" unless phone.start_with?('+')
    phone
  end
  
  def truncate_message(body, max_length = 1600)
    body.length > max_length ? "#{body[0...(max_length-3)]}..." : body
  end
  
  def handle_twilio_error(error, to, body)
    case error.code
    when 21211
      raise InvalidPhoneError, "Número de teléfono inválido: #{to}"
    when 21608
      raise QuotaExceededError, "Cuota de SMS excedida"
    when 20003
      raise NetworkError, "Error de autenticación con Twilio"
    else
      Rails.logger.error "Twilio error: #{error.message} (code: #{error.code})"
      raise Error, "Error al enviar SMS: #{error.message}"
    end
  end
  
  def handle_generic_error(error, to, body)
    Rails.logger.error "Error enviando SMS a #{to}: #{error.message}"
    Rails.logger.error error.backtrace.join("\n")
    
    OpenStruct.new(
      success?: false,
      sid: nil,
      status: 'failed',
      error: error.message
    )
  end
  
  def log_success(message)
    Rails.logger.info "SMS enviado exitosamente: SID #{message.sid}, Status: #{message.status}"
    
    # Opcional: guardar en base de datos para auditoría
    SmsLog.create(
      sid: message.sid,
      to: message.to,
      status: message.status,
      sent_at: Time.current
    )
  end
end
```

**4. Crear modelo de log de SMS (opcional)**:

```ruby
# db/migrate/YYYYMMDDHHMMSS_create_sms_logs.rb
class CreateSmsLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :sms_logs do |t|
      t.string :sid, null: false
      t.string :to, null: false
      t.string :status
      t.text :body
      t.string :error_message
      t.datetime :sent_at

      t.timestamps
    end
    
    add_index :sms_logs, :sid, unique: true
    add_index :sms_logs, :to
    add_index :sms_logs, :sent_at
  end
end

# app/models/sms_log.rb
class SmsLog < ApplicationRecord
  validates :sid, presence: true, uniqueness: true
  validates :to, presence: true
  
  scope :recent, -> { order(sent_at: :desc) }
  scope :failed, -> { where(status: ['failed', 'undelivered']) }
  scope :successful, -> { where(status: ['delivered', 'sent']) }
end
```

**5. Usar el servicio en Jobs**:

```ruby
# app/jobs/send_sms_job.rb
class SendSmsJob < ApplicationJob
  queue_as :notifications
  
  retry_on TwilioService::NetworkError, wait: :exponentially_longer, attempts: 3
  retry_on TwilioService::Error, wait: 5.minutes, attempts: 2
  
  discard_on TwilioService::InvalidPhoneError do |job, error|
    Rails.logger.error "Número inválido, descartando job: #{error.message}"
  end
  
  def perform(to:, body:, context: nil)
    Rails.logger.info "Enviando SMS a #{to}: #{body[0..50]}..."
    
    result = TwilioService.send_sms(to: to, body: body)
    
    if result.success?
      Rails.logger.info "SMS enviado exitosamente: #{result.sid}"
    else
      Rails.logger.error "Fallo al enviar SMS: #{result.error}"
      raise TwilioService::Error, result.error
    end
  end
end

# Uso:
SendSmsJob.perform_later(to: user.phone, body: "Mensaje de prueba")
```

**6. Tests completos**:

```ruby
# spec/services/twilio_service_spec.rb
require 'rails_helper'

RSpec.describe TwilioService do
  let(:service) { described_class.new }
  let(:valid_phone) { '+34612345678' }
  let(:valid_body) { 'Test message' }
  
  describe '#send_sms' do
    context 'with valid parameters', vcr: { cassette_name: 'twilio/send_sms_success' } do
      it 'sends SMS successfully' do
        result = service.send_sms(to: valid_phone, body: valid_body)
        
        expect(result.success?).to be true
        expect(result.sid).to be_present
        expect(result.status).to eq('queued')
      end
      
      it 'logs the SMS' do
        expect {
          service.send_sms(to: valid_phone, body: valid_body)
        }.to change(SmsLog, :count).by(1)
      end
    end
    
    context 'with invalid phone number' do
      it 'raises InvalidPhoneError' do
        expect {
          service.send_sms(to: 'invalid', body: valid_body)
        }.to raise_error(TwilioService::InvalidPhoneError)
      end
    end
    
    context 'when Twilio API fails', vcr: { cassette_name: 'twilio/send_sms_error' } do
      it 'handles error gracefully' do
        result = service.send_sms(to: '+999999999', body: valid_body)
        
        expect(result.success?).to be false
        expect(result.error).to be_present
      end
    end
  end
  
  describe '#send_appointment_reminder' do
    let(:appointment) { create(:appointment, :tomorrow) }
    
    it 'sends reminder with correct format', vcr: { cassette_name: 'twilio/appointment_reminder' } do
      result = service.send_appointment_reminder(appointment)
      
      expect(result.success?).to be true
      expect(result.sid).to be_present
    end
  end
end

# spec/jobs/send_sms_job_spec.rb
require 'rails_helper'

RSpec.describe SendSmsJob, type: :job do
  let(:phone) { '+34612345678' }
  let(:body) { 'Test message' }
  
  it 'queues the job' do
    expect {
      described_class.perform_later(to: phone, body: body)
    }.to have_enqueued_job(described_class)
      .with(to: phone, body: body, context: nil)
      .on_queue('notifications')
  end
  
  context 'when SMS sends successfully' do
    before do
      allow(TwilioService).to receive(:send_sms).and_return(
        OpenStruct.new(success?: true, sid: 'SM123', status: 'queued')
      )
    end
    
    it 'completes successfully' do
      expect {
        described_class.perform_now(to: phone, body: body)
      }.not_to raise_error
    end
  end
  
  context 'when Twilio fails' do
    before do
      allow(TwilioService).to receive(:send_sms).and_raise(TwilioService::NetworkError)
    end
    
    it 'retries the job' do
      expect {
        described_class.perform_now(to: phone, body: body)
      }.to raise_error(TwilioService::NetworkError)
      
      expect(described_class).to have_been_enqueued.at_least(:once)
    end
  end
end
```

### Criterios de entrega:

- [ ] Gem twilio-ruby instalada
- [ ] Credenciales configuradas
- [ ] TwilioService implementado con manejo de errores
- [ ] SmsLog model para auditoría
- [ ] SendSmsJob con retry logic
- [ ] Tests con VCR para todas las operaciones
- [ ] Documentación de códigos de error de Twilio

### Comandos de testing manual:

```bash
# Consola Rails
rails console

# Enviar SMS de prueba
TwilioService.send_sms(to: '+34612345678', body: 'Test desde VetConnect')

# Enviar recordatorio de cita
appointment = Appointment.first
TwilioService.new.send_appointment_reminder(appointment)

# Ver logs de SMS
SmsLog.recent.limit(10)
```

---

### **10.2. Integración de Email con SendGrid**

**Prompt: Implementar servicio de emails transaccionales con SendGrid**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en sistemas de email transaccional y notificaciones.

## Contexto del Proyecto

Estás implementando la integración con SendGrid para envío de emails en **VetConnect** @readme.md, que se usará para confirmaciones, recordatorios y comunicaciones con usuarios.

## Tarea Principal

Implementa un sistema completo de emails usando SendGrid con templates, tracking y analytics.

### Tipos de emails a implementar:

1. **Emails transaccionales**:
   - Confirmación de registro
   - Reset de contraseña
   - Confirmación de cita
   - Recordatorio de cita (24h antes)
   - Notificación de cambio de cita
   - Resultados de laboratorio disponibles

2. **Emails informativos**:
   - Recordatorios de vacunación
   - Newsletter mensual
   - Tips de cuidado de mascotas

### Implementación completa:

**1. Configurar Action Mailer con SendGrid**:

```ruby
# config/environments/production.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'smtp.sendgrid.net',
  port: 587,
  domain: 'vetconnect.com',
  user_name: 'apikey',
  password: ENV['SENDGRID_API_KEY'],
  authentication: :plain,
  enable_starttls_auto: true
}

config.action_mailer.default_url_options = { host: 'vetconnect.com', protocol: 'https' }
config.action_mailer.perform_deliveries = true
config.action_mailer.raise_delivery_errors = true
```

**2. Mailer base con configuración común**:

```ruby
# app/mailers/application_mailer.rb
class ApplicationMailer < ActionMailer::Base
  default from: 'VetConnect <noreply@vetconnect.com>',
          reply_to: 'soporte@vetconnect.com'
  
  layout 'mailer'
  
  # Añadir headers personalizados para tracking
  def mail(headers = {}, &block)
    headers['X-SMTPAPI'] = {
      category: [self.class.name.underscore, action_name]
    }.to_json
    
    super
  end
  
  private
  
  def format_user_name(user)
    "#{user.first_name} #{user.last_name}".strip
  end
end
```

**3. Appointment Mailer**:

```ruby
# app/mailers/appointment_mailer.rb
class AppointmentMailer < ApplicationMailer
  def confirmation(appointment)
    @appointment = appointment
    @user = appointment.user
    @pet = appointment.pet
    @clinic = appointment.clinic
    
    mail(
      to: email_with_name(@user),
      subject: "Cita confirmada para #{@pet.name} - #{format_date(@appointment.appointment_date)}",
      template_path: 'appointment_mailer',
      template_name: 'confirmation'
    )
  end
  
  def reminder(appointment)
    @appointment = appointment
    @user = appointment.user
    @pet = appointment.pet
    @clinic = appointment.clinic
    
    # Link de confirmación/cancelación
    @confirm_url = confirm_appointment_url(@appointment, token: @appointment.confirmation_token)
    @cancel_url = cancel_appointment_url(@appointment, token: @appointment.cancellation_token)
    
    mail(
      to: email_with_name(@user),
      subject: "Recordatorio: Cita mañana para #{@pet.name}",
      template_path: 'appointment_mailer',
      template_name: 'reminder'
    )
  end
  
  def cancellation(appointment, reason = nil)
    @appointment = appointment
    @user = appointment.user
    @pet = appointment.pet
    @reason = reason
    
    mail(
      to: email_with_name(@user),
      subject: "Cita cancelada para #{@pet.name}",
      template_path: 'appointment_mailer',
      template_name: 'cancellation'
    )
  end
  
  def rescheduled(appointment, old_date)
    @appointment = appointment
    @user = appointment.user
    @pet = appointment.pet
    @old_date = old_date
    @new_date = appointment.appointment_date
    
    mail(
      to: email_with_name(@user),
      subject: "Cita reprogramada para #{@pet.name}",
      template_path: 'appointment_mailer',
      template_name: 'rescheduled'
    )
  end
  
  private
  
  def email_with_name(user)
    "#{format_user_name(user)} <#{user.email}>"
  end
  
  def format_date(date)
    I18n.l(date, format: :long)
  end
end
```

**4. User Mailer (Devise)**:

```ruby
# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  def welcome(user)
    @user = user
    @login_url = new_user_session_url
    
    mail(
      to: email_with_name(@user),
      subject: '¡Bienvenido a VetConnect!'
    )
  end
  
  def password_reset(user, token)
    @user = user
    @token = token
    @reset_url = edit_password_url(@user, reset_password_token: @token)
    @expires_at = 2.hours.from_now
    
    mail(
      to: email_with_name(@user),
      subject: 'Instrucciones para restablecer tu contraseña'
    )
  end
  
  def email_changed(user, old_email)
    @user = user
    @old_email = old_email
    @new_email = user.email
    
    mail(
      to: @old_email,
      subject: 'Tu email ha sido actualizado'
    )
  end
  
  private
  
  def email_with_name(user)
    "#{format_user_name(user)} <#{user.email}>"
  end
end
```

**5. Vaccination Mailer**:

```ruby
# app/mailers/vaccination_mailer.rb
class VaccinationMailer < ApplicationMailer
  def reminder(vaccination)
    @vaccination = vaccination
    @pet = vaccination.pet
    @user = @pet.user
    @due_date = vaccination.due_date
    
    @schedule_url = new_appointment_url(
      pet_id: @pet.id,
      reason: "Vacunación: #{vaccination.vaccine_name}"
    )
    
    mail(
      to: email_with_name(@user),
      subject: "Recordatorio: Vacuna próxima para #{@pet.name}",
      template_path: 'vaccination_mailer',
      template_name: 'reminder'
    )
  end
  
  def certificate(vaccination)
    @vaccination = vaccination
    @pet = vaccination.pet
    @user = @pet.user
    
    # Adjuntar certificado PDF
    attachments["certificado_#{@pet.name}_#{vaccination.vaccine_name}.pdf"] = {
      mime_type: 'application/pdf',
      content: VaccinationCertificatePdf.new(vaccination).render
    }
    
    mail(
      to: email_with_name(@user),
      subject: "Certificado de vacunación para #{@pet.name}"
    )
  end
  
  private
  
  def email_with_name(user)
    "#{format_user_name(user)} <#{user.email}>"
  end
end
```

**6. Templates HTML responsivos**:

```erb
<!-- app/views/layouts/mailer.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      /* Reset styles */
      body {
        margin: 0;
        padding: 0;
        min-width: 100%;
        font-family: Arial, sans-serif;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        background-color: #4F46E5;
        color: white;
        padding: 30px 20px;
        text-align: center;
      }
      
      .content {
        background-color: #ffffff;
        padding: 30px 20px;
        color: #374151;
        line-height: 1.6;
      }
      
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #4F46E5;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        margin: 20px 0;
      }
      
      .footer {
        background-color: #F3F4F6;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #6B7280;
      }
      
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table class="container" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="header">
                <h1 style="margin: 0;">🐾 VetConnect</h1>
              </td>
            </tr>
            <tr>
              <td class="content">
                <%= yield %>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p>VetConnect - Tu plataforma de salud para mascotas</p>
                <p>
                  <a href="<%= root_url %>">Visitar sitio web</a> | 
                  <a href="<%= settings_url %>">Preferencias</a> | 
                  <a href="<%= unsubscribe_url %>">Dar de baja</a>
                </p>
                <p>© <%= Time.current.year %> VetConnect. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

```erb
<!-- app/views/appointment_mailer/confirmation.html.erb -->
<h2>¡Tu cita está confirmada!</h2>

<p>Hola <%= @user.first_name %>,</p>

<p>
  Tu cita para <strong><%= @pet.name %></strong> ha sido confirmada exitosamente.
</p>

<div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="margin-top: 0;">Detalles de la cita</h3>
  <p><strong>Mascota:</strong> <%= @pet.full_name %></p>
  <p><strong>Fecha:</strong> <%= l(@appointment.appointment_date, format: :long) %></p>
  <p><strong>Veterinario:</strong> <%= @appointment.veterinarian.full_name %></p>
  <p><strong>Motivo:</strong> <%= @appointment.reason %></p>
  <p><strong>Clínica:</strong> <%= @clinic.name %></p>
  <p><strong>Dirección:</strong> <%= @clinic.address %></p>
</div>

<p>
  <a href="<%= appointment_url(@appointment) %>" class="button">
    Ver detalles de la cita
  </a>
</p>

<p>
  Recibirás un recordatorio 24 horas antes de tu cita.
</p>

<p>
  Si necesitas cancelar o reprogramar, puedes hacerlo desde tu panel de control.
</p>

<p>
  ¡Nos vemos pronto! 🐾<br>
  El equipo de <%= @clinic.name %>
</p>
```

**7. Preview de emails en desarrollo**:

```ruby
# test/mailers/previews/appointment_mailer_preview.rb
class AppointmentMailerPreview < ActionMailer::Preview
  def confirmation
    appointment = Appointment.first || FactoryBot.create(:appointment)
    AppointmentMailer.confirmation(appointment)
  end
  
  def reminder
    appointment = Appointment.upcoming.first || FactoryBot.create(:appointment, :tomorrow)
    AppointmentMailer.reminder(appointment)
  end
  
  def cancellation
    appointment = Appointment.first || FactoryBot.create(:appointment)
    AppointmentMailer.cancellation(appointment, "El veterinario no está disponible")
  end
end
```

**8. Tests de mailers**:

```ruby
# spec/mailers/appointment_mailer_spec.rb
require 'rails_helper'

RSpec.describe AppointmentMailer, type: :mailer do
  describe '#confirmation' do
    let(:appointment) { create(:appointment) }
    let(:mail) { described_class.confirmation(appointment) }
    
    it 'renders the headers' do
      expect(mail.subject).to include('Cita confirmada')
      expect(mail.to).to eq([appointment.user.email])
      expect(mail.from).to eq(['noreply@vetconnect.com'])
    end
    
    it 'renders the body' do
      expect(mail.body.encoded).to include(appointment.pet.name)
      expect(mail.body.encoded).to include(appointment.veterinarian.full_name)
      expect(mail.body.encoded).to include('confirmada exitosamente')
    end
    
    it 'includes appointment details' do
      expect(mail.body.encoded).to include(appointment.reason)
      expect(mail.body.encoded).to include(appointment.clinic.name)
    end
    
    it 'includes link to appointment' do
      expect(mail.body.encoded).to include(appointment_url(appointment))
    end
  end
  
  describe '#reminder' do
    let(:appointment) { create(:appointment, :tomorrow) }
    let(:mail) { described_class.reminder(appointment) }
    
    it 'includes confirmation and cancellation links' do
      expect(mail.body.encoded).to include('confirm_appointment')
      expect(mail.body.encoded).to include('cancel_appointment')
    end
    
    it 'is sent 24 hours before appointment' do
      expect {
        appointment.save
      }.to have_enqueued_job(ActionMailer::MailDeliveryJob)
        .with('AppointmentMailer', 'reminder', 'deliver_later', { args: [appointment] })
        .at(appointment.appointment_date - 24.hours)
    end
  end
end
```

**9. Job para envío de emails**:

```ruby
# app/jobs/send_email_job.rb
class SendEmailJob < ApplicationJob
  queue_as :mailers
  
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  
  def perform(mailer, method, *args)
    mailer.constantize.public_send(method, *args).deliver_now
  end
end

# Uso:
SendEmailJob.perform_later('AppointmentMailer', 'confirmation', appointment)
```

### Criterios de entrega:

- [ ] SendGrid configurado en production
- [ ] Mailers creados para todos los casos de uso
- [ ] Templates HTML responsivos
- [ ] Emails con estilo consistente con la marca
- [ ] Previews de emails para desarrollo
- [ ] Tests de mailers completos
- [ ] Tracking de emails configurado
- [ ] Manejo de errores y reintentos

### Comandos de testing:

```bash
# Ver previews de emails en desarrollo
rails server
# Visitar: http://localhost:3000/rails/mailers

# Enviar email de prueba desde consola
rails console
> appointment = Appointment.first
> AppointmentMailer.confirmation(appointment).deliver_now

# Ver emails en desarrollo (con gem letter_opener)
# Se abrirá automáticamente en el navegador

# Ejecutar tests de mailers
bundle exec rspec spec/mailers/
```

---

### **10.3. Integración de Almacenamiento con AWS S3**

**Prompt: Configurar Active Storage con AWS S3 para documentos médicos**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en gestión de archivos y almacenamiento en la nube.

## Contexto del Proyecto

Estás configurando Active Storage con AWS S3 para **VetConnect** @readme.md, que almacenará documentos médicos, fotos de mascotas, resultados de laboratorio, etc.

## Tarea Principal

Configura un sistema robusto de almacenamiento de archivos usando Active Storage con AWS S3, incluyendo validaciones, procesamiento de imágenes y seguridad.

### Tipos de archivos a manejar:

1. **Fotos de mascotas** (JPEG, PNG) - hasta 5MB
2. **Documentos médicos** (PDF) - hasta 10MB
3. **Resultados de laboratorio** (PDF, JPEG) - hasta 10MB
4. **Certificados de vacunación** (PDF) - hasta 5MB
5. **Radiografías** (JPEG, PNG, DICOM) - hasta 20MB

### Implementación completa:

**1. Instalar gemas necesarias**:

```ruby
# Gemfile
gem 'aws-sdk-s3', '~> 1.132'
gem 'image_processing', '~> 1.12'
gem 'mini_magick', '~> 4.12'
```

**2. Configurar Active Storage**:

```bash
# Instalar Active Storage
rails active_storage:install
rails db:migrate
```

**3. Configurar AWS S3**:

```ruby
# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: <%= ENV['AWS_REGION'] %>
  bucket: <%= ENV['AWS_BUCKET'] %>
  
# Configuración adicional para seguridad
amazon_private:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  region: <%= ENV['AWS_REGION'] %>
  bucket: <%= ENV['AWS_BUCKET'] %>
  # Archivos privados, requieren URL firmada
  public: false

local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

test:
  service: Disk
  root: <%= Rails.root.join("tmp/storage") %>

# config/environments/production.rb
config.active_storage.service = :amazon_private

# config/environments/development.rb
config.active_storage.service = :local

# config/environments/test.rb
config.active_storage.service = :test
```

**4. Modelo con Active Storage**:

```ruby
# app/models/pet.rb
class Pet < ApplicationRecord
  has_one_attached :photo do |attachable|
    attachable.variant :thumb, resize_to_limit: [100, 100]
    attachable.variant :medium, resize_to_limit: [300, 300]
    attachable.variant :large, resize_to_limit: [800, 800]
  end
  
  validates :photo, content_type: ['image/png', 'image/jpeg', 'image/jpg'],
                   size: { less_than: 5.megabytes }
  
  # Generar thumbnail después de subir
  after_commit :process_photo, on: [:create, :update], if: :photo_attached_changed?
  
  def photo_url(variant = :medium)
    return nil unless photo.attached?
    
    if variant && photo.variable?
      Rails.application.routes.url_helpers.rails_representation_url(
        photo.variant(variant),
        only_path: false
      )
    else
      Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: false)
    end
  end
  
  private
  
  def photo_attached_changed?
    saved_change_to_attribute?(:photo)
  end
  
  def process_photo
    return unless photo.attached?
    
    # Generar variantes en background
    ImageProcessingJob.perform_later(photo.id)
  end
end

# app/models/document.rb
class Document < ApplicationRecord
  belongs_to :pet
  belongs_to :uploaded_by, class_name: 'User'
  
  has_one_attached :file
  
  enum document_type: {
    medical_record: 'medical_record',
    lab_result: 'lab_result',
    vaccination_certificate: 'vaccination_certificate',
    radiography: 'radiography',
    prescription: 'prescription',
    other: 'other'
  }
  
  validates :file, attached: true,
                  content_type: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
                  size: { less_than: 20.megabytes }
  
  validates :document_type, presence: true
  validates :description, presence: true, length: { maximum: 500 }
  
  # Generar preview para PDFs
  after_commit :generate_preview, on: :create, if: :pdf?
  
  def pdf?
    file.content_type == 'application/pdf'
  end
  
  def image?
    file.content_type.in?(['image/png', 'image/jpeg', 'image/jpg'])
  end
  
  def download_url(expires_in: 15.minutes)
    Rails.application.routes.url_helpers.rails_blob_url(
      file,
      disposition: 'attachment',
      expires_in: expires_in
    )
  end
  
  def preview_url
    return thumbnail_url if image?
    return pdf_preview_url if pdf?
    nil
  end
  
  private
  
  def thumbnail_url
    Rails.application.routes.url_helpers.rails_representation_url(
      file.variant(resize_to_limit: [400, 400]),
      only_path: false
    )
  end
  
  def pdf_preview_url
    return nil unless pdf? && file.preview_image.attached?
    
    Rails.application.routes.url_helpers.rails_blob_url(
      file.preview_image.variant(resize_to_limit: [400, 400]),
      only_path: false
    )
  end
  
  def generate_preview
    return unless pdf?
    
    PdfPreviewJob.perform_later(file.id)
  end
end
```

**5. Validador personalizado para archivos**:

```ruby
# app/validators/file_validator.rb
class FileValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless value.attached?
    
    validate_content_type(record, attribute, value) if options[:content_type]
    validate_size(record, attribute, value) if options[:size]
  end
  
  private
  
  def validate_content_type(record, attribute, value)
    allowed_types = Array(options[:content_type])
    
    unless value.content_type.in?(allowed_types)
      record.errors.add(attribute, :invalid_content_type,
        allowed: allowed_types.join(', '),
        current: value.content_type
      )
    end
  end
  
  def validate_size(record, attribute, value)
    max_size = options[:size][:less_than]
    
    if value.byte_size > max_size
      record.errors.add(attribute, :file_too_large,
        max_size: ActiveSupport::NumberHelper.number_to_human_size(max_size),
        current_size: ActiveSupport::NumberHelper.number_to_human_size(value.byte_size)
      )
    end
  end
end

# Uso:
# validates :file, file: { content_type: ['application/pdf'], size: { less_than: 10.megabytes } }
```

**6. Job para procesar imágenes**:

```ruby
# app/jobs/image_processing_job.rb
class ImageProcessingJob < ApplicationJob
  queue_as :default
  
  def perform(attachment_id)
    attachment = ActiveStorage::Attachment.find(attachment_id)
    return unless attachment.variable?
    
    # Generar todas las variantes
    [:thumb, :medium, :large].each do |variant_name|
      attachment.variant(variant_name).processed
    end
    
    Rails.logger.info "Variantes generadas para attachment #{attachment_id}"
  rescue ActiveStorage::FileNotFoundError => e
    Rails.logger.error "Archivo no encontrado: #{e.message}"
  rescue => e
    Rails.logger.error "Error procesando imagen: #{e.message}"
    raise e
  end
end

# app/jobs/pdf_preview_job.rb
class PdfPreviewJob < ApplicationJob
  queue_as :default
  
  def perform(blob_id)
    blob = ActiveStorage::Blob.find(blob_id)
    return unless blob.content_type == 'application/pdf'
    
    # Active Storage genera automáticamente preview de primera página
    blob.preview(resize_to_limit: [400, 400]).processed
    
    Rails.logger.info "Preview generado para PDF #{blob_id}"
  rescue => e
    Rails.logger.error "Error generando preview de PDF: #{e.message}"
    raise e
  end
end
```

**7. Controlador para subir archivos**:

```ruby
# app/controllers/documents_controller.rb
class DocumentsController < ApplicationController
  before_action :set_pet
  before_action :set_document, only: [:show, :destroy]
  
  def index
    @documents = @pet.documents.order(created_at: :desc)
    authorize @documents
  end
  
  def show
    authorize @document
    
    respond_to do |format|
      format.html
      format.json { render json: DocumentSerializer.new(@document) }
    end
  end
  
  def create
    @document = @pet.documents.build(document_params)
    @document.uploaded_by = current_user
    authorize @document
    
    if @document.save
      redirect_to pet_documents_path(@pet), notice: 'Documento subido exitosamente.'
    else
      render :new, status: :unprocessable_entity
    end
  end
  
  def destroy
    authorize @document
    
    @document.destroy
    redirect_to pet_documents_path(@pet), notice: 'Documento eliminado.'
  end
  
  def download
    @document = @pet.documents.find(params[:id])
    authorize @document
    
    redirect_to @document.download_url, allow_other_host: true
  end
  
  private
  
  def set_pet
    @pet = Pet.find(params[:pet_id])
  end
  
  def set_document
    @document = @pet.documents.find(params[:id])
  end
  
  def document_params
    params.require(:document).permit(:file, :document_type, :description, :date)
  end
end
```

**8. Direct uploads desde frontend**:

```erb
<!-- app/views/documents/new.html.erb -->
<%= form_with model: [@pet, @document], local: true do |form| %>
  <div class="field">
    <%= form.label :file, 'Archivo' %>
    <%= form.file_field :file, direct_upload: true, accept: 'application/pdf,image/*' %>
  </div>
  
  <div class="field">
    <%= form.label :document_type, 'Tipo de documento' %>
    <%= form.select :document_type, Document.document_types.keys.map { |k| [k.humanize, k] } %>
  </div>
  
  <div class="field">
    <%= form.label :description, 'Descripción' %>
    <%= form.text_area :description, rows: 3 %>
  </div>
  
  <div class="actions">
    <%= form.submit 'Subir documento', class: 'btn btn-primary' %>
  </div>
<% end %>
```

**9. Configurar CORS para S3**:

```json
// Configuración de CORS en S3 bucket
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedOrigins": ["https://vetconnect.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**10. Tests**:

```ruby
# spec/models/document_spec.rb
require 'rails_helper'

RSpec.describe Document, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:document_type) }
    it { should validate_presence_of(:description) }
    
    it 'validates file is attached' do
      document = build(:document, file: nil)
      expect(document).not_to be_valid
      expect(document.errors[:file]).to include("must be attached")
    end
    
    it 'validates file content type' do
      document = build(:document)
      document.file.attach(
        io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'test.txt')),
        filename: 'test.txt',
        content_type: 'text/plain'
      )
      
      expect(document).not_to be_valid
      expect(document.errors[:file]).to include(/content type/)
    end
    
    it 'validates file size' do
      # Crear archivo de más de 20MB (simulado)
      allow_any_instance_of(ActiveStorage::Blob).to receive(:byte_size).and_return(25.megabytes)
      
      document = build(:document)
      expect(document).not_to be_valid
    end
  end
  
  describe '#download_url' do
    let(:document) { create(:document, :with_pdf) }
    
    it 'generates a download URL' do
      url = document.download_url
      
      expect(url).to be_present
      expect(url).to include('amazonaws.com') # En production
    end
    
    it 'URL expires after specified time' do
      url = document.download_url(expires_in: 1.hour)
      
      # URL debe incluir parámetro de expiración
      expect(url).to match(/Expires=/)
    end
  end
end

# spec/jobs/image_processing_job_spec.rb
require 'rails_helper'

RSpec.describe ImageProcessingJob, type: :job do
  let(:pet) { create(:pet) }
  
  before do
    pet.photo.attach(
      io: File.open(Rails.root.join('spec', 'fixtures', 'files', 'pet_photo.jpg')),
      filename: 'pet_photo.jpg',
      content_type: 'image/jpeg'
    )
  end
  
  it 'generates all image variants' do
    attachment = pet.photo
    
    expect {
      described_class.perform_now(attachment.id)
    }.to change { attachment.variant(:thumb).processed? }.from(false).to(true)
  end
end
```

### Criterios de entrega:

- [ ] AWS S3 bucket creado y configurado
- [ ] Active Storage instalado y configurado
- [ ] Modelos con has_one_attached y has_many_attached
- [ ] Validaciones de tipo y tamaño de archivo
- [ ] Procesamiento de imágenes con variantes
- [ ] Preview de PDFs
- [ ] Direct uploads configurado
- [ ] URLs firmadas para seguridad
- [ ] Tests completos de upload y download

### Comandos:

```bash
# Instalar Active Storage
rails active_storage:install
rails db:migrate

# Purgar archivos no adjuntos (limpieza)
rails active_storage:purge_unattached

# Consola para testing
rails console
> pet = Pet.first
> pet.photo.attach(io: File.open('path/to/image.jpg'), filename: 'image.jpg')
> pet.photo.attached? # => true
> pet.photo_url(:thumb)
```

---

## 11. Deployment y CI/CD

> **Nota**: Esta sección contiene prompts para configurar deployment automatizado y pipelines de CI/CD.

### **11.1. Configuración de CI/CD con GitHub Actions**

**Prompt: Implementar pipeline completo de CI/CD**

# Rol

Eres un DevOps Engineer Senior especializado en CI/CD para aplicaciones Ruby on Rails con experiencia en GitHub Actions y deployment automatizado.

## Contexto del Proyecto

Estás configurando un pipeline completo de CI/CD para **VetConnect** @readme.md, que incluirá testing automatizado, análisis de código, y deployment a production.

## Tarea Principal

Configura un pipeline robusto de CI/CD que automatice testing, linting, security checks y deployment.

### Pipeline stages:

1. **Lint & Format** - Rubocop, Brakeman
2. **Test** - RSpec con cobertura
3. **Security** - Bundle audit
4. **Build** - Assets precompile
5. **Deploy** - Deployment a Heroku/AWS

### Implementación completa:

**1. Workflow principal de CI**:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  RUBY_VERSION: 3.2.0
  NODE_VERSION: 18
  POSTGRES_VERSION: 14

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Run Rubocop
        run: bundle exec rubocop --parallel
      
      - name: Run ERB Lint
        run: bundle exec erblint --lint-all
  
  security:
    name: Security Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Run Brakeman
        run: bundle exec brakeman --no-pager
      
      - name: Run Bundle Audit
        run: |
          bundle exec bundle-audit check --update
      
      - name: Run Bundler Audit
        run: bundle exec bundler-audit check
  
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vetconnect_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'yarn'
      
      - name: Install dependencies
        run: |
          bundle install --jobs 4 --retry 3
          yarn install --frozen-lockfile
      
      - name: Setup database
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
        run: |
          bin/rails db:create
          bin/rails db:schema:load
      
      - name: Precompile assets
        env:
          RAILS_ENV: test
        run: bin/rails assets:precompile
      
      - name: Run tests
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
          REDIS_URL: redis://localhost:6379/0
          COVERAGE: true
        run: |
          bundle exec rspec --format progress --format RspecJunitFormatter --out tmp/rspec_results.xml
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage.xml
          flags: unittests
          name: codecov-umbrella
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tmp/rspec_results.xml
      
      - name: Check test coverage
        run: |
          if [ -f coverage/.last_run.json ]; then
            coverage=$(cat coverage/.last_run.json | jq -r '.result.line')
            echo "Current coverage: $coverage%"
            if (( $(echo "$coverage < 90" | bc -l) )); then
              echo "Coverage is below 90%"
              exit 1
            fi
          fi
  
  build:
    name: Build Assets
    needs: [lint, security, test]
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'yarn'
      
      - name: Install dependencies
        run: |
          bundle install
          yarn install
      
      - name: Precompile assets
        env:
          RAILS_ENV: production
          SECRET_KEY_BASE: dummy_key_for_asset_precompile
        run: bin/rails assets:precompile
      
      - name: Upload assets
        uses: actions/upload-artifact@v3
        with:
          name: assets
          path: public/assets
```

**2. Workflow de deployment**:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy_staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.vetconnect.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Deploy to Heroku Staging
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: vetconnect-staging
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          branch: main
      
      - name: Run database migrations
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          heroku run rails db:migrate --app vetconnect-staging
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to staging completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
  
  deploy_production:
    name: Deploy to Production
    needs: deploy_staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://vetconnect.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to Heroku Production
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: vetconnect-production
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          branch: main
      
      - name: Run database migrations
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          heroku run rails db:migrate --app vetconnect-production
      
      - name: Warm up application
        run: |
          curl -I https://vetconnect.com
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Deployment to production completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

**3. Configurar Rubocop**:

```yaml
# .rubocop.yml
require:
  - rubocop-rails
  - rubocop-rspec
  - rubocop-performance

AllCops:
  TargetRubyVersion: 3.2
  NewCops: enable
  Exclude:
    - 'db/schema.rb'
    - 'db/migrate/**/*'
    - 'vendor/**/*'
    - 'node_modules/**/*'
    - 'bin/**/*'

Style/Documentation:
  Enabled: false

Style/StringLiterals:
  EnforcedStyle: single_quotes

Metrics/BlockLength:
  Exclude:
    - 'spec/**/*'
    - 'config/routes.rb'

Metrics/MethodLength:
  Max: 15
  Exclude:
    - 'db/migrate/**/*'

Layout/LineLength:
  Max: 120
  Exclude:
    - 'spec/**/*'
```

**4. Configurar Brakeman**:

```ruby
# config/brakeman.yml
:skip_checks:
  - ContentTag # Falsos positivos comunes

:ignore_paths:
  - 'vendor/**/*'
  - 'node_modules/**/*'

:confidence_threshold: 2
```

**5. Configurar SimpleCov para cobertura**:

```ruby
# spec/spec_helper.rb (ya mencionado antes)
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  add_filter '/config/'
  
  minimum_coverage 90
  minimum_coverage_by_file 80
end
```

### Criterios de entrega:

- [ ] Workflow de CI configurado
- [ ] Tests ejecutándose en cada PR
- [ ] Linting automatizado con Rubocop
- [ ] Security checks con Brakeman
- [ ] Coverage reporting con SimpleCov/Codecov
- [ ] Deployment automatizado a staging
- [ ] Manual approval para production
- [ ] Notificaciones de Slack/Email

### Secrets necesarios en GitHub:

```
HEROKU_API_KEY
HEROKU_EMAIL
CODECOV_TOKEN
SLACK_WEBHOOK
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SENDGRID_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
```

---

## 12. Debugging y Optimización

> **Nota**: Esta sección contiene prompts para debugging, optimización de performance y resolución de problemas comunes.

### **12.1. Debugging y Resolución de Problemas**

**Prompt: Implementar herramientas de debugging y logging efectivo**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en debugging, troubleshooting y observabilidad de aplicaciones en production.

## Contexto del Proyecto

Estás implementando herramientas de debugging y logging para **VetConnect** @readme.md para facilitar la resolución de problemas en desarrollo y production.

## Tarea Principal

Configura herramientas de debugging, logging estructurado y monitoreo para identificar y resolver problemas rápidamente.

### Herramientas a implementar:

1. **Better Errors** - Debugging en desarrollo
2. **Pry/Byebug** - Debugging interactivo
3. **Lograge** - Logging estructurado
4. **Sentry** - Error tracking en production
5. **Bullet** - Detección de N+1 queries

### Implementación:

**1. Configurar herramientas de debugging**:

```ruby
# Gemfile
group :development do
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'pry-rails'
  gem 'pry-byebug'
  gem 'bullet'
  gem 'rails-erd' # Generar diagramas ERD
end

group :production do
  gem 'lograge'
  gem 'sentry-ruby'
  gem 'sentry-rails'
end
```

**2. Configurar Better Errors**:

```ruby
# config/environments/development.rb
BetterErrors::Middleware.allow_ip! "0.0.0.0/0" # En contenedores Docker

# Para Rails 7+, añadir en application.rb:
config.middleware.use BetterErrors::Middleware if Rails.env.development?
```

**3. Configurar Bullet (detectar N+1)**:

```ruby
# config/environments/development.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.alert = true
  Bullet.bullet_logger = true
  Bullet.console = true
  Bullet.rails_logger = true
  Bullet.add_footer = true
  
  # Ignorar false positives si es necesario
  Bullet.add_whitelist type: :n_plus_one_query, class_name: 'User', association: :pets
end
```

**4. Configurar Lograge**:

```ruby
# config/environments/production.rb
config.lograge.enabled = true

config.lograge.custom_options = lambda do |event|
  {
    user_id: event.payload[:user_id],
    params: event.payload[:params].except('controller', 'action', 'format', 'authenticity_token'),
    time: event.time.iso8601,
    remote_ip: event.payload[:remote_ip],
    user_agent: event.payload[:user_agent]
  }
end

config.lograge.formatter = Lograge::Formatters::Json.new
```

**5. Configurar Sentry**:

```ruby
# config/initializers/sentry.rb
Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]
  
  # Sampling
  config.traces_sample_rate = 0.5
  config.profiles_sample_rate = 0.5
  
  # Filtrar información sensible
  config.before_send = lambda do |event, hint|
    # Filtrar contraseñas de los logs
    if event.request
      event.request.data = filter_sensitive_data(event.request.data)
    end
    event
  end
  
  # Enviar contexto adicional
  config.before_send_transaction = lambda do |event, hint|
    # Añadir información del usuario si está disponible
    if Current.user
      event.set_user(
        id: Current.user.id,
        email: Current.user.email,
        role: Current.user.role
      )
    end
    event
  end
  
  # No enviar errores de ActiveRecord::RecordNotFound
  config.excluded_exceptions += ['ActiveRecord::RecordNotFound']
end

def filter_sensitive_data(data)
  return data unless data.is_a?(Hash)
  
  data.deep_transform_keys(&:to_s).tap do |filtered|
    filtered.each do |key, value|
      if key.match?(/password|secret|token|key/i)
        filtered[key] = '[FILTERED]'
      elsif value.is_a?(Hash)
        filtered[key] = filter_sensitive_data(value)
      end
    end
  end
end
```

**6. Helper de debugging personalizado**:

```ruby
# app/helpers/debug_helper.rb
module DebugHelper
  def debug_info(label, data)
    return unless Rails.env.development?
    
    content_tag :div, class: 'debug-info' do
      content_tag(:h4, label) +
      content_tag(:pre, JSON.pretty_generate(data.as_json))
    end
  end
  
  def log_query_count(&block)
    queries_count = 0
    callback = lambda { |*, payload|
      queries_count += 1 unless payload[:name] == 'CACHE'
    }
    
    ActiveSupport::Notifications.subscribed(callback, 'sql.active_record') do
      block.call
    end
    
    Rails.logger.debug "Queries executed: #{queries_count}"
    queries_count
  end
end
```

**7. Concern para logging estructurado**:

```ruby
# app/models/concerns/loggable.rb
module Loggable
  extend ActiveSupport::Concern
  
  def log_info(message, data = {})
    Rails.logger.info(build_log_message(message, data))
  end
  
  def log_error(message, exception = nil, data = {})
    log_data = build_log_message(message, data)
    
    if exception
      log_data[:exception] = {
        class: exception.class.name,
        message: exception.message,
        backtrace: exception.backtrace&.first(5)
      }
      
      Sentry.capture_exception(exception, extra: data) if Rails.env.production?
    end
    
    Rails.logger.error(log_data.to_json)
  end
  
  private
  
  def build_log_message(message, data)
    {
      timestamp: Time.current.iso8601,
      message: message,
      model: self.class.name,
      model_id: try(:id),
      user_id: Current.user&.id,
      **data
    }
  end
end

# Uso en modelos:
class Appointment < ApplicationRecord
  include Loggable
  
  after_create :log_creation
  
  private
  
  def log_creation
    log_info('Appointment created', {
      pet_id: pet_id,
      appointment_date: appointment_date,
      veterinarian_id: veterinarian_id
    })
  end
end
```

**8. Rake task para análisis de queries lentas**:

```ruby
# lib/tasks/performance.rake
namespace :performance do
  desc 'Analyze slow queries'
  task analyze_queries: :environment do
    queries = []
    
    callback = lambda do |name, started, finished, unique_id, payload|
      duration = (finished - started) * 1000 # milliseconds
      
      if duration > 100 # queries > 100ms
        queries << {
          sql: payload[:sql],
          duration: duration.round(2),
          name: payload[:name]
        }
      end
    end
    
    ActiveSupport::Notifications.subscribed(callback, 'sql.active_record') do
      # Ejecutar código a analizar
      yield if block_given?
    end
    
    if queries.any?
      puts "\n=== Slow Queries (> 100ms) ==="
      queries.each do |query|
        puts "\n[#{query[:duration]}ms] #{query[:sql]}"
      end
    else
      puts "No slow queries detected"
    end
  end
  
  desc 'Find N+1 queries in common actions'
  task find_n_plus_one: :environment do
    Bullet.enable = true
    Bullet.bullet_logger = true
    
    # Simular requests comunes
    user = User.first
    
    puts "Testing appointments index..."
    Appointment.includes(:pet, :veterinarian).limit(10).each do |appt|
      appt.pet.name
      appt.veterinarian.full_name
    end
    
    puts "\nCheck bullet.log for N+1 query warnings"
  end
end
```

### Comandos útiles de debugging:

```bash
# En desarrollo, usar pry en lugar de rails console
rails c

# Debugging de una query específica
> Appointment.where(status: 'scheduled').explain

# Ver queries ejecutadas en una sección de código
> ActiveRecord::Base.connection.execute("SET log_statement = 'all';")

# Analizar performance de un bloque de código
> result = nil
> time = Benchmark.measure { result = Pet.includes(:appointments).all }
> puts time

# Ejecutar rake task de performance
rails performance:analyze_queries
rails performance:find_n_plus_one
```

---

### **12.2. Optimización de Performance**

**Prompt: Optimizar queries y performance de la aplicación**

# Rol

Eres un Senior Ruby on Rails Engineer especializado en optimización de performance, caching strategies y database tuning.

## Contexto del Proyecto

Estás optimizando el performance de **VetConnect** @readme.md para asegurar tiempos de respuesta rápidos y escalabilidad.

## Tarea Principal

Implementa optimizaciones de performance en queries, caching y rendering para mejorar la velocidad de la aplicación.

### Áreas de optimización:

1. **Database queries** - N+1, eager loading, índices
2. **Caching** - Fragment caching, Russian doll caching
3. **Background jobs** - Mover tareas pesadas a jobs
4. **Assets** - CDN, compresión, lazy loading

### Implementación:

**1. Optimizar queries con eager loading**:

```ruby
# app/controllers/appointments_controller.rb
class AppointmentsController < ApplicationController
  def index
    # ❌ Antes (N+1 queries)
    @appointments = Appointment.all
    # En la vista: @appointments.each { |a| a.pet.name } => N queries
    
    # ✅ Después (optimizado)
    @appointments = Appointment.includes(:pet, :veterinarian, :clinic)
                               .where(user: current_user)
                               .order(appointment_date: :desc)
                               .page(params[:page])
                               .per(20)
  end
  
  def show
    @appointment = Appointment.includes(
      pet: [:user],
      veterinarian: :clinic,
      medical_record: [:documents]
    ).find(params[:id])
  end
end

# app/controllers/pets_controller.rb
class PetsController < ApplicationController
  def show
    @pet = Pet.includes(
      appointments: [:veterinarian, :clinic],
      vaccinations: [],
      documents: []
    ).find(params[:id])
    
    # Precargar estadísticas
    @stats = {
      total_appointments: @pet.appointments.count,
      upcoming_appointments: @pet.appointments.upcoming.count,
      completed_vaccinations: @pet.vaccinations.completed.count
    }
  end
end
```

**2. Implementar caching con Redis**:

```ruby
# config/environments/production.rb
config.cache_store = :redis_cache_store, {
  url: ENV['REDIS_URL'],
  namespace: 'vetconnect_cache',
  expires_in: 90.minutes
}

# app/models/pet.rb
class Pet < ApplicationRecord
  # Cache expensive calculations
  def vaccination_status
    Rails.cache.fetch("pet_#{id}_vaccination_status", expires_in: 1.hour) do
      calculate_vaccination_status
    end
  end
  
  private
  
  def calculate_vaccination_status
    # Expensive calculation...
    vaccinations.group_by(&:vaccine_type).transform_values do |vaccines|
      vaccines.sort_by(&:administered_date).last
    end
  end
end

# app/views/pets/show.html.erb
# Fragment caching
<% cache @pet do %>
  <div class="pet-info">
    <%= render @pet %>
  </div>
<% end %>

<% cache ['pet-appointments', @pet, @pet.appointments.maximum(:updated_at)] do %>
  <div class="appointments">
    <%= render @pet.appointments %>
  </div>
<% end %>

# Russian doll caching
<% cache @pet do %>
  <h2><%= @pet.name %></h2>
  
  <% @pet.appointments.each do |appointment| %>
    <% cache appointment do %>
      <%= render appointment %>
    <% end %>
  <% end %>
<% end %>
```

**3. Añadir índices de base de datos**:

```ruby
# db/migrate/YYYYMMDDHHMMSS_add_performance_indexes.rb
class AddPerformanceIndexes < ActiveRecord::Migration[7.1]
  def change
    # Índices compuestos para queries comunes
    add_index :appointments, [:user_id, :appointment_date]
    add_index :appointments, [:veterinarian_id, :status, :appointment_date]
    add_index :appointments, [:clinic_id, :appointment_date]
    
    # Índice parcial para appointments activos
    add_index :appointments, :appointment_date, 
              where: "status IN ('scheduled', 'confirmed')",
              name: 'index_appointments_on_date_active'
    
    # Índices para búsquedas frecuentes
    add_index :pets, [:user_id, :active]
    add_index :pets, [:species, :active]
    
    # Índice para texto completo (PostgreSQL)
    add_index :pets, :name, using: :gin, opclass: :gin_trgm_ops
    
    # Índices para foreign keys
    add_index :medical_records, :appointment_id
    add_index :vaccinations, [:pet_id, :due_date]
    add_index :documents, [:pet_id, :document_type]
  end
end
```

**4. Optimizar queries con scopes y select**:

```ruby
# app/models/appointment.rb
class Appointment < ApplicationRecord
  # Scope optimizado que solo selecciona campos necesarios
  scope :for_calendar, -> {
    select(:id, :appointment_date, :duration_minutes, :reason, :status, :pet_id, :veterinarian_id)
      .includes(pet: :user, veterinarian: :clinic)
  }
  
  # Scope con eager loading optimizado
  scope :with_details, -> {
    includes(
      pet: { user: :clinic },
      veterinarian: :clinic,
      medical_record: { documents: :file_attachment }
    )
  }
  
  # Counter cache para evitar COUNT queries
  belongs_to :pet, counter_cache: true
  belongs_to :veterinarian, counter_cache: :appointments_count
end

# Migración para counter cache
class AddCounterCacheColumns < ActiveRecord::Migration[7.1]
  def change
    add_column :pets, :appointments_count, :integer, default: 0, null: false
    add_column :users, :appointments_count, :integer, default: 0, null: false
    
    # Inicializar counters
    reversible do |dir|
      dir.up do
        Pet.find_each do |pet|
          Pet.reset_counters(pet.id, :appointments)
        end
        
        User.where(role: [:veterinarian, :admin]).find_each do |user|
          User.reset_counters(user.id, :appointments)
        end
      end
    end
  end
end

# Uso:
pet.appointments_count # No ejecuta query, usa counter cache
```

**5. Paginación eficiente**:

```ruby
# Usar Kaminari o Pagy
gem 'pagy'

# app/controllers/application_controller.rb
include Pagy::Backend

# app/controllers/appointments_controller.rb
def index
  @pagy, @appointments = pagy(
    Appointment.includes(:pet, :veterinarian).order(created_at: :desc),
    items: 20
  )
end

# app/helpers/application_helper.rb
include Pagy::Frontend
```

**6. Mover operaciones pesadas a background jobs**:

```ruby
# ❌ Antes: Enviar email en el request
class AppointmentsController < ApplicationController
  def create
    @appointment = Appointment.new(appointment_params)
    
    if @appointment.save
      AppointmentMailer.confirmation(@appointment).deliver_now # ⚠️ Lento
      redirect_to @appointment
    end
  end
end

# ✅ Después: Mover a background job
class AppointmentsController < ApplicationController
  def create
    @appointment = Appointment.new(appointment_params)
    
    if @appointment.save
      SendEmailJob.perform_later('AppointmentMailer', 'confirmation', @appointment)
      redirect_to @appointment
    end
  end
end

# Mejor aún: Usar callbacks con jobs
class Appointment < ApplicationRecord
  after_create :send_confirmation_email
  
  private
  
  def send_confirmation_email
    SendEmailJob.perform_later('AppointmentMailer', 'confirmation', self)
  end
end
```

**7. Configurar CDN y compresión de assets**:

```ruby
# config/environments/production.rb
config.action_controller.asset_host = ENV['CDN_HOST']

# Habilitar compresión
config.middleware.use Rack::Deflater

# Precompilación de assets
config.assets.compile = false
config.assets.digest = true
config.public_file_server.headers = {
  'Cache-Control' => 'public, max-age=31536000'
}
```

**8. Monitoring y alertas de performance**:

```ruby
# config/initializers/performance_monitoring.rb
ActiveSupport::Notifications.subscribe 'process_action.action_controller' do |name, started, finished, unique_id, payload|
  duration = (finished - started) * 1000
  
  if duration > 1000 # Request > 1 segundo
    Rails.logger.warn({
      event: 'slow_request',
      controller: payload[:controller],
      action: payload[:action],
      duration: duration,
      view_runtime: payload[:view_runtime],
      db_runtime: payload[:db_runtime]
    }.to_json)
    
    # Enviar a Sentry
    Sentry.capture_message(
      "Slow request: #{payload[:controller]}##{payload[:action]}",
      level: :warning,
      extra: payload
    )
  end
end
```

### Benchmarking y testing de performance:

```ruby
# spec/performance/appointments_spec.rb
require 'rails_helper'

RSpec.describe 'Appointments performance', type: :performance do
  let!(:user) { create(:user, :owner) }
  let!(:pets) { create_list(:pet, 3, user: user) }
  let!(:appointments) { create_list(:appointment, 50, pet: pets.sample) }
  
  it 'loads appointments index efficiently' do
    expect {
      get appointments_path, as: user
    }.to perform_queries(count: be <= 5)
  end
  
  it 'completes request within acceptable time' do
    expect {
      get appointments_path, as: user
    }.to perform_in(be <= 200.milliseconds)
  end
end

# Helper para performance tests
RSpec::Matchers.define :perform_queries do |expected|
  supports_block_expectations
  
  match do |block|
    query_count = 0
    
    callback = lambda do |*, payload|
      query_count += 1 unless payload[:name] == 'CACHE'
    end
    
    ActiveSupport::Notifications.subscribed(callback, 'sql.active_record') do
      block.call
    end
    
    @actual = query_count
    expected.matches?(@actual)
  end
  
  failure_message do
    "expected to perform #{expected.description} queries, but performed #{@actual}"
  end
end
```

### Comandos de optimización:

```bash
# Analizar queries lentas en PostgreSQL
rails dbconsole
> SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;

# Ver índices de una tabla
> \d+ appointments

# Analizar plan de ejecución de una query
rails c
> Appointment.where(status: 'scheduled').explain

# Benchmark de un bloque de código
> Benchmark.bm do |x|
>   x.report("without includes") { Appointment.limit(100).map { |a| a.pet.name } }
>   x.report("with includes") { Appointment.includes(:pet).limit(100).map { |a| a.pet.name } }
> end
```

---

## Resumen de Prompts

Esta colección de prompts cubre todo el ciclo de vida del desarrollo de **VetConnect**:

### Documentación (Secciones 1-7)
- Descripción general del producto
- Arquitectura del sistema
- Modelo de datos
- Especificación de API
- Historias de usuario
- Tickets de trabajo
- Pull requests

### Desarrollo (Secciones 8-10)
- **Sección 8**: Implementación de funcionalidades core (Auth, Pets, Appointments)
- **Sección 9**: Testing completo (RSpec, FactoryBot, Coverage)
- **Sección 10**: Integraciones externas (Twilio SMS, SendGrid Email, AWS S3)

### DevOps y Calidad (Secciones 11-12)
- **Sección 11**: CI/CD con GitHub Actions, deployment automatizado
- **Sección 12**: Debugging, logging, optimización de performance

### Uso Recomendado

1. **Inicio del proyecto**: Usar prompts de secciones 1-3 para documentación base
2. **Desarrollo iterativo**: Seguir prompts de sección 8 para implementar funcionalidades
3. **Testing continuo**: Aplicar prompts de sección 9 durante todo el desarrollo
4. **Integraciones**: Usar prompts de sección 10 cuando se necesite conectar servicios externos
5. **Pre-producción**: Implementar prompts de secciones 11-12 antes del lanzamiento

---
