# Despliegue On-Premise - SIGQ

Sistema completo de despliegue on-premise para el Sistema Integrado de Gestión Quirúrgica (SIGQ).

## 📋 Archivos Principales

- **`docker-compose.prod.yml`**: Configuración Docker Compose optimizada para producción
- **`.env.prod.example`**: Plantilla de variables de entorno para producción
- **`install.sh`**: Script de instalación automatizada
- **`scripts/manage.sh`**: Script de gestión del sistema
- **`scripts/backup-automatic.sh`**: Script de backup automático

## 📚 Documentación

- **`DEPLOYMENT.md`**: Guía completa de instalación y mantenimiento
- **`SECURITY.md`**: Guía de seguridad para producción
- **`QUICK-START-PRODUCTION.md`**: Inicio rápido (5 minutos)

## 🚀 Inicio Rápido

```bash
# 1. Instalación automatizada
sudo ./install.sh

# 2. Gestionar sistema
./scripts/manage.sh [comando]
```

## 🔧 Comandos de Gestión

```bash
./scripts/manage.sh start      # Iniciar servicios
./scripts/manage.sh stop       # Detener servicios
./scripts/manage.sh restart    # Reiniciar servicios
./scripts/manage.sh status     # Ver estado
./scripts/manage.sh backup     # Crear backup
./scripts/manage.sh restore    # Restaurar backup
./scripts/manage.sh logs       # Ver logs
./scripts/manage.sh update     # Actualizar imágenes
```

## 🔒 Seguridad

**⚠️ IMPORTANTE**: Antes de usar en producción:

1. Cambiar TODAS las contraseñas en `.env.prod`
2. Generar secretos seguros (el script `install.sh` lo hace automáticamente)
3. Configurar firewall
4. Configurar SSL/TLS
5. Revisar `SECURITY.md` para checklist completo

## 📦 Servicios Incluidos

- **PostgreSQL 15**: Base de datos principal
- **Redis 7**: Cache y colas
- **MinIO**: Almacenamiento de objetos
- **Keycloak 22**: Autenticación y autorización
- **Orthanc**: Servidor DICOM
- **Prometheus**: Métricas
- **Grafana**: Dashboards
- **Loki**: Logs centralizados

## 📊 Monitoreo

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`
- **Logs**: `./scripts/manage.sh logs`

## 💾 Backups

### Automático

Configurar cron para backups automáticos:

```bash
# Backups diarios a las 2:00 AM
0 2 * * * /opt/sigq/docker/scripts/backup-automatic.sh

# Backups semanales (domingos a las 3:00 AM)
0 3 * * 0 /opt/sigq/docker/scripts/backup-automatic.sh
```

### Manual

```bash
./scripts/manage.sh backup
```

## 🆘 Soporte

- **Documentación completa**: Ver `DEPLOYMENT.md`
- **Problemas comunes**: Ver `TROUBLESHOOTING.md`
- **Seguridad**: Ver `SECURITY.md`

## 📝 Notas

- Este despliegue está optimizado para entornos on-premise
- Todos los servicios corren en contenedores Docker
- Los datos persisten en volúmenes Docker
- Configuración lista para producción con ajustes de seguridad
