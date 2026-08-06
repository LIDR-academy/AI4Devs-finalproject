import { Request, Response, NextFunction } from 'express';
import { GetActiveRemanentesUseCase } from '../../../../application/kitchen/use-cases/GetActiveRemanentesUseCase.js';

export class KitchenController {
  constructor(private readonly getActiveRemanentesUseCase: GetActiveRemanentesUseCase) {}

  public getActiveRemanentes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const location = req.query.location as string | undefined;
      const result = await this.getActiveRemanentesUseCase.execute(location);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
