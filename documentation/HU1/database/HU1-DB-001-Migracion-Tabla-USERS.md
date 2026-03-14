# HU1-DB-001: Migración - Crear Tabla USERS

## Información General
- **ID**: HU1-DB-001
- **Historia de Usuario**: HU1 - Registro de Paciente
- **Tipo**: Base de Datos
- **Prioridad**: Alta
- **Estimación**: 3 horas (0.5 story points)
- **Dependencias**: Ninguna

## Descripción
Crear la migración de TypeORM para la tabla USERS que almacenará la información de todos los usuarios del sistema (pacientes, médicos y administradores).

## Criterios de Aceptación

### CA1: Estructura de Tabla
- [ ] Tabla `USERS` creada con las siguientes columnas:
  - `id` (UUID, PRIMARY KEY)
  - `email` (VARCHAR, UNIQUE, NOT NULL)
  - `password` (VARCHAR, NOT NULL) - almacenará hash bcrypt
  - `firstName` (VARCHAR, NOT NULL)
  - `lastName` (VARCHAR, NOT NULL)
  - `phone` (VARCHAR, NULLABLE)
  - `role` (ENUM: 'patient', 'doctor', 'admin', NOT NULL)
  - `emailVerified` (BOOLEAN, DEFAULT FALSE)
  - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### CA2: Índices
- [ ] Índice único en `email`
- [ ] Índice en `role` para búsquedas por rol

### CA3: Constraints
- [ ] Constraint UNIQUE en `email`
- [ ] Constraint CHECK en `role` para valores válidos
- [ ] Constraint NOT NULL en campos obligatorios

### CA4: Script de Rollback
- [ ] Script de rollback que elimina la tabla USERS y todos sus índices

## Pasos Técnicos Detallados

### 1. Crear Migración TypeORM
**Ubicación**: `backend/src/migrations/1234567890-CreateUsersTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableColumn } from 'typeorm';

export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'USERS',
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
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['patient', 'doctor', 'admin'],
            default: "'patient'",
            isNullable: false,
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índice único en email
    await queryRunner.createIndex(
      'USERS',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Crear índice en role para búsquedas
    await queryRunner.createIndex(
      'USERS',
      new TableIndex({
        name: 'IDX_USERS_ROLE',
        columnNames: ['role'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    await queryRunner.dropIndex('USERS', 'IDX_USERS_ROLE');
    await queryRunner.dropIndex('USERS', 'IDX_USERS_EMAIL');

    // Eliminar tabla
    await queryRunner.dropTable('USERS');
  }
}
```

### 2. Crear Script SQL de Rollback Manual
**Ubicación**: `backend/src/migrations/rollback/1234567890-CreateUsersTable.rollback.sql`

```sql
-- Rollback para migración CreateUsersTable
-- Ejecutar solo si es necesario revertir manualmente

-- Eliminar índices
DROP INDEX IF EXISTS IDX_USERS_ROLE ON USERS;
DROP INDEX IF EXISTS IDX_USERS_EMAIL ON USERS;

-- Eliminar tabla
DROP TABLE IF EXISTS USERS;
```

### 3. Actualizar Entidad User
**Ubicación**: `backend/src/entities/user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('USERS')
@Index('IDX_USERS_EMAIL', ['email'], { unique: true })
@Index('IDX_USERS_ROLE', ['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  })
  role: string;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Ejecutar Migración

```bash
# Ejecutar migración
npm run migration:run

# Verificar que la tabla se creó correctamente
mysql -u citaya -p citaya_db -e "DESCRIBE USERS;"

# Verificar índices
mysql -u citaya -p citaya_db -e "SHOW INDEXES FROM USERS;"
```

### 5. Verificación Post-Migración

```sql
-- Verificar estructura de tabla
DESCRIBE USERS;

-- Verificar índices
SHOW INDEXES FROM USERS;

-- Verificar constraint de email único
INSERT INTO USERS (email, password, firstName, lastName, role) 
VALUES ('test@example.com', 'hash123', 'Test', 'User', 'patient');

-- Intentar insertar email duplicado (debe fallar)
INSERT INTO USERS (email, password, firstName, lastName, role) 
VALUES ('test@example.com', 'hash456', 'Test2', 'User2', 'patient');
-- Error esperado: Duplicate entry 'test@example.com' for key 'IDX_USERS_EMAIL'
```

## Archivos a Crear/Modificar

1. `backend/src/migrations/1234567890-CreateUsersTable.ts` - Migración TypeORM
2. `backend/src/migrations/rollback/1234567890-CreateUsersTable.rollback.sql` - Script SQL de rollback
3. `backend/src/entities/user.entity.ts` - Entidad User actualizada

## Comandos de Migración

```bash
# Generar migración (si se usa CLI de TypeORM)
npm run migration:generate -- -n CreateUsersTable

# Ejecutar migración
npm run migration:run

# Revertir migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show
```

## Testing

Ver ticket HU1-TEST-001 para detalles de testing de migraciones.

## Notas Adicionales

- El tipo UUID se almacena como VARCHAR(36) en MySQL/MariaDB
- El enum se crea como tipo ENUM nativo de MySQL
- Los timestamps se manejan automáticamente con CURRENT_TIMESTAMP
- Considerar usar DATETIME en lugar de TIMESTAMP si se necesita rango más amplio
- La contraseña se almacena como hash bcrypt (máximo 60 caracteres, pero usar VARCHAR(255) para seguridad)

## Referencias

- [Documentación de TypeORM Migrations](https://typeorm.io/migrations)
- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)
- [MySQL Indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)
