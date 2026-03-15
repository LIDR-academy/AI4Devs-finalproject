# Solución: Docker no está en el PATH

## Problema

Docker Desktop está instalado pero la terminal no encuentra el comando `docker`.

## Solución Rápida

### Opción 1: Cerrar y Abrir Nueva Terminal (Más Fácil)

1. **Cierra completamente la terminal actual**
2. **Abre una nueva terminal**
3. **Verifica que Docker Desktop esté corriendo** (ícono en la barra de menú)
4. **Prueba**:
   ```bash
   docker --version
   ```

Si funciona, continúa con:
```bash
cd docker
docker compose up -d
```

### Opción 2: Agregar Docker al PATH Manualmente (Esta Sesión)

Ejecuta este comando en tu terminal:

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
```

Luego verifica:
```bash
docker --version
docker info
```

### Opción 3: Usar el Script de Reparación

```bash
cd docker
./fix-docker-path.sh
```

Este script:
- Detecta Docker Desktop
- Agrega Docker al PATH para esta sesión
- Verifica que funcione

### Opción 4: Hacer el Cambio Permanente

Agrega Docker al PATH permanentemente en tu `~/.zshrc`:

1. **Abrir el archivo de configuración**:
   ```bash
   nano ~/.zshrc
   # o
   code ~/.zshrc  # si usas VS Code
   ```

2. **Agregar esta línea al final del archivo**:
   ```bash
   export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
   ```

3. **Guardar y cerrar** (en nano: Ctrl+X, luego Y, luego Enter)

4. **Recargar la configuración**:
   ```bash
   source ~/.zshrc
   ```

5. **Verificar**:
   ```bash
   docker --version
   ```

## Verificar que Docker Desktop Esté Corriendo

1. **Busca el ícono de Docker** en la barra de menú superior (macOS)
2. **Si no está**, abre Docker Desktop desde Aplicaciones
3. **Espera** a que el ícono aparezca y muestre "Docker Desktop is running"
4. **Verifica**:
   ```bash
   docker info
   ```

Si `docker info` funciona sin errores, Docker está corriendo correctamente.

## Pasos Completos para Iniciar Servicios

Una vez que Docker funcione:

```bash
# 1. Ir al directorio docker
cd docker

# 2. Verificar Docker (opcional)
./check-docker.sh

# 3. Crear archivo .env si no existe
cp env.example .env

# 4. Iniciar servicios
docker compose up -d

# 5. Verificar estado
docker compose ps
```

## Si Nada Funciona

1. **Reinstala Docker Desktop**:
   - Descarga desde: https://www.docker.com/products/docker-desktop/
   - Instala y abre Docker Desktop
   - Espera a que inicie completamente

2. **Reinicia tu Mac** (a veces ayuda)

3. **Verifica permisos**:
   - Docker Desktop necesita permisos de administrador
   - Asegúrate de que tu usuario tenga permisos

4. **Verifica la instalación**:
   ```bash
   ls -la /Applications/Docker.app
   ```

Si el directorio existe, Docker está instalado. El problema es solo el PATH.

## Comandos de Verificación

```bash
# Verificar si Docker está en el PATH
which docker

# Verificar versión
docker --version

# Verificar que Docker esté corriendo
docker info

# Verificar Docker Compose
docker compose version
```

## Resumen

El problema más común es que **necesitas cerrar y abrir una nueva terminal** después de instalar Docker Desktop. Docker Desktop agrega automáticamente sus binarios al PATH, pero las terminales abiertas antes de la instalación no tienen acceso.

**Solución más rápida**: Cierra la terminal, abre una nueva, y ejecuta `docker --version`.
