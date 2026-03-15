# Inicio Rápido - Docker Desktop

## ⚠️ Error: Docker Desktop no está corriendo

Si ves este error:
```
Cannot connect to the Docker daemon at unix:///Users/macbook/.docker/run/docker.sock
```

Significa que **Docker Desktop no está corriendo**.

## ✅ Solución Paso a Paso

### Paso 1: Abrir Docker Desktop

**Opción A: Desde Aplicaciones**
1. Abre **Finder**
2. Ve a **Aplicaciones**
3. Busca **Docker** y ábrelo

**Opción B: Desde Terminal**
```bash
open -a Docker
```

**Opción C: Usar el Script**
```bash
cd docker
./iniciar-docker.sh
```

### Paso 2: Esperar a que Docker Desktop Inicie

1. **Espera 30-60 segundos** mientras Docker Desktop inicia
2. **Busca el ícono de Docker** (🐳) en la barra de menú superior
3. **El ícono debe estar verde** cuando esté listo
4. **Pasa el mouse sobre el ícono** - debe mostrar "Docker Desktop is running"

### Paso 3: Verificar que Esté Corriendo

Ejecuta el script de verificación:

```bash
cd docker
./iniciar-docker.sh
```

O verifica manualmente:

```bash
docker info
```

Si `docker info` funciona **sin errores**, Docker está corriendo correctamente.

### Paso 4: Iniciar Servicios

Una vez que Docker Desktop esté corriendo:

```bash
cd docker
docker compose up -d
```

## 🔍 Verificación Rápida

```bash
# Verificar Docker
docker --version

# Verificar que esté corriendo (debe funcionar sin errores)
docker info

# Verificar Docker Compose
docker compose version
```

## ❓ Problemas Comunes

### "Docker Desktop se abre pero docker info falla"

**Solución**: Espera más tiempo. Docker Desktop tarda 30-60 segundos en iniciar completamente.

### "El ícono de Docker no aparece"

**Solución**: 
- Verifica que Docker Desktop esté realmente abierto
- Revisa si hay actualizaciones pendientes
- Reinicia Docker Desktop

### "Docker Desktop se cierra automáticamente"

**Solución**:
- Verifica los logs: Docker Desktop > Troubleshoot > View logs
- Verifica que tengas suficientes recursos del sistema
- Revisa si hay conflictos con otros software

### "No puedo encontrar Docker Desktop"

**Solución**: Instala Docker Desktop:
1. Descarga desde: https://www.docker.com/products/docker-desktop/
2. Instala la aplicación
3. Abre Docker Desktop desde Aplicaciones

## 📊 Estado del Ícono de Docker

En la barra de menú de macOS:

- 🟢 **Verde**: Docker Desktop está corriendo correctamente ✅
- 🟡 **Amarillo**: Docker Desktop está iniciando ⏳
- 🔴 **Rojo**: Docker Desktop tiene problemas ❌

**Espera a que esté verde** antes de usar Docker.

## 🚀 Comandos Útiles

```bash
# Abrir Docker Desktop
open -a Docker

# Verificar estado
docker info

# Ver contenedores
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a
```

## ✅ Checklist Antes de Continuar

- [ ] Docker Desktop está abierto
- [ ] El ícono de Docker aparece en la barra de menú
- [ ] El ícono está verde
- [ ] `docker info` funciona sin errores
- [ ] `docker compose version` funciona

Una vez que todos estos puntos estén ✅, puedes ejecutar:

```bash
cd docker
docker compose up -d
```
