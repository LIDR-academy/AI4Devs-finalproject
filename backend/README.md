# 🚀 ZonMatch Backend API

## 🚀 **Inicio Rápido**

### **1. Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus credenciales de MySQL y Redis
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar base de datos**
```bash
# Ejecutar migraciones
npm run migrate

# Ejecutar seeders (datos de prueba)
npm run seed
```

### **4. Levantar el servidor**
```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm run build
npm start
```

## 🌐 **URLs y Puertos**
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Base de Datos**: MySQL en localhost:3306
- **Cache**: Redis en localhost:6379

## 📚 **Endpoints de la API**

### **Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout de usuario
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/password-reset/request` - Solicitar reset de contraseña
- `POST /api/password-reset/reset` - Resetear contraseña

### **Propiedades**
- `GET /api/properties` - Listar propiedades con filtros
- `GET /api/properties/:id` - Obtener propiedad por ID
- `POST /api/properties` - Crear nueva propiedad
- `PUT /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad

## 🗄️ **Base de Datos**

### **Modelos**
- **User**: Usuarios con roles (admin, agente, usuario)
- **Property**: Propiedades inmobiliarias
- **PasswordReset**: Tokens para reset de contraseñas

### **Comandos de base de datos**
```bash
# Migraciones
npm run migrate

# Seeders
npm run seed

# Reset completo
npm run db:reset

# Crear migración
npx sequelize-cli migration:generate --name nombre-migracion

# Crear seeder
npx sequelize-cli seed:generate --name nombre-seeder
```

## 🏗️ **Arquitectura MVC**

### **Estructura de carpetas**
```
src/
├── controllers/     # Controladores de la API
├── services/        # Lógica de negocio
├── models/          # Modelos de Sequelize
├── middleware/      # Middleware personalizado
├── validators/      # Validación de datos
├── routes/          # Definición de rutas
├── config/          # Configuraciones
└── types/           # Tipos TypeScript
```

### **Patrón de diseño**
- **Controllers**: Manejan requests/responses HTTP
- **Services**: Contienen la lógica de negocio
- **Models**: Interfazan con la base de datos
- **Validators**: Validan datos de entrada
- **Middleware**: Autenticación, rate limiting, etc.

## 🔧 **Comandos de desarrollo**

### **Scripts disponibles**
```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run migrate      # Ejecutar migraciones
npm run seed         # Ejecutar seeders
npm run db:reset     # Reset completo de BD
npm run lint         # Linting con ESLint
npm run test         # Ejecutar tests
```

### **Comandos útiles**
```bash
# Ver logs en tiempo real
npm run dev

# Recompilar TypeScript
npm run build

# Verificar tipos
npx tsc --noEmit

# Ejecutar migración específica
npx sequelize-cli db:migrate --to XXXX-nombre.js

# Ejecutar seeder específico
npx sequelize-cli db:seed --seed XXXX-nombre.js
```

## 🛡️ **Seguridad**

### **Características implementadas**
- **JWT**: Autenticación stateless
- **bcrypt**: Hash seguro de contraseñas
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso cross-origin
- **Rate Limiting**: Protección contra ataques
- **Validación**: Sanitización de datos de entrada

### **Variables de entorno requeridas**
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zonmatch
DB_USER=root
DB_PASSWORD=tu_password

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

## 🧪 **Testing**

### **Ejecutar tests**
```bash
# Todos los tests
npm test

# Tests específicos
npm run test:unit
npm run test:integration

# Tests con coverage
npm run test:coverage
```

## 🚀 **Despliegue**

### **Producción**
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start

# Con PM2
pm2 start dist/app.js --name zonmatch-backend
```

### **Docker**
```bash
# Construir imagen
docker build -t zonmatch-backend .

# Ejecutar contenedor
docker run -p 3001:3001 zonmatch-backend
```

## 📚 **Documentación adicional**
- [README Principal](../READMEZONEMATCH.md)
- [Guía de instalación](../INSTALACION.md)
- [Documentación de la API](./docs/api.md)

## 🆘 **Soporte**

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica la conexión a MySQL y Redis
3. Confirma que las variables de entorno estén configuradas
4. Revisa que las migraciones se hayan ejecutado correctamente

**¡El backend está listo para escalar! 🚀**
