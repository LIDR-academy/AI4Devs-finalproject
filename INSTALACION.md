# 🚀 Guía de Instalación - ZonMatch

## 📋 **Prerrequisitos**

### **Software requerido**
- **Node.js**: Versión 18.0.0 o superior
- **npm**: Versión 8.0.0 o superior
- **Docker**: Versión 20.0.0 o superior
- **Docker Compose**: Versión 2.0.0 o superior

### **Verificar instalaciones**
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version
```

## 🚀 **Instalación Paso a Paso**

### **1. Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd AI4Devs-finalproject
```

### **2. Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales
nano .env  # o usar tu editor preferido
```

**Contenido del archivo `.env`:**
```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zonmatch
DB_USER=root
DB_PASSWORD=tu_password_mysql

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development
```

### **3. Levantar servicios base con Docker**
```bash
# Solo MySQL y Redis (recomendado para desarrollo)
docker-compose up -d mysql redis

# Verificar que estén corriendo
docker-compose ps
```

### **4. Instalar dependencias del Backend**
```bash
cd backend
npm install
```

### **5. Configurar base de datos**
```bash
# Ejecutar migraciones
npm run migrate

# Ejecutar seeders (datos de prueba)
npm run seed
```

### **6. Levantar Backend**
```bash
# En una terminal nueva
npm run dev
```

**Verificar que el backend esté funcionando:**
```bash
curl http://localhost:3001/health
```

### **7. Instalar dependencias del Frontend**
```bash
# En otra terminal nueva
cd frontend
npm install
```

### **8. Levantar Frontend**
```bash
npm run dev
```

## 🌐 **Verificar instalación**

### **URLs de acceso**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### **Datos de prueba disponibles**
- **Usuario admin**: `admin@zonmatch.com` / `Admin123!`
- **Usuario agente**: `agente@zonmatch.com` / `Agente123!`
- **Usuario normal**: `usuario@zonmatch.com` / `Usuario123!`

## 🔧 **Comandos útiles**

### **Desarrollo**
```bash
# Backend
cd backend
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm run migrate      # Ejecutar migraciones
npm run seed         # Ejecutar seeders

# Frontend
cd frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
```

### **Docker**
```bash
# Levantar solo servicios base
docker-compose up -d mysql redis

# Ver logs
docker-compose logs mysql
docker-compose logs redis

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart mysql redis
```

### **Base de datos**
```bash
# Conectar a MySQL
docker exec -it zonmatch_mysql mysql -u root -p

# Ver bases de datos
SHOW DATABASES;

# Usar base de datos
USE zonmatch;

# Ver tablas
SHOW TABLES;
```

## 🚨 **Solución de problemas comunes**

### **Error: Redis connection refused**
```bash
# Verificar que Redis esté corriendo
docker-compose ps redis

# Reiniciar Redis
docker-compose restart redis
```

### **Error: MySQL connection refused**
```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Reiniciar MySQL
docker-compose restart mysql

# Ver logs de MySQL
docker-compose logs mysql
```

### **Error: Port already in use**
```bash
# Ver qué está usando el puerto
lsof -i :3001
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### **Error: crypto.getRandomValues is not a function**
```bash
# Limpiar cache del frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **Error: Cannot connect to database**
```bash
# Verificar variables de entorno
cat .env

# Verificar conexión a MySQL
docker exec -it zonmatch_mysql mysql -u root -p

# Verificar que la base de datos existe
SHOW DATABASES;
```

## 🔄 **Reinicio completo del proyecto**

### **Opción 1: Reinicio rápido**
```bash
# Detener todo
docker-compose down

# Levantar servicios base
docker-compose up -d mysql redis

# Backend
cd backend
npm run dev

# Frontend (en otra terminal)
cd frontend
npm run dev
```

### **Opción 2: Reset completo**
```bash
# Detener y limpiar Docker
docker-compose down -v
docker-compose up -d mysql redis

# Resetear base de datos
cd backend
npm run db:reset

# Reinstalar dependencias
cd ..
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install

# Levantar servicios
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

## 📚 **Recursos adicionales**

### **Documentación**
- [README Principal](READMEZONEMATCH.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

### **Comandos de ayuda**
```bash
# Ver todos los scripts disponibles
cd backend && npm run
cd frontend && npm run

# Ver logs de Docker
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps
```

## 🎯 **Próximos pasos**

Una vez que tengas todo funcionando:

1. **Explora la API**: Usa Postman o curl para probar endpoints
2. **Crea un usuario**: Regístrate en el frontend
3. **Crea propiedades**: Usa el formulario de creación
4. **Explora el dashboard**: Ve las propiedades creadas

**¡Tu proyecto ZonMatch está listo para desarrollo! 🚀**
