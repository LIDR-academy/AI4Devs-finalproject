import { Request, Response, NextFunction } from 'express';
import { ICatalogService } from '../services/catalog.service';
import { productFilterSchema } from '../schemas/product-filter.schema';

export class ProductsController {
  constructor(private catalogService: ICatalogService) {}

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = productFilterSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: 'Parámetros de filtro inválidos' });
        return;
      }
      const result = await this.catalogService.getProducts(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
