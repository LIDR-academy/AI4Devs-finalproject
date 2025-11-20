# 🚀 Guía de Instalación - AI Resume Agent

## 📋 Resumen Ejecutivo

### Objetivo del Documento
Esta guía proporciona instrucciones paso a paso para instalar y configurar el AI Resume Agent desde cero, incluyendo infraestructura, dependencias, configuración y despliegue.

### Prerrequisitos
- **Python 3.11+** (requerido)
- **Google Cloud Platform** account con billing habilitado
- **Git** para clonar el repositorio
- **Docker** (opcional, para desarrollo local)

---

## 🛠️ Instalación Paso a Paso

### **Paso 1: Clonar el Repositorio**

```bash
# Clonar el repositorio
git clone https://github.com/aandmaldonado/ai-resume-agent.git
cd ai-resume-agent

# Verificar estructura del proyecto
ls -la
```

**Estructura esperada**:
```
ai-resume-agent/
├── app/                    # Código fuente del backend
├── scripts/               # Scripts de setup y desarrollo
├── data/                  # Datos del portfolio
├── tests/                 # Tests unitarios
├── docs/                  # Documentación
├── Dockerfile             # Imagen Docker
├── cloudbuild.yaml        # CI/CD configuration
├── requirements.txt       # Dependencias Python
└── README.md             # Documentación principal
```

### **Paso 2: Configurar Google Cloud Platform**

#### **2.1. Autenticación y Configuración Inicial**

```bash
# Instalar Google Cloud CLI (si no está instalado)
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash

# Autenticar en GCP
gcloud auth login

# Configurar proyecto (reemplazar con tu PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Verificar configuración
gcloud config list
```

#### **2.2. Habilitar APIs Necesarias**

```bash
# Habilitar APIs requeridas
gcloud services enable \
  aiplatform.googleapis.com \
  sqladmin.googleapis.com \
  run.googleapis.com \
  storage-api.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled
```

#### **2.3. Configurar Service Accounts**

```bash
# Crear service account para Cloud Run
gcloud iam service-accounts create chatbot-runner \
  --display-name="Chatbot Cloud Run Service Account"

# Crear service account para Cloud Build
gcloud iam service-accounts create chatbot-builder \
  --display-name="Chatbot Cloud Build Service Account"

# Asignar roles necesarios
PROJECT_ID=$(gcloud config get-value project)

# Roles para Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chatbot-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chatbot-runner@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Roles para Cloud Build
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chatbot-builder@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chatbot-builder@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### **Paso 3: Setup Automático de Infraestructura**

#### **3.1. Ejecutar Script de Setup**

```bash
# Hacer ejecutable el script
chmod +x scripts/setup/setup-gcp.sh

# Ejecutar setup automático
./scripts/setup/setup-gcp.sh
```

**El script creará automáticamente**:
- ✅ Cloud SQL instance (PostgreSQL 15 + pgvector)
- ✅ Base de datos `chatbot_db`
- ✅ Artifact Registry repository
- ✅ Bucket de Cloud Storage para portfolio
- ✅ Configuración de red y seguridad

#### **3.2. Verificar Infraestructura Creada**

```bash
# Verificar Cloud SQL instance
gcloud sql instances list

# Verificar base de datos
gcloud sql databases list --instance=almapi-chatbot-db

# Verificar Artifact Registry
gcloud artifacts repositories list

# Verificar bucket de storage
gsutil ls
```

### **Paso 4: Configurar Variables de Entorno**

#### **4.1. Obtener Gemini API Key**

```bash
# Visitar https://aistudio.google.com/app/apikey
# Crear nueva API key y copiar el valor
```

#### **4.2. Crear Archivo de Configuración**

```bash
# Crear archivo .env
cat > .env << EOF
# Google Cloud Configuration
GCP_PROJECT_ID=YOUR_PROJECT_ID
GCP_REGION=europe-west1

# Gemini API Configuration
GEMINI_API_KEY=AI...  # Tu API key de Gemini

# Cloud SQL Configuration
CLOUD_SQL_CONNECTION_NAME=YOUR_PROJECT_ID:europe-west1:almapi-chatbot-db
CLOUD_SQL_HOST=34.34.149.50  # IP de tu Cloud SQL instance
CLOUD_SQL_PORT=5432
CLOUD_SQL_DB=chatbot_db
CLOUD_SQL_USER=postgres
CLOUD_SQL_PASSWORD=your_secure_password

# Cloud Storage Configuration
PORTFOLIO_BUCKET=almapi-portfolio-data

# Application Configuration
LOG_LEVEL=INFO
ENABLE_ANALYTICS=true
TESTING=false
EOF
```

#### **4.3. Configurar Secret Manager**

```bash
# Crear secretos en Secret Manager
echo -n "AI..." | gcloud secrets create gemini-api-key --data-file=-
echo -n "your_secure_password" | gcloud secrets create cloud-sql-password --data-file=-

# Verificar secretos creados
gcloud secrets list
```

### **Paso 5: Configurar Entorno de Desarrollo**

#### **5.1. Crear Entorno Virtual**

```bash
# Crear entorno virtual con Python 3.11
python3.11 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Verificar versión de Python
python --version  # Debe mostrar Python 3.11.x
```

#### **5.2. Instalar Dependencias**

```bash
# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt

# Verificar instalación
pip list | grep -E "(fastapi|langchain|sqlalchemy)"
```

**Dependencias principales**:
- `fastapi==0.115.0` - Framework web
- `langchain==0.3.0` - Framework RAG
- `sqlalchemy==2.0.0` - ORM
- `psycopg2-binary==2.9.9` - PostgreSQL driver
- `google-generativeai==0.8.3` - Gemini API
- `sentence-transformers==2.2.2` - HuggingFace embeddings

#### **5.3. Configurar Base de Datos Local (Opcional)**

```bash
# Instalar PostgreSQL localmente (opcional para desarrollo)
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15 postgresql-client-15

# Iniciar PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux

# Crear base de datos local
createdb chatbot_db_local
```

### **Paso 6: Inicializar Vector Store**

#### **6.1. Procesar Portfolio y Crear Embeddings**

```bash
# Asegurar que el entorno virtual esté activo
source venv/bin/activate

# Ejecutar script de inicialización
python scripts/setup/initialize_vector_store.py
```

**Output esperado**:
```
✓ Portfolio cargado: 190+ chunks
✓ Embeddings generados (dimensión: 384)
✓ Guardado en pgvector
✅ Vector store inicializado correctamente
```

#### **6.2. Verificar Vector Store**

```bash
# Ejecutar script de verificación
./scripts/dev/query_vectors.sh
```

**Output esperado**:
```
🗄️ Explorando Vector Store
==========================

📊 Total de Vectores: 190+
📋 Distribución por Tipo: experience, skills, projects...
🏢 Empresas en Proyectos: InAdvance, Andes Online...
✅ Query completado!
```

### **Paso 7: Configurar CI/CD con Cloud Build**

#### **7.1. Configurar Cloud Build Trigger**

```bash
# Crear trigger de Cloud Build
gcloud builds triggers create github \
  --repo-name=ai-resume-agent \
  --repo-owner=aandmaldonado \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_CLOUD_SQL_CONNECTION_NAME=$PROJECT_ID:europe-west1:almapi-chatbot-db
```

#### **7.2. Verificar Configuración de Cloud Build**

```bash
# Ver triggers configurados
gcloud builds triggers list

# Ver configuración del trigger
gcloud builds triggers describe TRIGGER_ID
```

### **Paso 8: Despliegue Automático**

#### **8.1. Commit y Push Inicial**

```bash
# Agregar archivos al git
git add .

# Commit inicial
git commit -m "feat: initial setup and configuration"

# Push a main branch (esto activará Cloud Build)
git push origin main
```

#### **8.2. Monitorear Despliegue**

```bash
# Ver builds en progreso
gcloud builds list --ongoing

# Ver logs del build
gcloud builds log BUILD_ID

# Ver servicios de Cloud Run
gcloud run services list --region=europe-west1
```

#### **8.3. Verificar Despliegue**

```bash
# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe chatbot-api \
  --region=europe-west1 \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test de health check
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "$SERVICE_URL/api/v1/health"

# ⚠️ NOTA: El backend es PRIVADO y requiere autenticación GCP
```

### **Paso 9: Desarrollo Local**

#### **9.1. Iniciar Servidor de Desarrollo**

```bash
# Método rápido con script
./scripts/setup/start-local.sh

# Método manual
source venv/bin/activate
uvicorn app.main:app --reload --port 8080 --host 0.0.0.0
```

#### **9.2. Probar API Localmente**

```bash
# Health check local
curl http://localhost:8080/api/v1/health

# Test de chat local
curl -X POST http://localhost:8080/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Cuál es tu experiencia profesional?", "session_id":"test-local"}'

# ⚠️ NOTA: En producción, el backend es PRIVADO y requiere autenticación GCP
```

#### **9.3. Interfaz de Testing**

```bash
# En otro terminal, iniciar servidor HTTP
python3 -m http.server 3000

# Abrir en navegador
open http://localhost:3000/test-local.html
```

---

## 🔧 Configuración Avanzada

### **Variables de Entorno Completas**

```bash
# .env completo
cat > .env << EOF
# Google Cloud Configuration
GCP_PROJECT_ID=YOUR_PROJECT_ID
GCP_REGION=europe-west1

# Gemini API Configuration
GEMINI_API_KEY=AI...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
GEMINI_TOP_P=0.7
GEMINI_MAX_TOKENS=512

# Cloud SQL Configuration
CLOUD_SQL_CONNECTION_NAME=YOUR_PROJECT_ID:europe-west1:almapi-chatbot-db
CLOUD_SQL_HOST=34.34.149.50
CLOUD_SQL_PORT=5432
CLOUD_SQL_DB=chatbot_db
CLOUD_SQL_USER=postgres
CLOUD_SQL_PASSWORD=your_secure_password

# Vector Store Configuration
VECTOR_COLLECTION_NAME=portfolio_embeddings
VECTOR_SEARCH_K=3
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# Cloud Storage Configuration
PORTFOLIO_BUCKET=almapi-portfolio-data
PORTFOLIO_FILE=portfolio.yaml

# Application Configuration
LOG_LEVEL=INFO
ENABLE_ANALYTICS=true
ENABLE_RESPONSE_CACHE=true
MAX_CACHE_SIZE=100
CACHE_TTL_MINUTES=60
MAX_CONVERSATION_HISTORY=10
RATE_LIMIT_PER_MINUTE=30
TESTING=false

# Security Configuration
CORS_ORIGINS=["https://almapi.dev"]
SECRET_KEY=your-secret-key-for-sessions
EOF
```

### **Configuración de Desarrollo Local**

```bash
# .env.local para desarrollo
cat > .env.local << EOF
# Override para desarrollo local
LOG_LEVEL=DEBUG
TESTING=true
CLOUD_SQL_CONNECTION_NAME=  # Vacío para usar TCP local
CLOUD_SQL_HOST=localhost
CLOUD_SQL_PASSWORD=local_password
EOF
```

---

## 🐛 Troubleshooting

### **Problemas Comunes y Soluciones**

#### **Error: No se puede conectar a Cloud SQL**

```bash
# Verificar que la instance existe
gcloud sql instances list

# Verificar que está corriendo
gcloud sql instances describe almapi-chatbot-db

# Verificar conectividad
gcloud sql connect almapi-chatbot-db --user=postgres
```

#### **Error: Gemini API Key inválida**

```bash
# Verificar que la key está configurada
echo $GEMINI_API_KEY

# Verificar en Secret Manager
gcloud secrets versions access latest --secret=gemini-api-key

# Obtener nueva key en https://aistudio.google.com/app/apikey
```

#### **Error: pgvector no está instalado**

```bash
# Conectar a Cloud SQL
gcloud sql connect almapi-chatbot-db --user=postgres

# Instalar extensión
CREATE EXTENSION IF NOT EXISTS vector;

# Verificar instalación
SELECT * FROM pg_extension WHERE extname = 'vector';
```

#### **Error: Docker build falla en Cloud Build**

```bash
# Verificar permisos de Cloud Build
PROJECT_ID=$(gcloud config get-value project)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_ID@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Verificar configuración de Artifact Registry
gcloud artifacts repositories list
```

#### **Error: Rate limiting excedido**

```bash
# Verificar configuración de rate limiting
grep RATE_LIMIT .env

# Ajustar límites si es necesario
# RATE_LIMIT_PER_MINUTE=60
```

### **Logs y Debugging**

#### **Ver Logs de Cloud Run**

```bash
# Logs en tiempo real
gcloud run services logs read chatbot-api --region=europe-west1 --follow

# Logs con filtros
gcloud run services logs read chatbot-api --region=europe-west1 \
  --filter="severity>=ERROR" --limit=50
```

#### **Debug Local**

```bash
# Activar logs de debug
export LOG_LEVEL=DEBUG

# Ejecutar con debug
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
from app.services.rag_service import RAGService
service = RAGService()
print('RAG Service initialized successfully')
"
```

---

## 📊 Verificación de Instalación

### **Checklist de Verificación**

#### **Infraestructura**
- [ ] Cloud SQL instance creada y funcionando
- [ ] Base de datos `chatbot_db` creada
- [ ] Extensión pgvector instalada
- [ ] Artifact Registry configurado
- [ ] Secret Manager configurado
- [ ] Cloud Build trigger configurado

#### **Aplicación**
- [ ] Entorno virtual creado y activado
- [ ] Dependencias instaladas correctamente
- [ ] Variables de entorno configuradas
- [ ] Vector store inicializado
- [ ] API funcionando localmente
- [ ] Despliegue en Cloud Run exitoso

#### **Funcionalidad**
- [ ] Health check responde correctamente
- [ ] Chat endpoint funciona
- [ ] Respuestas generadas correctamente
- [ ] Analytics funcionando
- [ ] GDPR compliance implementado
- [ ] Rate limiting funcionando

### **Tests de Verificación**

```bash
# Test completo de verificación
./scripts/dev/verify-installation.sh
```

**Script de verificación**:
```bash
#!/bin/bash
echo "🔍 Verificando instalación del AI Resume Agent..."

# Verificar Cloud SQL
echo "📊 Verificando Cloud SQL..."
gcloud sql instances describe almapi-chatbot-db > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Cloud SQL instance OK"
else
    echo "❌ Cloud SQL instance NO encontrada"
fi

# Verificar Cloud Run
echo "🚀 Verificando Cloud Run..."
gcloud run services describe chatbot-api --region=europe-west1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Cloud Run service OK"
else
    echo "❌ Cloud Run service NO encontrada"
fi

# Verificar API
echo "🔌 Verificando API..."
SERVICE_URL=$(gcloud run services describe chatbot-api --region=europe-west1 --format='value(status.url)' 2>/dev/null)
if [ ! -z "$SERVICE_URL" ]; then
    curl -s -H "Authorization: Bearer $(gcloud auth print-identity-token)" "$SERVICE_URL/api/v1/health" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ API funcionando correctamente"
    else
        echo "❌ API NO responde"
    fi
else
    echo "❌ No se pudo obtener URL del servicio"
fi

echo "🎉 Verificación completada!"
```

---

## 🚀 Próximos Pasos

### **Desarrollo Continuo**

1. **Monitoreo**: Configurar alertas y métricas
2. **Testing**: Implementar tests automatizados
3. **CI/CD**: Optimizar pipeline de despliegue
4. **Performance**: Monitorear y optimizar continuamente

### **Escalabilidad**

1. **Horizontal**: Implementar load balancing
2. **Vertical**: Optimizar recursos de Cloud Run
3. **Caching**: Implementar Redis para cache distribuido
4. **CDN**: Configurar Cloud CDN para contenido estático

### **Seguridad**

1. **Auditoría**: Implementar logging de seguridad
2. **Monitoreo**: Configurar alertas de seguridad
3. **Backup**: Automatizar backups de base de datos
4. **Compliance**: Mantener cumplimiento GDPR

