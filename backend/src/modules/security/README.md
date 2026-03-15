# Módulo de Seguridad

Este módulo implementa medidas avanzadas de seguridad para el sistema SIGQ.

## Características

### Rate Limiting
- **Protección contra fuerza bruta**: Límite de 5 intentos de login por minuto
- **Throttling por endpoint**: Diferentes límites según el tipo de operación
- **Protección por IP**: Rate limiting basado en dirección IP

### Backup Automático
- **Backups diarios**: Automáticos a las 2:00 AM
- **Backups semanales**: Los domingos a la 1:00 AM
- **Retención configurable**: Por defecto 30 días
- **Limpieza automática**: Elimina backups antiguos según política

### Encriptación
- **AES-256-GCM**: Para datos sensibles en base de datos
- **TLS 1.3**: Todas las comunicaciones encriptadas
- **Rotación de claves**: Soporte para rotación de claves de encriptación

## Endpoints

### Crear Backup Manual
```
POST /api/v1/security/backup/create
Roles: administrador
```

### Listar Backups
```
GET /api/v1/security/backup/list
Roles: administrador
```

### Restaurar Backup
```
POST /api/v1/security/backup/restore/:fileName
Roles: administrador
Límite: 1 restauración por hora
```

## Scripts de Backup

### Backup Manual
```bash
cd scripts
./backup-database.sh [tipo]
# Tipos: manual, daily, weekly
```

### Restaurar Backup
```bash
cd scripts
./restore-database.sh <archivo-backup>
```

## Configuración

### Variables de Entorno

```env
# Directorio de backups
BACKUP_DIR=/path/to/backups

# Retención de backups (días)
BACKUP_RETENTION_DAYS=30

# Número máximo de backups a mantener
BACKUP_MAX_COUNT=30

# Clave de encriptación (mínimo 32 caracteres)
ENCRYPTION_KEY=your-secure-encryption-key-min-32-chars
```

## Rate Limiting

### Configuración por Endpoint

- **Login**: 5 intentos por minuto
- **API General**: 100 solicitudes por minuto
- **Backup**: 5 backups por minuto
- **Restauración**: 1 restauración por hora

### Personalizar Rate Limits

Usa el decorador `@Throttle()` en los controladores:

```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 por minuto
@Get('endpoint')
async getData() {
  // ...
}
```

## Seguridad HTTP Headers

El sistema configura automáticamente los siguientes headers de seguridad:

- **HSTS**: Strict Transport Security (1 año)
- **X-Content-Type-Options**: no-sniff
- **X-XSS-Protection**: Filtro XSS activado
- **X-Frame-Options**: DENY (previene clickjacking)
- **Content-Security-Policy**: Política de seguridad de contenido

## Mejores Prácticas

1. **Backups**: Realiza backups manuales antes de cambios importantes
2. **Encriptación**: Rota las claves de encriptación periódicamente
3. **Rate Limiting**: Ajusta los límites según el uso real
4. **Monitoreo**: Revisa los logs de seguridad regularmente
5. **Recuperación**: Prueba los scripts de restauración periódicamente

## Troubleshooting

### Error: "Demasiadas solicitudes"
- Espera el tiempo especificado antes de intentar nuevamente
- Contacta al administrador si el problema persiste

### Error al crear backup
- Verifica que PostgreSQL esté accesible
- Verifica permisos en el directorio de backups
- Revisa los logs del servicio

### Error al restaurar backup
- Verifica que el archivo de backup existe
- Asegúrate de tener permisos de administrador
- Verifica que la base de datos esté accesible
