# Solución de Problemas - Loki

## Problema: Loki no está corriendo en el puerto 3100

### Verificación Inicial

1. **Verificar si el contenedor está corriendo:**
   ```bash
   docker compose ps | grep loki
   ```

2. **Verificar si el puerto está ocupado:**
   ```bash
   lsof -i :3100
   # o en Windows/Mac
   netstat -an | grep 3100
   ```

3. **Ver logs de Loki:**
   ```bash
   docker compose logs loki
   ```

### Soluciones Comunes

#### 1. El servicio no está iniciado

**Solución:**
```bash
cd docker
docker compose up -d loki
```

#### 2. Error de configuración

Si ves errores relacionados con la configuración:

```bash
# Verificar que el archivo de configuración existe
ls -la ../infrastructure/monitoring/loki/loki-config.yml

# Verificar la configuración dentro del contenedor
docker compose exec loki cat /etc/loki/local-config.yaml
```

#### 3. Problemas de permisos

Si hay problemas con los volúmenes:

```bash
# Verificar permisos del volumen
docker volume inspect docker_loki_data

# Recrear el volumen si es necesario
docker compose down loki
docker volume rm docker_loki_data
docker compose up -d loki
```

#### 4. Puerto 3100 ocupado

Si otro proceso está usando el puerto:

```bash
# Encontrar el proceso
lsof -i :3100

# Detener el proceso o cambiar el puerto en docker-compose.yml
# Cambiar "3100:3100" a "3101:3100" por ejemplo
```

#### 5. Error de red Docker

Si Loki no puede conectarse a la red:

```bash
# Verificar que la red existe
docker network ls | grep sigq-network

# Recrear la red si es necesario
docker network create sigq-network
docker compose up -d loki
```

### Verificar que Loki está funcionando

Una vez iniciado, verifica que está respondiendo:

```bash
# Verificar endpoint de salud
curl http://localhost:3100/ready

# Debería responder: ready

# Verificar métricas
curl http://localhost:3100/metrics
```

### Reiniciar todos los servicios de monitoreo

Si nada funciona, reinicia todos los servicios:

```bash
cd docker
docker compose stop prometheus loki promtail grafana
docker compose up -d prometheus loki promtail grafana
```

### Logs Detallados

Para ver logs en tiempo real:

```bash
docker compose logs -f loki
```

### Contacto

Si el problema persiste, revisa:
- La versión de Docker Compose (debe ser v2+)
- Los recursos disponibles (memoria, disco)
- Los logs completos del contenedor
