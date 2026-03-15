# Solución: Puerto ya está en uso

## Problema

Error: `Bind for 0.0.0.0:5432 failed: port is already allocated`

Esto significa que el puerto 5432 (PostgreSQL) o algún otro puerto ya está siendo usado por otro proceso o contenedor.

## Solución Rápida

### Opción 1: Detener Contenedores Docker Existentes (Recomendado)

Si tienes contenedores Docker anteriores corriendo:

```bash
cd docker

# Ver contenedores corriendo
docker ps

# Detener todos los contenedores SIGQ
docker compose down

# O detener contenedores específicos
docker stop sigq-postgres
docker rm sigq-postgres

# Luego iniciar de nuevo
docker compose up -d
```

### Opción 2: Usar Script de Diagnóstico

```bash
cd docker
./fix-ports.sh
```

Este script:
- Verifica qué puertos están ocupados
- Muestra qué proceso los está usando
- Ofrece opciones para solucionarlo

### Opción 3: Identificar y Detener el Proceso Manualmente

```bash
# Ver qué está usando el puerto 5432
lsof -i :5432

# Ver todos los puertos ocupados
lsof -i :5432 -i :6379 -i :8080 -i :8042 -i :9000 -i :9090 -i :3001
```

Si es un proceso de PostgreSQL local:
```bash
# macOS (si está instalado con Homebrew)
brew services stop postgresql

# O detener el proceso directamente
kill -9 <PID>  # Reemplaza <PID> con el número del proceso
```

### Opción 4: Usar Puertos Alternativos

Si no puedes detener el proceso que usa el puerto, usa el archivo con puertos alternativos:

```bash
cd docker
docker compose -f docker-compose.alt-ports.yml up -d
```

**Puertos alternativos:**
- PostgreSQL: `5433` (en lugar de 5432)
- Redis: `6380` (en lugar de 6379)
- Keycloak: `8081` (en lugar de 8080)
- Orthanc: `8043` (en lugar de 8042)
- MinIO: `9002` (en lugar de 9000)
- MinIO Console: `9003` (en lugar de 9001)
- Prometheus: `9091` (en lugar de 9090)
- Grafana: `3002` (en lugar de 3001)

**⚠️ Importante**: Si usas puertos alternativos, actualiza las configuraciones en:
- `env.example` / `.env`
- Configuración del backend
- Configuración del frontend

### Opción 5: Cambiar Puertos en docker-compose.yml

Edita `docker-compose.yml` y cambia los puertos externos:

```yaml
ports:
  - "5433:5432"  # Cambiar 5432 a 5433 (o el puerto que prefieras)
```

## Verificar Puertos Disponibles

```bash
# Verificar puerto específico
lsof -i :5432

# Verificar múltiples puertos
lsof -i :5432 -i :6379 -i :8080
```

## Limpiar Todo y Empezar de Nuevo

Si quieres limpiar completamente:

```bash
cd docker

# Detener y eliminar contenedores
docker compose down

# Eliminar volúmenes (⚠️ elimina datos)
docker compose down -v

# Limpiar contenedores huérfanos
docker container prune -f

# Iniciar de nuevo
docker compose up -d
```

## Puertos Usados por SIGQ

| Servicio | Puerto Interno | Puerto Externo (Default) | Puerto Alternativo |
|----------|----------------|--------------------------|-------------------|
| PostgreSQL | 5432 | 5432 | 5433 |
| Redis | 6379 | 6379 | 6380 |
| Keycloak | 8080 | 8080 | 8081 |
| Orthanc | 8042 | 8042 | 8043 |
| MinIO | 9000 | 9000 | 9002 |
| MinIO Console | 9001 | 9001 | 9003 |
| Prometheus | 9090 | 9090 | 9091 |
| Grafana | 3000 | 3001 | 3002 |

## Solución Recomendada

1. **Primero**: Ejecuta `./fix-ports.sh` para diagnosticar
2. **Si son contenedores Docker**: `docker compose down` y luego `docker compose up -d`
3. **Si es PostgreSQL local**: Detén el servicio local
4. **Si no puedes detener el proceso**: Usa `docker-compose.alt-ports.yml`

## Después de Solucionar

Verifica que todo esté funcionando:

```bash
docker compose ps
```

Todos los servicios deben mostrar estado `Up` o `healthy`.
