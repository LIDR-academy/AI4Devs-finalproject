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
      // Usar query directo para evitar problemas de import
      const auditLogRepository = dataSource.getRepository('audit_logs' as any);

      const log = await auditLogRepository.save(
        auditLogRepository.create({
          action: 'test',
          entityType: 'test',
          entityId: 'test-id',
          userId: null,
          ipAddress: '192.168.1.1',
        })
      );

      expect(log.userId).toBeNull();
      expect(log.id).toBeDefined();

      // Limpiar
      await auditLogRepository.delete({ id: log.id });
    });
  });
});
