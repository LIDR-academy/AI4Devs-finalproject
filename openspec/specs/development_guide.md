# Guía de Desarrollo - Adresles

Esta guía proporciona instrucciones paso a paso para configurar el entorno de desarrollo y ejecutar pruebas para **Adresles**.

**Para arquitectura completa**: Ver [Adresles_Business.md - Fase 4](../../Adresles_Business.md#fase-4-diseño-de-alto-nivel)

## 🚀 Instrucciones de Configuración

### Prerequisitos

Asegúrate de tener instalado lo siguiente:

- **Node.js** (v20 LTS o superior)
- **pnpm** (v8 o superior) - `npm install -g pnpm`
- **Docker** y **Docker Compose**
- **Git**
- **AWS CLI** (para DynamoDB local)

### 1. Clonar el Repositorio

```bash
git clone git@github.com:SValduezaL/AI4Devs-finalproject
cd AI4Devs-finalproject
```

### 2. Configuración de Entorno

Adresles usa **arquitectura de base de datos híbrida**: Supabase (PostgreSQL) para datos relacionales y DynamoDB para mensajes de conversaciones.

**Entorno de Backend** (`apps/api/.env`):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DynamoDB Configuration (AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_MESSAGES=adresles-messages

# Para DynamoDB local (desarrollo)
# AWS_ENDPOINT=http://localhost:8000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Application Configuration
PORT=3000
NODE_ENV=development
```

**Entorno de Chat App** (`apps/web-chat/.env`):

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**Entorno de Dashboard Admin** (`apps/web-admin/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ver [memory-bank/project-context/tech-stack.md](../../memory-bank/project-context/tech-stack.md) para configuración detallada.

### 3. Configuración de Base de Datos

#### Supabase (PostgreSQL)

1. **Crear proyecto en Supabase**: https://supabase.com/dashboard
2. **Obtener credenciales**: URL y API Keys del proyecto
3. **Configurar `.env`**: Añadir SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY

#### DynamoDB (Local con Docker)

Para desarrollo local:

```bash
# Start DynamoDB local
docker run -d -p 8000:8000 amazon/dynamodb-local

# Create messages table
aws dynamodb create-table \
  --table-name adresles-messages \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

#### Redis (Docker)

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine
```

Ver [ADR-002](../../memory-bank/architecture/002-supabase-dynamodb.md) para justificación de arquitectura híbrida.

### 4. Configuración de Backend (NestJS)

```bash
# Install dependencies (desde la raíz del monorepo)
pnpm install

# Generate Prisma client para Supabase
cd apps/api
pnpm prisma generate

# Run database migrations (Supabase)
pnpm prisma migrate deploy

# Start the development server
pnpm dev
```

La API de backend estará disponible en `http://localhost:3000`

**Servicios disponibles**:

- REST API: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`
- Health check: `http://localhost:3000/health`

### 5. Configuración de Frontend

#### Chat App (React + Vite)

```bash
# Navigate to Chat App directory (from project root)
cd apps/web-chat

# Install dependencies (si no se hizo desde la raíz)
pnpm install

# Start the development server
pnpm dev
```

La aplicación Chat estará disponible en `http://localhost:5173`

#### Dashboard Admin (Next.js)

```bash
# Navigate to Dashboard directory (from project root)
cd apps/web-admin

# Install dependencies (si no se hizo desde la raíz)
pnpm install

# Start the development server
pnpm dev
```

El Dashboard estará disponible en `http://localhost:3001`

### 6. Worker BullMQ (Procesamiento Asíncrono)

El Worker procesa jobs de conversaciones IA de forma asíncrona:

```bash
# Navigate to Worker directory
cd apps/worker

# Start the worker
pnpm dev
```

El Worker procesará jobs de la cola Redis para:

- Llamadas a OpenAI GPT-4
- Validación de direcciones con Google Maps
- Procesamiento de mensajes conversacionales

## 🧪 Pruebas

### Pruebas de Backend

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Pruebas de Frontend

```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests with Playwright
npm run playwright:run

# Open Playwright Test Runner
npm run playwright:open
```
