# Solución: Docker Desktop no está corriendo

## Error

```
Cannot connect to the Docker daemon at unix:///Users/macbook/.docker/run/docker.sock. 
Is the docker daemon running?
```

## Solución

### Paso 1: Abrir Docker Desktop

1. **Abre Docker Desktop** desde Aplicaciones en macOS
2. **Espera** a que Docker Desktop inicie completamente
3. **Verifica** que el ícono de Docker aparezca en la barra de menú superior
4. **El ícono debe mostrar** "Docker Desktop is running" cuando pases el mouse sobre él

### Paso 2: Verificar que Docker Esté Corriendo

Ejecuta el script de verificación:

```bash
cd docker
./verificar-docker.sh
```

O manualmente:

```bash
docker info
```

Si funciona sin errores, Docker está corriendo correctamente.

### Paso 3: Si Docker Desktop No Inicia

1. **Reinicia Docker Desktop**:
   - Cierra Docker Desktop completamente
   - Vuelve a abrirlo desde Aplicaciones
   - Espera 1-2 minutos a que inicie

2. **Verifica recursos del sistema**:
   - Docker Desktop necesita suficiente memoria y CPU
   - Abre Docker Desktop > Settings > Resources
   - Asegúrate de que tenga al menos 2GB de RAM asignados

3. **Reinicia tu Mac** (si nada más funciona)

4. **Reinstala Docker Desktop** (último recurso):
   - Descarga desde: https://www.docker.com/products/docker-desktop/
   - Desinstala la versión actual
   - Instala la nueva versión

## Verificación Rápida

```bash
# Verificar Docker
docker --version

# Verificar que esté corriendo
docker info

# Verificar Docker Compose
docker compose version
```

Si todos estos comandos funcionan, Docker está listo.

## Después de Verificar

Una vez que Docker Desktop esté corriendo:

```bash
cd docker
docker compose up -d
```

## Problemas Comunes

### "Docker Desktop está abierto pero docker info falla"

**Solución**: Espera 30-60 segundos más. Docker Desktop tarda en iniciar completamente.

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

## Estado del Ícono de Docker

En la barra de menú de macOS, el ícono de Docker puede mostrar:

- 🐳 **Verde**: Docker Desktop está corriendo correctamente
- 🟡 **Amarillo**: Docker Desktop está iniciando
- 🔴 **Rojo**: Docker Desktop tiene problemas

Espera a que esté verde antes de usar Docker.
