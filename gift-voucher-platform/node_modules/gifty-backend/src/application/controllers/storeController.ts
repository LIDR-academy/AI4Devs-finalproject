import { Request, Response } from 'express';
import { Store, IStore } from '../../domain/models/Store';
import mongoose from 'mongoose';

/**
 * Get all stores
 * @route GET /api/stores
 * @access Public
 */
export const getAllStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const stores = await Store.find();
    
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
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
 * Get store by ID
 * @route GET /api/stores/:id
 * @access Public
 */
export const getStoreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    const store = await Store.findById(id);

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: store
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
 * Create new store
 * @route POST /api/stores
 * @access Private/StoreManager
 */
export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ownerId, email, phone, address } = req.body;

    // Check if store with this email already exists
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      res.status(400).json({
        success: false,
        error: 'Store with this email already exists'
      });
      return;
    }

    // Create new store
    const store = await Store.create({
      name,
      ownerId,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      data: store
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
 * Update store
 * @route PUT /api/stores/:id
 * @access Private/StoreManager
 */
export const updateStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    // Check if store exists
    const existingStore = await Store.findById(id);
    if (!existingStore) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== existingStore.email) {
      const emailExists = await Store.findOne({ email });
      if (emailExists) {
        res.status(400).json({
          success: false,
          error: 'Email is already in use'
        });
        return;
      }
    }

    // Update store
    const updatedStore = await Store.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedStore
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
 * Delete store
 * @route DELETE /api/stores/:id
 * @access Private/Admin
 */
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format'
      });
      return;
    }

    // Check if store exists
    const store = await Store.findById(id);
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found'
      });
      return;
    }

    // Delete store
    await Store.findByIdAndDelete(id);

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