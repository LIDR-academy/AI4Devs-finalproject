import { Request, Response, NextFunction } from 'express';
import { ICatalogService } from '../services/catalog.service';
import { productFilterSchema, productIdSchema } from '../schemas/product-filter.schema';

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

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = productIdSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ error: 'ID de producto inválido' });
        return;
      }
      const product = await this.catalogService.getProductById(parsed.data.id);
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };
}
