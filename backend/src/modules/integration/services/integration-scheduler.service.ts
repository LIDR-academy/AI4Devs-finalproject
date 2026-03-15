import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { IntegrationService } from '../integration.service';
import { Patient } from '../../hce/entities/patient.entity';

const INTEGRATION_LOG_PREFIX = '[Integration]';

/**
 * Sincronización automática programada: DICOM (Orthanc) y resultados de laboratorio (FHIR).
 * Ejecuta sync por paciente para un subconjunto reciente (evitar sobrecarga).
 */
@Injectable()
export class IntegrationSchedulerService {
  private readonly logger = new Logger(IntegrationSchedulerService.name);

  constructor(
    private configService: ConfigService,
    private integrationService: IntegrationService,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  /**
   * Cron: ejecutar cada día a las 2:00 AM (configurable con INTEGRATION_SYNC_CRON).
   * Sincroniza datos externos (DICOM, laboratorio) para pacientes actualizados en los últimos 7 días.
   */
  @Cron(process.env.INTEGRATION_SYNC_CRON || CronExpression.EVERY_DAY_AT_2AM)
  async handleScheduledSync(): Promise<void> {
    const enabled = this.configService.get<string>('INTEGRATION_SYNC_ENABLED') !== 'false';
    if (!enabled) {
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Scheduler] Sync automática deshabilitada (INTEGRATION_SYNC_ENABLED=false)`);
      return;
    }
    const limit = Math.min(parseInt(this.configService.get<string>('INTEGRATION_SYNC_BATCH_SIZE') || '50', 10), 200);
    const since = new Date();
    since.setDate(since.getDate() - 7);

    this.logger.log(`${INTEGRATION_LOG_PREFIX} [Scheduler] Iniciando sync automática (últimos 7 días, hasta ${limit} pacientes)`);
    try {
      const patients = await this.patientRepository.find({
        where: { updatedAt: MoreThan(since) },
        take: limit,
        select: ['id'],
      });
      let ok = 0;
      let err = 0;
      for (const p of patients) {
        try {
          await this.integrationService.syncAllExternalData(p.id);
          ok++;
        } catch (e: any) {
          err++;
          this.logger.warn(`${INTEGRATION_LOG_PREFIX} [Scheduler] Error sync paciente ${p.id}: ${e?.message}`);
        }
      }
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Scheduler] Sync finalizada: ${ok} OK, ${err} errores`);
    } catch (error: any) {
      this.logger.error(`${INTEGRATION_LOG_PREFIX} [Scheduler] Error en sync programada: ${error.message}`, error.stack);
    }
  }
}
