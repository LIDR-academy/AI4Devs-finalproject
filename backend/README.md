# 🚀 ZonMatch Backend API

## 📋 **Descripción General**

ZonMatch es una plataforma de matchmaking inmobiliario que conecta compradores, vendedores y agentes inmobiliarios. El backend proporciona una API REST robusta construida con Node.js, TypeScript, Express, MySQL y Redis.

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

### **🔐 Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout de usuario
- `GET /api/auth/profile` - Perfil del usuario
- `GET /api/auth/verify` - Verificar token

### **🔑 Recuperación de Contraseña**
- `POST /api/password-reset/request` - Solicitar reset de contraseña
- `POST /api/password-reset/reset` - Resetear contraseña
- `GET /api/password-reset/verify/:token` - Verificar token de reset

### **🏠 Propiedades**
- `GET /api/properties` - Listar propiedades con filtros
- `GET /api/properties/:id` - Obtener propiedad por ID
- `POST /api/properties` - Crear nueva propiedad
- `PUT /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad
- `GET /api/properties/my-properties` - Propiedades del usuario autenticado
- `POST /api/properties/:id/increment-views` - Incrementar vistas
- `PATCH /api/properties/:id/featured` - Cambiar estado destacado
- `PATCH /api/properties/:id/status` - Actualizar estado de propiedad

### **🖼️ Imágenes de Propiedades**
- `GET /api/property-images/:id/images` - Obtener imágenes de una propiedad
- `POST /api/property-images/:id/images` - Subir imagen a una propiedad
- `DELETE /api/property-images/:id/images/:imageId` - Eliminar imagen

### **❤️ Favoritos**
- `GET /api/favorites` - Obtener favoritos del usuario
- `POST /api/favorites/:propertyId` - Agregar propiedad a favoritos
- `DELETE /api/favorites/:propertyId` - Remover propiedad de favoritos
- `GET /api/favorites/:propertyId/status` - Verificar si está en favoritos
- `GET /api/favorites/stats` - Estadísticas de favoritos

## 🗄️ **Base de Datos**

### **📊 Modelos Principales**

#### **👤 Users (Usuarios)**
- Gestión de usuarios con roles (admin, agente, usuario)
- Verificación de cuentas y estados
- Configuraciones de notificaciones y preferencias

#### **🏠 Properties (Propiedades)**
- Propiedades inmobiliarias completas
- Tipos: casa, departamento, oficina, terreno, comercial
- Operaciones: venta, renta, transferencia
- Geolocalización y características detalladas

#### **❤️ Favorites (Favoritos)**
- Sistema de favoritos por usuario
- Notas personalizadas para cada favorito

#### **🔍 Searches (Búsquedas)**
- Búsquedas guardadas con criterios específicos
- Notificaciones automáticas de coincidencias

#### **🎯 Matches (Coincidencias)**
- Sistema de matchmaking automático
- Porcentajes de coincidencia y criterios
- Estados de seguimiento

#### **📧 Notifications (Notificaciones)**
- Sistema completo de notificaciones
- Tipos: match, mensaje, sistema, actualización de propiedad

#### **💬 Messages (Mensajes)**
- Chat entre usuarios sobre propiedades
- Tipos: texto, imagen, archivo

#### **📍 Polygons (Polígonos)**
- Zonas de interés geográficas
- Búsquedas por área específica

#### **🖼️ Property Images (Imágenes)**
- Gestión completa de imágenes
- Soporte para Cloudinary
- Ordenamiento y texto alternativo

#### **✨ Amenities (Amenidades)**
- Catálogo de amenidades por categorías
- Relación many-to-many con propiedades

#### **👁️ Property Views (Vistas)**
- Tracking de visualizaciones
- Análisis de comportamiento de usuarios

### **🔧 Comandos de base de datos**
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

### **📁 Estructura de carpetas**
```
src/
├── controllers/     # Controladores de la API
│   ├── authController.ts
│   ├── favoriteController.ts
│   ├── passwordResetController.ts
│   ├── propertyController.ts
│   └── propertyImageController.ts
├── services/        # Lógica de negocio
│   ├── authService.ts
│   ├── favoriteService.ts
│   ├── passwordResetService.ts
│   ├── propertyImageService.ts
│   └── propertyService.ts
├── models/          # Modelos de Sequelize
│   ├── User.ts
│   ├── Property.ts
│   ├── Favorite.ts
│   ├── Search.ts
│   ├── Match.ts
│   ├── Notification.ts
│   ├── Message.ts
│   ├── Polygon.ts
│   ├── PropertyImage.ts
│   ├── PropertyView.ts
│   ├── Amenity.ts
│   ├── PropertyAmenity.ts
│   └── PasswordReset.ts
├── middleware/      # Middleware personalizado
│   ├── auth.ts
│   ├── rateLimit.ts
│   └── validation.ts
├── validators/      # Validación de datos
│   ├── authValidators.ts
│   ├── favoriteValidation.ts
│   ├── propertyImageValidation.ts
│   └── propertyValidators.ts
├── routes/          # Definición de rutas
│   ├── auth.ts
│   ├── favorites.ts
│   ├── passwordReset.ts
│   ├── properties.ts
│   └── propertyImages.ts
├── config/          # Configuraciones
│   ├── database.ts
│   ├── jwt.ts
│   └── redis.ts
└── types/           # Tipos TypeScript
    ├── env.d.ts
    ├── express.d.ts
    └── index.ts
```

### **🎯 Patrón de diseño**
- **Controllers**: Manejan requests/responses HTTP
- **Services**: Contienen la lógica de negocio
- **Models**: Interfazan con la base de datos
- **Validators**: Validan datos de entrada
- **Middleware**: Autenticación, rate limiting, etc.

## 🔧 **Comandos de desarrollo**

### **📜 Scripts disponibles**
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

### **🛠️ Comandos útiles**
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

### **🔒 Características implementadas**
- **JWT**: Autenticación stateless con tokens seguros
- **bcrypt**: Hash seguro de contraseñas con salt rounds
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso cross-origin configurado
- **Rate Limiting**: Protección contra ataques DDoS y brute force
- **Validación**: Sanitización completa de datos de entrada
- **Blacklist de tokens**: Sistema de logout seguro
- **Verificación de roles**: Control de acceso basado en roles

### **⚙️ Variables de entorno requeridas**
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
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## 🧪 **Testing**

### **🔬 Ejecutar tests**
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

### **🏭 Producción**
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start

# Con PM2
pm2 start dist/app.js --name zonmatch-backend
```

### **🐳 Docker**
```bash
# Construir imagen
docker build -t zonmatch-backend .

# Ejecutar contenedor
docker run -p 3001:3001 zonmatch-backend
```

## 📊 **Características Avanzadas**

### **🎯 Sistema de Matchmaking**
- Algoritmo de coincidencias automáticas
- Porcentajes de compatibilidad
- Criterios de búsqueda personalizados
- Notificaciones inteligentes

### **📈 Analytics y Tracking**
- Contador de vistas por propiedad
- Tracking de comportamiento de usuarios
- Estadísticas de favoritos
- Métricas de engagement

### **🔍 Búsquedas Avanzadas**
- Filtros múltiples (precio, ubicación, características)
- Búsquedas guardadas
- Zonas de interés geográficas
- Búsqueda por texto completo

### **💬 Sistema de Comunicación**
- Chat en tiempo real sobre propiedades
- Notificaciones push
- Mensajes multimedia
- Historial de conversaciones

### **🖼️ Gestión de Imágenes**
- Integración con Cloudinary
- Múltiples imágenes por propiedad
- Optimización automática
- Texto alternativo para accesibilidad

## 📚 **Documentación adicional**
- [README Principal](../READMEZONEMATCH.md)
- [Guía de instalación](../INSTALACION.md)
- [Documentación de la API](./docs/api.md)

## 🆘 **Soporte y Troubleshooting**

### **🔧 Problemas comunes**

1. **Error de conexión a MySQL**
   ```bash
   # Verificar que MySQL esté ejecutándose
   sudo service mysql status
   
   # Verificar credenciales en .env
   cat .env | grep DB_
   ```

2. **Error de conexión a Redis**
   ```bash
   # Verificar que Redis esté ejecutándose
   redis-cli ping
   
   # Debería responder: PONG
   ```

3. **Errores de migración**
   ```bash
   # Resetear base de datos
   npm run db:reset
   
   # Verificar estado de migraciones
   npx sequelize-cli db:migrate:status
   ```

4. **Problemas de permisos**
   ```bash
   # Verificar permisos de archivos
   ls -la
   
   # Ajustar permisos si es necesario
   chmod 755 src/
   ```

### **📋 Checklist de verificación**
- [ ] Variables de entorno configuradas correctamente
- [ ] MySQL ejecutándose y accesible
- [ ] Redis ejecutándose y accesible
- [ ] Migraciones ejecutadas sin errores
- [ ] Seeders ejecutados correctamente
- [ ] Puerto 3001 disponible
- [ ] Certificados SSL configurados (producción)

## 🎉 **¡El backend está listo para escalar! 🚀**

ZonMatch Backend es una solución robusta y escalable que proporciona todas las funcionalidades necesarias para una plataforma inmobiliaria moderna. Con arquitectura MVC, seguridad avanzada y características de matchmaking inteligente, está preparado para manejar miles de usuarios y propiedades.

---