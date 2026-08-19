import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { IReportRepository } from '../../../../domain/reports/repositories/IReportRepository.js';
import { requireRole } from '../../../http/middlewares/requireRole.js';

export function createReportsRouter(reportRepository: IReportRepository): Router {
  const router = Router();
  const getWasteReportUseCase = new GetWasteReportUseCase(reportRepository);
  const controller = new ReportsController(getWasteReportUseCase);

  // docs/03_persistence_and_api/07_api_specification.md declara este endpoint como "Rol requerido: ADMIN"
  router.get('/waste', requireRole('ADMIN'), controller.getWasteReport);

  return router;
}
