# Guía de Seguridad para Producción - SIGQ

Esta guía proporciona recomendaciones de seguridad para desplegar SIGQ en un entorno de producción on-premise.

## Tabla de Contenidos

1. [Configuración Inicial de Seguridad](#configuración-inicial-de-seguridad)
2. [Contraseñas y Secretos](#contraseñas-y-secretos)
3. [Configuración de Red](#configuración-de-red)
4. [SSL/TLS](#ssltls)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Encriptación de Datos](#encriptación-de-datos)
7. [Monitoreo y Auditoría](#monitoreo-y-auditoría)
8. [Backups Seguros](#backups-seguros)
9. [Actualizaciones de Seguridad](#actualizaciones-de-seguridad)
10. [Checklist de Seguridad](#checklist-de-seguridad)

## Configuración Inicial de Seguridad

### 1. Cambiar Todas las Contraseñas por Defecto

**⚠️ CRÍTICO**: Antes de desplegar en producción, cambiar TODAS las contraseñas en `.env.prod`:

```bash
# Generar contraseñas seguras
openssl rand -base64 32  # Para contraseñas generales
openssl rand -hex 32     # Para secretos JWT
```

**Contraseñas que DEBEN cambiarse:**
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `KEYCLOAK_ADMIN_PASSWORD`
- `KEYCLOAK_CLIENT_SECRET`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `GRAFANA_ADMIN_PASSWORD`
- `GRAFANA_SECRET_KEY`
- `ORTHANC_PASSWORD`

### 2. Proteger Archivo de Variables de Entorno

```bash
# Establecer permisos restrictivos
chmod 600 .env.prod
chown root:root .env.prod

# Nunca commitear .env.prod al repositorio
echo ".env.prod" >> .gitignore
```

### 3. Configurar Firewall

```bash
# Instalar UFW (Ubuntu/Debian)
sudo apt-get install ufw

# Permitir solo puertos necesarios
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (si se usa)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar reglas
sudo ufw status verbose
```

## Contraseñas y Secretos

### Generación de Secretos Seguros

```bash
# JWT Secret (mínimo 32 caracteres)
JWT_SECRET=$(openssl rand -hex 32)

# Encryption Key (exactamente 32 caracteres)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Grafana Secret Key
GRAFANA_SECRET_KEY=$(openssl rand -hex 16)

# Contraseñas generales (mínimo 16 caracteres)
PASSWORD=$(openssl rand -base64 24)
```

### Rotación de Secretos

**Frecuencia recomendada:**
- JWT_SECRET: Cada 90 días
- ENCRYPTION_KEY: Cada 180 días (requiere re-encriptar datos)
- Contraseñas de servicios: Cada 90 días

**Proceso de rotación:**

1. Generar nuevos secretos
2. Actualizar `.env.prod`
3. Crear backup antes de cambiar
4. Reiniciar servicios
5. Verificar que todo funcione

## Configuración de Red

### Red Interna Docker

El `docker-compose.prod.yml` crea una red interna aislada. Los servicios solo son accesibles desde:

- **Internamente**: Entre contenedores en la misma red
- **Externamente**: Solo a través de puertos expuestos explícitamente

### Restringir Acceso a Puertos

**PostgreSQL**: No exponer puerto 5432 públicamente si es posible. Si es necesario, usar firewall:

```bash
# Permitir solo desde IPs específicas
sudo ufw allow from 10.0.0.0/8 to any port 5432
```

**Redis**: Siempre usar contraseña y no exponer públicamente:

```yaml
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

**MinIO**: Usar contraseña fuerte y considerar acceso solo interno:

```yaml
# No exponer puertos públicamente, usar reverse proxy
```

## SSL/TLS

### Configurar HTTPS con Nginx

1. **Obtener certificados SSL** (Let's Encrypt recomendado):

```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d sigq.example.com
```

2. **Configurar Nginx**:

```nginx
server {
    listen 80;
    server_name sigq.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sigq.example.com;

    ssl_certificate /etc/letsencrypt/live/sigq.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sigq.example.com/privkey.pem;
    
    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Renovación automática de certificados**:

```bash
# Agregar a crontab
0 0 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

## Autenticación y Autorización

### Keycloak - Configuración Segura

1. **Habilitar MFA**:
   - Configurar TOTP (Time-based One-Time Password)
   - Requerir MFA para roles administrativos

2. **Configurar Políticas de Contraseña**:
   - Longitud mínima: 12 caracteres
   - Requerir mayúsculas, minúsculas, números y símbolos
   - Prevenir reutilización de últimas 5 contraseñas
   - Expiración: 90 días

3. **Configurar Sesiones**:
   - SSO Session Idle: 30 minutos
   - SSO Session Max: 8 horas
   - Access Token Lifespan: 15 minutos

4. **Habilitar Auditoría**:
   - Registrar todos los eventos de autenticación
   - Alertas para intentos fallidos

### Backend - Rate Limiting

El sistema ya incluye rate limiting configurado:
- **General**: 100 solicitudes por minuto
- **Login**: 5 intentos por minuto

Verificar configuración en `backend/src/config/throttler.config.ts`

## Encriptación de Datos

### Datos en Tránsito

- **TLS 1.2+**: Todas las comunicaciones externas
- **HTTPS**: Frontend y API
- **Conexiones internas**: Red Docker aislada

### Datos en Reposo

- **PostgreSQL**: Datos sensibles encriptados con AES-256-GCM
- **MinIO**: Opcionalmente habilitar encriptación del servidor
- **Backups**: Almacenar en ubicación segura, preferiblemente encriptados

### Encriptación de Datos Sensibles

El sistema incluye `EncryptionService` que encripta:
- Información médica sensible
- Datos personales de pacientes
- Notas médicas

**Configuración:**
- `ENCRYPTION_KEY`: Debe ser exactamente 32 caracteres
- Rotación de claves: Requiere re-encriptar datos existentes

## Monitoreo y Auditoría

### Logs de Seguridad

El sistema registra automáticamente:
- Intentos de autenticación (exitosos y fallidos)
- Accesos a datos sensibles
- Cambios en registros médicos
- Acciones administrativas

**Revisar logs regularmente:**
```bash
# Logs de autenticación
./scripts/manage.sh logs keycloak | grep -i "auth"

# Logs de auditoría del backend
./scripts/manage.sh logs backend | grep -i "audit"
```

### Alertas de Seguridad

Configurar alertas en Prometheus/Grafana para:
- Múltiples intentos de login fallidos
- Accesos no autorizados
- Cambios en datos críticos
- Uso anormal de recursos

### Auditoría GDPR

El sistema incluye endpoints de auditoría para cumplimiento GDPR:
- Exportación de datos de usuario
- Anonimización de logs
- Eliminación de datos (derecho al olvido)

Ver: `backend/src/modules/audit/README.md`

## Backups Seguros

### Ubicación de Backups

- **Local**: `docker/backups/` (temporal)
- **Remoto**: Copiar a servidor externo o almacenamiento en la nube

### Encriptar Backups

```bash
# Crear backup encriptado
./scripts/manage.sh backup | gpg --symmetric --cipher-algo AES256 -o backup_encrypted.sql.gz.gpg
```

### Retención

- **Backups diarios**: 7 días
- **Backups semanales**: 4 semanas
- **Backups mensuales**: 12 meses

### Verificación de Backups

Probar restauración de backups regularmente (mensualmente):

```bash
# En entorno de prueba
./scripts/manage.sh restore backups/backup_daily_YYYYMMDD_HHMMSS.sql.gz
```

## Actualizaciones de Seguridad

### Proceso de Actualización

1. **Revisar actualizaciones de seguridad**:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   ```

2. **Crear backup antes de actualizar**:
   ```bash
   ./scripts/manage.sh backup
   ```

3. **Actualizar imágenes**:
   ```bash
   ./scripts/manage.sh update
   ```

4. **Reiniciar servicios**:
   ```bash
   ./scripts/manage.sh restart
   ```

5. **Verificar funcionamiento**:
   ```bash
   ./scripts/manage.sh status
   ```

### Frecuencia de Actualizaciones

- **Críticas**: Inmediatamente
- **Importantes**: Semanalmente
- **Regulares**: Mensualmente

### Monitorear Vulnerabilidades

- Revisar CVE (Common Vulnerabilities and Exposures)
- Suscribirse a alertas de seguridad de Docker
- Revisar changelogs de imágenes oficiales

## Checklist de Seguridad

### Pre-Despliegue

- [ ] Todas las contraseñas cambiadas
- [ ] Secretos generados con valores aleatorios
- [ ] `.env.prod` con permisos 600
- [ ] Firewall configurado
- [ ] SSL/TLS configurado
- [ ] Backups configurados
- [ ] Monitoreo configurado

### Post-Despliegue

- [ ] Keycloak configurado (MFA, políticas de contraseña)
- [ ] Roles y permisos configurados
- [ ] MinIO con políticas de acceso
- [ ] Logs de auditoría funcionando
- [ ] Alertas de seguridad configuradas
- [ ] Backups verificados y funcionando

### Mantenimiento Continuo

- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar sistema mensualmente
- [ ] Rotar secretos según política
- [ ] Probar restauración de backups mensualmente
- [ ] Revisar accesos y permisos trimestralmente
- [ ] Auditoría de seguridad anual

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GDPR Compliance Guide](https://gdpr.eu/)

## Contacto

Para reportar vulnerabilidades de seguridad, contacta al equipo de desarrollo de forma privada.
