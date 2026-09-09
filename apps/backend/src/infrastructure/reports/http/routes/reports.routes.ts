import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { GetRotationMetricsUseCase } from '../../../../application/reports/use-cases/GetRotationMetricsUseCase.js';
import { GetPreparationWasteReportUseCase } from '../../../../application/reports/use-cases/GetPreparationWasteReportUseCase.js';
import { IReportRepository } from '../../../../domain/reports/repositories/IReportRepository.js';
import { ISystemSettingsRepository } from '../../../../domain/settings/repositories/ISystemSettingsRepository.js';
import { IRoleRepository } from '../../../../domain/security/repositories/IRoleRepository.js';
import { authorizePermissions } from '../../../security/http/middleware/authorizePermissions.middleware.js';

export function createReportsRouter(
  reportRepository: IReportRepository,
  roleRepository: IRoleRepository,
  settingsRepository?: ISystemSettingsRepository,
  isAuthRequired = true
): Router {
  const router = Router();
  const getWasteReportUseCase = new GetWasteReportUseCase(reportRepository);
  const getRotationMetricsUseCase = new GetRotationMetricsUseCase(reportRepository);
  const getPreparationWasteReportUseCase = settingsRepository
    ? new GetPreparationWasteReportUseCase(reportRepository, settingsRepository)
    : undefined;
  const controller = new ReportsController(getWasteReportUseCase, getRotationMetricsUseCase, getPreparationWasteReportUseCase);

  // TK-117 (US-015 Escenario 3): antes `requireRole('ADMIN')` fijo — sin cambio de
  // acceso real hoy (KITCHEN_STAFF no tiene `reports:view`, ADMIN sigue con bypass),
  // pero un rol personalizado con `reports:view` concedido ahora también accede.
  // `roleRepository` es obligatorio a propósito (a diferencia de `settingsRepository`)
  // para que ningún caller pueda dejar esta ruta sin guard por omitir un parámetro.
  const viewReports = isAuthRequired ? [authorizePermissions(roleRepository, 'reports:view')] : [];
  router.get('/waste', ...viewReports, controller.getWasteReport);
  router.get('/rotation-metrics', ...viewReports, controller.getRotationMetrics);
  if (getPreparationWasteReportUseCase) {
    // US-029 / TK-105: reporte de mermas de preparación.
    router.get('/preparation-waste', ...viewReports, controller.getPreparationWasteReport);
  }

  return router;
}
