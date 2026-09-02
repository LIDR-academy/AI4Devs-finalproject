import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { GetRotationMetricsUseCase } from '../../../../application/reports/use-cases/GetRotationMetricsUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

// TK-079: valida formato ISO 8601 y orden de fechas en la frontera Zod (backend_rules.md
// §3) — antes solo se validaba string no-vacio, y una fecha invalida o un rango invertido
// caian a la excepcion generica del use case, mapeada a 500 en vez del 400 que el contrato
// OpenAPI de ambos endpoints declara.
const dateRangeQuerySchema = z
  .object({
    startDate: z.string().min(1, 'startDate es obligatorio.'),
    endDate: z.string().min(1, 'endDate es obligatorio.'),
  })
  .refine((data) => !isNaN(new Date(data.startDate).getTime()), {
    message: 'startDate debe ser una fecha ISO 8601 valida.',
    path: ['startDate'],
  })
  .refine((data) => !isNaN(new Date(data.endDate).getTime()), {
    message: 'endDate debe ser una fecha ISO 8601 valida.',
    path: ['endDate'],
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate).',
    path: ['startDate'],
  });

export class ReportsController {
  constructor(
    private readonly getWasteReportUseCase: GetWasteReportUseCase,
    private readonly getRotationMetricsUseCase: GetRotationMetricsUseCase
  ) {}

  public getWasteReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = dateRangeQuerySchema.parse(req.query);
      const result = await this.getWasteReportUseCase.execute({
        startDate: query.startDate,
        endDate: query.endDate,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public getRotationMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = dateRangeQuerySchema.parse(req.query);
      const result = await this.getRotationMetricsUseCase.execute({
        startDate: query.startDate,
        endDate: query.endDate,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };
}

