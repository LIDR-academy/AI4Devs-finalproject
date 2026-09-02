import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { GetRotationMetricsUseCase } from '../../../../application/reports/use-cases/GetRotationMetricsUseCase.js';
import { IReportRepository } from '../../../../domain/reports/repositories/IReportRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createReportsRouter(reportRepository: IReportRepository): Router {
  const router = Router();
  const getWasteReportUseCase = new GetWasteReportUseCase(reportRepository);
  const getRotationMetricsUseCase = new GetRotationMetricsUseCase(reportRepository);
  const controller = new ReportsController(getWasteReportUseCase, getRotationMetricsUseCase);

  // docs/03_persistence_and_api/07_api_specification.md declara este endpoint como "Rol requerido: ADMIN"
  router.get('/waste', requireRole('ADMIN'), controller.getWasteReport);
  router.get('/rotation-metrics', requireRole('ADMIN'), controller.getRotationMetrics);

  return router;
}
