# Migraciones de Base de Datos — Frapen Angels

Este directorio contiene las migraciones SQL versionadas para la base de datos PostgreSQL del proyecto Frapen Angels.

## Estructura

Las migraciones se nombran con un número de secuencia (001, 002, 003, etc.) seguido de una descripción clara:

```
001_create_roles_table.sql
002_create_members_table.sql
003_create_admin_users_table.sql
004_seed_initial_roles.sql
```

## Ejecución de migraciones

### Requisitos previos

- PostgreSQL instalado
- Base de datos `frapen_angels` creada
- Credenciales correctas en variables de entorno

### Ejecutar todas las migraciones

```bash
# En el directorio raíz del proyecto:
psql -h localhost -U frapen_user -d frapen_angels -f db/migrations/001_create_roles_table.sql
psql -h localhost -U frapen_user -d frapen_angels -f db/migrations/002_create_members_table.sql
psql -h localhost -U frapen_user -d frapen_angels -f db/migrations/003_create_admin_users_table.sql
psql -h localhost -U frapen_user -d frapen_angels -f db/migrations/004_seed_initial_roles.sql
```

### O ejecutar desde dentro de psql:

```sql
-- Conectarse a la base de datos primero
psql -h localhost -U frapen_user -d frapen_angels

-- Luego ejecutar cada migración:
\i db/migrations/001_create_roles_table.sql
\i db/migrations/002_create_members_table.sql
\i db/migrations/003_create_admin_users_table.sql
\i db/migrations/004_seed_initial_roles.sql
```

## Notas importantes

1. **Idempotencia**: Las migraciones usan `CREATE TABLE IF NOT EXISTS` para evitar errores si se ejecutan varias veces.

2. **Orden de ejecución**: Las migraciones DEBEN ejecutarse en orden numérico, ya que hay dependencias (foreign keys) entre tablas.

3. **Reversión**: Para revertir una migración en desarrollo:
   - `DROP TABLE admin_users CASCADE;` (003)
   - `DROP TABLE members CASCADE;` (002)
   - `DROP TABLE roles CASCADE;` (001)

4. **Entorno de producción**: Se recomienda usar una herramienta como Flyway o Liquibase para gestionar migraciones automáticamente.

## Validación de integridad

Después de ejecutar las migraciones, valida que todo está correctamente creado:

```sql
-- Ver todas las tablas creadas
\dt

-- Ver estructura de la tabla roles
\d roles

-- Ver estructura de la tabla members
\d members

-- Ver estructura de la tabla admin_users
\d admin_users

-- Ver roles creados
SELECT * FROM roles;
```

## Entidad-Relación

```
roles
├── 1:N → members
└── 1:N → admin_users

members
├── N:1 → roles
└── 1:N → admin_users

admin_users
├── N:1 → roles
└── N:1 → members
```

## Verificación final

Para verificar que las migraciones se han completado correctamente:

```sql
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deberías ver:
- `admin_users`
- `members`
- `roles`
