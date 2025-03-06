import express from 'express';
import { 
  getAllStores, 
  getStoreById, 
  createStore, 
  updateStore, 
  deleteStore 
} from '../../application/controllers/storeController';

const router = express.Router();

// GET all stores
router.get('/', getAllStores);

// GET store by ID
router.get('/:id', getStoreById);

// POST create new store
router.post('/', createStore);

// PUT update store
router.put('/:id', updateStore);

// DELETE store
router.delete('/:id', deleteStore);

export { router as storeRoutes }; 