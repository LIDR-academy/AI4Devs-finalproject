import { Request, Response } from 'express';
import { Product, IProduct } from '../../domain/models/Product';
import { Store } from '../../domain/models/Store';
import mongoose from 'mongoose';

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, sort, limit = 10, page = 1 } = req.query;
    const queryObject: any = {};
    
    // Filter by storeId if provided
    if (storeId) {
      queryObject.storeId = storeId;
    }

    // Only show active products by default
    if (!req.query.showInactive) {
      queryObject.isActive = true;
    }

    let query = Product.find(queryObject);

    // Sort products
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const products = await query;
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Get products by store ID
 * @route GET /api/products/store/:storeId
 * @access Public
 */
export const getProductsByStoreId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const { sort, limit = 10, page = 1 } = req.query;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Only show active products by default
    const queryObject: any = { storeId, isActive: true };
    if (req.query.showInactive) {
      delete queryObject.isActive;
    }

    let query = Product.find(queryObject);

    // Sort products
    if (sort) {
      const sortBy = (sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const products = await query;
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Create new product
 * @route POST /api/products
 * @access Private/StoreManager
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId, name, description, price, isActive } = req.body;

    // Validate if the storeId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Create new product
    const product = await Product.create({
      storeId,
      name,
      description,
      price,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      
      res.status(400).json({
        success: false,
        error: messages
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private/StoreManager
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, isActive } = req.body;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
      return;
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      
      res.status(400).json({
        success: false,
        error: messages
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private/StoreManager
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
      return;
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
}; 