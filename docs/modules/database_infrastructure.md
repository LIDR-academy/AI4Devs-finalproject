# Módulo Capa de Datos e Infraestructura: Especificación Técnica

## 1. Stack Tecnológico de Datos
- **Base de Datos Relacional:** PostgreSQL 15+
- **ORM:** Prisma
- **Cache & Mensajería:** Redis 7+
- **Almacenamiento de Archivos:** AWS S3 (o MinIO para desarrollo local)

## 2. Modelo de Datos Relacional (PostgreSQL)
El esquema se define mediante `prisma.schema`. Se siguen principios ACID estrictos.

**Prácticas Generales:**
*   **Primary Keys (PK):** Se utiliza `UUID v4` en todas las tablas para seguridad y escalabilidad.
*   **Auditoría:** Todas las tablas incluyen `created_at` y `updated_at`. Tablas críticas incluyen `deleted_at` para Soft Deletes.

### Diagrama ER (Mermaid)

```mermaid
erDiagram
    %% User Management
    User {
        UUID id PK
        String email UK
        String password_hash
        String full_name
        Enum role "ADMIN | CLIENT"
        Enum subscription_tier "FREE | PRO"
        DateTime created_at
        DateTime updated_at
    }

    %% Project & Access
    Project {
        UUID id PK
        String title
        UUID architect_id FK
        Enum status "ACTIVE | ARCHIVED"
        DateTime created_at
        DateTime updated_at
        DateTime deleted_at
    }

    ProjectMember {
        UUID project_id PK, FK
        UUID user_id PK, FK
        Enum role "OWNER | EDITOR | VIEWER"
        DateTime assigned_at
    }
    
    Invitation {
        UUID id PK
        UUID project_id FK
        String email
        String token UK
        DateTime expires_at
        Enum status "PENDING | ACCEPTED | EXPIRED"
    }

    %% Core Domain: Plans & Layers
    Plan {
        UUID id PK
        UUID project_id FK
        String sheet_name "Nombre de la hoja (ej: Planta Baja)"
        Int version "Incremental para el mismo sheet_name"
        Enum lifecycle_status "DRAFT | ACTIVE | ARCHIVED"
        DateTime created_at
        DateTime updated_at
    }

    Layer {
        UUID id PK
        UUID plan_id FK
        String name "Nombre descriptivo"
        String description "Detalles adicionales"
        String image_url
        Enum status "PENDING | PROCESSING | READY | ERROR"
        Int order "Z-Index"
        Enum type "BASE | OVERLAY"
        Float opacity_default "0.0 a 1.0"
        DateTime created_at
    }

    %% Collaboration
    Pin {
        UUID id PK
        UUID layer_id FK
        Decimal x_coord "Coordenada normalizada 0.0-1.0"
        Decimal y_coord "Coordenada normalizada 0.0-1.0"
        Enum status "OPEN | RESOLVED"
        UUID created_by FK "Nullable para guests"
        String guest_name "Identificador de invitado"
        DateTime deleted_at "Soft delete"
        DateTime created_at
        DateTime updated_at
    }

    Comment {
        UUID id PK
        UUID pin_id FK
        UUID author_id FK "Nullable para guests"
        String guest_name "Identificador de invitado"
        Text content
        DateTime deleted_at "Soft delete"
        DateTime created_at
        DateTime updated_at
    }

    %% Relationships
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "member of"
    User ||--o{ Pin : "creates"
    User ||--o{ Comment : "authors"
    Project ||--o{ ProjectMember : "members"
    Project ||--o{ Plan : "versions/sheets"
    Plan ||--o{ Layer : "layers"
    Layer ||--o{ Pin : "annotations"
    Pin ||--o{ Comment : "discussion"
```

### Detalle de Entidades

#### Usuarios y Accesos
*   **User:**
    *   `id` (UUID), `email`, `role`, `subscription_tier` (gestión manual para MVP).
*   **Project:**
    *   `id` (UUID), `architect_id` (Owner), `status`.
    *   Soporta Soft Delete (`deleted_at`).
*   **ProjectMember:**
    *   Tabla pivote para M:N. Define permisos granulares.

#### Núcleo: Planos y Capas
*   **Plan:** Representa una **Versión (Revision)** de una Hoja de Plano específica.
    *   `project_id`: Proyecto padre.
    *   `sheet_name`: Identificador de la hoja (ej: "Planta Baja"). Permite agrupar versiones de un mismo dibujo.
    *   `version`: Entero incremental. "Planta Baja v1", "Planta Baja v2".
    *   `status`: Máquina de estados para el procesado de imágenes asíncrono.
*   **Layer:** Componentes visuales de un Plan (ej: Estado Actual vs Reforma).
    *   `name`: Nombre corto (ej: "Propuesta A").
    *   `description`: Información añadida por el usuario.
    *   `type`: BASE (opaca) o OVERLAY (transparencia variable).
    *   `opacity_default`: Valor inicial para el slider (0.0 - 1.0).

#### Colaboración
*   **Pin:** Anotación posicional sobre capas de planos.
    *   Vinculado a un `Layer` específico. Los pines están asociados a capas concretas para mayor granularidad.
    *   `x_coord`, `y_coord`: Almacenados como `Decimal(10,8)` con valores normalizados (0.0 - 1.0) para responsividad. Mayor precisión que Float.
    *   `status`: Enum `PinStatus` (OPEN, RESOLVED) para flujo de trabajo de revisiones.
    *   `created_by`: Referencia nullable a `User`. Permite creación por invitados anónimos.
    *   `guest_name`: String opcional para identificar colaboradores invitados sin cuenta.
    *   `deleted_at`: Soft delete para mantener historial de colaboración.
    *   **Índices:**
        *   `(layer_id, status)`: Optimiza queries de pines activos por capa.
        *   `(created_at)`: Para ordenamiento cronológico.
*   **Comment:** Thread de discusión lineal sobre cada Pin.
    *   `pin_id`: Cascada en delete. Si se elimina el pin, se eliminan los comentarios.
    *   `author_id`: Referencia nullable a `User`. Soporta comentarios de invitados.
    *   `guest_name`: Identificador para invitados sin autenticación.
    *   `content`: Texto largo (TEXT) sin límite restrictivo.
    *   `deleted_at`: Soft delete para auditoría.
    *   **Índice:**
        *   `(pin_id, created_at)`: Optimiza carga de threads ordenados cronológicamente.
    *   **Comportamiento de Cascada:**
        *   `ON DELETE CASCADE` desde Pin: Eliminar pin elimina comentarios.
        *   `ON DELETE SET NULL` desde User: Eliminar usuario mantiene comentarios pero autor queda null.

## 3. Estrategia de Redis
Redis cumple un rol doble y crítico:

### 3.1. Gestión de Colas (BullMQ)
*   **Key Prefix:** `bull:file-processing:`
*   **Estructura:** Listas y Hash Maps nativos gestionados por la librería BullMQ.

### 3.2. Caché y Sesiones
*   **Session Store:** Claves con TTL (Time To Live) para almacenar tokens de sesión o refresh tokens invalidables.
*   **Pub/Sub Channels:**
    *   `channel:notifications`: Canal donde el Worker publica eventos (`{ userId, type: 'PLAN_READY', payload: ... }`) y la API se suscribe para reenviar vía WebSocket.

## 4. Infraestructura de Contenedores (Docker)
El proyecto se orquesta con Docker Compose para desarrollo local y despliegue simple.

### Servicios Definidos
1.  **`postgres`**: Imagen oficial de PostgreSQL. Persistencia en volumen local.
2.  **`redis`**: Imagen oficial de Redis Alpine.
3.  **`api`**: Construido desde el monorepo. Ejecuta `npm run start:api`. Expone puerto 3000.
4.  **`worker`**: Construido desde el monorepo (misma imagen que api). Ejecuta `npm run start:worker`. No expone puertos.
5.  **`frontend`**: Construido desde carpeta frontend. Servido por servidor Node interno de Nuxt (Nitro). Expone puerto 8080.

## 5. Migraciones y Seeds
*   **Prisma Migrate:** `npx prisma migrate dev` para controlar cambios en el esquema SQL.
*   **Seeding:** Script `prisma/seed.ts` para poblar la BD con usuarios de prueba y planes iniciales para desarrollo.
