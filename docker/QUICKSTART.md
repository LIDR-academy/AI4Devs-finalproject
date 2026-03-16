# Inicio Rápido - SIGQ Docker

## Opción 1: Usar Script Automático (Recomendado)

```bash
cd docker
./check-docker.sh    # Verificar que todo esté bien
./start.sh          # Iniciar todos los servicios
```

## Opción 2: Manual

### Paso 1: Verificar Docker

```bash
# Verificar que Docker esté instalado
docker --version

# Verificar que Docker esté corriendo
docker info

# Verificar Docker Compose
docker compose version
```

Si alguno de estos comandos falla:
- **Docker no instalado**: Instala Docker Desktop desde https://www.docker.com/products/docker-desktop/
- **Docker no corriendo**: Abre Docker Desktop y espera a que inicie

### Paso 2: Configurar Variables de Entorno

```bash
cd docker
cp env.example .env
# Opcional: Editar .env para cambiar contraseñas
```

### Paso 3: Iniciar Servicios

```bash
# Si tienes Docker moderno (recomendado)
docker compose up -d

# Si tienes Docker antiguo
docker-compose up -d
```

### Paso 4: Verificar Estado

```bash
docker compose ps
# o
docker-compose ps
```

## Solución de Problemas

### "command not found: docker"

**Problema**: Docker no está en el PATH o no está instalado.

**Solución**:
1. Instala Docker Desktop
2. Abre Docker Desktop
3. Cierra y vuelve a abrir la terminal
4. Verifica: `docker --version`

### "Cannot connect to the Docker daemon"

**Problema**: Docker Desktop no está corriendo.

**Solución**:
1. Abre Docker Desktop
2. Espera a que el ícono aparezca en la barra de menú
3. Verifica que el estado sea "Running"
4. Verifica: `docker info`

### "command not found: docker-compose"

**Problema**: Estás usando el comando antiguo.

**Solución**: Usa `docker compose` (sin guión):
```bash
docker compose up -d
```

Si tampoco funciona `docker compose`, entonces:
1. Actualiza Docker Desktop a la última versión
2. O instala docker-compose: `brew install docker-compose`

### "port already in use"

**Problema**: Otro servicio está usando el puerto.

**Solución**:
1. Identificar qué usa el puerto:
   ```bash
   lsof -i :5432  # Para PostgreSQL
   lsof -i :8080  # Para Keycloak
   ```

2. Detener el proceso o cambiar el puerto en `docker-compose.yml`

## Verificar que Todo Funciona

```bash
# Ver estado de servicios
docker compose ps

# Ver logs de un servicio
docker compose logs -f postgres

# Verificar PostgreSQL
docker compose exec postgres psql -U sigq_user -d sigq_db -c "SELECT version();"

# Verificar Redis
docker compose exec redis redis-cli ping
# Debe responder: PONG
```

## Detener Servicios

```bash
# Detener sin eliminar contenedores
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar TODO (incluyendo datos)
docker compose down -v
```

## Acceso a Servicios

Una vez iniciados:

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO Console**: http://localhost:9001
- **Keycloak**: http://localhost:8080
- **Orthanc**: http://localhost:8042
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## Siguiente Paso

Después de que los servicios estén corriendo, continúa con:
1. Configuración inicial de Keycloak (realm, clientes, roles)
2. Crear buckets en MinIO
3. Configurar el backend NestJS
4. Configurar el frontend React
