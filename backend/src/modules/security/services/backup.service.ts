import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

export interface BackupResult {
  success: boolean;
  filePath?: string;
  error?: string;
  size?: number;
  timestamp: Date;
}

@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly maxBackups: number;
  private readonly retentionDays: number;

  constructor(
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.backupDir =
      this.configService.get<string>('BACKUP_DIR') ||
      join(process.cwd(), 'backups');
    this.maxBackups =
      parseInt(this.configService.get<string>('BACKUP_MAX_COUNT') || '30', 10) ||
      30;
    this.retentionDays =
      parseInt(
        this.configService.get<string>('BACKUP_RETENTION_DAYS') || '30',
        10,
      ) || 30;

    // Crear directorio de backups si no existe
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Directorio de backups creado: ${this.backupDir}`);
    }
  }

  onModuleInit() {
    this.logger.log(
      `Servicio de backup inicializado. Directorio: ${this.backupDir}`,
    );
  }

  /**
   * Backup diario automático a las 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dailyBackup(): Promise<BackupResult> {
    this.logger.log('Iniciando backup diario automático...');
    return this.createBackup('daily');
  }

  /**
   * Backup semanal los domingos a las 1:00 AM
   */
  @Cron('0 1 * * 0')
  async weeklyBackup(): Promise<BackupResult> {
    this.logger.log('Iniciando backup semanal...');
    return this.createBackup('weekly');
  }

  /**
   * Crear backup manual de la base de datos PostgreSQL
   */
  async createBackup(type: 'manual' | 'daily' | 'weekly' = 'manual'): Promise<BackupResult> {
    try {
      const dbHost =
        this.configService.get<string>('POSTGRES_HOST') ||
        this.configService.get<string>('DATABASE_HOST') ||
        'localhost';
      const dbPort =
        this.configService.get<string>('POSTGRES_PORT') ||
        this.configService.get<string>('DATABASE_PORT') ||
        '5432';
      const dbName =
        this.configService.get<string>('POSTGRES_DB') ||
        this.configService.get<string>('DATABASE_NAME') ||
        'sigq_db';
      const dbUser =
        this.configService.get<string>('POSTGRES_USER') ||
        this.configService.get<string>('DATABASE_USER') ||
        'sigq_user';
      const dbPassword =
        this.configService.get<string>('POSTGRES_PASSWORD') ||
        this.configService.get<string>('DATABASE_PASSWORD') ||
        '';
      const postgresContainer =
        this.configService.get<string>('POSTGRES_CONTAINER') ||
        this.configService.get<string>('DATABASE_CONTAINER') ||
        'sigq-postgres';

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${type}-${timestamp}.sql.gz`;
      const filePath = join(this.backupDir, fileName);

      // Verificar si estamos en Docker o si pg_dump está disponible
      const useDocker = await this.shouldUseDocker();

      let pgDumpCommand: string;

      if (useDocker) {
        // Usar Docker exec para ejecutar pg_dump dentro del contenedor
        // El contenedor PostgreSQL tiene pg_dump disponible
        pgDumpCommand = `docker exec ${postgresContainer} pg_dump -U ${dbUser} -d ${dbName} -F c | gzip > ${filePath}`;
      } else {
        // Usar pg_dump directamente si está disponible localmente
        pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c | gzip > ${filePath}`;
      }

      this.logger.log(`Ejecutando backup: ${fileName} (${useDocker ? 'Docker' : 'Local'})`);
      await execAsync(pgDumpCommand);

      if (!existsSync(filePath)) {
        throw new Error('El archivo de backup no se creó correctamente');
      }

      const stats = statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      this.logger.log(
        `Backup completado exitosamente: ${fileName} (${sizeInMB} MB)`,
      );

      // Limpiar backups antiguos
      await this.cleanupOldBackups();

      return {
        success: true,
        filePath,
        size: stats.size,
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Error al crear backup: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Verifica si debe usar Docker para ejecutar pg_dump
   */
  private async shouldUseDocker(): Promise<boolean> {
    try {
      // Verificar si pg_dump está disponible localmente
      await execAsync('which pg_dump');
      this.logger.debug('pg_dump encontrado localmente, usando ejecución local');
      return false; // pg_dump está disponible, no usar Docker
    } catch {
      // pg_dump no está disponible localmente, intentar usar Docker
      this.logger.debug('pg_dump no encontrado localmente, intentando usar Docker');
      try {
        // Verificar si Docker está disponible
        await execAsync('docker --version');
        
        // Verificar si el contenedor de PostgreSQL existe y está corriendo
        const postgresContainer =
          this.configService.get<string>('POSTGRES_CONTAINER') ||
          this.configService.get<string>('DATABASE_CONTAINER') ||
          'sigq-postgres';
        
        const { stdout } = await execAsync(
          `docker ps --filter name=${postgresContainer} --format "{{.Names}}"`,
        );
        
        const isRunning = stdout.trim() === postgresContainer;
        if (isRunning) {
          this.logger.debug(`Usando Docker para backup. Contenedor: ${postgresContainer}`);
        } else {
          this.logger.warn(`Contenedor ${postgresContainer} no está corriendo`);
        }
        
        return isRunning;
      } catch (dockerError: any) {
        this.logger.error(
          `Docker no disponible o contenedor no encontrado: ${dockerError.message}`,
        );
        return false;
      }
    }
  }

  /**
   * Limpiar backups antiguos según política de retención
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = readdirSync(this.backupDir)
        .filter((file) => file.startsWith('backup-') && file.endsWith('.sql.gz'))
        .map((file) => ({
          name: file,
          path: join(this.backupDir, file),
          stats: statSync(join(this.backupDir, file)),
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      // Eliminar backups más antiguos que el período de retención
      const filesToDelete = files.filter(
        (file) => now - file.stats.mtime.getTime() > retentionMs,
      );

      // Mantener solo los últimos N backups
      const filesToKeep = files.slice(0, this.maxBackups);
      const filesToDeleteByCount = files.filter(
        (file) => !filesToKeep.some((keep) => keep.name === file.name),
      );

      const allFilesToDelete = [
        ...new Set([...filesToDelete, ...filesToDeleteByCount].map((f) => f.path)),
      ];

      for (const filePath of allFilesToDelete) {
        try {
          unlinkSync(filePath);
          this.logger.log(`Backup antiguo eliminado: ${filePath}`);
        } catch (error: any) {
          this.logger.warn(`No se pudo eliminar ${filePath}: ${error.message}`);
        }
      }

      if (allFilesToDelete.length > 0) {
        this.logger.log(
          `${allFilesToDelete.length} backups antiguos eliminados`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error al limpiar backups antiguos: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Listar todos los backups disponibles
   */
  listBackups(): Array<{
    fileName: string;
    filePath: string;
    size: number;
    created: Date;
  }> {
    try {
      const files = readdirSync(this.backupDir)
        .filter((file) => file.startsWith('backup-') && file.endsWith('.sql.gz'))
        .map((file) => {
          const filePath = join(this.backupDir, file);
          const stats = statSync(filePath);
          return {
            fileName: file,
            filePath,
            size: stats.size,
            created: stats.birthtime,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return files;
    } catch (error: any) {
      this.logger.error(
        `Error al listar backups: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Restaurar base de datos desde un backup
   */
  async restoreBackup(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!existsSync(filePath)) {
        throw new Error(`Archivo de backup no encontrado: ${filePath}`);
      }

      const dbHost =
        this.configService.get<string>('POSTGRES_HOST') ||
        this.configService.get<string>('DATABASE_HOST') ||
        'localhost';
      const dbPort =
        this.configService.get<string>('POSTGRES_PORT') ||
        this.configService.get<string>('DATABASE_PORT') ||
        '5432';
      const dbName =
        this.configService.get<string>('POSTGRES_DB') ||
        this.configService.get<string>('DATABASE_NAME') ||
        'sigq_db';
      const dbUser =
        this.configService.get<string>('POSTGRES_USER') ||
        this.configService.get<string>('DATABASE_USER') ||
        'sigq_user';
      const dbPassword =
        this.configService.get<string>('POSTGRES_PASSWORD') ||
        this.configService.get<string>('DATABASE_PASSWORD') ||
        '';
      const postgresContainer =
        this.configService.get<string>('POSTGRES_CONTAINER') ||
        this.configService.get<string>('DATABASE_CONTAINER') ||
        'sigq-postgres';

      this.logger.warn(`Restaurando base de datos desde: ${filePath}`);

      const useDocker = await this.shouldUseDocker();
      let pgRestoreCommand: string;

      if (useDocker) {
        // Copiar archivo al contenedor y restaurar
        const containerBackupPath = `/tmp/${filePath.split('/').pop()}`;
        await execAsync(`docker cp ${filePath} ${postgresContainer}:${containerBackupPath}`);
        pgRestoreCommand = `docker exec ${postgresContainer} sh -c "pg_restore -U ${dbUser} -d ${dbName} -c -F c ${containerBackupPath}"`;
      } else {
        // Usar pg_restore directamente
        if (filePath.endsWith('.gz')) {
          pgRestoreCommand = `gunzip -c ${filePath} | PGPASSWORD="${dbPassword}" pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c -F c`;
        } else {
          pgRestoreCommand = `PGPASSWORD="${dbPassword}" pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c -F c ${filePath}`;
        }
      }

      await execAsync(pgRestoreCommand);

      this.logger.log('Base de datos restaurada exitosamente');
      return { success: true };
    } catch (error: any) {
      this.logger.error(
        `Error al restaurar backup: ${error.message}`,
        error.stack,
      );
      return { success: false, error: error.message };
    }
  }
}
