# Persistencia de Datos - Solución al Problema de Pérdida de Datos

## Problema

Cuando el backend se reinicia, los datos (especialmente cirugías) se borran. Esto ocurre porque `synchronize: true` en TypeORM puede recrear las tablas si detecta cambios en las entidades, lo que elimina todos los datos.

## Solución Implementada

Se ha cambiado la configuración de la base de datos para **desactivar `synchronize` por defecto** y usar **migraciones** en su lugar. Esto garantiza que los datos persistan entre reinicios.

### Cambios Realizados

1. **`synchronize` desactivado por defecto**: Ya no se recrean las tablas automáticamente
2. **Variable de entorno `DB_SYNCHRONIZE`**: Permite activar `synchronize` solo cuando sea necesario (setup inicial)
3. **Soporte para migraciones**: Las migraciones se pueden ejecutar automáticamente con `DB_MIGRATIONS_RUN=true`

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env` o `.env.local`:

```bash
# Desactivar synchronize (recomendado para evitar pérdida de datos)
DB_SYNCHRONIZE=false

# Ejecutar migraciones automáticamente al iniciar (opcional)
DB_MIGRATIONS_RUN=false
```

### Setup Inicial (Primera Vez)

Si es la primera vez que configuras la base de datos y necesitas crear las tablas:

1. **Opción 1: Usar synchronize temporalmente** (solo para setup inicial):
   ```bash
   # En tu .env
   DB_SYNCHRONIZE=true
   
   # Iniciar el backend (creará las tablas)
   npm run start:dev
   
   # Luego cambiar a false para evitar pérdida de datos
   DB_SYNCHRONIZE=false
   ```

2. **Opción 2: Crear migraciones** (recomendado):
   ```bash
   # Generar migración basada en las entidades
   npm run migration:generate -- src/database/migrations/InitialSchema
   
   # Ejecutar migración
   npm run migration:run
   ```

## Migraciones

Migraciones en `src/database/migrations/` (orden por timestamp):

1. **CreateHCETables**: Crea `patients`, `medical_records`, `allergies`, `medications`, `lab_results`, `images` (módulo HCE). Sin dependencias previas.
2. **CreatePlanningTables**: Crea `operating_rooms`, `surgeries`, `surgical_plannings`, `dicom_images`. Requiere `patients`.
3. **CreateChecklistsTable**: Crea la tabla `checklists` (checklist quirúrgico WHO). Requiere `surgeries`.
4. **CreateFollowupTables**: Tablas `postop_evolutions` y `discharge_plans`. Requiere `surgeries`.
5. **CreateDocumentationsTable**: Tabla `documentations`. Requiere `surgeries`.

Todas las migraciones son **idempotentes** (IF NOT EXISTS / DO EXCEPTION): se pueden ejecutar aunque las tablas o enums ya existan por un uso previo de `DB_SYNCHRONIZE=true`.

### Crear una Nueva Migración

Cuando agregues o modifiques entidades:

```bash
# Generar migración automáticamente
npm run migration:generate -- src/database/migrations/NombreDescriptivo

# Revisar la migración generada en backend/src/database/migrations/
```

### Ejecutar Migraciones

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# O ejecutar automáticamente al iniciar (configurar DB_MIGRATIONS_RUN=true)
```

### Revertir una Migración

```bash
# Revertir la última migración
npm run migration:revert
```

## Datos de prueba (seed)

Para cargar datos de ejemplo en desarrollo (pacientes, quirófanos, cirugías, evolución y plan de alta):

```bash
# Asegúrate de tener las migraciones ejecutadas y la BD levantada
npm run seed
```

El seed es **idempotente**: si ya existen pacientes, no inserta nada (para evitar duplicar).

**Reseed** (borrar datos de prueba y volver a insertar):

```bash
npm run seed -- --force
```

Con `--force` se borran en orden: planes de alta, evoluciones, documentación, checklists, planificaciones, cirugías, quirófanos y pacientes; después se vuelven a insertar los datos de prueba.

## Verificar que los Datos Persisten

1. **Crear algunos datos** (pacientes, cirugías, etc.)
2. **Reiniciar el backend**:
   ```bash
   # Detener el backend (Ctrl+C)
   # Iniciar nuevamente
   npm run start:dev
   ```
3. **Verificar que los datos siguen ahí**:
   - Usar la API o el frontend
   - O consultar directamente la base de datos:
     ```bash
     docker compose -f docker/docker-compose.yml exec postgres psql -U sigq_user -d sigq_db -c "SELECT COUNT(*) FROM surgeries;"
     ```

## Troubleshooting

### Error: "relation does not exist"

Si ves este error, significa que las tablas no existen:

1. **Si es la primera vez**: Activa `DB_SYNCHRONIZE=true` temporalmente para crear las tablas
2. **Si ya tenías datos**: Crea y ejecuta migraciones para recrear las tablas sin perder datos

### Los datos se siguen borrando

1. Verifica que `DB_SYNCHRONIZE=false` en tu `.env`
2. Verifica que el volumen de Docker esté configurado correctamente:
   ```bash
   docker compose -f docker/docker-compose.yml ps
   # Deberías ver sigq-postgres con volumen postgres_data
   ```
3. Verifica que el volumen persista:
   ```bash
   docker volume ls | grep postgres_data
   ```

### Necesito cambiar la estructura de una tabla

1. **Modifica la entidad** en `backend/src/modules/*/entities/*.entity.ts`
2. **Genera una migración**:
   ```bash
   npm run migration:generate -- src/database/migrations/AddNewColumn
   ```
3. **Revisa y ajusta la migración** si es necesario
4. **Ejecuta la migración**:
   ```bash
   npm run migration:run
   ```

## Mejores Prácticas

1. **Nunca uses `synchronize: true` en producción**
2. **Siempre usa migraciones** para cambios de esquema
3. **Haz backups** antes de ejecutar migraciones en producción
4. **Revisa las migraciones generadas** antes de ejecutarlas
5. **Usa versionado de migraciones** para mantener un historial

## Referencias

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [TypeORM Synchronize vs Migrations](https://typeorm.io/connection-options#synchronize)
