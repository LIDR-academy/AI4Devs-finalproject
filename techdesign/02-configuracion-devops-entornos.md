# ⚙️ Configuración y Entorno (DevOps)

## Propósito del Análisis

Evaluación exhaustiva de la gestión de configuración y variables de entorno para los servicios `backend`, `worker` y la infraestructura de contenedores, con foco en la preparación para Azure/PostgreSQL/Redis.

## 🔧 Análisis de Archivos de Configuración

### 1. `backend/alembic.ini`

**Propósito**: Configuración de migraciones de base de datos
**Ubicación**: `/backend/alembic.ini`

**Características clave**:

- Configuración estándar de Alembic
- **Problema**: URL de base de datos comentada (línea 63-64)
- Logging configurado para desarrollo
- Post-write hooks preparados para Black/Ruff

**Evaluación**: ✅ Bien estructurado, pero requiere configuración de URL dinámica

### 2. `backend/alembic/env.py`

**Propósito**: Lógica de ejecución de migraciones
**Ubicación**: `/backend/alembic/env.py`

**⚠️ PROBLEMA CRÍTICO**:

```python
connection_params = {
    "host": "localhost",
    "port": "5432",
    "username": "sepe_user",
    "password": "sepe_password", # HARDCODED!
    "database": "sepe_comparator"
}
```

**Impacto**: Migraciones fallarán en Azure/producción

### 3. `backend/app/core/config.py`

**Propósito**: Configuración centralizada de la aplicación
**Ubicación**: `/backend/app/core/config.py`

**✅ Fortalezas**:

- Uso de `pydantic-settings` para validación
- Variables de entorno con valores por defecto
- Validadores para entornos y hosts
- Configuración específica para JWT, uploads, logging

**⚠️ Limitaciones**:

- No incluye configuración específica de Azure
- Falta configuración de Redis para Celery
- No hay configuración para métricas/monitoring

## 🐳 Gestión de Variables de Entorno por Contenedor

### Backend Container

**Variables Definidas**:

```yaml
environment:
  - ENVIRONMENT=${ENVIRONMENT:-development}
  - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
  - JWT_SECRET_KEY=${JWT_SECRET_KEY}
  - SECRET_KEY=${SECRET_KEY}
  - ALLOWED_HOSTS=${ALLOWED_HOSTS}
  - DEBUG=${DEBUG:-true}
```

**✅ Evaluación**: Bien estructurado con fallbacks

### Worker Container

**Variables Definidas**:

```yaml
environment:
  - ENVIRONMENT=${ENVIRONMENT:-development}
  - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
  - JWT_SECRET_KEY=${JWT_SECRET_KEY}
  - SECRET_KEY=${SECRET_KEY}
```

**✅ Evaluación**: Consistente con backend, preparado para Celery

### PostgreSQL Container

**Variables Definidas**:

```yaml
environment:
  POSTGRES_DB: ${POSTGRES_DB:-sepe_comparator}
  POSTGRES_USER: ${POSTGRES_USER:-sepe_user}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-sepe_password}
  POSTGRES_HOST_AUTH_METHOD: trust
```

**⚠️ Problema**: `trust` auth method es inseguro para producción

### Redis Container

**Variables Definidas**:

```yaml
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis_password}
```

**✅ Evaluación**: Configuración segura con persistencia

## 📄 Análisis de Archivos `env.example`

### Root Level `/env.example`

**Cobertura Completa**:

- ✅ Variables de base de datos
- ✅ Variables de Redis
- ✅ Configuración de backend
- ✅ Configuración de frontend
- ✅ Configuración de seguridad

### Backend Level `/backend/env.example`

**Configuración Específica**:

- ✅ Configuración de aplicación
- ✅ JWT y seguridad
- ✅ Upload y archivos
- ⚠️ **Falta**: Configuración específica de Celery

## 🔍 Diferencias entre Entornos

### Desarrollo (`docker-compose.dev.yml`)

**Optimizaciones**:

- Comando con `--reload` para desarrollo
- Volúmenes con `:cached` para performance
- Puertos de debug expuestos (5678)
- Log level DEBUG
- Redis sin password para simplicidad

### Producción (`docker-compose.yml`)

**Configuración Segura**:

- Redis con password requerido
- Health checks robustos
- Restart policies configuradas
- Usuarios no-root en contenedores

## 📋 Análisis de Dependencias

### `requirements.txt` (Producción)

**✅ Dependencias Justificadas para IA/FastAPI**:

- `fastapi==0.104.1`: Framework web moderno
- `PyPDF2==3.0.1` + `pdfplumber==0.10.3`: Procesamiento PDF
- `celery[redis]==5.3.4`: Tareas asíncronas
- `sqlalchemy==2.0.23`: ORM robusto
- `pydantic[email]==2.5.0`: Validación de datos
- `psycopg2-binary==2.9.9`: Driver PostgreSQL

**Evaluación**: ✅ Stack completo y bien dimensionado

### `requirements-dev.txt` (Desarrollo)

**✅ Herramientas de Desarrollo**:

- `pytest==7.4.3` + plugins: Testing completo
- `black==23.11.0` + `isort==5.12.0`: Formateo de código
- `mypy==1.7.1`: Type checking
- `pre-commit==3.5.0`: Hooks de calidad

**Evaluación**: ✅ Excelente setup de desarrollo

## 🚨 Problemas Identificados

### Críticos

1. **Alembic env.py hardcodeado**: Bloqueará despliegues
2. **PostgreSQL trust auth**: Inseguro para producción
3. **Falta configuración Azure**: No hay variables para servicios cloud

### Menores

1. **Redis dev sin password**: Inconsistencia entre entornos
2. **Falta métricas**: No hay configuración para monitoring
3. **Logs sin rotación**: Pueden crecer indefinidamente

## 🔧 Recomendaciones para Fase 2

### Inmediatas (Críticas)

1. **Corregir `env.py`**:

```python
# En lugar de hardcodear, usar:
url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
```

2. **Añadir configuración Azure**:

```python
# En config.py
AZURE_STORAGE_ACCOUNT: Optional[str] = None
AZURE_STORAGE_KEY: Optional[str] = None
AZURE_COGNITIVE_SERVICES_KEY: Optional[str] = None
```

3. **Configurar Redis para Celery**:

```python
# En config.py
REDIS_URL: str = "redis://localhost:6379/0"
CELERY_BROKER_URL: str = REDIS_URL
CELERY_RESULT_BACKEND: str = REDIS_URL
```

### Mejoras para Producción

1. **Secrets Management**:

   - Usar Docker secrets o Azure Key Vault
   - Rotar passwords automáticamente

2. **Monitoring y Observabilidad**:

   - Variables para Prometheus/Grafana
   - Configuración de structured logging

3. **Escalabilidad**:
   - Variables para connection pooling
   - Configuración de worker scaling

## 🎯 Impacto en Fase 2 (IA/PDF Processing)

### Facilitadores

- ✅ Celery configurado para tareas pesadas
- ✅ Redis listo para caching de resultados
- ✅ PostgreSQL con extensiones para búsqueda
- ✅ Variables de entorno bien estructuradas

### Bloqueadores

- ❌ Alembic hardcodeado impedirá despliegues
- ❌ Falta configuración para servicios de IA
- ❌ No hay gestión de secrets para APIs externas

## 📊 Relación con el Stack

Este componente es **crítico** para:

- **Despliegue**: Determina éxito/fallo en diferentes entornos
- **Escalabilidad**: Configuración afecta performance
- **Seguridad**: Gestión de secrets y accesos
- **Mantenibilidad**: Facilita o dificulta operaciones

La configuración actual es **sólida para desarrollo** pero requiere **mejoras críticas** para producción y Fase 2.
