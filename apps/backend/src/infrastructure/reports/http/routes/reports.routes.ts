import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { GetRotationMetricsUseCase } from '../../../../application/reports/use-cases/GetRotationMetricsUseCase.js';
import { GetPreparationWasteReportUseCase } from '../../../../application/reports/use-cases/GetPreparationWasteReportUseCase.js';
import { IReportRepository } from '../../../../domain/reports/repositories/IReportRepository.js';
import { ISystemSettingsRepository } from '../../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createReportsRouter(
  reportRepository: IReportRepository,
  settingsRepository?: ISystemSettingsRepository
): Router {
  const router = Router();
  const getWasteReportUseCase = new GetWasteReportUseCase(reportRepository);
  const getRotationMetricsUseCase = new GetRotationMetricsUseCase(reportRepository);
  const getPreparationWasteReportUseCase = settingsRepository
    ? new GetPreparationWasteReportUseCase(reportRepository, settingsRepository)
    : undefined;
  const controller = new ReportsController(getWasteReportUseCase, getRotationMetricsUseCase, getPreparationWasteReportUseCase);

  // docs/03_persistence_and_api/07_api_specification.md declara este endpoint como "Rol requerido: ADMIN"
  router.get('/waste', requireRole('ADMIN'), controller.getWasteReport);
  router.get('/rotation-metrics', requireRole('ADMIN'), controller.getRotationMetrics);
  if (getPreparationWasteReportUseCase) {
    // US-029 / TK-105: reporte de mermas de preparación — dato administrativo, solo ADMIN.
    router.get('/preparation-waste', requireRole('ADMIN'), controller.getPreparationWasteReport);
  }

  return router;
}
