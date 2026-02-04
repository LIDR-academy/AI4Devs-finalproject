# Inicio Rápido - Producción On-Premise

Guía rápida para desplegar SIGQ en producción.

## Instalación Rápida (5 minutos)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd AI4Devs-finalproject/docker

# 2. Instalación automatizada
sudo ./install.sh

# 3. Seguir las instrucciones del script
# - Editar .env.prod y cambiar contraseñas
# - El script generará secretos automáticamente

# 4. Verificar instalación
./scripts/manage.sh status
```

## Configuración Mínima Requerida

### 1. Editar `.env.prod`

```bash
nano .env.prod
```

**Cambiar obligatoriamente:**
- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `KEYCLOAK_ADMIN_PASSWORD`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `GRAFANA_ADMIN_PASSWORD`

### 2. Iniciar Servicios

```bash
./scripts/manage.sh start
```

### 3. Configurar Keycloak

1. Acceder: `http://localhost:8080`
2. Login con admin/admin (o credenciales de .env.prod)
3. Crear realm: `sistema-quirurgico`
4. Crear cliente: `backend-api`
5. Crear roles: `cirujano`, `enfermeria`, `administrador`

### 4. Configurar MinIO

1. Acceder: `http://localhost:9001`
2. Crear buckets: `imagenes-medicas`, `documentos`, `fotos-pre-postop`

## Comandos Esenciales

```bash
# Iniciar
./scripts/manage.sh start

# Detener
./scripts/manage.sh stop

# Estado
./scripts/manage.sh status

# Backup
./scripts/manage.sh backup

# Logs
./scripts/manage.sh logs
```

## Verificación

```bash
# Verificar servicios
docker compose -f docker-compose.prod.yml ps

# Verificar salud
curl http://localhost:3000/health
```

## Próximos Pasos

1. Configurar SSL/TLS (ver `SECURITY.md`)
2. Configurar backups automáticos (ver `DEPLOYMENT.md`)
3. Configurar monitoreo (ver `infrastructure/monitoring/README.md`)

## Documentación Completa

- **Instalación detallada**: `DEPLOYMENT.md`
- **Seguridad**: `SECURITY.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
