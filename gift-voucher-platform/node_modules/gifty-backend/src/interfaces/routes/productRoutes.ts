import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByStoreId,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../application/controllers/productController';

const router = express.Router();

// GET all products
router.get('/', getAllProducts);

// GET product by ID
router.get('/:id', getProductById);

// GET products by store ID
router.get('/store/:storeId', getProductsByStoreId);

// POST create new product
router.post('/', createProduct);

// PUT update product
router.put('/:id', updateProduct);

// DELETE product
router.delete('/:id', deleteProduct);

export { router as productRoutes }; 