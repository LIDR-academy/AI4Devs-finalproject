# Guía para Consultar la Base de Datos

## Opción 1: Usar psql (Línea de Comandos)

### Si usas Docker:
```bash
# Conectarte al contenedor de PostgreSQL
docker exec -it travelsplit-postgres psql -U postgres -d travelsplit
```

### Si tienes PostgreSQL instalado localmente:
```bash
# Configura las variables de entorno desde tu archivo .env
export DB_PASSWORD=tu_contraseña_desde_env
psql -h localhost -U postgres -d travelsplit

# O usa los scripts proporcionados (requieren DB_PASSWORD configurada)
./Backend/scripts/consultar-bd.sh
```

### Comandos SQL útiles una vez conectado:

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d users

-- Consultar todos los usuarios
SELECT * FROM users;

-- Contar registros en una tabla
SELECT COUNT(*) FROM users;

-- Ver usuarios con sus timestamps
SELECT id, nombre, email, created_at, updated_at, deleted_at FROM users;

-- Ver solo usuarios activos (sin soft delete)
SELECT * FROM users WHERE deleted_at IS NULL;

-- Ver usuarios eliminados (soft delete)
SELECT * FROM users WHERE deleted_at IS NOT NULL;

-- Salir de psql
\q
```

## Opción 2: Habilitar Logging SQL en el Backend

En tu archivo `.env` del backend:
```env
DB_LOGGING=true
```

Esto mostrará todas las consultas SQL en la consola del servidor.

## Opción 3: Usar un Cliente Gráfico

### DBeaver (Gratuito y multiplataforma)
1. Descarga DBeaver: https://dbeaver.io/
2. Crea una nueva conexión PostgreSQL:
   - Host: `localhost`
   - Port: `5432`
   - Database: `travelsplit`
   - Username: `postgres`
   - Password: (configura desde tu archivo `.env` o variables de entorno)

### pgAdmin (Oficial de PostgreSQL)
1. Descarga pgAdmin: https://www.pgadmin.org/
2. Crea un nuevo servidor con las credenciales de tu archivo `.env`

### TablePlus (Windows/Mac, con versión gratuita)
1. Descarga TablePlus: https://tableplus.com/
2. Crea conexión PostgreSQL con las credenciales de tu archivo `.env`

## Opción 4: Usar los Endpoints de la API

Si tienes endpoints configurados, puedes usar:

```bash
# Ver todos los usuarios (si existe el endpoint)
curl http://localhost:3000/api/users

# O usar Postman/Thunder Client en VS Code
```

## Opción 5: Crear un Endpoint de Debug Temporal

Puedes crear un endpoint temporal en el backend para consultar datos:

```typescript
// En users.controller.ts (solo para desarrollo)
@Get('debug/all')
async getAllUsersDebug() {
  return this.usersService.findAll();
}
```

## Estructura de la Tabla Users

La tabla `users` tiene las siguientes columnas:
- `id` (UUID) - Identificador único
- `nombre` (VARCHAR) - Nombre del usuario
- `email` (VARCHAR) - Email único
- `password_hash` (VARCHAR) - Hash de la contraseña
- `created_at` (TIMESTAMP) - Fecha de creación
- `updated_at` (TIMESTAMP) - Fecha de última actualización
- `deleted_at` (TIMESTAMP, nullable) - Fecha de eliminación (soft delete)



