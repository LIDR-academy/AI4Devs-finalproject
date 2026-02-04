# Solución Rápida: Puerto 5432 Ocupado

## Solución Automática (Recomendada)

Ejecuta el script de diagnóstico y resolución:

```bash
cd docker
./resolver-puerto-5432.sh
```

Este script:
- Identifica qué está usando el puerto 5432
- Detecta si es un contenedor Docker o PostgreSQL local
- Ofrece opciones para solucionarlo automáticamente

## Soluciones Manuales

### Opción 1: Detener Contenedores Docker Existentes

```bash
cd docker

# Ver todos los contenedores
docker ps -a

# Detener contenedores SIGQ
docker compose down

# O detener contenedores PostgreSQL específicos
docker ps -a | grep postgres
docker stop <container_id>
docker rm <container_id>
```

### Opción 2: Detener PostgreSQL Local (si está instalado)

```bash
# Si instalaste PostgreSQL con Homebrew
brew services stop postgresql
brew services stop postgresql@14
brew services stop postgresql@15

# O detener proceso directamente
lsof -i :5432  # Ver qué proceso usa el puerto
kill -9 <PID>  # Detener el proceso
```

### Opción 3: Usar Puerto Alternativo (Más Rápido)

Si no puedes o no quieres detener el proceso que usa el puerto:

```bash
cd docker
docker compose -f docker-compose.alt-ports.yml up -d
```

Esto usará el puerto **5433** en lugar de 5432.

**⚠️ Importante**: Si usas puertos alternativos, recuerda actualizar las configuraciones:
- Variables de entorno `.env`
- Configuración del backend cuando lo crees

### Opción 4: Cambiar Puerto en docker-compose.yml

Edita `docker-compose.yml` y cambia la línea:

```yaml
ports:
  - "5433:5432"  # Cambiar 5432 a 5433 (o el puerto que prefieras)
```

Luego:

```bash
docker compose up -d
```

## Verificar que el Puerto Está Libre

```bash
# Ver qué está usando el puerto
lsof -i :5432

# Si no muestra nada, el puerto está libre
```

## Después de Solucionar

Una vez que el puerto esté libre:

```bash
cd docker
docker compose up -d
docker compose ps  # Verificar que todos los servicios estén corriendo
```

## Resumen de Puertos Alternativos

Si usas `docker-compose.alt-ports.yml`:

| Servicio | Puerto Original | Puerto Alternativo |
|----------|----------------|-------------------|
| PostgreSQL | 5432 | **5433** |
| Redis | 6379 | 6380 |
| Keycloak | 8080 | 8081 |
| Orthanc | 8042 | 8043 |
| MinIO | 9000 | 9002 |
| MinIO Console | 9001 | 9003 |
| Prometheus | 9090 | 9091 |
| Grafana | 3001 | 3002 |

## Recomendación

1. **Primero**: Ejecuta `./resolver-puerto-5432.sh` para diagnóstico automático
2. **Si es contenedor Docker**: `docker compose down` y luego `docker compose up -d`
3. **Si es PostgreSQL local**: Detén el servicio local o usa puerto alternativo
4. **Si no puedes detener nada**: Usa `docker-compose.alt-ports.yml`
