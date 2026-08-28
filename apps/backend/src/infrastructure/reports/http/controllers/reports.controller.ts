import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetWasteReportUseCase } from '../../../../application/reports/use-cases/GetWasteReportUseCase.js';
import { respondValidationError } from '../../../http/utils/responseUtils.js';

const wasteReportQuerySchema = z.object({
  startDate: z.string().min(1, 'startDate es obligatorio.'),
  endDate: z.string().min(1, 'endDate es obligatorio.'),
});

export class ReportsController {
  constructor(private readonly getWasteReportUseCase: GetWasteReportUseCase) {}

  public getWasteReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = wasteReportQuerySchema.parse(req.query);
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
}

