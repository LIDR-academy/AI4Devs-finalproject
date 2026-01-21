# MS-PERSO - Microservicio de Personas

Microservicio para gestión de personas del sistema financiero FINANTIX.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- PostgreSQL 15+
- NATS Server

### Instalación

```bash
cd BACKEND/MS-PERSO
npm install
```

### Configuración

Crear archivo `.env` en la raíz del proyecto (copiar de `.env.example` si existe):

```env
# Server Configuration
APP_PORT=3004
NODE_ENV=development

# NATS Configuration
MS_NATS_SERVER=nats://localhost:4222

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finantix
DB_SSL=false

# Database Connection Timeouts (opcional)
DB_CONN_TIMEOUT_MS=5000
DB_IDLE_TIMEOUT_MS=30000
DB_MAX_POOL=30
DB_STATEMENT_TIMEOUT_MS=30000

# Database Pool Configuration (opcional)
DB_POOL_SIZE=30
DB_CONNECTION_TIMEOUT=5000
DB_IDLE_TIMEOUT=30000
DB_MAX_USES=7500

# Logging Configuration (opcional)
LOG_LEVEL=debug
LOG_FORMAT=text
```

### Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📝 Notas

- El archivo `.env` no se incluye en el repositorio por seguridad
- Las variables de entorno con valores por defecto son opcionales
- `MS_NATS_SERVER` tiene valor por defecto: `nats://localhost:4222`
