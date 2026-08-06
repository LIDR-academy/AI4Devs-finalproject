import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { IReportRepository } from '../../../../domain/reports/repositories/IReportRepository.js';

export function createReportsRouter(reportRepository: IReportRepository): Router {
  const router = Router();
  const getWasteReportUseCase = new GetWasteReportUseCase(reportRepository);
  const controller = new ReportsController(getWasteReportUseCase);

  router.get('/waste', controller.getWasteReport);

  return router;
}
