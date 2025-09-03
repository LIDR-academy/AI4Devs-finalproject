# 🏠 ZonMatch - Plataforma de Matchmaking Inmobiliario

## 🚀 **Inicio Rápido**

### **1. Clonar y configurar**
```bash
git clone <tu-repositorio>
cd AI4Devs-finalproject
cp env.example .env
# Editar .env con tus credenciales
```

### **2. Levantar servicios base (Docker)**
```bash
# Solo MySQL y Redis
docker-compose up -d mysql redis
```

### **3. Configurar base de datos**
```bash
cd backend
npm install
npm run migrate
npm run seed
```

### **4. Levantar Backend**
```bash
# En una terminal nueva
cd backend
npm run dev
```

### **5. Levantar Frontend**
```bash
# En otra terminal nueva
cd frontend
npm install
npm run dev
```

## 🌐 **URLs de acceso**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## 📖 **Documentación detallada**
- [Backend README](backend/README.md) - Configuración y API
- [Frontend README](frontend/README.md) - UI y componentes
- [Guía de instalación](INSTALACION.md) - Pasos detallados

## 🏗️ **Arquitectura**
- **Backend**: Node.js + Express + TypeScript + MySQL + Redis
- **Frontend**: React + TypeScript + Vite + Material-UI + Zustand
- **Infraestructura**: Docker + Docker Compose

## 🔧 **Comandos útiles**
```bash
# Reiniciar todo
docker-compose down
docker-compose up -d mysql redis
cd backend && npm run dev
cd frontend && npm run dev

# Solo base de datos
docker-compose up -d mysql redis

# Solo backend
cd backend && npm run dev

# Solo frontend
cd frontend && npm run dev
```