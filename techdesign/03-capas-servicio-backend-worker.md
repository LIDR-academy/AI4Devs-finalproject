# 🏗️ Capas de Servicio (Backend y Worker)

## Propósito del Análisis

Evaluación de la arquitectura de microservicios con separación entre el servicio `backend` (FastAPI, API REST) y el servicio `worker` (Celery), analizando su preparación para el procesamiento pesado de PDF en la Fase 2.

## 🔍 Arquitectura de Servicios

### Backend Service (FastAPI)

**Propósito**: API REST y lógica de aplicación
**Tecnología**: FastAPI + Uvicorn
**Puerto**: 8000

**Responsabilidades Actuales**:

- Autenticación y autorización JWT
- CRUD de templates y comparaciones
- Endpoints de API REST
- Validación de datos con Pydantic
- Gestión de uploads de archivos

**Configuración del Contenedor**:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  environment:
    - DATABASE_URL=postgresql://...
    - REDIS_URL=redis://...
```

### Worker Service (Celery)

**Propósito**: Procesamiento asíncrono de tareas pesadas
**Tecnología**: Celery + Redis
**Comando**: `celery -A app.services.celery_app worker --loglevel=info`

**Responsabilidades Diseñadas**:

- Procesamiento de PDF en background
- Extracción de metadatos
- Comparación de templates
- Tareas de larga duración

**Configuración del Contenedor**:

```yaml
worker:
  build:
    context: ./backend # ¡Mismo contexto que backend!
    dockerfile: Dockerfile
  command: celery -A app.services.celery_app worker --loglevel=info
  environment:
    - DATABASE_URL=postgresql://...
    - REDIS_URL=redis://...
```

## 🔗 Conexión a Redis

### Configuración en Docker Compose

**Redis Container**:

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
  ports:
    - "${REDIS_PORT:-6379}:6379"
```

**Variables de Conexión**:

- Backend: `REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379`
- Worker: `REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379`

### Uso Dual de Redis

1. **Caching** (Backend):

   - Cache de resultados de API
   - Sesiones de usuario
   - Datos temporales

2. **Message Broker** (Celery):
   - Cola de tareas
   - Resultados de workers
   - Estado de tareas

## 📊 Análisis de Segregación de Responsabilidades

### ✅ Separación Correcta

**Backend (Síncrono)**:

- Validación de entrada
- Autenticación/autorización
- Respuestas inmediatas
- Gestión de estado de aplicación

**Worker (Asíncrono)**:

- Procesamiento de archivos PDF
- Operaciones de larga duración
- Cálculos intensivos
- Tareas que pueden fallar y reintentarse

### 🎯 Preparación para Fase 2 (PDF Processing)

**Tareas Ideales para Worker**:

- ✅ Extracción de campos AcroForm
- ✅ Análisis de estructura de PDF
- ✅ Comparación de templates
- ✅ Generación de reportes
- ✅ Procesamiento con IA/ML

**Flujo Propuesto**:

```
Usuario → Backend → Queue → Worker → Results → Backend → Usuario
      (upload)  (task)  (process) (store)  (status)
```

## 🔍 Análisis de Implementación Actual

### Problema: Celery App No Encontrada

**Búsqueda realizada**:

```
grep -i celery backend/
```

**Resultado**: Solo referencias en:

- `requirements.txt`: `celery[redis]==5.3.4`
- `README.md`: Mención de integración
- `env.example`: Configuración de Redis

**⚠️ PROBLEMA CRÍTICO**: No existe `app.services.celery_app`

### Estructura de Servicios Actual

**Directorio `/backend/app/services/`**:

```
services/
└── __init__.py  # Solo archivo vacío
```

**Implicación**: El worker no puede iniciarse correctamente.

## 🚨 Problemas Identificados

### Críticos

1. **Celery App Inexistente**:

   - Docker comando: `celery -A app.services.celery_app worker`
   - Archivo: `app/services/celery_app.py` NO EXISTE
   - Estado: Worker fallará al iniciar

2. **Shared Dockerfile**:

   - Backend y Worker usan el mismo Dockerfile
   - Instala dependencias de desarrollo en worker
   - Ineficiente para producción

3. **Falta de Task Definitions**:
   - No hay tareas Celery definidas
   - No hay decoradores `@celery.task`
   - No hay lógica de procesamiento PDF

### Menores

1. **Logging Inconsistente**:

   - Backend: `--log-level debug`
   - Worker: `--loglevel=info`

2. **Concurrency No Configurada**:
   - Worker usa configuración por defecto
   - No optimizado para tareas PDF

## 🔧 Implementación Faltante

### 1. Celery App Configuration

**Archivo Requerido**: `/backend/app/services/celery_app.py`

```python
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "sepe_comparator",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.services.pdf_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
```

### 2. PDF Processing Tasks

**Archivo Requerido**: `/backend/app/services/pdf_tasks.py`

```python
from celery import current_task
from .celery_app import celery_app

@celery_app.task(bind=True)
def process_pdf_template(self, file_path: str, template_id: str):
    """Process PDF template in background"""
    # Lógica de procesamiento PDF
    pass

@celery_app.task(bind=True)
def compare_templates(self, template_id_1: str, template_id_2: str):
    """Compare two templates asynchronously"""
    # Lógica de comparación
    pass
```

### 3. Backend Integration

**Archivo**: `/backend/app/api/v1/templates.py`

```python
from app.services.pdf_tasks import process_pdf_template

@router.post("/upload")
async def upload_template(file: UploadFile):
    # Save file
    # Queue processing task
    task = process_pdf_template.delay(file_path, template_id)
    return {"task_id": task.id, "status": "processing"}
```

## 🎯 Evaluación para Fase 2

### Arquitectura: ✅ EXCELENTE

**Fortalezas**:

- Separación clara de responsabilidades
- Redis como broker robusto
- Escalabilidad horizontal preparada
- Fault tolerance con reintentos

### Implementación: ❌ INCOMPLETA

**Faltante Crítico**:

- Celery app configuration
- Task definitions
- Error handling
- Monitoring y métricas

## 🚀 Recomendaciones para Fase 2

### Inmediatas (Críticas)

1. **Crear Celery App**:

   - Implementar `celery_app.py`
   - Definir tareas básicas de PDF
   - Configurar serialización y timezone

2. **Separar Dockerfiles**:

   - `Dockerfile.worker` específico
   - Optimizar dependencias por servicio
   - Reducir tamaño de imágenes

3. **Implementar Task Monitoring**:
   - Flower para UI de monitoreo
   - Health checks específicos
   - Métricas de performance

### Mejoras para IA/PDF Processing

1. **Task Specialization**:

   - Worker pools especializados
   - Routing por tipo de tarea
   - Priority queues

2. **Resource Management**:

   - Memory limits por tarea
   - Timeout configuration
   - Concurrency tuning

3. **Error Handling**:
   - Retry policies inteligentes
   - Dead letter queues
   - Alerting automático

## 📊 Relación con el Stack

### Dependencias Upstream

- **PostgreSQL**: Almacena estado de tareas y resultados
- **Redis**: Message broker y result backend
- **Frontend**: Consulta estado de tareas vía API

### Dependencias Downstream

- **File Storage**: Acceso a archivos PDF
- **IA Services**: Llamadas a APIs de procesamiento
- **Notification System**: Alertas de finalización

## 🏁 Conclusión

La **arquitectura es excelente** para Fase 2, pero la **implementación está incompleta**.

**Estado Actual**: 🔴 Bloqueador - Worker no funciona
**Esfuerzo Requerido**: 2-3 días de desarrollo
**Impacto en Fase 2**: Alto - Crítico para procesamiento PDF

La separación backend/worker es **perfecta** para tareas de IA, pero requiere implementación inmediata para ser funcional.
