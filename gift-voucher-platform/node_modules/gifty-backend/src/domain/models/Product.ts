import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true
    },
    description: { 
      type: String, 
      required: [true, 'Product description is required'],
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Indexes for optimized queries
ProductSchema.index({ storeId: 1 }); // Fetch all products of a store
ProductSchema.index({ price: 1 }); // Queries sorted by price

export const Product = mongoose.model<IProduct>('Product', ProductSchema); 