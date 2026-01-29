# Guía de Desarrollo

Esta guía proporciona instrucciones paso a paso para configurar el entorno de desarrollo y ejecutar pruebas para el proyecto final de Máster AI4Devs.

## 🚀 Instrucciones de Configuración

### Prerequisitos

Asegúrate de tener instalado lo siguiente:

- **Node.js** (v16 o superior)
- **npm** (v8 o superior)
- **Docker** y **Docker Compose**
- **Git**

### 1. Clonar el Repositorio

```bash
git clone git@github.com:SValduezaL/AI4Devs-finalproject
cd AI4Devs-finalproject
```

### 2. Configuración de Entorno

Crear archivos de entorno para backend y frontend:

**Entorno de Backend** (`backend/.env`):

```env
# Database Configuration
DB_HOST = localhost
DB_PORT = 5433
DB_USER = SValduezaL
DB_PASSWORD = mypassword
DB_NAME = AI4Devs_FinalProject_db

# Application Configuration
PORT = 3000
NODE_ENV = development

# Prisma Database URL
DATABASE_URL = "postgresql://SValduezaL:mypassword@localhost:5433/DB_NAME = AI4Devs_FinalProject_db"
```

**Entorno de Frontend** (`frontend/.env`):

```env
REACT_APP_API_URL = http://localhost:3000
```

### 3. Configuración de Base de Datos (PostgreSQL con Docker)

Iniciar la base de datos PostgreSQL usando Docker Compose:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify the database is running
docker-compose ps
```

La base de datos PostgreSQL estará disponible en:

- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `AI4Devs_FinalProject_db`
- **Username**: `SValduezaL`
- **Password**: `mypassword`

### 4. Configuración de Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the development server
npm run dev
```

La API de backend estará disponible en `http://localhost:3000`

### 5. Configuración de Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

La aplicación frontend estará disponible en `http://localhost:3001`

### 6. Configuración de Suite de Pruebas Playwright

```bash
# From the frontend directory
cd frontend

# Install Playwright (if not already installed)
npm install

# Open Playwright Test Runner (Interactive)
npm run playwright:open

# Or run tests headlessly
npm run playwright:run
```

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
