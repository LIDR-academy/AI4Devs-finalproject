# Verificar y Crear Tablas en PostgreSQL

## Problema
Error: `relation "patients" does not exist`

Esto significa que las tablas no se han creado en la base de datos.

## Solución

### Opción 1: Verificar que TypeORM Cree las Tablas Automáticamente

1. **Verifica que PostgreSQL esté corriendo**:
   ```bash
   cd docker
   docker compose ps
   ```
   
   Deberías ver `sigq-postgres` con estado "Up".

2. **Verifica que el backend se conecte correctamente**:
   - En los logs del backend, deberías ver mensajes de conexión a PostgreSQL
   - Si hay errores de conexión, verifica las credenciales en `.env`

3. **Verifica que `synchronize: true` esté activo**:
   - En `database.config.ts`, `synchronize` debe ser `true` cuando `NODE_ENV=development`
   - Si no está activo, TypeORM no creará las tablas automáticamente

4. **Reinicia el backend**:
   ```bash
   cd backend
   npm run start:dev
   ```
   
   TypeORM debería crear las tablas automáticamente al iniciar.

### Opción 2: Crear las Tablas Manualmente (Si synchronize no funciona)

Si TypeORM no crea las tablas automáticamente, puedes crearlas manualmente:

1. **Conectarte a PostgreSQL**:
   ```bash
   docker compose -f docker/docker-compose.yml exec postgres psql -U sigq_user -d sigq_db
   ```

2. **Verificar tablas existentes**:
   ```sql
   \dt
   ```

3. **Si no hay tablas, TypeORM debería crearlas al reiniciar el backend**

### Opción 3: Forzar Sincronización

Si necesitas forzar la creación de tablas:

1. **Detén el backend**

2. **Elimina y recrea la base de datos** (¡CUIDADO: Esto borra todos los datos!):
   ```bash
   docker compose -f docker/docker-compose.yml exec postgres psql -U sigq_user -d postgres -c "DROP DATABASE IF EXISTS sigq_db;"
   docker compose -f docker/docker-compose.yml exec postgres psql -U sigq_user -d postgres -c "CREATE DATABASE sigq_db;"
   ```

3. **Reinicia el backend**:
   ```bash
   cd backend
   npm run start:dev
   ```
   
   TypeORM debería crear todas las tablas automáticamente.

## Verificar que las Tablas se Crearon

Después de reiniciar el backend, verifica que las tablas existan:

```bash
docker compose -f docker/docker-compose.yml exec postgres psql -U sigq_user -d sigq_db -c "\dt"
```

Deberías ver tablas como:
- `patients`
- `medical_records`
- `allergies`
- `medications`
- `lab_results`
- `images`

## Logs Esperados

Cuando TypeORM crea las tablas, deberías ver en los logs del backend:

```
[TypeORM] query: CREATE TABLE "patients" ...
[TypeORM] query: CREATE TABLE "medical_records" ...
...
```

Si no ves estos mensajes, TypeORM no está creando las tablas.

## Problemas Comunes

### 1. `synchronize: false`
- **Causa**: `NODE_ENV` está configurado como `production` o `synchronize` está desactivado
- **Solución**: Asegúrate de que `NODE_ENV=development` o no esté definido en `.env`

### 2. Error de conexión a PostgreSQL
- **Causa**: PostgreSQL no está corriendo o las credenciales son incorrectas
- **Solución**: Verifica que PostgreSQL esté corriendo y que las credenciales en `.env` coincidan con `docker-compose.yml`

### 3. Permisos insuficientes
- **Causa**: El usuario de PostgreSQL no tiene permisos para crear tablas
- **Solución**: Verifica que el usuario `sigq_user` tenga permisos adecuados
