import { Router } from 'express';
import { ICatalogService } from '../services/catalog.service';
import { ProductsController } from '../controllers/products.controller';

export function createProductsRouter(catalogService: ICatalogService): Router {
  const router = Router();
  const controller = new ProductsController(catalogService);

  router.get('/', controller.getProducts);

  return router;
}
