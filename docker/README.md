# Docker Compose - SIGQ

Configuración de Docker Compose para el entorno de desarrollo del Sistema Integrado de Gestión Quirúrgica (SIGQ).

## Servicios Incluidos

### Base de Datos y Almacenamiento
- **PostgreSQL 15**: Base de datos principal
- **Redis 7**: Cache y cola de trabajos (Bull)
- **MinIO**: Almacenamiento de objetos S3-compatible

### Autenticación
- **Keycloak 22**: Servidor de autenticación (SSO, MFA, RBAC)

### Imágenes Médicas
- **Orthanc**: Servidor DICOM para almacenamiento y visualización de imágenes médicas

### Monitoreo
- **Prometheus**: Recolección de métricas
- **Grafana**: Dashboards y visualización

## Requisitos Previos

- Docker 20.10+ (incluye Docker Compose como subcomando)
- Docker Desktop (recomendado) o Docker Engine + Docker Compose Plugin

### Verificar Instalación

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose (formato moderno)
docker compose version
```

**Nota**: En versiones modernas de Docker, se usa `docker compose` (sin guión) en lugar de `docker-compose`.

### Instalación de Docker

**macOS:**
```bash
# Opción 1: Descargar Docker Desktop desde:
# https://www.docker.com/products/docker-desktop/

# Opción 2: Usando Homebrew
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciar sesión
```

## Inicio Rápido

### Opción 1: Script Automático (Más Fácil)

```bash
cd docker
./check-docker.sh    # Verificar instalación
./start.sh          # Iniciar servicios
```

### Opción 2: Manual

1. **Verificar Docker**:
   ```bash
   docker --version
   docker info  # Debe funcionar sin errores
   docker compose version  # o docker-compose --version
   ```

2. **Copiar archivo de variables de entorno**:
   ```bash
   cd docker
   cp env.example .env
   ```

3. **Editar variables de entorno** (opcional, especialmente contraseñas):
   ```bash
   nano .env  # o tu editor preferido
   ```

4. **Iniciar todos los servicios**:
   ```bash
   # Formato moderno (recomendado)
   docker compose up -d
   
   # Si no funciona, intenta formato antiguo
   docker-compose up -d
   ```
   
   **Nota**: Si `docker compose` no funciona, usa `docker-compose` (con guión). Si ninguno funciona, verifica la instalación de Docker.

5. **Verificar que todos los servicios estén corriendo**:
   ```bash
   docker compose ps
   # o
   docker-compose ps
   ```

6. **Ver logs de un servicio específico**:
   ```bash
   docker compose logs -f postgres
   docker compose logs -f keycloak
   ```

### Si Tienes Problemas

Ver archivo `QUICKSTART.md` o `TROUBLESHOOTING.md` para solución de problemas comunes.

## Acceso a los Servicios

Una vez iniciados, los servicios estarán disponibles en:

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MinIO Console**: http://localhost:9001 (usuario: `minioadmin`, contraseña: ver `.env`)
- **Keycloak Admin**: http://localhost:8080 (usuario: `admin`, contraseña: ver `.env`)
- **Orthanc**: http://localhost:8042
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (usuario: `admin`, contraseña: ver `.env`)

## Configuración Inicial

### MinIO - Crear Buckets

1. Acceder a http://localhost:9001
2. Iniciar sesión con credenciales de `.env`
3. Crear los siguientes buckets:
   - `imagenes-medicas`
   - `documentos`
   - `fotos-pre-postop`

### Keycloak - Configuración Inicial

1. Acceder a http://localhost:8080/admin
2. Iniciar sesión con credenciales de `.env`
3. Crear Realm: `sistema-quirurgico`
4. Crear Clientes:
   - `backend-api` (confidential)
   - `frontend-app` (public)
5. Crear Roles:
   - `cirujano`
   - `enfermeria`
   - `administrador`

### Orthanc - Configuración

Orthanc viene preconfigurado. Puedes acceder a la interfaz web en http://localhost:8042

## Comandos Útiles

```bash
# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volúmenes (⚠️ elimina datos)
docker compose down -v

# Reiniciar un servicio específico
docker compose restart postgres

# Ver logs en tiempo real
docker compose logs -f

# Ejecutar comando en un contenedor
docker compose exec postgres psql -U sigq_user -d sigq_db
```

**Nota**: Si tu versión de Docker es antigua y solo tienes `docker-compose` (con guión), puedes usar ese comando en su lugar. Sin embargo, se recomienda actualizar a Docker Desktop que incluye `docker compose` (sin guión).

## Volúmenes de Datos

Los datos se almacenan en volúmenes Docker con nombres:
- `postgres_data`: Base de datos PostgreSQL
- `redis_data`: Datos de Redis
- `minio_data`: Archivos de MinIO
- `keycloak_data`: Configuración de Keycloak
- `orthanc_data`: Base de datos DICOM de Orthanc
- `prometheus_data`: Métricas de Prometheus
- `grafana_data`: Dashboards de Grafana

## Troubleshooting

### Puerto ya en uso
Si un puerto está ocupado, puedes cambiarlo en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Cambiar puerto externo
```

### Servicios no inician
1. Verificar logs: `docker-compose logs [servicio]`
2. Verificar que Docker tenga suficientes recursos
3. Verificar que los puertos no estén ocupados

### Resetear datos
```bash
# ⚠️ ADVERTENCIA: Esto elimina todos los datos
docker-compose down -v
docker-compose up -d
```

## Producción

⚠️ **IMPORTANTE**: Este `docker-compose.yml` es para desarrollo. Para producción:

1. Cambiar todas las contraseñas por defecto
2. Usar variables de entorno seguras
3. Configurar TLS/SSL
4. Configurar backups automáticos
5. Revisar configuración de seguridad de cada servicio
6. Considerar usar `docker-compose.prod.yml` separado

## Health Checks

Todos los servicios incluyen health checks. Verificar estado:
```bash
docker-compose ps
```

Los servicios mostrarán `healthy` cuando estén listos.
