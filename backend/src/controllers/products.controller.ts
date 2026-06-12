import { Request, Response, NextFunction } from 'express';
import { ICatalogService } from '../services/catalog.service';

export class ProductsController {
  constructor(private catalogService: ICatalogService) {}

  getProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.catalogService.getProducts();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
