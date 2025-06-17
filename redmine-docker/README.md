# 🚀 Redmine con Docker - TaskDistributor

Configuración completa de Redmine usando Docker que funciona tanto en desarrollo local como en producción (EC2).

## 📋 Requisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- 2GB RAM mínimo
- 10GB espacio en disco

## 🏗️ Estructura del Proyecto

```
redmine-docker/
├── docker-compose.yml          # Configuración principal
├── env.example                 # Variables de entorno
├── nginx.conf                  # Configuración proxy reverso
├── init-scripts/               # Scripts de inicialización DB
│   └── 01-setup-database.sql
├── config/                     # Configuraciones personalizadas
├── plugins/                    # Plugins personalizados
└── ssl/                        # Certificados SSL (producción)
```

## ⚙️ Configuración

### 1. **Configurar variables de entorno**

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

### 2. **Configuración mínima en .env:**

```env
POSTGRES_PASSWORD=tu_password_seguro
REDMINE_SECRET_KEY=clave_secreta_muy_larga_y_segura
REDMINE_PORT=5000
```

## 🚀 Despliegue

### **Desarrollo Local:**

```bash
# Iniciar servicios básicos
docker-compose up -d

# Ver logs
docker-compose logs -f redmine

# Acceder a Redmine
http://localhost:5000
```

### **Producción (EC2) con Nginx:**

```bash
# Iniciar con proxy reverso
docker-compose --profile production up -d

# Acceder a Redmine
http://tu-ip-ec2
```

## 🔧 Configuración Inicial de Redmine

### 1. **Primer acceso:**
- URL: `http://localhost:5000` (local) o `http://tu-ip-ec2` (EC2)
- Usuario: `admin`
- Contraseña: `admin`

### 2. **Configuración inicial recomendada:**

1. **Cambiar contraseña del admin**
2. **Configurar idioma** → Español
3. **Configurar trackers** para TaskDistributor:
   - Feature (Funcionalidad)
   - Bug (Error)
   - Task (Tarea)
   - Support (Soporte)

4. **Configurar campos personalizados:**
   ```
   - departamento (Lista)
   - responsable_negocio (Texto)
   - funcional (Archivo)
   ```

5. **Configurar proyectos:**
   - Proyecto Marketing
   - Proyecto Ventas
   - Proyecto Finanzas
   - Proyecto Producto

## 🔌 Configurar API para TaskDistributor

### 1. **Habilitar API REST:**
- Administración → Configuración → API
- ✅ Habilitar servicio web REST
- ✅ Habilitar autenticación de clave API

### 2. **Crear usuario API:**
- Usuarios → Nuevo usuario
- Usuario: `taskdistributor-api`
- Rol: Administrador
- Generar clave API

### 3. **Configurar en backend TaskDistributor:**

```env
# En backend/.env
REDMINE_BASE_URL="http://localhost:5000"  # Local
# REDMINE_BASE_URL="http://tu-ip-ec2"     # EC2
REDMINE_API_KEY="clave_api_generada"
```

## 📊 Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Reiniciar Redmine
docker-compose restart redmine

# Backup de base de datos
docker-compose exec redmine-db pg_dump -U redmine redmine > backup.sql

# Restaurar backup
docker-compose exec -i redmine-db psql -U redmine redmine < backup.sql

# Ver logs de base de datos
docker-compose logs redmine-db

# Acceso directo a base de datos
docker-compose exec redmine-db psql -U redmine redmine

# Limpiar todo y empezar de nuevo
docker-compose down -v
docker-compose up -d
```

## 🛡️ Configuración de Seguridad para EC2

### 1. **Security Groups:**
```
- Puerto 22 (SSH): Tu IP únicamente
- Puerto 80 (HTTP): 0.0.0.0/0
- Puerto 443 (HTTPS): 0.0.0.0/0
- Puerto 5000: Cerrado (solo acceso interno via nginx)
```

### 2. **Certificados SSL con Let's Encrypt:**

```bash
# Instalar certbot en EC2
sudo yum install -y certbot

# Generar certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Copiar certificados al directorio SSL
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ./ssl/key.pem

# Reiniciar con HTTPS
docker-compose --profile production up -d
```

## 🔧 Personalización

### **Agregar plugins:**
```bash
# Copiar plugin a directorio
cp -r mi-plugin/ ./plugins/

# Reiniciar contenedor
docker-compose restart redmine
```

### **Temas personalizados:**
```bash
# Agregar tema
cp -r mi-tema/ ./themes/

# Reiniciar y seleccionar en Administración → Configuración → Mostrar
docker-compose restart redmine
```

## 🐛 Troubleshooting

### **Redmine no inicia:**
```bash
# Verificar logs
docker-compose logs redmine

# Problema común: Base de datos no lista
docker-compose restart redmine
```

### **Error de conexión a DB:**
```bash
# Verificar salud de PostgreSQL
docker-compose exec redmine-db pg_isready -U redmine

# Reiniciar base de datos
docker-compose restart redmine-db
```

### **Puerto ocupado:**
```bash
# Cambiar puerto en .env
REDMINE_PORT=5001

# Reiniciar
docker-compose up -d
```

## 📈 Optimización para Producción

### **Variables de entorno adicionales:**

```env
# Configuración de rendimiento
REDMINE_RAILS_ENV=production
REDMINE_RAILS_CACHE=true

# Email con AWS SES
EMAIL_DELIVERY_METHOD=smtp
SMTP_ADDRESS=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=tu-access-key
SMTP_PASSWORD=tu-secret-key
SMTP_AUTHENTICATION=plain
SMTP_STARTTLS=true
```

## 🔄 Integración con TaskDistributor

Una vez configurado, actualiza el servicio mock en TaskDistributor:

```javascript
// En backend/src/api/services/redmineService.js
const REDMINE_BASE_URL = process.env.REDMINE_BASE_URL;
const REDMINE_API_KEY = process.env.REDMINE_API_KEY;

// Reemplazar funciones mock con llamadas reales a la API
```

## 📚 Recursos Adicionales

- [Documentación oficial Redmine](https://www.redmine.org/guide)
- [API REST Redmine](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Docker Redmine](https://hub.docker.com/_/redmine)

---

¡Listo para integrar con TaskDistributor! 🎉 