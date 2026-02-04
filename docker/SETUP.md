# Guía de Configuración Inicial - SIGQ

Esta guía te ayudará a configurar el entorno de desarrollo paso a paso.

## Paso 1: Verificar Requisitos

Asegúrate de tener instalado:
- Docker 20.10 o superior
- Docker Compose 2.0 o superior (incluido en Docker Desktop)

Verificar instalación:
```bash
docker --version
docker compose version
```

**⚠️ Importante**: En versiones modernas de Docker, se usa `docker compose` (sin guión) en lugar de `docker-compose`.

Si obtienes `command not found: docker-compose`, intenta usar `docker compose` (sin guión).

### Si Docker no está instalado:

**macOS:**
```bash
# Opción 1: Descargar Docker Desktop desde:
# https://www.docker.com/products/docker-desktop/

# Opción 2: Usando Homebrew
brew install --cask docker
```

Después de instalar, abre Docker Desktop desde Aplicaciones y espera a que inicie completamente.

## Paso 2: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:
   ```bash
   cd docker
   cp env.example .env
   ```

2. Editar `.env` y cambiar las contraseñas por defecto:
   ```bash
   nano .env  # o tu editor preferido
   ```

   **Contraseñas importantes a cambiar:**
   - `POSTGRES_PASSWORD`
   - `MINIO_ROOT_PASSWORD`
   - `KEYCLOAK_ADMIN_PASSWORD`
   - `JWT_SECRET` (debe ser una cadena segura de al menos 32 caracteres)
   - `ENCRYPTION_KEY` (debe ser exactamente 32 caracteres)

## Paso 3: Iniciar Servicios

Desde el directorio `docker/`:

```bash
# Iniciar todos los servicios en segundo plano
docker compose up -d

# Ver el estado de los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f
```

**Nota**: Si tienes una versión antigua de Docker y solo funciona `docker-compose` (con guión), puedes usarlo. Pero se recomienda actualizar a Docker Desktop.

Espera 1-2 minutos para que todos los servicios inicien completamente.

## Paso 4: Verificar Servicios

### PostgreSQL
```bash
docker compose exec postgres psql -U sigq_user -d sigq_db -c "SELECT version();"
```

### Redis
```bash
docker compose exec redis redis-cli ping
# Debe responder: PONG
```

### MinIO
1. Abrir navegador: http://localhost:9001
2. Login con credenciales de `.env`
3. Crear buckets:
   - `imagenes-medicas`
   - `documentos`
   - `fotos-pre-postop`

### Keycloak
1. Abrir navegador: http://localhost:8080/admin
2. Login con credenciales de `.env`
3. Crear Realm: `sistema-quirurgico`
4. Configurar clientes y roles (ver documentación en `docker/README.md`)

### Orthanc
- Abrir navegador: http://localhost:8042
- Debe mostrar la interfaz de Orthanc

## Paso 5: Verificar Health Checks

```bash
docker compose ps
```

Todos los servicios deben mostrar estado `healthy` o `Up`.

## Siguiente Paso

Una vez que todos los servicios estén corriendo, puedes proceder a:
1. Configurar el backend NestJS
2. Configurar el frontend React
3. Ejecutar migraciones de base de datos

## Problemas Comunes

### Error: "command not found: docker-compose"
**Solución**: Usa `docker compose` (sin guión) en lugar de `docker-compose`. Esto es el formato moderno de Docker.

Si aún no funciona, verifica que Docker Desktop esté instalado y corriendo:
```bash
docker --version
docker compose version
```

### Error: "port already in use"
Cambiar el puerto en `docker-compose.yml` o detener el servicio que está usando el puerto.

### Error: "permission denied"
En Linux, puede ser necesario usar `sudo` o agregar tu usuario al grupo docker:
```bash
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciar sesión
```

### Servicios no inician
1. Verificar logs: `docker compose logs [nombre-servicio]`
2. Verificar recursos de Docker (memoria, CPU)
3. Verificar que los puertos no estén ocupados
4. Verificar que Docker Desktop esté corriendo (en macOS/Windows)

### Resetear todo
⚠️ **ADVERTENCIA**: Esto elimina todos los datos
```bash
docker compose down -v
docker compose up -d
```
