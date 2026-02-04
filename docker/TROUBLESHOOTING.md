# Solución de Problemas - Docker Compose

## Problema: "command not found: docker-compose"

### Solución Rápida

En versiones modernas de Docker (Docker Desktop), el comando cambió de `docker-compose` (con guión) a `docker compose` (sin guión, como subcomando).

**Usa este comando:**
```bash
docker compose up -d
```

En lugar de:
```bash
docker-compose up -d  # ❌ Comando antiguo
```

### Verificar tu Versión de Docker

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose (formato moderno)
docker compose version
```

Si `docker compose version` funciona, entonces usa `docker compose` (sin guión) para todos los comandos.

### Si Docker no está Instalado

**macOS:**
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop/
2. Instala y abre Docker Desktop
3. Espera a que Docker Desktop inicie completamente (verás el ícono de Docker en la barra de menú)
4. Verifica la instalación:
   ```bash
   docker --version
   docker compose version
   ```

**Linux (Ubuntu/Debian):**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar sesión para aplicar cambios
```

### Comandos Actualizados

Todos estos comandos ahora usan `docker compose` (sin guión):

```bash
# Iniciar servicios
docker compose up -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener servicios
docker compose stop

# Eliminar contenedores
docker compose down

# Ejecutar comando en contenedor
docker compose exec postgres psql -U sigq_user -d sigq_db
```

### Si Necesitas Usar docker-compose (Versión Antigua)

Si tienes una instalación antigua de Docker y solo tienes `docker-compose` (con guión), puedes:

1. **Opción 1**: Instalar Docker Compose como plugin:
   ```bash
   # En macOS con Homebrew
   brew install docker-compose
   ```

2. **Opción 2**: Actualizar a Docker Desktop (recomendado), que incluye `docker compose` moderno.

### Verificar que Docker Desktop Esté Corriendo

En macOS/Windows, asegúrate de que Docker Desktop esté abierto y corriendo. Verás el ícono de Docker en la barra de menú/bandeja del sistema.

Si Docker Desktop no está corriendo, verás este error:
```
Cannot connect to the Docker daemon. Is the docker daemon running?
```

**Solución**: Abre Docker Desktop y espera a que inicie completamente.

## Otros Problemas Comunes

### Error: "Cannot connect to the Docker daemon"

**Causa**: Docker Desktop no está corriendo.

**Solución**: 
- macOS/Windows: Abre Docker Desktop
- Linux: Inicia el servicio Docker:
  ```bash
  sudo systemctl start docker
  sudo systemctl enable docker  # Para iniciar automáticamente
  ```

### Error: "port already in use"

**Causa**: Otro servicio está usando el puerto.

**Solución**: 
1. Identificar qué proceso usa el puerto:
   ```bash
   # macOS/Linux
   lsof -i :5432  # Para PostgreSQL
   lsof -i :8080  # Para Keycloak
   ```

2. Detener el proceso o cambiar el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Cambiar puerto externo
   ```

### Error: "permission denied"

**Causa**: Usuario no tiene permisos para Docker.

**Solución (Linux)**:
```bash
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciar sesión
```

**Solución (macOS)**: Asegúrate de que Docker Desktop esté corriendo y que tengas permisos de administrador si es necesario.

### Servicios no Inician

1. **Verificar logs**:
   ```bash
   docker compose logs [nombre-servicio]
   # Ejemplo:
   docker compose logs postgres
   ```

2. **Verificar recursos**: Docker Desktop necesita suficiente memoria y CPU. Ajusta en Docker Desktop > Settings > Resources.

3. **Verificar espacio en disco**: Los contenedores y volúmenes ocupan espacio.

4. **Reiniciar Docker Desktop**: Cierra y vuelve a abrir Docker Desktop.

### Resetear Todo (Eliminar Todos los Datos)

⚠️ **ADVERTENCIA**: Esto elimina todos los datos de los servicios.

```bash
# Detener y eliminar contenedores y volúmenes
docker compose down -v

# Limpiar imágenes no usadas (opcional)
docker system prune -a

# Volver a iniciar
docker compose up -d
```

## Obtener Ayuda

Si el problema persiste:

1. Verifica los logs del servicio específico:
   ```bash
   docker compose logs -f [nombre-servicio]
   ```

2. Verifica el estado de todos los servicios:
   ```bash
   docker compose ps
   ```

3. Verifica la configuración de Docker:
   ```bash
   docker info
   ```

4. Consulta la documentación oficial:
   - Docker: https://docs.docker.com/
   - Docker Compose: https://docs.docker.com/compose/
