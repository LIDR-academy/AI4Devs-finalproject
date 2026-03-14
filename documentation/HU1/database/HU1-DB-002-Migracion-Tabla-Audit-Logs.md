# HU1-DB-002: Migración - Crear Tabla audit_logs

## Información General
- **ID**: HU1-DB-002
- **Historia de Usuario**: HU1 - Registro de Paciente
- **Tipo**: Base de Datos
- **Prioridad**: Alta
- **Estimación**: 2 horas (0.5 story points)
- **Dependencias**: HU1-DB-001 (Tabla USERS debe existir para referencia)

## Descripción
Crear la migración de TypeORM para la tabla audit_logs que almacenará todos los eventos de auditoría del sistema, incluyendo registros de usuarios, cambios de estado, accesos a datos sensibles, etc.

## Criterios de Aceptación

### CA1: Estructura de Tabla
- [ ] Tabla `audit_logs` creada con las siguientes columnas:
  - `id` (UUID, PRIMARY KEY)
  - `action` (VARCHAR, NOT NULL) - tipo de acción realizada
  - `entityType` (VARCHAR, NOT NULL) - tipo de entidad afectada
  - `entityId` (VARCHAR, NOT NULL) - ID de la entidad afectada
  - `userId` (VARCHAR, NULLABLE) - ID del usuario que realizó la acción
  - `ipAddress` (VARCHAR, NOT NULL) - IP del usuario
  - `timestamp` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### CA2: Índices
- [ ] Índice en `userId` para búsquedas por usuario
- [ ] Índice en `entityType` y `entityId` para búsquedas por entidad
- [ ] Índice en `timestamp` para búsquedas por fecha
- [ ] Índice compuesto en `action` y `timestamp` para análisis

### CA3: Constraints
- [ ] Constraint NOT NULL en campos obligatorios
- [ ] Foreign key opcional a USERS (si se requiere integridad referencial)

### CA4: Script de Rollback
- [ ] Script de rollback que elimina la tabla audit_logs y todos sus índices

## Pasos Técnicos Detallados

### 1. Crear Migración TypeORM
**Ubicación**: `backend/src/migrations/1234567891-CreateAuditLogsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuditLogsTable1234567891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Tipo de acción: register, login, update, delete, etc.',
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Tipo de entidad: user, appointment, doctor, etc.',
          },
          {
            name: 'entityId',
            type: 'varchar',
            length: '36',
            isNullable: false,
            comment: 'ID de la entidad afectada',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'ID del usuario que realizó la acción',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: false,
            comment: 'IPv4 o IPv6',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ENTITY',
        columnNames: ['entityType', 'entityId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_TIMESTAMP',
        columnNames: ['timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ACTION_TIMESTAMP',
        columnNames: ['action', 'timestamp'],
      }),
    );

    // Foreign key opcional a USERS (si se requiere integridad referencial)
    // Nota: Se puede omitir si se prefiere mantener flexibilidad
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Si se elimina usuario, mantener log pero sin userId
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    const table = await queryRunner.getTable('audit_logs');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('audit_logs', foreignKey);
    }

    // Eliminar índices
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ACTION_TIMESTAMP');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_TIMESTAMP');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ENTITY');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_USER_ID');

    // Eliminar tabla
    await queryRunner.dropTable('audit_logs');
  }
}
```

### 2. Crear Script SQL de Rollback Manual
**Ubicación**: `backend/src/migrations/rollback/1234567891-CreateAuditLogsTable.rollback.sql`

```sql
-- Rollback para migración CreateAuditLogsTable
-- Ejecutar solo si es necesario revertir manualmente

-- Eliminar foreign key
ALTER TABLE audit_logs DROP FOREIGN KEY IF EXISTS FK_audit_logs_userId;

-- Eliminar índices
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_ACTION_TIMESTAMP ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_TIMESTAMP ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_ENTITY ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_USER_ID ON audit_logs;

-- Eliminar tabla
DROP TABLE IF EXISTS audit_logs;
```

### 3. Actualizar Entidad AuditLog
**Ubicación**: `backend/src/entities/audit-log.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index('IDX_AUDIT_LOGS_USER_ID', ['userId'])
@Index('IDX_AUDIT_LOGS_ENTITY', ['entityType', 'entityId'])
@Index('IDX_AUDIT_LOGS_TIMESTAMP', ['timestamp'])
@Index('IDX_AUDIT_LOGS_ACTION_TIMESTAMP', ['action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 50 })
  entityType: string;

  @Column({ length: 36 })
  entityId: string;

  @Column({ length: 36, nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ length: 45 })
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;
}
```

### 4. Ejecutar Migración

```bash
# Ejecutar migración
npm run migration:run

# Verificar que la tabla se creó correctamente
mysql -u citaya -p citaya_db -e "DESCRIBE audit_logs;"

# Verificar índices
mysql -u citaya -p citaya_db -e "SHOW INDEXES FROM audit_logs;"
```

### 5. Verificación Post-Migración

```sql
-- Verificar estructura de tabla
DESCRIBE audit_logs;

-- Verificar índices
SHOW INDEXES FROM audit_logs;

-- Insertar registro de prueba
INSERT INTO audit_logs (action, entityType, entityId, userId, ipAddress)
VALUES ('register', 'user', 'test-user-id', 'test-user-id', '192.168.1.1');

-- Verificar que se insertó correctamente
SELECT * FROM audit_logs WHERE action = 'register';
```

## Archivos a Crear/Modificar

1. `backend/src/migrations/1234567891-CreateAuditLogsTable.ts` - Migración TypeORM
2. `backend/src/migrations/rollback/1234567891-CreateAuditLogsTable.rollback.sql` - Script SQL de rollback
3. `backend/src/entities/audit-log.entity.ts` - Entidad AuditLog actualizada

## Comandos de Migración

```bash
# Generar migración
npm run migration:generate -- -n CreateAuditLogsTable

# Ejecutar migración
npm run migration:run

# Revertir migración
npm run migration:revert
```

## Consideraciones de Performance

- La tabla `audit_logs` puede crecer rápidamente, considerar:
  - Particionamiento por fecha (mensual o trimestral)
  - Política de retención (ej: eliminar logs mayores a 1 año)
  - Archivo de logs antiguos a almacenamiento frío
- Los índices son críticos para consultas de auditoría eficientes
- Considerar usar tabla separada para logs de alta frecuencia (ej: login)

## Testing

Ver ticket HU1-TEST-001 para detalles de testing de migraciones.

## Notas Adicionales

- El campo `ipAddress` usa VARCHAR(45) para soportar tanto IPv4 como IPv6
- El campo `userId` es nullable porque algunas acciones pueden no tener usuario asociado (ej: intentos de login fallidos)
- La foreign key a USERS usa `onDelete: SET NULL` para mantener integridad histórica
- Considerar agregar campo `metadata` (JSON) para información adicional flexible en el futuro

## Referencias

- [Documentación de TypeORM Migrations](https://typeorm.io/migrations)
- [MySQL Indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)
- [MySQL Foreign Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html)
