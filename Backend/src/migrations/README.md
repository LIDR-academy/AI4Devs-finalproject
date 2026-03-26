# Migraciones de Base de Datos

Este directorio contiene las migraciones de TypeORM para gestionar el esquema de la base de datos.

## ¿Qué son las migraciones?

Las migraciones son archivos que describen cambios en el esquema de la base de datos de forma versionada y reversible. Permiten:

- Controlar cambios en el esquema de forma incremental
- Aplicar cambios de forma consistente en diferentes entornos
- Revertir cambios si es necesario
- Colaborar en equipo con cambios de esquema sincronizados

## Convención de Nombres

Las migraciones siguen el formato: `{timestamp}-{Descripcion}.ts`

Ejemplo:
- `1735689600000-CreateTripsTable.ts`
- `1735689601000-CreateTripParticipantsTable.ts`

El timestamp asegura que las migraciones se ejecuten en el orden correcto.

## Configuración

Las migraciones están configuradas en `src/config/database.config.ts`:

```typescript
migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
migrationsRun: false, // Set to true to auto-run migrations on startup
migrationsTableName: 'migrations',
```

## Ejecutar Migraciones

### Opción 1: Usando npm scripts (Recomendado)

El proyecto incluye scripts npm para facilitar la ejecución de migraciones:

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración ejecutada
npm run migration:revert

# Ver el estado de las migraciones
npm run migration:show

# Generar una nueva migración (después de modificar entidades)
npm run migration:generate -- src/migrations/NombreDeLaMigracion
```

### Opción 2: Usando TypeORM CLI directamente

Si prefieres usar TypeORM CLI directamente, primero instálalo globalmente:

```bash
npm install -g typeorm
```

Luego usa el archivo `data-source.ts` en la raíz del proyecto:

```bash
# Ejecutar todas las migraciones pendientes
typeorm migration:run -d data-source.ts

# Revertir la última migración ejecutada
typeorm migration:revert -d data-source.ts

# Ver el estado de las migraciones
typeorm migration:show -d data-source.ts

# Generar una nueva migración
typeorm migration:generate -d data-source.ts src/migrations/NombreDeLaMigracion
```

**Nota importante:** El archivo `data-source.ts` en la raíz del proyecto es necesario para que TypeORM CLI funcione correctamente. Este archivo es diferente de la configuración de NestJS (`src/config/database.config.ts`) porque TypeORM CLI requiere una instancia de `DataSource` directamente, no la configuración de NestJS.

### Opción 3: Auto-ejecutar en inicio (Solo desarrollo)

Puedes configurar `migrationsRun: true` en `database.config.ts` para que las migraciones se ejecuten automáticamente al iniciar la aplicación. **⚠️ No recomendado para producción.**

## Crear una Nueva Migración

### Paso 1: Generar el archivo de migración

**Opción A: Usando npm script (Recomendado)**

```bash
npm run migration:generate -- src/migrations/NombreDeLaMigracion
```

**Opción B: Usando TypeORM CLI directamente**

```bash
typeorm migration:generate -d data-source.ts src/migrations/NombreDeLaMigracion
```

**Opción C: Crear manualmente**

Si prefieres crear la migración manualmente, sigue el formato:
```
{timestamp}-NombreDeLaMigracion.ts
```

Ejemplo: `1735689602000-AddDescriptionToTrips.ts`

### Paso 2: Implementar los métodos `up()` y `down()`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NombreDeLaMigracion1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Código para aplicar la migración
    await queryRunner.query(`ALTER TABLE trips ADD COLUMN description TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Código para revertir la migración
    await queryRunner.query(`ALTER TABLE trips DROP COLUMN description`);
  }
}
```

### Paso 3: Ejecutar la migración

```bash
# Usando npm script (recomendado)
npm run migration:run

# O usando TypeORM CLI directamente
typeorm migration:run -d data-source.ts
```

## Mejores Prácticas

1. **Siempre incluye métodos `up()` y `down()`**: Permite revertir cambios si es necesario.

2. **Usa transacciones cuando sea posible**: TypeORM ejecuta cada migración en una transacción automáticamente.

3. **No modifiques migraciones ya ejecutadas**: Si necesitas cambiar una migración, crea una nueva.

4. **Prueba las migraciones en desarrollo primero**: Verifica que funcionen correctamente antes de aplicarlas en producción.

5. **Documenta cambios complejos**: Agrega comentarios explicando cambios no obvios en el esquema.

6. **Mantén las migraciones pequeñas**: Es mejor tener varias migraciones pequeñas que una grande.

7. **Revisa el orden de ejecución**: Asegúrate de que las migraciones se ejecuten en el orden correcto (usando timestamps).

## Migraciones Existentes

### `1735689600000-CreateTripsTable.ts`
Crea la tabla `trips` con los campos:
- `id` (UUID, primary key)
- `name` (varchar)
- `currency` (varchar, default: 'COP')
- `status` (varchar, default: 'ACTIVE')
- `code` (varchar, unique, indexed)
- `created_at`, `updated_at`, `deleted_at` (timestamps)

### `1735689601000-CreateTripParticipantsTable.ts`
Crea la tabla `trip_participants` con los campos:
- `id` (UUID, primary key)
- `trip_id` (UUID, foreign key to trips)
- `user_id` (UUID, foreign key to users)
- `role` (varchar, default: 'MEMBER')
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- Unique constraint en `(trip_id, user_id)`
- Foreign keys con CASCADE delete

## Solución de Problemas

### Error: "Migration already executed"
Si una migración ya fue ejecutada y necesitas modificarla, debes:
1. Revertir la migración: `typeorm migration:revert`
2. Modificar el archivo de migración
3. Ejecutarla nuevamente: `typeorm migration:run`

### Error: "Cannot find module"
Asegúrate de que:
- El archivo `data-source.ts` existe en la raíz del proyecto Backend
- Las rutas en `data-source.ts` sean correctas
- Los archivos de migración estén en el directorio `src/migrations/`
- Las variables de entorno estén configuradas correctamente (`.env` o `.env.local`)
- El proyecto tenga las dependencias instaladas (`npm install`)

### Error: "Migration failed"
Revisa los logs para identificar el problema. Puedes revertir la migración fallida con `typeorm migration:revert` y corregir el código antes de intentar nuevamente.

## Referencias

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
