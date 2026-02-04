# Guía de Despliegue On-Premise - SIGQ

Esta guía proporciona instrucciones completas para desplegar el Sistema Integrado de Gestión Quirúrgica (SIGQ) en un entorno on-premise usando Docker Compose.

## Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación](#instalación)
3. [Configuración Inicial](#configuración-inicial)
4. [Gestión del Sistema](#gestión-del-sistema)
5. [Backups y Recuperación](#backups-y-recuperación)
6. [Mantenimiento](#mantenimiento)
7. [Seguridad](#seguridad)
8. [Troubleshooting](#troubleshooting)

## Requisitos del Sistema

### Hardware Mínimo

- **CPU**: 4 cores (8 cores recomendado)
- **RAM**: 8 GB (16 GB recomendado)
- **Disco**: 100 GB SSD (200 GB recomendado para datos)
- **Red**: Conexión estable a internet (para actualizaciones)

### Software Requerido

- **Sistema Operativo**: Linux (Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / RHEL 8+)
- **Docker**: 20.10 o superior
- **Docker Compose**: 2.0 o superior (incluido en Docker Desktop)
- **OpenSSL**: Para generar secretos

### Verificar Requisitos

```bash
# Verificar Docker
docker --version
docker compose version

# Verificar recursos del sistema
free -h
df -h
nproc
```

## Instalación

### Opción 1: Instalación Automatizada (Recomendado)

```bash
# 1. Clonar o copiar el repositorio al servidor
cd /opt/sigq  # o la ubicación deseada

# 2. Ir al directorio docker
cd docker

# 3. Ejecutar script de instalación
sudo ./install.sh
```

El script de instalación:
- Verifica requisitos del sistema
- Crea directorios necesarios
- Configura variables de entorno
- Genera secretos de seguridad
- Inicia todos los servicios

### Opción 2: Instalación Manual

```bash
# 1. Crear archivo de variables de entorno
cp .env.prod.example .env.prod

# 2. Editar .env.prod y cambiar TODAS las contraseñas
nano .env.prod

# 3. Generar secretos
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)
GRAFANA_SECRET_KEY=$(openssl rand -hex 16)

# Actualizar en .env.prod

# 4. Iniciar servicios
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Configuración Inicial

### 1. Configurar Keycloak

1. Acceder a la consola de administración:
   ```
   http://localhost:8080
   ```

2. Iniciar sesión con las credenciales de administrador configuradas en `.env.prod`

3. Crear Realm:
   - Nombre: `sistema-quirurgico`
   - Habilitar: `Enabled`

4. Crear Cliente:
   - Client ID: `backend-api`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/*`

5. Crear Roles:
   - `cirujano`
   - `enfermeria`
   - `administrador`

6. Crear usuarios y asignar roles

### 2. Configurar MinIO

1. Acceder a la consola:
   ```
   http://localhost:9001
   ```

2. Iniciar sesión con credenciales de `.env.prod`

3. Crear buckets:
   - `imagenes-medicas`
   - `documentos`
   - `fotos-pre-postop`

4. Configurar políticas de acceso según necesidades

### 3. Ejecutar Migraciones de Base de Datos

```bash
# Si el backend está corriendo en un contenedor
docker compose -f docker-compose.prod.yml exec backend npm run migration:run

# O desde el servidor si el backend está instalado localmente
cd ../backend
npm run migration:run
```

### 4. Configurar Backend y Frontend

1. **Backend**: Asegurarse de que las variables de entorno en `.env.prod` estén correctas
2. **Frontend**: Configurar `VITE_API_URL` con la URL del backend en producción

## Gestión del Sistema

### Script de Gestión

Usa el script `scripts/manage.sh` para gestionar el sistema:

```bash
cd docker
./scripts/manage.sh [comando]
```

**Comandos disponibles:**

- `start` - Iniciar todos los servicios
- `stop` - Detener todos los servicios
- `restart` - Reiniciar todos los servicios
- `status` - Mostrar estado de los servicios
- `backup` - Crear backup de la base de datos
- `restore <archivo>` - Restaurar backup
- `logs [servicio]` - Ver logs (opcional: nombre del servicio)
- `update` - Actualizar imágenes Docker
- `cleanup` - Limpiar recursos no usados

### Comandos Docker Compose Directos

```bash
# Iniciar servicios
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Detener servicios
docker compose -f docker-compose.prod.yml --env-file .env.prod stop

# Ver logs
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml --env-file .env.prod restart postgres

# Ver estado
docker compose -f docker-compose.prod.yml ps
```

## Backups y Recuperación

### Backup Automático

El sistema incluye backups automáticos configurados en el módulo de seguridad del backend. Los backups se ejecutan:

- **Diarios**: A las 2:00 AM
- **Semanales**: Domingos a las 3:00 AM

Los backups se guardan en: `docker/backups/`

### Backup Manual

```bash
# Usando el script de gestión
./scripts/manage.sh backup

# O manualmente
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U sigq_user -d sigq_db | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurar Backup

```bash
# Usando el script de gestión
./scripts/manage.sh restore backups/backup_20240127_020000.sql.gz

# O manualmente
gunzip -c backups/backup_20240127_020000.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U sigq_user -d sigq_db
```

### Retención de Backups

- **Backups diarios**: 7 días
- **Backups semanales**: 4 semanas
- **Backups mensuales**: 12 meses

Configurar limpieza automática en cron:

```bash
# Agregar a crontab
0 3 * * * find /opt/sigq/docker/backups -name "backup_*.sql.gz" -mtime +7 -delete
```

## Mantenimiento

### Actualizar el Sistema

```bash
# 1. Crear backup antes de actualizar
./scripts/manage.sh backup

# 2. Actualizar imágenes
./scripts/manage.sh update

# 3. Reiniciar servicios
./scripts/manage.sh restart

# 4. Verificar que todo funcione
./scripts/manage.sh status
```

### Monitoreo

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`
- **Logs**: Usar `./scripts/manage.sh logs` o `docker compose logs`

### Limpieza de Logs

Los logs de Docker están configurados con rotación automática (10MB por archivo, máximo 3 archivos). Para limpiar manualmente:

```bash
docker system prune -f
```

### Actualización de Base de Datos

```bash
# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec backend npm run migration:run

# Revertir última migración (si es necesario)
docker compose -f docker-compose.prod.yml exec backend npm run migration:revert
```

## Seguridad

### Checklist de Seguridad para Producción

- [ ] Cambiar TODAS las contraseñas en `.env.prod`
- [ ] Usar secretos fuertes (mínimo 32 caracteres)
- [ ] Configurar firewall (solo puertos necesarios)
- [ ] Configurar SSL/TLS para servicios expuestos
- [ ] Habilitar autenticación en Redis
- [ ] Configurar backups automáticos
- [ ] Revisar y configurar políticas de acceso en MinIO
- [ ] Configurar roles y permisos en Keycloak
- [ ] Habilitar MFA en Keycloak
- [ ] Configurar límites de recursos (CPU/RAM)
- [ ] Revisar logs regularmente
- [ ] Mantener imágenes Docker actualizadas

### Configurar Firewall (UFW)

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (si se usa)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Configurar SSL/TLS

Para producción, se recomienda usar un reverse proxy (nginx/traefik) con certificados SSL. Ver sección de [Configuración de Reverse Proxy](#configuración-de-reverse-proxy).

### Rotación de Secretos

```bash
# Generar nuevos secretos
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Actualizar en .env.prod
# Reiniciar servicios después de cambiar secretos
./scripts/manage.sh restart
```

## Troubleshooting

### Servicios no inician

```bash
# Ver logs del servicio
./scripts/manage.sh logs [nombre_servicio]

# Verificar estado
./scripts/manage.sh status

# Verificar recursos del sistema
docker stats
```

### Base de datos no responde

```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.prod.yml ps postgres

# Ver logs
docker compose -f docker-compose.prod.yml logs postgres

# Conectar manualmente
docker compose -f docker-compose.prod.yml exec postgres psql -U sigq_user -d sigq_db
```

### Problemas de memoria

```bash
# Ver uso de recursos
docker stats

# Limpiar recursos no usados
./scripts/manage.sh cleanup
```

### Problemas de puertos

```bash
# Verificar qué está usando un puerto
sudo lsof -i :5432

# Cambiar puerto en docker-compose.prod.yml y .env.prod
```

### Recuperar contraseña de administrador

```bash
# Keycloak: Resetear desde la consola o recrear contenedor
docker compose -f docker-compose.prod.yml exec keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password [nueva_password]
```

## Configuración de Reverse Proxy (Opcional)

Para producción, se recomienda usar nginx o traefik como reverse proxy con SSL.

### Ejemplo con Nginx

```nginx
server {
    listen 80;
    server_name sigq.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sigq.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Soporte y Documentación Adicional

- **Documentación del Backend**: `backend/README.md`
- **Documentación de Monitoreo**: `infrastructure/monitoring/README.md`
- **Troubleshooting Docker**: `docker/TROUBLESHOOTING.md`
- **Guía de CORS**: `backend/CORS-TROUBLESHOOTING.md`

## Contacto

Para soporte técnico o reportar problemas, consulta la documentación del proyecto o contacta al equipo de desarrollo.
