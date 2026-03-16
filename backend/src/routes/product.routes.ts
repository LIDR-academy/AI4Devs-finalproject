import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', productController.getProducts.bind(productController));

router.get('/categories', productController.getCategories.bind(productController));

router.get('/:id', productController.getProductById.bind(productController));

router.post('/', authenticate, productController.createProduct.bind(productController));

router.put('/:id', authenticate, productController.updateProduct.bind(productController));

router.delete('/:id', authenticate, productController.deleteProduct.bind(productController));

export default router; 