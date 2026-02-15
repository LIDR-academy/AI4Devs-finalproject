import { DataSource } from 'typeorm';
import { createTestDataSource, setupTestDatabase, teardownTestDatabase } from '../setup/test-db';

describe('Migrations', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    await setupTestDatabase(dataSource);
  });

  afterAll(async () => {
    await teardownTestDatabase(dataSource);
  });

  describe('Tabla USERS', () => {
    it('debe existir la tabla USERS', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'USERS'");
      expect(result.length).toBe(1);
    });

    it('debe tener todas las columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE USERS');
      const columnNames = columns.map((col: any) => col.Field);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('password');
      expect(columnNames).toContain('firstName');
      expect(columnNames).toContain('lastName');
      expect(columnNames).toContain('phone');
      expect(columnNames).toContain('role');
      expect(columnNames).toContain('emailVerified');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('debe tener índice único en email', async () => {
      const indexes = await dataSource.query('SHOW INDEXES FROM USERS WHERE Key_name = "IDX_USERS_EMAIL"');
      expect(indexes.length).toBeGreaterThan(0);
      expect(indexes[0].Non_unique).toBe(0); // Unique index
    });

    it('debe tener índice en role', async () => {
      const indexes = await dataSource.query('SHOW INDEXES FROM USERS WHERE Key_name = "IDX_USERS_ROLE"');
      expect(indexes.length).toBeGreaterThan(0);
    });

    it('debe tener constraint UNIQUE en email', async () => {
      // Crear primer usuario usando query directo
      await dataSource.query(
        `INSERT INTO USERS (id, email, password, firstName, lastName, role) 
         VALUES (UUID(), 'unique-test@example.com', 'hashed-password', 'Test', 'User', 'patient')`
      );

      // Intentar crear segundo usuario con mismo email (debe fallar)
      await expect(
        dataSource.query(
          `INSERT INTO USERS (id, email, password, firstName, lastName, role) 
           VALUES (UUID(), 'unique-test@example.com', 'hashed-password', 'Test2', 'User2', 'patient')`
        )
      ).rejects.toThrow();

      // Limpiar
      await dataSource.query(`DELETE FROM USERS WHERE email = 'unique-test@example.com'`);
    });
  });

  describe('Tabla audit_logs', () => {
    it('debe existir la tabla audit_logs', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'audit_logs'");
      expect(result.length).toBe(1);
    });

    it('debe tener todas las columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE audit_logs');
      const columnNames = columns.map((col: any) => col.Field);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('action');
      expect(columnNames).toContain('entityType');
      expect(columnNames).toContain('entityId');
      expect(columnNames).toContain('userId');
      expect(columnNames).toContain('ipAddress');
      expect(columnNames).toContain('old_values');
      expect(columnNames).toContain('new_values');
      expect(columnNames).toContain('timestamp');
    });

    it('debe tener todos los índices requeridos', async () => {
      const indexes = await dataSource.query('SHOW INDEXES FROM audit_logs');
      const indexNames = indexes.map((idx: any) => idx.Key_name);

      expect(indexNames).toContain('IDX_AUDIT_LOGS_USER_ID');
      expect(indexNames).toContain('IDX_AUDIT_LOGS_ENTITY');
      expect(indexNames).toContain('IDX_AUDIT_LOGS_TIMESTAMP');
      expect(indexNames).toContain('IDX_AUDIT_LOGS_ACTION_TIMESTAMP');
    });

    it('debe tener foreign key a USERS', async () => {
      const foreignKeys = await dataSource.query(`
        SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'audit_logs'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      expect(foreignKeys.length).toBeGreaterThan(0);
      const fk = foreignKeys.find((fk: any) => fk.REFERENCED_TABLE_NAME === 'USERS');
      expect(fk).toBeDefined();
      expect(fk.REFERENCED_COLUMN_NAME).toBe('id');
    });

    it('debe permitir userId NULL (para acciones sin usuario)', async () => {
      const auditLogRepository = dataSource.getRepository('audit_logs' as any);
      const log = await auditLogRepository.save(
        auditLogRepository.create({
          action: 'test',
          entityType: 'test',
          entityId: 'test-id',
          userId: null,
          ipAddress: '192.168.1.1',
        }),
      );
      expect(log.userId).toBeNull();
      expect(log.id).toBeDefined();
      await auditLogRepository.delete({ id: log.id });
    });
  });

  describe('Tabla SLOTS', () => {
    it('debe existir la tabla SLOTS', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'SLOTS'");
      expect(result.length).toBe(1);
    });

    it('debe tener columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE SLOTS');
      const columnNames = columns.map((col: { Field: string }) => col.Field);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('doctor_id');
      expect(columnNames).toContain('schedule_id');
      expect(columnNames).toContain('start_time');
      expect(columnNames).toContain('end_time');
      expect(columnNames).toContain('is_available');
      expect(columnNames).toContain('locked_by');
      expect(columnNames).toContain('locked_until');
    });

    it('debe tener foreign key a DOCTORS', async () => {
      const foreignKeys = await dataSource.query(`
        SELECT REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'SLOTS'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      expect(foreignKeys.some((fk: { REFERENCED_TABLE_NAME: string }) => fk.REFERENCED_TABLE_NAME === 'DOCTORS')).toBe(true);
      expect(
        foreignKeys.some(
          (fk: { REFERENCED_TABLE_NAME: string }) =>
            fk.REFERENCED_TABLE_NAME === 'DOCTOR_SCHEDULES'
        )
      ).toBe(true);
    });
  });

  describe('Tabla DOCTOR_SCHEDULES', () => {
    it('debe existir la tabla DOCTOR_SCHEDULES', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'DOCTOR_SCHEDULES'");
      expect(result.length).toBe(1);
    });

    it('debe tener columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE DOCTOR_SCHEDULES');
      const columnNames = columns.map((col: { Field: string }) => col.Field);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('doctor_id');
      expect(columnNames).toContain('dayOfWeek');
      expect(columnNames).toContain('startTime');
      expect(columnNames).toContain('endTime');
      expect(columnNames).toContain('slotDurationMinutes');
      expect(columnNames).toContain('breakDurationMinutes');
      expect(columnNames).toContain('is_active');
      expect(columnNames).toContain('deleted_at');
    });
  });

  describe('Tabla DOCTORS', () => {
    it('debe existir la tabla DOCTORS', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'DOCTORS'");
      expect(result.length).toBe(1);
    });

    it('debe tener índices de HU6 para perfil médico', async () => {
      const indexes = await dataSource.query('SHOW INDEXES FROM DOCTORS');
      const indexNames = indexes.map((idx: { Key_name: string }) => idx.Key_name);

      expect(indexNames).toContain('IDX_DOCTORS_POSTAL_VERIFICATION');
      expect(indexNames).toContain('IDX_DOCTORS_UPDATED_AT');
    });
  });

  describe('Tabla APPOINTMENTS', () => {
    it('debe existir la tabla APPOINTMENTS', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'APPOINTMENTS'");
      expect(result.length).toBe(1);
    });

    it('debe tener columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE APPOINTMENTS');
      const columnNames = columns.map((col: { Field: string }) => col.Field);
      expect(columnNames).toContain('patient_id');
      expect(columnNames).toContain('doctor_id');
      expect(columnNames).toContain('slot_id');
      expect(columnNames).toContain('appointment_date');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('reminder_sent');
    });

    it('debe tener índice único en slot_id', async () => {
      const indexes = await dataSource.query(
        "SHOW INDEXES FROM APPOINTMENTS WHERE Key_name = 'UQ_APPOINTMENTS_SLOT_ID'",
      );
      expect(indexes.length).toBeGreaterThan(0);
      expect(indexes[0].Non_unique).toBe(0);
    });
  });

  describe('Tabla APPOINTMENT_HISTORY', () => {
    it('debe existir la tabla APPOINTMENT_HISTORY', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'APPOINTMENT_HISTORY'");
      expect(result.length).toBe(1);
    });

    it('debe tener foreign key a APPOINTMENTS', async () => {
      const foreignKeys = await dataSource.query(`
        SELECT REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'APPOINTMENT_HISTORY'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      expect(foreignKeys.some((fk: { REFERENCED_TABLE_NAME: string }) => fk.REFERENCED_TABLE_NAME === 'APPOINTMENTS')).toBe(true);
    });
  });

  describe('Tabla VERIFICATION_DOCUMENTS', () => {
    it('debe existir la tabla VERIFICATION_DOCUMENTS', async () => {
      const result = await dataSource.query("SHOW TABLES LIKE 'VERIFICATION_DOCUMENTS'");
      expect(result.length).toBe(1);
    });

    it('debe tener columnas requeridas', async () => {
      const columns = await dataSource.query('DESCRIBE VERIFICATION_DOCUMENTS');
      const columnNames = columns.map((col: { Field: string }) => col.Field);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('doctor_id');
      expect(columnNames).toContain('file_path');
      expect(columnNames).toContain('original_filename');
      expect(columnNames).toContain('mime_type');
      expect(columnNames).toContain('file_size_bytes');
      expect(columnNames).toContain('document_type');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('created_at');
    });

    it('debe tener índices requeridos', async () => {
      const indexes = await dataSource.query('SHOW INDEXES FROM VERIFICATION_DOCUMENTS');
      const indexNames = indexes.map((idx: { Key_name: string }) => idx.Key_name);

      expect(indexNames).toContain('IDX_VERIF_DOCS_DOCTOR_ID');
      expect(indexNames).toContain('IDX_VERIF_DOCS_STATUS');
      expect(indexNames).toContain('IDX_VERIF_DOCS_CREATED_AT');
      expect(indexNames).toContain('IDX_VERIF_DOCS_DOCTOR_STATUS');
    });

    it('debe tener foreign key a DOCTORS', async () => {
      const foreignKeys = await dataSource.query(`
        SELECT REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'VERIFICATION_DOCUMENTS'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      expect(
        foreignKeys.some(
          (fk: { REFERENCED_TABLE_NAME: string }) =>
            fk.REFERENCED_TABLE_NAME === 'DOCTORS'
        )
      ).toBe(true);
    });
  });
});
