# Production Setup Guide - bonÀreaGo

Esta guía describe cómo configurar y desplegar bonÀreaGo en un entorno de producción.

## Tabla de Contenidos

- [Requisitos de Infraestructura](#requisitos-de-infraestructura)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración de Redis](#configuración-de-redis)
- [Configuración de Keycloak](#configuración-de-keycloak)
- [Configuración de SMTP](#configuración-de-smtp)
- [Variables de Entorno](#variables-de-entorno)
- [Certificados SSL](#certificados-ssl)
- [Backup y Restore](#backup-y-restore)
- [Monitoreo](#monitoreo)

---

## Requisitos de Infraestructura

### Hardware Mínimo

**Para entorno de producción pequeño (hasta 1000 usuarios):**

- **CPU**: 4 cores
- **RAM**: 16 GB
- **Disco**: 100 GB SSD
- **Ancho de banda**: 100 Mbps

**Para entorno de producción medio (hasta 10000 usuarios):**

- **CPU**: 8 cores
- **RAM**: 32 GB
- **Disco**: 500 GB SSD
- **Ancho de banda**: 1 Gbps

### Software Requerido

- **Sistema Operativo**: Ubuntu 22.04 LTS o superior
- **Docker**: 24.0 o superior
- **Docker Compose**: 2.20 o superior
- **PostgreSQL**: 15 o superior (puede ser externo)
- **Redis**: 7.0 o superior (puede ser externo)
- **Nginx**: 1.24 o superior (para reverse proxy)

---

## Configuración de Base de Datos

### PostgreSQL con PostGIS

1. **Instalar PostgreSQL y PostGIS:**

```bash
sudo apt update
sudo apt install postgresql-15 postgresql-15-postgis-3
```

2. **Crear base de datos y usuario:**

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Crear usuario
CREATE USER bonareago_user WITH PASSWORD 'your-secure-password';

-- Crear base de datos
CREATE DATABASE bonareago_prod OWNER bonareago_user;

-- Conectar a la base de datos
\c bonareago_prod

-- Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear schemas
CREATE SCHEMA IF NOT EXISTS users AUTHORIZATION bonareago_user;
CREATE SCHEMA IF NOT EXISTS trips AUTHORIZATION bonareago_user;
CREATE SCHEMA IF NOT EXISTS bookings AUTHORIZATION bonareago_user;
CREATE SCHEMA IF NOT EXISTS matches AUTHORIZATION bonareago_user;
CREATE SCHEMA IF NOT EXISTS notifications AUTHORIZATION bonareago_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE bonareago_prod TO bonareago_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users TO bonareago_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA trips TO bonareago_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA bookings TO bonareago_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA matches TO bonareago_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA notifications TO bonareago_user;
```

3. **Configurar acceso remoto (si es necesario):**

Editar `/etc/postgresql/15/main/postgresql.conf`:
```
listen_addresses = '*'
```

Editar `/etc/postgresql/15/main/pg_hba.conf`:
```
host    bonareago_prod    bonareago_user    0.0.0.0/0    md5
```

4. **Reiniciar PostgreSQL:**

```bash
sudo systemctl restart postgresql
```

### Optimización de PostgreSQL

Editar `/etc/postgresql/15/main/postgresql.conf`:

```ini
# Memoria
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 64MB

# Conexiones
max_connections = 200

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

---

## Configuración de Redis

### Instalación

```bash
sudo apt install redis-server
```

### Configuración de Seguridad

Editar `/etc/redis/redis.conf`:

```ini
# Bind a IP específica
bind 127.0.0.1 ::1

# Requerir contraseña
requirepass your-redis-password

# Deshabilitar comandos peligrosos
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# Persistencia
save 900 1
save 300 10
save 60 10000

# Límites de memoria
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Reiniciar Redis

```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## Configuración de Keycloak

### Instalación con Docker

1. **Crear directorio de datos:**

```bash
sudo mkdir -p /opt/keycloak/data
```

2. **Crear docker-compose para Keycloak:**

```yaml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak-password
      KC_HOSTNAME: auth.your-domain.com
      KC_HOSTNAME_STRICT: false
      KC_PROXY: edge
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin-password
    command:
      - start
      - --optimized
    ports:
      - "8080:8080"
    volumes:
      - /opt/keycloak/data:/opt/keycloak/data
    restart: unless-stopped
```

3. **Configurar Realm:**

- Crear realm `bonareago`
- Crear client `bonareago-backend` con:
  - Client Protocol: openid-connect
  - Access Type: confidential
  - Valid Redirect URIs: `https://your-domain.com/*`
  - Web Origins: `https://your-domain.com`
- Añadir mapper para `aud` claim con valor `backend-api`
- Crear roles: `EMPLOYEE`, `ADMIN`

---

## Configuración de SMTP

### Opciones Recomendadas

**Opción 1: SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@your-domain.com
```

**Opción 2: Amazon SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-username
SMTP_PASSWORD=your-ses-password
SMTP_FROM=noreply@your-domain.com
```

**Opción 3: Gmail (solo para testing)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

---

## Variables de Entorno

### Archivo `.env.production`

Copiar desde `env.production.example` y configurar:

```bash
# Copiar template
cp env.production.example .env.production

# Editar con valores reales
nano .env.production
```

### Variables Críticas

**IMPORTANTE**: Estas variables DEBEN ser configuradas correctamente:

```env
# Seguridad
AUTH_DISABLED=false                    # NUNCA true en producción
REQUIRE_ROLE_EMPLOYEE=true             # Validación de roles

# Base de Datos
DATABASE_URL=jdbc:postgresql://your-db-host:5432/bonareago_prod
POSTGRES_USER=bonareago_user
POSTGRES_PASSWORD=your-secure-password

# OIDC
OIDC_ISSUER_URI=https://auth.your-domain.com/realms/bonareago
OIDC_CLIENT_ID=bonareago-backend
OIDC_CLIENT_SECRET=your-client-secret

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# VAPID (generar nuevas claves para producción)
VAPID_PUBLIC_KEY=your-production-public-key
VAPID_PRIVATE_KEY=your-production-private-key

# SMTP
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

### Generar VAPID Keys

```bash
# Instalar web-push
npm install -g web-push

# Generar keys
web-push generate-vapid-keys

# Copiar las keys generadas a .env.production
```

---

## Certificados SSL

### Opción 1: Let's Encrypt (Recomendado)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Renovación automática
sudo systemctl enable certbot.timer
```

### Opción 2: Certificado Comercial

1. Generar CSR:
```bash
openssl req -new -newkey rsa:2048 -nodes \
  -keyout your-domain.key \
  -out your-domain.csr
```

2. Enviar CSR al proveedor de certificados

3. Instalar certificado recibido

---

## Backup y Restore

### Backup Automático de Base de Datos

Crear script `/opt/bonareago/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/bonareago"
DATE=$(date +%Y%m%d-%H%M%S)
DB_NAME="bonareago_prod"
DB_USER="bonareago_user"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Eliminar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +30 -delete

echo "Backup completado: $BACKUP_DIR/db-$DATE.sql.gz"
```

### Configurar Cron

```bash
# Editar crontab
crontab -e

# Añadir backup diario a las 2 AM
0 2 * * * /opt/bonareago/backup-db.sh >> /var/log/bonareago-backup.log 2>&1
```

### Restore desde Backup

```bash
# Descomprimir backup
gunzip db-20250101-020000.sql.gz

# Restaurar
psql -U bonareago_user -h localhost bonareago_prod < db-20250101-020000.sql
```

---

## Monitoreo

### Health Checks

Configurar monitoreo de endpoints:

```bash
# Script de health check
#!/bin/bash

SERVICES=(
  "http://localhost:8081/api/health"
  "http://localhost:8082/api/health"
  "http://localhost:8083/api/health"
  "http://localhost:8084/api/health"
  "http://localhost:8085/api/health"
)

for service in "${SERVICES[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" $service)
  if [ $response -ne 200 ]; then
    echo "ALERT: $service is down (HTTP $response)"
    # Enviar alerta (email, Slack, etc.)
  fi
done
```

### Logs

Configurar rotación de logs:

```bash
# /etc/logrotate.d/bonareago
/var/log/bonareago/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 bonareago bonareago
    sharedscripts
    postrotate
        systemctl reload bonareago
    endscript
}
```

---

## Checklist de Deployment

- [ ] PostgreSQL instalado y configurado
- [ ] Redis instalado y configurado
- [ ] Keycloak instalado y realm configurado
- [ ] SMTP configurado y probado
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL instalados
- [ ] Backup automático configurado
- [ ] Monitoreo configurado
- [ ] Firewall configurado
- [ ] DNS configurado
- [ ] Tests de integración pasando
- [ ] Documentación actualizada

---

## Soporte

Para más información, consultar:
- [Docker Deployment Guide](./docker-deployment.md)
- [QUICK-START.md](../../QUICK-START.md)
- [CHANGELOG.md](../../CHANGELOG.md)
