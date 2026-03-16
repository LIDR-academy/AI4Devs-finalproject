import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migración para crear el esquema completo de autenticación
 * Incluye: perfiles, usuarios, sesiones, horarios, auditoría, etc.
 */
export class CreateAuthSchema1734892800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar extensión UUID si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 2. Tabla rrfdiasm - Catálogo de días de semana
    await queryRunner.createTable(
      new Table({
        name: 'rrfdiasm',
        columns: [
          {
            name: 'diasm_cod_diasm',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'diasm_nom_diasm',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'diasm_abr_diasm',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'diasm_num_orden',
            type: 'integer',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Insertar datos iniciales de días de semana
    await queryRunner.query(`
      INSERT INTO rrfdiasm (diasm_cod_diasm, diasm_nom_diasm, diasm_abr_diasm, diasm_num_orden) VALUES
        (1, 'Lunes', 'LUN', 1),
        (2, 'Martes', 'MAR', 2),
        (3, 'Miércoles', 'MIE', 3),
        (4, 'Jueves', 'JUE', 4),
        (5, 'Viernes', 'VIE', 5),
        (6, 'Sábado', 'SAB', 6),
        (7, 'Domingo', 'DOM', 7);
    `);

    // 3. Tabla rrfperfi - Perfiles de usuario
    await queryRunner.createTable(
      new Table({
        name: 'rrfperfi',
        columns: [
          {
            name: 'perfi_cod_perfi',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'perfi_nom_perfi',
            type: 'varchar',
            length: '60',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'perfi_des_perfi',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          // JWT Token Config
          {
            name: 'perfi_min_acctk',
            type: 'integer',
            default: 15,
            comment: 'Minutos de expiración del access token',
          },
          {
            name: 'perfi_dia_rfrtk',
            type: 'integer',
            default: 7,
            comment: 'Días de expiración del refresh token',
          },
          // Password Policy
          {
            name: 'perfi_min_lngpw',
            type: 'integer',
            default: 8,
            comment: 'Longitud mínima de contraseña',
          },
          {
            name: 'perfi_max_lngpw',
            type: 'integer',
            default: 128,
            comment: 'Longitud máxima de contraseña',
          },
          {
            name: 'perfi_ctr_mayus',
            type: 'boolean',
            default: true,
            comment: 'Requiere mayúscula',
          },
          {
            name: 'perfi_ctr_minus',
            type: 'boolean',
            default: true,
            comment: 'Requiere minúscula',
          },
          {
            name: 'perfi_ctr_numer',
            type: 'boolean',
            default: true,
            comment: 'Requiere número',
          },
          {
            name: 'perfi_ctr_espec',
            type: 'boolean',
            default: true,
            comment: 'Requiere carácter especial',
          },
          {
            name: 'perfi_dia_vigpw',
            type: 'integer',
            default: 90,
            comment: 'Días de vigencia de contraseña',
          },
          {
            name: 'perfi_num_hispw',
            type: 'integer',
            default: 5,
            comment: 'Cantidad de contraseñas en historial',
          },
          // Lockout Policy
          {
            name: 'perfi_num_maxin',
            type: 'integer',
            default: 5,
            comment: 'Máximo intentos fallidos',
          },
          {
            name: 'perfi_min_bloqu',
            type: 'integer',
            default: 30,
            comment: 'Minutos de bloqueo (0 = permanente)',
          },
          {
            name: 'perfi_min_venta',
            type: 'integer',
            default: 15,
            comment: 'Ventana de minutos para contar intentos',
          },
          // Session Policy
          {
            name: 'perfi_ctr_unise',
            type: 'boolean',
            default: true,
            comment: 'Sesión única',
          },
          {
            name: 'perfi_min_timeo',
            type: 'integer',
            default: 30,
            comment: 'Timeout de sesión en minutos',
          },
          {
            name: 'perfi_ctr_mfare',
            type: 'boolean',
            default: false,
            comment: 'Requiere MFA',
          },
          // Status
          {
            name: 'perfi_ctr_activ',
            type: 'boolean',
            default: true,
          },
          {
            name: 'perfi_ctr_defec',
            type: 'boolean',
            default: false,
          },
          {
            name: 'perfi_fec_creac',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'perfi_fec_modif',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true
    );

    // Índice único en nombre de perfil
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_perfi_nom_perfi ON rrfperfi(perfi_nom_perfi);
    `);

    // 4. Tabla rrfusuar - Usuarios
    await queryRunner.createTable(
      new Table({
        name: 'rrfusuar',
        columns: [
          {
            name: 'usuar_cod_usuar',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'usuar_uuid_usuar',
            type: 'uuid',
            default: 'uuid_generate_v4()',
            isUnique: true,
          },
          {
            name: 'usuar_nom_usuar',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
            comment: 'Username',
          },
          {
            name: 'usuar_des_usuar',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Nombre completo',
          },
          {
            name: 'usuar_dir_email',
            type: 'varchar',
            length: '150',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'usuar_pwd_usuar',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Hash de contraseña (bcrypt)',
          },
          // Relations
          {
            name: 'usuar_cod_empre',
            type: 'integer',
            isNullable: false,
            comment: 'FK a empresa',
          },
          {
            name: 'usuar_cod_ofici',
            type: 'integer',
            isNullable: false,
            comment: 'FK a oficina',
          },
          {
            name: 'usuar_cod_perfi',
            type: 'integer',
            isNullable: false,
            comment: 'FK a perfil',
          },
          {
            name: 'usuar_cod_emple',
            type: 'integer',
            isNullable: true,
            comment: 'FK a empleado (nullable)',
          },
          // User type
          {
            name: 'usuar_tip_usuar',
            type: 'varchar',
            length: '20',
            default: "'EMPLEADO'",
            comment: 'EMPLEADO|EXTERNO|SISTEMA',
          },
          // Special controls
          {
            name: 'usuar_ctr_admin',
            type: 'boolean',
            default: false,
          },
          {
            name: 'usuar_ctr_globa',
            type: 'boolean',
            default: false,
            comment: 'Acceso global a oficinas',
          },
          // Password control
          {
            name: 'usuar_fec_ultpw',
            type: 'timestamp',
            default: 'NOW()',
            comment: 'Fecha último cambio de contraseña',
          },
          {
            name: 'usuar_ctr_frzpw',
            type: 'boolean',
            default: false,
            comment: 'Forzar cambio de contraseña',
          },
          {
            name: 'usuar_ctr_nexpw',
            type: 'boolean',
            default: false,
            comment: 'Contraseña nunca expira',
          },
          // Access control
          {
            name: 'usuar_num_intfa',
            type: 'integer',
            default: 0,
            comment: 'Intentos fallidos',
          },
          {
            name: 'usuar_fec_prifa',
            type: 'timestamp',
            isNullable: true,
            comment: 'Fecha primer intento fallido',
          },
          {
            name: 'usuar_fec_bloqu',
            type: 'timestamp',
            isNullable: true,
            comment: 'Bloqueado hasta',
          },
          {
            name: 'usuar_mot_bloqu',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Motivo de bloqueo',
          },
          // Activity
          {
            name: 'usuar_fec_ultin',
            type: 'timestamp',
            isNullable: true,
            comment: 'Fecha último login',
          },
          {
            name: 'usuar_dir_ultip',
            type: 'inet',
            isNullable: true,
            comment: 'IP último login',
          },
          // MFA
          {
            name: 'usuar_ctr_mfaac',
            type: 'boolean',
            default: false,
            comment: 'MFA activado',
          },
          {
            name: 'usuar_sec_mfatk',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'TOTP secret',
          },
          // Status
          {
            name: 'usuar_ctr_activ',
            type: 'boolean',
            default: true,
          },
          {
            name: 'usuar_ctr_siste',
            type: 'boolean',
            default: false,
            comment: 'Usuario sistema (no eliminable)',
          },
          {
            name: 'usuar_fec_elimi',
            type: 'timestamp',
            isNullable: true,
            comment: 'Soft delete',
          },
        ],
      }),
      true
    );

    // Índices para rrfusuar
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuar_nom_usuar ON rrfusuar(usuar_nom_usuar);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuar_uuid_usuar ON rrfusuar(usuar_uuid_usuar);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuar_email ON rrfusuar(usuar_dir_email) WHERE usuar_dir_email IS NOT NULL;
    `);

    // Foreign Key a perfil
    await queryRunner.createForeignKey(
      'rrfusuar',
      new TableForeignKey({
        columnNames: ['usuar_cod_perfi'],
        referencedColumnNames: ['perfi_cod_perfi'],
        referencedTableName: 'rrfperfi',
        onDelete: 'RESTRICT',
      })
    );

    // 5. Tabla rrfsesio - Sesiones
    await queryRunner.createTable(
      new Table({
        name: 'rrfsesio',
        columns: [
          {
            name: 'sesio_cod_sesio',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'sesio_uuid_sesio',
            type: 'uuid',
            default: 'uuid_generate_v4()',
            isUnique: true,
          },
          {
            name: 'sesio_cod_usuar',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'sesio_hsh_refto',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Hash del refresh token',
          },
          {
            name: 'sesio_fam_refto',
            type: 'uuid',
            default: 'uuid_generate_v4()',
            comment: 'Token family para detectar reuse',
          },
          {
            name: 'sesio_dir_iplog',
            type: 'inet',
            isNullable: false,
            comment: 'IP de login',
          },
          {
            name: 'sesio_des_agent',
            type: 'text',
            isNullable: true,
            comment: 'User Agent',
          },
          {
            name: 'sesio_hsh_devic',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Device fingerprint',
          },
          {
            name: 'sesio_nom_devic',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Nombre del dispositivo',
          },
          {
            name: 'sesio_ctr_activ',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sesio_fec_creac',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'sesio_fec_expir',
            type: 'timestamp',
            isNullable: false,
            comment: 'Fecha expiración',
          },
          {
            name: 'sesio_fec_ultac',
            type: 'timestamp',
            default: 'NOW()',
            comment: 'Fecha última actividad',
          },
          {
            name: 'sesio_fec_revoc',
            type: 'timestamp',
            isNullable: true,
            comment: 'Fecha revocación',
          },
          {
            name: 'sesio_mot_revoc',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Motivo revocación: LOGOUT|NEW_SESSION|ADMIN|EXPIRED|TOKEN_REUSE|PASSWORD_CHANGE',
          },
        ],
      }),
      true
    );

    // Índices para rrfsesio
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sesio_uuid_sesio ON rrfsesio(sesio_uuid_sesio);
      CREATE INDEX IF NOT EXISTS idx_sesio_cod_usuar ON rrfsesio(sesio_cod_usuar);
      CREATE INDEX IF NOT EXISTS idx_sesio_hsh_refto ON rrfsesio(sesio_hsh_refto);
    `);

    // Foreign Key a usuario
    await queryRunner.createForeignKey(
      'rrfsesio',
      new TableForeignKey({
        columnNames: ['sesio_cod_usuar'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'CASCADE',
      })
    );

    // 6. Tabla rrfjorus - Horarios de usuario
    await queryRunner.createTable(
      new Table({
        name: 'rrfjorus',
        columns: [
          {
            name: 'jorus_cod_jorus',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'jorus_cod_usuar',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'jorus_cod_diasm',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'jorus_hor_inici',
            type: 'time',
            isNullable: false,
            comment: 'Hora inicio',
          },
          {
            name: 'jorus_hor_final',
            type: 'time',
            isNullable: false,
            comment: 'Hora fin',
          },
          {
            name: 'jorus_ctr_activ',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true
    );

    // Índice único compuesto para horarios
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_jorus_usuar_dia 
      ON rrfjorus(jorus_cod_usuar, jorus_cod_diasm) 
      WHERE jorus_ctr_activ = true;
    `);

    // Foreign Keys
    await queryRunner.createForeignKey(
      'rrfjorus',
      new TableForeignKey({
        columnNames: ['jorus_cod_usuar'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'rrfjorus',
      new TableForeignKey({
        columnNames: ['jorus_cod_diasm'],
        referencedColumnNames: ['diasm_cod_diasm'],
        referencedTableName: 'rrfdiasm',
        onDelete: 'RESTRICT',
      })
    );

    // 7. Tabla rrfhispw - Historial de contraseñas
    await queryRunner.createTable(
      new Table({
        name: 'rrfhispw',
        columns: [
          {
            name: 'hispw_cod_hispw',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'hispw_cod_usuar',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'hispw_pwd_usuar',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Hash de contraseña anterior',
          },
          {
            name: 'hispw_fec_creac',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true
    );

    // Índices para historial
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_hispw_cod_usuar ON rrfhispw(hispw_cod_usuar);
      CREATE INDEX IF NOT EXISTS idx_hispw_usuar_fec ON rrfhispw(hispw_cod_usuar, hispw_fec_creac);
    `);

    // Foreign Key
    await queryRunner.createForeignKey(
      'rrfhispw',
      new TableForeignKey({
        columnNames: ['hispw_cod_usuar'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'CASCADE',
      })
    );

    // 8. Tabla rrfaulog - Auditoría de autenticación
    await queryRunner.createTable(
      new Table({
        name: 'rrfaulog',
        columns: [
          {
            name: 'aulog_cod_aulog',
            type: 'bigserial',
            isPrimary: true,
          },
          {
            name: 'aulog_uuid_aulog',
            type: 'uuid',
            default: 'uuid_generate_v4()',
            isUnique: true,
          },
          {
            name: 'aulog_tip_event',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Tipo de evento',
          },
          {
            name: 'aulog_cat_event',
            type: 'varchar',
            length: '30',
            default: "'AUTH'",
            comment: 'Categoría de evento',
          },
          {
            name: 'aulog_cod_usuar',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'aulog_nom_usuar',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Nombre de usuario intentado',
          },
          {
            name: 'aulog_uuid_sesio',
            type: 'uuid',
            isNullable: true,
            comment: 'UUID de sesión relacionada',
          },
          {
            name: 'aulog_dir_iplog',
            type: 'inet',
            isNullable: false,
            comment: 'IP de origen',
          },
          {
            name: 'aulog_des_agent',
            type: 'text',
            isNullable: true,
            comment: 'User Agent',
          },
          {
            name: 'aulog_ctr_exito',
            type: 'boolean',
            isNullable: false,
            comment: 'Éxito/Fallo',
          },
          {
            name: 'aulog_mot_error',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Motivo de error',
          },
          {
            name: 'aulog_cod_empre',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'aulog_cod_ofici',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'aulog_dat_event',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Datos adicionales',
          },
          {
            name: 'aulog_fec_event',
            type: 'timestamp',
            default: 'NOW()',
            comment: 'Fecha/hora del evento',
          },
        ],
      }),
      true
    );

    // Índices para auditoría
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_aulog_cod_usuar ON rrfaulog(aulog_cod_usuar);
      CREATE INDEX IF NOT EXISTS idx_aulog_fec_event ON rrfaulog(aulog_fec_event);
      CREATE INDEX IF NOT EXISTS idx_aulog_tip_event ON rrfaulog(aulog_tip_event);
      CREATE INDEX IF NOT EXISTS idx_aulog_usuar_fec ON rrfaulog(aulog_cod_usuar, aulog_fec_event);
    `);

    // 9. Tabla rrfpwrst - Tokens de reset de contraseña
    await queryRunner.createTable(
      new Table({
        name: 'rrfpwrst',
        columns: [
          {
            name: 'pwrst_cod_pwrst',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'pwrst_hsh_token',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
            comment: 'Hash del token',
          },
          {
            name: 'pwrst_cod_usuar',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'pwrst_fec_expir',
            type: 'timestamp',
            isNullable: false,
            comment: 'Fecha expiración',
          },
          {
            name: 'pwrst_ctr_usado',
            type: 'boolean',
            default: false,
            comment: 'Usado',
          },
          {
            name: 'pwrst_fec_usado',
            type: 'timestamp',
            isNullable: true,
            comment: 'Fecha de uso',
          },
          {
            name: 'pwrst_dir_ipreq',
            type: 'inet',
            isNullable: false,
            comment: 'IP de solicitud',
          },
          {
            name: 'pwrst_fec_creac',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
      true
    );

    // Índices para reset tokens
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_pwrst_hsh_token ON rrfpwrst(pwrst_hsh_token);
      CREATE INDEX IF NOT EXISTS idx_pwrst_cod_usuar ON rrfpwrst(pwrst_cod_usuar);
    `);

    // Foreign Key
    await queryRunner.createForeignKey(
      'rrfpwrst',
      new TableForeignKey({
        columnNames: ['pwrst_cod_usuar'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'CASCADE',
      })
    );

    // 10. Tabla rrfhisau - Autorizaciones temporales
    await queryRunner.createTable(
      new Table({
        name: 'rrfhisau',
        columns: [
          {
            name: 'hisau_cod_hisau',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'hisau_cod_usuar',
            type: 'integer',
            isNullable: false,
            comment: 'Usuario autorizado',
          },
          {
            name: 'hisau_fec_hisau',
            type: 'date',
            isNullable: false,
            comment: 'Fecha de autorización',
          },
          {
            name: 'hisau_hor_inici',
            type: 'time',
            isNullable: false,
            comment: 'Hora inicio',
          },
          {
            name: 'hisau_num_minut',
            type: 'integer',
            isNullable: false,
            comment: 'Minutos autorizados',
          },
          {
            name: 'hisau_cod_usaut',
            type: 'integer',
            isNullable: false,
            comment: 'Usuario que autoriza',
          },
          {
            name: 'hisau_mot_autor',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Motivo de autorización',
          },
          {
            name: 'hisau_ctr_habil',
            type: 'boolean',
            default: true,
            comment: 'Habilitada',
          },
        ],
      }),
      true
    );

    // Índice compuesto para autorizaciones
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_hisau_usuar_fec ON rrfhisau(hisau_cod_usuar, hisau_fec_hisau);
    `);

    // Foreign Keys
    await queryRunner.createForeignKey(
      'rrfhisau',
      new TableForeignKey({
        columnNames: ['hisau_cod_usuar'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'rrfhisau',
      new TableForeignKey({
        columnNames: ['hisau_cod_usaut'],
        referencedColumnNames: ['usuar_cod_usuar'],
        referencedTableName: 'rrfusuar',
        onDelete: 'RESTRICT',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso (respetando dependencias)
    await queryRunner.dropTable('rrfhisau', true);
    await queryRunner.dropTable('rrfpwrst', true);
    await queryRunner.dropTable('rrfaulog', true);
    await queryRunner.dropTable('rrfhispw', true);
    await queryRunner.dropTable('rrfjorus', true);
    await queryRunner.dropTable('rrfsesio', true);
    await queryRunner.dropTable('rrfusuar', true);
    await queryRunner.dropTable('rrfperfi', true);
    await queryRunner.dropTable('rrfdiasm', true);
  }
}

