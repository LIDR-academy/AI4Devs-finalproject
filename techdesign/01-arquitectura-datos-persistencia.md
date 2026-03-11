# 📊 Arquitectura de Datos y Persistencia

## Propósito del Análisis

Este documento analiza la estrategia dual de inicialización de base de datos implementada en el proyecto SEPE Templates Comparator, evaluando la interacción entre archivos SQL de inicialización y el sistema de migraciones Alembic.

## 🔍 Análisis de la Doble Estrategia de Inicialización

### 1. Carpeta `database/init` (Archivos SQL)

**Ubicación**: `/database/init/01-create-database.sql`

**Propósito**: Inicialización básica del entorno de base de datos

- Creación de la base de datos `sepe_comparator`
- Creación del usuario `sepe_user` con permisos
- Instalación de extensiones PostgreSQL críticas:
  - `uuid-ossp`: Generación de UUIDs
  - `pg_trgm`: Búsqueda de texto con trigramas (crítico para IA/búsqueda)
  - `unaccent`: Normalización de texto (esencial para español)

**Integración con Docker**:

```yaml
volumes:
  - ./database/init:/docker-entrypoint-initdb.d
```

### 2. Carpeta `backend/alembic` (Migraciones Python)

**Ubicación**: `/backend/alembic/`

**Propósito**: Gestión evolutiva del esquema de datos

- Control de versiones del esquema
- Migraciones automáticas y rollbacks
- Sincronización entre entornos

**Configuración clave**:

- `alembic.ini`: Configuración principal
- `env.py`: Lógica de conexión y migración
- `versions/`: Historial de cambios del esquema

## 🔗 Interacción Dockerfile + Alembic

### Flujo de Inicialización

1. **Fase Docker**: PostgreSQL ejecuta scripts en `/docker-entrypoint-initdb.d`

   - Se ejecuta `01-create-database.sql`
   - Se crean usuario, DB y extensiones básicas

2. **Fase Aplicación**: Backend ejecuta migraciones Alembic
   - `alembic upgrade head` crea las tablas de aplicación
   - Se aplican todas las migraciones pendientes

### Problema Identificado en `env.py` - ✅ RESUELTO

**✅ SOLUCIONADO**: El archivo `env.py` ha sido corregido para usar configuración dinámica:

```python
def run_migrations_online() -> None:
    # Get database URL from settings or environment
    url = settings.DATABASE_URL

    # If URL is not available from settings, try to get it from alembic config
    if not url:
        url = config.get_main_option("sqlalchemy.url")

    # Set the URL in the alembic configuration
    config.set_main_option("sqlalchemy.url", url)
```

La configuración ahora **respeta las variables de entorno** y es compatible con todos los entornos de despliegue.

## 📋 Evaluación de Consistencia del Esquema

### ✅ Fortalezas

1. **Separación de Responsabilidades**:

   - SQL init: Configuración de infraestructura
   - Alembic: Esquema de aplicación

2. **Extensiones Preparadas para IA**:

   - `pg_trgm`: Búsqueda semántica y similitud de texto
   - `unaccent`: Normalización para procesamiento de texto en español
   - `uuid-ossp`: Identificadores únicos para documentos

3. **Migración Automática**: Sistema preparado para evolución del esquema

### ⚠️ Riesgos y Problemas

1. **✅ RESUELTO - Configuración Hardcodeada**: `env.py` ahora usa variables de entorno
2. **Dependencia de Orden**: SQL init debe ejecutarse antes que Alembic
3. **Falta de Validación**: No hay verificación de que las extensiones estén disponibles

## 🔧 Recomendaciones para Fase 2

### Críticas (Deben Implementarse)

1. **✅ COMPLETADO - Corregir `env.py`**: Ya usa `settings.DATABASE_URL` dinámicamente

2. **Añadir Validación de Extensiones**:

```python
def check_extensions():
    """Verificar que las extensiones requeridas están instaladas"""
    required_extensions = ['uuid-ossp', 'pg_trgm', 'unaccent']
    # Lógica de verificación
```

### Mejoras para IA/PDF Processing

1. **Extensiones Adicionales**:

   - `vector`: Para embeddings de IA (PostgreSQL 15+)
   - `pg_stat_statements`: Optimización de queries

2. **Índices Especializados**:
   - GIN indexes para búsqueda de texto completo
   - Índices para campos de metadatos PDF

## 🎯 Impacto en Fase 2

### Facilitadores

- ✅ Extensiones `pg_trgm` y `unaccent` listas para procesamiento de texto
- ✅ Sistema de migraciones preparado para nuevas tablas de IA
- ✅ UUIDs para identificación única de documentos

### Bloqueadores

- ❌ Configuración hardcodeada puede causar fallos en despliegue
- ❌ Falta de validación puede generar errores silenciosos
- ❌ No hay estrategia para datos de entrenamiento/embeddings

## 📊 Relación con el Stack

Este componente es **fundamental** para:

- **Backend FastAPI**: Provee la capa de persistencia
- **Worker Celery**: Almacena resultados de procesamiento de PDF
- **Frontend**: Datos para visualización de comparaciones
- **IA/ML Pipeline**: Base para almacenar embeddings y metadatos

La solidez de esta capa determina la escalabilidad de toda la Fase 2.
