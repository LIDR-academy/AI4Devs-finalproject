# Diagrama de Arquitectura - Modelo C4 (Niveles 1 y 2)

## Nivel 1: Diagrama de Contexto del Sistema

```mermaid
C4Context
    title Diagrama de Contexto - Sistema RRFinances

    Person(admin_coop, "Administrador Cooperativa", "Configura cooperativa, gestiona usuarios y roles")
    Person(oficial_credito, "Oficial de Crédito", "Gestiona clientes, apoderados y poderes")
    Person(usuario_consulta, "Usuario Consulta", "Consulta información de clientes")
    Person(superadmin, "Super Administrador", "Administra múltiples cooperativas")
    
    System(rrfinances, "RRFinances", "Sistema de gestión de clientes, apoderados y poderes para cooperativas de ahorro y crédito. Incluye búsqueda avanzada, gestión documental y auditoría completa.")
    
    System_Ext(email_service, "Servicio de Email", "Envío de notificaciones y alertas")
    System_Ext(storage_service, "Almacenamiento Externo", "Almacenamiento de documentos (poderes, identificaciones)")
    System_Ext(backup_system, "Sistema de Respaldos", "Respaldo automático de base de datos")
    
    Rel(admin_coop, rrfinances, "Configura cooperativa, gestiona usuarios", "HTTPS")
    Rel(oficial_credito, rrfinances, "Registra y consulta clientes, apoderados, poderes", "HTTPS")
    Rel(usuario_consulta, rrfinances, "Consulta información", "HTTPS")
    Rel(superadmin, rrfinances, "Administra sistema multi-cooperativa", "HTTPS")
    
    Rel(rrfinances, email_service, "Envía notificaciones", "SMTP/API")
    Rel(rrfinances, storage_service, "Almacena/recupera documentos", "S3 API/File System")
    Rel(rrfinances, backup_system, "Programa respaldos", "PostgreSQL dump/Automated")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Nivel 2: Diagrama de Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores - Sistema RRFinances

    Person(usuario, "Usuario del Sistema", "Administradores, oficiales de crédito, usuarios consulta")

    Container_Boundary(rrfinances, "RRFinances") {
        Container(spa, "Aplicación Web SPA", "Angular 17+", "Interfaz de usuario responsiva. Gestión de clientes, apoderados, poderes, catálogos. Búsqueda avanzada con filtros. Gestión de roles y permisos.")
        
        Container(api, "API REST", "NestJS + TypeScript", "Lógica de negocio, validaciones, autenticación JWT, autorización multi-tenant, auditoría, soft delete. Endpoints REST para todas las operaciones CRUD.")
        
        ContainerDb(db, "Base de Datos", "PostgreSQL 14+", "Almacena cooperativas, usuarios, clientes, apoderados, poderes, catálogos. Multi-tenant por fila (cooperativa_id). Índices optimizados. Soft delete.")
        
        Container(file_storage, "Almacenamiento Archivos", "S3 / File System", "Documentos de poderes, identificaciones, reportes exportados")
    }
    
    System_Ext(email, "Servicio Email", "Notificaciones a usuarios")
    System_Ext(backup, "Sistema Respaldos", "Respaldos automáticos BD")
    
    Rel(usuario, spa, "Usa", "HTTPS")
    Rel(spa, api, "Consume API", "JSON/HTTPS (REST)")
    Rel(api, db, "Lee/Escribe", "PostgreSQL Protocol")
    Rel(api, file_storage, "Guarda/Lee documentos", "S3 API / FS")
    Rel(api, email, "Envía emails", "SMTP/API")
    Rel(db, backup, "Respaldo programado", "pg_dump")
    
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## Detalles de los Contenedores

### 1. Aplicación Web SPA (Angular)
- **Tecnología:** Angular 17+, TypeScript, RxJS
- **Características:**
  - Diseño responsive (desktop/tablet/mobile)
  - Lazy loading por módulos
  - Guards para protección de rutas
  - Interceptors para JWT y manejo de errores
  - State management (Signals/NgRx)
  - Formularios reactivos con validaciones
  - Tablas avanzadas con paginación, ordenamiento, filtros

### 2. API REST (NestJS)
- **Tecnología:** NestJS, TypeScript, TypeORM
- **Características:**
  - Arquitectura modular (por dominio)
  - Guards para autenticación JWT y autorización por roles/permisos
  - Interceptors para auditoría automática y multi-tenant
  - Pipes para validación (class-validator)
  - DTOs para request/response
  - Soft delete en entidades críticas
  - Swagger/OpenAPI para documentación
  - Rate limiting y throttling
  - Logging estructurado

### 3. Base de Datos (PostgreSQL)
- **Tecnología:** PostgreSQL 14+
- **Características:**
  - Multi-tenant por fila (cooperativa_id en todas las tablas)
  - Row-level security policies
  - Índices compuestos (cooperativa_id + id)
  - Índices por campos de búsqueda frecuente
  - Constraints y triggers para integridad
  - Particionamiento por cooperativa (opcional, futuro)
  - Auditoría mediante triggers o interceptors
  - Soft delete con campos fecha_eliminacion

### 4. Almacenamiento de Archivos
- **Tecnología:** AWS S3 / MinIO / File System local
- **Características:**
  - Organización por cooperativa y tipo de documento
  - Versionado de documentos (opcional)
  - URLs firmadas temporales para descarga segura
  - Límites de tamaño y tipos de archivo
  - Metadatos asociados (nombre original, tamaño, mime type)

## Patrones de Arquitectura Aplicados

### Multi-tenant (Row-Level)
- Cada registro incluye `cooperativa_id`
- Guards y interceptors filtran automáticamente por cooperativa del usuario
- Aislamiento completo de datos entre cooperativas
- Escalabilidad horizontal mediante sharding futuro

### Seguridad en Capas
1. **Frontend:** Guards, interceptors, validaciones básicas
2. **API:** Autenticación JWT, autorización RBAC (roles + permisos), validación DTOs
3. **Base de Datos:** Row-level security, constraints, triggers

### Auditoría Completa
- Tabla `audit_logs` registra todas las operaciones críticas
- Interceptor automático captura usuario, IP, timestamp, datos antes/después
- Búsqueda y filtrado de logs por módulo, acción, usuario, fecha

### Soft Delete
- Entidades críticas (clientes, apoderados, poderes, usuarios) se marcan como eliminadas
- Campos: `fecha_eliminacion`, `usuario_eliminacion`, `motivo_eliminacion`
- Filtros automáticos excluyen registros eliminados en consultas normales
- Recuperación posible desde panel administrativo

## Escalabilidad y Alta Disponibilidad (Futuro)

### Horizontal Scaling
- **Frontend:** CDN para assets estáticos, múltiples instancias SPA
- **Backend:** Load balancer + N instancias API stateless
- **Base de Datos:** Read replicas para consultas, master para escrituras

### Caché
- Redis para sesiones, catálogos frecuentes, resultados de búsquedas complejas
- Invalidación automática en actualizaciones

### Monitoreo
- Logs centralizados (ELK stack / CloudWatch)
- Métricas de performance (Prometheus + Grafana)
- Alertas automáticas por errores, latencia, uso de recursos
