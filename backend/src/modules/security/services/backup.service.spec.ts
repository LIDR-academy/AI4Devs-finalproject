import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { BackupService, BackupResult } from './backup.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

describe('BackupService', () => {
  let service: BackupService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        BACKUP_DIR: join(process.cwd(), 'test-backups'),
        BACKUP_MAX_COUNT: '30',
        BACKUP_RETENTION_DAYS: '30',
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_DB: 'test_db',
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_CONTAINER: 'test-postgres',
      };
      return config[key];
    }),
  };

  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
    configService = module.get<ConfigService>(ConfigService);

    // Crear directorio de backups de prueba si no existe
    const backupDir = configService.get<string>('BACKUP_DIR') || join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createBackup', () => {
    it('debería crear un backup exitosamente', async () => {
      // Mock de execAsync para simular éxito
      jest.spyOn(service as any, 'shouldUseDocker').mockResolvedValue(false);
      
      // Mock del módulo child_process
      const childProcess = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      jest.spyOn(childProcess, 'exec').mockImplementation((
        command: string,
        callback: (error: Error | null, stdout: string, stderr: string) => void
      ) => {
        // Simular creación de archivo de backup
        const backupDir = configService.get<string>('BACKUP_DIR') || join(process.cwd(), 'backups');
        const testFile = path.join(backupDir, 'test-backup.sql.gz');
        try {
          fs.writeFileSync(testFile, 'test backup content');
          callback(null, '', '');
        } catch (error: any) {
          callback(error, '', '');
        }
      });

      const result = await service.createBackup('manual');

      expect(result.success).toBe(true);
      expect(result.filePath).toBeDefined();
    }, 10000);

    it('debería manejar errores correctamente', async () => {
      jest.spyOn(service as any, 'shouldUseDocker').mockResolvedValue(false);
      
      // Mock de error en exec
      const childProcess = require('child_process');
      jest.spyOn(childProcess, 'exec').mockImplementation((
        command: string,
        callback: (error: Error | null, stdout: string, stderr: string) => void
      ) => {
        callback(new Error('pg_dump not found'), '', '');
      });

      const result = await service.createBackup('manual');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('listBackups', () => {
    it('debería listar backups disponibles', () => {
      const backups = service.listBackups();

      expect(Array.isArray(backups)).toBe(true);
    });
  });
});
